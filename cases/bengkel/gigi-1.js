/* Semesta 6 (Bengkel Roda Gigi), Kasus 1: Mesin yang Mengamuk.
   Bab 1: aturan rantai lewat rangkaian roda gigi: dθD/dθA = (dθB/dθA)(dθC/dθB)(dθD/dθC).
   Bab 2: aturan rantai pada sepeda: v = (dx/dθroda)(dθroda/dθpedal)(dθpedal/dt). Pilih gigi yang tepat lalu kejar. */
import {kit} from '../../core/kit.js';
export default function create(E){
const {teori,w2s,S,P,G,K,T,V,$,clamp,f0,f1,rngSeed,INK,PAPER,SUN,CORAL,ALERT,BLUE,GOOD,FD,FU,say,toast,addEv,card,sfx,openAccuse,gpOpen,endCine,endCase}=E;
const KT=kit(E),FR=KT.FR;
const fx=(v,d)=>v.toFixed(d).replace('.',',');

/* ---------- model ---------- */
const NA=12,NB=36,NC=48,ND=32,NC_OK=16;           // C asli 16 gigi, ditukar 48
const RW=0.33,CAD=1.4,MAXR=2.5,HF=0.6,STALL=1.2,GAP=20,LH=100,LF=150,VTH=3.5,VTF=6.0;
const VC=2*Math.PI*RW*CAD;                        // m/s per satuan rasio
const FRONT=[32,44],REAR=[11,14,18,24];

const THEORY={
  'k6-dasar':{t:'Roda gigi: laju putar yang diteruskan',sub:'dθB/dθA = NA/NB',h:
    '<p>Dua roda gigi yang bersinggungan memindahkan gigi yang sama banyak. Kalau roda A (N<sub>A</sub> gigi) berputar θ<sub>A</sub>, roda B berputar:</p>'+
    '<span class="eq">N<sub>A</sub>·θ<sub>A</sub> = N<sub>B</sub>·θ<sub>B</sub> &nbsp;⇒&nbsp; θ<sub>B</sub> = '+FR('N<sub>A</sub>','N<sub>B</sub>')+'·θ<sub>A</sub> &nbsp;⇒&nbsp; '+FR('dθ<sub>B</sub>','dθ<sub>A</sub>')+' = '+FR('N<sub>A</sub>','N<sub>B</sub>')+'</span>'+
    '<p>Dua roda pada <b>poros yang sama</b> berputar bersama: turunannya 1.</p>'},
  'k6-rantai':{t:'Aturan rantai',sub:'turunan berantai dikalikan',h:
    '<p>Kalau θ<sub>D</sub> bergantung pada θ<sub>C</sub>, θ<sub>C</sub> pada θ<sub>B</sub>, dan θ<sub>B</sub> pada θ<sub>A</sub>, laju akhirnya adalah <b>perkalian</b> laju tiap mata rantai:</p>'+
    '<span class="eq">'+FR('dθ<sub>D</sub>','dθ<sub>A</sub>')+' = '+FR('dθ<sub>D</sub>','dθ<sub>C</sub>')+' · '+FR('dθ<sub>C</sub>','dθ<sub>B</sub>')+' · '+FR('dθ<sub>B</sub>','dθ<sub>A</sub>')+'</span>'+
    '<p>Dalam notasi fungsi: kalau y = f(g(x)), maka</p>'+
    '<span class="eq">y′ = f′(g(x)) · g′(x)</span>'+
    '<div class="ex"><b>Manual mesin parut.</b> A 12, B 36, C 16, D 32, motor 1800 rpm. Laju drum = 1800 × (12/36) × 1 × (16/32) = 1800 × 1/6 = 300 rpm. Kalau drum berputar 900 rpm, salah satu mata rantai berubah. Ukur tiap tahap dengan engkol.</div>'},
  'k6-komposisi':{t:'Rantai di mana-mana',sub:'fungsi di dalam fungsi',h:
    '<p>Aturan rantai sudah diam-diam kamu pakai di semesta sebelumnya:</p>'+
    '<span class="eq">(sin ωt)′ = cos(ωt) · ω &nbsp;&nbsp; (bianglala)<br>(e<sup>kt</sup>)′ = e<sup>kt</sup> · k &nbsp;&nbsp; (lumut)<br>((3x + 1)⁵)′ = 5(3x + 1)⁴ · 3</span>'+
    '<p>Pola: turunkan fungsi luar dengan isi tetap di dalamnya, lalu kalikan turunan isinya.</p>'+
    '<div class="ex"><b>Contoh.</b> y = √(1 + t²) = (1 + t²)<sup>1/2</sup>. y′ = ½(1 + t²)<sup>−1/2</sup> · 2t = t / √(1 + t²).</div>'},
  'k6-sepeda':{t:'Kecepatan sepeda: tiga mata rantai',sub:'v = r · (Nd/Nb) · 2π · kayuhan',h:
    '<span class="eq">'+FR('dx','dt')+' = '+FR('dx','dθ<sub>roda</sub>')+' · '+FR('dθ<sub>roda</sub>','dθ<sub>pedal</sub>')+' · '+FR('dθ<sub>pedal</sub>','dt')+'</span>'+
    '<p>dx/dθ<sub>roda</sub> = r (jari-jari roda, per radian). dθ<sub>roda</sub>/dθ<sub>pedal</sub> = N<sub>depan</sub>/N<sub>belakang</sub>. dθ<sub>pedal</sub>/dt = 2π × kayuhan per detik.</p>'+
    '<div class="ex"><b>Contoh.</b> r = 0,3 m, gigi 40/20, kayuhan 1 putaran/detik: v = 0,3 × 2 × 2π × 1 ≈ 3,77 m/s. Rasio besar: cepat di jalan datar, tapi berat di tanjakan.</div>'}
};

/* ---------- dunia ---------- */
const WW=2200,WH=1200,RY=640;
const BUILD=[
  {x:120,y:260,w:340,h:200,roof:'#7a5a3a',name:'BENGKEL HARUN',door:'s'},
  {x:1500,y:260,w:340,h:200,roof:'#e8553d',name:'BENGKEL KOH LIONG',door:'s'},
  {x:700,y:820,w:260,h:160,roof:'#9a8fc2',name:'KOS RENDI',door:'n'}
];
const TG={anto:{x:560,y:560},harun:{x:250,y:540},mesin:{x:400,y:540},rendi:{x:830,y:780},liong:{x:1680,y:540},sepeda:{x:1000,y:780},rumah:{x:520,y:780}};
const SOLIDS=BUILD.map(b=>({x:b.x,y:b.y,w:b.w,h:b.h}));
SOLIDS.push({x:420,y:500,w:70,h:30});
const LAMPS=[];for(let x=120;x<WW;x+=320)LAMPS.push({x,y:RY-50});
const CH={
  anto:{n:'Pak Anto',body:'#c9b27a',cap:'#4a6fa5'},
  harun:{n:'Pak Harun',body:'#7a5a3a',cap:'#f4efe1'},
  rendi:{n:'Rendi',body:'#2f7fc1',cap:'#d9a441'},
  liong:{n:'Koh Liong',body:'#e8553d',cap:'#1c2230'}
};
function buildWorld(){
  const c=document.createElement('canvas');c.width=WW;c.height=WH;const g=c.getContext('2d'),R=rngSeed(61);
  KT.ground(g,WW,WH,R,'#9fae7a','#a9b886','#93a26e');
  g.fillStyle='#4a4f5c';g.fillRect(0,RY,WW,110);g.fillStyle=PAPER;for(let x=0;x<WW;x+=80)g.fillRect(x+10,RY+52,40,6);
  KT.paths(g,BUILD,RY,RY+110,'#b9ad94');
  for(const b of BUILD)KT.building(g,b);
  // mesin parut
  g.fillStyle='#6f7b8c';g.strokeStyle=INK;g.lineWidth=3;g.fillRect(420,500,70,30);g.strokeRect(420,500,70,30);
  g.fillStyle='#d9d2bd';g.beginPath();g.arc(475,515,12,0,7);g.fill();g.stroke();
  KT.sign(g,'MESIN PARUT',455,482);
  // sepeda Rendi
  g.strokeStyle=INK;g.lineWidth=3;g.beginPath();g.arc(985,800,13,0,7);g.arc(1025,800,13,0,7);g.stroke();g.beginPath();g.moveTo(985,800);g.lineTo(1002,786);g.lineTo(1025,800);g.moveTo(1002,786);g.lineTo(1000,775);g.stroke();
  KT.lamps(g,LAMPS);
  KT.trees(g,R,WW,WH,[...BUILD.map(b=>[b.x-50,b.y-50,b.w+100,b.h+100]),[0,RY-80,WW,270]],Object.values(TG),SOLIDS,30);
  return c;
}

/* ---------- engkol mesin (overlay) ---------- */
const EK={a:0,drag:null,ok:null,no:null,rs:null,c:null};
function openEngkol(){S.ui='engkol';K.u=K.d=K.l=K.r=false;T.x=T.y=0;teori('k6-rantai');}
function panel(maxW,maxH){const {W,H,hs}=V,top=8,w=Math.min(maxW*hs,W-16),h=Math.min(maxH*hs*(W<600?1.5:1),H-top-8);return {w,h,x:(W-w)/2,y:top+Math.max(0,(H-top-8-h)/2),hs};}
function dial(ctx,cx,cy,r,turns,label,col,hs){
  ctx.fillStyle='#fff';ctx.strokeStyle=INK;ctx.lineWidth=3;ctx.beginPath();ctx.arc(cx,cy,r,0,7);ctx.fill();ctx.stroke();
  for(let i=0;i<12;i++){const a=i/12*2*Math.PI;ctx.beginPath();ctx.moveTo(cx+Math.sin(a)*r*.82,cy-Math.cos(a)*r*.82);ctx.lineTo(cx+Math.sin(a)*r,cy-Math.cos(a)*r);ctx.stroke();}
  const a=turns*2*Math.PI;ctx.strokeStyle=col;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.sin(a)*r*.75,cy-Math.cos(a)*r*.75);ctx.stroke();
  ctx.fillStyle=INK;ctx.beginPath();ctx.arc(cx,cy,5,0,7);ctx.fill();
  KT.txt(ctx,label,cx,cy+r+18*hs,'700 '+Math.round(12*hs)+'px '+FU,PAPER,'center');
  KT.txt(ctx,fx(turns,2)+' putaran',cx,cy+r+36*hs,'800 '+Math.round(14*hs)+'px '+FU,col===BLUE?'#9cc8ff':'#8fe3a0','center');
}
function engkolPanel(ctx){
  const {w,h,x,y,hs}=panel(820,430),f=Math.round(14*hs);KT.box(ctx,x,y,w,h);
  KT.txt(ctx,'MESIN PARUT: ENGKOL MANUAL',x+14,y+24*hs,'800 '+Math.round(16*hs)+'px '+FD);
  KT.txt(ctx,'Rumah roda gigi tertutup. Hanya jarum poros yang terlihat.',x+14,y+44*hs,'600 '+Math.round(12*hs)+'px '+FU);
  const tA=EK.a/(2*Math.PI),tB=tA*NA/NB,tD=tB*NC/ND;
  const r=Math.min(w*.1,h*.17),yy=y+h*.42;
  // engkol motor A
  const ax=x+w*.16;EK.c={x:ax,y:yy};
  ctx.fillStyle='#9aa3b2';ctx.strokeStyle=INK;ctx.lineWidth=3;ctx.beginPath();ctx.arc(ax,yy,r*1.1,0,7);ctx.fill();ctx.stroke();
  for(let i=0;i<NA;i++){const a=EK.a+i/NA*2*Math.PI;ctx.fillStyle='#6f7b8c';ctx.save();ctx.translate(ax+Math.sin(a)*r*1.1,yy-Math.cos(a)*r*1.1);ctx.rotate(a);ctx.fillRect(-5,-8,10,10);ctx.restore();}
  const hx=ax+Math.sin(EK.a)*r*.8,hy=yy-Math.cos(EK.a)*r*.8;ctx.strokeStyle=INK;ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(ax,yy);ctx.lineTo(hx,hy);ctx.stroke();
  ctx.fillStyle=CORAL;ctx.beginPath();ctx.arc(hx,hy,10*hs,0,7);ctx.fill();ctx.stroke();
  KT.txt(ctx,'poros A (motor)',ax,yy+r*1.1+18*hs,'700 '+Math.round(12*hs)+'px '+FU,INK,'center');
  KT.txt(ctx,fx(tA,2)+' putaran',ax,yy+r*1.1+36*hs,'800 '+Math.round(14*hs)+'px '+FU,CORAL,'center');
  // rumah roda gigi
  const bx=x+w*.32,bw=w*.62,bt=yy-r*1.3,bhh=r*2.3+44*hs;ctx.fillStyle='#4a4f5c';ctx.fillRect(bx,bt,bw,bhh);ctx.strokeStyle=INK;ctx.lineWidth=3;ctx.strokeRect(bx,bt,bw,bhh);
  ctx.strokeStyle='rgba(255,255,255,.15)';for(let i=0;i<8;i++){ctx.beginPath();ctx.moveTo(bx+i*bw/8,bt);ctx.lineTo(bx+i*bw/8+20,bt+bhh);ctx.stroke();}
  dial(ctx,bx+bw*.3,yy,r,tB,'poros B dan C',BLUE,hs);
  dial(ctx,bx+bw*.75,yy,r,tD,'drum D',GOOD,hs);
  KT.txt(ctx,'Manual: A 12 gigi, B 36, C 16, D 32. C seporos dengan B.',x+14,y+h-74*hs,'700 '+Math.round(12.5*hs)+'px '+FU);
  KT.txt(ctx,G.coarse?'Putar gagang merah melingkar.':'Putar gagang merah (seret), atau panah ←→.',x+14,y+h-55*hs,'600 '+Math.round(11.5*hs)+'px '+FU);
  const bh=36*hs;EK.no=KT.btn(ctx,{x:x+14,y:y+h-bh-8,w:90*hs,h:bh},'Tutup',false,f);EK.rs=KT.btn(ctx,{x:x+24+90*hs,y:y+h-bh-8,w:90*hs,h:bh},'Nol-kan',false,f);
  EK.ok=KT.btn(ctx,{x:x+w-160*hs-14,y:y+h-bh-8,w:160*hs,h:bh},'Catat jarum',true,f);
}
function catat(){
  const tA=EK.a/(2*Math.PI);
  if(Math.abs(tA)<1){toast('Putar engkol minimal satu putaran penuh dulu');return;}
  const tB=tA*NA/NB,tD=tB*NC/ND;
  addEv({id:'engkol',type:'meas',title:'Catatan jarum engkol',text:'A: '+fx(tA,2)+' putaran, B dan C: '+fx(tB,2)+', drum D: '+fx(tD,2)+'.',meta:{kind:'engkol',tA,tB,tD}});
  S.flags.ukur=true;sfx.ev();toast('Jarum dicatat. Hitung laju tiap tahap.');
}

