const sb=supabase.createClient('https://guijyqkagbdascdxsoym.supabase.co','sb_publishable_51mTib40-xLq16tjLFUSFg_IVj0RRGn');
const T=['categories','books','reading_records','notes'],SL={not_started:'Not Started',in_progress:'In Progress',read:'Read'};
const $=s=>document.querySelector(s),uid=()=>crypto.randomUUID(),now=()=>new Date().toISOString();
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let S={},user=null,sy,syncing=false,V={view:'lib',lt:'plan',ct:'cat',nf:'all',year:new Date().getFullYear(),q:''};
const idb=new Promise((ok,no)=>{const r=indexedDB.open('booklib',1);r.onupgradeneeded=()=>[...T,'meta'].forEach(t=>r.result.createObjectStore(t,{keyPath:t=='meta'?'k':'id'}));r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)});
const tx=async(st,mode,fn)=>{const d=await idb;return new Promise((ok,no)=>{const t=d.transaction(st,mode),q=fn(t.objectStore(st));t.oncomplete=()=>ok(q&&q.result);t.onerror=()=>no(t.error)})};
const putRow=(t,r)=>tx(t,'readwrite',s=>s.put(r));
const live=t=>S[t].filter(r=>!r.deleted_at),bookById=id=>S.books.find(b=>b.id==id),catName=id=>S.categories.find(c=>c.id==id)?.name||'Uncategorized';
const toast=m=>{const e=$('#toast');e.textContent=m;e.hidden=false;clearTimeout(e.t);e.t=setTimeout(()=>e.hidden=true,2600)};
const setStat=m=>$('#stat').textContent=m;
async function load(){for(const t of T)S[t]=await tx(t,'readonly',s=>s.getAll())}
function save(t,row){row.updated_at=now();row._dirty=1;S[t]=S[t].filter(x=>x.id!=row.id).concat(row);putRow(t,row);render();clearTimeout(sy);sy=setTimeout(sync,400)}
async function sync(){
 if(syncing||!user)return;
 if(!navigator.onLine){setStat('Offline. Changes are saved on this device.');return}
 syncing=true;setStat('Syncing…');
 try{
  for(const t of T){const dirty=S[t].filter(r=>r._dirty);if(!dirty.length)continue;
   const {error}=await sb.from(t).upsert(dirty.map(({_dirty,...r})=>({...r,user_id:user.id})));if(error)throw error;
   for(const r of dirty)if(S[t].find(x=>x.id==r.id)===r){delete r._dirty;await putRow(t,r)}}
  const cur=(await tx('meta','readonly',s=>s.get('cur')))?.v||{};
  for(const t of T){let since=cur[t]||'1970-01-01T00:00:00Z';
   for(;;){const {data,error}=await sb.from(t).select('*').gt('updated_at',since).order('updated_at').limit(1000);if(error)throw error;if(!data.length)break;
    for(const r of data){const l=S[t].find(x=>x.id==r.id);if(l&&l._dirty)continue;S[t]=S[t].filter(x=>x.id!=r.id).concat(r);await putRow(t,r)}
    since=data[data.length-1].updated_at;if(data.length<1000)break}
   cur[t]=since}
  await tx('meta','readwrite',s=>s.put({k:'cur',v:cur}));
  setStat('Synced '+new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}));render();
 }catch(e){setStat('Sync failed. Will retry. '+(e.message||''))}
 syncing=false}
const recs=()=>live('reading_records').map(r=>({r,b:bookById(r.book_id)})).filter(i=>i.b&&!i.b.deleted_at);
const bestRec=id=>live('reading_records').filter(r=>r.book_id==id).sort((a,b)=>(b.year||0)-(a.year||0))[0];
const bookRow=(b,r)=>`<li class="row" data-act="book" data-id="${b.id}"><div><div class="t" dir="auto">${esc(b.title)}</div>${b.author?`<div class="s" dir="auto">${esc(b.author)}</div>`:''}</div><div class="m">${r?`<span class="pill ${r.status}">${SL[r.status]}</span>`:''}${b.total_pages?`<span>${b.total_pages} pages</span>`:''}</div></li>`;
function groups(items){const m={};items.forEach(i=>(m[catName(i.b.category_id)]??=[]).push(i));
 return Object.keys(m).sort().map(k=>`<h3>${esc(k)}</h3><ul>${m[k].sort((a,b)=>a.b.title.localeCompare(b.b.title)).map(i=>bookRow(i.b,i.r)).join('')}</ul>`).join('')||'<p class="empty">No books here yet. Tap + to add one.</p>'}
const tabs=(a,cur,act)=>`<div class="tabs">${a.map(([k,l])=>`<button data-act="${act}" data-v="${k}" class="${k==cur?'on':''}">${l}</button>`).join('')}</div>`;
function vLib(){const R=recs(),ip=R.filter(i=>i.r.status=='in_progress'),h=(ip.length?`<h3>Continue</h3><ul>${ip.map(i=>bookRow(i.b,i.r)).join('')}</ul>`:'')+tabs([['plan','Reading plan'],['want','Want to read']],V.lt,'lt');
 if(V.lt=='want')return h+groups(R.filter(i=>i.r.year==null));
 return h+`<div class="yr"><button data-act="yr" data-d="-1" aria-label="Previous year">‹</button><b>${V.year}</b><button data-act="yr" data-d="1" aria-label="Next year">›</button></div>`+groups(R.filter(i=>i.r.year==V.year))}
