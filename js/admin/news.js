// ========== ADMIN NEWS ==========

function renderSection_news(){
  var gid=(document.getElementById('adminGF')&&document.getElementById('adminGF').value)||'';
  var items=filterByCurrentCoach(DATA.news||[]);
  if(gid)items=items.filter(function(i){return i.group_id===gid});
  var fh=adminGroupFilterHTML(gid,'renderSection_news()');
  var btn='<button class="btn-primary" onclick="newsForm(null)" style="margin-bottom:14px;font-size:13px">'+ic('plus',14)+' Nueva Noticia</button>';
  document.getElementById('adminContent').innerHTML=fh+adminTable(items,['Título','Autor','Coach','Grupo','Estado','Archivos'],function(n){
    return '<td>'+esc(n.title)+'</td><td>'+esc(n.author||'Admin')+'</td><td>'+esc(n.coach||'-')+'</td><td>'+(n.group_id?groupName(n.group_id):'General')+'</td><td><span class="badge '+(n.published?'badge-green':'badge-gray')+'">'+(n.published?'Publicado':'Borrador')+'</span></td><td>'+(n.image_url?'<a href="'+esc(n.image_url)+'" target="_blank" title="Ver imagen">'+ic('image',14)+'</a> ':'')+(n.attachment_url?'<a href="'+esc(n.attachment_url)+'" target="_blank" title="Descargar '+esc(n.attachment_name||'archivo')+'">'+ic('paperclip',14)+'</a>':'')+'</td><td><div class=" admin-actions"><button onclick="newsForm(\''+n.id+'\')">'+ic('pencil',14)+'</button><button class="del" onclick="delNews(\''+n.id+'\')">'+ic('trash-2',14)+'</button></div></td>'},'No hay noticias',btn,'delNews');
}

function newsForm(id){
  var item=id?(DATA.news||[]).find(function(n){return n.id===id}):null;
  var f=item||{title:'',content:'',excerpt:'',author:'Admin',published:false,coach:dc(),group_id:'',date:new Date().toISOString().slice(0,10),image_url:'',attachment_url:'',attachment_name:''};
  openModal('<button class="modal-close" onclick="closeModal()">'+ic('x',16)+'</button><h3>'+(item?'Editar':'Nueva')+' Noticia</h3>'+
    '<div class="field"><label>Título</label><input class="input-field" id="nf_title" value="'+esc(f.title)+'"></div>'+
    '<div class="field"><label>Extracto</label><input class="input-field" id="nf_excerpt" value="'+esc(f.excerpt||'')+'"></div>'+
    '<div class="field"><label>Contenido</label><textarea class="input-field" id="nf_content" rows="4">'+esc(f.content||'')+'</textarea></div>'+
    '<div class="field"><label>Autor</label><input class="input-field" id="nf_author" value="'+esc(f.author||'')+'"></div>'+
    '<div class="grid-3"><div class="field"><label>Fecha</label><input class="input-field" type="date" id="nf_date" value="'+esc(f.date||new Date().toISOString().slice(0,10))+'"></div>'+
    '<div class="field"><label style="display:flex;align-items:center;gap:8px;cursor:pointer;margin-top:24px"><input type="checkbox" id="nf_published" '+(f.published?'checked':'')+'> Publicado</label></div>'+
    '<div class="field"><label>Coach</label><select class="input-field" id="nf_coach" onchange="setGroupFromCoach(\'nf_group\',\'nf_coach\')"><option value="">Sin coach</option>'+coachOptions(f.coach||'',f.group_id)+'</select></div></div>'+
    '<div class="field"><label>Grupo</label><select class="input-field" id="nf_group" onchange="reloadCoachDropdown(\'nf_coach\',this.value)"><option value="">General</option>'+(DATA.groups||[]).map(function(g){return'<option value="'+g.id+'" '+(f.group_id===g.id?'selected':'')+'>'+esc(g.name)+'</option>'}).join('')+'</select></div>'+
    '<hr>'+
    '<div class="field"><label>Imagen</label>'+fileUploadHTML('Imagen','image/*','nf_img_status','nf_image_url',f.image_url||'')+(f.image_url?mediaPreview(f.image_url):'')+'</div>'+
    '<div class="field"><label>Archivo adjunto (PDF)</label>'+fileUploadHTML('PDF','.pdf,application/pdf','nf_doc_status','nf_attachment_url',f.attachment_url||'')+'<input class="input-field" id="nf_attachment_name" placeholder="Nombre del archivo" value="'+esc(f.attachment_name||'')+'"></div>'+
    '<button class="btn-primary" onclick="saveNews(\''+(id||'')+'\')" style="width:100%;justify-content:center">'+ic('save',16)+' Guardar</button>');
}

function saveNews(id){
  var obj={title:document.getElementById('nf_title').value,excerpt:document.getElementById('nf_excerpt').value,content:document.getElementById('nf_content').value,author:document.getElementById('nf_author').value,published:document.getElementById('nf_published').checked,coach:document.getElementById('nf_coach').value,group_id:document.getElementById('nf_group').value,date:document.getElementById('nf_date')?.value||new Date().toISOString().slice(0,10),image_url:document.getElementById('nf_image_url').value,attachment_url:document.getElementById('nf_attachment_url').value,attachment_name:document.getElementById('nf_attachment_name').value};
  if(!DATA.news)DATA.news=[];
  if(id){var idx=DATA.news.findIndex(function(n){return n.id===id});if(idx>=0)DATA.news[idx]={...DATA.news[idx],...obj}}else{obj.id=uid();DATA.news.unshift(obj)}
  saveData(DATA);closeModal();renderSection_news();updateCounts();toast(id?'Noticia actualizada':'Noticia creada');
}

function delNews(id){if(!confirmDel())return;DATA.news=DATA.news.filter(function(n){return n.id!==id});saveData(DATA);renderSection_news();updateCounts();toast('Noticia eliminada');}
