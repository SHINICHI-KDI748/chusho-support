import { NextRequest, NextResponse } from 'next/server'
import { insertRecord, queryRecords } from '@/lib/records-db'

// GET /api/records?dateFrom=&dateTo=&target_id=&ng_only=true
export async function GET(req: NextRequest) {
  const p = new URL(req.url).searchParams
  const records = queryRecords({
    dateFrom:  p.get('dateFrom')  ?? undefined,
    dateTo:    p.get('dateTo')    ?? undefined,
    target_id: p.get('target_id') ? Number(p.get('target_id')) : undefined,
    ng_only:   p.get('ng_only') === 'true',
  })
  return NextResponse.json(records)
}

// POST /api/records
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { date, target_id, target_name, inspector, results } = body

  if (!date || !target_id || !target_name || !inspector || !Array.isArray(results)) {
    return NextResponse.json({ error: '必須項目が不足しています' }, { status: 400 })
  }

  const record = insertRecord({
    date,
    target_id: Number(target_id),
    target_name,
    inspector,
    results,
    photo_paths: body.photo_paths ?? [],
    note: body.note ?? '',
  })
  return NextResponse.json(record, { status: 201 })
}
