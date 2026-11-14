/* Pos 1: Tambal Waduk. Tim menyusun balok di bawah kurva y = x^2 pada [0,3].
   Bocor = luas celah + luas tumpah antara puncak balok dan kurva. Tiga babak: 3, 6, 12 balok. */
export const BABAK=[3,6,12],XMAX=3,YMAX=10,LUAS=9;
const f=x=>x*x;

function bocorBalok(a,b,h){
  const N=40,dx=(b-a)/N;let s=0;
  for(let i=0;i<N;i++){const x=a+(i+.5)*dx;s+=Math.abs(h-f(x))*dx;}
  return s;
}
export function hitung(h){
  const n=h.length,dx=XMAX/n;let luas=0,bocor=0,min=0;
  for(let i=0;i<n;i++){
    const a=i*dx,b=a+dx,m=(a+b)/2;
    luas+=h[i]*dx;bocor+=bocorBalok(a,b,h[i]);min+=bocorBalok(a,b,f(m));
  }
  const skor=Math.round(100*Math.max(0,Math.min(1,1-(bocor-min)/(LUAS-min))));
  return {luas,bocor,min,skor};
}
export function stateBaru(){return {b:0,h:BABAK.map(n=>Array(n).fill(0)),oleh:BABAK.map(n=>Array(n).fill('')),kunci:[false,false,false],t0:0,t1:0};}
export function skorTim(st){
  let s=0;for(let r=0;r<BABAK.length;r++)s+=st.kunci[r]?hitung(st.h[r]).skor:0;
  return Math.round(s/BABAK.length);
}

