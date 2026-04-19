import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from '@/components/Providers'
import { PWAInstallBanner } from '@/components/PWAInstallBanner'

export const metadata: Metadata = {
  title: '業務アプリ',
  description: '中小企業向け業務統合アプリ',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '業務アプリ',
  },
}

export const viewport: Viewport = {
  themeColor: '#1e40af',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        {/* iOS Safari: ホーム画面追加時のアイコン */}
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192.png" />
        {/* Windows: タイルカラー */}
        <meta name="msapplication-TileColor" content="#1e40af" />
        <meta name="msapplication-TileImage" content="/icons/icon-192.png" />
      </head>
      <body className="bg-gray-50 min-h-screen">
        <Providers>
          {children}
          <PWAInstallBanner />
        </Providers>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function() {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
