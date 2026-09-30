"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";

import { Typewriter } from "react-simple-typewriter";
import { db, storage } from "../../lib/fireBase";
import { formatOneDecimal } from "../../lib/numberFormat";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import "./mainPage.css";

const normalizeShopSlug = (value = "") => {
  return value.trim().replace(/\s+/g, "_").toLowerCase();
};

const toShopSlug = (value = "") => {
  return value.trim().replace(/\s+/g, "_").toLowerCase();
};

function MainPage({
  searchQuery,
  userId,
  shopSlug,
  activeFilter = "",
  activeCategory = "",
}) {
  const router = useRouter();

  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [shopDetails, setShopDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [showAddedPopup, setShowAddedPopup] = useState(false);
  const [addedProductName, setAddedProductName] = useState("");

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartItems(storedCart);
  }, []);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    const fetchData = async () => {
      try {
        const snap = await getDocs(collection(db, "users", userId, "products"));
        const productData = await Promise.all(
          snap.docs.map(async (d) => {
            const data = d.data();
            let imageUrl = data.imageUrl || "";
            if (data.imagePath) {
              try {
                imageUrl = await getDownloadURL(ref(storage, data.imagePath));
              } catch (e) {
                console.error("Image fetch error:", e);
              }
            }
            return { id: d.id, ...data, imageUrl };
          })
        );
        setProducts(productData);

        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) setShopDetails(userDoc.data().shopInfo || {});
      } catch (err) {
        console.error("Firestore fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  const toggleSize = (size) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (color) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const addToCart = (product) => {
    if (product.sizes?.length && selectedSizes.length === 0) {
      alert("Please select at least one size");
      return;
    }

    if (product.colors?.length && selectedColors.length === 0) {
      alert("Please select at least one colour");
      return;
    }

    let updatedCart = [...cartItems];
    const selectedSizesToUse = product.sizes?.length
      ? selectedSizes
      : [undefined];
    const selectedColorsToUse = product.colors?.length
      ? selectedColors
      : [undefined];

    selectedSizesToUse.forEach((size) => {
      selectedColorsToUse.forEach((color) => {
        const cartId = `${product.id}-${size || "nosize"}-${color || "nocolour"}`;
        const existing = updatedCart.find((i) => i.cartId === cartId);

        if (existing) {
          existing.qty += 1;
        } else {
          updatedCart.push({
            ...product,
            qty: 1,
            size: size || undefined,
            color: color || undefined,
            cartId,
          });
        }
      });
    });

    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));
    setAddedProductName(product.name || "Product");
    setShowAddedPopup(true);
    setTimeout(() => setShowAddedPopup(false), 2500);
    handleClose();
  };

  const handleOpen = (product) => {
    setSelectedProduct(product);
    setSelectedSizes([]);
    setSelectedColors([]);
  };

  const handleClose = () => {
    setSelectedProduct(null);
    setSelectedSizes([]);
    setSelectedColors([]);
  };

  const normalizedFilter = (activeFilter || "").toLowerCase();
  const normalizedCategory = (activeCategory || "").trim().toLowerCase();

  const productsByNavFilter = products.filter((product) => {
    const productCategory = (product.category || "").trim().toLowerCase();

    const matchesFilter =
      normalizedFilter === "sale"
        ? Boolean(product.salePercent)
        : normalizedFilter === "new"
          ? Boolean(product.newArrival)
          : true;

    const matchesCategory =
      normalizedCategory !== "" ? productCategory === normalizedCategory : true;

    return matchesFilter && matchesCategory;
  });

  const filteredProducts =
    searchQuery && searchQuery.trim() !== ""
      ? productsByNavFilter.filter((product) =>
          product.name?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : productsByNavFilter;

  const newArrivals = products.filter((p) => p.newArrival);
  const saleProducts = products.filter((p) => p.salePercent);

  const renderProductCard = (product) => {
    const isSale = product.priceAfterSale && product.salePercent;
    const isNew = product.newArrival;
    return (
      <Grid item key={product.id} xs={6} sm={4} md={3} lg={3} xl={2}>
        <Card className="product-card" sx={{ position: "relative" }}>
          {isNew && (
            <Chip
              label="New Arrival"
              color="error"
              size="small"
              sx={{ position: "absolute", top: 8, left: 8, fontWeight: "bold" }}
            />
          )}
          {isSale && (
            <Chip
              label={`-${product.salePercent}%`}
              color="success"
              size="small"
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                fontWeight: "bold",
              }}
            />
          )}
          <CardMedia
            component="img"
            height="170"
            image={product.imageUrl}
            alt={product.name}
            style={{ objectFit: "contain" }}
          />
          <CardContent className="product-content">
            <Typography variant="subtitle2" className="product-title">
              {product.name}
            </Typography>
            {product.colors && product.colors.length > 0 && (
              <Typography variant="caption" display="block">
                Colors: {product.colors.join(", ")}
              </Typography>
            )}
            {product.sizes && product.sizes.length > 0 && (
              <Typography variant="caption" display="block">
                Sizes: {product.sizes.join(", ")}
              </Typography>
            )}
            <Typography variant="body2" className="description-box">
              {product.description?.substring(0, 40)}
              {product.description?.length > 40 && "..."}
            </Typography>
            {isSale ? (
              <>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textDecoration: "line-through" }}
                >
                  Rs {formatOneDecimal(product.sellingPrice)}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: "bold", color: "green" }}
                >
                  Rs {formatOneDecimal(product.priceAfterSale)}
                </Typography>
              </>
            ) : (
              <Typography variant="body2" className="product-price">
                Rs {formatOneDecimal(product.sellingPrice)}
              </Typography>
            )}
          </CardContent>
          <CardActions
            className="product-actions"
            style={{ display: "flex", flexDirection: "column", gap: 4 }}
          >
            <Button
              variant="contained"
              fullWidth
              onClick={() => handleOpen(product)}
              style={{ fontSize: 11 }}
            >
              Add to cart
            </Button>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => handleOpen(product)}
              style={{ fontSize: 11, marginLeft: 0 }}
            >
              Read more
            </Button>
          </CardActions>
        </Card>
      </Grid>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div>
      <Box className="hero">
        <video autoPlay loop muted playsInline className="hero-video">
          <source src="/video.mp4" type="video/mp4" />
        </video>
        <div className="hero-content">
          <Typewriter
            words={[
              "Best deals, best products, just for you",
              "Shop smart, shop easy",
              "Your satisfaction, our priority",
              `Discover ${shopDetails?.shopName || "our store"}`,
            ]}
            loop={Infinity}
            typeSpeed={70}
            deleteSpeed={50}
            delaySpeed={2000}
          />
        </div>
      </Box>

      {newArrivals.length >= 10 && (
        <Box className="marquee-box">
          <Typography variant="h6" sx={{ mb: 1, ml: 5 }}>
            🆕 New Arrivals
          </Typography>
          <div className="marquee">
            <div className="marquee-content">
              {[...newArrivals, ...newArrivals].map((p, i) => (
                <img
                  key={p.id + i}
                  src={p.imageUrl}
                  alt={p.name}
                  className="marquee-img"
                  onClick={() => handleOpen(p)}
                />
              ))}
            </div>
          </div>
        </Box>
      )}

      {saleProducts.length >= 10 && (
        <Box className="marquee-box">
          <Typography variant="h6" sx={{ mb: 1, ml: 5 }}>
            🔥 Sale Products
          </Typography>
          <div className="marquee">
            <div className="marquee-content">
              {[...saleProducts, ...saleProducts].map((p, i) => (
                <img
                  key={p.id + i}
                  src={p.imageUrl}
                  alt={p.name}
                  className="marquee-img"
                  onClick={() => handleOpen(p)}
                />
              ))}
            </div>
          </div>
        </Box>
      )}

      <Container sx={{ py: 5 }}>
        <Typography variant="h4" textAlign="center" sx={{ mb: 4 }}>
          <Typewriter
            words={[
              normalizedCategory
                ? `Category: ${activeCategory}`
                : normalizedFilter === "sale"
                  ? "Sale Products"
                  : normalizedFilter === "new"
                    ? "New Arrivals"
                    : "All Products",
            ]}
            loop={1}
          />
        </Typography>
        {searchQuery &&
        searchQuery.trim() !== "" &&
        filteredProducts.length === 0 ? (
          <Typography textAlign="center" variant="h6" color="text.secondary">
            No products found for "{searchQuery}"
          </Typography>
        ) : (
          <Grid container spacing={2} justifyContent="center">
            {filteredProducts
              .slice(0, 15)
              .map((product) => renderProductCard(product))}
          </Grid>
        )}
        {filteredProducts.length > 15 && (
          <Box textAlign="center" mt={3}>
            <Button
              variant="contained"
              onClick={() => router.push(`/showAll/all/${toShopSlug(shopSlug || userId)}`)}
            >
              Show All
            </Button>
          </Box>
        )}
      </Container>

      {selectedProduct && (
        <Dialog
          open={!!selectedProduct}
          onClose={handleClose}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">{selectedProduct.name}</Typography>

            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers>
            <img
              src={selectedProduct.imageUrl}
              alt={selectedProduct.name}
              style={{
                width: "100%",
                maxHeight: "300px",
                objectFit: "contain",
                marginBottom: "1rem",
              }}
            />
            <Typography variant="body1" gutterBottom>
              <strong>Category:</strong> {selectedProduct.category}
            </Typography>
            {selectedProduct.colors && selectedProduct.colors.length > 0 && (
              <Box sx={{ mt: 2, mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Select Colour:
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {selectedProduct.colors.map((color) => (
                    <Chip
                      key={color}
                      label={color}
                      clickable
                      color={
                        selectedColors.includes(color) ? "primary" : "default"
                      }
                      onClick={() => toggleColor(color)}
                    />
                  ))}
                </Box>
              </Box>
            )}
            {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
              <Box sx={{ mt: 2, mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Select Size:
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {selectedProduct.sizes.map((size) => (
                    <Chip
                      key={size}
                      label={size}
                      clickable
                      color={
                        selectedSizes.includes(size) ? "primary" : "default"
                      }
                      onClick={() => toggleSize(size)}
                    />
                  ))}
                </Box>
              </Box>
            )}
            <Typography variant="body1" gutterBottom>
              <strong>Price:</strong>{" "}
              {selectedProduct.salePercent ? (
                <>
                  <span
                    style={{
                      textDecoration: "line-through",
                      color: "gray",
                      marginRight: "8px",
                    }}
                  >
                    Rs {formatOneDecimal(selectedProduct.sellingPrice)}
                  </span>
                  <span style={{ color: "red", fontWeight: "bold" }}>
                    Rs {formatOneDecimal(selectedProduct.priceAfterSale)}
                  </span>
                </>
              ) : (
                `Rs ${formatOneDecimal(selectedProduct.sellingPrice)}`
              )}
            </Typography>
            {selectedProduct.description && (
              <Typography
                variant="body2"
                color="text.secondary"
                style={{
                  display: "block",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  overflowWrap: "break-word",
                }}
              >
                {selectedProduct.description}
              </Typography>
            )}
            <Box mt={2}>
              <Button
                variant="contained"
                fullWidth
                onClick={() => addToCart(selectedProduct, selectedSizes)}
              >
                Add to Cart
              </Button>
            </Box>
          </DialogContent>
        </Dialog>
      )}

      {showAddedPopup && (
        <div style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 40
        }}>
          <div style={{
            borderRadius: "9999px",
            border: "1px solid #bbf7d0",
            backgroundColor: "#f0fdf4",
            padding: "16px 24px",
            boxShadow: "0 10px 30px rgba(34, 197, 94, 0.15)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "32px",
                width: "32px",
                borderRadius: "9999px",
                backgroundColor: "#dcfce7",
                color: "#16a34a",
                fontWeight: "600"
              }}>✓</span>
              <p style={{ fontSize: "14px", fontWeight: "500", color: "#15803d", margin: 0 , marginRight: "5px"}}>
                {addedProductName} added to cart
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MainPage;
