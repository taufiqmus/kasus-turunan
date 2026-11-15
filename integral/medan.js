/* Mesin dunia pos: geometri (jalur, kamp, tinggi tanah) dan rintangan. Satu definisi data per pos,
   buatMedan(D) mengembalikan semua fungsi murni untuk dunia itu. Rintangan bergantung pada jam dinding (detik)
   sehingga sama di semua perangkat tanpa pesan jaringan. Tidak memuat tampilan 3D. */
import {rute as ruteJalan,posMusuh} from './musuh.js';
const TAU=Math.PI*2;
const fr=v=>v-Math.floor(v);
export const ss=(a,b,v)=>{const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t);};
export const dalam=(R,x,z)=>R?Math.min(x-R.x0,R.x1-x,z-R.z0,R.z1-z):-1;
export const derau=(x,z)=>Math.sin(x*.37+z*.21)*Math.sin(z*.33-x*.17)+.5*Math.sin(x*.9+1.3)*Math.sin(z*.8+.7);
export const PAL_L=3.6,PAL_A=3.0,PAL_Y=4.4;
export const DURI_HIT=.8,BOLA_R=1.1,RINT_R=.9,RINT_MAKS=12,DURI_MAKS=10;
/* tiga petak duri melintang tegak lurus arah ruas (dx,dz) di titik (x,z) */
/* kawanan yang menyapu semua jalan (lihat M.posPatroli): n0[k] kawanan di komponen jaringan utama babak k, ditambah satu kawanan di tiap komponen jalan
   lain (jumlah komponen = nKomp), supaya tidak ada jalan yang luput dan tidak ada jalan yang tertutup terus. Kecepatan naik tiap babak. */
const sapuRute=(k,nKomp,n0,r=1.3)=>{const kec=[2.2,2.6,3][k];return [...Array.from({length:n0[k]},(_,i)=>({rute:true,komp:0,kec,r,f:i/n0[k]})),...Array.from({length:nKomp-1},(_,i)=>({rute:true,komp:i+1,kec,r,f:0}))];};
const lintang=(x,z,dx,dz)=>{const L=Math.hypot(dx,dz),px=dz/L,pz=-dx/L;return [-1.4,0,1.4].map(o=>[x+px*o,z+pz*o]);};
const baris=(cx,z,s)=>[[cx-s,z],[cx,z],[cx+s,z]];
function jarakRuas(x,z,s){
  const dx=s[2]-s[0],dz=s[3]-s[1],L=dx*dx+dz*dz,t=L?Math.max(0,Math.min(1,((x-s[0])*dx+(z-s[1])*dz)/L)):0;
  return Math.hypot(x-s[0]-dx*t,z-s[1]-dz*t);
}

