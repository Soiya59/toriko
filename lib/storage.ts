import type { SupabaseClient } from "@supabase/supabase-js"

/** Storage バケット名（.env で上書き可。Supabase で Public バケットを作成し RLS を設定すること） */
export function getStorageBucket(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ?? "dish-images"
}

/**
 * 公開 URL からバケット内パスを取り出す（当アプリの Storage URL のみ想定）
 */
export function parseStoragePathFromPublicUrl(
  publicUrl: string,
  bucket: string,
): string | null {
  const marker = `/object/public/${bucket}/`
  const idx = publicUrl.indexOf(marker)
  if (idx === -1) return null
  try {
    return decodeURIComponent(publicUrl.slice(idx + marker.length))
  } catch {
    return publicUrl.slice(idx + marker.length)
  }
}

/**
 * 料理画像を Storage にアップロードし、公開 URL を返す。
 */
export async function uploadDishImage(
  client: SupabaseClient,
  dishId: string,
  imageBlob: Blob,
): Promise<string> {
  const bucket = getStorageBucket()
  const isPng = imageBlob.type === "image/png"
  const ext = isPng ? "png" : "jpg"
  const contentType = imageBlob.type || (isPng ? "image/png" : "image/jpeg")
  const path = `dishes/${dishId}/${Date.now()}.${ext}`

  const { error } = await client.storage.from(bucket).upload(path, imageBlob, {
    contentType,
    upsert: false,
  })
  if (error) throw new Error(error.message)

  const { data } = client.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

/**
 * 以前の画像が同一バケット上のオブジェクトなら削除する（差し替え時の掃除用）
 */
export async function removeDishImageIfOurs(
  client: SupabaseClient,
  publicUrl: string | null,
): Promise<void> {
  if (!publicUrl) return
  const bucket = getStorageBucket()
  const path = parseStoragePathFromPublicUrl(publicUrl, bucket)
  if (!path) return
  const { error } = await client.storage.from(bucket).remove([path])
  if (error) console.warn("Storage 上の古い画像の削除に失敗:", error.message)
}
