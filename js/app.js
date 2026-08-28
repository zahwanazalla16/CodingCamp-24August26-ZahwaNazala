/**
 * Life Dashboard — js/app.js
 *
 * Vanilla JavaScript, no frameworks, no external libraries.
 * All state is in-memory; persistent state uses window.localStorage.
 *
 * Widgets:
 *   - Theme (light / dark mode)
 *   - Greeting (clock, date, time-based greeting, custom name)
 *   - Timer (Pomodoro countdown, custom duration, Web Audio beep)
 *   - Task List (add, edit, toggle, delete — persisted)
 *   - Quick Links (add, delete — persisted)
 */

'use strict';

/* =========================================================
   CONSTANTS — LocalStorage keys
   ========================================================= */

const KEYS = {
  tasks:         'dashboard_tasks',
  links:         'dashboard_links',
  theme:         'dashboard_theme',
  timerDuration: 'dashboard_timer_duration',
  userName:      'dashboard_user_name',
};

/* =========================================================
   THEME WIDGET
   ========================================================= */

/**
 * Reads the saved theme from localStorage and applies it.
 * Falls back to 'light' if nothing is stored.
 */
function loadTheme() {
  const saved = localStorage.getItem(KEYS.theme) || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeButton(saved);
}

/**
 * Switches between 'light' and 'dark', saves the preference.
 */
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next    = current === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  try { localStorage.setItem(KEYS.theme, next); } catch (e) { console.error('localStorage error:', e); }
  updateThemeButton(next);
}

/**
 * Updates the theme toggle button label/icon to reflect current theme.
 * @param {string} theme - 'light' or 'dark'
 */
function updateThemeButton(theme) {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  btn.textContent = theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
}

/**
 * Initialises theme on page load and wires the toggle button.
 */
function initTheme() {
  loadTheme();
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.addEventListener('click', toggleTheme);
}

/* =========================================================
   USER NAME WIDGET
   ========================================================= */

/**
 * Reads the saved user name from localStorage.
 * @returns {string} The saved name, or '' if none.
 */
function loadUserName() {
  return localStorage.getItem(KEYS.userName) || '';
}

/**
 * Saves the user name to localStorage.
 * @param {string} name
 */
function saveUserName(name) {
  try {
    localStorage.setItem(KEYS.userName, name.trim());
  } catch (e) {
    console.error('localStorage error:', e);
  }
}

/**
 * Wires the name input and save button; updates the greeting on save.
 */
function initUserName() {
  const input = document.getElementById('user-name-input');
  const btn   = document.getElementById('user-name-btn');
  if (!input || !btn) return;

  // Pre-fill with stored name
  input.value = loadUserName();

  const handleSave = () => {
    saveUserName(input.value);
    renderGreeting(); // refresh greeting immediately
  };

  btn.addEventListener('click', handleSave);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSave();
  });
}

/* =========================================================
   GREETING WIDGET
   ========================================================= */

/** Day and month name look-up arrays. */
const DAY_NAMES   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTH_NAMES = ['January','February','March','April','May','June',
                     'July','August','September','October','November','December'];

/**
 * Formats a Date object as "HH:MM:SS" (24-hour, zero-padded).
 * Returns "--:--:--" if the date is invalid.
 * @param {Date} date
 * @returns {string}
 */
