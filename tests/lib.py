from playwright.sync_api import sync_playwright
import sys
class Run:
    def __init__(s,p,kas,vp=None,mobile=False):
        s.b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        c=s.b.new_context(viewport=vp or {'width':1100,'height':640},has_touch=mobile,is_mobile=mobile)
        s.pg=c.new_page();s.errs=[]
        s.pg.on('pageerror',lambda e:s.errs.append(str(e)))
        s.pg.on('console',lambda m:s.errs.append(m.text) if m.type=='error' and 'ERR_' not in m.text and 'Failed' not in m.text else None)
        s.pg.route('**/fonts.g*/**',lambda r:r.abort())
        s.pg.add_init_script('window.__TEST__=true;sessionStorage.setItem("kt-sesi",JSON.stringify({kunci:null,token:null,user:"Uji"}))')
        s.pg.goto('http://localhost:8077/play.html?kasus='+kas);s.pg.wait_for_selector('#b-start');s.pg.click('#b-start')
    def ev(s,js):return s.pg.evaluate(js)
    def ui(s):return s.ev('__G.S.ui')
    def wait(s,ms):s.pg.wait_for_timeout(ms)
    def skipcine(s):
        s.wait(1500);s.ev('__G.endCine()');s.wait(300)
    def clr(s):
        for _ in range(20):
            if s.ui()!='dlg':break
            s.pg.keyboard.press('e');s.wait(40)
    def goto(s,k):
        t=s.ev(f'__G.TG["{k}"]');s.ev(f"__G.tp({t['x']},{t['y']})");s.wait(80)
    def talk(s,k):
        s.clr();s.goto(k);s.pg.keyboard.press('e');s.wait(80);s.clr()
    def tab(s,name):
        s.ev("m=>{document.querySelectorAll('#gp-tabs .tab').forEach(b=>{if(b.textContent.trim()===m)b.click()})}".replace('m=>','')) if False else s.pg.evaluate("m=>{document.querySelectorAll('#gp-tabs .tab').forEach(b=>{if(b.textContent.trim()===m)b.click()})}",name)
    def lock(s,t,save=True):
        s.ev(f'()=>{{__G.GP.locked=true;__G.GP.A=__G.GP.B={t};__G.gpDraw()}}')
        r=s.pg.inner_text('#gp-read').replace('\n',' | ')[:120]
        if save:s.pg.click('#gp-save')
        return r
    def accuse(s,who,why):
        s.pg.wait_for_selector('#accuse:not([hidden])')
        s.pg.click(f'#ac-who .pick:nth-child({who})');s.pg.click(f'#ac-why .pick:nth-child({why})');s.pg.click('#ac-go')
        m=s.pg.inner_text('#ac-msg');return m
    def teori(s):
        s.clr();s.pg.click('#b-teori');s.wait(150);n=s.ev("[...document.querySelectorAll('#te-list summary')].length");s.pg.click('#te-close');return n
    def board(s):
        s.clr();s.pg.click('#b-board');s.wait(150);t=s.pg.inner_text('#bd-list');s.pg.click('#bd-close');return t
    def finish(s):
        for _ in range(30):
            if s.ev('!document.getElementById("end").hidden'):break
            s.pg.keyboard.press('e');s.wait(60)
        s.pg.wait_for_selector('#end:not([hidden])');s.wait(200)
        return s.pg.inner_text('#e-score')
    def shot(s,n):s.pg.screenshot(path='/tmp/t/'+n+'.png')
