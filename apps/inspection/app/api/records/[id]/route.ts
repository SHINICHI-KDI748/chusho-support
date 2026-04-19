import { NextRequest, NextResponse } from 'next/server'
import { updateRecord } from '@/lib/records-db'

type Params = { params: Promise<{ id: string }> }

// PUT /api/records/[id]  — 部分更新（date, inspector, note, results）
export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params
  const body = await req.json()
  const updated = updateRecord(Number(id), body)
  if (!updated) return NextResponse.json({ error: 'レコードが見つかりません' }, { status: 404 })
  return NextResponse.json(updated)
}