/* UI panel. opsi: {el, tim, warna, nama, state, kirim(ev,p), selesai(skor), tutup()} */
export function buatPanel(o){
  const $=s=>o.el.querySelector(s);
  const cv=$('#w-cv'),g=cv.getContext('2d');
  let W=0,H=0,pad={l:38,r:12,t:12,b:28},drag=false,lastSend=0,pend=null;
  const st=o.state;

  function ukur(){
    const r=cv.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);
    W=r.width;H=r.height;cv.width=Math.round(W*d);cv.height=Math.round(H*d);g.setTransform(d,0,0,d,0,0);
  }
  const X=x=>pad.l+x/XMAX*(W-pad.l-pad.r),Y=y=>H-pad.b-y/YMAX*(H-pad.t-pad.b);
  const iX=px=>(px-pad.l)/(W-pad.l-pad.r)*XMAX,iY=py=>(H-pad.b-py)/(H-pad.t-pad.b)*YMAX;

  function gambar(){
    if(!W)ukur();
    const r=st.b,n=BABAK[r],h=st.h[r],dx=XMAX/n;
    g.clearRect(0,0,W,H);g.fillStyle='#fffdf6';g.fillRect(0,0,W,H);
    g.strokeStyle='#e5dcc6';g.lineWidth=1;g.fillStyle='#1c2230';g.font='12px "Chakra Petch",sans-serif';
    g.textAlign='right';g.textBaseline='middle';
    for(let y=0;y<=YMAX;y+=2){g.beginPath();g.moveTo(X(0),Y(y));g.lineTo(X(XMAX),Y(y));g.stroke();g.fillText(String(y),pad.l-6,Y(y));}
    g.textAlign='center';g.textBaseline='top';
    for(let x=0;x<=XMAX;x++){g.beginPath();g.moveTo(X(x),Y(0));g.lineTo(X(x),Y(YMAX));g.stroke();g.fillText(String(x),X(x),H-pad.b+6);}
    for(let i=0;i<n;i++){
      const a=i*dx,b=a+dx,x0=X(a),x1=X(b);
      g.fillStyle=o.warna+'bb';g.fillRect(x0,Y(h[i]),x1-x0,Y(0)-Y(h[i]));
      /* celah (biru) dan tumpah (merah) */
      const S=24;
      for(let k=0;k<S;k++){
        const xa=a+k*(b-a)/S,xm=xa+(b-a)/S/2,fy=Math.min(f(xm),YMAX),px=X(xa),pw=X(xa+(b-a)/S)-px+.5;
        if(h[i]>fy){g.fillStyle='rgba(229,57,43,.55)';g.fillRect(px,Y(h[i]),pw,Y(fy)-Y(h[i]));}
        else{g.fillStyle='rgba(47,127,193,.35)';g.fillRect(px,Y(fy),pw,Y(h[i])-Y(fy));}
      }
      g.strokeStyle='#1c2230';g.lineWidth=2;g.strokeRect(x0,Y(h[i]),x1-x0,Y(0)-Y(h[i]));
      if(st.oleh[r][i]&&x1-x0>18){g.fillStyle='#1c2230';g.textBaseline='bottom';g.font='700 11px "Chakra Petch",sans-serif';g.fillText(st.oleh[r][i].slice(0,2).toUpperCase(),(x0+x1)/2,Y(Math.max(h[i],.05))-3);}
    }
    g.strokeStyle='#1c2230';g.lineWidth=3;g.beginPath();
    for(let i=0;i<=60;i++){const x=i/60*XMAX,y=Math.min(f(x),YMAX);i?g.lineTo(X(x),Y(y)):g.moveTo(X(x),Y(y));}
    g.stroke();
    const c=hitung(h);
    $('#w-babak').textContent='Babak '+(r+1)+' dari 3: '+n+' balok';
    $('#w-luas').textContent=c.luas.toFixed(2);
    $('#w-bocor').textContent=c.bocor.toFixed(2);
    $('#w-meter').style.width=Math.max(2,Math.min(100,c.bocor/LUAS*100))+'%';
    $('#w-kunci').disabled=st.kunci[r];
  }

  function setel(e){
    const r=st.b;if(st.kunci[r])return;
    const rc=cv.getBoundingClientRect(),n=BABAK[r];
    const i=Math.max(0,Math.min(n-1,Math.floor(iX(e.clientX-rc.left)/(XMAX/n))));
    const hv=Math.round(Math.max(0,Math.min(YMAX,iY(e.clientY-rc.top)))*10)/10;
    if(st.h[r][i]===hv)return;
    if(!st.t0)st.t0=Date.now();
    st.h[r][i]=hv;st.oleh[r][i]=o.nama;gambar();
    pend={t:o.tim,r,i,h:hv,by:o.nama,t0:st.t0};
    const now=performance.now();
    if(now-lastSend>90){o.kirim('w',pend);pend=null;lastSend=now;}
  }
  cv.addEventListener('pointerdown',e=>{drag=true;cv.setPointerCapture(e.pointerId);setel(e);});
  cv.addEventListener('pointermove',e=>{if(drag)setel(e);});
  const lepas=()=>{drag=false;if(pend){o.kirim('w',pend);pend=null;lastSend=performance.now();}};
  cv.addEventListener('pointerup',lepas);cv.addEventListener('pointercancel',lepas);

  function kunciLokal(r){
    if(st.kunci[r])return;
    st.kunci[r]=true;
    if(r<BABAK.length-1){st.b=r+1;gambar();}
    else{st.t1=st.t1||Date.now();hasil();}
  }
  $('#w-kunci').addEventListener('click',()=>{const r=st.b;o.kirim('wk',{t:o.tim,r,t1:Date.now()});kunciLokal(r);});
  $('#w-tutup').addEventListener('click',()=>o.tutup());
  $('#w-tutup2').addEventListener('click',()=>o.tutup());

  function hasil(){
    $('#w-main').hidden=true;$('#w-hasil').hidden=false;
    const tb=$('#w-tabel');tb.innerHTML='<tr><th>Babak</th><th>Balok</th><th>Taksiran luas</th><th>Bocor</th><th>Skor</th></tr>';
    BABAK.forEach((n,r)=>{
      const c=hitung(st.h[r]),tr=document.createElement('tr');
      [r+1,n,c.luas.toFixed(2),c.bocor.toFixed(2),c.skor].forEach(v=>{const td=document.createElement('td');td.textContent=v;tr.append(td);});
      tb.append(tr);
    });
    const s=skorTim(st);
    $('#w-skor').textContent=s;
    const dt=st.t0&&st.t1?Math.max(0,Math.round((st.t1-st.t0)/1000)):0;
    $('#w-waktu').textContent=dt?('Waktu tim: '+dt+' detik (belum dihitung ke skor di prototipe).'):'';
    o.selesai(s);
  }

  const api={
    buka(){o.el.hidden=false;if(st.kunci[BABAK.length-1])hasil();else{$('#w-main').hidden=false;$('#w-hasil').hidden=true;ukur();gambar();}},
    ukur(){if(!o.el.hidden&&!$('#w-main').hidden){ukur();gambar();}},
    /* pesan dari anggota tim lain */
    terima(ev,p){
      if(p.t!==o.tim)return;
      if(ev==='w'){
        if(st.kunci[p.r])return;
        st.h[p.r][p.i]=p.h;st.oleh[p.r][p.i]=p.by;if(p.t0&&(!st.t0||p.t0<st.t0))st.t0=p.t0;
        if(!o.el.hidden&&st.b===p.r)gambar();
      }else if(ev==='wk'){
        if(p.r===BABAK.length-1&&p.t1)st.t1=st.t1||p.t1;
        const terbuka=!o.el.hidden;
        if(!st.kunci[p.r]){st.kunci[p.r]=true;if(p.r<BABAK.length-1){st.b=Math.max(st.b,p.r+1);if(terbuka)gambar();}else if(terbuka)hasil();else o.selesai(skorTim(st));}
      }
    },
    gabung(s){ /* state dari anggota yang lebih dulu masuk */
      if(!s)return;
      for(let r=0;r<BABAK.length;r++){
        if(s.kunci[r]&&!st.kunci[r]){st.h[r]=s.h[r].slice();st.oleh[r]=s.oleh[r].slice();st.kunci[r]=true;}
        else if(!st.kunci[r]&&s.h[r].some(v=>v>0)&&!st.h[r].some(v=>v>0)){st.h[r]=s.h[r].slice();st.oleh[r]=s.oleh[r].slice();}
      }
      st.b=Math.max(st.b,s.b);if(s.t0&&(!st.t0||s.t0<st.t0))st.t0=s.t0;if(s.t1)st.t1=st.t1||s.t1;
      if(!o.el.hidden){if(st.kunci[BABAK.length-1])hasil();else gambar();}
    }
  };
  return api;
}
