/* Mesin umum: dunia kanvas, gerak, dialog, Lensa (grafik), papan bukti, tuduhan, skor, jaringan.
   Semua yang khas satu kasus datang dari objek C yang dikembalikan modul kasus. */
import {rpc,bacaSesi} from './net.js';

export function start(createCase){
'use strict';
let C=null;

const INK='#1c2230',PAPER='#fff6e4',SUN='#ffc83d',CORAL='#ff6f47',ALERT='#e5392b',BLUE='#2f7fc1',GOOD='#2f9e5b';
const FD='"Bricolage Grotesque","Arial Black",sans-serif',FU='"Chakra Petch","Trebuchet MS",sans-serif';
const $=id=>document.getElementById(id);
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const lerp=(a,b,t)=>a+(b-a)*t;
const f1=n=>n.toFixed(1).replace('.',',');
const f0=n=>String(Math.round(n));
const rngSeed=seed=>{let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};};

const S={name:'Detektif',flags:{},evidence:[],hints:0,hinted:{},wrong:0,digs:0,pA:0,pB:0,t0:0,ui:'none',playing:false,pin:null,hintShown:''};
const P={x:0,y:0,vx:0,vy:0,face:Math.PI/2,ph:0};
const cam={x:0,y:300};
let W=0,H=0,Z=1,hs=1,dpr=1;
const cv=$('world'),ctx=cv.getContext('2d');
const G={coarse:false,T:0,night:0,flash:0,card:null,shake:0};
try{G.coarse=window.matchMedia('(pointer:coarse)').matches;}catch(e){}
const K={u:false,d:false,l:false,r:false,slow:false};
const T={id:null,bx:0,by:0,px:0,py:0,x:0,y:0,R:60};
let lastObj='';

let WW=0,WH=0,SOLIDS=[],LAMPS=[];
const V={W:0,H:0,Z:1,hs:1};
function resize(){
  dpr=Math.min(window.devicePixelRatio||1,2);
  const vv=window.visualViewport;W=Math.round(vv&&vv.width?vv.width:window.innerWidth);H=Math.round(vv&&vv.height?vv.height:window.innerHeight);
  cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);cv.style.width=W+'px';cv.style.height=H+'px';
  Z=clamp(Math.min(W,H)/560,0.75,1.25);hs=clamp(Math.min(W,H)/520,0.8,1.3);V.W=W;V.H=H;V.Z=Z;V.hs=hs;
}
if(window.visualViewport)window.visualViewport.addEventListener('resize',()=>window.dispatchEvent(new Event('resize')));
window.addEventListener('resize',()=>{resize();if(typeof placeHud==='function')placeHud();if(!$('gp').hidden)gpLayout();});

/* ================= SUARA ================= */
const AU={ctx:null,on:true};
function tone(f,d,type,v,when,f2){
  if(!AU.ctx||!AU.on)return;
  try{const t=AU.ctx.currentTime+(when||0),o=AU.ctx.createOscillator(),g=AU.ctx.createGain();
    o.type=type||'square';o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);
    g.gain.setValueAtTime(v||.04,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);
    o.connect(g).connect(AU.ctx.destination);o.start(t);o.stop(t+d+.02);}catch(e){}
}
const sfx={
  blip:()=>tone(520+Math.random()*80,.04,'square',.018),
  snap:()=>{tone(660,.08,'square',.05);tone(990,.14,'square',.05,.07);},
  ev:()=>{tone(523,.08,'triangle',.07);tone(659,.08,'triangle',.07,.08);tone(784,.16,'triangle',.07,.16);},
  bad:()=>tone(160,.3,'sawtooth',.05,0,90),
  shot:()=>{tone(1800,.05,'square',.06);tone(240,.18,'sawtooth',.06,.04,80);},
  twist:()=>{tone(220,.5,'sawtooth',.05,0,110);tone(233,.6,'sawtooth',.04,.1,104);},
  win:()=>{[523,659,784,1047].forEach((f,i)=>tone(f,.2,'triangle',.07,i*.12));}
};
$('b-snd').addEventListener('click',()=>{AU.on=!AU.on;$('b-snd').textContent='Suara: '+(AU.on?'nyala':'mati');$('b-snd').setAttribute('aria-pressed',String(AU.on));});

