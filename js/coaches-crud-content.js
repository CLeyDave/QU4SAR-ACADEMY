// ========== CRUD: NEWS ==========
function renderNews(){
  var gid=(document.getElementById('adminGF')&&document.getElementById('adminGF').value)||'';
  var items=filterByCurrentCoach(DATA.news||[]);
  if(gid)items=items.filter(function(i){return i.group_id===gid});
  var fh=adminGroupFilterHTML(gid,'renderNews()');
  var btn='<button class="btn-primary" onclick="newsForm(null)" style="margin-bottom:14px;font-size:13px">'+ic('plus',14)+' Nueva Noticia</button>';
  document.getElementById('adminContent').innerHTML=fh+adminTable(items,['Título','Autor','Coach','Grupo','Estado','Archivos'],function(n){
    return '<td>'+esc(n.title)+'</td><td>'+esc(n.author||'Admin')+'</td><td>'+esc(n.coach||'-')+'</td><td>'+(n.group_id?groupName(n.group_id):'General')+'</td><td><span class="badge '+(n.published?'badge-green':'badge-gray')+'">'+(n.published?'Publicado':'Borrador')+'</span></td><td>'+(n.image_url?'<a href="'+esc(n.image_url)+'" target="_blank" title="Ver imagen">'+ic('image',14)+'</a> ':'')+(n.attachment_url?'<a href="'+esc(n.attachment_url)+'" target="_blank" title="Descargar '+esc(n.attachment_name||'archivo')+'">'+ic('paperclip',14)+'</a>':'')+'</td><td><div class="has-glow admin-actions"><button onclick="newsForm(\''+n.id+'\')">'+ic('pencil',14)+'</button><button class="del" onclick="delNews(\''+n.id+'\')">'+ic('trash-2',14)+'</button></div></td>'},'No hay noticias',btn);
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
  saveData(DATA);closeModal();renderNews();updateCounts();toast(id?'Noticia actualizada':'Noticia creada');
}
function delNews(id){if(!confirmDel())return;DATA.news=DATA.news.filter(function(n){return n.id!==id});saveData(DATA);renderNews();updateCounts();toast('Noticia eliminada');}

// ========== CRUD: TEAM ==========
function renderTeam(){
  var btn='<button class="btn-primary" onclick="teamForm(null)" style="margin-bottom:14px;font-size:13px">'+ic('plus',14)+' Nuevo Jugador</button>';
  document.getElementById('adminContent').innerHTML=adminTable(DATA.team,['Nombre','Rol','Rango','Estado'],function(m){
    return '<td>'+esc(m.name)+'</td><td>'+esc(m.role)+'</td><td>'+esc(m.rank||'-')+'</td><td><span class="badge '+(m.status==='Titular'?'badge-green':m.status==='Suplente'?'badge-yellow':'badge-blue')+'">'+m.status+'</span></td><td><div class="has-glow admin-actions"><button onclick="teamForm(\''+m.id+'\')">'+ic('pencil',14)+'</button><button class="del" onclick="delTeam(\''+m.id+'\')">'+ic('trash-2',14)+'</button></div></td>'},'No hay jugadores',btn);
}
function teamForm(id){
  var item=id?DATA.team.find(function(t){return t.id===id}):null;
  var f=item||{name:'',role:'Duelist',rank:'',status:'Titular',bio:''};
  openModal('<button class="modal-close" onclick="closeModal()">'+ic('x',16)+'</button><h3>'+(item?'Editar':'Nuevo')+' Jugador</h3>'+
    '<div class="field"><label>Nombre</label><input class="input-field" id="tf_name" value="'+esc(f.name)+'"></div>'+
    '<div class="grid-2"><div class="field"><label>Rol</label><select class="input-field" id="tf_role">'+['Duelist','Initiator','Controller','Sentinel','Flex'].map(function(r){return'<option value="'+r+'" '+(r===f.role?'selected':'')+'>'+r+'</option>'}).join('')+'</select></div>'+
    '<div class="field"><label>Rango</label><input class="input-field" id="tf_rank" value="'+esc(f.rank||'')+'"></div></div>'+
    '<div class="field"><label>Estado</label><select class="input-field" id="tf_status">'+['Titular','Suplente','Prueba'].map(function(s){return'<option value="'+s+'" '+(s===f.status?'selected':'')+'>'+s+'</option>'}).join('')+'</select></div>'+
    '<div class="field"><label>Bio</label><textarea class="input-field" id="tf_bio" rows="3">'+esc(f.bio||'')+'</textarea></div>'+
    '<button class="btn-primary" onclick="saveTeam(\''+(id||'')+'\')" style="width:100%;justify-content:center">'+ic('save',16)+' Guardar</button>');
}
function saveTeam(id){
  var obj={name:document.getElementById('tf_name').value,role:document.getElementById('tf_role').value,rank:document.getElementById('tf_rank').value,status:document.getElementById('tf_status').value,bio:document.getElementById('tf_bio').value};
  if(id){var idx=DATA.team.findIndex(function(t){return t.id===id});if(idx>=0)DATA.team[idx]={...DATA.team[idx],...obj}}else{obj.id=uid();DATA.team.push(obj)}
  saveData(DATA);closeModal();renderTeam();updateCounts();toast(id?'Jugador actualizado':'Jugador agregado');
}
function delTeam(id){if(!confirmDel())return;DATA.team=DATA.team.filter(function(t){return t.id!==id});saveData(DATA);renderTeam();updateCounts();toast('Jugador eliminado');}

