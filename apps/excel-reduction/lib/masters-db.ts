/**
 * masters-db.ts
 * 工程名・担当者名のマスタを JSON ファイルで管理する。
 * 初回起動時にサンプルデータを自動投入する。
 */

import fs from 'fs'
import path from 'path'

const MASTERS_PATH = path.join(process.cwd(), 'masters.json')

export interface MasterItem {
  id: number
  name: string
  active: boolean
}

export interface Masters {
  processes: MasterItem[]  // 工程名
  workers: MasterItem[]    // 担当者名
}

// ---------- ファイル操作 ----------

function load(): Masters {
  if (!fs.existsSync(MASTERS_PATH)) return seedDefaults()
  try {
    return JSON.parse(fs.readFileSync(MASTERS_PATH, 'utf-8')) as Masters
  } catch {
    return seedDefaults()
  }
}

function save(data: Masters): void {
  fs.writeFileSync(MASTERS_PATH, JSON.stringify(data, null, 2), 'utf-8')
}

function seedDefaults(): Masters {
  const defaults: Masters = {
    processes: [
      { id: 1, name: '組立ライン',  active: true },
      { id: 2, name: '検査工程',    active: true },
      { id: 3, name: '梱包工程',    active: true },
      { id: 4, name: '加工工程',    active: true },
      { id: 5, name: '出荷工程',    active: true },
    ],
    workers: [
      { id: 1, name: '田中', active: true },
      { id: 2, name: '鈴木', active: true },
      { id: 3, name: '佐藤', active: true },
      { id: 4, name: '山田', active: true },
      { id: 5, name: '伊藤', active: true },
    ],
  }
  save(defaults)
  return defaults
}

// ---------- 公開関数 ----------

/** アクティブな工程名・担当者名だけを返す（入力フォーム用） */
export function getActiveMasters(): { processes: string[]; workers: string[] } {
  const m = load()
  return {
    processes: m.processes.filter(p => p.active).map(p => p.name),
    workers:   m.workers.filter(w => w.active).map(w => w.name),
  }
}

/** 全マスタを返す（マスタ管理画面用） */
export function getAllMasters(): Masters {
  return load()
}

function nextId(items: MasterItem[]): number {
  return items.length === 0 ? 1 : Math.max(...items.map(i => i.id)) + 1
}

/** 工程名を追加する */
export function addProcess(name: string): MasterItem {
  const m = load()
  const item: MasterItem = { id: nextId(m.processes), name, active: true }
  m.processes.push(item)
  save(m)
  return item
}

/** 担当者名を追加する */
export function addWorker(name: string): MasterItem {
  const m = load()
  const item: MasterItem = { id: nextId(m.workers), name, active: true }
  m.workers.push(item)
  save(m)
  return item
}

/** 工程名を更新する（name変更 or active切り替え） */
export function updateProcess(id: number, patch: Partial<Pick<MasterItem, 'name' | 'active'>>): boolean {
  const m = load()
  const item = m.processes.find(p => p.id === id)
  if (!item) return false
  Object.assign(item, patch)
  save(m)
  return true
}

/** 担当者名を更新する */
export function updateWorker(id: number, patch: Partial<Pick<MasterItem, 'name' | 'active'>>): boolean {
  const m = load()
  const item = m.workers.find(w => w.id === id)
  if (!item) return false
  Object.assign(item, patch)
  save(m)
  return true
}
