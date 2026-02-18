import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    authInterrupts: true,
  },
  cacheComponents: true,
  typedRoutes: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/orgs/:path*",
        destination: "/dashboard",
        permanent: true,
      },
      {
        source: "/auth/signin",
        destination: "/login",
        permanent: true,
      },
      {
        source: "/auth/signup",
        destination: "/login",
        permanent: true,
      },
      {
        source: "/admin/:path*",
        destination: "/dashboard",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
