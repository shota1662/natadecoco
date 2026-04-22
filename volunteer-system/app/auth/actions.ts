'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export type AuthState = {
  error?: string
  redirect?: string
} | null

// ログイン
export async function signIn(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

// 新規登録 Step 1: メール・パスワード
export async function signUpStep1(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const supabase = await createClient()

  // Turnstile検証
  const turnstileToken = formData.get('cf-turnstile-response') as string
  if (!turnstileToken) {
    return { error: 'スパム検証を完了してください。' }
  }
  const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      secret: process.env.TURNSTILE_SECRET_KEY!,
      response: turnstileToken,
    }),
  })
  const verifyData = await verifyRes.json()
  if (!verifyData.success) {
    return { error: 'スパム検証に失敗しました。もう一度お試しください。' }
  }

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // Supabase Auth にユーザーを作成
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/register/details`,
    },
  })

  if (authError) {
    return { error: authError.message }
  }

  if (!authData.user) {
    return { error: 'ユーザーの作成に失敗しました。再度お試しください。' }
  }

  // メール列挙防止チェック
  if (!authData.user.identities || authData.user.identities.length === 0) {
    return { error: 'このメールアドレスはすでに登録されています。ログインページからサインインしてください。' }
  }

  // profiles テーブルに初期レコードを作成（管理者クライアントで RLS をバイパス）
  const adminClient = createAdminClient()

  if (adminClient) {
    const { error: profileError } = await adminClient.from('profiles').upsert(
      { id: authData.user.id, email },
      { onConflict: 'id' }
    )
    if (profileError) {
      console.error('[signUpStep1] Profile upsert error (admin):', profileError.message)
    }
  } else {
    const { error: profileError } = await supabase.from('profiles').upsert(
      { id: authData.user.id, email },
      { onConflict: 'id' }
    )
    if (profileError) {
      console.error('[signUpStep1] Profile upsert error (anon):', profileError.message)
    }
  }

  redirect('/register/check-email')
}

// 新規登録 Step 2: 詳細情報
export async function signUpComplete(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/register')
  }

  const fullName = (formData.get('full_name') as string)?.trim() || ''
  const birthday = (formData.get('birthday') as string) || null
  const nationality = (formData.get('nationality') as string) || null
  const prefecture = (formData.get('prefecture') as string) || null
  const occupation = (formData.get('occupation') as string)?.trim() || null
  const skills = (formData.get('skills') as string)?.trim() || null
  const englishLevelStr = formData.get('english_level') as string
  const japaneseLevelStr = formData.get('japanese_level') as string
  const englishLevel = englishLevelStr ? parseInt(englishLevelStr, 10) : null
  const japaneseLevel = japaneseLevelStr ? parseInt(japaneseLevelStr, 10) : null
  const address = (formData.get('address') as string)?.trim() || null
  const nearestStation = (formData.get('nearest_station') as string)?.trim() || null
  const bankName = (formData.get('bank_name') as string)?.trim() || null
  const bankBranch = (formData.get('bank_branch') as string)?.trim() || null
  const bankAccountNumber = (formData.get('bank_account_number') as string)?.trim() || null
  const bankAccountHolder = (formData.get('bank_account_holder') as string)?.trim() || null
  const phone = (formData.get('phone') as string)?.trim() || null

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: fullName,
      birthday: birthday || null,
      nationality,
      prefecture,
      occupation,
      skills,
      english_level: englishLevel,
      japanese_level: japaneseLevel,
      address,
      nearest_station: nearestStation,
      bank_name: bankName,
      bank_branch: bankBranch,
      bank_account_number: bankAccountNumber,
      bank_account_holder: bankAccountHolder,
      phone,
    })
    .eq('id', user.id)

  if (error) {
    return { error: 'プロフィールの更新に失敗しました。再度お試しください。' }
  }

  revalidatePath('/', 'layout')
  return { redirect: '/register/orientation' }
}

// 新規登録（旧: 後方互換用に残す）
export async function signUp(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  return signUpStep1(_prevState, formData)
}

const ORIENTATION_LABELS: Record<string, string> = {
  '2026-05-06': '5/6（祝）20:00-20:45　オンライン',
  '2026-06-01': '6/1（月）20:00-20:45　オンライン',
  '2026-07-06': '7/6（月）20:00-20:45　オンライン',
  '2026-08-03': '8/3（月）20:00-20:45　オンライン',
  '2026-09-07': '9/7（月）20:00-20:45　オンライン',
  '2026-10-05': '10/5（月）20:00-20:45　オンライン',
  '2026-11-02': '11/2（月）20:00-20:45　オンライン',
  '2026-12-07': '12/7（月）20:00-20:45　オンライン',
}

// 説明会申込み
export async function registerOrientation(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const orientationDate = formData.get('orientation_date') as string | null

  if (orientationDate) {
    await supabase
      .from('profiles')
      .update({ orientation_date: orientationDate })
      .eq('id', user.id)
  }

  // プロフィール情報を取得して通知メール送信
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, nationality, phone, prefecture')
    .eq('id', user.id)
    .single()

  const name = profile?.full_name || user.email || '（名前未設定）'
  const orientationLabel = orientationDate
    ? (ORIENTATION_LABELS[orientationDate] ?? orientationDate)
    : '未定（あとで申し込む）'

  await resend.emails.send({
    from: 'ボランティアシステム <info@natadecoco.org>',
    to: 'info@natadecoco.org',
    subject: `【新規ボランティア登録】${name}さんが登録しました`,
    html: `
      <h2>新規ボランティア登録のお知らせ</h2>
      <table style="border-collapse:collapse;width:100%;max-width:600px">
        <tr><td style="padding:8px;border:1px solid #ddd;background:#f5f5f5;width:140px"><strong>氏名</strong></td><td style="padding:8px;border:1px solid #ddd">${name}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;background:#f5f5f5"><strong>メール</strong></td><td style="padding:8px;border:1px solid #ddd">${profile?.email ?? user.email ?? '—'}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;background:#f5f5f5"><strong>電話番号</strong></td><td style="padding:8px;border:1px solid #ddd">${profile?.phone ?? '—'}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;background:#f5f5f5"><strong>国籍</strong></td><td style="padding:8px;border:1px solid #ddd">${profile?.nationality ?? '—'}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;background:#f5f5f5"><strong>都道府県</strong></td><td style="padding:8px;border:1px solid #ddd">${profile?.prefecture ?? '—'}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;background:#f5f5f5"><strong>説明会日程</strong></td><td style="padding:8px;border:1px solid #ddd">${orientationLabel}</td></tr>
      </table>
      <p style="margin-top:16px"><a href="https://volunteer.natadecoco.org/admin/volunteers">管理者画面で確認する</a></p>
    `,
  })

  revalidatePath('/', 'layout')
  redirect('/dashboard?message=' + encodeURIComponent('登録が完了しました！ようこそナタデココへ🎉'))
}

// ログアウト
export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}

// パスワードリセットメール送信
export async function resetPassword(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const supabase = await createClient()
  const email = formData.get('email') as string

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/reset-password`,
  })

  if (error) {
    return { error: 'メールの送信に失敗しました。メールアドレスをご確認ください。' }
  }

  redirect('/forgot-password?sent=true')
}

// 新しいパスワードに更新
export async function updatePassword(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const supabase = await createClient()
  const password = formData.get('password') as string
  const confirm = formData.get('confirm') as string

  if (password !== confirm) {
    return { error: 'パスワードが一致しません。' }
  }
  if (password.length < 8) {
    return { error: 'パスワードは8文字以上で設定してください。' }
  }

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { error: 'パスワードの更新に失敗しました。再度お試しください。' }
  }

  redirect('/login?message=' + encodeURIComponent('パスワードを更新しました。新しいパスワードでログインしてください。'))
}
