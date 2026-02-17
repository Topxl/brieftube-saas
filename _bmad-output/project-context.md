---
project_name: 'BriefTube'
user_name: 'vin'
date: '2026-02-17'
sections_completed: ['technology_stack', 'language_rules', 'framework_rules', 'testing_rules', 'code_quality', 'workflow_rules', 'critical_rules']
status: 'complete'
rule_count: 92
optimized_for_llm: true
existing_patterns_found: 15
input_documents:
  - '/home/vj/Bureau/Projets/BriefTube/package.json'
  - '/home/vj/Bureau/Projets/BriefTube/tsconfig.json'
  - '/home/vj/Bureau/Projets/BriefTube/next.config.ts'
  - '/home/vj/Bureau/Projets/BriefTube/CLAUDE.md'
  - '/home/vj/Bureau/Projets/BriefTube/prisma/schema/schema.prisma'
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

**Core Framework:**
- Next.js `16.0.10` (App Router, Turbopack, Typed Routes)
- TypeScript `5.9.3` (strict mode enabled)
- React `19.2.3` + React DOM `19.2.3`
- pnpm `10.14.0`

**Database & Backend:**
- PostgreSQL with Prisma `7.1.0`
- Better Auth `1.4.7` (primary auth system)
- Supabase Auth `2.95.3` (secondary - used in dashboard)
- Redis via ioredis `5.8.2`

**State & Forms:**
- TanStack Form `1.27.3` ⚠️ **Use this - React Hook Form is deprecated**
- TanStack Query `5.90.12` (server state)
- Zustand `5.0.9` (global state)
- nuqs `2.8.5` (URL state)

**Styling & UI:**
- TailwindCSS `4.1.18`
- Shadcn UI (Radix UI primitives)
- Lucide React `0.561.0`

**Key Libraries:**
- Zod `4.1.13` (validation)
- Stripe `20.0.0` (payments)
- Resend `6.6.0` + React Email `5.0.8`
- Next Safe Action `8.0.11` (server actions)
- Next Zod Route `1.0.0` (API routes)

**Testing:**
- Vitest `4.0.15` (unit tests)
- Playwright `1.57.0` (e2e tests)
- Testing Library React `16.2.0`

## Critical Implementation Rules

### Language-Specific Rules (TypeScript)

**TypeScript Configuration:**
- Strict mode enabled - all strict checks required
- Use path aliases: `@/*` (src), `@email/*` (emails), `@app/*` (app)
- Target ES2015, Module ESNext with bundler resolution

**Type Conventions:**
- ✅ Use `type` over `interface` (ESLint enforced)
- ❌ No enums - use maps instead
- Use `satisfies` for Prisma select/include objects
- Export types: `Prisma.PromiseReturnType<typeof fn>`
- Pages use global `PageProps<"/route">` type

**Error Handling:**
- Server actions: throw `ActionError`
- API routes: throw `ZodRouteError` or `ApplicationError`
- Never use generic `Error` for user-facing errors

### Framework-Specific Rules (React/Next.js)

**Component Architecture:**
- Prefer React Server Components by default
- Use `"use client"` only for Web APIs or user interaction
- Wrap client components in `<Suspense>` with fallback
- Use dynamic imports for non-critical components

**Server Actions:**
- Files suffix: `.action.ts`
- Types: `action` (public), `authAction` (user), `orgAction` (org), `adminAction` (admin)
- Add `metadata({ roles, permissions })` for orgAction when needed
- Validate with `.schema()` or `.inputSchema()` + Zod

**API Routes:**
- Types: `route` (public), `authRoute` (user), `orgRoute` (org)
- Validate with `.params()`, `.body()`, `.query()` + Zod
- orgRoute requires `x-org-slug` header

**Forms:**
- ⚠️ CRITICAL: Use TanStack Form - React Hook Form is DEPRECATED
- Import from `@/features/form/tanstack-form`
- Use `resolveActionResult()` for server action mutations

**State Management:**
- Server state: TanStack Query
- Global state: Zustand
- URL state: nuqs
- Form state: TanStack Form

### Testing Rules

**Test Organization:**
- Unit tests: `__tests__/` directory (Vitest + React Testing Library)
- E2E tests: `e2e/` directory (Playwright)
- E2E helpers: `e2e/utils/`

