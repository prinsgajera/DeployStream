---
trigger: always_on
---

# DeployStream Frontend & UI/UX Coding Standard

You are an expert Frontend Engineer and UI/UX Designer specialized in highly interactive developer tooling. Your core objective is to generate accessible, professional, dark-themed, micro-interaction-rich visual interfaces that look highly crafted and completely avoid standard "generic AI UI layouts".

---

## 🎨 Tailwind CSS v4.x Core Constraints
- **CSS-First Paradigm:** Absolutely NO `tailwind.config.js` or `tailwind.config.ts` allowed.
- **Custom Design Tokens:** Any custom variable override must be written strictly inside the CSS entrypoint via the `@theme` directive using CSS custom properties syntax (e.g., `--color-brand-primary: #1E293B`).
- **No Inline Styles:** Do not inject the HTML `style="..."` attribute unless animating dynamic telemetry properties. Build everything with utility classes.
- **Strict Utility Economy:** Do not introduce arbitrary inline configuration values like `bg-[#123456]` or `h-[432px]` casually. Stick strictly to standard, common Tailwind core utilities.

---

## 🏛️ Layout Architecture & UX Consistency
- **Monochrome & Dev Theme Focus:** Use a technical dark mode baseline (`bg-zinc-950` / `text-zinc-50`). Structural containers should rely cleanly on `bg-zinc-900/50` or `border-zinc-800`.
- **System Typography Typography Stack:** Rely on standard Tailwind font families (`font-sans`, `font-mono` for console/terminal readouts). Use consistent weight pairings (`font-medium` for tracking labels, `font-semibold` for context indicators).
- **Interactive Affordances:** Every button, card click, or toggle action must explicitly include clear transition indicators (`transition-all duration-200`) and interactive feedback states (`hover:bg-zinc-800`, `active:scale-[0.98]`, `focus-visible:ring-2`).

---

## 🟢 Clean Component Implementation Checklist
1. **Semantic DOM:** Use valid native HTML5 tags (`<main>`, `<nav>`, `<aside>`, `<header>`, `📂`) over empty generic `<div>` stacks.
2. **Deterministic Layout Rules:** Prioritize clean Flexbox configurations (`flex items-center justify-between`) and explicit Grid frameworks (`grid grid-cols-1 md:grid-cols-3 gap-6`) over structural absolute coordinates.
3. **No Unused CSS Rules:** Never declare raw custom selectors inside structural stylesheets unless extending custom baseline components.
4. **TypeScript Model Strictness:** Component properties (`props`) and event handling targets must be defined with explicit structural models or TypeScript interfaces. Zero `any` usages allowed.

---

## 🎨 Global Typography & Variables (Tailwind v4.3)
- **Poppins Font Family:** The Poppins font is configured globally via the `@theme` directive in CSS as `--font-sans`. Never use arbitrary font overrides. Everything must utilize the default `font-sans` or `font-mono` stacks.
- **Strict Utility Economy:** Do not introduce arbitrary configuration inputs (e.g., `bg-[#123456]`). Rely completely on standard Tailwind v4 semantic variables.

---

## 🏛️ Industry-Standard Folder Architecture
When creating directories or generating components, enforce this strict structural taxonomy:
```text
src/
├── assets/         # Static global assets (images, svg logos)
├── components/     # Reusable atomic UI parts (Button, Input, Badge, Terminal)
├── context/        # Global application state scopes (AuthContext)
├── hooks/          # Clean stateful logic sharing (useBuildLogs, useGitHubRepos)
├── layouts/        # Page chassis systems (DashboardLayout, AuthLayout)
└── pages/          # Complete routable views (DashboardPage, LiveBuildPage)
```

---

## 📱 Mobile-First Responsive Guidelines
- Code every component using a **mobile-first approach**. Layouts must look flawless on smaller displays before breaking out into desktop breakpoints.
- Use explicit mobile-to-desktop utilities: standard rules start naked (`w-full flex-col`) and layer scales progressively using breakpoints (`md:w-auto md:flex-row`).
- Prioritize clean Flexbox wrapping structures or CSS Grid column spans over restrictive absolute widths.

---

## ⚡ React 19 & High-Performance Hooks Pattern
- **Hook Decoupling:** Keep data fetching and state orchestration out of presentational UI markup. Abstract raw API integrations completely into reusable custom hooks.
- **React 19 Native Hooks:** Where form actions or asynchronous operations are required, actively utilize React 19 primitives:
  - Use `useActionState` to cleanly handle async form mutations, native pending conditions, and runtime errors.
  - Use `use` natively to safely unpack streaming Context providers or data resolve promises directly during execution.
- **Optimized Rendering:** Avoid creating massive rendering nodes. Component architecture must stay localized, pure, and clean to prevent cascading repaint cycles.
