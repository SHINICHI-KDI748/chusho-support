import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { UserTable } from '@/components/UserTable'

export const metadata = { title: 'ユーザー管理 | 業務アプリ' }

export default async function UsersPage() {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role
  if (role !== 'admin') redirect('/home')

  const companyId = (session?.user as any)?.companyId
  const users = await prisma.user.findMany({
    where: { companyId },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true, email: true, name: true, role: true, active: true,
      lastLoginAt: true, createdAt: true,
    },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">ユーザー管理</h1>
        <a
          href="/(portal)/admin/users/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          + 新規追加
        </a>
      </div>
      <UserTable users={users} />
    </div>
  )
}
