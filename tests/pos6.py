"""Uji Pos 6 Puncak Final: dua pemain setim (A, B) dan satu tim lain (C), mode luring."""
from playwright.sync_api import sync_playwright
URL='http://localhost:8077/integral/index.html?lokal=1&kode=P6UJI'
ARGS=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']
def masuk(ctx,nama,tim,errs):
    pg=ctx.new_page()
    pg.on('pageerror',lambda e:errs.append(nama+': '+str(e)))
    pg.on('console',lambda m:errs.append(nama+': '+m.text) if m.type=='error' and 'ERR_' not in m.text and 'Failed to load' not in m.text else None)
    pg.route('**/fonts.g*/**',lambda r:r.abort())
    pg.goto(URL);pg.fill('#in-nama',nama);pg.fill('#in-kode','P6UJI');pg.click(f'#in-tim .tab[data-t="{tim}"]')
    pg.click('#b-masuk');pg.wait_for_timeout(900);pg.evaluate("__L.setGrafis(0,'r',true)")
    return pg
ok=True
def cek(nama,kond,info=''):
    global ok;print(('OK  ' if kond else 'GAGAL ')+nama,info if not kond else '');ok=ok and bool(kond)
def kena(pg,x,z,ms):
    s0=pg.evaluate('__L.stunTil');pg.evaluate(f"__L.tp({x},{z})")
    try:pg.wait_for_function(f"__L.stunTil>{s0}",timeout=ms);return True
    except Exception:return False
def keluarPad(*pgs):
    for pg in pgs:pg.bring_to_front();pg.evaluate("__L.tp(0,9)");pg.wait_for_timeout(300)
def kePad(*pgs):
    for pg in pgs:pg.bring_to_front();pg.evaluate("__L.tp(12.5,6.6)");pg.wait_for_timeout(300)
