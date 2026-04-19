/**
 * masters-db.ts
 * 点検対象と点検項目のマスタデータを JSON ファイルで管理する。
 * v2: InspectionTarget に frequency（点検頻度）を追加
 */

import fs from 'fs'
import path from 'path'

const MASTERS_PATH = path.join(process.cwd(), 'masters.json')

// ---------- 型定義 ----------

export type Frequency = 'daily' | 'weekly' | 'monthly'
export const FREQUENCY_LABELS: Record<Frequency, string> = {
  daily:   '日次',
  weekly:  '週次',
  monthly: '月次',
}

export interface InspectionItem {
  id: number
  label: string
  order: number
  active: boolean
}

export interface InspectionTarget {
  id: number
  name: string
  active: boolean
  frequency: Frequency   // 追加: 点検頻度（既存JSONにない場合は load 時に 'daily' を補完）
  items: InspectionItem[]
}

// ---------- ファイル操作 ----------

function load(): InspectionTarget[] {
  if (!fs.existsSync(MASTERS_PATH)) return seedDefaults()
  try {
    const raw = JSON.parse(fs.readFileSync(MASTERS_PATH, 'utf-8')) as InspectionTarget[]
    // 既存データへの後方互換: frequency が無い場合は 'daily' を補完
    return raw.map(t => ({ ...t, frequency: (t.frequency ?? 'daily') as Frequency }))
  } catch {
    return seedDefaults()
  }
}

function save(data: InspectionTarget[]): void {
  fs.writeFileSync(MASTERS_PATH, JSON.stringify(data, null, 2), 'utf-8')
}

function seedDefaults(): InspectionTarget[] {
  const defaults: InspectionTarget[] = [
    {
      id: 1,
      name: '機械設備 日常点検',
      active: true,
      frequency: 'daily',
      items: [
        { id: 1, label: '電源・稼働状態', order: 1, active: true },
        { id: 2, label: '安全カバーの取り付け確認', order: 2, active: true },
        { id: 3, label: '油量・冷却水確認', order: 3, active: true },
        { id: 4, label: '異音・振動の有無', order: 4, active: true },
        { id: 5, label: '作業スペースの整理整頓', order: 5, active: true },
      ],
    },
    {
      id: 2,
      name: '出荷前品質確認',
      active: true,
      frequency: 'daily',
      items: [
        { id: 6, label: '外観傷・汚れ確認', order: 1, active: true },
        { id: 7, label: '寸法・数量確認', order: 2, active: true },
        { id: 8, label: '梱包材・ラベル確認', order: 3, active: true },
        { id: 9, label: '付属品の同梱確認', order: 4, active: true },
      ],
    },
  ]
  save(defaults)
  return defaults
}

// ---------- 公開関数 ----------

export function getAllTargets(): InspectionTarget[] {
  return load()
}

export function getActiveTargets(): InspectionTarget[] {
  return load()
    .filter(t => t.active)
    .map(t => ({ ...t, items: t.items.filter(i => i.active).sort((a, b) => a.order - b.order) }))
}

export function createTarget(name: string, frequency: Frequency = 'daily'): InspectionTarget {
  const all = load()
  const newTarget: InspectionTarget = {
    id: all.length === 0 ? 1 : Math.max(...all.map(t => t.id)) + 1,
    name,
    active: true,
    frequency,
    items: [],
  }
  all.push(newTarget)
  save(all)
  return newTarget
}

export function updateTarget(id: number, patch: Partial<InspectionTarget>): InspectionTarget | null {
  const all = load()
  const idx = all.findIndex(t => t.id === id)
  if (idx === -1) return null
  all[idx] = { ...all[idx], ...patch, id }
  save(all)
  return all[idx]
}

export function addItem(targetId: number, label: string): InspectionItem | null {
  const all = load()
  const target = all.find(t => t.id === targetId)
  if (!target) return null

  const maxItemId = all.flatMap(t => t.items).reduce((m, i) => Math.max(m, i.id), 0)
  const maxOrder = target.items.reduce((m, i) => Math.max(m, i.order), 0)
  const newItem: InspectionItem = {
    id: maxItemId + 1,
    label,
    order: maxOrder + 1,
    active: true,
  }
  target.items.push(newItem)
  save(all)
  return newItem
}
