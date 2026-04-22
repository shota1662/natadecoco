'use client'

import { useTransition } from 'react'
import { updateOrientationAttended } from '@/app/admin/actions'

interface Props {
  volunteerId: string
  attended: boolean
}

export default function AttendanceToggleButton({ volunteerId, attended }: Props) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await updateOrientationAttended(volunteerId, !attended)
        })
      }}
      style={{
        padding: '4px 12px',
        borderRadius: '6px',
        border: attended ? '1.5px solid #30b9bf' : '1.5px solid #d0d8e4',
        backgroundColor: attended ? '#f0fffe' : '#fff',
        color: attended ? '#1a8a8f' : '#888',
        fontSize: '12px',
        fontWeight: '700',
        cursor: isPending ? 'wait' : 'pointer',
        whiteSpace: 'nowrap',
        opacity: isPending ? 0.6 : 1,
        fontFamily: 'inherit',
      }}
    >
      {attended ? '✓ 参加済み' : '未参加'}
    </button>
  )
}
