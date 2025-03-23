/** @type {import('next').NextConfig} */
const nextConfig = {
  serverRuntimeConfig: {
    api: {
      bodyParser: {
        sizeLimit: '10mb',
      },
      responseLimit: '10mb',
    },
  },
}

module.exports = nextConfig 