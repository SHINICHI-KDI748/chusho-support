# chusho-support — 中小企業向け業務アプリ統合基盤

## 概要

4つの業務アプリを1つのポータルにまとめた中小企業向け業務システムです。
URLだけで使え、Windowsではデスクトップアプリとして（PWA）インストールできます。

## アプリ構成

| アプリ | ポート | 説明 |
|--------|--------|------|
| **portal** | 3010 | 共通ポータル（ログイン・認証・ロール制御） |
| excel-reduction | 3000 | 作業入力（日報・実績） |
| inspection | 3001 | 点検入力（設備・車両） |
| dashboard | 3002 | ダッシュボード（集計・グラフ） |
| poc-case-generator | 3003 | 事例生成（AI） |

## クイックスタート

```bash
# ポータルを起動
cd apps/portal
npm install
cp .env.example .env        # NEXTAUTH_SECRET を変更すること
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
# → http://localhost:3010
```

## ドキュメント

| 資料 | 場所 |
|------|------|
| ポータル詳細README | `apps/portal/README.md` |
| 初期設定手順 | `docs/初期設定手順.md` |
| 顧客引き渡し手順 | `docs/顧客引き渡し手順.md` |
| 父親向け簡易マニュアル | `docs/父親向け簡易マニュアル.md` |
| 管理者向け運用手順 | `docs/管理者向け運用手順.md` |
| ロール設計表 | `docs/ロール設計表.md` |
| 未実装・将来拡張 | `docs/今回未実装項目と将来拡張.md` |

## デモアカウント（seed後）

| メール | パスワード | 権限 |
|--------|-----------|------|
| admin@demo.local | admin1234 | 管理者 |
| office@demo.local | office1234 | 事務 |
| field@demo.local | field1234 | 現場 |
