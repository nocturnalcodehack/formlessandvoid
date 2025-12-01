/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
  reactStrictMode: false,
  sassOptions: {
    includePaths: [path.join(__dirname, "css")],
  },
  trailingSlash: false,
  env: {
    NEXT_PUBLIC_MAINTENANCE: process.env.MAINTENANCE || 'false',
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

module.exports = nextConfig
