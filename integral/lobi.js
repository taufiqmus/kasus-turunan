/* Lobi Integral v2: karakter kustom, kamera bebas, Pos 1 fisik (membawa balok), jaringan per tim. */
import * as THREE from './vendor/three.min.js';
import {sambung} from './rt.js?v=10';
import {BABAK,CAP,MAXBAG,WAKTU,KURVA,RENCANA,setSeed,stateBaru,valid,cValid,skorRonde,skorTim,selesai,jumlah,gambarMini,kurvaBabak,aturanBabak,titikX} from './pos1.js?v=10';
import * as P1 from './pos1.js?v=10';
import * as AR from './arena.js?v=10';
import {buatArena,kolomDari,diDepot,diPad,BATAS,PAD,DEPOT,rintanganBabak,xRint,RINT_R} from './arena.js?v=10';
import {TIPE,WARNA,KULIT,TOPI,KACAMATA,AKS,parseAv,kodeAv,acakAv,meshAvatar,topY} from './avatar.js?v=10';
import {labelSprite,buangSprite,klem} from './util.js?v=10';
import {bacaSesi} from '../core/net.js';

const $=id=>document.getElementById(id);
const TIM=[['merah','Merah','#e5392b'],['biru','Biru','#2f7fc1'],['hijau','Hijau','#2f9e5b'],['kuning','Kuning','#e0a200'],
  ['ungu','Ungu','#7a4bc4'],['oranye','Oranye','#ee7d1a'],['tosca','Tosca','#17a2a2'],['pink','Pink','#e0559b']].map(a=>({id:a[0],nama:a[1],warna:a[2]}));
const timById=id=>TIM.find(t=>t.id===id)||TIM[0];
const POS=['Tambal Waduk','Rakit Sandi','Mesin Putar Balik','Misteri Tangki','Brankas Batas','Final'];
const SPD=7,RMAX=95,RZ=62,SPRINT=1.8;
const Q=new URLSearchParams(location.search);

/* ---------- profil dan pembuat karakter ---------- */
let profil={nama:'',tim:TIM[Math.floor(Math.random()*TIM.length)].id,av:acakAv()};
const KOIN_N=60;
let koinAmbil=new Set();try{for(const v of JSON.parse(localStorage.getItem('ki-koin')||'[]'))if(Number.isInteger(v)&&v>=0&&v<KOIN_N)koinAmbil.add(v);}catch(e){}
const KOIN_KUNCI={};
const jmlKoin=()=>koinAmbil.size;
const terbuka=(k,i)=>!(KOIN_KUNCI[k]&&KOIN_KUNCI[k][i])||jmlKoin()>=KOIN_KUNCI[k][i];
try{const j=JSON.parse(localStorage.getItem('ki-profil')||'null');if(j){profil.nama=String(j.nama||'').slice(0,12);if(TIM.some(t=>t.id===j.tim))profil.tim=j.tim;if(j.av)profil.av=parseAv(j.av);}}catch(e){}
for(const k in KOIN_KUNCI)for(const i in KOIN_KUNCI[k])if(profil.av[k]==i&&!terbuka(k,+i))profil.av[k]=0;
const simpanProfil=()=>{try{localStorage.setItem('ki-profil',JSON.stringify({nama:profil.nama,tim:profil.tim,av:kodeAv(profil.av)}));}catch(e){}};

{
  const box=$('in-tim');
  for(const t of TIM){
    const b=document.createElement('button');b.type='button';b.className='tab';b.dataset.t=t.id;
    const sw=document.createElement('span');sw.className='sw';sw.style.background=t.warna;
    b.append(sw,t.nama);b.setAttribute('aria-pressed',String(t.id===profil.tim));
    b.addEventListener('click',()=>{profil.tim=t.id;box.querySelectorAll('.tab').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.t===profil.tim)));});
    box.append(b);
  }
  const s=bacaSesi();if(profil.nama)$('in-nama').value=profil.nama;else if(s&&s.user)$('in-nama').value=String(s.user).slice(0,12);
  if(Q.get('kode'))$('in-kode').value=Q.get('kode').toUpperCase().slice(0,10);
}

const mat=c=>new THREE.MeshLambertMaterial({color:c,flatShading:true});

/* pratinjau karakter: renderer kecil sendiri */
const prev={on:true,r:null,sc:new THREE.Scene(),cam:new THREE.PerspectiveCamera(32,300/380,.5,40),mesh:null};
try{
  prev.r=new THREE.WebGLRenderer({canvas:$('cr-prev'),antialias:true,alpha:true});prev.r.setPixelRatio(Math.min(devicePixelRatio||1,2));
  prev.sc.add(new THREE.HemisphereLight(0xffffff,0x9a9a9a,1.6));const dl=new THREE.DirectionalLight(0xffffff,1.5);dl.position.set(4,8,6);prev.sc.add(dl);
  prev.cam.position.set(0,2.0,8.6);prev.cam.lookAt(0,1.7,0);
}catch(e){prev.r=null;}
function segarPratinjau(){
  if(!prev.r)return;
  if(prev.mesh)prev.sc.remove(prev.mesh);
  prev.mesh=meshAvatar(profil.av);prev.sc.add(prev.mesh);
}
function bangunOpsi(){
  const box=$('cr-opsi');box.textContent='';
  const defs=[['t','Jenis',TIPE],['c','Warna',WARNA,1],['k','Kulit',KULIT,1],['h','Topi',TOPI],['g','Kacamata',KACAMATA],['a','Aksesori',AKS]];
  for(const [k,lab,L,sw] of defs){
    if(k==='k'&&profil.av.t!==0)continue;
    const row=document.createElement('div');row.className='cr-row';const b=document.createElement('b');b.textContent=lab;row.append(b);
    L.forEach((v,i)=>{
      const e=document.createElement('button');e.type='button';e.setAttribute('aria-pressed',String(profil.av[k]===i));
      if(sw){e.className='s';e.style.background=v;e.setAttribute('aria-label',lab+' '+(i+1));}else{e.className='c';e.textContent=v.replace('Tanpa ','-');if(i===0&&k!=='t')e.textContent='Tidak';}
      const kunci=!terbuka(k,i);
      if(kunci){e.disabled=true;e.textContent='\uD83D\uDD12 '+KOIN_KUNCI[k][i]+' koin';e.title='Kumpulkan '+KOIN_KUNCI[k][i]+' koin di lobi';}
      e.addEventListener('click',()=>{profil.av[k]=i;bangunOpsi();segarPratinjau();simpanProfil();});
      row.append(e);
    });
    box.append(row);
  }
  const ac=document.createElement('button');ac.type='button';ac.className='btn alt';ac.style.cssText='font-size:12px;padding:5px 10px;align-self:flex-start';ac.textContent='Acak';
  ac.addEventListener('click',()=>{profil.av=acakAv();for(const k in KOIN_KUNCI)for(const i in KOIN_KUNCI[k])if(profil.av[k]==i&&!terbuka(k,+i))profil.av[k]=0;bangunOpsi();segarPratinjau();simpanProfil();});box.append(ac);
}
bangunOpsi();segarPratinjau();

/* ---------- dunia 3D ---------- */
const cv=$('gl');
const renderer=new THREE.WebGLRenderer({canvas:cv,antialias:(devicePixelRatio||1)<=1,powerPreference:'high-performance'});
const scene=new THREE.Scene();scene.background=new THREE.Color(0x9fd4ee);scene.fog=new THREE.Fog(0x9fd4ee,80,210);
const cam=new THREE.PerspectiveCamera(50,1,.3,280);
scene.add(new THREE.HemisphereLight(0xffffff,0x7aa860,1.5));
const sun=new THREE.DirectionalLight(0xfff1d6,1.6);sun.position.set(12,24,10);scene.add(sun);

