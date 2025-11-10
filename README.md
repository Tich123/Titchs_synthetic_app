
# OKComputer Synthetic Index Trading App - Vercel-ready

This package contains your original frontend (in `public/`) plus a simple Express backend (`server.js`)
that provides example API endpoints and serves the static frontend.

## Run locally

1. Install dependencies:
   ```
   npm install
   ```
2. Start the server:
   ```
   npm start
   ```
3. Open http://localhost:3000

## API endpoints (examples)

- GET /api/health
- GET /api/strategies
- GET /api/performance
- POST /api/submit-trade    (send JSON body)

## Deploy to Vercel from GitHub

1. Commit this repository to GitHub.
2. In Vercel, import the repo and deploy. Vercel will use `server.js` as a serverless function via `@vercel/node`.
3. The root route will serve your frontend; API endpoints will be available under `/api/...`.

Note: For production you should:
- Replace mock endpoints with real logic or database connections.
- Add environment variables via Vercel dashboard for secrets (API keys).
- Add validation, authentication, and rate limiting where required.
