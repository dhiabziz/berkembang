# 03 — Use Cases (EARS Notation)

Setiap use case pakai notasi EARS (Easy Approach to Requirements Syntax).

Format singkat 5 pola:
- **Ubiquitous:** `The <system> shall <response>.`
- **Event-driven:** `When <trigger>, the <system> shall <response>.`
- **State-driven:** `While <state>, the <system> shall <response>.`
- **Optional:** `Where <feature>, the <system> shall <response>.`
- **Unwanted:** `If <condition>, then the <system> shall <response>.`

---

## UC-01: Admin Login

**Actor:** Admin (mentor)

**Precondition:** Admin belum memiliki session aktif. Halaman `/login` ditampilkan.

**Postcondition (success):** Session cookie ter-set, admin di-redirect ke `/admin/dashboard`.

**Postcondition (failure):** Tetap di halaman `/login`, ditampilkan pesan error.

**Main Flow (EARS):**
1. When admin mengisi field username dan password lalu submit form login, the system shall memvalidasi bahwa kedua field terisi.
2. When validasi client-side lolos, the Server Action shall mencari user dengan username tersebut di tabel `users`.
3. When user ditemukan dan role-nya `admin`, the Server Action shall memverifikasi password dengan `bcrypt.compare`.
4. When password cocok, the Server Action shall membuat session cookie via `iron-session` berisi `{ userId, username, role }`.
5. When session cookie berhasil di-set, the system shall me-redirect admin ke `/admin/dashboard`.

**Alternate Flow (EARS):**
- If username tidak ditemukan di database, then the system shall menampilkan pesan "Username atau password salah" (tidak spesifik mana yang salah).
- If password tidak cocok, then the system shall menampilkan pesan "Username atau password salah".
- If field username atau password kosong, then the frontend shall menampilkan inline error "Wajib diisi."

**Fulfills:** FR-01, FR-06

**UI Reference:** Login page — form sederhana (username + password + submit button), centered di layar, branding "ber-kembang" di atas form.

---

## UC-02: Mentee Login

**Actor:** Mentee

**Precondition:** Mentee belum memiliki session aktif. Halaman `/login` ditampilkan.

**Postcondition (success):** Session cookie ter-set, mentee di-redirect ke `/leaderboard`.

**Postcondition (failure):** Tetap di halaman `/login`, ditampilkan pesan error.

**Main Flow (EARS):**
1. When mentee mengisi field username dan password lalu submit form login, the system shall memvalidasi bahwa kedua field terisi.
2. When validasi client-side lolos, the Server Action shall mencari user dengan username tersebut di tabel `users`.
3. When user ditemukan dan role-nya `mentee`, the Server Action shall memverifikasi password dengan `bcrypt.compare`.
4. When password cocok, the Server Action shall membuat session cookie via `iron-session` berisi `{ userId, username, role }`.
5. When session cookie berhasil di-set, the system shall me-redirect mentee ke `/leaderboard`.

**Alternate Flow (EARS):**
- If username tidak ditemukan di database, then the system shall menampilkan pesan "Username atau password salah."
- If password tidak cocok, then the system shall menampilkan pesan "Username atau password salah."

**Fulfills:** FR-02, FR-06

**UI Reference:** Sama dengan UC-01 — login page yang sama, routing berbeda berdasarkan role.

---

## UC-03: Logout

**Actor:** Admin atau Mentee

**Precondition:** User memiliki session aktif.

**Postcondition (success):** Session cookie dihapus, user di-redirect ke `/login`.

**Main Flow (EARS):**
1. When user mengklik tombol "Keluar" di navigasi, the Server Action shall menghapus session cookie via `iron-session.destroy()`.
2. When session berhasil dihapus, the system shall me-redirect user ke `/login`.

**Fulfills:** FR-03

---

## UC-04: Mentee Ganti Password

**Actor:** Mentee

**Precondition:** Mentee memiliki session aktif. Halaman profil/settings ditampilkan.

**Postcondition (success):** Password mentee di database ter-update.

**Postcondition (failure):** Password tidak berubah, pesan error ditampilkan.

**Main Flow (EARS):**
1. When mentee mengisi form ganti password (password lama, password baru, konfirmasi password baru) lalu submit, the frontend shall memvalidasi bahwa password baru dan konfirmasi cocok.
2. When validasi client-side lolos, the Server Action shall memverifikasi password lama dengan `bcrypt.compare` terhadap hash di database.
3. When password lama cocok, the Server Action shall meng-hash password baru dengan `bcrypt.hash` dan meng-update di tabel `users`.
4. When update berhasil, the system shall menampilkan toast "Password berhasil diubah."

