import Link from "next/link";
import { FaFacebookF, FaInstagram, FaTiktok, FaWhatsapp } from "react-icons/fa";

type SiteFooterProps = {
  shopInfo?: any;
};

const normalizeUrl = (url = "") => {
  const trimmed = String(url || "").trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

const normalizeWhatsappUrl = (value = "", shopName = "") => {
  const raw = String(value || "").trim();
  if (!raw) return "";

  const message = encodeURIComponent(
    `Assalam o Alaikum, I want to order from ${shopName || "your shop"}.`
  );

  if (/^https?:\/\//i.test(raw)) {
    return raw;
  }

  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";

  const normalizedDigits = digits.startsWith("0")
    ? `92${digits.slice(1)}`
    : digits;

  return `https://wa.me/${normalizedDigits}?text=${message}`;
};

export function SiteFooter({ shopInfo }: SiteFooterProps) {
  const shopName = shopInfo?.shopName || "Your Market";
  const address = String(shopInfo?.address || "").trim();
  const shopDescription =
    shopInfo?.shopDescription ||
    "Your trusted store for the best deals and quality products.";

  const socialLinks = [
    {
      label: "Instagram",
      href: normalizeUrl(shopInfo?.instagram),
      icon: FaInstagram,
    },
    {
      label: "Facebook",
      href: normalizeUrl(shopInfo?.facebook),
      icon: FaFacebookF,
    },
    {
      label: "TikTok",
      href: normalizeUrl(shopInfo?.tiktok),
      icon: FaTiktok,
    },
    {
      label: "WhatsApp",
      href: normalizeWhatsappUrl(shopInfo?.whatsapp, shopName),
      icon: FaWhatsapp,
    },
  ].filter((item) => Boolean(item.href));

  return (
    <footer className="border-t border-[var(--line)] bg-[var(--paper)] px-4 py-8 sm:px-8">
      <div className="mx-auto grid w-full max-w-6xl gap-8 md:grid-cols-3"  style={{marginTop: "20px"}}>
        <div>
          <p className="newspaper-title text-2xl text-[var(--ink)]">GharSaDukan</p>
          <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
            {shopDescription}
          </p>
        </div>

        <div>
          <p className="kicker">Shop Information</p>
          <div className="mt-3 space-y-2 text-sm leading-6 text-[var(--ink-soft)]">
            <p>
              <strong className="text-[var(--ink)]">Name:</strong> {shopName}
            </p>
            <p>
              <strong className="text-[var(--ink)]">Contact:</strong> {shopInfo?.contact || "N/A"}
            </p>
            <p>
              <strong className="text-[var(--ink)]">City:</strong> {shopInfo?.city || "N/A"}
            </p>
            {address ? (
              <p className="break-words">
                <strong className="text-[var(--ink)]">Address:</strong> {address}
              </p>
            ) : null}
          </div>
        </div>

        <div>
          <p className="kicker">Follow Us</p>
          {socialLinks.length > 0 ? (
            <div className="mt-3 flex items-center gap-3" style={{marginTop:"10px"}}>
              {socialLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    aria-label={item.label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--paper-strong)] text-[var(--ink)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  >
                    <Icon size={16} />
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="mt-3 text-sm text-[var(--ink-soft)]">No social links added.</p>
          )}
        </div>
      </div>
    </footer>
  );
}
