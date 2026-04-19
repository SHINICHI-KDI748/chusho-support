import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const metadata = { title: '監査ログ | 業務アプリ' }

const ACTION_LABELS: Record<string, string> = {
  login: 'ログイン',
  logout: 'ログアウト',
  create: '作成',
  update: '更新',
  delete: '削除',
  export: 'エクスポート',
  admin_action: '管理操作',
  error: 'エラー',
}

export default async function LogsPage({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role
  if (role !== 'admin') redirect('/home')

  const companyId = (session?.user as any)?.companyId
  const page = Math.max(1, parseInt(searchParams.page ?? '1'))
  const perPage = 50

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.auditLog.count({ where: { companyId } }),
  ])

  const totalPages = Math.ceil(total / perPage)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">監査ログ</h1>
        <a
          href="/api/admin/logs/export"
          className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700"
        >
          CSV出力
        </a>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
            <tr>
              <th className="px-4 py-3 text-left">日時</th>
              <th className="px-4 py-3 text-left">操作</th>
              <th className="px-4 py-3 text-left">ユーザー</th>
              <th className="px-4 py-3 text-left">詳細</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString('ja-JP')}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    log.action === 'login' ? 'bg-green-100 text-green-700' :
                    log.action === 'error' ? 'bg-red-100 text-red-700' :
                    log.action === 'delete' ? 'bg-orange-100 text-orange-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {ACTION_LABELS[log.action] ?? log.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {log.user?.name ?? '-'}
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs truncate max-w-xs">
                  {log.detail ?? '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {page > 1 && (
            <a href={`?page=${page - 1}`} className="px-3 py-1 bg-white border rounded text-sm">前</a>
          )}
          <span className="px-3 py-1 text-sm text-gray-600">{page} / {totalPages}</span>
          {page < totalPages && (
            <a href={`?page=${page + 1}`} className="px-3 py-1 bg-white border rounded text-sm">次</a>
          )}
        </div>
      )}
    </div>
  )
}
