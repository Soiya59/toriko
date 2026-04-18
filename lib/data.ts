/** ランキング項目（料理・旅行・思い出など汎用） */
export type GourmetItem = {
  id: string
  name: string
  categoryId: string
  score: number
  comment: string
  /** 料理写真の公開 URL（Supabase Storage）。レガシーで data URL が入っている場合あり */
  image: string | null
  date: string // YYYY-MM-DD（食べた日・訪問日など）
}

/** @deprecated 後方互換のため。GourmetItem を使用してください */
export type Dish = GourmetItem

export type Category = {
  id: string
  name: string
}

export type FullCourseSlot = {
  key: string
  label: string
  dishId: string | null
}

/** フルコースのスロット定義（UI用）。データは Supabase ではなくクライアントのストアで保持 */
export const FULL_COURSE_SLOTS: { key: string; label: string; emoji: string }[] = [
  { key: "appetizer", label: "前菜", emoji: "🥗" },
  { key: "soup", label: "スープ", emoji: "🍲" },
  { key: "fish", label: "魚料理", emoji: "🐟" },
  { key: "meat", label: "肉料理", emoji: "🥩" },
  { key: "main", label: "メインディッシュ", emoji: "👨‍🍳" },
  { key: "salad", label: "サラダ", emoji: "🥬" },
  { key: "dessert", label: "デザート", emoji: "🍰" },
  { key: "drink", label: "ドリンク", emoji: "🍷" },
]
