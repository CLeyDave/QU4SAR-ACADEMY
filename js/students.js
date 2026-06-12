// ========== SECTION VISIBILITY ==========
function applyVisibility(){
  if(isCommunity()){
    ALL_SECTIONS.forEach(function(id){
      var el=document.getElementById('section-'+id);
      if(!el)return;
      el.style.display=isVisible(id)?'':'none';
    });
    document.querySelectorAll('.nav-links a[data-section]').forEach(function(a){
      var sec=a.getAttribute('data-section');
      if(sec)a.style.display=isVisible(sec)?'':'none';
    });
    return;
  }
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

// ========== SCROLL REVEAL ==========
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

// ========== NAVBAR SCROLL ==========
function initNavbarScroll(){
  var nav=document.getElementById('navbar');
  if(!nav)return;
  nav.classList.toggle('scrolled',window.scrollY>50);
  window.addEventListener('scroll',function(){nav.classList.toggle('scrolled',window.scrollY>50)});
}

// ========== NAV ==========
function showSection(name){
  if(!isVisible(name))return;
  if(!getLogin()&&['news','register'].indexOf(name)<0)return;
  document.querySelectorAll('.section.page').forEach(function(s){s.style.display='none'});
  var el=document.getElementById('section-'+name);
  if(el)el.style.display='block';
  document.querySelectorAll('.nav-links a').forEach(function(a){a.classList.remove('active')});
  var lnk=document.querySelector('.nav-links a[data-section="'+name+'"]');
  if(lnk)lnk.classList.add('active');
  document.getElementById('navLinks').classList.remove('open');
  renderSection(name);
}
function toggleNav(){document.getElementById('navLinks').classList.toggle('open')}
function renderSection(n){try{switch(n){
  case'profile':renderProfile();break;
  case'schedule':renderSchedule();break;
  case'academy':renderAcademy();break;
  case'team':renderTeam();break;
  case'scrims':renderScrims();break;
  case'stats':renderStats();break;
  case'news':renderNews();break;
  case'members':renderMembers();break;
  case'dashboard':renderDashboard();break;
  case'clases':renderDashClases('clasesContent');break;
  case'curriculum':renderDashCurriculum('curriculumContent');break;
  case'materials':renderDashMaterials('materialsContent');break;
  case'tasks':renderDashTasks('tasksContent');break;
  case'evaluations':renderDashEvals('evaluationsContent');break;
  case'quizzes':renderDashQuizzes('quizzesContent');break;
  case'coach_notes':renderDashCoachNotes('coachNotesContent');break;
  case'register':break;
  case'announcements':renderAnnouncements();break;
  case'substitutions':renderSubstitutions();break;
}renderFooter()}catch(e){}if(typeof lucide!=='undefined')lucide.createIcons()}

// ========== LOGIN ==========
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
    _filters.coach=member.coach||'';
    msg.innerHTML=ic('check-circle',14)+' Bienvenido, '+esc(member.name);msg.style.color='#8b5cf6';
    setTimeout(function(){
      var ov=document.getElementById('loginOverlay');
      if(ov){ov.classList.add('hidden');ov.style.display=''}
      document.body.style.overflow='';
      updateLoginBadge();applyVisibility();
      showSection('profile');
      btn.disabled=false;btn.innerHTML='Iniciar Sesión';
    },600);
  }else{
    msg.innerHTML=ic('x-circle',14)+' No encontramos ese usuario. &iquest;Est&aacute;s registrado?';msg.style.color='#ff4444';
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
  var isMember=u&&u.id;
  if(u&&badge&&nameEl){
    badge.style.display='flex';
    nameEl.textContent=u.name+(u.role?' · '+u.role:'');
    if(coachEl){
      if(u.coach){coachEl.innerHTML='<i data-lucide="user-check" style="width:14px;height:14px;vertical-align:middle"></i> Coach: '+esc(u.coach);coachEl.style.display=''}
      else if(u.id){coachEl.innerHTML='<i data-lucide="alert-triangle" style="width:14px;height:14px;vertical-align:middle"></i> Sin coach asignado';coachEl.style.display=''}
      else{coachEl.style.display='none'}
    }
  }else{
    if(badge)badge.style.display='none';
  }
  var guestSections=['','home','news','register'];
  document.querySelectorAll('.nav-links a[data-section]').forEach(function(a){
    var sec=a.getAttribute('data-section');
    if(isMember&&sec==='register'){a.style.display='none';return}
    a.style.display=(u&&!u.id&&guestSections.indexOf(sec)<0)?'none':'';
  });
}

// ========== RENDER HERO ==========
function renderHero(){
  var c=DATA.content.home||{};
  var h=document.getElementById('heroContent');
  h.innerHTML=
    '<img src="'+esc(c.logo_url||'../QU4SAR.ico')+'" alt="QU4SAR" style="max-width:300px;max-height:300px;width:auto;height:auto;margin-bottom:36px;animation:float 8s ease-in-out infinite">'+
    '<h1><span class="gradient-text">'+esc(c.hero_title||'QU4SAR')+'</span></h1>'+
    '<p>'+esc(c.hero_subtitle||'Organización competitiva de Valorant Premier')+'</p>'+
    (c.hero_desc?'<p style="color:#888;font-size:15px;max-width:600px;margin:0 auto">'+esc(c.hero_desc)+'</p>':'')+
    '<p class="tagline">'+esc(c.site_tagline||'Academia · Scrims · Creación de contenido')+'</p>';
}

// ========== RENDER FOOTER ==========
function renderFooter(){
  var c=DATA.content.home||{};
  var f=document.getElementById('footerSocial');
  if(!f)return;
  var links=[{k:'social_twitch',l:'Twitch',i:ic('twitch',16)},{k:'social_youtube',l:'YouTube',i:ic('youtube',16)},{k:'social_twitter',l:'Twitter',i:ic('twitter',16)},{k:'social_instagram',l:'Instagram',i:ic('instagram',16)}];
  f.innerHTML=links.filter(function(l){return c[l.k]}).map(function(l){return'<a href="'+esc(c[l.k])+'" target="_blank" title="'+l.l+'">'+l.i+'</a>'}).join('');
}

