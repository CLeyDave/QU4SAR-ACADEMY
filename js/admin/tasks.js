// ========== ADMIN TASKS ==========

function renderSection_tasks(){
  var gid=(document.getElementById('adminGF')&&document.getElementById('adminGF').value)||'';
  var items=filterByCurrentCoach(DATA.tasks||[]);
  if(gid)items=items.filter(function(i){return i.group_id===gid});
  var fh=adminGroupFilterHTML(gid,'renderSection_tasks()');
  var btn='<button class="btn-primary" onclick="taskForm(null)" style="margin-bottom:14px;font-size:13px">'+ic('plus',14)+' Nueva Tarea</button>';
  var h=fh+adminTable(items,['Título','Tipo','Vence','Coach','Grupo','Archivos'],function(t){
    return '<td>'+esc(t.title)+'</td><td><span class="badge badge-blue">'+esc(t.type)+'</span></td><td>'+esc(t.due_date||'-')+'</td><td>'+esc(t.coach||'—')+'</td><td>'+groupName(t.group_id)+'</td><td>'+(t.image_url?'<a href="'+esc(t.image_url)+'" target="_blank" title="Ver imagen">'+ic('image',14)+'</a> ':'')+(t.attachment_url?'<a href="'+esc(t.attachment_url)+'" target="_blank" title="Descargar '+esc(t.attachment_name||'archivo')+'">'+ic('paperclip',14)+'</a>':'')+'</td><td><div class="has-glow admin-actions"><button onclick="showTaskCompletions(\''+t.id+'\')" title="Ver completados">'+ic('eye',14)+'</button><button onclick="taskForm(\''+t.id+'\')">'+ic('pencil',14)+'</button><button class="del" onclick="delTask(\''+t.id+'\')">'+ic('trash-2',14)+'</button></div></td>'},'No hay tareas',btn);
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
  document.getElementById('adminContent').innerHTML=h;
}

function taskForm(id){
  var item=id?(DATA.tasks||[]).find(function(t){return t.id===id}):null;
  var f=item||{title:'',description:'',type:'vod',due_date:'',group_id:'',coach:dc(),image_url:'',attachment_url:'',attachment_name:''};
  openModal('<button class="modal-close" onclick="closeModal()">'+ic('x',16)+'</button><h3>'+(item?'Editar':'Nueva')+' Tarea</h3>'+
    '<div class="field"><label for="tf_title">Título</label><input class="input-field" id="tf_title" value="'+esc(f.title)+'"></div>'+
    '<div class="field"><label for="tf_description">Descripción</label><textarea class="input-field" id="tf_description" rows="3">'+esc(f.description||'')+'</textarea></div>'+
    '<div class="field"><label for="tf_type">Tipo</label><select class="input-field" id="tf_type"><option value="vod" '+(f.type==='vod'?'selected':'')+'>VOD</option><option value="aim" '+(f.type==='aim'?'selected':'')+'>Aim</option><option value="game" '+(f.type==='game'?'selected':'')+'>Game</option><option value="other" '+(f.type==='other'?'selected':'')+'>Otro</option></select></div>'+
    '<div class="field"><label for="tf_due_date">Fecha límite</label><input type="date" class="input-field" id="tf_due_date" value="'+f.due_date+'"></div>'+
    '<div class="field" style="display:none"><label for="tf_group">Grupo</label><select class="input-field" id="tf_group" onchange="reloadCoachDropdown(\'tf_coach\',this.value)"><option value="">General (Ambos)</option>'+(DATA.groups||[]).map(function(g){return'<option value="'+g.id+'"'+(f.group_id===g.id?' selected':'')+'>'+esc(g.name)+'</option>'}).join('')+'</select></div>'+
    '<div class="field"><label for="tf_coach">Coach asignado</label><select class="input-field" id="tf_coach" onchange="setGroupFromCoach(\'tf_group\',\'tf_coach\')"><option value="">Sin coach</option>'+coachOptions(f.coach||'',f.group_id)+'</select></div>'+
    '<hr>'+
    '<div class="field"><label>Imagen</label>'+fileUploadHTML('Imagen','image/*','tf_img_status','tf_image_url',f.image_url||'')+(f.image_url?mediaPreview(f.image_url):'')+'</div>'+
    '<div class="field"><label>Archivo adjunto (PDF)</label>'+fileUploadHTML('PDF','.pdf,application/pdf','tf_doc_status','tf_attachment_url',f.attachment_url||'')+'<input class="input-field" id="tf_attachment_name" placeholder="Nombre del archivo" value="'+esc(f.attachment_name||'')+'"></div>'+
    '<button class="btn-primary" onclick="saveTask(\''+(id||'')+'\')" style="width:100%;justify-content:center">'+ic('save',16)+' Guardar</button>');
}

function saveTask(id){
  var obj={title:document.getElementById('tf_title').value,description:document.getElementById('tf_description').value,type:document.getElementById('tf_type').value,due_date:document.getElementById('tf_due_date').value,group_id:document.getElementById('tf_group').value,coach:document.getElementById('tf_coach')?.value||'',image_url:document.getElementById('tf_image_url').value,attachment_url:document.getElementById('tf_attachment_url').value,attachment_name:document.getElementById('tf_attachment_name').value};
  if(!DATA.tasks)DATA.tasks=[];
  if(id){var idx=DATA.tasks.findIndex(function(t){return t.id===id});if(idx>=0)DATA.tasks[idx]={...DATA.tasks[idx],...obj}}else{obj.id=uid();DATA.tasks.push(obj)}
  saveData(DATA);closeModal();renderSection_tasks();updateCounts();toast(id?'Tarea actualizada':'Tarea creada');
}

function delTask(id){if(!confirmDel())return;DATA.tasks=DATA.tasks.filter(function(t){return t.id!==id});saveData(DATA);renderSection_tasks();updateCounts();toast('Tarea eliminada');}

async function showTaskCompletions(taskId){
  var task=(DATA.tasks||[]).find(function(t){return t.id===taskId});
  if(!task){toast('Tarea no encontrada','err');return}
  try{if(db&&db.from){var r=await db.from('task_completions').select('*');if(r.data)DATA.task_completions=r.data}}catch(e){}
  var members=DATA.members||[];
  var gid=task.group_id;
  if(gid)members=members.filter(function(m){return (m.group_id&&m.group_id.trim()===gid)||(!m.group_id&&getGroupFromRank(m.rank)===gid)});
  var tcs=DATA.task_completions||[];
  var html='<button class="modal-close" onclick="closeModal()">'+ic('x',16)+'</button><h3>'+ic('check-circle',18)+' Completados: '+esc(task.title)+'</h3>'+
    '<div style="margin-top:16px;display:grid;gap:6px;max-height:400px;overflow-y:auto;overflow-x:hidden">';
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
