#!/usr/bin/env node
// natadecoco.org 週次レポート自動生成スクリプト
// 毎週月曜 GitHub Actions により自動実行

const { BetaAnalyticsDataClient } = require('@google-analytics/data');
const { google } = require('googleapis');
const Anthropic = require('@anthropic-ai/sdk');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const https = require('https');
const sodium = require('libsodium-wrappers');

// ─── 設定 ────────────────────────────────────────────────
const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID || '431468420';
const SITE_URL = 'https://natadecoco.org/';
const CREDENTIALS = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);

const INSTAGRAM_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
const INSTAGRAM_USER_ID = process.env.INSTAGRAM_USER_ID;
const META_APP_ID = process.env.META_APP_ID;
const META_APP_SECRET = process.env.META_APP_SECRET;
const ANTHROPIC_ADMIN_API_KEY = process.env.ANTHROPIC_ADMIN_API_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY || 'shota1662/natadecoco';

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

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`JSON parse error: ${data}`)); }
      });
    }).on('error', reject);
  });
}

// ─── GA4 データ取得 ────────────────────────────────────────
async function getGA4Data() {
  const client = new BetaAnalyticsDataClient({ credentials: CREDENTIALS });
  const curr = getDateRange(1);
  const prev = getDateRange(2);

  console.log(`GA4 取得期間: ${curr.startDate} 〜 ${curr.endDate}`);

  const OVERVIEW_METRICS = [
    { name: 'screenPageViews' },
    { name: 'activeUsers' },
    { name: 'sessions' },
    { name: 'bounceRate' },
    { name: 'averageSessionDuration' }
  ];

  // 概要指標（今週・先週を別々に取得）
  const [[overviewCurr], [overviewPrev]] = await Promise.all([
    client.runReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      dateRanges: [curr],
      metrics: OVERVIEW_METRICS
    }),
    client.runReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      dateRanges: [prev],
      metrics: OVERVIEW_METRICS
    })
  ]);

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

  return { overviewCurr, overviewPrev, sources, pages, curr, prev };
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