function formatTime(date) {
  if (!(date instanceof Date) || isNaN(date.getTime())) return '--:--:--';
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

/**
 * Formats a Date object as "DayName, DD MonthName YYYY".
 * Returns "Date unavailable" if the date is invalid.
 * @param {Date} date
 * @returns {string}
 */
function formatDate(date) {
  if (!(date instanceof Date) || isNaN(date.getTime())) return 'Date unavailable';
  const day   = DAY_NAMES[date.getDay()];
  const dd    = String(date.getDate()).padStart(2, '0');
  const month = MONTH_NAMES[date.getMonth()];
  const yyyy  = date.getFullYear();
  return `${day}, ${dd} ${month} ${yyyy}`;
}

/**
 * Returns the time-based greeting string (WITHOUT a name).
 * hour [5–11]  → "Good Morning"
 * hour [12–17] → "Good Afternoon"
 * hour [0–4] or [18–23] → "Good Evening"
 * @param {number} hour - integer 0–23
 * @returns {string}
 */
function getGreeting(hour) {
  if (hour >= 5  && hour <= 11) return 'Good Morning';
  if (hour >= 12 && hour <= 17) return 'Good Afternoon';
  return 'Good Evening';
}

/**
 * Reads the current time, updates #time-display, #date-display, and #greeting-text.
 * Appends ", [Name]!" to the greeting if a name is saved.
 */
function renderGreeting() {
  const now  = new Date();
  const name = loadUserName();

  const timeEl     = document.getElementById('time-display');
  const dateEl     = document.getElementById('date-display');
  const greetingEl = document.getElementById('greeting-text');

  if (timeEl)     timeEl.textContent     = formatTime(now);
  if (dateEl)     dateEl.textContent     = formatDate(now);
  if (greetingEl) {
    const base = getGreeting(isNaN(now.getTime()) ? 0 : now.getHours());
    greetingEl.textContent = name ? `${base}, ${name}!` : `${base}!`;
  }
}

/**
 * Calls renderGreeting immediately, then every second.
 */
function initGreeting() {
  renderGreeting();
  setInterval(renderGreeting, 1000);
}

/* =========================================================
   TIMER WIDGET
   ========================================================= */

/** Default Pomodoro duration in seconds. */
const DEFAULT_TIMER_SECONDS = 1500; // 25 minutes

/**
 * In-memory timer state — intentionally NOT persisted to localStorage.
 * @type {{ remainingSeconds: number, status: 'idle'|'running'|'paused'|'completed', intervalId: number|null }}
 */
let timerState = resetState(DEFAULT_TIMER_SECONDS);

/** Lazy AudioContext — created on first user interaction. */
let audioCtx = null;

/**
 * Formats a number of seconds as "MM:SS" (zero-padded).
 * @param {number} seconds - integer 0–9999
 * @returns {string}
 */
function formatTimerDisplay(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * Returns button disabled states based on timer status.
 * @param {string} status
 * @returns {{ startDisabled: boolean, stopDisabled: boolean }}
 */
function getTimerControlState(status) {
  return {
    startDisabled: status === 'running',
    stopDisabled:  status !== 'running',
  };
}

/**
 * Pure function: decrements remaining seconds by 1.
 * When remainingSeconds reaches 0, returns status 'completed'.
 * @param {{ remainingSeconds: number, status: string, intervalId: number|null }} state
 * @returns {{ remainingSeconds: number, status: string, intervalId: number|null }}
 */
function tick(state) {
  const next = state.remainingSeconds - 1;
  if (next <= 0) {
    return { ...state, remainingSeconds: 0, status: 'completed' };
  }
  return { ...state, remainingSeconds: next };
}

/**
 * Returns the canonical idle state for the given duration.
 * @param {number} durationSeconds
 * @returns {{ remainingSeconds: number, status: 'idle', intervalId: null }}
 */
function resetState(durationSeconds) {
  return { remainingSeconds: durationSeconds, status: 'idle', intervalId: null };
}

/**
 * Reads the saved custom duration from localStorage.
 * Falls back to DEFAULT_TIMER_SECONDS.
 * @returns {number}
 */
function loadTimerDuration() {
  const raw = localStorage.getItem(KEYS.timerDuration);
  if (raw === null) return DEFAULT_TIMER_SECONDS;
  const minutes = parseInt(raw, 10);
  if (isNaN(minutes) || minutes < 1) return DEFAULT_TIMER_SECONDS;
  return minutes * 60;
}

/**
 * Plays a short oscillator beep via the Web Audio API.
 * Errors are swallowed silently so the UI is never broken by audio failures.
 */
function playBeep() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gain       = audioCtx.createGain();
    oscillator.connect(gain);
    gain.connect(audioCtx.destination);
    oscillator.type            = 'sine';
    oscillator.frequency.value = 880; // A5 note
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.6);
  } catch (_) { /* swallow silently */ }
}

