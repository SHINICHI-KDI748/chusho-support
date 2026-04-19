'use client'

import { useState, useEffect } from 'react'

interface MasterItem { id: number; name: string; active: boolean }
interface Masters { processes: MasterItem[]; workers: MasterItem[] }

type SectionKey = 'process' | 'worker'

const SECTION_LABELS: Record<SectionKey, string> = {
  process: '工程名',
  worker:  '担当者名',
}

export default function MasterPage() {
  const [masters, setMasters] = useState<Masters>({ processes: [], workers: [] })
  const [newNames, setNewNames] = useState<Record<SectionKey, string>>({ process: '', worker: '' })
  const [editId, setEditId]     = useState<{ type: SectionKey; id: number } | null>(null)
  const [editName, setEditName] = useState('')
  const [msg, setMsg] = useState('')

  async function load() {
    const res = await fetch('/api/masters?all=true')
    setMasters(await res.json())
  }

  useEffect(() => { load() }, [])

  function flash(text: string) {
    setMsg(text)
    setTimeout(() => setMsg(''), 3000)
  }

  async function add(type: SectionKey) {
    const name = newNames[type].trim()
    if (!name) return
    await fetch('/api/masters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, name }),
    })
    setNewNames(p => ({ ...p, [type]: '' }))
    await load()
    flash(`${SECTION_LABELS[type]}「${name}」を追加しました`)
  }

  async function toggleActive(type: SectionKey, item: MasterItem) {
    await fetch('/api/masters', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, id: item.id, active: !item.active }),
    })
    await load()
  }

  async function saveName(type: SectionKey, id: number) {
    const name = editName.trim()
    if (!name) return
    await fetch('/api/masters', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, id, name }),
    })
    setEditId(null)
    await load()
    flash('名前を更新しました')
  }

  function renderSection(type: SectionKey, items: MasterItem[]) {
    const active   = items.filter(i => i.active)
    const inactive = items.filter(i => !i.active)

    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="font-bold text-base mb-3">{SECTION_LABELS[type]}マスタ</h2>

        {/* アクティブ一覧 */}
        <ul className="flex flex-col gap-1 mb-3">
          {active.map(item => (
            <li key={item.id} className="flex items-center gap-2 py-1.5 border-b border-gray-100 last:border-0">
              {editId?.type === type && editId.id === item.id ? (
                // インライン編集中
                <>
                  <input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && saveName(type, item.id)}
                    autoFocus
                    className="flex-1 border rounded px-2 py-1 text-sm"
                  />
                  <button onClick={() => saveName(type, item.id)}
                    className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700">保存</button>
                  <button onClick={() => setEditId(null)}
                    className="text-xs border px-2 py-1 rounded text-gray-500 hover:bg-gray-50">取消</button>
                </>
              ) : (
                // 通常表示
                <>
                  <span className="flex-1 text-sm">{item.name}</span>
                  <button
                    onClick={() => { setEditId({ type, id: item.id }); setEditName(item.name) }}
                    className="text-xs text-blue-600 border border-blue-200 px-2 py-0.5 rounded hover:bg-blue-50">
                    編集
                  </button>
                  <button
                    onClick={() => toggleActive(type, item)}
                    className="text-xs text-gray-400 border px-2 py-0.5 rounded hover:bg-gray-50">
                    無効化
                  </button>
                </>
              )}
            </li>
          ))}
          {active.length === 0 && (
            <p className="text-xs text-gray-400">アクティブな項目がありません</p>
          )}
        </ul>

        {/* 無効化済み（折りたたみ表示） */}
        {inactive.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-gray-400 mb-1">非表示（無効化済み）:</p>
            <div className="flex flex-wrap gap-2">
              {inactive.map(item => (
                <button key={item.id}
                  onClick={() => toggleActive(type, item)}
                  className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded border hover:bg-gray-200">
                  {item.name} — 有効化
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 新規追加 */}
        <div className="flex gap-2 pt-2 border-t">
          <input
            type="text"
            value={newNames[type]}
            onChange={e => setNewNames(p => ({ ...p, [type]: e.target.value }))}
            placeholder={`${SECTION_LABELS[type]}を追加`}
            className="flex-1 border rounded px-3 py-2 text-sm"
            onKeyDown={e => e.key === 'Enter' && add(type)}
          />
          <button onClick={() => add(type)} disabled={!newNames[type].trim()}
            className="bg-blue-700 text-white px-4 py-2 rounded text-sm hover:bg-blue-800 disabled:opacity-40">
            追加
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">マスタ管理</h1>
      <p className="text-sm text-gray-500 mb-4">
        工程名・担当者名をここで管理します。変更は即座に入力画面に反映されます。
      </p>

      {msg && (
        <div className="mb-4 p-3 bg-blue-50 text-blue-700 text-sm rounded border border-blue-200">
          {msg}
        </div>
      )}

      <div className="flex flex-col gap-4">
        {renderSection('process', masters.processes)}
        {renderSection('worker',  masters.workers)}
      </div>
    </div>
  )
}
