"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Box, CircularProgress } from "@mui/material";
import dynamic from "next/dynamic";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../lib/fireBase";
import { normalizeShopSlug } from "../../lib/shopSlug";
import "../../globals.css";

const DefaultCartPage = dynamic(() => import("../default/cart/page"));
const WebTwoCartPage = dynamic(() => import("../web_two/cart/page"));
const WebThreeCartPage = dynamic(() => import("../web_three/cart/page"));
const SiteFooter = dynamic(() =>
	import("../web_two/components/site-footer").then((mod) => mod.SiteFooter)
);

const isWebTwoTheme = (themeValue) => {
	const normalized = String(themeValue ?? "")
		.trim()
		.toLowerCase();
	const compressed = normalized.replace(/[\s_-]/g, "");
	return (
		normalized === "2" ||
		compressed === "2" ||
		compressed === "webtheme2" ||
		compressed === "theme2"
	);
};

const isWebThreeTheme = (themeValue) => {
	const normalized = String(themeValue ?? "")
		.trim()
		.toLowerCase();
	const compressed = normalized.replace(/[\s_-]/g, "");
	return (
		normalized === "3" ||
		compressed === "3" ||
		compressed === "webtheme3" ||
		compressed === "theme3" ||
		compressed === "webthree" ||
		compressed === "web_three"
	);
};

export default function ShopThemeRouterCartPage() {
	const params = useParams();
	const paramSlug = Array.isArray(params?.shopSlug)
		? params.shopSlug[0]
		: params?.shopSlug || "";

	const [loading, setLoading] = useState(true);
	const [useWebTwo, setUseWebTwo] = useState(false);
	const [useWebThree, setUseWebThree] = useState(false);

	const getRequestedSlug = () => {
		if (paramSlug) return String(paramSlug);

		if (typeof window === "undefined") return "";

		const hostname = window.location.hostname.toLowerCase();
		if (
			hostname.endsWith(".gharsadukan.com") &&
			hostname !== "gharsadukan.com" &&
			hostname !== "www.gharsadukan.com"
		) {
			return hostname.slice(0, -".gharsadukan.com".length);
		}

		return "";
	};

	useEffect(() => {
		let isMounted = true;

		const resolveTheme = async () => {
			const requestedSlug = getRequestedSlug();

			if (!requestedSlug) {
				if (isMounted) {
					setUseWebTwo(false);
					setLoading(false);
				}
				return;
			}

			setLoading(true);

			try {
				const normalizedSlug = normalizeShopSlug(requestedSlug);
				const legacySlug = normalizedSlug.replace(/-/g, "_");
				const slugCandidates = new Set([
					normalizedSlug,
					legacySlug,
					String(requestedSlug).trim().toLowerCase(),
				]);

				const slugQuery = query(
					collection(db, "users"),
					where("shopInfo.shopSlug", "==", normalizedSlug)
				);
				const slugSnap = await getDocs(slugQuery);

				let matchedUser = null;
				if (!slugSnap.empty) {
					matchedUser = slugSnap.docs[0];
				} else {
					const legacyQuery = query(
						collection(db, "users"),
						where("shopInfo.shopSlug", "==", legacySlug)
					);
					const legacySnap = await getDocs(legacyQuery);
					if (!legacySnap.empty) {
						matchedUser = legacySnap.docs[0];
					}
				}

				if (!matchedUser) {
					const allUsersSnap = await getDocs(collection(db, "users"));
					matchedUser = allUsersSnap.docs.find((userDoc) => {
						const data = userDoc.data();
						const shopInfo = data.shopInfo || {};
						const storedSlug = normalizeShopSlug(shopInfo.shopSlug || "");
						const storedNameSlug = normalizeShopSlug(shopInfo.shopName || "");
						return (
							slugCandidates.has(storedSlug) ||
							slugCandidates.has(storedNameSlug)
						);
					});
				}

				if (!isMounted) return;

				const userData = matchedUser?.data() || {};
				const shopInfo = userData.shopInfo || {};
				const selectedTheme =
					shopInfo.webtheme ??
					shopInfo.webTheme ??
					userData.webtheme ??
					userData.webTheme ??
					"";
				setUseWebTwo(isWebTwoTheme(selectedTheme));
				setUseWebThree(isWebThreeTheme(selectedTheme));
			} catch (error) {
				console.error("Error resolving cart theme:", error);
				if (isMounted) {
					setUseWebTwo(false);
				}
			} finally {
				if (isMounted) {
					setLoading(false);
				}
			}
		};

		resolveTheme();
		return () => {
			isMounted = false;
		};
	}, [paramSlug]);

	if (loading) {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
				<CircularProgress />
			</Box>
		);
	}

	if (useWebThree) {
		return (
			<div className="web-three-theme min-h-screen antialiased">
				<WebThreeCartPage />
			</div>
		);
	}

	if (useWebTwo) {
		return (
			<div className="web-two-theme min-h-screen antialiased">
				<WebTwoCartPage />
			</div>
		);
	}

	return <DefaultCartPage />;
}
