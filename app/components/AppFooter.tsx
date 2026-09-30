// "use client";

// import Link from "next/link";
// import Image from "next/image";
// import { usePathname } from "next/navigation";

// const INTERNAL_ROUTE_PREFIXES = [
//   "/dashboard",
//   "/login",
//   "/privacy-policy",
//   "/shopsetup",
//   "/add",
//   "/charges",
//   "/orders",
//   "/previousReport",
//   "/editShopSetup",
//   "/ShowProducts",
// ];

// const INSTAGRAM_URL = "https://www.instagram.com/gharsadukan/";
// const LINKEDIN_URL =
//   "https://www.linkedin.com/company/gharsadukan/?viewAsMember=true";
// const WHATSAPP_URL = "https://wa.me/03066145457";

// const shouldShowChrome = (pathname: string | null) => {
//   if (!pathname) return true;

//   if (pathname === "/") return true;

//   // Don't show footer on web2 cart pages
//   if (pathname.endsWith("/cart")) return false;

//   return INTERNAL_ROUTE_PREFIXES.some(
//     (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
//   );
// };

// export default function AppFooter() {
//   const pathname = usePathname();

//   if (!shouldShowChrome(pathname)) {
//     return null;
//   }

//   return (
//     <footer className="app-footer">
//       <div className="app-footer__brand">
//         <Link href="/" className="app-footer__logo">
//           <Image
//             src="/logo.webp"
//             alt="GharSaDukan Logo"
//             width={44}
//             height={44}
//           />
//           <span className="app-footer__name">
//             GharSa<span>Dukan</span>
//           </span>
//         </Link>
//         <p className="app-footer__text">
//           GharSaDukan empowers shopkeepers to create a professional e-commerce
//           website.
//         </p>
//       </div>

//       <div className="app-footer__links">
//         <Link href="/privacy-policy" className="app-footer__link">
//           Privacy Policy
//         </Link>
//         <div className="app-footer__social">
//           <a
//             href={INSTAGRAM_URL}
//             className="app-footer__icon app-footer__icon--instagram"
//             aria-label="Instagram"
//             target="_blank"
//             rel="noreferrer"
//           >
//             <svg viewBox="0 0 24 24" aria-hidden="true">
//               <path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H7zm5 3.5A4.5 4.5 0 1 1 7.5 13 4.5 4.5 0 0 1 12 8.5zm0 2A2.5 2.5 0 1 0 14.5 13 2.5 2.5 0 0 0 12 10.5zM17.5 7a1 1 0 1 1-1 1 1 1 0 0 1 1-1z" />
//             </svg>
//           </a>
//           <a
//             href={LINKEDIN_URL}
//             className="app-footer__icon app-footer__icon--linkedin"
//             aria-label="LinkedIn"
//             target="_blank"
//             rel="noreferrer"
//           >
//             <svg viewBox="0 0 24 24" aria-hidden="true">
//               <path d="M6.94 8.5H4V20h2.94V8.5zM5.47 7.2a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4zM20 20h-2.94v-5.4c0-1.29-.03-2.95-1.8-2.95-1.8 0-2.08 1.4-2.08 2.85V20H10.3V8.5h2.82v1.57h.04c.39-.74 1.35-1.53 2.78-1.53 2.97 0 3.52 1.96 3.52 4.52V20z" />
//             </svg>
//           </a>
//           <a
//             href={WHATSAPP_URL}
//             className="app-footer__icon app-footer__icon--whatsapp"
//             aria-label="WhatsApp"
//             target="_blank"
//             rel="noreferrer"
//           >
//             <svg viewBox="0 0 24 24" aria-hidden="true">
//               <path d="M12 4a8 8 0 0 1 6.86 12.12L19.6 20l-4-1.22A8 8 0 1 1 12 4zm0 2a6 6 0 0 0-5.13 9.1l.26.43-.53 1.72 1.78-.52.42.24A6 6 0 1 0 12 6zm3.36 8.05c-.18-.09-1.06-.52-1.23-.58-.16-.06-.28-.09-.4.09-.12.18-.46.58-.56.7-.1.12-.2.14-.38.05-.18-.09-.74-.27-1.41-.86-.52-.47-.88-1.04-.98-1.22-.1-.18-.01-.28.08-.37.08-.08.18-.2.27-.3.09-.1.12-.18.18-.3.06-.12.03-.23-.01-.32-.04-.09-.4-.96-.55-1.32-.15-.36-.3-.31-.4-.31h-.35c-.12 0-.32.05-.49.23-.17.18-.64.62-.64 1.52 0 .9.66 1.77.75 1.89.09.12 1.3 1.99 3.16 2.79.44.19.79.31 1.06.4.45.14.86.12 1.19.07.36-.05 1.06-.43 1.21-.85.15-.42.15-.78.1-.85-.05-.07-.16-.12-.34-.21z" />
//             </svg>
//           </a>
//         </div>
//       </div>
//     </footer>
//   );
// }




