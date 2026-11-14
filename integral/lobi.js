/* Lobi Integral v2: karakter kustom, kamera bebas, Pos 1 fisik (membawa balok), jaringan per tim. */
import * as THREE from './vendor/three.min.js';
import {sambung} from './rt.js';
import {BABAK,CAP,UBAG,MAXBAG,stateBaru,valid,cValid,hitung,tinggi,skorRonde,skorTim,selesai,jumlah,gambarMini} from './pos1.js';
import {buatArena,kolomDari,diDepot,diPad,BATAS,PAD,DEPOT} from './arena.js';
import {TIPE,WARNA,KULIT,TOPI,KACAMATA,AKS,parseAv,kodeAv,acakAv,meshAvatar,topY} from './avatar.js';
import {labelSprite,buangSprite,klem} from './util.js';
import {bacaSesi} from '../core/net.js';

const $=id=>document.getElementById(id);
const TIM=[['merah','Merah','#e5392b'],['biru','Biru','#2f7fc1'],['hijau','Hijau','#2f9e5b'],['kuning','Kuning','#e0a200'],
  ['ungu','Ungu','#7a4bc4'],['oranye','Oranye','#ee7d1a'],['tosca','Tosca','#17a2a2'],['pink','Pink','#e0559b']].map(a=>({id:a[0],nama:a[1],warna:a[2]}));
const timById=id=>TIM.find(t=>t.id===id)||TIM[0];
const POS=['Tambal Waduk','Rakit Sandi','Mesin Putar Balik','Misteri Tangki','Brankas Batas','Final'];
const SPD=7,RMAX=27,RGATE=16;
const Q=new URLSearchParams(location.search);

/* ---------- profil dan pembuat karakter ---------- */
let profil={nama:'',tim:TIM[Math.floor(Math.random()*TIM.length)].id,av:acakAv()};
try{const j=JSON.parse(localStorage.getItem('ki-profil')||'null');if(j){profil.nama=String(j.nama||'').slice(0,12);if(TIM.some(t=>t.id===j.tim))profil.tim=j.tim;if(j.av)profil.av=parseAv(j.av);}}catch(e){}
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
      e.addEventListener('click',()=>{profil.av[k]=i;bangunOpsi();segarPratinjau();simpanProfil();});
      row.append(e);
    });
    box.append(row);
  }
  const ac=document.createElement('button');ac.type='button';ac.className='btn alt';ac.style.cssText='font-size:12px;padding:5px 10px;align-self:flex-start';ac.textContent='Acak';
  ac.addEventListener('click',()=>{profil.av=acakAv();bangunOpsi();segarPratinjau();simpanProfil();});box.append(ac);
}
bangunOpsi();segarPratinjau();

/* ---------- dunia 3D ---------- */
const cv=$('gl');
const renderer=new THREE.WebGLRenderer({canvas:cv,antialias:(devicePixelRatio||1)<=1,powerPreference:'high-performance'});
const scene=new THREE.Scene();scene.background=new THREE.Color(0x9fd4ee);scene.fog=new THREE.Fog(0x9fd4ee,45,95);
const cam=new THREE.PerspectiveCamera(50,1,.3,140);
scene.add(new THREE.HemisphereLight(0xffffff,0x7aa860,1.5));
const sun=new THREE.DirectionalLight(0xfff1d6,1.6);sun.position.set(12,24,10);scene.add(sun);

