# ngrokデモ手順（今すぐ父親に見せる）

## 所要時間: 約5分

---

## Step 1: ngrokアカウント登録（初回のみ）

1. https://ngrok.com にアクセス → 「Sign up」（無料）
2. GitHubまたはメールで登録
3. ダッシュボードの「Your Authtoken」ページを開く
4. トークンをコピーして以下を実行:

```bash
! ngrok config add-authtoken ここにトークンを貼る付ける
```

---

## Step 2: デモ起動

```bash
cd apps/portal
! bash scripts/demo-ngrok.sh
```

しばらく待つと以下が表示される:

```
📋 デモURL情報
==================================

  公開URL（父親に共有するURL）:
  👉 https://xxxx-xxx-xxx.ngrok-free.app

  ログイン情報:
  メール:     admin@demo.local
  パスワード: admin1234

==================================
  Ctrl+C で終了します
```

---

## Step 3: 父親に渡す

表示されたURLをLINEやメールで送る。
スマホ・PCどちらでもそのURLを開けば使える。

**Windows PCに「インストール」させる手順:**
1. ChromeかEdgeでURLを開く
2. 数秒後に右下に「アプリとして使えます」バナーが出る
3. 「インストール」を押す
4. デスクトップにアイコンが追加される

---

## 注意

- `Ctrl+C` でスクリプトを止めると**URLが無効になる**
- 無料プランはURLがセッションごとに変わる（固定URLは有料プランの月$8〜）
- 本番化したい場合は `docs/Vercel本番化手順.md` を参照
