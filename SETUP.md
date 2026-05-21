# Webster Local Setup

This repo has two apps:

- `webster-backend`: NestJS API, auth, database, files, projects, templates, and API integration proxy.
- `webster-frontend`: React Router frontend with the photo editor, Fabric.js canvas, logo maker, and UI.

Use Node.js 22 LTS if possible. Node 23 may install with engine warnings from Jest and ESLint packages.

## 1. Install dependencies

Run from each app folder:

```bash
cd webster-backend
npm install

cd ../webster-frontend
npm install
```

## 2. Create local env files

Backend:

```bash
cd webster-backend
cp .env.example .env
```

Frontend:

```bash
cd webster-frontend
cp .env.example .env.local
```

Real env files are ignored by git. Commit only the `.env.example` templates.

## 3. Fill backend secrets

Required for normal local work:

- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`
- `SESSION_SECRET`
- SMTP values if you need registration email confirmation or password reset

Optional integrations:

- `UNSPLASH_ACCESS_KEY` for real image search
- `GOOGLE_FONTS_API_KEY` for real Google Fonts results
- Iconify and The Color API work with the default URLs and do not need keys
- Google OAuth values are only needed if testing Google login

## 4. Prepare PostgreSQL

Create a database matching `DB_NAME` from `webster-backend/.env`:

```bash
createdb -h localhost -p 5432 -U postgres webster_db
```

If local PostgreSQL version issues block the app, a temporary dev cluster can be used:

```bash
initdb -D /tmp/webster_pg14 -U postgres --auth=trust
pg_ctl -D /tmp/webster_pg14 -l /tmp/webster_pg14.log -o "-p 5432" start
createdb -h localhost -p 5432 -U postgres webster_db
```

Stop that temporary database when finished:

```bash
pg_ctl -D /tmp/webster_pg14 stop
```

## 5. Run the app

Terminal 1:

```bash
cd webster-backend
npm run start:dev
```

Terminal 2:

```bash
cd webster-frontend
npm run dev -- --host 0.0.0.0
```

Open:

```text
http://localhost:5173/
```

Backend health check:

```text
http://localhost:3000/api/health
```

Swagger docs:

```text
http://localhost:3000/api/docs
```

## Git safety

These should stay untracked:

- `webster-backend/.env`
- `webster-frontend/.env.local`
- `node_modules/`
- build output, logs, uploads, and local DB files

Before pushing, verify:

```bash
git status --short
git ls-files | grep -E '(^|/)\.env($|\.)'
```

The second command should only show tracked example files, if anything.
