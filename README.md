# My Journal

Cozy little space to track your days — trackers, daily highlights, vision boards, analysis. Node.js + Express + PostgreSQL backend, vanilla HTML/CSS/JS frontend.

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

## Running with Docker

Bundles the app + Postgres in one `docker-compose.yml` — no local Node/Postgres install needed.

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

## Deploying to DigitalOcean

**Simplest: one Droplet running Docker Compose**

1. Create a Droplet (Ubuntu, "Docker" marketplace image is easiest — comes with Docker + Compose preinstalled).
2. `git clone` this repo onto the droplet.
3. `cp .env.example .env` and set real `JWT_SECRET` / `POSTGRES_PASSWORD` values.
4. `docker compose up -d --build`.
5. Point a domain at the droplet's IP, put Caddy/Nginx (or DO's Load Balancer) in front for TLS on port 443 → 8000.

**Alternative: DigitalOcean App Platform + Managed Database**

1. Create a Managed PostgreSQL cluster in DO, grab its connection string (it requires SSL — the app already handles this: `server/db.js` enables SSL when `NODE_ENV=production`).
2. Create an App Platform app from this repo/Dockerfile — skip the `db` service in `docker-compose.yml` entirely (App Platform doesn't run docker-compose; it builds the `Dockerfile` directly as one component).
3. Set env vars in the App Platform dashboard: `DATABASE_URL` (from the managed DB), `JWT_SECRET`, `NODE_ENV=production`, `PORT=8000`.
4. Run migrations once after first deploy — either via App Platform's console/exec, or temporarily set the run command to `node server/migrations/run.js` and redeploy after.

## Notes

- Future dates are locked across trackers and daily highlights — you can't mark or write entries for days after today.
- Vision board and analysis pages are unaffected by the future-date lock (vision boards target future periods by design; analysis is read-only).
