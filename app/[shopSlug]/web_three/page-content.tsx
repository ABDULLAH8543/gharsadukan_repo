"use client";

import "./web-three.css";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { FaFacebookF, FaInstagram, FaTiktok, FaWhatsapp } from "react-icons/fa";

const navOptions = ["All", "New Arrivals", "Sale Products", "Shop by Category"];
const CART_STORAGE_KEY = "web_three_cart";

type WebThreeCartItem = {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
  selectedColor?: string;
  selectedSize?: string;
  quantity: number;
};

type Product = {
  id?: string | number;
  name?: string;
  sellingPrice?: number;
  priceAfterSale?: number;
  category?: string;
  tag?: string;
  image?: string;
  description?: string;
  colors?: string[];
  sizes?: string[];
  salePercent?: number;
  newArrival?: boolean;
};

const formatPrice = (value: unknown) => {
  const numericValue = Number(value ?? 0) || 0;
  return `PKR ${numericValue.toLocaleString("en-PK")}`;
};

const getProductCategory = (product: any) =>
  String(product?.category ?? product?.tag ?? "Uncategorized").trim() ||
  "Uncategorized";

const getSalePercent = (product: any) => Number(product?.salePercent ?? 0) || 0;

const hasSale = (product: any) =>
  getSalePercent(product) > 0 || Number(product?.priceAfterSale ?? 0) > 0;