function addEv(ev){
  const i=S.evidence.findIndex(e=>e.id===ev.id);
  if(i>=0)S.evidence[i]=ev;else{S.evidence.push(ev);toast('Bukti baru: '+ev.title);sfx.ev();}
  $('b-count').textContent=String(S.evidence.length);
}
function card(a,b){G.card={t:0,a,b};}
/* ================= DIALOG ================= */
let DLG=null;
function drawFace(who,mood){
  const c=$('dlg-face'),g=c.getContext('2d'),ch=C.CH[who];g.clearRect(0,0,144,144);
  g.fillStyle=ch?ch.body:SUN;g.fillRect(0,0,144,144);
  g.lineWidth=6;g.strokeStyle=INK;g.lineJoin='round';
  if(!ch){g.fillStyle=PAPER;g.beginPath();g.arc(72,72,44,0,7);g.fill();g.stroke();g.fillStyle=INK;g.font='800 64px '+FD;g.textAlign='center';g.fillText('!',72,95);return;}
  g.fillStyle='#f0c8a0';g.beginPath();g.arc(72,84,44,0,7);g.fill();g.stroke();
  g.fillStyle=ch.cap;g.beginPath();g.arc(72,76,46,Math.PI,0);g.closePath();g.fill();g.stroke();
  g.beginPath();g.rect(22,70,100,12);g.fill();g.stroke();
  g.fillStyle=INK;
  if(mood==='panik'){g.fillStyle='#fff';for(const x of[54,90]){g.beginPath();g.arc(x,96,9,0,7);g.fill();g.stroke();}g.fillStyle=INK;for(const x of[54,90]){g.beginPath();g.arc(x,96,3,0,7);g.fill();}g.beginPath();g.ellipse(72,116,8,6,0,0,7);g.fill();}
  else if(mood==='curiga'){g.fillRect(44,94,20,5);g.fillRect(80,94,20,5);g.fillRect(60,114,24,5);}
  else{for(const x of[54,90]){g.beginPath();g.arc(x,96,5,0,7);g.fill();}g.lineWidth=5;g.beginPath();if(mood==='senyum')g.arc(72,106,14,.15*Math.PI,.85*Math.PI);else g.arc(72,104,10,.2*Math.PI,.8*Math.PI);g.stroke();}
}
function say(lines,done){
  DLG={lines:lines.map(l=>[l[0],l[1].replace('{name}',S.name),l[2]]),i:0,n:0,done};
  S.ui='dlg';$('dlg').hidden=false;showLine();
}
function showLine(){const l=DLG.lines[DLG.i];DLG.n=0;$('dlg-who').textContent=C.CH[l[0]]?C.CH[l[0]].n:l[0];$('dlg-text').textContent='';drawFace(l[0],l[2]);}
function nextDlg(){
  if(!DLG)return;const l=DLG.lines[DLG.i];
  if(DLG.n<l[1].length){DLG.n=l[1].length;$('dlg-text').textContent=l[1];return;}
  if(DLG.i<DLG.lines.length-1){DLG.i++;showLine();return;}
  const d=DLG.done;DLG=null;$('dlg').hidden=true;S.ui='none';if(d)d();
}
$('dlg').addEventListener('click',nextDlg);
let toastT=0;
function toast(m){const t=$('toast');t.textContent=m;t.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>{t.hidden=true;},2800);}
/* ================= LENSA (alat grafik) ================= */
const GP={src:null,series:{},cur:null,A:0,B:0,locked:false,act:0,Tmax:20,Smax:300,camS:null,gmin:0,gmax:100,cw:600,ch:300,sh:54,ph:220,vh:0,fx:0,trace:new Map(),info:null,tip:''};
const ML=46,MR=14,MB=30;
const gx=t=>ML+((t-GP.T0)/(GP.Tmax-GP.T0))*(GP.cw-ML-MR),gxi=x=>GP.T0+(x-ML)/(GP.cw-ML-MR)*(GP.Tmax-GP.T0);
const gy=s=>GP.sh+GP.ph-MB-(s/GP.Smax)*(GP.ph-MB-10);
function slopeAt(pts,t){
  const win=0.3;let n=0,a=0,b=0,c=0,d=0;
  for(const p of pts){if(Math.abs(p[0]-t)<=win+1e-6){n++;a+=p[0];b+=p[1];c+=p[0]*p[0];d+=p[0]*p[1];}}
  if(n<2)return 0;const q=n*c-a*a;return q?(n*d-a*b)/q:0;
}
function sAt(pts,t){
  if(t<=pts[0][0])return pts[0][1];
  let lo=0,hi=pts.length-1;if(t>=pts[hi][0])return pts[hi][1];
  while(hi-lo>1){const m=(lo+hi)>>1;if(pts[m][0]<=t)lo=m;else hi=m;}
  const p=pts[lo],q=pts[hi];return lerp(p[1],q[1],(t-p[0])/Math.max(1e-9,q[0]-p[0]));
}
function niceStep(range,target){const raw=range/target,p=Math.pow(10,Math.floor(Math.log10(raw))),n=raw/p;return(n<1.5?1:n<3.5?2:n<7.5?5:10)*p;}
function gpLayout(){
  const c=$('gp-cv'),w=Math.min(720,window.innerWidth-52);
  GP.ph=clamp(Math.round(w*.4),150,Math.max(150,Math.round(window.innerHeight*.36)));
  GP.vh=GP.src==='ext'?96:0;GP.cw=w;GP.ch=GP.sh+GP.ph+GP.vh;
  c.style.width=w+'px';c.style.height=GP.ch+'px';c.width=Math.round(w*dpr);c.height=Math.round(GP.ch*dpr);gpDraw();
}
function gpOpen(cfg){
  Object.assign(GP,{T0:0,xs:'t',xu:'dtk',yu:'m',ru:'m/s',xlab:'t (detik)',pinOK:false,flat:false,k:3.6,unit:'km/jam',sym:'s',ylab:'s (meter)',pinWhere:'Pos A'},cfg);GP.trace=new Map();GP.bT0=GP.T0;GP.bTmax=GP.Tmax;GP.fx=0;S.ui='gp';$('gp').hidden=false;
  $('gp-title').textContent=cfg.title;
  const tabs=$('gp-tabs');tabs.innerHTML='';const ids=Object.keys(GP.series);tabs.hidden=ids.length<2;
  for(const id of ids){
    const b=document.createElement('button');b.type='button';b.className='tab';b.setAttribute('aria-pressed',String(id===GP.cur));
    const sw=document.createElement('span');sw.className='sw';sw.style.background=GP.series[id].col;b.append(sw,GP.series[id].name);
    b.addEventListener('click',()=>{GP.cur=id;for(const x of tabs.children)x.setAttribute('aria-pressed','false');b.setAttribute('aria-pressed','true');const te=tEnd(),tb=tBeg();GP.A=clamp(GP.A,tb,te);GP.B=clamp(GP.B,tb,te);$('gp-save').textContent='Simpan bukti';gpDraw();});
    tabs.append(b);
  }
  const te=tEnd();
  if(cfg.startLocked){GP.A=GP.B=te*.2;GP.locked=true;}else{GP.A=te*.3;GP.B=te*.75;GP.locked=false;}
  {const tb=tBeg();GP.A=clamp(GP.A,tb,te);GP.B=clamp(GP.B,tb,te);}
  $('gp-pin').hidden=!(GP.src==='ext'||GP.pinOK);$('gp-save').hidden=GP.src==='ext'||GP.pinOK;$('gp-save').textContent='Simpan bukti';
  gpLayout();setTimeout(()=>$('gp-cv').focus({preventScroll:true}),30);
}
const tEnd=()=>{const p=GP.series[GP.cur].pts;return p[p.length-1][0];};
const tBeg=()=>GP.series[GP.cur].pts[0][0];
function tryLock(){
  if(!GP.locked&&Math.abs(gx(GP.A)-gx(GP.B))<9){GP.locked=true;GP.B=GP.A;GP.fx=1;sfx.snap();}
}
function gpDraw(){
  const ser=GP.series[GP.cur];if(!ser)return;const pts=ser.pts,SYM=ser.sym||GP.sym,XS=ser.xs||GP.xs,XU=ser.xu||GP.xu,YU=ser.yu!=null?ser.yu:GP.yu,RU=ser.ru||GP.ru,DP=ser.dp!=null?ser.dp:(GP.dp!=null?GP.dp:1),fm=v=>(Math.round(v*Math.pow(10,DP))/Math.pow(10,DP)).toFixed(DP).replace('.',',');if(ser.Smax)GP.Smax=ser.Smax;GP.T0=ser.T0!=null?ser.T0:GP.bT0;GP.Tmax=ser.Tmax!=null?ser.Tmax:GP.bTmax;
  const c=$('gp-cv'),g=c.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,GP.cw,GP.ch);
  g.fillStyle='#fffdf6';g.fillRect(0,0,GP.cw,GP.ch);g.textBaseline='alphabetic';
  if(GP.locked)GP.B=GP.A;
  const tA=GP.A,tB=GP.B,sA=sAt(pts,tA),sB=sAt(pts,tB);
  let m,info;
  if(GP.locked){m=slopeAt(pts,tA);const atCam=GP.camS!=null&&Math.abs(sA-GP.camS)<=6&&tA<20;info={kind:'inst',t:tA,s:sA,m,atCam};}
  else{const a=Math.min(tA,tB),b=Math.max(tA,tB),s1=sAt(pts,a),s2=sAt(pts,b);m=(b-a)>0.02?(s2-s1)/(b-a):0;info={kind:'avg',t1:a,t2:b,s1,s2,m,fromStart:s1<=6&&GP.camS!=null&&Math.abs(s2-GP.camS)<=8};}
  GP.info=info;const kmh=m*GP.k;
  if(GP.src==='ext'&&GP.locked)GP.trace.set(Math.round(tA*4),kmh);
  /* strip: reka ulang di jalan */
  const sw=GP.cw-ML-MR-78,stx=s=>ML+(s/GP.Smax)*sw,ry=14,rh=24;
  if(ser.kind!=='plain'){
  g.fillStyle=ser.kind==='run'?'#d98c5f':ser.kind==='ball'?'#1d2547':'#343a47';g.fillRect(ML,ry,sw,rh);g.strokeStyle=INK;g.lineWidth=2;g.strokeRect(ML,ry,sw,rh);
  g.fillStyle='rgba(255,246,228,.6)';if(ser.kind!=='ball')for(let x=ML+8;x<ML+sw-10;x+=22)g.fillRect(x,ry+rh/2-1,10,2);
  g.font='600 10px '+FU;g.fillStyle=INK;g.textAlign='left';if(ser.kind!=='ball'){g.fillText('0 m',ML,ry+rh+12);g.textAlign='right';g.fillText(GP.Smax+' m',ML+sw,ry+rh+12);}
  if(GP.camS!=null){g.fillStyle=ALERT;g.fillRect(stx(GP.camS)-2,ry-4,4,rh+8);g.textAlign='center';g.font='700 10px '+FU;g.fillText('kamera',stx(GP.camS),ry+rh+12);}
  const bike=(s,col,alpha,dir)=>{const ball=ser.kind==='ball',x=ball?ML+sw/2:stx(s),y=ball?ry+rh-5-(Math.max(0,s)/GP.Smax)*(rh-10):ry+rh/2;g.globalAlpha=alpha;g.fillStyle=col;g.strokeStyle=INK;g.lineWidth=2;
    if(ser.kind==='run'||ser.kind==='ball'){g.beginPath();g.arc(x,y,ser.kind==='ball'?5:7,0,7);g.fill();g.stroke();}
    else{g.fillRect(x-11,y-5,22,10);g.strokeRect(x-11,y-5,22,10);g.fillStyle=INK;g.fillRect(x+(dir<0?-11:8),y-8,3,16);}
    g.globalAlpha=1;};
  if(!GP.locked)bike(sB,'#fff',.8,1);
  bike(sA,ser.col,1,m<-0.3?-1:1);
  }
  /* jarum kecepatan */
  const gcx=GP.cw-MR-36,gcy=42,gr=28;
  g.lineWidth=7;g.strokeStyle='#e9dfc8';g.beginPath();g.arc(gcx,gcy,gr,Math.PI,2*Math.PI);g.stroke();
  const fr=clamp((kmh-GP.gmin)/(GP.gmax-GP.gmin),0,1),z=clamp((0-GP.gmin)/(GP.gmax-GP.gmin),0,1);
  g.strokeStyle=GP.locked?ALERT:BLUE;g.beginPath();g.arc(gcx,gcy,gr,Math.PI*(1+Math.min(z,fr)),Math.PI*(1+Math.max(z,fr)));g.stroke();
  const na=Math.PI*(1+fr);g.strokeStyle=INK;g.lineWidth=3;g.beginPath();g.moveTo(gcx,gcy);g.lineTo(gcx+Math.cos(na)*(gr-4),gcy+Math.sin(na)*(gr-4));g.stroke();
  g.fillStyle=INK;g.beginPath();g.arc(gcx,gcy,4,0,7);g.fill();
  /* plot s(t) */
  const top=GP.sh+10,bot=GP.sh+GP.ph-MB;
  g.font='600 11px '+FU;
  const stt=niceStep(GP.Tmax-GP.T0,8),sts=niceStep(GP.Smax,5);
  g.strokeStyle='rgba(28,34,48,.13)';g.lineWidth=1;g.fillStyle=INK;g.textAlign='center';
  for(let t=Math.ceil(GP.T0/stt-1e-9)*stt;t<=GP.Tmax+1e-6;t+=stt){g.beginPath();g.moveTo(gx(t),top);g.lineTo(gx(t),bot);g.stroke();g.fillText(String(Math.round(t*100)/100).replace('.',','),gx(t),bot+14);}
  g.textAlign='right';
  for(let s=0;s<=GP.Smax+1e-6;s+=sts){g.beginPath();g.moveTo(ML,gy(s));g.lineTo(GP.cw-MR,gy(s));g.stroke();g.fillText(String(Math.round(s)),ML-5,gy(s)+4);}
  g.strokeStyle=INK;g.lineWidth=2;g.beginPath();g.moveTo(ML,top);g.lineTo(ML,bot);g.lineTo(GP.cw-MR,bot);g.stroke();
  g.textAlign='right';g.font='700 11px '+FU;g.fillText(ser.xlab||GP.xlab,GP.cw-MR,bot+26);
  g.textAlign='left';g.fillText(ser.ylab||GP.ylab,ML+6,top+10);
  if(GP.camS!=null){g.strokeStyle=ALERT;g.lineWidth=2;g.setLineDash([7,5]);g.beginPath();g.moveTo(ML,gy(GP.camS));g.lineTo(GP.cw-MR,gy(GP.camS));g.stroke();g.setLineDash([]);
    g.fillStyle=ALERT;g.textAlign='right';g.fillText('garis kamera '+GP.camS+' m',GP.cw-MR-4,gy(GP.camS)-5);}
  if(ser.gaps)for(const q of ser.gaps){const a=gx(q[0]),b=gx(Math.min(q[1],GP.Tmax));g.fillStyle='rgba(28,34,48,.16)';g.fillRect(a,top,b-a,bot-top);
    g.strokeStyle='rgba(28,34,48,.25)';g.lineWidth=1;for(let x=a-(bot-top);x<b;x+=12){g.beginPath();g.moveTo(Math.max(a,x),top+Math.max(0,a-x));g.lineTo(Math.min(b,x+(bot-top)),top+Math.min(bot-top,b-x));g.stroke();}
    g.fillStyle=INK;g.font='700 11px '+FU;g.textAlign='center';g.fillText(q[2],(a+b)/2,(top+bot)/2);}
  g.strokeStyle=ser.col;g.lineWidth=3.5;g.lineJoin='round';g.beginPath();
  const step=Math.max(1,Math.floor(pts.length/600));
  for(let i=0;i<pts.length;i+=step){const X=gx(pts[i][0]),Y=gy(pts[i][1]);if(i)g.lineTo(X,Y);else g.moveTo(X,Y);}
  g.lineTo(gx(pts[pts.length-1][0]),gy(pts[pts.length-1][1]));g.stroke();
  g.save();g.beginPath();g.rect(ML,top,GP.cw-ML-MR,bot-top);g.clip();
  if(GP.locked){
    const d=(GP.Tmax-GP.T0)*.13;g.strokeStyle=ALERT;g.lineWidth=3;g.beginPath();g.moveTo(gx(tA-d),gy(sA-m*d));g.lineTo(gx(tA+d),gy(sA+m*d));g.stroke();
  }else{
    const a=info.t1,b=info.t2,d=(GP.Tmax-GP.T0)*.04;
    g.strokeStyle='rgba(47,127,193,.55)';g.lineWidth=2;g.setLineDash([5,4]);g.beginPath();g.moveTo(gx(a),gy(info.s1));g.lineTo(gx(b),gy(info.s1));g.lineTo(gx(b),gy(info.s2));g.stroke();g.setLineDash([]);
    g.fillStyle=BLUE;g.font='700 11px '+FU;g.textAlign='center';g.fillText('Δt',(gx(a)+gx(b))/2,gy(info.s1)+13);g.textAlign='left';g.fillText('Δs',gx(b)+5,(gy(info.s1)+gy(info.s2))/2+4);
    g.strokeStyle=BLUE;g.lineWidth=3;g.beginPath();g.moveTo(gx(a-d),gy(info.s1-m*d));g.lineTo(gx(b+d),gy(info.s2+m*d));g.stroke();
  }
  g.restore();
  const mk=(t,s,col,lab)=>{const X=gx(t),Y=gy(s);g.fillStyle=col;g.strokeStyle=INK;g.lineWidth=2.5;g.beginPath();g.arc(X,Y,8,0,7);g.fill();g.stroke();g.fillStyle=INK;g.font='800 10px '+FU;g.textAlign='center';g.fillText(lab,X,Y+3.5);};
  if(!GP.locked)mk(tB,sB,'#fff','B');
  mk(tA,sA,GP.locked?SUN:'#fff','A');
  if(GP.fx>0){g.strokeStyle=ALERT;g.globalAlpha=GP.fx;g.lineWidth=4;g.beginPath();g.arc(gx(tA),gy(sA),8+(1-GP.fx)*46,0,7);g.stroke();g.globalAlpha=1;}
  /* jejak kemiringan s'(t) */
  if(GP.vh){
    const y0=GP.sh+GP.ph+8,y1=GP.ch-10,vy=v=>y1-((v-GP.gmin)/(GP.gmax-GP.gmin))*(y1-y0);
    g.fillStyle='rgba(47,158,91,.10)';g.fillRect(ML,y0,GP.cw-ML-MR,vy(0)-y0);
    g.fillStyle='rgba(229,57,43,.10)';g.fillRect(ML,vy(0),GP.cw-ML-MR,y1-vy(0));
    g.strokeStyle=INK;g.lineWidth=2;g.beginPath();g.moveTo(ML,y0);g.lineTo(ML,y1);g.stroke();g.beginPath();g.moveTo(ML,vy(0));g.lineTo(GP.cw-MR,vy(0));g.stroke();
    g.font='700 11px '+FU;g.fillStyle=INK;g.textAlign='left';g.fillText("jejak kemiringan s′(t), km/jam",ML+6,y0+11);
    g.textAlign='right';g.fillStyle=GOOD;g.fillText('maju',GP.cw-MR-4,y0+11);g.fillStyle=ALERT;g.fillText('mundur',GP.cw-MR-4,y1-3);g.fillStyle=INK;g.fillText('0',ML-5,vy(0)+4);
    const keys=[...GP.trace.keys()].sort((a,b)=>a-b);
    g.strokeStyle=ALERT;g.lineWidth=3;g.lineJoin='round';g.beginPath();let prev=null;
    for(const k of keys){const X=gx(k/4),Y=vy(GP.trace.get(k));if(prev!==null&&k-prev<=3)g.lineTo(X,Y);else{g.moveTo(X,Y);g.lineTo(X+.5,Y);}prev=k;}
    g.stroke();
    if(GP.locked){g.fillStyle=SUN;g.strokeStyle=INK;g.lineWidth=2.5;g.beginPath();g.arc(gx(tA),vy(kmh),6,0,7);g.fill();g.stroke();}
  }
  /* bacaan */
  $('gp-num').querySelector('small').textContent=GP.unit;$('gp-num').firstChild.nodeValue=(kmh<-0.5?'-':'')+f0(Math.abs(kmh));
  $('gp-num').style.color=GP.locked?ALERT:BLUE;
  let html;
  if(GP.locked){
    const st=GP.flat?(Math.abs(m)<0.25?' <span class="tag">puncak: kemiringan nol</span>':m<0?' <span class="tag no">turun</span>':' <span class="tag no">naik</span>'):GP.src==='ext'?(Math.abs(m)<0.25?' <span class="tag">berhenti</span>':m<0?' <span class="tag no">mundur ke arah Pos A</span>':' <span class="tag no">maju</span>'):'';
    html='<b>Garis singgung</b> di '+XS+' = <b>'+fm(tA)+' '+XU+'</b>, '+SYM+' = <b>'+fm(sA)+(YU?' '+YU:'')+'</b>'+(GP.camS!=null&&GP.src!=='ext'?' <span class="tag'+(info.atCam?'':' no')+'">'+(info.atCam?'tepat di garis kamera':'bukan di garis kamera')+'</span>':'')+st+'<br><code>'+SYM+'′('+XS+') = d'+SYM+'/d'+XS+' = '+fm(m)+' '+RU+'</code> '+(SYM==='s'?'Kecepatan':'Kemiringan')+(XS==='t'?' di satu momen.':' di satu titik.');
  }else{
    html='<b>Garis potong</b> A ke B, selang <b>Δ'+XS+' = '+fm(info.t2-info.t1)+' '+XU+'</b><br><code>Δ'+SYM+'/Δ'+XS+' = '+fm(m)+' '+RU+'</code> Ini rata-rata. Tarik B sampai menempel ke A.';
  }
  $('gp-read').innerHTML=html;$('gp-tip').textContent=GP.tip;$('gp-split').hidden=!GP.locked;
}
function gpPointer(e,down){
  const r=$('gp-cv').getBoundingClientRect(),x=e.clientX-r.left,ser=GP.series[GP.cur];
  let t=clamp(gxi(x),tBeg(),tEnd());
  if(down)GP.act=(!GP.locked&&Math.abs(gx(GP.B)-x)<Math.abs(gx(GP.A)-x))?1:0;
  if(GP.locked&&GP.camS!=null&&ser.tc&&t<20&&Math.abs(sAt(ser.pts,t)-GP.camS)<4)t=ser.tc;
  if(GP.locked&&ser.snap)for(const q of ser.snap)if(Math.abs(gx(t)-gx(q))<9)t=q;
  if(GP.act===1&&!GP.locked)GP.B=t;else GP.A=t;
  tryLock();gpDraw();
}
let gpDown=false;
$('gp-cv').addEventListener('pointerdown',e=>{gpDown=true;try{$('gp-cv').setPointerCapture(e.pointerId);}catch(err){}gpPointer(e,true);e.preventDefault();});
$('gp-cv').addEventListener('pointermove',e=>{if(gpDown)gpPointer(e,false);});
$('gp-cv').addEventListener('pointerup',()=>{gpDown=false;});
$('gp-cv').addEventListener('pointercancel',()=>{gpDown=false;});
$('gp-cv').addEventListener('keydown',e=>{
  if(!GP.series[GP.cur])return;
  if(e.key==='ArrowLeft'||e.key==='ArrowRight'){const d=(e.key==='ArrowRight'?1:-1)*(GP.Tmax-GP.T0)*(e.shiftKey?0.001:0.005);
    if(GP.act===1&&!GP.locked)GP.B=clamp(GP.B+d,tBeg(),tEnd());else GP.A=clamp(GP.A+d,tBeg(),tEnd());tryLock();gpDraw();e.preventDefault();}
  else if(e.key==='Tab'&&!GP.locked){GP.act=1-GP.act;e.preventDefault();}
});
$('gp-split').addEventListener('click',()=>{const te=tEnd(),d=te*.3;GP.locked=false;GP.B=GP.A+d<=te?GP.A+d:GP.A-d;gpDraw();});
$('gp-close').addEventListener('click',closeGp);
function closeGp(){$('gp').hidden=true;S.ui='none';}
$('gp-save').addEventListener('click',()=>{
  const i=GP.info;if(!i)return;
  const r=C.onLensSave(i,GP);
  if(r==='tip')gpDraw();
  else if(r==='saved')$('gp-save').textContent='Tersimpan';
});
$('gp-pin').addEventListener('click',()=>{
  const i=GP.info;if(!i||i.kind!=='inst'){toast('Kunci dulu titik B ke titik A');return;}
  if(C.canPin&&!C.canPin(GP,i))return;
  S.pin={s:i.s};sfx.snap();closeGp();toast('Pin dipasang di '+f0(i.s)+' m dari '+GP.pinWhere+'. Datangi tempatnya.');
});
/* ================= PAPAN BUKTI ================= */
function openBoard(){S.ui='board';$('board').hidden=false;renderBoard();}
function renderBoard(){
  const f=S.flags,su=$('bd-sus');su.innerHTML='';
  const chip=(t,c)=>{const s=document.createElement('span');s.textContent=t;if(c)s.className=c;su.append(s);};
  C.suspects(chip);
  const L=$('bd-list');L.innerHTML='';
  if(!S.evidence.length){const p=document.createElement('p');p.textContent='Belum ada bukti.';L.append(p);}
  for(const e of S.evidence){const d=document.createElement('div');d.className='ev'+(e.type==='meas'?' m':'');const b=document.createElement('b');b.textContent=e.title;d.append(b,document.createTextNode(e.text));L.append(d);}
  $('bd-hint').textContent=S.hintShown?('Petunjuk: '+S.hintShown):'';
}
$('b-board').addEventListener('click',()=>{if(S.ui==='none')openBoard();});
/* ================= TEORI ================= */
const TEO={got:[],seen:new Set()};
function teori(id,quiet){
  const th=C.THEORY&&C.THEORY[id];if(!th||TEO.got.includes(id))return;
  TEO.got.push(id);
  if(!quiet){$('t-new').hidden=false;toast('Teori baru: '+th.t+(G.coarse?' (ketuk Teori)':' (tekan T)'));sfx.ev();}else TEO.seen.add(id);
}
function openTeori(){
  S.ui='teori';$('teori').hidden=false;$('toast').hidden=true;$('t-new').hidden=true;
  const L=$('te-list');L.innerHTML='';
  const ids=Object.keys(C.THEORY||{}).filter(k=>TEO.got.includes(k)),lastNew=TEO.got[TEO.got.length-1];
  if(!ids.length){L.innerHTML='<p>Belum ada teori terbuka.</p>';}
  for(const k of ids){const th=C.THEORY[k],d=document.createElement('details');if(k===lastNew)d.open=true;
    d.innerHTML='<summary>'+th.t+(th.sub?'<small>'+th.sub+'</small>':'')+(TEO.seen.has(k)?'':'<span class="new">baru</span>')+'</summary><div class="bd">'+th.h+'</div>';L.append(d);TEO.seen.add(k);}
  const lk=L.querySelector('details[open]');if(lk)setTimeout(()=>lk.scrollIntoView({block:'nearest'}),30);
}
function closeTeori(){$('teori').hidden=true;S.ui='none';}
$('b-teori').addEventListener('click',()=>{if(S.ui==='none')openTeori();});
$('te-close').addEventListener('click',closeTeori);
$('bd-close').addEventListener('click',()=>{$('board').hidden=true;S.ui='none';});
$('bd-hintbtn').addEventListener('click',()=>{const h=C.stageHint();if(!S.hinted[h[0]]){S.hinted[h[0]]=true;S.hints++;}S.hintShown=h[1];renderBoard();});

