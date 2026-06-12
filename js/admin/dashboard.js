// ========== ADMIN DASHBOARD ==========

function renderSection_dashboard(){
  var coachName=currentUser&&currentUser.coachName;
  if(coachName&&!isCurrentUserAdmin()){
    renderCoachDashboard(coachName);
    return;
  }
  renderAdminDashboard();
}

function renderCoachDashboard(coachName){
  var coach=(DATA.coaches||[]).find(function(c){return c.name===coachName||c.nickname===coachName});
  var gIds=(DATA.group_coaches||[]).filter(function(gc){return gc.coach_id===(coach?coach.id:'')}).map(function(gc){return gc.group_id});
  var groups=(DATA.groups||[]).filter(function(g){return gIds.indexOf(g.id)>=0});
  var members=filterByCurrentCoach(DATA.members||[]);
  var memberCount=members.length;
  var tasks=filterByCurrentCoach(DATA.tasks||[]);
  var evals=filterByCurrentCoach(DATA.evaluations||[]);
  var activeTasks=tasks.filter(function(t){return t.due_date&&new Date(t.due_date)>=new Date()}).length;
  var recentEvals=evals.sort(function(a,b){return(a.date||'')<(b.date||'')?1:-1}).slice(0,5);
  var s=filterByCurrentCoach(DATA.scrims||[]);
  var t=s.length,w=s.filter(function(s){return s.result==='Victoria'}).length,l=s.filter(function(s){return s.result==='Derrota'}).length,wr=t?Math.round(w/t*100):0;

  var avatar=(coach?coach.avatar:'')||'';
  var html=
    '<div class="profile-wrap" style="max-width:800px;margin:0 auto">'+
      '<div class="glass-card" style="padding:0;overflow:hidden;margin-bottom:16px">'+
        '<div style="background:linear-gradient(135deg,rgba(139,92,246,0.15),rgba(45,10,82,0.4));padding:32px 28px 24px;text-align:center;position:relative">'+
          '<div style="width:88px;height:88px;border-radius:50%;margin:0 auto 14px;background:rgba(139,92,246,0.12);display:flex;align-items:center;justify-content:center;overflow:hidden;border:2px solid rgba(139,92,246,0.2)">'+
            (avatar?'<img src="'+esc(avatar)+'" alt="" style="width:100%;height:100%;object-fit:cover">':ic('user-check',36))+
          '</div>'+
          '<div style="font-size:22px;font-weight:700;font-family:var(--font-display);margin-bottom:4px">'+esc(coach?coach.name:coachName)+'</div>'+
          '<div style="font-size:13px;color:#a78bfa">'+(coach?esc(coach.specialty||'Coach'):'Coach')+'</div>'+
          '<div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin-top:8px">'+
            '<span class="badge badge-green">Coach</span>'+
            (coach&&coach.status==='active'?'<span class="badge badge-purple">Activo</span>':'<span class="badge badge-gray">Inactivo</span>')+
          '</div>'+
        '</div>'+
        '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:1px;background:rgba(139,92,246,0.04)">'+
          '<div class="profile-stat-cell"><div class="psc-val">'+memberCount+'</div><div class="psc-lbl">Miembros</div></div>'+
          '<div class="profile-stat-cell"><div class="psc-val">'+activeTasks+'</div><div class="psc-lbl">Tareas Activas</div></div>'+
          '<div class="profile-stat-cell"><div class="psc-val">'+evals.length+'</div><div class="psc-lbl">Evaluaciones</div></div>'+
          '<div class="profile-stat-cell"><div class="psc-val">'+wr+'%</div><div class="psc-lbl">Win Rate</div></div>'+
          '<div class="profile-stat-cell"><div class="psc-val">'+groups.length+'</div><div class="psc-lbl">Grupos</div></div>'+
        '</div>'+
      '</div>'+
      '<div class="glass-card" style="padding:20px 24px;margin-bottom:16px">'+
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">'+
          '<div><div style="font-size:11px;color:#666;text-transform:uppercase;letter-spacing:0.3px;margin-bottom:2px">Email</div><div style="color:#f0f0f0;font-weight:500;font-size:14px">'+esc(coach?coach.email||'—':'—')+'</div></div>'+
          '<div><div style="font-size:11px;color:#666;text-transform:uppercase;letter-spacing:0.3px;margin-bottom:2px">Nickname VALORANT</div><div style="color:var(--neon-light)">'+esc(coach?coach.nickname||'—':'—')+'</div></div>'+
          '<div><div style="font-size:11px;color:#666;text-transform:uppercase;letter-spacing:0.3px;margin-bottom:2px">Discord</div><div style="color:#f0f0f0">'+esc(coach?coach.discord||'—':'—')+'</div></div>'+
          '<div><div style="font-size:11px;color:#666;text-transform:uppercase;letter-spacing:0.3px;margin-bottom:2px">Especialidad</div><div style="color:#f0f0f0">'+esc(coach?coach.specialty||'—':'—')+'</div></div>'+
        '</div>'+
        (coach&&coach.description?'<div style="margin-top:16px;padding-top:16px;border-top:1px solid rgba(139,92,246,0.06)"><div style="font-size:11px;color:#666;text-transform:uppercase;letter-spacing:0.3px;margin-bottom:6px">Descripción</div><div style="color:#bbb;font-size:14px;line-height:1.6">'+esc(coach.description)+'</div></div>':'')+
      '</div>'+
      (groups.length?'<div class="glass-card" style="padding:20px 24px;margin-bottom:16px"><div style="font-size:11px;color:#666;text-transform:uppercase;letter-spacing:0.3px;margin-bottom:10px">Grupos Asignados</div><div style="display:flex;flex-wrap:wrap;gap:8px">'+groups.map(function(g){return'<span class="badge badge-purple" style="font-size:12px;padding:5px 14px">'+esc(g.name)+'</span>'}).join('')+'</div></div>':'')+
      (members.length?'<div class="glass-card" style="padding:20px 24px;margin-bottom:16px"><div style="font-size:11px;color:#666;text-transform:uppercase;letter-spacing:0.3px;margin-bottom:10px">Miembros ('+memberCount+')</div><div style="display:grid;gap:6px">'+members.map(function(m){return'<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:rgba(139,92,246,0.03);border-radius:8px"><div style="width:28px;height:28px;border-radius:50%;background:rgba(139,92,246,0.08);display:flex;align-items:center;justify-content:center;flex-shrink:0">'+ic('user',14)+'</div><div style="flex:1;font-size:13px;font-weight:500">'+esc(m.name)+'</div><div style="font-size:11px;color:#888">'+esc(m.role||'')+'</div><div style="font-size:11px;color:#666">'+esc(m.rank||'')+'</div></div>'}).join('')+'</div></div>':'')+
    '</div>'+
    (recentEvals.length?'<div class="glass-card" style="padding:20px 24px;margin-bottom:16px"><div style="font-size:11px;color:#666;text-transform:uppercase;letter-spacing:0.3px;margin-bottom:10px">Últimas Evaluaciones</div><div style="overflow-x:auto"><table class="admin-table"><thead><tr><th>Miembro</th><th>AIM</th><th>GS</th><th>Comms</th><th>TW</th><th>Fecha</th></tr></thead><tbody>'+
      recentEvals.map(function(e){return'<tr><td>'+esc(e.member_name||'')+'</td><td>'+e.aim+'</td><td>'+e.game_sense+'</td><td>'+e.communication+'</td><td>'+e.teamwork+'</td><td style="font-size:11px;color:#666">'+(e.date?new Date(e.date).toLocaleDateString('es-ES'):'')+'</td></tr>'}).join('')+'</tbody></table></div></div>':'')+
    '<div class="glass-card info-card"><h3 style="font-family:var(--font-display);font-size:15px;margin-bottom:12px">'+ic('zap',16)+' Acciones Rápidas</h3>'+
    '<div style="display:flex;flex-wrap:wrap;gap:8px">'+
      '<button class="btn-sm save quick-nav" onclick="syncToDB()">'+ic('refresh-cw',14)+' Forzar Sync</button>'+
      '<a class="btn-sm save quick-nav" href="gestion.html" style="text-decoration:none;display:inline-flex;align-items:center;gap:5px">'+ic('trophy',14)+' Gestión</a>'+
      '<a class="btn-sm save quick-nav" href="academia.html" style="text-decoration:none;display:inline-flex;align-items:center;gap:5px">'+ic('calendar',14)+' Academia</a>'+
      '<a class="btn-sm save quick-nav" href="comunicacion.html" style="text-decoration:none;display:inline-flex;align-items:center;gap:5px">'+ic('newspaper',14)+' Comunicación</a>'+
      '<a class="btn-sm save quick-nav" href="operaciones.html" style="text-decoration:none;display:inline-flex;align-items:center;gap:5px">'+ic('user-plus',14)+' Operaciones</a>'+
      '<a class="btn-sm save quick-nav" href="logros.html" style="text-decoration:none;display:inline-flex;align-items:center;gap:5px">'+ic('award',14)+' Logros</a>'+
      '<a class="btn-sm save quick-nav" href="sistema.html" style="text-decoration:none;display:inline-flex;align-items:center;gap:5px">'+ic('file-text',14)+' Sistema</a>'+
    '</div></div>';

  document.getElementById('adminContent').innerHTML=html;
  if(typeof lucide!=='undefined')lucide.createIcons();
}

