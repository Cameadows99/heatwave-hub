import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Only add this if type errors start blocking you too:
  // typescript: {
  //   ignoreBuildErrors: true,
  // },
};

export default nextConfig;
