/* Arena Pos 1 "Lembah Waduk": bendungan berkurva di utara, lembah dengan tiga wilayah (hutan, bukit, sungai),
   kamp balok, jalur bercabang, dan rintangan. Logika murni ada di medan.js; berkas ini hanya tampilan 3D. */
import * as THREE from './vendor/three.min.js';
import {BABAK,UBAG,MAXBAG,XMAX} from './pos1.js?v=23';
import {DUNIA,PLAZA,KAMP,PAD,TUAS,JALUR,GERBANG,JURANG,SUNGAI,JEMB_KAYU,KOIN_A,jarakJalan,tinggi,medanBabak,xKayu,xPalu,celahPintu,tinggiDuri,statusUbin,keadaanBola,kecBan,
  PAL_L,PAL_Y,PAL_A,PINTU,DURI_X,UBIN_W,UBIN_D,BOLA_R,RINT_MAKS,BAN,TRAMP} from './medan.js?v=23';

export const SY=.9,UB=UBAG*SY,WX=9;
export const ZONA={z0:.2,z1:4.6};
export const kolX=(n,i)=>-WX+(i+.5)*2*WX/n;
export function kolomDari(n,x,z){
  if(z<ZONA.z0||z>ZONA.z1||x<-WX||x>WX)return -1;
  return Math.min(n-1,Math.floor((x+WX)/(2*WX/n)));
}
const mat=c=>new THREE.MeshLambertMaterial({color:c,flatShading:true});
/* tumbuhan dan batu yang menutupi pemain dari kamera dibuat tembus pandang berbintik, supaya karakter selalu terlihat.
   uTembus = posisi pemain di ruang kamera (z positif = di depan kamera). */
export const uTembus={value:new THREE.Vector3(0,0,-1)};
function tembus(m){
  m.onBeforeCompile=sh=>{
    sh.uniforms.uTembus=uTembus;
    sh.fragmentShader='uniform vec3 uTembus;\n'+sh.fragmentShader.replace('#include <clipping_planes_fragment>',`#include <clipping_planes_fragment>
  if(uTembus.z>0.&&vViewPosition.z<uTembus.z-.8){
    float dT=length(vViewPosition.xy/vViewPosition.z-uTembus.xy/uTembus.z);
    if(dT<.17||(dT<.3&&mod(floor(gl_FragCoord.x)+floor(gl_FragCoord.y),2.)<.5))discard;
  }`);
  };
  m.customProgramCacheKey=()=>'tembus';return m;
}
const ss=(a,b,v)=>{const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t);};
const dalam=(R,x,z)=>Math.min(x-R.x0,R.x1-x,z-R.z0,R.z1-z);
const derau=(x,z)=>Math.sin(x*.37+z*.21)*Math.sin(z*.33-x*.17)+.5*Math.sin(x*.9+1.3)*Math.sin(z*.8+.7);
/* tinggi permukaan tanah yang digambar: jalur mengikuti tinggi() persis, di luar jalur tanah bergelombang,
   tepi lembah menjulang jadi tebing, jurang dan dasar sungai dikeruk */
