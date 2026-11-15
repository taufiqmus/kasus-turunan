/* Arena Pos 6 "Puncak Kalkulus": dunia umum (tema gunung) ditambah papan ringkasan soal di plaza,
   papan soal di tiap pos jawaban, dan bendera kamp yang berwarna sesuai pilihan tim. */
import * as THREE from './vendor/three.min.js';
import {M6} from './medan.js?v=38';
import {buatDunia,TEMA_GUNUNG,mat,tulisanLantai} from './dunia3d.js?v=38';
import {soal6,HURUF,NSTASIUN} from './pos6.js?v=38';

const WARNA_OPSI=['#e5392b','#2f7fc1','#2f9e5b','#e0a200'];
function bungkus(g,teks,maks){
  const kata=teks.split(' '),baris=[];let b='';
  for(const k of kata){const c=b?b+' '+k:k;if(g.measureText(c).width>maks&&b){baris.push(b);b=k;}else b=c;}
  if(b)baris.push(b);return baris;
}
/* satu kotak soal: judul pos, pertanyaan terbungkus, empat pilihan; pilihan tim disorot */
function kotakSoal(g,x,y,w,h,judul,q,pilih,k){
  g.fillStyle='#ffffff';g.strokeStyle='#2a3a4a';g.lineWidth=Math.max(2,6*k);g.beginPath();g.roundRect(x,y,w,h,24*k);g.fill();g.stroke();
  g.fillStyle='#2a3a4a';g.font='800 '+Math.round(44*k)+'px "Bricolage Grotesque",sans-serif';g.textAlign='left';g.textBaseline='top';g.fillText(judul,x+28*k,y+22*k);
  g.font='700 '+Math.round(34*k)+'px "Chakra Petch",sans-serif';g.fillStyle='#1c2230';
  let yy=y+86*k;for(const b of bungkus(g,q.t,w-56*k)){g.fillText(b,x+28*k,yy);yy+=42*k;}
  yy+=14*k;const tinggiO=Math.max(52*k,(y+h-yy-20*k)/4);
  q.o.forEach((o,i)=>{
    const dipilih=pilih===i+1;
    g.fillStyle=dipilih?'#ffe08a':'#f1f4f7';g.beginPath();g.roundRect(x+20*k,yy,w-40*k,tinggiO-8*k,14*k);g.fill();
    if(dipilih){g.strokeStyle='#b8321c';g.lineWidth=Math.max(2,5*k);g.stroke();}
    g.fillStyle=WARNA_OPSI[i];g.beginPath();g.arc(x+52*k,yy+(tinggiO-8*k)/2,20*k,0,Math.PI*2);g.fill();
    g.fillStyle='#fff';g.font='800 '+Math.round(28*k)+'px "Bricolage Grotesque",sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(HURUF[i],x+52*k,yy+(tinggiO-8*k)/2);
    g.fillStyle='#1c2230';g.font='700 '+Math.round(32*k)+'px "Chakra Petch",sans-serif';g.textAlign='left';
    const L=bungkus(g,o,w-130*k);g.fillText(L[0]+(L.length>1?' …':''),x+86*k,yy+(tinggiO-8*k)/2);
    yy+=tinggiO;
  });
}
/* papan plaza: tiga soal berdampingan. Versi kecil (HUD): status jawaban tiap pos */
export function gambarFinal(cv,r,s,opsi={}){
  const S=soal6(r),g=cv.getContext('2d'),W=cv.width,H=cv.height,k=W/2000,kecil=!!opsi.kecil,nama=M6.KAMP.map(o=>o.nama);
  g.fillStyle='#e8eef3';g.fillRect(0,0,W,H);g.strokeStyle='#2a3a4a';g.lineWidth=Math.max(2,14*k);g.strokeRect(7*k,7*k,W-14*k,H-14*k);
  if(kecil){
    for(let i=0;i<NSTASIUN;i++){const x=W*(i/3)+20*k,w=W/3-40*k,p=s&&s[i]?s[i]:0;
      g.fillStyle=p?WARNA_OPSI[p-1]:'#ffffff';g.strokeStyle='#2a3a4a';g.lineWidth=Math.max(2,8*k);g.beginPath();g.roundRect(x,60*k,w,H-120*k,40*k);g.fill();g.stroke();
      g.fillStyle=p?'#fff':'#7d8792';g.font='800 '+Math.round(300*k)+'px "Bricolage Grotesque",sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(p?HURUF[p-1]:'?',x+w/2,H/2-30*k);
      g.font='800 '+Math.round(110*k)+'px "Bricolage Grotesque",sans-serif';g.fillStyle=p?'#fff':'#2a3a4a';g.fillText(['Lembah','Tebing','Puncak'][i],x+w/2,H-180*k);}
    return;
  }
  g.fillStyle='#2a3a4a';g.font='800 '+Math.round(54*k)+'px "Bricolage Grotesque",sans-serif';g.textAlign='left';g.textBaseline='top';
  g.fillText('Puncak Final · babak '+(r+1)+' · jawab di tiga pos pendakian',60*k,30*k);
  for(let i=0;i<NSTASIUN;i++)kotakSoal(g,40*k+i*640*k,110*k,600*k,H-150*k,(i+1)+'. '+nama[i],S[i],s?s[i]|0:0,k);
}
/* papan soal di pos: satu soal, besar */
function gambarPapanPos(cv,r,i,pilih){
  const S=soal6(r),g=cv.getContext('2d'),W=cv.width,H=cv.height,k=W/640;
  g.fillStyle='#e8eef3';g.fillRect(0,0,W,H);
  kotakSoal(g,14*k,14*k,W-28*k,H-28*k,M6.KAMP[i].nama+' · babak '+(r+1),S[i],pilih,k);
}

