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

## Lobi Integral (prototipe v2 untuk audit)

`integral/index.html` adalah prototipe lobi 3D multipemain untuk game integral. Isinya satu lobi low-poly, delapan tim, karakter kustom, dan satu pos (Pos 1, Tambal Waduk) yang dikerjakan secara fisik.

- `integral/lobi.js`: dunia 3D (Three.js), kamera bebas (putar, zoom, preset termasuk orang pertama), joystick sentuh, panel audit.
- `integral/avatar.js`: karakter kustom (orang, kucing, anjing, kelinci, beruang, bebek; topi, kacamata, aksesori). Dikirim lewat jaringan sebagai kode 6 digit.
- `integral/arena.js` dan `integral/pos1.js`: arena Pos 1 dan logikanya. Tim membawa balok dari gudang ke kolom di depan kurva y = x², lalu semua berdiri di pad untuk mengunci babak.
- `integral/rt.js`: Supabase Realtime, satu kanal per tim ditambah kanal papan yang jarang dipakai. Jika server tidak terjangkau, turun ke mode luring antar-tab.
- `integral/vendor/`: Three.js dan supabase-js, disalin agar tidak bergantung pada CDN.
- Uji: `python3 tests/lobi.py` (mode luring, `?lokal=1`) dan `tests/galeri.html` (galeri karakter).

### Anggaran pesan (paket gratis Supabase Realtime)

Batas paket gratis sekitar 100 pesan per detik per proyek, dan satu pesan dihitung sekali saat dikirim dan sekali per penerima. Jika semua pemain satu ruang saling bicara, beban tumbuh sebagai N kuadrat kali laju kirim, jadi sekadar menjarangkan posisi tidak cukup. Karena itu:

- Pesan posisi dan aksi hanya disebar ke satu tim (kanal tim). Beban satu tim M orang adalah M kuadrat kali laju, bukan N kuadrat.
- Tim lain tidak digambar langsung. Mereka tampil di papan skor lewat laporan jarang (jumlah anggota dan skor, sekitar tiap 15 detik).
- Posisi dikirim jarang dengan ekstrapolasi: hanya saat kecepatan berubah, berhenti, selisih prediksi lebih dari 1, atau denyut 15 detik. Jeda mengikuti perkiraan jumlah pemain.
- Aksi balok Pos 1 dikumpulkan jadi selisih per kolom dan dikirim berkala, dengan penyelarasan oleh anggota tertua.

Panel audit menampilkan FPS, ping, pesan kirim dan terima, jeda, serta perkiraan beban proyek. Kotak "Simulasi kelas 40" memakai asumsi 40 pemain dan 5 per tim. Uji beban sungguhan harus memakai proyek Supabase terpisah, bukan proyek kelas.
Belum ada: panel dosen, pos 2 sampai 6, pemeriksaan skor di server.


## Pos 1 v3 dan semesta luas

- Pos 1: kurva diundi lewat roda (seed dari kode ruang dan tim, tanpa pesan jaringan), aturan titik sampel kiri, kanan, tengah, kurva dan luas disembunyikan, batas waktu, skor ketat dengan bonus waktu, gelondong rintangan.
- Lobi: peta radius 95 dengan enam zona bertema (Padang, Gurun, Salju, Hutan, Pantai, Gunung), tiang cahaya di tiap gerbang, peta mini, lari (Shift atau tombol Lari, stamina 100), 60 koin yang membuka kosmetik (penyihir 10, helm 20, kacamata hitam 15, ransel 30, bebek 40). Koin tersimpan di perangkat (`ki-koin`).
- Boost: koin ditukar sebelum babak (Sepatu roket 5, Tangan raksasa 8, Perisai 6, Gudang cepat 6), berlaku satu babak dan efeknya lokal ke pemain. Waktu babak 3, 5, 8 menit.

### Pos 1 tahap 2 (medan)
Tiga jalur (kiri, tengah, kanan), sungai dengan jembatan sempit, palu ayun, pintu geser, duri, ban berjalan, lantai runtuh, trampolin (babak 3) dan bola menggelinding. Semua bahaya dihitung dari jam dinding (`medan.js`), tanpa pesan jaringan. Tingkat kesulitan naik tiap babak. Perisai menahan satu tabrakan.

