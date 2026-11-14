/* Pos 5: Brankas Batas. Teorema dasar kalkulus: integral f dari bawah ke atas = F(atas) - F(bawah).
   Tiap brankas punya timbangan dua piring: piring kanan dimuati F(atas), piring kiri dimuati F(bawah).
   Selisih kanan - kiri adalah sandi brankas. Beban 1, 5, 10 kg diambil di tiga kamp.
   Babak 1: F diberikan. Babak 2: F dicari sendiri (C bebas, karena C saling menghapus).
   Babak 3: dua brankas, brankas kedua batasnya terbalik sehingga hasilnya negatif. Logika saja, tanpa tampilan 3D. */
export const NB5=3,CAP5=2,WAKTU5=[300,420,480],BMAX=60;
export const BEBAN=[{nama:'beban',kg:1},{nama:'jangkar',kg:10},{nama:'peti',kg:5}];  /* indeks = kamp di dunia M5 */
/* polinom: daftar suku [a,n] berarti a x^n; b: daftar brankas [batas bawah, batas atas] */
const BANK=[
  [{f:[[2,1]],F:[[1,2]],b:[[1,4]]},{f:[[3,2]],F:[[1,3]],b:[[1,3]]},{f:[[2,1],[1,0]],F:[[1,2],[1,1]],b:[[1,4]]},{f:[[4,1],[3,0]],F:[[2,2],[3,1]],b:[[1,3]]}],
  [{f:[[4,1]],F:[[2,2]],b:[[1,3]]},{f:[[6,1]],F:[[3,2]],b:[[2,4]]},{f:[[3,2],[2,0]],F:[[1,3],[2,1]],b:[[1,3]]},{f:[[4,3]],F:[[1,4]],b:[[1,2]]},{f:[[6,2],[2,1]],F:[[2,3],[1,2]],b:[[1,2]]}],
  [{f:[[2,1],[2,0]],F:[[1,2],[2,1]],b:[[1,3],[4,0]]},{f:[[3,2]],F:[[1,3]],b:[[0,2],[3,1]]},{f:[[4,1],[1,0]],F:[[2,2],[1,1]],b:[[1,2],[4,1]]}]
];
function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function acak(seed){let a=hash(seed);return()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}
export const nilaiP=(P,x)=>P.reduce((s,[a,n])=>s+a*x**n,0);
const SUP={0:'⁰',1:'¹',2:'²',3:'³',4:'⁴',5:'⁵'};
export function teksP(P){
  let t='';P.forEach(([a,n],i)=>{const neg=a<0,m=Math.abs(a),k=n===0?String(m):(m===1?'':String(m))+'x'+(n>1?SUP[n]:'');
    t+=i===0?(neg?'−':'')+k:(neg?' − ':' + ')+k;});
  return t||'0';
}
export let SOAL5=[];
export function setSeed5(seed){
  const r=acak(seed+'|p5');
  SOAL5=BANK.map((bank,i)=>{
    const s=bank[Math.floor(r()*bank.length)];
    return {f:s.f,F:s.F,tampilF:i===0,br:s.b.map(([bawah,atas])=>({atas,bawah,Fa:nilaiP(s.F,atas),Fb:nilaiP(s.F,bawah),I:nilaiP(s.F,atas)-nilaiP(s.F,bawah)}))};
  });
}
setSeed5('awal');
export const soal5=r=>SOAL5[Math.min(r,NB5-1)];
export const nBrankas=r=>soal5(r).br.length;
export const nSlot5=r=>2*nBrankas(r);
/* penilaian per brankas: selisih tepat = 1, meleset 1 = setengah */
export function nilai5(r,s){
  const S=soal5(r),cat=new Set();let poin=0,benar=0;const C=[];
  S.br.forEach((B,i)=>{
    const ka=s[2*i]|0,ki=s[2*i+1]|0,d=ka-ki,e=Math.abs(d-B.I);
    poin+=e===0?1:(e<=1?.5:0);
    if(e===0){benar++;const c=ka-B.Fa;if(c!==0&&ki-B.Fb===c)C.push(c);return;}
    if(B.I!==0&&d===-B.I)cat.add(B.atas<B.bawah?'terbalik':'tukar');
    else if(d===nilaiP(S.f,B.atas)-nilaiP(S.f,B.bawah))cat.add('fBukanF');
    else if(ka===B.Fa&&ki===0&&B.Fb!==0)cat.add('lupaBawah');
    else if(ka===B.Fa+B.Fb&&ki===0&&B.Fb!==0)cat.add('dijumlah');
    else cat.add(d<B.I?'kurang':'lebih');
  });
  return {poin,total:S.br.length,benar,catatan:[...cat],C};
}
export function skorRonde5(r,s,w){const n=nilai5(r,s),akurasi=Math.round(100*n.poin/n.total);return {...n,akurasi,skor:Math.round(akurasi*(.88+.12*w/1000))};}
export const PESAN5={
  tukar:'Piring tertukar. Piring kanan untuk F(batas atas), piring kiri untuk F(batas bawah), lalu sandi = kanan − kiri.',
  terbalik:'Batas brankas ini terbalik: batas atas lebih kecil dari batas bawah. Rumusnya tetap F(atas) − F(bawah), jadi hasilnya negatif dan timbangan miring ke kiri.',
  fBukanF:'Piring diisi nilai f, bukan F. Integral memakai antiturunan: cari dulu F dengan F′ = f, baru hitung F(atas) − F(bawah).',
  lupaBawah:'Piring kiri kosong padahal F(batas bawah) tidak nol. Integral adalah selisih, jadi F(bawah) wajib dikurangkan.',
  dijumlah:'Nilai F(atas) dan F(bawah) tampaknya dijumlah. Integral tentu adalah selisih F(atas) − F(bawah).',
  kurang:'Selisih timbangan kurang dari nilai integral. Periksa lagi F: naikkan pangkat satu, lalu bagi koefisien dengan pangkat baru.',
  lebih:'Selisih timbangan lebih dari nilai integral. Periksa lagi F: naikkan pangkat satu, lalu bagi koefisien dengan pangkat baru.'
};
export const stateBaru5=()=>({r:0,s:Array(nSlot5(0)).fill(0),k:Array(nSlot5(0)).fill(0),sr:[],w:[],f:0});
export const selesai5=st=>st.r>=NB5;
export function skorTim5(st){if(!selesai5(st))return null;let s=0;for(let i=0;i<NB5;i++)s+=skorRonde5(i,st.sr[i],st.w[i]).skor;return Math.round(s/NB5);}
const bil=(v,a,b)=>Number.isInteger(v)&&v>=a&&v<=b;
export const sValid5=(r,s)=>Array.isArray(s)&&r<NB5&&s.length===nSlot5(r)&&s.every(v=>bil(v,0,BMAX));
export function valid5(s){
  if(!s||typeof s!=='object'||!bil(s.r,0,NB5)||!Array.isArray(s.sr)||s.sr.length!==s.r)return false;
  if(!Array.isArray(s.w)||s.w.length!==s.r||!s.w.every(v=>bil(v,0,1000)))return false;
  if(s.f!==0&&s.f!==1)return false;
  if(s.f===1&&!bil(s.m,-36000000,900000))return false;
  for(let i=0;i<s.r;i++)if(!sValid5(i,s.sr[i]))return false;
  if(s.r>=NB5)return Array.isArray(s.s)&&s.s.length===0;
  return sValid5(s.r,s.s);
}
