# Technical Specification — Auto-Applier Engine (HITL)

The agent uses **Playwright** on a dedicated **Railway worker** and a **Chrome Extension** on the frontend. The Next.js app on Vercel handles all UI and API routes. The worker and web app communicate exclusively through the database (no direct API calls).

## Architecture

```
Vercel (Next.js App)              Railway (Playwright Worker)
┌─────────────────────┐           ┌──────────────────────────┐
│ User clicks "Apply" │           │ Polls DB every ~10s for  │
│ → saves job to DB   │──(DB)──→  │ jobs WHERE status =      │
│   status: APPLYING  │           │ 'APPLYING'               │
│                     │           │                          │
│ Shows notification  │  ←(DB)── │ Runs Playwright, fills   │
│ when status changes │           │ forms, updates status    │
│ to ACTION_REQUIRED  │           │                          │
└─────────────────────┘           └──────────────────────────┘
```

**Why this split?** Vercel serverless functions timeout after 60 seconds. Playwright sessions can take several minutes, and the HITL pause for user approval can take hours. The Railway worker runs as a persistent process with no timeout constraints.

**Job queue:** The `jobs` table doubles as the queue. The worker polls for `status = 'APPLYING'`, grabs a job using a database transaction (to prevent race conditions if multiple workers run), and updates the status as it progresses.

```sql
-- Atomic job pickup (prevents two workers grabbing the same job)
BEGIN TRANSACTION;
  UPDATE jobs SET status = 'IN_PROGRESS'
  WHERE status = 'APPLYING' LIMIT 1
  RETURNING *;
COMMIT;
```

## 1. The Background Agent (Greenhouse, Lever, Ashby)

### Flow:
1. **Job Pickup:** Railway worker polls DB, picks up a job with `status = 'APPLYING'`, atomically sets it to `IN_PROGRESS`.
2. **Standard Mapping:** Worker opens job URL via Playwright, fills common fields (Name, Email, Phone, LinkedIn, GitHub).
3. **Question Detection:** Worker scans the DOM for required fields. Any field not in the "Standard Map" is flagged as a **Dynamic Question**.
4. **Knowledge Retrieval (RAG via Semantic Search):**
   - Worker checks the `application_questions` table for identical question text previously answered by the user.
   - If no match, it embeds the question using OpenAI text-embedding-3-small, then queries the `bullet_bank` using **cosine similarity** (via pgvector) to find the most relevant achievements. This is semantic search — it matches meaning, not just keywords.
   ```sql
   SELECT *, (embedding <-> $1) AS distance
   FROM bullet_bank
   WHERE user_id = $2
   ORDER BY distance
   LIMIT 5;
   ```
5. **Drafting / Pausing:**
   - **Scenario A (Match Found):** It auto-fills and moves on.
   - **Scenario B (No Match - Objective):** It identifies the options (e.g., Yes/No, Dropdown) and **PAUSES**. It creates a record in `application_questions` with status `PENDING`. Updates `jobs.status` to `ACTION_REQUIRED`.
   - **Scenario C (No Match - Subjective):** It generates 3 draft variations using the retrieved bullets and **PAUSES**. It creates a record in `application_questions` with `suggested_answers`. Updates `jobs.status` to `ACTION_REQUIRED`.
6. **Notification:** The Vercel app detects the status change and shows the user a notification.

## 2. The User Approval UI (Screen 8)
1. **Review:** User clicks the notification and sees the "Human-in-the-Loop" modal on the Vercel app.
2. **Decision:**
   - For Objective: User selects the correct option.
   - For Subjective: User selects a draft, edits it, or writes from scratch.
3. **Persistence:** Once approved, the `final_answer` is saved, the question status becomes `APPROVED`, and `jobs.status` is set back to `APPLYING`.

## 3. Resume & Submit
1. **Pickup:** The Railway worker picks up the job again (status is back to `APPLYING`), re-instantiates the Playwright session.
2. **Submission:** Fills in the approved answers, completes the form, and clicks "Submit."
3. **Final Status:** Updates `jobs.status` to `APPLIED`.

## 4. The Extension Path (Workday / Specialized Portals)
- The server cannot reliably automate Workday due to constant account creation requirements.
- The agent generates the "Application Kit" (LaTeX resume, answers) and saves them to the `jobs` table.
- When the user opens the Career Vault Extension on a Workday site, the extension pulls the data for that specific Job ID and **injects** the text directly into the page.

### Extension Authentication
The extension authenticates via JWT tokens (not session cookies, since cookies are domain-scoped and the extension runs on third-party sites like workday.com).

**Auth Flow:**
1. User installs the Chrome Extension.
2. User clicks "Login" in the extension popup.
3. Extension opens a popup window to `yourapp.com/auth/extension-login`.
4. User logs in via Auth.js (credentials or OAuth).
5. App generates a JWT token and passes it back to the extension via the popup redirect.
6. Extension stores the token in `chrome.storage.local` (sandboxed to the extension).
7. All future API calls include the header: `Authorization: Bearer <token>`.
8. The Vercel API verifies the JWT signature on each request and extracts the user ID.

**Security considerations:**
- Access tokens expire after 1 hour. Refresh tokens (30 days) are used to obtain new access tokens.
- `chrome.storage.local` is sandboxed — other extensions and websites cannot access it.
- If a user logs out, the extension deletes the token locally. For immediate revocation, maintain a token revocation list in the database.
