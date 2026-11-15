/* Tingkat grafis Ultra (hanya Pos 1): pemuat aset malas. Tekstur PBR 512 px WebP, langit LDR 1k sebagai peta lingkungan.
   Tidak dimuat sebelum pemain memilih Ultra dan masuk Pos 1, jadi tidak membebani masuk lobi. Sumber dan lisensi: aset/LISENSI.md. */
import * as THREE from './vendor/three.min.js';
const DIR=new URL('./aset/',import.meta.url).href,V='?v=41';
let janji=null,hasil=null;
export const ultraSiap=()=>!!hasil;
export const ultraAset=()=>hasil;
export function muatUltra(renderer){
  if(janji)return janji;
  const L=new THREE.TextureLoader();
  const tx=(f,warna)=>new Promise((ok,gagal)=>L.load(DIR+f+'.webp'+V,t=>{
    t.colorSpace=warna?THREE.SRGBColorSpace:THREE.NoColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;ok(t);},undefined,gagal));
  const nama=['beton','tanah','kayu','batu'];
  janji=Promise.all([...nama.map(n=>tx(n,true)),...nama.map(n=>tx(n+'_n',false)),tx('langit',true)]).then(a=>{
    const T={};nama.forEach((n,i)=>{T[n]=a[i];T[n+'_n']=a[i+4];});
    const langit=a[8];langit.mapping=THREE.EquirectangularReflectionMapping;langit.wrapS=langit.wrapT=THREE.ClampToEdgeWrapping;
    const pm=new THREE.PMREMGenerator(renderer),rt=pm.fromEquirectangular(langit);pm.dispose();
    T.env=rt.texture;T.langit=langit;hasil=T;return T;
  });
  janji.catch(()=>{janji=null;});
  return janji;
}
