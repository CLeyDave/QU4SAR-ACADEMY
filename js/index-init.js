


// RENDER ALL
function safeRender(fn,name){try{fn()}catch(e){console.log('Render error ['+name+']:',e)}}
function renderAll(){
  safeRender(renderHero,'hero');
  safeRender(renderFooter,'footer');
  safeRender(renderSchedule,'schedule');
  safeRender(renderAcademy,'academy');
  safeRender(renderTeam,'team');
  safeRender(renderScrims,'scrims');
  safeRender(renderStats,'stats');
  safeRender(renderNews,'news');
  safeRender(renderMembers,'members');
  safeRender(renderDashboard,'dashboard');
  safeRender(renderAnnouncements,'announcements');
  safeRender(renderSubstitutions,'substitutions');
  if(typeof lucide!=='undefined')lucide.createIcons();
  // animate cards
  setTimeout(function(){
    document.querySelectorAll('.scrim-list,.team-grid,.member-grid,.news-grid,.stats-grid,.cards-grid,.schedule-grid,.group-cards').forEach(animateGrid);
  },50);
}

function reRenderTable(table){
  if(table==='content'||table==='home'){renderHero();renderFooter();if(typeof lucide!=='undefined')lucide.createIcons();return}
  if(table==='schedule')renderSchedule();
  else if(table==='team')renderTeam();
  else if(table==='scrims')renderScrims();
  else if(table==='members')renderMembers();
  else if(table==='news')renderNews();
   else if(table==='academy'){renderAcademy();var d=document.getElementById('section-dashboard');if(d&&d.style.display!=='none')renderDashContent();}
  else if(table==='announcements')renderAnnouncements();
  else if(table==='substitutions')renderSubstitutions();
  else renderDashboard();
  if(typeof lucide!=='undefined')lucide.createIcons();
  document.querySelectorAll('.scrim-list,.team-grid,.member-grid,.news-grid,.stats-grid,.cards-grid,.schedule-grid,.group-cards').forEach(animateGrid);
}

