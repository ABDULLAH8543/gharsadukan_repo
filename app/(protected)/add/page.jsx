"use client";
import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import {
  addDoc,
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db, storage } from "../../lib/fireBase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import "./addproducts.scss";

export default function Page() {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    sellingPrice: "",
    salePercent: "",
    priceAfterSale: "",
    description: "",
    newArrival: false,
  });
  const [categories, setCategories] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [currentSize, setCurrentSize] = useState("");
  const [colors, setColors] = useState([]);
  const [currentColor, setCurrentColor] = useState("");
  const [image, setImage] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [showError, setShowError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;
      try {
        const productsSnap = await getDocs(
          collection(db, "users", user.uid, "products")
        );
        const uniqueCategories = [
          ...new Set(
            productsSnap.docs
              .map((doc) => doc.data().category?.toLowerCase().trim())
              .filter((cat) => cat)
          ),
        ];
        setCategories(uniqueCategories);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let updated = {
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    };
    if (name === "salePercent" || name === "sellingPrice") {
      const selling = parseFloat(updated.sellingPrice) || 0;
      const percent = parseFloat(updated.salePercent) || 0;
      if (selling > 0 && percent > 0) {
        const discounted = selling - (selling * percent) / 100;
        updated.priceAfterSale = discounted.toFixed(1);
      } else {
        updated.priceAfterSale = "";
      }
    }
    setFormData(updated);
  };

  const handleAddSize = () => {
    if (currentSize.trim() && !sizes.includes(currentSize.trim())) {
      setSizes([...sizes, currentSize.trim()]);
      setCurrentSize("");
    }
  };

  const handleRemoveSize = (size) => {
    setSizes(sizes.filter((s) => s !== size));
  };

  const handleAddColor = () => {
    if (currentColor.trim() && !colors.includes(currentColor.trim())) {
      setColors([...colors, currentColor.trim()]);
      setCurrentColor("");
    }
  };

  const handleRemoveColor = (color) => {
    setColors(colors.filter((c) => c !== color));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in to add products.");
      setLoading(false);
      return;
    }
    const {
      name,
      category,
      sellingPrice,
      salePercent,
      priceAfterSale,
      description,
      newArrival,
    } = formData;
    if (!name || !category || !sellingPrice || !description || !image) {
      setShowError("Fill all the required fields.");
      setLoading(false);
      return;
    }
    if (colors.length === 0) {
      setShowError("Colours are required.");
      setLoading(false);
      return;
    }
    setShowError("");
    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      let productCount = 0;
      if (userSnap.exists() && userSnap.data().productCount) {
        productCount = userSnap.data().productCount;
      }
      if (productCount >= 100) {
        alert("🚫 You have reached the limit of 100 products!");
        setLoading(false);
        return;
      }
      const imagePath = `users/${user.uid}/products/${image.name}`;
      const imgRef = ref(storage, imagePath);
      await uploadBytes(imgRef, image);
      const imageUrl = await getDownloadURL(imgRef);
      const product = {
        name,
        category: category.toLowerCase().trim(),
        sizes: sizes.length > 0 ? sizes : [],
        colors: colors.length > 0 ? colors : [],
        sellingPrice: Number(sellingPrice),
        salePercent: salePercent ? Number(salePercent) : null,
        priceAfterSale: priceAfterSale ? Number(priceAfterSale) : null,
        description,
        newArrival,
        imagePath,
        imageUrl,
        email: user.email,
        uid: user.uid,
        createdAt: new Date(),
      };
      await addDoc(collection(db, "users", user.uid, "products"), product);
      if (userSnap.exists()) {
        await updateDoc(userRef, {
          productCount: productCount + 1,
        });
      } else {
        await setDoc(userRef, {
          productCount: 1,
        });
      }
      setFormData({
        name: "",
        category: "",
        sellingPrice: "",
        salePercent: "",
        priceAfterSale: "",
        description: "",
        newArrival: false,
      });
      setSizes([]);
      setCurrentSize("");
      setColors([]);
      setCurrentColor("");
      setImage(null);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 1000);
      setCategories((prev) =>
        Array.from(new Set([...prev, category.toLowerCase().trim()]))
      );
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Failed to add product. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-outer-container">
      <div className="add-inner-container">
        <h1>Add Product</h1>
        <form id="add-product-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Product Name required"
            value={formData.name}
            onChange={handleChange}
          />
          <input
            type="text"
            name="category"
            placeholder="Product Category required"
            value={formData.category}
            onChange={handleChange}
            list="category-options"
          />
          <datalist id="category-options">
            {categories.map((cat, idx) => (
              <option key={idx} value={cat} />
            ))}
          </datalist>
          <div className="size-container">
            <input
              type="text"
              placeholder="Enter Size"
              value={currentSize}
              onChange={(e) => setCurrentSize(e.target.value)}
            />
            <button
              type="button"
              className="add-size-btn"
              onClick={handleAddSize}
            >
              Add
            </button>
          </div>
          <div className="size-list">
            {sizes.map((size, idx) => (
              <span key={idx} className="size-chip">
                {size}
                <button
                  type="button"
                  className="remove-size"
                  onClick={() => handleRemoveSize(size)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="size-container">
            <input
              type="text"
              placeholder="Enter Colour required"
              value={currentColor}
              onChange={(e) => setCurrentColor(e.target.value)}
            />
            <button
              type="button"
              className="add-size-btn"
              onClick={handleAddColor}
            >
              Add
            </button>
          </div>
          <div className="size-list">
            {colors.map((color, idx) => (
              <span key={idx} className="size-chip">
                {color}
                <button
                  type="button"
                  className="remove-size"
                  onClick={() => handleRemoveColor(color)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <input
            type="number"
            name="sellingPrice"
            placeholder="Selling Price required"
            value={formData.sellingPrice}
            onChange={handleChange}
            className="no-spinner"
            min="0"
          />
          <input
            type="number"
            name="salePercent"
            placeholder="Discount Percent (%)"
            value={formData.salePercent}
            onChange={handleChange}
            className="no-spinner"
            min="0"
            max="100"
          />
          <input
            type="number"
            name="priceAfterSale"
            placeholder="Price After Sale"
            value={formData.priceAfterSale}
            readOnly
          />
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="newArrival"
              checked={formData.newArrival}
              onChange={handleChange}
            />
            Mark as New Arrival
          </label>
          <input
            name="description"
            placeholder="Product Description required"
            value={formData.description}
            onChange={handleChange}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
          />
          {showError && <p className="form-error">{showError}</p>}
          <button type="submit" disabled={loading} className={loading ? "loading-btn" : ""}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Adding Product...
              </>
            ) : (
              "Add Product"
            )}
          </button>
        </form>
      </div>
      {showNotification && (
        <div id="add-pro-notification">Product added successfully</div>
      )}
    </div>
  );
}