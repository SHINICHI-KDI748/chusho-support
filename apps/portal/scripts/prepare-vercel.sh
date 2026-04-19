#!/bin/bash
# Vercelビルド時に自動実行されるスクリプト
# vercel.json の buildCommand から呼ばれる
set -e

echo "🔧 Vercel用スキーマに切り替え..."
cp prisma/schema.prod.prisma prisma/schema.prisma

echo "⚙️  Prismaクライアント生成..."
npx prisma generate

echo "🏗️  Next.jsビルド..."
next build
