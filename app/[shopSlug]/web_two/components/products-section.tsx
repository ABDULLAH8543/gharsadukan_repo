"use client";

import { useMemo, useState, useEffect } from "react";
import type { CartItem, Product } from "../types";
import { ProductCard } from "./product-card";

type ProductsSectionProps = {
  products: Product[];
  onCartUpdate?: (count: number) => void;
  activeFilter?: string;
  activeCategory?: string;
};

export function ProductsSection({
  products,
  onCartUpdate,
  activeFilter = "",
  activeCategory = "",
}: ProductsSectionProps) {
  const [query, setQuery] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartItems(Array.isArray(storedCart) ? storedCart : []);
  }, []);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const normalizedFilter = activeFilter.trim().toLowerCase();
    const normalizedCategory = activeCategory.trim().toLowerCase();

    return products.filter((product) => {
      const salePercent = Number(product.salePercent || 0);
      const matchesFilter =
        normalizedFilter === "sale"
          ? salePercent > 0
          : normalizedFilter === "new"
            ? Boolean(product.newArrival)
            : true;
      const matchesCategory = normalizedCategory
        ? product.category.toLowerCase().trim() === normalizedCategory
        : true;
      const matchesQuery = normalizedQuery
        ? product.name.toLowerCase().includes(normalizedQuery) ||
          product.category.toLowerCase().includes(normalizedQuery) ||
          product.blurb.toLowerCase().includes(normalizedQuery)
        : true;

      return matchesFilter && matchesCategory && matchesQuery;
    });
  }, [products, query, activeFilter, activeCategory]);

  const handleAddToCart = (product: Product) => {
    const parsedPrice = Number(
      product.salePercent && Number(product.priceAfterSale || 0) > 0
        ? product.priceAfterSale
        : product.sellingPrice ?? String(product.price).replace(/[^\d.]/g, "")
    ) || 0;
    const selectedSize = String(product.size || "").trim();
    const selectedColor = String(product.color || "").trim();
    const cartId = `${product.id || product.name}-${selectedSize || "nosize"}-${selectedColor || "nocolor"}`;

    const cartItem: CartItem = {
      id: product.id || product.name,
      cartId,
      name: product.name,
      category: product.category,
      blurb: product.blurb,
      sizes: product.sizes,
      colors: product.colors,
      size: selectedSize || undefined,
      color: selectedColor || undefined,
      price: parsedPrice,
      imageUrl: product.imageUrl || "/placeholder.png",
      salePercent: product.salePercent,
      newArrival: product.newArrival,
      qty: 1,
    };

    const existingItem = cartItems.find((item) => item.cartId === cartId);
    const newCart = existingItem
      ? cartItems.map((item) =>
          item.cartId === cartId ? { ...item, qty: item.qty + 1 } : item
        )
      : [...cartItems, cartItem];
    setCartItems(newCart);
    
    // Save to localStorage
    localStorage.setItem("cart", JSON.stringify(newCart));
    
    // Notify parent and trigger custom event
    if (onCartUpdate) {
      onCartUpdate(newCart.length);
    }
    window.dispatchEvent(new Event("cartUpdated"));
  };

  return (
    <section className="reveal reveal-delay-3 border-b border-[var(--line)] px-4 py-6 sm:px-8" style={{padding: "10px 0px"}}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between" style={{padding: "0px 0px"}}>
        <h3 className="newspaper-title text-3xl">Products</h3>
        <p className="text-xs tracking-[0.14em] text-[var(--ink-soft)]">FEATURED COLLECTION</p>
      </div>

      <div className="mb-4" style={{marginBottom: "20px"}}>
        <label htmlFor="product-search" className="sr-only">
          Search products
        </label>
        <input
          id="product-search"
          type="search"
          value={query}
          style={{outline: "none", border:"none", borderBottom: "2px solid black", fontStyle: "italic", padding: "10px 0px", background: "transparent"}}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name, category, or keyword"
          className="w-full border border-[var(--line)] bg-white/70 px-4 py-3 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--accent)]"
        />
      </div>

      {filteredProducts.length === 0 ? (
        <p className="mt-6 border border-[var(--line)] bg-white/40 px-4 py-5 text-sm text-[var(--ink-soft)]">
          No products found for &quot;{query}&quot;.
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.name}
              product={product}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      )}
    </section>
  );
}
