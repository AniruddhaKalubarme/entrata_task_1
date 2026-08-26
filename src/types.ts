export type Frequency = 'daily' | 'weekly'
export type HabitCategory = 'Health' | 'Mind' | 'Growth' | 'Life'

export interface Habit {
  id: string
  name: string
  category?: HabitCategory
  frequency: Frequency
  notes?: string
  createdAt: string
  updatedAt: string
  archived: boolean
  targetCompletions?: number
  completions: Record<string, number>
}

export interface HabitDraft {
  name: string
  category?: HabitCategory
  frequency: Frequency
  notes: string
  targetCompletions: number
}
