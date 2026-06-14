// ========== ADMIN EVALUATIONS ==========

function renderSection_evals(){
  var gid=(document.getElementById('adminGF')&&document.getElementById('adminGF').value)||'';
  var items=filterByCurrentCoach(DATA.evaluations||[]);
  if(gid)items=items.filter(function(i){return i.group_id===gid});
  var fh=adminGroupFilterHTML(gid,'renderSection_evals()');
  var btn='<button class="btn-primary" onclick="evalForm(null)" style="margin-bottom:14px;font-size:13px">'+ic('plus',14)+' Nueva Evaluación</button>';
  document.getElementById('adminContent').innerHTML=fh+adminTable(items,['Miembro','Fecha','AIM','Game Sense','Comunicación','Trabajo Equipo','Coach','Grupo','Archivos'],function(e){
    return '<td>'+esc(e.member_name)+'</td><td>'+esc(e.date)+'</td><td>'+e.aim+'</td><td>'+e.game_sense+'</td><td>'+e.communication+'</td><td>'+e.teamwork+'</td><td>'+esc(e.coach||'—')+'</td><td>'+groupName(e.group_id)+'</td><td>'+(e.image_url?'<a href="'+esc(e.image_url)+'" target="_blank" title="Ver imagen">'+ic('image',14)+'</a> ':'')+(e.attachment_url?'<a href="'+esc(e.attachment_url)+'" target="_blank" title="Descargar '+esc(e.attachment_name||'archivo')+'">'+ic('paperclip',14)+'</a>':'')+'</td><td><div class=" admin-actions"><button onclick="evalForm(\''+e.id+'\')">'+ic('pencil',14)+'</button><button class="del" onclick="delEval(\''+e.id+'\')">'+ic('trash-2',14)+'</button></div></td>'},'No hay evaluaciones',btn,'delEval');
}

function evalForm(id){
  var item=id?(DATA.evaluations||[]).find(function(e){return e.id===id}):null;
  var f=item||{member_name:'',aim:3,game_sense:3,communication:3,teamwork:3,coach:dc(),group_id:'',coach_notes:'',date:new Date().toISOString().slice(0,10),image_url:'',attachment_url:'',attachment_name:'',subject:'',month:1,weight:1};
  openModal('<button class="modal-close" onclick="closeModal()">'+ic('x',16)+'</button><h3>'+(item?'Editar':'Nueva')+' Evaluación</h3>'+
    '<div class="field"><label for="ef_member_name">Miembro</label><select class="input-field" id="ef_member_name">'+(DATA.members||[]).map(function(m){return'<option value="'+esc(m.name)+'" '+(m.name===f.member_name?'selected':'')+'>'+esc(m.name)+'</option>'}).join('')+'</select></div>'+
    '<div class="grid-2"><div class="field"><label for="ef_aim">AIM (1-5)</label><input type="number" min="1" max="5" class="input-field" id="ef_aim" value="'+f.aim+'"></div>'+
    '<div class="field"><label for="ef_game_sense">Game Sense (1-5)</label><input type="number" min="1" max="5" class="input-field" id="ef_game_sense" value="'+f.game_sense+'"></div></div>'+
    '<div class="grid-2"><div class="field"><label for="ef_communication">Comunicación (1-5)</label><input type="number" min="1" max="5" class="input-field" id="ef_communication" value="'+f.communication+'"></div>'+
    '<div class="field"><label for="ef_teamwork">Trabajo Equipo (1-5)</label><input type="number" min="1" max="5" class="input-field" id="ef_teamwork" value="'+f.teamwork+'"></div></div>'+
    '<div class="field" style="display:none"><label for="ef_group">Grupo</label><select class="input-field" id="ef_group" onchange="reloadCoachDropdown(\'ef_coach\',this.value)"><option value="">General (Ambos)</option>'+(DATA.groups||[]).map(function(g){return'<option value="'+g.id+'"'+(f.group_id===g.id?' selected':'')+'>'+esc(g.name)+'</option>'}).join('')+'</select></div>'+
    '<div class="field"><label for="ef_coach">Coach</label><select class="input-field" id="ef_coach" onchange="setGroupFromCoach(\'ef_group\',\'ef_coach\')"><option value="">Sin coach</option>'+coachOptions(f.coach||'',f.group_id)+'</select></div>'+
    '<div class="field"><label for="ef_coach_notes">Notas del Coach</label><textarea class="input-field" id="ef_coach_notes" rows="3">'+esc(f.coach_notes||'')+'</textarea></div>'+
    '<div class="field"><label for="ef_date">Fecha</label><input type="date" class="input-field" id="ef_date" value="'+f.date+'"></div>'+
    '<div class="grid-3"><div class="field"><label for="ef_subject">Materia</label><input class="input-field" id="ef_subject" value="'+esc(f.subject||'')+'" placeholder="ej: Aim Lab"></div>'+
    '<div class="field"><label for="ef_month">Mes</label><input type="number" min="1" max="12" class="input-field" id="ef_month" value="'+(f.month||1)+'"></div>'+
    '<div class="field"><label for="ef_weight">Peso</label><input type="number" min="1" max="10" class="input-field" id="ef_weight" value="'+(f.weight||1)+'"></div></div>'+
    '<hr>'+
    '<div class="field"><label>Imagen</label>'+fileUploadHTML('Imagen','image/*','ef_img_status','ef_image_url',f.image_url||'')+(f.image_url?mediaPreview(f.image_url):'')+'</div>'+
    '<div class="field"><label>Archivo adjunto (PDF)</label>'+fileUploadHTML('PDF','.pdf,application/pdf','ef_doc_status','ef_attachment_url',f.attachment_url||'')+'<input class="input-field" id="ef_attachment_name" placeholder="Nombre del archivo" value="'+esc(f.attachment_name||'')+'"></div>'+
    '<button class="btn-primary" onclick="saveEval(\''+(id||'')+'\')" style="width:100%;justify-content:center">'+ic('save',16)+' Guardar</button>');
}

function saveEval(id){
  var obj={member_name:document.getElementById('ef_member_name').value,aim:parseInt(document.getElementById('ef_aim').value)||3,game_sense:parseInt(document.getElementById('ef_game_sense').value)||3,communication:parseInt(document.getElementById('ef_communication').value)||3,teamwork:parseInt(document.getElementById('ef_teamwork').value)||3,group_id:document.getElementById('ef_group').value,coach:document.getElementById('ef_coach')?.value||'',coach_notes:document.getElementById('ef_coach_notes').value,date:document.getElementById('ef_date').value,subject:document.getElementById('ef_subject').value,month:parseInt(document.getElementById('ef_month').value)||1,weight:parseInt(document.getElementById('ef_weight').value)||1,image_url:document.getElementById('ef_image_url').value,attachment_url:document.getElementById('ef_attachment_url').value,attachment_name:document.getElementById('ef_attachment_name').value};
  if(!DATA.evaluations)DATA.evaluations=[];
  if(id){var idx=DATA.evaluations.findIndex(function(e){return e.id===id});if(idx>=0)DATA.evaluations[idx]={...DATA.evaluations[idx],...obj}}else{obj.id=uid();DATA.evaluations.push(obj)}
  saveData(DATA);closeModal();renderSection_evals();updateCounts();toast(id?'Evaluación actualizada':'Evaluación creada');
}

function delEval(id){if(!confirmDel())return;DATA.evaluations=DATA.evaluations.filter(function(e){return e.id!==id});saveData(DATA);renderSection_evals();updateCounts();toast('Evaluación eliminada');}
