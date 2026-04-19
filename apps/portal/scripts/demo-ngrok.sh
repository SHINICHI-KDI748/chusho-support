#!/bin/bash
# =========================================================
# ngrokデモ起動スクリプト（全5プロセス同時起動）
# 実行: bash apps/portal/scripts/demo-ngrok.sh
# =========================================================
set -e

REPO_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
PORTAL_DIR="$REPO_ROOT/apps/portal"
PORT=3010
ENV_FILE="$PORTAL_DIR/.env"

echo ""
echo "🚀 業務アプリ デモ起動スクリプト"
echo "=================================="

# --- 前提確認 ---
if ! command -v ngrok &>/dev/null; then
  echo "❌ ngrokが見つかりません: brew install ngrok"
  exit 1
fi
if [ ! -f "$ENV_FILE" ]; then
  echo "❌ .envが見つかりません: cp apps/portal/.env.example apps/portal/.env"
  exit 1
fi

# --- DB初期化（初回のみ）---
if [ ! -f "$PORTAL_DIR/prisma/dev.db" ]; then
  echo "⚙️  DB初期化中..."
  cd "$PORTAL_DIR"
  npm run db:generate && npm run db:push && npm run db:seed
fi

# --- ビルド（変更があれば）---
echo "⚙️  ポータルをビルド中..."
cd "$PORTAL_DIR" && npm run build > /tmp/portal-build.log 2>&1 || {
  echo "❌ ビルド失敗: cat /tmp/portal-build.log を確認してください"
  exit 1
}

# --- 各アプリをバックグラウンド起動 ---
echo "🔄 各アプリを起動中..."
pkill -f "next.*3000" 2>/dev/null || true
pkill -f "next.*3001" 2>/dev/null || true
pkill -f "next.*3002" 2>/dev/null || true
pkill -f "next.*3003" 2>/dev/null || true
sleep 1

cd "$REPO_ROOT/apps/excel-reduction"  && npm run dev > /tmp/app-work.log 2>&1 &
cd "$REPO_ROOT/apps/inspection"        && npm run dev > /tmp/app-inspection.log 2>&1 &
cd "$REPO_ROOT/apps/dashboard"         && npm run dev > /tmp/app-dashboard.log 2>&1 &
cd "$REPO_ROOT/apps/poc-case-generator" && npm run dev > /tmp/app-case.log 2>&1 &

echo "  ⏳ 各アプリの起動を待機中（約15秒）..."
sleep 15

# --- ngrok起動 ---
echo "🌐 ngrokを起動中..."
pkill -f "ngrok http" 2>/dev/null || true
ngrok http $PORT --log=stdout > /tmp/ngrok.log 2>&1 &
NGROK_PID=$!
sleep 5

NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null \
  | grep -o '"public_url":"https://[^"]*"' | head -1 \
  | sed 's/"public_url":"//;s/"//')

if [ -z "$NGROK_URL" ]; then
  echo ""
  echo "❌ ngrokの起動に失敗しました"
  echo "   1. https://dashboard.ngrok.com/get-started/your-authtoken"
  echo "   2. ! ngrok config add-authtoken <TOKEN>"
  exit 1
fi

# --- NEXTAUTH_URLをngrok URLに書き換えてサーバー再起動 ---
sed -i.bak "s|^NEXTAUTH_URL=.*|NEXTAUTH_URL=\"$NGROK_URL\"|" "$ENV_FILE"
cd "$PORTAL_DIR" && npm run build > /dev/null 2>&1

echo ""
echo "✅ 起動完了！"
echo "=================================="
echo ""
echo "  父親に送るURL:"
echo "  👉 $NGROK_URL"
echo ""
echo "  ログイン情報:"
echo "  メール:     admin@demo.local"
echo "  パスワード: admin1234"
echo ""
echo "  各アプリのログ:"
echo "  作業入力    → cat /tmp/app-work.log"
echo "  点検入力    → cat /tmp/app-inspection.log"
echo "  ダッシュボード → cat /tmp/app-dashboard.log"
echo "  事例生成    → cat /tmp/app-case.log"
echo ""
echo "  Ctrl+C で全プロセス終了"
echo "=================================="

# --- ポータル起動（フォアグラウンド）---
trap "echo '終了中...'; pkill -f 'next.*300[0-3]' 2>/dev/null; kill $NGROK_PID 2>/dev/null; sed -i.bak 's|^NEXTAUTH_URL=.*|NEXTAUTH_URL=\"http://localhost:$PORT\"|' $ENV_FILE; echo '終了しました'" EXIT

npm run start
