/* Alat gambar bersama untuk modul kasus: dunia (bangunan, pohon, lampu) dan panel overlay. */
export function kit(E){
  const {INK,PAPER,SUN,CORAL,FD,FU}=E;
  function ground(g,WW,WH,R,base,c1,c2){
    g.fillStyle=base;g.fillRect(0,0,WW,WH);
    for(let i=0;i<120;i++){g.fillStyle=R()<.5?c1:c2;g.beginPath();g.ellipse(R()*WW,R()*WH,30+R()*70,18+R()*40,0,0,7);g.fill();}
  }
  function building(g,b){
    g.fillStyle='rgba(28,34,48,.28)';g.fillRect(b.x+8,b.y+8,b.w,b.h);
    g.fillStyle=PAPER;g.strokeStyle=INK;g.lineWidth=4;g.fillRect(b.x,b.y,b.w,b.h);g.strokeRect(b.x,b.y,b.w,b.h);
    g.fillStyle=b.roof;g.fillRect(b.x+8,b.y+8,b.w-16,b.h-16);g.strokeRect(b.x+8,b.y+8,b.w-16,b.h-16);
    g.strokeStyle='rgba(28,34,48,.22)';g.lineWidth=2;for(let y=b.y+24;y<b.y+b.h-12;y+=16){g.beginPath();g.moveTo(b.x+10,y);g.lineTo(b.x+b.w-10,y);g.stroke();}
    if(b.door){g.fillStyle='#5a3b24';g.strokeStyle=INK;g.lineWidth=3;
      const dy=b.door==='s'?b.y+b.h-6:b.y-8;g.fillRect(b.x+b.w/2-18,dy,36,14);g.strokeRect(b.x+b.w/2-18,dy,36,14);}
    g.font='800 15px '+FD;g.lineWidth=4;g.strokeStyle=INK;g.fillStyle=PAPER;g.textAlign='center';
    g.strokeText(b.name,b.x+b.w/2,b.y+b.h/2+5);g.fillText(b.name,b.x+b.w/2,b.y+b.h/2+5);
  }
  function paths(g,BUILD,yTop,yBot,col){
    g.fillStyle=col||'#d6b98a';
    for(const b of BUILD){if(!b.door)continue;const dx=b.x+b.w/2-18;if(b.door==='s')g.fillRect(dx,b.y+b.h,36,Math.max(0,yTop-(b.y+b.h)));else g.fillRect(dx,yBot,36,Math.max(0,b.y-yBot));}
  }
  function trees(g,R,WW,WH,keep,pts,SOLIDS,max,col){
    const T=[];
    for(let i=0;i<max*4&&T.length<max;i++){
      const x=60+R()*(WW-120),y=60+R()*(WH-120);
      if(keep.some(k=>x>k[0]&&x<k[0]+k[2]&&y>k[1]&&y<k[1]+k[3]))continue;
      if(pts.some(p=>Math.hypot(p.x-x,p.y-y)<110))continue;
      if(T.some(t=>Math.hypot(t.x-x,t.y-y)<70))continue;
      T.push({x,y});SOLIDS.push({x:x-11,y:y-4,w:22,h:22});
    }
    for(const t of T){
      g.fillStyle='rgba(28,34,48,.25)';g.beginPath();g.ellipse(t.x+10,t.y+14,28,16,0,0,7);g.fill();
      g.fillStyle='#7a5a3a';g.fillRect(t.x-5,t.y,10,16);
      g.fillStyle=col||'#3f8a45';g.strokeStyle=INK;g.lineWidth=3;g.beginPath();g.arc(t.x,t.y-10,28,0,7);g.fill();g.stroke();
      g.fillStyle='rgba(255,255,255,.18)';g.beginPath();g.arc(t.x-7,t.y-18,13,0,7);g.fill();
    }
    return T;
  }
  function lamps(g,L){for(const l of L){g.fillStyle='#262a36';g.fillRect(l.x-2,l.y-6,4,30);g.fillStyle=SUN;g.strokeStyle=INK;g.lineWidth=2;g.beginPath();g.arc(l.x,l.y-8,6,0,7);g.fill();g.stroke();}}
  function sign(g,s,x,y,bg){g.font='800 13px '+FD;const w=g.measureText(s).width+18;g.fillStyle=INK;g.fillRect(x-w/2+3,y-13,w,24);g.fillStyle=bg||SUN;g.strokeStyle=INK;g.lineWidth=3;g.fillRect(x-w/2,y-16,w,24);g.strokeRect(x-w/2,y-16,w,24);g.fillStyle=INK;g.textAlign='center';g.fillText(s,x,y+1);}
  /* overlay (layar) */
  function box(ctx,x,y,w,h){ctx.fillStyle=INK;ctx.fillRect(x+4,y+4,w,h);ctx.fillStyle=PAPER;ctx.strokeStyle=INK;ctx.lineWidth=3;ctx.fillRect(x,y,w,h);ctx.strokeRect(x,y,w,h);}
  function txt(ctx,s,x,y,font,col,al){ctx.font=font;ctx.fillStyle=col||INK;ctx.textAlign=al||'left';ctx.fillText(s,x,y);}
  function btn(ctx,r,label,primary,f){
    ctx.fillStyle=INK;ctx.fillRect(r.x+4,r.y+4,r.w,r.h);ctx.fillStyle=primary?CORAL:'#fff';ctx.strokeStyle=INK;ctx.lineWidth=3;ctx.fillRect(r.x,r.y,r.w,r.h);ctx.strokeRect(r.x,r.y,r.w,r.h);
    txt(ctx,label,r.x+r.w/2,r.y+r.h*.66,'800 '+f+'px '+FD,INK,'center');return r;
  }
  function arrow(ctx,x,y,dx,dy,col,w){
    const L=Math.hypot(dx,dy);if(L<3)return;
    ctx.strokeStyle=INK;ctx.lineWidth=w+3;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+dx,y+dy);ctx.stroke();
    ctx.strokeStyle=col;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+dx,y+dy);ctx.stroke();
    const a=Math.atan2(dy,dx),hx=x+dx,hy=y+dy,s=w+6;
    ctx.fillStyle=col;ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(hx+Math.cos(a)*s,hy+Math.sin(a)*s);ctx.lineTo(hx+Math.cos(a+2.4)*s,hy+Math.sin(a+2.4)*s);ctx.lineTo(hx+Math.cos(a-2.4)*s,hy+Math.sin(a-2.4)*s);ctx.closePath();ctx.fill();ctx.stroke();
  }
  function plot(ctx,x,y,w,h,x0,x1,y0,y1,curves,lab,font){
    ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y+h);ctx.lineTo(x+w,y+h);ctx.stroke();
    const X=v=>x+(v-x0)/(x1-x0)*w,Y=v=>y+h-(v-y0)/(y1-y0)*h;
    ctx.save();ctx.beginPath();ctx.rect(x,y-4,w+4,h+8);ctx.clip();
    for(const c of curves){if(!c.pts||c.pts.length<2)continue;ctx.strokeStyle=c.col;ctx.lineWidth=c.w||3;ctx.setLineDash(c.dash||[]);ctx.beginPath();c.pts.forEach((p,i)=>{i?ctx.lineTo(X(p[0]),Y(p[1])):ctx.moveTo(X(p[0]),Y(p[1]));});ctx.stroke();ctx.setLineDash([]);}
    ctx.restore();
    if(lab)txt(ctx,lab,x+5,y+12,font||'700 11px '+FU);
    return {X,Y};
  }
  const inR=(r,x,y)=>r&&x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h;
  const samp=(f,a,b,n)=>{const p=[];n=n||200;for(let i=0;i<=n;i++){const t=a+(b-a)*i/n;p.push([t,f(t)]);}return p;};
  function bigText(ctx,V,s,yy,sz,col){const {W,hs}=V;ctx.textAlign='center';ctx.lineJoin='round';ctx.font='800 '+Math.round(sz*hs)+'px '+FD;ctx.lineWidth=9;ctx.strokeStyle=INK;ctx.strokeText(s,W/2,yy);ctx.fillStyle=col;ctx.fillText(s,W/2,yy);}
  function subText(ctx,V,s,yy){const {W,hs}=V;ctx.textAlign='center';ctx.lineJoin='round';ctx.font='700 '+Math.round(18*hs)+'px '+FU;ctx.lineWidth=6;ctx.strokeStyle=INK;ctx.strokeText(s,W/2,yy);ctx.fillStyle=PAPER;ctx.fillText(s,W/2,yy);}
  function skipHint(ctx,V,G){const {W,H,hs}=V;ctx.fillStyle=PAPER;ctx.font='600 '+Math.round(12*hs)+'px '+FU;ctx.textAlign='right';ctx.fillText(G.coarse?'ketuk untuk lewati':'tekan E untuk lewati',W-14,H*.89+20*hs);}
  const FR=(a,b)=>'<span class="fr"><span>'+a+'</span><span>'+b+'</span></span>';
  return {ground,building,paths,trees,lamps,sign,box,txt,btn,arrow,plot,inR,samp,bigText,subText,skipHint,FR};
}
