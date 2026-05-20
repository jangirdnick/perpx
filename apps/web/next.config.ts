import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',

  transpilePackages: ['@perpx/shared'],

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'perpx-storage-2026.s3.ap-south-1.amazonaws.com',
      },
    ],
  },
};

export default nextConfig;
