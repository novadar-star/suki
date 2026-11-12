import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The landing page is the home page. The campaigns list is at /campaigns.
  async rewrites() {
    return { beforeFiles: [{ source: "/", destination: "/welcome" }], afterFiles: [], fallback: [] };
  },
  // The video renderer runs in Node on your own computer only. Keep it out of the app bundle.
  serverExternalPackages: ["@remotion/bundler", "@remotion/renderer"],
  outputFileTracingExcludes: {
    "*": ["node_modules/@remotion/compositor-*/**", "node_modules/@remotion/renderer/**", "node_modules/@remotion/bundler/**", "node_modules/@esbuild/**"],
  },
};

export default nextConfig;
