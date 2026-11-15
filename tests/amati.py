"""Uji mode Pengamat (dosen): gerbang pemilik sesi, hanya-dengar (tidak hadir, tidak mengirim selain minta, tidak memengaruhi siap/mulai/kunci),
pantau Pos 6 dari awal sampai babak terkunci, ganti tim lalu sinkron ulang keadaan. Mode luring antar-tab, API Supabase dicegat."""
import json
from playwright.sync_api import sync_playwright
KODE='AMT-1'
URL='http://localhost:8077/integral/index.html?lokal=1'
ARGS=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']
ok=True
def cek(nama,kond,info=''):
    global ok;print(('OK  ' if kond else 'GAGAL ')+nama,info if not kond else '');ok=ok and bool(kond)
CORS={'access-control-allow-origin':'*','access-control-allow-headers':'authorization, apikey, content-type, x-client-info','access-control-allow-methods':'GET, POST, OPTIONS'}
def api(route):
    u=route.request.url
    if route.request.method=='OPTIONS':return route.fulfill(status=204,headers=CORS)
    if '/auth/v1/token' in u:return route.fulfill(status=200,content_type='application/json',headers=CORS,body=json.dumps({'access_token':'at','refresh_token':'rt','user':{'email':'dosen@uji'}}))
    if '/rest/v1/sesi' in u:
        ada='token=eq.'+KODE in u
        return route.fulfill(status=200,content_type='application/json',headers=CORS,body=json.dumps([{'id':'1','nama':'Uji','status':'open'}] if ada else []))
    return route.fulfill(status=200,content_type='application/json',headers=CORS,body='null')
def baru(ctx,errs,nama):
    pg=ctx.new_page()
    pg.on('pageerror',lambda e:errs.append(nama+': '+str(e)))
    pg.on('console',lambda m:errs.append(nama+': '+m.text) if m.type=='error' and 'ERR_' not in m.text and 'Failed to load' not in m.text and 'status of 4' not in m.text else None)
    pg.route('**/fonts.g*/**',lambda r:r.abort())
    return pg