const rumput=new THREE.Mesh(new THREE.CircleGeometry(190,48),mat(0x78b85a));rumput.rotation.x=-Math.PI/2;scene.add(rumput);
const lobiGrup=new THREE.Group();scene.add(lobiGrup);
{
  const plaza=new THREE.Mesh(new THREE.CircleGeometry(21,36),mat(0xffe2b5));plaza.rotation.x=-Math.PI/2;plaza.position.y=.02;lobiGrup.add(plaza);
  const ring=new THREE.Mesh(new THREE.RingGeometry(20.4,21,36),mat(0x1c2230));ring.rotation.x=-Math.PI/2;ring.position.y=.03;lobiGrup.add(ring);
}
/* enam zona bertema, tiap zona memuat satu gerbang pos. Sudut dari utara, searah jarum jam. */
const ZONA=[
  {nama:'Padang',tanah:0x8ccf6a,pohon:[0x2f8a4c,0x3da05a],batu:0x9aa09a,kind:'pohon'},
  {nama:'Gurun',tanah:0xf0d58a,pohon:[0x4d9a4a],batu:0xb98a5a,kind:'kaktus'},
  {nama:'Salju',tanah:0xeaf3f7,pohon:[0x2c6b5a,0x3a8470],batu:0xcfd8de,kind:'pohon'},
  {nama:'Hutan',tanah:0x5aa35c,pohon:[0x1f6b3a,0x2a7d44],batu:0x7c8a7c,kind:'pohon'},
  {nama:'Pantai',tanah:0xf3e6b8,pohon:[0x4fae5a],batu:0xd9c9a0,kind:'semak'},
  {nama:'Gunung',tanah:0xa8a39a,pohon:[0x6c7a6c],batu:0x7a7f86,kind:'batu'}
];
const ZA=ZONA.map((_,i)=>(-60+60*i)*Math.PI/180);
const ZP=ZA.map(a=>({x:Math.cos(a)*RZ,z:Math.sin(a)*RZ}));
{
  /* tanah zona dan jalan setapak dari plaza */
  ZONA.forEach((zn,i)=>{
    const d=new THREE.Mesh(new THREE.CircleGeometry(26,36),mat(zn.tanah));d.rotation.x=-Math.PI/2;d.position.set(ZP[i].x,.01,ZP[i].z);lobiGrup.add(d);
    if(i===4){const dan=new THREE.Mesh(new THREE.CircleGeometry(9,28),mat(0x5bb6e8));dan.rotation.x=-Math.PI/2;dan.position.set(ZP[i].x+12*Math.cos(ZA[i]+1.6),.03,ZP[i].z+12*Math.sin(ZA[i]+1.6));lobiGrup.add(dan);}
    const len=RZ-21-6,jl=new THREE.Mesh(new THREE.PlaneGeometry(5,len),mat(0xf0d9a8));
    jl.rotation.order='YXZ';jl.rotation.x=-Math.PI/2;jl.rotation.y=-(Math.PI/2+ZA[i]);
    const mid=(21+RZ-6)/2;jl.position.set(Math.cos(ZA[i])*mid,.025,Math.sin(ZA[i])*mid);lobiGrup.add(jl);
  });
}
/* dekorasi: satu InstancedMesh per bentuk, dipilih menurut zona terdekat, tidak menutupi jalan dan gerbang */
const pohon=new THREE.Group();lobiGrup.add(pohon);
{
  const N=900,kerucut=new THREE.InstancedMesh(new THREE.ConeGeometry(1.5,3.4,7),new THREE.MeshLambertMaterial({flatShading:true}),N),
    batang=new THREE.InstancedMesh(new THREE.CylinderGeometry(.28,.34,1.5,6),new THREE.MeshLambertMaterial({flatShading:true}),N),
    batu=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,0),new THREE.MeshLambertMaterial({flatShading:true}),400);
  const m=new THREE.Matrix4(),q=new THREE.Quaternion(),p=new THREE.Vector3(),sc=new THREE.Vector3(),col=new THREE.Color();
  let seed=7;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
  let nk=0,nb=0;
  const jarakJalan=(x,z)=>{let d=1e9;for(let i=0;i<ZONA.length;i++){const ax=Math.cos(ZA[i]),az=Math.sin(ZA[i]),t=Math.max(0,Math.min(RZ,x*ax+z*az));d=Math.min(d,Math.hypot(x-ax*t,z-az*t));}return d;};
  for(let i=0;i<1400&&(nk<N-2||nb<400);i++){
    const a=rnd()*Math.PI*2,r=26+rnd()*110,x=Math.cos(a)*r,z=Math.sin(a)*r;
    if(jarakJalan(x,z)<4.5)continue;
    let zi=0,dm=1e9;for(let j=0;j<ZONA.length;j++){const d=Math.hypot(x-ZP[j].x,z-ZP[j].z);if(d<dm){dm=d;zi=j;}}
    if(dm<7)continue;
    const zn=ZONA[zi],s=.7+rnd()*1.1,tipe=rnd();
    if(tipe<.22&&nb<400){
      sc.set(s*1.2,s*(zn.kind==='batu'?2.2:.8),s*1.2);p.set(x,.3*s,z);q.setFromEuler(new THREE.Euler(rnd(),rnd()*6,0));m.compose(p,q,sc);batu.setMatrixAt(nb,m);batu.setColorAt(nb,col.set(zn.batu));nb++;
    }else if(nk<N-2){
      q.identity();
      if(zn.kind==='kaktus'){ /* batang hijau tegak */
        sc.set(s*.6,s*1.3,s*.6);p.set(x,.75*s*1.3,z);m.compose(p,q,sc);batang.setMatrixAt(nk,m);batang.setColorAt(nk,col.set(zn.pohon[0]));
        sc.set(.001,.001,.001);m.compose(p,q,sc);kerucut.setMatrixAt(nk,m);nk++;
      }else if(zn.kind==='semak'||zn.kind==='batu'){
        sc.set(s*1.1,s*.9,s*1.1);p.set(x,.45*s,z);m.compose(p,q,sc);kerucut.setMatrixAt(nk,m);kerucut.setColorAt(nk,col.set(zn.pohon[0]));
        sc.set(.001,.001,.001);m.compose(p,q,sc);batang.setMatrixAt(nk,m);nk++;
      }else{
        sc.set(s,s,s);p.set(x,.7*s,z);m.compose(p,q,sc);batang.setMatrixAt(nk,m);batang.setColorAt(nk,col.set(0x7a4f2a));
        p.set(x,3*s,z);m.compose(p,q,sc);kerucut.setMatrixAt(nk,m);kerucut.setColorAt(nk,col.set(zn.pohon[Math.floor(rnd()*zn.pohon.length)]));nk++;
      }
    }
  }
  kerucut.count=nk;batang.count=nk;batu.count=nb;
  for(const o of [kerucut,batang,batu])o.instanceMatrix.needsUpdate=true;
  if(kerucut.instanceColor)kerucut.instanceColor.needsUpdate=true;
  if(batang.instanceColor)batang.instanceColor.needsUpdate=true;
  if(batu.instanceColor)batu.instanceColor.needsUpdate=true;
  pohon.add(kerucut,batang,batu);
}
const gerbang=[];
{
  const gp=new THREE.BoxGeometry(.9,4.2,.9),gl=new THREE.BoxGeometry(5.2,.9,1.1);
  POS.forEach((nama,i)=>{
    const x=ZP[i].x,z=ZP[i].z,aktif=i===0,len=Math.hypot(x,z),dx=-x/len,dz=-z/len;
    const grp=new THREE.Group();grp.position.set(x,0,z);grp.rotation.y=Math.atan2(dx,dz);
    const m=mat(aktif?0xff6f47:0x9aa3ad);
    const p1=new THREE.Mesh(gp,m),p2=new THREE.Mesh(gp,m),lt=new THREE.Mesh(gl,mat(aktif?0xffc83d:0x7d8792));
    p1.position.set(-2.1,2.1,0);p2.position.set(2.1,2.1,0);lt.position.set(0,4.5,0);
    grp.add(p1,p2,lt);
    const lb=labelSprite('Pos '+(i+1)+'\n'+(aktif?nama:'terkunci'),{w:320,h:110,size:32,bg:aktif?'#fff6e4':'#d9dde2',sx:5});
    lb.position.set(0,6.4,0);grp.add(lb);
    const zl=labelSprite('Zona '+ZONA[i].nama,{w:360,h:70,size:32,sx:6});zl.position.set(0,8.4,0);grp.add(zl);
    /* tiang cahaya agar zona terlihat dari jauh */
    const tiang=new THREE.Mesh(new THREE.CylinderGeometry(.5,.9,50,10,1,true),new THREE.MeshBasicMaterial({color:aktif?0xff8a5c:0xaab3bc,transparent:true,opacity:.28,side:THREE.DoubleSide,depthWrite:false}));
    tiang.position.set(0,25,0);grp.add(tiang);
    let cincin=null;
    if(aktif){cincin=new THREE.Mesh(new THREE.RingGeometry(2.4,2.9,24),new THREE.MeshBasicMaterial({color:0xff6f47,transparent:true,opacity:.7,side:THREE.DoubleSide}));cincin.rotation.x=-Math.PI/2;cincin.position.set(0,.06,1.6);grp.add(cincin);}
    lobiGrup.add(grp);
    gerbang.push({i,nama,aktif,x:x+dx*1.6,z:z+dz*1.6,ax:x+dx*5,az:z+dz*5,cincin});
  });
}
/* koin: dikumpulkan lalu membuka tampilan karakter baru. Posisi tetap, status tersimpan di perangkat. */
const koinPos=[];
const koinMesh=(()=>{
  const g=new THREE.CylinderGeometry(.55,.55,.14,16);g.rotateX(Math.PI/2);
  const m=new THREE.InstancedMesh(g,new THREE.MeshLambertMaterial({color:0xffc83d,flatShading:true,emissive:0x664400}),KOIN_N);m.frustumCulled=false;lobiGrup.add(m);
  let seed=99;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
  for(let i=0;i<KOIN_N;i++){
    let x,z;
    do{const a=rnd()*Math.PI*2,r=26+rnd()*62;x=Math.cos(a)*r;z=Math.sin(a)*r;}while(ZP.some(p=>Math.hypot(x-p.x,z-p.z)<6));
    koinPos.push({x,z});
  }
  return m;
})();
/* papan skor */
const papan={c:document.createElement('canvas')};
{
  papan.c.width=640;papan.c.height=400;papan.tx=new THREE.CanvasTexture(papan.c);papan.tx.colorSpace=THREE.SRGBColorSpace;
  const m=new THREE.Mesh(new THREE.PlaneGeometry(14,8.75),new THREE.MeshBasicMaterial({map:papan.tx}));m.position.set(0,10,-24);lobiGrup.add(m);
  const kaki=mat(0x1c2230),k1=new THREE.Mesh(new THREE.BoxGeometry(.5,6.5,.5),kaki),k2=k1.clone();k1.position.set(-5,3.2,-24.2);k2.position.set(5,3.2,-24.2);lobiGrup.add(k1,k2);
}
const arena=buatArena();scene.add(arena.grup);

/* ---------- keadaan ---------- */
let saya=null,me=null,rt=null,mulai=false,hasilBuka=false,rodaBuka=false,revBuka=false,kotor=true,tGabung=0;
let endAt=0,hitungMundur=0,rodaR=-1,stunTil=0,tabrakTil=0;
const blok=()=>hasilBuka||rodaBuka||revBuka;
const tim=new Map();      /* anggota tim lain: id -> pemain (termasuk bot render) */
const luar=new Map();    /* pemain tim lain: hanya roster dari papan, bergerak simulasi lokal (bukan posisi asli) */
const papanData={};       /* tim -> {n,s,r,t} laporan jarang dari tiap tim */
let st=stateBaru();const pend=new Map();
let tDelta=0,tStKirim=0,ubahSt=false,tFlush=0,tPos=0,tLapor=0,lastLapor='';
const sim={on:false};
const semua=()=>{const L=[];if(me)L.push(me);for(const p of tim.values())L.push(p);return L;};
const anggota=()=>[...tim.values()].filter(p=>!p.bot);

