/* Karakter pengganggu bertema tiap pos: model glTF CC0 (Quaternius, via Poly Pizza) ber-rig dan beranimasi.
   Dimuat malas hanya saat pemain masuk pos yang memakainya (sekitar 0,2 sampai 0,4 MB per spesies). Sumber dan lisensi: aset/LISENSI.md.
   SPESIES[id] = {nama, file, tinggi, kec (satuan/detik), jalan/serang (regex nama animasi), kena (jarak sambar), awas, maju (jarak kepala dari pusat)}.
   buatFauna(id) -> {grup, main('jalan'|'serang'), langkah(v), perbarui(dt)}. Model menghadap +z, kaki di y=0. */
import * as THREE from './vendor/three.min.js';
export const SPESIES={
  trex:{nama:'T-Rex',file:'trex.glb',tinggi:4.2,lebar:2,kec:2.4,jalan:/Walk$/,serang:/Attack$/,kena:1.5,awas:9,maju:1.6,warna:1.8},
  ular:{nama:'Ular gurun',file:'ular.glb',tinggi:1.7,lebar:1.5,kec:3.0,jalan:/Walk$/,serang:/Attack$/,kena:1.4,awas:8,maju:1.0,warna:1.5},
  serigala:{nama:'Serigala salju',file:'serigala.glb',tinggi:2.2,lebar:1.5,kec:3.4,jalan:/Walk$/,serang:/Headbutt$/,kena:1.5,awas:9,maju:1.1,warna:1.4},
  laba:{nama:'Laba-laba raksasa',file:'laba.glb',tinggi:2.2,lebar:1.5,kec:2.6,jalan:/Walk$/,serang:/Attack$/,kena:1.6,awas:8,maju:1.0,warna:1.4},
  kepiting:{nama:'Kepiting raksasa',file:'kepiting.glb',tinggi:2.2,lebar:1.5,skala:1.9,kec:2.4,jalan:/Walk$/,serang:/Bite_Front$/,kena:1.6,awas:8,maju:1.0,warna:1.3},
  triceratops:{nama:'Triceratops',file:'triceratops.glb',tinggi:3.0,lebar:2,kec:2.6,jalan:/Walk$/,serang:/Attack$/,kena:1.7,awas:9,maju:1.3,warna:1.8},
};
const URL_DIR=new URL('./aset/',import.meta.url).href;
const janji={},gltf={};
export function muatFauna(id){
  const S=SPESIES[id];if(!S)return Promise.reject(new Error('spesies tidak dikenal: '+id));
  if(janji[id])return janji[id];
  janji[id]=import('./vendor/GLTFLoader.js').then(({GLTFLoader})=>new Promise((ok,gagal)=>new GLTFLoader().load(URL_DIR+S.file+'?v=41',g=>{gltf[id]=g;ok(g);},undefined,gagal)));
  janji[id].catch(()=>{delete janji[id];});
  return janji[id];
}
export async function buatFauna(id,opsi={}){
  const S=SPESIES[id],g=await muatFauna(id);
  const {clone}=await import('./vendor/SkeletonUtils.js');
  const model=clone(g.scene),grup=new THREE.Group();grup.add(model);
  model.traverse(o=>{
    if(!o.isMesh)return;o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false;
    /* bahan standar agar bereaksi pada cahaya dan peta lingkungan; warna asli dicerahkan sedikit supaya tidak gelap di bawah ACES */
    const mt=(Array.isArray(o.material)?o.material:[o.material]).map(m=>new THREE.MeshStandardMaterial({color:m.color.clone().multiplyScalar(S.warna),map:m.map||null,roughness:.72,metalness:0,flatShading:!m.map}));
    o.material=mt.length===1?mt[0]:mt;
  });
  const mixer=new THREE.AnimationMixer(model),klip={};
  const cari=re=>g.animations.find(c=>re.test(c.name));
  klip.jalan=cari(S.jalan);klip.serang=cari(S.serang);klip.diam=cari(/Idle$/);
  if(klip.diam){mixer.clipAction(klip.diam).play();mixer.update(0);}
  grup.updateMatrixWorld(true);
  /* kotak batas: pakai simpul berkulit (tepat); sebagian model memberi NaN, jatuhkan ke kotak geometri */
  const ukurKotak=()=>{let k=new THREE.Box3().setFromObject(model,true);if(!Number.isFinite(k.min.y+k.max.y+k.min.x+k.max.x)||k.isEmpty())k=new THREE.Box3().setFromObject(model,false);return k;};
  let kotak=ukurKotak();
  const tinggi=opsi.tinggi||S.tinggi,tinggiAsli=kotak.max.y-kotak.min.y,sah=Number.isFinite(tinggiAsli)&&tinggiAsli>1e-3;
  /* sebagian model (kepiting) memberi kotak batas tak sah dari FBX2glTF: pakai skala tetap dari spesifikasi */
  model.scale.multiplyScalar(sah?tinggi/tinggiAsli:(S.skala||1));
  grup.updateMatrixWorld(true);if(sah){kotak=ukurKotak();if(Number.isFinite(kotak.min.y))model.position.y-=kotak.min.y;}
  let aktif=klip.diam?mixer.existingAction(klip.diam):null,nama='diam';
  function main(k,lintas=.25){
    const c=klip[k];if(!c||k===nama)return false;const a=mixer.clipAction(c);
    a.reset().setEffectiveWeight(1).play();if(aktif)aktif.crossFadeTo(a,lintas,false);aktif=a;nama=k;return true;
  }
  /* irama langkah: satu siklus jalan menempuh kira-kira 1,2 kali tinggi badan; timeScale disamakan dengan kecepatan v (satuan/detik) */
  function langkah(v){if(!klip.jalan)return;const a=mixer.existingAction(klip.jalan);if(a)a.timeScale=klip.jalan.duration*v/(Math.max(tinggi,1.2)*1.2);}
  return {grup,main,langkah,perbarui:dt=>mixer.update(Math.min(dt,.1)),nama:Object.keys(klip),mixer,S};
}
