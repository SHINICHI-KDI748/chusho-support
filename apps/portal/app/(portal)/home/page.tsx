import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { APPS } from '@/lib/apps-config'
import { AppCard } from '@/components/AppCard'

export const metadata = { title: 'ホーム | 業務アプリ' }

export default async function HomePage() {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role ?? 'viewer'
  const companyName = (session?.user as any)?.companyName ?? '会社'

  const visibleApps = APPS.filter((app) => app.allowedRoles.includes(role))

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">{companyName} 業務アプリ</h1>
        <p className="text-gray-500 text-sm mt-1">
          {session?.user?.name} さん、おはようございます。ご利用のアプリを選んでください。
        </p>
      </div>

      {visibleApps.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">🔒</div>
          <p>利用できるアプリがありません。管理者にお問い合わせください。</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {visibleApps.map((app) => (
            <AppCard key={app.id} app={app} />
          ))}
        </div>
      )}

      {role === 'admin' && (
        <div className="mt-10 p-4 bg-gray-100 rounded-xl">
          <h2 className="text-sm font-semibold text-gray-600 mb-3">管理メニュー</h2>
          <div className="flex flex-wrap gap-3">
            <a
              href="/admin/users"
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 shadow-sm"
            >
              👥 ユーザー管理
            </a>
            <a
              href="/admin/logs"
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 shadow-sm"
            >
              📋 監査ログ
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
