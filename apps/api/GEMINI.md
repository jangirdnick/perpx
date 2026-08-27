# Project Guidelines for Gemini

This project follows specific structural and technological conventions for a NestJS + Prisma backend application.
Please refer to the detailed instructions in **AGENTS.md** before performing any modifications.

## Key Directives for Gemini:

1. **Context Awareness**: Always review `AGENTS.md` to understand the architecture, which includes NestJS v11, Prisma ORM, WebSockets, and LangChain AI modules.
2. **Modular Architecture**: Ensure that new features or modifications strictly adhere to the domain-driven modular structure inside `src/`. Do not bypass NestJS Dependency Injection.
3. **Database Rules**: When instructed to update the database schema, modify `apps/api/prisma/schema.prisma` and ensure you run the appropriate Prisma generation commands if requested.
4. **Code Quality**: Write clean, strictly-typed TypeScript code using `class-validator` and `class-transformer` for DTOs.
5. **No Hallucinations**: If the file path or module structure is unclear, use your file exploration tools to verify before writing code. Preserve existing logic unless explicitly instructed to overwrite it.
