import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    agentFeedback: true,
    agentUpgrade: "security",
  },
};

export default nextConfig;
