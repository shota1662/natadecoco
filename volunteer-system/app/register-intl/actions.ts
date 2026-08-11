'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { Resend } from 'resend'
import { prefectureLabel } from './prefectures'
import type { Locale } from './i18n'

const resend = new Resend(process.env.RESEND_API_KEY)

// エラーはコード（文字列キー）で返し、クライアント側で locale に応じて文言化する
export type IntlSubmitState =
  | { ok: true }
  | { ok: false; errorCode: 'turnstile' | 'validation' | 'email' | 'server' }
  | null

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function submitIntlVolunteer(
  _prev: IntlSubmitState,
  formData: FormData
): Promise<IntlSubmitState> {
  // --- ハニーポット（bot が埋める隠しフィールド）。値があれば静かに成功扱い ---
  if ((formData.get('website') as string)?.trim()) {
    return { ok: true }
  }

  // --- Turnstile 検証（既存 /register を踏襲）---
  const turnstileToken = formData.get('cf-turnstile-response') as string
  if (!turnstileToken) {
    return { ok: false, errorCode: 'turnstile' }
  }
  const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      secret: process.env.TURNSTILE_SECRET_KEY!,
      response: turnstileToken,
    }),
  })
  const verifyData = await verifyRes.json()
  if (!verifyData.success) {
    return { ok: false, errorCode: 'turnstile' }
  }

  // --- 入力の取り出し ---
  const fullName = (formData.get('full_name') as string)?.trim() || ''
  const birthDate = (formData.get('birth_date') as string)?.trim() || ''
  const email = (formData.get('email') as string)?.trim() || ''
  const originCountry = (formData.get('origin_country') as string)?.trim() || ''
  const residencePref = (formData.get('residence_pref') as string)?.trim() || ''
  const question = (formData.get('question') as string)?.trim() || ''
  const privacyConsent = formData.get('privacy_consent') === 'on'
  const localeRaw = (formData.get('locale') as string) || 'en'
  const locale: Locale = localeRaw === 'ja' ? 'ja' : 'en'

  // --- サーバー側バリデーション（question 以外はすべて必須）---
  if (
    !fullName ||
    !birthDate ||
    !email ||
    !originCountry ||
    !residencePref ||
    !privacyConsent
  ) {
    return { ok: false, errorCode: 'validation' }
  }
  if (!EMAIL_RE.test(email)) {
    return { ok: false, errorCode: 'email' }
  }

  // --- Supabase へ保存（Service Role で RLS をバイパス。公開INSERTポリシーは開けない）---
  const admin = createAdminClient()
  if (!admin) {
    console.error('[submitIntlVolunteer] Admin client not configured')
    return { ok: false, errorCode: 'server' }
  }

  const { error: insertError } = await admin.from('intl_volunteers').insert({
    full_name: fullName,
    birth_date: birthDate,
    email,
    origin_country: originCountry,
    residence_pref: residencePref,
    question: question || null,
    privacy_consent: privacyConsent,
    locale,
  })

  if (insertError) {
    console.error('[submitIntlVolunteer] Insert error:', insertError.message)
    return { ok: false, errorCode: 'server' }
  }

  // --- メール送信（失敗しても登録自体は成功として扱う）---
  try {
    await sendEmails({
      fullName,
      birthDate,
      email,
      originCountry,
      residencePref,
      question,
      locale,
    })
  } catch (e) {
    console.error('[submitIntlVolunteer] Email send error:', e)
  }

  return { ok: true }
}

async function sendEmails(v: {
  fullName: string
  birthDate: string
  email: string
  originCountry: string
  residencePref: string
  question: string
  locale: Locale
}) {
  const prefJa = prefectureLabel(v.residencePref, 'ja')

  // ① 運営（info@natadecoco.org）への通知 — 既存 /register と同様
  await resend.emails.send({
    from: 'ボランティアシステム <info@natadecoco.org>',
    to: 'info@natadecoco.org',
    subject: `【新規 外国人サポーター登録】${v.fullName}さんが登録しました`,
    html: `
      <h2>新規 外国人サポーター登録のお知らせ</h2>
      <table style="border-collapse:collapse;width:100%;max-width:600px">
        <tr><td style="padding:8px;border:1px solid #ddd;background:#f5f5f5;width:160px"><strong>氏名</strong></td><td style="padding:8px;border:1px solid #ddd">${v.fullName}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;background:#f5f5f5"><strong>生年月日</strong></td><td style="padding:8px;border:1px solid #ddd">${v.birthDate}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;background:#f5f5f5"><strong>メール</strong></td><td style="padding:8px;border:1px solid #ddd">${v.email}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;background:#f5f5f5"><strong>出身の国・地域</strong></td><td style="padding:8px;border:1px solid #ddd">${v.originCountry}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;background:#f5f5f5"><strong>住んでいる都道府県</strong></td><td style="padding:8px;border:1px solid #ddd">${prefJa}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;background:#f5f5f5"><strong>質問</strong></td><td style="padding:8px;border:1px solid #ddd;white-space:pre-wrap">${v.question || '（なし）'}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;background:#f5f5f5"><strong>表示言語</strong></td><td style="padding:8px;border:1px solid #ddd">${v.locale}</td></tr>
      </table>
      <p style="margin-top:16px"><a href="https://volunteer.natadecoco.org/admin/intl-volunteers">管理者画面で確認する</a></p>
    `,
  })

  // ② 申込者本人への確認メール（登録時の locale で出し分け）
  const prefForUser = prefectureLabel(v.residencePref, v.locale)

  if (v.locale === 'ja') {
    await resend.emails.send({
      from: 'ナタデココ <info@natadecoco.org>',
      to: v.email,
      subject: '【ナタデココ】登録 ありがとうございます',
      html: `
        <p>${v.fullName} さん</p>
        <p>サポーター登録を うけとりました。ありがとうございます。</p>
        <p>毎月の 説明会の 日にちを、あとで メールで お知らせします。しばらく お待ちください。</p>
        <p>住んでいる ところ：${prefForUser}</p>
        <br>
        <p>NPOナタデココ<br>https://natadecoco.org</p>
      `,
    })
  } else {
    await resend.emails.send({
      from: 'Nata de Coco <info@natadecoco.org>',
      to: v.email,
      subject: 'Thank you for signing up — Nata de Coco',
      html: `
        <p>Hi ${v.fullName},</p>
        <p>Thank you for signing up as an International Supporter. We've received your registration.</p>
        <p>We'll email you the dates for our monthly info session soon. Please hold tight!</p>
        <p>Where you live: ${prefForUser}</p>
        <br>
        <p>Nata de Coco (NPO)<br>https://natadecoco.org</p>
      `,
    })
  }
}
