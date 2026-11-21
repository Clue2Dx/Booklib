const IL={3:'بالغ الأهمية',2:'مهم جدًا',1:'مهم'},ST={want:'أريد قراءته',plan:'في الخطة',ip:'قيد القراءة',read:'مقروء',stop:'متوقف'},MK=p=>'!'.repeat(p);
let U={tab:'lib',seg:'plan',sort:'cat',yr:new Date().getFullYear(),nf:0,nid:null,t2:0};
const stk=r=>r.status=='in_progress'?'ip':r.status=='read'?'read':r.status=='stopped'?'stop':r.year==null?'want':'plan';
const k2r=(k,y)=>k=='want'?{status:'not_started',year:null}:k=='plan'?{status:'not_started',year:y||U.yr}:{status:{ip:'in_progress',read:'read',stop:'stopped'}[k],year:y};
const mk=p=>p?`<span class="pr">${MK(p)}</span>`:'';
const cord=()=>live('categories').sort((a,b)=>(a.sort_order??1e9)-(b.sort_order??1e9)||a.name.localeCompare(b.name));
const dark=()=>document.documentElement.dataset.theme=='dark'||(!document.documentElement.dataset.theme&&matchMedia('(prefers-color-scheme:dark)').matches);
const ap=t=>{document.documentElement.dataset.theme=t;document.querySelector('meta[name=theme-color]').content=t=='dark'?'#121516':'#f6f5f1'};
try{const t=localStorage.getItem('theme');if(t)ap(t)}catch(e){}
const row=(b,r)=>`<button class="r" data-a="book" data-id="${b.id}"><span><b class="t" dir="auto">${esc(b.title)}${mk(b.priority)}</b>${b.author?`<span class="a" dir="auto">${esc(b.author)}</span>`:''}</span><span class="m">${r&&['read','stop'].includes(stk(r))?`<span class="p">${ST[stk(r)]}</span>`:''}${b.total_pages?`<span>${b.total_pages} ص</span>`:''}</span></button>`;
const grp=L=>{const m={};L.forEach(i=>(m[i.b.category_id||'']??=[]).push(i));return cord().map(c=>c.id).concat('').filter(k=>m[k]).map(k=>`<div class="cat">${esc(k?catName(k):'بدون فئة')}</div>${m[k].sort((a,b)=>a.b.title.localeCompare(b.b.title)).map(i=>row(i.b,i.r)).join('')}`).join('')||'<p class="empty">لا توجد كتب هنا بعد.</p>'};
const sg=(a,cur,act)=>a.map(x=>`<button data-a="${act}" data-v="${x[0]}" class="${cur==x[0]?'on':''}">${x[1]}</button>`).join('');
function lib(){const R=recs(),n=a=>new Set(a.map(i=>i.b.id)).size,rd=R.filter(i=>stk(i.r)=='read'),ip=R.filter(i=>stk(i.r)=='ip'),wt=R.filter(i=>stk(i.r)=='want');
 let h=`<h1>مكتبتي</h1><div class="st"><div><b>${n(rd)}</b><span>مقروءة</span></div><div><b>${n(ip)}</b><span>قيد القراءة</span></div><div><b>${n(wt)}</b><span>أريد قراءتها</span></div></div><div class="sec">أكمل القراءة</div>${ip.length?ip.map(i=>row(i.b,i.r)).join(''):'<p class="empty">لا توجد كتب قيد القراءة.</p>'}<div class="seg">${sg([['all','الكل'],['plan','خطة القراءة'],['want','أريد قراءتها']],U.seg,'seg')}</div>`;
 if(U.seg=='want')return h+grp(wt);
 if(U.seg=='plan')return h+`<div class="yr"><button data-a="yr" data-d="-1" aria-label="السنة السابقة">›</button><b>${U.yr}</b><button data-a="yr" data-d="1" aria-label="السنة التالية">‹</button></div>`+grp(R.filter(i=>i.r.year==U.yr));
 h+=`<div class="ch"><span>ترتيب حسب</span>${sg([['cat','الفئة'],['year','السنة'],['imp','الأهمية']],U.sort,'sort')}</div>`;
 const all=live('books').map(b=>({b,r:bestRec(b.id)}));
 if(U.sort=='cat')return h+grp(all);
 if(U.sort=='imp')return h+([3,2,1].map(p=>{const a=all.filter(i=>(i.b.priority||0)==p);return a.length?`<div class="cat">${IL[p]}</div>${a.map(i=>row(i.b,i.r)).join('')}`:''}).join('')||'<p class="empty">لم تصنّف أي كتاب بعد.</p>');
 const ys=[...new Set(R.map(i=>i.r.year))].sort((a,b)=>(b||0)-(a||0));
 return h+(ys.map((y,i)=>`<details ${i==0?'open':''}><summary>${y==null?'أريد قراءتها':y+' ('+n(R.filter(x=>x.r.year==y&&stk(x.r)=='read'))+')'}</summary>${grp(R.filter(x=>x.r.year==y))}</details>`).join('')||'<p class="empty">لا توجد سجلات قراءة.</p>')}
