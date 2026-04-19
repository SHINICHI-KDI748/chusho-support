import type { Role } from './auth'

export interface AppDef {
  id: string
  name: string
  description: string
  icon: string
  color: string
  href: string
  allowedRoles: Role[]
}

// Vercel本番: NEXT_PUBLIC_APP_*_URL にサブアプリのドメインを設定すると直接リンクになる
// ローカル/ngrok: 未設定の場合はポータル経由のプロキシパスを使う
function appHref(envVar: string | undefined, proxyPath: string): string {
  if (envVar) return `${envVar}${proxyPath}`
  return proxyPath
}

export const APPS: AppDef[] = [
  {
    id: 'work-log',
    name: '作業入力',
    description: '日報・作業実績を記録します。現場担当が入力し、管理者が確認します。',
    icon: '📝',
    color: 'blue',
    href: appHref(process.env.NEXT_PUBLIC_APP_WORK_URL, '/apps/work'),
    allowedRoles: ['admin', 'office', 'field'],
  },
  {
    id: 'inspection',
    name: '点検入力',
    description: '設備・車両の点検結果を記録します。OK/NG/NAで素早く入力できます。',
    icon: '🔍',
    color: 'green',
    href: appHref(process.env.NEXT_PUBLIC_APP_INSPECTION_URL, '/apps/inspection'),
    allowedRoles: ['admin', 'office', 'field'],
  },
  {
    id: 'dashboard',
    name: 'ダッシュボード',
    description: '作業実績・点検結果をグラフで確認します。管理者・事務向けです。',
    icon: '📊',
    color: 'purple',
    href: appHref(process.env.NEXT_PUBLIC_APP_DASHBOARD_URL, '/apps/dashboard'),
    allowedRoles: ['admin', 'office', 'viewer'],
  },
  {
    id: 'case-generator',
    name: '事例生成',
    description: '業務改善の提案・事例レポートをAIで生成します。',
    icon: '🤖',
    color: 'orange',
    href: appHref(process.env.NEXT_PUBLIC_APP_CASE_URL, '/apps/case'),
    allowedRoles: ['admin', 'office'],
  },
]
