# Career Vault

An AI-powered career companion that goes beyond resume formatting. Career Vault continuously logs your professional achievements, maintains a searchable "Bullet Bank" of your entire career history, and dynamically generates tailored job applications on demand.

## Vision

Most job seekers rebuild their resume from scratch for every application, forgetting past wins and struggling to tailor their experience to each role. Career Vault flips that model: you maintain a living record of your work — journal entries, project wins, lessons learned — and the AI does the heavy lifting of turning that raw material into targeted resumes, cover letters, cold outreach emails, and interview prep.

The long-term goal is a two-pronged application engine: autonomous bots that auto-apply to standardized job portals (Greenhouse, Lever, Ashby), and a Chrome Extension copilot that assists with complex portals like Workday — all powered by RAG over your personal Bullet Bank.

## Features

- **Work Journal** — Frictionless brain-dump interface for logging daily/weekly wins, struggles, and projects in your own words
- **Bullet Bank** — AI parses journal entries into resume-ready bullets, organized by job and project. An inbox lets you accept, edit, or reject suggestions
- **Application Engine** — Paste a job description, get a tailored resume, cover letter, and cold outreach emails generated via RAG against your Bullet Bank
- **Auto-Applier** — Background Playwright workers that apply to jobs autonomously, with human-in-the-loop approval for new question types
- **Chrome Extension Copilot** — For complex job portals: injects AI-generated answers directly into the page DOM
- **Interview Prep** — Synthesizes the exact experiences used in your application into STAR-method flashcards
- **LinkedIn Content Engine** — Generates post comments, connection request notes, and outreach messages grounded in your career history

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | Next.js (App Router) |
| Authentication | Auth.js (NextAuth v5) — JWT strategy |
| Database | Prisma Postgres with pgvector (semantic search on Bullet Bank) |
| Embedding Model | OpenAI text-embedding-3-small (1536-dim vectors for RAG) |
| AI Model | Gemini 2.0 Flash (via Google AI SDK) |
| Web Search | Gemini with Google Search Grounding |
| Job Discovery | SerpAPI, custom scrapers (Ashby, Greenhouse, Lever) |
| PDF Parsing | Gemini native document understanding |
| Streaming UI | Vercel AI SDK |
| File Storage | Vercel Blob |
| Background Worker | Railway (Playwright job queue) |
| Styling | Tailwind CSS + shadcn/ui |

## Architecture

The app is split across two hosts:

- **Vercel** hosts the Next.js app (UI, API routes, auth). Handles fast, short-lived requests.
- **Railway** hosts the Playwright background worker. Polls the database for pending applications and processes them. Communicates with Vercel exclusively through the database — no direct API calls between them.

This split exists because Vercel serverless functions have a 60-second timeout, and Playwright job applications can take several minutes plus indefinite pauses for human approval.

## Getting Started

### Prerequisites

- Node.js 18+
- A [Prisma Postgres](https://www.prisma.io/postgres) database

### Setup

```bash
git clone https://github.com/vivek4879/social-media-agent.git
cd social-media-agent
npm install
```

Create a `.env` file in the project root:

```
DATABASE_URL="your-prisma-postgres-connection-string"
```

Push the database schema and start the dev server:

```bash
npx prisma db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Status

This project is under active development. Here's what's built so far:

- [x] Next.js app scaffolded (TypeScript, Tailwind, App Router)
- [x] Prisma + Prisma Postgres with User and VaultEntry models
- [x] Dashboard route structure with shared layout
- [x] Work Journal route structure (master-detail sidebar layout)
- [ ] Work Journal UI components and data fetching
- [ ] Auth.js authentication
- [ ] Bullet Bank (AI extraction + inbox)
- [ ] Application Engine (RAG + generation)
- [ ] Auto-Applier (Playwright worker on Railway)
- [ ] Chrome Extension Copilot
- [ ] Interview Prep flashcards
- [ ] LinkedIn Content Engine

## License

This project is not currently licensed for reuse.