export function buatMedan(D){
  const M={...D};
  /* jarak bertanda ke daerah yang boleh diinjak: negatif di dalam, positif di luar */
  M.jarakJalan=(x,z)=>{
    let d=1e9;
    for(const s of D.JALUR)d=Math.min(d,jarakRuas(x,z,s)-s[4]);
    for(const k of D.KAMP)d=Math.min(d,Math.hypot(x-k.x,z-k.z)-k.r);
    if(D.LINGKAR)for(const k of D.LINGKAR)d=Math.min(d,Math.hypot(x-k.x,z-k.z)-k.r);
    const P=D.PLAZA,px=Math.max(P.x0-x,x-P.x1),pz=Math.max(P.z0-z,z-P.z1);
    return Math.min(d,Math.max(px,pz));
  };
  const G=D.GERBANG,s0=D.JALUR[G.ruas];
  M.diGerbang=(x,z)=>z>G.z0&&z<G.z1&&x>G.x0&&x<G.x1&&jarakRuas(x,z,s0)<s0[4];
  M.boleh=(x,z,gerbangBuka)=>!(M.jarakJalan(x,z)>0)&&(gerbangBuka||!M.diGerbang(x,z));
  M.tinggi=D.tinggi;
  /* tinggi permukaan tanah yang digambar: jalur mengikuti tinggi() persis, di luar jalur tanah bergelombang,
     tepi dunia menjulang jadi tebing, jurang dan dasar air dikeruk */
  M.tinggiTanah=(x,z)=>{
    if(z<-.6)return 0;
    const d=M.jarakJalan(x,z),w=Math.max(0,Math.min(1,d/3));
    let h=D.tinggi(x,z)+w*(.9*derau(x,z)+.5)+w*11*D.tebing(x,z);
    const dj=dalam(D.JURANG,x,z);if(dj>0)h-=6*ss(0,1.4,dj);
    const ds=dalam(D.AIR,x,z);if(ds>0){const k=ss(0,.9,ds);h=h*(1-k)-1.3*k;}
    return h;
  };
  M.diKamp=(x,z)=>{for(let i=0;i<D.KAMP.length;i++)if(Math.hypot(x-D.KAMP[i].x,z-D.KAMP[i].z)<D.KAMP[i].r-1.4)return i;return -1;};
  M.diPad=(x,z)=>Math.hypot(x-D.PAD.x,z-D.PAD.z)<D.PAD.r;
  M.diTuas=(x,z)=>Math.hypot(x-D.TUAS.x,z-D.TUAS.z)<D.TUAS.r;
  const CACHE=[];
  M.medanBabak=r=>{const k=Math.max(0,Math.min(r,2));if(CACHE[k])return CACHE[k];
    const m=D.rintangan(k);for(const j of ['kayu','palu','pintu','duri','ubin','bola','penekan','lengan','rakit','jatuh','patroli','pasang'])m[j]=m[j]||[];
    m.ban=m.ban||{x0:0,x1:0,z0:0,z1:0,v:0,T:12};return CACHE[k]=m;};
  M.xKayu=(s,t)=>s.m+s.A*Math.sin(TAU*(t/s.T+s.f));
  M.posKayu=(s,t)=>{const v=M.xKayu(s,t);return s.ax==='x'?[v,s.c]:[s.c,v];};
  M.xPalu=(p,t)=>PAL_A*Math.sin(TAU*(t/p.T+p.f));
  const PI=D.PINTU;
  M.celahPintu=(p,t)=>PI.min+(PI.max-PI.min)*(.5+.5*Math.sin(TAU*(t/p.T+p.f)));
  /* duri: fraksi tinggi 0..1; naik penuh pada fase awal, turun cepat, lalu naik pelan sebagai peringatan */
  M.tinggiDuri=(p,i,t)=>{const u=fr(t/p.T+p.f+i*.33);if(u<.42)return 1;if(u<.5)return 1-(u-.42)/.08;if(u>.88)return (u-.88)/.12*.45;return 0;};
  M.duriNaik=(p,i,t)=>fr(t/p.T+p.f+i*.33)<.42;
  /* batu pijakan: 0 kokoh, 1 goyah (peringatan), 2 tenggelam */
  M.statusUbin=(u,t)=>{const v=fr(t/u.T+u.f);return v<.5?0:(v<.68?1:(v<.9?2:0));};
  M.keadaanBola=(b,t)=>{const u=fr(t/b.T+b.f);if(u<.2)return {fase:'peringatan',z:b.z0,u};if(u<.58)return {fase:'gulir',z:b.z0+(u-.2)/.38*(b.z1-b.z0),u};return {fase:null,z:b.z0,u};};
  /* kecepatan ban berjalan sepanjang sumbu z (positif = menjauhi plaza) */
  M.kecBan=(m,t)=>m.ban.balik?m.ban.v*Math.sin(TAU*t/m.ban.T):m.ban.v;
  M.diBan=(m,x,z)=>m.ban.ax==='x'?(x>m.ban.x0&&x<m.ban.x1&&z>m.ban.z0-.2&&z<m.ban.z1+.2):(x>m.ban.x0-.2&&x<m.ban.x1+.2&&z>m.ban.z0&&z<m.ban.z1);
  M.diTramp=(m,x,z)=>!!m.tramp&&Math.hypot(x-m.tramp.x,z-m.tramp.z)<m.tramp.r;
  /* penekan pabrik: naik (aman), bergetar (peringatan), menekan (bahaya), naik lagi. h = tinggi kepala 0..1 */
  M.penekan=(p,t)=>{const u=fr(t/p.T+p.f);if(u<.5)return {fase:0,h:1};if(u<.62)return {fase:1,h:1};if(u<.8)return {fase:2,h:Math.max(0,1-(u-.62)/.04)};return {fase:3,h:(u-.8)/.2};};
  /* lengan putar rendah di pusat (x,z): n lengan sepanjang L, bisa dilompati */
  M.sudutLengan=(L,t)=>L.w*t+TAU*L.f;
  M.kenaLengan=(L,x,z,t)=>{const dx=x-L.x,dz=z-L.z,r=Math.hypot(dx,dz);if(r>L.L+.35)return false;if(r<.7)return true;
    const a=Math.atan2(dz,dx),s=M.sudutLengan(L,t);for(let i=0;i<L.n;i++){let d=a-(s+TAU*i/L.n);d=Math.atan2(Math.sin(d),Math.cos(d));if(Math.abs(d)*r<.6)return true;}return false;};
  /* rakit di lajur air: diam di ujung awal, menyeberang, diam di ujung akhir, kembali. Hasil: pusat rakit di sepanjang sumbu */
  M.posRakit=(R,t)=>{const u=fr(t/R.T+R.f),p0=R.a0+R.len/2,p1=R.a1-R.len/2;
    const k=u<.2?0:u<.5?ss(0,1,(u-.2)/.3):u<.7?1:1-ss(0,1,(u-.7)/.3);return p0+(p1-p0)*k;};
  const diLajur=(R,x,z)=>{const a=R.ax==='x'?x:z,c=R.ax==='x'?z:x;return Math.abs(c-R.c)<R.lebar+.25&&a>R.a0&&a<R.a1;};
  const diAtasRakit=(R,x,z,t)=>{const a=R.ax==='x'?x:z;return Math.abs(a-M.posRakit(R,t))<R.len/2+.1;};
  M.lajur=(r,x,z)=>M.medanBabak(r).rakit.some(R=>diLajur(R,x,z));
  /* indeks rakit yang sedang dinaiki, atau -1 */
  M.rakitDi=(m,x,z,t)=>m.rakit.findIndex(R=>diLajur(R,x,z)&&diAtasRakit(R,x,z,t));
  /* kecepatan rakit yang sedang dinaiki (untuk ikut terbawa), atau null */
  M.kecRakit=(m,x,z,t)=>{for(const R of m.rakit)if(diLajur(R,x,z)&&diAtasRakit(R,x,z,t)){const v=(M.posRakit(R,t+.05)-M.posRakit(R,t-.05))/.1;return R.ax==='x'?[v,0]:[0,v];}return null;};
  /* es atau batu jatuh: tiap siklus, n titik acak tetap (sama di semua perangkat) diberi bayangan lalu tertimpa */
  const acak=(c,i,k)=>fr(Math.sin(c*12.9898+i*78.233+k*37.719)*43758.5453);
  M.titikJatuh=(J,t)=>{const v=t/J.T+J.f,c=Math.floor(v),u=v-c,L=[];
    for(let i=0;i<J.n;i++){const ui=fr(u+i*.13);L.push({x:J.x0+(J.x1-J.x0)*acak(c,i,1),z:J.z0+(J.z1-J.z0)*acak(c,i,2),u:ui});}return L;};
  /* kawanan berpatroli. Dua jenis:
     - bolak-balik di sepanjang satu ruas (x0,z0)-(x1,z1);
     - P.rute: menyapu SEMUA ruas jalan (komponen jaringan nomor P.komp) dalam satu putaran tertutup dengan kecepatan tetap P.kec, melewati tepi
       kamp, bukan pusatnya. Beberapa kawanan memakai rute yang sama dengan fase P.f (0..1) berbeda, jadi jarak antarkawanan tetap dan pemain bisa
       menunggu atau memilih rute lain. */
  const spekRute={};
  const spek=P=>{const k=P.kec+'|'+(P.komp|0);return spekRute[k]||(spekRute[k]={kec:P.kec,lebar:0,semua:true,berhenti:false,komp:P.komp|0});};
  M.periodeRute=P=>ruteJalan(M,0,spek(P)).T;
  M.posPatroli=(P,t)=>{
    if(P.rute){const S=spek(P),p=posMusuh(M,0,t+P.f*ruteJalan(M,0,S).T,S);return p?[p.x,p.z]:[-999,-999];}
    const u=fr(t/P.T+P.f),k=u<.5?ss(0,1,u*2):1-ss(0,1,(u-.5)*2);return [P.x0+(P.x1-P.x0)*k,P.z0+(P.z1-P.z0)*k];
  };
  /* pasang surut: zona kering, lalu air naik (peringatan), lalu tergenang (bahaya), lalu surut. h = tinggi air 0..1 */
  M.pasang=(Z,t)=>{const u=fr(t/Z.T+Z.f);if(u<.5)return {fase:0,h:0};if(u<.65)return {fase:1,h:(u-.5)/.15*.6};if(u<.85)return {fase:2,h:1};return {fase:3,h:1-(u-.85)/.15};};
  /* Apakah titik (x,z) terkena bahaya pada waktu t? udara = pemain sedang di puncak lompatan.
     Palu dan pintu tidak bisa dilompati. Hasil: {j, mundur (jarak terpental ke belakang), msg}. */
  M.bahaya=(r,x,z,t,udara)=>{
    const m=M.medanBabak(r);
    for(const p of m.penekan)if(x>p.x0&&x<p.x1&&z>p.z0&&z<p.z1&&M.penekan(p,t).fase===2)return {j:'penekan',mundur:3,msg:D.teks.penekan};
    for(const P of m.patroli){const [px,pz]=M.posPatroli(P,t);if(Math.hypot(x-px,z-pz)<P.r+.3)return {j:'patroli',mundur:3,msg:D.teks.patroli};}
    for(const Z of m.pasang)if(x>Z.x0&&x<Z.x1&&z>Z.z0&&z<Z.z1&&M.pasang(Z,t).fase===2)return {j:'pasang',mundur:4,msg:D.teks.pasang};
    for(const R of m.rakit)if(diLajur(R,x,z)&&!diAtasRakit(R,x,z,t))return {j:'air',mundur:4,msg:D.teks.air};
    for(const J of m.jatuh)for(const q of M.titikJatuh(J,t))if(q.u>.55&&q.u<.68&&Math.hypot(x-q.x,z-q.z)<J.r)return {j:'jatuh',mundur:2.5,msg:D.teks.jatuh};
    for(const p of m.palu)if(Math.abs(z-p.z)<.65&&Math.abs(x-p.x-M.xPalu(p,t))<.85)return {j:'palu',mundur:3,msg:D.teks.palu};
    for(const p of m.pintu){
      if(x<PI.x0-.3||x>PI.x1+.3||Math.abs(z-p.z)>=.5)continue;
      const ce=M.celahPintu(p,t);if(ce<.9||Math.abs(x-PI.cx)>ce/2)return {j:'pintu',mundur:3,msg:D.teks.pintu};
    }
    if(udara)return null;
    for(const L of m.lengan)if(M.kenaLengan(L,x,z,t))return {j:'lengan',mundur:3,msg:D.teks.lengan};
    for(const s of m.kayu){const [kx,kz]=M.posKayu(s,t);if(s.ax==='x'?(Math.abs(z-kz)<.95&&Math.abs(x-kx)<RINT_R):(Math.abs(x-kx)<.95&&Math.abs(z-kz)<RINT_R))return {j:'kayu',mundur:2.4,msg:D.teks.kayu};}
    for(const p of m.duri)for(let i=0;i<p.pts.length;i++)
      if(M.duriNaik(p,i,t)&&Math.hypot(x-p.pts[i][0],z-p.pts[i][1])<DURI_HIT)return {j:'duri',mundur:3,msg:D.teks.duri};
    for(const u of m.ubin)if(Math.abs(x-u.x)<=(u.w||D.UBIN.W)/2+.3&&Math.abs(z-u.z)<(u.d||D.UBIN.D)/2&&M.statusUbin(u,t)===2)return {j:'ubin',mundur:7,msg:D.teks.ubin};
    for(const b of m.bola){const s=M.keadaanBola(b,t);if(s.fase==='gulir'&&Math.abs(x-b.x)<BOLA_R&&Math.abs(z-s.z)<BOLA_R)return {j:'bola',mundur:4,msg:D.teks.bola};}
    return null;
  };
  return M;
}

