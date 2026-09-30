"use client";

import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  InputBase,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Badge,
  Menu,
  MenuItem,
  Collapse,
  Divider,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import { useRouter } from "next/navigation";
import { db } from "../../lib/fireBase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

const normalizeShopSlug = (value = "") => {
  return value.trim().replace(/\s+/g, "_").toLowerCase();
};

const toShopSlug = (value = "") => {
  return value.trim().replace(/\s+/g, "_").toLowerCase();
};

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.black, 0.05),
  "&:hover": { backgroundColor: alpha(theme.palette.common.black, 0.1) },
  marginLeft: theme.spacing(2),
  marginRight: theme.spacing(2),
  width: "100%",
  [theme.breakpoints.up("sm")]: { width: "auto", minWidth: "400px" },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  right: 0,
  top: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "black",
  borderRadius: `0 ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0`,
  color: "white",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  width: "100%",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 2),
    paddingRight: `calc(1em + ${theme.spacing(4)})`,
  },
}));

const NavBar = ({ userId, shopSlug, shopName, onSearch }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [categories, setCategories] = useState([]);
  const [isVerifiedUser, setIsVerifiedUser] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileCatOpen, setMobileCatOpen] = useState(false);
  const router = useRouter();
  const resolvedShopSlug = toShopSlug(shopSlug || userId);
  const shopPath = `/${resolvedShopSlug}`;
  const cartPath = `/${toShopSlug(shopSlug || userId)}/cart`;

  const buildShopPathWithQuery = (query = {}) => {
    const searchParams = new URLSearchParams();

    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value).trim() !== "") {
        searchParams.set(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `${shopPath}?${queryString}` : shopPath;
  };

  useEffect(() => {
    const updateCartCount = () => {
      const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
      setCartCount(storedCart.length);
    };
    window.addEventListener("cartUpdated", updateCartCount);
    window.addEventListener("storage", updateCartCount);
    updateCartCount();
    return () => {
      window.removeEventListener("cartUpdated", updateCartCount);
      window.removeEventListener("storage", updateCartCount);
    };
  }, []);

  useEffect(() => {
    if (!userId) return;
    const fetchCategories = async () => {
      try {
        const snap = await getDocs(collection(db, "users", userId, "products"));
        const cats = snap.docs
          .map((doc) => doc.data().category)
          .filter(Boolean)
          .map((cat) => cat.trim().toLowerCase());

        const uniqueCats = [...new Set(cats)].map(
          (c) => c.charAt(0).toUpperCase() + c.slice(1)
        );
        setCategories(uniqueCats);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setIsVerifiedUser(false);
      return;
    }

    const fetchVerificationStatus = async () => {
      try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          setIsVerifiedUser(false);
          return;
        }

        const userData = userSnap.data() || {};
        const verificationSignals = [
          userData.isVerified,
          userData.verified,
          userData.isPremium,
          userData.premium,
          userData.shopInfo?.isVerified,
          userData.shopInfo?.verified,
          userData.shopInfo?.isPremium,
          userData.shopInfo?.premium,
        ];

        const normalizedSignals = verificationSignals.map((value) =>
          typeof value === "string" ? value.toLowerCase().trim() : value
        );

        const isVerified = normalizedSignals.some(
          (value) => value === true || value === "true" || value === "verified" || value === "premium"
        );

        setIsVerifiedUser(isVerified);
      } catch (error) {
        console.error("Error fetching verification status:", error);
        setIsVerifiedUser(false);
      }
    };

    fetchVerificationStatus();
  }, [userId]);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleCategoryClick = (event) => setAnchorEl(event.currentTarget);
  const handleCategoryClose = () => setAnchorEl(null);

  const handleCategorySelect = (cat) => {
    handleCategoryClose();
    router.push(buildShopPathWithQuery({ category: cat }));
  };

  const navItems = [
    { label: "SALE", path: buildShopPathWithQuery({ filter: "sale" }) },
    { label: "NEW ARRIVALS", path: buildShopPathWithQuery({ filter: "new" }) },
    { label: "SHOP BY CATEGORY", path: null },
  ];

  const displayName = shopName?.trim() || "GharSaDukan";

  const drawer = (
    <Box sx={{ width: 250, p: 1 }}>
      <Typography variant="h6" sx={{ my: 2, textAlign: "center" }}>
        <p style={{ letterSpacing: ".5px" }}>
          GharSa<span style={{ color: "#8BC34A" }}>Dukan</span>
        </p>
      </Typography>
      <Divider />
      <List>
        {navItems.map((item) =>
          item.label !== "SHOP BY CATEGORY" ? (
            <ListItem
              button
              key={item.label}
              onClick={() => {
                router.push(item.path);
                setMobileOpen(false);
              }}
            >
              <ListItemText primary={item.label} />
            </ListItem>
          ) : (
            <Box key={item.label}>
              <ListItem button onClick={() => setMobileCatOpen(!mobileCatOpen)}>
                <ListItemText primary={item.label} />
              </ListItem>
              <Collapse in={mobileCatOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  <ListItem
                    button
                    onClick={() => {
                      router.push(shopPath);
                      setMobileOpen(false);
                      setMobileCatOpen(false);
                    }}
                  >
                    <ListItemText primary="Show All" />
                  </ListItem>
                  {categories.map((cat) => (
                    <ListItem
                      button
                      key={cat}
                      sx={{
                        pl: 4,
                        bgcolor: "#f5f5f5",
                        borderRadius: 1,
                        my: 0.5,
                      }}
                      onClick={() => {
                        router.push(buildShopPathWithQuery({ category: cat }));
                        setMobileOpen(false);
                        setMobileCatOpen(false);
                      }}
                    >
                      <ListItemText primary={cat} />
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </Box>
          )
        )}
      </List>
    </Box>
  );

  return (
    <div>
      <Box sx={{ position: "sticky", top: 0, zIndex: 1100 }}>
        <AppBar
          position="static"
          sx={{ bgcolor: "white", color: "black", boxShadow: 1 }}
        >
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2, display: { sm: "none" } }}
              onClick={handleDrawerToggle}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              noWrap
              sx={{
                fontWeight: "bold",
                color: "black",
                flexGrow: { xs: 1, sm: 0 },
                cursor: "pointer",
              }}
              onClick={() => router.push(shopPath)}
            >
              {displayName}
            </Typography>
            <Box
              sx={{
                flexGrow: 1,
                display: { xs: "none", sm: "flex" },
                justifyContent: "center",
              }}
            >
              <Search>
                <StyledInputBase
                  placeholder="Search products"
                  onChange={(e) => onSearch(e.target.value)}
                />
                <SearchIconWrapper>
                  <SearchIcon />
                </SearchIconWrapper>
              </Search>
            </Box>
            <Box>
              <IconButton onClick={() => router.push(cartPath)}>
                <Badge badgeContent={cartCount} color="error">
                  <ShoppingBagIcon />
                </Badge>
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>
        <Box
          sx={{
            display: { xs: "none", sm: "flex" },
            justifyContent: "center",
            bgcolor: "white",
            boxShadow: 1,
            p: 1,
            gap: 4,
          }}
        >
          {navItems.map((item) =>
            item.label !== "SHOP BY CATEGORY" ? (
              <Button
                key={item.label}
                sx={{
                  color: "black",
                  fontWeight: 500,
                  border: "1px solid transparent",
                  borderRadius: 999,
                  padding: "5px 10px",
                  transition: "border-color 160ms ease, background-color 160ms ease",
                  "&:hover": {
                    borderColor: "black",
                    backgroundColor: "rgba(0, 0, 0, 0.04)",
                  },
                }}
                onClick={() => router.push(item.path)}
              >
                {item.label}
              </Button>
            ) : (
              <div key={item.label}>
                <Button
                  sx={{
                    color: "black",
                    fontWeight: 500,
                    border: "1px solid transparent",
                    borderRadius: 999,
                    transition: "border-color 160ms ease, background-color 160ms ease",
                    "&:hover": {
                      borderColor: "black",
                      backgroundColor: "rgba(0, 0, 0, 0.04)",
                    },
                  }}
                  onClick={handleCategoryClick}
                >
                  {item.label}
                </Button>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleCategoryClose}
                >
                  <MenuItem
                    onClick={() => {
                      handleCategoryClose();
                      router.push(shopPath);
                    }}
                  >
                    Show All
                  </MenuItem>
                  {categories.map((cat) => (
                    <MenuItem
                      key={cat}
                      onClick={() => handleCategorySelect(cat)}
                    >
                      {cat}
                    </MenuItem>
                  ))}
                </Menu>
              </div>
            )
          )}
        </Box>
      </Box>
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{ display: { sm: "none" } }}
      >
        {drawer}
      </Drawer>
      {isVerifiedUser && (
        <Box
          sx={{
            width: "100%",
            overflow: "hidden",
            bgcolor: "success.light",
            color: "success.contrastText",
            borderTop: "1px solid",
            borderColor: "success.main",
            py: 0.75,
            whiteSpace: "nowrap",
            fontWeight: 700,
            letterSpacing: 0.3,
          }}
        >
          <marquee behavior="scroll" direction="left" scrollAmount="8">
            ✅ This shop is verified by GharSaDukan • Trusted Seller • ✅ This shop is verified by GharSaDukan Premium • Trusted Seller • ✅ This shop is verified by GharSaDukan Premium • Trusted Seller •
          </marquee>
        </Box>
      )}
    </div>
  );
};

export default NavBar;
