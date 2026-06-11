// ========== DATA ==========
const STORAGE_KEY='quasar_data';
function defaultData(){return{
  schedule:[],team:[],scrims:[],members:[],coaches:[],academy:[],news:[],stats:[],announcements:[],curriculum:[],tasks:[],substitutions:[],rank_history:[],member_achievements:[],achievements:[],evaluations:[],coach_notes:[],materials:[],task_completions:[],attendance:[],quizzes:[],quiz_responses:[],groups:[],group_coaches:[],applications:[],content:{home:{}}
}}
function getData(){try{var r=localStorage.getItem(STORAGE_KEY);if(r)return JSON.parse(r)}catch(e){}var d=defaultData();try{localStorage.setItem(STORAGE_KEY,JSON.stringify(d))}catch(e){};return d}
function saveLocal(d){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(d))}catch(e){}}
var DATA=getData();if(!DATA.content)DATA.content={home:{}};if(!DATA.content.home)DATA.content.home={};if(!DATA.coaches)DATA.coaches=[];if(!DATA.task_completions)DATA.task_completions=[];

// ========== RENDER HERO ==========
function renderHero(){
  var c=DATA.content.home||{};
  var h=document.getElementById('heroContent');
  h.innerHTML=
    '<img src="'+esc(c.logo_url||'QU4SAR.png')+'" alt="QU4SAR" style="max-width:300px;max-height:300px;width:auto;height:auto;margin-bottom:36px;animation:float 8s ease-in-out infinite">'+
    '<h1><span class="gradient-text">'+esc(c.hero_title||'QU4SAR')+'</span></h1>'+
    '<p>'+esc(c.hero_subtitle||'OrganizaciÃ³n competitiva de Valorant Premier')+'</p>'+
    (c.hero_desc?'<p style="color:#888;font-size:15px;max-width:600px;margin:0 auto">'+esc(c.hero_desc)+'</p>':'')+
    '<p class="tagline">'+esc(c.site_tagline||'Academia Â· Scrims Â· CreaciÃ³n de contenido Â· Esports de alto nivel')+'</p>';
}

// ========== RENDER FOOTER ==========
function renderFooter(){
  var c=DATA.content.home||{};
  var f=document.getElementById('footerSocial');
  if(!f)return;
  var links=[{k:'social_twitch',l:'Twitch',i:ic('twitch',16)},{k:'social_youtube',l:'YouTube',i:ic('youtube',16)},{k:'social_twitter',l:'Twitter',i:ic('twitter',16)},{k:'social_instagram',l:'Instagram',i:ic('instagram',16)}];
  f.innerHTML=links.filter(function(l){return c[l.k]}).map(function(l){return'<a href="'+esc(c[l.k])+'" target="_blank" title="'+l.l+'">'+l.i+'</a>'}).join('');
}

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
    
    // Migrate old schedule day values (0=Sunâ†’0=Mon)
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
    document.getElementById('dbStatus').textContent='âŸ conectado';document.getElementById('dbStatus').className='online';
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
    document.getElementById('dbStatus').textContent='â‹† sin conexiÃ³n';document.getElementById('dbStatus').className='offline';
    renderAll();
    _dbFailed=true;
  }
  // Reintentar conexiÃ³n cada 30s si fallÃ³
  if(_dbFailed)setTimeout(initDB,30000);
}

// ========== SECTION VISIBILITY ==========

// ========== SECTION VISIBILITY (controlled by admin) ==========
var ALL_SECTIONS=['schedule','dashboard','team','members','scrims','stats','academy','news','announcements','substitutions','register'];
function getVis(){try{var r=localStorage.getItem('qsr_sections');if(r)return JSON.parse(r)}catch(e){}var d={};ALL_SECTIONS.forEach(function(s){d[s]=true});return d}
function isVisible(id){var v=getVis();return v[id]!==false}
function applyVisibility(){
  var u=getLogin();
  var isGuest=!u||!u.id;
  var isMember=u&&u.id;
  var guestOK=['home','news','register'];
  ALL_SECTIONS.forEach(function(id){
    var el=document.getElementById('section-'+id);
    if(!el)return;
    if(isGuest&&guestOK.indexOf(id)<0){el.style.display='none';return}
    if(isMember&&id==='register'){el.style.display='none';return}
    el.style.display=isVisible(id)?'':'none';
  });
  document.querySelectorAll('.nav-links a[data-section]').forEach(function(a){
    var sec=a.getAttribute('data-section');
    if(isGuest&&guestOK.indexOf(sec)<0){a.style.display='none';return}
    if(isMember&&sec==='register'){a.style.display='none';return}
    if(sec)a.style.display=isVisible(sec)?'':'none';
  });
}

function initScrollReveal(){
  if('IntersectionObserver' in window){
    var obs=new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target)}
      });
    },{threshold:0.08});
    document.querySelectorAll('.section,.hero').forEach(function(el){el.classList.add('reveal');obs.observe(el)});
  }else{document.querySelectorAll('.section,.hero').forEach(function(el){el.classList.add('visible')})}
}
function initNavbarScroll(){
  var nav=document.getElementById('navbar');
  if(!nav)return;
  nav.classList.toggle('scrolled',window.scrollY>50);
  window.addEventListener('scroll',function(){nav.classList.toggle('scrolled',window.scrollY>50)});
}
function fmtName(n){if(!n)return'';var p=n.split('#');return esc(p[0])+(p[1]?'<span style="opacity:0.5;display:block">#'+esc(p[1])+'</span>':'')}

// ========== NAV ==========
function showSection(name){
  if(name!=='home' && !isVisible(name))return;
  if(!getLogin()&&['','home','news','register'].indexOf(name)<0){name='home'}
  var el=document.getElementById('section-'+name);
  if(el)el.scrollIntoView({behavior:'smooth',block:'start'});
  document.querySelectorAll('.nav-links a').forEach(a=>a.classList.remove('active'));
  document.querySelectorAll('.nav-links a[data-section]').forEach(function(a){
    if(a.getAttribute('data-section')===name||(name==='home'&&a.getAttribute('data-section')===''))a.classList.add('active')});
  document.getElementById('navLinks').classList.remove('open');
  if(name==='register'){document.getElementById('registerForm').scrollIntoView({behavior:'smooth',block:'start'});return}
  if(name!=='home')renderSection(name);
}
function toggleNav(){document.getElementById('navLinks').classList.toggle('open')}
function renderSection(n){try{switch(n){
  case'schedule':renderSchedule();break;
  case'academy':renderAcademy();break;
  case'team':renderTeam();break;
  case'scrims':renderScrims();break;
  case'stats':renderStats();break;
  case'news':renderNews();break;
  case'members':renderMembers();break;
  case'dashboard':renderDashboard();break;
  case'register':break;
  case'announcements':renderAnnouncements();break;
  case'substitutions':renderSubstitutions();break;
}renderHero();renderFooter()}catch(e){}if(typeof lucide!=='undefined')lucide.createIcons()}

// ========== LOGIN SYSTEM ==========
var LOGIN_KEY='quasar_login';
function getLogin(){try{var r=localStorage.getItem(LOGIN_KEY);if(r)return JSON.parse(r)}catch(e){}return null}
function setLogin(u){try{localStorage.setItem(LOGIN_KEY,JSON.stringify(u))}catch(e){}}
function clearLogin(){try{localStorage.removeItem(LOGIN_KEY)}catch(e){}}
function isLoggedIn(){return!!getLogin()}
function loginName(){var u=getLogin();return u?u.name:''}

function handleLogin(){
  var input=document.getElementById('loginInput');
  var msg=document.getElementById('loginMsg');
  var btn=document.getElementById('loginBtn');
  var name=input.value.trim();
  if(!name){msg.textContent='Ingresa tu nombre de VALORANT';msg.style.color='#8b5cf6';return}
  btn.disabled=true;btn.innerHTML='Verificando...';
  var member=(DATA.members||[]).find(function(m){return m.name.toLowerCase()===name.toLowerCase()});
  if(member){
    setLogin({name:member.name,id:member.id,role:member.role,rank:member.rank,group_id:member.group_id||'',coach:member.coach||''});
    msg.textContent='✓ Bienvenido, '+member.name;msg.style.color='#8b5cf6';
    setTimeout(function(){
      var ov=document.getElementById('loginOverlay');
      if(ov){ov.classList.add('hidden');ov.style.display=''}
      document.body.style.overflow='';
      updateLoginBadge();applyVisibility();
      btn.disabled=false;btn.innerHTML='Iniciar Sesión';
      renderSchedule();renderAcademy();renderScrims();renderStats();renderNews();renderAnnouncements();renderSubstitutions();renderDashboard();
    },600);
  }else{
    msg.textContent='✖ No encontramos ese usuario. ¿Estás registrado?';msg.style.color='#ff4444';
    btn.disabled=false;btn.innerHTML='Iniciar Sesión';
  }
}

function logout(){
  clearLogin();
  applyVisibility();
  document.getElementById('navLinks').classList.remove('open');
  try{
    var overlay=document.getElementById('loginOverlay');
    if(overlay){overlay.classList.remove('hidden');overlay.style.display='';document.body.style.overflow='hidden'}
    var input=document.getElementById('loginInput');
    if(input)input.value='';
    var msg=document.getElementById('loginMsg');
    if(msg)msg.textContent='';
    var badge=document.getElementById('loginBadge');
    if(badge)badge.style.display='none';
    var nl=document.getElementById('navLogout');
    if(nl)nl.style.display='none';
  }catch(e){console.log('Logout error:',e)}
  renderSchedule();renderAcademy();renderScrims();renderStats();renderNews();renderAnnouncements();renderSubstitutions();renderDashboard();
}

