# Baseline Pos 1 sebelum realisme (?v=32)

Diukur dengan `ukur.py` (Chrome headless Windows, SwiftShader, 1280x720, jam asli). fps mutlak jauh di bawah HP
sungguhan; hanya perbandingan sebelum dan sesudah yang bermakna. Draw call dihitung per frame (termasuk lintasan bayangan).

| Konfigurasi | Draw call/frame | Segitiga/frame | fps SwiftShader |
|---|---|---|---|
| Sangat tinggi, realistik (3r) | 258,7 | 206 ribu | 6,7 |
| Sangat tinggi, sinematik (3s) | 246,4 | 206 ribu | 6,2 |

- Unduhan awal halaman lobi: 1272 KB (26 berkas, termasuk three.min.js 735 KB dan supabase.js 215 KB).
- Waktu muat sampai lobi siap: 1,2 dtk (localhost, tanpa jaringan nyata).
- Aset gambar tambahan: 0 KB.

## Suite uji (tests/semua.sh) sebelum perubahan

Lingkungan: Windows 11, Chrome 157 lewat shim Playwright, server dengan MIME `.js` diperbaiki.
Lulus: medan_cek, pos2, pos4, pos5, catat, amati, layar, hp, hp mendatar.
Gagal SEBELUM perubahan apa pun: lobi (`mengembalikan balok menambah stok`), pos3 dan pos6 (galat evaluasi skorRonde, Pos 3
"terkunci"), dosen (`tombol Refresh aktif kembali`). Dicurigai karena lingkungan (rendering perangkat lunak lambat dan
jaringan Supabase), belum diselidiki. Syarat tahap ini: tidak ada suite yang lulus di baseline menjadi gagal.