/* ================= TUDUHAN ================= */
let ACC={n:1,who:null,why:null};
function openAccuse(n){
  const q=C.ACQ[n];ACC={n,who:null,why:null};S.ui='accuse';$('accuse').hidden=false;$('ac-msg').textContent='';
  $('ac-title').textContent=q.title;$('ac-q').textContent=q.q;
  const fill=(el,arr,key)=>{el.innerHTML='';for(const [id,t] of arr){const b=document.createElement('button');b.type='button';b.className='pick';b.setAttribute('aria-pressed','false');b.textContent=t;
    b.addEventListener('click',()=>{ACC[key]=id;for(const x of el.children)x.setAttribute('aria-pressed','false');b.setAttribute('aria-pressed','true');});el.append(b);}};
  fill($('ac-who'),q.who,'who');fill($('ac-why'),q.why,'why');
}
$('ac-close').addEventListener('click',()=>{$('accuse').hidden=true;S.ui='none';});
$('ac-go').addEventListener('click',()=>{
  const m=$('ac-msg'),q=C.ACQ[ACC.n];
  if(!ACC.who||!ACC.why){m.textContent='Pilih jawaban dan bukti kuncimu dulu.';return;}
  if(ACC.who===q.ans&&ACC.why==='ok'){
    $('accuse').hidden=true;S.ui='none';
    C.onAccuseOk(ACC.n);
    return;
  }
  S.wrong++;sfx.bad();
  m.textContent=C.wrongMsg(ACC.n,ACC);
});

