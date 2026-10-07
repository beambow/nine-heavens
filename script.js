const realms=[
{name:"Body Tempering",cn:"炼体境",tier:"MORTAL",rate:45,c:"#bfc3d0",g:"#8f94a8",desc:"Tubuh fana ditempa hingga menjadi wadah yang mampu menahan Qi.",power:"100",rank:1},
{name:"Qi Condensation",cn:"练气境",tier:"MORTAL",rate:25,c:"#62e0a0",g:"#28bd78",desc:"Qi mengalir melalui meridian dan mulai membentuk lautan spiritual.",power:"350",rank:2},
{name:"Foundation Establishment",cn:"筑基境",tier:"SPIRIT",rate:15,c:"#69aaff",g:"#357be0",desc:"Fondasi dao terbentuk. Seorang kultivator mulai meninggalkan kefanaan.",power:"900",rank:3},
{name:"Core Formation",cn:"结丹境",tier:"SPIRIT",rate:8,c:"#b978ff",g:"#7939dd",desc:"Golden Core berputar seperti matahari kecil di dalam dantian.",power:"2,500",rank:4},
{name:"Nascent Soul",cn:"元婴境",tier:"IMMORTAL",rate:5,c:"#ffc15a",g:"#e88a1c",desc:"Jiwa primordial terlahir dan hukum langit mulai dapat dirasakan.",power:"8,000",rank:5},
{name:"Void Ascendant",cn:"化虚境",tier:"CELESTIAL",rate:1.8,c:"#ff67b0",g:"#dc287c",desc:"Ruang tunduk pada kehendakmu. Satu pikiran mampu memecah kehampaan.",power:"30,000",rank:6},
{name:"Heavenly Immortal",cn:"天仙境",tier:"DIVINE",rate:.2,c:"#fff19a",g:"#ffdc4c",desc:"Kaisar langit menundukkan hukum alam. Takdir sembilan langit berubah.",power:"100,000",rank:7}
];
let stones=10000,pity=0,history=[],busy=false,bgOn=true;
const $=x=>document.getElementById(x),fmt=x=>x.toLocaleString("id-ID");
const D=Math.min(devicePixelRatio||1,innerWidth<700?1.15:1.5);
const ez=t=>1-Math.pow(1-Math.min(1,Math.max(0,t)),3);
/* ---------- V6.1: pengaturan (volume, kurangi efek) ---------- */
let noSave=false,lastFocus=null;
function setInert(v){document.querySelectorAll("header.topbar,main").forEach(e=>{e.inert=v})}

/* ---------- UI ---------- */
function initGrid(){
 $("realmGrid").innerHTML=realms.map((r,i)=>`<article class="realm rk${r.rank}" data-n="${"一二三四五六七"[i]}" style="--c:${r.c};--g:${r.g};animation-delay:${i*.08}s"><span class="rate">${r.rate}%</span><div class="orbmini"></div><b>${r.name}</b><small>${r.tier} · ${r.cn}</small></article>`).join("");
 const io=new IntersectionObserver(e=>e.forEach(x=>{if(x.isIntersecting){x.target.classList.add("in");io.unobserve(x.target)}}),{threshold:.15});
 document.querySelectorAll(".realm").forEach(c=>{io.observe(c);
  c.onmousemove=e=>{const b=c.getBoundingClientRect(),x=(e.clientX-b.left)/b.width,y=(e.clientY-b.top)/b.height;c.style.cssText+=`;--ry:${(x-.5)*14}deg;--rx:${(.5-y)*14}deg;--px:${x*100}%;--py:${y*100}%`};
  c.onmouseleave=()=>{c.style.setProperty("--rx","0deg");c.style.setProperty("--ry","0deg")}});
}
function render(){
 $("stones").textContent=fmt(stones);$("pityText").textContent=`${pity} / 50`;$("pityBar").style.width=Math.min(100,pity*2)+"%";
 $("history").innerHTML=history.length?history.map(r=>`<div class="history-item" style="--c:${r.c}"><b>${r.who}</b><small>${r.tier} · ${r.cn}</small></div>`).join(""):'<div class="empty">Belum ada jiwa yang terbangun.</div>';
 updateSummonButtons();renderDivination();renderTower();save();
}
function toast(t){$("toast").textContent=t;$("toast").classList.add("show");setTimeout(()=>$("toast").classList.remove("show"),1800)}
function roll(){const R=rates();let n=Math.random()*100,s=0;for(let i=0;i<7;i++){s+=R[i];if(n<s)return realms[i]}return realms[0]}
const flash=(a=.9,d=450)=>{if(ST.calm){a*=.2;d=Math.max(d,500)}return $("flash").animate([{opacity:a},{opacity:0}],{duration:d,easing:"ease-out"})};

/* ---------- Glow sprite (pengganti shadowBlur yang berat) ---------- */
const SP={};
function spr(c){if(SP[c])return SP[c];const s=document.createElement("canvas");s.width=s.height=64;const x=s.getContext("2d"),g=x.createRadialGradient(32,32,0,32,32,32);
 g.addColorStop(0,"#fff");g.addColorStop(.3,c);g.addColorStop(1,c);x.fillStyle=g;x.fillRect(0,0,64,64);x.globalCompositeOperation="destination-in";
 const m=x.createRadialGradient(32,32,0,32,32,32);m.addColorStop(0,"rgba(0,0,0,1)");m.addColorStop(.35,"rgba(0,0,0,.55)");m.addColorStop(1,"rgba(0,0,0,0)");x.fillStyle=m;x.fillRect(0,0,64,64);return SP[c]=s}
const dot=(x,px,py,r,col,a=1)=>{x.globalAlpha=a;x.drawImage(spr(col),px-r,py-r,r*2,r*2)};

/* ---------- Audio: mesin ada di audio.js; di sini hanya unlock + bunyi klik UI ---------- */
addEventListener("pointerdown",e=>{unlock();const b=e.target.closest&&e.target.closest("button");
 if(b&&!b.disabled&&!["single","multi","summonMain"].includes(b.id))sfx.tick()},true);

/* ---------- Latar: partikel qi (sprite, 55 partikel, berhenti saat ritual) ---------- */
const bg=$("fx"),bx=bg.getContext("2d");let W,H;
function bsize(){W=bg.width=innerWidth;H=bg.height=innerHeight}bsize();addEventListener("resize",()=>{if(innerWidth!==W||Math.abs(innerHeight-H)>150)bsize()});
const mk=()=>({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.6+.6,vy:-(.1+Math.random()*.35),vx:(Math.random()-.5)*.3,p:Math.random()*6.28,c:Math.random()<.35?"#e1be76":"#b99aff",petal:Math.random()<.18});
const motes=Array.from({length:innerWidth<700?28:55},mk);
function loop(t){requestAnimationFrame(loop);if(!bgOn||document.hidden||(reduce&&t>200))return;
 bx.clearRect(0,0,W,H);bx.globalCompositeOperation="lighter";
 for(const m of motes){m.x+=m.vx+Math.sin(t/1500+m.p)*.3;m.y+=m.vy;if(m.petal){m.y+=.9;m.x+=.35}
  if(m.y<-10||m.y>H+10||m.x>W+10)Object.assign(m,mk(),{y:m.petal?-8:H+8});
  const a=.4+.35*Math.sin(t/700+m.p);dot(bx,m.x,m.y,m.petal?m.r*4:m.r*5,m.petal?"#ff96c8":m.c,a)}
}
requestAnimationFrame(loop);

/* ---------- Pedang Rohani Mengambang (Flying Qi Sword) & Riak Dao ---------- */
const scv=$("swordCanvas"),scx=scv?scv.getContext("2d"):null;
let sW=0,sH=0,smx=innerWidth/2,smy=innerHeight/2,ssx=smx,ssy=smy,sRot=0,swordTrails=[],daoRipples=[],hasMouse=false;
function resizeSword(){if(!scv)return;sW=scv.width=innerWidth;sH=scv.height=innerHeight}
resizeSword();addEventListener("resize",resizeSword);

addEventListener("pointermove",e=>{if(e.pointerType==="mouse")hasMouse=true;smx=e.clientX;smy=e.clientY},{passive:true});
addEventListener("pointerdown",e=>{
 daoRipples.push({x:e.clientX,y:e.clientY,r:12,maxR:85,a:1,rot:Math.random()*6.28});
 const b=e.target.closest&&e.target.closest("button");
 if(b&&sfx&&sfx.sword&&!["single","multi","summonMain"].includes(b.id))sfx.sword(.07);
});

function drawSword(ctx,x,y,angle){
 ctx.save();ctx.translate(x,y);ctx.rotate(angle);
 dot(ctx,0,0,32,"#e1be76",.25);
 ctx.fillStyle="#fff";ctx.strokeStyle="#e1be76";ctx.lineWidth=1.5;
 ctx.beginPath();ctx.moveTo(0,-24);ctx.lineTo(4,-6);ctx.lineTo(3,10);ctx.lineTo(-3,10);ctx.lineTo(-4,-6);ctx.closePath();
 ctx.fill();ctx.stroke();
 ctx.strokeStyle="#8e5bff";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,-20);ctx.lineTo(0,8);ctx.stroke();
 ctx.strokeStyle="#ffd700";ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(-9,10);ctx.lineTo(9,10);ctx.stroke();
 ctx.fillStyle="#3a1c63";ctx.fillRect(-2,11,4,7);
 dot(ctx,0,20,5,"#ffd700",.9);
 ctx.restore();
}

