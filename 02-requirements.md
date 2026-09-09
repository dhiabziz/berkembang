# 02 — Requirements

## Functional Requirements

### Auth & Session

- **FR-01:** Sistem harus mengizinkan admin login dengan username `admin` dan password yang telah ditentukan.
- **FR-02:** Sistem harus mengizinkan mentee login dengan username (nama panggilan) dan password yang diberikan admin.
- **FR-03:** Sistem harus mengizinkan user logout dan menghapus session cookie.
- **FR-04:** Sistem harus mengizinkan mentee mengganti password mereka sendiri (input password lama + password baru).
- **FR-05:** Sistem harus mengizinkan admin mereset password mentee ke password baru yang ditentukan admin.
- **FR-06:** Semua halaman kecuali `/login` harus memerlukan session aktif — user tanpa session di-redirect ke `/login`.

### Mentee Management

- **FR-07:** Admin harus bisa menambah mentee baru dengan input: username (nama panggilan) dan password.
- **FR-08:** Admin harus bisa menghapus mentee (beserta semua data terkait: log poin, submissions, peminjaman buku).
- **FR-09:** Mentee harus bisa mengupload foto profil (format: JPEG, PNG, WebP; max 2MB).
- **FR-10:** Foto profil mentee harus ditampilkan di leaderboard dan di halaman profil. Jika belum upload, tampilkan avatar default (inisial nama).

### Point Logging

- **FR-11:** Admin harus bisa menambah log poin untuk mentee tertentu dengan input: deskripsi aktivitas (teks bebas) dan jumlah poin (integer, bisa positif atau negatif).
- **FR-12:** Admin harus bisa menghapus log poin yang sudah dibuat.
- **FR-13:** Total poin mentee dihitung sebagai SUM dari semua log poin mentee tersebut.
- **FR-14:** Setiap log poin menyimpan timestamp pembuatan (created_at) yang ditampilkan di detail log.

### Leaderboard

- **FR-15:** Sistem harus menampilkan halaman leaderboard yang berisi ranking semua mentee berdasarkan total poin (descending).
- **FR-16:** Leaderboard menampilkan: posisi ranking, foto profil, nama panggilan, dan total poin setiap mentee.
- **FR-17:** Mentee hanya bisa melihat detail log poin miliknya sendiri — klik nama mentee lain di leaderboard tidak membuka detail log.
- **FR-18:** Admin bisa melihat detail log poin semua mentee dari leaderboard.

### Task Management

- **FR-19:** Admin harus bisa membuat tugas baru dengan input: judul, deskripsi (opsional), deadline (tanggal), dan tipe (broadcast atau special).
- **FR-20:** Broadcast task otomatis ter-assign ke semua mentee yang terdaftar saat tugas dibuat.
- **FR-21:** Special task hanya ter-assign ke mentee yang dipilih admin saat pembuatan tugas.
- **FR-22:** Di sisi mentee, special task harus ditampilkan dengan visual "rare card" yang berbeda dari broadcast task — mentee bisa tau bahwa task itu khusus.
- **FR-23:** Admin harus bisa mencentang (mark as submitted) mentee yang sudah mengumpulkan tugas tertentu.
- **FR-24:** Admin harus bisa meng-archive tugas secara manual, terlepas dari status penyelesaian.
- **FR-25:** Mentee harus bisa melihat daftar tugas aktif beserta deadline dan status siapa saja yang sudah mengumpulkan.
- **FR-26:** Mentee harus bisa melihat arsip tugas yang sudah pernah mereka kerjakan.

### Book Lending

- **FR-27:** Admin harus bisa mencatat peminjaman buku baru dengan input: mentee yang meminjam, judul buku, foto cover buku (upload image, max 2MB), dan deadline pengembalian.
- **FR-28:** Admin harus bisa mencentang (mark as returned) buku yang sudah dikembalikan — status berubah dan entry masuk arsip.
- **FR-29:** Semua mentee harus bisa melihat daftar peminjaman buku aktif (siapa pinjam apa, deadline kapan).
- **FR-30:** Mentee harus bisa melihat arsip daftar buku yang pernah mereka pinjam.
- **FR-31:** Admin harus bisa melihat seluruh peminjaman buku (aktif dan arsip) semua mentee.

### Gamification Visual

- **FR-32:** Leaderboard harus menampilkan indikator visual yang membedakan tier ranking (misal: medali emas/perak/perunggu untuk top 3).
- **FR-33:** Special task harus ditampilkan dengan visual "rare card" — border glow, warna berbeda (emas/ungu), dan label "RARE" atau indikator khusus.
- **FR-34:** Mentee harus bisa melihat level pertumbuhan mereka berdasarkan milestone poin: Benih (0+) → Tunas (100+) → Kuncup (300+) → Mekar (600+) → Mekar Penuh (1000+).

## Business Rules

- **BR-01:** Hanya ada satu admin. Username admin adalah `admin`.
- **BR-02:** Username mentee harus unik (case-insensitive).
- **BR-03:** Poin mentee bisa negatif (total bisa di bawah nol jika banyak pengurangan).
- **BR-04:** Saat mentee dihapus, semua data terkait (log poin, task submissions, book lendings) ikut terhapus (cascade delete).
- **BR-05:** Saat mentee baru ditambahkan, mereka TIDAK otomatis ter-assign ke broadcast task yang sudah ada sebelumnya — hanya task yang dibuat setelah mereka terdaftar.
- **BR-06:** Tugas yang di-archive tidak muncul di daftar tugas aktif, tapi tetap bisa diakses di halaman arsip.
- **BR-07:** Buku yang sudah dikembalikan (status `returned`) tidak muncul di daftar peminjaman aktif, tapi tetap bisa diakses di halaman arsip.
- **BR-08:** Image upload (foto profil dan cover buku) harus dikompresi/resize di client-side sebelum upload ke Supabase Storage untuk menghemat kuota storage (target max 500KB setelah kompresi).

## Constraints (Functional)

- **CN-01:** Semua data disimpan di Supabase project region Singapore (Southeast Asia).
- **CN-02:** Supabase free tier — max 500MB database, max 1GB storage.
- **CN-03:** Tidak ada Supabase Auth — auth manual via bcrypt + iron-session.
- **CN-04:** Tidak ada Supabase Realtime — semua data update via page refresh atau revalidation.
- **CN-05:** Image hanya format JPEG, PNG, WebP. Max 2MB sebelum kompresi.
- **CN-06:** Semua timestamp ditampilkan dalam timezone Asia/Jakarta (WIB).

## Cross-Reference

Setiap FR di sini di-implement oleh minimal satu Use Case di `03-use-cases.md`. Lihat kolom "Fulfills" di setiap use case.
