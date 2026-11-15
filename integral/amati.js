/* Gerbang mode pengamat: hanya pemilik sesi (akun dosen Supabase) yang boleh masuk lewat formulir.
   Catatan jujur: ini pembatas kenyamanan agar mahasiswa tidak sengaja mengintip, bukan keamanan sejati.
   Kanal siaran pada dasarnya terbuka bagi siapa pun yang tahu kode ruang dan mengubah kodenya sendiri. */
import {SB} from '../core/net.js';

const KUNCI='kt-auth';
const baca=()=>{try{return JSON.parse(sessionStorage.getItem(KUNCI)||'null');}catch(e){return null;}};
const simpan=a=>{try{sessionStorage.setItem(KUNCI,JSON.stringify(a));}catch(e){}};
export const sudahMasuk=()=>{const a=baca();return !!(a&&a.rt&&a.at);};

async function panggil(path,opt){
  const a=baca()||{};
  const h={'apikey':SB.key,'Content-Type':'application/json'};if(a.at)h['Authorization']='Bearer '+a.at;
  let r;
  try{r=await fetch(SB.url+path,{method:opt&&opt.method||'GET',headers:h,body:opt&&opt.body?JSON.stringify(opt.body):undefined});}
  catch(e){throw new Error('Tidak bisa terhubung ke server.');}
  let j=null;try{j=await r.json();}catch(e){}
  return {ok:r.ok,status:r.status,j};
}
async function segarkan(){
  const a=baca();if(!a||!a.rt)return false;
  try{
    const r=await fetch(SB.url+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{'apikey':SB.key,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:a.rt})});
    if(!r.ok)return false;const j=await r.json();simpan({at:j.access_token,rt:j.refresh_token,email:a.email});return true;
  }catch(e){return false;}
}
export async function masukDosen(email,sandi){
  const r=await panggil('/auth/v1/token?grant_type=password',{method:'POST',body:{email,password:sandi}});
  if(!r.ok)throw new Error(/invalid/i.test(String(r.j&&(r.j.msg||r.j.message||r.j.error_description)))?'Email atau kata sandi salah.':'Gagal masuk sebagai dosen.');
  simpan({at:r.j.access_token,rt:r.j.refresh_token,email:r.j.user&&r.j.user.email||email});
}
/* memeriksa bahwa akun yang masuk memang pemilik token (aturan RLS tabel sesi hanya mengembalikan sesi milik sendiri) */
export async function izin(token){
  if(!sudahMasuk())throw new Error('Masuk dengan akun dosen dulu.');
  const q='/rest/v1/sesi?token=eq.'+encodeURIComponent(token)+'&select=id,nama,status';
  let r=await panggil(q);
  if(r.status===401&&await segarkan())r=await panggil(q);
  if(!r.ok)throw new Error('Sesi login kedaluwarsa. Masuk lagi.');
  if(!Array.isArray(r.j)||!r.j.length)throw new Error('Token ini tidak ada atau bukan milik akun Anda.');
  return r.j[0];
}