/**
 * Updates all timer-related DOM elements to reflect current timerState.
 */
function renderTimer() {
  const display = document.getElementById('timer-display');
  const startBtn = document.getElementById('timer-start');
  const stopBtn  = document.getElementById('timer-stop');
  const alert    = document.getElementById('timer-alert');

  if (display) display.textContent = formatTimerDisplay(timerState.remainingSeconds);

  const { startDisabled, stopDisabled } = getTimerControlState(timerState.status);
  if (startBtn) startBtn.disabled = startDisabled;
  if (stopBtn)  stopBtn.disabled  = stopDisabled;

  if (alert) {
    if (timerState.status === 'completed') {
      alert.classList.add('visible');
    } else {
      alert.classList.remove('visible');
    }
  }
}

/**
 * Starts or resumes the countdown.
 * Lazily creates AudioContext to satisfy browser autoplay policy.
 */
function startTimer() {
  // Create AudioContext on first user interaction
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (_) {}
  }
  if (timerState.status === 'running') return;
  timerState = { ...timerState, status: 'running' };

  timerState.intervalId = setInterval(() => {
    timerState = tick(timerState);
    renderTimer();
    if (timerState.status === 'completed') {
      clearInterval(timerState.intervalId);
      timerState.intervalId = null;
      playBeep();
    }
  }, 1000);

  renderTimer();
}

/**
 * Pauses the countdown, retaining remaining seconds.
 */
function pauseTimer() {
  if (timerState.intervalId !== null) {
    clearInterval(timerState.intervalId);
  }
  timerState = { ...timerState, status: 'paused', intervalId: null };
  renderTimer();
}

/**
 * Stops the countdown and resets to the current saved duration.
 */
function resetTimer() {
  if (timerState.intervalId !== null) {
    clearInterval(timerState.intervalId);
  }
  const duration = loadTimerDuration();
  timerState = resetState(duration);
  // Hide alert
  const alert = document.getElementById('timer-alert');
  if (alert) alert.classList.remove('visible');
  renderTimer();
}

/**
 * Initialises the timer widget: sets initial state, wires buttons.
 */
function initTimer() {
  const duration = loadTimerDuration();
  timerState = resetState(duration);

  // Pre-fill duration input with saved value (in minutes)
  const durationInput = document.getElementById('timer-duration-input');
  if (durationInput) {
    durationInput.value = Math.round(duration / 60);
  }

  // Wire start / pause / reset buttons
  const startBtn  = document.getElementById('timer-start');
  const stopBtn   = document.getElementById('timer-stop');
  const resetBtn  = document.getElementById('timer-reset');
  const alertDismiss = document.getElementById('timer-alert-dismiss');
  const durBtn    = document.getElementById('timer-duration-btn');

  if (startBtn) startBtn.addEventListener('click', startTimer);
  if (stopBtn)  stopBtn.addEventListener('click',  pauseTimer);
  if (resetBtn) resetBtn.addEventListener('click', resetTimer);

  // Dismiss alert
  if (alertDismiss) {
    alertDismiss.addEventListener('click', () => {
      const alert = document.getElementById('timer-alert');
      if (alert) alert.classList.remove('visible');
      // If completed, reset so the user can start fresh
      if (timerState.status === 'completed') resetTimer();
    });
  }

  // Custom duration button
  if (durBtn && durationInput) {
    const applyDuration = () => {
      const minutes = parseInt(durationInput.value, 10);
      if (isNaN(minutes) || minutes < 1 || minutes > 99) {
        durationInput.value = Math.round(loadTimerDuration() / 60);
        return;
      }
      try { localStorage.setItem(KEYS.timerDuration, String(minutes)); } catch (e) { console.error(e); }
      resetTimer(); // reset to new duration
    };
    durBtn.addEventListener('click', applyDuration);
    durationInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') applyDuration();
    });
  }

  renderTimer();
}

/* =========================================================
   TASK LIST WIDGET — Pure Functions
   ========================================================= */