/* ---------- sepeda (overlay pilih gigi + balapan) ---------- */
const SP={f:44,r:11,btns:[],go:null,no:null,tries:0,sim:null};
function openSepeda(){S.ui='sepeda';K.u=K.d=K.l=K.r=false;T.x=T.y=0;teori('k6-sepeda');
  if(!S.evidence.some(e=>e.id==='sepeda'))addEv({id:'sepeda',type:'doc',title:'Sepeda di depan kos Rendi',text:'Sepeda balap milik Rendi. Piringan depan tinggal 32 dan 44 gigi. Dudukan piringan ketiga, 48 gigi, KOSONG.'});}
function sepedaPanel(ctx){
  const {w,h,x,y,hs}=panel(760,440),f=Math.round(14*hs);KT.box(ctx,x,y,w,h);
  KT.txt(ctx,'PILIH GIGI, LALU KEJAR!',x+14,y+24*hs,'800 '+Math.round(17*hs)+'px '+FD,ALERT);
  const L=['Jari-jari roda 0,33 m. Kakimu paling cepat 1,4 putaran pedal per detik.','Rute: tanjakan 100 m, lalu jalan datar 150 m. Pencuri unggul 20 m.','Pencuri: 3,5 m/s di tanjakan, 6 m/s di jalan datar.','Di tanjakan, kayuhanmu turun jadi 60%. Rasio depan/belakang di atas 2,5 terlalu berat: kamu harus menuntun (1,2 m/s).','Tuas oper gigi macet setelah dipilih. Satu pilihan untuk seluruh rute.'];
  L.forEach((l,i)=>KT.txt(ctx,l,x+14,y+(48+i*19)*hs,(i===3?'700 ':'600 ')+Math.round(12*hs)+'px '+FU,i===3?ALERT:INK));
  SP.btns=[];const bw=70*hs,bh=36*hs,by=y+160*hs;
  KT.txt(ctx,'Depan:',x+14,by+bh*.66,'800 '+f+'px '+FU);
  FRONT.forEach((n,i)=>{const r={x:x+100*hs+i*(bw+10),y:by,w:bw,h:bh,k:'f',v:n};KT.btn(ctx,r,String(n),SP.f===n,f);SP.btns.push(r);});
  KT.txt(ctx,'Belakang:',x+14,by+bh*1.66+12*hs,'800 '+f+'px '+FU);
  REAR.forEach((n,i)=>{const r={x:x+100*hs+i*(bw+10),y:by+bh+12*hs,w:bw,h:bh,k:'r',v:n};KT.btn(ctx,r,String(n),SP.r===n,f);SP.btns.push(r);});
  KT.txt(ctx,'Pilihan: '+SP.f+' / '+SP.r,x+w-14,by+bh*.66,'800 '+Math.round(18*hs)+'px '+FU,'#c25a1c','right');
  if(SP.msg)KT.txt(ctx,SP.msg,x+14,y+h-62*hs,'800 '+Math.round(12.5*hs)+'px '+FU,ALERT);
  const b2=42*hs;SP.no=KT.btn(ctx,{x:x+14,y:y+h-b2-10,w:90*hs,h:b2},'Tutup',false,f);SP.go=KT.btn(ctx,{x:x+w-170*hs-14,y:y+h-b2-10,w:170*hs,h:b2},'GAS!',true,Math.round(20*hs));
}
function startRace(){
  const ratio=SP.f/SP.r;SP.tries++;S.ui='balap';SP.sim={ratio,xp:0,xt:GAP,t:0,end:null};sfx.shot();
}
function raceTick(dt){
  const s=SP.sim;if(!s||s.end)return;
  const n=Math.ceil(dt*4/0.01),h=dt*4/n;
  for(let i=0;i<n&&!s.end;i++){
    const vp=s.xp<LH?(s.ratio<=MAXR?VC*s.ratio*HF:STALL):VC*s.ratio,vt=s.xt<LH?VTH:VTF;
    s.vp=vp;s.vt=vt;s.xp+=vp*h;s.xt+=vt*h;s.t+=h;
    if(s.xp>=s.xt){s.end='tangkap';s.after=0;}else if(s.xt>=LH+LF){s.end='lolos';s.after=0;}
  }
}
function raceDone(){
  const s=SP.sim;
  if(s.end==='tangkap'){S.racePts=[300,180,90][SP.tries-1]||90;caughtLiong();return;}
  sfx.bad();
  if(SP.tries>=3){S.racePts=30;SP.msg='';say([['Jalan','Koh Liong lolos... lalu terpeleset di tikungan pasar. Warga menahannya.']],caughtLiong);S.ui='none';return;}
  S.ui='sepeda';SP.msg='Lolos! Gigi '+SP.f+'/'+SP.r+' kurang tepat. Koh Liong berputar balik, coba lagi.';
}
function caughtLiong(){
  S.ui='none';sfx.win();G.flash=.5;const f=S.flags;
  say([['liong','Iya, iya! Aku yang bawa roda gigi asli mesin Harun. Tapi bukan aku yang membongkar mesinnya!','panik'],['liong','Aku beli roda gigi 16 itu dari anak muda yang kerja di bengkel Harun. Dia bilang bisa bikin mesin Harun "rusak sendiri".','panik'],['liong','Mesin Harun rusak, pelanggan pindah ke bengkelku. Itu saja.','panik']],
    ()=>{f.tangkap=true;addEv({id:'liong',type:'witness',title:'Pengakuan Koh Liong',text:'Membeli roda gigi C asli (16 gigi) dari "anak muda yang kerja di bengkel Harun". Tidak membongkar mesin sendiri.'});});
}
function balapPanel(ctx){
  const {w,h,x,y,hs}=panel(820,400),f=Math.round(14*hs),s=SP.sim;KT.box(ctx,x,y,w,h);
  KT.txt(ctx,'KEJAR! Gigi '+SP.f+'/'+SP.r,x+14,y+24*hs,'800 '+Math.round(17*hs)+'px '+FD);
  const gx=x+30*hs,gw=w-60*hs,base=y+h*.72,top=y+h*.32,X=v=>gx+v/(LH+LF)*gw,Yr=v=>v<LH?base-(v/LH)*(base-top):top;
  ctx.fillStyle='#93a26e';ctx.beginPath();ctx.moveTo(gx,base+10);ctx.lineTo(X(0),Yr(0));ctx.lineTo(X(LH),top);ctx.lineTo(X(LH+LF),top);ctx.lineTo(X(LH+LF),base+10);ctx.closePath();ctx.fill();
  ctx.strokeStyle=INK;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(X(0),Yr(0));ctx.lineTo(X(LH),top);ctx.lineTo(X(LH+LF),top);ctx.stroke();
  KT.txt(ctx,'tanjakan',X(LH/2),base-12*hs,'700 '+Math.round(11*hs)+'px '+FU,INK,'center');KT.txt(ctx,'FINIS',X(LH+LF)-4,top-10*hs,'800 '+Math.round(12*hs)+'px '+FD,ALERT,'right');
  const rider=(v,col,lab)=>{const px=X(Math.min(v,LH+LF)),py=Yr(Math.min(v,LH+LF))-14*hs;ctx.fillStyle=col;ctx.strokeStyle=INK;ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(px,py,10*hs,0,7);ctx.fill();ctx.stroke();ctx.beginPath();ctx.arc(px-9*hs,py+12*hs,6*hs,0,7);ctx.arc(px+9*hs,py+12*hs,6*hs,0,7);ctx.stroke();KT.txt(ctx,lab,px,lab==='Kamu'?py+36*hs:py-16*hs,'800 '+Math.round(12*hs)+'px '+FU,INK,'center');};
  rider(s.xt,'#e8553d','Koh Liong');rider(s.xp,SUN,'Kamu');
  const stallNow=s.xp<LH&&s.ratio>MAXR;
  KT.txt(ctx,'kamu '+fx(s.vp||0,1)+' m/s   Koh Liong '+fx(s.vt||0,1)+' m/s   jarak '+fx(Math.max(0,s.xt-s.xp),1)+' m',x+14,y+h-46*hs,'800 '+f+'px '+FU);
  if(stallNow)KT.txt(ctx,'TERLALU BERAT! Kamu menuntun sepeda.',x+14,y+h-22*hs,'800 '+f+'px '+FU,ALERT);
  if(s.end)KT.bigText(ctx,V,s.end==='tangkap'?'TERTANGKAP!':'LOLOS...',y+h*.2,44,s.end==='tangkap'?GOOD:ALERT);
}

