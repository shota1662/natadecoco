import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import EmailTemplateForm from './EmailTemplateForm'

export default async function EmailTemplatesPage() {
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

  const { data: templates } = await supabase
    .from('email_templates')
    .select('*')
    .in('id', ['selected', 'rejected'])

  const selected = templates?.find((t) => t.id === 'selected')
  const rejected = templates?.find((t) => t.id === 'rejected')

  return (
    <div style={{ minHeight: 'calc(100vh - 120px)', background: '#f7fbfe', padding: '40px 20px 60px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

        {/* パンくず */}
        <div style={{ fontSize: '13px', color: '#888', marginBottom: '24px' }}>
          <Link href="/admin" style={{ color: '#30b9bf' }}>管理者トップ</Link>
          {' › '}
          <span>メールテンプレート</span>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#516881', margin: '0 0 6px' }}>
            メールテンプレート
          </h1>
          <p style={{ fontSize: '14px', color: '#888', margin: 0 }}>
            ステータス変更時に送信するメールの文面を編集できます
          </p>
        </div>

        {selected ? (
          <EmailTemplateForm template={selected} label="当選" color="#30b9bf" />
        ) : (
          <div style={{ backgroundColor: '#fff0f3', border: '2px solid #fe4c7f', borderRadius: '12px', padding: '16px 20px', marginBottom: '28px', fontSize: '14px', color: '#c0234a' }}>
            ⚠️ 当選テンプレートが見つかりません。Supabaseで初期データを挿入してください。
          </div>
        )}

        {rejected ? (
          <EmailTemplateForm template={rejected} label="落選" color="#fe4c7f" />
        ) : (
          <div style={{ backgroundColor: '#fff0f3', border: '2px solid #fe4c7f', borderRadius: '12px', padding: '16px 20px', fontSize: '14px', color: '#c0234a' }}>
            ⚠️ 落選テンプレートが見つかりません。Supabaseで初期データを挿入してください。
          </div>
        )}

      </div>
    </div>
  )
}
