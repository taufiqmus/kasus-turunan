"""Uji Pos 2 Rakit Sandi: dua pemain setim (A, B) dan satu tim lain (C), mode luring (BroadcastChannel)."""
import re
from playwright.sync_api import sync_playwright
URL='http://localhost:8077/integral/index.html?lokal=1&kode=P2UJI'
ARGS=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']
def masuk(ctx,nama,tim,errs):
    pg=ctx.new_page()
    pg.on('pageerror',lambda e:errs.append(nama+': '+str(e)))
    pg.on('console',lambda m:errs.append(nama+': '+m.text) if m.type=='error' and 'ERR_' not in m.text and 'Failed to load' not in m.text else None)
    pg.route('**/fonts.g*/**',lambda r:r.abort())
    pg.goto(URL);pg.fill('#in-nama',nama);pg.fill('#in-kode','P2UJI');pg.click(f'#in-tim .tab[data-t="{tim}"]')
    pg.click('#b-masuk');pg.wait_for_timeout(900)
    pg.evaluate("__L.setGrafis(0,'r',true)")
    return pg
ok=True
def cek(nama,kond,info=''):
    global ok;print(('OK  ' if kond else 'GAGAL ')+nama,info if not kond else '');ok=ok and bool(kond)
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=ARGS)
    ctx=b.new_context(viewport={'width':1000,'height':620});errs=[]
    A=masuk(ctx,'Ani','merah',errs);B=masuk(ctx,'Budi','merah',errs);C=masuk(ctx,'Citra','biru',errs)
    A.bring_to_front();A.wait_for_timeout(2500)
    cek('A dan B setim',A.evaluate('__L.tim.size')==1)
    cek('soal Pos 2 sama untuk satu tim',A.evaluate('__L.P2.notasiBenar(0)+__L.P2.notasiBenar(1)+__L.P2.notasiBenar(2)')==B.evaluate('__L.P2.notasiBenar(0)+__L.P2.notasiBenar(1)+__L.P2.notasiBenar(2)'))
    # masuk lewat gerbang Pos 2
    g=A.evaluate('__L.gerbang[1]')
    for pg in (A,B):
        pg.bring_to_front();pg.evaluate(f"__L.tp({g['x']},{g['z']})");pg.wait_for_timeout(400)
        cek('tombol Masuk Pos 2 muncul',pg.is_visible('#aksi') and pg.inner_text('#aksi')=='Masuk Pos 2',pg.inner_text('#aksi') if pg.is_visible('#aksi') else 'tersembunyi')
        pg.keyboard.press('f');pg.wait_for_timeout(600)
    cek('A di Pos 2 dengan HUD sandi',A.evaluate('__L.me.a')==2 and A.is_visible('#ar2') and not A.is_visible('#arhud'))
    cek('dunia aktif Ngarai Kuil',A.evaluate('__L.W.nama')=='Ngarai Kuil')
    cek('pemain muncul di jalur',A.evaluate('__L.M2.boleh(__L.me.x,__L.me.z,false)'))
    # sebelum mulai: kamp tidak memberi batu
    A.evaluate("__L.tp(-30,36)");A.wait_for_timeout(500)
    cek('panel kamp tampil sebelum mulai, tombol mati',A.is_visible('#pilih') and A.locator('#pilih .btn:disabled').count()>=1)
    # mulai lewat pad
    for pg in (A,B):pg.bring_to_front();pg.evaluate("__L.tp(12.5,6.6)");pg.wait_for_timeout(300)
    A.bring_to_front();A.wait_for_timeout(5500)
    cek('babak 1 Pos 2 mulai di A dan B',A.evaluate('__L.st2.f')==1 and B.evaluate('__L.st2.f')==1,(A.evaluate('__L.st2.f'),B.evaluate('__L.st2.f')))
    cek('Pos 1 tidak ikut mulai',A.evaluate('__L.st.f')==0)
    cek('waktu stopwatch naik',bool(re.match(r'^0:0\d$',A.inner_text('#a2-waktu'))),A.inner_text('#a2-waktu'))
    jaw=A.evaluate("__L.P2.soal(0).jawab[0]")
    kode=lambda pg,k,t:pg.evaluate(f"__L.P2.soal(__L.st2.r).batu.findIndex(b=>b.k==='{k}'&&b.t==={t!r})+1")
    # ambil a dan d di Oasis lewat klik tombol
    A.evaluate("__L.tp(-30,36)");A.wait_for_timeout(500)
    A.click(f"#pilih .btn:text-is('{jaw['a']}')");A.wait_for_timeout(200)
    A.click(f"#pilih .btn:text-is('{jaw['d']}')");A.wait_for_timeout(300)
    cek('mengambil dua batu di Oasis',A.evaluate('__L.me.tiles.length')==2 and A.evaluate('__L.me.carry')==2)
    cek('tangan penuh menolak batu ketiga',A.locator('#pilih .btn.alt:disabled').count()>=2)
    cek('HUD menampilkan batu yang dibawa',jaw['a'] in A.inner_text('#a2-bawa'),A.inner_text('#a2-bawa'))
    # Oasis tidak menyediakan batu f
    cek('batu f tidak ada di Oasis',A.locator(f"#pilih .btn:text-is('{jaw['f']}')").count()==0 or jaw['f'] in ('2','1','3'))
    # pasang di slot a dan d (slot 1 dan 3)
    L=A.evaluate('__L.P2.tata(0).slot')
    for i in (1,3):
        A.evaluate(f"__L.tp({L[i]['x']},{L[i]['z']})");A.wait_for_timeout(300)
        cek(f'tombol pasang muncul di slot {L[i]["k"]}',A.is_visible('#aksi') and A.inner_text('#aksi').startswith('Pasang'),A.inner_text('#aksi') if A.is_visible('#aksi') else '-')
        A.keyboard.down('f');A.wait_for_timeout(250);A.keyboard.up('f');A.wait_for_timeout(300)
    s=A.evaluate('__L.st2.s');cek('dua slot terisi',s[1]>0 and s[3]>0 and s[0]==0,s)
    cek('tangan kosong setelah memasang',A.evaluate('__L.me.tiles.length')==0)
    A.evaluate('__L.flush2()');B.bring_to_front();B.wait_for_timeout(1500)
    cek('slot tersinkron ke B',B.evaluate('__L.st2.s')==A.evaluate('__L.st2.s'),(A.evaluate('__L.st2.s'),B.evaluate('__L.st2.s')))
    cek('tim lain tidak ikut',C.evaluate('__L.st2.s')==[0,0,0,0])
    # B mengambil f di Menara dan b di Reruntuhan; salah jenis ditolak
    B.evaluate("__L.tp(0,62)");B.wait_for_timeout(400)
    B.evaluate(f"__L.ambilBatu({kode(B,'f',jaw['f'])})");B.wait_for_timeout(200)
    B.evaluate("__L.tp(32,46)");B.wait_for_timeout(400)
    B.evaluate(f"__L.ambilBatu({kode(B,'b',jaw['b'])})");B.wait_for_timeout(200)
    cek('B membawa f dan b',B.evaluate('__L.me.tiles.length')==2)
    B.evaluate("__L.tp(-30,36)");B.wait_for_timeout(300)
    B.evaluate(f"__L.ambilBatu({kode(B,'a','0' if jaw['a']!='0' else '1')})");B.wait_for_timeout(200)
    cek('kapasitas bawa 2 ditegakkan',B.evaluate('__L.me.tiles.length')==2)
    B.evaluate(f"__L.tp({L[1]['x']},{L[1]['z']})");B.wait_for_timeout(300)
    cek('slot a menolak batu f dan b',B.inner_text('#aksi').startswith('Butuh') if B.is_visible('#aksi') else False)
    cek('pasang ke slot salah jenis tidak mengubah slot',B.evaluate('__L.pasangBatu(1)')==False)
    for i in (0,2):
        B.evaluate(f"__L.tp({L[i]['x']},{L[i]['z']})");B.wait_for_timeout(200);B.evaluate(f"__L.pasangBatu({i})")
    B.evaluate('__L.flush2()');A.bring_to_front();A.wait_for_timeout(1500)
    cek('keempat slot terisi dan sama di A dan B',all(v>0 for v in A.evaluate('__L.st2.s')) and A.evaluate('__L.st2.s')==B.evaluate('__L.st2.s'))
    cek('notasi rakitan benar',A.evaluate('__L.P2.notasi(0,__L.st2.s)')==A.evaluate('__L.P2.notasiBenar(0)'),A.evaluate('__L.P2.notasi(0,__L.st2.s)'))
    # tabrakan menjatuhkan batu
    B.bring_to_front();B.evaluate("__L.tp(-30,36)");B.wait_for_timeout(300);B.evaluate(f"__L.ambilBatu({kode(B,'a',jaw['a'])})")
    B.wait_for_function("(()=>{const m=__L.M2.medanBabak(0).palu[0];return Math.abs(__L.M2.xPalu(m,Date.now()/1000+.25))<.5})()",timeout=15000)
    s0=B.evaluate('__L.stunTil');B.evaluate("__L.tp(30,29)");B.wait_for_timeout(700)
    cek('bilah ayun menjatuhkan batu',B.evaluate('__L.stunTil')>s0 and B.evaluate('__L.me.tiles.length')==0)
    B.wait_for_timeout(1500)
    # kunci babak 1
    for pg in (A,B):pg.bring_to_front();pg.evaluate("__L.tp(12.5,6.6)");pg.wait_for_timeout(300)
    A.bring_to_front();A.wait_for_timeout(3500)
    cek('babak 1 Pos 2 terkunci di A dan B',A.evaluate('__L.st2.r')==1 and B.evaluate('__L.st2.r')==1,(A.evaluate('__L.st2.r'),B.evaluate('__L.st2.r')))
    cek('ulasan tampil',A.is_visible('#rev') and 'skor' in A.inner_text('#rev-h'))
    sk=A.evaluate('__L.P2.skorRonde2(0,__L.st2.sr[0],__L.st2.w[0])');cek('skor babak 1 benar penuh',sk['akurasi']==100 and sk['skor']>=88,sk)
    A.screenshot(path='/tmp/p2-rev.png')
    for pg in (A,B):
        pg.bring_to_front()
        if pg.is_visible('#rev'):pg.click('#rev-ok')
    # babak 2 dan 3: isi lewat kait, babak 3 dengan urutan dua integral ditukar
    def isi(pg,tukar=False):
        pg.evaluate("""(t)=>{const r=__L.st2.r,S=__L.P2.soal(r),n=S.jawab.length;
          S.slot.forEach((sl,i)=>{const g=t&&n>1?1-sl.g:sl.g,j=S.jawab[g];const k=S.batu.findIndex(b=>b.k===sl.k&&b.t===j[sl.k])+1;__L.ubahSlot2(i,k);});__L.flush2();}""",tukar)
    for r in (1,2):
        for pg in (A,B):pg.bring_to_front();pg.evaluate("__L.tp(12.5,6.6)");pg.wait_for_timeout(300)
        A.bring_to_front();A.wait_for_timeout(5500)
        cek(f'babak {r+1} Pos 2 mulai',A.evaluate('__L.st2.f')==1 and B.evaluate('__L.st2.f')==1)
        cek(f'altar babak {r+1} punya {8 if r==2 else 4} slot',A.evaluate('__L.st2.s.length')==(8 if r==2 else 4))
        isi(A,tukar=(r==2));A.wait_for_timeout(1800)
        for pg in (A,B):pg.bring_to_front();pg.evaluate("__L.tp(12.5,6.6)");pg.wait_for_timeout(200)
        A.bring_to_front();A.wait_for_timeout(3000)
        cek(f'babak {r+1} Pos 2 terkunci',A.evaluate('__L.st2.r')==r+1 and B.evaluate('__L.st2.r')==r+1,(A.evaluate('__L.st2.r'),B.evaluate('__L.st2.r')))
        sk=A.evaluate(f'__L.P2.skorRonde2({r},__L.st2.sr[{r}],__L.st2.w[{r}])');cek(f'skor babak {r+1} benar penuh'+(' (urutan ditukar)' if r==2 else ''),sk['akurasi']==100,sk)
        for pg in (A,B):
            pg.bring_to_front()
            if pg.is_visible('#rev'):pg.click('#rev-ok')
    A.bring_to_front();A.wait_for_timeout(500)
    cek('hasil Pos 2 tampil',A.is_visible('#hasil') and A.text_content('#w-pos')=='Pos 2 selesai')
    A.screenshot(path='/tmp/p2-hasil.png')
    A.click('#w-tutup');A.wait_for_timeout(500)
    cek('kembali ke lobi dekat gerbang Pos 2',A.evaluate('__L.me.a')==0 and abs(A.evaluate('__L.me.x')-g['ax'])<1)
    # papan skor tim lain
    C.bring_to_front();C.wait_for_timeout(2500)
    d=C.evaluate('__L.papanData.merah') or {}
    cek('papan di C menerima skor Pos 2 tim merah',(d.get('s2') or 0)>=80,d)
    # pendatang baru setim
    D=masuk(ctx,'Dedi','merah',errs);D.wait_for_timeout(6500)
    cek('pendatang baru menerima keadaan Pos 2',D.evaluate('__L.st2.r')==3,D.evaluate('__L.st2.r'))
    # Pos 1 tetap jalan
    A.bring_to_front();A.evaluate('__L.setArea(1)');A.wait_for_timeout(800)
    cek('Pos 1 masih bisa dimasuki',A.evaluate('__L.me.a')==1 and A.evaluate('__L.W.nama')=='Lembah Waduk' and A.is_visible('#arhud'))
    A.evaluate('__L.setArea(0)')
    cek('tanpa galat konsol',not errs,errs[:5])
    print('SEMUA LULUS' if ok else 'ADA YANG GAGAL')
    b.close()
