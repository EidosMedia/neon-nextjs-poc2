import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  webpack: config => {
    // Force all packages to use the SAME React instance
    config.resolve.alias = {
      ...config.resolve.alias,
      react: path.resolve('./node_modules/react'),
      'react-dom': path.resolve('./node_modules/react-dom'),
    };
    return config;
  },
  /* config options here */
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self' http://localhost:3000",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com http://localhost:3000",
              "connect-src 'self' https://unpkg.com http://localhost:3000",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
            ].join('; '),
          },
        ],
      },
    ];
  },
  output: 'standalone',
  trailingSlash: true,
  allowedDevOrigins: ['theglobe-test-region-a.neon.test'],
};

export default nextConfig;
