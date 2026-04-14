# Instagram週次レポート統合 作業記録

作業日: 2026-04-14

## 概要

natadecoco.org の週次レポート自動生成（`report/weekly-report.js`）に Instagram Graph API・Anthropic コスト取得・先週比表示を追加した。

---

## 実装内容

### 追加機能
- **Instagram Graph API** インサイト取得（ビュー数・リーチ・インタラクション・プロフィールアクセス）
- **先週比** を全Instagram指標に表示（前週データも並行取得）
- **今月のベスト投稿 TOP3**（リーチ数順）
- **Instagramトークン期限チェック・自動更新**（残り30日以下で更新）
- **Anthropic Usage & Cost API** で週次・月次コストをレポートに追記
- **Claude改善提案** を HP改善3件・Instagram改善3件に分離

### GitHub Secrets に追加した環境変数
| 変数名 | 内容 |
|---|---|
| `INSTAGRAM_ACCESS_TOKEN` | 長期アクセストークン（60日有効） |
| `INSTAGRAM_USER_ID` | `17841452112104640` |
| `META_APP_ID` | MetaアプリID |
| `META_APP_SECRET` | Metaアプリシークレット |
| `ANTHROPIC_ADMIN_API_KEY` | `sk-ant-admin...` から始まるAdmin APIキー |

---

## ハマったポイントと解決策

### Instagram API
- `impressions` メトリクスは廃止済み → `views` に変更
- `views` と `total_interactions` は `metric_type=total_value` が必須
- `reach`・`profile_views` も同様に `metric_type=total_value` で統一することで解決
- API バージョンは `v25.0` を使用
- `period=week` は非対応 → `period=day&since=UNIX&until=UNIX` で代替
- Instagram User ID（`17841452112104640`）は Instagram アプリ設定から直接取得

### GitHub Actions プッシュ競合
- `npm install` で `package-lock.json` 等が変更され `git rebase` が失敗し続けた
- **解決策**: コミット前に `git fetch origin main && git reset --hard origin/main` でリモートと完全同期してからレポートファイルだけを追加・コミット・プッシュ

```yaml
git fetch origin main
git reset --hard origin/main
git add report/outputs/
git diff --staged --quiet || git commit -m "週次レポート自動生成: $(date +'%Y-%m-%d')"
git push
```

### Gmailの102KB表示制限（メール途中で切れる）
- `text:` と `html:` 両方送信していたためMIMEサイズが約2倍になっていた
- Markdownテーブルを `\n`→`<br>` で変換していたため非効率だった
- **解決策**: `text:` 版を廃止、MarkdownテーブルをHTMLテーブルに変換する `markdownToHtml()` 関数を実装

### その他
- `max_tokens`: 2000 → 4000（提案が途中で切れる問題を解消）
- 組織名「ナタデコ」→「ナタデココ」に統一

---

## 主要ファイル

- `report/weekly-report.js` — メインスクリプト
- `.github/workflows/weekly-report.yml` — 毎週月曜 UTC 0:00（JST 9:00）自動実行
- `report/outputs/weekly-YYYY-MM-DD.md` — 生成されたレポート

## リポジトリ

`shota1662/natadecoco`
