import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import NewEventForm from './NewEventForm'

export default async function NewEventPage() {
  const supabase = await createClient()

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

  return (
    <div style={{ minHeight: 'calc(100vh - 120px)', background: '#f7fbfe', padding: '40px 20px 60px' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>

        {/* パンくず */}
        <div style={{ fontSize: '13px', color: '#888', marginBottom: '24px' }}>
          <Link href="/admin" style={{ color: '#30b9bf' }}>管理者トップ</Link>
          {' › '}
          <Link href="/admin/events" style={{ color: '#30b9bf' }}>イベント管理</Link>
          {' › '}
          <span>新規作成</span>
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
              新規イベント作成
            </h1>
            <p style={{ fontSize: '14px', color: '#888', margin: 0 }}>
              ボランティアが参加できるイベントを追加します
            </p>
          </div>

          <NewEventForm />
        </div>
      </div>
    </div>
  )
}
