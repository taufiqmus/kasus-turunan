/* Arena Pos 5 "Teluk Karang": dunia umum (tema pantai) ditambah papan integral tentu, timbangan brankas
   (piring kanan F(atas), piring kiri F(bawah)), dan sumber beban di tiga kamp. */
import * as THREE from './vendor/three.min.js';
import {M5} from './medan.js?v=40';
import {buatDunia,TEMA_PANTAI,mat,tulisanLantai} from './dunia3d.js?v=40';
import {soal5,nBrankas,nilaiP,teksP,BMAX} from './pos5.js?v=40';

/* letak piring: brankas i berpusat di cx, piring kiri (slot 2i+1) di cx-2.3, piring kanan (slot 2i) di cx+2.3 */
export const PUSAT=n=>n===1?[0]:[-5.2,5.2];
export const piring=r=>{const L=[];PUSAT(nBrankas(r)).forEach((cx,i)=>{L[2*i]={x:cx+2.3,z:4.7,r:1.25};L[2*i+1]={x:cx-2.3,z:4.7,r:1.25};});return L;};
export const piringDi=(r,x,z)=>piring(r).findIndex(p=>Math.hypot(x-p.x,z-p.z)<p.r);
const NAMA_BR=['A','B'];

function tandaIntegral(g,x,y,h,bawah,atas,k,warna){
  g.save();g.strokeStyle=warna;g.lineWidth=Math.max(2,9*k);g.lineCap='round';
  g.beginPath();g.moveTo(x+h*.16,y-h*.5);g.bezierCurveTo(x+h*.02,y-h*.62,x-h*.02,y-h*.3,x,y);g.bezierCurveTo(x+h*.02,y+h*.3,x-h*.02,y+h*.62,x-h*.16,y+h*.5);g.stroke();
  g.fillStyle=warna;g.font='800 '+Math.round(h*.24)+'px "Chakra Petch",sans-serif';g.textAlign='left';g.textBaseline='middle';
  g.fillText(String(atas),x+h*.2,y-h*.48);g.fillText(String(bawah),x-h*.08,y+h*.55);g.restore();
}
/* papan: f, F (babak 1), tiap brankas sebagai integral tentu, dan grafik f dengan luas di antara batas */
export function gambarBrankas(cv,r,opsi={}){
  const S=soal5(r),g=cv.getContext('2d'),W=cv.width,H=cv.height,k=W/2000,kecil=!!opsi.kecil;
  g.fillStyle='#fbf3df';g.fillRect(0,0,W,H);g.strokeStyle='#7a4f2a';g.lineWidth=Math.max(2,14*k);g.strokeRect(7*k,7*k,W-14*k,H-14*k);
  const F='"Bricolage Grotesque",sans-serif',C='"Chakra Petch",sans-serif';
  if(!kecil){
    g.fillStyle='#7a4f2a';g.font='800 '+Math.round(54*k)+'px '+F;g.textAlign='left';g.textBaseline='top';g.fillText('Brankas Batas · babak '+(r+1),60*k,36*k);
    g.fillStyle='#1c2230';g.font='800 '+Math.round(64*k)+'px '+C;g.fillText('f(x) = '+teksP(S.f),60*k,130*k);
    g.fillStyle=S.tampilF?'#1f5f99':'#b8321c';g.fillText(S.tampilF?'F(x) = '+teksP(S.F):'F(x) = ?   (cari sendiri: F′ = f)',60*k,215*k);
    S.br.forEach((B,i)=>{
      const y=420*k+i*210*k;g.fillStyle='#1c2230';g.font='800 '+Math.round(50*k)+'px '+F;g.textAlign='left';g.textBaseline='middle';
      g.fillText('Brankas '+NAMA_BR[i]+':',60*k,y);
      tandaIntegral(g,390*k,y,150*k,B.bawah,B.atas,k,'#1c2230');
      g.font='800 '+Math.round(54*k)+'px '+C;g.fillText('f(x) dx = F('+B.atas+') − F('+B.bawah+')',470*k,y);
    });
    g.fillStyle='#5a4a3a';g.font='700 '+Math.round(34*k)+'px '+C;g.textAlign='left';g.textBaseline='bottom';
    g.fillText('Piring kanan = F(atas), piring kiri = F(bawah). Sandi = kanan − kiri.',60*k,H-78*k);
    g.fillText(S.tampilF?'Timbangan miring ke kanan berarti sandi positif.':'C boleh berapa saja, asal sama di kedua piring: C saling menghapus.',60*k,H-30*k);
  }
  /* grafik f */
  const L=kecil?70*k:1260*k,R=W-(kecil?30:70)*k,T=kecil?30*k:150*k,Bt=H-(kecil?60:170)*k;
  let xm=0;for(const B of S.br)xm=Math.max(xm,B.atas,B.bawah);xm=Math.max(xm,2);
  let lo=0,hi=1;for(let i=0;i<=60;i++){const v=nilaiP(S.f,xm*i/60);lo=Math.min(lo,v);hi=Math.max(hi,v);}hi=Math.ceil(hi*1.1);
  const X=x=>L+x/xm*(R-L),Y=v=>Bt-(v-lo)/(hi-lo)*(Bt-T);
  g.strokeStyle='#e6d6b4';g.lineWidth=Math.max(1,3*k);g.font='700 '+Math.round((kecil?60:32)*k)+'px '+C;g.fillStyle='#5a4a3a';
  for(let x=0;x<=xm;x++){g.beginPath();g.moveTo(X(x),T);g.lineTo(X(x),Bt);g.stroke();g.textAlign='center';g.textBaseline='top';g.fillText(String(x),X(x),Bt+10*k);}
  const warnaBr=['rgba(63,155,216,.45)','rgba(229,57,43,.38)'];
  S.br.forEach((B,i)=>{const a=Math.min(B.atas,B.bawah),b=Math.max(B.atas,B.bawah);g.fillStyle=warnaBr[i];g.beginPath();g.moveTo(X(a),Y(0));
    for(let j=0;j<=40;j++){const x=a+(b-a)*j/40;g.lineTo(X(x),Y(nilaiP(S.f,x)));}g.lineTo(X(b),Y(0));g.closePath();g.fill();
    /* panah arah integrasi: dari batas bawah ke batas atas */
    const yA=Y(0)-(kecil?18:40)*k*(i+1);g.strokeStyle=i?'#b8321c':'#1f5f99';g.lineWidth=Math.max(2,6*k);g.beginPath();g.moveTo(X(B.bawah),yA);g.lineTo(X(B.atas),yA);g.stroke();
    const s=Math.sign(B.atas-B.bawah),u=(kecil?14:26)*k;g.beginPath();g.moveTo(X(B.atas),yA);g.lineTo(X(B.atas)-s*u,yA-u*.6);g.lineTo(X(B.atas)-s*u,yA+u*.6);g.closePath();g.fillStyle=g.strokeStyle;g.fill();
    if(!kecil){g.font='800 '+Math.round(34*k)+'px '+F;g.textAlign='center';g.textBaseline='bottom';g.fillText(NAMA_BR[i],(X(B.atas)+X(B.bawah))/2,yA-8*k);}});
  g.strokeStyle='#7a4f2a';g.lineWidth=Math.max(2,8*k);g.beginPath();for(let i=0;i<=80;i++){const x=xm*i/80;i?g.lineTo(X(x),Y(nilaiP(S.f,x))):g.moveTo(X(x),Y(nilaiP(S.f,x)));}g.stroke();
  g.strokeStyle='#1c2230';g.lineWidth=Math.max(2,5*k);g.beginPath();g.moveTo(L,T);g.lineTo(L,Bt);g.moveTo(L,Y(0));g.lineTo(R,Y(0));g.stroke();
  if(!kecil){g.fillStyle='#7a4f2a';g.font='800 '+Math.round(40*k)+'px '+F;g.textAlign='left';g.textBaseline='top';g.fillText('y = f(x)',L+16*k,T);}
}