**Alternate Flow (EARS):**
- If password lama tidak cocok, then the system shall menampilkan pesan "Password lama salah."
- If password baru dan konfirmasi tidak cocok, then the frontend shall menampilkan inline error "Password baru tidak cocok."
- If password baru kurang dari 4 karakter, then the frontend shall menampilkan inline error "Password minimal 4 karakter."

**Fulfills:** FR-04

---

## UC-05: Admin Reset Password Mentee

**Actor:** Admin

**Precondition:** Admin memiliki session aktif. Halaman manajemen mentee ditampilkan.

**Postcondition (success):** Password mentee di database ter-update ke password baru yang ditentukan admin.

**Main Flow (EARS):**
1. When admin mengklik "Reset Password" pada card mentee tertentu, the system shall menampilkan dialog input password baru.
2. When admin mengisi password baru lalu submit, the Server Action shall meng-hash password baru dengan `bcrypt.hash` dan meng-update di tabel `users` untuk mentee tersebut.
3. When update berhasil, the system shall menampilkan toast "Password [nama mentee] berhasil direset."

**Fulfills:** FR-05

---

## UC-06: Admin Tambah Mentee

**Actor:** Admin

**Precondition:** Admin memiliki session aktif. Halaman manajemen mentee ditampilkan.

**Postcondition (success):** Mentee baru tersimpan di tabel `users`.

**Main Flow (EARS):**
1. When admin mengklik "Tambah Mentee" dan mengisi form (username, password), the frontend shall memvalidasi bahwa kedua field terisi dan username minimal 2 karakter.
2. When validasi lolos, the Server Action shall mengecek apakah username sudah ada di database (case-insensitive).
3. When username unik, the Server Action shall meng-hash password dengan `bcrypt.hash` dan meng-insert row baru di tabel `users` dengan role `mentee`.
4. When insert berhasil, the system shall menampilkan toast "Mentee [username] berhasil ditambahkan" dan me-refresh daftar mentee.

**Alternate Flow (EARS):**
- If username sudah ada di database, then the system shall menampilkan pesan "Username sudah dipakai."

**Fulfills:** FR-07

---

## UC-07: Admin Hapus Mentee

**Actor:** Admin

**Precondition:** Admin memiliki session aktif. Minimal satu mentee terdaftar.

**Postcondition (success):** Mentee dan semua data terkait terhapus dari database.

**Main Flow (EARS):**
1. When admin mengklik "Hapus" pada card mentee tertentu, the system shall menampilkan dialog konfirmasi "Yakin hapus [nama]? Semua data (poin, tugas, buku) akan ikut terhapus."
2. When admin mengkonfirmasi, the Server Action shall menghapus row mentee dari tabel `users` (cascade delete menghapus data terkait).
3. When delete berhasil, the system shall menampilkan toast "Mentee [nama] berhasil dihapus" dan me-refresh daftar mentee.

**Fulfills:** FR-08

---

## UC-08: Mentee Upload Foto Profil

**Actor:** Mentee

**Precondition:** Mentee memiliki session aktif. Halaman profil ditampilkan.

**Postcondition (success):** Foto profil ter-upload ke Supabase Storage dan URL tersimpan di tabel `users`.

**Main Flow (EARS):**
1. When mentee mengklik area foto profil dan memilih file gambar, the frontend shall memvalidasi format (JPEG/PNG/WebP) dan ukuran (max 2MB).
2. When validasi lolos, the frontend shall mengkompresi/resize gambar ke max 500KB.
3. When kompresi selesai, the Server Action shall meng-upload file ke Supabase Storage bucket `avatars` dengan path `{userId}.{ext}`.
4. When upload berhasil, the Server Action shall meng-update kolom `avatar_url` di tabel `users`.
5. When update berhasil, the system shall menampilkan foto baru dan toast "Foto profil berhasil diubah."

**Alternate Flow (EARS):**
- If file bukan format yang didukung, then the frontend shall menampilkan pesan "Format file harus JPEG, PNG, atau WebP."
- If file lebih dari 2MB, then the frontend shall menampilkan pesan "Ukuran file maksimal 2MB."
- If upload ke Supabase gagal, then the system shall menampilkan toast error "Gagal upload foto. Coba lagi."

