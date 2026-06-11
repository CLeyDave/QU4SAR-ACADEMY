// ========== ADMIN STATS ==========

function renderSection_stats(){
  var gid=(document.getElementById('adminGF')&&document.getElementById('adminGF').value)||'';
  var items=filterByCurrentCoach(DATA.stats||[]);
  if(gid)items=items.filter(function(i){return i.group_id===gid});
  var fh=adminGroupFilterHTML(gid,'renderSection_stats()');
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
  saveData(DATA);closeModal();renderSection_stats();updateCounts();toast(id?'Stats actualizadas':'Stats creadas');
}

function delStats(id){if(!confirmDel())return;DATA.stats=DATA.stats.filter(function(s){return s.id!==id});saveData(DATA);renderSection_stats();updateCounts();toast('Stats eliminadas');}
