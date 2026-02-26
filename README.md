# 15 Puzzle

A playable sliding-tile puzzle built with Node.js, TypeScript, Express, Prisma, and PostgreSQL.

## Prerequisites

- Node.js 18+
- Docker + Docker Compose

## Setup & Run

```bash
# 1. Install dependencies
npm install

# 2. Copy the environment file
cp .env.example .env

# 3. Start PostgreSQL via Docker
docker-compose up -d

# 4. Apply the database migration (enter "init" when prompted for a name)
npm run db:migrate

# 5. Start the development server
npm run dev
```

Open **http://localhost:3000** in your browser.

## Running Tests

```bash
npm test
```

## Scripts

| Command              | Description                                 |
|----------------------|---------------------------------------------|
| `npm run dev`        | Start dev server with hot reload            |
| `npm run build`      | Compile TypeScript → `dist/`               |
| `npm start`          | Run compiled server                         |
| `npm test`           | Run Jest test suite                         |
| `npm run db:migrate` | Apply Prisma migrations                     |
| `npm run db:studio`  | Open Prisma Studio (database browser)       |

## API

| Method | Endpoint                    | Body                    | Description                          |
|--------|-----------------------------|-------------------------|--------------------------------------|
| POST   | `/api/session`              | —                       | Create a new session + shuffled board|
| GET    | `/api/session/:id`          | —                       | Fetch current board & stats          |
| POST   | `/api/session/:id/move`     | `{ "tileIndex": 0-15 }` | Attempt a move                       |
| POST   | `/api/session/:id/reset`    | —                       | Reshuffle to a new solvable board    |