const normalizeUrl = (url = "") => {
  const trimmed = String(url || "").trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

const normalizeWhatsappUrl = (value = "", shopName = "") => {
  const raw = String(value || "").trim();
  if (!raw) return "";

  const message = encodeURIComponent(
    `Assalam o Alaikum, I want to order from ${shopName || "your shop"}.`,
  );

  if (/^https?:\/\//i.test(raw)) {
    return raw;
  }

  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";

  const normalizedDigits = digits.startsWith("0")
    ? `92${digits.slice(1)}`
    : digits;

  return `https://wa.me/${normalizedDigits}?text=${message}`;
};

function ProductDescription({ description }: { description: string }) {
  const descriptionRef = useRef<HTMLParagraphElement | null>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    const element = descriptionRef.current;

    if (!element) {
      return undefined;
    }

    const updateOverflowState = () => {
      setIsOverflowing(element.scrollHeight > element.clientHeight + 1);
    };

    updateOverflowState();

    const resizeObserver = new ResizeObserver(updateOverflowState);
    resizeObserver.observe(element);

    return () => resizeObserver.disconnect();
  }, [description]);

  useEffect(() => {
    if (!isPopupOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsPopupOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPopupOpen]);

  return (
    <div className="relative min-h-[68px]" style={{ marginBottom: "4px" }}>
      <p
        ref={descriptionRef}
        className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600"
        style={{
          overflowWrap: "anywhere",
          wordBreak: "break-word",
          paddingRight: isOverflowing ? "92px" : "0px",
          paddingBottom: isOverflowing ? "20px" : "0px",
        }}
      >
        {description}
      </p>
      {isOverflowing ? (
        <button
          type="button"
          onClick={() => setIsPopupOpen(true)}
          className="cursor-pointer text-sm font-semibold text-blue-700 underline"
          style={{
            position: "absolute",
            right: 0,
            bottom: 0,
            background: "white",
            border: "1px solid rgb(219 234 254)",
            borderRadius: "6px",
            padding: "0 6px",
          }}
        >
          ...Read more
        </button>
      ) : null}

      {isPopupOpen ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm"
          onClick={() => setIsPopupOpen(false)}
          style={{ padding: "10px" }}
        >
          <div
            className="w-full max-w-lg rounded-[1.5rem] border border-blue-100 bg-white p-5 shadow-[0_30px_80px_rgba(15,23,42,0.25)]"
            onClick={(event) => event.stopPropagation()}
            style={{ padding: "20px" }}
          >
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">
                Description
              </p>
              <button
                type="button"
                onClick={() => setIsPopupOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
                aria-label="Close description popup"
              >
                ✕
              </button>
            </div>
            <div
              className="mt-4 max-h-96 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-4"
              style={{ padding: "10px", marginTop: "10px" }}
            >
              <p
                className="text-sm leading-7 text-slate-700"
                style={{ overflowWrap: "break-word", wordBreak: "break-word" }}
              >
                {description}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ProductDetailsModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
}: {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}) {
  if (!isOpen || !product) return null;

  const hasSale =
    Number(product?.salePercent ?? 0) > 0 ||
    Number(product?.priceAfterSale ?? 0) > 0;
  const formatPrice = (value: unknown) => {
    const numericValue = Number(value ?? 0) || 0;
    return `PKR ${numericValue.toLocaleString("en-PK")}`;
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[1.5rem] border border-blue-100 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.25)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-blue-100 bg-white px-6 py-4"
          style={{ padding: "20px" }}
        >
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
            {product.name}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
            aria-label="Close product details"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6 p-6" style={{ padding: "20px" }}>
          {product.image ? (
            <div
              className="relative aspect-square overflow-hidden rounded-lg border border-blue-100 bg-slate-50"
              style={{ height: "250px", margin: "auto" }}
            >
              <Image
                src={product.image || "/placeholder.png"}
                alt={product.name || "Product"}
                fill
                className="object-contain p-4"
                sizes="(max-width: 768px) 100vw, 600px"
              />
            </div>
          ) : null}

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">
              Category
            </p>
            <p className="mt-1 text-base text-slate-950">
              {getProductCategory(product)}
            </p>
          </div>

          {Array.isArray(product.colors) && product.colors.length > 0 ? (
            <div style={{ marginBottom: "10px" }}>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">
                Available Colours
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.colors.map((color: string) => (
                  <span
                    key={color}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
                    style={{ padding: "10px", margin: "2px" }}
                  >
                    {color}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {Array.isArray(product.sizes) && product.sizes.length > 0 ? (
            <div style={{ marginBottom: "10px" }}>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">
                Available Sizes
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.sizes.map((size: string) => (
                  <span
                    key={size}
                    className="rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700"
                    style={{ padding: "10px", margin: "2px" }}
                  >
                    {size}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="border-t border-blue-100 pt-6">
            <p
              className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600 mb-2"
              style={{ marginTop: "10px" }}
            >
              Price
            </p>
            <div className="flex items-baseline gap-3">
              {hasSale ? (
                <>
                  <span className="text-lg line-through text-slate-400">
                    {formatPrice(product.sellingPrice)}
                  </span>
                  <span className="text-2xl font-semibold text-emerald-600">
                    {formatPrice(
                      product.priceAfterSale || product.sellingPrice,
                    )}
                  </span>
                </>
              ) : (
                <span className="text-2xl font-semibold text-slate-950">
                  {formatPrice(product.sellingPrice)}
                </span>
              )}
            </div>
          </div>

          {product.description ? (
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600 mb-2">
                Description
              </p>
              <p className="text-base leading-7 text-slate-700 whitespace-pre-wrap break-words">
                {product.description}
              </p>
            </div>
          ) : null}

          <div className="border-t border-blue-100 pt-6">
            <button
              type="button"
              onClick={() => onAddToCart(product)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-blue-100 bg-white px-6 py-3 text-base font-semibold text-blue-700 transition hover:bg-blue-50"
              style={{ padding: "10px", marginTop: "10px" }}
            >
              Add to cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddToCartVariantModal({
  product,
  selectedColor,
  selectedSize,
  onSelectColor,
  onSelectSize,
  onConfirm,
  onClose,
  errorMessage,
}: {
  product: Product | null;
  selectedColor: string;
  selectedSize: string;
  onSelectColor: (value: string) => void;
  onSelectSize: (value: string) => void;
  onConfirm: () => void;
  onClose: () => void;
  errorMessage: string;
}) {
  if (!product) {
    return null;
  }

  const availableColors = Array.isArray(product.colors)
    ? product.colors.filter((color) => Boolean(String(color || "").trim()))
    : [];
  const availableSizes = Array.isArray(product.sizes)
    ? product.sizes.filter((size) => Boolean(String(size || "").trim()))
    : [];

  return (
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-[1.5rem] border border-blue-100 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.25)]"
        onClick={(event) => event.stopPropagation()}
        style={{ padding: "20px" }}
      >
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-xl font-semibold tracking-tight text-slate-950">
            Select options
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
            aria-label="Close variant selector"
          >
            ✕
          </button>
        </div>

        <p
          className="mt-2 text-sm text-slate-600"
          style={{ marginBottom: "10px" }}
        >
          {product.name || "Product"}
        </p>

        {availableColors.length > 0 ? (
          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">
              Colour
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {availableColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => onSelectColor(color)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    selectedColor === color
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-blue-300"
                  }`}
                  style={{ padding: "10px", margin: "10px 2px" }}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {availableSizes.length > 0 ? (
          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">
              Size
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {availableSizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => onSelectSize(size)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    selectedSize === size
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-blue-300"
                  }`}
                  style={{ padding: "10px", margin: "10px 2px" }}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {errorMessage ? (
          <p
            className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700"
            style={{ padding: "10px", margin: "10px" }}
          >
            {errorMessage}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex w-full items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            style={{ padding: "10px" }}
          >
            Add to cart
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex w-full items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            style={{ padding: "10px" }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function WebThreeShopFooter({ shopInfo }: { shopInfo?: any }) {
  const shopName = shopInfo?.shopName || "Your Market";
  const address = String(shopInfo?.address || "").trim();
  const shopDescription =
    shopInfo?.shopDescription ||
    "Your trusted store for the best deals and quality products.";

  const socialLinks = [
    {
      label: "Instagram",
      href: normalizeUrl(shopInfo?.instagram),
      icon: FaInstagram,
    },
    {
      label: "Facebook",
      href: normalizeUrl(shopInfo?.facebook),
      icon: FaFacebookF,
    },
    {
      label: "TikTok",
      href: normalizeUrl(shopInfo?.tiktok),
      icon: FaTiktok,
    },
    {
      label: "WhatsApp",
      href: normalizeWhatsappUrl(shopInfo?.whatsapp, shopName),
      icon: FaWhatsapp,
    },
  ].filter((item) => Boolean(item.href));

  return (
    <footer
      className="mt-10 border-t border-blue-100 px-4 py-10 sm:px-6 lg:px-8"
      style={{ padding: "10px", margin: "auto" }}
    >
      <div className="mx-auto w-full max-w-6xl rounded-[1.75rem] border border-blue-100/80 bg-white/85 p-6 shadow-[0_18px_50px_rgba(37,99,235,0.08)] backdrop-blur sm:p-8">
        <div
          className="grid gap-5 border-b border-blue-100/70 pb-6 sm:gap-6 md:grid-cols-3 md:pb-8"
          style={{ padding: "10px" }}
        >
          <div
            className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5"
            style={{ padding: "20px" }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">
              Platform
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              GharSaDukan
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {shopDescription}
            </p>
          </div>

          <div
            className="rounded-2xl border border-slate-100 bg-white p-5"
            style={{ padding: "20px" }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">
              Shop Information
            </p>
            <div className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
              <p>
                <strong className="text-slate-950">Name:</strong> {shopName}
              </p>
              <p>
                <strong className="text-slate-950">Contact:</strong>{" "}
                {shopInfo?.contact || "N/A"}
              </p>
              <p>
                <strong className="text-slate-950">City:</strong>{" "}
                {shopInfo?.city || "N/A"}
              </p>
              {address ? (
                <p className="break-words">
                  <strong className="text-slate-950">Address:</strong> {address}
                </p>
              ) : null}
            </div>
          </div>

          <div
            className="rounded-2xl border border-slate-100 bg-white p-5 text-center md:text-left"
            style={{ padding: "20px" }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600"
              style={{ marginBottom: "10px" }}
            >
              Follow Us
            </p>
            {socialLinks.length > 0 ? (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3 md:justify-start">
                {socialLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      aria-label={item.label}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-blue-100 bg-slate-50 text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-white hover:text-blue-700"
                    >
                      <Icon size={16} />
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-600">
                No social links added.
              </p>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}

interface WebThreePageContentProps {
  shopInfo?: any;
  products: any[];
}

export default function WebThreePageContent({
  shopInfo,
  products,
}: WebThreePageContentProps) {
  const params = useParams();
  const shopSlug = Array.isArray(params?.shopSlug)
    ? params.shopSlug[0]
    : params?.shopSlug || "";

  const shopName = shopInfo?.shopName || "Hunter Store";
  const typingPhrase = shopName;

  // Get initials from shop name - show first 2 words with space
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join(" ");
  };
  const shopInitials = getInitials(shopName);

  // Get first 2 words of shop name for header display
  const getTwoWords = (name: string) => {
    return name.split(" ").slice(0, 2).join(" ");
  };
  const shopTwoWords = getTwoWords(shopName);

  // Extract unique categories from products
  const categories = Array.from(
    new Set(products.map((product) => getProductCategory(product))),
  ).sort();

  const [showIntro, setShowIntro] = useState(true);
  const [introLeaving, setIntroLeaving] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [pageReady, setPageReady] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileDrawerClosing, setMobileDrawerClosing] = useState(false);
  const [mobileCategoryOpen, setMobileCategoryOpen] = useState(false);
  const [desktopCategoryOpen, setDesktopCategoryOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [variantProduct, setVariantProduct] = useState<Product | null>(null);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [variantError, setVariantError] = useState("");
  const [showAddedPopup, setShowAddedPopup] = useState(false);
  const [addedProductName, setAddedProductName] = useState("");
  const addedPopupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [cartItems, setCartItems] = useState<WebThreeCartItem[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (!savedCart) {
        return [];
      }
      const parsed = JSON.parse(savedCart);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const productToCartItem = (
    product: Product,
    color = "",
    size = "",
  ): WebThreeCartItem => {
    const productId = String(product?.id ?? product?.name ?? "product");
    const colorToken = color || "no-color";
    const sizeToken = size || "no-size";

    return {
      id: `${productId}__${colorToken}__${sizeToken}`,
      name: String(product?.name ?? "Product"),
      price: Number(product?.priceAfterSale || product?.sellingPrice || 0) || 0,
      category: getProductCategory(product),
      image: String(product?.image ?? ""),
      description: String(product?.description ?? ""),
      selectedColor: color || undefined,
      selectedSize: size || undefined,
      quantity: 1,
    };
  };

  const addToCart = (product: Product, color = "", size = "") => {
    const newItem = productToCartItem(product, color, size);
    setCartItems((currentItems) => {
      const existingIndex = currentItems.findIndex(
        (item) => item.id === newItem.id,
      );
      let updatedItems: WebThreeCartItem[];

      if (existingIndex >= 0) {
        updatedItems = currentItems.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      } else {
        updatedItems = [...currentItems, newItem];
      }

            if (addedPopupTimerRef.current) {
              clearTimeout(addedPopupTimerRef.current);
            }
            setAddedProductName(String(product?.name ?? "Product"));
            setShowAddedPopup(true);
            addedPopupTimerRef.current = setTimeout(() => {
              setShowAddedPopup(false);
            }, 2500);
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updatedItems));
      return updatedItems;
    });
  };

  const openVariantPopup = (product: Product) => {
    setVariantProduct(product);
    setSelectedColor("");
    setSelectedSize("");
    setVariantError("");
  };

  const closeVariantPopup = () => {
    setVariantProduct(null);
    setSelectedColor("");
    setSelectedSize("");
    setVariantError("");
  };

  const confirmAddToCart = () => {
    if (!variantProduct) {
      return;
    }

    const availableColors = Array.isArray(variantProduct.colors)
      ? variantProduct.colors.filter((color) =>
          Boolean(String(color || "").trim()),
        )
      : [];
    const availableSizes = Array.isArray(variantProduct.sizes)
      ? variantProduct.sizes.filter((size) =>
          Boolean(String(size || "").trim()),
        )
      : [];

    if (availableColors.length > 0 && !selectedColor) {
      setVariantError("Please select a colour.");
      return;
    }

    if (availableSizes.length > 0 && !selectedSize) {
      setVariantError("Please select a size.");
      return;
    }

    addToCart(variantProduct, selectedColor, selectedSize);
    closeVariantPopup();
  };

  const handleDetailsAddToCart = (product: Product) => {
    setSelectedProduct(null);
    openVariantPopup(product);
  };

  // Calculate cart count
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    let typingTimer: ReturnType<typeof setTimeout> | undefined;
    let exitTimer: ReturnType<typeof setTimeout> | undefined;

    if (!showIntro) {
      return undefined;
    }

    if (typedText.length < typingPhrase.length) {
      typingTimer = setTimeout(() => {
        setTypedText(typingPhrase.slice(0, typedText.length + 1));
      }, 70);
    } else {
      exitTimer = setTimeout(() => {
        setIntroLeaving(true);
        setTimeout(() => setShowIntro(false), 650);
      }, 800);
    }

    return () => {
      if (typingTimer) clearTimeout(typingTimer);
      if (exitTimer) clearTimeout(exitTimer);
    };
  }, [showIntro, typedText]);

  useEffect(() => {
    if (showIntro) {
      return undefined;
    }

    const pageTimer = setTimeout(() => {
      setPageReady(true);
    }, 40);

    return () => clearTimeout(pageTimer);
  }, [showIntro]);

  useEffect(() => {
    if (!mobileMenuOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  useEffect(() => {
    return () => {
      if (addedPopupTimerRef.current) {
        clearTimeout(addedPopupTimerRef.current);
      }
    };
  }, []);

  const filteredProducts = products.filter((product) => {
    const category = getProductCategory(product);
    const salePercent = getSalePercent(product);
    const matchesQuery =
      `${product.name} ${category} ${product.description ?? ""} ${product.colors?.join(" ") ?? ""} ${product.sizes?.join(" ") ?? ""}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    if (!matchesQuery) {
      return false;
    }

    if (selectedOption === "All") {
      return true;
    }

    if (selectedOption === "New Arrivals") {
      return Boolean(product.newArrival);
    }

    if (selectedOption === "Sale Products") {
      return salePercent > 0 || Number(product.priceAfterSale ?? 0) > 0;
    }

    // Check if selectedOption is a category
    if (categories.includes(selectedOption)) {
      return category.toLowerCase() === selectedOption.toLowerCase();
    }

    return true;
  });

  const cartButton = (
    <div className="relative">
      <Link
        href={`/${shopSlug}/web_three/cart`}
        className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-200 transition hover:bg-blue-700"
        aria-label="Cart"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 6h15l-2 8H8L6 6Z" />
          <path d="M6 6 5 3H2" />
          <circle cx="9" cy="19" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="17" cy="19" r="1.5" fill="currentColor" stroke="none" />
        </svg>
        <span className="sr-only">Cart</span>
      </Link>
      <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
        {cartCount}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen overflow-hidden bg-white text-slate-950">
      {showIntro ? (
        <section
          className={`intro-screen fixed inset-0 z-50 flex items-center justify-center px-6 ${introLeaving ? "intro-screen--exit" : ""}`}
          aria-label="Hunter Store introduction"
        >
          <div className="flex max-w-xl flex-col items-center text-center text-white">
            <div className="mb-6 flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.45em] text-white/75 sm:text-sm">
              <span className="h-px w-10 bg-white/60 sm:w-14" />
              <span
                className="rounded-full border border-white/30 bg-white/10 px-4 py-2 tracking-[0.4em]"
                style={{ padding: "5px 10px" }}
              >
                {typedText}
                <span className="intro-caret" aria-hidden="true">
                  |
                </span>
              </span>
              <span className="h-px w-10 bg-white/60 sm:w-14" />
            </div>
          </div>
        </section>
      ) : null}

      <main
        className={`page-shell relative isolate mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-4 sm:px-6 lg:px-8 ${pageReady ? "page-shell--ready" : ""}`}
        style={{ margin: "auto" }}
      >
        <header
          className="relative z-40 rounded-[1.75rem] border border-blue-100 bg-white/90 px-5 py-4 shadow-[0_18px_50px_rgba(37,99,235,0.08)] backdrop-blur sm:px-6"
          style={{ padding: "20px", margin: "20px 20px 0px 20px" }}
        >
          <div className="flex items-center justify-between gap-4 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-100 bg-slate-50 text-blue-700 shadow-sm transition hover:border-blue-200 hover:bg-white"
              aria-label="Open menu"
            >
              <span className="flex flex-col gap-1.5">
                <span className="h-0.5 w-5 rounded-full bg-current" />
                <span className="h-0.5 w-5 rounded-full bg-current" />
                <span className="h-0.5 w-5 rounded-full bg-current" />
              </span>
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-xs font-semibold text-white shadow-lg shadow-blue-200 leading-none">
                {shopInitials}
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-blue-700">
                  {shopTwoWords || shopName}
                </p>
                <h2 className="mt-1 text-sm font-semibold tracking-tight text-slate-950 sm:text-xl">
                  A choice for premium people
                </h2>
              </div>
            </div>

            {cartButton}
          </div>

          <div className="hidden flex-col gap-5 lg:flex lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-xs font-semibold text-white shadow-lg shadow-blue-200 leading-none">
                {shopInitials}
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-blue-700">
                  {shopTwoWords || shopName}
                </p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
                  A choice for premium people
                </h2>
              </div>
            </div>

            <div className="relative z-50 flex flex-1 justify-center gap-2 lg:mx-8 lg:flex-row lg:items-center">
              <nav className="flex flex-wrap gap-2">
                {navOptions.map((option) =>
                  option !== "Shop by Category" ? (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setSelectedOption(option);
                        setDesktopCategoryOpen(false);
                      }}
                      className={`cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition ${
                        selectedOption === option
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                          : "border border-blue-100 bg-slate-50 text-slate-700 hover:border-blue-200 hover:bg-white"
                      }`}
                      style={{ padding: "5px 10px" }}
                    >
                      {option}
                    </button>
                  ) : (
                    <div key={option} className="relative z-50">
                      <button
                        type="button"
                        onClick={() =>
                          setDesktopCategoryOpen(!desktopCategoryOpen)
                        }
                        className={`cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition ${
                          selectedOption === option || desktopCategoryOpen
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                            : "border border-blue-100 bg-slate-50 text-slate-700 hover:border-blue-200 hover:bg-white"
                        }`}
                        style={{ padding: "5px 10px" }}
                      >
                        {option}
                        <span className="ml-2">
                          {desktopCategoryOpen ? "−" : "+"}
                        </span>
                      </button>
                      {desktopCategoryOpen && (
                        <div
                          className="absolute left-0 top-full z-50 mt-2 rounded-2xl border border-blue-100 bg-white p-2 shadow-2xl"
                          style={{
                            backgroundColor: "white",
                            pointerEvents: "auto",
                            padding: "10px",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedOption("All");
                              setDesktopCategoryOpen(false);
                            }}
                            className="w-full cursor-pointer rounded-xl bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-blue-600 hover:text-white"
                            style={{ padding: "5px 10px" }}
                          >
                            Show All
                          </button>
                          {categories.map((cat) => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => {
                                setSelectedOption(cat);
                                setDesktopCategoryOpen(false);
                              }}
                              className={`w-full cursor-pointer rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                                selectedOption === cat
                                  ? "bg-blue-600 text-white hover:bg-blue-700 hover:text-white"
                                  : "bg-white text-slate-700 hover:bg-blue-600 hover:text-white"
                              }`}
                              style={{ padding: "5px 10px" }}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ),
                )}
              </nav>
            </div>

            {cartButton}
          </div>
        </header>

        {mobileMenuOpen ? (
          <>
            <button
              type="button"
              className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden"
              aria-label="Close menu overlay"
              onClick={() => {
                setMobileDrawerClosing(true);
                setTimeout(() => {
                  setMobileMenuOpen(false);
                  setMobileDrawerClosing(false);
                }, 300);
              }}
            />
            <aside
              className={`mobile-drawer fixed left-0 top-0 z-50 h-full w-[18rem] max-w-[85vw] border-r border-blue-100 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.2)] lg:hidden overflow-y-auto ${mobileDrawerClosing ? "mobile-drawer--exit" : ""}`}
            >
              <div
                className="flex items-center justify-between gap-3 border-b border-slate-100 pb-5 mb-5"
                style={{ padding: "30px" }}
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-600">
                    Menu
                  </p>
                  <h3 className="mt-2 text-lg font-semibold tracking-tight text-slate-950">
                    {shopName}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMobileDrawerClosing(true);
                    setTimeout(() => {
                      setMobileMenuOpen(false);
                      setMobileDrawerClosing(false);
                    }, 300);
                  }}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-blue-100 bg-slate-50 text-slate-700"
                  aria-label="Close menu"
                >
                  ✕
                </button>
              </div>

              <nav className="flex flex-col gap-3">
                {navOptions.map((option) =>
                  option !== "Shop by Category" ? (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setSelectedOption(option);
                        setMobileDrawerClosing(true);
                        setTimeout(() => {
                          setMobileMenuOpen(false);
                          setMobileDrawerClosing(false);
                        }, 300);
                        setMobileCategoryOpen(false);
                      }}
                      style={{ padding: "10px", margin: "10px" }}
                      className={`cursor-pointer rounded-2xl px-5 py-3 text-left text-sm font-semibold transition ${
                        selectedOption === option
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                          : "border border-blue-100 bg-slate-50 text-slate-700 hover:border-blue-200 hover:bg-white"
                      }`}
                    >
                      {option}
                    </button>
                  ) : (
                    <div key={option}>
                      <button
                        type="button"
                        onClick={() =>
                          setMobileCategoryOpen(!mobileCategoryOpen)
                        }
                        className={`cursor-pointer w-full rounded-2xl px-5 py-3 text-left text-sm font-semibold transition ${
                          selectedOption === option
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                            : "border border-blue-100 bg-slate-50 text-slate-700 hover:border-blue-200 hover:bg-white"
                        }`}
                        style={{
                          margin: "10px",
                          padding: "10px",
                          width: "265px",
                        }}
                      >
                        {option}
                        <span className="float-right">
                          {mobileCategoryOpen ? "−" : "+"}
                        </span>
                      </button>
                      {mobileCategoryOpen && (
                        <div
                          className="mt-2 flex flex-col gap-2 rounded-2xl border border-blue-100 bg-white p-2 pl-2 shadow-sm"
                          style={{ margin: "20px", padding: "10px" }}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedOption("All");
                              setMobileDrawerClosing(true);
                              setTimeout(() => {
                                setMobileMenuOpen(false);
                                setMobileDrawerClosing(false);
                              }, 300);
                              setMobileCategoryOpen(false);
                            }}
                            className="cursor-pointer rounded-xl px-5 py-3 text-left text-sm font-semibold bg-white text-blue-700 transition hover:bg-blue-600 hover:text-white"
                          >
                            Show All
                          </button>
                          {categories.map((cat) => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => {
                                setSelectedOption(cat);
                                setMobileDrawerClosing(true);
                                setTimeout(() => {
                                  setMobileMenuOpen(false);
                                  setMobileDrawerClosing(false);
                                }, 300);
                                setMobileCategoryOpen(false);
                              }}
                              className={`cursor-pointer rounded-xl px-5 py-3 text-left text-sm font-semibold transition ${
                                selectedOption === cat
                                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700 hover:text-white"
                                  : "bg-white text-slate-700 hover:bg-blue-600 hover:text-white"
                              }`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ),
                )}
              </nav>
            </aside>
          </>
        ) : null}

        <section
          className="relative overflow-hidden rounded-[2rem] border border-blue-100 px-6 py-8 shadow-[0_28px_90px_rgba(37,99,235,0.12)] sm:px-10 sm:py-10 lg:px-12 lg:py-12"
          style={{ margin: "15px 30px", padding: "30px", height: "250px" }}
        >
          <video
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            aria-hidden="true"
            style={{ zIndex: 0, pointerEvents: "none" }}
          >
            <source src="/bg-video.mp4" type="video/mp4" />
          </video>
          <div className="relative z-10 max-w-3xl space-y-4">
            <div
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white backdrop-blur"
              style={{ padding: "10px 20px" }}
            >
              Premium collection
            </div>
            <h1 className="text-balance text-4xl font-semibold tracking-[-0.06em] text-white sm:text-5xl lg:text-6xl">
              Curated essentials for people who choose premium.
            </h1>
          </div>
        </section>

        <section className="space-y-5">
          <div
            className="flex flex-col gap-4 rounded-[1.5rem] border border-blue-100 bg-white p-4 shadow-[0_18px_50px_rgba(37,99,235,0.07)] sm:p-5 lg:flex-row lg:items-center lg:justify-between"
            style={{ margin: "0px 30px 20px 30px", padding: "20px" }}
          >
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">
                Products
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                Shop products
              </h3>
            </div>

            <label
              className="flex w-full items-center gap-3 rounded-full border border-blue-100 bg-slate-50 px-4 py-3 shadow-sm transition focus-within:border-blue-300 focus-within:bg-white lg:max-w-md"
              style={{ padding: "10px" }}
            >
              <span className="text-sm font-semibold text-blue-600">
                Search
              </span>
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search products"
                className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </label>
          </div>

          <div
            className="flex items-end justify-between gap-4"
            style={{ margin: "30px 0px 30px 40px" }}
          >
            <p className="text-sm text-slate-500">
              {filteredProducts.length} products
            </p>
          </div>

          <div
            className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
            style={{ margin: "30px" }}
          >
            {filteredProducts.map((product, index) => (
              <article
                key={product.name}
                className="group flex h-full flex-col overflow-hidden rounded-[1.35rem] border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.05)] transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_18px_50px_rgba(37,99,235,0.12)]"
                style={{ animationDelay: `${index * 90}ms` }}
              >
                <div className="relative bg-gradient-to-br from-slate-50 via-white to-blue-50 p-3">
                  <div
                    className="relative aspect-[1/1] overflow-hidden rounded-[1.1rem] bg-white/80"
                    style={{ height: "300px", margin: "auto" }}
                  >
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-contain p-3 transition duration-300 group-hover:scale-[1.03]"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <div className="absolute right-4 top-4 flex flex-col gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white">
                    {product.newArrival ? (
                      <span
                        className="rounded-full bg-emerald-600 px-3 py-1 shadow-lg shadow-emerald-200"
                        style={{ padding: "5px 10px" }}
                      >
                        New Arrival
                      </span>
                    ) : null}
                    {hasSale(product) ? (
                      <span
                        className="rounded-full bg-rose-600 px-3 py-1 shadow-lg shadow-rose-200"
                        style={{ padding: "5px 10px", width: "fit-content" }}
                      >
                        Sale{" "}
                        {getSalePercent(product) > 0
                          ? `-${getSalePercent(product)}%`
                          : ""}
                      </span>
                    ) : null}
                  </div>
                </div>
                <div
                  className="flex flex-1 flex-col gap-3 p-4"
                  style={{ padding: "20px" }}
                >
                  <div className="space-y-1.5">
                    <h4 className="text-lg font-semibold tracking-tight text-slate-950">
                      {product.name}
                    </h4>
                    <ProductDescription
                      description={String(product.description ?? "")}
                    />
                    <span
                      className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-700"
                      style={{ padding: "10px" }}
                    >
                      {getProductCategory(product)}
                    </span>
                  </div>

                  <div
                    className="flex items-end justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-2.5"
                    style={{ padding: "10px" }}
                  >
                    <div>
                      {hasSale(product) ? (
                        <>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 line-through">
                            {formatPrice(product.sellingPrice)}
                          </p>
                          <p className="text-xl font-semibold text-slate-950">
                            {formatPrice(
                              product.priceAfterSale || product.sellingPrice,
                            )}
                          </p>
                        </>
                      ) : (
                        <p className="text-xl font-semibold text-slate-950">
                          {formatPrice(product.sellingPrice)}
                        </p>
                      )}
                    </div>
                    <span
                      className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-blue-700"
                      style={{ padding: "10px" }}
                    >
                      {hasSale(product) ? "Discounted" : "Regular"}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {Array.isArray(product.colors) &&
                    product.colors.length > 0 ? (
                      <div className="space-y-1.5">
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                          Colours
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {product.colors.map((color: string) => (
                            <span
                              key={color}
                              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                              style={{ padding: "10px", margin: "10px 5px" }}
                            >
                              {color}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {Array.isArray(product.sizes) &&
                    product.sizes.length > 0 ? (
                      <div className="space-y-1.5">
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                          Sizes
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {product.sizes.map((size: string) => (
                            <span
                              key={size}
                              className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                              style={{ padding: "10px", margin: "10px 5px" }}
                            >
                              {size}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setSelectedProduct(product)}
                      className="rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
                      style={{ padding: "10px" }}
                    >
                      Read More
                    </button>
                    <button
                      type="button"
                      onClick={() => openVariantPopup(product)}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-600 hover:text-white rounded-full border border-blue-100 bg-slate-50 px-4 py-2 cursor-pointer shadow-sm"
                      style={{ padding: "10px" }}
                    >
                      Add to cart
                      <span aria-hidden="true">→</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <WebThreeShopFooter shopInfo={shopInfo} />
      </main>

      {showAddedPopup ? (
        <div className="fixed bottom-6 right-6 z-[90] px-4">
          <div className="rounded-full border border-green-200 bg-green-50 px-5 py-3 shadow-[0_14px_40px_rgba(34,197,94,0.18)]">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">
                ✓
              </span>
              <p className="text-sm font-semibold text-green-700" style={{marginRight: "5px"}}>
                {addedProductName} added to cart
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <ProductDetailsModal
        product={selectedProduct}
        isOpen={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleDetailsAddToCart}
      />
      <AddToCartVariantModal
        product={variantProduct}
        selectedColor={selectedColor}
        selectedSize={selectedSize}
        onSelectColor={(value) => {
          setVariantError("");
          setSelectedColor(value);
        }}
        onSelectSize={(value) => {
          setVariantError("");
          setSelectedSize(value);
        }}
        onConfirm={confirmAddToCart}
        onClose={closeVariantPopup}
        errorMessage={variantError}
      />
    </div>
  );
}
