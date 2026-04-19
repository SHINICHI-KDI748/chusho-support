import { prisma } from './db'

interface AuditParams {
  action: string
  resource?: string
  resourceId?: string
  detail?: string
  userId?: string
  companyId?: string
  ipAddress?: string
  userAgent?: string
}

export async function writeAuditLog(params: AuditParams) {
  try {
    await prisma.auditLog.create({ data: params })
  } catch {
    // 監査ログ失敗はアプリを止めない
    console.error('[AuditLog] write failed:', params.action)
  }
}
