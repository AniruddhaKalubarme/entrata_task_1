import cors from 'cors'
import express from 'express'
import Database from 'better-sqlite3'
import { randomUUID } from 'node:crypto'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

type Frequency = 'daily' | 'weekly'
type Habit = { id: string; name: string; category?: string; frequency: Frequency; notes?: string; createdAt: string; updatedAt: string; archived: boolean; targetCompletions?: number; completions: Record<string, number> }

const databasePath = resolve(process.env.DATABASE_PATH ?? './data/habits.db')
mkdirSync(dirname(databasePath), { recursive: true })
const database = new Database(databasePath)
database.pragma('journal_mode = WAL')
database.exec(`CREATE TABLE IF NOT EXISTS habits (id TEXT PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL, frequency TEXT NOT NULL, notes TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL, updated_at TEXT NOT NULL, archived INTEGER NOT NULL DEFAULT 0, target_completions INTEGER, completions TEXT NOT NULL DEFAULT '{}')`)

const app = express()
app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? true }))
app.use(express.json({ limit: '1mb' }))

const validHabit = (value: unknown): value is Habit => {
  if (!value || typeof value !== 'object') return false
  const habit = value as Partial<Habit>
  return typeof habit.name === 'string' && habit.name.trim().length > 0 && (habit.frequency === 'daily' || habit.frequency === 'weekly') && typeof habit.completions === 'object' && (habit.frequency === 'daily' || (Number.isInteger(habit.targetCompletions) && (habit.targetCompletions as number) >= 1 && (habit.targetCompletions as number) <= 7))
}
const rowToHabit = (row: Record<string, unknown>): Habit => ({ id: String(row.id), name: String(row.name), category: String(row.category), frequency: row.frequency as Frequency, notes: String(row.notes), createdAt: String(row.created_at), updatedAt: String(row.updated_at), archived: Boolean(row.archived), targetCompletions: row.target_completions == null ? undefined : Number(row.target_completions), completions: JSON.parse(String(row.completions)) })
const findAll = (): Habit[] => (database.prepare('SELECT * FROM habits ORDER BY created_at ASC').all() as Record<string, unknown>[]).map(rowToHabit)

app.get('/api/health', (_request, response) => response.json({ status: 'ok' }))
app.get('/api/habits', (_request, response) => response.json(findAll()))
app.post('/api/habits', (request, response) => {
  if (!validHabit(request.body)) return response.status(400).json({ error: 'Invalid habit payload.' })
  const habit = { ...request.body, id: request.body.id || randomUUID(), category: request.body.category || 'Life', notes: request.body.notes || '', createdAt: request.body.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString(), archived: Boolean(request.body.archived), completions: request.body.completions || {} } as Habit
  try { database.prepare('INSERT INTO habits (id,name,category,frequency,notes,created_at,updated_at,archived,target_completions,completions) VALUES (@id,@name,@category,@frequency,@notes,@createdAt,@updatedAt,@archived,@targetCompletions,@completions)').run({ ...habit, createdAt: habit.createdAt, updatedAt: habit.updatedAt, archived: habit.archived ? 1 : 0, targetCompletions: habit.targetCompletions ?? null, completions: JSON.stringify(habit.completions) }); return response.status(201).json(habit) } catch { return response.status(409).json({ error: 'A habit with that ID already exists.' }) }
})
app.put('/api/habits/:id', (request, response) => {
  if (!validHabit(request.body)) return response.status(400).json({ error: 'Invalid habit payload.' })
  const habit = { ...request.body, id: request.params.id, category: request.body.category || 'Life', notes: request.body.notes || '', updatedAt: new Date().toISOString(), completions: request.body.completions || {} } as Habit
  const result = database.prepare('UPDATE habits SET name=@name,category=@category,frequency=@frequency,notes=@notes,updated_at=@updatedAt,archived=@archived,target_completions=@targetCompletions,completions=@completions WHERE id=@id').run({ ...habit, archived: habit.archived ? 1 : 0, targetCompletions: habit.targetCompletions ?? null, completions: JSON.stringify(habit.completions) })
  return result.changes ? response.json(habit) : response.status(404).json({ error: 'Habit not found.' })
})
app.delete('/api/habits/:id', (request, response) => { const result = database.prepare('DELETE FROM habits WHERE id=?').run(request.params.id); return result.changes ? response.status(204).send() : response.status(404).json({ error: 'Habit not found.' }) })

const port = Number(process.env.PORT ?? 3001)
app.listen(port, () => console.log(`Habit API listening on http://localhost:${port}`))
