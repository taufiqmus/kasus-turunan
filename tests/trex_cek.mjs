/* Cek lintasan T-Rex Pos 1: rute tertutup dan kontinu, selalu di jalan, tidak masuk plaza/zona kolom, kecepatan wajar,
   deterministik (dua panggilan sama), seed berbeda memberi rute berbeda. Pakai: node tests/trex_cek.mjs */
import {M1} from '../integral/medan.js';
import {rute,posTrex,hashTeks,ZMIN,KEC,kampKembali} from '../integral/trex.js';
let gagal=0;const cek=(n,k,info='')=>{console.log((k?'OK  ':'GAGAL ')+n,info);if(!k)gagal++;};
for(const s of ['ABC|merah','ABC|biru','KELAS7|hijau']){
  const seed=hashTeks(s),R=rute(M1,seed);
  cek(s+': rute punya ruas',R.L.length>10,R.L.length);
  const a=posTrex(M1,seed,0),b=posTrex(M1,seed,R.T-1e-6);
  cek(s+': rute tertutup',Math.hypot(a.x-b.x,a.z-b.z)<.05,R.T.toFixed(1)+' dtk');
  let maks=0,zmin=1e9,diJalan=true,kampMin=1e9,p0=posTrex(M1,seed,0);
  for(let t=.05;t<R.T*2;t+=.05){const p=posTrex(M1,seed,t);maks=Math.max(maks,Math.hypot(p.x-p0.x,p.z-p0.z)/.05);zmin=Math.min(zmin,p.z);const dk=Math.min(...M1.KAMP.map(k=>Math.hypot(k.x-p.x,k.z-p.z)));kampMin=Math.min(kampMin,dk);if(M1.jarakJalan(p.x,p.z)>.6&&dk>7)diJalan=false;p0=p;}
  cek(s+': kecepatan tidak melompat',maks<=KEC*1.05,maks.toFixed(2));
  cek(s+': tidak masuk plaza dan zona kolom',zmin>=ZMIN-1e-6,zmin.toFixed(1));
  cek(s+': selalu di jalan atau di tepi kamp',diJalan);
  cek(s+': tidak masuk pusat kamp (tempat ambil balok)',kampMin>=5.9,kampMin.toFixed(2));
  cek(s+': deterministik',JSON.stringify(posTrex(M1,seed,1234.5))===JSON.stringify(posTrex(M1,seed,1234.5)));
}
cek('seed berbeda, rute berbeda',rute(M1,hashTeks('A|merah')).T!==rute(M1,hashTeks('A|biru')).T||posTrex(M1,hashTeks('A|merah'),50).x!==posTrex(M1,hashTeks('A|biru'),50).x);
cek('balok kembali ke kamp terdekat yang belum penuh',kampKembali(M1,-27,40,[5,5,5],120)===0&&kampKembali(M1,-27,40,[120,5,5],120)===1);
console.log(gagal?'ADA YANG GAGAL':'SEMUA LULUS');process.exit(gagal?1:0);
