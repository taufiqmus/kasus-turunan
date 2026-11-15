/* Tampilan 3D umum untuk dunia pos: tanah, air, jurang, jembatan, tumbuhan, gunung latar, kamp, pad, tuas,
   gerbang, koin, dan semua rintangan. Isi khusus tiap pos (bendungan, kuil, kolom, altar) ditambah oleh modul pos.
   W = dunia dari medan.js, T = tema warna dan tumbuhan. */
import * as THREE from './vendor/three.min.js';
import {ss,dalam,derau,PAL_L,PAL_Y,PAL_A,BOLA_R,RINT_MAKS,DURI_MAKS} from './medan.js?v=31';

export const mat=c=>new THREE.MeshLambertMaterial({color:c,flatShading:true});
/* tumbuhan dan batu yang menutupi pemain dari kamera dibuat tembus pandang berbintik, supaya karakter selalu terlihat.
   uTembus = posisi pemain di ruang kamera (z positif = di depan kamera). */
export const uTembus={value:new THREE.Vector3(0,0,-1)};
function tembus(m){
  m.onBeforeCompile=sh=>{
    sh.uniforms.uTembus=uTembus;
    sh.fragmentShader='uniform vec3 uTembus;\n'+sh.fragmentShader.replace('#include <clipping_planes_fragment>',`#include <clipping_planes_fragment>
  if(uTembus.z>0.&&vViewPosition.z<uTembus.z-.8){
    float dT=length(vViewPosition.xy/vViewPosition.z-uTembus.xy/uTembus.z);
    if(dT<.17||(dT<.3&&mod(floor(gl_FragCoord.x)+floor(gl_FragCoord.y),2.)<.5))discard;
  }`);
  };
  m.customProgramCacheKey=()=>'tembus';return m;
}
export function tulisanLantai(teks,w,warnaGaris,opsi={}){
  const c=document.createElement('canvas');c.width=256;c.height=128;const g=c.getContext('2d');
  g.textAlign='center';g.textBaseline='middle';let fs=opsi.size||84;g.font='800 '+fs+'px "Bricolage Grotesque",sans-serif';
  while(g.measureText(teks).width>228&&fs>16){fs-=4;g.font='800 '+fs+'px "Bricolage Grotesque",sans-serif';}
  g.lineWidth=12;g.lineJoin='round';
  g.strokeStyle=warnaGaris;g.strokeText(teks,128,68);g.fillStyle=opsi.fg||'#1c2230';g.fillText(teks,128,68);
  const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;
  const lp=new THREE.Mesh(new THREE.PlaneGeometry(w,w/2),new THREE.MeshBasicMaterial({map:tx,transparent:true,depthWrite:false,toneMapped:false}));
  lp.rotation.x=-Math.PI/2;lp.position.y=.07;lp.renderOrder=2;return lp;
}

/* ---------- tema ---------- */
export const TEMA_HIJAU={
  tanah(W,x,z,d,n,C){
    if(z<-.6)C.set(0xcfc8b8);
    else if(dalam(W.AIR,x,z)>0)C.set(0x7d6f4e);
    else if(dalam(W.JURANG,x,z)>0)C.set(0x57514a);
    else if(dalam(W.PLAZA,x,z)>-.2)C.set(0xf2e3c2);
    else if(d<-.25)C.set(Math.abs(x)<19&&z>12?0xcdb38c:0xdcc096);
    else if(W.tebing(x,z)>.3)C.set(0x8e8b84);
    else if(dalam(W.AIR,x,z)>-2.4)C.set(0xe6d7a3);
    else if(x<-13)C.set(0x4d8c49);
    else if(x>13)C.set(0x86c26a);
    else C.set(W.tinggi(x,z)>1.2&&n>.25?0x9a9a8c:0x93b56b);
  },
  flora:'hutan',kamp:[0x2e9e5b,0xe08a2b,0x2f7fc1],latar:[0x7f93a8,0x8fa3b5,0x6f8499],
  batu:[0x8d8a84,0x9aa09a,0x7c7f86],batuJalan:0xb9b4a8
};
export const TEMA_GURUN={
  tanah(W,x,z,d,n,C){
    if(z<-.6)C.set(0xd8b98a);
    else if(dalam(W.AIR,x,z)>0)C.set(0x5f7d6a);
    else if(dalam(W.JURANG,x,z)>0)C.set(0x6b3f2c);
    else if(dalam(W.PLAZA,x,z)>-.2)C.set(0xe9d3a6);
    else if(d<-.25)C.set(0xd9b47a);
    else if(W.tebing(x,z)>.3)C.set(n>.2?0xb3653f:0xa45a38);
    else if(dalam(W.AIR,x,z)>-2.6)C.set(0x8fae62);
    else if(x<-13)C.set(n>.1?0xcfb27a:0xbfa46c);
    else if(x>13)C.set(n>.1?0xd49a6a:0xc98a5c);
    else C.set(n>.25?0xe3c48e:0xeccf98);
  },
  flora:'gurun',kamp:[0x2f9e8f,0x8b5cc7,0xd2603a],latar:[0xc07a52,0xd08c60,0xa86a48],
  batu:[0xb07a52,0xc48d62,0x9c6a48],batuJalan:0xc9a576
};