/* ---------- interaksi ---------- */
const INTS=[
  {id:'anto',ch:'anto',t:TG.anto,label:'Bicara dengan Pak Anto',act:talkAnto},
  {id:'harun',ch:'harun',t:TG.harun,label:'Bicara dengan Pak Harun',act:()=>say([['harun','Mesin parutku mengamuk! Drumnya berputar 900 rpm, tiga kali dari biasanya. Kelapa sampai terlempar kena pelanggan.','panik'],['harun','Motornya normal, 1800 rpm. Pasti ada yang mengutak-atik roda gigi di dalam. Manualnya ada di mesin.','curiga'],['harun','Kunci rumah roda gigi cuma aku dan Rendi, muridku, yang pegang.','curiga']],
    ()=>addEv({id:'w-harun',type:'witness',title:'Pak Harun',text:'Drum 900 rpm, seharusnya 300. Motor normal 1800 rpm. Kunci rumah roda gigi: Pak Harun dan Rendi.'}))},
  {id:'mesin',t:TG.mesin,label:'Engkol mesin parut',icon:'⚙',when:()=>S.flags.case,act:openEngkol},
  {id:'rendi',ch:'rendi',t:TG.rendi,label:'Bicara dengan Rendi',act:()=>say(S.flags.tangkap?[['rendi','A-aku cuma butuh uang buat kuliah, Detektif...','panik']]:[['rendi','Saya murid Pak Harun. Kemarin saya libur, sepedaan seharian.','senyum']],
    ()=>addEv({id:'w-rendi',type:'witness',title:'Rendi',text:'Murid Pak Harun, pegang kunci rumah roda gigi. Mengaku libur dan bersepeda seharian kemarin.'}))},
  {id:'liong',ch:'liong',t:TG.liong,label:'Bicara dengan Koh Liong',when:()=>!S.flags.acc1||S.flags.tangkap,act:()=>say(S.flags.tangkap?[['liong','Aku sudah bilang semua, Detektif.','panik']]:[['liong','Mesin Harun rusak? Wah, kasihan. Pelanggannya boleh ke sini.','senyum']])},
  {id:'sepeda',t:TG.sepeda,label:'Ambil sepeda dan kejar',icon:'!',when:()=>S.flags.twist&&!S.flags.tangkap,act:openSepeda}
];
function talkAnto(){
  const f=S.flags;
  if(!f.case){
    say([['anto','Detektif {name}. Ada yang mengubah mesin parut Pak Harun sampai berputar tiga kali lebih cepat. Untung tak ada yang terluka parah.','curiga'],
      ['anto','Rumah roda giginya tertutup dan dikunci. Tapi engkolnya bisa diputar manual, dan jarum tiap poros terlihat.'],
      ['anto','Cari tahu roda gigi mana yang ditukar, tanpa membongkar.']],
      ()=>{f.case=true;addEv({id:'kasus',type:'doc',title:'Mesin parut mengamuk',text:'Drum 900 rpm, seharusnya 300 rpm. Rumah roda gigi tertutup.'});});
  }else if(!f.ukur)say([['anto','Putar engkol beberapa putaran, catat jarumnya. Bandingkan laju tiap tahap dengan manual.']]);
  else if(!f.acc1)say([['anto','Roda gigi mana yang ditukar?']],()=>openAccuse(1));
  else if(!f.twist){sfx.twist();G.shake=.4;say([['anto','Kita buka rumahnya... Roda C sekarang 48 gigi. Dan ini bukan roda gigi mesin. Ini PIRINGAN SEPEDA balap!','curiga'],['Warga','DETEKTIF! Ada yang kabur bawa karung dari belakang bengkel, naik sepeda ke arah tanjakan!','panik'],['anto','Pakai sepeda di depan kos Rendi! Pilih giginya dengan benar. Sekali salah, dia lolos.','panik']],
    ()=>{f.twist=true;card('BAB 2','KEJAR DI TANJAKAN');$('chap').textContent='Bab 2: Kejar di Tanjakan';});}
  else if(!f.tangkap)say([['anto','Sepedanya di depan kos Rendi. Hitung kecepatannya untuk tiap pilihan gigi!','panik']]);
  else say([['anto','Koh Liong membeli roda gigi asli. Tapi siapa yang memasang piringan sepeda ke mesin?']],()=>openAccuse(2));
}

