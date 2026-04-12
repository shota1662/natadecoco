#!/usr/bin/env node
// natadecoco.org 週次レポート自動生成スクリプト
// 毎週月曜 GitHub Actions により自動実行

const { BetaAnalyticsDataClient } = require('@google-analytics/data');
const { google } = require('googleapis');
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

// ─── 設定 ────────────────────────────────────────────────
const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID || '431468420';
const SITE_URL = 'https://natadecoco.org/';
const CREDENTIALS = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);

// ─── 日付ヘルパー ─────────────────────────────────────────
function getDateRange(weeksAgo = 1) {
  const today = new Date();
  // 月曜始まりで「n週前」の月〜日を返す
  const dow = today.getDay() === 0 ? 7 : today.getDay(); // 1=Mon ... 7=Sun
  const monday = new Date(today);
  monday.setDate(today.getDate() - dow + 1 - (weeksAgo - 1) * 7 - 7);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = d => d.toISOString().slice(0, 10);
  return { startDate: fmt(monday), endDate: fmt(sunday) };
}

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}分${s}秒`;
}

function pct(val) {
  return (parseFloat(val) * 100).toFixed(1) + '%';
}

function diffLabel(curr, prev) {
  if (!prev || prev === 0) return '';
  const d = ((curr - prev) / prev * 100).toFixed(1);
  return parseFloat(d) >= 0 ? ` (+${d}%)` : ` (${d}%)`;
}

// ─── GA4 データ取得 ────────────────────────────────────────
async function getGA4Data() {
  const client = new BetaAnalyticsDataClient({ credentials: CREDENTIALS });
  const curr = getDateRange(1);
  const prev = getDateRange(2);

  console.log(`GA4 取得期間: ${curr.startDate} 〜 ${curr.endDate}`);

  // 概要指標（今週 vs 先週）
  const [overview] = await client.runReport({
    property: `properties/${GA4_PROPERTY_ID}`,
    dateRanges: [
      { ...curr, name: 'current' },
      { ...prev, name: 'previous' }
    ],
    metrics: [
      { name: 'screenPageViews' },
      { name: 'activeUsers' },
      { name: 'sessions' },
      { name: 'bounceRate' },
      { name: 'averageSessionDuration' }
    ],
    dimensions: [{ name: 'dateRange' }]
  });

  // 流入チャネル
  const [sources] = await client.runReport({
    property: `properties/${GA4_PROPERTY_ID}`,
    dateRanges: [curr],
    metrics: [{ name: 'sessions' }],
    dimensions: [{ name: 'sessionDefaultChannelGroup' }],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 8
  });

  // 人気ページ
  const [pages] = await client.runReport({
    property: `properties/${GA4_PROPERTY_ID}`,
    dateRanges: [curr],
    metrics: [
      { name: 'screenPageViews' },
      { name: 'averageSessionDuration' },
      { name: 'bounceRate' }
    ],
    dimensions: [{ name: 'pagePath' }],
    orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
    limit: 10
  });

  return { overview, sources, pages, curr, prev };
}

// ─── Search Console データ取得 ─────────────────────────────
async function getSearchConsoleData() {
  const auth = new google.auth.GoogleAuth({
    credentials: CREDENTIALS,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly']
  });
  const sc = google.searchconsole({ version: 'v1', auth });
  const curr = getDateRange(1);

  console.log(`Search Console 取得期間: ${curr.startDate} 〜 ${curr.endDate}`);

  const [overall, queries, scPages] = await Promise.all([
    sc.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: { startDate: curr.startDate, endDate: curr.endDate, dimensions: [] }
    }),
    sc.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: {
        startDate: curr.startDate,
        endDate: curr.endDate,
        dimensions: ['query'],
        rowLimit: 10,
        orderBy: [{ field: 'impressions', sortOrder: 'DESCENDING' }]
      }
    }),
    sc.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: {
        startDate: curr.startDate,
        endDate: curr.endDate,
        dimensions: ['page'],
        rowLimit: 10,
        orderBy: [{ field: 'impressions', sortOrder: 'DESCENDING' }]
      }
    })
  ]);

  return { overall, queries, scPages, curr };
}

// ─── Markdown レポート生成 ─────────────────────────────────
function buildMarkdown(ga4, sc) {
  const { overview, sources, pages, curr } = ga4;
  const { overall, queries, scPages } = sc;

  const rowCurr = overview.rows?.find(r => r.dimensionValues[0].value === 'current');
  const rowPrev = overview.rows?.find(r => r.dimensionValues[0].value === 'previous');
  const m = (row, idx) => parseFloat(row?.metricValues?.[idx]?.value || 0);

  const pvC = m(rowCurr, 0), pvP = m(rowPrev, 0);
  const usersC = m(rowCurr, 1), usersP = m(rowPrev, 1);
  const sessC = m(rowCurr, 2), sessP = m(rowPrev, 2);
  const bounceC = m(rowCurr, 3);
  const durC = m(rowCurr, 4);

  const scRow = overall.data?.rows?.[0];
  const scClicks = scRow?.clicks || 0;
  const scImpressions = scRow?.impressions || 0;
  const scCtr = scRow?.ctr || 0;
  const scPosition = scRow?.position || 0;

  const now = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });

  let md = `# 週次レポート：${curr.startDate} 〜 ${curr.endDate}\n\n`;
  md += `生成日時：${now}\n\n---\n\n`;

  // 1. アクセス概要
  md += `## 1. アクセス概要\n\n`;
  md += `| 指標 | 今週 | 先週比 |\n`;
  md += `|------|-----:|-------:|\n`;
  md += `| ページビュー | ${pvC.toLocaleString()} | ${diffLabel(pvC, pvP)} |\n`;
  md += `| ユーザー数 | ${usersC.toLocaleString()} | ${diffLabel(usersC, usersP)} |\n`;
  md += `| セッション数 | ${sessC.toLocaleString()} | ${diffLabel(sessC, sessP)} |\n`;
  md += `| 直帰率 | ${pct(bounceC)} | — |\n`;
  md += `| 平均セッション時間 | ${formatDuration(durC)} | — |\n\n`;

  // 2. 流入元
  md += `## 2. 流入元の内訳\n\n`;
  md += `| チャネル | セッション数 |\n`;
  md += `|----------|------------:|\n`;
  for (const row of sources.rows || []) {
    md += `| ${row.dimensionValues[0].value} | ${row.metricValues[0].value} |\n`;
  }
  md += `\n`;

  // 3. SEOパフォーマンス
  md += `## 3. SEO パフォーマンス（Search Console）\n\n`;
  md += `**サイト全体：** クリック ${scClicks} / 表示回数 ${scImpressions} / CTR ${pct(scCtr)} / 平均順位 ${parseFloat(scPosition).toFixed(1)}\n\n`;
  md += `### キーワード TOP10（表示回数順）\n\n`;
  md += `| キーワード | 表示回数 | クリック | CTR | 平均順位 |\n`;
  md += `|-----------|--------:|--------:|----:|--------:|\n`;
  for (const row of queries.data?.rows || []) {
    md += `| ${row.keys[0]} | ${row.impressions} | ${row.clicks} | ${pct(row.ctr)} | ${row.position.toFixed(1)} |\n`;
  }
  md += `\n`;

  // 4. 人気ページ
  md += `## 4. 人気ページ TOP10（PV順）\n\n`;
  md += `| ページ | PV | 平均滞在時間 | 直帰率 |\n`;
  md += `|--------|---:|:-----------:|-------:|\n`;
  for (const row of pages.rows || []) {
    md += `| ${row.dimensionValues[0].value} | ${row.metricValues[0].value} | ${formatDuration(parseFloat(row.metricValues[1].value))} | ${pct(row.metricValues[2].value)} |\n`;
  }
  md += `\n`;

  return md;
}

