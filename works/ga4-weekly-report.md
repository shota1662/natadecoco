# GA4設置＋週次レポート自動生成

## 概要
- GA4タグをサイト全ページに設置
- GA4・Search Console・Claude APIを使った週次レポートを毎週月曜に自動生成・メール送信

---

## 設定情報
- GA4 測定ID: `G-423JJRMF0E`
- GA4 プロパティID: `431468420`
- サービスアカウントJSONキー: `natadecoco-report-9e7aef916e66.json`（CODINGフォルダ・gitignore済み）
- レポート送受信メール: `shota1662@gmail.com`

---

## 完了済み作業

### GA4 タグ設置
- 全37HTMLファイルの `</head>` 直前に gtag.js スニペットを挿入
- 測定ID: `G-423JJRMF0E`

### Google Search Console
- `https://natadecoco.org` のプロパティは設置前から存在

### GCPサービスアカウント
- プロジェクト: `natadecoco-report`
- サービスアカウント名: `natadecoco-weekly-report`
- 有効化API: Google Analytics Data API / Google Search Console API
- GA4「プロパティのアクセス管理」に閲覧者として追加済み
- Search Console「ユーザーと権限」に制限付きで追加済み

### 週次レポートスクリプト
- ファイル: `report/weekly-report.js`
- 依存パッケージ: `report/package.json`
- 取得データ:
  - GA4: PV・ユーザー数・セッション・直帰率・平均滞在時間・流入チャネル・人気ページ
  - Search Console: 全体指標・キーワードTOP10
- Claude API (`claude-opus-4-6`) で改善提案を3〜5件生成
- レポートは `report/outputs/weekly-YYYY-MM-DD.md` に保存
- nodemailerでGmailに送信

### GitHub Actions
- ファイル: `.github/workflows/weekly-report.yml`
- スケジュール: 毎週月曜 9:00 JST（UTC 0:00）
- 手動実行: Actions タブ → Run workflow

---

## GitHub Secrets（設定済み）
| Secret名 | 内容 |
|---|---|
| `GOOGLE_CREDENTIALS_JSON` | サービスアカウントJSONキーの中身 |
| `ANTHROPIC_API_KEY` | Anthropic APIキー |
| `GMAIL_USER` | `shota1662@gmail.com` |
| `GMAIL_APP_PASSWORD` | Gmailアプリパスワード（16文字） |

---

## 週次レポートを更新するとき

### レポートの構成を変えたい場合
`report/weekly-report.js` の `buildMarkdown()` 関数を編集する。

### GA4の取得指標を追加したい場合
`getGA4Data()` 内の `metrics` 配列に指標名を追加する。
参考: https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema

### Claude APIへの指示を変えたい場合
`generateSuggestions()` 内のプロンプト文を編集する。

### メール送信先を変えたい場合
GitHub Secrets の `GMAIL_USER` を更新する（送信元も兼ねているため）。
送信先だけ別アドレスにしたい場合は `weekly-report.js` の `sendEmail()` 内の `to:` を変更する。

### 自動実行スケジュールを変えたい場合
`.github/workflows/weekly-report.yml` の `cron:` を編集する。
例: 毎週月曜 8:00 JST → `0 23 * * 0`（日曜UTC 23:00）

---

## 生成レポートの確認場所
https://github.com/shota1662/natadecoco/tree/main/report/outputs