// CONNECT TO SUPABASE DB + REALTIME
async function initDB(){
  try{
    if(!db)db=supabase.createClient(SB,ANON);
    // Test connection
    var {error}=await db.from('schedule').select('id',{count:'exact',head:true});
    if(error)throw error;
    
    // Fetch all data
    var [sch,te,sc,mem,st,ne,ac,co,con,sec,ann,cur,tas,sub,ev,cn,mat,tc,att,ach,ma,rh,gr,gco,apl]=await Promise.all([
      db.from('schedule').select('*'),
      db.from('team').select('*'),
      db.from('scrims').select('*').order('date',{ascending:false}),
      db.from('members').select('*'),
      db.from('stats').select('*'),
      db.from('news').select('*').eq('published',true).order('date',{ascending:false}),
      db.from('academy').select('*'),
      db.from('coaches').select('*'),
      db.from('content').select('*'),
      db.from('sections').select('*'),
      db.from('announcements').select('*'),
      db.from('curriculum').select('*'),
      db.from('tasks').select('*'),
      db.from('substitutions').select('*'),
      db.from('evaluations').select('*'),
      db.from('coach_notes').select('*'),
      db.from('materials').select('*'),
      db.from('task_completions').select('*'),
      db.from('attendance').select('*'),
      db.from('achievements').select('*'),
      db.from('member_achievements').select('*'),
      db.from('rank_history').select('*'),
      db.from('groups').select('*'),
      db.from('group_coaches').select('*'),
      db.from('applications').select('*'),
    ]);
    // Fetch quizzes/quiz_responses separately (may not exist in Supabase)
    var qz={data:[]};try{var r=await db.from('quizzes').select('*');if(r)qz=r}catch(e){}
    var qr={data:[]};try{var r=await db.from('quiz_responses').select('*');if(r)qr=r}catch(e){}
    if(sch.data&&sch.data.length)DATA.schedule=sch.data.map(function(x){var st=String(x.start_time||x.start||'').slice(0,5),et=String(x.end_time||x.end||'').slice(0,5);return{id:x.id,title:x.title,day:x.day,start:st,end:et,type:x.type,coach:x.coach||'',group_id:x.group_id||''}});
    if(te.data&&te.data.length)DATA.team=te.data;
    if(sc.data&&sc.data.length)DATA.scrims=sc.data.map(function(x){return{id:x.id,opponent:x.opponent,opponent_logo:x.opponent_logo||'',our:x.our_score,opponent_score:x.opponent_score,result:x.result,date:x.date,coach:x.coach||'',group_id:x.group_id||''}});
    if(mem.data&&mem.data.length)DATA.members=mem.data;
    if(st.data&&st.data.length)DATA.stats=st.data;
    if(ne.data&&ne.data.length)DATA.news=ne.data;
    if(co.data&&co.data.length)DATA.coaches=co.data;
    if(ac.data&&ac.data.length)DATA.academy=ac.data;
    if(con.data){var o={};con.data.forEach(function(c){o[c.key]=c.value});DATA.content={home:o}}
    if(sec.data){var v={};sec.data.forEach(function(s){v[s.id]=s.visible});localStorage.setItem('qsr_sections',JSON.stringify(v))}
    if(ann.data&&ann.data.length)DATA.announcements=ann.data;
    if(cur.data&&cur.data.length)DATA.curriculum=cur.data;
    if(tas.data&&tas.data.length)DATA.tasks=tas.data;
    if(sub.data&&sub.data.length)DATA.substitutions=sub.data;
    if(ev.data&&ev.data.length)DATA.evaluations=ev.data;
    if(cn.data&&cn.data.length)DATA.coach_notes=cn.data;
    if(mat.data&&mat.data.length)DATA.materials=mat.data;
    if(tc.data&&tc.data.length)DATA.task_completions=tc.data;
    if(att.data&&att.data.length)DATA.attendance=att.data;
    if(ach.data&&ach.data.length)DATA.achievements=ach.data;
    if(ma.data&&ma.data.length)DATA.member_achievements=ma.data;
    if(qz.data&&qz.data.length)DATA.quizzes=qz.data;
    if(qr.data&&qr.data.length)DATA.quiz_responses=qr.data;
    if(rh&&rh.data&&rh.data.length)DATA.rank_history=rh.data;
    if(gr&&gr.data&&gr.data.length)DATA.groups=gr.data;
    if(gco&&gco.data&&gco.data.length)DATA.group_coaches=gco.data;
    if(apl&&apl.data&&apl.data.length)DATA.applications=apl.data;
    
    // Migrate old schedule day values (0=Sun→0=Mon)
    if((!sch.data||!sch.data.length)&&DATA.schedule.length&&!localStorage.getItem('qsr_sched_migrated')){
      DATA.schedule=DATA.schedule.map(function(s){s.day=(s.day+6)%7;return s});
      localStorage.setItem('qsr_sched_migrated','1');
    }
    // Auto-assign group from coach for schedule items missing group
    (DATA.schedule||[]).forEach(function(s){
      if(s.coach&&!s.group_id){
        var c=(DATA.coaches||[]).find(function(c){return c.name===s.coach});
        if(c){
          var gs=(DATA.group_coaches||[]).filter(function(g){return g.coach_id===c.id});
          if(gs.length===1)s.group_id=gs[0].group_id;
        }
      }
    });
    DATA.schedule.forEach(function(s){if(!s.week_start)s.week_start=getCurrentWeekStart()});
    
    // Sync pending offline applications
    try{
      var pending;try{pending=JSON.parse(localStorage.getItem('qsr_pending_apps')||'[]')}catch(e){pending=[]}
      if(pending.length){pending.forEach(function(app){db.from('applications').insert(app).then(function(){}).catch(function(){})});localStorage.removeItem('qsr_pending_apps')}
    }catch(e){}
    saveLocal(DATA);
    renderAll();
    applyVisibility();
    document.getElementById('dbStatus').textContent='⟐ conectado';document.getElementById('dbStatus').className='online';
    _dbFailed=false;
    
    // Subscribe to Realtime
    rtChannel=db.channel('public-changes')
      .on('postgres_changes',{event:'*',schema:'public'},async function(payload){
        var table=payload.table;
        if(table==='content'||table==='sections'){
          var{data}=await db.from(table).select('*');
          if(table==='content'&&data){var o={};data.forEach(function(c){o[c.key]=c.value});DATA.content={home:o};renderAll()}
          if(table==='sections'&&data){var v={};data.forEach(function(s){v[s.id]=s.visible});localStorage.setItem('qsr_sections',JSON.stringify(v));applyVisibility()}
        }else if(['schedule','team','scrims','members','stats','news','academy','announcements','curriculum','tasks','substitutions','coaches','evaluations','coach_notes','materials','task_completions','attendance','achievements','member_achievements','quizzes','quiz_responses','rank_history','groups','group_coaches','applications'].includes(table)){
          var{data}=await db.from(table).select('*');
          if(data!=null){
            if(table==='schedule')DATA.schedule=data.map(function(x){var st=String(x.start_time||x.start||'').slice(0,5),et=String(x.end_time||x.end||'').slice(0,5);return{id:x.id,title:x.title,day:x.day,start:st,end:et,type:x.type,coach:x.coach||'',group_id:x.group_id||''}});
            else if(table==='scrims')DATA.scrims=data.map(function(x){return{id:x.id,opponent:x.opponent,opponent_logo:x.opponent_logo||'',our:x.our_score,opponent_score:x.opponent_score,result:x.result,date:x.date,coach:x.coach||'',group_id:x.group_id||''}});
            else if(table==='news')DATA.news=data.filter(function(n){return n.published});
            else DATA[table]=data||[];
          }
          saveLocal(DATA);
          reRenderTable(table);
        }
      })
      .subscribe();
  }catch(e){
    console.log('DB unavailable, using localStorage:',e);
    document.getElementById('dbStatus').textContent='⋆ sin conexión';document.getElementById('dbStatus').className='offline';
    renderAll();
    _dbFailed=true;
  }
  // Reintentar conexión cada 30s si falló
  if(_dbFailed)setTimeout(initDB,30000);
}



