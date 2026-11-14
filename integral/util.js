/* Alat kecil bersama: label teks 3D dan pembatas nilai. */
import * as THREE from './vendor/three.min.js';

export const klem=(v,a,b)=>Math.max(a,Math.min(b,v));

export function labelSprite(teks,opt={}){
  const c=document.createElement('canvas'),w=opt.w||256,h=opt.h||64;c.width=w;c.height=h;
  const g=c.getContext('2d');
  if(opt.bg){g.fillStyle=opt.bg;g.strokeStyle='#1c2230';g.lineWidth=6;g.beginPath();g.roundRect(4,4,w-8,h-8,14);g.fill();g.stroke();}
  g.font='700 '+(opt.size||30)+'px "Chakra Petch","Trebuchet MS",sans-serif';g.textAlign='center';g.textBaseline='middle';
  const baris=String(teks).split('\n'),lh=(opt.size||30)*1.15;
  baris.forEach((b,i)=>{
    const y=h/2+(i-(baris.length-1)/2)*lh;
    if(!opt.bg){g.lineWidth=6;g.strokeStyle='#fff6e4';g.strokeText(b,w/2,y);}
    g.fillStyle=opt.fg||'#1c2230';g.fillText(b,w/2,y);
  });
  const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tx,transparent:true,depthWrite:false}));
  sp.scale.set(opt.sx||3,(opt.sx||3)*h/w,1);return sp;
}
export function buangSprite(sp){sp.material.map.dispose();sp.material.dispose();}
