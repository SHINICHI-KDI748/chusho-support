import fs from 'fs'
import path from 'path'

const LOCAL_DIRS = [
  path.resolve(process.cwd(), '..', 'inspection'),
  path.resolve(process.cwd(), '..', 'inspection-poc'),
]

function findLocalDir(): string | null {
  return LOCAL_DIRS.find(d => fs.existsSync(d)) ?? null
}

export type ItemStatus = 'ok' | 'ng' | 'na'
export interface ItemResult { item_id: number; label: string; status: ItemStatus; note: string }
export interface InspectionRecord {
  id: number; date: string; target_id: number; target_name: string
  inspector: string; results: ItemResult[]; photo_paths: string[]
  note: string; has_ng: boolean; created_at: string
}
export type Frequency = 'daily' | 'weekly' | 'monthly'
export interface InspectionTarget {
  id: number; name: string; active: boolean; frequency: Frequency
  items: { id: number; label: string; order: number; active: boolean }[]
}

// ---- 内部: データ取得（Vercel: API / ローカル: ファイル）----

async function fetchAllInspectionRecords(): Promise<InspectionRecord[]> {
  if (process.env.VERCEL) {
    const base = process.env.APP_INSPECTION_URL ?? ''
    if (!base) return []
    try {
      const res = await fetch(`${base}/apps/inspection/api/records`, { next: { revalidate: 30 } })
      if (!res.ok) return []
      return res.json()
    } catch { return [] }
  }
  const dir = findLocalDir()
  if (!dir) return []
  const p = path.join(dir, 'inspection-records.json')
  if (!fs.existsSync(p)) return []
  try { return JSON.parse(fs.readFileSync(p, 'utf-8')) as InspectionRecord[] }
  catch { return [] }
}

async function fetchTargets(): Promise<InspectionTarget[]> {
  if (process.env.VERCEL) {
    const base = process.env.APP_INSPECTION_URL ?? ''
    if (!base) return []
    try {
      const res = await fetch(`${base}/apps/inspection/api/masters`, { next: { revalidate: 60 } })
      if (!res.ok) return []
      const raw = await res.json() as InspectionTarget[]
      return raw.map(t => ({ ...t, frequency: (t.frequency ?? 'daily') as Frequency }))
    } catch { return [] }
  }
  const dir = findLocalDir()
  if (!dir) return []
  const p = path.join(dir, 'masters.json')
  if (!fs.existsSync(p)) return []
  try {
    const raw = JSON.parse(fs.readFileSync(p, 'utf-8')) as InspectionTarget[]
    return raw.map(t => ({ ...t, frequency: (t.frequency ?? 'daily') as Frequency }))
  } catch { return [] }
}

// ---- 公開 API ----

export interface InspectionQueryOptions {
  dateFrom?: string; dateTo?: string; target_id?: number; ng_only?: boolean; inspector?: string
}

export async function readAllInspectionRecords(): Promise<InspectionRecord[]> {
  return fetchAllInspectionRecords()
}

export async function readAllTargets(): Promise<InspectionTarget[]> {
  return fetchTargets()
}

export async function getActiveTargets(): Promise<InspectionTarget[]> {
  return (await fetchTargets()).filter(t => t.active)
}

export async function queryInspectionRecords(opts: InspectionQueryOptions = {}): Promise<InspectionRecord[]> {
  let records = await fetchAllInspectionRecords()
  if (opts.dateFrom)  records = records.filter(r => r.date >= opts.dateFrom!)
  if (opts.dateTo)    records = records.filter(r => r.date <= opts.dateTo!)
  if (opts.target_id) records = records.filter(r => r.target_id === opts.target_id)
  if (opts.ng_only)   records = records.filter(r => r.has_ng)
  if (opts.inspector) records = records.filter(r => r.inspector === opts.inspector)
  return records.sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
}

export function getPeriodStart(date: string, frequency: Frequency): string {
  if (frequency === 'daily') return date
  if (frequency === 'weekly') {
    const d = new Date(date + 'T00:00:00')
    const daysToMon = d.getDay() === 0 ? -6 : 1 - d.getDay()
    const mon = new Date(d); mon.setDate(d.getDate() + daysToMon)
    return mon.toISOString().slice(0, 10)
  }
  return date.slice(0, 7) + '-01'
}

export interface TargetStatus {
  target_id: number; target_name: string; frequency: Frequency
  status: 'done' | 'pending'; record_count: number; last_date: string | null; latest_record_id: number | null
}

export async function getInspectionStatus(date: string): Promise<TargetStatus[]> {
  const [targets, records] = await Promise.all([fetchTargets(), fetchAllInspectionRecords()])
  const active = targets.filter(t => t.active)
  return active.map(target => {
    const periodStart = getPeriodStart(date, target.frequency)
    const inPeriod = records.filter(r => r.target_id === target.id && r.date >= periodStart && r.date <= date)
    const sorted = [...inPeriod].sort((a, b) => b.date.localeCompare(a.date))
    return {
      target_id: target.id, target_name: target.name, frequency: target.frequency,
      status: inPeriod.length > 0 ? 'done' : 'pending',
      record_count: inPeriod.length, last_date: sorted[0]?.date ?? null,
      latest_record_id: sorted[0]?.id ?? null,
    }
  })
}
