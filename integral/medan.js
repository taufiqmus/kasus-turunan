/* Lembah Waduk: geometri dunia Pos 1 (jalur, kamp, tinggi tanah) dan rintangannya.
   Semua fungsi murni; rintangan bergantung pada jam dinding (detik) sehingga sama di semua perangkat
   tanpa pesan jaringan. Tidak memuat tampilan 3D. */
const TAU=Math.PI*2;
const fr=v=>v-Math.floor(v);
const ss=(a,b,v)=>{const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t);};

export const DUNIA={x0:-46,x1:46,z0:-6,z1:70};
export const PLAZA={x0:-15,x1:15,z0:.4,z1:6.5};
/* tiga kamp balok: Hutan (kiri), Bukit (tengah, paling jauh), Sungai (kanan) */
export const KAMP=[{x:-28,z:42,r:4.2,nama:'Hutan'},{x:0,z:53,r:4.2,nama:'Bukit'},{x:28,z:42,r:4.2,nama:'Sungai'}];
export const PAD={x:12.5,z:3.1,r:2},TUAS={x:-12.5,z:3.1,r:1.8};
export const HW=2.2,X_HUTAN=-21,X_SUNGAI=21;

/* jalur: [x1,z1,x2,z2,setengah lebar]. Indeks 0..2 adalah jalan pintas bertuas. */
export const JALUR=[
  [-6,6,-9,20,2],[-9,20,-12,34,2],[-12,34,-14,50,2],
  /* hutan: utama lalu memutar */
  [-13,5,-21,11,HW],[-21,11,-21,25,HW],[-21,25,-26,32,HW],[-26,32,-28,42,HW],
  [-21,11,-33,13,2],[-33,13,-39,24,2],[-39,24,-38,36,2],[-38,36,-28,42,2],[-39,24,-42.5,29,1.8],
  /* bukit: lereng lebar, jembatan sempit di atas jurang, punggung bukit; lalu jalur memutar berkelok */
  [0,6,0,24,4.4],[0,24,0,26,2.4],[0,26,0,32,1.3],[0,32,0,53,2.4],
  [3,8,12,12,2],[12,12,8,22,2],[8,22,15,30,2],[15,30,9,40,2],[9,40,0,53,2],[15,30,16,34.5,1.8],
  /* sungai: utama lalu memutar lewat jembatan kayu */
  [13,5,21,11,HW],[21,11,21,29,HW],[21,29,26,34,HW],[26,34,28,42,HW],[21,21,24.5,21,1.6],
  [21,11,33,12,2],[33,12,40,22,2],[40,22,38,36,2],[38,36,28,42,2],[40,22,43,27,1.8],
  /* lingkar antar kamp */
  [-28,42,-14,50,2],[-14,50,0,53,2],[0,53,14,50,2],[14,50,28,42,2]
];
export const GERBANG={z0:11,z1:12.3};          /* pita gerbang pada ruas jalan pintas pertama */
export const JURANG={x0:-7.5,x1:7.5,z0:26.2,z1:31.8};
export const SUNGAI={x0:18.4,x1:46,z0:15,z1:20};
export const JEMB_KAYU=[33,12,40,22];          /* ruas memutar yang melintasi sungai */

function jarakRuas(x,z,s){
  const dx=s[2]-s[0],dz=s[3]-s[1],L=dx*dx+dz*dz,t=L?Math.max(0,Math.min(1,((x-s[0])*dx+(z-s[1])*dz)/L)):0;
  return Math.hypot(x-s[0]-dx*t,z-s[1]-dz*t);
}
/* jarak bertanda ke daerah yang boleh diinjak: negatif di dalam, positif di luar */
export function jarakJalan(x,z){
  let d=1e9;
  for(const s of JALUR)d=Math.min(d,jarakRuas(x,z,s)-s[4]);
  for(const k of KAMP)d=Math.min(d,Math.hypot(x-k.x,z-k.z)-k.r);
  const px=Math.max(PLAZA.x0-x,x-PLAZA.x1),pz=Math.max(PLAZA.z0-z,z-PLAZA.z1);
  d=Math.min(d,Math.max(px,pz));
  return d;
}
export const diGerbang=(x,z)=>z>GERBANG.z0&&z<GERBANG.z1&&jarakRuas(x,z,JALUR[0])<JALUR[0][4]&&x<-4.6;
export function boleh(x,z,gerbangBuka){
  if(jarakJalan(x,z)>0)return false;
  if(!gerbangBuka&&diGerbang(x,z))return false;
  return true;
}
/* tinggi tanah di tempat pemain berdiri: bukit di tengah lembah, datar di plaza, hutan dan sungai */
export const BUKIT_H=5;
export function tinggi(x,z){return BUKIT_H*ss(10,26,z)*(1-ss(7,19,Math.abs(x)));}
export const diKamp=(x,z)=>{for(let i=0;i<KAMP.length;i++)if(Math.hypot(x-KAMP[i].x,z-KAMP[i].z)<KAMP[i].r-1.4)return i;return -1;};
export const diPad=(x,z)=>Math.hypot(x-PAD.x,z-PAD.z)<PAD.r;
export const diTuas=(x,z)=>Math.hypot(x-TUAS.x,z-TUAS.z)<TUAS.r;