/* ================= AKHIR ================= */
function endCase(){
  $('toast').hidden=true;S.ui='end';$('end').hidden=false;$('hud').hidden=true;$('hud-r').hidden=true;
  const el=(Date.now()-S.t0)/1000,tstr=Math.floor(el/60)+':'+String(Math.floor(el%60)).padStart(2,'0');
  const {items,detail}=C.score(el);

  const total=Math.max(0,items.reduce((a,b)=>a+b[1],0));
  $('e-score').textContent=total.toLocaleString('id-ID');
  const bd=$('e-break');bd.innerHTML='';
  const row=(a,b,cls)=>{const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=a;dd.textContent=(b>=0?'+':'')+b;if(cls){dt.className=cls;dd.className=cls;}bd.append(dt,dd);};
  for(const it of items){row(it[0],it[1]);if(it[2])for(const s of it[2])row(s[0],s[1],'sub');}
  {const dt=document.createElement('dt'),dd=document.createElement('dd');dt.className=dd.className='tot';dt.textContent='Total';dd.textContent=total.toLocaleString('id-ID');bd.append(dt,dd);}
  {const p=document.createElement('p');p.className='note';p.style.gridColumn='1/-1';p.textContent='Waktu '+tstr+' hanya menentukan urutan jika skor sama.';bd.append(p);}
  {const p=document.createElement('p');p.className='note';p.id='save-note';p.style.gridColumn='1/-1';p.textContent=NET.kunci?'Menyimpan skor...':'Mode coba: skor tidak disimpan.';bd.append(p);}
  if(NET.kunci){saveResult(total,detail).then(()=>pollRank());}
  const L=$('e-learn');L.innerHTML='';
  for(const h of C.learn()){const d=document.createElement('div');d.className='learn';d.innerHTML=h;L.append(d);}
  const list=[['Raka',960],['Dinda',900],['Bima',840],['Salsa',760],['Fajar',660],['Nayla',540]].map(b=>({n:b[0],s:b[1]}));list.push({n:S.name,s:total,me:true});list.sort((a,b)=>b.s-a.s);
  renderRank(list,'(contoh data)');
}
$('e-again').addEventListener('click',()=>{location.reload();});

