import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import WaveDivider from '../components/WaveDivider'
import EventCard from './EventCard'
import RegistrationCard from './RegistrationCard'

interface DashboardPageProps {
  searchParams: Promise<{ message?: string }>
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const supabase = await createClient()
  const params = await searchParams

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // プロフィール取得
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // 今後のイベント一覧（開催日が未来のもの）
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .gte('event_date', new Date().toISOString())
    .order('event_date', { ascending: true })

  // 自分の参加登録一覧
  const { data: myRegistrations } = await supabase
    .from('event_registrations')
    .select('*, events(*)')
    .eq('user_id', user.id)
    .order('registered_at', { ascending: false })

  const registeredEventIds = new Set(myRegistrations?.map((r) => r.event_id) || [])

  // 各イベントの参加者数
  const eventParticipantCounts: Record<string, number> = {}
  if (events && events.length > 0) {
    const { data: counts } = await supabase
      .from('event_registrations')
      .select('event_id')
      .in('event_id', events.map((e) => e.id))

    counts?.forEach((r) => {
      eventParticipantCounts[r.event_id] = (eventParticipantCounts[r.event_id] || 0) + 1
    })
  }

  return (
    <div>
      {/* ヘッダーセクション */}
      <section
        style={{
          background: 'linear-gradient(135deg, #f7fbfe 0%, #d9eaf4 100%)',
          padding: '48px 20px 40px',
        }}
      >
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          {params.message && (
            <div
              style={{
                backgroundColor: '#f0fffe',
                border: '2px solid #30b9bf',
                borderRadius: '10px',
                padding: '12px 16px',
                marginBottom: '24px',
                fontSize: '14px',
                color: '#1a8a8f',
              }}
            >
              ✓ {decodeURIComponent(params.message)}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <h1
                style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  color: '#516881',
                  margin: '0 0 8px',
                }}
              >
                ようこそ、{profile?.full_name || user.email} さん！
              </h1>
              <p style={{ fontSize: '14px', color: '#888', margin: 0 }}>
                ボランティア活動のダッシュボードです
              </p>
            </div>
          </div>

          {/* プロフィールカード */}
          {profile && (() => {
            const levelLabels = ['', '初級', '基礎', '中級', '上級', 'ネイティブ']
            return (
            <div
              style={{
                backgroundColor: '#fff',
                borderRadius: '16px',
                boxShadow: '5px 5px 0 rgba(81,104,129,0.15)',
                padding: '24px 28px',
                marginTop: '24px',
              }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-start' }}>
                <div style={{ flex: '1 1 200px' }}>
                  <p style={{ fontSize: '12px', color: '#888', margin: '0 0 4px' }}>氏名</p>
                  <p style={{ fontSize: '16px', fontWeight: '700', color: '#333', margin: 0 }}>
                    {profile.full_name}
                  </p>
                </div>
                <div style={{ flex: '1 1 200px' }}>
                  <p style={{ fontSize: '12px', color: '#888', margin: '0 0 4px' }}>メールアドレス</p>
                  <p style={{ fontSize: '14px', color: '#333', margin: 0 }}>{profile.email}</p>
                </div>
                {profile.phone && (
                  <div style={{ flex: '1 1 150px' }}>
                    <p style={{ fontSize: '12px', color: '#888', margin: '0 0 4px' }}>電話番号</p>
                    <p style={{ fontSize: '14px', color: '#333', margin: 0 }}>{profile.phone}</p>
                  </div>
                )}
                {profile.nationality && (
                  <div style={{ flex: '1 1 150px' }}>
                    <p style={{ fontSize: '12px', color: '#888', margin: '0 0 4px' }}>国籍</p>
                    <p style={{ fontSize: '14px', color: '#333', margin: 0 }}>{profile.nationality}</p>
                  </div>
                )}
                {profile.birthday && (
                  <div style={{ flex: '1 1 150px' }}>
                    <p style={{ fontSize: '12px', color: '#888', margin: '0 0 4px' }}>生年月日</p>
                    <p style={{ fontSize: '14px', color: '#333', margin: 0 }}>{profile.birthday}</p>
                  </div>
                )}
                {profile.japanese_level && (
                  <div style={{ flex: '1 1 150px' }}>
                    <p style={{ fontSize: '12px', color: '#888', margin: '0 0 4px' }}>日本語力</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="badge-teal">{profile.japanese_level}</span>
                      <span style={{ fontSize: '13px', color: '#333' }}>{levelLabels[profile.japanese_level]}</span>
                    </div>
                  </div>
                )}
                {profile.english_level && (
                  <div style={{ flex: '1 1 150px' }}>
                    <p style={{ fontSize: '12px', color: '#888', margin: '0 0 4px' }}>英語力</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="badge-teal">{profile.english_level}</span>
                      <span style={{ fontSize: '13px', color: '#333' }}>{levelLabels[profile.english_level]}</span>
                    </div>
                  </div>
                )}
                <div style={{ flex: '1 1 100%', borderTop: '1px solid #e8f0f7', paddingTop: '16px', marginTop: '4px' }}>
                  <p style={{ fontSize: '12px', color: '#888', margin: '0 0 8px' }}>謝金・交通費振込のための情報登録</p>
                  {profile.bank_name && profile.bank_branch && profile.bank_account_number && profile.bank_account_holder && profile.address && profile.nearest_station ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        backgroundColor: '#f0fffe',
                        border: '1.5px solid #30b9bf',
                        borderRadius: '6px',
                        padding: '4px 12px',
                        fontSize: '13px',
                        fontWeight: '700',
                        color: '#1a8a8f',
                      }}
                    >
                      ✓ 完了
                    </span>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          backgroundColor: '#fff8f0',
                          border: '1.5px solid #f4a44a',
                          borderRadius: '6px',
                          padding: '4px 12px',
                          fontSize: '13px',
                          fontWeight: '700',
                          color: '#c47b1a',
                        }}
                      >
                        ! 未完了
                      </span>
                      <Link
                        href="/profile"
                        style={{ fontSize: '12px', color: '#30b9bf', textDecoration: 'underline' }}
                      >
                        プロフィール編集から登録する
                      </Link>
                    </div>
                  )}
                </div>

                <div style={{ marginLeft: 'auto', alignSelf: 'flex-end' }}>
                  <Link
                    href="/profile"
                    className="btn-teal"
                    style={{ padding: '10px 20px', height: 'auto', width: 'auto', fontSize: '13px' }}
                  >
                    プロフィール編集
                  </Link>
                </div>
              </div>
            </div>
            )
          })()}
        </div>
      </section>

      <WaveDivider fromColor="#d9eaf4" toColor="#9fd9f6" />

      {/* イベント一覧 */}
      <section style={{ backgroundColor: '#9fd9f6', padding: '60px 20px' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div className="section-title" style={{ marginBottom: '32px' }}>
            <h2
              style={{
                fontSize: '26px',
                fontWeight: '700',
                color: '#516881',
                margin: '0 0 8px',
              }}
            >
              参加可能なイベント
            </h2>
            <p style={{ fontSize: '14px', color: '#516881', margin: 0 }}>
              興味のあるイベントに申し込みましょう
            </p>
          </div>

          {events && events.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {events.map((event) => {
                const myReg = myRegistrations?.find((r) => r.event_id === event.id)
                return (
                  <EventCard
                    key={event.id}
                    event={event}
                    isRegistered={registeredEventIds.has(event.id)}
                    participantCount={eventParticipantCounts[event.id] || 0}
                    registrationId={myReg?.id}
                    registrationStatus={(myReg as { status?: string } | undefined)?.status as 'applied' | 'selected' | 'rejected' | undefined}
                  />
                )
              })}
            </div>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 20px',
                backgroundColor: '#fff',
                borderRadius: '16px',
                boxShadow: '5px 5px 0 rgba(81,104,129,0.15)',
              }}
            >
              <p style={{ fontSize: '16px', color: '#888', margin: 0 }}>
                現在、参加可能なイベントはありません
              </p>
            </div>
          )}
        </div>
      </section>

      <WaveDivider fromColor="#9fd9f6" toColor="#fff" />

      {/* 参加履歴 */}
      <section style={{ backgroundColor: '#fff', padding: '60px 20px' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div className="section-title" style={{ marginBottom: '32px' }}>
            <h2
              style={{
                fontSize: '26px',
                fontWeight: '700',
                color: '#516881',
                margin: '0 0 8px',
              }}
            >
              参加履歴
            </h2>
            <p style={{ fontSize: '14px', color: '#888', margin: 0 }}>
              申し込んだイベントの一覧です
            </p>
          </div>

          {myRegistrations && myRegistrations.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {myRegistrations.map((registration) => (
                <RegistrationCard
                  key={registration.id}
                  registration={registration}
                />
              ))}
            </div>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 20px',
                backgroundColor: '#f7fbfe',
                borderRadius: '16px',
                border: '2px solid #d9eaf4',
              }}
            >
              <p style={{ fontSize: '16px', color: '#888', margin: '0 0 8px' }}>
                まだイベントに申し込んでいません
              </p>
              <p style={{ fontSize: '13px', color: '#aaa', margin: 0 }}>
                上のイベント一覧から申し込みましょう！
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
