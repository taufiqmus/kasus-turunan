from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox']);pg=b.new_page(viewport={'width':1000,'height':800});errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)));pg.route('**/fonts.g*/**',lambda r:r.abort())
    pg.goto('http://localhost:8077/index.html');pg.click('#b-demo');pg.wait_for_timeout(300)
    print('ready',pg.evaluate("document.querySelectorAll('.kc:not([disabled])').length"),'segera',pg.evaluate("document.querySelectorAll('.kc[disabled]').length"),errs)
    pg.screenshot(path='/tmp/t/portal.png',full_page=True)
    pg.click('.kc >> nth=4');pg.wait_for_selector('#b-start');print(pg.url)
