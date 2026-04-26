/** @type {import('next').NextConfig} */
const nextConfig = { images: { remotePatterns: [{ protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/v1/object/public/**' }] } };
export default nextConfig;// cache-bust Sun Apr 26 16:59:42 CDT 2026
