"use client"

import { useState, useEffect, useRef } from "react"
import { useStore } from "@/lib/store"
import type { Dish } from "@/lib/data"
import { ArrowLeft, Crown, HelpCircle, Utensils, Pencil } from "lucide-react"
import { FullCourseSlotPicker } from "./full-course-slot-picker"

type Props = {
  categoryId: string
  onBack: () => void
  onEditItem?: (item: Dish) => void
  onSaveFullCourse?: (fullCourse: Record<string, string | null>) => void | Promise<void>
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
        style={{ background: "hsl(43, 96%, 56%)" }}
      >
        <Crown className="h-4 w-4 text-foreground" />
      </div>
    )
  }
  if (rank === 2) {
    return (
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
        style={{ background: "hsl(210, 5%, 68%)" }}
      >
        <Crown className="h-4 w-4 text-foreground" />
      </div>
    )
  }
  if (rank === 3) {
    return (
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
        style={{ background: "hsl(25, 50%, 48%)" }}
      >
        <Crown className="h-4 w-4 text-card" />
      </div>
    )
  }
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
      <span className="text-xs font-bold text-muted-foreground">{rank}</span>
    </div>
  )
}

export function RankingView({ categoryId, onBack, onEditItem, onSaveFullCourse }: Props) {
  const { getCategoryById, getDishesForCategory } = useStore()
  const category = getCategoryById(categoryId)
  const dishes = getDishesForCategory(categoryId)
  const listRef = useRef<HTMLDivElement>(null)
  const previousDishesLengthRef = useRef(dishes.length)

  const [slotPickerDish, setSlotPickerDish] = useState<{
    id: string
    name: string
  } | null>(null)

  // 新しい項目が追加されたら自動スクロール
  useEffect(() => {
    if (dishes.length > previousDishesLengthRef.current && dishes.length > 0) {
      // 新しい項目が追加された場合、一番上（1位）にスクロール
      setTimeout(() => {
        listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      }, 100)
    }
    previousDishesLengthRef.current = dishes.length
  }, [dishes.length])

  if (!category) return null

  return (
    <>
      <div className="flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 pb-4">
          <button
            type="button"
            onClick={onBack}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-card transition-colors hover:bg-muted"
            aria-label="戻る"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <h2 className="text-lg font-bold text-foreground">{category.name}</h2>
          <span className="text-sm text-muted-foreground">{dishes.length}件</span>
        </div>

        {/* Ranking Cards */}
        <div ref={listRef} className="flex flex-col gap-3">
          {dishes.map((dish, idx) => {
            const rank = idx + 1
            return (
              <div
                key={dish.id}
                className="flex items-start gap-3 rounded-xl bg-card p-3 shadow-sm transition-all"
                style={{
                  animationDelay: `${idx * 60}ms`,
                  animation: "fadeSlideIn 0.3s ease-out both",
                }}
              >
                <RankBadge rank={rank} />
                {/* Image */}
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                  {dish.image ? (
                    <img
                      src={dish.image || "/placeholder.svg"}
                      alt={dish.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <HelpCircle className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                {/* Info */}
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-sm font-bold text-foreground truncate">
                    {dish.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-primary">
                      {dish.score.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{dish.date}</span>
                  </div>
                  <span className="text-xs text-muted-foreground line-clamp-1">
                    {dish.comment}
                  </span>
                </div>
                <div className="flex shrink-0 flex-col items-center gap-1.5 self-center">
                  {onEditItem && (
                    <button
                      type="button"
                      onClick={() => onEditItem(dish)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
                      aria-label="編集"
                      title="編集"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      setSlotPickerDish({ id: dish.id, name: dish.name })
                    }
                    className="flex items-center gap-1 rounded-lg bg-accent/20 px-2.5 py-1.5 text-[10px] font-semibold text-accent-foreground transition-colors hover:bg-accent/30"
                    title="フルコースに登録"
                  >
                    <Utensils className="h-3 w-3" />
                    <span className="hidden sm:inline">フルコースへ</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Slot Picker Modal */}
      {slotPickerDish && (
        <FullCourseSlotPicker
          dishId={slotPickerDish.id}
          dishName={slotPickerDish.name}
          onClose={() => setSlotPickerDish(null)}
          onSaveFullCourse={onSaveFullCourse}
        />
      )}
    </>
  )
}
