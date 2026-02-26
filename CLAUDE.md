# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
npm install

# Development server (hot reload via ts-node-dev)
npm run dev

# Compile TypeScript
npm run build

# Run compiled server
npm start

# Tests (Jest + ts-jest)
npm test

# Run a single test file
npx jest tests/shuffle.test.ts

# Database
docker-compose up -d          # start Postgres
npm run db:migrate            # apply migrations (prompts for a name)
npm run db:studio             # open Prisma Studio
```

## Architecture

```
src/
  index.ts          Express app entry — mounts routes, serves public/, global error handler
  db.ts             Prisma client singleton (cached on globalThis for hot-reload safety)
  types.ts          Shared TypeScript types: Tiles, SessionResponse, MoveRequest, MoveResponse
  puzzle/
    shuffle.ts      countInversions, isSolvable (4×4 parity rule), generateSolvableBoard
    validate.ts     isAdjacent, isValidMove, isSolved, applyMove
  routes/
    session.ts      All /api/session routes (POST /, GET /:id, POST /:id/move, POST /:id/reset)
public/             Vanilla JS frontend served as static files
  index.html
  style.css
  app.js
prisma/
  schema.prisma     GameSession → GameState (1-to-1), GameSession → Move (1-to-many)
tests/
  shuffle.test.ts   Unit tests for solvability logic
  validate.test.ts  Unit tests for move validation
```

## Key Design Decisions

- **Tiles representation**: `number[16]` — index 0 = top-left, value `0` = blank tile, values 1–15 are tiles.
- **Solvability (4×4)**: A board is solvable when blank-row-from-bottom is even and inversions are odd, or blank-row-from-bottom is odd and inversions are even. An unsolvable shuffle is fixed by swapping the first two non-blank tiles (flips parity by 1 inversion).
- **Move atomicity**: `POST /:id/move` uses `prisma.$transaction([gameState.update, move.create])` so the board state and move log are always consistent.
- **TypeScript config**: `tsconfig.json` covers `src/` only (for production build). `tsconfig.test.json` extends it with `rootDir: "."` to also compile `tests/`.
- **Static files**: `public/` is at the project root; `express.static(path.join(__dirname, '..', 'public'))` resolves correctly both under `ts-node-dev` (`__dirname = src/`) and compiled (`__dirname = dist/`).
