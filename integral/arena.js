/* Arena Pos 1: lantai, dinding berkurva, kolom balok, gudang balok, pad kunci.
   Dunia arena memakai titik asal yang sama dengan lobi, kelompoknya dinyalakan saat pemain masuk. */
import * as THREE from './vendor/three.min.js';
import {BABAK,UBAG,MAXBAG,XMAX} from './pos1.js?v=21';
import {labelSprite} from './util.js?v=21';
import {medanBabak,xPalu,celahPintu,tinggiDuri,statusUbin,keadaanBola,kecBan,KIRI,KANAN,PAL_L,PAL_Y,PAL_A,PINTU_C,DURI_X,UBIN_W,UBIN_D,BOLA_R} from './medan.js?v=21';

export const SY=.9,UB=UBAG*SY,WX=9;
/* tiga gudang (kiri, tengah, kanan) dengan stok terbatas, satu pad kunci, satu sungai dengan jembatan di tengah */
export const DEPOTS=[{x:-12.5,z:14.5,r:2.2,nama:'Kiri'},{x:0,z:13.6,r:2.2,nama:'Tengah'},{x:12.5,z:14.5,r:2.2,nama:'Kanan'}];
export const DEPOT=DEPOTS[0],PAD={x:7,z:16.8,r:2.2};
export const SUNGAI={x0:-7.5,x1:7.5,z0:7.4,z1:11.2},JEMBATAN={x0:-1.2,x1:1.2};
export const diAir=(x,z)=>x>SUNGAI.x0&&x<SUNGAI.x1&&z>SUNGAI.z0&&z<SUNGAI.z1&&!(x>JEMBATAN.x0&&x<JEMBATAN.x1);
export const depotDi=(x,z)=>{for(let i=0;i<DEPOTS.length;i++)if(Math.hypot(x-DEPOTS[i].x,z-DEPOTS[i].z)<DEPOTS[i].r)return i;return -1;};
export const BATAS={x0:-15,x1:15,z0:.4,z1:19},ZONA={z0:.2,z1:4.6};
export const kolX=(n,i)=>-WX+(i+.5)*2*WX/n;
export function kolomDari(n,x,z){
  if(z<ZONA.z0||z>ZONA.z1||x<-WX||x>WX)return -1;
  return Math.min(n-1,Math.floor((x+WX)/(2*WX/n)));
}
export const diDepot=(x,z)=>depotDi(x,z)>=0;
export const diPad=(x,z)=>Math.hypot(x-PAD.x,z-PAD.z)<PAD.r;

