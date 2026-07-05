// ============================================================
// 画像マニフェスト（差し替え前提のプレースホルダー）
// ------------------------------------------------------------
// すべての画像をここ 1 か所で管理する。実素材が用意できたら
// `src` を差し替えるだけでよい（ハードコードで散らさない）。
//
// 注意: 子どもの写真は肖像権・掲載同意が必要。プレースホルダーには
//       実在する子どもの顔写真を使わない（同意済み素材に限る）。
//
// aspect は CSS の aspect-ratio 値（例 '16 / 9'）。レイアウトシフト防止。
// alt が空文字のものは装飾扱い（スクリーンリーダーから隠す）。
// src が null のものは ImagePlaceholder がプレースホルダー枠を描画する。
// ============================================================

export interface ImageAsset {
  key: string
  src: string | null
  alt_en: string
  alt_ja: string
  aspect: string
}

export const IMAGES: Record<string, ImageAsset> = {
  hero: {
    key: 'hero',
    src: null,
    alt_en: 'International supporters and children enjoying a cultural event together',
    alt_ja: '外国人サポーターと 子どもたちが いっしょに 文化イベントを たのしんでいる ようす',
    aspect: '16 / 9',
  },
  why1: { key: 'why1', src: null, alt_en: '', alt_ja: '', aspect: '1 / 1' },
  why2: { key: 'why2', src: null, alt_en: '', alt_ja: '', aspect: '1 / 1' },
  why3: { key: 'why3', src: null, alt_en: '', alt_ja: '', aspect: '1 / 1' },
  message: {
    key: 'message',
    src: null,
    alt_en: 'Portrait of our representative',
    alt_ja: '代表者の 顔写真',
    aspect: '1 / 1',
  },
  gallery1: {
    key: 'gallery1',
    src: null,
    alt_en: 'Supporters taking part in an activity',
    alt_ja: 'かつどうに 参加している サポーター',
    aspect: '4 / 3',
  },
  gallery2: {
    key: 'gallery2',
    src: null,
    alt_en: 'Supporters taking part in an activity',
    alt_ja: 'かつどうに 参加している サポーター',
    aspect: '4 / 3',
  },
  gallery3: {
    key: 'gallery3',
    src: null,
    alt_en: 'Supporters taking part in an activity',
    alt_ja: 'かつどうに 参加している サポーター',
    aspect: '4 / 3',
  },
}