function updateLoginBadge(){
  var u=getLogin();
  var badge=document.getElementById('loginBadge');
  var nameEl=document.getElementById('loginName');
  var coachEl=document.getElementById('loginCoach');
  var nl=document.getElementById('navLogout');
  var isMember=u&&u.id;
  if(u&&badge&&nameEl){
    badge.style.display='flex';
    nameEl.textContent=u.name+(u.role?' · '+u.role:'');
    if(coachEl){
      if(u.coach){coachEl.textContent='★ Coach: '+u.coach;coachEl.style.display='inline'}else{coachEl.style.display='none'}
    }
    if(nl)nl.style.display='block';
  }else{
    if(badge)badge.style.display='none';
    if(nl)nl.style.display='none';
  }
  var guestSections=['','home','news','register'];
  document.querySelectorAll('.nav-links a[data-section]').forEach(function(a){
    var sec=a.getAttribute('data-section');
    if(isMember&&sec==='register'){a.style.display='none';return}
    a.style.display=(u&&!u.id&&guestSections.indexOf(sec)<0)?'none':'';
  });
}

function getUserGroup(u){
  if(!u)return'';
  var g=u.group_id||'';
  g=String(g).trim().toLowerCase();
  if(g)return g;
  if(u.rank)return getGroupFromRank(u.rank);
  return'';
}
function filterByGroup(items){
  var u=getLogin();
  var userGroup=getUserGroup(u);
  if(!userGroup)return items;
  return items.filter(function(item){
    var g=String(item.group_id||'').trim().toLowerCase();
    return g===''||g===userGroup;
  });
}

function filterByCoach(items){
  var u=getLogin();
  var coach=(u&&u.coach)||'';
  if(!coach)return items;
  return items.filter(function(item){
    var c=String(item.coach||'').trim();
    return c===''||c===coach;
  });
}

// ========== RENDER SCHEDULE BUBBLES ==========
function renderSchedule(){
  var items=DATA.schedule||[];
  items=filterByCoach(filterByGroup(items));
  var days=['Lunes','Martes','MiÃ©rcoles','Jueves','Viernes','SÃ¡bado','Domingo'];
  var container=document.getElementById('scheduleBubbles');
  if(!items.length){container.innerHTML='<div style="text-align:center;padding:40px;color:#555">'+ic('calendar',48)+'<br>No hay horarios disponibles</div>';return}

  var dotColors=['#8b5cf6','#f97316','#eab308','#8b5cf6','#3b82f6','#8b5cf6','#a78bfa'];
  var html='';
  for(var d=0;d<7;d++){
    var dayEvents=items.filter(function(e){return e.day===d});
    if(!dayEvents.length)continue;
    html+='<div class="has-glow schedule-day-group"><div class="schedule-day-header"><span class="dot" style="background:'+dotColors[d]+'"></span>'+days[d]+'</div><div class="schedule-bubble-row">'+
      dayEvents.map(function(e){return'<div class="schedule-event '+e.type+'"><span class="title">'+esc(e.title)+'</span><span class="time">'+toLocalTime(e.start,e.tz)+' - '+toLocalTime(e.end,e.tz)+'</span>'+(e.coach?'<span style="font-size:11px;opacity:0.6;margin-top:2px">'+ic('user',11)+' '+esc(e.coach)+'</span>':'')+'</div>'}).join('')+
    '</div></div>';
  }
  if(!html)html='<div style="text-align:center;padding:40px;color:#555">'+ic('calendar',48)+'<br>No hay horarios disponibles</div>';
  container.innerHTML=html;
  if(typeof lucide!=='undefined')lucide.createIcons();
}

// ========== RENDER ACADEMY ==========
function renderAcademy(){
  var g=document.getElementById('academyGrid');
  var items=DATA.academy||[];
  items=filterByCoach(filterByGroup(items));
  var dayOrder={Lunes:0,Martes:1,Miércoles:2,Jueves:3,Viernes:4,Sábado:5,Domingo:6};
  items.sort(function(a,b){return(dayOrder[a.day]||99)-(dayOrder[b.day]||99)});
  if(!items.length){g.innerHTML='<div style="text-align:center;padding:40px;color:#555">'+ic('book-open',48)+'<br>No hay clases disponibles para tu grupo</div>';return}
  g.innerHTML=items.map(function(a,i){return'<div class="glass-card academy-card" onclick="showAcademyDetail('+i+')" style="cursor:pointer">'+(a.image_url?'<img src="'+esc(a.image_url)+'" alt="" style="width:100%;height:140px;object-fit:cover;border-radius:12px 12px 0 0;cursor:pointer" onclick="event.stopPropagation();showImageOverlay(this.src,this.alt)">':'')+'<div class="day">'+esc(a.day)+'</div>'+(a.coach?'<div style="font-size:12px;color:#888;margin:2px 0 4px">'+ic('user',12)+' '+esc(a.coach)+'</div>':'')+(a.duration?'<div style="font-size:12px;color:#555;margin-bottom:4px">'+ic('clock',12)+' '+esc(a.duration)+'</div>':'')+'<h3>'+esc(a.topic)+'</h3><ul>'+(a.objectives||[]).map(function(o){return'<li>'+esc(o)+'</li>'}).join('')+'</ul></div>'}).join('');
}
function showAcademyDetail(i){
  var items=filterByCoach(filterByGroup(DATA.academy||[]));
  var a=items[i];
  if(!a)return;
  var meta=[];
  if(a.day)meta.push(ic('calendar',14)+' '+esc(a.day));
  if(a.duration)meta.push(ic('clock',14)+' '+esc(a.duration));
  if(a.coach)meta.push(ic('user',14)+' '+esc(a.coach));
  showDetail((a.image_url?'<img src="'+esc(a.image_url)+'" class="detail-img" style="cursor:pointer" onclick="event.stopPropagation();showImageOverlay(this.src,this.alt)">':'')+
    '<h2>'+esc(a.topic)+'</h2>'+
    '<div class="meta">'+meta.join('<span style="margin:0 4px;color:#444">|</span>')+'</div>'+
    ((a.prerequisites||[]).length?'<div class="body-text" style="margin-top:8px"><strong>Requisitos:</strong><ul>'+(a.prerequisites||[]).map(function(p){return'<li>'+esc(p)+'</li>'}).join('')+'</ul></div>':'')+
    '<div class="body-text"><strong>Objetivos:</strong><ul>'+(a.objectives||[]).map(function(o){return'<li>'+esc(o)+'</li>'}).join('')+'</ul></div>'+
    (a.attachment_url?'<a href="'+esc(a.attachment_url)+'" target="_blank" class="attach-link" onclick="event.stopPropagation()">'+ic('paperclip',16)+' '+esc(a.attachment_name||'Descargar archivo')+'</a>':''));
}
function renderTeam(){
  var c=document.getElementById('teamContainer');
  var team=DATA.team||[];
  var g={Titular:[],Suplente:[],Prueba:[]};
  team.forEach(function(m){if(g[m.status])g[m.status].push(m)});
  var sb={Titular:'badge-green',Suplente:'badge-yellow',Prueba:'badge-blue'};
  var roleIcons={Duelist:'sword',Initiator:'search',Controller:'shield',Sentinel:'castle',Flex:'refresh-cw'};
  var h='';
  Object.keys(g).forEach(function(s){
    if(!g[s].length)return;
    h+='<div class="team-group"><div class="team-group-title">'+(s==='Titular'?ic('star',20)+'<span style="margin-right:6px"></span>':s==='Suplente'?ic('clipboard-list',20)+'<span style="margin-right:6px"></span>':ic('search',20)+'<span style="margin-right:6px"></span>')+' '+s+' <span style="font-weight:400;font-size:13px;color:#666">('+g[s].length+')</span></div><div class="team-grid">';
    g[s].forEach(function(m){
      h+='<div class="glass-card member-card"><div class="member-icon">'+(roleIcons[m.role]?ic(roleIcons[m.role],28):ic('gamepad-2',28))+'</div>'+
        '<h3>'+fmtName(m.name)+'</h3>'+
        (m.role?'<div class="member-role">'+esc(m.role)+'</div>':'')+
        (m.rank?'<div class="member-rank">'+esc(m.rank)+'</div>':'')+
        '<span class="badge '+(sb[m.status]||'badge-gray')+'">'+m.status+'</span>'+
        (m.bio?'<div class="member-role" style="margin-top:8px;font-size:12px;color:#666">'+esc(m.bio)+'</div>':'')+
      '</div>';
    });
    h+='</div></div>';
  });
  if(!h)h='<div style="text-align:center;padding:40px;color:#555">'+ic('trophy',48)+'<br>No hay jugadores registrados</div>';
  c.innerHTML=h;
}

