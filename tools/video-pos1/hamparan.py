from PIL import Image,ImageDraw,ImageFont
W,H=1280,720;AY=92
FB='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';FR='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
GOLD=(255,200,87,255);INK=(244,236,220,255)
def f(p,s):return ImageFont.truetype(p,s)
def lebar(d,xy,s,font,fill,gap=0,anchor='l'):
    # teks berjarak huruf
    w=sum(d.textlength(c,font=font)+gap for c in s)-gap
    x=xy[0]-(w/2 if anchor=='m' else 0);y=xy[1]
    for c in s:
        d.text((x,y),c,font=font,fill=fill,anchor='ls');x+=d.textlength(c,font=font)+gap
def dasar():
    im=Image.new('RGBA',(W,H),(0,0,0,0));d=ImageDraw.Draw(im)
    d.rectangle([0,0,W,AY],fill=(0,0,0,255));d.rectangle([0,H-AY,W,H],fill=(0,0,0,255))
    lebar(d,(60,56),'LOBI INTEGRAL  ·  POS 1  TAMBAL WADUK',f(FB,15),GOLD,2.2)
    return im,d
def kapsyen(nama,teks,sub=None):
    im,d=dasar()
    d.text((W/2,H-AY/2+(0 if not sub else -10)),teks,font=f(FR,27),fill=INK,anchor='mm')
    if sub:d.text((W/2,H-AY/2+22),sub,font=f(FR,18),fill=GOLD,anchor='mm')
    im.save(f'/tmp/vid/ov_{nama}.png')
# pembuka: judul besar
im,d=dasar()
g=Image.new('RGBA',(W,H),(0,0,0,0));gd=ImageDraw.Draw(g)
for i in range(120):gd.rectangle([0,380+i*1.6,W,H-AY],fill=(0,0,0,int(2.2*i)))
im=Image.alpha_composite(g,im);d=ImageDraw.Draw(im)
d.rectangle([0,0,W,AY],fill=(0,0,0,255));d.rectangle([0,H-AY,W,H],fill=(0,0,0,255))
lebar(d,(W/2,470),'LOBI INTEGRAL',f(FB,22),GOLD,9,'m')
lebar(d,(W/2,545),'POS 1',f(FB,64),INK,14,'m')
lebar(d,(W/2,590),'TAMBAL WADUK',f(FB,30),INK,10,'m')
im.save('/tmp/vid/ov_a.png')
kapsyen('b','Di dinding waduk terpampang soalnya: kurva dan aturan titik contoh.')
kapsyen('c','1. Ambil balok dari gudang.')
kapsyen('d','2. Pasang balok. Tinggi kolom = nilai y di titik kiri kolom.','Satu balok = 0,5')
kapsyen('e','3. Kurva dibuka: taksiran 5, luas sebenarnya 9. Ada celah.')
kapsyen('f','4. Makin banyak kolom, makin dekat ke luas sebenarnya.')
# penutup
im=Image.new('RGB',(W,H),(0,0,0));d=ImageDraw.Draw(im)
d2=ImageDraw.Draw(im)
lebar(d2,(W/2,300),'POS 1  SELESAI',f(FB,44),(255,200,87),10,'m')
d2.text((W/2,365),'Main bareng tim, tiga babak, tiap babak kurva berbeda.',font=f(FR,26),fill=(244,236,220),anchor='mm')
d2.text((W/2,425),'Masih ada 5 pos lagi menuju Puncak Final.',font=f(FR,22),fill=(190,184,170),anchor='mm')
d2.text((W/2,520),'taufiqmus.github.io/kasus-turunan/integral',font=f(FB,24),fill=(255,200,87),anchor='mm')
im.save('/tmp/vid/outro.png')
print('ok')