export function tinggiTanah(x,z){
  if(z<-.6)return 0;
  const d=jarakJalan(x,z),w=Math.max(0,Math.min(1,d/3));
  let h=tinggi(x,z)+w*(.9*derau(x,z)+.5)+w*11*Math.max(ss(37,46,Math.abs(x)),ss(60,69,z));
  const dj=dalam(JURANG,x,z);if(dj>0)h-=6*ss(0,1.4,dj);
  const ds=dalam(SUNGAI,x,z);if(ds>0){const k=ss(0,.9,ds);h=h*(1-k)-1.3*k;}
  return h;
}
function warnaTanah(x,z,C){
  const d=jarakJalan(x,z),n=derau(x*1.7,z*1.7);
  if(z<-.6)C.set(0xcfc8b8);
  else if(dalam(SUNGAI,x,z)>0)C.set(0x7d6f4e);
  else if(dalam(JURANG,x,z)>0)C.set(0x57514a);
  else if(dalam(PLAZA,x,z)>-.2)C.set(0xf2e3c2);
  else if(d<-.25)C.set(Math.abs(x)<19&&z>12?0xcdb38c:0xdcc096);
  else if(Math.max(ss(37,46,Math.abs(x)),ss(60,69,z))>.3)C.set(0x8e8b84);
  else if(dalam(SUNGAI,x,z)>-2.4)C.set(0xe6d7a3);
  else if(x<-13)C.set(0x4d8c49);
  else if(x>13)C.set(0x86c26a);
  else C.set(tinggi(x,z)>1.2&&n>.25?0x9a9a8c:0x93b56b);
  C.multiplyScalar(.94+.06*n);
}
export function buatArena(){
  const grup=new THREE.Group();grup.visible=false;
  const Y=(x,z)=>tinggi(x,z);
  /* ---------- tanah lembah ---------- */
  {
    const st=.8,nx=Math.ceil((DUNIA.x1-DUNIA.x0)/st),nz=Math.ceil((DUNIA.z1-DUNIA.z0)/st);
    const pos=new Float32Array((nx+1)*(nz+1)*3),col=new Float32Array((nx+1)*(nz+1)*3),idx=[],C=new THREE.Color();
    for(let j=0,k=0;j<=nz;j++)for(let i=0;i<=nx;i++,k+=3){
      const x=DUNIA.x0+i*st,z=DUNIA.z0+j*st;
      pos[k]=x;pos[k+1]=tinggiTanah(x,z);pos[k+2]=z;warnaTanah(x,z,C);col[k]=C.r;col[k+1]=C.g;col[k+2]=C.b;
    }
    for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const a=j*(nx+1)+i,b=a+1,c=a+nx+1,d=c+1;idx.push(a,c,b,b,c,d);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));
    g.setIndex(idx);g.computeVertexNormals();
    const tanah=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true,flatShading:true}));tanah.userData.tanah=true;grup.add(tanah);
  }
  /* ---------- bendungan ---------- */
  {
    const beton=mat(0xcfc8b8),gelapB=mat(0x9b958a);
    const badan=new THREE.Mesh(new THREE.BoxGeometry(96,14,4),beton);badan.position.set(0,6,-5);grup.add(badan);
    const atas=new THREE.Mesh(new THREE.BoxGeometry(96,.6,5),gelapB);atas.position.set(0,13.2,-5);grup.add(atas);
    for(let i=-5;i<=5;i++){if(Math.abs(i)<2)continue;const p=new THREE.Mesh(new THREE.BoxGeometry(2.2,13,2.4),gelapB);p.position.set(i*8,6.5,-2.6);grup.add(p);}
    const bingkai=new THREE.Mesh(new THREE.BoxGeometry(21,10.4,.5),mat(0x1c2230));bingkai.position.set(0,4.9,-2.6);grup.add(bingkai);
  }
  /* dinding kurva */
  const cw=document.createElement('canvas');cw.width=2000;cw.height=950;
  const tx=new THREE.CanvasTexture(cw);tx.colorSpace=THREE.SRGBColorSpace;tx.anisotropy=4;
  const dinding=new THREE.Mesh(new THREE.PlaneGeometry(20,9.5),new THREE.MeshBasicMaterial({map:tx}));
  dinding.position.set(0,4.75,-2.2);grup.add(dinding);
  const WW=2000,HH=950,px=wx=>(wx+10)/20*WW,py=wy=>HH-wy/9.5*HH;
  /* o: {n, rumus, aturan, fKurva (digambar hanya bila tampil)} */
  function gambarDinding(o){
    const n=o.n,g=cw.getContext('2d');
    g.fillStyle='#fff6e4';g.fillRect(0,0,WW,HH);
    g.fillStyle='#1c2230';g.font='700 26px "Chakra Petch",sans-serif';g.textAlign='right';g.textBaseline='middle';
    /* satu petak vertikal = satu balok (0,5 satuan data); garis tebal tiap 1 satuan berlabel */
    for(let y=0;y<=9;y+=UBAG){
      const mayor=Number.isInteger(y);
      g.strokeStyle=mayor?'#cdbf9c':'#eadfc6';g.lineWidth=mayor?3:2;
      g.beginPath();g.moveTo(px(-WX),py(y*SY));g.lineTo(px(WX),py(y*SY));g.stroke();
      if(mayor)g.fillText(String(y),px(-WX)-12,py(y*SY));
    }
    g.fillStyle='#1c2230';g.textAlign='center';g.textBaseline='top';
    for(let x=0;x<=XMAX;x++){g.fillText(String(x),px(-WX+x*2*WX/XMAX),py(0)+8);}
    /* garis kolom */
    g.strokeStyle='rgba(28,34,48,.35)';g.lineWidth=2;g.setLineDash([10,8]);
    for(let i=0;i<=n;i++){const x=px(-WX+i*2*WX/n);g.beginPath();g.moveTo(x,py(0));g.lineTo(x,py(9*SY));g.stroke();}
    g.setLineDash([]);
    if(o.fKurva){
      g.fillStyle='rgba(47,127,193,.2)';g.beginPath();g.moveTo(px(-WX),py(0));
      for(let k=0;k<=80;k++){const x=k/80*XMAX;g.lineTo(px(-WX+x*2*WX/XMAX),py(Math.max(0,o.fKurva(x))*SY));}
      g.lineTo(px(WX),py(0));g.closePath();g.fill();
      g.strokeStyle='#e5392b';g.lineWidth=7;g.beginPath();
      for(let k=0;k<=80;k++){const x=k/80*XMAX,X=px(-WX+x*2*WX/XMAX),Y=py(o.fKurva(x)*SY);k?g.lineTo(X,Y):g.moveTo(X,Y);}
      g.stroke();
    }else{
      g.fillStyle='rgba(28,34,48,.08)';g.font='800 60px "Bricolage Grotesque",sans-serif';g.textAlign='center';g.textBaseline='middle';
      g.fillText('kurva disembunyikan',px(0),py(3.2));
    }
    g.fillStyle='#e5392b';g.font='800 62px "Bricolage Grotesque",sans-serif';g.textAlign='left';g.textBaseline='middle';
    g.fillText(o.rumus||'',px(-WX)+40,py(8.4*SY)-10);
    g.fillStyle='#1c2230';g.font='700 34px "Chakra Petch",sans-serif';
    g.fillText(o.aturan||'',px(-WX)+40,py(7.4*SY)-10);
    g.strokeStyle='#1c2230';g.lineWidth=8;g.strokeRect(px(-WX),py(9*SY),px(WX)-px(-WX),py(0)-py(9*SY));
    tx.needsUpdate=true;
  }

  /* pelat zona kolom di lantai */
  const pelat=[];
  function bangunPelat(n,xs){
    for(const p of pelat){grup.remove(p);p.geometry.dispose();if(p.material.map)p.material.map.dispose();p.material.dispose();}
    pelat.length=0;const w=2*WX/n;
    for(let i=0;i<n;i++){
      const c=document.createElement('canvas');c.width=128;c.height=Math.round(128*(ZONA.z1-ZONA.z0)/(w-.06));
      c.height=Math.max(64,Math.min(512,c.height));
      const g=c.getContext('2d');g.fillStyle=i%2?'#e8d3a6':'#f7e8c8';g.fillRect(0,0,c.width,c.height);
      g.fillStyle='#1c2230';g.textAlign='center';g.textBaseline='middle';
      const fs=n>8?22:30;g.font='800 '+fs+'px "Chakra Petch",sans-serif';
      g.fillText('x = '+(Math.round(xs[i]*100)/100),c.width/2,c.height/2);
      const tx2=new THREE.CanvasTexture(c);tx2.colorSpace=THREE.SRGBColorSpace;
      const p=new THREE.Mesh(new THREE.PlaneGeometry(w-.06,ZONA.z1-ZONA.z0),new THREE.MeshBasicMaterial({map:tx2}));
      p.rotation.x=-Math.PI/2;p.rotation.z=0;p.position.set(kolX(n,i),.03,(ZONA.z0+ZONA.z1)/2);p.userData.i=i;grup.add(p);pelat.push(p);
    }
  }
  /* balok di kolom dan balok yang dibawa */
  const gb=new THREE.BoxGeometry(1,1,1);
  const bag=new THREE.InstancedMesh(gb,new THREE.MeshLambertMaterial({flatShading:true}),12*MAXBAG);bag.frustumCulled=false;bag.count=0;grup.add(bag);
  const bawa=new THREE.InstancedMesh(gb,new THREE.MeshLambertMaterial({flatShading:true}),96);bawa.frustumCulled=false;bawa.count=0;grup.add(bawa);
  const M=new THREE.Matrix4(),Q=new THREE.Quaternion(),P=new THREE.Vector3(),S=new THREE.Vector3(),C=new THREE.Color();
  let warna='#e5392b',nKol=3;
  function setBags(cnt){
    const n=cnt.length,w=2*WX/n*.9;let k=0;
    for(let i=0;i<n;i++)for(let j=0;j<cnt[i];j++){
      P.set(kolX(n,i),(j+.5)*UB,-1.7);S.set(w,UB*.97,.5);M.compose(P,Q,S);bag.setMatrixAt(k,M);
      C.set(warna);if(j%2)C.lerp(new THREE.Color(1,1,1),.28);bag.setColorAt(k,C);k++;
    }
    bag.count=k;bag.instanceMatrix.needsUpdate=true;if(bag.instanceColor)bag.instanceColor.needsUpdate=true;
  }
  /* items: {x,y,z,n} */
  function setBawa(items){
    let k=0;
    for(const it of items)for(let j=0;j<it.n&&k<96;j++){
      P.set(it.x,it.y+j*.42,it.z);S.set(.9,.36,.7);M.compose(P,Q,S);bawa.setMatrixAt(k,M);
      C.set(warna);if(j%2)C.lerp(new THREE.Color(1,1,1),.28);bawa.setColorAt(k,C);k++;
    }
    bawa.count=k;bawa.instanceMatrix.needsUpdate=true;if(bawa.instanceColor)bawa.instanceColor.needsUpdate=true;
  }

  /* ---------- tiga kamp balok: peti menyusut sesuai stok, angka sisa tertulis di tanah, tenda dan bendera sebagai penanda jauh ---------- */
  const gudangs=[];
  function papan(){
    const c=document.createElement('canvas');c.width=256;c.height=128;const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;
    const sp=new THREE.Mesh(new THREE.PlaneGeometry(4.2,2.1),new THREE.MeshBasicMaterial({map:tx,transparent:true,depthWrite:false,toneMapped:false}));
    sp.rotation.x=-Math.PI/2;sp.renderOrder=2;
    return {sp,c,tx,teks:''};
  }
  function tulis(o,l2,warnaTeks){
    const k=l2+'|'+warnaTeks;if(o.teks===k)return;o.teks=k;
    const g=o.c.getContext('2d');g.clearRect(0,0,256,128);
    g.textAlign='center';g.textBaseline='middle';g.font='800 96px "Bricolage Grotesque",sans-serif';
    g.lineWidth=14;g.lineJoin='round';g.strokeStyle='#fff6e4';g.strokeText(l2,128,68);
    g.fillStyle=warnaTeks;g.fillText(l2,128,68);o.tx.needsUpdate=true;
  }
  const WK=[0x2e9e5b,0xe08a2b,0x2f7fc1];
  KAMP.forEach((d,di)=>{
    const g=new THREE.Group();g.position.set(d.x,Y(d.x,d.z),d.z);grup.add(g);
    const al=new THREE.Mesh(new THREE.CircleGeometry(d.r,32),new THREE.MeshBasicMaterial({color:0xf3e2bd,transparent:true,opacity:.55,depthWrite:false}));
    al.rotation.x=-Math.PI/2;al.position.y=.03;g.add(al);
    const cg=new THREE.Mesh(new THREE.RingGeometry(d.r-1.7,d.r-1.4,28),new THREE.MeshBasicMaterial({color:0xff6f47,side:THREE.DoubleSide}));
    cg.rotation.x=-Math.PI/2;cg.position.y=.05;g.add(cg);
    const peti=[];
    for(let i=0;i<3;i++)for(let j=0;j<3-i;j++){
      const b=new THREE.Mesh(gb,new THREE.MeshLambertMaterial({color:warna,flatShading:true}));
      b.scale.set(1.1,.5,.8);b.position.set((j-(2-i)/2)*1.2,.26+i*.52,0);g.add(b);peti.push(b);
    }
    const pb=papan();pb.sp.position.set(0,.07,2.1);g.add(pb.sp);
    const tenda=new THREE.Mesh(new THREE.ConeGeometry(1.9,2.4,4),mat(WK[di]));tenda.position.set(-2.5,1.2,-1.9);tenda.rotation.y=Math.PI/4;g.add(tenda);
    const tiang=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,7,6),mat(0x6b4a26));tiang.position.set(2.6,3.5,-2);g.add(tiang);
    const bend=new THREE.Mesh(new THREE.BoxGeometry(1.7,1,.08),mat(WK[di]));bend.position.set(3.5,6.4,-2);g.add(bend);
    gudangs.push({g,peti,pb,bend,nama:d.nama});
  });
  const tumpuk=gudangs.flatMap(o=>o.peti);
  function setStok(g,g0){
    gudangs.forEach((o,i)=>{
      const n=g[i]|0,mx=Math.max(1,g0[i]|0),vis=n<=0?0:Math.max(1,Math.ceil(6*n/mx));
      o.peti.forEach((b,j)=>{b.visible=j<vis;});
      tulis(o.pb,String(Math.max(0,n)),n>0&&n/mx>=.25?'#1c2230':'#e5392b');
    });
  }
  function tulisanLantai(teks,w,warnaGaris){
    const c=document.createElement('canvas');c.width=256;c.height=128;const g=c.getContext('2d');
    g.textAlign='center';g.textBaseline='middle';g.font='800 84px "Bricolage Grotesque",sans-serif';g.lineWidth=12;g.lineJoin='round';
    g.strokeStyle=warnaGaris;g.strokeText(teks,128,68);g.fillStyle='#1c2230';g.fillText(teks,128,68);
    const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;
    const lp=new THREE.Mesh(new THREE.PlaneGeometry(w,w/2),new THREE.MeshBasicMaterial({map:tx,transparent:true,depthWrite:false,toneMapped:false}));
    lp.rotation.x=-Math.PI/2;lp.position.y=.07;lp.renderOrder=2;return lp;
  }
  /* pad kunci (hijau) dan pelat tuas (biru) di plaza bendungan */
  const pad=new THREE.Group();pad.position.set(PAD.x,0,PAD.z);grup.add(pad);
  const cp=new THREE.Mesh(new THREE.CircleGeometry(PAD.r,28),new THREE.MeshBasicMaterial({color:0x7bd38a,transparent:true,opacity:.75}));
  cp.rotation.x=-Math.PI/2;cp.position.y=.04;pad.add(cp);
  const cr=new THREE.Mesh(new THREE.RingGeometry(PAD.r-.3,PAD.r,28),new THREE.MeshBasicMaterial({color:0x1c2230,side:THREE.DoubleSide}));
  cr.rotation.x=-Math.PI/2;cr.position.y=.05;pad.add(cr);pad.add(tulisanLantai('PAD',3.4,'#e8f6ea'));
  const tuas=new THREE.Group();tuas.position.set(TUAS.x,0,TUAS.z);grup.add(tuas);
  const ct=new THREE.Mesh(new THREE.CircleGeometry(TUAS.r,28),new THREE.MeshBasicMaterial({color:0x6fb7e9,transparent:true,opacity:.75}));
  ct.rotation.x=-Math.PI/2;ct.position.y=.04;tuas.add(ct);
  const ctr=cr.clone();ctr.geometry=new THREE.RingGeometry(TUAS.r-.3,TUAS.r,28);tuas.add(ctr);tuas.add(tulisanLantai('TUAS',3.2,'#e3f1fb'));
  /* gerbang jalan pintas: palang terangkat selama ada yang berdiri di pelat tuas */
  const gz=(GERBANG.z0+GERBANG.z1)/2,gx=JALUR[0][0]+(JALUR[0][2]-JALUR[0][0])*(gz-JALUR[0][1])/(JALUR[0][3]-JALUR[0][1]);
  const gerb=new THREE.Group();gerb.position.set(gx,Y(gx,gz),gz);grup.add(gerb);
  const palang=new THREE.Group();palang.position.set(-2.3,1.3,0);gerb.add(palang);
  {
    const kayuG=mat(0x6b4a26);
    for(const sx of [-2.3,2.3]){const t=new THREE.Mesh(new THREE.BoxGeometry(.4,2.4,.4),kayuG);t.position.set(sx,1.2,0);gerb.add(t);}
    const pg=new THREE.BoxGeometry(4.6,.3,.3);pg.translate(2.3,0,0);palang.add(new THREE.Mesh(pg,mat(0x6fb7e9)));
    const pg2=new THREE.BoxGeometry(4.6,.3,.3);pg2.translate(2.3,-.6,0);palang.add(new THREE.Mesh(pg2,mat(0x6fb7e9)));
  }
  let gerbBuka=false;

  /* ---------- air: sungai dan air terjun ---------- */
  const matAir=new THREE.MeshPhongMaterial({color:0x3f9bd8,transparent:true,opacity:.86,shininess:90,specular:0xbfe6ff});
  const riaks=[];
  {
    const w=SUNGAI.x1-SUNGAI.x0+2,d=SUNGAI.z1-SUNGAI.z0,cx=(SUNGAI.x0+SUNGAI.x1)/2+1,cz=(SUNGAI.z0+SUNGAI.z1)/2;
    const air=new THREE.Mesh(new THREE.PlaneGeometry(w,d),matAir);air.rotation.x=-Math.PI/2;air.position.set(cx,-.38,cz);air.userData.tanah=true;grup.add(air);
    for(let i=0;i<5;i++){
      const r=new THREE.Mesh(new THREE.PlaneGeometry(3.2,.16),new THREE.MeshBasicMaterial({color:0xdff3ff,transparent:true,opacity:.7,depthWrite:false}));
      r.rotation.x=-Math.PI/2;r.position.set(0,-.34,SUNGAI.z0+.6+i*(d-1.2)/4);r.userData.tanah=true;grup.add(r);riaks.push(r);
    }
    const jatuh=new THREE.Mesh(new THREE.PlaneGeometry(d,12),new THREE.MeshBasicMaterial({color:0xcfeaff,transparent:true,opacity:.8,side:THREE.DoubleSide}));
    jatuh.rotation.y=-Math.PI/2;jatuh.position.set(DUNIA.x1-.3,5.6,cz);jatuh.userData.tanah=true;grup.add(jatuh);
    /* dasar jurang berkabut gelap */
    const dj=new THREE.Mesh(new THREE.PlaneGeometry(JURANG.x1-JURANG.x0,JURANG.z1-JURANG.z0),new THREE.MeshBasicMaterial({color:0x2a2f3a,transparent:true,opacity:.55,depthWrite:false}));
    dj.rotation.x=-Math.PI/2;dj.position.set(0,BUKIT_Y()-3.2,(JURANG.z0+JURANG.z1)/2);dj.userData.tanah=true;grup.add(dj);
  }
  function BUKIT_Y(){return Y(0,29);}
  /* ---------- jembatan: gantung di atas jurang, kayu di atas sungai ---------- */
  {
    const kayu1=mat(0xc08a4a),kayu2=mat(0xb27a3c),tali=mat(0x6b4a26);
    const z0=25.7,z1=32.3,n=11,y=BUKIT_Y();
    for(let k=0;k<n;k++){const pl=new THREE.Mesh(new THREE.BoxGeometry(2.7,.16,(z1-z0)/n-.07),k%2?kayu1:kayu2);pl.position.set(0,y+.02-Math.sin(Math.PI*(k+.5)/n)*.0,z0+(k+.5)*(z1-z0)/n);grup.add(pl);}
    for(const sx of [-1,1]){
      const rl=new THREE.Mesh(new THREE.BoxGeometry(.1,.1,z1-z0),tali);rl.position.set(sx*1.4,y+1,(z0+z1)/2);grup.add(rl);
      for(const zz of [z0,z1,(z0+z1)/2]){const t=new THREE.Mesh(new THREE.BoxGeometry(.2,1.2,.2),tali);t.position.set(sx*1.4,y+.5,zz);grup.add(t);}
    }
    /* jembatan kayu pada jalur memutar sungai, mengikuti arah ruas */
    const [ax,az,bx,bz]=JEMB_KAYU,dx=bx-ax,dz=bz-az,L=Math.hypot(dx,dz),ux=dx/L,uz=dz/L,rot=Math.atan2(ux,uz);
    const t0=(SUNGAI.z0-.8-az)/dz*L,t1=(SUNGAI.z1+.8-az)/dz*L,m=9;
    for(let k=0;k<m;k++){
      const t=t0+(k+.5)*(t1-t0)/m,pl=new THREE.Mesh(new THREE.BoxGeometry(4.2,.18,(t1-t0)/m-.07),k%2?kayu1:kayu2);
      pl.position.set(ax+ux*t,.06,az+uz*t);pl.rotation.y=rot;grup.add(pl);
    }
    for(const sx of [-1,1]){const tm=(t0+t1)/2,rl=new THREE.Mesh(new THREE.BoxGeometry(.14,.5,t1-t0),tali);
      rl.position.set(ax+ux*tm+sx*uz*2.1,.5,az+uz*tm-sx*ux*2.1);rl.rotation.y=rot;grup.add(rl);}
  }
  /* ---------- tumbuhan dan batu: InstancedMesh, kepadatan diatur dari tingkat kualitas ---------- */
  const flora=[];
  {
    let seed=20261;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
    const NP=1100,NL=420,NB=520,NS=700;
    const mk=(geo,n)=>{const m=new THREE.InstancedMesh(geo,tembus(new THREE.MeshLambertMaterial({flatShading:true})),n);m.userData.maks=0;grup.add(m);flora.push(m);return m;};
    const gPinus=new THREE.ConeGeometry(1.5,3.6,7),gPinus2=new THREE.ConeGeometry(1.1,2.6,7),gBatang=new THREE.CylinderGeometry(.24,.32,1.6,6),gDaun=new THREE.IcosahedronGeometry(1.5,0),gBatu=new THREE.IcosahedronGeometry(1,0),gSemak=new THREE.ConeGeometry(.6,.9,5);
    const pinus=mk(gPinus,NP),pinus2=mk(gPinus2,NP),batangP=mk(gBatang,NP),daun=mk(gDaun,NL),batangL=mk(gBatang,NL),batu=mk(gBatu,NB),semak=mk(gSemak,NS);
    const m=new THREE.Matrix4(),q=new THREE.Quaternion(),p=new THREE.Vector3(),sc=new THREE.Vector3(),C=new THREE.Color(),e=new THREE.Euler();
    const HP=[0x1f6b3a,0x2a7d44,0x2f8a4c,0x246b3f],HL=[0x4fae5a,0x6cc06a,0x3f9a52,0x8cc96a],HB=[0x8d8a84,0x9aa09a,0x7c7f86];
    let np=0,nl=0,nb=0,ns=0;
    const sah=(x,z,marg)=>z>1&&jarakJalan(x,z)>marg&&dalam(SUNGAI,x,z)<-.6&&dalam(JURANG,x,z)<-.4;
    for(let i=0;i<9000;i++){
      const x=DUNIA.x0+1+rnd()*(DUNIA.x1-DUNIA.x0-2),z=1+rnd()*(DUNIA.z1-2),u=rnd(),s=.55+rnd()*.6,ry=rnd()*6.28;
      const hutan=x<-13,sungai=x>13,tebing=Math.max(ss(37,46,Math.abs(x)),ss(60,69,z))>.45;
      const y=tinggiTanah(x,z);
      if((u<(hutan?.72:sungai?.18:.3))&&!tebing){
        if(np>=NP||!sah(x,z,3.2))continue;
        q.setFromEuler(e.set(0,ry,0));
        sc.set(s,s,s);p.set(x,y+.7*s,z);m.compose(p,q,sc);batangP.setMatrixAt(np,m);batangP.setColorAt(np,C.set(0x7a4f2a));
        p.set(x,y+2.9*s,z);m.compose(p,q,sc);pinus.setMatrixAt(np,m);pinus.setColorAt(np,C.set(HP[i%4]));
        p.set(x,y+4.6*s,z);m.compose(p,q,sc);pinus2.setMatrixAt(np,m);pinus2.setColorAt(np,C.set(HP[(i+1)%4]));np++;
      }else if(u<(hutan?.8:sungai?.55:.36)&&!tebing){
        if(nl>=NL||!sah(x,z,3.6))continue;
        q.setFromEuler(e.set(rnd()*.4,ry,0));
        sc.set(s*.9,s*1.1,s*.9);p.set(x,y+.8*s,z);m.compose(p,q,sc);batangL.setMatrixAt(nl,m);batangL.setColorAt(nl,C.set(0x8a5a2b));
        sc.set(s,s*.85,s);p.set(x,y+2.5*s,z);m.compose(p,q,sc);daun.setMatrixAt(nl,m);daun.setColorAt(nl,C.set(HL[i%4]));nl++;
      }else if(u<(hutan?.86:sungai?.68:.72)||tebing){
        if(nb>=NB||!sah(x,z,1.3))continue;
        const b=tebing?1.4+rnd()*1.8:(.4+rnd()*.9);
        q.setFromEuler(e.set(rnd()*3,ry,rnd()*3));sc.set(b,b*(.6+rnd()*.5),b);p.set(x,y+.25*b,z);m.compose(p,q,sc);batu.setMatrixAt(nb,m);batu.setColorAt(nb,C.set(HB[i%3]));nb++;
      }else{
        if(ns>=NS||!sah(x,z,.5))continue;
        q.setFromEuler(e.set(0,ry,0));sc.set(s,s,s);p.set(x,y+.4*s,z);m.compose(p,q,sc);semak.setMatrixAt(ns,m);semak.setColorAt(ns,C.set(hutan?0x3a8a48:sungai?0x9bd070:0x7fae5c));ns++;
      }
    }
    const jml=[np,np,np,nl,nl,nb,ns];
    flora.forEach((f,i)=>{f.userData.maks=jml[i];f.count=jml[i];f.instanceMatrix.needsUpdate=true;if(f.instanceColor)f.instanceColor.needsUpdate=true;f.computeBoundingSphere();});
    flora[6].userData.hias=true;
  }
  /* gunung latar di sekeliling lembah */
  {
    const g=new THREE.ConeGeometry(1,1,6),gm=new THREE.InstancedMesh(g,new THREE.MeshLambertMaterial({flatShading:true}),34);
    const m=new THREE.Matrix4(),q=new THREE.Quaternion(),p=new THREE.Vector3(),sc=new THREE.Vector3(),C=new THREE.Color();
    let seed=77;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
    for(let i=0;i<34;i++){
      const a=-.35+i/33*(Math.PI+.7),R=78+rnd()*30,h=22+rnd()*26,w=20+rnd()*16;
      p.set(Math.cos(a)*R*1.05,h/2-2,30+Math.sin(a)*R*.85);sc.set(w,h,w);m.compose(p,q,sc);gm.setMatrixAt(i,m);gm.setColorAt(i,C.set([0x7f93a8,0x8fa3b5,0x6f8499][i%3]));
    }
    gm.instanceMatrix.needsUpdate=true;gm.userData.latar=true;gm.frustumCulled=false;grup.add(gm);
  }
  /* ---------- koin petualang ---------- */
  const gk=new THREE.CylinderGeometry(.55,.55,.14,16);gk.rotateX(Math.PI/2);
  const koin=new THREE.InstancedMesh(gk,new THREE.MeshLambertMaterial({color:0xffc83d,flatShading:true,emissive:0x664400}),KOIN_A.length);koin.frustumCulled=false;grup.add(koin);
  let koinAda=KOIN_A.map(()=>true);
  function animKoin(t){
    for(let i=0;i<KOIN_A.length;i++){
      const [x,z]=KOIN_A[i];Q.setFromAxisAngle(SUMBU_Y,t*2+i);P.set(x,Y(x,z)+1.1+Math.sin(t*2.4+i)*.12,z);S.setScalar(koinAda[i]?1:.0001);M.compose(P,Q,S);koin.setMatrixAt(i,M);
    }
    Q.identity();koin.instanceMatrix.needsUpdate=true;
  }
  const SUMBU_Y=new THREE.Vector3(0,1,0);

  /* ---------- rintangan ---------- */
  const logam=mat(0x6b7480),merah=mat(0xe5392b),oranye=mat(0xff8a3d),gelap=mat(0x1c2230),matBatu=mat(0xb9b4a8),matBatuG=mat(0xe5392b);
  const MD={palu:[],pintu:[],duri:[],ubin:[],bola:[],chev:[],kayu:[]};
  let mSpec=medanBabak(0),chevOff=0;
  for(let i=0;i<2;i++){
    const g=new THREE.Group(),t1=new THREE.Mesh(new THREE.BoxGeometry(.3,PAL_Y+.4,.3),logam),t2=t1.clone(),bm=new THREE.Mesh(new THREE.BoxGeometry(2*(PAL_A+.9),.3,.3),logam);
    t1.position.set(-PAL_A-.9,(PAL_Y+.4)/2,0);t2.position.set(PAL_A+.9,(PAL_Y+.4)/2,0);bm.position.set(0,PAL_Y+.15,0);
    /* tiang palu berdiri di tepi jurang yang dalam: panjangkan ke bawah */
    t1.scale.y=2.6;t2.scale.y=2.6;t1.position.y-=3.6;t2.position.y-=3.6;
    const ag=new THREE.BoxGeometry(.2,PAL_L,.2);ag.translate(0,-PAL_L/2,0);const lengan=new THREE.Mesh(ag,logam);lengan.position.set(0,PAL_Y,0);
    const kepala=new THREE.Mesh(new THREE.BoxGeometry(1.5,1.0,1.1),merah);kepala.position.set(0,-PAL_L,0);lengan.add(kepala);
    g.add(t1,t2,bm,lengan);g.visible=false;grup.add(g);MD.palu.push({g,lengan});
  }
  {
    const pg=new THREE.BoxGeometry(1,2.2,.9);
    for(let i=0;i<2;i++){const m=new THREE.Mesh(pg,oranye);m.position.y=1.1;m.visible=false;grup.add(m);MD.pintu.push(m);}
    for(const sx of [PINTU.x0-.25,PINTU.x1+.25]){const t=new THREE.Mesh(new THREE.BoxGeometry(.5,2.8,1.1),mat(0x6b4a26));t.position.set(sx,1.4,medanBabak(0).pintu[0].z);grup.add(t);}
  }
  for(let j=0;j<2;j++)for(let i=0;i<DURI_X.length;i++){
    const g=new THREE.Group(),dasar=new THREE.Mesh(new THREE.CylinderGeometry(.72,.72,.05,14),gelap);dasar.position.y=.03;g.add(dasar);
    const kn=new THREE.Group();
    for(const [ox,oz] of [[-.3,-.2],[.3,-.2],[0,.28]]){const c=new THREE.Mesh(new THREE.ConeGeometry(.24,1.0,6),merah);c.position.set(ox,.5,oz);kn.add(c);}
    g.add(kn);g.visible=false;grup.add(g);MD.duri.push({g,kn,j,i});
  }
  for(let n=0;n<3;n++){
    const u=new THREE.Mesh(new THREE.BoxGeometry(UBIN_W*.97,.6,UBIN_D*.94),matBatu.clone());u.visible=false;grup.add(u);MD.ubin.push(u);
  }
  for(let n=0;n<2;n++){
    const b=new THREE.Mesh(new THREE.IcosahedronGeometry(BOLA_R,1),mat(0x8a8f98));b.visible=false;grup.add(b);
    const w=new THREE.Mesh(new THREE.PlaneGeometry(BOLA_R*2,1),new THREE.MeshBasicMaterial({color:0xe5392b,transparent:true,opacity:.0,depthWrite:false}));
    w.rotation.x=-Math.PI/2;w.visible=false;w.userData.tanah=true;grup.add(w);MD.bola.push({b,w});
  }
  /* ban berjalan: alas gelap dan panah yang bergulir */
  const banL=BAN.z1-BAN.z0,banCx=(BAN.x0+BAN.x1)/2,banCz=(BAN.z0+BAN.z1)/2;
  const banAlas=new THREE.Mesh(new THREE.PlaneGeometry(BAN.x1-BAN.x0,banL),new THREE.MeshBasicMaterial({color:0x4a4f5a}));
  banAlas.rotation.x=-Math.PI/2;banAlas.position.set(banCx,.05,banCz);banAlas.userData.tanah=true;grup.add(banAlas);
  const chevG=new THREE.Group();grup.add(chevG);
  {
    const ga=new THREE.BoxGeometry(.8,.03,.16);
    for(let k=0;k<18;k++){
      const g=new THREE.Group(),a=new THREE.Mesh(ga,mat(0xffd96b)),b=new THREE.Mesh(ga,mat(0xffd96b));
      a.position.set(-.25,0,-.25);a.rotation.y=-Math.PI/4;b.position.set(.25,0,-.25);b.rotation.y=Math.PI/4;g.add(a,b);g.position.y=.08;chevG.add(g);MD.chev.push(g);
    }
  }
  const tramp=new THREE.Group();tramp.visible=false;grup.add(tramp);
  {
    const alas=new THREE.Mesh(new THREE.CylinderGeometry(1.2,1.2,.25,18),mat(0xe5392b)),atas=new THREE.Mesh(new THREE.CylinderGeometry(.98,.98,.06,18),mat(0xfff1d0));
    alas.position.y=.13;atas.position.y=.28;tramp.add(alas,atas);
  }
  /* gelondong menyapu lereng bukit */
  {
    const geoG=new THREE.CylinderGeometry(.55,.55,1.3,12);geoG.rotateX(Math.PI/2);
    const matG=mat(0x8a5a2b),matB=mat(0xd9a45a);
    for(let i=0;i<RINT_MAKS;i++){
      const m=new THREE.Group(),b=new THREE.Mesh(geoG,matG);
      const s1=new THREE.Mesh(new THREE.BoxGeometry(1.15,.18,1.36),matB);m.add(b);b.add(s1);
      m.visible=false;grup.add(m);MD.kayu.push({g:m,b});
    }
  }
  function setMedan(r){
    mSpec=medanBabak(r);
    MD.kayu.forEach((o,i)=>{o.g.visible=!!mSpec.kayu[i];});
    MD.palu.forEach((o,i)=>{const p=mSpec.palu[i];o.g.visible=!!p;if(p)o.g.position.set(0,Y(0,p.z),p.z);});
    MD.pintu.forEach(m=>{m.visible=true;m.position.z=mSpec.pintu[0].z;});
    MD.duri.forEach(o=>{const p=mSpec.duri[o.j];o.g.visible=!!p;if(p)o.g.position.set(DURI_X[o.i],Y(DURI_X[o.i],p.z),p.z);});
    MD.ubin.forEach((u,n)=>{const s=mSpec.ubin[n];u.visible=!!s;if(s)u.position.set(s.x,-.2,s.z);});
    MD.bola.forEach((o,n)=>{const s=mSpec.bola[n];o.b.visible=false;o.w.visible=!!s;
      if(s){const L=Math.abs(s.z1-s.z0);o.w.scale.set(1,L,1);o.w.position.set(s.x,Y(s.x,(s.z0+s.z1)/2)+.07,(s.z0+s.z1)/2);o.w.material.opacity=0;}});
    if(mSpec.tramp){tramp.visible=true;tramp.position.set(mSpec.tramp.x,Y(mSpec.tramp.x,mSpec.tramp.z),mSpec.tramp.z);}else tramp.visible=false;
  }
  function animMedan(t,dt){
    mSpec.kayu.forEach((s,i)=>{const x=xKayu(s,t),o=MD.kayu[i];o.g.position.set(x,Y(x,s.z)+.55,s.z);o.b.rotation.z=-x/.55;});
    mSpec.palu.forEach((p,i)=>{const x=xPalu(p,t);MD.palu[i].lengan.rotation.z=Math.asin(Math.max(-1,Math.min(1,x/PAL_L)));});
    {
      const p=mSpec.pintu[0],g=celahPintu(p,t),ce=g<.9?0:g,izq=PINTU.cx-ce/2,dr=PINTU.cx+ce/2;
      MD.pintu[0].scale.x=Math.max(.01,izq-PINTU.x0);MD.pintu[0].position.x=(PINTU.x0+izq)/2;
      MD.pintu[1].scale.x=Math.max(.01,PINTU.x1-dr);MD.pintu[1].position.x=(dr+PINTU.x1)/2;
    }
    for(const o of MD.duri){const p=mSpec.duri[o.j];if(!p)continue;const h=tinggiDuri(p,o.i,t);o.kn.scale.y=Math.max(.001,h);
      for(const c of o.kn.children)c.material=h>=.99?merah:(h>0?oranye:merah);}
    mSpec.ubin.forEach((u,n)=>{const s=statusUbin(u,t),m=MD.ubin[n];
      const ty=s===2?-1.25:-.2;m.position.y+=(ty-m.position.y)*Math.min(1,dt*10);
      m.material.color.setHex(s===1?(Math.sin(t*22)>0?0xe5392b:0xb9b4a8):0xb9b4a8);m.position.x=u.x+(s===1?Math.sin(t*60)*.05:0);});
    mSpec.bola.forEach((b,n)=>{
      const s=keadaanBola(b,t),o=MD.bola[n];o.b.visible=s.fase==='gulir';
      if(s.fase==='gulir'){o.b.position.set(b.x,Y(b.x,s.z)+BOLA_R,s.z);o.b.rotation.x=s.z/BOLA_R;}
      o.w.material.opacity=s.fase==='peringatan'?(.18+.18*Math.abs(Math.sin(t*8))):(s.fase==='gulir'?.1:0);
    });
    const v=kecBan(mSpec,t);chevOff=(chevOff+Math.abs(v)*dt)%banL;const N=6,sp=banL/N;
    chevG.rotation.y=v<0?Math.PI:0;chevG.position.set(banCx,0,banCz);
    MD.chev.forEach((g,k)=>{const col=k%3,row=Math.floor(k/3),zl=((row*sp+chevOff)%banL)-banL/2;g.position.set((col-1)*1.4,.08,zl);});
    /* gerbang, air, bendera */
    const tg=gerbBuka?-1.35:0;palang.rotation.z+=(tg-palang.rotation.z)*Math.min(1,dt*6);
    riaks.forEach((r,i)=>{r.position.x=SUNGAI.x0+((t*(2.2+i*.3)+i*7)%(SUNGAI.x1-SUNGAI.x0));});
    gudangs.forEach((o,i)=>{o.bend.rotation.y=Math.sin(t*2+i)*.25;});
    animKoin(t);
  }
  setMedan(0);

  return {
    grup,
    setBabak(o){nKol=o.n;gambarDinding(o);bangunPelat(o.n,o.xs);},
    setWarna(w){warna=w;for(const b of tumpuk)b.material.color.set(w);},
    setStok,setMedan,animMedan,setBags,setBawa,
    setGerbang(b){gerbBuka=!!b;ct.material.opacity=b?.95:.6;},
    setKoin(ada){koinAda=ada.slice();},
    /* kepadatan tumbuhan 0..1 dari tingkat kualitas; semak hias hanya di tingkat tinggi */
    setDetail(f,hias){for(const m of flora){m.count=Math.round(m.userData.maks*(m.userData.hias?(hias?1:0):f));m.visible=m.count>0;}},
    sorot(i){for(const p of pelat)p.material.color.set(p.userData.i===i?0xffd96b:0xffffff);},
    padAnim(t,siap){const s=1+Math.sin(t*3)*.04;cp.scale.set(s,s,1);cp.material.opacity=siap?.95:.6;},
    get n(){return nKol;}
  };
}
