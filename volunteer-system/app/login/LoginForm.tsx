'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signIn, type AuthState } from '@/app/auth/actions'

export default function LoginForm({ message }: { message?: string }) {
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(signIn, null)

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 120px)',
        background: 'linear-gradient(135deg, #f7fbfe 0%, #d9eaf4 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
      }}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '20px',
          boxShadow: '2px 2px 0 rgba(81,104,129,0.15)',
          padding: '48px 40px',
          width: '100%',
          maxWidth: '480px',
        }}
      >
        {/* タイトル */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              backgroundColor: '#9fd9f6',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: '28px',
            }}
          >
            🔑
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#516881', margin: '0 0 8px' }}>
            ログイン
          </h1>
          <p style={{ fontSize: '14px', color: '#888', margin: 0 }}>
            ボランティア管理システムへようこそ
          </p>
        </div>

        {/* サーバーから渡されたメッセージ */}
        {message && (
          <div
            style={{
              backgroundColor: '#f0fffe',
              border: '2px solid #30b9bf',
              borderRadius: '10px',
              padding: '12px 16px',
              marginBottom: '24px',
              fontSize: '14px',
              color: '#1a8a8f',
            }}
          >
            ✓ {decodeURIComponent(message)}
          </div>
        )}

        {/* エラー表示 */}
        {state?.error && (
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
            ⚠️ {state.error}
          </div>
        )}

        {/* フォーム */}
        <form action={formAction}>
          <div style={{ marginBottom: '24px' }}>
            <label
              htmlFor="email"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '700',
                color: '#516881',
                marginBottom: '8px',
              }}
            >
              メールアドレス
              <span className="badge-pink" style={{ fontSize: '10px', padding: '2px 7px' }}>必須</span>
            </label>
            <input
              className="form-input"
              type="email"
              id="email"
              name="email"
              placeholder="例）example@mail.com"
              required
              autoComplete="email"
              disabled={isPending}
            />
          </div>

          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label
                htmlFor="password"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: '700',
                  color: '#516881',
                }}
              >
                パスワード
                <span className="badge-pink" style={{ fontSize: '10px', padding: '2px 7px' }}>必須</span>
              </label>
              <Link
                href="/forgot-password"
                style={{
                  fontSize: '12px',
                  color: '#30b9bf',
                  textDecoration: 'underline',
                  textUnderlineOffset: '3px',
                }}
              >
                パスワードを忘れた方へ
              </Link>
            </div>
            <input
              className="form-input"
              type="password"
              id="password"
              name="password"
              placeholder="パスワードを入力"
              required
              autoComplete="current-password"
              disabled={isPending}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              type="submit"
              className="btn-primary"
              disabled={isPending}
              style={{
                opacity: isPending ? 0.7 : 1,
                cursor: isPending ? 'not-allowed' : 'pointer',
              }}
            >
              {isPending ? 'ログイン中...' : 'ログイン'}
            </button>
          </div>
        </form>

        {/* 登録リンク */}
        <div
          style={{
            textAlign: 'center',
            marginTop: '28px',
            paddingTop: '24px',
            borderTop: '1px solid #e5e7eb',
          }}
        >
          <p style={{ fontSize: '14px', color: '#888', margin: '0 0 8px' }}>
            まだ登録していませんか？
          </p>
          <Link
            href="/register"
            style={{
              color: '#30b9bf',
              fontWeight: '700',
              fontSize: '14px',
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
            }}
          >
            ボランティア登録はこちら →
          </Link>
        </div>
      </div>
    </div>
  )
}
