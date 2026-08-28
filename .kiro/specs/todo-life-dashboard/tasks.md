# Implementation Plan: To-Do Life Dashboard

## Overview

Implement a standalone personal productivity homepage using plain HTML, CSS, and Vanilla JavaScript. The app consists of three files: `index.html`, `css/style.css`, and `js/app.js`. All data is persisted via `localStorage`. No frameworks, libraries, or build tools are used.

---

## Tasks

- [ ] 1. Scaffold project structure and HTML skeleton
  - Create `index.html` with semantic HTML5 structure
  - Define four widget sections: Greeting, Timer, Task List, Quick Links
  - Add `<link>` to `css/style.css` and `<script defer>` to `js/app.js`
  - Include all required `id` attributes for DOM elements referenced by JS:
    - `#greeting-text`, `#time-display`, `#date-display`
    - `#timer-display`, `#timer-start`, `#timer-stop`, `#timer-reset`, `#timer-alert`
    - `#task-input`, `#task-add-btn`, `#task-list`
    - `#link-label-input`, `#link-url-input`, `#link-add-btn`, `#quick-links-list`
  - Create empty `css/style.css` and empty `js/app.js` files
  - _Requirements: 10.2_

- [ ] 2. Implement Greeting Widget
  - [ ] 2.1 Implement pure formatting and greeting functions in `js/app.js`
    - Write `formatTime(date)` — returns `"HH:MM:SS"` with zero-padding; returns `"--:--:--"` for invalid date
    - Write `formatDate(date)` — returns `"DayName, DD MonthName YYYY"`; returns `"Date unavailable"` for invalid date
    - Write `getGreeting(hour)` — maps hour [5–11] → "Good Morning", [12–17] → "Good Afternoon", all others → "Good Evening"
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

  - [ ]* 2.2 Write property test for `formatTime` (Property 1)
    - **Property 1: Time formatting produces a valid HH:MM:SS string**
    - **Validates: Requirements 1.1**
    - Use `fc.date()` to generate valid Date objects
    - Assert returned string matches `/^\d{2}:\d{2}:\d{2}$/` and each segment matches the input date

  - [ ]* 2.3 Write property test for `formatDate` (Property 2)
    - **Property 2: Date formatting produces the correct human-readable string**
    - **Validates: Requirements 1.2**
    - Use `fc.date()` to generate valid Date objects
    - Assert DayName, DD, MonthName, YYYY all match the input date

  - [ ]* 2.4 Write property test for `getGreeting` (Property 3)
    - **Property 3: Greeting is correct for any hour of the day**
    - **Validates: Requirements 1.3, 1.4, 1.5**
    - Use `fc.integer({ min: 0, max: 23 })` as generator
    - Assert "Good Morning" for [5–11], "Good Afternoon" for [12–17], "Good Evening" for all others

  - [ ] 2.5 Implement `initGreeting()` and `renderGreeting()` in `js/app.js`
    - `renderGreeting()` calls `new Date()`, updates `#greeting-text`, `#time-display`, `#date-display`
    - `initGreeting()` calls `renderGreeting()` immediately, then sets `setInterval(renderGreeting, 1000)`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

