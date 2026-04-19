# Vercel本番化手順（最新版）

## 所要時間: 約40〜60分（初回）

> この手順は実際にデプロイしたときの経験をもとに更新されています。  
> よくあるミスは [トラブルシューティング.md](./トラブルシューティング.md) を参照してください。

---

## 全体の構成

このシステムは **5つのアプリ** を別々に Vercel にデプロイします：

| アプリ名 | フォルダ | Vercel プロジェクト名（例） |
|---------|---------|--------------------------|
| ポータル（認証・入口） | `apps/portal` | `gyomu-portal` |
| 作業入力アプリ | `apps/excel-reduction` | `gyomu-work` |
| 点検入力アプリ | `apps/inspection` | `gyomu-inspection` |
| ダッシュボード | `apps/dashboard` | `gyomu-dashboard` |
| 事例管理アプリ | `apps/poc-case-generator` | `gyomu-case` |

---

## Step 0: 前提確認

```bash
# GitHub にプッシュ済みか確認
git status
git log --oneline -5
```

`.gitignore` に以下が入っていることを確認:
```
node_modules/
.next/
*.db
.env
```

---

## Step 1: Neon（無料PostgreSQL）のセットアップ

> ポータルのみ PostgreSQL が必要です（ログイン情報・監査ログを保存するため）。  
> 他のアプリは JSON ファイルベースなので不要です。

