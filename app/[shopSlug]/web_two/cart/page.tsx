"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CardMedia,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  Snackbar,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  addDoc,
  collection,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../lib/fireBase";
import { formatOneDecimal } from "../../../lib/numberFormat";
import { normalizeShopSlug } from "../../../lib/shopSlug";
import { BreakingNews } from "../components/breaking-news";
import type { CartItem } from "../types";
import "../web-two.css";

const breakingHeadlines = [
  "New arrivals every week",
  "Premium quality guaranteed",
  "Shop with confidence",
];

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

const normalizeCartItem = (
  item: Partial<CartItem> & Record<string, any>,
): CartItem => {
  const numericPrice = Number(
    item.price ?? item.sellingPrice ?? item.priceAfterSale ?? 0,
  );

  return {
    id: item.id || item.name || item.title,
    cartId:
      item.cartId ||
      `${item.id || item.name || item.title || "item"}-${Date.now()}`,
    name: item.name || item.title || "Product",
    category: item.category || "",
    blurb: item.blurb || "",
    colors: Array.isArray(item.colors)
      ? item.colors.map((color) => String(color).trim()).filter(Boolean)
      : [],
    price: Number.isFinite(numericPrice) ? numericPrice : 0,
    imageUrl: item.imageUrl || "/placeholder.png",
    qty: Number(item.qty || 1),
    salePercent: item.salePercent,
    newArrival: Boolean(item.newArrival),
  };
};

const getItemPrice = (item: CartItem) => Number(item.price || 0);

