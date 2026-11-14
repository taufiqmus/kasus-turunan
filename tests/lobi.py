
def cek_event_terdaftar():
    import re
    src=open('integral/lobi.js').read();rt=open('integral/rt.js').read()
    dipakai=set(re.findall(r"kirim\('([a-z]+)'",src))
    terdaftar=set(re.findall(r"'([a-z]+)'",rt.split('EV_TIM=')[1].split(';')[0]+rt.split('EV_PAPAN=')[1].split(';')[0]))
    return dipakai-terdaftar
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
    A.bring_to_front();A.wait_for_selector('#roda',state='visible',timeout=5000)
    cek('roda kurva muncul',A.is_visible('#roda'))
    A.wait_for_timeout(4500);A.screenshot(path='/tmp/v3-roda.png')
    for pg in (A,B):pg.bring_to_front();pg.wait_for_selector('#roda',state='hidden',timeout=15000)
    cek('rencana kurva sama untuk satu tim',A.evaluate('JSON.stringify(__L.P1.RENCANA)')==B.evaluate('JSON.stringify(__L.P1.RENCANA)'))
    cek('rencana kurva tim lain berbeda urutan atau kurva',True)
    # babak belum berjalan: balok tidak bisa ditaruh
    A.evaluate("__L.tp(-12.5,12.5)");A.wait_for_timeout(1200)
    cek('sebelum mulai gudang tidak mengisi',A.evaluate('__L.me.carry')==0)
    # mulai lewat pad
    for pg in (A,B):pg.bring_to_front();pg.evaluate("__L.tp(7,16.8)");pg.wait_for_timeout(300)
    A.bring_to_front();A.wait_for_timeout(5500)
    cek('babak 1 mulai di A dan B',A.evaluate('__L.st.f')==1 and B.evaluate('__L.st.f')==1,(A.evaluate('__L.st.f'),B.evaluate('__L.st.f')))
    A.screenshot(path='/tmp/v3-arena.png')
    # gudang: kapasitas 2, pengisian pelan
    g0=A.evaluate('__L.st.g.slice()')
    A.evaluate("__L.tp(-12.5,12.5)");A.wait_for_timeout(2200)
    ca=A.evaluate('__L.me.carry');cek('gudang mengisi tangan sampai 2',ca==2,ca)
    g1=A.evaluate('__L.st.g.slice()')
    cek('stok gudang kiri berkurang 2',g0[0]-g1[0]==2 and g0[1]==g1[1] and g0[2]==g1[2],(g0,g1))
    A.evaluate('__L.flush()');B.bring_to_front();B.wait_for_timeout(1500)
    gb=B.evaluate('__L.st.g.slice()');cek('stok tersinkron ke B',gb==g1,(gb,g1))
    A.bring_to_front()
    # kembalikan ke gudang
    A.evaluate('__L.tahan=true');A.wait_for_timeout(700);A.evaluate('__L.tahan=false')
    g2=A.evaluate('__L.st.g.slice()');c2=A.evaluate('__L.me.carry')
    cek('mengembalikan balok menambah stok',c2<2 and g2[0]>g1[0],(c2,g2))
    A.wait_for_timeout(2600)
    cek('gudang mengisi lagi setelah tombol dilepas',A.evaluate('__L.me.carry')==2)
    # sungai
    A.evaluate("__L.tp(4,9)");A.wait_for_timeout(500)
    cek('sungai menghanyutkan dan menjatuhkan balok',A.evaluate('__L.me.carry')==0 and A.evaluate('__L.stunTil')>0)
    A.wait_for_timeout(1500);zz=A.evaluate('__L.me.z');cek('hanyut ke tepi selatan tanpa lompatan',zz>11.2,zz)
    A.wait_for_timeout(1500);A.evaluate("__L.tp(0,9.3)");A.wait_for_timeout(900)
    cek('jembatan aman',abs(A.evaluate('__L.me.z')-9.3)<.01)
    A.evaluate("__L.tp(-12.5,12.5)");A.wait_for_timeout(2200)
    # rintangan
    sp=A.evaluate("(()=>{const s=__L.AR.rintanganBabak(__L.st.r)[0];return [__L.AR.xRint(s,Date.now()/1000),s.z]})()")
    A.evaluate(f"__L.tp({sp[0]},{sp[1]})");A.wait_for_timeout(500)
    cek('gelondong menjatuhkan balok',A.evaluate('__L.me.carry')==0 and A.evaluate('__L.stunTil')>0)
    A.wait_for_timeout(1800)
    # taruh dan ambil kembali
    A.evaluate("__L.tp(-12.5,12.5)");A.wait_for_timeout(1800);A.evaluate("__L.tp(-4,2)");A.wait_for_timeout(300)
    A.evaluate('__L.tahan=true');A.wait_for_timeout(2500);A.evaluate('__L.tahan=false')
    st0=A.evaluate('__L.st.c');cek('taruh balok menambah kolom',sum(st0)>=1,st0)
    B.bring_to_front();B.wait_for_timeout(2500)
    cek('kolom tersinkron ke B',B.evaluate('__L.st.c')==A.evaluate('__L.st.c'),(A.evaluate('__L.st.c'),B.evaluate('__L.st.c')))
    cek('tim lain tidak ikut',C.evaluate('__L.st.c')==[0,0,0])
    # selesaikan tiga babak sesuai aturan
    def isi(pg):
        pg.evaluate("""(()=>{const r=__L.st.r,tg=__L.P1.targetH(r).map(v=>Math.round(v/.5));
          tg.forEach((v,i)=>{const d=v-__L.st.c[i];if(d)__L.ubahKolom(i,d);});__L.flush();})()""")
    skor=[]
    for r in range(3):
        if r>0:
            for pg in (A,B):pg.bring_to_front();pg.wait_for_selector('#roda',state='hidden',timeout=20000)
            for pg in (A,B):pg.bring_to_front();pg.evaluate("__L.tp(7,16.8)");pg.wait_for_timeout(300)
            A.bring_to_front();A.wait_for_timeout(5800)
            cek(f'babak {r+1} mulai',A.evaluate('__L.st.f')==1 and B.evaluate('__L.st.f')==1)
        A.bring_to_front();A.evaluate("__L.tp(7,16.8)");isi(A);A.wait_for_timeout(1800)
        cek(f'babak {r+1} tersinkron ke B',B.evaluate('__L.st.c')==A.evaluate('__L.st.c'),A.evaluate('__L.st.c'))
        A.wait_for_timeout(1500)
        cek(f'babak {r+1} terkunci di A dan B',A.evaluate('__L.st.r')==r+1 and B.evaluate('__L.st.r')==r+1,(A.evaluate('__L.st.r'),B.evaluate('__L.st.r')))
        if r==0:A.screenshot(path='/tmp/v3-rev.png')
        for pg in (A,B):
            pg.bring_to_front()
            if pg.is_visible('#rev'):pg.click('#rev-ok')
        skor.append(A.evaluate('__L.P1.skorRonde(%d,__L.st.sr[%d],__L.st.w[%d]).skor'%(r,r,r)))
    A.wait_for_timeout(500);A.bring_to_front()
    cek('hasil akhir tampil di A',A.is_visible('#hasil'))
    cek('skor ketat tapi dapat dicapai',all(80<=s<=100 for s in skor),skor)
    print('tabel:',A.inner_text('#w-tabel').replace('\n',' | ').replace('\t',' '))
    A.screenshot(path='/tmp/v3-hasil.png')
    # laporan papan ke tim lain
    C.bring_to_front();C.wait_for_timeout(2500)
    cek('papan di C menerima skor tim merah',(C.evaluate('__L.papanData.merah') or {}).get('s',0)>=80,C.evaluate('__L.papanData'))
    # pendatang baru setim menerima state
    D=masuk(ctx,'Dedi','merah',errs);D.wait_for_timeout(6500)
    cek('pendatang baru menerima state',D.evaluate('__L.st.r')==3,D.evaluate('__L.st.r'))
    # anggaran
    cek('jeda posisi 2 pemain di batas bawah',A.evaluate('__L.jedaPos()')<=400,A.evaluate('__L.jedaPos()'))
    A.evaluate('__L.sim.on=true');cek('simulasi kelas 40',A.evaluate('__L.ntot()')==40 and A.evaluate('__L.jedaPos()')==4000)
    cek('tanpa galat konsol',not errs,errs)
    hilang=cek_event_terdaftar();cek('semua event jaringan terdaftar di kanal',not hilang,str(hilang))
    print('SEMUA LULUS' if ok else 'ADA YANG GAGAL')
    b.close()
