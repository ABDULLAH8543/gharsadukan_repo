"use client";
import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import Image from "next/image";
import { db, auth, storage } from "../../lib/fireBase";
import Loading from "../../loading/loading";
import { formatOneDecimal } from "../../lib/numberFormat";
import { deleteImageIfUnreferenced } from "../../lib/storageCleanup";
import "./previousReport.scss";

export default function Page() {
  const [invoices, setInvoices] = useState({});
  const [loading, setLoading] = useState(true);
  const VISIBLE_REPORT_DAYS = 7;
  const DELETE_REPORT_AFTER_DAYS = 30;

  const getDiffDays = (d1, d2) => {
    const date1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate());
    const date2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate());
    return Math.floor((date1 - date2) / (1000 * 60 * 60 * 24));
  };

  useEffect(() => {
    const fetchInvoices = async () => {
      if (!auth.currentUser) return;
      const userId = auth.currentUser.uid;
      const invoiceRef = collection(db, "users", userId, "soldInvoices");
      const snapshot = await getDocs(invoiceRef);

      const today = new Date();
      const grouped = {};

      for (const snap of snapshot.docs) {
        const data = snap.data();
        if (!data.doneAt) continue;

        let date;
        if (typeof data.doneAt.toDate === "function") {
          date = data.doneAt.toDate();
        } else {
          date = new Date(data.doneAt);
        }

        const diffDays = getDiffDays(today, date);

        if (diffDays > DELETE_REPORT_AFTER_DAYS) {
          const uniqueImageRefs = new Map();

          // New invoices store image refs in each item.
          (data.items || []).forEach((item) => {
            const key = item?.imagePath || item?.imageUrl;
            if (!key) return;
            uniqueImageRefs.set(key, {
              imagePath: item?.imagePath || null,
              imageUrl: item?.imageUrl || null,
            });
          });

          // Backward compatibility for any legacy invoice-level image fields.
          if (data.imagePath || data.imageUrl) {
            const key = data.imagePath || data.imageUrl;
            uniqueImageRefs.set(key, {
              imagePath: data.imagePath || null,
              imageUrl: data.imageUrl || null,
            });
          }

          await Promise.all(
            Array.from(uniqueImageRefs.values()).map((imgRef) =>
              deleteImageIfUnreferenced({
                db,
                storage,
                userId,
                imagePath: imgRef.imagePath,
                imageUrl: imgRef.imageUrl,
                excludeInvoiceId: snap.id,
              })
            )
          );

          await deleteDoc(doc(db, "users", userId, "soldInvoices", snap.id));
          continue;
        }

        if (diffDays > VISIBLE_REPORT_DAYS) {
          continue;
        }

        const dateKey = date.toISOString().split("T")[0];
        if (!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey].push({
          id: snap.id,
          ...data,
          doneAt: date,
        });
      }

      for (const key in grouped) {
        grouped[key].sort((a, b) => b.doneAt - a.doneAt);
      }

      setInvoices(grouped);
      setLoading(false);
    };

    fetchInvoices();
  }, []);

  if (loading) {
    return (
      <div className="prevrep-loading">
        <Loading />
      </div>
    );
  }

  const dateKeys = Object.keys(invoices).sort((a, b) => new Date(b) - new Date(a));

  return (
    <div className="prevrep-container">
      <h1 className="prevrep-title">Previous Reports</h1>
      {dateKeys.length === 0 ? (
        <p className="prevrep-empty">No reports available.</p>
      ) : (
        dateKeys.map((dateKey) => (
          <section key={dateKey} className="prevrep-day">
            <h2 className="prevrep-day__heading">{dateKey}</h2>
            <div className="prevrep-grid">
              {invoices[dateKey].map((invoice) => (
                <article key={invoice.id} className="prevrep-card">
                  <div className="prevrep-card__row">
                    <span className="prevrep-label">Customer</span>
                    <span className="prevrep-value">{invoice.customerName || "-"}</span>
                  </div>
                  <div className="prevrep-card__row prevrep-total">
                    <span className="prevrep-label">Total</span>
                    <span className="prevrep-value">Rs {formatOneDecimal(invoice.total)}</span>
                  </div>
                  <div className="prevrep-items">
                    <div className="prevrep-items__title">Items</div>
                    <div className="prevrep-items__list">
                      {invoice.items?.map((item, idx) => {
                        const quantity = item.qty ?? item.quantity ?? "-";
                        const price = item.finalPrice ?? item.total ?? "0";
                        return (
                          <div key={idx} className="prevrep-item">
                            {item.imageUrl && (
                              <Image src={item.imageUrl} alt={item.name || "Product"} className="prevrep-item__img" width={60} height={60} unoptimized />
                            )}
                            <div className="prevrep-item__details">
                              <div className="prevrep-item__name">{item.name}</div>
                              <div className="prevrep-item__meta">
                                <span>x{quantity}</span>
                                {item.size && <span>Size: {item.size}</span>}
                                {item.color && <span>Color: {item.color}</span>}
                                <span>Rs {formatOneDecimal(price)}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}