function swordLoop(){
 requestAnimationFrame(swordLoop);
 if(!scx||ST.calm||document.hidden)return;
 if(!hasMouse&&!daoRipples.length)return;
 scx.clearRect(0,0,sW,sH);
 for(let i=daoRipples.length-1;i>=0;i--){
  const rp=daoRipples[i];rp.r+=3.2;rp.a*=.94;
  if(rp.a<.02){daoRipples.splice(i,1);continue}
  scx.save();scx.translate(rp.x,rp.y);scx.rotate(rp.rot);scx.globalAlpha=rp.a*.8;
  scx.strokeStyle="#e1be76";scx.lineWidth=1.5;scx.setLineDash([4,6]);
  scx.beginPath();scx.arc(0,0,rp.r,0,6.283);scx.stroke();
  scx.setLineDash([]);scx.strokeStyle="#b98aff";scx.lineWidth=1;
  scx.beginPath();scx.arc(0,0,rp.r*.75,0,6.283);scx.stroke();
  scx.restore();
 }
 if(!hasMouse)return;
 const dx=smx-ssx,dy=smy-ssy,dist=Math.hypot(dx,dy);
 ssx+=dx*.16;ssy+=dy*.16;
 const targetRot=Math.atan2(dy,dx)+Math.PI/2;
 sRot+=(targetRot-sRot)*.2;
 if(dist>2){
  swordTrails.push({x:ssx+(Math.random()-0.5)*6,y:ssy+(Math.random()-0.5)*6,a:.8,r:Math.random()*2.2+1,c:Math.random()<.6?"#e1be76":"#b98aff"});
  if(swordTrails.length>28)swordTrails.shift();
 }
 for(let i=swordTrails.length-1;i>=0;i--){
  const tr=swordTrails[i];tr.a*=.88;tr.r*=.96;
  if(tr.a<.03){swordTrails.splice(i,1);continue}
  dot(scx,tr.x,tr.y,tr.r*4,tr.c,tr.a);
 }
 drawSword(scx,ssx,ssy,sRot);
}
requestAnimationFrame(swordLoop);

const cin=document.querySelector(".cinema");let pm=0;
addEventListener("pointermove",e=>{if(pm||scrollY>760)return;pm=requestAnimationFrame(()=>{pm=0;cin.style.setProperty("--mx",(e.clientX/innerWidth-.5).toFixed(3));cin.style.setProperty("--my",(e.clientY/innerHeight-.5).toFixed(3))})},{passive:true});

/* ---------- Efek khas tiap ranah (dipakai di layar hasil) ---------- */
const SC={
1:(x,S,t,dt,w,h,r)=>{ /* 炼体 — palu besi & percikan api */
 const cx=w/2,cy=h/2+30;S.sp=S.sp||[];S.k=(S.k||0)-dt;S.ring=(S.ring||0)+dt*1000;S.hit=Math.max(0,(S.hit||0)-dt*3);
 if(S.k<=0){S.k=.45;S.hit=1;S.ring=0;S.sh=14;for(let i=0;i<36;i++){const a=-1.57+(Math.random()-.5)*2.8,v=4+Math.random()*10;S.sp.push({x:cx,y:cy,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:1})}}
 dot(x,cx,cy,110+S.hit*130,"#ff8a3a",.45+S.hit*.4);
 x.globalAlpha=Math.max(0,1-S.ring/520);x.strokeStyle="#ffe0b0";x.lineWidth=3;x.beginPath();x.ellipse(cx,cy,Math.max(0,S.ring),Math.max(0,S.ring*.25),0,0,7);x.stroke();
 x.lineWidth=2;x.lineCap="round";
 for(const p of S.sp){p.vy+=.4;p.x+=p.vx;p.y+=p.vy;p.l-=dt*1.3;x.globalAlpha=Math.max(0,p.l);x.strokeStyle=p.l>.5?"#fff1cf":"#ff9a45";x.beginPath();x.moveTo(p.x,p.y);x.lineTo(p.x-p.vx*1.8,p.y-p.vy*1.8);x.stroke()}
 S.sp=S.sp.filter(p=>p.l>0)},
2:(x,S,t,dt,w,h,r)=>{ /* 练气 — aliran qi berputar */
 const cx=w/2,cy=h/2,m=Math.min(w,h);
 if(!S.p)S.p=Array.from({length:40},()=>({a:Math.random()*6.283,r:m*.12+Math.random()*m*.4,s:.5+Math.random()*.9,ph:Math.random()*6,h:[]}));
 x.lineCap="round";
 for(const q of S.p){q.a+=dt*q.s;const rr=q.r+Math.sin(t*1.4+q.ph)*24;q.h.push([cx+Math.cos(q.a)*rr*1.3,cy+Math.sin(q.a)*rr*.5+Math.sin(q.a*3+t)*16]);if(q.h.length>10)q.h.shift();
  for(let i=1;i<q.h.length;i++){x.globalAlpha=i/q.h.length*.8;x.strokeStyle=r.c;x.lineWidth=i/q.h.length*4;x.beginPath();x.moveTo(q.h[i-1][0],q.h[i-1][1]);x.lineTo(q.h[i][0],q.h[i][1]);x.stroke()}
  const e=q.h[q.h.length-1];dot(x,e[0],e[1],8,"#d8ffe9",.9)}
 dot(x,cx,cy,m*.3+Math.sin(t*3)*14,r.g,.4)},
3:(x,S,t,dt,w,h,r)=>{ /* 筑基 — formasi fondasi tergambar */
 const cx=w/2,cy=h/2,m=Math.min(w,h)*.42,p=ez(t/1.6);
 if(!S.st)S.st=Array.from({length:50},()=>({x:cx+(Math.random()-.5)*m*2.4,y:cy+m*.2+Math.random()*m,s:.5+Math.random()*1.5,z:3+Math.random()*5}));
 const poly=(n,R,rot,f)=>{const e=n*f;x.beginPath();for(let i=0;i<=n&&i<=e;i++){const a=rot+i/n*6.2832;x.lineTo(cx+Math.cos(a)*R,cy+Math.sin(a)*R)}
  const i=Math.floor(e);if(i<n&&e>i){const a0=rot+i/n*6.2832,a1=rot+(i+1)/n*6.2832,u=e-i;x.lineTo(cx+(Math.cos(a0)+(Math.cos(a1)-Math.cos(a0))*u)*R,cy+(Math.sin(a0)+(Math.sin(a1)-Math.sin(a0))*u)*R)}x.stroke()};
 x.strokeStyle=r.c;x.lineWidth=2;x.globalAlpha=.9;
 poly(4,m*p,t*.25,p);poly(4,m*.8*p,-t*.25+.785,p);poly(6,m*.55*p,t*.2,p);
 x.beginPath();x.arc(cx,cy,m*1.12*p,0,6.283*p);x.stroke();
 for(let k=0;k<3;k++){const u=(t*.45+k/3)%1;x.globalAlpha=(1-u)*.6;x.beginPath();x.ellipse(cx,cy+m*.55,u*m*1.5,u*m*.4,0,0,7);x.stroke()}
 x.fillStyle=r.c;x.globalAlpha=.7;for(const s of S.st){s.y-=s.s;if(s.y<cy-m)s.y=cy+m*1.2;x.fillRect(s.x,s.y,s.z,s.z)}
 dot(x,cx,cy,120,r.g,.4*p)},
4:(x,S,t,dt,w,h,r)=>{ /* 结丹 — inti emas berputar seperti matahari kecil */
 const cx=w/2,cy=h/2,p=ez(t/1.4),pul=1+Math.sin(t*5)*.07;
 dot(x,cx,cy,230*p,r.g,.55);dot(x,cx,cy,85*p*pul,"#fff2b0",.95);
 for(let k=0;k<3;k++){const A=150*p+k*28,B=48*p+k*10,a=t*(1.8+k*.6);x.save();x.translate(cx,cy);x.rotate(t*.5*(k%2?-1:1)+k*1.05);x.globalAlpha=.6*p;x.strokeStyle=r.c;x.lineWidth=1.6;x.beginPath();x.ellipse(0,0,A,B,0,0,7);x.stroke();dot(x,Math.cos(a)*A,Math.sin(a)*B,11,"#fff",1);x.restore()}
 x.strokeStyle=r.c;x.lineWidth=1.5;for(let i=0;i<12;i++){const a=t*.4+i/12*6.283;x.globalAlpha=.3*p;x.beginPath();x.moveTo(cx+Math.cos(a)*70,cy+Math.sin(a)*70);x.lineTo(cx+Math.cos(a)*330*p,cy+Math.sin(a)*330*p);x.stroke()}},
5:(x,S,t,dt,w,h,r)=>{ /* 元婴 — teratai api mekar & jiwa primordial */
 const cx=w/2,cy=h/2,p=ez(t/1.8);
 if(!S.e)S.e=Array.from({length:50},()=>({x:cx+(Math.random()-.5)*w*.6,y:h*Math.random(),s:.6+Math.random()*1.6,p:Math.random()*6}));
 for(let L=0;L<3;L++){const n=8+L*4;for(let i=0;i<n;i++){x.save();x.translate(cx,cy+40);x.rotate(i/n*6.283+t*.15*(L%2?-1:1)+L*.2);const len=(90+L*55)*p;x.globalAlpha=.26*p;x.fillStyle=L?r.g:r.c;x.beginPath();x.ellipse(len*.55,0,len*.5,16+L*6,0,0,7);x.fill();x.restore()}}
 dot(x,cx,cy+8,150,"#fff3c4",.5*p);x.globalAlpha=.9*p;x.fillStyle="#fff7d6";x.beginPath();x.arc(cx,cy-32,16,0,7);x.fill();x.beginPath();x.ellipse(cx,cy+6,34,28,0,0,7);x.fill();
 for(const e of S.e){e.y-=e.s*1.3;e.x+=Math.sin(t*3+e.p)*.8;if(e.y<-10){e.y=h+10;e.x=cx+(Math.random()-.5)*w*.6}dot(x,e.x,e.y,6,"#ffb347",.5+.4*Math.sin(t*8+e.p))}},
6:(x,S,t,dt,w,h,r)=>{ /* 化虚 — ruang retak */
 const cx=w/2,cy=h/2;
 if(!S.seg||S.age>5){S.seg=[];S.tp=[0,1,2,3,4].map(i=>({x:cx,y:cy,a:i*1.26+Math.random()}));S.age=0;S.sh=18}
 S.age+=dt;
 if(S.age<1.8&&S.seg.length<1100)for(const q of S.tp.slice()){const nx=q.x+Math.cos(q.a)*16,ny=q.y+Math.sin(q.a)*16;S.seg.push([q.x,q.y,nx,ny]);q.x=nx;q.y=ny;q.a+=(Math.random()-.5)*.7;if(Math.random()<.04&&S.tp.length<22)S.tp.push({x:q.x,y:q.y,a:q.a+(Math.random()<.5?-.8:.8)})}
 const p=ez(S.age/1.5);dot(x,cx,cy,300*p+Math.sin(t*6)*14,r.g,.5);dot(x,cx,cy,120*p,"#fff",.6);
 x.lineJoin="round";for(const[lw,col,al]of[[7,r.g,.5],[1.6,"#fff",1]]){x.globalAlpha=al;x.strokeStyle=col;x.lineWidth=lw;x.beginPath();for(const s of S.seg){x.moveTo(s[0],s[1]);x.lineTo(s[2],s[3])}x.stroke()}
 const u=(S.age%1.2)/1.2;x.globalAlpha=.6*(1-u);x.strokeStyle=r.c;x.lineWidth=2;x.beginPath();x.arc(cx,cy,u*500,0,7);x.stroke()},
7:(x,S,t,dt,w,h,r)=>{ /* 天仙 — sembilan langit terbuka */
 const cx=w/2,cy=h/2,m=Math.min(w,h),G="一二三四五六七八九";
 if(!S.f)S.f=Array.from({length:50},()=>({x:Math.random()*w,y:Math.random()*h,s:.6+Math.random()*1.4,p:Math.random()*6,z:5+Math.random()*8}));
 for(let i=0;i<9;i++){x.globalAlpha=(.25+.2*Math.sin(t*2+i))*ez(t);x.drawImage(spr("#ffe9a0"),w*(i+.5)/9-34,0,68,h)}
 dot(x,cx,cy,m*.55+Math.sin(t*3)*16,"#fff1a0",.5);
 x.font="22px 'Ma Shan Zheng',serif";x.textAlign="center";x.textBaseline="middle";x.fillStyle="#fff6c8";
 for(let i=0;i<9;i++){const u=ez((t-i*.2)/.7);if(u<=0)continue;const R=(m*.12+i*m*.045)*u;x.globalAlpha=.6*u;x.strokeStyle=i%2?"#fff3b0":r.c;x.lineWidth=i===8?3:1.5;x.setLineDash(i%2?[3,9]:[]);x.beginPath();x.arc(cx,cy,R,0,6.283);x.stroke();x.setLineDash([]);const a=t*.35*(i%2?-1:1)+i;x.globalAlpha=u;x.fillText(G[i],cx+Math.cos(a)*R,cy+Math.sin(a)*R)}
 for(const f of S.f){f.y+=f.s;f.x+=Math.sin(t*1.5+f.p)*.6;if(f.y>h+10){f.y=-10;f.x=Math.random()*w}dot(x,f.x,f.y,f.z,"#fff1a0",.7)}}
};

