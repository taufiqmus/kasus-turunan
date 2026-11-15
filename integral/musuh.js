/* Lintasan karakter pengganggu: fungsi murni dari waktu (detik jam dinding) dan seed, tanpa pesan jaringan, sama seperti rintangan di medan.js.
   Semua anggota tim melihat karakter di tempat yang sama. Karakter berjalan di jaringan jalan lebar (W.JALUR), tidak pernah turun ke plaza dan
   zona soal (z < zmin), tidak masuk pusat kamp (tempat mengambil barang), berhenti dan mengaum di tepi kamp, lalu mengulang rute tertutup
   yang diundi dari seed. S = spesies dari fauna.js: {kec, kena, awas, maju}. */
export const AUM=2.6,TEPI=6;
function acak(s){let x=s|0;return ()=>{x=(x+0x6D2B79F5)|0;let t=Math.imul(x^(x>>>15),1|x);t=(t+Math.imul(t^(t>>>7),61|t))^t;return ((t^(t>>>14))>>>0)/4294967296;};}
export function hashTeks(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h|0;}
const kunci=(x,z)=>Math.round(x*10)+','+Math.round(z*10);
export const zMin=W=>W.PLAZA.z1+2.5;
/* graf jalan: simpul = ujung ruas JALUR yang lebar dan berada di luar plaza. Ruas sempit (jembatan, batu pijakan) dilewati: terlalu sempit
   dan penuh rintangan. */
function graf(W,lebarMin){
  const S=new Map(),N=[],zm=zMin(W);
  /* simpul di dalam lingkaran kamp dihitung sebagai simpul kamp (jalan sering berujung di tepi, bukan di pusat) */
  const id=(x,z)=>{const k=kunci(x,z);if(!S.has(k)){S.set(k,N.length);N.push({x,z,tetangga:[],kamp:W.KAMP.find(c=>Math.hypot(c.x-x,c.z-z)<Math.max(1,c.r))||null});}return S.get(k);};
  for(const [x0,z0,x1,z1,lebar] of W.JALUR){if(z0<zm||z1<zm||lebar<lebarMin)continue;const a=id(x0,z0),b=id(x1,z1);if(a!==b&&!N[a].tetangga.includes(b)){N[a].tetangga.push(b);N[b].tetangga.push(a);}}
  /* simpan hanya komponen terhubung terbesar (jaringan jalan sebagian dunia terpecah di persimpangan di tengah ruas) */
  const komp=new Array(N.length).fill(-1),ukr=[];
  for(let i=0;i<N.length;i++){if(komp[i]>=0)continue;const c=ukr.length;let n=0;const q=[i];komp[i]=c;while(q.length){const u=q.pop();n++;for(const v of N[u].tetangga)if(komp[v]<0){komp[v]=c;q.push(v);}}ukr.push(n);}
  const best=ukr.indexOf(Math.max(...ukr,0));N.forEach((n,i)=>{n.komp=komp[i];n.ok=komp[i]===best;});
  return N;
}
function bfs(N,a,b){const asal=new Map([[a,-1]]),q=[a];while(q.length){const u=q.shift();if(u===b)break;for(const v of N[u].tetangga)if(!asal.has(v)){asal.set(v,u);q.push(v);}}
  const p=[];for(let u=b;u!==-1&&u!==undefined;u=asal.get(u))p.unshift(u);return p[0]===a?p:[a];}
