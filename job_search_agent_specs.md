# Career & Job Search Agent — Product & Technical Spec

## 1. What We're Building

A complete, AI-powered **Career Vault** and **Job Application Engine**. Instead of just formatting a resume, this app acts as a lifelong career companion that logs user achievements, manages a "Bullet Bank", and dynamically generates tailored job applications on demand.

### Core Workflows:
1. **The Career Vault (Onboarding & Logging):**
   - User uploads their base resume to initialize the vault.
   - User maintains a continuous **Work Journal** (a frictionless brain-dump where they log daily/weekly wins, struggles, or projects in their own words).
   - The AI parses these journal entries and suggests new resume points.
2. **The Bullet Bank (Review & Manage):**
   - The user has a "Bullet Bank" organized by Job and Project.
   - AI-suggested bullets enter an "Inbox" where the user can accept, edit, or reject them.
   - Accepted bullets form a massive, master repository of the user's entire professional history (far larger than a 1-page resume limits).
3. **The Application Engine (Two-Pronged Strategy):**
   - **Autonomous Bots (Background):** Uses headless Playwright scripts to automatically apply to Greenhouse, Lever, and Ashby jobs where HTML structures are standardized. Uses RAG against the "Bullet Bank" to generate and submit the tailored 1-page resume and open-ended answers.
   - **Copilot Extension (Manual Review):** Complex/Fragile sites like Workday are pinned to a "Saved Jobs" Kanban board. The user opens the job when they have time, and a custom Chrome Extension overlay injects the generated answers directly into the Workday DOM.
   - For all jobs, it generates tailored **Cold Outreach Emails** to the recruitment team.
4. **Interview Prep Engine:**
   - Synthesizes the exact journal entries used for the application into "STAR" method flashcards so the user can review their *actual* experiences right before the interview.
5. **LinkedIn Content Engine:**
   User pastes the target LinkedIn post URL or text and selects the content type they need:
   - **Post Comment** *(max ~1,250 chars):* Pastes the original post content → agent generates a relevant, insightful comment that reflects the user's personality and expertise from their Career Vault.
   - **Connection Request Note** *(max 300 chars):* User provides context (e.g., "saw they posted about a PM role at Stripe") → agent generates a concise, warm, personalized note that fits the hard character limit.
   - **Direct Message / InMail Outreach** *(max ~1,900 chars for InMail):* User provides context (e.g., "recruiter at OpenAI, reaching out about ML role") → agent generates a short, punchy message grounded in the user's relevant experience from the Bullet Bank.
   All outputs are enforced to stay within LinkedIn's character limits before being shown to the user.

---

## 2. Tech Stack

| Layer | Tool |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Authentication** | Auth.js (NextAuth v5) — credentials + OAuth providers, JWT session strategy |
| **Database** | Prisma Postgres with pgvector extension (for semantic search on Bullet Bank) |
| **Embedding Model** | OpenAI text-embedding-3-small (generates 1536-dim vectors for RAG) |
| **AI Model** | Gemini 2.0 Flash (via Google AI SDK) |
| **Web Search / Research** | Gemini with Google Search Grounding |
| **Job Discovery** | SerpAPI (Google Jobs), Custom Scrapers / APIs (Ashby, Greenhouse, Lever) |
| **PDF Parsing** | Gemini native document understanding |
| **Streaming UI** | Vercel AI SDK (For parallel generation of Resume, Cover Letter, Emails) |
| **File Storage** | Vercel Blob (resume / attachment uploads) |
| **Background Worker** | Railway (long-running Playwright jobs, DB-based polling queue) |
| **Styling** | Tailwind CSS + shadcn/ui |

### Architecture Split
- **Vercel** — Hosts the Next.js app (UI, API routes, auth). Handles fast, short-lived requests.
- **Railway** — Hosts the Playwright background worker. Polls the database for jobs with `status = 'APPLYING'`, processes them, and updates status. Communicates with Vercel exclusively through the database (no direct API calls between them).

This split exists because Vercel serverless functions have a 60-second timeout, and Playwright job applications can take several minutes plus indefinite pauses for human approval.

---

## 3. Project Structure (Next.js App Router)

```text
app/
├── (auth)/
│   ├── login/
│   └── signup/
├── dashboard/
│   ├── vault/                # The Work Journal / Brain Dump interface
│   │   ├── new/              # Log a new experience
│   │   └── history/          # View past raw journal entries
│   ├── bullets/              # The Bullet Bank
│   │   ├── review/           # Inbox for AI-suggested bullets to accept/reject
│   │   └── manage/           # View accepted bullets by job/project
│   ├── jobs/                 # Application Engine
│   │   ├── search/           # Discovery via SerpAPI
│   │   ├── apply/            # Paste JD -> Generate Tailored App Kit
│   │   └── board/            # Kanban board of applied jobs (via DB)
│   └── interview-prep/       # Generated STAR flashcards for upcoming interviews
├── api/
│   ├── ai/
│   │   ├── extract-bullets/  # Parses journal -> suggests bullets
│   │   └── generate-kit/     # RAG: Searches Bullet Bank -> returns Application Kit
│   └── jobs/                 # Endpoints for SerpAPI search & Database fetching
└── page.tsx                  # Landing Page
```

---

## 4. Human-in-the-Loop Auto-Applier (The "Copilot" Flow)

When the agent applies to jobs in the background and encounters a **new application question** not currently in the user's base info:
1. **Interrupt & Notify:** The agent pauses the specific application and sends a notification to the user.
2. **Objective Questions (Yes/No, Multiple Choice):** 
   - The agent surfaces the exact dropdown/multiple-choice options. 
   - The user selects one. The database saves this preference to auto-answer future identical questions.
3. **Subjective Questions (Short Answer / Essays):** 
   - The agent synthesizes the Job Description, the user's Bullet Bank, and their personal tone.
   - It automatically generates 2-3 **draft answers**.
   - The user can select their favorite draft, edit it, or write from scratch.
   - The final approved answer is saved back into the database so the agent learns how to dynamically handle similar questions next time.
