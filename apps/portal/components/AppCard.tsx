import Link from 'next/link'
import type { AppDef } from '@/lib/apps-config'

const COLOR_MAP: Record<string, string> = {
  blue:   'border-blue-200 hover:border-blue-400 hover:bg-blue-50',
  green:  'border-green-200 hover:border-green-400 hover:bg-green-50',
  purple: 'border-purple-200 hover:border-purple-400 hover:bg-purple-50',
  orange: 'border-orange-200 hover:border-orange-400 hover:bg-orange-50',
}

const BADGE_MAP: Record<string, string> = {
  blue:   'bg-blue-100 text-blue-700',
  green:  'bg-green-100 text-green-700',
  purple: 'bg-purple-100 text-purple-700',
  orange: 'bg-orange-100 text-orange-700',
}

export function AppCard({ app }: { app: AppDef }) {
  return (
    <Link
      href={app.href}
      className={`block bg-white border-2 rounded-2xl p-6 shadow-sm transition-all duration-150 ${COLOR_MAP[app.color] ?? COLOR_MAP.blue}`}
    >
      <div className="flex items-start gap-4">
        <div className={`w-14 h-14 flex items-center justify-center rounded-xl text-3xl flex-shrink-0 ${BADGE_MAP[app.color] ?? BADGE_MAP.blue}`}>
          {app.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-gray-800">{app.name}</h2>
          <p className="text-sm text-gray-500 mt-1 leading-relaxed">{app.description}</p>
        </div>
        <span className="text-gray-300 text-xl flex-shrink-0">→</span>
      </div>
    </Link>
  )
}
