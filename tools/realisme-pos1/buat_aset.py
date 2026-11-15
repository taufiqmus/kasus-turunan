"""Ubah unduhan ambientCG (1K JPG) dan Poly Haven (HDR 1k) menjadi aset kecil di integral/aset/.
Pakai: python3 tools/realisme-pos1/buat_aset.py DIR_UNDUHAN   (isi: Concrete034/, Ground054/, Planks023A/, Rock058/, kloofendal_1k.hdr)
Warna dasar dinormalkan terang dan sedikit tak jenuh supaya warna tema (vertex color) tetap memimpin dan
tekstur hanya memberi detail. Peta normal memakai NormalGL (konvensi three.js). Tanpa AO (ditunda)."""
import sys,os,struct
import numpy as np
from PIL import Image
SRC=sys.argv[1];OUT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..','integral','aset')
os.makedirs(OUT,exist_ok=True)
# nama keluaran: (folder, awalan berkas, terang sasaran, sisa warna asli 0..1, kualitas warna)
TEK={'beton':('Concrete034',.86,.25,78),'tanah':('Ground054',.86,.30,76),'kayu':('Planks023A',None,1.0,80),'batu':('Rock058',.84,.25,76)}
def muat(d,suf):return Image.open(os.path.join(SRC,d,f'{d}_1K-JPG_{suf}.jpg'))
tot=0
for nama,(d,terang,warna,qw) in TEK.items():
    c=np.asarray(muat(d,'Color').convert('RGB').resize((512,512),Image.LANCZOS)).astype(np.float32)/255
    if terang:
        lum=(c*[.299,.587,.114]).sum(-1,keepdims=True)
        c=lum+(c-lum)*warna                       # kurangi jenuh
        c=c*(terang/max(1e-3,float(c.mean())))     # samakan rata-rata terang
        c=np.clip(c,0,1)
    p=os.path.join(OUT,nama+'.webp');Image.fromarray((c*255+.5).astype(np.uint8)).save(p,'WEBP',quality=qw,method=6)
    n=muat(d,'NormalGL').convert('RGB').resize((512,512),Image.LANCZOS)
    pn=os.path.join(OUT,nama+'_n.webp');n.save(pn,'WEBP',quality=88,method=6)
    for q in (p,pn):print(os.path.basename(q),os.path.getsize(q)//1024,'KB');tot+=os.path.getsize(q)
# ---- langit: RGBE .hdr 1k -> LDR WebP 1024x512 (peta lingkungan dan latar) ----
def baca_hdr(path):
    f=open(path,'rb').read();i=f.index(b'\n\n')+2;j=f.index(b'\n',i);h,w=[int(t) for t in f[i:j].split()[1::2]];pos=j+1
    img=np.zeros((h,w,4),np.uint8)
    for y in range(h):
        assert f[pos]==2 and f[pos+1]==2
        pos+=4
        for ch in range(4):
            x=0
            while x<w:
                n=f[pos];pos+=1
                if n>128:n-=128;img[y,x:x+n,ch]=f[pos];pos+=1
                else:img[y,x:x+n,ch]=np.frombuffer(f[pos:pos+n],np.uint8);pos+=n
                x+=n
    e=img[...,3].astype(np.float32)
    return (img[...,:3].astype(np.float32)*np.where(e>0,2.0**(e-136),0)[...,None])
H=baca_hdr(os.path.join(SRC,'kloofendal_1k.hdr'))
x=H*.9
a=np.clip((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0,1)            # ACES kasar, sama dengan tahap akhir game
a=np.where(a<=.0031308,12.92*a,1.055*a**(1/2.4)-.055)
p=os.path.join(OUT,'langit.webp');Image.fromarray((np.clip(a,0,1)*255+.5).astype(np.uint8)).save(p,'WEBP',quality=82,method=6)
print('langit.webp',os.path.getsize(p)//1024,'KB',H.shape,'maks',float(H.max()));tot+=os.path.getsize(p)
print('TOTAL',tot//1024,'KB')