// ========== DASHBOARD ==========
var DASH_TAB='panel';
function switchDashTab(tab){
  DASH_TAB=tab;
  document.querySelectorAll('.dash-tab').forEach(function(b){b.classList.toggle('active',b.getAttribute('data-dtab')===tab)});
  renderDashContent();
}
function renderDashboard(){
  var u=getLogin();
  var container=document.getElementById('dashContent');
  if(!container)return;
  if(!u||!u.id){
    container.innerHTML='<div style="text-align:center;padding:60px 20px;color:#555">'+ic('log-in',48)+'<br><br><span style="font-size:18px;font-weight:600">Inicia sesiÃ³n para ver tu panel</span></div>';
    return;
  }
  renderDashContent();
}
function renderDashContent(){
  switch(DASH_TAB){
    case'panel':renderDashPanel();break;
    case'clases':renderDashClases();break;
    case'curriculum':renderDashCurriculum();break;
    case'materials':renderDashMaterials();break;
    case'tasks':renderDashTasks();break;
    case'evaluations':renderDashEvals();break;
    case'quizzes':renderDashQuizzes();break;
    case'coach_notes':renderDashCoachNotes();break;
  }
  if(typeof lucide!=='undefined')lucide.createIcons();
}
function renderDashPanel(){
  var u=getLogin();
  var name=u?u.name:'';
  var member=(DATA.members||[]).find(function(m){return m.name===name});
  var headerHTML='<div style="text-align:center;padding:16px 0 24px"><div style="font-size:24px;font-weight:700;font-family:var(--font-display)">'+ic('zap',20)+' Bienvenido, '+esc(name)+'</div>'+
    (member?'<div style="font-size:14px;color:#888;margin-top:6px">'+esc(member.role||'')+(member.rank?' Â· '+esc(member.rank):'')+(member.group_id?' Â· Grupo '+esc(String(member.group_id).toUpperCase()):'')+(member.coach?' Â· Coach: '+esc(member.coach):'')+'</div>':'')+'</div>';
  
  var allTasks=filterByCoach(filterByGroup(DATA.tasks||[]));
  var myCompletions=(DATA.task_completions||[]).filter(function(tc){return tc.member_name===name});
  var myAttendance=(DATA.attendance||[]).filter(function(a){return a.member_name===name});
  var attThisMonth=myAttendance.filter(function(a){var d=a.date||'';return d.startsWith(new Date().toISOString().slice(0,7))});
  var attRate=attThisMonth.length?Math.round(attThisMonth.filter(function(a){return a.status==='present'}).length/attThisMonth.length*100):0;
  var myEvals=filterByCoach(DATA.evaluations||[]).filter(function(e){return e.member_name===name});
  var avgScore=myEvals.length?Math.round(myEvals.reduce(function(s,e){return s+(e.aim||0)+(e.game_sense||0)+(e.communication||0)+(e.teamwork||0)},0)/(myEvals.length*4)*10)/10:0;
  var myAchs=(DATA.member_achievements||[]).filter(function(ma){return ma.member_name===name});
  var statsHTML=
    '<div class="glass-card dash-card"><div class="num gradient-text">'+myCompletions.length+'/'+allTasks.length+'</div><div class="lbl">Tareas Completadas</div></div>'+
    '<div class="glass-card dash-card"><div class="num gradient-text">'+(attRate?attRate+'%':'â€”')+'</div><div class="lbl">Asistencia este mes</div></div>'+
    '<div class="glass-card dash-card"><div class="num gradient-text">'+(avgScore||'â€”')+'</div><div class="lbl">Promedio Evaluaciones</div></div>'+
    '<div class="glass-card dash-card"><div class="num gradient-text">'+myAchs.length+'</div><div class="lbl">Logros Obtenidos</div></div>';
  
  // Pending tasks
  var tasksHTML='<div class="dash-section"><h3>'+ic('check-square',18)+' Tareas Pendientes</h3>';
  if(allTasks.length){
    var pending=allTasks.map(function(t){
      var done=myCompletions.some(function(tc){return tc.task_id===t.id});
      return done?'':'<div class="glass-card dash-task" onclick="showTaskDetail(\''+t.id+'\')"><div class="title"><strong>'+esc(t.title)+'</strong>'+(t.due_date?'<div class="due">Vence: '+esc(t.due_date)+'</div>':'')+'</div></div>';
    }).filter(function(h){return h}).join('');
    tasksHTML+=pending||'<div style="padding:20px;text-align:center;color:#888">'+ic('check-circle',24)+'<br>Â¡Todas las tareas completadas!</div>';
  }else tasksHTML+='<div style="padding:20px;text-align:center;color:#888">'+ic('inbox',24)+'<br>No hay tareas asignadas</div>';
  tasksHTML+='</div>';
  
  // Evaluations
  var evalsHTML='<div class="dash-section"><h3 style="cursor:pointer" onclick="showEvalsOverlay()">'+ic('bar-chart-3',18)+' Ãšltimas Evaluaciones '+ic('chevron-right',14)+'</h3>';
  if(myEvals.length){
    evalsHTML+='<div style="overflow-x:auto"><table class="dash-eval-table"><thead><tr><th>Fecha</th><th>AIM</th><th>Game Sense</th><th>Comms</th><th>Teamwork</th></tr></thead><tbody>'+
      myEvals.sort(function(a,b){return a.date<b.date?1:-1}).slice(0,5).map(function(e,i){
        return '<tr style="cursor:pointer" onclick="showEvalDetail('+i+')"><td>'+(e.date?new Date(e.date).toLocaleDateString('es-ES'):'â€”')+'</td><td>'+e.aim+'</td><td>'+e.game_sense+'</td><td>'+e.communication+'</td><td>'+e.teamwork+'</td></tr>';
      }).join('')+'</tbody></table></div>';
  }else evalsHTML+='<div style="padding:20px;text-align:center;color:#888">'+ic('clipboard',24)+'<br>Sin evaluaciones aÃºn</div>';
  evalsHTML+='</div>';
  
  // Coach notes
  var notesHTML='<div class="dash-section"><h3 style="cursor:pointer" onclick="showNotesOverlay()">'+ic('message-square',18)+' Notas del Coach '+ic('chevron-right',14)+'</h3>';
  var myNotes=(DATA.coach_notes||[]).filter(function(n){return n.member_name===name});
  if(myNotes.length){
    notesHTML+=myNotes.sort(function(a,b){return a.created_at<b.created_at?1:-1}).slice(0,4).map(function(n){
      return '<div class="glass-card dash-note" style="cursor:pointer" onclick="showNotesOverlay()"><span class="date">'+(n.created_at?new Date(n.created_at).toLocaleDateString('es-ES'):'')+'</span><div class="cat">'+(n.category||'general')+'</div><div style="white-space:pre-wrap">'+esc(n.note||n.text||'')+'</div></div>';
    }).join('');
  }else notesHTML+='<div style="padding:20px;text-align:center;color:#888">'+ic('inbox',24)+'<br>Sin notas aÃºn</div>';
  notesHTML+='</div>';
  
  // Rank timeline
  var rankHTML='<div class="dash-section"><h3 style="cursor:pointer" onclick="showRankOverlay()">'+ic('trending-up',18)+' Progreso de Rango '+ic('chevron-right',14)+'</h3>';
  var rankHistory=(DATA.rank_history||[]).filter(function(r){return r.member_name===name});
  if(rankHistory.length){
    rankHTML+='<div class="dash-timeline" style="cursor:pointer" onclick="showRankOverlay()">'+rankHistory.sort(function(a,b){return a.date<b.date?1:-1}).slice(0,8).map(function(r,i){
      return '<div class="step">'+(i?'<span style="color:#555;margin:0 4px">â†’</span>':'')+'<span class="dot"></span><span>'+esc(r.rank)+'</span></div>';
    }).join('')+'</div>';
  }else rankHTML+='<div style="padding:20px;text-align:center;color:#888">'+ic('activity',24)+'<br>Sin historial de rango</div>';
  rankHTML+='</div>';
  
  // Achievements
  var achsHTML='<div class="dash-section"><h3 style="cursor:pointer" onclick="showAchsOverlay()">'+ic('award',18)+' Logros Obtenidos '+ic('chevron-right',14)+'</h3>';
  var earnedAchs=myAchs.map(function(ma){return(DATA.achievements||[]).find(function(a){return a.id===ma.achievement_id})}).filter(function(a){return a});
  if(earnedAchs.length){
    achsHTML+='<div style="display:flex;flex-wrap:wrap;gap:8px;cursor:pointer" onclick="showAchsOverlay()">'+earnedAchs.map(function(a){
      return '<div class="glass-card" style="padding:10px 14px;display:flex;align-items:center;gap:8px;font-size:13px" title="'+esc(a.description||'')+'">'+ic(a.icon||'trophy',20)+' '+esc(a.name)+'</div>';
    }).join('')+'</div>';
  }else achsHTML+='<div style="padding:20px;text-align:center;color:#888">'+ic('star',24)+'<br>AÃºn no tienes logros</div>';
  achsHTML+='</div>';
  
  document.getElementById('dashContent').innerHTML=headerHTML+'<div class="dash-cards" style="margin-bottom:28px">'+statsHTML+'</div>'+tasksHTML+evalsHTML+notesHTML+rankHTML+achsHTML;
}
function renderDashClases(){
  var u=getLogin();var items=filterByCoach(filterByGroup(DATA.academy||[]));
  var html='<div class="glass-card" style="padding:24px"><h3 style="margin:0 0 16px;font-size:18px">'+ic('graduation-cap',18)+' Clases de Academia</h3>';
  if(!items.length){html+='<div style="text-align:center;padding:24px;color:#555">'+ic('book',40)+'<br>No hay clases disponibles para tu grupo</div>';html+='</div>';document.getElementById('dashContent').innerHTML=html;return}
  html+=items.map(function(a){
    var imgs=a.image_url?'<img src="'+esc(a.image_url)+'" alt="" style="width:100%;max-height:160px;object-fit:cover;border-radius:8px;margin-bottom:10px;cursor:pointer" onclick="event.stopPropagation();showImageOverlay(this.src,this.alt)">':'';
    return '<div class="glass-card" style="padding:18px;margin-bottom:12px">'+imgs+
      '<div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:6px"><h4 style="margin:0;font-size:16px">'+esc(a.topic)+'</h4><span class="badge badge-purple">'+esc(a.day)+'</span></div>'+
      (a.coach?'<div style="color:#888;font-size:13px;margin-bottom:4px">'+ic('user',13)+' '+esc(a.coach)+'</div>':'')+
      (a.duration?'<div style="color:#555;font-size:12px;margin-bottom:4px">'+ic('clock',12)+' '+esc(a.duration)+'</div>':'')+
      ((a.objectives||[]).length?'<div style="margin-top:10px;display:grid;gap:4px">'+(Array.isArray(a.objectives)?a.objectives:[]).map(function(o){return'<div style="display:flex;align-items:center;gap:6px;font-size:13px;color:#ccc"><span style="color:var(--neon)">â–¸</span>'+esc(o)+'</div>'}).join('')+'</div>':'')+
    '</div>';
  }).join('');
  html+='</div>';document.getElementById('dashContent').innerHTML=html;
}
function renderDashEvals(){
  var u=getLogin();var name=u?u.name:'';if(!name)return;
  var items=filterByCoach(DATA.evaluations||[]).filter(function(e){return e.member_name===name}).sort(function(a,b){return a.date<b.date?1:-1});
  var html='<div class="glass-card" style="padding:24px"><h3 style="margin:0 0 16px;font-size:18px">'+ic('bar-chart-3',18)+' Mis Evaluaciones</h3>';
  if(!items.length){html+='<div style="text-align:center;padding:24px;color:#555">'+ic('clipboard',40)+'<br>Sin evaluaciones aÃºn</div>';html+='</div>';document.getElementById('dashContent').innerHTML=html;return}
  html+=items.map(function(e){
    return '<div class="glass-card" style="padding:16px;margin-bottom:10px;border-left:3px solid var(--neon)">'+
      '<div style="display:flex;justify-content:space-between;margin-bottom:8px"><span style="color:#888;font-size:12px">'+(e.date?new Date(e.date).toLocaleDateString('es-ES'):'')+'</span></div>'+
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:13px">'+
      '<span>AIM: <strong style="color:var(--neon)">'+e.aim+'</strong></span><span>Game Sense: <strong style="color:var(--neon)">'+e.game_sense+'</strong></span>'+
      '<span>Comms: <strong style="color:var(--neon)">'+e.communication+'</strong></span><span>Teamwork: <strong style="color:var(--neon)">'+e.teamwork+'</strong></span></div>'+
      (e.coach_notes?'<div style="margin-top:8px;padding:8px 12px;background:rgba(255,255,255,0.03);border-radius:6px;font-size:13px;color:#aaa;border-left:2px solid #555;white-space:pre-wrap">'+ic('message-square',12)+' '+esc(e.coach_notes)+'</div>':'')+'</div>';
  }).join('');
  html+='</div>';document.getElementById('dashContent').innerHTML=html;
}
function renderDashCoachNotes(){
  var u=getLogin();var name=u?u.name:'';if(!name)return;
  var items=filterByCoach(DATA.coach_notes||[]).filter(function(n){return n.member_name===name}).sort(function(a,b){return a.created_at<b.created_at?1:-1});
  var html='<div class="glass-card" style="padding:24px"><h3 style="margin:0 0 16px;font-size:18px">'+ic('message-square',18)+' Notas del Coach</h3>';
  if(!items.length){html+='<div style="text-align:center;padding:24px;color:#555">'+ic('inbox',40)+'<br>Sin notas aÃºn</div>';html+='</div>';document.getElementById('dashContent').innerHTML=html;return}
  html+=items.map(function(n){
    return '<div class="glass-card" style="padding:14px 16px;margin-bottom:8px;border-left:3px solid var(--neon)">'+
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><span style="color:#888;font-size:12px">'+(n.created_at?new Date(n.created_at).toLocaleDateString('es-ES'):'')+'</span><span class="badge badge-purple">'+esc(n.category||'general')+'</span></div>'+
      '<div style="color:#ccc;font-size:14px;white-space:pre-wrap">'+esc(n.note||n.text||'')+'</div></div>';
  }).join('');
  html+='</div>';document.getElementById('dashContent').innerHTML=html;
}
function showNotesOverlay(){
  var u=getLogin();var name=u?u.name:'';if(!name)return;
  var notes=filterByCoach(DATA.coach_notes||[]).filter(function(n){return n.member_name===name}).sort(function(a,b){return a.created_at<b.created_at?1:-1});
  var h='<h3>'+ic('message-square',18)+' Todas las Notas del Coach</h3>';
  if(!notes.length){h+='<div style="padding:20px;text-align:center;color:#888">'+ic('inbox',40)+'<br>Sin notas aÃºn</div>';showDetail(h);return}
  h+='<div style="max-height:400px;overflow-y:auto;display:grid;gap:8px">';
  notes.forEach(function(n){
    h+='<div class="has-glow" style="background:rgba(255,255,255,0.03);border-radius:8px;padding:12px 16px;border-left:3px solid var(--neon)">'+
      '<div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="color:#888;font-size:12px">'+(n.created_at?new Date(n.created_at).toLocaleDateString('es-ES'):'')+'</span><span class="badge badge-purple">'+esc(n.category||'general')+'</span></div>'+
      '<div style="color:#ccc;font-size:14px;white-space:pre-wrap">'+esc(n.note||n.text||'')+'</div></div>';
  });
  h+='</div>';showDetail(h);
}
function showEvalsOverlay(){
  var u=getLogin();var name=u?u.name:'';if(!name)return;
  var evals=(DATA.evaluations||[]).filter(function(e){return e.member_name===name}).sort(function(a,b){return a.date<b.date?1:-1});
  var h='<h3>'+ic('bar-chart-3',18)+' Todas las Evaluaciones</h3>';
  if(!evals.length){h+='<div style="padding:20px;text-align:center;color:#888">'+ic('clipboard',40)+'<br>Sin evaluaciones aÃºn</div>';showDetail(h);return}
  h+='<div style="max-height:400px;overflow-y:auto;display:grid;gap:8px">';
  evals.forEach(function(e){
    h+='<div class="has-glow" style="background:rgba(255,255,255,0.03);border-radius:8px;padding:12px 16px;border-left:3px solid var(--neon)">'+
      '<div style="color:#888;font-size:12px;margin-bottom:6px">'+(e.date?new Date(e.date).toLocaleDateString('es-ES'):'')+'</div>'+
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:13px">'+
      '<span>AIM: <strong>'+e.aim+'</strong></span><span>Game Sense: <strong>'+e.game_sense+'</strong></span>'+
      '<span>Comms: <strong>'+e.communication+'</strong></span><span>Teamwork: <strong>'+e.teamwork+'</strong></span></div></div>';
  });
  h+='</div>';showDetail(h);
}
function showEvalDetail(idx){
  var u=getLogin();var name=u?u.name:'';if(!name)return;
  var evals=(DATA.evaluations||[]).filter(function(e){return e.member_name===name}).sort(function(a,b){return a.date<b.date?1:-1});
  var e=evals[idx];if(!e)return;
  var h='<h3>'+ic('bar-chart-3',18)+' Detalle de EvaluaciÃ³n</h3>'+
    '<div style="display:grid;gap:12px;padding:8px 0">'+
    '<div style="color:#888;font-size:13px">'+(e.date?new Date(e.date).toLocaleDateString('es-ES'):'')+'</div>'+
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">'+
    '<div class="glass-card" style="padding:16px;text-align:center"><div class="num gradient-text">'+e.aim+'</div><div style="color:#888;font-size:12px">AIM</div></div>'+
    '<div class="glass-card" style="padding:16px;text-align:center"><div class="num gradient-text">'+e.game_sense+'</div><div style="color:#888;font-size:12px">Game Sense</div></div>'+
    '<div class="glass-card" style="padding:16px;text-align:center"><div class="num gradient-text">'+e.communication+'</div><div style="color:#888;font-size:12px">Comms</div></div>'+
    '<div class="glass-card" style="padding:16px;text-align:center"><div class="num gradient-text">'+e.teamwork+'</div><div style="color:#888;font-size:12px">Teamwork</div></div>'+
    '</div></div>';
  showDetail(h);
}
function showRankOverlay(){
  var u=getLogin();var name=u?u.name:'';if(!name)return;
  var ranks=(DATA.rank_history||[]).filter(function(r){return r.member_name===name}).sort(function(a,b){return a.date<b.date?1:-1});
  var h='<h3>'+ic('trending-up',18)+' Historial Completo de Rango</h3>';
  if(!ranks.length){h+='<div style="padding:20px;text-align:center;color:#888">'+ic('activity',40)+'<br>Sin historial de rango</div>';showDetail(h);return}
  h+='<div style="max-height:400px;overflow-y:auto;display:grid;gap:6px">';
  ranks.forEach(function(r,i){
    h+='<div class="has-glow" style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:rgba(255,255,255,0.03);border-radius:8px">'+
      (i?'<span style="color:#555">â†’</span>':'')+'<span class="badge badge-purple">'+esc(r.rank)+'</span>'+
      '<span style="color:#888;font-size:12px">'+(r.date?new Date(r.date).toLocaleDateString('es-ES'):'')+'</span></div>';
  });
  h+='</div>';showDetail(h);
}
function showAchsOverlay(){
  var u=getLogin();var name=u?u.name:'';if(!name)return;
  var myAchs=(DATA.member_achievements||[]).filter(function(ma){return ma.member_name===name});
  var earned=myAchs.map(function(ma){return(DATA.achievements||[]).find(function(a){return a.id===ma.achievement_id})}).filter(function(a){return a});
  var h='<h3>'+ic('award',18)+' Todos los Logros Obtenidos</h3>';
  if(!earned.length){h+='<div style="padding:20px;text-align:center;color:#888">'+ic('star',40)+'<br>AÃºn no tienes logros</div>';showDetail(h);return}
  h+='<div style="max-height:400px;overflow-y:auto;display:grid;gap:8px">';
  earned.forEach(function(a){
    h+='<div class="has-glow" style="display:flex;align-items:center;gap:12px;padding:12px 16px;background:rgba(255,255,255,0.03);border-radius:8px;border-left:3px solid var(--neon)">'+
      ic(a.icon||'trophy',24)+'<div><strong style="font-size:14px">'+esc(a.name)+'</strong>'+(a.description?'<div style="color:#888;font-size:12px;margin-top:2px">'+esc(a.description)+'</div>':'')+'</div></div>';
  });
  h+='</div>';showDetail(h);
}

