/* Semesta 3 (Warung dan Pasar), Kasus 1: Cabai Dua Kali Lipat.
   Bab 1: aturan perkalian lewat persegi panjang pendapatan R = p·q (strip hijau q·Δp vs strip merah p·|Δq|).
   Bab 2: aturan pembagian lewat rata-rata harga sungguhan u = U/G; u mulai turun saat timbangan ditukar. */
import {kit} from '../../core/kit.js';
export default function create(E){
const {teori,w2s,S,P,G,K,T,V,$,clamp,f0,f1,rngSeed,INK,PAPER,SUN,CORAL,ALERT,BLUE,GOOD,FD,FU,say,toast,addEv,card,sfx,openAccuse,gpOpen,endCine,endCase}=E;
const KT=kit(E),FR=KT.FR;

/* ---------- model ---------- */
const qOf=p=>Math.max(0,120-1.2*p);          // kg per hari
const ROf=p=>p*qOf(p);                         // ribu Rp per hari
const P_OPT=50,P_NOW=70,DP=5;
const TSW=4.5;                                  // timbangan ditukar 4,5 jam sejak 06.00 = 10.30
const Uof=t=>t<=TSW?1500*t:1500*TSW+1200*(t-TSW);   // ribu Rp dibayar
const Gof=t=>50*t;                                  // kg masuk gudang (sensor)
const uOf=t=>t<0.05?30:Uof(t)/Gof(t);

/* ---------- teori ---------- */
const THEORY={
  'k3-dasar':{t:'Pendapatan sebagai perkalian',sub:'R = p·q',h:
    '<p>Pendapatan harian pedagang adalah harga dikali jumlah terjual:</p><span class="eq">R(p) = p · q(p)</span>'+
    '<p>Harga <b>p</b> (ribu Rp/kg) dipilih pedagang. Jumlah terjual <b>q</b> (kg/hari) bergantung pada harga: makin mahal, makin sedikit pembeli. Jadi R adalah <b>perkalian dua fungsi</b> yang sama-sama berubah saat p berubah.</p>'},
  'k3-kali':{t:'Aturan perkalian dari persegi panjang',sub:'(pq)′ = q + p·q′',h:
    '<p>Bayangkan R sebagai luas persegi panjang lebar p, tinggi q. Naikkan harga sedikit, Δp. Lebar bertambah, tinggi berkurang Δq (negatif):</p>'+
    '<span class="eq">ΔR = q·Δp &nbsp;+&nbsp; p·Δq &nbsp;+&nbsp; Δp·Δq</span>'+
    '<p>Strip hijau <b>q·Δp</b> adalah untung dari harga lebih tinggi. Strip merah <b>p·Δq</b> adalah rugi dari pembeli yang hilang. Bagi dengan Δp, lalu Δp → 0 (suku Δp·Δq lenyap):</p>'+
    '<span class="eq">'+FR('dR','dp')+' = q(p) + p·q′(p) &nbsp;&nbsp; secara umum &nbsp; (f·g)′ = f′·g + f·g′</span>'+
    '<div class="ex"><b>Contoh lain.</b> q(p) = 200 − 4p. Maka R′ = (200 − 4p) + p·(−4) = 200 − 8p. Nol di p = 25: harga dengan pendapatan terbesar.</div>'},
  'k3-maks':{t:'Puncak pendapatan: R′(p) = 0',sub:'hijau = merah',h:
    '<p>Selama strip hijau lebih besar dari merah, R′ &gt; 0: menaikkan harga masih menambah pendapatan. Begitu merah lebih besar, R′ &lt; 0: menaikkan harga justru merugikan. Di antaranya ada titik seimbang:</p>'+
    '<span class="eq">R′(p) = q + p·q′ = 0</span>'+
    '<div class="ex"><b>Pembahasan.</b> Untuk q = 120 − 1,2p: R′ = (120 − 1,2p) + p(−1,2) = 120 − 2,4p. Di p = 70, R′ = −48: tiap kenaikan Rp1.000 per kg, pendapatan harian turun sekitar Rp48.000.</div>'},
  'k3-salah':{t:'Dua kesalahan klasik',sub:'(pq)′ ≠ p′q′',h:
    '<p><b>Salah 1:</b> menurunkan perkalian dengan mengalikan turunan, (pq)′ = p′·q′. Untuk R = p·q dengan p′ = 1 dan q′ = −1,2, hasilnya −1,2, jelas keliru.</p>'+
    '<p><b>Salah 2 (salah Darto):</b> menganggap q tetap, sehingga "harga naik 75% berarti pendapatan naik 75%". Itu hanya suku hijau q·Δp, tanpa suku merah p·Δq.</p>'+
    '<span class="eq">(f·g)′ = f′·g + f·g′ &nbsp; (dua suku, selalu)</span>'},
  'k3-bagi':{t:'Rata-rata sebagai pembagian',sub:'(U/G)′',h:
    '<p>Harga sungguhan rata-rata per kg adalah total uang dibagi total berat yang benar-benar masuk gudang:</p>'+
    '<span class="eq">u(t) = '+FR('U(t)','G(t)')+' &nbsp;&nbsp;⇒&nbsp;&nbsp; u′(t) = '+FR('U′·G − U·G′','G²')+'</span>'+
    '<p>Susun ulang supaya terasa maknanya:</p>'+
    '<span class="eq">u′ = '+FR('G′','G')+' · ( '+FR('U′','G′')+' − u )</span>'+
    '<p><b>U′/G′</b> adalah harga barang yang <b>baru masuk</b>. Rata-rata naik kalau yang baru lebih mahal dari rata-rata, tetap kalau sama, dan <b>turun</b> kalau yang baru lebih murah.</p>'+
    '<div class="ex"><b>Pembahasan.</b> Selama timbangan jujur, setiap kg dibayar 30 rb, sama dengan rata-rata, jadi u′ = 0 dan grafik u datar. Begitu timbangan curang dipasang, barang baru "lebih murah" dari rata-rata dan u mulai turun. Cari titik saat u′ pertama kali negatif.</div>'},
  'k3-kebalikan':{t:'Kebalikan: (1/g)′',sub:'kasus khusus pembagian',h:
    '<p>Dengan U = 1 di aturan pembagian:</p><span class="eq">'+FR('d','dx')+' '+FR('1','g(x)')+' = − '+FR('g′(x)','g(x)²')+'</span>'+
    '<div class="ex"><b>Timbangan Darto.</b> Karung 10 kg terbaca 8 kg. Harga per kg asli = (uang)/(berat asli). Kalau berat asli naik sementara uang tetap, harga per kg asli turun: tanda minus pada rumus di atas.</div>'}
};

/* ---------- dunia ---------- */
const WW=2000,WH=1300;
const BUILD=[
  {x:110,y:280,w:290,h:180,roof:'#4a6fa5',name:'PAGUYUBAN PASAR',door:'s'},
  {x:860,y:300,w:240,h:150,roof:'#8aa05a',name:'WARUNG JAMU',door:'s'},
  {x:1450,y:260,w:360,h:200,roof:'#7a5a3a',name:'GUDANG DARTO',door:'s'}
];
const STALLS=[];for(let i=0;i<7;i++)STALLS.push({x:470+i*150,y:790,col:['#e8553d','#2f9e5b','#d9a441','#2f7fc1','#9a8fc2','#e8553d','#6f7b8c'][i]});
const NARTI=STALLS[2];
const TG={anto:{x:240,y:620},haji:{x:330,y:520},narti:{x:NARTI.x-40,y:745},lapak:{x:NARTI.x+45,y:745},jum:{x:980,y:510},
  darto:{x:1560,y:520},buku:{x:1400,y:610},timbangan:{x:1700,y:620},log:{x:1820,y:520}};
const SOLIDS=BUILD.map(b=>({x:b.x,y:b.y,w:b.w,h:b.h}));
for(const s of STALLS)SOLIDS.push({x:s.x-55,y:s.y-6,w:110,h:44});
const LAMPS=[];for(let x=150;x<WW;x+=320)LAMPS.push({x,y:575});
const CH={
  anto:{n:'Pak Anto',body:'#c9b27a',cap:'#4a6fa5'},
  narti:{n:'Bu Narti',body:'#e8553d',cap:'#f4efe1'},
  haji:{n:'Pak Haji Mansur',body:'#f4efe1',cap:'#1c2230'},
  darto:{n:'Juragan Darto',body:'#d9a441',cap:'#7a5a3a'},
  jum:{n:'Mbok Jum',body:'#8aa05a',cap:'#d98c5f'}
};
function buildWorld(){
  const c=document.createElement('canvas');c.width=WW;c.height=WH;const g=c.getContext('2d'),R=rngSeed(31);
  KT.ground(g,WW,WH,R,'#7cb35c','#88c068','#70a852');
  // pelataran batu
  g.fillStyle='#c9bda6';g.fillRect(60,560,WW-120,340);
  g.strokeStyle='rgba(28,34,48,.14)';g.lineWidth=2;for(let x=60;x<WW-60;x+=50){g.beginPath();g.moveTo(x,560);g.lineTo(x,900);g.stroke();}for(let y=560;y<900;y+=50){g.beginPath();g.moveTo(60,y);g.lineTo(WW-60,y);g.stroke();}
  KT.paths(g,BUILD,560,900);
  for(const b of BUILD)KT.building(g,b);
  // lapak-lapak
  for(const s of STALLS){
    g.fillStyle='rgba(28,34,48,.25)';g.fillRect(s.x-50,s.y+2,110,46);
    g.fillStyle='#b98a5a';g.strokeStyle=INK;g.lineWidth=3;g.fillRect(s.x-55,s.y-6,110,44);g.strokeRect(s.x-55,s.y-6,110,44);
    for(let i=0;i<6;i++){g.fillStyle=i%2?PAPER:s.col;g.fillRect(s.x-55+i*18.3,s.y-22,18.3,18);}g.strokeRect(s.x-55,s.y-22,110,18);
    if(s===NARTI){for(let i=0;i<14;i++){g.fillStyle=i%3?'#d12b1f':'#2f9e5b';g.beginPath();g.ellipse(s.x-40+(i%7)*13,s.y+6+Math.floor(i/7)*14,6,3,(i%5)*.4,0,7);g.fill();}}
  }
  KT.sign(g,'CABAI 70 rb/kg',NARTI.x,NARTI.y+66,ALERT);
  // papan tulis lapak
  g.fillStyle='#2b3a2e';g.strokeStyle=INK;g.lineWidth=3;g.fillRect(TG.lapak.x-18,TG.lapak.y-40,36,28);g.strokeRect(TG.lapak.x-18,TG.lapak.y-40,36,28);
  // timbangan dan meja buku
  g.fillStyle='#9aa3b2';g.fillRect(TG.timbangan.x-20,TG.timbangan.y+10,40,14);g.strokeRect(TG.timbangan.x-20,TG.timbangan.y+10,40,14);
  g.fillStyle='#e9dfc8';g.fillRect(TG.buku.x-26,TG.buku.y+12,52,22);g.strokeRect(TG.buku.x-26,TG.buku.y+12,52,22);
  KT.lamps(g,LAMPS);
  KT.trees(g,R,WW,WH,[...BUILD.map(b=>[b.x-50,b.y-50,b.w+100,b.h+100]),[0,540,WW,400]],Object.values(TG),SOLIDS,36);
  return c;
}

/* ---------- papan lapak (overlay) ---------- */
const LP={p:P_NOW,drag:null,ok:null,no:null};
function openLapak(){S.ui='lapak';K.u=K.d=K.l=K.r=false;T.x=T.y=0;teori('k3-kali');}
function saveLapak(){
  const p=Math.round(LP.p*2)/2,fl=S.flags;
  addEv({id:'lapak-'+p,type:'meas',title:'Papan lapak: harga '+f1(p)+' rb',text:'q = '+f1(qOf(p))+' kg, R = '+f0(ROf(p))+' rb/hari. Strip hijau '+f0(DP*qOf(p))+', strip merah '+f0(DP*1.2*p)+'.',meta:{kind:'lapak',p}});
  if(Math.abs(p-P_OPT)<=1.5&&!fl.opt){fl.opt=true;sfx.ev();teori('k3-maks');toast('Hijau = merah. Di sini pendapatan berhenti naik.');}
}
function lapakPanel(ctx){
  const {W,H,hs}=V,top=W<=600?8:Math.min(96,H*.16),w=Math.min(820*hs,W-16),h=Math.min(430*hs,H-top-8),x=(W-w)/2,y=top+Math.max(0,(H-top-8-h)/2),narrow=w<560;
  KT.box(ctx,x,y,w,h);
  const f=Math.round(14*hs);
  KT.txt(ctx,'PAPAN LAPAK BU NARTI',x+14,y+24*hs,'800 '+Math.round(16*hs)+'px '+FD);
  KT.txt(ctx,'harga p = '+f1(LP.p)+' rb/kg',x+w-14,y+24*hs,'800 '+Math.round(16*hs)+'px '+FU,INK,'right');
  // persegi panjang pendapatan
  const ax=x+46*hs,ay=y+44*hs,aw=narrow?w-70*hs:w*.52,ah=narrow?(h-170*hs)*.55:h-120*hs;
  const PX=v=>ax+v/100*aw,QY=v=>ay+ah-v/125*ah;
  const p=LP.p,q=qOf(p),dq=1.2*DP;
  ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(ax,ay+ah);ctx.lineTo(ax+aw,ay+ah);ctx.stroke();
  // kurva permintaan
  ctx.strokeStyle='rgba(28,34,48,.35)';ctx.setLineDash([6,5]);ctx.beginPath();ctx.moveTo(PX(0),QY(120));ctx.lineTo(PX(100),QY(0));ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle='#ffd36b';ctx.fillRect(PX(0),QY(q),PX(p)-PX(0),QY(0)-QY(q));
  ctx.fillStyle='rgba(47,158,91,.85)';ctx.fillRect(PX(p),QY(q-dq),PX(p+DP)-PX(p),QY(0)-QY(q-dq));
  ctx.fillStyle='rgba(229,57,43,.85)';ctx.fillRect(PX(0),QY(q),PX(p)-PX(0),QY(q-dq)-QY(q));
  ctx.strokeStyle=INK;ctx.lineWidth=3;ctx.strokeRect(PX(0),QY(q),PX(p)-PX(0),QY(0)-QY(q));
  KT.txt(ctx,'R = p × q = '+f0(ROf(p))+' rb',(PX(0)+PX(p))/2,(QY(q)+QY(0))/2,'800 '+f+'px '+FU,INK,'center');
  KT.txt(ctx,'p (harga) →',ax+aw,ay+ah+16*hs,'700 '+Math.round(11*hs)+'px '+FU,INK,'right');
  KT.txt(ctx,'q '+f1(q)+' kg',ax-4,QY(q)+4,'700 '+Math.round(11*hs)+'px '+FU,INK,'right');
  // pembeli
  const nb=Math.round(q/6);for(let i=0;i<nb;i++){ctx.fillStyle=['#2f7fc1','#9a8fc2','#d98c5f','#8aa05a'][i%4];ctx.strokeStyle=INK;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(ax+aw-10*hs-(i%10)*13*hs,ay+8*hs+Math.floor(i/10)*13*hs,5*hs,0,7);ctx.fill();ctx.stroke();}
  KT.txt(ctx,nb+' pembeli/jam',ax+aw,ay+38*hs,'700 '+Math.round(11*hs)+'px '+FU,INK,'right');
  // keterangan strip dan grafik R(p)
  const bx=narrow?x+14:x+w*.6+10,by=narrow?ay+ah+26*hs:ay,bw=narrow?w-28:w*.4-24;
  KT.txt(ctx,'Naikkan harga '+DP+' rb:',bx,by+12*hs,'800 '+f+'px '+FU);
  ctx.fillStyle=GOOD;ctx.fillRect(bx,by+20*hs,12*hs,12*hs);KT.txt(ctx,'untung q·Δp ≈ '+f0(DP*q),bx+18*hs,by+31*hs,'700 '+f+'px '+FU,GOOD);
  ctx.fillStyle=ALERT;ctx.fillRect(bx,by+40*hs,12*hs,12*hs);KT.txt(ctx,'rugi p·|Δq| ≈ '+f0(p*dq),bx+18*hs,by+51*hs,'700 '+f+'px '+FU,ALERT);
  if(!narrow){
    const gp={x:bx+28*hs,y:by+72*hs,w:bw-36*hs,h:ah-110*hs};
    const m=KT.plot(ctx,gp.x,gp.y,gp.w,gp.h,20,95,0,3300,[{pts:KT.samp(ROf,20,95,80),col:'#c25a1c',w:3}],'R(p)');
    const Rp=ROf(p),d=120-2.4*p;ctx.strokeStyle=ALERT;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(m.X(p-9),m.Y(Rp-d*9));ctx.lineTo(m.X(p+9),m.Y(Rp+d*9));ctx.stroke();
    ctx.fillStyle=SUN;ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.beginPath();ctx.arc(m.X(p),m.Y(Rp),6,0,7);ctx.fill();ctx.stroke();
    KT.txt(ctx,'p',gp.x+gp.w,gp.y+gp.h+14*hs,'700 '+Math.round(11*hs)+'px '+FU,INK,'right');
  }
  KT.txt(ctx,G.coarse?'Geser ke kiri/kanan untuk mengubah harga.':'Seret, atau panah ←→ (Shift: 5 rb). Esc: tutup.',x+14,y+h-60*hs,'600 '+Math.round(11.5*hs)+'px '+FU);
  const bh=38*hs;LP.no=KT.btn(ctx,{x:x+14,y:y+h-bh-12,w:100*hs,h:bh},'Tutup',false,f);LP.ok=KT.btn(ctx,{x:x+w-170*hs-14,y:y+h-bh-12,w:170*hs,h:bh},'Simpan harga',true,f);
}

/* ---------- interaksi ---------- */
const INTS=[
  {id:'anto',ch:'anto',t:TG.anto,label:'Bicara dengan Pak Anto',act:talkAnto},
  {id:'narti',ch:'narti',t:TG.narti,label:'Bicara dengan Bu Narti',act:()=>{
    if(S.flags.twist)say([['narti','Darto beli cabai sisaku tiap sore. Katanya bayar 30 rb per kg, adil. Tapi kok uangnya selalu kurang dari hitunganku?','curiga']],()=>addEv({id:'w-narti2',type:'witness',title:'Bu Narti: uang kurang',text:'Darto membeli cabai sisa dengan "30 rb/kg", tapi uangnya selalu kurang dari hitungan Bu Narti.'}));
    else say([['narti','Detektif! Sejak harga dinaikkan ke 70 rb, pembeli kabur ke pasar sebelah.','panik'],['narti','Dulu 40 rb, sehari laku 72 kg. Sekarang cuma 36 kg. Katanya harga naik pasti untung. Kok aku malah rugi?','panik']],
      ()=>addEv({id:'w-narti',type:'witness',title:'Kesaksian Bu Narti',text:'Harga 40 rb: laku 72 kg/hari. Harga 70 rb: laku 36 kg/hari. Pendapatan turun.'}));}},
  {id:'lapak',t:TG.lapak,label:'Buka papan lapak',icon:'R',when:()=>S.flags.case,act:openLapak},
  {id:'haji',ch:'haji',t:TG.haji,label:'Bicara dengan Pak Haji Mansur',act:()=>say([['haji','Saya ketua paguyuban. Harga cabai saya naikkan atas saran Juragan Darto.'],['haji','Kata dia: harga naik 75%, pendapatan pasti ikut naik 75%. Masuk akal, kan?','senyum']],
    ()=>addEv({id:'w-haji',type:'witness',title:'Saran Darto lewat Pak Haji',text:'"Harga naik 75%, pendapatan pasti naik 75%." Harga dinaikkan dari 40 ke 70 rb/kg.'}))},
  {id:'jum',ch:'jum',t:TG.jum,label:'Bicara dengan Mbok Jum',act:()=>{
    if(S.flags.twist)say([['jum','Timbangan di gudang Darto itu, Le. Pagi-pagi bunyinya beda. Ada yang ganti, tapi aku nggak lihat jam berapa.','curiga']],()=>addEv({id:'w-jum',type:'witness',title:'Mbok Jum: timbangan diganti',text:'Timbangan gudang Darto diganti pagi hari, jam pastinya tidak diketahui.'}));
    else say([['jum','Jamu, Le? Pasar sepi, aku juga sepi. Semua gara-gara cabai.']]);}},
  {id:'darto',ch:'darto',t:TG.darto,label:'Bicara dengan Juragan Darto',act:()=>{
    const f=S.flags;
    if(f.acc1&&!f.twist){sfx.twist();
      say([['darto','Saranku salah hitung? Ya maaf, aku bukan guru matematika.','senyum'],['darto','Tapi jangan tuduh aku curang. Aku beli cabai sisa pedagang dengan harga ADIL. Buku pembelianku: rata-rata 30 rb per kg, dari pagi sampai sore.','senyum'],['darto','Silakan periksa bukuku di meja itu. Sensor berat gudang juga terhubung. Lengkap.','senyum']],
        ()=>{f.twist=true;teori('k3-bagi');addEv({id:'w-darto',type:'witness',title:'Klaim Darto',text:'"Rata-rata 30 rb per kg dari pagi sampai sore." Buku pembelian dan sensor berat gudang tersedia.'});card('BAB 2','TIMBANGAN');$('chap').textContent='Bab 2: Timbangan';});}
    else if(f.twist)say([['darto','Sudah lihat bukuku? Bersih, kan?','senyum']]);
    else say([['darto','Harga naik, untung naik. Itu hukum pasar, Detektif.','senyum']]);}},
  {id:'buku',t:TG.buku,label:'Periksa buku dan sensor gudang',icon:'i',when:()=>S.flags.twist,act:openLedger},
  {id:'timbangan',t:TG.timbangan,label:'Uji timbangan Darto',icon:'?',when:()=>S.flags.twist&&!S.flags.uji,act:()=>{
    sfx.twist();G.shake=.25;
    say([['Timbangan','Kamu menaruh karung beras berlabel 10,0 kg.'],['Timbangan','Jarum berhenti di... 8,0 kg.']],
      ()=>{S.flags.uji=true;teori('k3-kebalikan');addEv({id:'uji',type:'doc',title:'Timbangan Darto curang',text:'Karung 10,0 kg terbaca 8,0 kg. Pedagang hanya dibayar untuk 80% berat aslinya.'});});}},
  {id:'log',t:TG.log,label:'Baca buku tamu gudang',icon:'i',when:()=>S.flags.twist,act:()=>say([['Buku tamu','09.00 Pak Haji Mansur (ambil kunci los).'],['Buku tamu','10.30 Juragan Darto (bawa "alat baru").'],['Buku tamu','15.30 Bu Narti (setor cabai sisa).']],
    ()=>{S.flags.log=true;addEv({id:'log',type:'doc',title:'Buku tamu gudang',text:'09.00 Pak Haji. 10.30 Darto, bawa "alat baru". 15.30 Bu Narti.'});})}
];
function talkAnto(){
  const f=S.flags;
  if(!f.case){
    say([['anto','Detektif {name}, selamat datang di pasar. Ada yang aneh: harga cabai naik hampir dua kali lipat, tapi pedagangnya malah bangkrut.','curiga'],
      ['anto','Paguyuban menaikkan harga atas saran seseorang. Cari tahu siapa, dan kenapa sarannya keliru.'],
      ['anto','Di lapak Bu Narti ada papan pendapatan. Mainkan harganya. Lihat apa yang terjadi pada pembeli.']],
      ()=>{f.case=true;addEv({id:'kasus',type:'doc',title:'Kasus cabai',text:'Harga cabai dinaikkan dari 40 ke 70 rb/kg. Pedagang rugi.'});});
  }else if(!f.opt){
    say([['anto','Cari harga yang membuat pendapatan paling besar. Perhatikan dua strip: untung dari harga, rugi dari pembeli yang pergi.']]);
  }else if(!f.acc1){
    say([['anto','Harga terbaik sudah ketemu. Jadi saran siapa yang keliru, dan apa salahnya?']],()=>openAccuse(1));
  }else if(!f.twist){
    say([['anto','Darto tahu sarannya merugikan pedagang. Siapa yang untung kalau pedagang punya banyak cabai sisa? Temui dia.','curiga']]);
  }else if(!f.found){
    say([['anto','Buku Darto bilang rata-rata 30 rb per kg. Tapi buku bisa bohong. Sensor berat gudang tidak. Hitung harga SUNGGUHAN per kg, dan cari kapan ia mulai berubah.']]);
  }else if(!f.log){
    say([['anto','Kamu tahu jamnya. Siapa yang ada di gudang pada jam itu? Cek buku tamu.']]);
  }else{
    say([['anto','Siapa yang menukar timbangan?']],()=>openAccuse(2));
  }
}
function openLedger(){
  const gaps=null;
  gpOpen({src:'ledger',title:'Buku pembelian dan sensor gudang',cur:'u',Tmax:10,Smax:35,camS:null,gmin:-3,gmax:3,k:1,unit:'',startLocked:false,
    xs:'t',xu:'jam',xlab:'t (jam sejak 06.00)',
    series:{
      U:{name:'U: uang dibayar',col:'#c25a1c',pts:KT.samp(Uof,0,10,200),kind:'plain',sym:'U',yu:'rb',ru:'rb/jam',ylab:'U (ribu Rp)',Smax:14000},
      G:{name:'G: berat masuk (sensor)',col:'#2f7fc1',pts:KT.samp(Gof,0,10,200),kind:'plain',sym:'G',yu:'kg',ru:'kg/jam',ylab:'G (kg)',Smax:550},
      u:{name:'u = U/G: harga sungguhan',col:'#7c4dbd',pts:KT.samp(uOf,0.25,10,390),kind:'plain',sym:'u',yu:'rb/kg',ru:'rb/kg per jam',ylab:'u (ribu Rp per kg asli)',Smax:35}
    },
    tip:'Buku Darto: rata-rata 30 rb/kg. Tapi itu pakai berat dari timbangannya sendiri. Di sini G dari sensor gudang.'});
}
function onLensSave(i,GP){
  const cur=GP.cur;
  if(cur!=='u'){addEv({id:'led-'+cur,type:'meas',title:GP.series[cur].name,text:(i.kind==='inst'?'Di t = '+f1(i.t)+' jam, laju ':'Rata-rata ')+f1(i.m)+' '+GP.series[cur].ru+'.',meta:{kind:'led'}});return 'saved';}
  if(i.kind!=='inst'){toast('Kunci dulu titik B ke titik A untuk membaca u′ di satu jam');return 'stay';}
  const jam=6+i.t,hh=Math.floor(jam),mm=Math.round((jam-hh)*60);
  addEv({id:'u-turun',type:'meas',title:'Harga sungguhan per kg',text:'Di t = '+f1(i.t)+' jam (pukul '+hh+'.'+String(mm).padStart(2,'0')+'), u = '+f1(i.s)+' rb/kg, u′ = '+(Math.round(i.m*100)/100).toFixed(2).replace('.',',')+' rb/kg per jam.',meta:{kind:'u',t:i.t,m:i.m}});
  if(i.m<-0.05){S.flags.found=true;}
  return 'saved';
}

/* ---------- tuduhan ---------- */
const ACQ={
  1:{title:'Laporan pertama',q:'Saran siapa yang membuat pedagang rugi?',
    who:[['darto','Juragan Darto'],['haji','Pak Haji Mansur'],['narti','Bu Narti']],
    why:[['ok','R = p·q, jadi R′ = q + p·q′. Saran itu hanya menghitung suku pertama. Di 70 rb, rugi dari pembeli yang hilang lebih besar: R′ negatif.'],['naik','Harga naik 75%, jadi pendapatan naik 75%. Sarannya benar, pedagangnya yang salah.'],['tinggi','Harga tertinggi selalu memberi pendapatan tertinggi.'],['kali','Turunan R adalah p′·q′, dan hasilnya negatif.']],ans:'darto'},
  2:{title:'Tuduhan akhir',q:'Siapa yang menukar timbangan gudang?',
    who:[['darto','Juragan Darto'],['haji','Pak Haji Mansur'],['narti','Bu Narti']],
    why:[['ok','u = U/G mulai turun (u′ &lt; 0) pada t ≈ 4,5 jam, yaitu pukul 10.30. Buku tamu pukul 10.30: Darto membawa "alat baru".'],['sore','u paling rendah di sore hari, jadi pelakunya yang datang sore.'],['buku','Buku Darto rata-rata 30 rb/kg, jadi Darto jujur.'],['kunci','Pak Haji yang pegang kunci, pasti dia.']].map(a=>[a[0],a[1].replace('&lt;','<')]),ans:'darto'}
};
function wrongMsg(n,A){
  if(n===1){
    if(A.who!=='darto')return 'Pak Anto: "Saran menaikkan harga datang dari siapa?" (-100)';
    return 'Pak Anto: "Orangnya benar. Tapi apa tepatnya kesalahan hitungnya? Ingat dua strip di papan." (-100)';
  }
  if(A.who==='narti')return 'Pak Anto: "Kapan u mulai turun? Bukan kapan u paling rendah." (-100)';
  if(A.who==='haji')return 'Pak Anto: "Pak Haji datang pukul 09.00. Saat itu u masih datar." (-100)';
  return 'Pak Anto: "Orangnya benar, tapi bukti kuncinya belum tepat." (-100)';
}
function onAccuseOk(n){
  if(n===1){S.flags.acc1=true;sfx.ev();teori('k3-salah');say([['anto','Saran Darto lupa satu suku: pembeli yang pergi. Pertanyaannya, apa Darto benar-benar tidak tahu?','curiga'],['anto','Pedagang yang tidak laku punya banyak cabai sisa. Dan siapa yang membeli cabai sisa? Temui Darto.']]);}
  else finale();
}
function finale(){
  sfx.win();
  say([['anto','Juragan. Timbangan ini membaca 10 kg sebagai 8 kg. Dipasang pukul 10.30, jam Anda datang.','curiga'],
    ['darto','...Harga naik bikin cabai tidak laku. Cabai sisa kubeli murah. Dengan timbangan itu, makin murah lagi.','panik'],
    ['darto','Sarannya sengaja. Rugi kalian, untung saya.','panik'],
    ['narti','Pantas uangku selalu kurang!','curiga'],
    ['haji','Harga kembali ke 50 rb. Itu titik terbaik untuk semua.','senyum'],
    ['anto','Kerja bagus, Detektif {name}. Perkalian punya dua suku, dan rata-rata tidak bisa membohongi turunannya.','senyum']],endCase);
}
function suspects(chip){const f=S.flags;if(f.case)chip('Juragan Darto',f.acc1?'hot':'');if(f.case)chip('Pak Haji',f.acc1?'x':'');if(f.twist)chip('Penukar timbangan','hot');}

/* ---------- alur ---------- */
function objective(){
  const f=S.flags;
  if(!f.case)return{t:'Temui Pak Anto di gerbang pasar.',p:TG.anto};
  if(!f.opt){
    if(!S.evidence.some(e=>e.id==='w-narti'))return{t:'Dengar keluhan Bu Narti.',p:TG.narti};
    return{t:'Di papan lapak, cari harga dengan pendapatan terbesar. Simpan.',p:TG.lapak};
  }
  if(!f.acc1){if(!S.evidence.some(e=>e.id==='w-haji'))return{t:'Siapa yang menyarankan harga naik? Tanya ketua paguyuban.',p:TG.haji};return{t:'Lapor Pak Anto.',p:TG.anto};}
  if(!f.twist)return{t:'Temui Juragan Darto di gudangnya.',p:TG.darto};
  if(!f.found)return{t:'Periksa buku dan sensor gudang: kapan harga sungguhan per kg mulai turun?',p:TG.buku};
  if(!f.log)return{t:'Siapa di gudang pada jam itu? Cek buku tamu.',p:TG.log};
  return{t:'Kamu tahu pelakunya. Temui Pak Anto.',p:TG.anto};
}
function stageHint(){
  const f=S.flags;
  if(!f.opt)return['opt','Pendapatan berhenti naik saat untung dari harga (hijau) sama dengan rugi dari pembeli yang hilang (merah).'];
  if(!f.acc1)return['acc1','Saran "naik 75%, untung 75%" menganggap jumlah terjual tidak berubah.'];
  if(!f.found)return['found','Buka grafik u. Kunci titik, lalu geser dari kiri. Selama u′ ≈ 0 timbangan masih jujur. Cari saat u′ pertama kali negatif.'];
  return['final','t dihitung sejak pukul 06.00. Ubah ke jam lalu cocokkan dengan buku tamu.'];
}

/* ---------- skor ---------- */
function score(el){
  const lp=S.evidence.filter(e=>e.meta&&e.meta.kind==='lapak').map(e=>Math.abs(e.meta.p-P_OPT));
  const eo=lp.length?Math.min(...lp):null,po=eo==null?0:Math.round(300*clamp(1-(eo-.5)/5,0,1));
  const uu=S.evidence.find(e=>e.meta&&e.meta.kind==='u'&&e.meta.m<-0.05),et=uu?Math.abs(uu.meta.t-TSW):null,pt=et==null?0:Math.round(300*clamp(1-(et-.1)/.6,0,1));
  const items=[['Harga terbaik di papan lapak (maks 300)',po,[['selisih dari harga terbaik: '+(eo==null?'belum':f1(eo)+' rb'),po]]],['Saat u mulai turun (maks 300)',pt,[['selisih waktu: '+(et==null?'belum':f1(et)+' jam'),pt]]],['Penalaran: dua tuduhan benar (maks 400)',400],['Petunjuk ('+S.hints+')',-60*S.hints],['Salah tuduh ('+S.wrong+')',-100*S.wrong]];
  return {items,detail:{detik:el,harga:eo,waktu:et,petunjuk:S.hints,salah:S.wrong}};
}
function learn(){return[
  'Pendapatan adalah perkalian: <code>R = p·q</code>. Turunannya punya dua suku, <code>R′ = q + p·q′</code>: untung dari harga dan rugi dari pembeli yang pergi.',
  'Pendapatan terbesar saat <code>R′ = 0</code>: di harga 50 rb, kedua strip sama besar. Di 70 rb, <code>R′ = −48</code>.',
  'Rata-rata adalah pembagian: <code>u = U/G</code>, dengan <code>u′ = (U′G − UG′)/G²</code>. Rata-rata turun saat barang baru lebih murah dari rata-rata. Begitulah timbangan curang ketahuan jamnya.'
];}

/* ---------- input & gambar ---------- */
function onPointer(type,e){
  if(S.ui!=='lapak')return false;
  const x=e.clientX,y=e.clientY;
  if(type==='down'){if(KT.inR(LP.ok,x,y)){saveLapak();return true;}if(KT.inR(LP.no,x,y)){S.ui='none';return true;}LP.drag={x,p:LP.p,id:e.pointerId};return true;}
  if(type==='move'&&LP.drag&&e.pointerId===LP.drag.id){LP.p=clamp(Math.round((LP.drag.p+(x-LP.drag.x)*.08)*2)/2,20,95);return true;}
  if(type==='up')LP.drag=null;
  return true;
}
function onKey(e){
  if(S.ui!=='lapak')return false;const k=e.key,st=e.shiftKey?5:.5;
  if(k==='ArrowRight'||k==='d'||k==='D')LP.p=clamp(LP.p+st,20,95);
  else if(k==='ArrowLeft'||k==='a'||k==='A')LP.p=clamp(LP.p-st,20,95);
  else if(k==='e'||k==='E'||k==='Enter'||k===' '){if(!e.repeat)saveLapak();}
  else if(k==='Escape')S.ui='none';
  else return false;
  e.preventDefault();return true;
}
function drawOverlay(ctx){if(S.ui==='lapak')lapakPanel(ctx);}
function drawWorldTop(ctx){
  // kerumunan pembeli di lapak Bu Narti, mengikuti harga di papan
  const n=Math.round(qOf(S.ui==='lapak'||S.flags.opt?LP.p:P_NOW)/6),R=rngSeed(7);
  for(let i=0;i<n;i++){const x=NARTI.x-70+R()*140,y=NARTI.y+58+R()*60;
    ctx.fillStyle='rgba(28,34,48,.25)';ctx.beginPath();ctx.ellipse(x+2,y+6,9,5,0,0,7);ctx.fill();
    ctx.fillStyle=['#2f7fc1','#9a8fc2','#d98c5f','#8aa05a'][i%4];ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,8,0,7);ctx.fill();ctx.stroke();
    ctx.fillStyle='#f0c8a0';ctx.beginPath();ctx.arc(x,y-1,4,0,7);ctx.fill();}
}
const CINE={t:0};
function begin(){P.x=TG.anto.x+60;P.y=TG.anto.y+30;S.ui='cine';CINE.t=0;return [NARTI.x,NARTI.y+60];}
function cineStep(dt){CINE.t+=dt;if(CINE.t>4.6)endCine();return CINE.t<2.6?[NARTI.x,NARTI.y+60]:[TG.darto.x,TG.darto.y];}
function drawCine(ctx){
  const {H,hs}=V;
  if(CINE.t<2.6){KT.bigText(ctx,V,'70.000 / kg',H*.3,58,ALERT);KT.subText(ctx,V,'Harga naik. Pembeli hilang.',H*.3+32*hs);}
  else{KT.bigText(ctx,V,'SIAPA UNTUNG?',H*.3,52,SUN);}
  KT.skipHint(ctx,V,G);
}
function cineEnd(){card('BAB 1','DUA KALI LIPAT');}
function night(){return S.flags.twist?.35:0;}
function jitter(it){return(it.ch==='darto'&&S.flags.uji)?Math.sin(G.T*30)*1.2:0;}
if(window.__TEST__)window.__C={LP,saveLapak};

return {
  THEORY,THEORY_START:['k3-dasar'],
  id:'cabai-1',judul:'Cabai Dua Kali Lipat',eyebrow:'Semesta 3, Warung dan Pasar. Kasus 1',
  lede:'Harga cabai naik hampir dua kali lipat. Anehnya, para pedagang justru bangkrut. Seseorang sedang bermain angka di pasar.',
  teaser:'<b>Senin pagi.</b> Kolam desa menghijau dalam semalam. Kemarin cuma sepetak lumut. Kata warga: "Itu alami." Benarkah? <b>Semesta 4 segera.</b>',
  chapter:'Bab 1: Dua Kali Lipat',
  WW,WH,SOLIDS,LAMPS,CH,TG,
  ints:INTS,buildWorld,objective,stageHint,ACQ,wrongMsg,onAccuseOk,onLensSave,suspects,score,learn,
  onPointer,onKey,drawOverlay,drawWorldTop,begin,cineStep,drawCine,cineEnd,night,jitter
};
}
