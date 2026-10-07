/* ============================================================
   NINE HEAVENS · audio.js  (V7)
   Semua suara disintesis lewat Web Audio — tanpa file audio.
   Isi: pengaturan (ST), grafik audio + reverb, efek suara (sfx),
        musik generatif berstruktur (Music).
   ============================================================ */
const reduce=matchMedia("(prefers-reduced-motion:reduce)").matches;
const ST=(()=>{let d={};try{d=JSON.parse(localStorage.getItem("nh6s")||"{}")||{}}catch(e){}
 const n=(v,f)=>typeof v==="number"&&v>=0&&v<=1?v:f;
 return{mus:n(d.mus,1),sfx:n(d.sfx,1),mute:!!d.mute,calm:typeof d.calm==="boolean"?d.calm:reduce,hint:!!d.hint}})();
const saveST=()=>{try{localStorage.setItem("nh6s",JSON.stringify(ST))}catch(e){}};

const {unlock,applyAudio,tone,sfx,Music,chime}=(function(){
"use strict";
let AC=null,NB=null,OUT=null,SB,SW,MB,MW,RV;

/* ---------- util ---------- */
const m2f=m=>440*Math.pow(2,(m-69)/12);
const rnd=(a,b)=>a+Math.random()*(b-a);
const pick=a=>a[Math.random()*a.length|0];
const PENT=[0,3,5,7,10];                                   // A minor pentatonic: A C D E G
const pm=i=>57+12*Math.floor(i/5)+PENT[((i%5)+5)%5];      // indeks tangga nada -> MIDI (0 = A3)

/* ---------- grafik audio ---------- */
function makeIR(sec){const n=AC.sampleRate*sec|0,b=AC.createBuffer(2,n,AC.sampleRate);
 for(let c=0;c<2;c++){const d=b.getChannelData(c);let lp=0;
  for(let i=0;i<n;i++){const t=i/n,k=.55+.4*t;lp=lp*k+(Math.random()*2-1)*(1-k);d[i]=lp*Math.pow(1-t,2.7)*3.2}}
 return b}
function build(){
 OUT=AC.createDynamicsCompressor();OUT.threshold.value=-16;OUT.knee.value=22;OUT.ratio.value=4;OUT.attack.value=.004;OUT.release.value=.28;
 const fin=AC.createGain();fin.gain.value=.9;OUT.connect(fin);fin.connect(AC.destination);
 SB=AC.createGain();SW=AC.createGain();MB=AC.createGain();MW=AC.createGain();
 RV=AC.createConvolver();RV.buffer=makeIR(2.4);
 const rg=AC.createGain();rg.gain.value=.8;
 SB.connect(OUT);MB.connect(OUT);SW.connect(RV);MW.connect(RV);RV.connect(rg);rg.connect(OUT);
 const n=AC.sampleRate*2,b=AC.createBuffer(1,n,AC.sampleRate),k=b.getChannelData(0);
 for(let i=0;i<n;i++)k[i]=Math.random()*2-1;NB=b;
 applyAudio()}
function applyAudio(){if(!AC||!SB)return;const t=AC.currentTime,s=ST.mute?0:ST.sfx,m=ST.mute?0:ST.mus;
 for(const[g,v]of[[SB,s],[SW,s],[MB,m],[MW,m]]){g.gain.cancelScheduledValues(t);g.gain.setTargetAtTime(v,t,.03)}}
function unlock(){try{if(!AC){const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;AC=new C()}
 if(AC&&!SB)build();if(AC.state==="suspended"&&AC.resume){const r=AC.resume();if(r&&r.catch)r.catch(()=>{})}}catch(e){}return AC}
unlock.useContext=c=>{AC=c;SB=null};   // hook untuk pengujian (OfflineAudioContext)

/* ---------- routing: dry + kirim ke reverb ---------- */
const M={on:false,timer:0,nextT:0,step:0,cur:0,tgt:0,pat:null,run:null,dry:null,wet:null,windG:null,windS:null,windL:null};
function route(node,kind,wet){
 const dry=kind==="m"?(M.dry||MB):SB,wb=kind==="m"?(M.wet||MW):SW;
 node.connect(dry);
 if(wet>0){const s=AC.createGain();s.gain.value=wet;node.connect(s);s.connect(wb)}}
function envG(t,a,peak,d){const g=AC.createGain();g.gain.setValueAtTime(.0001,t);
 g.gain.exponentialRampToValueAtTime(Math.max(.0002,peak),t+a);g.gain.exponentialRampToValueAtTime(.0001,t+a+d);return g}

/* ---------- pembangun suara dasar ---------- */
function tone(f0,f1,d,v,type="sine",wet=.15,t=AC.currentTime){
 const o=AC.createOscillator(),g=envG(t,.012,v,d);o.type=type;o.frequency.setValueAtTime(f0,t);
 if(f1!==f0)o.frequency.exponentialRampToValueAtTime(f1,t+d);
 o.connect(g);route(g,"s",wet);o.start(t);o.stop(t+d+.06)}
function noiseSweep(o){const{t=AC.currentTime,d=.5,f0=500,f1=500,q=1,type="bandpass",v=.2,a=.02,wet=.2,kind="s"}=o;
 const s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();
 s.buffer=NB;s.loop=true;f.type=type;f.Q.value=q;
 f.frequency.setValueAtTime(f0,t);f.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+d);
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,v),t+Math.min(a,d*.9));g.gain.exponentialRampToValueAtTime(.0001,t+d);
 s.connect(f);f.connect(g);route(g,kind,wet);s.start(t,Math.random()*1.5);s.stop(t+d+.05);return g}