function renderDashTasks(){
  var items=filterByCoach(filterByGroup(DATA.tasks||[]));
  var u=getLogin();var name=u?u.name:'';
  var html='<div class="glass-card" style="padding:24px"><div id="dashTasksList">';
  if(!name){html+='<div style="text-align:center;padding:24px;color:#555">'+ic('log-in',40)+'<br>Inicia sesiÃ³n para ver tus tareas</div>';html+='</div></div>';document.getElementById('dashContent').innerHTML=html;return}
  if(!items.length){html+='<div style="text-align:center;padding:24px;color:#555">'+ic('check-square',40)+'<br>No hay tareas asignadas</div>';html+='</div></div>';document.getElementById('dashContent').innerHTML=html;return}
  html+=items.map(function(t){
    var completed=(DATA.task_completions||[]).filter(function(tc){return tc.task_id===t.id&&tc.member_name===name});
    var done=completed.length>0;
    return '<div class="glass-card" style="padding:16px;display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:8px;'+(done?'opacity:0.5':'')+'">'+
      '<div style="flex:1;cursor:pointer" onclick="showTaskDetail(\''+t.id+'\')"><strong>'+esc(t.title)+'</strong>'+
        (t.description?'<div style="color:#888;font-size:13px;margin-top:4px;white-space:pre-wrap">'+esc(t.description)+'</div>':'')+
        '<div style="color:#555;font-size:12px;margin-top:4px">'+(t.type?esc(t.type):'')+(t.due_date?' Â· '+esc(t.due_date):'')+(t.coach?' Â· '+ic('user',11)+' '+esc(t.coach):'')+'</div>'+
        (t.attachment_url?'<a href="'+esc(t.attachment_url)+'" target="_blank" style="display:inline-flex;align-items:center;gap:4px;color:var(--neon);font-size:12px;margin-top:4px" onclick="event.stopPropagation()">'+ic('paperclip',12)+' '+esc(t.attachment_name||'Archivo')+'</a>':'')+
      '</div>'+
      '<button class="btn-sm '+(done?'save':'cancel')+'" onclick="event.stopPropagation();toggleTaskCompletion(\''+t.id+'\');renderDashTasks()">'+(done?ic('check',14)+' Hecho':ic('square',14)+' Completar')+'</button>'+
    '</div>';
  }).join('');
  html+='</div></div>';
  document.getElementById('dashContent').innerHTML=html;
}

