# CLAUDE.md

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

## Project

Mini LMS V2 — a consultation portal (Next.js App Router) where students register, book consultations, and manage them from a dashboard. The codebase is an early-stage scaffold: many pieces referenced by imports (e.g. `src/constants/routes.ts`, most `src/app` routes) do not exist yet, and `src/app/globals.css` / `src/constants/metadata.ts` are present but not yet filled in. Expect to build these out rather than assuming a full app tree exists.

## Commands

- `npm run dev` — start Next.js dev server (Turbopack).
- `npm run build` / `npm start` — production build / start.
- `npm run lint` — ESLint (flat config, `eslint-config-next`).
- `npm run test:unit` — Vitest unit tests (run once, not watch, per its config).
- `npm run test:unit -- <path>` — run a single test file.
- `npm run test:coverage` — Vitest with V8 coverage.
- `npm run test:e2e` — opens Cypress interactively; requires `npm run dev` running first in a separate terminal, and `cypress.env.json` (copy from `cypress.env.json.example`) populated with a real Supabase test user's credentials.

Local Supabase (Postgres) is required for anything touching auth/data:

```bash
supabase start
supabase db reset   # applies migrations + seed data
supabase status      # get local Project URL / Publishable key for .env.local
```

`.env.local` needs `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. When running via `docker compose up`, the URL must be `http://host.docker.internal:54321` (not `127.0.0.1`) so the container can reach the host's Supabase instance.

## Architecture

- **Auth/session flow**: `src/proxy.ts` is the Next.js middleware entrypoint (matches all paths except static assets), delegating to `updateSession` in `src/lib/supabase/proxy.ts`. That function creates a Supabase SSR client per-request, calls `supabase.auth.getClaims()`, and redirects unauthenticated users to a sign-in route — never remove the `getClaims()` call or restructure this without preserving the exact cookie-passthrough pattern (`getAll`/`setAll` on both `request.cookies` and `supabaseResponse.cookies`), since deviating causes users to be silently logged out (see inline comments in that file).
- **Supabase clients**: three separate constructors, each for a distinct context — `src/lib/supabase/client.ts` (browser, `createBrowserClient`), `src/lib/supabase/server.ts` (Server Components/Actions, `createServerClient` + Next `cookies()`, plus `clearAuthCookies()` for logout), and `src/lib/supabase/proxy.ts` (middleware, its own `createServerClient` since middleware can't use `next/headers`). Don't reuse one across contexts.
- **shadcn/ui aliasing**: `components.json` remaps the usual shadcn aliases away from the default locations — components live under `@/lib/shadcn/components` (`ui` → `@/lib/shadcn/components/ui`), utils at `@/lib/shadcn/lib/utils`, hooks at `@/lib/shadcn/hooks`. Style is `new-york`, base color `neutral`, CSS variables enabled in `src/app/globals.css`. Use `npx shadcn add <component>` rather than hand-writing primitives so files land in the right place.
- **Constants over literals**: routes and metadata are centralized in `src/constants/` (`ROUTES`, `METADATA`) and imported via the `@/constants/...` alias rather than hardcoded strings/paths — follow this pattern when adding new routes or page metadata.
- **Path alias**: `@/*` → `./src/*` (defined in `tsconfig.json`, mirrored in `vitest.config.ts`'s resolve alias — keep both in sync if it changes).
- **Testing split**: Vitest unit tests live under `test/` (not colocated with source), configured via `vitest.config.ts` with a global setup file at `test/unit/setup.test.unit.ts`. Cypress e2e specs live under `cypress/` and run against a live dev server + real local Supabase user, not mocks.
- **Docker**: single-stage `Dockerfile` (`node:20-alpine`) runs `npm ci && npm run build` at image build time, so any missing/unbuildable source (unresolved imports, Tailwind errors, etc.) fails `docker compose up --build` at the build step, not at runtime.
