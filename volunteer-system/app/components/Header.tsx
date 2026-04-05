import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/app/auth/actions'

export default async function Header() {
  const supabase = await createClient()
  let user: { id: string; email?: string } | null = null
  let isAdmin = false

  try {
    const { data } = await supabase.auth.getUser()
    user = data.user

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      isAdmin = profile?.role === 'admin'
    }
  } catch {
    // Supabase未設定の場合は未ログイン状態として扱う
  }

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: '#fff',
        boxShadow: '0 2px 8px rgba(81,104,129,0.10)',
      }}
    >
      {/* トップナビ */}
      <div style={{ backgroundColor: '#9fd9f6', width: '100%', height: '28px', display: 'flex', alignItems: 'center' }}>
        <ul
          style={{
            margin: 0,
            padding: '0 20px 0 0',
            listStyle: 'none',
            display: 'flex',
            gap: '20px',
            width: '100%',
            justifyContent: 'flex-end',
          }}
        >
          {user ? (
            <>
              <li style={{ fontSize: '12px', color: '#516881', fontWeight: '500' }}>
                {isAdmin ? '👑 管理者' : '👤 ボランティア'}
              </li>
              <li>
                <form action={signOut}>
                  <button
                    type="submit"
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '12px',
                      color: '#516881',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      padding: 0,
                    }}
                  >
                    ログアウト
                  </button>
                </form>
              </li>
            </>
          ) : (
            <>
              <li style={{ fontSize: '12px' }}>
                <Link href="/login" style={{ color: '#516881', fontWeight: '500' }}>
                  ログイン
                </Link>
              </li>
              <li style={{ fontSize: '12px' }}>
                <Link href="/register" style={{ color: '#516881', fontWeight: '500' }}>
                  新規登録
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>

      {/* メインヘッダー */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 40px',
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        {/* ロゴ */}
        <Link href="/" style={{ display: 'block', flexShrink: 0 }}>
          <Image
            src="/logo.svg"
            alt="NPOナタデココ"
            width={160}
            height={50}
            style={{ display: 'block' }}
            priority
          />
        </Link>

        {/* ナビゲーション */}
        <nav>
          <ul
            style={{
              display: 'flex',
              gap: '32px',
              margin: 0,
              padding: 0,
              listStyle: 'none',
              alignItems: 'center',
            }}
          >
            {user ? (
              <>
                <li>
                  <Link
                    href="/dashboard"
                    style={{
                      color: '#516881',
                      fontWeight: '700',
                      fontSize: '14px',
                      transition: 'color 0.2s',
                    }}
                  >
                    マイページ
                  </Link>
                </li>
                <li>
                  <Link
                    href="/profile"
                    style={{
                      color: '#516881',
                      fontWeight: '700',
                      fontSize: '14px',
                      transition: 'color 0.2s',
                    }}
                  >
                    プロフィールを編集
                  </Link>
                </li>
                {isAdmin && (
                  <li>
                    <Link
                      href="/admin"
                      style={{
                        color: '#fe4c7f',
                        fontWeight: '700',
                        fontSize: '14px',
                      }}
                    >
                      管理者ページ
                    </Link>
                  </li>
                )}
              </>
            ) : (
              <>
                <li>
                  <Link
                    href="/login"
                    className="btn-teal"
                    style={{
                      padding: '10px 24px',
                      height: 'auto',
                      width: 'auto',
                      fontSize: '14px',
                    }}
                  >
                    ログイン
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register"
                    className="btn-coral"
                    style={{
                      padding: '10px 24px',
                      height: 'auto',
                      width: 'auto',
                      fontSize: '14px',
                    }}
                  >
                    ボランティア登録
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  )
}
