import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Set the correct workspace root to silence multiple lockfile warning
  outputFileTracingRoot: path.join(__dirname, './'),

  // Empty turbopack config to silence Next.js 16 warning
  turbopack: {},

  // Image configuration for external domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
    ],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Optional: Redirect from root domain to app subdomain
  // Uncomment if you want repostai.io to redirect to app.repostai.io
  // async redirects() {
  //   return [
  //     {
  //       source: '/:path*',
  //       has: [
  //         {
  //           type: 'host',
  //           value: 'repostai.io',
  //         },
  //       ],
  //       destination: 'https://app.repostai.io/:path*',
  //       permanent: true,
  //     },
  //   ];
  // },

  // Webpack configuration for server-side dependencies
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externalize canvas and pdf-parse for server-side rendering
      config.externals.push('canvas', '@napi-rs/canvas', 'pdf-parse');
    }
    return config;
  },
};

export default nextConfig;
