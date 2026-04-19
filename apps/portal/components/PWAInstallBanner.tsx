'use client'

import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstallBanner() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // すでにスタンドアロン（インストール済み）なら何もしない
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)

    window.addEventListener('appinstalled', () => setIsInstalled(true))

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function handleInstall() {
    if (!prompt) return
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setIsInstalled(true)
    setPrompt(null)
  }

  // インストール済み・非対応・却下済みは表示しない
  if (isInstalled || !prompt || dismissed) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-50">
      <div className="bg-white border border-blue-200 rounded-2xl shadow-2xl p-4 flex items-start gap-3">
        <div className="w-12 h-12 bg-blue-800 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
          🏢
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-800 text-sm">アプリとして使えます</p>
          <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">
            デスクトップ・スタートメニューに追加してすぐ開けます
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleInstall}
              className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-bold rounded-lg transition"
            >
              インストール
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="px-3 py-1.5 text-gray-400 hover:text-gray-600 text-sm transition"
            >
              後で
            </button>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-gray-300 hover:text-gray-500 text-lg leading-none flex-shrink-0 -mt-0.5"
          aria-label="閉じる"
        >
          ×
        </button>
      </div>
    </div>
  )
}
