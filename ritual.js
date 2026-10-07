/* ============================================================
   NINE HEAVENS · ritual.js — sinematik summon (V7)
   Alur : kumpul qi -> orb menanjak melewati ranah -> klimaks sesuai rarity -> whiteout
   Durasi dinamis: tarikan biasa singkat (~2 dtk), ranah tinggi panjang (~6 dtk).
   Warna orb adalah "petunjuk" hasil: makin tinggi warnanya, makin langka karakternya.
   Bergantung pada global dari script.js: R, rc, rx, D, $, flash, spr, dot, realms
   ============================================================ */
const CAP_TIER={1:["凡尘","MORTAL REALM"],2:["凡尘","MORTAL REALM"],3:["灵境","SPIRIT REALM"],4:["灵境","SPIRIT REALM"],5:["仙途","IMMORTAL PATH"],6:["天界","CELESTIAL REALM"],7:["九天","THE NINTH HEAVEN"]};
const CAP_FIN={low:["云开","THE CLOUDS PART"],mid:["天雷降世","HEAVENLY THUNDER DESCENDS"],high:["天门洞开","THE GATE OF HEAVEN OPENS"],div:["九天洞开","THE NINTH HEAVEN HAS OPENED"]};

/* ---------- naga roh ---------- */
function dragon(x,d,hue){const T=d.t;if(T.length<2)return;
 for(let p=0;p<2;p++){x.beginPath();T.forEach((a,i)=>{i?x.lineTo(a.x,a.y):x.moveTo(a.x,a.y)});
  x.strokeStyle=p?`hsl(${hue},100%,85%)`:`hsla(${hue},100%,60%,.5)`;x.lineWidth=p?3:16;x.lineCap="round";x.lineJoin="round";x.globalAlpha=p?.9:.55;x.stroke()}
 const h=T[T.length-1];dot(x,h.x,h.y,34,`hsl(${hue},100%,70%)`,1);x.fillStyle="#fff";x.globalAlpha=1;x.fillRect(h.x-3,h.y-3,6,6)}