function renderAdminDashboard(){
  var nw=(DATA.news||[]).length;
  var s=filterByCurrentCoach(DATA.scrims||[]);
  var t=s.length,w=s.filter(function(s){return s.result==='Victoria'}).length,l=s.filter(function(s){return s.result==='Derrota'}).length,wr=t?Math.round(w/t*100):0;
  document.getElementById('adminContent').innerHTML='<div class="dash-cards">'+[
    {n:nw,l:'Noticias',c:'#3b82f6, #2563eb',i:ic('newspaper',18)},
    {n:(DATA.schedule||[]).length,l:'Horarios',c:'#10b981, #059669',i:ic('calendar',18)},
    {n:(DATA.team||[]).length,l:'Jugadores',c:'#8b5cf6, #7c3aed',i:ic('trophy',18)},
    {n:t,l:'Scrims',c:'#f97316, #ea580c',i:ic('crosshair',18)},
    {n:(DATA.members||[]).length,l:'Miembros',c:'#14b8a6, #0d9488',i:ic('users',18)},
    {n:(DATA.stats||[]).length,l:'Stats',c:'#6366f1, #4f46e5',i:ic('bar-chart-3',18)},
    {n:(DATA.academy||[]).length,l:'Academia',c:'#eab308, #ca8a04',i:ic('graduation-cap',18)},
    {n:(DATA.announcements||[]).length,l:'Anuncios',c:'#a78bfa, #8b5cf6',i:ic('megaphone',18)},
  ].map(function(c){return'<div class="glass-card dash-card"><div class="glow" style="background:linear-gradient(135deg,'+c.c+')"></div><div class="num gradient-text">'+c.n+'</div><div class="lbl"><span class="icon">'+c.i+'</span> '+c.l+'</div></div>'}).join('')+'</div>'+
  '<div class="glass-card info-card" style="margin-top:16px"><h3 style="font-family:var(--font-display);font-size:15px;margin-bottom:12px">'+ic('zap',16)+' Acciones Rápidas</h3>'+
    '<div style="display:flex;flex-wrap:wrap;gap:8px">'+
      '<button class="btn-sm save quick-nav" onclick="syncToDB()">'+ic('refresh-cw',14)+' Forzar Sync</button>'+
      '<a class="btn-sm save quick-nav" href="gestion.html" style="text-decoration:none;display:inline-flex;align-items:center;gap:5px">'+ic('trophy',14)+' Gestión</a>'+
      '<a class="btn-sm save quick-nav" href="academia.html" style="text-decoration:none;display:inline-flex;align-items:center;gap:5px">'+ic('calendar',14)+' Academia</a>'+
      '<a class="btn-sm save quick-nav" href="comunicacion.html" style="text-decoration:none;display:inline-flex;align-items:center;gap:5px">'+ic('newspaper',14)+' Comunicación</a>'+
      '<a class="btn-sm save quick-nav" href="operaciones.html" style="text-decoration:none;display:inline-flex;align-items:center;gap:5px">'+ic('user-plus',14)+' Operaciones</a>'+
      '<a class="btn-sm save quick-nav" href="logros.html" style="text-decoration:none;display:inline-flex;align-items:center;gap:5px">'+ic('award',14)+' Logros</a>'+
      '<a class="btn-sm save quick-nav" href="sistema.html" style="text-decoration:none;display:inline-flex;align-items:center;gap:5px">'+ic('file-text',14)+' Sistema</a>'+
    '</div></div>';
  if(typeof lucide!=='undefined')lucide.createIcons();
}
