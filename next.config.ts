import type { NextConfig } from "next";

const nextConfig = {
  output: 'export',
  basePath: '/imageupload',
  assetPrefix: '/imageupload/',
  images: { unoptimized: true }
};

export default nextConfig;
