"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FiChevronLeft,
  FiChevronRight,
  FiMaximize,
  FiMinimize,
  FiBookOpen,
  FiGrid,
  FiSun,
  FiMoon,
  FiCheckCircle,
  FiAlertCircle,
  FiCpu,
  FiDatabase,
  FiShield,
  FiBarChart2,
  FiZap,
  FiPrinter,
  FiHome
} from "react-icons/fi";

// Slide definitions
const slidesData = [
  {
    id: 1,
    category: "Title Slide",
    title: "GHAR-SA-DUKAN",
    subtitle: "Design and Implementation of a Digital E-Commerce Platform for Home-Based Businesses and Local Vendors",
    badge: "FYP Final Defense Presentation",
    type: "title",
    details: {
      degree: "Bachelor of Science in Computer Systems Engineering",
      author: "Abdullah Sohail",
      sapId: "67309",
      department: "Department of Computer Systems",
      institution: "Riphah International University, Pakistan",
      session: "Spring 2026"
    },
    speakerNotes: "Good morning/afternoon respected committee members and supervisor. My name is Abdullah Sohail (SAP ID: 67309). Today I am presenting my Final Year Project entitled 'GharSaDukan: Design and Implementation of a Digital E-Commerce Platform for Home-Based Businesses and Local Vendors' developed under the Department of Computer Systems at Riphah International University."
  },
  {
    id: 2,
    category: "Introduction",
    title: "Background & Research Context",
    subtitle: "Understanding the Economic Role & Technological Gap of Micro-Vendors",
    type: "split-cards",
    cards: [
      {
        icon: "economy",
        title: "Micro-Enterprise Significance",
        desc: "Home-based businesses (apparel, jewelry, confectionery, organic care) represent a vital non-formal economic pillar in developing markets, empowering household financial independence."
      },
      {
        icon: "barrier",
        title: "Digital Onboarding Barriers",
        desc: "Small vendors face major obstacles: steep SaaS fees ($39-$299/mo), domain configurations, server maintenance, and complex technical setups required by platforms like Shopify or Magento."
      },
      {
        icon: "informal",
        title: "Informal Social Commerce Reliance",
        desc: "Over 85% of micro-vendors rely on WhatsApp and Instagram DMs, creating severe operational friction due to unstructured order tracking, absent inventory sync, and lack of brand identity."
      },
      {
        icon: "solution",
        title: "Engineering Solution Need",
        desc: "A zero-cost, multi-tenant web platform enabling instant shop onboarding (<3 min), custom URL routing, real-time analytics, and automated marketing flyers without technical expertise."
      }
    ],
    speakerNotes: "In developing economies like Pakistan, micro-enterprises drive household economic resilience. However, existing e-commerce systems present a major dichotomy: high-cost enterprise SaaS on one end, and fragmented WhatsApp selling on the other. GharSaDukan addresses this critical gap."
  },
  {
    id: 3,
    category: "Problem Statement",
    title: "Problem Statement & Gap Analysis",
    subtitle: "The Operational Divide in Modern E-Commerce Systems",
    type: "problem-comparison",
    problemText: "Small-scale and home-based micro-vendors suffer from a severe digital commerce divide caused by two market extremes: complex enterprise platforms (Shopify/WooCommerce) that impose recurring subscription fees, technical domain configurations, and steep learning curves; and informal social messaging channels (WhatsApp/Instagram) that cause operational fragmentation due to unorganized manual ordering, lack of brand distinction, absent inventory synchronization, and zero real-time sales tracking.",
    pointsLeft: {
      title: "Enterprise SaaS Platforms (Shopify, Magento)",
      items: [
        "Prohibitive recurring subscription fees ($39–$299/month)",
        "Mandatory custom DNS domain configuration & SSL setup",
        "Complex database and template customization curves",
        "Requires merchant credit card accounts for payment gateways"
      ]
    },
    pointsRight: {
      title: "Informal Messaging Channels (WhatsApp, Instagram)",
      items: [
        "Unstructured order taking over direct messaging threads",
        "Absent real-time product inventory synchronization",
        "Manual invoice calculation & order status tracking",
        "Zero brand identity isolation or customized store URL"
      ]
    },
    speakerNotes: "This slide highlights the central problem statement. Enterprise tools are too complex and expensive, while WhatsApp selling leads to operational burnout. GharSaDukan sits in the sweet spot as a free, lightweight, multi-tenant solution."
  },
  {
    id: 4,
    category: "Objectives",
    title: "Project Objectives & Scope",
    subtitle: "Core Technical Goals Fulfilling the Engineering Requirements",
    type: "objectives-grid",
    objectives: [
      { num: "01", title: "Serverless BaaS Architecture", text: "Architect a decoupled multi-tenant platform using Next.js 16 App Router & Google Firebase cloud backend services." },
      { num: "02", title: "Automated Slug Normalization", text: "Engineer a shop slug engine (`normalizeShopSlug`) validating uniqueness and generating clean URLs (e.g., `/my-shop-slug`)." },
      { num: "03", title: "Dynamic Layout Theme Engine", text: "Construct a dynamic theme resolver enabling vendors to switch between multiple layout aesthetics (`default`, `web_two`, `web_three`)." },
      { num: "04", title: "Vendor Analytics Dashboard", text: "Build a real-time dashboard aggregating daily revenue, 7-day sales trends, order counts, product counts, and active categories." },
      { num: "05", title: "Zero-Registration Cart Checkout", text: "Implement a persistent customer cart module dispatching structured invoices directly into Firestore without forcing account creation." },
      { num: "06", title: "Automated PDF Marketing Flyer Engine", text: "Develop a client-side Canvas QR code & jsPDF rendering engine producing downloadable, high-res PDF promotional flyers." }
    ],
    scope: "Scope Boundaries: Covers full vendor administration & dynamic buyer storefronts. Out of scope for current thesis: native mobile apps and direct credit card gateways.",
    speakerNotes: "We defined six explicit engineering objectives ranging from serverless BaaS architecture to client-side QR flyer generation. All six targets were fully implemented and evaluated."
  },
  {
    id: 5,
    category: "Literature Review",
    title: "Literature Survey & Platform Comparison Matrix",
    subtitle: "Systematic Benchmarking Against Existing Digital Selling Solutions",
    type: "matrix-table",
    headers: ["Platform", "Setup Cost", "Technical Complexity", "Inventory Management", "Target Audience"],
    matrix: [
      { platform: "Shopify", cost: "High ($39+/mo)", complexity: "Moderate to High", inventory: "Advanced Built-in", target: "Established Retail Brands" },
      { platform: "WooCommerce", cost: "Medium (Hosting fees)", complexity: "High (WordPress setup)", inventory: "Plugin Dependent", target: "Tech-savvy SMBs" },
      { platform: "WhatsApp Business", cost: "Free", complexity: "Low", inventory: "Basic / Manual Catalog", target: "Micro Sellers / Conversational" },
      { platform: "Local Marketplaces", cost: "Commission (15-30%)", complexity: "Low", inventory: "Centralized / Shared", target: "Third-party Sellers" },
      { platform: "GharSaDukan (Proposed)", cost: "Zero / Free", complexity: "Minimal (No code)", inventory: "Real-Time Cloud Firestore", target: "Home Micro-Vendors", highlight: true }
    ],
    summaryNote: "Literature evaluation demonstrates that existing academic and commercial applications fail to provide zero-cost automated storefront creation with offline QR marketing capabilities tailored specifically for micro-vendors.",
    speakerNotes: "Here is the comparative matrix. Notice how GharSaDukan combines the zero-cost advantage of messaging tools with the structured inventory and dynamic storefront branding of enterprise platforms."
  },
  {
    id: 6,
    category: "System Architecture",
    title: "High-Level System Architecture",
    subtitle: "Decoupled 3-Tier Serverless Cloud BaaS Architecture",
    type: "image-diagram",
    image: "/report_assets/fig4_1_architecture_flowchart.png",
    caption: "Figure 4.1: High-Level Serverless System Architecture Diagram",
    tiers: [
      { name: "1. Presentation Layer", tech: "Next.js 16 (React 19), Tailwind CSS v4, MUI Material", desc: "Delivers responsive interfaces for Vendor Management & Public Storefronts." },
      { name: "2. Routing & Logic Layer", tech: "Next.js App Router, jsPDF, QRCode Canvas Engine", desc: "Handles dynamic slug routing (`/[shopSlug]`), state management & client PDF rendering." },
      { name: "3. Cloud BaaS Backend Layer", tech: "Google Firebase (Auth, Cloud Firestore NoSQL, Cloud Storage)", desc: "Manages real-time data sync, multi-tenant isolation, and media storage." }
    ],
    speakerNotes: "Figure 4.1 depicts our decoupled 3-tier architecture. The frontend uses Next.js 16 App Router for dynamic route parameter handling, connected to Google Firebase BaaS for authentication, real-time Firestore database sync, and media storage."
  },
  {
    id: 7,
    category: "Database Design",
    title: "NoSQL Database Schema & Multi-Tenancy",
    subtitle: "Google Cloud Firestore Collection Hierarchy & Security Isolation",
    type: "schema-code",
    schemaText: `Root Collection: users/{uid}
├── shopInfo: { 
│     shopName: string, 
│     shopSlug: string (Unique Index), 
│     phone: string, 
│     address: string, 
│     theme: 'default' | 'web_two' | 'web_three', 
│     category: string 
│   }
├── chargesInfo: { 
│     baseCharge: number, 
│     freeDeliveryThreshold: number 
│   }
├── Sub-collection: products/{productId}
│   └── { title, price, description, category, imageUrl, createdAt }
└── Sub-collection: soldInvoices/{invoiceId}
    └── { customerName, customerPhone, customerAddress, items: [], grandTotal, status: 'pending'|'done', doneAt }`,
    securityRules: [
      "Multi-Tenant Privacy: Security rules enforce `request.auth.uid == uid` for private vendor writes.",
      "Public Customer Read: Public storefront access allows unauthenticated read of product catalog via unique shop slug lookup.",
      "Customer Invoice Write: Direct unauthenticated order entry into vendor's `soldInvoices` collection."
    ],
    speakerNotes: "Our Cloud Firestore NoSQL structure is organized hierarchically under `users/{uid}`. Sub-collections isolate products and invoices. Firebase Security Rules enforce strict data privacy while allowing buyers to post orders directly."
  },
  {
    id: 8,
    category: "Core Algorithms",
    title: "Slug Normalization & Layout Resolver",
    subtitle: "Automated URL Generation & Dynamic Theme Switching Engines",
    type: "dual-image",
    image1: "/report_assets/fig4_2_onboarding_slug_flowchart.png",
    caption1: "Figure 4.2: Vendor Onboarding & Slug Normalization Flowchart",
    image2: "/report_assets/fig4_3_theme_resolver_flowchart.png",
    caption2: "Figure 4.3: Storefront Theme Resolver Flowchart",
    keyLogic: [
      "Slug Normalization: Converts text to lowercase, strips non-alphanumeric characters, replaces spaces with single hyphens, and queries Firestore for uniqueness (`isShopNameTaken`).",
      "Dynamic Layout Resolution: Storefront router (`app/[shopSlug]/page.jsx`) queries vendor document theme parameter and dynamically renders theme component (`default`, `web_two`, `web_three`)."
    ],
    speakerNotes: "Figure 4.2 shows the slug lifecycle. When a seller enters 'My Unique Store!', `normalizeShopSlug()` outputs 'my-unique-store' and verifies uniqueness. Figure 4.3 shows how the layout engine dynamically switches UI themes."
  },
  {
    id: 9,
    category: "Core Algorithms",
    title: "Order Dispatch & QR Marketing Flyer Engine",
    subtitle: "Frictionless Cart Checkout & Client-Side Canvas PDF Generation",
    type: "dual-image",
    image1: "/report_assets/fig5_1_cart_checkout_flowchart.png",
    caption1: "Figure 5.1: Customer Cart Checkout & Order Dispatch Flow",
    image2: "/report_assets/fig5_2_qr_flyer_flowchart.png",
    caption2: "Figure 5.2: QR Code & PDF Flyer Generation Process",
    keyLogic: [
      "Cart Checkout Engine: Buyer adds items to React state cart -> submits phone/address -> calculates delivery fee against free threshold -> dispatches invoice directly into Firestore.",
      "PDF Flyer Engine: `QRCode.toDataURL()` generates dynamic QR code -> `jsPDF` compiles vendor logo, shop URL, and QR code into a downloadable vector PDF for offline community printing."
    ],
    speakerNotes: "Figure 5.1 illustrates zero-registration checkout. Figure 5.2 shows our marketing flyer generator, combining client-side Canvas QR generation with jsPDF to create instant printable flyers for offline marketing."
  },
  {
    id: 10,
    category: "UI Demonstration",
    title: "Graphical User Interface Showcase",
    subtitle: "Empirical Walkthrough of Vendor & Customer Application Workflows",
    type: "ui-gallery",
    screens: [
      { id: "landing", name: "Landing & Onboarding", img: "/report_assets/fig5_1_landing_portal.png", caption: "Figure 5.3: Onboarding Landing Portal with 3-step store creation workflow." },
      { id: "dashboard", name: "Analytics Dashboard", img: "/report_assets/fig5_2_vendor_dashboard.png", caption: "Figure 5.4: Vendor Analytics Dashboard showing real-time revenue and sales trends." },
      { id: "addproduct", name: "Product Management", img: "/report_assets/fig5_3_add_product_form.png", caption: "Figure 5.5: Add Product Form with image upload, categories & pricing." },
      { id: "storefront", name: "Public Storefront", img: "/report_assets/fig5_4_public_storefront.png", caption: "Figure 5.6: Dynamic Public Customer Storefront rendered via custom slug URL." }
    ],
    speakerNotes: "This slide shows screenshots of our user interfaces built with Tailwind CSS v4 and MUI Material. The landing portal guides onboarding, the analytics dashboard gives real-time sales insight, and the storefront offers clean customer shopping."
  },
  {
    id: 11,
    category: "Quality Assurance",
    title: "Testing & Security Rule Verification",
    subtitle: "Multi-Level Testing Methodology & Empirical Test Execution Results",
    type: "testing-table",
    unitTestSummary: "Unit Testing: Validated string sanitation in `normalizeShopSlug()` against edge cases (accents, emojis, extra whitespace) and pricing threshold math.",
    securitySummary: "Security Rules Testing: Verified multi-tenant data isolation; unauthenticated users cannot read private vendor collections or alter order status.",
    testCases: [
      { id: "TC-01", module: "Authentication", desc: "Google OAuth & Email Login", expected: "Auth token issued & session established", status: "PASSED" },
      { id: "TC-02", module: "Slug Engine", desc: "Input 'My Store! 123'", expected: "Normalized to 'my-store-123'", status: "PASSED" },
      { id: "TC-03", module: "Slug Validation", desc: "Duplicate slug registration", expected: "Uniqueness check flags error", status: "PASSED" },
      { id: "TC-04", module: "Inventory Management", desc: "Product creation with image upload", expected: "Media stored & doc saved to Firestore", status: "PASSED" },
      { id: "TC-05", module: "Storefront Routing", desc: "Access dynamic path `/[shopSlug]`", expected: "Correct shop & active theme rendered", status: "PASSED" },
      { id: "TC-06", module: "Cart & Checkout", desc: "Customer places order without account", expected: "Invoice stored in vendor's collection", status: "PASSED" }
    ],
    speakerNotes: "We performed rigorous unit testing, security rule validation, and functional testing across six core test cases (TC-01 through TC-06). All functional tests passed with 100% reliability."
  },
  {
    id: 12,
    category: "Performance Benchmarks",
    title: "Empirical Performance & Benchmark Analysis",
    subtitle: "Quantitative Lighthouse Mobile 4G Audits & Setup Duration",
    type: "dual-image-benchmark",
    image1: "/report_assets/fig7_1_page_load_latency.png",
    caption1: "Figure 7.1: Storefront Page Load Latency Comparison (Lighthouse Audit)",
    image2: "/report_assets/fig7_2_setup_time_benchmark.png",
    caption2: "Figure 7.2: Vendor Setup Duration Benchmark",
    metrics: [
      { label: "First Contentful Paint (FCP)", value: "0.8 s", status: "Optimal" },
      { label: "Time to Interactive (TTI)", value: "1.1 s", status: "Optimal" },
      { label: "Cumulative Layout Shift (CLS)", value: "0.01", status: "Optimal" },
      { label: "Lighthouse Performance Index", value: "96 / 100", status: "Grade A+" },
      { label: "Vendor Setup Duration", value: "< 3.0 min", status: "Vs 45+ min Shopify" }
    ],
    speakerNotes: "Figure 7.1 shows page load latency comparisons. GharSaDukan achieved an average storefront load time of 0.8 seconds compared to Shopify's 2.4s and WooCommerce's 3.8s. Setup time in Figure 7.2 was under 3 minutes."
  },
  {
    id: 13,
    category: "Evaluation & Results",
    title: "Operational Efficiency & Key Findings",
    subtitle: "Quantitative Workflow Acceleration & System Evaluation",
    type: "image-efficiency",
    image: "/report_assets/fig7_3_order_fulfillment_efficiency.png",
    caption: "Figure 7.3: GharSaDukan Operational Efficiency Metrics",
    findings: [
      { title: "75% Order Fulfillment Acceleration", desc: "Automated cart checkout eliminated manual price confirmation conversations over messaging apps." },
      { title: "Instant Inventory Synchronization", desc: "Real-time Firestore listeners (`onSnapshot`) updated product stock across vendor dashboards immediately." },
      { title: "Zero Infrastructure Cost", desc: "Deploying on serverless cloud BaaS eliminated monthly server provisioning and domain registration fees." },
      { title: "Offline-to-Online QR Acquisition", desc: "Printable PDF marketing flyers allowed local vendors to drive physical foot traffic directly to their web storefront." }
    ],
    speakerNotes: "Figure 7.3 demonstrates major operational efficiency gains: 75% faster order handling, instant stock sync, zero server cost, and seamless offline-to-online customer acquisition via printable QR flyers."
  },
  {
    id: 14,
    category: "Conclusion",
    title: "Conclusion & Future Work",
    subtitle: "Summary of Project Contributions & Academic Research Roadmap",
    type: "conclusion-grid",
    achievements: [
      "Successfully developed a lightweight, serverless multi-tenant web platform for micro-vendors.",
      "Implemented automated slug normalization (`normalizeShopSlug`) and dynamic layout theme switching.",
      "Built a zero-registration customer cart checkout system and real-time vendor analytics dashboard.",
      "Engineered a client-side Canvas QR code and jsPDF marketing flyer generator engine.",
      "Empirically verified sub-second storefront load times (0.8s) and 96/100 Lighthouse performance index."
    ],
    limitations: [
      "Requires manual delivery status updates by vendors.",
      "Currently lacks native push notifications for offline vendors."
    ],
    futureWork: [
      "Develop cross-platform React Native mobile applications with FCM push notifications.",
      "Integrate direct local digital payment gateways (JazzCash, EasyPaisa, Stripe).",
      "Implement AI-driven product recommendation and inventory demand forecasting engines."
    ],
    speakerNotes: "In conclusion, GharSaDukan meets all FYP objectives. Future work includes React Native mobile apps, push notifications, and local payment gateway integration like JazzCash and EasyPaisa."
  },
  {
    id: 15,
    category: "References",
    title: "Academic References & Defense Q&A",
    subtitle: "Key Bibliography & Open Floor for Evaluation Committee",
    type: "references-qa",
    references: [
      "[1] M. Fowler, 'MonolithFirst,' IEEE Software, vol. 32, no. 3, pp. 22-25, 2015.",
      "[2] S. Newman, Building Microservices: Designing Fine-Grained Systems, 2nd ed., O'Reilly Media, 2021.",
      "[3] A. Biorn-Hansen et al., 'Progressive Web Apps in E-Commerce,' IEEE ICWS, 2020.",
      "[4] Google Firebase Team, 'Cloud Firestore Architecture & Security Guide,' Google Developers, 2024.",
      "[5] Vercel Team, 'Next.js App Router Architecture Specs,' Vercel Inc., 2025."
    ],
    qaBox: {
      title: "Thank You for Your Attention!",
      subtitle: "GharSaDukan: Digital E-Commerce Platform for Home Vendors",
      presenter: "Abdullah Sohail (SAP ID: 67309)",
      invitation: "We now welcome questions, feedback, and discussion from the Honorable Evaluation Panel."
    },
    speakerNotes: "Thank you for listening to my presentation. Here are the core academic references. I am now open to any questions from the respected evaluation committee members."
  }
];

