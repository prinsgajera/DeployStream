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
- Theme-aware palette (see Theming below). Dark baseline: `bg-zinc-950 text-zinc-50`, containers `bg-zinc-900/50` with `border-zinc-800`, accents cyan/emerald/amber/rose for state. `font-medium` for labels, `font-semibold` for context indicators.
- Every interactive element has transitions and states: `transition-all duration-200`, `hover:bg-zinc-800`, `active:scale-[0.98]`, `focus-visible:ring-2`.
- Semantic HTML (`<main>`, `<nav>`, `<aside>`, `<header>`, `<section>`, `<footer>`) over bare `<div>` stacks. Flexbox/grid layouts, no absolute coordinates for structure.
- Mobile-first: unprefixed utilities for small screens, layer `sm:`/`md:`/`lg:`. Fixed offsets such as the sidebar margin must collapse sensibly on small screens.

## Theming (light / dark / system)
- Preference is `light | dark | system` (default `system`), stored in `localStorage` key `deploystream.theme`, managed by `ThemeProvider` (`context/ThemeContext.tsx`) and read with `useTheme()`. `lib/theme.ts` holds the helpers; the inline script in `index.html` sets the `dark`/`light` class on `<html>` before first paint (keep both in sync).
- Components are written against Tailwind's zinc/accent palette in its **dark** form. `html.light` in `src/index.css` re-points the `--color-zinc-*` and accent variables (cyan, emerald, rose, amber, sky, purple), so existing utilities flip automatically. Do not add per-component `dark:` variants for colors that the palette already covers.
- Never hard-code hex/rgb in components. Use palette utilities or the CSS variables in `index.css` (`--page-bg`, `--grid-dot`, `--glow-emerald`, ...). Add a variable plus a `html.light` override when a raw color is unavoidable.
- Primary / solid accent buttons (`bg-cyan-500`, `bg-emerald-500`) always pair with `text-on-accent` and get a `light:hover:bg-cyan-300` / `light:hover:bg-emerald-300` darker hover. `--color-on-accent` is dark in dark mode and **white in light mode**, where the accent 500 fill is deepened (cyan-700 / emerald-700) so white text keeps WCAG AA (5.3:1). Never `text-zinc-950` on an accent fill: that shade flips with the theme.
- A shade used both as text and as a solid fill (for example `bg-emerald-400`) may need an explicit split: `bg-emerald-500 dark:bg-emerald-400`. The `dark:` and `light:` variants are enabled (`@custom-variant` on `.dark` / `.light`); use `light:` for light-only tweaks so dark classes stay untouched.
- Tabs and segmented controls (Settings tabs, Deployments status filter, theme toggle) use `TAB_ACTIVE_CLASS` / `TAB_INACTIVE_CLASS` from `src/lib/tabStyles.ts`: a soft cyan-tinted pill, identical in light and dark and matching the sidebar active item. Do not hand-roll a gray `bg-zinc-800` active state.
- Light palette must keep WCAG AA (4.5:1 body text, 3:1 UI). Check with a contrast calculation when changing the `html.light` block.
- Any new page or modal must be checked in both themes.

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
