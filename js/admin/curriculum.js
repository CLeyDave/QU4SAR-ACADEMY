// ========== ADMIN CURRICULUM ==========

function renderSection_curriculum(){
  var gid=(document.getElementById('adminGF')&&document.getElementById('adminGF').value)||'';
  var items=filterByCurrentCoach(DATA.curriculum||[]);
  if(gid)items=items.filter(function(i){return i.group_id===gid});
  var fh=adminGroupFilterHTML(gid,'renderSection_curriculum()');
  var btn='<button class="btn-primary" onclick="curriculumForm(null)" style="margin-bottom:14px;font-size:13px">'+ic('plus',14)+' Nuevo Tema</button>';
  document.getElementById('adminContent').innerHTML=fh+adminTable(items,['Título','Semana','Temas','Coach','Grupo','Archivos'],function(c){
    var topics=(c.topics||[]).map(function(t){return esc(t)}).join('<br>');
    return '<td>'+esc(c.title)+'</td><td>Semana '+c.week+'</td><td><div class="cell-preview" onclick="viewCurriculum(\''+c.id+'\')" title="Ver todos los temas">'+topics+'</div></td><td>'+esc(c.coach||'—')+'</td><td>'+groupName(c.group_id)+'</td><td>'+(c.image_url?'<a href="'+esc(c.image_url)+'" target="_blank" title="Ver imagen">'+ic('image',14)+'</a> ':'')+(c.attachment_url?'<a href="'+esc(c.attachment_url)+'" target="_blank" title="Descargar '+esc(c.attachment_name||'archivo')+'">'+ic('paperclip',14)+'</a>':'')+'</td><td><div class="has-glow admin-actions"><button onclick="curriculumForm(\''+c.id+'\')">'+ic('pencil',14)+'</button><button class="del" onclick="delCurriculum(\''+c.id+'\')">'+ic('trash-2',14)+'</button></div></td>'},'No hay plan de estudio',btn);
}

function curriculumForm(id){
  var item=id?(DATA.curriculum||[]).find(function(c){return c.id===id}):null;
  var f=item||{title:'',description:'',week:1,topics:[],color:'#8B5CF6',group_id:'',coach:dc(),image_url:'',attachment_url:'',attachment_name:''};
  openModal('<button class="modal-close" onclick="closeModal()">'+ic('x',16)+'</button><h3>'+(item?'Editar':'Nuevo')+' Tema</h3>'+
    '<div class="field"><label>Título</label><input class="input-field" id="cf_title" value="'+esc(f.title)+'"></div>'+
    '<div class="field"><label>Descripción</label><textarea class="input-field" id="cf_description" rows="3">'+esc(f.description||'')+'</textarea></div>'+
    '<div class="field"><label>Semana</label><input type="number" class="input-field" id="cf_week" value="'+f.week+'"></div>'+
    '<div class="field"><label>Temas (uno por línea)</label><textarea class="input-field" id="cf_topics" rows="4">'+esc((f.topics||[]).join('\n'))+'</textarea></div>'+
    '<div class="field"><label>Color</label><input type="text" class="input-field" id="cf_color" value="'+esc(f.color)+'"></div>'+
    '<div class="field" style="display:none"><label>Grupo</label><select class="input-field" id="cf_group" onchange="reloadCoachDropdown(\'cf_coach\',this.value)"><option value="">General (Ambos)</option>'+(DATA.groups||[]).map(function(g){return'<option value="'+g.id+'"'+(f.group_id===g.id?' selected':'')+'>'+esc(g.name)+'</option>'}).join('')+'</select></div>'+
    '<div class="field"><label>Coach asignado</label><select class="input-field" id="cf_coach" onchange="setGroupFromCoach(\'cf_group\',\'cf_coach\')"><option value="">Sin coach</option>'+coachOptions(f.coach||'',f.group_id)+'</select></div>'+
    '<hr>'+
    '<div class="field"><label>Imagen</label>'+fileUploadHTML('Imagen','image/*','cf_img_status','cf_image_url',f.image_url||'')+(f.image_url?mediaPreview(f.image_url):'')+'</div>'+
    '<div class="field"><label>Archivo adjunto (PDF)</label>'+fileUploadHTML('PDF','.pdf,application/pdf','cf_doc_status','cf_attachment_url',f.attachment_url||'')+'<input class="input-field" id="cf_attachment_name" placeholder="Nombre del archivo" value="'+esc(f.attachment_name||'')+'"></div>'+
    '<button class="btn-primary" onclick="saveCurriculum(\''+(id||'')+'\')" style="width:100%;justify-content:center">'+ic('save',16)+' Guardar</button>');
}

function saveCurriculum(id){
  var obj={title:document.getElementById('cf_title').value,description:document.getElementById('cf_description').value,week:parseInt(document.getElementById('cf_week').value)||1,topics:document.getElementById('cf_topics').value.split('\n').map(function(s){return s.trim()}).filter(function(s){return s}),color:document.getElementById('cf_color').value,group_id:document.getElementById('cf_group').value,coach:document.getElementById('cf_coach')?.value||'',image_url:document.getElementById('cf_image_url').value,attachment_url:document.getElementById('cf_attachment_url').value,attachment_name:document.getElementById('cf_attachment_name').value};
  if(!DATA.curriculum)DATA.curriculum=[];
  if(id){var idx=DATA.curriculum.findIndex(function(c){return c.id===id});if(idx>=0)DATA.curriculum[idx]={...DATA.curriculum[idx],...obj}}else{obj.id=uid();DATA.curriculum.push(obj)}
  saveData(DATA);closeModal();renderSection_curriculum();updateCounts();toast(id?'Tema actualizado':'Tema creado');
}

function delCurriculum(id){if(!confirmDel())return;DATA.curriculum=DATA.curriculum.filter(function(c){return c.id!==id});saveData(DATA);renderSection_curriculum();updateCounts();toast('Tema eliminado');}

function viewCurriculum(id){
  var c=(DATA.curriculum||[]).find(function(x){return x.id===id});
  if(!c)return;
  openModal('<button class="modal-close" onclick="closeModal()">'+ic('x',16)+'</button><h3>'+esc(c.title)+'</h3><div style="color:#888;font-size:13px;line-height:1.8;white-space:pre-wrap;max-height:70vh;overflow-y:auto;padding-right:8px">'+(c.topics||[]).map(function(t){return esc(t)}).join('<br>')+'</div>');
}