const BELL=[[1,1,1],[2.76,.45,.55],[5.4,.22,.3],[8.93,.1,.18]];   // [rasio, gain, pengali decay]
function bell(f,v=.1,d=1.6,t=AC.currentTime,wet=.4,kind="s"){const mix=AC.createGain();
 for(const[r,gn,dm]of BELL){const o=AC.createOscillator(),g=envG(t,.004,v*gn,d*dm);o.frequency.value=f*r;o.connect(g);g.connect(mix);o.start(t);o.stop(t+d*dm+.06)}
 route(mix,kind,wet)}
function gong(k=1,t=AC.currentTime,v=.4,kind="s"){const base=62*(1+k*.03),mix=AC.createGain();
 for(const[r,gn,d]of[[1,1,3.6],[1.47,.6,3],[2.02,.55,2.7],[2.74,.4,2.1],[3.9,.25,1.4],[5.1,.15,1]]){
  const o=AC.createOscillator(),g=envG(t,.012,v*gn,d);o.type=r<2?"sine":"triangle";
  o.frequency.setValueAtTime(base*r*1.025,t);o.frequency.exponentialRampToValueAtTime(base*r,t+.45);
  o.connect(g);g.connect(mix);o.start(t);o.stop(t+d+.1)}
 route(mix,kind,.6);noiseSweep({t,d:.5,f0:4200,f1:900,v:v*.3,type:"highpass",q:.5,wet:.5,kind})}
function thump(v=.4,t=AC.currentTime,f=110){const o=AC.createOscillator(),g=envG(t,.004,v,.5);
 o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(34,t+.35);o.connect(g);route(g,"s",.25);o.start(t);o.stop(t+.6);
 noiseSweep({t,d:.08,f0:1500,f1:300,v:v*.4,wet:.1})}
function crack(v=.35,t=AC.currentTime){
 noiseSweep({t,d:.35,f0:6000,f1:600,v,type:"highpass",q:.4,a:.002,wet:.5});
 noiseSweep({t:t+.01,d:.9,f0:320,f1:60,v:v*.9,type:"lowpass",q:.7,a:.01,wet:.6});thump(v*.9,t+.02,150)}
function riser(d=2,v=.16){const t=AC.currentTime,nodes=[];
 nodes.push(noiseSweep({t,d,f0:300,f1:5200,q:2.5,v,a:d*.8,wet:.4}));
 const g=AC.createGain(),lp=AC.createBiquadFilter();lp.type="lowpass";lp.frequency.setValueAtTime(300,t);lp.frequency.exponentialRampToValueAtTime(3500,t+d);
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v*.5,t+d*.9);g.gain.exponentialRampToValueAtTime(.0001,t+d+.1);
 for(const det of[-7,7]){const o=AC.createOscillator();o.type="sawtooth";o.frequency.setValueAtTime(70,t);o.frequency.exponentialRampToValueAtTime(420,t+d);o.detune.value=det;o.connect(lp);o.start(t);o.stop(t+d+.15)}
 lp.connect(g);route(g,"s",.35);nodes.push(g);
 return{stop(){const n=AC.currentTime;for(const x of nodes){try{x.gain.cancelScheduledValues(n);x.gain.setTargetAtTime(.0001,n,.05)}catch(e){}}}}}
