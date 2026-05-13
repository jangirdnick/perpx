# PERPX - AI Chat Platform

## Project Overview

PERPX ek AI chat application hai jo research aur chat ke liye design kiya gaya hai. Yahan aap private aur group/team spaces bana sakte hain jahan AI ke saath ideas discuss kar sakte hain aur apne thoughts ko research kar sakte hain.

---

## Tech Stack

| Layer            | Technology                                  |
| ---------------- | ------------------------------------------- |
| Frontend         | Next.js 15 (React), TypeScript, TailwindCSS |
| Backend          | NestJS, TypeScript                          |
| Database         | PostgreSQL (Neon), Prisma ORM               |
| Cache            | Redis                                       |
| Real-time        | Socket.io                                   |
| AI               | Google Gemini, Mistral AI (LangChain)       |
| Containerization | Docker & Docker Compose                     |
| Infrastructure   | AWS                                         |
| Package Manager  | pnpm (monorepo)                             |

---

## Folder Structure

```
perpx/
├── apps/
│   ├── api/                    # NestJS Backend
│   │   ├── src/
│   │   │   ├── auth/           # Authentication (JWT, refresh tokens)
│   │   │   ├── chat/           # Chat gateway & real-time
│   │   │   ├── message/        # Message handling
│   │   │   ├── user/           # User management
│   │   │   ├── email/          # Email service (Resend)
│   │   │   ├── redis/          # Redis caching
│   │   │   ├── prisma/         # Prisma ORM service
│   │   │   ├── api/            # AI API integration
│   │   │   └── types/          # TypeScript definitions
│   │   └── prisma/
│   │       └── schema.prisma   # Database schema
│   │
│   └── web/                    # Next.js Frontend
│       └── src/
│           ├── app/            # App router pages
│           │   ├── (dashboard)/ # Dashboard routes
│           │   └── account/    # Auth pages (login, register)
│           ├── components/     # UI components (shadcn/ui)
│           ├── modules/         # Feature modules
│           ├── hooks/           # Custom hooks
│           ├── store/          # Zustand state management
│           └── lib/            # Utilities (socket, axios)
│
├── packages/
│   └── shared/                 # Shared types & utilities
│
├── docker/
│   ├── api.Dockerfile
│   └── web.Dockerfile
│
├── docker-compose.yml
├── package.json                # Root workspace config
└── pnpm-workspace.yaml
```

---

## Features Implemented

### 1. Authentication System

| Feature              | Status |
| -------------------- | ------ |
| User Registration    | ✅     |
| Email Verification   | ✅     |
| Login with JWT       | ✅     |
| Access Token (15min) | ✅     |
| Refresh Token (7d)   | ✅     |
| Token Rotation       | ✅     |
| Multi-device Support | ✅     |
| Logout (Single/All)  | ✅     |
| Auth Guard (Bearer)  | ✅     |

### 2. Chat System

| Feature             | Status         |
| ------------------- | -------------- |
| Create Chat         | ✅             |
| Get User Chats      | ✅             |
| Rename Chat         | ✅             |
| Delete Chat         | ✅             |
| Real-time Messaging | ✅ (Socket.io) |
| Chat History        | ✅             |

### 3. Message System

| Feature            | Status            |
| ------------------ | ----------------- |
| Send Messages      | ✅                |
| Get Chat Messages  | ✅                |
| Delete Messages    | ✅                |
| Streaming Response | ✅ (Real-time AI) |
| Optimistic UI      | ✅                |

### 4. AI Integration

| Feature               | Status |
| --------------------- | ------ |
| Google Gemini         | ✅     |
| Mistral AI            | ✅     |
| Streaming Response    | ✅     |
| Auto Title Generation | ✅     |
| Multi-model Support   | ✅     |

### 5. Real-time Features

| Feature                   | Status |
| ------------------------- | ------ |
| Socket.io Integration     | ✅     |
| Live Message Streaming    | ✅     |
| Connection Authentication | ✅     |
| Auto-reconnect            | ✅     |

### 6. Frontend Features

| Feature           | Status      |
| ----------------- | ----------- |
| Responsive UI     | ✅          |
| Dark/Light Theme  | ✅          |
| Auth Pages        | ✅          |
| Chat Interface    | ✅          |
| File Upload       | ✅ (Images) |
| Web Search Toggle | ✅          |
| Message Streaming | ✅          |
| Zustand State     | ✅          |
| React Query       | ✅          |

---

## API Endpoints

### Auth Endpoints

