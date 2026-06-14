// ========== ADMIN COACH NOTES ==========

function renderSection_coachnotes(){
  var gid=(document.getElementById('adminGF')&&document.getElementById('adminGF').value)||'';
  var items=filterByCurrentCoach(DATA.coach_notes||[]);
  if(gid)items=items.filter(function(i){return i.group_id===gid});
  var fh=adminGroupFilterHTML(gid,'renderSection_coachnotes()');
  var btn='<button class="btn-primary" onclick="coachNoteForm(null)" style="margin-bottom:14px;font-size:13px">'+ic('plus',14)+' Nueva Nota</button>';
  document.getElementById('adminContent').innerHTML=fh+adminTable(items,['Miembro','Nota','Categoría','Coach','Grupo','Fecha'],function(n){
    return '<td>'+esc(n.member_name)+'</td><td><div class="cell-preview" onclick="viewCoachNote(\''+n.id+'\')">'+esc(n.note)+'</div></td><td><span class="badge badge-purple">'+esc(n.category||'general')+'</span></td><td>'+esc(n.coach||'—')+'</td><td>'+groupName(n.group_id)+'</td><td>'+(n.created_at?new Date(n.created_at).toLocaleDateString('es-ES'):'')+'</td><td><div class=" admin-actions"><button onclick="coachNoteForm(\''+n.id+'\')">'+ic('pencil',14)+'</button><button class="del" onclick="delCoachNote(\''+n.id+'\')">'+ic('trash-2',14)+'</button></div></td>'},'No hay notas del coach',btn,'delCoachNote');
}

function coachNoteForm(id){
  var item=id?(DATA.coach_notes||[]).find(function(n){return n.id===id}):null;
  var f=item||{member_name:'',note:'',category:'general',group_id:'',coach:dc(),created_at:new Date().toISOString()};
  openModal('<button class="modal-close" onclick="closeModal()">'+ic('x',16)+'</button><h3>'+(item?'Editar':'Nueva')+' Nota</h3>'+
    '<div class="field"><label for="cnf_member">Miembro</label><select class="input-field" id="cnf_member">'+(DATA.members||[]).map(function(m){return'<option value="'+esc(m.name)+'" '+(m.name===f.member_name?'selected':'')+'>'+esc(m.name)+'</option>'}).join('')+'</select></div>'+
    '<div class="field"><label for="cnf_note">Nota</label><textarea class="input-field" id="cnf_note" rows="3">'+esc(f.note)+'</textarea></div>'+
    '<div class="field"><label for="cnf_cat">Categoría</label><input class="input-field" id="cnf_cat" value="'+esc(f.category||'general')+'" placeholder="ej: aim, game_sense, actitud"></div>'+
    '<div class="field" style="display:none"><label for="cnf_group">Grupo</label><select class="input-field" id="cnf_group" onchange="reloadCoachDropdown(\'cnf_coach\',this.value)"><option value="">General (Ambos)</option>'+(DATA.groups||[]).map(function(g){return'<option value="'+g.id+'"'+(f.group_id===g.id?' selected':'')+'>'+esc(g.name)+'</option>'}).join('')+'</select></div>'+
    '<div class="field"><label for="cnf_coach">Coach</label><select class="input-field" id="cnf_coach" onchange="setGroupFromCoach(\'cnf_group\',\'cnf_coach\')"><option value="">Sin coach</option>'+coachOptions(f.coach||'',f.group_id)+'</select></div>'+
    '<button class="btn-primary" onclick="saveCoachNote(\''+(id||'')+'\')" style="width:100%;justify-content:center">'+ic('save',16)+' Guardar</button>');
}

function saveCoachNote(id){
  var obj={member_name:document.getElementById('cnf_member').value,note:document.getElementById('cnf_note').value,category:document.getElementById('cnf_cat').value||'general',group_id:document.getElementById('cnf_group').value,coach:document.getElementById('cnf_coach')?.value||''};
  if(!DATA.coach_notes)DATA.coach_notes=[];
  if(id){var idx=DATA.coach_notes.findIndex(function(n){return n.id===id});if(idx>=0)DATA.coach_notes[idx]={...DATA.coach_notes[idx],...obj}}else{obj.id=uid();obj.created_at=new Date().toISOString();DATA.coach_notes.push(obj)}
  saveData(DATA);closeModal();renderSection_coachnotes();updateCounts();toast(id?'Nota actualizada':'Nota creada');
}

function delCoachNote(id){if(!confirmDel())return;DATA.coach_notes=DATA.coach_notes.filter(function(n){return n.id!==id});saveData(DATA);renderSection_coachnotes();updateCounts();toast('Nota eliminada');}

function viewCoachNote(id){
  var n=(DATA.coach_notes||[]).find(function(x){return x.id===id});
  if(!n)return;
  openModal('<button class="modal-close" onclick="closeModal()">'+ic('x',16)+'</button><h3>Nota: '+esc(n.member_name)+'</h3><div style="color:#888;font-size:13px;line-height:1.8;white-space:pre-wrap">'+esc(n.note)+'</div>');
}
