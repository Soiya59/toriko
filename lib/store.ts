"use client"

import { useSyncExternalStore, useCallback } from "react"
import type { Dish, Category } from "./data"
import {
  INITIAL_CATEGORIES,
  INITIAL_DISHES,
  INITIAL_FULL_COURSE,
} from "./data"

type Store = {
  categories: Category[]
  dishes: Dish[]
  fullCourse: Record<string, string | null>
}

let store: Store = {
  categories: [...INITIAL_CATEGORIES],
  dishes: [...INITIAL_DISHES],
  fullCourse: { ...INITIAL_FULL_COURSE },
}

const listeners = new Set<() => void>()

function emitChange() {
  for (const listener of listeners) {
    listener()
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return store
}

export function useStore() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  const addDish = useCallback(
    (dish: Omit<Dish, "id">) => {
      const id = `d-${Date.now()}`
      store = {
        ...store,
        dishes: [...store.dishes, { ...dish, id }],
      }
      emitChange()
      return id
    },
    [],
  )

  const updateDish = useCallback(
    (dishId: string, updates: Omit<Dish, "id">) => {
      store = {
        ...store,
        dishes: store.dishes.map((d) =>
          d.id === dishId ? { ...d, ...updates } : d,
        ),
      }
      emitChange()
    },
    [],
  )

  const addCategory = useCallback((name: string) => {
    const id = `cat-${Date.now()}`
    store = {
      ...store,
      categories: [...store.categories, { id, name }],
    }
    emitChange()
    return id
  }, [])

  const renameCategory = useCallback((categoryId: string, newName: string) => {
    store = {
      ...store,
      categories: store.categories.map((c) =>
        c.id === categoryId ? { ...c, name: newName } : c,
      ),
    }
    emitChange()
  }, [])

  const deleteCategory = useCallback((categoryId: string) => {
    store = {
      ...store,
      categories: store.categories.filter((c) => c.id !== categoryId),
      dishes: store.dishes.filter((d) => d.categoryId !== categoryId),
      fullCourse: Object.fromEntries(
        Object.entries(store.fullCourse).map(([key, dishId]) => {
          if (dishId && store.dishes.find((d) => d.id === dishId)?.categoryId === categoryId) {
            return [key, null]
          }
          return [key, dishId]
        }),
      ),
    }
    emitChange()
  }, [])

  const setFullCourseSlot = useCallback(
    (slotKey: string, dishId: string | null) => {
      store = {
        ...store,
        fullCourse: { ...store.fullCourse, [slotKey]: dishId },
      }
      emitChange()
    },
    [],
  )

  const getDishesForCategory = useCallback(
    (categoryId: string) => {
      return state.dishes
        .filter((d) => d.categoryId === categoryId)
        .sort((a, b) => b.score - a.score)
    },
    [state.dishes],
  )

  const getDishById = useCallback(
    (dishId: string) => {
      return state.dishes.find((d) => d.id === dishId) ?? null
    },
    [state.dishes],
  )

  const getCategoryById = useCallback(
    (categoryId: string) => {
      return state.categories.find((c) => c.id === categoryId) ?? null
    },
    [state.categories],
  )

  const getDishesForDate = useCallback(
    (dateStr: string) => {
      return state.dishes.filter((d) => d.date === dateStr)
    },
    [state.dishes],
  )

  const getFirstDishForDate = useCallback(
    (dateStr: string) => {
      const found = state.dishes.filter((d) => d.date === dateStr)
      return found.length > 0 ? found[0] : null
    },
    [state.dishes],
  )

  const getAllDishes = useCallback(() => {
    return state.dishes
  }, [state.dishes])

  return {
    ...state,
    addDish,
    updateDish,
    addCategory,
    renameCategory,
    deleteCategory,
    setFullCourseSlot,
    getDishesForCategory,
    getDishById,
    getCategoryById,
    getDishesForDate,
    getFirstDishForDate,
    getAllDishes,
  }
}
