# AI Agent Instructions for Perpx Web App

This document provides context and guidelines for AI agents working on this Next.js web application.

<!-- BEGIN:nextjs-agent-rules -->

## Next.js & React Environment

- **Next.js 16.2.3 & React 19**: This project uses highly modern versions of Next.js and React. APIs, conventions, and file structure may differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
- **App Router**: Uses App Router strictly (`src/app`).
<!-- END:nextjs-agent-rules -->

## Tech Stack & Libraries

- **Styling**: Tailwind CSS v4. Avoid arbitrary custom CSS unless necessary; rely on Tailwind v4 utilities.
- **Components**: Radix UI + Custom shadcn/ui-inspired components. Use `src/components/ui/` for core reusable UI.
- **Icons**: `@hugeicons/react` and `@hugeicons/core-free-icons`.
- **State Management**: Redux Toolkit (`src/store`) alongside Tanstack React Query (`@tanstack/react-query`) for remote data fetching.
- **Form Handling**: `react-hook-form` + `zod` schema validation.
- **Real-time**: `socket.io-client` for live chat updates.
- **Markdown Rendering**: `react-markdown` with `react-syntax-highlighter` for rendering chat code blocks.

## Directory Structure

- **`src/app`**: Next.js App Router (pages, layouts, globals.css).
- **`src/modules`**: Feature-based architecture. Contains domain-specific logic.
  - `auth/`: Authentication logic and APIs.
  - `chat/`: Core chat logic, API integration, custom hooks (e.g., `useChat`).
  - `layout/`: App shell, navigation, and sidebar components.
- **`src/components/ui`**: Base UI elements.
- **`src/lib`**: General utilities (e.g., `cn` for tailwind-merge).
- **`src/store`**: Redux store setup.

## Workflow Rules for AI

1. **Modules First**: Place feature-specific logic in `src/modules/` rather than cluttering `src/app/` or `src/components/`.
2. **Styling Standards**: Maintain the sleek, modern dark mode aesthetic (e.g., backdrop blurs, refined scrollbars, nuanced borders). Keep designs visually excellent.
3. **TypeScript**: Strictly type inputs and responses. Reuse types from `@perpx/shared` when modifying cross-boundary APIs.
4. **No Destructive Overrides**: Do not overwrite core UI patterns without verifying requirements. Check existing `globals.css` custom classes before re-implementing them.