export default function CartPage() {
  const router = useRouter();
  const params = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const shopSlug = Array.isArray(params?.shopSlug)
    ? params.shopSlug[0]
    : params?.shopSlug || "";
  const shopPath = shopSlug ? `/${shopSlug}` : "/";

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [userId, setUserId] = useState("");
  const [shopDetails, setShopDetails] = useState<any>(null);
  const [deliveryCharges, setDeliveryCharges] = useState(0);
  const [loadingShop, setLoadingShop] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [formError, setFormError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [userInfo, setUserInfo] = useState<UserInfo>(emptyUserInfo);

  const platformName = shopDetails?.platformName || "GharSaDukan";
  const shopName = shopDetails?.shopName || "Your Market";
  const tagline =
    shopDetails?.shopDescription ||
    "Your trusted store for the best deals and quality products.";

  const loadCart = () => {
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const normalized = Array.isArray(storedCart)
      ? storedCart.map((item) => normalizeCartItem(item))
      : [];
    setCartItems(normalized);
  };

  useEffect(() => {
    loadCart();

    const handleCartUpdate = () => loadCart();
    window.addEventListener("cartUpdated", handleCartUpdate);
    window.addEventListener("storage", handleCartUpdate);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
      window.removeEventListener("storage", handleCartUpdate);
    };
  }, []);

  useEffect(() => {
    if (!shopSlug) {
      setLoadingShop(false);
      return;
    }

    let isMounted = true;

    const fetchShopDetails = async () => {
      try {
        const normalizedSlug = normalizeShopSlug(shopSlug);
        const legacySlug = normalizedSlug.replace(/-/g, "_");
        const slugCandidates = new Set([
          normalizedSlug,
          legacySlug,
          String(shopSlug).trim().toLowerCase(),
        ]);

        const usersSnapshot = await getDocs(collection(db, "users"));
        let matchedUserId = "";
        let matchedShopDetails: any = null;

        usersSnapshot.forEach((docSnap) => {
          if (matchedUserId) return;
          const data = docSnap.data();
          const storedSlug = normalizeShopSlug(data.shopInfo?.shopSlug || "");
          const storedNameSlug = normalizeShopSlug(
            data.shopInfo?.shopName || "",
          );

          if (
            slugCandidates.has(storedSlug) ||
            slugCandidates.has(storedNameSlug)
          ) {
            matchedUserId = docSnap.id;
            matchedShopDetails = data.shopInfo || {};
            setDeliveryCharges(
              Number(
                matchedShopDetails.deliveryCharges ?? data.deliveryCharges ?? 0,
              ),
            );
          }
        });

        if (isMounted) {
          setUserId(matchedUserId);
          setShopDetails(matchedShopDetails);
        }
      } catch (error) {
        console.error("Error fetching shop details:", error);
        if (isMounted) {
          setUserId("");
          setShopDetails(null);
        }
      } finally {
        if (isMounted) {
          setLoadingShop(false);
        }
      }
    };

    fetchShopDetails();

    return () => {
      isMounted = false;
    };
  }, [shopSlug]);

  const saveCart = (updatedCart: CartItem[]) => {
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const increaseQty = (cartId?: string) => {
    if (!cartId) return;
    saveCart(
      cartItems.map((item) =>
        item.cartId === cartId ? { ...item, qty: item.qty + 1 } : item,
      ),
    );
  };

  const decreaseQty = (cartId?: string) => {
    if (!cartId) return;
    saveCart(
      cartItems
        .map((item) =>
          item.cartId === cartId ? { ...item, qty: item.qty - 1 } : item,
        )
        .filter((item) => item.qty > 0),
    );
  };

  const deleteItem = (cartId?: string) => {
    if (!cartId) return;
    saveCart(cartItems.filter((item) => item.cartId !== cartId));
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserInfo((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidContact = (contact: string) => /^03\d{9}$/.test(contact);

  const itemsTotal = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) => sum + getItemPrice(item) * Number(item.qty || 0),
        0,
      ),
    [cartItems],
  );

  const grandTotal = itemsTotal + deliveryCharges;

  const submitOrder = async () => {
    const { name, contact, email, city, address } = userInfo;

    if (
      [name, contact, email, city, address].some((value) => value.trim() === "")
    ) {
      setErrorMessage("Please fill in all fields before placing the order.");
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
        blurb: item.blurb || null,
        colors: item.colors || [],
        qty: item.qty,
        finalPrice: getItemPrice(item),
        imageUrl: item.imageUrl || null,
        salePercent: item.salePercent ?? null,
        newArrival: Boolean(item.newArrival),
      }));

      await addDoc(collection(db, "orders"), {
        uid: userId,
        shopSlug,
        shopName,
        items: orderItems,
        itemsTotal,
        deliveryCharges,
        grandTotal,
        user: userInfo,
        source: "web_two",
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
          totalItems: orderItems.reduce((sum, item) => sum + item.qty, 0),
          status: "pending",
          source: "web_two",
          createdAt: new Date(),
          doneAt: null,
        });
      }

      saveCart([]);
      setShowForm(false);
      setUserInfo(emptyUserInfo);
      setOrderPlaced(true);

      setTimeout(() => {
        router.push(shopPath);
      }, 2000);
    } catch (error) {
      console.error("Error saving order:", error);
      setErrorMessage("Error placing order. Please try again.");
      setFormError(true);
    }
  };

  if (loadingShop) {
    return (
      <main className="web-two-theme newsprint-bg flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 lg:px-10">
        <CircularProgress />
      </main>
    );
  }

  return (
    <main className="web-two-theme newsprint-bg min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div
        className="mx-auto max-w-6xl border border-[var(--line)] bg-[var(--paper)] shadow-[0_24px_50px_rgba(30,25,18,0.16)]"
        style={{ margin: "auto" }}
      >
        <header className="reveal border-b border-[var(--line)] px-5 py-4 sm:px-8">
          <div
            className="flex items-center justify-between border-b border-[var(--line)] pb-3"
            style={{ margin: "10px", padding: "10px 0px" }}
          >
            <p className="kicker text-[var(--accent)]">{platformName}</p>
            <Link
              href={shopPath}
              className="text-xs font-semibold tracking-[0.12em] text-[var(--accent)] hover:underline"
            >
              CONTINUE SHOPPING
            </Link>
          </div>

          <h1 className="mt-4 text-center text-5xl leading-none sm:text-7xl newspaper-title">
            Your Cart
          </h1>
          <p
            className="mx-auto max-w-2xl text-center text-sm leading-6 text-[var(--ink-soft)]"
            style={{ margin: "auto" }}
          >
            {tagline}
          </p>
        </header>

        <section
          className="grid gap-0 lg:grid-cols-12"
          style={{ margin: "20px 0px", padding: "20px" }}
        >
          <article className="reveal border-b border-[var(--line)] p-5 sm:p-8 lg:col-span-8 lg:border-b-0 lg:border-r">
            <p className="kicker">Shopping Desk</p>
            <h2 className="mt-2 text-3xl newspaper-title sm:text-5xl">
              Your Cart
            </h2>
            <p className="mt-4 text-sm leading-6 text-[var(--ink-soft)]">
              Review selected items before checkout.
            </p>

            {cartItems.length === 0 ? (
              <div className="mt-6 border border-[var(--line)] bg-white/40 p-4 text-sm text-[var(--ink-soft)]">
                Your cart is empty.
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {cartItems.map((item) => {
                  const price = getItemPrice(item);

                  return (
                    <div
                      style={{ padding: "10px" }}
                      key={item.cartId || item.id || item.name}
                      className="grid gap-3 border border-[var(--line)] bg-white/40 p-4 sm:grid-cols-[92px_1fr_auto] sm:items-center"
                    >
                      <div className="relative h-24 w-24 overflow-hidden border border-[var(--line)] bg-[var(--paper-strong)]">
                        <CardMedia
                          component="img"
                          image={item.imageUrl || "/placeholder.png"}
                          alt={item.name}
                          sx={{ height: "100%", objectFit: "cover" }}
                        />
                      </div>

                      <div>
                        <p className="font-semibold text-[var(--ink)]">
                          {item.name}
                        </p>
                        {item.category ? (
                          <p className="mt-1 text-xs tracking-[0.12em] text-[var(--ink-soft)]">
                            {item.category.toUpperCase()}
                          </p>
                        ) : null}
                        {item.colors && item.colors.length > 0 ? (
                          <p className="mt-2 text-sm text-[var(--ink-soft)]">
                            Colors: {item.colors.join(", ")}
                          </p>
                        ) : null}
                        <p className="mt-2 text-sm text-[var(--ink-soft)]">
                          {formatOneDecimal(price)} each
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center border border-[var(--line)]">
                          <button
                            style={{ padding: "0px 5px" }}
                            onClick={() => decreaseQty(item.cartId)}
                            className="px-3 py-1 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--paper-strong)]"
                            aria-label={`Decrease quantity for ${item.name}`}
                          >
                            -
                          </button>
                          <span className="min-w-10 border-x border-[var(--line)] px-3 py-1 text-center text-sm">
                            {item.qty}
                          </span>
                          <button
                            style={{ padding: "0px 5px" }}
                            onClick={() => increaseQty(item.cartId)}
                            className="px-3 py-1 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--paper-strong)]"
                            aria-label={`Increase quantity for ${item.name}`}
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => deleteItem(item.cartId)}
                          className="inline-flex items-center gap-1 text-xs font-semibold tracking-[0.12em] text-[var(--accent)] hover:underline"
                        >
                          <DeleteIcon sx={{ fontSize: 16 }} />
                          DELETE PRODUCT
                        </button>

                        <p className="font-bold text-[var(--ink)]">
                          {formatOneDecimal(price * item.qty)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </article>

          <aside
            className="reveal reveal-delay-1 p-5 sm:p-8 lg:col-span-4"
            style={{ padding: "20px" }}
          >
            <h3
              style={{ marginBottom: "10px" }}
              className="newspaper-title text-2xl"
            >
              Order Summary
            </h3>
            <div className="mt-4 space-y-3 text-sm">
              <div
                style={{ marginTop: "10px" }}
                className="flex items-center justify-between border-b border-[var(--line)] pb-2"
              >
                <span className="text-[var(--ink-soft)]">Subtotal</span>
                <span className="font-semibold">
                  {formatOneDecimal(itemsTotal)}
                </span>
              </div>
              <div
                style={{ marginTop: "10px" }}
                className="flex items-center justify-between border-b border-[var(--line)] pb-2"
              >
                <span className="text-[var(--ink-soft)]">Delivery Charges</span>
                <span className="font-semibold">
                  {deliveryCharges === 0
                    ? "FREE"
                    : formatOneDecimal(deliveryCharges)}
                </span>
              </div>
              <div
                style={{ marginTop: "10px" }}
                className="flex items-center justify-between pt-1 text-base"
              >
                <span className="font-semibold">Grand Total</span>
                <span className="font-bold">
                  {formatOneDecimal(grandTotal)}
                </span>
              </div>
            </div>

            <Button
              onClick={() => setShowForm(true)}
              disabled={cartItems.length === 0}
              fullWidth
              variant="outlined"
              sx={{
                mt: 6,
                borderColor: "var(--ink)",
                color: "var(--ink)",
                fontWeight: 700,
                letterSpacing: "0.1em",
                py: 1.5,
                "&:hover": {
                  borderColor: "var(--ink)",
                  backgroundColor: "var(--ink)",
                  color: "var(--paper)",
                },
              }}
            >
              PROCEED TO CHECKOUT
            </Button>
          </aside>
        </section>
      </div>

      <Dialog
        open={showForm}
        onClose={() => setShowForm(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            border: "1px solid var(--line)",
            background: "#ffe4b9c7",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontFamily: "var(--font-libre-baskerville), serif",
            fontWeight: 700,
          }}
        >
          Enter Your Details
          <IconButton
            aria-label="close"
            onClick={() => setShowForm(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ background: "#ffe4b9c7" }}>
          <Box sx={{ display: "grid", gap: 1.5, pt: 1 }}>
            <TextField
              label="Name"
              name="name"
              value={userInfo.name}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              label="Contact"
              name="contact"
              value={userInfo.contact}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={userInfo.email}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              label="City"
              name="city"
              value={userInfo.city}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              label="Address"
              name="address"
              value={userInfo.address}
              onChange={handleChange}
              fullWidth
              multiline
              minRows={3}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, background: "#ffe4b9c7" }}>
          <Button onClick={() => setShowForm(false)}>Cancel</Button>
          <Button variant="contained" onClick={submitOrder}>
            Submit & Place Order
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={orderPlaced}
        autoHideDuration={2000}
        onClose={() => setOrderPlaced(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setOrderPlaced(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          Your order has been placed successfully!
        </Alert>
      </Snackbar>

      <Snackbar
        open={formError}
        autoHideDuration={3000}
        onClose={() => setFormError(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setFormError(false)}
          severity="error"
          sx={{ width: "100%" }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </main>
  );
}
