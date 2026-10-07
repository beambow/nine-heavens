/* NINE HEAVENS · mobile.js — penyesuaian HP (hemat baterai & GPU) */
(()=>{
 /* hentikan animasi hero saat sudah di-scroll keluar layar */
 const hero=document.querySelector(".cinema");
 if(hero&&"IntersectionObserver"in window)new IntersectionObserver(es=>es.forEach(e=>hero.classList.toggle("off",!e.isIntersecting)),{threshold:0}).observe(hero);
 /* hentikan animasi CSS saat ritual/hasil terbuka (latar tidak terlihat) */
 const root=document.documentElement,ids=["ritual","result","summary"].map(i=>document.getElementById(i)).filter(Boolean);
 const chk=()=>root.classList.toggle("overlay-open",ids.some(e=>!e.classList.contains("hidden")));
 ids.forEach(e=>new MutationObserver(chk).observe(e,{attributes:true,attributeFilter:["class"]}));
})();
