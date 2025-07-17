import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  eslint: {
    // Disable ESLint during builds for Docker deployment
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript errors during builds for Docker deployment
    ignoreBuildErrors: true,
  },
  /* config options here */
};

export default nextConfig;
