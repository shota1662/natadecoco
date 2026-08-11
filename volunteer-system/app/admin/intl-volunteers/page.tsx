import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prefectureLabel } from '@/app/register-intl/prefectures'
import type { IntlVolunteer } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function AdminIntlVolunteersPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // RLS をバイパスして確実にロールを取得する（admin トップと同じ方式）
  const adminClient = createAdminClient()
  const { data: profile } = await (adminClient ?? supabase)
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  // 外国人サポーター一覧を取得（admin_select ポリシー配下）
  const { data: volunteers } = await supabase
    .from('intl_volunteers')
    .select('*')
    .order('created_at', { ascending: false })

  const rows: IntlVolunteer[] = volunteers ?? []

  return (
    <div style={{ minHeight: 'calc(100vh - 120px)', background: '#f7fbfe', padding: '40px 20px 60px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* パンくず */}
        <div style={{ fontSize: '13px', color: '#888', marginBottom: '24px' }}>
          <Link href="/admin" style={{ color: '#30b9bf' }}>管理者トップ</Link>
          {' › '}
          <span>外国人サポーター一覧</span>
        </div>

        {/* ヘッダー */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#516881', margin: '0 0 4px' }}>
            外国人サポーター一覧
          </h1>
          <p style={{ fontSize: '14px', color: '#888', margin: 0 }}>
            登録数: 全{rows.length}名
          </p>
        </div>

        {rows.length > 0 ? (
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: '16px',
              boxShadow: '5px 5px 0 rgba(81,104,129,0.15)',
              overflow: 'auto',
            }}
          >
            <table className="data-table" style={{ minWidth: '900px' }}>
              <thead>
                <tr>
                  <th>氏名</th>
                  <th>メールアドレス</th>
                  <th>生年月日</th>
                  <th>出身の国・地域</th>
                  <th>居住地</th>
                  <th>質問</th>
                  <th style={{ textAlign: 'center' }}>言語</th>
                  <th>登録日</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((v) => (
                  <tr key={v.id}>
                    <td style={{ fontWeight: 600, fontSize: '14px', color: '#516881' }}>{v.full_name}</td>
                    <td style={{ fontSize: '13px', color: '#555' }}>{v.email}</td>
                    <td style={{ fontSize: '13px', color: '#555', whiteSpace: 'nowrap' }}>
                      {v.birth_date
                        ? new Date(v.birth_date).toLocaleDateString('ja-JP', { year: 'numeric', month: 'numeric', day: 'numeric' })
                        : '—'}
                    </td>
                    <td style={{ fontSize: '13px', color: '#555' }}>{v.origin_country}</td>
                    <td style={{ fontSize: '13px', color: '#555' }}>{prefectureLabel(v.residence_pref, 'ja')}</td>
                    <td style={{ fontSize: '13px', color: '#555', whiteSpace: 'pre-wrap', maxWidth: '260px' }}>{v.question || '—'}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={v.locale === 'ja' ? 'badge-teal' : 'badge-primary'}>
                        {v.locale === 'ja' ? 'やさしい日本語' : 'English'}
                      </span>
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
              まだ外国人サポーターが登録されていません
            </p>
            <p style={{ fontSize: '13px', color: '#aaa', margin: 0 }}>
              /register-intl のURLをシェアして参加を呼びかけましょう
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
