# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PomoTask is a Chrome Extension (Manifest V3) that combines the Pomodoro Technique with an integrated task manager. The extension helps users maintain focus by balancing work/study time with strategic breaks.

## Development Setup

### Loading the Extension in Chrome
1. Open Chrome and navigate to: `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right corner)
3. Click "Load unpacked" and select the project directory
4. The tomato icon 🍅 will appear in the extensions toolbar

### Development Commands

**Build**
```bash
npm run build
```
Creates a production-ready `dist/` folder and generates `extension.zip` for distribution. The build script ([scripts/build-extension.mjs](scripts/build-extension.mjs)) copies `manifest.json`, `src/`, and `icons/` to `dist/` and creates a compressed archive.

**Testing**
```bash
npm run test:e2e    # Run Playwright E2E tests only
npm test            # Build + E2E tests
npm run ci          # Clean install + full test suite (CI simulation)
```

**Docker (E2E Testing)**
```bash
docker-compose up       # Run E2E tests in containerized Chromium
docker-compose build    # Rebuild container after dependency changes
```
Uses Playwright image with Chromium pre-installed. See [Dockerfile](Dockerfile) and [docker-compose.yml](docker-compose.yml).

**Development Workflow**
This extension uses vanilla JavaScript with no transpilation. For local development:
1. Load the extension unpacked (see above)
2. Make changes directly to `src/` files
3. Click the reload icon (🔄) in `chrome://extensions/` to see changes
4. For production, run `npm run build` to generate distributable ZIP

## Architecture

### Core Components

The extension follows a modular architecture with separate concerns:

**Background Service Worker** ([src/background/service-worker.js](src/background/service-worker.js))
- Handles system notifications via Chrome Notifications API
- Manages audio playback through offscreen documents (Manifest V3 requirement)
- Listens for runtime messages from popup/timer windows

**Manager Classes** (ES6 classes instantiated on `DOMContentLoaded`)
- `PomodoroTimer` ([src/js/pomodoro-timer.js](src/js/pomodoro-timer.js)) - Timer logic, state management, and session cycles
- `TaskManager` ([src/js/tasks.js](src/js/tasks.js)) - Task CRUD operations with Chrome Storage persistence
- `SettingsManager` ([src/js/settings.js](src/js/settings.js)) - Configuration management
- `NavigationManager` ([src/js/navigation.js](src/js/navigation.js)) - View switching and navigation state

**UI Windows**
- Main popup ([src/popup/popup.html](src/popup/popup.html)) - Primary interface with timer + tasks
- Timer window ([src/popup/timer-window.html](src/popup/timer-window.html)) - Standalone popup window with focused timer view
- Settings view - Embedded in main popup, toggled via navigation

### State Management

All persistent state uses Chrome Storage API (`chrome.storage.local`):
- `timerSettings` - Focus/break durations, rounds, sound preferences
- `timerState` - Current timer mode, time remaining, round number, running status (persists on every tick)
- `tasks` - Task list with completion status
- `nextId` - Auto-increment ID for tasks
- `completedCycles` - Array of completed pomodoro cycles with timestamps
- `currentView` - Last active view (main/settings)

Classes maintain internal state and sync with storage on changes. Timer state persists completely, including time left and current mode, so progress survives browser restarts. No external state management library is used.

### Pomodoro Flow

1. User configures durations in settings (default: 25min focus / 5min short break / 15min long break)
2. Timer counts down each second via `setInterval`
3. On completion, mode switches: Focus → Short Break → Focus (repeats) → Long Break
4. After configured rounds complete, long break triggers and cycle resets
5. Notifications sent via service worker on session transitions

### Inter-Window Communication

The extension can open standalone timer windows using `chrome.windows.create()`. Each window:
- Loads the same manager classes independently
- Shares state through Chrome Storage API
- **Real-time sync**: Uses `chrome.storage.onChanged` listener to sync state changes between windows (when timer is paused)
- Running timers don't sync to prevent conflicts between multiple active instances

