import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',

  transpilePackages: ['@perpx/shared'],

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'nicks-all-project.s3.ap-south-1.amazonaws.com',
      },
    ],
  },
};

export default nextConfig;
