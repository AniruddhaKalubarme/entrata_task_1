Prompt - 1:
Read and remember the guidelines throughout this chat

Prompt - 2:
This is Task 1 of our AI Coding Challenge. Based on the task description and the provided AI Coding Challenge Guidelines, generate a comprehensive, production-quality prompt for Codex that I can directly use to build the application. The prompt should clearly cover all functional requirements, UI/UX expectations, edge cases, input validation, error handling, unit testing, responsive design, project architecture, README documentation, prompt.md, and Git hygiene requirements from the guidelines. Prioritize MVP completion and correctness first, and avoid unnecessary features. Include explicit acceptance criteria and verification scenarios so that Codex can implement the task accurately with minimal risk of missing or incorrectly interpreting any requirement.


Prompt - 3:
# Habit Tracker Build — Complete Implementation Prompt

Build a polished, production-quality **Habit Tracker** web application based exactly on the requirements below.

The goal is to deliver a reliable MVP first, then refine UX, edge cases, responsiveness, error handling, and testing. Do not add unnecessary features that increase complexity without improving the core requirements.

## 1. Core Objective

Create a responsive habit-tracking application where users can:

* Add daily or weekly habits.
* Mark a habit as completed with a single tap/click.
* View current and historical completion status.
* See accurate streak counts.
* Edit habit details and frequency targets.
* Reset or archive habits easily.
* Add optional notes/reminder text.
* View a simple calendar or weekly view.
* View a weekly consistency summary.
* Persist all habit data using **browser localStorage** so data survives refresh, browser reopen, and normal navigation.

No backend, authentication, database server, push notifications, or real reminder service is required for this task.

---

## 2. Recommended Technology

Use a clean modern frontend architecture:

* React
* TypeScript
* Vite
* Tailwind CSS
* shadcn/ui or equivalent accessible UI components
* Browser localStorage for persistence
* Vitest + React Testing Library for unit/component tests

Keep the code modular and production-oriented.

Do not put the entire application into one large component.

Use clear separation of concerns, for example:

```text
src/
  components/
  pages/
  hooks/
  lib/
  types/
  utils/
  tests/
```

Use reusable components and utility functions for habit calculations rather than duplicating logic inside UI components.

---

## 3. Main User Experience

The application should be understandable immediately on first open.

The primary screen should clearly show:

1. Application title/header.
2. Current week/date context.
3. Weekly summary.
4. Habit list.
5. One-tap completion control for each habit.
6. Current streak for each habit.
7. Quick action to add a habit.
8. Easy edit/archive/reset actions.

Do not hide essential actions inside multiple nested menus.

The user should be able to add a habit quickly and complete it without navigating to another page.

---

# 4. Habit Data Model

Use a well-defined TypeScript model.

Each habit should contain at least:

```ts
type Frequency = "daily" | "weekly";

interface Habit {
  id: string;
  name: string;
  frequency: Frequency;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  archived: boolean;

  // Weekly target:
  targetCompletions?: number;

  // Completion history:
  completions: Record<string, number>;
}
```

You may improve the structure where necessary, but maintain the same functional behavior.

Use a date-key format that is stable and timezone-safe, preferably:

```text
YYYY-MM-DD
```

For weekly habits, store enough information to determine how many completions occurred within each week.

---

# 5. Frequency Behavior

## Daily Habit

Example:

```text
Drink Water
Frequency: Daily
```

The user can complete the habit once per day.

If completed Monday, Tuesday, and Wednesday continuously, the streak must be:

```text
3 day streak
```

Completing the habit multiple times during the same day should **not accidentally create multiple days of streak**.

The UI should make it obvious whether today's completion is done.

---

## Weekly Habit

Example:

```text
Exercise
Frequency: Weekly
Target: 3 times per week
```

Allow the user to define a weekly completion target.

Example:

```text
Target: 3 / week
Completed: 2 / 3
```

A weekly habit should count progress based on the number of valid completions during the current week.

The weekly streak should represent consecutive weeks in which the weekly target was achieved.

---

# 6. Streak Calculation

Implement streak calculations in dedicated utility functions.

Do not calculate streaks directly inside JSX.

For daily habits:

