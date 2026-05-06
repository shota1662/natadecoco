'use client'

import { useState, useTransition } from 'react'
import { updateOrientationAttended } from '@/app/admin/actions'

interface Props {
  volunteerId: string
  attended: boolean
}

export default function AttendanceToggleButton({ volunteerId, attended }: Props) {
  const [currentAttended, setCurrentAttended] = useState(attended)
  const [isPending, startTransition] = useTransition()

  return (
    <button
      disabled={isPending}
      onClick={() => {
        const next = !currentAttended
        setCurrentAttended(next)
        startTransition(async () => {
          const result = await updateOrientationAttended(volunteerId, next)
          if (result?.error) {
            setCurrentAttended(!next)
          }
        })
      }}
      style={{
        padding: '4px 12px',
        borderRadius: '6px',
        border: currentAttended ? '1.5px solid #30b9bf' : '1.5px solid #d0d8e4',
        backgroundColor: currentAttended ? '#f0fffe' : '#fff',
        color: currentAttended ? '#1a8a8f' : '#888',
        fontSize: '12px',
        fontWeight: '700',
        cursor: isPending ? 'wait' : 'pointer',
        whiteSpace: 'nowrap',
        opacity: isPending ? 0.6 : 1,
        fontFamily: 'inherit',
      }}
    >
      {currentAttended ? '✓ 参加済み' : '未参加'}
    </button>
  )
}
