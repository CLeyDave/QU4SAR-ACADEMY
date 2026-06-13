// ========== ADMIN LOGROS (Achievements) ==========

function renderSection_achievements(){
  var items=DATA.achievements||[];
  var members=DATA.members||[];
  var ma=DATA.member_achievements||[];
  var btn='<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">'+
    '<button class="btn-primary" onclick="logroForm(null)" style="font-size:13px">'+ic('plus',14)+' Nuevo Logro</button>'+
    '<button class="btn-sm secondary" onclick="assignLogroForm(null)" style="font-size:12px">'+ic('user-plus',13)+' Asignar a Miembro</button></div>';
  document.getElementById('adminContent').innerHTML=btn+
    '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px">'+
    items.map(function(a){
      var count=ma.filter(function(x){return x.achievement_id===a.id}).length;
      return'<div class="glass-card" style="padding:18px 20px;display:flex;gap:14px;align-items:flex-start">'+
        (a.icon?'<div style="font-size:28px;flex-shrink:0">'+a.icon+'</div>':'')+
        '<div style="flex:1;min-width:0"><div style="font-weight:600;font-size:14px;color:#f0f0f0">'+esc(a.title)+'</div>'+
        (a.description?'<div style="font-size:12px;color:#888;margin-top:4px">'+esc(a.description)+'</div>':'')+
        '<div style="font-size:11px;color:#555;margin-top:8px;display:flex;gap:12px;flex-wrap:wrap">'+
          (a.type?'<span>'+ic('tag',11)+' '+esc(a.type)+'</span>':'')+
          '<span>'+ic('award',11)+' '+count+' miembro'+(count!==1?'s':'')+'</span>'+
        '</div></div>'+
        '<div class="has-glow admin-actions" style="display:flex;gap:4px;flex-shrink:0">'+
          '<button onclick="logroForm(\''+a.id+'\')">'+ic('pencil',13)+'</button>'+
          '<button onclick="assignLogroForm(\''+a.id+'\')" title="Asignar a miembro">'+ic('user-plus',13)+'</button>'+
          '<button class="del" onclick="delLogro(\''+a.id+'\')">'+ic('trash-2',13)+'</button>'+
        '</div></div>'
    }).join('')+'</div>'+
    (ma.length?'<h3 style="font-family:var(--font-display);font-size:13px;margin:24px 0 12px;color:#aaa">'+ic('users',13)+' Miembros con Logros</h3>'+
      '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px">'+
      ma.map(function(m){
        var ach=items.find(function(a){return a.id===m.achievement_id});
        var member=members.find(function(x){return x.name===m.member_name});
        return'<div class="glass-card" style="padding:12px 14px;display:flex;align-items:center;gap:10px">'+
          (ach&&ach.icon?'<span style="font-size:20px">'+ach.icon+'</span>':'')+
          '<div style="flex:1;min-width:0"><div style="font-size:12px;font-weight:600;color:#e0e0e0">'+esc(m.member_name)+(ach?' <span style="color:#888;font-weight:400">— '+esc(ach.title)+'</span>':'')+'</div>'+
          (m.date?'<div style="font-size:10px;color:#555;margin-top:2px">'+new Date(m.date).toLocaleDateString('es-ES')+'</div>':'')+
          '</div>'+
          '<button class="del" onclick="delMemberAchievement(\''+m.id+'\')" style="background:none;border:none;color:#666;cursor:pointer;padding:4px">'+ic('x',12)+'</button>'+
        '</div>'
      }).join('')+'</div>':'');
}

