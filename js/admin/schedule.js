// ========== ADMIN SCHEDULE ==========

function renderSection_schedule(){
  var gid=document.getElementById('sf_filterGroup')?document.getElementById('sf_filterGroup').value:'';
  var days=['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];

  var cw=getCurrentWeekStart();
  var weekSet={}; (DATA.schedule||[]).forEach(function(s){if(s.week_start) weekSet[s.week_start]=true});
  weekSet[cw]=true;
  var sortedWeeks=Object.keys(weekSet).sort().reverse();
  var selWeek=document.getElementById('sf_weekFilter')?document.getElementById('sf_weekFilter').value:cw;
  var weekOpts=sortedWeeks.map(function(w){
    var label=w===cw?'Esta semana ('+getWeekLabel(w)+')':getWeekLabel(w);
    return '<option value="'+w+'" '+(selWeek===w?'selected':'')+'>'+esc(label)+'</option>';
  }).join('');

  var items=filterByCurrentCoach(DATA.schedule||[]);
  if(gid)items=items.filter(function(s){return s.group_id===gid});
  items=items.filter(function(s){return (s.week_start||cw)===selWeek});

  var btn='<button class="btn-primary" onclick="schedForm(null)" style="margin-bottom:14px;font-size:13px">'+ic('plus',14)+' Nuevo Horario</button>';
  var copyBtn='<button class="btn-primary" onclick="copyLastWeek()" style="margin-bottom:14px;margin-left:8px;font-size:13px;background:var(--neon)">'+ic('copy',14)+' Copiar de semana anterior</button>';
  var weekFilter='<div style="margin-bottom:14px;display:flex;gap:12px;align-items:center;flex-wrap:wrap">'+
    '<label style="font-size:13px;color:#888">Semana:</label>'+
    '<select class="input-field" id="sf_weekFilter" onchange="renderSection_schedule()" style="width:auto;min-width:200px;padding:6px 10px;font-size:13px">'+weekOpts+'</select></div>';
  var filter='<div style="margin-bottom:14px;display:flex;gap:12px;align-items:center;flex-wrap:wrap">'+
    '<label style="font-size:13px;color:#888">Filtrar por grupo:</label>'+
    '<select class="input-field" id="sf_filterGroup" onchange="renderSection_schedule()" style="width:auto;min-width:140px;padding:6px 10px;font-size:13px">'+
    '<option value="">Todos</option>'+(DATA.groups||[]).map(function(g){return'<option value="'+g.id+'" '+(gid===g.id?'selected':'')+'>'+esc(g.name)+'</option>'}).join('')+'</select></div>';

  var table=adminTable(items,['Título','Tipo','Día','Horario','Coach','Grupo'],function(s){
    return '<td>'+esc(s.title)+'</td><td>'+esc(s.type)+'</td><td>'+days[s.day]+'</td><td>'+esc(toLocalTime(s.start,s.tz))+' - '+esc(toLocalTime(s.end,s.tz))+'</td><td>'+esc(s.coach||'-')+'</td><td>'+groupName(s.group_id)+'</td>'+
      '<td><div class=" admin-actions">'+
        '<button onclick="schedForm(\''+s.id+'\')" title="Editar">'+ic('pencil',14)+'</button>'+
        '<button class="del" onclick="delSched(\''+s.id+'\')" title="Eliminar">'+ic('trash-2',14)+'</button>'+
      '</div></td>'
  },'No hay horarios',btn,'delSched');

  var hist=(DATA.schedule_history||[]).slice().reverse();
  var histHTML='<div style="margin-top:32px"><h4 style="cursor:pointer;color:var(--neon);font-size:14px;display:flex;align-items:center;gap:6px" onclick="var e=document.getElementById(\'histBody\');e.style.display=e.style.display===\'none\'?\'\':\'none\'">'+ic('clock',14)+' Historial de cambios <span style="font-size:11px;color:#666">('+(hist.length||0)+')</span></h4>'+
    '<div id="histBody" style="display:none;margin-top:8px">';
  if(hist.length){
    histHTML+='<table class="admin-table" style="font-size:12px"><thead><tr><th>Fecha</th><th>Horario</th><th>Acción</th><th>Coach</th></tr></thead><tbody>';
    hist.forEach(function(h){
      var d=new Date(h.timestamp);
      var ds=d.toLocaleDateString('es',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
      var act=h.action==='created'?'Creado':h.action==='updated'?'Editado':'Eliminado';
      var ac=esc(h.title||'');
      histHTML+='<tr><td style="white-space:nowrap">'+ds+'</td><td>'+ac+'</td><td>'+act+'</td><td>'+(h.modified_by||'—')+'</td></tr>';
    });
    histHTML+='</tbody></table>';
  }else{
    histHTML+='<div style="color:#555;font-size:13px;padding:8px 0">No hay cambios registrados</div>';
  }
  histHTML+='</div></div>';

  document.getElementById('adminContent').innerHTML=weekFilter+filter+copyBtn+table+histHTML;
}

function schedForm(id){
  var item=id?DATA.schedule.find(function(s){return s.id===id}):null;
  var f=item||{title:'',day:0,start:'18:00',end:'20:00',type:'entrenamiento',group_id:'',coach:dc()};
  var days=['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
  openModal('<button class="modal-close" onclick="closeModal()">'+ic('x',16)+'</button><h3>'+(item?'Editar':'Nuevo')+' Horario</h3>'+
    '<div class="field"><label for="sf_title">Título</label><input class="input-field" id="sf_title" value="'+esc(f.title)+'"></div>'+
    '<div class="grid-2"><div class="field"><label for="sf_day">Día</label><select class="input-field" id="sf_day">'+days.map(function(d,i){return'<option value="'+i+'" '+(i===f.day?'selected':'')+'>'+d+'</option>'}).join('')+'</select></div>'+
    '<div class="field"><label for="sf_type">Tipo</label><select class="input-field" id="sf_type"><option value="entrenamiento" '+(f.type==='entrenamiento'?'selected':'')+'>Entrenamiento</option><option value="academia" '+(f.type==='academia'?'selected':'')+'>Academia</option><option value="scrim" '+(f.type==='scrim'?'selected':'')+'>Scrim</option><option value="premier" '+(f.type==='premier'?'selected':'')+'>Premier</option></select></div></div>'+
    '<div class="grid-2"><div class="field"><label for="sf_start">Hora inicio</label><input type="time" class="input-field" id="sf_start" value="'+f.start+'"></div>'+
    '<div class="field"><label for="sf_end">Hora fin</label><input type="time" class="input-field" id="sf_end" value="'+f.end+'"></div></div>'+
    '<div class="field"><label for="sf_group">Grupo</label><select class="input-field" id="sf_group" onchange="reloadCoachDropdown(\'sf_coach\',this.value)"><option value="">General</option>'+(DATA.groups||[]).map(function(g){return'<option value="'+g.id+'" '+(f.group_id===g.id?'selected':'')+'>'+esc(g.name)+'</option>'}).join('')+'</select></div>'+
    '<div class="field"><label for="sf_coach">Coach</label><select class="input-field" id="sf_coach" onchange="setGroupFromCoach(\'sf_group\',\'sf_coach\')"><option value="">Sin coach</option>'+coachOptions(f.coach||'',f.group_id)+'</select></div>'+
    '<button class="btn-primary" onclick="saveSched(\''+(id||'')+'\')" style="width:100%;justify-content:center">'+ic('save',16)+' Guardar</button>');
}

function saveSched(id){
  var obj={title:document.getElementById('sf_title').value,day:parseInt(document.getElementById('sf_day').value),start:document.getElementById('sf_start').value,end:document.getElementById('sf_end').value,type:document.getElementById('sf_type').value,group_id:document.getElementById('sf_group').value,coach:document.getElementById('sf_coach')?.value||'',tz:detectTZ()};
  if(id){
    var old=DATA.schedule.find(function(s){return s.id===id});
    if(old) saveHistory(old,'updated');
    var idx=DATA.schedule.findIndex(function(s){return s.id===id});
    if(idx>=0)DATA.schedule[idx]={...DATA.schedule[idx],...obj}
  }else{obj.id=uid();obj.week_start=getCurrentWeekStart();DATA.schedule.push(obj)}
  saveData(DATA);closeModal();renderSection_schedule();updateCounts();toast(id?'Horario actualizado':'Horario creado');
}

function delSched(id){if(!confirmDel())return;var item=DATA.schedule.find(function(s){return s.id===id});if(item) saveHistory(item,'deleted');DATA.schedule=DATA.schedule.filter(function(s){return s.id!==id});saveData(DATA);renderSection_schedule();updateCounts();toast('Horario eliminado');}

function copyLastWeek(){
  var cw = getCurrentWeekStart();
  var weeks = {}; (DATA.schedule || []).forEach(function(s){ if (s.week_start) weeks[s.week_start] = true; });
  var sorted = Object.keys(weeks).sort().reverse();
  var lastWeek = sorted.find(function(w){ return w !== cw; });
  if (!lastWeek) { toast('No hay semanas anteriores para copiar'); return; }
  var src = (DATA.schedule || []).filter(function(s){ return s.week_start === lastWeek; });
  if (!src.length) { toast('No hay horarios en la semana anterior'); return; }
  src.forEach(function(s){
    var cp = JSON.parse(JSON.stringify(s));
    cp.id = uid();
    cp.week_start = cw;
    DATA.schedule.push(cp);
  });
  saveData(DATA);
  renderSection_schedule();
  toast(src.length + ' horario(s) copiado(s) de la semana anterior');
}
