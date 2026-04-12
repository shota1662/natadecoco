# フォーム自動返信メール設定メモ

## 経緯

- 各イベント申し込みフォーム・お問い合わせフォームはもともと **Formspree**（無料プラン）を使用
- 申込者への自動返信メール機能はFormspreeの有料プラン（月$30〜）が必要
- コストを抑えるため **Google Apps Script（GAS）Web App** + **Gmail** に移行することにした
- フォームのデザインはそのまま維持し、送信先URLのみ変更

---

## 構成

### フォームファイル（HTMLは変更なし、fetch先のURLのみ変更）

| ファイル | 内容 |
|---------|------|
| `event-form.html` | イベント統合申し込みフォーム（ドロップダウンでイベント選択） |
| `contact.html` | お問い合わせフォーム |

※ 旧フォーム（`event-form-20260322.html` 〜 `event-form-20260530.html`）は統合により `event-form.html` に一本化済み

### GAS Web App URL

```
https://script.google.com/macros/s/AKfycbwMcxbx7N8vb_5j_5rkssjm9bxRlJLQwYHUGEHxVgI3Cd3ZwNH0KBQLbwMIR-lWNoVa-g/exec
```

### スクリプトファイル

`C:/Users/shota/CODING/gas-form-handler.js`

このファイルをApps Scriptエディタに貼り付けて使用する。

---

## スプレッドシート構成

| スプレッドシート | 用途 |
|----------------|------|
| ナタデデコ イベント申し込み管理 | イベントフォームの記録 |
| ナタデデコ お問い合わせ管理 | 問い合わせフォームの記録 |

スプレッドシートIDはGASスクリプト内の以下の変数に設定済み：
```javascript
var EVENT_SHEET_ID = "...";
var CONTACT_SHEET_ID = "...";
```

---

## GASスクリプトの動作概要

1. HTMLフォームからJSON形式でPOSTリクエストを受信
2. `formType` フィールドでフォームの種類を判別
3. 対応するスプレッドシートに記録
4. 申込者に自動返信メール送信（Gmail経由）
5. 運営メールアドレスに通知メール送信

### formTypeとイベント名の対応

| formType | イベント名 |
|---------|---------|
| `camp-20260530` | 国際交流キャンプ（5/30〜31）※仮申し込み |
| `class-20260718` | 子どもたちの文化交流教室（7/18）※6/18募集開始 |
| `contact` | お問い合わせ |

---

## 今後の運用メモ

### 新しいイベントを追加するとき

**① `event-form.html` のドロップダウンに1行追加**
```html
<option value="class-20261015">新しいイベント（10/15）</option>
```

公開日を指定して自動表示する場合：
```html
<option value="class-20261015" data-open="2026-09-01">新しいイベント（10/15）</option>
```
※ JS側の自動表示処理は次回追加予定

**② `gas-form-handler.js` の `getFormLabel()` に1行追加**
```javascript
if (formType === "class-20261015") return "新しいイベント(10/15)";
```

**③ GASを再デプロイ**
- Apps Scriptエディタ →「デプロイ」→「デプロイを管理」
- 鉛筆アイコン（編集）→ バージョンを「新バージョン」に変更 →「デプロイ」
- URLは変わらないのでHTMLの修正は不要

### メール文面を変更するとき

`gas-form-handler.js` の `sendAutoReply()` 内を編集 → 再デプロイ

### 運営メールアドレスを変更するとき

`gas-form-handler.js` の `ADMIN_EMAIL` を変更 → 再デプロイ

---

## 注意事項

- GASを変更した場合は**必ず新バージョンとして再デプロイ**しないと変更が反映されない
- Gmailの無料枠は**1日100通**まで（イベント申込の件数であれば問題なし）
- デプロイ時に「このアプリはGoogleで確認されていません」という警告が出るが、自作スクリプトのため問題なし
