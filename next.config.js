const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development", // disables PWA in dev
  register: true,
  skipWaiting: true,
});

const nextConfig = withPWA({
  reactStrictMode: true,
  eslint: {
    // Don't fail build on warnings, only on errors
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Ignore TypeScript errors during build if any
    ignoreBuildErrors: false,
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
  images: {
    domains: [
      "sozodigicare.com",
      "127.0.0.1",
      "localhost",
      "images.unsplash.com",
      "via.placeholder.com"
    ],
  },
});

module.exports = nextConfig;
