// ========== ADMIN TEAM ==========

function renderSection_team(){
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
  saveData(DATA);closeModal();renderSection_team();updateCounts();toast(id?'Jugador actualizado':'Jugador agregado');
}

function delTeam(id){if(!confirmDel())return;DATA.team=DATA.team.filter(function(t){return t.id!==id});saveData(DATA);renderSection_team();updateCounts();toast('Jugador eliminado');}
