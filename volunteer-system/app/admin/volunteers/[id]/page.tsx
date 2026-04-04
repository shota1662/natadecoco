import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'

interface Props {
  params: Promise<{ id: string }>
}

const levelLabels = ['', '初級', '基礎', '中級', '上級', 'ネイティブ']

function InfoRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div style={{ display: 'flex', gap: '16px', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
      <dt style={{ width: '160px', flexShrink: 0, fontSize: '13px', color: '#888', fontWeight: '600' }}>{label}</dt>
      <dd style={{ fontSize: '14px', color: value ? '#333' : '#ccc', margin: 0 }}>{value ?? '—'}</dd>
    </div>
  )
}

export default async function VolunteerDetailPage({ params }: Props) {
  const supabase = await createClient()
  const { id } = await params

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: myProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (myProfile?.role !== 'admin') redirect('/dashboard')

  const { data: v } = await supabase.from('profiles').select('*').eq('id', id).single()
  if (!v) notFound()

  // 参加イベント履歴
  const { data: registrations } = await supabase
    .from('event_registrations')
    .select('*, events(*)')
    .eq('user_id', id)
    .order('registered_at', { ascending: false })

  const STATUS_LABEL: Record<string, string> = { applied: '申込済み', selected: '当選', rejected: '落選' }
  const STATUS_COLOR: Record<string, string> = { applied: '#516881', selected: '#1a8a8f', rejected: '#c0234a' }
  const STATUS_BG: Record<string, string>    = { applied: '#f0f4f8', selected: '#f0fffe', rejected: '#fff0f3' }

  return (
    <div style={{ minHeight: 'calc(100vh - 120px)', background: '#f7fbfe', padding: '40px 20px 60px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

        {/* パンくず */}
        <div style={{ fontSize: '13px', color: '#888', marginBottom: '24px' }}>
          <Link href="/admin" style={{ color: '#30b9bf' }}>管理者トップ</Link>
          {' › '}
          <Link href="/admin/volunteers" style={{ color: '#30b9bf' }}>ボランティア一覧</Link>
          {' › '}
          <span>{v.full_name}</span>
        </div>

        {/* 基本情報 */}
        <div style={{ backgroundColor: '#fff', borderRadius: '16px', boxShadow: '5px 5px 0 rgba(81,104,129,0.15)', overflow: 'hidden', marginBottom: '24px' }}>
          <div style={{ height: '6px', backgroundColor: '#30b9bf' }} />
          <div style={{ padding: '28px 32px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#333', margin: '0 0 4px' }}>{v.full_name}</h1>
            <p style={{ fontSize: '13px', color: '#888', margin: '0 0 24px' }}>登録日: {new Date(v.created_at).toLocaleDateString('ja-JP')}</p>
            <dl>
              <InfoRow label="メールアドレス" value={v.email} />
              <InfoRow label="電話番号" value={v.phone} />
              <InfoRow label="国籍" value={v.nationality} />
              <InfoRow label="生年月日" value={v.birthday ? new Date(v.birthday).toLocaleDateString('ja-JP') : null} />
              <InfoRow label="都道府県" value={v.prefecture} />
              <InfoRow label="住所" value={v.address} />
              <InfoRow label="最寄り駅" value={v.nearest_station} />
              <InfoRow label="職業" value={v.occupation} />
              <InfoRow label="スキル" value={v.skills} />
              <InfoRow
                label="日本語力"
                value={v.japanese_level ? `${v.japanese_level} / 5（${levelLabels[v.japanese_level]}）` : null}
              />
              <InfoRow
                label="英語力"
                value={v.english_level ? `${v.english_level} / 5（${levelLabels[v.english_level]}）` : null}
              />
            </dl>
          </div>
        </div>

        {/* 銀行口座情報 */}
        <div style={{ backgroundColor: '#fff', borderRadius: '16px', boxShadow: '5px 5px 0 rgba(81,104,129,0.15)', overflow: 'hidden', marginBottom: '24px' }}>
          <div style={{ height: '6px', backgroundColor: '#f87a6d' }} />
          <div style={{ padding: '28px 32px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#516881', margin: '0 0 16px' }}>銀行口座情報</h2>
            <dl>
              <InfoRow label="銀行名" value={v.bank_name} />
              <InfoRow label="支店名" value={v.bank_branch} />
              <InfoRow label="口座番号" value={v.bank_account_number} />
              <InfoRow label="口座名義" value={v.bank_account_holder} />
            </dl>
          </div>
        </div>

        {/* 参加イベント履歴 */}
        <div style={{ backgroundColor: '#fff', borderRadius: '16px', boxShadow: '5px 5px 0 rgba(81,104,129,0.15)', overflow: 'hidden' }}>
          <div style={{ height: '6px', backgroundColor: '#a78bfa' }} />
          <div style={{ padding: '28px 32px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#516881', margin: '0 0 16px' }}>
              参加イベント履歴
              <span style={{ fontSize: '14px', color: '#888', fontWeight: '400', marginLeft: '8px' }}>
                {registrations?.length ?? 0}件
              </span>
            </h2>
            {registrations && registrations.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {registrations.map((reg) => {
                  const event = reg.events as { id?: string; title?: string; event_date?: string } | null
                  const status = (reg.status ?? 'applied') as string
                  return (
                    <div
                      key={reg.id}
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        backgroundColor: '#f7fbfe', border: '1.5px solid #d9eaf4',
                        borderRadius: '10px', padding: '12px 16px', flexWrap: 'wrap', gap: '8px',
                      }}
                    >
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#333', margin: '0 0 3px' }}>
                          {event?.title ?? '—'}
                        </p>
                        <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>
                          {event?.event_date
                            ? new Date(event.event_date).toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' })
                            : '—'}
                          　申込: {new Date(reg.registered_at).toLocaleDateString('ja-JP')}
                        </p>
                      </div>
                      <span
                        style={{
                          padding: '3px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '700',
                          color: STATUS_COLOR[status] ?? '#333',
                          backgroundColor: STATUS_BG[status] ?? '#f0f0f0',
                        }}
                      >
                        {STATUS_LABEL[status] ?? status}
                      </span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p style={{ fontSize: '14px', color: '#aaa', margin: 0 }}>参加履歴はありません</p>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