**Test Commands:**
- ⚠️ CRITICAL: ALWAYS use CI mode (non-interactive)
  - ✅ `pnpm test:ci` - Run unit tests
  - ✅ `pnpm test:e2e:ci` - Run e2e tests (headless)
- ❌ NEVER use interactive mode:
  - ❌ `pnpm test` - Not compatible
  - ❌ `pnpm test:e2e` - Not compatible

**Mock Patterns:**
- Use `vitest-mock-extended` for advanced mocks
- Mock modules in unit tests
- Use fixtures in Playwright tests

### Code Quality & Style Rules

**File Organization:**
- Server actions: `.action.ts` suffix
- UI components: `src/components/ui/` (Shadcn)
- Custom components: `src/components/nowts/`
- Features: `src/features/`
- Queries: `src/query/`

**Naming Conventions:**
- Files: kebab-case
- React components: PascalCase
- Functions/variables: camelCase

**Styling (TailwindCSS):**
- Mobile-first approach
- Use shared typography components from `@/components/nowts/typography.tsx`
- Prefer `flex gap-4` over `space-y-4`
- Use `Card` from `@/components/ui/card.tsx` for styled wrappers
- ❌ No emojis unless explicitly requested
- ❌ No gradients unless explicitly requested

**Code Quality:**
- Run `pnpm clean` before committing (lint + ts + format)
- Add comments only for non-obvious logic
- No unnecessary docstrings/JSDoc

### Development Workflow Rules

**Changelog (MANDATORY):**
- ⚠️ CRITICAL: ALWAYS update CHANGELOG.md after ANY code change
- Format: `## YYYY-MM-DD` then `FIX:`, `FEATURE:`, `REFACTOR:`, or `CHORE:`
- One line per change, present tense
- Add entry IMMEDIATELY after code change

**Git Workflow:**
- Pre-commit hooks via Husky enabled
- Run `pnpm clean` before committing

**Prisma Workflow:**
- ✅ Modify `prisma/schema.prisma` as needed
- ✅ Run `pnpm prisma:generate` after schema changes
- ❌ NEVER run migrations (`prisma:deploy`, `prisma:migrate`)
- User handles migrations manually

**Better Auth:**
- Generate schema: `pnpm better-auth:migrate`
- Auto-generated: `prisma/schema/better-auth.prisma`

**Pre-Commit Checklist:**
1. Make code changes
2. Run `pnpm clean`
3. Update CHANGELOG.md
4. Commit

### Critical Don't-Miss Rules

**🔐 Multi-Tenant Security (CRITICAL):**
- ⚠️ ALWAYS filter by `organizationId` in Prisma queries for org-scoped data
- ❌ NEVER trust user-provided orgId - use `ctx.org.id` or `ctx.organization.id`
- ✅ ALWAYS call `getRequiredCurrentOrg()` before org queries in pages
- ❌ NEVER use `authAction` for org data - use `orgAction`

**Security Example:**
```typescript
// ❌ VULNERABLE - Cross-tenant data leak
const members = await prisma.member.findMany({
  where: { userId }
});

// ✅ SECURE - Properly filtered
const org = await getRequiredCurrentOrg();
const members = await prisma.member.findMany({
  where: { organizationId: org.id, userId }
});
```

**❌ Anti-Patterns:**
- React Hook Form (DEPRECATED - use TanStack Form)
- Direct `fetch()` (use `up-fetch` from `@/lib/up-fetch.ts`)
- `interface` (use `type`)
- `enum` (use maps)
- `||` for nullish (prefer `??`)
- Forgetting CHANGELOG.md updates (MANDATORY)

**⚠️ Gotchas:**
- Dual auth: Better Auth (primary) + Supabase Auth (dashboard only)
- Prisma: Prefer `select` over `include` for performance
- Components: Prefer Server Components, minimize `"use client"`
- Tests: CI mode only, never interactive

**🔒 Security:**
- Webhooks require signature verification
- Admin routes protected by `getRequiredAdmin()`
- Never expose sensitive data to client components

---

## Usage Guidelines

**For AI Agents:**

- Read this file before implementing any code
- Follow ALL rules exactly as documented
- When in doubt, prefer the more restrictive option
- Update this file if new patterns emerge

**For Humans:**

- Keep this file lean and focused on agent needs
- Update when technology stack changes
- Review quarterly for outdated rules
- Remove rules that become obvious over time

**Last Updated:** 2026-02-17
