import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import DeleteEventButton from './DeleteEventButton'

interface EventsPageProps {
  searchParams: Promise<{ success?: string; error?: string }>
}

export default async function AdminEventsPage({ searchParams }: EventsPageProps) {
  const supabase = await createClient()
  const params = await searchParams

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

  // 全イベント取得
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: false })

  // 各イベントの参加者数
  const participantCounts: Record<string, number> = {}
  if (events && events.length > 0) {
    const { data: counts } = await supabase
      .from('event_registrations')
      .select('event_id')
      .in('event_id', events.map((e) => e.id))
    counts?.forEach((r) => {
      participantCounts[r.event_id] = (participantCounts[r.event_id] || 0) + 1
    })
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 120px)', background: '#f7fbfe', padding: '40px 20px 60px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* パンくず */}
        <div style={{ fontSize: '13px', color: '#888', marginBottom: '24px' }}>
          <Link href="/admin" style={{ color: '#30b9bf' }}>管理者トップ</Link>
          {' › '}
          <span>イベント管理</span>
        </div>

        {/* ヘッダー */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#516881', margin: '0 0 4px' }}>
              イベント管理
            </h1>
            <p style={{ fontSize: '14px', color: '#888', margin: 0 }}>
              全{events?.length ?? 0}件のイベント
            </p>
          </div>
          <Link
            href="/admin/events/new"
            className="btn-coral"
            style={{ padding: '12px 28px', height: 'auto', width: 'auto', fontSize: '14px' }}
          >
            ＋ 新規イベント作成
          </Link>
        </div>

        {/* メッセージ */}
        {params.success && (
          <div
            style={{
              backgroundColor: '#f0fffe',
              border: '2px solid #30b9bf',
              borderRadius: '10px',
              padding: '12px 16px',
              marginBottom: '20px',
              fontSize: '14px',
              color: '#1a8a8f',
            }}
          >
            ✓ {decodeURIComponent(params.success)}
          </div>
        )}
        {params.error && (
          <div
            style={{
              backgroundColor: '#fff0f3',
              border: '2px solid #fe4c7f',
              borderRadius: '10px',
              padding: '12px 16px',
              marginBottom: '20px',
              fontSize: '14px',
              color: '#c0234a',
            }}
          >
            ⚠️ {decodeURIComponent(params.error)}
          </div>
        )}

        {/* イベントテーブル */}
        {events && events.length > 0 ? (
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: '16px',
              boxShadow: '5px 5px 0 rgba(81,104,129,0.15)',
              overflow: 'hidden',
            }}
          >
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '35%' }}>イベント名</th>
                  <th>開催日時</th>
                  <th>場所</th>
                  <th style={{ textAlign: 'center' }}>参加者</th>
                  <th style={{ textAlign: 'center' }}>定員</th>
                  <th style={{ textAlign: 'center' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => {
                  const date = new Date(event.event_date)
                  const isPast = date < new Date()
                  const count = participantCounts[event.id] || 0
                  const isFull = event.capacity !== null && count >= event.capacity

                  return (
                    <tr key={event.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          {isPast && (
                            <span style={{ backgroundColor: '#aaa', color: '#fff', fontSize: '10px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '3px' }}>
                              終了
                            </span>
                          )}
                          <span style={{ fontWeight: '600', fontSize: '14px' }}>{event.title}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: '13px', color: '#555', whiteSpace: 'nowrap' }}>
                        {date.toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: 'numeric',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td style={{ fontSize: '13px', color: '#555' }}>
                        {event.location || '—'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span
                          style={{
                            fontWeight: '700',
                            color: isFull ? '#fe4c7f' : '#333',
                            fontSize: '15px',
                          }}
                        >
                          {count}
                        </span>
                        <span style={{ fontSize: '12px', color: '#888' }}>名</span>
                      </td>
                      <td style={{ textAlign: 'center', fontSize: '13px', color: '#555' }}>
                        {event.capacity ? `${event.capacity}名` : '制限なし'}
                      </td>
                      <td>
                        <div
                          style={{
                            display: 'flex',
                            gap: '6px',
                            justifyContent: 'center',
                            flexWrap: 'wrap',
                          }}
                        >
                          <Link
                            href={`/admin/events/${event.id}`}
                            style={{
                              padding: '5px 12px',
                              backgroundColor: '#9fd9f6',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '700',
                              color: '#516881',
                              textDecoration: 'none',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            詳細
                          </Link>
                          <Link
                            href={`/admin/events/${event.id}/edit`}
                            style={{
                              padding: '5px 12px',
                              backgroundColor: '#f5f29f',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '700',
                              color: '#333',
                              textDecoration: 'none',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            編集
                          </Link>
                          <DeleteEventButton eventId={event.id} eventTitle={event.title} />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: '80px 20px',
              backgroundColor: '#fff',
              borderRadius: '16px',
              boxShadow: '5px 5px 0 rgba(81,104,129,0.15)',
            }}
          >
            <p style={{ fontSize: '16px', color: '#888', margin: '0 0 20px' }}>
              まだイベントが登録されていません
            </p>
            <Link
              href="/admin/events/new"
              className="btn-coral"
              style={{ margin: '0 auto', padding: '14px 36px', height: 'auto', width: 'auto', fontSize: '15px' }}
            >
              最初のイベントを作成する
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
