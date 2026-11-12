# Kasus Turunan

Game detektif untuk belajar turunan (kalkulus) lewat penyelidikan kasus di kampung.

**Semesta 1: Jalan Raya. Kasus 1: Tilang Salah Alamat**

Pemain menjelajahi kampung, mengumpulkan bukti, dan memakai "Lensa" (grafik jarak terhadap waktu)
untuk membedakan kecepatan rata-rata (garis potong) dari kecepatan sesaat (garis singgung, turunan).

## Menjalankan

Satu berkas statis. Buka `index.html` di peramban, atau pakai GitHub Pages.

Kontrol: WASD atau panah untuk jalan, Shift jalan pelan, E bicara atau periksa, B papan bukti.
Layar sentuh: joystick di setengah kiri, ketuk setengah kanan untuk aksi.

## Rencana

Portal kelas dengan token sesi, dashboard dosen, ranking, dan kasus-kasus berikutnya.

## Pemasangan Supabase (sekali saja)

1. Supabase > SQL Editor > New query > tempel isi `supabase/schema.sql` > Run.
2. Authentication > Sign In / Providers: matikan **Allow new users to sign up**.
3. Authentication > Users > Add user: buat akun dosen (email dan kata sandi).
4. Buka `dashboard.html`, masuk, buat sesi, bagikan tokennya.
5. Mahasiswa membuka `index.html`, memasukkan token, username, dan NIM.

Kunci yang ada di kode adalah publishable key, memang aman terlihat publik. **Secret key jangan pernah ditaruh di repo ini.**

## Model keamanan

- Mahasiswa tidak punya akses langsung ke tabel. Semua lewat fungsi `masuk`, `simpan_hasil`, `ranking`, `status_token`.
- NIM berfungsi sebagai PIN dan hanya terbaca oleh dosen pemilik sesi (Row Level Security).
- Satu NIM = satu akun, username unik.
- Skor dihitung di peramban dan dibatasi maksimal 1000 oleh server. Belum cukup untuk penilaian bertaruhan tinggi; verifikasi skor di server adalah pekerjaan lanjutan.