/* koin petualang di sudut-sudut di luar jalur utama */
export const KOIN_A=[[-42.5,29],[-41,26.5],[-36,18],[-39,31],[16,34.5],[15.4,32.4],[10,17],[12,35],[43,27],[41.5,24.5],[37,29],[24.5,21],[-10.5,27],[-13,42],[14,50],[-14,50]];

/* ---------- rintangan ---------- */
export const PAL_L=3.6,PAL_A=3.0,PAL_Y=4.4;
export const PINTU={cx:X_HUTAN,x0:X_HUTAN-HW,x1:X_HUTAN+HW,min:.3,max:3.6};
export const DURI_HIT=.8;
const barisH=z=>[[X_HUTAN-1.5,z],[X_HUTAN,z],[X_HUTAN+1.5,z]];
export const UBIN_W=2*HW,UBIN_D=1.6,UBIN_Z=[15.8,17.4,19.0];
export const BOLA_R=1.1,RINT_R=.9,RINT_A=4.5,RINT_MAKS=10,DURI_MAKS=9;
/* tiga petak duri melintang tegak lurus arah ruas (dx,dz) di titik (x,z) */
function lintang(x,z,dx,dz){const L=Math.hypot(dx,dz),px=dz/L,pz=-dx/L;return [-1.4,0,1.4].map(o=>[x+px*o,z+pz*o]);}
export const BAN={x0:X_SUNGAI-HW,x1:X_SUNGAI+HW,z0:22.8,z1:27.6};
export const TRAMP={x:24.5,z:21,r:1.2,x1:21,z1:13.2,dur:1100};

const CACHE=[];
export function medanBabak(r){
  const k=Math.max(0,Math.min(r,2));
  if(CACHE[k])return CACHE[k];
  const m={
    /* gelondong: menyapu lereng bukit (utama), lalu satu lajur lebih lambat di tiap jalur memutar, jalan lingkar, dan jalan pintas.
       ax = sumbu sapuan, c = koordinat tetap, m = pusat sapuan, A = amplitudo */
    kayu:[[12.5,0],[17,.5],[21,.25],[14.8,.75]].slice(0,[2,3,4][k]).map(([z,f])=>({ax:'x',c:z,m:0,A:RINT_A,f,T:[6,5,4.2][k]})).concat([
      {ax:'x',c:30,m:-38.5,A:2.7,f:.1},{ax:'x',c:37,m:10.8,A:2.9,f:.4},{ax:'x',c:30,m:38.86,A:2.7,f:.7},
      {ax:'z',c:-21,m:46,A:2.9,f:.2},{ax:'z',c:21,m:46,A:2.9,f:.6},{ax:'x',c:27,m:-10.5,A:2.7,f:.9}
    ].map(o=>({...o,T:[6.5,5.6,4.8][k]}))),
    palu:[[{z:29,T:4.2,f:0}],[{z:29,T:3.6,f:0}],[{z:27.7,T:3.4,f:0},{z:30.3,T:3.0,f:.5}]][k],
    pintu:[{z:15.5,T:[6.2,5.2,4.4][k],f:0}],
    /* duri: baris di jalur hutan (utama), lalu satu baris di tiap jalur memutar, jalan lingkar, dan jalan pintas */
    duri:[[{pts:barisH(20),T:3.6,f:0}],[{pts:barisH(20),T:3.0,f:0}],[{pts:barisH(20),T:3.0,f:0},{pts:barisH(22.4),T:2.6,f:.5}]][k].concat([
      {pts:lintang(-36,18.5,-6,11),f:.2},{pts:lintang(10,17,-4,10),f:.5},{pts:lintang(38.29,34,-2,14),f:.8},
      {pts:lintang(-7,51.5,14,3),f:.35},{pts:lintang(7,51.5,14,-3),f:.65},{pts:lintang(-13,42,-2,16),f:.05}
    ].map(o=>({...o,T:[4.2,3.6,3.2][k]}))),
    ubin:UBIN_Z.map((z,n)=>({x:X_SUNGAI,z,f:fr(n*.37),T:[7,6,5][k]})),
    ban:{...BAN,balik:k===2,v:[2.0,2.8,3.4][k],T:12},
    tramp:k===2?TRAMP:null,
    bola:[[{x:-1.2,T:13,f:0}],[{x:-1.2,T:11,f:0}],[{x:-1.2,T:10,f:0},{x:1.2,T:10,f:.5}]][k].map(b=>({...b,z0:51,z1:33.5}))
  };
  return CACHE[k]=m;
}
export const xKayu=(s,t)=>s.m+s.A*Math.sin(TAU*(t/s.T+s.f));
/* posisi gelondong di dunia: [x,z] */
export const posKayu=(s,t)=>{const v=xKayu(s,t);return s.ax==='x'?[v,s.c]:[s.c,v];};
export const xPalu=(p,t)=>PAL_A*Math.sin(TAU*(t/p.T+p.f));
export const celahPintu=(p,t)=>PINTU.min+(PINTU.max-PINTU.min)*(.5+.5*Math.sin(TAU*(t/p.T+p.f)));
/* duri: fraksi tinggi 0..1; naik penuh pada fase awal, turun cepat, lalu naik pelan sebagai peringatan */
export function tinggiDuri(p,i,t){
  const u=fr(t/p.T+p.f+i*.33);
  if(u<.42)return 1;if(u<.5)return 1-(u-.42)/.08;if(u>.88)return (u-.88)/.12*.45;return 0;
}
export const duriNaik=(p,i,t)=>fr(t/p.T+p.f+i*.33)<.42;
/* batu pijakan: 0 kokoh, 1 goyah (peringatan), 2 tenggelam */
export function statusUbin(u,t){const v=fr(t/u.T+u.f);return v<.5?0:(v<.68?1:(v<.9?2:0));}
export function keadaanBola(b,t){
  const u=fr(t/b.T+b.f);
  if(u<.2)return {fase:'peringatan',z:b.z0,u};
  if(u<.58)return {fase:'gulir',z:b.z0+(u-.2)/.38*(b.z1-b.z0),u};
  return {fase:null,z:b.z0,u};
}
/* kecepatan ban berjalan sepanjang sumbu z (positif = menjauhi bendungan) */
export const kecBan=(m,t)=>m.ban.balik?m.ban.v*Math.sin(TAU*t/m.ban.T):m.ban.v;
export const diBan=(m,x,z)=>x>m.ban.x0-.2&&x<m.ban.x1+.2&&z>m.ban.z0&&z<m.ban.z1;
export const diTramp=(m,x,z)=>!!m.tramp&&Math.hypot(x-m.tramp.x,z-m.tramp.z)<m.tramp.r;

