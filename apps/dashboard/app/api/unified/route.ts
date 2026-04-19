/**
 * GET /api/unified?dateFrom=&dateTo=&type=all|work|inspection&ng_only=true&needs_check=true
 *
 * 作業実績 + 点検記録を共通型に変換して返す。
 * クライアントがテーブル表示・フィルタに使用する。
 */

import { NextRequest, NextResponse }  from 'next/server'
import { queryWorkRecords }           from '@/lib/app1-reader'
import { queryInspectionRecords }     from '@/lib/app2-reader'
import { workRecordToEvent, inspectionRecordToEvent } from '@/lib/unified'

function todayJST(): string {
  return new Date().toLocaleDateString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).replace(/\//g, '-')
}

export async function GET(req: NextRequest) {
  const p = new URL(req.url).searchParams
  const today    = todayJST()
  const dateFrom = p.get('dateFrom') ?? today
  const dateTo   = p.get('dateTo')   ?? today
  const type     = p.get('type')     ?? 'all'
  const ngOnly   = p.get('ng_only')  === 'true'
  const needsCheck = p.get('needs_check') === 'true'

  let events = []

  if (type === 'all' || type === 'work') {
    const workRecords = queryWorkRecords({ dateFrom, dateTo })
    const workEvents = workRecords.map(workRecordToEvent)
    events.push(...workEvents)
  }

  if (type === 'all' || type === 'inspection') {
    const inspRecords = queryInspectionRecords({ dateFrom, dateTo })
    const inspEvents = inspRecords.map(inspectionRecordToEvent)
    events.push(...inspEvents)
  }

  // フィルタ
  if (ngOnly) {
    events = events.filter(e => e.status === 'ng')
  }
  if (needsCheck) {
    events = events.filter(e => e.status === 'ng' || e.status === 'needs_check')
  }

  // 日付降順 → 同日は作業実績・点検の順
  events.sort((a, b) => {
    if (b.date !== a.date) return b.date.localeCompare(a.date)
    return a.source_type.localeCompare(b.source_type)
  })

  return NextResponse.json(events)
}
