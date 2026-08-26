import type { Habit } from '../types'
import { isFutureKey, parseKey } from './dates'

export const totalCompletions = (habit: Habit): number => Object.entries(habit.completions).reduce((sum, [key, count]) => sum + (isFutureKey(key) ? 0 : count), 0)

export const longestDailyStreak = (habit: Habit): number => {
  const keys = Object.keys(habit.completions).filter(key => habit.completions[key] > 0 && !isFutureKey(key)).sort()
  let longest = 0
  let current = 0
  keys.forEach((key, index) => {
    current = index > 0 && (parseKey(key).getTime() - parseKey(keys[index - 1]).getTime()) === 86400000 ? current + 1 : 1
    longest = Math.max(longest, current)
  })
  return longest
}

export const completionRate = (habit: Habit): number => {
  const started = Math.max(1, Math.floor((Date.now() - new Date(habit.createdAt).getTime()) / 86400000) + 1)
  const planned = habit.frequency === 'daily' ? started : Math.max(1, Math.ceil(started / 7) * (habit.targetCompletions ?? 1))
  return Math.min(100, Math.round((totalCompletions(habit) / planned) * 100))
}

export const exportHabits = (habits: Habit[]): string => JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), habits }, null, 2)