**Fulfills:** FR-09, FR-10

---

## UC-09: Admin Tambah Log Poin

**Actor:** Admin

**Precondition:** Admin memiliki session aktif. Minimal satu mentee terdaftar.

**Postcondition (success):** Log poin baru tersimpan di tabel `point_logs`. Total poin mentee ter-update.

**Main Flow (EARS):**
1. When admin membuka halaman log poin untuk mentee tertentu dan mengklik "Tambah Log," the system shall menampilkan form input (deskripsi, jumlah poin).
2. When admin mengisi form dan submit, the frontend shall memvalidasi bahwa deskripsi terisi dan poin adalah angka integer (bisa negatif).
3. When validasi lolos, the Server Action shall meng-insert row baru di tabel `point_logs` dengan `mentee_id`, `description`, `points`, `created_at`.
4. When insert berhasil, the Server Action shall meng-update `total_points` di tabel `users` (increment/decrement).
5. When update berhasil, the system shall menampilkan toast "+[N] poin untuk [nama]" atau "-[N] poin untuk [nama]" dan me-refresh daftar log.

**Fulfills:** FR-11, FR-13, FR-14

---

## UC-10: Admin Hapus Log Poin

**Actor:** Admin

**Precondition:** Admin memiliki session aktif. Minimal satu log poin ada.

**Postcondition (success):** Log poin terhapus. Total poin mentee ter-update (dikurangi/ditambah balik).

**Main Flow (EARS):**
1. When admin mengklik ikon hapus pada log poin tertentu, the system shall menampilkan dialog konfirmasi "Hapus log ini? Poin akan disesuaikan."
2. When admin mengkonfirmasi, the Server Action shall mengambil nilai `points` dari log yang akan dihapus.
3. When nilai didapat, the Server Action shall menghapus row dari `point_logs` dan meng-update `total_points` di `users` (mengurangi jika poin positif, menambah jika poin negatif).
4. When operasi berhasil, the system shall menampilkan toast "Log poin berhasil dihapus" dan me-refresh tampilan.

**Fulfills:** FR-12, FR-13

---

## UC-11: Lihat Leaderboard

**Actor:** Admin atau Mentee

**Precondition:** User memiliki session aktif.

**Postcondition:** Halaman leaderboard ditampilkan dengan ranking mentee.

**Main Flow (EARS):**
1. When user membuka halaman `/leaderboard`, the Server Component shall meng-query tabel `users` WHERE role = `mentee`, ORDER BY `total_points` DESC.
2. The system shall menampilkan card untuk setiap mentee berisi: posisi ranking, foto profil (atau avatar default), nama panggilan, total poin, dan level pertumbuhan (Benih/Tunas/Kuncup/Mekar/Mekar Penuh).
3. The system shall menampilkan medali visual (emas/perak/perunggu) untuk posisi 1, 2, 3.

**Alternate Flow (EARS):**
- While user role adalah `mentee`, the system shall hanya mengizinkan klik detail log poin pada card miliknya sendiri.
- While user role adalah `admin`, the system shall mengizinkan klik detail log poin pada card mentee manapun.
- If belum ada mentee terdaftar, then the system shall menampilkan empty state "Belum ada mentee."

**Fulfills:** FR-15, FR-16, FR-17, FR-18, FR-32, FR-34

**UI Reference:** Leaderboard page — list/card layout mobile-first. Top 3 diberi highlight visual. Setiap card menampilkan avatar, nama, poin, dan badge level pertumbuhan.

---

## UC-12: Admin Buat Tugas Baru (Broadcast)

**Actor:** Admin

**Precondition:** Admin memiliki session aktif.

**Postcondition (success):** Tugas baru tersimpan dan ter-assign ke semua mentee yang saat ini terdaftar.

**Main Flow (EARS):**
1. When admin mengklik "Buat Tugas" dan mengisi form (judul, deskripsi opsional, deadline, tipe = broadcast), the frontend shall memvalidasi bahwa judul terisi dan deadline di masa depan.
2. When validasi lolos, the Server Action shall meng-insert row di tabel `tasks` dengan `type = 'broadcast'`, `is_archived = false`.
3. When insert berhasil, the Server Action shall meng-insert rows di `task_assignments` untuk setiap mentee yang saat ini terdaftar (role = `mentee`), dengan `status = 'pending'`.
4. When semua assignment berhasil, the system shall menampilkan toast "Tugas berhasil dibuat" dan me-refresh daftar tugas.

