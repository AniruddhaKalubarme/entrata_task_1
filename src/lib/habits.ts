import type { Habit, HabitDraft, HabitCategory } from '../types'
import { addDays, dateKey, daysBetween, isFutureKey, parseKey, startOfWeek, weekKey } from './dates'

export const STORAGE_KEY = 'habit-tracker-data'
export const categories: HabitCategory[] = ['Health', 'Mind', 'Growth', 'Life']

export function calculateDailyStreak(habit: Habit, today = new Date()): number {
  const completed = Object.entries(habit.completions)
    .filter(([key, count]) => count > 0 && !isFutureKey(key, today))
    .map(([key]) => parseKey(key))
    .sort((a, b) => b.getTime() - a.getTime())
  if (!completed.length) return 0
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const firstGap = daysBetween(todayDate, completed[0]) > 1 ? 0 : 1
  let streak = firstGap
  for (let index = 1; index < completed.length; index += 1) {
    if (daysBetween(completed[index - 1], completed[index]) !== 1) break
    streak += 1
  }
  return streak
}

export function getWeeklyProgress(habit: Habit, anchor = new Date()): number {
  const start = startOfWeek(anchor)
  const end = addDays(start, 6)
  return Object.entries(habit.completions).reduce((total, [key, count]) => {
    const date = parseKey(key)
    return date >= start && date <= end && !isFutureKey(key) ? total + count : total
  }, 0)
}

export function calculateWeeklyStreak(habit: Habit, today = new Date()): number {
  const target = Math.max(1, habit.targetCompletions ?? 1)
  const weeklyCounts = new Map<string, number>()
  Object.entries(habit.completions).forEach(([key, count]) => {
    if (count > 0 && !isFutureKey(key, today)) {
      const keyForWeek = weekKey(parseKey(key))
      weeklyCounts.set(keyForWeek, (weeklyCounts.get(keyForWeek) ?? 0) + count)
    }
  })
  let cursor = startOfWeek(today)
  if ((weeklyCounts.get(dateKey(cursor)) ?? 0) < target) cursor = addDays(cursor, -7)
  let streak = 0
  while ((weeklyCounts.get(dateKey(cursor)) ?? 0) >= target) {
    streak += 1
    cursor = addDays(cursor, -7)
  }
  return streak
}

export function validateHabitDraft(draft: HabitDraft): string | null {
  if (!draft.name.trim()) return 'Give your habit a name.'
  if (!['daily', 'weekly'].includes(draft.frequency)) return 'Choose a valid frequency.'
  if (draft.frequency === 'weekly' && (!Number.isInteger(draft.targetCompletions) || draft.targetCompletions < 1 || draft.targetCompletions > 7)) return 'Weekly target must be between 1 and 7.'
  return null
}

export function normalizeHabits(value: unknown): Habit[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((item): Habit[] => {
    if (!item || typeof item !== 'object') return []
    const candidate = item as Partial<Habit>
    if (typeof candidate.id !== 'string' || typeof candidate.name !== 'string' || !['daily', 'weekly'].includes(candidate.frequency ?? '')) return []
    const completions = candidate.completions && typeof candidate.completions === 'object' ? Object.fromEntries(Object.entries(candidate.completions).filter(([key, count]) => /^\d{4}-\d{2}-\d{2}$/.test(key) && typeof count === 'number' && Number.isFinite(count) && count > 0).map(([key, count]) => [key, Math.floor(count as number)])) : {}
    return [{ id: candidate.id, name: candidate.name.trim(), category: categories.includes(candidate.category as HabitCategory) ? candidate.category as HabitCategory : 'Life', frequency: candidate.frequency as Habit['frequency'], notes: typeof candidate.notes === 'string' ? candidate.notes : '', createdAt: typeof candidate.createdAt === 'string' ? candidate.createdAt : new Date().toISOString(), updatedAt: typeof candidate.updatedAt === 'string' ? candidate.updatedAt : new Date().toISOString(), archived: candidate.archived === true, targetCompletions: candidate.frequency === 'weekly' ? Math.min(7, Math.max(1, Math.floor(candidate.targetCompletions ?? 1))) : undefined, completions }]
  })
}

export function loadHabits(storage: Storage = localStorage): { habits: Habit[]; error: boolean } {
  try {
    const raw = storage.getItem(STORAGE_KEY)
    return raw ? { habits: normalizeHabits(JSON.parse(raw)), error: false } : { habits: [], error: false }
  } catch { return { habits: [], error: true } }
}

export function saveHabits(habits: Habit[], storage: Storage = localStorage): boolean {
  try { storage.setItem(STORAGE_KEY, JSON.stringify(habits)); return true } catch { return false }
}
