'use client'

import { useState } from 'react'
import { registerForEvent, cancelRegistration } from './actions'
import type { Event } from '@/lib/types'

interface EventCardProps {
  event: Event
  isRegistered: boolean
  participantCount: number
  registrationId?: string
}

export default function EventCard({
  event,
  isRegistered,
  participantCount,
  registrationId,
}: EventCardProps) {
  const [loading, setLoading] = useState(false)
  const [registered, setRegistered] = useState(isRegistered)
  const [regId, setRegId] = useState(registrationId)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [wantsTransportFee, setWantsTransportFee] = useState(false)
  const [wantsHonorarium, setWantsHonorarium] = useState(false)

  const eventDate = new Date(event.event_date)
  const isPast = eventDate < new Date()
  const isFull = event.capacity !== null && participantCount >= event.capacity

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

  return (
    <div
      style={{
        backgroundColor: '#fff',
        borderRadius: '16px',
        boxShadow: '5px 5px 0 rgba(81,104,129,0.2)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
    >
      {/* カラーバー */}
      <div
        style={{
          height: '6px',
          backgroundColor: registered ? '#30b9bf' : isPast ? '#aaa' : '#fe4c7f',
        }}
      />

      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* ステータスバッジ */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
          {registered && <span className="badge-teal">申込済み</span>}
          {isFull && !registered && <span className="badge-primary">満員</span>}
          {isPast && <span style={{ backgroundColor: '#aaa', color: '#fff', fontSize: '11px', fontWeight: 'bold', padding: '3px 10px', borderRadius: '3px' }}>終了</span>}
        </div>

        {/* タイトル */}
        <h3
          style={{
            fontSize: '17px',
            fontWeight: '700',
            color: '#333',
            margin: '0 0 12px',
            lineHeight: 1.4,
          }}
        >
          {event.title}
        </h3>

        {/* 詳細情報 */}
        <div style={{ fontSize: '13px', color: '#666', lineHeight: 2, flex: 1 }}>
          <div>
            📅{' '}
            {eventDate.toLocaleDateString('ja-JP', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
          {event.location && <div>📍 {event.location}</div>}
          <div>
            👥 参加者: {participantCount}名
            {event.capacity && ` / ${event.capacity}名`}
          </div>
          {event.description && (
            <p
              style={{
                fontSize: '13px',
                color: '#888',
                margin: '8px 0 0',
                lineHeight: 1.7,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {event.description}
            </p>
          )}
        </div>

        {/* エラー表示 */}
        {error && (
          <p style={{ fontSize: '12px', color: '#fe4c7f', margin: '8px 0 0' }}>⚠️ {error}</p>
        )}

        {/* ボタン */}
        {!isPast && (
          <div style={{ marginTop: '16px' }}>
            {registered ? (
              <button
                onClick={handleCancel}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#f7fbfe',
                  border: '2px solid #d9eaf4',
                  borderRadius: '10px',
                  fontSize: '14px',
                  color: '#516881',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  fontWeight: '700',
                  transition: 'all 0.2s',
                }}
              >
                {loading ? '処理中...' : '申し込みをキャンセル'}
              </button>
            ) : (
              <button
                onClick={() => setShowModal(true)}
                disabled={loading || isFull}
                className={isFull ? '' : 'btn-coral'}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  cursor: loading || isFull ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  fontWeight: '700',
                  height: 'auto',
                  opacity: isFull ? 0.5 : 1,
                  ...(isFull
                    ? {
                        backgroundColor: '#f0f0f0',
                        border: '2px solid #ddd',
                        color: '#888',
                        boxShadow: 'none',
                      }
                    : {}),
                }}
              >
                {loading ? '処理中...' : isFull ? '満員のため申し込み不可' : '申し込む'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* 申し込み確認モーダル */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: '16px',
              boxShadow: '8px 8px 0 rgba(81,104,129,0.2)',
              padding: '28px 28px 24px',
              maxWidth: '420px',
              width: '100%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#333', margin: '0 0 6px' }}>
              イベント申し込み確認
            </h3>
            <p style={{ fontSize: '14px', color: '#888', margin: '0 0 20px' }}>
              {event.title}
            </p>

            <p style={{ fontSize: '14px', fontWeight: '700', color: '#516881', margin: '0 0 12px' }}>
              受け取りを希望する項目を選択してください
            </p>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 14px',
                borderRadius: '10px',
                border: `2px solid ${wantsTransportFee ? '#30b9bf' : '#e0e0e0'}`,
                backgroundColor: wantsTransportFee ? '#f0fffe' : '#fafafa',
                cursor: 'pointer',
                marginBottom: '10px',
                transition: 'all 0.15s',
              }}
            >
              <input
                type="checkbox"
                checked={wantsTransportFee}
                onChange={(e) => setWantsTransportFee(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#30b9bf', cursor: 'pointer' }}
              />
              <div>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#333' }}>交通費</span>
                <span style={{ fontSize: '12px', color: '#888', marginLeft: '8px' }}>の受け取りを希望する</span>
              </div>
            </label>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 14px',
                borderRadius: '10px',
                border: `2px solid ${wantsHonorarium ? '#30b9bf' : '#e0e0e0'}`,
                backgroundColor: wantsHonorarium ? '#f0fffe' : '#fafafa',
                cursor: 'pointer',
                marginBottom: '24px',
                transition: 'all 0.15s',
              }}
            >
              <input
                type="checkbox"
                checked={wantsHonorarium}
                onChange={(e) => setWantsHonorarium(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#30b9bf', cursor: 'pointer' }}
              />
              <div>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#333' }}>謝金</span>
                <span style={{ fontSize: '12px', color: '#888', marginLeft: '8px' }}>の受け取りを希望する</span>
              </div>
            </label>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#f7fbfe',
                  border: '2px solid #d9eaf4',
                  borderRadius: '10px',
                  fontSize: '14px',
                  color: '#516881',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontWeight: '700',
                }}
              >
                キャンセル
              </button>
              <button
                onClick={handleRegister}
                disabled={loading}
                className="btn-coral"
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  fontWeight: '700',
                  height: 'auto',
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
