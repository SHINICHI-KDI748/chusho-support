'use client'

import { Session } from 'next-auth'
import { signOut } from 'next-auth/react'

const ROLE_LABELS: Record<string, string> = {
  admin: '管理者',
  office: '事務',
  field: '現場',
  viewer: '閲覧',
}

export function Header({ session }: { session: Session }) {
  const user = session.user as any
  return (
    <header className="bg-blue-800 text-white shadow-md">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg">🏢</span>
          <span className="font-bold text-base tracking-wide">
            {user?.companyName ?? '業務アプリ'}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-blue-300">{ROLE_LABELS[user?.role] ?? user?.role}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="px-3 py-1.5 bg-blue-700 hover:bg-blue-600 rounded-lg text-sm transition"
          >
            ログアウト
          </button>
        </div>
      </div>
    </header>
  )
}
