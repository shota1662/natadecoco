'use client'

import { useActionState, useState } from 'react'
import { signUpComplete, type AuthState } from '@/app/auth/actions'

const PREFECTURES = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県', '海外',
]

const LANGUAGE_LEVELS = [
  { value: 1, label: '1 - 初級（ほぼ話せない）' },
  { value: 2, label: '2 - 基礎（日常会話の一部）' },
  { value: 3, label: '3 - 中級（日常会話ができる）' },
  { value: 4, label: '4 - 上級（仕事で使えるレベル）' },
  { value: 5, label: '5 - ネイティブレベル' },
]

const labelStyle = {
  display: 'flex' as const,
  alignItems: 'center' as const,
  gap: '8px',
  fontSize: '14px',
  fontWeight: '700' as const,
  color: '#516881',
  marginBottom: '8px',
}

const optionalBadge = {
  backgroundColor: '#aaa',
  color: '#fff',
  fontSize: '10px',
  fontWeight: 'bold' as const,
  padding: '2px 7px',
  borderRadius: '3px',
}

const selectArrow = {
  position: 'absolute' as const,
  right: '16px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: '#9fd9f6',
  fontSize: '18px',
  pointerEvents: 'none' as const,
}

export default function DetailsForm() {
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(signUpComplete, null)
  const [wantsPayment, setWantsPayment] = useState<boolean | null>(null)

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #f7fbfe 0%, #d9eaf4 100%)',
        padding: '40px 20px 60px',
      }}
    >
      <div
        className="register-card"
        style={{
          backgroundColor: '#fff',
          borderRadius: '20px',
          boxShadow: '2px 2px 0 rgba(81,104,129,0.15)',
          width: '100%',
          maxWidth: '600px',
          margin: '0 auto',
        }}
      >
        {/* ステップインジケーター */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#dde5ee', color: '#aaa', fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</div>
            <span className="register-step-label" style={{ color: '#aaa' }}>アカウント作成</span>
          </div>
          <div style={{ width: '32px', height: '2px', backgroundColor: '#fe4c7f' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#fe4c7f', color: '#fff', fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</div>
            <span className="register-step-label" style={{ color: '#fe4c7f' }}>詳細情報</span>
          </div>
          <div style={{ width: '32px', height: '2px', backgroundColor: '#dde5ee' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#dde5ee', color: '#aaa', fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</div>
            <span className="register-step-label" style={{ color: '#aaa' }}>説明会申込み</span>
          </div>
        </div>

        {/* タイトル */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              backgroundColor: '#30b9bf',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: '28px',
            }}
          >
            📋
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#516881', margin: '0 0 8px' }}>
            詳細情報の登録
          </h1>
          <p style={{ fontSize: '14px', color: '#888', margin: 0, lineHeight: 1.8 }}>
            プロフィール情報を入力してください。<br />任意項目はあとから変更できます。
          </p>
        </div>

        {/* エラー表示 */}
        {state?.error && (
          <div
            style={{
              backgroundColor: '#fff0f3',
              border: '2px solid #fe4c7f',
              borderRadius: '10px',
              padding: '12px 16px',
              marginBottom: '24px',
              fontSize: '14px',
              color: '#c0234a',
            }}
          >
            ⚠️ {state.error}
          </div>
        )}

        <form action={formAction}>
          {/* 氏名 */}
          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="full_name" style={labelStyle}>
              氏名
              <span className="badge-pink" style={{ fontSize: '10px', padding: '2px 7px' }}>必須</span>
            </label>
            <input
              className="form-input"
              type="text"
              id="full_name"
              name="full_name"
              placeholder="例）山田 太郎"
              required
              disabled={isPending}
            />
          </div>

          {/* 生年月日 */}
          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="birthday" style={labelStyle}>
              生年月日
              <span className="badge-pink" style={{ fontSize: '10px', padding: '2px 7px' }}>必須</span>
            </label>
            <input
              className="form-input"
              type="date"
              id="birthday"
              name="birthday"
              required
              disabled={isPending}
            />
          </div>

          {/* 出身国・地域 */}
          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="nationality" style={labelStyle}>
              出身国・地域
              <span className="badge-pink" style={{ fontSize: '10px', padding: '2px 7px' }}>必須</span>
            </label>
            <input
              className="form-input"
              type="text"
              id="nationality"
              name="nationality"
              placeholder="例）日本、フィリピン、アメリカ"
              required
              disabled={isPending}
            />
          </div>

          {/* 居住地（都道府県） */}
          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="prefecture" style={labelStyle}>
              居住地（都道府県）
              <span className="badge-pink" style={{ fontSize: '10px', padding: '2px 7px' }}>必須</span>
            </label>
            <div style={{ position: 'relative' }}>
              <select
                className="form-select"
                id="prefecture"
                name="prefecture"
                style={{ paddingRight: '40px' }}
                required
                disabled={isPending}
              >
                <option value="">選択してください</option>
                {PREFECTURES.map((pref) => (
                  <option key={pref} value={pref}>{pref}</option>
                ))}
              </select>
              <span style={selectArrow}>▾</span>
            </div>
          </div>

          {/* 職業 */}
          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="occupation" style={labelStyle}>
              職業
              <span style={optionalBadge}>任意</span>
            </label>
            <input
              className="form-input"
              type="text"
              id="occupation"
              name="occupation"
              placeholder="例）会社員、学生、フリーランス"
              disabled={isPending}
            />
          </div>

          {/* 特技 */}
          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="skills" style={labelStyle}>
              特技
              <span style={optionalBadge}>任意</span>
            </label>
            <input
              className="form-input"
              type="text"
              id="skills"
              name="skills"
              placeholder="例）英語通訳、パソコン操作、料理"
              disabled={isPending}
            />
          </div>

          {/* 英語力 */}
          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="english_level" style={labelStyle}>
              英語力（5段階）
              <span style={optionalBadge}>任意</span>
            </label>
            <div style={{ position: 'relative' }}>
              <select
                className="form-select"
                id="english_level"
                name="english_level"
                style={{ paddingRight: '40px' }}
                disabled={isPending}
              >
                <option value="">選択してください</option>
                {LANGUAGE_LEVELS.map((level) => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>
              <span style={selectArrow}>▾</span>
            </div>
          </div>

          {/* 日本語力 */}
          <div style={{ marginBottom: '0' }}>
            <label htmlFor="japanese_level" style={labelStyle}>
              日本語力（5段階）
              <span style={optionalBadge}>任意</span>
            </label>
            <div style={{ position: 'relative' }}>
              <select
                className="form-select"
                id="japanese_level"
                name="japanese_level"
                style={{ paddingRight: '40px' }}
                disabled={isPending}
              >
                <option value="">選択してください</option>
                {LANGUAGE_LEVELS.map((level) => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>
              <span style={selectArrow}>▾</span>
            </div>
          </div>

          {/* 謝金・交通費セクション */}
          <div style={{ borderTop: '2px solid #d9eaf4', marginTop: '36px', paddingTop: '28px' }}>
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '15px', fontWeight: '700', color: '#516881', margin: '0 0 6px' }}>
                ボランティア謝金・交通費の受け取り希望
                <span className="badge-pink" style={{ fontSize: '10px', padding: '2px 7px', marginLeft: '8px' }}>必須</span>
              </p>
              <p style={{ fontSize: '13px', color: '#888', margin: '0 0 14px' }}>
                謝金・交通費の受け取りを希望しますか？
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <label
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '14px',
                    border: `2px solid ${wantsPayment === true ? '#fe4c7f' : '#dde5ee'}`,
                    borderRadius: '12px',
                    backgroundColor: wantsPayment === true ? '#fff0f3' : '#fff',
                    cursor: 'pointer',
                    fontWeight: '700',
                    fontSize: '15px',
                    color: wantsPayment === true ? '#fe4c7f' : '#516881',
                    transition: 'all 0.15s',
                  }}
                >
                  <input
                    type="radio"
                    name="wants_payment"
                    value="yes"
                    required
                    style={{ display: 'none' }}
                    onChange={() => setWantsPayment(true)}
                  />
                  はい
                </label>
                <label
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '14px',
                    border: `2px solid ${wantsPayment === false ? '#30b9bf' : '#dde5ee'}`,
                    borderRadius: '12px',
                    backgroundColor: wantsPayment === false ? '#f0fbfc' : '#fff',
                    cursor: 'pointer',
                    fontWeight: '700',
                    fontSize: '15px',
                    color: wantsPayment === false ? '#30b9bf' : '#516881',
                    transition: 'all 0.15s',
                  }}
                >
                  <input
                    type="radio"
                    name="wants_payment"
                    value="no"
                    required
                    style={{ display: 'none' }}
                    onChange={() => setWantsPayment(false)}
                  />
                  いいえ
                </label>
              </div>
            </div>

            {wantsPayment === true && (
              <div style={{ marginTop: '8px' }}>
                {/* 住所 */}
                <div style={{ marginBottom: '20px' }}>
                  <label htmlFor="address" style={labelStyle}>
                    住所
                    <span style={optionalBadge}>任意</span>
                  </label>
                  <input
                    className="form-input"
                    type="text"
                    id="address"
                    name="address"
                    placeholder="例）東京都渋谷区○○1-2-3"
                    disabled={isPending}
                  />
                </div>

                {/* 最寄り駅 */}
                <div style={{ marginBottom: '20px' }}>
                  <label htmlFor="nearest_station" style={labelStyle}>
                    最寄り駅
                    <span style={optionalBadge}>任意</span>
                  </label>
                  <input
                    className="form-input"
                    type="text"
                    id="nearest_station"
                    name="nearest_station"
                    placeholder="例）渋谷駅"
                    disabled={isPending}
                  />
                </div>

                {/* 銀行名 */}
                <div style={{ marginBottom: '20px' }}>
                  <label htmlFor="bank_name" style={labelStyle}>
                    銀行名
                    <span style={optionalBadge}>任意</span>
                  </label>
                  <input
                    className="form-input"
                    type="text"
                    id="bank_name"
                    name="bank_name"
                    placeholder="例）○○銀行"
                    disabled={isPending}
                  />
                </div>

                {/* 支店名 */}
                <div style={{ marginBottom: '20px' }}>
                  <label htmlFor="bank_branch" style={labelStyle}>
                    支店名
                    <span style={optionalBadge}>任意</span>
                  </label>
                  <input
                    className="form-input"
                    type="text"
                    id="bank_branch"
                    name="bank_branch"
                    placeholder="例）○○支店"
                    disabled={isPending}
                  />
                </div>

                {/* 口座番号 */}
                <div style={{ marginBottom: '20px' }}>
                  <label htmlFor="bank_account_number" style={labelStyle}>
                    口座番号
                    <span style={optionalBadge}>任意</span>
                  </label>
                  <input
                    className="form-input"
                    type="text"
                    id="bank_account_number"
                    name="bank_account_number"
                    placeholder="例）1234567"
                    disabled={isPending}
                  />
                </div>

                {/* 銀行口座氏名 */}
                <div style={{ marginBottom: '20px' }}>
                  <label htmlFor="bank_account_holder" style={labelStyle}>
                    銀行口座氏名（カタカナ）
                    <span style={optionalBadge}>任意</span>
                  </label>
                  <input
                    className="form-input"
                    type="text"
                    id="bank_account_holder"
                    name="bank_account_holder"
                    placeholder="例）ヤマダ タロウ"
                    disabled={isPending}
                  />
                </div>

                {/* 電話番号 */}
                <div style={{ marginBottom: '0' }}>
                  <label htmlFor="phone" style={labelStyle}>
                    電話番号
                    <span style={optionalBadge}>任意</span>
                  </label>
                  <input
                    className="form-input"
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="例）090-0000-0000"
                    disabled={isPending}
                  />
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '36px' }}>
            <button
              type="submit"
              className="btn-coral"
              disabled={isPending}
              style={{
                padding: '16px 48px',
                height: 'auto',
                width: 'auto',
                fontSize: '15px',
                opacity: isPending ? 0.7 : 1,
                cursor: isPending ? 'not-allowed' : 'pointer',
              }}
            >
              {isPending ? '登録中...' : '登録を完了する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
