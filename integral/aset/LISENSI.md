# Sumber dan lisensi aset (tingkat grafis Ultra, Pos 1)

Semua aset berlisensi CC0 1.0 (domain publik): boleh dipakai, diubah, dan disebarkan tanpa atribusi. Atribusi tetap dicatat di sini sebagai sopan santun.
Aset diubah ukuran (512 px untuk tekstur) dan format (WebP); warna dasar dinormalkan agar warna tema game tetap memimpin.
Skrip pengubah: `tools/realisme-pos1/buat_aset.py`.

| Berkas | Sumber | Aset asli | Catatan |
|---|---|---|---|
| beton.webp, beton_n.webp | ambientCG | Concrete034 (1K-JPG, Color dan NormalGL) | dinding dan pilar bendungan |
| tanah.webp, tanah_n.webp | ambientCG | Ground054 (1K-JPG, Color dan NormalGL) | tanah Lembah Waduk, dikalikan warna vertex |
| kayu.webp, kayu_n.webp | ambientCG | Planks023A (1K-JPG, Color dan NormalGL) | papan jembatan, tiang kamp dan gerbang |
| batu.webp, batu_n.webp | ambientCG | Rock058 (1K-JPG, Color dan NormalGL) | batu tebing dan batu sebar |
| langit.webp | Poly Haven | kloofendal_48d_partly_cloudy_puresky (HDR 1k) | HDR diubah ke LDR (ACES kasar) 1024x512; latar dan peta lingkungan |

- ambientCG: https://ambientcg.com (lisensi https://docs.ambientcg.com/license/)
- Poly Haven: https://polyhaven.com (lisensi https://polyhaven.com/license)

## Dinosaurus (prototipe pengganggu Pos 1)

| Berkas | Sumber | Aset asli | Lisensi |
|---|---|---|---|
| trex.glb | Poly Pizza (https://poly.pizza/m/UYtneO5FpF) | "T-Rex" oleh Quaternius, ber-rig, 6 animasi (Attack, Death, Idle, Jump, Run, Walk) | CC0 1.0 |

Pemuat model (`integral/vendor/GLTFLoader.js`, `BufferGeometryUtils.js`, `SkeletonUtils.js`) disalin dari three.js r187 (lisensi MIT, sama dengan `three.min.js`); impor `'three'` diganti ke `./three.min.js`.
