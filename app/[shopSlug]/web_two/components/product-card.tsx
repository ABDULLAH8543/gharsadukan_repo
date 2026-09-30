"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Box, Button, Chip, Dialog, DialogContent, DialogTitle, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type { Product } from "../types";

type ProductCardProps = {
  product: Product;
  onAddToCart?: (product: Product) => void;
};

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [open, setOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectionError, setSelectionError] = useState("");
  const [isDescriptionOverflowing, setIsDescriptionOverflowing] = useState(false);
  const [showAddedPopup, setShowAddedPopup] = useState(false);
  const descriptionRef = useRef<HTMLParagraphElement | null>(null);

  const handleAddToCart = (override?: { size?: string; color?: string }) => {
    if (onAddToCart) {
      onAddToCart({
        ...product,
        price: product.price,
        size: override?.size,
        color: override?.color,
      });
      setShowAddedPopup(true);
      setTimeout(() => setShowAddedPopup(false), 2500);
    }
  };

  const handleOpenOptions = () => {
    setSelectionError("");
    setSelectedSize("");
    setSelectedColor("");
    setOptionsOpen(true);
  };

  const handleConfirmAddToCart = () => {
    if (sizes.length > 0 && !selectedSize) {
      setSelectionError("Please select a size");
      return;
    }

    if (colors.length > 0 && !selectedColor) {
      setSelectionError("Please select a colour");
      return;
    }

    handleAddToCart({ size: selectedSize, color: selectedColor });
    setSelectionError("");
    setOptionsOpen(false);
  };

  const salePercent = Number(product.salePercent || 0);
  const hasSale = salePercent > 0;
  const basePrice = Number(product.sellingPrice || String(product.price).replace(/[^\d.]/g, "")) || 0;
  const discountedPrice = Number(product.priceAfterSale || 0) ||
    (hasSale ? Number((basePrice * (1 - salePercent / 100)).toFixed(2)) : 0);
  const sizes = product.sizes || [];
  const colors = product.colors || [];
  const description = String(product.blurb || "").trim();
  const formatPkr = (value: number) => `PKR ${value.toLocaleString("en-PK")}`;

  useEffect(() => {
    const updateOverflowState = () => {
      const el = descriptionRef.current;
      if (!el) return;
      setIsDescriptionOverflowing(el.scrollHeight > el.clientHeight + 1);
    };

    updateOverflowState();
    window.addEventListener("resize", updateOverflowState);

    return () => {
      window.removeEventListener("resize", updateOverflowState);
    };
  }, [description]);

  return (
    <>
      <article className="news-card relative flex flex-col overflow-hidden p-0" style={{height: "fit-content"}}>
      <div className="relative aspect-[4/3] overflow-hidden border-b border-[var(--line)] bg-[var(--paper-strong)]">
        <Image
          src={product.imageUrl || "/placeholder.png"}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-contain p-4"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {product.newArrival ? (
            <span style={{padding: "5px"}} className="rounded-full bg-[var(--accent)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--paper)]">
              New Arrival
            </span>
          ) : null}
          {hasSale ? (
            <span style={{padding: "5px"}} className="rounded-full bg-emerald-600 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white">
              {salePercent}% Off
            </span>
          ) : null}
        </div>
      </div>

      <div className="space-y-5 p-5 sm:p-6" style={{padding: "20px"}}>
        <div>
          <p className="kicker">{product.category}</p>
          <h4 className="mt-2 text-2xl leading-tight newspaper-title sm:text-[1.75rem]">
            {product.name}
          </h4>
          
        </div>

        {sizes.length > 0 ? (
          <div
            style={{ width: "100%", overflow: "hidden" }}
          >
            <p className="text-xs font-semibold tracking-[0.12em] text-[var(--ink-soft)] uppercase">
              Sizes
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {sizes.map((size) => (
                <span
                 style={{padding: "5px",backgroundColor: 'white', maxWidth: "100%", overflowWrap: "anywhere", wordBreak: "break-word"}}
                  key={size}
                  className="rounded-full border border-[var(--line)] bg-[var(--paper)] px-3 py-1 text-xs font-medium text-[var(--ink)]"
                  title={size}
                >
                  {size}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {colors.length > 0 ? (
          <div>
            <p className="text-xs font-semibold tracking-[0.12em] text-[var(--ink-soft)] uppercase">
              Colours
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {colors.map((color) => (
                <span
                style={{padding: "5px"}}
                  key={color}
                  className="rounded-full border border-[var(--line)] bg-white px-3 py-1 text-xs font-medium text-[var(--ink)]"
                >
                  {color}
                </span>
              ))}
            </div>
          </div>
        ) : null}
        <div style={{ position: "relative", minHeight: "68px", marginBottom: "4px" }}>
          <p
            ref={descriptionRef}
            className="mt-1 text-sm leading-6 text-[var(--ink-soft)]"
            style={{
              overflowWrap: "anywhere",
              wordBreak: "break-word",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              paddingRight: isDescriptionOverflowing ? "92px" : "0px",
              paddingBottom: isDescriptionOverflowing ? "20px" : "0px",
            }}
          >
            {description}
          </p>
          {isDescriptionOverflowing ? (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="text-sm font-semibold text-[var(--accent)] underline cursor-pointer"
              style={{
                position: "absolute",
                right: 0,
                bottom: 0,
                background: "var(--paper-strong)",
                border: "1px solid var(--line)",
                borderRadius: "6px",
                padding: "0 6px",
              }}
            >
              ...Read more
            </button>
          ) : null}
        </div>

        <div className="flex flex-col gap-4 border-t border-[var(--line)] pt-4 sm:flex-row sm:items-end sm:justify-between">
          <div style={{marginTop: "10px"}}>
            <p className="text-xs font-semibold tracking-[0.12em] text-[var(--ink-soft)] uppercase">
              Price
            </p>
            <div className="mt-1 flex flex-wrap items-baseline gap-2">
              <span className={`text-xl font-bold text-[var(--ink)] ${hasSale ? "line-through decoration-[var(--ink-soft)] decoration-1 opacity-70" : ""}`}>
                {formatPkr(basePrice)}
              </span>
              {hasSale ? (
                <span className="text-sm font-bold text-emerald-700">{formatPkr(discountedPrice)}</span>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <button
            style={{padding: "5px 10px"}}
              onClick={() => setOpen(true)}
              className="rounded-full border border-[var(--line)] px-4 py-2 text-xs font-semibold tracking-[0.12em] text-[var(--ink-soft)] transition hover:bg-[var(--paper-strong)] cursor-pointer"
            >
              READ MORE
            </button>
            <button
            style={{padding: "5px 10px"}}
              onClick={handleOpenOptions}
              className="rounded-full border border-[var(--ink)] px-4 py-2 text-xs font-semibold tracking-[0.12em] text-[var(--ink)] transition hover:bg-[var(--ink)] hover:text-[var(--paper)] cursor-pointer"
            >
              ADD TO CART
            </button>
          </div>
        </div>
      </div>
        {showAddedPopup && (
          <div className="pointer-events-none absolute right-3 top-3 z-40">
            <div className="rounded-full border border-green-200 bg-green-50 px-5 py-3 shadow-[0_10px_30px_rgba(34,197,94,0.15)]" style={{padding: "12px 18px"}}>
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 font-semibold text-green-600">✓</span>
                <p className="text-sm font-medium text-green-700" style={{marginRight: "5px"}}>
                  {product.name} added to cart
                </p>
              </div>
            </div>
          </div>
        )}
      </article>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            border: "1px solid var(--line)",
            backgroundColor:
              "#ffe4b9c7",
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle sx={{ fontFamily: "var(--font-libre-baskerville), serif", fontWeight: 700 }}>
          {product.name}
          <IconButton
            aria-label="close"
            onClick={() => setOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent
          dividers
          sx={{
            background:
              "linear-gradient(10deg, var(--paper) 0%, var(--paper-strong) 100%)",
          }}
        >
          <Box
            component="img"
            src={product.imageUrl || "/placeholder.png"}
            alt={product.name}
            sx={{
              width: "100%",
              maxHeight: 320,
              objectFit: "contain",
              border: "1px solid var(--line)",
              background: "var(--paper-strong)",
              p: 1.5,
              mb: 2,
            }}
          />

          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Category:</strong> {product.category}
          </Typography>

          {sizes.length > 0 ? (
            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                Available Sizes
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {sizes.map((size) => (
                  <Chip
                    key={size}
                    label={size}
                    size="small"
                    sx={{
                      border: "1px solid var(--line)",
                      backgroundColor: "#fff",
                    }}
                  />
                ))}
              </Box>
            </Box>
          ) : null}

          {colors.length > 0 ? (
            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                Available Colours
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {colors.map((color) => (
                  <Chip
                    key={color}
                    label={color}
                    size="small"
                    sx={{
                      border: "1px solid var(--line)",
                      backgroundColor: "#fff",
                    }}
                  />
                ))}
              </Box>
            </Box>
          ) : null}

          <Typography variant="body1" sx={{ mb: 1.5 }}>
            <strong>Price:</strong>{" "}
            {hasSale ? (
              <>
                <span
                  style={{
                    textDecoration: "line-through",
                    color: "#6b7280",
                    marginRight: "8px",
                  }}
                >
                  {formatPkr(basePrice)}
                </span>
                <span style={{ color: "#047857", fontWeight: 700 }}>
                  {formatPkr(discountedPrice)}
                </span>
              </>
            ) : (
              formatPkr(basePrice)
            )}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              color: "var(--ink-soft)",
              lineHeight: 1.8,
            }}
          >
            {description}
          </Typography>

          <Button
            variant="contained"
            fullWidth
            style={{border: "2px solid black"}}
            onClick={() => {
              setOpen(false);
              handleOpenOptions();
            }}
            sx={{
              mt: 2.5,
              bgcolor: "var(--accent)",
              color: "var(--paper)",
              "&:hover": {
                bgcolor: "#7f1d17",
              },
            }}
          >
            Add To Cart
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog
        open={optionsOpen}
        onClose={() => setOptionsOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            border: "1px solid var(--line)",
            background:
              "linear-gradient(10deg, var(--paper) 0%, var(--paper-strong) 100%)",
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle style={{backgroundColor:"#ffe4b9c7"}} sx={{ fontFamily: "var(--font-libre-baskerville), serif", fontWeight: 700 }}>
          Select Options
          <IconButton
            aria-label="close"
            onClick={() => setOptionsOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent
        style={{backgroundColor: "#ffe4b9c7"}}
          dividers
          sx={{
            background:
              "linear-gradient(10deg, var(--paper) 0%, var(--paper-strong) 100%)",
          }}
        >
          {sizes.length > 0 ? (
            <Box sx={{ mt: 1, mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                Select Size
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {sizes.map((size) => (
                  <Chip
                    key={size}
                    label={size}
                    clickable
                    onClick={() => setSelectedSize(size)}
                    sx={{
                      border: "1px solid var(--line)",
                      backgroundColor:
                        selectedSize === size ? "var(--accent)" : "#fff",
                      color: selectedSize === size ? "var(--paper)" : "var(--ink)",
                    }}
                  />
                ))}
              </Box>
            </Box>
          ) : null}

          {colors.length > 0 ? (
            <Box sx={{ mt: 1, mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                Select Colour
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {colors.map((color) => (
                  <Chip
                    key={color}
                    label={color}
                    clickable
                    onClick={() => setSelectedColor(color)}
                    sx={{
                      border: "1px solid var(--line)",
                      backgroundColor:
                        selectedColor === color ? "var(--accent)" : "#fff",
                      color: selectedColor === color ? "var(--paper)" : "var(--ink)",
                    }}
                  />
                ))}
              </Box>
            </Box>
          ) : null}

          {selectionError ? (
            <Typography sx={{ color: "#b91c1c", fontWeight: 600, mt: 1 }}>
              {selectionError}
            </Typography>
          ) : null}

          <Button
            variant="contained"
            fullWidth
            onClick={handleConfirmAddToCart}
            style={{border: "2px solid black"}}
            sx={{
              mt: 2.5,
              bgcolor: "var(--accent)",
              color: "var(--paper)",
              "&:hover": {
                bgcolor: "#7f1d17",
              },
            }}
          >
            Confirm Add To Cart
          </Button>
        </DialogContent>
      </Dialog>

    </>
  );
}
