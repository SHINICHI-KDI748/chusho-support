/**
 * GET  /api/poc-evaluation  → 現在の測定値を返す
 * POST /api/poc-evaluation  → 測定値を保存する
 *
 * poc-data/measurement.json を読み書きする。
 */

import { NextRequest, NextResponse } from 'next/server'
import fs   from 'fs'
import path from 'path'

const DATA_PATH = path.resolve(process.cwd(), 'poc-data', 'measurement.json')

function todayJST(): string {
  return new Date().toLocaleDateString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).replace(/\//g, '-')
}

export async function GET() {
  if (!fs.existsSync(DATA_PATH)) {
    return NextResponse.json({ before: {}, after: {}, updated_at: '' })
  }
  try {
    const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'))
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: '読み込み失敗' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const updated = { ...body, updated_at: new Date().toISOString() }
    fs.writeFileSync(DATA_PATH, JSON.stringify(updated, null, 2), 'utf-8')
    return NextResponse.json({ ok: true, updated_at: updated.updated_at })
  } catch {
    return NextResponse.json({ error: '保存失敗' }, { status: 500 })
  }
}
