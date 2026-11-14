/* Pos 6: Puncak Final. Estafet pendakian: tiap babak ada tiga pos jawaban di gunung (lembah, tebing, puncak).
   Di tiap pos tim memilih satu jawaban A sampai D; pilihan bisa diganti siapa saja sampai babak dikunci di pad.
   Soal merangkum semua pos: taksiran Riemann, notasi, antiturunan, akumulasi, teorema dasar, sifat integral.
   Pengecoh dibuat dari miskonsepsi yang umum; tiap pengecoh punya umpan balik sendiri. Logika saja, tanpa tampilan 3D. */
export const NB6=3,WAKTU6=[360,420,480],NSTASIUN=3;
export const HURUF=['A','B','C','D'];
/* soal: t = pertanyaan, o = empat pilihan, b = indeks benar, m = umpan balik untuk pilihan salah (indeks sama dengan o) */
const BANK=[
  [ /* babak 1: dasar */
    [{t:'Luas di bawah y = 2x dari x = 0 sampai 3 ditaksir dengan 3 persegi panjang selebar 1, tinggi di titik kanan. Taksirannya?',o:['12','9','6','18'],b:0,
      m:[null,'9 adalah luas asli. Titik kanan pada fungsi naik menaksir lebih: 2 + 4 + 6 = 12.','6 memakai titik kiri (0 + 2 + 4). Soal meminta titik kanan.','18 bukan jumlah tinggi 2, 4, 6. Jumlahkan tinggi kali lebar.']},
     {t:'Untuk fungsi yang terus naik, taksiran Riemann titik kiri dibanding luas aslinya selalu...',o:['lebih kecil','lebih besar','sama persis','tidak bisa ditentukan'],b:0,
      m:[null,'Titik kiri pada fungsi naik memakai tinggi terendah tiap pita, jadi persegi panjang berada di bawah kurva.','Sama persis hanya untuk fungsi konstan. Fungsi naik menyisakan celah di atas tiap persegi panjang.','Bisa ditentukan: pada fungsi naik, titik kiri selalu di bawah kurva.']}],
    [{t:'Pada ∫ dari 1 sampai 4 (3x² + 1) dx, yang disebut integran adalah...',o:['3x² + 1','dx','1 dan 4','x'],b:0,
      m:[null,'dx menandai variabel integrasi, bukan integran.','1 dan 4 adalah batas bawah dan batas atas.','x adalah variabel integrasi. Integran adalah fungsi yang diintegralkan.']},
     {t:'∫ dari 2 sampai 5 f(x) dx adalah luas bertanda di bawah f dari...',o:['x = 2 sampai x = 5','x = 5 sampai x = 2','x = 0 sampai x = 5','x = 2 sampai x = f(5)'],b:0,
      m:[null,'Angka di bawah tanda integral adalah batas bawah, angka di atas adalah batas atas.','Batas bawahnya 2, bukan 0.','Batas adalah nilai x, bukan nilai fungsi.']}],
    [{t:'Antiturunan dari f(x) = 6x² adalah...',o:['2x³ + C','12x + C','6x³ + C','3x³ + C'],b:0,
      m:[null,'12x adalah turunan, bukan antiturunan. Arahnya terbalik.','Pangkat sudah naik, tetapi koefisien belum dibagi pangkat baru (3).','Koefisien dibagi 2, padahal pangkat barunya 3.']},
     {t:'Antiturunan dari f(x) = 4x³ + 2 adalah...',o:['x⁴ + 2x + C','12x² + C','x⁴ + C','4x⁴ + 2x + C'],b:0,
      m:[null,'12x² adalah turunan dari 4x³. Antiturunan menaikkan pangkat.','Konstanta 2 juga punya antiturunan, yaitu 2x.','Setelah pangkat naik menjadi 4, koefisien 4 harus dibagi 4.']}]
  ],
  [ /* babak 2: makna */
    [{t:'Debit air 3 L/menit selama 4 menit. Tangki awalnya sudah berisi 5 L. Isi akhirnya?',o:['17 L','12 L','7 L','15 L'],b:0,
      m:[null,'12 L hanya air yang masuk. Isi awal 5 L terlupa.','7 L tidak memakai luas 3 × 4. Luas di bawah debit adalah air yang masuk.','15 L berasal dari 3 × 5. Lama aliran 4 menit, isi awal 5 L.']},
     {t:'Debit +4 L/menit selama 2 menit, lalu −2 L/menit selama 3 menit. Tangki awalnya kosong. Isi akhirnya?',o:['2 L','14 L','8 L','−2 L'],b:0,
      m:[null,'Bagian debit negatif adalah air keluar. Luasnya dikurangkan, bukan ditambah.','8 L hanya bagian masuk. Air yang keluar 6 L belum dikurangkan.','Masuk 8 L, keluar 6 L. Hasilnya positif.']}],
    [{t:'∫ dari 1 sampai 3 2x dx = ?',o:['8','4','10','9'],b:0,
      m:[null,'4 = f(3) − f(1). Yang dikurangkan seharusnya F, yaitu x².','10 = F(3) + F(1). Integral tentu adalah selisih.','9 hanya F(3). F(1) = 1 belum dikurangkan.']},
     {t:'∫ dari 0 sampai 2 3x² dx = ?',o:['8','12','6','24'],b:0,
      m:[null,'12 = f(2) − f(0). Pakai antiturunan F(x) = x³.','6 tidak cocok dengan F(2) − F(0) = 8 − 0.','24 berasal dari 3 × 2³. Antiturunan 3x² adalah x³, bukan 3x³.']}],
    [{t:'Ana memakai F(x) = x² + 7, Budi memakai F(x) = x². Untuk ∫ dari 1 sampai 3 2x dx, hasil mereka...',o:['sama','Ana lebih besar 7','Ana lebih besar 14','tidak bisa dibandingkan'],b:0,
      m:[null,'Konstanta 7 muncul di F(3) dan F(1), lalu hilang saat dikurangkan.','Konstanta 7 ikut dikurangkan: (9 + 7) − (1 + 7) = 8.','Konstanta tidak dijumlahkan dua kali. Ia saling menghapus.']},
     {t:'Jika F′(x) = f(x), maka F(x) + 100 adalah...',o:['antiturunan f juga','bukan antiturunan f','turunan f','sama dengan f(x) + 100'],b:0,
      m:[null,'Turunan konstanta 100 adalah nol, jadi (F + 100)′ = f.','Antiturunan adalah fungsi yang turunannya f. F + 100 memenuhi itu.','F + 100 bukan sama dengan f + 100 karena F berbeda dari f.']}]
  ],
  [ /* babak 3: sifat */
    [{t:'Jika ∫ dari 1 sampai 4 f(x) dx = 9, maka ∫ dari 4 sampai 1 f(x) dx = ?',o:['−9','9','0','1/9'],b:0,
      m:[null,'Menukar batas membalik tanda: F(1) − F(4) = −(F(4) − F(1)).','Nol hanya untuk batas yang sama.','Menukar batas tidak membuat kebalikan pecahan, hanya membalik tanda.']},
     {t:'∫ dari 2 sampai 2 f(x) dx = ?',o:['0','f(2)','2·f(2)','tidak terdefinisi'],b:0,
      m:[null,'Lebar pitanya nol, jadi luasnya nol: F(2) − F(2) = 0.','Lebar pitanya nol, jadi luasnya nol: F(2) − F(2) = 0.','Integral dengan batas sama selalu terdefinisi dan bernilai 0.']}],
    [{t:'∫ dari 0 sampai 2 (x − 1) dx = ?',o:['0','1','2','−1'],b:0,
      m:[null,'1 adalah luas total tanpa tanda. Bagian di bawah sumbu (0 sampai 1) bernilai negatif.','Hitung F(x) = x²/2 − x: F(2) − F(0) = 0.','Bagian negatif dan positif sama besar, hasilnya 0.']},
     {t:'Grafik f seluruhnya di bawah sumbu x pada [1, 3]. Maka ∫ dari 1 sampai 3 f(x) dx bernilai...',o:['negatif','positif','nol','sama dengan luas daerahnya'],b:0,
      m:[null,'Luas di bawah sumbu x dihitung negatif dalam integral tentu.','Nol hanya jika bagian positif dan negatif seimbang.','Luas daerah selalu positif, integralnya negatif.']}],
    [{t:'∫ dari 0 sampai 1 f(x) dx = 2 dan ∫ dari 1 sampai 3 f(x) dx = 5. Maka ∫ dari 0 sampai 3 f(x) dx = ?',o:['7','3','10','−3'],b:0,
      m:[null,'Dua selang yang bersambung dijumlah, bukan dikurangkan.','Hasil kali tidak berlaku. Luas dua pita bersambung dijumlahkan.','Selang [0, 1] dan [1, 3] bersambung, luasnya dijumlah.']},
     {t:'Jika ∫ dari 0 sampai 2 f(x) dx = 3, maka ∫ dari 0 sampai 2 5·f(x) dx = ?',o:['15','8','3','5/3'],b:0,
      m:[null,'Pengali konstanta dikalikan, bukan dijumlahkan.','Mengalikan f dengan 5 membuat semua tinggi 5 kali, luasnya juga 5 kali.','Pengali konstanta dikalikan, bukan dibagi.']}]
  ]
];
function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function acak(seed){let a=hash(seed);return()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}
export let SOAL6=[];
/* urutan pilihan diacak per kode ruangan (sama di semua perangkat); b dan m ikut dipetakan */
export function setSeed6(seed){
  const r=acak(seed+'|p6');
  SOAL6=BANK.map(babak=>babak.map(var2=>{
    const q=var2[Math.floor(r()*var2.length)],ix=[0,1,2,3];
    for(let i=3;i>0;i--){const j=Math.floor(r()*(i+1));[ix[i],ix[j]]=[ix[j],ix[i]];}
    return {t:q.t,o:ix.map(i=>q.o[i]),m:ix.map(i=>q.m[i]),b:ix.indexOf(q.b)};
  }));
}
setSeed6('awal');
export const soal6=r=>SOAL6[Math.min(r,NB6-1)];
/* slot: 0 = belum dijawab, 1..4 = pilihan A..D */
export function nilai6(r,s){
  const S=soal6(r),cat=[];let benar=0;
  S.forEach((q,i)=>{const p=(s[i]|0)-1;if(p===q.b)benar++;else if(p>=0)cat.push({i,teks:q.m[p]});else cat.push({i,teks:'Pos ini belum dijawab.'});});
  return {benar,total:S.length,catatan:cat};
}
export function skorRonde6(r,s,w){const n=nilai6(r,s),akurasi=Math.round(100*n.benar/n.total);return {...n,akurasi,skor:Math.round(akurasi*(.88+.12*w/1000))};}
export const stateBaru6=()=>({r:0,s:Array(NSTASIUN).fill(0),k:Array(NSTASIUN).fill(0),sr:[],w:[],f:0});
export const selesai6=st=>st.r>=NB6;
export function skorTim6(st){if(!selesai6(st))return null;let s=0;for(let i=0;i<NB6;i++)s+=skorRonde6(i,st.sr[i],st.w[i]).skor;return Math.round(s/NB6);}
const bil=(v,a,b)=>Number.isInteger(v)&&v>=a&&v<=b;
export const sValid6=(r,s)=>Array.isArray(s)&&r<NB6&&s.length===NSTASIUN&&s.every(v=>bil(v,0,4));
export function valid6(s){
  if(!s||typeof s!=='object'||!bil(s.r,0,NB6)||!Array.isArray(s.sr)||s.sr.length!==s.r)return false;
  if(!Array.isArray(s.w)||s.w.length!==s.r||!s.w.every(v=>bil(v,0,1000)))return false;
  if(s.f!==0&&s.f!==1)return false;
  if(s.f===1&&!bil(s.m,-36000000,900000))return false;
  if(!Array.isArray(s.k))return false;
  for(let i=0;i<s.r;i++)if(!sValid6(i,s.sr[i]))return false;
  if(s.r>=NB6)return Array.isArray(s.s)&&s.s.length===0;
  return sValid6(s.r,s.s);
}
