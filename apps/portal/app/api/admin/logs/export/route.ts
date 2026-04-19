import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const companyId = (session.user as any).companyId
  const logs = await prisma.auditLog.findMany({
    where: { companyId },
    orderBy: { createdAt: 'desc' },
    take: 10000,
    include: { user: { select: { name: true, email: true } } },
  })

  const rows = [
    ['日時', '操作', 'ユーザー名', 'メール', 'リソース', '詳細', 'IPアドレス'].join(','),
    ...logs.map((l) =>
      [
        new Date(l.createdAt).toLocaleString('ja-JP'),
        l.action,
        l.user?.name ?? '',
        l.user?.email ?? '',
        l.resource ?? '',
        `"${(l.detail ?? '').replace(/"/g, '""')}"`,
        l.ipAddress ?? '',
      ].join(',')
    ),
  ].join('\n')

  return new NextResponse('\uFEFF' + rows, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="audit-log-${Date.now()}.csv"`,
    },
  })
}