- [ ] 3. Implement Timer Widget
  - [ ] 3.1 Implement timer pure functions in `js/app.js`
    - Write `formatTimerDisplay(seconds)` — returns `"MM:SS"` zero-padded, e.g. 1500 → `"25:00"`
    - Write `getTimerControlState(status)` — returns `{ startDisabled, stopDisabled }` per status
    - Write `tick(state)` — decrements `remainingSeconds`; returns `status: 'completed'` when reaching 0
    - Write `resetState()` — returns `{ remainingSeconds: 1500, status: 'idle', intervalId: null }`
    - _Requirements: 2.1, 2.2, 2.3, 2.5, 2.6, 2.7, 2.8_

  - [ ]* 3.2 Write property test for `formatTimerDisplay` (Property 4)
    - **Property 4: Timer display formatting is always a valid MM:SS string**
    - **Validates: Requirements 2.3**
    - Use `fc.integer({ min: 0, max: 1500 })`
    - Assert `Math.floor(s/60)` and `s%60` match the two parts of the returned string

  - [ ]* 3.3 Write property test for `tick` (Property 5)
    - **Property 5: Timer tick decrements by exactly one second**
    - **Validates: Requirements 2.2, 2.6**
    - Use `fc.integer({ min: 1, max: 1500 })` for `remainingSeconds`
    - Assert `remainingSeconds - 1` when > 1; assert `status === 'completed'` and `remainingSeconds === 0` when input is 1

  - [ ]* 3.4 Write property test for `resetState` (Property 6)
    - **Property 6: Timer reset always returns the canonical idle state**
    - **Validates: Requirements 2.1, 2.5**
    - Generate arbitrary timer states; assert result always equals `{ remainingSeconds: 1500, status: 'idle', intervalId: null }`

  - [ ]* 3.5 Write property test for `getTimerControlState` (Property 7)
    - **Property 7: Timer control states are consistent with timer status**
    - **Validates: Requirements 2.7, 2.8**
    - Use `fc.constantFrom('idle', 'running', 'paused', 'completed')`
    - Assert `startDisabled === true` iff `status === 'running'`; `stopDisabled === true` iff `status !== 'running'`

  - [ ] 3.6 Implement stateful timer functions and `initTimer()` in `js/app.js`
    - Declare in-memory timer state object
    - Implement `startTimer()` — sets interval, calls `renderTimer()`, updates control states
    - Implement `pauseTimer()` — clears interval, updates state to `'paused'`, calls `renderTimer()`
    - Implement `resetTimer()` — clears interval, calls `resetState()`, hides `#timer-alert`, calls `renderTimer()`
    - Implement `renderTimer()` — updates `#timer-display` via `formatTimerDisplay`, updates button `disabled` states via `getTimerControlState`, shows `#timer-alert` when `status === 'completed'`
    - Implement audible beep on completion using Web Audio API (lazy `AudioContext` creation on first interaction); catch and swallow errors silently
    - `initTimer()` sets initial state and wires button click handlers
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9_

- [ ] 4. Checkpoint — Greeting and Timer
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement Task List — Pure Functions
  - [ ] 5.1 Implement task validation and mutation functions in `js/app.js`
    - Write `isValidTaskText(text)` — true if `text.trim().length > 0 && <= 500`
    - Write `addTask(tasks, text)` — appends task with trimmed text, `completed: false`, unique id; returns unchanged if invalid
    - Write `deleteTask(tasks, id)` — returns new array without the matching id
    - Write `editTask(tasks, id, newText)` — updates `text` to `newText.trim()`; returns unchanged if invalid
    - Write `toggleTask(tasks, id)` — flips `completed` boolean for the matching task
    - _Requirements: 3.2, 3.3, 3.4, 4.4, 4.5, 5.2, 5.3, 6.2_

  - [ ]* 5.2 Write property test for `addTask` — invalid input (Property 8)
    - **Property 8: Invalid task text is always rejected without mutation**
    - **Validates: Requirements 3.3, 3.4**
    - Generate whitespace-only strings and strings with `trim().length > 500`
    - Assert returned array is identical (same length, same items) to the input

  - [ ]* 5.3 Write property test for `addTask` — valid input (Property 9)
    - **Property 9: Adding a valid task appends it with correct initial state**
    - **Validates: Requirements 3.2**
    - Use `fc.array(taskArb)` + `fc.string({ minLength: 1, maxLength: 500 })`
    - Assert length + 1, appended task has `text === t.trim()` and `completed === false`, all others unchanged

  - [ ]* 5.4 Write property test for `deleteTask` (Property 10)
    - **Property 10: Deleting a task removes exactly that task**
    - **Validates: Requirements 6.2**
    - Use `fc.array(taskArb, { minLength: 1 })`, pick a random id from the array
    - Assert length - 1, no task with that id remains, all others unchanged

  - [ ]* 5.5 Write property test for `editTask` — invalid input (Property 11)
    - **Property 11: Editing with invalid text is rejected**
    - **Validates: Requirements 4.5**
    - Generate whitespace-only strings; assert the returned array is identical to the input

  - [ ]* 5.6 Write property test for `editTask` — valid input (Property 12)
    - **Property 12: Editing with valid text updates only the target task**
    - **Validates: Requirements 4.4**
    - Assert target task's `text === newText.trim()`, all other tasks unchanged, array length unchanged

  - [ ]* 5.7 Write property test for `toggleTask` (Property 13)
    - **Property 13: Completion toggle is a round trip**
    - **Validates: Requirements 5.2, 5.3**
    - Apply `toggleTask` twice to the same id; assert `completed` value equals original; all others unchanged

