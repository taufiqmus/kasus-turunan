/* Arena Pos 3 "Danau Beku": dunia umum (tema salju) ditambah Mesin Putar Balik dengan layar besar,
   corong masuk dan keluar di plaza, dan tiga stasiun: Tungku (naikkan pangkat), Gudang C, Pemotong (bagi koefisien). */
import * as THREE from './vendor/three.min.js';
import {M3} from './medan.js?v=30';
import {buatDunia,TEMA_SALJU,mat,tulisanLantai} from './dunia3d.js?v=30';
import {soal3,teksF,teksFTim,teksTurunanTim,NB3} from './pos3.js?v=30';

export const CORONG={masuk:{x:-5.5,z:4.2,r:1.6},keluar:{x:5.5,z:4.2,r:1.6}};
export const diCorong=(c,x,z)=>Math.hypot(x-CORONG[c].x,z-CORONG[c].z)<CORONG[c].r;

/* layar mesin: f, F rakitan tim, F' hasil diturunkan balik; babak 3 menampilkan keluarga kurva F + C */
export function gambarMesin(cv,r,s,opsi={}){
  const S=soal3(r),g=cv.getContext('2d'),W=cv.width,H=cv.height,k=W/2000,kecil=!!opsi.kecil;
  g.fillStyle='#10212e';g.fillRect(0,0,W,H);
  g.strokeStyle='#5fb3e0';g.lineWidth=Math.max(2,12*k);g.strokeRect(6*k,6*k,W-12*k,H-12*k);
  const ada=s&&s.slice(0,S.suku.length).some(v=>v>0),fTeks=teksF(S.suku),FT=s?teksFTim(r,s):'?',dT=ada?teksTurunanTim(r,s):'?',cocok=s&&dT===fTeks&&s.slice(0,S.suku.length).every(v=>v>0);
  const graf=S.x0!=null,lebar=graf?W*.56:W;
  const baris=kecil?(y,label,teks,warna,uk)=>{
    const t=label.trim().split(/\s+/).pop()+' = '+teks;let fs=uk;g.font='800 '+Math.round(fs*k)+'px "Bricolage Grotesque",sans-serif';
    while(g.measureText(t).width>lebar-80*k&&fs>30){fs-=6;g.font='800 '+Math.round(fs*k)+'px "Bricolage Grotesque",sans-serif';}
    g.fillStyle=warna;g.textAlign='left';g.textBaseline='middle';g.fillText(t,40*k,y);}:(y,label,teks,warna,uk)=>{g.font='700 '+Math.round(uk*k)+'px "Chakra Petch",sans-serif';g.fillStyle='#8fb9d3';g.textAlign='left';g.textBaseline='middle';g.fillText(label,60*k,y);
    g.font='800 '+Math.round(uk*1.15*k)+'px "Bricolage Grotesque",sans-serif';g.fillStyle=warna;let t=teks,fs=uk*1.15;
    while(g.measureText(t).width>lebar-470*k&&fs>20){fs-=4;g.font='800 '+Math.round(fs*k)+'px "Bricolage Grotesque",sans-serif';}g.fillText(t,440*k,y);};
  if(!kecil){g.font='800 '+Math.round(54*k)+'px "Bricolage Grotesque",sans-serif';g.fillStyle='#ffc83d';g.textAlign='left';g.textBaseline='top';g.fillText('Mesin Putar Balik · babak '+(r+1),60*k,40*k);}
  const y0=kecil?120*k*2.2:240*k,dy=kecil?230*k*1.6:170*k,uk=kecil?110:70;
  baris(y0,'masuk  f(x)',fTeks,'#ffffff',uk);
  baris(y0+dy,'rakit  F(x)',FT,'#ffd96b',uk);
  baris(y0+2*dy,'cek    F′(x)',dT,cocok?'#7bd38a':'#ff8a7a',uk);
  if(!kecil){
    g.font='700 '+Math.round(40*k)+'px "Chakra Petch",sans-serif';g.fillStyle='#8fb9d3';g.textAlign='left';g.textBaseline='bottom';
    const h='Turunan: kali pangkat, lalu pangkat turun satu.  Putar balik: pangkat naik satu, lalu bagi pangkat baru.';let fs=40;
    while(g.measureText(h).width>(graf?W*.56:W-120*k)&&fs>18){fs-=2;g.font='700 '+Math.round(fs*k)+'px "Chakra Petch",sans-serif';}
    if(graf){const i=h.indexOf('  ');g.fillText(h.slice(0,i),60*k,H-95*k);g.fillText(h.slice(i+2),60*k,H-45*k);}else g.fillText(h,60*k,H-50*k);
  }
  if(graf){
    /* keluarga F + C dengan C bilangan bulat; titik nilai awal; kurva C pilihan tim ditebalkan */
    const L=W*.6,R=W-60*k,T=(kecil?40:120)*k,B=H-(kecil?60:140)*k,F=x=>S.suku.reduce((a,[c,n])=>a+c/(n+1)*x**(n+1),0);
    const xs=[S.x0-2,S.x0+2],X=x=>L+(x-xs[0])/(xs[1]-xs[0])*(R-L);
    let lo=1e9,hi=-1e9;for(let i=0;i<=40;i++){const x=xs[0]+(xs[1]-xs[0])*i/40,v=F(x)+S.C;lo=Math.min(lo,v);hi=Math.max(hi,v);}
    lo-=6;hi+=6;const Yp=y=>B-(y-lo)/(hi-lo)*(B-T);
    g.save();g.beginPath();g.rect(L,T,R-L,B-T);g.clip();g.fillStyle='#16303f';g.fillRect(L,T,R-L,B-T);
    for(let c=-8;c<=14;c+=2){g.strokeStyle='rgba(143,185,211,.35)';g.lineWidth=Math.max(1,3*k);g.beginPath();
      for(let i=0;i<=40;i++){const x=xs[0]+(xs[1]-xs[0])*i/40,yy=F(x)+c;i?g.lineTo(X(x),Yp(yy)):g.moveTo(X(x),Yp(yy));}g.stroke();}
    const ci=s?s[S.suku.length]:0;
    if(ci){const cv2=Number(S.opsiC[ci-1].replace('+ ','').replace('−','-'));g.strokeStyle=cv2===S.C?'#7bd38a':'#ffd96b';g.lineWidth=Math.max(2,9*k);g.beginPath();
      for(let i=0;i<=40;i++){const x=xs[0]+(xs[1]-xs[0])*i/40;i?g.lineTo(X(x),Yp(F(x)+cv2)):g.moveTo(X(x),Yp(F(x)+cv2));}g.stroke();}
    g.fillStyle='#ff6f47';g.beginPath();g.arc(X(S.x0),Yp(S.y0),Math.max(4,18*k),0,7);g.fill();g.restore();
    g.strokeStyle='#5fb3e0';g.lineWidth=Math.max(1,4*k);g.strokeRect(L,T,R-L,B-T);
    g.font='800 '+Math.round((kecil?70:46)*k)+'px "Bricolage Grotesque",sans-serif';g.fillStyle='#ff8a5c';g.textAlign='center';g.textBaseline='top';
    g.fillText('syarat: F('+S.x0+') = '+S.y0,(L+R)/2,B+(kecil?10:20)*k);
  }
}

