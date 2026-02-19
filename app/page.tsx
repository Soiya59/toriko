"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { CategoryList } from "@/components/category-list"
import { RankingView } from "@/components/ranking-view"
import { FullCourseView } from "@/components/full-course-view"
import { RegistrationForm } from "@/components/registration-form"
import { CalendarView } from "@/components/calendar-view"
import type { Dish } from "@/lib/data"
import { hydrateStore } from "@/lib/store"
import { saveRankingItem, getInitialData, saveFullCourseSelection } from "@/app/actions"
import {
  List,
  Utensils,
  PlusCircle,
  ChefHat,
  CalendarDays,
} from "lucide-react"

type Tab = "categories" | "calendar" | "fullcourse" | "register"
type Screen = { type: "list" } | { type: "ranking"; categoryId: string }

export default function Page() {
  const [tab, setTab] = useState<Tab>("categories")
  const [screen, setScreen] = useState<Screen>({ type: "list" })
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [editingItem, setEditingItem] = useState<Dish | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  function handleEditItem(item: Dish) {
    setEditingItem(item)
    setTab("register")
  }

  const handleRegistrationComplete = useCallback(() => {
    setEditingItem(null)
    setTab("categories")
  }, [])

  function navigateToRanking(categoryId: string) {
    setIsTransitioning(true)
    setTimeout(() => {
      setScreen({ type: "ranking", categoryId })
      setIsTransitioning(false)
    }, 150)
  }

  function navigateBackToList() {
    setIsTransitioning(true)
    setTimeout(() => {
      setScreen({ type: "list" })
      setIsTransitioning(false)
    }, 150)
  }

  // ページ読み込み時に Supabase から最新データを取得してストアに反映
  useEffect(() => {
    getInitialData().then((res) => {
      if (res.success && res.categories && res.dishes) {
        hydrateStore(res.categories, res.dishes, res.fullCourse)
      }
    })
  }, [])

  // Scroll to top when tab changes
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" })
  }, [tab])

  // Reset screen when changing to categories tab
  useEffect(() => {
    if (tab === "categories") {
      setScreen({ type: "list" })
    }
  }, [tab])

  const tabs: { key: Tab; label: string; icon: typeof List }[] = [
    { key: "categories", label: "カテゴリ", icon: List },
    { key: "calendar", label: "カレンダー", icon: CalendarDays },
    { key: "fullcourse", label: "フルコース", icon: Utensils },
    { key: "register", label: "登録", icon: PlusCircle },
  ]

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {/* Top Header */}
      <header className="sticky top-0 z-30 flex items-center gap-2.5 border-b border-border bg-card px-4 py-3 shadow-sm">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <ChefHat className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-sm font-black tracking-tight text-foreground leading-tight">
            Gourmet Hunter
          </h1>
          <span className="text-[10px] font-semibold text-primary leading-tight">SEIYA</span>
        </div>
      </header>

      {/* Content */}
      <main ref={contentRef} className="flex-1 overflow-y-auto px-4 py-4">
        <div
          className={`transition-all duration-150 ${
            isTransitioning
              ? "translate-y-2 opacity-0"
              : "translate-y-0 opacity-100"
          }`}
        >
          {tab === "categories" && (
            <>
              {screen.type === "list" && (
                <CategoryList onSelectCategory={navigateToRanking} />
              )}
              {screen.type === "ranking" && (
                <RankingView
                  categoryId={screen.categoryId}
                  onBack={navigateBackToList}
                  onEditItem={handleEditItem}
                  onSaveFullCourse={async (fullCourse) => {
                    await saveFullCourseSelection(fullCourse)
                  }}
                />
              )}
            </>
          )}
          {tab === "calendar" && <CalendarView />}
          {tab === "fullcourse" && (
            <FullCourseView
              onSaveFullCourse={async (fullCourse) => {
                await saveFullCourseSelection(fullCourse)
              }}
            />
          )}
          {tab === "register" && (
            <RegistrationForm
              editingItem={editingItem}
              onComplete={handleRegistrationComplete}
              onClearEdit={() => setEditingItem(null)}
              onPersist={async (item, opts) => {
                try {
                  const result = await saveRankingItem(item, opts)
                  if (!result.success) {
                    console.error("[Client] 保存に失敗しました:", result.error)
                    throw new Error(result.error || "保存に失敗しました")
                  }
                  // 保存後にサーバーから再取得し、ランク順・カテゴリー一覧を最新に反映
                  const fresh = await getInitialData()
                  if (fresh.success && fresh.categories && fresh.dishes) {
                    hydrateStore(fresh.categories, fresh.dishes, fresh.fullCourse)
                  }
                } catch (err) {
                  console.error("[Client] 保存処理で例外が発生しました:", err)
                  if (err instanceof Error) {
                    console.error("[Client] エラーメッセージ:", err.message)
                  }
                  throw err
                }
              }}
            />
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="sticky bottom-0 z-30 flex items-stretch border-t border-border bg-card shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        {tabs.map((t) => {
          const isActive = tab === t.key
          const Icon = t.icon
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`relative flex flex-1 flex-col items-center gap-0.5 py-2.5 transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-semibold">{t.label}</span>
              {isActive && (
                <div className="absolute bottom-0 h-0.5 w-10 rounded-full bg-primary" />
              )}
            </button>
          )
        })}
      </nav>

      {/* Global animations */}
      <style>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
