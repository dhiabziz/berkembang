# 01 — Overview

## Nama Proyek

**Ber-kembang** 🌱 (dari kata "berkembang" — tema bunga/botanical)

## Elevator Pitch

Web app gamified untuk mengelola poin aktivitas, tugas, dan peminjaman buku mentee dalam program mentoring "ber-kembang." Mentor (admin) punya full control untuk log aktivitas dan track progress, sementara mentee bisa lihat leaderboard, cek tugas, dan pantau peminjaman buku — semua dibungkus visual botanical × card rarity yang bikin semangat berkompetisi dalam kebaikan.

## Problem Statement

Sebagai mentor dalam program "ber-kembang," pengelolaan poin aktivitas, tugas, dan peminjaman buku mentee masih dilakukan secara manual (spreadsheet, chat, catatan). Ini bikin beberapa masalah: (1) tracking progress mentee nggak real-time dan scattered, (2) mentee nggak bisa lihat standing mereka secara transparan dan menarik, (3) nggak ada mekanisme gamification yang bikin mentee semangat berkompetisi secara positif, (4) pengelolaan peminjaman buku dan deadline tugas rawan terlewat.

## Target User & Persona

### Primary Persona — Admin (Mentor)

- **Profil:** Satu orang mentor yang menjalankan program "ber-kembang"
- **Pain point:**
  - Tracking poin mentee manual dan tersebar di banyak tempat
  - Susah track siapa yang lagi pinjem buku apa dan kapan deadline-nya
  - Nggak bisa dengan mudah lihat siapa yang udah ngumpulin tugas dan siapa yang belum
- **Goal:**
  - Satu dashboard untuk kelola semua: poin, tugas, buku, dan data mentee
  - Bisa cepat input log poin (positif/negatif) per mentee
  - Bisa assign tugas (broadcast atau special) dan track penyelesaian
  - Bisa track peminjaman buku lengkap dengan foto dan deadline

### Secondary Persona — Mentee

- **Profil:** Anggota program mentoring (saat ini ~5 orang, bisa bertambah)
- **Pain point:**
  - Nggak tau standing poin mereka dibanding mentee lain
  - Nggak punya satu tempat untuk cek deadline tugas dan status peminjaman buku
- **Goal:**
  - Lihat leaderboard dan poin mereka secara transparan
  - Tau ada tugas/deadline apa yang pending
  - Lihat riwayat buku yang pernah dipinjam dan tugas yang pernah dikerjakan

## MVP Scope

Fitur yang MUST HAVE di rilis pertama:

1. **Auth System** — Login/logout untuk admin (username+password) dan mentee (username+password). Mentee bisa ganti password sendiri. Admin bisa reset password mentee.
2. **Mentee Management** — Admin bisa tambah, hapus mentee. Mentee bisa upload foto profil.
3. **Point Logging** — Admin bisa tambah log poin per mentee (deskripsi + jumlah poin positif/negatif). Admin bisa hapus log poin. Poin terakumulasi.
4. **Leaderboard** — Halaman leaderboard yang menampilkan ranking mentee berdasarkan total poin. Semua user bisa lihat. Detail log poin hanya bisa dilihat oleh pemilik akun (dan admin).
5. **Task Management** — Admin bisa bikin tugas (broadcast ke semua atau special task ke mentee tertentu). Admin bisa centang siapa yang sudah ngumpulin. Ada deadline. Bisa di-archive secara manual.
6. **Book Lending** — Admin bisa log peminjaman buku per mentee (foto cover, judul, deadline). Admin centang saat dikembalikan → masuk arsip.
7. **Archive View** — Mentee bisa lihat arsip tugas yang pernah dikerjakan dan buku yang pernah dipinjam.

## Out of Scope (Rilis Pertama)

- **Notification system** (push/email) — pertimbangkan di v2 kalau mentee mulai banyak
- **Multi-admin** — saat ini hanya satu admin
- **File attachment di tugas** — mentee ngumpulin tugas via channel lain (chat, dll), admin hanya centang di web
- **Dark mode** — bisa ditambah nanti
- **Export data** (CSV/PDF) — pertimbangkan di v2
- **Mentee bisa self-register** — hanya admin yang bisa tambah mentee

## Success Metrics

- Admin bisa input log poin dalam < 30 detik per entry
- Mentee login dan cek leaderboard + tugas dalam < 10 detik
- Zero missed book deadline karena sekarang tertrack di satu tempat
- Mentee merasa kompetitif (secara positif) karena leaderboard visible

## Constraints

- **Budget:** Rp 0 — semua gratisan (Supabase free tier, Vercel free tier)
- **Supabase free tier limits:** 500MB database, 1GB storage, project pause setelah 7 hari inactivity
- **Timeline:** Tidak ada deadline keras
- **Device priority:** Mobile-first (mentee buka di HP), responsif ke desktop (admin mungkin buka di laptop)

## Assumptions

- **Admin hanya satu orang** — tidak perlu multi-admin support `[CONFIRMED]`
- **Mentee saat ini ~5 orang** — leaderboard design optimized untuk 5-15 orang, tapi tidak ada hard limit `[CONFIRMED]`
- **Supabase Auth tidak dipakai** — auth manual pakai bcrypt + iron-session `[CONFIRMED]`
- **Timezone: Asia/Jakarta (WIB)** — semua deadline dan timestamp mengacu ke WIB `[NEEDS CONFIRMATION]`
- **Bahasa UI: Bahasa Indonesia** — semua label, placeholder, dan microcopy dalam Bahasa Indonesia `[NEEDS CONFIRMATION]`

## Glossary

- **Mentee:** Anggota program mentoring "ber-kembang" yang dibimbing oleh admin/mentor
- **Admin:** Mentor / pengelola program — satu orang, punya akses penuh
- **Log Poin:** Satu entry catatan aktivitas mentee yang berisi deskripsi + jumlah poin (bisa positif atau negatif)
- **Broadcast Task:** Tugas yang diberikan ke semua mentee
- **Special Task:** Tugas yang hanya diberikan ke satu atau beberapa mentee tertentu — ditampilkan dengan visual "rare card"
- **Archive:** Data yang sudah selesai (tugas sudah dikumpulkan semua atau buku sudah dikembalikan) — tetap tersimpan di database tapi dipisahkan dari tampilan aktif
- **Rarity Tier:** Sistem visual gamification untuk membedakan task biasa (Regular) dan task khusus (Rare) — terinspirasi dari koleksi kartu