def kunci(pg,r):return pg.evaluate(f"__L.P6.soal6({r}).map(q=>q.b+1)")
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=ARGS)
    ctx=b.new_context(viewport={'width':1000,'height':620});errs=[]
    A=masuk(ctx,'Ani','merah',errs);B=masuk(ctx,'Budi','merah',errs);C=masuk(ctx,'Citra','biru',errs)
    A.bring_to_front();A.wait_for_timeout(2500)
    g=A.evaluate('__L.gerbang[5]')
    for pg in (A,B):
        pg.bring_to_front();pg.evaluate(f"__L.tp({g['x']},{g['z']})");pg.wait_for_timeout(400)
        cek('tombol Masuk Pos 6 muncul',pg.is_visible('#aksi') and pg.inner_text('#aksi')=='Masuk Pos 6')
        pg.keyboard.press('f');pg.wait_for_timeout(600)
    B.wait_for_timeout(800);cek('B melihat A berada di Pos 6',B.evaluate("[...__L.tim.values()].some(p=>p.nama==='Ani'&&p.a===6)"))
    cek('A di Pos 6 Puncak Kalkulus',A.evaluate('__L.me.a')==6 and A.evaluate('__L.W.nama')=='Puncak Kalkulus')
    # soal bisa dibaca sebelum mulai, tombol pilihan belum aktif
    A.bring_to_front();A.evaluate("__L.tp(24,22)");A.wait_for_timeout(500)
    cek('soal tampil di Pos Lembah sebelum mulai',A.is_visible('#pilih .bj.soal') and A.locator('#pilih .btn.opsi').count()==4 and A.locator('#pilih .btn.opsi').first.is_disabled())
    kePad(A,B);A.bring_to_front();A.wait_for_timeout(5500)
    cek('babak 1 Pos 6 mulai',A.evaluate('__L.ALUR[6].st.f')==1 and B.evaluate('__L.ALUR[6].st.f')==1)
    keluarPad(A,B)
    K=kunci(A,0)
    # A menjawab Pos Lembah dengan tombol angka, B menjawab Pos Tebing dengan klik
    A.bring_to_front();A.evaluate("__L.tp(24,22)");A.wait_for_timeout(500);A.keyboard.press(str(K[0]));A.wait_for_timeout(300)
    cek('jawaban Pos Lembah tercatat',A.evaluate('__L.ALUR[6].st.s[0]')==K[0])
    A.evaluate('__L.flush();for(const k in __L.ALUR)__L.ALUR[k].flush()')
    B.bring_to_front();B.evaluate("__L.tp(-24,38)");B.wait_for_timeout(500);B.locator('#pilih .btn.opsi').nth(K[1]-1).click();B.wait_for_timeout(300)
    salah=1 if K[2]!=1 else 2
    B.evaluate("__L.tp(0,56)");B.wait_for_timeout(500);B.locator('#pilih .btn.opsi').nth(salah-1).click();B.wait_for_timeout(300)
    B.evaluate('for(const k in __L.ALUR)__L.ALUR[k].flush()');B.wait_for_timeout(1200);A.bring_to_front();A.wait_for_timeout(1200)
    cek('jawaban tersinkron A dan B',A.evaluate('__L.ALUR[6].st.s')==B.evaluate('__L.ALUR[6].st.s')==[K[0],K[1],salah],(A.evaluate('__L.ALUR[6].st.s'),B.evaluate('__L.ALUR[6].st.s')))
    # A mengganti jawaban puncak (yang terakhir menang)
    A.evaluate("__L.tp(0,56)");A.wait_for_timeout(500);A.keyboard.press(str(K[2]));A.wait_for_timeout(300);A.evaluate('for(const k in __L.ALUR)__L.ALUR[k].flush()')
    B.bring_to_front();B.wait_for_timeout(1500)
    cek('jawaban yang diganti tersinkron ke B',B.evaluate('__L.ALUR[6].st.s[2]')==K[2])
    # rintangan
    cek('kambing gunung di punggung bukit',kena(B,14,32,9000));B.wait_for_timeout(1500)
    cek('kayu menggelinding di tanjakan barat',kena(B,-24,20,9000));B.wait_for_timeout(1500)
    kePad(A,B);A.bring_to_front();A.wait_for_timeout(3500)
    cek('babak 1 Pos 6 terkunci',A.evaluate('__L.ALUR[6].st.r')==1 and B.evaluate('__L.ALUR[6].st.r')==1)
    sk=A.evaluate('__L.P6.skorRonde6(0,__L.ALUR[6].st.sr[0],__L.ALUR[6].st.w[0])');cek('skor babak 1 penuh',sk['akurasi']==100,sk)
    A.screenshot(path='/tmp/p6-rev.png')
    for pg in (A,B):
        pg.bring_to_front()
        if pg.is_visible('#rev'):pg.click('#rev-ok')
    for r in (1,2):
        keluarPad(A,B);kePad(A,B);A.bring_to_front();A.wait_for_timeout(5500)
        cek(f'babak {r+1} Pos 6 mulai',A.evaluate('__L.ALUR[6].st.f')==1)
        keluarPad(A,B);A.bring_to_front()
        K=kunci(A,r);jaw=K if r==1 else [K[0],K[1],(K[2]%4)+1]
        A.evaluate(f"(()=>{{const A=__L.ALUR[6];{jaw}.forEach((v,i)=>A.ubahSlot(i,v));A.flush();}})()");A.wait_for_timeout(1500)
        kePad(A,B);A.bring_to_front();A.wait_for_timeout(3000)
        cek(f'babak {r+1} Pos 6 terkunci',A.evaluate('__L.ALUR[6].st.r')==r+1 and B.evaluate('__L.ALUR[6].st.r')==r+1)
        sk=A.evaluate(f'__L.P6.skorRonde6({r},__L.ALUR[6].st.sr[{r}],__L.ALUR[6].st.w[{r}])')
        cek(f'skor babak {r+1} sesuai',sk['akurasi']==(100 if r==1 else 67),sk)
        if r==2:cek('ulasan menjelaskan pengecoh yang dipilih','Puncak:' in A.text_content('#rev'),A.text_content('#rev')[-200:])
        for pg in (A,B):
            pg.bring_to_front()
            if pg.is_visible('#rev'):pg.click('#rev-ok')
    A.bring_to_front();A.wait_for_timeout(500)
    cek('hasil Pos 6 tampil dengan rapor',A.is_visible('#hasil') and A.text_content('#w-pos')=='Pos 6 selesai' and 'P6 ' in A.text_content('#hasil'),A.text_content('#hasil')[:300])
    A.screenshot(path='/tmp/p6-hasil.png')
    A.click('#w-tutup');A.wait_for_timeout(400)
    C.bring_to_front();C.wait_for_timeout(2500)
    d=C.evaluate('__L.papanData.merah') or {}
    cek('papan di C menerima skor Pos 6',((d.get('sk') or [0]*6)[5] or 0)>=80,d)
    cek('tanpa galat konsol',not errs,errs[:5])
    print('SEMUA LULUS' if ok else 'ADA YANG GAGAL')
    b.close()
