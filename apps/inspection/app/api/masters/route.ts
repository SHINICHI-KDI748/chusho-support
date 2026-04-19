import { NextRequest, NextResponse } from 'next/server'
import { getActiveTargets, getAllTargets, createTarget } from '@/lib/masters-db'
import type { Frequency } from '@/lib/masters-db'

// GET /api/masters?all=true  全件（マスタ管理用）
// GET /api/masters            アクティブのみ（入力フォーム用）
export async function GET(req: NextRequest) {
  const all = new URL(req.url).searchParams.get('all') === 'true'
  const data = all ? getAllTargets() : getActiveTargets()
  return NextResponse.json(data)
}

// POST /api/masters  { name: string, frequency?: Frequency }
export async function POST(req: NextRequest) {
  const { name, frequency } = await req.json()
  if (!name?.trim()) {
    return NextResponse.json({ error: '点検対象名は必須です' }, { status: 400 })
  }
  const target = createTarget(name.trim(), (frequency as Frequency) ?? 'daily')
  return NextResponse.json(target, { status: 201 })
}
