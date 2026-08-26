# Daymark Habit Tracker

Daymark is a responsive, local-first habit tracker for building consistency. Users can create daily or weekly habits, complete them with one tap, review weekly and monthly history, inspect streaks and completion rates, and export or import their data.

The project includes an optional Express and SQLite backend. The frontend remains usable offline through browser localStorage when the API is unavailable.

## Features

### Habit management

- Create daily habits.
- Create weekly habits with a target from 1 to 7 sessions.
- Add an optional note or reminder description.
- Assign habits to Health, Mind, Growth, or Life categories.
- Edit habit details without deleting completion history.
- Reset completion history after confirmation.
- Archive and restore habits without deleting them.
- Move habits up or down in the custom list order.

### Completion tracking

- Complete or undo daily habits with one click.
- Record multiple sessions for weekly habits.
- Enforce weekly targets against the current calendar week.
- View the current Monday-Sunday week with daily completion states.
- Navigate between weeks and months.
- View a monthly calendar with total completed sessions per day.

### Insights and organization

- Weekly consistency percentage.
- Completed versus planned sessions.
- Best current streak.
- Total sessions per habit.
- Longest daily streak.
- Completion rate.
- Habit search.
- Category filtering.
- Sorting by name or streak.
- Optional dark mode.

### Data safety

- Browser localStorage persistence.
- SQLite persistence through the backend API.
- JSON export and import.
- Defensive parsing and normalization of malformed saved data.
- Future completion dates are excluded from streaks and totals.
- API and frontend validation for habit names, frequencies, and targets.

## Technology Stack

- **React and TypeScript:** component-based UI with strict type checking.
- **Vite:** fast development server and production bundling.
- **Express:** small HTTP API for habit CRUD operations.
- **SQLite via better-sqlite3:** file-backed relational persistence without a separate database service.
- **Vitest and React Testing Library:** unit and component tests.
- **CSS:** responsive styling with CSS variables, no UI framework dependency.

## Requirements

- Node.js 18 or newer.
- npm.

## Setup and Running

Install dependencies:

```bash
npm install
```

Start the frontend in one terminal:

```bash
npm run dev
```

Start the backend in a second terminal:

```bash
npm run dev:server
```

The frontend is normally available at `http://localhost:5173` and the API at `http://localhost:3001`.

The frontend can also run without the backend. In that mode, data is stored in localStorage and the UI displays an offline status message when API synchronization is unavailable.

## Available Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite frontend development server. |
| `npm run dev:server` | Start the Express API and SQLite database. |
| `npm run build` | Type-check the frontend and create a production bundle. |
| `npm run typecheck:server` | Type-check the backend. |
| `npm test` | Run all tests once. |
| `npm run test:watch` | Run Vitest in watch mode. |

## Configuration

The backend accepts these environment variables:

| Variable | Default | Description |
| --- | --- | --- |
| `PORT` | `3001` | Port used by the Express API. |
| `DATABASE_PATH` | `./data/habits.db` | SQLite database file path. |
| `CLIENT_ORIGIN` | Any origin | Restrict CORS to a specific frontend origin. |
| `VITE_API_URL` | `http://localhost:3001/api` | Frontend API base URL. |

Example PowerShell configuration:

```powershell
$env:PORT="3002"
$env:DATABASE_PATH="./data/dev.db"
$env:CLIENT_ORIGIN="http://localhost:5173"
npm run dev:server
```

The `.env` file is ignored by Git. Never commit credentials or environment-specific secrets.

## Architecture

```text
src/
  App.tsx                 Main dashboard and interaction orchestration
  hooks/useHabits.ts      State, API synchronization, and local fallback
  lib/api.ts              Typed browser API client
  lib/analytics.ts        History metrics and export serialization
  lib/dates.ts            Local calendar date and week utilities
  lib/habits.ts           Validation, normalization, persistence, and streaks
  lib/habits.test.ts      Domain and persistence tests
  App.test.tsx            Component workflow tests
  styles.css              Responsive visual system
  types.ts                Shared domain types
server/
  index.ts                Express routes and SQLite repository logic
```

`App.tsx` owns view state such as the selected week, month, filters, theme, and modal. The `useHabits` hook owns the habit collection and exposes add/update operations to the UI. Business rules are kept in library modules so streaks, validation, normalization, and analytics can be tested without rendering React.

