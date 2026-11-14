/* Lobi Integral, prototipe 3D untuk audit: dunia low-poly, avatar multipemain, satu pos (Tambal Waduk). */
import * as THREE from './vendor/three.min.js';
import {sambung} from './rt.js';
import {buatPanel,stateBaru,skorTim} from './pos1.js';
import {bacaSesi} from '../core/net.js';

const $=id=>document.getElementById(id);
const TIM=[{id:'merah',nama:'Merah',warna:'#e5392b'},{id:'biru',nama:'Biru',warna:'#2f7fc1'},{id:'hijau',nama:'Hijau',warna:'#2f9e5b'},{id:'kuning',nama:'Kuning',warna:'#e0a200'}];
const timById=id=>TIM.find(t=>t.id===id)||TIM[0];
const POS=['Tambal Waduk','Rakit Sandi','Mesin Putar Balik','Misteri Tangki','Brankas Batas','Final'];
const SPD=7,RMAX=27,RGATE=16;
const Q=new URLSearchParams(location.search);

/* ---------- layar masuk ---------- */
let timPilih=TIM[Math.floor(Math.random()*TIM.length)].id;
{
  const box=$('in-tim');
  for(const t of TIM){
    const b=document.createElement('button');b.type='button';b.className='tab';b.dataset.t=t.id;
    const sw=document.createElement('span');sw.className='sw';sw.style.background=t.warna;
    b.append(sw,'Tim '+t.nama);b.setAttribute('aria-pressed',String(t.id===timPilih));
    b.addEventListener('click',()=>{timPilih=t.id;box.querySelectorAll('.tab').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.t===timPilih)));});
    box.append(b);
  }
  const s=bacaSesi();if(s&&s.user)$('in-nama').value=String(s.user).slice(0,12);
  if(Q.get('kode'))$('in-kode').value=Q.get('kode').toUpperCase().slice(0,10);
}

/* ---------- dunia 3D ---------- */
const cv=$('gl');
const renderer=new THREE.WebGLRenderer({canvas:cv,antialias:(devicePixelRatio||1)<=1,powerPreference:'high-performance'});
const scene=new THREE.Scene();scene.background=new THREE.Color(0x9fd4ee);scene.fog=new THREE.Fog(0x9fd4ee,45,95);
const cam=new THREE.PerspectiveCamera(50,1,.5,140);
scene.add(new THREE.HemisphereLight(0xffffff,0x7aa860,1.5));
const sun=new THREE.DirectionalLight(0xfff1d6,1.6);sun.position.set(12,24,10);scene.add(sun);

const mat=c=>new THREE.MeshLambertMaterial({color:c,flatShading:true});
{
  const rumput=new THREE.Mesh(new THREE.CircleGeometry(70,40),mat(0x78b85a));rumput.rotation.x=-Math.PI/2;scene.add(rumput);
  const plaza=new THREE.Mesh(new THREE.CircleGeometry(21,36),mat(0xffe2b5));plaza.rotation.x=-Math.PI/2;plaza.position.y=.02;scene.add(plaza);
  const ring=new THREE.Mesh(new THREE.RingGeometry(20.4,21,36),mat(0x1c2230));ring.rotation.x=-Math.PI/2;ring.position.y=.03;scene.add(ring);
}
/* pohon: satu InstancedMesh untuk batang, satu untuk daun */
const pohon=new THREE.Group();scene.add(pohon);
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

function labelSprite(teks,opt={}){
  const c=document.createElement('canvas'),w=opt.w||256,h=opt.h||64;c.width=w;c.height=h;
  const g=c.getContext('2d');
  if(opt.bg){g.fillStyle=opt.bg;g.strokeStyle='#1c2230';g.lineWidth=6;g.beginPath();g.roundRect(4,4,w-8,h-8,14);g.fill();g.stroke();}
  g.font='700 '+(opt.size||30)+'px "Chakra Petch","Trebuchet MS",sans-serif';g.textAlign='center';g.textBaseline='middle';
  const baris=String(teks).split('\n'),lh=(opt.size||30)*1.15;
  baris.forEach((b,i)=>{
    const y=h/2+(i-(baris.length-1)/2)*lh;
    if(!opt.bg){g.lineWidth=6;g.strokeStyle='#fff6e4';g.strokeText(b,w/2,y);}
    g.fillStyle=opt.fg||'#1c2230';g.fillText(b,w/2,y);
  });
  const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tx,transparent:true,depthWrite:false}));
  sp.scale.set((opt.sx||3),(opt.sx||3)*h/w,1);return sp;
}

