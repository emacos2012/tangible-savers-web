import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove output: export to enable API routes for Pi payment processing
  // Use "output: export" only when deploying to static hosting without server
  images: {
    unoptimized: true,
  },
  // Handle external scripts
  experimental: {
    // Optimize package imports
    optimizePackageImports: ['firebase', '@firebase'],
  },
};

export default nextConfig;