/* ---------- Summon (animasi sinematik ada di ritual.js) ---------- */
const R=$("ritual"),rc=$("rfx"),rx=rc.getContext("2d");
async function summon(times){
 if(busy)return;const cost=summonCost(times);
 if(stones<cost){toast("Spirit Stones tidak mencukupi.");sfx.err();return}
 lastFocus=document.activeElement;unlock();Music.setInt(1);busy=true;bgOn=false;stones-=cost;
 let best=CH[0];const results=[];
 for(let i=0;i<times;i++){let r=roll();pity++;if(pity>=50){r=realms[4];pity=0}
  if(times===10&&i===9&&best.rank<3&&r.rank<3)r=realms[2];
  const c=pickChar(r);results.push(c);
  if(c.rank>=5)pity=0; // Reset pity tepat saat rank >= 5 ditarik dalam loop
  if(c.rank>best.rank)best=c}
 // hasil langsung dicatat & disimpan SEBELUM animasi, jadi refresh/tutup tab tidak menghilangkan tarikan
 grant(results);mis.s+=times;if(times===10)mis.x++;if(best.rank>=3)mis.h=1;
 history.unshift(...results.slice().reverse());history=history.slice(0,10);
 render();renderCodex();renderDaily();
 setInert(true);
 if(fastSummon){
  flash(.45,280);
  sfx.gong(best.rank>=5?best.rank:2);
 } else {
  try{await playRitual(best)}catch(e){console.error(e);R.className="ritual hidden"}
 }
 try{showResult(best,times>1?results:null)}
 catch(e){console.error(e);$("result").classList.add("hidden");setInert(false);bgOn=true}
 finally{busy=false}}

/* ---------- Hasil ---------- */
const RS={on:false,tok:0};
function triggerDimensionalShatter(){
 const box=$("shatterFx");if(!box)return;
 box.innerHTML="";box.classList.remove("hidden");
 if(sfx&&sfx.shatter)sfx.shatter();
 const count=24,W=innerWidth,H=innerHeight;
 for(let i=0;i<count;i++){
  const p=document.createElement("div");p.className="shatter-shard";
  const x=Math.random()*W,y=Math.random()*H,sz=70+Math.random()*130;
  p.style.left=x+"px";p.style.top=y+"px";p.style.width=sz+"px";p.style.height=sz+"px";
  const tx=(Math.random()-.5)*700,ty=(Math.random()-.5)*700,rot=(Math.random()-.5)*220;
  p.style.setProperty("--tx",tx+"px");p.style.setProperty("--ty",ty+"px");p.style.setProperty("--rot",rot+"deg");
  const p1=`${Math.random()*30}% 0%`,p2=`100% ${Math.random()*40}%`,p3=`${60+Math.random()*40}% 100%`,p4=`0% ${60+Math.random()*40}%`;
  p.style.setProperty("--cp",`${p1},${p2},${p3},${p4}`);
  box.appendChild(p);
 }
 setTimeout(()=>{box.classList.add("hidden");box.innerHTML=""},850);
}

function showResult(r,list){
 LAST=r;LASTLIST=list;$("allBtn").classList.toggle("hidden",!list);const s=$("result");s.className="result-screen rk"+r.rank+(r.rank>=7?" divine":"");s.style.setProperty("--c",r.c);s.style.setProperty("--g",r.g);
 $("rarity").textContent=`✦ ${r.tier} · ${NEW.has(r.id)?"NEW CULTIVATOR":"DESTINY AWAKENED"} ✦`;$("realmChinese").textContent=r.whoCn+" · "+r.cn;$("portrait").innerHTML=portrait(r,90);
 $("realmName").innerHTML=[...r.who].map((ch,i)=>`<span style="animation-delay:${.35+i*.04}s">${ch===" "?"&nbsp;":ch}</span>`).join("");
 $("realmTag").textContent=`${r.el} · ${r.name}`;$("realmDesc").textContent=`「${r.sk}」 ${r.desc}`;$("realmPower").textContent=`+${r.power}`;
 $("resultList").innerHTML=list?list.slice().sort((a,b)=>b.rank-a.rank).map((x,i)=>`<i style="--c:${x.c};animation-delay:${1.5+i*.1}s">${x.who}${NEW.has(x.id)?" ★":""}</i>`).join(""):"";
 s.querySelectorAll(".ring,.rays-bg,.rarity,.chinese,.tag,.power,.continue,#realmDesc").forEach(e=>{e.style.animation="none";e.offsetHeight;e.style.animation=""});
 const againTimes=list?10:1,againCost=summonCost(againTimes);
 $("againBtn").innerHTML=`SUMMON ×${againTimes} <span>${againCost} ✦</span>`;
 $("againBtn").onclick=()=>{hideSummary();$("closeResult").click();setTimeout(()=>summon(againTimes),100)};
 if(r.rank>=6){
  triggerDimensionalShatter();
  if(r.rank>=7&&sfx&&sfx.chant)sfx.chant(2.5,.12);
 }
 const pWrap=$("portraitWrap");
 if(pWrap){
  pWrap.onmousemove=e=>{
   const b=pWrap.getBoundingClientRect(),x=(e.clientX-b.left)/b.width,y=(e.clientY-b.top)/b.height;
   pWrap.style.transform=`rotateY(${(x-.5)*26}deg) rotateX(${-(y-.5)*26}deg)`;
   const hf=$("holoFoil");if(hf)hf.style.backgroundPosition=`${x*100}% ${y*100}%`;
  };
  pWrap.onmouseleave=()=>{pWrap.style.transform="rotateY(0deg) rotateX(0deg)"};
 }
 resultFx(r);chime(r.rank);busy=false;$("closeResult").focus({preventScroll:true})}
function resultFx(r){
 const c=$("particles"),x=c.getContext("2d"),w=innerWidth,h=innerHeight,tok=++RS.tok,res=$("result");
 c.width=w*D;c.height=h*D;x.setTransform(D,0,0,D,0,0);RS.on=true;
 const S={sh:0},B=[],N=r.rank>=7?420:r.rank>=5?300:170;
 for(let i=0;i<N;i++){const a=Math.random()*6.283,s=Math.random()**.5*(r.rank>=6?17:13)+1;B.push({x:w/2,y:h/2,vx:Math.cos(a)*s,vy:Math.sin(a)*s,l:1,z:Math.random()*3+1,col:Math.random()<.3?"#ffffff":r.c,d:.008+Math.random()*.01})}
 let last=performance.now(),t=0;
 (function f(n){if(!RS.on||RS.tok!==tok)return;const dt=Math.min(.05,(n-last)/1000);last=n;t+=dt;
  x.globalCompositeOperation="source-over";x.clearRect(0,0,w,h);x.globalCompositeOperation="lighter";
  SC[r.rank](x,S,t,dt,w,h,r);
  for(const q of B){if(q.l<=0)continue;q.vx*=.98;q.vy=q.vy*.98+.05;q.x+=q.vx;q.y+=q.vy;q.l-=q.d;dot(x,q.x,q.y,q.z*3.2,q.col,q.l)}
  S.sh=(S.sh||0)*.88;res.style.transform=S.sh>.4&&!ST.calm?`translate(${(Math.random()-.5)*S.sh}px,${(Math.random()-.5)*S.sh}px)`:"";
  requestAnimationFrame(f)})(last)}


