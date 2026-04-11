'use client'

import { useState } from 'react'
import { registerForEvent, cancelRegistration } from './actions'
import type { Event } from '@/lib/types'

interface EventCardProps {
  event: Event
  isRegistered: boolean
  participantCount: number
  registrationId?: string
  registrationStatus?: 'applied' | 'selected' | 'rejected'
}

function getReceptionStatus(event: Event) {
  const now = new Date()
  const start = event.registration_start ? new Date(event.registration_start) : null
  const end = event.registration_end ? new Date(event.registration_end) : null

  if (start && start > now) {
    const m = (start.getMonth() + 1).toString().padStart(2, '0')
    const d = start.getDate().toString().padStart(2, '0')
    return { label: `${m}/${d} 受付開始`, type: 'upcoming' as const }
  }
  if (end && end < now) {
    return { label: '受付終了', type: 'closed' as const }
  }
  return { label: '募集受付中', type: 'open' as const }
}

const RECEPTION_STYLE = {
  upcoming: { color: '#c47b1a', bg: '#fff8f0', border: '#f4a44a' },
  open:     { color: '#1a8a8f', bg: '#f0fffe', border: '#30b9bf' },
  closed:   { color: '#888',    bg: '#f5f5f5', border: '#ccc' },
}

const STATUS_STYLE = {
  applied:  { label: '申込済み', color: '#516881', bg: '#f0f4f8', border: '#9fb8cc' },
  selected: { label: '当選',     color: '#1a8a8f', bg: '#f0fffe', border: '#30b9bf' },
  rejected: { label: '落選',     color: '#c0234a', bg: '#fff0f3', border: '#fe4c7f' },
}