def pemain(pg,nama,tim):
    pg.goto(URL+'&kode='+KODE);pg.fill('#in-nama',nama);pg.click(f'#in-tim .tab[data-t="{tim}"]');pg.click('#b-masuk');pg.wait_for_timeout(800)
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=ARGS)
    ctx=b.new_context(viewport={'width':1100,'height':640});errs=[]
    ctx.route('**/auth/v1/**',api);ctx.route('**/rest/v1/**',api)
    # 1. gerbang: token bukan milik akun ditolak, formulir login muncul bila belum masuk
    O=baru(ctx,errs,'O');O.goto(URL+'&amati=1&token=SALAH-1&kode=SALAH-1')
    cek('mode pengamat menampilkan kartu pengamat, bukan kartu pemain',O.is_visible('#kartu-amat') and not O.is_visible('#kartu-main'))
    cek('belum login: kolom email dan kata sandi tampil',O.is_visible('#am-em'))
    O.click('#b-amat');O.wait_for_timeout(300)
    cek('tanpa email dan sandi ditolak dengan pesan','email dan kata sandi' in O.inner_text('#am-msg'),O.inner_text('#am-msg'))
    O.fill('#am-em','dosen@uji');O.fill('#am-pw','x');O.click('#b-amat');O.wait_for_timeout(600)
    cek('token bukan milik akun ditolak',O.is_visible('#kartu-amat') and 'bukan milik' in O.inner_text('#am-msg') and not O.is_visible('#amat'),O.inner_text('#am-msg'))
    # 2. token yang benar (login sudah tersimpan di sesi peramban)
    O.fill('#am-token',KODE);O.click('#b-amat');O.wait_for_timeout(900)
    cek('pemilik sesi masuk: panel pengamat tampil dengan 8 tombol tim',O.is_visible('#amat') and O.locator('#am-tim .btn').count()==8,O.locator('#am-tim .btn').count())
    cek('kode ruang mengikuti token',O.inner_text('#c-ruang')=='Ruang AMT-1',O.inner_text('#c-ruang'))
    cek('pengamat tidak punya tombol aksi pemain',not O.is_visible('#aksi') and not O.is_visible('#b-lompat') and not O.is_visible('#b-pos'))
    # 3. dua pemain setim
    A=baru(ctx,errs,'A');B=baru(ctx,errs,'B');pemain(A,'Ani','merah');pemain(B,'Budi','merah')
    O.bring_to_front();O.locator('#am-tim .btn',has_text='Merah').click();O.wait_for_timeout(3500)
    nm=O.evaluate("[...__L.tim.values()].map(p=>p.nama).sort()")
    cek('pengamat melihat Ani dan Budi di tim Merah',nm==['Ani','Budi'],nm)
    A.bring_to_front();A.wait_for_timeout(300)
    cek('pengamat tidak muncul sebagai anggota di sisi pemain (hanya Budi yang terlihat A)',A.evaluate("[...__L.tim.values()].map(p=>p.nama)")==['Budi'],A.evaluate("[...__L.tim.values()].map(p=>p.nama)"))
    cek('pengamat hanya mengirim minta',O.evaluate('__L.rt.terkirim')==['minta'],O.evaluate('__L.rt.terkirim'))
    cek('pengamat bukan otoritas dan bukan pemimpin kunci (tidak menyiarkan keadaan)',O.evaluate('__L.hit.kirim')<=1,O.evaluate('__L.hit.kirim'))
    # 4. A dan B ke Pos 6, mulai babak 1 saat pengamat terhubung
    g=A.evaluate('__L.gerbang[5]')
    def kePad(*pgs):
        for pg in pgs:pg.bring_to_front();pg.evaluate("__L.tp(12.5,6.6)");pg.wait_for_timeout(300)
    def keluarPad(*pgs):
        for pg in pgs:pg.bring_to_front();pg.evaluate("__L.tp(0,9)");pg.wait_for_timeout(300)
    for pg in (A,B):
        pg.bring_to_front();pg.evaluate(f"__L.tp({g['x']},{g['z']})");pg.wait_for_timeout(400);pg.keyboard.press('f');pg.wait_for_timeout(600)
    O.bring_to_front();idA=O.evaluate("[...__L.tim.values()].find(p=>p.nama==='Ani').id")
    O.evaluate(f"__L.amatIkuti('{idA}')");O.wait_for_timeout(1500)
    cek('mengikuti Ani: pengamat pindah ke area Pos 6 dan melihat arena',O.evaluate('__L.me.a')==6 and O.evaluate('__L.arena6.grup.visible') and O.is_visible('#ar2'),(O.evaluate('__L.me.a')))
    kePad(A,B);A.bring_to_front();A.wait_for_timeout(5800)
    cek('babak 1 Pos 6 mulai walau ada pengamat',A.evaluate('__L.ALUR[6].st.f')==1 and B.evaluate('__L.ALUR[6].st.f')==1)
    O.bring_to_front();O.wait_for_timeout(500)
    cek('pengamat ikut melihat babak berjalan (hitung mundur dan keadaan tersinkron)',O.evaluate('__L.ALUR[6].st.f')==1,O.evaluate('__L.ALUR[6].st.f'))
    cek('HUD pengamat menghitung siap 2/2 (pengamat tidak dihitung)',O.inner_text('#a2-siap')=='2/2',O.inner_text('#a2-siap'))
    # 5. kunci babak
    keluarPad(A,B);A.bring_to_front()
    K=A.evaluate("__L.P6.soal6(0).map(q=>q.b+1)")
    A.evaluate(f"(()=>{{const A=__L.ALUR[6];{K}.forEach((v,i)=>A.ubahSlot(i,v));A.flush();}})()");A.wait_for_timeout(1500)
    kePad(A,B);A.bring_to_front();A.wait_for_timeout(3600)
    cek('babak 1 terkunci oleh tim',A.evaluate('__L.ALUR[6].st.r')==1 and B.evaluate('__L.ALUR[6].st.r')==1)
    O.bring_to_front();O.wait_for_timeout(600)
    cek('pengamat melihat babak terkunci tanpa jendela ulasan yang menghalangi',O.evaluate('__L.ALUR[6].st.r')==1 and not O.is_visible('#rev') and not O.is_visible('#hasil'),(O.evaluate('__L.ALUR[6].st.r')))
    cek('pengamat masih hanya mengirim minta',O.evaluate('__L.rt.terkirim')==['minta'],O.evaluate('__L.rt.terkirim'))
    # 6. kamera bebas bergerak, area bisa dipindah manual
    O.evaluate('__L.amatArea(0)');z0=O.evaluate('__L.me.z');O.keyboard.down('KeyW');O.wait_for_timeout(700);O.keyboard.up('KeyW')
    cek('kamera bebas di lobi bergerak dengan WASD',abs(O.evaluate('__L.me.z')-z0)>2,(z0,O.evaluate('__L.me.z')))
    cek('pindah area manual ke lobi menampilkan lobi',O.evaluate('__L.me.a')==0 and O.evaluate('__L.amatMode')=='bebas')
    # 7. ganti tim kosong lalu kembali: keadaan di-reset lalu disinkronkan lagi
    O.locator('#am-tim .btn',has_text='Biru').click();O.wait_for_timeout(1200)
    cek('pindah ke tim Biru (kosong): daftar anggota kosong dan keadaan di-reset',O.evaluate('__L.tim.size')==0 and O.evaluate('__L.ALUR[6].st.r')==0)
    O.locator('#am-tim .btn',has_text='Merah').click();O.wait_for_timeout(4500)
    cek('kembali ke Merah: keadaan Pos 6 tersinkron ulang lewat minta (babak 2)',O.evaluate('__L.ALUR[6].st.r')==1 and O.evaluate('__L.tim.size')==2,(O.evaluate('__L.ALUR[6].st.r'),O.evaluate('__L.tim.size')))
    cek('pemain tidak terganggu: A dan B tetap di babak 1 terkunci dan hanya melihat satu sama lain',A.evaluate('__L.ALUR[6].st.r')==1 and A.evaluate('__L.tim.size')==1)
    # 8. tautan dari dashboard: tim terpilih otomatis lewat parameter
    O2=baru(ctx,errs,'O2');O2.goto(URL+'&amati=1&token='+KODE+'&kode='+KODE+'&tim=merah');O2.fill('#am-em','dosen@uji');O2.fill('#am-pw','x');O2.click('#b-amat');O2.wait_for_timeout(4500)
    cek('tautan dengan parameter tim langsung memantau tim itu',O2.evaluate('__L.saya.tim')=='merah' and O2.evaluate('__L.tim.size')==2,(O2.evaluate('__L.saya.tim'),O2.evaluate('__L.tim.size')))
    cek('panel dapat diciutkan',(O2.click('#am-lipat'),O2.is_hidden('#am-info'))[1])
    cek('tanpa galat konsol',not errs,errs[:5])
    print('SEMUA LULUS' if ok else 'ADA YANG GAGAL')
    b.close()
