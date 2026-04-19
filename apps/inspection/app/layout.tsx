import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = {
  title: '点検チェックリスト',
  description: '現場点検記録のスマホ入力アプリ（PoC版）',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        <header className="bg-emerald-700 text-white px-4 py-3 flex items-center justify-between">
          <span className="font-bold text-lg">点検チェックリスト（PoC）</span>
          <nav className="flex gap-4 text-sm">
            <Link href="/"       className="hover:underline">入力</Link>
            <Link href="/admin"  className="hover:underline">管理一覧</Link>
            <Link href="/master" className="hover:underline">マスタ</Link>
          </nav>
        </header>
        <main className="max-w-xl mx-auto px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  )
}