* A completed day counts toward the streak.
* Consecutive completed days increase the streak.
* A missed required day breaks the current streak.
* The current streak should be based on the most recent relevant day.
* If today has not been completed yet, correctly handle the case where the streak ends yesterday.
* Do not incorrectly count future dates.
* Handle empty completion history safely.

For weekly habits:

* Group completions by calendar week.
* Determine whether each week met its target.
* Count consecutive successful weeks.
* Handle the current incomplete week correctly.
* Do not count future weeks.

Create unit tests for these calculations.

---

# 7. Completion Interaction

Completion must be extremely easy.

For every habit, provide a prominent control such as:

* Checkbox
* Circular completion button
* Check icon button

One tap/click should mark the habit complete.

For a daily habit:

```text
Incomplete → Complete
Complete → Undo
```

For a weekly habit:

Allow completion taps for individual completion instances until the weekly target is reached.

The UI should immediately update:

* Completion state
* Streak
* Weekly progress
* Summary statistics

Do not require a page refresh.

---

# 8. Add Habit Flow

Provide a highly visible:

```text
+ Add Habit
```

button.

The form should include:

### Required

**Habit Name**

Example:

```text
Drink Water
```

### Frequency

Selectable options:

```text
Daily
Weekly
```

### Weekly Target

Show this field when frequency is Weekly.

Examples:

```text
1 time / week
2 times / week
3 times / week
...
```

Allow a reasonable range such as 1–7.

### Optional Notes / Reminder Text

Example:

```text
Drink 2 liters throughout the day
```

Important:

This is **text only**.

Do not implement browser push notifications or actual reminder scheduling.

Validate inputs before saving:

* Habit name cannot be empty.
* Trim unnecessary whitespace.
* Weekly target must be valid.
* Prevent invalid frequency values.
* Prevent malformed habit records from crashing the application.

---

# 9. Edit Habit

Each habit must have an obvious edit action.

Users must be able to change:

* Habit name
* Frequency
* Weekly target
* Notes/reminder text

Do not accidentally erase completion history when editing a habit unless the change fundamentally requires it.

Handle frequency changes carefully.

For example, changing:

```text
Daily → Weekly
```

should not cause the application to crash or corrupt localStorage.

Document the chosen behavior in code comments or README.

---

# 10. Reset Habit

Provide an easy reset action.

Reset should remove the habit's completion history and reset its current streak/progress.

Because this is destructive:

* Show a confirmation dialog.
* Clearly tell the user what will be reset.
* Do not reset accidentally from a single misclick.

Example confirmation:

```text
Reset "Drink Water"?

This will remove its completion history and reset the streak.
```

---

# 11. Archive Habit

Allow users to archive habits.

Archived habits:

* Should no longer appear in the primary active habit list.
* Must not be deleted permanently.
* Their historical data should remain stored.
* Provide a way to view archived habits.
* Allow restoring/unarchiving a habit.

Clearly distinguish active and archived habits.

---

# 12. Weekly View

Create a simple, visually clear weekly view.

Display the current week from Monday through Sunday.

Example:

```text
        Mon Tue Wed Thu Fri Sat Sun
Water    ✓   ✓   ✓   ○   ○   ○   ○
Exercise ✓   ○   ✓   ○   ○   ○   ○
Reading  ✓   ✓   ○   ✓   ○   ○   ○
```

Use visual states that are easy to understand.

Also show:

* Current week date range.
* Daily completion status.
* Weekly progress.
* Habit completion counts.

Allow the user to move between weeks if practical.

At minimum, the current week must work correctly.

---

# 13. Weekly Summary

Create a simple summary section at the top of the dashboard.

Show useful metrics such as:

```text
This Week
──────────────
Completed: 18
Planned: 25
Consistency: 72%
Active Habits: 5
Best Current Streak: 7 days
```

The exact metrics may vary, but the summary must give the user an immediate understanding of weekly consistency.

Use a simple chart, progress bars, or visual list.

Do not overcomplicate the visualization.

---

# 14. Empty State

When no habits exist, do not show a blank screen.

Show a helpful empty state:

```text
No habits yet

Create your first habit and start building your streak.

+ Add Habit
```

The first action should be obvious.

---

# 15. Responsive Design

The application must work well on:

* Desktop
* Tablet
* Mobile

Mobile layout is especially important.

On small screens:

