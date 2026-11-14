/* Arena Pos 2 "Ngarai Kuil": dunia umum dari dunia3d.js (tema gurun) ditambah fasad kuil dengan prasasti sandi,
   altar notasi integral di plaza (slot batu), rak batu sandi di tiap kamp, dan batu yang dibawa pemain. */
import * as THREE from './vendor/three.min.js';
import {M2} from './medan.js?v=25';
import {buatDunia,TEMA_GURUN,mat,tulisanLantai} from './dunia3d.js?v=25';
import {soal,tata,batuKamp,teksBatu} from './pos2.js?v=25';

/* gambar prasasti: grafik daerah berarsir atau cerita. Dipakai juga untuk kartu kecil di HUD dan ulasan. */
export function gambarSandi(cv,r,opsi={}){
  const S=soal(r),g=cv.getContext('2d'),W=cv.width,H=cv.height,k=W/2000;
  g.fillStyle=opsi.bg||'#f4e3c1';g.fillRect(0,0,W,H);
  g.strokeStyle='#7a5532';g.lineWidth=Math.max(2,14*k);g.strokeRect(6*k,6*k,W-12*k,H-12*k);
  const judul=opsi.judul!==false;
  if(judul){g.fillStyle='#7a3b1e';g.font='800 '+Math.round(58*k)+'px "Bricolage Grotesque",sans-serif';g.textAlign='left';g.textBaseline='top';
    g.fillText('Sandi pintu babak '+(r+1),60*k,40*k);}
  if(S.jenis==='cerita'){
    g.fillStyle='#2a1d12';g.font='700 '+Math.round(64*k)+'px "Chakra Petch",sans-serif';g.textAlign='left';g.textBaseline='top';
    const kata=S.tx.split(' '),baris=[];let b='';
    for(const w of kata){const c=b?b+' '+w:w;if(g.measureText(c).width>W-160*k&&b){baris.push(b);b=w;}else b=c;}
    if(b)baris.push(b);
    baris.forEach((l,i)=>g.fillText(l,80*k,(judul?170:70)*k+i*92*k));
    g.fillStyle='#7a5532';g.font='700 '+Math.round(44*k)+'px "Chakra Petch",sans-serif';
    g.fillText('Rakit: batas bawah, batas atas, fungsi, diferensial.',80*k,H-110*k);
    return;
  }
  /* sumbu dan grafik */
  const K=S.keping,xm=Math.max(...K.map(p=>p.b))+1;let ym=0;
  for(const p of K)for(let i=0;i<=40;i++){const x=p.a+(p.b-p.a)*i/40;ym=Math.max(ym,p.f(x));}
  ym=Math.ceil(ym*1.25)||1;
  const L=170*k,R=W-90*k,T=(judul?150:60)*k,B=H-110*k,X=x=>L+x/xm*(R-L),Yp=y=>B-y/ym*(B-T);
  g.strokeStyle='#d8c39a';g.lineWidth=Math.max(1,3*k);
  const sy=ym<=5?1:(ym<=10?2:ym<=20?4:5);
  g.fillStyle='#2a1d12';g.font='700 '+Math.round(40*k)+'px "Chakra Petch",sans-serif';
  for(let y=0;y<=ym;y+=sy){g.beginPath();g.moveTo(L,Yp(y));g.lineTo(R,Yp(y));g.stroke();g.textAlign='right';g.textBaseline='middle';g.fillText(String(y),L-18*k,Yp(y));}
  for(let x=0;x<=xm;x++){g.beginPath();g.moveTo(X(x),T);g.lineTo(X(x),B);g.stroke();g.textAlign='center';g.textBaseline='top';g.fillText(String(x),X(x),B+16*k);}
  const warna=['rgba(214,96,58,.45)','rgba(47,158,143,.45)'];
  K.forEach((p,i)=>{
    g.fillStyle=warna[i%2];g.beginPath();g.moveTo(X(p.a),Yp(0));
    for(let j=0;j<=60;j++){const x=p.a+(p.b-p.a)*j/60;g.lineTo(X(x),Yp(p.f(x)));}
    g.lineTo(X(p.b),Yp(0));g.closePath();g.fill();
  });
  K.forEach((p,i)=>{
    /* kurva digambar sedikit melewati daerah supaya bentuknya terbaca, lalu diberi label rumus */
    const x0=K.length>1?p.a:Math.max(0,p.a-.6),x1=K.length>1?p.b:Math.min(xm,p.b+.6);
    g.strokeStyle='#b8321c';g.lineWidth=Math.max(2,9*k);g.beginPath();
    for(let j=0;j<=60;j++){const x=x0+(x1-x0)*j/60,y=Math.min(ym*1.05,p.f(x));j?g.lineTo(X(x),Yp(y)):g.moveTo(X(x),Yp(y));}
    g.stroke();
    const xl=(p.a+p.b)/2,yl=Math.min(ym*.92,p.f(xl)+ym*.12);
    g.font='800 '+Math.round(56*k)+'px "Bricolage Grotesque",sans-serif';g.textAlign='center';g.textBaseline='bottom';
    g.lineWidth=Math.max(2,10*k);g.strokeStyle='#f4e3c1';g.strokeText(p.lab,X(xl),Yp(yl));g.fillStyle='#b8321c';g.fillText(p.lab,X(xl),Yp(yl));
  });
  g.strokeStyle='#2a1d12';g.lineWidth=Math.max(2,6*k);g.beginPath();g.moveTo(L,T-10*k);g.lineTo(L,B);g.lineTo(R+30*k,B);g.stroke();
  g.fillStyle='#2a1d12';g.font='italic 700 '+Math.round(44*k)+'px "Chakra Petch",sans-serif';g.textAlign='left';g.textBaseline='bottom';
  g.fillText('x',R+36*k,B+8*k);g.textBaseline='top';g.fillText('y',L+14*k,T-14*k);
}

