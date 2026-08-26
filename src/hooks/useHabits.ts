import { useEffect, useState } from 'react'
import type { Habit, HabitDraft } from '../types'
import { loadHabits, saveHabits } from '../lib/habits'
import { createHabit, fetchHabits, replaceHabit } from '../lib/api'

export function useHabits() {
  const initial = loadHabits()
  const [habits, setHabits] = useState<Habit[]>(initial.habits)
  const [storageMessage, setStorageMessage] = useState(initial.error ? 'Saved habits could not be read. Starting with an empty list.' : '')
  useEffect(() => { fetchHabits().then(remoteHabits => { if (remoteHabits.length) setHabits(remoteHabits) }).catch(() => setStorageMessage(current => current || 'Using offline habits. The API is unavailable.')) }, [])
  useEffect(() => { if (!saveHabits(habits)) setStorageMessage('Your changes could not be saved in this browser.') }, [habits])
  const update = (id: string, change: (habit: Habit) => Habit) => setHabits(current => {
    const updated = current.map(habit => habit.id === id ? change(habit) : habit)
    const changedHabit = updated.find(habit => habit.id === id)
    if (changedHabit) replaceHabit(changedHabit).catch(() => setStorageMessage('Saved locally. The API could not be reached.'))
    return updated
  })
  const add = (draft: HabitDraft) => {
    const now = new Date().toISOString()
    const habit: Habit = { ...draft, category: draft.category ?? 'Life', name: draft.name.trim(), notes: draft.notes.trim(), id: crypto.randomUUID(), createdAt: now, updatedAt: now, archived: false, completions: {} }
    setHabits(current => [...current, habit])
    createHabit(habit).catch(() => setStorageMessage('Saved locally. The API could not be reached.'))
  }
  return { habits, storageMessage, add, update, setHabits }
}
