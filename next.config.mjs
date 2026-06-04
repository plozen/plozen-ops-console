/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  allowedDevOrigins: ["127.0.0.1", "100.81.184.11", "localhost"],
  async redirects() {
    return [
      {
        source: "/dashboard",
        destination: "/",
        permanent: false,
      },
      {
        source: "/pages/:path*",
        destination: "/design-kit/pages/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
