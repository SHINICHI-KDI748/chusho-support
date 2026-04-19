'use client'

import { useState, useEffect } from 'react'

// ---------- 型定義 ----------

interface MeasurementData {
  before: {
    work_record_time_min: number | null
    inspection_check_time_min: number | null
    missing_detection_time_min: number | null
    ng_check_steps: number | null
    daily_files_used: number | null
    memo: string
  }
  after: {
    dashboard_check_time_min: number | null
    pending_detection_sec: number | null
    ng_awareness_sec: number | null
    admin_satisfaction: number | null
    continued_use_intent: number | null
    memo: string
  }
  updated_at: string
}

const emptyData: MeasurementData = {
  before: {
    work_record_time_min: null,
    inspection_check_time_min: null,
    missing_detection_time_min: null,
    ng_check_steps: null,
    daily_files_used: null,
    memo: '',
  },
  after: {
    dashboard_check_time_min: null,
    pending_detection_sec: null,
    ng_awareness_sec: null,
    admin_satisfaction: null,
    continued_use_intent: null,
    memo: '',
  },
  updated_at: '',
}

// ---------- ユーティリティ ----------

function calcReduction(before: number | null, after: number | null): string {
  if (before == null || after == null) return '—'
  const diff = before - after
  const pct  = before > 0 ? Math.round((diff / before) * 100) : 0
  return diff > 0 ? `▼ ${diff}分削減 (${pct}%減)` : `▲ ${Math.abs(diff)}分増加`
}

function calcSecReduction(before: number | null, after: number | null): string {
  if (before == null || after == null) return '—'
  const diff = before * 60 - after
  return diff > 0 ? `▼ ${diff}秒短縮` : `変化なし`
}

// ---------- 入力フィールドコンポーネント ----------

function NumberInput({ label, value, onChange, unit, hint }: {
  label: string; value: number | null; onChange: (v: number | null) => void; unit: string; hint?: string
}) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
      <div className="mt-1.5 flex items-center gap-2">
        <input
          type="number"
          min={0}
          step="0.5"
          value={value ?? ''}
          onChange={e => onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
          className="border rounded px-3 py-1.5 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="未記入"
        />
        <span className="text-sm text-gray-500">{unit}</span>
      </div>
    </div>
  )
}

function ScoreInput({ label, value, onChange, hint }: {
  label: string; value: number | null; onChange: (v: number | null) => void; hint?: string
}) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
      <div className="mt-2 flex gap-2">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            onClick={() => onChange(value === n ? null : n)}
            className={`w-10 h-10 rounded-lg border text-sm font-semibold transition
              ${value === n
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'}`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}

// ---------- メインコンポーネント ----------

