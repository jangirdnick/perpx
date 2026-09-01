# PERPX — AI-Powered Research & Chat Platform

A full-stack AI chat platform designed for research, productivity, and collaboration. Users can create private or group spaces to discuss ideas with AI, perform web research, upload documents for RAG-based Q&A, and collaborate in real-time.

---

## Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                    Client (Next.js 16)                      │
│  ┌───────────┐  ┌──────────────┐  ┌─────────────────────┐  │
│  │ Redux     │  │ React Query  │  │ Socket.io Client    │  │
│  │ Toolkit   │  │ (TanStack)   │  │ (Real-time Stream)  │  │
│  └─────┬─────┘  └──────┬───────┘  └──────────┬──────────┘  │
│        └───────────────┼──────────────────────┘             │
│                        │ HTTP/WebSocket                     │
└────────────────────────┼────────────────────────────────────┘
                         │
┌────────────────────────┼────────────────────────────────────┐
│              API Gateway (NestJS 11)                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│  │ Auth     │ │ Chat     │ │ Message  │ │ Upload (S3)  │  │
│  │ Module   │ │ Module   │ │ Module   │ │ Module       │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └──────┬───────┘  │
│       │            │            │               │          │
│  ┌────┴────────────┴────────────┴───────────────┴───────┐  │
│  │              Middleware Layer                         │  │
│  │  Auth Guard (JWT) │ Validation Pipe │ Redis Cache    │  │
│  └───────────────────────────────────────────────────────┘  │
│       │            │            │               │          │
│  ┌────┴────────────┴────────────┴───────────────┴───────┐  │
│  │              Service Layer                           │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │  │
│  │  │ Prisma   │  │ Redis    │  │ AI Orchestrator  │   │  │
│  │  │ ORM      │  │ Cache    │  │ (LangChain)      │   │  │
│  │  └────┬─────┘  └────┬─────┘  └────────┬─────────┘   │  │
│  └───────┼──────────────┼─────────────────┼─────────────┘  │
└──────────┼──────────────┼─────────────────┼────────────────┘
           │              │                 │
     ┌─────┴──────┐ ┌────┴────┐  ┌─────────┴──────────┐
     │ PostgreSQL │ │  Redis  │  │  External APIs      │
     │ (Neon)     │ │         │  │  ┌───────────────┐  │
     │            │ │         │  │  │ Google Gemini  │  │
     │            │ │         │  │  ├───────────────┤  │
     │            │ │         │  │  │ Mistral AI     │  │
     │            │ │         │  │  ├───────────────┤  │
     │            │ │         │  │  │ Tavily Search  │  │
     │            │ │         │  │  ├───────────────┤  │
     │            │ │         │  │  │ Pinecone       │  │
     │            │ │         │  │  └───────────────┘  │
     └────────────┘ └─────────┘  └──────────────────────┘
