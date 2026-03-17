# Product Requirements Document
# Mood Tracker with Sentiment Analysis

**Version:** 2.0
**Date:** 2026-03-17
**Status:** Implemented
**Phase:** 5 — PRD Artifact

---

## 1. Problem Statement

People struggle to maintain awareness of their emotional patterns over time. Without a structured habit of reflection, it is easy to miss recurring triggers, overlook gradual mood decline, or fail to recognize what positive streaks have in common. Existing journaling apps are either too complex, require cloud accounts and sign-up friction, or provide no analytical feedback on the language people actually use.

This app solves the problem by giving users a frictionless daily mood-logging habit backed by automatic sentiment analysis — so they can see not just *how* they rated their day, but *how they talked about it* across weeks. The experience is deliberately intimate and tactile: the interface looks and feels like a real handwritten journal, not a productivity dashboard. All data stays on the user's own machine with zero sign-up, zero API keys, and zero cloud dependency.

---

## 2. Target Users

| User Type | Description |
|---|---|
| **Primary** | Individuals aged 18–45 practicing self-improvement, journaling, or therapy homework who want a private, low-friction daily check-in |
| **Secondary** | Developers or students exploring full-stack patterns with embedded NLP and data visualization |
| **Tertiary** | Mental health practitioners who want a simple, self-hosted tool to recommend to clients for mood self-monitoring between sessions |

**Key user characteristics:**

- Wants quick daily check-ins — under 60 seconds from open to saved
- Values privacy above everything; no data should leave their machine
- Responds to warmth and personality in UI design, not clinical dashboards
- Interested in trends over time, not just individual snapshots
- May be on mobile or desktop; both must be fully functional

---

## 3. User Stories

### Core Stories

| ID | As a… | I want to… | So that… |
|---|---|---|---|
| US-01 | user | log my mood on a 1–5 scale with an emoji | I can quickly record how I feel each day |
| US-02 | user | write a short optional note about my day | I can add context to my numerical rating |
| US-03 | user | see a sentiment score auto-generated from my note | I understand the emotional tone of my language without analyzing it manually |
| US-04 | user | view a calendar heatmap of my mood history | I can see emotional patterns across 15 weeks at a glance |
| US-05 | user | read a weekly summary with average mood and top words | I can reflect on my week in one place |
| US-06 | user | see a trend chart of mood and sentiment over 30 days | I can identify whether things are improving or declining |
| US-07 | user | see a word cloud of my most-used words | I can notice recurring themes in my thinking |
| US-08 | user | log an entry for a past date | I can backfill if I missed a day |
| US-09 | user | have my data persist between sessions | I do not lose my history when I close the app |
| US-10 | user | arrive at an inviting landing screen before the journal | The app feels like opening a treasured notebook, not launching software |

### Bonus Stories

| ID | As a… | I want to… | So that… |
|---|---|---|---|
| US-11 | user | see a streak counter for consecutive days logged | I feel motivated to keep the daily habit alive |
| US-12 | user | export my weekly summary as a text file | I can share it with a therapist or archive it externally |
| US-13 | user | see today's existing entry before I submit | I know whether I have already logged today before accidentally overwriting it |
| US-14 | user | see today's date visually distinguished on the calendar | I can always locate where I am in the heatmap without counting |
| US-15 | user | hover over a daily entry in the summary to see the full note | I can read long notes that are truncated in the list view |

---

## 4. Feature List

### Core Features

| Feature | Description | Status |
|---|---|---|
| **Landing Page** | Full-screen homepage at `/` with animated hero title, SVG pen-draw underline, floating CSS notebook illustration, feature preview cards on a corkboard, live stats teaser, and CTA button navigating to `/journal` | ✅ Done |
| **Client-Side Routing** | React Router DOM v7; `/` → landing page, `/journal` → journal app; `← Home` link in journal header | ✅ Done |
| **Mood Entry Form** | 1–5 rating selector with emoji indicators, optional text note with character counter, date picker defaulting to today | ✅ Done |
| **Sentiment Analysis** | AFINN-based `comparative` score and positive/negative word lists auto-calculated on each POST and stored with the entry | ✅ Done |
| **Calendar Heatmap** | 15-week GitHub-style grid, color-coded by mood rating (1 = red → 5 = green), today's cell outlined as current-day indicator, hover tooltips showing date / rating / note / sentiment | ✅ Done |
| **Mood Trend Chart** | 30-day area chart of mood rating with average reference line, cream-paper custom tooltip | ✅ Done |
| **Sentiment Trend Chart** | 30-day line chart of sentiment comparative score, zero reference line, same warm styling | ✅ Done |
| **Weekly Summary** | Avg mood, entry count, avg sentiment, streak; daily breakdown table with truncated note preview and `title` hover for full text; top-word chips | ✅ Done |
| **Word Cloud** | Deterministic pseudo-shuffle layout (no `Math.random`), font size proportional to frequency, frequency table below cloud, 160+ stop words filtered | ✅ Done |
| **JSON Persistence** | All entries stored in `server/data/moods.json`; read/written on every request; no database required | ✅ Done |
| **Journal Aesthetic UI** | Custom CSS design system — aged cream paper, ruled lines, red margin, Caveat display font, Lora serif body, washi tape decorations, coffee stain accents, paper-curl cards, sticky notes, corkboard section | ✅ Done |
| **Mobile-Friendly Layout** | Responsive across breakpoints; calendar scrolls horizontally; feature cards stack vertically; CTA full-width on mobile; notebook illustration hidden below 600 px | ✅ Done |

