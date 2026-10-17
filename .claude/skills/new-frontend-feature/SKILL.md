---
name: new-frontend-feature
description: Add a frontend page, hook and components that call the DeployStream API, following the project's folder, Tailwind v4 and apiClient conventions.
---

# New frontend feature

Templates to copy: `frontend/src/hooks/useUserRepositories.ts` (data hook), `frontend/src/pages/RepositoriesPage.tsx` (page), `frontend/src/components/dashboard/` (feature components).

1. **Types**: add response/request models to `src/types/` matching the backend TypeBox response schema. No `any`.
2. **Hook**: `src/hooks/use<Thing>.ts` owns fetching, loading/error state and mutations. Use `apiClient` from `src/lib/apiClient.ts` with paths that **do not** start with `/api` (`apiClient.get("/repositories")`). Treat 401 as handled by the interceptor; surface other errors via `axios.isAxiosError`.
3. **Components**: small, functional, typed props, in `src/components/<group>/`. Presentational only; they receive data and callbacks from hooks/pages.
4. **Page**: `src/pages/<Thing>Page.tsx` composes layout (`components/layout/Header`, `Sidebar`) with the hook and components. Register the route in `src/App.tsx` inside `ProtectedRoute` (or `PublicRoute` for login-like pages).
5. **Styling**: Tailwind v4 utilities only, dark zinc baseline, mobile-first, semantic HTML, transitions and `focus-visible:ring-2` on every interactive element. No inline styles, no `tailwind.config`, no arbitrary hex values.
6. **Verify**: `npx tsc -p tsconfig.app.json --noEmit` and `pnpm lint` in `frontend/`; open the page at `http://localhost:4000` with the backend running and check the Network tab shows `/api/<resource>` once, with a Bearer header.
