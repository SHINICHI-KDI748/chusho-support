export { default } from 'next-auth/middleware'

export const config = {
  // (portal) グループのルート (/home, /admin/*) と管理APIを保護
  matcher: ['/home', '/admin/:path*', '/api/admin/:path*'],
}
