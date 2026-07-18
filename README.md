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

## Notes

- Future dates are locked across trackers and daily highlights — you can't mark or write entries for days after today.
- Vision board and analysis pages are unaffected by the future-date lock (vision boards target future periods by design; analysis is read-only).