* Avoid horizontal overflow.
* Make completion controls easy to tap.
* Stack cards where necessary.
* Keep text readable.
* Make Add Habit easily accessible.
* Preserve clear streak visibility.
* Ensure dialogs/forms fit within the viewport.

Do not rely on hover-only interactions for essential functionality.

Use accessible touch targets.

---

# 16. Visual Design

Use a clean, modern productivity-app aesthetic.

Prioritize:

* Clear typography
* Strong visual hierarchy
* Good spacing
* Consistent component design
* Obvious completion states
* Readable streak numbers
* Subtle progress indicators
* Responsive cards
* Accessible contrast

Example visual hierarchy for a habit card:

```text
Habit Name                     7 day streak
Drink Water

Daily
Drink 2 liters throughout day

[ ✓ Completed Today ]

Mon  Tue  Wed  Thu  Fri  Sat  Sun
 ✓    ✓    ✓    ○    ○    ○    ○
```

The streak number should be visually prominent.

Avoid excessive decoration.

---

# 17. Persistence

Use localStorage as the single persistence mechanism.

Create a clear storage key, for example:

```text
habit-tracker-data
```

Persist:

* Habits
* Completion history
* Notes
* Frequency
* Weekly targets
* Archived status
* Relevant timestamps

On application startup:

1. Read localStorage.
2. Parse the stored data safely.
3. Validate the structure.
4. Fall back to an empty state if the data is missing or malformed.
5. Render the application.

Whenever data changes:

1. Update application state.
2. Persist the updated state to localStorage.

Do not lose data during refresh.

Test the persistence behavior explicitly.

---

# 18. Defensive Error Handling

The application should gracefully handle:

* Invalid localStorage data
* JSON parsing failure
* Missing properties
* Unexpected frequency values
* Invalid dates
* Empty habit names
* Invalid weekly targets
* Duplicate or malformed completion entries
* localStorage write failures

Never allow malformed persisted data to crash the application.

Use meaningful fallback behavior.

For example:

```text
We couldn't read your saved habits. Starting with an empty habit list.
```

Do not expose raw JavaScript errors to normal users.

---

# 19. Unit Tests

Include foundational unit/component tests.

At minimum test:

### Habit creation

* Valid daily habit
* Valid weekly habit
* Empty name rejected
* Invalid weekly target rejected

### Daily completion

* Mark complete
* Undo completion
* Prevent duplicate same-day completion
* Correct current streak

### Daily streaks

Test cases such as:

```text
Mon ✓
Tue ✓
Wed ✓
=> streak = 3
```

```text
Mon ✓
Tue ✓
Wed ✗
Thu ✓
=> current streak = 1
```

Also test:

* Missing history
* Only today's completion
* Yesterday completion
* Non-consecutive completions
* Future dates

### Weekly habits

Test:

```text
Target = 3
Completions = 3
=> week completed
```

and:

```text
Target = 3
Completions = 2
=> week incomplete
```

Test consecutive successful weeks and broken weekly streaks.

### Persistence

Test:

* Save habits
* Reload/read habits
* Malformed localStorage
* Empty localStorage

### Archive/reset

Test:

* Archive hides habit from active view
* Restore makes habit active
* Reset clears completion history

---

# 20. Accessibility

Follow basic accessibility best practices.

Use:

* Semantic HTML
* Accessible buttons
* Labels for form controls
* Keyboard navigation
* Visible focus states
* Appropriate ARIA labels where necessary
* Sufficient color contrast

Do not communicate completion state through color alone.

For example, combine color with:

```text
✓ Completed
```

---

# 21. Code Architecture

Use reusable components such as:

```text
App
Dashboard
Header
WeeklySummary
HabitList
HabitCard
HabitForm
EditHabitDialog
ResetHabitDialog
ArchiveHabitDialog
WeeklyView
ArchivedHabits
EmptyState
```

Create reusable utilities such as:

```text
calculateDailyStreak()
calculateWeeklyStreak()
getWeekDates()
getWeeklyProgress()
calculateConsistency()
loadHabits()
saveHabits()
validateHabit()
```

Keep business logic out of presentation components whenever practical.

Use TypeScript types throughout.

Avoid `any` unless there is a strong technical reason.

---

# 22. State Management

For this scope, use React state/hooks unless a more complex state-management solution is genuinely necessary.

Do not introduce Redux or another large state-management dependency without justification.