/* ---------- tuduhan ---------- */
const ACQ={
  1:{title:'Laporan pertama',q:'Roda gigi mana yang ditukar?',
    who:[['C','Roda C (seporos dengan B)'],['B','Roda B'],['A','Roda A (motor)']],
    why:[['ok','Tahap A→B cocok manual (1/3), tapi tahap B→D bukan 1/2 melainkan 3/2. Rantai: 1/3 × 3/2 = 1/2, jadi drum 1800 × 1/2 = 900 rpm. D dilas ke drum, jadi C yang berubah: 3/2 × 32 = 48 gigi.'],['tambah','Rasio total = 1/3 + 1/2. Drum lebih cepat karena rasio dijumlahkan.'],['motor','Drum tiga kali lebih cepat, jadi motornya yang diganti.'],['B','Roda B paling besar, jadi paling mungkin ditukar.']],ans:'C'},
  2:{title:'Tuduhan akhir',q:'Siapa yang memasang piringan sepeda ke mesin parut?',
    who:[['rendi','Rendi'],['liong','Koh Liong'],['harun','Pak Harun']],
    why:[['ok','Roda C baru adalah piringan 48 gigi. Sepeda Rendi kehilangan piringan 48, Rendi pegang kunci rumah roda gigi, dan Koh Liong membeli roda asli dari "murid Harun".'],['kabur','Koh Liong kabur, jadi dia yang memasang.'],['asuransi','Pak Harun merusak mesinnya sendiri.'],['kunci','Siapa pun bisa membuka mesin.']],ans:'rendi'}
};
function wrongMsg(n,A){
  if(n===1){if(A.who==='A')return 'Pak Anto: "Motornya normal 1800 rpm, dan jarum poros A cocok." (-100)';if(A.who==='B')return 'Pak Anto: "Tahap A→B cocok dengan manual. Masalahnya di tahap berikutnya." (-100)';return 'Pak Anto: "Rodanya benar. Tapi turunan berantai itu ditambah atau dikali?" (-100)';}
  if(A.who==='liong')return 'Pak Anto: "Koh Liong membeli, bukan memasang. Rumah roda gigi dikunci." (-100)';
  if(A.who==='harun')return 'Pak Anto: "Lalu kenapa piringan sepeda Rendi yang hilang?" (-100)';
  return 'Pak Anto: "Orangnya benar, tapi bukti kuncinya bukan itu." (-100)';
}
function onAccuseOk(n){
  if(n===1){S.flags.acc1=true;sfx.ev();teori('k6-komposisi');say([['anto','Roda C. Laju berantai dikalikan, bukan dijumlahkan. Mari buka rumahnya.','senyum']]);}
  else finale();
}
function finale(){
  sfx.win();
  say([['anto','Rendi. Piringan 48 di mesin ini dari sepedamu.','curiga'],
    ['rendi','...Koh Liong bayar saya buat bikin mesin Pak Harun rusak "sendiri". Saya pikir ganti satu roda gigi tidak akan ketahuan.','panik'],
    ['harun','Kamu muridku, Ren...','panik'],
    ['anto','Satu roda gigi kecil, tiga kali lebih cepat. Rantai turunan tidak bisa dibohongi. Kerja bagus, Detektif {name}.','senyum']],endCase);
}
function suspects(chip){const f=S.flags;if(f.case){chip('Rendi','');chip('Koh Liong',f.tangkap?'hot':'');}if(f.twist)chip('Pengendara misterius',f.tangkap?'x':'hot');}