// ─── GitHub Secret 更新 ───────────────────────────────────
async function updateGitHubSecret(secretName, secretValue) {
  if (!GITHUB_TOKEN) {
    console.warn('GITHUB_TOKEN 未設定。GitHub Secret の自動更新をスキップします。');
    return false;
  }

  await sodium.ready;

  const [owner, repo] = GITHUB_REPOSITORY.split('/');

  // リポジトリの公開鍵を取得
  const pubKeyRes = await new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${owner}/${repo}/actions/secrets/public-key`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'natadecoco-weekly-report'
      }
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`公開鍵取得 JSON parse error: ${data}`)); }
      });
    });
    req.on('error', reject);
    req.end();
  });

  if (!pubKeyRes.key || !pubKeyRes.key_id) {
    throw new Error(`公開鍵の取得に失敗: ${JSON.stringify(pubKeyRes)}`);
  }

  // 新しいトークン値を公開鍵で暗号化
  const keyBytes = sodium.from_base64(pubKeyRes.key, sodium.base64_variants.ORIGINAL);
  const valueBytes = Buffer.from(secretValue);
  const encryptedBytes = sodium.crypto_box_seal(valueBytes, keyBytes);
  const encryptedValue = sodium.to_base64(encryptedBytes, sodium.base64_variants.ORIGINAL);

  // GitHub Secret を上書き
  await new Promise((resolve, reject) => {
    const body = JSON.stringify({ encrypted_value: encryptedValue, key_id: pubKeyRes.key_id });
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${owner}/${repo}/actions/secrets/${secretName}`,
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'natadecoco-weekly-report',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        // 201 Created or 204 No Content が成功
        if (res.statusCode === 201 || res.statusCode === 204) {
          resolve();
        } else {
          reject(new Error(`Secret 更新失敗 (HTTP ${res.statusCode}): ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });

  return true;
}

// ─── Instagram トークン更新 ────────────────────────────────
async function refreshInstagramToken(currentToken) {
  if (!META_APP_ID || !META_APP_SECRET) {
    console.warn('META_APP_ID / META_APP_SECRET 未設定。トークン自動更新をスキップします。');
    return null;
  }

  console.log('Instagram アクセストークンを更新中...');

  const url = `https://graph.facebook.com/v25.0/oauth/access_token`
    + `?grant_type=fb_exchange_token`
    + `&client_id=${META_APP_ID}`
    + `&client_secret=${META_APP_SECRET}`
    + `&fb_exchange_token=${currentToken}`;

  const res = await httpsGet(url);

  if (!res.access_token) {
    throw new Error(`トークン更新APIエラー: ${JSON.stringify(res)}`);
  }

  console.log('トークン更新成功。GitHub Secret を書き換えます...');
  await updateGitHubSecret('INSTAGRAM_ACCESS_TOKEN', res.access_token);
  console.log('GitHub Secret (INSTAGRAM_ACCESS_TOKEN) を更新しました。');

  return res.access_token;
}

// ─── Instagram データ取得 ──────────────────────────────────
async function getInstagramData() {
  if (!INSTAGRAM_ACCESS_TOKEN || !INSTAGRAM_USER_ID) {
    console.log('Instagram 環境変数未設定。スキップします。');
    return null;
  }

  const base = `https://graph.facebook.com/v25.0`;
  const token = `access_token=${INSTAGRAM_ACCESS_TOKEN}`;

  console.log('Instagram API からインサイトを取得中...');

  // 今週・先々週の期間をUNIX timestampに変換
  const curr = getDateRange(1);
  const prevWeek = getDateRange(2);
  const since = Math.floor(new Date(curr.startDate + 'T00:00:00Z').getTime() / 1000);
  const until = Math.floor(new Date(curr.endDate + 'T23:59:59Z').getTime() / 1000);
  const prevSince = Math.floor(new Date(prevWeek.startDate + 'T00:00:00Z').getTime() / 1000);
  const prevUntil = Math.floor(new Date(prevWeek.endDate + 'T23:59:59Z').getTime() / 1000);

  console.log(`Instagram 取得期間(今週): ${curr.startDate} 〜 ${curr.endDate}`);
  console.log(`Instagram 取得期間(先週): ${prevWeek.startDate} 〜 ${prevWeek.endDate}`);

  const metricsParam = 'metric=views,total_interactions,reach,profile_views&metric_type=total_value&period=day';
  // 全指標を metric_type=total_value で一括取得（今週・先週）
  const insightsUrl     = `${base}/${INSTAGRAM_USER_ID}/insights?${metricsParam}&since=${since}&until=${until}&${token}`;
  const insightsPrevUrl = `${base}/${INSTAGRAM_USER_ID}/insights?${metricsParam}&since=${prevSince}&until=${prevUntil}&${token}`;
  // follower_count は period=day のみ対応のため個別取得
  const followerUrl     = `${base}/${INSTAGRAM_USER_ID}/insights?metric=follower_count&period=day&since=${since}&until=${until}&${token}`;
  const followerPrevUrl = `${base}/${INSTAGRAM_USER_ID}/insights?metric=follower_count&period=day&since=${prevSince}&until=${prevUntil}&${token}`;
  // 投稿一覧（今月分・インサイト付き）
  const mediaUrl = `${base}/${INSTAGRAM_USER_ID}/media?fields=id,caption,timestamp,like_count,comments_count,insights.metric(views,reach,saved)&limit=50&${token}`;
  // トークン期限チェック
  const debugUrl = `${base}/debug_token?input_token=${INSTAGRAM_ACCESS_TOKEN}&access_token=${META_APP_ID}|${META_APP_SECRET}`;

  const [insightsRes, insightsPrevRes, followerRes, followerPrevRes, mediaRes, debugRes] = await Promise.all([
    httpsGet(insightsUrl).catch(e => { console.warn('insights取得失敗:', e.message); return null; }),
    httpsGet(insightsPrevUrl).catch(e => { console.warn('insights(先週)取得失敗:', e.message); return null; }),
    httpsGet(followerUrl).catch(e => { console.warn('follower_count取得失敗:', e.message); return null; }),
    httpsGet(followerPrevUrl).catch(e => { console.warn('follower_count(先週)取得失敗:', e.message); return null; }),
    httpsGet(mediaUrl).catch(e => { console.warn('media取得失敗:', e.message); return null; }),
    (META_APP_ID && META_APP_SECRET)
      ? httpsGet(debugUrl).catch(e => { console.warn('token debug取得失敗:', e.message); return null; })
      : Promise.resolve(null)
  ]);

  // インサイト値をオブジェクトにパース（metric_type=total_value 形式）
  const parseInsights = (res) => {
    const out = { views: 0, total_interactions: 0, reach: 0, profile_views: 0 };
    if (res?.error) {
      console.error('Instagram insights APIエラー:', JSON.stringify(res.error));
      return out;
    }
    if (res?.data) {
      for (const metric of res.data) {
        const val = metric.total_value?.value ?? 0;
        if (metric.name in out) out[metric.name] = val;
      }
    }
    return out;
  };

  const curr_ins = parseInsights(insightsRes);
  const prev_ins = parseInsights(insightsPrevRes);

  console.log('今週インサイト:', JSON.stringify(curr_ins));
  console.log('先週インサイト:', JSON.stringify(prev_ins));

  // フォロワー数（今週末と先週末の値を比較）
  const getLastFollower = (res) => {
    const values = res?.data?.[0]?.values || [];
    return values.length > 0 ? (values[values.length - 1]?.value ?? null) : null;
  };
  const followerCount = getLastFollower(followerRes);
  const followerPrevCount = getLastFollower(followerPrevRes);
  const followerDiff = (followerCount !== null && followerPrevCount !== null)
    ? followerCount - followerPrevCount : null;

  // 投稿TOP3（今月分・リーチ順）
  const reportNow = new Date();
  let topPosts = [];
  if (mediaRes?.data) {
    const monthStart = new Date(reportNow.getFullYear(), reportNow.getMonth(), 1);
    const thisMonthPosts = mediaRes.data.filter(post =>
      new Date(post.timestamp) >= monthStart
    );
    const targetPosts = thisMonthPosts.length > 0 ? thisMonthPosts : mediaRes.data.slice(0, 10);
    const posts = targetPosts.map(post => {
      const insData = post.insights?.data || [];
      const postReach = insData.find(d => d.name === 'reach')?.values?.[0]?.value ?? 0;
      const saved     = insData.find(d => d.name === 'saved')?.values?.[0]?.value ?? 0;
      return {
        caption: (post.caption || '（キャプションなし）').slice(0, 40),
        timestamp: post.timestamp,
        likeCount: post.like_count ?? 0,
        commentsCount: post.comments_count ?? 0,
        saved,
        reach: postReach
      };
    });
    topPosts = posts.sort((a, b) => b.reach - a.reach).slice(0, 3);
    if (thisMonthPosts.length === 0) console.log('今月の投稿なし。直近10件から集計します。');
  }

  // トークン期限チェック・自動更新
  let tokenDaysLeft = null;
  let tokenWarning = false;
  let tokenRefreshed = false;
  if (debugRes?.data?.expires_at) {
    const expiresAt = new Date(debugRes.data.expires_at * 1000);
    const nowTs = new Date();
    tokenDaysLeft = Math.floor((expiresAt - nowTs) / (1000 * 60 * 60 * 24));
    tokenWarning = tokenDaysLeft <= 30;
    if (tokenWarning) {
      console.warn(`⚠️ Instagram アクセストークンの有効期限まで ${tokenDaysLeft} 日です。自動更新を試みます...`);
      try {
        const newToken = await refreshInstagramToken(INSTAGRAM_ACCESS_TOKEN);
        if (newToken) {
          tokenRefreshed = true;
          tokenDaysLeft = 60;
          tokenWarning = false;
          console.log('トークン自動更新完了。次回以降は新トークンで実行されます。');
        }
      } catch (e) {
        console.error('トークン自動更新に失敗しました:', e.message);
      }
    }
  }

  return {
    followerCount,
    followerDiff,
    impressions:        curr_ins.views,
    impressionsPrev:    prev_ins.views,
    totalInteractions:      curr_ins.total_interactions,
    totalInteractionsPrev:  prev_ins.total_interactions,
    reach:        curr_ins.reach,
    reachPrev:    prev_ins.reach,
    profileViews:      curr_ins.profile_views,
    profileViewsPrev:  prev_ins.profile_views,
    topPosts,
    tokenDaysLeft,
    tokenWarning,
    tokenRefreshed
  };
}

// ─── Anthropic APIコスト取得 ───────────────────────────────
async function getAnthropicCosts() {
  if (!ANTHROPIC_ADMIN_API_KEY) {
    console.log('ANTHROPIC_ADMIN_API_KEY 未設定。コスト取得をスキップします。');
    return null;
  }

  console.log('Anthropic APIコストを取得中...');

  const now = new Date();
  // 今週月曜〜今日
  const dow = now.getDay() === 0 ? 7 : now.getDay();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - dow + 1);
  weekStart.setHours(0, 0, 0, 0);
  // 今月1日〜今日
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const toISO = d => d.toISOString().replace(/\.\d{3}Z$/, 'Z');

  function fetchCost(startingAt, endingAt) {
    return new Promise((resolve, reject) => {
      const params = new URLSearchParams({ starting_at: startingAt, ending_at: endingAt });
      const options = {
        hostname: 'api.anthropic.com',
        path: `/v1/organizations/cost_report?${params}`,
        method: 'GET',
        headers: {
          'x-api-key': ANTHROPIC_ADMIN_API_KEY,
          'anthropic-version': '2023-06-01'
        }
      };
      const req = https.request(options, res => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
          try { resolve(JSON.parse(data)); }
          catch (e) { reject(new Error(`JSON parse error: ${data}`)); }
        });
      });
      req.on('error', reject);
      req.end();
    });
  }

  const [weeklyCost, monthlyCost] = await Promise.all([
    fetchCost(toISO(weekStart), toISO(now)).catch(e => { console.warn('週次コスト取得失敗:', e.message); return null; }),
    fetchCost(toISO(monthStart), toISO(now)).catch(e => { console.warn('月次コスト取得失敗:', e.message); return null; })
  ]);

  // レスポンス形式: { total_cost: number, currency: 'USD', ... } を想定
  const weeklyUSD = weeklyCost?.total_cost ?? weeklyCost?.data?.reduce?.((s, r) => s + (r.cost ?? 0), 0) ?? null;
  const monthlyUSD = monthlyCost?.total_cost ?? monthlyCost?.data?.reduce?.((s, r) => s + (r.cost ?? 0), 0) ?? null;

  return { weeklyUSD, monthlyUSD, weekStart: toISO(weekStart).slice(0, 10), monthStart: toISO(monthStart).slice(0, 10) };
}

