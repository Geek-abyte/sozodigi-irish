// Wrap PWA setup so build doesn't break if workbox/next-pwa has missing deps
let withPWA = (config) => config;

try {
  const nextPWA = require("next-pwa");
  withPWA = nextPWA({
    dest: "public",
    disable: process.env.NODE_ENV === "development", // disables PWA in dev
    register: true,
    skipWaiting: true,
  });
} catch (error) {
  console.warn(
    "[next.config.js] next-pwa/workbox failed to load, continuing without PWA:",
    error.message
  );
}

const nextConfig = withPWA({
  reactStrictMode: true,
  eslint: {
    // Don't block builds on ESLint issues – run `npm run lint` separately if needed
    ignoreDuringBuilds: true,
  },
  typescript: {
    // If you want TS errors to block builds, flip this back to false
    ignoreBuildErrors: true,
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
      "api.sozodigicare.com", // Backend API domain for uploaded images
      "ireland.sozodigicare.com",
      "127.0.0.1",
      "localhost",
      "images.unsplash.com",
      "via.placeholder.com"
    ],
    // Alternative: use remotePatterns for more control (Next.js 12.3+)
    // remotePatterns: [
    //   {
    //     protocol: 'https',
    //     hostname: 'api.sozodigicare.com',
    //     pathname: '/uploads/**',
    //   },
    // ],
  },
});

module.exports = nextConfig;
