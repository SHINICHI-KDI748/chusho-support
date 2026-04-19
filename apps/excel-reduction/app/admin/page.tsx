'use client'

import { useEffect, useState, useCallback } from 'react'

interface Record {
  id: number
  date: string
  process_name: string
  worker_name: string
  target_name: string
  quantity: number
  note: string
  created_at: string
}

interface EditForm {
  date: string
  process_name: string
  worker_name: string
  target_name: string
  quantity: string
  note: string
}

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

/** 件数カウントをソート済み配列で返す */
function countBy(records: Record[], key: keyof Record): { name: string; count: number; qty: number }[] {
  const map = new Map<string, { count: number; qty: number }>()
  records.forEach(r => {
    const k = String(r[key])
    const prev = map.get(k) ?? { count: 0, qty: 0 }
    map.set(k, { count: prev.count + 1, qty: prev.qty + r.quantity })
  })
  return Array.from(map.entries())
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.count - a.count)
}

export default function AdminPage() {
  const [records, setRecords]     = useState<Record[]>([])
  const [loading, setLoading]     = useState(false)
  const [dateFrom, setDateFrom]   = useState(today())
  const [dateTo, setDateTo]       = useState(today())
  const [keyword, setKeyword]     = useState('')
  const [showSummary, setShowSummary] = useState(true)

  // マスタ（編集時のドロップダウン用）
  const [processes, setProcesses] = useState<string[]>([])
  const [workers,   setWorkers]   = useState<string[]>([])

  // 編集状態
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm,  setEditForm]  = useState<EditForm | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)

  useEffect(() => {
    fetch(BASE + '/api/masters').then(r => r.json()).then(d => {
      setProcesses(d.processes ?? [])
      setWorkers(d.workers ?? [])
    })
  }, [])

  const fetchRecords = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (dateFrom) params.set('dateFrom', dateFrom)
    if (dateTo)   params.set('dateTo',   dateTo)
    if (keyword)  params.set('keyword',  keyword)
    const res = await fetch(`${BASE}/api/records?${params}`)
    setRecords(await res.json())
    setLoading(false)
  }, [dateFrom, dateTo, keyword])

  useEffect(() => { fetchRecords() }, [fetchRecords])

  function buildExportUrl() {
    const params = new URLSearchParams()
    if (dateFrom) params.set('dateFrom', dateFrom)
    if (dateTo)   params.set('dateTo',   dateTo)
    if (keyword)  params.set('keyword',  keyword)
    return `${BASE}/api/export?${params}`
  }

  // ---------- 編集操作 ----------

  function startEdit(r: Record) {
    setEditingId(r.id)
    setEditForm({
      date:         r.date,
      process_name: r.process_name,
      worker_name:  r.worker_name,
      target_name:  r.target_name,
      quantity:     String(r.quantity),
      note:         r.note,
    })
    setDeleteConfirmId(null)
  }

  function cancelEdit() { setEditingId(null); setEditForm(null) }

  async function saveEdit(id: number) {
    if (!editForm) return
    setSaving(true)
    await fetch(`${BASE}/api/records/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...editForm, quantity: Number(editForm.quantity) }),
    })
    setEditingId(null)
    setEditForm(null)
    setSaving(false)
    fetchRecords()
  }

  async function deleteRecord(id: number) {
    await fetch(`${BASE}/api/records/${id}`, { method: 'DELETE' })
    setDeleteConfirmId(null)
    fetchRecords()
  }

  // ---------- サマリー計算 ----------
  const totalQuantity   = records.reduce((s, r) => s + r.quantity, 0)
  const processSummary  = countBy(records, 'process_name')
  const workerSummary   = countBy(records, 'worker_name')
  const dateSummary     = countBy(records, 'date').sort((a, b) => b.name.localeCompare(a.name))

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">管理一覧</h1>

      {/* 絞り込みフォーム */}
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
          <div className="flex flex-col gap-1 flex-1 min-w-[150px]">
            <label className="text-xs font-medium">キーワード</label>
            <input type="text" value={keyword} onChange={e => setKeyword(e.target.value)}
              placeholder="工程名・担当者・品目" className="border rounded px-2 py-1.5 text-sm" />
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchRecords}
            className="bg-blue-700 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-blue-800">
            絞り込む
          </button>
          <button onClick={() => { setDateFrom(''); setDateTo(''); setKeyword('') }}
            className="border px-4 py-1.5 rounded text-sm text-gray-600 hover:bg-gray-100">
            リセット
          </button>
        </div>
      </div>

      {/* サマリーバー */}
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <div className="flex gap-4 text-sm">
          <span>件数：<strong>{records.length} 件</strong></span>
          <span>合計数量：<strong>{totalQuantity.toLocaleString()}</strong></span>
          <button onClick={() => setShowSummary(p => !p)}
            className="text-blue-600 text-xs underline ml-1">
            {showSummary ? '詳細を隠す' : '詳細を見る'}
          </button>
        </div>
        <a href={buildExportUrl()} download
          className="bg-green-700 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-green-800">
          CSV出力
        </a>
      </div>

      {/* 詳細サマリー（工程別・担当者別・日別） */}
      {showSummary && records.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">

            {/* 工程別 */}
            <div>
              <h3 className="font-medium text-xs text-gray-500 mb-2 uppercase tracking-wide">工程別</h3>
              <table className="w-full">
                <thead><tr className="text-xs text-gray-400">
                  <th className="text-left pb-1">工程名</th>
                  <th className="text-right pb-1">件数</th>
                  <th className="text-right pb-1">数量</th>
                </tr></thead>
                <tbody>
                  {processSummary.map(r => (
                    <tr key={r.name} className="border-t border-gray-50">
                      <td className="py-1 text-xs">{r.name}</td>
                      <td className="py-1 text-right text-xs font-medium">{r.count}</td>
                      <td className="py-1 text-right text-xs">{r.qty.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 担当者別 */}
            <div>
              <h3 className="font-medium text-xs text-gray-500 mb-2 uppercase tracking-wide">担当者別</h3>
              <table className="w-full">
                <thead><tr className="text-xs text-gray-400">
                  <th className="text-left pb-1">担当者</th>
                  <th className="text-right pb-1">件数</th>
                  <th className="text-right pb-1">数量</th>
                </tr></thead>
                <tbody>
                  {workerSummary.map(r => (
                    <tr key={r.name} className="border-t border-gray-50">
                      <td className="py-1 text-xs">{r.name}</td>
                      <td className="py-1 text-right text-xs font-medium">{r.count}</td>
                      <td className="py-1 text-right text-xs">{r.qty.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 日別 */}
            <div>
              <h3 className="font-medium text-xs text-gray-500 mb-2 uppercase tracking-wide">日別</h3>
              <table className="w-full">
                <thead><tr className="text-xs text-gray-400">
                  <th className="text-left pb-1">日付</th>
                  <th className="text-right pb-1">件数</th>
                  <th className="text-right pb-1">数量</th>
                </tr></thead>
                <tbody>
                  {dateSummary.slice(0, 10).map(r => (
                    <tr key={r.name} className="border-t border-gray-50">
                      <td className="py-1 text-xs">{r.name}</td>
                      <td className="py-1 text-right text-xs font-medium">{r.count}</td>
                      <td className="py-1 text-right text-xs">{r.qty.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* テーブル */}
      {loading ? (
        <p className="text-gray-500 text-sm">読み込み中...</p>
      ) : records.length === 0 ? (
        <p className="text-gray-500 text-sm">該当するデータがありません。</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm bg-white rounded-lg shadow">
            <thead>
              <tr className="bg-gray-100 text-left text-xs">
                <th className="px-3 py-2 whitespace-nowrap">日付</th>
                <th className="px-3 py-2 whitespace-nowrap">工程名</th>
                <th className="px-3 py-2 whitespace-nowrap">担当者</th>
                <th className="px-3 py-2 whitespace-nowrap">品目/作業対象</th>
                <th className="px-3 py-2 whitespace-nowrap text-right">数量</th>
                <th className="px-3 py-2 whitespace-nowrap">備考</th>
                <th className="px-3 py-2 whitespace-nowrap text-center">操作</th>
              </tr>
            </thead>
            <tbody>
              {records.map(r => {
                const isEditing = editingId === r.id

                // 編集中の行
                if (isEditing && editForm) {
                  return (
                    <tr key={r.id} className="border-t bg-yellow-50">
                      <td className="px-2 py-1.5">
                        <input type="date" value={editForm.date}
                          onChange={e => setEditForm(p => p && ({ ...p, date: e.target.value }))}
                          className="border rounded px-1 py-1 text-xs w-full" />
                      </td>
                      <td className="px-2 py-1.5">
                        <select value={editForm.process_name}
                          onChange={e => setEditForm(p => p && ({ ...p, process_name: e.target.value }))}
                          className="border rounded px-1 py-1 text-xs w-full bg-white">
                          {processes.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </td>
                      <td className="px-2 py-1.5">
                        <select value={editForm.worker_name}
                          onChange={e => setEditForm(p => p && ({ ...p, worker_name: e.target.value }))}
                          className="border rounded px-1 py-1 text-xs w-full bg-white">
                          {workers.map(w => <option key={w} value={w}>{w}</option>)}
                        </select>
                      </td>
                      <td className="px-2 py-1.5">
                        <input value={editForm.target_name}
                          onChange={e => setEditForm(p => p && ({ ...p, target_name: e.target.value }))}
                          className="border rounded px-1 py-1 text-xs w-full" />
                      </td>
                      <td className="px-2 py-1.5">
                        <input type="number" value={editForm.quantity} min={0}
                          onChange={e => setEditForm(p => p && ({ ...p, quantity: e.target.value }))}
                          className="border rounded px-1 py-1 text-xs w-16 text-right" />
                      </td>
                      <td className="px-2 py-1.5">
                        <input value={editForm.note}
                          onChange={e => setEditForm(p => p && ({ ...p, note: e.target.value }))}
                          className="border rounded px-1 py-1 text-xs w-full" />
                      </td>
                      <td className="px-2 py-1.5 whitespace-nowrap text-center">
                        <button onClick={() => saveEdit(r.id)} disabled={saving}
                          className="text-xs bg-blue-700 text-white px-2 py-1 rounded hover:bg-blue-800 mr-1 disabled:opacity-50">
                          保存
                        </button>
                        <button onClick={cancelEdit}
                          className="text-xs border px-2 py-1 rounded text-gray-500 hover:bg-gray-100">
                          取消
                        </button>
                      </td>
                    </tr>
                  )
                }

                // 削除確認中の行
                if (deleteConfirmId === r.id) {
                  return (
                    <tr key={r.id} className="border-t bg-red-50">
                      <td colSpan={6} className="px-3 py-2 text-sm text-red-700">
                        「{r.date} / {r.process_name} / {r.target_name}」を削除しますか？
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-center">
                        <button onClick={() => deleteRecord(r.id)}
                          className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 mr-1">
                          削除
                        </button>
                        <button onClick={() => setDeleteConfirmId(null)}
                          className="text-xs border px-2 py-1 rounded text-gray-500 hover:bg-gray-100">
                          取消
                        </button>
                      </td>
                    </tr>
                  )
                }

                // 通常の行
                return (
                  <tr key={r.id} className="border-t hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap text-xs">{r.date}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs">{r.process_name}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs">{r.worker_name}</td>
                    <td className="px-3 py-2 text-xs">{r.target_name}</td>
                    <td className="px-3 py-2 text-right whitespace-nowrap text-xs">{r.quantity.toLocaleString()}</td>
                    <td className="px-3 py-2 text-gray-500 text-xs">{r.note}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-center">
                      <button onClick={() => startEdit(r)}
                        className="text-xs text-blue-600 border border-blue-200 px-2 py-0.5 rounded hover:bg-blue-50 mr-1">
                        編集
                      </button>
                      <button onClick={() => setDeleteConfirmId(r.id)}
                        className="text-xs text-red-400 border border-red-200 px-2 py-0.5 rounded hover:bg-red-50">
                        削除
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