| Method | Endpoint                            | Description               | Auth   |
| ------ | ----------------------------------- | ------------------------- | ------ |
| POST   | `/api/auth/register`                | New user registration     | No     |
| POST   | `/api/auth/login`                   | User login                | No     |
| GET    | `/api/auth/me`                      | Get current user          | Bearer |
| POST   | `/api/auth/refresh`                 | Refresh access token      | Cookie |
| POST   | `/api/auth/logout`                  | Logout current device     | Cookie |
| POST   | `/api/auth/logout-all`              | Logout all devices        | Cookie |
| POST   | `/api/auth/send/verification-email` | Resend verification email | No     |
| POST   | `/api/auth/verify-email`            | Verify email with token   | No     |

### Chat Endpoints

| Method | Endpoint                   | Description        | Auth   |
| ------ | -------------------------- | ------------------ | ------ |
| GET    | `/api/chat`                | Get all user chats | Bearer |
| GET    | `/api/chat/:chatId`        | Get specific chat  | Bearer |
| POST   | `/api/chat/rename/:chatId` | Rename chat        | Bearer |
| DELETE | `/api/chat/delete/:chatId` | Delete chat        | Bearer |

### Message Endpoints

| Method | Endpoint                      | Description       | Auth   |
| ------ | ----------------------------- | ----------------- | ------ |
| GET    | `/api/message/:chatId`        | Get chat messages | Bearer |
| DELETE | `/api/message/delete/:chatId` | Delete message    | Bearer |

---

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://username:password@ep-xxx.neon.tech/perpx?sslmode=require"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="15m"

# Bcrypt
BCRYPT_ROUNDS="12"

# Resend Email
RESEND_API_KEY="re_xxxxxxxx"

# AI APIs
GOOGLE_API_KEY="your-google-api-key"
MISTRAL_API_KEY="your-mistral-api-key"
```

---

## Database Schema

```prisma
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

model Chat {
  id          String    @id @default(cuid())
  title       String
  description String?
  userId      String
  spaceId     String?
  messages    Message[]
}

model Message {
  id      String       @id @default(cuid())
  message String
  role    MessageRole  // HUMAN | AI
  userId  String
  chatId  String
  sources Source[]
}

model Source {
  id         String   @id @default(cuid())
  title      String
  url        String
  snippet    String
  messageId  String
}

model Space {
  id          String       @id @default(cuid())
  title       String
  description String
  type        SpaceType    // PUBLIC | PRIVATE | GROUP
}

model SpaceMember {
  id      String          @id @default(cuid())
  role    SpaceMemberRole // ADMIN | MEMBER
  spaceId String
  userId  String
}
```

---

## Local Setup

### Prerequisites

- Node.js (version 18+)
- pnpm (package manager)
- Docker & Docker Compose

### Installation

```bash
# Clone repository
git clone <repository-url>
cd perpx

# Install dependencies
pnpm install
```

---

## Docker Setup

### Build and Run

```bash
# Build and run all services
docker-compose up --build

# Run in background
docker-compose up -d --build

# Stop services
docker-compose down

# View logs
docker-compose logs -f
```

### Services

- **Web**: http://localhost:3000
- **API**: http://localhost:3001
- **Redis**: localhost:6379

---

## Development

### Local Development

```bash
# Start API (NestJS)
cd apps/api
pnpm start:dev

# Start Web (Next.js) - in another terminal
cd apps/web
pnpm dev
```

### Available Scripts

```bash
# Root
pnpm install        # Install all dependencies
pnpm build          # Build all apps

# API
cd apps/api
pnpm start:dev      # Development mode
pnpm build          # Production build
pnpm start          # Start production
pnpm lint           # Lint code

# Web
cd apps/web
pnpm dev            # Development mode
pnpm build          # Production build
pnpm start          # Start production
```

---

## Recent Commits

| Commit  | Description                                                        |
| ------- | ------------------------------------------------------------------ |
| dfdddb3 | feat: complete real-time AI chat architecture with optimistic UI   |
| 2338e60 | feat(socket, ci-cd): setup socket and add Docker build pipeline    |
| d6a071e | feat(redis): complete Redis setup for auth guard user validation   |
| cdfb1d5 | feat(auth): integrate web auth flow and account routes             |
| cd7fec7 | feat(auth): complete authentication flow                           |
| d809741 | feat(auth): implement bearer auth guard and refresh token rotation |
| c7b52ce | feat(auth): add email verification with resend endpoint            |
| 7954e6e | feat: add auth login endpoint with refresh token                   |
| ee65c0a | feat: add auth register endpoint with email verification           |
