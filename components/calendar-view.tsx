"use client"

import { useState, useMemo } from "react"
import { useStore } from "@/lib/store"
import { ChevronLeft, ChevronRight, X, HelpCircle } from "lucide-react"
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns"
import { ja } from "date-fns/locale"

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"]

export function CalendarView() {
  const { dishes, getCategoryById } = useStore()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Build a map of date -> dishes
  const dishMap = useMemo(() => {
    const map: Record<string, typeof dishes> = {}
    for (const dish of dishes) {
      if (!map[dish.date]) {
        map[dish.date] = []
      }
      map[dish.date].push(dish)
    }
    return map
  }, [dishes])

  // Calendar grid days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const calStart = startOfWeek(monthStart, { weekStartsOn: 0 })
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })

    const days: Date[] = []
    let day = calStart
    while (day <= calEnd) {
      days.push(day)
      day = addDays(day, 1)
    }
    return days
  }, [currentMonth])

  const selectedDateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : null
  const selectedDishes = selectedDateStr ? dishMap[selectedDateStr] ?? [] : []

  return (
    <div className="flex flex-col gap-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-card transition-colors hover:bg-muted"
          aria-label="前月"
        >
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </button>
        <h2 className="text-base font-bold text-foreground">
          {format(currentMonth, "yyyy年 M月", { locale: ja })}
        </h2>
        <button
          type="button"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-card transition-colors hover:bg-muted"
          aria-label="翌月"
        >
          <ChevronRight className="h-5 w-5 text-foreground" />
        </button>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((wd, i) => (
          <div
            key={wd}
            className={`text-center text-xs font-semibold py-1 ${
              i === 0 ? "text-destructive" : i === 6 ? "text-sky-500" : "text-muted-foreground"
            }`}
          >
            {wd}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd")
          const dayDishes = dishMap[dateStr]
          const firstDish = dayDishes?.[0] ?? null
          const inMonth = isSameMonth(day, currentMonth)
          const today = isToday(day)
          const isSelected = selectedDate && isSameDay(day, selectedDate)

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => setSelectedDate(isSelected ? null : day)}
              className={`relative flex aspect-square flex-col items-center justify-center rounded-lg text-xs transition-all ${
                !inMonth
                  ? "text-muted-foreground/30"
                  : isSelected
                    ? "bg-primary text-primary-foreground shadow-md"
                    : today
                      ? "bg-primary/10 text-primary font-bold"
                      : "text-foreground hover:bg-muted"
              }`}
            >
              <span className={`z-10 ${firstDish?.image && inMonth ? "text-primary-foreground font-bold drop-shadow-sm" : ""}`}>
                {format(day, "d")}
              </span>

              {/* Thumbnail background */}
              {firstDish?.image && inMonth && (
                <div className="absolute inset-1 overflow-hidden rounded-md">
                  <img
                    src={firstDish.image || "/placeholder.svg"}
                    alt=""
                    className="h-full w-full object-cover opacity-60"
                  />
                </div>
              )}

              {/* Dot indicator for dishes without image */}
              {!firstDish?.image && dayDishes && dayDishes.length > 0 && inMonth && (
                <div
                  className={`mt-0.5 h-1.5 w-1.5 rounded-full ${
                    isSelected ? "bg-primary-foreground" : "bg-primary"
                  }`}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Selected date detail */}
      {selectedDate && (
        <div
          className="flex flex-col gap-2 rounded-xl bg-card p-4 shadow-sm"
          style={{ animation: "fadeSlideIn 0.25s ease-out both" }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">
              {format(selectedDate, "M月d日（E）", { locale: ja })}
            </h3>
            <button
              type="button"
              onClick={() => setSelectedDate(null)}
              className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-muted"
              aria-label="閉じる"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
          {selectedDishes.length === 0 ? (
            <p className="text-xs text-muted-foreground">この日の登録はありません</p>
          ) : (
            <div className="flex flex-col gap-2">
              {selectedDishes.map((dish) => {
                const cat = getCategoryById(dish.categoryId)
                return (
                  <div key={dish.id} className="flex items-center gap-3 rounded-lg bg-muted/50 p-2.5">
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
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
