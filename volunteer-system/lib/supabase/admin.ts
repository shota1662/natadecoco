import { createClient } from '@supabase/supabase-js'

/**
 * Service Role を使った管理者クライアント（サーバーサイド専用）
 * RLS をバイパスするため、絶対にブラウザに渡さないこと。
 * SUPABASE_SERVICE_ROLE_KEY は NEXT_PUBLIC_ を付けず、サーバーのみで使用。
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey || !url.startsWith('https://')) {
    return null
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
