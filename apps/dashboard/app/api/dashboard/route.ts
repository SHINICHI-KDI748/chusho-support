/**
 * GET /api/dashboard?dateFrom=YYYY-MM-DD&dateTo=YYYY-MM-DD
 *
 * 統合サマリーを返す。
 * - 期間内の作業実績・点検記録を集計
 * - 今日基準の未実施点検対象数を追加
 */

import { NextRequest, NextResponse } from 'next/server'
import { queryWorkRecords }          from '@/lib/app1-reader'
import { queryInspectionRecords, getInspectionStatus } from '@/lib/app2-reader'
import { buildSummary }              from '@/lib/unified'

function todayJST(): string {
  return new Date().toLocaleDateString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year:  'numeric',
    month: '2-digit',
    day:   '2-digit',
  }).replace(/\//g, '-')
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const today    = todayJST()
  const dateFrom = searchParams.get('dateFrom') ?? today
  const dateTo   = searchParams.get('dateTo')   ?? today

  // 期間内データ取得
  const [workRecords, inspRecords, statuses] = await Promise.all([
    queryWorkRecords({ dateFrom, dateTo }),
    queryInspectionRecords({ dateFrom, dateTo }),
    getInspectionStatus(today),
  ])
  const pendingCount = statuses.filter(s => s.status === 'pending').length

  const summary = buildSummary(workRecords, inspRecords, pendingCount)

  return NextResponse.json({
    ...summary,
    dateFrom,
    dateTo,
    pending_targets: statuses,   // 詳細も返す
  })
}
