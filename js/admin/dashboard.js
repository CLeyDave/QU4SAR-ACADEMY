// ========== ADMIN DASHBOARD ==========

function renderSection_dashboard(){
  var coachName=currentUser&&currentUser.coachName;
  if(coachName&&!isCurrentUserAdmin()){
    renderCoachDashboard(coachName);
    return;
  }
  renderAdminDashboard();
}

function timeAgo(dateStr){
  if(!dateStr)return'';
  var diff=Date.now()-new Date(dateStr).getTime();
  var min=Math.floor(diff/60000);
  if(min<1)return'ahora';
  if(min<60)return'hace '+min+'m';
  var hrs=Math.floor(min/60);
  if(hrs<24)return'hace '+hrs+'h';
  var days=Math.floor(hrs/24);
  if(days<30)return'hace '+days+'d';
  return new Date(dateStr).toLocaleDateString('es-ES',{day:'numeric',month:'short'});
}

function renderCoachDashboard(coachName){
  var coach=(DATA.coaches||[]).find(function(c){return c.name===coachName||c.nickname===coachName});
  var gIds=(DATA.group_coaches||[]).filter(function(gc){return gc.coach_id===(coach?coach.id:'')}).map(function(gc){return gc.group_id});
  var groups=(DATA.groups||[]).filter(function(g){return gIds.indexOf(g.id)>=0});
  var members=filterByCurrentCoach(DATA.members||[]);
  var memberNames={};members.forEach(function(m){memberNames[m.name]=true});
  var memberCount=members.length;
  var tasks=filterByCurrentCoach(DATA.tasks||[]);
  var activeTasks=tasks.filter(function(t){return t.due_date&&new Date(t.due_date)>=new Date()}).length;
  var evals=filterByCurrentCoach(DATA.evaluations||[]);
  var scrims=filterByCurrentCoach(DATA.scrims||[]);
  var t=scrims.length,w=scrims.filter(function(s){return s.result==='Victoria'}).length,l=scrims.filter(function(s){return s.result==='Derrota'}).length,wr=t?Math.round(w/t*100):0;
  var avatar=(coach?coach.avatar:'')||'';

  // Construir timeline de actividad
  var timeline=[];
  // Evaluaciones
  evals.forEach(function(e){
    timeline.push({type:'eval',date:e.date||e.created_at,member:e.member_name,
      html:'<div style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:rgba(139,92,246,0.03);border-radius:8px;transition:all 0.2s">'+
        '<div style="width:30px;height:30px;border-radius:8px;background:rgba(139,92,246,0.08);display:flex;align-items:center;justify-content:center;flex-shrink:0">'+ic('clipboard',14)+'</div>'+
        '<div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:500;color:#e0e0e0">Evaluaste a <span style="color:var(--neon-light)">'+esc(e.member_name)+'</span></div><div style="font-size:11px;color:#666">'+timeAgo(e.date||e.created_at)+'</div></div>'+
        '<div style="font-size:15px;font-weight:700;font-family:var(--font-display);color:#a78bfa">'+Math.round(((e.aim||0)+(e.game_sense||0)+(e.communication||0)+(e.teamwork||0))/4*10)/10+'</div>'+
      '</div>'});
  });
  // Tareas completadas
  (DATA.task_completions||[]).forEach(function(tc){
    if(!memberNames[tc.member_name])return;
    var task=tasks.find(function(t){return t.id===tc.task_id});
    timeline.push({type:'task',date:tc.date||tc.created_at,member:tc.member_name,
      html:'<div style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:rgba(59,130,246,0.03);border-radius:8px">'+
        '<div style="width:30px;height:30px;border-radius:8px;background:rgba(59,130,246,0.08);display:flex;align-items:center;justify-content:center;flex-shrink:0">'+ic('check-square',14)+'</div>'+
        '<div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:500;color:#e0e0e0">'+esc(tc.member_name)+' completó <span style="color:#60a5fa">'+(task?esc(task.title):'una tarea')+'</span></div><div style="font-size:11px;color:#666">'+timeAgo(tc.date||tc.created_at)+'</div></div>'+
      '</div>'});
  });
  // Scrims
  scrims.forEach(function(s){
    var icon=s.result==='Victoria'?'trophy':'crosshair';
    var color=s.result==='Victoria'?'#a78bfa':'#f43f5e';
    timeline.push({type:'scrim',date:s.date,member:'',
      html:'<div style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:rgba(139,92,246,0.03);border-radius:8px">'+
        '<div style="width:30px;height:30px;border-radius:8px;background:rgba(139,92,246,0.08);display:flex;align-items:center;justify-content:center;flex-shrink:0">'+ic(icon,14)+'</div>'+
        '<div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:500;color:#e0e0e0">Scrim vs <span style="color:'+color+'">'+esc(s.opponent||'—')+'</span> '+(s.result?'('+esc(s.result)+')':'')+'</div><div style="font-size:11px;color:#666">'+timeAgo(s.date)+'</div></div>'+
        (s.our!==undefined&&s.opponent_score!==undefined?'<div style="font-size:14px;font-weight:700;font-family:var(--font-display);color:'+color+'">'+s.our+'-'+s.opponent_score+'</div>':'')+
      '</div>'});
  });
  // Asistencia reciente
  (DATA.attendance||[]).forEach(function(a){
    if(!memberNames[a.member_name])return;
    timeline.push({type:'attendance',date:a.date,member:a.member_name,
      html:'<div style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:rgba('+(a.status==='present'?'74,222,128':'244,63,94')+',0.03);border-radius:8px">'+
        '<div style="width:30px;height:30px;border-radius:8px;background:rgba('+(a.status==='present'?'74,222,128':'244,63,94')+',0.08);display:flex;align-items:center;justify-content:center;flex-shrink:0">'+(a.status==='present'?ic('check',14):ic('x',14))+'</div>'+
        '<div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:500;color:#e0e0e0">'+esc(a.member_name)+' '+(a.status==='present'?'asistió':'faltó')+' a clase</div><div style="font-size:11px;color:#666">'+timeAgo(a.date)+'</div></div>'+
      '</div>'});
  });
  html=
    '<div class="profile-wrap" style="max-width:620px;margin:0 auto">'+
      '<!-- METRICAS -->'+
      '<div class="glass-card" style="padding:0;overflow:hidden;margin-bottom:16px">'+
        '<div style="display:grid;grid-template-columns:repeat(5,1fr);background:rgba(139,92,246,0.03)">'+
          '<div class="profile-stat-cell"><div class="psc-val">'+memberCount+'</div><div class="psc-lbl">MIEMBROS</div></div>'+
          '<div class="profile-stat-cell"><div class="psc-val">'+groups.length+'</div><div class="psc-lbl">GRUPOS</div></div>'+
          '<div class="profile-stat-cell"><div class="psc-val">'+activeTasks+'</div><div class="psc-lbl">TAREAS</div></div>'+
          '<div class="profile-stat-cell"><div class="psc-val">'+evals.length+'</div><div class="psc-lbl">EVALS</div></div>'+
          '<div class="profile-stat-cell"><div class="psc-val">'+wr+'%</div><div class="psc-lbl">WIN RATE</div></div>'+
        '</div>'+
      '</div>'+
      '<!-- EVALUACIONES -->'+
      '<div class="glass-card" style="padding:16px 18px;margin-bottom:12px">'+
        '<div style="font-size:10px;color:#555;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:12px">'+ic('clipboard',12)+' EVALUACIONES</div>'+
        (function(){
          var es=evals.slice().sort(function(a,b){return(a.date||'')<(b.date||'')?1:-1}).slice(0,10);
          if(!es.length)return'<div style="padding:14px 10px;color:#555;font-size:13px;text-align:center">Sin evaluaciones</div>';
          return '<div style="display:flex;flex-direction:column;gap:5px">'+es.map(function(e){
            var score=Math.round(((e.aim||0)+(e.game_sense||0)+(e.communication||0)+(e.teamwork||0))/4*10)/10;
            return '<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:rgba(139,92,246,0.03);border-radius:8px">'+
              '<div style="width:28px;height:28px;border-radius:8px;background:rgba(139,92,246,0.08);display:flex;align-items:center;justify-content:center;flex-shrink:0">'+ic('clipboard',13)+'</div>'+
              '<div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:500;color:#e0e0e0">'+esc(e.member_name)+'</div><div style="font-size:11px;color:#666">'+timeAgo(e.date||e.created_at)+'</div></div>'+
              '<div style="font-size:15px;font-weight:700;font-family:var(--font-display);color:#a78bfa">'+score+'</div>'+
            '</div>';
          }).join('')+'</div>';
        })()+
      '</div>'+
      '<!-- TAREAS -->'+
      '<div class="glass-card" style="padding:16px 18px;margin-bottom:12px">'+
        '<div style="font-size:10px;color:#555;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:12px">'+ic('check-square',12)+' TAREAS COMPLETADAS</div>'+
        (function(){
          var tcs=(DATA.task_completions||[]).filter(function(tc){return memberNames[tc.member_name]}).sort(function(a,b){return(a.date||'')<(b.date||'')?1:-1}).slice(0,10);
          if(!tcs.length)return'<div style="padding:14px 10px;color:#555;font-size:13px;text-align:center">Sin tareas completadas</div>';
          return '<div style="display:flex;flex-direction:column;gap:5px">'+tcs.map(function(tc){
            var task=tasks.find(function(t){return t.id===tc.task_id});
            return '<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:rgba(59,130,246,0.03);border-radius:8px">'+
              '<div style="width:28px;height:28px;border-radius:8px;background:rgba(59,130,246,0.08);display:flex;align-items:center;justify-content:center;flex-shrink:0">'+ic('check-square',13)+'</div>'+
              '<div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:500;color:#e0e0e0">'+esc(tc.member_name)+' — <span style="color:#60a5fa">'+(task?esc(task.title):'tarea completada')+'</span></div><div style="font-size:11px;color:#666">'+timeAgo(tc.date||tc.created_at)+'</div></div>'+
            '</div>';
          }).join('')+'</div>';
        })()+
      '</div>'+
      '<!-- SCRIMS -->'+
      '<div class="glass-card" style="padding:16px 18px;margin-bottom:12px">'+
        '<div style="font-size:10px;color:#555;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:12px">'+ic('crosshair',12)+' SCRIMS</div>'+
        (function(){
          var ss=scrims.slice().sort(function(a,b){return(a.date||'')<(b.date||'')?1:-1}).slice(0,10);
          if(!ss.length)return'<div style="padding:14px 10px;color:#555;font-size:13px;text-align:center">Sin scrims</div>';
          return '<div style="display:flex;flex-direction:column;gap:5px">'+ss.map(function(s){
            var icon=s.result==='Victoria'?'trophy':'crosshair';
            var color=s.result==='Victoria'?'#a78bfa':'#f43f5e';
            return '<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:rgba(139,92,246,0.03);border-radius:8px">'+
              '<div style="width:28px;height:28px;border-radius:8px;background:rgba(139,92,246,0.08);display:flex;align-items:center;justify-content:center;flex-shrink:0">'+ic(icon,13)+'</div>'+
              '<div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:500;color:#e0e0e0">vs <span style="color:'+color+'">'+esc(s.opponent||'—')+'</span> '+(s.result?'('+esc(s.result)+')':'')+'</div><div style="font-size:11px;color:#666">'+timeAgo(s.date)+'</div></div>'+
              (s.our!==undefined&&s.opponent_score!==undefined?'<div style="font-size:14px;font-weight:700;font-family:var(--font-display);color:'+color+'">'+s.our+'-'+s.opponent_score+'</div>':'')+
            '</div>';
          }).join('')+'</div>';
        })()+
      '</div>'+
      '<!-- ASISTENCIA -->'+
      '<div class="glass-card" style="padding:16px 18px;margin-bottom:16px">'+
        '<div style="font-size:10px;color:#555;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:12px">'+ic('calendar',12)+' ASISTENCIA RECIENTE</div>'+
        (function(){
          var atts=(DATA.attendance||[]).filter(function(a){return memberNames[a.member_name]}).sort(function(a,b){return(a.date||'')<(b.date||'')?1:-1}).slice(0,10);
          if(!atts.length)return'<div style="padding:14px 10px;color:#555;font-size:13px;text-align:center">Sin registros de asistencia</div>';
          return '<div style="display:flex;flex-direction:column;gap:5px">'+atts.map(function(a){
            var p=a.status==='present';
            return '<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:rgba('+(p?'74,222,128':'244,63,94')+',0.03);border-radius:8px">'+
              '<div style="width:28px;height:28px;border-radius:8px;background:rgba('+(p?'74,222,128':'244,63,94')+',0.08);display:flex;align-items:center;justify-content:center;flex-shrink:0">'+(p?ic('check',13):ic('x',13))+'</div>'+
              '<div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:500;color:#e0e0e0">'+esc(a.member_name)+' '+(p?'asistió':'faltó')+'</div><div style="font-size:11px;color:#666">'+timeAgo(a.date)+'</div></div>'+
            '</div>';
          }).join('')+'</div>';
        })()+
      '</div>'+
    '</div>';

  document.getElementById('adminContent').innerHTML=html;
  if(typeof lucide!=="undefined")lucide.createIcons();
}

