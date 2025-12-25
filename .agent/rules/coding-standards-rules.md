---
trigger: always_on
---

# Directory Structure Enforcements
You must strictly follow this directory structure. Do not invent new root-level directories.
Note: This project uses a **`src/` directory**. All application code resides in `src/`.

```text
/
├── prisma/                 # Database schema, migrations & seed scripts
├── public/                 # Static assets
├── src/                    # Application Source Code
│   ├── app/                # App Router (Pages & Layouts)
│   │   ├── (authenticated)/# Authenticated Route Group
│   │   ├── api/            # Route Handlers (Webhooks/REST)
│   │   ├── actions/        # Server Actions (Mutations)
│   │   ├── login/          # Auth pages
│   │   └── [feature]/      # Feature-based routes
│   ├── components/         # Shared UI Components
│   │   ├── ui/             # Shadcn primitives (Button, Input)
│   │   ├── providers/      # React Context Providers
│   │   └── [domain]/       # Domain-specific components
│   ├── lib/                # Singletons & Utils (prisma.ts, utils.ts, analytics.ts)
│   ├── hooks/              # Custom React Hooks
│   ├── types/              # Global Types
│   ├── auth.ts             # NextAuth Configuration
│   ├── auth.config.ts      # NextAuth Config (Edge compatible)
│   ├── middleware.ts       # Next.js Middleware
│   └── mocks/              # Mock Service Worker (MSW) Handlers
├── tests/                  # End-to-End Tests (Playwright)
└── playwright.config.ts    # E2E Test Configuration
```

# Coding Standards & Rules

## A. Database Interactions (Prisma)

1. **Singleton Pattern:** NEVER instantiate `new PrismaClient()` inside components or pages. Always import the singleton instance from `@/lib/prisma`.
2. **No DB in UI:** NEVER write Prisma queries directly inside `page.tsx` or client components.
    * **Reads:** Abstract logic into `@/app/actions` or dedicated service functions if available.
    * **Writes:** Abstract logic into server actions in `@/app/actions`.
3. **Migrations:** Any schema change requires a `npx prisma migrate dev` command. Do not edit `migrations/` folder manually.

## B. Next.js App Router Patterns

1. **Server Components Default:** All components are Server Components by default. Only add `'use client'` when using hooks (`useState`, `useEffect`) or event listeners.
2. **Colocation:** If a component is used *only* by one specific page, create a `_components` folder inside that route directory (e.g., `src/app/dashboard/_components`).
3. **Data Fetching:** Fetch data in `page.tsx` (Server Component) and pass it down as props to Client Components.
4. **Route Groups:** Use `(folderName)` for organizing routes without affecting the URL structure.

## C. Testing

1. **E2E Tests (Playwright):** All E2E tests must reside in the `tests/` folder.
    *   **Fixtures:** Use `tests/fixtures/` (if exists) or local fixtures for reusable test setups.
    *   **Selectors:** Prioritize `data-testid` attributes or user-visible locators (roles, text) over CSS classes.
2. **Unit Tests (Vitest):** Co-locate unit tests with the code they test (e.g., `utils.test.ts` next to `utils.ts`) or in a dedicated `__tests__` directory if preferred.

## D. File Naming Conventions

1. **Files:** ALWAYS use **kebab-case** for ALL file names (e.g., `submit-button.tsx`, `user-profile-card.tsx`).
    *   **Reasoning:** Avoids case-sensitivity Git issues (e.g. renaming `File.ts` to `file.ts` is ignored by Git on macOS/Windows, causing CI failures).
2. **Folders:** ALWAYS use **kebab-case** (e.g., `src/components/user-profile/`).
3. **Components:** Export names should be **PascalCase** (e.g., `export function SubmitButton() {}`).
4. **Utilities/Hooks:** **camelCase** (e.g., `useAuth.ts`, `formatDate.ts`).
5. **Types/Interfaces:** **PascalCase** (e.g., `interface UserProfile {}`).

# Forbidden Patterns ❌

* **NO** API Routes (`api/...`) for internal form submissions. Use **Server Actions** instead.
* **NO** direct secrets usage in client-side code. Use `process.env` only on the server.
* **NO** raw CSS files. Use Tailwind utility classes or `src/app/globals.css` only.
* **NO** `any` types. Strictly define interfaces in `src/types/` or infer from Prisma.