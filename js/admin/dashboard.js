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

var _ccWeekOffset=0;
var DAY_NAMES=['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
var DAY_NAMES_SHORT=['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

function getWeekStart(offset){
  var d=new Date();d.setDate(d.getDate()+d.getDay()* -1+offset*7);d.setHours(0,0,0,0);return d;
}
function formatDateKey(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function getDaySchedule(gIds,dateKey){
  return (DATA.schedule||[]).filter(function(s){
    if(!s.day)return false;
    var dayIdx={'Domingo':0,'Lunes':1,'Martes':2,'Miércoles':3,'Jueves':4,'Viernes':5,'Sábado':6}[s.day];
    if(dayIdx===undefined)return false;
    var d=new Date(dateKey);var dow=d.getDay();
    if(dayIdx!==dow)return false;
    if(s.group_id&&gIds.indexOf(s.group_id)<0)return false;
    return true;
  });
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
  var overdueTasks=tasks.filter(function(t){return t.due_date&&new Date(t.due_date)<new Date()});
  var evals=filterByCurrentCoach(DATA.evaluations||[]);
  var scrims=filterByCurrentCoach(DATA.scrims||[]);
  var t=scrims.length,w=scrims.filter(function(s){return s.result==='Victoria'}).length,l=scrims.filter(function(s){return s.result==='Derrota'}).length,wr=t?Math.round(w/t*100):0;
  var weekStart=getWeekStart(_ccWeekOffset);
  var weekDays=[];
  for(var i=0;i<7;i++){var d=new Date(weekStart);d.setDate(d.getDate()+i);weekDays.push(d)}
  var today=new Date();today.setHours(0,0,0,0);

  // === TASK ALERTS (2.3) ===
  var overdueWithMembers=[];
  overdueTasks.forEach(function(ot){
    members.forEach(function(m){
      var done=(DATA.task_completions||[]).some(function(tc){return tc.task_id===ot.id&&tc.member_name===m.name});
      if(!done){
        var daysOver=Math.floor((today-new Date(ot.due_date))/86400000);
        overdueWithMembers.push({member:m.name,task:ot.title,daysOver:Math.max(1,daysOver),taskId:ot.id});
      }
    });
  });
  overdueWithMembers.sort(function(a,b){return b.daysOver-a.daysOver});

  // === ATTENDANCE CHART (2.2) ===
  var attByMember={};
  members.forEach(function(m){attByMember[m.name]={present:0,absent:0,total:0}});
  (DATA.attendance||[]).forEach(function(a){
    if(!memberNames[a.member_name])return;
    if(!attByMember[a.member_name])attByMember[a.member_name]={present:0,absent:0,total:0};
    attByMember[a.member_name].total++;
    if(a.status==='present')attByMember[a.member_name].present++;
    else attByMember[a.member_name].absent++;
  });
  var attSorted=Object.keys(attByMember).map(function(n){return{name:n,rate:attByMember[n].total?Math.round(attByMember[n].present/attByMember[n].total*100):0}}).sort(function(a,b){return b.rate-a.rate});
  var topStudents=attSorted.slice(0,5);

  // === STUDENT COMPARISON (2.4) ===
  var compareData=members.map(function(m){
    var myEvals=evals.filter(function(e){return e.member_name===m.name});
    var avgScore=myEvals.length?Math.round(myEvals.reduce(function(s,e){return s+(e.aim||0)+(e.game_sense||0)+(e.communication||0)+(e.teamwork||0)},0)/(myEvals.length*4)*10)/10:0;
    var doneTasks=(DATA.task_completions||[]).filter(function(tc){return tc.member_name===m.name}).length;
    var attInfo=attByMember[m.name]||{present:0,total:0};
    var attRate=attInfo.total?Math.round(attInfo.present/attInfo.total*100):0;
    var achCount=(DATA.member_achievements||[]).filter(function(ma){return ma.member_name===m.name}).length;
    var xp=typeof calcMemberXP==='function'?calcMemberXP(m):0;
    return {name:m.name,avgScore:avgScore,tasksDone:doneTasks,attRate:attRate,achs:achCount,xp:xp,rank:m.rank||'—'};
  });
  compareData.sort(function(a,b){return b.xp-a.xp});

  // === TIMELINE ===
  var timeline=[];
  evals.forEach(function(e){
    timeline.push({type:'eval',date:e.date||e.created_at,
      html:'<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:rgba(139,92,246,0.03);border-radius:8px">'+
        '<div style="width:28px;height:28px;border-radius:8px;background:rgba(139,92,246,0.08);display:flex;align-items:center;justify-content:center;flex-shrink:0">'+ic('clipboard',13)+'</div>'+
        '<div style="flex:1;min-width:0"><div style="font-size:12px;font-weight:500;color:#e0e0e0">'+esc(e.member_name)+'</div><div style="font-size:11px;color:#666">'+timeAgo(e.date||e.created_at)+'</div></div>'+
        '<div style="font-size:14px;font-weight:700;color:#a78bfa">'+Math.round(((e.aim||0)+(e.game_sense||0)+(e.communication||0)+(e.teamwork||0))/4*10)/10+'</div></div>'});
  });
  (DATA.task_completions||[]).forEach(function(tc){
    if(!memberNames[tc.member_name])return;
    var tk=tasks.find(function(t){return t.id===tc.task_id});
    timeline.push({type:'task',date:tc.date||tc.created_at,
      html:'<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:rgba(59,130,246,0.03);border-radius:8px">'+
        '<div style="width:28px;height:28px;border-radius:8px;background:rgba(59,130,246,0.08);display:flex;align-items:center;justify-content:center;flex-shrink:0">'+ic('check-square',13)+'</div>'+
        '<div style="flex:1;min-width:0"><div style="font-size:12px;font-weight:500;color:#e0e0e0">'+esc(tc.member_name)+' <span style="color:#60a5fa">'+(tk?esc(tk.title):'tarea')+'</span></div><div style="font-size:11px;color:#666">'+timeAgo(tc.date||tc.created_at)+'</div></div></div>'});
  });
  scrims.forEach(function(s){
    var sc=s.result==='Victoria'?'#a78bfa':'#f43f5e';
    timeline.push({type:'scrim',date:s.date,
      html:'<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:rgba(139,92,246,0.03);border-radius:8px">'+
        '<div style="width:28px;height:28px;border-radius:8px;background:rgba(139,92,246,0.08);display:flex;align-items:center;justify-content:center;flex-shrink:0">'+ic('crosshair',13)+'</div>'+
        '<div style="flex:1;min-width:0"><div style="font-size:12px;font-weight:500;color:#e0e0e0">vs '+esc(s.opponent||'—')+' <span style="color:'+sc+'">('+(s.result||'')+')</span></div><div style="font-size:11px;color:#666">'+timeAgo(s.date)+'</div></div>'+
        (s.our!==undefined&&s.opponent_score!==undefined?'<div style="font-size:14px;font-weight:700;color:'+sc+'">'+s.our+'-'+s.opponent_score+'</div>':'')+'</div>'});
  });
  (DATA.attendance||[]).forEach(function(a){
    if(!memberNames[a.member_name])return;
    var p=a.status==='present';
    timeline.push({type:'att',date:a.date,
      html:'<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:rgba('+(p?'74,222,128':'244,63,94')+',0.03);border-radius:8px">'+
        '<div style="width:28px;height:28px;border-radius:8px;background:rgba('+(p?'74,222,128':'244,63,94')+',0.08);display:flex;align-items:center;justify-content:center;flex-shrink:0">'+(p?ic('check',13):ic('x',13))+'</div>'+
        '<div style="flex:1;min-width:0"><div style="font-size:12px;font-weight:500;color:#e0e0e0">'+esc(a.member_name)+' '+(p?'asistió':'faltó')+'</div><div style="font-size:11px;color:#666">'+timeAgo(a.date)+'</div></div></div>'});
  });
  timeline.sort(function(a,b){return(a.date||'')<(b.date||'')?1:-1});

  // === BUILD WEEK CALENDAR ===
  function weekCalHTML(){
    var h='<div class="glass-card" style="padding:16px 18px;margin-bottom:12px">'+
      '<div class="cc-nav-week"><button onclick="changeCoachWeek(-1)">'+ic('chevron-left',14)+'</button>'+
      '<span class="cc-week-range">'+weekDays[0].toLocaleDateString('es-ES',{day:'numeric',month:'short'})+' — '+weekDays[6].toLocaleDateString('es-ES',{day:'numeric',month:'short'})+'</span>'+
      '<button onclick="changeCoachWeek(1)">'+ic('chevron-right',14)+'</button>'+
      '<button onclick="changeCoachWeek(0)" style="font-size:10px;padding:2px 8px;margin-left:4px">Hoy</button></div>'+
      '<div class="cc-week-grid">';
    weekDays.forEach(function(d){
      var dk=formatDateKey(d);
      var isToday=d.getTime()===today.getTime();
      var dayItems=getDaySchedule(gIds,dk);
      h+='<div class="cc-week-day'+(isToday?' today':'')+'">'+
        '<div class="day-name">'+DAY_NAMES_SHORT[d.getDay()]+'</div>'+
        '<div class="day-num">'+d.getDate()+'</div>';
      dayItems.forEach(function(si){
        var tc=si.type||'academia';
        h+='<div class="cc-week-item '+tc+'" title="'+esc(si.title||'')+' '+(si.start||'')+'">'+esc((si.title||'').slice(0,14))+'</div>';
      });
      h+='</div>';
    });
    h+='</div></div>';
    return h;
  }

  // === BUILD TASK ALERTS (2.3) ===
  function alertsHTML(){
    if(!overdueWithMembers.length)return'';
    var h='<div class="glass-card" style="padding:16px 18px;margin-bottom:12px">'+
      '<div class="cc-section-title">'+ic('alert-triangle',14)+' ALERTAS DE TAREAS <span class="cc-alert-badge" style="margin-left:6px">'+overdueWithMembers.length+'</span></div>';
    overdueWithMembers.slice(0,8).forEach(function(a){
      h+='<div class="cc-alert-item"><span class="name">'+esc(a.member)+'</span><span class="task">— '+esc(a.task)+'</span><span class="days" style="margin-left:auto">'+a.daysOver+'d atrasada</span></div>';
    });
    if(overdueWithMembers.length>8)h+='<div style="text-align:center;color:#555;font-size:11px;margin-top:6px">+ '+(overdueWithMembers.length-8)+' más</div>';
    h+='</div>';
    return h;
  }

  // === BUILD TASK SUBMISSIONS (4.4) ===
  function submissionsHTML(){
    var subs=(DATA.task_submissions||[]).filter(function(s){return memberNames[s.member_name]});
    if(!subs.length)return'';
    var grouped={};
    subs.forEach(function(s){
      if(!grouped[s.task_id])grouped[s.task_id]={task:null,files:[]};
      if(!grouped[s.task_id].task)grouped[s.task_id].task=tasks.find(function(t){return t.id===s.task_id});
      grouped[s.task_id].files.push(s);
    });
    var h='<div class="glass-card" style="padding:16px 18px;margin-bottom:12px">'+
      '<div class="cc-section-title" style="cursor:pointer" onclick="var e=document.getElementById(\'ccSubsBody\');e.style.display=e.style.display===\'none\'?\'\':\'none\'">'+ic('upload',14)+' ENTREGAS DE ARCHIVOS <span style="color:#888;font-size:11px;font-weight:400">('+subs.length+')</span> '+ic('chevron-down',12)+'</div>'+
      '<div id="ccSubsBody">';
    Object.keys(grouped).forEach(function(tid){
      var g=grouped[tid];
      if(!g||!g.files.length)return;
      h+='<div style="margin-bottom:10px;padding:8px 10px;background:rgba(255,255,255,0.02);border-radius:8px;border-left:2px solid rgba(139,92,246,0.2)">'+
        '<div style="font-size:12px;font-weight:600;color:#ccc;margin-bottom:6px">'+(g.task?esc(g.task.title):'Tarea eliminada')+'</div>';
      g.files.forEach(function(f){
        h+='<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:4px 0;font-size:11px">'+
          '<span style="color:#a78bfa;font-weight:500">'+esc(f.member_name)+'</span>'+
          (f.file_url?'<a href="'+esc(f.file_url)+'" target="_blank" style="color:var(--neon-light);display:inline-flex;align-items:center;gap:4px" title="'+esc(f.file_name||'')+'">'+ic('external-link',11)+' Ver</a>':'<span style="color:#666">Sin archivo</span>')+
          '<span style="color:#555">'+timeAgo(f.submitted_at)+'</span></div>';
      });
      h+='</div>';
    });
    h+='</div></div>';
    return h;
  }

  // === BUILD ATTENDANCE CHART (2.2) ===
  function chartHTML(){
    if(!topStudents.length)return'';
    var maxRate=Math.max(100,topStudents[0]?topStudents[0].rate+20:100);
    var h='<div class="glass-card" style="padding:16px 18px;margin-bottom:12px">'+
      '<div class="cc-section-title">'+ic('bar-chart-3',14)+' ASISTENCIA POR ALUMNO</div>'+
      '<div class="cc-bar-chart">';
    topStudents.forEach(function(s){
      var pct=Math.round(s.rate/maxRate*100);
      h+='<div class="cc-bar"><div class="bar-val">'+s.rate+'%</div><div class="bar-fill" style="height:'+pct+'%"></div><div class="bar-lbl">'+esc(s.name).slice(0,8)+'</div></div>';
    });
    h+='</div></div>';
    return h;
  }

  // === BUILD TOP STUDENTS ===
  function topHTML(){
    var h='<div class="glass-card" style="padding:16px 18px;margin-bottom:12px">'+
      '<div class="cc-section-title">'+ic('zap',14)+' TOP ALUMNOS</div>';
    compareData.slice(0,5).forEach(function(s,i){
      h+='<div class="cc-student-row"><span class="pos">'+(i+1)+'</span><span class="name">'+esc(s.name)+'</span><span class="stat">'+s.xp+' XP</span><span class="stat" style="color:'+(s.attRate>=70?'#4ade80':'#f43f5e')+'">'+s.attRate+'%</span><span class="stat" style="color:#a78bfa">'+s.achs+' logros</span></div>';
    });
    h+='</div>';
    return h;
  }

  // === BUILD COMPARISON TABLE (2.4) ===
  function compareHTML(){
    if(!compareData.length)return'';
    var h='<div class="glass-card" style="padding:16px 18px;margin-bottom:12px;overflow-x:auto">'+
      '<div class="cc-section-title">'+ic('users',14)+' COMPARATIVA DE ALUMNOS</div>'+
      '<table class="cc-compare-table"><thead><tr><th>#</th><th>Nombre</th><th>Rango</th><th>XP</th><th>Evaluación</th><th>Tareas</th><th>Asistencia</th><th>Logros</th></tr></thead><tbody>';
    compareData.forEach(function(s,i){
      h+='<tr><td>'+(i+1)+'</td><td style="font-weight:500;color:#e0e0e0">'+esc(s.name)+'</td><td class="rank">'+esc(s.rank)+'</td><td>'+s.xp+'</td><td>'+(s.avgScore||'—')+'</td><td>'+s.tasksDone+'</td><td style="color:'+(s.attRate>=70?'#4ade80':'#f43f5e')+'">'+s.attRate+'%</td><td>'+s.achs+'</td></tr>';
    });
    h+='</tbody></table></div>';
    return h;
  }

  // === COURSE PROGRESSION ===
  function progressionHTML(){
    var active=members.filter(function(m){return m.academy_status==='active'||!m.academy_status});
    if(!active.length)return'';
    var h='<div class="glass-card" style="padding:16px 18px;margin-bottom:12px">'+
      '<div class="cc-section-title">'+ic('trending-up',14)+' PROGRESIÓN DEL CURSO</div>'+
      '<div style="font-size:11px;color:#666;margin-top:4px">Requisito de rango para aprobar al siguiente mes</div>';
    active.forEach(function(m){
      var month=m.current_month||1;
      var nextReq=getMonthRankReq(month+1);
      var studentRank=rankValue(m.rank);
      var meetsReq=studentRank>=nextReq.minVal;
      h+='<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:rgba(255,255,255,0.02);border-radius:8px;margin-top:8px">'+
        '<div style="flex:1;min-width:0"><div><span style="color:#e0e0e0;font-weight:500">'+esc(m.name)+'</span> <span style="color:#888;font-size:13px">Mes '+month+'/'+nextReq.name+'</span></div>'+
        '<div style="font-size:11px;color:#666;margin-top:2px">Req: '+nextReq.minRank+'+ · Tiene: '+(m.rank||'—')+' '+(meetsReq?'<span style="color:#4ade80">✔</span>':'<span style="color:#f43f5e">✘</span>')+'</div></div>'+
        '<button class="btn-sm" style="font-size:11px;padding:4px 12px;'+(meetsReq?'':'opacity:0.5;pointer-events:none')+'" onclick="passStudentMonth(\''+esc(m.name)+'\')">'+ic('chevron-right',12)+' Pasar</button></div>';
    });
    h+='</div>';
    return h;
  }

  // === BUILD TIMELINE ===
  function timelineHTML(){
    if(!timeline.length)return'';
    var h='<div class="glass-card" style="padding:16px 18px;margin-bottom:12px">'+
      '<div class="cc-section-title">'+ic('activity',14)+' ACTIVIDAD RECIENTE</div>'+
      '<div style="max-height:320px;overflow-y:auto;overflow-x:hidden">';
    timeline.slice(0,20).forEach(function(item){h+=item.html});
    h+='</div></div>';
    return h;
  }

  var html=
    '<div class="cc-grid">'+
      '<!-- METRICAS -->'+
      '<div class="cc-header-card">'+
        '<div class="cc-header-cell"><div class="num">'+memberCount+'</div><div class="lbl">MIEMBROS</div></div>'+
        '<div class="cc-header-cell"><div class="num">'+groups.length+'</div><div class="lbl">GRUPOS</div></div>'+
        '<div class="cc-header-cell"><div class="num">'+activeTasks+'</div><div class="lbl">TAREAS</div></div>'+
        '<div class="cc-header-cell"><div class="num">'+evals.length+'</div><div class="lbl">EVALS</div></div>'+
        '<div class="cc-header-cell"><div class="num">'+wr+'%</div><div class="lbl">WIN RATE</div></div>'+
      '</div>'+
      '<!-- VISTA SEMANAL (2.1) -->'+weekCalHTML()+
      '<!-- ALERTAS TAREAS (2.3) -->'+alertsHTML()+
      '<!-- ENTREGAS (4.4) -->'+submissionsHTML()+
      '<!-- CHARTS ROW (2.2) -->'+
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">'+chartHTML()+topHTML()+'</div>'+
      '<!-- COMPARATIVA (2.4) -->'+compareHTML()+
      '<!-- PROGRESIÓN -->'+progressionHTML()+
      '<!-- TIMELINE -->'+timelineHTML()+
    '</div>';

  document.getElementById('adminContent').innerHTML=html;
  if(typeof lucide!=="undefined")renderIcons();
}

function changeCoachWeek(dir){
  _ccWeekOffset+=dir;
  var coachName=currentUser&&currentUser.coachName;
  if(coachName)renderCoachDashboard(coachName);
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
  if(typeof lucide!=="undefined")renderIcons();
}

function getMonthRankReq(month){
  if(month<=2)return{name:'Rookie',minRank:'Hierro',minVal:1};
  if(month<=4)return{name:'Trainee',minRank:'Bronce',minVal:2};
  if(month<=5)return{name:'Amateur',minRank:'Plata',minVal:3};
  if(month<=7)return{name:'Competitor',minRank:'Oro',minVal:4};
  if(month<=9)return{name:'Elite',minRank:'Platino',minVal:5};
  if(month<=11)return{name:'Semi-Pro',minRank:'Diamante',minVal:6};
  if(month<=12)return{name:'Pro',minRank:'Ascendente',minVal:7};
  return{name:'Pro',minRank:'Inmortal',minVal:8};
}

function passStudentMonth(name){
  if(!confirm('¿Avanzar a '+esc(name)+' al siguiente mes?'))return;
  var m=(DATA.members||[]).find(function(m){return m.name===name});
  if(!m){toast('Miembro no encontrado','err');return}
  var nextMonth=(m.current_month||1)+1;
  var req=getMonthRankReq(nextMonth);
  var studentRank=rankValue(m.rank);
  if(studentRank<req.minVal){
    toast(esc(name)+' necesita al menos '+req.minRank+' para pasar al mes '+nextMonth+' ('+req.name+'). Tiene: '+(m.rank||'—'),'err');
    return;
  }
  m.current_month=nextMonth;
  if(m.current_month>12){
    m.current_month=12;
    m.academy_status='graduated';
    toast(name+' ha completado todos los meses. ¡Graduado!','ok');
  }else{
    toast(name+' avanzó al mes '+(m.current_month||1)+' ('+req.name+')','ok');
  }
  saveData(DATA);
  var cn=currentUser&&currentUser.coachName;
  if(cn)renderCoachDashboard(cn);
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
  if(typeof lucide!=="undefined")renderIcons();
}
