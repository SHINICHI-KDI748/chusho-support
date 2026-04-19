import { NextRequest, NextResponse } from 'next/server'
import { getAllTargets } from '@/lib/masters-db'
import { getInspectionStatus } from '@/lib/records-db'

// GET /api/status?date=YYYY-MM-DD
// 指定日を基準とした各点検対象の実施状況を返す
export async function GET(req: NextRequest) {
  const date = new URL(req.url).searchParams.get('date')
    ?? new Date().toLocaleDateString('ja-JP', {
        timeZone: 'Asia/Tokyo',
        year: 'numeric', month: '2-digit', day: '2-digit',
       }).split('/').join('-')  // YYYY-MM-DD 形式

  const targets = getAllTargets()
  const status = getInspectionStatus(date, targets)
  return NextResponse.json(status)
}
