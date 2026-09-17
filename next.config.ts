import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'voteplatformbackend.pythonanywhere.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
