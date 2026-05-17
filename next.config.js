/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
  // Ensure middleware (Edge) sees Slack auth env from .env.local
  env: {
    SLACK_CLIENT_ID: process.env.SLACK_CLIENT_ID,
    SLACK_CLIENT_SECRET: process.env.SLACK_CLIENT_SECRET,
    SLACK_TEAM_ID: process.env.SLACK_TEAM_ID,
    SLACK_AUTH_REQUIRED: process.env.SLACK_AUTH_REQUIRED,
  },
};

module.exports = nextConfig;
