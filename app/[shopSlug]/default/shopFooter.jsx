"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
} from "@mui/material";
import { db } from "../../lib/fireBase";
import { doc, getDoc } from "firebase/firestore";

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

  // Convert local PK mobile format (03xxxxxxxxx) into international (923xxxxxxxxx)
  const normalizedDigits = digits.startsWith("0")
    ? `92${digits.slice(1)}`
    : digits;

  return `https://wa.me/${normalizedDigits}?text=${message}`;
};

const Footer = ({ userId }) => {
  const [shopDetails, setShopDetails] = useState(null);
  const address = String(shopDetails?.address || "").trim();

  useEffect(() => {
    const fetchShopDetails = async () => {
      if (!userId) return;
      try {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          setShopDetails(userDoc.data().shopInfo || {});
        }
      } catch (error) {
        console.error("Error fetching shop info:", error);
      }
    };
    fetchShopDetails();
  }, [userId]);

  const whatsappHref = normalizeWhatsappUrl(
    shopDetails?.whatsapp,
    shopDetails?.shopName
  );

  const socialLinks = [
    {
      key: "instagram",
      label: "Instagram",
      href: normalizeUrl(shopDetails?.instagram),
      color: "#E4405F",
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H7zm5 3.5A4.5 4.5 0 1 1 7.5 13 4.5 4.5 0 0 1 12 8.5zm0 2A2.5 2.5 0 1 0 14.5 13 2.5 2.5 0 0 0 12 10.5zM17.5 7a1 1 0 1 1-1 1 1 1 0 0 1 1-1z" />
        </svg>
      ),
    },
    {
      key: "facebook",
      label: "Facebook",
      href: normalizeUrl(shopDetails?.facebook),
      color: "#1877F2",
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.5 1.6-1.5h1.7V4.9c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1V11H8v3h2.4v8h3.1z" />
        </svg>
      ),
    },
    {
      key: "tiktok",
      label: "TikTok",
      href: normalizeUrl(shopDetails?.tiktok),
      color: "#111111",
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M14.5 3h2.2c.2 1.8 1.3 3.2 3 3.8v2.3c-1.4 0-2.8-.4-4-1.2V14a5.5 5.5 0 1 1-5.5-5.5c.3 0 .5 0 .8.1V11a3.1 3.1 0 0 0-.8-.1A3.1 3.1 0 1 0 13.3 14V3h1.2z" />
        </svg>
      ),
    },
    {
      key: "whatsapp",
      label: "WhatsApp",
      href: whatsappHref,
      color: "#25D366",
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 4a8 8 0 0 1 6.86 12.12L19.6 20l-4-1.22A8 8 0 1 1 12 4zm0 2a6 6 0 0 0-5.13 9.1l.26.43-.53 1.72 1.78-.52.42.24A6 6 0 1 0 12 6zm3.36 8.05c-.18-.09-1.06-.52-1.23-.58-.16-.06-.28-.09-.4.09-.12.18-.46.58-.56.7-.1.12-.2.14-.38.05-.18-.09-.74-.27-1.41-.86-.52-.47-.88-1.04-.98-1.22-.1-.18-.01-.28.08-.37.08-.08.18-.2.27-.3.09-.1.12-.18.18-.3.06-.12.03-.23-.01-.32-.04-.09-.4-.96-.55-1.32-.15-.36-.3-.31-.4-.31h-.35c-.12 0-.32.05-.49.23-.17.18-.64.62-.64 1.52 0 .9.66 1.77.75 1.89.09.12 1.3 1.99 3.16 2.79.44.19.79.31 1.06.4.45.14.86.12 1.19.07.36-.05 1.06-.43 1.21-.85.15-.42.15-.78.1-.85-.05-.07-.16-.12-.34-.21z" />
        </svg>
      ),
    },
  ].filter((link) => Boolean(link.href));

  return (
    <>
      <Box
        sx={{
          bgcolor: "white",
          color: "black",
          mt: 5,
          py: 4,
          borderTop: "1px solid #e0e0e0",
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={3} justifyContent="center">
            <Grid item xs={12} sm={4}>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                <p style={{ letterSpacing: ".5px" }}>
                  GharSa<span style={{ color: "#8BC34A" }}>Dukan</span>
                </p>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your trusted store for the best deals and quality products.
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                Shop Information
              </Typography>
              {userId && shopDetails ? (
                <>
                  <Typography variant="body2">
                    <strong>Name:</strong> {shopDetails.shopName || "N/A"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Contact:</strong> {shopDetails.contact || "N/A"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>City:</strong> {shopDetails.city || "N/A"}
                  </Typography>
                  {address ? (
                    <Typography
                      variant="body2"
                      style={{
                        display: "block",
                        width: "250px",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        overflowWrap: "break-word",
                      }}
                    >
                      <strong>Address:</strong> {address}
                    </Typography>
                  ) : null}
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {userId ? "Loading shop details..." : ""}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                Follow Us
              </Typography>
              {socialLinks.length > 0 ? (
                <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                  {socialLinks.map((social) => (
                    <Box
                      key={social.key}
                      component="a"
                      href={social.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={social.label}
                      title={social.label}
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: 2,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid #e2e8f0",
                        backgroundColor: "#fff",
                        color: social.color,
                        textDecoration: "none",
                        transition: "transform 0.15s ease, box-shadow 0.15s ease",
                        "& svg": {
                          width: 20,
                          height: 20,
                          fill: "currentColor",
                        },
                        "&:hover": {
                          transform: "translateY(-1px)",
                          boxShadow: "0 6px 16px rgba(15, 23, 42, 0.12)",
                        },
                      }}
                    >
                      {social.icon}
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No social links added.
                </Typography>
              )}
            </Grid>
          </Grid>
        </Container>
      </Box>
      <Box className="ghd-brand-footer"></Box>
    </>
  );
};

export default Footer;