/**
 * Returns true if text is non-empty after trimming and <= 500 chars.
 * @param {string} text
 * @returns {boolean}
 */
function isValidTaskText(text) {
  const trimmed = (text || '').trim();
  return trimmed.length > 0 && trimmed.length <= 500;
}

/**
 * Returns true if any existing task has the same text (case-insensitive).
 * @param {Array} tasks
 * @param {string} text
 * @param {string|null} excludeId - id of the task being edited (skip self-comparison)
 * @returns {boolean}
 */
function isDuplicateTask(tasks, text, excludeId = null) {
  const normalised = (text || '').trim().toLowerCase();
  return tasks.some((t) => t.id !== excludeId && t.text.toLowerCase() === normalised);
}

/**
 * Appends a new task to the array. Returns the array unchanged if text is invalid or duplicate.
 * @param {Array<{id:string,text:string,completed:boolean}>} tasks
 * @param {string} text
 * @returns {Array}
 */
function addTask(tasks, text) {
  if (!isValidTaskText(text)) return tasks;
  if (isDuplicateTask(tasks, text)) return tasks; // reject duplicates
  const newTask = {
    id:        (typeof crypto !== 'undefined' && crypto.randomUUID)
                 ? crypto.randomUUID()
                 : Date.now().toString(),
    text:      text.trim(),
    completed: false,
  };
  return [...tasks, newTask];
}

/**
 * Returns a new array without the task matching the given id.
 * @param {Array} tasks
 * @param {string} id
 * @returns {Array}
 */
function deleteTask(tasks, id) {
  return tasks.filter((t) => t.id !== id);
}

/**
 * Returns a new array with the target task's text updated.
 * Returns the array unchanged if newText is invalid.
 * @param {Array} tasks
 * @param {string} id
 * @param {string} newText
 * @returns {Array}
 */
function editTask(tasks, id, newText) {
  if (!isValidTaskText(newText)) return tasks;
  return tasks.map((t) =>
    t.id === id ? { ...t, text: newText.trim() } : t
  );
}

/**
 * Returns a new array with the target task's completed boolean toggled.
 * @param {Array} tasks
 * @param {string} id
 * @returns {Array}
 */
function toggleTask(tasks, id) {
  return tasks.map((t) =>
    t.id === id ? { ...t, completed: !t.completed } : t
  );
}

/* =========================================================
   TASK LIST WIDGET — Persistence
   ========================================================= */

/**
 * Serialises and saves the task array to localStorage.
 * Catches quota errors and logs to console.
 * @param {Array} tasks
 */
function saveTasks(tasks) {
  try {
    localStorage.setItem(KEYS.tasks, JSON.stringify(tasks));
  } catch (e) {
    console.error('localStorage quota error (tasks):', e);
  }
}

/**
 * Loads the task array from localStorage.
 * Returns [] on missing key or any parse error.
 * @returns {Array}
 */
function loadTasks() {
  try {
    const raw = localStorage.getItem(KEYS.tasks);
    if (raw === null) return [];
    return JSON.parse(raw);
  } catch (_) {
    return [];
  }
}

/* =========================================================
   TASK LIST WIDGET — Rendering & Interaction
   ========================================================= */

/**
 * Module-level id of the task currently in edit mode (null if none).
 * @type {string|null}
 */
let editingTaskId = null;

/**
 * In-memory task array — kept in sync with localStorage on every mutation.
 * @type {Array<{id:string,text:string,completed:boolean}>}
 */
let tasks = [];

/**
 * Current sort order: 'none' | 'asc' | 'desc'
 * Visual only — does not mutate the stored array order.
 * @type {string}
 */
let sortOrder = 'none';

/**
 * Returns a sorted copy of tasks for display.
 * Completed tasks always sink to the bottom regardless of sort direction.
 * @param {Array} arr
 * @param {string} order - 'asc' | 'desc'
 * @returns {Array}
 */
