/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/apps/work/:path*',
        destination: 'http://localhost:3000/apps/work/:path*',
      },
      {
        source: '/apps/inspection/:path*',
        destination: 'http://localhost:3001/apps/inspection/:path*',
      },
      {
        source: '/apps/dashboard/:path*',
        destination: 'http://localhost:3002/apps/dashboard/:path*',
      },
      {
        source: '/apps/case/:path*',
        destination: 'http://localhost:3003/apps/case/:path*',
      },
    ]
  },
}
export default config
