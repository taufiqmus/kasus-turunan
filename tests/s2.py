from playwright.sync_api import sync_playwright
import sys
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
    pg=b.new_page(viewport={'width':1100,'height':640});errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.on('console',lambda m:errs.append(m.text) if m.type=='error' and 'ERR_' not in m.text and 'Failed' not in m.text else None)
    pg.route('**/fonts.g*/**',lambda r:r.abort())
    pg.add_init_script('window.__TEST__=true;sessionStorage.setItem("kt-sesi",JSON.stringify({kunci:null,token:null,user:"Uji"}))')
    pg.goto('http://localhost:8077/play.html?kasus=lemparan/melayang-1')
    pg.wait_for_selector('#b-start');pg.click('#b-start');pg.wait_for_timeout(3300);pg.screenshot(path='/tmp/t/u1.png')
    pg.wait_for_function('__G.S.ui!=="cine"',timeout=15000)
    def ui():return pg.evaluate('__G.S.ui')
    def clr():
        for _ in range(15):
            if ui()!='dlg':break
            pg.keyboard.press('e');pg.wait_for_timeout(40)
    def talk(k):
        clr();t=pg.evaluate(f'__G.TG.{k}');pg.evaluate(f"__G.tp({t['x']},{t['y']})");pg.wait_for_timeout(80);pg.keyboard.press('e');pg.wait_for_timeout(60);clr()
    talk('anto');print('case',pg.evaluate('__G.S.flags'))
    talk('rekaman');pg.wait_for_timeout(200);pg.screenshot(path='/tmp/t/u2.png')
    def meas(tab,t):
        pg.evaluate("m=>{document.querySelectorAll('#gp-tabs .tab').forEach(b=>{if(b.textContent.trim()===m)b.click()})}",tab)
        pg.evaluate(f'()=>{{__G.GP.locked=true;__G.GP.A=__G.GP.B={t};__G.gpDraw()}}');pg.click('#gp-save')
        print(tab,pg.inner_text('#gp-read').replace('\n',' | ')[:100])
    meas('Hantu h',1.5);meas('Hantu x',1.5);pg.click('#gp-close')
    talk('ketapel');print('ui',ui())
    pg.keyboard.press('ArrowUp');pg.wait_for_timeout(50);pg.screenshot(path='/tmp/t/u3.png')
    # bad throw first
    pg.keyboard.press('e');pg.wait_for_timeout(2500);pg.screenshot(path='/tmp/t/u4.png')
    pg.wait_for_function('__G.S.ui==="result"',timeout=20000);pg.screenshot(path='/tmp/t/u5.png')
    pg.keyboard.press('e');pg.wait_for_timeout(100)
    talk('ketapel');pg.evaluate('()=>{__C.AIM.vy=14.7;__C.AIM.vx=8}');pg.keyboard.press('e')
    pg.wait_for_function('__G.S.ui==="result"',timeout=20000);print('match',pg.evaluate('__C.RES.match'));pg.keyboard.press('e');clr()
    print('recon',pg.evaluate('__G.S.flags.recon'))
    for w in ['joko','dimas','rini']:
        talk(w);pg.wait_for_function('__G.S.ui==="none"',timeout=20000)
    print('demos',pg.evaluate('__G.S.flags'))
    talk('rekaman');pg.wait_for_timeout(200)
    for tab,t in [('Joko h',1.5),('Joko x',1),('Dimas h',1.5),('Dimas x',1),('Bu Rini h',1.0),('Bu Rini x',1)]:meas(tab,t)
    pg.screenshot(path='/tmp/t/u6.png');pg.click('#gp-close')
    clr();pg.click('#b-teori');pg.wait_for_timeout(200);pg.screenshot(path='/tmp/t/te_'+'t8.png');print('kartu',pg.evaluate("[...document.querySelectorAll('#te-list summary')].map(x=>x.textContent)"));pg.click('#te-close')
    talk('anto');pg.wait_for_selector('#accuse:not([hidden])')
    pg.click('#ac-who .pick:nth-child(2)');pg.click('#ac-why .pick:nth-child(2)');pg.click('#ac-go');print(pg.inner_text('#ac-msg'))
    pg.click('#ac-who .pick:nth-child(1)');pg.click('#ac-why .pick:nth-child(1)');pg.click('#ac-go');clr()
    talk('joko');pg.wait_for_timeout(2900);talk('anto');print('siaga',pg.evaluate('__G.S.flags.siaga'))
    # miss once, then catch
    talk('pantau');pg.wait_for_timeout(2000);pg.screenshot(path='/tmp/t/u7.png')
    pg.wait_for_function('__G.S.ui==="none"',timeout=20000);pg.wait_for_timeout(400);pg.screenshot(path='/tmp/t/u8.png')
    pg.wait_for_function('__C.FL&&__C.FL.done',timeout=20000);pg.wait_for_timeout(200);pg.screenshot(path='/tmp/t/u9.png');clr()
    print('tries',pg.evaluate('__G.S.tries'))
    talk('pantau');pg.wait_for_function('__G.S.ui==="none"',timeout=20000)
    xl=pg.evaluate('__C.flX(__C.FL.T)');y0=pg.evaluate('__C.FL.y0')
    # run there with keyboard
    pg.keyboard.down('d')
    pg.wait_for_function(f'__G.P.x>={xl}-15',timeout=15000);pg.keyboard.up('d')
    pg.wait_for_function('__C.FL&&__C.FL.done',timeout=20000);pg.wait_for_timeout(300);pg.screenshot(path='/tmp/t/u10.png');clr()
    print('paket',pg.evaluate('__G.S.flags.paket'),pg.evaluate('__G.S.catchPts'))
    talk('gerobak');talk('anto');pg.wait_for_selector('#accuse:not([hidden])')
    pg.click('#ac-who .pick:nth-child(1)');pg.click('#ac-why .pick:nth-child(1)');pg.click('#ac-go')
    for _ in range(16):pg.keyboard.press('e');pg.wait_for_timeout(40)
    pg.wait_for_selector('#end:not([hidden])');pg.screenshot(path='/tmp/t/u11.png')
    print('teori',pg.evaluate("document.querySelectorAll('#te-list details').length"));print('score',pg.inner_text('#e-score'),'errs',errs)
