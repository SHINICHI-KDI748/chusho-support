import { NextRequest, NextResponse } from 'next/server'
import { updateTarget, addItem } from '@/lib/masters-db'

// PUT /api/masters/[id]  — 対象全体を上書き（items 含む）
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const updated = updateTarget(Number(id), body)
  if (!updated) return NextResponse.json({ error: '対象が見つかりません' }, { status: 404 })
  return NextResponse.json(updated)
}

// POST /api/masters/[id]  — 点検項目を追加
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { label } = await req.json()
  if (!label?.trim()) {
    return NextResponse.json({ error: '項目名は必須です' }, { status: 400 })
  }
  const item = addItem(Number(id), label.trim())
  if (!item) return NextResponse.json({ error: '対象が見つかりません' }, { status: 404 })
  return NextResponse.json(item, { status: 201 })
}