const nrow=n=>{const bk=n.book_id?bookById(n.book_id)?.title:n.book_text,meta=[new Date(n.created_at).toLocaleDateString('en-GB'),n.category_id&&catName(n.category_id),bk&&bk+(n.page?' ص '+n.page:'')].filter(Boolean).join(' / ');
 return `<button class="r" data-a="note" data-id="${n.id}"><span><b class="t" dir="auto">${esc(n.title||'بدون عنوان')}${mk(n.priority)}</b><span class="sn" dir="auto">${esc(n.content.split('\n').find(l=>l.trim())||'')}</span><span class="a" dir="auto">${esc(meta)}</span></span></button>`};
function nts(){const N=live('notes').filter(n=>!U.nf||n.priority==U.nf).sort((a,b)=>b.created_at.localeCompare(a.created_at));
 return `<h1>الملاحظات</h1><div class="ch">${sg([[0,'الكل'],[3,IL[3]],[2,IL[2]],[1,IL[1]]],U.nf,'nf')}</div>`+(N.map(nrow).join('')||'<p class="empty">لا توجد ملاحظات بعد.</p>')}
function more(){return `<h1>المزيد</h1><button class="r" data-a="theme"><span><b class="t">المظهر</b></span><span class="m">${dark()?'داكن':'فاتح'}</span></button><a class="r" href="../"><span><b class="t">فتح النسخة الحالية</b><span class="a">للنسخ الاحتياطي وإدارة الفئات وإضافة عدة كتب</span></span></a><button class="r" data-a="signout"><span><b class="t">تسجيل الخروج</b></span></button><p class="empty">${esc($('#stat').textContent)}</p>`}
function render(){if(!user)return;$('#app').innerHTML=({lib,notes:nts,more})[U.tab]();
 $('#tb').innerHTML=[['lib','المكتبة','M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 19V5'],['notes','الملاحظات','M6 3h9l4 4v14H6zM9 12h7M9 16h7'],['more','المزيد','M6 12h.01M12 12h.01M18 12h.01']].map(t=>`<button data-a="tab" data-v="${t[0]}" class="${U.tab==t[0]?'on':''}"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${t[2]}"/></svg><span>${t[1]}</span></button>`).join('');$('#fab').hidden=U.tab=='more'}
const recsH=id=>live('reading_records').filter(r=>r.book_id==id).sort((a,b)=>(b.year||0)-(a.year||0)).map(r=>`<div class="rr"><input dir="ltr" inputmode="numeric" data-rec="${r.id}" data-f="year" placeholder="بدون سنة" value="${r.year??''}"><select data-rec="${r.id}" data-f="st">${Object.entries(ST).map(([k,v])=>`<option value="${k}" ${k==stk(r)?'selected':''}>${v}</option>`).join('')}</select><button class="x" data-a="rdel" data-id="${r.id}" aria-label="حذف">✕</button></div>`).join('')||'<p class="a">لا يوجد سجل قراءة.</p>';
function bForm(id){const b=id&&bookById(id);
 sheet(`<h2>${b?'تعديل الكتاب':'كتاب جديد'}</h2><label>العنوان<input id="f_t" dir="auto" value="${esc(b?.title)}"></label><label>المؤلف (اختياري)<input id="f_a" dir="auto" value="${esc(b?.author)}"></label><label>الفئة<select id="f_c" data-cat>${catOpts(b?.category_id)}</select></label><label>عدد الصفحات (اختياري)<input id="f_p" dir="ltr" inputmode="numeric" value="${b?.total_pages||''}"></label><div class="sec">الأهمية</div><div class="ch" id="f_pr">${[0,3,2,1].map(p=>`<button data-a="bpr" data-v="${p}" class="${(b?.priority||0)==p?'on':''}">${p?IL[p]:'بدون'}</button>`).join('')}</div>`+
 (b?`<div class="sec">سجل القراءة</div><div id="recs">${recsH(id)}</div><button class="ghost" data-a="radd" data-id="${id}">+ سنة قراءة</button><p class="a">${live('notes').filter(n=>n.book_id==id).length} ملاحظة مرتبطة</p>`
 :`<label>الحالة<select id="f_s">${Object.entries(ST).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select></label><label>سنة القراءة<input id="f_y" dir="ltr" inputmode="numeric" value="${U.yr}"></label>`)+`<div class="bar">${b?`<button class="danger" data-a="bdel" data-id="${id}">حذف</button>`:''}<button data-a="close">إلغاء</button><button class="pri" data-a="bsave" data-id="${id||''}">حفظ</button></div>`)}
