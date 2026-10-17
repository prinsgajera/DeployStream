---
name: new-backend-module
description: Add a new backend feature module (routes, schema, service, model, registration under /api). Use when creating an endpoint group in DeployStream's Fastify backend.
---

# New backend module

Template to copy: `backend/src/modules/repositories/` (`repositories.routes.ts`, `.schema.ts`, `.service.ts`).

1. **Model** (if new data): `backend/src/models/<name>.model.ts` with an `I<Name>` interface, typed Mongoose `Model`, indexes on lookup/filter fields, and the `toJSON` transform that maps `_id` to `id`. Export it from `models/index.ts`.
2. **Schema**: `modules/<name>/<name>.schema.ts` with TypeBox/JSON Schema for params, query, body and **every** response status the route can send (including `401`, `404`, `500` with an `{ error, message }` shape).
3. **Service**: `modules/<name>/<name>.service.ts` with all DB, AWS and GitHub logic. Scope queries by `userId`, use `.select(...)`, throw errors carrying a `code` (e.g. `NOT_FOUND`) for the route to map.
4. **Routes**: `modules/<name>/<name>.routes.ts`, an `fp`-wrapped plugin. Paths are **unprefixed** (`/things`, never `/api/things`). Add `preHandler: [fastify.authenticate]`, typed generics for `Params`/`Querystring`/`Body`, and map expected errors to `400/404/409/422`; log unexpected ones with `fastify.log.error({ err })` and return `500`.
5. **Register** the plugin in `backend/src/routes/index.ts` (the `/api` prefix is applied there once).
6. **Constants/env**: extract magic values; add new env vars to `config/env.ts` **and** `backend/.env.example`.
7. **AWS**: if a new AWS API is used, add its action to `infra/iam-backend-policy.json`.
8. **Frontend**: add the matching hook and types (see `new-frontend-feature`), paths without `/api`.
9. **Verify**: `npx tsc --noEmit` in `backend/`; run `pnpm dev` and curl `/api/<path>` (401 without a token, 200 with `Authorization: Bearer`).
