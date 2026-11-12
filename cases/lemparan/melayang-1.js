/* Semesta 2 (Lemparan), Kasus 1: Benda di Atas Pasar.
   Inti: mahasiswa melempar sendiri dengan ketapel, melihat panah dorongan (tetap) dan gravitasi (tumbuh)
   saling meniadakan di puncak (h' = 0), membedakan lemparan dari dua turunan (h' dan x'),
   lalu menangkap bungkusan dalam gelap dengan simetri waktu naik = waktu turun. */
export default function create(E){
const {w2s,S,P,G,K,T,V,$,clamp,f0,f1,rngSeed,INK,PAPER,SUN,CORAL,ALERT,BLUE,GOOD,FD,FU,say,toast,addEv,card,sfx,openAccuse,gpOpen,endCine,endCase}=E;

/* ---------- fisika ---------- */
const GR=9.8,HV=18;                 // HV: piksel per meter ketinggian (tampilan)
const r1=v=>Math.round(v*10)/10;
const hAt=(vy,t)=>Math.max(0,vy*t-0.5*GR*t*t);
const GHOST={vy:14.7,vx:8};
const DEM={joko:{vy:14.7,vx:8,n:'Joko'},dimas:{vy:14.7,vx:12,n:'Dimas'},rini:{vy:9.8,vx:5,n:'Bu Rini'}};
const TRUE={rek:{ap:1.5,vx:8},joko:{ap:1.5,vx:8},dimas:{ap:1.5,vx:12},rini:{ap:1.0,vx:5}};
const sampleR=(f,a,b)=>{const p=[];for(let t=a;t<=b+1e-9;t+=0.05)p.push([r1(t*100)/100,f(t)]);return p;};

const CH={
  anto:{n:'Pak Anto',body:'#c9b27a',cap:'#4a6fa5'},
  joko:{n:'Joko',body:'#7a8fc2',cap:'#1c2230'},
  rini:{n:'Bu Rini',body:'#d98c5f',cap:'#e8553d'},
  dimas:{n:'Dimas',body:'#2f9e5b',cap:'#f4efe1'}
};

/* ---------- dunia ---------- */
const WW=2200,WH=1300,PXM=40,JX=400,JY=700,sx=s=>JX+s*PXM;
const GX=sx(10);                    // mulut gang warung soto
const BUILD=[
  {x:90,y:330,w:270,h:170,roof:'#4a6fa5',name:'POS SATPAM',door:'s'},
  {x:620,y:330,w:300,h:150,roof:'#d9a441',name:'LOS PASAR',door:'s'},
  {x:1080,y:330,w:260,h:150,roof:'#8aa05a',name:'GUDANG',door:'s'},
  {x:1650,y:340,w:300,h:160,roof:'#6f7b8c',name:'KIOS KELONTONG',door:'s'},
  {x:650,y:930,w:300,h:150,roof:'#e8553d',name:'WARUNG SOTO',door:'n'},
  {x:1550,y:930,w:300,h:150,roof:'#7a5a3a',name:'LAPAK IKAN',door:'n'}
];
const TG={anto:{x:230,y:560},ketapel:{x:JX,y:JY+40},joko:{x:520,y:830},rini:{x:700,y:860},dimas:{x:1250,y:1050},
  rekaman:{x:1060,y:640},pantau:{x:GX-10,y:JY+70},gerobak:{x:1000,y:836}};
const SOLIDS=BUILD.map(b=>({x:b.x,y:b.y,w:b.w,h:b.h}));
SOLIDS.push({x:965,y:862,w:70,h:36});
const LAMPS=[];for(let x=140;x<WW;x+=300)LAMPS.push({x,y:JY-84});
let SAVEDL=null;

function buildWorld(){
  const c=document.createElement('canvas');c.width=WW;c.height=WH;const g=c.getContext('2d');
  const R=rngSeed(23);
  g.fillStyle='#6fae58';g.fillRect(0,0,WW,WH);
  for(let i=0;i<120;i++){g.fillStyle=R()<.5?'#7dbd62':'#68a652';g.beginPath();g.ellipse(R()*WW,R()*WH,30+R()*70,18+R()*40,0,0,7);g.fill();}
  g.fillStyle='#d6b98a';
  for(const b of BUILD){const dx=b.x+b.w/2-18;if(b.door==='s')g.fillRect(dx,b.y+b.h,36,JY-60-(b.y+b.h));else g.fillRect(dx,JY+60,36,b.y-(JY+60));}
  // pelataran
  g.fillStyle='#b9ad94';g.fillRect(60,JY-60,WW-120,120);
  g.strokeStyle='rgba(28,34,48,.18)';g.lineWidth=2;
  for(let x=60;x<WW-60;x+=60){g.beginPath();g.moveTo(x,JY-60);g.lineTo(x,JY+60);g.stroke();}
  // patok jarak dari titik lempar
  g.font='700 13px '+FU;g.textAlign='center';
  for(let s=0;s<=40;s+=4){const x=sx(s);if(x>WW-80)break;
    g.fillStyle=PAPER;g.strokeStyle=INK;g.lineWidth=3;g.fillRect(x-22,JY+66,44,22);g.strokeRect(x-22,JY+66,44,22);
    g.fillStyle=INK;g.fillText(s+' m',x,JY+82);g.fillRect(x-1,JY+50,2,16);}
  // ketapel di titik lempar
  g.fillStyle=SUN;g.strokeStyle=INK;g.lineWidth=4;g.beginPath();g.arc(JX,JY,26,0,7);g.fill();g.stroke();
  g.strokeStyle='#7a5a3a';g.lineWidth=7;g.beginPath();g.moveTo(JX,JY+14);g.lineTo(JX,JY-2);g.lineTo(JX-12,JY-16);g.moveTo(JX,JY-2);g.lineTo(JX+12,JY-16);g.stroke();
  g.fillStyle=INK;g.font='800 12px '+FD;g.fillText('TITIK LEMPAR',JX,JY-34);
  // mulut gang
  g.fillStyle='rgba(28,34,48,.35)';g.fillRect(GX-22,JY+60,44,30);
  g.fillStyle=INK;g.font='800 12px '+FD;g.fillText('GANG',GX+42,JY+104);
  // lapangan voli
  g.fillStyle='#c78f54';g.strokeStyle=INK;g.lineWidth=4;g.fillRect(1100,960,300,180);g.strokeRect(1100,960,300,180);
  g.strokeStyle=PAPER;g.lineWidth=3;g.strokeRect(1115,975,270,150);g.beginPath();g.moveTo(1250,975);g.lineTo(1250,1125);g.stroke();
  g.fillStyle=INK;g.font='800 15px '+FD;g.fillText('LAPANGAN',1250,1160);
  // bangunan
  for(const b of BUILD){
    g.fillStyle='rgba(28,34,48,.28)';g.fillRect(b.x+8,b.y+8,b.w,b.h);
    g.fillStyle=PAPER;g.strokeStyle=INK;g.lineWidth=4;g.fillRect(b.x,b.y,b.w,b.h);g.strokeRect(b.x,b.y,b.w,b.h);
    g.fillStyle=b.roof;g.fillRect(b.x+8,b.y+8,b.w-16,b.h-16);g.strokeRect(b.x+8,b.y+8,b.w-16,b.h-16);
    g.strokeStyle='rgba(28,34,48,.22)';g.lineWidth=2;for(let y=b.y+24;y<b.y+b.h-12;y+=16){g.beginPath();g.moveTo(b.x+10,y);g.lineTo(b.x+b.w-10,y);g.stroke();}
    g.fillStyle='#5a3b24';g.strokeStyle=INK;g.lineWidth=3;
    const dy=b.door==='s'?b.y+b.h-6:b.y-8;g.fillRect(b.x+b.w/2-18,dy,36,14);g.strokeRect(b.x+b.w/2-18,dy,36,14);
    g.font='800 15px '+FD;g.lineWidth=4;g.strokeStyle=INK;g.fillStyle=PAPER;g.textAlign='center';
    g.strokeText(b.name,b.x+b.w/2,b.y+b.h/2+5);g.fillText(b.name,b.x+b.w/2,b.y+b.h/2+5);
  }
  // tiang kamera dan terminal
  const cx=TG.rekaman.x,cy=TG.rekaman.y;
  g.fillStyle='#262a36';g.strokeStyle=INK;g.lineWidth=3;g.fillRect(cx-5,cy-70,10,70);g.strokeRect(cx-5,cy-70,10,70);
  g.fillStyle=ALERT;g.fillRect(cx-20,cy-98,40,28);g.strokeRect(cx-20,cy-98,40,28);
  g.fillStyle='#262a36';g.beginPath();g.arc(cx,cy-84,7,0,7);g.fill();
  g.font='700 12px '+FU;g.fillStyle=INK;g.fillText('KAMERA PASAR',cx,cy-106);
  // gerobak soto
  g.fillStyle='rgba(28,34,48,.25)';g.fillRect(969,870,76,34);
  g.fillStyle='#e9dfc8';g.strokeStyle=INK;g.lineWidth=3;g.fillRect(965,862,70,36);g.strokeRect(965,862,70,36);
  g.fillStyle=CORAL;g.fillRect(965,850,70,14);g.strokeRect(965,850,70,14);
  g.fillStyle='#262a36';g.beginPath();g.arc(978,900,7,0,7);g.fill();
  g.fillStyle=INK;g.font='800 11px '+FD;g.fillText('SOTO RINI',1000,885);
  // pohon
  const keep=[...BUILD.map(b=>[b.x-50,b.y-50,b.w+100,b.h+100]),[0,JY-130,WW,240],[1070,930,360,240],[940,820,120,100]];
  const pts=Object.values(TG),trees=[];
  for(let i=0;i<160&&trees.length<40;i++){
    const x=60+R()*(WW-120),y=60+R()*(WH-120);
    if(keep.some(k=>x>k[0]&&x<k[0]+k[2]&&y>k[1]&&y<k[1]+k[3]))continue;
    if(pts.some(p=>Math.hypot(p.x-x,p.y-y)<110))continue;
    if(trees.some(t=>Math.hypot(t.x-x,t.y-y)<70))continue;
    trees.push({x,y});SOLIDS.push({x:x-11,y:y-4,w:22,h:22});
  }
  for(const t of trees){
    g.fillStyle='rgba(28,34,48,.25)';g.beginPath();g.ellipse(t.x+10,t.y+14,28,16,0,0,7);g.fill();
    g.fillStyle='#7a5a3a';g.fillRect(t.x-5,t.y,10,16);
    g.fillStyle='#3f8a45';g.strokeStyle=INK;g.lineWidth=3;g.beginPath();g.arc(t.x,t.y-10,28,0,7);g.fill();g.stroke();
    g.fillStyle='#58a85a';g.beginPath();g.arc(t.x-7,t.y-18,13,0,7);g.fill();
  }
  for(const l of LAMPS){g.fillStyle='#262a36';g.fillRect(l.x-2,l.y-6,4,30);g.fillStyle=SUN;g.strokeStyle=INK;g.lineWidth=2;g.beginPath();g.arc(l.x,l.y-8,6,0,7);g.fill();g.stroke();}
  return c;
}

/* ---------- lemparan (dipakai adegan pembuka, ketapel, peragaan, dan kejar) ---------- */
let FL=null;
const CINE={mode:'intro'};
function launch(mode,who,vy,vx,x0,y0,rate,hover){
  FL={mode,who,vy,vx,x0,y0,t:0,T:2*vy/GR,rate,hover,trail:[[0,0]],done:false,after:0,hidden:false,blackout:false,apexX:null};
}
const flX=t=>FL.x0+FL.vx*t*PXM;
function tick(dt){
  if(!FL)return;
  if(!FL.done){
    const hp=FL.vy-GR*FL.t;let r=FL.rate;if(FL.hover)r*=.2+.8*Math.min(1,Math.abs(hp)/5);
    FL.t=Math.min(FL.T,FL.t+dt*r);
    FL.trail.push([FL.t,hAt(FL.vy,FL.t)]);
    if(FL.mode==='watch'&&FL.t>=FL.vy/GR)blackout();
    if(FL.t>=FL.T){FL.done=true;onLand();}
  }else{
    FL.after+=dt;
    if(FL.mode==='intro'&&FL.after>.9&&S.ui==='cine')endCine();
    else if(FL.mode==='self'&&FL.after>.6&&S.ui==='cine')showResult();
    else if(FL.mode==='demo'&&FL.after>.6&&S.ui==='cine')finishDemo();
  }
}
function onLand(){
  if(FL.mode==='run'){judgeCatch();return;}
  G.shake=Math.max(G.shake,.15);sfx.blip();
}
function blackout(){
  FL.blackout=true;FL.mode='run';FL.apexX=flX(FL.t);FL.hidden=true;
  SAVEDL=LAMPS.splice(0);G.night=.97;S.ui='none';G.shake=.35;sfx.twist();
  toast('LAMPU PADAM! Ke mana ia jatuh? LARI!');
}
function lightsOn(){if(SAVEDL){LAMPS.push(...SAVEDL);SAVEDL=null;}}

/* ---------- ketapel rekonstruksi ---------- */
const AIM={vy:10,vx:5,drag:null,go:null,no:null};
let RES=null;
function startAim(){S.ui='aim';K.u=K.d=K.l=K.r=false;T.x=T.y=0;}
function throwSelf(){
  S.recThrows=(S.recThrows||0)+1;
  launch('self','kamu',AIM.vy,AIM.vx,JX,JY,.7,true);S.ui='cine';CINE.mode='self';sfx.shot();
}
function showResult(){
  const dvy=AIM.vy-GHOST.vy,dvx=AIM.vx-GHOST.vx;
  const match=Math.round(100*clamp(1-Math.max(Math.abs(dvy),Math.abs(dvx))/3,0,1));
  const lines=[];
  if(Math.abs(dvy)>0.6)lines.push(dvy<0?'Lemparanmu mencapai puncak LEBIH AWAL dari rekaman.':'Lemparanmu mencapai puncak LEBIH LAMBAT dari rekaman.');
  if(Math.abs(dvx)>0.6)lines.push(dvx<0?'Gerak mendatarmu lebih LAMBAT: kemiringan x(t) kurang curam.':'Gerak mendatarmu lebih CEPAT: kemiringan x(t) terlalu curam.');
  if(!lines.length)lines.push('Kurvamu menimpa rekaman hantu. Inilah lemparannya.');
  RES={vy:AIM.vy,vx:AIM.vx,match,lines,ok:match>=80,trail:FL.trail.slice()};
  S.ui='result';
}
function closeResult(){
  S.ui='none';const r=RES;RES=null;FL=null;
  if(r.ok&&!S.flags.recon){
    S.flags.recon=true;S.reconPts=Math.max(50,160-25*Math.max(0,S.recThrows-3));sfx.ev();
    addEv({id:'recon',type:'meas',title:'Rekonstruksi lemparan hantu',text:'Ketapel dengan dorongan naik '+f1(r.vy)+' m/s dan laju mendatar '+f1(r.vx)+' m/s menimpa rekaman. Di puncak, benda berhenti naik sesaat: dari jauh terlihat melayang.',meta:{kind:'recon'}});
    say([['Rekonstruksi','COCOK. Lihat tadi: makin dekat puncak, panah kuning makin pendek. Di puncak ia nol, benda seolah diam di udara.'],
      ['Rekonstruksi','Jadi "hantu" itu lemparan biasa. Pertanyaannya sekarang: tangan siapa?']]);
  }
}

/* ---------- peragaan tersangka ---------- */
function launchDemo(who){const d=DEM[who];launch('demo',who,d.vy,d.vx,JX,JY,.7,true);S.ui='cine';CINE.mode='demo';sfx.shot();}
function finishDemo(){
  const who=FL.who;FL=null;S.ui='none';S.flags['demo_'+who]=true;
  addEv({id:'demo-'+who,type:'doc',title:'Lemparan uji '+DEM[who].n,text:'Terekam di terminal kamera: grafik h(t) dan x(t) milik '+DEM[who].n+'.'});
  toast('Rekaman baru di terminal: '+DEM[who].n);
}
const demosDone=()=>['joko','dimas','rini'].every(w=>S.flags['demo_'+w]);

/* ---------- kejar dalam gelap ---------- */
function startWatch(){
  const vy=r1(12+Math.random()*3),vx=r1(6+Math.random()*2.5);
  P.x=TG.pantau.x;P.y=TG.pantau.y;P.vx=P.vy=0;
  launch('watch','pelaku',vy,vx,GX,JY,.26,false);S.ui='cine';CINE.mode='watch';sfx.shot();
}
function judgeCatch(){
  const xl=flX(FL.T),dx=Math.abs(P.x-xl),dy=Math.abs(P.y-FL.y0);
  lightsOn();FL.hidden=false;FL.landX=xl;S.tries=(S.tries||0)+1;const f=S.flags;
  if(dx<=50&&dy<=95){
    S.catchPts=[200,120,60][S.tries-1];sfx.win();G.flash=.7;
    say([['Bungkusan','HAP! Tertangkap sebelum menyentuh tanah.'],['Bungkusan','Isinya kotak amal pasar. Tutupnya bergores huruf R.'],['Bungkusan','Terlilit di bungkusnya: karet ketapel dari potongan ban dalam.']],
      ()=>{f.paket=true;FL=null;addEv({id:'paket',type:'doc',title:'Bungkusan tertangkap',text:'Dilempar dari mulut gang warung soto. Isi: kotak amal bergores R, terlilit karet ketapel dari ban dalam.'});});
  }else{
    const m=dx/PXM;sfx.bad();G.shake=.5;
    if(S.tries<3)say([['Bungkusan','PRAK! Jatuh '+f1(m)+' m dari tempatmu. Isinya cuma batu bata: umpan.'],['anto','Pancingan! Dia akan melempar lagi. Kembali ke mulut gang, siaga!','curiga']],()=>{FL=null;});
    else{S.catchPts=40;say([['Bungkusan','PRAK! Jatuh '+f1(m)+' m darimu, bungkusnya robek.'],['Bungkusan','Isinya berserakan: kotak amal pasar bergores R, dan karet ketapel dari potongan ban dalam.']],
      ()=>{f.paket=true;FL=null;addEv({id:'paket',type:'doc',title:'Bungkusan jatuh',text:'Dilempar dari mulut gang warung soto. Isi: kotak amal bergores R, karet ketapel dari ban dalam.'});});}
  }
}

/* ---------- interaksi ---------- */
const INTS=[
  {id:'anto',ch:'anto',t:TG.anto,label:'Bicara dengan Pak Anto',act:talkAnto},
  {id:'ketapel',t:TG.ketapel,label:'Pakai ketapel rekonstruksi',icon:'Y',when:()=>S.flags.case&&!S.flags.twist,act:startAim},
  {id:'rekaman',t:TG.rekaman,label:'Buka terminal rekaman',act:()=>{if(!S.flags.case){say([['Terminal','Terkunci. Butuh izin Pak Anto.']]);return;}openTerminal();}},
  {id:'joko',ch:'joko',t:TG.joko,label:'Bicara dengan Joko',act:()=>{
    const f=S.flags;
    if(f.acc1&&!f.twist){sfx.twist();
      say([['joko','...Iya. Aku yang lempar. Tapi aku disuruh, Detektif!','panik'],['joko','Orangnya kasih bungkusan, tunjuk titik buta kamera, janji upah. Wajahnya ketutup.','panik'],['joko','Tadi dia bilang mau buang "sisa barangnya" malam ini juga. Kali ini dia lempar sendiri, dari gang.','panik']],
        ()=>{f.twist=true;addEv({id:'w-joko2',type:'witness',title:'Pengakuan Joko',text:'Joko melempar atas suruhan orang bertopeng. Malam ini orang itu akan melempar sisa barang dari sebuah gang.'});card('BAB 2','LAMPU PADAM');$('chap').textContent='Bab 2: Lampu Padam';});}
    else if(f.twist)say([['joko','Cepat, Detektif. Dia bisa lempar kapan saja.','panik']]);
    else if(f.case&&!f.demo_joko)say([['joko','Lempar? Aku cuma tukang parkir... ya sudah, kuperagakan dari titik lempar. Sekali saja.','panik']],()=>launchDemo('joko'));
    else say([['joko','Sudah kuperagakan. Aku boleh pergi?','panik']]);}},
  {id:'dimas',ch:'dimas',t:TG.dimas,label:'Bicara dengan Dimas',act:()=>{
    const f=S.flags;
    if(f.case&&!f.demo_dimas)say([['dimas','Rekor lempar sekolah, Detektif. Lihat ini, tingginya PERSIS seperti hantu itu!','senyum']],()=>launchDemo('dimas'));
    else if(f.case)say([['dimas','Puncakku sama tingginya, kan? Tapi malam itu aku tidur, sumpah.','senyum']]);
    else say([['dimas','Ada apa, Detektif?']]);}},
  {id:'rini',ch:'rini',t:TG.rini,label:'Bicara dengan Bu Rini',act:()=>{
    const f=S.flags;
    if(f.paket)say([['rini','Itu... bukan punyaku. Aku nggak tahu apa-apa!','panik']]);
    else if(f.case&&!f.demo_rini)say([['rini','Aduh, tanganku cuma kuat angkat panci. Ya sudah, kucoba.','senyum']],()=>launchDemo('rini'));
    else if(f.case)say([['rini','Tuh kan, nggak sampai jauh.','senyum']]);
    else say([['rini','Sotonya masih hangat, Detektif.','senyum']]);}},
  {id:'pantau',t:TG.pantau,label:'Siaga di mulut gang',icon:'!',when:()=>S.flags.siaga&&!S.flags.paket&&!FL,act:startWatch},
  {id:'gerobak',t:TG.gerobak,label:'Periksa gerobak soto',icon:'?',when:()=>S.flags.paket&&!S.flags.gerobak,act:()=>{
    sfx.twist();G.shake=.3;
    say([['Gerobak','Roda kiri gerobak soto kempis. Ban dalamnya hilang, tinggal potongan bergerigi.'],['Gerobak','Potongannya pas dengan karet ketapel di bungkusan.']],
      ()=>{S.flags.gerobak=true;addEv({id:'gerobak',type:'doc',title:'Gerobak soto',text:'Ban dalam roda gerobak soto hilang, potongannya cocok dengan karet ketapel.'});});}}
];

function talkAnto(){
  const f=S.flags;
  if(!f.case){
    say([['anto','Detektif {name}. Kamera Pasar merekam benda bercahaya naik, DIAM di udara, lalu hilang. Pasar heboh: katanya hantu.','curiga'],
      ['anto','Sebagian rekamannya tertutup atap dan pohon. Tapi potongan yang ada cukup, kalau kamu bisa membacanya.'],
      ['anto','Buka terminal di tiang kamera. Lalu buktikan sendiri: tiru lemparan itu dengan ketapel di titik lempar sampai kurvanya menimpa rekaman.']],
      ()=>{f.case=true;addEv({id:'lap',type:'doc',title:'Laporan benda melayang',text:'Benda bercahaya naik, tampak diam di udara, lalu hilang. Rekaman kamera hanya terlihat sebagian.'});});
  }else if(!f.recon){
    say([['anto','Belum menimpa? Baca dulu potongan rekamannya. Kapan benda berhenti naik? Seberapa cepat ia bergeser mendatar?']]);
  }else if(!demosDone()){
    say([['anto','Lemparan sekuat itu cuma bisa dari tiga orang: Joko, Dimas, Bu Rini. Minta mereka memperagakan. Rekamannya masuk terminal.']]);
  }else if(!f.acc1){
    say([['anto','Rekaman tiga lemparan uji sudah ada. Lemparan siapa yang sama dengan hantu?']],()=>openAccuse(1));
  }else if(!f.twist){
    say([['anto','Temui Joko. Dia punya penjelasan yang harus ia beri.']]);
  }else if(!f.siaga){
    say([['anto','Jadi dalangnya akan melempar lagi malam ini, dari sebuah gang. Gang warung soto paling dekat ke titik buta kamera.','curiga'],
      ['anto','Siaga di mulut gang. Begitu benda naik, perhatikan baik-baik, terutama puncaknya.'],
      ['anto','Kalau bungkusan itu menghantam tanah, isinya bisa hancur. TANGKAP sebelum jatuh.']],
      ()=>{f.siaga=true;toast('Siaga di mulut gang warung soto');sfx.ev();});
  }else if(!f.paket){
    say([['anto','Siaga di mulut gang. Puncak adalah kuncinya: waktu naik sama dengan waktu turun.']]);
  }else if(!f.gerobak){
    say([['anto','Karet ketapel dari ban dalam? Cari kendaraan yang bannya hilang.','curiga']]);
  }else{
    say([['anto','Semua bukti terkumpul. Siapa dalangnya?']],()=>openAccuse(2));
  }
}

/* ---------- terminal (Lensa) ---------- */
function openTerminal(){
  const gh=t=>hAt(GHOST.vy,t),gxx=t=>GHOST.vx*t,gaps=[[0,.6,'tertutup atap'],[2.4,3.6,'tertutup pohon']];
  const ser={
    'rek-h':{name:'Hantu h',col:'#7c4dbd',pts:sampleR(gh,.6,2.4),kind:'ball',sym:'h',ylab:'h (meter)',Smax:14,gaps},
    'rek-x':{name:'Hantu x',col:'#a879e0',pts:sampleR(gxx,.6,2.4),kind:'run',sym:'x',ylab:'x (meter dari titik lempar)',Smax:40,gaps}
  };
  for(const w of ['joko','dimas','rini'])if(S.flags['demo_'+w]){const d=DEM[w],Tl=2*d.vy/GR,col={joko:'#2f7fc1',dimas:'#2f9e5b',rini:'#e8553d'}[w];
    ser[w+'-h']={name:d.n+' h',col,pts:sampleR(t=>hAt(d.vy,t),0,Tl),kind:'ball',sym:'h',ylab:'h (meter)',Smax:14};
    ser[w+'-x']={name:d.n+' x',col,pts:sampleR(t=>d.vx*t,0,Tl),kind:'run',sym:'x',ylab:'x (meter dari titik lempar)',Smax:40};}
  gpOpen({src:'rekam',title:'Terminal Kamera Pasar',series:ser,cur:'rek-h',Tmax:3.6,Smax:14,camS:null,gmin:-20,gmax:20,k:1,unit:'m/s',sym:'h',ylab:'h (meter)',flat:false,startLocked:false,pinOK:false,
    tip:'Simpan pengukuranmu sebagai bukti. Yang disimpan terakhir untuk tiap grafik yang dinilai.'});
}
function onLensSave(i,GP){
  const [who,ax]=GP.cur.split('-'),nm=GP.series[GP.cur].name;
  if(ax==='h'){
    if(i.kind!=='inst'){addEv({id:'ha-'+who,type:'meas',title:nm+': rata-rata',text:'Antara '+f1(i.t1)+' dan '+f1(i.t2)+' dtk: Δh/Δt = '+f1(i.m)+' m/s.',meta:{kind:'havg'}});return 'saved';}
    addEv({id:'h-'+who,type:'meas',title:nm+': garis singgung',text:'Di t = '+(Math.round(i.t*100)/100).toFixed(2).replace('.',',')+' dtk, h = '+f1(i.s)+' m, h′ = '+f1(i.m)+' m/s.',meta:{kind:'h',who,t:i.t,m:i.m}});
  }else{
    addEv({id:'x-'+who,type:'meas',title:nm+': kemiringan',text:(i.kind==='inst'?'Garis singgung':'Garis potong')+': x′ = '+f1(i.m)+' m/s.',meta:{kind:'x',who,m:i.m}});
  }
  return 'saved';
}

/* ---------- tuduhan ---------- */
const ACQ={
  1:{title:'Laporan pertama',q:'Lemparan uji siapa yang sama dengan lemparan hantu?',
    who:[['joko','Joko'],['dimas','Dimas'],['rini','Bu Rini']],
    why:[['ok','Waktu puncaknya (saat h′ = 0) DAN kemiringan x(t)-nya sama dengan rekaman hantu.'],['puncak','Puncaknya sama tinggi dan sama waktunya dengan hantu. Itu sudah cukup.'],['rekor','Pemegang rekor lempar paling mungkin.'],['lemah','Yang lain terlalu lemah untuk melempar setinggi itu.']],ans:'joko'},
  2:{title:'Tuduhan akhir',q:'Siapa dalang di balik lemparan?',
    who:[['rini','Bu Rini'],['dimas','Dimas'],['joko','Joko']],
    why:[['ok','Lemparan kedua datang dari gang warung soto, karet ketapelnya dari ban dalam gerobak soto, dan kotaknya bergores R.'],['jago','Yang paling jago melempar pasti dalangnya.'],['ngaku','Joko sudah mengaku melempar, jadi dia dalangnya.'],['lemah','Yang mengaku lemah justru paling tidak mungkin.']],ans:'rini'}
};
function wrongMsg(n,A){
  if(n===1){
    if(A.who==='dimas')return 'Pak Anto: "Puncak Dimas memang kembar dengan hantu. Tapi apakah ia bergeser mendatar secepat hantu?" (-100)';
    if(A.who==='rini')return 'Pak Anto: "Ukur dulu kapan puncak lemparan Bu Rini." (-100)';
    return 'Pak Anto: "Orangnya mungkin benar, tapi satu ukuran tidak cukup membedakan dua lemparan." (-100)';
  }
  if(A.who==='joko')return 'Pak Anto: "Joko cuma suruhan, dan dia bersamaku waktu lemparan kedua." (-100)';
  if(A.who==='dimas')return 'Pak Anto: "Jago melempar bukan bukti. Dari mana lemparan kedua datang?" (-100)';
  return 'Pak Anto: "Orangnya mungkin benar, tapi bukti kuncinya bukan itu." (-100)';
}
function onAccuseOk(n){
  if(n===1){S.flags.acc1=true;sfx.ev();say([['anto','Puncaknya kembar dengan Dimas, tapi x′-nya hanya cocok dengan Joko. Dua turunan, satu jawaban.','senyum'],['anto','Temui Joko.']]);}
  else finale();
}
function finale(){
  sfx.win();
  say([['anto','Bu Rini. Ban dalam gerobak Ibu ada di bungkusan ini.','curiga'],
    ['rini','...Dana amal mau diaudit besok. Sebagian sudah kupakai untuk modal. Aku panik.','panik'],
    ['rini','Tanganku memang lemah. Makanya pakai ketapel. Dan malam pertama kusuruh Joko.','panik'],
    ['joko','Maaf, Pak. Aku butuh uangnya.','panik'],
    ['dimas','Jadi bukan hantu. Cuma kemiringan nol.','senyum'],
    ['anto','Dana dikembalikan, Ibu kerja bakti sebulan. Kerja bagus, Detektif {name}. Di puncak, yang naik dan yang menarik turun sama kuat.','senyum']],endCase);
}
function suspects(chip){
  const f=S.flags;
  if(f.case){chip('Joko',f.acc1?'hot':'');chip('Dimas',f.acc1?'x':'');chip('Bu Rini','');}
  if(f.twist)chip('Dalang bertopeng','hot');
}

/* ---------- alur ---------- */
function objective(){
  const f=S.flags;
  if(FL&&FL.mode==='run')return{t:'GELAP. Di mana bungkusan itu akan jatuh? Berdiri di sana!',p:null};
  if(!f.case)return{t:'Temui Pak Anto di Pos Satpam.',p:TG.anto};
  if(!f.recon){
    if(!S.evidence.some(e=>e.meta&&e.meta.kind==='h'&&e.meta.who==='rek'))return{t:'Terminal di tiang kamera: baca potongan rekaman hantu.',p:TG.rekaman};
    return{t:'Tiru lemparan hantu dengan ketapel di titik lempar.',p:TG.ketapel};
  }
  if(!demosDone()){const w=['joko','dimas','rini'].find(w=>!f['demo_'+w]);return{t:'Minta Joko, Dimas, dan Bu Rini memperagakan lemparan.',p:TG[w]};}
  if(!f.acc1)return{t:'Ukur rekaman tiga lemparan uji, lalu lapor Pak Anto.',p:TG.rekaman};
  if(!f.twist)return{t:'Temui Joko.',p:TG.joko};
  if(!f.siaga)return{t:'Lapor ke Pak Anto.',p:TG.anto};
  if(!f.paket)return{t:'Siaga di mulut gang warung soto.',p:TG.pantau};
  if(!f.gerobak)return{t:'Karet ketapel dari ban dalam. Kendaraan siapa yang bannya hilang?',p:TG.gerobak};
  return{t:'Kamu tahu dalangnya. Temui Pak Anto.',p:TG.anto};
}
function stageHint(){
  const f=S.flags;
  if(!f.recon)return['recon','Kemiringan h berkurang 9,8 m/s setiap detik. Kalau puncak (h′ = 0) terjadi di detik ke-t, dorongan naik awalnya 9,8 × t. Laju mendatar = kemiringan grafik x.'];
  if(!demosDone())return['demo','Bicara dengan Joko, Dimas, dan Bu Rini.'];
  if(!f.acc1)return['acc1','Dua lemparan bisa sama puncaknya. Bandingkan juga kemiringan grafik x.'];
  if(!f.paket)return['catch','Waktu naik = waktu turun. Kalau puncak terjadi d meter dari gang, bungkusan jatuh 2d meter dari gang.'];
  return['final','Dari mana lemparan kedua datang, dan dari mana karet ketapelnya?'];
}

/* ---------- skor ---------- */
function score(el){
  const sub=[];let meas=0;const det={detik:el,ukur:{},rekon:S.recThrows||0,tangkap:S.tries||0,petunjuk:S.hints,salah:S.wrong};
  for(const w of ['rek','joko','dimas','rini']){
    const nm=w==='rek'?'Hantu':DEM[w].n,eh=S.evidence.find(e=>e.meta&&e.meta.kind==='h'&&e.meta.who===w),ex=S.evidence.find(e=>e.meta&&e.meta.kind==='x'&&e.meta.who===w);
    const ea=eh?(Math.abs(eh.meta.m)>1.2?1:Math.abs(eh.meta.t-TRUE[w].ap)):null,ev=ex?Math.abs(ex.meta.m-TRUE[w].vx):null;
    const pa=ea==null?0:Math.round(30*clamp(1-(ea-.05)/.3,0,1)),pv=ev==null?0:Math.round(30*clamp(1-(ev-.2)/1.5,0,1));
    meas+=pa+pv;sub.push([nm+': puncak '+(ea==null?'belum':'selisih '+f1(ea)+' dtk')+', x′ '+(ev==null?'belum':'selisih '+f1(ev)),pa+pv]);
    det.ukur[w]={puncak:ea,vx:ev};
  }
  const rec=S.flags.recon?S.reconPts:0,cat=S.catchPts||0;
  const items=[['Mengukur rekaman (maks 240)',meas,sub],['Rekonstruksi ketapel, '+(S.recThrows||0)+' lemparan (maks 160)',rec],['Menangkap dalam gelap, percobaan ke-'+(S.tries||0)+' (maks 200)',cat],['Penalaran: dua tuduhan benar (maks 400)',400],['Petunjuk ('+S.hints+')',-60*S.hints],['Salah tuduh ('+S.wrong+')',-100*S.wrong]];
  return {items,detail:det};
}
function learn(){return [
  'Benda tampak melayang karena di puncak <code>h′(t) = 0</code>. Kamu melihatnya sendiri: lemparan melambat lalu seolah diam.',
  'Panah hijau (dorongan, tetap) dikurangi panah merah (gravitasi, tumbuh <code>9,8t</code>) = panah kuning <code>h′ = v↑ − 9,8t</code>. Turunan selisih adalah selisih turunan.',
  '<code>x = v→·t</code> garis lurus, kemiringannya tetap. Dimas punya puncak kembar dengan hantu, tapi <code>x′</code>-nya beda. Dan karena waktu naik = waktu turun, titik jatuh = 2 × jarak ke puncak.'
];}

/* ---------- input khusus ---------- */
const inR=(r,x,y)=>r&&x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h;
function onPointer(type,e){
  if(S.ui==='aim'){
    const x=e.clientX,y=e.clientY;
    if(type==='down'){
      if(inR(AIM.go,x,y)){throwSelf();return true;}
      if(inR(AIM.no,x,y)){S.ui='none';return true;}
      AIM.drag={x,y,vy:AIM.vy,vx:AIM.vx,id:e.pointerId};return true;
    }
    if(type==='move'&&AIM.drag&&e.pointerId===AIM.drag.id){
      AIM.vy=r1(clamp(AIM.drag.vy+(y-AIM.drag.y)*.03,2,20));AIM.vx=r1(clamp(AIM.drag.vx-(x-AIM.drag.x)*.03,0,15));return true;}
    if(type==='up'){AIM.drag=null;return true;}
    return true;
  }
  if(S.ui==='result'){if(type==='down')closeResult();return true;}
  if(S.ui==='cine'&&CINE.mode!=='intro')return type==='down';
  return false;
}
function onKey(e){
  const k=e.key,act=k==='e'||k==='E'||k===' '||k==='Enter';
  if(S.ui==='aim'){
    const st=e.shiftKey?1:.1;
    if(k==='ArrowUp'||k==='w'||k==='W')AIM.vy=r1(clamp(AIM.vy+st,2,20));
    else if(k==='ArrowDown'||k==='s'||k==='S')AIM.vy=r1(clamp(AIM.vy-st,2,20));
    else if(k==='ArrowRight'||k==='d'||k==='D')AIM.vx=r1(clamp(AIM.vx+st,0,15));
    else if(k==='ArrowLeft'||k==='a'||k==='A')AIM.vx=r1(clamp(AIM.vx-st,0,15));
    else if(act){if(!e.repeat)throwSelf();}
    else if(k==='Escape')S.ui='none';
    else return false;
    e.preventDefault();return true;
  }
  if(S.ui==='result'){if(act||k==='Escape'){if(!e.repeat)closeResult();e.preventDefault();}return true;}
  if(S.ui==='cine'&&CINE.mode!=='intro'&&act){e.preventDefault();return true;}
  return false;
}

/* ---------- gambar ---------- */
function arrow(ctx,x,y,dx,dy,col,w){
  const L=Math.hypot(dx,dy);if(L<3)return;
  ctx.strokeStyle=INK;ctx.lineWidth=w+3;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+dx,y+dy);ctx.stroke();
  ctx.strokeStyle=col;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+dx,y+dy);ctx.stroke();
  const a=Math.atan2(dy,dx),hx=x+dx,hy=y+dy,s=w+6;
  ctx.fillStyle=col;ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(hx+Math.cos(a)*s,hy+Math.sin(a)*s);ctx.lineTo(hx+Math.cos(a+2.4)*s,hy+Math.sin(a+2.4)*s);ctx.lineTo(hx+Math.cos(a-2.4)*s,hy+Math.sin(a-2.4)*s);ctx.closePath();ctx.fill();ctx.stroke();
}
function box(ctx,x,y,w,h){ctx.fillStyle=INK;ctx.fillRect(x+4,y+4,w,h);ctx.fillStyle=PAPER;ctx.strokeStyle=INK;ctx.lineWidth=3;ctx.fillRect(x,y,w,h);ctx.strokeRect(x,y,w,h);}
function txt(ctx,s,x,y,font,col,al){ctx.font=font;ctx.fillStyle=col||INK;ctx.textAlign=al||'left';ctx.fillText(s,x,y);}
function miniPlot(ctx,x,y,w,h,tmax,ymax,curves,lab){
  ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y+h);ctx.lineTo(x+w,y+h);ctx.stroke();
  const X=t=>x+t/tmax*w,Y=v=>y+h-v/ymax*h;
  for(const c of curves){if(!c.pts||c.pts.length<2)continue;ctx.strokeStyle=c.col;ctx.lineWidth=c.w||3;ctx.setLineDash(c.dash||[]);ctx.beginPath();c.pts.forEach((p,i)=>{i?ctx.lineTo(X(p[0]),Y(p[1])):ctx.moveTo(X(p[0]),Y(p[1]));});ctx.stroke();ctx.setLineDash([]);}
  txt(ctx,lab,x+4,y+12,'700 11px '+FU);
  return {X,Y};
}
function drawOverlay(ctx){
  const {W,H,hs}=V;
  if(FL){
    const t=FL.t,h=hAt(FL.vy,t),wx=flX(t);
    const [gx0,gy0]=w2s(FL.x0,FL.y0),[sxp,syg]=w2s(wx,FL.y0),Z=V.Z,sy=syg-h*HV*Z;
    if(FL.blackout&&!FL.done){
      const [px,py]=w2s(P.x,P.y),dg=ctx.createRadialGradient(px,py,60*Z,px,py,240*Z);
      dg.addColorStop(0,'rgba(4,5,18,0)');dg.addColorStop(1,'rgba(4,5,18,.9)');ctx.fillStyle=dg;ctx.fillRect(0,0,W,H);
    }
    if(FL.mode==='run'||FL.blackout){
      // penanda: asal lemparan dan posisi puncak terakhir terlihat
      ctx.fillStyle='rgba(255,200,90,.9)';ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.beginPath();ctx.arc(gx0,gy0,7,0,7);ctx.fill();ctx.stroke();
      txt(ctx,'gang',gx0,gy0+22,'700 '+Math.round(12*hs)+'px '+FU,PAPER,'center');
      if(FL.apexX!=null){const [ax,ay]=w2s(FL.apexX,FL.y0);ctx.strokeStyle='rgba(168,121,224,.95)';ctx.lineWidth=3;ctx.setLineDash([6,5]);ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(ax,ay-HV*Z*hAt(FL.vy,FL.vy/GR));ctx.stroke();ctx.setLineDash([]);
        ctx.fillStyle='rgba(168,121,224,.95)';ctx.beginPath();ctx.arc(ax,ay,6,0,7);ctx.fill();txt(ctx,'di bawah puncak',ax,ay+22,'700 '+Math.round(12*hs)+'px '+FU,PAPER,'center');}
      if(FL.landX!=null){const [lx,ly]=w2s(FL.landX,FL.y0);ctx.strokeStyle=ALERT;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(lx-10,ly-10);ctx.lineTo(lx+10,ly+10);ctx.moveTo(lx+10,ly-10);ctx.lineTo(lx-10,ly+10);ctx.stroke();}
    }
    if(!FL.hidden){
      ctx.fillStyle='rgba(10,12,30,.45)';ctx.beginPath();ctx.ellipse(sxp,syg+4,Math.max(5,13-h*.5)*Z,5*Z,0,0,7);ctx.fill();
      const gl=ctx.createRadialGradient(sxp,sy,2,sxp,sy,70*Z);gl.addColorStop(0,'rgba(255,232,150,.95)');gl.addColorStop(1,'rgba(255,200,60,0)');
      ctx.fillStyle=gl;ctx.beginPath();ctx.arc(sxp,sy,70*Z,0,7);ctx.fill();
      ctx.fillStyle='#fff6c8';ctx.strokeStyle=INK;ctx.lineWidth=3;ctx.beginPath();ctx.arc(sxp,sy,11*Z,0,7);ctx.fill();ctx.stroke();
      if(FL.mode!=='intro'&&!FL.done){
        const k=4.2*Z,hp=FL.vy-GR*t;
        arrow(ctx,sxp-30*Z,sy,0,-FL.vy*k,GOOD,5);
        arrow(ctx,sxp-16*Z,sy-FL.vy*k,0,GR*t*k,ALERT,4);
        arrow(ctx,sxp+20*Z,sy,0,-hp*k,SUN,6);
        arrow(ctx,sxp,sy+16*Z,FL.vx*k,0,'#c25a1c',4);
      }
    }
    if(FL.mode!=='intro')livePanel(ctx);
  }
  if(S.ui==='aim')aimPanel(ctx);
  if(S.ui==='result'&&RES)resultPanel(ctx);
}
function livePanel(ctx){
  const {W,H,hs}=V,w=Math.min(300*hs,W-24),h=150*hs,x=12,y=Math.round(H*.88)-h-8;
  box(ctx,x,y,w,h);
  const px=x+30*hs,py=y+12*hs,pw=w*.52,ph=h-40*hs;
  const vis=FL.blackout?FL.trail.filter(p=>p[0]<=FL.vy/GR+1e-6):FL.trail;
  const ref=FL.mode==='self'?[{pts:sampleR(t=>hAt(GHOST.vy,t),.6,2.4),col:'#a879e0',w:3,dash:[5,4]}]:[];
  const m=miniPlot(ctx,px,py,pw,ph,3.6,14,[...ref,{pts:vis,col:SUN,w:3.5}],'h(t)');
  const lt=vis[vis.length-1][0],lh=vis[vis.length-1][1],hp=FL.vy-GR*lt;
  if(!FL.blackout&&!FL.done){ctx.strokeStyle=ALERT;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(m.X(lt-.45),m.Y(lh-hp*.45));ctx.lineTo(m.X(lt+.45),m.Y(lh+hp*.45));ctx.stroke();}
  txt(ctx,'t (dtk)',px+pw,py+ph+14*hs,'700 '+Math.round(10*hs)+'px '+FU,INK,'right');
  const cx=px+pw+12*hs,f=Math.round(12*hs);
  if(FL.blackout&&FL.mode==='run'&&!FL.done){ctx.fillStyle=ALERT;ctx.fillRect(px,py+ph*.35,pw,22*hs);txt(ctx,'SINYAL HILANG',px+pw/2,py+ph*.35+16*hs,'800 '+f+'px '+FD,PAPER,'center');}
  txt(ctx,'t = '+f1(lt)+' dtk',cx,py+12*hs,'700 '+f+'px '+FU);
  txt(ctx,'h′ = '+f1(hp)+' m/s',cx,py+30*hs,'800 '+f+'px '+FU,hp>0.3?INK:hp<-0.3?ALERT:GOOD);
  const lg=(c,s,yy)=>{ctx.fillStyle=c;ctx.fillRect(cx,yy-9*hs,12*hs,10*hs);ctx.strokeStyle=INK;ctx.lineWidth=1.5;ctx.strokeRect(cx,yy-9*hs,12*hs,10*hs);txt(ctx,s,cx+16*hs,yy,'600 '+Math.round(10.5*hs)+'px '+FU);};
  lg(GOOD,'dorongan v↑',py+54*hs);lg(ALERT,'gravitasi 9,8t',py+70*hs);lg(SUN,'h′ = selisihnya',py+86*hs);lg('#c25a1c','x′ mendatar',py+102*hs);
}
function aimPanel(ctx){
  const {W,H,hs}=V,w=Math.min(470*hs,W-20),h=168*hs,x=(W-w)/2,y=H-h-14;
  // panah pratinjau di titik lempar
  const [bx,by]=w2s(JX,JY),k=4.2*V.Z;
  arrow(ctx,bx,by,0,-AIM.vy*k,GOOD,5);arrow(ctx,bx,by,AIM.vx*k,0,'#c25a1c',5);
  box(ctx,x,y,w,h);
  const f=Math.round(15*hs);
  txt(ctx,'KETAPEL REKONSTRUKSI',x+14,y+22*hs,'800 '+f+'px '+FD);
  txt(ctx,'dorongan naik  v↑ = '+f1(AIM.vy)+' m/s',x+14,y+48*hs,'800 '+Math.round(17*hs)+'px '+FU,GOOD);
  txt(ctx,'laju mendatar  v→ = '+f1(AIM.vx)+' m/s',x+14,y+72*hs,'800 '+Math.round(17*hs)+'px '+FU,'#c25a1c');
  txt(ctx,G.coarse?'Tarik ke bawah: dorongan naik. Tarik ke kiri: laju mendatar.':'Seret mouse, atau panah ↑↓ dan ←→ (Shift: langkah 1). E: lempar.',x+14,y+96*hs,'600 '+Math.round(11.5*hs)+'px '+FU);
  const bw=120*hs,bh=40*hs;
  AIM.no={x:x+14,y:y+h-bh-12,w:bw*.8,h:bh};AIM.go={x:x+w-bw-14,y:y+h-bh-12,w:bw,h:bh};
  ctx.fillStyle='#fff';ctx.strokeStyle=INK;ctx.lineWidth=3;ctx.fillRect(AIM.no.x,AIM.no.y,AIM.no.w,bh);ctx.strokeRect(AIM.no.x,AIM.no.y,AIM.no.w,bh);
  txt(ctx,'Batal',AIM.no.x+AIM.no.w/2,AIM.no.y+bh*.66,'800 '+f+'px '+FD,INK,'center');
  ctx.fillStyle=INK;ctx.fillRect(AIM.go.x+4,AIM.go.y+4,bw,bh);ctx.fillStyle=CORAL;ctx.fillRect(AIM.go.x,AIM.go.y,bw,bh);ctx.strokeRect(AIM.go.x,AIM.go.y,bw,bh);
  txt(ctx,'LEMPAR',AIM.go.x+bw/2,AIM.go.y+bh*.66,'800 '+f+'px '+FD,INK,'center');
  txt(ctx,'Lemparan ke-'+((S.recThrows||0)+1),x+w-14,y+22*hs,'700 '+Math.round(12*hs)+'px '+FU,INK,'right');
}
function resultPanel(ctx){
  const {W,H,hs}=V,w=Math.min(600*hs,W-20),h=Math.min(320*hs,H-20),x=(W-w)/2,y=(H-h)/2,f=Math.round(14*hs);
  box(ctx,x,y,w,h);
  txt(ctx,'COCOK '+RES.match+'%',x+16,y+30*hs,'800 '+Math.round(26*hs)+'px '+FD,RES.ok?GOOD:ALERT);
  txt(ctx,'v↑ '+f1(RES.vy)+' m/s, v→ '+f1(RES.vx)+' m/s',x+w-16,y+28*hs,'700 '+f+'px '+FU,INK,'right');
  const pw=(w-60)/2,ph=h-130*hs,py=y+48*hs,gaps=[.6,2.4];
  const ghH=sampleR(t=>hAt(GHOST.vy,t),gaps[0],gaps[1]),ghX=sampleR(t=>GHOST.vx*t,gaps[0],gaps[1]);
  const T2=2*RES.vy/GR,myH=sampleR(t=>hAt(RES.vy,t),0,T2),myX=sampleR(t=>RES.vx*t,0,T2);
  miniPlot(ctx,x+24,py,pw,ph,3.6,16,[{pts:ghH,col:'#7c4dbd',w:6},{pts:myH,col:CORAL,w:3}],'h(t)');
  miniPlot(ctx,x+36+pw,py,pw,ph,3.6,40,[{pts:ghX,col:'#7c4dbd',w:6},{pts:myX,col:CORAL,w:3}],'x(t)');
  txt(ctx,'ungu tebal: rekaman hantu   oranye: lemparanmu',x+24,py+ph+18*hs,'600 '+Math.round(11*hs)+'px '+FU);
  RES.lines.forEach((l,i)=>txt(ctx,l,x+16,py+ph+40*hs+i*18*hs,'700 '+Math.round(12.5*hs)+'px '+FU));
  txt(ctx,(G.coarse?'Ketuk':'E')+' untuk lanjut',x+w-16,y+h-10*hs,'600 '+Math.round(11*hs)+'px '+FU,INK,'right');
}

