/* Lapisan waktu nyata v2. Pesan hanya disebar ke satu tim, bukan seluruh kelas:
   - kanal tim  ki-<ruang>-<tim> : kehadiran, posisi, aksi Pos 1 (penerima = anggota tim saja)
   - kanal papan ki-<ruang>-b     : laporan jarang (jumlah anggota dan skor tim) tiap sekitar 20 detik
   - kanal ping pribadi           : hanya untuk mengukur waktu balas server
   Antarmuka: kirim(ev,p), ping(), tutup(). Panggilan balik: status(s), hadir(daftar), pesan(ev,p). */
import {SB} from '../core/net.js';

export const EV_TIM=['p','d','st','siap','kunci','minta','emo'];
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