// ========== CRUD: SCRIMS ==========
function renderScrims(){
  var gid=(document.getElementById('adminGF')&&document.getElementById('adminGF').value)||'';
  var items=filterByCurrentCoach(DATA.scrims||[]);
  if(gid)items=items.filter(function(i){return i.group_id===gid});
  var fh=adminGroupFilterHTML(gid,'renderScrims()');
  var btn='<button class="btn-primary" onclick="scrimForm(null)" style="margin-bottom:14px;font-size:13px">'+ic('plus',14)+' Nuevo Scrim</button>';
  document.getElementById('adminContent').innerHTML=fh+adminTable(items,['Oponente','Resultado','Score','Fecha','Coach','Grupo'],function(s){
    return '<td>'+esc(s.opponent)+'</td><td><span class="badge '+(s.result==='Victoria'?'badge-green':s.result==='Derrota'?'badge-red':'badge-gray')+'">'+s.result+'</span></td><td>'+s.our+' - '+s.opponent+'</td><td>'+s.date+'</td><td>'+esc(s.coach||'-')+'</td><td>'+groupName(s.group_id)+'</td><td><div class="has-glow admin-actions"><button onclick="scrimForm(\''+s.id+'\')">'+ic('pencil',14)+'</button><button class="del" onclick="delScrim(\''+s.id+'\')">'+ic('trash-2',14)+'</button></div></td>'},'No hay scrims',btn);
}
function scrimForm(id){
  var item=id?DATA.scrims.find(function(s){return s.id===id}):null;
  var f=item||{opponent:'',opponent_logo:'',our:0,opponent_score:0,result:'Pendiente',date:new Date().toISOString().slice(0,10),coach:dc(),group_id:''};
  openModal('<button class="modal-close" onclick="closeModal()">'+ic('x',16)+'</button><h3>'+(item?'Editar':'Nuevo')+' Scrim</h3>'+
    '<div class="field"><label>Oponente</label><input class="input-field" id="sf_opp" value="'+esc(f.opponent)+'"></div>'+
    '<div class="field"><label>Logo del oponente</label>'+fileUploadHTML('Logo','image/*','sf_logo_img_status','sf_opponent_logo',f.opponent_logo||'')+(f.opponent_logo?mediaPreview(f.opponent_logo):'')+'</div>'+
    '<div class="grid-2"><div class="field"><label>Nuestro Score</label><input type="number" class="input-field" id="sf_our" value="'+f.our+'"></div>'+
    '<div class="field"><label>Su Score</label><input type="number" class="input-field" id="sf_opp_score" value="'+(f.opponent_score||0)+'"></div></div>'+
    '<div class="field"><label>Resultado</label><select class="input-field" id="sf_result">'+['Pendiente','Victoria','Derrota','Empate'].map(function(r){return'<option value="'+r+'" '+(r===f.result?'selected':'')+'>'+r+'</option>'}).join('')+'</select></div>'+
    '<div class="field"><label>Fecha</label><input type="date" class="input-field" id="sf_date" value="'+f.date+'"></div>'+
    '<div class="field"><label>Coach</label><select class="input-field" id="scf_coach" onchange="setGroupFromCoach(\'scf_group\',\'scf_coach\')"><option value="">Sin coach</option>'+coachOptions(f.coach||'',f.group_id)+'</select></div>'+
    '<div class="field" style="display:none"><label>Grupo</label><select class="input-field" id="scf_group" onchange="reloadCoachDropdown(\'scf_coach\',this.value)"><option value="">General (Ambos)</option>'+(DATA.groups||[]).map(function(g){return'<option value="'+g.id+'"'+(f.group_id===g.id?' selected':'')+'>'+esc(g.name)+'</option>'}).join('')+'</select></div>'+
    '<button class="btn-primary" onclick="saveScrim(\''+(id||'')+'\')" style="width:100%;justify-content:center">'+ic('save',16)+' Guardar</button>');
}
function saveScrim(id){
  var obj={opponent:document.getElementById('sf_opp').value,opponent_logo:document.getElementById('sf_opponent_logo').value,our:parseInt(document.getElementById('sf_our').value)||0,opponent_score:parseInt(document.getElementById('sf_opp_score').value)||0,result:document.getElementById('sf_result').value,date:document.getElementById('sf_date').value,coach:document.getElementById('scf_coach').value,group_id:document.getElementById('scf_group').value};
  console.log('saveScrim opponent_logo:',obj.opponent_logo);
  if(id){var idx=DATA.scrims.findIndex(function(s){return s.id===id});if(idx>=0)DATA.scrims[idx]={...DATA.scrims[idx],...obj}}else{obj.id=uid();DATA.scrims.unshift(obj)}
  saveData(DATA);closeModal();renderScrims();updateCounts();toast(id?'Scrim actualizado':'Scrim registrado');
}
function delScrim(id){if(!confirmDel())return;DATA.scrims=DATA.scrims.filter(function(s){return s.id!==id});saveData(DATA);renderScrims();updateCounts();toast('Scrim eliminado');}

// ========== CRUD: STATS ==========
function renderStats(){
  var gid=(document.getElementById('adminGF')&&document.getElementById('adminGF').value)||'';
  var items=filterByCurrentCoach(DATA.stats||[]);
  if(gid)items=items.filter(function(i){return i.group_id===gid});
  var fh=adminGroupFilterHTML(gid,'renderStats()');
  var btn='<button class="btn-primary" onclick="statsForm(null)" style="margin-bottom:14px;font-size:13px">'+ic('plus',14)+' Nuevas Stats</button>';
  document.getElementById('adminContent').innerHTML=fh+adminTable(items,['Temporada','Partidas','Victorias','Derrotas','MVPs','Grupo'],function(s){
    return '<td>'+esc(s.season)+'</td><td>'+s.matches+'</td><td style="color:#8b5cf6">'+s.wins+'</td><td style="color:#8b5cf6">'+s.losses+'</td><td>'+s.mvps+'</td><td>'+groupName(s.group_id)+'</td><td><div class="has-glow admin-actions"><button onclick="statsForm(\''+s.id+'\')">'+ic('pencil',14)+'</button><button class="del" onclick="delStats(\''+s.id+'\')">'+ic('trash-2',14)+'</button></div></td>'},'No hay estadísticas',btn);
}
function statsForm(id){
  var item=id?DATA.stats.find(function(s){return s.id===id}):null;
  var f=item||{season:'Temporada 1',matches:0,wins:0,losses:0,mvps:0,group_id:''};
  openModal('<button class="modal-close" onclick="closeModal()">'+ic('x',16)+'</button><h3>'+(item?'Editar':'Nuevas')+' Estadísticas</h3>'+
    '<div class="field"><label>Temporada</label><input class="input-field" id="stf_season" value="'+esc(f.season)+'"></div>'+
    '<div class="grid-2"><div class="field"><label>Partidas</label><input type="number" class="input-field" id="stf_matches" value="'+f.matches+'"></div>'+
    '<div class="field"><label>Victorias</label><input type="number" class="input-field" id="stf_wins" value="'+f.wins+'"></div></div>'+
    '<div class="grid-2"><div class="field"><label>Derrotas</label><input type="number" class="input-field" id="stf_losses" value="'+f.losses+'"></div>'+
    '<div class="field"><label>MVPs</label><input type="number" class="input-field" id="stf_mvps" value="'+f.mvps+'"></div></div>'+
    '<div class="field"><label>Grupo</label><select class="input-field" id="stf_group"><option value="">General (Ambos)</option>'+(DATA.groups||[]).map(function(g){return'<option value="'+g.id+'"'+(f.group_id===g.id?' selected':'')+'>'+esc(g.name)+'</option>'}).join('')+'</select></div>'+
    '<button class="btn-primary" onclick="saveStats(\''+(id||'')+'\')" style="width:100%;justify-content:center">'+ic('save',16)+' Guardar</button>');
}
function saveStats(id){
  var obj={season:document.getElementById('stf_season').value,matches:parseInt(document.getElementById('stf_matches').value)||0,wins:parseInt(document.getElementById('stf_wins').value)||0,losses:parseInt(document.getElementById('stf_losses').value)||0,mvps:parseInt(document.getElementById('stf_mvps').value)||0,group_id:document.getElementById('stf_group').value};
  if(id){var idx=DATA.stats.findIndex(function(s){return s.id===id});if(idx>=0)DATA.stats[idx]={...DATA.stats[idx],...obj}}else{obj.id=uid();DATA.stats.push(obj)}
  saveData(DATA);closeModal();renderStats();updateCounts();toast(id?'Stats actualizadas':'Stats creadas');
}
function delStats(id){if(!confirmDel())return;DATA.stats=DATA.stats.filter(function(s){return s.id!==id});saveData(DATA);renderStats();updateCounts();toast('Stats eliminadas');}

