/* Semesta 2 (Lemparan), Kasus 1: Benda di Atas Pasar.
   Ide turunan: puncak = kemiringan nol, penjumlahan/pengurangan turunan, garis lurus berkemiringan tetap. */
export default function create(E){
const {S,P,G,V,$,clamp,f0,f1,rngSeed,INK,PAPER,SUN,CORAL,ALERT,BLUE,GOOD,FD,FU,say,toast,addEv,card,sfx,openAccuse,gpOpen,endCine,endCase}=E;

/* ---------- data fisika (angka bulat supaya mudah diperiksa) ---------- */
const GR=9.8,VX=8,LAND=24,TL=3.0;           // jatuh di t=3,0 dtk, 24 m dari titik lempar
const V0={joko:14.7,dimas:17.15,rini:12.25}; // kecepatan awal ke atas (m/s)
const APEX={rek:1.5,joko:1.5,dimas:1.75,rini:1.25};
const hF=v=>t=>Math.max(0,v*t-0.5*GR*t*t);
const sample=(f,T)=>{const a=[];for(let t=0;t<=T+1e-9;t+=0.05)a.push([t,f(t)]);return a;};
const TM=3.6;
const SER={
  rek:{name:'Rekaman kamera',col:'#7c4dbd',pts:sample(hF(V0.joko),TM),kind:'ball',snap:[1.5,3.0]},
  joko:{name:'Lempar Joko',col:'#2f7fc1',pts:sample(hF(V0.joko),TM),kind:'ball',snap:[1.5]},
  dimas:{name:'Lempar Dimas',col:'#2f9e5b',pts:sample(hF(V0.dimas),TM),kind:'ball',snap:[1.75]},
  rini:{name:'Lempar Bu Rini',col:'#e8553d',pts:sample(hF(V0.rini),TM),kind:'ball',snap:[1.25]}
};
const PARTS={
  tot:{name:'Lemparan Joko',col:'#2f7fc1',pts:sample(hF(V0.joko),TM),kind:'ball'},
  push:{name:'Dorongan 14,7·t',col:'#2f9e5b',pts:sample(t=>V0.joko*t,TM),kind:'ball'},
  drop:{name:'Penurunan 4,9·t²',col:'#e8553d',pts:sample(t=>0.5*GR*t*t,TM),kind:'ball'}
};
const RANGE={
  x:{name:'Jarak mendatar x(t)',col:'#c25a1c',pts:sample(t=>VX*t,TM),kind:'ball',sym:'x',ylab:'x (meter dari titik lempar)'},
  h:{name:'Tinggi h(t)',col:'#7c4dbd',pts:sample(hF(V0.joko),TM),kind:'ball',snap:[1.5,3.0]}
};

const CH={
  anto:{n:'Pak Anto',body:'#c9b27a',cap:'#4a6fa5'},
  joko:{n:'Joko',body:'#7a8fc2',cap:'#1c2230'},
  rini:{n:'Bu Rini',body:'#d98c5f',cap:'#e8553d'},
  dimas:{n:'Dimas',body:'#2f9e5b',cap:'#f4efe1'}
};

/* ---------- dunia ---------- */
const WW=2200,WH=1300,PXM=40,JX=400,JY=700,sx=s=>JX+s*PXM;
const LANE={y:JY,h:120};
const BUILD=[
  {x:90,y:330,w:270,h:170,roof:'#4a6fa5',name:'POS SATPAM',door:'s'},
  {x:620,y:330,w:300,h:150,roof:'#d9a441',name:'LOS PASAR',door:'s'},
  {x:1080,y:330,w:260,h:150,roof:'#8aa05a',name:'GUDANG',door:'s'},
  {x:1650,y:340,w:300,h:160,roof:'#6f7b8c',name:'KIOS KELONTONG',door:'s'},
  {x:700,y:930,w:300,h:150,roof:'#e8553d',name:'WARUNG SOTO',door:'n'},
  {x:1500,y:930,w:300,h:150,roof:'#7a5a3a',name:'LAPAK IKAN',door:'n'}
];
const TG={anto:{x:230,y:560},joko:{x:JX,y:JY},rini:{x:1475,y:668},dimas:{x:1000,y:1030},rekaman:{x:830,y:640},gerobak:{x:sx(LAND),y:630}};
const SOLIDS=BUILD.map(b=>({x:b.x,y:b.y,w:b.w,h:b.h}));
const LAMPS=[];for(let x=140;x<WW;x+=300)LAMPS.push({x,y:LANE.y-84});
let TREES=[];

function buildWorld(){
  const c=document.createElement('canvas');c.width=WW;c.height=WH;const g=c.getContext('2d');
  const R=rngSeed(23);
  g.fillStyle='#6fae58';g.fillRect(0,0,WW,WH);
  for(let i=0;i<120;i++){g.fillStyle=R()<.5?'#7dbd62':'#68a652';g.beginPath();g.ellipse(R()*WW,R()*WH,30+R()*70,18+R()*40,0,0,7);g.fill();}
  // jalan setapak ke pintu
  g.fillStyle='#d6b98a';
  for(const b of BUILD){const dx=b.x+b.w/2-18;if(b.door==='s')g.fillRect(dx,b.y+b.h,36,LANE.y-60-(b.y+b.h));else g.fillRect(dx,LANE.y+LANE.h-60,36,b.y-(LANE.y+LANE.h-60));}
  // pelataran pasar (jalur lempar)
  g.fillStyle='#b9ad94';g.fillRect(60,LANE.y-60,WW-120,LANE.h+0);
  g.strokeStyle='rgba(28,34,48,.18)';g.lineWidth=2;
  for(let x=60;x<WW-60;x+=60){g.beginPath();g.moveTo(x,LANE.y-60);g.lineTo(x,LANE.y+60);g.stroke();}
  g.beginPath();g.moveTo(60,LANE.y);g.lineTo(WW-60,LANE.y);g.stroke();
  // patok jarak tiap 4 m
  g.font='700 13px '+FU;g.textAlign='center';
  for(let s=0;s<=28;s+=4){const x=sx(s);
    g.fillStyle=PAPER;g.strokeStyle=INK;g.lineWidth=3;g.fillRect(x-22,LANE.y+66,44,22);g.strokeRect(x-22,LANE.y+66,44,22);
    g.fillStyle=INK;g.fillText(s+' m',x,LANE.y+82);g.fillRect(x-1,LANE.y+50,2,16);}
  // titik lempar
  g.fillStyle=SUN;g.strokeStyle=INK;g.lineWidth=4;g.beginPath();g.arc(JX,JY,26,0,7);g.fill();g.stroke();
  g.fillStyle=INK;g.font='800 13px '+FD;g.fillText('TITIK',JX,JY-2);g.fillText('LEMPAR',JX,JY+12);
  // lapangan voli kecil (Dimas)
  g.fillStyle='#c78f54';g.strokeStyle=INK;g.lineWidth=4;g.fillRect(850,960,300,180);g.strokeRect(850,960,300,180);
  g.strokeStyle=PAPER;g.lineWidth=3;g.strokeRect(865,975,270,150);g.beginPath();g.moveTo(1000,975);g.lineTo(1000,1125);g.stroke();
  g.fillStyle=INK;g.font='800 15px '+FD;g.fillText('LAPANGAN',1000,1160);
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
  // tiang kamera
  const cx=TG.rekaman.x,cy=TG.rekaman.y;
  g.fillStyle='#262a36';g.strokeStyle=INK;g.lineWidth=3;g.fillRect(cx-5,cy-70,10,70);g.strokeRect(cx-5,cy-70,10,70);
  g.fillStyle=ALERT;g.fillRect(cx-20,cy-98,40,28);g.strokeRect(cx-20,cy-98,40,28);
  g.fillStyle='#262a36';g.beginPath();g.arc(cx,cy-84,7,0,7);g.fill();
  g.font='700 12px '+FU;g.fillStyle=INK;g.fillText('KAMERA PASAR',cx,cy-106);
  // gerobak Bu Rini (di 24 m)
  const gx=sx(LAND),gy=600;
  g.fillStyle='rgba(28,34,48,.25)';g.fillRect(gx-34,gy+6,76,34);
  g.fillStyle='#e9dfc8';g.strokeStyle=INK;g.lineWidth=3;g.fillRect(gx-36,gy-8,72,36);g.strokeRect(gx-36,gy-8,72,36);
  g.fillStyle=CORAL;g.fillRect(gx-36,gy-22,72,16);g.strokeRect(gx-36,gy-22,72,16);
  g.fillStyle=INK;g.font='800 12px '+FD;g.fillText('SOTO RINI',gx,gy+14);
  // pohon
  const keep=[...BUILD.map(b=>[b.x-50,b.y-50,b.w+100,b.h+100]),[0,LANE.y-110,WW,LANE.h+170],[820,940,360,230]];
  const pts=Object.values(TG);TREES=[];
  for(let i=0;i<160&&TREES.length<40;i++){
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
  // lampu
  for(const l of LAMPS){g.fillStyle='#262a36';g.fillRect(l.x-2,l.y-6,4,30);g.fillStyle=SUN;g.strokeStyle=INK;g.lineWidth=2;g.beginPath();g.arc(l.x,l.y-8,6,0,7);g.fill();g.stroke();}
  return c;
}

/* ---------- keadaan kasus ---------- */
const CINE={t:0};
const hasApex=w=>S.evidence.some(e=>e.type==='meas'&&e.meta.kind==='apex'&&e.meta.who===w);
const apexOK=()=>hasApex('rek')&&hasApex('joko')&&hasApex('dimas');
const partsDone=()=>['tot','push','drop'].every(k=>S.evidence.some(e=>e.meta&&e.meta.kind==='part'&&e.meta.cur===k));

const INTS=[
  {id:'anto',ch:'anto',t:TG.anto,label:'Bicara dengan Pak Anto',act:talkAnto},
  {id:'joko',ch:'joko',t:TG.joko,label:'Bicara dengan Joko',act:()=>{
    const f=S.flags;
    if(f.acc1&&!f.twist){sfx.twist();
      say([['joko','...Iya, itu aku yang lempar. Tapi aku cuma disuruh, Detektif!','panik'],['joko','Ada orang kasih bungkusan ke aku jam sebelas malam. Katanya, lempar ke arah timur dari titik ini, jangan lewat jalan.','panik'],['joko','Aku nggak lihat jatuhnya. Gelap. Dia janji upah, dan dia tahu aku dulu atlet lempar lembing.']],
        ()=>{f.twist=true;addEv({id:'w-joko2',type:'witness',title:'Pengakuan Joko',text:'Joko melempar bungkusan ke timur atas suruhan seseorang. Ia tidak melihat di mana bungkusan itu jatuh.'});card('BAB 2','KE MANA DIA MENDARAT');$('chap').textContent='Bab 2: Titik Jatuh';});}
    else if(f.twist)say([['joko','Tolong cari bungkusan itu. Aku nggak mau jadi tersangka.']]);
    else say([['joko','Aku? Malam itu cuma jaga parkir. Nggak lempar apa-apa.','panik'],['joko','Eh, aku memang dulu atlet lempar lembing. Tapi itu dulu.']],
      ()=>addEv({id:'w-joko',type:'witness',title:'Kesaksian Joko',text:'Mengaku jaga parkir, tidak melempar apa-apa. Mantan atlet lempar lembing.'}));}},
  {id:'rini',ch:'rini',t:TG.rini,label:'Bicara dengan Bu Rini',act:()=>{
    if(S.flags.boxFound)say([['rini','Itu... itu bukan punyaku. Aku nggak tahu apa-apa!','panik']]);
    else say([['rini','Aku jualan soto sampai larut. Pas kamera merekam, aku lagi layani pembeli.','senyum'],['rini','Lempar-lemparan? Ah, tanganku cuma kuat angkat panci.']],
      ()=>addEv({id:'w-rini',type:'witness',title:'Kesaksian Bu Rini',text:'Mengaku melayani pembeli saat kejadian. "Tanganku cuma kuat angkat panci."'}));}},
  {id:'dimas',ch:'dimas',t:TG.dimas,label:'Bicara dengan Dimas',act:()=>say([['dimas','Detektif! Aku pemegang rekor lempar di sekolah, tahu. Bola voli, lembing, apa saja, melambung tinggi.','senyum'],['dimas','Tapi malam itu aku tidur. Tanya saja ibuku.']],
    ()=>addEv({id:'w-dimas',type:'witness',title:'Kesaksian Dimas',text:'Pemegang rekor lempar sekolah. Mengaku tidur di rumah malam itu.'}))},
  {id:'rekaman',t:TG.rekaman,label:'Buka terminal rekaman',act:()=>{
    if(!S.flags.case){say([['Terminal','Terkunci. Butuh izin Pak Anto.']]);return;}
    openRekaman();}},
  {id:'gerobak',t:TG.gerobak,label:'Periksa gerobak soto',icon:'?',when:()=>S.flags.clueLand&&!S.flags.boxFound,act:()=>{
    sfx.twist();G.shake=.4;
    say([['Gerobak','Kamu membuka laci di bawah gerobak...'],['Gerobak','Sebuah kotak amal pasar, tutupnya penyok kena benturan.'],['Gerobak','Di tutupnya, goresan huruf R. Masih ada pecahan lakban dari bungkusan tadi.']],
      ()=>{S.flags.boxFound=true;addEv({id:'kotak',type:'doc',title:'Kotak amal ditemukan',text:'Kotak amal pasar tersembunyi di laci gerobak Bu Rini, tepat 24 m dari titik lempar. Tutupnya bergores huruf R dan ada pecahan lakban.'});});}}
];

function talkAnto(){
  const f=S.flags;
  if(!f.case){
    say([['anto','Detektif {name}. Tengah malam begini, Kamera Pasar merekam sesuatu yang aneh.'],
      ['anto','Benda bercahaya muncul dari balik atap, naik, lalu seperti DIAM di udara sebentar, lalu menghilang. Warga bilang pasar kita dihantui.','curiga'],
      ['anto','Menurutku itu bukan hantu. Benda yang dilempar punya jejak yang bisa dibaca. Kuberi akses terminal rekaman di tiang kamera.'],
      ['anto','Di sana ada rekaman ketinggian benda, plus tiga lemparan uji dari warga yang bisa melempar sejauh itu: Joko, Dimas, dan Bu Rini. Cari yang cocok.']],
      ()=>{f.case=true;addEv({id:'rekaman',type:'doc',title:'Laporan benda melayang',text:'Kamera Pasar merekam benda bercahaya naik dari balik atap, tampak diam sebentar di puncak, lalu hilang. Tersedia rekaman dan lemparan uji tiga warga.'});});
  }else if(!apexOK()){
    say([['anto','Buka terminal di tiang kamera. Tarik titik B menempel ke A, lalu cari saat garis singgung datar. Itu puncaknya. Periksa rekaman, lemparan Joko, dan lemparan Dimas.']]);
  }else if(!f.acc1){
    say([['anto','Sudah kamu bandingkan puncaknya? Lemparan siapa yang cocok dengan rekaman?']],()=>openAccuse(1));
  }else if(!f.twist){
    say([['anto','Temui Joko. Dia punya banyak penjelasan yang harus ia beri.']]);
  }else if(!f.partsAsk){
    say([['anto','Joko cuma suruhan. Dalangnya pasti tahu dia jago lempar. Kita harus tahu di mana bungkusan itu jatuh.','curiga'],
      ['anto','Sebelum itu, bedah dulu lemparan Joko. Lemparan itu gabungan dua hal: dorongan naik, dikurangi penurunan karena gravitasi.'],
      ['anto','Di terminal ada tiga grafik: lemparan, dorongan, dan penurunan. Kunci titik A di waktu yang sama pada ketiganya, bandingkan kemiringannya. Ada pola yang akan kamu lihat.']],
      ()=>{f.partsAsk=true;toast('Terminal: grafik Dorongan dan Penurunan');sfx.ev();});
  }else if(!f.parts){
    say([['anto','Kunci titik A di waktu yang sama (jangan di awal) pada ketiga grafik, lalu simpan masing-masing. Bandingkan angka kemiringannya.']]);
  }else if(!f.rangeAsk){
    say([['anto','Kemiringan lemparan memang gabungan kemiringan penyusunnya. Bagus.','senyum'],
      ['anto','Sekarang ke mana bungkusan itu pergi? Gerak mendatarnya lurus, jadi tinggal baca kapan ia mendarat.'],
      ['anto','Di tab Tinggi, lihat kapan kurva kembali ke tanah. Di tab Jarak mendatar, baca jaraknya di waktu itu, lalu Tandai di peta.']],
      ()=>{f.rangeAsk=true;toast('Terminal: Jarak mendatar x(t)');sfx.ev();});
  }else if(!f.boxFound){
    say([['anto','Belum ketemu? Patok jarak di pelataran bisa membantu. Tandai jaraknya, lalu datangi.']]);
  }else{
    say([['anto','Kotak amal ketemu. Siapa yang menyuruh Joko?']],()=>openAccuse(2));
  }
}
function pinPos(){return S.pin?{x:sx(S.pin.s),y:JY}:null;}
function dig(){
  const s=S.pin.s,f=S.flags;S.pin=null;
  if(Math.abs(s-LAND)<=2.2&&!f.clueLand){
    S.pL=Math.max(60,300-80*S.digs);S.digs=0;
    say([['Temuan','Ada bekas benda jatuh di tanah, ada pecahan lakban.'],['Temuan','Jejak seretan menuju gerobak soto di sisi utara pelataran.']],
      ()=>{f.clueLand=true;addEv({id:'clueLand',type:'doc',title:'Titik jatuh (24 m)',text:'Bekas benda jatuh dan pecahan lakban di sekitar 24 m dari titik lempar. Jejak seretan menuju gerobak soto.'});});
  }else{
    S.digs++;sfx.bad();
    say([['Temuan','Tidak ada apa-apa di sini. Baca lagi: kapan benda mendarat, dan berapa jarak mendatar pada saat itu?']]);
  }
}
function objective(){
  const f=S.flags;
  if(!f.case)return{t:'Temui Pak Anto di Pos Satpam.',p:TG.anto};
  if(!apexOK())return{t:'Di terminal tiang kamera, cari puncak (kemiringan nol) rekaman, lemparan Joko, dan lemparan Dimas.',p:TG.rekaman};
  if(!f.acc1)return{t:'Laporkan ke Pak Anto: lemparan siapa yang cocok?',p:TG.anto};
  if(!f.twist)return{t:'Temui Joko di titik lempar.',p:TG.joko};
  if(!f.partsAsk)return{t:'Lapor ke Pak Anto.',p:TG.anto};
  if(!f.parts)return{t:'Bedah lemparan: kunci titik A di waktu yang sama pada tiga grafik, simpan masing-masing.',p:TG.rekaman};
  if(!f.rangeAsk)return{t:'Lapor ke Pak Anto.',p:TG.anto};
  if(!f.clueLand){
    if(S.pin)return{t:'Datangi pin di pelataran dan selidiki.',p:pinPos()};
    return{t:'Di terminal, baca kapan benda mendarat lalu jarak mendatarnya. Tandai di peta.',p:TG.rekaman};
  }
  if(!f.boxFound)return{t:'Jejak seretan menuju gerobak soto.',p:TG.gerobak};
  return{t:'Kamu tahu siapa dalangnya. Temui Pak Anto.',p:TG.anto};
}
function stageHint(){
  const f=S.flags;
  if(!apexOK())return['apex','Cocokkan puncaknya: benda tampak diam saat naik berhenti dan mulai turun. Itu kemiringan nol. Bandingkan waktunya, bukan tingginya.'];
  if(!f.acc1)return['acc1','Waktu puncak rekaman sama dengan waktu puncak lemparan siapa?'];
  if(!f.parts)return['parts','Pilih satu waktu, misalnya 2 dtk. Baca kemiringan tiap grafik. Kemiringan lemparan = kemiringan dorongan dikurangi kemiringan penurunan.'];
  if(!f.clueLand)return['land','Di tab Tinggi, kurva menyentuh tanah di t = 3,0 dtk. Di tab Jarak mendatar, baca x pada t = 3,0.'];
  return['final','Gerobak siapa yang berdiri tepat di titik jatuh?'];
}
function openRekaman(){
  const f=S.flags,base={camS:null,gmin:-25,gmax:25,k:1,unit:'m/s',sym:'h',ylab:'h (meter)',flat:true,Tmax:TM,Smax:16};
  if(f.rangeAsk&&!f.boxFound){
    gpOpen({...base,src:'range',title:'Terminal: lintasan bungkusan',series:RANGE,cur:'h',Smax:30,startLocked:true,pinOK:true,pinWhere:'titik lempar',
      tip:'Tab Tinggi: kapan kurva menyentuh tanah? Tab Jarak mendatar: baca x pada waktu itu, lalu Tandai di peta.'});return;
  }
  if(f.partsAsk&&!f.parts){
    gpOpen({...base,src:'parts',title:'Terminal: bedah lemparan Joko',series:PARTS,cur:'tot',Smax:60,gmin:-40,gmax:40,startLocked:true,
      tip:'Kunci titik A di waktu yang sama pada tiap tab (jangan di awal), lalu Simpan bukti.'});return;
  }
  gpOpen({...base,src:'rekam',title:'Terminal rekaman Kamera Pasar',series:SER,cur:'rek',startLocked:!!f.lensSeen,
    tip:'Cari puncak: kunci titik A lalu geser sampai garis singgung datar. Cocokkan dengan lemparan uji.'});
  f.lensSeen=true;
}
const ACQ={
  1:{title:'Laporan pertama',q:'Lemparan siapa yang cocok dengan rekaman kamera?',
    who:[['joko','Joko'],['dimas','Dimas'],['rini','Bu Rini']],
    why:[['ok','Waktu puncak rekaman (kemiringan nol di 1,5 dtk) sama dengan puncak lemparan uji Joko.'],['tinggi','Dimas melempar paling tinggi, jadi paling mirip benda melayang.'],['rekor','Dimas pemegang rekor lempar sekolah, pasti dia.'],['pendek','Lemparan Bu Rini paling pendek, jadi pasti bukan dia, dan Joko tersisa.']],ans:'joko'},
  2:{title:'Tuduhan akhir',q:'Siapa yang menyuruh Joko melempar kotak amal?',
    who:[['rini','Bu Rini'],['dimas','Dimas'],['joko','Joko sendiri']],
    why:[['ok','Benda jatuh tepat 24 m dari titik lempar, di gerobak Bu Rini, dan tutup kotak bergores huruf R.'],['jauh','Dimas bisa melempar paling jauh, jadi dalangnya.'],['sendiri','Joko yang melempar, jadi dia dalangnya.'],['lama','Benda melayang paling lama di atas pasar, jadi pelakunya orang pasar yang paling dekat pos.']],ans:'rini'}
};
function finale(){
  sfx.win();
  say([['anto','Bu Rini. Kotak ini ada di gerobak Ibu.','curiga'],
    ['rini','...Dana amal itu mau diaudit besok. Aku sudah pakai sebagian untuk modal soto. Aku panik.','panik'],
    ['rini','Kalau jalan kaki bawa kotak, pasti ketahuan kamera. Jadi kusuruh Joko melempar dari titik buta kamera.','panik'],
    ['joko','Dan aku mau saja. Maaf, Pak.','panik'],
    ['dimas','Lemparan Joko lebih bagus dari rekorku, ya.','senyum'],
    ['anto','Dana dikembalikan, dan Ibu kerja bakti sebulan. Kerja bagus, Detektif {name}. Puncak bukan hantu, cuma kemiringan nol.','senyum']],endCase);
}
function wrongMsg(n,A){
  if(n===1){
    if(A.who==='dimas')return 'Pak Anto: "Puncak lemparan Dimas di 1,75 dtk. Rekaman puncaknya di 1,5 dtk. Tinggi bukan ukuran yang dipakai." (-100)';
    if(A.who==='rini')return 'Pak Anto: "Puncak lemparan Bu Rini di 1,25 dtk. Cek lagi waktunya." (-100)';
    return 'Pak Anto: "Orangnya mungkin benar, tapi apa yang dicocokkan? Bukan tinggi, bukan rekor." (-100)';
  }
  if(A.who==='joko')return 'Pak Anto: "Joko sendiri bilang ia disuruh. Siapa pemilik gerobak di titik jatuh?" (-100)';
  if(A.who==='dimas')return 'Pak Anto: "Dimas tidur di rumah, dan gerobak di titik jatuh bukan miliknya." (-100)';
  return 'Pak Anto: "Orangnya mungkin benar, tapi bukti kuncinya bukan itu." (-100)';
}
function onAccuseOk(n){
  if(n===1){S.flags.acc1=true;sfx.ev();say([['anto','Puncaknya tidak bohong. Joko yang melempar, tapi benda itu bukan hantu. Temui dia.','senyum']]);}
  else finale();
}
function onLensSave(i,GP){
  const cur=GP.cur,nm=GP.series[cur].name;
  if(GP.src==='parts'){
    if(i.kind!=='inst'){toast('Kunci dulu titik B ke titik A');return 'stay';}
    if(i.t<0.4){toast('Pilih waktu yang lebih besar, jangan di awal');return 'stay';}
    addEv({id:'part-'+cur,type:'meas',title:nm+': kemiringan',text:'Di t = '+f1(i.t)+' dtk, kemiringan '+nm+' = '+f1(i.m)+' m/s.',meta:{kind:'part',cur,t:i.t,v:i.m}});
    const ps=S.evidence.filter(e=>e.meta&&e.meta.kind==='part');
    if(ps.length===3&&Math.max(...ps.map(p=>p.meta.t))-Math.min(...ps.map(p=>p.meta.t))<0.2&&!S.flags.parts){
      S.flags.parts=true;sfx.ev();toast('Pola ketemu: kemiringan lemparan = kemiringan dorongan dikurangi kemiringan penurunan');
    }else if(ps.length===3&&!S.flags.parts)toast('Ketiganya harus di waktu yang sama. Simpan ulang di waktu yang sama.');
    return 'saved';
  }
  if(i.kind==='inst'&&Math.abs(i.m)<0.4){
    addEv({id:'apex-'+cur,type:'meas',title:nm+': titik puncak',text:'Puncak di t = '+f1(i.t)+' dtk, tinggi '+f1(i.s)+' m, kemiringan 0.',meta:{kind:'apex',who:cur,t:i.t,h:i.s}});
  }else if(i.kind==='inst'){
    addEv({id:'sl-'+cur+Math.round(i.t*4),type:'meas',title:nm+': kemiringan sesaat',text:'Di t = '+f1(i.t)+' dtk kemiringan '+f1(i.m)+' m/s (bukan di puncak).',meta:{kind:'slope'}});
  }else addEv({id:'avg-'+cur+Math.round(i.t1*4),type:'meas',title:nm+': laju rata-rata',text:'Antara '+f1(i.t1)+' dan '+f1(i.t2)+' dtk: '+f1(i.m)+' m/s.',meta:{kind:'avg'}});
  return 'saved';
}
function canPin(GP,i){
  if(GP.cur!=='x'){toast('Pin hanya dari grafik Jarak mendatar x(t)');return false;}
  return true;
}
function suspects(chip){
  const f=S.flags;
  if(f.case){chip('Joko',f.acc1?'hot':'');chip('Dimas',f.acc1?'x':'');chip('Bu Rini',f.twist?'hot':'');}
  if(f.twist){chip('Dalang tak dikenal','hot');}
}
function score(el){
  const sub=[];let acc=0;
  for(const k of ['rek','joko','dimas','rini']){
    const e=S.evidence.find(x=>x.type==='meas'&&x.meta.kind==='apex'&&x.meta.who===k);
    if(!e){sub.push([SER[k].name+': belum diukur',0]);continue;}
    const err=Math.abs(e.meta.t-APEX[k]),p=Math.round(75*clamp(1-(err-0.05)/0.3,0,1));acc+=p;
    sub.push([SER[k].name+': selisih '+f1(err)+' dtk',p]);
  }
  const detail={detik:el,apex:{},pL:S.pL||0,petunjuk:S.hints,salah:S.wrong,digs:S.digs};
  for(const k of ['rek','joko','dimas','rini']){const e=S.evidence.find(x=>x.type==='meas'&&x.meta.kind==='apex'&&x.meta.who===k);detail.apex[k]=e?+Math.abs(e.meta.t-APEX[k]).toFixed(3):null;}
  const items=[['Ketepatan puncak (maks 300)',acc,sub],['Membaca titik jatuh (maks 300)',S.pL||0],['Penalaran: dua tuduhan benar (maks 400)',400],['Petunjuk ('+S.hints+')',-60*S.hints],['Salah tuduh ('+S.wrong+')',-100*S.wrong]];
  return {items,detail};
}
function learn(){return [
  'Benda tampak melayang karena di puncak kemiringan <code>h′(t) = 0</code>: sesaat tidak naik dan tidak turun. Kamu mencocokkan lemparan dari waktu puncaknya, bukan dari tingginya.',
  'Lemparan = dorongan dikurangi penurunan, <code>h = 14,7t − 4,9t²</code>. Kemiringannya ikut: <code>h′ = 14,7 − 9,8t</code>. Turunan jumlah atau selisih adalah jumlah atau selisih turunan.',
  'Garis lurus <code>x = 8t</code> punya kemiringan tetap 8 m/s. Dengan t = 3,0 dtk kamu mendapat 24 m, dan di sanalah kotak amal berada.'
];}

/* ---------- hook mesin ---------- */
function tick(dt){}
function night(){return S.flags.twist?.7:.5;}
const orb=t=>({x:JX+VX*t*PXM,h:Math.max(0,V0.joko*t-0.5*GR*t*t)});
function cineStep(dt){
  CINE.t+=dt;
  const tt=clamp(CINE.t-0.8,0,TL),o=orb(tt);
  if(CINE.t>5.6)endCine();
  return [JX+VX*1.5*PXM,JY-60];
}
function afterMove(dt){}
function begin(){
  P.x=TG.anto.x+60;P.y=TG.anto.y+20;S.ui='cine';CINE.t=0;
  return [JX+VX*1.5*PXM,JY-60];
}
function init(){}
function drawWorld(ctx){}
function drawWorldTop(ctx){
  if(S.ui!=='cine')return;
  const tt=CINE.t-0.8;if(tt<0||tt>TL+0.4)return;
  const t=clamp(tt,0,TL),o=orb(t),y=JY-o.h*20;
  // bayangan di tanah
  ctx.fillStyle='rgba(28,34,48,.3)';ctx.beginPath();ctx.ellipse(o.x,JY+8,14-o.h*.4,6,0,0,7);ctx.fill();
  const gl=ctx.createRadialGradient(o.x,y,2,o.x,y,80);gl.addColorStop(0,'rgba(255,230,140,.95)');gl.addColorStop(1,'rgba(255,200,60,0)');
  ctx.fillStyle=gl;ctx.beginPath();ctx.arc(o.x,y,80,0,7);ctx.fill();
  ctx.fillStyle='#fff6c8';ctx.strokeStyle=INK;ctx.lineWidth=3;ctx.beginPath();ctx.arc(o.x,y,14,0,7);ctx.fill();ctx.stroke();
}

function drawCine(ctx){
  const {W,H,hs}=V;
  if(CINE.t>1.8&&CINE.t<4.4){
    ctx.textAlign='center';ctx.lineJoin='round';ctx.font='800 '+Math.round(60*hs)+'px '+FD;ctx.lineWidth=10;ctx.strokeStyle=INK;
    ctx.strokeText('MELAYANG?',W/2,H*.7);ctx.fillStyle=SUN;ctx.fillText('MELAYANG?',W/2,H*.7);
    ctx.font='700 '+Math.round(20*hs)+'px '+FU;ctx.lineWidth=6;ctx.strokeText('Kamera Pasar, 00:03 dini hari',W/2,H*.7+36*hs);ctx.fillStyle=PAPER;ctx.fillText('Kamera Pasar, 00:03 dini hari',W/2,H*.7+36*hs);
  }
  ctx.fillStyle=PAPER;ctx.font='600 '+Math.round(12*hs)+'px '+FU;ctx.textAlign='right';ctx.fillText(G.coarse?'ketuk untuk lewati':'tekan E untuk lewati',W-14,H*.89+20*hs);
}
function drawHud(ctx){}
function jitter(it){return(it.ch==='rini'&&S.flags.boxFound)?Math.sin(G.T*30)*1.2:0;}
function cineEnd(){card('BAB 1','BENDA MELAYANG');}

return {
  id:'melayang-1',judul:'Benda di Atas Pasar',eyebrow:'Semesta 2, Lemparan. Kasus 1',
  lede:'Tengah malam. Kamera Pasar merekam benda bercahaya naik dari balik atap, diam sebentar di udara, lalu hilang. Warga yakin pasar dihantui.',
  teaser:'<b>Pagi hari.</b> Harga cabai naik dua kali lipat, tapi para pedagang justru rugi. Seseorang memainkan angka di pasar. <b>Kasus 3 segera.</b>',
  chapter:'Bab 1: Benda Melayang',
  WW,WH,SOLIDS,LAMPS,CH,TG,sx,
  ints:INTS,extraInts:()=>{const p=pinPos();return p?[{id:'pin',t:p,label:'Selidiki titik ini',act:dig}]:[];},
  buildWorld,objective,stageHint,pinPos,
  ACQ,wrongMsg,onAccuseOk,onLensSave,canPin,suspects,score,learn,
  tick,night,cineStep,afterMove,begin,init,cineEnd,drawWorld,drawWorldTop,drawCine,drawHud,jitter
};
}