/* ================= Pos 1: Lembah Waduk ================= */
const HW=2.2,XH=-21,XS=21;
export const M1=buatMedan({
  nama:'Lembah Waduk',
  DUNIA:{x0:-46,x1:46,z0:-6,z1:70},
  PLAZA:{x0:-15,x1:15,z0:.4,z1:6.5},
  KAMP:[{x:-28,z:42,r:4.2,nama:'Hutan'},{x:0,z:53,r:4.2,nama:'Bukit'},{x:28,z:42,r:4.2,nama:'Sungai'}],
  PAD:{x:12.5,z:3.1,r:2},TUAS:{x:-12.5,z:3.1,r:1.8},
  /* jalur: [x1,z1,x2,z2,setengah lebar]. Indeks 0..2 adalah jalan pintas bertuas. */
  JALUR:[
    [-6,6,-9,20,2],[-9,20,-12,34,2],[-12,34,-14,50,2],
    [-13,5,-21,11,HW],[-21,11,-21,25,HW],[-21,25,-26,32,HW],[-26,32,-28,42,HW],
    [-21,11,-33,13,2],[-33,13,-39,24,2],[-39,24,-38,36,2],[-38,36,-28,42,2],[-39,24,-42.5,29,1.8],
    [0,6,0,24,4.4],[0,24,0,26,2.4],[0,26,0,32,1.3],[0,32,0,53,2.4],
    [3,8,12,12,2],[12,12,8,22,2],[8,22,15,30,2],[15,30,9,40,2],[9,40,0,53,2],[15,30,16,34.5,1.8],
    [13,5,21,11,HW],[21,11,21,29,HW],[21,29,26,34,HW],[26,34,28,42,HW],[21,21,24.5,21,1.6],
    [21,11,33,12,2],[33,12,40,22,2],[40,22,38,36,2],[38,36,28,42,2],[40,22,43,27,1.8],
    [-28,42,-14,50,2],[-14,50,0,53,2],[0,53,14,50,2],[14,50,28,42,2]
  ],
  GERBANG:{ruas:0,z0:11,z1:12.3,x0:-12,x1:-4.6},
  JURANG:{x0:-7.5,x1:7.5,z0:26.2,z1:31.8},
  GANTUNG:{x:0,z0:25.7,z1:32.3},
  AIR:{x0:18.4,x1:46,z0:15,z1:20},AIR_JATUH:'timur',
  JEMB_KAYU:[33,12,40,22],
  tinggi:(x,z)=>5*ss(10,26,z)*(1-ss(7,19,Math.abs(x))),
  tebing:(x,z)=>Math.max(ss(37,46,Math.abs(x)),ss(60,69,z)),
  KOIN_A:[[-42.5,29],[-41,26.5],[-36,18],[-39,31],[16,34.5],[15.4,32.4],[10,17],[12,35],[43,27],[41.5,24.5],[37,29],[24.5,21],[-10.5,27],[-13,42],[14,50],[-14,50]],
  PINTU:{cx:XH,x0:XH-HW,x1:XH+HW,min:.3,max:3.6},
  UBIN:{W:2*HW,D:1.6},
  BAN:{x0:XS-HW,x1:XS+HW,z0:22.8,z1:27.6},
  teks:{palu:'Terkena palu!',pintu:'Terjepit pintu geser!',kayu:'Tertabrak gelondong!',duri:'Terkena duri!',ubin:'Batu pijakan tenggelam! Hanyut.',bola:'Tertabrak bola!'},
  rintangan(k){
    const BAN=this.BAN;
    return {
      kayu:[[12.5,0],[17,.5],[21,.25],[14.8,.75]].slice(0,[2,3,4][k]).map(([z,f])=>({ax:'x',c:z,m:0,A:4.5,f,T:[6,5,4.2][k]})).concat([
        {ax:'x',c:30,m:-38.5,A:2.7,f:.1},{ax:'x',c:37,m:10.8,A:2.9,f:.4},{ax:'x',c:30,m:38.86,A:2.7,f:.7},
        {ax:'z',c:-21,m:46,A:2.9,f:.2},{ax:'z',c:21,m:46,A:2.9,f:.6},{ax:'x',c:27,m:-10.5,A:2.7,f:.9}
      ].map(o=>({...o,T:[6.5,5.6,4.8][k]}))),
      palu:[[{x:0,z:29,T:4.2,f:0}],[{x:0,z:29,T:3.6,f:0}],[{x:0,z:27.7,T:3.4,f:0},{x:0,z:30.3,T:3.0,f:.5}]][k],
      pintu:[{z:15.5,T:[6.2,5.2,4.4][k],f:0}],
      duri:[[{pts:baris(XH,20,1.5),T:3.6,f:0}],[{pts:baris(XH,20,1.5),T:3.0,f:0}],[{pts:baris(XH,20,1.5),T:3.0,f:0},{pts:baris(XH,22.4,1.5),T:2.6,f:.5}]][k].concat([
        {pts:lintang(-36,18.5,-6,11),f:.2},{pts:lintang(10,17,-4,10),f:.5},{pts:lintang(38.29,34,-2,14),f:.8},
        {pts:lintang(-7,51.5,14,3),f:.35},{pts:lintang(7,51.5,14,-3),f:.65},{pts:lintang(-13,42,-2,16),f:.05}
      ].map(o=>({...o,T:[4.2,3.6,3.2][k]}))),
      ubin:[15.8,17.4,19.0].map((z,n)=>({x:XS,z,f:fr(n*.37),T:[7,6,5][k]})),
      ban:{...BAN,balik:k===2,v:[2.0,2.8,3.4][k],T:12},
      tramp:k===2?{x:24.5,z:21,r:1.2,x1:21,z1:13.2,dur:1100}:null,
      bola:[[{x:-1.2,T:13,f:0}],[{x:-1.2,T:11,f:0}],[{x:-1.2,T:10,f:0},{x:1.2,T:10,f:.5}]][k].map(b=>({...b,z0:51,z1:33.5}))
    };
  }
});