const RG=new THREE.RingGeometry(.95,1.25,20);
function buatAv(info){
  const grp=new THREE.Group(),pivot=new THREE.Group(),mesh=meshAvatar(info.av);
  const h=topY(info.av);
  const ring=new THREE.Mesh(RG,new THREE.MeshBasicMaterial({color:timById(info.tim).warna,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=.05;
  const lb=labelSprite(info.nama||'?',{sx:4.2,size:38});lb.position.y=h+.6;
  pivot.add(mesh);grp.add(ring,pivot,lb);grp.userData={pivot,mesh,lb,ring,h};scene.add(grp);return grp;
}
function buangAv(grp){scene.remove(grp);buangSprite(grp.userData.lb);grp.userData.ring.material.dispose();}
function pemainBaru(info,bot){
  const av=parseAv(info.av);
  const p={id:info.id,nama:String(info.nama||'?').slice(0,12),tim:info.tim,av,grp:null,x:0,z:0,vx:0,vz:0,tx:0,tz:0,a:0,c:0,siap:0,tMsg:0,bot:!!bot,fase:Math.random()*6,sejak:performance.now(),emo:null,yaw:0};
  p.grp=buatAv(p);
  if(bot){p.tx=p.x=(Math.random()-.5)*10;p.tz=p.z=6+Math.random()*6;}
  tim.set(p.id,p);return p;
}
function hapusPemain(id){const p=tim.get(id);if(p){buangAv(p.grp);tim.delete(id);}}

/* ---------- jaringan ---------- */
const hit={kirim:0,terima:0,kps:0,tps:0};
function kirim(ev,p){if(rt){rt.kirim(ev,p);hit.kirim++;}}
function onHadir(L){
  const ada=new Set();
  for(const d of L){
    if(!d||typeof d.id!=='string'||d.id===saya.id||d.tim!==saya.tim)continue;ada.add(d.id);
    const p=tim.get(d.id);
    if(!p)pemainBaru(d,false);
  }
  for(const [id,p] of tim)if(!p.bot&&!ada.has(id)){hapusPemain(id);}
  kotor=true;
}
function tuaDari(L){let m=null;for(const x of L)if(m===null||x.id<m)m=x.id;return m;}
/* otoritas keadaan: id terkecil di antara anggota yang sudah lebih dari 4 detik hadir */
function otoritas(){
  const now=performance.now(),L=[];
  if(now-tGabung>4000)L.push(me);
  for(const p of anggota())if(now-p.sejak>4000)L.push(p);
  return L.length&&tuaDari(L)===saya.id;
}
/* pemimpin kunci: id terkecil di antara anggota yang sedang di arena */
function pemimpinKunci(){
  const L=[];if(me.a===1)L.push(me);
  for(const p of anggota())if(p.a===1)L.push(p);
  return L.length>0&&tuaDari(L)===saya.id;
}
const ang=(v,a,b)=>Number.isInteger(v)&&v>=a&&v<=b;
function terapDelta(list){
  for(const e of list){const [i,d]=e;st.c[i]=klem(st.c[i]+d,0,MAXBAG);}
  kotor=true;
}
function onPesan(ev,p){
  hit.terima++;
  if(!p||typeof p!=='object')return;
  if(ev==='p'){
    const q=tim.get(p.id);if(!q||q.bot)return;
    if(![p.x,p.z,p.vx,p.vz].every(Number.isFinite)||Math.abs(p.x)>120||Math.abs(p.z)>120)return;
    q.tx=p.x;q.tz=p.z;q.vx=klem(p.vx,-14,14);q.vz=klem(p.vz,-14,14);q.c=ang(p.c,0,3)?p.c:0;
    const a=p.a===1?1:0;if(a!==q.a){q.a=a;q.siap=0;}
    if(!q.tMsg||Math.hypot(q.tx-q.x,q.tz-q.z)>8){q.x=p.x;q.z=p.z;}
    q.tMsg=performance.now();
  }else if(ev==='d'){
    if(!ang(p.r,0,BABAK.length)||p.r!==st.r||!Array.isArray(p.c)||st.r>=BABAK.length)return;
    const L=[];for(const e of p.c){if(Array.isArray(e)&&ang(e[0],0,st.c.length-1)&&ang(e[1],-MAXBAG,MAXBAG))L.push(e);}
    terapDelta(L);tDelta=performance.now();ubahSt=true;
  }else if(ev==='st'){
    if(!valid(p.s))return;const s=p.s;
    if(s.r>st.r){adopsi(s);}
    else if(s.r===st.r&&s.r<BABAK.length){
      const c=s.c.slice();for(const [i,d] of pend)c[i]=klem(c[i]+d,0,MAXBAG);st.c=c;kotor=true;
      if(s.f===1&&st.f===0){st.f=1;endAt=performance.now()+s.m;hitungMundur=0;}
    }
  }else if(ev==='siap'){
    const q=tim.get(p.id);if(q&&!q.bot)q.siap=p.v?1:0;
  }else if(ev==='kunci'){
    if(!ang(p.r,0,BABAK.length-1)||p.r!==st.r||!cValid(p.r,p.c)||!ang(p.w,0,1000))return;
    kunciBabak(p.c,p.w);
  }else if(ev==='mulai'){
    if(p.r===st.r&&st.f===0&&!hitungMundur&&!selesai(st))mulaiHitung();
  }else if(ev==='minta'){
    if(otoritas())setTimeout(()=>{flush();stKirim();},100+Math.random()*400);
    /* pendatang belum tahu posisi kita: kirim satu sinyal posisi */
    setTimeout(()=>kirimPosisi(true),200+Math.random()*800);
  }else if(ev==='emo'){
    const q=tim.get(p.id);if(q&&(p.k===1||p.k===2))q.emo={k:p.k,t:performance.now()};
  }else if(ev==='ro'){
    if(typeof p.t==='string'&&TIM.some(t=>t.id===p.t)&&ang(p.n,0,99)){
      const m=[];if(Array.isArray(p.m))for(const e of p.m.slice(0,12)){if(Array.isArray(e)&&typeof e[0]==='string'&&e[0].length<=12&&typeof e[1]==='string'&&/^[0-9]{6}$/.test(e[2]))m.push([e[0],e[1].slice(0,12),e[2]]);}
      papanData[p.t]={n:p.n,s:ang(p.s,0,100)?p.s:null,r:ang(p.r,0,3)?p.r:0,m,t:performance.now()};gambarPapan();selaraskanLuar();
    }
  }
}
function adopsi(s){
  const lama=st.r;st={r:s.r,c:s.c.slice(),sr:s.sr.map(x=>x.slice()),w:s.w.slice(),f:s.f};pend.clear();
  if(s.f===1)endAt=performance.now()+s.m;
  hitungMundur=0;
  if(st.r!==lama){me.carry=0;me.siap=0;for(const p of anggota())p.siap=0;}
  aturArena();kotor=true;
  if(selesai(st)&&me.a===1)bukaHasil();
}
function stKirim(){
  kirim('st',{s:{...st,m:st.f===1?Math.max(0,Math.round(endAt-performance.now())):undefined}});tStKirim=performance.now();
}
function flush(){
  if(!pend.size)return;
  kirim('d',{r:st.r,c:[...pend]});pend.clear();tFlush=performance.now();
}
function mulaiHitung(){hitungMundur=performance.now()+3000;toast('Bersiap...');}
function kunciBabak(c,w){
  const r=st.r,h=skorRonde(r,c,w);
  st.sr.push(c.slice());st.w.push(w);st.r++;st.f=0;st.c=st.r<BABAK.length?Array(BABAK[st.r]).fill(0):[];
  pend.clear();me.carry=0;me.siap=0;for(const p of anggota())p.siap=0;hitungMundur=0;
  aturArena();kotor=true;
  if(me.a===1)tampilRev(r,c,w,h);
  if(selesai(st)){laporPapan(true);}
}
/* tampilan dinding dan rintangan untuk babak aktif; kurva hanya dibuka setelah semua babak selesai */
function aturArena(){
  const r=Math.min(st.r,BABAK.length-1),k=kurvaBabak(r),a=aturanBabak(r);
  arena.setBabak({n:BABAK[r],xs:titikX(r),rumus:k.tx,aturan:'Tinggi kolom = nilai y di '+a.tx+' kolom',fKurva:selesai(st)?k.f:null});
  arena.setRintangan(rintanganBabak(r));
}

/* ---------- anggaran pesan ---------- */
/* Semua pesan dihitung sekali saat dikirim dan sekali per penerima. Satu tim berisi M orang yang saling bicara
   menghasilkan M*M*laju pesan. Jeda diatur dari jumlah pemain seluruh ruang (laporan papan) dan ukuran tim. */
function ntot(){
  if(sim.on)return 40;
  let n=1+anggota().length;const now=performance.now();
  for(const t in papanData){if(t===saya.tim)continue;if(now-papanData[t].t<70000)n+=papanData[t].n;}
  return n;
}
function ukuranTim(){return sim.on?5:1+anggota().length;}
const jedaPos=()=>klem(ntot()*ukuranTim()/50*1000,300,4000);
const jedaFlush=()=>klem(ntot()*ukuranTim()/60*1000,600,3000);

/* ---------- papan skor ---------- */
function gambarPapan(){
  const g=papan.c.getContext('2d'),W=640,H=400;
  g.fillStyle='#fff6e4';g.fillRect(0,0,W,H);g.strokeStyle='#1c2230';g.lineWidth=10;g.strokeRect(5,5,W-10,H-10);
  g.fillStyle='#1c2230';g.font='800 32px "Bricolage Grotesque","Arial Black",sans-serif';g.textAlign='left';g.textBaseline='middle';
  g.fillText('Papan skor · Pos 1',24,38);
  const now=performance.now(),baris=[];
  for(const t of TIM){
    let d=papanData[t.id];
    if(saya&&t.id===saya.tim)d={n:1+anggota().length,s:skorTim(st),r:st.r};
    else if(!d||now-d.t>70000)d=null;
    if(d&&d.n>0)baris.push({t,d});
  }
  baris.sort((a,b)=>(b.d.s??-1)-(a.d.s??-1)||b.d.n-a.d.n);
  g.font='700 24px "Chakra Petch","Trebuchet MS",sans-serif';
  if(!baris.length){g.fillText('Menunggu tim...',24,120);}
  baris.slice(0,8).forEach(({t,d},i)=>{
    const y=84+i*40;
    g.fillStyle=t.warna;g.fillRect(24,y-14,28,28);g.strokeStyle='#1c2230';g.lineWidth=3;g.strokeRect(24,y-14,28,28);
    g.fillStyle='#1c2230';g.textAlign='left';g.fillText('Tim '+t.nama,66,y);
    g.fillText(d.n+' org',300,y);
    g.textAlign='right';g.fillText(d.s!=null?String(d.s):(d.r>0?'babak '+(d.r+1):'belum'),W-28,y);
  });
  papan.tx.needsUpdate=true;
}
function laporPapan(paksa){
  if(!rt||!otoritas())return;
  const ang2=anggota(),n=1+ang2.length,s=skorTim(st),key=n+'/'+s+'/'+st.r+'/'+ang2.map(p=>p.id).sort().join(','),now=performance.now();
  if(!paksa&&key===lastLapor&&now-tLapor<15000)return;
  lastLapor=key;tLapor=now;kirim('ro',{t:saya.tim,n,s,r:Math.min(st.r,3),m:[[saya.id,saya.nama,kodeAv(saya.av)],...ang2.slice(0,11).map(p=>[p.id,p.nama,kodeAv(p.av)])]});
}

/* Tim lain: roster nyata dari papan, tetapi gerakannya simulasi lokal karena posisi asli seluruh kelas melampaui batas pesan. */
function selaraskanLuar(){
  if(!saya)return;
  const now=performance.now(),ada=new Set();
  for(const t in papanData){
    const d=papanData[t];if(t===saya.tim||now-d.t>70000)continue;
    for(const [id,nama,av] of d.m){
      if(id===saya.id)continue;ada.add(id);
      if(!luar.has(id)){
        const p=pemainBaru({id,nama,tim:t,av},true);tim.delete(id);p.amb=true;luar.set(id,p);
        const a=Math.random()*Math.PI*2,r=4+Math.random()*13;p.x=Math.cos(a)*r;p.z=Math.sin(a)*r;
      }
    }
  }
  for(const [id,p] of luar)if(!ada.has(id)){buangAv(p.grp);luar.delete(id);}
}

/* ---------- kamera ---------- */
const PRE=[{n:'Ikuti',p:.62,d:19},{n:'Atas',p:1.15,d:25},{n:'Dekat',p:.33,d:9},{n:'Orang pertama',p:.05,d:0}];
let preI=0;
const C={yaw:0,p:.62,d:19,tp:.62,td:19};
function setPre(i){preI=i%PRE.length;C.tp=PRE[preI].p;C.td=PRE[preI].d;$('b-kam').textContent=PRE[preI].n;if(PRE[preI].d===0)C.p=C.tp;}
$('b-kam').addEventListener('click',()=>setPre(preI+1));
const fp=()=>C.td===0;
function putar(dx,dy){
  C.yaw-=dx*.006;
  const lo=fp()?-.6:.12,hi=fp()?.9:1.4;
  C.tp=klem(C.tp+dy*.005,lo,hi);C.p=C.tp;
}
function zoom(f){if(fp()){if(f>1){C.td=6;$('b-kam').textContent='Bebas';}return;}C.td=klem(C.td*f,5,32);$('b-kam').textContent='Bebas';}

/* ---------- boost dari koin: dipilih sebelum babak, berlaku satu babak, efeknya lokal ---------- */
const BOOST={s:{n:'Sepatu roket',k:5,d:'Lari 1,5x'},t:{n:'Tangan raksasa',k:8,d:'Bawa 3 balok'},p:{n:'Perisai',k:6,d:'Kebal 1 tabrakan'},g:{n:'Gudang cepat',k:6,d:'Isi balok 2x'}};
let boostPilih=null,boostAktif=null,koinPakai=+(localStorage.getItem('ki-pakai')||0)||0,boostKey='';
const saldo=()=>Math.max(0,koinAmbil.size-koinPakai);
const capNow=()=>boostAktif==='t'?3:CAP;
function pakaiBoost(){
  boostAktif=null;
  if(boostPilih&&saldo()>=BOOST[boostPilih].k){koinPakai+=BOOST[boostPilih].k;try{localStorage.setItem('ki-pakai',String(koinPakai));}catch(e){}boostAktif=boostPilih;}
  boostPilih=null;boostKey='';
}
function boostUI(){
  const box=$('boost'),tampil=me.a===1&&st.f===0&&!selesai(st)&&$('roda').hidden;
  box.hidden=!tampil;
  const kunci=tampil+'|'+boostPilih+'|'+saldo();
  $('ar-boost').textContent=boostAktif?BOOST[boostAktif].n:(boostPilih?BOOST[boostPilih].n+' (siap)':'-');
  if(!tampil||kunci===boostKey)return;boostKey=kunci;
  box.textContent='';
  const j=document.createElement('div');j.className='bj';j.textContent='Boost satu babak (koin '+saldo()+')';box.append(j);
  for(const k in BOOST){
    const o=BOOST[k],b=document.createElement('button');b.type='button';b.className='btn alt';b.disabled=saldo()<o.k;
    b.setAttribute('aria-pressed',String(boostPilih===k));b.textContent=o.n+' '+o.k+'k';b.title=o.d;
    b.addEventListener('click',()=>{boostPilih=boostPilih===k?null:k;boostKey='';boostUI();});box.append(b);
  }
}
/* ---------- koin dan peta mini ---------- */
const _mk=new THREE.Matrix4(),_q=new THREE.Quaternion(),_p=new THREE.Vector3(),_s=new THREE.Vector3(1,1,1),_e=new THREE.Euler();
function koinSembunyi(i){_mk.makeScale(0,0,0);koinMesh.setMatrixAt(i,_mk);koinMesh.instanceMatrix.needsUpdate=true;}
function koinPutar(t){
  for(let i=0;i<KOIN_N;i++){
    if(koinAmbil.has(i)){continue;}
    _p.set(koinPos[i].x,1.1+Math.sin(t*2+i)*.15,koinPos[i].z);_e.set(0,t*2+i,0);_q.setFromEuler(_e);_mk.compose(_p,_q,_s);koinMesh.setMatrixAt(i,_mk);
  }
  koinMesh.instanceMatrix.needsUpdate=true;
}
for(const i of koinAmbil)koinSembunyi(i);
const miniCv=$('peta'),miniX=miniCv.getContext('2d');let tMini=0;
function petaMini(t){
  $('c-koin').textContent='Koin '+saldo()+' (terkumpul '+jmlKoin()+'/'+KOIN_N+')';
  $('stam-i').style.width=stam+'%';
  if(t-tMini<.1)return;tMini=t;
  const W=miniCv.width,H=miniCv.height,R=48,k=W/2/R,cx=W/2,cy=H/2,cy0=Math.cos(C.yaw),sy0=Math.sin(C.yaw);
  /* dunia ke peta: putar agar arah kamera ke atas */
  const P=(x,z)=>{const dx=x-me.x,dz=z-me.z;return [cx+(cy0*dx-sy0*dz)*k,cy+(sy0*dx+cy0*dz)*k];};
  miniX.clearRect(0,0,W,H);miniX.save();miniX.beginPath();miniX.arc(cx,cy,W/2-2,0,7);miniX.clip();
  miniX.fillStyle='#78b85a';miniX.fillRect(0,0,W,H);
  let [px,py]=P(0,0);miniX.fillStyle='#ffe2b5';miniX.beginPath();miniX.arc(px,py,21*k,0,7);miniX.fill();
  ZP.forEach((z,i)=>{[px,py]=P(z.x,z.z);miniX.fillStyle='#'+ZONA[i].tanah.toString(16).padStart(6,'0');miniX.beginPath();miniX.arc(px,py,26*k,0,7);miniX.fill();
    miniX.fillStyle=gerbang[i].aktif?'#ff6f47':'#7d8792';miniX.fillRect(px-3,py-3,6,6);});
  miniX.fillStyle='#e6a800';for(let i=0;i<KOIN_N;i++){if(koinAmbil.has(i))continue;[px,py]=P(koinPos[i].x,koinPos[i].z);if(Math.hypot(px-cx,py-cy)<W/2)miniX.fillRect(px-1.5,py-1.5,3,3);}
  miniX.fillStyle='#2b6cff';for(const p of tim.values()){if(p.a!==0||p.id===saya.id)continue;[px,py]=P(p.x,p.z);miniX.beginPath();miniX.arc(px,py,3,0,7);miniX.fill();}
  {const g=gerbang[0];[px,py]=P(g.x,g.z);const dd=Math.hypot(px-cx,py-cy),ed=W/2-9;
   if(dd>ed){px=cx+(px-cx)/dd*ed;py=cy+(py-cy)/dd*ed;}
   miniX.fillStyle='#ff6f47';miniX.strokeStyle='#fff';miniX.lineWidth=2;miniX.beginPath();miniX.arc(px,py,7,0,7);miniX.fill();miniX.stroke();
   miniX.fillStyle='#fff';miniX.font='bold 9px sans-serif';miniX.textAlign='center';miniX.fillText('1',px,py+3);}
  miniX.restore();
  miniX.fillStyle='#e8412c';miniX.beginPath();miniX.moveTo(cx,cy-6);miniX.lineTo(cx-5,cy+5);miniX.lineTo(cx+5,cy+5);miniX.fill();
  miniX.strokeStyle='#1c2230';miniX.lineWidth=2;miniX.beginPath();miniX.arc(cx,cy,W/2-2,0,7);miniX.stroke();
}
/* ---------- masukan ---------- */
let stam=100,larian=false,btnLari=false;
const key={w:0,a:0,s:0,d:0,q:0,e:0,sh:0},joy={x:0,y:0,id:null,ox:0,oy:0};
const peta={KeyW:'w',ArrowUp:'w',KeyA:'a',ArrowLeft:'a',KeyS:'s',ArrowDown:'s',KeyD:'d',ArrowRight:'d',KeyQ:'q',KeyE:'e',ShiftLeft:'sh',ShiftRight:'sh'};
let tahan=false;
addEventListener('keydown',e=>{
  if(e.target.tagName==='INPUT'||!mulai||blok())return;
  const k=peta[e.code];
  if(k){key[k]=1;e.preventDefault();}
  else if(e.code==='KeyF'||e.code==='Enter'){if(!e.repeat)aksiMulai();e.preventDefault();}
  else if(e.code==='Space'){emote(1);e.preventDefault();}
  else if(e.code==='KeyZ')emote(2);
  else if(e.code==='KeyC')setPre(preI+1);
});
addEventListener('keyup',e=>{const k=peta[e.code];if(k)key[k]=0;if(e.code==='KeyF'||e.code==='Enter')aksiAkhir();});
addEventListener('blur',()=>{for(const k in key)key[k]=0;tahan=false;});
const ptr=new Map();
cv.addEventListener('pointerdown',e=>{
  if(!mulai||blok())return;
  cv.setPointerCapture(e.pointerId);
  let mode='cam';
  if(e.pointerType!=='mouse'&&e.clientX<innerWidth*.45&&joy.id===null){
    mode='joy';joy.id=e.pointerId;joy.ox=e.clientX;joy.oy=e.clientY;joy.x=joy.y=0;
    const j=$('joy');j.hidden=false;j.style.left=e.clientX+'px';j.style.top=e.clientY+'px';j.firstElementChild.style.transform='';
  }
  ptr.set(e.pointerId,{x:e.clientX,y:e.clientY,mode});
});
cv.addEventListener('pointermove',e=>{
  const p=ptr.get(e.pointerId);if(!p)return;
  if(p.mode==='joy'){
    let dx=e.clientX-joy.ox,dy=e.clientY-joy.oy;const d=Math.hypot(dx,dy),R=50;
    if(d>R){dx*=R/d;dy*=R/d;}
    joy.x=dx/R;joy.y=dy/R;$('joy').firstElementChild.style.transform='translate('+dx+'px,'+dy+'px)';
    return;
  }
  const lain=[...ptr.entries()].find(([id,q])=>id!==e.pointerId&&q.mode==='cam');
  if(lain){
    const q=lain[1],dl=Math.hypot(p.x-q.x,p.y-q.y),dn=Math.hypot(e.clientX-q.x,e.clientY-q.y);
    if(dl>20&&dn>20)zoom(dl/dn);
  }else putar(e.clientX-p.x,e.clientY-p.y);
  p.x=e.clientX;p.y=e.clientY;
});
const lepas=e=>{const p=ptr.get(e.pointerId);if(!p)return;ptr.delete(e.pointerId);if(p.mode==='joy'){joy.id=null;joy.x=joy.y=0;$('joy').hidden=true;}};
cv.addEventListener('pointerup',lepas);cv.addEventListener('pointercancel',lepas);
cv.addEventListener('wheel',e=>{if(!mulai)return;e.preventDefault();zoom(Math.exp(e.deltaY*.0012));},{passive:false});

/* ---------- emote ---------- */
function emote(k){
  const now=performance.now();if(me.emo&&now-me.emo.t<700)return;
  me.emo={k,t:now};kirim('emo',{id:saya.id,k});
}
$('b-lompat').addEventListener('click',()=>emote(1));
$('b-pos1').addEventListener('click',()=>{if(me.a!==0||blok())return;const g=gerbang[0];me.x=g.ax;me.z=g.az;me.vx=me.vz=0;kirimPosisi();toast('Sampai di gerbang Pos 1. Tekan Masuk Pos 1.');});
{const b=$('b-lari'),on=e=>{btnLari=true;e.preventDefault();},off=()=>{btnLari=false;};
 b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointercancel',off);b.addEventListener('pointerleave',off);}

/* ---------- arena dan aksi ---------- */
function setArea(a){
  me.a=a;arena.grup.visible=a===1;lobiGrup.visible=a===0;rumput.position.y=a===1?-.45:0;
  $('arhud').hidden=a!==1;$('peta').hidden=a!==0;$('c-koin').hidden=a!==0;$('b-pos1').hidden=a!==0;$('stam').hidden=a!==0;$('b-lari').hidden=a!==0;$('b-keluar').hidden=a!==1;$('b-lompat').hidden=false;
  me.siap=0;kirim('siap',{id:saya.id,v:0});
  if(a===1){
    me.x=0;me.z=12;me.vx=me.vz=0;C.yaw=0;
    aturArena();arena.setWarna(timById(saya.tim).warna);
    kotor=true;toast(selesai(st)?'Pos 1 sudah selesai.':(st.f===1?'Babak sedang berjalan. Hitung tinggi kolom dari rumus di dinding.':'Semua berdiri di pad hijau untuk mulai.'));
    if(selesai(st))bukaHasil();
  }else{
    boostAktif=null;boostPilih=null;boostKey='';me.carry=0;const g=gerbang[0];me.x=g.ax;me.z=g.az;me.vx=me.vz=0;$('hitung').hidden=true;
  }
  kirimPosisi(true);
}
$('b-keluar').addEventListener('click',()=>{if(me.a===1){flush();setArea(0);}});
$('w-tutup').addEventListener('click',()=>{$('hasil').hidden=true;hasilBuka=false;if(me.a===1)setArea(0);});
function bukaHasil(){
  if(hasilBuka)return;
  const t=$('w-tabel');t.textContent='';
  const head=t.insertRow();for(const h of ['Babak','Kurva','Titik','Taksiran','Luas asli','Skor']){const th=document.createElement('th');th.textContent=h;head.append(th);}
  st.sr.forEach((c,i)=>{
    const r=skorRonde(i,c,st.w[i]),row=t.insertRow();
    [i+1,kurvaBabak(i).tx,aturanBabak(i).tx.replace('titik ',''),r.luas.toFixed(2),r.asli.toFixed(2),r.skor].forEach(v=>row.insertCell().textContent=v);
  });
  $('w-skor').textContent=String(skorTim(st));
  $('hasil').hidden=false;hasilBuka=true;key.w=key.a=key.s=key.d=0;joy.x=joy.y=0;tahan=false;
}

/* ---------- roda kurva ---------- */
const PALET=['#ffc83d','#7bd38a','#6fb7e9','#f29ab8','#ff9a62','#b9a2f0'];
function bukaRoda(r){
  rodaR=r;rodaBuka=true;key.w=key.a=key.s=key.d=0;joy.x=joy.y=0;tahan=false;
  $('roda').hidden=false;$('roda-ok').hidden=true;$('roda-p').textContent='';
  $('roda-h').textContent='Roda kurva babak '+(r+1);
  const cvr=$('roda-cv'),g=cvr.getContext('2d'),N=KURVA.length,seg=Math.PI*2/N,idx=RENCANA[r].k;
  const akhir=Math.PI*2*5-(idx+.5)*seg+(Math.random()-.5)*seg*.5,t0=performance.now(),D=3800;
  let selesaiAnim=false;
  const tutup=()=>{if(!rodaBuka)return;rodaBuka=false;$('roda').hidden=true;};
  $('roda-ok').onclick=tutup;
  function gambar(th){
    const W=cvr.width,cx=W/2,cy=W/2,R=W/2-14;
    g.clearRect(0,0,W,W);
    for(let i=0;i<N;i++){
      const a0=i*seg+th-Math.PI/2,a1=a0+seg;
      g.beginPath();g.moveTo(cx,cy);g.arc(cx,cy,R,a0,a1);g.closePath();g.fillStyle=PALET[i%PALET.length];g.fill();
      g.lineWidth=4;g.strokeStyle='#1c2230';g.stroke();
      g.save();g.translate(cx,cy);g.rotate(a0+seg/2);g.textAlign='right';g.textBaseline='middle';g.fillStyle='#1c2230';
      g.font='700 22px "Chakra Petch",sans-serif';g.fillText(KURVA[i].tx,R-16,0);g.restore();
    }
    g.beginPath();g.arc(cx,cy,26,0,Math.PI*2);g.fillStyle='#fff6e4';g.fill();g.lineWidth=4;g.stroke();
    g.beginPath();g.moveTo(cx-16,6);g.lineTo(cx+16,6);g.lineTo(cx,40);g.closePath();g.fillStyle='#e5392b';g.fill();g.lineWidth=3;g.stroke();
  }
  function langkah(){
    const k=Math.min(1,(performance.now()-t0)/D),e=1-Math.pow(1-k,3);
    gambar(akhir*e);
    if(k<1)requestAnimationFrame(langkah);
    else if(!selesaiAnim){
      selesaiAnim=true;
      $('roda-p').textContent=kurvaBabak(r).tx+'. Tinggi kolom = nilai y di '+aturanBabak(r).tx+' tiap kolom. Satu balok = 0,5.';
      $('roda-ok').hidden=false;setTimeout(tutup,3500);
    }
  }
  langkah();
}

/* ---------- ulasan babak setelah dikunci ---------- */
function tampilRev(r,c,w,h){
  revBuka=true;key.w=key.a=key.s=key.d=0;joy.x=joy.y=0;tahan=false;
  $('rev-h').textContent='Babak '+(r+1)+' terkunci: skor '+h.skor;
  const k=kurvaBabak(r),n=c.length;
  gambarMini($('rev-cv'),c,timById(saya.tim).warna,k.f);
  const L=[['Kurva',k.tx],['Titik contoh',aturanBabak(r).tx.replace('titik ','')],['Taksiran luas (jumlah balok)',h.luas.toFixed(2)],['Luas sebenarnya',h.asli.toFixed(2)],
    ['Selisih',(h.selisih>=0?'+':'')+h.selisih.toFixed(2)],['Ketepatan tinggi',h.akurasi+' / 100'],['Sisa waktu',Math.round(w/10)+'%']];
  const box=$('rev-t');box.textContent='';
  for(const [a,b] of L){const d=document.createElement('div');d.className='r';const s1=document.createElement('span'),s2=document.createElement('span');s1.textContent=a;s2.textContent=b;d.append(s1,s2);box.append(d);}
  const kt=aturanBabak(r).tx;
  $('rev-p').textContent=kt==='titik kiri'?'Titik kiri pada kurva naik memberi taksiran kurang dari luas sebenarnya (jumlah bawah).':kt==='titik kanan'?'Titik kanan pada kurva naik memberi taksiran lebih dari luas sebenarnya (jumlah atas). Pada kurva turun, hasilnya terbalik.':'Titik tengah biasanya paling dekat dengan luas sebenarnya.';
  $('rev').hidden=false;
  $('rev-ok').onclick=()=>{revBuka=false;$('rev').hidden=true;if(selesai(st))bukaHasil();};
}
let tAksi=0;
function aksiMulai(){
  if(!me||blok())return;
  if(me.a===0){if(!$('aksi').hidden)setArea(1);}else tahan=true;
}
let modeAksi=0; /* 1 = taruh, 2 = ambil kembali; ditentukan saat tombol mulai ditahan */
function aksiAkhir(){tahan=false;modeAksi=0;}
{
  const b=$('aksi');
  b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);aksiMulai();});
  b.addEventListener('pointerup',aksiAkhir);b.addEventListener('pointercancel',aksiAkhir);b.addEventListener('lostpointercapture',aksiAkhir);
  b.addEventListener('contextmenu',e=>e.preventDefault());
}
function ubahKolom(col,d){
  st.c[col]=klem(st.c[col]+d,0,MAXBAG);pend.set(col,(pend.get(col)||0)+d);
  if(pend.get(col)===0)pend.delete(col);
  tDelta=performance.now();ubahSt=true;kotor=true;
}
function aksiTick(now,col){
  if(!tahan){modeAksi=0;return;}
  if(now-tAksi<180||selesai(st)||col<0)return;
  if(!modeAksi)modeAksi=me.carry>0?1:2;
  if(modeAksi===1){
    if(me.carry>0&&st.c[col]<MAXBAG){me.carry--;ubahKolom(col,1);tAksi=now;}
  }else if(me.carry<capNow()&&st.c[col]>0){me.carry++;ubahKolom(col,-1);tAksi=now;}
}

/* ---------- kualitas dan audit ---------- */
const KUAL=[{n:'tinggi',pr:2},{n:'sedang',pr:1},{n:'rendah',pr:.7}];
let kual=0;
function terapKual(){
  const k=KUAL[kual];renderer.setPixelRatio(Math.min(devicePixelRatio||1,k.pr));
  pohon.visible=kual<2;scene.fog=kual<2?new THREE.Fog(0x9fd4ee,80,210):null;ukur();
}
function ukur(){renderer.setSize(innerWidth,innerHeight,false);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();}
addEventListener('resize',ukur);
const aud={n:0,t:0,min:999,fps:0,fmin:0,ping:null,pings:[],lambat:0,riwayat:[]};
function auditTick(dt){
  aud.n++;aud.t+=dt;const f=1/Math.max(dt,1e-4);if(f<aud.min)aud.min=f;
  if(aud.t>=2){
    aud.fps=aud.n/aud.t;aud.fmin=aud.min;hit.kps=hit.kirim/aud.t;hit.tps=hit.terima/aud.t;hit.kirim=hit.terima=0;
    aud.riwayat.push(Math.round(aud.fps));if(aud.riwayat.length>30)aud.riwayat.shift();
    if(aud.fps<27&&!document.hidden){if(++aud.lambat>=2&&kual<KUAL.length-1){kual++;aud.lambat=0;terapKual();toast('Kualitas diturunkan ke '+KUAL[kual].n+' agar lancar.');}}else aud.lambat=0;
    aud.n=0;aud.t=0;aud.min=999;
    if(!$('audit').hidden)isiAudit();
  }
}
const beban=()=>ntot()*(hit.kps+hit.tps);
function nPemain(){let o=me?1:0,b=0;for(const p of tim.values())p.bot?b++:o++;return {o,b};}
function isiAudit(){
  const n=nPemain();
  $('a-fps').textContent=aud.fps?aud.fps.toFixed(0):'-';$('a-min').textContent=aud.fmin?aud.fmin.toFixed(0):'-';
  $('a-ping').textContent=rt&&rt.mode==='luring'?'tanpa server':(aud.ping!=null?aud.ping.toFixed(0)+' ms':'-');
  $('a-n').textContent=n.o+' orang'+(n.b?' + '+n.b+' bot':'')+' (kelas ~'+ntot()+')';
  $('a-mode').textContent=rt?rt.mode:'-';$('a-q').textContent=KUAL[kual].n;
  $('a-msg').textContent=hit.kps.toFixed(1)+' / '+hit.tps.toFixed(1)+' per dtk';
  $('a-jeda').textContent=Math.round(jedaPos())+' / '+Math.round(jedaFlush())+' ms';
  $('a-beban').textContent=beban().toFixed(0)+' dari 100 per dtk';
}
function laporan(){
  const n=nPemain(),r=aud.riwayat,avg=r.length?Math.round(r.reduce((a,b)=>a+b,0)/r.length):0,pg=aud.pings;
  return ['LAPORAN AUDIT LOBI INTEGRAL v2',
    'Waktu: '+new Date().toLocaleString('id-ID'),
    'Nama/tim/ruang: '+saya.nama+' / '+saya.tim+' / '+saya.kode,
    'Karakter: '+kodeAv(saya.av),
    'Perangkat: '+navigator.userAgent,
    'Layar: '+innerWidth+'x'+innerHeight+' @'+(devicePixelRatio||1),
    'Mode: '+(rt?rt.mode:'-')+', kualitas akhir: '+KUAL[kual].n+', kamera: '+PRE[preI].n,
    'FPS rata-rata (1 menit terakhir): '+avg+', terendah per jendela: '+(r.length?Math.min(...r):0),
    'Ping: '+(pg.length?('rata '+Math.round(pg.reduce((a,b)=>a+b,0)/pg.length)+' ms, maks '+Math.round(Math.max(...pg))+' ms, sampel '+pg.length):'tidak ada'),
    'Pemain: '+n.o+' orang, '+n.b+' bot, perkiraan kelas '+ntot()+(sim.on?' (simulasi)':''),
    'Pesan kirim/terima per detik: '+hit.kps.toFixed(1)+' / '+hit.tps.toFixed(1),
    'Jeda posisi/kirim aksi: '+Math.round(jedaPos())+' / '+Math.round(jedaFlush())+' ms',
    'Perkiraan beban proyek: '+beban().toFixed(0)+' dari 100 pesan per detik',
    'Pos 1: babak '+Math.min(st.r+1,3)+', skor tim '+(skorTim(st)!=null?skorTim(st):'belum')].join('\n');
}
$('b-audit').addEventListener('click',()=>{$('audit').hidden=!$('audit').hidden;isiAudit();});
$('a-sim').addEventListener('change',e=>{sim.on=e.target.checked;isiAudit();});
$('a-bot').addEventListener('click',()=>{for(let i=0;i<20;i++)pemainBaru({id:'bot'+Math.random().toString(36).slice(2,8),nama:'Bot '+(i+1),tim:saya.tim,av:kodeAv(acakAv())},true);isiAudit();});
$('a-nobot').addEventListener('click',()=>{for(const [id,p] of tim)if(p.bot)hapusPemain(id);isiAudit();});
$('a-salin').addEventListener('click',async()=>{
  const t=laporan(),ta=$('a-lap');ta.value=t;ta.hidden=false;
  try{await navigator.clipboard.writeText(t);toast('Laporan disalin. Tempel ke chat atau catatan.');}catch(e){ta.select();toast('Salin manual dari kotak di panel audit.');}
});
let toastT=0;
function toast(s){const t=$('ltoast');t.textContent=s;t.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>{t.hidden=true;},2800);}

