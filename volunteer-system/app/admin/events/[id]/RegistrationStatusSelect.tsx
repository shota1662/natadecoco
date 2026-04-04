'use client'

import { useState } from 'react'
import { updateRegistrationStatus } from '../../actions'

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
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const current = STATUS_OPTIONS.find((o) => o.value === status)!

  const handleChange = async (newStatus: 'applied' | 'selected' | 'rejected') => {
    if (newStatus === status) return
    setLoading(true)
    setErrorMsg(null)
    const result = await updateRegistrationStatus(registrationId, newStatus)
    if (result.error) {
      setErrorMsg(result.error)
    } else {
      setStatus(newStatus)
    }
    setLoading(false)
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {errorMsg && (
        <div style={{ position: 'absolute', bottom: '110%', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#fff0f3', border: '1px solid #fe4c7f', borderRadius: '6px', padding: '4px 8px', fontSize: '11px', color: '#c0234a', whiteSpace: 'nowrap', zIndex: 10 }}>
          {errorMsg}
        </div>
      )}
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
      <span style={{
        position: 'absolute', right: '8px', top: '50%',
        transform: 'translateY(-50%)', pointerEvents: 'none',
        fontSize: '10px', color: current.color,
      }}>▾</span>
    </div>
  )
}
