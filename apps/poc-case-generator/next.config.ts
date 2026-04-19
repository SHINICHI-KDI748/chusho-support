import type { NextConfig } from "next"
const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3"],
  basePath: '/apps/case',
  env: { NEXT_PUBLIC_BASE_PATH: '/apps/case' },
}
export default nextConfig
