// ========== ADMIN ATTENDANCE ==========
var _attPending={};

function renderSection_attendance(){
  var classes=filterByCurrentCoach((DATA.schedule||[]).filter(function(s){return s.type==='academia'}));
  var allMembers=DATA.members||[];
  var members=currentUser&&currentUser.coachName?filterByCurrentCoach(allMembers):allMembers;
  var att=DATA.attendance||[];
  var today=new Date().toISOString().slice(0,10);
  var h='<div style="display:grid;gap:20px">';
  h+='<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">'+
    '<div class="glass-card" style="padding:16px;text-align:center"><div class="number gradient-text">'+classes.length+'</div><div style="color:#888;font-size:13px">Clases semanales</div></div>'+
    '<div class="glass-card" style="padding:16px;text-align:center"><div class="number" style="color:#8b5cf6">'+att.filter(function(a){return a.status==='present'}).length+'</div><div style="color:#888;font-size:13px">Asistencias</div></div>'+
    '<div class="glass-card" style="padding:16px;text-align:center"><div class="number" style="color:#8b5cf6">'+att.filter(function(a){return a.status==='absent'||a.status==='late'}).length+'</div><div style="color:#888;font-size:13px">Faltas/Tardanzas</div></div>'+
  '</div>';
  h+='<div class="glass-card" style="padding:20px"><h3 style="margin-bottom:12px">'+ic('bar-chart-3',18)+' Estadísticas por miembro</h3><div style="display:grid;gap:8px">';
  members.forEach(function(m){
    var ma=att.filter(function(a){return a.member_name===m.name});
    var p=ma.filter(function(a){return a.status==='present'}).length;
    var a=ma.filter(function(a){return a.status==='absent'}).length;
    var l=ma.filter(function(a){return a.status==='late'}).length;
    var t=ma.length||1;
    h+='<div class="has-glow" style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:rgba(255,255,255,0.02);border-radius:8px">'+
      '<span style="font-weight:500">'+esc(m.name)+'</span>'+
      '<span style="color:#888;font-size:13px"><span style="color:#8b5cf6">'+p+'</span> · <span style="color:#8b5cf6">'+a+'</span> · <span style="color:#a78bfa">'+l+'</span> · <span style="color:#555">'+Math.round(p/t*100)+'%</span></span>'+
    '</div>';
  });
  if(!members.length)h+='<div style="color:#555;text-align:center;padding:20px">No hay miembros registrados</div>';
  h+='</div></div>';
  var confs=DATA.attendance_confirmations||[];
  var todayStr=new Date().toISOString().slice(0,10);
  var todayConfs=confs.filter(function(c){return c.date===todayStr});
  h+='<div class="glass-card" style="padding:20px"><h3 style="margin-bottom:12px">'+ic('calendar-check',18)+' Confirmaciones hoy ('+todayStr+')</h3>'+
    (todayConfs.length?'<div style="display:grid;gap:6px">'+todayConfs.map(function(c){
      return '<div class="has-glow" style="display:flex;justify-content:space-between;padding:8px 14px;background:rgba(255,255,255,0.03);border-radius:8px">'+
        '<span>'+esc(c.member_name)+'</span><span style="color:'+(c.will_attend?'#8b5cf6':'#8b5cf6')+'">'+(c.will_attend?'✓ Asistirá':'✗ No asistirá')+'</span></div>';
    }).join('')+'</div>':'<div style="color:#555;padding:12px;text-align:center">Nadie ha confirmado aún hoy</div>')+
  '</div>';
  if(!classes.length){
    h+='<div class="empty-state"><div class="icon">'+ic('calendar',40)+'</div><p>No hay clases de academia en el horario. Crea una en Horarios con tipo "academia".</p></div>';
  }else{
    h+='<div class="glass-card" style="padding:20px"><h3 style="margin-bottom:12px">'+ic('clipboard-check',18)+' Marcar / Editar asistencia</h3>';
    h+='<div style="display:grid;gap:12px;max-width:500px">'+
      '<div class="field"><label for="attClassSelect">Clase</label><select class="input-field" id="attClassSelect" onchange="renderAttMemberList()">'+
      classes.map(function(c,i){var days=['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];return'<option value="'+c.id+'">'+esc(c.title)+' ('+days[c.day]+' '+toLocalTime(c.start,c.tz)+')</option>'}).join('')+
      '</select></div>'+
      '<div class="field"><label for="attDate">Fecha</label><input type="date" class="input-field" id="attDate" value="'+today+'" onchange="renderAttMemberList()"></div>'+
    '</div>';
    h+='<div id="attMemberList"></div>';
    h+='<button class="btn-primary" onclick="saveAllAttendance()" style="margin-top:14px;justify-content:center">'+ic('save',16)+' Guardar Asistencia</button>'+
    '</div>';
  }
  h+='</div>';
  document.getElementById('adminContent').innerHTML=h;
  if(classes.length)renderAttMemberList();
}

function renderAttMemberList(){
  var allMembers=DATA.members||[];
  var members=currentUser&&currentUser.coachName?filterByCurrentCoach(allMembers):allMembers;
  var att=DATA.attendance||[];
  var date=document.getElementById('attDate').value;
  var sid=document.getElementById('attClassSelect').value;
  var container=document.getElementById('attMemberList');
  if(!container)return;
  if(!members.length){container.innerHTML='<div style="color:#555;text-align:center;padding:20px">No hay miembros para marcar asistencia</div>';return}
  _attPending={};
  var h='<div style="margin-top:14px;display:grid;gap:8px">';
  members.forEach(function(m){
    var existing=att.filter(function(a){return a.schedule_id===sid&&a.member_name===m.name&&a.date===date});
    var cur=existing.length?existing[0].status:'present';
    if(!existing.length)_attPending[m.name]='present';
    else _attPending[m.name]=cur;
    h+='<div class="has-glow" style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:rgba(255,255,255,0.02);border-radius:8px">'+
      '<span>'+esc(m.name)+'</span>'+
      '<div style="display:flex;gap:6px">'+
        '<button class="btn-sm '+(cur==='present'?'save':'cancel')+'" onclick="markAtt(\''+m.name+'\',\'present\',this)" data-stat="present">'+ic('check',14)+' Presente</button>'+
        '<button class="btn-sm '+(cur==='late'?'danger':'cancel')+'" onclick="markAtt(\''+m.name+'\',\'late\',this)" data-stat="late">'+ic('clock',14)+' Tarde</button>'+
        '<button class="btn-sm '+(cur==='absent'?'danger':'cancel')+'" onclick="markAtt(\''+m.name+'\',\'absent\',this)" data-stat="absent">'+ic('x',14)+' Ausente</button>'+
      '</div></div>';
  });
  h+='</div>';
  container.innerHTML=h;
  _flushIcons();
}

function markAtt(name,status,btn){
  _attPending[name]=status;
  var container=btn.closest('[style*="display:flex"]');
  if(container){
    container.querySelectorAll('.btn-sm').forEach(function(b){b.className=b.className.replace(/save|danger/g,'').trim()+' cancel'});
    btn.className='btn-sm save';
  }
}

function saveAllAttendance(){
  var date=document.getElementById('attDate').value;
  var sid=document.getElementById('attClassSelect').value;
  if(!sid){toast('Selecciona un horario primero','error');return}
  if(!(DATA.schedule||[]).some(function(s){return s.id===sid})){toast('El horario seleccionado ya no existe, recarga la página','error');return}
  var names=Object.keys(_attPending);
  if(!names.length){toast('Selecciona estado para al menos un miembro','error');return}
  var records=names.filter(function(n){return _attPending[n]}).map(function(n){return{schedule_id:sid,member_name:n,date:date,status:_attPending[n],marked_by:'coach'}});
  if(!records.length){toast('No hay cambios para guardar','error');return}
  var allData=DATA.attendance||[];
  records.forEach(function(r){
    allData=allData.filter(function(a){return!(a.schedule_id===r.schedule_id&&a.member_name===r.member_name&&a.date===r.date)});
  });
  allData=allData.concat(records);
  DATA.attendance=allData;
  saveData(DATA);
  if(db&&db.from){
    db.from('attendance').delete().eq('schedule_id',sid).eq('date',date).then(function(){
      if(records.length)return db.from('attendance').insert(records);
    }).then(function(){renderSection_attendance();updateCounts();_attPending={};toast('Asistencia guardada')}).catch(function(e){toast('Error: '+e.message,'error')});
  }else{
    renderSection_attendance();updateCounts();_attPending={};toast('Asistencia guardada (solo local)');
  }
}