// ─── Claude API 改善提案生成 ──────────────────────────────
async function generateSuggestions(reportMd) {
  const client = new Anthropic();

  const message = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 1500,
    messages: [{
      role: 'user',
      content: `あなたはNPO法人ナタデコのWebサイト改善コンサルタントです。

## サイト概要
- URL: https://natadecoco.org
- 目的: 子どもたちに国際交流の原体験を届けるNPO法人
- ターゲット: 教育機関・保護者・大学生ボランティア・外国人・自治体

## 今週のアクセスデータ
${reportMd}

上記データを分析し、以下の形式でWebサイト改善提案を3〜5件生成してください。

### 提案N: [タイトル]
**優先度**: 高/中/低
**根拠**: （データに基づく理由）
**具体的な修正案**: （何をどう変えるか）
`
    }]
  });

  return message.content[0].text;
}

// ─── メイン ───────────────────────────────────────────────
async function main() {
  console.log('=== 週次レポート生成開始 ===');

  const [ga4Data, scData] = await Promise.all([
    getGA4Data(),
    getSearchConsoleData()
  ]);

  const reportBase = buildMarkdown(ga4Data, scData);

  console.log('Claude API で改善提案を生成中...');
  const suggestions = await generateSuggestions(reportBase);

  const fullReport = reportBase
    + `## 5. HP 改善提案（AI 生成）\n\n${suggestions}\n`;

  // ファイル保存
  const outputDir = path.join(__dirname, 'outputs');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const filename = `weekly-${ga4Data.curr.startDate}.md`;
  const filepath = path.join(outputDir, filename);
  fs.writeFileSync(filepath, fullReport, 'utf8');

  console.log(`\nレポート保存完了: report/outputs/${filename}`);
  console.log('\n' + fullReport);
}

main().catch(err => {
  console.error('エラー:', err.message);
  process.exit(1);
});
