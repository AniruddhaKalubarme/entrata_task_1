# Build Prompts

## Initial implementation

Build a production-quality responsive Habit Tracker with React, TypeScript, Vite, browser localStorage, reusable components, daily and weekly habits, streak calculations, validation, archive/reset/edit actions, a weekly view, summary metrics, accessibility, unit tests, README documentation, and no backend or notification service. Keep business logic in testable utility modules and handle malformed persisted data safely.

## Iteration: date correctness

Review all date calculations for timezone safety. Use local calendar date keys in `YYYY-MM-DD` format, avoid naive UTC parsing of date-only strings, ignore future completions, and test daily gaps, yesterday-ending streaks, and weekly boundaries.

## Iteration: weekly completion behavior

Support weekly habits with multiple counted completion instances, including multiple sessions on one day, while enforcing the weekly target. Show current progress and define a weekly streak as consecutive calendar weeks that met the target. If the current week is incomplete, continue counting a prior successful streak rather than inflating the current week.

## Iteration: quality pass

Add defensive normalization for localStorage records, user-visible storage failure messaging, confirmation for destructive reset, archive/restore, empty states, responsive mobile controls, visible completion text, keyboard-accessible buttons and labels, foundational utility tests, and setup/architecture documentation.
