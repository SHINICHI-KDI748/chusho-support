/**
 * GET /api/export?type=work|inspection|pending&dateFrom=&dateTo=
 *
 * type=work       → 作業実績 CSV
 * type=inspection → 点検記録 CSV
 * type=pending    → 未実施一覧 CSV（今日基準）
 *
 * BOM付きUTF-8 — Excelで直接開いても文字化けしない
 */

import { NextRequest, NextResponse } from 'next/server'
import { queryWorkRecords }          from '@/lib/app1-reader'
import { queryInspectionRecords, getInspectionStatus } from '@/lib/app2-reader'

const BOM = '\uFEFF'

function toCSV(header: (string | number)[], rows: (string | number)[][]): string {
  return BOM + [header, ...rows]
    .map(row => row.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))
    .join('\r\n')
}

function todayJST(): string {
  return new Date().toLocaleDateString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).replace(/\//g, '-')
}

export async function GET(req: NextRequest) {
  const p = new URL(req.url).searchParams
  const type     = p.get('type') ?? 'work'
  const today    = todayJST()
  const dateFrom = p.get('dateFrom') ?? today
  const dateTo   = p.get('dateTo')   ?? today

  let csv = ''
  let filename = `export_${today}.csv`

  // ---------- 作業実績 ----------
  if (type === 'work') {
    const records = await queryWorkRecords({ dateFrom, dateTo })
    const header = ['ID', '日付', '工程名', '担当者名', '品目/作業対象', '数量', '備考', '要確認', '登録日時']
    const rows = records.map(r => [
      r.id, r.date, r.process_name, r.worker_name,
      r.target_name, r.quantity,
      r.note,
      r.note.trim() ? '要確認' : '正常',
      r.created_at,
    ])
    csv = toCSV(header, rows)
    filename = `work_records_${dateFrom}_${dateTo}.csv`
  }

  // ---------- 点検記録 ----------
  else if (type === 'inspection') {
    const records = await queryInspectionRecords({ dateFrom, dateTo })

    // 動的な項目ラベル列（全レコードから収集）
    const allLabels = Array.from(
      new Set(records.flatMap(r => r.results.map(res => res.label)))
    )

    const header = [
      'ID', '日付', '点検対象', '担当者', 'NG有無', 'NG件数',
      '写真有無', '全体備考', '登録日時',
      ...allLabels,
      'NG項目', 'NGコメント',
    ]
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
        r.id, r.date, r.target_name, r.inspector,
        r.has_ng ? 'NG有' : '正常',
        ngResults.length,
        r.photo_paths.length > 0 ? 'あり' : 'なし',
        r.note, r.created_at,
        ...itemCols,
        ngItems, ngComments,
      ]
    })
    csv = toCSV(header, rows)
    filename = `inspections_${dateFrom}_${dateTo}.csv`
  }

  // ---------- 未実施一覧 ----------
  else if (type === 'pending') {
    const statuses = await getInspectionStatus(today)
    const pending  = statuses.filter(s => s.status === 'pending')

    const FREQ_LABELS: Record<string, string> = {
      daily: '日次', weekly: '週次', monthly: '月次',
    }
    const header = ['点検対象', '頻度', 'ステータス', '最終実施日', '該当期間内実施回数']
    const rows = pending.map(s => [
      s.target_name,
      FREQ_LABELS[s.frequency] ?? s.frequency,
      '未実施',
      s.last_date ?? '未実施',
      s.record_count,
    ])
    csv = toCSV(header, rows)
    filename = `pending_inspections_${today}.csv`
  }

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