export function buatArena5(){
  const dunia=buatDunia(M5,TEMA_PANTAI),grup=dunia.grup;
  /* papan di dinding tebing karang dengan bingkai kayu perahu */
  const cw=document.createElement('canvas');cw.width=2000;cw.height=950;
  const txp=new THREE.CanvasTexture(cw);txp.colorSpace=THREE.SRGBColorSpace;txp.anisotropy=4;
  {
    const dinding=new THREE.Mesh(new THREE.BoxGeometry(96,12,4),mat(0xb9a88a));dinding.position.set(0,5,-5);grup.add(dinding);
    const bingkai=new THREE.Mesh(new THREE.BoxGeometry(21.4,10.6,.6),mat(0x7a4f2a));bingkai.position.set(0,4.9,-2.7);grup.add(bingkai);
    const papan=new THREE.Mesh(new THREE.PlaneGeometry(20,9.5),dunia.daftarPapan(new THREE.MeshBasicMaterial({map:txp})));papan.position.set(0,4.85,-2.35);grup.add(papan);
    for(const sx of [-11.6,11.6]){const pel=new THREE.Mesh(new THREE.TorusGeometry(.9,.28,8,18),mat(0xe5392b));pel.position.set(sx,8.4,-2.3);grup.add(pel);}
  }
  /* dua timbangan brankas; brankas B hanya muncul di babak 3 */
  const label=(w,h)=>{const c=document.createElement('canvas');c.width=256;c.height=128;const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;
    const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tx,transparent:true,depthWrite:false,toneMapped:false}));m.renderOrder=2;return {m,c,tx,teks:''};};
  const tulis=(o,t1,t2,warna2)=>{const kk=t1+'|'+t2+'|'+warna2;if(o.teks===kk)return;o.teks=kk;const g=o.c.getContext('2d');g.clearRect(0,0,256,128);g.textAlign='center';g.textBaseline='middle';
    g.font='800 44px "Bricolage Grotesque",sans-serif';g.lineWidth=10;g.lineJoin='round';g.strokeStyle='#ffffff';g.fillStyle='#1c2230';g.strokeText(t1,128,36);g.fillText(t1,128,36);
    g.font='800 54px "Bricolage Grotesque",sans-serif';g.fillStyle=warna2;g.strokeText(t2,128,92);g.fillText(t2,128,92);o.tx.needsUpdate=true;};
  const besi=mat(0x5a6470),kuning=mat(0xe0a200),kayuM=mat(0x8a5a2b);
  const geoBeban=new THREE.CylinderGeometry(.62,.7,1,14);
  const brankas=[0,1].map(i=>{
    const g=new THREE.Group();grup.add(g);
    const peti=new THREE.Mesh(new THREE.BoxGeometry(2.6,1.6,1.4),mat(0x3d4652));peti.position.set(0,.8,-.6);g.add(peti);
    const pintu=new THREE.Mesh(new THREE.CylinderGeometry(.9,.9,.12,24),kuning);pintu.rotation.x=Math.PI/2;pintu.scale.set(.75,1,.75);pintu.position.set(0,.85,.16);g.add(pintu);
    const lyr=label(1.8,.9);lyr.m.position.set(0,.85,.24);g.add(lyr.m);
    const tiang=new THREE.Mesh(new THREE.CylinderGeometry(.14,.2,2,8),besi);tiang.position.set(0,2.6,-.6);g.add(tiang);
    const lengan=new THREE.Group();lengan.position.set(0,3.6,-.6);g.add(lengan);
    const balok=new THREE.Mesh(new THREE.BoxGeometry(4.8,.2,.24),kuning);lengan.add(balok);
    const jarum=new THREE.Mesh(new THREE.ConeGeometry(.14,.7,6),mat(0xe5392b));jarum.position.set(0,-.45,0);jarum.rotation.z=Math.PI;lengan.add(jarum);
    const pir=[0,1].map(()=>{const p=new THREE.Group();g.add(p);
      const pr=new THREE.Mesh(new THREE.CylinderGeometry(1,1.1,.14,20),besi);p.add(pr);
      const tl=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,1.2,4),mat(0x2a2f3a));tl.position.y=.6;p.add(tl);
      const beban=new THREE.Mesh(geoBeban,mat(0x2f3640));beban.visible=false;p.add(beban);
      return {p,beban};});
    const pl=[0,1].map(()=>{const m=new THREE.Mesh(new THREE.CircleGeometry(1.25,24),new THREE.MeshBasicMaterial({color:0xf3e6c4,transparent:true,opacity:.85}));m.rotation.x=-Math.PI/2;grup.add(m);
      const lb=label(2.6,1.3);lb.m.rotation.x=-Math.PI/2;grup.add(lb.m);return {m,lb};});
    return {g,lengan,lyr,pir,pl,sudut:0};
  });
  /* sumber beban di kamp */
  {
    const [g0,g1,g2]=dunia.gudangs.map(o=>o.g);
    for(let i=0;i<4;i++){const b=new THREE.Mesh(new THREE.CylinderGeometry(.28,.3,.3,10),besi);b.position.set(-1.6+i*.55,.15,1);g0.add(b);}
    const peti0=new THREE.Mesh(new THREE.BoxGeometry(1.4,.8,1),kayuM);peti0.position.set(1.2,.4,-.4);g0.add(peti0);
    const menara=new THREE.Group();menara.position.set(0,0,-2.6);g1.add(menara);
    for(let i=0;i<5;i++){const s=new THREE.Mesh(new THREE.CylinderGeometry(.95-i*.08,1.03-i*.08,1.4,16),mat(i%2?0xf4f8fb:0xe5392b));s.position.y=.7+i*1.4;menara.add(s);}
    const lampu=new THREE.Mesh(new THREE.CylinderGeometry(.6,.6,.8,12),new THREE.MeshBasicMaterial({color:0xfff1a8}));lampu.position.y=7.4;menara.add(lampu);
    const atap=new THREE.Mesh(new THREE.ConeGeometry(.8,.8,12),mat(0x2a2f3a));atap.position.y=8.2;menara.add(atap);
    for(let i=0;i<2;i++){const j=new THREE.Mesh(new THREE.TorusGeometry(.45,.12,6,12,Math.PI),besi);j.position.set(-1.4+i*2.8,.5,.8);j.rotation.z=Math.PI;g1.add(j);
      const bt=new THREE.Mesh(new THREE.BoxGeometry(.14,1.1,.14),besi);bt.position.set(-1.4+i*2.8,.75,.8);g1.add(bt);}
    for(const sx of [-1.8,1.8]){const k=new THREE.Mesh(new THREE.BoxGeometry(1,2.6,1.2),mat(0x8a7a5a));k.position.set(sx,1.3,-2.2);g2.add(k);}
    const lengkung=new THREE.Mesh(new THREE.BoxGeometry(4.6,.9,1.2),mat(0x8a7a5a));lengkung.position.set(0,2.9,-2.2);g2.add(lengkung);
    for(let i=0;i<2;i++){const pt=new THREE.Mesh(new THREE.BoxGeometry(.9,.6,.6),mat(0xb27a3c));pt.position.set(-.6+i*1.2,.3,-.6);g2.add(pt);}
    [['1 kg',g0],['10 kg',g1],['5 kg',g2]].forEach(([t,g])=>{const l=tulisanLantai(t,3,'#ffffff');l.position.set(0,.07,2.3);g.add(l);});
  }
  /* beban yang dibawa */
  const bawa=new THREE.InstancedMesh(new THREE.CylinderGeometry(.34,.38,.4,10),new THREE.MeshLambertMaterial({color:0x3d4652,flatShading:true}),64);bawa.frustumCulled=false;bawa.count=0;grup.add(bawa);
  const M=new THREE.Matrix4(),Q=new THREE.Quaternion(),P=new THREE.Vector3(),S1=new THREE.Vector3(1,1,1);
  let rNow=0,sNow=[],sorotNow=-1;
  function tata(){
    const n=nBrankas(rNow),cxs=PUSAT(n),S=soal5(rNow),pr=piring(rNow);
    brankas.forEach((b,i)=>{
      const ada=i<n;b.g.visible=ada;b.pl.forEach(o=>{o.m.visible=o.lb.m.visible=ada;});if(!ada)return;
      b.g.position.set(cxs[i],0,1.6);
      const ka=sNow[2*i]|0,ki=sNow[2*i+1]|0,d=ka-ki,B=S.br[i];
      b.target=-Math.max(-.32,Math.min(.32,d*.012));
      tulis(b.lyr,'Brankas '+NAMA_BR[i],(d>0?'+':'')+d,d<0?'#b8321c':'#1f5f99');
      [[2*i,'F('+B.atas+')',ka],[2*i+1,'F('+B.bawah+')',ki]].forEach(([sl,t,v],j)=>{
        const o=b.pl[j],p=pr[sl];o.m.position.set(p.x,.04,p.z);o.lb.m.position.set(p.x,.07,p.z);
        o.m.material.color.setHex(sorotNow===sl?0xffd96b:(j?0xf6d8c8:0xd8e8f6));tulis(o.lb,t,v+' kg',sorotNow===sl?'#b8321c':'#1c2230');
        const bb=b.pir[j].beban;bb.visible=v>0;bb.scale.set(1,Math.max(.05,1.05*v/BMAX),1);bb.position.y=.07+.525*v/BMAX;
      });
    });
  }
  return {
    grup,dunia,
    setBabak(r){rNow=r;gambarBrankas(cw,r);txp.needsUpdate=true;tata();},
    setSlot(s,sorot){sNow=s||[];sorotNow=sorot;tata();},
    setBawa(items){let k=0;for(const it of items)for(let j=0;j<it.n&&k<64;j++){P.set(it.x,it.y+j*.45,it.z);M.compose(P,Q,S1);bawa.setMatrixAt(k++,M);}bawa.count=k;bawa.instanceMatrix.needsUpdate=true;},
    /* timbangan berayun pelan menuju sudut sasaran; piring tergantung di ujung balok */
    animTimbangan(dt){
      for(const b of brankas){if(!b.g.visible)continue;b.sudut+=(b.target-b.sudut)*Math.min(1,dt*3);b.lengan.rotation.z=b.sudut;
        b.pir.forEach((o,j)=>{const s=j?-1:1,x=s*2.3*Math.cos(b.sudut),y=3.6+s*2.3*Math.sin(b.sudut);o.p.position.set(x,y-1.25,-.6);});}
    },
    setMedan:dunia.setMedan,animMedan:dunia.animMedan,setGerbang:dunia.setGerbang,setKoin:dunia.setKoin,setDetail:dunia.setDetail,setUltra:dunia.setUltra,padAnim:dunia.padAnim
  };
}
