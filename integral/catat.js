/* Pencatatan hasil Lobi Integral ke sesi kelas (sistem sesi, NIM, dan tabel hasil yang sama dengan Kasus Turunan).
   Tidak ada skema baru: satu babak satu baris per mahasiswa, kasus = "int-p<pos>-b<babak>", detail di kolom rincian.
   Prinsip: pencatatan tidak boleh mengganggu permainan. Semua galat ditelan, jaringan putus diulang beberapa kali. */
import {rpc,bacaSesi,simpanSesi} from '../core/net.js';

export const TOKEN_SAH=/^[A-Z0-9-]{4,20}$/;
export const NIM_SAH=/^[0-9]{6,20}$/;

/* sesi dari portal Kasus Turunan (sudah punya kunci akun) */
export function dariPortal(){
  const s=bacaSesi();
  return s&&s.kunci&&s.token?{kunci:s.kunci,token:String(s.token).toUpperCase(),user:s.user||''}:null;
}

/* masuk ke sesi dengan token dan NIM. Username memakai nama panggilan. Melempar Error berpesan Indonesia. */
export async function masukSesi(token,nama,nim){
  const r=await rpc('masuk',{p_token:token,p_username:nama,p_nim:nim});
  const s={kunci:r.kunci,token,user:r.username};
  simpanSesi(s);
  try{localStorage.setItem('kt-token',token);}catch(e){}
  return s;
}

export const kasusId=(pos,r)=>'int-p'+pos+'-b'+(r+1);

/* kode miskonsepsi yang stabil untuk agregasi. Pos 1: arah galat luas. Pos 2 sampai 5: kode dari penilai.
   Pos 6: tiap stasiun berisi teks miskonsepsi pilihan yang dipilih ("k<stasiun>|<teks>"). */
export function kodeCatatan(pos,h){
  if(pos===1){
    if(!h||h.akurasi>=100)return [];
    return [h.selisih>0?'luasLebih':'luasKurang'];
  }
  const c=(h&&h.catatan)||[];
  if(pos===6)return c.map(x=>'k'+x.i+'|'+String(x.teks).slice(0,140));
  return c.filter(x=>typeof x==='string').slice(0,8);
}

/* label singkat untuk dosen, kunci "<pos>:<kode>" */
export const LABEL={
  '1:luasLebih':'Balok terlalu banyak: luas taksiran melebihi daerah',
  '1:luasKurang':'Balok terlalu sedikit: luas taksiran kurang dari daerah',
  '2:turunan':'Memasang turunan fungsi di dalam tanda integral',
  '2:anti':'Memasang antiturunan F, bukan f, di dalam tanda integral',
  '2:var':'Variabel fungsi tidak cocok dengan diferensialnya',
  '2:d':'Diferensial (dx atau dt) salah',
  '2:tukar':'Batas bawah dan atas tertukar',
  '2:batas':'Batas integral tidak sesuai ujung daerah atau selang',
  '2:kosong':'Ada slot notasi yang kosong',
  '3:turun':'Pangkat diturunkan (langkah turunan, bukan antiturunan)',
  '3:tetap':'Pangkat tidak dinaikkan',
  '3:naikLagi':'Pangkat dinaikkan lebih dari satu',
  '3:bagiLama':'Koefisien dibagi pangkat lama, bukan pangkat baru',
  '3:kali':'Koefisien dikali pangkat (langkah turunan)',
  '3:lupaBagi':'Koefisien belum dibagi pangkat baru',
  '3:koef':'Koefisien salah (alasan lain)',
  '3:lupaC':'Konstanta C terlupa atau diganti 0',
  '3:nilaiC':'Nilai C tidak tepat',
  '3:kosong':'Ada slot yang kosong',
  '4:bukanKumulatif':'Tangki diisi luas selang sendiri, bukan akumulasi sejak awal',
  '4:lupaAwal':'Volume awal V0 terlupa',
  '4:tanda':'Luas di bawah sumbu t ditambah, seharusnya dikurangi',
  '4:kurang':'Isi tangki kurang dari seharusnya',
  '4:lebih':'Isi tangki lebih dari seharusnya',
  '5:tukar':'Piring F(atas) dan F(bawah) tertukar',
  '5:terbalik':'Batas terbalik (atas lebih kecil dari bawah) salah ditangani',
  '5:fBukanF':'Memakai f, bukan antiturunan F',
  '5:lupaBawah':'F(bawah) tidak dikurangkan',
  '5:dijumlah':'F(atas) dan F(bawah) dijumlah, bukan dikurangkan',
  '5:kurang':'Selisih F kurang dari nilai integral (F keliru)',
  '5:lebih':'Selisih F lebih dari nilai integral (F keliru)'
};
export const NAMA_POS=['Tambal Waduk','Rakit Sandi','Mesin Putar Balik','Misteri Tangki','Brankas Batas','Puncak Final'];
export const STASIUN6=['Pos Lembah','Pos Tebing','Puncak'];
/* uraikan satu kode menjadi teks untuk dosen */
export function labelKode(pos,kode){
  if(pos===6){const m=/^k(\d)\|([\s\S]*)$/.exec(kode);return m?(STASIUN6[+m[1]]||('Stasiun '+(+m[1]+1)))+': '+m[2]:kode;}
  return LABEL[pos+':'+kode]||kode;
}

const bil=(v,a,b)=>Number.isFinite(v)?Math.max(a,Math.min(b,Math.round(v))):a;

/* kirim satu babak. info: {pos,r,skor,detik,rincian}. lapor(status) dipanggil dengan 'ok', 'gagal' atau 'ditolak'. */
export async function catat(sesi,info,lapor){
  if(!sesi||!sesi.kunci||!sesi.token)return;
  const body={p_kunci:sesi.kunci,p_token:sesi.token,p_kasus:kasusId(info.pos,info.r),
    p_skor:bil(info.skor,0,1000),p_detik:bil(info.detik,0,86400),p_rincian:info.rincian};
  const jeda=[0,3000,9000,25000];
  for(let i=0;i<jeda.length;i++){
    if(jeda[i])await new Promise(r=>setTimeout(r,jeda[i]));
    try{await rpc('simpan_hasil',body);if(lapor)lapor('ok');return;}
    catch(e){
      /* penolakan server (sesi ditutup, belum masuk, akun tidak dikenal) tidak diulang */
      if(!/^Tidak bisa terhubung/.test(String(e&&e.message))){if(lapor)lapor('ditolak',e&&e.message);return;}
    }
  }
  if(lapor)lapor('gagal');
}
