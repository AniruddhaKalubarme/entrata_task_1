# Daymark

Daymark is a focused habit tracker for building consistency without accounts, servers, or notification complexity. Create daily or weekly habits, mark progress in one tap, and understand your current rhythm at a glance.

## Features

- Daily habits with consecutive-day streaks
- Weekly habits with 1-7 completion targets and counted sessions
- Current-week summary, progress bars, and Monday-Sunday view
- Edit, reset, archive, and restore actions
- Optional notes/reminder text (no notification scheduling)
- Defensive localStorage parsing and persistence
- Responsive layout with keyboard-friendly semantic controls

## Setup & Running

Requires Node.js 18+.

```bash
npm install
npm run dev
```

Run the production build and tests with:

```bash
npm run build
npm test
```

## Architecture

`src/App.tsx` owns the small UI state (modal, selected week, archive view) and delegates habit mutations to `src/hooks/useHabits.ts`. `src/lib/habits.ts` contains validation, normalization, persistence, weekly progress, and streak calculations. `src/lib/dates.ts` uses local calendar date keys (`YYYY-MM-DD`) so date-only values are not shifted by UTC parsing.

The localStorage pipeline is raw JSON -> parse -> validate/normalize -> React state. Invalid records are dropped and storage failures become a visible, non-blocking message. Daily streaks walk backward through consecutive completed calendar days. Weekly streaks aggregate valid sessions by Monday-starting week and walk backward through successful target weeks; an incomplete current week does not erase the prior completed streak.

## Design Choices & Trade-offs

The app uses React state and browser localStorage because the challenge is intentionally a single-user, offline-first MVP. Weekly sessions are represented as integer counts by date, which supports multiple sessions in one day while preserving a compact history. There is no backend, authentication, cloud backup, push notification service, or advanced reporting.

## Future Improvements

A production version could add authentication, server synchronization, cloud backup/export, shared devices, actual reminders, notifications, richer history views, and conflict resolution.
