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

## Karakter pengganggu tiap pos

Semua model glTF ber-rig dan beranimasi, CC0 1.0, oleh Quaternius, diunduh dari Poly Pizza. Dimuat malas hanya saat pemain masuk pos yang memakainya.

| Berkas | Dipakai di | Sumber (Poly Pizza) | Aset asli |
|---|---|---|---|
| trex.glb | Pos 1 | https://poly.pizza/m/UYtneO5FpF | T-Rex |
| ular.glb | Pos 2 | https://poly.pizza/m/x9x0viZs8V | Snake |
| serigala.glb | Pos 3 | https://poly.pizza/m/XU7oNeKShV | Wolf |
| laba.glb | Pos 4 | https://poly.pizza/m/yRYJiAJyiM | Spider |
| kepiting.glb | Pos 5 | https://poly.pizza/m/Gs3yfsV5lB | Crab Enemy |
| triceratops.glb | Pos 6 | https://poly.pizza/m/IGvrUqGrRM | Triceratops |

Pemuat model (`integral/vendor/GLTFLoader.js`, `BufferGeometryUtils.js`, `SkeletonUtils.js`) disalin dari three.js r187 (lisensi MIT, sama dengan `three.min.js`); impor `'three'` diganti ke `./three.min.js`.
