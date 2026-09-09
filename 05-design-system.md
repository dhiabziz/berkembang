# 05 — Design System

## Vibe / Mood

Botanical garden meets collectible card game. Base identity-nya warm, natural, dan nurturing — seperti masuk ke kebun yang terawat. Tapi begitu elemen kompetisi muncul (leaderboard, rare task), ada percikan energy yang bikin deg-degan kayak buka booster pack kartu. Secara keseluruhan, vibes-nya supportive tapi nggak lembek — bikin mentee ngerasa "gw mau naik ranking, gw mau dapet rare task." Mobile-first, tap-friendly, cepat di-scan mata.

## Referensi Visual

- **Duolingo** — untuk gamification psychology: progress yang visible, ranking yang bikin ketagihan, UI yang playful tapi nggak childish
- **Pokemon TCG / card game apps** — untuk visual language rarity: border glow, holographic hint, label tier
- **Headspace** — untuk warmth dan simplicity: rounded shapes, generous whitespace, calm base palette
- **Forest App** — untuk metafora pertumbuhan tanaman sebagai progress

## Color Palette

Palette hybrid: base nature/botanical + aksen gamification energy.

```typescript
// tailwind.config.ts (partial)
theme: {
  extend: {
    colors: {
      // Base
      background: 'hsl(var(--background))',
      foreground: 'hsl(var(--foreground))',

      // Brand — green botanical
      primary: {
        DEFAULT: 'hsl(var(--primary))',
        foreground: 'hsl(var(--primary-foreground))',
      },
      // Secondary — warm earth
      secondary: {
        DEFAULT: 'hsl(var(--secondary))',
        foreground: 'hsl(var(--secondary-foreground))',
      },
      // Accent — golden energy (kompetisi, highlight)
      accent: {
        DEFAULT: 'hsl(var(--accent))',
        foreground: 'hsl(var(--accent-foreground))',
      },

      // Rarity tiers (untuk task cards)
      rare: {
        DEFAULT: 'hsl(var(--rare))',
        foreground: 'hsl(var(--rare-foreground))',
        glow: 'hsl(var(--rare-glow))',
      },

      // Feedback
      destructive: {
        DEFAULT: 'hsl(var(--destructive))',
        foreground: 'hsl(var(--destructive-foreground))',
      },
      success: {
        DEFAULT: 'hsl(var(--success))',
        foreground: 'hsl(var(--success-foreground))',
      },
      muted: {
        DEFAULT: 'hsl(var(--muted))',
        foreground: 'hsl(var(--muted-foreground))',
      },

      // Medals (leaderboard)
      gold: 'hsl(var(--gold))',
      silver: 'hsl(var(--silver))',
      bronze: 'hsl(var(--bronze))',
    },
  },
},
```

CSS variables di `app/globals.css`:

```css
@layer base {
  :root {
    /* Base */
    --background: 80 30% 97%;             /* warm off-white, hint of green */
    --foreground: 150 20% 12%;             /* deep forest dark */

    /* Primary — lively green */
    --primary: 152 55% 38%;                /* #2D8B5E — rich botanical green */
    --primary-foreground: 0 0% 100%;

    /* Secondary — warm tan/earth */
    --secondary: 35 30% 92%;               /* warm cream-tan */
    --secondary-foreground: 150 20% 12%;

    /* Accent — golden amber (energy, competition) */
    --accent: 40 90% 55%;                  /* #E5A82B — warm gold */
    --accent-foreground: 40 90% 15%;

    /* Rare tier — deep purple/violet with glow */
    --rare: 270 60% 50%;                   /* rich purple */
    --rare-foreground: 0 0% 100%;
    --rare-glow: 270 80% 65%;              /* lighter purple for box-shadow glow */

    /* Feedback */
    --destructive: 0 72% 55%;              /* warm red */
    --destructive-foreground: 0 0% 100%;
    --success: 152 55% 38%;                /* same as primary */
    --success-foreground: 0 0% 100%;

    /* Muted */
    --muted: 80 10% 93%;
    --muted-foreground: 150 8% 45%;

    /* Medals */
    --gold: 45 95% 55%;
    --silver: 220 10% 72%;
    --bronze: 25 60% 52%;

    /* Utility */
    --border: 80 10% 87%;
    --input: 80 10% 87%;
    --ring: 152 55% 38%;                   /* primary for focus ring */
    --radius: 0.75rem;
  }
}
```

### Rarity Card Styling

Regular task cards pakai styling standar (bg-white, border biasa). Special/Rare task cards pakai treatment khusus:

```css
/* Rare card styling */
.card-rare {
  background: linear-gradient(135deg, hsl(270 50% 97%), hsl(40 50% 97%));
  border: 2px solid hsl(var(--rare));
  box-shadow:
    0 0 12px hsl(var(--rare-glow) / 0.3),
    0 4px 12px hsl(0 0% 0% / 0.08);
  position: relative;
  overflow: hidden;
}

.card-rare::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: conic-gradient(
    from 0deg,
    transparent 0deg,
    hsl(var(--rare-glow) / 0.08) 60deg,
    transparent 120deg
  );
  animation: shimmer 4s linear infinite;
}

@keyframes shimmer {
  to { transform: rotate(360deg); }
}
```

