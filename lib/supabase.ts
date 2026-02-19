/**
 * Supabase クライアント（ブラウザ用）。
 * .env.local に NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_ANON_KEY を設定してください。
 */
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error(
      "Supabase の環境変数が設定されていません。NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_ANON_KEY を .env.local に追加してください。"
    )
  }
  return createSupabaseClient(url, key)
}

/**
 * Supabase クライアント（サーバー側用）。
 * Server Actions や API Routes で使用します。
 * サービスロールキー（SUPABASE_SERVICE_ROLE_KEY）が設定されている場合はそれを使用し、
 * なければ ANON KEY を使用します。
 */
export function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  // サービスロールキーがあれば優先的に使用（RLSをバイパス可能）
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const key = serviceRoleKey || anonKey

  if (!url || !key) {
    const missingVars = []
    if (!url) missingVars.push("NEXT_PUBLIC_SUPABASE_URL")
    if (!serviceRoleKey && !anonKey) {
      missingVars.push("SUPABASE_SERVICE_ROLE_KEY または NEXT_PUBLIC_SUPABASE_ANON_KEY")
    }
    throw new Error(
      `Supabase の環境変数が設定されていません: ${missingVars.join(", ")}`
    )
  }

  return createSupabaseClient(url, key)
}
