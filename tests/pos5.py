"""Uji Pos 5 Brankas Batas: dua pemain setim (A, B) dan satu tim lain (C), mode luring."""
from playwright.sync_api import sync_playwright
URL='http://localhost:8077/integral/index.html?lokal=1&kode=P5UJI'
ARGS=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']
def masuk(ctx,nama,tim,errs):
    pg=ctx.new_page()
    pg.on('pageerror',lambda e:errs.append(nama+': '+str(e)))
    pg.on('console',lambda m:errs.append(nama+': '+m.text) if m.type=='error' and 'ERR_' not in m.text and 'Failed to load' not in m.text else None)
    pg.route('**/fonts.g*/**',lambda r:r.abort())
    pg.goto(URL);pg.fill('#in-nama',nama);pg.fill('#in-kode','P5UJI');pg.click(f'#in-tim .tab[data-t="{tim}"]')
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
def keluarPad(*pgs):
    for pg in pgs:pg.bring_to_front();pg.evaluate("__L.tp(0,9)");pg.wait_for_timeout(300)
def kePad(*pgs):
    for pg in pgs:pg.bring_to_front();pg.evaluate("__L.tp(12.5,6.6)");pg.wait_for_timeout(300)
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=ARGS)
    ctx=b.new_context(viewport={'width':1000,'height':620});errs=[]
    A=masuk(ctx,'Ani','merah',errs);B=masuk(ctx,'Budi','merah',errs);C=masuk(ctx,'Citra','biru',errs)
    A.bring_to_front();A.wait_for_timeout(2500)
    g=A.evaluate('__L.gerbang[4]')
    for pg in (A,B):
        pg.bring_to_front();pg.evaluate(f"__L.tp({g['x']},{g['z']})");pg.wait_for_timeout(400)
        cek('tombol Masuk Pos 5 muncul',pg.is_visible('#aksi') and pg.inner_text('#aksi')=='Masuk Pos 5')
        pg.keyboard.press('f');pg.wait_for_timeout(600)
    B.wait_for_timeout(800);cek('B melihat A berada di Pos 5',B.evaluate("[...__L.tim.values()].some(p=>p.nama==='Ani'&&p.a===5)"))
    cek('A di Pos 5 Teluk Karang',A.evaluate('__L.me.a')==5 and A.evaluate('__L.W.nama')=='Teluk Karang')
    kePad(A,B);A.bring_to_front();A.wait_for_timeout(5500)
    cek('babak 1 Pos 5 mulai',A.evaluate('__L.ALUR[5].st.f')==1 and B.evaluate('__L.ALUR[5].st.f')==1)
    keluarPad(A,B)
    S=A.evaluate('__L.P5.soal5(0).br[0]')
    # ambil dua jangkar 10 kg di Mercusuar, taruh di piring kanan
    A.bring_to_front();A.evaluate("__L.tp(0,54)");A.wait_for_timeout(400);klik(A,'Ambil jangkar 10 kg');klik(A,'Ambil jangkar 10 kg')
    cek('membawa dua jangkar',A.evaluate('__L.me.tiles')==[10,10])
    A.evaluate("__L.tp(2.3,4.7)");A.wait_for_timeout(400)
    cek('tombol taruh muncul',A.is_visible('#aksi') and A.inner_text('#aksi').startswith('Taruh +20'))
    A.keyboard.down('f');A.wait_for_timeout(250);A.keyboard.up('f');A.wait_for_timeout(300)
    cek('piring kanan 20 kg',A.evaluate('__L.ALUR[5].st.s[0]')==20)
    klik(A,'Angkat 5 kg');cek('angkat 5 kg',A.evaluate('__L.ALUR[5].st.s[0]')==15)
    A.evaluate('__L.ALUR[5].flush()')
    # B di Gua Karang ambil peti 5 kg, taruh di piring kiri
    B.bring_to_front();B.evaluate("__L.tp(-28,40)");B.wait_for_timeout(400);klik(B,'Ambil peti 5 kg')
    B.evaluate("__L.tp(-2.3,4.7)");B.wait_for_timeout(400);klik(B,'Taruh +5 kg')
    cek('piring kiri 5 kg',B.evaluate('__L.ALUR[5].st.s[1]')==5)
    B.evaluate('__L.ALUR[5].flush()');B.wait_for_timeout(1200);A.bring_to_front();A.wait_for_timeout(1200)
    cek('timbangan tersinkron',A.evaluate('__L.ALUR[5].st.s')==B.evaluate('__L.ALUR[5].st.s')==[15,5],(A.evaluate('__L.ALUR[5].st.s'),B.evaluate('__L.ALUR[5].st.s')))
    cek('HUD menampilkan selisih',A.text_content('#a2-isi').startswith('A: 15−5=10'),A.text_content('#a2-isi'))
    # rintangan: ombak pasang di dataran pasir, kepiting di titian
    B.bring_to_front();cek('ombak pasang menyapu',kena(B,0,41,12000));B.wait_for_timeout(1500)
    cek('kepiting menjepit di titian',kena(B,10,28,9000));B.wait_for_timeout(1500)
    # C memakai F + C yang sama di kedua piring: tetap benar
    def isi(pg,C=0,salah=None):
        pg.evaluate(f"""()=>{{const A=__L.ALUR[5],S=__L.P5.soal5(A.st.r);S.br.forEach((B,i)=>{{let ka=B.Fa+{C},ki=B.Fb+{C};A.tambah(2*i,ka-A.st.s[2*i]);A.tambah(2*i+1,ki-A.st.s[2*i+1]);}});A.flush();}}""")
    A.bring_to_front();isi(A,C=3);A.wait_for_timeout(1200)
    kePad(A,B);A.bring_to_front();A.wait_for_timeout(3500)
    cek('babak 1 Pos 5 terkunci',A.evaluate('__L.ALUR[5].st.r')==1 and B.evaluate('__L.ALUR[5].st.r')==1)
    sk=A.evaluate('__L.P5.skorRonde5(0,__L.ALUR[5].st.sr[0],__L.ALUR[5].st.w[0])');cek('skor babak 1 penuh walau memakai C = 3',sk['akurasi']==100 and sk['C']==[3],sk)
    cek('ulasan menyebut C saling menghapus','C saling menghapus' in A.text_content('#rev'),A.text_content('#rev')[-200:])
    A.screenshot(path='/tmp/p5-rev.png')
    for pg in (A,B):
        pg.bring_to_front()
        if pg.is_visible('#rev'):pg.click('#rev-ok')
    for r in (1,2):
        keluarPad(A,B);kePad(A,B);A.bring_to_front();A.wait_for_timeout(5500)
        cek(f'babak {r+1} Pos 5 mulai',A.evaluate('__L.ALUR[5].st.f')==1)
        if r==2:
            cek('babak 3 punya dua brankas',A.evaluate('__L.ALUR[5].st.s.length')==4)
            A.screenshot(path='/tmp/p5-b3.png')
        keluarPad(A,B);A.bring_to_front();isi(A);A.wait_for_timeout(1500)
        kePad(A,B);A.bring_to_front();A.wait_for_timeout(3000)
        cek(f'babak {r+1} Pos 5 terkunci',A.evaluate('__L.ALUR[5].st.r')==r+1 and B.evaluate('__L.ALUR[5].st.r')==r+1)
        sk=A.evaluate(f'__L.P5.skorRonde5({r},__L.ALUR[5].st.sr[{r}],__L.ALUR[5].st.w[{r}])');cek(f'skor babak {r+1} penuh',sk['akurasi']==100,sk)
        for pg in (A,B):
            pg.bring_to_front()
            if pg.is_visible('#rev'):pg.click('#rev-ok')
    # miskonsepsi
    cat=A.evaluate("(()=>{const S=__L.P5.soal5(2),B=S.br[1];return __L.P5.nilai5(2,[S.br[0].Fa,S.br[0].Fb,B.Fb,B.Fa]).catatan})()")
    cek('batas terbalik dipaksa positif terdeteksi','terbalik' in cat,cat)
    cat=A.evaluate("(()=>{const S=__L.P5.soal5(1),B=S.br[0],f=x=>S.f.reduce((s,[a,n])=>s+a*x**n,0);return __L.P5.nilai5(1,[f(B.atas),f(B.bawah)]).catatan})()")
    cek('memakai f bukan F terdeteksi','fBukanF' in cat,cat)
    A.bring_to_front();A.wait_for_timeout(500)
    cek('hasil Pos 5 tampil',A.is_visible('#hasil') and A.text_content('#w-pos')=='Pos 5 selesai')
    A.click('#w-tutup');A.wait_for_timeout(400)
    C.bring_to_front();C.wait_for_timeout(2500)
    d=C.evaluate('__L.papanData.merah') or {}
    cek('papan di C menerima skor Pos 5',((d.get('sk') or [0]*5)[4] or 0)>=80,d)
    cek('tanpa galat konsol',not errs,errs[:5])
    print('SEMUA LULUS' if ok else 'ADA YANG GAGAL')
    b.close()
