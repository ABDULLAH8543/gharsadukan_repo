"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Box, CircularProgress, Typography } from "@mui/material";
import dynamic from "next/dynamic";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../lib/fireBase";
import { normalizeShopSlug } from "../lib/shopSlug";

const DefaultShopPage = dynamic(() => import("./default/page"));
const WebTwoShopPage = dynamic(() => import("./web_two/page"));
const WebThreeShopPage = dynamic(() => import("./web_three/page"));

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
		compressed === "web_theme3" ||
		compressed === "web_three"
	);
};

export default function ShopThemeRouterPage() {
	const params = useParams();
	const paramSlug = Array.isArray(params?.shopSlug)
		? params.shopSlug[0]
		: params?.shopSlug || "";

	const [loading, setLoading] = useState(true);
	const [useWebTwo, setUseWebTwo] = useState(false);
	const [useWebThree, setUseWebThree] = useState(false);
	const [missingShopName, setMissingShopName] = useState("");
	const [userId, setUserId] = useState("");

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
					setMissingShopName("");
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

				if (!matchedUser || !isMounted) {
					if (isMounted) {
						setUseWebTwo(false);
						setMissingShopName(requestedSlug);
					}
					return;
				}

				const userData = matchedUser.data() || {};
				const shopInfo = userData.shopInfo || {};
				const selectedTheme =
					shopInfo.webtheme ??
					shopInfo.webTheme ??
					userData.webtheme ??
					userData.webTheme ??
					"";
				if (isMounted) {
					setUserId(matchedUser.id);
					setUseWebTwo(isWebTwoTheme(selectedTheme));
					setUseWebThree(isWebThreeTheme(selectedTheme));
					setMissingShopName("");
				}
			} catch (error) {
				console.error("Error resolving shop theme:", error);
				if (isMounted) {
					setUseWebTwo(false);
					setMissingShopName("");
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

	if (missingShopName) {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", mt: 10, px: 2 }}>
				<Typography variant="h6" textAlign="center">
					No shop exists with this name: {missingShopName}
				</Typography>
			</Box>
		);
	}

	if (useWebThree) {
		return (
			<div className="min-h-screen antialiased">
				<WebThreeShopPage userId={userId} />
			</div>
		);
	}

	if (useWebTwo) {
		return (
			<div className="min-h-screen antialiased">
				<WebTwoShopPage userId={userId} />
			</div>
		);
	}

	return <DefaultShopPage />;
}
