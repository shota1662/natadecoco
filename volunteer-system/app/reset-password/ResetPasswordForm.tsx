'use client'

import { useActionState } from 'react'
import { updatePassword, type AuthState } from '@/app/auth/actions'

export default function ResetPasswordForm() {
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(updatePassword, null)

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
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#516881', margin: '0 0 8px' }}>
            新しいパスワードの設定
          </h1>
          <p style={{ fontSize: '14px', color: '#888', margin: 0, lineHeight: 1.8 }}>
            8文字以上の新しいパスワードを入力してください。
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

        {/* フォーム */}
        <form action={formAction}>
          <div style={{ marginBottom: '24px' }}>
            <label
              htmlFor="password"
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
              新しいパスワード
              <span className="badge-pink" style={{ fontSize: '10px', padding: '2px 7px' }}>必須</span>
            </label>
            <input
              className="form-input"
              type="password"
              id="password"
              name="password"
              placeholder="8文字以上"
              required
              minLength={8}
              autoComplete="new-password"
              disabled={isPending}
            />
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label
              htmlFor="confirm"
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
              パスワード（確認）
              <span className="badge-pink" style={{ fontSize: '10px', padding: '2px 7px' }}>必須</span>
            </label>
            <input
              className="form-input"
              type="password"
              id="confirm"
              name="confirm"
              placeholder="もう一度入力してください"
              required
              minLength={8}
              autoComplete="new-password"
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
              {isPending ? '更新中...' : 'パスワードを更新する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
