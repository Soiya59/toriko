"use client"

import { useStore } from "@/lib/store"
import { FULL_COURSE_SLOTS } from "@/lib/data"
import { X, Check } from "lucide-react"

type Props = {
  dishId: string
  dishName: string
  onClose: () => void
  onSaveFullCourse?: (fullCourse: Record<string, string | null>) => void | Promise<void>
}

export function FullCourseSlotPicker({ dishId, dishName, onClose, onSaveFullCourse }: Props) {
  const { fullCourse, setFullCourseSlot, getDishById } = useStore()

  async function handleSelect(slotKey: string) {
    const next = { ...fullCourse, [slotKey]: dishId }
    await onSaveFullCourse?.(next)
    setFullCourseSlot(slotKey, dishId)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/40"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        role="button"
        tabIndex={0}
        aria-label="閉じる"
      />
      {/* Panel */}
      <div
        className="relative z-10 w-full max-w-md rounded-t-2xl bg-card p-5 shadow-xl sm:rounded-2xl"
        style={{ animation: "slideUp 0.3s ease-out both" }}
      >
        <div className="flex items-center justify-between pb-4">
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-foreground">フルコースに登録</h3>
            <p className="text-xs text-muted-foreground truncate max-w-[240px]">
              {dishName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted"
            aria-label="閉じる"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {FULL_COURSE_SLOTS.map((slot) => {
            const currentDishId = fullCourse[slot.key]
            const currentDish = currentDishId ? getDishById(currentDishId) : null
            const isCurrentlyAssigned = currentDishId === dishId

            return (
              <button
                key={slot.key}
                type="button"
                onClick={() => handleSelect(slot.key)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all ${
                  isCurrentlyAssigned
                    ? "bg-primary/10 ring-2 ring-primary"
                    : "bg-muted/50 hover:bg-muted"
                }`}
              >
                <span className="text-lg">{slot.emoji}</span>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="text-sm font-semibold text-foreground">{slot.label}</span>
                  {currentDish && !isCurrentlyAssigned ? (
                    <span className="text-xs text-muted-foreground truncate">
                      現在: {currentDish.name}
                    </span>
                  ) : !currentDish ? (
                    <span className="text-xs text-muted-foreground">未設定</span>
                  ) : null}
                </div>
                {isCurrentlyAssigned && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
