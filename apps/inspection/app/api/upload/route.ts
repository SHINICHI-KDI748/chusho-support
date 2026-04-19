import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')

// POST /api/upload  multipart/form-data, field name: "photos"
// レスポンス: { paths: string[] }  例: ["/uploads/1712345678_abc.jpg"]
export async function POST(req: NextRequest) {
  // アップロード先ディレクトリを確保
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true })

  const formData = await req.formData()
  const files = formData.getAll('photos') as File[]

  if (files.length === 0) {
    return NextResponse.json({ paths: [] })
  }

  const paths: string[] = []

  for (const file of files) {
    const ext = file.name.split('.').pop() ?? 'jpg'
    // ファイル名はタイムスタンプ+乱数で一意にする
    const filename = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${ext}`
    const fullPath = path.join(UPLOAD_DIR, filename)
    const buffer = Buffer.from(await file.arrayBuffer())
    fs.writeFileSync(fullPath, buffer)
    paths.push(`/uploads/${filename}`)
  }

  return NextResponse.json({ paths })
}
