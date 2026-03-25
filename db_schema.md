# Technical Specification — Database Schema

We will use **Prisma Postgres** with the **pgvector** extension enabled for semantic search.

## Auth Tables (Managed by Auth.js)

### `users`
Core user profile. Auth.js manages this table; custom fields are added alongside.
- `id`: UUID (Primary Key)
- `email`: String (Unique)
- `emailVerified`: Timestamp (nullable)
- `name`: String
- `image`: String (nullable)
- `preferences`: JSONB (e.g., target roles, location, salary range)
- `created_at`: Timestamp

### `accounts`
Links authentication providers to users. One user can have multiple accounts (e.g., credentials + Google OAuth). Password hash lives here, not on the users table — because a password is one type of credential among many.
- `id`: UUID (Primary Key)
- `user_id`: UUID (FK to users)
- `type`: String (e.g., "credentials", "oauth")
- `provider`: String (e.g., "credentials", "github", "google")
- `providerAccountId`: String
- `access_token`: String (nullable, for OAuth providers)
- `refresh_token`: String (nullable, for OAuth providers)
- `token_type`: String (nullable)
- `expires_at`: Integer (nullable)
- `password_hash`: String (nullable, only for credentials provider)

### `sessions`
Optional — only needed if using database session strategy. We use JWT strategy, so this table is not required for v1 but Auth.js creates it by default.
- `id`: UUID (Primary Key)
- `user_id`: UUID (FK to users)
- `sessionToken`: String (Unique)
- `expires`: Timestamp

## Application Tables

### `vault_entries` (The Work Journal)
Raw entries from the user's daily logging.
- `id`: UUID (Primary Key)
- `user_id`: UUID (FK to users)
- `content`: Text (Markdown)
- `is_processed`: Boolean (True if AI has extracted bullets from it)
- `metadata`: JSONB (Tags, sentiment, or skills inferred)
- `created_at`: Timestamp

### `bullet_bank`
The source of truth for all resume points. Includes a vector embedding column for semantic search (RAG). When a bullet is saved, it is sent to an embedding model (OpenAI text-embedding-3-small) and the resulting 1536-dimension vector is stored alongside the text.
- `id`: UUID (Primary Key)
- `user_id`: UUID (FK to users)
- `source_entry_id`: UUID (FK to vault_entries, nullable)
- `content`: Text
- `embedding`: Vector(1536) (via pgvector — for semantic similarity search)
- `company`: String (e.g., "Stripe")
- `job_title`: String (e.g., "Senior Software Engineer")
- `status`: String (Enum: `PENDING`, `ACCEPTED`, `REJECTED`)
- `version`: Integer (For tracking edits)
- `created_at`: Timestamp

### `jobs`
Pipeline tracking for applications. Also serves as the job queue for the Railway background worker — the worker polls for rows with `status = 'APPLYING'` and processes them. Uses database transactions to prevent race conditions when multiple workers run in parallel.
- `id`: UUID (Primary Key)
- `user_id`: UUID (FK to users)
- `title`: String
- `company`: String
- `platform`: String (Enum: `GREENHOUSE`, `LEVER`, `ASHBY`, `WORKDAY`, `OTHER`)
- `url`: String
- `status`: String (Enum: `SAVED`, `APPLYING`, `IN_PROGRESS`, `ACTION_REQUIRED`, `APPLIED`, `INTERVIEWING`, `OFFER`, `REJECTED`)
- `external_id`: String (The ID on the ATS platform)
- `applied_at`: Timestamp
- `created_at`: Timestamp

### `application_questions` (HITL Logic)
Dynamic questions encountered during auto-application.
- `id`: UUID (Primary Key)
- `job_id`: UUID (FK to jobs)
- `question_text`: Text
- `answer_type`: String (Enum: `OBJECTIVE`, `SUBJECTIVE`)
- `options`: JSONB (For multi-choice/dropdowns)
- `suggested_answers`: JSONB (List of AI-generated responses)
- `final_answer`: Text
- `status`: String (Enum: `PENDING`, `APPROVED`)
- `created_at`: Timestamp

### `resume_templates`
Stores the user's preferred LaTeX resume template. The app injects relevant content from the Bullet Bank into the template's placeholders and returns the modified LaTeX. One template per user for v1, but structured as a separate table to support multiple templates later.
- `id`: UUID (Primary Key)
- `user_id`: UUID (FK to users)
- `name`: String (default: "Default")
- `latex_code`: Text (the template with placeholder markers)
- `is_default`: Boolean (default: true)
- `created_at`: Timestamp

### `cold_outreach_emails`
Stores generated cold outreach emails to recruiters for each job application.
- `id`: UUID (Primary Key)
- `user_id`: UUID (FK to users)
- `job_id`: UUID (FK to jobs)
- `recipient_name`: String
- `recipient_email`: String (nullable)
- `subject`: String
- `body`: Text
- `status`: String (Enum: `DRAFT`, `SENT`)
- `created_at`: Timestamp

### `interaction_logs`
Chronological log of what the agent has done.
- `id`: UUID (Primary Key)
- `job_id`: UUID (FK to jobs)
- `event`: String (e.g., "Navigated to Lever form", "Filled personal info", "Waiting for user input on Question X")
- `created_at`: Timestamp
