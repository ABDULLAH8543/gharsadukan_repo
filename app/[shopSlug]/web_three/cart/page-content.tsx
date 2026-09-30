"use client";

import "../web-three.css";
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "../../../lib/fireBase";
import { normalizeShopSlug } from "../../../lib/shopSlug";

const CART_STORAGE_KEY = "web_three_cart";

type WebThreeCartItem = {
  id?: string;
  name: string;
  price: number;
  category?: string;
  image?: string;
  description?: string;
  selectedColor?: string;
  selectedSize?: string;
  quantity: number;
};

type UserInfo = {
  name: string;
  contact: string;
  email: string;
  city: string;
  address: string;
};

const emptyUserInfo: UserInfo = {
  name: "",
  contact: "",
  email: "",
  city: "",
  address: "",
};

const formatPrice = (value: unknown) => {
  const numericValue = Number(value ?? 0) || 0;
  return `PKR ${numericValue.toLocaleString("en-PK")}`;
};

export default function WebThreeCartPageContent() {
  const params = useParams();
  const router = useRouter();
  const shopSlug = Array.isArray(params?.shopSlug) ? params.shopSlug[0] : params?.shopSlug || "";
  
  const [cartItems, setCartItems] = useState<WebThreeCartItem[]>([]);
  const [removeTarget, setRemoveTarget] = useState<{ id: string; name: string } | null>(null);
  const [deliveryCharges, setDeliveryCharges] = useState(0);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [userId, setUserId] = useState("");
  const [userInfo, setUserInfo] = useState<UserInfo>(emptyUserInfo);
  const [formError, setFormError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadCart = () => {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (!savedCart) {
        setCartItems([]);
        return;
      }

      try {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          setCartItems(parsed);
        } else {
          setCartItems([]);
        }
      } catch {
        setCartItems([]);
      }
    };

    loadCart();

    const handleStorage = (event: StorageEvent) => {
      if (event.key === CART_STORAGE_KEY) {
        loadCart();
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    if (!shopSlug) {
      setDeliveryCharges(0);
      setUserId("");
      return;
    }

    let isMounted = true;

    const fetchDeliveryCharges = async () => {
      try {
        const normalizedSlug = normalizeShopSlug(shopSlug);
        const legacySlug = normalizedSlug.replace(/-/g, "_");
        const slugCandidates = new Set([
          normalizedSlug,
          legacySlug,
          String(shopSlug).trim().toLowerCase(),
        ]);

        const usersSnapshot = await getDocs(collection(db, "users"));
        let matchedCharges = 0;
        let matchedUserId = "";

        usersSnapshot.forEach((docSnap) => {
          if (matchedCharges) {
            return;
          }

          const data = docSnap.data();
          const shopInfo = data.shopInfo || {};
          const storedSlug = normalizeShopSlug(shopInfo.shopSlug || "");
          const storedNameSlug = normalizeShopSlug(shopInfo.shopName || "");

          if (slugCandidates.has(storedSlug) || slugCandidates.has(storedNameSlug)) {
            matchedCharges = Number(shopInfo.deliveryCharges ?? data.deliveryCharges ?? 0) || 0;
            matchedUserId = docSnap.id;
          }
        });

        if (isMounted) {
          setDeliveryCharges(matchedCharges);
          setUserId(matchedUserId);
        }
      } catch {
        if (isMounted) {
          setDeliveryCharges(0);
          setUserId("");
        }
      }
    };

    fetchDeliveryCharges();

    return () => {
      isMounted = false;
    };
  }, [shopSlug]);

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidContact = (contact: string) => /^03\d{9}$/.test(contact);

  const handleUserInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const itemsTotal = useMemo(
    () => cartItems.reduce((total, item) => total + (Number(item.price || 0) || 0) * item.quantity, 0),
    [cartItems],
  );

  const grandTotal = itemsTotal + deliveryCharges;

  const submitOrder = async () => {
    const { name, contact, email, city, address } = userInfo;

    if ([name, contact, email, city, address].some((value) => value.trim() === "")) {
      setErrorMessage("Please fill in all fields.");
      setFormError(true);
      return;
    }

    if (!isValidEmail(email)) {
      setErrorMessage("Please enter a valid email address.");
      setFormError(true);
      return;
    }

    if (!isValidContact(contact)) {
      setErrorMessage("Please enter a valid contact number (03XXXXXXXXX).");
      setFormError(true);
      return;
    }

    try {
      const orderItems = cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category || null,
        selectedColor: item.selectedColor || null,
        selectedSize: item.selectedSize || null,
        qty: item.quantity,
        price: Number(item.price || 0),
        image: item.image || null,
      }));

      await addDoc(collection(db, "orders"), {
        uid: userId,
        shopSlug,
        items: orderItems,
        itemsTotal,
        deliveryCharges,
        grandTotal,
        user: userInfo,
        source: "web_three",
        createdAt: serverTimestamp(),
      });

      if (userId) {
        await addDoc(collection(db, "users", userId, "soldInvoices"), {
          customerName: userInfo.name,
          contact: userInfo.contact,
          email: userInfo.email,
          city: userInfo.city,
          address: userInfo.address,
          items: orderItems,
          totalBill: grandTotal,
          totalItems: cartItems.reduce((sum, item) => sum + item.quantity, 0),
          status: "pending",
          source: "web_three",
          createdAt: new Date(),
          doneAt: null,
        });
      }

      setCartItems([]);
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([]));
      setShowCheckoutForm(false);
      setUserInfo(emptyUserInfo);
      setFormError(false);
      setErrorMessage("");
      setOrderPlaced(true);

      setTimeout(() => {
        router.push(`/${shopSlug}`);
      }, 3000);
    } catch (error) {
      console.error("Error placing order:", error);
      setErrorMessage("Error placing order. Please try again.");
      setFormError(true);
    }
  };

  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (total, item) => total + (Number(item.price || 0) || 0) * item.quantity,
        0,
      ) + deliveryCharges,
    [cartItems, deliveryCharges],
  );

  const updateCart = (updatedItems: WebThreeCartItem[]) => {
    setCartItems(updatedItems);
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updatedItems));
  };

  const changeQuantity = (itemId: string, delta: number) => {
    const updatedItems = cartItems
      .map((item) => {
        if ((item.id || item.name) !== itemId) {
          return item;
        }

        const nextQuantity = item.quantity + delta;
        if (nextQuantity <= 0) {
          return null;
        }

        return {
          ...item,
          quantity: nextQuantity,
        };
      })
      .filter((item): item is WebThreeCartItem => Boolean(item));

    updateCart(updatedItems);
  };

  const requestDeleteItem = (itemId: string, itemName: string) => {
    setRemoveTarget({ id: itemId, name: itemName });
  };

  const confirmDeleteItem = () => {
    if (!removeTarget) {
      return;
    }

    const updatedItems = cartItems.filter((item) => (item.id || item.name) !== removeTarget.id);
    updateCart(updatedItems);
    setRemoveTarget(null);
  };

  return (
    <main className="min-h-screen bg-white px-3 py-4 text-slate-950 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-6xl rounded-[2rem] border border-blue-100 bg-[linear-gradient(135deg,#ffffff_0%,#f7fbff_52%,#dbeafe_100%)] px-4 py-6 shadow-[0_28px_90px_rgba(37,99,235,0.12)] sm:px-8 sm:py-8 lg:px-12 lg:py-12" style={{margin: "auto", padding: "20px"}}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">Cart page</p>
            <div className="mt-2 flex items-center gap-3" style={{marginBottom: "20px"}}>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Your shopping bag</h1>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">{cartItems.reduce((total, item) => total + item.quantity, 0)}</span>
            </div>
          </div>

          <Link href={`/${shopSlug}`} className="inline-flex items-center justify-center rounded-full border border-blue-100 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-slate-50" style={{marginBottom: "20px", padding: "10px"}}>
            Back to shop
          </Link>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
          <div className="space-y-4">
            {cartItems.length === 0 ? (
              <article className="rounded-[1.25rem] border border-slate-200 bg-white p-6 text-center shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
                <p className="text-lg font-semibold text-slate-950" style={{margin: "5px"}}>Your cart is empty</p>
                <p className="mt-2 text-sm text-slate-600" style={{margin: "5px"}}>Add items from the shop to see them here in real time.</p>
                <Link
                  href={`/${shopSlug}`}
                  className="mt-4 inline-flex items-center justify-center rounded-full border border-blue-100 bg-slate-50 px-5 py-2.5 text-sm font-semibold text-blue-700 transition hover:border-blue-200 hover:bg-white"
                 style={{margin: "5px", padding: "10px"}}
                 >
                  Continue shopping
                </Link>
              </article>
            ) : null}

            {cartItems.map((item) => {
              const cartItemId = item.id || item.name;

              return (
              <article key={cartItemId} className="rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-[0_12px_40px_rgba(15,23,42,0.05)] sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="relative h-44 w-full shrink-0 overflow-hidden rounded-[1rem] bg-white sm:h-28 sm:w-28" style={{margin:"10px"}}>
                    <Image
                      src={item.image || "/placeholder.png"}
                      alt={item.name}
                      fill
                      className="object-contain p-2"
                      sizes="(max-width: 640px) 100vw, 112px"
                    />
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-semibold tracking-tight text-slate-950 sm:text-lg" style={{fontSize: "15px", marginLeft: "10px"}}>{item.name}</p>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {item.selectedColor ? (
                          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700" style={{padding: "10px", marginLeft: "10px"}}>
                            Colour: {item.selectedColor}
                          </span>
                        ) : null}
                        {item.selectedSize ? (
                          <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700" style={{padding: "10px", marginLeft: "5px"}}>
                            Size: {item.selectedSize}
                          </span>
                        ) : null}
                      </div>
                      </div>

                    <div className="flex w-full flex-col gap-3 sm:w-auto sm:items-end">
                      <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
                        <p className="text-lg font-semibold text-slate-950 sm:text-xl" style={{marginLeft:"10px"}}>{formatPrice((Number(item.price || 0) || 0) * item.quantity)}</p>
                        <div className="flex items-center justify-between gap-2 rounded-full border border-slate-200 bg-slate-50 p-1 sm:justify-start" style={{width: "100px", marginRight: "20px"}}>
                          <button
                            type="button"
                            onClick={() => changeQuantity(cartItemId, -1)}
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg font-semibold text-slate-700 shadow-sm transition hover:bg-blue-50 hover:text-blue-700"
                            aria-label={`Decrease quantity for ${item.name}`}
                          >
                            −
                          </button>
                          <span className="min-w-10 px-2 text-center text-sm font-semibold text-slate-950">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => changeQuantity(cartItemId, 1)}
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg font-semibold text-slate-700 shadow-sm transition hover:bg-blue-50 hover:text-blue-700"
                            aria-label={`Increase quantity for ${item.name}`}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => requestDeleteItem(cartItemId, item.name)}
                        className="inline-flex w-full items-center justify-center rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 hover:text-rose-800 sm:w-auto"
                        aria-label={`Delete ${item.name} from cart`}
                      style={{padding: "10px", width: "fit-content", margin :"10px"}}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );})}
          </div>

          <aside className="rounded-[1.75rem] border border-blue-100 bg-white p-5 shadow-[0_18px_60px_rgba(37,99,235,0.08)]" style={{padding: "20px"}}>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">Summary</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Cart totals</h2>

            <div className="mt-5 space-y-3 border-b border-slate-100 pb-5 text-sm text-slate-600">
              <div className="flex items-center justify-between" style={{margin: "5px 0px"}}>
                <span>Items</span>
                <span className="font-semibold text-slate-950">{cartItems.reduce((total, item) => total + item.quantity, 0)}</span>
              </div>
              <div className="flex items-center justify-between" style={{margin: "5px 0px"}}>
                <span>Delivery charges</span>
                <span className="font-semibold text-slate-950">
                  {deliveryCharges === 0 ? "Free" : formatPrice(deliveryCharges)}
                </span>
              </div>
              <div className="flex items-center justify-between text-base" style={{margin: "5px 0px"}}>
                <span className="font-medium text-slate-950">Subtotal</span>
                <span className="font-semibold text-blue-700">{formatPrice(subtotal)}</span>
              </div>
            </div>

            <button
              type="button"
              disabled={cartItems.length === 0}
              onClick={() => setShowCheckoutForm(true)}
              className="mt-6 w-full rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              style={{padding: "10px"}}
            >
              Proceed to checkout
            </button>
          </aside>
        </div>
      </section>

      {removeTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
          <div className="w-full max-w-md rounded-[1.25rem] bg-white p-6 shadow-[0_28px_90px_rgba(15,23,42,0.22)]" style={{padding: "20px"}}>
            <h3 className="text-xl font-semibold tracking-tight text-slate-950">Remove item?</h3>
            <p className="mt-2 text-sm text-slate-600">
              {`Do you want to remove ${removeTarget.name} from your cart?`}
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setRemoveTarget(null)}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              style={{padding: "10px"}}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteItem}
                className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
              style={{padding: "10px"}}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showCheckoutForm && !orderPlaced ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-[1.25rem] bg-white p-6 shadow-[0_28px_90px_rgba(15,23,42,0.22)]" style={{padding: "20px"}}>
            <div className="flex items-center justify-between gap-4 mb-4">
              <h3 className="text-xl font-semibold tracking-tight text-slate-950">Enter Your Details</h3>
              <button
                type="button"
                onClick={() => setShowCheckoutForm(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="mb-4 rounded-full border border-rose-200 bg-rose-50 p-3" style={{padding: "10px", margin: "10px"}}>
                <p className="text-sm font-medium text-rose-700">{errorMessage}</p>
              </div>
            )}

            <div className="space-y-3 mb-4">
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={userInfo.name}
                onChange={handleUserInfoChange}
                className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-blue-600 focus:bg-white focus:outline-none"
                style={{padding: "10px", margin: "10px"}}
              />
              <input
                type="tel"
                name="contact"
                placeholder="03XXXXXXXXX"
                value={userInfo.contact}
                onChange={handleUserInfoChange}
                className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-blue-600 focus:bg-white focus:outline-none"
                style={{padding: "10px", margin: "10px"}}
              />
              <input
                type="email"
                name="email"
                placeholder="your@email.com"
                value={userInfo.email}
                onChange={handleUserInfoChange}
                className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-blue-600 focus:bg-white focus:outline-none"
                style={{padding: "10px", margin: "10px"}}
              />
              <input
                type="text"
                name="city"
                placeholder="City"
                value={userInfo.city}
                onChange={handleUserInfoChange}
                className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-blue-600 focus:bg-white focus:outline-none"
                style={{padding: "10px", margin: "10px"}}
              />
              <textarea
                name="address"
                placeholder="Complete Address"
                value={userInfo.address}
                onChange={handleUserInfoChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-blue-600 focus:bg-white focus:outline-none"
                rows={3}
                style={{padding: "10px", margin: "10px"}}
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCheckoutForm(false)}
                className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              style={{padding: "10px"}}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitOrder}
                className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              style={{padding: "10px"}}
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {orderPlaced ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
          <div className="w-full max-w-md rounded-[1.25rem] bg-white p-8 text-center shadow-[0_28px_90px_rgba(15,23,42,0.22)]" style={{padding: "30px"}}>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <span className="text-3xl text-green-600">✓</span>
            </div>
            <h3 className="text-2xl font-semibold tracking-tight text-slate-950">Order Placed!</h3>
            <p className="mt-2 text-sm text-slate-600">
              Your order has been placed successfully. We'll contact you shortly to confirm your order details.
            </p>
            <p className="mt-3 text-xs text-slate-500">
              Redirecting to shop in a moment...
            </p>
          </div>
        </div>
      ) : null}
    </main>
  );
}
