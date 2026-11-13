import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  poweredByHeader: false,
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [480, 640, 828, 1080, 1440, 1920, 2400],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  // the OG renderer reads its fonts from /assets at request time
  outputFileTracingIncludes: { "/**/opengraph-image": ["./assets/**/*"], "/icon": ["./assets/**/*"], "/apple-icon": ["./assets/**/*"] },
  async redirects() {
    return [{ source: "/photographs", destination: "/work?f=photography", permanent: true }];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        source: "/media/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, stale-while-revalidate=86400" }],
      },
    ];
  },
};

export default nextConfig;