// ========== RENDER SCHEDULE ==========
function renderSchedule(){
  var cw=getCurrentWeekStart();
  var weekSet={}; (DATA.schedule||[]).forEach(function(s){if(s.week_start) weekSet[s.week_start]=true});
  weekSet[cw]=true;
  var sortedWeeks=Object.keys(weekSet).sort().reverse();
  var selWeek=document.getElementById('sf_weekFilter')?document.getElementById('sf_weekFilter').value:cw;
  var weekOpts=sortedWeeks.map(function(w){
    var label=w===cw?'Esta semana ('+getWeekLabel(w)+')':getWeekLabel(w);
    return '<option value="'+w+'" '+(selWeek===w?'selected':'')+'>'+esc(label)+'</option>';
  }).join('');

  var items=DATA.schedule||[];
  items=filterByCoach(filterByGroup(items));
  items=items.filter(function(s){return(s.week_start||cw)===selWeek});

  var days=['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
  var container=document.getElementById('scheduleBubbles');

  var weekHTML='<div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:20px;flex-wrap:wrap">'+
    '<label style="font-size:13px;color:#888">Semana:</label>'+
    '<select class="input-field" id="sf_weekFilter" onchange="renderSchedule()" style="width:auto;min-width:220px;padding:6px 12px;font-size:13px">'+weekOpts+'</select></div>';

  if(!items.length){
    container.innerHTML=weekHTML+'<div style="text-align:center;padding:40px;color:#555">'+ic('calendar',48)+'<br>No hay horarios disponibles para esta semana</div>';
    return;
  }

  var dotColors=['#8b5cf6','#f97316','#eab308','#8b5cf6','#3b82f6','#8b5cf6','#a78bfa'];
  var html='<div class="schedule-week">';
  for(var d=0;d<7;d++){
    var dayEvents=items.filter(function(e){return e.day===d});
    html+='<div class="schedule-day-col"><div class="schedule-day-name" style="border-color:'+dotColors[d]+'"><span class="dot" style="background:'+dotColors[d]+'"></span>'+days[d]+'</div>';
    if(dayEvents.length){
      dayEvents.forEach(function(e){
        html+='<div class="schedule-card '+e.type+'"><div class="sc-head"><span class="title">'+esc(e.title)+'</span><span class="type-badge">'+esc(e.type)+'</span></div><div class="sc-time">'+ic('clock',14)+' '+toLocalTime(e.start,e.tz)+' - '+toLocalTime(e.end,e.tz)+'</div>'+(e.coach?'<div class="sc-coach">'+ic('user',14)+' '+esc(e.coach)+'</div>':'')+'</div>';
      });
    }else{
      html+='<div class="schedule-empty">—</div>';
    }
    html+='</div>';
  }
  html+='</div>';
  container.innerHTML=weekHTML+html;
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
  g.innerHTML=items.map(function(a,i){return'<div class="glass-card" style="padding:18px 22px;margin-bottom:10px;border-left:2px solid #8b5cf6;cursor:pointer" onclick="showAcademyDetail('+i+')">'+
    '<div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:6px"><h4 style="margin:0;font-size:16px;font-family:var(--font-display)">'+esc(a.topic)+'</h4><span class="badge badge-purple">'+esc(a.day)+'</span></div>'+
    (a.coach?'<div style="color:#888;font-size:13px;margin-bottom:4px">'+ic('user',13)+' '+esc(a.coach)+'</div>':'')+
    (a.duration?'<div style="color:#555;font-size:12px;margin-bottom:4px">'+ic('clock',12)+' '+esc(a.duration)+'</div>':'')+
    ((a.objectives||[]).length?'<div style="margin-top:8px;display:grid;gap:3px">'+(Array.isArray(a.objectives)?a.objectives:[]).map(function(o){return'<div style="display:flex;align-items:center;gap:6px;font-size:13px;color:#ccc">'+ic('chevron-right',12)+' '+esc(o)+'</div>'}).join('')+'</div>':'')+
  '</div>'}).join('');
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

// ========== RENDER TEAM ==========
function renderTeam(){
  var c=document.getElementById('teamContainer');
  var team=DATA.team||[];
  var g={Titular:[],Suplente:[],Prueba:[]};
  team.forEach(function(m){if(g[m.status])g[m.status].push(m)});
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
        '<span class="badge '+(m.status==='Titular'?'badge-green':m.status==='Suplente'?'badge-yellow':'badge-blue')+'">'+m.status+'</span>'+
      '</div>';
    });
    h+='</div></div>';
  });
  if(!h)h='<div style="text-align:center;padding:40px;color:#555">'+ic('trophy',48)+'<br>No hay jugadores registrados</div>';
  c.innerHTML=h;
}
// ========== RENDER SCRIMS ==========
function renderScrims(){
  var sc=DATA.scrims||[];
  sc=filterByCoach(filterByGroup(sc));
  var t=sc.length,w=sc.filter(function(s){return s.result==='Victoria'}).length,l=sc.filter(function(s){return s.result==='Derrota'}).length,wr=t?Math.round(w/t*100):0;
  document.getElementById('scrimStats').innerHTML=
    '<div class="glass-card" style="padding:20px;margin-bottom:8px;border-left:2px solid #8b5cf6;text-align:center"><div style="width:44px;height:44px;border-radius:10px;background:rgba(139,92,246,0.1);display:flex;align-items:center;justify-content:center;margin:0 auto 8px">'+ic('crosshair',22)+'</div><div class="gradient-text" style="font-size:24px;font-weight:700;font-family:var(--font-display)">'+t+'</div><div style="color:#888;font-size:14px">Total</div></div>'+
    '<div class="glass-card" style="padding:20px;margin-bottom:8px;border-left:2px solid #8b5cf6;text-align:center"><div style="width:44px;height:44px;border-radius:10px;background:rgba(139,92,246,0.1);display:flex;align-items:center;justify-content:center;margin:0 auto 8px">'+ic('check-circle',22)+'</div><div style="font-size:24px;font-weight:700;font-family:var(--font-display);color:#8b5cf6">'+w+'</div><div style="color:#888;font-size:14px">Victorias</div></div>'+
    '<div class="glass-card" style="padding:20px;margin-bottom:8px;border-left:2px solid #8b5cf6;text-align:center"><div style="width:44px;height:44px;border-radius:10px;background:rgba(139,92,246,0.1);display:flex;align-items:center;justify-content:center;margin:0 auto 8px">'+ic('x-circle',22)+'</div><div style="font-size:24px;font-weight:700;font-family:var(--font-display);color:#8b5cf6">'+l+'</div><div style="color:#888;font-size:14px">Derrotas</div></div>'+
    '<div class="glass-card" style="padding:20px;margin-bottom:8px;border-left:2px solid #8b5cf6;text-align:center"><div style="width:44px;height:44px;border-radius:10px;background:rgba(139,92,246,0.1);display:flex;align-items:center;justify-content:center;margin:0 auto 8px">'+ic('bar-chart-3',22)+'</div><div class="gradient-text" style="font-size:24px;font-weight:700;font-family:var(--font-display)">'+wr+'%</div><div style="color:#888;font-size:14px">Win Rate</div></div>';
  var rb={Victoria:'badge-green',Derrota:'badge-red',Empate:'badge-yellow',Pendiente:'badge-gray'};
  var list=document.getElementById('scrimList');
  if(!sc.length){list.innerHTML='<div style="text-align:center;padding:40px;color:#555">'+ic('crosshair',48)+'<br>No hay scrims registrados</div>';return}
  list.innerHTML=sc.map(function(s){var sc2=s.opponent_score!=null?s.opponent_score:s.opponent;return'<div class="glass-card" style="padding:16px 20px;margin-bottom:8px;border-left:2px solid '+(s.result==='Victoria'?'#8b5cf6':s.result==='Derrota'?'#eab308':'#666')+'">'+
    '<div style="display:flex;align-items:center;gap:12px;margin-bottom:6px">'+
    (s.opponent_logo?'<img src="'+esc(s.opponent_logo)+'" alt="" style="width:36px;height:36px;border-radius:10px;object-fit:cover;flex-shrink:0">':'')+
    '<strong style="font-size:15px;flex:1">vs '+esc(s.opponent)+'</strong><span class="badge '+(rb[s.result]||'badge-gray')+'" style="flex-shrink:0">'+s.result+'</span></div>'+
    '<div style="color:#888;font-size:13px">'+s.our+' - '+sc2+' <span style="color:#555;font-size:12px">'+s.date+'</span></div>'+(s.coach?'<div style="font-size:11px;color:#666;margin-top:2px">'+ic('user',10)+' '+esc(s.coach)+'</div>':'')+'</div>'}).join('');
}

// ========== RENDER STATS ==========
function renderStats(){
  var sc=DATA.scrims||[];
  sc=filterByCoach(filterByGroup(sc));
  var s=sc.reduce(function(a,c){return{matches:a.matches+(c.result==='Victoria'||c.result==='Derrota'?1:0),wins:a.wins+(c.result==='Victoria'?1:0),losses:a.losses+(c.result==='Derrota'?1:0),mvps:a.mvps}},{matches:0,wins:0,losses:0,mvps:0});
  var wr=s.matches?Math.round(s.wins/s.matches*100):0;
  document.getElementById('statsGrid').innerHTML=
    '<div class="glass-card" style="padding:24px;margin-bottom:10px;border-left:2px solid #8b5cf6;text-align:center"><div style="width:48px;height:48px;border-radius:12px;background:rgba(139,92,246,0.1);display:flex;align-items:center;justify-content:center;margin:0 auto 8px">'+ic('crosshair',24)+'</div><div class="gradient-text" style="font-size:28px;font-weight:700;font-family:var(--font-display)">'+s.matches+'</div><div style="color:#888;font-size:14px">Total Partidas</div></div>'+
    '<div class="glass-card" style="padding:24px;margin-bottom:10px;border-left:2px solid #8b5cf6;text-align:center"><div style="width:48px;height:48px;border-radius:12px;background:rgba(139,92,246,0.1);display:flex;align-items:center;justify-content:center;margin:0 auto 8px">'+ic('check-circle',24)+'</div><div style="font-size:28px;font-weight:700;font-family:var(--font-display);color:#8b5cf6">'+s.wins+'</div><div style="color:#888;font-size:14px">Victorias</div></div>'+
    '<div class="glass-card" style="padding:24px;margin-bottom:10px;border-left:2px solid #8b5cf6;text-align:center"><div style="width:48px;height:48px;border-radius:12px;background:rgba(139,92,246,0.1);display:flex;align-items:center;justify-content:center;margin:0 auto 8px">'+ic('x-circle',24)+'</div><div style="font-size:28px;font-weight:700;font-family:var(--font-display);color:#8b5cf6">'+s.losses+'</div><div style="color:#888;font-size:14px">Derrotas</div></div>'+
    '<div class="glass-card" style="padding:24px;margin-bottom:10px;border-left:2px solid #8b5cf6;text-align:center"><div style="width:48px;height:48px;border-radius:12px;background:rgba(139,92,246,0.1);display:flex;align-items:center;justify-content:center;margin:0 auto 8px">'+ic('bar-chart-3',24)+'</div><div class="gradient-text" style="font-size:28px;font-weight:700;font-family:var(--font-display)">'+wr+'%</div><div style="color:#888;font-size:14px">Win Rate</div></div>';
}

