import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import EditEventForm from './EditEventForm'

interface EditEventPageProps {
  params: Promise<{ id: string }>
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const supabase = await createClient()
  const { id } = await params

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (!event) notFound()

  const eventDate = new Date(event.event_date)
  const dateStr = eventDate.toISOString().split('T')[0]
  const timeStr = eventDate.toTimeString().slice(0, 5)

  return (
    <div style={{ minHeight: 'calc(100vh - 120px)', background: '#f7fbfe', padding: '40px 20px 60px' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>

        {/* パンくず */}
        <div style={{ fontSize: '13px', color: '#888', marginBottom: '24px' }}>
          <Link href="/admin" style={{ color: '#30b9bf' }}>管理者トップ</Link>
          {' › '}
          <Link href="/admin/events" style={{ color: '#30b9bf' }}>イベント管理</Link>
          {' › '}
          <Link href={`/admin/events/${id}`} style={{ color: '#30b9bf' }}>{event.title}</Link>
          {' › '}
          <span>編集</span>
        </div>

        <div
          style={{
            backgroundColor: '#fff',
            borderRadius: '20px',
            boxShadow: '8px 8px 0 rgba(81,104,129,0.15)',
            padding: '40px',
          }}
        >
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#516881', margin: '0 0 6px' }}>
              イベント編集
            </h1>
            <p style={{ fontSize: '14px', color: '#888', margin: 0 }}>
              イベント情報を更新します
            </p>
          </div>

          <EditEventForm event={event} dateStr={dateStr} timeStr={timeStr} />
        </div>
      </div>
    </div>
  )
}