### Pos 1 "Lembah Waduk" (v=22)
- Dunia: lembah luas dengan tiga wilayah. Hutan (kiri: pintu geser, duri), Bukit (tengah: gelondong di lereng, palu di jembatan gantung, bola di punggung bukit), Sungai (kanan: batu pijakan yang tenggelam, ban berjalan, trampolin di babak 3).
- Tiap wilayah punya jalur utama (pendek, berbahaya) dan jalur memutar (aman, panjang). Kamp saling terhubung lewat jalan lingkar. Jalan pintas bergerbang terbuka selama ada anggota tim berdiri di pelat TUAS.
- Pemain hanya bisa berjalan di jalur (`boleh()` di `medan.js`). Terpental berarti meluncur ke jejak langkah sendiri, jadi selalu mendarat di jalur.
- Tiga kamp balok dengan stok terbatas (30%, 40%, 30%; kamp Bukit terjauh dan terbanyak). Kapasitas bawa 4 balok.
- Tanpa batas waktu. Stopwatch naik; kecepatan hanya bonus 12% yang habis di waktu patokan (`WAKTU`), ketepatan tetap 88%.
- Koin petualang di sudut-sudut lembah (muncul lagi tiap babak) menambah saldo boost.
- Grafis: 4 tingkat kualitas (rendah, sedang, tinggi, sangat tinggi) dan 2 gaya (realistik, sinematik), dipilih di tombol Grafis, tersimpan di perangkat. Kualitas awal ditebak dari perangkat dan turun sendiri bila tersendat (kecuali sudah dipilih manual).
- Semua rintangan tetap dihitung dari jam dinding, tanpa pesan jaringan baru.

### Pos 2 "Rakit Sandi" di Ngarai Kuil (v=25)
- Materi: notasi integral tentu. Prasasti kuil menampilkan daerah berarsir (babak 1), cerita kecepatan/debit/laju/kerapatan (babak 2), atau daerah terbelah dua (babak 3). Tim merakit sandinya dari batu: batas bawah dan diferensial di kamp Oasis, fungsi di kamp Menara, batas atas di kamp Reruntuhan, lalu memasang di slot altar.
- Pengecoh sengaja disertakan: turunan f, antiturunan F, variabel lain (4x + 1 untuk cerita dalam t), dy/dt yang tidak cocok, batas tertukar. Ulasan babak menjelaskan kesalahan yang terbaca.
- Skor: tiap slot bernilai sama (ketepatan 88%) ditambah bonus kecepatan 12%. Pada daerah terbelah, urutan dua integral boleh ditukar. Tanpa batas waktu.
- Bawa maksimal 2 batu. Tabrakan menjatuhkan batu. Pos 2 bisa dimasuki kapan saja (tidak menunggu Pos 1).
- Jaringan: event `d2` (slot: indeks, kode, cap waktu; yang terbaru menang), `st2`, `mulai2`, `kunci2`. Papan skor memuat skor Pos 1 dan Pos 2.
- Struktur: `medan.js` sekarang pembuat dunia (`M1` Lembah Waduk, `M2` Ngarai Kuil), `dunia3d.js` tampilan dunia umum (tema hijau dan gurun), `arena.js` isi khusus Pos 1, `arena2.js` dan `pos2.js` untuk Pos 2.
- Uji: `node tests/medan_cek.mjs` (geometri dan rintangan kedua dunia), `python3 tests/lobi.py` (Pos 1), `python3 tests/pos2.py` (Pos 2).

### Pos 3 sampai Pos 6 (v=29)
Semua pos berbasis slot memakai satu pengendali umum `buatAlur(CFG)` di `lobi.js` (mode `set`: slot dengan cap waktu, yang terbaru menang; mode `jumlah`: tambahan bertanda yang dijumlah). Event jaringan per pos: `d<n>`, `st<n>`, `mulai<n>`, `kunci<n>` (terdaftar di `EV_TIM`, `rt.js`). Tiap pos 3 babak, tanpa batas waktu, skor = ketepatan 88% + bonus kecepatan 12%.

| Pos | Dunia | Materi | Mekanik |
|---|---|---|---|
| 3 Mesin Putar Balik | Danau Beku (salju) | antiturunan polinom, + C, syarat awal | balok suku dari corong masuk, Tungku (pangkat naik), Pemotong (bagi koefisien), Gudang C, corong keluar |
| 4 Misteri Tangki | Hutan Sungai | integral sebagai akumulasi laju, luas bertanda | grafik debit; isi tiga tangki dengan ember 1 L, jeriken 2 L, drum 5 L; babak 3 ada aliran keluar |
| 5 Brankas Batas | Teluk Karang (pantai) | teorema dasar: F(atas) − F(bawah) | timbangan brankas: piring kanan F(atas), kiri F(bawah); beban 1, 5, 10 kg. Babak 2 F dicari sendiri (C bebas, tetap benar). Babak 3 dua brankas, satu batasnya terbalik (hasil negatif) |
| 6 Puncak Final | Puncak Kalkulus (gunung) | rangkuman semua pos | estafet pendakian: tiga pos jawaban (Lembah, Tebing, Puncak) di ketinggian berbeda; pilihan A sampai D bisa diganti sampai dikunci; tiap pengecoh punya umpan balik; hasil akhir memuat rapor P1 sampai P6 |

Rintangan baru (semua fungsi murni jam dinding, tanpa pesan jaringan): penekan, lengan putar, rakit/perahu, benda jatuh, kawanan berpatroli (lebah, kepiting, kambing), ombak pasang. Uji: `node tests/medan_cek.mjs`, `python3 tests/pos3.py` sampai `tests/pos6.py`, atau semuanya lewat `sh tests/semua.sh` (server lokal di port 8077).
