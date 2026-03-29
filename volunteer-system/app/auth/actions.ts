'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export type AuthState = {
  error?: string
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

// 新規登録
export async function signUp(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const supabase = await createClient()

  // フォームデータの取得
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = (formData.get('full_name') as string)?.trim() || ''
  const nationality = (formData.get('nationality') as string) || null
  const birthday = (formData.get('birthday') as string) || null

  // ① Supabase Auth にユーザーを作成
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // raw_user_meta_data に保存（トリガーのフォールバック用）
      data: {
        full_name: fullName,
        nationality,
        birthday,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (authError) {
    return { error: authError.message }
  }

  if (!authData.user) {
    return { error: 'ユーザーの作成に失敗しました。再度お試しください。' }
  }

  // メール列挙防止チェック:
  // Supabase のメール確認が有効なとき、既存メールでサインアップすると
  // auth.users には挿入されないまま偽のユーザーオブジェクト（identities が空）が返される。
  // その偽の user.id で profiles に insert すると FK 制約違反になるため事前に検出する。
  if (!authData.user.identities || authData.user.identities.length === 0) {
    return { error: 'このメールアドレスはすでに登録されています。ログインページからサインインしてください。' }
  }

  // ② profiles テーブルに直接 upsert（管理者クライアントで RLS をバイパス）
  //    トリガーが先に実行した場合は ON CONFLICT で上書き更新する
  const adminClient = createAdminClient()

  if (adminClient) {
    // Service Role Key がある場合（推奨）: RLS を完全バイパス
    const { error: profileError } = await adminClient.from('profiles').upsert(
      {
        id: authData.user.id,
        email,
        full_name: fullName,
        nationality,
        birthday: birthday || null,
      },
      { onConflict: 'id' }
    )

    if (profileError) {
      console.error('[signUp] Profile upsert error (admin):', profileError.message)
      // プロフィール作成に失敗しても auth ユーザーは作成済みのため続行
      // ダッシュボードに遷移後にトリガーが作成した場合はそちらを使う
    }
  } else {
    // Service Role Key がない場合: 通常クライアントで試みる
    // （メール確認なし＆セッションあり の場合に成功する可能性あり）
    const { error: profileError } = await supabase.from('profiles').upsert(
      {
        id: authData.user.id,
        email,
        full_name: fullName,
        nationality,
        birthday: birthday || null,
      },
      { onConflict: 'id' }
    )

    if (profileError) {
      console.error('[signUp] Profile upsert error (anon):', profileError.message)
      console.warn(
        '[signUp] SUPABASE_SERVICE_ROLE_KEY が未設定です。' +
        '.env.local に追加することでプロフィール作成が確実になります。'
      )
    }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard?message=' + encodeURIComponent('登録が完了しました！'))
}

// ログアウト
export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}
