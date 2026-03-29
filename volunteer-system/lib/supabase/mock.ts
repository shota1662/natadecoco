/**
 * Supabase未設定時に使用するモッククライアント
 * クラッシュを防ぎ、UIを確認できるようにする
 */

function createQueryChain(result: { data: unknown; error: null; count?: number }) {
  const chain: Record<string, unknown> = {}
  const chainMethods = [
    'select', 'insert', 'update', 'delete', 'upsert',
    'eq', 'neq', 'gt', 'lt', 'gte', 'lte',
    'like', 'ilike', 'is', 'in', 'contains',
    'order', 'limit', 'range', 'single', 'maybeSingle',
    'filter', 'not', 'or', 'and', 'textSearch',
  ]
  chainMethods.forEach((m) => {
    chain[m] = () => chain
  })
  chain['then'] = (resolve: (v: unknown) => unknown) => Promise.resolve(result).then(resolve)
  chain['catch'] = (reject: (e: unknown) => unknown) => Promise.resolve(result).catch(reject)
  return chain
}

export const mockSupabaseClient = {
  auth: {
    getUser: async () => ({ data: { user: null }, error: null }),
    signInWithPassword: async () => ({
      data: { user: null, session: null },
      error: { message: '⚠ Supabase が未設定です。.env.local を設定してください。' },
    }),
    signUp: async () => ({
      data: { user: null, session: null },
      error: { message: '⚠ Supabase が未設定です。.env.local を設定してください。' },
    }),
    signOut: async () => ({ error: null }),
    exchangeCodeForSession: async () => ({
      data: { user: null, session: null },
      error: { message: 'Supabase not configured' },
    }),
    onAuthStateChange: () => ({
      data: { subscription: { unsubscribe: () => {} } },
    }),
  },
  from: (_table: string) =>
    createQueryChain({ data: null, error: null, count: 0 }),
}
