# MEMORY.md - FormAI Web App

Inter-session project memory. Keep this file concise (about 50 lines); never store credentials.

## Current status (2026-10-08)
- Branch `feature/global-exercises-and-assignment-personalization`, based on develop aligned with main (0.2.0). Changes are local; no commit, push or deployment.
- Global + own exercise catalog, backend muscle groups, origin/group filters, assignment notes and per-client load/rest personalization are complete.
- 254 tests pass; typecheck, oxlint and production build pass. QS frontend audit: zero errors and warnings. Tokens remain byte-identical to mobile.
- Local browser E2E covers catalog duplicates/read-only globals, routine with global+own exercise, client registration, assignment, personalization and the Android-recorded set in the trainer's workout detail.
- Responsive profile/modal checks pass at 360, 768 and 1280 px. Load failures/retries and failed saves preserve existing data; no browser runtime errors.
- Requirements v0.5.0 and TP/TF diagrams live in the canonical OneDrive document folder. Evidence: `formai/validation/2026-10-08-global-exercises` outside repositories.

## Decisions
- Pages compose components and use hooks; only services call the shared apiClient. Components receive data/events and use tokens; no service/context imports.
- React 19.3.0 and Tailwind 4.3.3 stay pinned. Exported APIs use English TSDoc and author headers; UI copy is Spanish.
- Production's public API URL is in services/config.ts. Explicit VITE_API_URL wins; development defaults to localhost:8080/api/v1. No .env file is tracked; .env.production was removed from the index without committing.
- VITE_* values are public build-time values; never store secrets there.
- Catalog origin and routineCount come from the backend, not routine scans. Standard muscle groups load through useExercises with visible errors and retry.
- Global exercises show no mutation actions. Only own exercises are created/archived/restored/deleted; duplicate names against globals or own entries are rejected.
- TextField supports typed input/textarea props. Assignment notes are multiline and limited to 500 characters.
- usePersonalizeAssignment uses useAsyncAction plus a pending-promise guard so simultaneous submissions share one request and refetch once.
- Personalization accepts decimal comma for load, nonnegative integer rest and zero. Empty values remove overrides and restore routine defaults.
- A failed routine read preserves saved overrides, shows retry, and disables personalization until sessions load. Orphan overrides are filtered only after a successful version read.
- Combobox closes after an outside click completes, preventing its in-flow list collapse from swallowing the first click on a training day; Escape and Tab also close it.
- apiClient shares refresh after the first 401/403 and retries once. A retried 403 stays forbidden; failed refresh blocks cookie reuse until sign-in.
- Never reuse copied browser storage states after refresh rotation: a stale refresh token revokes every session of the account. Separate E2E contexts sign in afresh.
- Clients register with a name only; active status requires mobile activation. Assignments require one training day per routine session.
- Services translate backend ProblemDetail errors into Spanish messages. Route paths live in ROUTES.

## Adaptations and pitfalls
- Prescribed repetitions are one integer, not a range. Routine versions show snapshots because the API has no change summary.
- Plain sign-in does not return trainer name; the UI uses the email prefix. A previous trainer's routine can be inaccessible after transfer.
- There is no trainer endpoint for a single workout: read it from GET /clients/{id}/workout-sessions.
- Do not infer deletion permission from a zero routineCount: server 409 remains authoritative.
- Tokens must change in both frontends together; register new tokens in utils/cn.ts.
- Password recovery E2E with actual mail requires a configured Brevo sender; local validation intentionally disables mail.

## Next work
- TB2 administrator/machine catalog and recognition screens remain outside this increment.
- Existing backend follow-ups: trainer name on sign-in and deactivated client overviews.
