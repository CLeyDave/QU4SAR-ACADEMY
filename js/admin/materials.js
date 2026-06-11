// ========== ADMIN MATERIALS ==========

function renderSection_materials(){
  var gid=(document.getElementById('adminGF')&&document.getElementById('adminGF').value)||'';
  var items=filterByCurrentCoach(DATA.materials||[]);
  if(gid)items=items.filter(function(i){return i.group_id===gid});
  var fh=adminGroupFilterHTML(gid,'renderSection_materials()');
  var btn='<button class="btn-primary" onclick="materialForm(null)" style="margin-bottom:14px;font-size:13px">'+ic('plus',14)+' Nuevo Material</button>';
  document.getElementById('adminContent').innerHTML=fh+adminTable(items,['Título','Tipo','Coach','Grupo','Archivos'],function(m){
    return '<td>'+esc(m.title)+'</td><td><span class="badge badge-purple">'+esc(m.type)+'</span></td><td>'+esc(m.coach||'—')+'</td><td>'+groupName(m.group_id)+'</td><td>'+(m.image_url?'<a href="'+esc(m.image_url)+'" target="_blank" title="Ver imagen">'+ic('image',14)+'</a> ':'')+(m.attachment_url?'<a href="'+esc(m.attachment_url)+'" target="_blank" title="Descargar '+esc(m.attachment_name||'archivo')+'">'+ic('paperclip',14)+'</a>':'')+'</td><td><div class="has-glow admin-actions"><button onclick="materialForm(\''+m.id+'\')">'+ic('pencil',14)+'</button><button class="del" onclick="delMaterial(\''+m.id+'\')">'+ic('trash-2',14)+'</button></div></td>'},'No hay materiales',btn);
}

function materialForm(id){
  var item=id?(DATA.materials||[]).find(function(m){return m.id===id}):null;
  var f=item||{schedule_id:'',title:'',description:'',url:'',type:'video',group_id:'',coach:dc(),image_url:'',attachment_url:'',attachment_name:''};
  var classes=(DATA.schedule||[]).filter(function(s){return s.type==='academia'});
  openModal('<button class="modal-close" onclick="closeModal()">'+ic('x',16)+'</button><h3>'+(item?'Editar':'Nuevo')+' Material</h3>'+
    '<div class="field"><label>Clase</label><select class="input-field" id="mf_schedule_id">'+(classes.length?classes.map(function(c){var days=['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];return'<option value="'+c.id+'" '+(c.id===f.schedule_id?'selected':'')+'>'+esc(c.title)+' ('+days[c.day]+')</option>'}).join(''):'<option value="">Sin clases de academia</option>')+'</select></div>'+
    '<div class="field"><label>Título</label><input class="input-field" id="mf_title" value="'+esc(f.title)+'"></div>'+
    '<div class="field"><label>Descripción</label><textarea class="input-field" id="mf_description" rows="3">'+esc(f.description||'')+'</textarea></div>'+
    '<div class="field"><label>URL</label><input class="input-field" id="mf_url" value="'+esc(f.url)+'"></div>'+
    '<div class="field"><label>Tipo</label><select class="input-field" id="mf_type"><option value="video" '+(f.type==='video'?'selected':'')+'>Video</option><option value="guide" '+(f.type==='guide'?'selected':'')+'>Guía</option><option value="pdf" '+(f.type==='pdf'?'selected':'')+'>PDF</option><option value="other" '+(f.type==='other'?'selected':'')+'>Otro</option></select></div>'+
    '<div class="field" style="display:none"><label>Grupo</label><select class="input-field" id="mf_group" onchange="reloadCoachDropdown(\'mf_coach\',this.value)"><option value="">General (Ambos)</option>'+(DATA.groups||[]).map(function(g){return'<option value="'+g.id+'"'+(f.group_id===g.id?' selected':'')+'>'+esc(g.name)+'</option>'}).join('')+'</select></div>'+
    '<div class="field"><label>Coach asignado</label><select class="input-field" id="mf_coach" onchange="setGroupFromCoach(\'mf_group\',\'mf_coach\')"><option value="">Sin coach</option>'+coachOptions(f.coach||'',f.group_id)+'</select></div>'+
    '<hr>'+
    '<div class="field"><label>Imagen</label>'+fileUploadHTML('Imagen','image/*','mf_img_status','mf_image_url',f.image_url||'')+(f.image_url?mediaPreview(f.image_url):'')+'</div>'+
    '<div class="field"><label>Archivo adjunto (PDF)</label>'+fileUploadHTML('PDF','.pdf,application/pdf','mf_doc_status','mf_attachment_url',f.attachment_url||'')+'<input class="input-field" id="mf_attachment_name" placeholder="Nombre del archivo" value="'+esc(f.attachment_name||'')+'"></div>'+
    '<button class="btn-primary" onclick="saveMaterial(\''+(id||'')+'\')" style="width:100%;justify-content:center">'+ic('save',16)+' Guardar</button>');
}

function saveMaterial(id){
  var obj={schedule_id:document.getElementById('mf_schedule_id').value||null,title:document.getElementById('mf_title').value,description:document.getElementById('mf_description').value,url:document.getElementById('mf_url').value,type:document.getElementById('mf_type').value,group_id:document.getElementById('mf_group').value,coach:document.getElementById('mf_coach')?.value||'',image_url:document.getElementById('mf_image_url').value,attachment_url:document.getElementById('mf_attachment_url').value,attachment_name:document.getElementById('mf_attachment_name').value};
  if(!DATA.materials)DATA.materials=[];
  if(id){var idx=DATA.materials.findIndex(function(m){return m.id===id});if(idx>=0)DATA.materials[idx]={...DATA.materials[idx],...obj}}else{obj.id=uid();DATA.materials.push(obj)}
  saveData(DATA);closeModal();renderSection_materials();updateCounts();toast(id?'Material actualizado':'Material creado');
}

function delMaterial(id){if(!confirmDel())return;DATA.materials=DATA.materials.filter(function(m){return m.id!==id});saveData(DATA);renderSection_materials();updateCounts();toast('Material eliminado');}
