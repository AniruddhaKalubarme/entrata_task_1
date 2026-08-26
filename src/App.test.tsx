import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'

beforeEach(() => {
  localStorage.clear()
  window.confirm = () => true
})

describe('habit tracker flows', () => {
  it('creates a habit and completes it for today', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /add habit/i }))
    fireEvent.change(screen.getByLabelText(/habit name/i), { target: { value: 'Drink Water' } })
    fireEvent.click(screen.getByRole('button', { name: /create habit/i }))
    expect(screen.getByRole('heading', { name: 'Drink Water' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /complete drink water today/i }))
    expect(screen.getByRole('button', { name: /undo drink water completion today/i })).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem('habit-tracker-data') ?? '[]')[0].completions).toHaveProperty(new Date().toISOString().slice(0, 10), 1)
  })

  it('archives, restores, and resets a habit', () => {
    localStorage.setItem('habit-tracker-data', JSON.stringify([{ id: 'one', name: 'Read', frequency: 'daily', archived: false, completions: { [new Date().toISOString().slice(0, 10)]: 1 } }]))
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Archive' }))
    expect(screen.queryByRole('heading', { name: 'Read' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /view archived/i }))
    expect(screen.getByRole('heading', { name: 'Read' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Restore' }))
    fireEvent.click(screen.getByRole('button', { name: /view active/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
    expect(JSON.parse(localStorage.getItem('habit-tracker-data') ?? '[]')[0].completions).toEqual({})
  })
})
