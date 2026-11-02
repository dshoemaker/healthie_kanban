# Dimension Board

A frontend-only Kanban board built with React, TypeScript 7, Vite, dnd-kit and CSS Modules.

## Run locally

Use Node.js 26.13.0 (LTS), as pinned in `.nvmrc`, and npm.

```sh
nvm install
nvm use
npm ci
npm run dev
```

Open the URL printed by Vite. Assignees come from the public Rick and Morty GraphQL API; no credentials are needed.

## Checks

```sh
npm test
npm run typecheck
npm run lint
npm run build
```

`npm run test:watch` watches unit/component tests. Tests use controlled HTTP responses rather than the live public service.

For real-browser drag-and-drop tests:

```sh
npx playwright install chromium
npm run test:e2e
```

If Google Chrome is already installed, it can be used instead:

```sh
PLAYWRIGHT_CHANNEL=chrome npm run test:e2e
```

Browser tests start their own Vite server on port 4173; leave that port free. Failed runs retain Playwright traces under `test-results/`.

## Behavior and limits

- Press **Add task** to open the creation modal. Cancel, Escape, or clicking the backdrop dismisses it and discards the draft. Valid submission closes it and restores focus to the button.
- Create tasks with a required title and assignee, an optional description, and nonnegative whole-number points (default 0). New tasks start in To Do.
- Drag using the card handle, or focus it and use Space, arrow keys, and Space again.
- Cards show the assigned person's API avatar and points. If the image is unavailable, the name remains visible.
- Drop on a card to change its position, or on a column background to append it.
- Task state lives in memory and clears on refresh.
- Only the first page of assignees is loaded.
- A 429 shows a rate-limit message. There are no automatic retries, countdowns, or scheduled requests, including when `Retry-After` is present.
- Cards change position on drop. React owns their DOM placement to avoid cross-column conflicts with optimistic sorting.
- The required Done celebration is not implemented yet. Filtering and persistence remain potential interview extensions.

