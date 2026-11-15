/* Arena Pos 4 "Hutan Sungai": dunia umum (tema hutan) ditambah papan grafik debit, tiga tangki kaca berisi air
   (volume pada waktu t1, t2, t3), dan sumber air di tiga kamp. */
import * as THREE from './vendor/three.min.js';
import {M4} from './medan.js?v=41';
import {buatDunia,TEMA_HUTAN,mat,tulisanLantai} from './dunia3d.js?v=41';
import {soal4,rDi,VMAX,luasPotong} from './pos4.js?v=41';

export const TANGKI=[-6,0,6].map(x=>({x,z:1.7,px:x,pz:4.6,r:1.4}));
export const tangkiDi=(x,z)=>TANGKI.findIndex(t=>Math.hypot(x-t.px,z-t.pz)<t.r);

/* grafik debit: potongan, luas bertanda, garis waktu tangki */
export function gambarDebit(cv,r,opsi={}){
  const S=soal4(r),g=cv.getContext('2d'),W=cv.width,H=cv.height,k=W/2000,kecil=!!opsi.kecil;
  g.fillStyle='#f3f7ef';g.fillRect(0,0,W,H);g.strokeStyle='#2f5d3a';g.lineWidth=Math.max(2,12*k);g.strokeRect(6*k,6*k,W-12*k,H-12*k);
  let lo=0,hi=0;for(const [,,a,b] of S.p){lo=Math.min(lo,a,b);hi=Math.max(hi,a,b);}hi=Math.ceil(hi+1);lo=Math.floor(lo-(lo<0?1:0));
  const L=(kecil?90:200)*k,R=W-(kecil?40:80)*k,T=(kecil?40:150)*k,B=H-(kecil?70:120)*k,tm=S.t[S.t.length-1];
  const X=t=>L+t/tm*(R-L),Y=v=>B-(v-lo)/(hi-lo)*(B-T);
  if(!kecil){g.fillStyle='#2f5d3a';g.font='800 '+Math.round(54*k)+'px "Bricolage Grotesque",sans-serif';g.textAlign='left';g.textBaseline='top';
    g.fillText('Debit air r(t) liter/menit · babak '+(r+1),60*k,36*k);
    g.textAlign='right';g.fillStyle='#b8321c';g.fillText('Awal: V0 = '+S.v0+' L',W-70*k,36*k);}
  g.strokeStyle='#cfdcc8';g.lineWidth=Math.max(1,3*k);g.font='700 '+Math.round((kecil?60:38)*k)+'px "Chakra Petch",sans-serif';g.fillStyle='#2a3a2a';
  for(let v=lo;v<=hi;v++){g.beginPath();g.moveTo(L,Y(v));g.lineTo(R,Y(v));g.stroke();g.textAlign='right';g.textBaseline='middle';g.fillText(String(v),L-14*k,Y(v));}
  for(let t=0;t<=tm;t++){g.beginPath();g.moveTo(X(t),T);g.lineTo(X(t),B);g.stroke();g.textAlign='center';g.textBaseline='top';g.fillText(String(t),X(t),B+12*k);}
  /* luas bertanda: masuk biru, keluar merah */
  for(const q of S.p){const [t0,t1]=q;
    for(let i=0;i<40;i++){const a=t0+(t1-t0)*i/40,b=t0+(t1-t0)*(i+1)/40,va=rDi({p:[q]},a),vb=rDi({p:[q]},b);
      g.fillStyle=(va+vb)/2>=0?'rgba(63,155,216,.45)':'rgba(229,57,43,.4)';g.beginPath();g.moveTo(X(a),Y(0));g.lineTo(X(a),Y(va));g.lineTo(X(b),Y(vb));g.lineTo(X(b),Y(0));g.closePath();g.fill();}}
  g.strokeStyle='#1f5f99';g.lineWidth=Math.max(2,9*k);
  for(const [t0,t1,a,b] of S.p){g.beginPath();g.moveTo(X(t0),Y(a));g.lineTo(X(t1),Y(b));g.stroke();}
  g.strokeStyle='#2a3a2a';g.lineWidth=Math.max(2,5*k);g.beginPath();g.moveTo(L,T);g.lineTo(L,B);g.moveTo(L,Y(0));g.lineTo(R,Y(0));g.stroke();
  /* waktu tangki */
  g.setLineDash([12*k,10*k]);g.strokeStyle='#b8321c';g.lineWidth=Math.max(1,5*k);
  S.t.forEach((t,i)=>{g.beginPath();g.moveTo(X(t),T);g.lineTo(X(t),B);g.stroke();
    if(!kecil){g.fillStyle='#b8321c';g.font='800 '+Math.round(38*k)+'px "Bricolage Grotesque",sans-serif';g.textAlign='center';g.textBaseline='bottom';g.fillText('tangki '+(i+1),X(t),T-6*k);}});
  g.setLineDash([]);
  if(!kecil){g.fillStyle='#2a3a2a';g.font='700 '+Math.round(36*k)+'px "Chakra Petch",sans-serif';g.textAlign='left';g.textBaseline='bottom';
    g.fillText('Isi tangki ke-n = volume pada saat garis merah ke-n: V0 + luas (biru menambah, merah mengurangi).',60*k,H-28*k);}
}

