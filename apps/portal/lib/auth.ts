import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './db'
import { writeAuditLog } from './audit'

export const ROLES = ['admin', 'office', 'field', 'viewer'] as const
export type Role = (typeof ROLES)[number]

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt', maxAge: 8 * 60 * 60 }, // 8h
  pages: { signIn: '/login' },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'メールアドレス', type: 'email' },
        password: { label: 'パスワード', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { company: true },
        })

        if (!user || !user.active) {
          await writeAuditLog({
            action: 'login',
            detail: `failed: ${credentials.email} (not found or inactive)`,
            ipAddress: req.headers?.['x-forwarded-for'] as string,
          })
          return null
        }

        const valid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!valid) {
          await writeAuditLog({
            action: 'login',
            detail: `failed: ${credentials.email} (wrong password)`,
            userId: user.id,
            companyId: user.companyId,
            ipAddress: req.headers?.['x-forwarded-for'] as string,
          })
          return null
        }

        await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })
        await writeAuditLog({
          action: 'login',
          detail: `success: ${user.email}`,
          userId: user.id,
          companyId: user.companyId,
          ipAddress: req.headers?.['x-forwarded-for'] as string,
          userAgent: req.headers?.['user-agent'] as string,
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as Role,
          companyId: user.companyId,
          companySlug: user.company.slug,
          companyName: user.company.name,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.companyId = (user as any).companyId
        token.companySlug = (user as any).companySlug
        token.companyName = (user as any).companyName
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub
        ;(session.user as any).role = token.role
        ;(session.user as any).companyId = token.companyId
        ;(session.user as any).companySlug = token.companySlug
        ;(session.user as any).companyName = token.companyName
      }
      return session
    },
  },
}

export function hasRole(userRole: string, required: Role[]): boolean {
  return required.includes(userRole as Role)
}
