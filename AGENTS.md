# Project Guidelines

## Development

- Prefer `bun` as the package manager; `npm` works as a fallback.
- Always run `npm run build` after significant changes to verify no type or build errors.
- Run `npm run lint` before committing.
- Run `npm run format` to auto-fix formatting.

## Architecture

- **TanStack Start** (full-stack React) with file-based routing in `src/routes/`.
- **Supabase** for auth (Google OAuth) and Postgres. Server functions use the auth middleware in `src/integrations/supabase/auth-middleware.ts`.
- **shadcn/ui** components live in `src/components/ui/`. Follow existing patterns when adding new UI.
- **QR logic** lives in `src/lib/qr/` (types, rendering, payload builders).

## Conventions

- No comments in code unless explicitly requested.
- Dark theme only — white text on dark backgrounds.
- Use `sonner` for toasts, `lucide-react` for icons.
- Server functions must use the `requireSupabaseAuth` middleware for user-scoped queries.
- The `supabaseAdmin` client (in `client.server.ts`) is for trusted server-side ops only — never import in client code.
