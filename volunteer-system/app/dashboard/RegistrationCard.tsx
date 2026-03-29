'use client'

import { useState } from 'react'
import { cancelRegistration } from './actions'
import type { EventRegistration } from '@/lib/types'

interface RegistrationCardProps {
  registration: EventRegistration & { events: { id: string; title: string; event_date: string; location: string | null } | null }
}

export default function RegistrationCard({ registration }: RegistrationCardProps) {
  const [loading, setLoading] = useState(false)
  const [cancelled, setCancelled] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (cancelled) return null

  const event = registration.events
  if (!event) return null

  const eventDate = new Date(event.event_date)
  const isPast = eventDate < new Date()

  const handleCancel = async () => {
    if (!confirm('申し込みをキャンセルしますか？')) return
    setLoading(true)
    setError(null)
    const result = await cancelRegistration(registration.id)
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setCancelled(true)
    }
  }

  return (
    <div
      style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        border: `2px solid ${isPast ? '#e5e7eb' : '#d9eaf4'}`,
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        opacity: isPast ? 0.7 : 1,
      }}
    >
      <div style={{ flex: 1, minWidth: '200px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          {isPast ? (
            <span style={{ backgroundColor: '#aaa', color: '#fff', fontSize: '11px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '3px' }}>
              終了
            </span>
          ) : (
            <span className="badge-teal">申込済み</span>
          )}
          <span style={{ fontSize: '12px', color: '#aaa' }}>
            申込日: {new Date(registration.registered_at).toLocaleDateString('ja-JP')}
          </span>
        </div>
        <h3
          style={{
            fontSize: '16px',
            fontWeight: '700',
            color: '#333',
            margin: '0 0 4px',
          }}
        >
          {event.title}
        </h3>
        <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>
          📅{' '}
          {eventDate.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })}
          {event.location && ` ／ 📍 ${event.location}`}
        </p>
        {error && <p style={{ fontSize: '12px', color: '#fe4c7f', margin: '4px 0 0' }}>⚠️ {error}</p>}
      </div>

      {!isPast && (
        <button
          onClick={handleCancel}
          disabled={loading}
          style={{
            padding: '8px 16px',
            backgroundColor: '#fff',
            border: '2px solid #fe4c7f',
            borderRadius: '8px',
            fontSize: '13px',
            color: '#fe4c7f',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
            fontWeight: '700',
            transition: 'all 0.2s',
            flexShrink: 0,
          }}
        >
          {loading ? '処理中...' : 'キャンセル'}
        </button>
      )}
    </div>
  )
}
