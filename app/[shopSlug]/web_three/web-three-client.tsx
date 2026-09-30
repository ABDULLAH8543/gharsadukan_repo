"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db, storage } from "../../lib/fireBase";
import { ref, getDownloadURL } from "firebase/storage";
import WebThreePageContent from "./page-content";
import { CircularProgress, Box } from "@mui/material";

interface WebThreeClientProps {
  userId: string;
}

export default function WebThreeClient({ userId }: WebThreeClientProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [shopInfo, setShopInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const normalizeList = (value: unknown) => {
    if (Array.isArray(value)) {
      return value.map((item) => String(item).trim()).filter(Boolean);
    }
    if (typeof value === "string") {
      return value.split(",").map((item) => item.trim()).filter(Boolean);
    }
    return [];
  };

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        // Fetch products from database
        const productsSnap = await getDocs(
          collection(db, "users", userId, "products")
        );
        const productData = await Promise.all(
          productsSnap.docs.map(async (d) => {
            const data = d.data();
            let imageUrl = data.imageUrl || "";
            
            // Get image URL from storage if imagePath exists
            if (data.imagePath) {
              try {
                imageUrl = await getDownloadURL(ref(storage, data.imagePath));
              } catch (e) {
                console.error("Image fetch error:", e);
              }
            }

            const sellingPrice = Number(data.sellingPrice ?? data.price ?? 0) || 0;
            const priceAfterSale = Number(data.priceAfterSale ?? 0) || 0;
            const salePercent = Number(data.salePercent ?? 0) || 0;

            return {
              id: d.id,
              name: data.name || "Product",
              category: data.category || "Uncategorized",
              price: `PKR ${sellingPrice}`,
              description: data.description || "Quality product",
              image: imageUrl,
              sellingPrice,
              priceAfterSale,
              sizes: normalizeList(data.sizes || data.size),
              colors: normalizeList(data.colors || data.color),
              salePercent,
              newArrival: Boolean(data.newArrival),
            };
          })
        );

        // Fetch shop details
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const fullShopInfo = userData.shopInfo || {};
          setShopInfo({
            platformName: "GharSaDukan",
            ...fullShopInfo,
            shopName: fullShopInfo.shopName || "Your Market",
            tagline:
              fullShopInfo.shopDescription ||
              "Your trusted store for the best deals and quality products.",
          });
        }
        setProducts(productData);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return <WebThreePageContent shopInfo={shopInfo} products={products} />;
}
