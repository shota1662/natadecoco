import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { mockSupabaseClient } from './mock'

function isConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return (
    !!url &&
    !!key &&
    url.startsWith('https://') &&
    (key.startsWith('eyJ') || key.startsWith('sb_'))
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createClient(): Promise<any> {
  if (!isConfigured()) {
    return mockSupabaseClient
  }

  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Componentから呼ばれた場合は無視（proxyでセッション更新済み）
          }
        },
      },
    }
  )
}