/* gerbang pos */
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
    scene.add(grp);
    gerbang.push({i,nama,aktif,x:x-Math.sin(a)*1.6,z:z+Math.cos(a)*1.6,cincin});
  });
}

/* papan skor di belakang gerbang */
const papan={c:document.createElement('canvas')};
{
  papan.c.width=640;papan.c.height=320;papan.tx=new THREE.CanvasTexture(papan.c);papan.tx.colorSpace=THREE.SRGBColorSpace;
  const m=new THREE.Mesh(new THREE.PlaneGeometry(14,7),new THREE.MeshBasicMaterial({map:papan.tx}));m.position.set(0,9.5,-24);scene.add(m);
  const kaki=mat(0x1c2230),k1=new THREE.Mesh(new THREE.BoxGeometry(.5,6,.5),kaki),k2=k1.clone();k1.position.set(-5,3,-24.2);k2.position.set(5,3,-24.2);scene.add(k1,k2);
}
const skor={};
function gambarPapan(){
  const g=papan.c.getContext('2d'),W=640,H=320;
  g.fillStyle='#fff6e4';g.fillRect(0,0,W,H);g.strokeStyle='#1c2230';g.lineWidth=10;g.strokeRect(5,5,W-10,H-10);
  g.fillStyle='#1c2230';g.font='800 34px "Bricolage Grotesque","Arial Black",sans-serif';g.textAlign='left';g.textBaseline='middle';
  g.fillText('Papan skor · Pos 1',24,40);
  const jml={};for(const p of semuaPemain())jml[p.tim]=(jml[p.tim]||0)+1;
  const urut=TIM.slice().sort((a,b)=>(skor[b.id]??-1)-(skor[a.id]??-1));
  g.font='700 28px "Chakra Petch","Trebuchet MS",sans-serif';
  urut.forEach((t,i)=>{
    const y=96+i*54;
    g.fillStyle=t.warna;g.fillRect(24,y-18,36,36);g.strokeStyle='#1c2230';g.lineWidth=4;g.strokeRect(24,y-18,36,36);
    g.fillStyle='#1c2230';g.textAlign='left';g.fillText('Tim '+t.nama,76,y);
    g.fillText((jml[t.id]||0)+' org',300,y);
    g.textAlign='right';g.fillText(skor[t.id]!=null?String(skor[t.id]):'belum',W-28,y);
  });
  papan.tx.needsUpdate=true;
}

/* avatar */
const geoBadan=new THREE.CylinderGeometry(.55,.7,1.5,8),geoKepala=new THREE.SphereGeometry(.5,8,6);
const matTim={};for(const t of TIM)matTim[t.id]=mat(t.warna);
const matKulit=mat(0xffd9a3);
function buatAvatar(info){
  const grp=new THREE.Group();
  const b=new THREE.Mesh(geoBadan,matTim[info.tim]||matTim.merah);b.position.y=.75;
  const k=new THREE.Mesh(geoKepala,matKulit);k.position.y=1.95;
  const lb=labelSprite(info.nama||'?',{sx:4.2,size:38});lb.position.y=3.1;
  grp.add(b,k,lb);grp.userData={badan:b,kepala:k,label:lb};scene.add(grp);return grp;
}
function buangAvatar(grp){
  scene.remove(grp);const lb=grp.userData.label;lb.material.map.dispose();lb.material.dispose();
}