- [ ] 6. Implement Task List — Persistence and Rendering
  - [ ] 6.1 Implement `saveTasks`, `loadTasks`, and `renderTaskList` in `js/app.js`
    - `saveTasks(tasks)` — `localStorage.setItem("dashboard_tasks", JSON.stringify(tasks))`; catch storage quota errors, log to console
    - `loadTasks()` — reads `"dashboard_tasks"`, parses JSON; returns `[]` on null or any parse error
    - `renderTaskList(tasks)` — rebuilds full `#task-list` innerHTML from tasks array
      - Each `<li>` includes: completion toggle checkbox, task text `<span>`, edit button, delete button
      - Apply strikethrough styling to `<span>` when `completed === true`
      - One edit input inline per task (pre-filled) when that task's id matches `editingTaskId`
    - _Requirements: 3.5, 5.4, 6.3, 7.1, 7.2, 7.3, 7.5_

  - [ ]* 6.2 Write property test for task round-trip serialisation (Property 14)
    - **Property 14: Task collection round-trip serialisation is lossless**
    - **Validates: Requirements 7.3, 7.4**
    - Use `fc.array(taskArb)`; assert `JSON.parse(JSON.stringify(tasks))` produces equal `text` and `completed` for every item

  - [ ] 6.3 Implement `initTaskList()` and edit-mode wiring in `js/app.js`
    - Declare module-level `editingTaskId = null`
    - Wire `#task-add-btn` click and `#task-input` Enter key: call `addTask`, `saveTasks`, `renderTaskList`, clear input; show inline validation message for empty/too-long input
    - In rendered list, wire each item's controls: toggle → `toggleTask`/`saveTasks`/`renderTaskList`; delete → `deleteTask`/`saveTasks`/`renderTaskList`
    - Wire edit button: set `editingTaskId`, call `renderTaskList`; if another task was in edit mode, discard first before opening new one
    - Wire confirm (click or Enter): `editTask`/`saveTasks`/`renderTaskList`, reset `editingTaskId`; reject empty text with validation message
    - Wire cancel (Escape key or cancel button): reset `editingTaskId`, call `renderTaskList`
    - `initTaskList()` calls `loadTasks()` and `renderTaskList(tasks)` on DOM ready
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 5.1, 5.2, 5.3, 5.4, 6.1, 6.2, 6.3, 7.1, 7.2, 7.5_

