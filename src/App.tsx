import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Habit, HabitDraft, Frequency } from './types'
import { addDays, dateKey, formatWeekRange, getWeekDates, startOfWeek, todayKey } from './lib/dates'
import { calculateDailyStreak, calculateWeeklyStreak, getWeeklyProgress, validateHabitDraft } from './lib/habits'
import { useHabits } from './hooks/useHabits'

const blankDraft: HabitDraft = { name: '', frequency: 'daily', notes: '', targetCompletions: 3 }
const weekdayFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'short' })
const shortDateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })

function App() {
  const { habits, storageMessage, add, update } = useHabits()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Habit | null>(null)
  const [draft, setDraft] = useState<HabitDraft>(blankDraft)
  const [weekAnchor, setWeekAnchor] = useState(new Date())
  const [showArchived, setShowArchived] = useState(false)
  const weekDates = getWeekDates(weekAnchor)
  const activeHabits = habits.filter(habit => habit.archived === showArchived)
  const currentWeekHabits = habits.filter(habit => !habit.archived)
  const completed = currentWeekHabits.reduce((sum, habit) => sum + weekDates.reduce((days, day) => days + Math.min(1, habit.completions[dateKey(day)] ?? 0), 0), 0)
  const planned = currentWeekHabits.reduce((sum, habit) => sum + (habit.frequency === 'daily' ? 7 : (habit.targetCompletions ?? 1)), 0)
  const consistency = planned ? Math.min(100, Math.round((completed / planned) * 100)) : 0
  const bestStreak = currentWeekHabits.reduce((best, habit) => Math.max(best, habit.frequency === 'daily' ? calculateDailyStreak(habit) : calculateWeeklyStreak(habit)), 0)

  const openCreate = () => { setEditing(null); setDraft(blankDraft); setShowForm(true) }
  const openEdit = (habit: Habit) => { setEditing(habit); setDraft({ name: habit.name, frequency: habit.frequency, notes: habit.notes ?? '', targetCompletions: habit.targetCompletions ?? 3 }); setShowForm(true) }
  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (validateHabitDraft(draft)) return
    if (editing) update(editing.id, habit => ({ ...habit, ...draft, name: draft.name.trim(), notes: draft.notes.trim(), targetCompletions: draft.frequency === 'weekly' ? draft.targetCompletions : undefined, updatedAt: new Date().toISOString() }))
    else add(draft)
    setShowForm(false)
  }
  const toggleCompletion = (habit: Habit, key: string) => update(habit.id, current => { const currentCount = current.completions[key] ?? 0; const weeklyTarget = current.targetCompletions ?? 1; const total = getWeeklyProgress(current); if (current.frequency === 'weekly' && total >= weeklyTarget) return current; return { ...current, completions: { ...current.completions, [key]: currentCount + 1 }, updatedAt: new Date().toISOString() } })
  const undoCompletion = (habit: Habit, key: string) => update(habit.id, current => { const completions = { ...current.completions }; if ((completions[key] ?? 0) > 1) completions[key] -= 1; else delete completions[key]; return { ...current, completions, updatedAt: new Date().toISOString() } })
  const reset = (habit: Habit) => { if (window.confirm(`Reset "${habit.name}"?\n\nThis will remove its completion history and reset the streak.`)) update(habit.id, current => ({ ...current, completions: {}, updatedAt: new Date().toISOString() })) }

  return <div className="app-shell">
    <header className="topbar"><div className="brand"><span className="brand-mark">D</span><span>daymark</span></div><div className="header-meta"><span className="live-dot" /> local-first habit tracker</div></header>
    <main>
      {storageMessage && <div className="notice" role="status">{storageMessage}</div>}
      <section className="hero"><div><p className="eyebrow">{new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date())}</p><h1>Make today<br /><em>count.</em></h1><p className="hero-copy">Small promises, kept consistently. Your week at a glance.</p></div><button className="primary-button" onClick={openCreate}><span>+</span> Add habit</button></section>
      <section className="summary-grid"><div className="summary-intro"><p className="eyebrow">This week</p><strong>{consistency}%</strong><span>consistency</span><div className="progress-track"><i style={{ width: `${consistency}%` }} /></div></div><div className="metric"><span>Completed</span><strong>{completed}<small> / {planned}</small></strong><b>sessions</b></div><div className="metric"><span>Active habits</span><strong>{currentWeekHabits.length}</strong><b>in your rhythm</b></div><div className="metric"><span>Best streak</span><strong>{bestStreak}<small>{bestStreak === 1 ? ' day' : ' days'}</small></strong><b>keep going</b></div></section>
      <section className="section-heading"><div><p className="eyebrow">Your rhythm</p><h2>{showArchived ? 'Archived habits' : 'Active habits'}</h2></div><button className="text-button" onClick={() => setShowArchived(value => !value)}>{showArchived ? 'View active' : `View archived (${habits.filter(h => h.archived).length})`}</button></section>
      {activeHabits.length === 0 ? <div className="empty-state"><div className="empty-icon">✦</div><h2>{showArchived ? 'Nothing archived' : 'No habits yet'}</h2><p>{showArchived ? 'Archived habits will show up here.' : 'Create your first habit and start building your streak.'}</p>{!showArchived && <button className="primary-button" onClick={openCreate}><span>+</span> Add your first habit</button>}</div> : <div className="habit-list">{activeHabits.map(habit => <HabitCard key={habit.id} habit={habit} weekDates={weekDates} onComplete={toggleCompletion} onUndo={undoCompletion} onEdit={openEdit} onReset={reset} onArchive={() => update(habit.id, current => ({ ...current, archived: !current.archived, updatedAt: new Date().toISOString() }))} />)}</div>}
      {!showArchived && <section className="week-section"><div className="section-heading"><div><p className="eyebrow">The whole picture</p><h2>Weekly view</h2></div><div className="week-controls"><button aria-label="Previous week" onClick={() => setWeekAnchor(addDays(weekAnchor, -7))}>←</button><span>{formatWeekRange(weekDates)}</span><button aria-label="Next week" onClick={() => setWeekAnchor(addDays(weekAnchor, 7))}>→</button></div></div><div className="week-table"><div className="week-row week-header"><span>Habit</span>{weekDates.map(day => <span key={dateKey(day)}>{weekdayFormatter.format(day)}<b>{day.getDate()}</b></span>)}</div>{currentWeekHabits.map(habit => <div className="week-row" key={habit.id}><strong>{habit.name}</strong>{weekDates.map(day => { const key = dateKey(day); const done = !!habit.completions[key]; return <button key={key} className={`day-cell ${done ? 'done' : ''} ${key === todayKey() ? 'today' : ''}`} aria-label={`${habit.name} ${shortDateFormatter.format(day)} ${done ? 'completed' : 'incomplete'}`} onClick={() => done ? undoCompletion(habit, key) : toggleCompletion(habit, key)}>{done ? '✓' : '·'}</button> })}</div>)}</div></section>}
    </main>
    {showForm && <HabitForm draft={draft} editing={!!editing} onChange={setDraft} onSubmit={submit} onClose={() => setShowForm(false)} />}
  </div>
}

