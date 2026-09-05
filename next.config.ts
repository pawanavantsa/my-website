import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Phone-on-LAN hits the Mac via its Wi-Fi IP, not localhost — Next blocks
  // /_next assets from that origin unless we allow-list it.
  allowedDevOrigins: ["192.168.1.7", "192.168.*.*"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
