/* Karakter kustom, dibangun dari bentuk dasar lalu digabung jadi satu mesh berwarna per titik.
   Satu karakter = satu panggilan gambar. Konfigurasi dikirim lewat jaringan sebagai kode 6 digit. */
import * as THREE from './vendor/three.min.js';

export const TIPE=['Orang','Kucing','Anjing','Kelinci','Beruang','Bebek'];
export const WARNA=['#f08a3c','#9a6a46','#9ba1a8','#f6f1e7','#3a3a44','#f2c94c','#f29ab8','#6fb7e9'];
export const KULIT=['#f6d3b0','#e2b58a','#b98259','#7c4f32'];
export const TOPI=['Tanpa topi','Topi bisbol','Caping','Topi penyihir','Helm proyek'];
export const KACAMATA=['Tanpa kacamata','Bulat','Kotak','Hitam'];
export const AKS=['Tanpa aksesori','Syal','Dasi kupu-kupu','Ransel'];
const TOPY=[2.62,2.88,3.12,3.75,2.98];
const MAKS=[TIPE.length,WARNA.length,TOPI.length,KACAMATA.length,AKS.length,KULIT.length];
const KS=['t','c','h','g','a','k'];

/* kode dari jaringan tidak dipercaya: setiap digit dibatasi ke rentang yang sah */
export function parseAv(s){
  const a={t:0,c:0,h:0,g:0,a:0,k:0};
  if(typeof s==='object'&&s)s=kodeAv(s);
  if(typeof s==='string'&&/^[0-9]{6}$/.test(s))KS.forEach((k,i)=>{const v=+s[i];a[k]=v<MAKS[i]?v:0;});
  return a;
}
export function kodeAv(a){return KS.map(k=>String(Math.max(0,Math.min(9,a[k]|0)))).join('');}
export function acakAv(){const r=n=>Math.floor(Math.random()*n);return {t:r(6),c:r(8),h:r(5),g:r(4),a:r(4),k:r(4)};}
export function topY(av){return Math.max(TOPY[av.h],av.t===3?3.5:0);}

/* ---------- pembangun geometri ---------- */
const GB=new THREE.BoxGeometry(1,1,1),GS=new THREE.SphereGeometry(1,10,8),GC=new THREE.CylinderGeometry(1,1,1,10),
  GK=new THREE.ConeGeometry(1,1,8),GT=new THREE.TorusGeometry(1,.2,6,14);
const M4=new THREE.Matrix4(),QT=new THREE.Quaternion(),EU=new THREE.Euler(),V3=new THREE.Vector3(),S3=new THREE.Vector3();
function part(L,geo,warna,x,y,z,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0){
  const g=geo.index?geo.toNonIndexed():geo.clone();
  EU.set(rx,ry,rz);QT.setFromEuler(EU);V3.set(x,y,z);S3.set(sx,sy,sz);M4.compose(V3,QT,S3);g.applyMatrix4(M4);
  const c=new THREE.Color(warna),n=g.attributes.position.count,a=new Float32Array(n*3);
  for(let i=0;i<n;i++){a[i*3]=c.r;a[i*3+1]=c.g;a[i*3+2]=c.b;}
  g.setAttribute('color',new THREE.BufferAttribute(a,3));g.deleteAttribute('uv');L.push(g);
}
function gabung(L){
  let n=0;for(const g of L)n+=g.attributes.position.count;
  const P=new Float32Array(n*3),N=new Float32Array(n*3),C=new Float32Array(n*3);let o=0;
  for(const g of L){P.set(g.attributes.position.array,o*3);N.set(g.attributes.normal.array,o*3);C.set(g.attributes.color.array,o*3);o+=g.attributes.position.count;g.dispose();}
  const r=new THREE.BufferGeometry();
  r.setAttribute('position',new THREE.BufferAttribute(P,3));r.setAttribute('normal',new THREE.BufferAttribute(N,3));r.setAttribute('color',new THREE.BufferAttribute(C,3));
  r.computeBoundingSphere();return r;
}
const PUTIH=new THREE.Color(1,1,1);
function mix(hex,k){const c=new THREE.Color(hex);if(k>=0)c.lerp(PUTIH,k);else c.multiplyScalar(1+k);return c;}

