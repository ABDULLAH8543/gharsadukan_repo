import { collection, getDocs, query, where } from "firebase/firestore";

export const normalizeShopSlug = (value = "") => {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export const isShopNameTaken = async (db, shopName, currentUserId = null) => {
  const normalizedSlug = normalizeShopSlug(shopName);

  if (!normalizedSlug) {
    return false;
  }

  const slugQuery = query(
    collection(db, "users"),
    where("shopInfo.shopSlug", "==", normalizedSlug)
  );
  const slugSnap = await getDocs(slugQuery);

  if (slugSnap.docs.some((docSnap) => docSnap.id !== currentUserId)) {
    return true;
  }

  const usersSnap = await getDocs(collection(db, "users"));
  return usersSnap.docs.some((docSnap) => {
    if (docSnap.id === currentUserId) {
      return false;
    }

    const shopInfo = docSnap.data().shopInfo || {};
    const existingSlug = normalizeShopSlug(shopInfo.shopSlug || shopInfo.shopName || "");
    return existingSlug === normalizedSlug;
  });
};