function choir(f,d=2.4,v=.07,t=AC.currentTime){const mix=AC.createGain(),A=AC.createBiquadFilter(),B=AC.createBiquadFilter();
 A.type=B.type="bandpass";A.frequency.value=750;B.frequency.value=1250;A.Q.value=B.Q.value=4;
 const g=AC.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+d*.45);g.gain.exponentialRampToValueAtTime(.0001,t+d);
 for(const det of[-12,0,12]){const o=AC.createOscillator();o.type="sawtooth";o.frequency.value=f;o.detune.value=det;
  const l=AC.createOscillator(),lg=AC.createGain();l.frequency.value=5+Math.random();lg.gain.value=f*.006;l.connect(lg);lg.connect(o.frequency);
  l.start(t);l.stop(t+d+.1);o.connect(A);o.connect(B);o.start(t);o.stop(t+d+.1)}
 A.connect(mix);B.connect(mix);mix.connect(g);route(g,"s",.6)}

/* ---------- efek suara baru: pedang, retakan dimensi, bambu ramalan, guntur & mantra ---------- */
function swordSlash(t=AC.currentTime,v=.18){
 const d=.22;
 noiseSweep({t,d,f0:4400,f1:1100,q:3.5,v:v*1.2,a:.01,wet:.3});
 const o=AC.createOscillator(),g=envG(t,.008,v*.8,d);o.type="triangle";
 o.frequency.setValueAtTime(1600,t);o.frequency.exponentialRampToValueAtTime(320,t+d);
 o.connect(g);route(g,"s",.35);o.start(t);o.stop(t+d+.05);
}
function glassShatter(t=AC.currentTime,v=.35){
 thump(v*1.3,t,95);
 [2400,3800,5200,7100,8900].forEach((f,i)=>{
  const dt=t+i*.018,d=.35+Math.random()*.3,o=AC.createOscillator(),g=envG(dt,.002,v*(.3-.04*i),d);
  o.type=i%2?"sine":"triangle";o.frequency.setValueAtTime(f,dt);o.frequency.exponentialRampToValueAtTime(f*.85,dt+d);
  o.connect(g);route(g,"s",.5);o.start(dt);o.stop(dt+d+.05);
 });
 noiseSweep({t,d:.45,f0:8500,f1:1200,q:2,v:v*.5,a:.005,wet:.6});
}
function bambooSticks(t=AC.currentTime,v=.2){
 for(let i=0;i<8;i++){
  const dt=t+i*.032+Math.random()*.012,f=580+Math.random()*420,o=AC.createOscillator(),g=envG(dt,.002,v*(.4+Math.random()*.3),.06);
  o.type="sine";o.frequency.setValueAtTime(f,dt);o.frequency.exponentialRampToValueAtTime(f*.7,dt+.05);
  o.connect(g);route(g,"s",.25);o.start(dt);o.stop(dt+.08);
 }
}
function rollingThunder(t=AC.currentTime,v=.35){
 thump(v*.8,t,65);
 noiseSweep({t,d:1.8,f0:240,f1:38,q:1.4,type:"lowpass",v:v*.9,a:.25,wet:.7});
 setTimeout(()=>{try{thump(v*.6,AC.currentTime,48)}catch(e){}},300);
}
function daoChant(t=AC.currentTime,d=2.6,v=.09){
 const f=65.41,mix=AC.createGain(),A=AC.createBiquadFilter(),B=AC.createBiquadFilter(),C=AC.createBiquadFilter();
 A.type=B.type=C.type="bandpass";A.frequency.value=550;B.frequency.value=1050;C.frequency.value=2200;
 A.Q.value=B.Q.value=C.Q.value=5;
 const g=envG(t,.3,v,d);
 for(const det of[-8,0,8]){
  const o=AC.createOscillator();o.type="sawtooth";o.frequency.value=f;o.detune.value=det;
  o.connect(A);o.connect(B);o.connect(C);o.start(t);o.stop(t+d+.2);
 }
 A.connect(mix);B.connect(mix);C.connect(mix);mix.connect(g);route(g,"s",.7);
}

