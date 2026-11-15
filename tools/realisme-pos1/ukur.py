"""Ukur Pos 1 dan ambil screenshot dari 3 sudut kamera sutradara.

Pakai (server di port 8077 harus hidup):
    python3 tools/realisme-pos1/ukur.py LABEL [KONFIG ...]
KONFIG = tingkat+gaya, misal 3r 3s 4r 4s (tingkat 0..4, gaya r=realistik s=sinematik). Bawaan: 3r 3s.
Keluaran: tools/realisme-pos1/LABEL_<sudut>_<konfig>.png dan LABEL.json (draw call, fps, unduhan).

Catatan: fps diukur dengan jam asli di Chrome headless (rendering perangkat lunak SwiftShader), jadi
angka mutlaknya jauh di bawah HP sungguhan. Yang bermakna hanya perbandingan sebelum dan sesudah.
Draw call dihitung dengan membungkus drawElements/drawArrays WebGL, dibagi jumlah frame.
"""
import sys,os,json,time
from playwright.sync_api import sync_playwright
ARGS=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']
HERE=os.path.dirname(os.path.abspath(__file__))
LABEL=sys.argv[1];CFG=sys.argv[2:] or ['3r','3s']
SUDUT={
 'papan':([0,4.6,15],[0,4.6,-3],40),
 'kolom':([-9,4.5,15],[0,2.0,2.4],55),
 'bendungan':([-26,11,24],[0,5,-4],50),
}
HITUNG="""(()=>{
  const T={dc:0,tri:0,frame:0};window.__HIT=T;
  for(const C of [WebGL2RenderingContext,WebGLRenderingContext]){
    const P=C.prototype;
    for(const k of ['drawElements','drawArrays','drawElementsInstanced','drawArraysInstanced']){
      const o=P[k];if(!o)continue;
      P[k]=function(m,a,b,c,d){T.dc++;
        const inst=(k.endsWith('Instanced')?(k==='drawElementsInstanced'?d:c):1)||1;
        if(m===4)T.tri+=Math.floor(((k.startsWith('drawElements')?a:b)||0)/3)*inst;
        return o.apply(this,arguments);};
    }
  }
  const raf=window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame=f=>raf(t=>{T.frame++;f(t);});
})();"""
def rekam(cfg,hasil,pg,L):
    q,g=int(cfg[0]),cfg[1]
    pg.evaluate(f"__L.setGrafis({q},'{g}',true)")
    for _ in range(80):
        if pg.evaluate("(__L.grafis.siap!==false)"):break
        pg.wait_for_timeout(250)
    pg.wait_for_timeout(1200)
    for nama,(P,Lk,fov) in SUDUT.items():
        pg.evaluate("([p,l,f])=>{window.__KAM={p,l,fov:f,sembunyi:true};}",[P,Lk,fov]);pg.wait_for_timeout(900)
        pg.screenshot(path=os.path.join(HERE,f'{LABEL}_{nama}_{cfg}.png'))
    # draw call dan fps pada sudut papan (pandangan yang paling sering)
    P,Lk,fov=SUDUT['kolom']
    pg.evaluate("([p,l,f])=>{window.__KAM={p,l,fov:f,sembunyi:true};}",[P,Lk,fov]);pg.wait_for_timeout(600)
    a=pg.evaluate("({...__HIT})");t0=time.time();pg.wait_for_timeout(6000);b=pg.evaluate("({...__HIT})");dt=time.time()-t0
    fr=max(1,b['frame']-a['frame'])
    hasil[cfg]={'draw_call_per_frame':round((b['dc']-a['dc'])/fr,1),'segitiga_per_frame':round((b['tri']-a['tri'])/fr),'fps_swiftshader':round(fr/dt,1)}
    print(cfg,hasil[cfg],flush=True)
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=ARGS)
    ctx=b.new_context(viewport={'width':1280,'height':720})
    pg=ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.on('console',lambda m:errs.append(m.text) if m.type=='error' and 'ERR_' not in m.text and 'Failed to load' not in m.text and '404' not in m.text else None)
    pg.route('**/fonts.g*/**',lambda r:r.abort())
    pg.add_init_script(HITUNG)
    t0=time.time()
    pg.goto('http://localhost:8077/integral/index.html?lokal=1&kode=UKUR29&sutradara=1',wait_until='load')
    pg.wait_for_function('window.__L!==undefined');t_muat=time.time()-t0
    muat=pg.evaluate("performance.getEntriesByType('resource').map(r=>[r.name,r.transferSize||r.encodedBodySize||0])")
    hasil={'muat_hingga_lobi_dtk':round(t_muat,2),'unduhan_awal_kb':round(sum(x[1] for x in muat)/1024,1),'berkas_awal':len(muat)}
    pg.fill('#in-nama','Ani');pg.click('#in-tim .tab[data-t="merah"]');pg.click('#b-masuk');pg.wait_for_timeout(2500)
    pg.add_style_tag(content="#lhud,#arhud,#ar2,#peta,#stam,#b-lari,#b-lompat,#joy-tips,#aksi,#ltoast,#c-koin,#b-pos,#b-kam,#b-menu,#boost,#roda,#rev,#hasil,#w-pos,.modal{display:none!important}")
    g=pg.evaluate('__L.gerbang[0]');pg.evaluate(f"__L.tp({g['x']},{g['z']})");pg.wait_for_timeout(600)
    pg.keyboard.press('f');pg.wait_for_timeout(2500)
    n=3;xs=[i*3/n for i in range(n)]
    pg.evaluate("""([n,xs])=>{const f=__L.P1.KURVA[0].f;__L.arena.setBabak({n,xs,rumus:'y = x²',aturan:'Tinggi kolom = nilai y di titik kiri kolom',fKurva:f});}""",[n,xs])
    pg.evaluate("__L.arena.setBags([0,2,8])")
    pg.evaluate("__L.me.grp.traverse(o=>{if(o.isSprite)o.visible=false})");pg.evaluate("__L.tp(24,9)");pg.wait_for_timeout(800)
    hasil['area']=pg.evaluate('__L.me.a')
    for c in CFG:rekam(c,hasil,pg,LABEL)
    allr=pg.evaluate("performance.getEntriesByType('resource').map(r=>[r.name,r.transferSize||r.encodedBodySize||0])")
    hasil['unduhan_total_kb']=round(sum(x[1] for x in allr)/1024,1)
    hasil['unduhan_aset_kb']=round(sum(x[1] for x in allr if '/aset/' in x[0])/1024,1)
    hasil['error_halaman']=errs[:5]
    b.close()
json.dump(hasil,open(os.path.join(HERE,LABEL+'.json'),'w'),indent=1,ensure_ascii=False)
print(json.dumps(hasil,indent=1,ensure_ascii=False))
