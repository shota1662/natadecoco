'use client'

import { useEffect, useState } from 'react'
import RegisterIntlForm from './RegisterIntlForm'
import { DICT, type Locale } from './i18n'
import { IMAGES, type ImageAsset } from './images'

/**
 * 画像プレースホルダー枠。
 * aspect-ratio を指定してレイアウトシフトを防ぐ。実素材が用意できたら
 * images.ts の src を差し替え、ここを next/image に置き換える（段階2）。
 */
function ImagePlaceholder({ asset, locale }: { asset: ImageAsset; locale: Locale }) {
  const alt = locale === 'en' ? asset.alt_en : asset.alt_ja
  return (
    <div
      role={alt ? 'img' : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
      style={{
        aspectRatio: asset.aspect,
        width: '100%',
        borderRadius: '14px',
        background: 'repeating-linear-gradient(135deg, #eaf4fb 0 12px, #dceaf5 12px 24px)',
        border: '2px dashed #b7d6ea',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#8aa7bd',
        fontSize: '12px',
        fontWeight: 700,
        textAlign: 'center',
        padding: '8px',
      }}
    >
      <span>🖼 {asset.key}</span>
    </div>
  )
}

const maxW = '1000px'

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontSize: '26px',
        fontWeight: 700,
        color: '#516881',
        textAlign: 'center',
        margin: '0 0 12px',
        lineHeight: 1.5,
      }}
    >
      {children}
    </h2>
  )
}

