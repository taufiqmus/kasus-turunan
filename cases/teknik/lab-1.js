/* Semesta 7 (Teknik), Kasus 1: Lab yang Terbakar. Semua aturan bertemu.
   Bab 1: pengisian kapasitor v = Vs(1 − e^{−t/τ}). Dengan aturan rantai v′ = (Vs − v)/τ, jadi Vs = v + τ·v′.
          Daya p = v·i (aturan perkalian). Replika di meja praktikum.
   Bab 2: pendinginan Newton T′ = −k(T − Ta) dan ln untuk waktu sejak dipakai; lalu pengosongan v = V0·e^{−t/RC}. */
import {kit} from '../../core/kit.js';
export default function create(E){
const {teori,w2s,S,P,G,K,T,V,$,clamp,f0,f1,rngSeed,INK,PAPER,SUN,CORAL,ALERT,BLUE,GOOD,FD,FU,say,toast,addEv,card,sfx,openAccuse,gpOpen,endCine,endCase}=E;
const KT=kit(E),FR=KT.FR;
const fx=(v,d)=>v.toFixed(d).replace('.',',');

/* ---------- model ---------- */
const VS=36,TAU=1,VMAX=25,TBOOM=Math.log(VS/(VS-VMAX));         // 1,19 s
const vOf=t=>VS*(1-Math.exp(-t/TAU));
const TA=27,T0=80,KC=0.05,ELAPSED=18;                              // menit
const Tof=m=>TA+(T0-TA)*Math.exp(-KC*(ELAPSED+m));                 // m: menit relatif sekarang (≤ 0)
const BANK={V0:36,C:0.0047,fuse:0.5,relay:1.0,safe:5},RES=[47,68,100,150,220];

const THEORY={
  'k7-dasar':{t:'Kapasitor yang terisi',sub:'v = Vs(1 − e^{−t/τ})',h:
    '<p>Kapasitor C diisi lewat resistor R dari catu daya Vs. Tegangannya naik cepat di awal, lalu melambat mendekati Vs:</p>'+
    '<span class="eq">v(t) = Vs·(1 − e<sup>−t/τ</sup>), &nbsp; τ = R·C</span>'+
    '<p>Lembar praktikum: R = 1 kΩ, C = 1000 µF, jadi τ = 1 s. Tegangan maksimum kapasitor elektrolit ini 25 V. Lebih dari itu, ia menggembung dan meledak.</p>'},
  'k7-arus':{t:'Arus = C × turunan tegangan',sub:'Vs = v + τ·v′',h:
    '<p>Arus kapasitor sebanding laju perubahan tegangannya:</p><span class="eq">i(t) = C·'+FR('dv','dt')+'</span>'+
    '<p>Turunkan v(t) dengan aturan rantai pada eksponen −t/τ:</p>'+
    '<span class="eq">v′(t) = Vs·'+FR('1','τ')+'·e<sup>−t/τ</sup> = '+FR('Vs − v(t)','τ')+'</span>'+
    '<p>Susun ulang. Catu daya bisa dihitung dari <b>satu titik</b> di grafik, tanpa melihat ujungnya:</p>'+
    '<span class="eq">Vs = v + τ·v′</span>'+
    '<div class="ex"><b>Contoh.</b> τ = 2 s. Di suatu saat v = 6 V dan v′ = 3 V/s. Maka Vs = 6 + 2 × 3 = 12 V.</div>'},
  'k7-daya':{t:'Daya: perkalian lagi',sub:'p = v·i',h:
    '<p>Daya yang masuk ke kapasitor adalah tegangan dikali arus. Keduanya berubah terhadap waktu, jadi pakai aturan perkalian:</p>'+
    '<span class="eq">p = v·i &nbsp;&nbsp; p′ = v′·i + v·i′</span>'+
    '<p>Dengan x = e<sup>−t/τ</sup>: p = '+FR('Vs²','R')+'·(1 − x)·x. Nilainya maksimum saat x = ½, yaitu ketika v = Vs/2 dan t = τ·ln 2.</p>'},
  'k7-dingin':{t:'Hukum pendinginan Newton',sub:'T′ = −k(T − Ta)',h:
    '<p>Benda panas mendingin lebih cepat kalau selisihnya dengan suhu ruang lebih besar:</p>'+
    '<span class="eq">T′(t) = −k·(T − Ta) &nbsp;⇒&nbsp; T(t) = Ta + (T₀ − Ta)·e<sup>−kt</sup></span>'+
    '<p>Dari satu pengukuran T dan T′, kamu dapat k. Lalu waktu sejak benda sepanas T₀ bisa dihitung dengan ln:</p>'+
    '<span class="eq">k = '+FR('−T′','T − Ta')+' &nbsp;&nbsp; t = '+FR('1','k')+'·ln '+FR('T₀ − Ta','T − Ta')+'</span>'+
    '<div class="ex"><b>Contoh.</b> Ta = 25°C, sekarang T = 45°C, T′ = −2°C/menit. k = 2/20 = 0,1 per menit. Kalau suhu kerja maksimum 85°C: t = 10·ln(60/20) ≈ 11 menit yang lalu.</div>'},
  'k7-buang':{t:'Mengosongkan kapasitor dengan aman',sub:'v = V₀·e^{−t/RC}',h:
    '<span class="eq">v(t) = V₀·e<sup>−t/RC</sup> &nbsp;&nbsp; i(t) = −C·v′ = '+FR('V₀','R')+'·e<sup>−t/RC</sup></span>'+
    '<p>Dua syarat yang bertolak belakang:</p>'+
    '<span class="eq">arus awal: '+FR('V₀','R')+' ≤ batas sekring &nbsp; ⇒ R tidak boleh terlalu kecil<br>waktu aman: R·C·ln '+FR('V₀','V<sub>aman</sub>')+' ≤ batas waktu &nbsp; ⇒ R tidak boleh terlalu besar</span>'},
  'k7-peta':{t:'Peta semua aturan turunan',sub:'tujuh semesta',h:
    '<span class="eq">konstanta: (c)′ = 0 &nbsp; pangkat: (xⁿ)′ = n·xⁿ⁻¹ &nbsp; (S1, S2)<br>jumlah/selisih: (f ± g)′ = f′ ± g′ &nbsp; (S2)<br>perkalian: (fg)′ = f′g + fg′ &nbsp; pembagian: (f/g)′ = (f′g − fg′)/g² &nbsp; (S3, S7)<br>eksponen: (eˣ)′ = eˣ &nbsp; logaritma: (ln x)′ = 1/x &nbsp; akar: (√x)′ = 1/(2√x) &nbsp; (S4, S7)<br>trigonometri: (sin)′ = cos, (cos)′ = −sin, (tan)′ = 1/cos² &nbsp; (S5)<br>rantai: (f(g(x)))′ = f′(g(x))·g′(x) &nbsp; (S6, S7)</span>'+
    '<p>Di kasus ini semuanya bekerja sekaligus: eksponen di dalam rantai, perkalian untuk daya, ln untuk waktu.</p>'}
};

/* ---------- dunia ---------- */
const WW=2000,WH=1250;
const BUILD=[
  {x:100,y:120,w:420,h:190,roof:'#4a6fa5',name:'RUANG DOSEN',door:'s'},
  {x:1450,y:120,w:400,h:190,roof:'#6f7b8c',name:'GUDANG ALAT',door:'s'}
];
const BENCH=[];for(let i=0;i<6;i++)BENCH.push({x:380+(i%3)*460,y:520+Math.floor(i/3)*300,n:i+1});
const TG={anto:{x:300,y:420},ratna:{x:420,y:400},osilo:{x:BENCH[1].x-60,y:BENCH[1].y-50},meja:{x:BENCH[1].x+70,y:BENCH[1].y-50},
  salsa:{x:BENCH[0].x+150,y:BENCH[0].y+90},bima:{x:BENCH[4].x+150,y:BENCH[4].y+90},fajar:{x:1600,y:400},
  termal:{x:BENCH[2].x,y:BENCH[2].y-50},akses:{x:180,y:1120},bank:{x:BENCH[4].x+0,y:BENCH[4].y-50}};
const SOLIDS=BUILD.map(b=>({x:b.x,y:b.y,w:b.w,h:b.h}));
for(const b of BENCH)SOLIDS.push({x:b.x-110,y:b.y-20,w:220,h:60});
const CH={
  anto:{n:'Pak Anto',body:'#c9b27a',cap:'#4a6fa5'},
  ratna:{n:'Bu Ratna',body:'#9a8fc2',cap:'#1c2230'},
  salsa:{n:'Salsa',body:'#e8553d',cap:'#f4efe1'},
  bima:{n:'Bima',body:'#2f9e5b',cap:'#1c2230'},
  fajar:{n:'Mas Fajar',body:'#6f7b8c',cap:'#d9a441'}
};
function buildWorld(){
  const c=document.createElement('canvas');c.width=WW;c.height=WH;const g=c.getContext('2d');
  g.fillStyle='#d9d4c7';g.fillRect(0,0,WW,WH);
  g.strokeStyle='rgba(28,34,48,.12)';g.lineWidth=2;for(let x=0;x<WW;x+=60){g.beginPath();g.moveTo(x,0);g.lineTo(x,WH);g.stroke();}for(let y=0;y<WH;y+=60){g.beginPath();g.moveTo(0,y);g.lineTo(WW,y);g.stroke();}
  g.fillStyle=INK;g.fillRect(0,0,WW,16);g.fillRect(0,0,16,WH);g.fillRect(WW-16,0,16,WH);g.fillRect(0,WH-16,WW,16);
  for(const b of BUILD)KT.building(g,b);
  for(const b of BENCH){
    g.fillStyle='rgba(28,34,48,.25)';g.fillRect(b.x-104,b.y-14,220,60);
    g.fillStyle='#8a6a48';g.strokeStyle=INK;g.lineWidth=3;g.fillRect(b.x-110,b.y-20,220,60);g.strokeRect(b.x-110,b.y-20,220,60);
    g.fillStyle='#2b3a52';g.fillRect(b.x-90,b.y-12,50,34);g.strokeRect(b.x-90,b.y-12,50,34);
    g.fillStyle='#8fe3a0';g.fillRect(b.x-84,b.y-6,38,16);
    g.fillStyle='#e9dfc8';g.fillRect(b.x-20,b.y-10,90,30);g.strokeRect(b.x-20,b.y-10,90,30);
    g.fillStyle=INK;g.font='800 13px '+FD;g.textAlign='center';g.fillText('MEJA '+b.n,b.x,b.y+56);
  }
  // bekas ledakan di meja 2
  const b2=BENCH[1];g.fillStyle='rgba(20,20,20,.55)';g.beginPath();g.ellipse(b2.x+30,b2.y+4,40,16,0,0,7);g.fill();
  KT.sign(g,'PINTU (akses kartu)',TG.akses.x,TG.akses.y+30);
  return c;
}

/* ---------- meja praktikum (overlay) ---------- */
const MJ={vs:12,run:null,ok:null,no:null,go:null,drag:null,tries:0};
function panel(maxW,maxH){const {W,H,hs}=V,top=W<=600?8:Math.min(96,H*.16),w=Math.min(maxW*hs,W-16),h=Math.min(maxH*hs,H-top-8);return {w,h,x:(W-w)/2,y:top+Math.max(0,(H-top-8-h)/2),hs};}
function openMeja(){S.ui='meja';K.u=K.d=K.l=K.r=false;T.x=T.y=0;MJ.run=null;teori('k7-daya');}
function mejaPanel(ctx){
  const {w,h,x,y,hs}=panel(820,440),f=Math.round(14*hs);KT.box(ctx,x,y,w,h);
  KT.txt(ctx,'MEJA 2: REPLIKA INSIDEN',x+14,y+24*hs,'800 '+Math.round(16*hs)+'px '+FD);
  KT.txt(ctx,'R = 1 kΩ, C = 1000 µF (τ = 1 s), batas kapasitor 25 V',x+w-14,y+24*hs,'700 '+Math.round(12*hs)+'px '+FU,INK,'right');
  const gx=x+50*hs,gy=y+44*hs,gw=w*.62,gh=h-150*hs;
  const scope=KT.samp(vOf,0,TBOOM,120),cur=MJ.run?MJ.run.pts:[];
  const m=KT.plot(ctx,gx,gy,gw,gh,0,3,0,40,[{pts:scope,col:'#a879e0',w:7},{pts:cur,col:CORAL,w:3}],'v (volt)');
  ctx.strokeStyle=ALERT;ctx.setLineDash([6,5]);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(gx,m.Y(VMAX));ctx.lineTo(gx+gw,m.Y(VMAX));ctx.stroke();ctx.setLineDash([]);
  KT.txt(ctx,'25 V',gx+gw,m.Y(VMAX)-4,'700 '+Math.round(11*hs)+'px '+FU,ALERT,'right');
  for(const v of [0,10,20,30,40])KT.txt(ctx,String(v),gx-6,m.Y(v)+4,'600 '+Math.round(10*hs)+'px '+FU,INK,'right');
  for(const t of [0,1,2,3])KT.txt(ctx,String(t),m.X(t),gy+gh+14*hs,'600 '+Math.round(10*hs)+'px '+FU,INK,'center');
  KT.txt(ctx,'ungu tebal: rekaman osiloskop   oranye: replikamu',gx,gy+gh+30*hs,'600 '+Math.round(11*hs)+'px '+FU);
  // kapasitor
  const cx=x+w*.83,cy=y+h*.38,boom=MJ.run&&MJ.run.boom;
  if(!boom){const bul=MJ.run?clamp((MJ.run.v-18)/7,0,1):0;ctx.fillStyle='#2f5aa8';ctx.strokeStyle=INK;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(cx,cy,26*hs+bul*8,46*hs,0,0,7);ctx.fill();ctx.stroke();ctx.fillStyle=PAPER;ctx.fillRect(cx-6,cy-40*hs,12,10*hs);}
  else{for(let i=0;i<14;i++){const a=i/14*6.28;KT.arrow(ctx,cx,cy,Math.cos(a)*50*hs,Math.sin(a)*50*hs,i%2?SUN:ALERT,3);}KT.txt(ctx,'DOR!',cx,cy+8,'800 '+Math.round(28*hs)+'px '+FD,ALERT,'center');}
  KT.txt(ctx,'v = '+fx(MJ.run?MJ.run.v:0,1)+' V',cx,cy+70*hs,'800 '+f+'px '+FU,INK,'center');
  // kenop
  KT.txt(ctx,'Catu daya Vs = '+fx(MJ.vs,1)+' V',x+14,y+h-62*hs,'800 '+Math.round(17*hs)+'px '+FU,'#c25a1c');
  KT.txt(ctx,G.coarse?'Geser kiri/kanan untuk mengubah Vs.':'Seret atau panah ←→ (Shift: 5 V). E: nyalakan.',x+14,y+h-42*hs,'600 '+Math.round(11.5*hs)+'px '+FU);
  const bh=38*hs;MJ.no=KT.btn(ctx,{x:x+w-300*hs-24,y:y+h-bh-10,w:110*hs,h:bh},'Tutup',false,f);MJ.go=KT.btn(ctx,{x:x+w-180*hs-14,y:y+h-bh-10,w:180*hs,h:bh},'Nyalakan saklar',true,f);
}
function nyalakan(){if(MJ.run&&!MJ.run.done)return;MJ.tries++;MJ.run={t:0,v:0,pts:[[0,0]],boom:false,done:false,vs:MJ.vs};sfx.blip();}
function mejaTick(dt){
  const r=MJ.run;if(!r||r.done)return;
  r.t+=dt*.8;r.v=r.vs*(1-Math.exp(-r.t/TAU));r.pts.push([r.t,r.v]);
  if(r.v>VMAX){r.boom=true;r.done=true;G.flash=.8;G.shake=.5;sfx.shot();sfx.bad();afterRun();}
  else if(r.t>=3){r.done=true;afterRun();}
}
function afterRun(){
  const r=MJ.run;
  if(Math.abs(r.vs-VS)<=0.5&&r.boom&&!S.flags.replika){S.flags.replika=true;S.mejaPts=Math.max(40,100-15*Math.max(0,MJ.tries-2));sfx.ev();
    addEv({id:'replika',type:'meas',title:'Replika berhasil',text:'Dengan Vs = '+fx(r.vs,1)+' V, kurva menimpa rekaman osiloskop dan kapasitor meledak di sekitar t = 1,2 s.',meta:{kind:'replika',vs:r.vs}});toast('Kurvamu menimpa rekaman. Ini tegangan saat insiden.');}
  else if(!r.boom)toast('Kapasitor aman. Tegangan maksimum '+fx(r.v,1)+' V. Tidak sama dengan rekaman.');
  else if(!S.flags.replika)toast('Meledak, tapi kurvanya belum menimpa rekaman.');
}

/* ---------- pengosongan bank (overlay) ---------- */
const BK={R:null,btns:[],go:null,time:30,state:'pilih',v:BANK.V0,t:0,tries:0,msg:''};
function openBank(){S.ui='bank';K.u=K.d=K.l=K.r=false;T.x=T.y=0;BK.state='pilih';BK.time=30;BK.v=BANK.V0;BK.t=0;BK.msg='';teori('k7-buang');}
function bankPanel(ctx){
  const {w,h,x,y,hs}=panel(780,430),f=Math.round(14*hs);KT.box(ctx,x,y,w,h);
  KT.txt(ctx,'MEJA 5: BANK KAPASITOR TERISI!',x+14,y+24*hs,'800 '+Math.round(17*hs)+'px '+FD,ALERT);
  KT.txt(ctx,BK.state==='pilih'?'tersisa '+fx(Math.max(0,BK.time),0)+' dtk':'',x+w-14,y+24*hs,'800 '+Math.round(18*hs)+'px '+FU,ALERT,'right');
  const L=['V₀ = 36 V, C = 4700 µF. Sekring jalur buang: 0,5 A.','Timer relay menyambung lagi 1,0 detik setelah resistor buang dipasang.','Tegangan harus sudah di bawah 5 V saat relay menyambung.','Pilih satu resistor buang:'];
  L.forEach((l,i)=>KT.txt(ctx,l,x+14,y+(50+i*20)*hs,'600 '+Math.round(12.5*hs)+'px '+FU));
  BK.btns=[];const bw=86*hs,bh=38*hs,by=y+136*hs;
  RES.forEach((r,i)=>{const b={x:x+14+i*(bw+10),y:by,w:bw,h:bh,v:r};KT.btn(ctx,b,r+' Ω',BK.R===r,f);BK.btns.push(b);});
  // grafik buang
  const gx=x+50*hs,gy=by+bh+20*hs,gw=w-100*hs,gh=h-(gy-y)-70*hs;
  if(gh>40){const pts=BK.state==='buang'||BK.state==='hasil'?BK.pts:[];
    const m=KT.plot(ctx,gx,gy,gw,gh,0,1.2,0,40,[{pts,col:SUN,w:3.5}],'v (volt)');
    ctx.strokeStyle=GOOD;ctx.setLineDash([6,5]);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(gx,m.Y(5));ctx.lineTo(gx+gw,m.Y(5));ctx.stroke();
    ctx.strokeStyle=ALERT;ctx.beginPath();ctx.moveTo(m.X(1),gy);ctx.lineTo(m.X(1),gy+gh);ctx.stroke();ctx.setLineDash([]);
    KT.txt(ctx,'5 V aman',gx+gw,m.Y(5)-4,'700 '+Math.round(11*hs)+'px '+FU,GOOD,'right');KT.txt(ctx,'relay',m.X(1)+4,gy+12*hs,'700 '+Math.round(11*hs)+'px '+FU,ALERT);}
  if(BK.msg)KT.txt(ctx,BK.msg,x+14,y+h-58*hs,'800 '+Math.round(12.5*hs)+'px '+FU,BK.ok?GOOD:ALERT);
  const b2=40*hs;BK.go=KT.btn(ctx,{x:x+w-190*hs-14,y:y+h-b2-10,w:190*hs,h:b2},'Pasang resistor',true,f);
}
function pasang(){
  if(BK.state!=='pilih'||!BK.R){if(!BK.R)toast('Pilih resistor dulu');return;}
  BK.tries++;BK.state='buang';BK.t=0;BK.pts=[[0,BANK.V0]];BK.msg='';sfx.blip();
  if(BANK.V0/BK.R>BANK.fuse){BK.state='hasil';BK.ok=false;BK.msg='SEKRING PUTUS! Arus awal '+fx(BANK.V0/BK.R,2)+' A melebihi 0,5 A.';G.flash=.5;sfx.bad();setTimeout(bankRetry,1800);}
}
function bankTick(dt){
  if(BK.state==='pilih'){BK.time-=dt;if(BK.time<=0){BK.state='hasil';BK.ok=false;BK.tries++;BK.msg='Waktu habis! Bu Ratna mencabut steker utama.';sfx.bad();setTimeout(bankRetry,1800);}return;}
  if(BK.state!=='buang')return;
  BK.t+=dt/3;const tau=BK.R*BANK.C;BK.v=BANK.V0*Math.exp(-BK.t/tau);BK.pts.push([BK.t,BK.v]);
  if(BK.t>=BANK.relay){BK.state='hasil';
    if(BK.v<=BANK.safe){BK.ok=true;BK.msg='AMAN! Saat relay menyambung, v = '+fx(BK.v,1)+' V.';sfx.win();G.flash=.4;S.bankPts=[200,120,60][BK.tries-1]||60;setTimeout(bankDone,1600);}
    else{BK.ok=false;BK.msg='Relay menyambung saat v masih '+fx(BK.v,1)+' V. Percikan! Bu Ratna mencabut steker.';G.shake=.5;sfx.bad();setTimeout(bankRetry,1800);}}
}
function bankRetry(){if(S.ui!=='bank')return;if(BK.tries>=3){S.bankPts=20;bankDone();return;}BK.state='pilih';BK.time=30;BK.msg+='  Bank terisi lagi. Coba sekali lagi.';BK.R=null;}
function bankDone(){S.ui='none';const f=S.flags;f.bank=true;
  say([['ratna','Bank kapasitor aman. Siapa yang memasang timer di meja 5?','panik'],['ratna','Timer itu dipasang dengan obeng bertanda "LAB-GUDANG". Hanya laboran yang pegang kunci gudang alat.','curiga']],
    ()=>addEv({id:'timer',type:'doc',title:'Timer di meja 5',text:'Dipasang dengan obeng bertanda "LAB-GUDANG". Kunci gudang alat dipegang laboran.'}));}

/* ---------- interaksi ---------- */
const INTS=[
  {id:'anto',ch:'anto',t:TG.anto,label:'Bicara dengan Pak Anto',act:talkAnto},
  {id:'ratna',ch:'ratna',t:TG.ratna,label:'Bicara dengan Bu Ratna',act:()=>say([['ratna','Saya dosen pengampu. Lembar praktikum jelas: Vs = 12 V. Kapasitornya tahan 25 V, aman.','panik'],['ratna','Tapi osiloskop meja 2 merekam sesuatu yang lain sebelum ledakan. Rekamannya masih tersimpan.','curiga']],
    ()=>addEv({id:'w-ratna',type:'witness',title:'Bu Ratna',text:'Lembar praktikum: Vs = 12 V, R = 1 kΩ, C = 1000 µF, kapasitor 25 V.'}))},
  {id:'osilo',t:TG.osilo,label:'Baca memori osiloskop meja 2',icon:'i',when:()=>S.flags.case,act:openScope},
  {id:'meja',t:TG.meja,label:'Replika di meja praktikum',icon:'⚡',when:()=>S.flags.case,act:openMeja},
  {id:'salsa',ch:'salsa',t:TG.salsa,label:'Bicara dengan Salsa',act:()=>say([['salsa','Aku yang praktikum di meja 2. Kenopnya kusetel 12 V, sumpah! Layarnya juga bilang 12,0.','panik'],['salsa','Begitu saklar kunyalakan, kapasitornya menggembung lalu DOR!','panik']],
    ()=>addEv({id:'w-salsa',type:'witness',title:'Salsa (praktikan meja 2)',text:'Menyetel 12 V, layar catu daya menunjukkan 12,0 V. Kapasitor meledak setelah saklar dinyalakan.'}))},
  {id:'bima',ch:'bima',t:TG.bima,label:'Bicara dengan Bima',act:()=>say(S.flags.twist?[['bima','Kabel jumper? Aku lihat ada kabel dari meja 3 ke meja 2 tadi. Kukira bagian praktikum.','curiga']]:[['bima','Aku asisten. Pagi tadi kucek semua catu daya, normal semua.']],
    ()=>{if(S.flags.twist)addEv({id:'w-bima',type:'witness',title:'Bima: kabel jumper',text:'Ada kabel jumper dari catu daya meja 3 ke rel meja 2.'});})},
  {id:'fajar',ch:'fajar',t:TG.fajar,label:'Bicara dengan Mas Fajar',act:()=>say(S.flags.bank?[['fajar','Obeng gudang? Siapa saja bisa pinjam.','panik']]:[['fajar','Saya laboran. Dari pagi saya di gudang alat, inventaris. Tidak ke ruang praktikum.','senyum']],
    ()=>addEv({id:'w-fajar',type:'witness',title:'Mas Fajar (laboran)',text:'"Dari pagi di gudang alat, tidak ke ruang praktikum." Pegang kunci gudang.'}))},
  {id:'termal',t:TG.termal,label:'Kamera termal: catu daya meja 3',icon:'i',when:()=>S.flags.twist,act:openTermal},
  {id:'akses',t:TG.akses,label:'Log kartu akses pintu',icon:'i',when:()=>S.flags.twist,act:()=>say([['Log akses','14.20 Bima (asisten).'],['Log akses','14.31 Mas Fajar (laboran).'],['Log akses','14.42 Salsa (praktikan).'],['Log akses','Sekarang 14.49. Ledakan 14.47.']],
    ()=>{S.flags.akses=true;addEv({id:'akses',type:'doc',title:'Log kartu akses',text:'14.20 Bima, 14.31 Fajar, 14.42 Salsa. Sekarang 14.49.'});})},
  {id:'bank',t:TG.bank,label:'BANK KAPASITOR BERBUNYI!',icon:'!',when:()=>S.flags.twist&&S.flags.waktu&&!S.flags.bank,act:openBank}
];
function talkAnto(){
  const f=S.flags;
  if(!f.case){
    say([['anto','Detektif {name}, kali ini di kampus. Kapasitor meledak di meja 2 lab elektronika. Untung praktikannya cuma kaget.','curiga'],
      ['anto','Laporan bilang "kecelakaan, komponen cacat". Tapi osiloskopnya merekam semuanya. Mari kita baca.']],
      ()=>{f.case=true;addEv({id:'kasus',type:'doc',title:'Ledakan di meja 2',text:'Kapasitor elektrolit 25 V meledak saat praktikum pengisian RC.'});});
  }else if(!f.ukur)say([['anto','Baca memori osiloskop meja 2. Satu titik di kurva sudah cukup untuk tahu tegangan catu dayanya, kalau kamu tahu caranya.']]);
  else if(!f.replika)say([['anto','Buktikan angkamu: setel catu daya di meja praktikum dan buat kurvanya menimpa rekaman. Ya, kapasitornya akan meledak. Pakai kacamata.']]);
  else if(!f.acc1)say([['anto','Jadi, apa yang terjadi di meja 2?']],()=>openAccuse(1));
  else if(!f.twist){sfx.twist();say([['anto','Layar catu daya meja 2 bilang 12,0 V. Tapi kapasitornya menerima 36 V. Berarti ada sumber lain.','curiga'],['anto','Catu daya meja 3 bisa sampai 36 V. Pendinginnya masih hangat. Kapan terakhir ia dipakai penuh? Kamera termal ada di meja 3.']],
    ()=>{f.twist=true;teori('k7-dingin');card('BAB 2','JEJAK PANAS');$('chap').textContent='Bab 2: Jejak Panas';});}
  else if(!f.waktu)say([['anto','Ukur suhu dan laju pendinginan catu daya meja 3 SEKARANG. Lalu hitung mundur.']]);
  else if(!f.bank)say([['anto','Dengar bunyi itu? Meja 5!','panik']]);
  else if(!f.akses)say([['anto','Kamu tahu jamnya. Cek log kartu akses di pintu.']]);
  else say([['anto','Siapa yang mengalirkan 36 V ke meja 2?']],()=>openAccuse(2));
}
function openScope(){
  teori('k7-arus');
  gpOpen({src:'scope',title:'Memori osiloskop meja 2',cur:'v',Tmax:1.5,Smax:40,camS:null,gmin:-10,gmax:40,k:1,unit:'V/s',startLocked:false,xs:'t',xu:'s',xlab:'t (detik sejak saklar)',
    series:{v:{name:'v(t) kapasitor',col:'#7c4dbd',pts:KT.samp(vOf,0,TBOOM,240),kind:'plain',sym:'v',yu:'V',ru:'V/s',ylab:'v (volt)',Smax:40,dp:2,gaps:[[TBOOM,1.5,'ledakan']]}},
    tip:'Rekaman berhenti saat kapasitor meledak. Kunci satu titik, baca v dan v′, simpan.'});
}
function openTermal(){
  gpOpen({src:'termal',title:'Kamera termal: pendingin catu daya meja 3',cur:'T',Tmax:0,T0:-3,Smax:60,camS:null,gmin:-3,gmax:3,k:1,unit:'°C/mnt',startLocked:true,xs:'t',xu:'menit',xlab:'t (menit, 0 = sekarang 14.49)',
    series:{T:{name:'T(t) pendingin',col:'#e8553d',pts:KT.samp(Tof,-3,0,120),kind:'plain',sym:'T',yu:'°C',ru:'°C/menit',ylab:'T (°C)',Smax:60,dp:2}},
    tip:'Kamera baru menyala 3 menit lalu. Suhu ruang 27°C, suhu kerja penuh 80°C. Kunci di t = 0 dan simpan.'});
}
function onLensSave(i,GP){
  if(i.kind!=='inst'){toast('Kunci dulu titik B ke titik A');return 'stay';}
  if(GP.src==='scope'){
    addEv({id:'scope',type:'meas',title:'Titik di rekaman osiloskop',text:'Di t = '+fx(i.t,2)+' s: v = '+fx(i.s,2)+' V, v′ = '+fx(i.m,2)+' V/s.',meta:{kind:'scope',t:i.t,v:i.s,m:i.m}});
    S.flags.ukur=true;return 'saved';
  }
  addEv({id:'termal',type:'meas',title:'Suhu pendingin meja 3',text:'Di t = '+fx(i.t,2)+' menit: T = '+fx(i.s,2)+'°C, T′ = '+fx(i.m,2)+'°C/menit.',meta:{kind:'termal',t:i.t,T:i.s,m:i.m}});
  S.flags.waktu=true;setTimeout(()=>{if(!S.flags.bank){sfx.twist();G.shake=.4;toast('BIP BIP BIP! Bank kapasitor meja 5 mulai terisi!');}},900);
  return 'saved';
}

/* ---------- tuduhan ---------- */
const ACQ={
  1:{title:'Laporan pertama',q:'Apa yang terjadi di meja 2?',
    who:[['36','Kapasitor menerima 36 V'],['12','Kapasitor cacat (Vs memang 12 V)'],['25','Kapasitor menerima 25 V']],
    why:[['ok','Dari satu titik rekaman: Vs = v + τ·v′ ≈ 36 V. Replika dengan 36 V menimpa rekaman dan meledak di t ≈ 1,2 s.'],['ujung','Rekaman berhenti di sekitar 25 V, jadi catu dayanya 25 V.'],['layar','Layar catu daya bilang 12,0 V, jadi kapasitornya yang cacat.'],['awal','Kemiringan awal besar karena kapasitornya rusak.']],ans:'36'},
  2:{title:'Tuduhan akhir',q:'Siapa yang mengalirkan 36 V dari meja 3 ke meja 2?',
    who:[['fajar','Mas Fajar (laboran)'],['salsa','Salsa (praktikan)'],['bima','Bima (asisten)']],
    why:[['ok','Pendingin meja 3 terakhir panas penuh sekitar 18 menit lalu: k = −T′/(T − Ta), t = ln((80 − 27)/(T − 27))/k, yaitu pukul 14.31. Log akses 14.31: Fajar. Timer meja 5 dipasang dengan obeng gudang.'],['akhir','Salsa yang terakhir masuk dan yang menyalakan saklar.'],['cek','Bima mengecek semua catu daya pagi tadi.'],['kunci','Bu Ratna pemegang lab.']],ans:'fajar'}
};
function wrongMsg(n,A){
  if(n===1){if(A.who==='12')return 'Pak Anto: "Kurva 12 V tidak akan pernah mencapai 25 V." (-100)';if(A.who==='25')return 'Pak Anto: "Rekaman berhenti karena ledakan, bukan karena sampai di Vs." (-100)';return 'Pak Anto: "Angkanya benar. Bagaimana kamu tahu?" (-100)';}
  if(A.who==='salsa')return 'Pak Anto: "Salsa menyalakan saklar, tapi kapan meja 3 terakhir bekerja penuh?" (-100)';
  if(A.who==='bima')return 'Pak Anto: "Bima masuk 14.20. Hitung lagi umur panasnya." (-100)';
  return 'Pak Anto: "Orangnya benar, tapi bukti kuncinya bukan itu." (-100)';
}
function onAccuseOk(n){
  if(n===1){S.flags.acc1=true;sfx.ev();teori('k7-peta');say([['anto','36 V, bukan 12. Kapasitornya tidak cacat. Ini disengaja.','curiga']]);}
  else finale();
}
function finale(){
  sfx.win();
  say([['anto','Mas Fajar. Catu daya meja 3 terakhir bekerja penuh pukul 14.31, saat kartu Anda masuk. Timer di meja 5 dipasang dengan obeng gudang.','curiga'],
    ['fajar','...Stok kapasitor dan osiloskop lama saya jual diam-diam. Audit alat minggu depan. Kalau lab "kecelakaan" dan ditutup, auditnya batal.','panik'],
    ['ratna','Dan kamu mempertaruhkan mahasiswa kita?','panik'],
    ['salsa','Jadi bukan salahku!','senyum'],
    ['anto','Tujuh semesta, satu alat: turunan. Rantai, perkalian, eksponen, ln, semuanya bicara di lab ini. Kerja luar biasa, Detektif {name}.','senyum']],endCase);
}
function suspects(chip){const f=S.flags;if(f.case){chip('Salsa',f.acc1?'x':'hot');}if(f.twist){chip('Bima','');chip('Mas Fajar','');}}

/* ---------- alur ---------- */
function objective(){
  const f=S.flags;
  if(!f.case)return{t:'Temui Pak Anto di depan ruang dosen.',p:TG.anto};
  if(!f.ukur)return{t:'Baca memori osiloskop meja 2: kunci satu titik, simpan v dan v′.',p:TG.osilo};
  if(!f.replika)return{t:'Replika: setel catu daya sampai kurvamu menimpa rekaman.',p:TG.meja};
  if(!f.acc1)return{t:'Lapor Pak Anto.',p:TG.anto};
  if(!f.twist)return{t:'Lapor Pak Anto.',p:TG.anto};
  if(!f.waktu)return{t:'Kamera termal di meja 3: ukur T dan T′ sekarang.',p:TG.termal};
  if(!f.bank)return{t:'DARURAT: amankan bank kapasitor meja 5!',p:TG.bank};
  if(!f.akses)return{t:'Hitung kapan meja 3 terakhir panas penuh. Cek log kartu akses.',p:TG.akses};
  return{t:'Kamu tahu pelakunya. Temui Pak Anto.',p:TG.anto};
}
function stageHint(){
  const f=S.flags;
  if(!f.replika)return['vs','Vs = v + τ·v′ dengan τ = 1 s. Ambil v dan v′ dari satu titik mana pun di rekaman.'];
  if(!f.acc1)return['acc1','Rekaman berhenti karena ledakan. Tegangan catu daya lebih tinggi dari titik terakhir.'];
  if(!f.waktu)return['termal','k = −T′/(T − 27). Lalu t = ln(53/(T − 27))/k menit yang lalu.'];
  if(!f.bank)return['bank','Arus awal 36/R ≤ 0,5 A, jadi R ≥ 72 Ω. Waktu: R × 0,0047 × ln(36/5) ≤ 1, jadi R ≤ 107 Ω.'];
  return['final','14.49 dikurangi hasil hitunganmu. Siapa yang masuk jam itu?'];
}

/* ---------- skor ---------- */
function score(el){
  const es=S.evidence.find(e=>e.id==='scope'),vs=es?es.meta.v+TAU*es.meta.m:null,ps=vs==null?0:Math.round(150*clamp(1-(Math.abs(vs-VS)-.3)/3,0,1));
  const et=S.evidence.find(e=>e.id==='termal');let pt=0,tt=null;
  if(et){const k=-et.meta.m/(et.meta.T-TA);tt=Math.log((T0-TA)/(et.meta.T-TA))/k-et.meta.t;pt=Math.round(150*clamp(1-(Math.abs(tt-ELAPSED)-.5)/4,0,1));}
  const items=[['Vs dari satu titik osiloskop (maks 150)',ps,[['Vs = v + τv′ = '+(vs==null?'belum':fx(vs,1)+' V'),ps]]],['Replika di meja (maks 100)',S.mejaPts||0],['Umur panas catu daya meja 3 (maks 150)',pt,[['dari ukuranmu: '+(tt==null?'belum':fx(tt,1)+' menit lalu'),pt]]],['Bank kapasitor, percobaan ke-'+BK.tries+' (maks 200)',S.bankPts||0],['Penalaran: dua tuduhan benar (maks 400)',400],['Petunjuk ('+S.hints+')',-60*S.hints],['Salah tuduh ('+S.wrong+')',-100*S.wrong]];
  return {items,detail:{detik:el,vs,umur:tt,meja:MJ.tries,bank:BK.tries,petunjuk:S.hints,salah:S.wrong}};
}
function learn(){return[
  'Pengisian RC: <code>v = Vs(1 − e^(−t/τ))</code>. Aturan rantai memberi <code>v′ = (Vs − v)/τ</code>, jadi <code>Vs = v + τ·v′</code>: 36 V dari satu titik, padahal layar bilang 12.',
  'Pendinginan Newton: <code>T′ = −k(T − Ta)</code>. Dari T dan T′ sekarang kamu dapat k, lalu <code>t = ln((T₀ − Ta)/(T − Ta))/k</code> ≈ 18 menit: pukul 14.31.',
  'Pengosongan: <code>i₀ = V₀/R</code> membatasi R dari bawah, <code>RC·ln(V₀/5)</code> membatasi dari atas. Hanya 100 Ω yang lolos keduanya.'
];}

/* ---------- input & gambar ---------- */
function onPointer(type,e){
  const x=e.clientX,y=e.clientY;
  if(S.ui==='meja'){
    if(type==='down'){if(KT.inR(MJ.go,x,y)){nyalakan();return true;}if(KT.inR(MJ.no,x,y)){S.ui='none';return true;}MJ.drag={x,vs:MJ.vs,id:e.pointerId};return true;}
    if(type==='move'&&MJ.drag&&MJ.drag.id===e.pointerId){MJ.vs=clamp(Math.round((MJ.drag.vs+(x-MJ.drag.x)*.06)*2)/2,0,40);return true;}
    if(type==='up')MJ.drag=null;return true;
  }
  if(S.ui==='bank'){if(type==='down'){for(const b of BK.btns)if(KT.inR(b,x,y)&&BK.state==='pilih'){BK.R=b.v;return true;}if(KT.inR(BK.go,x,y))pasang();}return true;}
  return false;
}
function onKey(e){
  const k=e.key;
  if(S.ui==='meja'){const st=e.shiftKey?5:.5;if(k==='ArrowRight'||k==='d'||k==='D')MJ.vs=clamp(MJ.vs+st,0,40);else if(k==='ArrowLeft'||k==='a'||k==='A')MJ.vs=clamp(MJ.vs-st,0,40);
    else if(k==='e'||k==='E'||k==='Enter'||k===' '){if(!e.repeat)nyalakan();}else if(k==='Escape')S.ui='none';else return false;e.preventDefault();return true;}
  if(S.ui==='bank'){const i=['1','2','3','4','5'].indexOf(k);if(i>=0&&BK.state==='pilih')BK.R=RES[i];else if((k==='e'||k==='E'||k==='Enter')&&!e.repeat)pasang();e.preventDefault();return true;}
  return false;
}
function tick(dt){if(S.ui==='meja')mejaTick(dt);if(S.ui==='bank')bankTick(dt);}
function drawOverlay(ctx){if(S.ui==='meja')mejaPanel(ctx);if(S.ui==='bank')bankPanel(ctx);}
function drawWorldTop(ctx){
  if(S.flags.waktu&&!S.flags.bank){const b=BENCH[4],a=.5+.5*Math.sin(G.T*10);ctx.fillStyle='rgba(229,57,43,'+(.25+.35*a)+')';ctx.beginPath();ctx.arc(b.x,b.y,90,0,7);ctx.fill();}
}
const CINE={t:0};
function begin(){P.x=TG.anto.x+60;P.y=TG.anto.y+30;S.ui='cine';CINE.t=0;return [BENCH[1].x,BENCH[1].y];}
function cineStep(dt){CINE.t+=dt;if(CINE.t>1.2&&!CINE.b){CINE.b=true;G.flash=1;G.shake=.6;sfx.shot();}if(CINE.t>4.6)endCine();return [BENCH[1].x,BENCH[1].y];}
function drawCine(ctx){const {H,hs}=V;if(CINE.t>1.2&&CINE.t<2.8){KT.bigText(ctx,V,'DOR!',H*.32,80,ALERT);}else if(CINE.t>=2.8){KT.bigText(ctx,V,'"KECELAKAAN"?',H*.32,52,SUN);KT.subText(ctx,V,'Lab Elektronika, pukul 14.47',H*.32+34*hs);}KT.skipHint(ctx,V,G);}
function cineEnd(){card('BAB 1','LEDAKAN DI MEJA 2');}
function night(){return S.flags.waktu&&!S.flags.bank?.35:0;}
function jitter(it){return(it.ch==='fajar'&&S.flags.bank)?Math.sin(G.T*30)*1.2:0;}
if(window.__TEST__)window.__C={MJ,BK,nyalakan,pasang};

return {
  THEORY,THEORY_START:['k7-dasar'],
  id:'lab-1',judul:'Lab yang Terbakar',eyebrow:'Semesta 7, Teknik. Kasus 1',
  lede:'Pukul 14.47, sebuah kapasitor meledak di meja 2 lab elektronika. Laporan bilang "komponen cacat". Osiloskopnya merekam cerita lain.',
  teaser:'<b>Tujuh semesta selesai.</b> Kamu sudah memakai semua aturan turunan tanpa menghafal satu pun. Detektif, kasus berikutnya menunggu di dunia nyata.',
  chapter:'Bab 1: Ledakan di Meja 2',
  WW,WH,SOLIDS,LAMPS:[],CH,TG,
  ints:INTS,buildWorld,objective,stageHint,ACQ,wrongMsg,onAccuseOk,onLensSave,suspects,score,learn,
  onPointer,onKey,tick,drawOverlay,drawWorldTop,begin,cineStep,drawCine,cineEnd,night,jitter
};
}
