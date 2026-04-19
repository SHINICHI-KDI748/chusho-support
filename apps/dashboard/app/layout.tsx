import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = {
  title: '業務統合ダッシュボード',
  description: '作業実績・点検記録を一元管理する管理者向けダッシュボード',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-gray-50 min-h-screen">
        <nav className="bg-gray-900 text-white px-4 py-3 flex items-center gap-6 shadow-md">
          <span className="font-bold text-base tracking-wide">業務統合ダッシュボード</span>
          <div className="flex gap-4 text-sm">
            <Link href="/dashboard"      className="hover:text-blue-300 transition">ダッシュボード</Link>
            <Link href="/records"        className="hover:text-blue-300 transition">詳細一覧</Link>
            <Link href="/poc-evaluation" className="hover:text-purple-300 transition">PoC評価</Link>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  )
}
