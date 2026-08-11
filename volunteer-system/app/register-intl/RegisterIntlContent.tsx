'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import RegisterIntlForm from './RegisterIntlForm'
import { PublicHeader, PublicFooter } from './PublicChrome'
import { DICT, type Locale } from './i18n'
import { IMAGES, type ImageAsset } from './images'

/**
 * 画像枠。asset.src があれば next/image を object-fit: cover で aspect 枠に
 * 収めて描画（枠比率と画像比率が違っても中央基準でトリミングし、レイアウト
 * シフトを防ぐ）。src が null のときは従来のダッシュ枠プレースホルダーを描画。
 */
function ImagePlaceholder({ asset, locale }: { asset: ImageAsset; locale: Locale }) {
  const alt = locale === 'en' ? asset.alt_en : asset.alt_ja

  // 実画像あり：aspect 枠に cover で収める（顔などが中央で切れないよう center 基準）
  if (asset.src) {
    return (
      <div
        style={{
          position: 'relative',
          aspectRatio: asset.aspect,
          width: '100%',
          borderRadius: '14px',
          overflow: 'hidden',
        }}
      >
        <Image
          src={asset.src}
          alt={alt}
          fill
          sizes="(max-width: 640px) 100vw, 400px"
          style={{ objectFit: 'cover', objectPosition: 'center' }}
        />
      </div>
    )
  }

  // 実画像なし：プレースホルダー枠
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
      {/* 公開募集ページ用のシンプルなヘッダー（会員向け共通 chrome は非表示） */}
      <PublicHeader locale={locale} />

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
      {/* volunteer.html の .vol-hero に準拠：フラットな水色ベタ塗り＋通常フローの横並び。
          overlay は使わず、見出しは #516881 のダーク文字。テキスト左／写真右、モバイルで縦積み。 */}
      <section style={{ backgroundColor: '#9fd9f6', padding: '36px 20px 40px' }}>
        <div
          style={{
            maxWidth: '960px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '40px',
            flexWrap: 'wrap',
          }}
        >
          {/* テキスト（左） */}
          <div style={{ flex: '1 1 320px', minWidth: '260px' }}>
            <p style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.3em', color: '#516881', margin: '0 0 8px' }}>
              INTERNATIONAL SUPPORTER
            </p>
            <h1
              style={{
                fontSize: 'clamp(28px, 5vw, 36px)',
                fontWeight: 700,
                color: '#516881',
                margin: '0 0 16px',
                lineHeight: 1.3,
                letterSpacing: '0.05em',
              }}
            >
              {d.hero.title}
            </h1>
            <p style={{ fontSize: '15px', color: '#516881', lineHeight: 1.9, margin: '0 0 28px' }}>
              {d.hero.subtitle}
            </p>
            <a
              href="#signup"
              className="btn-coral"
              style={{ display: 'inline-flex', padding: '15px 36px', height: 'auto', width: 'auto', fontSize: '15px' }}
            >
              {d.hero.button}
            </a>
          </div>

          {/* 写真（右）: 丸枠フレームで ImagePlaceholder を配置 */}
          <div
            style={{
              flex: '1 1 360px',
              minWidth: '260px',
              borderRadius: '18px',
              overflow: 'hidden',
              boxShadow: '4px 4px 0 rgba(81,104,129,0.2)',
              border: '3px solid #fff',
            }}
          >
            <ImagePlaceholder asset={IMAGES.hero} locale={locale} />
          </div>
        </div>
      </section>

      {/* 波形ディバイダ（水色 → 白）: volunteer.html と同一 */}
      <div className="wave-divider" style={{ backgroundColor: '#9fd9f6' }}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path fill="#fff" fillOpacity="0.3" d="M0,55 C240,95 480,15 720,55 C960,95 1200,15 1440,55 L1440,120 L0,120 Z" />
          <path fill="#fff" fillOpacity="0.6" d="M0,70 C200,105 440,30 680,70 C920,100 1160,35 1440,70 L1440,120 L0,120 Z" />
          <path fill="#fff" d="M0,85 C160,108 380,55 600,82 C820,105 1040,56 1260,80 C1360,90 1410,68 1440,85 L1440,120 L0,120 Z" />
        </svg>
      </div>

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
                <div style={{ margin: '0 0 16px' }}>
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

      {/* ============ 4.5 プログラム例（Message の下） ============ */}
      <section style={{ backgroundColor: '#f7fbfe', padding: '56px 20px' }}>
        <div style={{ maxWidth: maxW, margin: '0 auto' }}>
          <SectionHeading>{d.programs.heading}</SectionHeading>
          <p style={{ textAlign: 'center', color: '#888', fontSize: '15px', margin: '0 0 40px', lineHeight: 1.8 }}>
            {d.programs.intro}
          </p>
          {/* 1案件=1行。画像左／テキスト右、縦に4つ。モバイルでは画像上に折り返す */}
          <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {d.programs.items.map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: '20px',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  padding: '16px',
                  backgroundColor: '#fff',
                  borderRadius: '14px',
                  boxShadow: '2px 2px 0 rgba(81,104,129,0.2)',
                }}
              >
                {/* 画像枠（後で images.ts の program{n} の src を入れると表示される） */}
                <div style={{ flex: '1 1 200px', minWidth: '180px', maxWidth: '256px' }}>
                  <ImagePlaceholder asset={IMAGES[`program${i + 1}`]} locale={locale} />
                </div>
                <div style={{ flex: '2 1 300px', minWidth: '240px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#516881', margin: '0 0 10px' }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '14px', color: '#516881', margin: 0, lineHeight: 1.9 }}>{item.body}</p>
                </div>
              </div>
            ))}
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
      {/* 縦タイムライン：大きめ丸番号バッジ＋タイトル＋説明を1行とし、上から Step1→4。
          バッジ同士を縦線でつなぎ進行の流れを示す（最後のステップ下は線なし）。 */}
      <section style={{ backgroundColor: '#f7fbfe', padding: '56px 20px' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <SectionHeading>{d.steps.heading}</SectionHeading>
          <div style={{ marginTop: '32px' }}>
            {d.steps.items.map((item, i) => {
              const isLast = i === d.steps.items.length - 1
              return (
                <div key={i} style={{ display: 'flex', gap: '20px' }}>
                  {/* レール：番号バッジ＋縦のつなぎ線 */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: '#30b9bf',
                        color: '#fff',
                        fontSize: '20px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '2px 2px 0 rgba(81,104,129,0.2)',
                      }}
                    >
                      {i + 1}
                    </div>
                    {/* 最後のステップの下には線を引かない */}
                    {!isLast && (
                      <div style={{ flex: 1, width: '2px', backgroundColor: '#d9eaf4', marginTop: '8px', minHeight: '24px' }} />
                    )}
                  </div>

                  {/* 本文：タイトル＋説明 */}
                  <div style={{ flex: 1, minWidth: 0, paddingTop: '8px', paddingBottom: isLast ? 0 : '32px' }}>
                    <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#516881', margin: '0 0 6px', lineHeight: 1.5 }}>
                      {item.title}
                    </h3>
                    <p style={{ fontSize: '14px', color: '#888', margin: 0, lineHeight: 1.9 }}>{item.body}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ============ 7. 登録フォーム ============ */}
      <section id="signup" style={{ background: 'linear-gradient(135deg, #f7fbfe 0%, #d9eaf4 100%)', padding: '56px 20px 72px', scrollMarginTop: '56px' }}>
        <RegisterIntlForm locale={locale} />
      </section>

      {/* 公開募集ページ用のシンプルなフッター（ログアウト等は非表示） */}
      <PublicFooter locale={locale} />
    </div>
  )
}
