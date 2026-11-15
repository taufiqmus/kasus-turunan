"""Adegan problem statement: grafik animasi 2D. Menulis /tmp/vid/f_m/%04d.png (1280x720, bar sinematik)."""
import os,math
from PIL import Image,ImageDraw,ImageFont
W,H=1280,720;AY=92;AH=536;S=2;FPS=24;DUR=14.0
FB='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';FR='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
def F(p,s):return ImageFont.truetype(p,int(s*S))
BG=(15,22,36);INK=(244,236,220);GOLD=(255,200,87);BLUE=(96,170,230);RED=(240,96,76);GRID=(40,54,78)
# grafik: x 0..3, y 0..9 di kotak (gx0,gy0)-(gx1,gy1)
gx0,gx1,gy0,gy1=700,1200,AY+70,AY+AH-70
X=lambda x:gx0+x/3*(gx1-gx0);Y=lambda y:gy1-y/9*(gy1-gy0)
def ease(u):u=max(0,min(1,u));return u*u*(3-2*u)
def seg(t,a,b):return ease((t-a)/(b-a))
os.makedirs('/tmp/vid/f_m',exist_ok=True)
def teks(d,xy,s,f,fill,alpha=1,anchor='la'):
    if alpha<=0.01:return
    c=tuple(int(BG[i]+(fill[i]-BG[i])*alpha) for i in range(3))
    d.text((xy[0]*S,xy[1]*S),s,font=f,fill=c,anchor=anchor)
def kiri(n):return [ (i*3/n)**2 for i in range(n)]
for fr in range(int(DUR*FPS)):
    t=fr/FPS
    im=Image.new('RGB',(W*S,H*S),BG);d=ImageDraw.Draw(im)
    # kisi halus
    for x in range(0,4):d.line([(X(x)*S,gy1*S),(X(x)*S,gy0*S)],fill=GRID,width=S)
    for y in range(0,10,3):d.line([(gx0*S,Y(y)*S),(gx1*S,Y(y)*S)],fill=GRID,width=S)
    # luas di bawah kurva
    ua=seg(t,1.0,3.6)
    if ua>0:
        pts=[(X(0),Y(0))]+[(X(3*ua*k/60),Y((3*ua*k/60)**2)) for k in range(61)]+[(X(3*ua),Y(0))]
        ov=Image.new('RGBA',im.size,(0,0,0,0));od=ImageDraw.Draw(ov)
        od.polygon([(a*S,b*S) for a,b in pts],fill=BLUE+(70,))
        im.paste(Image.alpha_composite(im.convert('RGBA'),ov).convert('RGB'));d=ImageDraw.Draw(im)
    # kolom
    def kolom(n,alpha,warna):
        ov=Image.new('RGBA',im.size,(0,0,0,0));od=ImageDraw.Draw(ov);dx=3/n
        for i,h in enumerate(kiri(n)):
            x0,x1=X(i*dx),X((i+1)*dx);y0,y1=Y(0),Y(h)
            od.rectangle([x0*S,y1*S,x1*S,y0*S],fill=warna+(int(120*alpha),),outline=warna+(int(255*alpha),),width=S)
        return ov
    k3=seg(t,6.0,7.4)*(1-seg(t,10.2,10.8))
    k12=seg(t,10.4,11.8)
    for n,a,w in ((3,k3,RED),(12,k12,GOLD)):
        if a>0.01:
            im=Image.alpha_composite(im.convert('RGBA'),kolom(n,a,w)).convert('RGB');d=ImageDraw.Draw(im)
    # kurva
    pts=[(X(3*ua*k/80),Y((3*ua*k/80)**2)) for k in range(81)]
    if ua>0:d.line([(a*S,b*S) for a,b in pts],fill=INK,width=int(3*S),joint='curve')
    # sumbu
    d.line([(gx0*S,gy0*S),(gx0*S,gy1*S),(gx1*S,gy1*S)],fill=INK,width=2*S)
    ax=seg(t,0.6,1.4)
    for x in range(4):teks(d,(X(x),gy1+8),str(x),F(FR,16),INK,ax,'ma')
    for y in (3,6,9):teks(d,(gx0-10,Y(y)),str(y),F(FR,16),INK,ax,'rm')
    teks(d,(X(2.2),Y(5.2)),'y = x²',F(FB,24),INK,seg(t,3.0,3.8),'la')
    # kolom kiri: teks
    teks(d,(70,AY+54),'MASALAH',F(FB,20),GOLD,seg(t,0.2,0.9))
    teks(d,(70,AY+104),'Daerah di bawah kurva',F(FR,30),INK,seg(t,1.2,2.0))
    teks(d,(70,AY+146),'y = x²,  dari x = 0 sampai x = 3',F(FB,30),INK,seg(t,1.8,2.6))
    teks(d,(70,AY+214),'Berapa luasnya,',F(FB,40),GOLD,seg(t,4.0,4.8))
    teks(d,(70,AY+262),'tanpa rumus integral?',F(FB,40),GOLD,seg(t,4.3,5.1))
    a6=seg(t,6.0,6.8)*(1-seg(t,9.6,10.2))
    teks(d,(70,AY+340),'Idenya: tambal daerah itu',F(FR,28),INK,a6);teks(d,(70,AY+376),'dengan kolom balok.',F(FR,28),INK,a6)
    a10=seg(t,10.2,11.0)*(1-seg(t,13.4,14.0))
    teks(d,(70,AY+340),'Makin banyak kolom,',F(FR,28),INK,a10);teks(d,(70,AY+376),'makin dekat ke luas sebenarnya.',F(FR,28),INK,a10)
    # hitungan
    teks(d,(gx0+10,AY+36),'3 kolom: luas 5',F(FB,24),RED,seg(t,7.0,7.8)*(1-seg(t,10.4,10.9)),'la')
    teks(d,(gx0+10,AY+36),'12 kolom: luas ≈ 7,9',F(FB,24),GOLD,seg(t,11.2,12.0)*(1-seg(t,12.6,13.1)),'la')
    teks(d,(gx0+10,AY+36),'Luas sebenarnya = 9',F(FB,26),BLUE,seg(t,13.0,13.7),'la')
    # bar sinematik
    d.rectangle([0,0,W*S,AY*S],fill=(0,0,0));d.rectangle([0,(AY+AH)*S,W*S,H*S],fill=(0,0,0))
    out=im.resize((W,H),Image.LANCZOS)
    # fade masuk keluar
    g=min(1,t/0.4,(DUR-t)/0.4)
    if g<1:out=Image.eval(out,lambda v:int(v*g))
    out.save(f'/tmp/vid/f_m/{fr:04d}.png')
print('selesai masalah',int(DUR*FPS))