function renderDashMaterials(){
  var html='<div class="glass-card" style="padding:24px"><div class="materials-filter" style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px">'+
    '<input class="input-field" id="dashMatSearch" placeholder="Buscar materiales..." oninput="renderDashMaterials()" style="flex:1;min-width:180px">'+
    '<select class="input-field" id="dashMatType" onchange="renderDashMaterials()" style="max-width:160px">'+
      '<option value="">Todos</option><option value="video">Video</option><option value="guide">GuÃ­a</option><option value="pdf">PDF</option><option value="other">Otro</option>'+
    '</select></div><div id="dashMatGrid" class="materials-grid"></div></div>';
  document.getElementById('dashContent').innerHTML=html;
  var grid=document.getElementById('dashMatGrid');
  if(!grid)return;
  var items=filterByCoach(filterByGroup(DATA.materials||[]));
  var search=(document.getElementById('dashMatSearch')?.value||'').toLowerCase();
  var typeFilter=document.getElementById('dashMatType')?.value||'';
  if(typeFilter)items=items.filter(function(m){return m.type===typeFilter});
  if(search)items=items.filter(function(m){return (m.title||'').toLowerCase().includes(search)||(m.description||'').toLowerCase().includes(search)});
  if(!items.length){grid.innerHTML='<div style="text-align:center;padding:40px;color:#555;grid-column:1/-1">'+ic('book',48)+'<br>No se encontraron materiales</div>';return}
  var typeIcons={video:'film',guide:'file-text',pdf:'file',other:'file'};
  var typeColors={video:'#8B5CF6',guide:'#8b5cf6',pdf:'#8b5cf6',other:'#888'};
  grid.innerHTML=items.map(function(m){
    return '<div class="glass-card mat-card">'+
      (m.image_url?'<img src="'+esc(m.image_url)+'" alt="" style="cursor:pointer" onclick="event.stopPropagation();showImageOverlay(this.src,this.alt)">':'')+
      '<div class="body"><h3>'+esc(m.title)+'</h3>'+(m.description?'<p style="white-space:pre-wrap">'+esc(m.description)+'</p>':'')+
      '<div class="meta"><span class="badge" style="background:'+(typeColors[m.type]||'#888')+'22;color:'+(typeColors[m.type]||'#888')+';border-color:'+(typeColors[m.type]||'#888')+'44">'+ic(typeIcons[m.type]||'file',14)+' '+esc(m.type)+'</span>'+
      (m.coach?'<span style="font-size:12px;color:#888;margin-left:10px">'+ic('user',11)+' '+esc(m.coach)+'</span>':'')+'</div>'+
      '<div class="has-glow actions">'+(m.url?'<a href="'+esc(m.url)+'" target="_blank" class="primary" onclick="event.stopPropagation()">'+ic('external-link',14)+' Abrir</a>':'')+
      (m.attachment_url?'<a href="'+esc(m.attachment_url)+'" target="_blank" class="secondary" onclick="event.stopPropagation()">'+ic('download',14)+' '+esc(m.attachment_name||'Descargar')+'</a>':'')+'</div></div></div>';
  }).join('');
}

function renderDashQuizzes(){
  var items=filterByCoach(filterByGroup(DATA.quizzes||[]));
  var u=getLogin();var member=u?u.name:'';
  var html='<div id="dashQuizList">';
  if(!items.length){html+='<div style="text-align:center;padding:40px;color:#555">'+ic('help-circle',48)+'<br>No hay quizzes disponibles</div>';html+='</div>';document.getElementById('dashContent').innerHTML=html;return}
  items.forEach(function(q){
    var answered=(DATA.quiz_responses||[]).find(function(r){return r.quiz_id===q.id&&r.member_name===member});
    html+='<div class="glass-card" style="padding:20px;margin-bottom:14px"><div style="display:flex;justify-content:space-between;align-items:center"><div><h3 style="margin:0 0 4px;font-size:16px">'+esc(q.title)+'</h3><p style="margin:0;font-size:13px;color:#888">'+(q.description||'')+'</p></div>'+(answered?'<span style="background:#8b5cf620;color:#8b5cf6;padding:4px 12px;border-radius:20px;font-size:12px">'+Math.round(answered.score)+'%</span>':'')+'</div><div style="margin-top:12px;display:flex;gap:10px;align-items:center;flex-wrap:wrap"><span style="font-size:12px;color:#888">'+(q.questions||[]).length+' preguntas</span>'+(q.coach?'<span style="font-size:12px;color:#888">'+ic('user',11)+' '+esc(q.coach)+'</span>':'')+'<button class="btn-sm primary" onclick="startDashQuiz(\''+q.id+'\')" style="margin-left:auto">'+(answered?'Reintentar':'Comenzar')+'</button></div></div>';
  });
  html+='</div>';
  document.getElementById('dashContent').innerHTML=html;
}
function startDashQuiz(id){
  var quiz=DATA.quizzes.find(function(q){return q.id===id});
  if(!quiz){toast('Quiz no encontrado','err');return}
  var qs=quiz.questions||[];
  var html='<button class="btn-sm secondary" onclick="renderDashQuizzes()" style="margin-bottom:16px"><i data-lucide="arrow-left" style="width:14px;height:14px"></i> Volver</button><div class="glass-card" style="padding:24px"><h3 style="margin:0 0 4px;font-size:18px">'+esc(quiz.title)+'</h3><p style="margin:0 0 16px;font-size:13px;color:#888">'+(quiz.description||'')+'</p>';
  qs.forEach(function(q,i){
    html+='<div class="has-glow" style="margin-bottom:18px;padding:16px;background:#ffffff08;border-radius:10px;border:1px solid #ffffff15" id="dqrow_'+i+'"><p style="margin:0 0 10px;font-size:14px;font-weight:600">'+(i+1)+'. '+esc(q.text)+'</p>';
    (q.options||[]).forEach(function(o,j){
      html+='<label style="display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:8px;margin-bottom:4px;cursor:pointer;background:#ffffff08" id="dqlabel_'+i+'_'+j+'"><input type="radio" name="dquiz_'+i+'" value="'+j+'" onchange="document.getElementById(\'dqexp_'+i+'\').style.display=\'none\'"><span>'+esc(o)+'</span></label>';
    });
    html+='<div id="dqexp_'+i+'" style="display:none;margin-top:8px;padding:8px 12px;border-radius:6px;font-size:12px"></div></div>';
  });
  html+='<button class="btn-primary" onclick="submitDashQuiz(\''+id+'\')" style="width:100%;justify-content:center"><i data-lucide="check" style="width:16px;height:16px"></i> Enviar Respuestas</button></div>';
  document.getElementById('dashContent').innerHTML=html;
  if(typeof lucide!=='undefined')lucide.createIcons();
}
function submitDashQuiz(id){
  var quiz=DATA.quizzes.find(function(q){return q.id===id});
  if(!quiz)return;
  var qs=quiz.questions||[];
  var correct=0,total=qs.length;
  qs.forEach(function(q,i){
    var selected=document.querySelector('input[name="dquiz_'+i+'"]:checked');
    var ans=selected?parseInt(selected.value):-1;
    var expDiv=document.getElementById('dqexp_'+i);
    if(ans===q.correct){
      correct++;
      if(expDiv){expDiv.style.display='block';expDiv.style.background='#8b5cf620';expDiv.style.color='#8b5cf6';expDiv.textContent='âœ“ Correcto'+(q.explanation?' â€” '+q.explanation:'')}
    }else{
      if(expDiv){expDiv.style.display='block';expDiv.style.background='#8b5cf620';expDiv.style.color='#8b5cf6';expDiv.textContent='âœ— Incorrecto. Respuesta correcta: '+(q.options[q.correct]||'N/A')+(q.explanation?' â€” '+q.explanation:'')}
    }
  });
  var score=Math.round(correct/total*100);
  var u=getLogin();
  var member=u?u.name:'AnÃ³nimo';
  var existing=DATA.quiz_responses.findIndex(function(r){return r.quiz_id===id&&r.member_name===member});
  var resp={quiz_id:id,member_name:member,score:score,answers:qs.map(function(q,i){var sel=document.querySelector('input[name="dquiz_'+i+'"]:checked');return sel?parseInt(sel.value):-1}),completed_at:new Date().toISOString()};
  if(existing>=0){DATA.quiz_responses[existing]={...DATA.quiz_responses[existing],...resp}}else{resp.id=uid();DATA.quiz_responses.push(resp)}
  saveLocal(DATA);
  document.getElementById('dashContent').insertAdjacentHTML('afterbegin','<div class="has-glow" style="text-align:center;padding:16px;margin-bottom:16px;background:#ffffff10;border-radius:10px;border:1px solid '+(score>=70?'#8b5cf6':'#8b5cf6')+'40"><strong style="font-size:18px">'+(score>=70?'ðŸŽ‰':'ðŸ’ª')+' Puntaje: '+score+'% ('+correct+'/'+total+')</strong></div>');
}