function nOpen(id){U.nid=id||null;const n=id&&S.notes.find(x=>x.id==id);
 $('#npage').innerHTML=`<div class="nb"><button data-a="nback" aria-label="رجوع">›</button><button data-a="nmenu" aria-label="إعدادات الملاحظة">⋯</button></div><div class="nw"><input id="nt" dir="rtl" placeholder="العنوان" value="${esc(n?.title)}"><div id="nm" dir="auto"></div><textarea id="nc" dir="rtl" placeholder="اكتب هنا…">${esc(n?.content)}</textarea></div>`;
 $('#npage').hidden=false;nmeta();if(!n)$('#nc').focus()}
function nmeta(){const n=U.nid&&S.notes.find(x=>x.id==U.nid);if(!n||!$('#nm'))return;const bk=n.book_id?bookById(n.book_id)?.title:n.book_text;$('#nm').textContent=[n.priority&&IL[n.priority],n.category_id&&catName(n.category_id),bk&&bk+(n.page?' ص '+n.page:'')].filter(Boolean).join(' / ')}
function nSave(x){clearTimeout(U.t2);if($('#npage').hidden)return;const t=$('#nt').value.trim(),c=$('#nc').value;let n=U.nid&&S.notes.find(y=>y.id==U.nid);
 if(!n){if(!t&&!c.trim()&&!x)return;n={id:uid(),user_id:user.id,created_at:now(),content:''};U.nid=n.id}
 if(n.title==(t||null)&&n.content==c&&!x)return;save('notes',{...n,title:t||null,content:c,...x});nmeta()}
function nClose(){$('#npage').hidden=true;$('#npage').innerHTML='';U.nid=null}
function nMenu(){nSave();const n=(U.nid&&S.notes.find(x=>x.id==U.nid))||{};
 sheet(`<h2>إعدادات الملاحظة</h2><div class="sec">الأهمية</div><div class="ch">${[3,2,1].map(p=>`<button data-a="nip" data-v="${p}" class="${n.priority==p?'on':''}">${MK(p)} ${IL[p]}</button>`).join('')}</div><label>الفئة<select id="n_cat" data-cat>${catOpts(n.category_id)}</select></label><label>مأخوذة من كتاب<select id="n_b"><option value="">بدون كتاب</option>${live('books').sort((a,b)=>a.title.localeCompare(b.title)).map(b=>`<option value="${b.id}" ${b.id==n.book_id?'selected':''}>${esc(b.title)}</option>`).join('')}</select><input id="n_bt" dir="auto" placeholder="أو اكتب اسم الكتاب" value="${esc(n.book_text)}"></label><label>الصفحة (اختياري)<input id="n_pg" dir="ltr" inputmode="numeric" value="${esc(n.page)}"></label><div class="bar">${n.id?'<button class="danger" data-a="ndel">حذف</button>':''}<button class="pri" data-a="nok">تم</button></div>`)}
