/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  async rewrites() {
    const workUrl       = process.env.INTERNAL_APP_WORK_URL       ?? 'http://localhost:3000'
    const inspectionUrl = process.env.INTERNAL_APP_INSPECTION_URL ?? 'http://localhost:3001'
    const dashboardUrl  = process.env.INTERNAL_APP_DASHBOARD_URL  ?? 'http://localhost:3002'
    const caseUrl       = process.env.INTERNAL_APP_CASE_URL       ?? 'http://localhost:3003'
    return [
      { source: '/apps/work/:path*',       destination: `${workUrl}/apps/work/:path*` },
      { source: '/apps/inspection/:path*', destination: `${inspectionUrl}/apps/inspection/:path*` },
      { source: '/apps/dashboard/:path*',  destination: `${dashboardUrl}/apps/dashboard/:path*` },
      { source: '/apps/case/:path*',       destination: `${caseUrl}/apps/case/:path*` },
    ]
  },
}
export default config
