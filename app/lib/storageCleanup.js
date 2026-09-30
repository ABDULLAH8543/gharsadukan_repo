import { collection, getDocs } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";

const getCandidateKeys = (record = {}) => {
  return [...new Set([record.imagePath, record.imageUrl].filter(Boolean))];
};

const invoiceUsesImage = (invoice = {}, candidateKeys = []) => {
  return invoice.items?.some((item) => {
    const itemKeys = getCandidateKeys(item);
    return itemKeys.some((key) => candidateKeys.includes(key));
  });
};

export const isImageReferencedByUserData = async ({
  db,
  userId,
  imagePath,
  imageUrl,
  excludeProductId,
  excludeInvoiceId,
}) => {
  const candidateKeys = [...new Set([imagePath, imageUrl].filter(Boolean))];

  if (candidateKeys.length === 0) {
    return false;
  }

  const [productSnap, invoiceSnap] = await Promise.all([
    getDocs(collection(db, "users", userId, "products")),
    getDocs(collection(db, "users", userId, "soldInvoices")),
  ]);

  for (const snap of productSnap.docs) {
    if (excludeProductId && snap.id === excludeProductId) continue;
    const data = snap.data();
    const recordKeys = getCandidateKeys(data);
    if (recordKeys.some((key) => candidateKeys.includes(key))) {
      return true;
    }
  }

  for (const snap of invoiceSnap.docs) {
    if (excludeInvoiceId && snap.id === excludeInvoiceId) continue;
    const data = snap.data();
    if (invoiceUsesImage(data, candidateKeys)) {
      return true;
    }
  }

  return false;
};

export const deleteImageIfUnreferenced = async ({
  db,
  storage,
  userId,
  imagePath,
  imageUrl,
  excludeProductId,
  excludeInvoiceId,
}) => {
  const candidate = imagePath || imageUrl;
  if (!candidate || !storage) return false;

  const isReferenced = await isImageReferencedByUserData({
    db,
    userId,
    imagePath,
    imageUrl,
    excludeProductId,
    excludeInvoiceId,
  });

  if (isReferenced) {
    return false;
  }

  await deleteObject(ref(storage, candidate)).catch(() => {});
  return true;
};