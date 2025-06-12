/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['192.168.55.42'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '192.168.55.42',
        port: '8080',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig