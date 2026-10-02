# MEMORY.md - FormAI Web App

Inter-session project memory. This file contains about 50 lines: summarize or remove content that no longer adds value.

## Current status (2026-10-02)
- `develop` holds the MVP (TB1) of the trainer web: flows W1 access, W2 clients, W3 tracking, W4 exercises and W5 routines, every frame of the Figma page `formai_web_mockup` up to 5.12. `main` (5 local commits, not pushed) and every feature branch are merged into it.
- Session handling (US-002) aligns with the backend: initial `403` renews and retries; missing stored user restores from the refresh cookie before guards decide. Validation caps the sign-up name at 120 characters.
- Frontend audit (`qs-react-frontend`): 0 errors, 0 warnings on 2026-10-01. On `feature/api-alignment`, P3/P5 API alignment is uncommitted; 223 tests pass and lint/typecheck are clean (2026-10-02).
- P2/P4 API alignment on `feature/api-alignment` (uncommitted): client registration sends only `fullName`; invited clients can have null email; detail supports rename; unused exercises can be deleted.
- P3/P5 API alignment: assignments send chosen weekdays, CLOSED routines can reopen, replacement uses the current assignment id, and failed assignments refetch because writes are not atomic. Client profiles show assignment days/history; progress uses `hasData`; workouts action is “Actualizar”.
- The five flows were run in a browser against a local `formai-api` on 2026-10-01 (accounts `qa.trainer.*@formai.test` were left in the local database).
- Not built: W6 recognition report and W7 machine catalog (TB2, admin role). The backend has no endpoints for them, except `PUT /exercises/{id}/machine-link`.

## Decisions (and why)
- React 19.3.0 and Tailwind 4.3.3 pinned exactly: versions required by the project owner.
- One file per resource in `services/` and a single `ServiceError`: the `contract/http/service` trio and `src/mocks` only existed to swap a mock adapter that no longer runs.
- Backend error details are never shown: they are English and written for developers. Each service defines the Spanish message.
- Auth and profile validation use backend status and `field`; password length is 8–128, sign-in lockout reads `lockedUntil`, and 500 responses are plain text.
- `useAsyncData` / `useAsyncAction` under every data hook: one place for cancellation, loading and error handling, and no `try/catch` in pages or components.
- Column widths, modal width, table actions and the filter bar live in `components/layout` and `components/ui`: pages and feature components carry no arbitrary values or loose measures.
- Route guards and the route tree live in `src/navigation`: a component must not read `context`.
- The HTTP client renews on initial `401` or `403` and shares one refresh request across restore and protected calls. A retried `403` stays forbidden; a retried `401` clears the user. Failed refresh blocks reuse of the same cookie until a successful sign-in.
- `Dialog` kept the API it shares with mobile (no icon or spinner on its confirm button), so mockups 2.9, 4.3 and 5.7 show the confirm label without icon.
- Arbitrary values allowed only inside `components/ui` and `components/layout`; static weight-400 Material Symbols font (572 KB vs 5.4 MB).

## Adaptations to the backend (differ from the mockup on purpose)
- Repetitions are a single number, not a range (`6–8`): `PrescribedExerciseResource.reps` is an `int`.
- "Sesiones por semana" is the number of sessions of the routine; changing it adds or removes session cards. The form also has a session name field and add/remove exercise controls the mockup does not draw.
- The version history shows sessions and exercises per version instead of a change summary: the API stores none.
- A workout row shows the time it finished, not its duration; the detail badge says "Rutina · versión N" without the routine name: the session resource has neither.
- 1.7 has no "Abrir enlace del correo" button (it only exists to navigate the prototype). After an expired link the trainer types the email again, because the link carries only a token.
- The signed-in name is the email prefix after a plain sign-in: `iam` does not return the name. A version author arrives as a user id; the trainer's own versions show the trainer name.
- Client email is chosen during mobile activation. The web shows “Aún sin correo” for null email; rename maps 400 to a Spanish validation error and 403/404 to client not found.
- Exercise deletion is offered when the computed routine count is zero. The backend remains authoritative: its 409 is shown as guidance to archive instead.

## Lessons learned and mistakes to avoid
- Spring Security answers `403` when the protected route has no valid JWT cookie. Only sign-in and refresh answer `401`; refresh rotates its cookie and reusing an old token revokes every account session.
- Errors arrive as `application/problem+json`; checking for `application/json` silently dropped every backend message.
- There is no trainer endpoint for one workout session: read it from `GET /clients/{id}/workout-sessions`, which already carries the exercises.
- `client-overviews.activeRoutineName` is stale after a same-day reassignment (backend). Routine clients are derived from `/clients/{id}/assignments`; the clients table still shows the overview value.
- A message carried in `location.state` can arrive after the first render (guard redirect, then navigate): `useToast` picks it up during render.
- When a token is added to `tokens.css`, register it in `src/utils/cn.ts`. `tokens.css` is shared with the mobile repo: never edit it in one repo only.
- Exercise usage is derived from routine list requests and can be unavailable; never treat the displayed zero as proof that deletion will succeed.

## Next steps
- TB2: W6 and W7, once `formai-api` exposes the machine catalog and the recognition report.
- Backend: return the trainer name on sign-in, keep `client-overviews` in sync on reassignment, expose the clients of a routine and the usage count of an exercise (both are derived here with extra requests).
- Push `main` (owner decision) so both remote branches match.
