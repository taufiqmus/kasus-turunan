"""Uji pencatatan hasil ke sesi kelas: formulir token+NIM, payload simpan_hasil per anggota, tanpa token tidak mencatat.
RPC Supabase dicegat (tidak menyentuh server sungguhan)."""
import json
from playwright.sync_api import sync_playwright
URL='http://localhost:8077/integral/index.html?lokal=1'
ARGS=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']
ok=True
def cek(nama,kond,info=''):
    global ok;print(('OK  ' if kond else 'GAGAL ')+nama,info if not kond else '');ok=ok and bool(kond)
PANGGIL=[];MODE={'masuk':'ok'}
def rpc(route):
    req=route.request;fn=req.url.split('/rpc/')[1].split('?')[0];body=json.loads(req.post_data or '{}');PANGGIL.append((fn,body))
    if fn=='masuk':
        if MODE['masuk']=='tolak':return route.fulfill(status=400,content_type='application/json',headers={'access-control-allow-origin':'*'},body=json.dumps({'message':'Token tidak dikenal.'}))
        return route.fulfill(status=200,content_type='application/json',headers={'access-control-allow-origin':'*'},body=json.dumps({'kunci':'kunci-'+body['p_nim'],'username':body['p_username'],'sesi':'Uji'}))
    return route.fulfill(status=200,content_type='application/json',headers={'access-control-allow-origin':'*'},body='null')
def baru(ctx,errs,nama):
    pg=ctx.new_page()
    pg.on('pageerror',lambda e:errs.append(nama+': '+str(e)))
    pg.on('console',lambda m:errs.append(nama+': '+m.text) if m.type=='error' and 'ERR_' not in m.text and 'Failed to load' not in m.text and 'status of 4' not in m.text else None)
    pg.route('**/fonts.g*/**',lambda r:r.abort())
    return pg
