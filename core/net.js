/* Lapisan jaringan: Supabase lewat fetch biasa (tanpa SDK). Kunci di bawah adalah kunci publik (publishable). */
export const SB={url:'https://xktcstifwufjpvqoeixn.supabase.co',key:'sb_publishable_0fZkEaMFUbR9KXA3DccyvA_pZFzd9iN'};

export async function rpc(fn,body){
  let r;
  try{r=await fetch(SB.url+'/rest/v1/rpc/'+fn,{method:'POST',headers:{'apikey':SB.key,'Content-Type':'application/json'},body:JSON.stringify(body)});}
  catch(e){throw new Error('Tidak bisa terhubung ke server. Periksa jaringan, atau pakai mode coba.');}
  let j=null;try{j=await r.json();}catch(e){}
  if(!r.ok)throw new Error((j&&j.message)||'Server menolak permintaan.');
  return j;
}

/* Sesi mahasiswa dibawa dari portal ke halaman game lewat sessionStorage. */
const KEY='kt-sesi';
export function simpanSesi(s){try{sessionStorage.setItem(KEY,JSON.stringify(s));}catch(e){}}
export function bacaSesi(){try{return JSON.parse(sessionStorage.getItem(KEY)||'null');}catch(e){return null;}}
export function hapusSesi(){try{sessionStorage.removeItem(KEY);}catch(e){}}
