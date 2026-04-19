import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = {
  title: '作業記録入力',
  description: '現場作業の記録をその場で入力するアプリ（PoC版）',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        <header className="bg-blue-700 text-white px-4 py-3 flex items-center justify-between">
          <span className="font-bold text-lg">作業記録システム（PoC）</span>
          <nav className="flex gap-4 text-sm">
            <Link href="/"       className="hover:underline">入力</Link>
            <Link href="/admin"  className="hover:underline">管理一覧</Link>
            <Link href="/master" className="hover:underline">マスタ</Link>
          </nav>
        </header>
        <main className="max-w-2xl mx-auto px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  )
}