/* ---------- instrumen musik ---------- */
const KS=new Map();   // senar petik (Karplus-Strong) dirender sekali per nada
function ksBuffer(midi){let r=KS.get(midi);if(r)return r;
 const sr=AC.sampleRate,f=m2f(midi),N=Math.max(2,Math.round(sr/f-.5)),n=Math.floor(sr*2.8),buf=AC.createBuffer(1,n,sr),o=buf.getChannelData(0),d=new Float32Array(N);
 let lp=0;for(let i=0;i<N;i++){lp=lp*.45+(Math.random()*2-1)*.55;d[i]=lp*1.9}
 const dec=Math.pow(10,-3/(4.2*f));let j=0;
 for(let i=0;i<n;i++){const nj=j+1===N?0:j+1,y=d[j];o[i]=y;d[j]=(y+d[nj])*.5*dec;j=nj}
 r={buf,rate:f*(N+.5)/sr};KS.set(midi,r);return r}
function pluck(midi,t,v=.14,pan=0){const{buf,rate}=ksBuffer(midi),s=AC.createBufferSource(),g=AC.createGain();
 s.buffer=buf;s.playbackRate.value=rate;g.gain.value=v;s.connect(g);let out=g;
 if(AC.createStereoPanner){const p=AC.createStereoPanner();p.pan.value=pan;g.connect(p);out=p}
 route(out,"m",.38);s.start(t)}
function erhu(midi,t,dur,v=.05,from=null){const f=m2f(midi),o=AC.createOscillator();o.type="sawtooth";
 if(from!=null){o.frequency.setValueAtTime(m2f(from),t);o.frequency.exponentialRampToValueAtTime(f,t+Math.min(.2,dur*.4))}else o.frequency.setValueAtTime(f,t);
 const l=AC.createOscillator(),lg=AC.createGain();l.frequency.value=5.3;lg.gain.setValueAtTime(0,t);lg.gain.linearRampToValueAtTime(f*.011,t+Math.min(.5,dur*.6));l.connect(lg);lg.connect(o.frequency);
 const lp=AC.createBiquadFilter();lp.type="lowpass";lp.frequency.value=2100;lp.Q.value=2;
 const pk=AC.createBiquadFilter();pk.type="peaking";pk.frequency.value=1250;pk.gain.value=7;pk.Q.value=1.4;
 const g=AC.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.14);g.gain.setValueAtTime(v,t+Math.max(.15,dur-.2));g.gain.exponentialRampToValueAtTime(.0001,t+dur);
 o.connect(lp);lp.connect(pk);pk.connect(g);route(g,"m",.5);o.start(t);l.start(t);o.stop(t+dur+.05);l.stop(t+dur+.05);
 noiseSweep({t,d:dur,f0:3200,f1:3200,q:1.2,v:v*.12,a:.1,wet:.3,kind:"m"})}
function flute(midi,t,dur,v=.045){const f=m2f(midi),o=AC.createOscillator(),o2=AC.createOscillator();o.frequency.value=f;o2.type="triangle";o2.frequency.value=f*2;
 const l=AC.createOscillator(),lg=AC.createGain();l.frequency.value=4.8;lg.gain.setValueAtTime(0,t);lg.gain.linearRampToValueAtTime(f*.006,t+.4);l.connect(lg);lg.connect(o.frequency);lg.connect(o2.frequency);
 const g=AC.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.07);g.gain.setValueAtTime(v,t+Math.max(.08,dur-.15));g.gain.exponentialRampToValueAtTime(.0001,t+dur);
 const m2=AC.createGain();m2.gain.value=.25;o.connect(g);o2.connect(m2);m2.connect(g);route(g,"m",.55);
 for(const x of[o,o2,l]){x.start(t);x.stop(t+dur+.05)}
 noiseSweep({t,d:dur,f0:f*2,f1:f*2,q:3,v:v*.35,a:.05,wet:.4,kind:"m"})}
function pad(notes,t,dur,v=.03,bright=900){const lp=AC.createBiquadFilter();lp.type="lowpass";lp.frequency.setValueAtTime(bright,t);lp.Q.value=.6;
 const g=AC.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+dur*.35);g.gain.setValueAtTime(v,t+dur*.65);g.gain.exponentialRampToValueAtTime(.0001,t+dur+1.2);
 for(const n of notes)for(const det of[-6,6]){const o=AC.createOscillator();o.type="sawtooth";o.frequency.value=m2f(n);o.detune.value=det;o.connect(lp);o.start(t);o.stop(t+dur+1.3)}
 lp.connect(g);route(g,"m",.5)}
