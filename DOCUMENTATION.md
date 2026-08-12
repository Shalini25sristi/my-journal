# My Journal — Technical Documentation

A cozy day-tracking journal app: habit trackers, daily highlights, vision boards, and analytics. Multi-user, each user's data fully isolated.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Frontend Stack](#frontend-stack)
- [Backend Stack](#backend-stack)
- [Database](#database)
- [API Reference](#api-reference)
- [Auth Flow](#auth-flow)
- [Deployment](#deployment)

---

## Architecture Overview

Classic client-server, no build step on either side:

```
Browser (static HTML/CSS/JS) ──HTTP/JSON──> Express API ──SQL──> PostgreSQL
```

The Express server does double duty: it serves the static frontend files **and** exposes the JSON API from the same process/port. No separate frontend server, no bundler, no framework.

---

## Frontend Stack

**Nothing but vanilla web tech** — no React/Vue/build tooling:

| Piece | What |
|---|---|
| Markup | 8 static HTML pages (one per screen — no client routing/SPA framework) |
| Styling | `styles.css` (layout/components) + `themes.css` (color themes, day/night mode) |
| Logic | `script.js` — one file, ~2,700 lines, all pages' logic |
| Fonts | Google Fonts (Nunito, Quicksand) loaded via `<link>` |

### Pages

| File | Route | Purpose |
|---|---|---|
| `index.html` | `/` | Home — grid of the user's tracker pages |
| `login.html` | `/login.html` | Sign in |
| `register.html` | `/register.html` | Sign up |
| `tracker.html` | `/tracker.html?type=<pageId>` | Year-grid habit tracker (click a day to cycle through rating options) |
| `daily-highlights.html` | `/daily-highlights.html` | Free-text journal entry per day, whole year at once |
| `vision-board.html` | `/vision-board.html` | Goal board scoped to a future period (month/quarter/year/5yr/10yr) |
| `analysis.html` | `/analysis.html` | Read-only stats: streaks, distributions, trends |
| `profile.html` | `/profile.html` | Edit account details, change password |

Every page shares the same `<head>` boilerplate (fonts, `styles.css`, `themes.css`, `favicon.svg`) and loads `script.js`, then calls one `init<PageName>Page()` function on `DOMContentLoaded`.

### `script.js` — key pieces

- **Auth helpers**: `getAuthHeaders()`, `handleAuthError()`, `requireAuth()` — every page (except login/register) checks for a JWT in `localStorage` on load and redirects to `login.html` if missing/expired.
- **Data layer**: `loadData()` / `saveData()` — fetch/POST wrappers around the tracker & highlights endpoints, with a `localStorage` fallback if the backend is unreachable (`saveData` catches network errors and logs "Backend not available, saved to localStorage only").
- **`isFutureDate(dateKey)`**: shared guard (added recently) — disables tracker/highlight entries for any date after today.
- **Per-page `init*Page()` functions**: `initHomePage`, `initTrackerPage`, `initHighlightsPage`, `initVisionBoardPage`, `initAnalysisPage`, `initProfilePage`, `initLoginPage`, `initRegisterPage` — each wires up DOM events and renders for its page.
- **Theming**: `initTheme()`, `setupThemeButtons()` — reads/writes a theme name + day/night mode to `localStorage`, applied via `data-theme`/`data-mode` attributes on `<body>` (styled in `themes.css`).

There's no shared "current page" abstraction — each page owns its DOM wiring independently; the only shared pieces are the auth/data-fetch helpers and theming.

---

## Backend Stack

| Piece | What |
|---|---|
| Runtime | Node.js (18+) |
| Framework | Express 4 |
| Auth | `jsonwebtoken` (JWT, 7-day expiry) + `bcryptjs` (password hashing, 10 salt rounds) |
| DB driver | `pg` (node-postgres), plain SQL — no ORM |
| Config | `dotenv` — `.env` file, see [`.env.example`](.env.example) |
| CORS | `cors` package, wide open (`app.use(cors())`) |

### Directory structure

```
server/
├── index.js              Express app entry point
├── config.js             reads PORT / DATABASE_URL / JWT_SECRET from env
├── db.js                 pg Pool setup, SSL toggle for production
├── middleware/
│   └── auth.js           JWT verification middleware
├── lib/
│   └── defaultPages.js   the 7 built-in tracker definitions (seeded on register)
├── migrations/
│   ├── run.js            migration runner (tracks applied files in a `migrations` table)
│   └── 001..010_*.sql    schema history, applied in order, idempotent
└── routes/
    ├── auth.js           register / login / me / profile / password
    ├── pages.js          CRUD for user-defined tracker pages + their options
    ├── trackers.js        get/save a year of tracker entries for one page
    ├── highlights.js      get/save a year of daily highlight text
    └── visionBoards.js    get-or-create board, items, title
```

`server/index.js` mounts each route file under its `/api/*` prefix, serves the static frontend from the repo root, and falls back to `index.html` for any unmatched GET (SPA-style catch-all, though the app isn't really an SPA).

### Migrations

Plain `.sql` files run in filename order by `server/migrations/run.js`. Each run is tracked in a `migrations` table (by filename) so re-running `npm run migrate` is a no-op for already-applied files — safe to run on every deploy/container start (this is exactly what `entrypoint.sh` does in Docker).

History, in order: init schema → user-defined pages → drop redundant FK → reset default options → generalize built-in pages → backfill empty pages → fix option values → vision boards → add username → add profile fields.

---

## Database

**PostgreSQL.** No ORM — raw parameterized SQL via `pg`.

### Entity relationship

```
users ──┬──< user_pages ──< page_options
        │         │
        │         └──< tracker_entries
        │
        ├──< daily_highlights
        │
        └──< vision_boards ──< vision_board_items
```

### Tables

**`users`**
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| username | VARCHAR(50) | UNIQUE, NOT NULL, lowercase, 3-50 chars |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| password_hash | VARCHAR(255) | bcrypt hash |
| gender, age, date_of_birth, profession, location, bio | various | optional profile fields |
| created_at, updated_at | TIMESTAMPTZ | |

**`user_pages`** — one row per tracker page a user has (built-in or custom)
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| user_id | INT FK → users, ON DELETE CASCADE | |
| page_id | VARCHAR(50) | slug, e.g. `mood`, or `my-habit-<userId>-<timestamp>` for custom pages |
| name | VARCHAR(100) | display name, e.g. "😊 Mood" |
| sort_order | INT | display order on the home grid |
| is_builtin | BOOLEAN | true for the 7 default pages seeded at registration |
| UNIQUE (user_id, page_id) | | |

Max 12 pages per user, enforced in [`server/routes/pages.js`](server/routes/pages.js).

**`page_options`** — the selectable ratings/tags for a page (e.g. Mood → Amazing/Good/Okay/Low/Bad)
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| page_id | INT FK → user_pages, ON DELETE CASCADE | |
| value | VARCHAR(50) | stored value, e.g. `amazing` |
| label | VARCHAR(100) | display label |
| bg, color | VARCHAR(7) | hex colors, validated `#RRGGBB` |
| sort_order | INT | |
| UNIQUE (page_id, value) | | |

Max 10 options per page.

**`tracker_entries`** — one row per page, per day marked
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| page_id | INT FK → user_pages, ON DELETE CASCADE | |
| entry_date | DATE | |
| value | VARCHAR(100) | the chosen option's `value` |
| UNIQUE (page_id, entry_date) | | one entry per page per day |

Indexed on `(user_id, tracker_type, entry_date)` originally; after migration 003 the lookup is via `page_id` (which already scopes to a user through `user_pages`).

**`daily_highlights`** — one row per user, per day with journal text
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| user_id | INT FK → users, ON DELETE CASCADE | |
| entry_date | DATE | |
| content | TEXT | free text |
| UNIQUE (user_id, entry_date) | | |

**`vision_boards`** — one board per user per timeframe+period
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| user_id | INT FK → users, ON DELETE CASCADE | |
| timeframe | VARCHAR(20) | `monthly` \| `quarterly` \| `halfyear` \| `yearly` \| `5year` \| `10year` |
| target_date | VARCHAR(20) | period key, e.g. `2026-07`, `2026-Q3`, `2026`, `2025-2029` |
| title | VARCHAR(200) | user-editable board title |
| UNIQUE (user_id, timeframe, target_date) | | boards are created lazily on first GET |

**`vision_board_items`** — text affirmations or images on a board
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| board_id | INT FK → vision_boards, ON DELETE CASCADE | |
| item_type | VARCHAR(10) | `text` \| `image` |
| content | TEXT | raw text, or a base64 data URI for images |
| sort_order | INT | |

Max 80 items per board. **Images are stored as base64 in the DB** — no filesystem/object storage, no CDN. Keeps deployment stateless (matters for Docker/ephemeral hosting) but means large images bloat the DB.

**`migrations`** (internal, not app data)
| Column | Type |
|---|---|
| id | SERIAL PK |
| filename | VARCHAR(255) UNIQUE |
| run_at | TIMESTAMPTZ |

---

## API Reference

All routes except `/api/auth/register`, `/api/auth/login`, and `/api/health` require `Authorization: Bearer <jwt>`.

### Auth — `/api/auth`
| Method | Path | Body | Notes |
|---|---|---|---|
| POST | `/register` | `username, email, password, confirmPassword` | Creates user + seeds the 7 default tracker pages in one transaction |
| POST | `/login` | `username, password` | Returns JWT (7-day expiry) |
| GET | `/me` | — | Current user's profile |
| PUT | `/profile` | `username, gender, age, dateOfBirth, profession, location, bio` | |
| PUT | `/password` | `currentPassword, newPassword, confirmPassword` | |

### Pages — `/api/pages`
| Method | Path | Notes |
|---|---|---|
| GET | `/` | All of the user's pages + their options |
| POST | `/` | Create a page (name only — options auto-guessed by keyword, see `getDefaultOptions()`) |
| PUT | `/:pageId` | Rename |
| DELETE | `/:pageId` | Deletes page + cascades its entries/options |
| GET | `/:pageId/options` | |
| PUT | `/:pageId/options` | Replace all options (full overwrite, not a patch) |

### Trackers — `/api/trackers`
| Method | Path | Notes |
|---|---|---|
| GET | `/:pageId/:year` | Returns `{ "YYYY-MM-DD": value, ... }` for the whole year |
| POST | `/:pageId/:year` | Full-year overwrite: deletes existing rows for that page+year, re-inserts the payload |

### Highlights — `/api/highlights`
| Method | Path | Notes |
|---|---|---|
| GET | `/:year` | Returns `{ "YYYY-MM-DD": "text", ... }` |
| POST | `/:year` | Same full-year-overwrite pattern as trackers |

### Vision Boards — `/api/vision-boards`
| Method | Path | Notes |
|---|---|---|
| GET | `/:timeframe/:targetDate` | Get-or-create — creates an empty board if none exists yet |
| PUT | `/:boardId` | Update title |
| POST | `/:boardId/items` | Add a text/image item |
| DELETE | `/items/:itemId` | Delete an item |
| GET | `/default/:timeframe` | Server computes "current period" key for a timeframe (e.g. current quarter) |

### Health
| Method | Path |
|---|---|
| GET | `/api/health` → `{ "status": "ok" }` |

---

## Auth Flow

1. Register/login → server returns a JWT signed with `JWT_SECRET`, containing `{ userId, username }`, 7-day expiry.
2. Frontend stores the token in `localStorage` (see `script.js` auth helpers).
3. Every subsequent API call sends `Authorization: Bearer <token>`.
4. `server/middleware/auth.js` verifies the token on every protected route, attaches `req.user`, or returns `401`.
5. Frontend's `handleAuthError()` catches `401`s and redirects to `login.html`.

No refresh tokens, no logout blacklist — logout is purely client-side (clears `localStorage`).

---

## Deployment

Dockerized — see [`Dockerfile`](Dockerfile), [`docker-compose.yml`](docker-compose.yml), [`entrypoint.sh`](entrypoint.sh), and [`README.md`](README.md) for full run/deploy instructions (local, Docker Compose, and DigitalOcean/GCP with Caddy for TLS).

In short: `entrypoint.sh` runs `server/migrations/run.js` (idempotent) then starts `server/index.js`; migrations and app share one container image.
