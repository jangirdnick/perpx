# AI Agent Instructions for Perpx API

This document provides context and guidelines for AI agents working on this NestJS backend application.

## Tech Stack & Core Libraries

- **Framework**: NestJS v11 (with Express).
- **Database (Relational)**: PostgreSQL accessed via Prisma ORM (`@prisma/client`, `@prisma/adapter-pg`).
- **Database (Vector)**: Pinecone (`@pinecone-database/pinecone`) integrated with LangChain.
- **Caching**: Redis (`@nestjs-modules/ioredis`, `ioredis`).
- **AI/LLM**: LangChain (`@langchain/core`, `@langchain/google-genai`, `@langchain/mistralai`, etc.) for conversational AI and RAG.
- **WebSockets**: Socket.io (`@nestjs/platform-socket.io`, `@nestjs/websockets`) for real-time chat.
- **File Storage**: AWS S3 (`@aws-sdk/client-s3`) for document and media uploads.
- **Authentication**: JWT (`@nestjs/jwt`), bcrypt, and cookie-based sessions.
- **Email**: Resend (`resend`, `nestjs-resend`) using Handlebars templates.

## Directory Structure (`src/`)

This project strictly follows NestJS modular architecture.

- **`auth/`**: Authentication controllers, services, guards, and JWT strategies.
- **`chat/`**: Chat logic and WebSockets Gateway for real-time messaging.
- **`message/`**: Database interactions for chat messages.
- **`user/`**: User management logic.
- **`vector/`**: RAG logic, embeddings generation, and Pinecone interactions.
- **`upload/`**: Logic to interact with AWS S3 and generate presigned URLs.
- **`email/`**: Sending transactional emails (via Resend) using Handlebars templates.
- **`prisma/`** & **`redis/`**: Infrastructure and client wrappers.

## Workflow Rules for AI

1. **NestJS Conventions**: Strictly adhere to NestJS Dependency Injection. Use `@Injectable()`, `@Controller()`, `@Module()`, and proper decorators.
2. **Prisma Best Practices**: Do not write raw SQL unless absolutely necessary. Rely on Prisma Client methods. Update `schema.prisma` inside the `apps/api/prisma/` folder and generate types when modifying the database.
3. **Error Handling**: Use built-in NestJS exceptions (e.g., `BadRequestException`, `NotFoundException`).
4. **WebSocket Implementation**: Real-time events must be handled cleanly in Gateways. Ensure proper socket lifecycle management.
5. **AI/LLM Workflows**: When working with LangChain or `@langchain/google-genai`, ensure prompt templates, chains, and vector retrievals are securely handling user context and not leaking cross-user data.
6. **Types**: Reuse DTOs (`class-validator`, `class-transformer`) and interfaces across modules, preferably leveraging `@perpx/shared` workspace package if applicable.