export default function PocEvaluationPage() {
  const [data, setData]       = useState<MeasurementData>(emptyData)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [error, setError]     = useState('')

  useEffect(() => {
    fetch('/api/poc-evaluation')
      .then(r => r.json())
      .then((d: MeasurementData) => {
        setData({ ...emptyData, ...d, before: { ...emptyData.before, ...d.before }, after: { ...emptyData.after, ...d.after } })
      })
      .catch(() => setError('読み込みに失敗しました'))
      .finally(() => setLoading(false))
  }, [])

  function setB<K extends keyof MeasurementData['before']>(key: K, val: MeasurementData['before'][K]) {
    setData(d => ({ ...d, before: { ...d.before, [key]: val } }))
  }
  function setA<K extends keyof MeasurementData['after']>(key: K, val: MeasurementData['after'][K]) {
    setData(d => ({ ...d, after: { ...d.after, [key]: val } }))
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/poc-evaluation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('保存失敗')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError('保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  function handleExportCSV() {
    const BOM = '\uFEFF'
    const rows = [
      ['区分', '測定項目', '値', '単位'],
      ['Before', '作業実績確認時間', data.before.work_record_time_min ?? '', '分/日'],
      ['Before', '点検状況確認時間', data.before.inspection_check_time_min ?? '', '分/日'],
      ['Before', '抜け漏れ発見時間', data.before.missing_detection_time_min ?? '', '分'],
      ['Before', 'NG確認ステップ数', data.before.ng_check_steps ?? '', 'ステップ'],
      ['Before', '日次確認ファイル数', data.before.daily_files_used ?? '', '個'],
      ['Before', 'メモ', data.before.memo, ''],
      ['After', 'ダッシュボード確認時間', data.after.dashboard_check_time_min ?? '', '分/日'],
      ['After', '未実施発見時間', data.after.pending_detection_sec ?? '', '秒'],
      ['After', 'NG把握時間', data.after.ng_awareness_sec ?? '', '秒'],
      ['After', '管理者満足度', data.after.admin_satisfaction ?? '', '点（5点満点）'],
      ['After', '継続利用意向', data.after.continued_use_intent ?? '', '点（5点満点）'],
      ['After', 'メモ', data.after.memo, ''],
    ]
    const csv = BOM + rows
      .map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\r\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `poc_evaluation_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return <div className="text-center py-16 text-gray-400">読み込み中...</div>

  return (
    <div className="space-y-8 max-w-3xl">

      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">PoC評価記録</h1>
          <p className="text-sm text-gray-500 mt-1">
            Before / After の実測値を記録して、効果を可視化します。<br/>
            この数値は事例化・横展開提案の根拠になります。
          </p>
        </div>
        <div className="sm:ml-auto flex gap-2">
          <button onClick={handleExportCSV}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 border rounded-lg text-sm transition">
            ⬇ CSV出力
          </button>
          <button onClick={handleSave} disabled={saving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50">
            {saving ? '保存中...' : '保存する'}
          </button>
        </div>
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-2 text-sm">
          ✓ 保存しました
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2 text-sm">
          ⚠ {error}
        </div>
      )}

      {/* ======== Before（導入前） ======== */}
      <div className="bg-white rounded-xl border shadow-sm">
        <div className="px-4 py-3 border-b bg-gray-50 rounded-t-xl">
          <h2 className="font-semibold text-gray-800">Before — 導入前の現状</h2>
          <p className="text-xs text-gray-400 mt-0.5">PoC開始前に計測・ヒアリングして記入してください</p>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <NumberInput
            label="作業実績確認時間"
            value={data.before.work_record_time_min}
            onChange={v => setB('work_record_time_min', v)}
            unit="分/日"
            hint="Excel確認・転記・印刷などの合計時間"
          />
          <NumberInput
            label="点検状況確認時間"
            value={data.before.inspection_check_time_min}
            onChange={v => setB('inspection_check_time_min', v)}
            unit="分/日"
            hint="点検表の確認・まとめにかかる時間"
          />
          <NumberInput
            label="抜け漏れ発見までの時間"
            value={data.before.missing_detection_time_min}
            onChange={v => setB('missing_detection_time_min', v)}
            unit="分"
            hint="未実施や漏れに気づくまでの平均時間"
          />
          <NumberInput
            label="NG確認の手間（ステップ数）"
            value={data.before.ng_check_steps}
            onChange={v => setB('ng_check_steps', v)}
            unit="ステップ"
            hint="NG発見のために必要な作業ステップ数"
          />
          <NumberInput
            label="日次確認に使う画面/ファイル数"
            value={data.before.daily_files_used}
            onChange={v => setB('daily_files_used', v)}
            unit="個"
            hint="毎朝開くファイルやExcelシートの数"
          />
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-gray-700">メモ・特記事項</label>
            <textarea
              value={data.before.memo}
              onChange={e => setB('memo', e.target.value)}
              rows={3}
              placeholder="現場から聞いた不満点、特記事項など"
              className="mt-1.5 w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>
      </div>

      {/* ======== After（導入後） ======== */}
      <div className="bg-white rounded-xl border shadow-sm">
        <div className="px-4 py-3 border-b bg-blue-50 rounded-t-xl">
          <h2 className="font-semibold text-gray-800">After — 導入後の実測値</h2>
          <p className="text-xs text-gray-400 mt-0.5">PoC期間中・終了時に計測して記入してください</p>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <NumberInput
            label="ダッシュボード確認時間"
            value={data.after.dashboard_check_time_min}
            onChange={v => setA('dashboard_check_time_min', v)}
            unit="分/日"
            hint="目標：3分以内"
          />
          <NumberInput
            label="未実施発見時間"
            value={data.after.pending_detection_sec}
            onChange={v => setA('pending_detection_sec', v)}
            unit="秒"
            hint="目標：10秒以内"
          />
          <NumberInput
            label="NG把握時間"
            value={data.after.ng_awareness_sec}
            onChange={v => setA('ng_awareness_sec', v)}
            unit="秒"
            hint="目標：10秒以内"
          />
          <ScoreInput
            label="管理者満足度"
            value={data.after.admin_satisfaction}
            onChange={v => setA('admin_satisfaction', v)}
            hint="1（不満）〜 5（非常に満足）"
          />
          <ScoreInput
            label="継続利用意向"
            value={data.after.continued_use_intent}
            onChange={v => setA('continued_use_intent', v)}
            hint="1（使いたくない）〜 5（絶対使いたい）"
          />
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-gray-700">メモ・現場の声</label>
            <textarea
              value={data.after.memo}
              onChange={e => setA('memo', e.target.value)}
              rows={3}
              placeholder="現場担当者の感想、継続利用の理由、改善要望など"
              className="mt-1.5 w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>
      </div>

      {/* ======== 効果サマリー ======== */}
      <div className="bg-white rounded-xl border shadow-sm">
        <div className="px-4 py-3 border-b">
          <h2 className="font-semibold text-gray-800">効果サマリー（自動計算）</h2>
          <p className="text-xs text-gray-400 mt-0.5">Before / After の両方が入力されると自動表示されます</p>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">作業実績確認時間</p>
            <p className="text-lg font-bold text-blue-700">
              {calcReduction(data.before.work_record_time_min, data.after.dashboard_check_time_min)}
            </p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">未実施発見時間（分→秒換算）</p>
            <p className="text-lg font-bold text-blue-700">
              {calcSecReduction(data.before.missing_detection_time_min, data.after.pending_detection_sec)}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">管理者満足度</p>
            <p className="text-lg font-bold text-green-700">
              {data.after.admin_satisfaction != null ? `${data.after.admin_satisfaction} / 5点` : '—'}
              {data.after.admin_satisfaction != null && data.after.admin_satisfaction >= 4 && ' ✓ 目標達成'}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">継続利用意向</p>
            <p className="text-lg font-bold text-green-700">
              {data.after.continued_use_intent != null ? `${data.after.continued_use_intent} / 5点` : '—'}
              {data.after.continued_use_intent != null && data.after.continued_use_intent >= 4 && ' ✓ 目標達成'}
            </p>
          </div>
        </div>
      </div>

      {data.updated_at && (
        <p className="text-xs text-gray-400 text-right">最終保存：{new Date(data.updated_at).toLocaleString('ja-JP')}</p>
      )}
    </div>
  )
}
