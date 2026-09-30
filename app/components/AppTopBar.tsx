"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const INTERNAL_ROUTE_PREFIXES = [
  "/dashboard",
  "/login",
  "/privacy-policy",
  "/shopsetup",
  "/add",
  "/charges",
  "/orders",
  "/previousReport",
  "/editShopSetup",
  "/ShowProducts",
];

const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.abdullahfds.firebaseapp";

const isPrimaryAppHost = () => {
  if (typeof window === "undefined") return false;

  const hostname = window.location.hostname.toLowerCase();
  const allowedHosts = new Set([
    "gharsadukan.com",
    "www.gharsadukan.com",
    "localhost",
    "127.0.0.1",
  ]);

  return allowedHosts.has(hostname);
};

const shouldShowChrome = (pathname: string | null) => {
  if (!pathname) return true;

  if (pathname === "/") return true;

  return INTERNAL_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
};

export default function AppTopBar() {
  const pathname = usePathname();

  // Show the global top bar only on primary app hosts.
  if (!isPrimaryAppHost()) {
    return null;
  }

  if (!shouldShowChrome(pathname)) {
    return null;
  }

  return (
    <header className="app-topbar">
      <div className="app-topbar__brand">
        <Image
          src="/logo.webp"
          alt="GharSaDukan Logo"
          width={40}
          height={40}
          className="app-topbar__logo"
        />
        <span className="app-topbar__name">
          GharSa<span>Dukan</span>
        </span>
      </div>
      <nav className="app-topbar__actions">
        <Link
          href={PLAY_STORE_URL}
          className="app-topbar__btn app-topbar__btn--primary"
          target="_blank"
          rel="noreferrer"
        >
          Download from playstore
        </Link>
      </nav>
    </header>
  );
}