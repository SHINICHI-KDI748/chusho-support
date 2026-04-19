import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { LoginForm } from '@/components/LoginForm'

export const metadata = { title: 'ログイン | 業務アプリ' }

export default async function LoginPage() {
  const session = await getServerSession(authOptions)
  if (session) redirect('/home')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🏢</div>
          <h1 className="text-2xl font-bold text-white">業務アプリ</h1>
          <p className="text-blue-200 text-sm mt-1">会社の業務システムにログイン</p>
        </div>
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <LoginForm />
        </div>
        <p className="text-center text-blue-200 text-xs mt-6">
          パスワードを忘れた方は管理者にご連絡ください
        </p>
      </div>
    </div>
  )
}
