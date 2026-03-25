# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Contains the Nzila platform — an Angolan AI assistant.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **AI**: OpenAI via Replit AI Integrations (gpt-5.2)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server (Nzila backend)
│   └── nzila/              # React + Vite frontend (main chat app)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   ├── db/                 # Drizzle ORM schema + DB connection
│   ├── integrations-openai-ai-server/  # OpenAI server integration
│   └── integrations-openai-ai-react/   # OpenAI React integration
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Nzila Platform

### Frontend (artifacts/nzila)
- React + Vite, served at `/`
- Pages: Chat, Gírias dictionary, Contribuir (contribute), Benchmark
- Angola flag color scheme: black (#1a1a1a), red (#D52B1E), gold (#FFCD00)
- Anonymous user ID stored in localStorage (`nzila_user_id`)
- State management: Zustand
- Charts: Recharts (benchmark page)

### Backend (artifacts/api-server)
All routes mounted under `/api`:
- `POST /api/chat` — Nzila chat (dataset-first, AI fallback)
- `GET /api/girias` — List all Angolan slang
- `GET /api/ranking/:userId` — User ranking info
- `POST /api/contributions` — Submit new contribution
- `GET /api/contributions` — List contributions
- `GET/POST /api/openai/conversations` — Conversation CRUD
- `GET/DELETE /api/openai/conversations/:id`
- `GET/POST /api/openai/conversations/:id/messages` — Streaming SSE chat

### Database Schema (lib/db/src/schema/)
- `users` — userId, level (Confiável/Nenhum/Moderado/Horrível), stats, isBlocked
- `girias` — term, definition, example, culturalContext, category
- `contributions` — userId, term, definition, example, status
- `conversations` — OpenAI conversation history
- `messages` — Message history per conversation

## Key Commands

- `pnpm --filter @workspace/api-server run dev` — Start backend
- `pnpm --filter @workspace/nzila run dev` — Start frontend
- `pnpm --filter @workspace/api-spec run codegen` — Regenerate API types
- `pnpm --filter @workspace/db run push` — Sync DB schema

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.
