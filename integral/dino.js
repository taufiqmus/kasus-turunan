/* Model T-Rex low-poly (prototipe, belum dipasang di game). Dibangun dari bentuk dasar bergaya sama dengan avatar.js,
   lalu dipanggang per tulang menjadi satu mesh berwarna per titik: sekitar 13 draw call, tanpa tekstur atau aset unduhan.
   Menghadap +z, kaki menapak y=0, panjang sekitar 11 satuan dan tinggi kepala sekitar 6 (avatar orang sekitar 2,6).
   meshDino({skala}) mengembalikan {grup, anim(t,{v,raung}), tinggi}. v = kecepatan langkah (0 diam), raung 0..1. */
import * as THREE from './vendor/three.min.js';

const BAHAN=new THREE.MeshLambertMaterial({vertexColors:true,flatShading:true});
const WARNA={kulit:0x6f8f3c,gelap:0x4a6428,perut:0xdcd39c,gigi:0xf4efdc,mata:0xffc83d,pupil:0x1c2230,cakar:0xe6dcc0,mulut:0xb2554a,bercak:0x3f5522};
const ELIPS=new THREE.IcosahedronGeometry(1,1),KERUCUT=new THREE.ConeGeometry(1,1,5),KOTAK=new THREE.BoxGeometry(1,1,1);
const E=new THREE.Euler(),Q=new THREE.Quaternion(),V=new THREE.Vector3(),S=new THREE.Vector3();
/* satu bagian: geometri dasar, warna, posisi, rotasi (Euler), skala */
const bagian=(geo,warna,p,r,s)=>({geo,warna,m:new THREE.Matrix4().compose(V.set(...p),Q.setFromEuler(E.set(...(r||[0,0,0]))),S.set(...s))});
const elips=(w,p,s,r)=>bagian(ELIPS,w,p,r,s);
/* kerucut menunjuk ke bawah (taring, cakar) atau ke belakang/depan lewat rotasi */
const taring=(w,p,s,r)=>bagian(KERUCUT,w,p,r||[Math.PI,0,0],s);
function gabung(daftar){
  const pos=[],col=[],c=new THREE.Color();
  for(const b of daftar){
    const g=b.geo.index?b.geo.toNonIndexed():b.geo.clone();g.applyMatrix4(b.m);c.set(b.warna);
    const a=g.attributes.position.array;for(let i=0;i<a.length;i+=3){pos.push(a[i],a[i+1],a[i+2]);col.push(c.r,c.g,c.b);}
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
  g.computeVertexNormals();const m=new THREE.Mesh(g,BAHAN);m.castShadow=true;m.receiveShadow=true;return m;
}
const tulang=(x,y,z)=>{const g=new THREE.Group();g.position.set(x,y,z);return g;};

export function meshDino(opsi={}){
  const W=WARNA,grup=new THREE.Group(),akar=new THREE.Group();grup.add(akar);
  /* ---------- badan: pinggul besar, perut terang, dada, leher, lengan mungil, bercak punggung ---------- */
  const badan=tulang(0,0,0);akar.add(badan);
  {
    const L=[
      elips(W.kulit,[0,4.1,-.2],[1.45,1.5,2.4]),            // pinggul dan batang tubuh
      elips(W.kulit,[0,4.35,1.9],[1.15,1.25,1.5]),          // dada
      elips(W.perut,[0,3.55,.4],[1.22,1.0,2.4]),            // perut
      elips(W.perut,[0,4.0,2.2],[.95,.8,1.1]),              // dada bawah
      elips(W.kulit,[0,5.25,3.2],[.8,.85,1.25],[-.85,0,0]), // leher tebal miring ke atas
      elips(W.perut,[0,5.0,3.3],[.55,.5,1.1],[-.85,0,0]),   // tenggorokan terang
    ];
    for(let i=0;i<5;i++){const z=-1.7+i*.8,y=5.5-Math.max(0,z-.2)*.12;L.push(elips(W.bercak,[(i%2?.4:-.35),y-.12,z],[.42,.16,.34]));}   // bercak menempel di punggung
    for(const sx of [-1,1]){  // lengan kecil dengan dua cakar
      L.push(elips(W.kulit,[sx*.95,4.0,2.75],[.17,.17,.5],[.9,0,sx*.2]));
      L.push(elips(W.kulit,[sx*1.0,3.55,3.2],[.13,.13,.4],[1.5,0,sx*.1]));
      for(const dx of [-.07,.07])L.push(taring(W.cakar,[sx*1.0+dx,3.45,3.65],[.05,.28,.05],[Math.PI/2+.4,0,0]));
    }
    badan.add(gabung(L));
  }
  /* ---------- kepala dengan rahang bawah yang bisa terbuka ---------- */
  const kepala=tulang(0,6.25,4.15);badan.add(kepala);
  {
    const L=[
      elips(W.kulit,[0,0,-.15],[.78,.72,1.0]),               // tengkorak
      elips(W.kulit,[0,-.12,1.15],[.52,.38,.95]),            // moncong
      elips(W.kulit,[0,.02,.0],[.9,.5,.55],[0,0,0]),         // pipi lebar
      elips(W.gelap,[-.43,.36,.3],[.2,.12,.36],[.15,.25,.3]),// alis kiri
      elips(W.gelap,[.43,.36,.3],[.2,.12,.36],[.15,-.25,-.3]),
      elips(W.mata,[-.5,.2,.35],[.14,.14,.14]),elips(W.mata,[.5,.2,.35],[.14,.14,.14]),
      elips(W.pupil,[-.58,.2,.38],[.07,.1,.07]),elips(W.pupil,[.58,.2,.38],[.07,.1,.07]),
      elips(W.pupil,[-.14,.1,1.9],[.07,.05,.09]),elips(W.pupil,[.14,.1,1.9],[.07,.05,.09]),
    ];
    for(let i=0;i<7;i++){const z=.35+i*.24;for(const sx of [-1,1])L.push(taring(W.gigi,[sx*(.3-i*.01),-.46,z],[.07,.3-(i>4?.06:0),.07]));}
    kepala.add(gabung(L));
    kepala.rotation.x=.14;kepala.scale.setScalar(1.25);   // kepala besar khas T-Rex
  }
  const rahang=tulang(0,-.34,-.05);kepala.add(rahang);
  {
    const L=[elips(W.kulit,[0,-.05,.95],[.4,.17,.95]),elips(W.mulut,[0,.06,.9],[.33,.07,.85])];
    for(let i=0;i<6;i++){const z=.55+i*.25;for(const sx of [-1,1])L.push(bagian(KERUCUT,W.gigi,[sx*.26,.12,z],[0,0,0],[.06,.2,.06]));}
    rahang.add(gabung(L));
  }
  /* ---------- ekor: enam ruas menyempit, tiap ruas berputar sedikit untuk menyapu ---------- */
  const ekor=[];
  {
    let induk=badan,x=0;const pangkal=tulang(0,4.0,-2.3);badan.add(pangkal);induk=pangkal;
    for(let i=0;i<6;i++){
      const r=1.0-i*.15,pjg=1.5-i*.1,ruas=tulang(0,0,i?-pjg*.95:0);
      ruas.add(gabung([elips(W.kulit,[0,0,-pjg*.5],[r*1.0,r*.95,pjg*.62]),elips(W.perut,[0,-r*.45,-pjg*.5],[r*.62,r*.45,pjg*.5]),elips(W.bercak,[0,r*.7,-pjg*.5],[r*.3,.12,pjg*.3])]));
      induk.add(ruas);ekor.push(ruas);induk=ruas;ruas.rotation.x=i?.02:-.1;
    }
  }
  /* ---------- kaki: paha (pinggul), betis (lutut), telapak dengan tiga cakar ---------- */
  const kaki=[];
  for(const sx of [-1,1]){
    const pinggul=tulang(sx*1.05,3.5,-.2);akar.add(pinggul);
    pinggul.add(gabung([elips(W.kulit,[0,-.55,.1],[.7,1.15,.85],[.15,0,0]),elips(W.perut,[sx*-.2,-.7,.2],[.4,.85,.6],[.15,0,0])]));
    const lutut=tulang(0,-1.35,.4);pinggul.add(lutut);
    lutut.add(gabung([elips(W.kulit,[0,-.6,-.45],[.4,.95,.4],[.55,0,0])]));
    const pergelangan=tulang(0,-1.3,-.9);lutut.add(pergelangan);
    {
      const L=[elips(W.kulit,[0,-.1,.1],[.38,.3,.45]),elips(W.kulit,[0,-.3,.55],[.5,.2,.9])];
      for(const dx of [-.3,0,.3])L.push(taring(W.cakar,[dx,-.3,1.5],[.12,.5,.12],[-Math.PI/2,0,0]));
      L.push(taring(W.cakar,[0,-.15,-.4],[.1,.35,.1],[Math.PI/2+.3,0,0]));
      pergelangan.add(gabung(L));
    }
    kaki.push({pinggul,lutut,pergelangan,sx});
  }
  /* kaki menapak y=0 pada pose diam: ukur batas lalu geser */
  akar.updateMatrixWorld(true);const kotak=new THREE.Box3().setFromObject(grup);akar.position.y=-kotak.min.y;
  const tinggi=kotak.max.y-kotak.min.y;
  if(opsi.skala)grup.scale.setScalar(opsi.skala);

  /* t dalam detik. v = kecepatan langkah (0 = berdiri), raung 0..1 (mengaum: kepala terangkat, rahang terbuka, badan condong) */
  function anim(t,o={}){
    const v=o.v==null?1:o.v,raung=o.raung||0,f=t*2.6*v,ay=Math.abs(Math.sin(f));
    kaki.forEach((k,i)=>{
      const fase=f+(i?Math.PI:0),s=Math.sin(fase);
      k.pinggul.rotation.x=s*.5*Math.min(1,v);
      k.lutut.rotation.x=(.25+Math.max(0,-Math.cos(fase))*.7)*Math.min(1,v)+.1;
      k.pergelangan.rotation.x=-k.pinggul.rotation.x*.5-k.lutut.rotation.x*.6;
    });
    badan.position.y=ay*.14*Math.min(1,v);badan.rotation.x=-raung*.14+Math.sin(f*2)*.012*v;
    ekor.forEach((r,i)=>{r.rotation.y=Math.sin(f*.5-i*.55)*(.1+i*.035)*(.4+Math.min(1,v)*.6)+Math.sin(t*1.3-i*.4)*.03;});
    kepala.rotation.x=.14-raung*.5+Math.sin(f*2+.5)*.03*v;kepala.rotation.y=Math.sin(f*.5)*.06*v;
    rahang.rotation.x=raung*.62+(raung?Math.sin(t*28)*.04:0);
  }
  anim(0,{v:0});
  return {grup,anim,tinggi};
}
