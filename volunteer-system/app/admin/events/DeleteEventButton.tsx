'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteEvent } from '../actions'

interface DeleteEventButtonProps {
  eventId: string
  eventTitle: string
}

export default function DeleteEventButton({ eventId, eventTitle }: DeleteEventButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm(`「${eventTitle}」を削除しますか？\n参加者の申し込みデータも全て削除されます。`)) return

    setLoading(true)
    const result = await deleteEvent(eventId)
    if (result.error) {
      alert('削除に失敗しました: ' + result.error)
      setLoading(false)
    } else {
      router.refresh()
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      style={{
        padding: '5px 12px',
        backgroundColor: '#fff',
        border: '2px solid #fe4c7f',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '700',
        color: '#fe4c7f',
        cursor: loading ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit',
        whiteSpace: 'nowrap',
        transition: 'all 0.2s',
      }}
    >
      {loading ? '削除中...' : '削除'}
    </button>
  )
}