/* ---------- HUD arena ---------- */
function isiArena(){
  const r=Math.min(st.r,BABAK.length-1),c=selesai(st)?st.sr[BABAK.length-1]:st.c,k=kurvaBabak(r);
  $('ar-babak').textContent=selesai(st)?'Selesai':'Babak '+(r+1)+'/3 · '+BABAK[r]+' kolom';
  $('ar-bawa').textContent='Bawa '+me.carry+'/'+capNow();
  $('ar-rumus').textContent=k.tx;$('ar-titik').textContent=aturanBabak(r).tx.replace('titik ','');
  $('ar-total').textContent=jumlah(c)+' balok';
  gambarMini($('mini'),c,timById(saya.tim).warna,selesai(st)?k.f:null);
}
function isiWaktu(now){
  let s='-';
  if(selesai(st))s='selesai';
  else if(st.f===0)s=hitungMundur?String(Math.max(1,Math.ceil((hitungMundur-now)/1000))):'siap';
  else{const d=Math.max(0,Math.ceil((endAt-now)/1000));s=Math.floor(d/60)+':'+String(d%60).padStart(2,'0');}
  $('ar-waktu').textContent=s;
  const hm=$('hitung');
  if(hitungMundur&&st.f===0){hm.hidden=false;hm.textContent=String(Math.max(1,Math.ceil((hitungMundur-now)/1000)));}
  else hm.hidden=true;
}
function isiSiap(){
  const L=[me,...anggota().filter(p=>p.a===1)].filter(p=>p.a===1);
  $('ar-siap').textContent=L.filter(p=>p.siap).length+'/'+L.length;
}