Keep state predictable.

Centralize habit update operations so that add/edit/complete/reset/archive operations consistently update both:

1. In-memory state
2. localStorage

---

# 23. Performance

This is a small application, so prioritize simplicity and correctness.

Avoid unnecessary complexity.

Use stable keys.

Avoid expensive calculations being repeatedly performed during rendering when they can reasonably be memoized or moved into utility functions.

The app should remain responsive with a reasonable number of habits and completion records.

---

# 24. Important Edge Cases

Handle at least these cases:

1. No habits exist.
2. One habit exists.
3. Many habits exist.
4. Habit name contains whitespace.
5. Habit name is very long.
6. User completes and immediately undoes a habit.
7. User refreshes after completing a habit.
8. User closes and reopens the application.
9. localStorage is empty.
10. localStorage contains malformed JSON.
11. A habit is archived.
12. An archived habit is restored.
13. A habit is reset.
14. Daily streak has a gap.
15. Weekly target is partially completed.
16. Weekly target is fully completed.
17. User navigates to another week.
18. Date boundaries around midnight.
19. Future completion dates must not inflate streaks.
20. Changing frequency must not corrupt stored data.

Use local calendar dates consistently and avoid timezone bugs caused by naive `new Date("YYYY-MM-DD")` handling.

---

# 25. Data Integrity

Do not silently create invalid data.

Every modification should preserve the habit structure.

When loading localStorage:

```text
Raw Data
   ↓
Parse
   ↓
Validate
   ↓
Normalize
   ↓
Application State
```

When saving:

```text
Application State
   ↓
Serialize
   ↓
localStorage
```

Create a small validation/normalization layer rather than trusting stored JSON blindly.

---

# 26. README Requirements

Create a polished `README.md` covering:

## Overview

Explain what the application does.

## Features

List the implemented functionality.

## Tech Stack

Explain the technologies used and why.

## Setup & Running

Provide exact commands needed to install dependencies and run the app locally.

For example:

```bash
npm install
npm run dev
```

Also include the test command.

## Architecture

Explain:

* Component structure
* State management
* localStorage strategy
* Streak calculation approach
* Weekly progress calculation

## Design Choices

Explain why the application uses localStorage and the selected frontend architecture.

## Trade-offs

Be honest about decisions made for the challenge.

For example:

* No backend
* No authentication
* No push notifications
* localStorage persistence
* Limited reporting

## Future Improvements

Mention realistic production extensions such as:

* Backend synchronization
* Authentication
* Cloud backup
* Real reminders
* Notifications
* Multi-device sync

---

# 27. Prompt Documentation

Create a root-level file:

```text
prompt.md
```

This file must contain the AI prompts/instructions used to build the application.

Keep the prompts organized and readable.

Include the major implementation prompts and iterations used during development.

This is important because the challenge explicitly evaluates effective AI prompting and iteration.

---

# 28. Git Hygiene

Structure the work so it can be committed as multiple logical commits rather than one giant commit.

Recommended commit progression:

```text
feat: scaffold habit tracker
feat: add habit creation and editing
feat: implement habit completion tracking
feat: implement streak calculations
feat: add weekly view and summary
feat: add localStorage persistence
feat: add archive and reset actions
test: add habit and streak unit tests
style: improve responsive UI
docs: add README and prompt documentation
```

Use clear, atomic commit messages.

Do not create meaningless commits only to increase the commit count.

---

# 29. MVP Priority

Implement features in this order:

### Phase 1 — Core MVP

1. Project setup
2. Habit creation
3. Habit list
4. Daily completion
5. Weekly completion
6. Streak calculation
7. localStorage persistence

### Phase 2 — Usability

8. Edit habit
9. Reset habit
10. Archive/restore
11. Weekly view
12. Weekly summary
13. Empty state
14. Responsive mobile layout

### Phase 3 — Quality

15. Validation
16. Error handling
17. Edge cases
18. Unit tests
19. Accessibility
20. UI polish
21. README
22. prompt.md

Do not spend excessive time on visual polish before the core flow works end-to-end.

---

# 30. Acceptance Criteria

Before considering the task complete, verify all of the following:

### Habit Management

