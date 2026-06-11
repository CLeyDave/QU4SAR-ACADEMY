// ========== CRUD: MEMBERS ==========
function renderMembers(){
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
  saveData(DATA);renderMembers();updateCounts();toast(ids.length+' miembro(s) eliminado(s)','ok');
}
function deleteDuplicateMembers(){
  var seen={},removed=0;
  DATA.members=DATA.members.filter(function(m){
    var key=m.name.toLowerCase();
    if(seen[key]){removed++;return false}
    seen[key]=true;return true
  });
  if(!removed){toast('No hay miembros duplicados','info');return}
  saveData(DATA);renderMembers();updateCounts();toast(removed+' duplicado(s) eliminado(s)','ok');
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
  saveData(DATA);closeModal();renderMembers();updateCounts();toast(id?'Miembro actualizado':'Miembro agregado');
}
function delMember(id){if(!confirmDel())return;DATA.members=DATA.members.filter(function(m){return m.id!==id});saveData(DATA);renderMembers();updateCounts();toast('Miembro eliminado');}
function makeCoachFromMember(name){
  if((DATA.coaches||[]).find(function(c){return c.name===name}))return toast('Ya existe un coach con ese nombre','error');
  coachForm(null);
  setTimeout(function(){
    var realName='';
    var app=(DATA.applications||[]).find(function(a){return a.valorant===name||a.name===name});
    if(app&&app.name)realName=app.name;
    var nameInput=document.getElementById('cf_name');
    if(nameInput&&realName){nameInput.value=realName;nameInput.dispatchEvent(new Event('input'))}
    var nickInput=document.getElementById('cf_nickname');
    if(nickInput)nickInput.value=name;
    var passInput=document.getElementById('cf_password');
    var base=realName||name.split('#')[0].split(' ').pop();
    if(passInput)passInput.value='qu4sar'+base+'_';
    if(nameInput)nameInput.focus();
  },100);
  toast('Revisa los datos y guarda para crear al coach','info');
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

// ========== CRUD: ACADEMY ==========
var ACADEMY_TAB='classes';
function switchAcademyTab(tab){
  ACADEMY_TAB=tab;
  document.querySelectorAll('.academy-tab').forEach(function(b){b.classList.toggle('active',b.getAttribute('data-atab')===tab)});
  renderAcademyContent();
}
function renderAcademy(){
  document.getElementById('adminContent').innerHTML=
    '<div id="academySub"><div class="academy-tabs" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:20px">'+
      '<button class="academy-tab active" data-atab="classes" onclick="switchAcademyTab(\'classes\')">Clases</button>'+
      '<button class="academy-tab" data-atab="curriculum" onclick="switchAcademyTab(\'curriculum\')">Plan de Estudio</button>'+
      '<button class="academy-tab" data-atab="materials" onclick="switchAcademyTab(\'materials\')">Materiales</button>'+
      '<button class="academy-tab" data-atab="tasks" onclick="switchAcademyTab(\'tasks\')">Tareas</button>'+
      '<button class="academy-tab" data-atab="evaluations" onclick="switchAcademyTab(\'evaluations\')">Evaluaciones</button>'+
      '<button class="academy-tab" data-atab="attendance" onclick="switchAcademyTab(\'attendance\')">Asistencia</button>'+
      '<button class="academy-tab" data-atab="quizzes" onclick="switchAcademyTab(\'quizzes\')">Quizzes</button>'+
      '<button class="academy-tab" data-atab="coach_notes" onclick="switchAcademyTab(\'coach_notes\')">Coach Notes</button>'+
    '</div><div id="academySubContent"></div></div>';
  ACADEMY_TAB='classes';
  renderAcademyContent();
}
function renderAcademyContent(){
  switch(ACADEMY_TAB){
    case'classes':renderAcademyClasses();break;
    case'curriculum':renderCurriculum('academySubContent');break;
    case'materials':renderMaterials('academySubContent');break;
    case'tasks':renderTasks('academySubContent');break;
    case'evaluations':renderEvals('academySubContent');break;
    case'attendance':renderAttendance('academySubContent');break;
    case'quizzes':renderQuizzes('academySubContent');break;
    case'coach_notes':renderCoachNotes('academySubContent');break;
  }
  if(typeof lucide!=='undefined')lucide.createIcons();
}
function renderAcademyClasses(){
  var gid=(document.getElementById('adminGF')&&document.getElementById('adminGF').value)||'';
  var items=filterByCurrentCoach(DATA.academy||[]);
  if(gid)items=items.filter(function(i){return i.group_id===gid});
  var fh=adminGroupFilterHTML(gid,'renderAcademyClasses()');
  var btn='<button class="btn-primary" onclick="academyForm(null)" style="margin-bottom:14px;font-size:13px">'+ic('plus',14)+' Nueva Clase</button>';
  document.getElementById('academySubContent').innerHTML=fh+adminTable(items,['Día','Tema','Coach','Duración','Archivos'],function(a){
    return '<td>'+esc(a.day)+'</td><td><div class="cell-preview" onclick="viewAcademyTopic(\''+a.id+'\')">'+esc(a.topic)+'</div></td><td>'+esc(a.coach||'-')+'</td><td>'+esc(a.duration||'-')+'</td><td>'+(a.image_url?'<a href="'+esc(a.image_url)+'" target="_blank" title="Ver imagen">'+ic('image',14)+'</a> ':'')+(a.attachment_url?'<a href="'+esc(a.attachment_url)+'" target="_blank" title="Descargar '+esc(a.attachment_name||'archivo')+'">'+ic('paperclip',14)+'</a>':'')+'</td><td><div class="has-glow admin-actions"><button onclick="academyForm(\''+a.id+'\')">'+ic('pencil',14)+'</button><button class="del" onclick="delAcademy(\''+a.id+'\')">'+ic('trash-2',14)+'</button></div></td>'},'No hay clases en la academia',btn);
}
function renderCoachNotes(cId){
  var gid=(document.getElementById('adminGF')&&document.getElementById('adminGF').value)||'';
  var items=filterByCurrentCoach(DATA.coach_notes||[]);
  if(gid)items=items.filter(function(i){return i.group_id===gid});
  var fh=adminGroupFilterHTML(gid,'renderCoachNotes()');
  var btn='<button class="btn-primary" onclick="coachNoteForm(null)" style="margin-bottom:14px;font-size:13px">'+ic('plus',14)+' Nueva Nota</button>';
  document.getElementById(cId).innerHTML=fh+adminTable(items,['Miembro','Nota','Categoría','Coach','Grupo','Fecha'],function(n){
    return '<td>'+esc(n.member_name)+'</td><td><div class="cell-preview" onclick="viewCoachNote(\''+n.id+'\')">'+esc(n.note)+'</div></td><td><span class="badge badge-purple">'+esc(n.category||'general')+'</span></td><td>'+esc(n.coach||'')+'</td><td>'+groupName(n.group_id)+'</td><td>'+(n.created_at?new Date(n.created_at).toLocaleDateString('es-ES'):'')+'</td><td><div class="has-glow admin-actions"><button onclick="coachNoteForm(\''+n.id+'\')">'+ic('pencil',14)+'</button><button class="del" onclick="delCoachNote(\''+n.id+'\')">'+ic('trash-2',14)+'</button></div></td>'},'No hay notas del coach',btn);
}
function coachNoteForm(id){
  var item=id?(DATA.coach_notes||[]).find(function(n){return n.id===id}):null;
  var f=item||{member_name:'',note:'',category:'general',group_id:'',coach:dc(),created_at:new Date().toISOString()};
  openModal('<button class="modal-close" onclick="closeModal()">'+ic('x',16)+'</button><h3>'+(item?'Editar':'Nueva')+' Nota</h3>'+
    '<div class="field"><label>Miembro</label><select class="input-field" id="cnf_member">'+(DATA.members||[]).map(function(m){return'<option value="'+esc(m.name)+'" '+(m.name===f.member_name?'selected':'')+'>'+esc(m.name)+'</option>'}).join('')+'</select></div>'+
    '<div class="field"><label>Nota</label><textarea class="input-field" id="cnf_note" rows="3">'+esc(f.note)+'</textarea></div>'+
    '<div class="field"><label>Categoría</label><input class="input-field" id="cnf_cat" value="'+esc(f.category||'general')+'" placeholder="ej: aim, game_sense, actitud"></div>'+
    '<div class="field" style="display:none"><label>Grupo</label><select class="input-field" id="cnf_group" onchange="reloadCoachDropdown(\'cnf_coach\',this.value)"><option value="">General (Ambos)</option>'+(DATA.groups||[]).map(function(g){return'<option value="'+g.id+'"'+(f.group_id===g.id?' selected':'')+'>'+esc(g.name)+'</option>'}).join('')+'</select></div>'+
    '<div class="field"><label>Coach</label><select class="input-field" id="cnf_coach" onchange="setGroupFromCoach(\'cnf_group\',\'cnf_coach\')"><option value="">Sin coach</option>'+coachOptions(f.coach||'',f.group_id)+'</select></div>'+
    '<button class="btn-primary" onclick="saveCoachNote(\''+(id||'')+'\')" style="width:100%;justify-content:center">'+ic('save',16)+' Guardar</button>');
}
function saveCoachNote(id){
  var obj={member_name:document.getElementById('cnf_member').value,note:document.getElementById('cnf_note').value,category:document.getElementById('cnf_cat').value||'general',group_id:document.getElementById('cnf_group').value,coach:document.getElementById('cnf_coach')?.value||''};
  if(!DATA.coach_notes)DATA.coach_notes=[];
  if(id){var idx=DATA.coach_notes.findIndex(function(n){return n.id===id});if(idx>=0)DATA.coach_notes[idx]={...DATA.coach_notes[idx],...obj}}else{obj.id=uid();obj.created_at=new Date().toISOString();DATA.coach_notes.push(obj)}
  saveData(DATA);closeModal();renderCoachNotes('academySubContent');updateCounts();toast(id?'Nota actualizada':'Nota creada');
}
function delCoachNote(id){if(!confirmDel())return;DATA.coach_notes=DATA.coach_notes.filter(function(n){return n.id!==id});saveData(DATA);renderCoachNotes('academySubContent');updateCounts();toast('Nota eliminada');}
function viewCoachNote(id){
  var n=(DATA.coach_notes||[]).find(function(x){return x.id===id});
  if(!n)return;
  openModal('<button class="modal-close" onclick="closeModal()">'+ic('x',16)+'</button><h3>Nota: '+esc(n.member_name)+'</h3><div style="color:#888;font-size:13px;line-height:1.8;white-space:pre-wrap">'+esc(n.note)+'</div>');
}
function academyForm(id){
  var item=id?(DATA.academy||[]).find(function(a){return a.id===id}):null;
  var f=item||{day:'Lunes',topic:'',objectives:[],prerequisites:[],duration:'',group_id:'',coach:dc(),image_url:'',attachment_url:'',attachment_name:''};
   openModal('<button class="modal-close" onclick="closeModal()">'+ic('x',16)+'</button><h3>'+(item?'Editar':'Nueva')+' Clase</h3>'+
    '<div class="field"><label>Día</label><select class="input-field" id="af_day">'+['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'].map(function(d){return'<option value="'+d+'" '+(d===f.day?'selected':'')+'>'+d+'</option>'}).join('')+'</select></div>'+
    '<div class="field"><label>Tema</label><input class="input-field" id="af_topic" value="'+esc(f.topic)+'"></div>'+
    '<div class="field"><label>Coach / Instructor</label><select class="input-field" id="af_coach" onchange="setGroupFromCoach(\'acf_group\',\'af_coach\')"><option value="">Sin coach</option>'+coachOptions(f.coach||'',f.group_id)+'</select></div>'+
    '<div class="field"><label>Duración</label><input class="input-field" id="af_duration" placeholder="ej: 90 min" value="'+esc(f.duration||'')+'"></div>'+
    '<div class="field"><label>Requisitos previos (uno por línea)</label><textarea class="input-field" id="af_prereqs" rows="3" placeholder="ej: Rango mínimo Oro">'+esc((f.prerequisites||[]).join('\n'))+'</textarea></div>'+
    '<div class="field"><label>Objetivos (uno por línea)</label><textarea class="input-field" id="af_objectives" rows="4">'+esc((f.objectives||[]).join('\n'))+'</textarea></div>'+
     '<div class="field"><label>Grupo</label><select class="input-field" id="acf_group" onchange="reloadCoachDropdown(\'af_coach\',this.value)"><option value="">General (Ambos)</option>'+(DATA.groups||[]).map(function(g){return'<option value="'+g.id+'"'+(f.group_id===g.id?' selected':'')+'>'+esc(g.name)+'</option>'}).join('')+'</select></div>'+
    '<hr>'+
    '<div class="field"><label>Imagen</label>'+fileUploadHTML('Imagen','image/*','af_img_status','af_image_url',f.image_url||'')+(f.image_url?mediaPreview(f.image_url):'')+'</div>'+
    '<div class="field"><label>Archivo adjunto (PDF)</label>'+fileUploadHTML('PDF','.pdf,application/pdf','af_doc_status','af_attachment_url',f.attachment_url||'')+'<input class="input-field" id="af_attachment_name" placeholder="Nombre del archivo" value="'+esc(f.attachment_name||'')+'"></div>'+
    '<button class="btn-primary" onclick="saveAcademy(\''+(id||'')+'\')" style="width:100%;justify-content:center">'+ic('save',16)+' Guardar</button>');
}
function saveAcademy(id){
  var obj={day:document.getElementById('af_day').value,
    topic:document.getElementById('af_topic').value,
    coach:document.getElementById('af_coach').value,
    duration:document.getElementById('af_duration').value,
    prerequisites:document.getElementById('af_prereqs').value.split('\n').map(function(s){return s.trim()}).filter(function(s){return s}),
    objectives:document.getElementById('af_objectives').value.split('\n').map(function(s){return s.trim()}).filter(function(s){return s}),group_id:document.getElementById('acf_group').value,
    image_url:document.getElementById('af_image_url').value,attachment_url:document.getElementById('af_attachment_url').value,attachment_name:document.getElementById('af_attachment_name').value};
  if(!DATA.academy)DATA.academy=[];
  if(id){var idx=DATA.academy.findIndex(function(a){return a.id===id});if(idx>=0)DATA.academy[idx]={...DATA.academy[idx],...obj}}else{obj.id=uid();DATA.academy.push(obj)}
  saveData(DATA);closeModal();renderAcademy();updateCounts();toast(id?'Clase actualizada':'Clase creada');
}
function delAcademy(id){if(!confirmDel())return;DATA.academy=DATA.academy.filter(function(a){return a.id!==id});saveData(DATA);renderAcademy();updateCounts();toast('Clase eliminada');}
function viewAcademyTopic(id){
  var a=(DATA.academy||[]).find(function(x){return x.id===id});
  if(!a)return;
  openModal('<button class="modal-close" onclick="closeModal()">'+ic('x',16)+'</button><h3>Tema: '+esc(a.topic)+'</h3><div style="color:#888;font-size:13px;line-height:1.8;white-space:pre-wrap">'+esc(a.topic)+'</div>');
}

// ========== CRUD: APPLICATIONS ==========
function renderApplications(){
  var items=DATA.applications||[];
  var pending=items.filter(function(a){return a.status==='pending'}).length;
  var h=pending?'<div style="margin-bottom:16px;font-size:14px;color:#888">'+ic('clipboard-list',16)+' <strong style="color:var(--neon)">'+pending+'</strong> solicitudes pendientes</div>':'';
  h+='<div style="display:grid;gap:16px">';
  if(!items.length){h+='<div class="empty-state"><div class="icon">'+ic('clipboard-list',40)+'</div><p>No hay inscripciones aún</p></div>'}else{
    items.forEach(function(a){
      var roles=(a.selected_roles||[]).join(', ');
      var badges={pending:'badge-yellow',accepted:'badge-green',rejected:'badge-red'};
      h+='<div class="glass-card" style="padding:20px 24px">'+
        '<div style="display:flex;justify-content:space-between;align-items:start;flex-wrap:wrap;gap:10px;margin-bottom:14px">'+
          '<div><strong style="font-size:17px">'+esc(a.name)+'</strong>'+
          (a.age?'<span style="color:#888;font-size:13px;margin-left:8px">'+esc(a.age)+' años</span>':'')+
          '<span class="badge '+(badges[a.status]||'badge-gray')+'" style="margin-left:10px;font-size:11px">'+(a.status||'pending')+'</span></div>'+
          '<div style="display:flex;gap:8px;flex-wrap:wrap">'+
            (a.status==='pending'?'<button class="btn-primary" style="padding:8px 18px;font-size:13px" onclick="acceptApp(\''+a.id+'\')">'+ic('check',16)+' Aceptar</button><button class="btn-sm danger" style="padding:8px 16px;font-size:13px" onclick="rejectApp(\''+a.id+'\')">'+ic('x',16)+' Rechazar</button>':'')+
            (a.status==='accepted'?'<button class="btn-sm cancel" style="padding:8px 16px;font-size:13px" onclick="rejectApp(\''+a.id+'\')">'+ic('x',16)+' Rechazar</button>':'')+
            (a.status==='rejected'?'<button class="btn-primary" style="padding:8px 18px;font-size:13px" onclick="acceptApp(\''+a.id+'\')">'+ic('check',16)+' Aceptar</button>':'')+
            '<button class="btn-sm danger" style="padding:8px 12px" onclick="delApp(\''+a.id+'\')" title="Eliminar">'+ic('trash-2',15)+'</button>'+
          '</div>'+
        '</div>'+
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 16px;font-size:14px;color:#bbb;margin-bottom:12px">'+
          (a.discord?'<div><span style="color:#666">Discord:</span> '+esc(a.discord)+'</div>':'')+
          (a.valorant?'<div><span style="color:#666">VALORANT:</span> '+esc(a.valorant)+'</div>':'')+
          (a.rank?'<div><span style="color:#666">Rango:</span> '+esc(a.rank)+'</div>':'')+
          (a.main_role?'<div><span style="color:#666">Rol:</span> '+esc(a.main_role)+'</div>':'')+
          (a.server?'<div><span style="color:#666">Servidor:</span> '+esc(a.server)+'</div>':'')+
          (a.availability?'<div><span style="color:#666">Disponibilidad:</span> '+esc(a.availability)+'</div>':'')+
        '</div>'+
        (roles?'<div style="font-size:14px;margin-bottom:10px"><span style="color:#666">Roles elegidos:</span> <span style="color:var(--neon)">'+esc(roles)+'</span></div>':'')+
        (a.objectives?'<div class="has-glow" style="font-size:14px;margin-bottom:8px;padding:10px 14px;background:rgba(139,92,246,0.04);border-radius:8px;border-left:3px solid var(--neon)"><span style="color:#666;font-weight:600">?? Objetivos:</span><br><span style="color:#ccc">'+esc(a.objectives)+'</span></div>':'')+
        (a.reason?'<div class="has-glow" style="font-size:14px;margin-bottom:6px;padding:10px 14px;background:rgba(139,92,246,0.04);border-radius:8px;border-left:3px solid var(--neon)"><span style="color:#666;font-weight:600">?? Motivación:</span><br><span style="color:#ccc">'+esc(a.reason)+'</span></div>':'')+
        '<div style="font-size:12px;color:#444;margin-top:8px">'+(a.created_at?new Date(a.created_at).toLocaleString('es-ES'):'')+'</div>'+
      '</div>';
    });
  }
  h+='</div>';
  document.getElementById('adminContent').innerHTML=h;
}
function autoAssignCoach(groupId){
  var groupCoaches=(DATA.group_coaches||[]).filter(function(gc){return gc.group_id===groupId});
  if(!groupCoaches.length)return'';
  // Build list of coach names with their current student count
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
  // First pass: assign group from rank for members without a group
  (DATA.members||[]).forEach(function(m){
    var g=getGroupFromRank(m.rank);
    if(g&&(!m.group_id||m.group_id!==g)){m.group_id=g;changes++}
  });
  // Second pass: distribute unassigned members among coaches per group
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
  if(changes){saveData(DATA);renderMembers();updateCounts();toast(changes+' cambio(s) aplicados','ok')}
  else toast('Todos ya tienen grupo y coach asignado','info');
}
function resetMemberAssignments(){
  if(!confirm('¿Quitar grupo y coach de TODOS los miembros? Los rangos se conservan.'))return;
  (DATA.members||[]).forEach(function(m){m.group_id='';m.coach=''});
  saveData(DATA);renderMembers();updateCounts();toast('Asignaciones de grupo/coach limpiadas','ok');
}
function acceptApp(id){
  if(!confirm('¿Aceptar esta solicitud?'))return;
  var idx=DATA.applications.findIndex(function(a){return a.id===id});
  if(idx<0)return;
  var a=DATA.applications[idx];
  var memberName=a.valorant||a.name;
  if((DATA.members||[]).find(function(m){return m.name.toLowerCase()===memberName.toLowerCase()})){
    toast('Ya existe un miembro con ese nombre: '+memberName,'err');renderApplications();return
  }
  a.status='accepted';
  var groupId=getGroupFromRank(a.rank||'');
  var coach=groupId?autoAssignCoach(groupId):'';
  var member={id:uid(),name:memberName,role:a.main_role||'Miembro',rank:a.rank||'',group_id:groupId,coach:coach,image:'',description:''};
  DATA.members.push(member);
  saveData(DATA);
  var toastMsg='Solicitud aceptada  añadido a Miembros'+(coach?' (Coach: '+coach+')':'');
  if(db&&db.from){
    db.from('applications').update({status:'accepted'}).eq('id',id).then(function(){return db.from('members').insert([member])}).then(function(){renderApplications();renderMembers();updateCounts();toast(toastMsg)}).catch(function(e){toast('Error: '+e.message,'error')});
  }else{
    renderApplications();renderMembers();updateCounts();toast(toastMsg+' (solo local)');
  }
}
function rejectApp(id){
  if(!confirm('¿Rechazar esta solicitud?'))return;
  var idx=DATA.applications.findIndex(function(a){return a.id===id});
  if(idx<0)return;
  DATA.applications[idx].status='rejected';
  saveData(DATA);
  if(db&&db.from){
    db.from('applications').update({status:'rejected'}).eq('id',id).then(function(){renderApplications();updateCounts();toast('Solicitud rechazada')}).catch(function(e){toast('Error: '+e.message,'error')});
  }else{
    renderApplications();updateCounts();toast('Solicitud rechazada (solo local)');
  }
}
function delApp(id){
  if(!confirm('¿Eliminar esta solicitud permanentemente?'))return;
  DATA.applications=DATA.applications.filter(function(a){return a.id!==id});
  saveData(DATA);
  if(db&&db.from){
    db.from('applications').delete().eq('id',id).then(function(){renderApplications();updateCounts();toast('Solicitud eliminada')}).catch(function(e){toast('Error: '+e.message,'error')});
  }else{
    renderApplications();updateCounts();toast('Solicitud eliminada (solo local)');
  }
}

// ========== ATTENDANCE ==========
function renderAttendance(cId){cId=cId||'adminContent';
  var classes=filterByCurrentCoach((DATA.schedule||[]).filter(function(s){return s.type==='academia'}));
  var allMembers=DATA.members||[];
  var members=currentUser&&currentUser.coachName?filterByCurrentCoach(allMembers):allMembers;
  var att=DATA.attendance||[];
  var today=new Date().toISOString().slice(0,10);
  var h='<div style="display:grid;gap:20px">';
  // Stats summary
  h+='<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">'+
    '<div class="glass-card" style="padding:16px;text-align:center"><div class="number gradient-text">'+classes.length+'</div><div style="color:#888;font-size:13px">Clases semanales</div></div>'+
    '<div class="glass-card" style="padding:16px;text-align:center"><div class="number" style="color:#8b5cf6">'+att.filter(function(a){return a.status==='present'}).length+'</div><div style="color:#888;font-size:13px">Asistencias</div></div>'+
    '<div class="glass-card" style="padding:16px;text-align:center"><div class="number" style="color:#8b5cf6">'+att.filter(function(a){return a.status==='absent'||a.status==='late'}).length+'</div><div style="color:#888;font-size:13px">Faltas/Tardanzas</div></div>'+
  '</div>';
  // Stats per member
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
  // Confirmaciones de asistencia
  var confs=DATA.attendance_confirmations||[];
  var todayStr=new Date().toISOString().slice(0,10);
  var todayConfs=confs.filter(function(c){return c.date===todayStr});
  h+='<div class="glass-card" style="padding:20px"><h3 style="margin-bottom:12px">'+ic('calendar-check',18)+' Confirmaciones hoy ('+todayStr+')</h3>'+
    (todayConfs.length?'<div style="display:grid;gap:6px">'+todayConfs.map(function(c){
      return '<div class="has-glow" style="display:flex;justify-content:space-between;padding:8px 14px;background:rgba(255,255,255,0.03);border-radius:8px">'+
        '<span>'+esc(c.member_name)+'</span><span style="color:'+(c.will_attend?'#8b5cf6':'#8b5cf6')+'">'+(c.will_attend?'? Asistirá':'? No asistirá')+'</span></div>';
    }).join('')+'</div>':'<div style="color:#555;padding:12px;text-align:center">Nadie ha confirmado aún hoy</div>')+
  '</div>';
  // Mark / edit attendance per class
  if(!classes.length){
    h+='<div class="empty-state"><div class="icon">'+ic('calendar',40)+'</div><p>No hay clases de academia en el horario. Crea una en Horarios con tipo "academia".</p></div>';
  }else{
    h+='<div class="glass-card" style="padding:20px"><h3 style="margin-bottom:12px">'+ic('clipboard-check',18)+' Marcar / Editar asistencia</h3>';
    h+='<div style="display:grid;gap:12px;max-width:500px">'+
      '<div class="field"><label>Clase</label><select class="input-field" id="attClassSelect" onchange="renderAttMemberList()">'+
      classes.map(function(c,i){var days=['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];return'<option value="'+c.id+'">'+esc(c.title)+' ('+days[c.day]+' '+toLocalTime(c.start,c.tz)+')</option>'}).join('')+
      '</select></div>'+
      '<div class="field"><label>Fecha</label><input type="date" class="input-field" id="attDate" value="'+today+'" onchange="renderAttMemberList()"></div>'+
    '</div>';
    h+='<div id="attMemberList"></div>';
    h+='<button class="btn-primary" onclick="saveAllAttendance()" style="margin-top:14px;justify-content:center">'+ic('save',16)+' Guardar Asistencia</button>'+
    '</div>';
  }
  h+='</div>';
  document.getElementById(cId).innerHTML=h;
  if(classes.length)renderAttMemberList();
}
var _attPending={};
function renderAttMemberList(){
  var allMembers=DATA.members||[];
  var members=currentUser&&currentUser.coachName?filterByCurrentCoach(allMembers):allMembers;
  var att=DATA.attendance||[];
  var date=document.getElementById('attDate').value;
  var sid=document.getElementById('attClassSelect').value;
  var container=document.getElementById('attMemberList');
  if(!container)return;
  if(!members.length){container.innerHTML='<div style="color:#555;text-align:center;padding:20px">No hay miembros para marcar asistencia. Agrega miembros primero.</div>';return}
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
  if(typeof lucide!=='undefined')lucide.createIcons();
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
  if(!sid){toast('Seleccioná un horario primero','error');return}
  if(!(DATA.schedule||[]).some(function(s){return s.id===sid})){toast('El horario seleccionado ya no existe, recargá la página','error');return}
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
    }).then(function(){if(_inAcademyTab)renderAttendance('academySubContent');else renderAttendance();updateCounts();_attPending={};toast('Asistencia guardada')}).catch(function(e){toast('Error: '+e.message,'error')});
  }else{
    if(_inAcademyTab)renderAttendance('academySubContent');else renderAttendance();updateCounts();_attPending={};toast('Asistencia guardada (solo local)');
  }
}

// ========== CRUD: EVALUATIONS ==========
function renderEvals(cId){cId=cId||'adminContent';
  var gid=(document.getElementById('adminGF')&&document.getElementById('adminGF').value)||'';
  var items=filterByCurrentCoach(DATA.evaluations||[]);
  if(gid)items=items.filter(function(i){return i.group_id===gid});
  var fh=adminGroupFilterHTML(gid,'renderEvals()');
  var btn='<button class="btn-primary" onclick="evalForm(null)" style="margin-bottom:14px;font-size:13px">'+ic('plus',14)+' Nueva Evaluación</button>';
  document.getElementById(cId).innerHTML=fh+adminTable(items,['Miembro','Fecha','AIM','Game Sense','Comunicación','Trabajo Equipo','Coach','Grupo','Archivos'],function(e){
    return '<td>'+esc(e.member_name)+'</td><td>'+esc(e.date)+'</td><td>'+e.aim+'</td><td>'+e.game_sense+'</td><td>'+e.communication+'</td><td>'+e.teamwork+'</td><td>'+esc(e.coach||'')+'</td><td>'+groupName(e.group_id)+'</td><td>'+(e.image_url?'<a href="'+esc(e.image_url)+'" target="_blank" title="Ver imagen">'+ic('image',14)+'</a> ':'')+(e.attachment_url?'<a href="'+esc(e.attachment_url)+'" target="_blank" title="Descargar '+esc(e.attachment_name||'archivo')+'">'+ic('paperclip',14)+'</a>':'')+'</td><td><div class="has-glow admin-actions"><button onclick="evalForm(\''+e.id+'\')">'+ic('pencil',14)+'</button><button class="del" onclick="delEval(\''+e.id+'\')">'+ic('trash-2',14)+'</button></div></td>'},'No hay evaluaciones',btn);
}
function evalForm(id){
  var item=id?(DATA.evaluations||[]).find(function(e){return e.id===id}):null;
  var f=item||{member_name:'',aim:3,game_sense:3,communication:3,teamwork:3,coach:dc(),group_id:'',coach_notes:'',date:new Date().toISOString().slice(0,10),image_url:'',attachment_url:'',attachment_name:''};
  openModal('<button class="modal-close" onclick="closeModal()">'+ic('x',16)+'</button><h3>'+(item?'Editar':'Nueva')+' Evaluación</h3>'+
    '<div class="field"><label>Miembro</label><select class="input-field" id="ef_member_name">'+(DATA.members||[]).map(function(m){return'<option value="'+esc(m.name)+'" '+(m.name===f.member_name?'selected':'')+'>'+esc(m.name)+'</option>'}).join('')+'</select></div>'+
    '<div class="grid-2"><div class="field"><label>AIM (1-5)</label><input type="number" min="1" max="5" class="input-field" id="ef_aim" value="'+f.aim+'"></div>'+
    '<div class="field"><label>Game Sense (1-5)</label><input type="number" min="1" max="5" class="input-field" id="ef_game_sense" value="'+f.game_sense+'"></div></div>'+
    '<div class="grid-2"><div class="field"><label>Comunicación (1-5)</label><input type="number" min="1" max="5" class="input-field" id="ef_communication" value="'+f.communication+'"></div>'+
    '<div class="field"><label>Trabajo Equipo (1-5)</label><input type="number" min="1" max="5" class="input-field" id="ef_teamwork" value="'+f.teamwork+'"></div></div>'+
    '<div class="field" style="display:none"><label>Grupo</label><select class="input-field" id="ef_group" onchange="reloadCoachDropdown(\'ef_coach\',this.value)"><option value="">General (Ambos)</option>'+(DATA.groups||[]).map(function(g){return'<option value="'+g.id+'"'+(f.group_id===g.id?' selected':'')+'>'+esc(g.name)+'</option>'}).join('')+'</select></div>'+
    '<div class="field"><label>Coach</label><select class="input-field" id="ef_coach" onchange="setGroupFromCoach(\'ef_group\',\'ef_coach\')"><option value="">Sin coach</option>'+coachOptions(f.coach||'',f.group_id)+'</select></div>'+
    '<div class="field"><label>Notas del Coach</label><textarea class="input-field" id="ef_coach_notes" rows="3">'+esc(f.coach_notes||'')+'</textarea></div>'+
    '<div class="field"><label>Fecha</label><input type="date" class="input-field" id="ef_date" value="'+f.date+'"></div>'+
    '<hr>'+
    '<div class="field"><label>Imagen</label>'+fileUploadHTML('Imagen','image/*','ef_img_status','ef_image_url',f.image_url||'')+(f.image_url?mediaPreview(f.image_url):'')+'</div>'+
    '<div class="field"><label>Archivo adjunto (PDF)</label>'+fileUploadHTML('PDF','.pdf,application/pdf','ef_doc_status','ef_attachment_url',f.attachment_url||'')+'<input class="input-field" id="ef_attachment_name" placeholder="Nombre del archivo" value="'+esc(f.attachment_name||'')+'"></div>'+
    '<button class="btn-primary" onclick="saveEval(\''+(id||'')+'\')" style="width:100%;justify-content:center">'+ic('save',16)+' Guardar</button>');
}
function saveEval(id){
  var obj={member_name:document.getElementById('ef_member_name').value,aim:parseInt(document.getElementById('ef_aim').value)||3,game_sense:parseInt(document.getElementById('ef_game_sense').value)||3,communication:parseInt(document.getElementById('ef_communication').value)||3,teamwork:parseInt(document.getElementById('ef_teamwork').value)||3,group_id:document.getElementById('ef_group').value,coach:document.getElementById('ef_coach')?.value||'',coach_notes:document.getElementById('ef_coach_notes').value,date:document.getElementById('ef_date').value,image_url:document.getElementById('ef_image_url').value,attachment_url:document.getElementById('ef_attachment_url').value,attachment_name:document.getElementById('ef_attachment_name').value};
  if(!DATA.evaluations)DATA.evaluations=[];
  if(id){var idx=DATA.evaluations.findIndex(function(e){return e.id===id});if(idx>=0)DATA.evaluations[idx]={...DATA.evaluations[idx],...obj}}else{obj.id=uid();DATA.evaluations.push(obj)}
  saveData(DATA);closeModal();if(_inAcademyTab)renderAcademyContent();else renderEvals();updateCounts();toast(id?'Evaluación actualizada':'Evaluación creada');
}
function delEval(id){if(!confirmDel())return;DATA.evaluations=DATA.evaluations.filter(function(e){return e.id!==id});saveData(DATA);if(_inAcademyTab)renderAcademyContent();else renderEvals();updateCounts();toast('Evaluación eliminada');}

// ========== CRUD: COACHES ==========
function renderCoaches(){
  var btn='<button class="btn-primary" onclick="coachForm(null)" style="margin-bottom:14px;font-size:13px">'+ic('plus',14)+' Nuevo Coach</button>';
  document.getElementById('adminContent').innerHTML=adminTable(DATA.coaches||[],['Nombre','Email','Nombre VALORANT','Especialidad','Estado'],function(c){
    return '<td>'+esc(c.name)+'</td><td><span style="font-size:12px;color:#888">'+esc(c.email||'')+'</span></td><td>'+esc(c.nickname||'-')+'</td><td>'+esc(c.specialty||'-')+'</td>'+
      '<td><span style="color:'+(c.status==='active'?'#8b5cf6':'#8b5cf6')+'">'+(c.status==='active'?'Activo':'Inactivo')+'</span></td>'+
      '<td><div class="has-glow admin-actions">'+
        '<button onclick="coachForm(\''+c.id+'\')" title="Editar">'+ic('pencil',14)+'</button>'+
        '<button onclick="toggleCoachStatus(\''+c.id+'\')" title="'+(c.status==='active'?'Desactivar':'Activar')+'">'+(c.status==='active'?ic('pause',14):ic('play',14))+'</button>'+
        '<button onclick="assignCoachGroup(\''+c.id+'\')" title="Asignar a Grupo">'+ic('layers',14)+'</button>'+
        '<button class="del" onclick="delCoach(\''+c.id+'\')" title="Eliminar">'+ic('trash-2',14)+'</button>'+
      '</div></td>'
  },'No hay coaches',btn);
}
function coachForm(id){
  var item=id?(DATA.coaches||[]).find(function(c){return c.id===id}):null;
  var isNew=!item;
  var f=item?{...item}:{name:'',nickname:'',discord:'',specialty:'',description:'',avatar:'',status:'active',email:''};
  // If editing and name looks like a VALORANT tag (#), split it
  if(!isNew&&f.name.indexOf('#')>=0&&!f.nickname){
    f.nickname=f.name;
    f.name='';
  }
  var assigned=(DATA.group_coaches||[]).filter(function(gc){return gc.coach_id===(item?item.id:'')}).map(function(gc){return gc.group_id});
  var groupHTML=(DATA.groups||[]).map(function(g){return'<label style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:rgba(255,255,255,0.03);border-radius:8px;cursor:pointer;margin-bottom:4px">'+
    '<input type="checkbox" id="cg_'+g.id+'" '+(assigned.indexOf(g.id)>=0?'checked':'')+' style="width:18px;height:18px;accent-color:var(--neon)">'+
    '<span>'+esc(g.name)+' <span style="color:#555">('+esc(g.description||'')+')</span></span></label>'}).join('');
  openModal('<button class="modal-close" onclick="closeModal()">'+ic('x',16)+'</button><h3>'+(item?'Editar':'Nuevo')+' Coach</h3>'+
    '<div class="field"><label>Nombre</label><input class="input-field" id="cf_name" value="'+esc(f.name)+'"></div>'+
    '<div class="field"><label>Email</label><input class="input-field" id="cf_email" value="'+esc(f.email||'')+'"></div>'+
    (isNew?'<p style="font-size:12px;color:#888;margin:-8px 0 12px">Se enviará invitación al email ingresado</p>':'')+
    '<div class="grid-2"><div class="field"><label>Nombre VALORANT</label><input class="input-field" id="cf_nickname" value="'+esc(f.nickname)+'" placeholder="ej: Jugador#NA1"></div>'+
    '<div class="field"><label>Discord</label><input class="input-field" id="cf_discord" value="'+esc(f.discord)+'" placeholder="Opcional"></div></div>'+
    '<div class="field"><label>Especialidad</label><input class="input-field" id="cf_specialty" value="'+esc(f.specialty)+'"></div>'+
    '<div class="field"><label>Descripción</label><textarea class="input-field" id="cf_description" rows="3">'+esc(f.description||'')+'</textarea></div>'+
    '<div class="grid-2"><div class="field"><label>Avatar URL</label><input class="input-field" id="cf_avatar" value="'+esc(f.avatar||'')+'"></div>'+
    '<div class="field"><label>Estado</label><select class="input-field" id="cf_status"><option value="active" '+(f.status==='active'?'selected':'')+'>Activo</option><option value="inactive" '+(f.status==='inactive'?'selected':'')+'>Inactivo</option></select></div></div>'+
    (groupHTML?'<hr><div class="field"><label>Grupos asignados</label>'+groupHTML+'</div>':'')+
    '<button class="btn-primary" onclick="saveCoach(\''+(id||'')+'\')" style="width:100%;justify-content:center;margin-top:8px">'+ic('save',16)+' Guardar</button>');
}
async function saveCoach(id){
  var obj={name:document.getElementById('cf_name').value,email:document.getElementById('cf_email').value,nickname:document.getElementById('cf_nickname').value,discord:document.getElementById('cf_discord').value,specialty:document.getElementById('cf_specialty').value,description:document.getElementById('cf_description').value,avatar:document.getElementById('cf_avatar').value,status:document.getElementById('cf_status').value};
  if(!DATA.coaches)DATA.coaches=[];
  var isNew=!id;
  if(isNew){
    obj.id=uid();
    DATA.coaches.push(obj);
    // Create user profile for coach
    if(db&&db.from){
      try{
        var {data:authUser,error:signUpError}=await db.auth.signUp({email:obj.email,password:obj.email+'Qu4sar2026!'});
        if(signUpError)throw signUpError;
        if(authUser&&authUser.user){
          await db.from('users').upsert({id:authUser.user.id,email:obj.email,role:'coach',name:obj.name},{onConflict:'id'});
          toast('Coach creado. Email: '+obj.email+' | Contraseña: '+obj.email+'Qu4sar2026!','info');
        }
      }catch(e){toast('Error al crear usuario: '+(e.message||e),'error')}
    }
  }else{
    var idx=DATA.coaches.findIndex(function(c){return c.id===id});
    if(idx>=0)DATA.coaches[idx]={...DATA.coaches[idx],...obj};
    // Update email in users table if changed
    if(db&&db.from){
      try{
        var {data:existingUser}=await db.from('users').select('id').eq('email',obj.email).limit(1);
        if(existingUser&&existingUser.length){
          await db.from('users').update({name:obj.name,role:'coach'}).eq('email',obj.email);
        }
      }catch(e){/* silent */}
    }
  }
  // Save group assignments
  var coachId=obj.id||id;
  (DATA.groups||[]).forEach(function(g){
    var cb=document.getElementById('cg_'+g.id);
    if(!cb)return;
    if(!DATA.group_coaches)DATA.group_coaches=[];
    DATA.group_coaches=DATA.group_coaches.filter(function(gc){return!(gc.coach_id===coachId&&gc.group_id===g.id)});
    if(cb.checked)DATA.group_coaches.push({id:uid(),group_id:g.id,coach_id:coachId});
  });
  saveData(DATA);closeModal();renderCoaches();updateCounts();toast(isNew?'Coach agregado':'Coach actualizado');
}
function delCoach(id){
  if(!confirmDel())return;
  var c=(DATA.coaches||[]).find(function(c){return c.id===id});
  DATA.coaches=(DATA.coaches||[]).filter(function(c){return c.id!==id});
  saveData(DATA);renderCoaches();updateCounts();toast('Coach eliminado');
  if(db&&db.from&&c){
    db.from('users').delete().eq('email',c.email).then(function(){}).catch(function(){});
  }
}
function toggleCoachStatus(id){
  var c=(DATA.coaches||[]).find(function(c){return c.id===id});
  if(!c)return;
  c.status=c.status==='active'?'inactive':'active';
  saveData(DATA);renderCoaches();toast('Coach '+(c.status==='active'?'activado':'desactivado'));
  if(db&&db.from){
    db.from('users').update({role:c.status==='active'?'coach':'user'}).eq('email',c.email).then(function(){}).catch(function(){});
  }
}
function assignCoachGroup(coachId){
  var coach=(DATA.coaches||[]).find(function(c){return c.id===coachId});
  if(!coach)return;
  var assigned=(DATA.group_coaches||[]).filter(function(gc){return gc.coach_id===coachId}).map(function(gc){return gc.group_id});
  var h='<button class="modal-close" onclick="closeModal()">'+ic('x',16)+'</button><h3>'+ic('layers',16)+' Asignar Coach: '+esc(coach.name)+'</h3><div style="display:grid;gap:10px;margin-bottom:16px">';
  (DATA.groups||[]).forEach(function(g){
    var checked=assigned.indexOf(g.id)>=0?'checked':'';
    h+='<label style="display:flex;align-items:center;gap:10px;padding:12px 16px;background:rgba(255,255,255,0.03);border-radius:8px;cursor:pointer">'+
      '<input type="checkbox" id="cg_'+g.id+'" '+checked+' style="width:18px;height:18px;accent-color:var(--neon)">'+
      '<span>'+esc(g.name)+' <span style="color:#555">('+esc(g.description||'')+')</span></span></label>';
  });
  h+='</div><button class="btn-primary" onclick="saveCoachGroups(\''+coachId+'\')" style="width:100%;justify-content:center">'+ic('save',16)+' Guardar Asignaciones</button>';
  openModal(h);
}
function saveCoachGroups(coachId){
  (DATA.groups||[]).forEach(function(g){
    var cb=document.getElementById('cg_'+g.id);
    if(!cb)return;
    if(!DATA.group_coaches)DATA.group_coaches=[];
    DATA.group_coaches=DATA.group_coaches.filter(function(gc){return!(gc.coach_id===coachId&&gc.group_id===g.id)});
    if(cb.checked)DATA.group_coaches.push({id:uid(),group_id:g.id,coach_id:coachId});
  });
  saveData(DATA);closeModal();renderCoaches();updateCounts();toast('Asignaciones guardadas');
}

// ========== CRUD: GRUPOS ==========
function renderGroups(){
  var h='<div style="display:grid;gap:20px">';
  var coachGroups=currentUser&&currentUser.coachName?(DATA.group_coaches||[]).filter(function(gc){
    var c=(DATA.coaches||[]).find(function(c){return c.id===gc.coach_id});
    return c&&c.name===currentUser.coachName;
  }).map(function(gc){return gc.group_id}):null;
  (DATA.groups||[]).forEach(function(g){
    if(coachGroups&&coachGroups.indexOf(g.id)<0)return;
    var coaches=(DATA.group_coaches||[]).filter(function(gc){return gc.group_id===g.id}).map(function(gc){return(DATA.coaches||[]).find(function(c){return c.id===gc.coach_id})}).filter(Boolean);
    var members=(DATA.members||[]).filter(function(m){return (m.group_id&&m.group_id.trim()===g.id)||(!m.group_id&&getGroupFromRank(m.rank)===g.id)});
    h+='<div class="glass-card" style="padding:24px">'+
      '<h3 style="font-family:var(--font-display);font-size:16px;margin-bottom:4px">'+esc(g.name)+'</h3>'+
      '<p style="color:#888;font-size:13px;margin-bottom:14px">'+esc(g.description||'')+'</p>'+
      '<div style="display:flex;flex-direction:column;gap:14px">';
    if(coaches.length){
      coaches.forEach(function(c){
        var students=members.filter(function(m){return m.coach&&m.coach.toLowerCase()===c.name.toLowerCase()});
        h+='<div class="has-glow" style="padding:12px 16px;background:rgba(255,255,255,0.02);border-radius:10px;border-left:3px solid var(--neon-light)">'+
          '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">'+
          (c.avatar?'<img src="'+esc(c.avatar)+'" style="width:28px;height:28px;border-radius:50%;object-fit:cover">':'<span style="width:28px;height:28px;border-radius:50%;background:rgba(139,92,246,0.15);display:flex;align-items:center;justify-content:center;font-size:12px">'+ic('user',14)+'</span>')+
          '<span style="font-weight:600;font-size:14px">'+esc(c.name)+'</span>'+
          '<span style="color:#555;font-size:12px">'+esc(c.nickname?'('+c.nickname+')':'')+'</span>'+
          '<span style="color:'+(c.status==='active'?'#8b5cf6':'#888')+';font-size:11px;margin-left:auto">'+(c.status==='active'?'? activo':'? inactivo')+'</span>'+
          '</div>'+
          (students.length?'<div style="display:flex;flex-direction:column;gap:4px;padding-left:36px">'+
            students.map(function(m){return'<div style="display:flex;align-items:center;gap:8px;padding:4px 0;font-size:13px">'+
              '<span>'+esc(m.name)+'</span><span style="color:#555;font-size:12px">'+esc(m.rank||'')+'</span></div>'}).join('')+
          '</div>':'<div style="padding-left:36px;color:#555;font-size:13px">Sin estudiantes asignados</div>')+
        '</div>';
      });
    }else{
      h+='<div style="color:#555;font-size:13px;padding:8px 0">Sin coaches asignados a este grupo</div>';
    }
    // Members without a coach
    var unassigned=members.filter(function(m){return!m.coach||!coaches.some(function(c){return m.coach.toLowerCase()===c.name.toLowerCase()})});
    if(unassigned.length){
      h+='<div class="has-glow" style="padding:12px 16px;background:rgba(255,255,255,0.02);border-radius:10px;border-left:3px solid #555">'+
        '<div style="font-size:13px;color:#888;margin-bottom:6px">'+ic('users',13)+' Sin coach / Directiva ('+unassigned.length+')</div>'+
        '<div style="display:flex;flex-direction:column;gap:4px;padding-left:20px">'+
        unassigned.map(function(m){return'<div style="display:flex;align-items:center;gap:8px;padding:3px 0;font-size:13px">'+
          '<span>'+esc(m.name)+'</span><span style="color:#555;font-size:12px">'+esc(m.rank||'')+'</span></div>'}).join('')+
        '</div></div>';
    }
    h+='</div></div>';
  });
  h+='</div>';
  document.getElementById('adminContent').innerHTML=h;
}