function sortTasks(arr, order) {
  return arr.slice().sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const ta = a.text.toLowerCase();
    const tb = b.text.toLowerCase();
    if (order === 'asc')  return ta < tb ? -1 : ta > tb ? 1 : 0;
    if (order === 'desc') return ta > tb ? -1 : ta < tb ? 1 : 0;
    return 0;
  });
}

/**
 * Rebuilds the full #task-list DOM from the current tasks array.
 * At most one task is in edit mode (tracked by editingTaskId).
 * Respects current sortOrder for display (does not mutate stored order).
 */
function renderTaskList() {
  const list = document.getElementById('task-list');
  if (!list) return;
  list.innerHTML = '';

  // Keep sort button label in sync
  const sortBtn = document.getElementById('task-sort-btn');
  if (sortBtn) {
    if (sortOrder === 'asc')       sortBtn.textContent = 'Sort: Z→A';
    else if (sortOrder === 'desc') sortBtn.textContent = 'Sort: None';
    else                           sortBtn.textContent = 'Sort: A→Z';
    sortBtn.title = sortOrder === 'none' ? 'Click to sort A→Z'
                  : sortOrder === 'asc'  ? 'Click to sort Z→A'
                  : 'Click to clear sort';
  }

  if (tasks.length === 0) {
    const empty = document.createElement('li');
    empty.className   = 'task-empty';
    empty.textContent = 'No tasks yet. Add one above!';
    list.appendChild(empty);
    return;
  }

  // Apply visual sort without mutating stored order
  const displayTasks = sortOrder !== 'none' ? sortTasks(tasks, sortOrder) : tasks;

  displayTasks.forEach((task) => {
    const li = document.createElement('li');
    li.className  = 'task-item';
    li.dataset.id = task.id;

    if (task.id === editingTaskId) {
      // ── EDIT MODE ──────────────────────────────────────────
      const editInput = document.createElement('input');
      editInput.type      = 'text';
      editInput.className = 'input task-edit-input';
      editInput.value     = task.text;
      editInput.maxLength = 500;
      editInput.setAttribute('aria-label', `Edit task: ${task.text}`);

      const confirmBtn = document.createElement('button');
      confirmBtn.className   = 'btn btn-accent btn-sm';
      confirmBtn.textContent = 'Save';
      confirmBtn.setAttribute('aria-label', 'Confirm edit');

      const cancelBtn = document.createElement('button');
      cancelBtn.className   = 'btn btn-secondary btn-sm';
      cancelBtn.textContent = 'Cancel';
      cancelBtn.setAttribute('aria-label', 'Cancel edit');

      const editError = document.createElement('span');
      editError.className = 'error-msg edit-error';
      editError.hidden    = true;

      const handleConfirm = () => {
        const newText = editInput.value;
        if (!isValidTaskText(newText)) {
          editError.textContent = 'Task text cannot be empty.';
          editError.hidden      = false;
          return;
        }
        if (isDuplicateTask(tasks, newText, task.id)) {
          editError.textContent = 'A task with this name already exists.';
          editError.hidden      = false;
          return;
        }
        tasks         = editTask(tasks, task.id, newText);
        editingTaskId = null;
        saveTasks(tasks);
        renderTaskList();
      };

      const handleCancel = () => {
        editingTaskId = null;
        renderTaskList();
      };

      confirmBtn.addEventListener('click', handleConfirm);
      cancelBtn.addEventListener('click',  handleCancel);
      editInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter')  handleConfirm();
        if (e.key === 'Escape') handleCancel();
      });

      li.append(editInput, confirmBtn, cancelBtn, editError);
      requestAnimationFrame(() => editInput.focus());

    } else {
      // ── DISPLAY MODE ───────────────────────────────────────
      const checkbox = document.createElement('input');
      checkbox.type      = 'checkbox';
      checkbox.className = 'task-checkbox';
      checkbox.checked   = task.completed;
      checkbox.setAttribute('aria-label', `Mark "${task.text}" as ${task.completed ? 'incomplete' : 'complete'}`);
      checkbox.addEventListener('change', () => {
        tasks = toggleTask(tasks, task.id);
        saveTasks(tasks);
        renderTaskList();
      });

      const textSpan = document.createElement('span');
      textSpan.className   = 'task-text' + (task.completed ? ' task-completed' : '');
      textSpan.textContent = task.text;

      // Edit button — text label, no emoji
      const editBtn = document.createElement('button');
      editBtn.className   = 'btn btn-secondary btn-sm';
      editBtn.textContent = 'Edit';
      editBtn.setAttribute('aria-label', `Edit task: ${task.text}`);
      editBtn.addEventListener('click', () => {
        editingTaskId = task.id;
        renderTaskList();
      });

      // Delete button — text label, no emoji
      const deleteBtn = document.createElement('button');
      deleteBtn.className   = 'btn btn-danger btn-sm';
      deleteBtn.textContent = 'Delete';
      deleteBtn.setAttribute('aria-label', `Delete task: ${task.text}`);
      deleteBtn.addEventListener('click', () => {
        tasks = deleteTask(tasks, task.id);
        if (editingTaskId === task.id) editingTaskId = null;
        saveTasks(tasks);
        renderTaskList();
      });

      li.append(checkbox, textSpan, editBtn, deleteBtn);
    }

    list.appendChild(li);
  });
}