// ========== CRUD: ANNOUNCEMENTS ==========
function renderAnnouncements(){
  var gid=(document.getElementById('adminGF')&&document.getElementById('adminGF').value)||'';
  var items=filterByCurrentCoach(DATA.announcements||[]);
  if(gid)items=items.filter(function(i){return i.group_id===gid});
  var fh=adminGroupFilterHTML(gid,'renderAnnouncements()');
  var btn='<button class="btn-primary" onclick="announcementForm(null)" style="margin-bottom:14px;font-size:13px">'+ic('plus',14)+' Nuevo Anuncio</button>';
  document.getElementById('adminContent').innerHTML=fh+adminTable(items,['Título','Autor','Coach','Fijado','Grupo','Archivos'],function(a){
    return '<td>'+esc(a.title)+'</td><td>'+esc(a.author)+'</td><td>'+esc(a.coach||'-')+'</td><td>'+(a.pinned?'<span class="badge badge-green">Sí</span>':'<span class="badge badge-gray">No</span>')+'</td><td>'+groupName(a.group_id)+'</td><td>'+(a.image_url?'<a href="'+esc(a.image_url)+'" target="_blank" title="Ver imagen">'+ic('image',14)+'</a> ':'')+(a.attachment_url?'<a href="'+esc(a.attachment_url)+'" target="_blank" title="Descargar '+esc(a.attachment_name||'archivo')+'">'+ic('paperclip',14)+'</a>':'')+'</td><td><div class="has-glow admin-actions"><button onclick="announcementForm(\''+a.id+'\')">'+ic('pencil',14)+'</button><button class="del" onclick="delAnnouncement(\''+a.id+'\')">'+ic('trash-2',14)+'</button></div></td>'},'No hay anuncios',btn);
}
function announcementForm(id){
  var item=id?(DATA.announcements||[]).find(function(a){return a.id===id}):null;
  var f=item||{title:'',content:'',author:'',pinned:false,coach:dc(),group_id:'',image_url:'',attachment_url:'',attachment_name:''};
  openModal('<button class="modal-close" onclick="closeModal()">'+ic('x',16)+'</button><h3>'+(item?'Editar':'Nuevo')+' Anuncio</h3>'+
    '<div class="field"><label>Título</label><input class="input-field" id="af_title" value="'+esc(f.title)+'"></div>'+
    '<div class="field"><label>Contenido</label><textarea class="input-field" id="af_content" rows="4">'+esc(f.content||'')+'</textarea></div>'+
    '<div class="field"><label>Autor</label><input class="input-field" id="af_author" value="'+esc(f.author)+'"></div>'+
    '<div class="field"><label style="display:flex;align-items:center;gap:8px;cursor:pointer"><input type="checkbox" id="af_pinned" '+(f.pinned?'checked':'')+'> Fijado</label></div>'+
    '<div class="field"><label>Coach</label><select class="input-field" id="af_coach" onchange="setGroupFromCoach(\'af_group\',\'af_coach\')"><option value="">Sin coach</option>'+coachOptions(f.coach||'',f.group_id)+'</select></div>'+
    '<div class="field" style="display:none"><label>Grupo</label><select class="input-field" id="af_group" onchange="reloadCoachDropdown(\'af_coach\',this.value)"><option value="">General (Ambos)</option>'+(DATA.groups||[]).map(function(g){return'<option value="'+g.id+'"'+(f.group_id===g.id?' selected':'')+'>'+esc(g.name)+'</option>'}).join('')+'</select></div>'+
    '<hr>'+
    '<div class="field"><label>Imagen</label>'+fileUploadHTML('Imagen','image/*','anf_img_status','anf_image_url',f.image_url||'')+(f.image_url?mediaPreview(f.image_url):'')+'</div>'+
    '<div class="field"><label>Archivo adjunto (PDF)</label>'+fileUploadHTML('PDF','.pdf,application/pdf','anf_doc_status','anf_attachment_url',f.attachment_url||'')+'<input class="input-field" id="anf_attachment_name" placeholder="Nombre del archivo" value="'+esc(f.attachment_name||'')+'"></div>'+
    '<button class="btn-primary" onclick="saveAnnouncement(\''+(id||'')+'\')" style="width:100%;justify-content:center">'+ic('save',16)+' Guardar</button>');
}
function saveAnnouncement(id){
  var obj={title:document.getElementById('af_title').value,content:document.getElementById('af_content').value,author:document.getElementById('af_author').value,pinned:document.getElementById('af_pinned').checked,coach:document.getElementById('af_coach').value,group_id:document.getElementById('af_group').value,image_url:document.getElementById('anf_image_url').value,attachment_url:document.getElementById('anf_attachment_url').value,attachment_name:document.getElementById('anf_attachment_name').value};
  if(!DATA.announcements)DATA.announcements=[];
  if(id){var idx=DATA.announcements.findIndex(function(a){return a.id===id});if(idx>=0)DATA.announcements[idx]={...DATA.announcements[idx],...obj}}else{obj.id=uid();DATA.announcements.push(obj)}
  saveData(DATA);closeModal();renderAnnouncements();updateCounts();toast(id?'Anuncio actualizado':'Anuncio creado');
}
function delAnnouncement(id){if(!confirmDel())return;DATA.announcements=DATA.announcements.filter(function(a){return a.id!==id});saveData(DATA);renderAnnouncements();updateCounts();toast('Anuncio eliminado');}