function coachEditProfile(coachId){
  var coach=(DATA.coaches||[]).find(function(c){return c.id===coachId});
  if(!coach){toast('Coach no encontrado','err');return}
  var f={name:coach.name||'',email:coach.email||'',nickname:coach.nickname||'',discord:coach.discord||'',specialty:coach.specialty||'',description:coach.description||'',avatar:coach.avatar||'',riot_id:coach.riot_id||'',region:coach.region||'latam',tracker_url:coach.tracker_url||''};
  var modalHTML=
    '<button class="modal-close" onclick="closeModal()">'+ic('x',16)+'</button>'+
    '<h3>'+ic('user-check',18)+' Editar Perfil</h3>'+
    '<div class="field">'+
      '<label>Foto de perfil</label>'+
      fileUploadHTML('Subir imagen','image/*','coach_avatar_status','coach_avatar_url',f.avatar)+
    '</div>'+
    '<div class="grid-2">'+
      '<div class="field"><label>Nombre</label><input class="input-field" id="ce_name" value="'+esc(f.name)+'"></div>'+
      '<div class="field"><label>Email</label><input class="input-field" id="ce_email" value="'+esc(f.email)+'"></div>'+
    '</div>'+
    '<div class="grid-2">'+
      '<div class="field"><label>Nickname VALORANT</label><input class="input-field" id="ce_nickname" value="'+esc(f.nickname)+'" placeholder="Jugador#NA1"></div>'+
      '<div class="field"><label>Discord</label><input class="input-field" id="ce_discord" value="'+esc(f.discord)+'" placeholder="usuario#0000"></div>'+
    '</div>'+
    '<div class="grid-2">'+
      '<div class="field"><label>Especialidad</label><input class="input-field" id="ce_specialty" value="'+esc(f.specialty)+'" placeholder="ej: Duelista, Estrategia"></div>'+
    '</div>'+
    '<div class="field"><label>Descripción</label><textarea class="input-field" id="ce_description" rows="4" placeholder="Cuenta tu experiencia como coach...">'+esc(f.description)+'</textarea></div>'+
    '<div style="border-top:1px solid rgba(139,92,246,0.06);padding-top:14px;margin-top:4px">'+
      '<div style="font-size:11px;color:#666;margin-bottom:10px">'+ic('external-link',12)+' Conecta tu cuenta de VALORANT para stats automáticas</div>'+
      '<div class="field"><label>Riot ID</label><input class="input-field" id="ce_riot_id" value="'+esc(f.riot_id)+'" placeholder="Nombre#Tag (ej: Shazam#NA1)"></div>'+
      '<div class="grid-2">'+
        '<div class="field"><label>Región</label><select class="input-field" id="ce_region"><option value="latam" '+(f.region==='latam'?'selected':'')+'>LATAM</option><option value="na" '+(f.region==='na'?'selected':'')+'>NA</option><option value="eu" '+(f.region==='eu'?'selected':'')+'>EU</option><option value="br" '+(f.region==='br'?'selected':'')+'>BR</option><option value="ap" '+(f.region==='ap'?'selected':'')+'>AP</option></select></div>'+
        '<div class="field"><label>Tracker.gg URL</label><input class="input-field" id="ce_tracker_url" value="'+esc(f.tracker_url)+'" placeholder="https://tracker.gg/..."></div>'+
      '</div>'+
    '</div>'+
    '<button class="btn-primary" onclick="saveCoachProfile(\''+coachId+'\')" style="width:100%;justify-content:center;margin-top:14px">'+ic('save',16)+' Guardar Cambios</button>';

  openModal(modalHTML);
  if(typeof lucide!=="undefined")lucide.createIcons();
}

