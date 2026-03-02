

## Plan: Fix Edge Function Build Errors

There are 4 TypeScript errors across 3 edge functions where `error` is typed as `unknown` and `.message` is accessed directly.

### Changes

1. **`supabase/functions/approve-access-request/index.ts`** (line ~204) — Cast `error` to access `.message`
2. **`supabase/functions/list-residents/index.ts`** (line ~78) — Same fix
3. **`supabase/functions/notify-admin-access-request/index.ts`** (lines ~59-60) — Same fix (2 occurrences)

Each `catch (error)` block will use `(error as Error).message` or a safe fallback like `error instanceof Error ? error.message : "Unknown error"`.

### Additional Cleanup

4. **Remove obsolete Node.js files** — `api/request-access.ts` and `api/test-email.js` are not used (this project uses Deno edge functions, not Node.js API routes).

