## Status
Next.js scaffolded. Prisma + Prisma Postgres connected. User and VaultEntry models created and pushed to DB. Starting Work Journal UI next.

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
1. Create journal route folder structure: app/journal/layout.tsx, page.tsx, [id]/page.tsx
2. Build Work Journal UI (sidebar + entry view from design)
3. Server actions for CRUD (create, read, update, delete entries)
4. Configure Auth.js with credentials provider
5. Set up Vitest + write tests for Work Journal

## Open Questions
- None currently