/* ---------- keadaan ---------- */
let saya=null,me=null,rt=null,panel=null,mulai=false,panelBuka=false;
const pemain=new Map(); /* id -> {id,nama,tim,grp,x,z,vx,vz,tx,tz,tMsg,bot} */
const waduk=stateBaru();
function semuaPemain(){const L=[];if(me)L.push(me);for(const p of pemain.values())L.push(p);return L;}
function tambahPemain(info,bot){
  const p={...info,grp:buatAvatar(info),x:0,z:0,vx:0,vz:0,tx:(Math.random()-.5)*10,tz:6+Math.random()*6,tMsg:0,bot:!!bot,fase:Math.random()*6};
  p.x=p.tx;p.z=p.tz;pemain.set(info.id,p);return p;
}
function hapusPemain(id){const p=pemain.get(id);if(p){buangAvatar(p.grp);pemain.delete(id);}}

/* ---------- jaringan ---------- */
const hit={kirim:0,terima:0,kps:0,tps:0};
function kirim(ev,p){if(rt){rt.kirim(ev,p);hit.kirim++;}}
function onHadir(L){
  const ada=new Set();
  for(const d of L){
    if(!d||d.id===saya.id)continue;ada.add(d.id);
    const p=pemain.get(d.id);
    if(!p)tambahPemain(d,false);
    else if(p.tim!==d.tim||p.nama!==d.nama){hapusPemain(d.id);tambahPemain(d,false);}
  }
  let baru=false;
  for(const [id,p] of pemain)if(!p.bot&&!ada.has(id))hapusPemain(id);else if(!p.bot&&!p.tMsg)baru=true;
  if(baru)setTimeout(()=>kirimPosisi(true),200+Math.random()*600);
  gambarPapan();
}
function idTerkecil(){let m=saya.id;for(const p of pemain.values())if(!p.bot&&p.id<m)m=p.id;return m===saya.id;}
function onPesan(ev,p){
  hit.terima++;
  if(ev==='p'){
    const q=pemain.get(p.id);if(!q||q.bot)return;
    q.tx=p.x;q.tz=p.z;q.vx=p.vx;q.vz=p.vz;
    if(!q.tMsg){q.x=p.x;q.z=p.z;}
    q.tMsg=performance.now();
  }else if(ev==='w'||ev==='wk'){panel&&panel.terima(ev,p);}
  else if(ev==='skor'){if(skor[p.t]==null||p.s>=0){skor[p.t]=p.s;gambarPapan();}}
  else if(ev==='minta'){
    const setim=p.tim===saya.tim;
    if(setim||idTerkecil())setTimeout(()=>kirim('sync',{untuk:p.id,t:saya.tim,st:setim?waduk:null,skor}),100+Math.random()*400);
  }else if(ev==='sync'){
    if(p.untuk!==saya.id)return;
    for(const k in p.skor)if(skor[k]==null)skor[k]=p.skor[k];
    if(p.t===saya.tim&&p.st&&panel)panel.gabung(p.st);
    gambarPapan();
  }
}
let tKirim=0,gerakLalu=false;
function kirimPosisi(paksa){
  if(!me)return;
  kirim('p',{id:saya.id,x:+me.x.toFixed(2),z:+me.z.toFixed(2),vx:+me.vx.toFixed(2),vz:+me.vz.toFixed(2)});
  tKirim=performance.now();
}
/* Anggaran pesan: paket gratis Supabase Realtime dibatasi sekitar 100 pesan per detik per proyek.
   Jeda kirim posisi tumbuh bersama jumlah pemain, sisanya ditutup ekstrapolasi kecepatan. */
function jedaKirim(){let n=1;for(const p of pemain.values())if(!p.bot)n++;return Math.max(250,Math.min(1500,n*25));}

