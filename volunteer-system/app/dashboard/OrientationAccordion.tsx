'use client'

import { useState } from 'react'
import { saveOrientationDate } from './actions'

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

interface Props {
  currentDate?: string | null
}

export default function OrientationAccordion({ currentDate }: Props) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(currentDate ?? '')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!selected) return
    setLoading(true)
    setError(null)
    setSuccess(false)
    const result = await saveOrientationDate(selected)
    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        setOpen(false)
      }, 1500)
    }
    setLoading(false)
  }

  return (
    <div style={{ marginTop: '16px' }}>
      {/* トグルボタン */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '13px',
          color: '#30b9bf',
          fontWeight: '700',
          fontFamily: 'inherit',
          padding: '4px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <span style={{ fontSize: '11px', transition: 'transform 0.2s', display: 'inline-block', transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
        説明会はこちら
      </button>

      {/* アコーディオン本体 */}
      {open && (
        <div
          style={{
            marginTop: '12px',
            backgroundColor: '#fff',
            borderRadius: '14px',
            border: '1.5px solid #9fd9f6',
            padding: '20px 24px',
          }}
        >
          <p style={{ fontSize: '13px', fontWeight: '700', color: '#516881', margin: '0 0 4px' }}>
            ボランティア説明会
          </p>
          <p style={{ fontSize: '12px', color: '#888', margin: '0 0 16px', lineHeight: 1.7 }}>
            月1回開催のオンライン説明会です。ご都合の良い日程を選んでください。<br />
            ※日時変更の可能性あり。予定が合わない場合は個別対応も可能です。
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            {SESSIONS.map((s) => (
              <label
                key={s.date}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  border: `1.5px solid ${selected === s.date ? '#30b9bf' : '#e0eef7'}`,
                  borderRadius: '8px',
                  backgroundColor: selected === s.date ? '#f0fbfc' : '#fafcfe',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <input
                  type="radio"
                  name="orientation_accordion"
                  value={s.date}
                  checked={selected === s.date}
                  onChange={() => setSelected(s.date)}
                  style={{ accentColor: '#30b9bf', width: '16px', height: '16px', flexShrink: 0 }}
                />
                <span style={{ fontSize: '13px', color: selected === s.date ? '#1a8a8f' : '#444', fontWeight: selected === s.date ? '700' : '400' }}>
                  {s.label}
                </span>
              </label>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={handleSubmit}
              disabled={loading || !selected}
              style={{
                padding: '9px 24px',
                backgroundColor: '#30b9bf',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '13px',
                fontWeight: '700',
                cursor: loading || !selected ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                opacity: loading || !selected ? 0.5 : 1,
              }}
            >
              {loading ? '保存中...' : '申し込む'}
            </button>
            {success && <span style={{ fontSize: '13px', color: '#1a8a8f', fontWeight: '700' }}>✓ 申し込みました</span>}
            {error && <span style={{ fontSize: '13px', color: '#c0234a' }}>⚠️ {error}</span>}
          </div>
        </div>
      )}
    </div>
  )
}
