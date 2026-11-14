/* Pos 4: Misteri Tangki. Papan menampilkan grafik debit r(t) liter per menit, termasuk aliran keluar (negatif) di babak 3.
   Tiga tangki adalah "foto" volume tangki yang sama pada waktu t1 < t2 < t3: V(t) = V0 + luas bertanda di bawah r dari 0 sampai t.
   Tim mengisi tiap tangki dengan ember (1 L), jeriken (2 L), drum (5 L), atau menguras kelebihan.
   Intuisi: volume adalah akumulasi laju; bagian grafik di bawah sumbu mengurangi volume. Logika saja, tanpa tampilan 3D. */
export const NB4=3,CAP4=2,WAKTU4=[300,420,480],VMAX=30;
export const WADAH=[{nama:'ember',L:1},{nama:'drum',L:5},{nama:'jeriken',L:2}];  /* indeks = kamp di dunia M4 */
/* potongan grafik: [t0,t1,r0,r1] (r linear dari r0 ke r1). Tangki di ujung tiap potongan. */
const BANK=[
  [{v0:0,p:[[0,2,2,2],[2,4,4,4],[4,6,1,1]]},{v0:2,p:[[0,3,2,2],[3,5,3,3],[5,6,4,4]]},{v0:0,p:[[0,2,3,3],[2,3,6,6],[3,6,2,2]]}],
  [{v0:0,p:[[0,2,0,2],[2,4,2,4],[4,6,3,3]]},{v0:4,p:[[0,2,4,0],[2,4,2,2],[4,6,0,4]]},{v0:0,p:[[0,2,1,3],[2,4,3,3],[4,6,3,1]]}],
  [{v0:6,p:[[0,2,4,4],[2,4,-2,-2],[4,6,1,1]]},{v0:10,p:[[0,2,-3,-3],[2,4,0,4],[4,6,2,2]]},{v0:8,p:[[0,2,4,0],[2,4,0,-4],[4,6,3,3]]}]
];
function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function acak(seed){let a=hash(seed);return()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}
export const luasPotong=([t0,t1,r0,r1])=>(t1-t0)*(r0+r1)/2;
export let SOAL4=[];
export function setSeed4(seed){
  const r=acak(seed+'|p4');
  SOAL4=BANK.map(bank=>{
    const s=bank[Math.floor(r()*bank.length)];let v=s.v0;const V=[],t=[];
    for(const q of s.p){v+=luasPotong(q);V.push(v);t.push(q[1]);}
    return {v0:s.v0,p:s.p,V,t};
  });
}
setSeed4('awal');
export const soal4=r=>SOAL4[Math.min(r,NB4-1)];
export const nSlot4=r=>soal4(r).V.length;
export const rDi=(S,x)=>{for(const [t0,t1,r0,r1] of S.p)if(x>=t0&&x<=t1)return r0+(r1-r0)*(x-t0)/(t1-t0);return 0;};
/* penilaian: tepat = 1, selisih 1 liter = setengah */
export function nilai4(r,s){
  const S=soal4(r),cat=new Set();let poin=0;
  S.V.forEach((v,i)=>{
    const x=s[i]|0,e=Math.abs(x-v);poin+=e===0?1:(e<=1?.5:0);
    if(e===0)return;
    const sendiri=S.v0+luasPotong(S.p[i]);
    if(i>0&&x===sendiri)cat.add('bukanKumulatif');
    else if(S.v0>0&&x===v-S.v0)cat.add('lupaAwal');
    else{let a=S.v0;for(let j=0;j<=i;j++)a+=Math.abs(luasPotong(S.p[j]));if(x===a&&a!==v)cat.add('tanda');else cat.add(x<v?'kurang':'lebih');}
  });
  return {poin,total:S.V.length,benar:S.V.filter((v,i)=>(s[i]|0)===v).length,catatan:[...cat]};
}
export function skorRonde4(r,s,w){const n=nilai4(r,s),akurasi=Math.round(100*n.poin/n.total);return {...n,akurasi,skor:Math.round(akurasi*(.88+.12*w/1000))};}
export const PESAN4={
  bukanKumulatif:'Ada tangki yang diisi hanya dengan air selama selangnya sendiri. Tiap tangki adalah volume total sejak awal: V(t) = V0 + luas dari 0 sampai t, jadi luas sebelumnya ikut terhitung.',
  lupaAwal:'Volume awal V0 terlupa. Tangki sudah berisi V0 liter pada t = 0, baru kemudian bertambah sesuai luas di bawah grafik.',
  tanda:'Bagian grafik di bawah sumbu t adalah air yang keluar. Luasnya dikurangkan, bukan ditambahkan.',
  kurang:'Ada tangki yang isinya kurang. Hitung luas tiap potongan: persegi panjang = debit × waktu, segitiga atau trapesium = rata-rata debit × waktu.',
  lebih:'Ada tangki yang isinya lebih. Hitung luas tiap potongan: persegi panjang = debit × waktu, segitiga atau trapesium = rata-rata debit × waktu.'
};
export const stateBaru4=()=>({r:0,s:Array(nSlot4(0)).fill(0),k:Array(nSlot4(0)).fill(0),sr:[],w:[],f:0});
export const selesai4=st=>st.r>=NB4;
export function skorTim4(st){if(!selesai4(st))return null;let s=0;for(let i=0;i<NB4;i++)s+=skorRonde4(i,st.sr[i],st.w[i]).skor;return Math.round(s/NB4);}
const bil=(v,a,b)=>Number.isInteger(v)&&v>=a&&v<=b;
export const sValid4=(r,s)=>Array.isArray(s)&&r<NB4&&s.length===nSlot4(r)&&s.every(v=>bil(v,0,VMAX));
export function valid4(s){
  if(!s||typeof s!=='object'||!bil(s.r,0,NB4)||!Array.isArray(s.sr)||s.sr.length!==s.r)return false;
  if(!Array.isArray(s.w)||s.w.length!==s.r||!s.w.every(v=>bil(v,0,1000)))return false;
  if(s.f!==0&&s.f!==1)return false;
  if(s.f===1&&!bil(s.m,-36000000,900000))return false;
  for(let i=0;i<s.r;i++)if(!sValid4(i,s.sr[i]))return false;
  if(s.r>=NB4)return Array.isArray(s.s)&&s.s.length===0;
  return sValid4(s.r,s.s);
}
