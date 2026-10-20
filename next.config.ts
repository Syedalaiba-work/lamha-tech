import type { NextConfig } from "next";

/**
 * Security headers applied to every response. CSP is intentionally report-friendly
 * and permits the optional analytics providers (GA4 / Plausible) and Google Fonts.
 * Tighten further once the production analytics provider is decided.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "style-src 'self' 'unsafe-inline'",
      // 'unsafe-inline' is required for Next.js runtime scripts without a nonce setup; 'unsafe-eval' only in dev.
      `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""} https://www.googletagmanager.com https://plausible.io`,
      "connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://plausible.io",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  // Pin file tracing to this project (a stray lockfile exists in the user's home directory).
  outputFileTracingRoot: process.cwd(),
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    // Portal portrait uploads are capped at 3 MB in src/lib/server/media.ts; leave room for multipart overhead.
    serverActions: { bodySizeLimit: "4mb" },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
