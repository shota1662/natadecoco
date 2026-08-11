// ============================================================
// 都道府県リスト（英語話者向けにローマ字併記）
// 保存値は日本語名（canonical）。EN 表示時は「Romaji（日本語）」を見せる。
// ============================================================

export interface Prefecture {
  ja: string
  en: string
}

export const PREFECTURES: Prefecture[] = [
  { ja: '北海道', en: 'Hokkaido' },
  { ja: '青森県', en: 'Aomori' },
  { ja: '岩手県', en: 'Iwate' },
  { ja: '宮城県', en: 'Miyagi' },
  { ja: '秋田県', en: 'Akita' },
  { ja: '山形県', en: 'Yamagata' },
  { ja: '福島県', en: 'Fukushima' },
  { ja: '茨城県', en: 'Ibaraki' },
  { ja: '栃木県', en: 'Tochigi' },
  { ja: '群馬県', en: 'Gunma' },
  { ja: '埼玉県', en: 'Saitama' },
  { ja: '千葉県', en: 'Chiba' },
  { ja: '東京都', en: 'Tokyo' },
  { ja: '神奈川県', en: 'Kanagawa' },
  { ja: '新潟県', en: 'Niigata' },
  { ja: '富山県', en: 'Toyama' },
  { ja: '石川県', en: 'Ishikawa' },
  { ja: '福井県', en: 'Fukui' },
  { ja: '山梨県', en: 'Yamanashi' },
  { ja: '長野県', en: 'Nagano' },
  { ja: '岐阜県', en: 'Gifu' },
  { ja: '静岡県', en: 'Shizuoka' },
  { ja: '愛知県', en: 'Aichi' },
  { ja: '三重県', en: 'Mie' },
  { ja: '滋賀県', en: 'Shiga' },
  { ja: '京都府', en: 'Kyoto' },
  { ja: '大阪府', en: 'Osaka' },
  { ja: '兵庫県', en: 'Hyogo' },
  { ja: '奈良県', en: 'Nara' },
  { ja: '和歌山県', en: 'Wakayama' },
  { ja: '鳥取県', en: 'Tottori' },
  { ja: '島根県', en: 'Shimane' },
  { ja: '岡山県', en: 'Okayama' },
  { ja: '広島県', en: 'Hiroshima' },
  { ja: '山口県', en: 'Yamaguchi' },
  { ja: '徳島県', en: 'Tokushima' },
  { ja: '香川県', en: 'Kagawa' },
  { ja: '愛媛県', en: 'Ehime' },
  { ja: '高知県', en: 'Kochi' },
  { ja: '福岡県', en: 'Fukuoka' },
  { ja: '佐賀県', en: 'Saga' },
  { ja: '長崎県', en: 'Nagasaki' },
  { ja: '熊本県', en: 'Kumamoto' },
  { ja: '大分県', en: 'Oita' },
  { ja: '宮崎県', en: 'Miyazaki' },
  { ja: '鹿児島県', en: 'Kagoshima' },
  { ja: '沖縄県', en: 'Okinawa' },
]

/** 保存された日本語名から表示ラベルを引く（管理画面用など） */
export function prefectureLabel(ja: string | null | undefined, locale: 'en' | 'ja'): string {
  if (!ja) return locale === 'en' ? '(not selected)' : '（未選択）'
  const p = PREFECTURES.find((x) => x.ja === ja)
  if (!p) return ja
  return locale === 'en' ? `${p.en} (${p.ja})` : p.ja
}
