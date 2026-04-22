import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AttendanceToggleButton from './AttendanceToggleButton'

const SESSIONS: { date: string; label: string }[] = [
  { date: '2026-05-06', label: '5/6（祝）20:00-20:45　オンライン' },
  { date: '2026-06-01', label: '6/1（月）20:00-20:45　オンライン' },
  { date: '2026-07-06', label: '7/6（月）20:00-20:45　オンライン' },
  { date: '2026-08-03', label: '8/3（月）20:00-20:45　オンライン' },
  { date: '2026-09-07', label: '9/7（月）20:00-20:45　オンライン' },
  { date: '2026-10-05', label: '10/5（月）20:00-20:45　オンライン' },
  { date: '2026-11-02', label: '11/2（月）20:00-20:45　オンライン' },
  { date: '2026-12-07', label: '12/7（月）20:00-20:45　オンライン' },
]

export default async function AdminOrientationsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: volunteers } = await supabase
    .from('profiles')
    .select('id, full_name, email, phone, orientation_date, orientation_attended, created_at')
    .eq('role', 'volunteer')
    .order('orientation_date', { ascending: true, nullsFirst: false })

  // 日程ごとにグループ化
  const grouped: Record<string, typeof volunteers> = {}
  const unscheduled: typeof volunteers = []

  volunteers?.forEach((v) => {
    if (v.orientation_date) {
      if (!grouped[v.orientation_date]) grouped[v.orientation_date] = []
      grouped[v.orientation_date]!.push(v)
    } else {
      unscheduled.push(v)
    }
  })

  const totalRegistered = volunteers?.filter((v) => v.orientation_date).length ?? 0
  const totalAttended = volunteers?.filter((v) => v.orientation_attended).length ?? 0

  return (
    <div style={{ minHeight: 'calc(100vh - 120px)', background: '#f7fbfe', padding: '40px 20px 60px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* パンくず */}
        <div style={{ fontSize: '13px', color: '#888', marginBottom: '24px' }}>
          <Link href="/admin" style={{ color: '#30b9bf' }}>管理者トップ</Link>
          {' › '}
          <span>説明会管理</span>
        </div>

        {/* ヘッダー */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#516881', margin: '0 0 4px' }}>
            説明会管理
          </h1>
          <p style={{ fontSize: '14px', color: '#888', margin: 0 }}>
            申込済み {totalRegistered}名　／　参加済み {totalAttended}名
          </p>
        </div>

        {/* サマリーカード */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: '説明会申込み数', value: totalRegistered, unit: '名', color: '#30b9bf' },
            { label: '参加済み', value: totalAttended, unit: '名', color: '#1a8a8f' },
            { label: '日程未定', value: unscheduled.length, unit: '名', color: '#f4a44a' },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                backgroundColor: '#fff',
                borderRadius: '14px',
                boxShadow: '5px 5px 0 rgba(81,104,129,0.15)',
                padding: '20px 24px',
                borderTop: `4px solid ${s.color}`,
              }}
            >
              <p style={{ fontSize: '12px', color: '#888', margin: '0 0 6px' }}>{s.label}</p>
              <p style={{ fontSize: '28px', fontWeight: '700', color: '#516881', margin: 0, lineHeight: 1 }}>
                {s.value}
                <span style={{ fontSize: '14px', marginLeft: '4px' }}>{s.unit}</span>
              </p>
            </div>
          ))}
        </div>

        {/* 日程別一覧 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {SESSIONS.map((session) => {
            const members = grouped[session.date] ?? []
            const attendedCount = members.filter((v) => v.orientation_attended).length
            const sessionDate = new Date(session.date)
            const isPast = sessionDate < new Date()

            return (
              <div
                key={session.date}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '16px',
                  boxShadow: '5px 5px 0 rgba(81,104,129,0.15)',
                  overflow: 'hidden',
                }}
              >
                {/* セッションヘッダー */}
                <div
                  style={{
                    padding: '16px 24px',
                    borderBottom: '1px solid #f0f0f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '8px',
                    backgroundColor: isPast ? '#f9f9f9' : '#fff',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    {isPast && (
                      <span style={{ backgroundColor: '#aaa', color: '#fff', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px' }}>
                        終了
                      </span>
                    )}
                    <span style={{ fontSize: '16px', fontWeight: '700', color: '#333' }}>
                      {session.label}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: '#888' }}>
                      申込 <strong style={{ color: '#333' }}>{members.length}</strong> 名
                    </span>
                    <span style={{ fontSize: '13px', color: '#888' }}>
                      参加済み <strong style={{ color: '#1a8a8f' }}>{attendedCount}</strong> 名
                    </span>
                  </div>
                </div>

                {/* 参加者リスト */}
                {members.length > 0 ? (
                  <table className="data-table" style={{ margin: 0 }}>
                    <thead>
                      <tr>
                        <th>氏名</th>
                        <th>メールアドレス</th>
                        <th>電話番号</th>
                        <th style={{ textAlign: 'center' }}>出席</th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((v) => (
                        <tr key={v.id}>
                          <td>
                            <Link
                              href={`/admin/volunteers/${v.id}`}
                              style={{ fontWeight: '600', fontSize: '14px', color: '#30b9bf', textDecoration: 'none' }}
                            >
                              {v.full_name || '（未設定）'}
                            </Link>
                          </td>
                          <td style={{ fontSize: '13px', color: '#555' }}>{v.email}</td>
                          <td style={{ fontSize: '13px', color: '#555' }}>{v.phone ?? '—'}</td>
                          <td style={{ textAlign: 'center' }}>
                            <AttendanceToggleButton
                              volunteerId={v.id}
                              attended={v.orientation_attended ?? false}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#bbb', fontSize: '14px' }}>
                    この日程への申込みはありません
                  </div>
                )}
              </div>
            )
          })}

          {/* 日程未定 */}
          {unscheduled.length > 0 && (
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
                  padding: '16px 24px',
                  borderBottom: '1px solid #f0f0f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: '#fffbf0',
                }}
              >
                <span style={{ fontSize: '16px', fontWeight: '700', color: '#c47b1a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  ! 日程未定（スキップ・未申込み）
                </span>
                <span style={{ fontSize: '13px', color: '#888' }}>
                  <strong style={{ color: '#333' }}>{unscheduled.length}</strong> 名
                </span>
              </div>
              <table className="data-table" style={{ margin: 0 }}>
                <thead>
                  <tr>
                    <th>氏名</th>
                    <th>メールアドレス</th>
                    <th>電話番号</th>
                    <th>登録日</th>
                  </tr>
                </thead>
                <tbody>
                  {unscheduled.map((v) => (
                    <tr key={v.id}>
                      <td>
                        <Link
                          href={`/admin/volunteers/${v.id}`}
                          style={{ fontWeight: '600', fontSize: '14px', color: '#30b9bf', textDecoration: 'none' }}
                        >
                          {v.full_name || '（未設定）'}
                        </Link>
                      </td>
                      <td style={{ fontSize: '13px', color: '#555' }}>{v.email}</td>
                      <td style={{ fontSize: '13px', color: '#555' }}>{v.phone ?? '—'}</td>
                      <td style={{ fontSize: '13px', color: '#888' }}>
                        {new Date(v.created_at).toLocaleDateString('ja-JP')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
