import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Pin the workspace root so a stray lockfile in a parent folder
    // doesn't confuse Next.js.
    root: __dirname,
  },
};

export default nextConfig;