// ========== REGISTER FORM ==========
// Toggle role checkbox on label click
document.addEventListener('click',function(e){
  var lbl=e.target.closest('.role-opt');
  if(!lbl)return;
  var cb=lbl.querySelector('input[type=checkbox]');
  if(!cb)return;
  cb.checked=!cb.checked;
  lbl.classList.toggle('checked',cb.checked);
});
// dashTaskName removed — renderDashTasks uses getLogin() directly

function submitApp(){
  var btn=document.getElementById('regBtn');
  var msg=document.getElementById('regMsg');
  var name=document.getElementById('reg_name').value.trim();
  if(!name){msg.textContent='El nombre es obligatorio';return}
  var valorant=document.getElementById('reg_valorant').value.trim();
  if(valorant){
    if((DATA.members||[]).find(function(m){return m.name.toLowerCase()===valorant.toLowerCase()})){
      msg.textContent='Ya eres miembro del club. Inicia sesión en el menú.';msg.style.color='#8b5cf6';return
    }
    if((DATA.applications||[]).find(function(a){return a.status==='pending'&&(a.valorant||'').toLowerCase()===valorant.toLowerCase()})){
      msg.textContent='Ya tienes una solicitud pendiente. Espera respuesta.';msg.style.color='#8b5cf6';return
    }
  }
  btn.disabled=true;btn.innerHTML='Enviando...';
  
  var roles=[];
  document.querySelectorAll('#reg_roles input:checked').forEach(function(cb){roles.push(cb.value)});
  
  var app={
    name:name,
    age:document.getElementById('reg_age').value,
    discord:document.getElementById('reg_discord').value.trim(),
    valorant:document.getElementById('reg_valorant').value.trim(),
    rank:document.getElementById('reg_rank').value,
    main_role:document.getElementById('reg_role').value,
    server:document.getElementById('reg_server').value,
    availability:document.getElementById('reg_avail').value,
    selected_roles:roles,
    objectives:document.getElementById('reg_objectives').value.trim(),
    reason:document.getElementById('reg_reason').value.trim(),
  };
  
  if(!db||!db.from){
    var pending;try{pending=JSON.parse(localStorage.getItem('qsr_pending_apps')||'[]')}catch(e){pending=[]}
    pending.push({...app,id:Date.now().toString(36),status:'pending'});
    localStorage.setItem('qsr_pending_apps',JSON.stringify(pending));
    msg.textContent='✓ Solicitud guardada localmente';
    msg.style.color='#8b5cf6';
    resetForm(btn);
    return;
  }
  
  db.from('applications').insert([{...app,status:'pending'}]).then(function(res){
    if(res.error)throw res.error;
    msg.textContent='✓ Solicitud enviada con éxito. Te contactaremos pronto.';
    msg.style.color='#8b5cf6';
    resetForm(btn);
  }).catch(function(err){
    msg.textContent='Error al enviar: '+err.message;
    msg.style.color='#8b5cf6';
    btn.disabled=false;btn.innerHTML=ic('send',16)+' Enviar Solicitud';
    if(typeof lucide!=='undefined')lucide.createIcons();
    setTimeout(function(){msg.textContent=''},5000);
  });
}
function resetForm(btn){
  document.getElementById('registerForm').querySelectorAll('input,select,textarea').forEach(function(el){el.value=''});
  document.querySelectorAll('#reg_roles input').forEach(function(cb){cb.checked=false;cb.closest('.role-opt').classList.remove('checked')});
  btn.disabled=false;btn.innerHTML=ic('send',16)+' Enviar Solicitud';
  if(typeof lucide!=='undefined')lucide.createIcons();
  setTimeout(function(){document.getElementById('regMsg').textContent=''},4000);
}

// ========== SCROLL SPY ==========
function initScrollSpy(){
  var ticking=false;
  function update(){
    var current='home';
    document.querySelectorAll('section[id]').forEach(function(s){
      var rect=s.getBoundingClientRect();
      if(rect.top<=150&&rect.bottom>0){
        current=s.id.replace('section-','')||'home';
      }
    });
    document.querySelectorAll('.nav-links a[data-section]').forEach(function(a){
      a.classList.toggle('active',(a.getAttribute('data-section')||'home')===current);
    });
    ticking=false;
  }
  window.addEventListener('scroll',function(){
    if(!ticking){requestAnimationFrame(update);ticking=true}
  },{passive:true});
  setTimeout(update,100);
}

// ========== INIT ==========

(async function(){
  await initDB();
  if(isLoggedIn()){
    updateLoginBadge();
    renderAll();
  }else{
    showLoginOverlay();
  }
  applyVisibility();
  initParticles();
  initRipple();
  initScrollReveal();
  initNavbarScroll();
  initScrollSpy();
})();

function showLoginOverlay(){
  var ov=document.getElementById('loginOverlay');
  if(ov){ov.classList.remove('hidden');ov.style.display='';document.body.style.overflow='hidden';setTimeout(function(){var inp=document.getElementById('loginInput');if(inp)inp.focus()},100)}
}

