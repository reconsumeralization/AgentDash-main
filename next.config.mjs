/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  // External packages for server components
  serverExternalPackages: ['@clerk/nextjs'],
  // Set proper output tracing root to avoid lockfile conflicts
  outputFileTracingRoot: undefined,
}

export default nextConfig