/**
 * Shows the task error message for 3 seconds, then hides it.
 * @param {string} message
 */
function showTaskError(message) {
  const el = document.getElementById('task-error');
  if (!el) return;
  el.textContent = message;
  el.hidden = false;
  clearTimeout(el._hideTimer);
  el._hideTimer = setTimeout(() => { el.hidden = true; }, 3000);
}

/**
 * Initialises the Task List widget.
 */
function initTaskList() {
  tasks = loadTasks();
  renderTaskList();

  const input  = document.getElementById('task-input');
  const addBtn = document.getElementById('task-add-btn');

  const handleAdd = () => {
    const text = input ? input.value : '';
    if (!isValidTaskText(text)) {
      showTaskError((text || '').trim().length === 0
        ? 'Task text cannot be empty.'
        : 'Task text cannot exceed 500 characters.');
      return;
    }
    if (isDuplicateTask(tasks, text, null)) {
      showTaskError('This task already exists.');
      return;
    }
    tasks = addTask(tasks, text);
    saveTasks(tasks);
    if (input) input.value = '';
    const errEl = document.getElementById('task-error');
    if (errEl) errEl.hidden = true;
    renderTaskList();
  };

  if (addBtn) addBtn.addEventListener('click', handleAdd);
  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleAdd();
    });
  }

  // Sort button — cycles: none → asc → desc → none
  const sortBtn = document.getElementById('task-sort-btn');
  if (sortBtn) {
    sortBtn.addEventListener('click', () => {
      if (sortOrder === 'none')       sortOrder = 'asc';
      else if (sortOrder === 'asc')   sortOrder = 'desc';
      else                            sortOrder = 'none';
      renderTaskList();
    });
  }
}

/* =========================================================
   QUICK LINKS WIDGET — Pure Functions
   ========================================================= */

/**
 * Returns true if label is non-empty and url starts with http:// or https://.
 * @param {string} label
 * @param {string} url
 * @returns {boolean}
 */
function isValidLink(label, url) {
  return (
    (label || '').trim().length > 0 &&
    /^https?:\/\//i.test(url || '')
  );
}

/**
 * Appends a new link. Returns the array unchanged if the input is invalid.
 * @param {Array<{id:string,label:string,url:string}>} links
 * @param {string} label
 * @param {string} url
 * @returns {Array}
 */
function addLink(links, label, url) {
  if (!isValidLink(label, url)) return links;
  const newLink = {
    id:    (typeof crypto !== 'undefined' && crypto.randomUUID)
             ? crypto.randomUUID()
             : Date.now().toString(),
    label: label.trim(),
    url,
  };
  return [...links, newLink];
}

/**
 * Returns a new array without the link matching the given id.
 * @param {Array} links
 * @param {string} id
 * @returns {Array}
 */
function deleteLink(links, id) {
  return links.filter((l) => l.id !== id);
}

