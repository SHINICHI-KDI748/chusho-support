/**
 * unified.ts
 * アプリ1（作業実績）とアプリ2（点検記録）のデータを
 * 統合ダッシュボード表示用の共通型に変換する。
 *
 * PoC 方針：DB統合なし・UI統合のみ。
 * 各アプリの JSON を読み取り、共通ビュー型に整形して返す。
 */

import type { WorkRecord }       from './app1-reader'
import type { InspectionRecord } from './app2-reader'

// ---------- 共通型定義 ----------

export type SourceType  = 'work_log' | 'inspection'
export type EventStatus = 'ok' | 'ng' | 'pending' | 'needs_check'

export interface UnifiedEvent {
  id: string             // "work-{id}" or "insp-{id}"
  source_type: SourceType
  date: string           // YYYY-MM-DD
  target_name: string
  process_or_category: string
  assignee_name: string
  status: EventStatus
  note: string
  created_at: string
  // 拡張フィールド
  quantity?: number      // work_log のみ
  has_ng?: boolean       // inspection のみ
  ng_count?: number      // inspection のみ
  ng_labels?: string[]   // inspection NG項目名リスト
}

// ---------- 変換関数 ----------

/** App1 の WorkRecord → UnifiedEvent */
export function workRecordToEvent(r: WorkRecord): UnifiedEvent {
  // 作業実績は基本的に「正常記録」。備考ありを要確認扱い。
  const status: EventStatus = r.note.trim() ? 'needs_check' : 'ok'
  return {
    id:                  `work-${r.id}`,
    source_type:         'work_log',
    date:                r.date,
    target_name:         r.target_name,
    process_or_category: r.process_name,
    assignee_name:       r.worker_name,
    status,
    note:                r.note,
    created_at:          r.created_at,
    quantity:            r.quantity,
  }
}

/** App2 の InspectionRecord → UnifiedEvent */
export function inspectionRecordToEvent(r: InspectionRecord): UnifiedEvent {
  const ngResults = r.results.filter(res => res.status === 'ng')
  const status: EventStatus = r.has_ng ? 'ng' : 'ok'
  return {
    id:                  `insp-${r.id}`,
    source_type:         'inspection',
    date:                r.date,
    target_name:         r.target_name,
    process_or_category: '点検',
    assignee_name:       r.inspector,
    status,
    note:                r.note,
    created_at:          r.created_at,
    has_ng:              r.has_ng,
    ng_count:            ngResults.length,
    ng_labels:           ngResults.map(res => res.label),
  }
}

// ---------- 集計型 ----------

export interface DashboardSummary {
  total_work_logs:    number   // 期間内 作業実績件数
  total_inspections:  number   // 期間内 点検実施件数
  total_ng:           number   // 期間内 NG件数
  total_needs_check:  number   // 期間内 要確認（備考あり）件数
  total_pending:      number   // 今日基準 未実施点検対象数
  // 担当者別サマリ
  assignee_summary:   AssigneeSummary[]
}

export interface AssigneeSummary {
  name:          string
  work_count:    number   // 作業実績件数
  work_qty:      number   // 合計数量
  insp_count:    number   // 点検件数
  ng_count:      number   // NG件数
}

// ---------- 集計関数 ----------

/** WorkRecord[] と InspectionRecord[] から DashboardSummary を生成 */
export function buildSummary(
  workRecords: WorkRecord[],
  inspRecords: InspectionRecord[],
  pendingCount: number,
): DashboardSummary {
  const total_ng          = inspRecords.filter(r => r.has_ng).length
  const total_needs_check = workRecords.filter(r => r.note.trim()).length

  // 担当者別集計（作業実績の worker_name と点検の inspector を名前で突合）
  const assigneeMap = new Map<string, AssigneeSummary>()

  function getOrCreate(name: string): AssigneeSummary {
    if (!assigneeMap.has(name)) {
      assigneeMap.set(name, { name, work_count: 0, work_qty: 0, insp_count: 0, ng_count: 0 })
    }
    return assigneeMap.get(name)!
  }

  for (const r of workRecords) {
    const s = getOrCreate(r.worker_name)
    s.work_count++
    s.work_qty += r.quantity
  }
  for (const r of inspRecords) {
    const s = getOrCreate(r.inspector)
    s.insp_count++
    if (r.has_ng) s.ng_count++
  }

  const assignee_summary = Array.from(assigneeMap.values())
    .sort((a, b) => (b.work_count + b.insp_count) - (a.work_count + a.insp_count))

  return {
    total_work_logs:   workRecords.length,
    total_inspections: inspRecords.length,
    total_ng,
    total_needs_check,
    total_pending:     pendingCount,
    assignee_summary,
  }
}
