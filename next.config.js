/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
  async redirects() {
    return [
      { source: "/logo.webp", destination: "/brand/logo.webp", permanent: true },
      { source: "/favicon.webp", destination: "/brand/favicon.webp", permanent: true },
    ];
  },
  async headers() {
    const immutable = [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }];
    return [
      { source: "/brand/:file*", headers: immutable },
      { source: "/icons/:file*", headers: immutable },
    ];
  },
  env: {
    SLACK_CLIENT_ID: process.env.SLACK_CLIENT_ID,
    SLACK_CLIENT_SECRET: process.env.SLACK_CLIENT_SECRET,
    SLACK_TEAM_ID: process.env.SLACK_TEAM_ID,
    SLACK_AUTH_REQUIRED: process.env.SLACK_AUTH_REQUIRED,
  },
};

module.exports = nextConfig;
