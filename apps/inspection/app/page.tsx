'use client'

import { useState, useEffect, useCallback } from 'react'
import type { InspectionTarget, InspectionItem } from '@/lib/masters-db'
import type { ItemStatus, ItemResult } from '@/lib/records-db'

// ▼ 担当者リストは父親の会社ヒアリング後に修正
const INSPECTOR_OPTIONS = ['田中', '鈴木', '佐藤', '山田', '伊藤']

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

type StatusMap = Record<number, { status: ItemStatus; note: string }>

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

// OK/NG/NA ボタンのスタイルを返す
function statusStyle(current: ItemStatus, value: ItemStatus): string {
  const base = 'flex-1 py-3 rounded-lg text-base font-bold transition-all border-2 '
  if (current !== value) return base + 'bg-white border-gray-200 text-gray-400'
  if (value === 'ok') return base + 'bg-green-500 border-green-500 text-white'
  if (value === 'ng') return base + 'bg-red-500 border-red-500 text-white'
  return base + 'bg-gray-300 border-gray-300 text-gray-700'
}

export default function InspectPage() {
  const [targets, setTargets]         = useState<InspectionTarget[]>([])
  const [date, setDate]               = useState(today())
  const [inspector, setInspector]     = useState('')
  const [targetId, setTargetId]       = useState<number | ''>('')
  const [statusMap, setStatusMap]     = useState<StatusMap>({})
  const [activeItems, setActiveItems] = useState<InspectionItem[]>([])
  const [globalNote, setGlobalNote]   = useState('')
  const [photos, setPhotos]           = useState<File[]>([])
  const [previews, setPreviews]       = useState<string[]>([])
  const [submitting, setSubmitting]   = useState(false)
  const [result, setResult]           = useState<'ok' | 'error' | null>(null)
  const [errMsg, setErrMsg]           = useState('')

  // マスタ読み込み
  useEffect(() => {
    fetch(BASE + '/api/masters').then(r => r.json()).then(setTargets)
  }, [])

  // 点検対象が変わったら項目をリセット
  useEffect(() => {
    if (!targetId) { setActiveItems([]); setStatusMap({}); return }
    const t = targets.find(t => t.id === Number(targetId))
    if (!t) return
    const items = t.items.filter(i => i.active).sort((a, b) => a.order - b.order)
    setActiveItems(items)
    // 全項目を「未実施」で初期化
    const init: StatusMap = {}
    items.forEach(i => { init[i.id] = { status: 'na', note: '' } })
    setStatusMap(init)
  }, [targetId, targets])

  const setItemStatus = useCallback((itemId: number, status: ItemStatus) => {
    setStatusMap(prev => ({ ...prev, [itemId]: { ...prev[itemId], status } }))
  }, [])

  const setItemNote = useCallback((itemId: number, note: string) => {
    setStatusMap(prev => ({ ...prev, [itemId]: { ...prev[itemId], note } }))
  }, [])

  /**
   * 写真をクライアントサイドで最大1200px / JPEG 0.75 に圧縮する。
   * 依存追加ゼロ、PoC用途として十分な品質。
   */
  async function resizeImage(file: File, maxPx = 1200, quality = 0.75): Promise<File> {
    return new Promise(resolve => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        const scale = Math.min(1, maxPx / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width  = Math.round(img.width  * scale)
        canvas.height = Math.round(img.height * scale)
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        canvas.toBlob(blob => {
          URL.revokeObjectURL(url)
          resolve(new File([blob!], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }))
        }, 'image/jpeg', quality)
      }
      img.src = url
    })
  }

  // 写真選択: プレビュー生成（リサイズは送信時に実行）
  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    setPhotos(files)
    setPreviews(files.map(f => URL.createObjectURL(f)))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!targetId) return
    setSubmitting(true)
    setResult(null)
    setErrMsg('')

    try {
      // 1. 写真があればリサイズ → アップロード
      let photoPaths: string[] = []
      if (photos.length > 0) {
        const resized = await Promise.all(photos.map(f => resizeImage(f)))
        const fd = new FormData()
        resized.forEach(p => fd.append('photos', p))
        const upRes = await fetch(BASE + '/api/upload', { method: 'POST', body: fd })
        const upData = await upRes.json()
        photoPaths = upData.paths ?? []
      }

      // 2. 点検記録を保存
      const target = targets.find(t => t.id === Number(targetId))!
      const results: ItemResult[] = activeItems.map(item => ({
        item_id: item.id,
        label: item.label,
        status: statusMap[item.id]?.status ?? 'na',
        note: statusMap[item.id]?.note ?? '',
      }))

      const res = await fetch(BASE + '/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          target_id: target.id,
          target_name: target.name,
          inspector,
          results,
          photo_paths: photoPaths,
          note: globalNote,
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? '登録に失敗しました')

      setResult('ok')
      // 担当者・日付を引き継いで他をリセット（連続入力しやすく）
      setTargetId('')
      setStatusMap({})
      setActiveItems([])
      setGlobalNote('')
      setPhotos([])
      setPreviews([])
    } catch (err) {
      setResult('error')
      setErrMsg(err instanceof Error ? err.message : '不明なエラー')
    } finally {
      setSubmitting(false)
    }
  }

  const ngCount = Object.values(statusMap).filter(v => v.status === 'ng').length
  const unfilledCount = Object.values(statusMap).filter(v => v.status === 'na').length

  return (
    <div className="pb-24">
      <h1 className="text-xl font-bold mb-4">点検入力</h1>

      {result === 'ok' && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded border border-green-300 font-medium">
          ✓ 点検記録を登録しました。続けて入力できます。
        </div>
      )}
      {result === 'error' && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded border border-red-300">
          {errMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">

        {/* 日付 */}
        <div className="bg-white rounded-lg shadow p-4">
          <label className="block text-sm font-medium mb-1">日付 <span className="text-red-500">*</span></label>
          <input
            type="date" value={date} onChange={e => setDate(e.target.value)} required
            className="w-full border rounded px-3 py-2 text-base"
          />
        </div>

        {/* 担当者 */}
        <div className="bg-white rounded-lg shadow p-4">
          <label className="block text-sm font-medium mb-1">担当者 <span className="text-red-500">*</span></label>
          <select
            value={inspector} onChange={e => setInspector(e.target.value)} required
            className="w-full border rounded px-3 py-2 text-base bg-white"
          >
            <option value="">選択してください</option>
            {INSPECTOR_OPTIONS.map(w => <option key={w} value={w}>{w}</option>)}
          </select>
        </div>

        {/* 点検対象 */}
        <div className="bg-white rounded-lg shadow p-4">
          <label className="block text-sm font-medium mb-1">点検対象 <span className="text-red-500">*</span></label>
          <select
            value={targetId}
            onChange={e => setTargetId(e.target.value ? Number(e.target.value) : '')}
            required
            className="w-full border rounded px-3 py-2 text-base bg-white"
          >
            <option value="">選択してください</option>
            {targets.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>

        {/* 点検項目 — 対象選択後に表示 */}
        {activeItems.length > 0 && (
          <div className="flex flex-col gap-3">
            {/* 進捗バッジ */}
            <div className="flex gap-2 text-xs">
              {ngCount > 0 && (
                <span className="bg-red-100 text-red-700 px-2 py-1 rounded font-bold">
                  NG {ngCount}件
                </span>
              )}
              {unfilledCount > 0 && (
                <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                  未判定 {unfilledCount}件
                </span>
              )}
              {unfilledCount === 0 && (
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                  全項目入力済み
                </span>
              )}
            </div>

            {activeItems.map(item => {
              const st = statusMap[item.id]?.status ?? 'na'
              const isNG = st === 'ng'
              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-lg shadow p-4 border-l-4 ${
                    isNG ? 'border-red-500' : st === 'ok' ? 'border-green-400' : 'border-gray-200'
                  }`}
                >
                  <p className="font-medium mb-3">{item.label}</p>
                  {/* OK / NG / 未実施 — 大きなタップターゲット */}
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setItemStatus(item.id, 'ok')}
                      className={statusStyle(st, 'ok')}>○ 正常</button>
                    <button type="button" onClick={() => setItemStatus(item.id, 'ng')}
                      className={statusStyle(st, 'ng')}>× NG</button>
                    <button type="button" onClick={() => setItemStatus(item.id, 'na')}
                      className={statusStyle(st, 'na')}>— 未実施</button>
                  </div>
                  {/* NG のときだけコメント欄を表示 */}
                  {isNG && (
                    <textarea
                      placeholder="NG内容を記入（任意）"
                      value={statusMap[item.id]?.note ?? ''}
                      onChange={e => setItemNote(item.id, e.target.value)}
                      rows={2}
                      className="mt-2 w-full border rounded px-3 py-2 text-sm resize-none"
                    />
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* 写真添付（任意） */}
        {activeItems.length > 0 && (
          <div className="bg-white rounded-lg shadow p-4">
            <label className="block text-sm font-medium mb-2">写真添付（任意）</label>
            <input
              type="file" accept="image/*" multiple capture="environment"
              onChange={handlePhotoChange}
              className="text-sm"
            />
            {previews.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {previews.map((src, i) => (
                  <img key={i} src={src} alt="preview" className="w-20 h-20 object-cover rounded border" />
                ))}
              </div>
            )}
          </div>
        )}

        {/* 全体備考（任意） */}
        {activeItems.length > 0 && (
          <div className="bg-white rounded-lg shadow p-4">
            <label className="block text-sm font-medium mb-1">全体備考（任意）</label>
            <textarea
              value={globalNote} onChange={e => setGlobalNote(e.target.value)}
              rows={2} placeholder="特記事項があれば"
              className="w-full border rounded px-3 py-2 text-sm resize-none"
            />
          </div>
        )}

        {/* 送信ボタン — 固定フッター */}
        {activeItems.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 shadow-lg">
            <div className="max-w-xl mx-auto">
              {ngCount > 0 && (
                <p className="text-red-600 text-sm font-medium mb-2 text-center">
                  NG {ngCount}件があります。内容を確認して提出してください。
                </p>
              )}
              <button
                type="submit" disabled={submitting}
                className="w-full bg-emerald-700 text-white font-bold py-4 rounded-lg text-base hover:bg-emerald-800 disabled:opacity-50 transition"
              >
                {submitting ? '保存中...' : '点検結果を提出する'}
              </button>
            </div>
          </div>
        )}

      </form>
    </div>
  )
}
