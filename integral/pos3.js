/* Pos 3: Mesin Putar Balik. Layar mesin menampilkan turunan f(x). Tiap suku f menjadi balok es yang harus
   "diputar balik": naikkan pangkat di Tungku, bagi koefisien di Pemotong, lalu masukkan ke mesin. Ditambah balok C
   dari Gudang C. Intuisinya: turunan = kali pangkat lalu kurangi pangkat; kebalikannya = tambah pangkat lalu bagi.
   Babak 3 memberi nilai awal sehingga C harus dihitung. Hanya polinomial. Logika saja, tanpa tampilan 3D. */
export const NB3=3,CAP3=2,WAKTU3=[300,420,480];
export const STASIUN=['Tungku','Gudang C','Pemotong'];   /* indeks kamp di dunia M3 */
const BANK=[
  [[[6,2],[4,1]],[[3,2],[2,1]],[[8,3],[6,1]],[[4,3],[3,2]],[[9,2],[2,1]]],
  [[[3,2],[-4,1],[5,0]],[[6,2],[2,1],[-3,0]],[[4,3],[-6,2],[1,0]],[[12,2],[-8,1],[7,0]]],
  [{s:[[6,2],[2,0]],x0:0,y0:4},{s:[[4,1],[-3,0]],x0:1,y0:5},{s:[[3,2],[4,1]],x0:1,y0:6},{s:[[2,1],[1,0]],x0:2,y0:10}]
];
function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function acak(seed){let a=hash(seed);return()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}
const gcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b){[a,b]=[b,a%b];}return a||1;};
const M='−';
/* teks bilangan pecahan p/q yang sudah disederhanakan */
export function teksPecah(p,q){if(q<0){p=-p;q=-q;}const g=gcd(p,q);p/=g;q/=g;return (p<0?M:'')+(q===1?String(Math.abs(p)):Math.abs(p)+'/'+q);}
const SUP={'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'};
const pangkat=e=>e===0?'':(e===1?'x':'x'+[...String(e)].map(c=>SUP[c]).join(''));
/* teks satu suku c·x^e dengan c = p/q; tanda dimasukkan */
export function teksSuku(p,q,e){
  if(p===0)return '0';
  const k=teksPecah(p,q),abs=k.replace(M,''),neg=k.startsWith(M);
  const kof=e===0?abs:(abs==='1'?'':abs+(abs.includes('/')?' ':''));
  return (neg?M:'')+kof+pangkat(e);
}
export const teksF=suku=>suku.map(([a,n],i)=>{const t=teksSuku(a,1,n);return i===0?t:(t.startsWith(M)?' '+M+' '+t.slice(1):' + '+t);}).join('');

/* SOAL3[r] = {suku:[[a,n]], x0,y0 (babak 3), opsiC:[teks], cBenar (indeks)} */
export let SOAL3=[];
export function setSeed3(seed){
  const r=acak(seed+'|p3');
  SOAL3=BANK.map((bank,bi)=>{
    const s=bank[Math.floor(r()*bank.length)];
    if(bi<2){const opsi=r()<.5?['+ C','+ 0']:['+ 0','+ C'];return {suku:s,opsiC:opsi,cBenar:opsi.indexOf('+ C')};}
    /* babak 3: C dihitung dari nilai awal F(x0) = y0 */
    let Fx0=0;for(const [a,n] of s.s)Fx0+=a/(n+1)*s.x0**(n+1);
    const C=s.y0-Fx0,cand=[C,s.y0,0,s.y0+Fx0,C+2,C-2].filter((v,i,L)=>L.indexOf(v)===i).slice(0,4);
    const opsi=cand.slice().sort(()=>r()-.5),teks=opsi.map(v=>(v<0?'+ '+M+Math.abs(v):'+ '+v));
    return {suku:s.s,x0:s.x0,y0:s.y0,opsiC:teks,cBenar:opsi.indexOf(C),C};
  });
}
setSeed3('awal');
export const soal3=r=>SOAL3[Math.min(r,NB3-1)];
export const nSlot3=r=>soal3(r).suku.length+1;            /* satu slot per suku, ditambah slot C */