/* ================= Pos 2: Ngarai Kuil ================= */
/* Kiri: Oasis (batu pijakan di kolam, aliran pasir, trampolin). Tengah: tanjakan kuil (batu silinder, pintu batu,
   jebakan duri, batu menggelinding dari menara). Kanan: Reruntuhan (jebakan duri, jembatan gantung di atas jurang
   dengan bilah ayun). Tiap wilayah punya jalur memutar; jalan pintas bertuas di antara tengah dan kanan. */
const XO=-24,XR=30;
export const M2=buatMedan({
  nama:'Ngarai Kuil',
  DUNIA:{x0:-48,x1:48,z0:-6,z1:72},
  PLAZA:{x0:-15,x1:15,z0:.4,z1:8.6},
  KAMP:[{x:-30,z:36,r:4.2,nama:'Oasis'},{x:0,z:62,r:4.2,nama:'Menara'},{x:32,z:46,r:4.2,nama:'Reruntuhan'}],
  PAD:{x:12.5,z:6.6,r:2},TUAS:{x:-12.5,z:6.6,r:1.8},
  JALUR:[
    [6,8,10,20,2],[10,20,14,36,2],[14,36,15,56,2],
    /* oasis */
    [-13,7,XO,10,HW],[XO,10,XO,31,HW],[XO,31,-30,36,HW],[XO,24,-20.5,24,1.6],
    [XO,10,-36,12,2],[-36,12,-43,26,2],[-43,26,-41,34,2],[-41,34,-30,36,2],[-43,26,-46.4,27.5,1.8],
    /* tanjakan kuil */
    [0,8,0,24,4.4],[0,24,0,40,2.4],[0,40,0,62,2.4],
    [-3,8,-11,14,2],[-11,14,-9,28,2],[-9,28,-14,40,2],[-14,40,-16,54,2],[-9,28,-5,31,1.8],
    /* reruntuhan */
    [13,7,24,10,HW],[24,10,XR,15,HW],[XR,15,XR,26,HW],[XR,26,XR,32,1.3],[XR,32,XR,40,HW],[XR,40,32,46,HW],
    [24,10,40,14,2],[40,14,43,30,2],[43,30,40,40,2],[40,40,32,46,2],[43,30,46,24,1.8],
    /* lingkar antar kamp */
    [-30,36,-16,54,2],[-16,54,0,62,2],[0,62,16,56,2],[16,56,32,46,2]
  ],
  GERBANG:{ruas:0,z0:11,z1:12.3,x0:5,x1:10},
  JURANG:{x0:23,x1:37,z0:26.2,z1:31.8},
  GANTUNG:{x:XR,z0:25.7,z1:32.3},
  AIR:{x0:-48,x1:-19.5,z0:17.5,z1:22.5},AIR_JATUH:'barat',
  JEMB_KAYU:[-36,12,-43,26],
  tinggi:(x,z)=>6*ss(10,58,z)*(1-ss(5,17,Math.abs(x))),
  tebing:(x,z)=>Math.max(ss(39,48,Math.abs(x)),ss(64,72,z)),
  KOIN_A:[[-5,31],[-6.6,29.9],[-46.4,27.5],[-44.8,26.8],[-22.4,24],[46,24],[44.6,26.8],[-39.4,18.6],[41.4,22],[-10,21],[12,28],[-15,47],[-36,12],[36,13],[15,50],[-6,58]],
  PINTU:{cx:0,x0:-2.4,x1:2.4,min:.3,max:4},
  UBIN:{W:2*HW,D:1.6},
  BAN:{x0:XO-HW,x1:XO+HW,z0:25,z1:29.8},
  teks:{palu:'Terkena bilah ayun!',pintu:'Terjepit pintu batu!',kayu:'Tertabrak batu silinder!',duri:'Kena jebakan duri!',ubin:'Batu pijakan tenggelam! Tercebur kolam.',bola:'Tertabrak batu menggelinding!'},
  rintangan(k){
    const BAN=this.BAN;
    return {
      kayu:[[12.5,0],[17,.5],[21,.25],[14.8,.75]].slice(0,[2,3,4][k]).map(([z,f])=>({ax:'x',c:z,m:0,A:4.5,f,T:[6,5,4.2][k]})).concat([
        {ax:'x',c:37,m:XR,A:2.9,f:.3},
        {ax:'x',c:30,m:-42,A:2.7,f:.1},{ax:'x',c:21,m:-10,A:2.7,f:.45},{ax:'x',c:22,m:41.5,A:2.7,f:.7},
        {ax:'z',c:-23,m:45,A:2.9,f:.2},{ax:'z',c:24,m:51,A:2.9,f:.6},{ax:'x',c:27,m:11.75,A:2.7,f:.9}
      ].map(o=>({...o,T:[6.5,5.6,4.8][k]}))),
      palu:[[{x:XR,z:29,T:4.2,f:0}],[{x:XR,z:29,T:3.6,f:0}],[{x:XR,z:27.7,T:3.4,f:0},{x:XR,z:30.3,T:3.0,f:.5}]][k],
      pintu:[{z:29,T:[6.2,5.2,4.4][k],f:0}],
      duri:[[{pts:baris(0,34,1.6),T:3.6,f:0}],[{pts:baris(0,34,1.6),T:3.0,f:0}],[{pts:baris(0,34,1.6),T:3.0,f:0},{pts:baris(0,37,1.6),T:2.6,f:.5}]][k].concat([
        {pts:baris(XR,20,1.5),f:.15},
        {pts:lintang(-30,11,-12,2),f:.2},{pts:lintang(-11.5,34,-5,12),f:.5},{pts:lintang(41.5,35,-3,10),f:.8},
        {pts:lintang(-8,58,16,8),f:.35},{pts:lintang(8,59,16,-6),f:.65},{pts:lintang(14.5,46,1,20),f:.05}
      ].map(o=>({...o,T:[4.2,3.6,3.2][k]}))),
      ubin:[18.3,19.9,21.5].map((z,n)=>({x:XO,z,f:fr(n*.37),T:[7,6,5][k]})),
      ban:{...BAN,balik:k===2,v:[2.0,2.8,3.4][k],T:12},
      tramp:k===2?{x:-20.5,z:24,r:1.2,x1:XO,z1:13.5,dur:1100}:null,
      bola:[[{x:-1.2,T:13,f:0}],[{x:-1.2,T:11,f:0}],[{x:-1.2,T:10,f:0},{x:1.2,T:10,f:.5}]][k].map(b=>({...b,z0:60,z1:41.5}))
    };
  }
});