function HabitCard({ habit, weekDates, onComplete, onUndo, onEdit, onReset, onArchive }: { habit: Habit; weekDates: Date[]; onComplete: (habit: Habit, key: string) => void; onUndo: (habit: Habit, key: string) => void; onEdit: (habit: Habit) => void; onReset: (habit: Habit) => void; onArchive: () => void }) {
  const today = todayKey(); const todayCount = habit.completions[today] ?? 0; const doneToday = todayCount > 0; const progress = habit.frequency === 'weekly' ? getWeeklyProgress(habit) : weekDates.reduce((total, date) => total + (habit.completions[dateKey(date)] ? 1 : 0), 0); const target = habit.frequency === 'weekly' ? habit.targetCompletions ?? 1 : 7; const streak = habit.frequency === 'daily' ? calculateDailyStreak(habit) : calculateWeeklyStreak(habit); const weeklyDone = habit.frequency === 'weekly' && progress >= target
  return <article className="habit-card"><div className="habit-card-main"><div className="habit-title-row"><div><span className={`frequency-tag ${habit.frequency}`}>{habit.frequency === 'daily' ? 'Daily' : 'Weekly'}</span><h3>{habit.name}</h3></div><div className="streak"><strong>{streak}</strong><span>{habit.frequency === 'daily' ? 'day streak' : 'week streak'}</span></div></div>{habit.notes && <p className="notes">{habit.notes}</p>}<div className="card-footer"><div className="mini-progress"><div><span>{habit.frequency === 'weekly' ? 'This week' : 'Weekly rhythm'}</span><b>{progress} / {target}</b></div><div className="progress-track"><i style={{ width: `${Math.min(100, (progress / target) * 100)}%` }} /></div></div><button className={`complete-button ${doneToday ? 'complete' : ''}`} onClick={() => weeklyDone ? onUndo(habit, today) : onComplete(habit, today)} aria-label={weeklyDone ? `Undo ${habit.name} completion` : `Complete ${habit.name} today`}>{weeklyDone ? '✓ Goal reached' : doneToday ? `✓ ${todayCount} done today` : 'Mark complete'}</button></div></div><div className="card-actions"><button onClick={() => onEdit(habit)}>Edit</button><button onClick={() => onReset(habit)}>Reset</button><button onClick={onArchive}>{habit.archived ? 'Restore' : 'Archive'}</button></div></article>
}

function HabitForm({ draft, editing, onChange, onSubmit, onClose }: { draft: HabitDraft; editing: boolean; onChange: (draft: HabitDraft) => void; onSubmit: (event: FormEvent) => void; onClose: () => void }) {
  const error = validateHabitDraft(draft)
  return <div className="modal-backdrop" role="presentation"><form className="modal" onSubmit={onSubmit}><div className="modal-heading"><div><p className="eyebrow">{editing ? 'Refine your rhythm' : 'New ritual'}</p><h2>{editing ? 'Edit habit' : 'Add a habit'}</h2></div><button type="button" className="close-button" aria-label="Close" onClick={onClose}>×</button></div><label>Habit name<input autoFocus value={draft.name} onChange={event => onChange({ ...draft, name: event.target.value })} placeholder="e.g. Drink water" /></label><fieldset><legend>Frequency</legend><div className="frequency-options">{(['daily', 'weekly'] as Frequency[]).map(frequency => <button type="button" key={frequency} className={draft.frequency === frequency ? 'selected' : ''} onClick={() => onChange({ ...draft, frequency })}>{frequency === 'daily' ? 'Daily' : 'Weekly'}</button>)}</div></fieldset>{draft.frequency === 'weekly' && <label>Target per week<input type="number" min="1" max="7" value={draft.targetCompletions} onChange={event => onChange({ ...draft, targetCompletions: Number(event.target.value) })} /></label>}<label>Notes <span>(optional)</span><textarea value={draft.notes} onChange={event => onChange({ ...draft, notes: event.target.value })} placeholder="A little context or a reminder" rows={3} /></label>{error && <p className="form-error">{error}</p>}<button className="primary-button modal-submit" disabled={!!error}>{editing ? 'Save changes' : 'Create habit'}</button></form></div>
}

export default App