def masuk(pg,nama,tim,token=None,nim=None):
    pg.goto(URL);pg.fill('#in-nama',nama);pg.click(f'#in-tim .tab[data-t="{tim}"]')
    if token:
        pg.evaluate("document.getElementById('kls').open=true");pg.fill('#in-token',token)
    if nim:pg.fill('#in-nim',nim)
    pg.click('#b-masuk')
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=ARGS)
    ctx=b.new_context(viewport={'width':1000,'height':620});errs=[]
    ctx.route('**/rest/v1/rpc/**',rpc)
    # 1. token ditolak server: tetap di formulir dengan pesan
    MODE['masuk']='tolak';pg=baru(ctx,errs,'X');masuk(pg,'Xena','merah','SALAH-1','2201999');pg.wait_for_timeout(600)
    cek('token ditolak: tetap di formulir dengan pesan',pg.is_visible('#masuk') and 'Token tidak dikenal' in pg.inner_text('#m-msg'),pg.inner_text('#m-msg'))
    cek('pesan menyarankan bermain tanpa pencatatan','tanpa pencatatan' in pg.inner_text('#m-msg'))
    # 2. NIM kosong atau tidak valid ditolak di klien (tanpa panggilan server)
    n0=len(PANGGIL);pg.fill('#in-nim','12');pg.click('#b-masuk');pg.wait_for_timeout(200)
    cek('NIM tidak valid ditolak di klien',pg.is_visible('#masuk') and len(PANGGIL)==n0)
    pg.close();MODE['masuk']='ok'
    # 3. dua anggota bertoken dan satu pemain tanpa token
    A=baru(ctx,errs,'A');B=baru(ctx,errs,'B');D=baru(ctx,errs,'D')
    masuk(A,'Ani','merah','CT-UJI','2201001');masuk(B,'Budi','merah','CT-UJI','2201002')
    D.goto(URL);D.fill('#in-nama','Dewi');D.evaluate("document.getElementById('kls').open=true");D.fill('#in-token','');D.fill('#in-kode','CT-UJI');D.click('#in-tim .tab[data-t="merah"]');D.click('#b-masuk')
    for pg in (A,B,D):pg.wait_for_timeout(900)
    cek('kode ruang mengikuti token',A.inner_text('#c-ruang')=='Ruang CT-UJI',A.inner_text('#c-ruang'))
    cek('masuk dipanggil dengan token, username, NIM',('masuk',{'p_token':'CT-UJI','p_username':'Ani','p_nim':'2201001'}) in PANGGIL,PANGGIL[:3])
    cek('pemain tanpa token tidak memanggil masuk',not any(f=='masuk' and x['p_username']=='Dewi' for f,x in PANGGIL))
    A.evaluate("__L.gerbang"); g=A.evaluate('__L.gerbang[5]')
    def kePad(*pgs):
        for pg in pgs:pg.bring_to_front();pg.evaluate("__L.tp(12.5,6.6)");pg.wait_for_timeout(300)
    def keluarPad(*pgs):
        for pg in pgs:pg.bring_to_front();pg.evaluate("__L.tp(0,9)");pg.wait_for_timeout(300)
    for pg in (A,B):
        pg.bring_to_front();pg.evaluate(f"__L.tp({g['x']},{g['z']})");pg.wait_for_timeout(400);pg.keyboard.press('f');pg.wait_for_timeout(600)
    kePad(A,B);A.bring_to_front();A.wait_for_timeout(5500)
    cek('babak 1 Pos 6 mulai',A.evaluate('__L.ALUR[6].st.f')==1 and B.evaluate('__L.ALUR[6].st.f')==1)
    keluarPad(A,B);A.bring_to_front()
    K=A.evaluate("__L.P6.soal6(0).map(q=>q.b+1)");jaw=[K[0],K[1],(K[2]%4)+1]
    A.evaluate(f"(()=>{{const A=__L.ALUR[6];{jaw}.forEach((v,i)=>A.ubahSlot(i,v));A.flush();}})()");A.wait_for_timeout(1500)
    kePad(A,B);A.bring_to_front();A.wait_for_timeout(3500)
    cek('babak 1 terkunci',A.evaluate('__L.ALUR[6].st.r')==1 and B.evaluate('__L.ALUR[6].st.r')==1)
    A.wait_for_timeout(800)
    sim=[x for f,x in PANGGIL if f=='simpan_hasil']
    cek('dua anggota bertoken mencatat (satu baris tiap orang)',len(sim)==2 and {x['p_kunci'] for x in sim}=={'kunci-2201001','kunci-2201002'},[ (x['p_kunci'],x['p_kasus']) for x in sim])
    if sim:
        x=sim[0];r=x['p_rincian']
        cek('kasus int-p6-b1 dan token benar',x['p_kasus']=='int-p6-b1' and x['p_token']=='CT-UJI',x['p_kasus'])
        cek('skor 67 (dua dari tiga benar) dan detik wajar',x['p_skor'] in range(60,68) and 0<=x['p_detik']<=86400,(x['p_skor'],x['p_detik']))
        cek('rincian lengkap',r['pos']==6 and r['r']==1 and r['tim']=='merah' and r['ruang']=='CT-UJI' and r['v']==1 and r['a']==67,r)
        cek('miskonsepsi Pos 6 tercatat untuk stasiun Puncak',len(r['c'])==1 and r['c'][0].startswith('k2|'),r['c'])
        cek('jawaban tim ikut tercatat',r['s']==jaw,(r['s'],jaw))
        cek('ukuran rincian jauh di bawah batas 4 KB',len(json.dumps(r))<1200,len(json.dumps(r)))
    D.bring_to_front();D.wait_for_timeout(500);cek('Dewi (setim, tanpa token) ikut melihat babak terkunci',D.evaluate('__L.ALUR[6].st.r')==1,(D.evaluate('__L.ALUR[6].st.r'),D.evaluate('[...__L.tim.values()].map(p=>p.nama+":"+p.a)'),D.inner_text('#c-ruang')))
    cek('Dewi tidak memanggil simpan_hasil (total tetap dua baris)',len(sim)==2)
    # semua pos memakai hook yang sama: periksa bentuk payload tiap pos lewat pemanggilan langsung
    n0=len([1 for f,x in PANGGIL if f=='simpan_hasil'])
    A.bring_to_front()
    A.evaluate("""(()=>{
      const P1=__L.P1,c=Array(P1.BABAK[0]?6:6).fill(1);
      __L.catatBabak(1,0,c,600,P1.skorRonde(0,c,600));
      for(const k of [2,3,4,5]){const Al=__L.ALUR[k],s=Al.P.stateBabak(0).s;__L.catatBabak(k,0,s,500,Al.P.skorRonde(0,s,500));}
    })()""")
    A.wait_for_timeout(600)
    baru_=[x for f,x in PANGGIL if f=='simpan_hasil'][n0:]
    ks=sorted(x['p_kasus'] for x in baru_)
    cek('tiap pos 1 sampai 5 mencatat dengan nama kasus sendiri',ks==['int-p1-b1','int-p2-b1','int-p3-b1','int-p4-b1','int-p5-b1'],ks)
    cek('detik dan skor di dalam batas tabel',all(0<=x['p_detik']<=86400 and 0<=x['p_skor']<=100 for x in baru_),[(x['p_kasus'],x['p_skor'],x['p_detik']) for x in baru_])
    cek('Pos 1 mencatat arah galat luas bila belum akurat',any(x['p_kasus']=='int-p1-b1' and x['p_rincian']['c'] and x['p_rincian']['c'][0] in ('luasLebih','luasKurang') for x in baru_))
    # audit menampilkan status sesi
    A.click('#b-menu') if A.is_visible('#b-menu') else None
    A.evaluate("document.getElementById('audit').hidden=false;");A.evaluate("document.getElementById('b-audit').click()")
    A.wait_for_timeout(200)
    cek('audit melaporkan sesi dan jumlah tersimpan','CT-UJI' in A.inner_text('#a-sesi') and 'tersimpan' in A.inner_text('#a-sesi'),A.inner_text('#a-sesi'))
    cek('tanpa galat konsol',not errs,errs[:5])
    print('SEMUA LULUS' if ok else 'ADA YANG GAGAL')
    b.close()
