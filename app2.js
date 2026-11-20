document.addEventListener('click',e=>{const el=e.target.closest('[data-act]');if(!el)return;const a=el.dataset.act,id=el.dataset.id,v=el.dataset.v;
 if(a=='menu')$('#side').hidden=!$('#side').hidden;
 else if(a=='nav'){V.view=v;V.q='';$('#q').value='';$('#side').hidden=true;render()}
 else if(a=='lt'){V.lt=v;render()}else if(a=='ct'){V.ct=v;render()}
 else if(a=='yr'){V.year+=+el.dataset.d;render()}
 else if(a=='add')V.view=='notes'?noteEditor():bookForm();
 else if(a=='book')bookForm(id);else if(a=='note')noteEditor(id);else if(a=='close')closeSheet();
 else if(a=='save-book'){const t=$('#f_t').value.trim();if(!t)return toast('Title is required');
  const base=id?bookById(id):{id:uid(),user_id:user.id,created_at:now()};
  save('books',{...base,title:t,author:$('#f_a').value.trim()||null,category_id:$('#f_c').value||null,total_pages:parseInt($('#f_p').value)||null});
  if(!id)save('reading_records',{id:uid(),user_id:user.id,book_id:base.id,year:parseInt($('#f_y').value)||null,status:$('#f_s').value,created_at:now()});closeSheet()}
 else if(a=='del-book'){const n=live('notes').filter(x=>x.book_id==id).length;
  if(!confirm(n?`This book has ${n} linked note(s). The notes will be kept. Delete the book?`:'Delete this book?'))return;
  live('reading_records').filter(r=>r.book_id==id).forEach(r=>save('reading_records',{...r,deleted_at:now()}));save('books',{...bookById(id),deleted_at:now()});closeSheet()}
 else if(a=='rec-add'){const y=new Date().getFullYear();if(live('reading_records').some(r=>r.book_id==id&&r.year==y))return toast('This book already has a record for '+y+'. Change its year first.');
  save('reading_records',{id:uid(),user_id:user.id,book_id:id,year:y,status:'not_started',created_at:now()});$('#recs').innerHTML=recBlock(id)}
 else if(a=='rec-del'){const r=S.reading_records.find(x=>x.id==id);save('reading_records',{...r,deleted_at:now()});$('#recs').innerHTML=recBlock(r.book_id)}
 else if(a=='signout')signOut();else if(a=='export')backup();else if(a=='cats')catsForm();else if(a=='n-back')noteBack();else if(a=='n-menu')noteMenu();else if(a=='n-del')noteDel();
 else if(a=='n-ok'){const bk=$('#n_b').value||null;closeSheet();noteSave({category_id:$('#n_cat').value||null,book_id:bk,book_text:bk?null:$('#n_bt').value.trim()||null,page:$('#n_pg').value.trim()||null})}else if(a=='import')$('#imp').click()});
document.addEventListener('change',async e=>{const s=e.target;
 if(s.dataset.act=='nf'){V.nf=s.value;render()}
 else if(s.dataset.cat!==undefined&&s.value=='__new'){const n=(prompt('New category name')||'').trim();if(!n){s.value='';return}
  let c=live('categories').find(c=>c.name.toLowerCase()==n.toLowerCase());if(!c){c={id:uid(),user_id:user.id,name:n,created_at:now()};save('categories',c)}s.innerHTML=catOpts(c.id)}
 else if(s.dataset.ren){const c=S.categories.find(x=>x.id==s.dataset.ren),n=s.value.trim();if(!n||live('categories').some(x=>x.id!=c.id&&x.name.toLowerCase()==n.toLowerCase())){toast(n?'That category already exists':'Name cannot be empty');s.value=c.name;return}save('categories',{...c,name:n});toast('Renamed')}
 else if(s.dataset.rec){const r=S.reading_records.find(x=>x.id==s.dataset.rec);let v=s.value;
  if(s.dataset.f=='year'){v=parseInt(v)||null;if(live('reading_records').some(x=>x.id!=r.id&&x.book_id==r.book_id&&x.year==v)){toast('This book already has a record for that year');$('#recs').innerHTML=recBlock(r.book_id);return}}
  save('reading_records',{...r,[s.dataset.f]:v})}});
$('#q').addEventListener('input',e=>{V.q=e.target.value;render()});
function catsForm(){sheet(`<h2>Edit categories</h2>${live('categories').sort((a,b)=>a.name.localeCompare(b.name)).map(c=>`<label>${live('books').filter(b=>b.category_id==c.id).length} books<input dir="auto" data-ren="${c.id}" value="${esc(c.name)}"></label>`).join('')||'<p class="s">No categories yet.</p>'}<div class="bar"><button class="pri" data-act="close">Done</button></div>`)}
let NID=null,nt2;
const metaOf=n=>{const bk=n.book_id?bookById(n.book_id)?.title:n.book_text;return [n.category_id&&catName(n.category_id),bk&&bk+(n.page?' p. '+n.page:'')].filter(Boolean).join(' / ')};
function noteEditor(id){NID=id||null;const n=id&&S.notes.find(x=>x.id==id);
 $('#npage').innerHTML=`<div class="nb"><button data-act="n-back">‹ Back</button><button data-act="n-menu" aria-label="Note settings">⋯</button></div><div class="nw"><input id="nt" dir="auto" placeholder="Title" value="${esc(n?.title)}"><div id="nm" dir="auto">${n?esc(metaOf(n)):''}</div><textarea id="nc" dir="auto" placeholder="Write here…">${esc(n?.content)}</textarea></div>`;
 $('#npage').hidden=false;if(!n)$('#nc').focus()}
