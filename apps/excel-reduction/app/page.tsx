'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

interface FormState {
  date: string
  process_name: string
  worker_name: string
  target_name: string
  quantity: string
  note: string
}

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

const EMPTY_FORM: FormState = {
  date: today(),
  process_name: '',
  worker_name: '',
  target_name: '',
  quantity: '',
  note: '',
}

export default function InputPage() {
  const [processes, setProcesses] = useState<string[]>([])
  const [workers,   setWorkers]   = useState<string[]>([])
  const [form, setForm]           = useState<FormState>(EMPTY_FORM)
  const [status, setStatus]       = useState<'idle' | 'saving' | 'ok' | 'error'>('idle')
  const [errorMsg, setErrorMsg]   = useState('')

  // マスタをAPIから取得（マスタ管理画面の変更が即反映される）
  useEffect(() => {
    fetch(BASE + '/api/masters')
      .then(r => r.json())
      .then(d => {
        setProcesses(d.processes ?? [])
        setWorkers(d.workers ?? [])
      })
  }, [])

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    // 入力開始したら成功メッセージを消す
    if (status === 'ok') setStatus('idle')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('saving')
    setErrorMsg('')

    try {
      const res = await fetch(BASE + '/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, quantity: Number(form.quantity) }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? '登録に失敗しました')
      }
      setStatus('ok')
      // 日付・工程・担当者を引き継ぎ、品目・数量・備考だけリセット
      // → 同じ現場担当が連続入力するとき最もスムーズ
      setForm(prev => ({
        ...EMPTY_FORM,
        date:         prev.date,
        process_name: prev.process_name,
        worker_name:  prev.worker_name,
      }))
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : '不明なエラー')
    }
  }

  const isFormReady =
    form.process_name && form.worker_name && form.target_name && form.quantity

  return (
    // pb-24: 固定フッターボタンと重ならないよう余白を確保
    <div className="pb-24">
      <h1 className="text-xl font-bold mb-1">作業記録 入力</h1>
      <p className="text-xs text-gray-500 mb-4">
        必要項目を入れて「登録する」を押してください。約30〜60秒で完了します。
      </p>

      {/* 成功メッセージ */}
      {status === 'ok' && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded border border-green-300 font-medium text-sm">
          ✓ 登録しました。続けて入力できます。
        </div>
      )}
      {/* エラーメッセージ */}
      {status === 'error' && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded border border-red-300 text-sm">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        {/* 日付 */}
        <div className="bg-white rounded-lg shadow p-4">
          <label className="block text-sm font-medium mb-1.5">
            日付 <span className="text-red-500">*</span>
          </label>
          <input
            type="date" name="date" value={form.date} onChange={handleChange} required
            className="w-full border rounded px-3 py-3 text-base"
          />
        </div>

        {/* 工程名 */}
        <div className="bg-white rounded-lg shadow p-4">
          <label className="block text-sm font-medium mb-1.5">
            工程名 <span className="text-red-500">*</span>
          </label>
          <select name="process_name" value={form.process_name} onChange={handleChange} required
            className="w-full border rounded px-3 py-3 text-base bg-white">
            <option value="">選択してください</option>
            {processes.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* 担当者名 */}
        <div className="bg-white rounded-lg shadow p-4">
          <label className="block text-sm font-medium mb-1.5">
            担当者名 <span className="text-red-500">*</span>
          </label>
          <select name="worker_name" value={form.worker_name} onChange={handleChange} required
            className="w-full border rounded px-3 py-3 text-base bg-white">
            <option value="">選択してください</option>
            {workers.map(w => <option key={w} value={w}>{w}</option>)}
          </select>
        </div>

        {/* 品目 / 作業対象 */}
        <div className="bg-white rounded-lg shadow p-4">
          <label className="block text-sm font-medium mb-1.5">
            品目 / 作業対象 <span className="text-red-500">*</span>
          </label>
          <input
            type="text" name="target_name" value={form.target_name}
            onChange={handleChange} required
            placeholder="例：部品A、製品XYZ"
            className="w-full border rounded px-3 py-3 text-base"
          />
        </div>

        {/* 数量 — スマホ数字キーボード */}
        <div className="bg-white rounded-lg shadow p-4">
          <label className="block text-sm font-medium mb-1.5">
            数量 <span className="text-red-500">*</span>
          </label>
          <input
            type="number" name="quantity" value={form.quantity}
            onChange={handleChange} required min={0}
            inputMode="numeric" placeholder="例：50"
            className="w-full border rounded px-3 py-3 text-base"
          />
        </div>

        {/* 備考 */}
        <div className="bg-white rounded-lg shadow p-4">
          <label className="block text-sm font-medium mb-1.5">備考（任意）</label>
          <textarea
            name="note" value={form.note} onChange={handleChange}
            rows={2} placeholder="気になること、特記事項があれば"
            className="w-full border rounded px-3 py-2 text-base resize-none"
          />
        </div>

      </form>

      {/* 送信ボタン — 画面下部に固定（スマホで親指が届く位置） */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            onClick={handleSubmit}
            disabled={status === 'saving' || !isFormReady}
            className="flex-1 bg-blue-700 text-white font-bold py-4 rounded-lg text-base
                       hover:bg-blue-800 disabled:opacity-40 transition active:scale-95"
          >
            {status === 'saving' ? '保存中...' : '登録する'}
          </button>
          <Link href="/admin"
            className="text-xs text-blue-600 underline whitespace-nowrap">
            一覧 →
          </Link>
        </div>
      </div>
    </div>
  )
}