**Fulfills:** FR-19, FR-20

---

## UC-13: Admin Buat Special Task

**Actor:** Admin

**Precondition:** Admin memiliki session aktif.

**Postcondition (success):** Tugas baru tersimpan dan ter-assign hanya ke mentee yang dipilih.

**Main Flow (EARS):**
1. When admin mengklik "Buat Tugas" dan mengisi form (judul, deskripsi opsional, deadline, tipe = special, pilih mentee dari checklist), the frontend shall memvalidasi bahwa judul terisi, deadline di masa depan, dan minimal satu mentee dipilih.
2. When validasi lolos, the Server Action shall meng-insert row di tabel `tasks` dengan `type = 'special'`, `is_archived = false`.
3. When insert berhasil, the Server Action shall meng-insert rows di `task_assignments` hanya untuk mentee yang dipilih, dengan `status = 'pending'`.
4. When semua assignment berhasil, the system shall menampilkan toast "Special task berhasil dibuat" dan me-refresh daftar tugas.

**Fulfills:** FR-19, FR-21, FR-22, FR-33

---

## UC-14: Admin Centang Tugas Mentee

**Actor:** Admin

**Precondition:** Admin memiliki session aktif. Ada tugas aktif (non-archived) dengan mentee yang belum mengumpulkan.

**Postcondition (success):** Status assignment mentee berubah ke `submitted`.

**Main Flow (EARS):**
1. When admin membuka detail tugas dan mengklik centang di samping nama mentee, the Server Action shall meng-update `task_assignments` SET `status = 'submitted'`, `submitted_at = NOW()` WHERE `task_id` dan `mentee_id` sesuai.
2. When update berhasil, the system shall me-refresh tampilan — mentee yang dicentang terlihat sebagai "Sudah mengumpulkan."

**Fulfills:** FR-23

---

## UC-15: Admin Archive Tugas

**Actor:** Admin

**Precondition:** Admin memiliki session aktif. Ada tugas aktif.

**Postcondition (success):** Tugas berstatus archived — tidak muncul di daftar aktif.

**Main Flow (EARS):**
1. When admin mengklik "Archive" pada tugas tertentu, the Server Action shall meng-update `tasks` SET `is_archived = true` WHERE `id` sesuai.
2. When update berhasil, the system shall menampilkan toast "Tugas berhasil diarsipkan" dan menghilangkan tugas dari daftar aktif.

**Fulfills:** FR-24

---

## UC-16: Mentee Lihat Daftar Tugas

**Actor:** Mentee

**Precondition:** Mentee memiliki session aktif.

**Postcondition:** Daftar tugas aktif yang ter-assign ke mentee ditampilkan.

**Main Flow (EARS):**
1. When mentee membuka halaman tugas, the Server Component shall meng-query `task_assignments` JOIN `tasks` WHERE `mentee_id = session.userId` AND `tasks.is_archived = false`, ORDER BY `tasks.deadline` ASC.
2. The system shall menampilkan card untuk setiap tugas berisi: judul, deskripsi, deadline, status pengumpulan mentee ini, dan daftar nama mentee lain beserta status mereka.
3. Where task type adalah `special`, the system shall menampilkan card dengan visual "rare" — border glow, warna emas/ungu, label "RARE."

**Fulfills:** FR-22, FR-25, FR-33

---

## UC-17: Mentee Lihat Arsip Tugas

**Actor:** Mentee

**Precondition:** Mentee memiliki session aktif.

**Main Flow (EARS):**
1. When mentee membuka halaman arsip tugas, the Server Component shall meng-query `task_assignments` JOIN `tasks` WHERE `mentee_id = session.userId` AND `tasks.is_archived = true`, ORDER BY `tasks.deadline` DESC.
2. The system shall menampilkan daftar tugas yang sudah di-archive beserta status pengumpulan mentee.

**Fulfills:** FR-26

---

## UC-18: Admin Catat Peminjaman Buku

**Actor:** Admin

**Precondition:** Admin memiliki session aktif.

**Postcondition (success):** Peminjaman buku baru tercatat di tabel `book_lendings`.

