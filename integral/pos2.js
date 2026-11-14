/* Pos 2: Rakit Sandi. Pintu kuil dikunci sandi berupa daerah berarsir (atau cerita). Tim merakit notasi integral tentu
   dari batu sandi: batas bawah a dan diferensial d (kamp Oasis), fungsi f (kamp Menara), batas atas b (kamp Reruntuhan).
   Soal diundi per tim per babak dengan benih dari kode ruang dan tim. Modul ini hanya logika, tanpa tampilan 3D. */
export const NB2=3,CAP2=2,WAKTU2=[240,330,450];
/* jenis batu -> kamp asal */
export const KAMP_JENIS={a:0,d:0,f:1,b:2};
export const NAMA_JENIS={a:'batas bawah',b:'batas atas',f:'fungsi',d:'diferensial'};

/* opsi f: [teks, catatan]. catatan: 'turunan' | 'anti' | 'var' | '' (pengecoh lain) */
const minus=v=>String(v).replace('-','−');
const G=(tx,f,a,b,fo,ao,bo,dv='x')=>({jenis:'grafik',tx,keping:[{f,a,b,lab:'y = '+fo[0][0]}],jawab:[{a:minus(a),b:minus(b),f:fo[0][0],d:'d'+dv}],
  opsi:{a:ao.map(minus),b:bo.map(minus),f:fo,d:['dx','dy']}});
const BANK=[
  /* babak 1: luas di bawah satu kurva, rumus kurva tertulis */
  [
    G('',x=>x*x,1,3,[['x²',''],['2x','turunan'],['x³/3','anti'],['x','']],[0,1,2,3],[1,2,3,4]),
    G('',x=>2*x+1,0,2,[['2x + 1',''],['2','turunan'],['x² + x','anti'],['2x','']],[0,1,2],[1,2,3]),
    G('',x=>4-x*x,0,2,[['4 − x²',''],['−2x','turunan'],['4x − x³/3','anti'],['x² − 4','']],[-2,0,1,2],[1,2,4]),
    G('',x=>x+1,1,4,[['x + 1',''],['1','turunan'],['x²/2 + x','anti'],['x','']],[0,1,4],[1,3,4]),
    G('',x=>x**3,0,2,[['x³',''],['3x²','turunan'],['x⁴/4','anti'],['x²','']],[0,1,2],[0,2,3])
  ],
  /* babak 2: dari cerita ke notasi; variabel bisa t atau x */
  [
    {jenis:'cerita',tx:'Mobil melaju dengan kecepatan v(t) = 4t + 1 m/s. Tulis integral untuk jarak tempuh dari detik ke-1 sampai detik ke-3.',
      jawab:[{a:'1',b:'3',f:'4t + 1',d:'dt'}],opsi:{a:['0','1','3'],b:['1','3','4'],f:[['4t + 1',''],['4','turunan'],['2t² + t','anti'],['4x + 1','var']],d:['dt','dx','dv']}},
    {jenis:'cerita',tx:'Air masuk ke tangki dengan debit Q(t) = 3t² liter per menit. Tulis integral untuk volume air dari menit ke-0 sampai menit ke-2.',
      jawab:[{a:'0',b:'2',f:'3t²',d:'dt'}],opsi:{a:['0','1','2'],b:['0','2','3'],f:[['3t²',''],['6t','turunan'],['t³','anti'],['3x²','var']],d:['dt','dx','dQ']}},
    {jenis:'cerita',tx:'Tanaman tumbuh dengan laju r(t) = 2t cm per hari. Tulis integral untuk pertambahan tinggi dari hari ke-2 sampai hari ke-5.',
      jawab:[{a:'2',b:'5',f:'2t',d:'dt'}],opsi:{a:['0','2','5'],b:['2','5','7'],f:[['2t',''],['2','turunan'],['t²','anti'],['2x','var']],d:['dt','dx','dr']}},
    {jenis:'cerita',tx:'Batang besi punya kerapatan ρ(x) = x + 2 kg per meter. Tulis integral untuk massa batang dari x = 0 sampai x = 4 meter.',
      jawab:[{a:'0',b:'4',f:'x + 2',d:'dx'}],opsi:{a:['0','2','4'],b:['0','2','4'],f:[['x + 2',''],['1','turunan'],['x²/2 + 2x','anti'],['t + 2','var']],d:['dx','dt','dρ']}}
  ],
  /* babak 3: daerah terbelah dua, ditulis sebagai jumlah dua integral */
  [
    {jenis:'belah',keping:[{f:x=>x,a:0,b:2,lab:'y = x'},{f:()=>2,a:2,b:4,lab:'y = 2'}],
      jawab:[{a:'0',b:'2',f:'x',d:'dx'},{a:'2',b:'4',f:'2',d:'dx'}],opsi:{a:['0','1','2'],b:['2','3','4'],f:[['x',''],['2',''],['1','turunan'],['x²/2','anti'],['2x','']],d:['dx','dy']}},
    {jenis:'belah',keping:[{f:x=>x*x,a:0,b:1,lab:'y = x²'},{f:()=>1,a:1,b:3,lab:'y = 1'}],
      jawab:[{a:'0',b:'1',f:'x²',d:'dx'},{a:'1',b:'3',f:'1',d:'dx'}],opsi:{a:['0','1','3'],b:['1','2','3'],f:[['x²',''],['1',''],['2x','turunan'],['x³/3','anti'],['x','']],d:['dx','dy']}},
    {jenis:'belah',keping:[{f:()=>2,a:0,b:1,lab:'y = 2'},{f:x=>3-x,a:1,b:3,lab:'y = 3 − x'}],
      jawab:[{a:'0',b:'1',f:'2',d:'dx'},{a:'1',b:'3',f:'3 − x',d:'dx'}],opsi:{a:['0','1','3'],b:['1','2','3'],f:[['2',''],['3 − x',''],['−1','turunan'],['3x − x²/2','anti'],['x','']],d:['dx','dy']}},
    {jenis:'belah',keping:[{f:x=>x+1,a:0,b:2,lab:'y = x + 1'},{f:()=>3,a:2,b:3,lab:'y = 3'}],
      jawab:[{a:'0',b:'2',f:'x + 1',d:'dx'},{a:'2',b:'3',f:'3',d:'dx'}],opsi:{a:['0','2','3'],b:['1','2','3'],f:[['x + 1',''],['3',''],['1','turunan'],['x²/2 + x','anti'],['x','']],d:['dx','dy']}}
  ]
];

