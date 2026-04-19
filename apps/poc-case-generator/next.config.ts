import type { NextConfig } from "next"
const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3"],
  basePath: '/apps/case',
}
export default nextConfig