```

---

## Tech Stack

| Layer                | Technology                                             |
| -------------------- | ------------------------------------------------------ |
| **Frontend**         | Next.js 16.2 (App Router), React 19, TypeScript 5      |
| **Styling**          | Tailwind CSS v4, shadcn/ui (Radix), OKLCH color system |
| **State (Client)**   | Redux Toolkit + redux-persist                          |
| **Server State**     | TanStack React Query v5                                |
| **Backend**          | NestJS 11, TypeScript, Node.js 22                      |
| **Database**         | PostgreSQL (Neon), Prisma ORM 7                        |
| **Cache**            | Redis (ioredis)                                        |
| **Real-time**        | Socket.io (NestJS Gateway + Client SDK)                |
| **AI Models**        | Google Gemini 2.5 Flash, Mistral AI (LangChain)        |
| **Vector Store**     | Pinecone + Google Generative AI Embeddings             |
| **Web Search**       | Tavily Search API                                      |
| **File Storage**     | AWS S3 (presigned URLs)                                |
| **Email**            | Resend                                                 |
| **Package Manager**  | pnpm 10 (monorepo)                                     |
| **Containerization** | Docker (multi-stage), Docker Compose                   |
| **CI/CD**            | GitHub Actions (Tests, Docker Build, AWS SSM Deploy)   |
| **Code Quality**     | ESLint, Prettier, Husky, lint-staged                   |
| **Forms**            | react-hook-form + Zod v4                               |
| **Icons**            | HugeIcons                                              |

---

## Features

### Authentication

| Feature                                        | Status |
| ---------------------------------------------- | ------ |
| User registration with validation              | ✅     |
| Email verification (Resend)                    | ✅     |
| JWT login (access token 15m)                   | ✅     |
| Refresh token (7d, httpOnly cookie)            | ✅     |
| Token rotation (refresh invalidates previous)  | ✅     |
| Multi-device session support                   | ✅     |
| Single / all-device logout                     | ✅     |
| Bearer auth guard with Redis caching (15m TTL) | ✅     |
| WebSocket auth guard                           | ✅     |

### Chat & Messaging

| Feature                                          | Status |
| ------------------------------------------------ | ------ |
| Create / rename / delete chats                   | ✅     |
| Get user chat list                               | ✅     |
| Send human messages via WebSocket                | ✅     |
| Real-time AI streaming (token-by-token)          | ✅     |
| Message history with cursor pagination           | ✅     |
| Optimistic UI updates                            | ✅     |
| AI auto-title generation (Mistral)               | ✅     |
| Markdown rendering (react-markdown + remark-gfm) | ✅     |

### Space System (Collaboration)

| Feature                                        | Status |
| ---------------------------------------------- | ------ |
| Create PUBLIC, PRIVATE, or GROUP spaces        | ✅     |
| Role-Based Access Control (ADMIN, MEMBER)      | ✅     |
| Associate chats with specific spaces           | ✅     |
| Update space details (Name, Visibility)        | ✅     |
| Cascading deletes (Space -> Chats -> Messages) | ✅     |
| Infinite scroll for space chats                | ✅     |

### AI Integration

| Feature                                   | Status |
| ----------------------------------------- | ------ |
| Google Gemini 2.5 Flash                   | ✅     |
| Mistral AI (multi-model)                  | ✅     |
| Web search augmentation (Tavily)          | ✅     |
| PDF upload + RAG (Pinecone vector search) | ✅     |
| Streaming responses                       | ✅     |
| Multi-model provider switching            | ✅     |

### File & Storage

| Feature                      | Status |
| ---------------------------- | ------ |
| S3 presigned URL uploads     | ✅     |
| Image attachment support     | ✅     |
| Client-side file compression | ✅     |

### Frontend

| Feature                                       | Status |
| --------------------------------------------- | ------ |
| Responsive design (mobile-first)              | ✅     |
| Modular UI architecture (memoized components) | ✅     |
| Dark / Light theme (next-themes)              | ✅     |
| Redux state with persist                      | ✅     |
| React Query server state                      | ✅     |
| shadcn/ui component library                   | ✅     |
| Zod form validation                           | ✅     |
| Axios interceptors (auto token refresh)       | ✅     |
| Socket.io auto-reconnect                      | ✅     |

### DevOps

| Feature                          | Status |
| -------------------------------- | ------ |
| Docker multi-stage builds        | ✅     |
| Docker Compose orchestration     | ✅     |
| GitHub Actions CI (lint + build) | ✅     |
| GitHub Actions CD (Docker push)  | ✅     |
| AWS SSM remote deployment        | ✅     |
| Husky pre-commit hooks           | ✅     |

---

## API Endpoints

### Health

| Method | Endpoint      | Description  |
| ------ | ------------- | ------------ |
| GET    | `/api/health` | Health check |

### Auth

| Method | Endpoint                            | Auth   | Description               |
| ------ | ----------------------------------- | ------ | ------------------------- |
| POST   | `/api/auth/register`                | —      | Register new user         |
| POST   | `/api/auth/login`                   | —      | User login                |
| GET    | `/api/auth/me`                      | Bearer | Get current user          |
| POST   | `/api/auth/refresh`                 | Cookie | Refresh access token      |
| POST   | `/api/auth/logout`                  | Cookie | Logout current device     |
| POST   | `/api/auth/logout-all`              | Cookie | Logout all devices        |
| POST   | `/api/auth/send/verification-email` | —      | Resend verification email |
| POST   | `/api/auth/verify-email`            | —      | Verify email with token   |

### Chat

| Method | Endpoint                   | Auth   | Description        |
| ------ | -------------------------- | ------ | ------------------ |
| GET    | `/api/chat`                | Bearer | Get all user chats |
| GET    | `/api/chat/:chatId`        | Bearer | Get specific chat  |
| POST   | `/api/chat/rename/:chatId` | Bearer | Rename chat        |
| DELETE | `/api/chat/delete/:chatId` | Bearer | Delete chat        |

### Space

| Method | Endpoint              | Auth   | Description              |
| ------ | --------------------- | ------ | ------------------------ |
| GET    | `/api/space`          | Bearer | Get all user spaces      |
| GET    | `/api/space/:spaceId` | Bearer | Get specific space       |
| PATCH  | `/api/space/:spaceId` | Bearer | Update space details     |
| DELETE | `/api/space/:spaceId` | Bearer | Delete space and history |

### Message

| Method | Endpoint                      | Auth   | Description                |
| ------ | ----------------------------- | ------ | -------------------------- |
| GET    | `/api/message/:chatId`        | Bearer | Get chat messages          |
| DELETE | `/api/message/delete/:chatId` | Bearer | Delete messages for a chat |

### Upload

| Method | Endpoint                 | Auth   | Description                      |
| ------ | ------------------------ | ------ | -------------------------------- |
| POST   | `/api/upload/upload-url` | Bearer | Generate S3 presigned upload URL |

### WebSocket

| Namespace | Event (Client→Server) | Description                                      |
| --------- | --------------------- | ------------------------------------------------ |
| `/chat`   | `sendMessage`         | Send message + optional attachments / web search |
| `/chat`   | `joinChat`            | Join a specific chat room                        |

| Namespace | Event (Server→Client) | Description                      |
| --------- | --------------------- | -------------------------------- |
| `/chat`   | `humanMessage`        | Human message saved confirmation |
| `/chat`   | `streamMessage`       | AI response token stream         |
| `/chat`   | `streamEnd`           | AI streaming complete            |
| `/chat`   | `titleGenerated`      | Auto-generated chat title        |
| `/chat`   | `streamError`         | Streaming error                  |

---

## Database Schema (Prisma)

```prisma
enum UserRole         { USER ADMIN }
enum SubscriptionPlan { NORMAL PLUS MAX }
enum MessageRole      { HUMAN AI }
enum SpaceType        { PUBLIC PRIVATE GROUP }
enum SpaceMemberRole  { ADMIN MEMBER }