/* ---------- alur ---------- */
function objective(){
  const f=S.flags;
  if(!f.case)return{t:'Temui Pak Anto di bengkel Harun.',p:TG.anto};
  if(!S.evidence.some(e=>e.id==='w-harun'))return{t:'Dengar cerita Pak Harun.',p:TG.harun};
  if(!f.ukur)return{t:'Engkol mesin parut. Catat jarum tiap poros.',p:TG.mesin};
  if(!f.acc1)return{t:'Lapor Pak Anto: roda mana yang ditukar?',p:TG.anto};
  if(!f.twist)return{t:'Lapor Pak Anto.',p:TG.anto};
  if(!f.tangkap)return{t:'Ambil sepeda di depan kos Rendi dan kejar!',p:TG.sepeda};
  return{t:'Kamu tahu siapa pemasangnya. Temui Pak Anto.',p:TG.anto};
}
function stageHint(){
  const f=S.flags;
  if(!f.acc1)return['acc1','Laju tiap tahap = putaran keluar dibagi putaran masuk. Bandingkan dengan manual: A→B 12/36, B→C 1, C→D 16/32.'];
  if(!f.tangkap)return['race','Hitung v = 2π × 0,33 × 1,4 × (depan/belakang). Di datar harus lebih dari 6 m/s, di tanjakan 60%-nya harus lebih dari 3,5, dan rasio tidak boleh lebih dari 2,5.'];
  return['final','Dari sepeda siapa piringan 48 itu?'];
}