/* ---------- masuk ---------- */
$('b-masuk').addEventListener('click',()=>{
  const nama=$('in-nama').value.trim(),kode=$('in-kode').value.trim().toUpperCase().replace(/[^A-Z0-9-]/g,'');
  if(!nama||!kode){$('m-msg').textContent='Isi nama dan kode ruang.';return;}
  profil.nama=nama;simpanProfil();
  let id=null;try{id=sessionStorage.getItem('ki-id');}catch(e){}
  if(!id){id=Math.random().toString(36).slice(2,10);try{sessionStorage.setItem('ki-id',id);}catch(e){}}
  saya={id,nama,tim:profil.tim,kode,av:{...profil.av}};
  const t=timById(saya.tim);
  me=pemainBaru0();
  $('masuk').hidden=true;$('lhud').hidden=false;
  if(prev.r){prev.on=false;prev.r.dispose();prev.r.forceContextLoss&&prev.r.forceContextLoss();}
  $('c-ruang').textContent='Ruang '+kode;
  const ct=$('c-tim');ct.textContent='';const sw=document.createElement('span');sw.className='sw';sw.style.background=t.warna;ct.append(sw,'Tim '+t.nama);
  setSeed(kode+'|'+saya.tim);arena.setWarna(t.warna);aturArena();
  tGabung=performance.now();
  rt=sambung(kode,{id:saya.id,nama:saya.nama,tim:saya.tim,av:kodeAv(saya.av)},{
    status:s=>{
      if(s==='daring'||s==='luring'){
        if(s==='luring'&&!Q.has('lokal'))toast('Server tidak terjangkau. Mode luring: hanya antar-tab di perangkat ini.');
        setTimeout(()=>{kirim('minta',{id:saya.id});kirimPosisi(true);},500);
      }else if(s==='putus')toast('Koneksi terputus. Muat ulang halaman untuk masuk lagi.');
      isiAudit();
    },hadir:onHadir,pesan:onPesan},Q.has('lokal'));
  setInterval(async()=>{if(!rt||rt.mode!=='daring'||document.hidden)return;const p=await rt.ping();if(p!=null){aud.ping=p;aud.pings.push(p);if(aud.pings.length>60)aud.pings.shift();}},8000);
  setInterval(()=>{laporPapan(false);gambarPapan();selaraskanLuar();const ct=$('c-tim');if(ct.lastChild)ct.lastChild.textContent='Tim '+timById(saya.tim).nama+' · '+(1+anggota().length);},1500);
  mulai=true;gambarPapan();setPre(0);$('b-lompat').hidden=false;$('peta').hidden=false;$('c-koin').hidden=false;$('b-pos1').hidden=false;toast('Pos 1 ada di titik oranye pada peta mini. Atau tekan Ke Pos 1.');$('stam').hidden=false;$('b-lari').hidden=false;
  toast('Geser layar kiri untuk berjalan, geser kanan untuk memutar kamera. Dekati gerbang Pos 1.');
});
function pemainBaru0(){
  const p=pemainBaru({id:saya.id,nama:saya.nama,tim:saya.tim,av:kodeAv(saya.av)},false);
  tim.delete(saya.id);p.x=(Math.random()-.5)*8;p.z=8+Math.random()*4;p.carry=0;return p;
}