model User {
  id              String           @id @default(cuid())
  fullname        String
  username        String           @unique
  email           String           @unique
  emailVerified   Boolean          @default(false)
  password        String
  avatar          String?
  role            UserRole         @default(USER)
  subscription    SubscriptionPlan @default(NORMAL)
  refreshToken    RefreshToken[]
  chats           Chat[]
  messages        Message[]
  spaceMembers    SpaceMember[]
}

model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  deviceId  String?
  userAgent String?
  expiresAt DateTime
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Chat {
  id          String    @id @default(cuid())
  title       String
  description String?
  userId      String
  spaceId     String?
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  messages    Message[]
  space       Space?    @relation(fields: [spaceId], references: [id])
}

model Message {
  id      String       @id @default(cuid())
  message String
  role    MessageRole
  userId  String
  chatId  String
  user    User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  chat    Chat         @relation(fields: [chatId], references: [id], onDelete: Cascade)
  sources Source[]
}

model Source {
  id        String  @id @default(cuid())
  title     String
  url       String
  snippet   String
  messageId String
  message   Message @relation(fields: [messageId], references: [id], onDelete: Cascade)
}

model Space {
  id          String       @id @default(cuid())
  title       String
  description String
  type        SpaceType
  chats       Chat[]
  members     SpaceMember[]
}

model SpaceMember {
  id      String          @id @default(cuid())
  role    SpaceMemberRole
  spaceId String
  userId  String
  space   Space           @relation(fields: [spaceId], references: [id], onDelete: Cascade)
  user    User            @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([spaceId, userId])
}
```

---

## Real-Time Message Flow

```text
Client                    Server                        AI / Services
  │                         │                              │
  │── sendMessage ─────────>│                              │
  │   { chatId?,           │                              │
  │     message,           │                              │
  │     attachments?,      │                              │
  │     webSearch? }       │                              │
  │                         │── save human message ──────>│  Prisma
  │                         │<─ humanMessage ─────────────│
  │<─ humanMessage ────────│                              │
  │                         │                              │
  │                         │── query AI (Gemini/Mistral)─>│  LangChain
  │                         │                              │
  │                         │  [if webSearch]              │
  │                         │── search web (Tavily) ──────>│
  │                         │                              │
  │                         │  [if PDF uploaded]           │
  │                         │── search vectors (Pinecone)─>│
  │                         │                              │
  │                         │<── stream tokens ────────────│
  │<─ streamMessage(token) ─│                              │
  │<─ streamMessage(token) ─│                              │
  │<─ streamMessage(token) ─│                              │
  │                         │                              │
  │                         │── save AI message ──────────>│  Prisma
  │                         │                              │
  │                         │── generate title (Mistral) ─>│  [if new chat]
  │<─ titleGenerated ──────│                              │
  │<─ streamEnd ───────────│                              │
