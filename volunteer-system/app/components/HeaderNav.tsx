'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { signOut } from '@/app/auth/actions'

interface Props {
  isAdmin: boolean
}

export default function HeaderNav({ isAdmin }: Props) {
  const [open, setOpen] = useState(false)

  // メニュー外クリックで閉じる
  useEffect(() => {
    if (!open) return
    const handler = () => setOpen(false)
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [open])

  return (
    <>
      {/* デスクトップ用ナビ */}
      <nav className="header-nav-desktop">
        <ul
          style={{
            display: 'flex',
            gap: '32px',
            margin: 0,
            padding: 0,
            listStyle: 'none',
            alignItems: 'center',
          }}
        >
          <li>
            <Link
              href="/dashboard"
              style={{ color: '#516881', fontWeight: '700', fontSize: '14px' }}
            >
              マイページ
            </Link>
          </li>
          <li>
            <Link
              href="/profile"
              style={{ color: '#516881', fontWeight: '700', fontSize: '14px' }}
            >
              プロフィールを編集
            </Link>
          </li>
          {isAdmin && (
            <li>
              <Link
                href="/admin"
                style={{ color: '#fe4c7f', fontWeight: '700', fontSize: '14px' }}
              >
                管理者ページ
              </Link>
            </li>
          )}
        </ul>
      </nav>

      {/* モバイル用バーガーボタン */}
      <button
        className="header-hamburger"
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v) }}
        aria-label="メニュー"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '6px',
          flexDirection: 'column',
          gap: '5px',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            display: 'block',
            width: '22px',
            height: '2px',
            backgroundColor: '#516881',
            borderRadius: '2px',
            transition: 'transform 0.2s, opacity 0.2s',
            transform: open ? 'translateY(7px) rotate(45deg)' : 'none',
          }}
        />
        <span
          style={{
            display: 'block',
            width: '22px',
            height: '2px',
            backgroundColor: '#516881',
            borderRadius: '2px',
            opacity: open ? 0 : 1,
            transition: 'opacity 0.2s',
          }}
        />
        <span
          style={{
            display: 'block',
            width: '22px',
            height: '2px',
            backgroundColor: '#516881',
            borderRadius: '2px',
            transition: 'transform 0.2s, opacity 0.2s',
            transform: open ? 'translateY(-7px) rotate(-45deg)' : 'none',
          }}
        />
      </button>

      {/* モバイル用ドロップダウンメニュー */}
      {open && (
        <div
          className="header-nav-mobile-menu"
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            left: 0,
            backgroundColor: '#fff',
            boxShadow: '0 4px 12px rgba(81,104,129,0.15)',
            borderTop: '2px solid #9fd9f6',
            zIndex: 200,
            padding: '16px 24px',
          }}
        >
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0' }}>
            <li style={{ borderBottom: '1px solid #e8f0f7' }}>
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                style={{ display: 'block', padding: '14px 0', color: '#516881', fontWeight: '700', fontSize: '14px' }}
              >
                マイページ
              </Link>
            </li>
            <li style={{ borderBottom: '1px solid #e8f0f7' }}>
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                style={{ display: 'block', padding: '14px 0', color: '#516881', fontWeight: '700', fontSize: '14px' }}
              >
                プロフィールを編集
              </Link>
            </li>
            {isAdmin && (
              <li style={{ borderBottom: '1px solid #e8f0f7' }}>
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  style={{ display: 'block', padding: '14px 0', color: '#fe4c7f', fontWeight: '700', fontSize: '14px' }}
                >
                  管理者ページ
                </Link>
              </li>
            )}
            <li>
              <form action={signOut}>
                <button
                  type="submit"
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '14px 0',
                    fontSize: '14px',
                    color: '#516881',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontWeight: '700',
                    width: '100%',
                    textAlign: 'left',
                  }}
                >
                  ログアウト
                </button>
              </form>
            </li>
          </ul>
        </div>
      )}
    </>
  )
}
