/** @type {import('next').NextConfig} */
const nextConfig = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
    responseLimit: '10mb',
  },
  webpack: (config) => {
    config.externals = [...(config.externals || []), { 'utf-8-validate': 'commonjs utf-8-validate' }];
    return config;
  },
}

module.exports = nextConfig 