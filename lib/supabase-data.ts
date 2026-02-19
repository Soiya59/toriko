/**
 * Supabase 用のランキング・カテゴリー更新ロジック。
 * 呼び出し元で createClient() を渡す想定（@supabase/supabase-js 利用時）。
 * クライアント未導入時はこのモジュールを import しなければエラーにならない。
 */
import type { GourmetItem } from "./data"

/** DB の ranking_items 行（snake_case） */
export type RankingRow = {
  id: string
  category_id: string
  name: string
  score: number
  eaten_at: string
  comment: string
  image_url: string | null
  rank: number
}

/** DB の categories 行 */
export type CategoryRow = {
  id: string
  name: string
  image_url: string | null
}

// 実 Supabase クライアントを渡す想定。any にすることでパッケージ未導入でもコンパイル可能
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Client = any

function itemToRow(item: GourmetItem): Record<string, unknown> {
  return {
    id: item.id,
    category_id: item.categoryId,
    name: item.name,
    score: item.score,
    eaten_at: item.date,
    comment: item.comment,
    image_url: item.image ?? null,
    rank: 0,
  }
}

/**
 * 指定カテゴリー内のランキングを score で並べ直し、rank を付与して DB を更新し、
 * 1 位の画像をカテゴリーの代表画像に設定する。
 */
async function recalcRankAndCategoryImage(
  client: Client,
  categoryId: string
): Promise<void> {
  const { data: rows, error: fetchError } = await client
    .from("ranking_items")
    .select("id, score, image_url, category_id")
    .eq("category_id", categoryId)
    .order("score", { ascending: false })

  if (fetchError || !rows || rows.length === 0) {
    await client.from("categories").update({ image_url: null }).eq("id", categoryId)
    return
  }

  const sorted = rows as RankingRow[]
  for (let i = 0; i < sorted.length; i++) {
    await client.from("ranking_items").update({ rank: i + 1 }).eq("id", sorted[i].id)
  }

  const firstImage = sorted[0]?.image_url ?? null
  await client.from("categories").update({ image_url: firstImage }).eq("id", categoryId)
}

/**
 * ランキング項目を 1 件 upsert する。
 * 編集でカテゴリーが変更された場合は「元のカテゴリー」と「新しいカテゴリー」の両方で
 * ランキング（rank）を再計算し、それぞれの 1 位の画像をカテゴリーの代表画像に更新する。
 */
export async function upsertRankingItem(
  client: Client,
  item: GourmetItem,
  options?: { previousCategoryId?: string }
): Promise<{ error: unknown }> {
  const previousCategoryId = options?.previousCategoryId
  const categoryChanged =
    Boolean(previousCategoryId) && previousCategoryId !== item.categoryId

  const payload = itemToRow(item)
  const table = client.from("ranking_items")

  console.log("送るデータ:", payload)
  const upsertRes = await table.upsert(payload, { onConflict: "id" })
  const res = upsertRes as { data: unknown; error: unknown }
  const err = res.error
  if (err) {
    const e = err as { message?: string; code?: string; details?: string }
    console.error("Supabaseエラー詳細:", e?.message ?? e?.code ?? e?.details ?? "(内容なし)")
    console.error("Supabase エラーオブジェクト:", e)
    console.error("Supabase レスポンス全体:", res)
    return { error: err }
  }

  if (categoryChanged && previousCategoryId) {
    await recalcRankAndCategoryImage(client, previousCategoryId)
  }
  await recalcRankAndCategoryImage(client, item.categoryId)

  return { error: null }
}