/* ================= V6 & V7 Upgrade: Karakter, Player Realm, Alkimia, Codex ================= */
const PLAYER_REALMS=[
 {rank:1,name:"Body Tempering",cn:"凡体 · 炼体境",cost:0,qMult:1,dailyStone:0,desc:"Tubuh fana yang baru mulai merasakan aliran energi spiritual langit dan bumi."},
 {rank:2,name:"Qi Condensation",cn:"通脉 · 练气境",cost:15000,qMult:1.15,dailyStone:150,desc:"Meridian terbuka. Qi mengalir bebas (+15% QPS, +150 Stones/hari)."},
 {rank:3,name:"Foundation",cn:"道基 · 筑基境",cost:60000,qMult:1.35,dailyStone:300,desc:"Fondasi Dao terukir sempurna. Meninggalkan kefanaan (+35% QPS, +300 Stones/hari)."},
 {rank:4,name:"Core Formation",cn:"金丹 · 结丹境",cost:250000,qMult:1.65,dailyStone:600,desc:"Inti emas berputar memancarkan cahaya abadi (+65% QPS, +600 Stones/hari)."},
 {rank:5,name:"Nascent Soul",cn:"元神 · 元婴境",cost:1000000,qMult:2.0,dailyStone:1200,desc:"Jiwa primordial terlahir kembali (+100% QPS, +1.200 Stones/hari)."},
 {rank:6,name:"Void Ascendant",cn:"洞虚 · 化虚境",cost:5000000,qMult:2.5,dailyStone:2500,desc:"Mampu merobek tirai ruang dan kehampaan semesta (+150% QPS, +2.500 Stones/hari)."},
 {rank:7,name:"Heavenly Immortal",cn:"九天 · 天仙境",cost:20000000,qMult:3.5,dailyStone:5000,desc:"Puncak kultivasi agung menundukkan sembilan langit (+250% QPS, +5.000 Stones/hari)."}
];

const LORE=[
 "Pandai besi desa fana yang urat nadinya mengeras bagai baja setelah meminum mata air roh pegunungan kuno.",
 "Pendekar pengelana yang mampu membelah batu karang besar hanya dengan satu tinju tanpa senjata.",
 "Pemburu muda dari Hutan Kabut yang bergerak secepat desau angin sebelum mangsanya menyadari keberadaannya.",
 "Murid Sekte Giok Hijau dengan hati selembut embun, mampu memulihkan tanaman layu dengan hembusan nafas roh.",
 "Penyair pedang yang bermeditasi di dasar air terjun, menguasai ilmu pedang yang mengalir seperti sungai tak berujung.",
 "Gadis lincah dari Lembah Angin Abadi yang melangkah di atas dedaunan tanpa menjatuhkannya ke tanah.",
 "Tetua pertapa yang membangun fondasi Dao sekokoh gunung purba, tak tergoyahkan oleh badai spiritual.",
 "Pendekar wanita yang mempelajari ketenangan danau cermin, mampu memantulkan serangan musuh tanpa celah.",
 "Mantan jenderal kekaisaran yang melepaskan takhta untuk menempa seratus pedang suci dari bijih besi langit.",
 "Putri phoenix berambut merah menyala dari Klan Api Langit, mengendalikan kobaran api murni dari inti dantian.",
 "Pendekar pertapa di Puncak Petir Ungu yang menyerap guntur langit ke dalam inti emasnya tanpa terluka.",
 "Gadis dari Negeri Salju Abadi yang tatapannya mampu membekukan aliran meridian musuh seketika.",
 "Jenius pedang berdarah dingin yang membakar jiwa fana demi menumbuhkan teratai api primordial di lautan roh.",
 "Pengembara awan yang menunggangi bangau spiritual, jiwanya telah melampaui batas hidup dan mati dunia fana.",
 "Kultivator misterius pemegang tombak bayangan yang menembus rahasia kegelapan dan ilusi jiwa primordial.",
 "Tetua agung pembedah ruang angkasa; satu lambaian tangannya mampu merobek tirai dimensi kehampaan.",
 "Peramal bintang yang mampu melipat jarak ribuan li hanya dalam satu hembusan nafas melalui celah waktu.",
 "Penguasa jurang kegelapan yang mendiamkan segala suara di sekitarnya dengan kekuatan medan kehampaan mutlak.",
 "Penguasa klan naga primordial yang tertidur sepuluh ribu tahun, bangkit kembali untuk menundukkan sembilan langit.",
 "Perawan suci Puncak Awan Ungu yang melangkah di atas halilintar langit dengan titah suci yang tak terbantahkan.",
 "Tetua agung tak bertuan yang telah memahami rahasia Dao purba sebelum langit dan bumi diciptakan."
];

const ALCHEMY_RECIPES=[
 {id:"gather",name:"Spirit Gathering Pill",cn:"聚灵丹",qiCost:10000,stoneGain:250,desc:"Memadatkan 10.000 Qi murni menjadi 250 Spirit Stones."},
 {id:"core",name:"Golden Core Essence Pill",cn:"凝丹丸",qiCost:50000,stoneGain:1400,desc:"Konsentrat esensi spiritual: menghasilkan 1.400 Spirit Stones."},
 {id:"heaven",name:"Heavenly Fortune Pill",cn:"天命破境丹",qiCost:200000,stoneGain:6000,pityGain:5,desc:"Pil takdir sembilan langit: +6.000 Spirit Stones & +5 Pity langsung!"}
];

const FEAT=18,base=[1,3,8,20,55,150,500],PEN=[146.83,164.81,185,220,246.94,293.66,329.63,369.99,440,493.88,587.33];
const CH=[[1,"Iron Ox Han","韩铁牛","金","Iron Hide"],[1,"Stonefist Lei","雷石","土","Boulder Strike"],[1,"Young Tiger Wu","吴小虎","风","Tiger Pounce"],
[2,"Lin Qingyue","林清月","木","Verdant Breath"],[2,"Mo Chen","莫辰","水","Flowing Qi"],[2,"Su Wan'er","苏晚儿","风","Wind Step"],
[3,"Yan Zhuo","颜卓","土","Mountain Foundation"],[3,"Bai Lian","白莲","水","Mirror Lake"],[3,"Gu Heng","顾衡","金","Hundred Blades"],
[4,"Huo Linger","霍灵儿","火","Golden Core Blaze"],[4,"Shen Yuan","沈渊","雷","Thunder Core"],[4,"Ning Shuang","宁霜","冰","Frost Core"],
[5,"Ye Wuchen","叶无尘","火","Soul Lotus"],[5,"Xiao Yunhe","萧云鹤","风","Cloud Soul"],[5,"Jiang Mo","姜墨","暗","Soul Shadow"],
[6,"Mu Xuanji","慕玄机","空","Void Rend"],[6,"Tang Ruoxi","唐若曦","空","Star Fold"],[6,"Chi Wuya","池无涯","暗","Silent Rift"],
[7,"Dragon Emperor Long Tian","龙天","龙","Dragon Emperor's Decree"],[7,"Lady Zixiao","紫霄","光","Nine Heavens Edict"],[7,"Daoist Xuan Ji","玄机子","道","Primordial Dao"]]
 .map((c,i)=>({...realms[c[0]-1],id:i,who:c[1],whoCn:c[2],el:c[3],sk:c[4],lore:LORE[i]}));

let own={},qi=0,streak=0,login="",day="",mis={s:0,x:0,h:0,l:0},claimed={},banner=0,lost=0,musicPref=false,lastT=Date.now(),NEW=new Set(),LAST,tc=0;
let pRealm=1,fastSummon=false,pillsCrafted=0,codexFilter="all",codexSearchQuery="",activeCharId=null;
let divineDate="",divineBuff=null,towerFloor=1;
const MIS=[["s","Summon 5 kali",5,300],["x","Lakukan summon ×10",1,500],["h","Dapatkan Spirit Realm ke atas",1,200],["l","Breakthrough 1 kultivator",1,150]];
const dk=(d=new Date())=>d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate(),yest=()=>dk(new Date(Date.now()-864e5));
function summonCost(times){
 const base=times===10?900:100;
 if(divineBuff&&divineBuff.type==="discount"&&divineDate===dk()){
  return Math.round(base*divineBuff.discount);
 }
 return base;
}
const rates=()=>{
 const dBuff=divineBuff&&divineDate===dk()&&divineBuff.type==="rate"?divineBuff.bonus:0;
 return realms.map((r,i)=>{
  let b=r.rate+(banner&&i===0?-1:0)+(banner&&i===6?1:0);
  if(dBuff&&(i===4||i===5))b+=dBuff;
  else if(dBuff&&i===0)b-=dBuff*2;
  return Math.max(0.1,b);
 });
};
function pickChar(r){const pool=CH.filter(c=>c.rank===r.rank);if(r.rank===7&&banner){const f=lost||Math.random()<.5;lost=f?0:1;return f?CH[FEAT]:pool[1+Math.floor(Math.random()*2)]}return pool[Math.floor(Math.random()*pool.length)]}
function grant(l){NEW=new Set();for(const c of l){let o=own[c.id];if(!o){o=own[c.id]={n:0,lv:1};NEW.add(c.id)}o.n++}}
const playerMult=()=>PLAYER_REALMS[pRealm-1].qMult;
const qpsOf=c=>{const o=own[c.id];return o?base[c.rank-1]*(1+.25*(o.lv-1))*(1+.2*(o.n-1)):0};
const qps=()=>{
 let mult=playerMult();
 if(divineBuff&&divineDate===dk()&&divineBuff.type==="qi")mult*=divineBuff.bonus;
 return Math.round(CH.reduce((s,c)=>s+qpsOf(c),0)*mult*10)/10;
};

