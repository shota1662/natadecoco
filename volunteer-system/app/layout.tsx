import type { Metadata } from 'next'
import './globals.css'
import Header from './components/Header'
import Footer from './components/Footer'

export const metadata: Metadata = {
  title: 'ボランティア管理システム | NPOナタデココ',
  description: 'NPOナタデココのボランティア登録・イベント管理システムです。',
}

function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return url && key && url.startsWith('https://') && (key.startsWith('eyJ') || key.startsWith('sb_'))
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const configured = isSupabaseConfigured()

  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {/* Supabase未設定の場合の警告バナー */}
        {!configured && (
          <div
            style={{
              backgroundColor: '#f5c842',
              padding: '10px 20px',
              textAlign: 'center',
              fontSize: '13px',
              fontWeight: '700',
              color: '#333',
              borderBottom: '2px solid #e0b000',
              lineHeight: 1.7,
            }}
          >
            ⚠️ Supabase が未設定です。
            <code
              style={{
                backgroundColor: 'rgba(0,0,0,0.08)',
                padding: '1px 6px',
                borderRadius: '4px',
                margin: '0 4px',
                fontFamily: 'monospace',
              }}
            >
              .env.local
            </code>
            に
            <code
              style={{
                backgroundColor: 'rgba(0,0,0,0.08)',
                padding: '1px 6px',
                borderRadius: '4px',
                margin: '0 4px',
                fontFamily: 'monospace',
              }}
            >
              NEXT_PUBLIC_SUPABASE_URL
            </code>
            と
            <code
              style={{
                backgroundColor: 'rgba(0,0,0,0.08)',
                padding: '1px 6px',
                borderRadius: '4px',
                margin: '0 4px',
                fontFamily: 'monospace',
              }}
            >
              NEXT_PUBLIC_SUPABASE_ANON_KEY
            </code>
            を設定してください。
          </div>
        )}
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