/* ================= Pos 3: Danau Beku ================= */
/* Jalan lingkar persegi mengelilingi danau. Stasiun: Tungku (timur), Gudang C (utara), Pemotong (barat).
   Pulau di tengah danau dengan lengan putar menjadi simpul empat lajur: rakit (selatan, utara), es tipis (timur), arus (barat).
   Jalan pintas bertuas di luar sisi timur menuju Tungku. */
export const M3=buatMedan({
  nama:'Danau Beku',
  DUNIA:{x0:-42,x1:42,z0:-6,z1:60},
  PLAZA:{x0:-15,x1:15,z0:.4,z1:8.6},
  KAMP:[{x:21,z:30,r:4.2,nama:'Tungku'},{x:0,z:50,r:4.2,nama:'Gudang C'},{x:-21,z:30,r:4.2,nama:'Pemotong'}],
  PAD:{x:12.5,z:6.6,r:2},TUAS:{x:-12.5,z:6.6,r:1.8},
  LINGKAR:[{x:0,z:30,r:4.4}],
  JALUR:[
    [13,3,28,5,2],[28,5,28,26,2],[28,26,25,29,2],[28,26,32,30,1.8],
    /* jalan lingkar */
    [-17,10,17,10,HW],[17,10,21,14,HW],[21,14,21,46,HW],[21,46,17,50,HW],[17,50,-17,50,HW],[-17,50,-21,46,HW],[-21,46,-21,14,HW],[-21,14,-17,10,HW],
    /* taji buntu berkoin */
    [21,46,26,51,1.8],[-21,46,-26,51,1.8],[-21,14,-27,9,1.8],
    /* penyeberangan danau lewat pulau */
    [0,10,0,17,2],[0,17,0,25.7,1.5],[0,34.3,0,43,1.5],[0,43,0,50,2],
    [4.3,30,13,30,1.5],[13,30,21,30,2],[-13,30,-4.3,30,1.5],[-21,30,-13,30,2]
  ],
  GERBANG:{ruas:1,z0:11,z1:12.3,x0:26,x1:30},
  AIR:{x0:-13,x1:13,z0:17,z1:43},AIR_JATUH:'tidak',
  tinggi:(x,z)=>2.5*Math.exp(-((x-21)**2+(z-30)**2)/30)+2*ss(46,51,z)*(1-ss(18,26,Math.abs(x))),
  tebing:(x,z)=>Math.max(ss(35,42,Math.abs(x)),ss(54,60,z)),
  KOIN_A:[[26,51],[24.6,49.6],[-26,51],[-24.6,49.6],[-27,9],[-25.6,10.4],[32,30],[30.6,28.6],[10,10],[-10,10],[9,50],[-9,50],[21,22],[-21,38]],
  PINTU:{cx:0,x0:-2,x1:2,min:.3,max:3.4},
  UBIN:{W:2.1,D:3.8},
  BAN:{ax:'x',x0:-13,x1:-4.3,z0:28.5,z1:31.5},
  teks:{palu:'Terkena palu!',pintu:'Terjepit gerbang es!',kayu:'Tergilas bola salju!',duri:'Kena paku es!',ubin:'Es tipis pecah! Tercebur.',bola:'Tertabrak bola salju!',
    penekan:'Tertekan mesin penekan!',air:'Tercebur ke danau! Naik rakit saat merapat.',jatuh:'Tertimpa es jatuh!',lengan:'Tersapu lengan putar! Lompat saat lengan lewat.'},
  rintangan(k){
    const T=[6.5,5.6,4.8][k],Tp=[5,4.4,3.8][k];
    return {
      kayu:[{ax:'z',c:9,m:50,A:3.0,f:0},{ax:'z',c:-9,m:50,A:3.0,f:.5}].map(o=>({...o,T})),
      pintu:[{z:44,T:[6.2,5.2,4.4][k],f:0}],
      penekan:[{x0:18.6,x1:23.4,z0:19.2,z1:20.8,f:0},{x0:-23.4,x1:-18.6,z0:39.2,z1:40.8,f:.5},{x0:25.6,x1:30.4,z0:17.2,z1:18.8,f:.25}].map(o=>({...o,T:Tp})),
      duri:[{pts:baris(21,38,1.5),f:0},{pts:baris(-21,20,1.5),f:.5},{pts:baris(0,14,1.3),f:.25},
        {pts:lintang(23.5,48.5,5,5),f:.7},{pts:lintang(-23.5,48.5,-5,5),f:.2},{pts:lintang(-24,11.5,-6,-5),f:.6}].map(o=>({...o,T:[4.2,3.6,3.2][k]})),
      ubin:[5.4,7.6,9.8,12.0].map((x,n)=>({x,z:30,w:2.1,d:3.8,f:fr(n*.29),T:[7,6,5][k]})),
      ban:{...this.BAN,balik:k===2,v:-[2.0,2.8,3.4][k],T:12},
      lengan:[{x:0,z:30,L:4.6,w:[1.3,1.7,2.1][k],n:[2,2,3][k],f:0}],
      rakit:[{ax:'z',c:0,a0:17,a1:25.7,len:3,lebar:1.5,T:[8,7,6][k],f:0},{ax:'z',c:0,a0:34.3,a1:43,len:3,lebar:1.5,T:[8,7,6][k],f:.5}],
      jatuh:[{x0:-23.5,x1:-15,z0:44,z1:52.5,n:[3,4,5][k],T:4.5,f:0,r:1.2}].concat(k===2?[{x0:15,x1:23.5,z0:8,z1:16,n:4,T:4,f:.5,r:1.2}]:[])
    };
  }
});

