/**
 * app2-reader.ts
 * inspection-poc の JSON データを読み取る。
 * ダッシュボード側から ../inspection-poc/inspection-records.json を直接参照する。
 * 既存アプリへの変更なし・書き込みなし。
 */

import fs from 'fs'
import path from 'path'

// inspection-poc プロジェクトのルート
const APP2_DIR = path.resolve(process.cwd(), '..', 'inspection-poc')

// ---------- 型定義（app2 の lib/records-db.ts と同形）----------

export type ItemStatus = 'ok' | 'ng' | 'na'

export interface ItemResult {
  item_id: number
  label: string
  status: ItemStatus
  note: string
}

export interface InspectionRecord {
  id: number
  date: string           // YYYY-MM-DD
  target_id: number
  target_name: string
  inspector: string
  results: ItemResult[]
  photo_paths: string[]
  note: string
  has_ng: boolean
  created_at: string
}

export type Frequency = 'daily' | 'weekly' | 'monthly'

export interface InspectionTarget {
  id: number
  name: string
  active: boolean
  frequency: Frequency
  items: { id: number; label: string; order: number; active: boolean }[]
}

// ---------- 読み取り関数 ----------

export function readAllInspectionRecords(): InspectionRecord[] {
  const p = path.join(APP2_DIR, 'inspection-records.json')
  if (!fs.existsSync(p)) return []
  try {
    return JSON.parse(fs.readFileSync(p, 'utf-8')) as InspectionRecord[]
  } catch {
    return []
  }
}

export function readAllTargets(): InspectionTarget[] {
  const p = path.join(APP2_DIR, 'masters.json')
  if (!fs.existsSync(p)) return []
  try {
    const raw = JSON.parse(fs.readFileSync(p, 'utf-8')) as InspectionTarget[]
    return raw.map(t => ({ ...t, frequency: (t.frequency ?? 'daily') as Frequency }))
  } catch {
    return []
  }
}

export function getActiveTargets(): InspectionTarget[] {
  return readAllTargets().filter(t => t.active)
}

export interface InspectionQueryOptions {
  dateFrom?: string
  dateTo?: string
  target_id?: number
  ng_only?: boolean
  inspector?: string
}

export function queryInspectionRecords(opts: InspectionQueryOptions = {}): InspectionRecord[] {
  let records = readAllInspectionRecords()
  if (opts.dateFrom)  records = records.filter(r => r.date >= opts.dateFrom!)
  if (opts.dateTo)    records = records.filter(r => r.date <= opts.dateTo!)
  if (opts.target_id) records = records.filter(r => r.target_id === opts.target_id)
  if (opts.ng_only)   records = records.filter(r => r.has_ng)
  if (opts.inspector) records = records.filter(r => r.inspector === opts.inspector)
  return records.sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
}

// ---------- 未実施判定 ----------

/** 頻度と基準日から「期間開始日」を返す（app2 の getPeriodStart と同実装）*/
export function getPeriodStart(date: string, frequency: Frequency): string {
  if (frequency === 'daily') return date
  if (frequency === 'weekly') {
    const d = new Date(date + 'T00:00:00')
    const dow = d.getDay()
    const daysToMon = dow === 0 ? -6 : 1 - dow
    const mon = new Date(d)
    mon.setDate(d.getDate() + daysToMon)
    return mon.toISOString().slice(0, 10)
  }
  return date.slice(0, 7) + '-01'
}

export interface TargetStatus {
  target_id: number
  target_name: string
  frequency: Frequency
  status: 'done' | 'pending'
  record_count: number
  last_date: string | null
  latest_record_id: number | null
}

/** 指定日を基準にアクティブな点検対象の実施状況を返す */
export function getInspectionStatus(date: string): TargetStatus[] {
  const targets = getActiveTargets()
  const records = readAllInspectionRecords()

  return targets.map(target => {
    const periodStart = getPeriodStart(date, target.frequency)
    const inPeriod = records.filter(
      r => r.target_id === target.id && r.date >= periodStart && r.date <= date
    )
    const sorted = [...inPeriod].sort((a, b) => b.date.localeCompare(a.date))
    return {
      target_id:        target.id,
      target_name:      target.name,
      frequency:        target.frequency,
      status:           inPeriod.length > 0 ? 'done' : 'pending',
      record_count:     inPeriod.length,
      last_date:        sorted[0]?.date ?? null,
      latest_record_id: sorted[0]?.id ?? null,
    }
  })
}
