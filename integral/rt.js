/* Lapisan waktu nyata v2. Pesan hanya disebar ke satu tim, bukan seluruh kelas:
   - kanal tim  ki-<ruang>-<tim> : kehadiran, posisi, aksi Pos 1 (penerima = anggota tim saja)
   - kanal papan ki-<ruang>-b     : laporan jarang (jumlah anggota dan skor tim) tiap sekitar 20 detik
   - kanal ping pribadi           : hanya untuk mengukur waktu balas server
   Antarmuka: kirim(ev,p), ping(), tutup(). Panggilan balik: status(s), hadir(daftar), pesan(ev,p). */
import {SB} from '../core/net.js';

export const EV_TIM=['p','d','st','siap','kunci','mulai','minta','emo','d2','st2','kunci2','mulai2','d3','st3','kunci3','mulai3','d4','st4','kunci4','mulai4','d5','st5','kunci5','mulai5','d6','st6','kunci6','mulai6'];
export const EV_PAPAN=['ro'];
const kePapan=ev=>EV_PAPAN.includes(ev);

function lokal(kode,saya,on){
  const bc=new BroadcastChannel('ki-'+kode),peers=new Map(),ct='t:'+saya.tim;
  const emit=()=>on.hadir([saya,...[...peers.values()].map(p=>({id:p.id,nama:p.nama,tim:p.tim,av:p.av}))]);
  const beat=()=>bc.postMessage({k:'hi',d:saya});
  bc.onmessage=e=>{
    const m=e.data;
    if(m.k==='hi'){
      if(m.d.tim!==saya.tim)return;
      const baru=!peers.has(m.d.id);peers.set(m.d.id,{...m.d,t:Date.now()});if(baru){emit();beat();}
    }else if(m.k==='bye'){if(peers.delete(m.id))emit();}
    else if(m.k==='ev'&&(m.c==='b'||m.c===ct))on.pesan(m.ev,m.p);
  };
  const iv=setInterval(()=>{
    beat();const now=Date.now();let ch=false;
    for(const [id,p] of peers)if(now-p.t>6000){peers.delete(id);ch=true;}
    if(ch)emit();
  },2000);
  const bye=()=>bc.postMessage({k:'bye',id:saya.id});
  addEventListener('pagehide',bye);
  setTimeout(()=>{on.status('luring');emit();beat();},0);
  return {mode:'luring',kirim:(ev,p)=>bc.postMessage({k:'ev',c:kePapan(ev)?'b':ct,ev,p}),ping:async()=>0,
    tutup(){clearInterval(iv);bye();bc.close();}};
}

function daring(kode,saya,on){
  const cl=window.supabase.createClient(SB.url,SB.key,{auth:{persistSession:false,autoRefreshToken:false},realtime:{params:{eventsPerSecond:20}}});
  const tim=cl.channel('ki-'+kode+'-'+saya.tim,{config:{broadcast:{self:false,ack:false},presence:{key:saya.id}}});
  for(const ev of EV_TIM)tim.on('broadcast',{event:ev},m=>on.pesan(ev,m.payload));
  tim.on('presence',{event:'sync'},()=>{
    const st=tim.presenceState(),L=[];
    for(const k in st){const v=st[k][0];if(v&&v.id)L.push({id:v.id,nama:v.nama,tim:v.tim,av:v.av});}
    on.hadir(L);
  });
  const pap=cl.channel('ki-'+kode+'-b',{config:{broadcast:{self:false,ack:false}}});
  for(const ev of EV_PAPAN)pap.on('broadcast',{event:ev},m=>on.pesan(ev,m.payload));
  pap.subscribe();
  const pg=cl.channel('ki-ping-'+saya.id,{config:{broadcast:{self:false,ack:true}}});pg.subscribe();
  tim.subscribe(async s=>{
    if(s==='SUBSCRIBED'){try{await tim.track(saya);}catch(e){}on.status('daring');}
    else if(s==='CHANNEL_ERROR'||s==='TIMED_OUT')on.status('gagal');
    else if(s==='CLOSED')on.status('putus');
  });
  return {mode:'daring',
    kirim:(ev,p)=>{(kePapan(ev)?pap:tim).send({type:'broadcast',event:ev,payload:p}).catch(()=>{});},
    async ping(){
      const t=performance.now();
      try{const r=await pg.send({type:'broadcast',event:'ping',payload:{}});return r==='ok'?performance.now()-t:null;}
      catch(e){return null;}
    },
    tutup(){try{cl.removeChannel(pg);cl.removeChannel(pap);cl.removeChannel(tim);}catch(e){}}};
}

