# 独自ドメイン移行手順（natadecoco.org）

## 現在の状態
- GitHub Pages URL: `https://shota1662.github.io/natadecoco/`
- 移行先ドメイン: `https://natadecoco.org`
- HTMLのcanonical・OGタグはすでに `natadecoco.org` で設定済み ✅
- CNAMEファイル: リポジトリに追加済み ✅

---

## 作業手順

### ① CNAMEファイルをGitHubにプッシュ（事前にClaude側で対応済み）

`CNAME` ファイルがリポジトリルートに作成済み。プッシュするだけでOK。

---

### ② ドメイン管理会社のDNS設定

ドメイン取得先（お名前.com / ムームードメイン / Cloudflare 等）の管理画面で以下を設定。

#### Aレコード（apex ドメイン `natadecoco.org` 用）

| ホスト名 | タイプ | 値 |
|---------|------|-----|
| @ | A | 185.199.108.153 |
| @ | A | 185.199.109.153 |
| @ | A | 185.199.110.153 |
| @ | A | 185.199.111.153 |

#### CNAMEレコード（www サブドメイン用）

| ホスト名 | タイプ | 値 |
|---------|------|-----|
| www | CNAME | shota1662.github.io |

---

### ③ GitHub Pages の設定

1. GitHubリポジトリ（`shota1662/natadecoco`）を開く
2. 「Settings」→「Pages」を開く
3. 「Custom domain」欄に `natadecoco.org` を入力して「Save」
4. DNS確認が完了したら「**Enforce HTTPS**」にチェックを入れる

---

### ④ 反映確認

- DNS反映には通常**数分〜最大48時間**かかる（多くの場合1時間以内）
- `https://natadecoco.org` にアクセスしてサイトが表示されることを確認
- HTTPSの鍵マークが表示されることを確認

---

## 注意事項

- DNS設定後すぐにはアクセスできない場合がある（伝播待ち）
- GitHub Pagesの「Enforce HTTPS」はDNS確認が完了するまでチェックできない
- 移行後も旧URL（`shota1662.github.io/natadecoco/`）は引き続きアクセス可能（リダイレクトされる）

---

## Google Apps Script との関係

GAS Web AppのURLは独自ドメインに依存していないため、**ドメイン移行後もフォームは問題なく動作する**。対応不要。