"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const HIDE_FOOTER_ROUTES = [
  "/shopsetup",
];

const INSTAGRAM_URL = "https://www.instagram.com/gharsadukan/";
const LINKEDIN_URL =
  "https://www.linkedin.com/company/gharsadukan/?viewAsMember=true";
const WHATSAPP_URL = "https://wa.me/03066145457";

const shouldShowFooter = (pathname: string | null) => {
  if (!pathname) return true;

  // hide footer on cart pages
  if (pathname.endsWith("/cart")) return false;

  // hide footer on specific routes
  return !HIDE_FOOTER_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
};

export default function AppFooter() {
  const pathname = usePathname();

  if (!shouldShowFooter(pathname)) {
    return null;
  }

  return (
    <footer className="app-footer">
      <div className="app-footer__brand">
        <Link href="/" className="app-footer__logo">
          <Image
            src="/logo.webp"
            alt="GharSaDukan Logo"
            width={44}
            height={44}
          />
          <span className="app-footer__name">
            GharSa<span>Dukan</span>
          </span>
        </Link>

        <p className="app-footer__text">
          GharSaDukan empowers shopkeepers to create a professional <span className="whitespace-nowrap">e-commerce</span> website.
        </p>
      </div>

      <div className="app-footer__links">
        <div className="app-footer__social" style={{ justifyContent: "center", width: "100%" }}>
          {/* Instagram */}
          <a
            href={INSTAGRAM_URL}
            className="app-footer__icon app-footer__icon--instagram"
            aria-label="Instagram"
            target="_blank"
            rel="noreferrer"
          >
            <svg viewBox="0 0 24 24">
              <path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H7zm5 3.5A4.5 4.5 0 1 1 7.5 13 4.5 4.5 0 0 1 12 8.5zm0 2A2.5 2.5 0 1 0 14.5 13 2.5 2.5 0 0 0 12 10.5zM17.5 7a1 1 0 1 1-1 1 1 1 0 0 1 1-1z" />
            </svg>
          </a>

          {/* LinkedIn */}
          <a
            href={LINKEDIN_URL}
            className="app-footer__icon app-footer__icon--linkedin"
            aria-label="LinkedIn"
            target="_blank"
            rel="noreferrer"
          >
            <svg viewBox="0 0 24 24">
              <path d="M6.94 8.5H4V20h2.94V8.5zM5.47 7.2a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4zM20 20h-2.94v-5.4c0-1.29-.03-2.95-1.8-2.95-1.8 0-2.08 1.4-2.08 2.85V20H10.3V8.5h2.82v1.57h.04c.39-.74 1.35-1.53 2.78-1.53 2.97 0 3.52 1.96 3.52 4.52V20z" />
            </svg>
          </a>

          {/* WhatsApp */}
          <a
            href={WHATSAPP_URL}
            className="app-footer__icon app-footer__icon--whatsapp"
            aria-label="WhatsApp"
            target="_blank"
            rel="noreferrer"
          >
            <svg viewBox="0 0 24 24">
              <path d="M12 4a8 8 0 0 1 6.86 12.12L19.6 20l-4-1.22A8 8 0 1 1 12 4zm0 2a6 6 0 0 0-5.13 9.1l.26.43-.53 1.72 1.78-.52.42.24A6 6 0 1 0 12 6zm3.36 8.05c-.18-.09-1.06-.52-1.23-.58-.16-.06-.28-.09-.4.09-.12.18-.46.58-.56.7-.1.12-.2.14-.38.05-.18-.09-.74-.27-1.41-.86-.52-.47-.88-1.04-.98-1.22-.1-.18-.01-.28.08-.37.08-.08.18-.2.27-.3.09-.1.12-.18.18-.3.06-.12.03-.23-.01-.32-.04-.09-.4-.96-.55-1.32-.15-.36-.3-.31-.4-.31h-.35c-.12 0-.32.05-.49.23-.17.18-.64.62-.64 1.52 0 .9.66 1.77.75 1.89.09.12 1.3 1.99 3.16 2.79.44.19.79.31 1.06.4.45.14.86.12 1.19.07.36-.05 1.06-.43 1.21-.85.15-.42.15-.78.1-.85-.05-.07-.16-.12-.34-.21z" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}