/* simpan progres */
const NUM=(v,f=0)=>typeof v==="number"&&isFinite(v)&&v>=0?v:f;
function clean(d){
 if(!d||typeof d!=="object"||Array.isArray(d))return null;
 const o2={};
 if(d.own&&typeof d.own==="object")for(const k of Object.keys(d.own)){const i=+k,e=d.own[k];if(Number.isInteger(i)&&CH[i]&&e&&NUM(e.n)>=1&&NUM(e.lv)>=1)o2[i]={n:Math.floor(e.n),lv:Math.floor(e.lv)}}
 const m=d.mis&&typeof d.mis==="object"?d.mis:{},cl={};
 if(d.claimed&&typeof d.claimed==="object")for(const k of["s","x","h","l"])if(d.claimed[k])cl[k]=1;
 return{
  stones:NUM(d.stones,10000),pity:Math.min(49,Math.floor(NUM(d.pity))),own:o2,qi:NUM(d.qi),t:NUM(d.t,Date.now()),
  streak:Math.floor(NUM(d.streak)),login:typeof d.login==="string"?d.login:"",day:typeof d.day==="string"?d.day:"",
  mis:{s:NUM(m.s),x:NUM(m.x),h:NUM(m.h),l:NUM(m.l)},claimed:cl,banner:d.banner?1:0,lost:d.lost?1:0,music:!!d.music,
  h:Array.isArray(d.h)?d.h.filter(i=>Number.isInteger(i)&&CH[i]).slice(0,10):[],
  pRealm:Math.min(7,Math.max(1,Math.floor(NUM(d.pRealm,1)))),
  fastSummon:!!d.fastSummon,
  pillsCrafted:Math.floor(NUM(d.pillsCrafted,0)),
  divineDate:typeof d.divineDate==="string"?d.divineDate:"",
  divineBuff:d.divineBuff&&typeof d.divineBuff==="object"?d.divineBuff:null,
  towerFloor:Math.min(50,Math.max(1,Math.floor(NUM(d.towerFloor,1))))
 };
}
function snap(){return{stones,pity,h:history.map(c=>c.id),own,qi,t:Date.now(),streak,login,day,mis,claimed,banner,lost,music:musicPref,pRealm,fastSummon,pillsCrafted,divineDate,divineBuff,towerFloor}}
function save(){if(noSave)return;try{localStorage.setItem("nh6",JSON.stringify(snap()))}catch(e){}}
function load(){let gain=0;try{const d=clean(JSON.parse(localStorage.getItem("nh6")||"null"));if(!d)return 0;({stones,pity,own,qi,streak,login,day,mis,claimed,banner,lost,pRealm,fastSummon,pillsCrafted,divineDate,divineBuff,towerFloor}=d);if(divineDate!==dk())divineBuff=null;history=d.h.map(i=>CH[i]);musicPref=d.music;gain=qps()*Math.max(0,Math.min(Date.now()-d.t,288e5))/1000;qi+=gain}catch(e){}return gain}
let PU=0,LASTLIST=null,sumTimers=[];

/* portrait karakter (SVG prosedural) */
function portrait(c,s=100){const h=(c.id*47+200)%360,col=c.c,gid="g"+c.id+"_"+(PU++);
 return `<svg aria-hidden="true" viewBox="0 0 100 120" width="${s}" height="${s*1.2}"><defs><radialGradient id="${gid}"><stop offset="0" stop-color="${col}" stop-opacity=".9"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></radialGradient></defs><circle cx="50" cy="52" r="48" fill="url(#${gid})"/><path d="M50 40C30 44 20 80 14 118H86C80 80 70 44 50 40Z" fill="hsl(${h},35%,16%)" stroke="${col}" stroke-width="1.5"/><path d="M36 70L50 118 64 70Q50 82 36 70Z" fill="${c.g}" opacity=".55"/><circle cx="50" cy="34" r="12" fill="#ecd9c6"/><path d="M37 34C34 12 66 12 63 34 60 22 40 22 37 34Z" fill="#14101f"/><path d="M62 30C80 40 76 70 70 92" stroke="#14101f" stroke-width="5" fill="none" stroke-linecap="round"/><line x1="82" y1="30" x2="82" y2="112" stroke="${col}" stroke-width="2.5"/><text x="50" y="108" text-anchor="middle" font-size="22" fill="${col}" opacity=".85" font-family="Ma Shan Zheng,serif">${c.el}</text></svg>`}

/* banner */
function updateRates(){const R=rates();document.querySelectorAll(".realm .rate").forEach((e,i)=>e.textContent=+R[i].toFixed(1)+"%")}
function renderBanners(){const f=CH[FEAT];$("banners").innerHTML=`<button class="bn ${banner?"":"on"}" data-b="0"><span class="cn">天命</span><div><b>Heavens' Fate</b><small>STANDARD · SEMUA RANAH</small></div></button><button class="bn ev ${banner?"on":""}" data-b="1">${portrait(f,52)}<div><b>Dragon Emperor 龙帝</b><small>RATE-UP 天仙 1.2% · 50/50 GUARANTEE</small></div></button>`;document.querySelector(".summon-panel").classList.toggle("ev",!!banner);updateRates()}
$("banners").onclick=e=>{const b=e.target.closest(".bn");if(!b||busy)return;banner=+b.dataset.b;renderBanners();save()};

/* Player Realm & Heavenly Tribulation */
function renderPlayerRealm(){
 const r=PLAYER_REALMS[pRealm-1],nxt=PLAYER_REALMS[pRealm];
 $("pRealmTxt").textContent=r.cn;
 $("tribRealmName").textContent=r.cn+" · "+r.name;
 $("tribRealmTier").textContent=r.name.toUpperCase();
 $("tribDesc").textContent=r.desc;
 $("tribQpsBonus").textContent=`+${Math.round((r.qMult-1)*100)}%`;
 $("tribDailyBonus").textContent=`+${fmt(r.dailyStone)} Stones`;
 if(!nxt){
  $("tribQiCost").textContent="RANAH TERTINGGI TERCAPAI";
  $("tribBarFill").style.width="100%";
  $("tribActionBtn").disabled=true;
  $("tribActionBtn").textContent="PUNCAK SEMBILAN LANGIT (MAKS)";
 } else {
  $("tribQiCost").textContent=`${fmt(Math.floor(qi))} / ${fmt(nxt.cost)} Qi`;
  $("tribBarFill").style.width=Math.min(100,(qi/nxt.cost)*100)+"%";
  $("tribActionBtn").disabled=qi<nxt.cost;
  $("tribActionBtn").textContent=`HADAPI KESENGSARAAN (${fmt(nxt.cost)} Qi) ⚡`;
 }
}
function openTribModal(){if(busy)return;lastFocus=document.activeElement;renderPlayerRealm();$("tribModal").classList.remove("hidden");setInert(true);$("tribClose").focus()}
function closeTribModal(){$("tribModal").classList.add("hidden");setInert(false);if(lastFocus&&lastFocus.focus)lastFocus.focus({preventScroll:true})}
$("pRealmBadge").onclick=openTribModal;
$("tribClose").onclick=closeTribModal;
$("tribModal").addEventListener("pointerdown",e=>{if(e.target===$("tribModal"))closeTribModal()});
$("tribActionBtn").onclick=()=>{
 const nxt=PLAYER_REALMS[pRealm];if(!nxt||qi<nxt.cost)return;
 qi-=nxt.cost;pRealm++;
 sfx.crack(.6);sfx.gong(7);flash(.9,600);
 toast(`Selamat! Anda menembus ke ${nxt.cn}!`);
 renderPlayerRealm();renderQi();render();save();
};

/* Paviliun Alkimia */
function renderAlchemy(){
 $("pillsCount").textContent=fmt(pillsCrafted)+" Pil";
 $("alchemy").innerHTML=ALCHEMY_RECIPES.map(a=>{
  const can=qi>=a.qiCost;
  return `<div class="alc-card">
   <div class="alc-top"><b>${a.cn}</b><small>${a.name}</small></div>
   <p class="alc-desc">${a.desc}</p>
   <div class="alc-cost"><small>BIAYA</small><b>${fmt(a.qiCost)} Qi</b></div>
   <div class="alc-yield"><small>HASIL</small><b>+${fmt(a.stoneGain)} ✦${a.pityGain?` · +${a.pityGain} PITY`:""}</b></div>
   <button type="button" class="alc-btn" data-id="${a.id}" ${can?"":"disabled"}>RACIK PIL</button>
  </div>`;
 }).join("");
}
$("alchemy").onclick=e=>{
 const b=e.target.closest(".alc-btn");if(!b||b.disabled)return;
 const r=ALCHEMY_RECIPES.find(x=>x.id===b.dataset.id);if(!r||qi<r.qiCost)return;
 qi-=r.qiCost;stones+=r.stoneGain;
 if(r.pityGain)pity=Math.min(49,pity+r.pityGain);
 pillsCrafted++;sfx.up();
 toast(`Berhasil meracik ${r.cn}! +${fmt(r.stoneGain)} ✦`);
 renderAlchemy();renderQi();render();save();
};

/* Fast summon checkbox */
const FAST_CHK=$("cFast");
if(FAST_CHK){
 FAST_CHK.checked=fastSummon;
 FAST_CHK.onchange=e=>{fastSummon=e.target.checked;save()};
}

/* harian */
function dailyReset(){if(day!==dk()){day=dk();mis={s:0,x:0,h:0,l:0};claimed={}}}
function renderDaily(){dailyReset();const can=login!==dk(),nx=Math.min((login===yest()?streak:0)+1,7),sh=Math.min(streak||1,7);
 let h=`<div class="dcard login"><b>Login Bonus · Hari ${can?nx:sh}</b><small>Streak ${streak} hari · +${200*(can?nx:sh)} ✦ (+${PLAYER_REALMS[pRealm-1].dailyStone} dari ${PLAYER_REALMS[pRealm-1].name})</small><button class="dbtn" data-a="login" ${can?"":"disabled"}>${can?"CLAIM":"SUDAH DIKLAIM"}</button></div>`;
 for(const[k,t,n,r]of MIS){const p=Math.min(mis[k]||0,n),done=p>=n,cl=claimed[k];h+=`<div class="dcard"><b>${t}</b><small>${p}/${n} · +${r} ✦</small><i><u style="width:${p/n*100}%"></u></i><button class="dbtn" data-a="${k}" ${done&&!cl?"":"disabled"}>${cl?"DIKLAIM":done?"CLAIM":"BELUM"}</button></div>`}
 $("daily").innerHTML=h}
$("daily").onclick=e=>{const b=e.target.closest(".dbtn");if(!b||b.disabled)return;const a=b.dataset.a;sfx.claim();
 if(a==="login"){streak=login===yest()?streak+1:1;login=dk();const pr=PLAYER_REALMS[pRealm-1],r=200*Math.min(streak,7)+pr.dailyStone;stones+=r;toast(`+${r} Spirit Stones (${pr.name} bonus: +${pr.dailyStone})`)}
 else{const m=MIS.find(x=>x[0]===a);claimed[a]=1;stones+=m[3];toast(`+${m[3]} Spirit Stones`)}
 render();renderDaily()};

