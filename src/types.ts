export type Frequency = 'daily' | 'weekly'

export interface Habit {
  id: string
  name: string
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
  frequency: Frequency
  notes: string
  targetCompletions: number
}
