# 06 — Tech Stack

## Base Stack + Versi

| Layer | Tech | Versi target | Catatan |
|-------|------|--------------|---------|
| Framework | Next.js | 15.x (App Router) | Server Components default |
| Language | TypeScript | 5.x, `strict: true` | Wajib strict mode |
| Styling | Tailwind CSS | 3.x | Extend theme di `tailwind.config.ts` |
| UI Components | shadcn/ui | latest | Copy-paste, bukan npm package |
| BaaS (DB) | Supabase | free tier | Postgres only — BUKAN Auth |
| BaaS (Storage) | Supabase Storage | free tier (1GB) | Untuk avatar + cover buku |
| Auth | iron-session | 8.x | Cookie-based session, server-side |
| Password hashing | bcrypt | 5.x | Hash + compare |
| Validation | Zod | 3.x | Schema validation di Server Action |
| Deployment | Vercel | free tier | Auto-deploy dari main branch |
| Package manager | npm | 10.x | — |
| Node | 20 LTS ke atas | — | — |

## Dependencies

### Production
- `next` — 15.x
- `react`, `react-dom` — 19.x
- `@supabase/supabase-js` — Supabase client SDK (untuk query DB + Storage)
- `iron-session` — cookie-based session management
- `bcrypt` — password hashing
- `zod` — input validation
- `tailwindcss`, `postcss`, `autoprefixer`
- `class-variance-authority`, `clsx`, `tailwind-merge` — utility untuk shadcn/ui
- `lucide-react` — icon set
- `sonner` — toast notifications (shadcn/ui compatible)

### Development
- `typescript`, `@types/react`, `@types/node`, `@types/bcrypt`
- `eslint`, `eslint-config-next`
- `prettier`, `prettier-plugin-tailwindcss`

**Catatan: JANGAN install `@supabase/ssr`** — kita tidak pakai Supabase Auth, jadi tidak butuh cookie-based Supabase session. Cukup `@supabase/supabase-js` saja, dipakai di server-side only.

## Environment Variables

Buat file `.env.local` di root project (JANGAN commit ke git — sudah ada di `.gitignore` default Next.js):

```env
# Supabase — ambil dari https://supabase.com/dashboard/project/<project-id>/settings/api
# PENTING: TANPA prefix NEXT_PUBLIC_ karena kita hanya pakai di server-side
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# iron-session — generate random string min 32 karakter
# Bisa generate di terminal: openssl rand -base64 32
SESSION_SECRET=ganti-dengan-random-string-min-32-karakter

# Admin password — hash ini nanti di-seed ke database
# Atau set default admin password di sini untuk initial setup
ADMIN_DEFAULT_PASSWORD=ganti-dengan-password-admin
```

**Catatan penting:**
- **TIDAK ADA `NEXT_PUBLIC_` prefix** — semua env var ini server-side only. Tidak ada satupun yang boleh diakses dari browser/Client Component.
- `SUPABASE_SERVICE_ROLE_KEY` punya akses penuh ke database — jangan pernah expose.
- `SESSION_SECRET` harus random dan panjang. Di terminal: `openssl rand -base64 32`.

Buat juga `.env.example` (ini yang di-commit):

```env
# Supabase
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# iron-session
SESSION_SECRET=

# Admin
ADMIN_DEFAULT_PASSWORD=
```

## Setup Koneksi Supabase (Step by Step)

### Step 1: Buat project Supabase