export const RINT_MAKS=6,RINT_AMP=14.3,RINT_R=.9; /* jari-jari tabrak ke samping (sumbu x) dan setengah panjang di sumbu z */
/* spesifikasi gelondong per babak: lajur z, periode detik, fase 0..1 */
export function rintanganBabak(r){
  const L=[[5.6,13,0],[6.65,14.5,.5],[5.6,13,.5],[6.65,14.5,0],[5.6,10,.25],[6.65,11,.75]];
  const n=[3,4,6][Math.min(r,2)],k=[.8,1,1.25][Math.min(r,2)];
  return L.slice(0,n).map(([z,T,f])=>({z,T:T/k,f}));
}
export const xRint=(sp,tSec)=>RINT_AMP*Math.sin(2*Math.PI*(tSec/sp.T+sp.f));
const mat=c=>new THREE.MeshLambertMaterial({color:c,flatShading:true});
export function buatArena(){
  const grup=new THREE.Group();grup.visible=false;
  const lantai=new THREE.Mesh(new THREE.BoxGeometry(36,.3,24),mat(0xf2e3c2));lantai.position.set(0,-.16,9);grup.add(lantai);
  const tepi=new THREE.Mesh(new THREE.BoxGeometry(36.6,.2,24.6),mat(0x1c2230));tepi.position.set(0,-.32,9);grup.add(tepi);

  /* dinding kurva */
  const cw=document.createElement('canvas');cw.width=2000;cw.height=950;
  const tx=new THREE.CanvasTexture(cw);tx.colorSpace=THREE.SRGBColorSpace;tx.anisotropy=4;
  const dinding=new THREE.Mesh(new THREE.PlaneGeometry(20,9.5),new THREE.MeshBasicMaterial({map:tx}));
  dinding.position.set(0,4.75,-2.2);grup.add(dinding);
  const WW=2000,HH=950,px=wx=>(wx+10)/20*WW,py=wy=>HH-wy/9.5*HH;
  /* o: {n, rumus, aturan, fKurva (digambar hanya bila tampil)} */
  function gambarDinding(o){
    const n=o.n,g=cw.getContext('2d');
    g.fillStyle='#fff6e4';g.fillRect(0,0,WW,HH);
    g.fillStyle='#1c2230';g.font='700 26px "Chakra Petch",sans-serif';g.textAlign='right';g.textBaseline='middle';
    /* satu petak vertikal = satu balok (0,5 satuan data); garis tebal tiap 1 satuan berlabel */
    for(let y=0;y<=9;y+=UBAG){
      const mayor=Number.isInteger(y);
      g.strokeStyle=mayor?'#cdbf9c':'#eadfc6';g.lineWidth=mayor?3:2;
      g.beginPath();g.moveTo(px(-WX),py(y*SY));g.lineTo(px(WX),py(y*SY));g.stroke();
      if(mayor)g.fillText(String(y),px(-WX)-12,py(y*SY));
    }
    g.fillStyle='#1c2230';g.textAlign='center';g.textBaseline='top';
    for(let x=0;x<=XMAX;x++){g.fillText(String(x),px(-WX+x*2*WX/XMAX),py(0)+8);}
    /* garis kolom */
    g.strokeStyle='rgba(28,34,48,.35)';g.lineWidth=2;g.setLineDash([10,8]);
    for(let i=0;i<=n;i++){const x=px(-WX+i*2*WX/n);g.beginPath();g.moveTo(x,py(0));g.lineTo(x,py(9*SY));g.stroke();}
    g.setLineDash([]);
    if(o.fKurva){
      g.fillStyle='rgba(47,127,193,.2)';g.beginPath();g.moveTo(px(-WX),py(0));
      for(let k=0;k<=80;k++){const x=k/80*XMAX;g.lineTo(px(-WX+x*2*WX/XMAX),py(Math.max(0,o.fKurva(x))*SY));}
      g.lineTo(px(WX),py(0));g.closePath();g.fill();
      g.strokeStyle='#e5392b';g.lineWidth=7;g.beginPath();
      for(let k=0;k<=80;k++){const x=k/80*XMAX,X=px(-WX+x*2*WX/XMAX),Y=py(o.fKurva(x)*SY);k?g.lineTo(X,Y):g.moveTo(X,Y);}
      g.stroke();
    }else{
      g.fillStyle='rgba(28,34,48,.08)';g.font='800 60px "Bricolage Grotesque",sans-serif';g.textAlign='center';g.textBaseline='middle';
      g.fillText('kurva disembunyikan',px(0),py(3.2));
    }
    g.fillStyle='#e5392b';g.font='800 62px "Bricolage Grotesque",sans-serif';g.textAlign='left';g.textBaseline='middle';
    g.fillText(o.rumus||'',px(-WX)+40,py(8.4*SY)-10);
    g.fillStyle='#1c2230';g.font='700 34px "Chakra Petch",sans-serif';
    g.fillText(o.aturan||'',px(-WX)+40,py(7.4*SY)-10);
    g.strokeStyle='#1c2230';g.lineWidth=8;g.strokeRect(px(-WX),py(9*SY),px(WX)-px(-WX),py(0)-py(9*SY));
    tx.needsUpdate=true;
  }

  /* pelat zona kolom di lantai */
  const pelat=[];
  function bangunPelat(n,xs){
    for(const p of pelat){grup.remove(p);p.geometry.dispose();if(p.material.map)p.material.map.dispose();p.material.dispose();}
    pelat.length=0;const w=2*WX/n;
    for(let i=0;i<n;i++){
      const c=document.createElement('canvas');c.width=128;c.height=Math.round(128*(ZONA.z1-ZONA.z0)/(w-.06));
      c.height=Math.max(64,Math.min(512,c.height));
      const g=c.getContext('2d');g.fillStyle=i%2?'#e8d3a6':'#f7e8c8';g.fillRect(0,0,c.width,c.height);
      g.fillStyle='#1c2230';g.textAlign='center';g.textBaseline='middle';
      const fs=n>8?22:30;g.font='800 '+fs+'px "Chakra Petch",sans-serif';
      g.fillText('x = '+(Math.round(xs[i]*100)/100),c.width/2,c.height/2);
      const tx2=new THREE.CanvasTexture(c);tx2.colorSpace=THREE.SRGBColorSpace;
      const p=new THREE.Mesh(new THREE.PlaneGeometry(w-.06,ZONA.z1-ZONA.z0),new THREE.MeshBasicMaterial({map:tx2}));
      p.rotation.x=-Math.PI/2;p.rotation.z=0;p.position.set(kolX(n,i),.03,(ZONA.z0+ZONA.z1)/2);p.userData.i=i;grup.add(p);pelat.push(p);
    }
  }
  /* balok di kolom dan balok yang dibawa */
  const gb=new THREE.BoxGeometry(1,1,1);
  const bag=new THREE.InstancedMesh(gb,new THREE.MeshLambertMaterial({flatShading:true}),12*MAXBAG);bag.frustumCulled=false;bag.count=0;grup.add(bag);
  const bawa=new THREE.InstancedMesh(gb,new THREE.MeshLambertMaterial({flatShading:true}),96);bawa.frustumCulled=false;bawa.count=0;grup.add(bawa);
  const M=new THREE.Matrix4(),Q=new THREE.Quaternion(),P=new THREE.Vector3(),S=new THREE.Vector3(),C=new THREE.Color();
  let warna='#e5392b',nKol=3;
  function setBags(cnt){
    const n=cnt.length,w=2*WX/n*.9;let k=0;
    for(let i=0;i<n;i++)for(let j=0;j<cnt[i];j++){
      P.set(kolX(n,i),(j+.5)*UB,-1.7);S.set(w,UB*.97,.5);M.compose(P,Q,S);bag.setMatrixAt(k,M);
      C.set(warna);if(j%2)C.lerp(new THREE.Color(1,1,1),.28);bag.setColorAt(k,C);k++;
    }
    bag.count=k;bag.instanceMatrix.needsUpdate=true;if(bag.instanceColor)bag.instanceColor.needsUpdate=true;
  }
  /* items: {x,y,z,n} */
  function setBawa(items){
    let k=0;
    for(const it of items)for(let j=0;j<it.n&&k<96;j++){
      P.set(it.x,it.y+j*.42,it.z);S.set(.9,.36,.7);M.compose(P,Q,S);bawa.setMatrixAt(k,M);
      C.set(warna);if(j%2)C.lerp(new THREE.Color(1,1,1),.28);bawa.setColorAt(k,C);k++;
    }
    bawa.count=k;bawa.instanceMatrix.needsUpdate=true;if(bawa.instanceColor)bawa.instanceColor.needsUpdate=true;
  }

  /* tiga gudang: tumpukan peti menyusut sesuai stok, papan menampilkan sisa */
  const gudangs=[];
  function papan(){
    const c=document.createElement('canvas');c.width=256;c.height=128;const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;
    const sp=new THREE.Mesh(new THREE.PlaneGeometry(4.2,2.1),new THREE.MeshBasicMaterial({map:tx,transparent:true,depthWrite:false,toneMapped:false}));
    sp.rotation.x=-Math.PI/2;sp.renderOrder=2;
    return {sp,c,tx,teks:''};
  }
  function tulis(o,l1,l2,warnaTeks){
    const k=l2+'|'+warnaTeks;if(o.teks===k)return;o.teks=k;
    const g=o.c.getContext('2d');g.clearRect(0,0,256,128);
    g.textAlign='center';g.textBaseline='middle';g.font='800 96px "Bricolage Grotesque",sans-serif';
    g.lineWidth=14;g.lineJoin='round';g.strokeStyle='#fff6e4';g.strokeText(l2,128,68);
    g.fillStyle=warnaTeks;g.fillText(l2,128,68);o.tx.needsUpdate=true;
  }
  DEPOTS.forEach((d,di)=>{
    const g=new THREE.Group();g.position.set(d.x,0,d.z);grup.add(g);
    const cg=new THREE.Mesh(new THREE.RingGeometry(d.r-.3,d.r,28),new THREE.MeshBasicMaterial({color:0xff6f47,side:THREE.DoubleSide}));
    cg.rotation.x=-Math.PI/2;cg.position.y=.04;g.add(cg);
    const peti=[];
    for(let i=0;i<3;i++)for(let j=0;j<3-i;j++){
      const b=new THREE.Mesh(gb,new THREE.MeshLambertMaterial({color:warna,flatShading:true}));
      b.scale.set(1.1,.5,.8);b.position.set((j-(2-i)/2)*1.2,.26+i*.52,0);g.add(b);peti.push(b);
    }
    const pb=papan();pb.sp.position.set(0,.06,d.r+1.2);g.add(pb.sp);
    gudangs.push({g,peti,pb,nama:d.nama});
  });
  const tumpuk=gudangs.flatMap(o=>o.peti);
  function setStok(g,g0){
    gudangs.forEach((o,i)=>{
      const n=g[i]|0,mx=Math.max(1,g0[i]|0),vis=n<=0?0:Math.max(1,Math.ceil(6*n/mx));
      o.peti.forEach((b,j)=>{b.visible=j<vis;});
      tulis(o.pb,'',n>0?String(n):'0',n>0?(n/mx<.25?'#e5392b':'#1c2230'):'#e5392b');
    });
  }
  const pad=new THREE.Group();pad.position.set(PAD.x,0,PAD.z);grup.add(pad);
  const cp=new THREE.Mesh(new THREE.CircleGeometry(PAD.r,28),new THREE.MeshBasicMaterial({color:0x7bd38a,transparent:true,opacity:.75}));
  cp.rotation.x=-Math.PI/2;cp.position.y=.04;pad.add(cp);
  const cr=new THREE.Mesh(new THREE.RingGeometry(PAD.r-.3,PAD.r,28),new THREE.MeshBasicMaterial({color:0x1c2230,side:THREE.DoubleSide}));
  cr.rotation.x=-Math.PI/2;cr.position.y=.05;pad.add(cr);
  {const c=document.createElement('canvas');c.width=256;c.height=128;const g=c.getContext('2d');
    g.textAlign='center';g.textBaseline='middle';g.font='800 84px "Bricolage Grotesque",sans-serif';g.lineWidth=12;g.lineJoin='round';
    g.strokeStyle='#e8f6ea';g.strokeText('PAD',128,68);g.fillStyle='#1c2230';g.fillText('PAD',128,68);
    const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;
    const lp=new THREE.Mesh(new THREE.PlaneGeometry(3.6,1.8),new THREE.MeshBasicMaterial({map:tx,transparent:true,depthWrite:false,toneMapped:false}));
    lp.rotation.x=-Math.PI/2;lp.position.y=.07;lp.renderOrder=2;pad.add(lp);}

  /* sungai dengan satu jembatan sempit di tengah */
  {
    const w=SUNGAI.x1-SUNGAI.x0,d=SUNGAI.z1-SUNGAI.z0,cx=(SUNGAI.x0+SUNGAI.x1)/2,cz=(SUNGAI.z0+SUNGAI.z1)/2;
    const tepiS=new THREE.Mesh(new THREE.BoxGeometry(w+.8,.06,d+.8),mat(0x7a5a34));tepiS.position.set(cx,.03,cz);grup.add(tepiS);
    const air=new THREE.Mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshBasicMaterial({color:0x3f9bd8,transparent:true,opacity:.92}));
    air.rotation.x=-Math.PI/2;air.position.set(cx,.07,cz);grup.add(air);
    const riak=new THREE.Mesh(new THREE.PlaneGeometry(w,.18),new THREE.MeshBasicMaterial({color:0xbfe6ff,transparent:true,opacity:.7}));
    riak.rotation.x=-Math.PI/2;riak.position.set(cx,.08,cz);grup.add(riak);
    air.userData.riak=riak;grup.userData.air=air;
    const jw=JEMBATAN.x1-JEMBATAN.x0;
    for(let k=0;k<8;k++){
      const pl=new THREE.Mesh(new THREE.BoxGeometry(jw,.14,(d+.8)/8-.06),mat(k%2?0xc08a4a:0xb27a3c));
      pl.position.set(0,.12,SUNGAI.z0-.4+(k+.5)*(d+.8)/8);grup.add(pl);
    }
    for(const sx of [-1,1]){const rl=new THREE.Mesh(new THREE.BoxGeometry(.12,.5,d+.8),mat(0x6b4a26));rl.position.set(sx*(jw/2+.06),.4,cz);grup.add(rl);}
    
  }
  /* penanda jalur di lantai */
  {
    const tanda=[['Jalur kiri',-12.5],['Jalur tengah',0],['Jalur kanan',12.5]];
    
  }
  /* medan tambahan per babak: palu ayun (tengah), pintu geser dan duri (kiri), ban berjalan, lantai runtuh dan trampolin (kanan), bola menggelinding */
  const logam=mat(0x6b7480),merah=mat(0xe5392b),oranye=mat(0xff8a3d),gelap=mat(0x1c2230);
  const MD={palu:[],pintu:[],duri:[],ubin:[],lubang:[],bola:[],chev:[],lbl:{}};
  let mSpec=medanBabak(0),chevOff=0;
  for(let i=0;i<2;i++){
    const g=new THREE.Group(),t1=new THREE.Mesh(new THREE.BoxGeometry(.3,PAL_Y+.4,.3),logam),t2=t1.clone(),bm=new THREE.Mesh(new THREE.BoxGeometry(2*(PAL_A+.9),.3,.3),logam);
    t1.position.set(-PAL_A-.9,(PAL_Y+.4)/2,0);t2.position.set(PAL_A+.9,(PAL_Y+.4)/2,0);bm.position.set(0,PAL_Y+.15,0);
    const ag=new THREE.BoxGeometry(.2,PAL_L,.2);ag.translate(0,-PAL_L/2,0);const lengan=new THREE.Mesh(ag,logam);lengan.position.set(0,PAL_Y,0);
    const kepala=new THREE.Mesh(new THREE.BoxGeometry(1.5,1.0,1.1),merah);kepala.position.set(0,-PAL_L,0);lengan.add(kepala);
    g.add(t1,t2,bm,lengan);g.visible=false;grup.add(g);MD.palu.push({g,lengan});
  }
  {
    const pg=new THREE.BoxGeometry(1,2.2,.9);
    for(let i=0;i<2;i++){const m=new THREE.Mesh(pg,oranye);m.position.y=1.1;m.visible=false;grup.add(m);MD.pintu.push(m);}
  }
  for(let j=0;j<2;j++)for(let i=0;i<DURI_X.length;i++){
    const g=new THREE.Group(),dasar=new THREE.Mesh(new THREE.CylinderGeometry(.85,.85,.05,14),gelap);dasar.position.y=.03;g.add(dasar);
    const kn=new THREE.Group();
    for(const [ox,oz] of [[-.35,-.2],[.35,-.2],[0,.3]]){const c=new THREE.Mesh(new THREE.ConeGeometry(.26,1.0,6),merah);c.position.set(ox,.5,oz);kn.add(c);}
    g.add(kn);g.visible=false;grup.add(g);MD.duri.push({g,kn,j,i});
  }
  for(let n=0;n<6;n++){
    const lb=new THREE.Mesh(new THREE.BoxGeometry(UBIN_W,.04,UBIN_D),gelap);lb.position.y=.03;lb.visible=false;grup.add(lb);MD.lubang.push(lb);
    const u=new THREE.Mesh(new THREE.BoxGeometry(UBIN_W*.96,.18,UBIN_D*.96),mat(0xd9a45a));u.position.y=.1;u.visible=false;grup.add(u);MD.ubin.push(u);
  }
  for(let n=0;n<2;n++){
    const b=new THREE.Mesh(new THREE.IcosahedronGeometry(BOLA_R,1),mat(0x8a8f98));b.visible=false;grup.add(b);
    const w=new THREE.Mesh(new THREE.PlaneGeometry(BOLA_R*2,21),new THREE.MeshBasicMaterial({color:0xe5392b,transparent:true,opacity:.0,depthWrite:false}));
    w.rotation.x=-Math.PI/2;w.position.set(0,.06,9);w.visible=false;grup.add(w);MD.bola.push({b,w});
  }
  /* ban berjalan: alas gelap dan panah yang bergulir */
  const banAlas=new THREE.Mesh(new THREE.PlaneGeometry(KANAN.x1-KANAN.x0,2.6),new THREE.MeshBasicMaterial({color:0x4a4f5a}));
  banAlas.rotation.x=-Math.PI/2;banAlas.position.set((KANAN.x0+KANAN.x1)/2,.05,10.7);grup.add(banAlas);
  const chevG=new THREE.Group();grup.add(chevG);
  {
    const ga=new THREE.BoxGeometry(.8,.03,.16);
    for(let k=0;k<20;k++){
      const g=new THREE.Group(),a=new THREE.Mesh(ga,mat(0xffd96b)),b=new THREE.Mesh(ga,mat(0xffd96b));
      a.position.set(-.25,0,-.25);a.rotation.y=-Math.PI/4;b.position.set(.25,0,-.25);b.rotation.y=Math.PI/4;g.add(a,b);g.position.y=.08;chevG.add(g);MD.chev.push(g);
    }
  }
  const tramp=new THREE.Group();tramp.visible=false;grup.add(tramp);
  {
    const alas=new THREE.Mesh(new THREE.CylinderGeometry(1.3,1.3,.25,18),mat(0xe5392b)),atas=new THREE.Mesh(new THREE.CylinderGeometry(1.05,1.05,.06,18),mat(0xfff1d0));
    alas.position.y=.13;atas.position.y=.28;tramp.add(alas,atas);
  }
  const labelMd=(k,t,x,y,z,sx)=>{};
  labelMd('palu','Palu ayun',0,5.4,9.3);labelMd('pintu','Pintu geser',PINTU_C,3.3,11.2);labelMd('duri','Duri',-11.2,2.2,8.4,2.6);
  labelMd('ban','Ban berjalan',11.25,2.2,10.7);labelMd('ubin','Lantai runtuh',11.1,2.2,8.4);labelMd('tramp','Trampolin',4.6,2.6,12.6,3.2);
  function setMedan(r){
    mSpec=medanBabak(r);
    MD.palu.forEach((o,i)=>{const p=mSpec.palu[i];o.g.visible=!!p;if(p)o.g.position.set(0,0,p.z);});
    MD.pintu.forEach(m=>{m.visible=true;m.position.z=mSpec.pintu[0].z;});
    MD.duri.forEach(o=>{const p=mSpec.duri[o.j];o.g.visible=!!p;if(p)o.g.position.set(DURI_X[o.i],0,p.z);});
    MD.ubin.forEach((u,n)=>{const s=mSpec.ubin[n];u.visible=!!s;MD.lubang[n].visible=!!s;if(s){u.position.set(s.x,.1,s.z);MD.lubang[n].position.set(s.x,.03,s.z);}});
    MD.bola.forEach((o,n)=>{const s=mSpec.bola[n];o.b.visible=false;o.w.visible=!!s;if(s){o.w.position.x=s.x;o.w.material.opacity=0;}});
    if(mSpec.tramp){tramp.visible=true;tramp.position.set(mSpec.tramp.x,0,mSpec.tramp.z);}else tramp.visible=false;
  }
  function animMedan(t,dt){
    mSpec.palu.forEach((p,i)=>{const x=xPalu(p,t);MD.palu[i].lengan.rotation.z=Math.asin(Math.max(-1,Math.min(1,x/PAL_L)));});
    {
      const p=mSpec.pintu[0],g=celahPintu(p,t),izq=PINTU_C-g/2,dr=PINTU_C+g/2;
      MD.pintu[0].scale.x=Math.max(.01,izq-KIRI.x0);MD.pintu[0].position.x=(KIRI.x0+izq)/2;
      MD.pintu[1].scale.x=Math.max(.01,KIRI.x1-dr);MD.pintu[1].position.x=(dr+KIRI.x1)/2;
    }
    for(const o of MD.duri){const p=mSpec.duri[o.j];if(!p)continue;const h=tinggiDuri(p,o.i,t);o.kn.scale.y=Math.max(.001,h);
      for(const c of o.kn.children)c.material=h>=.99?merah:(h>0?oranye:merah);}
    mSpec.ubin.forEach((u,n)=>{const s=statusUbin(u,t),m=MD.ubin[n];m.visible=s!==2;m.material.color.setHex(s===1?(Math.sin(t*22)>0?0xe5392b:0xd9a45a):0xd9a45a);m.position.x=u.x+(s===1?Math.sin(t*60)*.04:0);});
    mSpec.bola.forEach((b,n)=>{
      const s=keadaanBola(b,t),o=MD.bola[n];o.b.visible=s.fase==='gulir';
      if(s.fase==='gulir'){o.b.position.set(b.x,BOLA_R,s.z);o.b.rotation.x=s.z/BOLA_R;}
      o.w.material.opacity=s.fase==='peringatan'?(.18+.18*Math.abs(Math.sin(t*8))):(s.fase==='gulir'?.1:0);
    });
    const v=kecBan(mSpec,t);chevOff=(chevOff+Math.abs(v)*dt)%2.6;const L=2.6,N=5,sp=L/N;
    chevG.rotation.y=v<0?Math.PI:0;chevG.position.set((KANAN.x0+KANAN.x1)/2,0,10.7);
    MD.chev.forEach((g,k)=>{
      const col=k%4,row=Math.floor(k/4),zl=((row*sp+chevOff)%L)-L/2;
      g.position.set((col-1.5)*1.7,.08,zl);
    });
  }
  /* gelondong rintangan: gerak ditentukan jam dinding sehingga sama di semua perangkat */
  const gelondong=[];
  const geoG=new THREE.CylinderGeometry(.55,.55,1.3,12);geoG.rotateX(Math.PI/2);
  const matG=mat(0x8a5a2b),matB=mat(0xd9a45a);
  for(let i=0;i<RINT_MAKS;i++){
    const m=new THREE.Group(),b=new THREE.Mesh(geoG,matG);
    const s1=new THREE.Mesh(new THREE.BoxGeometry(1.15,.18,1.36),matB);m.add(b);b.add(s1);
    m.visible=false;grup.add(m);gelondong.push({g:m,b});
  }
  function setRintangan(spec){gelondong.forEach((o,i)=>{o.spec=spec[i]||null;o.g.visible=!!spec[i];});}
  function animRintangan(tSec){
    for(const o of gelondong){if(!o.spec)continue;const x=xRint(o.spec,tSec);
      o.g.position.set(x,.55,o.spec.z);o.b.rotation.z=-x/.55;}
  }

  return {
    grup,
    setBabak(o){nKol=o.n;gambarDinding(o);bangunPelat(o.n,o.xs);},
    setWarna(w){warna=w;for(const b of tumpuk)b.material.color.set(w);},
    setStok,setMedan,animMedan,
    setBags,setBawa,setRintangan,animRintangan,
    sorot(i){for(const p of pelat)p.material.color.set(p.userData.i===i?0xffd96b:0xffffff);},
    airAnim(t){const r=grup.userData.air&&grup.userData.air.userData.riak;if(r){r.position.z=(SUNGAI.z0+SUNGAI.z1)/2+Math.sin(t*.9)*(SUNGAI.z1-SUNGAI.z0)*.4;}},
    padAnim(t,siap){const s=1+Math.sin(t*3)*.04;cp.scale.set(s,s,1);cp.material.opacity=siap?.95:.6;},
    get n(){return nKol;}
  };
}
