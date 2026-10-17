---
paths:
  - "backend/src/routes/**"
  - "backend/src/modules/**"
  - "backend/src/plugins/**"
  - "backend/src/lib/websocket.ts"
  - "frontend/src/lib/**"
  - "frontend/src/hooks/**"
  - "frontend/src/context/**"
---

# API Contract (backend <-> frontend)

## URL prefix
- Every backend endpoint is served under `API_PREFIX` (`/api`, from `backend/src/config/constants.ts`). The prefix is applied **once**, in `app.ts` via `register(apiRoutes, { prefix: API_PREFIX })`.
- Module route files use **unprefixed** paths (`/repositories`, `/builds/:buildId/status`, `/auth/me`, `/webhooks/github`, `/health`). Never write `/api/...` inside a module.
- New modules are registered in `backend/src/routes/index.ts`.
- Frontend `VITE_API_URL` already ends with `/api` (e.g. `http://localhost:3001/api`). Frontend request paths therefore start at the resource (`"/repositories"`), never `"/api/..."`. A doubled `/api/api` means one side added the prefix twice.

## Endpoints today
`GET /health`, `GET /auth/github`, `GET /auth/github/callback`, `GET /auth/me`, `POST /auth/logout`, `GET /github/repos`, `GET|POST /repositories` (`/import`), `DELETE /repositories/:id`, `PATCH /repositories/:id/auto-deploy`, `GET /builds`, `GET /builds/repo/:repositoryId`, `POST /builds/repo/:repositoryId/trigger`, `GET /builds/:buildId/{logs,status}`, `POST /builds/:buildId/cancel`, WebSocket `/builds/:buildId/stream`, `POST /webhooks/github` (all under `/api`).

## Authentication
1. Frontend navigates to `${VITE_API_URL}/auth/github` (`GITHUB_LOGIN_URL` in `AuthContext`).
2. GitHub redirects to `GITHUB_CALLBACK_URL` = `<backend>/api/auth/github/callback` (must match the GitHub OAuth app setting exactly).
3. Backend validates OAuth `state`, upserts the user, signs a JWT, sets the httpOnly `auth_token` cookie and redirects to `FRONTEND_URL/auth/callback#token=<jwt>` (fragment, so it never reaches server logs). Failures redirect to `/auth/callback?error=oauth_failed`.
4. `AuthCallbackPage` stores the token via `tokenStorage`, clears the fragment, and loads `/auth/me`.
5. Protected routes use `preHandler`/`onRequest: [fastify.authenticate]`, which accepts `Authorization: Bearer <jwt>` or the cookie. WebSockets rely on the cookie (browsers cannot set headers).

## Frontend API usage
- The only HTTP client is `frontend/src/lib/apiClient.ts` (axios, baseURL `VITE_API_URL`, request interceptor adds `Authorization: Bearer`, 401 interceptor clears the token and redirects to `/login`). Do not call `fetch`/`axios` directly or hard-code `http://localhost:3001`.
- Token storage goes through `lib/tokenStorage.ts` only. Never log tokens.
- Data access lives in hooks (`hooks/use*.ts`); pages and components consume hooks.
- Keep response types in `frontend/src/types/` aligned with the backend TypeBox response schemas.
