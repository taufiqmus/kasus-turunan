/* Pos 1: Tambal Waduk (versi fisik). Tim membawa balok ke kolom di depan kurva y = x^2 pada [0,3].
   Tinggi kolom = jumlah balok x 0.5. Bocor = luas celah + luas tumpah antara puncak balok dan kurva.
   Tiga babak: 3, 6, 12 kolom. Modul ini hanya logika, tanpa tampilan 3D. */
export const BABAK=[3,6,12],XMAX=3,YMAX=10,LUAS=9,UBAG=.5,MAXBAG=19,CAP=4;
const f=x=>x*x;

function bocorBalok(a,b,h){
  const N=40,dx=(b-a)/N;let s=0;
  for(let i=0;i<N;i++){const x=a+(i+.5)*dx;s+=Math.abs(h-f(x))*dx;}
  return s;
}
/* h: tinggi tiap kolom (satuan data) */
export function hitung(h){
  const n=h.length,dx=XMAX/n;let luas=0,bocor=0,min=0;
  for(let i=0;i<n;i++){
    const a=i*dx,b=a+dx,m=(a+b)/2;
    luas+=h[i]*dx;bocor+=bocorBalok(a,b,h[i]);min+=bocorBalok(a,b,f(m));
  }
  const skor=Math.round(100*Math.max(0,Math.min(1,1-(bocor-min)/(LUAS-min))));
  return {luas,bocor,min,skor};
}
export const tinggi=c=>c.map(v=>v*UBAG);
export const skorRonde=c=>hitung(tinggi(c));
export const stateBaru=()=>({r:0,c:Array(BABAK[0]).fill(0),sr:[]});
export const selesai=st=>st.r>=BABAK.length;
export function skorTim(st){
  if(!selesai(st))return null;
  let s=0;for(const c of st.sr)s+=skorRonde(c).skor;
  return Math.round(s/BABAK.length);
}
/* kiriman dari jaringan tidak dipercaya */
const bil=(v,a,b)=>Number.isInteger(v)&&v>=a&&v<=b;
export function cValid(r,c){return Array.isArray(c)&&r<BABAK.length&&c.length===BABAK[r]&&c.every(v=>bil(v,0,MAXBAG));}
export function valid(s){
  if(!s||typeof s!=='object'||!bil(s.r,0,BABAK.length)||!Array.isArray(s.sr)||s.sr.length!==s.r)return false;
  for(let i=0;i<s.r;i++)if(!cValid(i,s.sr[i]))return false;
  return s.r>=BABAK.length?Array.isArray(s.c)&&s.c.length===0:cValid(s.r,s.c);
}
export const jumlah=c=>c.reduce((a,b)=>a+b,0);

/* grafik mini hanya-baca untuk HUD */
export function gambarMini(cv,st,warna){
  const g=cv.getContext('2d'),W=cv.width,H=cv.height,pl=22,pb=14,pt=6,pr=6;
  const r=Math.min(st.r,BABAK.length-1),c=st.r>=BABAK.length?st.sr[BABAK.length-1]:st.c,n=c.length,dx=XMAX/n;
  const X=x=>pl+x/XMAX*(W-pl-pr),Y=y=>H-pb-y/YMAX*(H-pb-pt);
  g.clearRect(0,0,W,H);g.fillStyle='#fffdf6';g.fillRect(0,0,W,H);
  g.strokeStyle='#e5dcc6';g.lineWidth=1;g.fillStyle='#1c2230';g.font='10px sans-serif';g.textAlign='right';g.textBaseline='middle';
  for(let y=0;y<=YMAX;y+=3){g.beginPath();g.moveTo(X(0),Y(y));g.lineTo(X(XMAX),Y(y));g.stroke();g.fillText(String(y),pl-3,Y(y));}
  for(let i=0;i<n;i++){
    const h=c[i]*UBAG,x0=X(i*dx),x1=X((i+1)*dx);
    g.fillStyle=warna+'bb';g.fillRect(x0,Y(h),x1-x0,Y(0)-Y(h));
    g.strokeStyle='#1c2230';g.lineWidth=1;g.strokeRect(x0,Y(h),x1-x0,Y(0)-Y(h));
  }
  g.strokeStyle='#e5392b';g.lineWidth=2;g.beginPath();
  for(let k=0;k<=30;k++){const x=k/30*XMAX;k?g.lineTo(X(x),Y(f(x))):g.moveTo(X(x),Y(f(x)));}
  g.stroke();
  g.strokeStyle='#1c2230';g.lineWidth=2;g.strokeRect(X(0),Y(YMAX),X(XMAX)-X(0),Y(0)-Y(YMAX));
}