function renderDashCurriculum(){
  var items=filterByCoach(filterByGroup(DATA.curriculum||[]));
  if(!items.length){document.getElementById('dashContent').innerHTML='<div style="text-align:center;padding:40px;color:#555">'+ic('book-open',48)+'<br>No hay plan de estudios disponible</div>';return}
  var html=items.sort(function(a,b){return a.week-b.week}).map(function(c,i){
    var topics;try{topics=typeof c.topics==='string'?JSON.parse(c.topics||'[]'):(c.topics||[])}catch(e){topics=[]}
    return '<div class="glass-card" style="padding:20px;border-left:4px solid '+(c.color||'#8B5CF6')+';cursor:pointer;margin-bottom:12px" onclick="showCurriculumDetail('+i+')">'+
      (c.image_url?'<img src="'+esc(c.image_url)+'" alt="" style="width:100%;max-height:160px;object-fit:cover;border-radius:8px;margin-bottom:10px;cursor:pointer" onclick="event.stopPropagation();showImageOverlay(this.src,this.alt)">':'')+
      '<div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:10px"><div><span class="badge badge-purple">Semana '+c.week+'</span><h3 style="margin:8px 0 4px;font-size:18px">'+esc(c.title)+'</h3></div></div>'+
      (c.description?'<p style="color:#888;font-size:14px;white-space:pre-wrap">'+esc(c.description)+'</p>':'')+
      (c.coach?'<div style="font-size:12px;color:#888;margin-top:6px">'+ic('user',11)+' '+esc(c.coach)+'</div>':'')+
      (topics.length?'<div style="margin-top:10px;display:grid;gap:6px">'+topics.map(function(t){return'<div style="display:flex;align-items:center;gap:8px;font-size:13px;color:#ccc"><span style="color:var(--neon)">â–¸</span>'+esc(t)+'</div>'}).join('')+'</div>':'')+
    '</div>';
  }).join('');
  document.getElementById('dashContent').innerHTML=html;
}
// ========== RENDER SCRIMS ==========
function renderScrims(){
  var sc=DATA.scrims||[];
  console.log('renderScrims: total scrims:',sc.length,'logos:',sc.filter(function(s){return s.opponent_logo}).length,JSON.stringify(sc.map(function(s){return{id:s.id,logo:s.opponent_logo?s.opponent_logo.slice(0,80):''}})));
  sc=filterByCoach(filterByGroup(sc));
  console.log('renderScrims: after filter:',sc.length,'logos:',sc.filter(function(s){return s.opponent_logo}).length);
  var t=sc.length,w=sc.filter(function(s){return s.result==='Victoria'}).length,l=sc.filter(function(s){return s.result==='Derrota'}).length,wr=t?Math.round(w/t*100):0;
  document.getElementById('scrimStats').innerHTML='<div class="glass-card stat-card"><div class="icon">'+ic('crosshair',40)+'</div><div class="number gradient-text">'+t+'</div><div class="label">Total</div></div><div class="glass-card stat-card"><div class="icon" style="color:#8b5cf6">'+ic('check-circle',40)+'</div><div class="number" style="color:#8b5cf6">'+w+'</div><div class="label">Victorias</div></div><div class="glass-card stat-card"><div class="icon" style="color:#8b5cf6">'+ic('x-circle',40)+'</div><div class="number" style="color:#8b5cf6">'+l+'</div><div class="label">Derrotas</div></div><div class="glass-card stat-card"><div class="icon">'+ic('bar-chart-3',40)+'</div><div class="number gradient-text">'+wr+'%</div><div class="label">Win Rate</div></div>';
  var rb={Victoria:'badge-green',Derrota:'badge-red',Empate:'badge-yellow',Pendiente:'badge-gray'};
  var list=document.getElementById('scrimList');
  if(!sc.length){list.innerHTML='<div style="text-align:center;padding:40px;color:#555">'+ic('crosshair',48)+'<br>No hay scrims registrados</div>';return}
  list.innerHTML=sc.map(function(s){var sc2=s.opponent_score!=null?s.opponent_score:s.opponent;return'<div class="glass-card scrim-item"><div class="scrim-left">'+
    (s.opponent_logo?'<img src="'+esc(s.opponent_logo)+'" alt="" style="width:50px;height:50px;border-radius:14px;object-fit:cover;flex-shrink:0">':'<div class="scrim-badge '+(s.result==='Victoria'?'badge-green':s.result==='Derrota'?'badge-red':'badge-gray')+'" style="background:'+(s.result==='Victoria'?'rgba(139,92,246,0.12)':s.result==='Derrota'?'rgba(139,92,246,0.12)':'rgba(107,114,128,0.12)')+'">'+(s.result==='Victoria'?'W':s.result==='Derrota'?'L':'D')+'</div>')+
    '<div><strong style="font-size:14px">vs '+esc(s.opponent)+'</strong><div style="color:#888;font-size:13px">'+s.our+' - '+sc2+' <span style="color:#555;font-size:12px">'+s.date+'</span></div>'+(s.coach?'<div style="font-size:11px;color:#666;margin-top:2px">'+ic('user',10)+' '+esc(s.coach)+'</div>':'')+'</div></div><span class="badge '+(rb[s.result]||'badge-gray')+'">'+s.result+'</span></div>'}).join('');
}

// ========== RENDER STATS ==========
function renderStats(){
  var sc=DATA.scrims||[];
  sc=filterByCoach(filterByGroup(sc));
  var s=sc.reduce(function(a,c){return{matches:a.matches+(c.result==='Victoria'||c.result==='Derrota'?1:0),wins:a.wins+(c.result==='Victoria'?1:0),losses:a.losses+(c.result==='Derrota'?1:0),mvps:a.mvps}},{matches:0,wins:0,losses:0,mvps:0});
  var wr=s.matches?Math.round(s.wins/s.matches*100):0;
  document.getElementById('statsGrid').innerHTML='<div class="glass-card stat-card"><div class="icon">'+ic('gamepad-2',40)+'</div><div class="number gradient-text">'+s.matches+'</div><div class="label">Partidas</div></div><div class="glass-card stat-card"><div class="icon" style="color:#8b5cf6">'+ic('check-circle',40)+'</div><div class="number" style="color:#8b5cf6">'+s.wins+'</div><div class="label">Victorias</div></div><div class="glass-card stat-card"><div class="icon" style="color:#8b5cf6">'+ic('x-circle',40)+'</div><div class="number" style="color:#8b5cf6">'+s.losses+'</div><div class="label">Derrotas</div></div><div class="glass-card stat-card"><div class="icon">'+ic('bar-chart-3',40)+'</div><div class="number gradient-text">'+wr+'%</div><div class="label">Win Rate</div></div>';
}

