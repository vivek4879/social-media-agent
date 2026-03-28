## Status
Route structure for Work Journal created under `app/dashboard/vault/`. Prisma client fixed for new driver adapter pattern. Ready to build journal UI components and wire up data fetching.

## Key Decisions
- pgvector in Prisma Postgres for semantic search (RAG on bullet_bank)
- Railway worker + DB-based job queue for Playwright (not Vercel serverless)
- Auth.js (NextAuth v5) with JWT strategy
- Chrome Extension auth via OAuth popup + JWT (not session cookies)
- resume_templates table (LaTeX, one per user for v1)
- cold_outreach_emails table added
- LinkedIn content NOT stored (generate, show, user copies — YAGNI)
- App Router (not Pages Router) — server components by default
- Vitest for testing (set up later, after first feature)
- CI/CD after tests are in place; Vercel gives CD for free
- SQL-first learning: write raw SQL before Prisma equivalent
- `prisma db push` for prototyping, `prisma migrate dev` for production
- Routes under `app/dashboard/` (not top-level) — shared dashboard layout for nav, auth guard across all features
- Prisma 6+ `prisma-client` generator with `@prisma/adapter-pg` (not `prisma-client-js`) — future-proof driver adapter pattern

## Session 3 Accomplishments (2026-03-25)
- Created `app/dashboard/layout.tsx` — shared dashboard shell
- Created `app/dashboard/vault/layout.tsx` — master-detail sidebar layout
- Created `app/dashboard/vault/page.tsx` — default "no entry selected" view
- Created `app/dashboard/vault/[id]/page.tsx` — dynamic entry page
- Fixed Prisma client: switched to `@prisma/adapter-pg` + `PrismaPg` (new generator requires explicit adapter, not auto-read DATABASE_URL)
- Added `pg` and `@prisma/adapter-pg` dependencies
- Build passes clean

## Session 2 Accomplishments (2026-03-24)
- Scaffolded Next.js app (TypeScript, Tailwind, App Router, ESLint)
- Set up Prisma with Prisma Postgres (new DB, separate from patient-portal)
- Created User + VaultEntry models, pushed schema to DB
- Created singleton Prisma client (app/lib/db.ts)
- Set up ~/.claude/ as a git repo → github.com/vivek4879/claude-config (private)
- Updated /learn skill: per-project learning files in ~/.claude/learning/

## Spec Docs
- job_search_agent_specs.md — product spec + tech stack
- db_schema.md — full database schema
- auto_applier_logic.md — Playwright HITL flow + extension auth

## Next Steps
1. Seed test data (or build "create entry" form first) — decision needed
2. Build sidebar component: fetch vault entries, render list, "New Entry" button
3. Build entry detail view: display content for selected entry
4. Server actions for CRUD (create, read, update, delete entries)
5. Configure Auth.js with credentials provider
6. Set up Vitest + write tests for Work Journal

## Open Questions
- None currently
