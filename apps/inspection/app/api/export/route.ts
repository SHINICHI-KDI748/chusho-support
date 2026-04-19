import { NextRequest, NextResponse } from 'next/server'
import { queryRecords } from '@/lib/records-db'

// GET /api/export?dateFrom=&dateTo=&target_id=&ng_only=true
// BOM付きUTF-8 — Excelで直接開いても文字化けしない
export async function GET(req: NextRequest) {
  const p = new URL(req.url).searchParams
  const records = queryRecords({
    dateFrom:  p.get('dateFrom')  ?? undefined,
    dateTo:    p.get('dateTo')    ?? undefined,
    target_id: p.get('target_id') ? Number(p.get('target_id')) : undefined,
    ng_only:   p.get('ng_only') === 'true',
  })

  // 動的な項目ラベル列（全レコードから収集）
  const allLabels = Array.from(
    new Set(records.flatMap(r => r.results.map(res => res.label)))
  )

  // 固定列: 基本情報 + PoC測定に必要な集計列
  const fixedHeaders = [
    'ID', '日付', '点検対象', '担当者',
    'NG有無', 'NG件数', '写真有無', '全体備考', '登録日時',
  ]
  const header = [...fixedHeaders, ...allLabels, 'NG項目（詳細）', 'NGコメント']

  const rows = records.map(r => {
    const ngResults  = r.results.filter(res => res.status === 'ng')
    const ngItems    = ngResults.map(res => res.label).join(' / ')
    const ngComments = ngResults.map(res => res.note).filter(Boolean).join(' / ')
    const itemCols   = allLabels.map(label => {
      const res = r.results.find(res => res.label === label)
      if (!res) return '-'
      return res.status === 'ok' ? '○' : res.status === 'ng' ? '×' : '未実施'
    })
    return [
      r.id,
      r.date,
      r.target_name,
      r.inspector,
      r.has_ng ? 'NG有' : '正常',
      ngResults.length,                              // NG件数
      r.photo_paths.length > 0 ? 'あり' : 'なし',   // 写真有無
      r.note,
      r.created_at,
      ...itemCols,
      ngItems,
      ngComments,
    ]
  })

  const BOM = '\uFEFF'
  const csv = BOM + [header, ...rows]
    .map(row => row.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))
    .join('\r\n')

  const today = new Date().toISOString().slice(0, 10)
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="inspections_${today}.csv"`,
    },
  })
}
