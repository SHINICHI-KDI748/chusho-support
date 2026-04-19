'use client'

import { useState, useEffect, useCallback } from 'react'
import type { UnifiedEvent } from '@/lib/unified'

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

// ---------- ユーティリティ ----------

function todayString(): string {
  return new Date().toISOString().slice(0, 10)
}

function nDaysAgoString(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

// ---------- コンポーネント ----------

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    ng:          'bg-red-100 text-red-700',
    pending:     'bg-yellow-100 text-yellow-700',
    needs_check: 'bg-orange-100 text-orange-700',
    ok:          'bg-green-100 text-green-700',
  }
  const labels: Record<string, string> = {
    ng: 'NG', pending: '未実施', needs_check: '要確認', ok: '正常',
  }
  return (
    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded ${styles[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {labels[status] ?? status}
    </span>
  )
}

function SourceBadge({ source }: { source: string }) {
  return source === 'work_log' ? (
    <span className="inline-block text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700">作業</span>
  ) : (
    <span className="inline-block text-xs px-2 py-0.5 rounded bg-teal-100 text-teal-700">点検</span>
  )
}

export default function RecordsPage() {
  const today = todayString()

  const [tab, setTab]             = useState<'all' | 'work' | 'inspection'>('all')
  const [dateFrom, setDateFrom]   = useState(nDaysAgoString(6))
  const [dateTo, setDateTo]       = useState(today)
  const [ngOnly, setNgOnly]       = useState(false)
  const [keyword, setKeyword]     = useState('')
  const [events, setEvents]       = useState<UnifiedEvent[]>([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({
        dateFrom,
        dateTo,
        type: tab,
      })
      if (ngOnly) params.set('ng_only', 'true')
      const res = await fetch(`${BASE}/api/unified?${params}`)
      if (!res.ok) throw new Error('データ取得失敗')
      const data: UnifiedEvent[] = await res.json()
      setEvents(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : '不明なエラー')
    } finally {
      setLoading(false)
    }
  }, [tab, dateFrom, dateTo, ngOnly])

  useEffect(() => { fetchEvents() }, [fetchEvents])

  // クライアント側キーワードフィルタ
  const filtered = keyword.trim()
    ? events.filter(e => {
        const kw = keyword.toLowerCase()
        return (
          e.target_name.toLowerCase().includes(kw) ||
          e.assignee_name.toLowerCase().includes(kw) ||
          e.process_or_category.toLowerCase().includes(kw) ||
          e.note.toLowerCase().includes(kw) ||
          (e.ng_labels ?? []).some(l => l.toLowerCase().includes(kw))
        )
      })
    : events

  function downloadCSV() {
    const type = tab === 'all' ? 'work' : tab
    window.open(`/api/export?type=${type}&dateFrom=${dateFrom}&dateTo=${dateTo}`, '_blank')
    if (tab === 'all' || tab === 'inspection') {
      // 点検も出す
      setTimeout(() => window.open(`/api/export?type=inspection&dateFrom=${dateFrom}&dateTo=${dateTo}`, '_blank'), 500)
    }
  }

  return (
    <div className="space-y-5">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">詳細一覧</h1>
        <button onClick={downloadCSV}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition">
          ⬇ CSV出力
        </button>
      </div>

      {/* フィルタバー */}
      <div className="bg-white rounded-xl border shadow-sm p-4 flex flex-wrap gap-3 items-end">
        {/* タブ */}
        <div>
          <p className="text-xs text-gray-500 mb-1">区分</p>
          <div className="flex rounded-lg border overflow-hidden">
            {(['all', 'work', 'inspection'] as const).map(t => (
              <button key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 text-sm transition
                  ${tab === t
                    ? 'bg-gray-800 text-white font-medium'
                    : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                {t === 'all' ? '全て' : t === 'work' ? '作業実績' : '点検記録'}
              </button>
            ))}
          </div>
        </div>

        {/* 日付 */}
        <div>
          <p className="text-xs text-gray-500 mb-1">開始日</p>
          <input type="date" value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="border rounded px-2 py-1.5 text-sm" />
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">終了日</p>
          <input type="date" value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="border rounded px-2 py-1.5 text-sm" />
        </div>

        {/* キーワード */}
        <div className="flex-1 min-w-[160px]">
          <p className="text-xs text-gray-500 mb-1">キーワード</p>
          <input type="text" value={keyword}
            onChange={e => setKeyword(e.target.value)}
            placeholder="対象名・担当者・備考"
            className="w-full border rounded px-2 py-1.5 text-sm" />
        </div>

        {/* NGのみ */}
        <label className="flex items-center gap-1.5 text-sm cursor-pointer pb-1.5">
          <input type="checkbox" checked={ngOnly}
            onChange={e => setNgOnly(e.target.checked)}
            className="accent-red-600" />
          <span className="text-gray-700">NGのみ</span>
        </label>

        {/* 件数 */}
        <div className="text-sm text-gray-500 pb-1.5">
          {filtered.length} 件
        </div>
      </div>

      {/* エラー */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
          ⚠ {error}
        </div>
      )}

      {/* テーブル */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-gray-400">読み込み中...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            {keyword || ngOnly ? 'フィルタ条件に一致するデータがありません' : '指定期間のデータがありません'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide border-b">
                  <th className="text-left px-3 py-2.5">日付</th>
                  <th className="text-left px-3 py-2.5">区分</th>
                  <th className="text-left px-3 py-2.5">対象 / 品目</th>
                  <th className="text-left px-3 py-2.5">工程 / 種別</th>
                  <th className="text-left px-3 py-2.5">担当者</th>
                  <th className="text-left px-3 py-2.5">ステータス</th>
                  <th className="text-left px-3 py-2.5">数量</th>
                  <th className="text-left px-3 py-2.5">備考 / NG項目</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map(ev => (
                  <tr key={ev.id} className={`hover:bg-gray-50 transition
                    ${ev.status === 'ng' ? 'bg-red-50' : ''}
                    ${ev.status === 'needs_check' ? 'bg-orange-50' : ''}`}
                  >
                    <td className="px-3 py-2.5 tabular-nums text-gray-600 whitespace-nowrap">{ev.date}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <SourceBadge source={ev.source_type} />
                    </td>
                    <td className="px-3 py-2.5 font-medium text-gray-800 max-w-[200px] truncate">
                      {ev.target_name}
                    </td>
                    <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">
                      {ev.process_or_category}
                    </td>
                    <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{ev.assignee_name}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <StatusBadge status={ev.status} />
                    </td>
                    <td className="px-3 py-2.5 tabular-nums text-gray-600 text-right whitespace-nowrap">
                      {ev.quantity != null ? ev.quantity.toLocaleString() : '—'}
                    </td>
                    <td className="px-3 py-2.5 text-gray-600 max-w-[240px]">
                      {/* 作業実績：備考 */}
                      {ev.source_type === 'work_log' && ev.note && (
                        <span className="text-orange-700">{ev.note}</span>
                      )}
                      {/* 点検：NG項目 */}
                      {ev.source_type === 'inspection' && ev.ng_labels && ev.ng_labels.length > 0 && (
                        <span className="text-red-600">{ev.ng_labels.join('、')}</span>
                      )}
                      {/* 点検：備考（NGなし） */}
                      {ev.source_type === 'inspection' && (!ev.ng_labels || ev.ng_labels.length === 0) && ev.note && (
                        <span className="text-gray-500">{ev.note}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ページ下部のリンク */}
      <div className="flex gap-4 text-sm text-gray-500">
        <a href={`${process.env.NEXT_PUBLIC_APP1_URL ?? 'http://localhost:3000'}/admin`} target="_blank" rel="noopener"
          className="hover:text-blue-600 transition">
          ↗ 作業実績 管理画面
        </a>
        <a href={`${process.env.NEXT_PUBLIC_APP2_URL ?? 'http://localhost:3001'}/admin`} target="_blank" rel="noopener"
          className="hover:text-blue-600 transition">
          ↗ 点検記録 管理画面
        </a>
      </div>
    </div>
  )
}
