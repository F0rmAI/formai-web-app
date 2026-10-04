# MEMORY.md - FormAI Web App

Inter-session project memory. Keep this file concise (about 50 lines); remove stale details.

## Current status (2026-10-04)
- `feature/assign-client-combobox`: clients are picked from a searchable multi-select `ui/Combobox` and the assignment needs one training day per routine session (the API answers 422 otherwise).
- The trainer web MVP (TP) is integrated with `formai-api` and ready for its first web release, `v0.1.0`.
- Flows W1–W5 (access, clients, tracking, exercises, routines) ran in a browser against a local `formai-api` on 2026-10-02. Accounts `qa.trainer.*` and `qa.client.*` remain in the local database.
- Frontend audit: 0 errors. W6 recognition report and W7 machine catalog, including the Administrator role, belong to TB2.

## Decisions (and why)
- React 19.3.0 and Tailwind 4.3.3 are pinned exactly as required by the owner.
- `VITE_API_URL` includes `/api/v1`; service and refresh paths begin at the resource. `.env.production` targets `https://formai-api.quedena.studio/api/v1`; Vite embeds it at build time. Never put secrets in `VITE_*` values.
- The UI follows App → Pages → Components and Pages → Hooks → Services → API; `useAsyncData` / `useAsyncAction` centralize data state and errors.
- Services translate backend errors into Spanish `ServiceError` messages; raw English backend details are not shown to users.
- One service file per resource and a single `ServiceError` replaced the old mock adapter layers, which no longer run.
- Route guards and the route tree live in `src/navigation`; pages and hooks use `ROUTES`.
- The HTTP client refreshes on an initial `401` or `403` because the API returns `403` without a session. It shares one refresh request across restoration and protected calls; a retried `403` remains forbidden, while a retried `401` clears the user.
- Failed refresh blocks reuse of that cookie until a successful sign-in; refresh rotates its cookie and reusing an old token revokes account sessions.
- Clients are registered by name only because the client chooses an email and the backend creates the account during mobile activation. An invited client's email can be null, and a new code can be issued before activation.
- Training days are mandatory when assigning a routine: omitting them means every day in the API and breaks adherence calculations.
- Replacement is detected by the `routineId` of the client's current assignment; assigning a closed routine can reopen it. Failed assignments refetch because writes are not atomic.
- The password rule retains letters and numbers from US-001 although the API only checks 8–128 characters.
- `Dialog` keeps its shared mobile API, so its confirm button has no icon or spinner.
- Arbitrary CSS values live only in `components/ui` and `components/layout`; the static weight-400 Material Symbols font avoids the much larger variable font.

## Adaptations to the backend (differ from the mockup on purpose)
- Prescribed repetitions are one integer, not a range; `PrescribedExerciseResource.reps` is an `int`.
- “Sesiones por semana” controls the count of session cards; the editor also has session names and add/remove exercise controls.
- Version history lists the sessions and exercises in each version because the API stores no change summary.
- A workout row shows its finish time, not duration; the detail badge omits the routine name because the session resource does not provide it.
- The expired reset-link screen asks for the email again because the link carries only a token; the prototype's “Abrir enlace del correo” button was navigation only.
- `iam` does not return the trainer's name: after plain sign-in the UI falls back to the email prefix. Immediately after sign-up it has the supplied full name; the trainer's own versions show that name when available.
- The web shows “Aún sin correo” before mobile activation. Client rename maps 400 to a Spanish validation error and 403/404 to client not found.
- Exercise deletion is offered when the computed routine count is zero; the backend's 409 remains authoritative and advises archiving.

## Known limits and pitfalls
- `client-overviews` keeps showing the routine of a deactivated client (backend); the clients table uses that overview value.
- The password reset link flow needs SMTP configured in `formai-api` for an end-to-end test.
- An active client signing in on the web reaches the app gate; a disabled client gets invalid credentials before the gate.
- The backend sends errors as `application/problem+json`; an `application/json`-only check drops their details.
- There is no trainer endpoint for one workout session; read it from `GET /clients/{id}/workout-sessions`, which includes the exercises.
- A message in `location.state` can arrive after the first render; `useToast` reads it during render.
- Register new design tokens in `src/utils/cn.ts`. `tokens.css` must stay byte-identical to the mobile repo; do not edit it in only one repo.
- Exercise usage comes from routine list requests and can be unavailable; a displayed zero is not proof that deletion will succeed.

## Next steps
- Deploy the TP web app to its hosting service and bind `formai.quedena.studio`; the backend already accepts that CORS origin.
- TB2: build W6 and W7 when `formai-api` exposes the recognition report and machine catalog.
- Backend follow-ups: return trainer name on sign-in, correct `client-overviews` after deactivation, and expose routine clients and exercise usage counts directly.
