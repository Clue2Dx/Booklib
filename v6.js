document.head.insertAdjacentHTML('beforeend',`<style>
:root[data-theme=light]{--bg:#f6f5f2;--card:#fff;--ink:#1d2327;--mute:#6b747a;--line:#e3e1db;--acc:#2f6f6a;--accbg:#e4efed;--danger:#b3412f;color-scheme:light}
:root[data-theme=dark]{--bg:#141718;--card:#1c2022;--ink:#e8eaea;--mute:#8d979c;--line:#2a3033;--acc:#6fb3ab;--accbg:#223331;--danger:#e07a68;color-scheme:dark}
.st,.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:14px 0}.cards{margin-top:18px}
.st>div,.cd{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px 6px;text-align:center}
.st b{display:block;font:600 24px Georgia,serif;color:var(--acc)}.st span{font-size:12px;color:var(--mute)}
.cd{padding:14px 6px}.cd span{font-size:14px;color:var(--ink)}.cd.on{border-color:var(--acc);background:var(--accbg)}
.srt{display:flex;align-items:center;gap:10px;margin:12px 0 4px}.srt>span{font-size:13px;color:var(--mute)}.srt .tabs{margin:0}
.tools{display:flex;gap:8px;margin:8px 0 2px}.tools .ghost{font-size:14px;padding:6px 12px}
</style>`);
const applyTheme=t=>{document.documentElement.dataset.theme=t;const b=$('#thm');if(b)b.textContent=t=='dark'?'Light mode':'Dark mode'};
let _t=null;try{_t=localStorage.getItem('theme')}catch(e){}
applyTheme(_t||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'));
V.hs=V.hs||'plan';
const progRow=i=>`<li class="row" data-act="book" data-id="${i.b.id}"><div><div class="t" dir="auto">${esc(i.b.title)}</div>${i.b.author?`<div class="s" dir="auto">${esc(i.b.author)}</div>`:''}</div></li>`;
const planH=R=>`<div class="yr"><button data-act="yr" data-d="-1" aria-label="Previous year">‹</button><b>${V.year}</b><button data-act="yr" data-d="1" aria-label="Next year">›</button></div>`+groups(R.filter(i=>i.r.year==V.year));
vCats=function(){const sel=typeof SEL!='undefined'&&SEL.on;
 const h=`<div class="srt"><span>Sort by</span>${tabs([['cat','Category'],['year','Year']],V.ct,'ct')}</div><div class="tools">${sel?'':'<button class="ghost" data-act="sel-on">Select books</button>'}<button class="ghost" data-act="cats">Edit categories</button></div>`;
 if(V.ct=='cat')return h+groups(live('books').map(b=>({b,r:bestRec(b.id)})));
 const R=recs(),ys=[...new Set(R.map(i=>i.r.year))].sort((a,b)=>(b||0)-(a||0));
 return h+(ys.map((y,i)=>`<details ${i==0?'open':''}><summary>${y??'Want to read'}</summary>${groups(R.filter(x=>x.r.year==y))}</details>`).join('')||'<p class="empty">No reading records yet.</p>')};
catsForm=function(){const cs=live('categories').sort((a,b)=>a.name.localeCompare(b.name));
 sheet(`<h2>Edit categories</h2>${cs.map(c=>{const n=live('books').filter(b=>b.category_id==c.id).length;return `<label>${n} books<div class="rr"><input dir="auto" data-ren="${c.id}" value="${esc(c.name)}"><button class="x" data-act="cat-del" data-id="${c.id}" aria-label="Delete category">🗑</button></div></label>`}).join('')||'<p class="s">No categories yet.</p>'}<p class="s">A category can be deleted only when it has no books. Move its books first.</p><div class="bar"><button class="pri" data-act="close">Done</button></div>`)};
vLib=function(){const R=recs(),u=a=>new Set(a.map(i=>i.b.id)).size,rd=R.filter(i=>i.r.status=='read'),ip=R.filter(i=>i.r.status=='in_progress'),wt=R.filter(i=>i.r.year==null&&i.r.status=='not_started'),h=V.hs;
 const tile=(n,t)=>`<div><b>${n}</b><span>${t}</span></div>`,card=(k,t)=>`<button class="cd ${h==k?'on':''}" data-act="hs" data-v="${k}"><span>${t}</span></button>`;
 return `<div class="st">${tile(u(rd),'Books Read')+tile(u(ip),'In Progress')+tile(u(wt),'Want to Read')}</div><h3>In Progress</h3>`+(ip.length?`<ul>${ip.map(progRow).join('')}</ul>`:'<p class="empty">No books in progress.</p>')+
 `<div class="cards">${card('all','All Books')+card('plan','Reading Plan')+card('want','Want to Read')}</div><div>${h=='all'?vCats():h=='plan'?planH(R):groups(wt)}</div>`};
document.addEventListener('click',e=>{const el=e.target.closest('[data-act]');if(!el)return;const a=el.dataset.act;
 if(a=='hs'){V.hs=el.dataset.v;V.lt=V.hs=='want'?'want':'plan';render()}
 else if(a=='other'){$('#side').hidden=true;sheet(`<h2>Other</h2><button class="ghost" style="width:100%;margin:6px 0" data-act="bulk">Add many books</button><button class="ghost" style="width:100%;margin:6px 0" data-act="export">Export backup</button><button class="ghost" style="width:100%;margin:6px 0" data-act="import">Import backup</button><div class="bar"><button class="pri" data-act="close">Done</button></div>`)}
 else if(a=='theme'){const t=document.documentElement.dataset.theme=='dark'?'light':'dark';try{localStorage.setItem('theme',t)}catch(e){}applyTheme(t)}});
