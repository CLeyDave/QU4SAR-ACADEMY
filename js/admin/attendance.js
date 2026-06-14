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
    h+='<div class="" style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:rgba(255,255,255,0.02);border-radius:8px">'+
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
      return '<div class="" style="display:flex;justify-content:space-between;padding:8px 14px;background:rgba(255,255,255,0.03);border-radius:8px">'+
        '<span>'+esc(c.member_name)+'</span><span style="color:'+(c.will_attend?'#8b5cf6':'#8b5cf6')+'">'+(c.will_attend?ic('check-circle',12)+' Asistirá':ic('x-circle',12)+' No asistirá')+'</span></div>';
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
  renderAttHistory();
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
    h+='<div class="" style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:rgba(255,255,255,0.02);border-radius:8px">'+
      '<span>'+esc(m.name)+'</span>'+
      '<div style="display:flex;gap:6px">'+
        '<button class="btn-sm '+(cur==='present'?'save':'cancel')+'" onclick="markAtt(\''+m.name+'\',\'present\',this)" data-stat="present">'+ic('check',14)+' Presente</button>'+
        '<button class="btn-sm '+(cur==='late'?'danger':'cancel')+'" onclick="markAtt(\''+m.name+'\',\'late\',this)" data-stat="late">'+ic('clock',14)+' Tarde</button>'+
        '<button class="btn-sm '+(cur==='absent'?'danger':'cancel')+'" onclick="markAtt(\''+m.name+'\',\'absent\',this)" data-stat="absent">'+ic('x',14)+' Ausente</button>'+
      '</div></div>';
  });
  h+='</div>';
  container.innerHTML=h;
  if(typeof lucide!=="undefined")renderIcons();
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
      if(records.length)return db.from('attendance').insert(records).select();
    }).then(function(res){
      if(res&&res.data&&res.data.length){
        res.data.forEach(function(r){
          var idx=DATA.attendance.findIndex(function(a){return a.schedule_id===r.schedule_id&&a.member_name===r.member_name&&a.date===r.date});
          if(idx>=0)DATA.attendance[idx].id=r.id;
        });
        try{localStorage.setItem('quasar_admin_data',JSON.stringify(DATA))}catch(e){}
      }
      renderSection_attendance();updateCounts();_attPending={};toast('Asistencia guardada');
    }).catch(function(e){toast('Error: '+e.message,'error')});
  }else{
    renderSection_attendance();updateCounts();_attPending={};toast('Asistencia guardada (solo local)');
  }
}

function renderAttHistory(){
  var container=document.getElementById('adminContent');
  if(!container)return;
  var att=DATA.attendance||[];
  if(!att.length)return;
  // remove old history if present
  var old=document.getElementById('attHistContainer');
  if(old)old.remove();
  var scheduleMap={};(DATA.schedule||[]).forEach(function(s){scheduleMap[s.id]=s});
  var h='<div class="glass-card" style="padding:20px;margin-top:20px">'+
    '<div style="font-size:10px;color:#555;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:14px">'+ic('clock',12)+' HISTORIAL DE ASISTENCIA</div>'+
    '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">'+
      '<input class="input-field" id="attHistFilterName" placeholder="Filtrar por nombre..." style="flex:1;min-width:120px;padding:8px 12px;font-size:12px" oninput="renderAttHistory()">'+
      '<input type="date" class="input-field" id="attHistFilterFrom" style="padding:8px 12px;font-size:12px;width:auto" onchange="renderAttHistory()">'+
      '<input type="date" class="input-field" id="attHistFilterTo" style="padding:8px 12px;font-size:12px;width:auto" onchange="renderAttHistory()">'+
      '<select class="input-field" id="attHistFilterStatus" style="padding:8px 12px;font-size:12px;width:auto" onchange="renderAttHistory()">'+
        '<option value="">Todos</option><option value="present">Presente</option><option value="late">Tarde</option><option value="absent">Ausente</option>'+
      '</select>'+
    '</div>'+
    '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">'+
      '<label class="batch-sel-all"><input type="checkbox" onchange="toggleAllAttRows(this)"> Seleccionar todo</label>'+
      '<button class="btn-sm cancel" onclick="batchDelAtt()" id="batchDelAttBtn" style="display:none">'+ic('trash-2',12)+' Eliminar seleccionados</button>'+
      '<span id="batchAttCount" style="font-size:12px;color:#666"></span></div>'+
    '<div style="overflow-x:auto"><table class="cc-compare-table" style="width:100%">'+
    '<thead><tr><th style="width:32px"></th><th>Miembro</th><th>Clase</th><th>Fecha</th><th>Estado</th><th style="width:80px"></th></tr></thead><tbody>';
  var nameFilter=(document.getElementById('attHistFilterName')||{}).value||'';
  var fromFilter=(document.getElementById('attHistFilterFrom')||{}).value||'';
  var toFilter=(document.getElementById('attHistFilterTo')||{}).value||'';
  var statusFilter=(document.getElementById('attHistFilterStatus')||{}).value||'';
  var filtered=att.filter(function(a){
    if(nameFilter&&!a.member_name.toLowerCase().includes(nameFilter.toLowerCase()))return false;
    if(fromFilter&&a.date<fromFilter)return false;
    if(toFilter&&a.date>toFilter)return false;
    if(statusFilter&&a.status!==statusFilter)return false;
    return true;
  });
  filtered.sort(function(a,b){return(a.date||'')<(b.date||'')?1:-1});
  filtered.forEach(function(a){
    var sched=scheduleMap[a.schedule_id]||{};
    var label={'present':'Presente','late':'Tarde','absent':'Ausente'}[a.status]||a.status;
    var color={'present':'#4ade80','late':'#fbbf24','absent':'#f43f5e'}[a.status]||'#888';
    h+='<tr>'+
      '<td><input type="checkbox" class="att-cb" data-id="'+esc(a.id)+'" data-name="'+esc(a.member_name)+'" onchange="updateAttBatchBtn()"></td>'+
      '<td><span style="font-weight:500;color:#e0e0e0">'+esc(a.member_name)+'</span></td>'+
      '<td style="color:#888;font-size:12px">'+esc(sched.title||'—')+'</td>'+
      '<td style="color:#888">'+(a.date?new Date(a.date+'T12:00:00').toLocaleDateString('es-ES',{day:'numeric',month:'short',year:'numeric'}):'—')+'</td>'+
      '<td><span class="att-status-badge" style="cursor:pointer;padding:4px 10px;border-radius:6px;font-size:11px;font-weight:600;color:#000;background:'+color+'" onclick="editAttStatus(\''+esc(a.member_name)+'\',\''+esc(a.schedule_id)+'\',\''+esc(a.date)+'\',this)">'+label+'</span></td>'+
      '<td><button class="btn-sm cancel" onclick="delAttRecord(\''+esc(a.id)+'\',\''+esc(a.member_name)+'\')" title="Eliminar" style="padding:4px 8px">'+ic('trash-2',12)+'</button></td>'+
    '</tr>';
  });
  if(!filtered.length)h+='<tr><td colspan="6" style="text-align:center;padding:20px;color:#555">Sin resultados</td></tr>';
  h+='</tbody></table></div></div>';
  container.insertAdjacentHTML('beforeend',h);
  if(typeof lucide!=="undefined")renderIcons();
}

