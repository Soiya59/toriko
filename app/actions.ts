"use server"

import { createServerClient } from "@/lib/supabase"
import { upsertRankingItem } from "@/lib/supabase-data"
import type { GourmetItem } from "@/lib/data"

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
