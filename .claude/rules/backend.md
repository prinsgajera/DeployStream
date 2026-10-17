---
paths:
  - "backend/**"
---

# Backend Standards (Fastify + TypeScript + Mongoose)

## Structure
- Feature code lives in `src/modules/<feature>/` as `<feature>.routes.ts`, `<feature>.schema.ts`, `<feature>.service.ts`.
- Routes only parse requests and send responses. Business logic, AWS/GitHub calls and encryption go in `*.service.ts`, `src/services/` or `src/lib/`.
- Every route plugin and cross-cutting plugin is wrapped with `fastify-plugin` (`fp`) and registered from `src/routes/index.ts` (or `app.ts` for infrastructure plugins). Never put routes in the entrypoint.
- Static values (API prefix, cookie name, TTLs, poll intervals) are named constants; shared ones go in `src/config/constants.ts`. Env vars are read only through `src/config/env.ts` (zod).

## Validation
- Every route defines TypeBox/JSON Schema for params, query, body and responses (include error status codes, e.g. `401`, `404`, `500`, so replies serialize and type-check).
- Declare interfaces for `Params`, `Querystring` and `Body` generics. No `any`.

## Data (Mongoose, not Prisma)
- Models live in `src/models/*.model.ts` with an `I<Name>` interface and typed `Model`. Add indexes on fields used to filter or look up (`githubRepoId`, `subdomain`, `awsCodeBuildId`, `userId`, `repositoryId`, `status`).
- Always scope queries by owner (`userId`) when data is user-owned; return `404` for not-yours, never leak existence.
- Use `.select(...)` to avoid loading whole documents; never return `githubToken` or secret env var values. Respond with `doc.toJSON()` (the schema transform maps `_id` to `id`).
- Use atomic updates with a status guard (`findOneAndUpdate({ _id, status: { $nin: TERMINAL } }, ...)`) for state transitions so concurrent workers cannot double-apply them.

## Errors
- Catch expected failures by code (`err.code === "NOT_FOUND"`, Mongo duplicate key `11000`) and reply with the matching status: `400`, `401`, `403`, `404`, `409`, `422`. Unexpected errors: log with `fastify.log.error({ err })` and reply `500` with a generic message.
- Adding a global `setErrorHandler` is the preferred direction for new work; do not add empty catch blocks.

## Security
- GitHub OAuth tokens and secret env var values are encrypted with `lib/crypto.ts` (AES-256-GCM) before persisting and decrypted only at the moment of use.
- Webhooks: verify the HMAC with `timingSafeEqual` on the raw body (route uses `config: { rawBody: true }`) before any processing.
- Do not pass secrets to the browser. The auth JWT is returned only via the OAuth redirect fragment and an httpOnly cookie.

## Async and cloud calls
- Use `async/await`. Do not block the request loop: start CodeBuild via `setImmediate` after creating the build record, and finish status tracking in the poller (`services/build-poller.service.ts`).
- Stream or page large data (CloudWatch logs via `nextToken`); do not buffer whole logs in memory.
