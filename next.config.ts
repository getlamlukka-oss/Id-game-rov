import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // แก้ Warning Workspace Root ด้วย __dirname ที่สร้างขึ้นใหม่
  outputFileTracingRoot: join(__dirname, ".."),
  webpack: (config) => {
    // แก้ Warning Watchpack (Permission)
    config.watchOptions = {
      ignored: ['**/data/**', '**/node_modules/**'],
    };
    // แก้ Warning Webpack Cache (Android filesystem limitation)
    config.cache = false; 
    return config;
  },
};

export default nextConfig;
