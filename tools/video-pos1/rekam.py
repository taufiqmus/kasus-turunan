"""Rekam adegan Pos 1 frame demi frame dengan jam palsu. Pakai: python3 rekam.py ID [uji]"""
import sys,os,math,json
from playwright.sync_api import sync_playwright
ARGS=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']
ID=sys.argv[1];UJI=len(sys.argv)>2
FPS=24
def lerp(a,b,u):return [x+(y-x)*u for x,y in zip(a,b)]
def ease(u):return u*u*(3-2*u)
# id: (jumlah frame, fungsi(u)->(pos,look,fov), keadaan)
S={
 'a':(72,lambda u:(lerp([0,1.5,27],[0,8.5,35],ease(u)),lerp([0,4.6,-3],[0,5.6,-3],ease(u)),42),{'n':3,'bags':[0,0,0]}),
 'b':(72,lambda u:(lerp([-13,5.5,16],[-4.5,5,9.5],ease(u)),lerp([-2,4.8,-2.2],[0,4.2,-2.2],ease(u)),36),{'n':3,'bags':[0,0,0]}),
 'c':(72,None,{'n':3,'bags':[0,0,0],'jalan':True}),
 'd':(96,lambda u:(lerp([-12,4.2,13],[12,5,13],ease(u)),[0,2.4,2.4],38),{'n':3,'bags':'bangun'}),
 'e':(72,lambda u:(lerp([0,4.6,15],[0,6.2,23],ease(u)),lerp([0,4,0],[0,4.4,0],ease(u)),40),{'n':3,'bags':[0,2,8],'kurva':True}),
 'f':(72,lambda u:(lerp([-16,3.4,10],[-5,4.2,9],ease(u)),[0,3.6,2.4],42),{'n':12,'bags':'dua','kurva':True}),
}
N,kam,ks=S[ID]
if UJI:N=2
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=ARGS)
    ctx=b.new_context(viewport={'width':160,'height':90})
    pg=ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.route('**/fonts.g*/**',lambda r:r.abort())
    pg.clock.install()
    pg.goto('http://localhost:8077/integral/index.html?lokal=1&kode=VID29&sutradara=1')
    pg.clock.run_for(500)
    pg.fill('#in-nama','Ani');pg.click('#in-tim .tab[data-t="merah"]');pg.click('#b-masuk');pg.clock.run_for(2500)
    pg.evaluate("__L.setGrafis(3,'s',true)")
    pg.add_style_tag(content="#lhud,#arhud,#ar2,#peta,#stam,#b-lari,#b-lompat,#joy-tips,#aksi,#ltoast,#c-koin,#b-pos,#b-kam,#b-menu,#boost,#roda,#rev,#hasil,#w-pos,.modal{display:none!important}")
    g=pg.evaluate('__L.gerbang[0]');pg.evaluate(f"__L.tp({g['x']},{g['z']})");pg.clock.run_for(500)
    pg.keyboard.press('f');pg.clock.run_for(2500)
    n=ks['n']
    # papan sesuai soal: y = x^2, titik kiri
    xs=[i*3/n for i in range(n)]
    pg.evaluate("""([n,xs,kv])=>{const f=__L.P1.KURVA[0].f;__L.arena.setBabak({n,xs,rumus:'y = x²',aturan:'Tinggi kolom = nilai y di titik kiri kolom',fKurva:kv?f:null});}""",[n,xs,bool(ks.get('kurva'))])
    pg.evaluate("__L.me.grp.traverse(o=>{if(o.isSprite)o.visible=false})")
    if ks.get('jalan'):pg.evaluate("__L.tp(6.2,6.2)")
    elif ID=='d':pg.evaluate("__L.tp(-11.5,3.6)")
    else:pg.evaluate("__L.tp(24,9)")
    def bags_untuk(u):
        k=ks['bags']
        if k=='bangun':
            t=min(1,max(0,(u-.08)/.8));return [0,round(2*t),round(8*t)]
        if k=='dua':
            return [round(max(0,xs[i]**2)/.5) for i in range(n)]
        return k
    pg.evaluate("__L.tahan=true") if False else None
    pg.set_viewport_size({'width':1280,'height':720});pg.clock.run_for(120)
    os.makedirs(f'/tmp/vid/f_{ID}',exist_ok=True)
    ms=0.0;last=None
    for f in range(N):
        u=f/max(1,(72 if UJI else N)-1) if not UJI else .5+f*.0
        if UJI:u=.7
        bg=bags_untuk(u)
        if bg!=last:pg.evaluate("c=>__L.arena.setBags(c)",bg);last=bg
        if ks.get('jalan'):
            P=lerp([-1.5,3.0,16.5],[1.0,3.0,15.5],ease(u));L=[0,2.2,3.0];fov=42
            pg.evaluate('x=>{__L.me.x=x;__L.me.z=6.2;}',6.0-11.0*u)
            # bawa balok di tangan
            pg.evaluate("__L.me.carry=2")
        else:
            P,L,fov=kam(u)
        pg.evaluate("([p,l,f,v,h])=>{window.__KAM={p,l,fov:f,sembunyi:h};if(v)Object.assign(window.__KAM,{vx:-3.6,vz:0});}",[P,L,fov,bool(ks.get('jalan')),ID in ('e','f')])
        ms+=1000/FPS;step=int(round(ms));ms-=step
        pg.clock.run_for(step)
        pg.screenshot(path=f'/tmp/vid/f_{ID}/{f:04d}.jpg' if not UJI else f'/tmp/vid/uji_{ID}_{f}.jpg',type='jpeg',quality=90)
        if f%12==0:print(ID,f,N,flush=True)
    print('selesai',ID,errs[:2],flush=True)
    b.close()
