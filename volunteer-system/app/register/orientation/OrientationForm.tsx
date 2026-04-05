'use client'

import { useActionState, useState } from 'react'
import { registerOrientation, type AuthState } from '@/app/auth/actions'

const SESSIONS = [
  { date: '2026-05-07', label: '5/7（水）20:00-20:45　オンライン' },
  { date: '2026-06-01', label: '6/1（月）20:00-20:45　オンライン' },
  { date: '2026-07-06', label: '7/6（月）20:00-20:45　オンライン' },
  { date: '2026-08-03', label: '8/3（月）20:00-20:45　オンライン' },
  { date: '2026-09-07', label: '9/7（月）20:00-20:45　オンライン' },
  { date: '2026-10-05', label: '10/5（月）20:00-20:45　オンライン' },
  { date: '2026-11-02', label: '11/2（月）20:00-20:45　オンライン' },
  { date: '2026-12-07', label: '12/7（月）20:00-20:45　オンライン' },
]

export default function OrientationForm() {
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(registerOrientation, null)
  const [selected, setSelected] = useState<string>('')

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
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#dde5ee', color: '#aaa', fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</div>
            <span className="register-step-label" style={{ color: '#aaa' }}>アカウント作成</span>
          </div>
          <div style={{ width: '32px', height: '2px', backgroundColor: '#fe4c7f' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#dde5ee', color: '#aaa', fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</div>
            <span className="register-step-label" style={{ color: '#aaa' }}>詳細情報</span>
          </div>
          <div style={{ width: '32px', height: '2px', backgroundColor: '#fe4c7f' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#fe4c7f', color: '#fff', fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</div>
            <span className="register-step-label" style={{ color: '#fe4c7f' }}>説明会申込み</span>
          </div>
        </div>

        {/* タイトル */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              backgroundColor: '#30b9bf',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: '28px',
            }}
          >
            📅
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#516881', margin: '0 0 8px' }}>
            ボランティア説明会に参加しよう
          </h1>
          <p style={{ fontSize: '14px', color: '#888', margin: 0, lineHeight: 1.8 }}>
            初めての方はまず説明会にご参加ください。<br />
            ご都合の良い日程を選んでください。
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
          {/* 日程選択 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
            {SESSIONS.map((session) => (
              <label
                key={session.date}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 18px',
                  border: `2px solid ${selected === session.date ? '#30b9bf' : '#dde5ee'}`,
                  borderRadius: '12px',
                  backgroundColor: selected === session.date ? '#f0fbfc' : '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <input
                  type="radio"
                  name="orientation_date"
                  value={session.date}
                  style={{ accentColor: '#30b9bf', width: '18px', height: '18px', flexShrink: 0 }}
                  onChange={() => setSelected(session.date)}
                />
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: selected === session.date ? '700' : '400',
                    color: selected === session.date ? '#30b9bf' : '#444',
                  }}
                >
                  {session.label}
                </span>
              </label>
            ))}
          </div>

          {/* 注記 */}
          <p style={{ fontSize: '12px', color: '#888', lineHeight: 1.8, margin: '0 0 28px' }}>
            ※ 日時変更の可能性あり。予定が合わない場合には個別対応も可能ですので、ご相談ください。
          </p>

          {/* ボタン */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <button
              type="submit"
              className="btn-coral"
              disabled={isPending || !selected}
              style={{
                padding: '16px 48px',
                height: 'auto',
                width: 'auto',
                fontSize: '15px',
                opacity: isPending || !selected ? 0.5 : 1,
                cursor: isPending || !selected ? 'not-allowed' : 'pointer',
              }}
            >
              {isPending ? '送信中...' : 'この日程で申し込む'}
            </button>

            {/* スキップ */}
            <button
              type="submit"
              name="orientation_date"
              value=""
              disabled={isPending}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '13px',
                color: '#aaa',
                cursor: 'pointer',
                textDecoration: 'underline',
                textUnderlineOffset: '3px',
                padding: '4px',
              }}
            >
              あとで申し込む（スキップ）
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
