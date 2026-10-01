# MEMORY.md - FormAI Web App

Inter-session project memory. This file contains about 50 lines: summarize or remove content that no longer adds value.

## Current status (2026-10-01)
- `main` holds the project base: design tokens, 22 UI primitives, layout components (Sidebar, PageHeader, Table), API client, starter page with a counter.
- The base passes the frontend audit (layers, tokens, mobile-first, TSDoc, tests): 0 errors, 0 warnings.
- Vitest + Testing Library are set up; 13 tests pass.
- Feature work lives in remote branches not merged into `main`: `develop`, `feature/authentication`, `feature/client-management`, `feature/exercises`, `feature/routines`, `feature/workout-tracking`.

## Decisions (and why)
- React 19.3.0 and Tailwind 4.3.3 pinned exactly: versions required by the project owner.
- Static weight-400 Material Symbols font instead of the variable one: 572 KB vs 5.4 MB, and the design only uses weight 400.
- Default Tailwind palette reset in `tokens.css`: only design-system colors can be used.
- Arbitrary values allowed only inside `components/ui` and `components/layout`: a primitive owns its intrinsic dimensions; pages must use tokens.
- Layout components made mobile-first (stacked on small screens, columns from `md`): the app must work on narrow screens.
- TSDoc in English with a per-file `@author` taken from git: one documentation standard for the whole team.

## Lessons learned and mistakes to avoid
- When a token is added to `tokens.css`, register it in `src/utils/cn.ts`; otherwise `tailwind-merge` drops a class it thinks conflicts (text size vs text color).
- `tokens.css` is shared with the mobile repo: never edit it in one repo only.
- A pre-audit scan of the feature branches found components importing `services` directly, arbitrary values in pages and no breakpoints. They were not audited or fixed.

## Next steps
- Merging the feature branches will conflict with `main` in `components/ui`, `components/layout` and `services/api-client.ts` (comments were rewritten and layout classes changed).
- Audit the feature branches and align them: move service calls from components into hooks, add TSDoc and tests, make pages mobile-first.
- Add routing and the auth context on top of the base once the branches are aligned.
