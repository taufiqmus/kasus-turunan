"""Uji layar penuh otomatis: HP memintanya saat Masuk, desktop tidak; petunjuk pasang ke Layar Utama hanya di HP."""
from playwright.sync_api import sync_playwright
ARGS=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']
ok=True
def cek(n,k,i=''):
    global ok;print(('OK  ' if k else 'GAGAL ')+n,'' if k else i);ok=ok and bool(k)
STUB="window.__fs=0;Element.prototype.requestFullscreen=function(){window.__fs++;return Promise.resolve();};"
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=ARGS)
    for nama,kw,hp in (('HP',dict(viewport={'width':390,'height':844},is_mobile=True,has_touch=True),True),('desktop',dict(viewport={'width':1100,'height':800}),False)):
        ctx=b.new_context(**kw);pg=ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.route('**/fonts.g*/**',lambda r:r.abort());pg.add_init_script(STUB)
        pg.goto('http://localhost:8077/integral/index.html?lokal=1&kode=LYR'+nama[:2].upper());pg.wait_for_timeout(1000)
        cek(nama+': petunjuk Layar Utama '+('tampil' if hp else 'tersembunyi'),pg.is_visible('#tip-hp')==hp)
        cek(nama+': manifest tertaut',pg.evaluate("!!document.querySelector('link[rel=manifest]')"))
        pg.fill('#in-nama','Ani')
        (pg.tap if hp else pg.click)('#b-masuk');pg.wait_for_timeout(1500)
        n=pg.evaluate('window.__fs')
        cek(nama+': layar penuh '+('diminta' if hp else 'tidak diminta')+' saat Masuk',(n>=1)==hp,n)
        cek(nama+': tanpa galat konsol',not errs,errs[:3]);ctx.close()
    b.close()
print('SEMUA LULUS' if ok else 'ADA YANG GAGAL')
