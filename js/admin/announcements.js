// ========== ADMIN ANNOUNCEMENTS ==========

function renderSection_announcements(){
  var gid=(document.getElementById('adminGF')&&document.getElementById('adminGF').value)||'';
  var items=filterByCurrentCoach(DATA.announcements||[]);
  if(gid)items=items.filter(function(i){return i.group_id===gid});
  var fh=adminGroupFilterHTML(gid,'renderSection_announcements()');
  var btn='<button class="btn-primary" onclick="announcementForm(null)" style="margin-bottom:14px;font-size:13px">'+ic('plus',14)+' Nuevo Anuncio</button>';
  document.getElementById('adminContent').innerHTML=fh+adminTable(items,['Título','Autor','Coach','Fijado','Grupo','Archivos'],function(a){
    return '<td>'+esc(a.title)+'</td><td>'+esc(a.author)+'</td><td>'+esc(a.coach||'-')+'</td><td>'+(a.pinned?'<span class="badge badge-green">Sí</span>':'<span class="badge badge-gray">No</span>')+'</td><td>'+groupName(a.group_id)+'</td><td>'+(a.image_url?'<a href="'+esc(a.image_url)+'" target="_blank" title="Ver imagen">'+ic('image',14)+'</a> ':'')+(a.attachment_url?'<a href="'+esc(a.attachment_url)+'" target="_blank" title="Descargar '+esc(a.attachment_name||'archivo')+'">'+ic('paperclip',14)+'</a>':'')+'</td><td><div class=" admin-actions"><button onclick="announcementForm(\''+a.id+'\')">'+ic('pencil',14)+'</button><button class="del" onclick="delAnnouncement(\''+a.id+'\')">'+ic('trash-2',14)+'</button></div></td>'},'No hay anuncios',btn,'delAnnouncement');
}

function announcementForm(id){
  var item=id?(DATA.announcements||[]).find(function(a){return a.id===id}):null;
  var f=item||{title:'',content:'',author:'',pinned:false,coach:dc(),group_id:'',image_url:'',attachment_url:'',attachment_name:''};
  openModal('<button class="modal-close" onclick="closeModal()">'+ic('x',16)+'</button><h3>'+(item?'Editar':'Nuevo')+' Anuncio</h3>'+
    '<div class="field"><label for="af_title">Título</label><input class="input-field" id="af_title" value="'+esc(f.title)+'"></div>'+
    '<div class="field"><label for="af_content">Contenido</label><textarea class="input-field" id="af_content" rows="4">'+esc(f.content||'')+'</textarea></div>'+
    '<div class="field"><label for="af_author">Autor</label><input class="input-field" id="af_author" value="'+esc(f.author)+'"></div>'+
    '<div class="field"><label style="display:flex;align-items:center;gap:8px;cursor:pointer"><input type="checkbox" id="af_pinned" '+(f.pinned?'checked':'')+'> Fijado</label></div>'+
    '<div class="field"><label for="af_coach">Coach</label><select class="input-field" id="af_coach" onchange="setGroupFromCoach(\'af_group\',\'af_coach\')"><option value="">Sin coach</option>'+coachOptions(f.coach||'',f.group_id)+'</select></div>'+
    '<div class="field" style="display:none"><label for="af_group">Grupo</label><select class="input-field" id="af_group" onchange="reloadCoachDropdown(\'af_coach\',this.value)"><option value="">General (Ambos)</option>'+(DATA.groups||[]).map(function(g){return'<option value="'+g.id+'"'+(f.group_id===g.id?' selected':'')+'>'+esc(g.name)+'</option>'}).join('')+'</select></div>'+
    '<hr>'+
    '<div class="field"><label>Imagen</label>'+fileUploadHTML('Imagen','image/*','anf_img_status','anf_image_url',f.image_url||'')+(f.image_url?mediaPreview(f.image_url):'')+'</div>'+
    '<div class="field"><label>Archivo adjunto (PDF)</label>'+fileUploadHTML('PDF','.pdf,application/pdf','anf_doc_status','anf_attachment_url',f.attachment_url||'')+'<input class="input-field" id="anf_attachment_name" placeholder="Nombre del archivo" value="'+esc(f.attachment_name||'')+'"></div>'+
    '<button class="btn-primary" onclick="saveAnnouncement(\''+(id||'')+'\')" style="width:100%;justify-content:center">'+ic('save',16)+' Guardar</button>');
}

function saveAnnouncement(id){
  var obj={title:document.getElementById('af_title').value,content:document.getElementById('af_content').value,author:document.getElementById('af_author').value,pinned:document.getElementById('af_pinned').checked,coach:document.getElementById('af_coach').value,group_id:document.getElementById('af_group').value,image_url:document.getElementById('anf_image_url').value,attachment_url:document.getElementById('anf_attachment_url').value,attachment_name:document.getElementById('anf_attachment_name').value};
  if(!DATA.announcements)DATA.announcements=[];
  if(id){var idx=DATA.announcements.findIndex(function(a){return a.id===id});if(idx>=0)DATA.announcements[idx]={...DATA.announcements[idx],...obj}}else{obj.id=uid();DATA.announcements.push(obj)}
  saveData(DATA);closeModal();renderSection_announcements();updateCounts();toast(id?'Anuncio actualizado':'Anuncio creado');
}

function delAnnouncement(id){if(!confirmDel())return;DATA.announcements=DATA.announcements.filter(function(a){return a.id!==id});saveData(DATA);renderSection_announcements();updateCounts();toast('Anuncio eliminado');}