* [ ] User can create a daily habit.
* [ ] User can create a weekly habit.
* [ ] User can specify a weekly target.
* [ ] User can add optional notes/reminder text.
* [ ] User can edit habits.
* [ ] User can reset habits.
* [ ] User can archive habits.
* [ ] User can restore archived habits.

### Completion Tracking

* [ ] Daily habit can be completed with one tap.
* [ ] Daily habit can be undone.
* [ ] Same-day duplicate completion does not inflate streaks.
* [ ] Weekly habit supports multiple completions.
* [ ] Weekly target progress is visible.

### Streaks

* [ ] Daily streak is mathematically correct.
* [ ] Weekly streak is mathematically correct.
* [ ] Missing required periods break streaks correctly.
* [ ] Future dates do not inflate streaks.

### Weekly View

* [ ] Current week is visible.
* [ ] Daily completion status is clear.
* [ ] Weekly progress is visible.
* [ ] Weekly summary is easy to understand.

### Persistence

* [ ] Data survives refresh.
* [ ] Data survives closing and reopening the browser.
* [ ] Completion history survives reload.
* [ ] Streaks remain correct after reload.
* [ ] Malformed localStorage is handled safely.

### UX

* [ ] App is understandable on first open.
* [ ] Add Habit action is obvious.
* [ ] Completion action is obvious.
* [ ] Streak count is prominent.
* [ ] No essential action requires hunting through menus.
* [ ] Mobile layout works correctly.
* [ ] Desktop layout works correctly.

### Quality

* [ ] TypeScript types are used correctly.
* [ ] Business logic is separated from UI.
* [ ] Unit tests cover core calculations.
* [ ] Error handling exists.
* [ ] README is complete.
* [ ] `prompt.md` exists in the repository root.
* [ ] Code is clean and production-oriented.

---

# 31. Final Verification

Before finishing, perform a complete manual verification of the application.

Test this exact scenario:

1. Open the application.
2. Add a habit named `Drink Water`.
3. Set it to `Daily`.
4. Complete it on three consecutive days.
5. Verify the streak displays `3`.
6. Refresh the browser.
7. Verify the completion history still exists.
8. Verify the streak is still correct.
9. Edit the habit.
10. Confirm its completion history remains intact.
11. Archive it.
12. Confirm it disappears from the active list.
13. Restore it.
14. Reset it.
15. Confirm its completion history and streak are cleared.

Also test a weekly habit such as:

```text
Exercise
Frequency: Weekly
Target: 3
```

Complete it three times in the same week and verify the weekly progress reaches:

```text
3 / 3
```

Then test an incomplete week and verify the weekly streak does not incorrectly increase.

---

# 32. Important Implementation Rules

Follow these rules throughout the implementation:

* Build the core MVP before optional enhancements.
* Do not add a backend.
* Do not add authentication.
* Do not implement real push notifications.
* Reminder/notes are text only.
* Use localStorage for persistence.
* Never hardcode API keys or secrets.
* Do not introduce unnecessary dependencies.
* Do not use mock persistence in place of actual localStorage.
* Do not hardcode streak values.
* Calculate streaks from completion history.
* Do not allow malformed persisted data to crash the application.
* Keep business logic testable outside the UI.
* Use TypeScript consistently.
* Keep the UI responsive.
* Make the primary interaction extremely obvious.
* Ensure all core functionality works before visual polish.
* Do not leave placeholder buttons or unfinished interactions.
* Do not mark features complete unless they actually work.

---

## Deliverable

Produce a complete, runnable Habit Tracker application satisfying the requirements above.

The final repository should contain at minimum:

```text
README.md
package.json
src/
tests or src/**/*.test.*
```

The application must run locally, persist data through localStorage, provide correct streak calculations, have a responsive UI, and include foundational automated tests.

Prioritize **functional correctness, clean architecture, reliable persistence, edge-case handling, test coverage, usability, and documentation** over unnecessary feature expansion.

Prompt - 4 :
what features can we add in this project make list of it

Prompt - 5 :
add the complete details of project inside the readme file

Prompt - 6 :
Improve and polish the application's UI/UX without changing or breaking any existing functionality. Review the entire interface carefully and make the design more attractive, modern, consistent, and professional.

Prompt - 7 :
Add a Dark Mode option

Prompt - 8 :
some text is not properly visible in dark mode, fix it

Prompt - 9 :
The text is overflowd from the box as shown in image, fix it.