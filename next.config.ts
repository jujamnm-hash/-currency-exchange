import type { NextConfig } from "next";

const isStatic = process.env.STATIC_EXPORT === "true";
const isCap = process.env.CAP_BUILD === "true";
const basePath = isStatic && !isCap ? "/-currency-exchange" : "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: isStatic ? "export" : undefined,
  basePath,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_STATIC_MODE: isStatic ? "true" : "false",
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
