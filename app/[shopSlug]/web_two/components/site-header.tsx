"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Box, Button, Menu, MenuItem, Stack } from "@mui/material";
import { FaShoppingCart } from "react-icons/fa";

interface SiteHeaderProps {
  shopInfo?: any;
  cartCount?: number;
  categories?: string[];
  activeFilter?: string;
  activeCategory?: string;
  onFilterChange?: (filter: string) => void;
  onCategoryChange?: (category: string) => void;
}

const navItems = [
  { label: "All", filter: "" },
  { label: "Sale", filter: "sale" },
  { label: "New Arrival", filter: "new" },
];

export function SiteHeader({
  shopInfo,
  cartCount = 0,
  categories = [],
  activeFilter = "",
  activeCategory = "",
  onFilterChange,
  onCategoryChange,
}: SiteHeaderProps) {
  const router = useRouter();
  const params = useParams();
  const [categoryAnchor, setCategoryAnchor] = useState<null | HTMLElement>(null);
  const shopSlug = Array.isArray(params?.shopSlug) 
    ? params.shopSlug[0] 
    : params?.shopSlug || "";
  
  const platformName = shopInfo?.platformName || "GharSaDukan";
  const shopName = shopInfo?.shopName || "Your Market";
  const tagline =
    shopInfo?.tagline || "Your trusted store for the best deals and quality products.";
  const activeCategoryLabel = activeCategory.trim().toLowerCase();

  const handleCartClick = () => {
    // Navigate to the correct cart route
    router.push(`/${shopSlug}/cart`);
  };

  const buttonStyles = (isActive = false) => ({
    color: "var(--ink)",
    border: "1px solid",
    borderColor: isActive ? "var(--accent)" : "var(--line)",
    borderRadius: "999px",
    px: 2,
    py: 1,
    fontWeight: 500,
    letterSpacing: "0.14em",
    textTransform: "uppercase" as const,
    transition: "transform 160ms ease, border-color 160ms ease, background-color 160ms ease",
    "&:hover": {
      borderColor: "var(--accent)",
      backgroundColor: "rgba(161, 40, 31, 0.06)",
      transform: "translateY(-1px)",
    },
  });

  const handleCategoryOpen = (event: any) => {
    setCategoryAnchor(event.currentTarget);
  };

  const handleCategoryClose = () => {
    setCategoryAnchor(null);
  };

  const handleCategorySelect = (category: string) => {
    handleCategoryClose();
    onCategoryChange?.(category);
  };

  return (
    <header className="reveal border-b border-[var(--line)] bg-[var(--paper)] px-4 py-4 sm:px-8">
      <div className="flex items-center justify-between border-b border-[var(--line)] pb-3" style={{padding: "0px 0px 10px 0px"}}>
        <p className="kicker text-[var(--accent)]">{platformName}</p>
        <button
          onClick={handleCartClick}
          className="inline-flex items-center gap-2 relative cursor-pointer bg-none border-none p-0 hover:text-[var(--accent)]"
          style={{
            color: "var(--accent)",
            fontSize: "14px",
            fontWeight: "600",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
          }}
        >
          <FaShoppingCart size={14} aria-hidden />
          CART
          <span
            style={{
              position: "absolute",
              top: "-8px",
              right: "-12px",
              backgroundColor: "#dc2626",
              color: "white",
              borderRadius: "50%",
              width: "20px",
              height: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: "bold",
            }}
          >
            {cartCount}
          </span>
        </button>
      </div>

      <h1 className="shop-title-ease-in mt-4 text-center text-5xl leading-none sm:text-7xl newspaper-title" style={{marginTop: "10px"}}>
        {shopName}
      </h1>
      <p
        className="mx-auto max-w-2xl text-center text-sm leading-6 text-[var(--ink-soft)]"
        style={{ margin:"auto",marginTop: "30px"}}
      >
        {tagline}
      </p>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="center"
        gap={1.5}
        sx={{ mt: 5, alignItems: "center" }}
        style={{marginBottom: "20px"}}
      >
        {navItems.map((item) => (
          <Button
            key={item.label}
            onClick={() => {
              onFilterChange?.(item.filter);
              if (!item.filter) {
                onCategoryChange?.("");
              }
            }}
            sx={buttonStyles(
              item.filter ? activeFilter === item.filter : !activeFilter && !activeCategoryLabel
            )}
          >
            {item.label}
          </Button>
        ))}
        <Box>
          <Button
            onClick={handleCategoryOpen}
            sx={buttonStyles(Boolean(activeCategoryLabel))}
          >
            Shop by Category
          </Button>
          <Menu
            anchorEl={categoryAnchor}
            open={Boolean(categoryAnchor)}
            onClose={handleCategoryClose}
            PaperProps={{
              sx: {
                border: "1px solid var(--line)",
                mt: 1,
              },
            }}
          >
            <MenuItem
              onClick={() => {
                handleCategoryClose();
                onFilterChange?.("");
                onCategoryChange?.("");
              }}
              selected={!activeFilter && !activeCategoryLabel}
              sx={{ fontWeight: 500 }}
            >
              Show All
            </MenuItem>
            {categories.length === 0 ? (
              <MenuItem disabled>No categories available</MenuItem>
            ) : (
              categories.map((category) => (
                <MenuItem
                  key={category}
                  onClick={() => handleCategorySelect(category)}
                  selected={activeCategoryLabel === category.trim().toLowerCase()}
                  sx={{ fontWeight: 500 }}
                >
                  {category}
                </MenuItem>
              ))
            )}
          </Menu>
        </Box>
      </Stack>
    </header>
  );
}