function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function acak(seed){let a=hash(seed);return()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}
function kocok(L,r){L=L.slice();for(let i=L.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[L[i],L[j]]=[L[j],L[i]];}return L;}

/* SOAL[r] = {jenis, tx, keping, jawab, slot:[{k,g}], batu:[{k,t,c}] } ; kode batu = indeks+1, 0 = slot kosong */
export let SOAL=[];
export function setSeed2(seed){
  const r=acak(seed+'|p2');
  SOAL=BANK.map(bank=>{
    const s=bank[Math.floor(r()*bank.length)],nG=s.jawab.length;
    const slot=[];for(let g=0;g<nG;g++)for(const k of ['b','a','f','d'])slot.push({k,g});
    const batu=[];
    for(const k of ['a','b','f','d']){
      for(const o of kocok(s.opsi[k],r)){const t=Array.isArray(o)?o[0]:o,c=Array.isArray(o)?o[1]:'';batu.push({k,t,c});}
    }
    return {...s,slot,batu};
  });
}
setSeed2('awal');
export const soal=r=>SOAL[Math.min(r,NB2-1)];
export const nSlot=r=>soal(r).slot.length;
export const batuKamp=(r,kamp)=>soal(r).batu.map((b,i)=>({...b,kode:i+1})).filter(b=>KAMP_JENIS[b.k]===kamp);
export const teksBatu=(r,kode)=>kode>0?soal(r).batu[kode-1].t:'';

/* tata letak altar di plaza: posisi dan ukuran tiap slot, simbol ∫ dan + */
export function tata(r){
  const S=soal(r),dua=S.jawab.length>1,L=[];
  const x0s=dua?[-12,1.2]:[-6];
  const lebarF=dua?3.2:3.8;
  x0s.forEach((x0,g)=>{
    const ox=dua?0:0;
    L.push({k:'b',g,x:x0+1.8+ox,z:1.7,w:2.2,d:1.5});
    L.push({k:'a',g,x:x0+1.8+ox,z:4.6,w:2.2,d:1.5});
    L.push({k:'f',g,x:x0+(dua?5.4:5.8),z:3.15,w:lebarF,d:1.9});
    L.push({k:'d',g,x:x0+(dua?9:9.8),z:3.15,w:2.3,d:1.9});
  });
  return {slot:L,integral:x0s.map(x=>({x,z:3.15})),plus:dua?[{x:-.8,z:3.15}]:[]};
}
export const slotDi=(r,x,z)=>{const L=tata(r).slot;for(let i=0;i<L.length;i++){const s=L[i];if(Math.abs(x-s.x)<s.w/2+.15&&Math.abs(z-s.z)<s.d/2+.15)return i;}return -1;};