/* ---------- skor ---------- */
function score(el){
  const e=S.evidence.find(x=>x.id==='engkol'),pe=e?(Math.abs(e.meta.tA)>=3?300:200):0;
  const items=[['Pengukuran engkol (maks 300)',pe,[[e?('A '+fx(e.meta.tA,2)+' putaran'+(Math.abs(e.meta.tA)>=3?', cukup panjang untuk teliti':', putar lebih lama untuk teliti')):'belum',pe]]],['Kejar sepeda, percobaan ke-'+SP.tries+' (maks 300)',S.racePts||0],['Penalaran: dua tuduhan benar (maks 400)',400],['Petunjuk ('+S.hints+')',-60*S.hints],['Salah tuduh ('+S.wrong+')',-100*S.wrong]];
  return {items,detail:{detik:el,engkol:e&&e.meta.tA,balap:SP.tries,gigi:SP.f+'/'+SP.r,petunjuk:S.hints,salah:S.wrong}};
}
function learn(){return[
  'Roda gigi: <code>dθB/dθA = NA/NB</code>. Tahap-tahap berantai <b>dikalikan</b>: <code>dθD/dθA = (1/3)·1·(3/2) = 1/2</code>, jadi drum 900 rpm.',
  'Aturan rantai: <code>(f(g(x)))′ = f′(g(x))·g′(x)</code>. Sama dengan <code>(sin ωt)′ = ω cos ωt</code> dan <code>(eᵏᵗ)′ = k·eᵏᵗ</code> di semesta sebelumnya.',
  'Sepeda: <code>v = r · (Nd/Nb) · 2π · kayuhan</code>. Hanya 32/14 dan 44/18 yang cukup cepat di datar sekaligus cukup ringan di tanjakan.'
];}

