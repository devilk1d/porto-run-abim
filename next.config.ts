import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.100.50"],
  async redirects() {
    return [
      { source: "/about", destination: "/#about", permanent: false },
      { source: "/experience", destination: "/#experience", permanent: false },
      { source: "/stack", destination: "/#stack", permanent: false },
      { source: "/work", destination: "/#projects", permanent: false },
      { source: "/projects", destination: "/all-projects", permanent: false },
      { source: "/certificates", destination: "/all-certificates", permanent: false },
      { source: "/process", destination: "/#process", permanent: false },
      { source: "/contact", destination: "/#contact", permanent: false },
      { source: "/statement", destination: "/#statement", permanent: false },
    ];
  },
};

export default nextConfig;