document.addEventListener('click',e=>{const el=e.target.closest('[data-a],[data-act]');if(!el)return;const a=el.dataset.a||(el.dataset.act=='close'?'close':''),id=el.dataset.id,v=el.dataset.v;
 if(a=='tab'){U.tab=v;render()}else if(a=='seg'){U.seg=v;render()}else if(a=='sort'){U.sort=v;render()}else if(a=='nf'){U.nf=+v;render()}
 else if(a=='yr'){U.yr+=+el.dataset.d;render()}
 else if(a=='add')U.tab=='notes'?nOpen():bForm();
 else if(a=='book')bForm(id);else if(a=='note')nOpen(id);else if(a=='close')closeSheet();
 else if(a=='bpr'){document.querySelectorAll('#f_pr button').forEach(b=>b.classList.toggle('on',b==el))}
 else if(a=='bsave'){const t=$('#f_t').value.trim();if(!t)return toast('العنوان مطلوب');
  const base=id?bookById(id):{id:uid(),user_id:user.id,created_at:now()},pr=+(($('#f_pr .on')||{}).dataset||{}).v||0;
  save('books',{...base,title:t,author:$('#f_a').value.trim()||null,category_id:$('#f_c').value||null,total_pages:parseInt($('#f_p').value)||null,priority:pr});
  if(!id){const m=k2r($('#f_s').value,parseInt($('#f_y').value)||null);save('reading_records',{id:uid(),user_id:user.id,book_id:base.id,year:m.year,status:m.status,created_at:now()})}closeSheet()}
 else if(a=='bdel'){const n=live('notes').filter(x=>x.book_id==id).length;if(!confirm(n?`لهذا الكتاب ${n} ملاحظة مرتبطة، وستبقى الملاحظات. حذف الكتاب؟`:'حذف هذا الكتاب؟'))return;
  live('reading_records').filter(r=>r.book_id==id).forEach(r=>save('reading_records',{...r,deleted_at:now()}));save('books',{...bookById(id),deleted_at:now()});closeSheet()}
 else if(a=='radd'){const y=new Date().getFullYear();if(live('reading_records').some(r=>r.book_id==id&&r.year==y))return toast('للكتاب سجل في '+y+'، غيّر سنته أولًا');
  save('reading_records',{id:uid(),user_id:user.id,book_id:id,year:y,status:'not_started',created_at:now()});$('#recs').innerHTML=recsH(id)}
 else if(a=='rdel'){const r=S.reading_records.find(x=>x.id==id);save('reading_records',{...r,deleted_at:now()});$('#recs').innerHTML=recsH(r.book_id)}
 else if(a=='nback'){nSave();nClose()}else if(a=='nmenu')nMenu();
 else if(a=='nip'){const n=U.nid&&S.notes.find(x=>x.id==U.nid),p=+v;nSave({priority:n&&n.priority==p?0:p});nMenu()}
 else if(a=='nok'){const bk=$('#n_b').value||null;closeSheet();nSave({category_id:$('#n_cat').value||null,book_id:bk,book_text:bk?null:$('#n_bt').value.trim()||null,page:$('#n_pg').value.trim()||null})}
 else if(a=='ndel'){if(!confirm('حذف هذه الملاحظة؟'))return;clearTimeout(U.t2);const n=S.notes.find(x=>x.id==U.nid);if(n)save('notes',{...n,deleted_at:now()});closeSheet();nClose()}
 else if(a=='theme'){const t=dark()?'light':'dark';try{localStorage.setItem('theme',t)}catch(e){}ap(t);render()}
 else if(a=='signout')signOut()});
document.addEventListener('change',e=>{const s=e.target;
 if(s.dataset.cat!==undefined&&s.value=='__new'){const n=(prompt('اسم الفئة الجديدة')||'').trim();if(!n){s.value='';return}
  let c=live('categories').find(c=>c.name.toLowerCase()==n.toLowerCase());if(!c){c={id:uid(),user_id:user.id,name:n,created_at:now()};save('categories',c)}s.innerHTML=catOpts(c.id)}
 else if(s.dataset.rec){const r=S.reading_records.find(x=>x.id==s.dataset.rec),n=s.dataset.f=='year'?{year:parseInt(s.value)||null}:k2r(s.value,r.year),y2=n.year===undefined?r.year:n.year;
  if(live('reading_records').some(x=>x.id!=r.id&&x.book_id==r.book_id&&x.year==y2)){toast('للكتاب سجل بهذه السنة');$('#recs').innerHTML=recsH(r.book_id);return}
  save('reading_records',{...r,...n});$('#recs').innerHTML=recsH(r.book_id)}});
document.addEventListener('input',e=>{const t=e.target;if(t.id=='nt'||t.id=='nc'){clearTimeout(U.t2);U.t2=setTimeout(()=>nSave(),600)}
 if(t.matches('#f_p,#f_y,#n_pg,[data-f=year]')){const v=t.value.replace(/[٠-٩]/g,d=>d.charCodeAt(0)-1632).replace(/[۰-۹]/g,d=>d.charCodeAt(0)-1776).replace(/\D/g,'');if(v!=t.value)t.value=v}});
addEventListener('pagehide',()=>nSave());document.addEventListener('visibilitychange',()=>{if(document.hidden)nSave()});
async function signOut(){if(T.some(t=>S[t].some(r=>r._dirty))&&!confirm('بعض التغييرات لم تتزامن بعد، وستضيع إن خرجت. تسجيل الخروج؟'))return;
 await sb.auth.signOut();for(const t of [...T,'meta'])await tx(t,'readwrite',s=>s.clear());location.reload()}
$('#lf').addEventListener('submit',async e=>{e.preventDefault();$('#err').textContent='';
 const {data,error}=await sb.auth.signInWithPassword({email:$('#em').value.trim(),password:$('#pw').value});
 if(error){$('#err').textContent=navigator.onLine?'البريد أو كلمة المرور غير صحيحة.':'لا يوجد اتصال، والدخول الأول يحتاج إنترنت.';return}
 user=data.user;start()});
function start(){$('#login').hidden=true;$('#app').hidden=false;$('#tb').hidden=false;render();sync();addEventListener('online',sync);addEventListener('focus',sync);setInterval(sync,60000)}
(async()=>{await load();let s=null;try{s=(await sb.auth.getSession()).data.session}catch(e){}
 if(s){user=s.user;start()}else $('#login').hidden=false})();
