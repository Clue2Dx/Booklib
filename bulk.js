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
