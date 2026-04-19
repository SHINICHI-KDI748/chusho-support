import fs from 'fs'
import path from 'path'

// ローカル開発時のファイルパス（excel-reduction → excel-reduction-poc の両方を試みる）
const LOCAL_DIRS = [
  path.resolve(process.cwd(), '..', 'excel-reduction'),
  path.resolve(process.cwd(), '..', 'excel-reduction-poc'),
]

function findLocalDir(): string | null {
  return LOCAL_DIRS.find(d => fs.existsSync(d)) ?? null
}

export interface WorkRecord {
  id: number
  date: string
  process_name: string
  worker_name: string
  target_name: string
  quantity: number
  note: string
  created_at: string
}

// ---- 内部: データ取得（Vercel: API / ローカル: ファイル）----

async function fetchAllWorkRecords(): Promise<WorkRecord[]> {
  if (process.env.VERCEL) {
    const base = process.env.APP_WORK_URL ?? ''
    if (!base) return []
    try {
      const res = await fetch(`${base}/apps/work/api/records`, { next: { revalidate: 30 } })
      if (!res.ok) return []
      return res.json()
    } catch { return [] }
  }
  const dir = findLocalDir()
  if (!dir) return []
  const p = path.join(dir, 'records.json')
  if (!fs.existsSync(p)) return []
  try { return JSON.parse(fs.readFileSync(p, 'utf-8')) as WorkRecord[] }
  catch { return [] }
}

async function fetchMasters(): Promise<{ workers: { id: number; name: string; active: boolean }[] }> {
  if (process.env.VERCEL) {
    const base = process.env.APP_WORK_URL ?? ''
    if (!base) return { workers: [] }
    try {
      const res = await fetch(`${base}/apps/work/api/masters`, { next: { revalidate: 60 } })
      if (!res.ok) return { workers: [] }
      return res.json()
    } catch { return { workers: [] } }
  }
  const dir = findLocalDir()
  if (!dir) return { workers: [] }
  const p = path.join(dir, 'masters.json')
  if (!fs.existsSync(p)) return { workers: [] }
  try { return JSON.parse(fs.readFileSync(p, 'utf-8')) }
  catch { return { workers: [] } }
}

// ---- 公開 API ----

export interface WorkQueryOptions {
  dateFrom?: string
  dateTo?: string
  keyword?: string
}

export async function readAllWorkRecords(): Promise<WorkRecord[]> {
  return fetchAllWorkRecords()
}

export async function queryWorkRecords(opts: WorkQueryOptions = {}): Promise<WorkRecord[]> {
  let records = await fetchAllWorkRecords()
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

export async function getApp1Workers(): Promise<string[]> {
  const m = await fetchMasters()
  return m.workers.filter(w => w.active).map(w => w.name)
}