// ========== RENDER NEWS ==========
function renderNews(){
  var items=DATA.news||[];
  items=filterByCoach(filterByGroup(items));
  if(!items.length){document.getElementById('newsGrid').innerHTML='<div style="text-align:center;padding:40px;color:#555">'+ic('newspaper',48)+'<br>No hay noticias publicadas</div>';return}
  document.getElementById('newsGrid').innerHTML=items.map(function(n,i){
    var img=n.image_url?'<img src="'+esc(n.image_url)+'" alt="" style="width:100%;height:160px;object-fit:cover;border-radius:12px 12px 0 0;cursor:pointer" onclick="event.stopPropagation();showImageOverlay(this.src,this.alt)">':'';
    return '<div class="glass-card" style="overflow:hidden;margin-bottom:14px;cursor:pointer" onclick="showNewsDetail('+i+')">'+img+
      '<div style="padding:20px 22px;border-left:2px solid #8b5cf6"><div style="display:flex;gap:16px;font-size:12px;color:#555;margin-bottom:8px"><span>'+ic('calendar',12)+' '+(n.date||'')+'</span>'+(n.author?'<span>'+ic('user',12)+' '+esc(n.author)+'</span>':'')+'</div>'+
      '<h3 style="font-size:18px;font-weight:600;margin-bottom:8px;font-family:var(--font-display)">'+esc(n.title)+'</h3>'+
      (n.description?'<p style="color:#888;font-size:14px;line-height:1.6;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden">'+esc(n.description)+'</p>':'')+'</div></div>';
  }).join('');
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
function renderMembers(_filter){
  var grid=document.getElementById('membersGrid');
  var members=DATA.members||[];
  members=filterByCoach(members);
  var items=_filter?members.filter(function(m){return (m.name||'').toLowerCase().includes(_filter.toLowerCase())||(m.role||'').toLowerCase().includes(_filter.toLowerCase())||(m.rank||'').toLowerCase().includes(_filter.toLowerCase())}):members;
  if(!items.length){grid.innerHTML='<div style="text-align:center;padding:40px;color:#555">'+ic('users',48)+'<br>No se encontraron miembros</div>';return}
  try{
    grid.innerHTML=items.map(function(m,i){
      var roleIcons={Duelist:'sword',Initiator:'search',Controller:'shield',Sentinel:'castle',Flex:'refresh-cw'};
      return '<div class="glass-card" style="padding:14px 18px;margin-bottom:6px;border-left:2px solid #8b5cf6;cursor:pointer" onclick="showMemberDetail('+i+')">'+
        '<div style="display:flex;align-items:center;gap:10px;margin-bottom:4px"><div style="width:36px;height:36px;border-radius:50%;background:rgba(139,92,246,0.1);display:flex;align-items:center;justify-content:center;flex-shrink:0">'+(roleIcons[m.role]?ic(roleIcons[m.role],18):ic('gamepad-2',18))+'</div>'+
        '<strong style="font-family:var(--font-display);flex:1">'+fmtName(m.name)+'</strong></div>'+
        (m.role?'<span style="color:#888;font-size:12px">'+esc(m.role)+'</span> ':'')+
        (m.rank?'<span style="color:#666;font-size:11px">'+esc(m.rank)+'</span>':'')+
        (m.coach?'<div style="color:#555;font-size:11px;margin-top:2px">'+ic('user',10)+' '+esc(m.coach)+'</div>':'')+
        '</div>'
    }).join('');
  }catch(e){console.log('Render members error:',e);grid.innerHTML='<div style="text-align:center;padding:40px;color:#8b5cf6">'+ic('alert-triangle',48)+'<br>Error al renderizar miembros</div>'}
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
  ensureFilters('announcements',true,true,'announcementsList');
  var items=DATA.announcements||[];
  items=filterByCoach(filterByGroup(items));
  var container=document.getElementById('announcementsList');
  if(!items.length){container.innerHTML='<div style="text-align:center;padding:40px;color:#555">'+ic('megaphone',48)+'<br>No hay anuncios aún</div>';if(typeof lucide!=='undefined')lucide.createIcons();return}
  container.innerHTML=items.sort(function(a,b){return a.pinned?b.pinned?0:-1:1}).map(function(a,i){
    return '<div class="glass-card" style="padding:20px;cursor:pointer;'+(a.pinned?'border:1px solid var(--neon);':'')+'" onclick="showAnnouncementDetail('+i+')">'+
      (a.image_url?'<img src="'+esc(a.image_url)+'" alt="" style="width:100%;max-height:180px;object-fit:cover;border-radius:8px;margin-bottom:10px;cursor:pointer" onclick="event.stopPropagation();showImageOverlay(this.src,this.alt)">':'')+
      '<div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px">'+
        '<h3 style="font-size:17px;margin:0">'+(a.pinned?ic('pin',16)+' ':'')+esc(a.title)+'</h3>'+
        '<span style="color:#555;font-size:12px;white-space:nowrap">'+(a.created_at?new Date(a.created_at).toLocaleDateString('es-ES'):'')+'</span>'+
      '</div>'+
      '<p style="color:#bbb;font-size:14px;line-height:1.6;white-space:pre-wrap">'+esc(a.content)+'</p>'+
      (a.author?'<div style="color:#555;font-size:12px;margin-top:8px">— '+esc(a.author)+'</div>':'')+
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

// ========== RENDER SUBSTITUTIONS ==========
function renderSubstitutions(){
  ensureFilters('substitutions',true,true,'substitutionsList');
  var items=DATA.substitutions||[];
  items=filterByCoach(filterByGroup(items));
  var container=document.getElementById('substitutionsList');
  if(!items.length){container.innerHTML='<div style="text-align:center;padding:24px;color:#555">'+ic('user-plus',40)+'<br>No hay solicitudes de sustitución</div>';return}
  container.innerHTML=items.filter(function(s){return s.status==='open'}).sort(function(a,b){return a.created_at<b.created_at?1:-1}).map(function(s){
    return '<div class="glass-card" style="padding:16px;margin-bottom:10px">'+
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px"><strong>'+esc(s.requesting_member)+'</strong><span class="badge badge-purple" style="margin-left:auto">'+esc(s.needed_role||'')+'</span></div>'+
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
// ========== DASHBOARD ==========

var DASH_TAB='panel';
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
}
function renderProfile(){
  var u=getLogin();
  var container=document.getElementById('profileContent');
  if(!container)return;
  if(!u||!u.id){
    container.innerHTML='<div style="text-align:center;padding:60px 20px;color:#555">'+ic('log-in',48)+'<br><br><span style="font-size:18px;font-weight:600">Inicia sesión para ver tu perfil</span></div>';
    return;
  }
  var name=u.name||'';
  var member=(DATA.members||[]).find(function(m){return m.name===name});
  var isCoach=member&&(DATA.coaches||[]).some(function(c){return c.name===member.name||c.name===member.nickname});
  var hs=member?member.hs_percent||'—':'—';
  var kd=member?member.kd||'—':'—';
  var dpr=member?member.dpr||'—':'—';
  var course=member?member.course||'—':'—';
  var avatar=member?member.image||'':'';
  var rank=member?member.rank||u.rank||'—':'—';
  var role=member?member.role||'—':'—';
  var desc=member?member.description||'':'';
  var coachName=member?member.coach||'—':'—';
  var groupId=member?member.group_id||'':'';

  var myCompletions=(DATA.task_completions||[]).filter(function(tc){return tc.member_name===name});
  var myAttendance=(DATA.attendance||[]).filter(function(a){return a.member_name===name});
  var attThisMonth=myAttendance.filter(function(a){var d=a.date||'';return d.startsWith(new Date().toISOString().slice(0,7))});
  var attRate=attThisMonth.length?Math.round(attThisMonth.filter(function(a){return a.status==='present'}).length/attThisMonth.length*100):0;
  var myEvals=filterByCoach(DATA.evaluations||[]).filter(function(e){return e.member_name===name});
  var avgScore=myEvals.length?Math.round(myEvals.reduce(function(s,e){return s+(e.aim||0)+(e.game_sense||0)+(e.communication||0)+(e.teamwork||0)},0)/(myEvals.length*4)*10)/10:0;
  var myAchs=(DATA.member_achievements||[]).filter(function(ma){return ma.member_name===name});

  container.innerHTML=
    '<div class="profile-wrap" style="max-width:800px;margin:0 auto">'+
      '<div class="glass-card" style="padding:0;overflow:hidden;margin-bottom:16px">'+
        '<div style="background:linear-gradient(135deg,rgba(139,92,246,0.15),rgba(45,10,82,0.4));padding:32px 28px 24px;text-align:center;position:relative">'+
          '<div style="width:88px;height:88px;border-radius:50%;margin:0 auto 14px;background:rgba(139,92,246,0.12);display:flex;align-items:center;justify-content:center;overflow:hidden;border:2px solid rgba(139,92,246,0.2)">'+
            (avatar?'<img src="'+esc(avatar)+'" alt="" style="width:100%;height:100%;object-fit:cover">':ic('user',36))+
          '</div>'+
          '<div style="font-size:22px;font-weight:700;font-family:var(--font-display);margin-bottom:6px">'+esc(name)+'</div>'+
          '<div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin-bottom:8px">'+
            (isCoach?'<span class="badge badge-green">Coach</span>':'<span class="badge badge-blue">Player</span>')+
            '<span class="badge badge-gray">'+(member?'Miembro':'Alumno')+'</span>'+
          '</div>'+
        '</div>'+
        '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:1px;background:rgba(139,92,246,0.04)">'+
          '<div class="profile-stat-cell"><div class="psc-val">'+esc(hs)+'%</div><div class="psc-lbl">HS</div></div>'+
          '<div class="profile-stat-cell"><div class="psc-val">'+esc(kd)+'</div><div class="psc-lbl">KD</div></div>'+
          '<div class="profile-stat-cell"><div class="psc-val">'+esc(dpr)+'</div><div class="psc-lbl">DPR</div></div>'+
          '<div class="profile-stat-cell"><div class="psc-val">'+esc(rank)+'</div><div class="psc-lbl">Rango</div></div>'+
          '<div class="profile-stat-cell"><div class="psc-val">'+esc(course)+'</div><div class="psc-lbl">Curso</div></div>'+
        '</div>'+
      '</div>'+
      '<div class="glass-card" style="padding:20px 24px;margin-bottom:16px">'+
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">'+
          '<div><div style="font-size:11px;color:#666;text-transform:uppercase;letter-spacing:0.3px;margin-bottom:2px">Nombre</div><div style="color:#f0f0f0;font-weight:600">'+esc(name)+'</div></div>'+
          '<div><div style="font-size:11px;color:#666;text-transform:uppercase;letter-spacing:0.3px;margin-bottom:2px">Rango</div><div style="color:var(--neon-light)">'+esc(rank)+'</div></div>'+
          '<div><div style="font-size:11px;color:#666;text-transform:uppercase;letter-spacing:0.3px;margin-bottom:2px">Roles</div><div style="color:#f0f0f0">'+esc(role)+'</div></div>'+
          '<div><div style="font-size:11px;color:#666;text-transform:uppercase;letter-spacing:0.3px;margin-bottom:2px">Coach</div><div style="color:#f0f0f0">'+esc(coachName)+'</div></div>'+
          (groupId?'<div style="grid-column:1/-1"><div style="font-size:11px;color:#666;text-transform:uppercase;letter-spacing:0.3px;margin-bottom:2px">Grupo</div><div style="color:var(--neon-light);font-weight:600">'+esc(String(groupId).toUpperCase())+'</div></div>':'')+
        '</div>'+
        (desc?'<div style="margin-top:16px;padding-top:16px;border-top:1px solid rgba(139,92,246,0.06)"><div style="font-size:11px;color:#666;text-transform:uppercase;letter-spacing:0.3px;margin-bottom:6px">Experiencia</div><div style="color:#bbb;font-size:14px;line-height:1.6;white-space:pre-wrap">'+esc(desc)+'</div></div>':'')+
      '</div>'+
      '<div class="dash-cards" style="margin-bottom:16px">'+
        '<div class="glass-card dash-card"><div class="num gradient-text">'+myCompletions.length+'</div><div class="lbl">'+ic('check-square',12)+' Tareas</div></div>'+
        '<div class="glass-card dash-card"><div class="num gradient-text">'+(attRate?attRate+'%':'—')+'</div><div class="lbl">'+ic('calendar',12)+' Asistencia</div></div>'+
        '<div class="glass-card dash-card"><div class="num gradient-text">'+(avgScore||'—')+'</div><div class="lbl">'+ic('bar-chart-3',12)+' Evaluaciones</div></div>'+
        '<div class="glass-card dash-card"><div class="num gradient-text">'+myAchs.length+'</div><div class="lbl">'+ic('award',12)+' Logros</div></div>'+
      '</div>'+
    '</div>';

  var evalsHTML='<div class="dash-section"><h3>'+ic('bar-chart-3',18)+' Últimas Evaluaciones</h3>';
  if(myEvals.length){
    evalsHTML+='<div style="overflow-x:auto"><table class="dash-eval-table"><thead><tr><th>Fecha</th><th>AIM</th><th>GS</th><th>Comms</th><th>TW</th></tr></thead><tbody>'+
      myEvals.sort(function(a,b){return a.date<b.date?1:-1}).slice(0,5).map(function(e,i){
        return '<tr style="cursor:pointer" onclick="showEvalDetail('+i+')"><td>'+(e.date?new Date(e.date).toLocaleDateString('es-ES'):'—')+'</td><td>'+e.aim+'</td><td>'+e.game_sense+'</td><td>'+e.communication+'</td><td>'+e.teamwork+'</td></tr>';
      }).join('')+'</tbody></table></div>';
  }else evalsHTML+='<div style="padding:16px;text-align:center;color:#555">'+ic('clipboard',24)+'<br>Sin evaluaciones aún</div>';
  evalsHTML+='</div>';

  var notesHTML='<div class="dash-section"><h3>'+ic('message-square',18)+' Notas del Coach</h3>';
  var myNotes=(DATA.coach_notes||[]).filter(function(n){return n.member_name===name});
  if(myNotes.length){
    notesHTML+=myNotes.sort(function(a,b){return a.created_at<b.created_at?1:-1}).slice(0,4).map(function(n){
      return '<div class="glass-card dash-note"><span class="date">'+(n.created_at?new Date(n.created_at).toLocaleDateString('es-ES'):'')+'</span><div class="cat">'+(n.category||'general')+'</div><div style="white-space:pre-wrap">'+esc(n.note||n.text||'')+'</div></div>';
    }).join('');
  }else notesHTML+='<div style="padding:16px;text-align:center;color:#555">'+ic('inbox',24)+'<br>Sin notas aún</div>';
  notesHTML+='</div>';

  var rankHTML='<div class="dash-section"><h3>'+ic('trending-up',18)+' Progreso de Rango</h3>';
  var rankHistory=(DATA.rank_history||[]).filter(function(r){return r.member_name===name});
  if(rankHistory.length){
    rankHTML+='<div class="dash-timeline">'+rankHistory.sort(function(a,b){return a.date<b.date?1:-1}).slice(0,8).map(function(r,i){
      return '<div class="step">'+(i?ic('arrow-right',12)+' ':'')+'<span class="dot"></span><span>'+esc(r.rank)+'</span></div>';
    }).join('')+'</div>';
  }else rankHTML+='<div style="padding:16px;text-align:center;color:#555">'+ic('activity',24)+'<br>Sin historial de rango</div>';
  rankHTML+='</div>';

  var achsHTML='<div class="dash-section"><h3>'+ic('award',18)+' Logros Obtenidos</h3>';
  var earnedAchs=myAchs.map(function(ma){return(DATA.achievements||[]).find(function(a){return a.id===ma.achievement_id})}).filter(function(a){return a});
  if(earnedAchs.length){
    achsHTML+='<div style="display:flex;flex-wrap:wrap;gap:8px">'+earnedAchs.map(function(a){
      return '<div class="glass-card" style="padding:10px 14px;font-size:13px;text-align:center" title="'+esc(a.description||'')+'">'+ic(a.icon||'trophy',20)+'<br>'+esc(a.name)+'</div>';
    }).join('')+'</div>';
  }else achsHTML+='<div style="padding:16px;text-align:center;color:#555">'+ic('star',24)+'<br>Aún no tienes logros</div>';
  achsHTML+='</div>';

  container.innerHTML+=evalsHTML+notesHTML+rankHTML+achsHTML;
  if(typeof lucide!=='undefined')lucide.createIcons();
}

function renderDashboard(){
  var u=getLogin();
  var container=document.getElementById('dashContent');
  if(!container)return;
  if(!u||!u.id){
    container.innerHTML='<div style="text-align:center;padding:60px 20px;color:#555">'+ic('log-in',48)+'<br><br><span style="font-size:18px;font-weight:600">Inicia sesión para ver tu panel</span></div>';
    return;
  }
  renderDashPanel();
}

function renderDashPanel(){
  var u=getLogin();
  var name=u?u.name:'';
  var member=(DATA.members||[]).find(function(m){return m.name===name});
  var headerHTML='<div style="text-align:center;padding:16px 0 24px"><div style="font-size:24px;font-weight:700;font-family:var(--font-display)">'+ic('zap',20)+' Bienvenido, '+esc(name)+'</div>'+
    (member?'<div style="font-size:14px;color:#888;margin-top:6px">'+esc(member.role||'')+(member.rank?' · '+esc(member.rank):'')+(member.group_id?' · Grupo '+esc(String(member.group_id).toUpperCase()):'')+(member.coach?' · Coach: '+esc(member.coach):'')+'</div>':'')+'</div>';
  
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
    '<div class="glass-card dash-card"><div class="num gradient-text">'+(attRate?attRate+'%':'—')+'</div><div class="lbl">Asistencia este mes</div></div>'+
    '<div class="glass-card dash-card"><div class="num gradient-text">'+(avgScore||'—')+'</div><div class="lbl">Promedio Evaluaciones</div></div>'+
    '<div class="glass-card dash-card"><div class="num gradient-text">'+myAchs.length+'</div><div class="lbl">Logros Obtenidos</div></div>';
  
  var tasksHTML='<div class="dash-section"><h3>'+ic('check-square',18)+' Tareas Pendientes</h3>';
  if(allTasks.length){
    var pending=allTasks.map(function(t){
      var done=myCompletions.some(function(tc){return tc.task_id===t.id});
      return done?'':'<div class="glass-card dash-task" onclick="showTaskDetail(\''+t.id+'\')"><div class="title"><strong>'+esc(t.title)+'</strong>'+(t.due_date?'<div class="due">Vence: '+esc(t.due_date)+'</div>':'')+'</div></div>';
    }).filter(function(h){return h}).join('');
    tasksHTML+=pending||'<div style="padding:20px;text-align:center;color:#888">'+ic('check-circle',24)+'<br>¡Todas las tareas completadas!</div>';
  }else tasksHTML+='<div style="padding:20px;text-align:center;color:#888">'+ic('inbox',24)+'<br>No hay tareas asignadas</div>';
  tasksHTML+='</div>';
  
  var evalsHTML='<div class="dash-section"><h3 style="cursor:pointer" onclick="showEvalsOverlay()">'+ic('bar-chart-3',18)+' Últimas Evaluaciones '+ic('chevron-right',14)+'</h3>';
  if(myEvals.length){
    evalsHTML+='<div style="overflow-x:auto"><table class="dash-eval-table"><thead><tr><th>Fecha</th><th>AIM</th><th>Game Sense</th><th>Comms</th><th>Teamwork</th></tr></thead><tbody>'+
      myEvals.sort(function(a,b){return a.date<b.date?1:-1}).slice(0,5).map(function(e,i){
        return '<tr style="cursor:pointer" onclick="showEvalDetail('+i+')"><td>'+(e.date?new Date(e.date).toLocaleDateString('es-ES'):'—')+'</td><td>'+e.aim+'</td><td>'+e.game_sense+'</td><td>'+e.communication+'</td><td>'+e.teamwork+'</td></tr>';
      }).join('')+'</tbody></table></div>';
  }else evalsHTML+='<div style="padding:20px;text-align:center;color:#888">'+ic('clipboard',24)+'<br>Sin evaluaciones aún</div>';
  evalsHTML+='</div>';
  
  var notesHTML='<div class="dash-section"><h3 style="cursor:pointer" onclick="showNotesOverlay()">'+ic('message-square',18)+' Notas del Coach '+ic('chevron-right',14)+'</h3>';
  var myNotes=(DATA.coach_notes||[]).filter(function(n){return n.member_name===name});
  if(myNotes.length){
    notesHTML+=myNotes.sort(function(a,b){return a.created_at<b.created_at?1:-1}).slice(0,4).map(function(n){
      return '<div class="glass-card dash-note" style="cursor:pointer" onclick="showNotesOverlay()"><span class="date">'+(n.created_at?new Date(n.created_at).toLocaleDateString('es-ES'):'')+'</span><div class="cat">'+(n.category||'general')+'</div><div style="white-space:pre-wrap">'+esc(n.note||n.text||'')+'</div></div>';
    }).join('');
  }else notesHTML+='<div style="padding:20px;text-align:center;color:#888">'+ic('inbox',24)+'<br>Sin notas aún</div>';
  notesHTML+='</div>';
  
  var rankHTML='<div class="dash-section"><h3 style="cursor:pointer" onclick="showRankOverlay()">'+ic('trending-up',18)+' Progreso de Rango '+ic('chevron-right',14)+'</h3>';
  var rankHistory=(DATA.rank_history||[]).filter(function(r){return r.member_name===name});
  if(rankHistory.length){
    rankHTML+='<div class="dash-timeline" style="cursor:pointer" onclick="showRankOverlay()">'+rankHistory.sort(function(a,b){return a.date<b.date?1:-1}).slice(0,8).map(function(r,i){
      return '<div class="step">'+(i?ic('arrow-right',12)+' ':'')+'<span class="dot"></span><span>'+esc(r.rank)+'</span></div>';
    }).join('')+'</div>';
  }else rankHTML+='<div style="padding:20px;text-align:center;color:#888">'+ic('activity',24)+'<br>Sin historial de rango</div>';
  rankHTML+='</div>';
  
  var achsHTML='<div class="dash-section"><h3 style="cursor:pointer" onclick="showAchsOverlay()">'+ic('award',18)+' Logros Obtenidos '+ic('chevron-right',14)+'</h3>';
  var earnedAchs=myAchs.map(function(ma){return(DATA.achievements||[]).find(function(a){return a.id===ma.achievement_id})}).filter(function(a){return a});
  if(earnedAchs.length){
    achsHTML+='<div style="display:flex;flex-wrap:wrap;gap:8px;cursor:pointer" onclick="showAchsOverlay()">'+earnedAchs.map(function(a){
      return '<div class="glass-card" style="padding:10px 14px;font-size:13px;text-align:center" title="'+esc(a.description||'')+'">'+ic(a.icon||'trophy',20)+'<br>'+esc(a.name)+'</div>';
    }).join('')+'</div>';
  }else achsHTML+='<div style="padding:20px;text-align:center;color:#888">'+ic('star',24)+'<br>Aún no tienes logros</div>';
  achsHTML+='</div>';
  
  document.getElementById('dashContent').innerHTML=headerHTML+'<div class="dash-cards" style="margin-bottom:28px">'+statsHTML+'</div>'+tasksHTML+evalsHTML+notesHTML+rankHTML+achsHTML;
}

function renderDashClases(cid){
  var container=document.getElementById(cid||'dashContent');if(!container)return;
  var u=getLogin();var items=filterByCoach(filterByGroup(DATA.academy||[]));
  var dayOrder={Lunes:0,Martes:1,Miércoles:2,Jueves:3,Viernes:4,Sábado:5,Domingo:6};
  items.sort(function(a,b){return(dayOrder[a.day]||99)-(dayOrder[b.day]||99)});
  var html='<div class="dash-filters">'+buildFilterHTML('dash-clases',true,true,'onDashFilter()')+'</div>';
  html+='<div class="glass-card" style="padding:24px"><h3 style="margin:0 0 16px;font-size:18px">'+ic('graduation-cap',18)+' Clases de Academia</h3>';
  if(!items.length){html+='<div style="text-align:center;padding:24px;color:#555">'+ic('book',40)+'<br>No hay clases disponibles para tu grupo</div>';html+='</div>';container.innerHTML=html;return}
  html+=items.map(function(a,i){
    return '<div class="glass-card" style="padding:16px 20px;margin-bottom:10px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:12px;border-left:3px solid #8b5cf6" onclick="showAcademyDetail('+i+')">'+
      '<div style="flex:1;min-width:0"><div style="font-size:15px;font-weight:600;font-family:var(--font-display);color:#fff">'+esc(a.topic)+'</div>'+
      (a.coach?'<div style="font-size:12px;color:#888;margin-top:2px">'+ic('user',12)+' '+esc(a.coach)+'</div>':'')+'</div>'+
      '<div style="display:flex;align-items:center;gap:8px;flex-shrink:0"><span class="badge badge-purple">'+esc(a.day)+'</span><span style="color:#555;font-size:18px">›</span></div>'+
    '</div>';
  }).join('');
  html+='</div>';container.innerHTML=html;
}

function renderDashEvals(cid){
  var container=document.getElementById(cid||'dashContent');if(!container)return;
  var u=getLogin();var name=u?u.name:'';if(!name)return;
  var items=filterByCoach(DATA.evaluations||[]).filter(function(e){return e.member_name===name}).sort(function(a,b){return a.date<b.date?1:-1});
  var html='<div class="glass-card" style="padding:24px"><h3 style="margin:0 0 16px;font-size:18px">'+ic('bar-chart-3',18)+' Mis Evaluaciones</h3>';
  if(!items.length){html+='<div style="text-align:center;padding:24px;color:#555">'+ic('clipboard',40)+'<br>Sin evaluaciones aún</div>';html+='</div>';container.innerHTML=html;return}
  html+=items.map(function(e){
    return '<div class="glass-card" style="padding:16px;margin-bottom:10px;border-left:3px solid var(--neon)">'+
      '<div style="display:flex;justify-content:space-between;margin-bottom:8px"><span style="color:#888;font-size:12px">'+(e.date?new Date(e.date).toLocaleDateString('es-ES'):'')+'</span></div>'+
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:13px">'+
      '<span>AIM: <strong style="color:var(--neon)">'+e.aim+'</strong></span><span>Game Sense: <strong style="color:var(--neon)">'+e.game_sense+'</strong></span>'+
      '<span>Comms: <strong style="color:var(--neon)">'+e.communication+'</strong></span><span>Teamwork: <strong style="color:var(--neon)">'+e.teamwork+'</strong></span></div>'+
      (e.coach_notes?'<div style="margin-top:8px;padding:8px 12px;background:rgba(255,255,255,0.03);border-radius:6px;font-size:13px;color:#aaa;border-left:2px solid #555;white-space:pre-wrap">'+ic('message-square',12)+' '+esc(e.coach_notes)+'</div>':'')+'</div>';
  }).join('');
  html+='</div>';container.innerHTML=html;
}

function renderDashCoachNotes(cid){
  var container=document.getElementById(cid||'dashContent');if(!container)return;
  var u=getLogin();var name=u?u.name:'';if(!name)return;
  var items=filterByCoach(DATA.coach_notes||[]).filter(function(n){return n.member_name===name}).sort(function(a,b){return a.created_at<b.created_at?1:-1});
  var html='<div class="glass-card" style="padding:24px"><h3 style="margin:0 0 16px;font-size:18px">'+ic('message-square',18)+' Notas del Coach</h3>';
  if(!items.length){html+='<div style="text-align:center;padding:24px;color:#555">'+ic('inbox',40)+'<br>Sin notas aún</div>';html+='</div>';container.innerHTML=html;return}
  html+=items.map(function(n){
    return '<div class="glass-card" style="padding:14px 16px;margin-bottom:8px;border-left:3px solid var(--neon)">'+
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><span style="color:#888;font-size:12px">'+(n.created_at?new Date(n.created_at).toLocaleDateString('es-ES'):'')+'</span><span class="badge badge-purple">'+esc(n.category||'general')+'</span></div>'+
      '<div style="color:#ccc;font-size:14px;white-space:pre-wrap">'+esc(n.note||n.text||'')+'</div></div>';
  }).join('');
  html+='</div>';container.innerHTML=html;
}

function showNotesOverlay(){
  var u=getLogin();var name=u?u.name:'';if(!name)return;
  var notes=filterByCoach(DATA.coach_notes||[]).filter(function(n){return n.member_name===name}).sort(function(a,b){return a.created_at<b.created_at?1:-1});
  var h='<h3>'+ic('message-square',18)+' Todas las Notas del Coach</h3>';
  if(!notes.length){h+='<div style="padding:20px;text-align:center;color:#888">'+ic('inbox',40)+'<br>Sin notas aún</div>';showDetail(h);return}
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
  if(!evals.length){h+='<div style="padding:20px;text-align:center;color:#888">'+ic('clipboard',40)+'<br>Sin evaluaciones aún</div>';showDetail(h);return}
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
  var h='<h3>'+ic('bar-chart-3',18)+' Detalle de Evaluación</h3>'+
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
      (i?ic('arrow-right',12)+' ':'')+'<span class="badge badge-purple">'+esc(r.rank)+'</span>'+
      '<span style="color:#888;font-size:12px">'+(r.date?new Date(r.date).toLocaleDateString('es-ES'):'')+'</span></div>';
  });
  h+='</div>';showDetail(h);
}

function showAchsOverlay(){
  var u=getLogin();var name=u?u.name:'';if(!name)return;
  var myAchs=(DATA.member_achievements||[]).filter(function(ma){return ma.member_name===name});
  var earned=myAchs.map(function(ma){return(DATA.achievements||[]).find(function(a){return a.id===ma.achievement_id})}).filter(function(a){return a});
  var h='<h3>'+ic('award',18)+' Todos los Logros Obtenidos</h3>';
  if(!earned.length){h+='<div style="padding:20px;text-align:center;color:#888">'+ic('star',40)+'<br>Aún no tienes logros</div>';showDetail(h);return}
  h+='<div style="max-height:400px;overflow-y:auto;display:grid;gap:8px">';
  earned.forEach(function(a){
    h+='<div class="has-glow" style="display:flex;align-items:center;gap:12px;padding:12px 16px;background:rgba(255,255,255,0.03);border-radius:8px;border-left:3px solid var(--neon)">'+
      ic(a.icon||'trophy',24)+'<div><strong style="font-size:14px">'+esc(a.name)+'</strong>'+(a.description?'<div style="color:#888;font-size:12px;margin-top:2px">'+esc(a.description)+'</div>':'')+'</div></div>';
  });
  h+='</div>';showDetail(h);
}
function renderDashTasks(cid){
  var container=document.getElementById(cid||'dashContent');if(!container)return;
  var items=filterByCoach(filterByGroup(DATA.tasks||[]));
  var u=getLogin();var name=u?u.name:'';
  var html='<div class="dash-filters">'+buildFilterHTML('dash-tasks',true,true,'onDashFilter()')+'</div>';
  html+='<div class="glass-card" style="padding:24px"><h3 style="margin:0 0 16px;font-size:18px">'+ic('check-square',18)+' Tareas</h3>';
  if(!name){html+='<div style="text-align:center;padding:24px;color:#555">'+ic('log-in',40)+'<br>Inicia sesión para ver tus tareas</div>';html+='</div>';container.innerHTML=html;return}
  if(!items.length){html+='<div style="text-align:center;padding:24px;color:#555">'+ic('check-square',40)+'<br>No hay tareas asignadas</div>';html+='</div>';container.innerHTML=html;return}
  html+=items.map(function(t){
    var completed=(DATA.task_completions||[]).filter(function(tc){return tc.task_id===t.id&&tc.member_name===name});
    var done=completed.length>0;
    return '<div class="glass-card" style="padding:14px 18px;margin-bottom:8px;display:flex;align-items:center;justify-content:space-between;gap:12px;cursor:pointer;'+(done?'opacity:0.5':'')+'" onclick="showTaskDetail(\''+t.id+'\')">'+
      '<div style="flex:1;min-width:0"><div style="font-size:14px;font-weight:600;color:#fff">'+esc(t.title)+'</div>'+
      '<div style="font-size:12px;color:#888;margin-top:2px">'+(t.type?esc(t.type):'')+(t.due_date?' · '+esc(t.due_date):'')+(t.coach?' · '+ic('user',11)+' '+esc(t.coach):'')+'</div></div>'+
      '<div style="display:flex;align-items:center;gap:8px;flex-shrink:0">'+
        (done?'<span class="badge badge-green">'+ic('check',12)+' Hecho</span>':'<span class="badge badge-gray">Pendiente</span>')+
        '<span style="color:#555;font-size:18px">›</span></div>'+
    '</div>';
  }).join('');
  html+='</div>';
  container.innerHTML=html;
}

function renderDashMaterials(cid){
  var container=document.getElementById(cid||'dashContent');if(!container)return;
  var html='<div class="materials-filter" style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px">'+
    '<input class="input-field" id="dashMatSearch" placeholder="Buscar materiales..." oninput="renderDashMaterials(\''+cid+'\')" style="flex:1;min-width:180px">'+
    '<select class="input-field" id="dashMatType" onchange="renderDashMaterials(\''+cid+'\')" style="max-width:160px">'+
      '<option value="">Todos</option><option value="video">Video</option><option value="guide">Guía</option><option value="pdf">PDF</option><option value="other">Otro</option>'+
    '</select></div><div id="dashMatGrid"></div>';
  container.innerHTML=html;
  var grid=document.getElementById('dashMatGrid');
  if(!grid)return;
  var items=filterByCoach(filterByGroup(DATA.materials||[]));
  var search=(document.getElementById('dashMatSearch')?.value||'').toLowerCase();
  var typeFilter=document.getElementById('dashMatType')?.value||'';
  if(typeFilter)items=items.filter(function(m){return m.type===typeFilter});
  if(search)items=items.filter(function(m){return (m.title||'').toLowerCase().includes(search)||(m.description||'').toLowerCase().includes(search)});
  if(!items.length){grid.innerHTML='<div style="text-align:center;padding:40px;color:#555">'+ic('book',48)+'<br>No se encontraron materiales</div>';return}
  var typeIcons={video:'film',guide:'file-text',pdf:'file',other:'file'};
  var typeColors={video:'#8B5CF6',guide:'#8b5cf6',pdf:'#8b5cf6',other:'#888'};
  grid.innerHTML=items.map(function(m){
    return '<div class="glass-card" style="overflow:hidden;margin-bottom:10px">'+
      (m.image_url?'<img src="'+esc(m.image_url)+'" alt="" style="width:100%;height:140px;object-fit:cover;cursor:pointer" onclick="event.stopPropagation();showImageOverlay(this.src,this.alt)">':'')+
      '<div style="padding:16px 20px;border-left:2px solid '+(typeColors[m.type]||'#888')+'"><div style="display:flex;justify-content:space-between;align-items:start"><h3 style="font-size:16px;font-family:var(--font-display);margin-bottom:4px">'+esc(m.title)+'</h3><span class="badge" style="background:'+(typeColors[m.type]||'#888')+'22;color:'+(typeColors[m.type]||'#888')+';border-color:'+(typeColors[m.type]||'#888')+'44;flex-shrink:0;margin-left:8px">'+ic(typeIcons[m.type]||'file',12)+' '+esc(m.type)+'</span></div>'+
      (m.description?'<p style="color:#888;font-size:14px;line-height:1.5;white-space:pre-wrap">'+esc(m.description)+'</p>':'')+
      (m.coach?'<div style="font-size:12px;color:#888;margin-top:4px">'+ic('user',11)+' '+esc(m.coach)+'</div>':'')+
      '<div style="display:flex;gap:8px;margin-top:10px">'+(m.url?'<a href="'+esc(m.url)+'" target="_blank" class="btn-sm primary" onclick="event.stopPropagation()">'+ic('external-link',12)+' Abrir</a>':'')+
      (m.attachment_url?'<a href="'+esc(m.attachment_url)+'" target="_blank" class="btn-sm secondary" onclick="event.stopPropagation()">'+ic('download',12)+' '+esc(m.attachment_name||'Descargar')+'</a>':'')+'</div></div></div>';
  }).join('');
}

function renderDashQuizzes(cid){
  var container=document.getElementById(cid||'dashContent');if(!container)return;
  var items=filterByCoach(filterByGroup(DATA.quizzes||[]));
  var u=getLogin();var member=u?u.name:'';
  var html='<div class="dash-filters">'+buildFilterHTML('dash-quizzes',true,true,'onDashFilter()')+'</div><div id="dashQuizList">';
  if(!items.length){html+='<div style="text-align:center;padding:40px;color:#555">'+ic('help-circle',48)+'<br>No hay quizzes disponibles</div>';html+='</div>';container.innerHTML=html;return}
  items.forEach(function(q){
    var answered=(DATA.quiz_responses||[]).find(function(r){return r.quiz_id===q.id&&r.member_name===member});
    html+='<div class="glass-card" style="padding:20px;margin-bottom:14px"><h3 style="margin:0 0 4px;font-size:16px">'+esc(q.title)+'</h3><p style="margin:0 0 8px;font-size:13px;color:#888">'+(q.description||'')+'</p>'+(answered?'<span style="background:#8b5cf620;color:#8b5cf6;padding:4px 12px;border-radius:20px;font-size:12px;display:inline-block;margin-bottom:8px">'+Math.round(answered.score)+'%</span>':'')+'<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><span style="font-size:12px;color:#888">'+(q.questions||[]).length+' preguntas</span>'+(q.coach?'<span style="font-size:12px;color:#888">'+ic('user',11)+' '+esc(q.coach)+'</span>':'')+'<button class="btn-sm primary" onclick="startDashQuiz(\''+q.id+'\')" style="margin-left:auto">'+(answered?'Reintentar':'Comenzar')+'</button></div></div>';
  });
  html+='</div>';
  container.innerHTML=html;
}

function startDashQuiz(id){
  var quiz=DATA.quizzes.find(function(q){return q.id===id});
  if(!quiz){toast('Quiz no encontrado','err');return}
  var qs=quiz.questions||[];
  var cid=document.getElementById('quizzesContent')?'quizzesContent':'dashContent';
  var html='<button class="btn-sm secondary" onclick="renderDashQuizzes(\''+cid+'\')" style="margin-bottom:16px"><i data-lucide="arrow-left" style="width:14px;height:14px"></i> Volver</button><div class="glass-card" style="padding:24px"><h3 style="margin:0 0 4px;font-size:18px">'+esc(quiz.title)+'</h3><p style="margin:0 0 16px;font-size:13px;color:#888">'+(quiz.description||'')+'</p>';
  qs.forEach(function(q,i){
    html+='<div class="has-glow" style="margin-bottom:18px;padding:16px;background:#ffffff08;border-radius:10px;border:1px solid #ffffff15" id="dqrow_'+i+'"><p style="margin:0 0 10px;font-size:14px;font-weight:600">'+(i+1)+'. '+esc(q.text)+'</p>';
    (q.options||[]).forEach(function(o,j){
      html+='<label style="display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:8px;margin-bottom:4px;cursor:pointer;background:#ffffff08" id="dqlabel_'+i+'_'+j+'"><input type="radio" name="dquiz_'+i+'" value="'+j+'" onchange="document.getElementById(\'dqexp_'+i+'\').style.display=\'none\'"><span>'+esc(o)+'</span></label>';
    });
    html+='<div id="dqexp_'+i+'" style="display:none;margin-top:8px;padding:8px 12px;border-radius:6px;font-size:12px"></div></div>';
  });
  html+='<button class="btn-primary" onclick="submitDashQuiz(\''+id+'\')" style="width:100%;justify-content:center"><i data-lucide="check" style="width:16px;height:16px"></i> Enviar Respuestas</button></div>';
  var container=document.getElementById('quizzesContent')||document.getElementById('dashContent');
  if(container)container.innerHTML=html;
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
      if(expDiv){expDiv.style.display='block';expDiv.style.background='#8b5cf620';expDiv.style.color='#8b5cf6';expDiv.textContent='✓ Correcto'+(q.explanation?' — '+q.explanation:'')}
    }else{
      if(expDiv){expDiv.style.display='block';expDiv.style.background='#8b5cf620';expDiv.style.color='#8b5cf6';expDiv.textContent='✗ Incorrecto. Respuesta correcta: '+(q.options[q.correct]||'N/A')+(q.explanation?' — '+q.explanation:'')}
    }
  });
  var score=Math.round(correct/total*100);
  var u=getLogin();
  var member=u?u.name:'Anónimo';
  var existing=DATA.quiz_responses.findIndex(function(r){return r.quiz_id===id&&r.member_name===member});
  var resp={quiz_id:id,member_name:member,score:score,answers:qs.map(function(q,i){var sel=document.querySelector('input[name="dquiz_'+i+'"]:checked');return sel?parseInt(sel.value):-1}),completed_at:new Date().toISOString()};
  if(existing>=0){DATA.quiz_responses[existing]={...DATA.quiz_responses[existing],...resp}}else{resp.id=uid();DATA.quiz_responses.push(resp)}
  saveLocal(DATA);
  var qc=document.getElementById('quizzesContent')||document.getElementById('dashContent');
  if(qc)qc.insertAdjacentHTML('afterbegin','<div class="has-glow" style="text-align:center;padding:16px;margin-bottom:16px;background:#ffffff10;border-radius:10px;border:1px solid '+(score>=70?'#8b5cf6':'#8b5cf6')+'40"><strong style="font-size:18px">'+(score>=70?ic('party-popper',20):ic('dumbbell',20))+' Puntaje: '+score+'% ('+correct+'/'+total+')</strong></div>');
}

function renderDashCurriculum(cid){
  var container=document.getElementById(cid||'dashContent');if(!container)return;
  var items=filterByCoach(filterByGroup(DATA.curriculum||[]));
  if(!items.length){container.innerHTML='<div class="dash-filters">'+buildFilterHTML('dash-curriculum',true,true,'onDashFilter()')+'</div><div style="text-align:center;padding:40px;color:#555">'+ic('book-open',48)+'<br>No hay plan de estudios disponible</div>';return}
  var html=items.sort(function(a,b){return a.week-b.week}).map(function(c,i){
    var topics;try{topics=typeof c.topics==='string'?JSON.parse(c.topics||'[]'):(c.topics||[])}catch(e){topics=[]}
    return '<div class="glass-card" style="padding:20px;border-left:4px solid '+(c.color||'#8B5CF6')+';cursor:pointer;margin-bottom:12px" onclick="showCurriculumDetail('+i+')">'+
      (c.image_url?'<img src="'+esc(c.image_url)+'" alt="" style="width:100%;max-height:160px;object-fit:cover;border-radius:8px;margin-bottom:10px;cursor:pointer" onclick="event.stopPropagation();showImageOverlay(this.src,this.alt)">':'')+
      '<div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:10px"><div><span class="badge badge-purple">Semana '+c.week+'</span><h3 style="margin:8px 0 4px;font-size:18px">'+esc(c.title)+'</h3></div></div>'+
      (c.description?'<p style="color:#888;font-size:14px;white-space:pre-wrap">'+esc(c.description)+'</p>':'')+
      (c.coach?'<div style="font-size:12px;color:#888;margin-top:6px">'+ic('user',11)+' '+esc(c.coach)+'</div>':'')+
      (topics.length?'<div style="margin-top:10px;display:grid;gap:6px">'+topics.map(function(t){return'<div style="display:flex;align-items:center;gap:8px;font-size:13px;color:#ccc">'+ic('chevron-right',12)+' '+esc(t)+'</div>'}).join('')+'</div>':'')+
    '</div>';
  }).join('');
  container.innerHTML='<div class="dash-filters">'+buildFilterHTML('dash-curriculum',true,true,'onDashFilter()')+'</div>'+html;
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
    '<div class="meta"><span>'+ic('tag',14)+' '+esc(t.type||'')+'</span>'+(t.due_date?'<span>'+ic('calendar',14)+' Vence: '+esc(t.due_date)+'</span>':'')+'<span>'+(done?'<span style="color:#8b5cf6">'+ic('check-circle',14)+' Completada</span>':'<span style="color:#888">Pendiente</span>')+'</span></div>'+
    (t.description?'<div class="body-text" style="margin-top:12px">'+esc(t.description)+'</div>':'')+
    (t.attachment_url?'<a href="'+esc(t.attachment_url)+'" target="_blank" class="attach-link" onclick="event.stopPropagation()">'+ic('paperclip',16)+' '+esc(t.attachment_name||'Descargar archivo')+'</a>':'')+
    '<button class="btn-primary" onclick="toggleTaskCompletion(\''+taskId+'\');closeDetail();renderDashTasks(\'tasksContent\')" style="width:100%;justify-content:center;margin-top:16px">'+(done?ic('x',16)+' Desmarcar':ic('check',16)+' Marcar como hecha')+'</button>');
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
}

