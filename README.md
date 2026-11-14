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

## Struktur kode

- `index.html`: portal (token, username, NIM, pilih kasus).
- `play.html?kasus=<semesta>/<kasus>`: halaman game, memuat modul kasus secara dinamis.
- `core/engine.js`: mesin umum (dunia kanvas, input, dialog, Lensa, papan bukti, tuduhan, skor, jaringan).
- `core/net.js`: Supabase RPC dan sesi; `core/style.css`: gaya bersama.
- `cases/<semesta>/<kasus>.js`: data dan aturan satu kasus (`export default function create(E)`).
- `cases/daftar.js`: daftar kasus untuk portal.

Menambah kasus: buat modul baru di `cases/`, daftarkan di `cases/daftar.js`.
Uji lokal: `python3 -m http.server` (modul ES tidak jalan lewat `file://`).

## Tujuh semesta

| Semesta | Kasus | Konsep turunan | Aksi utama |
|---|---|---|---|
| 1 Jalan Raya | Tilang Salah Alamat | kecepatan sesaat, limit, pangkat, tanda turunan | Lensa garis potong ke singgung, Lintasan Uji |
| 2 Lemparan | Benda di Atas Pasar | puncak h′ = 0, selisih, linear, simetri | ketapel rekonstruksi, tangkap dalam gelap |
| 3 Warung dan Pasar | Cabai Dua Kali Lipat | perkalian, pembagian, kebalikan | papan lapak R = p·q, rata-rata U/G |
| 4 Kebun dan Kolam | Kolam Menghijau | eksponen, ln, akar | arsip drone, jadwal aerator, umur bercak |
| 5 Pantai dan Taman Hiburan | Foto dari Bianglala | sin, cos, tan, uji turunan pertama | rekonstruksi sudut, rem dalam gelap |
| 6 Bengkel Roda Gigi | Mesin yang Mengamuk | aturan rantai | engkol mesin, kejar sepeda pilih gigi |
| 7 Teknik | Lab yang Terbakar | gabungan (RC, daya, pendinginan) | replika meja, bank kapasitor |

Kit bersama untuk modul kasus: `core/kit.js` (bangunan, pohon, panel, tombol, panah, grafik kecil).

## Teori per kasus

Modul kasus mengekspor `THEORY` (kartu berisi judul dan HTML) dan `THEORY_START`.
Panggil `teori('id')` saat aksi terkait terjadi; kartu terbuka, tombol Teori diberi tanda "baru".

## Lobi Integral (prototipe untuk audit)

`integral/index.html` adalah prototipe lobi 3D multipemain untuk game integral. Isinya satu lobi low-poly, tim, dan satu pos (Pos 1, Tambal Waduk).

- `integral/lobi.js`: dunia 3D (Three.js), avatar, joystick sentuh, panel audit.
- `integral/rt.js`: Supabase Realtime (presence dan broadcast). Jika server tidak terjangkau, turun ke mode luring antar-tab.
- `integral/pos1.js`: Tambal Waduk, kanvas tim bersama.
- `integral/vendor/`: Three.js dan supabase-js, disalin agar tidak bergantung pada CDN.
- Uji: `python3 tests/lobi.py` (mode luring, `?lokal=1`).

Panel audit (tombol Audit) menampilkan FPS, ping, jumlah pemain, dan pesan per detik, lalu "Salin laporan" untuk dikumpulkan dari HP mahasiswa.
Jeda kirim posisi menyesuaikan jumlah pemain agar tetap di bawah batas pesan paket gratis Supabase Realtime.
Belum ada: panel dosen, pos 2 sampai 6, pemeriksaan skor di server.
