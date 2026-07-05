'use client'

import { useActionState, useEffect, useRef } from 'react'
import { Turnstile } from '@marsidev/react-turnstile'
import { submitIntlVolunteer, type IntlSubmitState } from './actions'
import { INFO_SESSIONS } from './sessions'
import { PREFECTURES } from './prefectures'
import { DICT, PRIVACY_POLICY_URL, type Locale } from './i18n'

const labelStyle = {
  display: 'flex' as const,
  alignItems: 'center' as const,
  gap: '8px',
  fontSize: '14px',
  fontWeight: '700' as const,
  color: '#516881',
  marginBottom: '8px',
}

const selectArrow = {
  position: 'absolute' as const,
  right: '16px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: '#9fd9f6',
  fontSize: '18px',
  pointerEvents: 'none' as const,
}

export default function RegisterIntlForm({ locale }: { locale: Locale }) {
  const t = DICT[locale].form
  const [state, formAction, isPending] = useActionState<IntlSubmitState, FormData>(
    submitIntlVolunteer,
    null
  )
  const successRef = useRef<HTMLDivElement>(null)
  const today = new Date().toISOString().slice(0, 10)

  useEffect(() => {
    if (state?.ok) {
      successRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [state])

  if (state?.ok) {
    return (
      <div
        ref={successRef}
        style={{
          backgroundColor: '#f0fbfc',
          border: '2px solid #30b9bf',
          borderRadius: '16px',
          padding: '40px 28px',
          textAlign: 'center',
          maxWidth: '600px',
          margin: '0 auto',
        }}
      >
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎉</div>
        <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1a8a8f', margin: '0 0 12px' }}>
          {t.successTitle}
        </h3>
        <p style={{ fontSize: '15px', color: '#516881', margin: 0, lineHeight: 1.9 }}>
          {t.successBody}
        </p>
      </div>
    )
  }

  const errorText =
    state && !state.ok
      ? t.errors[state.errorCode]
      : null

  return (
    <div
      style={{
        backgroundColor: '#fff',
        borderRadius: '20px',
        boxShadow: '2px 2px 0 rgba(81,104,129,0.15)',
        width: '100%',
        maxWidth: '600px',
        margin: '0 auto',
        padding: '40px 32px',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#516881', margin: '0 0 8px' }}>
          {t.heading}
        </h3>
        <p style={{ fontSize: '14px', color: '#888', margin: 0, lineHeight: 1.8 }}>{t.intro}</p>
      </div>

      {errorText && (
        <div
          style={{
            backgroundColor: '#fff0f3',
            border: '2px solid #fe4c7f',
            borderRadius: '10px',
            padding: '12px 16px',
            marginBottom: '24px',
            fontSize: '14px',
            color: '#c0234a',
          }}
        >
          ⚠️ {errorText}
        </div>
      )}

      <form action={formAction}>
        {/* 登録時の言語を記録 */}
        <input type="hidden" name="locale" value={locale} />
        {/* ハニーポット（画面外・スクリーンリーダーからも隠す） */}
        <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', top: 'auto', width: '1px', height: '1px', overflow: 'hidden' }}>
          <label htmlFor="website">Leave this field empty</label>
          <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
        </div>

        {/* Full name */}
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="full_name" style={labelStyle}>
            {t.labels.full_name}
            <span className="badge-pink" style={{ fontSize: '10px', padding: '2px 7px' }}>{t.required}</span>
          </label>
          <input
            className="form-input"
            type="text"
            id="full_name"
            name="full_name"
            placeholder={t.placeholders.full_name}
            required
            disabled={isPending}
          />
        </div>

        {/* Date of birth */}
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="birth_date" style={labelStyle}>
            {t.labels.birth_date}
            <span className="badge-pink" style={{ fontSize: '10px', padding: '2px 7px' }}>{t.required}</span>
          </label>
          <input
            className="form-input"
            type="date"
            id="birth_date"
            name="birth_date"
            required
            max={today}
            disabled={isPending}
          />
        </div>

        {/* Email */}
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="email" style={labelStyle}>
            {t.labels.email}
            <span className="badge-pink" style={{ fontSize: '10px', padding: '2px 7px' }}>{t.required}</span>
          </label>
          <input
            className="form-input"
            type="email"
            id="email"
            name="email"
            placeholder={t.placeholders.email}
            required
            autoComplete="email"
            disabled={isPending}
          />
        </div>

        {/* Country or region of origin */}
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="origin_country" style={labelStyle}>
            {t.labels.origin_country}
            <span className="badge-pink" style={{ fontSize: '10px', padding: '2px 7px' }}>{t.required}</span>
          </label>
          <input
            className="form-input"
            type="text"
            id="origin_country"
            name="origin_country"
            placeholder={t.placeholders.origin_country}
            required
            disabled={isPending}
          />
        </div>

        {/* Where you live in Japan (prefecture) */}
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="residence_pref" style={labelStyle}>
            {t.labels.residence_pref}
            <span className="badge-pink" style={{ fontSize: '10px', padding: '2px 7px' }}>{t.required}</span>
          </label>
          <div style={{ position: 'relative' }}>
            <select
              className="form-select"
              id="residence_pref"
              name="residence_pref"
              style={{ paddingRight: '40px' }}
              required
              defaultValue=""
              disabled={isPending}
            >
              <option value="" disabled>{t.placeholders.select}</option>
              {PREFECTURES.map((p) => (
                <option key={p.ja} value={p.ja}>
                  {locale === 'en' ? `${p.en} (${p.ja})` : p.ja}
                </option>
              ))}
            </select>
            <span style={selectArrow}>▾</span>
          </div>
        </div>

        {/* Preferred info session */}
        <div style={{ marginBottom: '24px' }}>
          <label htmlFor="preferred_session" style={labelStyle}>
            {t.labels.preferred_session}
            <span className="badge-pink" style={{ fontSize: '10px', padding: '2px 7px' }}>{t.required}</span>
          </label>
          <div style={{ position: 'relative' }}>
            <select
              className="form-select"
              id="preferred_session"
              name="preferred_session"
              style={{ paddingRight: '40px' }}
              required
              defaultValue=""
              disabled={isPending}
            >
              <option value="" disabled>{t.placeholders.select}</option>
              {INFO_SESSIONS.map((s) => (
                <option key={s.id} value={s.id}>
                  {locale === 'en' ? s.label_en : s.label_ja}
                </option>
              ))}
            </select>
            <span style={selectArrow}>▾</span>
          </div>
        </div>

        {/* Privacy consent */}
        <div style={{ marginBottom: '28px' }}>
          <label
            htmlFor="privacy_consent"
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              fontSize: '14px',
              color: '#516881',
              cursor: 'pointer',
              lineHeight: 1.7,
            }}
          >
            <input
              type="checkbox"
              id="privacy_consent"
              name="privacy_consent"
              required
              disabled={isPending}
              style={{ width: '18px', height: '18px', marginTop: '2px', flexShrink: 0, accentColor: '#fe4c7f' }}
            />
            <span>
              {t.consentBefore}
              <a
                href={PRIVACY_POLICY_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#30b9bf', fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: '3px' }}
              >
                {t.consentLink}
              </a>
              {t.consentAfter}
              <span className="badge-pink" style={{ fontSize: '10px', padding: '2px 7px', marginLeft: '8px' }}>{t.required}</span>
            </span>
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <Turnstile siteKey="0x4AAAAAAC-gaHLqg87tdJH_" />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            type="submit"
            className="btn-coral"
            disabled={isPending}
            style={{
              padding: '16px 56px',
              height: 'auto',
              width: 'auto',
              fontSize: '15px',
              opacity: isPending ? 0.7 : 1,
              cursor: isPending ? 'not-allowed' : 'pointer',
            }}
          >
            {isPending ? t.sending : t.submit}
          </button>
        </div>
      </form>
    </div>
  )
}
