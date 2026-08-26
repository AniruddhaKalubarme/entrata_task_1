import type { Habit } from '../types'

const API_URL = import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? '/api' : 'http://localhost:3001/api')

const request = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_URL}${path}`, { headers: { 'Content-Type': 'application/json' }, ...options })
  if (!response.ok) throw new Error(`API request failed: ${response.status}`)
  return response.status === 204 ? undefined as T : response.json() as Promise<T>
}

export const fetchHabits = (): Promise<Habit[]> => request<Habit[]>('/habits')
export const createHabit = (habit: Habit): Promise<Habit> => request<Habit>('/habits', { method: 'POST', body: JSON.stringify(habit) })
export const replaceHabit = (habit: Habit): Promise<Habit> => request<Habit>(`/habits/${habit.id}`, { method: 'PUT', body: JSON.stringify(habit) })
export const removeHabit = (id: string): Promise<void> => request<void>(`/habits/${id}`, { method: 'DELETE' })
