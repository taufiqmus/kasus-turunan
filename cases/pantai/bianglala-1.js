/* Semesta 5 (Pantai dan Taman Hiburan), Kasus 1: Foto dari Bianglala.
   Bab 1: gondola di roda: x = R·sin θ, h = c − R·cos θ. Kecepatannya (x′, h′) = Rω(cos θ, sin θ).
          Arah blur foto memberi tan θ = h′/x′, lalu sudut diubah ke nomor gondola.
   Bab 2: uji turunan pertama secara langsung: rem roda saat h′ berganti dari negatif ke positif (titik terendah).
          Lalu amplitudo h′ = R·ω mengungkap roda yang dipercepat. */
import {kit} from '../../core/kit.js';
export default function create(E){
const {teori,w2s,S,P,G,K,T,V,$,clamp,f0,f1,rngSeed,INK,PAPER,SUN,CORAL,ALERT,BLUE,GOOD,FD,FU,say,toast,addEv,card,sfx,openAccuse,gpOpen,endCine,endCase}=E;
const KT=kit(E),FR=KT.FR;
const D2R=Math.PI/180;

/* ---------- model ---------- */
const RR=10,HC=12,OM=2*Math.PI/60,TH_PHOTO=30,OM2=2*Math.PI/40,TSW=120;
const BLUR={up:RR*OM*Math.sin(TH_PHOTO*D2R),right:RR*OM*Math.cos(TH_PHOTO*D2R)};
const hLog=t=>{const th=t<=TSW?OM*t:OM*TSW+OM2*(t-TSW);return HC-RR*Math.cos(th);};

const THEORY={
  'k5-dasar':{t:'Posisi gondola di roda',sub:'sin dan cos',h:
    '<p>Gondola berputar pada roda berjari-jari R = 10 m, pusatnya 12 m di atas tanah. Sudut <b>θ</b> diukur dari titik terendah, searah putaran:</p>'+
    '<span class="eq">x(θ) = R·sin θ &nbsp;&nbsp; (posisi mendatar dari poros)<br>h(θ) = 12 − R·cos θ &nbsp;&nbsp; (tinggi dari tanah)</span>'+
    '<p>Roda berputar tetap dengan kecepatan sudut <b>ω</b> (radian per detik), jadi θ = ω·t. Satu putaran 60 detik berarti ω = 2π/60 ≈ 0,105 rad/s, atau 6° per detik.</p>'},
  'k5-turunan':{t:'Turunan sin dan cos',sub:'(sin)′ = cos, (cos)′ = −sin',h:
    '<span class="eq">'+FR('d','dθ')+' sin θ = cos θ &nbsp;&nbsp;&nbsp; '+FR('d','dθ')+' cos θ = −sin θ</span>'+
    '<p>Turunkan posisi gondola terhadap θ, lalu kalikan ω karena θ bertambah ω tiap detik:</p>'+
    '<span class="eq">x′(t) = R·ω·cos θ &nbsp;&nbsp; (laju mendatar)<br>h′(t) = R·ω·sin θ &nbsp;&nbsp; (laju naik)</span>'+
    '<p>Panah kecepatan selalu <b>menyinggung lingkaran</b>. Di bawah, ia mendatar penuh (h′ = 0). Di sisi samping, ia tegak penuh (x′ = 0). Panjangnya selalu R·ω, karena sin²θ + cos²θ = 1.</p>'+
    '<div class="ex"><b>Contoh.</b> Di θ = 60°: x′ = 10 × 0,105 × 0,5 ≈ 0,52 m/s, h′ = 10 × 0,105 × 0,866 ≈ 0,91 m/s.</div>'},
  'k5-sudut':{t:'Dari blur foto ke sudut',sub:'tan θ = h′/x′',h:
    '<p>Blur foto menunjukkan arah gerak kamera saat menjepret. Bagi kedua komponennya:</p>'+
    '<span class="eq">'+FR('h′','x′')+' = '+FR('Rω·sin θ','Rω·cos θ')+' = tan θ &nbsp;⇒&nbsp; θ = arctan '+FR('h′','x′')+'</span>'+
    '<p>Turunan tan juga berguna untuk melihat kepekaannya:</p>'+
    '<span class="eq">'+FR('d','dθ')+' tan θ = '+FR('1','cos²θ')+'</span>'+
    '<p>Di dekat θ = 90°, cos θ hampir nol: sedikit perubahan sudut mengubah tan sangat besar. Jadi blur yang hampir tegak sulit dibaca tepat, sedangkan sudut kecil mudah dibaca.</p>'+
    '<div class="ex"><b>Pembahasan.</b> Setelah θ ketemu, cari gondola mana yang berada di sudut itu pada jam foto. Pakai log operator: berapa derajat gondola 1 sudah berputar sejak awal, lalu kurangi 45° per nomor gondola.</div>'},
  'k5-uji':{t:'Uji turunan pertama',sub:'tanda h′ berganti',h:
    '<p>Titik terendah dan tertinggi sama-sama punya h′ = 0. Bedanya ada di <b>arah pergantian tanda</b>:</p>'+
    '<span class="eq">h′: − → 0 → + &nbsp;&nbsp; titik TERENDAH (minimum)<br>h′: + → 0 → − &nbsp;&nbsp; titik TERTINGGI (maksimum)</span>'+
    '<p>Untuk h′ = Rω·sin θ: negatif di sisi turun (180° &lt; θ &lt; 360°), positif di sisi naik (0° &lt; θ &lt; 180°). Gondola di bawah tepat saat h′ melintasi nol <b>dari bawah ke atas</b>.</p>'},
  'k5-omega':{t:'Amplitudo turunan = R·ω',sub:'(sin ωt)′ = ω·cos ωt',h:
    '<p>Kalau h(t) = 12 − R·cos(ωt), turunannya terhadap waktu:</p>'+
    '<span class="eq">h′(t) = R·ω·sin(ωt) &nbsp;&nbsp; ⇒ &nbsp;&nbsp; h′<sub>maks</sub> = R·ω</span>'+
    '<p>Faktor ω muncul karena sudut di dalam sin ikut berubah terhadap waktu. Ini cicipan <b>aturan rantai</b> yang akan kamu temui di Semesta 6.</p>'+
    '<div class="ex"><b>Pembahasan.</b> Tinggi maksimum (22 m) tidak berubah walaupun roda dipercepat. Yang berubah adalah kemiringan maksimum h. Ukur kemiringan terbesar sebelum dan sesudah, bagi dengan R = 10 m untuk mendapat ω.</div>'}
};

/* ---------- dunia ---------- */
const WW=2200,WH=1300,WC={x:1300,y:430},WR=230;
const BUILD=[
  {x:120,y:250,w:270,h:160,roof:'#e8553d',name:'LOKET TIKET',door:'s'},
  {x:1650,y:620,w:220,h:130,roof:'#6f7b8c',name:'OPERATOR',door:'s'},
  {x:500,y:250,w:240,h:150,roof:'#d9a441',name:'WARUNG KELAPA',door:'s'},
  {x:150,y:800,w:260,h:150,roof:'#4a6fa5',name:'POS PANTAI',door:'n'}
];
const TG={anto:{x:300,y:760},lastri:{x:640,y:520},nia:{x:255,y:470},darsono:{x:1760,y:820},roda:{x:WC.x-90,y:WC.y+WR+90},rem:{x:1580,y:820},kevin:{x:WC.x+70,y:WC.y+WR+100},sensor:{x:1900,y:820}};
const SOLIDS=BUILD.map(b=>({x:b.x,y:b.y,w:b.w,h:b.h}));
SOLIDS.push({x:WC.x-40,y:WC.y+WR-10,w:80,h:60});
const LAMPS=[];for(let x=160;x<WW;x+=300)LAMPS.push({x,y:640});
const CH={
  anto:{n:'Pak Anto',body:'#c9b27a',cap:'#4a6fa5'},
  lastri:{n:'Bu Lastri',body:'#e8553d',cap:'#f4efe1'},
  nia:{n:'Mbak Nia',body:'#d9a441',cap:'#1c2230'},
  darsono:{n:'Pak Darsono',body:'#6f7b8c',cap:'#e8553d'},
  kevin:{n:'Kevin',body:'#2f9e5b',cap:'#1c2230'}
};
function buildWorld(){
  const c=document.createElement('canvas');c.width=WW;c.height=WH;const g=c.getContext('2d'),R=rngSeed(53);
  g.fillStyle='#ead39a';g.fillRect(0,0,WW,WH);
  for(let i=0;i<220;i++){g.fillStyle=R()<.5?'#e2c98c':'#f0dcaa';g.beginPath();g.ellipse(R()*WW,R()*900,20+R()*50,10+R()*25,0,0,7);g.fill();}
  // laut
  g.fillStyle='#2f86a8';g.fillRect(0,1000,WW,300);
  g.fillStyle='rgba(255,255,255,.7)';for(let x=0;x<WW;x+=60){g.beginPath();g.ellipse(x+30,1000,32,9,0,0,Math.PI);g.fill();}
  g.strokeStyle='rgba(255,255,255,.3)';g.lineWidth=3;for(let i=0;i<14;i++){g.beginPath();g.moveTo(R()*WW,1060+R()*220);g.lineTo(R()*WW,1060+R()*220);g.stroke();}
  // dermaga
  g.fillStyle='#8a6a48';g.strokeStyle=INK;g.lineWidth=3;g.fillRect(1900,880,90,400);g.strokeRect(1900,880,90,400);
  // jalan papan
  g.fillStyle='#b98a5a';g.fillRect(0,690,WW,60);g.strokeStyle='rgba(28,34,48,.2)';g.lineWidth=2;for(let x=0;x<WW;x+=30){g.beginPath();g.moveTo(x,690);g.lineTo(x,750);g.stroke();}
  KT.paths(g,BUILD,690,750,'#c9a878');
  for(const b of BUILD)KT.building(g,b);
  KT.sign(g,'TUAS REM',TG.rem.x,TG.rem.y+44,ALERT);
  KT.lamps(g,LAMPS);
  // pohon kelapa
  for(let i=0;i<14;i++){const x=80+R()*(WW-160),y=80+R()*560;if(Math.hypot(x-WC.x,y-WC.y)<WR+80)continue;if(BUILD.some(b=>x>b.x-40&&x<b.x+b.w+40&&y>b.y-40&&y<b.y+b.h+40))continue;
    g.fillStyle='#7a5a3a';g.fillRect(x-4,y-4,8,20);g.fillStyle='#3f8a45';g.strokeStyle=INK;g.lineWidth=2;for(let k=0;k<6;k++){g.beginPath();g.ellipse(x+Math.cos(k)*16,y-8+Math.sin(k)*10,18,6,k,0,7);g.fill();g.stroke();}SOLIDS.push({x:x-8,y:y-4,w:16,h:16});}
  return c;
}

/* ---------- rekonstruksi sudut (overlay) ---------- */
const RD={th:0,drag:false,ok:null,no:null,c:null};
const r1=v=>Math.round(v);
function openRoda(){S.ui='roda';K.u=K.d=K.l=K.r=false;T.x=T.y=0;teori('k5-turunan');}
function panel(maxW,maxH){const {W,H,hs}=V,top=8,w=Math.min(maxW*hs,W-16),h=Math.min(maxH*hs*(W<600?1.5:1),H-top-8);return {w,h,x:(W-w)/2,y:top+Math.max(0,(H-top-8-h)/2),hs};}
function rodaPanel(ctx){
  const {w,h,x,y,hs}=panel(820,440),f=Math.round(14*hs);KT.box(ctx,x,y,w,h);
  KT.txt(ctx,'REKONSTRUKSI: DI MANA KAMERA?',x+14,y+24*hs,'800 '+Math.round(16*hs)+'px '+FD);
  KT.txt(ctx,'θ = '+r1(RD.th)+'°',x+w-14,y+24*hs,'800 '+Math.round(18*hs)+'px '+FU,INK,'right');
  const narrow=w<560,rr=Math.min(narrow?w*.3:w*.2,h*.3),cx=x+(narrow?w*.5:w*.27),cy=y+48*hs+rr+16*hs;RD.c={x:cx,y:cy,r:rr};
  ctx.strokeStyle=INK;ctx.lineWidth=4;ctx.beginPath();ctx.arc(cx,cy,rr,0,7);ctx.stroke();
  for(let k=0;k<8;k++){const a=k*45*D2R;ctx.strokeStyle='rgba(28,34,48,.3)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+rr*Math.sin(a),cy+rr*Math.cos(a));ctx.stroke();}
  ctx.strokeStyle='rgba(28,34,48,.35)';ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(cx-rr-14,cy+rr);ctx.lineTo(cx+rr+14,cy+rr);ctx.stroke();ctx.setLineDash([]);
  KT.txt(ctx,'bawah, θ = 0°',cx,cy+rr+18*hs,'700 '+Math.round(11*hs)+'px '+FU,INK,'center');
  const th=RD.th*D2R,gx=cx+rr*Math.sin(th),gy=cy+rr*Math.cos(th);
  // proyeksi tinggi
  ctx.strokeStyle=BLUE;ctx.setLineDash([5,4]);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(gx,gy);ctx.lineTo(cx-rr-24,gy);ctx.stroke();ctx.setLineDash([]);
  KT.txt(ctx,'h = '+f1(HC-RR*Math.cos(th))+' m',cx-rr-28,gy+4,'700 '+Math.round(11*hs)+'px '+FU,BLUE,'right');
  ctx.fillStyle=SUN;ctx.strokeStyle=INK;ctx.lineWidth=3;ctx.fillRect(gx-12,gy-9,24,18);ctx.strokeRect(gx-12,gy-9,24,18);
  const k=rr*.55,vx=Math.cos(th),vh=Math.sin(th);
  KT.arrow(ctx,gx,gy,vx*k,-vh*k,ALERT,4);KT.arrow(ctx,gx,gy,vx*k,0,'#c25a1c',3);KT.arrow(ctx,gx+vx*k,gy,0,-vh*k,GOOD,3);
  // foto
  const px=narrow?x+14:x+w*.52,py=narrow?cy+rr+30*hs:y+48*hs,pw=narrow?w-28:w*.45,ph=narrow?h-(cy+rr+30*hs-y)-62*hs:h*.5;
  if(ph>40){
    ctx.fillStyle='#1d2547';ctx.fillRect(px,py,pw,ph);ctx.strokeStyle=INK;ctx.lineWidth=3;ctx.strokeRect(px,py,pw,ph);
    for(let i=0;i<10;i++){ctx.fillStyle='rgba(255,230,150,.6)';ctx.beginPath();ctx.arc(px+(i*53%pw),py+20+(i*37%Math.max(20,ph-40)),2.5,0,7);ctx.fill();}
    ctx.strokeStyle='#ffd36b';ctx.lineWidth=3;ctx.beginPath();ctx.arc(px+pw/2,py+ph*.62,ph*.18,.2,Math.PI-.2);ctx.stroke();
    const bk=Math.min(pw,ph)*.32,bx0=px+pw*.18,by0=py+ph*.8,bd=Math.hypot(BLUR.up,BLUR.right);
    KT.arrow(ctx,bx0,by0,BLUR.right/bd*bk,-BLUR.up/bd*bk,'#a879e0',6);
    KT.arrow(ctx,bx0,by0,vx*bk,-vh*bk,ALERT,3);
    KT.txt(ctx,'FOTO 20.14.20',px+8,py+16*hs,'800 '+Math.round(12*hs)+'px '+FD,PAPER);
    KT.txt(ctx,'ungu: blur foto   merah: arah gerak gondolamu',px+8,py+ph-8*hs,'600 '+Math.round(10.5*hs)+'px '+FU,PAPER);
  }
  if(!narrow){
    const ly=py+ph+20*hs;
    KT.txt(ctx,'Blur foto: naik '+BLUR.up.toFixed(2).replace('.',',')+' m/s, ke kanan '+BLUR.right.toFixed(2).replace('.',',')+' m/s',px,ly,'700 '+f+'px '+FU);
    ctx.fillStyle='#c25a1c';ctx.fillRect(px,ly+12*hs,12*hs,10*hs);KT.txt(ctx,'x′ mendatar',px+16*hs,ly+22*hs,'600 '+Math.round(12*hs)+'px '+FU);
    ctx.fillStyle=GOOD;ctx.fillRect(px+120*hs,ly+12*hs,12*hs,10*hs);KT.txt(ctx,'h′ naik',px+136*hs,ly+22*hs,'600 '+Math.round(12*hs)+'px '+FU);
  }
  KT.txt(ctx,G.coarse?'Seret gondola mengelilingi roda.':'Seret gondola, atau panah ←→ (Shift: 10°).',x+14,y+h-58*hs,'600 '+Math.round(11.5*hs)+'px '+FU);
  const bh=38*hs;RD.no=KT.btn(ctx,{x:x+14,y:y+h-bh-12,w:100*hs,h:bh},'Tutup',false,f);RD.ok=KT.btn(ctx,{x:x+w-170*hs-14,y:y+h-bh-12,w:170*hs,h:bh},'Simpan sudut',true,f);
}
function saveSudut(){
  const th=r1(RD.th);
  addEv({id:'sudut',type:'meas',title:'Sudut kamera saat foto',text:'Arah gerak gondola cocok dengan blur di θ = '+th+'° dari titik terendah. Tinggi kamera '+f1(HC-RR*Math.cos(th*D2R))+' m.',meta:{kind:'sudut',th}});
  S.flags.sudut=true;teori('k5-sudut');toast('Sudut disimpan: '+th+'°');sfx.ev();
}

/* ---------- rem dalam gelap (overlay) ---------- */
const RM={th:0,om:0,t:0,trace:[],pause:0,tries:0,msg:'',btn:null};
function newOm(){RM.omT=2*Math.PI/(6+Math.random()*3);RM.next=2+Math.random()*3;}
function openRem(){S.ui='rem';K.u=K.d=K.l=K.r=false;T.x=T.y=0;RM.th=(90+Math.random()*180)*D2R;newOm();RM.om=RM.omT;RM.t=0;RM.trace=[];RM.pause=0;RM.msg='';teori('k5-uji');}
function remTick(dt){
  if(RM.pause>0){RM.pause-=dt;if(RM.pause<=0)RM.msg='';return;}
  RM.next-=dt;if(RM.next<=0)newOm();RM.om+=(RM.omT-RM.om)*Math.min(1,dt*.7);
  RM.th+=RM.om*dt;RM.t+=dt;
  RM.trace.push([RM.t,RR*RM.om*Math.sin(RM.th)]);while(RM.trace.length&&RM.trace[0][0]<RM.t-10)RM.trace.shift();
}
function pressRem(){
  if(RM.pause>0||RM.t<1.5)return;
  const m=((RM.th%(2*Math.PI))+2*Math.PI)%(2*Math.PI),d=Math.min(m,2*Math.PI-m)/D2R,top=Math.abs(m-Math.PI)/D2R;
  RM.tries++;sfx.shot();
  if(d<=15){S.remPts=[250,150,80][RM.tries-1];caught();return;}
  sfx.bad();G.shake=.4;
  RM.msg=top<=25?'Berhenti di PUNCAK! Kevin tertahan 22 m di atas, pintu tak bisa dibuka.':'Berhenti di tengah lintasan ('+r1(d)+'° dari bawah). Pintu tak bisa dibuka.';
  if(RM.tries>=3){S.remPts=30;RM.msg+=' Listrik dipadamkan petugas.';setTimeout(caught,1400);RM.pause=99;return;}
  RM.pause=1.6;
}
function caught(){
  S.ui='none';sfx.win();G.flash=.6;const f=S.flags;
  say([['Roda','KREEEK. Gondola 3 berhenti tepat di peron bawah.'],['kevin','Oke, oke! Aku turun. Tapi kalungnya nggak ada di aku!','panik'],['kevin','Aku cuma bertugas foto pamer biar polisi sibuk ngejar aku. Kalungnya dibawa orang lain lewat dermaga.','panik'],['kevin','Dan roda ini... aku nggak tahu kenapa tiba-tiba makin cepat.','panik']],
    ()=>{f.tangkap=true;teori('k5-omega');addEv({id:'kevin',type:'witness',title:'Kevin tertangkap',text:'Kevin hanya umpan. Kalung dibawa orang lain lewat dermaga. Roda tiba-tiba makin cepat saat kejar-kejaran.'});});
}
function remPanel(ctx){
  const {w,h,x,y,hs}=panel(760,400),f=Math.round(14*hs);KT.box(ctx,x,y,w,h);
  KT.txt(ctx,'TUAS REM: LAMPU RODA PADAM',x+14,y+24*hs,'800 '+Math.round(16*hs)+'px '+FD,ALERT);
  KT.txt(ctx,'percobaan '+Math.min(3,RM.tries+1)+'/3',x+w-14,y+24*hs,'700 '+f+'px '+FU,INK,'right');
  KT.txt(ctx,'Sensor HP Kevin hanya mengirim h′ (laju naik). Rem tepat saat gondolanya di BAWAH.',x+14,y+46*hs,'600 '+Math.round(12.5*hs)+'px '+FU);
  const gx=x+40*hs,gy=y+64*hs,gw=w-60*hs,gh=h-170*hs,vm=RR*2*Math.PI/6;
  const tr=RM.trace,t1=RM.t,t0=t1-10;
  ctx.fillStyle='#10142b';ctx.fillRect(gx,gy,gw,gh);ctx.strokeStyle=INK;ctx.lineWidth=3;ctx.strokeRect(gx,gy,gw,gh);
  const X=t=>gx+(t-t0)/10*gw,Y=v=>gy+gh/2-v/vm*(gh/2-8);
  ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(gx,Y(0));ctx.lineTo(gx+gw,Y(0));ctx.stroke();
  KT.txt(ctx,'+ naik',gx+6,gy+14*hs,'700 '+Math.round(11*hs)+'px '+FU,'#8fe3a0');KT.txt(ctx,'− turun',gx+6,gy+gh-6*hs,'700 '+Math.round(11*hs)+'px '+FU,'#ff9a8a');KT.txt(ctx,'0',gx-6,Y(0)+4,'700 '+Math.round(11*hs)+'px '+FU,INK,'right');
  if(tr.length>1){ctx.strokeStyle=SUN;ctx.lineWidth=3;ctx.beginPath();tr.forEach((p,i)=>{i?ctx.lineTo(X(p[0]),Y(p[1])):ctx.moveTo(X(p[0]),Y(p[1]));});ctx.stroke();
    const l=tr[tr.length-1];ctx.fillStyle=SUN;ctx.beginPath();ctx.arc(X(l[0]),Y(l[1]),6,0,7);ctx.fill();
    KT.txt(ctx,'h′ = '+l[1].toFixed(2).replace('.',',')+' m/s',gx+gw-8,gy+14*hs,'800 '+f+'px '+FU,PAPER,'right');}
  KT.txt(ctx,'10 detik terakhir →',gx+gw,gy+gh+16*hs,'600 '+Math.round(11*hs)+'px '+FU,INK,'right');
  if(RM.msg)KT.txt(ctx,RM.msg,x+14,y+h-62*hs,'800 '+Math.round(13*hs)+'px '+FU,ALERT);
  else KT.txt(ctx,G.coarse?'Ketuk REM.':'Tekan E atau Spasi untuk REM.',x+14,y+h-62*hs,'600 '+Math.round(11.5*hs)+'px '+FU);
  const bh=46*hs;RM.btn=KT.btn(ctx,{x:x+w-200*hs-14,y:y+h-bh-10,w:200*hs,h:bh},'REM!',true,Math.round(20*hs));
}

/* ---------- interaksi ---------- */
const INTS=[
  {id:'anto',ch:'anto',t:TG.anto,label:'Bicara dengan Pak Anto',act:talkAnto},
  {id:'lastri',ch:'lastri',t:TG.lastri,label:'Bicara dengan Bu Lastri',act:()=>say([['lastri','Kalung emas peninggalan ibuku dijambret di dekat warung kelapa!','panik'],['lastri','Lalu ini, lihat. Ada akun yang pamer kalungku di medsos jam 20.14.20. Fotonya dari atas, wajahnya tak kelihatan.','panik'],['lastri','Fotonya buram miring. Kata keponakanku, dari blur bisa dihitung kamera bergerak 0,52 m/s ke atas dan 0,91 m/s ke kanan.','curiga']],
    ()=>addEv({id:'foto',type:'doc',title:'Foto pamer 20.14.20',text:'Diambil dari bianglala. Blur: kamera bergerak 0,52 m/s ke atas dan 0,91 m/s ke kanan (ke arah dermaga). Wajah tak terlihat.'}))},
  {id:'roda',t:TG.roda,label:'Rekonstruksi sudut di bianglala',icon:'θ',when:()=>S.flags.case&&S.evidence.some(e=>e.id==='foto'),act:openRoda},
  {id:'nia',ch:'nia',t:TG.nia,label:'Bicara dengan Mbak Nia (loket)',act:()=>say([['nia','Log operator: roda mulai 20.00.00 dengan gondola 1 di bawah. Satu putaran tepat 60 detik, tak pernah berhenti.'],['nia','Gondola bernomor 1 sampai 8. Tiap gondola 45° di BELAKANG gondola sebelumnya.'],['nia','Penumpang jam 20.14: G2 Pak Dodi dan istri, G3 Kevin sendirian, G5 rombongan SMA, G7 Mas Yudi. Sisanya kosong.']],
    ()=>{S.flags.log=true;addEv({id:'log',type:'doc',title:'Log operator dan tiket',text:'Mulai 20.00.00, G1 di bawah, 1 putaran 60 dtk, tiap gondola 45° di belakang sebelumnya. G2 Pak Dodi, G3 Kevin, G5 rombongan SMA, G7 Mas Yudi.'});})},
  {id:'darsono',ch:'darsono',t:TG.darsono,label:'Bicara dengan Pak Darsono',act:()=>{
    if(S.flags.tangkap)say([['darsono','Rodanya otomatis, Detektif. Kecepatannya tetap dari pabrik. Saya tidak sentuh apa-apa.','senyum'],['darsono','Silakan cek sensor gondola 3 di panel. Tingginya tetap 2 sampai 22 meter, kan? Normal.','senyum']],()=>addEv({id:'w-dar',type:'witness',title:'Klaim Pak Darsono',text:'"Roda otomatis, kecepatan tetap. Tinggi tetap 2 sampai 22 m."'}));
    else say([['darsono','Malam ramai, Detektif. Roda jalan terus.']]);}},
  {id:'kevin',ch:'kevin',t:TG.kevin,label:'Bicara dengan Kevin',when:()=>S.flags.tangkap,act:()=>say([['kevin','Yang suruh aku... orangnya pegang kunci panel roda. Itu saja yang kutahu.','panik']],()=>addEv({id:'w-kev2',type:'witness',title:'Kevin: si penyuruh',text:'Orang yang menyuruh Kevin memegang kunci panel roda.'}))},
  {id:'rem',t:TG.rem,label:'Tarik tuas rem',icon:'!',when:()=>S.flags.twist&&!S.flags.tangkap,act:openRem},
  {id:'sensor',t:TG.sensor,label:'Buka log sensor gondola 3',icon:'i',when:()=>S.flags.tangkap,act:openSensor}
];
function talkAnto(){
  const f=S.flags;
  if(!f.case){
    say([['anto','Detektif {name}! Malam minggu, pantai penuh. Kalung Bu Lastri dijambret dan si pencuri malah pamer di medsos.','curiga'],
      ['anto','Fotonya dari bianglala. Kita cuma perlu tahu: dari gondola mana?'],
      ['anto','Temui Bu Lastri di warung kelapa.']],
      ()=>{f.case=true;addEv({id:'kasus',type:'doc',title:'Kalung hilang',text:'Kalung Bu Lastri dijambret. Pencuri pamer foto dari bianglala.'});});
  }else if(!f.sudut)say([['anto','Di kaki bianglala, cari posisi gondola yang arah geraknya sama dengan blur foto.']]);
  else if(!f.log)say([['anto','Sudutnya sudah ada. Sekarang jam berapa, dan gondola mana yang di sudut itu? Mbak Nia di loket punya log.']]);
  else if(!f.acc1)say([['anto','Dari gondola mana foto itu?']],()=>openAccuse(1));
  else if(!f.twist){sfx.twist();say([['anto','Kevin masih di atas roda! Dan... lampu roda PADAM. Rodanya makin kencang!','panik'],['anto','Satu-satunya data dari gondola 3: sensor HP Kevin yang terus mengirim h′. Lari ke TUAS REM. Rem tepat saat gondolanya di bawah!','panik']],
    ()=>{f.twist=true;card('BAB 2','RODA GELAP');$('chap').textContent='Bab 2: Roda Gelap';});}
  else if(!f.tangkap)say([['anto','Tuas rem di samping ruang operator. Cepat!','panik']]);
  else if(!f.omega)say([['anto','Darsono bilang roda tak diubah. Cek sensor gondola 3. Tinggi bisa sama, tapi kemiringannya?','curiga']]);
  else say([['anto','Siapa yang mempercepat roda dan membawa kalung lewat dermaga?']],()=>openAccuse(2));
}
function openSensor(){
  gpOpen({src:'sensor',title:'Log sensor gondola 3',cur:'h',Tmax:220,Smax:24,camS:null,gmin:-2,gmax:2,k:1,unit:'m/s',startLocked:false,xs:'t',xu:'dtk',xlab:'t (detik sejak 20.14)',
    series:{h:{name:'h(t) gondola 3',col:'#2f86a8',pts:KT.samp(hLog,0,220,880),kind:'plain',sym:'h',yu:'m',ru:'m/s',ylab:'h (meter)',Smax:24,dp:2}},
    tip:'Kamu datang sekitar t = 120 dtk. Ukur kemiringan TERBESAR h sebelum dan sesudahnya, lalu simpan masing-masing.'});
}
function onLensSave(i,GP){
  if(i.kind!=='inst'){toast('Kunci dulu titik B ke titik A');return 'stay';}
  const seg=i.t<TSW?'awal':'akhir';
  addEv({id:'om-'+seg,type:'meas',title:'Kemiringan h '+(seg==='awal'?'sebelum':'sesudah')+' kamu datang',text:'Di t = '+f0(i.t)+' dtk: h′ = '+i.m.toFixed(2).replace('.',',')+' m/s.',meta:{kind:'om',seg,m:i.m,t:i.t}});
  if(S.evidence.some(e=>e.id==='om-awal')&&S.evidence.some(e=>e.id==='om-akhir'))S.flags.omega=true;
  return 'saved';
}

/* ---------- tuduhan ---------- */
const ACQ={
  1:{title:'Laporan pertama',q:'Dari gondola mana foto pamer diambil?',
    who:[['g2','Gondola 2: Pak Dodi'],['g3','Gondola 3: Kevin'],['g7','Gondola 7: Mas Yudi']],
    why:[['ok','tan θ = 0,52/0,91, jadi θ = 30°. Pukul 20.14.20 gondola 1 sudah berputar 840 + 20 dtk: 20 dtk × 6° = 120°. Gondola 3 = 120° − 2 × 45° = 30°.'],['tegak','Blur ke atas berarti kamera di sisi samping, di mana h′ terbesar. Gondola terdekat 90° adalah gondola 2.'],['puncak','Foto dari atas berarti gondola di puncak, gondola 7.'],['sendiri','Pencuri pasti naik sendirian.']],ans:'g3'},
  2:{title:'Tuduhan akhir',q:'Siapa dalang yang membawa kalung lewat dermaga?',
    who:[['darsono','Pak Darsono (operator)'],['nia','Mbak Nia (loket)'],['kevin','Kevin']],
    why:[['ok','Kemiringan maksimum h naik dari sekitar 1,05 ke 1,57 m/s: R·ω naik, periode turun dari 60 ke 40 dtk. Hanya pemegang kunci panel yang bisa mengubah ω.'],['tinggi','Tinggi maksimum tetap 22 m, jadi roda tidak diubah. Pelakunya Kevin.'],['log','Mbak Nia yang pegang log, pasti dia.'],['foto','Kevin yang memotret, jadi dia dalangnya.']],ans:'darsono'}
};
function wrongMsg(n,A){
  if(n===1){if(A.who==='g2')return 'Pak Anto: "Blurnya tidak tegak. Hitung sudutnya dari kedua komponen." (-100)';if(A.who==='g7')return 'Pak Anto: "Gondola 7 sedang turun ke kiri. Blur foto ke atas dan ke kanan." (-100)';return 'Pak Anto: "Gondolanya benar. Buktinya?" (-100)';}
  if(A.who==='kevin')return 'Pak Anto: "Kevin cuma umpan, dan dia bersama kita saat kalung lewat dermaga." (-100)';
  if(A.who==='nia')return 'Pak Anto: "Siapa yang bisa mengubah kecepatan roda?" (-100)';
  return 'Pak Anto: "Orangnya benar, tapi bukti kuncinya bukan itu." (-100)';
}
function onAccuseOk(n){
  if(n===1){S.flags.acc1=true;sfx.ev();say([['anto','Gondola 3: Kevin. Tunggu... ada yang aneh dengan rodanya.','curiga']]);}
  else finale();
}
function finale(){
  sfx.win();
  say([['anto','Pak Darsono. Roda dipercepat dari 60 ke 40 detik per putaran, tepat saat kami mengejar Kevin.','curiga'],
    ['darsono','...Supaya Kevin turun dan kabur sebelum kalian sampai. Kalungnya sudah di perahu.','panik'],
    ['anto','Perahu di dermaga sudah kami tahan. Kalungnya kembali.','senyum'],
    ['lastri','Terima kasih, Detektif!','senyum'],
    ['anto','Kerja bagus, Detektif {name}. sin dan cos saling bergantian jadi turunan, dan tinggi yang sama bisa menyembunyikan kecepatan yang berbeda.','senyum']],endCase);
}
function suspects(chip){const f=S.flags;if(f.case)chip('Penumpang bianglala','hot');if(f.acc1)chip('Kevin',f.tangkap?'x':'hot');if(f.tangkap)chip('Penyuruh Kevin','hot');}

/* ---------- alur ---------- */
function objective(){
  const f=S.flags;
  if(!f.case)return{t:'Temui Pak Anto di pos pantai.',p:TG.anto};
  if(!S.evidence.some(e=>e.id==='foto'))return{t:'Temui Bu Lastri, korban.',p:TG.lastri};
  if(!f.sudut)return{t:'Di kaki bianglala, cocokkan arah gerak gondola dengan blur foto.',p:TG.roda};
  if(!f.log)return{t:'Minta log operator di loket tiket.',p:TG.nia};
  if(!f.acc1)return{t:'Lapor Pak Anto: gondola mana?',p:TG.anto};
  if(!f.twist)return{t:'Lapor Pak Anto.',p:TG.anto};
  if(!f.tangkap)return{t:'Tarik tuas rem saat gondola 3 di bawah!',p:TG.rem};
  if(!f.omega)return{t:'Buka log sensor gondola 3. Ukur kemiringan terbesar sebelum dan sesudah kamu datang.',p:TG.sensor};
  return{t:'Kamu tahu dalangnya. Temui Pak Anto.',p:TG.anto};
}
function stageHint(){
  const f=S.flags;
  if(!f.sudut)return['sudut','Panah gerak gondola selalu menyinggung roda. Putar sampai panah merah menimpa panah ungu.'];
  if(!f.acc1)return['acc1','Pukul 20.14.20 berarti 860 dtk sejak mulai. Berapa derajat sisa setelah 14 putaran penuh? Lalu kurangi 45° per nomor.'];
  if(!f.tangkap)return['rem','Di bawah, h′ melintasi nol dari NEGATIF ke POSITIF. Melintasi dari positif ke negatif berarti puncak.'];
  return['final','Kemiringan maksimum h = R·ω. Kalau naik, ω naik. Siapa yang bisa mengubah ω?'];
}

/* ---------- skor ---------- */
function score(el){
  const es=S.evidence.find(e=>e.id==='sudut'),ea=es?Math.abs(es.meta.th-TH_PHOTO):null,ps=ea==null?0:Math.round(200*clamp(1-(ea-2)/10,0,1));
  const a=S.evidence.find(e=>e.id==='om-awal'),b=S.evidence.find(e=>e.id==='om-akhir');
  const pa=a?Math.round(75*clamp(1-(Math.abs(Math.abs(a.meta.m)-RR*OM)-.03)/.3,0,1)):0,pb=b?Math.round(75*clamp(1-(Math.abs(Math.abs(b.meta.m)-RR*OM2)-.03)/.3,0,1)):0;
  const items=[['Sudut kamera dari blur (maks 200)',ps,[['selisih: '+(ea==null?'belum':ea+'°'),ps]]],['Rem tepat di bawah, percobaan '+RM.tries+' (maks 250)',S.remPts||0],['Kemiringan maksimum h (maks 150)',pa+pb,[['sebelum: '+(a?Math.abs(a.meta.m).toFixed(2).replace('.',','):'belum'),pa],['sesudah: '+(b?Math.abs(b.meta.m).toFixed(2).replace('.',','):'belum'),pb]]],['Penalaran: dua tuduhan benar (maks 400)',400],['Petunjuk ('+S.hints+')',-60*S.hints],['Salah tuduh ('+S.wrong+')',-100*S.wrong]];
  return {items,detail:{detik:el,sudut:ea,rem:RM.tries,petunjuk:S.hints,salah:S.wrong}};
}
function learn(){return[
  'Gondola: <code>x = R·sin θ</code>, <code>h = 12 − R·cos θ</code>. Turunannya: <code>(sin)′ = cos</code>, <code>(cos)′ = −sin</code>. Arah blur memberi <code>tan θ = h′/x′</code>, jadi θ = 30°.',
  'Titik terendah: h′ berganti tanda dari − ke +. Titik tertinggi: dari + ke −. Itu uji turunan pertama, dan kamu melakukannya dalam gelap.',
  '<code>h′ = R·ω·sin(ωt)</code>, jadi kemiringan maksimum = R·ω. Tinggi tetap 2 sampai 22 m, tapi kemiringannya membongkar roda yang dipercepat.'
];}

/* ---------- input & gambar ---------- */
function setThFrom(x,y){const c=RD.c;if(!c)return;let a=Math.atan2(x-c.x,y-c.y)/D2R;if(a<0)a+=360;RD.th=Math.round(a)%360;}
function onPointer(type,e){
  const x=e.clientX,y=e.clientY;
  if(S.ui==='roda'){
    if(type==='down'){if(KT.inR(RD.ok,x,y)){saveSudut();return true;}if(KT.inR(RD.no,x,y)){S.ui='none';return true;}RD.drag=true;setThFrom(x,y);return true;}
    if(type==='move'&&RD.drag){setThFrom(x,y);return true;}
    if(type==='up')RD.drag=false;return true;
  }
  if(S.ui==='rem'){if(type==='down'&&KT.inR(RM.btn,x,y))pressRem();return true;}
  return false;
}
function onKey(e){
  const k=e.key;
  if(S.ui==='roda'){const st=e.shiftKey?10:1;
    if(k==='ArrowRight'||k==='d'||k==='D'||k==='ArrowUp')RD.th=(RD.th+st)%360;else if(k==='ArrowLeft'||k==='a'||k==='A'||k==='ArrowDown')RD.th=(RD.th-st+360)%360;
    else if(k==='e'||k==='E'||k==='Enter'||k===' '){if(!e.repeat)saveSudut();}else if(k==='Escape')S.ui='none';else return false;e.preventDefault();return true;}
  if(S.ui==='rem'){if((k==='e'||k==='E'||k===' '||k==='Enter')&&!e.repeat)pressRem();e.preventDefault();return true;}
  return false;
}
function tick(dt){if(S.ui==='rem')remTick(dt);}
function drawOverlay(ctx){if(S.ui==='roda')rodaPanel(ctx);if(S.ui==='rem')remPanel(ctx);}
function drawWorld(ctx){
  // bianglala (tampak samping bergaya kartun)
  const dark=S.flags.twist&&!S.flags.tangkap,rot=G.T*(dark?2*Math.PI/7:OM);
  ctx.strokeStyle='#4a4f5c';ctx.lineWidth=10;ctx.beginPath();ctx.moveTo(WC.x-120,WC.y+WR+40);ctx.lineTo(WC.x,WC.y);ctx.lineTo(WC.x+120,WC.y+WR+40);ctx.stroke();
  ctx.strokeStyle=dark?'#333a4a':'#e8553d';ctx.lineWidth=6;ctx.beginPath();ctx.arc(WC.x,WC.y,WR,0,7);ctx.stroke();
  for(let k=0;k<8;k++){const a=rot-k*45*D2R,gx=WC.x+WR*Math.sin(a),gy=WC.y+WR*Math.cos(a);
    ctx.strokeStyle=dark?'#333a4a':'rgba(232,85,61,.6)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(WC.x,WC.y);ctx.lineTo(gx,gy);ctx.stroke();
    ctx.fillStyle=dark?'#222':['#ffd36b','#2f7fc1','#2f9e5b','#9a8fc2'][k%4];ctx.strokeStyle=INK;ctx.lineWidth=3;ctx.fillRect(gx-14,gy-8,28,22);ctx.strokeRect(gx-14,gy-8,28,22);
    if(!dark){ctx.fillStyle=INK;ctx.font='800 11px '+FD;ctx.textAlign='center';ctx.fillText(String(k+1),gx,gy+8);}}
  ctx.fillStyle=SUN;ctx.strokeStyle=INK;ctx.beginPath();ctx.arc(WC.x,WC.y,14,0,7);ctx.fill();ctx.stroke();
  ctx.fillStyle='#8a6a48';ctx.fillRect(WC.x-60,WC.y+WR+30,120,18);ctx.strokeRect(WC.x-60,WC.y+WR+30,120,18);
}
const CINE={t:0};
function begin(){P.x=TG.anto.x+60;P.y=TG.anto.y-40;S.ui='cine';CINE.t=0;return [WC.x,WC.y];}
function cineStep(dt){CINE.t+=dt;if(CINE.t>4.6)endCine();return [WC.x,WC.y+60];}
function drawCine(ctx){const {H,hs}=V;if(CINE.t<2.4){KT.bigText(ctx,V,'20.14.20',H*.78,58,SUN);KT.subText(ctx,V,'Sebuah foto pamer diunggah. Dari atas bianglala.',H*.78+32*hs);}else KT.bigText(ctx,V,'GONDOLA MANA?',H*.78,52,PAPER);KT.skipHint(ctx,V,G);}
function cineEnd(){card('BAB 1','FOTO DARI ATAS');}
function night(){return S.flags.twist&&!S.flags.tangkap?.75:.5;}
function jitter(it){return(it.ch==='darsono'&&S.flags.omega)?Math.sin(G.T*30)*1.2:0;}
if(window.__TEST__)window.__C={RD,RM,saveSudut,pressRem};

return {
  THEORY,THEORY_START:['k5-dasar'],
  id:'bianglala-1',judul:'Foto dari Bianglala',eyebrow:'Semesta 5, Pantai dan Taman Hiburan. Kasus 1',
  lede:'Malam minggu di pantai. Kalung emas dijambret, lalu si pencuri malah pamer foto dari atas bianglala. Wajahnya tak kelihatan. Blurnya kelihatan.',
  teaser:'<b>Bengkel Pak Harun.</b> Mesin parut kelapa tiba-tiba mengamuk, berputar tiga kali lebih cepat. Ada yang menukar roda gigi. <b>Semesta 6 segera.</b>',
  chapter:'Bab 1: Foto dari Atas',
  WW,WH,SOLIDS,LAMPS,CH,TG,
  ints:INTS,buildWorld,objective,stageHint,ACQ,wrongMsg,onAccuseOk,onLensSave,suspects,score,learn,
  onPointer,onKey,tick,drawOverlay,drawWorld,begin,cineStep,drawCine,cineEnd,night,jitter
};
}