// ========== INIT HELPERS ==========
function safeRender(fn,name){try{fn()}catch(e){console.log('Render error ['+name+']:',e)}}

function renderAll(){
  safeRender(renderFooter,'footer');
  var sectionFns={'profile':renderProfile,'schedule':renderSchedule,'academy':renderAcademy,'team':renderTeam,'scrims':renderScrims,'stats':renderStats,'news':renderNews,'members':renderMembers,'dashboard':renderDashboard,'announcements':renderAnnouncements,'substitutions':renderSubstitutions};
  Object.keys(sectionFns).forEach(function(id){
    if(document.getElementById('section-'+id))safeRender(sectionFns[id],id);
  });
  if(typeof lucide!=='undefined')lucide.createIcons();
  document.querySelectorAll('.scrim-list,.team-grid,.member-grid,.news-grid,.stats-grid,.cards-grid,.schedule-grid,.group-cards').forEach(animateGrid);
}

function reRenderTable(table){
  if(table==='content'||table==='home'){renderFooter();if(typeof lucide!=='undefined')lucide.createIcons();return}
  if(table==='schedule'&&document.getElementById('scheduleBubbles'))renderSchedule();
  else if(table==='team'&&document.getElementById('teamContainer'))renderTeam();
  else if(table==='scrims'&&document.getElementById('scrimStats'))renderScrims();
  else if(table==='members'&&document.getElementById('membersGrid'))renderMembers();
  else if(table==='news'&&document.getElementById('newsGrid'))renderNews();
  else if(table==='academy'){if(document.getElementById('academyGrid'))renderAcademy();var d=document.getElementById('section-dashboard');if(d&&d.style.display!=='none')renderDashContent();}
  else if(table==='announcements'&&document.getElementById('announcementsList'))renderAnnouncements();
  else if(table==='substitutions'&&document.getElementById('substitutionsList'))renderSubstitutions();
  else if(document.getElementById('dashContent'))renderDashboard();
  if(typeof lucide!=='undefined')lucide.createIcons();
  document.querySelectorAll('.scrim-list,.team-grid,.member-grid,.news-grid,.stats-grid,.cards-grid,.schedule-grid,.group-cards').forEach(animateGrid);
}
async function initDB(){
  try{
    if(!db)db=supabase.createClient(SB,ANON);
    var {error}=await db.from('schedule').select('id',{count:'exact',head:true});
    if(error)throw error;
    
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
    if(con.data){var o={};con.data.forEach(function(c){o[c.key]=c.value});if(!DATA.content||!DATA.content.home)DATA.content={home:{}};DATA.content.home=Object.assign({},DATA.content.home,o)}
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
    
    if((!sch.data||!sch.data.length)&&DATA.schedule.length&&!localStorage.getItem('qsr_sched_migrated')){
      DATA.schedule=DATA.schedule.map(function(s){s.day=(s.day+6)%7;return s});
      localStorage.setItem('qsr_sched_migrated','1');
    }
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
    
    try{
      var pending;try{pending=JSON.parse(localStorage.getItem('qsr_pending_apps')||'[]')}catch(e){pending=[]}
      if(pending.length){pending.forEach(function(app){db.from('applications').insert(app).then(function(){}).catch(function(){})});localStorage.removeItem('qsr_pending_apps')}
    }catch(e){}
    saveLocal(DATA);
    renderAll();
    applyVisibility();
    document.getElementById('dbStatus').innerHTML='<i data-lucide="wifi" style="width:12px;height:12px;vertical-align:middle"></i> <span>conectado</span>';document.getElementById('dbStatus').className='online';if(typeof lucide!=='undefined')lucide.createIcons();
    _dbFailed=false;
    
    rtChannel=db.channel('public-changes')
      .on('postgres_changes',{event:'*',schema:'public'},async function(payload){
        var table=payload.table;
        if(table==='content'||table==='sections'){
          var{data}=await db.from(table).select('*');
          if(table==='content'&&data){var o={};data.forEach(function(c){o[c.key]=c.value});if(!DATA.content||!DATA.content.home)DATA.content={home:{}};DATA.content.home=Object.assign({},DATA.content.home,o);renderAll()}
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
    document.getElementById('dbStatus').innerHTML='<i data-lucide="wifi-off" style="width:12px;height:12px;vertical-align:middle"></i> <span>sin conexi&oacute;n</span>';document.getElementById('dbStatus').className='offline';if(typeof lucide!=='undefined')lucide.createIcons();
    renderAll();
    _dbFailed=true;
  }
  if(_dbFailed)setTimeout(initDB,30000);
}

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

function showLoginOverlay(){
  var ov=document.getElementById('loginOverlay');
  if(ov){ov.classList.remove('hidden');ov.style.display='';document.body.style.overflow='hidden';setTimeout(function(){var inp=document.getElementById('loginInput');if(inp)inp.focus()},100)}
}

// ========== INIT ==========
(async function(){
  var com=isCommunity();
  if(typeof lucide!=='undefined')lucide.createIcons();
  await initDB();
  if(com){
    applyVisibility();
    initParticles();
    initRipple();
    showSection('team');
    hideLoading();
    return;
  }
  if(isLoggedIn()){
    updateLoginBadge();
  }else{
    showLoginOverlay();
  }
  applyVisibility();
  initParticles();
  initRipple();
  if(isLoggedIn())showSection('profile');
  hideLoading();
})();
