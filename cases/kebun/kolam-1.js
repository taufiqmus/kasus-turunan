/* Semesta 4 (Kebun dan Kolam), Kasus 1: Kolam Menghijau.
   Bab 1: eksponensial A = A0·e^{kt}, A′ = kA, (ln A)′ = A′/A = k. Patahan grafik ln A menandai hari pupuk dibuang.
          Lalu memecahkan A0·e^{kt} = 60 dengan ln untuk menjadwalkan aerator.
   Bab 2: akar. Bercak menyebar r = c·√(t − t0), r′ = c/(2√(t − t0)), umur bercak = r/(2r′). */
import {kit} from '../../core/kit.js';
export default function create(E){
const {teori,w2s,S,P,G,K,T,V,$,clamp,f0,f1,rngSeed,INK,PAPER,SUN,CORAL,ALERT,BLUE,GOOD,FD,FU,say,toast,addEv,card,sfx,openAccuse,gpOpen,endCine,endCase}=E;
const KT=kit(E),FR=KT.FR;

/* ---------- model ---------- */
const K1=0.2,K2=0.45,TD=6,NOW=10;
const A6=Math.exp(K1*TD);
const Aof=t=>t<=TD?Math.exp(K1*t):A6*Math.exp(K2*(t-TD));     // persen tutupan
const T60=TD+Math.log(60/A6)/K2;                                  // hari ke-12,43
const PATCH={A:{c:1.5,t0:9,who:'wiryo',n:'Pipa A (kebun Pak Wiryo)'},B:{c:2,t0:6,who:'dewi',n:'Pipa B (peternakan Bu Dewi)'},C:{c:3.6,t0:8.5,who:'bayu',n:'Pipa C (pemancingan Mas Bayu)'}};
const rOf=(k,t)=>{const p=PATCH[k];return t<=p.t0?0:p.c*Math.sqrt(t-p.t0);};

const THEORY={
  'k4-dasar':{t:'Tumbuh berlipat',sub:'A(t) = A₀·eᵏᵗ',h:
    '<p>Lumut membelah diri: makin banyak lumut, makin banyak yang membelah. Pertumbuhan seperti itu disebut <b>eksponensial</b>:</p>'+
    '<span class="eq">A(t) = A₀ · e<sup>k·t</sup></span>'+
    '<p>A dalam persen tutupan kolam, t dalam hari, <b>k</b> adalah laju tumbuh relatif per hari. e ≈ 2,718. Ciri khasnya: lama terlihat "tidak ada apa-apa", lalu tiba-tiba meledak.</p>'},
  'k4-exp':{t:'Turunan eksponensial',sub:'(eᵏᵗ)′ = k·eᵏᵗ',h:
    '<p>Fungsi e<sup>x</sup> istimewa: turunannya adalah dirinya sendiri.</p>'+
    '<span class="eq">'+FR('d','dx')+' eˣ = eˣ &nbsp;&nbsp; '+FR('d','dt')+' e<sup>kt</sup> = k·e<sup>kt</sup></span>'+
    '<span class="eq">A′(t) = k · A(t)</span>'+
    '<p>Laju tumbuh sebanding dengan ukuran sekarang. Karena itu A′ <b>selalu</b> paling besar di hari terakhir, walaupun tidak ada yang berubah. A′ yang besar <b>bukan</b> tanda pupuk baru dibuang.</p>'+
    '<div class="ex"><b>Contoh.</b> A = 2·e<sup>0,3t</sup>. Di t = 5: A ≈ 8,96, A′ = 0,3 × 8,96 ≈ 2,69 % per hari.</div>'},
  'k4-ln':{t:'Logaritma meluruskan eksponensial',sub:'(ln A)′ = A′/A',h:
    '<span class="eq">'+FR('d','dx')+' ln x = '+FR('1','x')+' &nbsp;&nbsp;⇒&nbsp;&nbsp; '+FR('d','dt')+' ln A(t) = '+FR('A′(t)','A(t)')+'</span>'+
    '<p>Untuk A = A₀e<sup>kt</sup>: ln A = ln A₀ + k·t. Itu <b>garis lurus</b> dengan kemiringan k.</p>'+
    '<span class="eq">(ln A)′ = '+FR('A′','A')+' = k &nbsp; (laju tumbuh relatif, tetap)</span>'+
    '<p>Kalau k tiba-tiba berubah, grafik ln A <b>patah</b>: dua garis lurus dengan kemiringan berbeda. Hari patahnya adalah hari sesuatu masuk ke kolam.</p>'+
    '<div class="ex"><b>Pembahasan.</b> Di tab ln A, ukur kemiringan sebelum dan sesudah patahan. Cari hari di mana kemiringan berganti.</div>'},
  'k4-solve':{t:'Kapan mencapai batas?',sub:'pakai ln',h:
    '<p>Ingin tahu kapan A mencapai nilai tertentu, misalnya batas aman ikan. Mulai dari tutupan sekarang A<sub>n</sub> di hari n:</p>'+
    '<span class="eq">A<sub>n</sub>·e<sup>k(t − n)</sup> = A<sub>batas</sub> &nbsp;⇒&nbsp; t = n + '+FR('ln(A<sub>batas</sub> / A<sub>n</sub>)','k')+'</span>'+
    '<div class="ex"><b>Contoh.</b> Hari ini (n = 3) tutupan 5%, k = 0,5 per hari, batas 40%. t = 3 + ln(8)/0,5 = 3 + 2,08/0,5 ≈ 7,2. Mulai aerator sedikit sebelum hari ke-7,2.</div>'},
  'k4-akar':{t:'Bercak menyebar seperti akar',sub:'(√t)′ = 1/(2√t)',h:
    '<p>Bercak lumut dari satu sumber melebar cepat di awal lalu melambat. Jari-jarinya mengikuti akar waktu:</p>'+
    '<span class="eq">r(t) = c·√(t − t₀) = c·(t − t₀)<sup>1/2</sup></span>'+
    '<p>Aturan pangkat tetap berlaku untuk pangkat pecahan:</p>'+
    '<span class="eq">r′(t) = c·½·(t − t₀)<sup>−1/2</sup> = '+FR('c','2√(t − t₀)')+'</span>'+
    '<p>Bagi r dengan r′, maka c lenyap:</p>'+
    '<span class="eq">'+FR('r','r′')+' = 2(t − t₀) &nbsp;⇒&nbsp; umur = t − t₀ = '+FR('r','2r′')+'</span>'+
    '<div class="ex"><b>Pembahasan.</b> Bercak terbesar belum tentu tertua: c bergantung arus air. Ukur r dan r′ di hari yang sama untuk tiap bercak, lalu hitung umurnya.</div>'}
};

/* ---------- dunia ---------- */
const WW=2200,WH=1400,PC={x:1100,y:720},PR={x:430,y:240};
const BUILD=[
  {x:90,y:560,w:260,h:170,roof:'#8aa05a',name:'KEBUN WIRYO',door:'n'},
  {x:950,y:120,w:300,h:170,roof:'#7a5a3a',name:'PETERNAKAN DEWI',door:'s'},
  {x:1850,y:600,w:260,h:170,roof:'#2f7fc1',name:'PEMANCINGAN',door:'n'},
  {x:200,y:1080,w:280,h:160,roof:'#4a6fa5',name:'POS RONDA',door:'n'}
];
const INL={A:{x:PC.x-PR.x+20,y:PC.y},B:{x:PC.x,y:PC.y-PR.y+18},C:{x:PC.x+PR.x-20,y:PC.y}};
const TG={anto:{x:420,y:1020},drone:{x:520,y:1080},wiryo:{x:430,y:650},dewi:{x:1260,y:390},bayu:{x:1770,y:780},
  aerator:{x:1100,y:1000},pipaA:{x:INL.A.x-60,y:INL.A.y+60},pipaB:{x:INL.B.x+70,y:INL.B.y-50},pipaC:{x:INL.C.x+60,y:INL.C.y+60}};
const SOLIDS=BUILD.map(b=>({x:b.x,y:b.y,w:b.w,h:b.h}));
SOLIDS.push({x:PC.x-PR.x+40,y:PC.y-PR.y*.55,w:2*PR.x-80,h:PR.y*1.1},{x:PC.x-PR.x*.75,y:PC.y-PR.y+30,w:PR.x*1.5,h:2*PR.y-60},{x:PC.x-PR.x*.45,y:PC.y-PR.y+8,w:PR.x*.9,h:2*PR.y-16});
const CH={
  anto:{n:'Pak Anto',body:'#c9b27a',cap:'#4a6fa5'},
  wiryo:{n:'Pak Wiryo',body:'#8aa05a',cap:'#d9a441'},
  dewi:{n:'Bu Dewi',body:'#9a8fc2',cap:'#1c2230'},
  bayu:{n:'Mas Bayu',body:'#2f7fc1',cap:'#f4efe1'}
};
const BLOBS=(()=>{const R=rngSeed(41),a=[];while(a.length<340){const u=R()*2-1,v=R()*2-1;if(u*u+v*v<.9)a.push([u,v,.05+R()*.06]);}return a;})();
function pond(g,cx,cy,rx,ry,cov,patches){
  g.fillStyle='#2b6f8f';g.strokeStyle=INK;g.lineWidth=5;g.beginPath();g.ellipse(cx,cy,rx,ry,0,0,7);g.fill();g.stroke();
  g.save();g.beginPath();g.ellipse(cx,cy,rx,ry,0,0,7);g.clip();
  g.strokeStyle='rgba(255,255,255,.18)';g.lineWidth=2;for(let i=0;i<8;i++){g.beginPath();g.ellipse(cx+(i%3-1)*rx*.4,cy+(i%2?-1:1)*ry*.3,rx*.12,ry*.05,0,0,7);g.stroke();}
  const n=Math.round(cov/100*BLOBS.length);
  for(let i=0;i<n;i++){const b=BLOBS[i];g.fillStyle=i%3?'rgba(70,150,60,.92)':'rgba(110,180,70,.92)';g.beginPath();g.ellipse(cx+b[0]*rx,cy+b[1]*ry,b[2]*rx*1.6,b[2]*ry*1.6,0,0,7);g.fill();}
  if(patches)for(const k of 'ABC'){const r=rOf(k,NOW)*22,q=INL[k];g.fillStyle='rgba(60,140,50,.9)';g.beginPath();g.arc(q.x,q.y,r,0,7);g.fill();g.strokeStyle='rgba(28,34,48,.5)';g.lineWidth=2;g.stroke();}
  g.restore();
}
function buildWorld(){
  const c=document.createElement('canvas');c.width=WW;c.height=WH;const g=c.getContext('2d'),R=rngSeed(43);
  KT.ground(g,WW,WH,R,'#6fae58','#7dbd62','#62a04c');
  KT.paths(g,BUILD,PC.y-PR.y-40,PC.y+PR.y+40);
  g.fillStyle='#d6b98a';g.fillRect(0,960,WW,70);
  for(const b of BUILD)KT.building(g,b);
  // pipa
  g.strokeStyle='#6f7b8c';g.lineWidth=12;g.lineCap='round';
  g.beginPath();g.moveTo(350,640);g.lineTo(INL.A.x,INL.A.y);g.stroke();
  g.beginPath();g.moveTo(1100,290);g.lineTo(INL.B.x,INL.B.y);g.stroke();
  g.beginPath();g.moveTo(1850,680);g.lineTo(INL.C.x,INL.C.y);g.stroke();g.lineCap='butt';
  // pupuk di kebun
  for(let i=0;i<3;i++){g.fillStyle='#e9dfc8';g.strokeStyle=INK;g.lineWidth=2;g.fillRect(380+i*26,560,22,30);g.strokeRect(380+i*26,560,22,30);}
  KT.sign(g,'AERATOR',TG.aerator.x,TG.aerator.y+40);
  g.fillStyle='#262a36';g.fillRect(TG.drone.x-16,TG.drone.y+10,32,22);
  KT.trees(g,R,WW,WH,[...BUILD.map(b=>[b.x-50,b.y-50,b.w+100,b.h+100]),[PC.x-PR.x-90,PC.y-PR.y-90,2*PR.x+180,2*PR.y+180],[0,940,WW,110]],Object.values(TG),SOLIDS,42);
  return c;
}

/* ---------- arsip drone (overlay) ---------- */
const DR={d:0,drag:null,no:null};
const JD={d:11,drag:null,ok:null,no:null,res:null};
function openDrone(){S.ui='drone';K.u=K.d=K.l=K.r=false;T.x=T.y=0;S.flags.droneSeen=true;}
function panel(V,maxW,maxH){const {W,H,hs}=V,top=8,w=Math.min(maxW*hs,W-16),h=Math.min(maxH*hs*(W<600?1.5:1),H-top-8);return {w,h,x:(W-w)/2,y:top+Math.max(0,(H-top-8-h)/2),hs};}
function dronePanel(ctx){
  const {w,h,x,y,hs}=panel(V,700,430),f=Math.round(14*hs);KT.box(ctx,x,y,w,h);
  KT.txt(ctx,'ARSIP FOTO DRONE: KOLAM DESA',x+14,y+24*hs,'800 '+Math.round(16*hs)+'px '+FD);
  const A=Aof(DR.d);
  const nar=w<560;KT.txt(ctx,'hari ke-'+f1(DR.d)+'   tutupan '+f1(A)+'%',nar?x+14:x+w-14,nar?y+46*hs:y+24*hs,'800 '+Math.round(15*hs)+'px '+FU,INK,nar?'left':'right');
  const cx=x+w/2,cy=y+h*.46,rx=Math.min(w*.42,(h*.62)*1.6),ry=rx*.52;
  pond(ctx,cx,cy,rx,ry,A,false);
  const sx0=x+30*hs,sx1=x+w-30*hs,sy=y+h-70*hs;
  ctx.strokeStyle=INK;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(sx0,sy);ctx.lineTo(sx1,sy);ctx.stroke();
  for(let d=0;d<=10;d++){const X=sx0+(sx1-sx0)*d/10;ctx.fillStyle=INK;ctx.fillRect(X-1,sy-6,2,12);KT.txt(ctx,String(d),X,sy+20*hs,'700 '+Math.round(11*hs)+'px '+FU,INK,'center');}
  const X=sx0+(sx1-sx0)*DR.d/10;ctx.fillStyle=SUN;ctx.strokeStyle=INK;ctx.lineWidth=3;ctx.beginPath();ctx.arc(X,sy,11*hs,0,7);ctx.fill();ctx.stroke();
  DR.track={x0:sx0,x1:sx1};
  KT.txt(ctx,G.coarse?'Geser untuk memutar hari.':'Seret atau panah ←→. Esc: tutup.',x+14,y+h-16*hs,'600 '+Math.round(11.5*hs)+'px '+FU);
  DR.no=KT.btn(ctx,{x:x+w-110*hs-14,y:y+h-46*hs,w:110*hs,h:36*hs},'Tutup',false,f);
}
function openJadwal(){S.ui='jadwal';K.u=K.d=K.l=K.r=false;T.x=T.y=0;teori('k4-solve');}
function jadwalPanel(ctx){
  const {w,h,x,y,hs}=panel(V,640,360),f=Math.round(14*hs);KT.box(ctx,x,y,w,h);
  KT.txt(ctx,'JADWAL AERATOR DARURAT',x+14,y+26*hs,'800 '+Math.round(17*hs)+'px '+FD);
  const L=['Hari ini hari ke-10, tutupan '+f1(Aof(NOW))+'%.','Ikan mulai mati saat tutupan 60%.','Genset hanya kuat 12 jam (0,5 hari). Nyalakan sebelum krisis,','tapi jangan terlalu awal.'];
  L.forEach((l,i)=>KT.txt(ctx,l,x+14,y+(56+i*20)*hs,'600 '+f+'px '+FU));
  KT.txt(ctx,'Nyalakan pada hari ke-'+JD.d.toFixed(2).replace('.',','),x+w/2,y+h*.62,'800 '+Math.round(24*hs)+'px '+FU,'#c25a1c','center');
  const sx0=x+30*hs,sx1=x+w-30*hs,sy=y+h*.74;
  ctx.strokeStyle=INK;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(sx0,sy);ctx.lineTo(sx1,sy);ctx.stroke();
  for(let d=10;d<=15;d++){const X=sx0+(sx1-sx0)*(d-10)/5;ctx.fillStyle=INK;ctx.fillRect(X-1,sy-6,2,12);KT.txt(ctx,String(d),X,sy+20*hs,'700 '+Math.round(11*hs)+'px '+FU,INK,'center');}
  const X=sx0+(sx1-sx0)*(JD.d-10)/5;ctx.fillStyle=SUN;ctx.strokeStyle=INK;ctx.lineWidth=3;ctx.beginPath();ctx.arc(X,sy,11*hs,0,7);ctx.fill();ctx.stroke();
  JD.track={x0:sx0,x1:sx1};
  const bh=38*hs;JD.no=KT.btn(ctx,{x:x+14,y:y+h-bh-12,w:100*hs,h:bh},'Tutup',false,f);JD.ok=KT.btn(ctx,{x:x+w-190*hs-14,y:y+h-bh-12,w:190*hs,h:bh},'Pasang jadwal',true,f);
}
function setJadwal(){
  const d=JD.d,f=S.flags;S.ui='none';f.jadwal=true;
  const early=T60-d;let pts,msg;
  if(early<0){pts=0;msg=[['Aerator','Genset menyala hari ke-'+f1(d)+'. Terlambat: ikan sudah mengapung sejak hari ke-'+f1(T60)+'.'],['anto','Sebagian ikan tak tertolong. Tapi kasusnya belum selesai.','curiga']];}
  else if(early<=0.5){pts=Math.round(200*clamp(1-(early-0.1)/0.6,0.5,1));msg=[['Aerator','Genset menyala hari ke-'+f1(d)+', tepat sebelum tutupan 60% di hari ke-'+f1(T60)+'.'],['anto','Ikan selamat! Hitunganmu pas.','senyum']];}
  else{pts=40;msg=[['Aerator','Genset menyala hari ke-'+f1(d)+' lalu kehabisan solar sebelum krisis di hari ke-'+f1(T60)+'.'],['anto','Terlalu awal. Ikan setengahnya selamat.','curiga']];}
  S.aerPts=pts;addEv({id:'jadwal',type:'meas',title:'Jadwal aerator',text:'Dinyalakan hari ke-'+f1(d)+'. Krisis 60% terjadi hari ke-'+f1(T60)+'.',meta:{kind:'jadwal',d}});
  say(msg);
}

/* ---------- interaksi ---------- */
const INTS=[
  {id:'anto',ch:'anto',t:TG.anto,label:'Bicara dengan Pak Anto',act:talkAnto},
  {id:'drone',t:TG.drone,label:'Buka arsip drone',icon:'i',when:()=>S.flags.case,act:()=>{if(!S.flags.droneSeen||!S.flags.lensa)openDrone();else openTerminal();}},
  {id:'aerator',t:TG.aerator,label:'Atur jadwal aerator',icon:'!',when:()=>S.flags.acc1&&!S.flags.jadwal,act:openJadwal},
  {id:'wiryo',ch:'wiryo',t:TG.wiryo,label:'Bicara dengan Pak Wiryo',act:()=>{
    const f=S.flags;
    if(f.jadwal&&!f.twist){sfx.twist();say([['wiryo','Pupuk? Iya, itu pupukku. Tapi tiga karung HILANG dari gudangku, malam hari ke-5. Sudah kulaporkan ke ronda!','panik'],['wiryo','Kalau aku mau buang pupuk, buat apa lewat pipaku sendiri? Bodoh namanya.','panik'],['wiryo','Lihat saja bercak lumut di tiap mulut pipa. Ada tiga.','curiga']],
      ()=>{f.twist=true;teori('k4-akar');addEv({id:'w-wiryo2',type:'witness',title:'Pupuk Wiryo dicuri',text:'Tiga karung pupuk hilang malam hari ke-5. Ada bercak lumut di mulut tiga pipa: A (Wiryo), B (Dewi), C (Bayu).'});card('BAB 2','TIGA PIPA');$('chap').textContent='Bab 2: Tiga Pipa';});}
    else if(f.twist)say([['wiryo','Ukur bercaknya, Detektif. Jangan cuma lihat besarnya.']]);
    else say([['wiryo','Kolam hijau? Lumut itu alami, Detektif. Tiap tahun juga begitu.']],()=>addEv({id:'w-wiryo',type:'witness',title:'Pak Wiryo',text:'"Lumut itu alami, tiap tahun begitu." Ada karung pupuk di kebunnya.'}));}},
  {id:'dewi',ch:'dewi',t:TG.dewi,label:'Bicara dengan Bu Dewi',act:()=>say(S.flags.twist?[['dewi','Bercak besar itu di pipa Bayu, kan? Sudah jelas.','senyum']]:[['dewi','Kasihan ya kolamnya. Kalau ikan pemancingan mati, warga beli lele saja di tempatku.','senyum']],
    ()=>addEv({id:'w-dewi',type:'witness',title:'Bu Dewi',text:'Peternak lele. "Kalau ikan pemancingan mati, warga beli lele di tempatku."'}))},
  {id:'bayu',ch:'bayu',t:TG.bayu,label:'Bicara dengan Mas Bayu',act:()=>say([['bayu','Pemancinganku bisa tutup kalau ikan mati! Kenapa aku buang pupuk ke kolamku sendiri?','panik'],['bayu','Air pipaku memang deras, dari mata air. Apa saja yang masuk langsung menyebar.','panik']],
    ()=>addEv({id:'w-bayu',type:'witness',title:'Mas Bayu',text:'Pengelola pemancingan. Arus pipa C deras, apa pun yang masuk cepat menyebar.'}))},
  {id:'pipaA',t:TG.pipaA,label:'Lihat bercak pipa A',icon:'?',when:()=>S.flags.twist,act:()=>say([['Pipa A','Bercak kecil, tepinya masih tajam. Arus pelan.']])},
  {id:'pipaB',t:TG.pipaB,label:'Lihat bercak pipa B',icon:'?',when:()=>S.flags.twist,act:()=>say([['Pipa B','Bercak sedang, tepinya pudar. Arus pelan. Ada bau pakan lele.']])},
  {id:'pipaC',t:TG.pipaC,label:'Lihat bercak pipa C',icon:'?',when:()=>S.flags.twist,act:()=>say([['Pipa C','Bercak paling LEBAR. Arusnya deras dari mata air.']])}
];
function talkAnto(){
  const f=S.flags;
  if(!f.case){
    say([['anto','Detektif {name}. Kolam desa: minggu lalu bersih, hari ini seperlima tertutup lumut. Ikan pemancingan megap-megap.','curiga'],
      ['anto','Warga bilang alami. Aku curiga ada yang membuang pupuk. Pertanyaannya: KAPAN?'],
      ['anto','Di pos ronda ada arsip foto drone harian. Mulai dari sana.']],
      ()=>{f.case=true;addEv({id:'kasus',type:'doc',title:'Kolam menghijau',text:'Tutupan lumut naik cepat. Dugaan: pupuk dibuang ke kolam. Kapan dan oleh siapa?'});});
  }else if(!f.droneSeen){say([['anto','Arsip drone di pos ronda. Putar hari demi hari.']]);}
  else if(!f.lensa){
    say([['anto','Dari foto saja kelihatan "pelan, pelan, lalu meledak". Itu ciri eksponensial. Tapi ledakannya alami atau karena pupuk?'],
      ['anto','Kuberi Lensa untuk data tutupannya. Ada dua tab: A dan ln A. Salah satunya akan bicara jujur.']],
      ()=>{f.lensa=true;toast('Arsip drone: Lensa A(t) dan ln A(t)');sfx.ev();});
  }else if(!f.acc1){
    say([['anto','Kapan pupuk masuk ke kolam?']],()=>openAccuse(1));
  }else if(!f.jadwal){say([['anto','Darurat! Atur aerator sebelum ikan mati. Panelnya di tepi selatan kolam.','panik']]);}
  else if(!f.twist){say([['anto','Karung pupuk ada di kebun Pak Wiryo. Tanya dia.','curiga']]);}
  else if(!f.ages){say([['anto','Tiga bercak, tiga pipa. Bercak mana yang lahir di hari pupuk masuk? Ukur di arsip drone.']]);}
  else say([['anto','Siapa yang membuang pupuk?']],()=>openAccuse(2));
}
function openTerminal(){
  teori('k4-exp');
  const ser={
    A:{name:'A: tutupan',col:'#3f8a45',pts:KT.samp(Aof,0,NOW,200),kind:'plain',sym:'A',yu:'%',ru:'% per hari',ylab:'A (% tutupan)',Smax:25},
    L:{name:'ln A',col:'#7c4dbd',pts:KT.samp(t=>Math.log(Aof(t)),0,NOW,200),kind:'plain',sym:'lnA',yu:'',ru:'per hari',ylab:'ln A',Smax:3.5,dp:2}
  };
  if(S.flags.twist)for(const k of 'ABC')ser['r'+k]={name:'r'+k+': bercak pipa '+k,col:{A:'#c25a1c',B:'#2f7fc1',C:'#2f9e5b'}[k],pts:KT.samp(t=>rOf(k,t),8.6,10.4,180),kind:'plain',sym:'r',yu:'m',ru:'m per hari',ylab:'jari-jari bercak (m)',Smax:5,xlab:'t (hari)',T0:8.6,Tmax:10.4,dp:2};
  gpOpen({src:'drone',title:'Arsip drone: data tutupan',series:ser,cur:S.flags.twist?'rA':'A',Tmax:NOW+.5,Smax:25,camS:null,gmin:-1,gmax:3,k:1,unit:'',startLocked:false,xs:'t',xu:'hari',xlab:'t (hari)',
    tip:S.flags.twist?'Untuk tiap bercak: kunci titik di t = 10 lalu simpan. Dari r dan r′, hitung umurnya.':'Kunci titik, baca kemiringan, simpan. Bandingkan sebelum dan sesudah.'});
}
function onLensSave(i,GP){
  const cur=GP.cur;
  if(i.kind!=='inst'){toast('Kunci dulu titik B ke titik A');return 'stay';}
  if(cur==='L'){teori('k4-ln');addEv({id:'k-'+(i.t<TD?'awal':'akhir'),type:'meas',title:'Kemiringan ln A '+(i.t<TD?'(sebelum)':'(sesudah)'),text:'Di hari ke-'+f1(i.t)+': (ln A)′ = '+(Math.round(i.m*100)/100).toFixed(2).replace('.',',')+' per hari.',meta:{kind:'k',t:i.t,m:i.m}});return 'saved';}
  if(cur==='A'){addEv({id:'A-'+Math.round(i.t),type:'meas',title:'Tutupan hari ke-'+f1(i.t),text:'A = '+f1(i.s)+'%, A′ = '+f1(i.m)+'% per hari.',meta:{kind:'A'}});return 'saved';}
  const k=cur[1];
  addEv({id:'r-'+k,type:'meas',title:'Bercak pipa '+k,text:'Di hari ke-'+(Math.round(i.t*100)/100).toFixed(2).replace('.',',')+': r = '+(Math.round(i.s*100)/100).toFixed(2).replace('.',',')+' m, r′ = '+(Math.round(i.m*100)/100).toFixed(2).replace('.',',')+' m/hari.',meta:{kind:'r',k,t:i.t,r:i.s,m:i.m}});
  if('ABC'.split('').every(q=>S.evidence.some(e=>e.id==='r-'+q)))S.flags.ages=true;
  return 'saved';
}

/* ---------- tuduhan ---------- */
const ACQ={
  1:{title:'Laporan pertama',q:'Kapan pupuk masuk ke kolam?',
    who:[['d6','Hari ke-6'],['d9','Hari ke-9'],['d10','Hari ke-10 (kemarin)']],
    why:[['ok','Grafik ln A patah di hari ke-6: kemiringannya (laju relatif k) naik dari sekitar 0,2 ke 0,45 per hari.'],['besar','A′ paling besar di hari ke-10, jadi pupuk dibuang kemarin.'],['kelihatan','Lumut baru kelihatan banyak di hari ke-9.'],['alami','Tidak ada pupuk. Eksponensial memang alami.']],ans:'d6'},
  2:{title:'Tuduhan akhir',q:'Dari pipa siapa pupuk dibuang?',
    who:[['dewi','Pipa B: Bu Dewi'],['bayu','Pipa C: Mas Bayu'],['wiryo','Pipa A: Pak Wiryo']],
    why:[['ok','Umur bercak = r/(2r′). Bercak pipa B berumur 4 hari: lahir hari ke-6, tepat saat ln A patah.'],['lebar','Bercak pipa C paling lebar, jadi paling lama.'],['pupuk','Pupuknya milik Pak Wiryo.'],['kecil','Bercak pipa A paling kecil, jadi paling berbahaya.']],ans:'dewi'}
};
function wrongMsg(n,A){
  if(n===1){if(A.who==='d10')return 'Pak Anto: "A′ selalu terbesar di akhir pada pertumbuhan eksponensial. Itu bukan tanda." (-100)';
    if(A.who==='d9')return 'Pak Anto: "Kelihatan banyak bukan berarti mulai. Lihat grafik yang lurus." (-100)';return 'Pak Anto: "Harinya benar, tapi buktinya?" (-100)';}
  if(A.who==='bayu')return 'Pak Anto: "Lebar karena arusnya deras. Berapa UMUR bercaknya?" (-100)';
  if(A.who==='wiryo')return 'Pak Anto: "Bercak pipa A baru sehari. Pupuk masuk hari ke-6." (-100)';
  return 'Pak Anto: "Orangnya benar, tapi bukti kuncinya bukan itu." (-100)';
}
function onAccuseOk(n){
  if(n===1){S.flags.acc1=true;sfx.ev();say([['anto','Hari ke-6. Garis lurus itu patah tidak bohong.','senyum'],['anto','Tapi ikan bisa mati duluan sebelum kita tangkap pelakunya. Atur aerator di tepi selatan kolam, SEKARANG.','panik']]);}
  else finale();
}
function finale(){
  sfx.win();
  say([['anto','Bu Dewi. Bercak di pipa Ibu lahir hari ke-6, sehari setelah pupuk Pak Wiryo hilang.','curiga'],
    ['dewi','...Kalau pemancingan Bayu mati, orang beli lele di tempatku. Pupuk itu kuambil dari gudang Wiryo yang tak dikunci.','panik'],
    ['dewi','Kukira bercak di pipaku kalah besar dengan pipa Bayu. Tak akan ada yang curiga.','panik'],
    ['bayu','Besar bukan berarti tua. Arus pipaku saja yang deras.','curiga'],
    ['wiryo','Karungku kembali?','senyum'],
    ['anto','Kerja bagus, Detektif {name}. ln meluruskan yang meledak, dan akar membuka umur yang tersembunyi.','senyum']],endCase);
}
function suspects(chip){const f=S.flags;if(f.case)chip('Pak Wiryo',f.twist?'x':'hot');if(f.twist){chip('Bu Dewi','');chip('Mas Bayu','');}}

/* ---------- alur ---------- */
function objective(){
  const f=S.flags;
  if(!f.case)return{t:'Temui Pak Anto di pos ronda.',p:TG.anto};
  if(!f.droneSeen)return{t:'Buka arsip drone di pos ronda.',p:TG.drone};
  if(!f.lensa)return{t:'Lapor Pak Anto.',p:TG.anto};
  if(!f.acc1){if(!S.evidence.some(e=>e.id==='k-awal')||!S.evidence.some(e=>e.id==='k-akhir'))return{t:'Di arsip drone, ukur kemiringan ln A sebelum dan sesudah perubahan.',p:TG.drone};return{t:'Lapor Pak Anto: kapan pupuk masuk?',p:TG.anto};}
  if(!f.jadwal)return{t:'DARURAT: atur jadwal aerator sebelum tutupan 60%.',p:TG.aerator};
  if(!f.twist)return{t:'Tanya Pak Wiryo soal karung pupuk.',p:TG.wiryo};
  if(!f.ages)return{t:'Ukur r dan r′ ketiga bercak di hari ke-10 (arsip drone).',p:TG.drone};
  return{t:'Kamu tahu pelakunya. Temui Pak Anto.',p:TG.anto};
}
function stageHint(){
  const f=S.flags;
  if(!f.acc1)return['acc1','Di tab ln A, kurvanya terdiri dari dua garis lurus. Hari di mana kemiringannya berganti adalah hari pupuk masuk.'];
  if(!f.jadwal)return['jadwal','Ukur k sesudah perubahan dari tab ln A. Lalu t = 10 + ln(60 / A hari ini) / k.'];
  if(!f.ages)return['ages','Umur bercak = r / (2r′). Ukur r dan r′ tiap bercak di hari ke-10.'];
  return['final','Bercak mana yang berumur 4 hari (lahir hari ke-6)?'];
}

/* ---------- skor ---------- */
function score(el){
  const e1=S.evidence.find(e=>e.id==='k-awal'),e2=S.evidence.find(e=>e.id==='k-akhir');
  const p1=e1?Math.round(100*clamp(1-(Math.abs(e1.meta.m-K1)-.01)/.1,0,1)):0,p2=e2?Math.round(100*clamp(1-(Math.abs(e2.meta.m-K2)-.01)/.1,0,1)):0;
  let pr=0;const sub=[];
  for(const k of 'ABC'){const e=S.evidence.find(x=>x.id==='r-'+k);const ok=e&&Math.abs(e.meta.t-NOW)<=0.1&&Math.abs(e.meta.m-PATCH[k].c/(2*Math.sqrt(NOW-PATCH[k].t0)))<.15;const pp=e?(ok?67:30):0;pr+=pp;sub.push(['Bercak pipa '+k+(e?(ok?': tepat':': kurang tepat'):': belum'),pp]);}
  pr=Math.min(200,pr);
  const items=[['Laju relatif k dari ln A (maks 200)',p1+p2,[['k sebelum: '+(e1?e1.meta.m.toFixed(2).replace('.',','):'belum'),p1],['k sesudah: '+(e2?e2.meta.m.toFixed(2).replace('.',','):'belum'),p2]]],['Jadwal aerator (maks 200)',S.aerPts||0],['Umur bercak (maks 200)',pr,sub],['Penalaran: dua tuduhan benar (maks 400)',400],['Petunjuk ('+S.hints+')',-60*S.hints],['Salah tuduh ('+S.wrong+')',-100*S.wrong]];
  return {items,detail:{detik:el,k1:e1&&e1.meta.m,k2:e2&&e2.meta.m,aerator:S.aerPts||0,petunjuk:S.hints,salah:S.wrong}};
}
function learn(){return[
  'Eksponensial: <code>A = A₀·eᵏᵗ</code>, turunannya <code>A′ = k·A</code>. A′ selalu terbesar di akhir, jadi itu bukan petunjuk kapan sesuatu berubah.',
  'Logaritma meluruskan: <code>(ln A)′ = A′/A = k</code>. Grafik ln A patah di hari ke-6, saat k naik dari 0,2 ke 0,45. Dengan ln juga kamu menghitung kapan tutupan mencapai 60%.',
  'Akar: <code>r = c√(t − t₀)</code>, <code>r′ = c/(2√(t − t₀))</code>, jadi umur = <code>r/(2r′)</code>. Bercak terbesar ternyata bukan yang tertua.'
];}

/* ---------- input & gambar ---------- */
function slider(o,x,lo,hi){const t=o.track;if(!t)return;return clamp(lo+(x-t.x0)/(t.x1-t.x0)*(hi-lo),lo,hi);}
function onPointer(type,e){
  const x=e.clientX,y=e.clientY;
  if(S.ui==='drone'){
    if(type==='down'){if(KT.inR(DR.no,x,y)){S.ui='none';return true;}DR.drag=e.pointerId;DR.d=Math.round(slider(DR,x,0,10)*10)/10;return true;}
    if(type==='move'&&DR.drag===e.pointerId){DR.d=Math.round(slider(DR,x,0,10)*10)/10;return true;}
    if(type==='up')DR.drag=null;return true;
  }
  if(S.ui==='jadwal'){
    if(type==='down'){if(KT.inR(JD.ok,x,y)){setJadwal();return true;}if(KT.inR(JD.no,x,y)){S.ui='none';return true;}JD.drag=e.pointerId;JD.d=Math.round(slider(JD,x,10,15)*20)/20;return true;}
    if(type==='move'&&JD.drag===e.pointerId){JD.d=Math.round(slider(JD,x,10,15)*20)/20;return true;}
    if(type==='up')JD.drag=null;return true;
  }
  return false;
}
function onKey(e){
  const k=e.key;
  if(S.ui==='drone'){if(k==='ArrowRight'||k==='d'||k==='D')DR.d=Math.min(10,Math.round((DR.d+(e.shiftKey?1:.1))*10)/10);else if(k==='ArrowLeft'||k==='a'||k==='A')DR.d=Math.max(0,Math.round((DR.d-(e.shiftKey?1:.1))*10)/10);else if(k==='Escape'||k==='e'||k==='E')S.ui='none';else return false;e.preventDefault();return true;}
  if(S.ui==='jadwal'){if(k==='ArrowRight'||k==='d'||k==='D')JD.d=Math.min(15,Math.round((JD.d+(e.shiftKey?.5:.05))*100)/100);else if(k==='ArrowLeft'||k==='a'||k==='A')JD.d=Math.max(10,Math.round((JD.d-(e.shiftKey?.5:.05))*100)/100);else if(k==='e'||k==='E'||k==='Enter'||k===' '){if(!e.repeat)setJadwal();}else if(k==='Escape')S.ui='none';else return false;e.preventDefault();return true;}
  return false;
}
function drawOverlay(ctx){if(S.ui==='drone')dronePanel(ctx);if(S.ui==='jadwal')jadwalPanel(ctx);}
function drawWorld(ctx){pond(ctx,PC.x,PC.y,PR.x,PR.y,Aof(NOW),S.flags.twist);}
const CINE={t:0};
function begin(){P.x=TG.anto.x+60;P.y=TG.anto.y+30;S.ui='cine';CINE.t=0;return [PC.x,PC.y];}
function cineStep(dt){CINE.t+=dt;if(CINE.t>4.6)endCine();return [PC.x,PC.y];}
function drawCine(ctx){
  const {H,hs}=V;
  if(CINE.t<2.3){KT.bigText(ctx,V,'MINGGU LALU: BERSIH',H*.3,48,PAPER);}else{KT.bigText(ctx,V,'HARI INI: 20%',H*.3,56,ALERT);KT.subText(ctx,V,'Besok?',H*.3+34*hs);}
  KT.skipHint(ctx,V,G);
}
function cineEnd(){card('BAB 1','KOLAM MENGHIJAU');}
function jitter(it){return(it.ch==='dewi'&&S.flags.ages)?Math.sin(G.T*30)*1.2:0;}
if(window.__TEST__)window.__C={DR,JD,setJadwal,T60};

return {
  THEORY,THEORY_START:['k4-dasar'],
  id:'kolam-1',judul:'Kolam Menghijau',eyebrow:'Semesta 4, Kebun dan Kolam. Kasus 1',
  lede:'Minggu lalu kolam desa bersih. Hari ini seperlimanya tertutup lumut, dan ikan mulai megap-megap. Warga bilang alami. Kamu tidak yakin.',
  teaser:'<b>Malam minggu di pantai.</b> Seorang pengunjung kehilangan kalung. Satu-satunya bukti: foto buram dari bianglala. <b>Semesta 5 segera.</b>',
  chapter:'Bab 1: Kolam Menghijau',
  WW,WH,SOLIDS,LAMPS:[],CH,TG,
  ints:INTS,buildWorld,objective,stageHint,ACQ,wrongMsg,onAccuseOk,onLensSave,suspects,score,learn,
  onPointer,onKey,drawOverlay,drawWorld,begin,cineStep,drawCine,cineEnd,jitter
};
}
