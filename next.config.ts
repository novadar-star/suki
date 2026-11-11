import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The video renderer runs in Node only. Keep it out of the app bundle.
  serverExternalPackages: ["@remotion/bundler", "@remotion/renderer"],
};

export default nextConfig;
