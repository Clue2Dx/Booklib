try{
document.head.insertAdjacentHTML('beforeend',`<style>
html{touch-action:manipulation;-webkit-text-size-adjust:100%}
main{direction:rtl}.yr{direction:ltr}
.cat{background:var(--accbg);color:var(--acc);padding:6px 12px;border-radius:8px}
.row>div:first-child{flex:1}.row .t,.row .s,.row .sn,.row .m2{text-align:right}
.m{direction:ltr;align-items:flex-start!important}
#nc,#nt{direction:rtl;text-align:right;unicode-bidi:normal}
.rr .x:disabled{opacity:.25}
</style>`);
const vp=document.querySelector('meta[name=viewport]');if(vp)vp.content='width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover';
document.addEventListener('gesturestart',e=>e.preventDefault());
const cats=()=>live('categories').sort((a,b)=>(a.sort_order??1e9)-(b.sort_order??1e9)||a.name.localeCompare(b.name));
groups=function(items){const m={};items.forEach(i=>(m[i.b.category_id||'']??=[]).push(i));
 const ord=cats().map(c=>c.id).concat(['']);Object.keys(m).forEach(k=>{if(!ord.includes(k))ord.push(k)});
 return ord.filter(k=>m[k]).map(k=>`<h3 class="cat">${esc(k?catName(k):'Uncategorized')}</h3><ul>${m[k].sort((a,b)=>a.b.title.localeCompare(b.b.title)).map(i=>bookRow(i.b,i.r)).join('')}</ul>`).join('')||'<p class="empty">No books here yet. Tap + to add one.</p>'};
vCats=function(){const sel=typeof SEL!='undefined'&&SEL.on;
 const h=`<div class="srt"><span>Sort by</span>${tabs([['cat','Category'],['year','Year'],['imp','Importance']],V.ct,'ct')}</div><div class="tools">${sel?'':'<button class="ghost" data-act="sel-on">Select books</button>'}<button class="ghost" data-act="cats">Edit categories</button></div>`;
 if(V.ct=='cat')return h+groups(live('books').map(b=>({b,r:bestRec(b.id)})));
 if(V.ct=='imp'){const bs=live('books').map(b=>({b,r:bestRec(b.id)}));
  return h+([3,2,1].map(p=>{const a=bs.filter(i=>(i.b.priority||0)==p).sort((x,y)=>x.b.title.localeCompare(y.b.title));return a.length?`<h3 class="cat">${'!'.repeat(p)}</h3><ul>${a.map(i=>bookRow(i.b,i.r)).join('')}</ul>`:''}).join('')||'<p class="empty">No books marked yet.</p>')}
 const R=recs(),ys=[...new Set(R.map(i=>i.r.year))].sort((a,b)=>(b||0)-(a||0));
 return h+(ys.map((y,i)=>{const n=new Set(R.filter(x=>x.r.year==y&&x.r.status=='read').map(x=>x.b.id)).size;
  return `<details ${i==0?'open':''}><summary>${y==null?'Want to read':y+' ('+n+')'}</summary>${groups(R.filter(x=>x.r.year==y))}</details>`}).join('')||'<p class="empty">No reading records yet.</p>')};
catsForm=function(){const cs=cats();
 sheet(`<h2>Edit categories</h2>${cs.map((c,i)=>{const n=live('books').filter(b=>b.category_id==c.id).length;
  return `<label>${n} books<div class="rr"><input dir="auto" data-ren="${c.id}" value="${esc(c.name)}"><button class="x" data-act="cat-up" data-id="${c.id}" ${i?'':'disabled'} aria-label="Move up">▲</button><button class="x" data-act="cat-dn" data-id="${c.id}" ${i<cs.length-1?'':'disabled'} aria-label="Move down">▼</button><button class="x" data-act="cat-del" data-id="${c.id}" aria-label="Delete category">🗑</button></div></label>`}).join('')||'<p class="s">No categories yet.</p>'}<p class="s">Use ▲▼ to order categories. A category can be deleted only when it has no books.</p><div class="bar"><button class="pri" data-act="close">Done</button></div>`)};
document.addEventListener('click',e=>{const el=e.target.closest('[data-act="cat-up"],[data-act="cat-dn"]');if(!el)return;
 const cs=cats(),i=cs.findIndex(c=>c.id==el.dataset.id),j=el.dataset.act=='cat-up'?i-1:i+1;if(i<0||j<0||j>=cs.length)return;
 [cs[i],cs[j]]=[cs[j],cs[i]];cs.forEach((c,k)=>{if(c.sort_order!==k)save('categories',{...c,sort_order:k})});catsForm()});
}catch(e){console.error(e)}
