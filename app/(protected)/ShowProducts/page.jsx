// import Image from "next/image";
"use client";
import React, { useEffect, useState } from "react";
import "./showProducts.scss";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  deleteDoc,
  orderBy,
  increment,
  getDoc,
} from "firebase/firestore";
import Loading from "../../loading/loading";
import { db, auth, storage } from "../../lib/fireBase";
import { onAuthStateChanged } from "firebase/auth";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { formatOneDecimal } from "../../lib/numberFormat";
import { deleteImageIfUnreferenced } from "../../lib/storageCleanup";

function ShowProducts() {
  const [userId, setUserId] = useState("");
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchCategory, setSearchCategory] = useState("");
  const [searchName, setSearchName] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    sizes: [],
    colors: [],
    sellingPrice: "",
    salePercent: "",
    priceAfterSale: "",
    description: "",
    newArrival: false,
    imagePath: "",
    imageUrl: "",
  });
  const [newSize, setNewSize] = useState("");
  const [newColor, setNewColor] = useState("");
  const [newImage, setNewImage] = useState(null);
  const [showError, setShowError] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user?.uid) setUserId(user.uid);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) return;
    const fetchProducts = async () => {
      try {
        const q = query(
          collection(db, "users", userId, "products"),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        const items = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setProducts(items);
        setFiltered(items);
        const uniqueCats = [
          ...new Set(
            items.map((p) => p.category?.toLowerCase().trim()).filter(Boolean)
          ),
        ];
        setCategories(uniqueCats);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [userId]);

  useEffect(() => {
    const filteredList = products.filter((product) => {
      const matchCategory = searchCategory
        ? product.category?.toLowerCase().trim() === searchCategory
        : true;
      const matchName = searchName
        ? product.name?.toLowerCase().includes(searchName.toLowerCase())
        : true;
      return matchCategory && matchName;
    });
    setFiltered(filteredList);
  }, [searchCategory, searchName, products]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let updatedData = {
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    };
    if (name === "salePercent" || name === "sellingPrice") {
      const selling = parseFloat(updatedData.sellingPrice) || 0;
      const percent = parseFloat(updatedData.salePercent) || 0;
      if (selling > 0 && percent > 0) {
        updatedData.priceAfterSale = (
          selling -
          (selling * percent) / 100
        ).toFixed(1);
      } else {
        updatedData.priceAfterSale = "";
      }
    }
    setFormData(updatedData);
  };

  const handleEditClick = (index) => {
    setEditIndex(index);
    document.body.style.overflow = "hidden";
    const p = filtered[index];
    setFormData({
      name: p.name || "",
      category: p.category || "",
      sizes: p.sizes || [],
      colors: p.colors || [],
      sellingPrice: p.sellingPrice || "",
      salePercent: p.salePercent || "",
      priceAfterSale: p.priceAfterSale || "",
      description: p.description || "",
      newArrival: p.newArrival || false,
      imagePath: p.imagePath || "",
      imageUrl: p.imageUrl || "",
    });
    setNewImage(null);
    setShowError(false);
  };

  const addSize = () => {
    if (newSize.trim() && !formData.sizes.includes(newSize.trim())) {
      setFormData({ ...formData, sizes: [...formData.sizes, newSize.trim()] });
      setNewSize("");
    }
  };

  const removeSize = (size) => {
    setFormData({
      ...formData,
      sizes: formData.sizes.filter((s) => s !== size),
    });
  };

  const addColor = () => {
    if (newColor.trim() && !formData.colors.includes(newColor.trim())) {
      setFormData({ ...formData, colors: [...formData.colors, newColor.trim()] });
      setNewColor("");
    }
  };

  const removeColor = (color) => {
    setFormData({
      ...formData,
      colors: formData.colors.filter((c) => c !== color),
    });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteImageIfUnreferenced({
        db,
        storage,
        userId,
        imagePath: deleteTarget.imagePath,
        imageUrl: deleteTarget.imageUrl,
        excludeProductId: deleteTarget.id,
      });
      await deleteDoc(doc(db, "users", userId, "products", deleteTarget.id));
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        await updateDoc(userRef, {
          productCount: increment(-1),
        });
      } else {
        await updateDoc(userRef, { productCount: 0 });
      }
      const updatedList = products.filter((p) => p.id !== deleteTarget.id);
      setProducts(updatedList);
      setFiltered(updatedList);
    } catch (error) {
      console.error("Error deleting product:", error);
    }
    setDeleteTarget(null);
    document.body.style.overflow = "auto";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const {
      name,
      category,
      sizes,
      colors,
      sellingPrice,
      description,
      salePercent,
      priceAfterSale,
      newArrival,
    } = formData;
    if (!name || !category || !sellingPrice || !description) {
      setShowError("Fill all the required fields.");
      return;
    }
    if (colors.length === 0) {
      setShowError("Colours are required.");
      return;
    }
    const cleanedCategory = category.toLowerCase().trim();
    const productToEdit = filtered[editIndex];
    const productId = productToEdit?.id;
    if (!productId || !userId) return;
    try {
      const previousImagePath = formData.imagePath || "";
      const previousImageUrl = formData.imageUrl || "";
      let imageUrl = formData.imageUrl;
      let imagePath = formData.imagePath || "";
      if (newImage) {
        imagePath = `users/${userId}/products/${productId}`;
        const imgRef = ref(storage, imagePath);
        await uploadBytes(imgRef, newImage);
        imageUrl = await getDownloadURL(imgRef);
      }
      const productRef = doc(db, "users", userId, "products", productId);
      await updateDoc(productRef, {
        name,
        category: cleanedCategory,
        sizes: sizes.length > 0 ? sizes : [],
        colors: colors.length > 0 ? colors : [],
        sellingPrice,
        description,
        salePercent,
        priceAfterSale,
        newArrival,
        imagePath,
        imageUrl,
      });
      const updatedList = products.map((p) =>
        p.id === productId
          ? {
              ...formData,
              category: cleanedCategory,
              imagePath,
              imageUrl,
              id: productId,
            }
          : p
      );
      setProducts(updatedList);
      setFiltered(updatedList);
      if (newImage) {
        await deleteImageIfUnreferenced({
          db,
          storage,
          userId,
          imagePath: previousImagePath,
          imageUrl: previousImageUrl,
          excludeProductId: productId,
        });
      }
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 1500);
      setEditIndex(null);
      setShowError("");
      document.body.style.overflow = "auto";
    } catch (err) {
      console.error("Error updating product:", err);
    }
  };

  const handleCancel = () => {
    setEditIndex(null);
    setShowError("");
    document.body.style.overflow = "auto";
  };

  return (
    <div id="show-products-outer">
      <div id="show-product-inner">
        <div id="show-product-total">
          <h3>
            Total Products: <p>{filtered.length}</p>
          </h3>
          <h3>
            Total Categories: <p>{categories.length}</p>
          </h3>
        </div>
        <div id="show-products-search">
          <div id="search-by-category">
            <h4>Search by categories</h4>
            <select
              name="categories"
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
            >
              <option value="">All</option>
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div id="search-by-name">
            <h4>Search by name</h4>
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="Enter product name"
            />
          </div>
        </div>
        <div id="show-products-list">
          {loading ? (
            <Loading />
          ) : filtered.length === 0 ? (
            <div className="no-products">No products found.</div>
          ) : (
            filtered.map((product, index) => (
              <div id="show-product-card" key={product.id}>
                {product.newArrival && (
                  <span className="badge new-arrival">
                    <strong>New Arrival</strong>
                  </span>
                )}
                {product.imageUrl && (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    style={{
                      width: "100%",
                      height: "200px",
                      objectFit: "contain",
                    }}
                  />
                )}
                <p>
                  <strong>Name:</strong>{" "}
                  <span className="highlight">{product.name}</span>
                </p>
                <p>
                  <strong>Category:</strong>{" "}
                  <span className="highlight">{product.category}</span>
                </p>
                {product.sizes && product.sizes.length > 0 && (
                  <div className="sizes-list">
                    <strong>Sizes:</strong>
                    <div className="sizes-grid">
                      {product.sizes.map((s, idx) => (
                        <span
                          key={idx}
                          className="highlight"
                          style={{ marginRight: "5px" }}
                        >
                          {s},{" "}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {product.colors && product.colors.length > 0 && (
                  <div className="sizes-list">
                    <strong>Colours:</strong>
                    <div className="sizes-grid">
                      {product.colors.map((c, idx) => (
                        <span
                          key={idx}
                          className="highlight"
                          style={{ marginRight: "5px" }}
                        >
                          {c},{" "}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {product.salePercent > 0 ? (
                  <p>
                    <strong>Selling Price:</strong>{" "}
                    <span className="cut">{formatOneDecimal(product.sellingPrice)}</span>{" "}
                    <strong>Sale:</strong>{" "}
                    <span className="highlight">{formatOneDecimal(product.priceAfterSale)}</span>{" "}
                    (-{product.salePercent}%)
                  </p>
                ) : (
                  <p>
                    <strong>Selling Price:</strong>{" "}
                    <span className="highlight">{formatOneDecimal(product.sellingPrice)}</span>
                  </p>
                )}
                <p>
                  <strong>Description:</strong>{" "}
                  <span className="description-box">
                    {product.description || "No description"}
                  </span>
                </p>
                <div className="card-actions">
                  <button
                    id="show-pro-edit-btn"
                    onClick={() => handleEditClick(index)}
                  >
                    Edit
                  </button>
                  <button
                    id="show-pro-delete-btn"
                    onClick={() => {
                      setDeleteTarget(product);
                      document.body.style.overflow = "hidden";
                    }}
                    style={{
                      backgroundColor: "red",
                      border: "none",
                      color: "white",
                      outline: "none",
                      padding: "5px 10px",
                      borderRadius: "5px",
                      marginLeft: "10px",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        {editIndex !== null && (
          <div id="edit-overlay">
            <div id="show-pro-edit-form">
              <h2>Edit Product</h2>
              <form id="edit-product-form" onSubmit={handleSubmit}>
                {formData.imageUrl && (
                  <img
                    src={formData.imageUrl}
                    alt="preview"
                    style={{
                      width: "100%",
                      height: "200px",
                      objectFit: "contain",
                    }}
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewImage(e.target.files[0])}
                />
                <input
                  type="text"
                  name="name"
                  placeholder="Product Name"
                  value={formData.name}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  name="category"
                  placeholder="Category"
                  value={formData.category}
                  onChange={handleChange}
                  list="category-options"
                />
                <datalist id="category-options">
                  {categories.map((cat, idx) => (
                    <option key={idx} value={cat} />
                  ))}
                </datalist>
                <div className="sizes-input">
                  <input
                    type="text"
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value)}
                    placeholder="Add Size"
                  />
                  <button type="button" onClick={addSize}>
                    Add
                  </button>
                </div>
                <div className="sizes-grid">
                  {formData.sizes.map((s, idx) => (
                    <span key={idx} className="size-chip">
                      {s}
                      <button type="button" onClick={() => removeSize(s)}>
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="sizes-input">
                  <input
                    type="text"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    placeholder="Add Colour required"
                  />
                  <button type="button" onClick={addColor}>
                    Add
                  </button>
                </div>
                <div className="sizes-grid">
                  {formData.colors.map((c, idx) => (
                    <span key={idx} className="size-chip">
                      {c}
                      <button type="button" onClick={() => removeColor(c)}>
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="number"
                  name="sellingPrice"
                  placeholder="Selling Price"
                  value={formData.sellingPrice}
                  onChange={handleChange}
                />
                <input
                  type="number"
                  name="salePercent"
                  placeholder="Discount Percent (%)"
                  value={formData.salePercent}
                  onChange={handleChange}
                />
                <input
                  type="number"
                  name="priceAfterSale"
                  placeholder="Price After Sale"
                  value={formData.priceAfterSale}
                  readOnly
                />
                <label>
                  <input
                    type="checkbox"
                    name="newArrival"
                    checked={formData.newArrival}
                    onChange={handleChange}
                  />
                  Mark as New Arrival
                </label>
                <input
                  type="text"
                  name="description"
                  placeholder="Product Description"
                  value={formData.description}
                  onChange={handleChange}
                />
                {showError && <p className="form-error">{showError}</p>}
                <button type="submit">Save Changes</button>
                <button
                  type="button"
                  onClick={handleCancel}
                  style={{ marginTop: "10px" }}
                >
                  Cancel
                </button>
              </form>
            </div>
          </div>
        )}
        {deleteTarget && (
          <div className="overlay">
            <div className="delete-confirm-box">
              <h3>Confirm Delete</h3>
              <p>
                Are you sure you want to delete{" "}
                <strong>{deleteTarget.name}</strong>?
              </p>
              <div className="confirm-actions" style={{ marginTop: "10px" }}>
                <button
                  onClick={confirmDelete}
                  style={{
                    backgroundColor: "red",
                    border: "none",
                    color: "white",
                    outline: "none",
                    padding: "5px 10px",
                    borderRadius: "5px",
                    marginRight: "10px",
                  }}
                >
                  Yes
                </button>
                <button
                  onClick={() => {
                    setDeleteTarget(null);
                    document.body.style.overflow = "auto";
                  }}
                  style={{
                    backgroundColor: "gray",
                    border: "none",
                    color: "white",
                    outline: "none",
                    padding: "5px 10px",
                    borderRadius: "5px",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        {showNotification && (
          <div id="add-pro-notification" role="status" aria-live="polite">
            Product updated successfully
          </div>
        )}
      </div>
    </div>
  );
}
export default ShowProducts;