export function buatArena4(){
  const dunia=buatDunia(M4,TEMA_HUTAN),grup=dunia.grup;
  /* papan grafik di dinding batu berlumut */
  const cw=document.createElement('canvas');cw.width=2000;cw.height=950;
  const txp=new THREE.CanvasTexture(cw);txp.colorSpace=THREE.SRGBColorSpace;txp.anisotropy=4;
  {
    const dinding=new THREE.Mesh(new THREE.BoxGeometry(96,12,4),mat(0x6f7d63));dinding.position.set(0,5,-5);grup.add(dinding);
    const lumut=new THREE.Mesh(new THREE.BoxGeometry(98,1,6),mat(0x3f7a44));lumut.position.set(0,11.4,-5);grup.add(lumut);
    const bingkai=new THREE.Mesh(new THREE.BoxGeometry(21.4,10.6,.6),mat(0x4a3a24));bingkai.position.set(0,4.9,-2.7);grup.add(bingkai);
    const papan=new THREE.Mesh(new THREE.PlaneGeometry(20,9.5),dunia.daftarPapan(new THREE.MeshBasicMaterial({map:txp})));papan.position.set(0,4.85,-2.35);grup.add(papan);
  }
  /* tangki kaca: air naik sesuai volume, angka liter tertulis di pelat depan */
  const tangki=TANGKI.map((o,i)=>{
    const g=new THREE.Group();g.position.set(o.x,0,o.z);grup.add(g);
    const kaca=new THREE.Mesh(new THREE.CylinderGeometry(1.15,1.15,4.4,20,1,true),new THREE.MeshPhongMaterial({color:0xcfe9f5,transparent:true,opacity:.3,side:THREE.DoubleSide,depthWrite:false}));kaca.position.y=2.4;g.add(kaca);
    const alas=new THREE.Mesh(new THREE.CylinderGeometry(1.3,1.4,.3,20),mat(0x5a4a3a));alas.position.y=.15;g.add(alas);
    const air=new THREE.Mesh(new THREE.CylinderGeometry(1.05,1.05,1,20),new THREE.MeshPhongMaterial({color:0x3f9bd8,transparent:true,opacity:.85,shininess:80}));air.position.y=.3;g.add(air);
    /* garis skala tiap 5 liter */
    for(let v=5;v<=VMAX;v+=5){const c=new THREE.Mesh(new THREE.TorusGeometry(1.16,.03,4,20),mat(0x2a3a2a));c.rotation.x=Math.PI/2;c.position.y=.3+4.2*v/VMAX;g.add(c);}
    const pl=new THREE.Mesh(new THREE.CircleGeometry(o.r,24),new THREE.MeshBasicMaterial({color:0xcfe9f5,transparent:true,opacity:.8}));pl.rotation.x=-Math.PI/2;pl.position.set(o.px,.04,o.pz);grup.add(pl);
    const c=document.createElement('canvas');c.width=256;c.height=128;const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;
    const lab=new THREE.Mesh(new THREE.PlaneGeometry(2.8,1.4),new THREE.MeshBasicMaterial({map:tx,transparent:true,depthWrite:false,toneMapped:false}));lab.rotation.x=-Math.PI/2;lab.position.set(o.px,.07,o.pz);lab.renderOrder=2;grup.add(lab);
    return {air,pl,c,tx,teks:''};
  });
  function tulis(o,t1,t2,sorot){
    const k=t1+'|'+t2+'|'+sorot;if(o.teks===k)return;o.teks=k;
    const g=o.c.getContext('2d');g.clearRect(0,0,256,128);g.textAlign='center';g.textBaseline='middle';
    g.font='800 44px "Bricolage Grotesque",sans-serif';g.lineWidth=10;g.lineJoin='round';g.strokeStyle='#ffffff';g.fillStyle='#1c2230';
    g.strokeText(t1,128,36);g.fillText(t1,128,36);g.font='800 54px "Bricolage Grotesque",sans-serif';g.fillStyle=sorot?'#b8321c':'#1f5f99';g.strokeText(t2,128,92);g.fillText(t2,128,92);o.tx.needsUpdate=true;
  }
  /* sumber air di kamp */
  {
    const [g0,g1,g2]=dunia.gudangs.map(o=>o.g);
    const kolam=new THREE.Mesh(new THREE.CircleGeometry(1.5,20),new THREE.MeshPhongMaterial({color:0x3f9bd8,shininess:90}));kolam.rotation.x=-Math.PI/2;kolam.position.set(0,.06,-.4);g0.add(kolam);
    for(let i=0;i<3;i++){const e=new THREE.Mesh(new THREE.CylinderGeometry(.3,.24,.45,10),mat(0x9aa3ad));e.position.set(-1.6+i*.5,.23,1);g0.add(e);}
    for(let i=0;i<3;i++){const d=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,1.1,12),mat(0x2f7fc1));d.position.set((i-1)*1.2,.55,-.3);g1.add(d);}
    const terjun=new THREE.Mesh(new THREE.PlaneGeometry(3,5),new THREE.MeshBasicMaterial({color:0xcfeaff,transparent:true,opacity:.75,side:THREE.DoubleSide}));terjun.position.set(0,3,-3.4);g1.add(terjun);
    const sumur=new THREE.Mesh(new THREE.CylinderGeometry(1.1,1.2,1,14,1,true),mat(0x8d8a84));sumur.position.set(0,.5,-.3);g2.add(sumur);
    const atap=new THREE.Mesh(new THREE.ConeGeometry(1.6,1,4),mat(0x7a4f2a));atap.position.set(0,2.6,-.3);atap.rotation.y=Math.PI/4;g2.add(atap);
    for(let i=0;i<2;i++){const j=new THREE.Mesh(new THREE.BoxGeometry(.5,.7,.35),mat(0xe0a200));j.position.set(1.6,.35,.4*i-.2);g2.add(j);}
    [['1 L',g0],['5 L',g1],['2 L',g2]].forEach(([t,g])=>{const l=tulisanLantai(t,3,'#ffffff');l.position.set(0,.07,2.3);g.add(l);});
  }
  /* wadah yang dibawa */
  const bawa=new THREE.InstancedMesh(new THREE.CylinderGeometry(.36,.3,.5,10),new THREE.MeshLambertMaterial({color:0x2f7fc1,flatShading:true}),64);bawa.frustumCulled=false;bawa.count=0;grup.add(bawa);
  const M=new THREE.Matrix4(),Q=new THREE.Quaternion(),P=new THREE.Vector3(),S1=new THREE.Vector3(1,1,1);
  let rNow=0;
  return {
    grup,dunia,
    setBabak(r){rNow=r;gambarDebit(cw,r);txp.needsUpdate=true;},
    setSlot(s,sorot){
      const S=soal4(rNow);
      tangki.forEach((o,i)=>{const v=s&&s[i]!=null?s[i]:0;o.air.scale.y=Math.max(.001,4.2*v/VMAX);o.air.position.y=.3+2.1*v/VMAX;o.air.visible=v>0;
        tulis(o,'t = '+(S.t[i]??''),v+' L',sorot===i);o.pl.material.color.setHex(sorot===i?0xffd96b:0xcfe9f5);});
    },
    setBawa(items){let k=0;for(const it of items)for(let j=0;j<it.n&&k<64;j++){P.set(it.x,it.y+j*.55,it.z);M.compose(P,Q,S1);bawa.setMatrixAt(k++,M);}bawa.count=k;bawa.instanceMatrix.needsUpdate=true;},
    setMedan:dunia.setMedan,animMedan:dunia.animMedan,setGerbang:dunia.setGerbang,setKoin:dunia.setKoin,setDetail:dunia.setDetail,setUltra:dunia.setUltra,padAnim:dunia.padAnim
  };
}
