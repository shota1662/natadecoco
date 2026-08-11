'use client'

import Image from 'next/image'
import { DICT, type Locale } from './i18n'

/**
 * /register-intl（ログイン不要の公開募集ページ）専用のシンプルな
 * ヘッダー/フッター。会員向け共通 chrome は出さず、natadecoco.org 相当の
 * 最小構成（ロゴ＋「ナタデココHPへ戻る」導線）にする。
 * 文言は言語トグルの locale に追従する。
 */

const HOME_URL = 'https://natadecoco.org'

export function PublicHeader({ locale }: { locale: Locale }) {
  const d = DICT[locale]
  return (
    <header
      style={{
        backgroundColor: '#fff',
        boxShadow: '0 2px 8px rgba(81,104,129,0.10)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          padding: '10px 24px',
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        <a href={HOME_URL} style={{ display: 'block', flexShrink: 0 }}>
          <Image src="/logo.svg" alt="NPOナタデココ" width={120} height={38} style={{ display: 'block' }} priority />
        </a>
        <a
          href={HOME_URL}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: '#516881',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          ← {d.nav.back}
        </a>
      </div>
    </header>
  )
}

export function PublicFooter({ locale }: { locale: Locale }) {
  const d = DICT[locale]
  return (
    <>
      {/* 白 → フッター紺 波形（会員向け Footer と同一トーン） */}
      <div className="wave-divider" style={{ backgroundColor: '#f7fbfe' }}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 80" preserveAspectRatio="none">
          <path fill="#516881" fillOpacity="0.3" d="M0,36 C240,10 480,63 720,36 C960,10 1200,63 1440,36 L1440,80 L0,80 Z" />
          <path fill="#516881" fillOpacity="0.6" d="M0,46 C200,20 440,70 680,46 C920,22 1160,66 1440,46 L1440,80 L0,80 Z" />
          <path fill="#516881" d="M0,56 C160,36 380,72 600,54 C820,36 1040,70 1260,53 C1360,44 1410,60 1440,56 L1440,80 L0,80 Z" />
        </svg>
      </div>

      <footer style={{ backgroundColor: '#516881', color: '#fff', padding: '36px 0 24px' }}>
        <div style={{ maxWidth: '940px', padding: '0 40px', margin: '0 auto' }}>
          {/* ロゴ ＋ HPへ戻る */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              paddingBottom: '24px',
              borderBottom: '1px solid rgba(255,255,255,0.25)',
            }}
          >
            <a
              href={HOME_URL}
              style={{
                display: 'inline-block',
                backgroundColor: '#fff',
                padding: '8px 16px',
                borderRadius: '10px',
                lineHeight: 0,
              }}
            >
              <Image src="/logo.svg" alt="NPOナタデココ" width={120} height={38} style={{ display: 'block' }} />
            </a>
            <a href={HOME_URL} style={{ color: '#fff', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              ← {d.nav.back}
            </a>
          </div>

          {/* コピーライト */}
          <div style={{ textAlign: 'center', paddingTop: '20px' }}>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', margin: 0, letterSpacing: '0.08em' }}>
              © 2026 NPOナタデココ All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  )
}
