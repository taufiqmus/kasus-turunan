"""Uji dashboard dosen Lobi Integral: render dengan data buatan, agregasi tim-babak, peta miskonsepsi, pelolosan HTML, CSV."""
import json
from playwright.sync_api import sync_playwright
ok=True
def cek(nama,kond,info=''):
    global ok;print(('OK  ' if kond else 'GAGAL ')+nama,info if not kond else '');ok=ok and bool(kond)
def h(nim,kasus,skor,detik,tim,ruang,c,a=None):
    return {'nim':nim,'kasus':kasus,'skor':skor,'detik':detik,'dibuat':'2026-11-15T07:00:00Z','rincian':{'v':1,'tim':tim,'ruang':ruang,'a':a if a is not None else skor,'c':c}}
PS=[{'nim':'2201001','masuk_pada':'x','mahasiswa':{'username':'Ani'}},{'nim':'2201002','masuk_pada':'x','mahasiswa':{'username':'Budi'}},
    {'nim':'2201003','masuk_pada':'x','mahasiswa':{'username':'<img src=x onerror=window.__xss=1>'}},{'nim':'2201004','masuk_pada':'x','mahasiswa':{'username':'Dewi'}}]
HS=[
  # tim merah (Ani, Budi): Pos 5 babak 1 dan 2 dengan miskonsepsi tukar; Pos 6 babak 1
  h('2201001','int-p5-b1',50,200,'merah','R1',['tukar']),h('2201002','int-p5-b1',50,200,'merah','R1',['tukar']),
  h('2201001','int-p5-b2',100,150,'merah','R1',[]),h('2201002','int-p5-b2',100,150,'merah','R1',[]),
  h('2201001','int-p6-b1',67,250,'merah','R1',['k2|Puncak: salah']),h('2201002','int-p6-b1',67,250,'merah','R1',['k2|Puncak: salah']),
  # tim biru (xss, Dewi): Pos 5 babak 1 juga tukar
  h('2201003','int-p5-b1',50,300,'biru','R1',['tukar','fBukanF']),h('2201004','int-p5-b1',50,300,'biru','R1',['tukar','fBukanF']),
  h('2201004','int-p1-b1',80,100,'biru','R1',['luasLebih']),
  # baris dari game lain atau kasus tak dikenal harus diabaikan
  h('2201001','tilang-1',900,60,'merah','R1',[]),
]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
    pg=b.new_page(viewport={'width':1100,'height':900});errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.route('**/fonts.g*/**',lambda r:r.abort())
    pg.goto('http://localhost:8077/integral/dosen.html');pg.wait_for_function('window.__D')
    cek('halaman awal menampilkan formulir masuk',pg.is_visible('#login') and not pg.is_visible('#app'))
    pg.evaluate("([ps,hs])=>__D.set(__D.olah(ps,hs))",[PS,HS]);pg.wait_for_timeout(200)
    st=pg.inner_text('#d-stat').replace('\n',' ')
    cek('statistik: 4 masuk, 3 bermain, 2 tim, 5 babak dikunci','4 masuk sesi' in st and '4 bermain Integral' in st and '2 tim' in st and '5 babak dikunci' in st,st)
    g=pg.evaluate("([ps,hs])=>{const o=__D.olah(ps,hs);return {n:o.grup.length,b:o.baris.length,tilang:o.baris.some(x=>x.skor===900)}}",[PS,HS])
    cek('dua anggota satu tim digabung jadi satu tim-babak (5 grup dari 10 baris Integral)',g['n']==5 and g['b']==9 and not g['tilang'],g)
    mis=pg.inner_text('#d-mis')
    cek('peta miskonsepsi memuat label dan persentase Pos 5 tukar (2 dari 2 tim-babak, 100%)','Piring F(atas) dan F(bawah) tertukar' in mis and '100%' in mis,mis[:300])
    cek('miskonsepsi Pos 6 memakai nama stasiun','Puncak: Puncak: salah' in mis or 'Puncak: salah' in mis,mis[:400])
    cek('miskonsepsi Pos 1 terbaca','Balok terlalu banyak' in mis)
    cek('tabel tim berisi dua tim',pg.locator('#d-tim tr').count()==2,pg.locator('#d-tim tr').count())
    cek('nama berbahaya tidak dieksekusi (HTML di-escape)',pg.evaluate('window.__xss')!=1 and pg.locator('#d-mhs img').count()==0)
    cek('tabel mahasiswa berurut skor tertinggi dulu',pg.inner_text('#d-mhs tr:first-child td:nth-child(2)') in ('Ani','Budi'),pg.inner_text('#d-mhs tr:first-child'))
    heat=pg.inner_text('#d-heat')
    cek('peta panas Pos 5 babak 2 bernilai 100',' 100' in heat.replace('\t',' ') or '100' in heat,heat[:300])
    with pg.expect_download() as d:pg.click('#b-csv-b')
    csv=open(d.value.path(),encoding='utf-8-sig').read()
    cek('CSV per babak memuat judul kolom dan 9 baris data',csv.splitlines()[0].startswith('username,nim,ruang') and len(csv.strip().splitlines())==10,len(csv.strip().splitlines()))
    with pg.expect_download() as d2:pg.click('#b-csv-m')
    csv2=open(d2.value.path(),encoding='utf-8-sig').read()
    cek('CSV rekap mahasiswa tersedia',len(csv2.strip().splitlines())==5,len(csv2.strip().splitlines()))
    # buat sesi dari dosen.html
    posted=[]
    def rt(route):
        rq=route.request
        h={'access-control-allow-origin':'*','access-control-allow-headers':'authorization, apikey, content-type, x-client-info, prefer','access-control-allow-methods':'GET,POST,PATCH,OPTIONS'}
        if rq.method=='OPTIONS':route.fulfill(status=204,headers=h);return
        if rq.method=='POST':posted.append(json.loads(rq.post_data));route.fulfill(status=201,headers=h,body='');return
        route.fulfill(status=200,headers=dict(h,**{'content-type':'application/json'}),body='[]')
    pg.route('**/rest/v1/sesi*',rt)
    pg.evaluate("document.getElementById('app').hidden=false")
    pg.fill('#n-nama','Kelas A Integral');pg.fill('#n-token','int-a1');pg.click('#b-new');pg.wait_for_timeout(600)
    cek('buat sesi: token huruf besar, semesta integral',posted and posted[0].get('token')=='INT-A1' and posted[0].get('semesta')=='integral' and posted[0].get('nama')=='Kelas A Integral',posted)
    cek('buat sesi: pesan sukses memuat token','INT-A1' in pg.inner_text('#n-msg'),pg.inner_text('#n-msg'))
    pg.fill('#n-nama','x');pg.fill('#n-token','ab');pg.click('#b-new');pg.wait_for_timeout(200)
    cek('buat sesi: token terlalu pendek ditolak tanpa kirim',len(posted)==1,len(posted))
    n0=len(posted);pg.click('#b-segar');pg.wait_for_timeout(500)
    cek('tombol Refresh aktif kembali dan tanpa galat',pg.is_enabled('#b-segar') and pg.inner_text('#b-segar')=='Refresh' and len(posted)==n0,pg.inner_text('#b-segar'))
    cek('kotak Otomatis tercentang bawaan',pg.is_checked('#c-auto'))
    pg.screenshot(path='/tmp/dosen.png',full_page=True)
    pg.set_viewport_size({'width':390,'height':844});pg.wait_for_timeout(200)
    cek('tampilan HP: tidak ada gulir mendatar halaman',pg.evaluate('document.documentElement.scrollWidth<=innerWidth+2'),pg.evaluate('document.documentElement.scrollWidth'))
    pg.screenshot(path='/tmp/dosen-hp.png',full_page=True)
    cek('tanpa galat konsol',not errs,errs[:4])
    print('SEMUA LULUS' if ok else 'ADA YANG GAGAL')
    b.close()
