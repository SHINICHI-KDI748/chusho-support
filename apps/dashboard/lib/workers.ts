/**
 * workers.ts
 * shared/workers.json から担当者共通マスタを読み取る。
 * アプリ1の worker_name とアプリ2の inspector を正規名に統一する。
 */

import fs from 'fs'
import path from 'path'

const SHARED_DIR = path.resolve(process.cwd(), '..', 'shared')

export interface Worker {
  id: number
  name: string
  active: boolean
  aliases: string[]
}

interface WorkersFile {
  workers: Worker[]
}

let _cache: Worker[] | null = null

export function readWorkers(): Worker[] {
  if (_cache) return _cache
  const p = path.join(SHARED_DIR, 'workers.json')
  if (!fs.existsSync(p)) return []
  try {
    const raw = JSON.parse(fs.readFileSync(p, 'utf-8')) as WorkersFile
    _cache = raw.workers
    return _cache
  } catch {
    return []
  }
}

export function getActiveWorkers(): Worker[] {
  return readWorkers().filter(w => w.active)
}

/**
 * 入力名（表記ゆれを含む可能性あり）を正規名に変換する。
 * aliases に一致するものがあれば正規名を返す。
 * 一致しない場合は入力名をそのまま返す（フォールバック）。
 */
export function normalizeWorkerName(input: string): string {
  const workers = readWorkers()
  const trimmed = input.trim()
  for (const w of workers) {
    if (w.name === trimmed) return w.name
    if (w.aliases.includes(trimmed)) return w.name
  }
  return trimmed
}

/** 正規名のリストを返す（担当者フィルタ選択用）*/
export function getWorkerNames(): string[] {
  return getActiveWorkers().map(w => w.name)
}
