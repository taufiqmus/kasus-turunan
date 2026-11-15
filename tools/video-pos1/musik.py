import numpy as np,wave
from scipy.signal import fftconvolve,butter,lfilter
SR=44100;DUR=37.0;n=int(SR*DUR);t=np.arange(n)/SR
rng=np.random.default_rng(7)
def nada(m):return 440*2**((m-69)/12)
def pad(freqs,start,dur,vol,atk=1.6,rel=2.4):
    L=int(SR*(dur+rel));tt=np.arange(L)/SR;y=np.zeros(L)
    for f in freqs:
        for det in (-.12,0,.12):
            ff=f*(1+det/100*3)
            y+=sum((1/k)*np.sin(2*np.pi*ff*k*tt+rng.uniform(0,6.28)) for k in (1,2,3,4))*0.25
    env=np.minimum(1,tt/atk)*np.minimum(1,np.maximum(0,(dur+rel-tt)/rel));return y*env*vol,int(start*SR)
mix=np.zeros(n)
acord=[(57,60,64),(53,57,60),(48,52,55),(55,59,62)]  # Am F C G
CH=5.75
for i in range(int(DUR/CH)+1):
    ch=acord[i%4];s=i*CH
    y,o=pad([nada(m) for m in ch]+[nada(ch[0]-12)],s,CH,0.09)
    e=min(len(y),n-o)
    if e>0:mix[o:o+e]+=y[:e]
    # bass
    L=int(SR*(CH+1));tt=np.arange(L)/SR;b=np.sin(2*np.pi*nada(ch[0]-24)*tt)*np.minimum(1,tt/.6)*np.minimum(1,np.maximum(0,(CH+1-tt)/1.0))*0.22
    e=min(L,n-int(s*SR))
    if e>0:mix[int(s*SR):int(s*SR)+e]+=b[:e]
# detak pelan (kick lembut) tiap 1,5 detik mulai 8 s, lebih rapat di bagian tengah
def kick(at,vol):
    L=int(SR*.5);tt=np.arange(L)/SR;f=70*np.exp(-tt*14)+38;ph=2*np.pi*np.cumsum(f)/SR
    y=np.sin(ph)*np.exp(-tt*7)*vol;o=int(at*SR);e=min(L,n-o)
    if e>0:mix[o:o+e]+=y[:e]
k=8.0
while k<DUR-5:
    kick(k,0.30 if k<17 else .38);k+=1.5 if k<17 else .75
# bel arpeggio (pola naik) mulai 17 s
arp=[69,72,76,81,76,72]
tt0=np.arange(int(SR*1.6))/SR
k=17.0;j=0
while k<DUR-4:
    ch=acord[int((k)//CH)%4];m=ch[j%3]+12+(12 if j%6>2 else 0)
    f=nada(m);y=(np.sin(2*np.pi*f*tt0)+.35*np.sin(2*np.pi*f*2.01*tt0))*np.exp(-tt0*3.2)*0.07
    o=int(k*SR);e=min(len(y),n-o)
    if e>0:mix[o:o+e]+=y[:e]
    k+=.375;j+=1
# riser pembuka dan hantaman akhir
rs=np.cumsum(rng.standard_normal(int(SR*3.0)))*0;
nz=rng.standard_normal(int(SR*3.0));b,a=butter(2,[600/(SR/2),5000/(SR/2)],'band');nz=lfilter(b,a,nz)
ev=(np.linspace(0,1,len(nz))**2)*0.10;mix[:len(nz)]+=nz*ev
hit=int((DUR-4.0)*SR);L=int(SR*3.9);tt=np.arange(L)/SR
mix[hit:hit+L]+=np.sin(2*np.pi*nada(45)*tt)*np.exp(-tt*1.1)*0.35
# gema
IR=rng.standard_normal(int(SR*2.6))*np.exp(-np.arange(int(SR*2.6))/SR*2.2);IR[:50]=0
wet=fftconvolve(mix,IR,mode='full')[:n]*0.035
L_=mix+wet;R_=mix+np.roll(wet,int(SR*.013))
st=np.stack([L_,R_],1)
f=np.minimum(1,t/1.5)*np.minimum(1,(DUR-t)/3.0);st*= f[:,None]
st/=np.max(np.abs(st))/0.85
with wave.open('/tmp/vid/musik.wav','wb') as w:
    w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes((st*32767).astype(np.int16).tobytes())
print('ok')
