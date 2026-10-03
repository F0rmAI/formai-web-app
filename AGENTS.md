# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex, Cursor and others) when working with code in this repository. `CLAUDE.md` only imports this file and `MEMORY.md`, so this is the single source to edit.

## Memory
- Start by reading `MEMORY.md` to understand the project's status and decisions made.
- Upon completing a task, update: current status, key decisions (and the reasoning behind them), and pitfalls to avoid.
- Keep it concise (max. ~50 lines): summarize or remove information that is no longer relevant.
- If something becomes a permanent rule, propose moving it to `AGENTS.md` instead of keeping it in the memory file.
- Never store sensitive data (keys, tokens, personal information).

## Project

FormAI web app: the React SPA used by **trainers** and the internal **admin** (clients, exercises, routines, supervision, machine catalog). The mobile app for clients lives in `formai-mobile-app` and the backend in `formai-api`; both apps reach the backend through `/api`.

## Commands

```bash
npm run dev          # Vite dev server, http://localhost:5173
npm run build        # tsc -b + production build to dist/
npm run typecheck    # tsc -b
npm run lint         # oxlint
npm test             # Vitest, single run
npm run test:watch   # Vitest, watch mode
npx vitest run src/hooks/useClients.test.ts        # one test file
npx vitest run -t "loads the clients"              # one test by name
```

`cp .env.example .env` and set `VITE_API_URL` before running against a backend.

## Architecture

Layered, one direction only:

```
App → Pages → Components
        │
        ▼
      Hooks → Services → Backend/API
```

- `src/pages/` compose components and get data and actions from hooks. A page never imports `services`.
- `src/components/` are presentational: data in through props, events out through callbacks. They never import `services`, data hooks or `context`. `ui/` holds the design-system primitives, `layout/` the navigation and structure, `<feature>/` the components of one feature.
- `src/hooks/` own state and use cases and are the only bridge to `services`.
- `src/services/` is the only layer that talks to the backend, always through `apiClient` (`services/api-client.ts`). No `fetch` anywhere else.
- `src/context/` is for state shared by several pages only; `src/utils/` and `src/types/` depend on nothing above them.
- `src/navigation/` holds the route table (`ROUTES`), the guards and the route tree; pages and hooks navigate with `ROUTES`, never with hand-written paths.
- Read hooks are built on `useAsyncData` and write hooks on `useAsyncAction`; pages and components carry no network `try/catch`. Services throw `ServiceError` with a Spanish message: the backend detail is English and is never shown.
- Every layer folder has a `README.md` with its rules; read it before adding files to that layer.
- Imports use the `@/` alias for `src/`.

## Design system and styling

- Tailwind CSS v4, CSS-first. `src/tokens.css` holds the design tokens (colors, type scale, spacing, radius, shadows) generated from the Figma file `formai_design_system`. **It must stay byte-identical to `formai-mobile-app/src/tokens.css`**: change both together.
- The default Tailwind palette and type scale are reset, so only token utilities exist (`bg-primary`, `text-content-secondary`, `border-line-subtle`, `text-title`, `p-xl`, `shadow-card`).
- No hex colors or loose measures in pages or feature components. Arbitrary values are allowed only inside `components/ui` and `components/layout`, for the intrinsic dimensions of a primitive.
- **Mobile-first**: unprefixed classes target the smallest screen; widen with `md:` / `lg:`. Never use `max-*:` variants.
- `components/ui` exposes the same component API as the mobile app (same names, props and variants; `onClick` here, `onPress` there). Variant types live in `src/types/ui.ts`, shared with mobile. The default variant always uses the primary color.
- Class names are merged with `cn()` (`src/utils/cn.ts`), which registers the custom tokens in `tailwind-merge`. When a token is added to `tokens.css`, register it there too.
- Icons are Material Symbols Rounded ligatures through `<Icon name="…" />`; text always goes through `<Text variant="…">`.

## Documentation standard

- Comments and identifiers are in **English**; interface copy is in Spanish.
- TSDoc on everything exported. Every source file starts with a header comment carrying `@author` (the git user who created the file) and `@packageDocumentation`. Props are documented field by field in the props interface, with `@defaultValue` where there is a default.
- `@author` is a custom tag declared in `tsdoc.json`.

## Versions

React and React DOM are pinned to **19.3.0** and Tailwind CSS to **4.3.3**; routing uses `react-router-dom` 7. do not change them without the owner's approval. Check current documentation before using an API or adding a dependency.

## Commits

Conventional commits, one line, lowercase, in English, no body: `<type>(<scope>): <subject>`.
