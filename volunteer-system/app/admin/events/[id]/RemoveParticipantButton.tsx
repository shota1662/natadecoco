'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { removeParticipant } from '../../actions'

interface RemoveParticipantButtonProps {
  registrationId: string
  participantName: string
}

export default function RemoveParticipantButton({
  registrationId,
  participantName,
}: RemoveParticipantButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleRemove = async () => {
    if (!confirm(`${participantName} さんの参加を取り消しますか？`)) return
    setLoading(true)
    const result = await removeParticipant(registrationId)
    if (result.error) {
      alert('取り消しに失敗しました: ' + result.error)
      setLoading(false)
    } else {
      router.refresh()
    }
  }

  return (
    <button
      onClick={handleRemove}
      disabled={loading}
      style={{
        padding: '5px 12px',
        backgroundColor: '#fff',
        border: '2px solid #f87a6d',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '700',
        color: '#f87a6d',
        cursor: loading ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit',
        whiteSpace: 'nowrap',
        transition: 'all 0.2s',
      }}
    >
      {loading ? '処理中...' : '取り消し'}
    </button>
  )
}
