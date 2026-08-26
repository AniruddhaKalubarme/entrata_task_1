import { useEffect, useState } from 'react'
import type { Habit, HabitDraft } from '../types'
import { loadHabits, saveHabits } from '../lib/habits'

export function useHabits() {
  const initial = loadHabits()
  const [habits, setHabits] = useState<Habit[]>(initial.habits)
  const [storageMessage, setStorageMessage] = useState(initial.error ? 'Saved habits could not be read. Starting with an empty list.' : '')
  useEffect(() => { if (!saveHabits(habits)) setStorageMessage('Your changes could not be saved in this browser.') }, [habits])
  const update = (id: string, change: (habit: Habit) => Habit) => setHabits(current => current.map(habit => habit.id === id ? change(habit) : habit))
  const add = (draft: HabitDraft) => {
    const now = new Date().toISOString()
    setHabits(current => [...current, { ...draft, category: draft.category ?? 'Life', name: draft.name.trim(), notes: draft.notes.trim(), id: crypto.randomUUID(), createdAt: now, updatedAt: now, archived: false, completions: {} }])
  }
  return { habits, storageMessage, add, update, setHabits }
}