### Bonus Features

| Feature | Description | Status |
|---|---|---|
| **Streak Counter** | Consecutive days with entries ending today; shown in form banner and weekly summary sticky note | ✅ Done |
| **Export Summary** | Downloads current week as a formatted `.txt` file with period, daily breakdown, and top-word list | ✅ Done |
| **Replace-on-same-date** | POST for an existing date replaces the old entry server-side; no duplicate records | ✅ Done |
| **Today's Entry Preview** | Existing today entry shown at top of log form before the submission fields | ✅ Done |
| **Today Indicator on Calendar** | Current date cell has a visible `outline` ring even when no entry has been logged yet | ✅ Done |
| **Sentiment Badges** | Color-coded positive / neutral / negative badges on recent entries in the log form | ✅ Done |
| **Entrance Animations** | `paperSlideIn` on journal page load; staggered `fadeSlideUp` on landing page sections and feature cards | ✅ Done |

---

## 5. Tech Stack & Architecture Decisions

### Stack

| Layer | Technology | Version | Rationale |
|---|---|---|---|
| **Frontend framework** | React | 18.2 | Industry-standard, mature ecosystem, concurrent features available |
| **Build tool** | Create React App | 5.0.1 | Zero-config setup; acceptable for a local-only app at this scale |
| **Routing** | React Router DOM | 7.x | Declarative client-side routing; enables landing page / journal page split |
| **Styling** | Custom CSS design system + Tailwind CSS | 3.3.5 | Tailwind utilities for layout; all aesthetic tokens defined in CSS custom properties rather than Tailwind dark-mode utilities |
| **HTTP client** | Axios | 1.6 | Cleaner API than `fetch`, consistent error handling, familiar DX |
| **Charts** | Recharts | 2.8 | React-native charting library; composable area and line charts |
| **Word cloud** | Custom implementation | — | Avoids `react-wordcloud` / D3 v7 peer-dependency conflicts; deterministic rendering without `Math.random` |
| **Backend** | Node.js + Express | 4.x | Minimal setup, no framework overhead, fast to iterate on |
| **Sentiment analysis** | `sentiment` npm package | 5.x | Fully offline, no API key, AFINN-165 word list, returns score + comparative + word arrays |
| **ID generation** | `uuid` | 9.x | RFC 4122 v4 UUIDs, collision-free entry identifiers |
| **Process runner** | `concurrently` | 8.x | Single `npm start` in the repo root runs server and client together |
| **Storage** | JSON flat file | — | Zero infrastructure, human-readable, trivially portable |

### Architecture Decisions

**1. Custom design system over Tailwind dark mode**
The app intentionally uses a warm journal aesthetic rather than the conventional dark-mode SaaS look. All color, typography, and surface tokens are defined as CSS custom properties (`--j-cream`, `--j-brown`, `--j-font-display`, etc.) and applied through semantic CSS classes (`.j-page`, `.j-card`, `.j-sticky`). Tailwind is retained only for layout utilities (`flex`, `grid`, `px-4`, responsive prefixes). This separation keeps the aesthetic coherent and easy to update.

**2. Landing page / journal split via React Router**
`App.jsx` is a thin `BrowserRouter` wrapper. `/` renders `LandingPage.jsx`; `/journal` renders `JournalApp.jsx` (which contains all the original tab-based journal logic). This eliminates the need for a splash screen, a modal overlay, or a conditionally rendered component tree — the landing page is simply its own route.

**3. Monorepo with separate server / client directories**
The root `package.json` holds server dependencies and `concurrently` scripts. `client/` is a self-contained CRA app with its own `package.json`. This keeps concerns separated without needing a workspace tool (Turborepo, Nx, etc.) and allows `cd client && npm start` to work independently during frontend-only development.

**4. CRA proxy instead of CORS configuration**
`client/package.json` sets `"proxy": "http://localhost:3001"`. In development, all `/api/*` requests from the React dev server are proxied transparently, removing the need for environment variables or `CORS` headers on the Express server.

