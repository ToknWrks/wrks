/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '/cosmos/chain-registry/**',
      },
      {
        protocol: 'https',
        hostname: 'assets.cosmoscan.io',
      },
      {
        protocol: 'https',
        hostname: 'assets.leapwallet.io',
      }
    ]
  },
  webpack: (config) => {
    config.resolve.fallback = { 
      fs: false, 
      net: false, 
      tls: false,
      crypto: false,
      stream: false,
      http: false,
      https: false,
      zlib: false,
    };
    return config;
  },
};

module.exports = nextConfig;