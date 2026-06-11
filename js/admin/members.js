// ========== ADMIN MEMBERS ==========

function renderSection_members(){
  var totalCn=(DATA.coach_notes||[]).length;
  var totalRh=(DATA.rank_history||[]).length;
  var allMembers=DATA.members||[];
  var members=currentUser&&currentUser.coachName?filterByCurrentCoach(allMembers):allMembers;
  var selId='memberSel_'+(Math.random()+1).toString(36).slice(2,8);
  var btn='<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">'+
    '<button class="btn-primary" onclick="memberForm(null)" style="font-size:13px">'+ic('plus',14)+' Nuevo Miembro</button>'+
    '<button class="btn-secondary" onclick="distributeStudents()" style="font-size:13px">'+ic('users',14)+' Distribuir x Coach</button>'+
    '<button class="btn-secondary" onclick="resetMemberAssignments()" style="font-size:13px;border-color:rgba(139,92,246,0.2);color:#8b5cf6">'+ic('x-circle',14)+' Limpiar Asignaciones</button>'+
    '</div>'+
    '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;align-items:center">'+
      '<label style="display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer"><input type="checkbox" id="'+selId+'" onchange="document.querySelectorAll(\'.msel\').forEach(function(e){e.checked=this.checked},this)"> Seleccionar todos</label>'+
      '<button class="btn-sm cancel" onclick="deleteSelectedMembers()" style="font-size:12px">'+ic('trash-2',12)+' Eliminar seleccionados (<span id="selCount">0</span>)</button>'+
      '<button class="btn-sm cancel" onclick="deleteDuplicateMembers()" style="font-size:12px;border-color:rgba(139,92,246,0.2)">'+ic('copy',12)+' Eliminar duplicados</button>'+
    '</div>';
  document.getElementById('adminContent').innerHTML=adminTable(members,['','Nombre','Rol','Rango','Coach','Grupo'],function(m,i){
    return '<td><input type="checkbox" class="msel" data-id="'+m.id+'" onchange="document.getElementById(\'selCount\').textContent=document.querySelectorAll(\'.msel:checked\').length"></td>'+
      '<td>'+esc(m.name)+'</td><td>'+esc(m.role)+'</td><td>'+esc(m.rank||'-')+'</td>'+
      '<td>'+esc(m.coach||'-')+'</td>'+
      '<td>'+groupName(m.group_id)+'</td>'+
      '<td><div class="has-glow admin-actions">'+
        '<button onclick="memberForm(\''+m.id+'\')" title="Editar">'+ic('pencil',14)+'</button>'+
        '<button onclick="showCoachNotes(\''+esc(m.name)+'\')" title="Notas">'+ic('sticky-note',14)+'</button>'+
        '<button onclick="showRankHistory(\''+esc(m.name)+'\')" title="Rangos">'+ic('trending-up',14)+'</button>'+
        '<button onclick="makeCoachFromMember(\''+esc(m.name)+'\')" title="Hacer Coach">'+ic('user-check',14)+'</button>'+
        '<button class="del" onclick="delMember(\''+m.id+'\')" title="Eliminar">'+ic('trash-2',14)+'</button>'+
      '</div></td>'
  },'No hay miembros',btn)+(totalCn?'<div style="margin-top:8px;font-size:12px;color:#555">'+totalCn+' notas de coach · '+totalRh+' registros de rango</div>':'');
}

function deleteSelectedMembers(){
  var ids=[];
  document.querySelectorAll('.msel:checked').forEach(function(cb){ids.push(cb.getAttribute('data-id'))});
  if(!ids.length){toast('Selecciona al menos un miembro','err');return}
  if(!confirm('¿Eliminar '+ids.length+' miembro(s) seleccionado(s)?'))return;
  ids.forEach(function(id){DATA.members=DATA.members.filter(function(m){return m.id!==id})});
  saveData(DATA);renderSection_members();updateCounts();toast(ids.length+' miembro(s) eliminado(s)','ok');
}

function deleteDuplicateMembers(){
  var seen={},removed=0;
  DATA.members=DATA.members.filter(function(m){
    var key=m.name.toLowerCase();
    if(seen[key]){removed++;return false}
    seen[key]=true;return true
  });
  if(!removed){toast('No hay miembros duplicados','info');return}
  saveData(DATA);renderSection_members();updateCounts();toast(removed+' duplicado(s) eliminado(s)','ok');
}

