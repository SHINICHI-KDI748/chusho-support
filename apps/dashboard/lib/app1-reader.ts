/**
 * app1-reader.ts
 * excel-reduction-poc の JSON データを読み取る。
 * ダッシュボード側から ../excel-reduction-poc/records.json を直接参照する。
 * 既存アプリへの変更なし・書き込みなし。
 */

import fs from 'fs'
import path from 'path'

// excel-reduction-poc プロジェクトのルート
const APP1_DIR = path.resolve(process.cwd(), '..', 'excel-reduction-poc')

// ---------- 型定義（app1 の lib/db.ts と同形）----------

export interface WorkRecord {
  id: number
  date: string           // YYYY-MM-DD
  process_name: string
  worker_name: string
  target_name: string
  quantity: number
  note: string
  created_at: string
}

// ---------- 読み取り関数 ----------

export function readAllWorkRecords(): WorkRecord[] {
  const p = path.join(APP1_DIR, 'records.json')
  if (!fs.existsSync(p)) return []
  try {
    return JSON.parse(fs.readFileSync(p, 'utf-8')) as WorkRecord[]
  } catch {
    return []
  }
}

export interface WorkQueryOptions {
  dateFrom?: string
  dateTo?: string
  keyword?: string
}

export function queryWorkRecords(opts: WorkQueryOptions = {}): WorkRecord[] {
  let records = readAllWorkRecords()
  if (opts.dateFrom) records = records.filter(r => r.date >= opts.dateFrom!)
  if (opts.dateTo)   records = records.filter(r => r.date <= opts.dateTo!)
  if (opts.keyword) {
    const kw = opts.keyword.toLowerCase()
    records = records.filter(r =>
      r.process_name.toLowerCase().includes(kw) ||
      r.worker_name.toLowerCase().includes(kw)  ||
      r.target_name.toLowerCase().includes(kw)  ||
      r.note.toLowerCase().includes(kw)
    )
  }
  return records.sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
}

/** App1 の担当者マスタ（アクティブのみ）を取得 */
export function getApp1Workers(): string[] {
  const p = path.join(APP1_DIR, 'masters.json')
  if (!fs.existsSync(p)) return []
  try {
    const m = JSON.parse(fs.readFileSync(p, 'utf-8')) as {
      workers: { id: number; name: string; active: boolean }[]
    }
    return m.workers.filter(w => w.active).map(w => w.name)
  } catch {
    return []
  }
}
