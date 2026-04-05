'use client'

import { useState } from 'react'
import { updateRegistrationStatus, sendStatusEmail } from '../../actions'

interface Props {
  registrationId: string
  currentStatus: 'applied' | 'selected' | 'rejected'
}

const STATUS_OPTIONS = [
  { value: 'applied',  label: '申込済み', color: '#516881', bg: '#f0f4f8' },
  { value: 'selected', label: '当選',     color: '#1a8a8f', bg: '#f0fffe' },
  { value: 'rejected', label: '落選',     color: '#c0234a', bg: '#fff0f3' },
] as const

export default function RegistrationStatusSelect({ registrationId, currentStatus }: Props) {
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)

  const current = STATUS_OPTIONS.find((o) => o.value === status)!
  const canSendEmail = status === 'selected' || status === 'rejected'

  const handleChange = async (newStatus: 'applied' | 'selected' | 'rejected') => {
    if (newStatus === status) return
    setLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)
    const result = await updateRegistrationStatus(registrationId, newStatus)
    if (result.error) {
      setErrorMsg(result.error)
    } else {
      setStatus(newStatus)
    }
    setLoading(false)
  }

  const handleSendEmail = async () => {
    setSending(true)
    setErrorMsg(null)
    setShowConfirm(false)
    const result = await sendStatusEmail(registrationId)
    if (result.error) {
      setErrorMsg(result.error)
    } else {
      setSuccessMsg('メールを送信しました')
      setTimeout(() => setSuccessMsg(null), 3000)
    }
    setSending(false)
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', position: 'relative' }}>

      {/* ステータスセレクト */}
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <select
          value={status}
          onChange={(e) => handleChange(e.target.value as 'applied' | 'selected' | 'rejected')}
          disabled={loading}
          style={{
            appearance: 'none',
            padding: '4px 28px 4px 10px',
            border: `1.5px solid ${current.color}`,
            borderRadius: '6px',
            backgroundColor: current.bg,
            color: current.color,
            fontSize: '12px',
            fontWeight: '700',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <span style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: '10px', color: current.color }}>▾</span>
      </div>

      {/* メール送信ボタン（当選・落選時のみ） */}
      {canSendEmail && (
        <button
          onClick={() => setShowConfirm(true)}
          disabled={sending}
          style={{
            padding: '4px 12px',
            border: '1.5px solid #516881',
            borderRadius: '6px',
            backgroundColor: '#fff',
            color: '#516881',
            fontSize: '12px',
            fontWeight: '700',
            cursor: sending ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
            opacity: sending ? 0.6 : 1,
            whiteSpace: 'nowrap',
          }}
        >
          {sending ? '送信中...' : '📧 メール送信'}
        </button>
      )}

      {/* エラー・成功メッセージ */}
      {errorMsg && <span style={{ fontSize: '11px', color: '#c0234a' }}>⚠️ {errorMsg}</span>}
      {successMsg && <span style={{ fontSize: '11px', color: '#1a8a8f', fontWeight: '700' }}>✓ {successMsg}</span>}

      {/* 確認モーダル */}
      {showConfirm && (
        <div
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          onClick={() => setShowConfirm(false)}
        >
          <div
            style={{ backgroundColor: '#fff', borderRadius: '16px', boxShadow: '4px 4px 0 rgba(81,104,129,0.2)', padding: '28px', maxWidth: '360px', width: '100%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#333', margin: '0 0 10px' }}>
              メール送信の確認
            </h3>
            <p style={{ fontSize: '14px', color: '#555', lineHeight: 1.8, margin: '0 0 20px' }}>
              <strong style={{ color: status === 'selected' ? '#1a8a8f' : '#c0234a' }}>
                {status === 'selected' ? '当選' : '落選'}
              </strong>
              の通知メールを送信します。よろしいですか？
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowConfirm(false)}
                style={{ flex: 1, padding: '10px', backgroundColor: '#f7fbfe', border: '2px solid #d9eaf4', borderRadius: '10px', fontSize: '14px', color: '#516881', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '700' }}
              >
                キャンセル
              </button>
              <button
                onClick={handleSendEmail}
                style={{ flex: 1, padding: '10px', backgroundColor: '#516881', border: 'none', borderRadius: '10px', fontSize: '14px', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '700' }}
              >
                送信する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