/* paksaLokal: uji antar-tab tanpa server. Jika daring gagal dalam 8 detik, turun ke luring. */
export function sambung(kode,saya,on,paksaLokal){
  let aktif=null,selesai=false;
  const api={get mode(){return aktif?aktif.mode:'-';},kirim:(ev,p)=>aktif&&aktif.kirim(ev,p),ping:()=>aktif?aktif.ping():Promise.resolve(null),tutup:()=>aktif&&aktif.tutup()};
  const turun=()=>{if(selesai)return;selesai=true;try{aktif&&aktif.tutup();}catch(e){}aktif=lokal(kode,saya,on);};
  if(paksaLokal||!window.supabase){selesai=true;aktif=lokal(kode,saya,on);return api;}
  const timer=setTimeout(turun,8000);
  try{
    aktif=daring(kode,saya,{...on,status:s=>{
      if(s==='daring'){selesai=true;clearTimeout(timer);on.status(s);}
      else if(s==='gagal'&&!selesai){clearTimeout(timer);turun();}
      else if(selesai)on.status(s);
    }});
  }catch(e){clearTimeout(timer);turun();}
  return api;
}

/* ---------- mode pengamat (dosen) ----------
   Pengamat hanya mendengarkan: tidak memakai track() sehingga tidak muncul di daftar hadir tim, dan satu-satunya pesan yang
   boleh dikirim adalah 'minta' (meminta keadaan terbaru dari tim yang dipilih). Kanal tim hanya dibuka untuk satu tim pada
   satu waktu agar beban pesan tidak berlipat. Kanal papan (laporan jarang semua tim) selalu terbuka. */
function amatLokal(kode,on){
  const bc=new BroadcastChannel('ki-'+kode),peers=new Map(),terkirim=[];let tim=null;
  const emit=()=>on.hadir([...peers.values()].map(p=>({id:p.id,nama:p.nama,tim:p.tim,av:p.av})));
  bc.onmessage=e=>{
    const m=e.data;
    if(m.k==='hi'){
      if(!tim||m.d.tim!==tim)return;
      const baru=!peers.has(m.d.id);peers.set(m.d.id,{...m.d,t:Date.now()});if(baru)emit();
    }else if(m.k==='bye'){if(peers.delete(m.id))emit();}
    else if(m.k==='ev'&&(m.c==='b'||(tim&&m.c==='t:'+tim)))on.pesan(m.ev,m.p);
  };
  const iv=setInterval(()=>{
    const now=Date.now();let ch=false;
    for(const [id,p] of peers)if(now-p.t>6000){peers.delete(id);ch=true;}
    if(ch)emit();
  },2000);
  setTimeout(()=>on.status('luring'),0);
  const api={mode:'luring',terkirim,
    pilih(t){tim=t;peers.clear();emit();if(t)setTimeout(()=>api.kirim('minta',{id:'amat'}),400);},
    kirim(ev,p){if(ev!=='minta'||!tim)return;terkirim.push(ev);bc.postMessage({k:'ev',c:'t:'+tim,ev,p});},
    ping:async()=>null,
    tutup(){clearInterval(iv);bc.close();}};
  return api;
}
function amatDaring(kode,on){
  const cl=window.supabase.createClient(SB.url,SB.key,{auth:{persistSession:false,autoRefreshToken:false},realtime:{params:{eventsPerSecond:5}}});
  const terkirim=[];let ch=null;
  const pap=cl.channel('ki-'+kode+'-b',{config:{broadcast:{self:false,ack:false}}});
  for(const ev of EV_PAPAN)pap.on('broadcast',{event:ev},m=>on.pesan(ev,m.payload));
  pap.subscribe(s=>{
    if(s==='SUBSCRIBED')on.status('daring');
    else if(s==='CHANNEL_ERROR'||s==='TIMED_OUT')on.status('gagal');
    else if(s==='CLOSED')on.status('putus');
  });
  const api={mode:'daring',terkirim,
    pilih(t){
      if(ch){try{cl.removeChannel(ch);}catch(e){}ch=null;}
      on.hadir([]);if(!t)return;
      const c=cl.channel('ki-'+kode+'-'+t,{config:{broadcast:{self:false,ack:false}}});ch=c;
      for(const ev of EV_TIM)c.on('broadcast',{event:ev},m=>{if(ch===c)on.pesan(ev,m.payload);});
      c.on('presence',{event:'sync'},()=>{
        if(ch!==c)return;
        const st=c.presenceState(),L=[];
        for(const k in st){const v=st[k][0];if(v&&v.id)L.push({id:v.id,nama:v.nama,tim:v.tim,av:v.av});}
        on.hadir(L);
      });
      c.subscribe(s=>{if(s==='SUBSCRIBED')setTimeout(()=>{if(ch===c)api.kirim('minta',{id:'amat'});},700);});
    },
    kirim(ev,p){if(ev!=='minta'||!ch)return;terkirim.push(ev);ch.send({type:'broadcast',event:ev,payload:p}).catch(()=>{});},
    ping:async()=>null,
    tutup(){try{if(ch)cl.removeChannel(ch);cl.removeChannel(pap);}catch(e){}}};
  return api;
}
export function sambungAmat(kode,on,paksaLokal){
  if(paksaLokal||!window.supabase){setTimeout(()=>{},0);return amatLokal(kode,on);}
  try{return amatDaring(kode,on);}catch(e){return amatLokal(kode,on);}
}