**5. Replace-on-same-date semantics**
One entry per calendar day is enforced server-side. If a POST arrives for a date that already has an entry, the old record is replaced. This reflects the product intent — mood is a daily snapshot — and prevents inflated averages or double-streak counting.

**6. Sentiment calculated server-side at write time**
Sentiment runs once during POST and its result is stored inside the entry object. Reads return the pre-computed value, keeping GET responses fast and ensuring the score is consistent even if the `sentiment` package is updated later.

**7. Weekly summary via dedicated API endpoint**
Rather than re-computing the 7-day aggregate from the `entries` prop on the frontend, a dedicated `GET /api/moods/summary/weekly` endpoint handles date windowing, stop-word filtering, streak calculation, and word frequency aggregation. Complex date math stays server-side; the component just renders the response.

**8. Route registration order in Express**
`GET /summary/weekly` is registered *before* `DELETE /:id` in `routes/moods.js`. Express matches routes in declaration order; registering `/:id` first would cause the string `"summary"` to be interpreted as an ID parameter, returning a 404 or wrong response.

**9. UTC-safe local date strings**
Calendar cells and entry lookups use a local-date formatter (`getFullYear / getMonth / getDate`) rather than `toISOString().split('T')[0]`. `toISOString()` returns UTC time; in UTC+ timezones a date set to local midnight converts to the previous UTC calendar day, causing a one-day mismatch between stored date strings and displayed cells.

---

## 6. Project Structure

```
mood-tracker/
├── package.json                    # Root: server deps + concurrently scripts
├── package-lock.json
├── PRD.md                          # This document
├── CLAUDE.md                       # Developer / AI priming context
│
├── server/
│   ├── server.js                   # Express app, port 3001
│   ├── routes/
│   │   └── moods.js                # GET /  POST /  GET /summary/weekly  DELETE /:id
│   └── data/
│       └── moods.json              # Sole persistent data store
│
└── client/                         # Create React App
    ├── package.json                # CRA deps, proxy: localhost:3001
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── public/
    │   └── index.html
    └── src/
        ├── index.js                # React 18 entry point
        ├── index.css               # Design tokens, CSS classes, animations
        ├── App.jsx                 # BrowserRouter shell — routes / and /journal
        └── components/
            ├── LandingPage.jsx     # Hero, feature cards, live stats, CTA
            ├── JournalApp.jsx      # Tab shell, header with ← Home, entries state
            ├── MoodForm.jsx        # Log form, emoji picker, streak banner, recent entries
            ├── MoodCalendar.jsx    # 15-week heatmap, today indicator, hover tooltip
            ├── MoodChart.jsx       # 30-day mood area chart + sentiment line chart
            ├── WeeklySummary.jsx   # Stats grid, daily breakdown, top words, export
            └── WordCloud.jsx       # Custom word cloud + frequency table
```

### Data Flow

```
App.jsx (BrowserRouter)
  └── Route "/"        → LandingPage.jsx
        ├── GET /api/moods           (total entry count for stats teaser)
        └── GET /api/moods/summary/weekly  (streak + avg mood for stats teaser)

  └── Route "/journal" → JournalApp.jsx
        └── fetchEntries() → GET /api/moods  (on mount + after every POST)
              ├── MoodForm.jsx        receives entries[], calls onMoodLogged()
              ├── MoodCalendar.jsx    receives entries[]
              ├── MoodChart.jsx       receives entries[]
              ├── WeeklySummary.jsx   fetches GET /api/moods/summary/weekly independently
              └── WordCloud.jsx       receives entries[]
```

---

## 7. Done Criteria Checklist

| Criterion | Implementation | Status |
|---|---|---|
| User can log mood with 1–5 rating and text note | `MoodForm.jsx` + `POST /api/moods` | ✅ |
| Sentiment score auto-calculated and stored on each entry | `sentiment` package in `routes/moods.js`, runs on every POST | ✅ |
| Calendar heatmap shows mood intensity by day, 15 weeks | `MoodCalendar.jsx` — color-coded grid, local-date strings | ✅ |
| Today's date is visually indicated on the calendar | `outline` ring applied when `ds === todayStr` | ✅ |
| Calendar date lookup matches backend date format | Local date formatter used (no UTC `toISOString` shift) | ✅ |
| Weekly summary shows avg mood, top words, sentiment, streak | `WeeklySummary.jsx` + `GET /api/moods/summary/weekly` | ✅ |
| Daily breakdown notes do not overflow card boundaries | Flex parent has `minWidth: 0`; note `<p>` has `overflow: hidden` + `text-overflow: ellipsis`; full text on `title` hover | ✅ |
| Word cloud renders without external library | Custom layout in `WordCloud.jsx`; deterministic, no `Math.random` | ✅ |
| Journal aesthetic throughout — paper, fonts, decorations | CSS design system with `--j-*` tokens, Caveat / Lora / Nunito fonts, washi tape, coffee stain, page curl | ✅ |
| Landing page introduces the app before the journal | `LandingPage.jsx` at route `/`; navigates to `/journal` on CTA click | ✅ |
| Landing page shows live stats from the API | Fetches `/api/moods` and `/api/moods/summary/weekly` on mount | ✅ |
| Routing between landing and journal | React Router DOM v7; `← Home` link in journal header | ✅ |
| All data persists in a local JSON file | `server/data/moods.json`, read/written on every request | ✅ |
| Runs locally with a single `npm start` | Root `package.json` uses `concurrently` | ✅ |
| No `.env` files or external API keys required | All processing is local; `sentiment` is fully offline | ✅ |
| Mobile-friendly layout | Responsive flex/grid, horizontal scroll on calendar, CTA full-width at 480 px | ✅ |

