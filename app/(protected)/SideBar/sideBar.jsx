"use client";
import React, { useState, useEffect } from "react";
import {
  Dashboard as DashboardIcon,
  AddBox as AddBoxIcon,
  ViewList as ViewListIcon,
  ReceiptLong as ReceiptLongIcon,
  Logout as LogoutIcon,
  ClearAll as ClearAllIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AppRegistrationIcon from "@mui/icons-material/AppRegistration";
import { useRouter, usePathname } from "next/navigation";
import "./style.scss";

import { auth, db } from "../../lib/fireBase";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const [showOptions, setShowOptions] = useState(
    typeof window !== "undefined" ? window.innerWidth > 1000 : true
  );
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 1000 : false
  );
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [shopInfo, setShopInfo] = useState({ shopName: "" });

  const mainMenuItems = [
    { label: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    { label: "Add products", icon: <AddBoxIcon />, path: "/add" },
    { label: "Show products", icon: <ViewListIcon />, path: "/ShowProducts" },
    { label: "Orders", icon: <AttachMoneyIcon />, path: "/orders" },
    {
      label: "Previous report",
      icon: <ReceiptLongIcon />,
      path: "/previousReport",
    },
    {
      label: "Edit shop setup",
      icon: <AppRegistrationIcon />,
      path: "/editShopSetup",
    },
  ];

  const applySidebarStyles = (show) => {
    const sidebar = document.getElementById("sidebar_fully_outer");
    const mainBody = document.getElementById("main-second-body");

    if (!sidebar || !mainBody) return;

    if (show) {
      sidebar.style.zIndex = "1";
      sidebar.style.left = "0";
      mainBody.style.zIndex = "0";
      mainBody.style.height = "80%";
    } else {
      sidebar.style.zIndex = "0";
      sidebar.style.left = "5%";
      mainBody.style.zIndex = "1";
      mainBody.style.height = "97%";
    }
  };

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 1000;
      setIsMobile(mobile);
      setShowOptions(!mobile);
      applySidebarStyles(!mobile);
    };

    window.addEventListener("resize", handleResize);

    const fetchShopInfo = async () => {
      if (auth.currentUser) {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          setShopInfo({ shopName: data.shopInfo?.shopName || "" });
        } else {
          setShopInfo({ shopName: "" });
        }
      }
    };

    fetchShopInfo();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleOptions = () => {
    const newShow = !showOptions;
    setShowOptions(newShow);
    applySidebarStyles(newShow);
  };

  const handleNavigation = (path) => {
    router.push(path);
    if (isMobile) {
      setShowOptions(false);
      applySidebarStyles(false);
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    signOut(auth)
      .then(() => {
        localStorage.removeItem("isAuthenticated");
        router.push("/login");
        setShowLogoutConfirm(false);
      })
      .catch((error) => {
        console.error("Error signing out: ", error);
      });
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <div id="sidebar_fully_outer">
      <div id="sidebar_inner">
        <div id="more-options-btn" onClick={toggleOptions}>
          {showOptions ? <CloseIcon /> : <ClearAllIcon />}
        </div>

        {showOptions && (
          <>
            <div id="main-heading">
              <p id="dashboard-shop-name">
                <strong>{shopInfo.shopName}</strong>
              </p>
            </div>

            <div id="options">
              <ul>
                {mainMenuItems.map((item, index) => (
                  <li
                    key={index}
                    className={pathname === item.path ? "active-option" : ""}
                    onClick={() => handleNavigation(item.path)}
                  >
                    <div id="icon">{item.icon}</div>
                    <p>{item.label}</p>
                  </li>
                ))}
                <li onClick={handleLogoutClick}>
                  <div id="icon">
                    <LogoutIcon />
                  </div>
                  <p>Logout</p>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>

      {showLogoutConfirm && (
        <div id="logout-confirm-overlay">
          <div className="logout-dialog">
            <h3>Are you sure you want to logout?</h3>
            <div className="logout-buttons">
              <button
                onClick={confirmLogout}
                style={{ backgroundColor: "red", color: "white" }}
              >
                Logout
              </button>
              <button onClick={cancelLogout}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sidebar;
