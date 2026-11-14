/* Arena Pos 1: lantai, dinding berkurva, kolom balok, gudang balok, pad kunci.
   Dunia arena memakai titik asal yang sama dengan lobi, kelompoknya dinyalakan saat pemain masuk. */
import * as THREE from './vendor/three.min.js';
import {BABAK,UBAG,MAXBAG,XMAX} from './pos1.js';
import {labelSprite} from './util.js';

export const SY=.9,UB=UBAG*SY,WX=6;
export const DEPOT={x:-8.5,z:7,r:2.5},PAD={x:8.5,z:7,r:2.5};
export const BATAS={x0:-12,x1:12,z0:.4,z1:13.5},ZONA={z0:.2,z1:3.4};
export const kolX=(n,i)=>-WX+(i+.5)*2*WX/n;
export function kolomDari(n,x,z){
  if(z<ZONA.z0||z>ZONA.z1||x<-WX||x>WX)return -1;
  return Math.min(n-1,Math.floor((x+WX)/(2*WX/n)));
}
export const diDepot=(x,z)=>Math.hypot(x-DEPOT.x,z-DEPOT.z)<DEPOT.r;
export const diPad=(x,z)=>Math.hypot(x-PAD.x,z-PAD.z)<PAD.r;

const mat=c=>new THREE.MeshLambertMaterial({color:c,flatShading:true});
export function buatArena(){
  const grup=new THREE.Group();grup.visible=false;
  const lantai=new THREE.Mesh(new THREE.BoxGeometry(28,.3,17),mat(0xf2e3c2));lantai.position.set(0,-.16,6);grup.add(lantai);
  const tepi=new THREE.Mesh(new THREE.BoxGeometry(28.6,.2,17.6),mat(0x1c2230));tepi.position.set(0,-.32,6);grup.add(tepi);

  /* dinding kurva */
  const cw=document.createElement('canvas');cw.width=1400;cw.height=950;
  const tx=new THREE.CanvasTexture(cw);tx.colorSpace=THREE.SRGBColorSpace;tx.anisotropy=4;
  const dinding=new THREE.Mesh(new THREE.PlaneGeometry(14,9.5),new THREE.MeshBasicMaterial({map:tx}));
  dinding.position.set(0,4.75,-2.2);grup.add(dinding);
  const WW=1400,HH=950,px=wx=>(wx+7)/14*WW,py=wy=>HH-wy/9.5*HH;
  function gambarDinding(n){
    const g=cw.getContext('2d');
    g.fillStyle='#fff6e4';g.fillRect(0,0,WW,HH);
    g.strokeStyle='#e5dcc6';g.lineWidth=2;g.fillStyle='#1c2230';g.font='700 26px "Chakra Petch",sans-serif';
    g.textAlign='right';g.textBaseline='middle';
    /* satu petak vertikal = satu balok (0,5 satuan data); garis tebal tiap 1 satuan berlabel */
    for(let y=0;y<=9;y+=UBAG){
      const mayor=Number.isInteger(y);
      g.strokeStyle=mayor?'#cdbf9c':'#eadfc6';g.lineWidth=mayor?3:2;
      g.beginPath();g.moveTo(px(-WX),py(y*SY));g.lineTo(px(WX),py(y*SY));g.stroke();
      if(mayor)g.fillText(String(y),px(-WX)-12,py(y*SY));
    }
    g.fillStyle='#1c2230';
    g.textAlign='center';g.textBaseline='top';
    for(let x=0;x<=XMAX;x++){g.fillText(String(x),px(-WX+x*2*WX/XMAX),py(0)+8);}
    /* daerah di bawah kurva */
    g.fillStyle='rgba(47,127,193,.22)';g.beginPath();g.moveTo(px(-WX),py(0));
    for(let k=0;k<=80;k++){const x=k/80*XMAX;g.lineTo(px(-WX+x*2*WX/XMAX),py(x*x*SY));}
    g.lineTo(px(WX),py(0));g.closePath();g.fill();
    /* garis kolom */
    g.strokeStyle='rgba(28,34,48,.35)';g.lineWidth=2;g.setLineDash([10,8]);
    for(let i=0;i<=n;i++){const x=px(-WX+i*2*WX/n);g.beginPath();g.moveTo(x,py(0));g.lineTo(x,py(9*SY));g.stroke();}
    g.setLineDash([]);
    g.strokeStyle='#e5392b';g.lineWidth=7;g.beginPath();
    for(let k=0;k<=80;k++){const x=k/80*XMAX,X=px(-WX+x*2*WX/XMAX),Y=py(x*x*SY);k?g.lineTo(X,Y):g.moveTo(X,Y);}
    g.stroke();
    g.fillStyle='#e5392b';g.font='800 40px "Bricolage Grotesque",sans-serif';g.textAlign='left';g.textBaseline='middle';
    g.fillText('y = x²',px(-WX)+30,py(8.2*SY)-80);
    g.strokeStyle='#1c2230';g.lineWidth=8;g.strokeRect(px(-WX),py(9*SY),px(WX)-px(-WX),py(0)-py(9*SY));
    tx.needsUpdate=true;
  }

  /* pelat zona kolom di lantai */
  const pelat=[];
  function bangunPelat(n){
    for(const p of pelat){grup.remove(p);p.geometry.dispose();p.material.dispose();}
    pelat.length=0;const w=2*WX/n;
    for(let i=0;i<n;i++){
      const p=new THREE.Mesh(new THREE.PlaneGeometry(w-.06,ZONA.z1-ZONA.z0),new THREE.MeshBasicMaterial({color:i%2?0xe8d3a6:0xf7e8c8}));
      p.rotation.x=-Math.PI/2;p.position.set(kolX(n,i),.03,(ZONA.z0+ZONA.z1)/2);p.userData.i=i;grup.add(p);pelat.push(p);
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

  return {
    grup,
    setBabak(n){nKol=n;gambarDinding(n);bangunPelat(n);},
    setWarna(w){warna=w;for(const b of tumpuk)b.material.color.set(w);},
    setBags,setBawa,
    sorot(i){for(const p of pelat){const a=p.userData.i%2;p.material.color.set(p.userData.i===i?0xffd96b:(a?0xe8d3a6:0xf7e8c8));}},
    padAnim(t,siap){const s=1+Math.sin(t*3)*.04;cp.scale.set(s,s,1);cp.material.opacity=siap?.95:.6;},
    get n(){return nKol;}
  };
}
