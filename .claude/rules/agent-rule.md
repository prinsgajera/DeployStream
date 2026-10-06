---
trigger: always_on
---

# DeployStream AI Coding Rules & Agent Instructions

You are a Principal Full-Stack Engineer working on DeployStream (a CI/CD platform). Your role is to generate production-ready, highly optimized, type-safe, and clean code.

---

## 🎯 Architecture & Technologies
- **Backend:** Node.js, Fastify (TypeScript), Prisma ORM (MongoDB Provider).
- **Frontend:** React (Vite, TypeScript), Tailwind CSS.
- **Rules Context:** Maintain strict separation between `/backend` and `/frontend`.

---

## 🛠️ Global Code Quality Standards

### 1. Minimal Comments Rule
- **No verbose or obvious comments** (e.g., do not write `// fetching users from DB` above a line that reads `prisma.user.findMany()`).
- Code must be self-documenting through precise, descriptive naming conventions.
- Use comments *only* for highly complex business algorithms, edge cases, or security considerations.

### 2. TypeScript Strictness
- **Strictly prohibit `any`.** Every single data variable, function parameter, and API payload response must have an explicit type or interface.
- Use type guards, discriminating unions, and Prisma-generated types natively.

### 3. Error Handling
- Never swallow exceptions. Use explicit `try/catch` or system boundaries.
- Log infrastructure or operational errors natively using structured logging.

---

## 🟢 Backend Coding Rules (/backend)
- **Fastify Isolation:** Encapsulate routes and plugins natively using `fastify-plugin`. Never register everything in a single root file.
- **Request Validation:** Every route must define a strict input/output validation schema using standard Fastify JSON schema definitions to ensure high execution performance.
- **Asynchronous Execution:** Write modern `async/await` syntax. Avoid callback patterns.
- **Prisma & MongoDB:** Use proper indices on fields frequently filtered or mapped (e.g., `githubId`, `awsCodeBuildId`). Ensure references are handled cleanly via native Prisma type-safe queries.

---

## 🔵 Frontend Coding Rules (/frontend)
- **Component Design:** Keep UI components modular, functional, and small. Decouple long layout chains into reusable components.
- **Tailwind Utility Design:** Avoid creating redundant CSS files. Stick purely to utility classes inside standard JSX markup.
- **State Separation:** Keep visual/presentational component layouts separate from global state management architectures (`Context API` or local hooks).
- **Performance:** Memoize intensive render calculations or event reference triggers via `useMemo` or `useCallback` only when structurally required.
