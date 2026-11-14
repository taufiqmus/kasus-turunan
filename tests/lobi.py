"""Uji asap lobi integral: dua pemain setim + satu tim lain, mode luring (BroadcastChannel)."""
from playwright.sync_api import sync_playwright
import sys,json
URL='http://localhost:8077/integral/index.html?lokal=1'
ARGS=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']
def masuk(ctx,nama,tim,errs,mobile=False):
    pg=ctx.new_page()
    pg.on('pageerror',lambda e:errs.append(nama+': '+str(e)))
    pg.on('console',lambda m:errs.append(nama+': '+m.text) if m.type=='error' and 'ERR_' not in m.text and 'Failed to load' not in m.text else None)
    pg.route('**/fonts.g*/**',lambda r:r.abort())
    pg.goto(URL);pg.fill('#in-nama',nama);pg.click(f'#in-tim .tab[data-t="{tim}"]');pg.click('#b-masuk');pg.wait_for_timeout(900)
    return pg
def geser(pg,i,n,h):
    b=pg.locator('#w-cv').bounding_box()
    x=b['x']+38+(i+.5)/n*(b['width']-38-12);y=b['y']+b['height']-28-h/10*(b['height']-12-28)
    pg.mouse.move(x,y);pg.mouse.down();pg.mouse.move(x,y+1);pg.mouse.move(x,y);pg.mouse.up()
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=ARGS)
    ctx=b.new_context(viewport={'width':1000,'height':620});errs=[];ok=True
    def cek(nama,kond,info=''):
        global ok;print(('OK  ' if kond else 'GAGAL ')+nama,info);ok=ok and kond
    A=masuk(ctx,'Ani','merah',errs);B=masuk(ctx,'Budi','merah',errs);C=masuk(ctx,'Citra','biru',errs)
    A.wait_for_timeout(2500)
    cek('A melihat 2 pemain lain',A.evaluate('__L.pemain.size')==2)
    cek('C melihat 2 pemain lain',C.evaluate('__L.pemain.size')==2)
    cek('mode luring',A.evaluate('__L.rt.mode')=='luring')
    # gerak dan sinkron posisi
    A.evaluate('__L.tp(5,5);__L.kirimPosisi()');B.bring_to_front();B.wait_for_timeout(900)
    pos=B.evaluate('(()=>{const q=[...__L.pemain.values()].find(p=>p.nama==="Ani");return [q.x,q.z]})()')
    cek('posisi Ani sampai ke Budi',abs(pos[0]-5)<.3 and abs(pos[1]-5)<.3,pos)
    A.bring_to_front();A.keyboard.down('d');A.wait_for_timeout(600);A.keyboard.up('d');x=A.evaluate('__L.me.x')
    cek('WASD menggerakkan avatar',x>7,x)
    # gerbang
    g=A.evaluate('__L.gerbang[0]');A.evaluate(f"__L.tp({g['x']},{g['z']})");A.wait_for_timeout(300)
    cek('tombol Pos 1 muncul',A.is_visible('#aksi'))
    A.click('#aksi');A.wait_for_timeout(300)
    cek('panel waduk terbuka',A.is_visible('#w-cv'))
    B.evaluate(f"__L.tp({g['x']},{g['z']})");B.bring_to_front();B.wait_for_timeout(400);B.click('#aksi');B.wait_for_timeout(300)
    # babak 1: Ani isi balok 0 dan 1, Budi isi balok 2
    A.bring_to_front();geser(A,0,3,.3);geser(A,1,3,2.3);B.bring_to_front();geser(B,2,3,6.3);A.bring_to_front();A.wait_for_timeout(500)
    ha=A.evaluate('__L.waduk.h[0]');hb=B.evaluate('__L.waduk.h[0]')
    cek('waduk tim tersinkron dua arah',ha==hb and ha[2]>6,(ha,hb))
    cek('tim lain tidak ikut berubah',C.evaluate('__L.waduk.h[0]')==[0,0,0])
    A.screenshot(path='/tmp/lobi-pos1.png')
    A.click('#w-kunci');A.wait_for_timeout(400)
    cek('kunci babak menular ke Budi',B.evaluate('__L.waduk.b')==1 and '6 balok' in B.inner_text('#w-babak'))
    B.bring_to_front()
    for i in range(6):geser(B,i,6,((i+.5)*.5)**2)
    B.click('#w-kunci');B.wait_for_timeout(300)
    A.bring_to_front()
    for i in range(12):geser(A,i,12,((i+.5)*.25)**2)
    A.click('#w-kunci');A.wait_for_timeout(600)
    cek('hasil tampil di A dan B',A.is_visible('#w-hasil') and B.is_visible('#w-hasil'))
    sa=A.evaluate('__L.skor');sc=C.evaluate('__L.skor')
    cek('skor tim sampai ke tim lain',sa.get('merah')==sc.get('merah') and sa.get('merah',0)>80,(sa,sc))
    print('tabel:',A.inner_text('#w-tabel').replace('\n',' | ').replace('\t',' '))
    # pemain baru setim mendapat state
    D=masuk(ctx,'Dedi','merah',errs);D.wait_for_timeout(1500)
    cek('pendatang baru menerima state tim dan skor',D.evaluate('__L.waduk.kunci')==[True,True,True] and D.evaluate('__L.skor.merah')==sa['merah'])
    # keluar
    B.close();A.bring_to_front();A.wait_for_timeout(7000)
    cek('pemain keluar hilang dari lobi',A.evaluate('[...__L.pemain.values()].some(p=>p.nama==="Budi")')==False)
    # bot dan audit
    A.click('#w-tutup2');A.click('#b-audit');A.click('#a-bot');A.wait_for_timeout(4500)
    cek('20 bot ditambahkan',A.evaluate('[...__L.pemain.values()].filter(p=>p.bot).length')==20)
    print('audit:',A.inner_text('#audit dl').replace('\n',' '))
    A.screenshot(path='/tmp/lobi-3d.png')
    # tampilan HP
    m=b.new_context(viewport={'width':390,'height':780},has_touch=True,is_mobile=True,device_scale_factor=2)
    M=masuk(m,'Eka','hijau',errs);M.touchscreen.tap(100,600);M.wait_for_timeout(300)
    M.evaluate(f"__L.tp({g['x']},{g['z']})");M.wait_for_timeout(300);M.screenshot(path='/tmp/lobi-hp.png');M.tap('#aksi');M.wait_for_timeout(300);M.screenshot(path='/tmp/lobi-hp-pos1.png')
    cek('panel pas di layar HP',M.evaluate("(()=>{const r=document.querySelector('#w-kunci').getBoundingClientRect();return r.bottom<=innerHeight&&r.right<=innerWidth})()"))
    cek('tanpa galat konsol',not errs,errs[:5])
    b.close();sys.exit(0 if ok else 1)