function teksTex(teks,w,h,opsi={}){
  const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');
  if(opsi.bg){g.fillStyle=opsi.bg;g.fillRect(0,0,w,h);}
  g.textAlign='center';g.textBaseline='middle';let fs=opsi.size||Math.round(h*.6);g.font='800 '+fs+'px "Bricolage Grotesque",sans-serif';
  while(g.measureText(teks).width>w*.9&&fs>12){fs-=4;g.font='800 '+fs+'px "Bricolage Grotesque",sans-serif';}
  g.fillStyle=opsi.fg||'#1c2230';g.fillText(teks,w/2,h/2+fs*.04);
  const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;return tx;
}
export function buatArena3(){
  const dunia=buatDunia(M3,TEMA_SALJU),grup=dunia.grup;
  /* ---------- mesin dan layar ---------- */
  const cw=document.createElement('canvas');cw.width=2000;cw.height=950;
  const txl=new THREE.CanvasTexture(cw);txl.colorSpace=THREE.SRGBColorSpace;txl.anisotropy=4;
  const roda=[];
  {
    const badan=new THREE.Mesh(new THREE.BoxGeometry(96,12,4),mat(0x6d7f8e));badan.position.set(0,5,-5);grup.add(badan);
    const atap=new THREE.Mesh(new THREE.BoxGeometry(98,1,6),mat(0x4a5966));atap.position.set(0,11.4,-5);grup.add(atap);
    for(const sx of [-1,1]){
      const cerobong=new THREE.Mesh(new THREE.CylinderGeometry(1.2,1.5,9,12),mat(0x8a9aa8));cerobong.position.set(sx*15,15,-5);grup.add(cerobong);
      for(let i=0;i<2;i++){const r=new THREE.Mesh(new THREE.TorusGeometry(2.2,.45,6,10),mat(i?0xffc83d:0xe5392b));r.position.set(sx*(13+i*4.6),8.5-i*3.6,-2.6);grup.add(r);roda.push({r,arah:(i?1:-1)*sx});}
    }
    const bingkai=new THREE.Mesh(new THREE.BoxGeometry(21.4,10.6,.6),mat(0x1c2230));bingkai.position.set(0,4.9,-2.7);grup.add(bingkai);
    const layar=new THREE.Mesh(new THREE.PlaneGeometry(20,9.5),new THREE.MeshBasicMaterial({map:txl,toneMapped:false}));layar.position.set(0,4.85,-2.35);grup.add(layar);
    /* corong masuk dan keluar */
    for(const [c,warna,teks] of [['masuk',0x6fb7e9,'MASUK'],['keluar',0xff9a62,'KELUAR']]){
      const o=CORONG[c],g=new THREE.Group();g.position.set(o.x,0,o.z);grup.add(g);
      const al=new THREE.Mesh(new THREE.CircleGeometry(o.r,28),new THREE.MeshBasicMaterial({color:warna,transparent:true,opacity:.8}));al.rotation.x=-Math.PI/2;al.position.y=.04;g.add(al);
      g.add(tulisanLantai(teks,2.8,'#ffffff'));
      const pipa=new THREE.Mesh(new THREE.CylinderGeometry(.6,.9,3.4,12),mat(warna));pipa.position.set(0,1.7,-2.7);g.add(pipa);
    }
  }
  /* ---------- stasiun ---------- */
  const g0=dunia.gudangs[0].g,g1=dunia.gudangs[1].g,g2=dunia.gudangs[2].g;
  const api=new THREE.Mesh(new THREE.ConeGeometry(.9,1.8,8),new THREE.MeshBasicMaterial({color:0xff7a2a}));
  {
    const tungku=new THREE.Mesh(new THREE.BoxGeometry(2.6,2.2,2),mat(0x5a4a44));tungku.position.set(0,1.1,-.2);g0.add(tungku);
    const mulut=new THREE.Mesh(new THREE.PlaneGeometry(1.4,1),new THREE.MeshBasicMaterial({color:0xffb347}));mulut.position.set(0,.9,.81);g0.add(mulut);
    api.position.set(0,2.9,-.2);g0.add(api);
    const l=tulisanLantai('PANGKAT + 1',4,'#ffffff',{size:64});l.position.set(0,.07,2.3);g0.add(l);
  }
  const gergaji=new THREE.Mesh(new THREE.CylinderGeometry(1.1,1.1,.08,18),mat(0xc7d2da));
  {
    const meja=new THREE.Mesh(new THREE.BoxGeometry(2.8,1,1.6),mat(0x7a5a3a));meja.position.set(0,.5,-.2);g2.add(meja);
    gergaji.rotation.z=Math.PI/2;gergaji.position.set(0,1.5,-.2);g2.add(gergaji);
    const l=tulisanLantai('BAGI',3.2,'#ffffff');l.position.set(0,.07,2.3);g2.add(l);
  }
  {
    const tc=teksTex('C',128,128,{bg:'#e6f2f8',fg:'#2f7fc1'});
    for(let i=0;i<3;i++){const b=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshLambertMaterial({map:tc}));b.position.set((i-1)*1.15,.5,-.2);g1.add(b);}
    const b=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshLambertMaterial({map:tc}));b.position.set(0,1.5,-.2);g1.add(b);
    const l=tulisanLantai('+ C',3,'#ffffff');l.position.set(0,.07,2.3);g1.add(l);
  }
  /* ---------- balok es yang dibawa ---------- */
  const bawa=new THREE.InstancedMesh(new THREE.BoxGeometry(.8,.55,.8),new THREE.MeshLambertMaterial({color:0xd8eef9,flatShading:true}),64);bawa.frustumCulled=false;bawa.count=0;grup.add(bawa);
  const M=new THREE.Matrix4(),Q=new THREE.Quaternion(),P=new THREE.Vector3(),S1=new THREE.Vector3(1,1,1);
  let rNow=0,kunciLayar='';
  const animAsli=dunia.animMedan;
  return {
    grup,dunia,
    setBabak(r){rNow=r;kunciLayar='';gambarMesin(cw,r,null);txl.needsUpdate=true;},
    setSlot(s){const k=rNow+'|'+(s?s.join(','):'');if(k===kunciLayar)return;kunciLayar=k;gambarMesin(cw,rNow,s&&s.length?s:null);txl.needsUpdate=true;},
    setBawa(items){let k=0;for(const it of items)for(let j=0;j<it.n&&k<64;j++){P.set(it.x,it.y+j*.6,it.z);M.compose(P,Q,S1);bawa.setMatrixAt(k++,M);}bawa.count=k;bawa.instanceMatrix.needsUpdate=true;},
    setMedan:dunia.setMedan,
    animMedan(t,dt){animAsli(t,dt);for(const o of roda)o.r.rotation.z=t*.8*o.arah;api.scale.y=1+Math.sin(t*9)*.15;gergaji.rotation.x=t*8;},
    setGerbang:dunia.setGerbang,setKoin:dunia.setKoin,setDetail:dunia.setDetail,padAnim:dunia.padAnim
  };
}
