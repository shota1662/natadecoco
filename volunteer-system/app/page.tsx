import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import WaveDivider from './components/WaveDivider'

export default async function Home() {
  const supabase = await createClient()
  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {
    // Supabase未設定の場合は無視
  }

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div>
      {/* ヒーローセクション */}
      <section
        style={{
          background: 'linear-gradient(135deg, #f7fbfe 0%, #d9eaf4 100%)',
          padding: '80px 20px 40px',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div
            style={{
              display: 'inline-block',
              backgroundColor: '#9fd9f6',
              borderRadius: '20px',
              padding: '6px 20px',
              fontSize: '13px',
              color: '#516881',
              fontWeight: '700',
              marginBottom: '24px',
              letterSpacing: '0.1em',
            }}
          >
            ボランティア管理システム
          </div>

          <h1
            style={{
              fontSize: '40px',
              fontWeight: '700',
              color: '#516881',
              lineHeight: 1.3,
              margin: '0 0 20px',
            }}
          >
            子どもたちに、
            <br />
            世界と出会う喜びを。
          </h1>

          <p
            style={{
              fontSize: '16px',
              color: '#666',
              lineHeight: 2,
              margin: '0 0 40px',
            }}
          >
            NPOナタデココのボランティアとして、
            <br />
            全国の子どもたちへ異文化体験を届けましょう。
          </p>

          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/register"
              className="btn-coral"
              style={{ padding: '16px 40px', height: 'auto', width: 'auto', fontSize: '16px' }}
            >
              ボランティア登録
            </Link>
            <Link
              href="/login"
              className="btn-teal"
              style={{ padding: '16px 40px', height: 'auto', width: 'auto', fontSize: '16px' }}
            >
              ログイン
            </Link>
          </div>
        </div>
      </section>

      <WaveDivider fromColor="#d9eaf4" toColor="#9fd9f6" />

      {/* 特徴セクション */}
      <section
        style={{
          backgroundColor: '#9fd9f6',
          padding: '60px 20px',
        }}
      >
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div className="section-title" style={{ marginBottom: '40px' }}>
            <h2
              style={{
                fontSize: '28px',
                fontWeight: '700',
                color: '#516881',
                margin: '0 0 8px',
              }}
            >
              ボランティアに参加する理由
            </h2>
            <p style={{ fontSize: '14px', color: '#516881', margin: 0 }}>
              あなたの力が子どもたちの笑顔につながります
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '24px',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            {[
              {
                num: '01',
                color: '#fe4c7f',
                title: '月１回からOK',
                text: '無理のないペースで参加できます。学業・仕事との両立も安心。あなたのライフスタイルに合わせてご参加いただけます。',
              },
              {
                num: '02',
                color: '#30b9bf',
                title: '未経験・外国語不要',
                text: '特別なスキルや語学力は一切不要。「子どもが好き」という気持ちだけでOK！活動しながら自然に身につく力があります。',
              },
              {
                num: '03',
                color: '#f87a6d',
                title: '国際交流の現場へ',
                text: '外国人スタッフと協力しながら、あなた自身も異文化を体験できます。国際的な視野が自然と広がります。',
              },
              {
                num: '04',
                color: '#516881',
                title: 'スキルアップできる',
                text: '子どもへの指導力・コミュニケーション力・異文化理解など、社会でも役立つ力が自然と身につきます。',
              },
            ].map((point) => (
              <div
                key={point.num}
                style={{
                  flex: '1 1 200px',
                  maxWidth: '260px',
                  backgroundColor: '#fff',
                  borderRadius: '20px',
                  padding: '32px 24px',
                  textAlign: 'center',
                  boxShadow: '5px 5px 0 rgba(81,104,129,0.2)',
                }}
              >
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    backgroundColor: point.color,
                    borderRadius: '50%',
                    color: '#fff',
                    fontSize: '20px',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}
                >
                  {point.num}
                </div>
                <h3
                  style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#516881',
                    margin: '0 0 10px',
                  }}
                >
                  {point.title}
                </h3>
                <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.8, margin: 0 }}>
                  {point.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <WaveDivider fromColor="#9fd9f6" toColor="#fff" />

      {/* CTAセクション */}
      <section style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2
            style={{
              fontSize: '26px',
              fontWeight: '700',
              color: '#516881',
              margin: '0 0 16px',
            }}
          >
            さあ、始めましょう！
          </h2>
          <p style={{ fontSize: '14px', color: '#888', lineHeight: 2, margin: '0 0 32px' }}>
            まずはボランティア登録をして、イベントに参加してみましょう。
          </p>
          <Link
            href="/register"
            className="btn-primary"
            style={{ margin: '0 auto', fontSize: '15px' }}
          >
            無料でボランティア登録
          </Link>
        </div>
      </section>
    </div>
  )
}
