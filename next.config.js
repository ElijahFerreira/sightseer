/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features if needed
  experimental: {},
  
  // Headers for camera access (required for getUserMedia on mobile)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'camera=self',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