// ─── Markdown レポート生成 ─────────────────────────────────
function buildMarkdown(ga4, sc, instagram, costs) {
  const { overviewCurr, overviewPrev, sources, pages, curr } = ga4;
  const { overall, queries, scPages } = sc;

  const rowCurr = overviewCurr.rows?.[0];
  const rowPrev = overviewPrev.rows?.[0];
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

  // 5. Instagram セクション
  if (instagram) {
    md += `## 5. Instagram インサイト\n\n`;

    if (instagram.tokenRefreshed) {
      md += `> ✅ **アクセストークンを自動更新しました（新しい有効期限: 60日後）。**\n\n`;
    } else if (instagram.tokenWarning && instagram.tokenDaysLeft !== null) {
      md += `> ⚠️ **アクセストークンの有効期限まで ${instagram.tokenDaysLeft} 日です。自動更新に失敗したため手動で更新してください。**\n\n`;
    }

    const igDiff = (curr, prev) => {
      if (!prev || prev === 0) return '';
      const d = ((curr - prev) / prev * 100).toFixed(1);
      return parseFloat(d) >= 0 ? ` (+${d}%)` : ` (${d}%)`;
    };

    md += `| 指標 | 今週 | 先週比 |\n`;
    md += `|------|-----:|-------:|\n`;
    if (instagram.followerCount !== null) {
      const diffStr = instagram.followerDiff !== null
        ? (instagram.followerDiff >= 0 ? `+${instagram.followerDiff}人` : `${instagram.followerDiff}人`)
        : '—';
      md += `| フォロワー数 | ${instagram.followerCount.toLocaleString()}人 | ${diffStr} |\n`;
    }
    md += `| リーチ | ${instagram.reach.toLocaleString()} | ${igDiff(instagram.reach, instagram.reachPrev)} |\n`;
    md += `| ビュー数 | ${instagram.impressions.toLocaleString()} | ${igDiff(instagram.impressions, instagram.impressionsPrev)} |\n`;
    md += `| 合計インタラクション | ${instagram.totalInteractions.toLocaleString()} | ${igDiff(instagram.totalInteractions, instagram.totalInteractionsPrev)} |\n`;
    md += `| プロフィールアクセス | ${instagram.profileViews.toLocaleString()} | ${igDiff(instagram.profileViews, instagram.profileViewsPrev)} |\n\n`;

    if (instagram.topPosts.length > 0) {
      md += `### 今月のベスト投稿 TOP${instagram.topPosts.length}（リーチ数順）\n\n`;
      md += `| 投稿 | リーチ | いいね | 保存 | コメント |\n`;
      md += `|------|------:|------:|----:|---------:|\n`;
      for (const post of instagram.topPosts) {
        md += `| ${post.caption} | ${post.reach} | ${post.likeCount} | ${post.saved} | ${post.commentsCount} |\n`;
      }
      md += `\n`;
    }
  }

  return md;
}