/* ---------- kanvas ritual ---------- */
function startFx(best){
 const calm=ST.calm;
 rc.width=innerWidth*D;rc.height=innerHeight*D;rx.setTransform(D,0,0,D,0,0);
 const w=innerWidth,h=innerHeight,cx=w/2,cy=h/2,maxR=Math.hypot(cx,cy),mr=Math.min(w,h)*.27;
 const P=Array.from({length:innerWidth<700?(calm?70:135):(calm?110:230)},()=>({a:Math.random()*6.28,r:Math.random()*maxR,s:.5+Math.random()*1.5,z:Math.random()}));
 const st={alive:true,stage:1,t:0,sp:.5,rank:1,pop:0,tease:false,rings:[],bolts:[],gate:0,gateT:0,beams:0,crack:0,crackT:0,seg:null,
  bursts:[],shards:[],shock:[],flash:0,freeze:false,shk:0,z:0,drag:false,dspd:.7,spin:0,spinA:0,dr:[{u:0,t:[],o:-.22,d:1},{u:0,t:[],o:.22,d:-1}]};
 let last=performance.now();
 const bolt=c=>{const x0=cx+(Math.random()-.5)*w*.55,pts=[[x0,-20]],n=9;
  for(let i=1;i<n;i++){const u=i/n;pts.push([x0+(cx-x0)*u+(Math.random()-.5)*95*(1-u*.4),-20+(cy+20)*u+(Math.random()-.5)*34])}
  pts.push([cx+(Math.random()-.5)*20,cy]);return{pts,life:1,c}};
 st.spinRun=()=>{st.spin=1;st.spinA=0;};
 st.climb=k=>{st.spin=Math.max(0,st.spin-.18);st.rank=k;st.pop=1;st.rings.push({r:20,c:realms[k-1].c,w:3});if(k>=3&&!calm)st.bolts.push(bolt(realms[k-1].c))};
 st.strike=c=>st.bolts.push(bolt(c||realms[st.rank-1].c));
 st.ring=(c,wd=4)=>st.rings.push({r:10,c:c||realms[st.rank-1].c,w:wd});
 st.burst=(c,n=70,power=1)=>{const cc=c||realms[st.rank-1].c;for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,sp=(160+Math.random()*760)*power;st.bursts.push({x:cx,y:cy,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:1,size:1+Math.random()*4,c:cc});}st.shock.push({r:10,life:1,c:cc,w:5+power*4});st.shk+=10+power*12;st.flash=Math.max(st.flash,.45*power)};
 st.shard=(c,n=30)=>{const cc=c||realms[st.rank-1].c;for(let i=0;i<n;i++){const a=Math.random()*6.283,sp=250+Math.random()*850;st.shards.push({x:cx,y:cy,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:1,c:cc,size:2+Math.random()*5,rot:Math.random()*6.28});}};
 st.cracks=()=>{if(st.seg){st.crackT=1;return}
  const seg=[],tp=[0,1,2,3,4,5,6].map(i=>({x:cx,y:cy,a:i*.9+Math.random()*.6}));
  for(let s=0;s<26;s++)for(const q of tp.slice()){const nx=q.x+Math.cos(q.a)*22,ny=q.y+Math.sin(q.a)*22;seg.push([q.x,q.y,nx,ny]);q.x=nx;q.y=ny;q.a+=(Math.random()-.5)*.8;
   if(Math.random()<.05&&tp.length<18)tp.push({x:q.x,y:q.y,a:q.a+(Math.random()<.5?-.7:.7)})}
  st.seg=seg;st.crackT=1};
 (function f(n){
  if(!st.alive)return;requestAnimationFrame(f);
  const dt=Math.min(.05,(n-last)/1000);last=n;
  if(st.freeze)return;                       // freeze-frame: kanvas berhenti total
  st.t+=dt;
  const x=rx,col=realms[st.rank-1].c,glow=realms[st.rank-1].g;
  x.globalCompositeOperation="source-over";x.globalAlpha=1;x.fillStyle="rgba(2,2,8,.24)";x.fillRect(0,0,w,h);
  x.globalCompositeOperation="lighter";
  const tsp=[0,.5,1.4+st.rank*.35,5,7][st.stage]||.5;st.sp+=(tsp-st.sp)*Math.min(1,dt*4);
  const pc=st.stage>=2?col:"#c9a8ff";
  for(const q of P){q.r-=q.s*st.sp*60*dt*(1+(1-q.r/maxR)*2);q.a+=dt*(.7+st.sp*.8)*(1.5-q.r/maxR);
   if(q.r<8){q.r=maxR*(.6+Math.random()*.4);q.a=Math.random()*6.28}
   x.globalAlpha=Math.min(1,q.r/180);x.fillStyle=pc;x.fillRect(cx+Math.cos(q.a)*q.r,cy+Math.sin(q.a)*q.r*.6,1+q.z*2.4,1+q.z*2.4)}
  // cincin rune
  x.save();x.translate(cx,cy);x.rotate(st.t*(.4+st.sp*.5));x.globalAlpha=.6;x.strokeStyle=pc;x.lineWidth=1.5;x.setLineDash([4,10]);
  x.beginPath();x.arc(0,0,mr,0,7);x.stroke();x.setLineDash([]);x.beginPath();x.arc(0,0,mr*.7,0,7);
  for(let i=0;i<8;i++){const a=i*.7854;x.moveTo(Math.cos(a)*mr*.9,Math.sin(a)*mr*.9);x.lineTo(Math.cos(a)*mr*1.15,Math.sin(a)*mr*1.15)}
  x.stroke();x.restore();
  // roulette takdir: cincin cepat yang memberi rasa "gacha sedang mengunci hasil"
  if(st.spin>0){
   st.spinA+=dt*(8+st.rank*1.8);
   const sr=mr*(.72+.06*Math.sin(st.t*9));
   x.save();x.translate(cx,cy);x.rotate(st.spinA);
   for(let j=0;j<3;j++){
    x.globalAlpha=(.45-j*.1)*st.spin;x.strokeStyle=j===0?"#fff":pc;x.lineWidth=2-j*.45;
    x.setLineDash([5+j*4,10-j*2]);x.beginPath();x.arc(0,0,sr+j*18,j*.7,Math.PI*1.45+j*.7);x.stroke();
   }
   x.setLineDash([]);x.restore();
   st.spin=Math.max(0,st.spin-dt*.7);
  }
  // pendar orb (segel 道 ada di DOM, di atas kanvas) + satelit
  st.pop=Math.max(0,st.pop-dt*2.6);
  const base=(40+st.rank*14)*(st.tease?.75:1)*(1+st.pop*.45)*(1+Math.sin(st.t*(5+st.rank))*.05);
  dot(x,cx,cy,base*3.8,glow,.2);dot(x,cx,cy,base*1.8,col,.22);
  const nm=2+st.rank*2;
  for(let i=0;i<nm;i++){const a=st.t*(1.1+i%3*.35)+i*6.283/nm,rr=base*(1.9+.35*Math.sin(st.t*2+i));dot(x,cx+Math.cos(a)*rr,cy+Math.sin(a)*rr*.5,5+st.rank*.8,"#fff",.75)}
  // ledakan partikel / pecahan energi
  for(const p of st.bursts){p.life-=dt*1.7;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=Math.pow(.08,dt);p.vy*=Math.pow(.08,dt);if(p.life<=0)continue;x.globalAlpha=p.life*.95;x.fillStyle=p.c;x.shadowBlur=18;x.shadowColor=p.c;x.beginPath();x.arc(p.x,p.y,p.size*(.6+p.life),0,7);x.fill();x.shadowBlur=0} st.bursts=st.bursts.filter(p=>p.life>0);
  for(const p of st.shards){p.life-=dt*1.25;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=240*dt;p.rot+=dt*8;if(p.life<=0)continue;x.save();x.translate(p.x,p.y);x.rotate(p.rot);x.globalAlpha=p.life;x.fillStyle=p.c;x.fillRect(-p.size,-1,p.size*2,2);x.restore()} st.shards=st.shards.filter(p=>p.life>0);
  for(const q of st.shock){q.r+=1500*dt;q.life-=dt*1.9;if(q.life<=0)continue;x.globalAlpha=q.life;x.strokeStyle=q.c;x.lineWidth=q.w*(.4+q.life);x.beginPath();x.arc(cx,cy,q.r,0,7);x.stroke()}st.shock=st.shock.filter(q=>q.life>0);
  if(st.flash>0){x.globalAlpha=st.flash;x.fillStyle='#fff';x.fillRect(0,0,w,h);st.flash=Math.max(0,st.flash-dt*3.5)}
  // gelombang kejut
  for(const g of st.rings){g.r+=(st.stage>=3?1100:700)*dt;x.globalAlpha=Math.max(0,1-g.r/maxR);x.strokeStyle=g.c;x.lineWidth=g.w;x.beginPath();x.arc(cx,cy,g.r,0,7);x.stroke()}
  st.rings=st.rings.filter(g=>g.r<maxR);
  // naga
  if(st.drag)st.dr.forEach((d,i)=>{d.u+=dt*st.dspd;const u=d.u%1.4;
   const px=cx+d.d*(Math.cos(u*6.28)*w*.34),py=cy+Math.sin(u*6.28*1.3+i)*h*.26;
   d.t.push({x:px+d.o*w*.1,y:py});if(d.t.length>70)d.t.shift();dragon(x,d,i?35:265)});
  // petir
  x.lineJoin="round";x.lineCap="round";
  for(const b of st.bolts){b.life-=dt*3.2;if(b.life<=0)continue;
   x.globalAlpha=b.life*.55;x.strokeStyle=b.c;x.lineWidth=11;x.beginPath();b.pts.forEach((p,i)=>i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]));x.stroke();
   x.globalAlpha=b.life;x.strokeStyle="#fff";x.lineWidth=2.6;x.stroke()}
  st.bolts=st.bolts.filter(b=>b.life>0);
  // gerbang langit (celah cahaya vertikal)
  st.gate+=(st.gateT-st.gate)*Math.min(1,dt*2.4);
  if(st.gate>.01){const g=st.gate,gw=Math.max(10,g*w*.9);
   x.globalAlpha=.85*Math.min(1,g*3);x.drawImage(spr("#fff1b0"),cx-gw/2,-h*.1,gw,h*1.2);
   x.globalAlpha=Math.min(1,g*4);x.fillStyle="#fff";x.fillRect(cx-Math.max(1.5,gw*.045),0,Math.max(3,gw*.09),h)}
  // sembilan berkas cahaya
  for(let i=0;i<Math.floor(st.beams);i++){x.globalAlpha=(.28+.18*Math.sin(st.t*3+i))*Math.min(1,(st.beams-i)*2);x.drawImage(spr("#ffe9a0"),w*(i+.5)/9-40,0,80,h)}
  // retakan langit
  if(st.seg){st.crack+=(st.crackT-st.crack)*Math.min(1,dt*3);const cnt=Math.floor(st.crack*st.seg.length);
   for(const[lw,c2,al]of[[7,glow,.5],[1.6,"#fff",1]]){x.globalAlpha=al;x.strokeStyle=c2;x.lineWidth=lw;x.beginPath();
    for(let i=0;i<cnt;i++){const s=st.seg[i];x.moveTo(s[0],s[1]);x.lineTo(s[2],s[3])}x.stroke()}}
  // guncangan + zoom kamera
  st.shk*=Math.pow(.02,dt);
  const sx=calm?0:(Math.random()-.5)*st.shk,sy=calm?0:(Math.random()-.5)*st.shk;
  st.z+=([0,.015,.05+st.rank*.006,.12,.15][st.stage]-st.z)*Math.min(1,dt*3);
  rc.style.transform=`translate(${sx}px,${sy}px) scale(${1+st.z*(calm?.25:1)+st.pop*.012})`;
 })(last);
 return st}