function memberForm(id){
  var item=id?DATA.members.find(function(m){return m.id===id}):null;
  var f=item||{name:'',role:'Duelist',rank:'',coach:dc(),image:'',description:'',group_id:''};
  openModal('<button class="modal-close" onclick="closeModal()">'+ic('x',16)+'</button><h3>'+(item?'Editar':'Nuevo')+' Miembro</h3>'+
    '<div class="field"><label>Nombre</label><input class="input-field" id="mf_name" value="'+esc(f.name)+'"></div>'+
    '<div class="grid-2"><div class="field"><label>Rol</label><select class="input-field" id="mf_role">'+['Duelist','Initiator','Controller','Sentinel','Flex','Coach'].map(function(r){return'<option value="'+r+'" '+(r===f.role?'selected':'')+'>'+r+'</option>'}).join('')+'</select></div>'+
    '<div class="field"><label>Rango</label><input class="input-field" id="mf_rank" value="'+esc(f.rank||'')+'"></div></div>'+
    '<div class="grid-2"><div class="field"><label>Coach</label><select class="input-field" id="mf_coach" onchange="setGroupFromCoach(\'mf_group\',\'mf_coach\')"><option value="">Sin coach</option>'+coachOptions(f.coach||'',f.group_id)+'</select></div>'+
    '<div class="field"><label>Imagen URL</label><input class="input-field" id="mf_image" value="'+esc(f.image||'')+'"></div></div>'+
    '<div class="field"><label>Descripción</label><textarea class="input-field" id="mf_desc" rows="3">'+esc(f.description||'')+'</textarea></div>'+
    '<div class="field"><label>Grupo</label><select class="input-field" id="mf_group" onchange="reloadCoachDropdown(\'mf_coach\',this.value);autoAssignCoachToMember(\'mf_coach\',this.value)"><option value="">Sin grupo</option>'+(DATA.groups||[]).map(function(g){return'<option value="'+g.id+'"'+(f.group_id===g.id?' selected':'')+'>'+esc(g.name)+'</option>'}).join('')+'</select></div>'+
    '<button class="btn-primary" onclick="saveMember(\''+(id||'')+'\')" style="width:100%;justify-content:center">'+ic('save',16)+' Guardar</button>');
}

function autoAssignCoachToMember(coachSelectId,groupId){
  if(!groupId)return;
  var el=document.getElementById(coachSelectId);
  if(!el)return;
  var coach=autoAssignCoach(groupId);
  if(coach){el.value=coach}
}

function saveMember(id){
  var obj={name:document.getElementById('mf_name').value,role:document.getElementById('mf_role').value,rank:document.getElementById('mf_rank').value,coach:document.getElementById('mf_coach').value,image:document.getElementById('mf_image').value,description:document.getElementById('mf_desc').value,group_id:document.getElementById('mf_group').value};
  if(!obj.name.trim()){toast('El nombre es obligatorio','err');return}
  if(!DATA.members)DATA.members=[];
  var dup=(DATA.members||[]).find(function(m){return m.name.toLowerCase()===obj.name.toLowerCase()&&m.id!==id});
  if(dup){toast('Ya existe un miembro con ese nombre: '+dup.name,'err');return}
  if(id){var idx=DATA.members.findIndex(function(m){return m.id===id});if(idx>=0)DATA.members[idx]={...DATA.members[idx],...obj}}else{obj.id=uid();DATA.members.push(obj)}
  saveData(DATA);closeModal();renderSection_members();updateCounts();toast(id?'Miembro actualizado':'Miembro agregado');
}

function delMember(id){if(!confirmDel())return;DATA.members=DATA.members.filter(function(m){return m.id!==id});saveData(DATA);renderSection_members();updateCounts();toast('Miembro eliminado');}

