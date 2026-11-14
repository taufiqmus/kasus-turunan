"""Uji asap Lobi Integral v2: tiga pemain (dua setim, satu tim lain), mode luring (BroadcastChannel)."""
from playwright.sync_api import sync_playwright
URL='http://localhost:8077/integral/index.html?lokal=1'
ARGS=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']
def masuk(ctx,nama,tim,errs,shot=None):
    pg=ctx.new_page()
    pg.on('pageerror',lambda e:errs.append(nama+': '+str(e)))
    pg.on('console',lambda m:errs.append(nama+': '+m.text) if m.type=='error' and 'ERR_' not in m.text and 'Failed to load' not in m.text else None)
    pg.route('**/fonts.g*/**',lambda r:r.abort())
    pg.goto(URL);pg.fill('#in-nama',nama);pg.click(f'#in-tim .tab[data-t="{tim}"]')
    if shot:pg.wait_for_timeout(600);pg.screenshot(path=shot)
    pg.click('#b-masuk');pg.wait_for_timeout(900)
    return pg
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=ARGS)
    ctx=b.new_context(viewport={'width':1000,'height':620});errs=[];ok=True
    def cek(nama,kond,info=''):
        global ok;print(('OK  ' if kond else 'GAGAL ')+nama,info);ok=ok and bool(kond)
    A=masuk(ctx,'Ani','merah',errs,'/tmp/v2-entry.png');B=masuk(ctx,'Budi','merah',errs);C=masuk(ctx,'Citra','biru',errs)
    A.wait_for_timeout(2500)
    cek('A melihat 1 teman setim saja',A.evaluate('__L.tim.size')==1)
    cek('C tidak punya teman setim',C.evaluate('__L.tim.size')==0)
    C.bring_to_front();C.wait_for_timeout(18000)
    cek('C melihat Ani dan Budi sebagai pemain tim lain',C.evaluate('__L.luar.size')==2,C.evaluate('[...__L.luar.values()].map(p=>p.nama)'))
    cek('mode luring',A.evaluate('__L.rt.mode')=='luring')
    # kamera dan gerak relatif kamera
    A.bring_to_front();p0=A.evaluate('[__L.me.x,__L.me.z]');A.evaluate('__L.C.yaw=Math.PI/2');A.keyboard.down('w');A.wait_for_timeout(1000)
    kaki=A.evaluate('Math.abs(__L.me.grp.userData.mesh.userData.kakiK.rotation.x)+Math.abs(__L.me.grp.userData.mesh.userData.kakiN.rotation.x)')
    A.keyboard.up('w')
    pos=A.evaluate('[__L.me.x,__L.me.z]');cek('W maju searah kamera setelah diputar 90 derajat',pos[0]-p0[0]<-1 and abs(pos[1]-p0[1])<.8,(p0,pos))
    cek('kaki berayun saat berjalan',kaki>.05,kaki)
    A.wait_for_timeout(600);kaki2=A.evaluate('Math.abs(__L.me.grp.userData.mesh.userData.kakiK.rotation.x)')
    cek('kaki kembali lurus saat diam',kaki2<.1,kaki2)
    A.evaluate('__L.C.yaw=0');A.keyboard.press('c');A.wait_for_timeout(300)
    cek('tombol C ganti preset kamera',A.evaluate('__L.C.td')==25)
    A.keyboard.press('c');A.keyboard.press('c');A.keyboard.press('c')
    # sinkron posisi
    A.evaluate('__L.tp(5,5);__L.kirimPosisi()');B.bring_to_front();B.wait_for_timeout(900)
    pos=B.evaluate('(()=>{const q=[...__L.tim.values()][0];return [q.x,q.z]})()')
    cek('posisi Ani sampai ke Budi',abs(pos[0]-5)<.5 and abs(pos[1]-5)<.5,pos)
    # masuk arena
    g=A.evaluate('__L.gerbang[0]')
    for pg in (A,B):
        pg.bring_to_front();pg.evaluate(f"__L.tp({g['x']},{g['z']})");pg.wait_for_timeout(300)
        cek('tombol Pos 1 muncul',pg.is_visible('#aksi'))
        pg.keyboard.press('f');pg.wait_for_timeout(500)
    cek('A di arena',A.evaluate('__L.me.a')==1 and A.is_visible('#arhud'))
    A.screenshot(path='/tmp/v2-arena.png')
    # babak 1: A membawa lalu menaruh balok di kolom 1; B di kolom 2
    def taruh(pg,col,n):
        pg.bring_to_front();pg.evaluate("__L.tp(-8.5,7)");pg.wait_for_timeout(1100)
        c=pg.evaluate('__L.me.carry')
        xs=[-4,0,4][col]
        pg.evaluate(f"__L.tp({xs},2)");pg.wait_for_timeout(150)
        pg.evaluate('__L.tahan=true');pg.wait_for_timeout(500*n+600);pg.evaluate('__L.tahan=false')
        return c
    ca=taruh(A,0,4);cek('gudang mengisi tangan sampai 4',ca==4,ca)
    B_c=taruh(B,2,4)
    A.bring_to_front();A.wait_for_timeout(2500)
    stA=A.evaluate('__L.st.c');stB=B.evaluate('__L.st.c')
    cek('kolom tersinkron dua arah',stA==stB and stA[0]==4 and stA[2]==4,(stA,stB))
    cek('tim lain tidak ikut',C.evaluate('__L.st.c')==[0,0,0])
    # ambil kembali
    A.evaluate('__L.tp(-4,2)');A.evaluate('__L.me.carry=0;__L.tahan=true');A.wait_for_timeout(900);A.evaluate('__L.tahan=false')
    cek('ambil kembali mengurangi kolom',A.evaluate('__L.st.c[0]')<4 and A.evaluate('__L.me.carry')>0,A.evaluate('[__L.st.c,__L.me.carry]'))
    # susun semua babak lewat delta, kunci lewat pad
    def isi(pg,c):
        pg.evaluate(f"(()=>{{const c={c};c.forEach((v,i)=>{{const d=v-__L.st.c[i];if(d)__L.ubahKolom(i,d);}});__L.flush();}})()")
    from math import floor
    def tinggi(n):return [round(((i+.5)*3/n)**2/.5) for i in range(n)]
    for r,n in enumerate([3,6,12]):
        A.bring_to_front();A.wait_for_timeout(500);isi(A,tinggi(n));A.wait_for_timeout(1500)
        cek(f'babak {r+1} tersinkron ke B',B.evaluate('__L.st.c')==A.evaluate('__L.st.c'),A.evaluate('__L.st.c'))
        for pg in (A,B):pg.bring_to_front();pg.evaluate("__L.tp(8.5,7)");pg.wait_for_timeout(300)
        A.bring_to_front();A.wait_for_timeout(2200)
        cek(f'babak {r+1} terkunci di A dan B',A.evaluate('__L.st.r')==r+1 and B.evaluate('__L.st.r')==r+1,(A.evaluate('__L.st.r'),B.evaluate('__L.st.r')))
        for pg in (A,B):pg.evaluate("__L.tp(0,9)")
    cek('hasil tampil di A',A.is_visible('#hasil'))
    print('tabel:',A.inner_text('#w-tabel').replace('\n',' | ').replace('\t',' '))
    A.screenshot(path='/tmp/v2-hasil.png')
    cek('skor tinggi',int(A.inner_text('#w-skor'))>=85,A.inner_text('#w-skor'))
    # laporan papan ke tim lain
    C.bring_to_front();C.wait_for_timeout(2500)
    cek('papan di C menerima skor tim merah',(C.evaluate('__L.papanData.merah') or {}).get('s',0)>=85,C.evaluate('__L.papanData'))
    # pendatang baru setim menerima state
    D=masuk(ctx,'Dedi','merah',errs);D.wait_for_timeout(6500)
    cek('pendatang baru menerima state',D.evaluate('__L.st.r')==3,D.evaluate('__L.st.r'))
    # anggaran
    cek('jeda posisi 2 pemain di batas bawah',A.evaluate('__L.jedaPos()')<=400,A.evaluate('__L.jedaPos()'))
    A.evaluate('__L.sim.on=true');cek('simulasi kelas 40',A.evaluate('__L.ntot()')==40 and A.evaluate('__L.jedaPos()')==4000)
    cek('tanpa galat konsol',not errs,errs)
    print('SEMUA LULUS' if ok else 'ADA YANG GAGAL')
    b.close()