const rumput=new THREE.Mesh(new THREE.CircleGeometry(70,40),mat(0x78b85a));rumput.rotation.x=-Math.PI/2;scene.add(rumput);
const lobiGrup=new THREE.Group();scene.add(lobiGrup);
{
  const plaza=new THREE.Mesh(new THREE.CircleGeometry(21,36),mat(0xffe2b5));plaza.rotation.x=-Math.PI/2;plaza.position.y=.02;lobiGrup.add(plaza);
  const ring=new THREE.Mesh(new THREE.RingGeometry(20.4,21,36),mat(0x1c2230));ring.rotation.x=-Math.PI/2;ring.position.y=.03;lobiGrup.add(ring);
}
const pohon=new THREE.Group();lobiGrup.add(pohon);
{
  const N=46,bt=new THREE.InstancedMesh(new THREE.CylinderGeometry(.25,.32,1.4,6),mat(0x7a4f2a),N),dn=new THREE.InstancedMesh(new THREE.ConeGeometry(1.5,3.4,7),mat(0x2f8a4c),N);
  const m=new THREE.Matrix4();let seed=7;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
  for(let i=0;i<N;i++){
    const a=rnd()*Math.PI*2,r=24+rnd()*30,s=.8+rnd()*.9,x=Math.cos(a)*r,z=Math.sin(a)*r;
    m.makeScale(s,s,s);m.setPosition(x,.7*s,z);bt.setMatrixAt(i,m);
    m.makeScale(s,s,s);m.setPosition(x,3*s,z);dn.setMatrixAt(i,m);
  }
  pohon.add(bt,dn);
}
const gerbang=[];
{
  const gp=new THREE.BoxGeometry(.9,4.2,.9),gl=new THREE.BoxGeometry(5.2,.9,1.1);
  POS.forEach((nama,i)=>{
    const a=(-62.5+i*25)*Math.PI/180,x=Math.sin(a)*RGATE,z=-Math.cos(a)*RGATE,aktif=i===0;
    const grp=new THREE.Group();grp.position.set(x,0,z);grp.rotation.y=-a;
    const m=mat(aktif?0xff6f47:0x9aa3ad);
    const p1=new THREE.Mesh(gp,m),p2=new THREE.Mesh(gp,m),lt=new THREE.Mesh(gl,mat(aktif?0xffc83d:0x7d8792));
    p1.position.set(-2.1,2.1,0);p2.position.set(2.1,2.1,0);lt.position.set(0,4.5,0);
    grp.add(p1,p2,lt);
    const lb=labelSprite('Pos '+(i+1)+'\n'+(aktif?nama:'terkunci'),{w:320,h:110,size:32,bg:aktif?'#fff6e4':'#d9dde2',sx:5});
    lb.position.set(0,6.4,0);grp.add(lb);
    let cincin=null;
    if(aktif){cincin=new THREE.Mesh(new THREE.RingGeometry(2.4,2.9,24),new THREE.MeshBasicMaterial({color:0xff6f47,transparent:true,opacity:.7,side:THREE.DoubleSide}));cincin.rotation.x=-Math.PI/2;cincin.position.set(0,.06,1.6);grp.add(cincin);}
    lobiGrup.add(grp);
    gerbang.push({i,nama,aktif,x:x-Math.sin(a)*1.6,z:z+Math.cos(a)*1.6,cincin});
  });
}
/* papan skor */
const papan={c:document.createElement('canvas')};
{
  papan.c.width=640;papan.c.height=400;papan.tx=new THREE.CanvasTexture(papan.c);papan.tx.colorSpace=THREE.SRGBColorSpace;
  const m=new THREE.Mesh(new THREE.PlaneGeometry(14,8.75),new THREE.MeshBasicMaterial({map:papan.tx}));m.position.set(0,10,-24);lobiGrup.add(m);
  const kaki=mat(0x1c2230),k1=new THREE.Mesh(new THREE.BoxGeometry(.5,6.5,.5),kaki),k2=k1.clone();k1.position.set(-5,3.2,-24.2);k2.position.set(5,3.2,-24.2);lobiGrup.add(k1,k2);
}
const arena=buatArena();scene.add(arena.grup);

