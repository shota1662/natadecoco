'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { updateEvent, type EventState } from '../../../actions'

interface EditEventFormProps {
  event: {
    id: string
    title: string
    description: string | null
    location: string | null
    capacity: number | null
  }
  dateStr: string
  timeStr: string
}

export default function EditEventForm({ event, dateStr, timeStr }: EditEventFormProps) {
  const [state, formAction, isPending] = useActionState<EventState, FormData>(updateEvent, null)

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={event.id} />

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

      {/* イベント名 */}
      <div style={{ marginBottom: '24px' }}>
        <label
          htmlFor="title"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '700', color: '#516881', marginBottom: '8px' }}
        >
          イベント名
          <span className="badge-pink" style={{ fontSize: '10px', padding: '2px 7px' }}>必須</span>
        </label>
        <input
          className="form-input"
          type="text"
          id="title"
          name="title"
          defaultValue={event.title}
          required
        />
      </div>

      {/* 説明 */}
      <div style={{ marginBottom: '24px' }}>
        <label
          htmlFor="description"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '700', color: '#516881', marginBottom: '8px' }}
        >
          イベント説明
          <span style={{ backgroundColor: '#aaa', color: '#fff', fontSize: '10px', fontWeight: 'bold', padding: '2px 7px', borderRadius: '3px' }}>任意</span>
        </label>
        <textarea
          className="form-textarea"
          id="description"
          name="description"
          defaultValue={event.description ?? ''}
          style={{ minHeight: '100px' }}
        />
      </div>

      {/* 開催場所 */}
      <div style={{ marginBottom: '24px' }}>
        <label
          htmlFor="location"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '700', color: '#516881', marginBottom: '8px' }}
        >
          開催場所
          <span style={{ backgroundColor: '#aaa', color: '#fff', fontSize: '10px', fontWeight: 'bold', padding: '2px 7px', borderRadius: '3px' }}>任意</span>
        </label>
        <input
          className="form-input"
          type="text"
          id="location"
          name="location"
          defaultValue={event.location ?? ''}
        />
      </div>

      {/* 日付・時刻 */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 200px' }}>
          <label
            htmlFor="event_date"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '700', color: '#516881', marginBottom: '8px' }}
          >
            開催日
            <span className="badge-pink" style={{ fontSize: '10px', padding: '2px 7px' }}>必須</span>
          </label>
          <input
            className="form-input"
            type="date"
            id="event_date"
            name="event_date"
            defaultValue={dateStr}
            required
          />
        </div>
        <div style={{ flex: '1 1 160px' }}>
          <label
            htmlFor="event_time"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '700', color: '#516881', marginBottom: '8px' }}
          >
            開始時刻
            <span style={{ backgroundColor: '#aaa', color: '#fff', fontSize: '10px', fontWeight: 'bold', padding: '2px 7px', borderRadius: '3px' }}>任意</span>
          </label>
          <input
            className="form-input"
            type="time"
            id="event_time"
            name="event_time"
            defaultValue={timeStr}
          />
        </div>
      </div>

      {/* 定員 */}
      <div style={{ marginBottom: '36px' }}>
        <label
          htmlFor="capacity"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '700', color: '#516881', marginBottom: '8px' }}
        >
          定員
          <span style={{ backgroundColor: '#aaa', color: '#fff', fontSize: '10px', fontWeight: 'bold', padding: '2px 7px', borderRadius: '3px' }}>任意</span>
        </label>
        <input
          className="form-input"
          type="number"
          id="capacity"
          name="capacity"
          defaultValue={event.capacity ?? ''}
          placeholder="空白の場合は定員なし"
          min="1"
          style={{ maxWidth: '200px' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        <Link
          href={`/admin/events/${event.id}`}
          style={{
            padding: '12px 28px',
            backgroundColor: '#f0f0f0',
            borderRadius: '25px',
            fontSize: '14px',
            fontWeight: '700',
            color: '#666',
            textDecoration: 'none',
          }}
        >
          キャンセル
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="btn-teal"
          style={{ padding: '12px 36px', height: 'auto', width: 'auto', fontSize: '15px', opacity: isPending ? 0.7 : 1 }}
        >
          {isPending ? '更新中...' : '更新する'}
        </button>
      </div>
    </form>
  )
}
