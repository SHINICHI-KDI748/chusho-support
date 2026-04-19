# 業務アプリ ポータル

中小企業向け業務統合アプリの共通ポータルです。
4つの業務アプリへのシングルサインオン・ロール制御・監査ログ・PWA対応を提供します。

---

## 構成

```
apps/portal/        ← このアプリ（共通ポータル）
apps/excel-reduction/  ← 作業入力
apps/inspection/       ← 点検入力
apps/dashboard/        ← ダッシュボード
apps/poc-case-generator/ ← 事例生成
```

---

## クイックスタート（開発環境）

### 1. 必要なもの
- Node.js 20以上
- npm 10以上

### 2. セットアップ

```bash
cd apps/portal
npm install
cp .env.example .env
# .env の NEXTAUTH_SECRET を書き換える（下記参照）
```

`.env` のシークレット生成:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 3. DB初期化

```bash
npm run db:generate   # Prismaクライアント生成
npm run db:push       # SQLiteにスキーマ適用
npm run db:seed       # デモユーザー作成
```

### 4. 起動

```bash
npm run dev
# http://localhost:3010 で起動
```

### デモアカウント

| メール             | パスワード   | 権限   |
|------------------|-------------|--------|
| admin@demo.local | admin1234   | 管理者 |
| office@demo.local| office1234  | 事務   |
| field@demo.local | field1234   | 現場   |

---

## ロール設計

| ロール  | 作業入力 | 点検入力 | ダッシュボード | 事例生成 | ユーザー管理 | 監査ログ |
|--------|---------|---------|-------------|---------|------------|--------|
| admin  | ✅      | ✅      | ✅          | ✅      | ✅         | ✅     |
| office | ✅      | ✅      | ✅          | ✅      | ❌         | ❌     |
| field  | ✅      | ✅      | ❌          | ❌      | ❌         | ❌     |
| viewer | ❌      | ❌      | ✅          | ❌      | ❌         | ❌     |

---

## PWAインストール（Windows）

1. Chrome または Edge でポータルURLにアクセス
2. アドレスバー右の「インストール」ボタン（⊕マーク）をクリック
3. 「インストール」を選択 → デスクトップ・スタートメニューにアイコンが追加される

---

## 本番デプロイ手順

### A. Vercel（最も簡単）

```bash
# Vercel CLIインストール
npm i -g vercel

cd apps/portal
vercel

# 環境変数をVercelダッシュボードで設定:
# DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, NEXT_PUBLIC_APP_*_URL
```

データベースはVercel Postgres または Supabase を使用（SQLite → PostgreSQL移行は後述）。

### B. Railway / Render / Fly.io

1. PostgreSQL DBをプロビジョニング
2. `DATABASE_URL` を `postgresql://...` に変更
3. `prisma/schema.prisma` の `provider = "sqlite"` を `"postgresql"` に変更
4. `npm run db:push` でスキーマ適用
5. Gitプッシュで自動デプロイ

### C. VPS (Ubuntu + Nginx)

```bash
# ビルド
npm run build

# .env を本番値に書き換え
# プロセスマネージャーで起動
pm2 start npm --name "portal" -- start

# Nginx リバースプロキシ設定
# proxy_pass http://localhost:3010;
```

---

## SQLite → PostgreSQL 移行

1. `prisma/schema.prisma` の `provider` を `"postgresql"` に変更
2. `.env` の `DATABASE_URL` を接続文字列に変更
3. `npm run db:generate && npm run db:push`
4. 既存データがある場合: `npx prisma migrate dev` でマイグレーション作成

---

## DBバックアップ

### SQLite（開発・PoC）

```bash
# バックアップ
cp apps/portal/prisma/dev.db backups/dev_$(date +%Y%m%d_%H%M%S).db

# 定期バックアップ（cron）
# 0 2 * * * cp /path/to/dev.db /path/to/backups/dev_$(date +\%Y\%m\%d).db
```

### PostgreSQL（本番）

```bash
# バックアップ
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# 復元
psql $DATABASE_URL < backup_20240101.sql
```

### 添付ファイル（将来対応）

添付ファイルが発生した場合、ストレージは S3 / Cloudflare R2 を推奨。
バックアップは `aws s3 sync s3://bucket/ ./backup/` で同期。

---

## 復旧手順

1. コードを Git から取得: `git clone ...`
2. `.env` を復元
3. DBを復元（上記参照）
4. `npm install && npm run db:generate && npm run build`
5. 起動確認

---

## 新しいアプリの追加方法

`apps/portal/lib/apps-config.ts` に1エントリ追加するだけ:

```ts
{
  id: 'new-app',
  name: '新アプリ',
  description: '説明文',
  icon: '🆕',
  color: 'blue',
  href: process.env.NEXT_PUBLIC_APP_NEW_URL ?? 'http://localhost:3004',
  allowedRoles: ['admin', 'office'],
}
```

---

## 新規会社への複製導入手順

1. リポジトリをクローン
2. `prisma/seed.ts` の会社名・スラッグ・初期ユーザーを変更
3. `.env` に新会社用の値を設定
4. `npm run db:push && npm run db:seed`
5. デプロイ（URLは会社ごとに別ドメイン or サブドメイン推奨）

---

## 未実装項目（PoC段階）

- MFA（多要素認証）の実際の発行・検証
- パスワードリセットメール送信
- ユーザー新規作成UI（現在はAPI直接 or seed）
- サブドメイン自動振り分け（tenant slug対応）
- アプリ間のセッション共有（現状は別ログイン）
- 添付ファイルのバックアップ自動化
- モバイルプッシュ通知
- アプリ内チャット・通知センター

---

## 将来拡張項目

- アプリ5・6の追加（apps-config.ts に追記のみ）
- SAML/OIDC による外部IdP連携（Google Workspace等）
- MFA実装（TOTP: Google Authenticator対応）
- マルチテナントサブドメイン（company.gyomu-app.jp）
- メール通知（申請承認フロー）
- モバイルアプリ（React Native / Capacitor）
- データ分析ダッシュボードの強化
