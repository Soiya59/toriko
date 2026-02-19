"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { FULL_COURSE_SLOTS } from "@/lib/data"
import { HelpCircle, Utensils, X, Search, Check } from "lucide-react"

const SLOT_COLORS: Record<string, string> = {
  appetizer: "from-emerald-50 to-emerald-100",
  soup: "from-amber-50 to-amber-100",
  fish: "from-sky-50 to-sky-100",
  meat: "from-red-50 to-red-100",
  main: "from-orange-50 to-orange-100",
  salad: "from-lime-50 to-lime-100",
  dessert: "from-pink-50 to-pink-100",
  drink: "from-indigo-50 to-indigo-100",
}

const SLOT_BORDER_COLORS: Record<string, string> = {
  appetizer: "border-emerald-200",
  soup: "border-amber-200",
  fish: "border-sky-200",
  meat: "border-red-200",
  main: "border-orange-200",
  salad: "border-lime-200",
  dessert: "border-pink-200",
  drink: "border-indigo-200",
}

const SLOT_TEXT_COLORS: Record<string, string> = {
  appetizer: "text-emerald-700",
  soup: "text-amber-700",
  fish: "text-sky-700",
  meat: "text-red-700",
  main: "text-orange-700",
  salad: "text-lime-700",
  dessert: "text-pink-700",
  drink: "text-indigo-700",
}

type Props = {
  onSaveFullCourse?: (fullCourse: Record<string, string | null>) => void | Promise<void>
}

export function FullCourseView({ onSaveFullCourse }: Props) {
  const { fullCourse, getDishById, getCategoryById, categories, getDishesForCategory, setFullCourseSlot, dishes } = useStore()
  const [selectingSlot, setSelectingSlot] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  // Build list of top dishes from each category + all dishes for search
  const topDishes = categories
    .map((cat) => {
      const ranked = getDishesForCategory(cat.id)
      return ranked[0] ?? null
    })
    .filter(Boolean)

  const filteredDishes = search.trim()
    ? dishes.filter((d) =>
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        getCategoryById(d.categoryId)?.name.toLowerCase().includes(search.toLowerCase()),
      )
    : topDishes

  return (
    <>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 pb-1">
          <Utensils className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">人生のフルコース</h2>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {FULL_COURSE_SLOTS.map((slot, idx) => {
            const dishId = fullCourse[slot.key]
            const dish = dishId ? getDishById(dishId) : null
            const category = dish ? getCategoryById(dish.categoryId) : null
            const gradient = SLOT_COLORS[slot.key] ?? "from-muted to-muted"
            const borderColor = SLOT_BORDER_COLORS[slot.key] ?? "border-border"
            const textColor = SLOT_TEXT_COLORS[slot.key] ?? "text-muted-foreground"

            return (
              <button
                key={slot.key}
                type="button"
                onClick={() => {
                  setSelectingSlot(slot.key)
                  setSearch("")
                }}
                className={`relative flex items-center gap-3 overflow-hidden rounded-xl border-2 ${borderColor} bg-gradient-to-br ${gradient} p-4 transition-all text-left hover:shadow-md active:scale-[0.98]`}
                style={{
                  animationDelay: `${idx * 80}ms`,
                  animation: "fadeSlideIn 0.4s ease-out both",
                }}
              >
                {/* Slot label */}
                <div className="absolute right-3 top-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${textColor} opacity-60`}>
                    {slot.label}
                  </span>
                </div>

                {/* Image / Placeholder */}
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-card/80 shadow-sm">
                  {dish?.image ? (
                    <img
                      src={dish.image || "/placeholder.svg"}
                      alt={dish.name}
                      className="h-full w-full object-cover"
                    />
                  ) : dish ? (
                    <span className="text-2xl">{slot.emoji}</span>
                  ) : (
                    <HelpCircle className="h-6 w-6 text-muted-foreground/40" />
                  )}
                </div>

                {/* Content */}
                <div className="flex min-w-0 flex-1 flex-col">
                  {dish ? (
                    <>
                      <span className="text-sm font-bold text-foreground truncate">
                        {dish.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {category?.name} / {dish.score.toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground italic">
                      タップして設定
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Slot selection modal */}
      {selectingSlot && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setSelectingSlot(null)}
            onKeyDown={(e) => e.key === "Escape" && setSelectingSlot(null)}
            role="button"
            tabIndex={0}
            aria-label="閉じる"
          />
          <div
            className="relative z-10 flex max-h-[80vh] w-full max-w-md flex-col rounded-t-2xl bg-card shadow-xl sm:rounded-2xl"
            style={{ animation: "slideUp 0.3s ease-out both" }}
          >
            <div className="flex items-center justify-between border-b border-border p-4">
              <div className="flex flex-col">
                <h3 className="text-sm font-bold text-foreground">
                  {FULL_COURSE_SLOTS.find((s) => s.key === selectingSlot)?.label} を選択
                </h3>
                <p className="text-xs text-muted-foreground">各カテゴリーの1位、または検索して選択</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectingSlot(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted"
                aria-label="閉じる"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            {/* Search */}
            <div className="border-b border-border px-4 py-2">
              <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="料理名・カテゴリーで検索..."
                  className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
              </div>
            </div>

            {/* Clear slot option */}
            <div className="border-b border-border px-4 py-2">
              <button
                type="button"
                onClick={async () => {
                  const next = { ...fullCourse, [selectingSlot!]: null }
                  await onSaveFullCourse?.(next)
                  setFullCourseSlot(selectingSlot!, null)
                  setSelectingSlot(null)
                }}
                className="w-full rounded-lg px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted transition-colors"
              >
                設定を解除する
              </button>
            </div>

            {/* Dish list */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex flex-col gap-2">
                {filteredDishes.map((dish) => {
                  if (!dish) return null
                  const cat = getCategoryById(dish.categoryId)
                  const isCurrentlySet = fullCourse[selectingSlot] === dish.id
                  return (
                    <button
                      key={dish.id}
                      type="button"
                      onClick={async () => {
                        const next = { ...fullCourse, [selectingSlot]: dish.id }
                        await onSaveFullCourse?.(next)
                        setFullCourseSlot(selectingSlot, dish.id)
                        setSelectingSlot(null)
                      }}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all ${
                        isCurrentlySet
                          ? "bg-primary/10 ring-2 ring-primary"
                          : "bg-muted/50 hover:bg-muted"
                      }`}
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-card">
                        {dish.image ? (
                          <img src={dish.image || "/placeholder.svg"} alt={dish.name} className="h-full w-full object-cover" />
                        ) : (
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="text-sm font-semibold text-foreground truncate">{dish.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {cat?.name} / {dish.score.toFixed(2)}
                        </span>
                      </div>
                      {isCurrentlySet && <Check className="h-4 w-4 text-primary" />}
                    </button>
                  )
                })}
                {filteredDishes.length === 0 && (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    該当する料理が見つかりません
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
