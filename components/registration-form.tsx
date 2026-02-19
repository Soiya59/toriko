"use client"

import { useState, useRef, useEffect, type FormEvent, type ChangeEvent } from "react"
import { useStore } from "@/lib/store"
import type { Dish } from "@/lib/data"
import { Camera, Plus, Check } from "lucide-react"
import { format } from "date-fns"

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
  const [categoryId, setCategoryId] = useState("")
  const [newCategoryName, setNewCategoryName] = useState("")
  const [isNewCategory, setIsNewCategory] = useState(false)
  const [dishName, setDishName] = useState("")
  const [score, setScore] = useState("")
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [comment, setComment] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
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

    let catId = categoryId
    if (isNewCategory && newCategoryName.trim()) {
      catId = addCategory(newCategoryName.trim())
    }

    if (!catId || !dishName.trim() || !score || !date) return

    const scoreNum = Number.parseFloat(score)
    const payload = {
      name: dishName.trim(),
      categoryId: catId,
      score: scoreNum,
      comment: comment.trim(),
      date,
      image: imagePreview,
    }

    if (editingItem) {
      // 写真: 新しく選ばれた場合のみ URL を更新。未選択の場合は既存画像を維持
      const imageToSave = hasNewImageFile.current ? imagePreview : (editingItem.image ?? imagePreview)
      const updatedItem: Dish = {
        id: editingItem.id,
        ...payload,
        image: imageToSave,
      }
      updateDish(editingItem.id, {
        ...payload,
        image: imageToSave,
      })
      await onPersist?.(updatedItem, { previousCategoryId: editingItem.categoryId })
    } else {
      const newId = addDish(payload)
      const newItem: Dish = { id: newId, ...payload }
      await onPersist?.(newItem, {})
    }

    setSuccess(true)
    setTimeout(resetFormAndComplete, 1200)
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
          onChange={(e) => setDishName(e.target.value)}
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
        className="mt-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.98]"
      >
        {editingItem ? "更新する" : "この料理を登録する"}
      </button>
    </form>
  )
}
