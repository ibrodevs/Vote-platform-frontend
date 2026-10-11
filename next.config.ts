import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dobush.kg',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'dobush-media.hel1.your-objectstorage.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