/* ================= Pos 4: Hutan Sungai ================= */
/* Sungai melintang di tengah hutan. Empat penyeberangan: rakit batang kayu (barat), jembatan gantung dengan kawanan lebah (tengah),
   batu pijakan (timur), jembatan kayu (jalur memutar paling barat), ditambah jembatan jalan pintas bertuas.
   Sumber air: Mata Air (ember 1 L, dekat, selatan sungai), Air Terjun (drum 5 L, paling jauh, utara), Sumur (jeriken 2 L, barat laut). */
export const M4=buatMedan({
  nama:'Hutan Sungai',
  DUNIA:{x0:-46,x1:46,z0:-6,z1:64},
  PLAZA:{x0:-15,x1:15,z0:.4,z1:8.6},
  KAMP:[{x:24,z:16,r:4.2,nama:'Mata Air'},{x:0,z:52,r:4.2,nama:'Air Terjun'},{x:-26,z:40,r:4.2,nama:'Sumur'}],
  PAD:{x:12.5,z:6.6,r:2},TUAS:{x:-12.5,z:6.6,r:1.8},
  JALUR:[
    [6,8,10,18,2],[10,18,10,32,1.4],[10,32,16,38,2],
    /* batang tengah, jembatan gantung, tanjakan ke air terjun */
    [0,8,0,22,HW],[0,22,0,32,1.4],[0,32,0,44,HW],[0,44,0,52,HW],
    /* barat: jalan ke rakit, lalu ke sumur */
    [-4,8,-12,16,HW],[-12,16,-20,20,HW],[-20,20,-20,24,HW],[-20,24,-20,30,1.5],[-20,30,-24,36,HW],[-24,36,-26,40,HW],
    /* memutar paling barat lewat jembatan kayu */
    [-13,5,-30,10,2],[-30,10,-34,20,2],[-34,20,-34,34,2],[-34,34,-26,40,2],[-30,10,-38,7,1.8],
    /* timur: mata air, batu pijakan, kembali ke air terjun */
    [14,4,20,10,HW],[20,10,24,16,HW],[24,16,24,24,2],[24,24,24,30,2],[24,30,18,40,2],[18,40,8,48,2],[8,48,0,52,2],[24,16,31,14,1.8],
    /* lingkar utara */
    [-26,40,-14,48,2],[-14,48,0,52,2]
  ],
  GERBANG:{ruas:0,z0:11,z1:12.3,x0:5.5,x1:9.5},
  AIR:{x0:-46,x1:46,z0:24,z1:30},AIR_JATUH:'timur',
  GANTUNG:[{x:0,z0:23,z1:31},{x:10,z0:23,z1:31}],
  JEMB_KAYU:[-34,20,-34,34],
  tinggi:(x,z)=>2.2*ss(36,52,z)*(1-ss(8,24,Math.abs(x))),
  tebing:(x,z)=>Math.max(ss(38,46,Math.abs(x)),ss(56,64,z)),
  KOIN_A:[[-38,7],[-36.6,7.6],[31,14],[29.6,14.6],[-34,27],[10,25],[-20,18],[13,42],[-10,49],[0,40],[24,20],[-28,10]],
  PINTU:{cx:0,x0:-2.2,x1:2.2,min:.3,max:3.6},
  UBIN:{W:4,D:1.9},
  BAN:{x0:0,x1:0,z0:0,z1:0},
  teks:{palu:'Terkena batang ayun!',pintu:'Terjepit pintu kayu!',kayu:'Tertabrak gelondong!',duri:'Kena jebakan duri!',ubin:'Batu pijakan tenggelam! Hanyut.',bola:'Tertabrak!',
    penekan:'Tertimpa batang penekan!',air:'Tercebur ke sungai! Naik rakit saat merapat.',jatuh:'Tertimpa buah pinus!',lengan:'Tersapu!',patroli:'Disengat kawanan lebah!'},
  rintangan(k){
    const T=[6.5,5.6,4.8][k],Td=[4.2,3.6,3.2][k];
    return {
      kayu:[{ax:'x',c:14,m:0,A:2.6,f:0},{ax:'x',c:18,m:0,A:2.6,f:.5},{ax:'x',c:44,m:13,A:2.8,f:.25}].map(o=>({...o,T})),
      palu:[[{x:-22,z:33,T:4.2,f:0}],[{x:-22,z:33,T:3.6,f:0}],[{x:-22,z:33,T:3.2,f:0}]][k],
      penekan:[{x0:-2.6,x1:2.6,z0:37.2,z1:38.8,f:0,T:[5,4.4,3.8][k]},{x0:18.4,x1:23.6,z0:34.2,z1:35.8,f:.5,T:[5,4.4,3.8][k]}],
      duri:[{pts:lintang(-8,12,-8,8),f:0},{pts:lintang(-34,32,0,14),f:.4},{pts:lintang(17,7,6,6),f:.2},{pts:lintang(-7,50,14,4),f:.6},{pts:lintang(13,35,6,6),f:.8}].map(o=>({...o,T:Td})),
      ubin:[25,27,29].map((z,n)=>({x:24,z,w:4,d:1.9,f:fr(n*.37),T:[7,6,5][k]})),
      rakit:[{ax:'z',c:-20,a0:24,a1:30,len:2.6,lebar:1.5,T:[7,6,5][k],f:0}],
      /* kawanan lebah menyapu seluruh jaringan jalan: 2, 3, 4 kawanan di jaringan utama dan 1 di rantai jalan kecil */
      patroli:sapuRute(k,2,[2,3,4],1.2),
      jatuh:[{x0:-22,x1:-8,z0:42,z1:51,n:[3,4,5][k],T:4.5,f:0,r:1.2}]
    };
  }
});

