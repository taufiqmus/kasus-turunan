/* Uji geometri dunia pos (tanpa peramban): node tests/medan_cek.mjs
   - titik penting (pad, tuas, kamp, koin, trampolin) ada di jalur
   - semua kamp terjangkau dari plaza
   - tidak ada rute ke kamp mana pun yang bebas rintangan (semua jalur punya rintangan)
   - tiap rintangan menutup selebar jalur (tidak bisa mlipir) di ketiga babak */
import * as SEMUA from '../integral/medan.js';
import {M1,M2,DURI_HIT,RINT_R,RINT_MAKS,DURI_MAKS} from '../integral/medan.js';
let gagal=0;
const cek=(nama,ok,info='')=>{console.log((ok?'OK  ':'GAGAL ')+nama,ok?'':info);if(!ok)gagal++;};
const DUNIA_LIST=Object.keys(SEMUA).filter(k=>/^M\d$/.test(k)).sort().map(k=>SEMUA[k]);
for(const W of DUNIA_LIST){
  const N=W.nama,D=W.DUNIA,st=.25,X0=D.x0,Z0=0,NX=Math.round((D.x1-D.x0)/st),NZ=Math.round(D.z1/st);
  const di=(x,z)=>W.boleh(x,z,true);
  cek(N+': pad dan tuas di plaza',di(W.PAD.x,W.PAD.z)&&di(W.TUAS.x,W.TUAS.z)&&W.PAD.z<W.PLAZA.z1&&W.TUAS.z<W.PLAZA.z1);
  cek(N+': kamp di jalur',W.KAMP.every(k=>di(k.x,k.z)));
  const kl=W.KOIN_A.filter(([x,z])=>!di(x,z));cek(N+': semua koin di jalur',!kl.length,JSON.stringify(kl));
  const tr=W.medanBabak(2).tramp;if(tr)cek(N+': trampolin dan titik mendarat di jalur',di(tr.x,tr.z)&&di(tr.x1,tr.z1));
  function bfs(blok,gb){
    const d=new Int8Array(NX*NZ),s=Math.round(((W.PLAZA.z0+W.PLAZA.z1)/2)/st)*NX+Math.round((0-X0)/st);d[s]=1;const q=[s];
    for(let h=0;h<q.length;h++){const c=q[h],i=c%NX,j=(c-i)/NX;
      for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){const u=i+a,v=j+b;if(u<0||v<0||u>=NX||v>=NZ)continue;const n=v*NX+u;if(d[n])continue;
        const x=X0+u*st,z=Z0+v*st;if(!W.boleh(x,z,gb)||(blok&&blok(x,z)))continue;d[n]=1;q.push(n);}}
    return (x,z)=>d[Math.round((z-Z0)/st)*NX+Math.round((x-X0)/st)]===1;
  }
  let f=bfs(null,false);cek(N+': semua kamp terjangkau (gerbang tertutup)',W.KAMP.every(k=>f(k.x,k.z)));
  for(const r of [0,1,2]){
    const m=W.medanBabak(r);
    cek(N+' babak '+(r+1)+': jumlah rintangan muat di wadah tampilan',m.kayu.length<=RINT_MAKS&&m.duri.length<=DURI_MAKS&&m.palu.length<=2&&m.bola.length<=2&&m.ubin.length<=6,[m.kayu.length,m.duri.length]);
    const jejak=(x,z)=>{
      for(const s of m.kayu){if(s.ax==='x'?(Math.abs(z-s.c)<.95&&Math.abs(x-s.m)<s.A+RINT_R):(Math.abs(x-s.c)<.95&&Math.abs(z-s.m)<s.A+RINT_R))return true;}
      for(const p of m.duri)for(const q of p.pts)if(Math.hypot(x-q[0],z-q[1])<DURI_HIT)return true;
      for(const p of m.pintu)if(Math.abs(z-p.z)<.5&&x>W.PINTU.x0-.3&&x<W.PINTU.x1+.3)return true;
      for(const u of m.ubin)if(Math.abs(z-u.z)<W.UBIN.D/2&&Math.abs(x-u.x)<=W.UBIN.W/2+.3)return true;
      for(const p of m.palu)if(Math.abs(z-p.z)<.65&&Math.abs(x-p.x)<3.85)return true;
      for(const p of m.penekan)if(x>p.x0&&x<p.x1&&z>p.z0&&z<p.z1)return true;
      for(const L of m.lengan)if(Math.hypot(x-L.x,z-L.z)<L.L+.35)return true;
      for(const R of m.rakit){const a=R.ax==='x'?x:z,c=R.ax==='x'?z:x;if(Math.abs(c-R.c)<R.lebar+.25&&a>R.a0&&a<R.a1)return true;}
      for(const J of m.jatuh)if(x>J.x0&&x<J.x1&&z>J.z0&&z<J.z1)return true;
      for(const P of m.patroli){const dx=P.x1-P.x0,dz=P.z1-P.z0,L=dx*dx+dz*dz,u=L?Math.max(0,Math.min(1,((x-P.x0)*dx+(z-P.z0)*dz)/L)):0;if(Math.hypot(x-P.x0-dx*u,z-P.z0-dz*u)<P.r+.3)return true;}
      for(const Z of m.pasang)if(x>Z.x0&&x<Z.x1&&z>Z.z0&&z<Z.z1)return true;
      return false;};
    f=bfs(jejak,true);const bebas=W.KAMP.filter(k=>f(k.x,k.z)).map(k=>k.nama);
    cek(N+' babak '+(r+1)+': tiap rute ke kamp melewati rintangan',!bebas.length,'bebas ke '+bebas.join(','));
    /* celah: titik yang tidak pernah kena, di garis lintang rintangan, yang tersambung ke titik tengahnya lewat jalur */
    const kena=(x,z,ud)=>{for(let t=0;t<90;t+=.06)if(W.bahaya(r,x,z,t,ud))return true;return false;};
    const garis=(nama,cx,cz,ux,uz,L,ud)=>{
      const cel=[];
      for(let o=-L;o<=L;o+=.1){const x=cx+ux*o,z=cz+uz*o;if(!W.boleh(x,z,true))continue;
        let sm=true;for(let v=Math.min(o,0);v<=Math.max(o,0);v+=.1)if(!W.boleh(cx+ux*v,cz+uz*v,true)){sm=false;break;}
        if(sm&&!kena(x,z,ud))cel.push(o.toFixed(1));}
      if(cel.length)cek(N+' babak '+(r+1)+': '+nama+' rapat',false,'celah '+cel.slice(0,8).join(','));
      return cel.length;};
    let c=0;
    m.kayu.forEach((s,i)=>{c+=garis('kayu '+i,s.ax==='x'?s.m:s.c,s.ax==='x'?s.c:s.m,s.ax==='x'?1:0,s.ax==='x'?0:1,7,false);});
    m.duri.forEach((p,i)=>{const [a,b,cc]=p.pts,L=Math.hypot(cc[0]-a[0],cc[1]-a[1]);c+=garis('duri '+i,b[0],b[1],(cc[0]-a[0])/L,(cc[1]-a[1])/L,4,false);});
    m.pintu.forEach(p=>{c+=garis('pintu',W.PINTU.cx,p.z,1,0,5,true);});
    m.ubin.forEach((u,i)=>{const w=u.w||W.UBIN.W,d=u.d||W.UBIN.D;c+=w>=d?garis('batu pijakan '+i,u.x,u.z,1,0,4,false):garis('batu pijakan '+i,u.x,u.z,0,1,4,false);});
    m.palu.forEach((p,i)=>{c+=garis('palu '+i,p.x,p.z,1,0,4,true);});
    m.penekan.forEach((p,i)=>{const cx=(p.x0+p.x1)/2,cz=(p.z0+p.z1)/2,lebar=p.x1-p.x0>p.z1-p.z0;c+=garis('penekan '+i,cx,cz,lebar?1:0,lebar?0:1,5,false);});
    m.lengan.forEach((L,i)=>{c+=garis('lengan '+i,L.x,L.z,1,0,L.L+.2,false);c+=garis('lengan '+i+' (z)',L.x,L.z,0,1,L.L+.2,false);});
    m.patroli.forEach((P,i)=>{const dx=P.x1-P.x0,dz=P.z1-P.z0,L=Math.hypot(dx,dz);c+=garis('patroli '+i,(P.x0+P.x1)/2,(P.z0+P.z1)/2,-dz/L,dx/L,P.r+2,false);});
    m.pasang.forEach((Z,i)=>{const w=Z.x1-Z.x0,d=Z.z1-Z.z0;c+=garis('pasang '+i,(Z.x0+Z.x1)/2,(Z.z0+Z.z1)/2,w>=d?1:0,w>=d?0:1,Math.max(w,d)/2+2,false);});
    m.rakit.forEach((R,i)=>{const mid=(R.a0+R.a1)/2;c+=R.ax==='x'?garis('rakit '+i,mid,R.c,0,1,3,false):garis('rakit '+i,R.c,mid,1,0,3,false);});
    if(!c)cek(N+' babak '+(r+1)+': semua rintangan rapat selebar jalur',true);
  }
}
console.log(gagal?'ADA YANG GAGAL':'SEMUA LULUS');process.exit(gagal?1:0);
