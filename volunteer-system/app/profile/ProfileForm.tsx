'use client'

import { useActionState } from 'react'
import { updateProfile, type ProfileState } from './actions'
import type { Profile } from '@/lib/types'

const NATIONALITIES = [
  '日本', 'アメリカ', 'イギリス', 'カナダ', 'オーストラリア', 'ニュージーランド',
  '中国', '韓国', '台湾', 'フィリピン', 'インドネシア', 'タイ', 'ベトナム',
  'インド', 'ブラジル', 'フランス', 'ドイツ', 'スペイン', 'イタリア', 'その他',
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

interface ProfileFormProps {
  profile: Profile
}

export default function ProfileForm({ profile }: ProfileFormProps) {
  const [state, formAction, isPending] = useActionState<ProfileState, FormData>(updateProfile, null)

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #f7fbfe 0%, #d9eaf4 100%)',
        padding: '40px 20px 60px',
        minHeight: '100vh',
      }}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '20px',
          boxShadow: '8px 8px 0 rgba(81,104,129,0.15)',
          padding: '48px 40px',
          width: '100%',
          maxWidth: '600px',
          margin: '0 auto',
        }}
      >
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
            👤
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#516881', margin: '0 0 8px' }}>
            プロフィール編集
          </h1>
          <p style={{ fontSize: '14px', color: '#888', margin: 0, lineHeight: 1.8 }}>
            登録情報を確認・編集できます。
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

        {/* メールアドレス（表示のみ） */}
        <div style={{ marginBottom: '24px' }}>
          <p style={labelStyle}>メールアドレス</p>
          <p
            style={{
              padding: '13px 16px',
              border: '2px solid #d9eaf4',
              borderRadius: '10px',
              fontSize: '14px',
              color: '#888',
              backgroundColor: '#f0f4f8',
              margin: 0,
            }}
          >
            {profile.email}
          </p>
          <p style={{ fontSize: '12px', color: '#aaa', marginTop: '6px' }}>
            ※ メールアドレスは変更できません
          </p>
        </div>

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
              defaultValue={profile.full_name}
              placeholder="例）山田 太郎"
              required
              disabled={isPending}
            />
          </div>

          {/* 電話番号 */}
          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="phone" style={labelStyle}>
              電話番号
              <span style={optionalBadge}>任意</span>
            </label>
            <input
              className="form-input"
              type="tel"
              id="phone"
              name="phone"
              defaultValue={profile.phone ?? ''}
              placeholder="例）090-0000-0000"
              disabled={isPending}
            />
          </div>

          {/* 国籍 */}
          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="nationality" style={labelStyle}>
              国籍
              <span style={optionalBadge}>任意</span>
            </label>
            <div style={{ position: 'relative' }}>
              <select
                className="form-select"
                id="nationality"
                name="nationality"
                defaultValue={profile.nationality ?? ''}
                style={{ paddingRight: '40px' }}
                disabled={isPending}
              >
                <option value="">選択してください</option>
                {NATIONALITIES.map((nat) => (
                  <option key={nat} value={nat}>{nat}</option>
                ))}
              </select>
              <span style={selectArrow}>▾</span>
            </div>
          </div>

          {/* 生年月日 */}
          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="birthday" style={labelStyle}>
              生年月日
              <span style={optionalBadge}>任意</span>
            </label>
            <input
              className="form-input"
              type="date"
              id="birthday"
              name="birthday"
              defaultValue={profile.birthday ?? ''}
              disabled={isPending}
            />
          </div>

          {/* 日本語力 */}
          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="japanese_level" style={labelStyle}>
              日本語力（5段階）
              <span style={optionalBadge}>任意</span>
            </label>
            <div style={{ position: 'relative' }}>
              <select
                className="form-select"
                id="japanese_level"
                name="japanese_level"
                defaultValue={profile.japanese_level ?? ''}
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

          {/* 英語力 */}
          <div style={{ marginBottom: '36px' }}>
            <label htmlFor="english_level" style={labelStyle}>
              英語力（5段階）
              <span style={optionalBadge}>任意</span>
            </label>
            <div style={{ position: 'relative' }}>
              <select
                className="form-select"
                id="english_level"
                name="english_level"
                defaultValue={profile.english_level ?? ''}
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

          {/* 謝金・交通費振込情報 */}
          <div
            style={{
              borderTop: '2px solid #d9eaf4',
              paddingTop: '32px',
              marginBottom: '36px',
            }}
          >
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#516881', margin: '0 0 6px' }}>
                謝金・交通費振込のための情報登録
              </h2>
              <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>
                謝金・交通費のお振込みに使用します。任意ですが、受け取りを希望する場合は入力してください。
              </p>
            </div>

            {/* 銀行名 */}
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="bank_name" style={labelStyle}>
                ① 銀行名
                <span style={optionalBadge}>任意</span>
              </label>
              <input
                className="form-input"
                type="text"
                id="bank_name"
                name="bank_name"
                defaultValue={profile.bank_name ?? ''}
                placeholder="例）○○銀行"
                disabled={isPending}
              />
            </div>

            {/* 支店名 */}
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="bank_branch" style={labelStyle}>
                ② 支店名
                <span style={optionalBadge}>任意</span>
              </label>
              <input
                className="form-input"
                type="text"
                id="bank_branch"
                name="bank_branch"
                defaultValue={profile.bank_branch ?? ''}
                placeholder="例）○○支店"
                disabled={isPending}
              />
            </div>

            {/* 口座番号 */}
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="bank_account_number" style={labelStyle}>
                ③ 口座番号
                <span style={optionalBadge}>任意</span>
              </label>
              <input
                className="form-input"
                type="text"
                id="bank_account_number"
                name="bank_account_number"
                defaultValue={profile.bank_account_number ?? ''}
                placeholder="例）1234567"
                disabled={isPending}
              />
            </div>

            {/* 銀行口座氏名 */}
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="bank_account_holder" style={labelStyle}>
                ④ 銀行口座氏名（カタカナ）
                <span style={optionalBadge}>任意</span>
              </label>
              <input
                className="form-input"
                type="text"
                id="bank_account_holder"
                name="bank_account_holder"
                defaultValue={profile.bank_account_holder ?? ''}
                placeholder="例）ヤマダ タロウ"
                disabled={isPending}
              />
            </div>

            {/* 自宅住所 */}
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="address" style={labelStyle}>
                ⑤ 自宅住所
                <span style={optionalBadge}>任意</span>
              </label>
              <input
                className="form-input"
                type="text"
                id="address"
                name="address"
                defaultValue={profile.address ?? ''}
                placeholder="例）東京都渋谷区○○1-2-3"
                disabled={isPending}
              />
            </div>

            {/* 自宅最寄り駅 */}
            <div style={{ marginBottom: '0' }}>
              <label htmlFor="nearest_station" style={labelStyle}>
                ⑥ 自宅最寄り駅
                <span style={optionalBadge}>任意</span>
              </label>
              <input
                className="form-input"
                type="text"
                id="nearest_station"
                name="nearest_station"
                defaultValue={profile.nearest_station ?? ''}
                placeholder="例）渋谷駅"
                disabled={isPending}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              type="submit"
              className="btn-teal"
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
              {isPending ? '更新中...' : '更新する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
