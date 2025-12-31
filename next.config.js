// Temporarily disabled PWA due to missing Babel dependency
// const withPWA = require("next-pwa")({
//   dest: "public",
//   disable: process.env.NODE_ENV === "development",
//   register: true,
//   skipWaiting: true,
// });

const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Temporarily disabled SVG loader due to missing Babel dependency
  // webpack(config) {
  //   config.module.rules.push({
  //     test: /\.svg$/,
  //     use: ["@svgr/webpack"],
  //   });
  //   return config;
  // },
  images: {
    domains: [
      "sozodigicare.com",
      "127.0.0.1",
      "localhost",
      "images.unsplash.com",
      "via.placeholder.com"
    ],
  },
};

module.exports = nextConfig;