function activeInts(){
  return C.ints.filter(i=>!i.when||i.when()).concat(C.extraInts());
}
function nearestInt(){let best=null,bd=1e9;for(const it of activeInts()){const d=Math.hypot(it.t.x-P.x,it.t.y-P.y);if(d<82&&d<bd){bd=d;best=it;}}return best;}
function endCine(){if(S.ui!=='cine')return;S.ui='none';$('hud').hidden=false;$('hud-r').hidden=false;placeHud();C.cineEnd();}
function actionPress(){
  if(S.ui==='cine'){endCine();return;}
  if(S.ui==='dlg'){nextDlg();return;}
  if(S.ui!=='none'||!S.playing)return;
  const n=nearestInt();if(n)n.act();
}
window.addEventListener('keydown',e=>{
  if(!S.playing)return;const tag=(e.target&&e.target.tagName)||'',k=e.key;
  if(C.onKey&&C.onKey(e))return;
  if(S.ui==='none'||S.ui==='dlg'||S.ui==='cine'){
    if(k==='ArrowUp'||k==='w'||k==='W'){K.u=true;e.preventDefault();}
    else if(k==='ArrowDown'||k==='s'||k==='S'){K.d=true;e.preventDefault();}
    else if(k==='ArrowLeft'||k==='a'||k==='A'){K.l=true;e.preventDefault();}
    else if(k==='ArrowRight'||k==='d'||k==='D'){K.r=true;e.preventDefault();}
    else if(k==='Shift')K.slow=true;
    else if(k==='e'||k==='E'){actionPress();e.preventDefault();}
    else if(k==='Enter'||k===' '){if(tag!=='BUTTON'){actionPress();e.preventDefault();}}
    else if((k==='b'||k==='B')&&S.ui==='none')openBoard();
    else if((k==='t'||k==='T')&&S.ui==='none')openTeori();
  }
  if(k==='Escape'){if(S.ui==='gp')closeGp();else if(S.ui==='board'){$('board').hidden=true;S.ui='none';}else if(S.ui==='teori')closeTeori();else if(S.ui==='accuse'){$('accuse').hidden=true;S.ui='none';}}
});
window.addEventListener('keyup',e=>{const k=e.key;
  if(k==='ArrowUp'||k==='w'||k==='W')K.u=false;else if(k==='ArrowDown'||k==='s'||k==='S')K.d=false;
  else if(k==='ArrowLeft'||k==='a'||k==='A')K.l=false;else if(k==='ArrowRight'||k==='d'||k==='D')K.r=false;else if(k==='Shift')K.slow=false;});
