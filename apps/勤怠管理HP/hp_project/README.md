# 町工場向け 簡易勤怠入力システム 導入支援HP

## 概要

町工場・小規模工場向けの勤怠管理システム導入支援サービスの営業用1ページHP。

- React + Vite + Tailwind CSS (v4)
- PC表示を主軸、スマホ対応あり

---

## 起動方法

```bash
# hp-project ディレクトリに移動
cd hp-project

# 依存関係をインストール（初回のみ）
npm install

# 開発サーバー起動
npm run dev
# → http://localhost:5173 で確認

# 本番ビルド
npm run build
# → dist/ フォルダに出力される
```

---

## 本番化するための差し替え箇所

### 1. フォームURL（最重要）

**ファイル:** `src/components/Contact.jsx` (3〜4行目)

```js
const FORM_URL = "https://forms.example.com/contact"; // ← Google Forms / Formrun 等のURLに変更
const CONTACT_EMAIL = "info@example.com"; // ← 実際のメールアドレスに変更
```

### 2. 会社名・住所

**`src/components/Nav.jsx` (2行目)**
```js
const COMPANY_NAME = "株式会社 ○○○○"; // ← 会社名に変更
```

**`src/components/Footer.jsx` (3〜5行目)**
```js
const COMPANY_NAME = "株式会社 ○○○○";
const COMPANY_ADDRESS = "〒000-0000 ○○県○○市 ○○ 0-0-0";
const PRIVACY_POLICY_URL = "/privacy";
```

### 3. スクリーンショット（デモ画面）

**`src/components/Demo.jsx`** — 各画面の `imagePath` を差し替え

```js
const DEMO_SCREENS = [
  { imagePath: null },  // ← "/images/demo-employee.png" に変更
  { imagePath: null },  // ← "/images/demo-admin-daily.png" に変更
  { imagePath: null },  // ← "/images/demo-monthly.png" に変更
  { imagePath: null },  // ← "/images/demo-alert.png" に変更
];
```

手順: `public/images/` フォルダを作成し、スクリーンショットを配置するだけ。

### 4. HeroのUIモック差し替え

**`src/components/Hero.jsx` (5行目)**
```js
const HERO_MOCK_IMAGE = null; // ← "/images/mock-hero.png" に変更
```
→ 設定すると内蔵モックの代わりに実画像が表示される。

### 5. 価格

**`src/components/Pricing.jsx` (3〜5行目)**
```js
const PRICE_MIN = "100,000";
const PRICE_MAX = "200,000";
const PRICE_NOTE = "初期導入費（税別）。従業員数・必要機能により変動します。";
```

### 6. ページのメタ情報

**`index.html`**
```html
<title>ここを変更</title>
<meta name="description" content="ここを変更" />
```

---

## ファイル構成

```
hp-project/
├── src/
│   ├── components/
│   │   ├── Nav.jsx         # ナビゲーション
│   │   ├── Hero.jsx        # ファーストビュー + UIモック
│   │   ├── Problem.jsx     # 課題提起（黒背景）
│   │   ├── Features.jsx    # できること（A〜Eグリッド）
│   │   ├── Demo.jsx        # デモ画面紹介（交互レイアウト）
│   │   ├── Process.jsx     # 導入の流れ（I〜IVステップ）
│   │   ├── Pricing.jsx     # 価格
│   │   ├── FAQ.jsx         # よくある質問（アコーディオン）
│   │   ├── Contact.jsx     # 最終CTA ← FORM_URLはここ
│   │   └── Footer.jsx      # フッター
│   ├── App.jsx             # セクション統合
│   ├── index.css           # グローバルスタイル・カラー変数
│   └── main.jsx            # エントリーポイント
└── index.html
```

---

## デザイン意図

### Saint Laurent 的要素の抽出箇所
- ナビゲーション: 0.5px ヘアライン、タイトな文字組み
- HeroとContact: 黒・白・余白だけで構成、装飾なし
- CTAボタン: 塗り↔アウトライン反転のホバー効果
- 全体: 余白を意図的に広くとった「静けさ」

### Stefan Cooke 的要素の抽出箇所
- Features: A〜E の大文字アルファベットを構造要素として使用したグリッドレイアウト
- Process: ローマ数字ボックス + 上部水平ライン
- Demo: 大きな番号と説明の左右交互配置
- 全体: 0.5px のヘアライン線で「線の美しさ」を実現

### BtoBの読みやすさを優先した箇所
- 本文 13.5〜15px / 行間 1.85〜1.9（日本語に適した余白）
- 見出しの後に必ず説明文を配置（情報の孤立なし）
- 業界語・誇大表現なし、平易な日本語コピー
- CTA を Hero / Problem / Pricing / Contact の4箇所に配置