/* ---------- masukan ---------- */
const key={w:0,a:0,s:0,d:0},joy={x:0,y:0,id:null,ox:0,oy:0};
const peta={KeyW:'w',ArrowUp:'w',KeyA:'a',ArrowLeft:'a',KeyS:'s',ArrowDown:'s',KeyD:'d',ArrowRight:'d'};
addEventListener('keydown',e=>{if(e.target.tagName==='INPUT')return;const k=peta[e.code];if(k){key[k]=1;e.preventDefault();}else if(e.code==='KeyE'&&!$('aksi').hidden)$('aksi').click();});
addEventListener('keyup',e=>{const k=peta[e.code];if(k)key[k]=0;});
addEventListener('blur',()=>{key.w=key.a=key.s=key.d=0;});
cv.addEventListener('pointerdown',e=>{
  if(!mulai||panelBuka||joy.id!==null)return;
  joy.id=e.pointerId;joy.ox=e.clientX;joy.oy=e.clientY;joy.x=joy.y=0;cv.setPointerCapture(e.pointerId);
  const j=$('joy');j.hidden=false;j.style.left=e.clientX+'px';j.style.top=e.clientY+'px';j.firstElementChild.style.transform='';
});
cv.addEventListener('pointermove',e=>{
  if(e.pointerId!==joy.id)return;
  let dx=e.clientX-joy.ox,dy=e.clientY-joy.oy;const d=Math.hypot(dx,dy),R=50;
  if(d>R){dx*=R/d;dy*=R/d;}
  joy.x=dx/R;joy.y=dy/R;$('joy').firstElementChild.style.transform='translate('+dx+'px,'+dy+'px)';
});
const lepasJoy=e=>{if(e.pointerId!==joy.id)return;joy.id=null;joy.x=joy.y=0;$('joy').hidden=true;};
cv.addEventListener('pointerup',lepasJoy);cv.addEventListener('pointercancel',lepasJoy);

/* ---------- kualitas dan audit ---------- */
const KUAL=[{n:'tinggi',pr:2},{n:'sedang',pr:1},{n:'rendah',pr:.7}];
let kual=0;
function terapKual(){
  const k=KUAL[kual];renderer.setPixelRatio(Math.min(devicePixelRatio||1,k.pr));
  pohon.visible=kual<2;scene.fog=kual<2?new THREE.Fog(0x9fd4ee,45,95):null;ukur();
}
function ukur(){renderer.setSize(innerWidth,innerHeight,false);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();panel&&panel.ukur();}
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
function nPemain(){let o=1,b=0;for(const p of pemain.values())p.bot?b++:o++;return {o,b};}
function isiAudit(){
  const n=nPemain();
  $('a-fps').textContent=aud.fps?aud.fps.toFixed(0):'-';$('a-min').textContent=aud.fmin?aud.fmin.toFixed(0):'-';
  $('a-ping').textContent=rt&&rt.mode==='luring'?'tanpa server':(aud.ping!=null?aud.ping.toFixed(0)+' ms':'-');
  $('a-n').textContent=n.o+' orang'+(n.b?' + '+n.b+' bot':'');
  $('a-mode').textContent=rt?rt.mode:'-';$('a-q').textContent=KUAL[kual].n;
  $('a-msg').textContent=hit.kps.toFixed(1)+' / '+hit.tps.toFixed(1)+' per dtk';
}
function laporan(){
  const n=nPemain(),r=aud.riwayat,avg=r.length?Math.round(r.reduce((a,b)=>a+b,0)/r.length):0,pg=aud.pings;
  return ['LAPORAN AUDIT LOBI INTEGRAL',
    'Waktu: '+new Date().toLocaleString('id-ID'),
    'Nama/tim/ruang: '+saya.nama+' / '+saya.tim+' / '+saya.kode,
    'Perangkat: '+navigator.userAgent,
    'Layar: '+innerWidth+'x'+innerHeight+' @'+(devicePixelRatio||1),
    'Mode: '+(rt?rt.mode:'-')+', kualitas akhir: '+KUAL[kual].n,
    'FPS rata-rata (1 menit terakhir): '+avg+', terendah per jendela: '+(r.length?Math.min(...r):0),
    'Ping: '+(pg.length?('rata '+Math.round(pg.reduce((a,b)=>a+b,0)/pg.length)+' ms, maks '+Math.round(Math.max(...pg))+' ms, sampel '+pg.length):'tidak ada'),
    'Pemain: '+n.o+' orang, '+n.b+' bot',
    'Pesan kirim/terima per detik: '+hit.kps.toFixed(1)+' / '+hit.tps.toFixed(1),
    'Skor Pos 1 tim: '+(skor[saya.tim]!=null?skor[saya.tim]:'belum')].join('\n');
}
$('b-audit').addEventListener('click',()=>{$('audit').hidden=!$('audit').hidden;isiAudit();});
$('a-bot').addEventListener('click',()=>{for(let i=0;i<20;i++){const t=TIM[i%4];tambahPemain({id:'bot'+Math.random().toString(36).slice(2,8),nama:'Bot '+(i+1),tim:t.id},true);}isiAudit();gambarPapan();});
$('a-nobot').addEventListener('click',()=>{for(const [id,p] of pemain)if(p.bot)hapusPemain(id);isiAudit();gambarPapan();});
$('a-salin').addEventListener('click',async()=>{
  const t=laporan(),ta=$('a-lap');ta.value=t;ta.hidden=false;
  try{await navigator.clipboard.writeText(t);toast('Laporan disalin. Tempel ke chat atau catatan.');}catch(e){ta.select();toast('Salin manual dari kotak di panel audit.');}
});