function saveCoachProfile(coachId){
  var idx=(DATA.coaches||[]).findIndex(function(c){return c.id===coachId});
  if(idx<0){toast('Error: coach no encontrado','err');return}
  DATA.coaches[idx].name=document.getElementById('ce_name').value;
  DATA.coaches[idx].email=document.getElementById('ce_email').value;
  DATA.coaches[idx].nickname=document.getElementById('ce_nickname').value;
  DATA.coaches[idx].discord=document.getElementById('ce_discord').value;
  DATA.coaches[idx].specialty=document.getElementById('ce_specialty').value;
  DATA.coaches[idx].description=document.getElementById('ce_description').value;
  DATA.coaches[idx].avatar=document.getElementById('coach_avatar_url').value||'';
  DATA.coaches[idx].riot_id=document.getElementById('ce_riot_id').value;
  DATA.coaches[idx].region=document.getElementById('ce_region').value;
  DATA.coaches[idx].tracker_url=document.getElementById('ce_tracker_url').value;
  saveData(DATA);closeModal();
  renderCoachDashboard(DATA.coaches[idx].name||DATA.coaches[idx].nickname);
  toast('Perfil actualizado','ok');
  if(db&&db.from){
    var c=DATA.coaches[idx];
    db.from('coaches').upsert({id:c.id,name:c.name,email:c.email,nickname:c.nickname,discord:c.discord,specialty:c.specialty,description:c.description,avatar:c.avatar,status:c.status||'active'},{onConflict:'id'}).then(function(){}).catch(function(e){console.log('Error syncing coach profile:',e)});
  }
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
  ].map(function(c){return'<div class="glass-card dash-card"><div class="glow" style="background:linear-gradient(135deg,'+c.c+')"></div><div class="num gradient-text">'+c.n+'</div><div class="lbl"><span class="icon">'+c.i+'</span> '+c.l+'</div></div>'}).join('')+'</div>';
  if(typeof lucide!=="undefined")lucide.createIcons();
}