/* ---------- hook mesin ---------- */
function night(){if(FL&&FL.blackout&&!FL.done)return .97;return S.flags.twist?.72:.55;}
function cineStep(dt){
  if(!FL)return [P.x,P.y];
  const h=hAt(FL.vy,FL.t),x=flX(FL.t);
  if(FL.mode==='watch')return [(P.x+x)/2+60,FL.y0-h*HV*.5];
  return [x,FL.y0-h*HV*.5];
}
function afterMove(dt){}
function begin(){
  P.x=TG.anto.x+60;P.y=TG.anto.y+20;S.ui='cine';CINE.mode='intro';
  launch('intro','hantu',GHOST.vy,GHOST.vx,JX,JY,.75,true);
  return [JX+GHOST.vx*1.5*PXM,JY-100];
}
function init(){}
function drawWorld(ctx){}
function drawWorldTop(ctx){}
function drawCine(ctx){
  const {W,H,hs}=V;
  ctx.textAlign='center';ctx.lineJoin='round';
  const big=(s,yy,sz,col)=>{ctx.font='800 '+Math.round(sz*hs)+'px '+FD;ctx.lineWidth=9;ctx.strokeStyle=INK;ctx.strokeText(s,W/2,yy);ctx.fillStyle=col;ctx.fillText(s,W/2,yy);};
  const small=(s,yy)=>{ctx.font='700 '+Math.round(18*hs)+'px '+FU;ctx.lineWidth=6;ctx.strokeStyle=INK;ctx.strokeText(s,W/2,yy);ctx.fillStyle=PAPER;ctx.fillText(s,W/2,yy);};
  if(CINE.mode==='intro'){
    if(FL&&Math.abs(FL.vy-GR*FL.t)<4.5){big('MELAYANG?',H*.78,56,SUN);small('Kamera Pasar, 00:03 dini hari',H*.78+32*hs);}
    ctx.fillStyle=PAPER;ctx.font='600 '+Math.round(12*hs)+'px '+FU;ctx.textAlign='right';ctx.fillText(G.coarse?'ketuk untuk lewati':'tekan E untuk lewati',W-14,H*.89+20*hs);
  }else if(CINE.mode==='self')small('Lemparanmu. Perhatikan panah kuning di dekat puncak.',H*.11+30*hs);
  else if(CINE.mode==='demo'&&FL)small('Lemparan uji: '+DEM[FL.who].n,H*.11+30*hs);
  else if(CINE.mode==='watch'){big('JANGAN BERKEDIP',H*.11+50*hs,40,SUN);small('Bungkusan melesat dari gang. Perhatikan puncaknya.',H*.11+78*hs);}
}
function drawHud(ctx){}
function jitter(it){return(it.ch==='rini'&&S.flags.paket)?Math.sin(G.T*30)*1.2:0;}
function cineEnd(){if(CINE.mode==='intro'){FL=null;card('BAB 1','BENDA MELAYANG');}}

if(window.__TEST__)window.__C={get FL(){return FL;},AIM,get RES(){return RES;},startWatch,flX,GHOST,DEM};

return {
  id:'melayang-1',judul:'Benda di Atas Pasar',eyebrow:'Semesta 2, Lemparan. Kasus 1',
  lede:'Tengah malam. Kamera Pasar merekam benda bercahaya naik, diam di udara, lalu hilang. Pasar heboh: hantu. Kamu tidak percaya hantu.',
  teaser:'<b>Pagi hari.</b> Harga cabai naik dua kali lipat, tapi para pedagang justru rugi. Seseorang memainkan angka di pasar. <b>Kasus 3 segera.</b>',
  chapter:'Bab 1: Benda Melayang',
  WW,WH,SOLIDS,LAMPS,CH,TG,sx,
  ints:INTS,extraInts:()=>[],buildWorld,objective,stageHint,pinPos:()=>null,
  ACQ,wrongMsg,onAccuseOk,onLensSave,suspects,score,learn,onPointer,onKey,drawOverlay,
  tick,night,cineStep,afterMove,begin,init,cineEnd,drawWorld,drawWorldTop,drawCine,drawHud,jitter
};
}
