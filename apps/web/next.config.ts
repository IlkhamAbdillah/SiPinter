import type { NextConfig } from "next";

// Server-side address of the Express API (never exposed to the browser).
// In production Nginx routes /api/* to Express directly; this rewrite covers local development
// and any deployment where Next.js is the only public entry point.
const apiInternalUrl = process.env.API_INTERNAL_URL ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${apiInternalUrl}/api/:path*` }];
  },
};

export default nextConfig;
