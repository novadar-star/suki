import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The video renderer runs in Node on your own computer only. Keep it out of the app bundle.
  serverExternalPackages: ["@remotion/bundler", "@remotion/renderer"],
  outputFileTracingExcludes: {
    "*": ["node_modules/@remotion/compositor-*/**", "node_modules/@remotion/renderer/**", "node_modules/@remotion/bundler/**", "node_modules/@esbuild/**"],
  },
};

export default nextConfig;