function logroForm(id){
  var item=id?(DATA.achievements||[]).find(function(a){return a.id===id}):null;
  var f=item||{title:'',description:'',icon:'🏆',type:''};
  openModal('<button class="modal-close" onclick="closeModal()">'+ic('x',16)+'</button><h3>'+(item?'Editar':'Nuevo')+' Logro</h3>'+
    '<div class="field"><label>Título</label><input class="input-field" id="lf_title" value="'+esc(f.title)+'"></div>'+
    '<div class="field"><label>Descripción</label><textarea class="input-field" id="lf_desc" rows="3">'+esc(f.description||'')+'</textarea></div>'+
    '<div class="field"><label>Icono (emoji)</label><input class="input-field" id="lf_icon" value="'+esc(f.icon||'')+'" placeholder="ej: 🏆⭐🎯" style="font-size:24px"></div>'+
    '<div class="field"><label>Tipo</label><input class="input-field" id="lf_type" value="'+esc(f.type||'')+'" placeholder="ej: scrims, evaluacion, asistencia"></div>'+
    '<button class="btn-primary" onclick="saveLogro(\''+(id||'')+'\')" style="width:100%;justify-content:center;margin-top:6px">'+ic('save',16)+' Guardar</button>');
}

function saveLogro(id){
  var obj={title:document.getElementById('lf_title').value,description:document.getElementById('lf_desc').value,icon:document.getElementById('lf_icon').value,type:document.getElementById('lf_type').value};
  if(!DATA.achievements)DATA.achievements=[];
  if(id){var idx=DATA.achievements.findIndex(function(a){return a.id===id});if(idx>=0)DATA.achievements[idx]={...DATA.achievements[idx],...obj}}else{obj.id=uid();DATA.achievements.push(obj)}
  saveData(DATA);closeModal();renderSection_achievements();updateCounts();toast(id?'Logro actualizado':'Logro creado');
}

function delLogro(id){if(!confirmDel())return;DATA.achievements=DATA.achievements.filter(function(a){return a.id!==id});DATA.member_achievements=(DATA.member_achievements||[]).filter(function(m){return m.achievement_id!==id});saveData(DATA);renderSection_achievements();updateCounts();toast('Logro eliminado');}

function assignLogroForm(achievementId){
  var members=DATA.members||[];
  var achs=DATA.achievements||[];
  openModal('<button class="modal-close" onclick="closeModal()">'+ic('x',16)+'</button><h3>Asignar Logro</h3>'+
    '<div class="field"><label>Miembro</label><select class="input-field" id="alf_member">'+members.map(function(m){return'<option value="'+esc(m.name)+'">'+esc(m.name)+'</option>'}).join('')+'</select></div>'+
    '<div class="field"><label>Logro</label><select class="input-field" id="alf_achievement">'+achs.map(function(a){return'<option value="'+a.id+'" '+(a.id===achievementId?'selected':'')+'>'+(a.icon||'')+' '+esc(a.title)+'</option>'}).join('')+'</select></div>'+
    '<div class="field"><label>Fecha</label><input class="input-field" id="alf_date" type="date" value="'+new Date().toISOString().slice(0,10)+'"></div>'+
    '<button class="btn-primary" onclick="saveAssignLogro()" style="width:100%;justify-content:center;margin-top:6px">'+ic('user-check',16)+' Asignar</button>');
}

function saveAssignLogro(){
  var memberName=document.getElementById('alf_member').value;
  var achievementId=document.getElementById('alf_achievement').value;
  var date=document.getElementById('alf_date').value;
  if(!memberName||!achievementId){toast('Completa todos los campos','err');return}
  if(!DATA.member_achievements)DATA.member_achievements=[];
  var dup=DATA.member_achievements.find(function(m){return m.member_name===memberName&&m.achievement_id===achievementId});
  if(dup){toast('Ese miembro ya tiene ese logro','err');return}
  DATA.member_achievements.push({id:uid(),member_name:memberName,achievement_id:achievementId,date:date||new Date().toISOString()});
  saveData(DATA);closeModal();renderSection_achievements();updateCounts();toast('Logro asignado');
}

function delMemberAchievement(id){if(!confirmDel())return;DATA.member_achievements=(DATA.member_achievements||[]).filter(function(m){return m.id!==id});saveData(DATA);renderSection_achievements();updateCounts();toast('Asignación eliminada');}
