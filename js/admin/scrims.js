// ========== ADMIN SCRIMS ==========

function renderSection_scrims(){
  var gid=(document.getElementById('adminGF')&&document.getElementById('adminGF').value)||'';
  var items=filterByCurrentCoach(DATA.scrims||[]);
  if(gid)items=items.filter(function(i){return i.group_id===gid});
  var fh=adminGroupFilterHTML(gid,'renderSection_scrims()');
  var btn='<button class="btn-primary" onclick="scrimForm(null)" style="margin-bottom:14px;font-size:13px">'+ic('plus',14)+' Nuevo Scrim</button>';
  document.getElementById('adminContent').innerHTML=fh+adminTable(items,['Oponente','Resultado','Score','Fecha','Coach','Grupo'],function(s){
    return '<td>'+esc(s.opponent)+'</td><td><span class="badge '+(s.result==='Victoria'?'badge-green':s.result==='Derrota'?'badge-red':'badge-gray')+'">'+s.result+'</span></td><td>'+s.our+' - '+s.opponent+'</td><td>'+s.date+'</td><td>'+esc(s.coach||'-')+'</td><td>'+groupName(s.group_id)+'</td><td><div class="has-glow admin-actions"><button onclick="scrimForm(\''+s.id+'\')">'+ic('pencil',14)+'</button><button class="del" onclick="delScrim(\''+s.id+'\')">'+ic('trash-2',14)+'</button></div></td>'},'No hay scrims',btn);
}

function scrimForm(id){
  var item=id?DATA.scrims.find(function(s){return s.id===id}):null;
  var f=item||{opponent:'',opponent_logo:'',our:0,opponent_score:0,result:'Pendiente',date:new Date().toISOString().slice(0,10),coach:dc(),group_id:''};
  openModal('<button class="modal-close" onclick="closeModal()">'+ic('x',16)+'</button><h3>'+(item?'Editar':'Nuevo')+' Scrim</h3>'+
    '<div class="field"><label for="sf_opp">Oponente</label><input class="input-field" id="sf_opp" value="'+esc(f.opponent)+'"></div>'+
    '<div class="field"><label>Logo del oponente</label>'+fileUploadHTML('Logo','image/*','sf_logo_img_status','sf_opponent_logo',f.opponent_logo||'')+(f.opponent_logo?mediaPreview(f.opponent_logo):'')+'</div>'+
    '<div class="grid-2"><div class="field"><label for="sf_our">Nuestro Score</label><input type="number" class="input-field" id="sf_our" value="'+f.our+'"></div>'+
    '<div class="field"><label for="sf_opp_score">Su Score</label><input type="number" class="input-field" id="sf_opp_score" value="'+(f.opponent_score||0)+'"></div></div>'+
    '<div class="field"><label for="sf_result">Resultado</label><select class="input-field" id="sf_result">'+['Pendiente','Victoria','Derrota','Empate'].map(function(r){return'<option value="'+r+'" '+(r===f.result?'selected':'')+'>'+r+'</option>'}).join('')+'</select></div>'+
    '<div class="field"><label for="sf_date">Fecha</label><input type="date" class="input-field" id="sf_date" value="'+f.date+'"></div>'+
    '<div class="field"><label for="scf_coach">Coach</label><select class="input-field" id="scf_coach" onchange="setGroupFromCoach(\'scf_group\',\'scf_coach\')"><option value="">Sin coach</option>'+coachOptions(f.coach||'',f.group_id)+'</select></div>'+
    '<div class="field" style="display:none"><label for="scf_group">Grupo</label><select class="input-field" id="scf_group" onchange="reloadCoachDropdown(\'scf_coach\',this.value)"><option value="">General (Ambos)</option>'+(DATA.groups||[]).map(function(g){return'<option value="'+g.id+'"'+(f.group_id===g.id?' selected':'')+'>'+esc(g.name)+'</option>'}).join('')+'</select></div>'+
    '<button class="btn-primary" onclick="saveScrim(\''+(id||'')+'\')" style="width:100%;justify-content:center">'+ic('save',16)+' Guardar</button>');
}

function saveScrim(id){
  var obj={opponent:document.getElementById('sf_opp').value,opponent_logo:document.getElementById('sf_opponent_logo').value,our:parseInt(document.getElementById('sf_our').value)||0,opponent_score:parseInt(document.getElementById('sf_opp_score').value)||0,result:document.getElementById('sf_result').value,date:document.getElementById('sf_date').value,coach:document.getElementById('scf_coach').value,group_id:document.getElementById('scf_group').value};
  if(id){var idx=DATA.scrims.findIndex(function(s){return s.id===id});if(idx>=0)DATA.scrims[idx]={...DATA.scrims[idx],...obj}}else{obj.id=uid();DATA.scrims.unshift(obj)}
  saveData(DATA);closeModal();renderSection_scrims();updateCounts();toast(id?'Scrim actualizado':'Scrim registrado');
}

function delScrim(id){if(!confirmDel())return;DATA.scrims=DATA.scrims.filter(function(s){return s.id!==id});saveData(DATA);renderSection_scrims();updateCounts();toast('Scrim eliminado');}
