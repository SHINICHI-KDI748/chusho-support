'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  ResponsiveContainer, ComposedChart, Bar, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'
import type { DashboardSummary, AssigneeSummary, UnifiedEvent } from '@/lib/unified'
import type { TargetStatus } from '@/lib/app2-reader'
import type { DayTrend } from '@/app/api/trend/route'
import type { ProcessSummaryResponse } from '@/app/api/process-summary/route'

// ---------- 型定義 ----------

interface DashboardResponse extends DashboardSummary {
  dateFrom: string
  dateTo: string
  pending_targets: TargetStatus[]
}

// ---------- ユーティリティ ----------

function todayString(): string {
  return new Date().toISOString().slice(0, 10)
}
function yesterdayString(): string {
  const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().slice(0, 10)
}
function nDaysAgoString(n: number): string {
  const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10)
}

type Period = 'today' | 'yesterday' | 'last7' | 'custom'

function periodToDates(period: Period, customFrom: string, customTo: string) {
  const today = todayString()
  if (period === 'today')     return { from: today, to: today }
  if (period === 'yesterday') return { from: yesterdayString(), to: yesterdayString() }
  if (period === 'last7')     return { from: nDaysAgoString(6), to: today }
  return { from: customFrom, to: customTo }
}

// ---------- 共通コンポーネント ----------

