import { NextRequest, NextResponse } from 'next/server'
import { queryRecords } from '@/lib/db'

// GET /api/export?dateFrom=&dateTo=&keyword=
// Excelで開いても文字化けしないようにBOM付きUTF-8で出力
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const records = queryRecords({
    dateFrom: searchParams.get('dateFrom') ?? undefined,
    dateTo:   searchParams.get('dateTo')   ?? undefined,
    keyword:  searchParams.get('keyword')  ?? undefined,
  })

  const header = ['ID', '日付', '工程名', '担当者名', '品目/作業対象', '数量', '備考', '登録日時']
  const rows = records.map(r => [
    r.id,
    r.date,
    r.process_name,
    r.worker_name,
    r.target_name,
    r.quantity,
    r.note,
    r.created_at,
  ])

  const csvLines = [header, ...rows].map(row =>
    row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
  )

  // BOM付きUTF-8：Excelで直接開いても文字化けしない
  const BOM = '\uFEFF'
  const csv = BOM + csvLines.join('\r\n')

  const today = new Date().toISOString().slice(0, 10)
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="records_${today}.csv"`,
    },
  })
}