export const TEMA_SALJU={
  tanah(W,x,z,d,n,C){
    if(z<-.6)C.set(0xb9c6cf);
    else if(dalam(W.AIR,x,z)>0)C.set(0x5d7f96);
    else if(dalam(W.PLAZA,x,z)>-.2)C.set(0xdfe8ee);
    else if(d<-.25)C.set(0xc9d6df);
    else if(W.tebing(x,z)>.3)C.set(n>.2?0x8e9aa6:0x7d8894);
    else if(dalam(W.AIR,x,z)>-2.2)C.set(0xd8e6ef);
    else C.set(n>.25?0xf4f8fb:0xe9f1f6);
  },
  flora:'hutan',kamp:[0xd2603a,0x2f7fc1,0x7a4bc4],latar:[0xc9d6e2,0xb3c3d1,0xdfe7ee],
  batu:[0x8e9aa6,0x9fabb6,0x7c8894],batuJalan:0xe6f2f8,
  warnaA:[0x2f5d4a,0x2a5444,0x36695a,0x2c584a],warnaB:[0xf4f8fb,0xeaf2f7,0xf4f8fb,0xe2ecf3],warnaMahkota:[0xeef4f8,0xe2ecf3,0xf6fafc,0xdde8f0],semak:0xd5e2ea,
  air:0x4f88b0
};
export const TEMA_HUTAN={
  tanah(W,x,z,d,n,C){
    if(z<-.6)C.set(0x8d9a7e);
    else if(dalam(W.AIR,x,z)>0)C.set(0x6b5a3e);
    else if(dalam(W.PLAZA,x,z)>-.2)C.set(0xd9caa4);
    else if(d<-.25)C.set(0xb89a6a);
    else if(W.tebing(x,z)>.3)C.set(n>.2?0x6f7d63:0x5f6d55);
    else if(dalam(W.AIR,x,z)>-2.4)C.set(0x6f9a4c);
    else C.set(n>.25?0x3f7a3c:(n<-.3?0x4f8a44:0x467f40));
  },
  flora:'hutan',kamp:[0x2f7fc1,0x17a2a2,0xe0a200],latar:[0x5f7d63,0x6f8d6f,0x4f6d55],
  batu:[0x7c8a7c,0x8d9a8a,0x6d7a6d],batuJalan:0xa9a08a,
  warnaA:[0x1f5a32,0x24633a,0x2a6d40,0x1d5530],warnaB:[0x2a7d44,0x2f8a4c,0x33914f,0x2a7d44],semak:0x3f7a3c,air:0x3f8fb8,rakit:0x8a5a2b
};
export const TEMA_PANTAI={
  tanah(W,x,z,d,n,C){
    if(z<-.6)C.set(0xe8d8a8);
    else if(dalam(W.AIR,x,z)>0)C.set(0xc9b27a);
    else if(dalam(W.PLAZA,x,z)>-.2)C.set(0xf3e6c4);
    else if(d<-.25)C.set(0xead7a2);
    else if(W.tebing(x,z)>.3)C.set(n>.2?0x9a8a6a:0x8a7a5a);
    else if(z>W.PANTAI_Z)C.set(n>.1?0xf3e3b0:0xeedca6);
    else C.set(n>.25?0x8cc96a:0x7fbe5f);
  },
  flora:'gurun',tanpaKaktus:true,kamp:[0xe5392b,0x2f7fc1,0xe0a200],latar:[0x8fb9d3,0x9fc7de,0x7fa9c3],
  batu:[0xb9a88a,0xa89878,0xc9b89a],batuJalan:0xd9c9a0,air:0x2fa6c9,rakit:0xb27a3c
};
export const TEMA_GUNUNG={
  tanah(W,x,z,d,n,C){
    const h=W.tinggi(x,z);
    if(z<-.6)C.set(0x9aa0a6);
    else if(dalam(W.PLAZA,x,z)>-.2)C.set(0xd9d2c4);
    else if(d<-.25)C.set(h>9?0xd8dde2:0xb8a98a);
    else if(W.tebing(x,z)>.3)C.set(n>.2?0x7a7f86:0x6a6f76);
    else if(h>11)C.set(n>.1?0xf4f8fb:0xe6edf2);
    else if(h>6)C.set(n>.2?0x8e9a8a:0x7d8a7a);
    else C.set(n>.25?0x7fae5c:0x6f9e50);
  },
  flora:'hutan',kamp:[0xe5392b,0x2f7fc1,0x7a4bc4],latar:[0x8e97a2,0x9fa8b2,0x7d8692],
  batu:[0x7a7f86,0x8a8f96,0x6a6f76],batuJalan:0xa9a39a,
  warnaA:[0x2f5d4a,0x2a5444,0x36695a,0x2c584a],warnaB:[0x3a6d55,0xe6edf2,0x3a6d55,0xf4f8fb]
};
export function buatDunia(W,T){
  const grup=new THREE.Group();grup.visible=false;
  const Y=(x,z)=>W.tinggi(x,z);
  const D=W.DUNIA,M=new THREE.Matrix4(),Q=new THREE.Quaternion(),P=new THREE.Vector3(),S=new THREE.Vector3();
  /* ---------- tanah ---------- */
  {
    const st=.8,nx=Math.ceil((D.x1-D.x0)/st),nz=Math.ceil((D.z1-D.z0)/st);
    const pos=new Float32Array((nx+1)*(nz+1)*3),col=new Float32Array((nx+1)*(nz+1)*3),idx=[],C=new THREE.Color();
    for(let j=0,k=0;j<=nz;j++)for(let i=0;i<=nx;i++,k+=3){
      const x=D.x0+i*st,z=D.z0+j*st,n=derau(x*1.7,z*1.7);
      pos[k]=x;pos[k+1]=W.tinggiTanah(x,z);pos[k+2]=z;T.tanah(W,x,z,W.jarakJalan(x,z),n,C);C.multiplyScalar(.94+.06*n);col[k]=C.r;col[k+1]=C.g;col[k+2]=C.b;
    }
    for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const a=j*(nx+1)+i,b=a+1,c=a+nx+1,d=c+1;idx.push(a,c,b,b,c,d);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));
    g.setIndex(idx);g.computeVertexNormals();
    const tanah=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true,flatShading:true}));tanah.userData.tanah=true;grup.add(tanah);
  }
  /* ---------- kamp: alas, cincin, tenda, bendera. Isi kamp diisi modul pos lewat gudangs[i].g ---------- */
  const gudangs=[];
  W.KAMP.forEach((d,di)=>{
    const g=new THREE.Group();g.position.set(d.x,Y(d.x,d.z),d.z);grup.add(g);
    const al=new THREE.Mesh(new THREE.CircleGeometry(d.r,32),new THREE.MeshBasicMaterial({color:0xf3e2bd,transparent:true,opacity:.55,depthWrite:false}));
    al.rotation.x=-Math.PI/2;al.position.y=.03;g.add(al);
    const cg=new THREE.Mesh(new THREE.RingGeometry(d.r-1.7,d.r-1.4,28),new THREE.MeshBasicMaterial({color:0xff6f47,side:THREE.DoubleSide}));
    cg.rotation.x=-Math.PI/2;cg.position.y=.05;g.add(cg);
    const tenda=new THREE.Mesh(new THREE.ConeGeometry(1.9,2.4,4),mat(T.kamp[di]));tenda.position.set(-2.5,1.2,-1.9);tenda.rotation.y=Math.PI/4;g.add(tenda);
    const tiang=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,7,6),mat(0x6b4a26));tiang.position.set(2.6,3.5,-2);g.add(tiang);
    const bend=new THREE.Mesh(new THREE.BoxGeometry(1.7,1,.08),mat(T.kamp[di]));bend.position.set(3.5,6.4,-2);g.add(bend);
    gudangs.push({g,bend,nama:d.nama});
  });
  /* ---------- pad kunci (hijau) dan pelat tuas (biru) ---------- */
  const pad=new THREE.Group();pad.position.set(W.PAD.x,0,W.PAD.z);grup.add(pad);
  const cp=new THREE.Mesh(new THREE.CircleGeometry(W.PAD.r,28),new THREE.MeshBasicMaterial({color:0x7bd38a,transparent:true,opacity:.75}));
  cp.rotation.x=-Math.PI/2;cp.position.y=.04;pad.add(cp);
  const cr=new THREE.Mesh(new THREE.RingGeometry(W.PAD.r-.3,W.PAD.r,28),new THREE.MeshBasicMaterial({color:0x1c2230,side:THREE.DoubleSide}));
  cr.rotation.x=-Math.PI/2;cr.position.y=.05;pad.add(cr);pad.add(tulisanLantai('PAD',3.4,'#e8f6ea'));
  const tuas=new THREE.Group();tuas.position.set(W.TUAS.x,0,W.TUAS.z);grup.add(tuas);
  const ct=new THREE.Mesh(new THREE.CircleGeometry(W.TUAS.r,28),new THREE.MeshBasicMaterial({color:0x6fb7e9,transparent:true,opacity:.75}));
  ct.rotation.x=-Math.PI/2;ct.position.y=.04;tuas.add(ct);
  const ctr=cr.clone();ctr.geometry=new THREE.RingGeometry(W.TUAS.r-.3,W.TUAS.r,28);tuas.add(ctr);tuas.add(tulisanLantai('TUAS',3.2,'#e3f1fb'));
  /* ---------- gerbang jalan pintas: palang terangkat selama ada yang berdiri di pelat tuas ---------- */
  const G=W.GERBANG,s0=W.JALUR[G.ruas],gz=(G.z0+G.z1)/2,gx=s0[0]+(s0[2]-s0[0])*(gz-s0[1])/(s0[3]-s0[1]);
  const gerb=new THREE.Group();gerb.position.set(gx,Y(gx,gz),gz);grup.add(gerb);
  const palang=new THREE.Group();palang.position.set(-2.3,1.3,0);gerb.add(palang);
  {
    const kayuG=mat(0x6b4a26);
    for(const sx of [-2.3,2.3]){const t=new THREE.Mesh(new THREE.BoxGeometry(.4,2.4,.4),kayuG);t.position.set(sx,1.2,0);gerb.add(t);}
    const pg=new THREE.BoxGeometry(4.6,.3,.3);pg.translate(2.3,0,0);palang.add(new THREE.Mesh(pg,mat(0x6fb7e9)));
    const pg2=new THREE.BoxGeometry(4.6,.3,.3);pg2.translate(2.3,-.6,0);palang.add(new THREE.Mesh(pg2,mat(0x6fb7e9)));
  }
  let gerbBuka=false;
  /* ---------- air, air terjun, dasar jurang ---------- */
  const riaks=[],A=W.AIR,timur=W.AIR_JATUH!=='barat';
  if(A){
    const matAir=new THREE.MeshPhongMaterial({color:T.air||(T.flora==='gurun'?0x36a9b8:0x3f9bd8),transparent:true,opacity:.86,shininess:90,specular:0xbfe6ff});
    const w=A.x1-A.x0+2,d=A.z1-A.z0,cx=(A.x0+A.x1)/2+(timur?1:-1),cz=(A.z0+A.z1)/2;
    const air=new THREE.Mesh(new THREE.PlaneGeometry(w,d),matAir);air.rotation.x=-Math.PI/2;air.position.set(cx,-.38,cz);air.userData.tanah=true;grup.add(air);
    for(let i=0;i<5;i++){
      const r=new THREE.Mesh(new THREE.PlaneGeometry(3.2,.16),new THREE.MeshBasicMaterial({color:0xdff3ff,transparent:true,opacity:.7,depthWrite:false}));
      r.rotation.x=-Math.PI/2;r.position.set(0,-.34,A.z0+.6+i*(d-1.2)/4);r.userData.tanah=true;grup.add(r);riaks.push(r);
    }
    if(W.AIR_JATUH!=='tidak'){const jatuh=new THREE.Mesh(new THREE.PlaneGeometry(d,12),new THREE.MeshBasicMaterial({color:0xcfeaff,transparent:true,opacity:.8,side:THREE.DoubleSide}));
    jatuh.rotation.y=-Math.PI/2;jatuh.position.set(timur?D.x1-.3:D.x0+.3,5.6,cz);jatuh.userData.tanah=true;grup.add(jatuh);}
  }
  const GTS=W.GANTUNG?(Array.isArray(W.GANTUNG)?W.GANTUNG:[W.GANTUNG]):[],GT=GTS[0],gantY=GT?Y(GT.x,(GT.z0+GT.z1)/2):0;
  if(W.JURANG){
    const J=W.JURANG,dj=new THREE.Mesh(new THREE.PlaneGeometry(J.x1-J.x0,J.z1-J.z0),new THREE.MeshBasicMaterial({color:0x2a2f3a,transparent:true,opacity:.55,depthWrite:false}));
    dj.rotation.x=-Math.PI/2;dj.position.set((J.x0+J.x1)/2,gantY-3.2,(J.z0+J.z1)/2);dj.userData.tanah=true;grup.add(dj);
  }
  /* ---------- jembatan: gantung di atas jurang, kayu di atas air ---------- */
  {
    const kayu1=mat(0xc08a4a),kayu2=mat(0xb27a3c),tali=mat(0x6b4a26);
    for(const GT of GTS){
      const z0=GT.z0,z1=GT.z1,n=11,y=Y(GT.x,(GT.z0+GT.z1)/2);
      for(let k=0;k<n;k++){const pl=new THREE.Mesh(new THREE.BoxGeometry(2.7,.16,(z1-z0)/n-.07),k%2?kayu1:kayu2);pl.position.set(GT.x,y+.02,z0+(k+.5)*(z1-z0)/n);grup.add(pl);}
      for(const sx of [-1,1]){
        const rl=new THREE.Mesh(new THREE.BoxGeometry(.1,.1,z1-z0),tali);rl.position.set(GT.x+sx*1.4,y+1,(z0+z1)/2);grup.add(rl);
        for(const zz of [z0,z1,(z0+z1)/2]){const t=new THREE.Mesh(new THREE.BoxGeometry(.2,1.2,.2),tali);t.position.set(GT.x+sx*1.4,y+.5,zz);grup.add(t);}
      }
    }
    if(W.JEMB_KAYU&&A){
      const [ax,az,bx,bz]=W.JEMB_KAYU,dx=bx-ax,dz=bz-az,L=Math.hypot(dx,dz),ux=dx/L,uz=dz/L,rot=Math.atan2(ux,uz);
      const t0=(A.z0-.8-az)/dz*L,t1=(A.z1+.8-az)/dz*L,m=9;
      for(let k=0;k<m;k++){
        const t=t0+(k+.5)*(t1-t0)/m,pl=new THREE.Mesh(new THREE.BoxGeometry(4.2,.18,(t1-t0)/m-.07),k%2?kayu1:kayu2);
        pl.position.set(ax+ux*t,.06,az+uz*t);pl.rotation.y=rot;grup.add(pl);
      }
      for(const sx of [-1,1]){const tm=(t0+t1)/2,rl=new THREE.Mesh(new THREE.BoxGeometry(.14,.5,t1-t0),tali);
        rl.position.set(ax+ux*tm+sx*uz*2.1,.5,az+uz*tm-sx*ux*2.1);rl.rotation.y=rot;grup.add(rl);}
    }
  }
  /* ---------- tumbuhan dan batu: InstancedMesh, kepadatan diatur dari tingkat kualitas ----------
     urutan slot: [0] tajuk besar, [1] tajuk kecil, [2] batang tajuk, [3] mahkota, [4] batang mahkota, [5] batu, [6] semak hias */
  const flora=[];
  {
    let seed=20261;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
    const NP=1100,NL=420,NB=560,NS=700,gurun=T.flora==='gurun';
    const mk=(geo,n)=>{const m=new THREE.InstancedMesh(geo,tembus(new THREE.MeshLambertMaterial({flatShading:true})),n);m.userData.maks=0;grup.add(m);flora.push(m);return m;};
    const gA=gurun?new THREE.CylinderGeometry(.42,.5,3.2,7):new THREE.ConeGeometry(1.5,3.6,7);
    const gB=gurun?new THREE.CylinderGeometry(.26,.3,1.4,6):new THREE.ConeGeometry(1.1,2.6,7);
    const gBat=new THREE.CylinderGeometry(.24,.32,1.6,6),gMah=gurun?new THREE.ConeGeometry(2.2,.9,7):new THREE.IcosahedronGeometry(1.5,0);
    const gBatL=gurun?new THREE.CylinderGeometry(.2,.3,4.4,6):gBat;
    const a=mk(gA,NP),b=mk(gB,NP),c=mk(gBat,NP),mah=mk(gMah,NL),bl=mk(gBatL,NL),batu=mk(new THREE.IcosahedronGeometry(1,0),NB),semak=mk(new THREE.ConeGeometry(.6,.9,5),NS);
    const m=new THREE.Matrix4(),q=new THREE.Quaternion(),p=new THREE.Vector3(),sc=new THREE.Vector3(),C=new THREE.Color(),e=new THREE.Euler();
    const HP=T.warnaA||(gurun?[0x4f8f4a,0x5c9c52,0x467f43,0x6aa85a]:[0x1f6b3a,0x2a7d44,0x2f8a4c,0x246b3f]),HP2=T.warnaB||HP,HL=T.warnaMahkota||(gurun?[0x3f9a52,0x4fae5a,0x5bb565,0x358a46]:[0x4fae5a,0x6cc06a,0x3f9a52,0x8cc96a]);
    let np=0,nl=0,nb=0,ns=0;
    const sah=(x,z,marg)=>z>1&&W.jarakJalan(x,z)>marg&&dalam(A,x,z)<-.6&&dalam(W.JURANG,x,z)<-.4;
    for(let i=0;i<9000;i++){
      const x=D.x0+1+rnd()*(D.x1-D.x0-2),z=1+rnd()*(D.z1-2),u=rnd(),s=.55+rnd()*.6,ry=rnd()*6.28;
      const kiri=x<-13,kanan=x>13,tebing=W.tebing(x,z)>.45,dekatAir=dalam(A,x,z)>-7;
      const y=W.tinggiTanah(x,z);
      /* peluang tiap jenis: hutan lebat di kiri pada tema hijau; kaktus jarang, palem di dekat air pada tema gurun */
      const pA=gurun?(T.tanpaKaktus?0:(kiri?.12:.1)):(kiri?.72:kanan?.18:.3),pL=gurun?(T.tanpaKaktus?(dekatAir?.6:.3):(dekatAir?.55:kiri?.2:.13)):(kiri?.8:kanan?.55:.36),pB=gurun?(kanan?.7:.58):(kiri?.86:kanan?.68:.72);
      if(u<pA&&!tebing){
        if(np>=NP||!sah(x,z,3.2))continue;
        q.setFromEuler(e.set(0,ry,0));sc.set(s,s,s);
        if(gurun){ /* kaktus: batang tegak dan satu lengan */
          p.set(x,y+1.6*s,z);m.compose(p,q,sc);a.setMatrixAt(np,m);a.setColorAt(np,C.set(HP[i%4]));
          const ox=Math.cos(ry)*.55*s,oz=Math.sin(ry)*.55*s;p.set(x+ox,y+2*s,z+oz);m.compose(p,q,sc);b.setMatrixAt(np,m);b.setColorAt(np,C.set(HP[(i+1)%4]));
          sc.set(.001,.001,.001);m.compose(p,q,sc);c.setMatrixAt(np,m);c.setColorAt(np,C.set(0));
        }else{
          p.set(x,y+.7*s,z);m.compose(p,q,sc);c.setMatrixAt(np,m);c.setColorAt(np,C.set(0x7a4f2a));
          p.set(x,y+2.9*s,z);m.compose(p,q,sc);a.setMatrixAt(np,m);a.setColorAt(np,C.set(HP[i%4]));
          p.set(x,y+4.6*s,z);m.compose(p,q,sc);b.setMatrixAt(np,m);b.setColorAt(np,C.set(HP2[(i+1)%4]));
        }
        np++;
      }else if(u<pL&&!tebing){
        if(nl>=NL||!sah(x,z,3.6))continue;
        if(gurun){ /* palem: batang tinggi miring dan mahkota pipih */
          q.setFromEuler(e.set(rnd()*.25,ry,rnd()*.25));sc.set(s,s,s);p.set(x,y+2.2*s,z);m.compose(p,q,sc);bl.setMatrixAt(nl,m);bl.setColorAt(nl,C.set(0x9a6b3c));
          q.setFromEuler(e.set(0,ry,0));sc.set(s,s*.8,s);p.set(x,y+4.5*s,z);m.compose(p,q,sc);mah.setMatrixAt(nl,m);mah.setColorAt(nl,C.set(HL[i%4]));
        }else{
          q.setFromEuler(e.set(rnd()*.4,ry,0));
          sc.set(s*.9,s*1.1,s*.9);p.set(x,y+.8*s,z);m.compose(p,q,sc);bl.setMatrixAt(nl,m);bl.setColorAt(nl,C.set(0x8a5a2b));
          sc.set(s,s*.85,s);p.set(x,y+2.5*s,z);m.compose(p,q,sc);mah.setMatrixAt(nl,m);mah.setColorAt(nl,C.set(HL[i%4]));
        }
        nl++;
      }else if(u<pB||tebing){
        if(nb>=NB||!sah(x,z,1.3))continue;
        const bb=tebing?1.4+rnd()*1.8:(.4+rnd()*.9);
        q.setFromEuler(e.set(rnd()*3,ry,rnd()*3));sc.set(bb,bb*(.6+rnd()*.5),bb);p.set(x,y+.25*bb,z);m.compose(p,q,sc);batu.setMatrixAt(nb,m);batu.setColorAt(nb,C.set(T.batu[i%3]));nb++;
      }else{
        if(ns>=NS||!sah(x,z,.5))continue;
        q.setFromEuler(e.set(0,ry,0));sc.set(s,s,s);p.set(x,y+.4*s,z);m.compose(p,q,sc);semak.setMatrixAt(ns,m);
        semak.setColorAt(ns,C.set(T.semak||(gurun?(dekatAir?0x7fae5c:0xa89a5c):(kiri?0x3a8a48:kanan?0x9bd070:0x7fae5c))));ns++;
      }
    }
    const jml=[np,np,np,nl,nl,nb,ns];
    flora.forEach((f,i)=>{f.userData.maks=jml[i];f.count=jml[i];f.instanceMatrix.needsUpdate=true;if(f.instanceColor)f.instanceColor.needsUpdate=true;f.computeBoundingSphere();});
    flora[6].userData.hias=true;
  }
  /* ---------- gunung latar ---------- */
  {
    const g=new THREE.ConeGeometry(1,1,6),gm=new THREE.InstancedMesh(g,new THREE.MeshLambertMaterial({flatShading:true}),34);
    const m=new THREE.Matrix4(),q=new THREE.Quaternion(),p=new THREE.Vector3(),sc=new THREE.Vector3(),C=new THREE.Color();
    let seed=77;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
    for(let i=0;i<34;i++){
      const a=-.35+i/33*(Math.PI+.7),R=78+rnd()*30,h=22+rnd()*26,w=20+rnd()*16;
      p.set(Math.cos(a)*R*1.05,h/2-2,30+Math.sin(a)*R*.85);sc.set(w,h,w);m.compose(p,q,sc);gm.setMatrixAt(i,m);gm.setColorAt(i,C.set(T.latar[i%3]));
    }
    gm.instanceMatrix.needsUpdate=true;gm.userData.latar=true;gm.frustumCulled=false;grup.add(gm);
  }
  /* ---------- koin petualang ---------- */
  const gk=new THREE.CylinderGeometry(.55,.55,.14,16);gk.rotateX(Math.PI/2);
  const koin=new THREE.InstancedMesh(gk,new THREE.MeshLambertMaterial({color:0xffc83d,flatShading:true,emissive:0x664400}),W.KOIN_A.length);koin.frustumCulled=false;grup.add(koin);
  let koinAda=W.KOIN_A.map(()=>true);
  const SUMBU_Y=new THREE.Vector3(0,1,0);
  function animKoin(t){
    for(let i=0;i<W.KOIN_A.length;i++){
      const [x,z]=W.KOIN_A[i];Q.setFromAxisAngle(SUMBU_Y,t*2+i);P.set(x,Y(x,z)+1.1+Math.sin(t*2.4+i)*.12,z);S.setScalar(koinAda[i]?1:.0001);M.compose(P,Q,S);koin.setMatrixAt(i,M);
    }
    Q.identity();koin.instanceMatrix.needsUpdate=true;
  }
  /* ---------- rintangan ---------- */
  const logam=mat(0x6b7480),merah=mat(0xe5392b),oranye=mat(0xff8a3d),gelap=mat(0x1c2230),matBatu=mat(T.batuJalan);
  const MD={palu:[],pintu:[],duri:[],ubin:[],bola:[],chev:[],kayu:[]};
  let mSpec=W.medanBabak(0),chevOff=0;
  for(let i=0;i<2;i++){
    const g=new THREE.Group(),t1=new THREE.Mesh(new THREE.BoxGeometry(.3,PAL_Y+.4,.3),logam),t2=t1.clone(),bm=new THREE.Mesh(new THREE.BoxGeometry(2*(PAL_A+.9),.3,.3),logam);
    t1.position.set(-PAL_A-.9,(PAL_Y+.4)/2,0);t2.position.set(PAL_A+.9,(PAL_Y+.4)/2,0);bm.position.set(0,PAL_Y+.15,0);
    /* tiang palu berdiri di tepi jurang yang dalam: panjangkan ke bawah */
    t1.scale.y=2.6;t2.scale.y=2.6;t1.position.y-=3.6;t2.position.y-=3.6;
    const ag=new THREE.BoxGeometry(.2,PAL_L,.2);ag.translate(0,-PAL_L/2,0);const lengan=new THREE.Mesh(ag,logam);lengan.position.set(0,PAL_Y,0);
    const kepala=new THREE.Mesh(T.flora==='gurun'?new THREE.BoxGeometry(1.9,.5,.25):new THREE.BoxGeometry(1.5,1.0,1.1),merah);kepala.position.set(0,-PAL_L,0);lengan.add(kepala);
    g.add(t1,t2,bm,lengan);g.visible=false;grup.add(g);MD.palu.push({g,lengan});
  }
  const PI=W.PINTU,adaPintu=mSpec.pintu.length>0,pintuZ=adaPintu?mSpec.pintu[0].z:0,pintuY=Y(PI.cx,pintuZ);
  {
    const pg=new THREE.BoxGeometry(1,2.2,.9),mp=T.flora==='gurun'?mat(0xc9a576):oranye;
    for(let i=0;i<2;i++){const m=new THREE.Mesh(pg,mp);m.position.y=pintuY+1.1;m.visible=false;grup.add(m);MD.pintu.push(m);}
    if(adaPintu)for(const sx of [PI.x0-.25,PI.x1+.25]){const t=new THREE.Mesh(new THREE.BoxGeometry(.5,2.8,1.1),mat(T.flora==='gurun'?0x8a6a48:0x6b4a26));t.position.set(sx,pintuY+1.4,pintuZ);grup.add(t);}
  }
  for(let j=0;j<DURI_MAKS;j++)for(let i=0;i<3;i++){
    const g=new THREE.Group(),dasar=new THREE.Mesh(new THREE.CylinderGeometry(.72,.72,.05,14),gelap);dasar.position.y=.03;g.add(dasar);
    const kn=new THREE.Group();
    for(const [ox,oz] of [[-.3,-.2],[.3,-.2],[0,.28]]){const c=new THREE.Mesh(new THREE.ConeGeometry(.24,1.0,6),merah);c.position.set(ox,.5,oz);kn.add(c);}
    g.add(kn);g.visible=false;grup.add(g);MD.duri.push({g,kn,j,i});
  }
  for(let n=0;n<6;n++){const u=new THREE.Mesh(new THREE.BoxGeometry(1,.6,1),matBatu.clone());u.visible=false;grup.add(u);MD.ubin.push(u);}
  for(let n=0;n<2;n++){
    const b=new THREE.Mesh(new THREE.IcosahedronGeometry(BOLA_R,1),mat(T.flora==='gurun'?0xb07a52:0x8a8f98));b.visible=false;grup.add(b);
    const w=new THREE.Mesh(new THREE.PlaneGeometry(BOLA_R*2,1),new THREE.MeshBasicMaterial({color:0xe5392b,transparent:true,opacity:.0,depthWrite:false}));
    w.rotation.x=-Math.PI/2;w.visible=false;w.userData.tanah=true;grup.add(w);MD.bola.push({b,w});
  }
  /* ban berjalan (di gurun: aliran pasir): alas dan panah yang bergulir */
  const BAN=W.BAN,banX=BAN.ax==='x',banL=banX?BAN.x1-BAN.x0:BAN.z1-BAN.z0,banCx=(BAN.x0+BAN.x1)/2,banCz=(BAN.z0+BAN.z1)/2;
  const adaBan=BAN.x1>BAN.x0;
  const banAlas=new THREE.Mesh(new THREE.PlaneGeometry(BAN.x1-BAN.x0,BAN.z1-BAN.z0),new THREE.MeshBasicMaterial({color:T.flora==='gurun'?0xb98b52:0x4a4f5a}));
  banAlas.rotation.x=-Math.PI/2;banAlas.position.set(banCx,(W.AIR&&dalam(W.AIR,banCx,banCz)>0?-.25:Y(banCx,banCz))+.05,banCz);banAlas.userData.tanah=true;grup.add(banAlas);
  const chevG=new THREE.Group();grup.add(chevG);banAlas.visible=chevG.visible=adaBan;
  {
    const ga=new THREE.BoxGeometry(.8,.03,.16),mc=mat(T.flora==='gurun'?0xfff1d0:0xffd96b);
    for(let k=0;k<18;k++){
      const g=new THREE.Group(),a=new THREE.Mesh(ga,mc),b=new THREE.Mesh(ga,mc);
      a.position.set(-.25,0,-.25);a.rotation.y=-Math.PI/4;b.position.set(.25,0,-.25);b.rotation.y=Math.PI/4;g.add(a,b);g.position.y=.08;chevG.add(g);MD.chev.push(g);
    }
  }
  const tramp=new THREE.Group();tramp.visible=false;grup.add(tramp);
  {
    const alas=new THREE.Mesh(new THREE.CylinderGeometry(1.2,1.2,.25,18),mat(0xe5392b)),atas=new THREE.Mesh(new THREE.CylinderGeometry(.98,.98,.06,18),mat(0xfff1d0));
    alas.position.y=.13;atas.position.y=.28;tramp.add(alas,atas);
  }
  /* gelondong (di gurun: batu silinder) */
  {
    const geoG=new THREE.CylinderGeometry(.55,.55,1.3,12);geoG.rotateX(Math.PI/2);
    const gurun=T.flora==='gurun',matG=mat(gurun?0xa98a62:0x8a5a2b),matB=mat(gurun?0x7d6448:0xd9a45a);
    for(let i=0;i<RINT_MAKS;i++){
      const m=new THREE.Group(),b=new THREE.Mesh(geoG,matG);
      const s1=new THREE.Mesh(new THREE.BoxGeometry(1.15,.18,1.36),matB);m.add(b);b.add(s1);
      m.visible=false;grup.add(m);MD.kayu.push({g:m,b});
    }
  }
  /* penekan pabrik: alas bergaris dan kepala penekan di antara dua tiang */
  const garis=(()=>{const c=document.createElement('canvas');c.width=64;c.height=64;const g=c.getContext('2d');g.fillStyle='#1c2230';g.fillRect(0,0,64,64);g.fillStyle='#ffc83d';
    for(let i=-64;i<128;i+=24){g.beginPath();g.moveTo(i,0);g.lineTo(i+12,0);g.lineTo(i+76,64);g.lineTo(i+64,64);g.fill();}const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(3,1);return t;})();
  for(let i=0;i<4;i++){
    const g=new THREE.Group();g.visible=false;grup.add(g);
    const alas=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:garis}));alas.rotation.x=-Math.PI/2;alas.position.y=.06;alas.userData.tanah=true;g.add(alas);
    const kepala=new THREE.Mesh(new THREE.BoxGeometry(1,.7,1),mat(0x6b7480));g.add(kepala);
    const t1=new THREE.Mesh(new THREE.BoxGeometry(.35,4.6,.35),logam),t2=t1.clone(),atap=new THREE.Mesh(new THREE.BoxGeometry(1,.4,.6),logam);g.add(t1,t2,atap);
    MD.penekan=MD.penekan||[];MD.penekan.push({g,alas,kepala,t1,t2,atap});
  }
  /* lengan putar rendah: tiang pusat dan lengan berwarna peringatan */
  for(let i=0;i<2;i++){
    const g=new THREE.Group();g.visible=false;grup.add(g);
    const hub=new THREE.Mesh(new THREE.CylinderGeometry(.55,.7,1.4,12),mat(0x1c2230));hub.position.y=.7;g.add(hub);
    const putar=new THREE.Group();putar.position.y=.55;g.add(putar);
    MD.lengan=MD.lengan||[];MD.lengan.push({g,putar,n:0});
  }
  /* rakit es di lajur air */
  for(let i=0;i<4;i++){const m=new THREE.Mesh(new THREE.BoxGeometry(1,.45,1),mat(T.rakit||0xe6f2f8));m.visible=false;grup.add(m);MD.rakit=MD.rakit||[];MD.rakit.push(m);}
  /* es jatuh: kerucut terbalik dan bayangan peringatan */
  const gEs=new THREE.ConeGeometry(.45,1.6,6);gEs.rotateX(Math.PI);
  for(let i=0;i<12;i++){
    const es=new THREE.Mesh(gEs,mat(0xcfe6f5));es.visible=false;grup.add(es);
    const bay=new THREE.Mesh(new THREE.CircleGeometry(1,20),new THREE.MeshBasicMaterial({color:0xe5392b,transparent:true,opacity:0,depthWrite:false}));bay.rotation.x=-Math.PI/2;bay.visible=false;bay.userData.tanah=true;grup.add(bay);
    MD.jatuh=MD.jatuh||[];MD.jatuh.push({es,bay});
  }
  /* kawanan lebah atau kepiting berpatroli: bola-bola kecil yang bergetar */
  for(let i=0;i<4;i++){
    const g=new THREE.Group();g.visible=false;grup.add(g);const bs=[];
    for(let j=0;j<10;j++){const b=new THREE.Mesh(new THREE.IcosahedronGeometry(.16,0),mat(j%2?0x1c2230:0xffc83d));g.add(b);bs.push(b);}
    MD.patroli=MD.patroli||[];MD.patroli.push({g,bs});
  }
  /* pasang surut: lembar air yang naik menutup zona */
  for(let i=0;i<4;i++){
    const w=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshPhongMaterial({color:T.air||0x3f9bd8,transparent:true,opacity:0,shininess:90,depthWrite:false}));
    w.rotation.x=-Math.PI/2;w.visible=false;w.userData.tanah=true;grup.add(w);
    const tanda=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({color:0xe5392b,transparent:true,opacity:0,depthWrite:false}));tanda.rotation.x=-Math.PI/2;tanda.visible=false;tanda.userData.tanah=true;grup.add(tanda);
    MD.pasang=MD.pasang||[];MD.pasang.push({w,tanda});
  }
  function setMedan(r){
    mSpec=W.medanBabak(r);
    MD.kayu.forEach((o,i)=>{o.g.visible=!!mSpec.kayu[i];});
    MD.palu.forEach((o,i)=>{const p=mSpec.palu[i];o.g.visible=!!p;if(p)o.g.position.set(p.x,Y(p.x,p.z),p.z);});
    MD.pintu.forEach(m=>{m.visible=mSpec.pintu.length>0;if(m.visible)m.position.z=mSpec.pintu[0].z;});
    MD.duri.forEach(o=>{const p=mSpec.duri[o.j];o.g.visible=!!p;if(p){const [dx,dz]=p.pts[o.i];o.g.position.set(dx,Y(dx,dz),dz);}});
    MD.ubin.forEach((u,n)=>{const s=mSpec.ubin[n];u.visible=!!s;if(s){u.position.set(s.x,-.2,s.z);u.scale.set((s.w||W.UBIN.W)*.97,1,(s.d||W.UBIN.D)*.94);}});
    MD.bola.forEach((o,n)=>{const s=mSpec.bola[n];o.b.visible=false;o.w.visible=!!s;
      if(s){const L=Math.abs(s.z1-s.z0);o.w.scale.set(1,L,1);o.w.position.set(s.x,Y(s.x,(s.z0+s.z1)/2)+.07,(s.z0+s.z1)/2);o.w.material.opacity=0;}});
    MD.penekan.forEach((o,i)=>{const p=mSpec.penekan[i];o.g.visible=!!p;if(!p)return;
      const w=p.x1-p.x0,d=p.z1-p.z0,cx=(p.x0+p.x1)/2,cz=(p.z0+p.z1)/2,y=Y(cx,cz),lebarX=w>=d;
      o.g.position.set(cx,y,cz);o.alas.scale.set(w,d,1);o.kepala.scale.set(w*.96,1,d*.96);
      const L=(lebarX?w:d)/2+.2;if(lebarX){o.t1.position.set(-L,2.3,0);o.t2.position.set(L,2.3,0);o.atap.scale.set(2*L+.4,1,1);}else{o.t1.position.set(0,2.3,-L);o.t2.position.set(0,2.3,L);o.atap.scale.set(1,1,1);o.atap.rotation.y=Math.PI/2;o.atap.scale.x=2*L+.4;}
      o.atap.position.y=4.5;});
    MD.lengan.forEach((o,i)=>{const L=mSpec.lengan[i];o.g.visible=!!L;if(!L)return;o.g.position.set(L.x,Y(L.x,L.z),L.z);
      while(o.putar.children.length)o.putar.remove(o.putar.children[0]);
      for(let j=0;j<L.n;j++){const a=new THREE.Mesh(new THREE.BoxGeometry(L.L,.32,.36),mat(j%2?0xffc83d:0xe5392b));const pv=new THREE.Group();a.position.x=L.L/2;pv.add(a);pv.rotation.y=-j*Math.PI*2/L.n;o.putar.add(pv);}});
    MD.patroli.forEach((o,i)=>{o.g.visible=!!mSpec.patroli[i];if(mSpec.patroli[i]){const sk=mSpec.patroli[i].r/1.2;o.g.scale.set(sk,1,sk);}});
    MD.pasang.forEach((o,i)=>{const Z=mSpec.pasang[i];o.w.visible=o.tanda.visible=!!Z;if(Z){const cx=(Z.x0+Z.x1)/2,cz=(Z.z0+Z.z1)/2;o.y=Y(cx,cz);
      o.w.scale.set(Z.x1-Z.x0,Z.z1-Z.z0,1);o.w.position.set(cx,o.y,cz);o.tanda.scale.set(Z.x1-Z.x0,Z.z1-Z.z0,1);o.tanda.position.set(cx,o.y+.05,cz);}});
    MD.rakit.forEach((m,i)=>{const R=mSpec.rakit[i];m.visible=!!R;if(R)m.scale.set(R.ax==='x'?R.len:2*R.lebar,1,R.ax==='x'?2*R.lebar:R.len);});
    MD.jatuh.forEach(o=>{o.es.visible=o.bay.visible=false;});
    if(mSpec.tramp){tramp.visible=true;tramp.position.set(mSpec.tramp.x,Y(mSpec.tramp.x,mSpec.tramp.z),mSpec.tramp.z);}else tramp.visible=false;
  }
  function animMedan(t,dt){
    mSpec.kayu.forEach((s,i)=>{const [x,z]=W.posKayu(s,t),o=MD.kayu[i];o.g.position.set(x,Y(x,z)+.55,z);o.g.rotation.y=s.ax==='x'?0:-Math.PI/2;o.b.rotation.z=-W.xKayu(s,t)/.55;});
    mSpec.palu.forEach((p,i)=>{const x=W.xPalu(p,t);MD.palu[i].lengan.rotation.z=Math.asin(Math.max(-1,Math.min(1,x/PAL_L)));});
    {
      const p=mSpec.pintu[0];if(p){const g=W.celahPintu(p,t),ce=g<.9?0:g,izq=PI.cx-ce/2,dr=PI.cx+ce/2;
      MD.pintu[0].scale.x=Math.max(.01,izq-PI.x0);MD.pintu[0].position.x=(PI.x0+izq)/2;
      MD.pintu[1].scale.x=Math.max(.01,PI.x1-dr);MD.pintu[1].position.x=(dr+PI.x1)/2;}
    }
    for(const o of MD.duri){const p=mSpec.duri[o.j];if(!p)continue;const h=W.tinggiDuri(p,o.i,t);o.kn.scale.y=Math.max(.001,h);
      for(const c of o.kn.children)c.material=h>=.99?merah:(h>0?oranye:merah);}
    mSpec.ubin.forEach((u,n)=>{const s=W.statusUbin(u,t),m=MD.ubin[n];
      const ty=s===2?-1.25:-.2;m.position.y+=(ty-m.position.y)*Math.min(1,dt*10);
      m.material.color.setHex(s===1?(Math.sin(t*22)>0?0xe5392b:T.batuJalan):T.batuJalan);m.position.x=u.x+(s===1?Math.sin(t*60)*.05:0);});
    mSpec.bola.forEach((b,n)=>{
      const s=W.keadaanBola(b,t),o=MD.bola[n];o.b.visible=s.fase==='gulir';
      if(s.fase==='gulir'){o.b.position.set(b.x,Y(b.x,s.z)+BOLA_R,s.z);o.b.rotation.x=s.z/BOLA_R;}
      o.w.material.opacity=s.fase==='peringatan'?(.18+.18*Math.abs(Math.sin(t*8))):(s.fase==='gulir'?.1:0);
    });
    const v=W.kecBan(mSpec,t);chevOff=(chevOff+Math.abs(v)*dt)%banL;const N=6,sp=banL/N;
    chevG.rotation.y=(banX?Math.PI/2:0)+(v<0?Math.PI:0);chevG.position.set(banCx,banAlas.position.y-.05,banCz);
    MD.chev.forEach((g,k)=>{const col=k%3,row=Math.floor(k/3),zl=((row*sp+chevOff)%banL)-banL/2;g.position.set((col-1)*1.4,.08,zl);});
    mSpec.penekan.forEach((p,i)=>{const o=MD.penekan[i],s=W.penekan(p,t);o.kepala.position.set(s.fase===1?Math.sin(t*50)*.05:0,.36+3.4*s.h,0);o.kepala.material.color.setHex(s.fase===1?0xe5392b:0x6b7480);});
    mSpec.lengan.forEach((L,i)=>{MD.lengan[i].putar.rotation.y=-W.sudutLengan(L,t);});
    mSpec.patroli.forEach((P,i)=>{const o=MD.patroli[i],[px,pz]=W.posPatroli(P,t);o.g.position.set(px,Y(px,pz)+1,pz);
      o.bs.forEach((b,j)=>{const a=t*6+j*1.7;b.position.set(Math.sin(a*1.3+j)*1.1,Math.sin(a*2.1+j*2)*.5,Math.cos(a*1.7+j)*1.1);});});
    mSpec.pasang.forEach((Z,i)=>{const o=MD.pasang[i],s=W.pasang(Z,t);o.w.position.y=o.y-.3+.45*s.h;o.w.material.opacity=s.h>0?.4+.45*s.h:0;
      o.tanda.material.opacity=s.fase===1?.15+.2*Math.abs(Math.sin(t*8)):0;});
    mSpec.rakit.forEach((R,i)=>{const m=MD.rakit[i],s=W.posRakit(R,t);if(R.ax==='x')m.position.set(s,-.25,R.c);else m.position.set(R.c,-.25,s);});
    {let k=0;for(const J of mSpec.jatuh)for(const q of W.titikJatuh(J,t)){const o=MD.jatuh[k++];if(!o)break;const y=Y(q.x,q.z);
      o.bay.visible=q.u<.7;o.bay.position.set(q.x,y+.08,q.z);const sk=J.r*(q.u<.55?.4+.6*q.u/.55:1);o.bay.scale.set(sk,sk,1);o.bay.material.opacity=q.u<.55?.15+.35*q.u/.55:.5;
      o.es.visible=q.u>.4&&q.u<.75;o.es.position.set(q.x,y+.8+Math.max(0,(.55-q.u)/.15)*9,q.z);}
     for(;k<MD.jatuh.length;k++){MD.jatuh[k].es.visible=MD.jatuh[k].bay.visible=false;}}
    const tg=gerbBuka?-1.35:0;palang.rotation.z+=(tg-palang.rotation.z)*Math.min(1,dt*6);
    if(A)riaks.forEach((r,i)=>{const L=A.x1-A.x0,o=(t*(2.2+i*.3)+i*7)%L;r.position.x=timur?A.x0+o:A.x1-o;});
    gudangs.forEach((o,i)=>{o.bend.rotation.y=Math.sin(t*2+i)*.25;});
    animKoin(t);
  }
  setMedan(0);
  return {
    grup,Y,gudangs,setMedan,animMedan,
    setGerbang(b){gerbBuka=!!b;ct.material.opacity=b?.95:.6;},
    setKoin(ada){koinAda=ada.slice();},
    /* kepadatan tumbuhan 0..1 dari tingkat kualitas; semak hias hanya di tingkat tinggi */
    setDetail(f,hias){for(const m of flora){m.count=Math.round(m.userData.maks*(m.userData.hias?(hias?1:0):f));m.visible=m.count>0;}},
    padAnim(t,siap){const s=1+Math.sin(t*3)*.04;cp.scale.set(s,s,1);cp.material.opacity=siap?.95:.6;}
  };
}
