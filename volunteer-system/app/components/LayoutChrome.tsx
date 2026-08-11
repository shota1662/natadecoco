'use client'

import { usePathname } from 'next/navigation'

/**
 * 共通レイアウトの Header / Footer 表示を制御する薄いクライアントラッパー。
 *
 * 会員向けの Header / Footer（ログイン・新規登録・ログアウト等）は
 * 認証を前提とするアプリ内ページ用。ログイン不要の公開募集ページ
 * （/register-intl）では出さず、そのページが自前のシンプルな
 * ヘッダー/フッターを描画する。
 *
 * header / footer は layout.tsx 側でサーバーコンポーネントとして
 * 描画済みの React ノードを受け取るだけ（ここでは描画判定のみ）。
 */
const PUBLIC_LANDING_PREFIXES = ['/register-intl']

export default function LayoutChrome({
  header,
  footer,
  children,
}: {
  header: React.ReactNode
  footer: React.ReactNode
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isPublicLanding = PUBLIC_LANDING_PREFIXES.some((p) => pathname?.startsWith(p))

  if (isPublicLanding) {
    // 公開募集ページ：共通 chrome を出さない（ページ側が独自に描画）
    return <>{children}</>
  }

  return (
    <>
      {header}
      <main>{children}</main>
      {footer}
    </>
  )
}