### HTML Structure

Main popup uses iframes for modular components:
- Header ([src/popup/html/header.html](src/popup/html/header.html))
- Footer ([src/popup/html/footer.html](src/popup/html/footer.html))
- Settings timer form ([src/popup/html/settimer.html](src/popup/html/settimer.html))

Scripts are loaded at the document level and query into iframe content where needed.

## Key Implementation Details

### Manager Class Pattern
Each manager follows this structure:
```javascript
class Manager {
  constructor() {
    this.state = {}; // Internal state
    this.elements = {}; // Cached DOM references
    this.init();
  }

  init() {
    this.cacheElements(); // or bind elements directly in constructor
    this.bindEvents();
    this.loadSettings(); // Load from chrome.storage
  }

  async saveState() {
    await chrome.storage.local.set({ key: this.state });
  }
}
```

Global instances are created on DOMContentLoaded: `window.pomodoroTimer`, `window.taskManager`, `window.settingsManager`, `window.navigationManager`

### Timer State Synchronization
When settings change, `SettingsManager` directly calls `window.pomodoroTimer.updateSettings()` if available. This pattern assumes both classes are loaded in the same document.

### Audio Playback (Manifest V3)
Due to Manifest V3 restrictions, audio playback requires an offscreen document:
1. Service worker creates offscreen document ([src/popup/sounds.html](src/popup/sounds.html))
2. Offscreen document plays audio
3. Document auto-closes after playback

### Content Security Policy (CSP)
The extension uses a strict CSP in [manifest.json](manifest.json):
- `script-src 'self'` - Only scripts from extension origin
- `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com` - Allows inline styles and Google Fonts
- `font-src 'self' https://fonts.gstatic.com` - Allows Google Fonts assets
- `object-src 'self'` - Restricts plugin content

When adding external resources, ensure they comply with this policy or update the CSP accordingly.

## File Organization

```
src/
├── background/
│   └── service-worker.js      # Background events, notifications
├── js/
│   ├── pomodoro-timer.js      # Timer logic and state management
│   ├── tasks.js               # Task CRUD operations
│   ├── settings.js            # Settings persistence and UI
│   └── navigation.js          # View routing and navigation state
├── popup/
│   ├── popup.html             # Main extension popup
│   ├── timer-window.html      # Standalone timer window
│   ├── sounds.html            # Offscreen audio player
│   ├── popup.js               # Popup initialization and UI interactions
│   ├── popup.css              # Main styles
│   ├── html/                  # Modular HTML components (iframes)
│   └── styles/                # Additional stylesheets
└── icons/                     # Extension icons
```

## Storage Schema

```javascript
{
  timerSettings: {
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    rounds: 4,
    soundAlert: false,
    autoCheck: false
  },
  timerState: {
    mode: 'focus' | 'shortBreak' | 'longBreak',
    timeLeft: number, // seconds
    currentRound: number,
    isRunning: boolean
  },
  tasks: Array<{ id: number, text: string, completed: boolean }>,
  nextId: number,
  completedCycles: Array<{ date: string, rounds: number }>,
  currentView: 'main' | 'settings'
}
```

## Testing

The project uses Playwright for E2E testing with Chromium. Tests validate:
- Extension loads correctly in Chrome
- Timer functionality and state persistence
- Task CRUD operations
- Settings management

CI pipeline ([.github/workflows/ci.yml](.github/workflows/ci.yml)) runs on push/PR to main branch:
1. Installs dependencies with `npm ci`
2. Installs Playwright with Chromium
3. Builds extension
4. Runs E2E tests
5. Uploads artifacts (playwright report, extension.zip, failure screenshots)

## Known Constraints

- Timer syncs between windows only when paused (prevents conflicts with multiple running instances)
- `autoCheck` setting UI exists but feature not yet implemented (auto-check tasks on break completion)
- Notifications require user permission on first use (standard Chrome behavior)
- Completed cycles history dashboard UI not yet implemented (data collection is working)
