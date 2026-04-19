import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { writeAuditLog } from '@/lib/audit'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const CreateSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(8),
  role: z.enum(['admin', 'office', 'field', 'viewer']),
})

const UpdateSchema = z.object({
  id: z.string(),
  name: z.string().min(1).optional(),
  role: z.enum(['admin', 'office', 'field', 'viewer']).optional(),
  active: z.boolean().optional(),
  password: z.string().min(8).optional(),
})

async function adminSession(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== 'admin') return null
  return session
}

export async function POST(req: NextRequest) {
  const session = await adminSession(req)
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const parsed = CreateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { email, name, password, role } = parsed.data
  const companyId = (session.user as any).companyId

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return NextResponse.json({ error: 'Email already in use' }, { status: 409 })

  const user = await prisma.user.create({
    data: { email, name, passwordHash: await bcrypt.hash(password, 12), role, companyId },
  })

  await writeAuditLog({
    action: 'admin_action',
    resource: 'user',
    resourceId: user.id,
    detail: `created user ${email} with role ${role}`,
    userId: (session.user as any).id,
    companyId,
  })

  return NextResponse.json({ id: user.id })
}

export async function PATCH(req: NextRequest) {
  const session = await adminSession(req)
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const parsed = UpdateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { id, password, ...rest } = parsed.data
  const updateData: Record<string, unknown> = { ...rest }
  if (password) updateData.passwordHash = await bcrypt.hash(password, 12)

  const user = await prisma.user.update({ where: { id }, data: updateData })

  await writeAuditLog({
    action: 'admin_action',
    resource: 'user',
    resourceId: id,
    detail: `updated user ${user.email}: ${JSON.stringify(rest)}`,
    userId: (session.user as any).id,
    companyId: (session.user as any).companyId,
  })

  return NextResponse.json({ ok: true })
}