/* Apakah titik (x,z) terkena bahaya pada waktu t? udara = pemain sedang di puncak lompatan.
   Palu dan pintu tidak bisa dilompati. Hasil: {j, mundur (jarak terpental ke belakang), msg}. */
export function bahaya(r,x,z,t,udara){
  const m=medanBabak(r);
  if(Math.abs(x)<JURANG.x1)for(const p of m.palu)if(Math.abs(z-p.z)<.65&&Math.abs(x-xPalu(p,t))<.85)return {j:'palu',mundur:3,msg:'Terkena palu!'};
  for(const p of m.pintu){
    if(x<PINTU.x0-.3||x>PINTU.x1+.3||Math.abs(z-p.z)>=.5)continue;
    const ce=celahPintu(p,t);if(ce<.9||Math.abs(x-PINTU.cx)>ce/2)return {j:'pintu',mundur:3,msg:'Terjepit pintu geser!'};
  }
  if(udara)return null;
  for(const s of m.kayu){const [kx,kz]=posKayu(s,t);if(s.ax==='x'?(Math.abs(z-kz)<.95&&Math.abs(x-kx)<RINT_R):(Math.abs(x-kx)<.95&&Math.abs(z-kz)<RINT_R))return {j:'kayu',mundur:2.4,msg:'Tertabrak gelondong!'};}
  for(const p of m.duri)for(let i=0;i<p.pts.length;i++)
    if(duriNaik(p,i,t)&&Math.hypot(x-p.pts[i][0],z-p.pts[i][1])<DURI_HIT)return {j:'duri',mundur:3,msg:'Terkena duri!'};
  for(const u of m.ubin)if(Math.abs(x-u.x)<=UBIN_W/2+.3&&Math.abs(z-u.z)<UBIN_D/2&&statusUbin(u,t)===2)return {j:'ubin',mundur:7,msg:'Batu pijakan tenggelam! Hanyut.'};
  for(const b of m.bola){const s=keadaanBola(b,t);if(s.fase==='gulir'&&Math.abs(x-b.x)<BOLA_R&&Math.abs(z-s.z)<BOLA_R)return {j:'bola',mundur:4,msg:'Tertabrak bola!'};}
  return null;
}
