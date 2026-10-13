import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";

const nextConfig: NextConfig = {
  cacheComponents: true,
  turbopack: { root: fileURLToPath(new URL(".", import.meta.url)) },
  devIndicators: false,
};

export default nextConfig;
