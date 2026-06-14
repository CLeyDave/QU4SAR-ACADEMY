// ========== ADMIN CLASSES ==========

function renderSection_classes(){
  var gid=(document.getElementById('adminGF')&&document.getElementById('adminGF').value)||'';
  var items=filterByCurrentCoach(DATA.academy||[]);
  if(gid)items=items.filter(function(i){return i.group_id===gid});
  var fh=adminGroupFilterHTML(gid,'renderSection_classes()');
  var btn='<button class="btn-primary" onclick="academyForm(null)" style="margin-bottom:14px;font-size:13px">'+ic('plus',14)+' Nueva Clase</button>';
  document.getElementById('adminContent').innerHTML=fh+adminTable(items,['Día','Tema','Coach','Duración','Archivos'],function(a){
    return '<td>'+esc(a.day)+'</td><td><div class="cell-preview" onclick="viewAcademyTopic(\''+a.id+'\')">'+esc(a.topic)+'</div></td><td>'+esc(a.coach||'-')+'</td><td>'+esc(a.duration||'-')+'</td><td>'+(a.image_url?'<a href="'+esc(a.image_url)+'" target="_blank" title="Ver imagen">'+ic('image',14)+'</a> ':'')+(a.attachment_url?'<a href="'+esc(a.attachment_url)+'" target="_blank" title="Descargar '+esc(a.attachment_name||'archivo')+'">'+ic('paperclip',14)+'</a>':'')+'</td><td><div class=" admin-actions"><button onclick="academyForm(\''+a.id+'\')">'+ic('pencil',14)+'</button><button class="del" onclick="delAcademy(\''+a.id+'\')">'+ic('trash-2',14)+'</button></div></td>'},'No hay clases en la academia',btn,'delAcademy');
}

function academyForm(id){
  var item=id?(DATA.academy||[]).find(function(a){return a.id===id}):null;
  var f=item||{day:'Lunes',topic:'',objectives:[],prerequisites:[],duration:'',group_id:'',coach:dc(),image_url:'',attachment_url:'',attachment_name:'',month:1,module_name:'',subject:''};
   openModal('<button class="modal-close" onclick="closeModal()">'+ic('x',16)+'</button><h3>'+(item?'Editar':'Nueva')+' Clase</h3>'+
    '<div class="field"><label for="af_day">Día</label><select class="input-field" id="af_day">'+['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'].map(function(d){return'<option value="'+d+'" '+(d===f.day?'selected':'')+'>'+d+'</option>'}).join('')+'</select></div>'+
    '<div class="grid-3"><div class="field"><label for="af_topic">Tema</label><input class="input-field" id="af_topic" value="'+esc(f.topic)+'"></div>'+
    '<div class="field"><label for="af_subject">Materia</label><input class="input-field" id="af_subject" value="'+esc(f.subject||'')+'" placeholder="ej: Aim Lab"></div>'+
    '<div class="field"><label for="af_module">Módulo</label><input class="input-field" id="af_module" value="'+esc(f.module_name||'')+'" placeholder="ej: Fundamentos"></div></div>'+
    '<div class="grid-2"><div class="field"><label for="af_month">Mes</label><input type="number" min="1" max="12" class="input-field" id="af_month" value="'+(f.month||1)+'"></div>'+
    '<div class="field"><label for="af_coach">Coach</label><select class="input-field" id="af_coach" onchange="setGroupFromCoach(\'acf_group\',\'af_coach\')"><option value="">Sin coach</option>'+coachOptions(f.coach||'',f.group_id)+'</select></div></div>'+
    '<div class="field"><label for="af_duration">Duración</label><input class="input-field" id="af_duration" placeholder="ej: 90 min" value="'+esc(f.duration||'')+'"></div>'+
    '<div class="field"><label for="af_prereqs">Requisitos previos (uno por línea)</label><textarea class="input-field" id="af_prereqs" rows="3">'+esc((f.prerequisites||[]).join('\n'))+'</textarea></div>'+
    '<div class="field"><label for="af_objectives">Objetivos (uno por línea)</label><textarea class="input-field" id="af_objectives" rows="4">'+esc((f.objectives||[]).join('\n'))+'</textarea></div>'+
     '<div class="field"><label for="acf_group">Grupo</label><select class="input-field" id="acf_group" onchange="reloadCoachDropdown(\'af_coach\',this.value)"><option value="">General (Ambos)</option>'+(DATA.groups||[]).map(function(g){return'<option value="'+g.id+'"'+(f.group_id===g.id?' selected':'')+'>'+esc(g.name)+'</option>'}).join('')+'</select></div>'+
    '<hr>'+
    '<div class="field"><label>Imagen</label>'+fileUploadHTML('Imagen','image/*','af_img_status','af_image_url',f.image_url||'')+(f.image_url?mediaPreview(f.image_url):'')+'</div>'+
    '<div class="field"><label>Archivo adjunto (PDF)</label>'+fileUploadHTML('PDF','.pdf,application/pdf','af_doc_status','af_attachment_url',f.attachment_url||'')+'<input class="input-field" id="af_attachment_name" placeholder="Nombre del archivo" value="'+esc(f.attachment_name||'')+'"></div>'+
    '<button class="btn-primary" onclick="saveAcademy(\''+(id||'')+'\')" style="width:100%;justify-content:center">'+ic('save',16)+' Guardar</button>');
}

function saveAcademy(id){
  var obj={day:document.getElementById('af_day').value,
    topic:document.getElementById('af_topic').value,
    subject:document.getElementById('af_subject').value,
    module_name:document.getElementById('af_module').value,
    month:parseInt(document.getElementById('af_month').value)||1,
    coach:document.getElementById('af_coach').value,
    duration:document.getElementById('af_duration').value,
    prerequisites:document.getElementById('af_prereqs').value.split('\n').map(function(s){return s.trim()}).filter(function(s){return s}),
    objectives:document.getElementById('af_objectives').value.split('\n').map(function(s){return s.trim()}).filter(function(s){return s}),group_id:document.getElementById('acf_group').value,
    image_url:document.getElementById('af_image_url').value,attachment_url:document.getElementById('af_attachment_url').value,attachment_name:document.getElementById('af_attachment_name').value};
  if(!DATA.academy)DATA.academy=[];
  if(id){var idx=DATA.academy.findIndex(function(a){return a.id===id});if(idx>=0)DATA.academy[idx]={...DATA.academy[idx],...obj}}else{obj.id=uid();DATA.academy.push(obj)}
  saveData(DATA);closeModal();renderSection_classes();updateCounts();toast(id?'Clase actualizada':'Clase creada');
}

function delAcademy(id){if(!confirmDel())return;DATA.academy=DATA.academy.filter(function(a){return a.id!==id});saveData(DATA);renderSection_classes();updateCounts();toast('Clase eliminada');}

function viewAcademyTopic(id){
  var a=(DATA.academy||[]).find(function(x){return x.id===id});
  if(!a)return;
  openModal('<button class="modal-close" onclick="closeModal()">'+ic('x',16)+'</button><h3>Tema: '+esc(a.topic)+'</h3><div style="color:#888;font-size:13px;line-height:1.8;white-space:pre-wrap">'+esc(a.topic)+'</div>');
}
