# Local Setup

This project is a React/Vite frontend with a small mock API proxy server used for demo integrations.

## Prerequisites

- Node.js 20 or newer
- npm

## First Launch After Cloning

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create your local environment file:

   ```bash
   cp .env.example .env.local
   ```

3. Fill in `.env.local` with real API keys:

   ```env
   MOCK_API_PORT=8787
   VITE_API_BASE_URL=/api

   UNSPLASH_ACCESS_KEY=your_real_unsplash_access_key
   UNSPLASH_SECRET_KEY=your_real_unsplash_secret_key

   GOOGLE_FONTS_API_KEY=your_real_google_fonts_api_key

   COLOR_API_BASE_URL=https://www.thecolorapi.com
   ```

   The Color API does not require a key.

4. Start the frontend and mock API server together:

   ```bash
   npm run dev:full
   ```

5. Open the app:

   ```text
   http://localhost:5173/
   ```

## Available Commands

```bash
npm run dev
```

Starts only the Vite frontend.

```bash
npm run dev:api
```

Starts only the mock API proxy server on `MOCK_API_PORT`, defaulting to `8787`.

```bash
npm run dev:full
```

Starts both the mock API proxy and the frontend.

```bash
npm run build
```

Builds the production frontend into `dist/`.

## API Integrations

The browser calls `/api`. In development, Vite proxies those requests to the local mock API server.

Current demo endpoints:

- `GET /api/health`
- `GET /api/images/search?q=banner`
- `GET /api/fonts?limit=40`
- `GET /api/colors/palette?hex=454fda&mode=analogic&count=6`

The server reads API keys from `.env.local`, `.env`, or `.env.example`, with local files taking precedence. Real secrets must stay in `.env.local` or `.env`; do not commit them.

## Common Issues

If `npm run dev:full` fails with `EADDRINUSE` on port `8787`, another mock API server is already running.

Check the process:

```bash
lsof -i :8787
```

Stop that process or change `MOCK_API_PORT` in `.env.local`.

If dependencies are missing or the Vite command is not found, run:

```bash
npm install
```

