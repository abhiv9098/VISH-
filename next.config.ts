import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        'localhost:4000',
        '10.241.215.9:3000',
        '10.241.215.9:4000',
        '192.168.1.72:3000',
        '192.168.1.72:4000',
        '192.168.137.1:3000',
        '192.168.137.1:4000',
        '192.168.29.236:3000',
        '192.168.29.236:4000',
      ],
    },
  },
  typescript: { ignoreBuildErrors: true },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      }
    ]
  }
};

export default nextConfig;
