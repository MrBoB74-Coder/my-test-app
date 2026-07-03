import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Pin the workspace root so a stray lockfile in a parent folder
    // doesn't confuse Next.js.
    root: __dirname,
  },
  // Keep playwright out of the server bundle — it's loaded at runtime only.
  serverExternalPackages: ["playwright"],
};

export default nextConfig;
