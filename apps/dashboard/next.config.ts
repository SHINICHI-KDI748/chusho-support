import type { NextConfig } from 'next'
const nextConfig: NextConfig = {
  basePath: '/apps/dashboard',
  env: { NEXT_PUBLIC_BASE_PATH: '/apps/dashboard' },
}
export default nextConfig
