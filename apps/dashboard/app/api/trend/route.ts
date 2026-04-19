/**
 * GET /api/trend?days=30
 *
 * 直近N日の日別集計を返す。
 * - 作業実績件数・数量
 * - 点検実施件数・NG件数
 * ダッシュボードのトレンドグラフに使用する。
 */

import { NextRequest, NextResponse } from 'next/server'
import { readAllWorkRecords }       from '@/lib/app1-reader'
import { readAllInspectionRecords } from '@/lib/app2-reader'

function todayJST(): string {
  return new Date().toLocaleDateString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).replace(/\//g, '-')
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

export interface DayTrend {
  date: string       // YYYY-MM-DD
  work_count: number
  work_qty: number
  insp_count: number
  ng_count: number
}

export async function GET(req: NextRequest) {
  const p    = new URL(req.url).searchParams
  const days = Math.min(Math.max(parseInt(p.get('days') ?? '30'), 7), 90)

  const today    = todayJST()
  const dateFrom = addDays(today, -(days - 1))

  const [allWork, allInsp] = await Promise.all([readAllWorkRecords(), readAllInspectionRecords()])
  const workRecords = allWork.filter(r => r.date >= dateFrom && r.date <= today)
  const inspRecords = allInsp.filter(r => r.date >= dateFrom && r.date <= today)

  // 日付ごとに集計
  const map = new Map<string, DayTrend>()

  // 全日付を 0 で初期化
  for (let i = 0; i < days; i++) {
    const d = addDays(dateFrom, i)
    map.set(d, { date: d, work_count: 0, work_qty: 0, insp_count: 0, ng_count: 0 })
  }

  for (const r of workRecords) {
    const entry = map.get(r.date)
    if (entry) {
      entry.work_count++
      entry.work_qty += r.quantity
    }
  }

  for (const r of inspRecords) {
    const entry = map.get(r.date)
    if (entry) {
      entry.insp_count++
      if (r.has_ng) entry.ng_count++
    }
  }

  const trend = Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date))

  return NextResponse.json(trend)
}
