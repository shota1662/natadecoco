// ============================================================
// 説明会（Info session）の選択肢 — 仮枠
// ------------------------------------------------------------
// TODO: 実際の説明会日程が決まったら、この配列だけ差し替える。
//       フォーム・確認メール・管理画面はすべてこの id / label を参照する。
// ============================================================

export interface InfoSession {
  id: string
  label_en: string
  label_ja: string
}

export const INFO_SESSIONS: InfoSession[] = [
  { id: 'session-1', label_en: 'XX/XX (—) 20:00–20:45 online', label_ja: 'XX/XX（—）20:00〜20:45 オンライン' },
  { id: 'session-2', label_en: 'XX/XX (—) 20:00–20:45 online', label_ja: 'XX/XX（—）20:00〜20:45 オンライン' },
  { id: 'session-3', label_en: 'XX/XX (—) 20:00–20:45 online', label_ja: 'XX/XX（—）20:00〜20:45 オンライン' },
  { id: 'session-4', label_en: 'XX/XX (—) 20:00–20:45 online', label_ja: 'XX/XX（—）20:00〜20:45 オンライン' },
  { id: 'none', label_en: 'None of these dates work for me', label_ja: 'どの日も 都合が わるい' },
]

/** id から表示ラベルを引く（メール・管理画面用） */
export function sessionLabel(id: string | null | undefined, locale: 'en' | 'ja'): string {
  if (!id) return locale === 'en' ? '(not selected)' : '（未選択）'
  const s = INFO_SESSIONS.find((x) => x.id === id)
  if (!s) return id
  return locale === 'en' ? s.label_en : s.label_ja
}
