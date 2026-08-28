# Requirements Document

## Introduction

The To-Do List Life Dashboard is a client-side web application that serves as a personal productivity homepage. It displays the current time and date, a Pomodoro-style focus timer, a persistent to-do list, and a set of quick-access links to favorite websites. All data is stored locally in the browser using the LocalStorage API. The application requires no backend server and no build tools — it runs as a standalone HTML page.

## Glossary

- **Dashboard**: The main single-page web interface that contains all feature widgets.
- **Greeting_Widget**: The section of the Dashboard that displays the current time, date, and a time-based greeting message.
- **Timer**: The Pomodoro-style countdown timer component on the Dashboard.
- **Task_List**: The component that manages the collection of user-defined tasks.
- **Task**: A single item in the Task_List, consisting of text content and a completion state.
- **Quick_Links**: The component that displays user-defined shortcut buttons to external URLs.
- **Link**: A single Quick_Links entry consisting of a label and a URL.
- **LocalStorage**: The browser's Web Storage API used for persisting all user data client-side.
- **LocalStorage_API**: The browser built-in `window.localStorage` interface.

---

## Requirements

### Requirement 1: Display Current Time and Date

**User Story:** As a user, I want to see the current time and date on the Dashboard, so that I can stay aware of the time without switching tabs.

#### Acceptance Criteria

1. THE Greeting_Widget SHALL display the current time in 24-hour HH:MM:SS format, updating at 1-second intervals.
2. THE Greeting_Widget SHALL display the current date in the pattern "DayName, DD MonthName YYYY" (e.g., "Monday, 26 August 2024").
3. WHEN the current hour is between 05 and 11 inclusive, THE Greeting_Widget SHALL display the greeting "Good Morning".
4. WHEN the current hour is between 12 and 17 inclusive, THE Greeting_Widget SHALL display the greeting "Good Afternoon".
5. WHEN the current hour is between 18 and 23 inclusive or between 00 and 04 inclusive, THE Greeting_Widget SHALL display the greeting "Good Evening".
6. IF the system clock is unavailable or returns an invalid value, THEN THE Greeting_Widget SHALL display a static fallback message instead of a time/date.
7. THE Greeting_Widget SHALL derive time and date from the user's local system clock and time zone.

---

### Requirement 2: Focus Timer

**User Story:** As a user, I want a 25-minute countdown timer, so that I can use the Pomodoro technique to manage focused work sessions.

#### Acceptance Criteria

1. WHEN the Dashboard loads, THE Timer SHALL initialise with a default duration of 25 minutes (1500 seconds).
2. WHEN the user activates the start control, THE Timer SHALL begin counting down one second at a time.
3. WHILE the Timer is counting down, THE Timer SHALL display the remaining time in MM:SS format.
4. WHEN the user activates the stop control, THE Timer SHALL pause the countdown and retain the current remaining time.
5. WHEN the user activates the reset control, THE Timer SHALL stop the countdown and restore the remaining time to 25 minutes (1500 seconds).
6. WHEN the Timer reaches 00:00, THE Timer SHALL stop counting down and display both a visual indicator and an audible alert that remain visible and active until the user dismisses them.
7. WHILE the Timer is counting down, THE Timer SHALL disable the start control and enable the stop and reset controls.
8. WHILE the Timer is in an idle, paused, or completed state, THE Timer SHALL enable the start control and disable the stop control.
9. WHEN the user activates the start control while the Timer is paused, THE Timer SHALL resume the countdown from the retained remaining time.

---

### Requirement 3: Add Tasks

**User Story:** As a user, I want to add new tasks to the Task_List, so that I can record things I need to do.

#### Acceptance Criteria

1. THE Task_List SHALL provide a text input field and a submission control for adding a new Task.
2. WHEN the user submits a non-empty Task text, THE Task_List SHALL append a new Task with the trimmed text and a default completion state of incomplete, then clear the input field.
3. IF the user submits an empty or whitespace-only Task text, THEN THE Task_List SHALL reject the submission and preserve the current input field content.
4. IF the user submits Task text exceeding 500 characters, THEN THE Task_List SHALL reject the submission and preserve the current input field content.
5. WHEN a new Task is added, THE Task_List SHALL save the updated task collection to LocalStorage.

---

### Requirement 4: Edit Tasks

**User Story:** As a user, I want to edit an existing task's text, so that I can correct or update it without deleting and re-adding it.

#### Acceptance Criteria

1. THE Task_List SHALL provide an edit control for each Task.
2. WHEN the user activates the edit control for a Task, THE Task_List SHALL replace the Task's text display with an editable text input pre-filled with the current Task text.
3. WHEN the user activates the edit control for a Task while another Task is already in edit mode, THE Task_List SHALL first exit edit mode on the other Task, discarding unsaved changes, before entering edit mode on the newly selected Task.
4. WHEN the user confirms the edit with a non-empty trimmed text value, THE Task_List SHALL update the Task text and return the Task to display mode.
5. IF the user confirms the edit with an empty or whitespace-only text value, THEN THE Task_List SHALL reject the update and retain the previous Task text.
6. WHEN the user cancels the edit (e.g., via an explicit cancel control or pressing Escape), THE Task_List SHALL discard the changes and return the Task to display mode with its original text.
7. WHEN a Task is successfully edited, THE Task_List SHALL save the updated task collection to LocalStorage.

