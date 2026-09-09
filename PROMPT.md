# PROMPT — Ber-kembang 🌱

Ini adalah master prompt untuk agen coding (Claude Code di VS Code). Paste isi file ini ke chat pertama kali, lalu minta agen untuk membaca semua file `01-*.md` sampai `06-*.md` di folder ini sebelum menulis kode apapun.

---

## Konteks Singkat

**Nama proyek:** Ber-kembang

**Elevator pitch:** Web app untuk mengelola poin aktivitas mentee dalam program mentoring "ber-kembang." Admin (mentor) bisa log poin, kelola tugas, track peminjaman buku, dan mentee bisa lihat leaderboard serta progress mereka — dengan gamification visual bertema botanical × card rarity.

**Status:** Green-field project, belum ada kode.

**Stack:** Next.js 15 (App Router) + TypeScript strict + Tailwind CSS + Supabase (DB + Storage, tanpa Supabase Auth) + iron-session + Vercel.

---

## Instruksi untuk Agen

1. **BACA DULU sebelum coding apapun**, secara berurutan:
   - `01-overview.md` — pahami problem & scope
   - `02-requirements.md` — daftar functional requirement
   - `03-use-cases.md` — skenario user dalam notasi EARS
   - `04-architecture.md` — struktur folder & boundary
   - `05-design-system.md` — token visual & pattern komponen
   - `06-tech-stack.md` — dependencies + setup Supabase step-by-step

2. **Rencanakan sebelum coding.** Setelah baca semua file, ringkas:
   - Fitur mana yang mau dibangun pertama?
   - Struktur folder awal yang mau dibuat?
   - Dependency yang mau di-install?
   - Tanyakan konfirmasi sebelum eksekusi.

3. **Ikuti struktur folder** di `04-architecture.md`. Jangan bikin file di luar struktur itu tanpa konfirmasi.

4. **Ikuti design system** di `05-design-system.md`. Semua warna, spacing, tipografi harus mengacu ke token di sana — jangan hard-code hex/px baru.

5. **Ikuti notasi EARS** di `03-use-cases.md` sebagai sumber kebenaran perilaku. Setiap kali implement satu use case, tandai use case-nya di komentar kode: `// UC-01: Admin Login`.

6. **Cross-reference requirement.** Kalau nulis komponen yang implement `FR-05`, tulis di komentar: `// implements FR-05`.

7. **Auth pattern penting:** Proyek ini TIDAK pakai Supabase Auth. Auth dihandle manual:
   - Password hash pakai `bcrypt`
   - Session management pakai `iron-session` (cookie-based, server-side only)
   - Semua akses database pakai Supabase **service role key** (server-side only)
   - TIDAK ada RLS — proteksi akses via Next.js middleware + server-side session check
   - Anon key TIDAK dipakai — semua query lewat service role key di Server Actions / Route Handlers

8. **Supabase Storage:** Pakai untuk upload foto profil mentee dan cover buku. Bucket policy di-set public read, authenticated write via service role key.

9. **Guardrails:**
   - Sebelum operasi destructive (delete file, drop migration, force push), tanya konfirmasi.
   - Kalau ada requirement yang bertentangan / ambigu, tanya user, jangan asumsi.
   - Kalau ada label `[NEEDS CONFIRMATION]` di file spec, tanya user sebelum implement.
   - Jangan tulis kode yang tidak mengimplement salah satu FR / UC di spec.

10. **Kalau butuh library baru** yang belum ada di `06-tech-stack.md`, propose ke user dulu (nama package, alasan, alternative).

---

## Deliverable Iterasi Pertama

Setelah semua file di-baca dan rencana disetujui, mulai dari:

1. Scaffold Next.js project (`npx create-next-app@latest --typescript --tailwind --app --eslint --src-dir=false`).
2. Install dependencies: `@supabase/supabase-js`, `iron-session`, `bcrypt`, `@types/bcrypt`, `zod`, `lucide-react`.
3. Setup `lib/supabase/admin.ts` (service role client — server-only).
4. Setup `lib/auth/session.ts` (iron-session config) + root `middleware.ts`.
5. Setup Tailwind config extend sesuai `05-design-system.md`.
6. Implement UC-01 (Admin Login) sebagai vertical slice untuk validasi setup.

Setelah UC-01 jalan end-to-end (dari UI → Server Action → bcrypt verify → iron-session set → redirect ke dashboard), lanjut UC-02 dst.

---

## Catatan

- Semua file spec di folder ini adalah **living document** — user boleh update kapan saja. Kalau ada konflik antara instruksi user di chat vs file spec, tanya klarifikasi.
- Bahasa komentar kode: bahasa Indonesia casual OK, tapi identifier variabel/fungsi tetap English.
- Mobile-first design. Utamanya web ini dibuka di HP, tapi harus responsif ke desktop juga.
- Supabase free tier — jangan pakai fitur yang butuh plan berbayar (Realtime, Edge Functions, dll). Pakai hanya Database (Postgres) + Storage.
