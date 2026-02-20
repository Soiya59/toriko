"use client"

import { useState, useRef, useEffect, type FormEvent, type ChangeEvent } from "react"
import { useStore } from "@/lib/store"
import type { Dish } from "@/lib/data"
import { Camera, Plus, Check, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import imageCompression from "browser-image-compression"

type Props = {
  editingItem: Dish | null
  onComplete: () => void
  onClearEdit: () => void
  /** Supabase などに永続化する場合。編集時は previousCategoryId を渡し、両カテゴリーの再計算が行われる */
  onPersist?: (
    item: Dish,
    options: { previousCategoryId?: string }
  ) => void | Promise<void>
}

export function RegistrationForm({ editingItem, onComplete, onClearEdit, onPersist }: Props) {
  const { categories, addDish, updateDish, addCategory } = useStore()
  const { toast } = useToast()
  const [categoryId, setCategoryId] = useState("")
  const [newCategoryName, setNewCategoryName] = useState("")
  const [isNewCategory, setIsNewCategory] = useState(false)
  const [dishName, setDishName] = useState("")
  const [score, setScore] = useState("")
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [comment, setComment] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  /** 新しく写真が選ばれた場合のみ true（Storage アップロード対象） */
  const hasNewImageFile = useRef(false)

  const sorted = [...categories].sort((a, b) =>
    a.name.localeCompare(b.name, "ja"),
  )

  // 編集モード: editingItem を初期値にセット
  useEffect(() => {
    if (editingItem) {
      setCategoryId(editingItem.categoryId)
      setNewCategoryName("")
      setIsNewCategory(false)
      setDishName(editingItem.name)
      setScore(String(editingItem.score))
      setDate(editingItem.date)
      setComment(editingItem.comment)
      setImagePreview(editingItem.image ?? null)
      hasNewImageFile.current = false
    } else {
      setCategoryId("")
      setNewCategoryName("")
      setIsNewCategory(false)
      setDishName("")
      setScore("")
      setDate(format(new Date(), "yyyy-MM-dd"))
      setComment("")
      setImagePreview(null)
      hasNewImageFile.current = false
    }
  }, [editingItem])

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    hasNewImageFile.current = true
    const reader = new FileReader()
    reader.onload = (ev) => {
      setImagePreview(ev.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  function resetFormAndComplete() {
    setSuccess(false)
    setCategoryId("")
    setNewCategoryName("")
    setIsNewCategory(false)
    setDishName("")
    setScore("")
    setDate(format(new Date(), "yyyy-MM-dd"))
    setComment("")
    setImagePreview(null)
    hasNewImageFile.current = false
    onClearEdit()
    onComplete()
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    // 既に保存中の場合は処理を中断
    if (isSaving) return

    let catId = categoryId
    if (isNewCategory && newCategoryName.trim()) {
      catId = addCategory(newCategoryName.trim())
    }

    // 入力値の正規化（全角・半角スペース、特殊文字の除去）
    const normalizedDishName = dishName.trim().replace(/[\u3000\u00A0\u2000-\u200B\u2028\u2029]/g, "").replace(/[」』]/g, "")
    const normalizedComment = comment.trim().replace(/[\u3000\u00A0\u2000-\u200B\u2028\u2029]/g, "")

    if (!catId || !normalizedDishName || !score || !date) return

    setIsSaving(true)

    try {
      const scoreNum = Number.parseFloat(score)
      
      // 楽観的更新: まず画像圧縮を待たずにストアに追加（体感速度向上）
      const tempPayload = {
        name: normalizedDishName,
        categoryId: catId,
        score: scoreNum,
        comment: normalizedComment,
        date,
        image: imagePreview, // 一時的にプレビュー画像を使用
      }

      let newId: string | undefined
      if (editingItem) {
        // 編集時は既存画像を維持
        const imageToSave = hasNewImageFile.current ? imagePreview : (editingItem.image ?? imagePreview)
        const updatedItem: Dish = {
          id: editingItem.id,
          ...tempPayload,
          image: imageToSave,
        }
        updateDish(editingItem.id, {
          ...tempPayload,
          image: imageToSave,
        })
        newId = editingItem.id
      } else {
        // 新規登録: すぐにストアに追加（楽観的更新）
        newId = addDish(tempPayload)
      }

      // 画像圧縮を非同期で実行（バックグラウンド処理）
      let compressedImageDataUrl: string | null = imagePreview
      if (hasNewImageFile.current && fileInputRef.current?.files?.[0]) {
        const originalFile = fileInputRef.current.files[0]
        try {
          const compressedFile = await imageCompression(originalFile, {
            maxSizeMB: 0.8,
            maxWidthOrHeight: 1280,
            useWebWorker: true,
          })
          const reader = new FileReader()
          compressedImageDataUrl = await new Promise<string>((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(compressedFile)
          })
          
          // 圧縮完了後にストアを更新
          if (editingItem) {
            updateDish(editingItem.id, { image: compressedImageDataUrl })
          } else if (newId) {
            updateDish(newId, { image: compressedImageDataUrl })
          }
        } catch (compressError) {
          console.error("画像圧縮エラー:", compressError)
          // 圧縮失敗時は元の画像のまま（既にストアに追加済み）
        }
      }

      // Supabase に保存（圧縮後の画像で）
      const finalPayload = {
        name: normalizedDishName,
        categoryId: catId,
        score: scoreNum,
        comment: normalizedComment,
        date,
        image: compressedImageDataUrl,
      }

      if (editingItem) {
        const imageToSave = hasNewImageFile.current ? compressedImageDataUrl : (editingItem.image ?? compressedImageDataUrl)
        const updatedItem: Dish = {
          id: editingItem.id,
          ...finalPayload,
          image: imageToSave,
        }
        await onPersist?.(updatedItem, { previousCategoryId: editingItem.categoryId })
      } else if (newId) {
        const newItem: Dish = { id: newId, ...finalPayload }
        await onPersist?.(newItem, {})
      }

      // 成功通知を表示
      toast({
        title: "登録しました！",
        description: editingItem ? "料理の情報を更新しました" : "新しい料理を登録しました",
      })

      setSuccess(true)
      setTimeout(resetFormAndComplete, 1200)
    } catch (error) {
      // エラー通知を表示
      toast({
        title: "エラーが発生しました",
        description: error instanceof Error ? error.message : "保存に失敗しました",
        variant: "destructive",
      })
      setIsSaving(false)
    }
  }

  if (success) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-4 py-16"
        style={{ animation: "fadeSlideIn 0.3s ease-out both" }}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary">
          <Check className="h-8 w-8 text-primary-foreground" />
        </div>
        <p className="text-lg font-bold text-foreground">登録完了!</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">
          {editingItem ? "料理を編集" : "新しい料理を登録"}
        </h2>
        {editingItem && (
          <button
            type="button"
            onClick={resetFormAndComplete}
            className="text-sm text-muted-foreground underline hover:text-foreground"
          >
            キャンセル
          </button>
        )}
      </div>

      {/* Category selection */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-foreground">カテゴリー</label>
        {!isNewCategory ? (
          <div className="flex gap-2">
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="flex-1 rounded-lg border border-input bg-card px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
              required={!isNewCategory}
            >
              <option value="">カテゴリーを選択</option>
              {sorted.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setIsNewCategory(true)}
              className="flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Plus className="h-3.5 w-3.5" />
              新規
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="新しいカテゴリー名"
              className="flex-1 rounded-lg border border-input bg-card px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
              required={isNewCategory}
            />
            <button
              type="button"
              onClick={() => {
                setIsNewCategory(false)
                setNewCategoryName("")
              }}
              className="rounded-lg bg-muted px-3 py-2 text-xs font-semibold text-muted-foreground"
            >
              既存から
            </button>
          </div>
        )}
      </div>

      {/* Dish name */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-foreground">料理名</label>
        <input
          type="text"
          value={dishName}
          onChange={(e) => {
            // 入力時にリアルタイムで正規化（全角スペース・特殊文字を除去）
            const normalized = e.target.value.replace(/[\u3000\u00A0\u2000-\u200B\u2028\u2029]/g, "").replace(/[」』]/g, "")
            setDishName(normalized)
          }}
          placeholder="例：黒毛和牛100%ハンバーグ"
          className="rounded-lg border border-input bg-card px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          required
        />
      </div>

      {/* Score */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-foreground">点数 (0.00 - 5.00)</label>
        <input
          type="number"
          step="0.01"
          min="0"
          max="5"
          value={score}
          onChange={(e) => setScore(e.target.value)}
          placeholder="例：4.50"
          className="rounded-lg border border-input bg-card px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          required
        />
      </div>

      {/* Date */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-foreground">日付</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-lg border border-input bg-card px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          required
        />
      </div>

      {/* Photo */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-foreground">写真</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
        {imagePreview ? (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative h-40 w-40 overflow-hidden rounded-xl"
          >
            <img
              src={imagePreview || "/placeholder.svg"}
              alt="プレビュー"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-foreground/20">
              <Camera className="h-6 w-6 text-card" />
            </div>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-32 w-32 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border bg-muted transition-colors hover:bg-muted/80"
          >
            <Camera className="h-6 w-6 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">写真を追加</span>
          </button>
        )}
      </div>

      {/* Comment */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-foreground">コメント</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="短いコメントを入力..."
          rows={2}
          className="rounded-lg border border-input bg-card px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring resize-none"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSaving}
        className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100"
      >
        {isSaving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>保存中...</span>
          </>
        ) : (
          <span>{editingItem ? "更新する" : "この料理を登録する"}</span>
        )}
      </button>
    </form>
  )
}