let toastT=0;
function toast(s){const t=$('ltoast');t.textContent=s;t.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>{t.hidden=true;},2600);}

/* ---------- pos 1 ---------- */
function bukaPos1(){
  panelBuka=true;$('aksi').hidden=true;key.w=key.a=key.s=key.d=0;joy.x=joy.y=0;panel.buka();
}
$('aksi').addEventListener('click',bukaPos1);

/* ---------- masuk ---------- */
$('b-masuk').addEventListener('click',()=>{
  const nama=$('in-nama').value.trim(),kode=$('in-kode').value.trim().toUpperCase().replace(/[^A-Z0-9-]/g,'');
  if(!nama||!kode){$('m-msg').textContent='Isi nama dan kode ruang.';return;}
  let id=null;try{id=sessionStorage.getItem('ki-id');}catch(e){}
  if(!id){id=Math.random().toString(36).slice(2,10);try{sessionStorage.setItem('ki-id',id);}catch(e){}}
  saya={id,nama,tim:timPilih,kode};
  const t=timById(saya.tim);
  me={...saya,grp:buatAvatar(saya),x:(Math.random()-.5)*8,z:8+Math.random()*4,vx:0,vz:0};
  $('masuk').hidden=true;$('lhud').hidden=false;
  $('c-ruang').textContent='Ruang '+kode;
  const ct=$('c-tim');ct.textContent='';const sw=document.createElement('span');sw.className='sw';sw.style.background=t.warna;ct.append(sw,'Tim '+t.nama);
  panel=buatPanel({el:$('waduk'),tim:saya.tim,warna:t.warna,nama:saya.nama,state:waduk,kirim,
    selesai:s=>{if(skor[saya.tim]!==s){skor[saya.tim]=s;kirim('skor',{t:saya.tim,s});gambarPapan();}},
    tutup:()=>{$('waduk').hidden=true;panelBuka=false;}});
  rt=sambung(kode,{id:saya.id,nama:saya.nama,tim:saya.tim},{
    status:s=>{
      if(s==='daring'||s==='luring'){
        if(s==='luring'&&!Q.has('lokal'))toast('Server tidak terjangkau. Mode luring: hanya antar-tab di perangkat ini.');
        setTimeout(()=>{kirim('minta',{id:saya.id,tim:saya.tim});kirimPosisi(true);},400);
      }else if(s==='putus')toast('Koneksi terputus. Muat ulang halaman untuk masuk lagi.');
      isiAudit();
    },hadir:onHadir,pesan:onPesan},Q.has('lokal'));
  setInterval(async()=>{if(!rt||rt.mode!=='daring'||document.hidden)return;const p=await rt.ping();if(p!=null){aud.ping=p;aud.pings.push(p);if(aud.pings.length>60)aud.pings.shift();}},8000);
  mulai=true;gambarPapan();
  toast('Geser layar (atau WASD) untuk berjalan. Dekati gerbang Pos 1.');
});

