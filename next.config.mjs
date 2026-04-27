/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/v1/object/public/**' },
    ],
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.autoshifthouston.com' }],
        destination: 'https://autoshifthouston.com/:path*',
        permanent: true,
      },
    ];
  },
};
export default nextConfig;
