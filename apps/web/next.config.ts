import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
  reactStrictMode: false,
  experimental: { viewTransition: true },
};

export default nextConfig;