/* codex + filter + idle qi + detail modal */
function renderCodex(){
 let n=0;
 const query=codexSearchQuery.trim().toLowerCase();
 const filtered=CH.filter(c=>{
  const o=own[c.id];if(o)n++;
  if(codexFilter==="owned"&&!o)return false;
  if(codexFilter==="unowned"&&o)return false;
  if(codexFilter==="high"&&c.rank<5)return false;
  if(query){
   const match=c.who.toLowerCase().includes(query)||c.whoCn.includes(query)||c.el.toLowerCase().includes(query)||c.name.toLowerCase().includes(query);
   if(!match)return false;
  }
  return true;
 });
 $("codexCount").textContent=n+"/"+CH.length;
 $("codex").innerHTML=filtered.length?filtered.map(c=>{
  const o=own[c.id];const cost=40*c.rank*(o?o.lv:1)**2;
  return `<div class="cc cr${c.rank} ${o?"":"off"} ${c.id===FEAT?"feat":""}" style="--c:${c.c}" data-id="${c.id}">
   ${portrait(c,70)}<b>${o?c.who:"???"}</b>
   <small>${o?`${c.whoCn} · ${c.el}<br>「${c.sk}」<br>${c.name}`:`${c.tier} · ${c.cn}`}</small>
   ${o?`<div class="st">${"★".repeat(Math.min(o.n,5))}</div><small>Lv ${o.lv} · ${fmt(Math.round(qpsOf(c)*10)/10)} Qi/s</small><button class="up" data-id="${c.id}" data-cost="${cost}" ${qi>=cost?"":"disabled"}>BREAKTHROUGH · ${fmt(cost)} Qi</button>`:""}
  </div>`;
 }).join(""):'<div class="empty">Tidak ada kultivator yang sesuai filter.</div>';
}
$("codexFilters").onclick=e=>{
 const b=e.target.closest(".cfilter");if(!b)return;sfx.tick();
 $("codexFilters").querySelectorAll(".cfilter").forEach(x=>x.classList.toggle("active",x===b));
 codexFilter=b.dataset.f;renderCodex();
};
$("codexSearch").oninput=e=>{codexSearchQuery=e.target.value;renderCodex()};

function openCharModal(id){
 const c=CH[id];if(!c)return;activeCharId=id;lastFocus=document.activeElement;
 const o=own[c.id],cost=40*c.rank*(o?o.lv:1)**2;
 $("charPortraitWrap").innerHTML=portrait(c,100);
 $("charRarityBadge").textContent=`✦ ${c.tier} · ${c.cn} ✦`;
 $("charRarityBadge").style.color=c.c;
 $("charName").textContent=o?c.who:"??? (Belum Ditemukan)";
 $("charName").style.color=c.c;
 $("charCn").textContent=o?`${c.whoCn} · Elemen ${c.el}`:`${c.tier} · Tarik di Destiny Summon`;
 $("charStars").textContent=o?"★".repeat(Math.min(o.n,5)):"Belum dimiliki";
 $("charLore").textContent=o?c.lore:"Takdir kultivator ini masih tersembunyi di balik sembilan langit. Tarik jiwa mereka melalui Destiny Summon untuk membuka catatan dao mereka.";
 $("charSkill").textContent=o?`「${c.sk}」 — Elemen ${c.el}`:"Terkunci";
 $("charLv").textContent=o?`Lv ${o.lv}`:"Lv 0";
 $("charQps").textContent=o?`+${fmt(Math.round(qpsOf(c)*10)/10)} Qi/s`:"0 Qi/s";
 const upBtn=$("charBreakthroughBtn");
 if(o){
  upBtn.classList.remove("hidden");
  upBtn.dataset.id=c.id;upBtn.dataset.cost=cost;
  upBtn.disabled=qi<cost;
  upBtn.textContent=`BREAKTHROUGH · ${fmt(cost)} Qi`;
 } else {
  upBtn.classList.add("hidden");
 }
 $("charModal").classList.remove("hidden");setInert(true);$("charClose").focus();
}
function closeCharModal(){activeCharId=null;$("charModal").classList.add("hidden");setInert(false);if(lastFocus&&lastFocus.focus)lastFocus.focus({preventScroll:true})}
$("charClose").onclick=closeCharModal;
$("charModal").addEventListener("pointerdown",e=>{if(e.target===$("charModal"))closeCharModal()});
$("charBreakthroughBtn").onclick=()=>{
 if(activeCharId==null)return;
 const c=CH[activeCharId],o=own[c.id];if(!o)return;
 const cost=40*c.rank*o.lv**2;if(qi<cost)return;
 qi-=cost;o.lv++;mis.l=1;toast("Breakthrough berhasil!");sfx.up();
 openCharModal(activeCharId);renderCodex();renderDaily();renderQi();save();
};
$("codex").onclick=e=>{
 const up=e.target.closest(".up");
 if(up){
  if(up.disabled)return;const c=+up.dataset.cost;if(qi<c)return;
  qi-=c;own[up.dataset.id].lv++;mis.l=1;toast("Breakthrough berhasil!");sfx.up();
  renderCodex();renderDaily();renderQi();save();return;
 }
 const card=e.target.closest(".cc");
 if(card&&card.dataset.id!=null)openCharModal(+card.dataset.id);
};

function renderQi(){
 $("qi").textContent=fmt(Math.floor(qi));$("qps").textContent=fmt(Math.round(qps()*10)/10)+"/s";
 document.querySelectorAll(".up").forEach(b=>b.disabled=qi<+b.dataset.cost);
 renderPlayerRealm();renderAlchemy();
}
setInterval(()=>{const n=Date.now(),dt=Math.max(0,Math.min(n-lastT,288e5))/1000;lastT=n;qi+=qps()*dt;renderQi();if(++tc%5===0)save()},1000);

/* musik (mesin generatif ada di audio.js) */
const MBTN=$("musicBtn");
function musicSync(){MBTN.classList.toggle("on",Music.on);MBTN.setAttribute("aria-pressed",Music.on?"true":"false")}
MBTN.onclick=()=>{unlock();if(Music.on){Music.stop();musicPref=false}else{Music.start();musicPref=true}
 ST.hint=true;saveST();MBTN.classList.remove("hint");musicSync();save()};
addEventListener("pointerdown",e=>{if(musicPref&&!Music.on&&!e.target.closest("#musicBtn")){Music.start();musicSync()}});
if(!ST.hint)MBTN.classList.add("hint");

/* kartu share (PNG) */
async function shareCard(){const c=LAST;if(!c)return;
 try{await Promise.race([Promise.all([document.fonts.load("600 34px Cinzel"),document.fonts.load("700 84px Cinzel"),document.fonts.load("56px 'Ma Shan Zheng'",c.whoCn+c.cn+c.el)]),new Promise(r=>setTimeout(r,1500))])}catch(e){}
const cv=document.createElement("canvas");cv.width=1080;cv.height=1350;const x=cv.getContext("2d");
 const g=x.createRadialGradient(540,600,50,540,600,900);g.addColorStop(0,c.g);g.addColorStop(.45,"#0b0715");g.addColorStop(1,"#020207");x.fillStyle=g;x.fillRect(0,0,1080,1350);
 x.globalCompositeOperation="lighter";x.globalAlpha=.55;x.drawImage(spr(c.c),140,160,800,800);x.globalCompositeOperation="source-over";x.globalAlpha=1;
 try{const im=new Image();im.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(portrait(c,100).replace("<svg ",'<svg xmlns="http://www.w3.org/2000/svg" '));await im.decode();x.drawImage(im,290,170,500,600)}catch(e){}
 x.textAlign="center";x.fillStyle=c.c;x.font="600 34px Cinzel,serif";x.fillText(`✦ ${c.tier} ✦`,540,860);
 let fs=84;x.font=`700 ${fs}px Cinzel,serif`;while(x.measureText(c.who).width>960&&fs>30){fs-=4;x.font=`700 ${fs}px Cinzel,serif`}
 x.shadowColor=c.g;x.shadowBlur=30;x.fillText(c.who,540,960);x.shadowBlur=0;
 x.fillStyle="#e6c986";x.font="56px 'Ma Shan Zheng',serif";x.fillText(`${c.whoCn} · ${c.cn}`,540,1040);
 x.fillStyle="#bda9e8";x.font="26px Cinzel,serif";x.fillText(`${c.el} · 「${c.sk}」 · ${c.name}`,540,1100);
 x.fillStyle="#6c6a80";x.font="22px Cinzel,serif";x.fillText("NINE HEAVENS · 九天",540,1290);
 const b=await new Promise(r=>cv.toBlob(r)),f=new File([b],"nine-heavens.png",{type:"image/png"});
 if(navigator.canShare&&navigator.canShare({files:[f]}))navigator.share({files:[f],title:"Nine Heavens"}).catch(()=>{});
 else{const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="nine-heavens.png";a.click();toast("Kartu tersimpan")}}
$("shareBtn").onclick=shareCard;

$("single").onclick=()=>summon(1);$("multi").onclick=()=>summon(10);$("summonMain").onclick=()=>summon(1);
$("closeResult").onclick=()=>{RS.on=false;Music.setInt(0);hideSummary();const s=$("result");s.classList.add("hidden");s.style.transform="";bgOn=true;setInert(false);if(lastFocus&&lastFocus.focus)lastFocus.focus({preventScroll:true});scrollTo({top:0,behavior:"smooth"})};

/* ================= V7: ringkasan kartu ×10 ================= */
function hideSummary(){sumTimers.forEach(clearTimeout);sumTimers=[];$("summary").classList.add("hidden")}
function showSummary(){if(!LASTLIST)return;
 const list=LASTLIST.slice().sort((a,b)=>a.rank-b.rank||a.id-b.id);let acc=.3;
 $("sumGrid").innerHTML=list.map(c=>{if(c.rank>=5)acc+=.35;const d=acc;acc+=.3;
  sumTimers.push(setTimeout(()=>sfx.flip(c.rank),d*1000+260));
  return `<div class="fc cr${c.rank}" style="--c:${c.c};--g:${c.g};--d:${d.toFixed(2)}s"><div class="fi"><div class="fb"><span>九</span></div><div class="ff">${portrait(c,56)}<b>${c.who}</b><small>${c.tier}</small>${NEW.has(c.id)?'<i class="nw">NEW</i>':""}</div></div></div>`}).join("");
 $("sumClose").style.setProperty("--dl",(acc+.2).toFixed(2)+"s");
 $("summary").classList.remove("hidden");$("sumClose").focus({preventScroll:true})}
