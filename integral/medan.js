/* Medan dan rintangan Pos 1 selain gelondong dan sungai. Semuanya fungsi murni dari jam dinding (detik),
   jadi hasilnya sama di semua perangkat tanpa pesan jaringan. Tidak memuat tampilan 3D. */
const TAU=Math.PI*2;
const fr=v=>v-Math.floor(v);

export const KIRI={x0:-15,x1:-7.5},KANAN={x0:7.5,x1:15};
export const PAL_L=3.6,PAL_A=3.0,PAL_Y=4.4;           /* palu ayun: panjang lengan, amplitudo, tinggi poros */
export const PINTU_C=-11.25,PINTU_MIN=.3,PINTU_MAX=4.7;
export const DURI_X=[-14.2,-12.2,-10.2,-8.4];
export const UBIN_X=[8.75,11.25,13.75],UBIN_Z=[7.95,8.85],UBIN_W=2.5,UBIN_D=.9,UBIN_T=6.2;
export const UBIN_URUT=[[0,0],[1,1],[2,0],[0,1],[1,0],[2,1]];
export const BOLA_R=1.1;

const CACHE=[];
export function medanBabak(r){
  const k=Math.max(0,Math.min(r,2));
  if(CACHE[k])return CACHE[k];
  const m={
    palu:[[{z:9.3,T:4.2,f:0}],[{z:9.3,T:3.6,f:0}],[{z:9.9,T:3.4,f:0},{z:8.3,T:3.0,f:.5}]][k],
    pintu:[{z:11.2,T:[6.2,5.2,4.4][k],f:0}],
    duri:[[{z:8.4,T:3.6,f:0}],[{z:8.4,T:3.0,f:0}],[{z:8.4,T:3.0,f:0},{z:9.8,T:2.6,f:.5}]][k],
    ban:{x0:KANAN.x0,x1:KANAN.x1,z0:9.4,z1:12.0,balik:k===2,v:[2.0,2.8,3.4][k],T:12},
    ubin:UBIN_URUT.slice(0,[2,4,6][k]).map(([i,j],n)=>({x:UBIN_X[i],z:UBIN_Z[j],f:fr(n*.37)})),
    tramp:k===2?{x:4.6,z:12.6,r:1.3,x1:4.6,z1:6.15,dur:1000}:null,
    bola:k===2?[{x:-5.5,T:11,f:0},{x:3.2,T:11,f:.5}]:[]
  };
  return CACHE[k]=m;
}

export const xPalu=(p,t)=>PAL_A*Math.sin(TAU*(t/p.T+p.f));
export const celahPintu=(p,t)=>PINTU_MIN+(PINTU_MAX-PINTU_MIN)*(.5+.5*Math.sin(TAU*(t/p.T+p.f)));
/* duri: fraksi tinggi 0..1; naik penuh pada fase awal, turun cepat, lalu naik pelan sebagai peringatan */
export function tinggiDuri(p,i,t){
  const u=fr(t/p.T+p.f+i*.25);
  if(u<.42)return 1;if(u<.5)return 1-(u-.42)/.08;if(u>.88)return (u-.88)/.12*.45;return 0;
}
export const duriNaik=(p,i,t)=>fr(t/p.T+p.f+i*.25)<.42;
/* ubin: 0 kokoh, 1 retak (peringatan), 2 hilang */
export function statusUbin(u,t){const v=fr(t/UBIN_T+u.f);return v<.5?0:(v<.68?1:(v<.9?2:0));}
export function keadaanBola(b,t){
  const u=fr(t/b.T+b.f);
  if(u<.2)return {fase:'peringatan',z:-1,u};
  if(u<.58)return {fase:'gulir',z:-1+(u-.2)/.38*21,u};
  return {fase:null,z:-1,u};
}
/* kecepatan ban berjalan sepanjang sumbu z (positif = ke arah selatan, menjauhi kolom) */
export const kecBan=(m,t)=>m.ban.balik?m.ban.v*Math.sin(TAU*t/m.ban.T):m.ban.v;
export const diBan=(m,x,z)=>x>m.ban.x0&&x<m.ban.x1&&z>m.ban.z0&&z<m.ban.z1;
export const diTramp=(m,x,z)=>!!m.tramp&&Math.hypot(x-m.tramp.x,z-m.tramp.z)<m.tramp.r;

/* Apakah titik (x,z) terkena bahaya pada waktu t? Pemanggil sudah memastikan pemain di tanah.
   Hasil: {j, dz} dorongan relatif pada sumbu z, atau {j, abs} titik tujuan mutlak, plus pesan. */
export function bahaya(r,x,z,t,udara){
  const m=medanBabak(r);
  for(const p of m.palu)if(Math.abs(z-p.z)<.65&&Math.abs(x-xPalu(p,t))<.85)return {j:'palu',dz:z>=p.z?2:-2,msg:'Terkena palu!'};
  for(const p of m.pintu){
    if(x<KIRI.x0||x>KIRI.x1||Math.abs(z-p.z)>=.5)continue;
    const ce=celahPintu(p,t);if(ce<.9||Math.abs(x-PINTU_C)>ce/2)return {j:'pintu',dz:z>=p.z?2:-2,msg:'Terjepit pintu geser!'};
  }
  if(udara)return null;
  for(const p of m.duri)if(Math.abs(z-p.z)<.7)for(let i=0;i<DURI_X.length;i++)
    if(duriNaik(p,i,t)&&Math.abs(x-DURI_X[i])<1.05)return {j:'duri',dz:z>=p.z?2:-2,msg:'Terkena duri!'};
  for(const u of m.ubin)if(Math.abs(x-u.x)<UBIN_W/2&&Math.abs(z-u.z)<UBIN_D/2&&statusUbin(u,t)===2)return {j:'ubin',abs:10.2,msg:'Lantai runtuh!'};
  for(const b of m.bola){const s=keadaanBola(b,t);if(s.fase==='gulir'&&Math.abs(x-b.x)<BOLA_R&&Math.abs(z-s.z)<BOLA_R)return {j:'bola',dz:2.6,msg:'Tertabrak bola!'};}
  return null;
}
