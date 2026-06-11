// ========== RENDER HERO ==========
function renderHero(){
  var c=DATA.content.home||{};
  var h=document.getElementById('heroContent');
  h.innerHTML=
    '<img src="'+esc(c.logo_url||'/QU4SAR.png')+'" alt="QU4SAR" style="max-width:300px;max-height:300px;width:auto;height:auto;margin-bottom:36px;animation:float 8s ease-in-out infinite">'+
    '<h1><span class="gradient-text">'+esc(c.hero_title||'QU4SAR')+'</span></h1>'+
    '<p>'+esc(c.hero_subtitle||'Organización competitiva de Valorant Premier')+'</p>'+
    (c.hero_desc?'<p style="color:#888;font-size:15px;max-width:600px;margin:0 auto">'+esc(c.hero_desc)+'</p>':'')+
    '<p class="tagline">'+esc(c.site_tagline||'Academia · Scrims · Creación de contenido · Esports de alto nivel')+'</p>';
}
// ========== RENDER FOOTER ==========
function renderFooter(){
  var c=DATA.content.home||{};
  var f=document.getElementById('footerSocial');
  if(!f)return;
  var links=[{k:'social_twitch',l:'Twitch',i:ic('twitch',16)},{k:'social_youtube',l:'YouTube',i:ic('youtube',16)},{k:'social_twitter',l:'Twitter',i:ic('twitter',16)},{k:'social_instagram',l:'Instagram',i:ic('instagram',16)}];
  f.innerHTML=links.filter(function(l){return c[l.k]}).map(function(l){return'<a href="'+esc(c[l.k])+'" target="_blank" title="'+l.l+'">'+l.i+'</a>'}).join('');
}
// ========== RENDER SCHEDULE BUBBLES ==========
function renderSchedule(){
  ensureFilters('schedule',true,true,'scheduleBubbles');
  var items=DATA.schedule||[];
  items=filterByCoach(filterByGroup(items));
  var days=['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
  var container=document.getElementById('scheduleBubbles');
  if(!items.length){container.innerHTML='<div style="text-align:center;padding:40px;color:#555">'+ic('calendar',48)+'<br>No hay horarios disponibles</div>';return}

  var dotColors=['#8b5cf6','#f97316','#eab308','#8b5cf6','#3b82f6','#8b5cf6','#a78bfa'];
  var html='';
  for(var d=0;d<7;d++){
    var dayEvents=items.filter(function(e){return e.day===d});
    if(!dayEvents.length)continue;
    html+='<div class="has-glow schedule-day-group"><div class="schedule-day-header"><span class="dot" style="background:'+dotColors[d]+'"></span>'+days[d]+'</div><div class="schedule-bubble-row">'+
      dayEvents.map(function(e){return'<div class="schedule-event '+e.type+'"><span class="title">'+esc(e.title)+'</span><span class="time">'+e.start+' - '+e.end+'</span>'+(e.coach?'<span style="font-size:11px;opacity:0.6;margin-top:2px">'+ic('user',11)+' '+esc(e.coach)+'</span>':'')+'</div>'}).join('')+
    '</div></div>';
  }
  if(!html)html='<div style="text-align:center;padding:40px;color:#555">'+ic('calendar',48)+'<br>No hay horarios disponibles</div>';
  container.innerHTML=html;
  if(typeof lucide!=='undefined')lucide.createIcons();
}

// ========== RENDER ACADEMY ==========
function renderAcademy(){
  ensureFilters('academy',true,true,'academyGrid');
  var g=document.getElementById('academyGrid');
  var items=DATA.academy||[];
  items=filterByCoach(filterByGroup(items));
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
// ========== RENDER SCRIMS ==========
function renderScrims(){
  ensureFilters('scrims',true,true,'scrimStats');
  var sc=DATA.scrims||[];
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
  ensureFilters('stats',true,true,'statsGrid');
  var sc=DATA.scrims||[];
  sc=filterByCoach(filterByGroup(sc));
  var s=sc.reduce(function(a,c){return{matches:a.matches+(c.result==='Victoria'||c.result==='Derrota'?1:0),wins:a.wins+(c.result==='Victoria'?1:0),losses:a.losses+(c.result==='Derrota'?1:0),mvps:a.mvps}},{matches:0,wins:0,losses:0,mvps:0});
  var wr=s.matches?Math.round(s.wins/s.matches*100):0;
  document.getElementById('statsGrid').innerHTML='<div class="glass-card stat-card"><div class="icon">'+ic('gamepad-2',40)+'</div><div class="number gradient-text">'+s.matches+'</div><div class="label">Partidas</div></div><div class="glass-card stat-card"><div class="icon" style="color:#8b5cf6">'+ic('check-circle',40)+'</div><div class="number" style="color:#8b5cf6">'+s.wins+'</div><div class="label">Victorias</div></div><div class="glass-card stat-card"><div class="icon" style="color:#8b5cf6">'+ic('x-circle',40)+'</div><div class="number" style="color:#8b5cf6">'+s.losses+'</div><div class="label">Derrotas</div></div><div class="glass-card stat-card"><div class="icon">'+ic('bar-chart-3',40)+'</div><div class="number gradient-text">'+wr+'%</div><div class="label">Win Rate</div></div>';
}

// ========== RENDER NEWS ==========
function renderNews(){
  ensureFilters('news',true,true,'newsGrid');
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
  if(!filter)ensureFilters('members',true,false,'membersGrid');
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
