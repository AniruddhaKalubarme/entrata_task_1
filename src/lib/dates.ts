const dayMs = 24 * 60 * 60 * 1000

export const dateKey = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const parseKey = (key: string): Date => {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export const addDays = (date: Date, amount: number): Date => new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount)

export const startOfWeek = (date: Date): Date => {
  const day = date.getDay()
  return addDays(date, day === 0 ? -6 : 1 - day)
}

export const getWeekDates = (anchor: Date): Date[] => Array.from({ length: 7 }, (_, index) => addDays(startOfWeek(anchor), index))

export const todayKey = (): string => dateKey(new Date())

export const isFutureKey = (key: string, today = new Date()): boolean => parseKey(key).getTime() > new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()

export const weekKey = (date: Date): string => dateKey(startOfWeek(date))

export const formatWeekRange = (dates: Date[]): string => {
  const start = dates[0]
  const end = dates[dates.length - 1]
  const startLabel = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const endLabel = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  return `${startLabel} - ${endLabel}`
}

export const daysBetween = (newer: Date, older: Date): number => Math.round((new Date(newer.getFullYear(), newer.getMonth(), newer.getDate()).getTime() - new Date(older.getFullYear(), older.getMonth(), older.getDate()).getTime()) / dayMs)
