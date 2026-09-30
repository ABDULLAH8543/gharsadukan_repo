"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  List,
  ListItem,
  Box,
  CardMedia,
  Snackbar,
  Alert,
  TextField,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import { db } from "../../../lib/fireBase";
import { normalizeShopSlug } from "../../../lib/shopSlug";
import { formatOneDecimal } from "../../../lib/numberFormat";
import { collection, addDoc, serverTimestamp, getDocs } from "firebase/firestore";
import "../mainPage.css";

export default function CartPage() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const params = useParams();
  const paramSlug = Array.isArray(params?.shopSlug)
    ? params.shopSlug[0]
    : params?.shopSlug || "";

  const getRequestedSlug = () => {
    if (paramSlug) {
      return String(paramSlug);
    }

    if (typeof window === "undefined") {
      return "";
    }

    const hostname = window.location.hostname.toLowerCase();
    if (
      hostname.endsWith(".gharsadukan.com") &&
      hostname !== "gharsadukan.com" &&
      hostname !== "www.gharsadukan.com"
    ) {
      return hostname.slice(0, -".gharsadukan.com".length);
    }

    return "";
  };

  const shopSlug = getRequestedSlug();
  const shopPath = shopSlug ? `/${shopSlug}` : "/";

  const [cartItems, setCartItems] = useState([]);
  const [userId, setUserId] = useState("");
  const [shopDetails, setShopDetails] = useState(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [deliveryCharges, setDeliveryCharges] = useState(0);
  const [userInfo, setUserInfo] = useState({
    name: "",
    contact: "",
    email: "",
    city: "",
    address: "",
  });

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    const normalized = storedCart.map((item) => ({
      ...item,
      qty: item.qty ? Number(item.qty) : 1,
      sellingPrice: Number(item.sellingPrice ?? item.price ?? 0),
      priceAfterSale: Number(item.priceAfterSale ?? 0),
    }));
    setCartItems(normalized);
  }, []);

  useEffect(() => {
    if (!shopSlug) return;

    const fetchShopDetails = async () => {
      try {
        const normalizedSlug = normalizeShopSlug(shopSlug);
        const legacySlug = normalizedSlug.replace(/-/g, "_");
        const slugCandidates = new Set([
          normalizedSlug,
          legacySlug,
          String(shopSlug).trim().toLowerCase(),
        ]);
        const usersRef = collection(db, "users");
        const snapshot = await getDocs(usersRef);

        let foundUserId = null;
        snapshot.forEach((doc) => {
          const data = doc.data();
          const storedSlug = normalizeShopSlug(data.shopInfo?.shopSlug || "");
          const storedNameSlug = normalizeShopSlug(data.shopInfo?.shopName || "");
          if (slugCandidates.has(storedSlug) || slugCandidates.has(storedNameSlug)) {
            foundUserId = doc.id;
            const nextShopDetails = data.shopInfo || {};
            setShopDetails(nextShopDetails);
            setDeliveryCharges(
              Number(nextShopDetails.deliveryCharges ?? data.deliveryCharges ?? 0)
            );
          }
        });

        setUserId(foundUserId || "");
      } catch (error) {
        console.error("Error fetching shop details:", error);
      }
    };

    fetchShopDetails();
  }, [shopSlug]);

  const saveCart = (updatedCart) => {
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const increaseQty = (cartId) => {
    saveCart(
      cartItems.map((item) =>
        item.cartId === cartId ? { ...item, qty: item.qty + 1 } : item
      )
    );
  };

  const decreaseQty = (cartId) => {
    saveCart(
      cartItems
        .map((item) =>
          item.cartId === cartId ? { ...item, qty: item.qty - 1 } : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const deleteItem = (cartId) => {
    saveCart(cartItems.filter((item) => item.cartId !== cartId));
  };

  const handleChange = (e) => {
    setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidContact = (contact) => {
    return /^03\d{9}$/.test(contact);
  };

  const submitOrder = async () => {
    const { name, contact, email, city, address } = userInfo;

    if ([name, contact, email, city, address].some((v) => v.trim() === "")) {
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
      const orderItems = cartItems.map((item) => {
        const finalPrice = item.salePercent
          ? Number(item.priceAfterSale)
          : Number(item.sellingPrice ?? item.price ?? 0);

        return {
          id: item.id,
          name: item.name || item.title,
          color: item.color || null,
          size: item.size || null,
          qty: item.qty,
          finalPrice,
          imagePath: item.imagePath || null,
          imageUrl: item.imageUrl || null,
        };
      });

      const itemsTotal = orderItems.reduce(
        (acc, item) => acc + item.finalPrice * item.qty,
        0
      );
      const grandTotal = itemsTotal + deliveryCharges;

      await addDoc(collection(db, "orders"), {
        uid: userId,
        items: orderItems,
        itemsTotal,
        deliveryCharges,
        grandTotal,
        user: userInfo,
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
          createdAt: new Date(),
          doneAt: null,
        });
      }

      setCartItems([]);
      localStorage.removeItem("cart");
      window.dispatchEvent(new Event("cartUpdated"));

      setOrderPlaced(true);
      setShowForm(false);
      setUserInfo({
        name: "",
        contact: "",
        email: "",
        city: "",
        address: "",
      });

      setTimeout(() => {
        router.push(shopPath);
      }, 2000);
    } catch (error) {
      console.error("Error saving order:", error);
      setErrorMessage("Error placing order. Please try again.");
      setFormError(true);
    }
  };

  const itemsTotal = cartItems.reduce((acc, item) => {
    const price = item.salePercent
      ? Number(item.priceAfterSale)
      : Number(item.sellingPrice ?? item.price ?? 0);
    return acc + price * item.qty;
  }, 0);

  const grandTotal = itemsTotal + deliveryCharges;

  return (
    <>
      <Dialog
        open={true}
        onClose={() => router.push(shopPath)}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>
          Your Cart
          <IconButton
            aria-label="close"
            onClick={() => router.push(shopPath)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          dividers
          sx={{
            maxHeight: isMobile ? "70vh" : "60vh",
            overflowY: "auto",
          }}
        >
          {cartItems.length === 0 ? (
            <Typography>No items in cart.</Typography>
          ) : (
            <List>
              {cartItems.map((item) => {
                const price = item.salePercent
                  ? Number(item.priceAfterSale)
                  : Number(item.sellingPrice ?? item.price ?? 0);

                return (
                  <ListItem
                    key={item.cartId || item.id}
                    sx={{
                      flexDirection: isMobile ? "column" : "row",
                      alignItems: isMobile ? "flex-start" : "center",
                      mb: 2,
                      border: "1px solid #eee",
                      borderRadius: 2,
                      p: 1.5,
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={item.imageUrl || "/placeholder.png"}
                      alt={item.name || item.title}
                      sx={{
                        width: isMobile ? "100%" : 80,
                        height: isMobile ? 150 : 80,
                        borderRadius: 2,
                        objectFit: "contain",
                        mb: isMobile ? 1 : 0,
                      }}
                    />
                    <Box
                      sx={{
                        flex: 1,
                        ml: isMobile ? 0 : 2,
                        mt: isMobile ? 1 : 0,
                        textAlign: isMobile ? "center" : "left",
                        width: "100%",
                      }}
                    >
                      <Typography variant="subtitle1" fontWeight="bold">
                        {item.name || item.title}
                      </Typography>
                      {item.color && (
                        <Typography variant="body2">Color: {item.color}</Typography>
                      )}
                      {item.size && (
                        <Typography variant="body2">Size: {item.size}</Typography>
                      )}
                      <Typography variant="body2">
                        Price: Rs {formatOneDecimal(price)}
                      </Typography>
                      <Box
                        sx={{
                          mt: 1,
                          display: "flex",
                          justifyContent: isMobile ? "center" : "flex-start",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => decreaseQty(item.cartId)}
                        >
                          -
                        </Button>
                        <Typography>{item.qty}</Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => increaseQty(item.cartId)}
                        >
                          +
                        </Button>
                        <IconButton
                          color="error"
                          onClick={() => deleteItem(item.cartId)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      sx={{
                        mt: isMobile ? 1 : 0,
                        textAlign: isMobile ? "center" : "right",
                        width: isMobile ? "100%" : "auto",
                      }}
                    >
                      Rs {formatOneDecimal(price * item.qty)}
                    </Typography>
                  </ListItem>
                );
              })}
            </List>
          )}
        </DialogContent>

        {cartItems.length > 0 && !showForm && (
          <DialogActions
            sx={{
              flexDirection: "column",
              alignItems: "stretch",
              borderTop: "1px solid #eee",
              p: 2,
            }}
          >
            <Typography variant="body1" textAlign="right" sx={{ width: "100%" }}>
              Items Total: Rs {formatOneDecimal(itemsTotal)}
            </Typography>
            <Typography variant="body1" textAlign="right" sx={{ width: "100%" }}>
              Delivery Charges: Rs {formatOneDecimal(deliveryCharges)}
            </Typography>
            <Typography
              variant="h6"
              fontWeight="bold"
              textAlign="right"
              sx={{ width: "100%", mt: 1 }}
            >
              Grand Total: Rs {formatOneDecimal(grandTotal)}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={() => setShowForm(true)}
              sx={{ mt: 1 }}
            >
              Place Order
            </Button>
          </DialogActions>
        )}
      </Dialog>

      <Dialog
        open={showForm}
        onClose={() => setShowForm(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Enter Your Details</DialogTitle>
        <DialogContent dividers>
          {["name", "contact", "email", "city", "address"].map((field) => (
            <TextField
              key={field}
              margin="dense"
              label={field.charAt(0).toUpperCase() + field.slice(1)}
              name={field}
              type={field === "email" ? "email" : "text"}
              fullWidth
              value={userInfo[field]}
              onChange={handleChange}
              required
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowForm(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={submitOrder}>
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
    </>
  );
}
