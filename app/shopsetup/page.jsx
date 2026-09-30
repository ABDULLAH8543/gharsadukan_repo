"use client";
import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, updateDoc, getDoc, deleteField } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { auth, db } from "../lib/fireBase";
import { isShopNameTaken, normalizeShopSlug } from "../lib/shopSlug";
import "./shopSetupForm.scss";
export default function Page() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    name: "",
    shopName: "",
    contact: "+92",
    email: "",
    city: "",
    address: "",
    deliveryCharges: "",
    facebook: "",
    tiktok: "",
    instagram: "",
    whatsapp: "",
  });
  const [contactError, setContactError] = useState("");
  const [shopNameError, setShopNameError] = useState("");
  const router = useRouter();

  useEffect(() => {
    let active = true;

    const checkShopName = async () => {
      const name = form.shopName.trim();

      if (!user || !name) {
        if (active) setShopNameError("");
        return;
      }

      const taken = await isShopNameTaken(db, name, user.uid);
      if (active) {
        setShopNameError(
          taken ? "This shop name is already taken by another user." : ""
        );
      }
    };

    const timeoutId = setTimeout(checkShopName, 350);

    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, [form.shopName, user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const userRef = doc(db, "users", firebaseUser.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists() && docSnap.data().shopInfo) {
          router.push("/dashboard");
        } else {
          setForm((prev) => ({
            ...prev,
            name: firebaseUser.displayName,
            email: firebaseUser.email,
            contact: "+92",
          }));
        }
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const validateContact = (contact) => {
    return /^\+92\d{10}$/.test(contact);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateContact(form.contact)) {
      setContactError("Write correct number");
      return;
    }
    if (await isShopNameTaken(db, form.shopName, user?.uid)) {
      setShopNameError("This shop name is already taken by another user.");
      return;
    }
    setContactError("");
    try {
      const today = new Date();
      const setupDate = `${today.getFullYear()}-${String(
        today.getMonth() + 1
      ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        shopInfo: {
          ...form,
          shopSlug: normalizeShopSlug(form.shopName),
          setupDate,
        },
        "shopInfo.shopNameSlug": deleteField(),
      });
      router.push("/dashboard");
    } catch (err) {
      console.error("Error saving shop info", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "contact") {
      if (
        value.startsWith("+92") &&
        value.length <= 13 &&
        /^\+92\d*$/.test(value)
      ) {
        setForm((prev) => ({ ...prev, contact: value }));
      }
      if (value === "") {
        setForm((prev) => ({ ...prev, contact: "+92" }));
      }
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div id="shop-setup-form-outer">
      <div className="shop-set-form">
        <h2>Complete Your Shop Profile</h2>
        <form onSubmit={handleSubmit}>
          <label>Your Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <label>Shop Name</label>
          <input
            type="text"
            name="shopName"
            value={form.shopName}
            onChange={handleChange}
            required
          />
          {shopNameError && <p className="error-msg">{shopNameError}</p>}
          <label>Contact Number</label>
          <input
            type="text"
            name="contact"
            value={form.contact}
            onChange={handleChange}
            onFocus={() => {
              if (!form.contact.startsWith("+92")) {
                setForm((prev) => ({ ...prev, contact: "+92" }));
              }
            }}
            required
          />
          {contactError && <p className="error-msg">{contactError}</p>}
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <label>City</label>
          <input
            type="text"
            name="city"
            value={form.city}
            onChange={handleChange}
            required
          />
          <label>Shop Address (Optional)</label>
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Enter shop address if you want to show it publicly"
          />
          <label>Delivery Charges (Optional)</label>
          <input
            type="number"
            name="deliveryCharges"
            value={form.deliveryCharges}
            onChange={handleChange}
            min={0}
            placeholder="Enter delivery charges"
          />
          <label>Facebook Link (Optional)</label>
          <input
            type="url"
            name="facebook"
            value={form.facebook}
            onChange={handleChange}
            placeholder="https://facebook.com/yourpage"
          />
          <label>TikTok Link (Optional)</label>
          <input
            type="url"
            name="tiktok"
            value={form.tiktok}
            onChange={handleChange}
            placeholder="https://tiktok.com/@yourpage"
          />
          <label>Instagram Link (Optional)</label>
          <input
            type="url"
            name="instagram"
            value={form.instagram}
            onChange={handleChange}
            placeholder="https://instagram.com/yourpage"
          />
          <label>WhatsApp Number or Link (Optional)</label>
          <input
            type="text"
            name="whatsapp"
            value={form.whatsapp}
            onChange={handleChange}
            placeholder="+923001234567 or https://wa.me/923001234567"
          />
          <button className="submit-btn" type="submit">
            Save and Continue
          </button>
        </form>
      </div>
    </div>
  );
}