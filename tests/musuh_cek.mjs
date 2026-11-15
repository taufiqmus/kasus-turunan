/* Cek lintasan karakter pengganggu di keenam dunia: rute tertutup dan kontinu, selalu di jalan atau di tepi kamp, tidak masuk plaza dan zona soal,
   tidak masuk pusat kamp, kecepatan wajar, deterministik, seed berbeda memberi rute berbeda. Lalu aturan balok habis Pos 1.
   Pakai: node tests/musuh_cek.mjs */
import {M1,M2,M3,M4,M5,M6} from '../integral/medan.js';
import {rute,posMusuh,hashTeks,zMin,TEPI} from '../integral/musuh.js';
import {SPESIES} from '../integral/fauna.js';
let gagal=0;const cek=(n,k,info='')=>{console.log((k?'OK  ':'GAGAL ')+n,info);if(!k)gagal++;};
const DUNIA=[['Pos 1',M1,'trex'],['Pos 2',M2,'ular'],['Pos 3',M3,'serigala'],['Pos 4',M4,'laba'],['Pos 5',M5,'kepiting'],['Pos 6',M6,'triceratops']];
for(const [nm,W,sp] of DUNIA){
  const S=SPESIES[sp];
  for(const kd of ['ABC|merah','KELAS7|hijau']){
    const seed=hashTeks(kd+'|'+nm),R=rute(W,seed,S),zm=zMin(W);
    cek(nm+' '+sp+' '+kd+': rute punya ruas',R.L.length>10,R.L.length);
    const a=posMusuh(W,seed,0,S),b=posMusuh(W,seed,R.T-1e-6,S);
    cek(nm+' '+kd+': rute tertutup',Math.hypot(a.x-b.x,a.z-b.z)<.05,R.T.toFixed(1)+' dtk');
    let maks=0,zmin=1e9,diJalan=true,kampMin=1e9,p0=a;
    for(let t=.05;t<R.T*1.5;t+=.05){const p=posMusuh(W,seed,t,S);maks=Math.max(maks,Math.hypot(p.x-p0.x,p.z-p0.z)/.05);zmin=Math.min(zmin,p.z);
      const dk=Math.min(...W.KAMP.map(k=>Math.hypot(k.x-p.x,k.z-p.z)));kampMin=Math.min(kampMin,dk);if(W.jarakJalan(p.x,p.z)>.6&&dk>TEPI+1)diJalan=false;p0=p;}
    cek(nm+' '+kd+': kecepatan tidak melompat',maks<=S.kec*1.05,maks.toFixed(2));
    cek(nm+' '+kd+': tidak masuk plaza dan zona soal',zmin>=zm-1e-6,zmin.toFixed(1)+' >= '+zm);
    cek(nm+' '+kd+': selalu di jalan atau di tepi kamp',diJalan);
    cek(nm+' '+kd+': tidak masuk lingkaran kamp',kampMin>=Math.max(...W.KAMP.map(k=>k.r))+.1,kampMin.toFixed(2));
    cek(nm+' '+kd+': deterministik',JSON.stringify(posMusuh(W,seed,1234.5,S))===JSON.stringify(posMusuh(W,seed,1234.5,S)));
  }
  cek(nm+': seed berbeda, rute berbeda',rute(W,hashTeks('A|merah'),S).T!==rute(W,hashTeks('A|biru'),S).T||posMusuh(W,hashTeks('A|merah'),50,S).x!==posMusuh(W,hashTeks('A|biru'),50,S).x);
}
/* aturan balok habis (pos1.js) */
const P1=await import('../integral/pos1.js');
const st0={r:0,f:1,c:[0,0,0],g:[0,0,0],sr:[],w:[]},butuh=P1.butuhBabak(0);
cek('stok Pos 1 = 1,5 kali kebutuhan + 4',P1.jumlah(P1.stokBabak(0))===Math.ceil(butuh*1.5)+4,P1.stokBabak(0));
cek('Pos 1 habis: stok 0, tidak membawa, kolom kurang -> game over',P1.habisBalok(st0,0)===true);
cek('Pos 1 belum habis bila masih ada yang membawa',P1.habisBalok(st0,2)===false);
cek('Pos 1 belum habis bila masih ada stok',P1.habisBalok({...st0,g:[0,1,0]},0)===false);
cek('Pos 1 bukan game over bila kolom sudah cukup',P1.habisBalok({...st0,c:[butuh,0,0]},0)===false);
cek('Pos 1 tidak berlaku sebelum babak dimulai',P1.habisBalok({...st0,f:0},0)===false);
cek('st dengan penghitung ulang u sah',P1.valid({...P1.stateBaru(),u:3})&&!P1.valid({...P1.stateBaru(),u:-1}));
console.log(gagal?'ADA YANG GAGAL':'SEMUA LULUS');process.exit(gagal?1:0);
