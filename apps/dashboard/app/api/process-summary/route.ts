/**
 * GET /api/process-summary?dateFrom=YYYY-MM-DD&dateTo=YYYY-MM-DD
 *
 * 工程別（作業実績）と点検対象別（点検記録）の集計を返す。
 * ダッシュボードの工程別集計セクションに使用する。
 */

import { NextRequest, NextResponse } from 'next/server'
import { queryWorkRecords }          from '@/lib/app1-reader'
import { queryInspectionRecords }    from '@/lib/app2-reader'

function todayJST(): string {
  return new Date().toLocaleDateString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).replace(/\//g, '-')
}

export interface ProcessSummary {
  name: string
  work_count: number
  work_qty: number
}

export interface InspectionCategorySummary {
  name: string
  insp_count: number
  ng_count: number
  ng_rate: number  // 0.0 ~ 1.0
}

export interface ProcessSummaryResponse {
  processes: ProcessSummary[]
  inspection_categories: InspectionCategorySummary[]
  dateFrom: string
  dateTo: string
}

export async function GET(req: NextRequest) {
  const sp = new URL(req.url).searchParams
  const today    = todayJST()
  const dateFrom = sp.get('dateFrom') ?? today
  const dateTo   = sp.get('dateTo')   ?? today

  const workRecords = queryWorkRecords({ dateFrom, dateTo })
  const inspRecords = queryInspectionRecords({ dateFrom, dateTo })

  // 工程別集計
  const processMap = new Map<string, ProcessSummary>()
  for (const r of workRecords) {
    if (!processMap.has(r.process_name)) {
      processMap.set(r.process_name, { name: r.process_name, work_count: 0, work_qty: 0 })
    }
    const entry = processMap.get(r.process_name)!
    entry.work_count++
    entry.work_qty += r.quantity
  }
  const processes = Array.from(processMap.values())
    .sort((a, b) => b.work_count - a.work_count)

  // 点検対象別集計
  const inspMap = new Map<string, InspectionCategorySummary>()
  for (const r of inspRecords) {
    if (!inspMap.has(r.target_name)) {
      inspMap.set(r.target_name, { name: r.target_name, insp_count: 0, ng_count: 0, ng_rate: 0 })
    }
    const entry = inspMap.get(r.target_name)!
    entry.insp_count++
    if (r.has_ng) entry.ng_count++
  }
  // NG率計算
  for (const v of inspMap.values()) {
    v.ng_rate = v.insp_count > 0 ? v.ng_count / v.insp_count : 0
  }
  const inspection_categories = Array.from(inspMap.values())
    .sort((a, b) => b.insp_count - a.insp_count)

  const res: ProcessSummaryResponse = {
    processes,
    inspection_categories,
    dateFrom,
    dateTo,
  }

  return NextResponse.json(res)
}
