import { createBrowserClient } from '@supabase/ssr'
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
export function createClient(): any {
  if (!isConfigured()) {
    return mockSupabaseClient
  }
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
