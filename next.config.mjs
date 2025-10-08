/** @type {import('next').NextConfig} */
const nextConfig = { experimental: { optimizePackageImports: ["zod","clsx"],allowedDevOrigins: ['http://10.101.3.237:3000'] } };
export default nextConfig;
