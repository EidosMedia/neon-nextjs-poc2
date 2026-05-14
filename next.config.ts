import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */

  output: 'standalone',
  trailingSlash: true,

  allowedDevOrigins: ['theglobe-test-region-a.neon.test'],
};

export default nextConfig;