function bassNote(midi,t,dur,v=.14){const o=AC.createOscillator(),o2=AC.createOscillator(),g=AC.createGain(),m=AC.createGain();
 o.frequency.value=m2f(midi);o2.type="triangle";o2.frequency.value=m2f(midi);m.gain.value=.3;
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.03);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
 o.connect(g);o2.connect(m);m.connect(g);route(g,"m",.15);o.start(t);o2.start(t);o.stop(t+dur+.05);o2.stop(t+dur+.05)}
function taiko(t,v=.25,f=150){const o=AC.createOscillator(),g=envG(t,.003,v,.45);
 o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(f*.32,t+.28);o.connect(g);route(g,"m",.4);o.start(t);o.stop(t+.5);
 noiseSweep({t,d:.09,f0:2400,f1:500,q:.7,v:v*.5,wet:.2,kind:"m"})}
function wood(t,v=.04){const o=AC.createOscillator(),g=envG(t,.002,v,.07);o.frequency.setValueAtTime(1700,t);o.frequency.exponentialRampToValueAtTime(1150,t+.05);o.connect(g);route(g,"m",.2);o.start(t);o.stop(t+.12)}
function shaker(t,v=.02){noiseSweep({t,d:.05,f0:7000,f1:7000,q:.8,type:"highpass",v,a:.003,wet:.1,kind:"m"})}

function startWind(){const t=AC.currentTime,s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain(),l=AC.createOscillator(),lg=AC.createGain();
 s.buffer=NB;s.loop=true;f.type="bandpass";f.frequency.value=520;f.Q.value=.9;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.05,t+3);
 l.frequency.value=.09;lg.gain.value=260;l.connect(lg);lg.connect(f.frequency);s.connect(f);f.connect(g);route(g,"m",.5);s.start();l.start();M.windG=g;M.windS=s;M.windL=l}
function stopWind(){const{windG:g,windS:s,windL:l}=M;if(!g)return;const n=AC.currentTime;g.gain.cancelScheduledValues(n);g.gain.setTargetAtTime(.0001,n,.3);
 setTimeout(()=>{try{s.stop();l.stop()}catch(e){}},1800);M.windG=M.windS=M.windL=null}

/* ---------- komposisi: A minor pentatonic, 2 bar per akor ---------- */
const CH=[{b:45,pad:[57,64,69,71],anc:0},{b:41,pad:[53,60,67,69],anc:0},{b:43,pad:[55,62,69,72],anc:2},{b:40,pad:[52,59,64,67],anc:3}];
// pola guzheng: digit = offset tangga nada dari jangkar, '.' = jeda (16 langkah 1/16)
const CALM=["0...3...5...3...","0.....3.....5...","0..3..5..3..2...","5...3...2...0..."];
const MID=["0.2.3.2.0.2.3.4.","0.3.5.3.0.3.5.7.","0.23.5.32.0.2.3.","2.3.5.3.2.0.3.2."];
const BUSY=["0235320235675323","02.35.32.35.72.3"];
const RUN_UP="........01234567",RUN_DN="........76543210";
// motif seruling & erhu: [mulai, panjang, indeks tangga nada] dalam jendela 32 langkah
const FL=[[[0,8,8],[8,4,7],[12,4,5],[16,12,6],[28,4,5]],[[0,4,5],[4,4,6],[8,8,8],[16,6,7],[22,2,6],[24,8,5]],[[2,6,7],[8,8,9],[16,4,8],[20,4,7],[24,8,5]],[[0,12,8],[12,4,7],[16,8,6],[24,8,5]]];
const EH=[[[0,8,3],[8,8,5],[16,6,4],[22,2,3],[24,8,2]],[[0,6,5],[6,2,6],[8,8,7],[16,8,5],[24,8,4]],[[0,4,2],[4,4,3],[8,12,5],[20,4,4],[24,8,3]]];
const stepDur=()=>60/(76+18*M.cur)/4;

function phrase(t,sd,bi){const c=M.cur,r=Math.random();let lead=null;
 if(c>.35)lead=r<.65?"erhu":r<.9?"flute":null;else lead=r<.5?"flute":(r<.7&&(bi&7)>=4)?"erhu":null;
 if(!lead)return;
 const mo=pick(lead==="erhu"?EH:FL),sh=pick([0,0,0,-2,2]);let prev=null;
 for(const[st,len,ix]of mo){const m=pm(ix+sh),T=t+st*sd,dur=Math.max(.35,len*sd*.96);
  if(lead==="erhu")erhu(m,T,dur,.05+.02*c,prev!=null&&Math.random()<.65?prev:null);else flute(m,T,dur,.045+.015*c);prev=m}}
