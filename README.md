# ProjectUnsafe — Frontend

A cybersecurity learning platform with Linux labs and a C programming playground.
Inspired by HackTheBox, TryHackMe, and LeetCode.

---

## Stack

| Tech | Purpose |
|------|---------|
| React 18 | UI framework |
| Vite | Dev server + bundler |
| React Router v6 | Client-side routing |
| Plain CSS | Styling (no framework) |
| JetBrains Mono + Syne | Typography |

---

## Quick Start

```bash
cd projectunsafe
npm install
npm run dev
# → http://localhost:5173
```

### Demo Credentials

| Username | Password | Role |
|----------|----------|------|
| `admin`  | `admin`  | Admin |
| anything | anything | User |
| —        | —        | Click "Play Anonymously" |

---

## Folder Structure

```
src/
├── components/
│   ├── Navbar/          # Top nav with auth state
│   ├── LabCard/         # Lab catalog card
│   ├── Terminal/        # Browser terminal (mock + WebSocket)
│   ├── CodeEditor/      # C code editor (textarea, swap for Monaco)
│   ├── HintPanel/       # Progressive hint reveal
│   └── AdminTable/      # Container management table
│
├── pages/
│   ├── Landing/         # Hero + features + lab preview
│   ├── Login/           # Login form
│   ├── Signup/          # Registration form
│   ├── ResetPassword/   # Password reset
│   ├── Labs/            # Labs catalog with filters
│   ├── LabPage/         # Lab environment (description + terminal)
│   ├── Dashboard/       # User dashboard
│   ├── Playground/      # C programming playground
│   └── AdminDashboard/  # Admin panel
│
├── services/
│   └── api.js           # All API calls + mock data (set USE_MOCK=false for real backend)
│
├── context/
│   └── AuthContext.jsx  # Auth state: guest | anonymous | user | admin
│
├── styles/
│   └── global.css       # Design tokens, shared components
│
├── App.jsx              # Router setup + route guards
└── main.jsx             # Entry point
```

---

## Switching from Mock to Real Backend

In `src/services/api.js`, change:

```js
const USE_MOCK = true   // change to false
```

The API expects these endpoints:

```
POST /api/auth/login
POST /api/auth/signup
POST /api/auth/anonymous
POST /api/auth/reset-password

GET  /api/labs
GET  /api/lab/:id
POST /api/lab/start       → { containerId, wsUrl, status }
POST /api/lab/reset
POST /api/lab/terminate
GET  /api/lab/hints?labId=

GET  /api/problems
GET  /api/problem/:id
POST /api/code/run
POST /api/code/run-custom

GET  /api/admin/containers
POST /api/admin/terminate
GET  /api/admin/users
```

---

## ⚠️ Terminal Architecture (Critical)

The browser **cannot** connect directly to a container shell.
You need this stack:

```
Browser (xterm.js)
    ↕  WebSocket  ws://backend/ws/terminal/:labId
Go / Node backend
    ↕  PTY (os.StartProcess / pty.Start)
Docker container shell
    exec /bin/bash inside container
```

### Required Go packages

```go
import (
    "github.com/creack/pty"        // PTY allocation
    "github.com/gorilla/websocket" // WebSocket server
)
```

### Message protocol

```json
// Client → Server (input)
{ "type": "input", "data": "ls -la\n" }

// Server → Client (output)
{ "type": "output", "data": "total 32\ndrwxr-xr-x..." }

// Client → Server (terminal resize)
{ "type": "resize", "cols": 120, "rows": 40 }
```

### Replace mock terminal in production

In `src/components/Terminal/Terminal.jsx`, the component accepts:
- `wsUrl` — WebSocket URL from the backend after `POST /api/lab/start`
- `isMock` — set to `false` when wsUrl is a real WebSocket

For production, swap the textarea-based mock with `@xterm/xterm`:

```bash
npm install @xterm/xterm @xterm/addon-fit
```

```jsx
import { Terminal as XTerm } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'
```

---

## Anonymous Sessions

- Auto-generated `anon_XXXX` username
- Session stored in `localStorage` with `expiresAt = now + 30min`
- Frontend checks expiry on load and clears stale sessions
- **Backend must also**: delete container + session after 30 minutes

---

## Build for Production

```bash
npm run build
# Output: dist/
```

Set the `vite.config.js` proxy to point to your Go backend.