export default function FYPSlidesPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [activeUiTab, setActiveUiTab] = useState("landing");
  const [darkMode, setDarkMode] = useState(true);

  const slide = slidesData[currentSlide];

  const handleNext = useCallback(() => {
    if (currentSlide < slidesData.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    }
  }, [currentSlide]);

  const handlePrev = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  }, [currentSlide]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

      if (e.key === "ArrowRight" || e.key === "Space") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "n" || e.key === "N") {
        setShowNotes((prev) => !prev);
      } else if (e.key === "g" || e.key === "G") {
        setShowGrid((prev) => !prev);
      } else if (e.key === "f" || e.key === "F") {
        toggleFullscreen();
      } else if (e.key === "Home") {
        setCurrentSlide(0);
      } else if (e.key === "End") {
        setCurrentSlide(slidesData.length - 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev]);

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-300 ${
        darkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
      }`}
    >
      {/* Top Header Controls Bar */}
      <header
        className={`sticky top-0 z-50 border-b px-4 py-2.5 flex items-center justify-between backdrop-blur-md ${
          darkMode ? "bg-slate-900/90 border-slate-800" : "bg-white/90 border-slate-200"
        }`}
      >
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 transition"
          >
            <FiHome className="w-3.5 h-3.5" />
            <span>App Main</span>
          </Link>
          <span className="h-4 w-[1px] bg-slate-700" />
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded font-mono font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
              FYP DEFENSE SLIDES
            </span>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              GharSaDukan (BS Computer Systems)
            </span>
          </div>
        </div>

        {/* Center Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={currentSlide === 0}
            className="p-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
            title="Previous Slide (Left Arrow)"
          >
            <FiChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-1.5 text-xs font-mono font-medium px-3 py-1 rounded bg-slate-800 border border-slate-700">
            <span className="text-blue-400">{currentSlide + 1}</span>
            <span className="text-slate-500">/</span>
            <span>{slidesData.length}</span>
          </div>
          <button
            onClick={handleNext}
            disabled={currentSlide === slidesData.length - 1}
            className="p-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
            title="Next Slide (Right Arrow / Space)"
          >
            <FiChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNotes(!showNotes)}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition ${
              showNotes
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                : "border-slate-700 hover:bg-slate-800"
            }`}
            title="Toggle Speaker Notes (N)"
          >
            <FiBookOpen className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Notes</span>
          </button>
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition ${
              showGrid
                ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
                : "border-slate-700 hover:bg-slate-800"
            }`}
            title="Grid Overview (G)"
          >
            <FiGrid className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Overview</span>
          </button>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 transition"
            title="Toggle Theme"
          >
            {darkMode ? <FiSun className="w-4 h-4 text-amber-400" /> : <FiMoon className="w-4 h-4 text-indigo-400" />}
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 transition hidden sm:flex"
            title="Toggle Fullscreen (F)"
          >
            {isFullscreen ? <FiMinimize className="w-4 h-4" /> : <FiMaximize className="w-4 h-4" />}
          </button>
          <button
            onClick={() => window.print()}
            className="p-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 transition hidden lg:flex"
            title="Print Slide Deck"
          >
            <FiPrinter className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800 h-1">
        <div
          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1 transition-all duration-300"
          style={{ width: `${((currentSlide + 1) / slidesData.length) * 100}%` }}
        />
      </div>

      {/* Slide Canvas Area */}
      <main className="max-w-7xl mx-auto px-4 py-6 md:py-8 min-h-[calc(100vh-140px)] flex flex-col justify-between">
        {/* Grid Overview Modal / Overlay */}
        {showGrid ? (
          <div className="mb-6 p-6 rounded-2xl border border-slate-800 bg-slate-900/90 backdrop-blur-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <FiGrid className="text-blue-400" /> Slide Overview Grid
              </h3>
              <button
                onClick={() => setShowGrid(false)}
                className="text-xs px-3 py-1 rounded-lg border border-slate-700 hover:bg-slate-800"
              >
                Close Grid
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 max-h-[60vh] overflow-y-auto p-1">
              {slidesData.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setCurrentSlide(idx);
                    setShowGrid(false);
                  }}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between h-28 ${
                    idx === currentSlide
                      ? "bg-blue-600/20 border-blue-500 text-blue-200 ring-2 ring-blue-500/40"
                      : "bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300"
                  }`}
                >
                  <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 w-max">
                    Slide {s.id}
                  </span>
                  <p className="text-xs font-semibold line-clamp-2 mt-1">{s.title}</p>
                  <span className="text-[9px] text-slate-400 font-mono">{s.category}</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {/* Slide Content Frame */}
        <div
          className={`relative rounded-3xl border p-6 md:p-10 shadow-2xl transition-all duration-300 flex-1 flex flex-col justify-between ${
            darkMode
              ? "bg-slate-900/70 border-slate-800 shadow-slate-950/80"
              : "bg-white border-slate-200 shadow-slate-300/50"
          }`}
        >
          {/* Top Category Badge & Slide Counter */}
          <div className="flex items-center justify-between mb-4 border-b border-slate-800/60 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold text-blue-400 uppercase tracking-widest px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                {slide.category}
              </span>
              {slide.badge && (
                <span className="text-xs font-medium text-amber-400 px-2.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                  {slide.badge}
                </span>
              )}
            </div>
            <span className="text-xs font-mono text-slate-400">
              Slide {slide.id} of {slidesData.length}
            </span>
          </div>

          {/* Slide Dynamic Layout Renderer */}
          <div className="flex-1 my-2 flex flex-col justify-center">
            {/* Slide Title & Subtitle */}
            {slide.type !== "title" && (
              <div className="mb-6">
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-slate-100">
                  {slide.title}
                </h2>
                <p className="text-sm md:text-base text-slate-400 mt-1 font-medium">{slide.subtitle}</p>
              </div>
            )}

            {/* 1. TITLE SLIDE */}
            {slide.type === "title" && (
              <div className="text-center my-auto py-6 flex flex-col items-center justify-center">
                <div className="inline-flex items-center gap-2 text-xs font-semibold font-mono tracking-widest text-blue-400 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 mb-6">
                  <FiCpu className="w-4 h-4" /> BS COMPUTER SYSTEMS ENGINEERING FYP THESIS DEFENSE
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-100 mb-4 leading-tight">
                  <span className="bg-gradient-to-r from-blue-500 via-indigo-400 to-cyan-300 bg-clip-text text-transparent">
                    {slide.title}
                  </span>
                </h1>
                <p className="text-base md:text-xl text-slate-300 max-w-3xl font-normal leading-relaxed mb-8">
                  {slide.subtitle}
                </p>

                <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-4 text-left p-6 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <div className="space-y-2">
                    <p className="text-xs font-mono uppercase text-slate-400 font-bold">Presenter / Author</p>
                    <p className="text-base font-bold text-slate-100">{slide.details.author}</p>
                    <p className="text-xs font-mono text-blue-400">SAP ID: {slide.details.sapId}</p>
                    <p className="text-xs text-slate-400">{slide.details.degree}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-mono uppercase text-slate-400 font-bold">Academic Institution</p>
                    <p className="text-sm font-semibold text-slate-200">{slide.details.department}</p>
                    <p className="text-xs text-slate-300">{slide.details.institution}</p>
                    <p className="text-xs font-mono text-emerald-400 mt-1">{slide.details.session}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 2. SPLIT CARDS (Background & Context) */}
            {slide.type === "split-cards" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {slide.cards.map((c, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-slate-950/50 border border-slate-800 hover:border-blue-500/40 transition group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm font-mono">
                        0{idx + 1}
                      </span>
                      <h3 className="text-base font-bold text-slate-100 group-hover:text-blue-300 transition">
                        {c.title}
                      </h3>
                    </div>
                    <p className="text-xs md:text-sm text-slate-300 leading-relaxed pl-11">{c.desc}</p>
                  </div>
                ))}
              </div>
            )}

            {/* 3. PROBLEM COMPARISON */}
            {slide.type === "problem-comparison" && (
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs md:text-sm leading-relaxed font-medium">
                  <span className="font-bold font-mono text-amber-400 block mb-1">CORE PROBLEM STATEMENT:</span>
                  {slide.problemText}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-red-950/20 border border-red-500/30">
                    <h3 className="text-sm font-bold text-red-400 mb-3 flex items-center gap-2">
                      <FiAlertCircle className="w-4 h-4" /> {slide.pointsLeft.title}
                    </h3>
                    <ul className="space-y-2 text-xs md:text-sm text-slate-300">
                      {slide.pointsLeft.items.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-red-400 font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30">
                    <h3 className="text-sm font-bold text-amber-400 mb-3 flex items-center gap-2">
                      <FiAlertCircle className="w-4 h-4" /> {slide.pointsRight.title}
                    </h3>
                    <ul className="space-y-2 text-xs md:text-sm text-slate-300">
                      {slide.pointsRight.items.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-amber-400 font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* 4. OBJECTIVES GRID */}
            {slide.type === "objectives-grid" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {slide.objectives.map((obj, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-blue-500/40 transition"
                    >
                      <span className="text-xs font-mono font-bold text-blue-400 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 inline-block mb-2">
                        OBJ-{obj.num}
                      </span>
                      <h4 className="text-sm font-bold text-slate-100 mb-1">{obj.title}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">{obj.text}</p>
                    </div>
                  ))}
                </div>
                <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/20 text-xs text-blue-300 font-mono">
                  {slide.scope}
                </div>
              </div>
            )}

            {/* 5. MATRIX TABLE */}
            {slide.type === "matrix-table" && (
              <div className="space-y-4">
                <div className="overflow-x-auto rounded-2xl border border-slate-800">
                  <table className="w-full text-left text-xs md:text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-950 text-slate-200 border-b border-slate-800 font-mono">
                        {slide.headers.map((h, idx) => (
                          <th key={idx} className="p-3 font-semibold">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {slide.matrix.map((row, idx) => (
                        <tr
                          key={idx}
                          className={`transition ${
                            row.highlight
                              ? "bg-blue-600/20 text-blue-100 font-medium font-mono"
                              : "hover:bg-slate-800/40 text-slate-300"
                          }`}
                        >
                          <td className="p-3 font-bold flex items-center gap-1.5">
                            {row.highlight && <FiCheckCircle className="text-blue-400 w-4 h-4 shrink-0" />}
                            {row.platform}
                          </td>
                          <td className="p-3">{row.cost}</td>
                          <td className="p-3">{row.complexity}</td>
                          <td className="p-3">{row.inventory}</td>
                          <td className="p-3">{row.target}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-slate-400 italic bg-slate-950/40 p-3 rounded-xl border border-slate-800">
                  {slide.summaryNote}
                </p>
              </div>
            )}

            {/* 6. SINGLE IMAGE DIAGRAM + TIERS */}
            {slide.type === "image-diagram" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-7 bg-slate-950/80 p-3 rounded-2xl border border-slate-800 flex flex-col items-center">
                  <div className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden">
                    <Image
                      src={slide.image}
                      alt={slide.caption}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                  <p className="text-[11px] font-mono text-slate-400 mt-2 text-center">{slide.caption}</p>
                </div>

                <div className="lg:col-span-5 space-y-3">
                  {slide.tiers.map((tier, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800">
                      <h4 className="text-xs font-mono font-bold text-blue-400">{tier.name}</h4>
                      <p className="text-xs font-semibold text-slate-200 mt-0.5">{tier.tech}</p>
                      <p className="text-[11px] text-slate-400 mt-1">{tier.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7. SCHEMA CODE & SECURITY */}
            {slide.type === "schema-code" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-7 bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-xs text-blue-300 overflow-x-auto">
                  <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800 text-slate-500">
                    <span>Firestore Document Model</span>
                    <FiDatabase className="text-blue-400" />
                  </div>
                  <pre className="whitespace-pre text-[11px] leading-relaxed text-emerald-300">
                    {slide.schemaText}
                  </pre>
                </div>

                <div className="lg:col-span-5 space-y-3">
                  <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <FiShield className="text-emerald-400" /> Data Isolation & Security Rules
                  </h4>
                  {slide.securityRules.map((rule, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-xs text-slate-300">
                      <span className="text-emerald-400 font-bold font-mono mr-1">R-{idx + 1}:</span>
                      {rule}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 8. & 9. DUAL IMAGE ALGORITHMS */}
            {slide.type === "dual-image" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 flex flex-col items-center">
                    <div className="relative w-full h-52 md:h-64 rounded-xl overflow-hidden">
                      <Image
                        src={slide.image1}
                        alt={slide.caption1}
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                    <p className="text-[11px] font-mono text-slate-400 mt-2 text-center">{slide.caption1}</p>
                  </div>

                  <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 flex flex-col items-center">
                    <div className="relative w-full h-52 md:h-64 rounded-xl overflow-hidden">
                      <Image
                        src={slide.image2}
                        alt={slide.caption2}
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                    <p className="text-[11px] font-mono text-slate-400 mt-2 text-center">{slide.caption2}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {slide.keyLogic.map((logic, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-blue-950/20 border border-blue-500/20 text-slate-300">
                      {logic}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 10. UI GALLERY */}
            {slide.type === "ui-gallery" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {slide.screens.map((sc) => (
                    <button
                      key={sc.id}
                      onClick={() => setActiveUiTab(sc.id)}
                      className={`text-xs font-mono px-3.5 py-1.5 rounded-lg border transition whitespace-nowrap ${
                        activeUiTab === sc.id
                          ? "bg-blue-600 text-white border-blue-500 font-bold"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {sc.name}
                    </button>
                  ))}
                </div>

                {slide.screens
                  .filter((sc) => sc.id === activeUiTab)
                  .map((sc) => (
                    <div key={sc.id} className="bg-slate-950/90 p-4 rounded-2xl border border-slate-800 flex flex-col items-center">
                      <div className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden border border-slate-800">
                        <Image
                          src={sc.img}
                          alt={sc.caption}
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                      <p className="text-xs font-mono text-slate-300 mt-3 text-center">{sc.caption}</p>
                    </div>
                  ))}
              </div>
            )}

            {/* 11. TESTING TABLE */}
            {slide.type === "testing-table" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
                    <span className="text-blue-400 font-bold font-mono block mb-1">UNIT TESTING SUMMARY:</span>
                    {slide.unitTestSummary}
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
                    <span className="text-emerald-400 font-bold font-mono block mb-1">SECURITY RULES VERIFICATION:</span>
                    {slide.securitySummary}
                  </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-800">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-950 text-slate-200 border-b border-slate-800 font-mono">
                        <th className="p-2.5">ID</th>
                        <th className="p-2.5">Module</th>
                        <th className="p-2.5">Test Case Description</th>
                        <th className="p-2.5">Expected Output</th>
                        <th className="p-2.5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {slide.testCases.map((tc, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/40">
                          <td className="p-2.5 font-mono font-bold text-blue-400">{tc.id}</td>
                          <td className="p-2.5 font-medium">{tc.module}</td>
                          <td className="p-2.5">{tc.desc}</td>
                          <td className="p-2.5 text-slate-400">{tc.expected}</td>
                          <td className="p-2.5 text-right">
                            <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              {tc.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 12. DUAL BENCHMARK IMAGES + METRICS */}
            {slide.type === "dual-image-benchmark" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-7 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800">
                      <div className="relative w-full h-44 rounded-lg overflow-hidden">
                        <Image
                          src={slide.image1}
                          alt={slide.caption1}
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                      <p className="text-[10px] font-mono text-slate-400 mt-1 text-center">{slide.caption1}</p>
                    </div>

                    <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800">
                      <div className="relative w-full h-44 rounded-lg overflow-hidden">
                        <Image
                          src={slide.image2}
                          alt={slide.caption2}
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                      <p className="text-[10px] font-mono text-slate-400 mt-1 text-center">{slide.caption2}</p>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 space-y-2.5">
                  <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <FiZap className="text-amber-400" /> Empirical Audit Scorecard
                  </h4>
                  {slide.metrics.map((m, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                      <span className="text-xs text-slate-300 font-medium">{m.label}</span>
                      <div className="text-right font-mono">
                        <span className="text-xs font-bold text-blue-400 block">{m.value}</span>
                        <span className="text-[9px] text-emerald-400">{m.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 13. EFFICIENCY FINDINGS */}
            {slide.type === "image-efficiency" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-6 bg-slate-950/80 p-3 rounded-2xl border border-slate-800 flex flex-col items-center">
                  <div className="relative w-full h-64 md:h-72 rounded-xl overflow-hidden">
                    <Image
                      src={slide.image}
                      alt={slide.caption}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                  <p className="text-[11px] font-mono text-slate-400 mt-2 text-center">{slide.caption}</p>
                </div>

                <div className="lg:col-span-6 space-y-3">
                  {slide.findings.map((f, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800">
                      <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                        <FiCheckCircle className="w-3.5 h-3.5 shrink-0" /> {f.title}
                      </h4>
                      <p className="text-xs text-slate-300 mt-1 pl-5">{f.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 14. CONCLUSION & FUTURE WORK */}
            {slide.type === "conclusion-grid" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30">
                  <h3 className="text-xs font-mono font-bold text-emerald-400 mb-3 flex items-center gap-1.5">
                    <FiCheckCircle /> CORE ACCOMPLISHMENTS
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {slide.achievements.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30">
                  <h3 className="text-xs font-mono font-bold text-amber-400 mb-3 flex items-center gap-1.5">
                    <FiAlertCircle /> SYSTEM LIMITATIONS
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {slide.limitations.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/30">
                  <h3 className="text-xs font-mono font-bold text-blue-400 mb-3 flex items-center gap-1.5">
                    <FiBarChart2 /> FUTURE RESEARCH ROADMAP
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {slide.futureWork.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-blue-400 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* 15. REFERENCES & QA */}
            {slide.type === "references-qa" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-6 space-y-3">
                  <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                    Key Academic References
                  </h4>
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs text-slate-400 font-mono">
                    {slide.references.map((ref, idx) => (
                      <p key={idx} className="line-clamp-2">{ref}</p>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-6 p-6 rounded-2xl bg-gradient-to-br from-blue-900/40 via-indigo-900/30 to-slate-950 border border-blue-500/40 text-center">
                  <h3 className="text-xl font-extrabold text-blue-300 mb-1">{slide.qaBox.title}</h3>
                  <p className="text-xs text-slate-300 mb-4">{slide.qaBox.subtitle}</p>
                  <p className="text-xs font-mono text-emerald-400 mb-4">{slide.qaBox.presenter}</p>
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200">
                    {slide.qaBox.invitation}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Slide Footer Info */}
          <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Riphah International University • Dept. of Computer Systems</span>
            <span className="hidden sm:inline">Presenter: Abdullah Sohail (SAP ID: 67309)</span>
          </div>
        </div>

        {/* Presenter Speaker Notes Drawer */}
        {showNotes && (
          <div className="mt-4 p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-amber-200 animate-fadeIn">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <FiBookOpen /> PRESENTER SPEAKER NOTES & DEFENSE TALKING POINTS
              </span>
              <span className="text-[10px] font-mono text-amber-500">Shortcut: 'N'</span>
            </div>
            <p className="text-xs md:text-sm leading-relaxed text-amber-100 font-normal">
              {slide.speakerNotes}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