function makeCoachFromMember(name){
  if((DATA.coaches||[]).find(function(c){return c.name===name}))return toast('Ya existe un coach con ese nombre','error');
  var realName='';
  var app=(DATA.applications||[]).find(function(a){return a.valorant===name||a.name===name});
  if(app&&app.name)realName=app.name;
  var base=realName||name.split('#')[0].split(' ').pop();
  openModal('<button class="modal-close" onclick="closeModal()">'+ic('x',16)+'</button><h3>Hacer Coach: '+esc(name)+'</h3>'+
    '<p style="color:#888;font-size:13px;margin-bottom:14px">Crea un nuevo coach a partir de este miembro. Luego completa los datos en la página de Coaches.</p>'+
    '<div class="field"><label>Nombre</label><input class="input-field" id="cf_name" value="'+esc(realName||name)+'"></div>'+
    '<div class="field"><label>Nickname (Valorant)</label><input class="input-field" id="cf_nickname" value="'+esc(name)+'"></div>'+
    '<div class="field"><label>Contraseña temporal</label><input class="input-field" id="cf_password" value="qu4sar'+base+'_"></div>'+
    '<button class="btn-primary" onclick="saveQuickCoach()" style="width:100%;justify-content:center">'+ic('user-check',16)+' Crear Coach</button>');
}

function saveQuickCoach(){
  var name=document.getElementById('cf_name').value.trim();
  var nickname=document.getElementById('cf_nickname').value.trim();
  var pass=document.getElementById('cf_password').value;
  if(!name||!nickname){toast('Nombre y nickname son obligatorios','err');return}
  if(!DATA.coaches)DATA.coaches=[];
  DATA.coaches.push({id:uid(),name:name,nickname:nickname,email:'',status:'active',coach_groups:[]});
  saveData(DATA);closeModal();renderSection_members();updateCounts();toast('Coach creado: '+name,'ok');
}

function showCoachNotes(name){
  var notes=(DATA.coach_notes||[]).filter(function(n){return n.member_name===name});
  var h='<button class="modal-close" onclick="closeModal()">'+ic('x',16)+'</button><h3>'+ic('sticky-note',16)+' Notas: '+esc(name)+'</h3>'+
    '<div style="margin-bottom:14px;max-height:300px;overflow-y:auto;display:grid;gap:8px">';
  if(!notes.length)h+='<div style="color:#555;padding:12px">Sin notas aún</div>';
  notes.forEach(function(n){
    h+='<div class="has-glow" style="padding:10px 14px;background:rgba(255,255,255,0.03);border-radius:8px;border-left:3px solid var(--neon)">'+
      '<div style="color:#ccc;font-size:14px">'+esc(n.note)+'</div>'+
      '<div style="color:#555;font-size:11px;margin-top:4px">'+esc(n.category)+' · '+(n.created_at?new Date(n.created_at).toLocaleString('es-ES'):'')+'</div></div>';
  });
  h+='</div><div class="field"><textarea class="input-field" id="cn_text" rows="2" placeholder="Nueva nota..."></textarea></div>'+
    '<div class="field"><label>Categoría</label><input class="input-field" id="cn_cat" value="general" placeholder="ej: aim, game_sense, actitud"></div>'+
    '<button class="btn-primary" onclick="addCoachNote(\''+esc(name)+'\')" style="width:100%;justify-content:center">'+ic('plus',16)+' Agregar Nota</button>';
  openModal(h);
}

function addCoachNote(name){
  var text=document.getElementById('cn_text').value.trim();
  if(!text){toast('Escribe una nota','error');return}
  if(!DATA.coach_notes)DATA.coach_notes=[];
  DATA.coach_notes.push({id:uid(),member_name:name,note:text,category:document.getElementById('cn_cat').value||'general',group_id:'',coach:'',created_at:new Date().toISOString()});
  saveData(DATA);showCoachNotes(name);updateCounts();toast('Nota agregada');
}