function teksTex(teks,w,h,opsi={}){
  const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');
  if(opsi.bg){g.fillStyle=opsi.bg;g.fillRect(0,0,w,h);}
  g.textAlign='center';g.textBaseline='middle';
  let fs=opsi.size||Math.round(h*.6);g.font='800 '+fs+'px "Bricolage Grotesque",sans-serif';
  while(g.measureText(teks).width>w*.9&&fs>12){fs-=4;g.font='800 '+fs+'px "Bricolage Grotesque",sans-serif';}
  if(opsi.garis){g.lineWidth=Math.max(6,fs*.12);g.lineJoin='round';g.strokeStyle=opsi.garis;g.strokeText(teks,w/2,h/2+fs*.04);}
  g.fillStyle=opsi.fg||'#2a1d12';g.fillText(teks,w/2,h/2+fs*.04);
  const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;tx.anisotropy=4;return tx;
}

export function buatArena2(){
  const dunia=buatDunia(M2,TEMA_GURUN),grup=dunia.grup,Y=dunia.Y;
  /* ---------- fasad kuil dan prasasti ---------- */
  const cw=document.createElement('canvas');cw.width=2000;cw.height=950;
  const txp=new THREE.CanvasTexture(cw);txp.colorSpace=THREE.SRGBColorSpace;txp.anisotropy=4;
  {
    const batuK=mat(0xd2b07c),batuG=mat(0xb48c5a),gelap=mat(0x5a3a22);
    const badan=new THREE.Mesh(new THREE.BoxGeometry(96,13,4),batuK);badan.position.set(0,5.5,-5);grup.add(badan);
    const atas=new THREE.Mesh(new THREE.BoxGeometry(98,1.2,6),batuG);atas.position.set(0,12.4,-5);grup.add(atas);
    for(let i=-6;i<=6;i++){if(Math.abs(i)<2)continue;const p=new THREE.Mesh(new THREE.CylinderGeometry(.9,1.1,12,10),batuG);p.position.set(i*7.2,6,-2.4);grup.add(p);}
    const bingkai=new THREE.Mesh(new THREE.BoxGeometry(21.4,10.6,.6),gelap);bingkai.position.set(0,4.9,-2.7);grup.add(bingkai);
    const pr=new THREE.Mesh(new THREE.PlaneGeometry(20,9.5),new THREE.MeshBasicMaterial({map:txp}));pr.position.set(0,4.85,-2.35);grup.add(pr);
    /* tangga kuil */
    for(let i=0;i<3;i++){const t=new THREE.Mesh(new THREE.BoxGeometry(30-i*2,.25,1.2),batuG);t.position.set(0,.12+i*.0,-.2-i*.9);t.position.y=.12+i*.25;grup.add(t);}
  }
  /* ---------- altar: slot batu, simbol ∫ dan + ---------- */
  const altar=new THREE.Group();grup.add(altar);
  const slotObj=[];let tataNow=null,rNow=-1;
  const matSlot=new THREE.MeshBasicMaterial({color:0xf3e2bd}),matBingkai=mat(0x5a3a22);
  function glyph(teks,w,h){
    const c=document.createElement('canvas');c.width=128;c.height=256;const g=c.getContext('2d');
    g.textAlign='center';g.textBaseline='middle';g.font='700 230px "Times New Roman",serif';g.lineWidth=10;g.strokeStyle='#f6e8c8';g.strokeText(teks,64,132);g.fillStyle='#5a2e14';g.fillText(teks,64,132);
    const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;
    const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tx,transparent:true,depthWrite:false,toneMapped:false}));
    m.rotation.x=-Math.PI/2;m.position.y=.08;m.renderOrder=2;return m;
  }
  function kosongkanAltar(){
    for(const o of [...altar.children]){altar.remove(o);o.traverse(c=>{if(c.geometry)c.geometry.dispose();if(c.material){if(c.material.map)c.material.map.dispose();if(c.material!==matSlot&&c.material!==matBingkai)c.material.dispose();}});}
    slotObj.length=0;
  }
  function bangunAltar(r){
    kosongkanAltar();tataNow=tata(r);rNow=r;
    for(const s of tataNow.integral){const m=glyph('∫',2.4,4.8);m.position.set(s.x,.08,s.z);altar.add(m);}
    for(const s of tataNow.plus){const m=glyph('+',1.6,3.2);m.position.set(s.x,.08,s.z);altar.add(m);}
    tataNow.slot.forEach((s,i)=>{
      const g=new THREE.Group();g.position.set(s.x,0,s.z);altar.add(g);
      const bingkai=new THREE.Mesh(new THREE.BoxGeometry(s.w+.3,.1,s.d+.3),matBingkai);bingkai.position.y=.05;g.add(bingkai);
      const pl=new THREE.Mesh(new THREE.PlaneGeometry(s.w,s.d),matSlot);pl.rotation.x=-Math.PI/2;pl.position.y=.11;g.add(pl);
      const lab=tulisanLantai({a:'a',b:'b',f:'f(x)',d:'d□'}[s.k],Math.min(s.w,2.4),'#f3e2bd',{fg:'#6b4a2a'});lab.position.y=.13;g.add(lab);
      const batu=new THREE.Mesh(new THREE.BoxGeometry(s.w*.92,.28,s.d*.88),mat(0xd9bc8c));batu.position.y=.15;batu.visible=false;g.add(batu);
      const atas=new THREE.Mesh(new THREE.PlaneGeometry(s.w*.9,s.d*.86),new THREE.MeshBasicMaterial({transparent:true,toneMapped:false}));
      atas.rotation.x=-Math.PI/2;atas.position.y=.3;atas.visible=false;g.add(atas);
      slotObj.push({g,lab,batu,atas,kode:-1,s});
    });
  }
  function setSlot(s,sorot){
    slotObj.forEach((o,i)=>{
      const kode=s[i]|0;
      if(kode!==o.kode){
        o.kode=kode;if(o.atas.material.map){o.atas.material.map.dispose();o.atas.material.map=null;}
        if(kode>0){o.atas.material.map=teksTex(teksBatu(rNow,kode),Math.round(256*o.s.w/o.s.d),256,{bg:'#e8cf9e'});o.atas.material.needsUpdate=true;}
        o.batu.visible=o.atas.visible=kode>0;o.lab.visible=kode===0;
      }
      o.batu.material.color.setHex(i===sorot?0xffd96b:0xd9bc8c);
    });
  }
  /* ---------- rak batu sandi di kamp: lempeng tegak berisi pilihan ---------- */
  const rak=dunia.gudangs.map(o=>{const g=new THREE.Group();g.position.set(0,0,-.2);o.g.add(g);return g;});
  function bangunRak(r){
    rak.forEach((g,kamp)=>{
      for(const o of [...g.children]){g.remove(o);o.traverse(c=>{if(c.geometry)c.geometry.dispose();if(c.material){if(c.material.map)c.material.map.dispose();c.material.dispose();}});}
      const L=batuKamp(r,kamp),n=L.length,lw=1.25,gap=.18,tot=n*lw+(n-1)*gap;
      L.forEach((b,i)=>{
        const x=-tot/2+lw/2+i*(lw+gap);
        const lp=new THREE.Mesh(new THREE.BoxGeometry(lw,1.5,.3),mat(b.k==='d'?0xc7a578:0xd9bc8c));lp.position.set(x,.9,0);g.add(lp);
        const muka=new THREE.Mesh(new THREE.PlaneGeometry(lw*.92,1.36),new THREE.MeshBasicMaterial({map:teksTex(b.t,224,256,{bg:'#f2deb4'}),toneMapped:false}));
        muka.position.set(x,.9,.16);g.add(muka);
        const kaki=new THREE.Mesh(new THREE.BoxGeometry(lw*.6,.2,.6),mat(0x8a6a48));kaki.position.set(x,.1,0);g.add(kaki);
      });
      const jenis=[...new Set(L.map(b=>b.k))].map(k=>({a:'a',b:'b',f:'f(x)',d:'dx'})[k]).join('  &  ');
      const lab=tulisanLantai(jenis,4.2,'#f6e8c8',{size:72,fg:'#5a2e14'});lab.position.set(0,.07,2.3);g.add(lab);
    });
  }
  /* ---------- batu yang dibawa pemain ---------- */
  const gbB=new THREE.BoxGeometry(.95,.3,.75);
  const bawa=new THREE.InstancedMesh(gbB,new THREE.MeshLambertMaterial({color:0xd9bc8c,flatShading:true}),64);bawa.frustumCulled=false;bawa.count=0;grup.add(bawa);
  const M=new THREE.Matrix4(),Q=new THREE.Quaternion(),P=new THREE.Vector3(),S=new THREE.Vector3(1,1,1);
  function setBawa(items){
    let k=0;
    for(const it of items)for(let j=0;j<it.n&&k<64;j++){P.set(it.x,it.y+j*.34,it.z);M.compose(P,Q,S);bawa.setMatrixAt(k++,M);}
    bawa.count=k;bawa.instanceMatrix.needsUpdate=true;
  }
  return {
    grup,dunia,
    setBabak(r){gambarSandi(cw,r);txp.needsUpdate=true;bangunAltar(r);bangunRak(r);},
    setSlot,setBawa,
    setMedan:dunia.setMedan,animMedan:dunia.animMedan,setGerbang:dunia.setGerbang,setKoin:dunia.setKoin,setDetail:dunia.setDetail,padAnim:dunia.padAnim
  };
}
