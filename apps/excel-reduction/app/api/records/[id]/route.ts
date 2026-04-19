import { NextRequest, NextResponse } from 'next/server'
import { updateRecord, deleteRecord } from '@/lib/db'

type Params = { params: Promise<{ id: string }> }

// PUT /api/records/[id]  — フィールド部分更新
export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params
  const body = await req.json()
  const updated = updateRecord(Number(id), body)
  if (!updated) return NextResponse.json({ error: 'レコードが見つかりません' }, { status: 404 })
  return NextResponse.json(updated)
}

// DELETE /api/records/[id]  — 物理削除
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const ok = deleteRecord(Number(id))
  if (!ok) return NextResponse.json({ error: 'レコードが見つかりません' }, { status: 404 })
  return NextResponse.json({ success: true })
}
