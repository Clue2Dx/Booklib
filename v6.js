document.head.insertAdjacentHTML('beforeend',`<style>
:root[data-theme=light]{--bg:#f6f5f2;--card:#fff;--ink:#1d2327;--mute:#6b747a;--line:#e3e1db;--acc:#2f6f6a;--accbg:#e4efed;--danger:#b3412f;color-scheme:light}
:root[data-theme=dark]{--bg:#141718;--card:#1c2022;--ink:#e8eaea;--mute:#8d979c;--line:#2a3033;--acc:#6fb3ab;--accbg:#223331;--danger:#e07a68;color-scheme:dark}
.st,.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:14px 0}.cards{margin-top:18px}
.st>div,.cd{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px 6px;text-align:center}
.st b,.cd b{display:block;font:600 24px Georgia,serif;color:var(--acc)}.st span,.cd span{font-size:12px;color:var(--mute)}
.cd.on{border-color:var(--acc);background:var(--accbg)}
li>.row{border-bottom:0;padding-bottom:4px}
.pg{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:2px 0 12px;border-bottom:1px solid var(--line)}.pg input{width:90px;padding:5px 8px}
.pb{flex:1 0 100%;height:4px;background:var(--line);border-radius:4px}.pb i{display:block;height:100%;background:var(--acc);border-radius:4px}
</style>`);
const applyTheme=t=>{document.documentElement.dataset.theme=t;const b=$('#thm');if(b)b.textContent=t=='dark'?'Light mode':'Dark mode'};
let _t=null;try{_t=localStorage.getItem('theme')}catch(e){}
applyTheme(_t||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'));
const progRow=i=>{const b=i.b,r=i.r,t=b.total_pages,p=r.current_page||0;
 return `<li><div class="row" data-act="book" data-id="${b.id}"><div><div class="t" dir="auto">${esc(b.title)}</div>${b.author?`<div class="s" dir="auto">${esc(b.author)}</div>`:''}</div></div><div class="pg"><span class="s">Page</span><input type="number" inputmode="numeric" data-prog="${r.id}" value="${r.current_page??''}"><span class="s">/ ${t||'?'}</span>${t?`<div class="pb"><i style="width:${Math.min(100,Math.round(p/t*100))}%"></i></div>`:''}</div></li>`};
const planH=R=>`<div class="yr"><button data-act="yr" data-d="-1" aria-label="Previous year">‹</button><b>${V.year}</b><button data-act="yr" data-d="1" aria-label="Next year">›</button></div>`+groups(R.filter(i=>i.r.year==V.year));
vLib=function(){const R=recs(),u=a=>new Set(a.map(i=>i.b.id)).size,rd=R.filter(i=>i.r.status=='read'),ip=R.filter(i=>i.r.status=='in_progress'),wt=R.filter(i=>i.r.year==null&&i.r.status=='not_started'),pl=R.filter(i=>i.r.year==V.year),h=V.hs;
 const tile=(n,t)=>`<div><b>${n}</b><span>${t}</span></div>`,card=(k,t,n)=>`<button class="cd ${h==k?'on':''}" data-act="hs" data-v="${k}"><b>${n}</b><span>${t}</span></button>`;
 return `<div class="st">${tile(u(rd),'Books Read')+tile(u(ip),'In Progress')+tile(u(wt),'Want to Read')}</div><h3>In Progress</h3>`+(ip.length?`<ul>${ip.map(progRow).join('')}</ul>`:'<p class="empty">No books in progress.</p>')+
 `<div class="cards">${card('all','All Books',live('books').length)+card('plan','Reading Plan',u(pl))+card('want','Want to Read',u(wt))}</div><div>${h=='all'?vCats():h=='plan'?planH(R):h=='want'?groups(wt):''}</div>`};
document.addEventListener('click',e=>{const el=e.target.closest('[data-act]');if(!el)return;const a=el.dataset.act;
 if(a=='hs'){V.hs=V.hs==el.dataset.v?null:el.dataset.v;V.lt=V.hs=='want'?'want':'plan';render()}
 else if(a=='other'){$('#side').hidden=true;sheet(`<h2>Other</h2><button class="ghost" style="width:100%;margin:6px 0" data-act="bulk">Add many books</button><button class="ghost" style="width:100%;margin:6px 0" data-act="export">Export backup</button><button class="ghost" style="width:100%;margin:6px 0" data-act="import">Import backup</button><div class="bar"><button class="pri" data-act="close">Done</button></div>`)}
 else if(a=='theme'){const t=document.documentElement.dataset.theme=='dark'?'light':'dark';try{localStorage.setItem('theme',t)}catch(e){}applyTheme(t)}});
document.addEventListener('change',e=>{const s=e.target,id=s.dataset.prog;if(!id)return;
 const r=S.reading_records.find(x=>x.id==id),b=bookById(r.book_id),v=parseInt(s.value)||null,row={...r,current_page:v};
 if(v&&b?.total_pages&&v>=b.total_pages&&confirm('You reached the last page. Mark this book as Read?'))row.status='read';
 save('reading_records',row)});
