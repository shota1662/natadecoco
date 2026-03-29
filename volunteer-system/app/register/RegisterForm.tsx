'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signUp, type AuthState } from '@/app/auth/actions'

const NATIONALITIES = [
  '日本', 'アメリカ', 'イギリス', 'カナダ', 'オーストラリア', 'ニュージーランド',
  '中国', '韓国', '台湾', 'フィリピン', 'インドネシア', 'タイ', 'ベトナム',
  'インド', 'ブラジル', 'フランス', 'ドイツ', 'スペイン', 'イタリア', 'その他',
]

const LANGUAGE_LEVELS = [
  { value: 1, label: '1 - 初級（ほぼ話せない）' },
  { value: 2, label: '2 - 基礎（日常会話の一部）' },
  { value: 3, label: '3 - 中級（日常会話ができる）' },
  { value: 4, label: '4 - 上級（仕事で使えるレベル）' },
  { value: 5, label: '5 - ネイティブレベル' },
]

const labelStyle = {
  display: 'flex' as const,
  alignItems: 'center' as const,
  gap: '8px',
  fontSize: '14px',
  fontWeight: '700' as const,
  color: '#516881',
  marginBottom: '8px',
}

const optionalBadge = {
  backgroundColor: '#aaa',
  color: '#fff',
  fontSize: '10px',
  fontWeight: 'bold' as const,
  padding: '2px 7px',
  borderRadius: '3px',
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

export default function RegisterForm() {
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(signUp, null)

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #f7fbfe 0%, #d9eaf4 100%)',
        padding: '40px 20px 60px',
      }}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '20px',
          boxShadow: '8px 8px 0 rgba(81,104,129,0.15)',
          padding: '48px 40px',
          width: '100%',
          maxWidth: '600px',
          margin: '0 auto',
        }}
      >
        {/* タイトル */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              backgroundColor: '#fe4c7f',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: '28px',
            }}
          >
            🌏
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#516881', margin: '0 0 8px' }}>
            ボランティア登録
          </h1>
          <p style={{ fontSize: '14px', color: '#888', margin: 0, lineHeight: 1.8 }}>
            必要事項を入力して、ボランティアとして登録してください。
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
          {/* 氏名 */}
          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="full_name" style={labelStyle}>
              氏名
              <span className="badge-pink" style={{ fontSize: '10px', padding: '2px 7px' }}>必須</span>
            </label>
            <input
              className="form-input"
              type="text"
              id="full_name"
              name="full_name"
              placeholder="例）山田 太郎"
              required
              disabled={isPending}
            />
          </div>

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
          <div style={{ marginBottom: '24px' }}>
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

          {/* 国籍 */}
          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="nationality" style={labelStyle}>
              国籍
              <span style={optionalBadge}>任意</span>
            </label>
            <div style={{ position: 'relative' }}>
              <select
                className="form-select"
                id="nationality"
                name="nationality"
                style={{ paddingRight: '40px' }}
                disabled={isPending}
              >
                <option value="">選択してください</option>
                {NATIONALITIES.map((nat) => (
                  <option key={nat} value={nat}>{nat}</option>
                ))}
              </select>
              <span style={selectArrow}>▾</span>
            </div>
          </div>

          {/* 生年月日 */}
          <div style={{ marginBottom: '36px' }}>
            <label htmlFor="birthday" style={labelStyle}>
              生年月日
              <span style={optionalBadge}>任意</span>
            </label>
            <input
              className="form-input"
              type="date"
              id="birthday"
              name="birthday"
              disabled={isPending}
            />
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
              {isPending ? '登録中...' : '登録する'}
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