---

### Requirement 5: Mark Tasks as Done

**User Story:** As a user, I want to mark tasks as complete, so that I can track my progress through my to-do list.

#### Acceptance Criteria

1. THE Task_List SHALL provide a completion toggle control for each Task.
2. WHEN the user activates the completion toggle for an incomplete Task, THE Task_List SHALL set that Task's completion state to complete and apply strikethrough styling to the Task text.
3. WHEN the user activates the completion toggle for a complete Task, THE Task_List SHALL set that Task's completion state to incomplete and remove the strikethrough styling.
4. WHEN a Task's completion state changes, THE Task_List SHALL save the updated task collection to LocalStorage.

---

### Requirement 6: Delete Tasks

**User Story:** As a user, I want to delete tasks from the list, so that I can remove items that are no longer relevant.

#### Acceptance Criteria

1. THE Task_List SHALL provide a delete control for each Task.
2. WHEN the user activates the delete control for a Task, THE Task_List SHALL immediately remove that Task from the Task_List without a confirmation prompt.
3. WHEN a Task is deleted, THE Task_List SHALL save the updated task collection to LocalStorage.

---

### Requirement 7: Persist Tasks Across Sessions

**User Story:** As a user, I want my tasks to be saved automatically, so that they are still there when I reopen the Dashboard.

#### Acceptance Criteria

1. WHEN the Dashboard loads, THE Task_List SHALL read the task collection from LocalStorage using the same key used to write it and render all stored Tasks.
2. IF no task data exists in LocalStorage, THEN THE Task_List SHALL render an empty task list.
3. THE Task_List SHALL store the task collection as a JSON-serialised array in LocalStorage under the consistent key "dashboard_tasks".
4. FOR ALL task collections, serialising then deserialising the collection SHALL produce a task collection with equivalent text and completion state values for every Task (round-trip property).
5. IF the LocalStorage data for tasks is not valid JSON or cannot be parsed, THEN THE Task_List SHALL fall back to an empty task list and not throw an uncaught error.

---

### Requirement 8: Manage Quick Links

**User Story:** As a user, I want to add and remove shortcut buttons to my favorite websites, so that I can open them quickly from the Dashboard.

#### Acceptance Criteria

1. THE Quick_Links component SHALL provide an input form with fields for a link label and a URL, and a submission control.
2. WHEN the user submits a non-empty label and a URL beginning with "http://" or "https://", THE Quick_Links component SHALL add a new Link and display it as a clickable button.
3. IF the user submits an empty label, an empty URL, or a URL that does not begin with "http://" or "https://", THEN THE Quick_Links component SHALL reject the submission.
4. WHEN the user activates a Link button, THE Quick_Links component SHALL open the corresponding URL in a new browser tab.
5. THE Quick_Links component SHALL provide a delete control for each Link.
6. WHEN the user activates the delete control for a Link, THE Quick_Links component SHALL immediately remove that Link from the display without a confirmation prompt.
7. WHEN a Link is added or deleted, THE Quick_Links component SHALL save the updated link collection to LocalStorage under the consistent key "dashboard_links".
8. WHEN the Dashboard loads, THE Quick_Links component SHALL read the link collection from LocalStorage and render all stored Links.
9. IF no link data exists in LocalStorage, THEN THE Quick_Links component SHALL render an empty links section.
10. IF the LocalStorage data for links is not valid JSON or cannot be parsed, THEN THE Quick_Links component SHALL fall back to an empty links section and not throw an uncaught error.

---

### Requirement 9: Responsive Layout

**User Story:** As a user, I want the Dashboard to be readable and usable on different screen sizes, so that I can use it on both desktop and mobile devices.

#### Acceptance Criteria

1. THE Dashboard SHALL adapt its layout so that all widgets are visible without horizontal scrolling and no widget content is clipped at viewport widths from 320px to 2560px.
2. THE Dashboard SHALL use a legible font size of at least 14px for all body text at any supported viewport width.
3. THE Dashboard SHALL ensure all interactive controls remain reachable and operable (not obscured or overlapping) at all supported viewport widths.

---

### Requirement 10: Browser Compatibility

**User Story:** As a user, I want the Dashboard to work in my browser without any installation, so that I can use it immediately by opening the HTML file.

#### Acceptance Criteria

1. THE Dashboard SHALL satisfy all acceptance criteria defined in Requirements 1–9 when tested in the current stable release of Chrome, Firefox, Edge, and Safari.
2. THE Dashboard SHALL operate as a standalone file that can be opened directly from the local file system without a web server.