function bangun(av){
  const L=[],m=WARNA[av.c],t=av.t,terang=mix(m,.55),gelap=mix(m,-.4);
  const kepala=t===0?KULIT[av.k]:m,kaki=t===0?'#34425e':(t===5?'#f08a1e':m),gz=.56;
  /* kaki, badan, kepala */
  part(L,GB,kaki,-.3,.3,0,.34,.6,.38);part(L,GB,kaki,.3,.3,0,.34,.6,.38);
  part(L,GC,m,0,1.15,0,.58,1.1,.46);
  part(L,GS,kepala,0,2.0,0,.56,.52,.54);
  const ey=t===5?2.1:2.04;
  part(L,GB,'#1b1b22',-.2,ey,.53,.1,.14,.08);part(L,GB,'#1b1b22',.2,ey,.53,.1,.14,.08);
  /* lengan atau sayap */
  if(t===5){part(L,GB,gelap,-.72,1.3,0,.14,.55,.55,0,0,.15);part(L,GB,gelap,.72,1.3,0,.14,.55,.55,0,0,-.15);}
  else{part(L,GB,m,-.74,1.2,0,.22,.75,.26,0,0,.12);part(L,GB,m,.74,1.2,0,.22,.75,.26,0,0,-.12);}
  /* ciri tiap tipe */
  if(t===0){
    part(L,GB,KULIT[av.k],-.77,.78,0,.2,.2,.24);part(L,GB,KULIT[av.k],.77,.78,0,.2,.2,.24);
    part(L,GS,'#3b2a20',0,2.28,-.02,.58,.34,.56);
  }else if(t===1){
    part(L,GK,m,-.34,2.55,0,.2,.42,.2,0,0,.28);part(L,GK,m,.34,2.55,0,.2,.42,.2,0,0,-.28);
    part(L,GB,'#f08aa0',0,1.95,.56,.12,.09,.06);
    part(L,GC,m,0,.95,-.68,.09,.9,.09,-.7,0,0);
  }else if(t===2){
    part(L,GB,gelap,-.56,2.08,0,.2,.55,.3);part(L,GB,gelap,.56,2.08,0,.2,.55,.3);
    part(L,GB,terang,0,1.86,.5,.4,.28,.34);part(L,GB,'#222',0,1.95,.68,.16,.11,.1);
    part(L,GK,m,0,1.05,-.66,.11,.55,.11,-.9,0,0);
  }else if(t===3){
    part(L,GB,m,-.2,3.0,0,.2,.9,.12,0,0,.1);part(L,GB,m,.2,3.0,0,.2,.9,.12,0,0,-.1);
    part(L,GB,'#f6b8c8',-.2,3.0,.065,.1,.65,.04,0,0,.1);part(L,GB,'#f6b8c8',.2,3.0,.065,.1,.65,.04,0,0,-.1);
    part(L,GB,'#f08aa0',0,1.96,.56,.12,.09,.06);part(L,GS,'#ffffff',0,.95,-.62,.2,.2,.2);
  }else if(t===4){
    part(L,GS,gelap,-.42,2.46,0,.2,.2,.2);part(L,GS,gelap,.42,2.46,0,.2,.2,.2);
    part(L,GS,terang,0,1.9,.5,.28,.22,.2);part(L,GB,'#222',0,1.97,.7,.14,.1,.08);
    part(L,GS,m,0,1.0,-.62,.16,.16,.16);
  }else{
    part(L,GB,'#f08a1e',0,1.9,.62,.46,.15,.34);
    part(L,GK,m,0,1.35,-.66,.2,.4,.2,-1.3,0,0);
  }
  /* topi */
  if(av.h===1){part(L,GS,'#d93b3b',0,2.42,0,.58,.34,.57);part(L,GB,'#a82a2a',0,2.36,.55,.62,.07,.42);}
  else if(av.h===2){part(L,GK,'#d8b36a',0,2.78,0,.98,.5,.98);}
  else if(av.h===3){part(L,GC,'#5b3fa0',0,2.5,0,.85,.07,.85);part(L,GK,'#5b3fa0',0,3.1,0,.5,1.15,.5);}
  else if(av.h===4){part(L,GS,'#f2c316',0,2.4,0,.6,.5,.6);part(L,GB,'#d6a90a',0,2.32,.52,.5,.06,.26);}
  /* kacamata */
  const gy=2.06;
  if(av.g===1){part(L,GT,'#20202a',-.21,gy,gz,.17,.17,.17);part(L,GT,'#20202a',.21,gy,gz,.17,.17,.17);part(L,GB,'#20202a',0,gy+.03,gz,.1,.04,.04);}
  else if(av.g===2){part(L,GB,'#3a6fd1',-.21,gy,gz,.3,.22,.05);part(L,GB,'#3a6fd1',.21,gy,gz,.3,.22,.05);part(L,GB,'#20202a',0,gy+.05,gz,.14,.04,.05);}
  else if(av.g===3){
    part(L,GB,'#111',-.21,gy,gz,.34,.2,.07);part(L,GB,'#111',.21,gy,gz,.34,.2,.07);part(L,GB,'#111',0,gy+.04,gz,.12,.05,.06);
    part(L,GB,'#111',-.42,gy,gz-.17,.05,.05,.32);part(L,GB,'#111',.42,gy,gz-.17,.05,.05,.32);
  }
  /* aksesori */
  if(av.a===1){part(L,GC,'#d94a4a',0,1.66,0,.64,.2,.52);part(L,GB,'#d94a4a',.28,1.35,.46,.2,.62,.1);}
  else if(av.a===2){
    part(L,GK,'#d94a4a',-.17,1.58,.5,.16,.3,.16,0,0,-Math.PI/2);part(L,GK,'#d94a4a',.17,1.58,.5,.16,.3,.16,0,0,Math.PI/2);
    part(L,GS,'#b23030',0,1.58,.5,.08,.08,.08);
  }else if(av.a===3){part(L,GB,'#3d7bd8',0,1.25,-.62,.74,.9,.34);part(L,GB,'#2f62b0',0,1.0,-.82,.5,.3,.1);}
  return gabung(L);
}

const MAT=new THREE.MeshLambertMaterial({vertexColors:true,flatShading:true});
const cache=new Map();
export function meshAvatar(av){
  const kode=kodeAv(av);let g=cache.get(kode);
  if(!g){g=bangun(av);cache.set(kode,g);}
  return new THREE.Mesh(g,MAT);
}