function SummaryCard({ label, value, sub, color, alert }: {
  label: string; value: number | string; sub?: string; color: string; alert?: boolean
}) {
  return (
    <div className={`bg-white rounded-xl border-l-4 ${color} shadow-sm p-4 ${alert ? 'ring-2 ring-red-300' : ''}`}>
      <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
      <p className={`text-3xl font-bold ${alert ? 'text-red-600' : 'text-gray-800'}`}>{value}</p>
      {sub && <p className={`text-xs mt-1 ${alert ? 'text-red-400' : 'text-gray-400'}`}>{sub}</p>}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    ng:          'bg-red-100 text-red-700 border border-red-200',
    pending:     'bg-yellow-100 text-yellow-700 border border-yellow-200',
    needs_check: 'bg-orange-100 text-orange-700 border border-orange-200',
    ok:          'bg-green-100 text-green-700 border border-green-200',
    done:        'bg-green-100 text-green-700 border border-green-200',
  }
  const labels: Record<string, string> = {
    ng: 'NG', pending: '未実施', needs_check: '要確認', ok: '正常', done: '完了',
  }
  return (
    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded ${styles[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {labels[status] ?? status}
    </span>
  )
}

const FREQ_LABELS: Record<string, string> = {
  daily: '日次', weekly: '週次', monthly: '月次',
}

// ---------- トレンドグラフ ----------

function TrendChart({ data }: { data: DayTrend[] }) {
  // 直近14日分に絞って見やすく表示
  const display = data.slice(-14)
  const formatted = display.map(d => ({
    ...d,
    label: d.date.slice(5), // MM-DD
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <ComposedChart data={formatted} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          yAxisId="count"
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
          formatter={(value, name) => {
            const labels: Record<string, string> = {
              work_count: '作業件数', insp_count: '点検件数', ng_count: 'NG件数',
            }
            const nameStr = String(name ?? '')
            return [value, labels[nameStr] ?? nameStr]
          }}
        />
        <Legend
          iconSize={10}
          wrapperStyle={{ fontSize: 12 }}
          formatter={(value: string) => {
            const labels: Record<string, string> = {
              work_count: '作業件数', insp_count: '点検件数', ng_count: 'NG件数',
            }
            return labels[value] ?? value
          }}
        />
        <Bar yAxisId="count" dataKey="work_count"  fill="#3b82f6" radius={[3,3,0,0]} maxBarSize={32} />
        <Bar yAxisId="count" dataKey="insp_count"  fill="#14b8a6" radius={[3,3,0,0]} maxBarSize={32} />
        <Line
          yAxisId="count"
          type="monotone"
          dataKey="ng_count"
          stroke="#ef4444"
          strokeWidth={2}
          dot={{ r: 3, fill: '#ef4444' }}
          activeDot={{ r: 5 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

// ---------- 工程別集計テーブル ----------

function ProcessSummarySection({ data, dateLabel }: { data: ProcessSummaryResponse; dateLabel: string }) {
  const [tab, setTab] = useState<'process' | 'inspection'>('process')

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      <div className="px-4 py-3 border-b flex items-center gap-3">
        <h2 className="font-semibold text-gray-800">工程別 / 対象別 集計</h2>
        <p className="text-xs text-gray-400">{dateLabel}</p>
        <div className="ml-auto flex rounded-lg border overflow-hidden text-xs">
          <button
            onClick={() => setTab('process')}
            className={`px-3 py-1.5 transition ${tab === 'process' ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            作業（工程別）
          </button>
          <button
            onClick={() => setTab('inspection')}
            className={`px-3 py-1.5 transition ${tab === 'inspection' ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            点検（対象別）
          </button>
        </div>
      </div>

      {tab === 'process' ? (
        data.processes.length === 0 ? (
          <p className="text-center py-8 text-gray-400 text-sm">データなし</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <th className="text-left px-4 py-2.5">工程名</th>
                  <th className="text-right px-4 py-2.5">作業件数</th>
                  <th className="text-right px-4 py-2.5">合計数量</th>
                  <th className="px-4 py-2.5 text-left">割合</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {(() => {
                  const total = data.processes.reduce((s, p) => s + p.work_count, 0)
                  return data.processes.map(p => (
                    <tr key={p.name} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 font-medium text-gray-800">{p.name}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-gray-600">{p.work_count}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-gray-600">{p.work_qty.toLocaleString()}</td>
                      <td className="px-4 py-2.5 min-w-[120px]">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-100 rounded-full h-2">
                            <div
                              className="bg-blue-400 h-2 rounded-full"
                              style={{ width: `${total > 0 ? (p.work_count / total) * 100 : 0}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-400 w-8 text-right">
                            {total > 0 ? Math.round((p.work_count / total) * 100) : 0}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                })()}
              </tbody>
            </table>
          </div>
        )
      ) : (
        data.inspection_categories.length === 0 ? (
          <p className="text-center py-8 text-gray-400 text-sm">データなし</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <th className="text-left px-4 py-2.5">点検対象</th>
                  <th className="text-right px-4 py-2.5">点検件数</th>
                  <th className="text-right px-4 py-2.5">NG件数</th>
                  <th className="text-right px-4 py-2.5">NG率</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.inspection_categories.map(c => (
                  <tr key={c.name} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 font-medium text-gray-800">{c.name}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-gray-600">{c.insp_count}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">
                      {c.ng_count > 0 ? (
                        <span className="text-red-600 font-semibold">{c.ng_count}</span>
                      ) : (
                        <span className="text-gray-400">0</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-xs">
                      {c.ng_rate > 0 ? (
                        <span className={c.ng_rate >= 0.5 ? 'text-red-600 font-semibold' : 'text-orange-500'}>
                          {Math.round(c.ng_rate * 100)}%
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  )
}

// ---------- メインコンポーネント ----------

export default function DashboardPage() {
  const [period, setPeriod]         = useState<Period>('today')
  const [customFrom, setCustomFrom] = useState(todayString())
  const [customTo, setCustomTo]     = useState(todayString())
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')

  const [summary, setSummary]             = useState<DashboardResponse | null>(null)
  const [pending, setPending]             = useState<TargetStatus[]>([])
  const [ngEvents, setNgEvents]           = useState<UnifiedEvent[]>([])
  const [checkEvents, setCheckEvents]     = useState<UnifiedEvent[]>([])
  const [trend, setTrend]                 = useState<DayTrend[]>([])
  const [processSummary, setProcessSummary] = useState<ProcessSummaryResponse | null>(null)

  const { from, to } = periodToDates(period, customFrom, customTo)
  const dateLabel = from === to ? from : `${from} 〜 ${to}`

  const app1Url = process.env.NEXT_PUBLIC_APP1_URL ?? 'http://localhost:3000'
  const app2Url = process.env.NEXT_PUBLIC_APP2_URL ?? 'http://localhost:3001'

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [sumRes, ngRes, trendRes, procRes] = await Promise.all([
        fetch(`/api/dashboard?dateFrom=${from}&dateTo=${to}`),
        fetch(`/api/unified?dateFrom=${from}&dateTo=${to}&type=inspection&ng_only=true`),
        fetch(`/api/trend?days=30`),
        fetch(`/api/process-summary?dateFrom=${from}&dateTo=${to}`),
      ])
      if (!sumRes.ok || !ngRes.ok) throw new Error('データ取得に失敗しました')

      const sumData: DashboardResponse     = await sumRes.json()
      const ngData: UnifiedEvent[]         = await ngRes.json()
      const trendData: DayTrend[]          = trendRes.ok ? await trendRes.json() : []
      const procData: ProcessSummaryResponse = procRes.ok ? await procRes.json() : { processes: [], inspection_categories: [], dateFrom: from, dateTo: to }

      setSummary(sumData)
      setPending(sumData.pending_targets.filter(s => s.status === 'pending'))
      setNgEvents(ngData)
      setTrend(trendData)
      setProcessSummary(procData)

      const checkRes = await fetch(`/api/unified?dateFrom=${from}&dateTo=${to}&type=work&needs_check=true`)
      if (checkRes.ok) setCheckEvents(await checkRes.json())
    } catch (e) {
      setError(e instanceof Error ? e.message : '不明なエラー')
    } finally {
      setLoading(false)
    }
  }, [from, to])

  useEffect(() => { fetchAll() }, [fetchAll])

  function downloadCSV(type: 'work' | 'inspection' | 'pending') {
    const base = type === 'pending'
      ? `/api/export?type=pending`
      : `/api/export?type=${type}&dateFrom=${from}&dateTo=${to}`
    window.open(base, '_blank')
  }

  // ---------- 優先度インジケーター ----------
  const hasUrgent = pending.length > 0 || ngEvents.length > 0

  return (
    <div className="space-y-6">

      {/* =========== ヘッダー =========== */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">統合ダッシュボード</h1>
          <p className="text-sm text-gray-500 mt-0.5">集計期間：{dateLabel}</p>
        </div>
        <div className="sm:ml-auto flex flex-wrap gap-2">
          {(['today', 'yesterday', 'last7', 'custom'] as Period[]).map(p => (
            <button key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-sm rounded-lg border transition
                ${period === p
                  ? 'bg-blue-700 text-white border-blue-700 font-medium'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'}`}
            >
              {p === 'today' ? '今日' : p === 'yesterday' ? '昨日' : p === 'last7' ? '直近7日' : 'カスタム'}
            </button>
          ))}
        </div>
      </div>

      {period === 'custom' && (
        <div className="bg-white rounded-lg border p-3 flex flex-wrap gap-3 items-center">
          <label className="text-sm font-medium text-gray-700">開始</label>
          <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
            className="border rounded px-2 py-1.5 text-sm" />
          <span className="text-gray-400">〜</span>
          <label className="text-sm font-medium text-gray-700">終了</label>
          <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
            className="border rounded px-2 py-1.5 text-sm" />
        </div>
      )}

      {/* 要対応バナー */}
      {!loading && hasUrgent && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center gap-2 text-sm text-red-700">
          <span className="text-base">⚠</span>
          <span className="font-semibold">要対応あり</span>
          <span className="text-red-500">—</span>
          {pending.length > 0 && <span>未実施点検 {pending.length}件</span>}
          {pending.length > 0 && ngEvents.length > 0 && <span className="text-red-400">／</span>}
          {ngEvents.length > 0 && <span>NG {ngEvents.length}件</span>}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
          ⚠ {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-gray-400">読み込み中...</div>
      ) : !summary ? null : (
        <>
          {/* =========== サマリーカード =========== */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <SummaryCard label="作業実績" value={summary.total_work_logs} sub="件" color="border-blue-500" />
            <SummaryCard label="点検実施" value={summary.total_inspections} sub="件" color="border-teal-500" />
            <SummaryCard
              label="未実施点検"
              value={summary.total_pending}
              sub={summary.total_pending > 0 ? '要対応' : '問題なし'}
              color={summary.total_pending > 0 ? 'border-yellow-500' : 'border-gray-300'}
              alert={summary.total_pending > 0}
            />
            <SummaryCard
              label="NG件数"
              value={summary.total_ng}
              sub={summary.total_ng > 0 ? '要確認' : '問題なし'}
              color={summary.total_ng > 0 ? 'border-red-500' : 'border-gray-300'}
              alert={summary.total_ng > 0}
            />
            <SummaryCard
              label="備考あり作業"
              value={summary.total_needs_check}
              sub={summary.total_needs_check > 0 ? '要確認' : '問題なし'}
              color={summary.total_needs_check > 0 ? 'border-orange-400' : 'border-gray-300'}
            />
          </div>

          {/* =========== 未実施・NG・備考 の3カラム =========== */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* 左：未実施点検 */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <h2 className="font-semibold text-gray-800">
                  未実施点検
                  {pending.length > 0 && (
                    <span className="ml-2 bg-yellow-100 text-yellow-700 text-xs px-1.5 py-0.5 rounded">{pending.length}件</span>
                  )}
                </h2>
                <button onClick={() => downloadCSV('pending')} className="text-xs text-blue-600 hover:underline">CSV</button>
              </div>
              {pending.length === 0 ? (
                <p className="text-center py-8 text-gray-400 text-sm">✓ 全て実施済</p>
              ) : (
                <ul className="divide-y">
                  {pending.map(s => (
                    <li key={s.target_id} className="px-4 py-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{s.target_name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {FREQ_LABELS[s.frequency] ?? s.frequency}
                            {s.last_date ? ` · 前回: ${s.last_date}` : ' · 初回未実施'}
                          </p>
                        </div>
                        <StatusBadge status="pending" />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* 中：NG一覧 */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <h2 className="font-semibold text-gray-800">
                  NG一覧
                  {ngEvents.length > 0 && (
                    <span className="ml-2 bg-red-100 text-red-700 text-xs px-1.5 py-0.5 rounded">{ngEvents.length}件</span>
                  )}
                </h2>
                <button onClick={() => downloadCSV('inspection')} className="text-xs text-blue-600 hover:underline">CSV</button>
              </div>
              {ngEvents.length === 0 ? (
                <p className="text-center py-8 text-gray-400 text-sm">✓ NG なし</p>
              ) : (
                <ul className="divide-y max-h-72 overflow-y-auto">
                  {ngEvents.map(ev => (
                    <li key={ev.id} className="px-4 py-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{ev.target_name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{ev.date} · {ev.assignee_name}</p>
                          {ev.ng_labels && ev.ng_labels.length > 0 && (
                            <p className="text-xs text-red-600 mt-1 leading-relaxed">{ev.ng_labels.join('、')}</p>
                          )}
                        </div>
                        <StatusBadge status="ng" />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* 右：備考あり（要確認）作業実績 */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <h2 className="font-semibold text-gray-800">
                  要確認（備考あり）
                  {checkEvents.length > 0 && (
                    <span className="ml-2 bg-orange-100 text-orange-700 text-xs px-1.5 py-0.5 rounded">{checkEvents.length}件</span>
                  )}
                </h2>
                <button onClick={() => downloadCSV('work')} className="text-xs text-blue-600 hover:underline">CSV</button>
              </div>
              {checkEvents.length === 0 ? (
                <p className="text-center py-8 text-gray-400 text-sm">✓ 要確認 なし</p>
              ) : (
                <ul className="divide-y max-h-72 overflow-y-auto">
                  {checkEvents.map(ev => (
                    <li key={ev.id} className="px-4 py-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{ev.target_name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{ev.date} · {ev.process_or_category} · {ev.assignee_name}</p>
                          {ev.note && <p className="text-xs text-orange-700 mt-1 break-words">{ev.note}</p>}
                        </div>
                        <StatusBadge status="needs_check" />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* =========== 日別トレンドグラフ =========== */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-800">日別トレンド（直近30日）</h2>
                <p className="text-xs text-gray-400 mt-0.5">棒：作業件数（青）/ 点検件数（緑）　線：NG件数（赤）</p>
              </div>
            </div>
            <div className="p-4">
              {trend.length === 0 ? (
                <p className="text-center py-8 text-gray-400 text-sm">データなし</p>
              ) : (
                <TrendChart data={trend} />
              )}
            </div>
          </div>

          {/* =========== 工程別 / 対象別 集計 =========== */}
          {processSummary && (
            <ProcessSummarySection data={processSummary} dateLabel={dateLabel} />
          )}

          {/* =========== 担当者別サマリ =========== */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="px-4 py-3 border-b">
              <h2 className="font-semibold text-gray-800">担当者別サマリ</h2>
              <p className="text-xs text-gray-400 mt-0.5">集計期間：{dateLabel}</p>
            </div>
            {summary.assignee_summary.length === 0 ? (
              <p className="text-center py-8 text-gray-400 text-sm">データなし</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                      <th className="text-left px-4 py-2.5">担当者</th>
                      <th className="text-right px-4 py-2.5">作業件数</th>
                      <th className="text-right px-4 py-2.5">合計数量</th>
                      <th className="text-right px-4 py-2.5">点検件数</th>
                      <th className="text-right px-4 py-2.5">NG件数</th>
                      <th className="text-right px-4 py-2.5">合計</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {summary.assignee_summary.map((a: AssigneeSummary) => (
                      <tr key={a.name} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-2.5 font-medium text-gray-800">{a.name}</td>
                        <td className="px-4 py-2.5 text-right tabular-nums text-gray-600">{a.work_count}</td>
                        <td className="px-4 py-2.5 text-right tabular-nums text-gray-600">{a.work_qty.toLocaleString()}</td>
                        <td className="px-4 py-2.5 text-right tabular-nums text-gray-600">{a.insp_count}</td>
                        <td className="px-4 py-2.5 text-right tabular-nums">
                          {a.ng_count > 0
                            ? <span className="text-red-600 font-semibold">{a.ng_count}</span>
                            : <span className="text-gray-400">0</span>}
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-gray-800">
                          {a.work_count + a.insp_count}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 text-sm font-semibold">
                    <tr>
                      <td className="px-4 py-2.5 text-gray-700">合計</td>
                      <td className="px-4 py-2.5 text-right tabular-nums">
                        {summary.assignee_summary.reduce((s, a) => s + a.work_count, 0)}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums">
                        {summary.assignee_summary.reduce((s, a) => s + a.work_qty, 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums">
                        {summary.assignee_summary.reduce((s, a) => s + a.insp_count, 0)}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-red-600">
                        {summary.assignee_summary.reduce((s, a) => s + a.ng_count, 0)}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums">
                        {summary.assignee_summary.reduce((s, a) => s + a.work_count + a.insp_count, 0)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* =========== CSV一括出力 =========== */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="px-4 py-3 border-b">
              <h2 className="font-semibold text-gray-800">CSV一括出力</h2>
              <p className="text-xs text-gray-400 mt-0.5">Excel で開くと文字化けしない（BOM付きUTF-8）</p>
            </div>
            <div className="p-4 flex flex-wrap gap-3">
              <button onClick={() => downloadCSV('work')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-sm font-medium transition">
                ⬇ 作業実績 CSV
              </button>
              <button onClick={() => downloadCSV('inspection')}
                className="flex items-center gap-2 px-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded-lg text-sm font-medium transition">
                ⬇ 点検記録 CSV
              </button>
              <button onClick={() => downloadCSV('pending')}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border border-yellow-200 rounded-lg text-sm font-medium transition">
                ⬇ 未実施一覧 CSV（今日基準）
              </button>
              <a href="/poc-evaluation"
                className="flex items-center gap-2 px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-sm font-medium transition">
                📋 PoC評価記録
              </a>
            </div>
          </div>

          {/* =========== 入力アプリへのリンク =========== */}
          <div className="bg-gray-50 rounded-xl border p-4">
            <p className="text-xs font-medium text-gray-500 mb-3">データ入力・管理画面</p>
            <div className="flex flex-wrap gap-3">
              <a href={`${app1Url}`} target="_blank" rel="noopener"
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border rounded-lg text-sm text-gray-700 hover:border-blue-400 hover:text-blue-600 transition">
                ↗ 作業実績 入力
              </a>
              <a href={`${app1Url}/admin`} target="_blank" rel="noopener"
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border rounded-lg text-sm text-gray-700 hover:border-blue-400 hover:text-blue-600 transition">
                ↗ 作業実績 管理
              </a>
              <a href={`${app2Url}`} target="_blank" rel="noopener"
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border rounded-lg text-sm text-gray-700 hover:border-teal-400 hover:text-teal-600 transition">
                ↗ 点検チェックリスト 入力
              </a>
              <a href={`${app2Url}/admin`} target="_blank" rel="noopener"
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border rounded-lg text-sm text-gray-700 hover:border-teal-400 hover:text-teal-600 transition">
                ↗ 点検チェックリスト 管理
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
