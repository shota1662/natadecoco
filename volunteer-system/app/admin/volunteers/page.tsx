import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'


export default async function AdminVolunteersPage() {
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

  // ボランティア一覧取得（管理者以外）
  const { data: volunteers } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'volunteer')
    .order('created_at', { ascending: false })

  // 各ボランティアの参加数
  const participationCounts: Record<string, number> = {}
  if (volunteers && volunteers.length > 0) {
    const { data: regs } = await supabase
      .from('event_registrations')
      .select('user_id')
      .in('user_id', volunteers.map((v) => v.id))
    regs?.forEach((r) => {
      participationCounts[r.user_id] = (participationCounts[r.user_id] || 0) + 1
    })
  }

  const levelLabels = ['', '初級', '基礎', '中級', '上級', 'ネイティブ']
  const orientationLabels: Record<string, string> = {
    '2026-05-06': '5/6',
    '2026-06-01': '6/1',
    '2026-07-06': '7/6',
    '2026-08-03': '8/3',
    '2026-09-07': '9/7',
    '2026-10-05': '10/5',
    '2026-11-02': '11/2',
    '2026-12-07': '12/7',
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 120px)', background: '#f7fbfe', padding: '40px 20px 60px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* パンくず */}
        <div style={{ fontSize: '13px', color: '#888', marginBottom: '24px' }}>
          <Link href="/admin" style={{ color: '#30b9bf' }}>管理者トップ</Link>
          {' › '}
          <span>ボランティア一覧</span>
        </div>

        {/* ヘッダー */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#516881', margin: '0 0 4px' }}>
            ボランティア一覧
          </h1>
          <p style={{ fontSize: '14px', color: '#888', margin: 0 }}>
            登録ボランティア数: 全{volunteers?.length ?? 0}名
          </p>
        </div>

        {volunteers && volunteers.length > 0 ? (
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: '16px',
              boxShadow: '5px 5px 0 rgba(81,104,129,0.15)',
              overflow: 'auto',
            }}
          >
            <table className="data-table" style={{ minWidth: '800px' }}>
              <thead>
                <tr>
                  <th>氏名</th>
                  <th>メールアドレス</th>
                  <th>国籍</th>
                  <th>生年月日</th>
                  <th>電話番号</th>
                  <th style={{ textAlign: 'center' }}>日本語力</th>
                  <th style={{ textAlign: 'center' }}>英語力</th>
                  <th style={{ textAlign: 'center' }}>参加数</th>
                  <th>説明会日程</th>
                  <th>登録日</th>
                </tr>
              </thead>
              <tbody>
                {volunteers.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <Link
                        href={`/admin/volunteers/${v.id}`}
                        style={{ fontWeight: '600', fontSize: '14px', color: '#30b9bf', textDecoration: 'none' }}
                      >
                        {v.full_name}
                      </Link>
                    </td>
                    <td style={{ fontSize: '13px', color: '#555' }}>{v.email}</td>
                    <td style={{ fontSize: '13px', color: '#555' }}>{v.nationality ?? '—'}</td>
                    <td style={{ fontSize: '13px', color: '#555', whiteSpace: 'nowrap' }}>
                      {v.birthday
                        ? new Date(v.birthday).toLocaleDateString('ja-JP', {
                            year: 'numeric',
                            month: 'numeric',
                            day: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td style={{ fontSize: '13px', color: '#555', whiteSpace: 'nowrap' }}>
                      {v.phone ?? '—'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {v.japanese_level ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                          <span className="badge-teal">{v.japanese_level}</span>
                          <span style={{ fontSize: '10px', color: '#888' }}>
                            {levelLabels[v.japanese_level]}
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: '#ccc' }}>—</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {v.english_level ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                          <span className="badge-primary">{v.english_level}</span>
                          <span style={{ fontSize: '10px', color: '#888' }}>
                            {levelLabels[v.english_level]}
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: '#ccc' }}>—</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span
                        style={{
                          fontWeight: '700',
                          color: '#516881',
                          fontSize: '16px',
                        }}
                      >
                        {participationCounts[v.id] || 0}
                      </span>
                      <span style={{ fontSize: '12px', color: '#888', marginLeft: '2px' }}>回</span>
                    </td>
                    <td style={{ fontSize: '13px', color: '#555', whiteSpace: 'nowrap' }}>
                      {v.orientation_date
                        ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ color: '#30b9bf', fontWeight: '600' }}>
                              {orientationLabels[v.orientation_date] ?? v.orientation_date}
                            </span>
                            {v.orientation_attended && (
                              <span style={{ fontSize: '11px', color: '#1a8a8f', backgroundColor: '#f0fffe', border: '1px solid #30b9bf', borderRadius: '4px', padding: '1px 5px' }}>参加済</span>
                            )}
                          </span>
                        )
                        : <span style={{ color: '#ccc' }}>未定</span>
                      }
                    </td>
                    <td style={{ fontSize: '13px', color: '#888', whiteSpace: 'nowrap' }}>
                      {new Date(v.created_at).toLocaleDateString('ja-JP')}
                    </td>
                  </tr>
                ))}
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
            <p style={{ fontSize: '16px', color: '#888', margin: '0 0 8px' }}>
              まだボランティアが登録されていません
            </p>
            <p style={{ fontSize: '13px', color: '#aaa', margin: 0 }}>
              登録ページのURLをシェアして参加を呼びかけましょう
            </p>
          </div>
        )}

        {/* 統計サマリー */}
        {volunteers && volunteers.length > 0 && (
          <div
            style={{
              marginTop: '24px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '16px',
            }}
          >
            {[
              {
                label: '国籍別（最多）',
                value: (() => {
                  const counts: Record<string, number> = {}
                  volunteers.forEach((v) => {
                    if (v.nationality) counts[v.nationality] = (counts[v.nationality] || 0) + 1
                  })
                  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
                  return top ? `${top[0]}（${top[1]}名）` : '—'
                })(),
                icon: '🌏',
                color: '#9fd9f6',
              },
              {
                label: '平均日本語力',
                value: (() => {
                  const levels = volunteers.filter((v) => v.japanese_level).map((v) => v.japanese_level as number)
                  if (levels.length === 0) return '—'
                  const avg = levels.reduce((a, b) => a + b, 0) / levels.length
                  return avg.toFixed(1) + ' / 5'
                })(),
                icon: '🇯🇵',
                color: '#fe4c7f',
              },
              {
                label: '平均英語力',
                value: (() => {
                  const levels = volunteers.filter((v) => v.english_level).map((v) => v.english_level as number)
                  if (levels.length === 0) return '—'
                  const avg = levels.reduce((a, b) => a + b, 0) / levels.length
                  return avg.toFixed(1) + ' / 5'
                })(),
                icon: '🇬🇧',
                color: '#30b9bf',
              },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '12px',
                  boxShadow: '4px 4px 0 rgba(81,104,129,0.15)',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: stat.color,
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    flexShrink: 0,
                  }}
                >
                  {stat.icon}
                </div>
                <div>
                  <p style={{ fontSize: '11px', color: '#888', margin: '0 0 2px' }}>{stat.label}</p>
                  <p style={{ fontSize: '15px', fontWeight: '700', color: '#333', margin: 0 }}>
                    {stat.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
