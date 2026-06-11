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
    container.innerHTML='<div style="text-align:center;padding:60px 20px;color:#555">'+ic('log-in',48)+'<br><br><span style="font-size:18px;font-weight:600">Inicia sesión para ver tu panel</span></div>';
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
  
  // Pending tasks
  var tasksHTML='<div class="dash-section"><h3>'+ic('check-square',18)+' Tareas Pendientes</h3>';
  if(allTasks.length){
    var pending=allTasks.map(function(t){
      var done=myCompletions.some(function(tc){return tc.task_id===t.id});
      return done?'':'<div class="glass-card dash-task" onclick="showTaskDetail(\''+t.id+'\')"><div class="title"><strong>'+esc(t.title)+'</strong>'+(t.due_date?'<div class="due">Vence: '+esc(t.due_date)+'</div>':'')+'</div></div>';
    }).filter(function(h){return h}).join('');
    tasksHTML+=pending||'<div style="padding:20px;text-align:center;color:#888">'+ic('check-circle',24)+'<br>¡Todas las tareas completadas!</div>';
  }else tasksHTML+='<div style="padding:20px;text-align:center;color:#888">'+ic('inbox',24)+'<br>No hay tareas asignadas</div>';
  tasksHTML+='</div>';
  
  // Evaluations
  var evalsHTML='<div class="dash-section"><h3 style="cursor:pointer" onclick="showEvalsOverlay()">'+ic('bar-chart-3',18)+' Últimas Evaluaciones '+ic('chevron-right',14)+'</h3>';
  if(myEvals.length){
    evalsHTML+='<div style="overflow-x:auto"><table class="dash-eval-table"><thead><tr><th>Fecha</th><th>AIM</th><th>Game Sense</th><th>Comms</th><th>Teamwork</th></tr></thead><tbody>'+
      myEvals.sort(function(a,b){return a.date<b.date?1:-1}).slice(0,5).map(function(e,i){
        return '<tr style="cursor:pointer" onclick="showEvalDetail('+i+')"><td>'+(e.date?new Date(e.date).toLocaleDateString('es-ES'):'—')+'</td><td>'+e.aim+'</td><td>'+e.game_sense+'</td><td>'+e.communication+'</td><td>'+e.teamwork+'</td></tr>';
      }).join('')+'</tbody></table></div>';
  }else evalsHTML+='<div style="padding:20px;text-align:center;color:#888">'+ic('clipboard',24)+'<br>Sin evaluaciones aún</div>';
  evalsHTML+='</div>';
  
  // Coach notes
  var notesHTML='<div class="dash-section"><h3 style="cursor:pointer" onclick="showNotesOverlay()">'+ic('message-square',18)+' Notas del Coach '+ic('chevron-right',14)+'</h3>';
  var myNotes=(DATA.coach_notes||[]).filter(function(n){return n.member_name===name});
  if(myNotes.length){
    notesHTML+=myNotes.sort(function(a,b){return a.created_at<b.created_at?1:-1}).slice(0,4).map(function(n){
      return '<div class="glass-card dash-note" style="cursor:pointer" onclick="showNotesOverlay()"><span class="date">'+(n.created_at?new Date(n.created_at).toLocaleDateString('es-ES'):'')+'</span><div class="cat">'+(n.category||'general')+'</div><div style="white-space:pre-wrap">'+esc(n.note||n.text||'')+'</div></div>';
    }).join('');
  }else notesHTML+='<div style="padding:20px;text-align:center;color:#888">'+ic('inbox',24)+'<br>Sin notas aún</div>';
  notesHTML+='</div>';
  
  // Rank timeline
  var rankHTML='<div class="dash-section"><h3 style="cursor:pointer" onclick="showRankOverlay()">'+ic('trending-up',18)+' Progreso de Rango '+ic('chevron-right',14)+'</h3>';
  var rankHistory=(DATA.rank_history||[]).filter(function(r){return r.member_name===name});
  if(rankHistory.length){
    rankHTML+='<div class="dash-timeline" style="cursor:pointer" onclick="showRankOverlay()">'+rankHistory.sort(function(a,b){return a.date<b.date?1:-1}).slice(0,8).map(function(r,i){
      return '<div class="step">'+(i?'<span style="color:#555;margin:0 4px">→</span>':'')+'<span class="dot"></span><span>'+esc(r.rank)+'</span></div>';
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
  }else achsHTML+='<div style="padding:20px;text-align:center;color:#888">'+ic('star',24)+'<br>Aún no tienes logros</div>';
  achsHTML+='</div>';
  
  document.getElementById('dashContent').innerHTML=headerHTML+'<div class="dash-cards" style="margin-bottom:28px">'+statsHTML+'</div>'+tasksHTML+evalsHTML+notesHTML+rankHTML+achsHTML;
}
function renderDashClases(){
  var u=getLogin();var items=filterByCoach(filterByGroup(DATA.academy||[]));
  var html='<div class="dash-filters">'+buildFilterHTML('dash-clases',true,true,'onDashFilter()')+'</div>';
  html+='<div class="glass-card" style="padding:24px"><h3 style="margin:0 0 16px;font-size:18px">'+ic('graduation-cap',18)+' Clases de Academia</h3>';
  if(!items.length){html+='<div style="text-align:center;padding:24px;color:#555">'+ic('book',40)+'<br>No hay clases disponibles para tu grupo</div>';html+='</div>';document.getElementById('dashContent').innerHTML=html;return}
  html+=items.map(function(a){
    var imgs=a.image_url?'<img src="'+esc(a.image_url)+'" alt="" style="width:100%;max-height:160px;object-fit:cover;border-radius:8px;margin-bottom:10px;cursor:pointer" onclick="event.stopPropagation();showImageOverlay(this.src,this.alt)">':'';
    return '<div class="glass-card" style="padding:18px;margin-bottom:12px">'+imgs+
      '<div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:6px"><h4 style="margin:0;font-size:16px">'+esc(a.topic)+'</h4><span class="badge badge-purple">'+esc(a.day)+'</span></div>'+
      (a.coach?'<div style="color:#888;font-size:13px;margin-bottom:4px">'+ic('user',13)+' '+esc(a.coach)+'</div>':'')+
      (a.duration?'<div style="color:#555;font-size:12px;margin-bottom:4px">'+ic('clock',12)+' '+esc(a.duration)+'</div>':'')+
      ((a.objectives||[]).length?'<div style="margin-top:10px;display:grid;gap:4px">'+(Array.isArray(a.objectives)?a.objectives:[]).map(function(o){return'<div style="display:flex;align-items:center;gap:6px;font-size:13px;color:#ccc"><span style="color:var(--neon)">▸</span>'+esc(o)+'</div>'}).join('')+'</div>':'')+
    '</div>';
  }).join('');
  html+='</div>';document.getElementById('dashContent').innerHTML=html;
}
function renderDashEvals(){
  var u=getLogin();var name=u?u.name:'';if(!name)return;
  var items=filterByCoach(DATA.evaluations||[]).filter(function(e){return e.member_name===name}).sort(function(a,b){return a.date<b.date?1:-1});
  var html='<div class="glass-card" style="padding:24px"><h3 style="margin:0 0 16px;font-size:18px">'+ic('bar-chart-3',18)+' Mis Evaluaciones</h3>';
  if(!items.length){html+='<div style="text-align:center;padding:24px;color:#555">'+ic('clipboard',40)+'<br>Sin evaluaciones aún</div>';html+='</div>';document.getElementById('dashContent').innerHTML=html;return}
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
  if(!items.length){html+='<div style="text-align:center;padding:24px;color:#555">'+ic('inbox',40)+'<br>Sin notas aún</div>';html+='</div>';document.getElementById('dashContent').innerHTML=html;return}
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
      (i?'<span style="color:#555">→</span>':'')+'<span class="badge badge-purple">'+esc(r.rank)+'</span>'+
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

function renderDashTasks(){
  var items=filterByCoach(filterByGroup(DATA.tasks||[]));
  var u=getLogin();var name=u?u.name:'';
  var html='<div class="dash-filters">'+buildFilterHTML('dash-tasks',true,true,'onDashFilter()')+'</div>';
  html+='<div class="glass-card" style="padding:24px"><div id="dashTasksList">';
  if(!name){html+='<div style="text-align:center;padding:24px;color:#555">'+ic('log-in',40)+'<br>Inicia sesión para ver tus tareas</div>';html+='</div></div>';document.getElementById('dashContent').innerHTML=html;return}
  if(!items.length){html+='<div style="text-align:center;padding:24px;color:#555">'+ic('check-square',40)+'<br>No hay tareas asignadas</div>';html+='</div></div>';document.getElementById('dashContent').innerHTML=html;return}
  html+=items.map(function(t){
    var completed=(DATA.task_completions||[]).filter(function(tc){return tc.task_id===t.id&&tc.member_name===name});
    var done=completed.length>0;
    return '<div class="glass-card" style="padding:16px;display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:8px;'+(done?'opacity:0.5':'')+'">'+
      '<div style="flex:1;cursor:pointer" onclick="showTaskDetail(\''+t.id+'\')"><strong>'+esc(t.title)+'</strong>'+
        (t.description?'<div style="color:#888;font-size:13px;margin-top:4px;white-space:pre-wrap">'+esc(t.description)+'</div>':'')+
        '<div style="color:#555;font-size:12px;margin-top:4px">'+(t.type?esc(t.type):'')+(t.due_date?' · '+esc(t.due_date):'')+(t.coach?' · '+ic('user',11)+' '+esc(t.coach):'')+'</div>'+
        (t.attachment_url?'<a href="'+esc(t.attachment_url)+'" target="_blank" style="display:inline-flex;align-items:center;gap:4px;color:var(--neon);font-size:12px;margin-top:4px" onclick="event.stopPropagation()">'+ic('paperclip',12)+' '+esc(t.attachment_name||'Archivo')+'</a>':'')+
      '</div>'+
      '<button class="btn-sm '+(done?'save':'cancel')+'" onclick="event.stopPropagation();toggleTaskCompletion(\''+t.id+'\');renderDashTasks()">'+(done?ic('check',14)+' Hecho':ic('square',14)+' Completar')+'</button>'+
    '</div>';
  }).join('');
  html+='</div></div>';
  document.getElementById('dashContent').innerHTML=html;
}

function renderDashMaterials(){
  var html='<div class="dash-filters">'+buildFilterHTML('dash-materials',true,true,'onDashFilter()')+'</div>';
  html+='<div class="glass-card" style="padding:24px"><div class="materials-filter" style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px">'+
    '<input class="input-field" id="dashMatSearch" placeholder="Buscar materiales..." oninput="renderDashMaterials()" style="flex:1;min-width:180px">'+
    '<select class="input-field" id="dashMatType" onchange="renderDashMaterials()" style="max-width:160px">'+
      '<option value="">Todos</option><option value="video">Video</option><option value="guide">Guía</option><option value="pdf">PDF</option><option value="other">Otro</option>'+
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
  var html='<div class="dash-filters">'+buildFilterHTML('dash-quizzes',true,true,'onDashFilter()')+'</div><div id="dashQuizList">';
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
  document.getElementById('dashContent').insertAdjacentHTML('afterbegin','<div class="has-glow" style="text-align:center;padding:16px;margin-bottom:16px;background:#ffffff10;border-radius:10px;border:1px solid '+(score>=70?'#8b5cf6':'#8b5cf6')+'40"><strong style="font-size:18px">'+(score>=70?'🎉':'💪')+' Puntaje: '+score+'% ('+correct+'/'+total+')</strong></div>');
}

function renderDashCurriculum(){
  var items=filterByCoach(filterByGroup(DATA.curriculum||[]));
  if(!items.length){document.getElementById('dashContent').innerHTML='<div class="dash-filters">'+buildFilterHTML('dash-curriculum',true,true,'onDashFilter()')+'</div><div style="text-align:center;padding:40px;color:#555">'+ic('book-open',48)+'<br>No hay plan de estudios disponible</div>';return}
  var html=items.sort(function(a,b){return a.week-b.week}).map(function(c,i){
    var topics;try{topics=typeof c.topics==='string'?JSON.parse(c.topics||'[]'):(c.topics||[])}catch(e){topics=[]}
    return '<div class="glass-card" style="padding:20px;border-left:4px solid '+(c.color||'#8B5CF6')+';cursor:pointer;margin-bottom:12px" onclick="showCurriculumDetail('+i+')">'+
      (c.image_url?'<img src="'+esc(c.image_url)+'" alt="" style="width:100%;max-height:160px;object-fit:cover;border-radius:8px;margin-bottom:10px;cursor:pointer" onclick="event.stopPropagation();showImageOverlay(this.src,this.alt)">':'')+
      '<div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:10px"><div><span class="badge badge-purple">Semana '+c.week+'</span><h3 style="margin:8px 0 4px;font-size:18px">'+esc(c.title)+'</h3></div></div>'+
      (c.description?'<p style="color:#888;font-size:14px;white-space:pre-wrap">'+esc(c.description)+'</p>':'')+
      (c.coach?'<div style="font-size:12px;color:#888;margin-top:6px">'+ic('user',11)+' '+esc(c.coach)+'</div>':'')+
      (topics.length?'<div style="margin-top:10px;display:grid;gap:6px">'+topics.map(function(t){return'<div style="display:flex;align-items:center;gap:8px;font-size:13px;color:#ccc"><span style="color:var(--neon)">▸</span>'+esc(t)+'</div>'}).join('')+'</div>':'')+
    '</div>';
  }).join('');
  document.getElementById('dashContent').innerHTML='<div class="dash-filters">'+buildFilterHTML('dash-curriculum',true,true,'onDashFilter()')+'</div>'+html;
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
    '<div class="meta"><span>'+ic('tag',14)+' '+esc(t.type||'')+'</span>'+(t.due_date?'<span>'+ic('calendar',14)+' Vence: '+esc(t.due_date)+'</span>':'')+'<span>'+(done?'<span style="color:#8b5cf6">✔ Completada</span>':'<span style="color:#888">Pendiente</span>')+'</span></div>'+
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
