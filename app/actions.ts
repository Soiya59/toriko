"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/supabase"
import {
  upsertRankingItem,
  fetchAllCategoriesAndItems,
  fetchFullCourse,
  saveFullCourse,
  rowToItem,
} from "@/lib/supabase-data"
import type { GourmetItem } from "@/lib/data"
import type { Category } from "@/lib/data"

/**
 * ランキング項目を保存するServer Action
 */
export async function saveRankingItem(
  item: GourmetItem,
  options?: { previousCategoryId?: string }
): Promise<{ success: boolean; error?: string }> {
  try {
    // 環境変数のチェック
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!supabaseUrl || !supabaseKey) {
      const errorMsg = `環境変数が設定されていません: NEXT_PUBLIC_SUPABASE_URL=${!!supabaseUrl}, SUPABASE_SERVICE_ROLE_KEY=${!!process.env.SUPABASE_SERVICE_ROLE_KEY}, NEXT_PUBLIC_SUPABASE_ANON_KEY=${!!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
      console.error("[Server Action] " + errorMsg)
      return { success: false, error: errorMsg }
    }

    // 保存処理開始ログ
    console.log("[Server Action] 保存処理開始:", {
      itemId: item.id,
      name: item.name,
      categoryId: item.categoryId,
      score: item.score,
      date: item.date,
      comment: item.comment,
      hasImage: !!item.image,
      previousCategoryId: options?.previousCategoryId,
      timestamp: new Date().toISOString(),
    })

    // Supabaseクライアントを作成
    const client = createServerClient()

    // データを保存
    const { error } = await upsertRankingItem(client, item, options)

    if (error) {
      // Supabaseエラーの詳細をログ出力
      const errorDetails = error as {
        message?: string
        code?: string
        details?: string
        hint?: string
        [key: string]: unknown
      }
      const errorMessage =
        errorDetails?.message ||
        errorDetails?.code ||
        errorDetails?.details ||
        String(error)

      console.error("[Server Action] Supabaseエラー詳細:", {
        message: errorDetails?.message,
        code: errorDetails?.code,
        details: errorDetails?.details,
        hint: errorDetails?.hint,
        fullError: error,
      })

      return {
        success: false,
        error: `保存に失敗しました: ${errorMessage}`,
      }
    }

    console.log("[Server Action] 保存処理成功:", {
      itemId: item.id,
      timestamp: new Date().toISOString(),
    })

    // ページを再検証してデータを即座に反映
    revalidatePath("/")

    return { success: true }
  } catch (error) {
    // 予期しないエラーをキャッチ
    console.error("[Server Action] 保存処理で例外が発生しました:", error)
    if (error instanceof Error) {
      console.error("[Server Action] エラーメッセージ:", error.message)
      console.error("[Server Action] エラースタック:", error.stack)
      return {
        success: false,
        error: `予期しないエラーが発生しました: ${error.message}`,
      }
    }
    return {
      success: false,
      error: `予期しないエラーが発生しました: ${String(error)}`,
    }
  }
}

/**
 * 初期表示用に Supabase から全カテゴリー・全ランキング項目・フルコース割り当てを取得する。
 * キャッシュを使わず常に最新を取得するため、ページ読み込み時に呼び出す。
 */
export async function getInitialData(): Promise<{
  success: boolean
  categories?: Category[]
  dishes?: GourmetItem[]
  fullCourse?: Record<string, string | null>
  error?: string
}> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!supabaseUrl || !supabaseKey) {
      return {
        success: false,
        error: "環境変数が設定されていません",
      }
    }

    const client = createServerClient()
    const [catAndItems, fullCourseRes] = await Promise.all([
      fetchAllCategoriesAndItems(client),
      fetchFullCourse(client),
    ])

    const { categories: catRows, items: itemRows, error } = catAndItems
    if (error) {
      console.error("[Server Action] getInitialData 取得エラー:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }
    }

    const categories: Category[] = catRows.map((c) => ({ id: c.id, name: c.name }))
    const dishes: GourmetItem[] = itemRows.map(rowToItem)
    const fullCourse = fullCourseRes.error ? {} : fullCourseRes.fullCourse

    return { success: true, categories, dishes, fullCourse }
  } catch (e) {
    console.error("[Server Action] getInitialData 例外:", e)
    return {
      success: false,
      error: e instanceof Error ? e.message : String(e),
    }
  }
}

/**
 * フルコースのスロット割り当てを Supabase に保存する。
 * フルコース画面で料理を選んだ瞬間に呼び出す。
 */
export async function saveFullCourseSelection(
  fullCourse: Record<string, string | null>
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!supabaseUrl || !supabaseKey) {
      return { success: false, error: "環境変数が設定されていません" }
    }

    const client = createServerClient()
    const { error } = await saveFullCourse(client, fullCourse)

    if (error) {
      console.error("[Server Action] saveFullCourseSelection エラー:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }
    }

    revalidatePath("/")
    return { success: true }
  } catch (e) {
    console.error("[Server Action] saveFullCourseSelection 例外:", e)
    return {
      success: false,
      error: e instanceof Error ? e.message : String(e),
    }
  }
}
