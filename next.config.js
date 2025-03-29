/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
    serverComponentsExternalPackages: ['@aws-sdk/client-s3', '@aws-sdk/s3-request-presigner'],
  },
  webpack: (config) => {
    config.externals = [...config.externals, 'utf-8-validate'];
    return config;
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
          { key: 'Content-Type', value: 'application/json' },
        ],
      },
    ];
  },
  images: {
    domains: ['phx02-radio-uploads.s3.us-east-2.amazonaws.com'],
  },
};

module.exports = nextConfig; 