export default function EventCard({
  event,
  isRegistered,
  participantCount,
  registrationId,
  registrationStatus,
}: EventCardProps) {
  const [loading, setLoading] = useState(false)
  const [registered, setRegistered] = useState(isRegistered)
  const [regId, setRegId] = useState(registrationId)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [wantsTransportFee, setWantsTransportFee] = useState(false)
  const [wantsHonorarium, setWantsHonorarium] = useState(false)

  const eventDate = new Date(event.event_date)
  const isFull = event.capacity !== null && participantCount >= event.capacity
  const reception = getReceptionStatus(event)
  const canApply = reception.type === 'open' && !registered && !isFull
  const appStatus = registered ? (registrationStatus ?? 'applied') : null
  const appStyle = appStatus ? STATUS_STYLE[appStatus] : null
  const isOrientation = event.title.includes('説明会')

  const handleRegister = async () => {
    setLoading(true)
    setError(null)
    setShowModal(false)
    const result = await registerForEvent(event.id, wantsTransportFee, wantsHonorarium)
    if (result.error) {
      setError(result.error)
    } else {
      setRegistered(true)
    }
    setLoading(false)
  }

  const handleCancel = async () => {
    if (!regId) return
    setLoading(true)
    setError(null)
    const result = await cancelRegistration(regId)
    if (result.error) {
      setError(result.error)
    } else {
      setRegistered(false)
      setRegId(undefined)
    }
    setLoading(false)
  }

  const receptionStyle = RECEPTION_STYLE[reception.type]

  return (
    <div
      style={{
        backgroundColor: '#fff',
        borderRadius: '14px',
        boxShadow: '3px 3px rgba(81,104,129,0.12)',
        overflow: 'hidden',
        display: 'flex',
        borderLeft: `5px solid ${isOrientation ? '#3dba72' : receptionStyle.border}`,
      }}
    >
      <div
        style={{
          flex: 1,
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        {/* 受付状況バッジ */}
        <div style={{ flexShrink: 0 }}>
          <span
            style={{
              display: 'inline-block',
              padding: '4px 10px',
              borderRadius: '6px',
              border: `1.5px solid ${receptionStyle.border}`,
              backgroundColor: receptionStyle.bg,
              color: receptionStyle.color,
              fontSize: '12px',
              fontWeight: '700',
              whiteSpace: 'nowrap',
            }}
          >
            {reception.label}
          </span>
        </div>

        {/* タイトル・詳細 */}
        <div style={{ flex: 1, minWidth: '180px' }}>
          {isOrientation && (
            <span style={{
              display: 'inline-block', marginBottom: '6px',
              padding: '2px 9px', borderRadius: '6px',
              backgroundColor: '#edfaf3', border: '1.5px solid #3dba72',
              color: '#1f8a56', fontSize: '11px', fontWeight: '700',
            }}>
              説明会
            </span>
          )}
          <p style={{ fontSize: '15px', fontWeight: '700', color: '#333', margin: '0 0 4px', lineHeight: 1.4 }}>
            {event.title}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '12px', color: '#666' }}>
            <span>
              📅{' '}
              {eventDate.toLocaleDateString('ja-JP', {
                year: 'numeric', month: 'short', day: 'numeric', weekday: 'short',
              })}
              {' '}
              {eventDate.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
            </span>
            {event.location && <span>📍 {event.location}</span>}
            <span>👥 {participantCount}名{event.capacity ? ` / ${event.capacity}名` : ''}</span>
            {event.result_notification_date && (
              <span>
                📋 結果通達:{' '}
                {new Date(event.result_notification_date).toLocaleDateString('ja-JP', {
                  month: 'short', day: 'numeric',
                })}まで
              </span>
            )}
          </div>
        </div>

        {/* 申込ステータス＆ボタン */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {appStyle && (
            <span
              style={{
                padding: '4px 12px',
                borderRadius: '6px',
                border: `1.5px solid ${appStyle.border}`,
                backgroundColor: appStyle.bg,
                color: appStyle.color,
                fontSize: '12px',
                fontWeight: '700',
                whiteSpace: 'nowrap',
              }}
            >
              {appStyle.label}
            </span>
          )}

          {isFull && !registered && (
            <span style={{ fontSize: '12px', color: '#888', fontWeight: '700' }}>満員</span>
          )}

          {error && (
            <span style={{ fontSize: '12px', color: '#fe4c7f' }}>⚠️ {error}</span>
          )}

          {registered ? (
            appStatus === 'applied' && (
              <button
                onClick={handleCancel}
                disabled={loading}
                style={{
                  padding: '7px 16px',
                  backgroundColor: '#f7fbfe',
                  border: '1.5px solid #d9eaf4',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: '#516881',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  fontWeight: '700',
                  whiteSpace: 'nowrap',
                }}
              >
                {loading ? '処理中...' : 'キャンセル'}
              </button>
            )
          ) : canApply ? (
            <button
              onClick={() => setShowModal(true)}
              disabled={loading}
              className="btn-coral"
              style={{
                padding: '7px 20px',
                borderRadius: '8px',
                fontSize: '13px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                fontWeight: '700',
                height: 'auto',
                whiteSpace: 'nowrap',
              }}
            >
              {loading ? '処理中...' : '申し込む'}
            </button>
          ) : reception.type === 'closed' ? null : null}
        </div>
      </div>

      {/* 申し込み確認モーダル */}
      {showModal && (
        <div
          style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)',
            zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              backgroundColor: '#fff', borderRadius: '16px',
              boxShadow: '8px 8px 0 rgba(81,104,129,0.2)',
              padding: '28px 28px 24px', maxWidth: '420px', width: '100%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#333', margin: '0 0 6px' }}>
              イベント申し込み確認
            </h3>
            <p style={{ fontSize: '14px', color: '#888', margin: '0 0 20px' }}>{event.title}</p>

            <p style={{ fontSize: '14px', fontWeight: '700', color: '#516881', margin: '0 0 12px' }}>
              受け取りを希望する項目を選択してください
            </p>

            {[
              { label: '交通費', state: wantsTransportFee, setState: setWantsTransportFee },
              { label: '謝金',   state: wantsHonorarium,  setState: setWantsHonorarium },
            ].map(({ label, state, setState }) => (
              <label
                key={label}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '12px 14px', borderRadius: '10px',
                  border: `2px solid ${state ? '#30b9bf' : '#e0e0e0'}`,
                  backgroundColor: state ? '#f0fffe' : '#fafafa',
                  cursor: 'pointer', marginBottom: '10px', transition: 'all 0.15s',
                }}
              >
                <input
                  type="checkbox" checked={state}
                  onChange={(e) => setState(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: '#30b9bf', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#333' }}>{label}</span>
                <span style={{ fontSize: '12px', color: '#888' }}>の受け取りを希望する</span>
              </label>
            ))}

            <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  flex: 1, padding: '10px', backgroundColor: '#f7fbfe',
                  border: '2px solid #d9eaf4', borderRadius: '10px',
                  fontSize: '14px', color: '#516881', cursor: 'pointer',
                  fontFamily: 'inherit', fontWeight: '700',
                }}
              >
                キャンセル
              </button>
              <button
                onClick={handleRegister}
                disabled={loading}
                className="btn-coral"
                style={{
                  flex: 1, padding: '10px', borderRadius: '10px',
                  fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', fontWeight: '700', height: 'auto',
                }}
              >
                {loading ? '処理中...' : '申し込む'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