$("allBtn").onclick=showSummary;
$("sumClose").onclick=()=>{hideSummary();$("closeResult").click()};

/* ================= V6.1: pengaturan, ekspor/impor save, keyboard ================= */
const SET=$("settings");
function applyCalm(){document.body.classList.toggle("calm",ST.calm)}
function openSettings(){if(busy)return;lastFocus=document.activeElement;$("vMus").value=Math.round(ST.mus*100);$("vSfx").value=Math.round(ST.sfx*100);$("cMute").checked=ST.mute;$("cCalm").checked=ST.calm;$("setNote").textContent="";SET.classList.remove("hidden");setInert(true);$("setClose").focus()}
function closeSettings(){SET.classList.add("hidden");setInert(false);if(lastFocus&&lastFocus.focus)lastFocus.focus({preventScroll:true})}
$("setBtn").onclick=openSettings;$("setClose").onclick=closeSettings;
SET.addEventListener("pointerdown",e=>{if(e.target===SET)closeSettings()});
$("vMus").oninput=e=>{ST.mus=e.target.value/100;applyAudio();saveST()};
$("vSfx").oninput=e=>{ST.sfx=e.target.value/100;applyAudio();saveST()};
$("vSfx").onchange=()=>sfx.ok();
$("cMute").onchange=e=>{ST.mute=e.target.checked;applyAudio();saveST()};
$("cCalm").onchange=e=>{ST.calm=e.target.checked;applyCalm();saveST()};
$("bExport").onclick=()=>{save();const d=new Date(),p2=n=>String(n).padStart(2,"0"),a=document.createElement("a");
 a.href=URL.createObjectURL(new Blob([JSON.stringify(snap(),null,1)],{type:"application/json"}));
 a.download=`nine-heavens-save-${d.getFullYear()}${p2(d.getMonth()+1)}${p2(d.getDate())}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),4000);$("setNote").textContent="Save berhasil diekspor."};
$("bImport").onclick=()=>$("fImport").click();
$("fImport").onchange=async e=>{const f=e.target.files[0];e.target.value="";if(!f)return;
 if(f.size>1e6){$("setNote").textContent="File terlalu besar.";return}
 try{const raw=JSON.parse(await f.text());if(!raw||typeof raw.stones!=="number"||typeof raw.own!=="object")throw 0;
  const d=clean(raw);if(!d)throw 0;d.t=Date.now();
  if(!confirm("Timpa progres saat ini dengan save dari file ini?"))return;
  noSave=true;localStorage.setItem("nh6",JSON.stringify(d));location.reload()}
 catch(err){noSave=false;$("setNote").textContent="File save tidak valid."}};
$("bReset").onclick=()=>{if(!confirm("Hapus SEMUA progres (stones, koleksi, Qi, misi)? Tindakan ini tidak bisa dibatalkan."))return;noSave=true;try{localStorage.removeItem("nh6")}catch(e){}location.reload()};
/* ===== updateSummonButtons ===== */
function updateSummonButtons(){
 const c1=summonCost(1),c10=summonCost(10);
 const s=$("single"),m=$("multi");
 if(s){s.innerHTML=`<strong>SUMMON ×1</strong><span>${fmt(c1)} ✦</span>`;s.disabled=stones<c1;}
 if(m){m.innerHTML=`<strong>SUMMON ×10</strong><span>${fmt(c10)} ✦ · GUARANTEED</span>`;m.disabled=stones<c10;}
}

/* ===== Dao Divination ===== */
const DIVINE_OUTCOMES=[
 {grade:"大吉",gradeEn:"GREAT DESTINY",poem:"「九天云开见真龙，万法归一入道宗」",
  effect:"Peluang kultivator rank 5 & 6 meningkat +0.75% hari ini!",
  buff:{type:"rate",bonus:0.75}},
 {grade:"中吉",gradeEn:"AUSPICIOUS QI",poem:"「玄气贯通三千界，灵力奔涌化金丹」",
  effect:"Produksi Qi meningkat ×1.5 hari ini!",
  buff:{type:"qi",bonus:1.5}},
 {grade:"小吉",gradeEn:"FORTUNE",poem:"「天机隐现金乌现，道缘轻叩紫霄门」",
  effect:"Diskon 15%! Summon ×1 = 85, ×10 = 765 hari ini.",
  buff:{type:"discount",discount:0.85}},
 {grade:"大凶",gradeEn:"CALAMITY",poem:"「逆天改命需磨难，天劫先至福自来」",
  effect:"Takdir sulit — dapat +500 Spirit Stones sebagai kompensasi langit!",
  buff:{type:"harvest",stones:500}},
];

function renderDivination(){
 const active=divineDate===dk()&&divineBuff;
 const badge=$("divineBadge"),txt=$("divineBuffTxt"),btn=$("openDivineBtn");
 if(active){
  const o=DIVINE_OUTCOMES.find(x=>x.buff.type===divineBuff.type)||DIVINE_OUTCOMES[0];
  if(txt)txt.textContent=o.grade+" · "+o.gradeEn;
  if(badge)badge.classList.add("active");
  if(btn)btn.textContent="☯ RAMALAN HARI INI (AKTIF)";
 } else {
  if(txt)txt.textContent="Belum Diramal";
  if(badge)badge.classList.remove("active");
  if(btn)btn.textContent="☯ KONSULTASI TAKDIR HARI INI";
 }
 const tw=$("towerFloorTxt");if(tw)tw.textContent=`Lantai ${towerFloor} / 50`;
}
function openDivineModal(){
 if(busy)return;lastFocus=document.activeElement;
 const result=$("divineStickResult"),tube=$("bambooSticks"),btn=$("shakeSticksBtn");
 if(result)result.classList.add("hidden");
 if(tube)tube.querySelectorAll("i").forEach(s=>{s.style.transform="";s.style.opacity="1";});
 const already=divineDate===dk()&&divineBuff;
 if(btn){
  btn.disabled=!!already;
  btn.textContent=already?"SUDAH DIRAMAL HARI INI ✓":"GUNCANG TABUNG BAMBU 🎋";
 }
 if(already&&result){
  const o=DIVINE_OUTCOMES.find(x=>x.buff.type===divineBuff.type)||DIVINE_OUTCOMES[0];
  $("stickGrade").textContent=o.grade+" · "+o.gradeEn;
  $("stickPoem").textContent=o.poem;
  $("stickEffect").textContent="Efek: "+o.effect;
  result.classList.remove("hidden");
 }
 $("divineModal").classList.remove("hidden");setInert(true);$("divineClose").focus();
}
function closeDivineModal(){$("divineModal").classList.add("hidden");setInert(false);if(lastFocus&&lastFocus.focus)lastFocus.focus({preventScroll:true});}
$("openDivineBtn").onclick=openDivineModal;
$("divineClose").onclick=closeDivineModal;
$("divineModal").addEventListener("pointerdown",e=>{if(e.target===$("divineModal"))closeDivineModal()});

$("shakeSticksBtn").onclick=()=>{
 if(divineDate===dk()&&divineBuff)return;
 if(sfx&&sfx.sticks)sfx.sticks();
 const tube=$("bambooSticks"),btn=$("shakeSticksBtn");
 tube.querySelectorAll("i").forEach((s,i)=>{s.style.transition=`transform 0.${4+i}s ease`;s.style.transform=`rotate(${(Math.random()-.5)*40}deg) translateY(${-5-Math.random()*12}px)`;});
 const bTube=tube.closest(".bamboo-tube");if(bTube)bTube.classList.add("shaking");
 setTimeout(()=>{
  if(bTube)bTube.classList.remove("shaking");
  const idx=Math.floor(Math.random()*DIVINE_OUTCOMES.length);
  const outcome=DIVINE_OUTCOMES[idx];
  divineBuff=outcome.buff;divineDate=dk();
  if(outcome.buff.type==="harvest"){stones+=outcome.buff.stones;toast(`🎋 Takdir sulit! +${fmt(outcome.buff.stones)} Spirit Stones`);}
  else toast(`🎋 Ramalan: ${outcome.grade} — ${outcome.effect}`);
  $("stickGrade").textContent=outcome.grade+" · "+outcome.gradeEn;
  $("stickPoem").textContent=outcome.poem;
  $("stickEffect").textContent="Efek: "+outcome.effect;
  $("divineStickResult").classList.remove("hidden");
  btn.disabled=true;btn.textContent="SUDAH DIRAMAL HARI INI ✓";
  if(sfx&&sfx.chant)sfx.chant(1.5,.08);
  renderDivination();updateRates();render();save();
 },900);
};

/* ===== Nine Heavens Trial Tower ===== */
const TOWER_BOSSES=[
 {name:"Serigala Roh Salju · Frost Spirit Wolf",desc:"Siluman penjaga dasar pagoda dengan cakar es spiritual.",col:"#69aaff"},
 {name:"Harimau Emas Baja · Iron Tiger Demon",desc:"Roh binatang dengan lapisan tubuh sekuat baja langit.",col:"#b978ff"},
 {name:"Ular Naga Kegelapan · Shadow Serpent",desc:"Ular mistis penjaga lantai tengah yang memancarkan racun bayangan.",col:"#ff67b0"},
 {name:"Phoenix Langit Ungu · Violet Sky Phoenix",desc:"Roh api abadi yang bangkit dari abu spiritual setiap kali dikalahkan.",col:"#ffc15a"},
 {name:"Kaisar Naga Langit · Heavenly Dragon Emperor",desc:"Penjaga puncak pagoda sembilan langit — manifestasi kekuatan sembilan ranah.",col:"#fff19a"},
];
function getBossForFloor(fl){
 const tier=Math.min(4,Math.floor((fl-1)/10));
 const b=TOWER_BOSSES[tier];
 const hp=Math.round(1500*Math.pow(1.3,fl-1));
 return{name:b.name,desc:b.desc,col:b.col,maxHp:hp,fl};
}
function getTopSquad(){
 return CH.filter(c=>own[c.id]).sort((a,b)=>qpsOf(b)-qpsOf(a)).slice(0,3);
}
function getSquadPower(){
 const sq=getTopSquad();
 return sq.reduce((s,c)=>s+qpsOf(c)*base[c.rank-1],0)||10;
}
function renderTower(){
 const fl=towerFloor;const boss=getBossForFloor(fl);
 const title=$("towerBossTitle"),name=$("towerBossName"),desc=$("towerBossDesc");
 const rs=$("towerRewardStones"),rq=$("towerRewardQi"),ft=$("towerFloorTxt");
 const rewardS=Math.round(500*Math.pow(1.18,fl-1));
 const rewardQ=Math.round(2000*Math.pow(1.2,fl-1));
 if(title)title.textContent=`BOSS LANTAI ${fl}`;
 if(name)name.textContent=boss.name;
 if(desc)desc.textContent=boss.desc;
 if(rs)rs.textContent=fmt(rewardS)+" Stones";
 if(rq)rq.textContent="+"+fmt(rewardQ)+" Qi";
 if(ft)ft.textContent=`Lantai ${fl} / 50`;
 const tg=$("towerTeamGrid");
 if(tg){
  const sq=getTopSquad();
  tg.innerHTML=sq.length?sq.map(c=>`<div class="tt-card" style="--c:${c.c}">${portrait(c,40)}<small>${c.who}</small><span>${fmt(Math.round(qpsOf(c)))} qps</span></div>`).join(""):`<p style="color:#888;font-size:.85em">Belum punya kultivator! Lakukan summon dulu.</p>`;
 }
}
function openTowerModal(){
 if(busy)return;lastFocus=document.activeElement;
 const fl=towerFloor;const boss=getBossForFloor(fl);
 $("towerModalTitle").textContent=`Pertarungan Lantai ${fl} — ${boss.name.split("·")[0].trim()}`;
 $("battleLog").textContent="Formasi Dao aktif! Bersiap menghadapi boss lantai "+fl+"...";
 $("battleResultWrap").classList.add("hidden");
 $("squadHpBar").style.width="100%";$("squadHpTxt").textContent="100%";
 $("bossHpBar").style.width="100%";$("bossHpTxt").textContent="100%";
 $("battleBossName").textContent=boss.name.split("·")[0].trim();
 const cv=$("towerCanvas"),ctx=cv.getContext("2d");
 ctx.clearRect(0,0,cv.width,cv.height);
 $("towerModal").classList.remove("hidden");setInert(true);$("towerClose").focus();
 renderTowerCanvas(cv,ctx,boss.col);
}
function closeTowerModal(){$("towerModal").classList.add("hidden");setInert(false);if(lastFocus&&lastFocus.focus)lastFocus.focus({preventScroll:true});}
let towerBattleStop=false;
const towerChallengeBtn=$("towerChallengeBtn");
if(towerChallengeBtn){towerChallengeBtn.onclick=()=>{openTowerModal();setTimeout(startTowerBattle,800);};}
$("towerClose").onclick=()=>{towerBattleStop=true;closeTowerModal();};
$("towerModal").addEventListener("pointerdown",e=>{if(e.target===$("towerModal")){towerBattleStop=true;closeTowerModal();}});


function renderTowerCanvas(cv,ctx,bossCol){
 const W=cv.width,H=cv.height;
 ctx.clearRect(0,0,W,H);
 // arena background
 const bg=ctx.createLinearGradient(0,0,0,H);
 bg.addColorStop(0,"#0a0520");bg.addColorStop(1,"#1a0830");
 ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
 // floor grid lines
 ctx.strokeStyle="rgba(180,130,255,0.15)";ctx.lineWidth=1;
 for(let i=0;i<W;i+=40){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,H);ctx.stroke();}
 for(let j=0;j<H;j+=40){ctx.beginPath();ctx.moveTo(0,j);ctx.lineTo(W,j);ctx.stroke();}
 // boss glow
 const gx=ctx.createRadialGradient(W*.65,H*.45,10,W*.65,H*.45,80);
 gx.addColorStop(0,bossCol+"cc");gx.addColorStop(1,bossCol+"00");
 ctx.fillStyle=gx;ctx.fillRect(0,0,W,H);
 // squad glow (left)
 const sq=ctx.createRadialGradient(W*.25,H*.5,5,W*.25,H*.5,60);
 sq.addColorStop(0,"#ffffffaa");sq.addColorStop(1,"#b99aff00");
 ctx.fillStyle=sq;ctx.fillRect(0,0,W,H);
}
function spawnBattleParticle(ctx,x,y,col){
 const count=6;
 for(let i=0;i<count;i++){
  const a=Math.random()*Math.PI*2,r=20+Math.random()*30;
  const px=x+Math.cos(a)*r,py=y+Math.sin(a)*r;
  ctx.beginPath();ctx.arc(px,py,2+Math.random()*3,0,Math.PI*2);
  ctx.fillStyle=col;ctx.globalAlpha=0.7+Math.random()*0.3;ctx.fill();ctx.globalAlpha=1;
 }
}
async function startTowerBattle(){
 towerBattleStop=false;
 const fl=towerFloor;const boss=getBossForFloor(fl);
 const rewardStones=Math.round(500*Math.pow(1.18,fl-1));
 const rewardQi=Math.round(2000*Math.pow(1.2,fl-1));
 const squadPow=getSquadPower();
 const cv=$("towerCanvas"),ctx=cv.getContext("2d");
 const W=cv.width,H=cv.height;
 const logEl=$("battleLog");
 const btn=$("towerChallengeBtn");
 if(btn)btn.disabled=true;
 let bossHp=boss.maxHp,squadHp=100;
 const dpsTick=squadPow*.08;
 const bossDmg=3+fl*.4;
 const TICK=700;
 const phases=["Serangan Dao pertama dilancarkan!","Teknik spiritual diluncurkan!","Pertempuran semakin sengit!","Kekuatan penuh dikeluarkan!","Pukulan terakhir — menentukan takdir!"];
 let phaseIdx=0;
 const tick=()=>new Promise(r=>setTimeout(r,TICK));
 renderTowerCanvas(cv,ctx,boss.col);
 while(bossHp>0&&squadHp>0&&!towerBattleStop){
  await tick();
  if(towerBattleStop)break;
  // squad attacks boss
  const dmg=dpsTick*(0.85+Math.random()*0.3);
  bossHp=Math.max(0,bossHp-dmg);
  // boss attacks squad
  squadHp=Math.max(0,squadHp-bossDmg*(0.8+Math.random()*0.4));
  // update HP bars
  const bPct=bossHp/boss.maxHp*100;
  const sPct=squadHp;
  $("bossHpBar").style.width=bPct.toFixed(1)+"%";
  $("bossHpTxt").textContent=bPct.toFixed(0)+"%";
  $("squadHpBar").style.width=Math.min(100,sPct).toFixed(1)+"%";
  $("squadHpTxt").textContent=Math.min(100,sPct).toFixed(0)+"%";
  // battle canvas effects
  renderTowerCanvas(cv,ctx,boss.col);
  // squad spark left
  spawnBattleParticle(ctx,W*.22,H*.5,"#e1be76");
  // boss spark right
  if(Math.random()<.6)spawnBattleParticle(ctx,W*.68,H*.45,boss.col);
  // log
  if(phaseIdx<phases.length&&Math.random()<.35){logEl.textContent=phases[phaseIdx++];}
  if(sfx&&sfx.sword)sfx.sword(.25);
  if(sfx&&sfx.thunder&&Math.random()<.25)sfx.thunder(.15);
 }
 if(towerBattleStop){if(btn)btn.disabled=false;return;}
 const won=squadHp>0&&bossHp<=0;
 renderTowerCanvas(cv,ctx,boss.col);
 if(won){
  // victory sparks
  for(let i=0;i<8;i++){spawnBattleParticle(ctx,W*(.3+Math.random()*.4),H*(.2+Math.random()*.6),"#ffe066");}
  logEl.textContent=`🏆 KEMENANGAN! Lantai ${fl} ditaklukkan! +${fmt(rewardStones)} Stones & +${fmt(rewardQi)} Qi`;
  if(sfx&&sfx.chant)sfx.chant(2,.1);
  const rWrap=$("battleResultWrap");
  $("battleResultTitle").textContent=`KEMENANGAN LANTAI ${fl}!`;
  $("battleResultSub").textContent=`+${fmt(rewardStones)} Spirit Stones · +${fmt(rewardQi)} Qi`;
  rWrap.classList.remove("hidden");
  $("battleClaimBtn").onclick=()=>{
   stones+=rewardStones;qi+=rewardQi;
   if(towerFloor<50)towerFloor++;
   towerBattleStop=true;
   closeTowerModal();renderTower();renderQi();render();save();
   toast(`🏆 Lantai ${fl} takluk! +${fmt(rewardStones)} ✦ +${fmt(rewardQi)} Qi`);
  };
 } else {
  logEl.textContent=`💀 KALAH di lantai ${fl}. Kumpulkan kekuatan lebih besar dan coba lagi!`;
  const rWrap=$("battleResultWrap");
  $("battleResultTitle").textContent="KEKALAHAN...";
  $("battleResultSub").textContent="Kultivasi lebih giat dan tantang kembali!";
  rWrap.classList.remove("hidden");
  $("battleClaimBtn").textContent="TUTUP ✕";
  $("battleClaimBtn").onclick=()=>{towerBattleStop=true;closeTowerModal();};
  if(sfx&&sfx.thunder)sfx.thunder(.3);
 }
 if(btn)btn.disabled=false;
}

addEventListener("keydown",e=>{if(e.key!=="Escape")return;
 if(!$("summary").classList.contains("hidden")){$("sumClose").click();return}
 if(!$("divineModal").classList.contains("hidden")){closeDivineModal();return}
 if(!$("towerModal").classList.contains("hidden")){towerBattleStop=true;closeTowerModal();return}
 if(!$("tribModal").classList.contains("hidden")){closeTribModal();return}
 if(!$("charModal").classList.contains("hidden")){closeCharModal();return}
 if(!SET.classList.contains("hidden"))closeSettings();
 else if(R.classList.contains("on"))$("skip").click();
 else if(!$("result").classList.contains("hidden"))$("closeResult").click()});
addEventListener("pagehide",save);document.addEventListener("visibilitychange",()=>{if(document.hidden)save()});
applyCalm();

const gain0=load();initGrid();renderBanners();dailyReset();renderDaily();renderCodex();renderQi();render();
if(gain0>=1)toast("Meditasi: +"+fmt(Math.floor(gain0))+" Qi");
