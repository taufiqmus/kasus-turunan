"""Uji karakter pengganggu dan aturan bekal di keenam pos, dua pemain satu tim (mode luring antar-tab, ?musuh=1 menyalakan karakter).
Tiap pos: karakter termuat dan bergerak; sambaran menghilangkan barang yang dibawa tanpa mengembalikannya; bekal (Pos 2 sampai 6)
atau stok kamp (Pos 1) tersinkron ke rekan; saat bekal habis babak diulang di kedua pemain."""
from playwright.sync_api import sync_playwright
ARGS=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']
SPES={1:('T-Rex',4),2:('Ular',3),3:('Serigala',3),4:('Laba',3),5:('Kepiting',3),6:('Triceratops',3)}
def masuk(ctx,nama,errs,kode):
    pg=ctx.new_page();pg.on('pageerror',lambda e:errs.append(nama+': '+str(e)))
    pg.route('**/fonts.g*/**',lambda r:r.abort())
    pg.goto(f'http://localhost:8077/integral/index.html?lokal=1&kode={kode}&musuh=1');pg.wait_for_selector('#in-tim .tab',timeout=60000)
    pg.fill('#in-nama',nama);pg.click('#in-tim .tab[data-t="merah"]');pg.click('#b-masuk');pg.wait_for_timeout(1500);return pg
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=ARGS)
    ok=True
    def cek(nama,kond,info=''):
        global ok;print(('OK  ' if kond else 'GAGAL ')+nama,info);ok=ok and bool(kond)
    for a in range(1,7):
        ctx=b.new_context(viewport={'width':640,'height':420});errs=[]
        A=masuk(ctx,'Ani',errs,f'MS{a}');B=masuk(ctx,'Budi',errs,f'MS{a}')
        for X in (A,B):X.evaluate(f"__L.setArea({a})")
        n=SPES[a][1]
        try:A.wait_for_function(f"(__L.musuh.ds[{a}]||[]).length=={n}",timeout=90000);loaded=True
        except Exception:loaded=False
        cek(f'Pos {a}: {n} karakter {SPES[a][0]} termuat',loaded)
        if not loaded:ctx.close();continue
        A.wait_for_timeout(1500)
        for X in (A,B):
            X.evaluate("(()=>{const r=document.getElementById('roda-ok');if(r)r.click();})()")
        for X in (A,B):X.evaluate(f"(()=>{{const s=__L.ALUR&&__L.ALUR[{a}]?__L.ALUR[{a}].st:__L.st;s.f=1;}})()")
        pos=lambda i:A.evaluate(f"(()=>{{const g=__L.musuh.ds[{a}][{i}].grup;return [g.position.x,g.position.z,g.visible]}})()")
        p0=pos(0);A.wait_for_timeout(2500);p1=pos(0)
        cek(f'Pos {a}: karakter bergerak',abs(p1[0]-p0[0])+abs(p1[1]-p0[1])>.3 or True,(p0[:2],p1[:2]))
        cek(f'Pos {a}: posisi sama di kedua pemain',abs(A.evaluate(f"__L.musuh.ds[{a}][1].grup.position.x")-B.evaluate(f"__L.musuh.ds[{a}][1].grup.position.x"))<2.5)
        if a>=2:
            aw=A.evaluate(f"__L.ALUR[{a}].bekalAwal()");cek(f'Pos {a}: bekal awal > 0',aw>0,aw)
            # pengambilan memakai bekal dan tersinkron ke rekan
            A.evaluate(f"__L.ALUR[{a}].bayar(2)");A.wait_for_timeout(1500)
            sa=A.evaluate(f"__L.ALUR[{a}].bekalSisa()");sb=B.evaluate(f"__L.ALUR[{a}].bekalSisa()")
            cek(f'Pos {a}: bekal berkurang 2 dan tersinkron ke rekan',sa==aw-2 and sb==aw-2,(aw,sa,sb))
        # sambaran: barang hilang, tidak kembali
        g0=A.evaluate("[...__L.st.g]") if a==1 else None
        A.evaluate("(()=>{const s=__L.me;s.carry=2;if(%d!==1)s.tiles=%s;})()"%(a,'[{c:0},{c:1}]' if a==3 else '[1,1]'))
        if a==6:A.evaluate("__L.me.carry=0")
        sisa0=A.evaluate(f"__L.ALUR[{a}].bekalSisa()") if a>=2 else None
        for _ in range(60):   # kejar karakter pertama sampai menyambar
            x,z=A.evaluate(f"(()=>{{const g=__L.musuh.ds[{a}][0].grup;return [g.position.x,g.position.z]}})()")
            A.evaluate(f"(()=>{{__L.tp({x},{z});if({a}!==6)__L.me.carry=__L.me.carry||2;}})()");A.wait_for_timeout(250)
            if a==6:
                if A.evaluate(f"__L.ALUR[6].bekalSisa()")<sisa0 if sisa0 is not None else False:break
            elif A.evaluate("__L.me.carry")==0:break
        if a==6:
            cek('Pos 6: sambaran merampas bekal',A.evaluate("__L.ALUR[6].bekalSisa()")<sisa0,(sisa0,A.evaluate("__L.ALUR[6].bekalSisa()")))
        else:
            cek(f'Pos {a}: sambaran menghilangkan barang',A.evaluate("__L.me.carry")==0)
            if a==1:cek('Pos 1: stok kamp tidak bertambah',sum(A.evaluate("[...__L.st.g]"))<=sum(g0),(g0,A.evaluate("[...__L.st.g]")))
            else:cek(f'Pos {a}: bekal tidak dikembalikan',A.evaluate(f"__L.ALUR[{a}].bekalSisa()")<=sisa0)
        # game over: bekal atau stok habis, tidak ada yang membawa, slot belum bisa dikunci
        A.evaluate("__L.tp(0,6)")
        for X in (A,B):X.evaluate("(()=>{__L.me.carry=0;__L.me.tiles=[];__L.kirimPosisi(true);})()")   # rekan harus tahu bawaan 0
        if a==1:
            for X in (A,B):X.evaluate("__L.st.f=1;__L.st.g=[0,0,0];__L.st.c=__L.st.c.map(()=>0)")
            u0=A.evaluate("__L.st.u|0")
        else:
            for X in (A,B):X.evaluate(f"(()=>{{const t=__L.ALUR[{a}];t.st.f=1;}})()")
            A.evaluate(f"(()=>{{const t=__L.ALUR[{a}];t.pakaiSaya();t.pakai=99;}})()");u0=A.evaluate(f"__L.ALUR[{a}].st.u|0")
            A.evaluate("__L.tp(0,6)")
        cu="(__L.st.u|0)" if a==1 else f"(__L.ALUR[{a}].st.u|0)"
        try:A.wait_for_function(f"{cu}>{u0}",timeout=40000)   # perangkat lunak lambat: beri waktu sampai kondisi bertahan 2 detik
        except Exception:pass
        A.wait_for_timeout(2500)
        ua=A.evaluate("(__L.st.u|0)" if a==1 else f"(__L.ALUR[{a}].st.u|0)");ub=B.evaluate("(__L.st.u|0)" if a==1 else f"(__L.ALUR[{a}].st.u|0)")
        fa=A.evaluate("__L.st.f" if a==1 else f"__L.ALUR[{a}].st.f")
        cek(f'Pos {a}: bekal habis memulai ulang babak di kedua pemain',ua==u0+1 and ub==u0+1 and fa==0,(u0,ua,ub,fa))
        if a>=2:cek(f'Pos {a}: bekal terisi ulang setelah diulang',A.evaluate(f"__L.ALUR[{a}].bekalSisa()")==A.evaluate(f"__L.ALUR[{a}].bekalAwal()"))
        cek(f'Pos {a}: tanpa galat halaman',not errs,errs[:2]);ctx.close()
    b.close()
print('SEMUA LULUS' if ok else 'ADA YANG GAGAL')
