# Video Pos 1 Tambal Waduk

Skrip pembuat video tutorial. Game direkam frame demi frame (jam palsu Playwright) lewat kamera sutradara `?sutradara=1`.
Urutan: `rekam.py a..f` (adegan game, lambat, sekitar 6 frame per menit), `masalah.py` (animasi soal), `hamparan.py` (teks dan penutup), `musik.py`, lalu `susun.sh`. Jalur kerja di /tmp/vid. Server lokal harus jalan di port 8077.
Naskah narasi ada di `naskah-narasi.md`.