**Main Flow (EARS):**
1. When admin mengklik "Catat Peminjaman" dan mengisi form (pilih mentee, judul buku, upload foto cover, deadline pengembalian), the frontend shall memvalidasi semua field terisi, foto format JPEG/PNG/WebP max 2MB, dan deadline di masa depan.
2. When validasi lolos, the frontend shall mengkompresi foto cover ke max 500KB.
3. When kompresi selesai, the Server Action shall meng-upload foto ke Supabase Storage bucket `book-covers` dengan path `{lendingId}.{ext}`.
4. When upload berhasil, the Server Action shall meng-insert row di `book_lendings` dengan `mentee_id`, `title`, `cover_image_url`, `deadline`, `status = 'active'`.
5. When insert berhasil, the system shall menampilkan toast "Peminjaman [judul buku] oleh [nama mentee] berhasil dicatat."

**Fulfills:** FR-27

---

## UC-19: Admin Centang Buku Dikembalikan

**Actor:** Admin

**Precondition:** Admin memiliki session aktif. Ada peminjaman aktif.

**Postcondition (success):** Status peminjaman berubah ke `returned`.

**Main Flow (EARS):**
1. When admin mengklik "Sudah Dikembalikan" pada entry peminjaman buku, the Server Action shall meng-update `book_lendings` SET `status = 'returned'`, `returned_at = NOW()` WHERE `id` sesuai.
2. When update berhasil, the system shall menampilkan toast "[Judul buku] berhasil ditandai dikembalikan" dan entry berpindah ke tampilan arsip.

**Fulfills:** FR-28

---

## UC-20: Mentee & Admin Lihat Daftar Peminjaman Buku

**Actor:** Admin atau Mentee

**Precondition:** User memiliki session aktif.

**Main Flow (EARS):**
1. When user membuka halaman peminjaman buku, the Server Component shall meng-query `book_lendings` JOIN `users` WHERE `status = 'active'`, ORDER BY `deadline` ASC.
2. The system shall menampilkan card untuk setiap peminjaman berisi: foto cover, judul buku, nama peminjam, deadline.
3. While user role adalah `admin`, the system shall menampilkan tombol "Sudah Dikembalikan" pada setiap card.

**Fulfills:** FR-29, FR-31

---

## UC-21: Mentee Lihat Arsip Peminjaman Buku

**Actor:** Mentee

**Precondition:** Mentee memiliki session aktif.

**Main Flow (EARS):**
1. When mentee membuka halaman arsip buku, the Server Component shall meng-query `book_lendings` WHERE `mentee_id = session.userId` AND `status = 'returned'`, ORDER BY `returned_at` DESC.
2. The system shall menampilkan daftar buku yang pernah dipinjam beserta tanggal peminjaman dan tanggal pengembalian.

**Fulfills:** FR-30

---

## UC-22: Route Protection

**Actor:** System (middleware)

**Precondition:** HTTP request masuk ke server.

**Main Flow (EARS):**
1. While user tidak memiliki session cookie yang valid, the middleware shall me-redirect semua request ke halaman selain `/login` ke `/login`.
2. While user memiliki session dengan role `mentee`, the middleware shall memblokir akses ke route `/admin/*` dan me-redirect ke `/leaderboard`.
3. While user memiliki session dengan role `admin`, the system shall mengizinkan akses ke semua route.

**Fulfills:** FR-06

---

## Coverage Matrix

| Functional Requirement | Diimplement oleh UC |
|------------------------|---------------------|
| FR-01 | UC-01 |
| FR-02 | UC-02 |
| FR-03 | UC-03 |
| FR-04 | UC-04 |
| FR-05 | UC-05 |
| FR-06 | UC-01, UC-02, UC-22 |
| FR-07 | UC-06 |
| FR-08 | UC-07 |
| FR-09 | UC-08 |
| FR-10 | UC-08, UC-11 |
| FR-11 | UC-09 |
| FR-12 | UC-10 |
| FR-13 | UC-09, UC-10 |
| FR-14 | UC-09 |
| FR-15 | UC-11 |
| FR-16 | UC-11 |
| FR-17 | UC-11 |
| FR-18 | UC-11 |
| FR-19 | UC-12, UC-13 |
| FR-20 | UC-12 |
| FR-21 | UC-13 |
| FR-22 | UC-13, UC-16 |
| FR-23 | UC-14 |
| FR-24 | UC-15 |
| FR-25 | UC-16 |
| FR-26 | UC-17 |
| FR-27 | UC-18 |
| FR-28 | UC-19 |
| FR-29 | UC-20 |
| FR-30 | UC-21 |
| FR-31 | UC-20 |
| FR-32 | UC-11 |
| FR-33 | UC-13, UC-16 |
| FR-34 | UC-11 |