1. [https://neon.tech](https://neon.tech) にアクセス → GitHub でサインアップ（無料）
2. 「New Project」→ プロジェクト名を入力（例: `gyomu-app`）
3. Region: **Asia Pacific (Tokyo)** または **Singapore** を選択
4. 作成後、「Connection Details」タブを開く
5. 「Connection string」をコピー（`postgresql://...` から始まる文字列）

---

## Step 2: 4つのサブアプリをデプロイ

> **ポータルより先に** サブアプリをデプロイしてください。  
> ポータルの環境変数にサブアプリの URL を設定する必要があるためです。

### 2-1. 作業入力アプリ（excel-reduction）

```bash
cd apps/excel-reduction
npx vercel --prod
```

対話形式の質問：
- `Project name?` → `gyomu-work`（任意）
- その他はすべてデフォルト（Enter）

デプロイ後、表示された URL をメモ（例: `https://gyomu-work.vercel.app`）

**Vercel ダッシュボードで環境変数を追加（この2つは不要、追加変数なし）**

---

### 2-2. 点検入力アプリ（inspection）

```bash
cd apps/inspection
npx vercel --prod
```

デプロイ後 URL をメモ（例: `https://gyomu-inspection.vercel.app`）

**注意**: このアプリはデータを JSON ファイルに書き込みます。  
Vercel のファイルシステムは**読み取り専用**のため、本番では**データが保存されません**。  
将来的には Neon に移行することを推奨します（現時点はデモ用途として許容）。

---

### 2-3. ダッシュボード

```bash
cd apps/dashboard
npx vercel --prod
```

デプロイ後 URL をメモ（例: `https://gyomu-dashboard.vercel.app`）

**Vercel ダッシュボードで環境変数を追加**：

| Key | Value |
|-----|-------|
| `APP_WORK_URL` | 作業入力アプリの URL（例: `https://gyomu-work.vercel.app`） |
| `APP_INSPECTION_URL` | 点検入力アプリの URL（例: `https://gyomu-inspection.vercel.app`） |

設定後、再デプロイが必要：
```bash
npx vercel --prod
```

---

### 2-4. 事例管理アプリ（poc-case-generator）

```bash
cd apps/poc-case-generator
npx vercel --prod
```

デプロイ後 URL をメモ（例: `https://gyomu-case.vercel.app`）

**注意**: このアプリは SQLite を使いますが、Vercel では `/tmp` フォルダに保存されます。  
`/tmp` はサーバーが再起動すると消えるため、**データは永続しません**（デモ用途として許容）。

---

## Step 3: ポータルをデプロイ

### 3-1. 環境変数の準備

Vercel ダッシュボード → gyomu-portal → Settings → Environment Variables に以下を追加：

| Key | Value | 説明 |
|-----|-------|------|
| `DATABASE_URL` | Neon の connection string | ログイン情報用DB |
| `DIRECT_URL` | 同じ connection string | Prisma 用（同じ値でOK） |
| `NEXTAUTH_SECRET` | ランダム文字列（下記コマンドで生成） | セッション暗号化キー |
| `NEXTAUTH_URL` | `https://gyomu-portal.vercel.app`（デプロイ後に確定） | ポータルのURL |
| `INTERNAL_APP_WORK_URL` | `https://gyomu-work.vercel.app` | 作業入力アプリURL（リバースプロキシ用） |
| `INTERNAL_APP_INSPECTION_URL` | `https://gyomu-inspection.vercel.app` | 点検アプリURL |
| `INTERNAL_APP_DASHBOARD_URL` | `https://gyomu-dashboard.vercel.app` | ダッシュボードURL |
| `INTERNAL_APP_CASE_URL` | `https://gyomu-case.vercel.app` | 事例管理アプリURL |

> **重要**: `INTERNAL_APP_*_URL` にはドメインだけを入れる（末尾に `/apps/work` などは不要）。  
> ポータルのリバースプロキシが自動で `/apps/work/:path*` を付け足します。

`NEXTAUTH_SECRET` の生成方法：
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 3-2. デプロイ実行

```bash
cd apps/portal
npx vercel --prod
```

---

## Step 4: データベース初期化（ユーザー作成）

> **これをやらないとログインできません。** デプロイ直後は DB が空です。

```bash
cd apps/portal

# Neon の URL で直接シードを実行
DATABASE_URL="postgresql://..." npx tsx prisma/seed.ts
```

または：
```bash
DATABASE_URL="postgresql://..." npm run db:push   # テーブル作成
DATABASE_URL="postgresql://..." npm run db:seed   # ユーザー投入
```

作成されるユーザー：
| メール | パスワード | 役割 |
|--------|----------|------|
| `admin@demo.local` | `admin1234` | 管理者 |
| `office@demo.local` | `office1234` | 事務 |
| `field@demo.local` | `field1234` | 現場 |

---

## Step 5: 動作確認

1. `https://gyomu-portal.vercel.app/login` を開く
2. `admin@demo.local` / `admin1234` でログイン
3. ホーム画面で4つのアプリカードが表示されることを確認
4. 各アプリカードをクリックして開けることを確認
5. Chrome で「インストール」バナーが出ることを確認（PWA）

---

## Step 6: カスタムドメインを付ける場合（任意）

1. Vercel → Settings → Domains → 「Add Domain」
2. `gyomu.your-company.com` など入力
3. DNS に CNAME レコードを追加（Vercel が手順を表示）

---

## よくあるミスと対処（実際に発生したもの）

| 症状 | 原因 | 対処 |
|------|------|------|
| `Invalid region selector: "nrt1"` | 古いリージョンコード | `vercel.json` の regions を `"hnd1"` に変更 |
| ログインできない（Vercel） | DB が空 | `DATABASE_URL="..." npx tsx prisma/seed.ts` を実行 |
| ログインできない（ローカル） | `.env` の URL が Vercel URL になっている | `.env` の `NEXTAUTH_URL` を `http://localhost:3010` に戻す |
| アプリが開かない | `INTERNAL_APP_*_URL` が未設定でlocalhost向きになっている | portalのVercel環境変数に `INTERNAL_APP_*_URL` を設定して再デプロイ |
| サブアプリを直接開くと404 | basePath設定のため `/` にはページがない | 正しいURL: `gyomu-work.vercel.app/apps/work` など（末尾に basePath を付ける） |
| ダッシュボードが空 | `APP_WORK_URL` / `APP_INSPECTION_URL` が未設定 | ダッシュボードの Vercel 環境変数に追加して再デプロイ |
| `prisma generate failed` | `scripts/prepare-vercel.sh` のエラー | スクリプト内のコマンドを確認 |
| GitHub push できない | node_modules が含まれている | `.gitignore` 確認 → `git rm -r --cached node_modules` |

---

## ローカル開発に戻るとき（重要）

**`.env` は常にローカル用の値にしておく。**

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3010"
NEXTAUTH_SECRET="（ローカル用の値）"
```

Vercel 本番の設定は Vercel ダッシュボードで管理し、`.env` には書かない。