// ─── Claude API 改善提案生成 ──────────────────────────────
async function generateSuggestions(reportMd, instagram) {
  const client = new Anthropic();

  const instagramSection = instagram
    ? `\n## Instagramインサイト
- フォロワー数: ${instagram.followerCount !== null ? instagram.followerCount.toLocaleString() + '人' + (instagram.followerDiff !== null ? (instagram.followerDiff >= 0 ? ` (+${instagram.followerDiff}人)` : ` (${instagram.followerDiff}人)`) : '') : '取得不可'}
- リーチ: ${instagram.reach.toLocaleString()}（先週: ${instagram.reachPrev.toLocaleString()}）
- ビュー数: ${instagram.impressions.toLocaleString()}（先週: ${instagram.impressionsPrev.toLocaleString()}）
- 合計インタラクション: ${instagram.totalInteractions.toLocaleString()}（先週: ${instagram.totalInteractionsPrev.toLocaleString()}）
${instagram.topPosts.length > 0 ? `- ベスト投稿TOP3（リーチ順）:\n${instagram.topPosts.map((p, i) => `  ${i + 1}. 「${p.caption}」リーチ${p.reach} いいね${p.likeCount} 保存${p.saved}`).join('\n')}` : ''}`
    : '';

  const message = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: `あなたはNPO法人ナタデコのWebサイト・SNS改善コンサルタントです。

## サイト概要
- URL: https://natadecoco.org
- 目的: 子どもたちに国際交流の原体験を届けるNPO法人
- ターゲット: 教育機関・保護者・大学生ボランティア・外国人・自治体

## 今週のアクセスデータ
${reportMd}${instagramSection}

上記データを分析し、以下の形式で改善提案をそれぞれ正確に3件ずつ生成してください。

---

## 【HP改善提案】

### 提案1: [タイトル]
**優先度**: 高/中/低
**根拠**: （データに基づく理由）
**具体的な修正案**: （何をどう変えるか）

### 提案2: [タイトル]
**優先度**: 高/中/低
**根拠**: （データに基づく理由）
**具体的な修正案**: （何をどう変えるか）

### 提案3: [タイトル]
**優先度**: 高/中/低
**根拠**: （データに基づく理由）
**具体的な修正案**: （何をどう変えるか）

---

${instagram ? `## 【Instagram改善提案】

### 提案1: [タイトル]
**優先度**: 高/中/低
**根拠**: （データに基づく理由）
**具体的なアクション**: （何をどうするか）

### 提案2: [タイトル]
**優先度**: 高/中/低
**根拠**: （データに基づく理由）
**具体的なアクション**: （何をどうするか）

### 提案3: [タイトル]
**優先度**: 高/中/低
**根拠**: （データに基づく理由）
**具体的なアクション**: （何をどうするか）` : ''}
`
    }]
  });

  return message.content[0].text;
}