window.addEventListener('blur',()=>{K.u=K.d=K.l=K.r=K.slow=false;});
cv.addEventListener('pointerdown',e=>{
  if(!S.playing)return;e.preventDefault();
  if(C.onPointer&&C.onPointer('down',e))return;
  if(S.ui==='cine'){endCine();return;}
  if(S.ui==='dlg'){nextDlg();return;}
  if(S.ui!=='none')return;
  T.R=clamp(Math.min(W,H)*.14,46,76);
  if(e.clientX<W*.5){if(T.id===null){try{cv.setPointerCapture(e.pointerId);}catch(err){}T.id=e.pointerId;T.bx=T.px=e.clientX;T.by=T.py=e.clientY;T.x=0;T.y=0;}}
  else actionPress();
});
cv.addEventListener('pointermove',e=>{
  if(C.onPointer&&C.onPointer('move',e))return;
  if(e.pointerId!==T.id)return;let dx=e.clientX-T.bx,dy=e.clientY-T.by;const d=Math.hypot(dx,dy);
  if(d>T.R){dx*=T.R/d;dy*=T.R/d;}T.px=T.bx+dx;T.py=T.by+dy;
  const nx=dx/T.R,ny=dy/T.R;if(Math.hypot(nx,ny)<.14){T.x=0;T.y=0;}else{T.x=nx;T.y=ny;}
});
const endPtr=e=>{if(C.onPointer)C.onPointer('up',e);if(e.pointerId===T.id){T.id=null;T.x=0;T.y=0;}};
cv.addEventListener('pointerup',endPtr);cv.addEventListener('pointercancel',endPtr);
/* ================= UPDATE ================= */
const MAXV=220,PR=14;
function hit(x,y){for(const r of SOLIDS){if(x>r.x-PR&&x<r.x+r.w+PR&&y>r.y-PR&&y<r.y+r.h+PR)return true;}return false;}
function update(dt){
  G.T+=dt;
  C.tick(dt);
  if(G.flash>0)G.flash=Math.max(0,G.flash-dt*1.6);
  if(G.shake>0)G.shake=Math.max(0,G.shake-dt);
  if(G.card){G.card.t+=dt;if(G.card.t>2.8)G.card=null;}
  if(GP.fx>0&&!$('gp').hidden){GP.fx=Math.max(0,GP.fx-dt*2.2);gpDraw();}
  const nt=C.night();G.night+=(nt-G.night)*Math.min(1,dt*.8);
  if(DLG){const l=DLG.lines[DLG.i][1];if(DLG.n<l.length){const b=Math.floor(DLG.n);DLG.n=Math.min(l.length,DLG.n+dt*55);const a=Math.floor(DLG.n);if(a!==b){$('dlg-text').textContent=l.slice(0,a);if(a%3===0)sfx.blip();}}}
  if(!S.playing)return;
  const vw=W/Z,vh=H/Z;let fx=P.x,fy=P.y;
  if(S.ui==='cine'){
    const f=C.cineStep(dt);fx=f[0];fy=f[1];
  }else{
    let tx=0,ty=0;
    if(S.ui==='none'){
      const ax=(K.r?1:0)-(K.l?1:0)+T.x,ay=(K.d?1:0)-(K.u?1:0)+T.y,m=Math.hypot(ax,ay);
      if(m>0){const cap=Math.min(1,m),mag=(K.slow&&T.id===null)?Math.min(cap,.45):cap;tx=ax/m*mag;ty=ay/m*mag;}
    }
    const k=1-Math.exp(-dt/0.12);
    P.vx+=(tx*MAXV-P.vx)*k;P.vy+=(ty*MAXV-P.vy)*k;
    let nx=P.x+P.vx*dt,ny=P.y+P.vy*dt;
    if(hit(nx,P.y)){nx=P.x;P.vx=0;}
    if(hit(nx,ny)){ny=P.y;P.vy=0;}
    P.x=clamp(nx,20,WW-20);P.y=clamp(ny,20,WH-20);
    const sp=Math.hypot(P.vx,P.vy);
    if(sp>8){P.face=Math.atan2(P.vy,P.vx);P.ph+=sp*dt*.07;}
    C.afterMove(dt);
    fx=P.x;fy=P.y;
  }
  const tcx=clamp(fx-vw/2,0,Math.max(0,WW-vw)),tcy=clamp(fy-vh/2,0,Math.max(0,WH-vh)),ck=Math.min(1,dt*(S.ui==='cine'?3:7));
  cam.x+=(tcx-cam.x)*ck;cam.y+=(tcy-cam.y)*ck;
  {const std=['none','dlg','cine','gp','board','accuse','teori','end'],hide=!std.includes(S.ui);
   if(hide!==!!G.hudHidden){G.hudHidden=hide;$('hud').hidden=hide;$('hud-r').hidden=hide;if(!hide)placeHud();}}
  const ob=C.objective();if(ob.t!==lastObj){lastObj=ob.t;$('obj').textContent=ob.t;placeHud();}
}
function placeHud(){const h=$('hud'),r=$('hud-r');if(W<=600&&!h.hidden){r.style.top=(h.getBoundingClientRect().bottom+8)+'px';}else r.style.top='';}
/* ================= GAMBAR ================= */
function person(x,y,face,ph,c,moving){
  ctx.save();ctx.translate(x,y);
  ctx.fillStyle='rgba(28,34,48,.25)';ctx.beginPath();ctx.ellipse(3,7,15,9,0,0,7);ctx.fill();
  ctx.rotate(face);const sw=moving?Math.sin(ph)*5:0;
  ctx.lineWidth=3;ctx.strokeStyle=INK;ctx.lineJoin='round';
  ctx.fillStyle='#262a36';ctx.beginPath();ctx.ellipse(sw,-6,6,4,0,0,7);ctx.fill();ctx.stroke();ctx.beginPath();ctx.ellipse(-sw,6,6,4,0,0,7);ctx.fill();ctx.stroke();
  ctx.fillStyle=c.body;ctx.beginPath();ctx.ellipse(0,0,8,13,0,0,7);ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.ellipse(-sw*.6,-13,5,4,0,0,7);ctx.fill();ctx.stroke();ctx.beginPath();ctx.ellipse(sw*.6,13,5,4,0,0,7);ctx.fill();ctx.stroke();
  ctx.fillStyle='#f0c8a0';ctx.beginPath();ctx.arc(1,0,8,0,7);ctx.fill();ctx.stroke();
  ctx.fillStyle=c.cap;ctx.beginPath();ctx.arc(0,0,8.6,Math.PI*.5,Math.PI*1.5);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.rect(7,-5,6,10);ctx.fill();ctx.stroke();
  ctx.restore();
}
function label(s,x,y,col){ctx.font='700 13px '+FU;ctx.textAlign='center';ctx.lineWidth=4;ctx.strokeStyle=INK;ctx.lineJoin='round';ctx.strokeText(s,x,y);ctx.fillStyle=col||PAPER;ctx.fillText(s,x,y);}
function plate(txt,x,y,w,h,fs,bg){ctx.fillStyle=INK;ctx.fillRect(x+3,y+3,w,h);ctx.fillStyle=bg||PAPER;ctx.strokeStyle=INK;ctx.lineWidth=3;ctx.fillRect(x,y,w,h);ctx.strokeRect(x,y,w,h);ctx.fillStyle=INK;ctx.font=fs;ctx.textAlign='center';ctx.fillText(txt,x+w/2,y+h*.68);}
function draw(){
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.fillStyle='#78b85a';ctx.fillRect(0,0,W,H);
  ctx.save();
  if(G.shake>0)ctx.translate((Math.random()-.5)*14*G.shake,(Math.random()-.5)*14*G.shake);
  ctx.scale(Z,Z);ctx.translate(-cam.x,-cam.y);
  ctx.drawImage(WORLD,0,0);
  C.drawWorld(ctx);
  const near=S.playing&&S.ui==='none'?nearestInt():null,ints=activeInts();
  const ppl=[];
  for(const it of C.ints){if(!it.ch)continue;const c=C.CH[it.ch];ppl.push({y:it.t.y,f:()=>{const close=Math.hypot(P.x-it.t.x,P.y-it.t.y)<160;const jit=C.jitter(it);person(it.t.x+jit,it.t.y,close?Math.atan2(P.y-it.t.y,P.x-it.t.x):Math.PI/2,0,c,false);label(c.n,it.t.x,it.t.y-26);}});}
  ppl.push({y:P.y,f:()=>{person(P.x,P.y,P.face,P.ph,{body:CORAL,cap:INK},Math.hypot(P.vx,P.vy)>8);label(S.name,P.x,P.y-26,SUN);}});
  ppl.sort((a,b)=>a.y-b.y);for(const p of ppl)p.f();
  for(const it of ints){
    if(it.ch||it.id==='pin')continue;const bob=Math.sin(G.T*3+it.t.x)*3;
    ctx.fillStyle=SUN;ctx.strokeStyle=INK;ctx.lineWidth=3;ctx.beginPath();ctx.arc(it.t.x,it.t.y-4+bob,11,0,7);ctx.fill();ctx.stroke();
    ctx.fillStyle=INK;ctx.font='800 14px '+FD;ctx.textAlign='center';ctx.fillText(it.icon||'i',it.t.x,it.t.y+1+bob);
  }
  C.drawWorldTop(ctx);
  ctx.restore();
  // malam
  if(G.night>.01){
    const px=(P.x-cam.x)*Z,py=(P.y-cam.y)*Z,gr=ctx.createRadialGradient(px,py,50*Z,px,py,Math.max(W,H)*.62);
    gr.addColorStop(0,'rgba(18,20,54,'+(.12*G.night)+')');gr.addColorStop(1,'rgba(14,16,46,'+(.96*G.night)+')');
    ctx.fillStyle=gr;ctx.fillRect(0,0,W,H);
    ctx.globalCompositeOperation='lighter';
    for(const l of LAMPS){const x=(l.x-cam.x)*Z,y=(l.y-cam.y)*Z;if(x<-150||x>W+150||y<-150||y>H+150)continue;const g2=ctx.createRadialGradient(x,y,2,x,y,120*Z);g2.addColorStop(0,'rgba(255,200,90,'+(.5*G.night)+')');g2.addColorStop(1,'rgba(255,200,90,0)');ctx.fillStyle=g2;ctx.fillRect(x-130*Z,y-130*Z,260*Z,260*Z);}
    ctx.globalCompositeOperation='source-over';
  }
  // pin dan penanda di atas kegelapan
  const p=C.pinPos();
  if(p){const x=(p.x-cam.x)*Z,y=(p.y-cam.y)*Z-Math.abs(Math.sin(G.T*4))*8;
    ctx.fillStyle=ALERT;ctx.strokeStyle=INK;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,y);ctx.bezierCurveTo(x-20,y-24,x-14,y-46,x,y-46);ctx.bezierCurveTo(x+14,y-46,x+20,y-24,x,y);ctx.fill();ctx.stroke();
    ctx.fillStyle=PAPER;ctx.beginPath();ctx.arc(x,y-32,6,0,7);ctx.fill();ctx.stroke();}
  if(near){const x=(near.t.x-cam.x)*Z,y=(near.t.y-cam.y)*Z,bob=Math.sin(G.T*5)*3;
    ctx.fillStyle=SUN;ctx.strokeStyle=INK;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,y-44*Z+bob);ctx.lineTo(x-9,y-58*Z+bob);ctx.lineTo(x+9,y-58*Z+bob);ctx.closePath();ctx.fill();ctx.stroke();}
  if(C.drawOverlay)C.drawOverlay(ctx);
  if(G.flash>0){ctx.fillStyle='rgba(255,255,255,'+G.flash+')';ctx.fillRect(0,0,W,H);}
  if(!S.playing)return;
  if(S.ui==='cine'){
    ctx.fillStyle=INK;ctx.fillRect(0,0,W,H*.11);ctx.fillRect(0,H*.89,W,H*.11);
    C.drawCine(ctx);
    return;
  }
  if(G.card){
    const a=clamp(Math.min(G.card.t/.3,(2.8-G.card.t)/.4),0,1);ctx.globalAlpha=a;
    ctx.fillStyle=INK;ctx.fillRect(0,H*.36,W,H*.26);
    ctx.textAlign='center';ctx.fillStyle=SUN;ctx.font='700 '+Math.round(16*hs)+'px '+FU;ctx.fillText(G.card.a,W/2,H*.36+H*.09);
    ctx.fillStyle=PAPER;ctx.font='800 '+Math.round(46*hs)+'px '+FD;ctx.fillText(G.card.b,W/2,H*.36+H*.2);ctx.globalAlpha=1;
  }
  if(near&&S.ui==='none'&&!G.card){
    const sxx=(near.t.x-cam.x)*Z,syy=(near.t.y-cam.y)*Z-66*Z,txt=(G.coarse?'Ketuk kanan: ':'E: ')+near.label;
    ctx.font='700 '+(14*hs)+'px '+FU;const w=ctx.measureText(txt).width+22*hs,h=30*hs;
    plate(txt,clamp(sxx-w/2,8,W-w-8),Math.max(8,syy-h),w,h,'700 '+(14*hs)+'px '+FU);
  }
  if(S.ui==='none'){
    const ob=C.objective(),tg=ob.p;
    if(tg){const x=(tg.x-cam.x)*Z,y=(tg.y-cam.y)*Z;
      if(x<20||x>W-20||y<20||y>H-20){const cx=W/2,cy=H/2,dx=x-cx,dy=y-cy,k=Math.min((W/2-34)/Math.abs(dx||1e-6),(H/2-34)/Math.abs(dy||1e-6));
        ctx.save();ctx.translate(cx+dx*k,cy+dy*k);ctx.rotate(Math.atan2(dy,dx));ctx.fillStyle=SUN;ctx.strokeStyle=INK;ctx.lineWidth=3.5;ctx.beginPath();ctx.moveTo(16,0);ctx.lineTo(-10,-13);ctx.lineTo(-4,0);ctx.lineTo(-10,13);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();}}
    C.drawHud(ctx);
    if(T.id!==null){
      ctx.globalAlpha=.55;ctx.fillStyle=PAPER;ctx.strokeStyle=INK;ctx.lineWidth=3;ctx.beginPath();ctx.arc(T.bx,T.by,T.R,0,7);ctx.fill();ctx.stroke();
      ctx.globalAlpha=.95;ctx.fillStyle=SUN;ctx.beginPath();ctx.arc(T.px,T.py,T.R*.42,0,7);ctx.fill();ctx.stroke();ctx.globalAlpha=1;
    }
  }
}

