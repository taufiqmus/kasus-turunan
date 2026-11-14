/* Arena Pos 1 "Lembah Waduk": dunia umum dari dunia3d.js (tema hijau) ditambah bendungan berkurva,
   pelat kolom, balok, dan isi kamp (peti dan angka stok). Logika murni ada di medan.js dan pos1.js. */
import * as THREE from './vendor/three.min.js';
import {BABAK,UBAG,MAXBAG,XMAX} from './pos1.js?v=30';
import {M1} from './medan.js?v=30';
import {buatDunia,TEMA_HIJAU,mat} from './dunia3d.js?v=30';
export {uTembus} from './dunia3d.js?v=30';

export const SY=.9,UB=UBAG*SY,WX=9;
export const ZONA={z0:.2,z1:4.6};
export const kolX=(n,i)=>-WX+(i+.5)*2*WX/n;
export function kolomDari(n,x,z){
  if(z<ZONA.z0||z>ZONA.z1||x<-WX||x>WX)return -1;
  return Math.min(n-1,Math.floor((x+WX)/(2*WX/n)));
}
export const tinggiTanah=M1.tinggiTanah;
export function buatArena(){
  const dunia=buatDunia(M1,TEMA_HIJAU),grup=dunia.grup;
  /* ---------- bendungan ---------- */
  {
    const beton=mat(0xcfc8b8),gelapB=mat(0x9b958a);
    const badan=new THREE.Mesh(new THREE.BoxGeometry(96,14,4),beton);badan.position.set(0,6,-5);grup.add(badan);
    const atas=new THREE.Mesh(new THREE.BoxGeometry(96,.6,5),gelapB);atas.position.set(0,13.2,-5);grup.add(atas);
    for(let i=-5;i<=5;i++){if(Math.abs(i)<2)continue;const p=new THREE.Mesh(new THREE.BoxGeometry(2.2,13,2.4),gelapB);p.position.set(i*8,6.5,-2.6);grup.add(p);}
    const bingkai=new THREE.Mesh(new THREE.BoxGeometry(21,10.4,.5),mat(0x1c2230));bingkai.position.set(0,4.9,-2.6);grup.add(bingkai);
  }
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

  /* ---------- isi kamp: peti menyusut sesuai stok, angka sisa tertulis di tanah ---------- */
  const gudangs=dunia.gudangs;
  function papan(){
    const c=document.createElement('canvas');c.width=256;c.height=128;const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;
    const sp=new THREE.Mesh(new THREE.PlaneGeometry(4.2,2.1),new THREE.MeshBasicMaterial({map:tx,transparent:true,depthWrite:false,toneMapped:false}));
    sp.rotation.x=-Math.PI/2;sp.renderOrder=2;
    return {sp,c,tx,teks:''};
  }
  function tulis(o,l2,warnaTeks){
    const k=l2+'|'+warnaTeks;if(o.teks===k)return;o.teks=k;
    const g=o.c.getContext('2d');g.clearRect(0,0,256,128);
    g.textAlign='center';g.textBaseline='middle';g.font='800 96px "Bricolage Grotesque",sans-serif';
    g.lineWidth=14;g.lineJoin='round';g.strokeStyle='#fff6e4';g.strokeText(l2,128,68);
    g.fillStyle=warnaTeks;g.fillText(l2,128,68);o.tx.needsUpdate=true;
  }
  gudangs.forEach(o=>{
    o.peti=[];
    for(let i=0;i<3;i++)for(let j=0;j<3-i;j++){
      const b=new THREE.Mesh(gb,new THREE.MeshLambertMaterial({color:warna,flatShading:true}));
      b.scale.set(1.1,.5,.8);b.position.set((j-(2-i)/2)*1.2,.26+i*.52,0);o.g.add(b);o.peti.push(b);
    }
    o.pb=papan();o.pb.sp.position.set(0,.07,2.1);o.g.add(o.pb.sp);
  });
  const tumpuk=gudangs.flatMap(o=>o.peti);
  function setStok(g,g0){
    gudangs.forEach((o,i)=>{
      const n=g[i]|0,mx=Math.max(1,g0[i]|0),vis=n<=0?0:Math.max(1,Math.ceil(6*n/mx));
      o.peti.forEach((b,j)=>{b.visible=j<vis;});
      tulis(o.pb,String(Math.max(0,n)),n>0&&n/mx>=.25?'#1c2230':'#e5392b');
    });
  }

  return {
    grup,dunia,
    setBabak(o){nKol=o.n;gambarDinding(o);bangunPelat(o.n,o.xs);},
    setWarna(w){warna=w;for(const b of tumpuk)b.material.color.set(w);},
    setStok,setBags,setBawa,
    setMedan:dunia.setMedan,animMedan:dunia.animMedan,setGerbang:dunia.setGerbang,setKoin:dunia.setKoin,setDetail:dunia.setDetail,padAnim:dunia.padAnim,
    sorot(i){for(const p of pelat)p.material.color.set(p.userData.i===i?0xffd96b:0xffffff);},
    get n(){return nKol;}
  };
}