/* balok suku: {i, e (pangkat sekarang), d (pembagi), m (pengali)}; koefisien = a*m/d. Kode slot = 1 + e + 10*(d-1) + 90*(m-1). */
export const MAXK=1+9+10*8+90*8;
export const kodeBalok=b=>1+b.e+10*(b.d-1)+90*(b.m-1);
export const dariKode=(i,k)=>{k-=1;return {i,e:k%10,d:Math.floor(k/10)%9+1,m:Math.floor(k/90)+1};};
export const balokMentah=(r,i)=>({i,e:soal3(r).suku[i][1],d:1,m:1});
export const teksBalok=(r,b)=>{if(b.c!=null)return soal3(r).opsiC[b.c];const a=soal3(r).suku[b.i][0];return teksSuku(a*b.m,b.d,b.e);};
/* pilihan di stasiun untuk satu balok */
export function opsiTungku(b){const L=[{t:'naik ke '+(pangkat(b.e+1)||'x⁰'),e:b.e+1}];if(b.e>0)L.push({t:'turun ke '+(pangkat(b.e-1)||'konstanta'),e:b.e-1});return L.filter(o=>o.e<=9);}
export function opsiPemotong(b){
  const L=[];const add=(t,d,m)=>{if(d<=9&&m<=9&&!L.some(o=>o.d===d&&o.m===m))L.push({t,d,m});};
  if(b.e>=1)add('bagi '+b.e,b.d*b.e,b.m);
  add('bagi '+(b.e+1),b.d*(b.e+1),b.m);
  if(b.e>=2)add('kali '+b.e,b.d,b.m*b.e);
  return L;
}
/* teks F dari isi slot (untuk layar mesin), dan turunannya */
export function sukuSlot(r,s){
  const S=soal3(r),L=[];
  for(let i=0;i<S.suku.length;i++){if(!s[i])continue;const b=dariKode(i,s[i]),a=S.suku[i][0];L.push({p:a*b.m,q:b.d,e:b.e});}
  return L;
}
const gabung=L=>L.length?L.map((t,i)=>{const x=teksSuku(t.p,t.q,t.e);return i===0?x:(x.startsWith(M)?' '+M+' '+x.slice(1):' + '+x);}).join(''):'?';
export function teksFTim(r,s){const S=soal3(r),c=s[S.suku.length];return gabung(sukuSlot(r,s))+(c?' '+S.opsiC[c-1]:'');}
export function teksTurunanTim(r,s){
  const L=sukuSlot(r,s).map(t=>({p:t.p*t.e,q:t.q,e:t.e-1})).filter(t=>t.p!==0);
  return L.length?gabung(L):'0';
}
export function teksFBenar(r){
  const S=soal3(r),L=S.suku.map(([a,n])=>({p:a,q:n+1,e:n+1}));
  return gabung(L)+' '+S.opsiC[S.cBenar];
}
/* penilaian: tiap suku dan slot C bernilai sama */
export function nilai3(r,s){
  const S=soal3(r),n=S.suku.length,cat=new Set();let benar=0;
  for(let i=0;i<n;i++){
    if(!s[i]){cat.add('kosong');continue;}
    const b=dariKode(i,s[i]),[a,p]=S.suku[i];
    const pangkatOk=b.e===p+1,koefOk=b.m*(p+1)===b.d;
    if(pangkatOk&&koefOk){benar++;continue;}
    if(b.e===p-1)cat.add('turun');else if(b.e===p)cat.add('tetap');else if(b.e>p+1)cat.add('naikLagi');
    if(!koefOk){if(b.m>1)cat.add('kali');else if(b.d===p&&p>0)cat.add('bagiLama');else if(b.d===1)cat.add('lupaBagi');else cat.add('koef');}
  }
  const c=s[n];
  if(!c)cat.add(r<2?'lupaC':'kosong');
  else if(c-1===S.cBenar)benar++;
  else cat.add(r<2?'lupaC':'nilaiC');
  return {benar,total:n+1,catatan:[...cat]};
}
export function skorRonde3(r,s,w){const n=nilai3(r,s),akurasi=Math.round(100*n.benar/n.total);return {...n,akurasi,skor:Math.round(akurasi*(.88+.12*w/1000))};}
export const PESAN3={
  turun:'Ada suku yang pangkatnya diturunkan. Itu langkah turunan. Untuk memutar balik, pangkat justru dinaikkan satu.',
  tetap:'Ada suku yang pangkatnya tidak dinaikkan. Antiturunan xⁿ selalu berpangkat n + 1.',
  naikLagi:'Ada suku yang pangkatnya dinaikkan lebih dari satu kali. Cukup naik satu.',
  bagiLama:'Koefisien dibagi pangkat lama. Yang benar dibagi pangkat baru (n + 1): naikkan dulu, lalu bagi dengan pangkat yang baru.',
  kali:'Koefisien dikali pangkat. Itu langkah turunan. Kebalikannya adalah membagi.',
  lupaBagi:'Ada suku yang koefisiennya belum dibagi. Setelah pangkat naik jadi n + 1, koefisien dibagi n + 1.',
  koef:'Koefisien belum tepat. Periksa: turunkan lagi suku itu, hasilnya harus kembali ke suku semula.',
  lupaC:'Konstanta C terlupa atau diganti 0. Banyak fungsi punya turunan yang sama dan hanya berbeda konstanta, jadi antiturunan selalu ditulis + C.',
  nilaiC:'Nilai C belum tepat. Masukkan x0 ke F tanpa C, lalu C = y0 dikurangi hasil itu.',
  kosong:'Ada slot yang belum diisi.'
};
/* keadaan tim */
export const stateBaru3=()=>({r:0,s:Array(nSlot3(0)).fill(0),k:Array(nSlot3(0)).fill(0),sr:[],w:[],f:0});
export const selesai3=st=>st.r>=NB3;
export function skorTim3(st){if(!selesai3(st))return null;let s=0;for(let i=0;i<NB3;i++)s+=skorRonde3(i,st.sr[i],st.w[i]).skor;return Math.round(s/NB3);}
const bil=(v,a,b)=>Number.isInteger(v)&&v>=a&&v<=b;
export const sValid3=(r,s)=>Array.isArray(s)&&r<NB3&&s.length===nSlot3(r)&&s.every((v,i)=>i<s.length-1?bil(v,0,MAXK):bil(v,0,soal3(r).opsiC.length));
export function valid3(s){
  if(!s||typeof s!=='object'||!bil(s.r,0,NB3)||!Array.isArray(s.sr)||s.sr.length!==s.r)return false;
  if(!Array.isArray(s.w)||s.w.length!==s.r||!s.w.every(v=>bil(v,0,1000)))return false;
  if(s.f!==0&&s.f!==1)return false;
  if(s.f===1&&!bil(s.m,-36000000,900000))return false;
  for(let i=0;i<s.r;i++)if(!sValid3(i,s.sr[i]))return false;
  if(s.r>=NB3)return Array.isArray(s.s)&&s.s.length===0;
  return sValid3(s.r,s.s)&&Array.isArray(s.k)&&s.k.length===s.s.length&&s.k.every(v=>Number.isFinite(v)&&v>=0);
}
