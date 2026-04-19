import { NextRequest, NextResponse } from 'next/server'
import {
  getActiveMasters, getAllMasters,
  addProcess, addWorker, updateProcess, updateWorker,
} from '@/lib/masters-db'

// GET /api/masters?all=true   全マスタ（管理画面用）
// GET /api/masters             アクティブのみ（入力フォーム用）
export async function GET(req: NextRequest) {
  const all = new URL(req.url).searchParams.get('all') === 'true'
  return NextResponse.json(all ? getAllMasters() : getActiveMasters())
}

// POST /api/masters  { type: 'process'|'worker', name: string }
export async function POST(req: NextRequest) {
  const { type, name } = await req.json()
  if (!name?.trim()) {
    return NextResponse.json({ error: '名前は必須です' }, { status: 400 })
  }
  const item = type === 'process' ? addProcess(name.trim()) : addWorker(name.trim())
  return NextResponse.json(item, { status: 201 })
}

// PUT /api/masters  { type, id, name?, active? }
export async function PUT(req: NextRequest) {
  const { type, id, ...patch } = await req.json()
  const ok = type === 'process' ? updateProcess(id, patch) : updateWorker(id, patch)
  if (!ok) return NextResponse.json({ error: '対象が見つかりません' }, { status: 404 })
  return NextResponse.json({ success: true })
}