/* ================= Pos 5: Teluk Karang ================= */
/* Pantai berpasir di utara, teluk di barat. Kamp: Dermaga (beban 1 kg, timur, dekat), Mercusuar (jangkar 10 kg, bukit utara, jauh),
   Gua Karang (peti 5 kg, barat laut, di seberang teluk). Rintangan khas pantai: ombak pasang di dataran pasir, kepiting,
   bulu babi, papan dermaga lapuk, kayu hanyut, kelapa jatuh, tong menggelinding dari bukit mercusuar, perahu penyeberangan. */
export const M5=buatMedan({
  nama:'Teluk Karang',
  DUNIA:{x0:-46,x1:46,z0:-6,z1:64},
  PLAZA:{x0:-15,x1:15,z0:.4,z1:8.6},
  KAMP:[{x:26,z:20,r:4.2,nama:'Dermaga'},{x:0,z:54,r:4.2,nama:'Mercusuar'},{x:-28,z:40,r:4.2,nama:'Gua Karang'}],
  PAD:{x:12.5,z:6.6,r:2},TUAS:{x:-12.5,z:6.6,r:1.8},
  PANTAI_Z:34,
  JALUR:[
    /* jalan pintas bertuas: titian kayu di atas dataran pasang menuju bukit mercusuar */
    [6,8,10,18,2],[10,18,10,38,1.5],[10,38,2,47,2],
    /* poros tengah: jalan pasir, dataran pasang, tanjakan ke mercusuar */
    [0,8,0,22,HW],[0,22,0,36,HW],[0,36,0,46,HW],[0,46,0,54,HW],
    /* timur: dermaga, papan lapuk, pantai kepiting, kembali ke bukit */
    [14,4,20,10,HW],[20,10,26,20,HW],[26,20,26,34,2],[26,34,18,44,2],[18,44,2,50,2],[26,20,32,17,1.8],
    /* barat: perahu menyeberangi teluk menuju gua */
    [-4,8,-12,16,HW],[-12,16,-22,20,HW],[-22,20,-22,22,HW],[-22,22,-22,30,1.5],[-22,30,-24,36,HW],[-24,36,-28,40,HW],
    /* memutar paling barat lewat jembatan kayu */
    [-13,5,-30,10,2],[-30,10,-36,18,2],[-36,18,-36,34,2],[-36,34,-28,40,2],[-30,10,-38,7,1.8],
    /* pantai utara dari gua ke mercusuar */
    [-28,40,-14,48,2],[-14,48,-2,52,2]
  ],
  GERBANG:{ruas:0,z0:11,z1:12.3,x0:5.5,x1:9.5},
  AIR:{x0:-46,x1:-14,z0:22,z1:30},AIR_JATUH:'tidak',
  JEMB_KAYU:[-36,18,-36,34],
  tinggi:(x,z)=>3*ss(44,54,z)*(1-ss(6,16,Math.abs(x))),
  tebing:(x,z)=>Math.max(ss(38,46,Math.abs(x)),ss(56,64,z)),
  KOIN_A:[[-38,7],[-36.6,7.6],[32,17],[30.6,17.7],[-36,26],[10,26],[-16,18],[22,39],[-8,50],[0,30],[26,31],[-21,44]],
  PINTU:{cx:0,x0:-2.2,x1:2.2,min:.3,max:3.6},
  UBIN:{W:4,D:1.9},
  BAN:{x0:0,x1:0,z0:0,z1:0},
  teks:{palu:'Terkena ayunan!',pintu:'Terjepit pintu!',kayu:'Tertabrak kayu hanyut!',duri:'Terinjak bulu babi!',ubin:'Papan dermaga lapuk ambruk! Tercebur.',bola:'Tertabrak tong menggelinding!',
    penekan:'Tertimpa!',air:'Tercebur ke teluk! Naik perahu saat merapat.',jatuh:'Tertimpa kelapa jatuh!',lengan:'Tersapu!',patroli:'Dijepit kepiting!',pasang:'Tersapu ombak pasang! Tunggu air surut.'},
  rintangan(k){
    const T=[6.5,5.6,4.8][k],Td=[4.2,3.6,3.2][k];
    return {
      kayu:[{ax:'x',c:14,m:0,A:2.6,f:0},{ax:'x',c:33,m:-36,A:2.6,f:.5}].concat(k>=1?[{ax:'x',c:28,m:0,A:2.8,f:.25}]:[]).map(o=>({...o,T})),
      duri:[{pts:lintang(23,15,6,10),f:0},{pts:lintang(-8,12,-8,8),f:.4},{pts:lintang(-23,33,-2,6),f:.7}].concat(k===2?[{pts:lintang(6,42.5,-8,9),f:.2}]:[]).map(o=>({...o,T:Td})),
      ubin:[25,27,29,31].map((z,n)=>({x:26,z,w:4,d:1.9,f:fr(n*.29),T:[7,6,5][k]})),
      rakit:[{ax:'z',c:-22,a0:22,a1:30,len:2.6,lebar:1.5,T:[7,6,5][k],f:0}],
      /* kepiting menyapu seluruh jaringan jalan (empat komponen jalan, tiap komponen punya kawanan sendiri) */
      patroli:sapuRute(k,4,[1,2,2]),
      pasang:[{x0:-3.2,x1:3.2,z0:38,z1:44,T:[10,9,8][k],f:0}].concat(k>=1?[{x0:7,x1:13,z0:42,z1:52,T:[10,9,8][k],f:.5}]:[]),
      jatuh:[{x0:-22,x1:-8,z0:42,z1:51,n:[3,4,5][k],T:4.5,f:0,r:1.2}],
      bola:[[{x:-1.2,T:13,f:0}],[{x:1.2,T:11,f:0}],[{x:-1.2,T:10,f:0},{x:1.2,T:10,f:.5}]][k].map(b=>({...b,z0:53,z1:38}))
    };
  }
});