/* ---------- putaran utama ---------- */
function animAvatar(p,dt,t){
  const g=p.grp,gerak=Math.hypot(p.vx,p.vz)>.3;
  g.position.set(p.x,gerak?Math.abs(Math.sin(t*9+(p.fase||0)))*.18:0,p.z);
  if(gerak){const a=Math.atan2(p.vx,p.vz);let d=a-g.rotation.y;d=Math.atan2(Math.sin(d),Math.cos(d));g.rotation.y+=d*Math.min(1,dt*10);}
}
const kamT=new THREE.Vector3(),kamP=new THREE.Vector3();
let tLalu=performance.now(),toastGerbang=0;
function frame(now){
  requestAnimationFrame(frame);
  const dt=Math.min(.1,(now-tLalu)/1000);tLalu=now;const t=now/1000;
  if(mulai){
    let ix=joy.x+key.d-key.a,iz=joy.y+key.s-key.w;const m=Math.hypot(ix,iz);
    if(m>1){ix/=m;iz/=m;}
    if(panelBuka||m<.12){ix=0;iz=0;}
    me.vx=ix*SPD;me.vz=iz*SPD;me.x+=me.vx*dt;me.z+=me.vz*dt;
    const r=Math.hypot(me.x,me.z);if(r>RMAX){me.x*=RMAX/r;me.z*=RMAX/r;}
    animAvatar(me,dt,t);
    const gerak=ix!==0||iz!==0;
    if((gerak&&now-tKirim>jedaKirim())||(gerakLalu&&!gerak)||now-tKirim>10000)kirimPosisi();
    gerakLalu=gerak;
    for(const p of pemain.values()){
      if(p.bot){
        p.fase+=dt;if(p.fase>3){p.fase=0;const a=Math.random()*Math.PI*2,v=Math.random()<.3?0:3+Math.random()*3;p.vx=Math.cos(a)*v;p.vz=Math.sin(a)*v;}
        p.x+=p.vx*dt;p.z+=p.vz*dt;const rr=Math.hypot(p.x,p.z);if(rr>20){p.vx=-p.x/rr*4;p.vz=-p.z/rr*4;}
      }else{
        if(now-p.tMsg<2500){p.tx+=p.vx*dt;p.tz+=p.vz*dt;}else{p.vx=p.vz=0;}
        const k=Math.min(1,dt*8);p.x+=(p.tx-p.x)*k;p.z+=(p.tz-p.z)*k;
      }
      animAvatar(p,dt,t);
    }
    /* gerbang terdekat */
    let dekat=null,dmin=9;
    for(const gt of gerbang){const d=Math.hypot(me.x-gt.x,me.z-gt.z);if(d<dmin){dmin=d;dekat=gt;}if(gt.cincin){const s=1+Math.sin(t*3)*.08;gt.cincin.scale.set(s,s,1);}}
    const dalam=dekat&&dmin<3.4;
    $('aksi').hidden=!(dalam&&dekat.aktif&&!panelBuka);
    if(dalam&&!dekat.aktif&&now-toastGerbang>4000){toastGerbang=now;toast('Pos '+(dekat.i+1)+' ('+dekat.nama+') masih terkunci di prototipe ini.');}
    kamT.set(me.x,0,me.z);
  }else{kamT.set(Math.sin(t*.15)*6,0,2);}
  const ks=cam.aspect<1?1.55:1;
  cam.position.lerp(kamP.set(kamT.x,15*ks,kamT.z+17*ks),mulai?Math.min(1,dt*5):1);
  cam.lookAt(cam.position.x,1,cam.position.z-17*ks);
  renderer.render(scene,cam);
  auditTick(dt);
}
terapKual();gambarPapan();requestAnimationFrame(frame);
document.fonts&&document.fonts.ready.then(gambarPapan);

/* kait uji */
window.__L={get me(){return me;},pemain,skor,waduk,aud,get rt(){return rt;},get panel(){return panel;},gerbang,tp:(x,z)=>{me.x=x;me.z=z;},kirimPosisi};
