
# 🗂️ Life Dashboard

A personal productivity homepage built with plain HTML, CSS, and Vanilla JavaScript — no frameworks, no build tools, no server. Open `index.html` in any modern browser and you're ready to go.

Built as part of the **RevoU Coding Camp** by **Zahwa Nazala Khalisan Herdiyana**.

---

## ✨ Features

### 🕐 Greeting Widget
- Live clock that updates every second (HH:MM:SS, 24-hour format)
- Current date displayed as "DayName, DD MonthName YYYY"
- Time-based greeting — Good Morning / Good Afternoon / Good Evening
- **Custom name** — enter your name and the greeting personalises to "Good Morning, [Name]!"

### ⏱️ Focus Timer
- 25-minute Pomodoro countdown timer
- **Start** — begins or resumes the countdown
- **Pause** — freezes the timer at the current remaining time
- **Reset** — returns to the configured duration
- Visual + audible alert when the timer reaches 00:00 (Web Audio API beep, no external file needed)
- **Custom duration** — set any duration from 1 to 99 minutes; saved across sessions

### ✅ To-Do List
- Add tasks (up to 500 characters each)
- Inline edit with Save / Cancel (Enter to confirm, Escape to cancel)
- Mark tasks as complete — strikethrough styling applied automatically
- Delete tasks instantly
- **Duplicate prevention** — adding or editing to an existing task name is blocked (case-insensitive)
- **Sort tasks** — cycle through A→Z, Z→A, or original order; completed tasks always sink to the bottom
- All tasks saved automatically to LocalStorage

### 🔗 Quick Links
- Add shortcut buttons to your favourite websites (label + URL)
- Each link opens in a new tab (`rel="noopener noreferrer"`)
- Bordered card layout with a small × delete button in the top-right corner
- All links saved automatically to LocalStorage

### 🌙 Light / Dark Mode
- Toggle between light and dark themes from the header
- Preference saved to LocalStorage and restored on next visit
- Smooth CSS transitions between themes

---

## 🚀 Getting Started

No installation or setup required.

1. Clone or download this repository
2. Open `index.html` in your browser

```
double-click index.html
— or —
drag index.html into a browser tab
```

That's it. Everything runs locally — no internet connection needed after the first load.

---

## 📁 Project Structure

```
├── index.html          # App structure and markup
├── css/
│   └── style.css       # All styles, themes, and responsive layout
├── js/
│   └── app.js          # All logic, state, and DOM interaction
└── README.md
```

> **Folder rules:** exactly one CSS file in `css/`, exactly one JS file in `js/`.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Structure | HTML5 (semantic elements) |
| Styling | CSS3 (custom properties, Grid, Flexbox, `clamp()`) |
| Logic | Vanilla JavaScript (ES6+, no frameworks) |
| Storage | Browser LocalStorage API |
| Audio | Web Audio API (oscillator beep on timer completion) |

---

## 💾 LocalStorage Keys

| Key | What it stores |
|---|---|
| `dashboard_tasks` | JSON array of task objects `{ id, text, completed }` |
| `dashboard_links` | JSON array of link objects `{ id, label, url }` |
| `dashboard_theme` | `"light"` or `"dark"` |
| `dashboard_timer_duration` | Custom Pomodoro duration in minutes |
| `dashboard_user_name` | Custom greeting name |

All data lives entirely in your browser — nothing is ever sent to a server.

---

## ✅ Requirements Checklist

### Technical Constraints
- ✅ HTML for structure
- ✅ CSS for styling
- ✅ Vanilla JavaScript (no React, Vue, etc.)
- ✅ No backend server required
- ✅ Browser LocalStorage API for all persistence
- ✅ Works in Chrome, Firefox, Edge, Safari
- ✅ Standalone — opens directly from the file system

### Non-Functional Requirements
- ✅ Clean, minimal interface
- ✅ No complex setup — open and use immediately
- ✅ No test setup required
- ✅ Fast load (zero dependencies, three files)
- ✅ Responsive from 320px to 2560px
- ✅ Legible typography (min 14px, system font stack)

### MVP Features
- ✅ Current time and date display
- ✅ Time-based greeting
- ✅ 25-minute focus timer with Start / Pause / Reset
- ✅ Add, edit, complete, and delete tasks
- ✅ Tasks saved in LocalStorage
- ✅ Quick Links saved in LocalStorage

### Challenges (5 / 5)
- ✅ Light / Dark mode
- ✅ Custom name in greeting
- ✅ Change Pomodoro time
- ✅ Prevent duplicate tasks
- ✅ Sort tasks

---

## 📖 Usage Tips

- **Timer:** Click **Set** after changing the duration — the timer resets to the new value immediately.
- **Tasks:** Press **Enter** in the input to add a task quickly. In edit mode, **Enter** saves and **Escape** cancels.
- **Quick Links:** URL must start with `http://` or `https://`. The link label supports any text.
- **Sort:** The sort button cycles — first click sorts A→Z, second Z→A, third back to original order. Completed tasks always appear at the bottom regardless of sort.
- **Theme:** Your chosen theme is remembered the next time you open the page.

---

## 👩‍💻 Author

**Zahwa Nazala Khalisan Herdiyana**
RevoU Coding Camp — August 2026
