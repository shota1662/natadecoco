import Link from 'next/link'
import { signOut } from '@/app/auth/actions'

export default function Footer() {
  return (
    <>
      {/* 白 → フッター紺 波形 */}
      <div className="wave-divider" style={{ backgroundColor: '#f7fbfe' }}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
        >
          <path fill="#516881" fillOpacity="0.3" d="M0,36 C240,10 480,63 720,36 C960,10 1200,63 1440,36 L1440,80 L0,80 Z" />
          <path fill="#516881" fillOpacity="0.6" d="M0,46 C200,20 440,70 680,46 C920,22 1160,66 1440,46 L1440,80 L0,80 Z" />
          <path fill="#516881" d="M0,56 C160,36 380,72 600,54 C820,36 1040,70 1260,53 C1360,44 1410,60 1440,56 L1440,80 L0,80 Z" />
        </svg>
      </div>

      <footer style={{ backgroundColor: '#516881', color: '#fff', padding: '36px 0 24px' }}>
        <div style={{ maxWidth: '940px', padding: '0 40px', margin: '0 auto' }}>
          {/* リンク */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', paddingBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.25)', flexWrap: 'wrap' }}>
            <Link
              href="https://natadecoco.org"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#fff', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              ← ナタデココHPへ戻る
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.75)',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  padding: 0,
                }}
              >
                ログアウト
              </button>
            </form>
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
