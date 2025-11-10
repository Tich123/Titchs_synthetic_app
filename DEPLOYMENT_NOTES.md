
# Deployment notes

- This repo now includes:
  - Local Express server (`server.js`) for running the app locally (supports full read/write persistence to `data/trades.json`).
  - Vercel-compatible serverless endpoints in `api/*.js` (e.g. `api/trades.js`) that mirror the local API.

- Important: Vercel serverless functions have **ephemeral** filesystem storage.
  - Writes to `data/trades.json` from within Vercel functions will **not** be persistent across invocations or deployments.
  - For reliable persistence in production, use a proper database (Postgres, MySQL), an object store, or Vercel KV.
  - I can help integrate SQLite (via a file-based DB) for local use and a managed DB for production.

- To run locally:
  ```
  npm install
  npm run dev
  # open http://localhost:3000
  ```

- To deploy to Vercel:
  1. Push to GitHub
  2. Import repo in Vercel
  3. Vercel will deploy serverless functions from the `/api` folder and serve static files from `/public`.
