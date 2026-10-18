# DeployStream

Small Netlify-like learning project: a developer signs in with GitHub, imports a repository, sets branch, build command, output directory and env vars, and DeployStream builds and hosts the static site on `<subdomain>.gajeraprins.shop`. With `autoDeploy` on, a GitHub push triggers a deployment. Everything must stay inside the AWS free tier.

## Flow
GitHub push -> `POST /api/webhooks/github` (HMAC-verified) -> `triggerBuild` -> AWS CodeBuild (clone with the owner's token, install, build, `s3 sync`) -> S3 `builds/<subdomain>/` -> CloudFront (wildcard domain + viewer-request function) -> site. A 10s poller (`services/build-poller.service.ts`) moves builds from BUILDING to a terminal status; logs stream from CloudWatch over WebSocket.

## Stack
- **Backend** (`backend/`): Node, Fastify 5, TypeScript (ESM), **Mongoose** on MongoDB, TypeBox route schemas, zod for env validation, AWS SDK v3 (CodeBuild, S3, CloudWatch Logs), `@fastify/jwt`, `@fastify/oauth2`, `@fastify/websocket`.
- **Frontend** (`frontend/`): React 19, Vite, TypeScript, Tailwind CSS v4 (CSS-first), react-router 7, axios, lucide-react.
- **Infra** (`infra/`): CloudFront function, IAM policies, and the console runbook (the buildspec lives in backend code). No IaC tooling; resources are created by hand in the console.

## Commands
Package manager is **pnpm** in both apps.

| Where | Command | Purpose |
|---|---|---|
| `backend/` | `pnpm dev` | API with `tsx watch` on port 3001 |
| `backend/` | `pnpm build` | `tsc` type-check and compile |
| `frontend/` | `pnpm dev` | Vite on port 4000 |
| `frontend/` | `pnpm build` / `pnpm lint` | type-check and bundle / eslint |

Type-check without emitting: `npx tsc --noEmit` (backend), `npx tsc -p tsconfig.app.json --noEmit` (frontend).

## Repo map
```
backend/src/
  config/     env.ts (zod, source of truth for env vars), constants.ts (API_PREFIX, cookie name, token TTL)
  lib/        crypto.ts (AES-256-GCM), db.ts, websocket.ts (build log stream)
  models/     Mongoose models: user, repository, build
  modules/    <feature>/{<feature>.routes,.schema,.service}.ts: auth, builds, health, repositories, webhooks
  plugins/    auth.plugin.ts (jwt + fastify.authenticate)
  routes/     index.ts mounts every module under API_PREFIX
  services/   AWS and GitHub clients: codebuild (+ codebuild.buildspec.ts), s3, cloudwatch, github, build-poller
frontend/src/
  components/ ui parts; dashboard/ and layout/ groups
  context/    AuthContext, ThemeContext (light/dark/system)
  hooks/      data fetching and mutations (useUserRepositories, useGitHubRepos, ...)
  lib/        apiClient.ts (the only axios instance), tokenStorage.ts, theme.ts (theme helpers), subdomain.ts, format.ts
  pages/      routable views
  types/      shared TS types
infra/        see infra/README.md
```

## Environment
- Real values live in gitignored `backend/.env` and `frontend/.env`. **Never print, paste, or commit secret values** (AWS keys, GitHub secret, JWT/encryption keys). Read variable names or masked values only.
- `backend/.env.example` and `frontend/.env.example` must mirror `config/env.ts` and `import.meta.env` usage; update them whenever a variable is added.
- MongoDB database name is case-sensitive in practice: use `DeployStream`.

## Rules index (`.claude/rules/`)
- `code-quality.md`: always on. Comments, strict TypeScript, error handling, git.
- `backend.md`: backend conventions (Fastify plugins, Mongoose, TypeBox, services).
- `frontend.md`: React, Tailwind v4, design and folder rules.
- `api-contract.md`: `/api` prefix, auth/Bearer flow, apiClient usage.
- `aws-infra.md`: regions, free-tier guardrails, IAM, credential handling.

Skills in `.claude/skills/` cover repeatable tasks: `new-backend-module`, `new-frontend-feature`.

## Known gaps
- 7 eslint errors remain: `react-hooks/set-state-in-effect` in `AuthContext`, `AuthCallbackPage`, `ImportRepositoryModal`, `useGitHubRepos`, `useUserRepositories`, and `react-refresh/only-export-components` in `AuthContext` (`useAuth` shares the file with the provider).
- Fastify `setErrorHandler` is not set up yet; routes map errors inline by `err.code`.
- Push-to-deploy needs `PUBLIC_API_URL` (a public tunnel such as ngrok in local dev; trailing slash is stripped). Verified end to end with a real push. Webhooks are only created at import, so repos imported earlier have none.
