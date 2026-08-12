# My Journal

Cozy little space to track your days — trackers, daily highlights, vision boards, analysis. Node.js + Express + PostgreSQL backend, vanilla HTML/CSS/JS frontend.

**Live site:** https://journiva.app

## Features

- **Year-grid habit trackers** — click any day to cycle through your own rating options.
- **Daily highlights** — free-text journal entry for every day of the year.
- **Vision boards** — goal boards scoped to a future period (month, quarter, year, 5-year, 10-year).
- **Analysis page** — read-only stats: streaks, distributions, and trends.
- **User profiles** — edit account details and change your password.
- **Themes & dark mode** — switch color themes and toggle day/night mode.
- **Responsive layout** — works on desktop and smartphone screens.
- **Future-date lock** — trackers and daily highlights cannot be edited for days after today.
- **Branding** — notebook-emoji favicon and a "Created By Shalini Sristi" site footer on every page.

## Documentation

For the full technical write-up — architecture, frontend/backend stack, database schema (ERD), API reference, and auth flow — see [`DOCUMENTATION.md`](DOCUMENTATION.md).

## Mobile App

A React Native Expo mobile app is being developed on the [`mobile-app`](https://github.com/Shalini25sristi/my-journal/tree/mobile-app) branch. It reimplements the core journal experience for iOS/Android.

## Prerequisites

- Node.js 18+
- PostgreSQL running locally (or a reachable Postgres instance)

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a database:

   ```bash
   createdb myjournal
   ```

3. Copy the env template and fill in your values:

   ```bash
   cp .env.example .env
   ```

   `.env` needs:

   ```
   PORT=8000
   DATABASE_URL=postgresql://username:password@localhost:5432/myjournal
   JWT_SECRET=change-this-to-a-long-random-secret-string
   ```

4. Run migrations:

   ```bash
   npm run migrate
   ```

5. Start the server:

   ```bash
   npm start
   ```

   (or `npm run dev` for auto-restart on file changes)

6. Open [http://localhost:8000](http://localhost:8000) and register an account.

## Running with Docker (local development)

Bundles the app + Postgres in one `docker-compose.yml` for local development — no local Node/Postgres install needed. The production site at https://journiva.app uses the same Docker image behind Caddy on Google Cloud.

1. Copy the env template and set `POSTGRES_PASSWORD` and `JWT_SECRET`:

   ```bash
   cp .env.example .env
   ```

   (`DATABASE_URL` in `.env` is ignored by Docker — compose builds its own connection string pointing at the `db` container.)

2. Build and start:

   ```bash
   docker compose up -d --build
   ```

   This runs migrations automatically on container start, then serves the app on port 8000 (or whatever `PORT` you set).

3. Open [http://localhost:8000](http://localhost:8000).

Logs: `docker compose logs -f app`. Stop: `docker compose down` (add `-v` to also wipe the Postgres volume).

## Deploying to Google Cloud

The live deployment at https://journiva.app runs on Google Cloud (Compute Engine) using Docker Compose with Caddy as the TLS-terminating reverse proxy.

**Simplest: one Compute Engine VM running Docker Compose + Caddy**

1. Create a Google Compute Engine VM (e.g. `e2-medium`, Ubuntu LTS, allow HTTP/HTTPS traffic).
2. Install Docker and Docker Compose on the VM.
3. `git clone` this repo onto the VM.
4. `cp .env.example .env` and set real `JWT_SECRET` / `POSTGRES_PASSWORD` values.
5. `docker compose up -d --build` — this starts the app on port 8000 and runs migrations automatically.
6. Point your domain's DNS A record at the VM's external IP (e.g. `journiva.app` → `<VM_EXTERNAL_IP>`).
7. Install Caddy on the VM and create a `Caddyfile`:

   ```
   journiva.app {
       reverse_proxy localhost:8000
   }
   ```

8. Run `sudo caddy run --config /path/to/Caddyfile` (or set up Caddy as a systemd service). Caddy will automatically obtain and renew TLS certificates.

**Alternative: Google Cloud Run + Cloud SQL**

If you prefer a serverless/container-only deployment:

1. Create a Cloud SQL PostgreSQL instance and grab its connection string (it requires SSL — the app already handles this: `server/db.js` enables SSL when `NODE_ENV=production`).
2. Build the container from the repo `Dockerfile` and deploy to Cloud Run.
3. Skip the `db` service in `docker-compose.yml`; Cloud Run does not run docker-compose.
4. Set environment variables in the Cloud Run service: `DATABASE_URL` (from Cloud SQL), `JWT_SECRET`, `NODE_ENV=production`, `PORT=8000`.
5. Run migrations once after first deploy — either via Cloud Run's exec feature, or temporarily override the container command to `node server/migrations/run.js` and redeploy.
6. Map your custom domain (`journiva.app`) to the Cloud Run service in the Google Cloud Console; Google-managed TLS certificates are provided automatically.

## Notes

- Future dates are locked across trackers and daily highlights — you can't mark or write entries for days after today.
- Vision board and analysis pages are unaffected by the future-date lock (vision boards target future periods by design; analysis is read-only).