1. Buka [supabase.com/dashboard](https://supabase.com/dashboard) → "New project."
2. Pilih organization → beri nama project (misal `berkembang`) → set password database (simpan di password manager — ini password Postgres, beda dengan password admin di app).
3. Pilih region: **Southeast Asia (Singapore)**.
4. Tunggu ~2 menit sampai project ready.

### Step 2: Ambil credentials

1. Di dashboard project → **Settings → API** (di sidebar kiri bawah).
2. Copy:
   - `Project URL` → masukkan ke `SUPABASE_URL` di `.env.local`
   - Di section **Project API keys**, klik "Reveal" pada `service_role` key → masukkan ke `SUPABASE_SERVICE_ROLE_KEY`
3. **JANGAN copy anon key** — kita nggak pakai anon key di project ini.

### Step 3: Install dependencies

```bash
npm install @supabase/supabase-js iron-session bcrypt zod lucide-react sonner
npm install -D @types/bcrypt
```

### Step 4: Bikin Supabase admin client (SATU varian saja)

Karena kita tidak pakai Supabase Auth dan tidak butuh anon key, kita cuma bikin SATU client: admin client pakai service role key. Client ini **hanya boleh dipakai di server-side** (Server Component, Server Action, Route Handler).

File: `lib/supabase/admin.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

// PENTING: File ini HANYA boleh di-import dari server-side code.
// Jangan pernah import di Client Component ('use client').

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})
```

**TIDAK ADA file `client.ts` atau `middleware.ts` Supabase** — karena kita tidak pakai Supabase Auth. Semua interaksi Supabase lewat `supabaseAdmin` di server-side.

### Step 5: Setup iron-session

File: `lib/auth/session.ts`

```typescript
import { getIronSession, IronSession } from 'iron-session'
import { cookies } from 'next/headers'

export interface SessionData {
  userId: string
  username: string
  role: 'admin' | 'mentee'
}

const sessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: 'berkembang_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7, // 7 hari
  },
}

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies()
  return getIronSession<SessionData>(cookieStore, sessionOptions)
}
```

### Step 6: Setup middleware (route protection)

File: `middleware.ts` (di ROOT project)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import type { SessionData } from '@/lib/auth/session'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  const session = await getIronSession<SessionData>(
    request,
    response,
    {
      password: process.env.SESSION_SECRET!,
      cookieName: 'berkembang_session',
    }
  )

  const { pathname } = request.nextUrl

  // Public route — selalu boleh akses
  if (pathname === '/login') {
    // Kalau sudah login, redirect ke halaman yang sesuai
    if (session.userId) {
      const redirectTo = session.role === 'admin'
        ? '/admin/dashboard'
        : '/mentee/leaderboard'
      return NextResponse.redirect(new URL(redirectTo, request.url))
    }
    return response
  }

  // Belum login — redirect ke /login
  if (!session.userId) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Admin route — hanya admin
  if (pathname.startsWith('/admin') && session.role !== 'admin') {
    return NextResponse.redirect(new URL('/mentee/leaderboard', request.url))
  }

  // Mentee route — hanya mentee
  if (pathname.startsWith('/mentee') && session.role !== 'mentee') {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### Step 7: Bikin password helpers

File: `lib/auth/password.ts`

```typescript
import bcrypt from 'bcrypt'

const SALT_ROUNDS = 10

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
```

### Step 8: Bikin tabel database

Buka Supabase Dashboard → **SQL Editor** → jalankan query berikut satu per satu:

```sql
-- 1. Tabel users (admin + mentee)
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'mentee')),
  avatar_url TEXT,
  total_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index untuk login query
CREATE INDEX users_username_idx ON public.users (username);
-- Index untuk leaderboard query
CREATE INDEX users_role_points_idx ON public.users (role, total_points DESC);

-- 2. Tabel point_logs
CREATE TABLE public.point_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentee_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  points INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX point_logs_mentee_idx ON public.point_logs (mentee_id, created_at DESC);

-- 3. Tabel tasks
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('broadcast', 'special')),
  deadline DATE NOT NULL,
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX tasks_active_idx ON public.tasks (is_archived, deadline);

-- 4. Tabel task_assignments
CREATE TABLE public.task_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  mentee_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'submitted')),
  submitted_at TIMESTAMPTZ,
  UNIQUE (task_id, mentee_id)
);

CREATE INDEX task_assignments_task_idx ON public.task_assignments (task_id);
CREATE INDEX task_assignments_mentee_idx ON public.task_assignments (mentee_id);

-- 5. Tabel book_lendings
CREATE TABLE public.book_lendings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentee_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  cover_image_url TEXT NOT NULL,
  deadline DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'returned')),
  returned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX book_lendings_status_idx ON public.book_lendings (status, deadline);
CREATE INDEX book_lendings_mentee_idx ON public.book_lendings (mentee_id);

-- 6. Tabel growth_levels (admin-configurable milestone poin -> level pertumbuhan)
CREATE TABLE public.growth_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  emoji TEXT NOT NULL,
  min_points INTEGER NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX growth_levels_min_points_idx ON public.growth_levels (min_points);

-- Seed dengan 5 level default (bisa diedit/ditambah/dihapus lewat halaman Admin > Growth levels)
INSERT INTO public.growth_levels (label, emoji, min_points) VALUES
  ('Seed', '🌱', 0),
  ('Sprout', '🌿', 100),
  ('Bud', '🌷', 300),
  ('Bloom', '🌸', 600),
  ('Full Bloom', '🌺', 1000);
```

### Step 9: Seed admin user

Jalankan di SQL Editor Supabase. **Ganti password hash** dengan hash dari password yang lo mau pakai.

Cara generate hash: jalankan script Node.js kecil di lokal:

```bash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('PASSWORD_LO_DI_SINI', 10).then(h => console.log(h))"
```

Lalu paste hash-nya ke query:

```sql
INSERT INTO public.users (username, password_hash, role)
VALUES ('admin', '$2b$10$HASH_YANG_LO_GENERATE', 'admin');
```

Alternatif: buat seed script di `scripts/seed-admin.ts` yang bisa di-run via `npx tsx scripts/seed-admin.ts` — baca password dari env var `ADMIN_DEFAULT_PASSWORD`.

### Step 10: Setup Supabase Storage buckets

Di Supabase Dashboard → **Storage** → klik "New bucket":

**Bucket 1: `avatars`**
- Name: `avatars`
- Public: **ON** (supaya gambar bisa di-load langsung di img tag)
- File size limit: 2MB
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`

**Bucket 2: `book-covers`**
- Name: `book-covers`
- Public: **ON**
- File size limit: 2MB
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`

**Penting:** Karena kita pakai service role key untuk upload, TIDAK perlu setup Storage RLS policies. Service role key bypass semua policy. Bucket di-set public supaya gambar bisa di-load via URL publik di `<img>` tag tanpa auth.

### Step 11: Cek semuanya aman di free tier

Verifikasi bahwa semua yang dipakai ada di Supabase free tier:

| Fitur | Free Tier | Kita pakai? | Status |
|-------|-----------|-------------|--------|
| Database (Postgres) | 500MB | ✅ | Lebih dari cukup |
| Storage | 1GB | ✅ | Cukup (image di-compress) |
| Auth | 50K MAU | ❌ | Tidak pakai |
| Realtime | 200 concurrent | ❌ | Tidak pakai |
| Edge Functions | 500K invocations | ❌ | Tidak pakai |
| Bandwidth | 5GB / month | ✅ | Cukup untuk ~5 mentee |

**⚠️ PERINGATAN:** Supabase free tier **pause project setelah 7 hari inactivity** (nggak ada request sama sekali). Kalau ke-pause:
1. Buka Supabase Dashboard → project → klik "Restore"
2. Tunggu ~2 menit
3. Data TIDAK hilang — cuma project-nya hibernate

Selama ada traffic (lo atau mentee buka web), project tetap aktif.

## Struktur Folder Rekomendasi

```
berkembang/
├── app/
│   ├── login/page.tsx
│   ├── admin/
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── mentees/page.tsx
│   │   ├── mentees/[id]/page.tsx
│   │   ├── tasks/page.tsx
│   │   ├── tasks/[id]/page.tsx
│   │   ├── books/page.tsx
│   │   └── actions/ (auth.ts, mentees.ts, points.ts, tasks.ts, books.ts)
│   ├── mentee/
│   │   ├── layout.tsx
│   │   ├── leaderboard/page.tsx
│   │   ├── my-points/page.tsx
│   │   ├── tasks/page.tsx
│   │   ├── books/page.tsx
│   │   ├── profile/page.tsx
│   │   └── actions/ (profile.ts, queries.ts)
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/ (ui/, auth/, leaderboard/, tasks/, books/, points/, shared/, nav/)
├── lib/
│   ├── supabase/admin.ts
│   ├── auth/ (session.ts, password.ts)
│   ├── schemas/ (auth.ts, mentee.ts, point.ts, task.ts, book.ts)
│   ├── constants/ (growth-levels.ts, routes.ts)
│   ├── utils.ts
│   └── types.ts
├── middleware.ts
├── tailwind.config.ts
├── next.config.js
├── tsconfig.json
├── .env.local
└── .env.example
```

Lengkapnya ada di `04-architecture.md`.

## Deploy ke Vercel

1. Push repo ke GitHub.
2. Di [vercel.com](https://vercel.com) → "Add New Project" → import repo.
3. Framework preset: Next.js (auto-detected).
4. **Environment variables** → copy SEMUA dari `.env.local`:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SESSION_SECRET`
   - `ADMIN_DEFAULT_PASSWORD` (kalau masih butuh)
   
   Set untuk: **Production**, **Preview**, dan **Development**.
5. Deploy. Setelah ini, setiap push ke `main` auto-deploy.

**Catatan Vercel free tier:**
- Hobby plan: 1 project member, unlimited deploys
- Serverless function timeout: 10 detik (cukup untuk use case kita)
- Bandwidth: 100GB / bulan (lebih dari cukup)

## Setup Tambahan: Image Compression di Client-Side

Untuk menghemat storage Supabase (1GB free tier), semua image di-compress di browser sebelum upload. Gunakan Canvas API:

```typescript
// lib/utils/compress-image.ts
export async function compressImage(
  file: File,
  maxSizeKB: number = 500,
  maxWidth: number = 800,
  maxHeight: number = 800
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let { width, height } = img

      // Scale down kalau lebih besar dari max
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width *= ratio
        height *= ratio
      }

      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)

      // Mulai dari quality 0.8, turunkan kalau masih kegedean
      let quality = 0.8
      const tryCompress = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error('Compression failed'))
            if (blob.size <= maxSizeKB * 1024 || quality <= 0.3) {
              resolve(blob)
            } else {
              quality -= 0.1
              tryCompress()
            }
          },
          'image/webp',
          quality
        )
      }
      tryCompress()
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}
```

Output selalu WebP (ukuran kecil, support luas). Max 500KB setelah kompresi.

## Common Gotcha

- **"Cannot find module 'bcrypt'"** → pastikan install `bcrypt` DAN `@types/bcrypt`. Kalau masih error di Vercel, coba ganti ke `bcryptjs` (pure JS, nggak butuh native compilation).
- **Session hilang setelah deploy** → pastikan `SESSION_SECRET` di Vercel environment variables SAMA dengan lokal. Kalau beda, cookie dari deployment lama nggak bisa di-decrypt.
- **Gambar nggak muncul** → pastikan bucket Supabase di-set **Public**. Kalau private, URL butuh signed token.
- **"iron-session: password must be at least 32 characters"** → `SESSION_SECRET` harus min 32 char. Generate: `openssl rand -base64 32`.
- **Supabase project paused** → buka dashboard, klik Restore. Data aman.
- **Upload gagal "new row violates check constraint"** → cek MIME type file sesuai yang di-allow di bucket settings.
