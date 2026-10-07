/* NINE HEAVENS · art.js — ilustrasi portrait, arena Pagoda, naga ritual (menimpa fungsi lama) */
let ART_U=0;
/* ---------- 1. portrait kultivator: unik per karakter, makin megah per rank ---------- */
function portrait(c,s=100){
 const id=c.id,col=c.c,gl=c.g,rk=c.rank,u="p"+id+"_"+(ART_U++);
 const R=k=>{const v=Math.sin((id+1)*127.1+k*311.7)*43758.5453;return v-Math.floor(v)};
 const h=(id*47+200)%360,hs=R(1)*4|0,rs=R(2)*3|0,ey=R(4),skin=["#f6e1cf","#efd3b8","#f9e7d8"][R(3)*3|0];
 const hair=rk>=5&&R(5)<.5?"#e9e6f2":["#14101f","#2a1d3a","#3a1420","#1d2a3a","#2b1a12"][R(6)*5|0];
 const robe=`hsl(${h},38%,${13+rk*1.6}%)`,robe2=`hsl(${h},40%,${22+rk*1.6}%)`,gold="#e9c46a";
 const rays=rk>=5?Array.from({length:9},(_,i)=>`<path d="M50 40L${(50+Math.cos(i*.698)*80).toFixed(1)} ${(40+Math.sin(i*.698)*80).toFixed(1)}" stroke="${col}" stroke-opacity=".12" stroke-width="3"/>`).join(""):"";
 const stars=Array.from({length:4+rk},(_,i)=>`<circle cx="${(8+R(10+i)*84).toFixed(0)}" cy="${(8+R(30+i)*70).toFixed(0)}" r="${(.6+R(50+i)*1.1).toFixed(1)}" fill="${i%2?col:"#fff"}" opacity=".7"/>`).join("");
 const back=hs===1?`<path d="M35 30C25 48 26 88 33 108L50 102 67 108C74 88 75 48 65 30Z" fill="${hair}"/>`:hs===2?`<path d="M36 30C30 44 32 68 39 80L50 74 61 80C68 68 70 44 64 30Z" fill="${hair}"/>`:"";
 const front=[
  `<path d="M37 33C35 16 65 16 63 33 60 25 55 21 50 22 45 21 40 25 37 33Z" fill="${hair}"/><circle cx="50" cy="13" r="5.5" fill="${hair}"/><path d="M45 17h10" stroke="${gold}" stroke-width="1.6"/><path d="M37 32C35 42 36 50 38 56" stroke="${hair}" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M63 32C65 42 64 50 62 56" stroke="${hair}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
  `<path d="M37 34C33 14 67 14 63 34 61 26 56 21 50 22 44 21 39 26 37 34Z" fill="${hair}"/><path d="M37 30C32 52 34 74 39 90M63 30C68 52 66 74 61 90" stroke="${hair}" stroke-width="3.2" fill="none" stroke-linecap="round"/><path d="M50 21C46 24 41 30 38 38" stroke="#fff" stroke-opacity=".18" fill="none"/>`,
  `<path d="M37 33C35 16 65 16 63 33 60 25 55 21 50 22 45 21 40 25 37 33Z" fill="${hair}"/><circle cx="50" cy="14" r="6" fill="${hair}"/><path d="M50 18C62 20 74 30 70 54 68 40 60 28 50 22" fill="${col}" opacity=".85"/><path d="M45 14h10" stroke="${col}" stroke-width="1.4"/>`,
  `<path d="M36 34L33 17 41 24 44 11 50 21 56 11 59 24 67 17 64 34C62 26 38 26 36 34Z" fill="${hair}"/><path d="M62 30C74 38 78 52 74 66" stroke="${hair}" stroke-width="4" fill="none" stroke-linecap="round"/>`][hs];
 const crown=rk>=7?Array.from({length:9},(_,i)=>`<path d="M${(50+(i-4)*3.2).toFixed(1)} 19L${(50+(i-4)*5.2).toFixed(1)} ${(5+Math.abs(i-4)*1.6).toFixed(1)}" stroke="${gold}" stroke-width="1.5"/>`).join("")+`<path d="M41 20h18l-2 4H43z" fill="${gold}"/><circle cx="50" cy="21" r="2" fill="${col}"/>`:rk>=5?`<path d="M42 21l2-7 3 4 3-6 3 6 3-4 2 7z" fill="${gold}"/><circle cx="50" cy="19" r="1.6" fill="${col}"/>`:rk>=3?`<path d="M45 18h10l-1.5 4h-7z" fill="${gold}"/>`:"";
 const wp={
  "火":`<path d="M84 80C74 70 78 58 84 44 86 54 94 60 92 72 91 78 88 82 84 82Z" fill="${col}"/><path d="M84 82C79 76 82 68 85 60 87 68 90 72 88 78Z" fill="#fff6c8"/>`,
  "水":`<path d="M76 40C94 48 94 82 76 90 86 80 86 52 76 40Z" fill="${col}" opacity=".9"/><circle cx="90" cy="46" r="2" fill="#dff"/><circle cx="92" cy="86" r="1.6" fill="#dff"/>`,
  "土":`<path d="M84 34V104" stroke="#6b4a2c" stroke-width="3"/><path d="M73 30h22v16H73z" fill="#7a6a58" stroke="${col}" stroke-width="1.2"/><path d="M73 38h22" stroke="#00000044"/>`,
  "风":`<path d="M84 98L66 56M84 98L75 52M84 98L86 50M84 98L97 54M84 98L104 62" stroke="#e8f4ff" stroke-width="1.2" stroke-opacity=".0"/><path d="M82 96L68 62Q82 42 96 62Z" fill="${col}" opacity=".8" stroke="#fff" stroke-width=".8"/><path d="M82 96L75 58M82 96L82 52M82 96L89 58" stroke="#fff" stroke-opacity=".6"/>`,
  "雷":`<path d="M88 28L74 64H84L78 98 98 56H87Z" fill="${col}" stroke="#fff" stroke-width="1"/>`,
  "木":`<path d="M84 30V108" stroke="#5b3a1e" stroke-width="2.6"/><path d="M84 40C74 32 70 40 72 46 78 46 82 44 84 40ZM84 52C94 44 98 52 96 58 90 58 86 56 84 52Z" fill="${col}"/>`
 }[c.el]||`<path d="M84 20L87 30V96H81V30Z" fill="url(#w${u})" stroke="${col}" stroke-width=".8"/><path d="M77 96h14v3H77z" fill="${gold}"/><path d="M84 99V112" stroke="${col}" stroke-width="2"/>`;
 const ex=ey<.5?`<path d="M40.5 34.5Q44.5 30.5 48.5 34Q44.5 36.8 40.5 34.5Z`:`<path d="M40.5 34Q44.5 31 48.5 34.5Q44.5 36.5 40.5 34Z`;
 const eye=(cx,f)=>`<g transform="translate(${cx} 0)${f?" scale(-1 1)":""}"><path d="M-4 34.4Q0 30.8 4 34Q0 36.6 -4 34.4Z" fill="#fff"/><circle cx="0" cy="33.9" r="1.9" fill="${col}"/><circle cx="0" cy="33.9" r=".9" fill="#0a0612"/><circle cx="-.6" cy="33.2" r=".55" fill="#fff"/><path d="M-4.6 34.4Q0 30 4.6 33.6" stroke="#1a1020" stroke-width=".9" fill="none"/><path d="M-5 29.2Q0 26.6 4.6 28.8" stroke="${hair}" stroke-width="1.2" fill="none" stroke-linecap="round" transform="rotate(${f?-4:4} 0 29)"/></g>`;
 return `<svg aria-hidden="true" viewBox="0 0 100 120" width="${s}" height="${s*1.2}"><defs>
<linearGradient id="b${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(${h},50%,${15+rk*2}%)"/><stop offset="1" stop-color="#07060e"/></linearGradient>
<radialGradient id="a${u}"><stop offset="0" stop-color="${col}" stop-opacity=".6"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></radialGradient>
<linearGradient id="r${u}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${robe2}"/><stop offset="1" stop-color="${robe}"/></linearGradient>
<linearGradient id="k${u}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${skin}"/><stop offset="1" stop-color="#d9b496"/></linearGradient>
<linearGradient id="w${u}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="${col}"/></linearGradient>
<clipPath id="c${u}"><rect width="100" height="120" rx="10"/></clipPath></defs>
<g clip-path="url(#c${u})"><rect width="100" height="120" fill="url(#b${u})"/>${stars}
<circle cx="72" cy="26" r="15" fill="${col}" opacity=".2"/><circle cx="72" cy="26" r="11" fill="${col}" opacity=".16"/>
<path d="M0 92L18 64 30 80 48 52 66 80 82 60 100 88V120H0Z" fill="hsl(${h},30%,9%)" opacity=".92"/><path d="M0 100L24 78 44 94 70 74 100 98V120H0Z" fill="hsl(${h},28%,6%)"/>${rays}
<circle cx="50" cy="52" r="54" fill="url(#a${u})"/>
${rk>=4?`<circle cx="50" cy="36" r="24" fill="none" stroke="${col}" stroke-opacity=".55" stroke-width="1.2"/>`:""}${rk>=5?`<circle cx="50" cy="36" r="29" fill="none" stroke="${gold}" stroke-opacity=".45" stroke-dasharray="3 4"/>`:""}
${back}
<path d="M26 70C14 84 8 102 6 118Q20 122 30 108 34 92 38 76Z" fill="url(#r${u})" stroke="${col}" stroke-opacity=".7" stroke-width=".9"/><path d="M74 70C86 84 92 102 94 118Q80 122 70 108 66 92 62 76Z" fill="url(#r${u})" stroke="${col}" stroke-opacity=".7" stroke-width=".9"/>
<path d="M50 50C38 51 30 58 26 70L34 120H66L74 70C70 58 62 51 50 50Z" fill="url(#r${u})" stroke="${col}" stroke-opacity=".8" stroke-width="1"/>
${rs===0?`<path d="M32 112q4-6 8 0q4-6 8 0M52 112q4-6 8 0" stroke="${col}" stroke-opacity=".4" fill="none"/>`:rs===1?`<path d="M38 70L36 118M62 70L64 118" stroke="${col}" stroke-opacity=".3"/>`:`<circle cx="40" cy="104" r="1.4" fill="${col}" opacity=".5"/><circle cx="60" cy="104" r="1.4" fill="${col}" opacity=".5"/><circle cx="50" cy="112" r="1.4" fill="${col}" opacity=".5"/>`}
<path d="M41 47L50 82 59 47Q50 56 41 47Z" fill="hsl(${h},20%,90%)"/><path d="M41 47L50 82 59 47" stroke="${col}" stroke-width="1.6" fill="none"/>
<path d="M34 90Q50 99 66 90V97Q50 106 34 97Z" fill="${gl}" stroke="${gold}" stroke-width=".8"/><circle cx="50" cy="98" r="3" fill="${col}" stroke="${gold}" stroke-width=".8"/><path d="M50 101V114" stroke="${gold}" stroke-width="1.2"/>
<rect x="45" y="44" width="10" height="9" fill="#d9b496"/>
<path d="M37.5 31C37.5 21 62.5 21 62.5 31 62.5 41 56.5 50 50 50 43.5 50 37.5 41 37.5 31Z" fill="url(#k${u})"/>
<ellipse cx="41.5" cy="40" rx="3" ry="1.8" fill="#ff8a9a" opacity=".16"/><ellipse cx="58.5" cy="40" rx="3" ry="1.8" fill="#ff8a9a" opacity=".16"/>
${eye(44.5,0)}${eye(55.5,1)}<path d="M50 36q-1.2 4 1 5" stroke="#b98a70" stroke-width=".7" fill="none"/><path d="M47 44.6Q50 46.4 53 44.6" stroke="#c4586a" stroke-width="1.2" fill="none" stroke-linecap="round"/>
${front}${rk>=4?`<path d="M50 24.5l1.8 3-1.8 3-1.8-3z" fill="${col}"/>`:""}${crown}
<g style="filter:drop-shadow(0 0 3px ${col})">${wp}</g>
<text x="14" y="112" font-size="15" fill="${col}" opacity=".8" font-family="Ma Shan Zheng,serif">${c.el}</text></g>
<rect x=".8" y=".8" width="98.4" height="118.4" rx="9.4" fill="none" stroke="${rk>=5?gold:col}" stroke-opacity="${rk>=5?.85:.45}" stroke-width="${rk>=5?1.6:1}"/></svg>`}

/* ---------- 2. naga roh: badan menyempit bersisik, tanduk, kumis, surai ---------- */
function dragon(x,d,hue){const T=d.t,n=T.length;if(n<4)return;
 x.lineCap="round";x.lineJoin="round";
 for(let i=1;i<n;i++){const k=i/n,a=T[i-1],b=T[i],w=2+Math.pow(k,.8)*15;
  x.globalAlpha=.4*k+.1;x.strokeStyle=`hsl(${hue},100%,55%)`;x.lineWidth=w*1.9;x.beginPath();x.moveTo(a.x,a.y);x.lineTo(b.x,b.y);x.stroke();
  x.globalAlpha=.95;x.strokeStyle=`hsl(${hue},85%,${28+k*28}%)`;x.lineWidth=w;x.beginPath();x.moveTo(a.x,a.y);x.lineTo(b.x,b.y);x.stroke();
  if(i%3===0){x.globalAlpha=.7;x.strokeStyle=`hsl(${hue},100%,80%)`;x.lineWidth=1;x.beginPath();x.arc(b.x,b.y,w*.42,0,3.14);x.stroke()}
  if(i>n-26&&i%2===0){const nx=b.x-a.x,ny=b.y-a.y,l=Math.hypot(nx,ny)||1;x.globalAlpha=.8;x.fillStyle=`hsl(${hue+25},100%,70%)`;x.beginPath();x.moveTo(b.x-ny/l*w*.5,b.y+nx/l*w*.5);x.lineTo(b.x-ny/l*(w*.5+9)-nx/l*4,b.y+nx/l*(w*.5+9)-ny/l*4);x.lineTo(b.x-nx/l*3-ny/l*w*.3,b.y-ny/l*3+nx/l*w*.3);x.fill()}}
 const h=T[n-1],p=T[n-4],ang=Math.atan2(h.y-p.y,h.x-p.x);
 x.save();x.translate(h.x,h.y);x.rotate(ang);x.globalAlpha=1;
 x.strokeStyle=`hsl(${hue+20},100%,78%)`;x.lineWidth=1.6;
 for(const s of[-1,1]){x.beginPath();x.moveTo(8,s*4);x.bezierCurveTo(26,s*16,34,s*8,48,s*20);x.stroke();x.beginPath();x.arc(48,s*20,2.4,0,6.3);x.fillStyle="#fff";x.fill();
  x.beginPath();x.moveTo(-2,s*6);x.quadraticCurveTo(-16,s*18,-28,s*10);x.lineWidth=3;x.strokeStyle="#fff1c4";x.stroke();x.lineWidth=1.6;x.strokeStyle=`hsl(${hue+20},100%,78%)`}
 x.fillStyle=`hsl(${hue},80%,38%)`;x.beginPath();x.moveTo(-10,-10);x.quadraticCurveTo(10,-14,22,-6);x.lineTo(30,0);x.lineTo(22,6);x.quadraticCurveTo(10,12,-10,10);x.closePath();x.fill();
 x.fillStyle="#1a0a10";x.beginPath();x.moveTo(30,0);x.lineTo(20,4);x.lineTo(8,3);x.closePath();x.fill();
 x.fillStyle="#fff";for(let i=0;i<3;i++){x.beginPath();x.moveTo(26-i*5,1);x.lineTo(24-i*5,5);x.lineTo(22-i*5,1);x.fill()}
 x.fillStyle=`hsl(${hue},100%,85%)`;x.beginPath();x.moveTo(-6,-6);x.lineTo(-12,-12);x.lineTo(6,-8);x.fill();
 x.fillStyle="#ffe45c";x.beginPath();x.arc(10,-4,3,0,6.3);x.fill();x.fillStyle="#200";x.fillRect(9.5,-6,1.6,4);
 x.restore();dot(x,h.x,h.y,38,`hsl(${hue},100%,70%)`,.8)}

/* ---------- 3. arena Pagoda: petarung sungguhan, boss, proyektil, angka damage ---------- */
const ARENA={on:false,t:0,last:0,cv:null,ctx:null,bc:"#a55",sq:[],f:[],pj:[],fl:[],pt:[],bf:0,bs:0,sf:0,ss:0,img:{}};
function arenaImg(c){let m=ARENA.img[c.id];if(!m){m=new Image();m.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(portrait(c,100).replace("<svg ",'<svg xmlns="http://www.w3.org/2000/svg" '));ARENA.img[c.id]=m}return m}
function renderTowerCanvas(cv,ctx,bossCol){const A=ARENA;A.cv=cv;A.ctx=ctx;A.bc=bossCol||"#a55";
 if(!A.on){A.on=true;A.sq=(typeof getTopSquad==="function"?getTopSquad():[]);A.f=A.sq.map((c,i)=>({c,x:84+i*66,y:182-(i%2)*8,atk:0,dl:-1}));A.pj=[];A.fl=[];A.pt=[];A.last=performance.now();requestAnimationFrame(arenaLoop)}
 else{A.f.forEach((f,i)=>f.dl=i*.14+.05);A.bossDl=.5;A.dmg=Math.round((typeof getSquadPower==="function"?getSquadPower():10)*.08*(.85+Math.random()*.3))}}
function spawnBattleParticle(ctx,x,y,col){const A=ARENA;for(let i=0;i<5;i++)A.pt.push({x:x+(Math.random()-.5)*20,y:y+(Math.random()-.5)*20,vx:(Math.random()-.5)*90,vy:-30-Math.random()*70,l:1,c:col})}
function arenaLoop(n){const A=ARENA,m=document.getElementById("towerModal");if(!m||m.classList.contains("hidden")){A.on=false;return}
 requestAnimationFrame(arenaLoop);const dt=Math.min(.05,(n-A.last)/1e3);A.last=n;A.t+=dt;
 const x=A.ctx,W=A.cv.width,H=A.cv.height,t=A.t,calm=ST.calm,bx=W*.74,by=H*.5;
 x.globalAlpha=1;x.globalCompositeOperation="source-over";
 let g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,"#0a0520");g.addColorStop(.6,"#1a0d36");g.addColorStop(1,"#0a0612");x.fillStyle=g;x.fillRect(0,0,W,H);
 g=x.createRadialGradient(W*.5,H*.25,4,W*.5,H*.25,70);g.addColorStop(0,"#ffeec8");g.addColorStop(.3,A.bc+"55");g.addColorStop(1,"#0000");x.fillStyle=g;x.fillRect(0,0,W,H);
 x.fillStyle="#120a24";x.beginPath();x.moveTo(0,150);for(let i=0;i<=8;i++)x.lineTo(i*W/8,110+((i*37)%5)*10+(i%2)*14);x.lineTo(W,150);x.fill();
 x.fillStyle="#0b0618";x.beginPath();x.moveTo(0,170);for(let i=0;i<=6;i++)x.lineTo(i*W/6,134+((i*53)%4)*9);x.lineTo(W,170);x.fill();
 g=x.createLinearGradient(0,168,0,H);g.addColorStop(0,"#2a1a48");g.addColorStop(1,"#07040e");x.fillStyle=g;x.fillRect(0,168,W,H-168);
 x.strokeStyle="#c9a8ff44";x.lineWidth=1;x.setLineDash([5,7]);x.lineDashOffset=-t*14;x.beginPath();x.ellipse(W*.5,196,W*.42,16,0,0,6.3);x.stroke();x.setLineDash([]);
 x.globalCompositeOperation="lighter";
 /* boss */
 if(A.bf>0)A.bf-=dt*3;if(A.bs>0)A.bs*=.9;
 const bsh=calm?0:(Math.random()-.5)*A.bs,bb=1+Math.sin(t*2)*.03;
 x.save();x.translate(bx+bsh,by+Math.sin(t*1.4)*4);x.scale(bb,bb);
 x.save();x.rotate(t*.3);x.fillStyle=A.bc;x.globalAlpha=.5;for(let i=0;i<14;i++){x.rotate(.4488);x.beginPath();x.moveTo(-5,-36);x.lineTo(0,-64-(i%2)*10);x.lineTo(5,-36);x.fill()}x.restore();
 x.globalAlpha=.35;dot(x,0,0,90,A.bc,.5);x.globalCompositeOperation="source-over";x.globalAlpha=1;
 g=x.createRadialGradient(0,-8,4,0,0,42);g.addColorStop(0,"#34264d");g.addColorStop(1,"#09050f");x.fillStyle=g;x.strokeStyle=A.bc;x.lineWidth=2;x.beginPath();x.ellipse(0,0,38,34,0,0,6.3);x.fill();x.stroke();
 for(const s of[-1,1]){x.fillStyle="#e8dcc0";x.strokeStyle=A.bc;x.lineWidth=1.2;x.beginPath();x.moveTo(s*20,-26);x.bezierCurveTo(s*44,-36,s*52,-60,s*40,-76);x.bezierCurveTo(s*38,-54,s*28,-42,s*14,-32);x.closePath();x.fill();x.stroke();
  x.fillStyle=A.bc;x.beginPath();x.moveTo(s*8,-8);x.lineTo(s*24,-15);x.lineTo(s*19,-3);x.closePath();x.fill();x.fillStyle="#fff";x.fillRect(s*15-1.5,-9,3,3)}
 x.fillStyle="#12000a";x.beginPath();x.ellipse(0,16,18,10+Math.sin(t*3)*2,0,0,6.3);x.fill();x.fillStyle="#fff";for(let i=-2;i<=2;i++){x.beginPath();x.moveTo(i*6-2,8);x.lineTo(i*6,14);x.lineTo(i*6+2,8);x.fill()}
 if(A.bf>0){x.globalAlpha=Math.min(.7,A.bf);x.fillStyle="#fff";x.beginPath();x.ellipse(0,0,38,34,0,0,6.3);x.fill()}
 x.restore();x.globalAlpha=1;
 /* squad */
 if(A.sf>0)A.sf-=dt*3;if(A.ss>0)A.ss*=.9;
 A.f.forEach((f,i)=>{if(f.dl>=0){f.dl-=dt;if(f.dl<0){f.dl=-1;f.atk=1;const px=f.x+26,py=f.y-44;A.pj.push({x:px,y:py,tx:bx-30,ty:by,t:0,c:f.c.c,hit:1,sp:2.6})}}
  f.atk=Math.max(0,f.atk-dt*3);const lx=f.atk*16,bob=Math.sin(t*2.2+i)*2.5,sx=(A.sf>0&&!calm)?(Math.random()-.5)*A.ss:0;
  x.globalAlpha=.5;x.fillStyle="#000";x.beginPath();x.ellipse(f.x+lx,f.y+3,24,5,0,0,6.3);x.fill();
  x.globalCompositeOperation="lighter";dot(x,f.x+lx,f.y-44+bob,60,f.c.c,.35+f.atk*.4);x.globalCompositeOperation="source-over";x.globalAlpha=1;
  const im=arenaImg(f.c);if(im.complete&&im.naturalWidth)x.drawImage(im,f.x-36+lx+sx,f.y-88+bob,72,86);
  if(A.sf>0){x.globalAlpha=Math.min(.35,A.sf*.4);x.fillStyle="#f33";x.fillRect(f.x-36+sx,f.y-88,72,86);x.globalAlpha=1}});
 if(A.bossDl>0){A.bossDl-=dt;if(A.bossDl<=0&&A.f.length){const f=A.f[Math.random()*A.f.length|0];A.pj.push({x:bx-36,y:by,tx:f.x,ty:f.y-44,t:0,c:"#ff4a5e",hit:2,sp:2})}}
 /* proyektil */
 x.globalCompositeOperation="lighter";
 for(let i=A.pj.length-1;i>=0;i--){const p=A.pj[i];p.t+=dt*p.sp;const k=Math.min(1,p.t),px=p.x+(p.tx-p.x)*k,py=p.y+(p.ty-p.y)*k-Math.sin(k*3.14)*18;
  for(let j=0;j<6;j++){const kk=Math.max(0,k-j*.04);dot(x,p.x+(p.tx-p.x)*kk,p.y+(p.ty-p.y)*kk-Math.sin(kk*3.14)*18,10-j,p.c,.5-j*.07)}
  dot(x,px,py,13,"#fff",.9);dot(x,px,py,24,p.c,.5);
  if(p.t>=1){if(p.hit===1){A.bf=1;A.bs=10;A.fl.push({x:bx+(Math.random()-.5)*30,y:by-30,t:"-"+A.dmg.toLocaleString("id-ID"),a:1,c:"#ffe27a"});for(let q=0;q<10;q++)A.pt.push({x:p.tx,y:p.ty,vx:(Math.random()-.5)*160,vy:(Math.random()-.5)*160,l:1,c:p.c})}
   else{A.sf=1;A.ss=8;for(let q=0;q<8;q++)A.pt.push({x:p.tx,y:p.ty,vx:(Math.random()-.5)*120,vy:(Math.random()-.5)*120,l:1,c:"#ff4a5e"})}A.pj.splice(i,1)}}
 for(let i=A.pt.length-1;i>=0;i--){const p=A.pt[i];p.l-=dt*1.6;if(p.l<=0){A.pt.splice(i,1);continue}p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=60*dt;dot(x,p.x,p.y,5,p.c,p.l)}
 x.globalCompositeOperation="source-over";
 for(let i=A.fl.length-1;i>=0;i--){const f=A.fl[i];f.a-=dt*1.1;if(f.a<=0){A.fl.splice(i,1);continue}f.y-=26*dt;x.globalAlpha=Math.min(1,f.a*1.6);x.font="700 17px Cinzel,serif";x.textAlign="center";x.lineWidth=3;x.strokeStyle="#000";x.strokeText(f.t,f.x,f.y);x.fillStyle=f.c;x.fillText(f.t,f.x,f.y)}
 x.globalAlpha=1}
