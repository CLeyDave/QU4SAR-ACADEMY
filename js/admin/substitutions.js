// ========== ADMIN SUBSTITUTIONS ==========

function renderSection_substitutions(){
  var gid=(document.getElementById('adminGF')&&document.getElementById('adminGF').value)||'';
  var items=filterByCurrentCoach(DATA.substitutions||[]);
  if(gid)items=items.filter(function(i){return i.group_id===gid});
  var fh=adminGroupFilterHTML(gid,'renderSubstitutions()');
  var btn='<button class="btn-primary" onclick="subForm(null)" style="margin-bottom:14px;font-size:13px">'+ic('plus',14)+' Nueva Sustitución</button>';
  document.getElementById('adminContent').innerHTML=fh+adminTable(items,['Solicitante','Rol','Estado','Cupo','Coach','Grupo'],function(s){
    var badges={open:'badge-yellow',fulfilled:'badge-green',cancelled:'badge-red'};
    return '<td>'+esc(s.requesting_member)+'</td><td>'+esc(s.needed_role)+'</td><td><span class="badge '+(badges[s.status]||'badge-gray')+'">'+esc(s.status)+'</span></td><td>'+esc(s.filled_by||'-')+'</td><td>'+esc(s.coach||'-')+'</td><td>'+groupName(s.group_id)+'</td><td><div class="has-glow admin-actions">'+
      (s.status==='open'?'<button onclick="fulfillSub(\''+s.id+'\')" title="Cumplida">'+ic('check',14)+'</button><button onclick="cancelSub(\''+s.id+'\')" title="Cancelar">'+ic('x',14)+'</button>':'')+
      '<button onclick="subForm(\''+s.id+'\')">'+ic('pencil',14)+'</button><button class="del" onclick="delSub(\''+s.id+'\')">'+ic('trash-2',14)+'</button></div></td>'},'No hay sustituciones',btn);
}

function subForm(id){
  var item=id?(DATA.substitutions||[]).find(function(s){return s.id===id}):null;
  var f=item||{schedule_id:'',requesting_member:'',needed_role:'',status:'open',filled_by:'',coach:dc(),group_id:''};
  openModal('<button class="modal-close" onclick="closeModal()">'+ic('x',16)+'</button><h3>'+(item?'Editar':'Nueva')+' Sustitución</h3>'+
    '<div class="field"><label>Horario</label><select class="input-field" id="sf_schedule_id">'+(DATA.schedule||[]).map(function(s){var days=['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];return'<option value="'+s.id+'" '+(s.id===f.schedule_id?'selected':'')+'>'+esc(s.title)+' ('+days[s.day]+' '+toLocalTime(s.start,s.tz)+')</option>'}).join('')+'</select></div>'+
    '<div class="field"><label>Solicitante</label><input class="input-field" id="sf_requesting_member" value="'+esc(f.requesting_member)+'"></div>'+
    '<div class="field"><label>Rol necesario</label><input class="input-field" id="sf_needed_role" value="'+esc(f.needed_role)+'"></div>'+
    '<div class="field"><label>Estado</label><select class="input-field" id="sf_status"><option value="open" '+(f.status==='open'?'selected':'')+'>Abierta</option><option value="fulfilled" '+(f.status==='fulfilled'?'selected':'')+'>Cumplida</option><option value="cancelled" '+(f.status==='cancelled'?'selected':'')+'>Cancelada</option></select></div>'+
    '<div class="field"><label>Cubierta por</label><input class="input-field" id="sf_filled_by" value="'+esc(f.filled_by||'')+'"></div>'+
    '<div class="field"><label>Coach</label><select class="input-field" id="subf_coach" onchange="setGroupFromCoach(\'subf_group\',\'subf_coach\')"><option value="">Sin coach</option>'+coachOptions(f.coach||'',f.group_id)+'</select></div>'+
    '<div class="field" style="display:none"><label>Grupo</label><select class="input-field" id="subf_group" onchange="reloadCoachDropdown(\'subf_coach\',this.value)"><option value="">General (Ambos)</option>'+(DATA.groups||[]).map(function(g){return'<option value="'+g.id+'"'+(f.group_id===g.id?' selected':'')+'>'+esc(g.name)+'</option>'}).join('')+'</select></div>'+
    '<button class="btn-primary" onclick="saveSub(\''+(id||'')+'\')" style="width:100%;justify-content:center">'+ic('save',16)+' Guardar</button>');
}

function saveSub(id){
  var obj={schedule_id:document.getElementById('sf_schedule_id').value,requesting_member:document.getElementById('sf_requesting_member').value,needed_role:document.getElementById('sf_needed_role').value,status:document.getElementById('sf_status').value,filled_by:document.getElementById('sf_filled_by').value,coach:document.getElementById('subf_coach').value,group_id:document.getElementById('subf_group').value};
  if(id){var idx=DATA.substitutions.findIndex(function(s){return s.id===id});if(idx>=0)DATA.substitutions[idx]={...DATA.substitutions[idx],...obj}}else{obj.id=uid();DATA.substitutions.push(obj)}
  saveData(DATA);closeModal();renderSection_substitutions();updateCounts();toast(id?'Sustitución actualizada':'Sustitución creada');
}

function delSub(id){if(!confirmDel())return;DATA.substitutions=DATA.substitutions.filter(function(s){return s.id!==id});saveData(DATA);renderSection_substitutions();updateCounts();toast('Sustitución eliminada');}

function fulfillSub(id){
  if(!confirmDel('¿Marcar esta sustitución como cumplida?'))return;
  if(!DATA.substitutions)DATA.substitutions=[];
  var idx=DATA.substitutions.findIndex(function(s){return s.id===id});
  if(idx>=0){DATA.substitutions[idx].status='fulfilled';saveData(DATA);renderSection_substitutions();updateCounts();toast('Sustitución marcada como cumplida')}
}

function cancelSub(id){
  if(!confirmDel('¿Cancelar esta sustitución?'))return;
  if(!DATA.substitutions)DATA.substitutions=[];
  var idx=DATA.substitutions.findIndex(function(s){return s.id===id});
  if(idx>=0){DATA.substitutions[idx].status='cancelled';saveData(DATA);renderSection_substitutions();updateCounts();toast('Sustitución cancelada')}
}
