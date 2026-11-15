/* Lintasan T-Rex Pos 1: fungsi murni dari waktu (detik jam dinding) dan seed, tanpa pesan jaringan,
   sama seperti rintangan di medan.js. Semua anggota tim melihat T-Rex di tempat yang sama.
   T-Rex berjalan di jaringan jalan (W.JALUR), tidak pernah turun ke plaza dan zona kolom (z < ZMIN),
   berhenti dan mengaum di simpul kamp, lalu mengulang rute tertutup yang diundi dari seed. */
export const KEC=2.4,ZMIN=9,AUM=2.6,R_KENA=1.5,R_AWAS=9,MAJU=1.6,TEPI=6;   // jarak sambar untuk T-Rex setinggi 4,2
/* acak deterministik dari bilangan bulat */
function acak(s){let x=s|0;return ()=>{x=(x+0x6D2B79F5)|0;let t=Math.imul(x^(x>>>15),1|x);t=(t+Math.imul(t^(t>>>7),61|t))^t;return ((t^(t>>>14))>>>0)/4294967296;};}
export function hashTeks(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h|0;}
const kunci=(x,z)=>Math.round(x*10)+','+Math.round(z*10);
/* graf jalan: simpul = ujung ruas JALUR di z >= ZMIN */
function graf(W){
  const S=new Map(),N=[];
  const id=(x,z)=>{const k=kunci(x,z);if(!S.has(k)){S.set(k,N.length);N.push({x,z,tetangga:[],kamp:W.KAMP.some(k=>Math.hypot(k.x-x,k.z-z)<1)});}return S.get(k);};
  /* lewati ruas sempit (jembatan gantung, batu pijakan): T-Rex terlalu besar dan akan menembus rangka palu */
  for(const [x0,z0,x1,z1,lebar] of W.JALUR){if(z0<ZMIN||z1<ZMIN||lebar<2)continue;const a=id(x0,z0),b=id(x1,z1);if(a!==b&&!N[a].tetangga.includes(b)){N[a].tetangga.push(b);N[b].tetangga.push(a);}}
  return N;
}
/* jalur terpendek (BFS jumlah ruas) dari a ke b */
function bfs(N,a,b){const asal=new Map([[a,-1]]),q=[a];while(q.length){const u=q.shift();if(u===b)break;for(const v of N[u].tetangga)if(!asal.has(v)){asal.set(v,u);q.push(v);}}
  const p=[];for(let u=b;u!==-1&&u!==undefined;u=asal.get(u))p.unshift(u);return p[0]===a?p:[a];}
const cache=new Map();
/* rute tertutup: jalan acak 24 ruas dari kamp Bukit (lebih condong ke simpul kamp), lalu jalan terpendek kembali */
export function rute(W,seed){
  const k=seed+'|'+W.JALUR.length;if(cache.has(k))return cache.get(k);
  const N=graf(W),rnd=acak(seed);
  const awal=N.findIndex(n=>n.kamp&&Math.abs(n.x)<1)>=0?N.findIndex(n=>n.kamp&&Math.abs(n.x)<1):0;
  const urut=[awal];let u=awal,dari=-1;
  for(let i=0;i<24;i++){
    let pil=N[u].tetangga.filter(v=>v!==dari);if(!pil.length)pil=N[u].tetangga;
    const bobot=pil.map(v=>N[v].kamp?3:1),tot=bobot.reduce((a,b)=>a+b,0);let r=rnd()*tot,j=0;while(r>bobot[j]){r-=bobot[j];j++;}
    dari=u;u=pil[Math.min(j,pil.length-1)];urut.push(u);
  }
  urut.push(...bfs(N,u,awal).slice(1));
  /* garis waktu. Simpul kamp tidak didatangi sampai pusat (tempat pemain mengambil balok): ruas berhenti di tepi kamp
     (TEPI dari pusat), T-Rex mengaum di sana menghadap kamp, lalu berjalan melingkar di tepi kamp ke ujung ruas berikutnya. */
  const tepi=(k,lain)=>{const d=Math.hypot(lain.x-k.x,lain.z-k.z)||1;return {x:k.x+(lain.x-k.x)/d*TEPI,z:k.z+(lain.z-k.z)/d*TEPI};};
  const ruas=[];
  for(let i=0;i<urut.length-1;i++){const a=N[urut[i]],b=N[urut[i+1]];ruas.push({A:a.kamp?tepi(a,b):a,B:b.kamp?tepi(b,a):b,kamp:b.kamp?b:null});}
  const L=[];let t=0;
  const jalan=(a,b)=>{const d=Math.hypot(b.x-a.x,b.z-a.z);if(d<1e-6)return;L.push({t0:t,t1:t+d/KEC,a,b,aum:false,arah:Math.atan2(b.x-a.x,b.z-a.z)});t+=d/KEC;};
  ruas.forEach((r,i)=>{
    jalan(r.A,r.B);
    const n=ruas[(i+1)%ruas.length];
    if(r.kamp){L.push({t0:t,t1:t+AUM,a:r.B,b:r.B,aum:true,arah:Math.atan2(r.kamp.x-r.B.x,r.kamp.z-r.B.z)});t+=AUM;}
    if(r.kamp){   /* busur lingkaran berjari-jari TEPI, arah putar terpendek */
      const c=r.kamp,a0=Math.atan2(r.B.z-c.z,r.B.x-c.x);let da=Math.atan2(n.A.z-c.z,n.A.x-c.x)-a0;
      da=((da+Math.PI)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)-Math.PI;const d=Math.abs(da)*TEPI;
      if(d>1e-6){L.push({t0:t,t1:t+d/KEC,a:r.B,b:n.A,c,a0,da,aum:false});t+=d/KEC;}
    }else jalan(r.B,n.A);
  });
  const R={L,T:t,N};cache.set(k,R);return R;
}
/* keadaan T-Rex pada waktu t: {x,z,arah,aum} */
export function posTrex(W,seed,t){
  const R=rute(W,seed),tt=((t%R.T)+R.T)%R.T;
  let lo=0,hi=R.L.length-1;while(lo<hi){const m=(lo+hi+1)>>1;if(R.L[m].t0<=tt)lo=m;else hi=m-1;}
  const s=R.L[lo],u=s.t1>s.t0?(tt-s.t0)/(s.t1-s.t0):0;
  if(s.c){const a=s.a0+s.da*u,x=s.c.x+Math.cos(a)*TEPI,z=s.c.z+Math.sin(a)*TEPI,sg=Math.sign(s.da);
    return {x,z,arah:Math.atan2(-Math.sin(a)*sg,Math.cos(a)*sg),aum:false};}   // arah = garis singgung busur
  return {x:s.a.x+(s.b.x-s.a.x)*u,z:s.a.z+(s.b.z-s.a.z)*u,arah:s.arah,aum:s.aum};
}
/* jarak pemain ke badan T-Rex (dua lingkaran: badan dan kepala di depan) */
export function jarakTrex(p,x,z){
  const hx=p.x+Math.sin(p.arah)*MAJU,hz=p.z+Math.cos(p.arah)*MAJU;
  return Math.min(Math.hypot(x-p.x,z-p.z),Math.hypot(x-hx,z-hz));
}