Label "RARE" di pojok kanan atas card:

```css
.badge-rare {
  background: linear-gradient(135deg, hsl(var(--rare)), hsl(var(--accent)));
  color: white;
  padding: 2px 10px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border-radius: 0 var(--radius) 0 var(--radius);
  position: absolute;
  top: 0;
  right: 0;
}
```

## Typography

Font family:
- **Sans (body + heading):** Plus Jakarta Sans — modern, friendly, sedikit rounded, dan ini font Indonesia. Diimport via `next/font/google`.
- **Mono (angka poin, tabular data):** JetBrains Mono — untuk angka poin di leaderboard biar alignment rapi.

Scale:

| Token | Size | Line height | Weight | Use |
|-------|------|-------------|--------|-----|
| `text-xs` | 12px | 16px | 400 | Caption, timestamp, helper text |
| `text-sm` | 14px | 20px | 400/500 | Secondary body, label, table cell |
| `text-base` | 16px | 24px | 400 | Body default |
| `text-lg` | 18px | 28px | 500 | Card title, emphasized text |
| `text-xl` | 20px | 28px | 600 | Section heading |
| `text-2xl` | 24px | 32px | 700 | Page heading (mobile) |
| `text-3xl` | 30px | 36px | 700 | Page heading (desktop) |
| `text-4xl` | 36px | 40px | 800 | Poin besar di leaderboard (angka) |

Angka poin di leaderboard dan card pakai `font-mono` (JetBrains Mono) + `tabular-nums` supaya digit-nya sejajar.

## Spacing Scale

Ikuti Tailwind default (`0.25rem` increment). Yang paling sering dipakai:

- Padding card: `p-4` (16px) mobile, `p-5` (20px) desktop
- Gap antar card di list: `space-y-3` (12px)
- Section spacing: `py-6` (24px) dashboard
- Bottom nav height: `h-16` (64px) — content di-pad bawah `pb-20` supaya nggak ketutup
- Page horizontal padding: `px-4` (16px) mobile, `px-6` (24px) desktop
- Max content width: `max-w-lg` (512px) mobile-centered, `max-w-4xl` (896px) desktop dashboard

## Border Radius

- `rounded-lg` (12px via `--radius: 0.75rem`) — default untuk card, button, input
- `rounded-xl` (16px) — card besar (leaderboard top 3, rare task card)
- `rounded-full` — avatar, badge, pill label
- `rounded-md` (6px) — small element, tag

## Shadow

- `shadow-sm` — card default, subtle depth
- `shadow-md` — hover state, elevated card
- `shadow-lg` — modal, dropdown
- Custom rare glow: `shadow-[0_0_12px_hsl(var(--rare-glow)/0.3)]` — rare task card

## Component Patterns

### Button

Variants (pakai shadcn/ui sebagai base, di-extend):
- `default` — primary green, white text
- `secondary` — warm cream, dark text
- `outline` — border primary, text primary
- `ghost` — text only, hover bg-muted
- `destructive` — merah, untuk hapus
- `accent` — golden, untuk action highlight (misal "Tambah Poin")

Sizes: `sm` (32px height), `default` (40px), `lg` (48px — minimum tap target mobile), `icon` (40×40px).

Semua button minimum `min-h-[44px]` di mobile untuk tap target compliance.

### Card

Dua varian utama:

**Regular Card:**
- `bg-white rounded-xl border border-border p-4 shadow-sm`
- Hover: `hover:shadow-md transition-shadow`

**Rare Card (Special Task):**
- Pakai `.card-rare` styling (lihat Rarity Card Styling di atas)
- Badge "RARE" di pojok kanan atas
- Shimmer animation halus di background

### Leaderboard Card

Tiga tier visual:
- **Rank 1:** Card lebih besar, border `border-gold`, background hint `bg-gold/5`, ikon medali emas
- **Rank 2:** Border `border-silver`, background hint `bg-silver/5`, ikon medali perak
- **Rank 3:** Border `border-bronze`, background hint `bg-bronze/5`, ikon medali perunggu
- **Rank 4+:** Card standar, tanpa border warna khusus

### Growth Level Badge

Visual badge yang menunjukkan level pertumbuhan mentee berdasarkan poin:

| Level | Poin | Label | Visual |
|-------|------|-------|--------|
| 1 | 0+ | Benih | 🌱 Ikon seed, warna muted |
| 2 | 100+ | Tunas | 🌿 Ikon sprout, warna light green |
| 3 | 300+ | Kuncup | 🌷 Ikon bud, warna primary |
| 4 | 600+ | Mekar | 🌸 Ikon bloom, warna accent |
| 5 | 1000+ | Mekar Penuh | 🌺 Ikon full bloom, warna emas + glow |

Badge ditampilkan sebagai pill: `rounded-full px-3 py-1 text-xs font-semibold` dengan warna background sesuai tier.

### Input

