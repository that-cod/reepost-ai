import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Set the correct workspace root to silence multiple lockfile warning
  outputFileTracingRoot: path.join(__dirname, './'),
};

export default nextConfig;
