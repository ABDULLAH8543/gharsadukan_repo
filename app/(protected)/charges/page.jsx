"use client";
import React, { useEffect, useState } from "react";
import { db, auth } from "../../lib/fireBase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import "./chargesPage.scss";
import { formatOneDecimal } from "../../lib/numberFormat";

export default function Page() {
  const [customerName, setCustomerName] = useState("");
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState("");
  const [invoice, setInvoice] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const s = localStorage.getItem("invoice");
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });
  const [soldMessage, setSoldMessage] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!auth.currentUser) return;
      const userId = auth.currentUser.uid;
      const productsRef = collection(db, "users", userId, "products");
      const querySnapshot = await getDocs(productsRef);
      const productList = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setProducts(productList);
    };

    fetchProducts();
  }, []);

  const suggestions = React.useMemo(() => {
    if (search.trim() === "") return [];
    return products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
  }, [search, products]);

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setSearch(product.name);

    const discountedPrice =
      product.salePercent > 0 && product.priceAfterSale
        ? product.priceAfterSale
        : product.sellingPrice;

    setQuantity(1);
    setPrice(discountedPrice);
  };

  const addToInvoice = () => {
    if (!selectedProduct || !quantity) return;

    const discountedPrice =
      selectedProduct.salePercent > 0 && selectedProduct.priceAfterSale
        ? selectedProduct.priceAfterSale
        : selectedProduct.sellingPrice;

    const finalPrice = price || discountedPrice;

    const newItem = {
      id: selectedProduct.id,
      name: selectedProduct.name,
      size: selectedProduct.size || "N/A",
      quantity: Number(quantity),
      sellingPrice: Number(finalPrice),
      total: Number(quantity) * Number(finalPrice),
      imagePath: selectedProduct.imagePath || null,
      imageUrl: selectedProduct.imageUrl || null,
    };

    let updatedInvoice;
    if (editIndex !== null) {
      updatedInvoice = [...invoice];
      updatedInvoice[editIndex] = newItem;
      setEditIndex(null);
    } else {
      updatedInvoice = [...invoice, newItem];
    }

    setInvoice(updatedInvoice);
    localStorage.setItem("invoice", JSON.stringify(updatedInvoice));

    setSearch("");
    setSelectedProduct(null);
    setQuantity(1);
    setPrice("");
  };

  const editInvoiceItem = (index) => {
    const item = invoice[index];
    setSearch(item.name);
    setSelectedProduct(item);
    setQuantity(item.quantity);
    setPrice(item.sellingPrice);
    setEditIndex(index);
  };

  const deleteInvoiceItem = (index) => {
    const updatedInvoice = invoice.filter((_, i) => i !== index);
    setInvoice(updatedInvoice);
    localStorage.setItem("invoice", JSON.stringify(updatedInvoice));
  };

  const sellProducts = async () => {
    try {
      const userId = auth.currentUser.uid;

      for (const item of invoice) {
        const productRef = doc(db, "users", userId, "products", item.id);
        const snap = await getDoc(productRef);
        if (snap.exists()) {
          const currentQty = snap.data().quantity || 0;
          const newQty =
            currentQty - item.quantity >= 0 ? currentQty - item.quantity : 0;
          await updateDoc(productRef, { quantity: newQty });
        }
      }

      const invoiceRef = collection(db, "users", userId, "soldInvoices");
      await addDoc(invoiceRef, {
        customerName,
        items: invoice,
        total,
        doneAt: serverTimestamp(),
      });

      setSoldMessage(true);
      setTimeout(() => setSoldMessage(false), 2000);

      setInvoice([]);
      localStorage.removeItem("invoice");
      setCustomerName("");
    } catch (error) {
      console.error("Error selling products:", error);
    }
  };

  const total = invoice.reduce((acc, item) => acc + item.total, 0);

  return (
    <div className="sell-container">
      <h1 className="title">Sell Products</h1>

      <input
        type="text"
        placeholder="Customer Name"
        value={customerName}
        onChange={(e) => setCustomerName(e.target.value)}
        className="input-field"
      />

      <input
        type="text"
        placeholder="Search product..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="input-field"
      />

      {suggestions.length > 0 && (
        <div className="suggestion-box">
          {suggestions.map((p) => (
            <p key={p.id} onClick={() => handleSelectProduct(p)}>
              {p.name} {" "}
              {p.salePercent > 0 ? (
                <span style={{ color: "green" }}>
                  (Sale {p.salePercent}%: Rs {formatOneDecimal(p.priceAfterSale)})
                </span>
              ) : (
                <span>Rs {formatOneDecimal(p.sellingPrice)}</span>
              )}
            </p>
          ))}
        </div>
      )}

      {selectedProduct && (
        <div className="product-info">
          <div className="product-actions">
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="input-small"
            />

            <input
              type="number"
              placeholder="Price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="input-small"
            />

            <button onClick={addToInvoice} className="btn btn-add">
              {editIndex !== null ? "Update Item" : "Add to Invoice"}
            </button>
          </div>
        </div>
      )}

      <h2 className="subtitle">Invoice</h2>
      {invoice.length === 0 ? (
        <p className="no-items">No items in invoice</p>
      ) : (
        <div className="invoice-box">
          {invoice.map((item, idx) => (
            <div key={idx} className="invoice-item">
              <span>
                {item.name} x{item.quantity} - Rs {formatOneDecimal(item.total)} {" "}
                {item.sellingPrice < selectedProduct?.sellingPrice && (
                  <em style={{ color: "green" }}>(Discount Applied)</em>
                )}
              </span>
              <div className="actions">
                <button
                  onClick={() => editInvoiceItem(idx)}
                  className="btn btn-edit"
                  style={{ margin: "5px" }}
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteInvoiceItem(idx)}
                  className="btn btn-delete"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          <p className="total">Total Bill: Rs {formatOneDecimal(total)}</p>
          <button onClick={sellProducts} className="btn btn-sell">
            Sold
          </button>
        </div>
      )}

      {soldMessage && <div className="sold-message">✅ Sold Successfully!</div>}
    </div>
  );
}