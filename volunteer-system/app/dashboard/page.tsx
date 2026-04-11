import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import WaveDivider from '../components/WaveDivider'
import EventCard from './EventCard'
import RegistrationCard from './RegistrationCard'
import OrientationAccordion from './OrientationAccordion'

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

  // 初回ログイン：プロフィール未入力の場合は詳細入力画面へ
  if (!profile?.full_name) {
    redirect('/register/details')
  }

  const now = new Date().toISOString()

  // 今後のイベント一覧
  const { data: futureEvents } = await supabase
    .from('events')
    .select('*')
    .gte('event_date', now)
    .order('event_date', { ascending: true })

  // 自分の参加登録（全期間）
  const { data: myRegistrations } = await supabase
    .from('event_registrations')
    .select('*, events(*)')
    .eq('user_id', user.id)
    .order('registered_at', { ascending: false })

  const registeredEventIds = new Set(myRegistrations?.map((r) => r.event_id) || [])

  // ① 参加予定のイベント：未来のイベントかつ当選済み（selected）
  const upcomingRegistrations = (myRegistrations || []).filter((r) => {
    const ev = r.events as { event_date: string } | null
    return ev && new Date(ev.event_date) >= new Date() && (r as { status?: string }).status === 'selected'
  })

  // ② 参加受付中のイベント：未来のイベントのうち、未申込・申込中・落選
  const selectedEventIds = new Set(upcomingRegistrations.map((r) => r.event_id))
  const openEvents = (futureEvents || []).filter((e) => !selectedEventIds.has(e.id))

  // ③ 過去参加したイベント：過去のイベントかつ申込済み
  const pastRegistrations = (myRegistrations || []).filter((r) => {
    const ev = r.events as { event_date: string } | null
    return ev && new Date(ev.event_date) < new Date()
  })

  // 各イベントの参加者数
  const eventParticipantCounts: Record<string, number> = {}
  if (futureEvents && futureEvents.length > 0) {
    const { data: counts } = await supabase
      .from('event_registrations')
      .select('event_id')
      .in('event_id', futureEvents.map((e) => e.id))

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
              <h1 className="dashboard-welcome-title">
                ようこそ、{profile?.full_name || user.email} さん！
              </h1>
              <p style={{ fontSize: '14px', color: '#888', margin: 0 }}>
                ボランティア活動のマイページです
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
                {/* 謝金・交通費情報登録 */}
                <div style={{ flex: '1 1 100%', borderTop: '1px solid #e8f0f7', paddingTop: '16px', marginTop: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>謝金・交通費振込のための情報登録</p>
                      {profile.bank_name && profile.bank_branch && profile.bank_account_number && profile.bank_account_holder && profile.address && profile.nearest_station ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: '#f0fffe', border: '1.5px solid #30b9bf', borderRadius: '6px', padding: '4px 12px', fontSize: '13px', fontWeight: '700', color: '#1a8a8f' }}>
                          ✓ 完了
                        </span>
                      ) : (
                        <>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: '#fff8f0', border: '1.5px solid #f4a44a', borderRadius: '6px', padding: '4px 12px', fontSize: '13px', fontWeight: '700', color: '#c47b1a' }}>
                            ! 未完了
                          </span>
                          <Link href="/profile" style={{ fontSize: '12px', color: '#30b9bf', textDecoration: 'underline' }}>
                            プロフィール編集から登録する
                          </Link>
                        </>
                      )}
                  </div>
                </div>

                {/* ボランティア説明会参加 */}
                <div style={{ flex: '1 1 100%', borderTop: '1px solid #e8f0f7', paddingTop: '16px', marginTop: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>ボランティア説明会参加</p>
                    {profile.orientation_attended ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: '#f0fffe', border: '1.5px solid #30b9bf', borderRadius: '6px', padding: '4px 12px', fontSize: '13px', fontWeight: '700', color: '#1a8a8f' }}>
                        ✓ 参加済み
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: '#fff8f0', border: '1.5px solid #f4a44a', borderRadius: '6px', padding: '4px 12px', fontSize: '13px', fontWeight: '700', color: '#c47b1a' }}>
                        ! 未参加
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            )
          })()}
        </div>
      </section>

      <WaveDivider fromColor="#d9eaf4" toColor="#9fd9f6" />

      {/* ① 参加予定のイベント */}
      <section style={{ backgroundColor: '#9fd9f6', padding: '60px 20px' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#516881', margin: '0 0 6px' }}>
              ① 参加予定のイベント
            </h2>
            <p style={{ fontSize: '13px', color: '#516881', margin: 0 }}>
              今後参加予定の説明会やイベントです
            </p>
          </div>

          {(() => {
            const orientationDate = profile?.orientation_date
            const isOrientationFuture = orientationDate && new Date(orientationDate) >= new Date()
            const hasUpcoming = upcomingRegistrations.length > 0 || isOrientationFuture

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* 説明会カード */}
                {isOrientationFuture && (
                  <div style={{
                    backgroundColor: '#fff',
                    borderRadius: '14px',
                    boxShadow: '3px 3px rgba(81,104,129,0.12)',
                    overflow: 'hidden',
                    display: 'flex',
                    borderLeft: '5px solid #30b9bf',
                  }}>
                    <div style={{ flex: 1, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                      <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '6px', border: '1.5px solid #30b9bf', backgroundColor: '#f0fffe', color: '#1a8a8f', fontSize: '12px', fontWeight: '700', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        説明会
                      </span>
                      <div style={{ flex: 1, minWidth: '180px' }}>
                        <p style={{ fontSize: '15px', fontWeight: '700', color: '#333', margin: '0 0 4px' }}>
                          ボランティア説明会
                        </p>
                        <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>
                          📅 {new Date(orientationDate).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}　20:00-20:45　オンライン
                        </p>
                      </div>
                      <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '6px', border: '1.5px solid #9fb8cc', backgroundColor: '#f0f4f8', color: '#516881', fontSize: '12px', fontWeight: '700', whiteSpace: 'nowrap' }}>
                        申込済み
                      </span>
                    </div>
                  </div>
                )}

                {/* 当選イベント */}
                {upcomingRegistrations.map((reg) => {
                  const ev = reg.events as Parameters<typeof EventCard>[0]['event'] | null
                  if (!ev) return null
                  return (
                    <EventCard
                      key={reg.id}
                      event={ev}
                      isRegistered={true}
                      participantCount={eventParticipantCounts[ev.id] || 0}
                      registrationId={reg.id}
                      registrationStatus={(reg as { status?: string }).status as 'applied' | 'selected' | 'rejected' | undefined}
                    />
                  )
                })}

                {!hasUpcoming && (
                  <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#fff', borderRadius: '16px' }}>
                    <p style={{ fontSize: '15px', color: '#888', margin: 0 }}>参加予定のイベントはありません</p>
                  </div>
                )}
              </div>
            )
          })()}
        </div>
      </section>

      <WaveDivider fromColor="#9fd9f6" toColor="#fff" />

      {/* ② 今後のイベント予定 */}
      <section style={{ backgroundColor: '#fff', padding: '60px 20px 30px' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#516881', margin: '0 0 6px' }}>
              ② 今後のイベント予定
            </h2>
            <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>
              興味のあるイベントに申し込みましょう！人数制限のあるイベントについては、記載の期日までに参加の可否をご連絡いたします。
            </p>
          </div>

          {openEvents.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {openEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  isRegistered={false}
                  participantCount={eventParticipantCounts[event.id] || 0}
                />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#f7fbfe', borderRadius: '16px', border: '2px solid #d9eaf4' }}>
              <p style={{ fontSize: '15px', color: '#888', margin: 0 }}>現在受付中のイベントはありません</p>
            </div>
          )}

          <OrientationAccordion currentDate={profile?.orientation_date} />
        </div>
      </section>

      <WaveDivider fromColor="#fff" toColor="#f7fbfe" />

      {/* ③ 過去参加したイベント */}
      <section style={{ backgroundColor: '#f7fbfe', padding: '30px 20px 60px' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#516881', margin: '0 0 6px' }}>
              ③ 過去参加したイベント
            </h2>
            <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>
              これまでに参加したイベントの履歴です
            </p>
          </div>

          {pastRegistrations.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pastRegistrations.map((registration) => (
                <RegistrationCard
                  key={registration.id}
                  registration={registration}
                />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#fff', borderRadius: '16px', border: '2px solid #e5e7eb' }}>
              <p style={{ fontSize: '15px', color: '#888', margin: 0 }}>過去の参加履歴はありません</p>
            </div>
          )}

          {/* お問い合わせ */}
          <div style={{ marginTop: '48px', textAlign: 'center' }}>
            <a
              href="/contact.html"
              className="btn-teal"
              style={{ display: 'inline-flex', padding: '12px 36px', fontSize: '14px', height: 'auto', width: 'auto' }}
            >
              お問い合わせ
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
