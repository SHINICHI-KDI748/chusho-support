/**
 * db.ts — JSONファイルを使ったシンプルな永続化
 *
 * PoC規模（数百件/日）であれば十分な性能。
 * 拡張する場合は better-sqlite3 や Prisma + SQLite に置き換える。
 */

import fs from 'fs'
import path from 'path'

const DB_PATH = path.join(process.cwd(), 'records.json')

export interface Record {
  id: number
  date: string
  process_name: string
  worker_name: string
  target_name: string
  quantity: number
  note: string
  created_at: string
}

export interface RecordInput {
  date: string
  process_name: string
  worker_name: string
  target_name: string
  quantity: number
  note?: string
}

// ファイルからデータを読む（存在しなければ空配列）
function load(): Record[] {
  if (!fs.existsSync(DB_PATH)) return []
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8')) as Record[]
  } catch {
    return []
  }
}

// データをファイルに書き込む
function save(records: Record[]): void {
  fs.writeFileSync(DB_PATH, JSON.stringify(records, null, 2), 'utf-8')
}

// 次のIDを計算（オートインクリメント相当）
function nextId(records: Record[]): number {
  if (records.length === 0) return 1
  return Math.max(...records.map(r => r.id)) + 1
}

export function insertRecord(input: RecordInput): Record {
  const records = load()
  const record: Record = {
    id: nextId(records),
    date: input.date,
    process_name: input.process_name,
    worker_name: input.worker_name,
    target_name: input.target_name,
    quantity: input.quantity,
    note: input.note ?? '',
    created_at: new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }),
  }
  records.push(record)
  save(records)
  return record
}

/** 指定IDのレコードを更新する。存在しない場合は null を返す */
export function updateRecord(id: number, patch: Partial<RecordInput>): Record | null {
  const records = load()
  const idx = records.findIndex(r => r.id === id)
  if (idx === -1) return null
  records[idx] = {
    ...records[idx],
    ...patch,
    quantity: patch.quantity !== undefined ? Number(patch.quantity) : records[idx].quantity,
  }
  save(records)
  return records[idx]
}

/** 指定IDのレコードを物理削除する */
export function deleteRecord(id: number): boolean {
  const records = load()
  const idx = records.findIndex(r => r.id === id)
  if (idx === -1) return false
  records.splice(idx, 1)
  save(records)
  return true
}

export interface QueryOptions {
  dateFrom?: string
  dateTo?: string
  keyword?: string
}

export function queryRecords(opts: QueryOptions = {}): Record[] {
  let records = load()

  if (opts.dateFrom) {
    records = records.filter(r => r.date >= opts.dateFrom!)
  }
  if (opts.dateTo) {
    records = records.filter(r => r.date <= opts.dateTo!)
  }
  if (opts.keyword) {
    const kw = opts.keyword.toLowerCase()
    records = records.filter(r =>
      r.process_name.toLowerCase().includes(kw) ||
      r.worker_name.toLowerCase().includes(kw)  ||
      r.target_name.toLowerCase().includes(kw)  ||
      r.note.toLowerCase().includes(kw)
    )
  }

  // 新しい順に並べる
  return records.sort((a, b) => {
    if (b.date !== a.date) return b.date.localeCompare(a.date)
    return b.id - a.id
  })
}
