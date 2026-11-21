try{
const NUMQ='#f_p,#f_y,[data-f="year"]';
const fixNum=()=>document.querySelectorAll(NUMQ).forEach(i=>{if(i.type!='text')i.type='text';i.setAttribute('inputmode','numeric');i.setAttribute('pattern','[0-9]*');i.setAttribute('lang','en');i.setAttribute('dir','ltr')});
new MutationObserver(fixNum).observe(document.body,{childList:true,subtree:true});
document.addEventListener('input',e=>{const t=e.target;if(!t.matches||!t.matches(NUMQ))return;
 const v=t.value.replace(/[٠-٩]/g,d=>d.charCodeAt(0)-1632).replace(/[۰-۹]/g,d=>d.charCodeAt(0)-1776).replace(/\D/g,'');if(v!=t.value)t.value=v});
document.head.insertAdjacentHTML('beforeend','<style>.yy{font-variant-numeric:tabular-nums;direction:ltr}</style>');
const addIP=()=>document.querySelectorAll('#main li.row[data-act="book"]').forEach(el=>{if(el.querySelector('.m'))return;
 const b=bookById(el.dataset.id);if(!b)return;
 const r=live('reading_records').filter(x=>x.book_id==b.id&&x.status=='in_progress').sort((p,q)=>(q.year||0)-(p.year||0))[0];
 const h=(b.total_pages?'<span>'+b.total_pages+' pages</span>':'')+(r&&r.year?'<span class="yy">'+r.year+'</span>':'');
 if(h){el.dataset.ip=1;el.insertAdjacentHTML('beforeend','<div class="m">'+h+'</div>')}});
const addYears=()=>document.querySelectorAll('#main li.row[data-act="book"]').forEach(el=>{const m=el.querySelector('.m');if(!m||m.querySelector('.yy')||el.dataset.ip)return;
 const d=el.closest('details');let y;
 if(d){y=parseInt(d.querySelector('summary').textContent);if(isNaN(y))y=null}
 else if(V.hs=='plan')y=V.year;
 else{const r=bestRec(el.dataset.id);y=r&&r.year}
 if(y)m.insertAdjacentHTML('beforeend','<span class="yy">'+y+'</span>')});
const addAll=()=>{addIP();addYears()};
new MutationObserver(addAll).observe(document.querySelector('#main'),{childList:true,subtree:true});
addAll();
const meta=document.querySelector('meta[name="theme-color"]');
const syncTheme=()=>{const c=document.documentElement.dataset.theme=='dark'?'#141718':'#f6f5f2';if(meta)meta.content=c;document.documentElement.style.background=c};
syncTheme();new MutationObserver(syncTheme).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
}catch(e){console.error(e)}
