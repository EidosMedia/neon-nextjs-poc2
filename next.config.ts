import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */

  output: 'standalone',
  trailingSlash: true,
  allowedDevOrigins: ['*.neon.test'],
};

export default nextConfig;