function doStep(t){
 const sd=stepDur(),s=M.step&15,bi=M.step>>4,ch=CH[(bi>>1)&3];
 M.cur+=(M.tgt-M.cur)*.06;const c=M.cur;
 if(s===0){
  if((bi&1)===0)pad(ch.pad,t,sd*32,.028+.018*c,650+1600*c);
  bassNote(ch.b,t,sd*14,.13+.05*c);if(c>.5)bassNote(ch.b+12,t+sd*8,sd*6,.06);
  M.pat=pick(c<.25?CALM:c<.6?MID:BUSY);
  M.run=(bi%4===3&&Math.random()<.55+c*.3)?(Math.random()<.5?RUN_UP:RUN_DN):null;
  if((bi&1)===0)phrase(t,sd,bi);
  if(bi>0&&bi%8===0)gong(.2,t,.1+.08*c,"m")}
 const p=(M.run&&s>=8)?M.run:M.pat,g=p[s];
 if(g!=="."&&!(c<.2&&Math.random()<.12)){const idx=ch.anc+1+(+g),v=(.1+.07*c)*(s%4===0?1.2:1)*rnd(.82,1.1);
  pluck(pm(idx),t+rnd(0,.012),v,Math.max(-.7,Math.min(.7,(idx-5)*.1)))}
 if(c<.35){if(s===0&&bi%4===0)taiko(t,.15+.12*c,100)}
 else{if(s===0)taiko(t,.26+.1*c,110);if(s===8)taiko(t,.18+.08*c,125);if(c>.6&&(s===6||s===14))taiko(t,.14,170)}
 if(c>.28&&s%4===2)wood(t,.025+.03*c);
 if(c>.5&&(s&1))shaker(t,.015+.02*c);
 if(c>.5&&bi%8===7&&s>=12)taiko(t,.12+.03*(s-12),150+(s-12)*25)}
function pump(limit){while(M.nextT<limit){doStep(M.nextT);M.nextT+=stepDur();M.step++}}
function tick(){if(!M.on||!AC)return;if(M.nextT<AC.currentTime-.4)M.nextT=AC.currentTime+.05;pump(AC.currentTime+.32)}

const Music={
 get on(){return M.on},
 start(manual){if(!unlock()||M.on)return;applyAudio();const n=AC.currentTime;
  M.on=true;M.step=0;M.cur=M.tgt;M.nextT=n+.12;
  M.dry=AC.createGain();M.wet=AC.createGain();M.dry.connect(MB);M.wet.connect(MW);
  for(const g of[M.dry,M.wet]){g.gain.setValueAtTime(.0001,n);g.gain.linearRampToValueAtTime(1,n+1.2)}
  startWind();if(!manual)M.timer=setInterval(tick,90);tick()},
 stop(){if(!M.on)return;M.on=false;clearInterval(M.timer);const d=M.dry,w=M.wet,n=AC.currentTime;
  for(const g of[d,w]){g.gain.cancelScheduledValues(n);g.gain.setTargetAtTime(0,n,.18)}
  stopWind();M.dry=M.wet=null;setTimeout(()=>{try{d.disconnect();w.disconnect()}catch(e){}},1600)},
 setInt(v){M.tgt=Math.max(0,Math.min(1,v))},
 duck(level=.15,hold=.6){if(!M.on||!M.dry)return;const n=AC.currentTime;
  for(const g of[M.dry,M.wet]){g.gain.cancelScheduledValues(n);g.gain.setValueAtTime(g.gain.value,n);g.gain.linearRampToValueAtTime(level,n+.06);g.gain.setValueAtTime(level,n+hold);g.gain.linearRampToValueAtTime(1,n+hold+.8)}},
 _pump:pump,_state:M};

