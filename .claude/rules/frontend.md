---
paths:
  - "frontend/**"
---

# Frontend Standards (React 19 + Vite + Tailwind v4)

Build accessible, professional, dark-themed developer-tool UI with real micro-interactions. Avoid generic "AI template" layouts.

## Tailwind CSS v4
- CSS-first only. **No** `tailwind.config.js/ts`. Custom tokens go in the CSS entrypoint (`src/index.css`) inside `@theme` as CSS custom properties (e.g. `--color-brand: ...`).
- Poppins is configured as `--font-sans` and JetBrains Mono as `--font-mono` in `@theme`. Use only `font-sans` / `font-mono`; no arbitrary font overrides.
- No inline `style=""` unless animating dynamic telemetry values. No new CSS files and no raw custom selectors beyond extending base components.
- Stay on standard utilities. Avoid arbitrary values (`bg-[#123456]`, `h-[432px]`, `text-[11px]`) in new code; existing small arbitrary text sizes are legacy, do not copy them.

## Design language
- Dark baseline: `bg-zinc-950 text-zinc-50`, containers `bg-zinc-900/50` with `border-zinc-800`, accents cyan/emerald/amber/rose for state. `font-medium` for labels, `font-semibold` for context indicators.
- Every interactive element has transitions and states: `transition-all duration-200`, `hover:bg-zinc-800`, `active:scale-[0.98]`, `focus-visible:ring-2`.
- Semantic HTML (`<main>`, `<nav>`, `<aside>`, `<header>`, `<section>`, `<footer>`) over bare `<div>` stacks. Flexbox/grid layouts, no absolute coordinates for structure.
- Mobile-first: unprefixed utilities for small screens, layer `sm:`/`md:`/`lg:`. Fixed offsets such as the sidebar margin must collapse sensibly on small screens.

## Components, state and hooks
- Components are small, functional and typed with explicit prop interfaces. No `any`.
- Keep presentation separate from data/state: fetching and orchestration live in hooks (`src/hooks/`), global state in `src/context/`.
- React 19: use `useActionState` for form mutations and `use` for promise/context unwrapping where it fits. Use `useMemo`/`useCallback` only when structurally required.
- Network access goes through `src/lib/apiClient.ts` only (see `api-contract.md`).
- Do not write comments describing JSX sections (`{/* Card 1 */}`); extract a named component instead.

## Folder taxonomy (`src/`)
```
assets/       static images and svg logos
components/   reusable UI parts; grouped folders: dashboard/, layout/
context/      global state providers (AuthContext)
hooks/        stateful logic and data access (useUserRepositories, useGitHubRepos, ...)
layouts/      page chassis (DashboardLayout, AuthLayout) when a layout is shared by pages
lib/          framework-free helpers: apiClient.ts, tokenStorage.ts
pages/        routable views (DashboardPage, RepositoriesPage, ...)
types/        shared TypeScript models
```
