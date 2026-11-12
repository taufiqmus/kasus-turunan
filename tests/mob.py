import sys;import os;sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from lib import *
cases=[('pasar/cabai-1',"__G.S.flags.case=true","lapak"),('kebun/kolam-1',"__G.S.flags.case=true","drone"),('pantai/bianglala-1',"__G.S.flags.case=true;__G.S.evidence.push({id:'foto',type:'doc',title:'x',text:'x'})","roda"),('bengkel/gigi-1',"__G.S.flags.case=true","mesin"),('teknik/lab-1',"__G.S.flags.case=true","meja"),('lemparan/melayang-1',"__G.S.flags.case=true","ketapel")]
with sync_playwright() as p:
    for vp,nm in [({'width':390,'height':844},'port'),({'width':844,'height':390},'land')]:
        for kas,setup,k in cases:
            r=Run(p,kas,vp=vp,mobile=True);r.wait(300);r.ev('__G.endCine()');r.ev(setup);r.wait(2900)
            r.goto(k);r.pg.keyboard.press('e');r.wait(300)
            tag=kas.split('/')[1]+'_'+nm;r.shot('m_'+tag);print(tag,'ui',r.ui(),'errs',r.errs)
            r.b.close()
