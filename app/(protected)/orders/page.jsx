"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import { db, auth } from "../../lib/fireBase";
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  serverTimestamp,
  orderBy,
  query,
  updateDoc,
  getDoc,
  getDocs,
  where,
  limit,
  doc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Image from "next/image";
import { formatOneDecimal } from "../../lib/numberFormat";

export default function Page() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    const ordersRef = collection(db, "orders");
    const q = query(ordersRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const allOrders = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      const shopOrders = allOrders.filter((order) => order.uid === user.uid);

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      let monthlyOrderCount = 0;
      let shopInfo = {};

      if (userSnap.exists()) {
        const data = userSnap.data();
        monthlyOrderCount = data.monthlyOrderCount || 0;
        shopInfo = data.shopInfo || {};
      }

      const now = new Date();
      const todayStr = now.toISOString().split("T")[0];
      const todayYearMonth = `${now.getFullYear()}-${now.getMonth() + 1}`;

      if (shopInfo.setupDate) {
        const [year, month] = shopInfo.setupDate.split("-").map(Number);
        const lastResetYearMonth = `${year}-${month}`;

        if (todayYearMonth !== lastResetYearMonth) {
          monthlyOrderCount = 0;
          await updateDoc(userRef, {
            monthlyOrderCount: 0,
            "shopInfo.setupDate": todayStr,
          });
        }
      } else {
        await updateDoc(userRef, {
          monthlyOrderCount: 0,
          "shopInfo.setupDate": todayStr,
        });
      }

      for (const order of shopOrders) {
        if (!order.counted) {
          monthlyOrderCount++;

          await updateDoc(userRef, {
            monthlyOrderCount,
            "shopInfo.setupDate": todayStr,
          });

          await updateDoc(doc(db, "orders", order.id), {
            counted: true,
          });
        }
      }

      setOrders(shopOrders);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const markDone = async (order) => {
    try {
      if (!user) return;

      const totalAmount = order.items?.reduce((acc, item) => {
        const price = Number(
          item.finalPrice ?? item.sellingPrice ?? item.price ?? 0
        );
        const qty = Number(item.qty ?? 1);
        return acc + price * qty;
      }, 0);

      const soldRef = collection(db, "users", user.uid, "soldInvoices");
      const pendingQuery = query(
        soldRef,
        where("status", "==", "pending"),
        where("doneAt", "==", null),
        limit(20)
      );
      const pendingSnap = await getDocs(pendingQuery);

      const isSameItem = (a, b) => {
        return (
          (a?.id || "") === (b?.id || "") &&
          Number(a?.qty ?? a?.quantity ?? 1) === Number(b?.qty ?? b?.quantity ?? 1) &&
          Number(a?.finalPrice ?? a?.sellingPrice ?? a?.price ?? 0) ===
            Number(b?.finalPrice ?? b?.sellingPrice ?? b?.price ?? 0)
        );
      };

      const orderItems = order.items || [];
      const matchedPending = pendingSnap.docs.find((snap) => {
        const data = snap.data();
        const sameCustomer =
          (data.contact || "") === (order.user?.contact || "") &&
          (data.address || "") === (order.user?.address || "");

        const invoiceItems = data.items || [];
        if (!sameCustomer || invoiceItems.length !== orderItems.length) {
          return false;
        }

        return invoiceItems.every((item, idx) => isSameItem(item, orderItems[idx]));
      });

      if (matchedPending) {
        await updateDoc(doc(db, "users", user.uid, "soldInvoices", matchedPending.id), {
          total: totalAmount,
          totalBill: totalAmount,
          status: "done",
          doneAt: serverTimestamp(),
        });
      } else {
        await addDoc(soldRef, {
          customerName: order.user?.name || "-",
          contact: order.user?.contact || "",
          city: order.user?.city || "",
          address: order.user?.address || "",
          items: order.items || [],
          total: totalAmount,
          totalBill: totalAmount,
          status: "done",
          createdAt: order.createdAt || new Date(),
          doneAt: serverTimestamp(),
        });
      }

      await deleteDoc(doc(db, "orders", order.id));
    } catch (error) {
      console.error("Error processing order:", error);
    }
  };

  if (!user) {
    return <Typography>Please login to see your orders.</Typography>;
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4 }}>
      <Typography variant="h4" mb={3}>
        Your Orders ({orders.length})
      </Typography>

      {orders.length === 0 ? (
        <Typography>No orders found.</Typography>
      ) : (
        <List>
          {orders.map((order) => {
            const totalAmount = order.items?.reduce((acc, item) => {
              const price = Number(
                item.finalPrice ?? item.sellingPrice ?? item.price ?? 0
              );
              const qty = Number(item.qty ?? 1);
              return acc + price * qty;
            }, 0);

            return (
              <ListItem
                key={order.id}
                sx={{
                  mb: 2,
                  p: 2,
                  border: "1px solid #ccc",
                  borderRadius: 2,
                  flexDirection: "column",
                  alignItems: "flex-start",
                }}
              >
                <Typography variant="subtitle1" fontWeight={600}>
                  Total: Rs {formatOneDecimal(totalAmount)}
                </Typography>
                <Typography variant="body2">
                  Name: {order.user?.name}, Contact: {order.user?.contact}
                </Typography>
                <Typography variant="body2">
                  City: {order.user?.city}, Address: {order.user?.address}
                </Typography>

                <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>
                  Items:
                </Typography>
                <List sx={{ pl: 2, width: "100%" }}>
                  {order.items?.map((item, index) => {
                    const price = Number(
                      item.finalPrice ?? item.sellingPrice ?? item.price ?? 0
                    );
                    const qty = Number(item.qty ?? 1);
                    const lineTotal = formatOneDecimal(price * qty);

                    return (
                      <ListItem
                        key={index}
                        sx={{
                          py: 1,
                          display: "flex",
                          alignItems: "center",
                          borderBottom: "1px solid #eee",
                        }}
                      >
                        {item.imageUrl && (
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            width={60}
                            height={60}
                            style={{
                              objectFit: "contain",
                              marginRight: 10,
                              borderRadius: 5,
                              border: "1px solid #ddd",
                            }}
                            unoptimized
                          />
                        )}
                        <ListItemText
                          primary={`${item.name || "Unknown"} (Size: ${
                            item.size || "-"
                          }${item.color ? `, Color: ${item.color}` : ""}) x ${qty} - Rs ${lineTotal}`}
                        />
                      </ListItem>
                    );
                  })}
                </List>

                <Button
                  variant="contained"
                  color="success"
                  sx={{ mt: 1 }}
                  onClick={() => markDone(order)}
                >
                  Mark Done
                </Button>
              </ListItem>
            );
          })}
        </List>
      )}
    </Box>
  );
}