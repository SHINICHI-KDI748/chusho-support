/**
 * records-db.ts
 * 点検実施記録を JSON ファイルで管理する。
 * v2: updateRecord, getPeriodRange, getInspectionStatus を追加
 */

import fs from 'fs'
import path from 'path'
import type { Frequency, InspectionTarget } from './masters-db'

const RECORDS_PATH = path.join(process.cwd(), 'inspection-records.json')

// ---------- 型定義 ----------

export type ItemStatus = 'ok' | 'ng' | 'na'

export interface ItemResult {
  item_id: number
  label: string
  status: ItemStatus
  note: string
}

export interface InspectionRecord {
  id: number
  date: string
  target_id: number
  target_name: string
  inspector: string
  results: ItemResult[]
  photo_paths: string[]
  note: string
  has_ng: boolean
  created_at: string
}

export interface RecordInput {
  date: string
  target_id: number
  target_name: string
  inspector: string
  results: ItemResult[]
  photo_paths?: string[]
  note?: string
}

// ---------- ファイル操作 ----------

function load(): InspectionRecord[] {
  if (!fs.existsSync(RECORDS_PATH)) return []
  try {
    return JSON.parse(fs.readFileSync(RECORDS_PATH, 'utf-8')) as InspectionRecord[]
  } catch {
    return []
  }
}

function save(records: InspectionRecord[]): void {
  fs.writeFileSync(RECORDS_PATH, JSON.stringify(records, null, 2), 'utf-8')
}

// ---------- CRUD ----------

export function insertRecord(input: RecordInput): InspectionRecord {
  const all = load()
  const record: InspectionRecord = {
    id: all.length === 0 ? 1 : Math.max(...all.map(r => r.id)) + 1,
    date: input.date,
    target_id: input.target_id,
    target_name: input.target_name,
    inspector: input.inspector,
    results: input.results,
    photo_paths: input.photo_paths ?? [],
    note: input.note ?? '',
    has_ng: input.results.some(r => r.status === 'ng'),
    created_at: new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }),
  }
  all.push(record)
  save(all)
  return record
}

/** 指定IDのレコードを部分更新する */
export function updateRecord(
  id: number,
  patch: Partial<Pick<InspectionRecord, 'date' | 'inspector' | 'note' | 'results' | 'photo_paths'>>
): InspectionRecord | null {
  const all = load()
  const idx = all.findIndex(r => r.id === id)
  if (idx === -1) return null
  const updated: InspectionRecord = { ...all[idx], ...patch }
  // results が更新された場合は has_ng を再計算
  if (patch.results) updated.has_ng = patch.results.some(r => r.status === 'ng')
  all[idx] = updated
  save(all)
  return updated
}

export interface QueryOptions {
  dateFrom?: string
  dateTo?: string
  target_id?: number
  ng_only?: boolean
}

export function queryRecords(opts: QueryOptions = {}): InspectionRecord[] {
  let records = load()
  if (opts.dateFrom)  records = records.filter(r => r.date >= opts.dateFrom!)
  if (opts.dateTo)    records = records.filter(r => r.date <= opts.dateTo!)
  if (opts.target_id) records = records.filter(r => r.target_id === opts.target_id)
  if (opts.ng_only)   records = records.filter(r => r.has_ng)
  return records.sort((a, b) => {
    if (b.date !== a.date) return b.date.localeCompare(a.date)
    return b.id - a.id
  })
}

// ---------- 未入力判定ロジック ----------

/** 頻度と基準日から「該当期間」の開始日を返す */
export function getPeriodStart(date: string, frequency: Frequency): string {
  if (frequency === 'daily') return date
  if (frequency === 'weekly') {
    // 月曜日を週の始まりとする
    const d = new Date(date + 'T00:00:00')
    const dow = d.getDay() // 0=日, 1=月...
    const daysToMon = dow === 0 ? -6 : 1 - dow
    const mon = new Date(d)
    mon.setDate(d.getDate() + daysToMon)
    return mon.toISOString().slice(0, 10)
  }
  // monthly: 月の1日
  return date.slice(0, 7) + '-01'
}

export type InspectionStatusType = 'done' | 'pending'

export interface TargetStatus {
  target_id: number
  target_name: string
  frequency: Frequency
  status: InspectionStatusType
  record_count: number       // 該当期間の実施件数
  last_date: string | null   // 最後に実施した日
  latest_record_id: number | null
}

/**
 * 指定日を基準に、アクティブな点検対象ごとの実施状況を返す。
 * done   = 該当期間（日次:今日、週次:今週、月次:今月）に1件以上の記録がある
 * pending = 該当期間に記録がない
 */
export function getInspectionStatus(date: string, targets: InspectionTarget[]): TargetStatus[] {
  const records = load()
  const activeTargets = targets.filter(t => t.active)

  return activeTargets.map(target => {
    const periodStart = getPeriodStart(date, target.frequency)
    const inPeriod = records.filter(
      r => r.target_id === target.id && r.date >= periodStart && r.date <= date
    )
    const sorted = inPeriod.sort((a, b) => b.date.localeCompare(a.date))
    return {
      target_id:         target.id,
      target_name:       target.name,
      frequency:         target.frequency,
      status:            inPeriod.length > 0 ? 'done' : 'pending',
      record_count:      inPeriod.length,
      last_date:         sorted[0]?.date ?? null,
      latest_record_id:  sorted[0]?.id ?? null,
    }
  })
}
