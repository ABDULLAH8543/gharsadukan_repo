import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppTopBar from "./components/AppTopBar";
import AppFooter from "./components/AppFooter";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GharSaDukan",
  description: "GharSaDukan",
  alternates: {
    canonical: "https://www.gharsadukan.com",
  },
  verification: {
    google: "Y-X4Z4db2ynoahYazyY6B9eAhO3-Hh2Xoq0aKjQzUZI",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.webp" />
        <link rel="apple-touch-icon" href="/logo.webp" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <div className="app-shell">
          <AppTopBar />
          <main className="app-content">{children}</main>
          <AppFooter />
        </div>
      </body>
    </html>
  );
}
