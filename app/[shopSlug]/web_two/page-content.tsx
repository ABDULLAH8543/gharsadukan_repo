"use client";

import "./web-two.css";
import { useMemo, useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { BreakingNews } from "./components/breaking-news";
import { ProductsSection } from "./components/products-section";
import { SiteHeader } from "./components/site-header";
import { SiteFooter } from "./components/site-footer";

interface WebTwoPageContentProps {
  products: any[];
  shopInfo: any;
}

export default function WebTwoPageContent({
  products,
  shopInfo,
}: WebTwoPageContentProps) {
  const [cartCount, setCartCount] = useState(0);
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const shopSlug = Array.isArray(params?.shopSlug)
    ? params.shopSlug[0]
    : params?.shopSlug || "";
  const activeFilter = (searchParams.get("filter") || "").toLowerCase();
  const activeCategory = searchParams.get("category") || "";

  const categories = useMemo(() => {
    const uniqueCategories = new Set(
      products
        .map((product) => (product.category || "").trim())
        .filter(Boolean)
    );

    return Array.from(uniqueCategories).sort((left, right) =>
      left.localeCompare(right)
    );
  }, [products]);

  const updateShopUrl = (nextParams: Record<string, string | undefined>) => {
    const urlSearchParams = new URLSearchParams(searchParams.toString());

    Object.entries(nextParams).forEach(([key, value]) => {
      if (value) {
        urlSearchParams.set(key, value);
      } else {
        urlSearchParams.delete(key);
      }
    });

    const queryString = urlSearchParams.toString();
    router.push(queryString ? `/${shopSlug}?${queryString}` : `/${shopSlug}`);
  };

  useEffect(() => {
    // Load cart count from localStorage on mount
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartCount(storedCart.length);

    // Listen for cart updates
    const handleCartUpdate = () => {
      const updatedCart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCartCount(updatedCart.length);
    };

    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, []);

  const breakingHeadlines = [
    "New arrivals every week",
    "Premium quality guaranteed",
    "Shop with confidence",
  ];

  return (
    <div className="web-two-theme web-two-container newsprint-bg min-h-screen py-6 px-4 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl bg-[var(--paper)] shadow-[0_24px_50px_rgba(30,25,18,0.16)]" style={{margin: "auto", marginTop: "0px", padding: "20px"}}>
        <SiteHeader
          shopInfo={shopInfo}
          cartCount={cartCount}
          categories={categories}
          activeFilter={activeFilter}
          activeCategory={activeCategory}
          onFilterChange={(filter) => updateShopUrl({ filter, category: undefined })}
          onCategoryChange={(category) => updateShopUrl({ category, filter: undefined })}
        />
        <BreakingNews items={breakingHeadlines} />
        <ProductsSection
          products={products}
          onCartUpdate={setCartCount}
          activeFilter={activeFilter}
          activeCategory={activeCategory}
        />

        <section className="reveal border-b p-5 sm:p-8" style={{margin: "20px 0px", border: "none"}}>
          <p className="kicker">Today&apos;s Offers</p>
          <h3 className="mt-2 text-3xl leading-tight newspaper-title sm:text-4xl">
            Shop by category with fresh stock updated daily
          </h3>
          <p className="mt-4 max-w-3xl ">
            Discover our latest products with reliable quality and competitive
            prices.
          </p>
        </section>

        <SiteFooter shopInfo={shopInfo} />
      </div>
    </div>
  );
}