function editAttStatus(memberName,scheduleId,date,el){
  var current=el.textContent.trim();
  var opts=['present','late','absent'];
  var labels={'present':'Presente','late':'Tarde','absent':'Ausente'};
  var colors={'present':'#4ade80','late':'#fbbf24','absent':'#f43f5e'};
  var curIdx=opts.indexOf(Object.keys(labels).find(function(k){return labels[k]===current})||'present');
  var nextIdx=(curIdx+1)%opts.length;
  var newStatus=opts[nextIdx];
  el.textContent=labels[newStatus];
  el.style.background=colors[newStatus];
  saveAttEdit(memberName,scheduleId,date,newStatus,el);
}

function saveAttEdit(memberName,scheduleId,date,newStatus,el){
  DATA.attendance=(DATA.attendance||[]).map(function(a){
    if(a.member_name===memberName&&a.schedule_id===scheduleId&&a.date===date){
      a.status=newStatus;
    }
    return a;
  });
  saveData(DATA);
  if(db&&db.from){
    db.from('attendance').delete().eq('schedule_id',scheduleId).eq('member_name',memberName).eq('date',date).then(function(){
      return db.from('attendance').insert([{schedule_id:scheduleId,member_name:memberName,date:date,status:newStatus,marked_by:'coach'}]).select();
    }).then(function(res){
      if(res&&res.data&&res.data.length){
        res.data.forEach(function(r){
          var idx=DATA.attendance.findIndex(function(a){return a.schedule_id===r.schedule_id&&a.member_name===r.member_name&&a.date===r.date});
          if(idx>=0)DATA.attendance[idx].id=r.id;
        });
        try{localStorage.setItem('quasar_admin_data',JSON.stringify(DATA))}catch(e){}
      }
      updateCounts();toast('Asistencia actualizada','ok');
    }).catch(function(e){toast('Error: '+e.message,'error')});
  }else{
    updateCounts();toast('Asistencia actualizada (solo local)','ok');
  }
}

function delAttRecord(id,memberName){
  if(!confirm('¿Eliminar asistencia de '+memberName+'?'))return;
  if(!id){toast('Error: ID no encontrado','error');return}
  // Delete from Supabase first, then update local
  DATA.attendance=(DATA.attendance||[]).filter(function(a){return a.id!==id});
  saveData(DATA);
  if(db&&db.from){
    db.from('attendance').delete().eq('id',id).then(function(res){
      if(res.error)throw res.error;
      updateCounts();renderSection_attendance();toast('Asistencia eliminada','ok');
    }).catch(function(e){
      console.error('Error al eliminar:',e);
      toast('Error: '+(e.message||e),'error');
    });
  }else{
    updateCounts();renderSection_attendance();toast('Asistencia eliminada (solo local)','ok');
  }
}

function toggleAllAttRows(el){document.querySelectorAll('.att-cb').forEach(function(cb){cb.checked=el.checked});updateAttBatchBtn()}
function updateAttBatchBtn(){
  var n=document.querySelectorAll('.att-cb:checked').length;
  var btn=document.getElementById('batchDelAttBtn');
  var cnt=document.getElementById('batchAttCount');
  if(btn)btn.style.display=n?'inline-flex':'none';
  if(cnt)cnt.textContent=n?'('+n+' seleccionados)':'';
}
function batchDelAtt(){
  var ids=[];
  document.querySelectorAll('.att-cb:checked').forEach(function(cb){ids.push({id:cb.getAttribute('data-id'),name:cb.getAttribute('data-name')})});
  if(!ids.length)return;
  if(!confirm('¿Eliminar '+ids.length+' registro(s) de asistencia?'))return;
  ids.forEach(function(item){delAttRecord(item.id,item.name)});
}
