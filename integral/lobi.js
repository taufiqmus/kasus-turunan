/* Lobi Integral v2: karakter kustom, kamera bebas, Pos 1 fisik (membawa balok), jaringan per tim. */
import * as THREE from './vendor/three.min.js';
import {sambung,sambungAmat} from './rt.js?v=36';
import {NDEP,GMAX,stokBabak,BABAK,CAP,MAXBAG,WAKTU,KURVA,RENCANA,setSeed,stateBaru,valid,cValid,skorRonde,skorTim,selesai,jumlah,gambarMini,kurvaBabak,aturanBabak,titikX} from './pos1.js?v=36';
import * as P1 from './pos1.js?v=36';
import * as AR from './arena.js?v=36';
import {buatArena,kolomDari,uTembus} from './arena.js?v=36';
import {buatArena2,gambarSandi} from './arena2.js?v=36';
import * as P2 from './pos2.js?v=36';
import {buatArena3,gambarMesin,diCorong} from './arena3.js?v=36';
import * as P3 from './pos3.js?v=36';
import {buatArena4,gambarDebit,tangkiDi} from './arena4.js?v=36';
import * as P4 from './pos4.js?v=36';
import {buatArena5,gambarBrankas,piringDi} from './arena5.js?v=36';
import * as P5 from './pos5.js?v=36';
import {buatArena6,gambarFinal} from './arena6.js?v=36';
import * as P6 from './pos6.js?v=36';
import {NB2,CAP2,WAKTU2,KAMP_JENIS,setSeed2,stateBaru2,valid2,sValid,skorRonde2,skorTim2,selesai2,soal,nSlot,batuKamp,teksBatu,slotDi,PESAN,notasi,notasiBenar} from './pos2.js?v=36';
import {TIPE,WARNA,KULIT,TOPI,KACAMATA,AKS,parseAv,kodeAv,acakAv,meshAvatar,topY} from './avatar.js?v=36';
import {labelSprite,buangSprite,klem} from './util.js?v=36';
import {muatUltra,ultraSiap,ultraAset} from './ultra.js?v=36';
import {posTrex,jarakTrex,kampKembali,hashTeks,R_KENA,R_AWAS,KEC as KEC_TREX} from './trex.js?v=36';
import {buatDino} from './dino.js?v=36';
import {M1,M2,M3,M4,M5,M6} from './medan.js?v=36';
const MED=M1;
/* dunia aktif: M1 (Pos 1) atau M2 (Pos 2) */
let W=M1;
import {bacaSesi} from '../core/net.js';
import * as CT from './catat.js?v=36';
import * as AM from './amati.js?v=36';

const $=id=>document.getElementById(id);
const TIM=[['merah','Merah','#e5392b'],['biru','Biru','#2f7fc1'],['hijau','Hijau','#2f9e5b'],['kuning','Kuning','#e0a200'],
  ['ungu','Ungu','#7a4bc4'],['oranye','Oranye','#ee7d1a'],['tosca','Tosca','#17a2a2'],['pink','Pink','#e0559b']].map(a=>({id:a[0],nama:a[1],warna:a[2]}));
const timById=id=>TIM.find(t=>t.id===id)||TIM[0];
const POS_AKTIF=6;
const POS=['Tambal Waduk','Rakit Sandi','Mesin Putar Balik','Misteri Tangki','Brankas Batas','Puncak Final'];
const SPD=7,RMAX=95,RZ=62,SPRINT=1.8;
const Q=new URLSearchParams(location.search);
/* mode pengamat (dosen): hanya mendengar dan melihat, tidak ikut bermain dan tidak mengirim apa pun selain permintaan keadaan */
const AMAT=Q.has('amati');
document.body.classList.toggle('amat',AMAT);
/* HP: layar sentuh (atau ?hp=1 untuk uji). Mengatur tata letak ringkas, kamera lebih dekat, getar, layar tetap menyala */
const SUTRADARA=Q.has('sutradara');
const HP=Q.has('hp')||matchMedia('(pointer:coarse)').matches;
document.body.classList.toggle('hp',HP);

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
  /* kode ruang mengikuti token selama pemain belum mengubahnya sendiri */
  let kodeSentuh=!!Q.get('kode');
  $('in-kode').addEventListener('input',()=>{kodeSentuh=true;});
  $('in-token').addEventListener('input',()=>{const t=$('in-token').value.toUpperCase().replace(/[^A-Z0-9-]/g,'');if(!kodeSentuh&&t)$('in-kode').value=t.slice(0,20);});
  if(Q.get('kode'))$('in-kode').value=Q.get('kode').toUpperCase().slice(0,20);
  /* sesi kelas: dari portal (sudah punya kunci) atau token yang diketik; NIM hanya diminta bila belum punya kunci */
  const por=CT.dariPortal();
  if(por){$('in-token').value=por.token;if(!kodeSentuh)$('in-kode').value=por.token;$('kls-nim').hidden=true;$('kls').open=true;$('kls-info').textContent='Tercatat sebagai '+por.user+' di sesi '+por.token+'.';}
  else{let t='';try{t=localStorage.getItem('kt-token')||'';}catch(e){}if(Q.get('token'))t=Q.get('token');$('in-token').value=String(t).toUpperCase().replace(/[^A-Z0-9-]/g,'').slice(0,20);if($('in-token').value){$('kls').open=true;if(!kodeSentuh)$('in-kode').value=$('in-token').value;}}
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
const hemi=new THREE.HemisphereLight(0xffffff,0x7aa860,1.5);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xfff1d6,1.6);sun.position.set(12,24,10);scene.add(sun);scene.add(sun.target);
const sunDir=new THREE.Vector3(.45,.8,.4).normalize();
sun.shadow.bias=-.0004;sun.shadow.normalBias=.05;

const rumput=new THREE.Mesh(new THREE.CircleGeometry(190,48),mat(0x78b85a));rumput.rotation.x=-Math.PI/2;scene.add(rumput);
/* tandai siapa yang menjatuhkan bayangan: semua benda bervolume, kecuali bidang datar dan latar */
function bayang(root){root.traverse(o=>{if(!o.isMesh)return;const g=o.geometry.type,datar=o.userData.tanah||o.userData.latar||g==='PlaneGeometry'||g==='CircleGeometry'||g==='RingGeometry';o.castShadow=!datar;o.receiveShadow=true;});}
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
    if(W.jarakJalan(x,z)<4.5)continue;
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
    const x=ZP[i].x,z=ZP[i].z,aktif=i<POS_AKTIF,len=Math.hypot(x,z),dx=-x/len,dz=-z/len;
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
/* T-Rex Pos 1: posisi fungsi jam dinding dan seed tim (trex.js), sama bagi semua anggota tanpa pesan jaringan.
   Tabrakan dinilai lokal: balok yang dibawa jatuh dan kembali ke kamp terdekat lewat selisih stok biasa.
   Model dimuat malas saat masuk Pos 1. Mati di uji otomatis (navigator.webdriver) kecuali ?dino=1, agar uji lain tidak acak. */
const TREX_ON=!navigator.webdriver||Q.get('dino')==='1';
const trex={seed:0,d:null,muat:false,awas:0,serang:0};
function siapkanTrex(){if(!TREX_ON||trex.muat)return;trex.muat=true;buatDino({tinggi:4.2}).then(d=>{trex.d=d;arena.grup.add(d.grup);}).catch(()=>{trex.muat=false;});}
const arena2=buatArena2();scene.add(arena2.grup);
const arena3=buatArena3();scene.add(arena3.grup);
const arena4=buatArena4();scene.add(arena4.grup);
const arena5=buatArena5();scene.add(arena5.grup);
const arena6=buatArena6();scene.add(arena6.grup);bayang(scene);

/* ---------- keadaan ---------- */
let kelas=null,saya=null,me=null,rt=null,mulai=false,hasilBuka=false,rodaBuka=false,revBuka=false,kotor=true,tGabung=0;
let endAt=0,hitungMundur=0,rodaR=-1,stunTil=0,tabrakTil=0;
const blok=()=>hasilBuka||rodaBuka||revBuka;
const tim=new Map();      /* anggota tim lain: id -> pemain (termasuk bot render) */
const luar=new Map();    /* pemain tim lain: hanya roster dari papan, bergerak simulasi lokal (bukan posisi asli) */
const papanData={};       /* tim -> {n,s,r,t} laporan jarang dari tiap tim */
let st=stateBaru();const pend=new Map();
/* Pos 2: keadaan tim, kiriman slot tertunda (slot -> [kode, cap waktu]) */
const ALUR={};let revPos=1;
const AL=()=>me?ALUR[me.a]:null;
let tDelta=0,tStKirim=0,ubahSt=false,tFlush=0,tPos=0,tLapor=0,lastLapor='';
const sim={on:false};
const semua=()=>{const L=[];if(me)L.push(me);for(const p of tim.values())L.push(p);return L;};
const anggota=()=>[...tim.values()].filter(p=>!p.bot);
const diri=()=>AMAT?[]:[me];

