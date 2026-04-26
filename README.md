
  # Photo Editor MVP Design

  This is a code bundle for Photo Editor MVP Design. The original project is available at https://www.figma.com/design/sxQvvcSt7VqryCkcetXkMA/Photo-Editor-MVP-Design.

  See `SETUP.md` for first-time clone, API key, and local launch instructions.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  Run `npm run dev:api` to start the demo API proxy server.

  Run `npm run dev:full` to start both the demo API proxy and Vite frontend.

  Copy `.env.example` to `.env` and fill in the real API keys before a hosted demo.
  The frontend calls `/api`; the Vite dev server proxies those calls to the mock API server.
  
