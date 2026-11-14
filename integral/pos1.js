/* Pos 1: Tambal Waduk v3. Tim membawa balok ke kolom. Tinggi tiap kolom harus sama dengan nilai fungsi di titik
   contoh kolom itu (kiri, kanan, atau tengah), dibulatkan ke 0,5. Kurva dan aturan diundi per tim per babak lewat roda,
   dengan benih dari kode ruang dan tim, jadi satu tim melihat hasil yang sama tanpa pesan jaringan.
   Modul ini hanya logika, tanpa tampilan 3D. */
export const BABAK=[3,6,12],XMAX=3,YMAX=10,UBAG=.5,MAXBAG=19,CAP=2,WAKTU=[180,300,480];

export const KURVA=[
  {tx:'y = x²',f:x=>x*x,F:x=>x**3/3},
  {tx:'y = 9 - x²',f:x=>9-x*x,F:x=>9*x-x**3/3},
  {tx:'y = 3x',f:x=>3*x,F:x=>1.5*x*x},
  {tx:'y = 9 - 3x',f:x=>9-3*x,F:x=>9*x-1.5*x*x},
  {tx:'y = x²/2 + 1',f:x=>x*x/2+1,F:x=>x**3/6+x},
  {tx:'y = x³/3',f:x=>x**3/3,F:x=>x**4/12}
];
export const ATURAN=[
  {tx:'titik kiri',s:(i,n)=>i*XMAX/n},
  {tx:'titik kanan',s:(i,n)=>(i+1)*XMAX/n},
  {tx:'titik tengah',s:(i,n)=>(i+.5)*XMAX/n}
];

/* benih -> urutan acak yang sama di semua perangkat satu tim */
function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function acak(seed){let a=hash(seed);return()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}
function kocok(n,r){const L=Array.from({length:n},(_,i)=>i);for(let i=n-1;i>0;i--){const j=Math.floor(r()*(i+1));[L[i],L[j]]=[L[j],L[i]];}return L;}
export let RENCANA=[];
export function setSeed(seed){
  const r=acak(seed),k=kocok(KURVA.length,r),a=kocok(ATURAN.length,r);
  RENCANA=BABAK.map((_,i)=>({k:k[i],a:a[i]}));
}
setSeed('awal');
export const kurvaBabak=r=>KURVA[RENCANA[Math.min(r,BABAK.length-1)].k];
export const aturanBabak=r=>ATURAN[RENCANA[Math.min(r,BABAK.length-1)].a];
export const titikX=r=>{const n=BABAK[r],a=aturanBabak(r);return Array.from({length:n},(_,i)=>a.s(i,n));};
export const targetH=r=>{const k=kurvaBabak(r);return titikX(r).map(x=>k.f(x));};
export const luasAsli=r=>{const k=kurvaBabak(r);return k.F(XMAX)-k.F(0);};

/* c: jumlah balok tiap kolom, w: sisa waktu dalam per mil (0 sampai 1000) saat babak dikunci */
export function skorRonde(r,c,w){
  const n=c.length,dx=XMAX/n,tg=targetH(r);let S=0,luas=0;
  /* galat dihitung dalam satuan balok, di luar pembulatan terdekat (selisih setengah balok tidak dihukum) */
  for(let i=0;i<n;i++){luas+=c[i]*UBAG*dx;S+=Math.max(0,Math.abs(c[i]-tg[i]/UBAG)-.5);}
  const akurasi=Math.round(100*Math.exp(-S/1.2));
  const skor=Math.round(akurasi*(.88+.12*w/1000));
  return {luas,asli:luasAsli(r),selisih:luas-luasAsli(r),S,akurasi,skor};
}
export const stateBaru=()=>({r:0,c:Array(BABAK[0]).fill(0),sr:[],w:[],f:0});
export const selesai=st=>st.r>=BABAK.length;
export function skorTim(st){
  if(!selesai(st))return null;
  let s=0;for(let i=0;i<BABAK.length;i++)s+=skorRonde(i,st.sr[i],st.w[i]).skor;
  return Math.round(s/BABAK.length);
}
/* kiriman dari jaringan tidak dipercaya */
const bil=(v,a,b)=>Number.isInteger(v)&&v>=a&&v<=b;
export function cValid(r,c){return Array.isArray(c)&&r<BABAK.length&&c.length===BABAK[r]&&c.every(v=>bil(v,0,MAXBAG));}
export function valid(s){
  if(!s||typeof s!=='object'||!bil(s.r,0,BABAK.length)||!Array.isArray(s.sr)||s.sr.length!==s.r)return false;
  if(!Array.isArray(s.w)||s.w.length!==s.r||!s.w.every(v=>bil(v,0,1000)))return false;
  if(s.f!==0&&s.f!==1)return false;
  if(s.f===1&&!bil(s.m,0,600000))return false;
  for(let i=0;i<s.r;i++)if(!cValid(i,s.sr[i]))return false;
  return s.r>=BABAK.length?Array.isArray(s.c)&&s.c.length===0:cValid(s.r,s.c);
}
export const jumlah=c=>c.reduce((a,b)=>a+b,0);

/* grafik mini hanya-baca; kurva digambar hanya bila fungsi diberikan (setelah babak terkunci) */
export function gambarMini(cv,c,warna,fKurva){
  const g=cv.getContext('2d'),W=cv.width,H=cv.height,pl=22,pb=14,pt=6,pr=6,n=c.length,dx=XMAX/n;
  const X=x=>pl+x/XMAX*(W-pl-pr),Y=y=>H-pb-y/YMAX*(H-pb-pt);
  g.clearRect(0,0,W,H);g.fillStyle='#fffdf6';g.fillRect(0,0,W,H);
  g.strokeStyle='#e5dcc6';g.lineWidth=1;g.fillStyle='#1c2230';g.font='10px sans-serif';g.textAlign='right';g.textBaseline='middle';
  for(let y=0;y<=9;y+=UBAG){g.beginPath();g.moveTo(X(0),Y(y));g.lineTo(X(XMAX),Y(y));g.stroke();if(y%3===0)g.fillText(String(y),pl-3,Y(y));}
  for(let i=0;i<n;i++){
    const h=c[i]*UBAG,x0=X(i*dx),x1=X((i+1)*dx);
    g.fillStyle=warna+'bb';g.fillRect(x0,Y(h),x1-x0,Y(0)-Y(h));
    g.strokeStyle='#1c2230';g.lineWidth=1;g.strokeRect(x0,Y(h),x1-x0,Y(0)-Y(h));
  }
  if(fKurva){
    g.strokeStyle='#e5392b';g.lineWidth=2;g.beginPath();
    for(let k=0;k<=40;k++){const x=k/40*XMAX;k?g.lineTo(X(x),Y(fKurva(x))):g.moveTo(X(x),Y(fKurva(x)));}
    g.stroke();
  }
  g.strokeStyle='#1c2230';g.lineWidth=2;g.strokeRect(X(0),Y(YMAX),X(XMAX)-X(0),Y(0)-Y(YMAX));
}
