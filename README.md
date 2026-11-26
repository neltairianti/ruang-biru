# Ruang Biru

Ruang Biru adalah situs untuk mengirim lagu dan pesan lewat satu tautan. Pilih lagu, tulis alasan kamu mengirimnya, lalu bagikan Gema ke orang yang kamu tuju.

## Fitur

- **Kirim Gema** lewat tautan yang langsung membuka halaman lagu dan pesan.
- **Cari nama penerima** untuk menemukan Gema yang sudah bisa dibuka.
- **Jadwalkan waktu buka**. Penerima bisa membuka tautannya lebih awal untuk melihat tanggal buka. Lagu dan pesan tersedia mulai pukul 00.00 WIB pada tanggal yang dipilih.
- **Balas dengan lagu**. Tautan balasan menampilkan lagu dan pesan balasan bersama Gema awal.
- **Lihat riwayat kiriman** yang tersimpan di browser tempat kamu membuat Gema.
- **Dengarkan lagu** lewat pemutar Spotify atau Apple Music, sesuai lagu yang tersedia.

## Teknologi

| Folder | Teknologi |
| --- | --- |
| [`frontend/`](frontend/) | Next.js, React, TypeScript, dan Tailwind CSS |
| [`backend/`](backend/) | Laravel, PHP, dan PostgreSQL |

## Menjalankan secara lokal

Siapkan Git, Node.js 20.9 atau lebih baru, npm, PHP 8.4 dengan ekstensi `pdo_pgsql`, Composer, dan PostgreSQL.

```bash
git clone https://github.com/neltairianti/ruang-biru.git
cd ruang-biru
```

### 1. Jalankan API Laravel

Buat database PostgreSQL bernama `ruang_biru`, lalu jalankan perintah berikut dari root proyek.

```bash
cd backend
composer install
cp .env.example .env
```

Di PowerShell, gunakan `Copy-Item .env.example .env` untuk menyalin file konfigurasi.

Sesuaikan `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, dan `DB_PASSWORD` di `backend/.env` dengan konfigurasi PostgreSQL kamu. Isi `SPOTIFY_CLIENT_ID` dan `SPOTIFY_CLIENT_SECRET` jika ingin mengaktifkan pencarian katalog Spotify.

```bash
php artisan key:generate
php artisan migrate --seed
php artisan serve --host=127.0.0.1 --port=8001
```

### 2. Jalankan frontend Next.js

Buka terminal kedua di root proyek. Buat file `frontend/.env.local` dengan isi berikut.

```dotenv
NEXT_PUBLIC_API_URL=http://127.0.0.1:8001/api
```

```bash
cd frontend
npm ci
npm run dev
```

Buka [http://localhost:3002](http://localhost:3002). Untuk mencoba kirim Gema, klik **Buat gema**, pilih lagu, lalu salin tautan dari popup setelah Gema berhasil dibuat.

Untuk berbagi Gema ke perangkat lain, gunakan URL frontend yang bisa diakses penerima dan arahkan `NEXT_PUBLIC_API_URL` ke API yang bisa dijangkau dari deployment tersebut.
