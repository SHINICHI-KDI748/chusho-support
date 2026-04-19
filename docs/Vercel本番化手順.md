# Vercel本番化手順

## 所要時間: 約20〜30分

---

## Step 1: Neon（無料PostgreSQL）をセットアップ

1. https://neon.tech にアクセス → GitHubでサインアップ（無料）
2. 「New Project」→ プロジェクト名を入力（例: `gyomu-app`）
3. Region: **Asia Pacific (Singapore)** を選択
4. 作成後、「Connection Details」タブを開く
5. 「Connection string」をコピー（`postgresql://...` から始まる文字列）

---

## Step 2: GitHubにプッシュ

```bash
# リポジトリルートで実行
git add apps/portal
git commit -m "add portal with PWA"
git push origin main
```

---

## Step 3: Vercelにデプロイ

```bash
cd apps/portal
! npx vercel
```

対話形式で以下を答える:
- `Set up and deploy?` → **Y**
- `Which scope?` → 自分のアカウント
- `Link to existing project?` → **N**
- `Project name?` → `gyomu-app-portal`（何でもOK）
- `In which directory is your code located?` → **./（そのまま Enter）**

---

## Step 4: Vercelダッシュボードで環境変数を設定

https://vercel.com → プロジェクト → **Settings** → **Environment Variables**

以下を1つずつ追加:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Neonのconnection string |
| `DIRECT_URL` | 同じconnection string |
| `NEXTAUTH_SECRET` | `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` の出力 |
| `NEXTAUTH_URL` | `https://gyomu-app-portal.vercel.app`（デプロイ後に確定したURL） |
| `NEXT_PUBLIC_APP_WORK_URL` | `http://localhost:3000`（後で更新） |
| `NEXT_PUBLIC_APP_INSPECTION_URL` | `http://localhost:3001`（後で更新） |
| `NEXT_PUBLIC_APP_DASHBOARD_URL` | `http://localhost:3002`（後で更新） |
| `NEXT_PUBLIC_APP_CASE_URL` | `http://localhost:3003`（後で更新） |

---

## Step 5: 本番DBの初期化

```bash
# apps/portal で実行
# .envのDATABASE_URLを一時的にNeonのURLに変更してから:
DATABASE_URL="postgresql://..." npm run db:push
DATABASE_URL="postgresql://..." npm run db:seed
```

または Vercelの「Functions」タブからコンソールで実行。

---

## Step 6: 再デプロイ

```bash
! npx vercel --prod
```

---

## Step 7: 動作確認

1. `https://your-project.vercel.app/login` を開く
2. `admin@demo.local` / `admin1234` でログイン
3. ホーム画面の4アプリカードが表示されることを確認
4. Chromeで「インストール」バナーが出ることを確認（PWA動作確認）

---

## カスタムドメインを付ける場合（任意）

1. Vercel → Settings → Domains → `Add Domain`
2. `gyomu.your-company.com` など入力
3. DNSにCNAMEレコードを追加（Vercelが手順を表示）

---

## トラブルシューティング

| エラー | 対処 |
|--------|------|
| `DATABASE_URL is not set` | Vercel環境変数を確認 |
| ログインできない | `NEXTAUTH_URL` がデプロイURLと一致しているか確認 |
| `prisma generate failed` | `scripts/prepare-vercel.sh` が実行されているか確認 |
| PWAインストールできない | HTTPSになっているか確認（Vercelは自動でHTTPS）|