const RG=new THREE.RingGeometry(.95,1.25,20);
function buatAv(info){
  const grp=new THREE.Group(),pivot=new THREE.Group(),mesh=meshAvatar(info.av);
  const h=topY(info.av);
  const ring=new THREE.Mesh(RG,new THREE.MeshBasicMaterial({color:timById(info.tim).warna,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=.05;
  const lb=labelSprite(info.nama||'?',{sx:4.2,size:38});lb.position.y=h+.6;
  pivot.add(mesh);grp.add(ring,pivot,lb);grp.userData={pivot,mesh,lb,ring,h};bayang(grp);scene.add(grp);return grp;
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
function kirim(ev,p){if(AMAT&&ev!=='minta')return;if(rt){rt.kirim(ev,p);hit.kirim++;}}
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
  if(AMAT)return false;
  const now=performance.now(),L=[];
  if(now-tGabung>4000)L.push(me);
  for(const p of anggota())if(now-p.sejak>4000)L.push(p);
  return L.length&&tuaDari(L)===saya.id;
}
/* pemimpin kunci: id terkecil di antara anggota yang sedang di arena */
function pemimpinKunci(){
  if(AMAT)return false;
  const L=[];if(me.a>=1)L.push(me);
  for(const p of anggota())if(p.a===me.a)L.push(p);
  return L.length>0&&tuaDari(L)===saya.id;
}
const ang=(v,a,b)=>Number.isInteger(v)&&v>=a&&v<=b;
/* kunci pend/delta: 0..n-1 = kolom, 100+k = gudang k */
function terapDelta(list){
  for(const e of list){const [i,d]=e;if(i>=100)st.g[i-100]=klem(st.g[i-100]+d,0,GMAX);else st.c[i]=klem(st.c[i]+d,0,MAXBAG);}
  kotor=true;
}
function deltaSah(e){
  if(!Array.isArray(e)||e.length!==2)return false;
  const [i,d]=e;
  if(ang(i,100,100+NDEP-1))return ang(d,-GMAX,GMAX);
  return ang(i,0,st.c.length-1)&&ang(d,-MAXBAG,MAXBAG);
}
function onPesan(ev,p){
  hit.terima++;
  if(!p||typeof p!=='object')return;
  for(const k in ALUR)if(ALUR[k].pesan(ev,p))return;
  if(ev==='p'){
    const q=tim.get(p.id);if(!q||q.bot)return;
    if(![p.x,p.z,p.vx,p.vz].every(Number.isFinite)||Math.abs(p.x)>120||Math.abs(p.z)>120)return;
    q.tx=p.x;q.tz=p.z;q.vx=klem(p.vx,-14,14);q.vz=klem(p.vz,-14,14);q.c=ang(p.c,0,8)?p.c:0;q.carry=q.c;
    const a=ang(p.a,0,6)?p.a:0;if(a!==q.a){q.a=a;q.siap=0;}
    if(!q.tMsg||Math.hypot(q.tx-q.x,q.tz-q.z)>8){q.x=p.x;q.z=p.z;}
    q.tMsg=performance.now();
  }else if(ev==='d'){
    if(!ang(p.r,0,BABAK.length)||p.r!==st.r||!Array.isArray(p.c)||st.r>=BABAK.length)return;
    const L=[];for(const e of p.c){if(deltaSah(e))L.push(e);}
    terapDelta(L);tDelta=performance.now();ubahSt=true;
  }else if(ev==='st'){
    if(!valid(p.s))return;const s=p.s;
    if(s.r>st.r){adopsi(s);}
    else if(s.r===st.r&&s.r<BABAK.length){
      const c=s.c.slice(),g=(s.g||st.g).slice();for(const [i,d] of pend){if(i>=100)g[i-100]=klem(g[i-100]+d,0,GMAX);else c[i]=klem(c[i]+d,0,MAXBAG);}st.c=c;st.g=g;kotor=true;
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
    if(otoritas())setTimeout(()=>{flush();stKirim();for(const k in ALUR){ALUR[k].flush();ALUR[k].stKirim();}},100+Math.random()*400);
    /* pendatang belum tahu posisi kita: kirim satu sinyal posisi */
    setTimeout(()=>kirimPosisi(true),200+Math.random()*800);
  }else if(ev==='emo'){
    const q=tim.get(p.id);if(q&&(p.k===1||p.k===2||p.k===3))q.emo={k:p.k,t:performance.now(),d:p.k===3?1000:0};
  }else if(ev==='ro'){
    if(typeof p.t==='string'&&TIM.some(t=>t.id===p.t)&&ang(p.n,0,99)){
      const m=[];if(Array.isArray(p.m))for(const e of p.m.slice(0,12)){if(Array.isArray(e)&&typeof e[0]==='string'&&e[0].length<=12&&typeof e[1]==='string'&&/^[0-9]{6}$/.test(e[2]))m.push([e[0],e[1].slice(0,12),e[2]]);}
      const sk=Array.isArray(p.sk)?p.sk.slice(0,NPOS).map(v=>ang(v,0,100)?v:null):[];
      papanData[p.t]={n:p.n,sk,m,t:performance.now()};gambarPapan();selaraskanLuar();
    }
  }
}
function adopsi(s){
  const lama=st.r;st={r:s.r,c:s.c.slice(),sr:s.sr.map(x=>x.slice()),w:s.w.slice(),f:s.f,g:(s.g||stokBabak(s.r)).slice()};pend.clear();
  if(s.f===1)endAt=performance.now()+s.m;
  hitungMundur=0;
  if(st.r!==lama){me.carry=0;me.siap=0;for(const p of anggota())p.siap=0;}
  aturArena();kotor=true;
  if(selesai(st)&&me.a===1&&!AMAT)bukaHasil();
}
function stKirim(){
  kirim('st',{s:{...st,m:st.f===1?Math.round(endAt-performance.now()):undefined}});tStKirim=performance.now();
}
function flush(){
  if(!pend.size)return;
  kirim('d',{r:st.r,c:[...pend]});pend.clear();tFlush=performance.now();
}
function mulaiHitung(){hitungMundur=performance.now()+3000;toast('Bersiap...');}
/* catat hasil satu babak ke sesi kelas. Dipanggil oleh tiap anggota tim yang sedang online saat babak dikunci. */
const cat={ok:0,gagal:0,ditolak:0,pesan:''};
function catatBabak(pos,r,s,w,h){
  if(!kelas||!saya)return;
  const Wk=pos===1?WAKTU:(ALUR[pos]&&ALUR[pos].P.WAKTU)||[];
  const detik=Math.round((Wk[r]||0)*(1-w/1000));
  const rincian={v:1,pos,r:r+1,tim:saya.tim,ruang:saya.kode,nama:saya.nama,w,a:h.akurasi,c:CT.kodeCatatan(pos,h),s:Array.isArray(s)?s.slice(0,24).map(x=>Number.isFinite(x)?x:0):[]};
  CT.catat(kelas,{pos,r,skor:h.skor,detik,rincian},(h2,msg)=>{
    if(h2==='ok')cat.ok++;else{cat[h2]++;cat.pesan=msg||'';toast(h2==='gagal'?'Skor babak ini belum tersimpan ke sesi (jaringan). Permainan tetap jalan.':'Skor tidak disimpan: '+(msg||'ditolak server')+'.');}
    isiAudit();
  });
}
function kunciBabak(c,w){
  const r=st.r,h=skorRonde(r,c,w);catatBabak(1,r,c,w,h);koinAS[1].clear();arena.setKoin(M1.KOIN_A.map(()=>true));
  st.sr.push(c.slice());st.w.push(w);st.r++;st.f=0;st.c=st.r<BABAK.length?Array(BABAK[st.r]).fill(0):[];st.g=stokBabak(st.r);
  pend.clear();me.carry=0;me.siap=0;for(const p of anggota())p.siap=0;hitungMundur=0;
  aturArena();kotor=true;
  if(me.a===1&&!AMAT)tampilRev(r,c,w,h);
  if(selesai(st)){laporPapan(true);}
}
/* ---------- mesin alur umum untuk pos berbasis slot (Pos 2 sampai 6) ----------
   Dua mode slot. 'set': slot berisi kode, kiriman terbaru (cap waktu terbesar) menang, jadi urutan pesan tidak penting.
   'jumlah': slot berisi bilangan bulat yang diubah lewat selisih (seperti kolom Pos 1), otoritas menyiarkan keadaan.
   Event jaringan per pos: d<id>, st<id>, mulai<id>, kunci<id>. */
function buatAlur(P){
  const id=P.id,ev=k=>k+id,jml=P.mode==='jumlah';
  const A={P,id,st:P.stateBaru(),pend:new Map(),endAt:0,hitung:0,kotor:true,ubahSt:false,tDelta:0,tSt:0,tFlush:0};
  A.r=()=>Math.min(A.st.r,P.NB-1);
  A.selesai=()=>A.st.r>=P.NB;
  A.tampilS=()=>A.selesai()?A.st.sr[P.NB-1]:A.st.s;
  const batas=(i)=>P.batasSlot?P.batasSlot(A.st.r,i):[0,P.maxKode(A.st.r)];
  A.terapSlot=e=>{
    if(!Array.isArray(e)||e.length!==3)return;const [i,kode,k]=e;
    if(!ang(i,0,A.st.s.length-1)||!ang(kode,0,P.maxKode(A.st.r))||!Number.isFinite(k)||k<0)return;
    if(k>A.st.k[i]||(k===A.st.k[i]&&kode>A.st.s[i])){A.st.s[i]=kode;A.st.k[i]=k;A.kotor=true;}
  };
  A.terapJumlah=e=>{
    if(!Array.isArray(e)||e.length!==2)return;const [i,d]=e;
    if(!ang(i,0,A.st.s.length-1)||!ang(d,-99,99))return;
    const [lo,hi]=batas(i);A.st.s[i]=klem(A.st.s[i]+d,lo,hi);A.kotor=true;
  };
  A.ubahSlot=(i,kode)=>{const k=Date.now()+Math.random();A.st.s[i]=kode;A.st.k[i]=k;A.pend.set(i,[kode,k]);A.tDelta=performance.now();A.ubahSt=true;A.kotor=true;};
  /* mode jumlah: kembalikan true bila berubah */
  A.tambah=(i,d)=>{
    const [lo,hi]=batas(i),v=klem(A.st.s[i]+d,lo,hi);if(v===A.st.s[i])return false;
    const dd=v-A.st.s[i];A.st.s[i]=v;A.pend.set(i,(A.pend.get(i)||0)+dd);if(A.pend.get(i)===0)A.pend.delete(i);
    A.tDelta=performance.now();A.ubahSt=true;A.kotor=true;return true;
  };
  A.flush=()=>{
    if(!A.pend.size)return;
    kirim(ev('d'),{r:A.st.r,c:jml?[...A.pend]:[...A.pend].map(([i,[kode,k]])=>[i,kode,k])});A.pend.clear();A.tFlush=performance.now();
  };
  A.stKirim=()=>{kirim(ev('st'),{s:{...A.st,m:A.st.f===1?Math.round(A.endAt-performance.now()):undefined}});A.tSt=performance.now();};
  A.atur=()=>{P.atur(A.r(),A);A.kotor=true;};
  A.reset=()=>{if(me.a===id){me.tiles=[];me.carry=0;me.siap=0;}for(const p of anggota())if(p.a===id)p.siap=0;};
  A.adopsi=s=>{
    const lama=A.st.r;A.st={r:s.r,s:s.s.slice(),k:s.k?s.k.slice():s.s.map(()=>0),sr:s.sr.map(x=>x.slice()),w:s.w.slice(),f:s.f};A.pend.clear();
    if(s.f===1)A.endAt=performance.now()+s.m;A.hitung=0;
    if(A.st.r!==lama)A.reset();
    A.atur();if(A.selesai()&&me.a===id&&!AMAT)A.bukaHasil();
  };
  A.mulaiHitung=()=>{A.hitung=performance.now()+3000;if(me.a===id)toast('Bersiap...');};
  A.kunci=(s,w)=>{
    const r=A.st.r,h=P.skorRonde(r,s,w);catatBabak(id,r,s,w,h);
    A.st.sr.push(s.slice());A.st.w.push(w);A.st.r++;A.st.f=0;A.hitung=0;
    const b=P.stateBabak(A.st.r);A.st.s=b.s;A.st.k=b.k;
    A.pend.clear();koinAS[id].clear();P.arena.setKoin(P.M.KOIN_A.map(()=>true));A.reset();A.atur();
    if(me.a===id&&!AMAT)A.tampilRev(r,s,w,h);
    if(A.selesai())laporPapan(true);
  };
  A.pesan=(e,p)=>{
    if(e===ev('d')){
      if(!ang(p.r,0,P.NB-1)||p.r!==A.st.r||!Array.isArray(p.c)||A.selesai())return true;
      for(const x of p.c.slice(0,24))jml?A.terapJumlah(x):A.terapSlot(x);A.tDelta=performance.now();A.ubahSt=true;return true;
    }
    if(e===ev('st')){
      if(!P.valid(p.s))return true;const s=p.s;
      if(s.r>A.st.r)A.adopsi(s);
      else if(s.r===A.st.r&&!A.selesai()){
        if(jml){const c=s.s.slice();for(const [i,d] of A.pend){const [lo,hi]=batas(i);c[i]=klem(c[i]+d,lo,hi);}A.st.s=c;A.kotor=true;}
        else for(let i=0;i<s.s.length;i++)A.terapSlot([i,s.s[i],s.k[i]]);
        if(s.f===1&&A.st.f===0){A.st.f=1;A.endAt=performance.now()+s.m;A.hitung=0;}
      }
      return true;
    }
    if(e===ev('kunci')){if(!ang(p.r,0,P.NB-1)||p.r!==A.st.r||!P.sValid(p.r,p.s)||!ang(p.w,0,1000))return true;A.kunci(p.s,p.w);return true;}
    if(e===ev('mulai')){if(p.r===A.st.r&&A.st.f===0&&!A.hitung&&!A.selesai())A.mulaiHitung();return true;}
    return false;
  };
  /* mulai dan kunci babak; dipanggil tiap bingkai saat pemain berada di pos ini */
  A.alur=(now,blk)=>{
    if(A.selesai()){tSiap=0;return;}
    const L=[...diri(),...anggota().filter(p=>p.a===id)],semua=L.every(p=>p.siap),pem=pemimpinKunci(),st=A.st;
    if(st.f===0){
      if(A.hitung){if(now>=A.hitung){A.hitung=0;st.f=1;A.endAt=now+P.WAKTU[st.r]*1000;pakaiBoost();toast('MULAI!'+(boostAktif?' Boost: '+BOOST[boostAktif].n+'.':''));A.kotor=true;}}
      else if(pem&&semua&&!blk){if(!tSiap)tSiap=now;if(now-tSiap>1200){tSiap=0;kirim(ev('mulai'),{r:st.r});A.mulaiHitung();}}
      else tSiap=0;
    }else{
      const siap=P.bolehKunci?P.bolehKunci(st):st.s.every(v=>v>0);
      if(pem&&semua&&!blk&&!siap&&now-tHabis>4000){tHabis=now;toast(P.pesanBelum||'Semua slot harus terisi sebelum dikunci.');}
      if(pem&&semua&&siap&&!blk){if(!tSiap)tSiap=now;if(now-tSiap>1200){tSiap=0;A.flush();const s=st.s.slice(),w=Math.round(1000*Math.max(0,A.endAt-now)/(P.WAKTU[st.r]*1000));kirim(ev('kunci'),{r:st.r,s,w});A.kunci(s,w);}}
      else tSiap=0;
    }
  };
  A.rekon=now=>{
    if(A.ubahSt&&otoritas()&&now-A.tDelta>3000&&now-A.tSt>8000&&!A.pend.size){A.stKirim();A.ubahSt=false;}
    if(A.pend.size&&now-A.tFlush>jedaFlush())A.flush();
  };
  A.waktu=now=>{
    const st=A.st;let w='-';
    if(A.selesai())w='selesai';
    else if(st.f===0)w=A.hitung?String(Math.max(1,Math.ceil((A.hitung-now)/1000))):'siap';
    else{const d=Math.max(0,Math.floor((P.WAKTU[st.r]*1000-(A.endAt-now))/1000));w=Math.floor(d/60)+':'+String(d%60).padStart(2,'0');}
    const hm=$('hitung');if(A.hitung&&st.f===0){hm.hidden=false;hm.textContent=String(Math.max(1,Math.ceil((A.hitung-now)/1000)));}else hm.hidden=true;
    return w;
  };
  /* HUD umum (kartu #ar2): babak, isi, waktu, bawa, siap; isi khusus dari P.hud */
  A.hud=now=>{
    const r=A.r(),sel=A.selesai(),h=P.hud(r,A.tampilS(),A);
    $('a2-babak').textContent=sel?'Selesai':'Babak '+(r+1)+'/'+P.NB;
    $('a2-isi').textContent=h.isi;$('a2-bawa').textContent=h.bawa;
    const L=[...diri(),...anggota().filter(p=>p.a===id)];$('a2-siap').textContent=L.filter(p=>p.siap).length+'/'+L.length;
    $('a2-waktu').textContent=A.waktu(now);
  };
  A.tampilRev=(r,s,w,h)=>{
    revBuka=true;revPos=id;key.w=key.a=key.s=key.d=0;joy.x=joy.y=0;tahan=false;
    const o=P.ulasan(r,s,w,h);
    $('rev-h').textContent='Babak '+(r+1)+' terkunci: skor '+h.skor;o.gambar($('rev-cv'));
    const box=$('rev-t');box.textContent='';
    for(const [a,b] of o.baris){const d=document.createElement('div');d.className='r';const s1=document.createElement('span'),s2=document.createElement('span');s1.textContent=a;s2.textContent=b;d.append(s1,s2);box.append(d);}
    $('rev-p').textContent=o.catatan;$('rev').hidden=false;
    $('rev-ok').onclick=()=>{revBuka=false;$('rev').hidden=true;if(A.selesai())A.bukaHasil();};
  };
  A.bukaHasil=()=>{
    if(hasilBuka)return;const o=P.hasil(A.st);
    const t=$('w-tabel');t.textContent='';
    const head=t.insertRow();for(const h of o.kolom){const th=document.createElement('th');th.textContent=h;head.append(th);}
    for(const b of o.baris){const row=t.insertRow();b.forEach(v=>row.insertCell().textContent=v);}
    $('w-pos').textContent='Pos '+id+' selesai';$('w-h').textContent=o.judul;$('w-p').textContent=o.teks;$('w-skor').textContent=String(P.skorTim(A.st));
    $('hasil').hidden=false;hasilBuka=true;key.w=key.a=key.s=key.d=0;joy.x=joy.y=0;tahan=false;
  };
  return A;
}
/* panel pilihan di kamp atau stasiun; dibangun ulang hanya bila kuncinya berubah.
   pilihan: [{t (teks tombol), judul, mati, aksi()}] */
let pilihKey='';
function panelUmum(tampil,judul,pilihan,kunci){
  const box=$('pilih');box.hidden=!tampil||blok();if(box.hidden){pilihKey='';return;}
  if(kunci===pilihKey)return;pilihKey=kunci;box.textContent='';
  const j=document.createElement('div');j.className='bj'+(judul.length>70?' soal':'');j.textContent=judul;box.append(j);
  for(const o of pilihan){
    const t=document.createElement('button');t.type='button';t.className=o.utama?'btn':'btn alt';t.textContent=o.t;if(o.judul)t.title=o.judul;
    t.disabled=!!o.mati;if(o.kelas)t.classList.add(o.kelas);t.addEventListener('click',()=>{o.aksi();pilihKey='';});box.append(t);
  }
}
const taruhKembali=()=>({t:'Taruh kembali',utama:true,aksi:()=>{me.tiles=[];me.carry=0;kirimPosisi();}});

/* ================= Pos 2: Rakit Sandi ================= */
const CFG2={id:2,setSeed:setSeed2,NB:NB2,WAKTU:WAKTU2,M:M2,mode:'set',get arena(){return arena2;},
  stateBaru:stateBaru2,stateBabak:r=>{const n=r<NB2?nSlot(r):0;return {s:Array(n).fill(0),k:Array(n).fill(0)};},
  maxKode:r=>soal(Math.min(r,NB2-1)).batu.length,sValid,valid:valid2,skorRonde:skorRonde2,skorTim:skorTim2,
  pesanBelum:'Semua slot harus terisi sebelum sandi dikunci.',
  sambut:A=>A.selesai()?'Pos 2 sudah selesai.':(A.st.f===1?'Babak sedang berjalan. Ambil batu sandi di kamp, pasang di altar.':'Ngarai Kuil. Baca sandi di prasasti, lalu semua berdiri di pad hijau untuk mulai.'),
  atur(r){
    const S=soal(r),cerita=S.jenis==='cerita';arena2.setBabak(r);arena2.setMedan(r);
    /* cerita dibaca di HUD sebagai teks (lebih jelas di HP); grafik digambar kecil */
    $('a2-cv').hidden=cerita;if(!cerita)gambarSandi($('a2-cv'),r,{judul:false});
    $('a2-p').textContent=(cerita?S.tx+' ':'')+'a dan dx di Oasis, f di Menara, b di Reruntuhan.';
  },
  hud:(r,s)=>({isi:s.filter(v=>v>0).length+'/'+s.length+' slot',bawa:me.tiles.length?me.tiles.map(k=>teksBatu(r,k)).join('  ·  '):'-'}),
  ulasan:(r,s,w,h)=>({gambar:cv=>gambarSandi(cv,r,{judul:false}),
    baris:[['Sandi tim',notasi(r,s)],['Sandi benar',notasiBenar(r)],['Slot benar',h.benar+' / '+h.total],['Ketepatan',h.akurasi+' / 100'],['Bonus kecepatan',Math.round(w/10)+'%']],
    catatan:h.catatan.length?h.catatan.map(c=>PESAN[c]).filter(Boolean).join(' '):'Sandi tepat. Notasi ∫ dari a sampai b f(x) dx menyatakan luas daerah di bawah f dari x = a sampai x = b.'}),
  hasil:st=>({kolom:['Babak','Sandi tim','Sandi benar','Skor'],baris:st.sr.map((s,i)=>[i+1,notasi(i,s),notasiBenar(i),skorRonde2(i,s,st.w[i]).skor]),
    judul:'Sandi luas: ∫ dari a sampai b, f(x) dx',teks:'Notasi integral tentu merangkum seluruh daerah: batas bawah dan atas memberi selang, f memberi tinggi, dx menandai variabel yang dijumlahkan.'}),
  angka(n){const k=W.diKamp(me.x,me.z);if(k<0)return;const b=batuKamp(ALUR[2].r(),k)[n-1];if(b)ambilBatu(b.kode);},
  /* interaksi tiap bingkai: panel kamp, tombol pasang; kembalikan slot yang disorot */
  bingkai(A,o){
    const r=o.r,dk=W.diKamp(me.x,me.z),sl=o.main&&o.now>=stunTil?slotDi(r,me.x,me.z):-1;
    if(dk>=0){
      const L=batuKamp(r,dk),penuh=me.tiles.length>=capNow();
      panelUmum(true,!o.main?'Kamp '+W.KAMP[dk].nama+'. Batu bisa diambil setelah babak mulai.':(penuh?'Tangan penuh ('+capNow()+' batu). Pasang dulu di altar.':'Pilih batu sandi (bawa maks '+capNow()+')'),
        L.map((b,i)=>({t:b.t,judul:P2.NAMA_JENIS[b.k]+' (tombol '+(i+1)+')',mati:!o.main||penuh,aksi:()=>ambilBatu(b.kode)})).concat(me.tiles.length?[taruhKembali()]:[]),
        dk+'|'+r+'|'+o.main+'|'+penuh+'|'+me.tiles.join(','));
    }else panelUmum(false);
    const b=$('aksi');let label='';
    if(sl>=0){
      const S=soal(r),k=me.tiles.find(k=>S.batu[k-1].k===S.slot[sl].k);
      if(k)label=(A.st.s[sl]?'Ganti dengan ':'Pasang ')+teksBatu(r,k);
      else if(me.tiles.length)label='Butuh '+P2.NAMA_JENIS[S.slot[sl].k];
    }
    b.hidden=o.blk||!label;if(!b.hidden)b.textContent=label;
    if(tahan&&sl>=0&&o.now-tAksi>350){tahan=false;tAksi=o.now;pasangBatu(sl);}
    if(tahan&&sl<0)tahan=false;
    return sl;
  }
};
ALUR[2]=buatAlur(CFG2);

/* ================= Pos 3: Mesin Putar Balik ================= */
let kunciMini3='';
const CFG3={id:3,setSeed:P3.setSeed3,NB:P3.NB3,WAKTU:P3.WAKTU3,M:M3,mode:'set',cap:P3.CAP3,get arena(){return arena3;},
  stateBaru:P3.stateBaru3,stateBabak:r=>{const n=r<P3.NB3?P3.nSlot3(r):0;return {s:Array(n).fill(0),k:Array(n).fill(0)};},
  maxKode:()=>P3.MAXK,sValid:P3.sValid3,valid:P3.valid3,skorRonde:P3.skorRonde3,skorTim:P3.skorTim3,
  pesanBelum:'Semua suku dan C harus masuk mesin sebelum dikunci.',
  sambut:A=>A.selesai()?'Pos 3 sudah selesai.':(A.st.f===1?'Babak sedang berjalan. Putar balik tiap suku lewat Tungku dan Pemotong.':'Danau Beku. Baca f(x) di layar mesin, lalu semua berdiri di pad hijau untuk mulai.'),
  atur(r){
    arena3.setBabak(r);arena3.setMedan(r);kunciMini3='';$('a2-cv').hidden=false;
    $('a2-p').textContent='Ambil suku di corong MASUK. Tungku: pangkat naik. Pemotong: bagi koefisien. Gudang C: + C. Lalu ke corong KELUAR.';
  },
  hud(r,s){
    const k=r+'|'+s.join(',');if(k!==kunciMini3){kunciMini3=k;P3.soal3(r);gambarMesin($('a2-cv'),r,s,{kecil:true});}
    return {isi:s.filter(v=>v>0).length+'/'+s.length+' masuk',bawa:me.tiles.length?me.tiles.map(b=>P3.teksBalok(r,b)).join('  ·  '):'-'};
  },
  ulasan:(r,s,w,h)=>({gambar:cv=>gambarMesin(cv,r,s),
    baris:[['F tim',P3.teksFTim(r,s)],['F benar',P3.teksFBenar(r)],['Cek: F′ tim',P3.teksTurunanTim(r,s)],['Bagian benar',h.benar+' / '+h.total],['Ketepatan',h.akurasi+' / 100'],['Bonus kecepatan',Math.round(w/10)+'%']],
    catatan:h.catatan.length?h.catatan.map(c=>P3.PESAN3[c]).filter(Boolean).join(' '):'Tepat. Turunkan F hasil rakitan dan hasilnya kembali persis ke f. Itulah arti antiturunan.'}),
  hasil:st=>({kolom:['Babak','f(x)','F tim','Skor'],baris:st.sr.map((s,i)=>[i+1,P3.teksF(P3.soal3(i).suku),P3.teksFTim(i,s),P3.skorRonde3(i,s,st.w[i]).skor]),
    judul:'Putar balik turunan: pangkat naik satu, lalu bagi pangkat baru',teks:'Antiturunan membalik langkah turunan dengan urutan terbalik. Karena turunan konstanta selalu nol, setiap jawaban ditambah C, dan nilai awal menentukan C yang tepat.'}),
  bingkai(A,o){
    const r=o.r,S=P3.soal3(r),dk=W.diKamp(me.x,me.z),cm=diCorong('masuk',me.x,me.z),ck=diCorong('keluar',me.x,me.z),penuh=me.tiles.length>=capNow();
    const blokSuku=me.tiles.filter(b=>b.c==null),tk=me.tiles.map(b=>JSON.stringify(b)).join(';');
    if(cm){
      panelUmum(true,!o.main?'Corong masuk. Suku bisa diambil setelah babak mulai.':(penuh?'Tangan penuh ('+capNow()+' balok).':'Ambil suku f(x) untuk diputar balik'),
        S.suku.map(([a,n],i)=>({t:P3.teksSuku(a,1,n),mati:!o.main||penuh,aksi:()=>{if(me.tiles.length<capNow()){me.tiles.push(P3.balokMentah(r,i));me.carry=me.tiles.length;kirimPosisi();}}})).concat(me.tiles.length?[taruhKembali()]:[]),
        'm|'+r+'|'+o.main+'|'+tk);
    }else if(dk===0||dk===2){
      const tungku=dk===0,L=[];
      blokSuku.forEach(b=>{for(const op of (tungku?P3.opsiTungku(b):P3.opsiPemotong(b)))L.push({t:P3.teksBalok(r,b)+': '+op.t,mati:!o.main,aksi:()=>{
        if(tungku)b.e=op.e;else{b.d=op.d;b.m=op.m;}toast('Balok sekarang '+P3.teksBalok(r,b)+'.');}});});
      panelUmum(true,tungku?'Tungku: ubah pangkat balok yang dibawa':'Pemotong: ubah koefisien balok yang dibawa',
        L.length?L:[{t:'Tidak membawa balok suku',mati:true,aksi:()=>{}}],(tungku?'t|':'p|')+r+'|'+o.main+'|'+tk);
    }else if(dk===1){
      panelUmum(true,!o.main?'Gudang C. Balok C bisa diambil setelah babak mulai.':(r===2?'Pilih nilai C yang membuat F('+S.x0+') = '+S.y0:'Ambil balok konstanta'),
        S.opsiC.map((t,i)=>({t,mati:!o.main||penuh,aksi:()=>{if(me.tiles.length<capNow()){me.tiles.push({c:i});me.carry=me.tiles.length;kirimPosisi();}}})).concat(me.tiles.length?[taruhKembali()]:[]),
        'c|'+r+'|'+o.main+'|'+penuh+'|'+tk);
    }else panelUmum(false);
    const b=$('aksi'),bisa=ck&&o.main&&me.tiles.length>0;
    b.hidden=o.blk||!bisa;if(bisa)b.textContent='Masukkan ke mesin ('+me.tiles.length+')';
    if(tahan&&bisa&&o.now-tAksi>350){
      tahan=false;tAksi=o.now;
      for(const x of me.tiles){if(x.c!=null)A.ubahSlot(S.suku.length,x.c+1);else A.ubahSlot(x.i,P3.kodeBalok(x));}
      me.tiles=[];me.carry=0;kirimPosisi();toast('Masuk mesin. F(x) = '+P3.teksFTim(r,A.st.s));
    }
    if(tahan&&!bisa)tahan=false;
    return -1;
  }
};
ALUR[3]=buatAlur(CFG3);

/* ================= Pos 4: Misteri Tangki ================= */
let kunciMini4='';
const CFG4={id:4,setSeed:P4.setSeed4,NB:P4.NB4,WAKTU:P4.WAKTU4,M:M4,mode:'jumlah',cap:P4.CAP4,get arena(){return arena4;},
  stateBaru:P4.stateBaru4,stateBabak:r=>{const n=r<P4.NB4?P4.nSlot4(r):0;return {s:Array(n).fill(0),k:Array(n).fill(0)};},
  maxKode:()=>P4.VMAX,batasSlot:()=>[0,P4.VMAX],sValid:P4.sValid4,valid:P4.valid4,skorRonde:P4.skorRonde4,skorTim:P4.skorTim4,
  bolehKunci:st=>st.s.some(v=>v>0),pesanBelum:'Isi tangki dulu sebelum dikunci.',
  sambut:A=>A.selesai()?'Pos 4 sudah selesai.':(A.st.f===1?'Babak sedang berjalan. Isi tiap tangki sesuai volume pada waktunya.':'Hutan Sungai. Baca grafik debit di papan, lalu semua berdiri di pad hijau untuk mulai.'),
  atur(r){
    arena4.setBabak(r);arena4.setMedan(r);kunciMini4='';$('a2-cv').hidden=false;
    $('a2-p').textContent='Tangki ke-n = volume pada garis merah ke-n. Ember 1 L di Mata Air, jeriken 2 L di Sumur, drum 5 L di Air Terjun.';
  },
  hud(r,s){
    if(kunciMini4!==String(r)){kunciMini4=String(r);gambarDebit($('a2-cv'),r,{kecil:true});}
    const jml=me.tiles.reduce((a,v)=>a+v,0);
    return {isi:s.join(' · ')+' L',bawa:me.tiles.length?me.tiles.map(v=>v+' L').join(' + ')+' = '+jml+' L':'-'};
  },
  ulasan:(r,s,w,h)=>({gambar:cv=>gambarDebit(cv,r),
    baris:[['Isi tangki tim',s.join(', ')+' L'],['Isi benar',P4.soal4(r).V.join(', ')+' L'],['Tangki tepat',h.benar+' / '+h.total],['Ketepatan',h.akurasi+' / 100'],['Bonus kecepatan',Math.round(w/10)+'%']],
    catatan:h.catatan.length?h.catatan.map(c=>P4.PESAN4[c]).filter(Boolean).join(' '):'Tepat. Volume adalah akumulasi laju: tiap tangki = V0 + luas bertanda di bawah grafik debit sampai waktunya.'}),
  hasil:st=>({kolom:['Babak','V0','Isi tim','Isi benar','Skor'],baris:st.sr.map((s,i)=>[i+1,P4.soal4(i).v0+' L',s.join(', '),P4.soal4(i).V.join(', '),P4.skorRonde4(i,s,st.w[i]).skor]),
    judul:'Volume = akumulasi debit',teks:'Luas di bawah grafik laju adalah perubahan total. Bagian di atas sumbu menambah, bagian di bawah sumbu mengurangi. Inilah ide integral sebagai akumulasi.'}),
  bingkai(A,o){
    const r=o.r,dk=W.diKamp(me.x,me.z),ti=o.main?tangkiDi(me.x,me.z):-1,penuh=me.tiles.length>=capNow(),jml=me.tiles.reduce((a,v)=>a+v,0),tk=me.tiles.join(',');
    if(dk>=0){
      const wd=P4.WADAH[dk];
      panelUmum(true,!o.main?'Kamp '+W.KAMP[dk].nama+'. Air bisa diambil setelah babak mulai.':(penuh?'Tangan penuh ('+capNow()+' wadah).':W.KAMP[dk].nama+': '+wd.nama+' '+wd.L+' liter'),
        [{t:'Ambil '+wd.nama+' '+wd.L+' L',mati:!o.main||penuh,aksi:()=>{if(me.tiles.length<capNow()){me.tiles.push(wd.L);me.carry=me.tiles.length;kirimPosisi();}}}].concat(me.tiles.length?[taruhKembali()]:[]),
        'k|'+dk+'|'+o.main+'|'+tk);
    }else if(ti>=0){
      const v=A.st.s[ti];
      panelUmum(true,'Tangki '+(ti+1)+' (t = '+P4.soal4(r).t[ti]+'): '+v+' L',
        [{t:'Tuang +'+jml+' L',utama:true,mati:!jml,aksi:()=>{if(A.tambah(ti,jml)){me.tiles=[];me.carry=0;kirimPosisi();}}},
         {t:'Kuras 1 L',mati:v<1,aksi:()=>A.tambah(ti,-1)},{t:'Kuras 5 L',mati:v<5,aksi:()=>A.tambah(ti,-5)}],
        't|'+ti+'|'+v+'|'+tk);
    }else panelUmum(false);
    const b=$('aksi'),bisa=ti>=0&&jml>0;
    b.hidden=o.blk||!bisa;if(bisa)b.textContent='Tuang +'+jml+' L ke tangki '+(ti+1);
    if(tahan&&bisa&&o.now-tAksi>350){tahan=false;tAksi=o.now;if(A.tambah(ti,jml)){me.tiles=[];me.carry=0;kirimPosisi();}}
    if(tahan&&!bisa)tahan=false;
    return ti;
  }
};
ALUR[4]=buatAlur(CFG4);
/* ================= Pos 5: Brankas Batas ================= */
let kunciMini5='';
const brNama=i=>'ABCD'[i];
const CFG5={id:5,setSeed:P5.setSeed5,NB:P5.NB5,WAKTU:P5.WAKTU5,M:M5,mode:'jumlah',cap:P5.CAP5,get arena(){return arena5;},
  stateBaru:P5.stateBaru5,stateBabak:r=>{const n=r<P5.NB5?P5.nSlot5(r):0;return {s:Array(n).fill(0),k:Array(n).fill(0)};},
  maxKode:()=>P5.BMAX,batasSlot:()=>[0,P5.BMAX],sValid:P5.sValid5,valid:P5.valid5,skorRonde:P5.skorRonde5,skorTim:P5.skorTim5,
  bolehKunci:st=>{if(!st.s.length)return false;for(let i=0;i<st.s.length;i+=2)if(!(st.s[i]>0||st.s[i+1]>0))return false;return true;},
  pesanBelum:'Muat beban di setiap brankas dulu sebelum dikunci.',
  sambut:A=>A.selesai()?'Pos 5 sudah selesai.':(A.st.f===1?'Babak sedang berjalan. Muat F(atas) di piring kanan dan F(bawah) di piring kiri.':'Teluk Karang. Baca soal di papan, lalu semua berdiri di pad hijau untuk mulai.'),
  atur(r){
    arena5.setBabak(r);arena5.setMedan(r);kunciMini5='';$('a2-cv').hidden=false;
    $('a2-p').textContent='Piring kanan = F(atas), piring kiri = F(bawah). Beban 1 kg di Dermaga, 5 kg di Gua Karang, 10 kg di Mercusuar.';
  },
  hud(r,s){
    if(kunciMini5!==String(r)){kunciMini5=String(r);gambarBrankas($('a2-cv'),r,{kecil:true});}
    const jml=me.tiles.reduce((a,v)=>a+v,0),L=[];
    for(let i=0;i<P5.nBrankas(r);i++){const d=(s[2*i]|0)-(s[2*i+1]|0);L.push(brNama(i)+': '+(s[2*i]|0)+'−'+(s[2*i+1]|0)+'='+d);}
    return {isi:L.join(' · '),bawa:me.tiles.length?me.tiles.map(v=>v+' kg').join(' + ')+' = '+jml+' kg':'-'};
  },
  ulasan:(r,s,w,h)=>{
    const S=P5.soal5(r),tim=S.br.map((B,i)=>((s[2*i]|0)-(s[2*i+1]|0))),cC=h.C.length?' Kalian memakai F + C dengan C = '+h.C.join(', ')+', dan hasilnya tetap sama: C saling menghapus.':'';
    return {gambar:cv=>gambarBrankas(cv,r),
      baris:[['F(x)',P5.teksP(S.F)+' + C'],['Sandi tim',tim.join(', ')],['Sandi benar',S.br.map(B=>B.I).join(', ')],['Brankas terbuka',h.benar+' / '+h.total],['Ketepatan',h.akurasi+' / 100'],['Bonus kecepatan',Math.round(w/10)+'%']],
      catatan:(h.catatan.length?h.catatan.map(c=>P5.PESAN5[c]).filter(Boolean).join(' '):'Tepat. Integral tentu = F(atas) − F(bawah) untuk antiturunan F mana pun.')+cC};
  },
  hasil:st=>({kolom:['Babak','f(x)','Sandi tim','Sandi benar','Skor'],baris:st.sr.map((s,i)=>{const S=P5.soal5(i);return [i+1,P5.teksP(S.f),S.br.map((B,j)=>(s[2*j]|0)-(s[2*j+1]|0)).join(', '),S.br.map(B=>B.I).join(', '),P5.skorRonde5(i,s,st.w[i]).skor];}),
    judul:'Integral tentu = F(atas) − F(bawah)',teks:'Cukup satu antiturunan F, nilai di dua batas, lalu selisih. Konstanta C hilang saat dikurangkan, dan menukar batas membalik tanda.'}),
  anim:dt=>arena5.animTimbangan(dt),
  bingkai(A,o){
    const r=o.r,dk=W.diKamp(me.x,me.z),pi=o.main?piringDi(r,me.x,me.z):-1,penuh=me.tiles.length>=capNow(),jml=me.tiles.reduce((a,v)=>a+v,0),tk=me.tiles.join(',');
    if(dk>=0){
      const bb=P5.BEBAN[dk];
      panelUmum(true,!o.main?'Kamp '+W.KAMP[dk].nama+'. Beban bisa diambil setelah babak mulai.':(penuh?'Tangan penuh ('+capNow()+' beban).':W.KAMP[dk].nama+': '+bb.nama+' '+bb.kg+' kg'),
        [{t:'Ambil '+bb.nama+' '+bb.kg+' kg',mati:!o.main||penuh,aksi:()=>{if(me.tiles.length<capNow()){me.tiles.push(bb.kg);me.carry=me.tiles.length;kirimPosisi();}}}].concat(me.tiles.length?[taruhKembali()]:[]),
        'k|'+dk+'|'+o.main+'|'+tk);
    }else if(pi>=0){
      const v=A.st.s[pi],B=P5.soal5(r).br[pi>>1],kanan=pi%2===0;
      panelUmum(true,'Brankas '+brNama(pi>>1)+', piring '+(kanan?'kanan F('+B.atas+')':'kiri F('+B.bawah+')')+': '+v+' kg',
        [{t:'Taruh +'+jml+' kg',utama:true,mati:!jml,aksi:()=>{if(A.tambah(pi,jml)){me.tiles=[];me.carry=0;kirimPosisi();}}},
         {t:'Angkat 1 kg',mati:v<1,aksi:()=>A.tambah(pi,-1)},{t:'Angkat 5 kg',mati:v<5,aksi:()=>A.tambah(pi,-5)},{t:'Angkat 10 kg',mati:v<10,aksi:()=>A.tambah(pi,-10)}],
        'p|'+pi+'|'+v+'|'+tk);
    }else panelUmum(false);
    const b=$('aksi'),bisa=pi>=0&&jml>0;
    b.hidden=o.blk||!bisa;if(bisa)b.textContent='Taruh +'+jml+' kg di piring '+(pi%2===0?'kanan':'kiri');
    if(tahan&&bisa&&o.now-tAksi>350){tahan=false;tAksi=o.now;if(A.tambah(pi,jml)){me.tiles=[];me.carry=0;kirimPosisi();}}
    if(tahan&&!bisa)tahan=false;
    return pi;
  }
};
ALUR[5]=buatAlur(CFG5);
/* ================= Pos 6: Puncak Final ================= */
let kunciMini6='';
const CFG6={id:6,setSeed:P6.setSeed6,NB:P6.NB6,WAKTU:P6.WAKTU6,M:M6,mode:'set',get arena(){return arena6;},
  stateBaru:P6.stateBaru6,stateBabak:r=>{const n=r<P6.NB6?P6.NSTASIUN:0;return {s:Array(n).fill(0),k:Array(n).fill(0)};},
  maxKode:()=>4,sValid:P6.sValid6,valid:P6.valid6,skorRonde:P6.skorRonde6,skorTim:P6.skorTim6,
  pesanBelum:'Ketiga pos harus dijawab sebelum dikunci.',
  sambut:A=>A.selesai()?'Pos 6 sudah selesai.':(A.st.f===1?'Babak sedang berjalan. Daki ke tiga pos dan pilih jawaban di sana.':'Puncak Kalkulus. Baca tiga soal di papan, bagi tugas, lalu semua berdiri di pad hijau untuk mulai.'),
  atur(r){
    arena6.setBabak(r);arena6.setMedan(r);kunciMini6='';$('a2-cv').hidden=false;
    $('a2-p').textContent='Tiap babak ada tiga soal di Pos Lembah, Pos Tebing, dan Puncak. Jawaban bisa diganti sampai dikunci di pad.';
  },
  hud(r,s){
    const kk=r+'|'+s.join(',');if(kunciMini6!==kk){kunciMini6=kk;gambarFinal($('a2-cv'),r,s,{kecil:true});}
    return {isi:s.map(v=>v?P6.HURUF[v-1]:'-').join(' · '),bawa:'-'};
  },
  ulasan:(r,s,w,h)=>({gambar:cv=>gambarFinal(cv,r,s),
    baris:[['Jawaban tim',s.map(v=>v?P6.HURUF[v-1]:'-').join(', ')],['Kunci',P6.soal6(r).map(q=>P6.HURUF[q.b]).join(', ')],['Benar',h.benar+' / '+h.total],['Ketepatan',h.akurasi+' / 100'],['Bonus kecepatan',Math.round(w/10)+'%']],
    catatan:h.catatan.length?h.catatan.map(c=>M6.KAMP[c.i].nama+': '+c.teks).join(' '):'Ketiga jawaban tepat. Pemahamanmu tentang integral sudah utuh.'}),
  hasil:st=>{
    const sk=skorSemua(),ada=sk.filter(v=>v!=null),rata=ada.length?Math.round(ada.reduce((a,v)=>a+v,0)/ada.length):0;
    return {kolom:['Babak','Jawaban','Kunci','Skor'],baris:st.sr.map((s,i)=>[i+1,s.map(v=>v?P6.HURUF[v-1]:'-').join(', '),P6.soal6(i).map(q=>P6.HURUF[q.b]).join(', '),P6.skorRonde6(i,s,st.w[i]).skor]),
      judul:'Rapor perjalanan integral',teks:'Skor tiap pos: '+sk.map((v,i)=>'P'+(i+1)+' '+(v??'-')).join(', ')+'. Rata-rata '+rata+'. Dari menaksir luas, menulis notasi, memutar balik turunan, mengakumulasi laju, sampai teorema dasar: semuanya satu ide, integral sebagai akumulasi.'};
  },
  bingkai(A,o){
    const r=o.r,dk=W.diKamp(me.x,me.z);
    if(dk>=0){
      const q=P6.soal6(r)[dk],v=A.st.s[dk]|0;
      panelUmum(true,W.KAMP[dk].nama+': '+q.t+(o.main?'':' (jawab setelah babak mulai)'),
        q.o.map((t,i)=>({t:P6.HURUF[i]+'. '+t,utama:v===i+1,kelas:'opsi',mati:!o.main,aksi:()=>{A.ubahSlot(dk,i+1);toast('Pos '+W.KAMP[dk].nama+': jawaban '+P6.HURUF[i]+'.');}})),
        's|'+r+'|'+dk+'|'+v+'|'+o.main);
    }else panelUmum(false);
    $('aksi').hidden=true;if(tahan)tahan=false;
    return -1;
  }
};
ALUR[6]=buatAlur(CFG6);
function ambilBatu(kode){
  const A=ALUR[2];
  if(me.a!==2||A.st.f!==1||me.tiles.length>=capNow()||blok())return;
  const r=A.st.r,k=W.diKamp(me.x,me.z),b=soal(r).batu[kode-1];if(k<0||!b||KAMP_JENIS[b.k]!==k)return;
  me.tiles.push(kode);me.carry=me.tiles.length;pilihKey='';kirimPosisi();
  toast('Membawa '+teksBatu(r,kode)+' ('+P2.NAMA_JENIS[b.k]+').');
}
/* pasang batu yang cocok dengan jenis slot; batu lama di slot itu dibuang */
function pasangBatu(i){
  const A=ALUR[2],r=A.st.r,sl=soal(r).slot[i];if(!sl)return false;
  const j=me.tiles.findIndex(k=>soal(r).batu[k-1].k===sl.k);
  if(j<0){toast('Slot ini butuh batu '+P2.NAMA_JENIS[sl.k]+'.');return false;}
  const kode=me.tiles.splice(j,1)[0];me.carry=me.tiles.length;A.ubahSlot(i,kode);kirimPosisi();
  return true;
}
/* tampilan dinding dan rintangan untuk babak aktif; kurva hanya dibuka setelah semua babak selesai */
function aturArena(){
  const r=Math.min(st.r,BABAK.length-1),k=kurvaBabak(r),a=aturanBabak(r);
  arena.setBabak({n:BABAK[r],xs:titikX(r),rumus:k.tx,aturan:'Tinggi kolom = nilai y di '+a.tx+' kolom',fKurva:selesai(st)?k.f:null});
  arena.setMedan(r);
  kotor=true;
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

/* ---------- papan skor: satu kolom per pos ---------- */
const NPOS=6;
function skorSemua(){const L=[skorTim(st)];for(let i=2;i<=NPOS;i++)L.push(ALUR[i]?ALUR[i].P.skorTim(ALUR[i].st):null);return L;}
const totalSk=sk=>(sk||[]).reduce((a,v)=>a+(v??0),0);
function gambarPapan(){
  const g=papan.c.getContext('2d'),W=640,H=400,X0=318,DX=52;
  g.fillStyle='#fff6e4';g.fillRect(0,0,W,H);g.strokeStyle='#1c2230';g.lineWidth=10;g.strokeRect(5,5,W-10,H-10);
  g.fillStyle='#1c2230';g.font='800 32px "Bricolage Grotesque","Arial Black",sans-serif';g.textAlign='left';g.textBaseline='middle';
  g.fillText('Papan skor',24,38);g.font='700 18px "Chakra Petch",sans-serif';g.textAlign='center';
  for(let j=0;j<NPOS;j++)g.fillText('P'+(j+1),X0+j*DX,40);
  const now=performance.now(),baris=[];
  for(const t of TIM){
    let d=papanData[t.id];
    if(saya&&t.id===saya.tim)d={n:1+anggota().length,sk:skorSemua()};
    else if(!d||now-d.t>70000)d=null;
    if(d&&d.n>0)baris.push({t,d});
  }
  baris.sort((a,b)=>totalSk(b.d.sk)-totalSk(a.d.sk)||b.d.n-a.d.n);
  if(!baris.length){g.font='700 24px "Chakra Petch",sans-serif';g.textAlign='left';g.fillText('Menunggu tim...',24,120);}
  baris.slice(0,8).forEach(({t,d},i)=>{
    const y=84+i*40;
    g.fillStyle=t.warna;g.fillRect(24,y-14,28,28);g.strokeStyle='#1c2230';g.lineWidth=3;g.strokeRect(24,y-14,28,28);
    g.fillStyle='#1c2230';g.textAlign='left';g.font='700 24px "Chakra Petch","Trebuchet MS",sans-serif';g.fillText('Tim '+t.nama,62,y);
    g.font='700 18px "Chakra Petch",sans-serif';g.fillText(d.n+' org',196,y);
    g.font='700 22px "Chakra Petch",sans-serif';g.textAlign='center';
    for(let j=0;j<NPOS;j++){const v=d.sk&&d.sk[j];g.fillText(v!=null?String(v):'-',X0+j*DX,y);}
  });
  papan.tx.needsUpdate=true;
}
function laporPapan(paksa){
  if(!rt||!otoritas())return;
  const ang2=anggota(),n=1+ang2.length,sk=skorSemua(),key=n+'/'+sk.join(',')+'/'+ang2.map(p=>p.id).sort().join(','),now=performance.now();
  if(!paksa&&key===lastLapor&&now-tLapor<15000)return;
  lastLapor=key;tLapor=now;kirim('ro',{t:saya.tim,n,sk,m:[[saya.id,saya.nama,kodeAv(saya.av)],...ang2.slice(0,11).map(p=>[p.id,p.nama,kodeAv(p.av)])]});
}

/* Tim lain: roster nyata dari papan, tetapi gerakannya simulasi lokal karena posisi asli seluruh kelas melampaui batas pesan. */
function selaraskanLuar(){
  if(!saya||AMAT)return;
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
const BOOST={s:{n:'Sepatu roket',k:5,d:'Lari 1,5x'},t:{n:'Tangan raksasa',k:8,d:'Bawa lebih banyak'},p:{n:'Perisai',k:6,d:'Kebal 1 tabrakan'},g:{n:'Gudang cepat',k:6,d:'Isi balok 2x'}};
let boostPilih=null,boostAktif=null,koinPakai=+(localStorage.getItem('ki-pakai')||0)||0,boostKey='';
let koinBonus=+(localStorage.getItem('ki-bonus')||0)||0;const koinAS={1:new Set(),2:new Set(),3:new Set(),4:new Set(),5:new Set(),6:new Set()};
const koinA={has:i=>koinAS[me&&me.a>=1?me.a:1].has(i),add:i=>koinAS[me&&me.a>=1?me.a:1].add(i)};
/* arena 3D yang aktif */
const A3=()=>me&&me.a>=2&&ALUR[me.a]?ALUR[me.a].P.arena:arena;
const saldo=()=>Math.max(0,koinAmbil.size+koinBonus-koinPakai);
const capNow=()=>me&&me.a>=2?((ALUR[me.a]&&ALUR[me.a].P.cap||CAP2)+(boostAktif==='t'?1:0)):(boostAktif==='t'?CAP+2:CAP);
/* babak dan status pos yang sedang dimasuki */
const rAktif=()=>AL()?AL().r():Math.min(st.r,BABAK.length-1);
const fAktif=()=>AL()?AL().st.f:st.f;
const selesaiAktif=()=>AL()?AL().selesai():selesai(st);
function pakaiBoost(){
  boostAktif=null;
  if(boostPilih&&saldo()>=BOOST[boostPilih].k){koinPakai+=BOOST[boostPilih].k;try{localStorage.setItem('ki-pakai',String(koinPakai));}catch(e){}boostAktif=boostPilih;}
  boostPilih=null;boostKey='';
}
let boostBuka=false;
function boostUI(){
  const box=$('boost'),tampil=me.a>=1&&fAktif()===0&&!selesaiAktif()&&$('roda').hidden&&!(me.a>=2&&W.diKamp(me.x,me.z)>=0);
  box.hidden=!tampil;
  const kunci=tampil+'|'+boostPilih+'|'+saldo()+'|'+boostBuka;
  $(me.a>=2?'a2-boost':'ar-boost').textContent=boostAktif?BOOST[boostAktif].n:(boostPilih?BOOST[boostPilih].n+' (siap)':'-');
  if(!tampil||kunci===boostKey)return;boostKey=kunci;
  box.textContent='';
  if(HP&&!boostBuka){const b=document.createElement('button');b.type='button';b.className='btn alt lipat';b.textContent=(boostPilih?'Boost: '+BOOST[boostPilih].n:'Pilih boost')+' (koin '+saldo()+')';
    b.addEventListener('click',()=>{boostBuka=true;boostKey='';boostUI();});box.append(b);return;}
  const j=document.createElement('div');j.className='bj';j.textContent='Boost satu babak (koin '+saldo()+')';box.append(j);
  for(const k in BOOST){
    const o=BOOST[k],b=document.createElement('button');b.type='button';b.className='btn alt';b.disabled=saldo()<o.k||(me.a>=2&&k==='g');
    b.setAttribute('aria-pressed',String(boostPilih===k));b.textContent=o.n+' '+o.k+'k';b.title=o.d;
    b.addEventListener('click',()=>{boostPilih=boostPilih===k?null:k;boostBuka=false;boostKey='';boostUI();});box.append(b);
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
function isiKoin(){$('c-koin').textContent='Koin '+saldo();$('stam-i').style.width=stam+'%';}
function petaMini(t){
  isiKoin();
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
  for(let gi=POS_AKTIF-1;gi>=0;gi--){const g=gerbang[gi];[px,py]=P(g.x,g.z);const dd=Math.hypot(px-cx,py-cy),ed=W/2-9;
   if(dd>ed){px=cx+(px-cx)/dd*ed;py=cy+(py-cy)/dd*ed;}
   miniX.fillStyle='#ff6f47';miniX.strokeStyle='#fff';miniX.lineWidth=2;miniX.beginPath();miniX.arc(px,py,7,0,7);miniX.fill();miniX.stroke();
   miniX.fillStyle='#fff';miniX.font='bold 9px sans-serif';miniX.textAlign='center';miniX.fillText(String(gi+1),px,py+3);}
  miniX.restore();
  miniX.fillStyle='#e8412c';miniX.beginPath();miniX.moveTo(cx,cy-6);miniX.lineTo(cx-5,cy+5);miniX.lineTo(cx+5,cy+5);miniX.fill();
  miniX.strokeStyle='#1c2230';miniX.lineWidth=2;miniX.beginPath();miniX.arc(cx,cy,W/2-2,0,7);miniX.stroke();
}
/* peta mini lembah: jalur, kamp dan stoknya, pad, tuas, koin, teman setim. Arah kamera ke atas. */
const WKAMP=['#2e9e5b','#e08a2b','#2f7fc1'];
function petaArena(t){
  if(t-tMini<.1)return;tMini=t;
  const WD=miniCv.width,H=miniCv.height,R=34,k=WD/2/R,cx=WD/2,cy=H/2,cy0=Math.cos(C.yaw),sy0=Math.sin(C.yaw),X=miniX;
  const P=(x,z)=>{const dx=x-me.x,dz=z-me.z;return [cx+(cy0*dx-sy0*dz)*k,cy+(sy0*dx+cy0*dz)*k];};
  const kotak=(o,w)=>{X.fillStyle=w;X.beginPath();[[o.x0,o.z0],[o.x1,o.z0],[o.x1,o.z1],[o.x0,o.z1]].forEach(([x,z],i)=>{const [a,b]=P(x,z);i?X.lineTo(a,b):X.moveTo(a,b);});X.closePath();X.fill();};
  const tepi=(x,z,w,r)=>{let [a,b]=P(x,z);const d=Math.hypot(a-cx,b-cy),ed=WD/2-9;const luar=d>ed;if(luar){a=cx+(a-cx)/d*ed;b=cy+(b-cy)/d*ed;}
    X.fillStyle=w;X.strokeStyle='#fff';X.lineWidth=2;X.beginPath();X.arc(a,b,luar?6:r,0,7);X.fill();X.stroke();return [a,b,luar];};
  X.clearRect(0,0,WD,H);X.save();X.beginPath();X.arc(cx,cy,WD/2-2,0,7);X.clip();
  X.fillStyle='#5f9a55';X.fillRect(0,0,WD,H);
  if(W.AIR)kotak(W.AIR,'#3f9bd8');if(W.JURANG)kotak(W.JURANG,'#4a463f');if(W.LINGKAR)for(const o of W.LINGKAR){const [a,b]=P(o.x,o.z);X.fillStyle='#e6cfa0';X.beginPath();X.arc(a,b,o.r*k,0,7);X.fill();}
  X.lineCap='round';X.strokeStyle='#e6cfa0';
  for(const s of W.JALUR){const [a,b]=P(s[0],s[1]),[c,d]=P(s[2],s[3]);X.lineWidth=2*s[4]*k;X.beginPath();X.moveTo(a,b);X.lineTo(c,d);X.stroke();}
  kotak(W.PLAZA,'#f2e3c2');kotak({x0:-10,x1:10,z0:-3,z1:0},'#1c2230');
  if(!gerbangBuka){const G=W.GERBANG,s0=W.JALUR[G.ruas],gz=(G.z0+G.z1)/2,gx=s0[0]+(s0[2]-s0[0])*(gz-s0[1])/(s0[3]-s0[1]),[a,b]=P(gx-2.1,gz),[c,d]=P(gx+2.1,gz);X.strokeStyle='#e5392b';X.lineWidth=4;X.beginPath();X.moveTo(a,b);X.lineTo(c,d);X.stroke();}
  X.fillStyle='#e6a800';for(let i=0;i<W.KOIN_A.length;i++){if(koinA.has(i))continue;const [a,b]=P(W.KOIN_A[i][0],W.KOIN_A[i][1]);X.fillRect(a-2,b-2,4,4);}
  X.font='bold 17px sans-serif';X.textAlign='center';X.textBaseline='middle';
  W.KAMP.forEach((d,i)=>{const [a,b,luar]=tepi(d.x,d.z,WKAMP[i],d.r*k*.8);if(!luar){X.fillStyle='#fff';X.fillText(me.a===2?['a d','f','b'][i]:String(st.g[i]|0),a,b+1);}});
  tepi(W.PAD.x,W.PAD.z,'#7bd38a',W.PAD.r*k);tepi(W.TUAS.x,W.TUAS.z,'#6fb7e9',W.TUAS.r*k);
  X.fillStyle='#2b6cff';for(const p of tim.values()){if(p.a!==1||p.bot)continue;const [a,b]=P(p.x,p.z);X.beginPath();X.arc(a,b,4,0,7);X.fill();}
  X.restore();
  X.fillStyle='#e8412c';X.beginPath();X.moveTo(cx,cy-7);X.lineTo(cx-6,cy+6);X.lineTo(cx+6,cy+6);X.fill();
  X.strokeStyle='#1c2230';X.lineWidth=2;X.beginPath();X.arc(cx,cy,WD/2-2,0,7);X.stroke();
}
/* ---------- masukan ---------- */
let rakitLalu=null;
let stam=100,larian=false,btnLari=false,kb=null,tHabis=0,lontar=null,gerbangBuka=false;
/* jejak langkah: titik-titik aman di belakang pemain, dipakai sebagai tujuan saat terpental */
const jejak=[];
function resetJejak(){jejak.length=0;if(me)jejak.push({x:me.x,z:me.z});}
function catatJejak(){if(me.a>=1&&W.lajur(rAktif(),me.x,me.z))return;const L=jejak[jejak.length-1];if(!L||Math.hypot(me.x-L.x,me.z-L.z)>=.6){jejak.push({x:me.x,z:me.z});if(jejak.length>24)jejak.shift();}}
function titikMundur(d){
  for(let i=Math.max(0,jejak.length-1-Math.ceil(d/.6));i>=0;i--)if(W.boleh(jejak[i].x,jejak[i].z,true)&&!W.lajur(rAktif(),jejak[i].x,jejak[i].z))return {x:jejak[i].x,z:jejak[i].z};
  return W.boleh(me.x,me.z,true)?{x:me.x,z:me.z}:{x:0,z:5.4};
}
/* satu langkah di lembah: hanya di jalur; menabrak tepi berarti bergeser menyusuri tepi */
function langkah(nx,nz){
  const gb=gerbangBuka;
  if(!W.boleh(me.x,me.z,gb)){if(!kb)kb=titikMundur(1.2);return;}
  if(W.boleh(nx,nz,gb)){me.x=nx;me.z=nz;return;}
  const e=.15,gx=W.jarakJalan(me.x+e,me.z)-W.jarakJalan(me.x-e,me.z),gz=W.jarakJalan(me.x,me.z+e)-W.jarakJalan(me.x,me.z-e),gl=Math.hypot(gx,gz)||1,
    ux=gx/gl,uz=gz/gl,dx=nx-me.x,dz=nz-me.z,dn=dx*ux+dz*uz,tx=me.x+dx-ux*(dn+.01),tz=me.z+dz-uz*(dn+.01);
  if(W.boleh(tx,tz,gb)){me.x=tx;me.z=tz;}
  else if(W.boleh(nx,me.z,gb))me.x=nx;else if(W.boleh(me.x,nz,gb))me.z=nz;
}
const key={w:0,a:0,s:0,d:0,q:0,e:0,sh:0},joy={x:0,y:0,id:null,ox:0,oy:0};
const peta={KeyW:'w',ArrowUp:'w',KeyA:'a',ArrowLeft:'a',KeyS:'s',ArrowDown:'s',KeyD:'d',ArrowRight:'d',KeyQ:'q',KeyE:'e',ShiftLeft:'sh',ShiftRight:'sh'};
let tahan=false;
addEventListener('keydown',e=>{
  if(e.target.tagName==='INPUT'||!mulai||blok())return;
  const k=peta[e.code];
  if(AMAT&&!k)return;
  if(k){key[k]=1;e.preventDefault();}
  else if(e.code==='KeyF'||e.code==='Enter'){if(!e.repeat)aksiMulai();e.preventDefault();}
  else if(e.code==='Space'){emote(1);e.preventDefault();}
  else if(e.code==='KeyZ')emote(2);
  else if(e.code==='KeyC')setPre(preI+1);
  else if(AL()&&/^Digit[1-9]$/.test(e.code)){const n=+e.code.slice(5);if(AL().P.angka)AL().P.angka(n);else{const b=$('pilih').querySelectorAll('button')[n-1];if(b&&!b.disabled&&!$('pilih').hidden)b.click();}}
});
addEventListener('keyup',e=>{const k=peta[e.code];if(k)key[k]=0;if(e.code==='KeyF'||e.code==='Enter')aksiAkhir();});
addEventListener('blur',()=>{for(const k in key)key[k]=0;tahan=false;});
const ptr=new Map();
cv.addEventListener('pointerdown',e=>{
  if(!mulai||blok())return;
  cv.setPointerCapture(e.pointerId);
  let mode='cam';
  if(e.pointerType!=='mouse'&&e.clientX<innerWidth*.45&&joy.id===null){
    mode='joy';if(!$('joy-tips').hidden){$('joy-tips').hidden=true;try{localStorage.setItem('ki-joy','1');}catch(_){}}joy.id=e.pointerId;joy.ox=e.clientX;joy.oy=e.clientY;joy.x=joy.y=0;
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
  const now=performance.now();if(me.emo&&now-me.emo.t<(me.emo.d||700))return;
  me.emo={k,t:now};kirim('emo',{id:saya.id,k});
}
$('b-lompat').addEventListener('click',()=>emote(1));
function keGerbang(i){if(!me||me.a!==0||blok())return;const g=gerbang[i];me.x=g.ax;me.z=g.az;me.vx=me.vz=0;kirimPosisi();$('m-pos').hidden=true;toast('Sampai di gerbang Pos '+(i+1)+'. Tekan Masuk Pos '+(i+1)+'.');}
$('b-pos').addEventListener('click',()=>{const m=$('m-pos');m.hidden=!m.hidden;});
for(let i=0;i<6;i++){const b=$('m-pos').children[i];if(b){b.disabled=i>=POS_AKTIF;b.addEventListener('click',()=>keGerbang(i));}}
{const b=$('b-lari'),on=e=>{btnLari=true;e.preventDefault();},off=()=>{btnLari=false;};
 b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointercancel',off);b.addEventListener('pointerleave',off);}

/* ---------- arena dan aksi ---------- */
function setArea(a){
  if(AL()&&a!==me.a)AL().flush();
  me.a=a;W=ALUR[a]?ALUR[a].P.M:M1;if(a===1)siapkanTrex();if(kual===4&&kualEf()!==keTerap){aud.lambat=0;terapKual();}
  arena.grup.visible=a===1;for(const k in ALUR)ALUR[k].P.arena.grup.visible=a===+k;lobiGrup.visible=a===0;rumput.position.y=a>=1?-9:0;
  $('arhud').hidden=a!==1;$('ar2').hidden=a<2;$('pilih').hidden=true;
  $('peta').hidden=false;$('peta').classList.toggle('ar',a>=1);$('stam').classList.toggle('ar',a>=1);$('c-koin').hidden=false;
  $('b-pos').hidden=a!==0;$('stam').hidden=false;$('b-lari').hidden=false;$('b-keluar').hidden=a===0;$('b-lompat').hidden=false;
  me.siap=0;kirim('siap',{id:saya.id,v:0});
  kb=null;lontar=null;gerbangBuka=false;arena.setGerbang(false);for(const k in ALUR)ALUR[k].P.arena.setGerbang(false);
  me.carry=0;me.tiles=[];
  if(a>=1){
    me.x=-6+Math.random()*12;me.z=W.PLAZA.z1-2.4+Math.random()*1;me.vx=me.vz=0;C.yaw=0;resetJejak();
    A3().setKoin(W.KOIN_A.map((_,i)=>!koinA.has(i)));
  }
  if(a===1){
    aturArena();arena.setWarna(timById(saya.tim).warna);
    kotor=true;toast(selesai(st)?'Pos 1 sudah selesai.':(st.f===1?'Babak sedang berjalan. Ambil balok di kamp, tambal bendungan.':'Lembah Waduk. Semua berdiri di pad hijau untuk mulai.'));
    if(selesai(st))bukaHasil();
  }else if(ALUR[a]){
    const A=ALUR[a];A.atur();toast(A.P.sambut(A));
    if(A.selesai())A.bukaHasil();
  }else{
    boostAktif=null;boostPilih=null;boostKey='';const g=gerbang[keluarDari-1]||gerbang[0];me.x=g.ax;me.z=g.az;me.vx=me.vz=0;$('hitung').hidden=true;
  }
  if(a>=1)keluarDari=a;
  kirimPosisi(true);
}
let keluarDari=1;
$('b-keluar').addEventListener('click',()=>{if(me.a>=1){flush();for(const k in ALUR)ALUR[k].flush();setArea(0);}});
$('w-tutup').addEventListener('click',()=>{$('hasil').hidden=true;hasilBuka=false;if(me.a>=1)setArea(0);});
function bukaHasil(){
  if(hasilBuka)return;
  const t=$('w-tabel');t.textContent='';
  const head=t.insertRow();for(const h of ['Babak','Kurva','Titik','Taksiran','Luas asli','Skor']){const th=document.createElement('th');th.textContent=h;head.append(th);}
  st.sr.forEach((c,i)=>{
    const r=skorRonde(i,c,st.w[i]),row=t.insertRow();
    [i+1,kurvaBabak(i).tx,aturanBabak(i).tx.replace('titik ',''),r.luas.toFixed(2),r.asli.toFixed(2),r.skor].forEach(v=>row.insertCell().textContent=v);
  });
  $('w-pos').textContent='Pos 1 selesai';$('w-h').textContent='Makin tipis kolomnya, makin dekat ke luas sebenarnya';
  $('w-p').textContent='Bandingkan taksiran timmu dengan luas asli tiap babak. Kalau lebar kolom terus diperkecil sampai mendekati nol, jumlah luas kolom itu mendekati luas sebenarnya, dan itulah integral.';
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
  revBuka=true;revPos=1;key.w=key.a=key.s=key.d=0;joy.x=joy.y=0;tahan=false;
  $('rev-h').textContent='Babak '+(r+1)+' terkunci: skor '+h.skor;
  const k=kurvaBabak(r),n=c.length;
  gambarMini($('rev-cv'),c,timById(saya.tim).warna,k.f);
  const L=[['Kurva',k.tx],['Titik contoh',aturanBabak(r).tx.replace('titik ','')],['Taksiran luas (jumlah balok)',h.luas.toFixed(2)],['Luas sebenarnya',h.asli.toFixed(2)],
    ['Selisih',(h.selisih>=0?'+':'')+h.selisih.toFixed(2)],['Ketepatan tinggi',h.akurasi+' / 100'],['Bonus kecepatan',Math.round(w/10)+'%']];
  const box=$('rev-t');box.textContent='';
  for(const [a,b] of L){const d=document.createElement('div');d.className='r';const s1=document.createElement('span'),s2=document.createElement('span');s1.textContent=a;s2.textContent=b;d.append(s1,s2);box.append(d);}
  const kt=aturanBabak(r).tx;
  $('rev-p').textContent=kt==='titik kiri'?'Titik kiri pada kurva naik memberi taksiran kurang dari luas sebenarnya (jumlah bawah).':kt==='titik kanan'?'Titik kanan pada kurva naik memberi taksiran lebih dari luas sebenarnya (jumlah atas). Pada kurva turun, hasilnya terbalik.':'Titik tengah biasanya paling dekat dengan luas sebenarnya.';
  $('rev').hidden=false;
  $('rev-ok').onclick=()=>{revBuka=false;$('rev').hidden=true;if(selesai(st))bukaHasil();};
}
let tAksi=0;
let idTekan=0;
function aksiMulai(){
  idTekan++;
  if(!me||blok())return;
  if(me.a===0){if(!$('aksi').hidden&&gerbangDekat)setArea(gerbangDekat.i+1);}else tahan=true;
}
let gerbangDekat=null;
let modeAksi=0; /* 1 = taruh, 2 = ambil kembali; ditentukan saat tombol mulai ditahan */
/* ketukan singkat di HP: lepas baru berlaku setelah dua bingkai, supaya ketukan tetap terbaca */
function aksiAkhir(){const i=idTekan;requestAnimationFrame(()=>requestAnimationFrame(()=>{if(i===idTekan){tahan=false;modeAksi=0;}}));}
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
function tabrak(now,h){
  if(boostAktif==='p'){boostAktif=null;tabrakTil=now+1600;toast('Perisai menahan tabrakan! ('+h.msg.replace('!','')+')');boostUI();return;}
  const ada=me.carry;me.carry=0;me.tiles=[];stunTil=now+800;tabrakTil=now+1600;getar(90);
  kb=titikMundur(h.mundur||3);me.vx=me.vz=0;kotor=true;
  toast(h.msg+(ada?(me.a===2?' Batu sandi jatuh.':' Balok jatuh.'):'')+(h.j==='ubin'||h.j==='palu'||h.j==='pintu'?'':' Lompat untuk menghindar.'));
}
function trexTick(now,tSec,dt,bisaKena){
  const d=trex.d;if(!d)return;
  const p=posTrex(W,trex.seed,tSec);d.grup.position.set(p.x,W.tinggiTanah(p.x,p.z),p.z);d.grup.rotation.y=p.arah;
  d.main(now<trex.serang||p.aum?'Attack':'Walk');d.langkah(KEC_TREX);d.perbarui(dt);   // kaki bergerak sesuai kecepatan
  const jr=jarakTrex(p,me.x,me.z);
  if(bisaKena&&me.carry>0&&jr<R_KENA)trexKena(now);
  else if(me.carry>0&&jr<R_AWAS&&now-trex.awas>6000){trex.awas=now;getar(40);toast('Awas T-Rex! Balok yang kamu bawa bisa jatuh.');}
}
function trexKena(now){
  if(boostAktif==='p'){boostAktif=null;tabrakTil=now+1600;trex.serang=now+1200;toast('Perisai menahan serangan T-Rex!');boostUI();return;}
  let n=me.carry,nama='';
  while(n>0){const k=kampKembali(W,me.x,me.z,st.g,GMAX);if(k<0)break;const m=Math.min(n,GMAX-st.g[k]);ubahDepot(k,m);n-=m;if(!nama)nama=W.KAMP[k].nama;}
  const jml=me.carry;me.carry=0;me.tiles=[];stunTil=now+900;tabrakTil=now+2500;trex.serang=now+1200;getar(120);
  kb=titikMundur(3);me.vx=me.vz=0;kotor=true;
  toast('T-Rex menyambar! '+jml+' balok jatuh dan kembali ke Kamp '+(nama||'terdekat')+'.');
}
function ubahDepot(k,d){
  st.g[k]=klem(st.g[k]+d,0,GMAX);const key=100+k;pend.set(key,(pend.get(key)||0)+d);
  if(pend.get(key)===0)pend.delete(key);
  tDelta=performance.now();ubahSt=true;kotor=true;
}
function aksiTick(now,col){
  if(!tahan){modeAksi=0;return;}
  if(now-tAksi<180||selesai(st))return;
  const dk=W.diKamp(me.x,me.z);
  if(col<0&&dk>=0&&me.carry>0&&st.f===1){
    if(st.g[dk]<GMAX){me.carry--;ubahDepot(dk,1);tAksi=now;tReda=now+900;}
    return;
  }
  if(col<0)return;
  if(!modeAksi)modeAksi=me.carry>0?1:2;
  if(modeAksi===1){
    if(me.carry>0&&st.c[col]<MAXBAG){me.carry--;ubahKolom(col,1);tAksi=now;}
  }else if(me.carry<capNow()&&st.c[col]>0){me.carry++;ubahKolom(col,-1);tAksi=now;}
}

/* ---------- kualitas dan audit ---------- */
/* Dua pengaturan terpisah. Kualitas = seberapa berat (resolusi, bayangan, kepadatan tumbuhan, jarak pandang).
   Gaya = seperti apa rupanya: realistik (cahaya siang, warna alami) atau sinematik (senja, kontras film, blur kedalaman). */
const KUAL=[
  {n:'rendah',pr:.75,bay:0,flora:.3,hias:0,kabut:[60,150],ket:'Tanpa bayangan, tumbuhan sedikit. Untuk HP lama.'},
  {n:'sedang',pr:1,bay:1024,flora:.6,hias:0,kabut:[80,200],ket:'Bayangan sederhana dan kabut. Untuk HP umum.'},
  {n:'tinggi',pr:1.5,bay:2048,flora:1,hias:1,kabut:[90,235],ket:'Bayangan halus, tumbuhan rapat. Untuk HP baru dan laptop.'},
  {n:'sangat tinggi',pr:2,bay:4096,flora:1,hias:1,kabut:[100,270],ket:'Resolusi penuh, bayangan paling tajam, pandangan jauh. Untuk laptop dengan GPU.'},
  /* Ultra: hanya berlaku di Pos 1 (di tempat lain sama dengan sangat tinggi), hanya dipilih manual, turun sendiri ke sangat tinggi bila tersendat */
  {n:'ultra',pr:1.5,bay:2048,flora:1,hias:1,kabut:[100,270],ultra:1,ket:'Khusus Pos 1: bahan beton, tanah, kayu, batu bertekstur, langit dan cahaya film. Unduh sekitar 0,4 MB saat pertama dipakai. Di pos lain sama dengan sangat tinggi.'}];
const GAYA={r:{n:'realistik'},s:{n:'sinematik'}};
function tebakKual(){
  let gpu='';try{const gl=renderer.getContext(),e=gl.getExtension('WEBGL_debug_renderer_info');gpu=String(e?gl.getParameter(e.UNMASKED_RENDERER_WEBGL):'').toLowerCase();}catch(e){}
  if(/swiftshader|llvmpipe|software/.test(gpu))return 0;
  const hp=/android|iphone|ipad|mobile/i.test(navigator.userAgent),inti=navigator.hardwareConcurrency||4,mem=navigator.deviceMemory||4;
  if(hp)return inti>=8&&mem>=6?2:(inti>=6&&mem>=4?1:0);
  return inti>=8?2:1;
}
let kual=1,gaya='r',kualManual=false,pasca=false,rtP=null,peringatFps=false,keTerap=-1,ultraMuat=0;
/* tingkat yang berlaku sekarang: Ultra hanya menyala di Pos 1 */
const kualEf=()=>kual===4&&!(me&&me.a===1)?3:kual;
try{const o=JSON.parse(localStorage.getItem('ki-grafis')||'null');if(o&&Number.isInteger(o.q)&&o.q>=0&&o.q<KUAL.length&&GAYA[o.g]){kual=o.q;gaya=o.g;kualManual=!!o.m;}else kual=tebakKual();}catch(e){kual=tebakKual();}
/* tahap akhir gaya sinematik: pemetaan nada, gradasi warna hangat-sejuk, vinyet, butiran halus, blur kedalaman */
const pScene=new THREE.Scene(),pCam=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
const pMat=new THREE.ShaderMaterial({depthTest:false,depthWrite:false,
  uniforms:{tC:{value:null},tD:{value:null},px:{value:new THREE.Vector2(1,1)},nf:{value:new THREE.Vector2(.3,280)},fokus:{value:20},dof:{value:0},waktu:{value:0}},
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
  fragmentShader:`precision highp float;varying vec2 vUv;uniform sampler2D tC,tD;uniform vec2 px,nf;uniform float fokus,dof,waktu;
float lin(float d){return nf.x*nf.y/(nf.y-d*(nf.y-nf.x));}
vec3 aces(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}
void main(){
  vec3 c=texture2D(tC,vUv).rgb;
  if(dof>0.){
    float d=lin(texture2D(tD,vUv).x),coc=dof*clamp((abs(d-fokus)-fokus*.5)/(fokus*1.8),0.,1.);
    if(coc>.02){vec2 r=px*coc*4.5;
      c=c*.2+.1*(texture2D(tC,vUv+r*vec2(1.,0.)).rgb+texture2D(tC,vUv+r*vec2(-1.,0.)).rgb+texture2D(tC,vUv+r*vec2(0.,1.)).rgb+texture2D(tC,vUv+r*vec2(0.,-1.)).rgb
        +texture2D(tC,vUv+r*vec2(.7,.7)).rgb+texture2D(tC,vUv+r*vec2(-.7,.7)).rgb+texture2D(tC,vUv+r*vec2(.7,-.7)).rgb+texture2D(tC,vUv+r*vec2(-.7,-.7)).rgb);}
  }
  c=aces(c*1.25);
  float l=dot(c,vec3(.299,.587,.114));
  c=mix(c*vec3(.95,.98,1.07),c*vec3(1.05,1.,.93),smoothstep(.12,.7,l));
  c=mix(vec3(l),c,1.06);c=(c-.5)*1.04+.5;
  vec2 q=vUv-.5;c*=1.-dot(q,q)*.7;
  c+=(fract(sin(dot(vUv*vec2(1920.,1080.)+waktu,vec2(12.9898,78.233)))*43758.5453)-.5)*.016;
  gl_FragColor=vec4(pow(clamp(c,0.,1.),vec3(1./2.2)),1.);
}`});
pScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),pMat));
function bisaPasca(){try{const gl=renderer.getContext();return !!(renderer.capabilities.isWebGL2!==false&&(gl.getExtension('EXT_color_buffer_float')||gl.getExtension('EXT_color_buffer_half_float')));}catch(e){return false;}}
function terapKual(){
  const ke=kualEf(),k=KUAL[ke],sin=gaya==='s',ult=ke===4;keTerap=ke;
  /* Ultra: aset dimuat malas saat pertama dibutuhkan; sementara belum siap, tampil seperti sangat tinggi */
  if(ult&&!ultraSiap()&&!ultraMuat){ultraMuat=1;muatUltra(renderer).then(()=>{ultraMuat=0;terapKual();},()=>{ultraMuat=0;if(kual===4){kual=3;terapKual();toast('Aset Ultra gagal diunduh. Kembali ke sangat tinggi.');}});}
  const UT=ult&&ultraSiap()?ultraAset():null;
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,k.pr));
  pohon.visible=ke>0;arena.setDetail(k.flora,!!k.hias);for(const id in ALUR)ALUR[id].P.arena.setDetail(k.flora,!!k.hias);
  const langit=UT&&!sin;   /* Ultra realistik: langit foto sebagai latar */
  if(langit)scene.background=UT.langit;else{if(!(scene.background&&scene.background.isColor))scene.background=new THREE.Color();scene.background.set(sin?0xf6c090:0x9fd4ee);}
  scene.fog=new THREE.Fog(sin?0xf3bd92:(langit?0xb9c4d2:0xa9d8ee),k.kabut[0]*(sin?.55:1),k.kabut[1]*(sin?.8:1));
  scene.environment=UT?UT.env:null;scene.environmentIntensity=UT?(sin?.3:.55):1;
  if(UT&&!sin){   /* cahaya sekitar hangat: langit-tanah hangat, matahari condong keemasan */
    hemi.color.set(0xfff0dc);hemi.groundColor.set(0x9a8260);hemi.intensity=.8;sun.color.set(0xffdca8);sun.intensity=2.5;
  }else{
    hemi.color.set(sin?0xffe2c4:0xffffff);hemi.groundColor.set(sin?0x8272a6:0x7aa860);hemi.intensity=sin?1.9:1.5;
    sun.color.set(sin?0xffb070:0xfff1d6);sun.intensity=sin?2.9:1.6;
  }
  if(sin)sunDir.set(-.62,.5,.58).normalize();else if(UT)sunDir.set(.5,.62,.6).normalize();else sunDir.set(.45,.8,.4).normalize();
  renderer.toneMapping=sin||UT?THREE.ACESFilmicToneMapping:THREE.NoToneMapping;renderer.toneMappingExposure=sin?.75:(UT?.95:1);
  arena.setUltra(UT,!!UT);   /* bahan PBR hanya di arena Pos 1 */
  const b=k.bay>0,ubah=renderer.shadowMap.enabled!==b||sun.shadow.mapSize.x!==k.bay||renderer.userData_tm!==renderer.toneMapping;
  renderer.shadowMap.enabled=b;sun.castShadow=b;renderer.shadowMap.type=ke>=2?THREE.PCFSoftShadowMap:THREE.PCFShadowMap;sun.shadow.radius=ult?3:1;
  if(b)sun.shadow.mapSize.set(k.bay,k.bay);
  if(ubah){
    renderer.userData_tm=renderer.toneMapping;
    if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null;}
    scene.traverse(o=>{if(o.material){if(Array.isArray(o.material))o.material.forEach(m=>{m.needsUpdate=true;});else o.material.needsUpdate=true;}});
  }
  pasca=sin&&ke>=1&&bisaPasca();pMat.uniforms.dof.value=ke>=2?1:0;
  ukur();segarGrafis();
  try{localStorage.setItem('ki-grafis',JSON.stringify({q:kual,g:gaya,m:kualManual}));}catch(e){}
}
function setGrafis(q,g,manual){
  if(Number.isInteger(q)&&q>=0&&q<KUAL.length)kual=q;if(GAYA[g])gaya=g;if(manual!==undefined)kualManual=!!manual;peringatFps=false;terapKual();
}
function segarGrafis(){
  const bk=$('g-kual'),bg=$('g-gaya');if(!bk)return;
  if(!bk.childElementCount){
    KUAL.forEach((k,i)=>{const b=document.createElement('button');b.type='button';b.className='btn alt';b.textContent=k.n[0].toUpperCase()+k.n.slice(1);b.addEventListener('click',()=>setGrafis(i,null,true));bk.append(b);});
    for(const id in GAYA){const b=document.createElement('button');b.type='button';b.className='btn alt';b.dataset.g=id;b.textContent=GAYA[id].n[0].toUpperCase()+GAYA[id].n.slice(1);b.addEventListener('click',()=>setGrafis(null,id));bg.append(b);}
  }
  [...bk.children].forEach((b,i)=>b.setAttribute('aria-pressed',String(i===kual)));
  [...bg.children].forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.g===gaya)));
  $('g-ket').textContent=KUAL[kual].ket+(gaya==='s'?(kual===0?' Sinematik di tingkat rendah hanya mengubah warna dan cahaya.':(kual===1?' Sinematik: warna film dan vinyet.':' Sinematik: warna film, vinyet, dan blur kedalaman.')):'')+(kualManual?'':' (dipilih otomatis)');
}
$('b-grafis').addEventListener('click',()=>{$('grafis').hidden=!$('grafis').hidden;$('audit').hidden=true;segarGrafis();});
function ukur(){
  renderer.setSize(innerWidth,innerHeight,false);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();
  if(pasca){
    const v=renderer.getDrawingBufferSize(new THREE.Vector2());
    if(!rtP||rtP.width!==v.x||rtP.height!==v.y){
      if(rtP){rtP.depthTexture.dispose();rtP.dispose();}
      rtP=new THREE.WebGLRenderTarget(v.x,v.y,{type:THREE.HalfFloatType,depthBuffer:true});
      rtP.depthTexture=new THREE.DepthTexture(v.x,v.y);
      pMat.uniforms.tC.value=rtP.texture;pMat.uniforms.tD.value=rtP.depthTexture;
    }
    pMat.uniforms.px.value.set(1/v.x,1/v.y);
  }else if(rtP){rtP.depthTexture.dispose();rtP.dispose();rtP=null;}
}
function gambar(fokus,t){
  if(pasca&&rtP){
    pMat.uniforms.fokus.value=fokus;pMat.uniforms.waktu.value=t%10;pMat.uniforms.nf.value.set(cam.near,cam.far);
    renderer.setRenderTarget(rtP);renderer.render(scene,cam);renderer.setRenderTarget(null);renderer.render(pScene,pCam);
  }else renderer.render(scene,cam);
}
addEventListener('resize',ukur);
const aud={n:0,t:0,min:999,fps:0,fmin:0,ping:null,pings:[],lambat:0,riwayat:[]};
function auditTick(dt){
  aud.n++;aud.t+=dt;const f=1/Math.max(dt,1e-4);if(f<aud.min)aud.min=f;
  if(aud.t>=2){
    aud.fps=aud.n/aud.t;aud.fmin=aud.min;hit.kps=hit.kirim/aud.t;hit.tps=hit.terima/aud.t;hit.kirim=hit.terima=0;
    aud.riwayat.push(Math.round(aud.fps));if(aud.riwayat.length>30)aud.riwayat.shift();
    if(aud.fps<27&&!document.hidden){if(++aud.lambat>=2){aud.lambat=0;
      if(kualEf()===4){kual=3;terapKual();toast('Ultra dimatikan agar lancar. Kembali ke sangat tinggi.');}
      else if(!kualManual&&kual>0){kual--;terapKual();toast('Kualitas diturunkan ke '+KUAL[kual].n+' agar lancar.');}
      else if(kualManual&&kual>0&&!peringatFps){peringatFps=true;toast('Permainan tersendat. Turunkan kualitas di menu Grafis.');}}}else aud.lambat=0;
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
  $('a-mode').textContent=rt?rt.mode:'-';$('a-q').textContent=KUAL[kual].n+', '+GAYA[gaya].n;
  $('a-msg').textContent=hit.kps.toFixed(1)+' / '+hit.tps.toFixed(1)+' per dtk';
  $('a-jeda').textContent=Math.round(jedaPos())+' / '+Math.round(jedaFlush())+' ms';
  $('a-beban').textContent=beban().toFixed(0)+' dari 100 per dtk';
  $('a-sesi').textContent=kelas?kelas.token+': '+cat.ok+' tersimpan'+(cat.gagal+cat.ditolak?', '+(cat.gagal+cat.ditolak)+' gagal':''):'tidak dipakai';
}
function laporan(){
  const n=nPemain(),r=aud.riwayat,avg=r.length?Math.round(r.reduce((a,b)=>a+b,0)/r.length):0,pg=aud.pings;
  return ['LAPORAN AUDIT LOBI INTEGRAL v2',
    'Waktu: '+new Date().toLocaleString('id-ID'),
    'Nama/tim/ruang: '+saya.nama+' / '+saya.tim+' / '+saya.kode,
    'Karakter: '+kodeAv(saya.av),
    'Perangkat: '+navigator.userAgent,
    'Layar: '+innerWidth+'x'+innerHeight+' @'+(devicePixelRatio||1),
    'Mode: '+(rt?rt.mode:'-')+', kualitas akhir: '+KUAL[kual].n+' ('+GAYA[gaya].n+'), kamera: '+PRE[preI].n,
    'FPS rata-rata (1 menit terakhir): '+avg+', terendah per jendela: '+(r.length?Math.min(...r):0),
    'Ping: '+(pg.length?('rata '+Math.round(pg.reduce((a,b)=>a+b,0)/pg.length)+' ms, maks '+Math.round(Math.max(...pg))+' ms, sampel '+pg.length):'tidak ada'),
    'Pemain: '+n.o+' orang, '+n.b+' bot, perkiraan kelas '+ntot()+(sim.on?' (simulasi)':''),
    'Pesan kirim/terima per detik: '+hit.kps.toFixed(1)+' / '+hit.tps.toFixed(1),
    'Jeda posisi/kirim aksi: '+Math.round(jedaPos())+' / '+Math.round(jedaFlush())+' ms',
    'Perkiraan beban proyek: '+beban().toFixed(0)+' dari 100 pesan per detik',
    'Sesi kelas: '+(kelas?kelas.token+' ('+kelas.user+'), tersimpan '+cat.ok+', gagal '+cat.gagal+', ditolak '+cat.ditolak:'tidak dipakai'),
    'Pos 1: babak '+Math.min(st.r+1,3)+', skor tim '+(skorTim(st)!=null?skorTim(st):'belum'),
    'Skor tiap pos: '+skorSemua().map((v,i)=>'P'+(i+1)+' '+(v??'-')).join(', ')].join('\n');
}
$('b-audit').addEventListener('click',()=>{$('audit').hidden=!$('audit').hidden;$('grafis').hidden=true;isiAudit();});
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
  else{const d=Math.max(0,Math.floor((WAKTU[st.r]*1000-(endAt-now))/1000));s=Math.floor(d/60)+':'+String(d%60).padStart(2,'0');}
  $('ar-waktu').textContent=s;
  const hm=$('hitung');
  if(hitungMundur&&st.f===0){hm.hidden=false;hm.textContent=String(Math.max(1,Math.ceil((hitungMundur-now)/1000)));}
  else hm.hidden=true;
}
function isiSiap(){
  const L=[...diri(),...anggota().filter(p=>p.a===me.a)];
  $('ar-siap').textContent=L.filter(p=>p.siap).length+'/'+L.length;
}

/* ---------- masuk ---------- */
let masukBerjalan=false;
function layarPenuhOtomatis(){
  try{if(HP&&!AMAT&&!document.fullscreenElement&&document.documentElement.requestFullscreen)document.documentElement.requestFullscreen({navigationUI:'hide'}).catch(()=>{});}catch(e){}
}
{const mandiri=matchMedia('(display-mode: fullscreen)').matches||matchMedia('(display-mode: standalone)').matches||navigator.standalone;
 if(HP&&!mandiri&&$('tip-hp'))$('tip-hp').hidden=false;}
$('b-masuk').addEventListener('click',async()=>{
  layarPenuhOtomatis();
  if(masukBerjalan)return;
  const tok=$('in-token').value.trim().toUpperCase().replace(/[^A-Z0-9-]/g,'');
  const nama=$('in-nama').value.trim(),kode=($('in-kode').value.trim()||tok).toUpperCase().replace(/[^A-Z0-9-]/g,'');
  if(!nama||!kode){$('m-msg').textContent='Isi nama dan kode ruang.';return;}
  /* sesi kelas bersifat opsional, tetapi bila token diisi harus berhasil agar tidak mengira skor tercatat padahal tidak */
  kelas=null;
  if(tok){
    const por=CT.dariPortal();
    if(por&&por.token===tok)kelas=por;
    else{
      const nim=$('in-nim').value.trim();
      if(!CT.TOKEN_SAH.test(tok)){$('m-msg').textContent='Token sesi tidak valid. Kosongkan untuk bermain tanpa pencatatan.';return;}
      if(!CT.NIM_SAH.test(nim)){$('m-msg').textContent='Isi NIM (angka lengkap), atau kosongkan token untuk bermain tanpa pencatatan.';return;}
      masukBerjalan=true;$('b-masuk').disabled=true;$('m-msg').textContent='Memeriksa sesi...';
      try{kelas=await CT.masukSesi(tok,nama,nim);}
      catch(e){$('m-msg').textContent=(e&&e.message||'Gagal masuk sesi.')+' Kosongkan token untuk bermain tanpa pencatatan.';masukBerjalan=false;$('b-masuk').disabled=false;return;}
      masukBerjalan=false;$('b-masuk').disabled=false;$('m-msg').textContent='';
    }
  }
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
  setSeed(kode+'|'+saya.tim);trex.seed=hashTeks(kode+'|'+saya.tim);st.g=stokBabak(st.r);for(const k in ALUR){const P=ALUR[k].P;if(P.setSeed)P.setSeed(kode+'|'+saya.tim);ALUR[k].st=P.stateBaru();ALUR[k].atur();}arena.setWarna(t.warna);aturArena();
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
  mulai=true;gambarPapan();setPre(0);$('b-lompat').hidden=false;$('peta').hidden=false;$('c-koin').hidden=false;$('b-pos').hidden=false;toast('Pos 1 ada di titik oranye pada peta mini. Atau tekan Ke Pos 1.');$('stam').hidden=false;$('b-lari').hidden=false;
  toast(HP?'Geser sisi kiri layar untuk berjalan, sisi kanan untuk memutar kamera. Cubit untuk zoom.':'Geser layar kiri untuk berjalan, geser kanan untuk memutar kamera. Dekati gerbang Pos 1.');
  if(HP){let sudah=false;try{sudah=!!localStorage.getItem('ki-joy');}catch(_){}$('joy-tips').hidden=sudah;jagaLayar();
    if(innerHeight>innerWidth)setTimeout(()=>{if(innerHeight>innerWidth)toast('Tips: putar HP mendatar agar pandangan lebih luas.');},6000);}
});
/* ---------- mode pengamat ---------- */
let amatMode='bebas',amatIkut=null,amatSig='',amatSigTim=null,gerbangAmat=false;
const labelArea=a=>a===0?'Lobi':'Pos '+a;
if(AMAT){
  $('kartu-main').hidden=true;$('kartu-amat').hidden=false;
  const tk=(Q.get('token')||'').toUpperCase().replace(/[^A-Z0-9-]/g,'').slice(0,20);
  $('am-token').value=tk;$('am-ruang').value=(Q.get('kode')||tk).toUpperCase().replace(/[^A-Z0-9-]/g,'').slice(0,20);
  if(AM.sudahMasuk())$('am-login').hidden=true;
  $('am-token').addEventListener('input',()=>{if(!$('am-ruang').dataset.sentuh)$('am-ruang').value=$('am-token').value.toUpperCase().replace(/[^A-Z0-9-]/g,'');});
  $('am-ruang').addEventListener('input',()=>{$('am-ruang').dataset.sentuh='1';});
}
$('b-amat').addEventListener('click',async()=>{
  if(masukBerjalan)return;
  const tok=$('am-token').value.trim().toUpperCase().replace(/[^A-Z0-9-]/g,''),msg=$('am-msg');
  const kode=($('am-ruang').value.trim()||tok).toUpperCase().replace(/[^A-Z0-9-]/g,'');
  if(!CT.TOKEN_SAH.test(tok)){msg.textContent='Isi token sesi yang valid.';return;}
  masukBerjalan=true;$('b-amat').disabled=true;msg.textContent='Memeriksa akun dosen...';
  try{
    if(!AM.sudahMasuk()){
      const em=$('am-em').value.trim(),pw=$('am-pw').value;
      if(!em||!pw)throw new Error('Isi email dan kata sandi dosen.');
      await AM.masukDosen(em,pw);
    }
    await AM.izin(tok);
  }catch(e){msg.textContent=(e&&e.message)||'Gagal masuk sebagai pengamat.';masukBerjalan=false;$('b-amat').disabled=false;return;}
  $('am-pw').value='';masukBerjalan=false;
  mulaiAmat(kode);
});
function mulaiAmat(kode){
  const id='amat'+Math.random().toString(36).slice(2,8);
  saya={id,nama:'Dosen',tim:'merah',kode,av:acakAv()};
  me=pemainBaru0();me.grp.visible=false;me.x=0;me.z=16;me.a=0;
  $('masuk').hidden=true;$('lhud').hidden=false;
  if(prev.r){prev.on=false;prev.r.dispose();prev.r.forceContextLoss&&prev.r.forceContextLoss();}
  $('c-ruang').textContent='Ruang '+kode;
  const ct=$('c-tim');ct.textContent='';ct.append('Pengamat');
  rt=sambungAmat(kode,{
    status:s=>{
      if(s==='luring'&&!Q.has('lokal'))toast('Server tidak terjangkau. Mode luring: hanya antar-tab di perangkat ini.');
      else if(s==='putus')toast('Koneksi terputus. Muat ulang halaman untuk masuk lagi.');
      isiAudit();
    },hadir:onHadir,pesan:onPesan},Q.has('lokal'));
  mulai=true;gambarPapan();setPre(0);
  $('amat').hidden=false;areaAmat(0);
  toast('Pilih tim di panel bawah. Seret untuk memutar kamera, roda atau cubit untuk zoom.');
  setInterval(amatUI,600);amatUI();
  {const tq=Q.get('tim');if(tq)setTimeout(()=>pilihTimAmat(tq),300);}
  $('am-lipat').addEventListener('click',()=>{const L=$('amat').classList.toggle('lipat');$('am-lipat').textContent=L?'Buka panel':'Ciutkan panel';$('am-lipat').setAttribute('aria-expanded',String(!L));});
}
/* hanya sisi tampilan area (tanpa interaksi pemain) */
function areaAmat(a){
  me.a=a;W=ALUR[a]?ALUR[a].P.M:M1;if(a===1)siapkanTrex();if(kual===4&&kualEf()!==keTerap){aud.lambat=0;terapKual();}
  arena.grup.visible=a===1;for(const k in ALUR)ALUR[k].P.arena.grup.visible=a===+k;lobiGrup.visible=a===0;rumput.position.y=a>=1?-9:0;
  $('arhud').hidden=a!==1;$('ar2').hidden=a<2;$('pilih').hidden=true;$('hitung').hidden=true;
  gerbangAmat=false;arena.setGerbang(false);for(const k in ALUR)ALUR[k].P.arena.setGerbang(false);
  if(a>=1)A3().setKoin(W.KOIN_A.map(()=>true));
  if(a===1){aturArena();arena.setWarna(timById(saya.tim).warna);kotor=true;}
  else if(ALUR[a]){ALUR[a].atur();ALUR[a].kotor=true;}
  amatSig='';
}
function keArea(a){
  amatMode='bebas';amatIkut=null;areaAmat(a);C.yaw=0;
  me.x=0;me.z=a===0?16:W.PLAZA.z1-2.4;
}
function pilihTimAmat(t){
  if(!AMAT||!saya||!TIM.some(x=>x.id===t))return;
  saya.tim=t;amatSigTim=t;
  for(const id of [...tim.keys()])hapusPemain(id);
  setSeed(saya.kode+'|'+t);trex.seed=hashTeks(saya.kode+'|'+t);st=stateBaru();st.g=stokBabak(st.r);pend.clear();hitungMundur=0;endAt=0;
  for(const k in ALUR){const A=ALUR[k],P=A.P;if(P.setSeed)P.setSeed(saya.kode+'|'+t);A.st=P.stateBaru();A.pend.clear();A.hitung=0;A.endAt=0;A.kotor=true;}
  amatMode='bebas';amatIkut=null;
  rt.pilih(t);areaAmat(me.a);
  toast('Memuat tim '+timById(t).nama+'...');
}
function loopAmat(dt,t,now){
  if(key.q)C.yaw+=1.8*dt;if(key.e)C.yaw-=1.8*dt;
  const ikut=amatMode==='ikuti'?tim.get(amatIkut):null;
  if(amatMode==='ikuti'&&!ikut){amatMode='bebas';amatIkut=null;amatSig='';}
  if(ikut){
    if(ikut.a!==me.a)areaAmat(ikut.a);
    const k=Math.min(1,dt*6);me.x+=(ikut.x-me.x)*k;me.z+=(ikut.z-me.z)*k;
  }else{
    let ix=joy.x+key.d-key.a,iz=joy.y+key.s-key.w;const m=Math.hypot(ix,iz);
    if(m>1){ix/=m;iz/=m;}
    const sy=Math.sin(C.yaw),cy=Math.cos(C.yaw),v=key.sh?30:15;
    me.x+=(cy*ix+sy*iz)*v*dt;me.z+=(-sy*ix+cy*iz)*v*dt;
    if(me.a===0){const r=Math.hypot(me.x,me.z);if(r>RMAX){me.x*=RMAX/r;me.z*=RMAX/r;}}
    else{me.x=klem(me.x,W.DUNIA.x0+1,W.DUNIA.x1-1);me.z=klem(me.z,-1.4,W.DUNIA.z1-1);}
  }
  /* anggota tim yang dipantau: halus ke posisi terakhir, hanya yang berada di area yang sama terlihat */
  for(const p of tim.values()){
    if(now-p.tMsg<20000){p.tx+=p.vx*dt;p.tz+=p.vz*dt;}else{p.vx=p.vz=0;}
    const k=Math.min(1,dt*6);p.x+=(p.tx-p.x)*k;p.z+=(p.tz-p.z)*k;
    p.grp.visible=p.a===me.a;if(p.grp.visible)animAv(p,dt,t,now);
  }
  if(me.a>=1){
    const tSec=Date.now()/1000,ada=anggota().filter(p=>p.a===me.a);
    A3().animMedan(tSec,dt);
    const buka=ada.some(p=>W.diTuas(p.x,p.z));
    if(buka!==gerbangAmat){gerbangAmat=buka;A3().setGerbang(buka);}
    A3().padAnim(t,ada.some(p=>p.siap)?1:0);
    bawaItems.length=0;
    for(const p of ada)if(p.carry>0)bawaItems.push({x:p.x,z:p.z,y:p.grp.userData.h+.3+p.grp.position.y,n:p.carry});
    if(me.a===1){
      if(!selesai(st)&&st.f===0&&hitungMundur&&now>=hitungMundur){hitungMundur=0;st.f=1;endAt=now+WAKTU[st.r]*1000;kotor=true;}
      arena.setBawa(bawaItems);
      if(kotor){arena.setBags(selesai(st)?st.sr[BABAK.length-1]:st.c);arena.setStok(st.g,stokBabak(Math.min(st.r,BABAK.length-1)));isiArena();kotor=false;}
      if(now-tKiriman>400){tKiriman=now;isiArena();isiSiap();}
      isiWaktu(now);
    }else if(ALUR[me.a]){
      const A=AL(),P=A.P;
      if(P.anim)P.anim(dt,t);
      A.alur(now,false);
      P.arena.setBawa(bawaItems);
      if(A.kotor){P.arena.setSlot(A.tampilS(),-1,A);A.kotor=false;}
      if(now-tKiriman>400){tKiriman=now;P.arena.setSlot(A.tampilS(),-1,A);}
      A.hud(now);
    }
  }
}
/* panel bawah: pilih tim, lihat anggota (ikuti), atau pindah area dengan kamera bebas */
function amatUI(){
  if(!AMAT||!saya)return;
  const ang=anggota();
  const sig=[amatSigTim,amatMode,amatIkut,me.a,ang.map(p=>p.id+':'+p.nama+':'+p.a).join(','),TIM.map(x=>(papanData[x.id]||{}).n||0).join(',')].join('|');
  const sk=amatSigTim?skorSemua().map((v,i)=>'P'+(i+1)+' '+(v??'-')).join(', '):'';
  $('am-info').textContent=amatSigTim?('Tim '+timById(amatSigTim).nama+': '+ang.length+' anggota terhubung. Skor tim: '+sk+'.'):'Pilih tim untuk melihat anggota dan posisinya. Kamera bebas: WASD terbang, Q/E memutar, Shift lebih cepat.';
  if(sig===amatSig)return;amatSig=sig;
  const tombol=(teks,aktif,fn,warna)=>{const b=document.createElement('button');b.type='button';b.className='btn alt';b.setAttribute('aria-pressed',String(!!aktif));
    if(warna){const w=document.createElement('span');w.className='sw';w.style.background=warna;b.append(w);}b.append(teks);b.addEventListener('click',fn);return b;};
  const kt=$('am-tim');kt.textContent='';
  for(const x of TIM){const n=x.id===amatSigTim?ang.length:((papanData[x.id]||{}).n||0);kt.append(tombol(x.nama+(n?' ('+n+')':''),x.id===amatSigTim,()=>pilihTimAmat(x.id),x.warna));}
  const ka=$('am-ang');ka.textContent='';
  ka.append(tombol('Kamera bebas',amatMode==='bebas',()=>{amatMode='bebas';amatIkut=null;amatSig='';amatUI();}));
  for(const p of ang)ka.append(tombol(p.nama+' · '+labelArea(p.a),amatMode==='ikuti'&&amatIkut===p.id,()=>{amatMode='ikuti';amatIkut=p.id;if(p.a!==me.a)areaAmat(p.a);amatSig='';amatUI();}));
  const kr=$('am-area');kr.textContent='';
  for(let a=0;a<=POS_AKTIF;a++)kr.append(tombol(labelArea(a),me.a===a,()=>{keArea(a);amatUI();}));
}
/* ---------- kenyamanan HP ---------- */
function getar(ms){if(HP&&navigator.vibrate)try{navigator.vibrate(ms);}catch(e){}}
let kunciLayar=null;
async function jagaLayar(){try{if('wakeLock' in navigator&&!document.hidden&&!kunciLayar){kunciLayar=await navigator.wakeLock.request('screen');kunciLayar.addEventListener('release',()=>{kunciLayar=null;});}}catch(e){}}
document.addEventListener('visibilitychange',()=>{if(HP&&mulai&&!document.hidden)jagaLayar();});
$('b-menu').addEventListener('click',()=>{const L=$('lhud'),b=!L.classList.contains('buka');L.classList.toggle('buka',b);$('b-menu').setAttribute('aria-expanded',String(b));$('b-menu').textContent=b?'Tutup':'Menu';if(!b){$('grafis').hidden=true;$('audit').hidden=true;}});
$('b-layar').addEventListener('click',async()=>{
  try{if(document.fullscreenElement)await document.exitFullscreen();else{await document.documentElement.requestFullscreen({navigationUI:'hide'});try{await screen.orientation.lock('landscape');}catch(e){}}}catch(e){toast('Layar penuh tidak didukung peramban ini.');}
});
document.addEventListener('fullscreenchange',()=>{$('b-layar').textContent=document.fullscreenElement?'Keluar layar penuh':'Layar penuh';});
for(const id of ['ar2','arhud']){const el=$(id);if(HP)el.classList.add('ringkas');el.addEventListener('click',()=>{if(HP)el.classList.toggle('ringkas');});}
function pemainBaru0(){
  const p=pemainBaru({id:saya.id,nama:saya.nama,tim:saya.tim,av:kodeAv(saya.av)},false);
  tim.delete(saya.id);p.x=(Math.random()-.5)*8;p.z=8+Math.random()*4;p.carry=0;p.tiles=[];return p;
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
  return Math.hypot(me.x-px,me.z-pz)>1||Math.hypot(me.vx-lalu.vx,me.vz-lalu.vz)>.8||me.carry!==lalu.c||me.a!==lalu.a;
}

/* ---------- animasi avatar ---------- */
function animAv(p,dt,t,now){
  const u=p.grp.userData,sp=Math.hypot(p.vx,p.vz),gerak=sp>.3;
  let y=0,spin=0,lompat=0;
  if(p.emo){
    const k=(now-p.emo.t)/(p.emo.d||700);
    if(k>=1)p.emo=null;else if(p.emo.k===1){y=Math.sin(k*Math.PI)*1.6;lompat=1;}else if(p.emo.k===3){y=Math.sin(k*Math.PI)*3.4;lompat=1;}else spin=k*Math.PI*2;
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
  p.grp.position.set(p.x,y+bob+(p.a>=1?W.tinggi(p.x,p.z):0),p.z);
  if(gerak&&!spin){const a=Math.atan2(p.vx,p.vz);let d=a-p.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));p.yaw+=d*Math.min(1,dt*10);}
  u.pivot.rotation.y=p.yaw+spin;
  u.mesh.rotation.z=gerak?Math.sin(p.ph||0)*.05:0;
  u.mesh.scale.y=1+(gerak?0:Math.sin(t*2.2+p.fase)*.015);
  u.ring.position.y=.05-(y+bob);
}

/* ---------- putaran utama ---------- */
const kamP=new THREE.Vector3(),kamL=new THREE.Vector3(),bawaItems=[];let kamY=0;
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
  if(AMAT&&mulai){
    loopAmat(dt,t,now);tx=me.x;tz=me.z;kamY+=((me.a>=1?W.tinggi(me.x,me.z):0)-kamY)*Math.min(1,dt*6);
  }else if(mulai){
    if(key.q)C.yaw+=1.8*dt;if(key.e)C.yaw-=1.8*dt;
    if(lontar){
      const u=Math.min(1,(now-lontar.t0)/lontar.dur),sm=u*u*(3-2*u);
      me.x=lontar.x0+(lontar.x1-lontar.x0)*sm;me.z=lontar.z0+(lontar.z1-lontar.z0)*sm;
      me.vx=0;me.vz=(lontar.z1-lontar.z0)/lontar.dur*1000*.5;
      if(u>=1){lontar=null;tabrakTil=now+700;me.vx=me.vz=0;resetJejak();}
    }else{
      let ix=joy.x+key.d-key.a,iz=joy.y+key.s-key.w;const m=Math.hypot(ix,iz);
      if(m>1){ix/=m;iz/=m;}
      if(blok()||now<stunTil||m<.12){ix=0;iz=0;}
      /* gerak relatif kamera: dorong ke atas berarti maju searah layar */
      const lari=(key.sh||btnLari)&&stam>(larian?0:25)&&m>=.12;
      if(lari){stam=Math.max(0,stam-30*dt);larian=true;}else{larian=false;stam=Math.min(100,stam+18*dt);}
      const sy=Math.sin(C.yaw),cy=Math.cos(C.yaw),v=SPD*(1-.04*me.carry)*(lari?(me.a>=1?1.5:SPRINT):1)*(boostAktif==='s'?1.5:1)*((me.a>=1&&me.emo&&me.emo.k===1&&now-me.emo.t<700)?.45:1);
      me.vx=(cy*ix+sy*iz)*v;me.vz=(-sy*ix+cy*iz)*v;
      if(me.a===0){me.x+=me.vx*dt;me.z+=me.vz*dt;const r=Math.hypot(me.x,me.z);if(r>RMAX){me.x*=RMAX/r;me.z*=RMAX/r;}}
      else if(kb){
        /* terpental halus: meluncur ke titik aman di jejak, tanpa lompatan posisi */
        const f=Math.min(1,dt*9);me.x+=(kb.x-me.x)*f;me.z+=(kb.z-me.z)*f;if(Math.hypot(kb.x-me.x,kb.z-me.z)<.05){kb=null;resetJejak();}
      }else{
        langkah(me.x+me.vx*dt,me.z+me.vz*dt);
        const md=W.medanBabak(rAktif());
        if(fAktif()===1&&W.diBan(md,me.x,me.z)&&!(me.emo&&me.emo.k===1&&now-me.emo.t<700)){const v=W.kecBan(md,Date.now()/1000)*dt;if(md.ban.ax==='x')langkah(me.x+v,me.z);else langkah(me.x,me.z+v);}
        /* ikut terbawa rakit yang sedang dinaiki */
        /* geser sejauh perpindahan rakit menurut jam dinding, jadi tetap menempel walau bingkai lambat */
        if(fAktif()===1){const T=Date.now()/1000,i=W.rakitDi(md,me.x,me.z,T);
          if(i>=0){const R=md.rakit[i],sN=W.posRakit(R,T);if(rakitLalu&&rakitLalu.i===i){const d=sN-rakitLalu.s;if(R.ax==='x')me.x+=d;else me.z+=d;}rakitLalu={i,s:sN};}else rakitLalu=null;}
        if(now>=tabrakTil&&!kb)catatJejak();
      }
    }
    if(SUTRADARA&&window.__KAM&&window.__KAM.vx!=null){me.vx=window.__KAM.vx;me.vz=window.__KAM.vz||0;}
    animAv(me,dt,t,now);

    /* posisi dan aksi */
    if(perluPosisi(now))kirimPosisi();
    if(pend.size&&now-tFlush>jedaFlush())flush();
    for(const p of tim.values()){
      if(p.bot){
        p.fase+=dt;if(p.fase>3){p.fase=0;const a=Math.random()*Math.PI*2,vv=Math.random()<.3?0:3+Math.random()*3;p.vx=Math.cos(a)*vv;p.vz=Math.sin(a)*vv;}
        p.x+=p.vx*dt;p.z+=p.vz*dt;const rr=Math.hypot(p.x,p.z);if(rr>20){p.vx=-p.x/rr*4;p.vz=-p.z/rr*4;}
        p.a=me.a;if(p.a>=1){p.x=klem(p.x,-13,13);p.z=klem(p.z,1,6);}
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
      const b=$('aksi');gerbangDekat=dalam&&dekat.aktif?dekat:null;b.hidden=!(gerbangDekat&&!blok());if(gerbangDekat)b.textContent='Masuk Pos '+(dekat.i+1);
      if(dalam&&!dekat.aktif&&now-toastGerbang>4000){toastGerbang=now;toast('Pos '+(dekat.i+1)+' ('+dekat.nama+') masih terkunci di prototipe ini.');}
    }else{
      const P2a=me.a>=2,blk=blok(),tSec=Date.now()/1000,r=rAktif(),main=fAktif()===1&&!selesaiAktif();
      A3().animMedan(tSec,dt);
      /* gerbang jalan pintas terbuka selama ada anggota tim di pelat tuas pos yang sama */
      {
        let buka=W.diTuas(me.x,me.z);
        if(!buka)for(const p of anggota())if(p.a===me.a&&W.diTuas(p.x,p.z)){buka=true;break;}
        if(buka!==gerbangBuka){gerbangBuka=buka;A3().setGerbang(buka);if(buka&&W.diTuas(me.x,me.z))toast('Gerbang jalan pintas terbuka selama kamu berdiri di sini.');}
      }
      /* rintangan: kebal sebentar setelah tertabrak */
      if(main&&!lontar&&!kb&&now>=stunTil&&now>=tabrakTil&&!blk){
        const udara=!!(me.emo&&me.emo.k===1&&Math.sin(((now-me.emo.t)/700)*Math.PI)*1.6>.7);
        const h=W.bahaya(r,me.x,me.z,tSec,udara);if(h)tabrak(now,h);
      }
      if(me.a===1&&TREX_ON)trexTick(now,tSec,dt,main&&!lontar&&!kb&&now>=stunTil&&now>=tabrakTil&&!blk);
      /* trampolin: melempar pemain melewati air */
      {
        const md=W.medanBabak(r);
        if(main&&md.tramp&&!lontar&&!kb&&!blk&&now>=stunTil&&!me.emo&&W.diTramp(md,me.x,me.z)){
          const tr=md.tramp;lontar={t0:now,dur:tr.dur,x0:me.x,z0:me.z,x1:tr.x1,z1:tr.z1};
          me.emo={k:3,t:now,d:tr.dur};kirim('emo',{id:saya.id,k:3});toast('Trampolin!');
        }
      }
      /* koin petualang di sudut dunia */
      for(let i=0;i<W.KOIN_A.length;i++){
        if(koinA.has(i))continue;
        if(Math.abs(me.x-W.KOIN_A[i][0])<1.3&&Math.abs(me.z-W.KOIN_A[i][1])<1.3){
          koinA.add(i);koinBonus++;try{localStorage.setItem('ki-bonus',String(koinBonus));}catch(e){}
          A3().setKoin(W.KOIN_A.map((_,j)=>!koinA.has(j)));toast('Koin petualang! Saldo '+saldo()+'.');
        }
      }
      isiKoin();petaArena(t);
      if(fAktif()===0&&boostAktif){boostAktif=null;}
      boostUI();
      /* pad: sebelum babak berarti siap mulai, selama babak berarti kunci */
      const di=W.diPad(me.x,me.z)&&!blk?1:0;
      if(di!==me.siap){me.siap=di;if(di){flush();for(const k in ALUR)ALUR[k].flush();}kirim('siap',{id:saya.id,v:di});}
      A3().padAnim(t,me.siap);
      if(!P2a){
        const n=BABAK[r];
      const col=main&&now>=stunTil?kolomDari(n,me.x,me.z):-1;
      arena.sorot(col);
      /* roda kurva di awal tiap babak (hanya jika babak belum berjalan) */
      if(!selesai(st)){
        if(st.f===1)rodaR=st.r;
        else if(!blk&&rodaR!==st.r)bukaRoda(st.r);
      }
      /* gudang mengisi tangan pelan: satu balok tiap 0,7 detik */
      const dk=W.diKamp(me.x,me.z);
      if(main&&dk>=0&&!tahan&&me.carry<capNow()&&st.g[dk]>0&&now-tReda>(boostAktif==='g'?350:700)){me.carry++;tReda=now;ubahDepot(dk,-1);}
      if(main&&dk>=0&&st.g[dk]<=0&&me.carry<capNow()&&now-tHabis>3500){tHabis=now;toast('Kamp '+W.KAMP[dk].nama+' habis. Cari kamp lain.');}
      const b=$('aksi');
      const bisaTaruh=col>=0&&me.carry>0&&st.c[col]<MAXBAG,bisaAmbil=col>=0&&me.carry===0&&st.c[col]>0,bisaKembali=main&&col<0&&dk>=0&&me.carry>0&&st.g[dk]<GMAX;
      b.hidden=blk||!(bisaTaruh||bisaAmbil||bisaKembali||(tahan&&col>=0));
      if(!b.hidden)b.textContent=bisaKembali?'Kembalikan balok':((modeAksi?modeAksi===1:me.carry>0)?'Taruh balok':'Ambil kembali');
      aksiTick(now,col);
      if(!selesai(st)){
        const L=[...diri(),...anggota().filter(p=>p.a===1)],semua=L.every(p=>p.siap),pem=pemimpinKunci();
        if(st.f===0){
          if(hitungMundur){
            if(now>=hitungMundur){hitungMundur=0;st.f=1;endAt=now+WAKTU[st.r]*1000;pakaiBoost();toast('MULAI!'+(boostAktif?' Boost: '+BOOST[boostAktif].n+'.':''));kotor=true;}
          }else if(pem&&semua&&!blk){
            if(!tSiap)tSiap=now;
            if(now-tSiap>1200){tSiap=0;kirim('mulai',{r:st.r});mulaiHitung();}
          }else tSiap=0;
        }else{
          const sisa=endAt-now;
          /* tanpa batas waktu: babak hanya terkunci saat semua berdiri di pad; kecepatan hanya bonus */
          if(pem&&semua&&jumlah(st.c)>0&&!blk){
            if(!tSiap)tSiap=now;
            if(now-tSiap>1200){tSiap=0;const c=st.c.slice(),w=Math.round(1000*Math.max(0,sisa)/(WAKTU[st.r]*1000));kirim('kunci',{r:st.r,c,w});kunciBabak(c,w);}
          }else tSiap=0;
        }
      }else tSiap=0;
      /* balok yang dibawa */
      bawaItems.length=0;
      for(const p of [...diri(),...anggota()])if(p.a===1&&p.carry>0)bawaItems.push({x:p.x,z:p.z,y:p.grp.userData.h+.3+(p.grp.position.y),n:p.carry});
      arena.setBawa(bawaItems);
      if(kotor){arena.setBags(selesai(st)?st.sr[BABAK.length-1]:st.c);arena.setStok(st.g,stokBabak(Math.min(st.r,BABAK.length-1)));isiArena();kotor=false;}
      if(now-tKiriman>400){tKiriman=now;isiArena();isiSiap();}
      isiWaktu(now);
      }else{
        /* ---------- pos berbasis slot (2 sampai 6): interaksi khusus pos, lalu alur mulai dan kunci ---------- */
        const A=AL(),P=A.P;
        const sl=P.bingkai(A,{now,r,main,blk,dt,t,tSec});
        if(P.anim)P.anim(dt,t);
        A.alur(now,blk);
        bawaItems.length=0;
        for(const p of [...diri(),...anggota()])if(p.a===me.a&&p.carry>0)bawaItems.push({x:p.x,z:p.z,y:p.grp.userData.h+.3+(p.grp.position.y),n:p.carry});
        P.arena.setBawa(bawaItems);
        if(A.kotor){P.arena.setSlot(A.tampilS(),-1,A);A.kotor=false;}
        if(now-tKiriman>400){tKiriman=now;P.arena.setSlot(A.tampilS(),sl,A);}
        A.hud(now);
      }
    }
    /* rekonsiliasi: otoritas menyiarkan keadaan setelah tenang */
    if(ubahSt&&otoritas()&&now-tDelta>3000&&now-tStKirim>8000&&!pend.size){stKirim();ubahSt=false;}
    for(const k in ALUR)ALUR[k].rekon(now);
    tx=me.x;tz=me.z;kamY+=((me.a>=1?W.tinggi(me.x,me.z):0)-kamY)*Math.min(1,dt*6);
  }
  /* kamera */
  const k=Math.min(1,dt*8);C.d+=(C.td-C.d)*k;if(!fp())C.p+=(C.tp-C.p)*k;
  const ks=cam.aspect<1?(HP?1.35:1.55):(HP?.85:1),sp=Math.sin(C.p),cp=Math.cos(C.p);
  if(!mulai){
    const y=t*.1;cam.position.set(tx+Math.sin(y)*28,14,tz+Math.cos(y)*28);cam.lookAt(tx,1,tz);
  }else if(fp()&&C.d<1.5){
    const jy=me.grp.position.y;cam.position.set(me.x,2.7+jy,me.z);
    cam.lookAt(me.x-Math.sin(C.yaw)*cp,2.7+jy-sp,me.z-Math.cos(C.yaw)*cp);
  }else{
    const ar=mulai&&me.a>=1,D=C.d*ks*(ar?(HP?1.35:1.6):1),oy=(ar?2:1.2)+kamY;
    kamP.set(tx+D*Math.sin(C.yaw)*cp,oy+D*sp,tz+D*Math.cos(C.yaw)*cp);
    if(ar){kamP.x=klem(kamP.x,W.DUNIA.x0+1,W.DUNIA.x1-1);kamP.z=klem(kamP.z,-1.4,W.DUNIA.z1-1);kamP.y=Math.max(kamP.y,W.tinggiTanah(kamP.x,kamP.z)+1.4);}
    cam.position.copy(kamP);cam.lookAt(tx,oy,tz);
    if(ar){cam.updateMatrixWorld();kamL.set(tx,kamY+1.2,tz).applyMatrix4(cam.matrixWorldInverse);uTembus.value.set(-kamL.x,-kamL.y,-kamL.z);}else uTembus.value.z=-1;
  }
  /* kamera sutradara: hanya aktif dengan ?sutradara=1, untuk merekam video */
  if(SUTRADARA&&window.__KAM&&window.__KAM.sembunyi)me.grp.visible=false;
  if(SUTRADARA&&window.__KAM){const K=window.__KAM;cam.position.set(K.p[0],K.p[1],K.p[2]);cam.lookAt(K.l[0],K.l[1],K.l[2]);if(K.fov&&cam.fov!==K.fov){cam.fov=K.fov;cam.updateProjectionMatrix();}}
  /* matahari mengikuti pemain agar peta bayangan tetap tajam di sekitarnya */
  {const sy2=mulai?kamY:0,L=mulai&&me.a>=1?44:52,sc=sun.shadow.camera;sun.target.position.set(tx,sy2,tz);sun.position.set(tx+sunDir.x*70,sy2+sunDir.y*70,tz+sunDir.z*70);
   if(sc.right!==L){sc.left=-L;sc.right=L;sc.top=L;sc.bottom=-L;sc.near=1;sc.far=160;sc.updateProjectionMatrix();}}
  gambar(cam.position.distanceTo(kamL.set(tx,mulai?kamY+1.5:1,tz)),t);
  auditTick(dt);
}
terapKual();gambarPapan();requestAnimationFrame(frame);
document.fonts&&document.fonts.ready.then(gambarPapan);

/* kait uji */
window.__L={AMAT,amatPilih:t=>pilihTimAmat(t),amatArea:a=>keArea(a),amatIkuti:id=>{amatMode='ikuti';amatIkut=id;},get amatMode(){return amatMode;},get saya(){return saya;},catatBabak,P1,AR,arena,get endAt(){return endAt;},get stunTil(){return stunTil;},get me(){return me;},tim,luar,papanData,get st(){return st;},aud,get rt(){return rt;},gerbang,C,hit,
  MED,M2,M3,M4,M5,M6,P2,P3,P4,P5,P6,arena2,arena3,arena4,arena5,arena6,ALUR,get st2(){return ALUR[2].st;},ambilBatu,pasangBatu,flush2:()=>ALUR[2].flush(),ubahSlot2:(i,k)=>ALUR[2].ubahSlot(i,k),get W(){return W;},tp:(x,z)=>{me.x=x;me.z=z;kb=null;resetJejak();},get kb(){return kb;},get gerbangBuka(){return gerbangBuka;},get grafis(){return {kual,gaya,pasca,ke:kualEf(),siap:kualEf()!==4||ultraSiap()};},trex,setGrafis,saldo,kirimPosisi,setArea,ubahKolom,flush,get pend(){return pend;},sim,jedaPos,jedaFlush,ntot,get tahan(){return tahan;},set tahan(v){tahan=v;}};
