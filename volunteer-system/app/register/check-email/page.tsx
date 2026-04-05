import Link from 'next/link'

export default function CheckEmailPage() {
  return (
    <div
      style={{
        minHeight: 'calc(100vh - 120px)',
        background: 'linear-gradient(135deg, #f7fbfe 0%, #d9eaf4 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
      }}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '20px',
          boxShadow: '2px 2px 0 rgba(81,104,129,0.15)',
          padding: '48px 40px',
          width: '100%',
          maxWidth: '480px',
          textAlign: 'center',
        }}
      >
        {/* アイコン */}
        <div
          style={{
            width: '80px',
            height: '80px',
            backgroundColor: '#9fd9f6',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            fontSize: '36px',
          }}
        >
          ✉️
        </div>

        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#516881', margin: '0 0 12px' }}>
          確認メールを送信しました
        </h1>
        <p style={{ fontSize: '14px', color: '#555', lineHeight: 2, margin: '0 0 32px' }}>
          ご登録いただいたメールアドレスに確認メールをお送りしました。<br />
          メール内のリンクをクリックして、登録を完了してください。
        </p>

        {/* 注意事項 */}
        <div
          style={{
            backgroundColor: '#f0faff',
            border: '2px solid #9fd9f6',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '32px',
            textAlign: 'left',
          }}
        >
          <p style={{ fontSize: '13px', color: '#516881', fontWeight: '700', margin: '0 0 8px' }}>
            ご確認ください
          </p>
          <ul style={{ fontSize: '13px', color: '#555', lineHeight: 1.9, margin: 0, paddingLeft: '18px' }}>
            <li>迷惑メールフォルダに振り分けられている場合があります</li>
            <li>リンクの有効期限は24時間です</li>
            <li>メールが届かない場合は再度登録をお試しください</li>
          </ul>
        </div>

        <Link
          href="/login"
          style={{
            fontSize: '14px',
            color: '#30b9bf',
            fontWeight: '700',
            textDecoration: 'underline',
            textUnderlineOffset: '3px',
          }}
        >
          ログインページに戻る
        </Link>
      </div>
    </div>
  )
}