- Default: `rounded-lg border border-input bg-white px-3 py-2 text-sm h-11`
- Focus: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary`
- Error: `border-destructive` + helper text `text-destructive text-xs mt-1`

### Avatar

- Size variants: `w-8 h-8` (list item), `w-10 h-10` (leaderboard), `w-16 h-16` (profil), `w-20 h-20` (leaderboard #1)
- Dengan foto: `rounded-full object-cover`
- Tanpa foto (fallback): `rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center` — tampilkan inisial nama (1-2 huruf)

### Dialog (Modal)

- Overlay: `bg-foreground/60 backdrop-blur-sm`
- Content: `rounded-xl bg-white border shadow-lg p-6 max-w-md mx-4`
- Animasi: fade in + slide up subtle

### Toast

- Posisi: bottom-center mobile (di atas bottom nav), bottom-right desktop
- Variants:
  - Success: `bg-primary text-white` + ikon check
  - Error: `bg-destructive text-white` + ikon X
  - Info: `bg-foreground text-white`
- Auto-dismiss: 3 detik

### Empty State

- Center align
- Ikon dari `lucide-react` size 48px, warna `text-muted-foreground`
- Heading: `text-lg font-semibold`
- Deskripsi: `text-sm text-muted-foreground`
- CTA button di bawah (jika ada aksi)

### Bottom Navigation (Mobile)

- Fixed bottom, `h-16 bg-white border-t border-border`
- 3-4 tab items, each: ikon 20px + label `text-xs`
- Active state: `text-primary font-semibold` + ikon filled
- Inactive: `text-muted-foreground`
- Safe area padding: `pb-safe` untuk iPhone notch

## Voice & Tone (Microcopy)

- **Nada:** Supportive tapi nggak lebay. Kayak kakak mentor yang chill — bisa bercanda tapi tetap dihormati.
- **Bahasa:** Bahasa Indonesia casual. Bukan formal (jangan "Anda"), bukan slang berlebihan.
- **Persona:** Aplikasi ngomong sebagai "kita" (program ber-kembang), bukan "saya."

Contoh microcopy:
- Empty state leaderboard: "Belum ada mentee. Tambah mentee pertama yuk!"
- Empty state tugas (mentee view): "Belum ada tugas. Santai dulu 🌿"
- Success tambah poin: "+100 poin untuk Rina 🎉"
- Success kurangi poin: "-50 poin untuk Dani"
- Error login: "Username atau password salah. Coba lagi."
- Konfirmasi hapus: "Yakin hapus [nama]? Semua datanya bakal ikut hilang."
- Rare task label: "RARE ✨"
- Deadline warning (H-1): "Deadline besok!"
- Deadline overdue: "Lewat deadline ⚠️"

## Icon Set

`lucide-react` sebagai default. Mapping ikon utama:

| Konteks | Ikon | Size |
|---------|------|------|
| Leaderboard | `Trophy` | 20px |
| Tugas | `ClipboardList` | 20px |
| Buku | `BookOpen` | 20px |
| Profil | `User` | 20px |
| Dashboard (admin) | `LayoutDashboard` | 20px |
| Mentee (admin) | `Users` | 20px |
| Tambah | `Plus` | 16px |
| Hapus | `Trash2` | 16px |
| Centang | `Check` | 16px |
| Rare star | `Sparkles` | 14px |
| Growth: Benih | `Sprout` | 16px |
| Growth: Mekar | `Flower2` | 16px |
| Logout | `LogOut` | 16px |
| Deadline warning | `Clock` | 14px |

## Responsiveness

- **Mobile-first.** Ini yang utama — mentee buka di HP.
- Breakpoint utama:
  - Default (< 640px): single column, bottom nav, card list vertical
  - `sm` (640px): masih single column tapi padding lebih longgar
  - `md` (768px): desktop layout muncul — sidebar admin / top nav mentee, content area lebih lebar
  - `lg` (1024px): max content width tercapai, centered
- Semua interactive element minimum tap target 44×44px di mobile.
- Bottom nav di mobile (admin dan mentee), sidebar/top nav di desktop.
- Form input dan button full-width di mobile, auto-width di desktop.

## Page Layout Skeleton

### Mobile (< 768px)

```
┌──────────────────────┐
│  Page Header (sticky) │
├──────────────────────┤
│                      │
│   Content Area       │
│   (scrollable)       │
│                      │
│   Cards / Lists      │
│   stacked vertical   │
│                      │
├──────────────────────┤
│  Bottom Nav (fixed)  │
└──────────────────────┘
```

### Desktop (≥ 768px) — Admin

```
┌─────────┬──────────────────────────────┐
│         │  Page Header                 │
│ Sidebar │──────────────────────────────│
│  (nav)  │                              │
│         │  Content Area                │
│  240px  │  max-w-4xl centered          │
│         │                              │
│         │  Cards / Tables              │
└─────────┴──────────────────────────────┘
```

### Desktop (≥ 768px) — Mentee

```
┌──────────────────────────────────────────┐
│  Top Nav (Logo + nav links + avatar)     │
├──────────────────────────────────────────┤
│                                          │
│  Content Area                            │
│  max-w-lg centered (focused reading)     │
│                                          │
│  Leaderboard / Tasks / Books             │
│                                          │
└──────────────────────────────────────────┘
```