export default function RegisterIntlContent() {
  // デフォルトは English。マウント後にブラウザ言語が日本語なら ja に切替。
  const [locale, setLocale] = useState<Locale>('en')

  useEffect(() => {
    // マウント後にブラウザ言語を一度だけ判定して同期する。
    // 初期描画はサーバー・クライアントとも 'en' で一致させ、
    // ここで日本語ブラウザのみ 'ja' に切り替える（ハイドレーション不一致を回避）。
    if (typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('ja')) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- 外部システム(navigator)との一度きりの同期
      setLocale('ja')
    }
  }, [])

  const d = DICT[locale]

  return (
    <div style={{ backgroundColor: '#fff' }}>
      {/* 言語トグル（スティッキー） */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '8px',
          padding: '10px 16px',
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(6px)',
          borderBottom: '1px solid #eef3f7',
        }}
      >
        {(['en', 'ja'] as Locale[]).map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLocale(l)}
            aria-pressed={locale === l}
            style={{
              padding: '6px 14px',
              borderRadius: '18px',
              border: `2px solid ${locale === l ? '#30b9bf' : '#dde5ee'}`,
              backgroundColor: locale === l ? '#30b9bf' : '#fff',
              color: locale === l ? '#fff' : '#516881',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {DICT[l].langName}
          </button>
        ))}
      </div>

      {/* ============ 1. Hero ============ */}
      <section style={{ position: 'relative' }}>
        <ImagePlaceholder asset={IMAGES.hero} locale={locale} />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(0deg, rgba(81,104,129,0.55), rgba(81,104,129,0.25))',
            borderRadius: '14px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '24px',
          }}
        >
          <h1 style={{ fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, color: '#fff', margin: '0 0 16px', lineHeight: 1.4, textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
            {d.hero.title}
          </h1>
          <p style={{ fontSize: 'clamp(13px, 2.4vw, 17px)', color: '#fff', maxWidth: '640px', margin: '0 0 24px', lineHeight: 1.8, textShadow: '0 1px 6px rgba(0,0,0,0.35)' }}>
            {d.hero.subtitle}
          </p>
          <a href="#signup" className="btn-coral" style={{ padding: '16px 40px', height: 'auto', width: 'auto', fontSize: '15px' }}>
            {d.hero.button}
          </a>
        </div>
      </section>

      {/* ============ 2. Why it's easy to join ============ */}
      <section style={{ backgroundColor: '#f7fbfe', padding: '56px 20px' }}>
        <div style={{ maxWidth: maxW, margin: '0 auto' }}>
          <SectionHeading>{d.why.heading}</SectionHeading>
          <p style={{ textAlign: 'center', color: '#888', fontSize: '15px', margin: '0 0 40px', lineHeight: 1.8 }}>
            {d.why.intro}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
            {d.why.items.map((item, i) => (
              <div key={i} className="card" style={{ padding: '24px', textAlign: 'center' }}>
                <div style={{ maxWidth: '120px', margin: '0 auto 16px' }}>
                  <ImagePlaceholder asset={IMAGES[`why${i + 1}`]} locale={locale} />
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#fe4c7f', margin: '0 0 10px' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '14px', color: '#516881', margin: 0, lineHeight: 1.9 }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 3. This is for you if… ============ */}
      <section style={{ backgroundColor: '#fff', padding: '56px 20px' }}>
        <div style={{ maxWidth: maxW, margin: '0 auto' }}>
          <SectionHeading>{d.forYou.heading}</SectionHeading>
          <p style={{ textAlign: 'center', color: '#888', fontSize: '15px', margin: '0 0 40px', lineHeight: 1.8 }}>
            {d.forYou.intro}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {d.forYou.items.map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  backgroundColor: '#f7fbfe',
                  border: '2px solid #d9eaf4',
                  borderRadius: '12px',
                  padding: '16px 20px',
                }}
              >
                <span style={{ color: '#30b9bf', fontSize: '20px', flexShrink: 0 }}>✓</span>
                <span style={{ fontSize: '14px', color: '#516881', lineHeight: 1.7 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 4. Message from our representative ============ */}
      <section style={{ backgroundColor: '#9fd9f6', padding: '56px 20px' }}>
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>
          <SectionHeading>{d.message.heading}</SectionHeading>
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: '16px',
              boxShadow: '4px 4px 0 rgba(81,104,129,0.2)',
              padding: '32px',
              display: 'flex',
              gap: '24px',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              marginTop: '24px',
            }}
          >
            <div style={{ width: '120px', flexShrink: 0, margin: '0 auto' }}>
              <ImagePlaceholder asset={IMAGES.message} locale={locale} />
            </div>
            <div style={{ flex: 1, minWidth: '240px' }}>
              {d.message.paragraphs.map((p, i) => (
                <p key={i} style={{ fontSize: '15px', color: '#516881', margin: i === 0 ? '0 0 16px' : 0, lineHeight: 2 }}>
                  {p}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ 5. You'll be in good company ============ */}
      <section style={{ backgroundColor: '#fff', padding: '56px 20px' }}>
        <div style={{ maxWidth: maxW, margin: '0 auto' }}>
          <SectionHeading>{d.company.heading}</SectionHeading>
          <p style={{ textAlign: 'center', color: '#888', fontSize: '15px', margin: '0 0 40px', lineHeight: 1.8 }}>
            {d.company.intro}
          </p>

          {/* 活動写真ギャラリー */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '40px' }}>
            {['gallery1', 'gallery2', 'gallery3'].map((k) => (
              <ImagePlaceholder key={k} asset={IMAGES[k]} locale={locale} />
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {/* Who's taking part */}
            <div style={{ backgroundColor: '#f7fbfe', border: '2px solid #d9eaf4', borderRadius: '14px', padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#516881', margin: '0 0 16px' }}>
                {d.company.whoTitle}
              </h3>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#516881', fontSize: '14px', lineHeight: 2.2 }}>
                {d.company.who.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>

            {/* Age groups (横棒グラフ) */}
            <div style={{ backgroundColor: '#f7fbfe', border: '2px solid #d9eaf4', borderRadius: '14px', padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#516881', margin: '0 0 16px' }}>
                {d.company.ageTitle}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {d.company.ages.map((a, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#516881', marginBottom: '4px' }}>
                      <span>{a.label}</span>
                      <span style={{ fontWeight: 700 }}>{a.pct}%</span>
                    </div>
                    <div style={{ height: '10px', borderRadius: '5px', backgroundColor: '#e3eef6', overflow: 'hidden' }}>
                      <div style={{ width: `${a.pct}%`, height: '100%', borderRadius: '5px', backgroundColor: ['#fe4c7f', '#30b9bf', '#f87a6d', '#f5c842'][i % 4] }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 6. How to get started ============ */}
      <section style={{ backgroundColor: '#f7fbfe', padding: '56px 20px' }}>
        <div style={{ maxWidth: maxW, margin: '0 auto' }}>
          <SectionHeading>{d.steps.heading}</SectionHeading>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginTop: '32px' }}>
            {d.steps.items.map((item, i) => (
              <div key={i} className="card" style={{ padding: '24px', position: 'relative' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#fe4c7f',
                    color: '#fff',
                    fontSize: '18px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '14px',
                  }}
                >
                  {i + 1}
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#516881', margin: '0 0 8px', lineHeight: 1.5 }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '13px', color: '#888', margin: 0, lineHeight: 1.9 }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 7. 登録フォーム ============ */}
      <section id="signup" style={{ background: 'linear-gradient(135deg, #f7fbfe 0%, #d9eaf4 100%)', padding: '56px 20px 72px', scrollMarginTop: '56px' }}>
        <RegisterIntlForm locale={locale} />
      </section>
    </div>
  )
}