/* ---------- input & gambar ---------- */
function onPointer(type,e){
  const x=e.clientX,y=e.clientY;
  if(S.ui==='engkol'){
    if(type==='down'){if(KT.inR(EK.ok,x,y)){catat();return true;}if(KT.inR(EK.no,x,y)){S.ui='none';return true;}if(KT.inR(EK.rs,x,y)){EK.a=0;return true;}
      EK.drag={id:e.pointerId,ang:Math.atan2(x-EK.c.x,-(y-EK.c.y))};return true;}
    if(type==='move'&&EK.drag&&EK.drag.id===e.pointerId){const a=Math.atan2(x-EK.c.x,-(y-EK.c.y));let d=a-EK.drag.ang;if(d>Math.PI)d-=2*Math.PI;if(d<-Math.PI)d+=2*Math.PI;EK.a+=d;EK.drag.ang=a;return true;}
    if(type==='up')EK.drag=null;return true;
  }
  if(S.ui==='sepeda'){
    if(type==='down'){for(const b of SP.btns)if(KT.inR(b,x,y)){if(b.k==='f')SP.f=b.v;else SP.r=b.v;return true;}
      if(KT.inR(SP.go,x,y)){SP.msg='';startRace();return true;}if(KT.inR(SP.no,x,y)){S.ui='none';return true;}}
    return true;
  }
  if(S.ui==='balap')return true;
  return false;
}
function onKey(e){
  const k=e.key;
  if(S.ui==='engkol'){if(k==='ArrowRight'||k==='d'||k==='D')EK.a+=(e.shiftKey?Math.PI:Math.PI/18);else if(k==='ArrowLeft'||k==='a'||k==='A')EK.a-=(e.shiftKey?Math.PI:Math.PI/18);
    else if(k==='e'||k==='E'||k==='Enter'||k===' '){if(!e.repeat)catat();}else if(k==='Escape')S.ui='none';else return false;e.preventDefault();return true;}
  if(S.ui==='sepeda'){if(k==='Escape')S.ui='none';else if((k==='e'||k==='E'||k==='Enter')&&!e.repeat){SP.msg='';startRace();}else return false;e.preventDefault();return true;}
  if(S.ui==='balap'){e.preventDefault();return true;}
  return false;
}
function tick(dt){
  if(S.ui==='balap'&&SP.sim){raceTick(dt);if(SP.sim.end){SP.sim.after+=dt;if(SP.sim.after>1.4)raceDone();}}
}
function drawOverlay(ctx){if(S.ui==='engkol')engkolPanel(ctx);if(S.ui==='sepeda')sepedaPanel(ctx);if(S.ui==='balap'&&SP.sim)balapPanel(ctx);}
const CINE={t:0};
function begin(){P.x=TG.anto.x+60;P.y=TG.anto.y+30;S.ui='cine';CINE.t=0;return [TG.mesin.x,TG.mesin.y];}
function cineStep(dt){CINE.t+=dt;if(CINE.t>4.4)endCine();if(CINE.t>.6&&CINE.t<4)G.shake=Math.max(G.shake,.08);return [TG.mesin.x,TG.mesin.y];}
function drawCine(ctx){const {H,hs}=V;if(CINE.t<2.2){KT.bigText(ctx,V,'BRRRRRRT!',H*.3,64,ALERT);}else{KT.bigText(ctx,V,'900 rpm',H*.3,58,SUN);KT.subText(ctx,V,'Seharusnya 300.',H*.3+34*hs);}KT.skipHint(ctx,V,G);}
function cineEnd(){card('BAB 1','MESIN MENGAMUK');}
function jitter(it){return(it.ch==='rendi'&&S.flags.tangkap)?Math.sin(G.T*30)*1.2:0;}
if(window.__TEST__)window.__C={EK,SP,catat,startRace};

return {
  THEORY,THEORY_START:['k6-dasar'],
  id:'gigi-1',judul:'Mesin yang Mengamuk',eyebrow:'Semesta 6, Bengkel Roda Gigi. Kasus 1',
  lede:'Mesin parut kelapa di bengkel Pak Harun tiba-tiba berputar tiga kali lebih cepat. Rumah roda giginya terkunci rapat. Seseorang menukar satu roda gigi.',
  teaser:'<b>Lab Elektronika, kampus vokasi.</b> Sebuah kapasitor meledak saat praktikum. Laporan bilang "kecelakaan". Osiloskop bilang lain. <b>Semesta 7 segera.</b>',
  chapter:'Bab 1: Mesin Mengamuk',
  WW,WH,SOLIDS,LAMPS,CH,TG,
  ints:INTS,buildWorld,objective,stageHint,ACQ,wrongMsg,onAccuseOk,suspects,score,learn,
  onPointer,onKey,tick,drawOverlay,begin,cineStep,drawCine,cineEnd,jitter
};
}
