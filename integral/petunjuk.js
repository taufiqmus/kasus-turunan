/* Papan petunjuk 3D di sudut kiri belakang plaza tiap pos: langkah bernomor, singkat, dan peringatan. Teks digambar ke kanvas (MeshBasic,
   tanpa tone mapping) supaya kontras tetap penuh di semua tingkat grafis. Isi sengaja ringkas dan memakai nama tempat yang sama dengan di game. */
import * as THREE from './vendor/three.min.js';
export const PETUNJUK={
  1:{judul:'Pos 1: Tambal Waduk',warna:'#e5392b',langkah:[
    'Semua berdiri di PAD hijau. Babak mulai setelah hitung mundur.',
    'Baca kurva di papan besar. Tinggi tiap kolom = nilai y di titik yang tertulis (kiri, kanan, atau tengah).',
    'Berdiri di lingkaran kamp (Hutan, Bukit, Sungai) untuk mengisi tangan. Bawa maksimal 4 balok.',
    'Bawa ke kolom di depan papan, tekan Taruh balok. Satu balok = 0,5.',
    'Kalau kelebihan, tekan Ambil kembali. Kalau sudah pas, semua berdiri di PAD untuk mengunci.'],
    awas:'Rintangan dan T-Rex menjatuhkan balok, dan balok itu hilang. Stok habis = babak diulang. Pelat TUAS biru membuka jalan pintas.'},
  2:{judul:'Pos 2: Rakit Sandi',warna:'#e0a200',langkah:[
    'Semua berdiri di PAD hijau untuk mulai.',
    'Baca prasasti: daerah berarsir atau cerita. Tuliskan sebagai integral dari a sampai b, f(x) dx.',
    'Ambil batu sandi di kamp: a dan dx di Oasis, f di Menara, b di Reruntuhan. Bawa maksimal 2.',
    'Pasang batu di slot altar yang jenisnya cocok (tekan Pasang).',
    'Semua slot terisi, lalu semua berdiri di PAD untuk mengunci.'],
    awas:'Ada batu pengecoh (turunan, antiturunan, variabel lain). Ular menjatuhkan batu yang dibawa. Bekal habis = babak diulang.'},
  3:{judul:'Pos 3: Mesin Putar Balik',warna:'#2f7fc1',langkah:[
    'Semua berdiri di PAD hijau untuk mulai.',
    'Baca f(x) di layar mesin. Tugasmu mencari F(x) (antiturunan).',
    'Ambil tiap suku di corong MASUK.',
    'Tungku: pangkat naik 1. Pemotong: bagi koefisien dengan pangkat baru. Gudang C: ambil konstanta C.',
    'Bawa semua suku dan C ke corong KELUAR, lalu semua berdiri di PAD untuk mengunci.'],
    awas:'Serigala menjatuhkan balok suku. Bekal habis = babak diulang.'},
  4:{judul:'Pos 4: Misteri Tangki',warna:'#2f9e5b',langkah:[
    'Semua berdiri di PAD hijau untuk mulai.',
    'Baca grafik debit di papan. Isi tangki ke-n = volume awal + luas bertanda di bawah grafik sampai garis merah ke-n.',
    'Ambil air: ember 1 L di Mata Air, jeriken 2 L di Sumur, drum 5 L di Air Terjun. Bawa maksimal 2.',
    'Tuang ke tangki yang benar. Kelebihan? Kuras 1 L atau 5 L.',
    'Semua tangki pas, lalu semua berdiri di PAD untuk mengunci.'],
    awas:'Kawanan lebah (titik kuning di peta mini) menyapu semua jalan: tunggu sampai lewat atau pilih rute lain. Laba-laba menjatuhkan wadah. Bekal habis = babak diulang.'},
  5:{judul:'Pos 5: Brankas Batas',warna:'#7a4bc4',langkah:[
    'Semua berdiri di PAD hijau untuk mulai.',
    'Baca f(x) dan batas bawah atas di papan. Cari satu antiturunan F.',
    'Piring kanan = F(atas), piring kiri = F(bawah). Isi brankas = selisihnya.',
    'Ambil beban: 1 kg di Dermaga, 5 kg di Gua Karang, 10 kg di Mercusuar. Bawa maksimal 2.',
    'Taruh di piring yang benar, lalu semua berdiri di PAD untuk mengunci.'],
    awas:'Kepiting patroli (titik kuning di peta mini) menyapu semua jalan: tunggu sampai lewat. Kepiting raksasa menjatuhkan beban. Bekal habis = babak diulang.'},
  6:{judul:'Pos 6: Puncak Final',warna:'#17a2a2',langkah:[
    'Semua berdiri di PAD hijau untuk mulai.',
    'Baca tiga soal di papan, lalu bagi tugas antar anggota.',
    'Daki ke Pos Lembah, Pos Tebing, dan Puncak. Di tiap pos pilih jawaban A, B, C, atau D.',
    'Jawaban boleh diganti sampai dikunci, tetapi tiap perubahan memakai bekal.',
    'Ketiga pos terjawab, lalu semua berdiri di PAD untuk mengunci.'],
    awas:'Kambing gunung (titik kuning di peta mini) menyapu semua jalan: tunggu sampai lewat. Triceratops merampas bekal tim. Bekal habis = babak diulang.'},
};
const W=1024,H=800;
function bungkus(g,teks,lebar){const kata=teks.split(' '),baris=[];let b='';for(const k of kata){const c=b?b+' '+k:k;if(g.measureText(c).width>lebar&&b){baris.push(b);b=k;}else b=c;}if(b)baris.push(b);return baris;}
export function gambarPetunjuk(pos){
  const P=PETUNJUK[pos],c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
  g.fillStyle='#fff6e4';g.fillRect(0,0,W,H);
  g.fillStyle=P.warna;g.fillRect(0,0,W,96);
  g.fillStyle='#fff';g.font='800 54px "Bricolage Grotesque",sans-serif';g.textBaseline='middle';g.textAlign='left';g.fillText(P.judul,32,50);
  g.textBaseline='top';
  /* huruf terbesar yang masih muat di atas kotak AWAS */
  let fs=40;const muat=f=>{g.font='600 '+f+'px "Chakra Petch",sans-serif';let y=122;for(const t of P.langkah)y+=bungkus(g,t,W-130).length*Math.round(f*1.2)+Math.round(f*.45);return y;};
  while(fs>24&&muat(fs)>H-170)fs-=2;
  const lh=Math.round(fs*1.2),gap=Math.round(fs*.45);let y=122;
  P.langkah.forEach((t,i)=>{
    const r=Math.round(fs*.68);g.fillStyle=P.warna;g.beginPath();g.arc(46,y+lh/2-2,r,0,Math.PI*2);g.fill();
    g.fillStyle='#fff';g.font='800 '+Math.round(fs*.85)+'px "Chakra Petch",sans-serif';g.textAlign='center';g.fillText(String(i+1),46,y+lh/2-Math.round(fs*.85)/2-2);
    g.fillStyle='#1c2230';g.font='600 '+fs+'px "Chakra Petch",sans-serif';g.textAlign='left';
    const L=bungkus(g,t,W-130);L.forEach((s2,j)=>g.fillText(s2,92,y+j*lh));
    y+=Math.max(1,L.length)*lh+gap;
  });
  g.fillStyle='#fde3df';g.fillRect(20,H-150,W-40,126);g.strokeStyle='#e5392b';g.lineWidth=4;g.strokeRect(20,H-150,W-40,126);
  g.fillStyle='#b3261e';g.font='800 30px "Chakra Petch",sans-serif';g.textAlign='left';g.fillText('AWAS',36,H-142);
  g.fillStyle='#1c2230';g.font='600 27px "Chakra Petch",sans-serif';
  bungkus(g,P.awas,W-90).slice(0,3).forEach((s2,j)=>g.fillText(s2,36,H-114+j*32));
  g.strokeStyle='#1c2230';g.lineWidth=10;g.strokeRect(0,0,W,H);
  return c;
}
/* papan berdiri di tanah dengan dua tiang; W dunia pos dipakai untuk menaruhnya di sudut kiri belakang plaza dan mengikuti tinggi tanah */
export function buatPapanPetunjuk(pos,dunia){
  const grup=new THREE.Group(),tx=new THREE.CanvasTexture(gambarPetunjuk(pos));tx.colorSpace=THREE.SRGBColorSpace;tx.anisotropy=4;
  const lebar=6.4,tinggi=lebar*H/W,y0=1.3;
  const papan=new THREE.Mesh(new THREE.PlaneGeometry(lebar,tinggi),new THREE.MeshBasicMaterial({map:tx,toneMapped:false}));papan.position.set(0,y0+tinggi/2,0);grup.add(papan);
  const bingkai=new THREE.Mesh(new THREE.BoxGeometry(lebar+.3,tinggi+.3,.16),new THREE.MeshLambertMaterial({color:0x1c2230}));bingkai.position.set(0,y0+tinggi/2,-.1);grup.add(bingkai);
  for(const sx of [-1,1]){const t=new THREE.Mesh(new THREE.CylinderGeometry(.11,.11,y0+tinggi,6),new THREE.MeshLambertMaterial({color:0x6b4a26}));t.position.set(sx*(lebar/2-.3),(y0+tinggi)/2,-.2);grup.add(t);}
  const x=-12.2,z=dunia.PLAZA.z0+1.1;grup.position.set(x,dunia.tinggiTanah(x,z),z);grup.rotation.y=.42;   // sedikit menghadap tengah plaza
  return grup;
}