---

## 8. Out of Scope

The following were explicitly excluded from v1.0 and v2.0:

- **User accounts / authentication** — single-user, local-only by design
- **Database** (PostgreSQL, SQLite, MongoDB) — JSON flat file is sufficient for personal use; no concurrent multi-user writes to protect against
- **Cloud deployment** — no hosting configuration, Docker image, or CI/CD pipeline
- **Data encryption** — entries are stored as plaintext JSON
- **Multi-user / shared access** — no multi-tenancy, no sharing URLs
- **Push notifications / reminders** — no scheduler, service worker, or OS notification integration
- **Image or voice attachments** — text notes only
- **Mood prediction or ML models** — basic AFINN sentiment only; no neural inference, no model files
- **Cross-device sync** — no WebSockets, no REST sync, no cloud storage
- **Entry editing** — existing entries can be replaced by re-submitting for the same date, but there is no dedicated edit mode with pre-filled fields
- **Undo / delete from UI** — the `DELETE /api/moods/:id` endpoint exists but no delete button is wired in the frontend
- **Internationalization (i18n)** — English only; date formatting uses the browser's `en` locale
- **Full accessibility audit** — ARIA roles and keyboard navigation are not comprehensively implemented
- **Automated tests** — no unit, integration, or end-to-end test suite

---

## 9. Known Constraints & Risks

| Risk / Constraint | Impact | Mitigation |
|---|---|---|
| **JSON file is not atomic** | Concurrent writes (unlikely for a single-user local app) could corrupt `moods.json` | Acceptable for v1/v2; `proper-lockfile` or SQLite migration would address this in v3 |
| **No input sanitization beyond React's auto-escaping** | Notes are rendered via JSX string interpolation; React escapes values automatically, but no server-side sanitization exists | No `dangerouslySetInnerHTML` is used anywhere; XSS risk is low in a local-only context |
| **`sentiment` package is AFINN-165 based** | Domain-specific language, slang, sarcasm, and emoji score poorly or are ignored | Acceptable for MVP; a transformer-based model (e.g., via Claude API weekly reflection) would improve accuracy in v3 |
| **CRA cold start latency** | `react-scripts start` takes 15–30 seconds on first boot | Expected behavior of CRA 5; a Vite migration (listed in CLAUDE.md) would reduce this to under 5 seconds |
| **No data backup mechanism** | `moods.json` is the only copy of all user data; accidental deletion or disk failure means permanent loss | The weekly export feature partially mitigates this; a scheduled backup or auto-export would be a v3 feature |
| **Port conflicts on startup** | If ports 3000 or 3001 are already bound, the relevant process fails silently or with a non-obvious error | Documented in CLAUDE.md; user must free ports or configure alternative ports manually |
| **Word cloud has no collision detection** | Words can visually overlap in the pseudo-random layout when many similar-frequency words are present | Acceptable for MVP; a real spiral-packing algorithm (e.g., d3-cloud) would solve this in v3 |
| **CRA peer-dependency audit warnings** | `react-scripts 5.0.1` reports known CVEs in transitive dependencies | Not exploitable in a local-only, single-user environment; `npm audit fix --force` would break `react-scripts` and is explicitly avoided |
| **React Router v7 breaking changes** | React Router DOM v7 introduces changes to loader / action APIs compared to v6 | This app uses only `BrowserRouter`, `Routes`, `Route`, `useNavigate`, and `Link` — the stable subset unchanged across v6 and v7 |
| **UTC date offset in non-UTC timezones** | `toISOString()` on a local-midnight Date in a UTC+ timezone returns the previous calendar day | Fixed: calendar uses a local-date formatter (`getFullYear/getMonth/getDate`) throughout; noted in CLAUDE.md as a known gotcha |