/* ================= JARINGAN (Supabase) ================= */
const NET={kunci:null,token:null,user:null,rank:0};
async function saveResult(total,det){
  const m=$('save-note');
  try{await rpc('simpan_hasil',{p_kunci:NET.kunci,p_token:NET.token,p_kasus:C.id,p_skor:total,p_detik:Math.round(det.detik),p_rincian:det});m.textContent='Skor tersimpan di sesi kelas.';}
  catch(e){m.textContent='Skor belum tersimpan: '+e.message;}
}
function renderRank(list,note){
  $('rank-note').textContent=note;
  const ol=$('e-rank');ol.innerHTML='';
  list.forEach((p,i)=>{const li=document.createElement('li');if(p.me)li.className='me';const a=document.createElement('span'),b=document.createElement('span'),c=document.createElement('span');a.textContent=String(i+1);b.textContent=p.n+(p.me?' (kamu)':'');c.textContent=p.s.toLocaleString('id-ID');li.append(a,b,c);ol.append(li);});
}
async function pollRank(){
  if(!NET.kunci||S.ui!=='end')return;
  try{const r=await rpc('ranking',{p_token:NET.token});renderRank(r.map(x=>({n:x.username,s:x.skor,me:x.username.toLowerCase()===NET.user.toLowerCase()})),'(langsung dari kelas)');}catch(e){}
  setTimeout(pollRank,6000);
}

