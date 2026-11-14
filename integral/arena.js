/* Arena Pos 1: lantai, dinding berkurva, kolom balok, gudang balok, pad kunci.
   Dunia arena memakai titik asal yang sama dengan lobi, kelompoknya dinyalakan saat pemain masuk. */
import * as THREE from './vendor/three.min.js';
import {BABAK,UBAG,MAXBAG,XMAX} from './pos1.js?v=12';
import {labelSprite} from './util.js?v=12';

export const SY=.9,UB=UBAG*SY,WX=9;
export const DEPOT={x:-13.5,z:10.5,r:2.5},PAD={x:13.5,z:10.5,r:2.5};
export const BATAS={x0:-15,x1:15,z0:.4,z1:16.5},ZONA={z0:.2,z1:4.6};
export const kolX=(n,i)=>-WX+(i+.5)*2*WX/n;
export function kolomDari(n,x,z){
  if(z<ZONA.z0||z>ZONA.z1||x<-WX||x>WX)return -1;
  return Math.min(n-1,Math.floor((x+WX)/(2*WX/n)));
}
export const diDepot=(x,z)=>Math.hypot(x-DEPOT.x,z-DEPOT.z)<DEPOT.r;
export const diPad=(x,z)=>Math.hypot(x-PAD.x,z-PAD.z)<PAD.r;

export const RINT_MAKS=6,RINT_AMP=14.3,RINT_R=.9; /* jari-jari tabrak ke samping (sumbu x) dan setengah panjang di sumbu z */
/* spesifikasi gelondong per babak: lajur z, periode detik, fase 0..1 */
export function rintanganBabak(r){
  const L=[[5.7,13,0],[6.9,14.5,.5],[5.7,13,.5],[6.9,14.5,0],[5.7,10,.25],[6.9,11,.75]];
  const n=[3,4,6][Math.min(r,2)],k=[.8,1,1.25][Math.min(r,2)];
  return L.slice(0,n).map(([z,T,f])=>({z,T:T/k,f}));
}
export const xRint=(sp,tSec)=>RINT_AMP*Math.sin(2*Math.PI*(tSec/sp.T+sp.f));
const mat=c=>new THREE.MeshLambertMaterial({color:c,flatShading:true});
export function buatArena(){
  const grup=new THREE.Group();grup.visible=false;
  const lantai=new THREE.Mesh(new THREE.BoxGeometry(36,.3,22),mat(0xf2e3c2));lantai.position.set(0,-.16,8);grup.add(lantai);
  const tepi=new THREE.Mesh(new THREE.BoxGeometry(36.6,.2,22.6),mat(0x1c2230));tepi.position.set(0,-.32,8);grup.add(tepi);

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

  /* gudang balok dan pad kunci */
  const gudang=new THREE.Group();gudang.position.set(DEPOT.x,0,DEPOT.z);grup.add(gudang);
  const cg=new THREE.Mesh(new THREE.RingGeometry(DEPOT.r-.35,DEPOT.r,28),new THREE.MeshBasicMaterial({color:0xff6f47,side:THREE.DoubleSide}));
  cg.rotation.x=-Math.PI/2;cg.position.y=.04;gudang.add(cg);
  const tumpuk=[];
  for(let i=0;i<3;i++)for(let j=0;j<3-i;j++){
    const b=new THREE.Mesh(gb,new THREE.MeshLambertMaterial({color:warna,flatShading:true}));
    b.scale.set(1.3,.55,.9);b.position.set((j-(2-i)/2)*1.4,.28+i*.58,0);gudang.add(b);tumpuk.push(b);
  }
  const lg=labelSprite('Gudang balok\n(otomatis terambil)',{w:420,h:120,size:32,bg:'#fff6e4',sx:5});lg.position.set(0,3.6,0);gudang.add(lg);
  const pad=new THREE.Group();pad.position.set(PAD.x,0,PAD.z);grup.add(pad);
  const cp=new THREE.Mesh(new THREE.CircleGeometry(PAD.r,28),new THREE.MeshBasicMaterial({color:0x7bd38a,transparent:true,opacity:.75}));
  cp.rotation.x=-Math.PI/2;cp.position.y=.04;pad.add(cp);
  const cr=new THREE.Mesh(new THREE.RingGeometry(PAD.r-.3,PAD.r,28),new THREE.MeshBasicMaterial({color:0x1c2230,side:THREE.DoubleSide}));
  cr.rotation.x=-Math.PI/2;cr.position.y=.05;pad.add(cr);
  const lp=labelSprite('Pad kunci\n(semua berdiri di sini)',{w:420,h:120,size:32,bg:'#fff6e4',sx:5});lp.position.set(0,3.6,0);pad.add(lp);

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
    setBags,setBawa,setRintangan,animRintangan,
    sorot(i){for(const p of pelat)p.material.color.set(p.userData.i===i?0xffd96b:0xffffff);},
    padAnim(t,siap){const s=1+Math.sin(t*3)*.04;cp.scale.set(s,s,1);cp.material.opacity=siap?.95:.6;},
    get n(){return nKol;}
  };
}
