/* ============================================================
   NINE HEAVENS · visuals.js  (V7)
   Variasi tampilan: reveal saat scroll, warna ambient per section,
   lentera & bangau di hero, parallax ringan, tint saat hover ranah.
   Semua murni dekoratif — dimatikan otomatis pada mode "Kurangi efek".
   ============================================================ */
(()=>{
 const body=document.body,root=document.documentElement;

 /* 1. reveal saat scroll (pada kontainer, bukan item, supaya render ulang tidak berkedip) */
 const rv=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");rv.unobserve(e.target)}}),{threshold:.1});
 document.querySelectorAll(".section-head,.banners,.summon-panel,.alchemy-grid,.daily,.divine-banner,.tower-banner,.codex,.history-section").forEach(el=>{el.classList.add("rv");rv.observe(el)});

 /* 2. warna ambient mengikuti section yang sedang dibaca */
 const secIO=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)body.dataset.sec=e.target.dataset.sec}),{rootMargin:"-40% 0px -50% 0px"});
 document.querySelectorAll("[data-sec]").forEach(el=>secIO.observe(el));

 /* 3. hover ranah -> seluruh halaman ikut berwarna ranah itu */
 const rg=document.getElementById("realmGrid");
 if(rg){rg.addEventListener("pointerover",e=>{const c=e.target.closest(".realm");if(c)body.style.setProperty("--tint",c.style.getPropertyValue("--c").trim())});
  rg.addEventListener("pointerleave",()=>body.style.removeProperty("--tint"))}

 /* 4. lentera langit + bangau di hero */
 const hero=document.querySelector(".cinema");
 if(hero){
  const lw=document.createElement("div");lw.className="lanterns";lw.setAttribute("aria-hidden","true");
  const n=innerWidth<700?6:11;
  for(let i=0;i<n;i++){const l=document.createElement("i");l.style.left=(4+Math.random()*92).toFixed(1)+"%";
   l.style.setProperty("--t",(20+Math.random()*16).toFixed(1)+"s");l.style.setProperty("--dl",(-Math.random()*30).toFixed(1)+"s");
   l.style.setProperty("--sw",(20+Math.random()*50|0)+"px");l.style.setProperty("--s",(.6+Math.random()*.8).toFixed(2));lw.appendChild(l)}
  const cw=document.createElement("div");cw.className="cranes";cw.setAttribute("aria-hidden","true");
  const bird='<svg viewBox="0 0 48 22"><path d="M2 14 Q12 2 24 12 Q36 2 46 14 Q36 9 24 17 Q12 9 2 14Z"/></svg>';
  for(let i=0;i<4;i++){const b=document.createElement("span");b.innerHTML=bird;
   b.style.setProperty("--y",(10+Math.random()*28).toFixed(0)+"%");b.style.setProperty("--dl",(-i*9-Math.random()*4).toFixed(1)+"s");
   b.style.setProperty("--sc",(.5+Math.random()*.6).toFixed(2));cw.appendChild(b)}
  const altar=hero.querySelector(".altar");
  hero.insertBefore(lw,altar);hero.insertBefore(cw,altar)}

 /* 5. parallax ringan (hanya saat hero terlihat) */
 let tk=false;
 if(!matchMedia("(hover:none)").matches)addEventListener("scroll",()=>{if(tk)return;tk=true;requestAnimationFrame(()=>{tk=false;root.style.setProperty("--sy",Math.min(scrollY,1200))})},{passive:true});
})();
