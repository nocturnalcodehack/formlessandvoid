/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['sequelize', 'pg', 'pg-hstore'],
  },
  webpack: (config, { isServer }) => {
    // Fix for Sequelize on the client side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        path: false,
        os: false,
        stream: false,
        zlib: false,
      };
    }

    // Ignore pg-native module that pg optionally tries to load
    if (isServer) {
      config.externals = [...(config.externals || []), 'pg-native'];
    }

    return config;
  },
};

module.exports = nextConfig;

