"use client";

import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Box, CircularProgress, Typography } from "@mui/material";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../lib/fireBase";
import { normalizeShopSlug } from "../../lib/shopSlug";
import NavBar from "./shopNavBar";
import MainPage from "./shopMainPage";
import Footer from "./shopFooter";
import "./publicShop.scss";

export default function ShopPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const paramSlug = Array.isArray(params?.shopSlug)
    ? params.shopSlug[0]
    : params?.shopSlug || "";
  const activeFilter = (searchParams.get("filter") || "").toLowerCase();
  const activeCategory = searchParams.get("category") || "";

  const [loading, setLoading] = useState(true);
  const [shop, setShop] = useState(null);
  const [userId, setUserId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [missingShopName, setMissingShopName] = useState("");

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

  useEffect(() => {
    let isMounted = true;

    const resolveShop = async () => {
      const requestedSlug = getRequestedSlug();

      if (!requestedSlug) {
        if (isMounted) {
          setShop(null);
          setMissingShopName("");
          setLoading(false);
        }
        return;
      }

      setLoading(true);

      try {
        const normalizedSlug = normalizeShopSlug(requestedSlug);
        const legacySlug = normalizedSlug.replace(/-/g, "_");
        const slugCandidates = new Set([
          normalizedSlug,
          legacySlug,
          String(requestedSlug).trim().toLowerCase(),
        ]);

        // Try exact match first
        const slugQuery = query(
          collection(db, "users"),
          where("shopInfo.shopSlug", "==", normalizedSlug)
        );
        const slugSnap = await getDocs(slugQuery);

        let matchedUser = null;
        if (!slugSnap.empty) {
          matchedUser = slugSnap.docs[0];
        } else {
          const legacyQuery = query(
            collection(db, "users"),
            where("shopInfo.shopSlug", "==", legacySlug)
          );
          const legacySnap = await getDocs(legacyQuery);

          if (!legacySnap.empty) {
            matchedUser = legacySnap.docs[0];
          }
        }

        if (!matchedUser) {
          // Fallback: try case-insensitive match on shopName
          const allUsersSnap = await getDocs(collection(db, "users"));
          matchedUser = allUsersSnap.docs.find((userDoc) => {
            const data = userDoc.data();
            const shopInfo = data.shopInfo || {};
            const storedSlug = normalizeShopSlug(shopInfo.shopSlug || "");
            const storedNameSlug = normalizeShopSlug(shopInfo.shopName || "");
            return (
              slugCandidates.has(storedSlug) ||
              slugCandidates.has(storedNameSlug)
            );
          });
        }

        if (!matchedUser || !isMounted) {
          if (isMounted) {
            setShop(null);
            setUserId("");
            setMissingShopName(requestedSlug);
          }
          return;
        }

        const shopInfo = matchedUser.data().shopInfo || {};
        if (isMounted) {
          setShop(shopInfo);
          setUserId(matchedUser.id);
          setMissingShopName("");
        }
      } catch (fetchError) {
        console.error("Error loading shop:", fetchError);
        if (isMounted) {
          setShop(null);
          setUserId("");
          setMissingShopName("");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    resolveShop();
    return () => {
      isMounted = false;
    };
  }, [paramSlug]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!shop || !userId) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10, px: 2 }}>
        <Typography variant="h6" textAlign="center">
          {missingShopName
            ? `No shop exists with this name: ${missingShopName}`
            : "No shop exists with this name"}
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <header className="shop-slug-brand-header">
        <h1>
          GharSa<span>Dukan</span>
        </h1>
      </header>
      <NavBar
        userId={userId}
        shopSlug={paramSlug}
        shopName={shop?.shopName || ""}
        onSearch={setSearchQuery}
      />
      <MainPage
        userId={userId}
        shopSlug={paramSlug}
        searchQuery={searchQuery}
        activeFilter={activeFilter}
        activeCategory={activeCategory}
      />
      <Footer userId={userId} />
    </>
  );
}