- [ ] 7. Implement Quick Links Widget
  - [ ] 7.1 Implement Quick Links pure functions in `js/app.js`
    - Write `isValidLink(label, url)` — true if `label.trim().length > 0` and URL matches `/^https?:\/\//i`
    - Write `addLink(links, label, url)` — appends `{ id, label: label.trim(), url }`; returns unchanged if invalid
    - Write `deleteLink(links, id)` — returns new array without the matching id
    - Write `saveLinks(links)` — `localStorage.setItem("dashboard_links", JSON.stringify(links))`; catch quota errors
    - Write `loadLinks()` — reads `"dashboard_links"`, returns `[]` on null or parse error
    - Write `renderQuickLinks(links)` — rebuilds `#quick-links-list` DOM; each link renders as `<a href target="_blank" rel="noopener noreferrer">` button plus a delete control
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9, 8.10_

  - [ ]* 7.2 Write property test for `isValidLink` — URL validation (Property 15)
    - **Property 15: Link URL validation accepts exactly http/https URLs**
    - **Validates: Requirements 8.2, 8.3**
    - Use `fc.webUrl()` for valid URLs and `fc.string()` for arbitrary strings
    - Assert `true` iff URL begins with `http://` or `https://` (case-insensitive); non-empty label

  - [ ]* 7.3 Write property test for link round-trip serialisation (Property 16)
    - **Property 16: Link collection round-trip serialisation is lossless**
    - **Validates: Requirements 8.7, 8.8**
    - Use `fc.array(linkArb)`; assert `JSON.parse(JSON.stringify(links))` produces equal `label` and `url` for every item

  - [ ] 7.4 Implement `initQuickLinks()` in `js/app.js`
    - Wire `#link-add-btn` click: validate via `isValidLink`, call `addLink`/`saveLinks`/`renderQuickLinks`, clear inputs; show inline validation message on rejection
    - Wire delete controls in rendered list: call `deleteLink`/`saveLinks`/`renderQuickLinks`
    - `initQuickLinks()` calls `loadLinks()` and `renderQuickLinks(links)` on DOM ready
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9, 8.10_

- [ ] 8. Checkpoint — All Logic Complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Wire `DOMContentLoaded` entry point in `js/app.js`
  - [ ] 9.1 Add `DOMContentLoaded` listener that calls `initGreeting()`, `initTimer()`, `initTaskList()`, `initQuickLinks()` in order
    - Ensure no widget initialisation throws to the global scope
    - _Requirements: 10.1, 10.2_

- [ ] 10. Style all widgets in `css/style.css`
  - [ ] 10.1 Implement base styles and CSS custom properties
    - Define colour palette, font stack, and spacing tokens as CSS variables
    - Apply `box-sizing: border-box`, body background, and base font size (minimum 14px)
    - _Requirements: 9.2_

  - [ ] 10.2 Implement responsive layout
    - Use CSS Grid or Flexbox to lay out all four widgets; stack to single column at narrow viewports
    - Ensure no horizontal scrollbar from 320px to 2560px; no widget content clipped
    - Ensure all interactive controls remain reachable at all supported widths
    - _Requirements: 9.1, 9.2, 9.3_

  - [ ] 10.3 Style Greeting, Timer, Task List, and Quick Links widgets
    - Greeting: large time display, readable date and greeting text
    - Timer: large `MM:SS` display, clearly labelled Start / Stop / Reset buttons, styled alert banner (hidden by default, visible on completion)
    - Task List: input + button row, list items with completion checkbox, strikethrough on completed tasks, edit/delete controls per item, inline edit input
    - Quick Links: label + URL input row, link buttons with delete controls
    - Apply `:focus-visible` outlines and `cursor: pointer` on all interactive elements
    - _Requirements: 5.2, 2.6, 9.1, 9.2, 9.3_

- [ ] 11. Final Checkpoint — Full Integration
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP (per NFR-1, no test setup required)
- Property tests use [fast-check](https://fast-check.dev/) run in Node.js via `node:test`; they are separate from the browser app and do not affect the `file://` delivery model
- Each task references specific requirements for traceability
- All three files (`index.html`, `css/style.css`, `js/app.js`) are the only output — no other files should be created
- Timer state is intentionally not persisted to LocalStorage; it resets to 25:00 idle on every page load
- `AudioContext` must be created lazily on first user interaction to satisfy browser autoplay policies

---

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2.1", "3.1", "5.1", "7.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "2.4", "2.5", "3.2", "3.3", "3.4", "3.5", "5.2", "5.3", "5.4", "5.5", "5.6", "5.7", "7.2", "7.3"] },
    { "id": 3, "tasks": ["3.6", "6.1", "7.4"] },
    { "id": 4, "tasks": ["6.2", "6.3"] },
    { "id": 5, "tasks": ["9.1"] },
    { "id": 6, "tasks": ["10.1"] },
    { "id": 7, "tasks": ["10.2", "10.3"] }
  ]
}
```
