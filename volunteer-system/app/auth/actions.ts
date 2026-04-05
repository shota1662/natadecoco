'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

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
