"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { HelpCircle, ChevronRight, Pencil, Trash2, Check, X } from "lucide-react"

type Props = {
  onSelectCategory: (categoryId: string) => void
}

export function CategoryList({ onSelectCategory }: Props) {
  const { categories, getDishesForCategory, renameCategory, deleteCategory } = useStore()
  const [editMode, setEditMode] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const sorted = [...categories].sort((a, b) =>
    a.name.localeCompare(b.name, "ja"),
  )

  function startEdit(cat: { id: string; name: string }) {
    setEditingId(cat.id)
    setEditName(cat.name)
  }

  function saveEdit() {
    if (editingId && editName.trim()) {
      renameCategory(editingId, editName.trim())
    }
    setEditingId(null)
    setEditName("")
  }

  function handleDelete(catId: string) {
    deleteCategory(catId)
    setConfirmDeleteId(null)
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Edit toggle */}
      <div className="flex items-center justify-between pb-1">
        <span className="text-xs text-muted-foreground">{categories.length} カテゴリー</span>
        <button
          type="button"
          onClick={() => {
            setEditMode(!editMode)
            setEditingId(null)
            setConfirmDeleteId(null)
          }}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            editMode
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          {editMode ? "完了" : "編集"}
        </button>
      </div>

      <div className="flex flex-col gap-1">
        {sorted.map((cat) => {
          const catDishes = getDishesForCategory(cat.id)
          const topDish = catDishes[0] ?? null
          const count = catDishes.length
          const isEditing = editingId === cat.id
          const isConfirmingDelete = confirmDeleteId === cat.id

          if (editMode && isEditing) {
            return (
              <div
                key={cat.id}
                className="flex items-center gap-2 rounded-xl bg-card px-3 py-2.5"
              >
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                  className="flex-1 rounded-lg border border-input bg-background px-2 py-1.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={saveEdit}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground"
                  aria-label="保存"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground"
                  aria-label="キャンセル"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )
          }

          if (editMode && isConfirmingDelete) {
            return (
              <div
                key={cat.id}
                className="flex items-center gap-3 rounded-xl bg-destructive/5 border border-destructive/20 px-4 py-3"
              >
                <span className="flex-1 text-sm text-foreground">
                  「{cat.name}」を削除しますか？
                </span>
                <button
                  type="button"
                  onClick={() => handleDelete(cat.id)}
                  className="rounded-lg bg-destructive px-3 py-1.5 text-xs font-semibold text-destructive-foreground"
                >
                  削除
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(null)}
                  className="rounded-lg bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground"
                >
                  戻る
                </button>
              </div>
            )
          }

          return (
            <div
              key={cat.id}
              className="flex items-center gap-3 rounded-xl bg-card px-4 py-3 text-card-foreground transition-all hover:shadow-md"
            >
              {editMode && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => startEdit(cat)}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="名前変更"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(cat.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-destructive hover:bg-destructive/10 transition-colors"
                    aria-label="削除"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => !editMode && onSelectCategory(cat.id)}
                className="flex flex-1 items-center gap-3"
                disabled={editMode}
              >
                {/* Thumbnail */}
                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                  {topDish?.image ? (
                    <img
                      src={topDish.image || "/placeholder.svg"}
                      alt={topDish.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <HelpCircle className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>

                {/* Category Name */}
                <span className="flex-1 text-left text-sm font-semibold">{cat.name}</span>

                {/* Count + Arrow */}
                <span className="text-xs text-muted-foreground">({count})</span>
                {!editMode && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