/* ---------- posisi: sinyal jarang dengan ekstrapolasi ---------- */
const lalu={x:0,z:0,vx:0,vz:0,t:0,c:0,a:0};
function kirimPosisi(paksa){
  if(!me)return;
  kirim('p',{id:saya.id,x:+me.x.toFixed(1),z:+me.z.toFixed(1),vx:+me.vx.toFixed(1),vz:+me.vz.toFixed(1),a:me.a,c:me.carry});
  lalu.x=me.x;lalu.z=me.z;lalu.vx=me.vx;lalu.vz=me.vz;lalu.t=performance.now();lalu.c=me.carry;lalu.a=me.a;
}
function perluPosisi(now){
  const dt=(now-lalu.t)/1000;
  if(now-lalu.t<jedaPos())return false;
  if(now-lalu.t>15000)return true;
  const px=lalu.x+lalu.vx*dt,pz=lalu.z+lalu.vz*dt;
  return Math.hypot(me.x-px,me.z-pz)>1||Math.hypot(me.vx-lalu.vx,me.vz-lalu.vz)>.8||me.carry!==lalu.c;
}

/* ---------- animasi avatar ---------- */
function animAv(p,dt,t,now){
  const u=p.grp.userData,sp=Math.hypot(p.vx,p.vz),gerak=sp>.3;
  let y=0,spin=0,lompat=0;
  if(p.emo){
    const k=(now-p.emo.t)/700;
    if(k>=1)p.emo=null;else if(p.emo.k===1){y=Math.sin(k*Math.PI)*1.6;lompat=1;}else spin=k*Math.PI*2;
  }
  /* fase langkah maju sebanding dengan kecepatan; saat diam, ayunan mereda ke nol */
  if(gerak)p.ph=(p.ph||0)+dt*sp*1.5;
  const amp=gerak?Math.min(1,sp/6)*.85:0,sw=Math.sin(p.ph||0)*amp,m=u.mesh.userData;
  const k=Math.min(1,dt*14);
  const rel=(o,tg)=>{o.rotation.x+=(tg-o.rotation.x)*k;};
  rel(m.kakiK,lompat?-.5:sw);rel(m.kakiN,lompat?.5:-sw);
  rel(m.lenganK,lompat?0:-sw*.8);rel(m.lenganN,lompat?0:sw*.8);
  m.lenganK.rotation.z+=((lompat?-2.6:0)-m.lenganK.rotation.z)*k;m.lenganN.rotation.z+=((lompat?2.6:0)-m.lenganN.rotation.z)*k;
  const bob=gerak?Math.abs(Math.cos(p.ph||0))*.14*amp/.85:0;
  p.grp.position.set(p.x,y+bob,p.z);
  if(gerak&&!spin){const a=Math.atan2(p.vx,p.vz);let d=a-p.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));p.yaw+=d*Math.min(1,dt*10);}
  u.pivot.rotation.y=p.yaw+spin;
  u.mesh.rotation.z=gerak?Math.sin(p.ph||0)*.05:0;
  u.mesh.scale.y=1+(gerak?0:Math.sin(t*2.2+p.fase)*.015);
  u.ring.position.y=.05-p.grp.position.y;
}