/* =========================================================
   QUICK LINKS WIDGET — Persistence
   ========================================================= */

/**
 * Serialises and saves the links array to localStorage.
 * @param {Array} links
 */
function saveLinks(links) {
  try {
    localStorage.setItem(KEYS.links, JSON.stringify(links));
  } catch (e) {
    console.error('localStorage quota error (links):', e);
  }
}

/**
 * Loads the links array from localStorage.
 * Returns [] on missing key or any parse error.
 * @returns {Array}
 */
function loadLinks() {
  try {
    const raw = localStorage.getItem(KEYS.links);
    if (raw === null) return [];
    return JSON.parse(raw);
  } catch (_) {
    return [];
  }
}

/* =========================================================
   QUICK LINKS WIDGET — Rendering & Interaction
   ========================================================= */

/**
 * In-memory links array.
 * @type {Array<{id:string,label:string,url:string}>}
 */
let links = [];

/**
 * Rebuilds the #quick-links-list DOM from the current links array.
 * Each link renders as a bordered card with:
 *   - the link label as a clickable anchor
 *   - a small × delete button pinned to the top-right corner of the card
 */
function renderQuickLinks() {
  const container = document.getElementById('quick-links-list');
  if (!container) return;
  container.innerHTML = '';

  if (links.length === 0) {
    const empty = document.createElement('p');
    empty.className   = 'links-empty';
    empty.textContent = 'No links yet. Add one above!';
    container.appendChild(empty);
    return;
  }

  links.forEach((link) => {
    // Outer card (position: relative so the delete btn can be absolute)
    const card = document.createElement('div');
    card.className = 'link-card';

    // Clickable link label
    const anchor = document.createElement('a');
    anchor.href        = link.url;
    anchor.target      = '_blank';
    anchor.rel         = 'noopener noreferrer';
    anchor.className   = 'link-card-anchor';
    anchor.textContent = link.label;
    anchor.setAttribute('aria-label', `Open ${link.label} in new tab`);

    // Small × delete button pinned top-right
    const deleteBtn = document.createElement('button');
    deleteBtn.className   = 'link-card-delete';
    deleteBtn.textContent = '×';
    deleteBtn.setAttribute('aria-label', `Remove ${link.label}`);
    deleteBtn.addEventListener('click', () => {
      links = deleteLink(links, link.id);
      saveLinks(links);
      renderQuickLinks();
    });

    card.appendChild(anchor);
    card.appendChild(deleteBtn);
    container.appendChild(card);
  });
}

/**
 * Shows the link error message for 3 seconds, then hides it.
 * @param {string} message
 */
function showLinkError(message) {
  const el = document.getElementById('link-error');
  if (!el) return;
  el.textContent = message;
  el.hidden = false;
  clearTimeout(el._hideTimer);
  el._hideTimer = setTimeout(() => { el.hidden = true; }, 3000);
}

/**
 * Initialises the Quick Links widget.
 */
function initQuickLinks() {
  links = loadLinks();
  renderQuickLinks();

  const labelInput = document.getElementById('link-label-input');
  const urlInput   = document.getElementById('link-url-input');
  const addBtn     = document.getElementById('link-add-btn');

  const handleAdd = () => {
    const label = labelInput ? labelInput.value : '';
    const url   = urlInput   ? urlInput.value   : '';
    if (!isValidLink(label, url)) {
      showLinkError('Please provide a label and a valid http:// or https:// URL.');
      return;
    }
    links = addLink(links, label, url);
    saveLinks(links);
    if (labelInput) labelInput.value = '';
    if (urlInput)   urlInput.value   = '';
    const errEl = document.getElementById('link-error');
    if (errEl) errEl.hidden = true;
    renderQuickLinks();
  };

  if (addBtn) addBtn.addEventListener('click', handleAdd);
  if (urlInput) {
    urlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleAdd();
    });
  }
}

/* =========================================================
   ENTRY POINT
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initUserName();
  initGreeting();
  initTimer();
  initTaskList();
  initQuickLinks();
});