const cache=new WeakMap();
/* rute tertutup: jalan acak 24 ruas dari simpul awal (kamp diutamakan), lalu jalan terpendek kembali. Bila graf kosong, rute kosong. */
export function rute(W,seed,S){
  const kec=S.kec;let m=cache.get(W);if(!m)cache.set(W,m=new Map());
  const k=seed+'|'+kec+'|'+S.lebar;if(m.has(k))return m.get(k);
  const N=graf(W,S.lebar),rnd=acak(seed);
  if(!N.length){const R={L:[],T:1,N};m.set(k,R);return R;}
  let awal=N.findIndex(n=>n.ok&&n.kamp);if(awal<0)awal=N.findIndex(n=>n.ok);
  const urut=[awal];let u=awal,dari=-1;
  for(let i=0;i<24;i++){
    let pil=N[u].tetangga.filter(v=>v!==dari);if(!pil.length)pil=N[u].tetangga;if(!pil.length)break;
    const bobot=pil.map(v=>N[v].kamp?3:1),tot=bobot.reduce((a,b)=>a+b,0);let r=rnd()*tot,j=0;while(r>bobot[j]){r-=bobot[j];j++;}
    dari=u;u=pil[Math.min(j,pil.length-1)];urut.push(u);
  }
  urut.push(...bfs(N,u,awal).slice(1));
  /* Simpul kamp tidak didatangi sampai pusat: ruas berhenti di tepi kamp (TEPI dari pusat), karakter mengaum menghadap kamp, lalu berjalan
     melingkar di tepi kamp ke ujung ruas berikutnya. Dua titik di lingkaran kamp yang sama selalu dihubungkan lewat busur, bukan tali busur. */
  const tepi=(c,lain)=>{const d=Math.hypot(lain.x-c.x,lain.z-c.z)||1;return {x:c.x+(lain.x-c.x)/d*TEPI,z:c.z+(lain.z-c.z)/d*TEPI};};
  const ruas=[];
  for(let i=0;i<urut.length-1;i++){const a=N[urut[i]],b=N[urut[i+1]],sama=a.kamp&&a.kamp===b.kamp;
    ruas.push({A:a.kamp?tepi(a.kamp,b):a,B:b.kamp?tepi(b.kamp,a):b,kamp:b.kamp&&!sama?b.kamp:null,sama});}
  const L=[];let t=0;
  /* ruas lurus. Bila memotong lingkaran kamp (jalan sering melewati pusat kamp), diganti: lurus sampai tepi, busur mengitari, lurus lagi. */
  const lurus=(a,b)=>{
    const dx=b.x-a.x,dz=b.z-a.z,A=dx*dx+dz*dz;if(A<1e-12)return;
    for(const c of W.KAMP){
      const fx=a.x-c.x,fz=a.z-c.z,B=2*(fx*dx+fz*dz),C=fx*fx+fz*fz-TEPI*TEPI,disc=B*B-4*A*C;
      if(disc<=0)continue;const sq=Math.sqrt(disc),t1=(-B-sq)/(2*A),t2=(-B+sq)/(2*A);
      if(t1>1e-6&&t2<1-1e-6){
        const E1={x:a.x+dx*t1,z:a.z+dz*t1},E2={x:a.x+dx*t2,z:a.z+dz*t2};
        lurus(a,E1);sambung(E1,E2);lurus(E2,b);return;
      }
    }
    L.push({t0:t,t1:t+Math.sqrt(A)/kec,a,b,aum:false,arah:Math.atan2(dx,dz)});t+=Math.sqrt(A)/kec;
  };
  const sambung=(P,Q)=>{
    const c=W.KAMP.find(k=>Math.abs(Math.hypot(P.x-k.x,P.z-k.z)-TEPI)<.05&&Math.abs(Math.hypot(Q.x-k.x,Q.z-k.z)-TEPI)<.05);
    if(!c){lurus(P,Q);return;}
    const a0=Math.atan2(P.z-c.z,P.x-c.x);let da=Math.atan2(Q.z-c.z,Q.x-c.x)-a0;
    da=((da+Math.PI)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)-Math.PI;const d=Math.abs(da)*TEPI;
    if(d>1e-6){L.push({t0:t,t1:t+d/kec,a:P,b:Q,c,a0,da,aum:false});t+=d/kec;}
  };
  ruas.forEach((r,i)=>{
    sambung(r.A,r.B);
    if(r.kamp){L.push({t0:t,t1:t+AUM,a:r.B,b:r.B,aum:true,arah:Math.atan2(r.kamp.x-r.B.x,r.kamp.z-r.B.z)});t+=AUM;}
    sambung(r.B,ruas[(i+1)%ruas.length].A);
  });
  const R={L,T:Math.max(t,1),N};m.set(k,R);return R;
}
/* keadaan pada waktu t: {x,z,arah,aum}; null bila dunia tidak punya jalan yang cocok */
export function posMusuh(W,seed,t,S){
  const R=rute(W,seed,S);if(!R.L.length)return null;
  const tt=((t%R.T)+R.T)%R.T;
  let lo=0,hi=R.L.length-1;while(lo<hi){const m=(lo+hi+1)>>1;if(R.L[m].t0<=tt)lo=m;else hi=m-1;}
  const s=R.L[lo],u=s.t1>s.t0?(tt-s.t0)/(s.t1-s.t0):0;
  if(s.c){const a=s.a0+s.da*u,sg=Math.sign(s.da);
    return {x:s.c.x+Math.cos(a)*TEPI,z:s.c.z+Math.sin(a)*TEPI,arah:Math.atan2(-Math.sin(a)*sg,Math.cos(a)*sg),aum:false};}   // arah = garis singgung busur
  return {x:s.a.x+(s.b.x-s.a.x)*u,z:s.a.z+(s.b.z-s.a.z)*u,arah:s.arah,aum:s.aum};
}
/* jarak pemain ke karakter (dua lingkaran: badan dan kepala di depan) */
export function jarakMusuh(p,S,x,z){
  const hx=p.x+Math.sin(p.arah)*S.maju,hz=p.z+Math.cos(p.arah)*S.maju;
  return Math.min(Math.hypot(x-p.x,z-p.z),Math.hypot(x-hx,z-hz));
}