/* ---------- putaran utama ---------- */
const kamP=new THREE.Vector3(),kamL=new THREE.Vector3(),bawaItems=[];
let tLalu=performance.now(),toastGerbang=0,tKiriman=0,tSiap=0,tReda=0;
function frame(now){
  requestAnimationFrame(frame);
  const dt=Math.min(.1,(now-tLalu)/1000);tLalu=now;const t=now/1000;
  if(prev.on&&prev.r&&prev.mesh){
    const el=prev.r.domElement,w=el.clientWidth||150,h=el.clientHeight||190;
    if(w!==prev.w||h!==prev.h){prev.w=w;prev.h=h;prev.r.setSize(w,h,false);prev.cam.aspect=w/h;prev.cam.updateProjectionMatrix();}
    prev.mesh.rotation.y=t*.9;prev.r.render(prev.sc,prev.cam);
  }
  let tx=Math.sin(t*.15)*6,tz=2;
  if(mulai){
    if(key.q)C.yaw+=1.8*dt;if(key.e)C.yaw-=1.8*dt;
    let ix=joy.x+key.d-key.a,iz=joy.y+key.s-key.w;const m=Math.hypot(ix,iz);
    if(m>1){ix/=m;iz/=m;}
    if(blok()||now<stunTil||m<.12){ix=0;iz=0;}
    /* gerak relatif kamera: dorong ke atas berarti maju searah layar */
    const lari=me.a===0&&(key.sh||btnLari)&&stam>(larian?0:25)&&m>=.12;
    if(lari){stam=Math.max(0,stam-30*dt);larian=true;}else{larian=false;stam=Math.min(100,stam+18*dt);}
    const sy=Math.sin(C.yaw),cy=Math.cos(C.yaw),v=SPD*(1-.07*me.carry)*(lari?SPRINT:1)*(boostAktif==='s'?1.5:1);
    me.vx=(cy*ix+sy*iz)*v;me.vz=(-sy*ix+cy*iz)*v;
    me.x+=me.vx*dt;me.z+=me.vz*dt;
    if(me.a===0){const r=Math.hypot(me.x,me.z);if(r>RMAX){me.x*=RMAX/r;me.z*=RMAX/r;}}
    else{me.x=klem(me.x,BATAS.x0,BATAS.x1);me.z=klem(me.z,BATAS.z0,BATAS.z1);}
    animAv(me,dt,t,now);

    /* posisi dan aksi */
    if(perluPosisi(now))kirimPosisi();
    if(pend.size&&now-tFlush>jedaFlush())flush();
    for(const p of tim.values()){
      if(p.bot){
        p.fase+=dt;if(p.fase>3){p.fase=0;const a=Math.random()*Math.PI*2,vv=Math.random()<.3?0:3+Math.random()*3;p.vx=Math.cos(a)*vv;p.vz=Math.sin(a)*vv;}
        p.x+=p.vx*dt;p.z+=p.vz*dt;const rr=Math.hypot(p.x,p.z);if(rr>20){p.vx=-p.x/rr*4;p.vz=-p.z/rr*4;}
        p.a=me.a;
      }else{
        if(now-p.tMsg<20000){p.tx+=p.vx*dt;p.tz+=p.vz*dt;}else{p.vx=p.vz=0;}
        const k=Math.min(1,dt*6);p.x+=(p.tx-p.x)*k;p.z+=(p.tz-p.z)*k;
      }
      p.grp.visible=p.a===me.a;
      if(p.grp.visible)animAv(p,dt,t,now);
    }
    for(const p of luar.values()){
      p.fase+=dt;if(p.fase>3){p.fase=0;const a=Math.random()*Math.PI*2,vv=Math.random()<.4?0:2+Math.random()*2.5;p.vx=Math.cos(a)*vv;p.vz=Math.sin(a)*vv;}
      p.x+=p.vx*dt;p.z+=p.vz*dt;const rr=Math.hypot(p.x,p.z);if(rr>70){p.vx=-p.x/rr*3;p.vz=-p.z/rr*3;}
      p.grp.visible=me.a===0;if(p.grp.visible)animAv(p,dt,t,now);
    }
    me.grp.visible=C.d>2;

    if(me.a===0){
      let dekat=null,dmin=9;
      for(const gt of gerbang){const d=Math.hypot(me.x-gt.x,me.z-gt.z);if(d<dmin){dmin=d;dekat=gt;}if(gt.cincin){const s=1+Math.sin(t*3)*.08;gt.cincin.scale.set(s,s,1);}}
      for(let i=0;i<KOIN_N;i++){
        if(koinAmbil.has(i))continue;
        const kp=koinPos[i];if(Math.abs(me.x-kp.x)<1.3&&Math.abs(me.z-kp.z)<1.3){
          koinAmbil.add(i);koinSembunyi(i);try{localStorage.setItem('ki-koin',JSON.stringify([...koinAmbil]));}catch(e){}
          const n=jmlKoin();let baru='';for(const k in KOIN_KUNCI)for(const j in KOIN_KUNCI[k])if(KOIN_KUNCI[k][j]===n)baru=' Terbuka: '+[TOPI,KACAMATA,AKS,TIPE][['h','g','a','t'].indexOf(k)][j]+' (aktif setelah keluar lalu masuk lagi).';
          toast('Koin '+n+'/'+KOIN_N+'.'+baru);
        }
      }
      koinPutar(t);petaMini(t);
      const dalam=dekat&&dmin<3.4;
      const b=$('aksi');b.hidden=!(dalam&&dekat.aktif&&!blok());b.textContent='Masuk Pos 1';
      if(dalam&&!dekat.aktif&&now-toastGerbang>4000){toastGerbang=now;toast('Pos '+(dekat.i+1)+' ('+dekat.nama+') masih terkunci di prototipe ini.');}
    }else{
      const r=Math.min(st.r,BABAK.length-1),n=BABAK[r],blk=blok(),main=st.f===1&&!selesai(st),tSec=Date.now()/1000;
      const col=main&&now>=stunTil?kolomDari(n,me.x,me.z):-1;
      arena.sorot(col);arena.animRintangan(tSec);
      /* roda kurva di awal tiap babak (hanya jika babak belum berjalan) */
      if(!selesai(st)){
        if(st.f===1)rodaR=st.r;
        else if(!blk&&rodaR!==st.r)bukaRoda(st.r);
      }
      /* rintangan: gelondong menjatuhkan balok, kecuali pemain sedang melompat */
      if(main&&now>=stunTil&&now>=tabrakTil&&!blk){
        const udara=me.emo&&me.emo.k===1&&Math.sin(((now-me.emo.t)/700)*Math.PI)*1.6>.7;
        if(!udara)for(const sp of rintanganBabak(r)){
          if(Math.abs(me.x-xRint(sp,tSec))<RINT_R&&Math.abs(me.z-sp.z)<.95){
            if(boostAktif==='p'){boostAktif=null;tabrakTil=now+1600;toast('Perisai menahan tabrakan!');boostUI();break;}
            const ada=me.carry;me.carry=0;stunTil=now+800;tabrakTil=now+1600;
            me.z=klem(me.z+(me.z>=sp.z?1.6:-1.6),BATAS.z0,BATAS.z1);me.vx=me.vz=0;kotor=true;
            toast(ada?'Tertabrak gelondong! Balok jatuh. Lompat untuk menghindar.':'Tertabrak gelondong! Lompat untuk menghindar.');break;
          }
        }
      }
      /* gudang mengisi tangan pelan: satu balok tiap 0,7 detik */
      if(main&&diDepot(me.x,me.z)&&me.carry<capNow()&&now-tReda>(boostAktif==='g'?350:700)){me.carry++;tReda=now;kotor=true;}
      if(st.f===0&&boostAktif){boostAktif=null;}
      boostUI();
      const b=$('aksi');
      const bisaTaruh=col>=0&&me.carry>0&&st.c[col]<MAXBAG,bisaAmbil=col>=0&&me.carry===0&&st.c[col]>0;
      b.hidden=blk||!(bisaTaruh||bisaAmbil||(tahan&&col>=0));
      if(!b.hidden)b.textContent=(modeAksi?modeAksi===1:me.carry>0)?'Taruh balok':'Ambil kembali';
      aksiTick(now,col);
      /* pad: sebelum babak berarti siap mulai, selama babak berarti kunci lebih cepat */
      const di=diPad(me.x,me.z)&&!blk?1:0;
      if(di!==me.siap){me.siap=di;if(di)flush();kirim('siap',{id:saya.id,v:di});}
      arena.padAnim(t,me.siap);
      if(!selesai(st)){
        const L=[me,...anggota().filter(p=>p.a===1)],semua=L.every(p=>p.siap),pem=pemimpinKunci();
        if(st.f===0){
          if(hitungMundur){
            if(now>=hitungMundur){hitungMundur=0;st.f=1;endAt=now+WAKTU[st.r]*1000;pakaiBoost();toast('MULAI!'+(boostAktif?' Boost: '+BOOST[boostAktif].n+'.':''));kotor=true;}
          }else if(pem&&semua&&!blk){
            if(!tSiap)tSiap=now;
            if(now-tSiap>1200){tSiap=0;kirim('mulai',{r:st.r});mulaiHitung();}
          }else tSiap=0;
        }else{
          const sisa=endAt-now;
          if(pem&&sisa<=-600){const c=st.c.slice();kirim('kunci',{r:st.r,c,w:0});kunciBabak(c,0);}
          else if(pem&&semua&&jumlah(st.c)>0&&!blk){
            if(!tSiap)tSiap=now;
            if(now-tSiap>1200){tSiap=0;const c=st.c.slice(),w=Math.round(1000*Math.max(0,sisa)/(WAKTU[st.r]*1000));kirim('kunci',{r:st.r,c,w});kunciBabak(c,w);}
          }else tSiap=0;
          if(sisa<3500&&pend.size)flush();
        }
      }else tSiap=0;
      /* balok yang dibawa */
      bawaItems.length=0;
      for(const p of [me,...anggota()])if(p.a===1&&p.carry>0)bawaItems.push({x:p.x,z:p.z,y:p.grp.userData.h+.3+(p.grp.position.y),n:p.carry});
      arena.setBawa(bawaItems);
      if(kotor){arena.setBags(selesai(st)?st.sr[BABAK.length-1]:st.c);isiArena();kotor=false;}
      if(now-tKiriman>400){tKiriman=now;isiArena();isiSiap();}
      isiWaktu(now);
    }
    /* rekonsiliasi: otoritas menyiarkan keadaan setelah tenang */
    if(ubahSt&&otoritas()&&now-tDelta>3000&&now-tStKirim>8000&&!pend.size){stKirim();ubahSt=false;}
    tx=me.x;tz=me.z;
  }
  /* kamera */
  const k=Math.min(1,dt*8);C.d+=(C.td-C.d)*k;if(!fp())C.p+=(C.tp-C.p)*k;
  const ks=cam.aspect<1?1.55:1,sp=Math.sin(C.p),cp=Math.cos(C.p);
  if(!mulai){
    const y=t*.1;cam.position.set(tx+Math.sin(y)*28,14,tz+Math.cos(y)*28);cam.lookAt(tx,1,tz);
  }else if(fp()&&C.d<1.5){
    const jy=me.grp.position.y;cam.position.set(me.x,2.7+jy,me.z);
    cam.lookAt(me.x-Math.sin(C.yaw)*cp,2.7+jy-sp,me.z-Math.cos(C.yaw)*cp);
  }else{
    const ar=mulai&&me.a===1,D=C.d*ks*(ar?1.9:1),oy=ar?2.6:1.2,oz=ar?-1:0;
    kamP.set(tx+D*Math.sin(C.yaw)*cp,oy+D*sp,tz+oz+D*Math.cos(C.yaw)*cp);
    cam.position.copy(kamP);cam.lookAt(tx,oy,tz+oz);
  }
  renderer.render(scene,cam);
  auditTick(dt);
}
terapKual();gambarPapan();requestAnimationFrame(frame);
document.fonts&&document.fonts.ready.then(gambarPapan);

/* kait uji */
window.__L={P1,AR,arena,get endAt(){return endAt;},get stunTil(){return stunTil;},get me(){return me;},tim,luar,papanData,get st(){return st;},aud,get rt(){return rt;},gerbang,C,hit,
  tp:(x,z)=>{me.x=x;me.z=z;},kirimPosisi,setArea,ubahKolom,flush,get pend(){return pend;},sim,jedaPos,jedaFlush,ntot,get tahan(){return tahan;},set tahan(v){tahan=v;}};
