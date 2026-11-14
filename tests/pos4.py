"""Uji Pos 4 Misteri Tangki: dua pemain setim (A, B) dan satu tim lain (C), mode luring."""
from playwright.sync_api import sync_playwright
URL='http://localhost:8077/integral/index.html?lokal=1&kode=P4UJI'
ARGS=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']
def masuk(ctx,nama,tim,errs):
    pg=ctx.new_page()
    pg.on('pageerror',lambda e:errs.append(nama+': '+str(e)))
    pg.on('console',lambda m:errs.append(nama+': '+m.text) if m.type=='error' and 'ERR_' not in m.text and 'Failed to load' not in m.text else None)
    pg.route('**/fonts.g*/**',lambda r:r.abort())
    pg.goto(URL);pg.fill('#in-nama',nama);pg.fill('#in-kode','P4UJI');pg.click(f'#in-tim .tab[data-t="{tim}"]')
    pg.click('#b-masuk');pg.wait_for_timeout(900);pg.evaluate("__L.setGrafis(0,'r',true)")
    return pg
ok=True
def cek(nama,kond,info=''):
    global ok;print(('OK  ' if kond else 'GAGAL ')+nama,info if not kond else '');ok=ok and bool(kond)
def klik(pg,teks):
    pg.click(f"#pilih .btn:text-is('{teks}')");pg.wait_for_timeout(150)
