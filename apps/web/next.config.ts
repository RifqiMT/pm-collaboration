import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@cadence/core"],
  poweredByHeader: false,
};

export default nextConfig;