// ─── メール送信 ───────────────────────────────────────────
async function sendEmail(subject, markdownBody) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    console.log('メール設定なし（GMAIL_USER / GMAIL_APP_PASSWORD 未設定）。スキップします。');
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass }
  });

  // MarkdownをシンプルなHTMLに変換（テーブル・見出し対応）
  const html = markdownBody
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^---$/gm, '<hr>')
    .replace(/\n/g, '<br>');

  await transporter.sendMail({
    from: `"ナタデコ週次レポート" <${user}>`,
    to: user,
    subject,
    text: markdownBody,
    html: `<div style="font-family:sans-serif;max-width:800px;margin:auto">${html}</div>`
  });

  console.log(`メール送信完了: ${user}`);
}

// ─── メイン ───────────────────────────────────────────────
async function main() {
  console.log('=== 週次レポート生成開始 ===');

  const [ga4Data, scData, instagram, costs] = await Promise.all([
    getGA4Data(),
    getSearchConsoleData(),
    getInstagramData(),
    getAnthropicCosts()
  ]);

  const reportBase = buildMarkdown(ga4Data, scData, instagram, costs);

  console.log('Claude API で改善提案を生成中...');
  const suggestions = await generateSuggestions(reportBase, instagram);

  // セクション番号をInstagramの有無で調整
  const suggestionSection = instagram ? 6 : 5;
  const costSection = suggestionSection + 1;

  let fullReport = reportBase
    + `## ${suggestionSection}. AI改善提案\n\n${suggestions}\n\n`;

  // Anthropic APIコストセクション
  if (costs) {
    fullReport += `## ${costSection}. Anthropic API 利用コスト\n\n`;
    fullReport += `| 期間 | コスト |\n`;
    fullReport += `|------|-------:|\n`;
    fullReport += `| 今週（${costs.weekStart}〜） | ${costs.weeklyUSD !== null ? `$${costs.weeklyUSD.toFixed(4)}` : '取得失敗'} |\n`;
    fullReport += `| 今月累計（${costs.monthStart}〜） | ${costs.monthlyUSD !== null ? `$${costs.monthlyUSD.toFixed(4)}` : '取得失敗'} |\n`;
    fullReport += `\n> 残高確認: https://console.anthropic.com/settings/billing\n\n`;
  }

  // トークン更新結果をレポート末尾にも追記
  if (instagram?.tokenRefreshed) {
    fullReport += `---\n\n✅ **Instagram アクセストークンを自動更新しました（GitHub Secret: INSTAGRAM_ACCESS_TOKEN を更新済み）。**\n`;
  } else if (instagram?.tokenWarning && instagram?.tokenDaysLeft !== null) {
    fullReport += `---\n\n⚠️ **Instagram アクセストークンの有効期限まで ${instagram.tokenDaysLeft} 日です。自動更新に失敗したため手動で更新してください。**\n`;
  }

  // ファイル保存
  const outputDir = path.join(__dirname, 'outputs');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const filename = `weekly-${ga4Data.curr.startDate}.md`;
  const filepath = path.join(outputDir, filename);
  fs.writeFileSync(filepath, fullReport, 'utf8');

  console.log(`\nレポート保存完了: report/outputs/${filename}`);

  // メール送信
  const subject = `【ナタデコ週次レポート】${ga4Data.curr.startDate} 〜 ${ga4Data.curr.endDate}`;
  await sendEmail(subject, fullReport);
}

main().catch(err => {
  console.error('エラー:', err.message);
  process.exit(1);
});
