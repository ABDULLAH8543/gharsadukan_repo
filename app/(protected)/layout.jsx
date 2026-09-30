"use client";
import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../lib/fireBase";
import { doc, getDoc } from "firebase/firestore";
import Loading from "../loading/loading";
import Sidebar from "../(protected)/SideBar/sideBar.jsx";
import { useRouter, usePathname } from "next/navigation";

export default function ProtectedLayout({ children }) {
  const [loading, setLoading] = useState(true);
  const [redirectToSetup, setRedirectToSetup] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(userRef);

          if (!docSnap.exists() || !docSnap.data().shopInfo) {
            setRedirectToSetup(true);
          } else {
            setRedirectToSetup(false);
          }
        } catch (error) {
          console.error("Error fetching user:", error);
          setRedirectToSetup(false);
        }
      } else {
        router.replace("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!loading) {
      if (redirectToSetup && pathname !== "/shopsetup") {
        router.replace("/shopsetup");
      } else if (!redirectToSetup && pathname === "/shopsetup") {
        router.replace("/");
      }
    }
  }, [loading, redirectToSetup, pathname, router]);

  if (loading) return <Loading />;

  return (
    <>
      <div id="side-bar" style={{ display: "flex" }}>
        <Sidebar />
        <div id="main-second-body" style={{ flex: 1 }}>
          {children}
        </div>
      </div>
    </>
  );
}