```

---

## Environment Variables

```env
# Application
NODE_ENV=development
PORT=3001
CLINT=http://localhost:3000

# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/perpx?sslmode=require

# Redis
REDIS_HOST=redis-xxx.cloud.redislabs.com
REDIS_PORT=19720
REDIS_PASSWORD=your-redis-password

# JWT
JWT_SECRET=your-jwt-secret

# Bcrypt
BCRYPT_ROUNDS=12

# Resend (Email)
RESEND_API_KEY=re_xxxxxxxx

# Google Gemini AI
GOOGLE_API_KEY=your-google-api-key

# Mistral AI
MISTRAL_API_KEY=your-mistral-api-key

# Pinecone (Vector Store)
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_INDEX_NAME=your-index-name

# AWS S3
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_BUCKET_NAME=perpx-uploads

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm 10+
- Docker & Docker Compose (optional)

### Local Setup

```bash
# Clone
git clone <repo-url>
cd perpx

# Install dependencies
pnpm install

# Generate Prisma client
cd apps/api
pnpm prisma generate
cd ../..

# Set up environment variables
cp .env .env.local   # Edit as needed

# Run database migrations
cd apps/api
pnpm prisma migrate dev
cd ../..

# Start development servers
pnpm dev            # Runs both API and Web concurrently
```

### Docker Setup

```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Services (Docker)

| Service       | URL                   |
| ------------- | --------------------- |
| Web (Next.js) | http://localhost:3000 |
| API (NestJS)  | http://localhost:3001 |

---

## Development Scripts

### Root

| Command        | Description                |
| -------------- | -------------------------- |
| `pnpm dev`     | Run API + Web concurrently |
| `pnpm dev:api` | Run API only               |
| `pnpm dev:web` | Run Web only               |

### API (`apps/api`)

| Command          | Description              |
| ---------------- | ------------------------ |
| `pnpm start:dev` | Development mode (watch) |
| `pnpm build`     | Production build         |
| `pnpm start`     | Start production         |
| `pnpm lint`      | Lint source files        |
| `pnpm test`      | Run tests                |
| `pnpm test:e2e`  | Run end-to-end tests     |
| `pnpm test:cov`  | Run tests with coverage  |

### Web (`apps/web`)

| Command      | Description       |
| ------------ | ----------------- |
| `pnpm dev`   | Development mode  |
| `pnpm build` | Production build  |
| `pnpm start` | Start production  |
| `pnpm lint`  | Lint source files |

---

## CI/CD Pipeline

Our GitHub Actions pipeline automatically tests, builds, and deploys code to AWS EC2:

1. **`tests.yml`**: Runs ESLint, Prettier, and Jest tests on PRs and pushes.
2. **`docker-build.yml`**: On successful CI in `main`, builds and pushes multi-stage Next.js/NestJS images to Docker Hub.
3. **`deploy-ec2.yml`**: Executes a remote AWS SSM (Systems Manager) command on the target EC2 instance. Features robust polling with SSM execution delays (`sleep 5`), graceful timeout handling, and verbose `stdout/stderr` output for Docker Compose failures.

---

## Security

- Passwords hashed with bcrypt (12 rounds)
- JWT access tokens (15m) + refresh tokens (7d) with rotation
- httpOnly cookies for refresh tokens
- Bearer auth guard with Redis-backed token validation cache
- Auth guard caches user data in Redis (15m TTL)
- Global `ValidationPipe` with `whitelist` + `forbidNonWhitelisted`
- WebSocket connections authenticated via JWT (`WsAuthGuard`)
- S3 presigned URLs for secure file upload (no direct exposure)
- Cascading deletes safely orchestrated inside Prisma `$transaction`s

---

## Package Architecture

```text
perpx (monorepo)           # Root workspace (pnpm-workspace.yaml)
├── apps/api               # NestJS 11 — REST + WebSocket server
│   ├── @perpx/shared      # (workspace dependency)
│   └── prisma             # Database schema & migrations
├── apps/web               # Next.js 16 — React frontend
│   ├── @perpx/shared      # (workspace dependency)
│   └── src/modules        # Feature-based modules (auth, chat, layout)
└── packages/shared        # Shared TypeScript types
    └── types/             # API, Auth, Chat, Message, User, S3 types
```