def kena(pg,x,z,ms):
    s0=pg.evaluate('__L.stunTil');pg.evaluate(f"__L.tp({x},{z})")
    try:pg.wait_for_function(f"__L.stunTil>{s0}",timeout=ms);return True
    except Exception:return False
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=ARGS)
    ctx=b.new_context(viewport={'width':1000,'height':620});errs=[]
    A=masuk(ctx,'Ani','merah',errs);B=masuk(ctx,'Budi','merah',errs);C=masuk(ctx,'Citra','biru',errs)
    A.bring_to_front();A.wait_for_timeout(2500)
    g=A.evaluate('__L.gerbang[3]')
    for pg in (A,B):
        pg.bring_to_front();pg.evaluate(f"__L.tp({g['x']},{g['z']})");pg.wait_for_timeout(400)
        cek('tombol Masuk Pos 4 muncul',pg.is_visible('#aksi') and pg.inner_text('#aksi')=='Masuk Pos 4')
        pg.keyboard.press('f');pg.wait_for_timeout(600)
    B.wait_for_timeout(800);cek('B melihat A berada di Pos 4',B.evaluate("[...__L.tim.values()].some(p=>p.nama==='Ani'&&p.a===4)"))
    cek('A di Pos 4 Hutan Sungai',A.evaluate('__L.me.a')==4 and A.evaluate('__L.W.nama')=='Hutan Sungai')
    for pg in (A,B):pg.bring_to_front();pg.evaluate("__L.tp(12.5,6.6)");pg.wait_for_timeout(300)
    A.bring_to_front();A.wait_for_timeout(5500)
    cek('babak 1 Pos 4 mulai',A.evaluate('__L.ALUR[4].st.f')==1 and B.evaluate('__L.ALUR[4].st.f')==1)
    V=A.evaluate('__L.P4.soal4(0).V')
    # ambil dua drum 5 L di Air Terjun, tuang ke tangki 1
    A.evaluate("__L.tp(0,52)");A.wait_for_timeout(400);klik(A,'Ambil drum 5 L');klik(A,'Ambil drum 5 L')
    cek('membawa dua drum',A.evaluate('__L.me.tiles')==[5,5])
    A.evaluate("__L.tp(-6,4.6)");A.wait_for_timeout(400)
    cek('tombol tuang muncul',A.is_visible('#aksi') and A.inner_text('#aksi').startswith('Tuang +10'))
    A.keyboard.down('f');A.wait_for_timeout(250);A.keyboard.up('f');A.wait_for_timeout(300)
    cek('tangki 1 berisi 10 L',A.evaluate('__L.ALUR[4].st.s[0]')==10)
    klik(A,'Kuras 1 L');cek('kuras 1 L',A.evaluate('__L.ALUR[4].st.s[0]')==9)
    A.evaluate('__L.ALUR[4].flush()')
    B.bring_to_front();B.wait_for_timeout(1500)
    cek('isi tangki tersinkron ke B',B.evaluate('__L.ALUR[4].st.s')==A.evaluate('__L.ALUR[4].st.s'))
    # B menambah 1 L dari Mata Air ke tangki 1 bersamaan dengan A menambah 2 L: penjumlahan tidak hilang
    B.bring_to_front();B.evaluate("__L.tp(24,16)");B.wait_for_timeout(400);klik(B,'Ambil ember 1 L')
    B.evaluate("__L.tp(-6,4.6)");B.wait_for_timeout(300);B.evaluate("__L.ALUR[4].tambah(0,1);__L.me.tiles=[];__L.me.carry=0")
    A.evaluate("__L.ALUR[4].tambah(0,2)")
    A.evaluate('__L.ALUR[4].flush()');B.evaluate('__L.ALUR[4].flush()');B.wait_for_timeout(1200);A.bring_to_front();A.wait_for_timeout(1200)
    cek('tambahan serentak dari dua pemain tidak hilang',A.evaluate('__L.ALUR[4].st.s[0]')==12 and B.evaluate('__L.ALUR[4].st.s[0]')==12,(A.evaluate('__L.ALUR[4].st.s'),B.evaluate('__L.ALUR[4].st.s')))
    # kawanan lebah di jembatan tengah
    B.bring_to_front();cek('kawanan lebah menyengat di jembatan',kena(B,0,27,8000));B.wait_for_timeout(1500)
    # isi tepat lalu kunci
    def isi(pg):
        pg.evaluate("""()=>{const A=__L.ALUR[4],V=__L.P4.soal4(A.st.r).V;V.forEach((v,i)=>A.tambah(i,v-A.st.s[i]));A.flush();}""")
    A.bring_to_front();isi(A);A.wait_for_timeout(1200)
    for pg in (A,B):pg.bring_to_front();pg.evaluate("__L.tp(12.5,6.6)");pg.wait_for_timeout(300)
    A.bring_to_front();A.wait_for_timeout(3500)
    cek('babak 1 Pos 4 terkunci',A.evaluate('__L.ALUR[4].st.r')==1 and B.evaluate('__L.ALUR[4].st.r')==1)
    sk=A.evaluate('__L.P4.skorRonde4(0,__L.ALUR[4].st.sr[0],__L.ALUR[4].st.w[0])');cek('skor babak 1 penuh',sk['akurasi']==100,sk)
    A.screenshot(path='/tmp/p4-rev.png')
    for pg in (A,B):
        pg.bring_to_front()
        if pg.is_visible('#rev'):pg.click('#rev-ok')
    for r in (1,2):
        for pg in (A,B):pg.bring_to_front();pg.evaluate("__L.tp(12.5,6.6)");pg.wait_for_timeout(300)
        A.bring_to_front();A.wait_for_timeout(5500)
        cek(f'babak {r+1} Pos 4 mulai',A.evaluate('__L.ALUR[4].st.f')==1)
        isi(A);A.wait_for_timeout(1500)
        for pg in (A,B):pg.bring_to_front();pg.evaluate("__L.tp(12.5,6.6)");pg.wait_for_timeout(200)
        A.bring_to_front();A.wait_for_timeout(3000)
        cek(f'babak {r+1} Pos 4 terkunci',A.evaluate('__L.ALUR[4].st.r')==r+1 and B.evaluate('__L.ALUR[4].st.r')==r+1)
        sk=A.evaluate(f'__L.P4.skorRonde4({r},__L.ALUR[4].st.sr[{r}],__L.ALUR[4].st.w[{r}])');cek(f'skor babak {r+1} penuh',sk['akurasi']==100,sk)
        for pg in (A,B):
            pg.bring_to_front()
            if pg.is_visible('#rev'):pg.click('#rev-ok')
    # catatan miskonsepsi babak 3 (aliran keluar)
    cat=A.evaluate("(()=>{const S=__L.P4.soal4(2);let a=S.v0;const s=S.p.map(q=>{a+=Math.abs(__L.P4.luasPotong(q));return a;});return __L.P4.nilai4(2,s).catatan})()")
    cek('salah tanda pada aliran keluar terdeteksi','tanda' in cat,cat)
    A.bring_to_front();A.wait_for_timeout(500)
    cek('hasil Pos 4 tampil',A.is_visible('#hasil') and A.text_content('#w-pos')=='Pos 4 selesai')
    A.click('#w-tutup');A.wait_for_timeout(400)
    C.bring_to_front();C.wait_for_timeout(2500)
    d=C.evaluate('__L.papanData.merah') or {}
    cek('papan di C menerima skor Pos 4',((d.get('sk') or [0,0,0,0])[3] or 0)>=80,d)
    cek('tanpa galat konsol',not errs,errs[:5])
    print('SEMUA LULUS' if ok else 'ADA YANG GAGAL')
    b.close()
