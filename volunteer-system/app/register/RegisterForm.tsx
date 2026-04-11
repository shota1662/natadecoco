'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signUpStep1, type AuthState } from '@/app/auth/actions'

const labelStyle = {
  display: 'flex' as const,
  alignItems: 'center' as const,
  gap: '8px',
  fontSize: '14px',
  fontWeight: '700' as const,
  color: '#516881',
  marginBottom: '8px',
}

export default function RegisterForm() {
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(signUpStep1, null)

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #f7fbfe 0%, #d9eaf4 100%)',
        padding: '40px 20px 60px',
      }}
    >
      <div
        className="register-card"
        style={{
          backgroundColor: '#fff',
          borderRadius: '20px',
          boxShadow: '2px 2px 0 rgba(81,104,129,0.15)',
          width: '100%',
          maxWidth: '600px',
          margin: '0 auto',
        }}
      >
        {/* ステップインジケーター */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#fe4c7f', color: '#fff', fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</div>
            <span className="register-step-label" style={{ color: '#fe4c7f' }}>アカウント作成</span>
          </div>
          <div style={{ width: '32px', height: '2px', backgroundColor: '#dde5ee' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#dde5ee', color: '#aaa', fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</div>
            <span className="register-step-label" style={{ color: '#aaa' }}>詳細情報</span>
          </div>
          <div style={{ width: '32px', height: '2px', backgroundColor: '#dde5ee' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#dde5ee', color: '#aaa', fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</div>
            <span className="register-step-label" style={{ color: '#aaa' }}>説明会申込み</span>
          </div>
        </div>

        {/* タイトル */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#516881', margin: '0 0 8px' }}>
            ボランティア登録
          </h1>
          <p style={{ fontSize: '14px', color: '#888', margin: 0, lineHeight: 1.8 }}>
            まずはメールアドレスとパスワードを設定してください。
          </p>
        </div>

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

        <form action={formAction}>
          {/* メールアドレス */}
          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="email" style={labelStyle}>
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

          {/* パスワード */}
          <div style={{ marginBottom: '36px' }}>
            <label htmlFor="password" style={labelStyle}>
              パスワード
              <span className="badge-pink" style={{ fontSize: '10px', padding: '2px 7px' }}>必須</span>
            </label>
            <input
              className="form-input"
              type="password"
              id="password"
              name="password"
              placeholder="8文字以上で入力してください"
              required
              minLength={8}
              autoComplete="new-password"
              disabled={isPending}
            />
            <p style={{ fontSize: '12px', color: '#888', marginTop: '6px' }}>
              ※ 8文字以上の英数字を設定してください
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              type="submit"
              className="btn-coral"
              disabled={isPending}
              style={{
                padding: '16px 48px',
                height: 'auto',
                width: 'auto',
                fontSize: '15px',
                opacity: isPending ? 0.7 : 1,
                cursor: isPending ? 'not-allowed' : 'pointer',
              }}
            >
              {isPending ? '処理中...' : '次へ →'}
            </button>
          </div>
        </form>

        {/* ログインリンク */}
        <div
          style={{
            textAlign: 'center',
            marginTop: '28px',
            paddingTop: '24px',
            borderTop: '1px solid #e5e7eb',
          }}
        >
          <p style={{ fontSize: '14px', color: '#888', margin: '0 0 8px' }}>
            すでに登録済みですか？
          </p>
          <Link
            href="/login"
            style={{
              color: '#30b9bf',
              fontWeight: '700',
              fontSize: '14px',
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
            }}
          >
            ログインはこちら →
          </Link>
        </div>
      </div>
    </div>
  )
}
