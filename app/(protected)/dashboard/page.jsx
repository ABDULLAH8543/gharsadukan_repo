"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../../lib/fireBase";
import { collection, getDocs, onSnapshot, doc, updateDoc } from "firebase/firestore";
import QRCode from "qrcode";
import jsPDF from "jspdf";
import "./dashboard.scss";
import { normalizeShopSlug } from "../../lib/shopSlug";
import { formatOneDecimal } from "../../lib/numberFormat";

export default function Page() {
  const router = useRouter();


  const [totalProducts, setTotalProducts] = useState(0);
  const [totalCategories, setTotalCategories] = useState(0);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [dailyRevenueData, setDailyRevenueData] = useState([]);
  const [shopInfo, setShopInfo] = useState({});
  const [publicUrl, setPublicUrl] = useState("");
  const [ordersCount, setOrdersCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [monthlyOrders, setMonthlyOrders] = useState(0);

  const currentMonthName = new Date().toLocaleString("en-US", {
    month: "long",
  });

  const isSameDay = (date1, date2) =>
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();

  const getLocalDayKey = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const getPublicShopUrl = (info) => {
    const details = info?.shopInfo || {};
    const shopSlug = normalizeShopSlug(details.shopSlug || details.shopName || "");

    if (!shopSlug) {
      return "";
    }

    if (typeof window !== "undefined") {
      const { protocol, hostname, port } = window.location;

      // In local development we don't have wildcard subdomains by default.
      if (hostname === "localhost" || hostname === "127.0.0.1") {
        const withPort = port ? `${hostname}:${port}` : hostname;
        return `${protocol}//${withPort}/${shopSlug}`;
      }
    }

    return `https://${shopSlug}.gharsadukan.com`;
  };

  useEffect(() => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;

    const fetchProducts = async () => {
      const productsRef = collection(db, "users", uid, "products");
      const productsSnap = await getDocs(productsRef);
      const products = productsSnap.docs.map((doc) => doc.data());
      setTotalProducts(products.length);

      const categorySet = new Set(
        products
          .map((item) => item.category?.toLowerCase().trim())
          .filter(Boolean)
      );
      setTotalCategories(categorySet.size);
    };

    const fetchRevenue = async () => {
      const invoicesRef = collection(db, "users", uid, "soldInvoices");
      const invoicesSnap = await getDocs(invoicesRef);

      const today = new Date();
      let todayTotal = 0;
      const revenueMap = new Map();

      invoicesSnap.forEach((docSnap) => {
        const data = docSnap.data();
        if (String(data.status || "").toLowerCase() !== "done") return;

        const timestamp = data.doneAt || data.createdAt;
        if (!timestamp) return;

        const date =
          typeof timestamp.toDate === "function"
            ? timestamp.toDate()
            : new Date(timestamp);
        if (Number.isNaN(date.getTime())) return;

        const totalBill = parseFloat(data.totalBill || data.total || 0);
        const dayKey = getLocalDayKey(date);
        revenueMap.set(dayKey, (revenueMap.get(dayKey) || 0) + totalBill);

        if (isSameDay(date, today)) {
          todayTotal += totalBill;
        }
      });

      const last15Days = [];
      for (let i = 14; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const key = getLocalDayKey(d);
        last15Days.push(revenueMap.get(key) || 0);
      }

      setTodayRevenue(todayTotal);
      setDailyRevenueData(last15Days);
    };

    const unsubscribeUser = onSnapshot(doc(db, "users", uid), async (docSnap) => {
      if (docSnap.exists()) {
        const info = docSnap.data();
        setShopInfo(info);
        setPublicUrl(getPublicShopUrl(info));

        let nextMonthlyOrders = Number(info.monthlyOrderCount || 0);
        const now = new Date();
        const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

        const setupDate = info?.shopInfo?.setupDate;
        let setupYearMonth = "";
        if (typeof setupDate === "string") {
          const [year, month] = setupDate.split("-");
          if (year && month) {
            setupYearMonth = `${year}-${String(Number(month)).padStart(2, "0")}`;
          }
        }

        if (!setupYearMonth || setupYearMonth !== currentYearMonth) {
          nextMonthlyOrders = 0;
          await updateDoc(doc(db, "users", uid), {
            monthlyOrderCount: 0,
            "shopInfo.setupDate": getLocalDayKey(now),
          });
        }

        setMonthlyOrders(nextMonthlyOrders);
      }
    });

    const ordersRef = collection(db, "orders");
    const unsubscribeOrders = onSnapshot(ordersRef, (snapshot) => {
      const myOrders = snapshot.docs
        .map((docSnap) => docSnap.data())
        .filter((order) => order.uid === uid);

      setOrdersCount(myOrders.length);
    });

    fetchProducts();
    fetchRevenue();

    return () => {
      unsubscribeOrders();
      unsubscribeUser();
    };
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = async () => {
    if (!publicUrl) return;
    try {
      // QR content and visible shop link should always be identical.
      const qrLink = publicUrl.trim();
      const qrDataUrl = await QRCode.toDataURL(qrLink, {
        width: 300,
        margin: 2,
      });
      const pdf = new jsPDF();
      pdf.setFontSize(18);
      pdf.text(`${shopInfo?.shopInfo?.shopName || "My Shop"} QR Code`, 20, 20);
      pdf.addImage(qrDataUrl, "PNG", 40, 40, 130, 130);
      pdf.setFontSize(12);
      pdf.text(`Shop Link: ${qrLink}`, 20, 190);
      pdf.save(
        `${normalizeShopSlug(shopInfo?.shopInfo?.shopName || "shop") || "shop"}_QR.pdf`
      );
    } catch (error) {
      console.error("Error generating QR PDF:", error);
    }
  };

  return (
    <div id="dashboard-container">
      <div id="public-url">
        <span>{publicUrl}</span>
        <div id="copy-btn">
          <button onClick={copyToClipboard}>Copy</button>
          <button onClick={handleDownloadQR}>Download QR</button>
        </div>
        {copied && <div className="popup">Copied!</div>}
      </div>

      <h2 id="dashboard-title">{shopInfo?.shopInfo?.shopName || "My Dashboard"}</h2>

      <div id="dashboard-options">
        <div
          className="dashboard-card"
          onClick={() => router.push("/previousReport")}
        >
          <p>Today&apos;s Revenue</p>
          <span>Rs {formatOneDecimal(todayRevenue)}</span>
        </div>

        <div
          className="dashboard-card"
          onClick={() => router.push("/ShowProducts")}
        >
          <p>Total Products</p>
          <span>{totalProducts}</span>
        </div>

        <div
          className="dashboard-card"
          onClick={() => router.push("/ShowProducts")}
        >
          <p>Total Categories</p>
          <span>{totalCategories}</span>
        </div>

        <div className="dashboard-card" onClick={() => router.push("/orders")}>
          <p>Orders</p>
          <span>{ordersCount}</span>
        </div>

        <div className="dashboard-card">
          <p>{currentMonthName} Orders</p>
          <span>{monthlyOrders}</span>
        </div>

        <div
          className="dashboard-card"
          onClick={() => router.push("/previousReport")}
        >
          <p>15 Days Revenue</p>
          <span>
            Rs {formatOneDecimal(dailyRevenueData.reduce((a, b) => a + b, 0))}
          </span>
        </div>
      </div>
    </div>
  );
}