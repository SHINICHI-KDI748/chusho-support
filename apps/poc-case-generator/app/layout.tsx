import type { Metadata } from "next"
import Link from "next/link"
import "./globals.css"

export const metadata: Metadata = {
  title: "PoC事例化アプリ | chusho-support",
  description: "PoC効果測定・事例化・営業資産化アプリ",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 no-print">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-sm">4</div>
              <div>
                <span className="font-bold text-gray-900">PoC事例化アプリ</span>
                <span className="text-xs text-gray-500 ml-2">効果測定 → 事例化 → 営業転用</span>
              </div>
            </div>
            <nav className="flex gap-4 text-sm items-center">
              <Link href="/" className="text-gray-600 hover:text-blue-600">PoC一覧</Link>
              <Link href="/poc/new" className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">+ 新規PoC</Link>
              {process.env.NEXT_PUBLIC_PORTAL_URL && (
                <a href={process.env.NEXT_PUBLIC_PORTAL_URL}
                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-bold hover:bg-gray-200">
                  ← ポータル
                </a>
              )}
            </nav>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  )
}