// ========== RENDER NEWS ==========
function renderNews(){
  var grid=document.getElementById('newsGrid');
  var items=DATA.news||[];
  items=filterByCoach(filterByGroup(items));
  if(!items.length){grid.innerHTML='<div style="text-align:center;padding:40px;color:#555;grid-column:1/-1">'+ic('newspaper',48)+'<br>No hay noticias publicadas</div>';return}
  grid.innerHTML=items.map(function(n,i){return'<div class="glass-card news-card" onclick="showNewsDetail('+i+')" style="cursor:pointer">'+
    '<div class="news-img">'+(n.image_url?'<img src="'+esc(n.image_url)+'" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:12px 12px 0 0;cursor:pointer" onclick="event.stopPropagation();showImageOverlay(this.src,this.alt)">':ic('newspaper',40))+'</div>'+
    '<div class="body"><div class="meta"><span>'+ic('calendar',14)+' '+(n.date||'')+'</span><span>'+ic('user',14)+' '+esc(n.author||'Admin')+'</span></div><h3>'+esc(n.title)+'</h3><p style="white-space:pre-wrap">'+esc(n.excerpt||n.content||'')+'</p></div></div>'}).join('');
}
function showNewsDetail(i){
  var n=filterByCoach(filterByGroup((DATA.news||[]).filter(function(x){return x.published})))[i];
  if(!n)return;
  showDetail((n.image_url?'<img src="'+esc(n.image_url)+'" class="detail-img" style="cursor:pointer" onclick="event.stopPropagation();showImageOverlay(this.src,this.alt)">':'')+
    '<h2>'+esc(n.title)+'</h2>'+
    '<div class="meta"><span>'+ic('calendar',14)+' '+(n.date||'')+'</span><span>'+ic('user',14)+' '+esc(n.author||'Admin')+'</span></div>'+
    '<div class="body-text">'+esc(n.content||n.excerpt||'')+'</div>'+
    (n.attachment_url?'<a href="'+esc(n.attachment_url)+'" target="_blank" class="attach-link" onclick="event.stopPropagation()">'+ic('paperclip',16)+' '+esc(n.attachment_name||'Descargar archivo')+'</a>':''));
}

// ========== RENDER MEMBERS ==========
function renderMembers(filter){
  filter=filter||'';
  var grid=document.getElementById('membersGrid');
  var members=DATA.members||[];
  members=filterByCoach(members);
  var items=filter?members.filter(function(m){return (m.name||'').toLowerCase().includes(filter.toLowerCase())||(m.role||'').toLowerCase().includes(filter.toLowerCase())||(m.rank||'').toLowerCase().includes(filter.toLowerCase())}):members;
  if(!items.length){grid.innerHTML='<div style="text-align:center;padding:40px;color:#555;grid-column:1/-1">'+ic('users',48)+'<br>No se encontraron miembros</div>';return}
  try{
    grid.innerHTML=items.map(function(m,i){
      var roleIcons={Duelist:'sword',Initiator:'search',Controller:'shield',Sentinel:'castle',Flex:'refresh-cw'};
      return '<div class="glass-card member-card" onclick="showMemberDetail('+i+')">'+
        '<div class="member-icon">'+(roleIcons[m.role]?ic(roleIcons[m.role],28):ic('gamepad-2',28))+'</div>'+
        '<h3>'+fmtName(m.name)+'</h3>'+
        (m.role?'<div class="member-role">'+esc(m.role)+'</div>':'')+
        (m.rank?'<div class="member-rank">'+esc(m.rank)+'</div>':'')+
        (m.coach?'<div class="member-coach">'+ic('user',12)+' '+esc(m.coach)+'</div>':'')+
      '</div>'
    }).join('');
  }catch(e){console.log('Render members error:',e);grid.innerHTML='<div style="text-align:center;padding:40px;color:#8b5cf6">'+ic('alert-triangle',48)+'<br>Error al renderizar miembros</div>'}
  if(typeof lucide!=='undefined')lucide.createIcons();
}
function showMemberDetail(idx){
  var items=filterByCoach(DATA.members||[]);
  var m=items[idx];if(!m)return;
  var latestRank=(DATA.rank_history||[]).filter(function(r){return r.member_name===m.name}).sort(function(a,b){return a.date<b.date?1:-1});
  var rank=latestRank.length?latestRank[0].rank:(m.rank||'');
  var achIds=(DATA.member_achievements||[]).filter(function(ma){return ma.member_name===m.name}).map(function(ma){return ma.achievement_id});
  var achs=(DATA.achievements||[]).filter(function(a){return achIds.includes(a.id)});
  var h='<div style="text-align:center">'+
    '<div class="team-avatar" style="margin:0 auto 16px">'+(m.image?'<img src="'+esc(m.image)+'" alt="">':ic('gamepad-2',40))+'</div>'+
    '<h2 style="margin:0 0 6px">'+fmtName(m.name)+'</h2>'+
    '<div style="color:#999;font-size:15px;margin-bottom:4px">'+esc(m.role)+'</div>'+
    '<div style="color:#555;font-size:14px;margin-bottom:12px">'+esc(rank)+(getGroupFromRank(rank)?' <span class="badge '+(getGroupFromRank(rank)==='g1'?'badge-purple':'badge-blue')+'" style="font-size:11px">'+getGroupFromRank(rank).toUpperCase()+'</span>':'')+'</div>'+
    (achs.length?'<div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin-top:8px">'+achs.map(function(a){return'<span title="'+esc(a.description||a.name)+'" style="color:var(--neon);font-size:16px">'+ic(a.icon||'trophy',24)+'</span>'}).join('')+'</div>':'')+
    (m.bio?'<div style="color:#888;font-size:14px;margin-top:16px;line-height:1.6;max-width:400px;margin-left:auto;margin-right:auto">'+esc(m.bio)+'</div>':'')+
    (m.coach?'<div style="font-size:13px;color:#666;margin-top:12px">'+ic('user',13)+' Coach: '+esc(m.coach)+'</div>':'')+
  '</div>';
  showDetail(h);
}
function filterMembers(val){renderMembers(val)}

// ========== RENDER ANNOUNCEMENTS ==========
function renderAnnouncements(){
  var items=DATA.announcements||[];
  items=filterByCoach(filterByGroup(items));
  var container=document.getElementById('announcementsList');
  if(!items.length){container.innerHTML='<div style="text-align:center;padding:40px;color:#555">'+ic('megaphone',48)+'<br>No hay anuncios aÃºn</div>';if(typeof lucide!=='undefined')lucide.createIcons();return}
  container.innerHTML=items.sort(function(a,b){return a.pinned?b.pinned?0:-1:1}).map(function(a,i){
    return '<div class="glass-card" style="padding:20px;cursor:pointer;'+(a.pinned?'border:1px solid var(--neon);':'')+'" onclick="showAnnouncementDetail('+i+')">'+
      (a.image_url?'<img src="'+esc(a.image_url)+'" alt="" style="width:100%;max-height:180px;object-fit:cover;border-radius:8px;margin-bottom:10px;cursor:pointer" onclick="event.stopPropagation();showImageOverlay(this.src,this.alt)">':'')+
      '<div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px">'+
        '<h3 style="font-size:17px;margin:0">'+(a.pinned?ic('pin',16)+' ':'')+esc(a.title)+'</h3>'+
        '<span style="color:#555;font-size:12px;white-space:nowrap">'+(a.created_at?new Date(a.created_at).toLocaleDateString('es-ES'):'')+'</span>'+
      '</div>'+
      '<p style="color:#bbb;font-size:14px;line-height:1.6;white-space:pre-wrap">'+esc(a.content)+'</p>'+
      (a.author?'<div style="color:#555;font-size:12px;margin-top:8px">â€” '+esc(a.author)+'</div>':'')+
    '</div>';
  }).join('');
}
function showAnnouncementDetail(i){
  var items=(DATA.announcements||[]).filter(function(x){return x});
  items=filterByCoach(filterByGroup(items));
  items=items.sort(function(a,b){return a.pinned?b.pinned?0:-1:1});
  var a=items[i];
  if(!a)return;
  showDetail((a.image_url?'<img src="'+esc(a.image_url)+'" class="detail-img" style="cursor:pointer" onclick="event.stopPropagation();showImageOverlay(this.src,this.alt)">':'')+
    '<h2>'+(a.pinned?ic('pin',16)+' ':'')+esc(a.title)+'</h2>'+
    '<div class="meta"><span>'+ic('calendar',14)+' '+(a.created_at?new Date(a.created_at).toLocaleDateString('es-ES'):'')+'</span>'+(a.author?'<span>'+ic('user',14)+' '+esc(a.author)+'</span>':'')+'</div>'+
    '<div class="body-text">'+esc(a.content)+'</div>'+
    (a.attachment_url?'<a href="'+esc(a.attachment_url)+'" target="_blank" class="attach-link" onclick="event.stopPropagation()">'+ic('paperclip',16)+' '+esc(a.attachment_name||'Descargar archivo')+'</a>':''));
}