/* ---------- keadaan ---------- */
let saya=null,me=null,rt=null,mulai=false,hasilBuka=false,kotor=true,tGabung=0;
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
    if(![p.x,p.z,p.vx,p.vz].every(Number.isFinite)||Math.abs(p.x)>40||Math.abs(p.z)>40)return;
    q.tx=p.x;q.tz=p.z;q.vx=klem(p.vx,-9,9);q.vz=klem(p.vz,-9,9);q.c=ang(p.c,0,CAP)?p.c:0;
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
    }
  }else if(ev==='siap'){
    const q=tim.get(p.id);if(q&&!q.bot)q.siap=p.v?1:0;
  }else if(ev==='kunci'){
    if(!ang(p.r,0,BABAK.length-1)||p.r!==st.r||!cValid(p.r,p.c))return;
    kunciBabak(p.c);
  }else if(ev==='minta'){
    if(otoritas())setTimeout(()=>{flush();kirim('st',{s:st});tStKirim=performance.now();},100+Math.random()*400);
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
  const lama=st.r;st={r:s.r,c:s.c.slice(),sr:s.sr.map(x=>x.slice())};pend.clear();
  if(st.r!==lama){me.carry=0;me.siap=0;for(const p of anggota())p.siap=0;}
  arena.setBabak(BABAK[Math.min(st.r,BABAK.length-1)]);kotor=true;
  if(selesai(st)&&me.a===1)bukaHasil();
}
function flush(){
  if(!pend.size)return;
  kirim('d',{r:st.r,c:[...pend]});pend.clear();tFlush=performance.now();
}
function kunciBabak(c){
  const r=st.r;st.sr.push(c.slice());const sk=skorRonde(c).skor;st.r++;st.c=st.r<BABAK.length?Array(BABAK[st.r]).fill(0):[];
  pend.clear();me.carry=0;me.siap=0;for(const p of anggota())p.siap=0;
  arena.setBabak(BABAK[Math.min(st.r,BABAK.length-1)]);kotor=true;
  toast('Babak '+(r+1)+' terkunci. Skor babak: '+sk);
  if(selesai(st)){if(me.a===1)bukaHasil();laporPapan(true);}
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

/* ---------- masukan ---------- */
const key={w:0,a:0,s:0,d:0,q:0,e:0},joy={x:0,y:0,id:null,ox:0,oy:0};
const peta={KeyW:'w',ArrowUp:'w',KeyA:'a',ArrowLeft:'a',KeyS:'s',ArrowDown:'s',KeyD:'d',ArrowRight:'d',KeyQ:'q',KeyE:'e'};
let tahan=false;
addEventListener('keydown',e=>{
  if(e.target.tagName==='INPUT'||!mulai||hasilBuka)return;
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
  if(!mulai||hasilBuka)return;
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

/* ---------- arena dan aksi ---------- */
function setArea(a){
  me.a=a;arena.grup.visible=a===1;lobiGrup.visible=a===0;
  $('arhud').hidden=a!==1;$('b-keluar').hidden=a!==1;$('b-lompat').hidden=false;
  me.siap=0;kirim('siap',{id:saya.id,v:0});
  if(a===1){
    me.x=0;me.z=9;me.vx=me.vz=0;C.yaw=0;
    arena.setBabak(BABAK[Math.min(st.r,BABAK.length-1)]);arena.setWarna(timById(saya.tim).warna);
    kotor=true;toast(selesai(st)?'Pos 1 sudah selesai.':'Bawa balok dari gudang ke kolom, lalu semua berdiri di pad hijau.');
    if(selesai(st))bukaHasil();
  }else{
    me.carry=0;const g=gerbang[0];me.x=g.x;me.z=g.z+3;me.vx=me.vz=0;
  }
  kirimPosisi(true);
}
$('b-keluar').addEventListener('click',()=>{if(me.a===1){flush();setArea(0);}});
$('w-tutup').addEventListener('click',()=>{$('hasil').hidden=true;hasilBuka=false;if(me.a===1)setArea(0);});
function bukaHasil(){
  if(hasilBuka)return;
  const t=$('w-tabel');t.textContent='';
  const head=t.insertRow();for(const h of ['Babak','Kolom','Taksiran luas','Bocor','Skor']){const th=document.createElement('th');th.textContent=h;head.append(th);}
  st.sr.forEach((c,i)=>{
    const r=skorRonde(c),row=t.insertRow();
    [i+1,c.length,r.luas.toFixed(2),r.bocor.toFixed(2),r.skor].forEach(v=>row.insertCell().textContent=v);
  });
  $('w-skor').textContent=String(skorTim(st));
  $('hasil').hidden=false;hasilBuka=true;key.w=key.a=key.s=key.d=0;joy.x=joy.y=0;tahan=false;
}
let tAksi=0;
function aksiMulai(){
  if(!me||hasilBuka)return;
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
  }else if(me.carry<CAP&&st.c[col]>0){me.carry++;ubahKolom(col,-1);tAksi=now;}
}

/* ---------- kualitas dan audit ---------- */
const KUAL=[{n:'tinggi',pr:2},{n:'sedang',pr:1},{n:'rendah',pr:.7}];
let kual=0;
function terapKual(){
  const k=KUAL[kual];renderer.setPixelRatio(Math.min(devicePixelRatio||1,k.pr));
  pohon.visible=kual<2;scene.fog=kual<2?new THREE.Fog(0x9fd4ee,45,95):null;ukur();
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
  const r=Math.min(st.r,BABAK.length-1),c=selesai(st)?st.sr[BABAK.length-1]:st.c,h=hitung(tinggi(c));
  $('ar-babak').textContent=selesai(st)?'Selesai':'Babak '+(r+1)+'/3 · '+BABAK[r]+' kolom';
  $('ar-bawa').textContent='Bawa '+me.carry+'/'+CAP;
  $('ar-luas').textContent=h.luas.toFixed(2)+' (target 9)';$('ar-bocor').textContent=h.bocor.toFixed(2);
  gambarMini($('mini'),st,timById(saya.tim).warna);
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
  arena.setWarna(t.warna);arena.setBabak(BABAK[0]);
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
  mulai=true;gambarPapan();setPre(0);$('b-lompat').hidden=false;
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
    if(hasilBuka||m<.12){ix=0;iz=0;}
    /* kamera hanya mengubah sudut pandang: arah jalan tetap terkunci pada sumbu dunia */
    const v=SPD*(1-.07*me.carry);
    me.vx=ix*v;me.vz=iz*v;
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
      p.x+=p.vx*dt;p.z+=p.vz*dt;const rr=Math.hypot(p.x,p.z);if(rr>19){p.vx=-p.x/rr*3;p.vz=-p.z/rr*3;}
      p.grp.visible=me.a===0;if(p.grp.visible)animAv(p,dt,t,now);
    }
    me.grp.visible=C.d>2;

    if(me.a===0){
      let dekat=null,dmin=9;
      for(const gt of gerbang){const d=Math.hypot(me.x-gt.x,me.z-gt.z);if(d<dmin){dmin=d;dekat=gt;}if(gt.cincin){const s=1+Math.sin(t*3)*.08;gt.cincin.scale.set(s,s,1);}}
      const dalam=dekat&&dmin<3.4;
      const b=$('aksi');b.hidden=!(dalam&&dekat.aktif&&!hasilBuka);b.textContent='Masuk Pos 1';
      if(dalam&&!dekat.aktif&&now-toastGerbang>4000){toastGerbang=now;toast('Pos '+(dekat.i+1)+' ('+dekat.nama+') masih terkunci di prototipe ini.');}
    }else{
      const n=BABAK[Math.min(st.r,BABAK.length-1)],col=selesai(st)?-1:kolomDari(n,me.x,me.z);
      arena.sorot(col);
      /* gudang: ambil otomatis */
      if(diDepot(me.x,me.z)&&me.carry<CAP&&!selesai(st)&&now-tReda>200){me.carry++;tReda=now;kotor=true;}
      const b=$('aksi');
      const bisaTaruh=col>=0&&me.carry>0&&st.c[col]<MAXBAG,bisaAmbil=col>=0&&me.carry===0&&st.c[col]>0;
      b.hidden=hasilBuka||!(bisaTaruh||bisaAmbil||(tahan&&col>=0));
      if(!b.hidden)b.textContent=(modeAksi?modeAksi===1:me.carry>0)?'Taruh balok':'Ambil kembali';
      aksiTick(now,col);
      /* pad dan kunci */
      const di=diPad(me.x,me.z)?1:0;
      if(di!==me.siap){me.siap=di;if(di)flush();kirim('siap',{id:saya.id,v:di});}
      arena.padAnim(t,me.siap);
      if(!selesai(st)&&pemimpinKunci()){
        const L=[me,...anggota().filter(p=>p.a===1)];
        if(L.every(p=>p.siap)&&jumlah(st.c)>0){
          if(!tSiap)tSiap=now;
          if(now-tSiap>1200){tSiap=0;const c=st.c.slice();kirim('kunci',{r:st.r,c});kunciBabak(c);}
        }else tSiap=0;
      }else tSiap=0;
      /* balok yang dibawa */
      bawaItems.length=0;
      for(const p of [me,...anggota()])if(p.a===1&&p.carry>0)bawaItems.push({x:p.x,z:p.z,y:p.grp.userData.h+.3+(p.grp.position.y),n:p.carry});
      arena.setBawa(bawaItems);
      if(kotor){arena.setBags(selesai(st)?st.sr[BABAK.length-1]:st.c);isiArena();kotor=false;}
      if(now-tKiriman>400){tKiriman=now;isiArena();isiSiap();}
    }
    /* rekonsiliasi: otoritas menyiarkan keadaan setelah tenang */
    if(ubahSt&&otoritas()&&now-tDelta>3000&&now-tStKirim>8000&&!pend.size){kirim('st',{s:st});tStKirim=now;ubahSt=false;}
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
    const ar=mulai&&me.a===1,D=C.d*ks*(ar?1.2:1),oy=ar?2.4:1.2,oz=ar?-3:0;
    kamP.set(tx+D*Math.sin(C.yaw)*cp,oy+D*sp,tz+oz+D*Math.cos(C.yaw)*cp);
    cam.position.copy(kamP);cam.lookAt(tx,oy,tz+oz);
  }
  renderer.render(scene,cam);
  auditTick(dt);
}
terapKual();gambarPapan();requestAnimationFrame(frame);
document.fonts&&document.fonts.ready.then(gambarPapan);

/* kait uji */
window.__L={get me(){return me;},tim,luar,papanData,get st(){return st;},aud,get rt(){return rt;},gerbang,C,hit,
  tp:(x,z)=>{me.x=x;me.z=z;},kirimPosisi,setArea,ubahKolom,flush,get pend(){return pend;},sim,jedaPos,jedaFlush,ntot,get tahan(){return tahan;},set tahan(v){tahan=v;}};
