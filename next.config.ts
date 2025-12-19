import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/timer-app',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
