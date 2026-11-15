/* T-Rex untuk Pos 1 (prototipe, belum dipasang di game). Model glTF CC0 "T-Rex" oleh Quaternius (Poly Pizza),
   ber-rig dengan 6 animasi: Attack, Death, Idle, Jump, Run, Walk. Dimuat malas (GLTFLoader dan model sekitar 0,5 MB),
   jadi tidak membebani masuk lobi. Sumber dan lisensi: aset/LISENSI.md.
   muatDino() -> Promise; buatDino({tinggi}) -> {grup, main(nama, lintas), perbarui(dt), nama[]}. Menghadap +z, kaki di y=0. */
import * as THREE from './vendor/three.min.js';
const URL_MODEL=new URL('./aset/trex.glb?v=36',import.meta.url).href;
let janji=null,gltf=null;
export function muatDino(){
  if(janji)return janji;
  janji=import('./vendor/GLTFLoader.js').then(({GLTFLoader})=>new Promise((ok,gagal)=>new GLTFLoader().load(URL_MODEL,g=>{gltf=g;ok(g);},undefined,gagal)));
  janji.catch(()=>{janji=null;});
  return janji;
}
/* nama animasi pendek: 'Armature|TRex_Walk' -> 'Walk' */
const pendek=n=>n.split('_').pop();
export async function buatDino(opsi={}){
  const g=await muatDino();
  const {clone}=await import('./vendor/SkeletonUtils.js');
  const model=clone(g.scene),grup=new THREE.Group();grup.add(model);
  model.traverse(o=>{
    if(!o.isMesh)return;o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false;
    /* bahan asli berwarna datar; ganti ke standar agar bereaksi pada cahaya dan peta lingkungan Ultra */
    const mt=(Array.isArray(o.material)?o.material:[o.material]).map(m=>new THREE.MeshStandardMaterial({color:m.color.clone().multiplyScalar(1.8),roughness:.72,metalness:0,flatShading:true}));
    o.material=mt.length===1?mt[0]:mt;
  });
  /* skala ke tinggi yang diminta dan kaki menapak y=0 (ukur dalam pose diam) */
  const mixer=new THREE.AnimationMixer(model),klip={};
  for(const c of g.animations)klip[pendek(c.name)]=c;
  if(klip.Idle){mixer.clipAction(klip.Idle).play();mixer.update(0);}
  grup.updateMatrixWorld(true);
  let kotak=new THREE.Box3().setFromObject(model,true);
  const s=(opsi.tinggi||6.8)/Math.max(1e-6,kotak.max.y-kotak.min.y);model.scale.multiplyScalar(s);
  grup.updateMatrixWorld(true);kotak=new THREE.Box3().setFromObject(model,true);model.position.y-=kotak.min.y;
  /* arah hadap model: hadapkan ke +z bila panjangnya di sumbu x */
  const uk=kotak.getSize(new THREE.Vector3());if(uk.x>uk.z*1.2)model.rotation.y=-Math.PI/2;
  let aktif=klip.Idle?mixer.existingAction(klip.Idle):null;
  function main(nama,lintas=.25){
    const c=klip[nama];if(!c)return false;const a=mixer.clipAction(c);if(a===aktif)return true;
    a.reset().setEffectiveWeight(1);
    if(nama==='Death'||nama==='Jump'){a.setLoop(THREE.LoopOnce,1);a.clampWhenFinished=nama==='Death';}   // Attack berulang (mengaum) selama dipakai
    a.play();if(aktif)aktif.crossFadeTo(a,lintas,false);aktif=a;return true;
  }
  /* irama langkah: satu siklus Walk menempuh kira-kira 1,2 kali tinggi badan; timeScale disamakan dengan kecepatan v (satuan/detik) */
  const tinggi=opsi.tinggi||6.8;
  function langkah(v){if(!klip.Walk)return;const a=mixer.existingAction(klip.Walk);if(a)a.timeScale=klip.Walk.duration*v/(tinggi*1.2);}
  return {grup,main,langkah,perbarui:dt=>mixer.update(Math.min(dt,.1)),nama:Object.keys(klip),mixer};
}