/* ================= Pos 6: Puncak Kalkulus ================= */
/* Gunung bersalju dengan jalan berkelok. Tiga pos jawaban di ketinggian berbeda: Pos Lembah (timur, rendah),
   Pos Tebing (barat, tengah), Puncak (utara, tertinggi). Rintangan: batang pinus menggelinding, semak berduri,
   papan es retak, kambing gunung, baling-baling pos cuaca, batu longsor, bola salju longsoran. */
export const M6=buatMedan({
  nama:'Puncak Kalkulus',
  DUNIA:{x0:-46,x1:46,z0:-6,z1:64},
  PLAZA:{x0:-15,x1:15,z0:.4,z1:8.6},
  KAMP:[{x:24,z:22,r:4.2,nama:'Pos Lembah'},{x:-24,z:38,r:4.2,nama:'Pos Tebing'},{x:0,z:56,r:4.2,nama:'Puncak'}],
  PAD:{x:12.5,z:6.6,r:2},TUAS:{x:-12.5,z:6.6,r:1.8},
  JALUR:[
    /* jalan pintas bertuas: punggung bukit sempit */
    [6,8,10,16,2],[10,16,14,20,2],[14,20,14,44,1.5],[14,44,2,54,2],
    /* jalan berkelok di lereng tengah */
    [0,8,-8,16,HW],[-8,16,8,24,HW],[8,24,-8,32,HW],[-8,32,6,40,HW],[6,40,-4,48,HW],[-4,48,0,56,HW],
    /* timur: lembah, papan es, naik ke punggung */
    [14,4,20,12,HW],[20,12,24,22,HW],[24,22,24,34,2],[24,34,14,40,2],[24,22,31,20,1.8],
    /* barat: tanjakan lurus ke tebing, lalu ke puncak */
    [-13,5,-24,12,HW],[-24,12,-24,38,HW],[-8,32,-24,38,2],[-24,38,-14,48,2],[-14,48,-3,50,2],[-24,12,-32,8,1.8]
  ],
  GERBANG:{ruas:0,z0:11,z1:12.3,x0:5.8,x1:9.8},
  tinggi:(x,z)=>12*ss(10,58,z),
  tebing:(x,z)=>Math.max(ss(36,44,Math.abs(x)),ss(58,64,z)),
  KOIN_A:[[31,20],[29.6,20.5],[-32,8],[-30.6,8.7],[14,32],[-24,26],[24,30],[-19,43],[0,28],[2,44],[-8,49],[8,24]],
  PINTU:{cx:0,x0:-2.2,x1:2.2,min:.3,max:3.6},
  UBIN:{W:4,D:1.9},
  BAN:{x0:0,x1:0,z0:0,z1:0},
  teks:{palu:'Terkena ayunan!',pintu:'Terjepit pintu!',kayu:'Tertabrak batang pinus menggelinding!',duri:'Tertusuk semak berduri!',ubin:'Papan es retak! Tergelincir.',bola:'Tertabrak bola salju longsoran!',
    penekan:'Tertimpa!',air:'Tercebur!',jatuh:'Tertimpa batu longsor!',lengan:'Tersapu baling-baling pos cuaca! Lompat saat lewat.',patroli:'Diseruduk kambing gunung!'},
  rintangan(k){
    const T=[6.5,5.6,4.8][k],Td=[4.2,3.6,3.2][k];
    return {
      kayu:[{ax:'x',c:20,m:-24,A:2.6,f:0}].concat(k>=1?[{ax:'x',c:30,m:-24,A:2.6,f:.5}]:[]).map(o=>({...o,T})),
      duri:[{pts:lintang(-4,12,-8,8),f:0},{pts:lintang(22,17,4,10),f:.4}].concat(k===2?[{pts:lintang(-19,43,10,10),f:.7}]:[]).map(o=>({...o,T:Td})),
      ubin:[26,28,30].map((z,n)=>({x:24,z,w:4,d:1.9,f:fr(n*.31),T:[7,6,5][k]})),
      /* kambing gunung menyapu seluruh jaringan jalan (dua komponen jalan) */
      patroli:sapuRute(k,2,[1,2,2]),
      lengan:[{x:-1,z:36,L:2.6,w:[1.3,1.7,2.1][k],n:[2,2,3][k],f:0}],
      jatuh:[{x0:-8,x1:8,z0:42,z1:52,n:[3,4,5][k],T:4.5,f:0,r:1.2}],
      bola:[[{x:0,T:13,f:0}],[{x:0,T:11,f:0}],[{x:-1.2,T:10,f:0},{x:1.2,T:10,f:.5}]][k].map(b=>({...b,z0:52,z1:12}))
    };
  }
});