function vCats(){const h=tabs([['cat','By category'],['year','By year']],V.ct,'ct')+'<button class="ghost" data-act="cats">Edit categories</button>';
 if(V.ct=='cat')return h+groups(live('books').map(b=>({b,r:bestRec(b.id)})));
 const R=recs(),ys=[...new Set(R.map(i=>i.r.year))].sort((a,b)=>(b||0)-(a||0));
 return h+(ys.map((y,i)=>`<details ${i==0?'open':''}><summary>${y??'Want to read'}</summary>${groups(R.filter(x=>x.r.year==y))}</details>`).join('')||'<p class="empty">No reading records yet.</p>')}
const noteRow=n=>{const bk=n.book_id?bookById(n.book_id)?.title:n.book_text,meta=[new Date(n.created_at).toLocaleDateString(),n.category_id&&catName(n.category_id),bk&&bk+(n.page?' p. '+n.page:'')].filter(Boolean).join(' / ');
 return `<li class="row" data-act="note" data-id="${n.id}"><div><div class="t" dir="auto">${esc(n.title||'Untitled')}</div><div class="sn" dir="auto">${esc(n.content.split('\n').find(l=>l.trim())||'')}</div><div class="m2" dir="auto">${esc(meta)}</div></div></li>`};
function vNotes(){const f=V.nf,N=live('notes').filter(n=>f=='all'||(f[0]=='c'?n.category_id==f.slice(2):n.book_id==f.slice(2))).sort((a,b)=>b.created_at.localeCompare(a.created_at));
 const op=(v,l)=>`<option value="${v}" ${f==v?'selected':''}>${esc(l)}</option>`,bks=live('books').filter(b=>live('notes').some(n=>n.book_id==b.id));
 return `<select class="flt" data-act="nf"><option value="all">All notes</option><optgroup label="Category">${live('categories').map(c=>op('c:'+c.id,c.name)).join('')}</optgroup><optgroup label="Book">${bks.map(b=>op('b:'+b.id,b.title)).join('')}</optgroup></select><ul>${N.map(noteRow).join('')||'<li class="empty">No notes yet. Tap + to add one.</li>'}</ul>`}
function search(q){const B=live('books').filter(b=>(b.title+' '+(b.author||'')).toLowerCase().includes(q)).map(b=>bookRow(b,bestRec(b.id))),N=live('notes').filter(n=>((n.title||'')+' '+n.content).toLowerCase().includes(q)).map(noteRow);
 return `<h3>Books</h3><ul>${B.join('')||'<li class="empty">No books found</li>'}</ul><h3>Notes</h3><ul>${N.join('')||'<li class="empty">No notes found</li>'}</ul>`}
function render(){const q=V.q.trim().toLowerCase();$('#title').textContent={lib:'Book Library',cats:'Book Categories',notes:'Notes'}[V.view];
 $('#main').innerHTML=q?search(q):{lib:vLib,cats:vCats,notes:vNotes}[V.view]()}
const sheet=h=>{$('#sheet').innerHTML=`<div class="bg" data-act="close"></div><div class="card">${h}</div>`;$('#sheet').hidden=false};
const closeSheet=()=>{$('#sheet').hidden=true;$('#sheet').innerHTML=''};
const catOpts=sel=>`<option value="">None</option>${live('categories').sort((a,b)=>a.name.localeCompare(b.name)).map(c=>`<option value="${c.id}" ${c.id==sel?'selected':''}>${esc(c.name)}</option>`).join('')}<option value="__new">+ New category…</option>`;
const statusOpts=sel=>Object.entries(SL).map(([k,v])=>`<option value="${k}" ${k==sel?'selected':''}>${v}</option>`).join('');
const recBlock=id=>live('reading_records').filter(r=>r.book_id==id).sort((a,b)=>(b.year||0)-(a.year||0)).map(r=>`<div class="rr"><input type="number" inputmode="numeric" data-rec="${r.id}" data-f="year" placeholder="No year" value="${r.year??''}"><select data-rec="${r.id}" data-f="status">${statusOpts(r.status)}</select><button class="x" data-act="rec-del" data-id="${r.id}" aria-label="Remove">✕</button></div>`).join('')||'<p class="s">No reading records.</p>';
const bar=(id,del,saveAct)=>`<div class="bar">${id?`<button class="danger" data-act="${del}" data-id="${id}">Delete</button>`:''}<button class="ghost" data-act="close">Cancel</button><button class="pri" data-act="${saveAct}" data-id="${id||''}">Save</button></div>`;
function bookForm(id){const b=id&&bookById(id);
 sheet(`<h2>${b?'Edit book':'Add book'}</h2><label>Book title<input id="f_t" dir="auto" value="${esc(b?.title)}"></label><label>Author (optional)<input id="f_a" dir="auto" value="${esc(b?.author)}"></label><label>Category<select id="f_c" data-cat>${catOpts(b?.category_id)}</select></label><label>Total pages (optional)<input id="f_p" type="number" inputmode="numeric" min="1" value="${b?.total_pages||''}"></label>`+
 (b?`<h3>Reading history</h3><div id="recs">${recBlock(id)}</div><button class="ghost" data-act="rec-add" data-id="${id}">Add reading year</button><p class="s">${live('notes').filter(n=>n.book_id==id).length} linked notes</p>`
 :`<label>Reading status<select id="f_s">${statusOpts('not_started')}</select></label><label>Reading year (empty = Want to read)<input id="f_y" type="number" inputmode="numeric" value="${V.view=='lib'&&V.lt=='want'?'':V.year}"></label>`)+bar(id,'del-book','save-book'))}
