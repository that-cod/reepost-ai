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