/* ---------- efek suara (dibungkus aman: error audio tidak boleh merusak game) ---------- */
const safe=f=>(...a)=>{if(!AC||!SB)return;try{return f(...a)}catch(e){console.warn("audio",e)}};
const sfx={
 tick:safe(()=>tone(1250,820,.05,.045,"triangle",.04)),
 ok:safe(()=>{const t=AC.currentTime;bell(m2f(81),.04,.7,t,.3);bell(m2f(88),.035,.8,t+.07,.3)}),
 err:safe(()=>tone(200,130,.2,.06,"square",.03)),
 claim:safe(()=>{const t=AC.currentTime;[0,1,2].forEach(i=>bell(m2f(pm(7+i*2)),.045,.9,t+i*.07,.35))}),
 up:safe(()=>{const t=AC.currentTime;[0,1,2,3,4].forEach(i=>bell(m2f(pm(5+i)),.05,1.2,t+i*.07,.4));noiseSweep({t,d:.6,f0:600,f1:6000,q:1.5,v:.06,a:.3,wet:.4})}),
 thump:safe((v=.5)=>thump(v*.5)),
 charge:safe(R=>riser(.86+(R>=2?(R-1)*.4:0)+(R>=5?.64:0)+.1)),
 ladder:safe((k,best)=>{const t=AC.currentTime;bell(m2f(pm(4+k)),.045+.012*k,1.2+.18*k,t,.45);
  noiseSweep({t,d:.3,f0:2500,f1:7000,q:1,v:.04+.01*k,a:.02,wet:.3});
  if(k>=3)thump(.14+.04*k,t,100+k*8);
  if(k===best&&best>=5)choir(m2f(57),2.4,.05,t)}),
 splash:safe(()=>{const t=AC.currentTime;bell(m2f(81),.07,1.2,t,.5);noiseSweep({t,d:.4,f0:3000,f1:800,v:.05,q:1,wet:.4});tone(400,150,.2,.09,"sine",.3)}),
 crack:safe(v=>crack(v)),
 gate:safe(()=>{const t=AC.currentTime;noiseSweep({t,d:1.8,f0:120,f1:60,v:.3,type:"lowpass",q:.7,a:.3,wet:.5});
  noiseSweep({t:t+.2,d:1.2,f0:400,f1:1500,v:.1,q:.8,a:.4,wet:.5});choir(m2f(57),2.4,.08,t);choir(m2f(64),2.4,.06,t+.1)}),
 gong:safe((k)=>gong(k,AC.currentTime,.3)),
 cascade:safe(()=>{const t=AC.currentTime;for(let i=0;i<9;i++)bell(m2f(pm(3+i)),.035+.004*i,1.4,t+i*.12,.5)}),
 reveal:safe(rank=>{const t=AC.currentTime,n=Math.min(rank+1,6);
  for(let i=0;i<n;i++)bell(m2f(pm(5+i)),.04+.008*i,1.6+.1*i,t+i*.1,.45);
  if(rank>=5)gong(rank,t,.25);
  if(rank>=7){choir(m2f(57),3.2,.08,t);choir(m2f(64),3.2,.06,t);choir(m2f(69),3.2,.05,t);
   noiseSweep({t,d:2.2,f0:2000,f1:9000,v:.07,a:1.2,type:"highpass",q:.5,wet:.6})}}),
 flip:safe(rank=>{const t=AC.currentTime;noiseSweep({t,d:.14,f0:700,f1:3200,q:1.2,v:.05,a:.01,wet:.15});
  bell(m2f(pm(3+rank)),.03+.01*rank,.7+.15*rank,t+.06,.4);
  if(rank>=5){thump(.3,t,120);bell(m2f(pm(8+rank-5)),.05,1.8,t+.06,.5)}
  if(rank>=7)gong(7,t,.3)}),
  sword:safe((v)=>swordSlash(AC.currentTime,v)),
  shatter:safe((v)=>glassShatter(AC.currentTime,v)),
  sticks:safe((v)=>bambooSticks(AC.currentTime,v)),
  thunder:safe((v)=>rollingThunder(AC.currentTime,v)),
  chant:safe((d,v)=>daoChant(AC.currentTime,d,v))
};
const chime=sfx.reveal;
const toneSafe=safe(tone);

/* tab disembunyikan -> hentikan audio agar hemat baterai */
document.addEventListener("visibilitychange",()=>{if(!AC||!AC.suspend)return;
 if(document.hidden)AC.suspend();else if(AC.state==="suspended"){const r=AC.resume();if(r&&r.catch)r.catch(()=>{})}});

return{unlock,applyAudio,tone:toneSafe,sfx,Music,chime}})();
