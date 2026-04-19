import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const company = await prisma.company.upsert({
    where: { slug: 'demo' },
    update: {},
    create: { name: 'デモ会社', slug: 'demo' },
  })

  const admin = await prisma.user.upsert({
    where: { email: 'admin@demo.local' },
    update: {},
    create: {
      email: 'admin@demo.local',
      name: '管理者',
      passwordHash: await bcrypt.hash('admin1234', 12),
      role: 'admin',
      companyId: company.id,
    },
  })

  await prisma.user.upsert({
    where: { email: 'office@demo.local' },
    update: {},
    create: {
      email: 'office@demo.local',
      name: '事務担当',
      passwordHash: await bcrypt.hash('office1234', 12),
      role: 'office',
      companyId: company.id,
    },
  })

  await prisma.user.upsert({
    where: { email: 'field@demo.local' },
    update: {},
    create: {
      email: 'field@demo.local',
      name: '現場担当',
      passwordHash: await bcrypt.hash('field1234', 12),
      role: 'field',
      companyId: company.id,
    },
  })

  console.log('Seed complete:', { company: company.slug, admin: admin.email })
}

main().catch(console.error).finally(() => prisma.$disconnect())
