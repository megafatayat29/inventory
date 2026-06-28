# RAKFAT

RAKFAT adalah aplikasi web untuk mengelola proses penitipan barang di gudang secara terstruktur. Aplikasi ini menyediakan alur dari pengisian form penitipan oleh pengguna publik, proses verifikasi dan penempatan barang oleh admin gudang, hingga pelacakan lokasi rak menggunakan QR Code.

## Ringkasan Aplikasi

Aplikasi ini dibangun menggunakan React, TypeScript, Vite, dan Supabase. Fokus utamanya adalah membantu tim gudang mengatur:

- form penitipan barang dari pengguna publik
- antrian penitipan yang menunggu diproses admin
- penempatan barang ke lokasi rak tertentu
- pencetakan dan pemindaian QR Code untuk rak dan form penitipan
- proses pengambilan barang kembali oleh pemilik
- manajemen akun admin warehouse

## Fitur Utama

- Form penitipan barang publik dengan alur yang sederhana
- Halaman detail penitipan yang bisa diakses lewat QR Code
- Dashboard admin untuk melihat ringkasan data penitipan dan kapasitas rak
- Daftar penitipan masuk yang menunggu penempatan
- Penempatan penitipan ke slot rak yang tersedia
- Dashboard rak dan cetak QR Code rak
- Form pengembalian barang dari gudang
- QR Code untuk form penitipan publik dan halaman detail rak
- Integrasi autentikasi dan data dengan Supabase

## Teknologi yang Digunakan

- React 19
- TypeScript
- Vite
- React Router DOM
- Tailwind CSS
- Supabase
- Lucide React
- SweetAlert2
- qrcode.react
- xlsx

## Struktur Proyek

```text
src/
  components/      # UI halaman dan komponen
  services/        # logika bisnis dan pemanggilan Supabase
  dto/             # tipe data untuk domain aplikasi
  lib/             # konfigurasi client Supabase
  utils/           # helper utilitas
```

## Prasyarat

Pastikan perangkat Anda sudah memiliki:

- Node.js 18+ (disarankan 20+)
- npm atau pnpm
- Akun Supabase yang sudah siap

## Cara Install untuk Orang yang Baru Clone

1. Clone repository ini

```bash
git clone <repository-url>
cd rakfat
```

2. Install dependency

```bash
npm install
```

3. Buat file environment untuk konfigurasi Supabase

```bash
cp .env.example .env.local
```

Jika file .env.example belum ada, buat file .env.local secara manual dengan isi berikut:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Jalankan aplikasi di mode development

```bash
npm run dev
```

Setelah itu, buka browser ke alamat yang ditampilkan oleh Vite, biasanya:

```text
http://localhost:5173
```

## Build untuk Production

```bash
npm run build
```

Untuk melihat hasil build lokal:

```bash
npm run preview
```

## Konfigurasi Supabase yang Diperlukan

Aplikasi ini mengandalkan Supabase untuk:

- autentikasi admin
- penyimpanan data penitipan dan rak
- pemrosesan data melalui RPC/function tertentu
- upload foto penempatan jika fitur foto digunakan

Pastikan project Supabase Anda sudah memiliki:

- tabel/data yang sesuai dengan kebutuhan aplikasi
- autentikasi pengguna admin
- env var yang benar
- storage bucket yang dibutuhkan jika fitur upload foto aktif

## Alur Penggunaan Singkat

- Pengguna membuka halaman form penitipan publik
- Setelah submit, data masuk ke sistem sebagai request penitipan baru
- Admin membuka panel admin untuk melihat request yang masuk
- Admin menempatkan penitipan ke lokasi rak dan bisa mencetak QR Code
- Pengguna bisa memantau status penitipan lewat QR Code yang diberikan
- Saat barang diambil, admin bisa memproses return flow

## Catatan Tambahan

Jika aplikasi menampilkan error terkait Supabase saat pertama kali dijalankan, biasanya penyebabnya adalah:

- variabel environment belum diisi
- URL atau anon key salah
- project Supabase belum dikonfigurasi sesuai kebutuhan aplikasi
