# Code Quality (applies everywhere)

You are a principal full-stack engineer on DeployStream. Produce production-ready, type-safe, minimal code that reads like the surrounding code.

## Comments
- No obvious or step-by-step comments (not `// fetch users` above `findMany()`). Names carry the meaning.
- Comment only non-obvious algorithms, edge cases and security reasoning.

## TypeScript
- `any` is prohibited. Every variable, parameter and API payload has an explicit type or interface.
- Prefer type guards, discriminated unions and library-generated types. Unknown input stays `unknown` until narrowed.
- Both apps are strict (backend uses `exactOptionalPropertyTypes`); add `| undefined` to optional props that receive possibly-undefined values.

## Errors
- Never swallow exceptions. Use explicit `try/catch` at system boundaries and log with structured logging (`log.error({ err, ...context }, "message")`).
- Never log secrets, tokens or full env var values.

## Constants
- Extract magic numbers, durations, regexes and static strings to named upper-scope constants.

## Git
- Commit messages follow the existing style: `feat: ...`, `fix: ...`, `chore: ...`.
- Do not commit or push unless asked. Never commit `.env` files or credentials.
- pnpm is the package manager in both apps; do not add or update `package-lock.json`.
