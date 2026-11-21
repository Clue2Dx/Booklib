document.addEventListener('click',e=>{if(!e.target.closest('[data-act="bulk"]'))return;$('#side').hidden=true;
 sheet(`<h2>Add many books</h2><p class="s">One book per line:<br>Title | Author | Pages | Category | Status | Year<br>Only the title is required. Status: read, in progress, or not started. Empty year = Want to read.</p><textarea id="bk_t" rows="10" dir="auto" placeholder="Atomic Habits | James Clear | 320 | Self-development | read | 2026"></textarea><div class="bar"><button class="ghost" data-act="close">Cancel</button><button class="pri" data-act="bulk-go">Add</button></div>`)});
document.addEventListener('click',e=>{if(!e.target.closest('[data-act="bulk-go"]'))return;
 const lines=$('#bk_t').value.split('\n').map(l=>l.trim()).filter(Boolean);if(!lines.length)return toast('Nothing to add');
 const ST={'read':'read','in progress':'in_progress','not started':'not_started'};let added=0,skipped=0;
 for(const l of lines){const [t,a,p,c,s,y]=l.split('|').map(x=>x.trim());if(!t)continue;
  if(live('books').some(b=>b.title.toLowerCase()==t.toLowerCase())){skipped++;continue}
  let cid=null;if(c){let cat=live('categories').find(x=>x.name.toLowerCase()==c.toLowerCase());if(!cat){cat={id:uid(),user_id:user.id,name:c,created_at:now()};save('categories',cat)}cid=cat.id}
  const b={id:uid(),user_id:user.id,created_at:now(),title:t,author:a||null,category_id:cid,total_pages:parseInt(p)||null};save('books',b);
  save('reading_records',{id:uid(),user_id:user.id,book_id:b.id,year:parseInt(y)||null,status:ST[(s||'').toLowerCase()]||'not_started',created_at:now()});added++}
 closeSheet();toast(added+' added'+(skipped?', '+skipped+' already existed':''))});

let SEL={on:false,ids:new Set()};
const _vCats=vCats;vCats=function(){return (SEL.on?'':'<button class="ghost" data-act="sel-on">Select books</button> ')+_vCats()};
const _render=render;render=function(){_render();if(!SEL.on)return;
 document.querySelectorAll('#main li.row[data-act="book"]').forEach(li=>{const on=SEL.ids.has(li.dataset.id);
  li.insertAdjacentHTML('afterbegin',`<span style="margin-inline-end:10px;color:var(--acc)">${on?'☑':'☐'}</span>`);li.style.justifyContent='flex-start';li.children[1].style.flex='1'});
 const bar=document.createElement('div');bar.style.cssText='position:fixed;left:0;right:0;bottom:0;z-index:15;background:var(--card);border-top:1px solid var(--line);padding:10px 14px calc(10px + env(safe-area-inset-bottom));display:flex;gap:8px;align-items:center';
 bar.innerHTML=`<span class="s" style="flex:1">${SEL.ids.size} selected</span><button class="ghost" data-act="sel-all">Select all</button><button class="pri" data-act="sel-move">Move</button><button class="ghost" data-act="sel-off">Cancel</button>`;$('#main').appendChild(bar)};
document.addEventListener('click',e=>{if(e.target.closest('[data-act="nav"]'))SEL={on:false,ids:new Set()};
 if(!SEL.on)return;const li=e.target.closest('li.row[data-act="book"]');if(!li)return;e.stopPropagation();
 const id=li.dataset.id;SEL.ids.has(id)?SEL.ids.delete(id):SEL.ids.add(id);render()},true);
document.addEventListener('click',e=>{const el=e.target.closest('[data-act]');if(!el)return;const a=el.dataset.act,id=el.dataset.id;
 if(a=='sel-on'){SEL.on=true;render()}
 else if(a=='sel-off'){SEL={on:false,ids:new Set()};render()}
 else if(a=='sel-all'){document.querySelectorAll('#main li.row[data-act="book"]').forEach(li=>SEL.ids.add(li.dataset.id));render()}
 else if(a=='sel-move'){if(!SEL.ids.size)return toast('Select at least one book');
  sheet(`<h2>Move ${SEL.ids.size} book(s)</h2><label>To category<select id="mv_c" data-cat>${catOpts('')}</select></label><div class="bar"><button class="ghost" data-act="close">Cancel</button><button class="pri" data-act="sel-go">Move</button></div>`)}
 else if(a=='sel-go'){const v=$('#mv_c').value;if(v=='__new')return;let n=0;
  SEL.ids.forEach(i=>{const b=bookById(i);if(b&&!b.deleted_at){save('books',{...b,category_id:v||null});n++}});
  SEL={on:false,ids:new Set()};closeSheet();render();toast(n+' moved')}
 else if(a=='cat-del'){const c=S.categories.find(x=>x.id==id);if(live('books').some(b=>b.category_id==id))return toast('Move its books first');
  const ns=live('notes').filter(n=>n.category_id==id);
  if(!confirm(`Delete "${c.name}"?`+(ns.length?` ${ns.length} note(s) will become uncategorized.`:'')))return;
  ns.forEach(n=>save('notes',{...n,category_id:null}));save('categories',{...c,deleted_at:now()});catsForm()}});
catsForm=function(){const cs=live('categories').sort((a,b)=>a.name.localeCompare(b.name));
 sheet(`<h2>Edit categories</h2>${cs.map(c=>{const n=live('books').filter(b=>b.category_id==c.id).length;
  return `<label>${n} books<div class="rr"><input dir="auto" data-ren="${c.id}" value="${esc(c.name)}">${n?'':`<button class="x" data-act="cat-del" data-id="${c.id}" aria-label="Delete category">🗑</button>`}</div></label>`}).join('')||'<p class="s">No categories yet.</p>'}<p class="s">A category can be deleted only when it has no books.</p><div class="bar"><button class="pri" data-act="close">Done</button></div>`)};