function noteSave(extra){clearTimeout(nt2);if($('#npage').hidden)return;const t=$('#nt').value.trim(),c=$('#nc').value;let n=NID&&S.notes.find(x=>x.id==NID);
 if(!n){if(!t&&!c.trim()&&!extra)return;n={id:uid(),user_id:user.id,created_at:now(),content:''};NID=n.id}
 if(n.title==(t||null)&&n.content==c&&!extra)return;
 const row={...n,title:t||null,content:c,...extra};save('notes',row);$('#nm').textContent=metaOf(row)}
function noteClose(){$('#npage').hidden=true;$('#npage').innerHTML='';NID=null}
function noteBack(){noteSave();noteClose()}
function noteDel(){if(!confirm('Delete this note?'))return;clearTimeout(nt2);const n=S.notes.find(x=>x.id==NID);if(n)save('notes',{...n,deleted_at:now()});closeSheet();noteClose()}
function noteMenu(){noteSave();const n=(NID&&S.notes.find(x=>x.id==NID))||{};
 sheet(`<h2>Note settings</h2><label>Category<select id="n_cat" data-cat>${catOpts(n.category_id)}</select></label><label>Quoted from book<select id="n_b"><option value="">No book</option>${live('books').sort((a,b)=>a.title.localeCompare(b.title)).map(b=>`<option value="${b.id}" ${b.id==n.book_id?'selected':''}>${esc(b.title)}</option>`).join('')}</select><input id="n_bt" dir="auto" placeholder="or type a book name" value="${esc(n.book_text)}"></label><label>Page (optional)<input id="n_pg" dir="auto" value="${esc(n.page)}"></label><div class="bar">${n.id?'<button class="danger" data-act="n-del">Delete note</button>':''}<button class="pri" data-act="n-ok">Done</button></div>`)}
document.addEventListener('input',e=>{if(e.target.id=='nt'||e.target.id=='nc'){clearTimeout(nt2);nt2=setTimeout(noteSave,600)}});
addEventListener('pagehide',()=>noteSave());document.addEventListener('visibilitychange',()=>{if(document.hidden)noteSave()});
function backup(){const o={format:'booklib-backup',version:1,exported_at:now()};T.forEach(t=>o[t]=S[t].map(({_dirty,...r})=>r));
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(o)],{type:'application/json'}));a.download='booklib-backup-'+now().slice(0,10)+'.json';a.click();toast('Backup exported')}
async function restore(f){let o;try{o=JSON.parse(await f.text())}catch(e){return toast('Not a valid backup file')}
 if(o?.format!='booklib-backup'||o.version!=1||T.some(t=>!Array.isArray(o[t])))return toast('Not a valid backup file');
 const ids=new Set(T.flatMap(t=>[...o[t],...S[t]].map(r=>r.id)));
 const bad=T.some(t=>o[t].some(r=>typeof r.id!='string'||(t=='books'&&(typeof r.title!='string'||(r.category_id&&!ids.has(r.category_id))))||(t=='reading_records'&&!ids.has(r.book_id))||(t=='notes'&&((r.category_id&&!ids.has(r.category_id))||(r.book_id&&!ids.has(r.book_id))))));
 if(bad)return toast('Backup is damaged. Nothing was imported.');
 const add=T.map(t=>o[t].filter(r=>!S[t].some(x=>x.id==r.id))),n=add.reduce((a,x)=>a+x.length,0),total=T.reduce((a,t)=>a+o[t].length,0);
 if(!n)return toast('Nothing new: everything in this backup is already here');
 if(!confirm(`This backup has ${total} items. ${n} are new and will be added. ${total-n} already exist and will be left untouched. Continue?`))return;
 for(const [i,t] of T.entries())for(const r of add[i]){const row={...r,user_id:user.id,_dirty:1};S[t].push(row);await putRow(t,row)}
 render();sync();toast(n+' items restored')}
$('#imp').addEventListener('change',e=>{const f=e.target.files[0];e.target.value='';$('#side').hidden=true;if(f)restore(f)});
async function signOut(){const pending=T.some(t=>S[t].some(r=>r._dirty));
 if(pending&&!confirm('Some changes are not synced yet. Signing out will lose them. Sign out anyway?'))return;
 await sb.auth.signOut();for(const t of [...T,'meta'])await tx(t,'readwrite',s=>s.clear());location.reload()}
$('#lf').addEventListener('submit',async e=>{e.preventDefault();$('#err').textContent='';
 const {data,error}=await sb.auth.signInWithPassword({email:$('#em').value.trim(),password:$('#pw').value});
 if(error){$('#err').textContent=navigator.onLine?'Wrong email or password.':'You are offline. Sign in needs internet the first time.';return}
 user=data.user;start()});
function start(){$('#login').hidden=true;$('#app').hidden=false;render();sync();addEventListener('online',sync);addEventListener('focus',sync);setInterval(sync,60000)}
(async()=>{await load();let s=null;try{s=(await sb.auth.getSession()).data.session}catch(e){}
 if(s){user=s.user;start()}else $('#login').hidden=false;
 if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js')})();
