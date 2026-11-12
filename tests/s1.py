from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
    pg=b.new_page(viewport={'width':1100,'height':620})
    errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.on('console',lambda m:errs.append(m.text) if m.type=='error' and 'ERR_' not in m.text and 'Failed to load' not in m.text else None)
    pg.route('**/fonts.g*/**',lambda r:r.abort())
    pg.add_init_script('window.__TEST__=true;sessionStorage.setItem("kt-sesi",JSON.stringify({kunci:null,token:null,user:"Uji"}))')
    pg.goto('http://localhost:8077/play.html?kasus=jalan-raya/tilang-1')
    pg.wait_for_selector('#b-start');pg.click('#b-start');pg.wait_for_timeout(1700)
    pg.screenshot(path='/tmp/t/a1.png')
    pg.wait_for_timeout(2300);pg.screenshot(path='/tmp/t/a2.png')
    pg.evaluate('__G.endCine()');pg.wait_for_timeout(600);pg.screenshot(path='/tmp/t/a3.png')
    def talk(x,y,n=12):
        pg.evaluate(f'__G.tp({x},{y})');pg.wait_for_timeout(80)
        for _ in range(n):
            if pg.evaluate('__G.S.ui') not in('none','dlg'):break
            pg.keyboard.press('e');pg.wait_for_timeout(40)
            if pg.evaluate('__G.S.ui')=='none' and _>0:break
    def ui():return pg.evaluate('__G.S.ui')
    talk(415,610);print('case',pg.evaluate('__G.S.flags'))
    pg.evaluate('__G.tp(540,1190)');pg.keyboard.down('d');pg.wait_for_timeout(1500);pg.screenshot(path='/tmp/t/a4.png')
    pg.wait_for_function('!document.getElementById("gp").hidden',timeout=15000);pg.keyboard.up('d')
    pg.wait_for_timeout(200);pg.screenshot(path='/tmp/t/a5.png')
    def drag(t0,t1,Tmax):
        box=pg.locator('#gp-cv').bounding_box();w=box['width']
        X=lambda t:box['x']+46+(t/Tmax)*(w-46-14)
        pg.mouse.move(X(t0),box['y']+150);pg.mouse.down();pg.mouse.move(X((t0+t1)/2),box['y']+150);pg.mouse.move(X(t1),box['y']+150);pg.mouse.up()
    g=pg.evaluate('({A:__G.GP.A,B:__G.GP.B,T:__G.GP.Tmax})')
    drag(g['B'],g['A'],g['T']);pg.wait_for_timeout(600)
    print('locked',pg.evaluate('__G.GP.locked'),pg.inner_text('#gp-read')[:80])
    pg.click('#gp-save');pg.click('#gp-close')
    talk(415,610);print('surat',pg.evaluate('__G.S.flags.surat'))
    pg.evaluate('__G.tp(1255,835)');pg.keyboard.press('e');pg.wait_for_timeout(200)
    pg.screenshot(path='/tmp/t/a6.png')
    for m in ['biru','merah','hijau']:
        pg.evaluate("m=>{document.querySelectorAll('#gp-tabs .tab').forEach(b=>{if(b.textContent.toLowerCase().includes(m))b.click()})}",m)
        if not pg.evaluate('__G.GP.locked'):
            g=pg.evaluate('({A:__G.GP.A,B:__G.GP.B,T:__G.GP.Tmax})');drag(g['B'],g['A'],20)
        g=pg.evaluate('({A:__G.GP.A})');tc=pg.evaluate("m=>__G.MOTORS[m].tc",m)
        drag(g['A'],tc+0.05,20);pg.wait_for_timeout(100)
        print(m,pg.inner_text('#gp-num').replace('\n',' '),pg.inner_text('#gp-read')[:70].replace('\n',' | '))
        pg.click('#gp-save')
    pg.screenshot(path='/tmp/t/a7.png');pg.click('#gp-close')
    talk(415,610);pg.wait_for_selector('#accuse:not([hidden])')
    pg.click('#ac-who .pick:nth-child(2)');pg.click('#ac-why .pick:nth-child(2)');pg.click('#ac-go');print(pg.inner_text('#ac-msg'))
    pg.click('#ac-who .pick:nth-child(1)');pg.click('#ac-why .pick:nth-child(1)');pg.click('#ac-go')
    for _ in range(6):pg.keyboard.press('e');pg.wait_for_timeout(40)
    talk(390,835);print('alibi',pg.evaluate('__G.S.flags.alibi'))
    pg.wait_for_timeout(1200);pg.screenshot(path='/tmp/t/a8.png')
    talk(415,610);print('ext',pg.evaluate('__G.S.flags.ext'))
    pg.wait_for_timeout(300)
    for _ in range(8):
        if pg.evaluate('__G.S.ui')!='dlg':break
        pg.keyboard.press('e');pg.wait_for_timeout(40)
    pg.click('#b-teori');pg.wait_for_timeout(200);pg.screenshot(path='/tmp/t/te_k1.png');print('kartu',pg.evaluate("[...document.querySelectorAll('#te-list summary')].length"));pg.click('#te-close')
    pg.wait_for_timeout(2500)
    def pin(t):
        pg.evaluate('__G.tp(1255,835)');pg.keyboard.press('e');pg.wait_for_timeout(200)
        g=pg.evaluate('__G.GP.A');drag(g,t/2,70);drag(t/2,t,70)
    pin(28);pg.screenshot(path='/tmp/t/a9.png');pg.click('#gp-pin')
    print('pin',pg.evaluate('__G.S.pin'))
    pg.evaluate('__G.tp(__G.sx(__G.S.pin.s),720)');pg.wait_for_timeout(300);pg.screenshot(path='/tmp/t/a10.png')
    def clr():
        pg.keyboard.press('e');pg.wait_for_timeout(60)
        for _ in range(20):
            if ui()=='none':break
            pg.keyboard.press('e');pg.wait_for_timeout(40)
    clr()
    pin(10);pg.click('#gp-pin');pg.evaluate('__G.tp(__G.sx(__G.S.pin.s),720)');pg.wait_for_timeout(100);clr()
    pin(63);pg.click('#gp-pin');pg.evaluate('__G.tp(__G.sx(__G.S.pin.s),720)');pg.wait_for_timeout(100);clr()
    print('flags',pg.evaluate('__G.S.flags'),pg.evaluate('[__G.S.pA,__G.S.pB]'))
    talk(1045,575);print('motor',pg.evaluate('__G.S.flags.motorFound'))
    pg.screenshot(path='/tmp/t/a11.png')
    talk(415,610);pg.wait_for_selector('#accuse:not([hidden])')
    pg.click('#ac-who .pick:nth-child(4)');pg.click('#ac-why .pick:nth-child(2)');pg.click('#ac-go')
    pg.wait_for_timeout(400);pg.screenshot(path='/tmp/t/a12.png')
    for _ in range(20):
        if ui()=='end':break
        pg.keyboard.press('e');pg.wait_for_timeout(40)
    pg.wait_for_timeout(200);pg.screenshot(path='/tmp/t/a13.png')
    print('score',pg.inner_text('#e-score'),'errs',errs)
    b.close()