// ========== CRUD: CURRICULUM ==========
function renderCurriculum(cId){cId=cId||'adminContent';
  var gid=(document.getElementById('adminGF')&&document.getElementById('adminGF').value)||'';
  var items=filterByCurrentCoach(DATA.curriculum||[]);
  if(gid)items=items.filter(function(i){return i.group_id===gid});
  var fh=adminGroupFilterHTML(gid,'renderCurriculum()');
  var btn='<button class="btn-primary" onclick="curriculumForm(null)" style="margin-bottom:14px;font-size:13px">'+ic('plus',14)+' Nuevo Tema</button>';
  document.getElementById(cId).innerHTML=fh+adminTable(items,['Título','Semana','Temas','Coach','Grupo','Archivos'],function(c){
    var topics=(c.topics||[]).map(function(t){return esc(t)}).join('<br>');
    return '<td>'+esc(c.title)+'</td><td>Semana '+c.week+'</td><td><div class="cell-preview" onclick="viewCurriculum(\''+c.id+'\')" title="Ver todos los temas">'+topics+'</div></td><td>'+esc(c.coach||'')+'</td><td>'+groupName(c.group_id)+'</td><td>'+(c.image_url?'<a href="'+esc(c.image_url)+'" target="_blank" title="Ver imagen">'+ic('image',14)+'</a> ':'')+(c.attachment_url?'<a href="'+esc(c.attachment_url)+'" target="_blank" title="Descargar '+esc(c.attachment_name||'archivo')+'">'+ic('paperclip',14)+'</a>':'')+'</td><td><div class="has-glow admin-actions"><button onclick="curriculumForm(\''+c.id+'\')">'+ic('pencil',14)+'</button><button class="del" onclick="delCurriculum(\''+c.id+'\')">'+ic('trash-2',14)+'</button></div></td>'},'No hay plan de estudio',btn);
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
  saveData(DATA);closeModal();if(_inAcademyTab)renderAcademyContent();else renderCurriculum();updateCounts();toast(id?'Tema actualizado':'Tema creado');
}
function delCurriculum(id){if(!confirmDel())return;DATA.curriculum=DATA.curriculum.filter(function(c){return c.id!==id});saveData(DATA);if(_inAcademyTab)renderAcademyContent();else renderCurriculum();updateCounts();toast('Tema eliminado');}
function viewCurriculum(id){
  var c=(DATA.curriculum||[]).find(function(x){return x.id===id});
  if(!c)return;
  openModal('<button class="modal-close" onclick="closeModal()">'+ic('x',16)+'</button><h3>'+esc(c.title)+'</h3><div style="color:#888;font-size:13px;line-height:1.8;white-space:pre-wrap;max-height:70vh;overflow-y:auto;padding-right:8px">'+(c.topics||[]).map(function(t){return esc(t)}).join('<br>')+'</div>');
}