/* ================= MULAI ================= */
let last=0;
function frame(ts){const dt=Math.min(0.033,((ts-last)/1000)||0.016);last=ts;update(dt);draw();requestAnimationFrame(frame);}
let WORLD=null;
function init(){
  resize();WORLD=C.buildWorld();C.init();
  requestAnimationFrame(frame);
}
function goFull(){
  try{
    const el=document.documentElement,fs=el.requestFullscreen||el.webkitRequestFullscreen;
    if(fs&&!document.fullscreenElement){
      const pr=fs.call(el,{navigationUI:'hide'});
      const lock=()=>{try{if(screen.orientation&&screen.orientation.lock)screen.orientation.lock('landscape').catch(()=>{});}catch(e){}};
      if(pr&&pr.then)pr.then(lock).catch(()=>{});else lock();
    }
  }catch(e){}
}
function toggleFull(){
  try{if(document.fullscreenElement){document.exitFullscreen();}else goFull();}catch(e){}
}
if(document.fullscreenEnabled||document.webkitFullscreenEnabled){$('b-fs').hidden=false;$('b-fs').addEventListener('click',toggleFull);
  document.addEventListener('fullscreenchange',()=>{$('b-fs').textContent=document.fullscreenElement?'Keluar layar penuh':'Layar penuh';setTimeout(()=>window.dispatchEvent(new Event('resize')),150);});}
function begin(name){
  S.name=name;if(G.coarse)goFull();
  try{const AC=window.AudioContext||window.webkitAudioContext;if(AC)AU.ctx=new AC();}catch(e){}
  S.playing=true;S.t0=Date.now();$('start').hidden=true;
  const f=C.begin();
  cam.x=clamp(f[0]-W/Z/2,0,WW);cam.y=clamp(f[1]-H/Z/2,0,WH);
}
function endCineHook(){endCine();}
/* ---- rakit objek E untuk modul kasus ---- */
const w2s=(x,y)=>[(x-cam.x)*Z,(y-cam.y)*Z];
const E={teori,w2s,S,P,G,K,T,V,$,clamp,lerp,f0,f1,rngSeed,INK,PAPER,SUN,CORAL,ALERT,BLUE,GOOD,FD,FU,say,toast,addEv,card,sfx,openAccuse,gpOpen,endCine:endCineHook,endCase,plate};
C=createCase(E);
{const N=()=>{};for(const k of ['tick','afterMove','drawWorld','drawWorldTop','drawHud','drawCine','init','cineEnd','suspects'])if(!C[k])C[k]=N;
 if(!C.extraInts)C.extraInts=()=>[];if(!C.pinPos)C.pinPos=()=>null;if(!C.jitter)C.jitter=()=>0;if(!C.night)C.night=()=>0;if(!C.sx)C.sx=x=>x;
 if(!C.cineStep)C.cineStep=()=>[P.x,P.y];if(!C.LAMPS)C.LAMPS=[];}
for(const id of (C.THEORY_START||[]))teori(id,true);
WW=C.WW;WH=C.WH;SOLIDS=C.SOLIDS;LAMPS=C.LAMPS;
$('chap').textContent=C.chapter;
const sesi=bacaSesi();
if(!sesi){location.replace('./index.html');return;}
NET.kunci=sesi.kunci||null;NET.token=sesi.token||null;NET.user=sesi.user||null;
document.title=C.judul;
$('st-eyebrow').textContent=C.eyebrow;$('st-title').textContent=C.judul;$('st-lede').textContent=C.lede;$('end-teaser').innerHTML=C.teaser;
$('st-who').textContent=sesi.kunci?('Masuk sebagai '+sesi.user+'. Skor tersimpan di sesi kelas.'):'Mode coba: skor tidak disimpan.';
$('b-start').addEventListener('click',()=>begin(NET.user||sesi.user||'Detektif'));
init();
if(window.__TEST__)window.__G={S,P,TG:C.TG,TRIAL:C.TRIAL,MOTORS:C.MOTORS,GP,gpDraw,tryLock,endCine,sx:C.sx,tp:(x,y)=>{P.x=x;P.y=y;P.vx=P.vy=0;cam.x=clamp(x-W/Z/2,0,WW);cam.y=clamp(y-H/Z/2,0,WH);}};
}
