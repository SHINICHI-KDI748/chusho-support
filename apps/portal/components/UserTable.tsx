'use client'

import { useState } from 'react'

type User = {
  id: string
  email: string
  name: string
  role: string
  active: boolean
  lastLoginAt: Date | null
  createdAt: Date
}

const ROLE_LABELS: Record<string, string> = {
  admin: '管理者',
  office: '事務',
  field: '現場',
  viewer: '閲覧',
}

export function UserTable({ users }: { users: User[] }) {
  const [list, setList] = useState(users)
  const [loading, setLoading] = useState<string | null>(null)

  async function toggleActive(user: User) {
    setLoading(user.id)
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user.id, active: !user.active }),
    })
    setList((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, active: !u.active } : u))
    )
    setLoading(null)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
          <tr>
            <th className="px-4 py-3 text-left">名前</th>
            <th className="px-4 py-3 text-left">メール</th>
            <th className="px-4 py-3 text-left">権限</th>
            <th className="px-4 py-3 text-left">最終ログイン</th>
            <th className="px-4 py-3 text-left">状態</th>
            <th className="px-4 py-3 text-left">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {list.map((user) => (
            <tr key={user.id} className={user.active ? '' : 'opacity-50'}>
              <td className="px-4 py-3 font-medium text-gray-800">{user.name}</td>
              <td className="px-4 py-3 text-gray-500">{user.email}</td>
              <td className="px-4 py-3">
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                  {ROLE_LABELS[user.role] ?? user.role}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-400 text-xs">
                {user.lastLoginAt
                  ? new Date(user.lastLoginAt).toLocaleString('ja-JP')
                  : '未ログイン'}
              </td>
              <td className="px-4 py-3">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${user.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {user.active ? '有効' : '無効'}
                </span>
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={() => toggleActive(user)}
                  disabled={loading === user.id}
                  className="text-xs px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  {user.active ? '無効化' : '有効化'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
