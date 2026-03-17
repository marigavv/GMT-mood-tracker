# CLAUDE.md — Mood Tracker Developer Context

This file primes Claude Code with the architecture, conventions, and continuation paths for the Mood Tracker with Sentiment Analysis project.

---

## What This App Does

A full-stack local web app for daily mood logging with automatic sentiment analysis. Users log a 1–5 mood rating and an optional text note each day. The app stores everything in a local JSON file and visualizes mood history via a calendar heatmap, trend charts, weekly summary, and word cloud.

No database. No API keys. No cloud. Runs entirely on localhost.

---

## How to Run

```bash
# Install all dependencies (first time only)
npm run setup

# Start both server and client
npm start
```

- Backend: `http://localhost:3001`
- Frontend: `http://localhost:3000`

The React dev server proxies `/api/*` requests to port 3001 (configured via `"proxy"` in `client/package.json`).

---

## Architecture Overview

```
Root package.json
  └── concurrently → runs server + client together

server/server.js          (Express, port 3001)
  └── routes/moods.js     (all API logic)
  └── data/moods.json     (sole data store — read/write on every request)

client/src/App.jsx        (top-level state: entries[], activeTab)
  ├── MoodForm.jsx        (log form → POST /api/moods)
  ├── MoodCalendar.jsx    (heatmap, reads entries prop)
  ├── MoodChart.jsx       (recharts, reads entries prop)
  ├── WeeklySummary.jsx   (fetches GET /api/moods/summary/weekly)
  └── WordCloud.jsx       (derives word frequencies from entries prop)
```

**Data flow:**
1. `App.jsx` fetches all entries on mount via `GET /api/moods`
2. Passes `entries` array as props to all components
3. When a new entry is submitted, `App.jsx` re-fetches the full list
4. `WeeklySummary` has its own `useEffect` that re-fetches its dedicated endpoint whenever `entries` changes

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/moods` | Returns all entries, sorted newest-first |
| `POST` | `/api/moods` | Create/replace entry. Body: `{ rating, note, date }`. Returns saved entry with sentiment. |
| `GET` | `/api/moods/summary/weekly` | Returns 7-day aggregate: avgMood, avgSentiment, topWords[], streak, entries[] |
| `DELETE` | `/api/moods/:id` | Delete an entry by UUID |

**Entry schema:**
```json
{
  "id": "uuid-v4",
  "date": "YYYY-MM-DD",
  "rating": 1-5,
  "note": "string",
  "sentiment": {
    "score": 2,
    "comparative": 0.33,
    "positive": ["focused"],
    "negative": []
  },
  "createdAt": "ISO-8601"
}
```

**Important:** `GET /api/moods/summary/weekly` must be defined **before** `DELETE /:id` in `routes/moods.js` to prevent Express from matching the string `"summary"` as an `:id` parameter.

---

## Key Conventions

### Frontend
- **State lives in `App.jsx`** — components receive `entries` as props and call `onMoodLogged()` to trigger a re-fetch. Do not add local entry state to child components.
- **No `Math.random()` in render paths** — `WordCloud.jsx` uses a deterministic pseudo-shuffle so the layout is stable between renders.
- **Tailwind dark-mode palette:**
  - Background: `bg-slate-900`
  - Cards: `bg-slate-800 border border-slate-700`
  - Primary accent: `indigo-400 / indigo-500 / indigo-600`
  - Muted text: `text-slate-400 / text-slate-500`
- **Mood colors** (used consistently across Calendar, Chart, Summary):
  ```
  1 → #ef4444 (red)   2 → #f97316 (orange)  3 → #eab308 (yellow)
  4 → #84cc16 (lime)  5 → #22c55e (green)
  ```
- **Mood emojis:** `{ 1:'😢', 2:'😕', 3:'😐', 4:'🙂', 5:'😄' }`

### Backend
- Sentiment is calculated **at write time** and stored. Never re-calculate on reads.
- One entry per date — `POST` replaces an existing entry for the same date.
- The `STOP_WORDS` set is defined in both `routes/moods.js` (for the weekly summary endpoint) and `WordCloud.jsx` (for the client-side word cloud). Keep them in sync if you update either.
- The data file path is `server/data/moods.json` relative to `server/server.js`.

---

## Where to Continue Development

### Easiest additions
- **Delete button in MoodForm** — wire up `DELETE /api/moods/:id` to a button on each recent entry row
- **Note character limit** — add a max-length validation (e.g. 500 chars) in the form and server
- **Mood emoji in browser tab title** — update `document.title` dynamically in `App.jsx`
- **Animated form submission** — add a CSS keyframe "bounce" to the emoji selector on select

### Medium complexity
- **Edit existing entry** — add an edit mode to `MoodForm` that pre-fills fields and sends a `PUT /api/moods/:id` (needs a new route)
- **Filter by date range** in calendar or chart — add `?from=&to=` query params to `GET /api/moods`
- **Monthly summary** — clone `WeeklySummary` logic with a 30-day window
- **Migrate CRA to Vite** — replace `react-scripts` with `vite` + `@vitejs/plugin-react` for faster dev server startup

### Larger features
- **Multiple emotion tags** (anxious, grateful, frustrated) in addition to numeric rating
- **Reminder system** — a cron job or browser notification (requires Service Worker) at a set time each day
- **SQLite backend** — replace `moods.json` with `better-sqlite3` for indexed queries and concurrent write safety
- **CSV/JSON export** of full history (not just weekly summary)
- **AI-generated weekly reflection** — send weekly entries to the Claude API for a narrative summary (see `claude-api` skill)

---

## Dependencies to Know

| Package | Version | Purpose |
|---|---|---|
| `sentiment` | ^5.0.2 | AFINN-based sentiment; `new Sentiment().analyze(text)` |
| `uuid` | ^9.0.0 | `v4()` for entry IDs |
| `concurrently` | ^8.2.2 | Runs server + client in one terminal |
| `recharts` | ^2.8.0 | `AreaChart`, `LineChart` in `MoodChart.jsx` |
| `axios` | ^1.6.0 | HTTP client in React components |
| `tailwindcss` | ^3.3.5 | Utility CSS, configured via `tailwind.config.js` + `postcss.config.js` |

**No** `react-wordcloud`, **no** `d3-cloud`, **no** `.env` files, **no** database packages.

---

## Common Gotchas

1. **Port already in use** — If `npm start` fails, check that nothing else is on port 3000 or 3001. On Windows: `netstat -ano | findstr :3001`

2. **Date handling** — All dates are stored as `YYYY-MM-DD` strings. When constructing `new Date(entry.date)`, append `T12:00:00` (e.g. `new Date(entry.date + 'T12:00:00')`) to avoid UTC midnight off-by-one errors on day-of-week labels.

3. **Tailwind not applying** — If styles aren't showing, confirm `postcss.config.js` exists in `client/` and `tailwind.config.js` has `content: ['./src/**/*.{js,jsx}']`.

4. **Weekly summary route order** — `GET /summary/weekly` **must** be registered before `DELETE /:id` in Express or the router will match `"summary"` as an ID.

5. **CRA 5.x audit warnings** — These are expected and not exploitable in a local app. Do not run `npm audit fix --force` as it will break `react-scripts`.