function showCurriculumDetail(i){
  var items=(DATA.curriculum||[]).filter(function(x){return x});
  items=filterByCoach(filterByGroup(items));
  items=items.sort(function(a,b){return a.week-b.week});
  var c=items[i];
  if(!c)return;
  var topics;try{topics=typeof c.topics==='string'?JSON.parse(c.topics||'[]'):(c.topics||[])}catch(e){topics=[]}
  showDetail((c.image_url?'<img src="'+esc(c.image_url)+'" class="detail-img" style="cursor:pointer" onclick="event.stopPropagation();showImageOverlay(this.src,this.alt)">':'')+
    '<span class="badge badge-purple">Semana '+c.week+'</span><h2 style="margin-top:8px">'+esc(c.title)+'</h2>'+
    (c.description?'<div class="body-text" style="margin-top:12px">'+esc(c.description)+'</div>':'')+
    (topics.length?'<div class="body-text" style="margin-top:12px"><strong>Temas:</strong><ul>'+topics.map(function(t){return'<li>'+esc(t)+'</li>'}).join('')+'</ul></div>':'')+
    (c.attachment_url?'<a href="'+esc(c.attachment_url)+'" target="_blank" class="attach-link" onclick="event.stopPropagation()">'+ic('paperclip',16)+' '+esc(c.attachment_name||'Descargar archivo')+'</a>':''));
}

function showTaskDetail(taskId){
  var t=(DATA.tasks||[]).find(function(x){return x.id===taskId});
  if(!t)return;
  var u=getLogin();var name=u?u.name:'';
  var completed=(DATA.task_completions||[]).filter(function(tc){return tc.task_id===t.id&&tc.member_name===name});
  var done=completed.length>0;
  showDetail((t.image_url?'<img src="'+esc(t.image_url)+'" class="detail-img" style="cursor:pointer" onclick="event.stopPropagation();showImageOverlay(this.src,this.alt)">':'')+
    '<h2>'+esc(t.title)+'</h2>'+
    '<div class="meta"><span>'+ic('tag',14)+' '+esc(t.type||'')+'</span>'+(t.due_date?'<span>'+ic('calendar',14)+' Vence: '+esc(t.due_date)+'</span>':'')+'<span>'+(done?'<span style="color:#8b5cf6">âœ” Completada</span>':'<span style="color:#888">Pendiente</span>')+'</span></div>'+
    (t.description?'<div class="body-text" style="margin-top:12px">'+esc(t.description)+'</div>':'')+
    (t.attachment_url?'<a href="'+esc(t.attachment_url)+'" target="_blank" class="attach-link" onclick="event.stopPropagation()">'+ic('paperclip',16)+' '+esc(t.attachment_name||'Descargar archivo')+'</a>':''));
}
function toggleTaskCompletion(taskId){
  var u=getLogin();var name=u?u.name:'';
  if(!name){toast('Ingresa tu nombre de VALORANT primero');return}
  if(!DATA.task_completions)DATA.task_completions=[];
  var idx=-1;
  for(var i=0;i<DATA.task_completions.length;i++){
    if(DATA.task_completions[i].task_id===taskId&&DATA.task_completions[i].member_name===name){idx=i;break}
  }
  if(idx>=0){
    var removed=DATA.task_completions.splice(idx,1)[0];
    if(db&&db.from)db.from('task_completions').delete().eq('id',removed.id).then(function(){}).catch(function(){});
  }else{
    var newTc={id:uid(),task_id:taskId,member_name:name,completed_at:new Date().toISOString()};
    DATA.task_completions.push(newTc);
    if(db&&db.from)db.from('task_completions').upsert(newTc,{onConflict:'id'}).then(function(){}).catch(function(){});
  }
  saveLocal(DATA);
  if(DASH_TAB==='panel')renderDashPanel();else renderDashTasks();
}

// ========== RENDER SUBSTITUTIONS ==========
function renderSubstitutions(){
  var items=DATA.substitutions||[];
  items=filterByCoach(filterByGroup(items));
  var container=document.getElementById('substitutionsList');
  if(!items.length){container.innerHTML='<div style="text-align:center;padding:24px;color:#555">'+ic('user-plus',40)+'<br>No hay solicitudes de sustituciÃ³n</div>';return}
  container.innerHTML=items.filter(function(s){return s.status==='open'}).sort(function(a,b){return a.created_at<b.created_at?1:-1}).map(function(s){
    return '<div class="glass-card" style="padding:16px;display:flex;justify-content:space-between;align-items:center">'+
      '<div><strong>'+esc(s.requesting_member)+'</strong> necesita <span class="badge badge-purple">'+esc(s.needed_role||'')+'</span></div>'+
      '<button class="btn-sm save" onclick="offerSub(\''+s.id+'\')">Ofrecerme</button></div>';
  }).join('');
}
function offerSub(id){
  var u=getLogin();
  var name=u?u.name:prompt('Tu nombre de VALORANT:');
  if(!name)return;
  var idx=DATA.substitutions.findIndex(function(s){return s.id===id});
  if(idx<0)return;
  DATA.substitutions[idx].status='fulfilled';
  DATA.substitutions[idx].filled_by=name;
  saveLocal(DATA);renderSubstitutions();toast('Te has ofrecido como suplente');
}
function submitSubRequest(){
  var u=getLogin();
  var name=u?u.name:document.getElementById('subReqName').value.trim();
  var role=document.getElementById('subReqRole').value.trim();
  var msg=document.getElementById('subReqMsg');
  if(!name||!role){msg.textContent='Completa todos los campos';msg.style.color='#8b5cf6';return}
  if(!DATA.substitutions)DATA.substitutions=[];
  var memberData=(DATA.members||[]).find(function(m){return m.name===name});
  var sub={id:uid(),schedule_id:'',requesting_member:name,needed_role:role,coach:(memberData?memberData.coach:''),group_id:(memberData?memberData.group_id:''),status:'open',filled_by:'',created_at:new Date().toISOString()};
  DATA.substitutions.push(sub);
  if(db&&db.from)db.from('substitutions').insert(sub).then(function(){}).catch(function(){});
  saveLocal(DATA);renderSubstitutions();
  document.getElementById('subReqName').value='';document.getElementById('subReqRole').value='';
  msg.textContent='Solicitud enviada';msg.style.color='#8b5cf6';
  setTimeout(function(){msg.textContent=''},3000);
}

// ========== IMAGE OVERLAY ==========
var _imageZoom=1;
function showImageOverlay(src,caption){
  var ov=document.getElementById('imageOverlay');
  var img=document.getElementById('imageOverlayImg');
  var loader=document.getElementById('imageOverlayLoader');
  var cap=document.getElementById('imageOverlayCaption');
  ov.classList.add('loading');
  loader.style.display='block';
  img.style.opacity='0';
  img.className='';
  img.src=src;
  _imageZoom=1;
  if(caption){cap.textContent=caption;cap.classList.add('show')}else{cap.textContent='';cap.classList.remove('show')}
  ov.classList.add('open');
  document.body.style.overflow='hidden';
  // hide loader after image loads
  img.onload=function(){ov.classList.remove('loading');loader.style.display='none';img.style.opacity='1'};
  img.onerror=function(){ov.classList.remove('loading');loader.style.display='none';img.style.opacity='1'};
}
function closeImageOverlay(){
  document.getElementById('imageOverlay').classList.remove('open','loading');
  document.getElementById('imageOverlayLoader').style.display='none';
  document.getElementById('imageOverlayImg').style.transform='scale(1)';
  _imageZoom=1;
  document.body.style.overflow='';
}
// Zoom on scroll
document.getElementById('imageOverlay').addEventListener('wheel',function(e){
  var img=document.getElementById('imageOverlayImg');
  if(!img.src)return;
  e.preventDefault();
  _imageZoom=Math.max(0.5,Math.min(4,_imageZoom+(e.deltaY<0?0.15:-0.15)));
  img.style.transform='scale('+_imageZoom+')';
  img.className=_imageZoom>1?'zoomed':'';
});
// Toggle zoom on click
document.getElementById('imageOverlayImg').addEventListener('click',function(e){
  e.stopPropagation();
  if(_imageZoom>1){_imageZoom=1;this.style.transform='scale(1)';this.className=''}
  else{_imageZoom=2;this.style.transform='scale(2)';this.className='zoomed'}
});

// Global ESC key handler
document.addEventListener('keydown',function(e){
  if(e.key==='Escape'){
    var io=document.getElementById('imageOverlay');
    if(io&&io.classList.contains('open')){closeImageOverlay();return}
    var lo=document.getElementById('loginOverlay');
    if(lo&&!lo.classList.contains('hidden')){lo.classList.add('hidden');lo.style.display='';document.body.style.overflow=''}
  }
});
function showDetail(html){
  document.getElementById('detailCard').innerHTML='<button class="close-btn" onclick="closeDetail()">'+ic('x',18)+'</button>'+html;
  document.getElementById('detailOverlay').classList.add('open');
  document.body.style.overflow='hidden';
  if(typeof lucide!=='undefined')lucide.createIcons();
}
function closeDetail(){
  document.getElementById('detailOverlay').classList.remove('open');
  document.body.style.overflow='';
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
// dashTaskName removed â€” renderDashTasks uses getLogin() directly

function submitApp(){
  var btn=document.getElementById('regBtn');
  var msg=document.getElementById('regMsg');
  var name=document.getElementById('reg_name').value.trim();
  if(!name){msg.textContent='El nombre es obligatorio';return}
  var valorant=document.getElementById('reg_valorant').value.trim();
  if(valorant){
    if((DATA.members||[]).find(function(m){return m.name.toLowerCase()===valorant.toLowerCase()})){
      msg.textContent='Ya eres miembro del club. Inicia sesiÃ³n en el menÃº.';msg.style.color='#8b5cf6';return
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
    msg.textContent='âœ“ Solicitud guardada localmente';
    msg.style.color='#8b5cf6';
    resetForm(btn);
    return;
  }
  
  db.from('applications').insert([{...app,status:'pending'}]).then(function(res){
    if(res.error)throw res.error;
    msg.textContent='âœ“ Solicitud enviada con Ã©xito. Te contactaremos pronto.';
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


