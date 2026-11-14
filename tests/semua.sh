#!/bin/sh
# Jalankan semua uji Lobi Integral berurutan. Server lokal: python3 -m http.server 8077 dari akar repo.
cd "$(dirname "$0")/.."
node tests/medan_cek.mjs | tail -1
for t in lobi pos2 pos3 pos4 pos5 pos6; do
  [ -f tests/$t.py ] || continue
  echo "== $t"; timeout 600 python3 tests/$t.py 2>&1 | grep -v '^OK' | tail -5
done
