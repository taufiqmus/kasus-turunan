"""Uji Pos 3 Mesin Putar Balik: dua pemain setim (A, B) dan satu tim lain (C), mode luring."""
from playwright.sync_api import sync_playwright
URL='http://localhost:8077/integral/index.html?lokal=1&kode=P3UJI'
ARGS=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']
def masuk(ctx,nama,tim,errs):
    pg=ctx.new_page()
    pg.on('pageerror',lambda e:errs.append(nama+': '+str(e)))
    pg.on('console',lambda m:errs.append(nama+': '+m.text) if m.type=='error' and 'ERR_' not in m.text and 'Failed to load' not in m.text else None)
    pg.route('**/fonts.g*/**',lambda r:r.abort())
    pg.goto(URL);pg.fill('#in-nama',nama);pg.fill('#in-kode','P3UJI');pg.click(f'#in-tim .tab[data-t="{tim}"]')
    pg.click('#b-masuk');pg.wait_for_timeout(900);pg.evaluate("__L.setGrafis(0,'r',true)")
    return pg
ok=True
def cek(nama,kond,info=''):
    global ok;print(('OK  ' if kond else 'GAGAL ')+nama,info if not kond else '');ok=ok and bool(kond)
def klik(pg,teks):
    pg.click(f"#pilih .btn:text-is('{teks}')");pg.wait_for_timeout(150)
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=ARGS)
    ctx=b.new_context(viewport={'width':1000,'height':620});errs=[]
    A=masuk(ctx,'Ani','merah',errs);B=masuk(ctx,'Budi','merah',errs);C=masuk(ctx,'Citra','biru',errs)
    A.bring_to_front();A.wait_for_timeout(2500)
    g=A.evaluate('__L.gerbang[2]')
    for pg in (A,B):
        pg.bring_to_front();pg.evaluate(f"__L.tp({g['x']},{g['z']})");pg.wait_for_timeout(400)
        cek('tombol Masuk Pos 3 muncul',pg.is_visible('#aksi') and pg.inner_text('#aksi')=='Masuk Pos 3')
        pg.keyboard.press('f');pg.wait_for_timeout(600)
    cek('A di Pos 3 Danau Beku',A.evaluate('__L.me.a')==3 and A.evaluate('__L.W.nama')=='Danau Beku' and A.is_visible('#ar2'))
    cek('roda Pos 1 tidak muncul di Pos 3',not A.is_visible('#roda'))
    for pg in (A,B):pg.bring_to_front();pg.evaluate("__L.tp(12.5,6.6)");pg.wait_for_timeout(300)
    A.bring_to_front();A.wait_for_timeout(5500)
    cek('babak 1 Pos 3 mulai di A dan B',A.evaluate('__L.ALUR[3].st.f')==1 and B.evaluate('__L.ALUR[3].st.f')==1)
    S=A.evaluate('__L.P3.soal3(0)')
    teks=lambda a,n:A.evaluate(f'__L.P3.teksSuku({a},1,{n})')
    # ambil dua suku di corong masuk lewat tombol panel
    A.evaluate("__L.tp(-5.5,4.2)");A.wait_for_timeout(400)
    cek('panel corong masuk tampil',A.is_visible('#pilih'))
    for a,n in S['suku']:klik(A,teks(a,n))
    cek('membawa dua balok suku',A.evaluate('__L.me.tiles.length')==2)
    # tungku: naik pangkat
    A.evaluate("__L.tp(21,30)");A.wait_for_timeout(400)
    for i in range(2):
        bl=A.evaluate(f'__L.me.tiles[{i}]');t0=A.evaluate(f'__L.P3.teksBalok(0,__L.me.tiles[{i}])')
        A.click(f"#pilih .btn:text-is('{t0}: naik ke '+'{''}'+'')") if False else None
        btn=A.evaluate(f"[...document.querySelectorAll('#pilih .btn')].map(b=>b.textContent).find(t=>t.startsWith('{t0}: naik'))")
        klik(A,btn)
    cek('pangkat kedua balok naik satu',all(A.evaluate(f'__L.me.tiles[{i}].e')==S['suku'][i][1]+1 for i in range(2)),A.evaluate('__L.me.tiles'))
    # pemotong: bagi pangkat baru
    A.evaluate("__L.tp(-21,30)");A.wait_for_timeout(400)
    for i in range(2):
        t0=A.evaluate(f'__L.P3.teksBalok(0,__L.me.tiles[{i}])');e=A.evaluate(f'__L.me.tiles[{i}].e')
        klik(A,f'{t0}: bagi {e}')
    # corong keluar
    A.evaluate("__L.tp(5.5,4.2)");A.wait_for_timeout(400)
    cek('tombol masukkan ke mesin',A.is_visible('#aksi') and A.inner_text('#aksi').startswith('Masukkan'))
    A.keyboard.down('f');A.wait_for_timeout(250);A.keyboard.up('f');A.wait_for_timeout(300)
    cek('turunan F rakitan sama dengan f',A.evaluate('__L.P3.teksTurunanTim(0,__L.ALUR[3].st.s)')==A.evaluate('__L.P3.teksF(__L.P3.soal3(0).suku)'),A.evaluate('__L.P3.teksFTim(0,__L.ALUR[3].st.s)'))
    A.evaluate('__L.ALUR[3].flush()')
    # B mengambil + C di Gudang C dan memasukkan
    B.bring_to_front();B.wait_for_timeout(1200)
    cek('slot tersinkron ke B',B.evaluate('__L.ALUR[3].st.s')==A.evaluate('__L.ALUR[3].st.s'))
    B.evaluate("__L.tp(0,50)");B.wait_for_timeout(400);klik(B,'+ C')
    B.evaluate("__L.tp(5.5,4.2)");B.wait_for_timeout(400);B.keyboard.down('f');B.wait_for_timeout(250);B.keyboard.up('f');B.wait_for_timeout(300)
    cek('C masuk mesin',B.evaluate('__L.ALUR[3].st.s')[-1]>0)
    # rintangan baru: penekan, rakit, lengan putar
    def kena(pg,x,z,ms):
        s0=pg.evaluate('__L.stunTil');pg.evaluate(f"__L.tp({x},{z})")
        try:pg.wait_for_function(f"__L.stunTil>{s0}",timeout=ms);return True
        except Exception:return False
    B.wait_for_function("__L.M3.penekan(__L.M3.medanBabak(0).penekan[0],Date.now()/1000).fase===0",timeout=15000)
    cek('penekan mengenai pemain',kena(B,21,20,7000));B.wait_for_timeout(1800)
    B.wait_for_function("(()=>{const R=__L.M3.medanBabak(0).rakit[0],u=((Date.now()/1000)/R.T+R.f)%1;return u>.32&&u<.45})()",timeout=20000)
    cek('tercebur bila rakit tidak ada',kena(B,0,18,2500));B.wait_for_timeout(1800)
    B.wait_for_function("(()=>{const R=__L.M3.medanBabak(0).rakit[0],u=((Date.now()/1000)/R.T+R.f)%1;return u>.02&&u<.06})()",timeout=20000)
    s0=B.evaluate('__L.stunTil');B.evaluate("__L.tp(0,18.3)");B.wait_for_timeout(3600)
    z=B.evaluate('__L.me.z');cek('naik rakit terbawa menyeberang tanpa tercebur',z>21 and B.evaluate('__L.stunTil')==s0,(z,B.evaluate('__L.stunTil'),s0))
    cek('lengan putar mengenai pemain di pulau',kena(B,-2.6,30,6000));B.wait_for_timeout(1500)
    # kunci babak 1
    for pg in (A,B):pg.bring_to_front();pg.evaluate("__L.tp(12.5,6.6)");pg.wait_for_timeout(300)
    A.bring_to_front();A.wait_for_timeout(3500)
    cek('babak 1 Pos 3 terkunci',A.evaluate('__L.ALUR[3].st.r')==1 and B.evaluate('__L.ALUR[3].st.r')==1)
    sk=A.evaluate('__L.P3.skorRonde3(0,__L.ALUR[3].st.sr[0],__L.ALUR[3].st.w[0])');cek('skor babak 1 penuh',sk['akurasi']==100,sk)
    A.screenshot(path='/tmp/p3-rev.png')
    for pg in (A,B):
        pg.bring_to_front()
        if pg.is_visible('#rev'):pg.click('#rev-ok')
    def isi(pg):
        pg.evaluate("""()=>{const A=__L.ALUR[3],r=A.st.r,S=__L.P3.soal3(r);
          S.suku.forEach(([a,n],i)=>A.ubahSlot(i,__L.P3.kodeBalok({e:n+1,d:n+1,m:1})));A.ubahSlot(S.suku.length,S.cBenar+1);A.flush();}""")
    for r in (1,2):
        for pg in (A,B):pg.bring_to_front();pg.evaluate("__L.tp(12.5,6.6)");pg.wait_for_timeout(300)
        A.bring_to_front();A.wait_for_timeout(5500)
        cek(f'babak {r+1} Pos 3 mulai',A.evaluate('__L.ALUR[3].st.f')==1)
        isi(A);A.wait_for_timeout(1500)
        if r==2:
            cek('layar babak 3 punya syarat nilai awal',A.evaluate('__L.P3.soal3(2).x0')is not None)
            A.screenshot(path='/tmp/p3-b3.png')
        for pg in (A,B):pg.bring_to_front();pg.evaluate("__L.tp(12.5,6.6)");pg.wait_for_timeout(200)
        A.bring_to_front();A.wait_for_timeout(3000)
        cek(f'babak {r+1} Pos 3 terkunci',A.evaluate('__L.ALUR[3].st.r')==r+1 and B.evaluate('__L.ALUR[3].st.r')==r+1)
        sk=A.evaluate(f'__L.P3.skorRonde3({r},__L.ALUR[3].st.sr[{r}],__L.ALUR[3].st.w[{r}])');cek(f'skor babak {r+1} penuh',sk['akurasi']==100,sk)
        for pg in (A,B):
            pg.bring_to_front()
            if pg.is_visible('#rev'):pg.click('#rev-ok')
    A.bring_to_front();A.wait_for_timeout(500)
    cek('hasil Pos 3 tampil',A.is_visible('#hasil') and A.text_content('#w-pos')=='Pos 3 selesai')
    A.click('#w-tutup');A.wait_for_timeout(400)
    C.bring_to_front();C.wait_for_timeout(2500)
    d=C.evaluate('__L.papanData.merah') or {}
    cek('papan di C menerima skor Pos 3',((d.get('sk') or [0,0,0])[2] or 0)>=80,d)
    cek('tanpa galat konsol',not errs,errs[:5])
    print('SEMUA LULUS' if ok else 'ADA YANG GAGAL')
    b.close()