/* ---------- alur sinematik ---------- */
async function playRitual(best){
 const Rk=best.rank,tier=Rk>=7?"div":Rk>=5?"high":Rk>=3?"mid":"low",cal=reduce||ST.calm;
 R.className="ritual on "+tier;R.style.setProperty("--pc",best.c);
 const pp=$("pips");if(!pp.children.length)pp.innerHTML=realms.map(r=>`<i style="--c:${r.c}"></i>`).join("");
 const orbUI=k=>{R.style.setProperty("--oc",realms[k-1].c);R.style.setProperty("--og",realms[k-1].g);R.style.setProperty("--os",(.7+k*.11).toFixed(2));
  [...pp.children].forEach((e,i)=>{e.classList.toggle("on",i<k);e.classList.toggle("hot",i===k-1)})};
 orbUI(1);$("capCn").textContent=CAP_TIER[1][0];$("capEn").textContent=CAP_TIER[1][1];
 $("skip").focus({preventScroll:true});
 const fx=startFx(best),pend=[];let skipped=false,ch=null;
 $("skip").onclick=()=>{skipped=true;pend.splice(0).forEach(f=>f())};
 const sc=cal?.5:1,w=ms=>skipped?0:new Promise(r=>{const id=setTimeout(r,ms*sc);pend.push(()=>{clearTimeout(id);r()})});
 const cap=a=>{const c=document.querySelector(".caption");c.classList.add("swap");setTimeout(()=>{$("capCn").textContent=a[0];$("capEn").textContent=a[1];c.classList.remove("swap")},200)};
 const stage=n=>{$("stageCount").textContent="0"+n;R.classList.toggle("stage2",n>=2);R.classList.toggle("stage3",n>=3);R.classList.toggle("stage4",n>=4);fx.stage=n};
 try{
  /* 1. kumpul qi */
  stage(1);ch=sfx.charge(Rk);sfx.thump(.5);await w(430);sfx.thump(.7);await w(430);
  /* 2. orb menanjak melewati ranah: warna = petunjuk rarity */
  if(Rk>=2&&!skipped){stage(2);fx.spinRun();sfx.roulette(Rk);}
  let lastTier=CAP_TIER[1][0];
  for(let k=2;k<=Rk&&!skipped;k++){
   if(Rk>=5&&k===Rk){fx.tease=true;sfx.tension(Rk);sfx.thump(.8);await w(340);sfx.thump(1);await w(300);fx.tease=false;if(skipped)break}
   fx.climb(k);orbUI(k);sfx.ladder(k,Rk);
   if(CAP_TIER[k][0]!==lastTier){cap(CAP_TIER[k]);lastTier=CAP_TIER[k][0]}
   if(k>=5)fx.drag=true;
   await w(k===Rk?340:350+k*25)}
  /* 3. klimaks sesuai rarity */
  if(!skipped){stage(3);ch&&ch.stop();cap(CAP_FIN[tier]);sfx.breakthrough(Rk);if(!cal&&navigator.vibrate&&!ST.mute)navigator.vibrate(tier==="div"?[40,50,40,50,160]:tier==="high"?[30,40,90]:tier==="mid"?[25]:0)}
  if(tier==="low"){
   if(!skipped){fx.burst(best.c,70,.8);fx.shard(best.c,18);fx.ring(best.c,3);flash(.55,220);sfx.explode(.7);sfx.splash(Rk);await w(420)}}
  else if(tier==="mid"){
   for(let i=0;i<4&&!skipped;i++){fx.strike(best.c);fx.burst(best.c,55+i*18,1+i*.18);fx.shard(best.c,20+i*8);fx.ring(best.c,4+i);fx.shk=16+i*5;sfx.explode(.65+i*.12);sfx.crack(.38+i*.08);flash(.6,180);await w(i<3?190:320)}}
  else if(tier==="high"){
   if(!skipped){fx.gateT=1;fx.dspd=1.6;fx.drag=true;fx.shk=16;if(Rk>=6)fx.cracks();
    sfx.gate();sfx.gong(Rk);sfx.explode(1.15);flash(.8,240);fx.strike(best.c);fx.burst(best.c,110,1.45);fx.shard(best.c,55);fx.ring(best.c,5);await w(420);
    if(!skipped){fx.burst(best.c,90,1.3);fx.shard(best.c,40);fx.ring(best.c,7);fx.shk=20;sfx.explode(1.0);sfx.crack(.42);await w(700)}}}
  else{
   if(!skipped){fx.freeze=true;Music.duck(.1,.7);await w(300);fx.freeze=false}
   if(!skipped){fx.gateT=1;fx.dspd=2;fx.drag=true;fx.shk=22;fx.cracks();sfx.gate();sfx.gong(7);sfx.cascade();sfx.explode(1.8);flash(1,260);fx.strike("#fff1a0");fx.burst("#fff1a0",220,2.4);fx.shard("#fff1a0",100);fx.ring("#fff1a0",6);
    for(let i=1;i<=9&&!skipped;i++){fx.beams=i;fx.burst(best.c,42,1.2);fx.ring(best.c,3);sfx.explode(.5);await w(105)}
    if(!skipped){fx.shk=14;await w(700)}}}
  /* 4. whiteout */
  stage(4);flash(1,600);await w(skipped?0:Rk>=7?800:Rk>=5?500:300);
 }finally{
  ch&&ch.stop();fx.alive=false;fx.freeze=false;rc.style.transform="";R.className="ritual hidden"}}
