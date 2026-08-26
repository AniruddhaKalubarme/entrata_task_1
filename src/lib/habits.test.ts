import { describe, expect, it, beforeEach } from 'vitest'
import type { Habit } from '../types'
import { calculateDailyStreak, calculateWeeklyStreak, getWeeklyProgress, loadHabits, normalizeHabits, saveHabits, validateHabitDraft } from './habits'

const habit = (completions: Record<string, number>, extra: Partial<Habit> = {}): Habit => ({ id: 'test', name: 'Test', frequency: 'daily', createdAt: '', updatedAt: '', archived: false, completions, ...extra })

const weekly = (completions: Record<string, number>, targetCompletions = 3): Habit => habit(completions, { frequency: 'weekly', targetCompletions })

describe('habit validation and normalization', () => {
  it('accepts daily and weekly drafts', () => {
    expect(validateHabitDraft({ name: ' Water ', frequency: 'daily', notes: '', targetCompletions: 3 })).toBeNull()
    expect(validateHabitDraft({ name: 'Exercise', frequency: 'weekly', notes: '', targetCompletions: 3 })).toBeNull()
  })
  it('rejects empty names and invalid targets', () => {
    expect(validateHabitDraft({ name: ' ', frequency: 'daily', notes: '', targetCompletions: 3 })).toBeTruthy()
    expect(validateHabitDraft({ name: 'Exercise', frequency: 'weekly', notes: '', targetCompletions: 8 })).toBeTruthy()
  })
  it('drops malformed persisted records', () => {
    expect(normalizeHabits([{ id: 'ok', name: ' Read ', frequency: 'daily', completions: {} }, { name: 'bad' }])).toHaveLength(1)
  })
})

describe('daily streaks', () => {
  const today = new Date(2026, 7, 26)
  it('counts consecutive days through today', () => expect(calculateDailyStreak(habit({ '2026-08-24': 1, '2026-08-25': 1, '2026-08-26': 1 }), today)).toBe(3))
  it('counts a streak ending yesterday', () => expect(calculateDailyStreak(habit({ '2026-08-24': 1, '2026-08-25': 1 }), today)).toBe(2))
  it('breaks at a gap and ignores future dates', () => expect(calculateDailyStreak(habit({ '2026-08-23': 1, '2026-08-25': 1, '2026-08-27': 1 }), today)).toBe(1))
  it('returns zero for empty history', () => expect(calculateDailyStreak(habit({}), today)).toBe(0))
})

describe('weekly habits', () => {
  const today = new Date(2026, 7, 26)
  it('reports current progress and successful week streak', () => {
    const current = weekly({ '2026-08-24': 1, '2026-08-25': 1, '2026-08-26': 1 })
    expect(getWeeklyProgress(current, today)).toBe(3)
    expect(calculateWeeklyStreak(current, today)).toBe(1)
  })
  it('does not count an incomplete week', () => expect(calculateWeeklyStreak(weekly({ '2026-08-24': 1, '2026-08-25': 1 }), today)).toBe(0))
  it('continues a prior streak while the current week is in progress', () => expect(calculateWeeklyStreak(weekly({ '2026-08-17': 1, '2026-08-18': 1, '2026-08-19': 1, '2026-08-24': 1 }), today)).toBe(1))
})

describe('persistence', () => {
  beforeEach(() => localStorage.clear())
  it('saves and reloads habits', () => {
    const data = [habit({ '2026-08-26': 1 })]
    expect(saveHabits(data)).toBe(true)
    expect(loadHabits().habits[0].completions['2026-08-26']).toBe(1)
  })
  it('falls back when storage is malformed', () => {
    localStorage.setItem('habit-tracker-data', '{nope')
    expect(loadHabits().habits).toEqual([])
    expect(loadHabits().error).toBe(true)
  })
})