## Data Model

```ts
type Frequency = "daily" | "weekly";

interface Habit {
  id: string;
  name: string;
  category?: "Health" | "Mind" | "Growth" | "Life";
  frequency: Frequency;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
  targetCompletions?: number;
  completions: Record<string, number>;
}
```

Completion keys use local calendar dates in `YYYY-MM-DD` format. Values are counts, which allows weekly habits to record multiple sessions on one day. Older records without a category are normalized to `Life` when loaded.

## API

All routes are under `/api` and use JSON.

| Method | Route | Behavior |
| --- | --- | --- |
| `GET` | `/api/health` | Returns `{ "status": "ok" }`. |
| `GET` | `/api/habits` | Returns all habits ordered by creation order. |
| `POST` | `/api/habits` | Validates and creates a habit. |
| `PUT` | `/api/habits/:id` | Validates and replaces a habit. |
| `DELETE` | `/api/habits/:id` | Permanently deletes a habit. |

The server rejects empty names, unsupported frequencies, malformed completion maps, and weekly targets outside 1-7. The frontend normally uses update operations for archive and reset so those actions remain reversible or confirmation-protected in the UI.

## Persistence Strategy

When the application starts, the hook reads localStorage immediately and then attempts to hydrate from the API. The API is authoritative when it returns habits; localStorage remains the fallback when the API cannot be reached. UI updates are optimistic: the screen updates immediately, localStorage is written, and the API receives the create or update request.

The SQLite database is created automatically at `data/habits.db`. It is intentionally ignored because database files are environment data, not source code. The schema stores habit fields in columns and completion history as validated JSON.

## Streak Rules

- A daily streak counts adjacent completed local calendar days.
- A streak may end yesterday when today is not complete.
- A gap breaks a daily streak.
- Future dates never contribute to a streak or metric.
- A weekly streak counts consecutive Monday-starting weeks whose total sessions meet the target.
- An incomplete current week does not inflate the streak; a prior completed week can remain the current streak.
- Duplicate daily completion taps do not create extra sessions.

## Testing

The test suite covers:

- Daily and weekly draft validation.
- Malformed persisted records.
- Daily streaks through today, yesterday, gaps, empty history, and future dates.
- Weekly progress and successful or incomplete targets.
- Weekly streak continuation from a previous completed week.
- localStorage save, reload, and malformed JSON fallback.
- Component-level create and complete workflow.
- Archive, restore, and reset workflow.
- Analytics and versioned JSON export.

Run the checks with:

```bash
npm test
npm run typecheck:server
npm run build
```

## Design Choices and Trade-offs

The frontend keeps React state rather than adding Redux because the application has a small, predictable state surface. SQLite gives the backend a real database without requiring a separate service during evaluation. Express keeps the HTTP contract visible and easy to extend.

The localStorage fallback improves offline usability but means the MVP does not yet solve multi-device synchronization or conflict resolution. Completion history is stored as JSON inside a habit row for simplicity; a production system with large histories would likely use a separate completion-events table. Authentication, authorization, rate limiting, and structured application logging are also outside this single-user MVP.

## Security and Reliability Notes

- No API keys or credentials are stored in source files.
- Environment files and local database files are ignored by Git.
- Request bodies are size-limited to 1 MB.
- Input validation exists at both client and API boundaries.
- Malformed localStorage data is discarded safely instead of crashing the UI.
- CORS can be restricted through `CLIENT_ORIGIN` for deployed environments.
- Production deployment should add authentication, HTTPS, request rate limiting, structured logs, backups, and database migrations.

## Future Improvements

- Authentication and per-user data ownership.
- Cloud synchronization and conflict resolution.
- Separate completion-event table and database migrations.
- Server-side pagination for large histories.
- Browser or email reminders with explicit user permission.
- Playwright end-to-end tests and GitHub Actions CI.
- Accessibility audits with axe-core.
- Docker deployment and managed database hosting.

## Prompt Documentation

The root-level [prompt.md](prompt.md) records the major implementation prompts and iterations used to build the project. It is kept with the source so the design reasoning and refinement process remain reviewable.
