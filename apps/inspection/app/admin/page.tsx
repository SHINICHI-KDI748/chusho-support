'use client'

import { useState, useEffect, useCallback } from 'react'
import type { InspectionRecord, ItemResult, ItemStatus } from '@/lib/records-db'
import type { InspectionTarget, Frequency } from '@/lib/masters-db'
import type { TargetStatus } from '@/lib/records-db'

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

const FREQUENCY_LABELS: Record<Frequency, string> = {
  daily: '日次', weekly: '週次', monthly: '月次',
}

function today() { return new Date().toISOString().slice(0, 10) }

// 点検項目結果の編集用マップ
type EditResultMap = Record<number, { status: ItemStatus; note: string }>

function statusStyle(current: ItemStatus, value: ItemStatus): string {
  const base = 'px-2 py-1 rounded text-xs font-bold border transition '
  if (current !== value) return base + 'bg-white border-gray-200 text-gray-400'
  if (value === 'ok') return base + 'bg-green-500 border-green-500 text-white'
  if (value === 'ng') return base + 'bg-red-500 border-red-500 text-white'
  return base + 'bg-gray-300 border-gray-300 text-gray-600'
}

export default function AdminPage() {
  const [statuses, setStatuses]   = useState<TargetStatus[]>([])
  const [records, setRecords]     = useState<InspectionRecord[]>([])
  const [targets, setTargets]     = useState<InspectionTarget[]>([])
  const [loading, setLoading]     = useState(false)
  const [dateFrom, setDateFrom]   = useState(today())
  const [dateTo, setDateTo]       = useState(today())
  const [targetId, setTargetId]   = useState('')
  const [ngOnly, setNgOnly]       = useState(false)
  const [expanded, setExpanded]   = useState<Set<number>>(new Set())

  // 編集状態
  const [editingId, setEditingId]   = useState<number | null>(null)
  const [editDate, setEditDate]     = useState('')
  const [editInspector, setEditInspector] = useState('')
  const [editNote, setEditNote]     = useState('')
  const [editResults, setEditResults] = useState<EditResultMap>({})
  const [saving, setSaving]         = useState(false)

  // 担当者候補（マスタには無いのでレコードから収集）
  const [inspectors, setInspectors] = useState<string[]>([])

  useEffect(() => {
    fetch(BASE + '/api/masters?all=true').then(r => r.json()).then(setTargets)
  }, [])

  // 今日の実施状況
  useEffect(() => {
    fetch(`${BASE}/api/status?date=${today()}`).then(r => r.json()).then(setStatuses)
  }, [])

  const fetchRecords = useCallback(async () => {
    setLoading(true)
    const p = new URLSearchParams()
    if (dateFrom) p.set('dateFrom', dateFrom)
    if (dateTo)   p.set('dateTo',   dateTo)
    if (targetId) p.set('target_id', targetId)
    if (ngOnly)   p.set('ng_only',  'true')
    const res = await fetch(`${BASE}/api/records?${p}`)
    const data: InspectionRecord[] = await res.json()
    setRecords(data)
    // 担当者リストをレコードから収集
    setInspectors([...new Set(data.map(r => r.inspector))])
    setLoading(false)
  }, [dateFrom, dateTo, targetId, ngOnly])

  useEffect(() => { fetchRecords() }, [fetchRecords])

  function buildExportUrl() {
    const p = new URLSearchParams()
    if (dateFrom) p.set('dateFrom', dateFrom)
    if (dateTo)   p.set('dateTo',   dateTo)
    if (targetId) p.set('target_id', targetId)
    if (ngOnly)   p.set('ng_only',  'true')
    return `${BASE}/api/export?${p}`
  }

  function toggleExpand(id: number) {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  // ---------- 編集操作 ----------

  function startEdit(r: InspectionRecord) {
    setEditingId(r.id)
    setEditDate(r.date)
    setEditInspector(r.inspector)
    setEditNote(r.note)
    const map: EditResultMap = {}
    r.results.forEach(res => { map[res.item_id] = { status: res.status, note: res.note } })
    setEditResults(map)
    // 編集中の行を展開
    setExpanded(prev => new Set([...prev, r.id]))
  }

  function cancelEdit() { setEditingId(null) }

  async function saveEdit(r: InspectionRecord) {
    setSaving(true)
    const updatedResults: ItemResult[] = r.results.map(res => ({
      ...res,
      status: editResults[res.item_id]?.status ?? res.status,
      note:   editResults[res.item_id]?.note   ?? res.note,
    }))
    await fetch(`${BASE}/api/records/${r.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date:      editDate,
        inspector: editInspector,
        note:      editNote,
        results:   updatedResults,
      }),
    })
    setEditingId(null)
    setSaving(false)
    // ステータスも再取得（日付が変わった場合に反映）
    fetchRecords()
    fetch(`${BASE}/api/status?date=${today()}`).then(r => r.json()).then(setStatuses)
  }

  // ---------- サマリー ----------
  const totalNg  = records.filter(r => r.has_ng).length
  const pendingToday = statuses.filter(s => s.status === 'pending')
  const doneToday    = statuses.filter(s => s.status === 'done')

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">管理一覧</h1>

      {/* ===== 今日の実施状況カード ===== */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <h2 className="font-bold text-sm mb-3">
          今日の点検状況
          <span className="ml-2 text-xs text-gray-400 font-normal">{today()}</span>
        </h2>
        {statuses.length === 0 ? (
          <p className="text-xs text-gray-400">点検対象が未登録です。マスタ管理から追加してください。</p>
        ) : (
          <div className="flex flex-col gap-2">
            {/* 未実施（赤・黄） */}
            {pendingToday.map(s => (
              <div key={s.target_id}
                className={`flex items-center justify-between px-3 py-2 rounded border-l-4 text-sm
                  ${s.frequency === 'daily'
                    ? 'border-red-500 bg-red-50'
                    : 'border-yellow-400 bg-yellow-50'}`}>
                <div>
                  <span className="font-medium">{s.target_name}</span>
                  <span className="ml-2 text-xs text-gray-500">
                    [{FREQUENCY_LABELS[s.frequency]}]
                  </span>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded
                  ${s.frequency === 'daily' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {s.frequency === 'daily' ? '本日未実施' : '未実施'}
                </span>
              </div>
            ))}
            {/* 実施済み */}
            {doneToday.map(s => (
              <div key={s.target_id}
                className="flex items-center justify-between px-3 py-2 rounded border-l-4 border-green-400 bg-green-50 text-sm">
                <div>
                  <span className="font-medium">{s.target_name}</span>
                  <span className="ml-2 text-xs text-gray-500">
                    [{FREQUENCY_LABELS[s.frequency]}] {s.record_count}件
                  </span>
                  {s.last_date && (
                    <span className="ml-1 text-xs text-gray-400">最終: {s.last_date}</span>
                  )}
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-green-100 text-green-700">
                  実施済
                </span>
              </div>
            ))}
            {/* サマリーバッジ */}
            {pendingToday.length > 0 && (
              <p className="text-xs text-red-600 font-medium mt-1">
                ⚠ 未実施 {pendingToday.length}件（日次: {pendingToday.filter(s => s.frequency === 'daily').length}件）
              </p>
            )}
          </div>
        )}
      </div>

      {/* ===== 絞り込みフォーム ===== */}
      <div className="bg-white rounded-lg shadow p-4 mb-4 flex flex-col gap-3">
        <div className="flex gap-3 flex-wrap">
          <div className="flex flex-col gap-1 flex-1 min-w-[120px]">
            <label className="text-xs font-medium">日付（から）</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="border rounded px-2 py-1.5 text-sm" />
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-[120px]">
            <label className="text-xs font-medium">日付（まで）</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="border rounded px-2 py-1.5 text-sm" />
          </div>
        </div>
        <div className="flex gap-3 flex-wrap">
          <div className="flex flex-col gap-1 flex-1 min-w-[150px]">
            <label className="text-xs font-medium">点検対象</label>
            <select value={targetId} onChange={e => setTargetId(e.target.value)}
              className="border rounded px-2 py-1.5 text-sm bg-white">
              <option value="">すべて</option>
              {targets.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={ngOnly} onChange={e => setNgOnly(e.target.checked)}
                className="w-4 h-4" />
              NGのみ
            </label>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchRecords}
            className="bg-emerald-700 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-emerald-800">
            絞り込む
          </button>
          <button onClick={() => { setDateFrom(''); setDateTo(''); setTargetId(''); setNgOnly(false) }}
            className="border px-4 py-1.5 rounded text-sm text-gray-600 hover:bg-gray-100">
            リセット
          </button>
        </div>
      </div>

      {/* ===== サマリー & CSV ===== */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex gap-3 text-sm">
          <span>件数：<strong>{records.length}</strong></span>
          <span className="text-green-700">正常：<strong>{records.length - totalNg}</strong></span>
          {totalNg > 0 && <span className="text-red-600 font-bold">NG有：{totalNg}</span>}
        </div>
        <a href={buildExportUrl()} download
          className="bg-emerald-700 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-emerald-800">
          CSV出力
        </a>
      </div>

      {/* ===== レコード一覧 ===== */}
      {loading ? (
        <p className="text-gray-500 text-sm">読み込み中...</p>
      ) : records.length === 0 ? (
        <p className="text-gray-500 text-sm">該当データなし</p>
      ) : (
        <div className="flex flex-col gap-2">
          {records.map(r => {
            const isEditing = editingId === r.id
            const isExpanded = expanded.has(r.id)

            return (
              <div key={r.id}
                className={`bg-white rounded-lg shadow border-l-4
                  ${isEditing ? 'border-blue-400' : r.has_ng ? 'border-red-500' : 'border-green-400'}`}>

                {/* サマリー行 */}
                <div className="flex items-center justify-between px-4 py-3">
                  <button type="button" className="flex-1 text-left"
                    onClick={() => !isEditing && toggleExpand(r.id)}>
                    <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
                      <span className="font-medium text-sm">{r.date}</span>
                      <span className="text-gray-600 text-sm">{r.target_name}</span>
                      <span className="text-gray-500 text-xs">{r.inspector}</span>
                      {r.has_ng
                        ? <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded font-bold">NG有</span>
                        : <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded">正常</span>}
                      {r.photo_paths.length > 0 && (
                        <span className="text-xs text-gray-400">📷{r.photo_paths.length}</span>
                      )}
                    </div>
                  </button>
                  <div className="flex items-center gap-1 ml-2">
                    {!isEditing ? (
                      <>
                        <button onClick={() => startEdit(r)}
                          className="text-xs text-blue-600 border border-blue-200 px-2 py-0.5 rounded hover:bg-blue-50">
                          編集
                        </button>
                        <button onClick={() => toggleExpand(r.id)}
                          className="text-gray-400 text-xs w-5 text-center">
                          {isExpanded ? '▲' : '▼'}
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => saveEdit(r)} disabled={saving}
                          className="text-xs bg-blue-700 text-white px-2 py-1 rounded hover:bg-blue-800 disabled:opacity-50">
                          保存
                        </button>
                        <button onClick={cancelEdit}
                          className="text-xs border px-2 py-1 rounded text-gray-500 hover:bg-gray-100">
                          取消
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* 展開 / 編集エリア */}
                {(isExpanded || isEditing) && (
                  <div className="px-4 pb-4 border-t">
                    {isEditing ? (
                      /* ===== 編集フォーム ===== */
                      <div className="mt-3 flex flex-col gap-3">
                        {/* 日付・担当者 */}
                        <div className="flex gap-3 flex-wrap">
                          <div className="flex flex-col gap-1 flex-1 min-w-[120px]">
                            <label className="text-xs font-medium">日付</label>
                            <input type="date" value={editDate}
                              onChange={e => setEditDate(e.target.value)}
                              className="border rounded px-2 py-1.5 text-sm" />
                          </div>
                          <div className="flex flex-col gap-1 flex-1 min-w-[120px]">
                            <label className="text-xs font-medium">担当者</label>
                            <input type="text" value={editInspector}
                              onChange={e => setEditInspector(e.target.value)}
                              list="inspector-list"
                              className="border rounded px-2 py-1.5 text-sm" />
                            <datalist id="inspector-list">
                              {inspectors.map(i => <option key={i} value={i} />)}
                            </datalist>
                          </div>
                        </div>

                        {/* 点検項目 */}
                        <div>
                          <p className="text-xs font-medium mb-2 text-gray-600">点検項目の結果を修正</p>
                          <div className="flex flex-col gap-2">
                            {r.results.map(res => (
                              <div key={res.item_id}
                                className={`p-2 rounded border ${editResults[res.item_id]?.status === 'ng' ? 'border-red-200 bg-red-50' : 'border-gray-100'}`}>
                                <p className="text-xs font-medium mb-1">{res.label}</p>
                                <div className="flex gap-1">
                                  {(['ok', 'ng', 'na'] as ItemStatus[]).map(st => (
                                    <button key={st} type="button"
                                      onClick={() => setEditResults(prev => ({
                                        ...prev,
                                        [res.item_id]: { ...prev[res.item_id], status: st }
                                      }))}
                                      className={statusStyle(editResults[res.item_id]?.status ?? res.status, st)}>
                                      {st === 'ok' ? '○正常' : st === 'ng' ? '×NG' : '—未実施'}
                                    </button>
                                  ))}
                                </div>
                                {(editResults[res.item_id]?.status ?? res.status) === 'ng' && (
                                  <input
                                    type="text"
                                    value={editResults[res.item_id]?.note ?? res.note}
                                    onChange={e => setEditResults(prev => ({
                                      ...prev,
                                      [res.item_id]: { ...prev[res.item_id], note: e.target.value }
                                    }))}
                                    placeholder="NGコメント"
                                    className="mt-1 w-full border rounded px-2 py-1 text-xs"
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 全体備考 */}
                        <div>
                          <label className="text-xs font-medium">全体備考</label>
                          <textarea value={editNote} onChange={e => setEditNote(e.target.value)}
                            rows={2} className="w-full border rounded px-2 py-1.5 text-sm resize-none mt-1" />
                        </div>
                      </div>
                    ) : (
                      /* ===== 詳細表示 ===== */
                      <>
                        <table className="w-full text-sm mt-2">
                          <thead>
                            <tr className="text-left text-gray-500 text-xs">
                              <th className="py-1">点検項目</th>
                              <th className="py-1 text-center w-14">結果</th>
                              <th className="py-1">コメント</th>
                            </tr>
                          </thead>
                          <tbody>
                            {r.results.map(res => (
                              <tr key={res.item_id} className={res.status === 'ng' ? 'bg-red-50' : ''}>
                                <td className="py-1 pr-2 text-xs">{res.label}</td>
                                <td className="py-1 text-center font-bold text-sm">
                                  {res.status === 'ok' ? <span className="text-green-600">○</span>
                                    : res.status === 'ng' ? <span className="text-red-600">×</span>
                                    : <span className="text-gray-400">—</span>}
                                </td>
                                <td className="py-1 text-gray-500 text-xs">{res.note}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {r.note && (
                          <p className="mt-2 text-xs text-gray-600 border-t pt-2">備考: {r.note}</p>
                        )}
                        {r.photo_paths.length > 0 && (
                          <div className="flex gap-2 mt-2 flex-wrap">
                            {r.photo_paths.map((src, i) => (
                              <a key={i} href={src} target="_blank" rel="noopener noreferrer">
                                <img src={src} alt="photo" className="w-16 h-16 object-cover rounded border" />
                              </a>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