/* penilaian: tiap slot benar bernilai sama. Pada daerah terbelah, urutan dua integral boleh ditukar. */
export function nilai(r,s){
  const S=soal(r),nG=S.jawab.length,teks=s.map(k=>teksBatu(r,k));
  const grup=g=>({b:teks[g*4],a:teks[g*4+1],f:teks[g*4+2],d:teks[g*4+3]});
  const cocok=(g,j)=>['a','b','f','d'].filter(k=>grup(g)[k]===S.jawab[j][k]).length;
  let benar=0,urut=[...Array(nG).keys()];
  if(nG===1)benar=cocok(0,0);
  else{const a=cocok(0,0)+cocok(1,1),b=cocok(0,1)+cocok(1,0);benar=Math.max(a,b);if(b>a)urut=[1,0];}
  /* catatan untuk ulasan: kesalahan konsep yang terbaca dari batu yang dipasang */
  const catatan=new Set();
  for(let g=0;g<nG;g++){
    const G=grup(g),J=S.jawab[urut[g]],fb=S.batu.find(x=>x.k==='f'&&x.t===G.f);
    if(!G.f||!G.a||!G.b||!G.d)catatan.add('kosong');
    if(G.f&&G.f!==J.f&&fb&&fb.c)catatan.add(fb.c);
    if(G.a===J.b&&G.b===J.a&&G.a!==G.b)catatan.add('tukar');
    else if(G.a&&G.b&&(G.a!==J.a||G.b!==J.b))catatan.add('batas');
    if(G.d&&G.d!==J.d)catatan.add('d');
  }
  return {benar,total:nG*4,catatan:[...catatan]};
}
export function skorRonde2(r,s,w){
  const n=nilai(r,s),akurasi=Math.round(100*n.benar/n.total);
  return {...n,akurasi,skor:Math.round(akurasi*(.88+.12*w/1000))};
}
export const PESAN={
  turunan:'Yang dipasang adalah turunan fungsinya. Di dalam tanda integral ditulis fungsi yang luasnya dihitung, bukan turunannya.',
  anti:'Yang dipasang adalah antiturunan F. F baru dipakai saat menghitung nilainya (F(b) − F(a)), bukan ditulis di dalam tanda integral.',
  var:'Variabel fungsi harus sama dengan variabel pada diferensialnya. Kalau fungsinya dalam t, pasangannya dt.',
  d:'Diferensial menunjukkan variabel integrasi: dx untuk fungsi dalam x, dt untuk fungsi dalam t.',
  tukar:'Batas bawah dan atas tertukar. Batas bawah (awal selang) ditulis di bawah, batas atas di atas. Kalau ditukar, tanda hasilnya berubah.',
  batas:'Batas integral adalah ujung kiri dan kanan daerah (atau awal dan akhir selang waktu) yang dihitung.',
  kosong:'Ada slot yang masih kosong. Notasi integral tentu butuh keempatnya: batas bawah, batas atas, fungsi, dan diferensial.'
};
const SUB={'0':'₀','1':'₁','2':'₂','3':'₃','4':'₄','5':'₅','6':'₆','7':'₇','8':'₈','9':'₉','−':'₋','?':'?'},SUP={'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹','−':'⁻','?':'?'};
const ubah=(t,M)=>[...String(t)].map(c=>M[c]||c).join('');
/* notasi satu baris, misalnya ∫₁³ x² dx */
export const tulisInt=(j)=>'∫'+ubah(j.a||'?',SUB)+ubah(j.b||'?',SUP)+' '+(/[+−]/.test(j.f||'')?'('+j.f+')':(j.f||'?'))+' '+(j.d||'?');
export const notasi=(r,s)=>{
  const S=soal(r),nG=S.jawab.length,t=s.map(k=>teksBatu(r,k)),L=[];
  for(let g=0;g<nG;g++)L.push(tulisInt({b:t[g*4],a:t[g*4+1],f:t[g*4+2],d:t[g*4+3]}));
  return L.join(' + ');
};
export const notasiBenar=r=>soal(r).jawab.map(tulisInt).join(' + ');

/* keadaan tim untuk Pos 2: r babak, s kode batu per slot, k cap waktu per slot (yang terbaru menang), sr hasil, w bonus, f berjalan */
export const stateBaru2=()=>({r:0,s:Array(nSlot(0)).fill(0),k:Array(nSlot(0)).fill(0),sr:[],w:[],f:0});
export const selesai2=st=>st.r>=NB2;
export function skorTim2(st){
  if(!selesai2(st))return null;
  let s=0;for(let i=0;i<NB2;i++)s+=skorRonde2(i,st.sr[i],st.w[i]).skor;
  return Math.round(s/NB2);
}
const bil=(v,a,b)=>Number.isInteger(v)&&v>=a&&v<=b;
export const sValid=(r,s)=>Array.isArray(s)&&r<NB2&&s.length===nSlot(r)&&s.every(v=>bil(v,0,soal(r).batu.length));
export function valid2(s){
  if(!s||typeof s!=='object'||!bil(s.r,0,NB2)||!Array.isArray(s.sr)||s.sr.length!==s.r)return false;
  if(!Array.isArray(s.w)||s.w.length!==s.r||!s.w.every(v=>bil(v,0,1000)))return false;
  if(s.f!==0&&s.f!==1)return false;
  if(s.f===1&&!bil(s.m,-36000000,900000))return false;
  for(let i=0;i<s.r;i++)if(!sValid(i,s.sr[i]))return false;
  if(s.r>=NB2)return Array.isArray(s.s)&&s.s.length===0;
  return sValid(s.r,s.s)&&Array.isArray(s.k)&&s.k.length===s.s.length&&s.k.every(v=>Number.isFinite(v)&&v>=0);
}
