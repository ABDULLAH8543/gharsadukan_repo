import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
    ],
  },
  webpack: (config, { dev }) => {
    if (dev) {
      // Prevent occasional webpack filesystem cache corruption/OOM on Windows.
      config.cache = false;
    }

    return config;
  },
};

export default nextConfig;
