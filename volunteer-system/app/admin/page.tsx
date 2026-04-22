import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import WaveDivider from '../components/WaveDivider'

// キャッシュを無効化して毎回サーバーで再評価させる
export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // RLS をバイパスして確実にロールを取得する
  const adminClient = createAdminClient()
  const { data: profile, error: profileError } = await (adminClient ?? supabase)
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  // 統計情報取得
  const [
    { count: volunteerCount },
    { count: eventCount },
    { count: registrationCount },
    { data: upcomingEvents },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'volunteer'),
    supabase.from('events').select('*', { count: 'exact', head: true }),
    supabase.from('event_registrations').select('*', { count: 'exact', head: true }),
    supabase
      .from('events')
      .select('*')
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true })
      .limit(5),
  ])

  const stats = [
    { label: 'ボランティア数', value: volunteerCount ?? 0, color: '#fe4c7f', icon: '👥' },
    { label: 'イベント数', value: eventCount ?? 0, color: '#30b9bf', icon: '📅' },
    { label: '申し込み総数', value: registrationCount ?? 0, color: '#f87a6d', icon: '✅' },
  ]

  return (
    <div>
      {/* ヘッダー */}
      <section
        style={{
          background: 'linear-gradient(135deg, #516881 0%, #3d5068 100%)',
          padding: '48px 20px 40px',
          color: '#fff',
        }}
      >
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div
            style={{
              display: 'inline-block',
              backgroundColor: 'rgba(255,255,255,0.15)',
              borderRadius: '20px',
              padding: '4px 16px',
              fontSize: '12px',
              fontWeight: '700',
              marginBottom: '16px',
              letterSpacing: '0.1em',
            }}
          >
            👑 管理者ページ
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: '700', margin: '0 0 8px' }}>
            管理ダッシュボード
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)', margin: 0 }}>
            ボランティア・イベントの管理を行います
          </p>
        </div>
      </section>

      <WaveDivider fromColor="#3d5068" toColor="#9fd9f6" />

      {/* 統計カード */}
      <section style={{ backgroundColor: '#9fd9f6', padding: '48px 20px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              marginBottom: '40px',
            }}
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '16px',
                  boxShadow: '5px 5px 0 rgba(81,104,129,0.2)',
                  padding: '28px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                }}
              >
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    backgroundColor: stat.color,
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '26px',
                    flexShrink: 0,
                  }}
                >
                  {stat.icon}
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#888', margin: '0 0 4px' }}>{stat.label}</p>
                  <p
                    style={{
                      fontSize: '32px',
                      fontWeight: '700',
                      color: '#516881',
                      margin: 0,
                      lineHeight: 1,
                    }}
                  >
                    {stat.value}
                    <span style={{ fontSize: '16px', marginLeft: '4px' }}>件</span>
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* クイックリンク */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '16px',
            }}
          >
            {[
              {
                href: '/admin/events/new',
                label: '新規イベント作成',
                desc: '新しいイベントを追加します',
                color: '#fe4c7f',
                icon: '➕',
              },
              {
                href: '/admin/events',
                label: 'イベント管理',
                desc: 'イベントの編集・削除',
                color: '#30b9bf',
                icon: '📋',
              },
              {
                href: '/admin/volunteers',
                label: 'ボランティア一覧',
                desc: '登録ボランティアの管理',
                color: '#f87a6d',
                icon: '👥',
              },
              {
                href: '/admin/orientations',
                label: '説明会管理',
                desc: '日程別の申込み・出席管理',
                color: '#f4a44a',
                icon: '📋',
              },
              {
                href: '/admin/email-templates',
                label: 'メールテンプレート',
                desc: '当選・落選メールの文面編集',
                color: '#a78bfa',
                icon: '✉️',
              },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '14px',
                  boxShadow: '5px 5px 0 rgba(81,104,129,0.2)',
                  padding: '20px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  textDecoration: 'none',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  color: 'inherit',
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    backgroundColor: link.color,
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    flexShrink: 0,
                  }}
                >
                  {link.icon}
                </div>
                <div>
                  <p
                    style={{
                      fontSize: '15px',
                      fontWeight: '700',
                      color: '#333',
                      margin: '0 0 2px',
                    }}
                  >
                    {link.label}
                  </p>
                  <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>{link.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <WaveDivider fromColor="#9fd9f6" toColor="#fff" />

      {/* 直近のイベント */}
      <section style={{ backgroundColor: '#fff', padding: '48px 20px 60px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#516881', margin: 0 }}>
              直近のイベント
            </h2>
            <Link
              href="/admin/events"
              style={{ color: '#30b9bf', fontWeight: '700', fontSize: '14px', textDecoration: 'underline' }}
            >
              すべて見る →
            </Link>
          </div>

          {upcomingEvents && upcomingEvents.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {upcomingEvents.map((event) => {
                const date = new Date(event.event_date)
                return (
                  <div
                    key={event.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: '#f7fbfe',
                      border: '2px solid #d9eaf4',
                      borderRadius: '12px',
                      padding: '14px 20px',
                      flexWrap: 'wrap',
                      gap: '10px',
                    }}
                  >
                    <div>
                      <p style={{ fontSize: '15px', fontWeight: '700', color: '#333', margin: '0 0 4px' }}>
                        {event.title}
                      </p>
                      <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>
                        📅{' '}
                        {date.toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {event.location && ` ／ 📍 ${event.location}`}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Link
                        href={`/admin/events/${event.id}`}
                        style={{
                          padding: '6px 14px',
                          backgroundColor: '#9fd9f6',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '13px',
                          color: '#516881',
                          fontWeight: '700',
                          textDecoration: 'none',
                        }}
                      >
                        詳細
                      </Link>
                      <Link
                        href={`/admin/events/${event.id}/edit`}
                        style={{
                          padding: '6px 14px',
                          backgroundColor: '#f5f29f',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '13px',
                          color: '#333',
                          fontWeight: '700',
                          textDecoration: 'none',
                        }}
                      >
                        編集
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '48px',
                backgroundColor: '#f7fbfe',
                borderRadius: '16px',
                border: '2px solid #d9eaf4',
              }}
            >
              <p style={{ fontSize: '15px', color: '#888', margin: '0 0 16px' }}>
                直近のイベントはありません
              </p>
              <Link
                href="/admin/events/new"
                className="btn-coral"
                style={{ margin: '0 auto', padding: '12px 32px', height: 'auto', width: 'auto', fontSize: '14px' }}
              >
                イベントを作成する
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