export function buatArena6(){
  const dunia=buatDunia(M6,TEMA_GUNUNG),grup=dunia.grup;
  const cw=document.createElement('canvas');cw.width=2000;cw.height=950;
  const txp=new THREE.CanvasTexture(cw);txp.colorSpace=THREE.SRGBColorSpace;txp.anisotropy=4;
  {
    const dinding=new THREE.Mesh(new THREE.BoxGeometry(96,12,4),mat(0x7a7f86));dinding.position.set(0,5,-5);grup.add(dinding);
    const salju=new THREE.Mesh(new THREE.BoxGeometry(98,1,6),mat(0xf4f8fb));salju.position.set(0,11.4,-5);grup.add(salju);
    const bingkai=new THREE.Mesh(new THREE.BoxGeometry(21.4,10.6,.6),mat(0x3d4652));bingkai.position.set(0,4.9,-2.7);grup.add(bingkai);
    const papan=new THREE.Mesh(new THREE.PlaneGeometry(20,9.5),new THREE.MeshBasicMaterial({map:txp}));papan.position.set(0,4.85,-2.35);grup.add(papan);
  }
  /* tiap pos: papan soal menghadap jalan datang; bendera kamp dan huruf di lantai menunjukkan pilihan tim */
  const pos=dunia.gudangs.map(({g,bend})=>{
    const c=document.createElement('canvas');c.width=640;c.height=560;const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;tx.anisotropy=4;
    const papan=new THREE.Mesh(new THREE.PlaneGeometry(5.6,4.9),new THREE.MeshBasicMaterial({map:tx}));papan.position.set(0,3.6,3.6);papan.rotation.y=Math.PI;g.add(papan);
    const punggung=new THREE.Mesh(new THREE.BoxGeometry(5.9,5.2,.16),mat(0x3d4652));punggung.position.set(0,3.6,3.7);g.add(punggung);
    for(const sx of [-2.9,2.9]){const t=new THREE.Mesh(new THREE.CylinderGeometry(.12,.14,6,8),mat(0x3d4652));t.position.set(sx,3,3.7);g.add(t);}
    bend.material=bend.material.clone();
    return {g,c,tx,bend,huruf:null};
  });
  let rNow=0,sNow=[],kunciPapan='';
  function tata(){
    const kk=rNow+'|'+sNow.join(',');if(kk===kunciPapan)return;kunciPapan=kk;
    gambarFinal(cw,rNow,sNow);txp.needsUpdate=true;
    pos.forEach((o,i)=>{const p=sNow[i]|0;gambarPapanPos(o.c,rNow,i,p);o.tx.needsUpdate=true;
      o.bend.material.color.set(p?WARNA_OPSI[p-1]:'#ffffff');
      if(o.huruf){o.g.remove(o.huruf);o.huruf.geometry.dispose();if(o.huruf.material.map)o.huruf.material.map.dispose();o.huruf.material.dispose();}
      o.huruf=tulisanLantai(p?HURUF[p-1]:'?',2.4,'#ffffff');o.huruf.position.set(0,.07,.6);o.g.add(o.huruf);});
  }
  return {
    grup,dunia,
    setBabak(r){rNow=r;kunciPapan='';tata();},
    setSlot(s){sNow=(s||[]).slice();tata();},
    setBawa(){},
    setMedan:dunia.setMedan,animMedan:dunia.animMedan,setGerbang:dunia.setGerbang,setKoin:dunia.setKoin,setDetail:dunia.setDetail,padAnim:dunia.padAnim
  };
}