function showRankHistory(name){
  var ranks=(DATA.rank_history||[]).filter(function(r){return r.member_name===name}).sort(function(a,b){return a.date>b.date?-1:1});
  var h='<button class="modal-close" onclick="closeModal()">'+ic('x',16)+'</button><h3>'+ic('trending-up',16)+' Historial de Rango: '+esc(name)+'</h3>'+
    '<div style="margin-bottom:14px;display:grid;gap:6px">';
  if(!ranks.length)h+='<div style="color:#555;padding:12px">Sin registros</div>';
  ranks.forEach(function(r,i){
    var arrow=i<ranks.length-1?(ranks[i].rank!==ranks[i+1].rank?(rankValue(ranks[i].rank)>rankValue(ranks[i+1].rank)?'<span style="color:#8b5cf6"> ?</span>':'<span style="color:#8b5cf6"> ?</span>'):''):'';
    h+='<div class="has-glow" style="display:flex;justify-content:space-between;padding:8px 14px;background:rgba(255,255,255,0.03);border-radius:8px">'+
      '<span>'+esc(r.rank)+arrow+'</span><span style="color:#555;font-size:13px">'+esc(r.date||'')+'</span></div>';
  });
  h+='</div><div class="field"><label>Nuevo rango</label><input class="input-field" id="rh_rank" placeholder="ej: Diamond 3"></div>'+
    '<div class="field"><label>Fecha</label><input type="date" class="input-field" id="rh_date" value="'+new Date().toISOString().slice(0,10)+'"></div>'+
    '<button class="btn-primary" onclick="addRankRecord(\''+esc(name)+'\')" style="width:100%;justify-content:center">'+ic('plus',16)+' Registrar Rango</button>';
  openModal(h);
}

function addRankRecord(name){
  var rank=document.getElementById('rh_rank').value.trim();
  if(!rank){toast('Escribe el rango','error');return}
  if(!DATA.rank_history)DATA.rank_history=[];
  DATA.rank_history.push({id:uid(),member_name:name,rank:rank,date:document.getElementById('rh_date').value,created_at:new Date().toISOString()});
  saveData(DATA);showRankHistory(name);updateCounts();toast('Rango registrado');
}

function autoAssignCoach(groupId){
  var groupCoaches=(DATA.group_coaches||[]).filter(function(gc){return gc.group_id===groupId});
  if(!groupCoaches.length)return'';
  var coachCounts=groupCoaches.map(function(gc){
    var coach=(DATA.coaches||[]).find(function(c){return c.id===gc.coach_id});
    if(!coach)return null;
    var count=(DATA.members||[]).filter(function(m){
      return m.coach&&m.coach.toLowerCase()===coach.name.toLowerCase()&&(m.group_id||getGroupFromRank(m.rank))===groupId;
    }).length;
    return{name:coach.name,count:count};
  }).filter(Boolean);
  if(!coachCounts.length)return'';
  var min=Math.min.apply(Math,coachCounts.map(function(c){return c.count}));
  var tied=coachCounts.filter(function(c){return c.count===min});
  return tied[Math.floor(Math.random()*tied.length)].name;
}

function distributeStudents(){
  if(!confirm('¿Asignar grupo según rango y distribuir entre coaches automáticamente?'))return;
  var changes=0;
  (DATA.members||[]).forEach(function(m){
    var g=getGroupFromRank(m.rank);
    if(g&&(!m.group_id||m.group_id!==g)){m.group_id=g;changes++}
  });
  (DATA.groups||[]).forEach(function(g){
    var groupCoaches=(DATA.group_coaches||[]).filter(function(gc){return gc.group_id===g.id});
    if(!groupCoaches.length)return;
    var coachNames=groupCoaches.map(function(gc){
      var c=(DATA.coaches||[]).find(function(c){return c.id===gc.coach_id});
      return c?c.name:null;
    }).filter(Boolean);
    if(!coachNames.length)return;
    var members=(DATA.members||[]).filter(function(m){return m.group_id===g.id});
    var unassigned=members.filter(function(m){return !m.coach||coachNames.indexOf(m.coach)<0});
    if(!unassigned.length)return;
    var counts={};
    coachNames.forEach(function(n){counts[n]=members.filter(function(m){return m.coach===n}).length});
    unassigned.forEach(function(m){
      var min=Infinity,best='';
      coachNames.forEach(function(n){
        if(counts[n]<min){min=counts[n];best=n}
      });
      if(best){m.coach=best;counts[best]++;changes++}
    });
  });
  if(changes){saveData(DATA);renderSection_members();updateCounts();toast(changes+' cambio(s) aplicados','ok')}
  else toast('Todos ya tienen grupo y coach asignado','info');
}

function resetMemberAssignments(){
  if(!confirm('¿Quitar grupo y coach de TODOS los miembros? Los rangos se conservan.'))return;
  (DATA.members||[]).forEach(function(m){m.group_id='';m.coach=''});
  saveData(DATA);renderSection_members();updateCounts();toast('Asignaciones de grupo/coach limpiadas','ok');
}
