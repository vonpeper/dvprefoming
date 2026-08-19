import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false, // Security: hide X-Powered-By header
  compress: true, // Enable gzip / Brotli compression

  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  async rewrites() {
    return [
      {
        source: "/admin",
        destination: "/dashboard/login",
      },
    ];
  },
};

export default nextConfig;
