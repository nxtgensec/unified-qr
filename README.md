# Unified QR

A single workspace for every QR code job — generate, style, track, and manage all code types from one place.

## Overview

Unified QR replaces the typical "three-tab workflow" with a single, focused tool. Most QR platforms paywall basic features like dynamic codes, SVG export, and scan analytics. This project makes everything free after a simple Google sign-in.

**Core features:**

- **19 QR code types** — URL, text, Wi-Fi, vCard, email, SMS, phone, WhatsApp, calendar event, location, UPI payment, social links, app download, Bitcoin, Google review, coupon, YouTube, LinkedIn, Telegram
- **Full design control** — module shapes (square / rounded / dots), corner styles, foreground/background colors, custom logo embed, error correction level
- **Dynamic codes** — create a short link, print the code once, change the destination any time
- **Scan analytics** — scans over time (30-day bar chart), device breakdown, per-code scan counts
- **Bulk CSV generation** — paste a list of values, download all codes as a single ZIP
- **QR decoder** — drop in an image, read the encoded data
- **SVG + PNG export** — no watermarks, codes never expire

## Tech Stack

| Layer      | Technology                                                                                                                                   |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework  | [TanStack Start](https://tanstack.com/start) (React 19, Vite 8, Nitro)                                                                       |
| Styling    | Tailwind CSS 4 + [shadcn/ui](https://ui.shadcn.com) (Radix primitives)                                                                       |
| Auth       | Supabase Auth — Google OAuth via OpenID Connect                                                                                              |
| Database   | Supabase Postgres with Row Level Security                                                                                                    |
| QR Engine  | [`qrcode`](https://www.npmjs.com/package/qrcode) (generation) + [`jsQR`](https://www.npmjs.com/package/jsqr) (decoding), custom SVG renderer |
| Validation | Zod (server-function inputs)                                                                                                                 |
| UI         | lucide-react icons, sonner toasts, React Hook Form                                                                                           |

## Getting Started

### Prerequisites

- Node.js 18+ (recommended via [nvm](https://github.com/nvm-sh/nvm))
- A [Supabase](https://supabase.com) project with Google OAuth enabled
- A [Google Cloud](https://console.cloud.google.com) OAuth 2.0 Client ID

### Environment Variables

Copy `.env.example` (or create `.env`) and fill in:

```
SUPABASE_PROJECT_ID=your-project-ref
SUPABASE_PUBLISHABLE_KEY=your-anon-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
VITE_SUPABASE_PROJECT_ID=your-project-ref
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_SUPABASE_URL=https://your-project.supabase.co
```

### Database Schema

Apply the migrations in `supabase/migrations/` to your Supabase project:

```bash
supabase db push --linked
```

This creates five tables with Row Level Security:

| Table              | Purpose                                                                    |
| ------------------ | -------------------------------------------------------------------------- |
| `profiles`         | User metadata (auto-populated on first sign-in) plus `plan_tier`           |
| `qr_codes`         | Saved QR codes with style, content, dynamic link slug, scan count          |
| `qr_scans`         | Per-scan records (device, country, referrer, timestamp)                    |
| `visits`           | Daily site visitors (visitor cookie + per-day rollup)                      |
| `upgrade_requests` | Enterprise upgrade ledger (manual requests and Razorpay order/payment ids) |

### Plans & Payments

Accounts default to the free **Professional** plan (`profiles.plan_tier = 'professional'`):
3 dynamic QR codes, 30-day scan analytics, no bulk CSV. The **Enterprise** plan
(`plan_tier = 'enterprise'`) unlocks unlimited dynamic codes, full scan history and bulk CSV.

Enterprise payments use Razorpay. Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in your
environment to enable live checkout. Until they're set, the upgrade button creates a
`pending` row in `upgrade_requests` for manual follow-up.

### Google OAuth Setup

1. Create an OAuth 2.0 Client ID in [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Add your Supabase callback URL as an authorized redirect URI:
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```
3. Enable Google provider in your Supabase dashboard under **Authentication → Providers → Google**
4. Paste the Client ID and Client Secret

### Install and Run

```bash
npm install
npm run dev
```

### Scripts

| Command           | Description                             |
| ----------------- | --------------------------------------- |
| `npm run dev`     | Start development server                |
| `npm run build`   | Production build (client + SSR + Nitro) |
| `npm run preview` | Preview the production build            |
| `npm run lint`    | ESLint                                  |
| `npm run format`  | Prettier auto-format                    |

## Project Structure

```
src/
  routes/                     # File-based routing (TanStack Start)
    __root.tsx                # App shell, providers, global error handling
    index.tsx                 # Landing page with inline QR studio
    auth.tsx                  # Google sign-in page
    _authenticated/           # Auth-guarded layout
      route.tsx               # Session check, redirects to /auth if unauthenticated
      dashboard.tsx           # Overview — stats, recent codes, tool cards
      create.tsx              # Full QR studio with save
      codes.tsx               # Library — list, edit dynamic target, download, delete
      analytics.tsx           # 30-day scan chart, device breakdown, top codes
      bulk.tsx                # CSV batch generator with ZIP download
      decode.tsx              # QR image reader (client-side via jsQR)
      settings.tsx            # Account info, sign out
    api/public/r/$slug.ts     # Dynamic code redirect + scan tracking (server-only)
  components/
    dashboard/DashboardShell.tsx   # Sidebar + header layout for all dashboard pages
    qr/QrStudio.tsx               # QR builder — content fields, style controls, export
    qr/QrPreview.tsx              # Live SVG preview component
    BetaBadge.tsx                 # "Beta" pill badge
    ui/                           # shadcn/ui primitives (46 components)
  lib/
    qr/types.ts            # QR kinds, style interfaces, payload builders
    qr/render.ts           # Custom SVG renderer, PNG/SVG export, slug generator
    codes.functions.ts     # Server functions — CRUD for codes, analytics query
    utils.ts               # cn() utility (clsx + tailwind-merge)
  integrations/
    supabase/
      client.ts            # Client-side Supabase client (browser)
      client.server.ts     # Server-side admin client (service role, bypasses RLS)
      auth-middleware.ts    # Server-function middleware — validates JWT, injects user
      auth-attacher.ts     # Client middleware — attaches auth token to server RPCs
      types.ts             # Auto-generated Database types
supabase/
  migrations/              # SQL schema (tables, RLS policies, triggers)
```

## How Dynamic Codes Work

1. User creates a QR code with "dynamic" enabled
2. A random 7-char slug is generated and stored alongside the destination URL
3. The QR code encodes `/api/public/r/{slug}` instead of the raw URL
4. When scanned, the server looks up the slug, records the scan, and 302-redirects to the current destination
5. The user can update the destination at any time — the printed code never changes

## Security

- All server functions require a valid Supabase JWT (via `requireSupabaseAuth` middleware)
- Row Level Security ensures users can only read/write their own data
- The admin client (`client.server.ts`) bypasses RLS and is only used for trusted operations (redirect endpoint)
- QR style inputs (colors, logo) are validated server-side with regex to prevent XSS
- The redirect endpoint includes a 30-second cooldown per code to prevent scan inflation

## License

Private — All rights reserved.
