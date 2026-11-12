/* Semesta 1, Kasus 1: Tilang Salah Alamat. Seluruh data, dunia, dialog, dan aturan kasus ada di sini.
   Mesin umum (core/engine.js) memanggil objek yang dikembalikan create(E). */
export default function create(E){
const {S,P,G,K,T,V,$,clamp,lerp,f0,f1,rngSeed,INK,PAPER,SUN,CORAL,ALERT,BLUE,GOOD,FD,FU,say,toast,addEv,card,sfx,openAccuse,gpOpen,endCine,endCase}=E;

const CAM_S=250,STOP_S=330,END_S=110;
const BR_A=23.3*23.3/(2*(STOP_S-266.05)),BR_T=23.3/BR_A;
function merahF(t){
  if(t<=17)return 8*t+0.45*t*t;
  const u=t-17;if(u<=BR_T)return 266.05+23.3*u-0.5*BR_A*u*u;
  if(t<=34)return STOP_S;
  if(t<=58){const k=(t-34)/24;return STOP_S-(STOP_S-END_S)*(3*k*k-2*k*k*k);}
  return END_S;
}
const MOTORS={
  merah:{name:'Motor merah',col:'#e8553d',T:17.5,f:merahF},
  biru:{name:'Motor biru',col:'#2f7fc1',T:14.5,f:t=>22*t-0.25*t*t},
  hijau:{name:'Motor hijau',col:'#2f9e5b',T:19.5,f:t=>14*t}
};
const sample=(f,T)=>{const a=[];for(let t=0;t<=T+1e-9;t+=0.05)a.push([t,f(t)]);return a;};
for(const k in MOTORS){
  const m=MOTORS[k];m.pts=sample(m.f,m.T);
  let tc=0;for(let i=1;i<m.pts.length;i++){if(m.pts[i][1]>=CAM_S){const a=m.pts[i-1],b=m.pts[i];tc=a[0]+(CAM_S-a[1])/(b[1]-a[1])*(b[0]-a[0]);break;}}
  m.tc=tc;m.vInst=(m.f(tc+.001)-m.f(tc-.001))/.002;m.vAvg=CAM_S/tc;
}
MOTORS.merah.ext=sample(merahF,66);
const CH={
  anto:{n:'Pak Anto',body:'#c9b27a',cap:'#4a6fa5'},
  djo:{n:'Pak Djo',body:'#f4efe1',cap:'#e8553d'},
  budi:{n:'Pak Budi',body:'#2f7fc1',cap:'#1c2230'},
  sari:{n:'Bu Sari',body:'#2f9e5b',cap:'#f4efe1'},
  rudi:{n:'Rudi',body:'#d98c5f',cap:'#1c2230'}
};

/* ================= DUNIA ================= */
const WW=2400,WH=1500,PXM=40;
const X0=300,PXS=5.6,sx=s=>X0+s*PXS;
const ROAD={y:640,h:140},CAMX=sx(CAM_S);
const TRACK={x0:520,x1:1320,y:1190,h:64};
const BUILD=[
  {x:180,y:360,w:300,h:190,roof:'#4a6fa5',name:'POS POLISI',door:'s'},
  {x:720,y:400,w:260,h:150,roof:'#e8553d',name:'WARUNG BAKSO',door:'s'},
  {x:1380,y:370,w:280,h:190,roof:'#8aa05a',name:'RUMAH PAK BUDI',door:'s'},
  {x:1840,y:880,w:380,h:170,roof:'#d9a441',name:'PASAR',door:'n'},
  {x:1180,y:880,w:150,h:110,roof:'#6f7b8c',name:'POS JAGA SENSOR',door:'n'},
  {x:250,y:880,w:280,h:170,roof:'#7a5a3a',name:'BENGKEL RUDI',door:'n'}
];
const TG={polisi:{x:415,y:600},djo:{x:790,y:600},budi:{x:1520,y:600},sari:{x:2110,y:835},rudi:{x:390,y:835},
  kamera:{x:CAMX+55,y:605},terminal:{x:1255,y:835},trial:{x:TRACK.x0-40,y:TRACK.y},terpal:{x:1045,y:562}};
const SOLIDS=BUILD.map(b=>({x:b.x,y:b.y,w:b.w,h:b.h}));
SOLIDS.push({x:1012,y:498,w:66,h:36});
const LAMPS=[];for(let x=140;x<WW;x+=330)LAMPS.push({x,y:ROAD.y-34});
const TREES=[];
let WORLD=null;

function buildWorld(){
  const c=document.createElement('canvas');c.width=WW;c.height=WH;const g=c.getContext('2d');
  const R=rngSeed(11);
  g.fillStyle='#78b85a';g.fillRect(0,0,WW,WH);
  for(let i=0;i<140;i++){g.fillStyle=R()<.5?'#86c466':'#6eac52';g.beginPath();g.ellipse(R()*WW,R()*WH,30+R()*70,18+R()*40,0,0,7);g.fill();}
  g.strokeStyle='#5c9a45';g.lineWidth=2;
  for(let i=0;i<520;i++){const x=R()*WW,y=R()*WH;g.beginPath();g.moveTo(x,y);g.lineTo(x-3,y-7);g.moveTo(x,y);g.lineTo(x+3,y-8);g.stroke();}
  g.fillStyle='#d6b98a';
  for(const b of BUILD){
    const dx=b.x+b.w/2-18;
    if(b.door==='s')g.fillRect(dx,b.y+b.h,36,ROAD.y-(b.y+b.h));
    else g.fillRect(dx,ROAD.y+ROAD.h,36,b.y-(ROAD.y+ROAD.h));
  }
  g.fillRect(TRACK.x0-160,TRACK.y-60,TRACK.x1-TRACK.x0+320,TRACK.h+120);
  g.fillRect(990,540,110,ROAD.y-540);
  // jalan raya
  g.fillStyle='#343a47';g.fillRect(0,ROAD.y,WW,ROAD.h);
  for(let x=0;x<WW;x+=40){g.fillStyle=((x/40)&1)?PAPER:ALERT;g.fillRect(x,ROAD.y-8,40,8);g.fillRect(x,ROAD.y+ROAD.h,40,8);}
  g.fillStyle=PAPER;for(let x=0;x<WW;x+=80)g.fillRect(x+10,ROAD.y+ROAD.h/2-3,44,6);
  // patok jarak: jembatan antara grafik dan dunia
  g.font='700 13px '+FU;g.textAlign='center';
  for(let s=0;s<=350;s+=50){
    const x=sx(s);
    g.fillStyle=PAPER;g.strokeStyle=INK;g.lineWidth=3;g.fillRect(x-22,ROAD.y-34,44,22);g.strokeRect(x-22,ROAD.y-34,44,22);
    g.fillStyle=INK;g.fillText(s+' m',x,ROAD.y-18);
    g.fillStyle='rgba(255,246,228,.5)';g.fillRect(x-1,ROAD.y,2,ROAD.h);
  }
  // gapura Pos A
  g.fillStyle=SUN;g.strokeStyle=INK;g.lineWidth=4;g.fillRect(X0-8,ROAD.y-58,16,ROAD.h+116);g.strokeRect(X0-8,ROAD.y-58,16,ROAD.h+116);
  g.font='800 15px '+FD;g.fillStyle=INK;g.fillText('POS A',X0,ROAD.y-66);
  // garis kamera
  g.fillStyle=ALERT;g.fillRect(CAMX-5,ROAD.y,10,ROAD.h);
  g.fillStyle=PAPER;for(let y=ROAD.y+4;y<ROAD.y+ROAD.h;y+=22)g.fillRect(CAMX-2,y,4,10);
  g.save();g.translate(CAMX+22,ROAD.y+ROAD.h/2);g.rotate(Math.PI/2);g.font='700 13px '+FU;g.fillStyle=PAPER;g.fillText('GARIS KAMERA',0,0);g.restore();
  g.fillStyle='#262a36';g.strokeStyle=INK;g.lineWidth=3;g.fillRect(CAMX-6,ROAD.y-60,10,60);g.strokeRect(CAMX-6,ROAD.y-60,10,60);
  g.fillStyle=ALERT;g.fillRect(CAMX-20,ROAD.y-88,38,28);g.strokeRect(CAMX-20,ROAD.y-88,38,28);
  g.fillStyle='#262a36';g.beginPath();g.arc(CAMX-1,ROAD.y-74,7,0,7);g.fill();
  g.font='700 12px '+FU;g.fillStyle=INK;g.fillText('KAMERA PASAR',CAMX-1,ROAD.y-96);
  // lampu jalan
  for(const l of LAMPS){g.fillStyle='#262a36';g.fillRect(l.x-2,l.y-6,4,26);g.fillStyle=SUN;g.strokeStyle=INK;g.lineWidth=2;g.beginPath();g.arc(l.x,l.y-8,6,0,7);g.fill();g.stroke();}
  // lintasan uji
  g.fillStyle='#d98c5f';g.strokeStyle=INK;g.lineWidth=4;g.fillRect(TRACK.x0-12,TRACK.y-TRACK.h/2,TRACK.x1-TRACK.x0+24,TRACK.h);g.strokeRect(TRACK.x0-12,TRACK.y-TRACK.h/2,TRACK.x1-TRACK.x0+24,TRACK.h);
  g.fillStyle=PAPER;g.fillRect(TRACK.x0-3,TRACK.y-TRACK.h/2,6,TRACK.h);
  for(let i=0;i<8;i++){g.fillStyle=(i&1)?INK:PAPER;g.fillRect(TRACK.x1-6,TRACK.y-TRACK.h/2+i*TRACK.h/8,6,TRACK.h/8);g.fillStyle=(i&1)?PAPER:INK;g.fillRect(TRACK.x1,TRACK.y-TRACK.h/2+i*TRACK.h/8,6,TRACK.h/8);}
  g.font='700 13px '+FU;g.fillStyle=INK;
  for(let m=0;m<=20;m+=5){const x=TRACK.x0+m*PXM;g.fillRect(x-1,TRACK.y+TRACK.h/2,3,10);g.fillText(m+' m',x,TRACK.y+TRACK.h/2+26);}
  g.font='800 20px '+FD;g.fillText('LINTASAN UJI',(TRACK.x0+TRACK.x1)/2,TRACK.y-TRACK.h/2-14);
  g.font='700 13px '+FU;g.fillText('START',TRACK.x0,TRACK.y-TRACK.h/2-34);g.fillText('FINIS',TRACK.x1,TRACK.y-TRACK.h/2-34);
  // bangunan
  for(const b of BUILD){
    g.fillStyle='rgba(28,34,48,.28)';g.fillRect(b.x+8,b.y+8,b.w,b.h);
    g.fillStyle=PAPER;g.strokeStyle=INK;g.lineWidth=4;g.fillRect(b.x,b.y,b.w,b.h);g.strokeRect(b.x,b.y,b.w,b.h);
    g.fillStyle=b.roof;g.fillRect(b.x+8,b.y+8,b.w-16,b.h-16);g.strokeRect(b.x+8,b.y+8,b.w-16,b.h-16);
    g.strokeStyle='rgba(28,34,48,.22)';g.lineWidth=2;for(let y=b.y+24;y<b.y+b.h-12;y+=16){g.beginPath();g.moveTo(b.x+10,y);g.lineTo(b.x+b.w-10,y);g.stroke();}
    g.fillStyle='#5a3b24';g.strokeStyle=INK;g.lineWidth=3;
    const dy=b.door==='s'?b.y+b.h-6:b.y-8;g.fillRect(b.x+b.w/2-18,dy,36,14);g.strokeRect(b.x+b.w/2-18,dy,36,14);
    g.font='800 15px '+FD;g.lineWidth=4;g.strokeStyle=INK;g.fillStyle=PAPER;
    g.strokeText(b.name,b.x+b.w/2,b.y+b.h/2+5);g.fillText(b.name,b.x+b.w/2,b.y+b.h/2+5);
  }
  // pohon
  const keep=[...BUILD.map(b=>[b.x-50,b.y-50,b.w+100,b.h+100]),[0,ROAD.y-80,WW,ROAD.h+140],[TRACK.x0-220,TRACK.y-110,TRACK.x1-TRACK.x0+440,TRACK.h+220],[960,440,180,200]];
  const pts=Object.values(TG);
  for(let i=0;i<140&&TREES.length<46;i++){
    const x=60+R()*(WW-120),y=60+R()*(WH-120);
    if(keep.some(k=>x>k[0]&&x<k[0]+k[2]&&y>k[1]&&y<k[1]+k[3]))continue;
    if(pts.some(p=>Math.hypot(p.x-x,p.y-y)<110))continue;
    if(TREES.some(t=>Math.hypot(t.x-x,t.y-y)<70))continue;
    TREES.push({x,y});SOLIDS.push({x:x-11,y:y-4,w:22,h:22});
  }
  for(const t of TREES){
    g.fillStyle='rgba(28,34,48,.25)';g.beginPath();g.ellipse(t.x+10,t.y+14,28,16,0,0,7);g.fill();
    g.fillStyle='#7a5a3a';g.fillRect(t.x-5,t.y,10,16);
    g.fillStyle='#3f8a45';g.strokeStyle=INK;g.lineWidth=3;g.beginPath();g.arc(t.x,t.y-10,28,0,7);g.fill();g.stroke();
    g.fillStyle='#58a85a';g.beginPath();g.arc(t.x-7,t.y-18,13,0,7);g.fill();
  }
  const pm=(x,y,col)=>{g.fillStyle='rgba(28,34,48,.25)';g.fillRect(x-24,y-6,56,22);g.fillStyle='#262a36';g.strokeStyle=INK;g.lineWidth=2;g.fillRect(x-28,y-5,14,10);g.fillRect(x+14,y-5,14,10);g.fillStyle=col;g.fillRect(x-20,y-7,40,14);g.strokeRect(x-20,y-7,40,14);g.fillStyle=INK;g.fillRect(x+16,y-13,5,26);};
  pm(1595,598,MOTORS.biru.col);pm(2190,828,MOTORS.hijau.col);
  // gerobak bakso
  g.fillStyle='#e9dfc8';g.strokeStyle=INK;g.lineWidth=3;g.fillRect(880,580,50,28);g.strokeRect(880,580,50,28);
  g.fillStyle=ALERT;g.beginPath();g.arc(905,594,22,0,7);g.fill();g.stroke();
  // terpal di samping warung
  g.fillStyle='rgba(28,34,48,.25)';g.beginPath();g.ellipse(1050,524,40,20,0,0,7);g.fill();
  g.fillStyle='#5f7fa8';g.strokeStyle=INK;g.lineWidth=3;g.beginPath();g.moveTo(1012,530);g.quadraticCurveTo(1020,494,1045,498);g.quadraticCurveTo(1074,492,1080,530);g.closePath();g.fill();g.stroke();
  g.strokeStyle='rgba(28,34,48,.35)';g.lineWidth=2;g.beginPath();g.moveTo(1030,502);g.lineTo(1026,528);g.moveTo(1058,500);g.lineTo(1064,528);g.stroke();
  // papan lintasan
  g.fillStyle=SUN;g.strokeStyle=INK;g.lineWidth=3;g.fillRect(TRACK.x0-96,TRACK.y-24,50,34);g.strokeRect(TRACK.x0-96,TRACK.y-24,50,34);
  g.fillStyle=INK;g.font='700 12px '+FU;g.fillText('INFO',TRACK.x0-71,TRACK.y-3);
  return c;
}

const TRIAL={state:'idle',data:[],t0:0};
const CINE={t:0,shot:false};
const traffic=[];
function hasInst(m){return S.evidence.some(e=>e.type==='meas'&&e.meta.kind==='inst'&&e.meta.atCam&&e.meta.motor===m);}

const INTS=[
  {id:'polisi',ch:'anto',t:TG.polisi,label:'Bicara dengan Pak Anto',act:talkAnto},
  {id:'djo',ch:'djo',t:TG.djo,label:'Bicara dengan Pak Djo',act:()=>{
    if(S.flags.alibi)say([['djo','E-eh, Detektif. Malam-malam masih kerja?','panik'],['djo','Di samping warung nggak ada apa-apa kok. Cuma terpal. Beneran.','panik']]);
    else say([['djo','Wah, Detektif! Soal motor ngebut? Aku lihat sendiri dari warung.'],['djo','Motor merah itu melesat pas di depan kamera. Mesinnya meraung, knalpotnya sampai panas banget.'],['djo','Pak Budi lain. Kencang di awal, tapi dekat kamera dia ngerem pelan-pelan.']],
      ()=>addEv({id:'w-djo',type:'witness',title:'Kesaksian Pak Djo',text:'Motor merah melesat di depan kamera, "knalpotnya sampai panas banget". Pak Budi kencang di awal lalu mengerem.'}));}},
  {id:'budi',ch:'budi',t:TG.budi,label:'Bicara dengan Pak Budi',act:()=>{
    if(S.flags.acc1)say([['budi','Makasih sudah bersihin namaku! Tapi kalau bukan Rudi, siapa yang bawa motor merah itu?','senyum']]);
    else say([['budi','Detektif! Saya memang telat ke pasar, jadi di awal agak kencang.','panik'],['budi','Tapi menjelang kamera saya sudah pelan. Mana berani ngebut di situ!','panik']],
      ()=>addEv({id:'w-budi',type:'witness',title:'Kesaksian Pak Budi',text:'Kencang di awal karena telat, sudah pelan menjelang kamera.'}));}},
  {id:'sari',ch:'sari',t:TG.sari,label:'Bicara dengan Bu Sari',act:()=>{
    if(S.flags.alibi)say([['sari','Tadi pagi ada yang nurunin kardus di depan lapakku. Helmnya ketutup rapat, buru-buru banget.'],['sari','Habis itu dia putar balik ke arah barat. Aneh, kan? Biasanya orang lanjut ke timur.']],
      ()=>addEv({id:'w-sari2',type:'witness',title:'Bu Sari: pengantar misterius',text:'Pengendara berhelm tertutup menurunkan kardus di depan pasar, lalu putar balik ke barat.'}));
    else say([['sari','Aku selalu pelan dan stabil ke pasar. Sekitar 50 km/jam, tiap hari sama.','senyum']],
      ()=>addEv({id:'w-sari',type:'witness',title:'Kesaksian Bu Sari',text:'Selalu stabil di sekitar 50 km/jam.'}));}},
  {id:'rudi',ch:'rudi',t:TG.rudi,label:'Bicara dengan Rudi',act:()=>{
    const f=S.flags;
    if(f.acc1&&!f.alibi){sfx.twist();say([['rudi','HAH?! 82 km/jam? Aku dari subuh di kolong mobil pelanggan. Tanya saja orangnya!','panik'],['rudi','Lho... motorku mana? Tadi pagi masih parkir di depan bengkel!','panik'],['rudi','Kunci cadangannya memang kugantung di pintu. Semua orang kampung tahu.']],
      ()=>{f.alibi=true;addEv({id:'alibi',type:'witness',title:'Alibi Rudi',text:'Rudi di bengkel sejak subuh, ada saksi. Motor merahnya hilang dari depan bengkel. Kunci cadangan tergantung di pintu.'});card('BAB 2','MOTOR HANTU');$('chap').textContent='Bab 2: Motor Hantu';});}
    else if(f.alibi)say([['rudi','Kalau ketemu motorku, kabari ya. Itu motor kesayangan.']]);
    else say([['rudi','Lagi sibuk, Detektif. Aku dari subuh di kolong mobil ini, belum keluar bengkel sama sekali.']],
      ()=>addEv({id:'w-rudi',type:'witness',title:'Kesaksian Rudi',text:'Mengaku di bengkel sejak subuh.'}));}},
  {id:'kamera',t:TG.kamera,label:'Periksa log Kamera Pasar',act:()=>say([['Kamera Pasar','Log 08:14:23. Terbaca 82 km/jam. Zona 60.'],['Kamera Pasar','Plat: AB 4?21 CD. Lensa berembun, satu angka hilang.'],['Kamera Pasar','Kamera mencatat kecepatan TEPAT saat motor menyentuh garis, 250 m dari Pos A. Bukan sebelum, bukan sesudah.']],
    ()=>addEv({id:'log',type:'doc',title:'Log Kamera Pasar',text:'08:14:23, 82 km/jam, zona 60. Plat buram. Yang dicatat: kecepatan tepat di garis 250 m.'}))},
  {id:'terminal',t:TG.terminal,label:'Buka terminal sensor',act:()=>{
    if(!S.flags.surat){say([['Terminal','Terkunci. Butuh Surat Tugas dari Pak Anto.']]);return;}
    openSensor();}},
  {id:'trial',t:TG.trial,label:'Baca papan Lintasan Uji',act:()=>say([['Lintasan Uji','Lari dari START ke FINIS. Grafik jarak terhadap waktu tergambar langsung dari larimu.'],['Lintasan Uji','Iseng saja: ngebut, pelan, berhenti, bahkan mundur. Lihat apa yang terjadi pada garisnya.']])},
  {id:'terpal',t:TG.terpal,label:'Periksa terpal',when:()=>S.flags.alibi&&!S.flags.motorFound,act:()=>{
    if(!S.flags.clueB){say([['Terpal','Cuma tumpukan terpal di samping warung. Belum ada alasan buat bongkar barang orang.']]);return;}
    sfx.twist();G.shake=.4;
    say([['Terpal','Kamu menyingkap terpalnya...'],['Terpal','MOTOR MERAH. Mesinnya masih hangat.'],['Terpal','Di joknya ada celemek bernoda kuah, bersulam huruf D.']],
      ()=>{S.flags.motorFound=true;addEv({id:'motor',type:'doc',title:'Motor merah ditemukan',text:'Tersembunyi di bawah terpal samping warung bakso, sekitar 110 m dari Pos A. Ada celemek berkuah bersulam huruf D.'});});}}
];
function talkAnto(){
  const f=S.flags;
  if(!f.case){
    say([['anto','Detektif {name}! Pas banget. Ada yang aneh pagi ini.'],
      ['anto','Kamera Pasar menjepret motor 82 km/jam di zona 60. Platnya buram, dan sistem langsung kirim tilang ke Pak Budi.'],
      ['anto','Pak Budi ngamuk. Tapi dari tiga motor yang lewat, dia yang sampai paling cepat. Mencurigakan, kan?','curiga'],
      ['anto','Sebelum pegang data, kamu butuh alat. Ke Lintasan Uji di barat daya, lari dari START ke FINIS. Grafik larimu sendiri jadi bahan latihan.']],
      ()=>{f.case=true;addEv({id:'surat',type:'doc',title:'Surat tilang Pak Budi',text:'Kamera Pasar: 82 km/jam di zona 60. Tilang dikirim ke Pak Budi karena ia tiba paling cepat.'});});
  }else if(!f.trialDone){
    say([['anto','Lari dulu di Lintasan Uji. Lalu tarik titik B sampai nempel ke titik A, dan simpan hasilnya.']]);
  }else if(!f.surat){
    say([['anto','Nah, kamu sudah pegang Lensa. Dua titik berjauhan: rata-rata. Dua titik menempel: kecepatan di SATU momen.','senyum'],
      ['anto','Ini Surat Tugas. Di Pos Jaga Sensor ada rekaman jarak tiga motor.'],
      ['anto','Ingat, kamera cuma peduli satu hal: secepat apa motor TEPAT di garisnya, 250 m dari Pos A.']],
      ()=>{f.surat=true;toast('Surat Tugas diterima');sfx.ev();});
  }else if(!f.acc1){
    say([['anto','Jadi, motor mana yang kena jepret?']],()=>openAccuse(1));
  }else if(!f.alibi){
    say([['anto','Motor merah itu punya Rudi. Jemput dia di bengkel.']]);
  }else if(!f.ext){
    say([['anto','Rudi punya alibi? Jadi motor merah itu jalan sendiri? Hantu?','curiga'],
      ['anto','Tunggu. Sensor jalan masih merekam setelah kamera. Kubuka REKAMAN LANJUTAN motor merah di terminal.'],
      ['anto','Lensamu ku-upgrade. Sekarang ia melukis jejak kemiringan, s′(t). Di atas nol: maju. Tepat nol: berhenti. Di bawah nol... cari tahu sendiri.'],
      ['anto','Temukan di mana motor itu berhenti, tandai di peta, lalu datangi tempatnya. Patok jarak di pinggir jalan akan membantumu.']],
      ()=>{f.ext=true;toast('Upgrade Lensa: Jejak Kemiringan');sfx.ev();});
  }else if(!f.motorFound){
    say([['anto','Motornya belum ketemu. Baca lagi rekamannya: di mana kurvanya datar?']]);
  }else{
    say([['anto','Motor ketemu? Jadi siapa pengendaranya?']],()=>openAccuse(2));
  }
}
function pinPos(){return S.pin?{x:sx(S.pin.s),y:ROAD.y+ROAD.h/2}:null;}
function dig(){
  const s=S.pin.s,f=S.flags;S.pin=null;
  if(Math.abs(s-STOP_S)<=14&&!f.clueA){
    S.pA=Math.max(30,150-40*S.digs);S.digs=0;
    say([['Temuan','Bekas ban mengerem keras di aspal. Lalu jejak putar balik.'],['Temuan','Ada noda kuah yang masih hangat. Dan sebuah sendok plastik.']],
      ()=>{f.clueA=true;addEv({id:'clueA',type:'doc',title:'Titik berhenti pertama (330 m)',text:'Bekas rem keras, jejak putar balik, noda kuah hangat, dan sendok plastik di depan pasar.'});});
  }else if(Math.abs(s-END_S)<=14&&!f.clueB){
    S.pB=Math.max(30,150-40*S.digs);S.digs=0;
    say([['Temuan','Jejak ban keluar dari jalan, masuk ke samping warung bakso.'],['Temuan','Jejaknya berakhir di balik sebuah terpal.']],
      ()=>{f.clueB=true;addEv({id:'clueB',type:'doc',title:'Titik akhir (110 m)',text:'Jejak ban meninggalkan jalan di sekitar 110 m dan berakhir di balik terpal samping warung bakso.'});});
  }else{
    S.digs++;sfx.bad();
    say([['Temuan','Nggak ada apa-apa di sini. Coba baca lagi kurvanya: di mana motor benar-benar berhenti?']]);
  }
}
function objective(){
  const f=S.flags;
  if(!f.case)return{t:'Temui Pak Anto di Pos Polisi.',p:TG.polisi};
  if(!f.trialDone)return{t:'Lari di Lintasan Uji, lalu tempelkan titik B ke titik A dan simpan.',p:TG.trial};
  if(!f.surat)return{t:'Kembali ke Pak Anto.',p:TG.polisi};
  if(!f.acc1){
    if(!hasInst('merah')||!hasInst('biru'))return{t:'Di Pos Jaga Sensor, ukur kecepatan sesaat tiap motor tepat di garis kamera. Warga juga punya cerita.',p:TG.terminal};
    return{t:'Laporkan ke Pak Anto: motor mana yang kena jepret?',p:TG.polisi};
  }
  if(!f.alibi)return{t:'Jemput Rudi, pemilik motor merah, di bengkelnya.',p:TG.rudi};
  if(!f.ext)return{t:'Rudi punya alibi. Lapor ke Pak Anto.',p:TG.polisi};
  if(!f.clueA||!f.clueB){
    if(S.pin)return{t:'Datangi pin di jalan dan selidiki.',p:pinPos()};
    return{t:(f.clueA||f.clueB)?'Satu jejak ketemu. Masih ada satu titik berhenti lagi di rekaman.':'Buka rekaman lanjutan motor merah. Di mana ia berhenti? Tandai di peta.',p:TG.terminal};
  }
  if(!f.motorFound)return{t:'Jejak ban berakhir di balik terpal samping warung.',p:TG.terpal};
  return{t:'Kamu tahu pelakunya. Temui Pak Anto.',p:TG.polisi};
}
function stageHint(){
  const f=S.flags;
  if(!f.trialDone)return['trial','Tarik titik B sampai menempel di titik A. Saat terkunci, garis potong berubah jadi garis singgung.'];
  if(!hasInst('merah')||!hasInst('biru'))return['sensor','Geser titik A sampai tepat di garis putus-putus merah (250 m), lalu simpan. Ulangi untuk tiap motor.'];
  if(!f.acc1)return['acc1','Kamera tidak peduli rata-rata. Motor mana yang garis singgungnya 82 km/jam di garis kamera?'];
  if(!f.ext)return['mid','Ikuti panah kuning di tepi layar.'];
  if(!f.clueA)return['extA','Cari bagian kurva yang datar. Datar berarti kemiringan nol: motor berhenti. Tandai, lalu datangi.'];
  if(!f.clueB)return['extB','Kurva yang menurun berarti motor bergerak balik ke arah Pos A. Di s berapa kurva berakhir datar?'];
  return['final','Motor ditemukan di samping warung siapa? Dan siapa yang tahu knalpotnya panas?'];
}
function openSensor(){
  if(S.flags.ext&&!S.flags.motorFound){
    gpOpen({src:'ext',title:'Rekaman lanjutan: motor merah',series:{merah:{name:'Motor merah',col:MOTORS.merah.col,pts:MOTORS.merah.ext,tc:0}},cur:'merah',Tmax:70,Smax:350,camS:CAM_S,gmin:-60,gmax:100,startLocked:true,
      tip:'Seret titik A menyusuri kurva. Jejak kemiringan terlukis di bawah. Di titik berhenti, tekan Tandai di peta.'});return;
  }
  const ser={};for(const k in MOTORS)ser[k]={name:MOTORS[k].name,col:MOTORS[k].col,pts:MOTORS[k].pts,tc:MOTORS[k].tc};
  gpOpen({src:'sensor',title:'Terminal Sensor Jalan',series:ser,cur:'biru',Tmax:20,Smax:300,camS:CAM_S,gmin:0,gmax:100,startLocked:!!S.flags.sensorSeen,
    tip:'Bandingkan: rata-rata dari Pos A (titik berjauhan) dengan kecepatan tepat di garis kamera (titik menempel).'});
  S.flags.sensorSeen=true;
}
function openTrial(){
  const pts=TRIAL.data.slice(),te=pts[pts.length-1][0];
  gpOpen({src:'trial',title:'Grafik larimu',series:{run:{name:'Larimu',col:'#c25a1c',pts,kind:'run'}},cur:'run',Tmax:Math.max(4,Math.ceil(te)),Smax:20,camS:null,gmin:-25,gmax:25,startLocked:false,
    tip:'Titik A dan B berjauhan memberi rata-rata. Tarik B mendekati A dan lihat apa yang terjadi.'});
}
const ACQ={
  1:{title:'Laporan pertama',q:'Motor mana yang melaju 82 km/jam di garis kamera?',
    who:[['merah','Motor merah'],['biru','Motor biru (Pak Budi)'],['hijau','Motor hijau (Bu Sari)']],
    why:[['ok','Kamera membaca kecepatan sesaat. Di garis kamera, hanya garis singgung motor merah yang 82 km/jam.'],['avg','Motor biru punya rata-rata tertinggi, jadi pasti dia.'],['early','Motor merah paling kencang sejak awal perjalanan.'],['plat','Platnya buram, mustahil diketahui.']],ans:'merah'},
  2:{title:'Tuduhan akhir',q:'Siapa yang mengendarai motor merah pagi itu?',
    who:[['rudi','Rudi'],['budi','Pak Budi'],['sari','Bu Sari'],['djo','Pak Djo']],
    why:[['own','Rudi pemiliknya, jadi pasti dia pengendaranya.'],['ok','Kurva berakhir datar di 110 m: motor disembunyikan di samping warung bakso, lengkap dengan celemek berkuah.'],['pasar','Kemiringan nol di 330 m: motor berhenti di pasar, jadi pelakunya orang pasar.'],['avg','Yang rata-ratanya paling tinggi pasti pelakunya.']],ans:'djo'}
};
function finale(){
  sfx.win();
  say([['anto','Pak Djo. Celemek ini punya Bapak?','curiga'],
    ['djo','...Iya. Maaf. Gerobakku mogok, padahal ada pesanan 40 porsi buat arisan pasar jam 08.15.','panik'],
    ['djo','Kunci cadangan Rudi nggantung di pintu. Niatnya pinjam sebentar. Eh, malah kejepret kamera.','panik'],
    ['rudi','Pantes Bapak tahu knalpotnya panas. Bapak sendiri yang naik!','curiga'],
    ['budi','Jadi tilangku batal, kan?'],
    ['anto','Batal. Pak Djo yang bayar denda. Plus bakso gratis sekampung.','senyum'],
    ['anto','Kerja bagus, Detektif {name}. Rata-rata bisa menipu. Kemiringan di satu titik tidak.','senyum']],endCase);
}

function activeExtra(){const p=pinPos();return p?[{id:'pin',t:p,label:'Selidiki titik ini',act:dig}]:[];}
function wrongMsg(n,A){
  if(n===1){
    if(A.who!=='merah'){const ev=S.evidence.find(e=>e.type==='meas'&&e.meta.kind==='inst'&&e.meta.atCam&&e.meta.motor===A.who);
      return 'Pak Anto: "'+(ev?'Ukuranmu sendiri bilang motor itu '+f0(ev.meta.kmh)+' km/jam di garis kamera.':'Kamu belum mengukur motor itu di garis kamera.')+' Kamera mencatat 82." (-100)';}
    return 'Pak Anto: "Motornya masuk akal, tapi buktimu belum tepat. Apa yang sebenarnya diukur kamera?" (-100)';
  }
  if(A.who==='rudi')return 'Pak Anto: "Rudi punya saksi, dia di bengkel sejak subuh." (-100)';
  if(A.who!=='djo')return 'Pak Anto: "Lalu kenapa motornya ada di balik terpal samping warung bakso?" (-100)';
  return 'Pak Anto: "Orangnya mungkin benar, tapi bukti kuncinya bukan itu." (-100)';
}
function onAccuseOk(n){
  if(n===1){S.flags.acc1=true;sfx.ev();say([['anto','Garis singgungnya tidak bohong. Pak Budi cuma 55 km/jam di kamera. Tilangnya salah alamat!','senyum'],['anto','Berarti motor merah. Itu punya Rudi. Jemput dia di bengkel.']]);}
  else finale();
}
function onLensSave(i,GP){
  if(GP.src==='trial'){
    if(i.kind!=='inst'){toast('Tempelkan dulu titik B ke titik A sampai terkunci');return 'stay';}
    S.flags.trialDone=true;addEv({id:'trial',type:'meas',title:'Latihan Lensa',text:'Di t = '+f1(i.t)+' dtk kecepatan larimu '+f1(i.m)+' m/s. Garis potong yang menyempit menjadi garis singgung.',meta:{kind:'trial'}});
    GP.tip='Tersimpan. Tutup, lalu kembali ke Pak Anto.';return 'tip';
  }
  const mid=GP.cur,mo=MOTORS[mid];
  if(i.kind==='inst')addEv({id:'inst-'+mid+(i.atCam?'-cam':'-x'),type:'meas',title:mo.name+': kecepatan sesaat',text:'Garis singgung di s = '+f1(i.s)+' m ('+(i.atCam?'tepat di garis kamera':'bukan di garis kamera')+'): '+f0(i.m*3.6)+' km/jam.',meta:{kind:'inst',motor:mid,atCam:i.atCam,kmh:i.m*3.6}});
  else addEv({id:'avg-'+mid+(i.fromStart?'-ruas':'-x'),type:'meas',title:mo.name+': kecepatan rata-rata',text:(i.fromStart?'Dari Pos A sampai garis kamera: ':'Antara t = '+f1(i.t1)+' dan '+f1(i.t2)+' dtk: ')+f0(i.m*3.6)+' km/jam.',meta:{kind:'avg',motor:mid,fromStart:i.fromStart,kmh:i.m*3.6}});
  return 'saved';
}
function suspects(chip){
  const f=S.flags;
  if(f.case){chip('Pak Budi',f.acc1?'x':'hot');}
  if(f.acc1){chip('Rudi',f.alibi?'x':'hot');}
  if(f.alibi){chip('Pengendara misterius','hot');}
}
function score(el){
  const sub=[];let acc=0;
  for(const k of ['merah','biru','hijau']){
    const evs=S.evidence.filter(e=>e.type==='meas'&&e.meta.kind==='inst'&&e.meta.atCam&&e.meta.motor===k),tru=MOTORS[k].vInst*3.6;
    if(!evs.length){sub.push([MOTORS[k].name+': belum diukur',0]);continue;}
    const err=Math.min(...evs.map(e=>Math.abs(e.meta.kmh-tru))),p=Math.round(100*clamp(1-(err-2)/13,0,1));acc+=p;
    sub.push([MOTORS[k].name+': selisih '+f1(err)+' km/jam',p]);
  }
  const detail={detik:el,akurasi:{},pA:S.pA,pB:S.pB,petunjuk:S.hints,salah:S.wrong,digs:S.digs};
  for(const k of ['merah','biru','hijau']){const e2=S.evidence.filter(e=>e.type==='meas'&&e.meta.kind==='inst'&&e.meta.atCam&&e.meta.motor===k);detail.akurasi[k]=e2.length?+Math.min(...e2.map(e=>Math.abs(e.meta.kmh-MOTORS[k].vInst*3.6))).toFixed(2):null;}
  detail.rataBiru=S.evidence.some(e=>e.type==='meas'&&e.meta.kind==='avg'&&e.meta.motor==='biru');
  const items=[['Ketepatan ukur di kamera (maks 300)',acc,sub],['Membaca grafik: dua titik berhenti (maks 300)',S.pA+S.pB],['Penalaran: dua tuduhan benar (maks 400)',400],['Petunjuk ('+S.hints+')',-60*S.hints],['Salah tuduh ('+S.wrong+')',-100*S.wrong]];
  return {items,detail};
}
function learn(){return [
  'Dua titik berjauhan memberi rata-rata: <code>Δs/Δt</code>. Motor biru rata-rata '+f0(MOTORS.biru.vAvg*3.6)+' km/jam, tapi di kamera cuma '+f0(MOTORS.biru.vInst*3.6)+'.',
  'Saat dua titik itu menempel, kamu dapat turunan: <code>s′(t) = ds/dt</code>. Motor merah '+f0(MOTORS.merah.vInst*3.6)+' km/jam tepat di garis.',
  'Tanda turunan bercerita: <code>s′ &gt; 0</code> maju, <code>s′ = 0</code> berhenti, <code>s′ &lt; 0</code> balik arah. Begitulah kamu menemukan motornya.'
];}

function tick(dt){for(const v of traffic){v.x+=v.sp*dt;if(v.sp>0&&v.x>WW+120)v.x=-120;if(v.sp<0&&v.x<-120)v.x=WW+120;}}
function night(){return S.flags.ext?.78:S.flags.alibi?.6:0;}
function cineStep(dt){
  let fx,fy;CINE.t+=dt;
  if(CINE.t<3){fx=CAMX-60;fy=ROAD.y+20;}else{fx=TG.budi.x;fy=TG.budi.y-40;}
  if(!CINE.shot&&CINE.t>=1.25){CINE.shot=true;G.flash=1;sfx.shot();}
  if(CINE.t>5.4)endCine();
  return [fx,fy];
}
function afterMove(dt){
  // lintasan uji: boleh pelan, berhenti, bahkan mundur
  const inLane=Math.abs(P.y-TRACK.y)<TRACK.h/2,sM=(P.x-TRACK.x0)/PXM;
  if(TRIAL.state==='idle'){
    if(inLane&&P.x>=TRACK.x0&&P.x<TRACK.x0+50&&P.vx>20){TRIAL.state='run';TRIAL.t0=G.T;TRIAL.data=[[0,Math.max(0,sM)]];}
  }else if(TRIAL.state==='run'){
    const t=G.T-TRIAL.t0;
    if(!inLane||P.x<TRACK.x0-14||t>40){TRIAL.state='idle';toast('Keluar jalur. Ulangi dari garis START.');}
    else{
      TRIAL.data.push([t,clamp(sM,0,20)]);
      if(P.x>=TRACK.x1){TRIAL.state='done';sfx.ev();
        setTimeout(()=>{if(S.ui==='none'){K.u=K.d=K.l=K.r=false;T.x=T.y=0;openTrial();}TRIAL.state='idle';},600);}
    }
  }
}
function begin(){
  P.x=TG.polisi.x+70;P.y=TG.polisi.y+14;S.ui='cine';CINE.t=0;CINE.shot=false;
  return [CAMX-60,ROAD.y+20];
}
function init(){
  const R=rngSeed(5),cols=['#f4efe1','#d9a441','#8aa05a','#9a8fc2','#6f7b8c'];
  for(let i=0;i<7;i++)traffic.push({x:R()*WW,y:i%2?ROAD.y+105:ROAD.y+35,sp:(i%2?-1:1)*(70+R()*110),col:cols[i%cols.length],k:i%3===2?'motor':'mobil'});
}
function drawWorld(ctx){
  for(const v of traffic){
    ctx.save();ctx.translate(v.x,v.y);if(v.sp<0)ctx.scale(-1,1);
    ctx.fillStyle='rgba(28,34,48,.25)';ctx.fillRect(-34,-10,76,30);ctx.fillStyle=v.col;ctx.strokeStyle=INK;ctx.lineWidth=3;
    if(v.k==='motor'){ctx.fillRect(-18,-5,36,10);ctx.strokeRect(-18,-5,36,10);ctx.fillStyle=INK;ctx.fillRect(12,-11,4,22);}
    else{ctx.fillRect(-34,-15,68,30);ctx.strokeRect(-34,-15,68,30);ctx.fillStyle='#bfe3f2';ctx.fillRect(-4,-11,20,22);ctx.strokeRect(-4,-11,20,22);}
    ctx.restore();
  }
  // motor misterius di adegan pembuka
  if(S.ui==='cine'&&CINE.t>.5&&CINE.t<2){
    const x=CAMX-1100+(CINE.t-.5)*1470,y=ROAD.y+38;
    ctx.fillStyle='rgba(20,22,34,.9)';ctx.fillRect(x-26,y-8,52,16);ctx.fillRect(x+14,y-14,6,28);
    ctx.strokeStyle='rgba(255,246,228,.7)';ctx.lineWidth=3;for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(x-40-i*26,y-12+i*8);ctx.lineTo(x-110-i*40,y-12+i*8);ctx.stroke();}
  }
}
function drawWorldTop(ctx){
  if(S.ui==='cine'&&CINE.t>3.5){const b=TG.budi;ctx.save();ctx.translate(b.x,b.y-74);ctx.rotate(Math.sin(G.T*24)*.04);E.plate('BUKAN SAYA!!',-86,-22,172,40,'800 20px '+FD,'#fff');ctx.restore();}
}
function drawCine(ctx){
  const {W,H,hs}=V;
    ctx.fillStyle=INK;ctx.fillRect(0,0,W,H*.11);ctx.fillRect(0,H*.89,W,H*.11);
    if(CINE.t>1.3&&CINE.t<3.2){
      ctx.textAlign='center';ctx.lineJoin='round';ctx.font='800 '+Math.round(64*hs)+'px '+FD;ctx.lineWidth=10;ctx.strokeStyle=INK;ctx.strokeText('CEKREK!',W/2,H*.4);ctx.fillStyle=SUN;ctx.fillText('CEKREK!',W/2,H*.4);
      ctx.font='700 '+Math.round(22*hs)+'px '+FU;ctx.lineWidth=6;ctx.strokeText('82 km/jam di zona 60',W/2,H*.4+38*hs);ctx.fillStyle=PAPER;ctx.fillText('82 km/jam di zona 60',W/2,H*.4+38*hs);
    }
    ctx.fillStyle=PAPER;ctx.font='600 '+Math.round(12*hs)+'px '+FU;ctx.textAlign='right';ctx.fillText(G.coarse?'ketuk untuk lewati':'tekan E untuk lewati',W-14,H*.89+20*hs);
}
function drawHud(ctx){
  const {W,H,hs}=V;
    if(TRIAL.state==='run'&&TRIAL.data.length>1){
      const d=TRIAL.data,w=230*hs,h=120*hs,x=(W-w)/2,y=H-h-(G.coarse?16:26)*hs,tm=Math.max(4,d[d.length-1][0]);
      ctx.fillStyle=INK;ctx.fillRect(x+3,y+3,w,h);ctx.fillStyle=PAPER;ctx.strokeStyle=INK;ctx.lineWidth=3;ctx.fillRect(x,y,w,h);ctx.strokeRect(x,y,w,h);
      const px=t=>x+26*hs+(t/tm)*(w-36*hs),py=s=>y+h-18*hs-(s/20)*(h-40*hs);
      ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(px(0),py(20));ctx.lineTo(px(0),py(0));ctx.lineTo(px(tm),py(0));ctx.stroke();
      ctx.strokeStyle='#c25a1c';ctx.lineWidth=3.5;ctx.lineJoin='round';ctx.beginPath();for(let i=0;i<d.length;i+=2){const X=px(d[i][0]),Y=py(d[i][1]);if(i)ctx.lineTo(X,Y);else ctx.moveTo(X,Y);}ctx.stroke();
      const l=d[d.length-1];ctx.fillStyle=SUN;ctx.strokeStyle=INK;ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(px(l[0]),py(l[1]),5,0,7);ctx.fill();ctx.stroke();
      ctx.fillStyle=INK;ctx.textAlign='left';ctx.font='700 '+(11*hs)+'px '+FU;ctx.fillText('s (m)',x+6*hs,y+14*hs);ctx.textAlign='right';ctx.fillText(f1(l[0])+' dtk, '+f1(l[1])+' m',x+w-8*hs,y+14*hs);
    }
}
function jitter(it){return(it.ch==='djo'&&S.flags.alibi)?Math.sin(G.T*30)*1.2:0;}
function cineEnd(){card('BAB 1','SURAT TILANG');}

return {
  id:'tilang-1',judul:'Tilang Salah Alamat',eyebrow:'Semesta 1, Jalan Raya. Kasus 1',
  lede:'08.14 pagi. Kamera Pasar menjepret motor 82 km/jam. Platnya buram. Satu kampung saling tuduh, dan tidak ada yang seperti kelihatannya.',
  teaser:'<b>Tengah malam.</b> Kamera Pasar menyala lagi. Tidak ada motor yang lewat. Yang terekam: sesuatu melayang di atas pasar. <b>Kasus 2 segera.</b>',
  chapter:'Bab 1: Surat Tilang',
  WW,WH,SOLIDS,LAMPS,CH,TG,MOTORS,TRIAL,sx,
  ints:INTS,extraInts:activeExtra,buildWorld,objective,stageHint,pinPos,
  ACQ,wrongMsg,onAccuseOk,onLensSave,suspects,score,learn,
  tick,night,cineStep,afterMove,begin,init,cineEnd,drawWorld,drawWorldTop,drawCine,drawHud,jitter
};
}