// ========== CRUD: MATERIALS ==========
function renderMaterials(cId){cId=cId||'adminContent';
  var gid=(document.getElementById('adminGF')&&document.getElementById('adminGF').value)||'';
  var items=filterByCurrentCoach(DATA.materials||[]);
  if(gid)items=items.filter(function(i){return i.group_id===gid});
  var fh=adminGroupFilterHTML(gid,'renderMaterials()');
  var btn='<button class="btn-primary" onclick="materialForm(null)" style="margin-bottom:14px;font-size:13px">'+ic('plus',14)+' Nuevo Material</button>';
  document.getElementById(cId).innerHTML=fh+adminTable(items,['Título','Tipo','Coach','Grupo','Archivos'],function(m){
    return '<td>'+esc(m.title)+'</td><td><span class="badge badge-purple">'+esc(m.type)+'</span></td><td>'+esc(m.coach||'')+'</td><td>'+groupName(m.group_id)+'</td><td>'+(m.image_url?'<a href="'+esc(m.image_url)+'" target="_blank" title="Ver imagen">'+ic('image',14)+'</a> ':'')+(m.attachment_url?'<a href="'+esc(m.attachment_url)+'" target="_blank" title="Descargar '+esc(m.attachment_name||'archivo')+'">'+ic('paperclip',14)+'</a>':'')+'</td><td><div class="has-glow admin-actions"><button onclick="materialForm(\''+m.id+'\')">'+ic('pencil',14)+'</button><button class="del" onclick="delMaterial(\''+m.id+'\')">'+ic('trash-2',14)+'</button></div></td>'},'No hay materiales',btn);
}
function materialForm(id){
  var item=id?(DATA.materials||[]).find(function(m){return m.id===id}):null;
  var f=item||{schedule_id:'',title:'',description:'',url:'',type:'video',group_id:'',coach:dc(),image_url:'',attachment_url:'',attachment_name:''};
  var classes=(DATA.schedule||[]).filter(function(s){return s.type==='academia'});
  openModal('<button class="modal-close" onclick="closeModal()">'+ic('x',16)+'</button><h3>'+(item?'Editar':'Nuevo')+' Material</h3>'+
    '<div class="field"><label>Clase</label><select class="input-field" id="mf_schedule_id">'+    (classes.length?classes.map(function(c){var days=['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];return'<option value="'+c.id+'" '+(c.id===f.schedule_id?'selected':'')+'>'+esc(c.title)+' ('+days[c.day]+')</option>'}).join(''):'<option value="">Sin clases de academia</option>')+'</select></div>'+
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
  saveData(DATA);closeModal();if(_inAcademyTab)renderAcademyContent();else renderMaterials();updateCounts();toast(id?'Material actualizado':'Material creado');
}
function delMaterial(id){if(!confirmDel())return;DATA.materials=DATA.materials.filter(function(m){return m.id!==id});saveData(DATA);if(_inAcademyTab)renderAcademyContent();else renderMaterials();updateCounts();toast('Material eliminado');}

// ========== CRUD: TASKS ==========
function renderTasks(cId){cId=cId||'adminContent';
  var gid=(document.getElementById('adminGF')&&document.getElementById('adminGF').value)||'';
  var items=filterByCurrentCoach(DATA.tasks||[]);
  if(gid)items=items.filter(function(i){return i.group_id===gid});
  var fh=adminGroupFilterHTML(gid,'renderTasks()');
  var btn='<button class="btn-primary" onclick="taskForm(null)" style="margin-bottom:14px;font-size:13px">'+ic('plus',14)+' Nueva Tarea</button>';
  var h=fh+adminTable(items,['Título','Tipo','Vence','Coach','Grupo','Archivos'],function(t){
    return '<td>'+esc(t.title)+'</td><td><span class="badge badge-blue">'+esc(t.type)+'</span></td><td>'+esc(t.due_date||'-')+'</td><td>'+esc(t.coach||'')+'</td><td>'+groupName(t.group_id)+'</td><td>'+(t.image_url?'<a href="'+esc(t.image_url)+'" target="_blank" title="Ver imagen">'+ic('image',14)+'</a> ':'')+(t.attachment_url?'<a href="'+esc(t.attachment_url)+'" target="_blank" title="Descargar '+esc(t.attachment_name||'archivo')+'">'+ic('paperclip',14)+'</a>':'')+'</td><td><div class="has-glow admin-actions"><button onclick="showTaskCompletions(\''+t.id+'\')" title="Ver completados">'+ic('eye',14)+'</button><button onclick="taskForm(\''+t.id+'\')">'+ic('pencil',14)+'</button><button class="del" onclick="delTask(\''+t.id+'\')">'+ic('trash-2',14)+'</button></div></td>'},'No hay tareas',btn);
  var tc=DATA.task_completions||[];
  var grouped={};tc.forEach(function(c){if(!grouped[c.task_id])grouped[c.task_id]=[];grouped[c.task_id].push(c)});
  if(Object.keys(grouped).length){h+='<div class="glass-card" style="padding:20px;margin-top:20px"><h3 style="font-family:var(--font-display);font-size:15px;margin-bottom:14px">'+ic('check-circle',16)+' Completaciones por tarea</h3>';
    Object.keys(grouped).forEach(function(tid){
      var task=(DATA.tasks||[]).find(function(t){return t.id===tid});
      h+='<div class="has-glow" style="margin-bottom:16px;padding:16px;background:rgba(255,255,255,0.02);border-radius:8px"><strong style="font-size:14px">'+esc(task?task.title:'(eliminada)')+'</strong><div style="display:grid;gap:8px;margin-top:12px">';
      grouped[tid].forEach(function(c){h+='<div style="display:flex;justify-content:space-between;font-size:13px;color:#bbb;padding:6px 0"><span>'+esc(c.member_name)+'</span><span style="color:#666">'+(c.completed_at?new Date(c.completed_at).toLocaleString('es-ES'):'-')+'</span></div>'});
      h+='</div></div>';
    });
    h+='</div>';
  }
  document.getElementById(cId).innerHTML=h;
}
function taskForm(id){
  var item=id?(DATA.tasks||[]).find(function(t){return t.id===id}):null;
  var f=item||{title:'',description:'',type:'vod',due_date:'',group_id:'',coach:dc(),image_url:'',attachment_url:'',attachment_name:''};
  openModal('<button class="modal-close" onclick="closeModal()">'+ic('x',16)+'</button><h3>'+(item?'Editar':'Nueva')+' Tarea</h3>'+
    '<div class="field"><label>Título</label><input class="input-field" id="tf_title" value="'+esc(f.title)+'"></div>'+
    '<div class="field"><label>Descripción</label><textarea class="input-field" id="tf_description" rows="3">'+esc(f.description||'')+'</textarea></div>'+
    '<div class="field"><label>Tipo</label><select class="input-field" id="tf_type"><option value="vod" '+(f.type==='vod'?'selected':'')+'>VOD</option><option value="aim" '+(f.type==='aim'?'selected':'')+'>Aim</option><option value="game" '+(f.type==='game'?'selected':'')+'>Game</option><option value="other" '+(f.type==='other'?'selected':'')+'>Otro</option></select></div>'+
    '<div class="field"><label>Fecha límite</label><input type="date" class="input-field" id="tf_due_date" value="'+f.due_date+'"></div>'+
    '<div class="field" style="display:none"><label>Grupo</label><select class="input-field" id="tf_group" onchange="reloadCoachDropdown(\'tf_coach\',this.value)"><option value="">General (Ambos)</option>'+(DATA.groups||[]).map(function(g){return'<option value="'+g.id+'"'+(f.group_id===g.id?' selected':'')+'>'+esc(g.name)+'</option>'}).join('')+'</select></div>'+
    '<div class="field" id="tf_coach_wrap"><label>Coach asignado</label><select class="input-field" id="tf_coach" onchange="setGroupFromCoach(\'tf_group\',\'tf_coach\')"><option value="">Sin coach</option>'+coachOptions(f.coach||'',f.group_id)+'</select></div>'+
    '<hr>'+
    '<div class="field"><label>Imagen</label>'+fileUploadHTML('Imagen','image/*','tf_img_status','tf_image_url',f.image_url||'')+(f.image_url?mediaPreview(f.image_url):'')+'</div>'+
    '<div class="field"><label>Archivo adjunto (PDF)</label>'+fileUploadHTML('PDF','.pdf,application/pdf','tf_doc_status','tf_attachment_url',f.attachment_url||'')+'<input class="input-field" id="tf_attachment_name" placeholder="Nombre del archivo" value="'+esc(f.attachment_name||'')+'"></div>'+
    '<button class="btn-primary" onclick="saveTask(\''+(id||'')+'\')" style="width:100%;justify-content:center">'+ic('save',16)+' Guardar</button>');
}
function saveTask(id){
  var obj={title:document.getElementById('tf_title').value,description:document.getElementById('tf_description').value,type:document.getElementById('tf_type').value,due_date:document.getElementById('tf_due_date').value,group_id:document.getElementById('tf_group').value,coach:document.getElementById('tf_coach')?.value||'',image_url:document.getElementById('tf_image_url').value,attachment_url:document.getElementById('tf_attachment_url').value,attachment_name:document.getElementById('tf_attachment_name').value};
  if(!DATA.tasks)DATA.tasks=[];
  if(id){var idx=DATA.tasks.findIndex(function(t){return t.id===id});if(idx>=0)DATA.tasks[idx]={...DATA.tasks[idx],...obj}}else{obj.id=uid();DATA.tasks.push(obj)}
  saveData(DATA);closeModal();if(_inAcademyTab)renderAcademyContent();else renderTasks();updateCounts();toast(id?'Tarea actualizada':'Tarea creada');
}
function delTask(id){if(!confirmDel())return;DATA.tasks=DATA.tasks.filter(function(t){return t.id!==id});saveData(DATA);if(_inAcademyTab)renderAcademyContent();else renderTasks();updateCounts();toast('Tarea eliminada');}
async function showTaskCompletions(taskId){
  var task=(DATA.tasks||[]).find(function(t){return t.id===taskId});
  if(!task){toast('Tarea no encontrada','err');return}
  try{if(db&&db.from){var r=await db.from('task_completions').select('*');if(r.data)DATA.task_completions=r.data}}catch(e){}
  var members=DATA.members||[];
  var gid=task.group_id;
  if(gid)members=members.filter(function(m){return (m.group_id&&m.group_id.trim()===gid)||(!m.group_id&&getGroupFromRank(m.rank)===gid)});
  var tcs=DATA.task_completions||[];
  var html='<button class="modal-close" onclick="closeModal()">'+ic('x',16)+'</button><h3>'+ic('check-circle',18)+' Completados: '+esc(task.title)+'</h3>'+
    '<div style="margin-top:16px;display:grid;gap:6px;max-height:400px;overflow-y:auto">';
  if(!members.length){
    html+='<div style="text-align:center;padding:24px;color:#555">No hay miembros registrados</div>';
  }else{
    members.forEach(function(m){
      var done=tcs.some(function(tc){return tc.task_id===taskId&&tc.member_name===m.name});
      html+='<div class="has-glow" style="display:flex;justify-content:space-between;align-items:center;padding:8px 14px;background:rgba(255,255,255,0.02);border-radius:8px">'+
        '<span>'+esc(m.name)+'</span>'+
        '<span style="color:'+(done?'#8b5cf6':'#8b5cf6')+'">'+(done?ic('check-circle',14)+' Completado':ic('x-circle',14)+' Pendiente')+'</span></div>';
    });
  }
  html+='</div>';
  openModal(html);
  if(typeof lucide!=='undefined')lucide.createIcons();
}

// ========== CRUD: SUBSTITUTIONS ==========
function renderSubstitutions(){
  var gid=(document.getElementById('adminGF')&&document.getElementById('adminGF').value)||'';
  var items=filterByCurrentCoach(DATA.substitutions||[]);
  if(gid)items=items.filter(function(i){return i.group_id===gid});
  var fh=adminGroupFilterHTML(gid,'renderSubstitutions()');
  var btn='<button class="btn-primary" onclick="subForm(null)" style="margin-bottom:14px;font-size:13px">'+ic('plus',14)+' Nueva Sustitución</button>';
  document.getElementById('adminContent').innerHTML=fh+adminTable(items,['Solicitante','Rol','Estado','Cupo','Coach','Grupo'],function(s){
    var badges={open:'badge-yellow',fulfilled:'badge-green',cancelled:'badge-red'};
    return '<td>'+esc(s.requesting_member)+'</td><td>'+esc(s.needed_role)+'</td><td><span class="badge '+(badges[s.status]||'badge-gray')+'">'+esc(s.status)+'</span></td><td>'+esc(s.filled_by||'-')+'</td><td>'+esc(s.coach||'-')+'</td><td>'+groupName(s.group_id)+'</td><td><div class="has-glow admin-actions">'+
      (s.status==='open'?'<button onclick="fulfillSub(\''+s.id+'\')" title="Marcar como cumplida">'+ic('check',14)+'</button><button onclick="cancelSub(\''+s.id+'\')" title="Cancelar">'+ic('x',14)+'</button>':'')+
      '<button onclick="subForm(\''+s.id+'\')">'+ic('pencil',14)+'</button><button class="del" onclick="delSub(\''+s.id+'\')">'+ic('trash-2',14)+'</button></div></td>'},'No hay sustituciones',btn);
}
function subForm(id){
  var item=id?(DATA.substitutions||[]).find(function(s){return s.id===id}):null;
  var f=item||{schedule_id:'',requesting_member:'',needed_role:'',status:'open',filled_by:'',coach:dc(),group_id:''};
  openModal('<button class="modal-close" onclick="closeModal()">'+ic('x',16)+'</button><h3>'+(item?'Editar':'Nueva')+' Sustitución</h3>'+
    '<div class="field"><label>Horario</label><select class="input-field" id="sf_schedule_id">'+    (DATA.schedule||[]).map(function(s){var days=['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];return'<option value="'+s.id+'" '+(s.id===f.schedule_id?'selected':'')+'>'+esc(s.title)+' ('+days[s.day]+' '+toLocalTime(s.start,s.tz)+')</option>'}).join('')+'</select></div>'+
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
  saveData(DATA);closeModal();renderSubstitutions();updateCounts();toast(id?'Sustitución actualizada':'Sustitución creada');
}
function delSub(id){if(!confirmDel())return;DATA.substitutions=DATA.substitutions.filter(function(s){return s.id!==id});saveData(DATA);renderSubstitutions();updateCounts();toast('Sustitución eliminada');}
function fulfillSub(id){
  if(!confirmDel('¿Marcar esta sustitución como cumplida?'))return;
  if(!DATA.substitutions)DATA.substitutions=[];
  var idx=DATA.substitutions.findIndex(function(s){return s.id===id});
  if(idx>=0){DATA.substitutions[idx].status='fulfilled';saveData(DATA);renderSubstitutions();updateCounts();toast('Sustitución marcada como cumplida')}
}
function cancelSub(id){
  if(!confirmDel('¿Cancelar esta sustitución?'))return;
  if(!DATA.substitutions)DATA.substitutions=[];
  var idx=DATA.substitutions.findIndex(function(s){return s.id===id});
  if(idx>=0){DATA.substitutions[idx].status='cancelled';saveData(DATA);renderSubstitutions();updateCounts();toast('Sustitución cancelada')}
}

// ========== CRUD: ACHIEVEMENTS ==========
function renderAchievements(){
  var items=DATA.achievements||[];
  var memberCounts={};(DATA.member_achievements||[]).forEach(function(ma){memberCounts[ma.achievement_id]=(memberCounts[ma.achievement_id]||0)+1});
  var btn='<div style="display:flex;gap:10px;margin-bottom:14px"><button class="btn-primary" onclick="achievementForm(null)" style="font-size:13px">'+ic('plus',14)+' Nuevo Logro</button>'+
    '<button class="btn-primary" onclick="assignAchievementForm()" style="font-size:13px">'+ic('user-plus',14)+' Asignar a miembro</button></div>';
  document.getElementById('adminContent').innerHTML=adminTable(items,['Nombre','Icono','Miembros'],function(a){
    var cnt=memberCounts[a.id]||0;
    var members=(DATA.member_achievements||[]).filter(function(ma){return ma.achievement_id===a.id}).map(function(ma){
      return '<span style="display:inline-flex;align-items:center;gap:2px;margin-right:6px">'+esc(ma.member_name)+' <button onclick="removeAchievement(\''+ma.id+'\')" style="background:none;border:none;color:#8b5cf6;cursor:pointer;padding:0;font-size:12px;line-height:1;vertical-align:middle" title="Quitar">'+ic('x',10)+'</button></span>';
    }).join('');
    return '<td>'+esc(a.name)+'</td><td>'+ic(a.icon||'trophy',16)+'</td><td>'+(cnt?'<span class="badge badge-purple">'+cnt+'</span> ':'<span class="badge badge-gray">0</span> ')+'<span style="color:#888;font-size:12px">'+members+'</span></td><td><div class="has-glow admin-actions"><button onclick="achievementForm(\''+a.id+'\')">'+ic('pencil',14)+'</button><button class="del" onclick="delAchievement(\''+a.id+'\')">'+ic('trash-2',14)+'</button></div></td>'},'No hay logros',btn);
}
function achievementForm(id){
  var item=id?(DATA.achievements||[]).find(function(a){return a.id===id}):null;
  var f=item||{name:'',description:'',icon:'trophy'};
  openModal('<button class="modal-close" onclick="closeModal()">'+ic('x',16)+'</button><h3>'+(item?'Editar':'Nuevo')+' Logro</h3>'+
    '<div class="field"><label>Nombre</label><input class="input-field" id="achf_name" value="'+esc(f.name)+'"></div>'+
    '<div class="field"><label>Descripción</label><textarea class="input-field" id="achf_description" rows="3">'+esc(f.description||'')+'</textarea></div>'+
    '<div class="field"><label>Icono (nombre Lucide)</label><input class="input-field" id="achf_icon" value="'+esc(f.icon)+'"></div>'+
    '<button class="btn-primary" onclick="saveAchievement(\''+(id||'')+'\')" style="width:100%;justify-content:center">'+ic('save',16)+' Guardar</button>');
}
function saveAchievement(id){
  var obj={name:document.getElementById('achf_name').value,description:document.getElementById('achf_description').value,icon:document.getElementById('achf_icon').value};
  if(!DATA.achievements)DATA.achievements=[];
  if(id){var idx=DATA.achievements.findIndex(function(a){return a.id===id});if(idx>=0)DATA.achievements[idx]={...DATA.achievements[idx],...obj}}else{obj.id=uid();DATA.achievements.push(obj)}
  saveData(DATA);closeModal();renderAchievements();updateCounts();toast(id?'Logro actualizado':'Logro creado');
}
function delAchievement(id){if(!confirmDel())return;DATA.achievements=DATA.achievements.filter(function(a){return a.id!==id});saveData(DATA);renderAchievements();updateCounts();toast('Logro eliminado');}
function assignAchievementForm(){
  openModal('<button class="modal-close" onclick="closeModal()">'+ic('x',16)+'</button><h3>Asignar Logro</h3>'+
    '<div class="field"><label>Miembro</label><select class="input-field" id="aaf_member">'+(DATA.members||[]).map(function(m){return'<option value="'+esc(m.name)+'">'+esc(m.name)+'</option>'}).join('')+'</select></div>'+
    '<div class="field"><label>Logro</label><select class="input-field" id="aaf_achievement">'+(DATA.achievements||[]).map(function(a){return'<option value="'+a.id+'">'+esc(a.name)+'</option>'}).join('')+'</select></div>'+
    '<button class="btn-primary" onclick="assignAchievement()" style="width:100%;justify-content:center">'+ic('check',16)+' Asignar</button>');
}
function assignAchievement(){
  var member_name=document.getElementById('aaf_member').value;
  var achievement_id=document.getElementById('aaf_achievement').value;
  if(!DATA.member_achievements)DATA.member_achievements=[];
  if(DATA.member_achievements.some(function(ma){return ma.member_name===member_name&&ma.achievement_id===achievement_id})){toast('El miembro ya tiene este logro','err');return}
   DATA.member_achievements.push({id:uid(),member_name:member_name,achievement_id:achievement_id,awarded_at:new Date().toISOString()});
  saveData(DATA);closeModal();renderAchievements();updateCounts();toast('Logro asignado');
}
function removeAchievement(id){
  if(!confirmDel())return;
  DATA.member_achievements=DATA.member_achievements.filter(function(ma){return ma.id!==id});
  saveData(DATA);renderAchievements();updateCounts();toast('Asignación eliminada');
}

// ========== CRUD: QUIZZES ==========
function renderQuizzes(cId){cId=cId||'adminContent';
  var gid=(document.getElementById('adminGF')&&document.getElementById('adminGF').value)||'';
  var items=filterByCurrentCoach(DATA.quizzes||[]);
  if(gid)items=items.filter(function(i){return i.group_id===gid});
  var fh=adminGroupFilterHTML(gid,'renderQuizzes()');
  var btn='<button class="btn-primary" onclick="quizForm(null)" style="margin-bottom:14px;font-size:13px">'+ic('plus',14)+' Nuevo Quiz</button>';
  document.getElementById(cId).innerHTML=fh+adminTable(items,['Título','Preguntas','Coach','Grupo'],function(q){
    return '<td>'+esc(q.title)+'</td><td>'+(q.questions||[]).length+'</td><td>'+esc(q.coach||'')+'</td><td>'+groupName(q.group_id)+'</td><td><div class="has-glow admin-actions"><button onclick="quizForm(\''+q.id+'\')">'+ic('pencil',14)+'</button><button class="del" onclick="delQuiz(\''+q.id+'\')">'+ic('trash-2',14)+'</button></div></td>'},'No hay quizzes',btn);
}
function quizForm(id){
  var item=id?(DATA.quizzes||[]).find(function(q){return q.id===id}):null;
  var f=item||{title:'',description:'',group_id:'',coach:dc(),questions:[{text:'',options:['','','',''],correct:0,explanation:''}]};
  if(item&&item.questions&&item.questions.length>0){
    var maxQ=item.questions.reduce(function(m,q){var n=parseInt((q.id||'').replace('q_','')||'0',10);return n>m?n:m},0);
    _quizQCounter=maxQ+1;
  }else{_quizQCounter=0}
  var qhtml='<div id="quizQs">'+(f.questions||[{text:'',options:['','','',''],correct:0,explanation:''}]).map(function(q,i){return quizQHTML(q,i)}).join('')+'</div>';
  openModal('<button class="modal-close" onclick="closeModal()">'+ic('x',16)+'</button><h3>'+(item?'Editar':'Nuevo')+' Quiz</h3>'+
    '<div class="field"><label>Título</label><input class="input-field" id="qf_title" value="'+esc(f.title)+'"></div>'+
    '<div class="field"><label>Descripción</label><textarea class="input-field" id="qf_description" rows="2">'+esc(f.description||'')+'</textarea></div>'+
    '<div class="field" style="display:none"><label>Grupo</label><select class="input-field" id="qf_group" onchange="reloadCoachDropdown(\'qf_coach\',this.value)"><option value="">General</option>'+(DATA.groups||[]).map(function(g){return'<option value="'+g.id+'"'+(f.group_id===g.id?' selected':'')+'>'+esc(g.name)+'</option>'}).join('')+'</select></div>'+
    '<div class="field"><label>Coach asignado</label><select class="input-field" id="qf_coach" onchange="setGroupFromCoach(\'qf_group\',\'qf_coach\')"><option value="">Sin coach</option>'+coachOptions(f.coach||'',f.group_id)+'</select></div>'+
    '<hr>'+qhtml+
    '<button class="btn-secondary" onclick="addQuizQ()" style="width:100%;justify-content:center;margin-top:8px">'+ic('plus',14)+' Agregar Pregunta</button>'+
    '<button class="btn-primary" onclick="saveQuiz(\''+(id||'')+'\')" style="width:100%;justify-content:center;margin-top:12px">'+ic('save',16)+' Guardar Quiz</button>');
}
function saveQuiz(id){
  var qs=[];
  var qEls=document.querySelectorAll('[id^=q_]');
  qEls.forEach(function(el){
    var i=el.id.replace('q_','');
    var text=document.getElementById('qf_q_'+i+'_text')?.value;
    if(!text)return;
    var opts=[];
    for(var j=0;j<4;j++)opts.push(document.getElementById('qf_q_'+i+'_opt_'+j)?.value||'');
    var correct=parseInt(document.querySelector('input[name="qf_correct_'+i+'"]:checked')?.value||'0');
    var exp=document.getElementById('qf_q_'+i+'_exp')?.value||'';
    qs.push({text:text,options:opts,correct:correct,explanation:exp});
  });
  if(!qs.length){toast('Agrega al menos una pregunta','err');return}
  var obj={title:document.getElementById('qf_title').value,description:document.getElementById('qf_description').value,group_id:document.getElementById('qf_group').value,coach:document.getElementById('qf_coach')?.value||'',questions:qs};
  if(!DATA.quizzes)DATA.quizzes=[];
  if(id){var idx=DATA.quizzes.findIndex(function(q){return q.id===id});if(idx>=0)DATA.quizzes[idx]={...DATA.quizzes[idx],...obj}}else{obj.id=uid();DATA.quizzes.push(obj)}
  saveData(DATA);closeModal();if(_inAcademyTab)renderAcademyContent();else renderQuizzes();updateCounts();toast(id?'Quiz actualizado':'Quiz creado');
}
function quizQHTML(q,i){
  var opts=q.options||['','','',''];
  return '<div class="glass-card" style="padding:14px;margin-bottom:10px" id="q_'+i+'">'+
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">'+
      '<strong style="font-size:14px">Pregunta '+(i+1)+'</strong>'+
      '<button class="btn-sm cancel" onclick="removeQuizQ('+i+')" style="font-size:11px">'+ic('x',12)+'</button></div>'+
    '<div class="field"><input class="input-field" id="qf_q_'+i+'_text" placeholder="Texto de la pregunta" value="'+esc(q.text)+'"></div>'+
    '<div style="display:grid;gap:6px">'+
    opts.map(function(o,j){return'<label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer">'+
      '<input type="radio" name="qf_correct_'+i+'" value="'+j+'" '+(q.correct===j?'checked':'')+'>'+
      '<input class="input-field" id="qf_q_'+i+'_opt_'+j+'" placeholder="Opción '+(j+1)+'" value="'+esc(o)+'" style="flex:1;padding:8px 12px;font-size:13px">'+
      '<span style="color:#666;font-size:11px">'+(q.correct===j?'? Correcta':'')+'</span></label>'}).join('')+'</div>'+
    '<div class="field" style="margin-top:6px"><input class="input-field" id="qf_q_'+i+'_exp" placeholder="Explicación (opcional)" value="'+esc(q.explanation||'')+'" style="padding:8px 12px;font-size:12px"></div></div>';
}
function addQuizQ(){
  var n=_quizQCounter++;
  document.getElementById('quizQs').insertAdjacentHTML('beforeend',quizQHTML({text:'',options:['','','',''],correct:0,explanation:''},n));
}
function removeQuizQ(i){
  var el=document.getElementById('q_'+i);
  if(el)el.remove();
}
function delQuiz(id){if(!confirmDel())return;DATA.quizzes=DATA.quizzes.filter(function(q){return q.id!==id});saveData(DATA);if(_inAcademyTab)renderAcademyContent();else renderQuizzes();updateCounts();toast('Quiz eliminado');}

// ========== CRUD: SCHEDULE (con grupo) ==========
function renderSchedule(){
  var gid=document.getElementById('sf_filterGroup')?document.getElementById('sf_filterGroup').value:'';
  var items=filterByCurrentCoach(DATA.schedule||[]);
  if(gid)items=items.filter(function(s){return s.group_id===gid});
  var btn='<button class="btn-primary" onclick="schedForm(null)" style="margin-bottom:14px;font-size:13px">'+ic('plus',14)+' Nuevo Horario</button>';
  var days=['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
  var filter='<div style="margin-bottom:14px;display:flex;gap:12px;align-items:center;flex-wrap:wrap">'+
    '<label style="font-size:13px;color:#888">Filtrar por grupo:</label>'+
    '<select class="input-field" id="sf_filterGroup" onchange="renderSchedule()" style="width:auto;min-width:140px;padding:6px 10px;font-size:13px">'+
    '<option value="">Todos</option>'+(DATA.groups||[]).map(function(g){return'<option value="'+g.id+'" '+(gid===g.id?'selected':'')+'>'+esc(g.name)+'</option>'}).join('')+'</select></div>';
  document.getElementById('adminContent').innerHTML=filter+adminTable(items,['Título','Tipo','Día','Horario','Coach','Grupo'],function(s){
    return '<td>'+esc(s.title)+'</td><td>'+esc(s.type)+'</td><td>'+days[s.day]+'</td><td>'+esc(toLocalTime(s.start,s.tz))+' - '+esc(toLocalTime(s.end,s.tz))+'</td><td>'+esc(s.coach||'-')+'</td><td>'+groupName(s.group_id)+'</td>'+
      '<td><div class="has-glow admin-actions">'+
        '<button onclick="schedForm(\''+s.id+'\')" title="Editar">'+ic('pencil',14)+'</button>'+
        '<button class="del" onclick="delSched(\''+s.id+'\')" title="Eliminar">'+ic('trash-2',14)+'</button>'+
      '</div></td>'
  },'No hay horarios',btn);
}
function schedForm(id){
  var item=id?DATA.schedule.find(function(s){return s.id===id}):null;
  var f=item||{title:'',day:0,start:'18:00',end:'20:00',type:'entrenamiento',group_id:'',coach:dc()};
  var days=['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
  openModal('<button class="modal-close" onclick="closeModal()">'+ic('x',16)+'</button><h3>'+(item?'Editar':'Nuevo')+' Horario</h3>'+
    '<div class="field"><label>Título</label><input class="input-field" id="sf_title" value="'+esc(f.title)+'"></div>'+
    '<div class="grid-2"><div class="field"><label>Día</label><select class="input-field" id="sf_day">'+days.map(function(d,i){return'<option value="'+i+'" '+(i===f.day?'selected':'')+'>'+d+'</option>'}).join('')+'</select></div>'+
    '<div class="field"><label>Tipo</label><select class="input-field" id="sf_type"><option value="entrenamiento" '+(f.type==='entrenamiento'?'selected':'')+'>Entrenamiento</option><option value="academia" '+(f.type==='academia'?'selected':'')+'>Academia</option><option value="scrim" '+(f.type==='scrim'?'selected':'')+'>Scrim</option><option value="premier" '+(f.type==='premier'?'selected':'')+'>Premier</option></select></div></div>'+
    '<div class="grid-2"><div class="field"><label>Hora inicio</label><input type="time" class="input-field" id="sf_start" value="'+f.start+'"></div>'+
    '<div class="field"><label>Hora fin</label><input type="time" class="input-field" id="sf_end" value="'+f.end+'"></div></div>'+
    '<div class="field"><label>Grupo</label><select class="input-field" id="sf_group" onchange="reloadCoachDropdown(\'sf_coach\',this.value)"><option value="">General</option>'+(DATA.groups||[]).map(function(g){return'<option value="'+g.id+'" '+(f.group_id===g.id?'selected':'')+'>'+esc(g.name)+'</option>'}).join('')+'</select></div>'+
    '<div class="field"><label>Coach</label><select class="input-field" id="sf_coach" onchange="setGroupFromCoach(\'sf_group\',\'sf_coach\')"><option value="">Sin coach</option>'+coachOptions(f.coach||'',f.group_id)+'</select></div>'+
    '<button class="btn-primary" onclick="saveSched(\''+(id||'')+'\')" style="width:100%;justify-content:center">'+ic('save',16)+' Guardar</button>');
}
function saveSched(id){
  var obj={title:document.getElementById('sf_title').value,day:parseInt(document.getElementById('sf_day').value),start:document.getElementById('sf_start').value,end:document.getElementById('sf_end').value,type:document.getElementById('sf_type').value,group_id:document.getElementById('sf_group').value,coach:document.getElementById('sf_coach')?.value||'',tz:detectTZ()};
  if(id){var idx=DATA.schedule.findIndex(function(s){return s.id===id});if(idx>=0)DATA.schedule[idx]={...DATA.schedule[idx],...obj}}else{obj.id=uid();DATA.schedule.push(obj)}
  saveData(DATA);closeModal();renderSchedule();updateCounts();toast(id?'Horario actualizado':'Horario creado');
}
function delSched(id){if(!confirmDel())return;DATA.schedule=DATA.schedule.filter(function(s){return s.id!==id});saveData(DATA);renderSchedule();updateCounts();toast('Horario eliminado');}
