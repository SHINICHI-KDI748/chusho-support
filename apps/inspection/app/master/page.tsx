'use client'

import { useState, useEffect } from 'react'
import type { InspectionTarget, InspectionItem, Frequency } from '@/lib/masters-db'

const FREQUENCY_OPTIONS: { value: Frequency; label: string }[] = [
  { value: 'daily',   label: '日次（毎日）' },
  { value: 'weekly',  label: '週次（毎週）' },
  { value: 'monthly', label: '月次（毎月）' },
]

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

export default function MasterPage() {
  const [targets, setTargets]           = useState<InspectionTarget[]>([])
  const [expanded, setExpanded]         = useState<Set<number>>(new Set())
  const [newTargetName, setNewTargetName]     = useState('')
  const [newTargetFreq, setNewTargetFreq]     = useState<Frequency>('daily')
  const [newItemLabels, setNewItemLabels]      = useState<Record<number, string>>({})
  const [editingItemId, setEditingItemId]      = useState<{ targetId: number; itemId: number } | null>(null)
  const [editingItemLabel, setEditingItemLabel] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg]       = useState('')

  async function load() {
    const res = await fetch(BASE + '/api/masters?all=true')
    setTargets(await res.json())
  }

  useEffect(() => { load() }, [])

  function flash(text: string) {
    setMsg(text)
    setTimeout(() => setMsg(''), 3000)
  }

  function toggleExpand(id: number) {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function addTarget() {
    if (!newTargetName.trim()) return
    setSaving(true)
    await fetch(BASE + '/api/masters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newTargetName.trim(), frequency: newTargetFreq }),
    })
    setNewTargetName('')
    await load()
    setSaving(false)
    flash('点検対象を追加しました')
  }

  async function updateFrequency(target: InspectionTarget, frequency: Frequency) {
    await fetch(`${BASE}/api/masters/${target.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ frequency }),
    })
    await load()
    flash(`「${target.name}」の頻度を更新しました`)
  }

  async function addItem(targetId: number) {
    const label = newItemLabels[targetId]?.trim()
    if (!label) return
    setSaving(true)
    await fetch(`${BASE}/api/masters/${targetId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label }),
    })
    setNewItemLabels(prev => ({ ...prev, [targetId]: '' }))
    await load()
    setSaving(false)
    flash('点検項目を追加しました')
  }

  async function saveItemLabel(target: InspectionTarget, itemId: number) {
    const label = editingItemLabel.trim()
    if (!label) return
    const updatedItems = target.items.map(i =>
      i.id === itemId ? { ...i, label } : i
    )
    await fetch(`${BASE}/api/masters/${target.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: updatedItems }),
    })
    setEditingItemId(null)
    await load()
    flash('項目名を更新しました')
  }

  async function toggleTargetActive(target: InspectionTarget) {
    await fetch(`${BASE}/api/masters/${target.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !target.active }),
    })
    await load()
  }

  async function toggleItemActive(target: InspectionTarget, item: InspectionItem) {
    const updatedItems = target.items.map(i =>
      i.id === item.id ? { ...i, active: !i.active } : i
    )
    await fetch(`${BASE}/api/masters/${target.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: updatedItems }),
    })
    await load()
  }

  async function moveItem(target: InspectionTarget, item: InspectionItem, dir: 'up' | 'down') {
    const active = target.items.filter(i => i.active).sort((a, b) => a.order - b.order)
    const idx = active.findIndex(i => i.id === item.id)
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= active.length) return
    const swap = active[swapIdx]
    const updatedItems = target.items.map(i => {
      if (i.id === item.id) return { ...i, order: swap.order }
      if (i.id === swap.id) return { ...i, order: item.order }
      return i
    })
    await fetch(`${BASE}/api/masters/${target.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: updatedItems }),
    })
    await load()
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">点検マスタ管理</h1>

      {msg && (
        <div className="mb-3 p-2 bg-blue-50 text-blue-700 text-sm rounded border border-blue-200">
          {msg}
        </div>
      )}

      {/* 新しい点検対象を追加 */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <h2 className="font-medium mb-3 text-sm">点検対象を追加</h2>
        <div className="flex gap-2 flex-wrap">
          <input
            type="text" value={newTargetName} onChange={e => setNewTargetName(e.target.value)}
            placeholder="例：月次設備点検"
            className="flex-1 border rounded px-3 py-2 text-sm min-w-[140px]"
            onKeyDown={e => e.key === 'Enter' && addTarget()}
          />
          <select value={newTargetFreq} onChange={e => setNewTargetFreq(e.target.value as Frequency)}
            className="border rounded px-2 py-2 text-sm bg-white">
            {FREQUENCY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button onClick={addTarget} disabled={saving || !newTargetName.trim()}
            className="bg-emerald-700 text-white px-4 py-2 rounded text-sm font-medium hover:bg-emerald-800 disabled:opacity-50">
            追加
          </button>
        </div>
      </div>

      {/* 点検対象一覧 */}
      <div className="flex flex-col gap-3">
        {targets.map(target => {
          const activeItems   = target.items.filter(i => i.active).sort((a, b) => a.order - b.order)
          const inactiveItems = target.items.filter(i => !i.active)

          return (
            <div key={target.id}
              className={`bg-white rounded-lg shadow border-l-4
                ${target.active ? 'border-emerald-500' : 'border-gray-300 opacity-60'}`}>

              {/* ヘッダー: 対象名 + 頻度セレクト + 無効化ボタン */}
              <div className="flex items-center gap-2 px-4 py-3 flex-wrap">
                <button type="button" className="flex-1 text-left font-medium min-w-0"
                  onClick={() => toggleExpand(target.id)}>
                  <span className="truncate">{target.name}</span>
                  <span className="ml-2 text-xs text-gray-400">
                    ({activeItems.length}項目){expanded.has(target.id) ? ' ▲' : ' ▼'}
                  </span>
                </button>

                {/* 頻度セレクト — その場で変更できる */}
                <select
                  value={target.frequency ?? 'daily'}
                  onChange={e => updateFrequency(target, e.target.value as Frequency)}
                  className="border rounded px-2 py-1 text-xs bg-white text-gray-700"
                  onClick={e => e.stopPropagation()}>
                  {FREQUENCY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>

                <button onClick={() => toggleTargetActive(target)}
                  className={`text-xs px-2 py-1 rounded border whitespace-nowrap
                    ${target.active
                      ? 'border-gray-300 text-gray-500 hover:bg-gray-50'
                      : 'border-emerald-500 text-emerald-600 hover:bg-emerald-50'}`}>
                  {target.active ? '無効化' : '有効化'}
                </button>
              </div>

              {/* 展開: 点検項目管理 */}
              {expanded.has(target.id) && (
                <div className="px-4 pb-4 border-t">
                  {activeItems.length > 0 ? (
                    <ul className="mt-3 flex flex-col gap-1">
                      {activeItems.map((item, idx) => (
                        <li key={item.id}
                          className="flex items-center gap-2 py-1.5 border-b border-gray-100 last:border-0">
                          {/* 並び替え */}
                          <div className="flex flex-col gap-0.5">
                            <button onClick={() => moveItem(target, item, 'up')} disabled={idx === 0}
                              className="text-xs text-gray-400 hover:text-gray-700 disabled:opacity-20 leading-none">▲</button>
                            <button onClick={() => moveItem(target, item, 'down')} disabled={idx === activeItems.length - 1}
                              className="text-xs text-gray-400 hover:text-gray-700 disabled:opacity-20 leading-none">▼</button>
                          </div>

                          {/* 項目名 — インライン編集対応 */}
                          {editingItemId?.targetId === target.id && editingItemId.itemId === item.id ? (
                            <>
                              <input
                                value={editingItemLabel}
                                onChange={e => setEditingItemLabel(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && saveItemLabel(target, item.id)}
                                autoFocus
                                className="flex-1 border rounded px-2 py-1 text-sm"
                              />
                              <button onClick={() => saveItemLabel(target, item.id)}
                                className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700">保存</button>
                              <button onClick={() => setEditingItemId(null)}
                                className="text-xs border px-2 py-1 rounded text-gray-500">取消</button>
                            </>
                          ) : (
                            <>
                              <span className="flex-1 text-sm">{item.label}</span>
                              <button
                                onClick={() => { setEditingItemId({ targetId: target.id, itemId: item.id }); setEditingItemLabel(item.label) }}
                                className="text-xs text-blue-500 border border-blue-200 px-2 py-0.5 rounded hover:bg-blue-50">
                                編集
                              </button>
                              <button onClick={() => toggleItemActive(target, item)}
                                className="text-xs text-red-400 border border-red-200 px-2 py-0.5 rounded hover:bg-red-50">
                                削除
                              </button>
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-gray-400 mt-3">点検項目がありません</p>
                  )}

                  {inactiveItems.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-400 mb-1">非表示:</p>
                      <div className="flex flex-wrap gap-1">
                        {inactiveItems.map(item => (
                          <button key={item.id} onClick={() => toggleItemActive(target, item)}
                            className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded border hover:bg-gray-200">
                            {item.label} — 復元
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 項目追加 */}
                  <div className="flex gap-2 mt-3">
                    <input
                      type="text"
                      value={newItemLabels[target.id] ?? ''}
                      onChange={e => setNewItemLabels(prev => ({ ...prev, [target.id]: e.target.value }))}
                      placeholder="新しい点検項目を入力"
                      className="flex-1 border rounded px-2 py-1.5 text-sm"
                      onKeyDown={e => e.key === 'Enter' && addItem(target.id)}
                    />
                    <button onClick={() => addItem(target.id)}
                      disabled={saving || !newItemLabels[target.id]?.trim()}
                      className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700 disabled:opacity-50">
                      追加
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
