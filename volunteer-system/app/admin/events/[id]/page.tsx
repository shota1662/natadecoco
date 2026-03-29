import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import RemoveParticipantButton from './RemoveParticipantButton'

interface EventDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function AdminEventDetailPage({ params }: EventDetailPageProps) {
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

  // イベント取得
  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (!event) notFound()

  // 参加者一覧取得
  const { data: registrations } = await supabase
    .from('event_registrations')
    .select('*, profiles(*)')
    .eq('event_id', id)
    .order('registered_at', { ascending: true })

  const eventDate = new Date(event.event_date)
  const isPast = eventDate < new Date()
  const levelLabels = ['', '初級', '基礎', '中級', '上級', 'ネイティブ']

  return (
    <div style={{ minHeight: 'calc(100vh - 120px)', background: '#f7fbfe', padding: '40px 20px 60px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* パンくず */}
        <div style={{ fontSize: '13px', color: '#888', marginBottom: '24px' }}>
          <Link href="/admin" style={{ color: '#30b9bf' }}>管理者トップ</Link>
          {' › '}
          <Link href="/admin/events" style={{ color: '#30b9bf' }}>イベント管理</Link>
          {' › '}
          <span>{event.title}</span>
        </div>

        {/* イベント情報 */}
        <div
          style={{
            backgroundColor: '#fff',
            borderRadius: '16px',
            boxShadow: '5px 5px 0 rgba(81,104,129,0.15)',
            overflow: 'hidden',
            marginBottom: '28px',
          }}
        >
          <div
            style={{
              height: '8px',
              backgroundColor: isPast ? '#aaa' : '#fe4c7f',
            }}
          />
          <div style={{ padding: '28px 32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  {isPast && (
                    <span style={{ backgroundColor: '#aaa', color: '#fff', fontSize: '11px', fontWeight: 'bold', padding: '3px 10px', borderRadius: '3px' }}>
                      終了
                    </span>
                  )}
                </div>
                <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#333', margin: '0 0 16px' }}>
                  {event.title}
                </h1>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', fontSize: '14px', color: '#555' }}>
                  <div>
                    📅{' '}
                    {eventDate.toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      weekday: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                  {event.location && <div>📍 {event.location}</div>}
                  <div>
                    👥 参加者: {registrations?.length ?? 0}名
                    {event.capacity && ` / 定員 ${event.capacity}名`}
                  </div>
                </div>
                {event.description && (
                  <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.8, margin: '16px 0 0', whiteSpace: 'pre-wrap' }}>
                    {event.description}
                  </p>
                )}
              </div>
              <Link
                href={`/admin/events/${event.id}/edit`}
                className="btn-primary"
                style={{ padding: '10px 24px', height: 'auto', width: 'auto', fontSize: '14px', flexShrink: 0 }}
              >
                編集する
              </Link>
            </div>
          </div>
        </div>

        {/* 参加者一覧 */}
        <div
          style={{
            backgroundColor: '#fff',
            borderRadius: '16px',
            boxShadow: '5px 5px 0 rgba(81,104,129,0.15)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '20px 28px',
              borderBottom: '2px solid #f0f0f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#516881', margin: 0 }}>
              参加者一覧
              <span style={{ fontSize: '14px', color: '#888', fontWeight: '400', marginLeft: '8px' }}>
                {registrations?.length ?? 0}名
              </span>
            </h2>
          </div>

          {registrations && registrations.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>氏名</th>
                  <th>メールアドレス</th>
                  <th>国籍</th>
                  <th style={{ textAlign: 'center' }}>日本語力</th>
                  <th style={{ textAlign: 'center' }}>英語力</th>
                  <th>申込日</th>
                  <th style={{ textAlign: 'center' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((reg) => {
                  const p = reg.profiles as {
                    full_name?: string
                    email?: string
                    nationality?: string
                    japanese_level?: number
                    english_level?: number
                  } | null
                  return (
                    <tr key={reg.id}>
                      <td style={{ fontWeight: '600', fontSize: '14px' }}>{p?.full_name ?? '—'}</td>
                      <td style={{ fontSize: '13px', color: '#555' }}>{p?.email ?? '—'}</td>
                      <td style={{ fontSize: '13px', color: '#555' }}>{p?.nationality ?? '—'}</td>
                      <td style={{ textAlign: 'center' }}>
                        {p?.japanese_level ? (
                          <span className="badge-teal">{p.japanese_level}</span>
                        ) : '—'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {p?.english_level ? (
                          <span className="badge-primary">{p.english_level}</span>
                        ) : '—'}
                      </td>
                      <td style={{ fontSize: '13px', color: '#888' }}>
                        {new Date(reg.registered_at).toLocaleDateString('ja-JP')}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <RemoveParticipantButton
                          registrationId={reg.id}
                          participantName={p?.full_name ?? 'このユーザー'}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <div style={{ textAlign: 'center', padding: '48px 20px' }}>
              <p style={{ fontSize: '15px', color: '#888', margin: 0 }}>
                まだ参加者がいません
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
