# Uji otomatis

Butuh Python, Playwright, dan Chrome. Jalankan server dulu dari akar repo:

    python3 -m http.server 8077

Lalu jalankan per semesta, misalnya `python3 tests/s3.py`. Setiap skrip memainkan kasus dari awal sampai layar akhir
(termasuk satu salah tuduh yang disengaja) dan mencetak skor serta error halaman. Tangkapan layar ditulis ke /tmp/t.
`mob.py` membuka panel aksi tiap semesta di layar HP portrait dan landscape. `portal.py` memeriksa daftar kasus.
