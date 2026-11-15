"""Uji kenyamanan HP: emulasi layar sentuh. Pakai: python3 tests/hp.py LEBAR TINGGI TAG (contoh 390 844 t, 844 390 l)."""
import sys
from playwright.sync_api import sync_playwright
ARGS=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']
W,H=(int(sys.argv[1]),int(sys.argv[2])) if len(sys.argv)>2 else (390,844);tag=sys.argv[3] if len(sys.argv)>3 else 't'
ok=True
def cek(n,k,i=''):
    global ok;print(('OK  ' if k else 'GAGAL ')+n,'' if k else i);ok=ok and bool(k)
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=ARGS)
    ctx=b.new_context(viewport={'width':W,'height':H},device_scale_factor=2,is_mobile=True,has_touch=True)
    pg=ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.route('**/fonts.g*/**',lambda r:r.abort())
    pg.goto('http://localhost:8077/integral/index.html?lokal=1&kode=HPUJ2');pg.wait_for_timeout(1200)
    pg.fill('#in-nama','Ani');pg.tap('#b-masuk');pg.wait_for_timeout(2500)
    cek('mode HP aktif',pg.evaluate("document.body.classList.contains('hp')"))
    cek('petunjuk joystick tampil',pg.is_visible('#joy-tips'))
    cek('tombol Grafis tersembunyi di menu',not pg.is_visible('#b-grafis'))
    pg.tap('#b-menu');pg.wait_for_timeout(300)
    cek('menu membuka Grafis dan Layar penuh',pg.is_visible('#b-grafis') and pg.is_visible('#b-layar'))
    pg.tap('#b-grafis');pg.wait_for_timeout(300);cek('panel grafis terbuka',pg.is_visible('#grafis'))
    pg.screenshot(path=f'/tmp/hp-{tag}-menu.png')
    pg.tap('#b-menu');pg.wait_for_timeout(300);cek('menu tertutup beserta panel',not pg.is_visible('#grafis') and not pg.is_visible('#b-grafis'))
    # joystick: sentuh dan geser di kiri bawah
    cdp=ctx.new_cdp_session(pg)
    x0,y0=W*.2,H*.8;z0=pg.evaluate('__L.me.z');x00=pg.evaluate('__L.me.x')
    cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':x0,'y':y0}]})
    for i in range(1,8):
        cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':x0,'y':y0-8*i}]});pg.wait_for_timeout(40)
    pg.wait_for_timeout(1200)
    cek('joystick menggerakkan karakter',abs(pg.evaluate('__L.me.z')-z0)+abs(pg.evaluate('__L.me.x')-x00)>2)
    cek('petunjuk joystick hilang setelah dipakai',not pg.is_visible('#joy-tips'))
    cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
    # masuk Pos 5, kartu ringkas, ketuk untuk detail
    pg.evaluate("__L.setArea(5);__L.tp(0,9)");pg.wait_for_timeout(1500)
    cek('kartu HUD ringkas',not pg.is_visible('#a2-cv'))
    pg.tap('#ar2');pg.wait_for_timeout(300);cek('ketuk kartu menampilkan detail',pg.is_visible('#a2-cv'))
    pg.tap('#ar2');pg.wait_for_timeout(300)
    cek('boost terlipat',pg.locator('#boost .lipat').count()==1)
    pg.tap('#boost .lipat');pg.wait_for_timeout(300);cek('boost terbuka saat diketuk',pg.locator('#boost .btn').count()>=4)
    pg.screenshot(path=f'/tmp/hp-{tag}-boost.png')
    # mulai babak dan isi piring dengan tombol aksi
    pg.evaluate("__L.tp(12.5,6.6)");pg.wait_for_timeout(5500)
    cek('babak mulai',pg.evaluate('__L.ALUR[5].st.f')==1)
    pg.evaluate("__L.tp(0,54)");pg.wait_for_timeout(500);pg.tap("#pilih .btn:text-is('Ambil jangkar 10 kg')");pg.wait_for_timeout(300)
    pg.evaluate("__L.tp(2.3,4.7)");pg.wait_for_timeout(500)
    pg.screenshot(path=f'/tmp/hp-{tag}-piring.png')
    pg.tap('#aksi');pg.wait_for_timeout(500)
    cek('tombol aksi bisa diketuk',pg.evaluate('__L.ALUR[5].st.s[0]')==10)
    # ulasan babak: kartu muat di layar
    pg.evaluate("(()=>{const A=__L.ALUR[5],B=__L.P5.soal5(0).br[0];A.tambah(0,B.Fa-A.st.s[0]);A.tambah(1,B.Fb);})()");pg.evaluate("__L.tp(12.5,6.6)");pg.wait_for_timeout(3500)
    cek('ulasan tampil',pg.is_visible('#rev'))
    bb=pg.locator('#rev-ok').bounding_box();cek('tombol Lanjut ulasan terlihat tanpa gulir',bb and bb['y']+bb['height']<=H,bb)
    pg.screenshot(path=f'/tmp/hp-{tag}-rev.png')
    pg.tap('#rev-ok');pg.wait_for_timeout(300)
    # Pos 1: roda muat di layar
    pg.evaluate("__L.setArea(1);__L.tp(0,10)");pg.wait_for_timeout(4500)
    if pg.is_visible('#roda'):
        pg.wait_for_selector('#roda-ok',state='visible',timeout=8000)
        bb=pg.locator('#roda-ok').bounding_box();cek('tombol Lanjut roda terlihat tanpa gulir',bb and bb['y']+bb['height']<=H,bb)
        pg.screenshot(path=f'/tmp/hp-{tag}-roda.png')
    # Pos 6 di pos jawaban
    pg.evaluate("__L.setArea(6);__L.tp(24,22)");pg.wait_for_timeout(1500)
    try:pg.wait_for_selector('#pilih:not([hidden])',timeout=6000)
    except Exception:pass
    bb=pg.locator('#pilih').bounding_box();cek('panel soal muat di layar',bb and bb['y']>=0,bb)
    pg.screenshot(path=f'/tmp/hp-{tag}-soal.png')
    cek('tanpa galat',not errs,errs[:3])
    print('SEMUA LULUS' if ok else 'ADA YANG GAGAL')
    b.close()
