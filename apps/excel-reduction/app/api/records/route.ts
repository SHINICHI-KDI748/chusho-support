import { NextRequest, NextResponse } from 'next/server'
import { insertRecord, queryRecords } from '@/lib/db'

// GET /api/records?dateFrom=&dateTo=&keyword=
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const records = queryRecords({
    dateFrom: searchParams.get('dateFrom') ?? undefined,
    dateTo:   searchParams.get('dateTo')   ?? undefined,
    keyword:  searchParams.get('keyword')  ?? undefined,
  })
  return NextResponse.json(records)
}

// POST /api/records  body: RecordInput（JSON）
export async function POST(req: NextRequest) {
  const body = await req.json()

  // 最低限のバリデーション
  const { date, process_name, worker_name, target_name, quantity, note } = body
  if (!date || !process_name || !worker_name || !target_name || quantity == null) {
    return NextResponse.json({ error: '必須項目が不足しています' }, { status: 400 })
  }
  if (isNaN(Number(quantity)) || Number(quantity) < 0) {
    return NextResponse.json({ error: '数量は0以上の数値を入力してください' }, { status: 400 })
  }

  const record = insertRecord({
    date,
    process_name,
    worker_name,
    target_name,
    quantity: Number(quantity),
    note,
  })
  return NextResponse.json(record, { status: 201 })
}
