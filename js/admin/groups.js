// ========== ADMIN GROUPS ==========

function renderSection_groups(){
  var h='<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">'+
    '<button class="btn-primary" onclick="groupForm(null)" style="font-size:13px">'+ic('plus',14)+' Nuevo Grupo</button>'+
    '</div><div style="display:grid;gap:20px">';
  var coachGroups=currentUser&&currentUser.coachName?(DATA.group_coaches||[]).filter(function(gc){
    var c=(DATA.coaches||[]).find(function(c){return c.id===gc.coach_id});
    return c&&c.name===currentUser.coachName;
  }).map(function(gc){return gc.group_id}):null;
  (DATA.groups||[]).forEach(function(g){
    if(coachGroups&&coachGroups.indexOf(g.id)<0)return;
    var coaches=(DATA.group_coaches||[]).filter(function(gc){return gc.group_id===g.id}).map(function(gc){return(DATA.coaches||[]).find(function(c){return c.id===gc.coach_id})}).filter(Boolean);
    var members=(DATA.members||[]).filter(function(m){return (m.group_id&&m.group_id.trim()===g.id)||(!m.group_id&&getGroupFromRank(m.rank)===g.id)});
    h+='<div class="glass-card" style="padding:24px">'+
      '<div style="display:flex;justify-content:space-between;align-items:start">'+
      '<div><h3 style="font-family:var(--font-display);font-size:16px;margin-bottom:4px">'+esc(g.name)+'</h3>'+
      '<p style="color:#888;font-size:13px;margin-bottom:14px">'+esc(g.description||'')+'</p></div>'+
      '<div class="has-glow admin-actions">'+
        '<button onclick="groupForm(\''+g.id+'\')" title="Editar">'+ic('pencil',14)+'</button>'+
        '<button class="del" onclick="delGroup(\''+g.id+'\')" title="Eliminar">'+ic('trash-2',14)+'</button>'+
      '</div></div>'+
      '<div style="display:flex;flex-direction:column;gap:14px">';
    if(coaches.length){
      coaches.forEach(function(c){
        var students=members.filter(function(m){return m.coach&&m.coach.toLowerCase()===c.name.toLowerCase()});
        h+='<div class="has-glow" style="padding:12px 16px;background:rgba(255,255,255,0.02);border-radius:10px;border-left:3px solid var(--neon-light)">'+
          '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">'+
          (c.avatar?'<img src="'+esc(c.avatar)+'" style="width:28px;height:28px;border-radius:50%;object-fit:cover">':'<span style="width:28px;height:28px;border-radius:50%;background:rgba(139,92,246,0.15);display:flex;align-items:center;justify-content:center;font-size:12px">'+ic('user',14)+'</span>')+
          '<span style="font-weight:600;font-size:14px">'+esc(c.name)+'</span>'+
          '<span style="color:#555;font-size:12px">'+esc(c.nickname?'('+c.nickname+')':'')+'</span>'+
          '<span style="color:'+(c.status==='active'?'#8b5cf6':'#888')+';font-size:11px;margin-left:auto">'+(c.status==='active'?'activo':'inactivo')+'</span>'+
          '</div>'+
          (students.length?'<div style="display:flex;flex-direction:column;gap:4px;padding-left:36px">'+
            students.map(function(m){return'<div style="display:flex;align-items:center;gap:8px;padding:4px 0;font-size:13px">'+
              '<span>'+esc(m.name)+'</span><span style="color:#555;font-size:12px">'+esc(m.rank||'')+'</span></div>'}).join('')+
          '</div>':'<div style="padding-left:36px;color:#555;font-size:13px">Sin estudiantes asignados</div>')+
        '</div>';
      });
    }else{
      h+='<div style="color:#555;font-size:13px;padding:8px 0">Sin coaches asignados a este grupo</div>';
    }
    var unassigned=members.filter(function(m){return!m.coach||!coaches.some(function(c){return m.coach.toLowerCase()===c.name.toLowerCase()})});
    if(unassigned.length){
      h+='<div class="has-glow" style="padding:12px 16px;background:rgba(255,255,255,0.02);border-radius:10px;border-left:3px solid #555">'+
        '<div style="font-size:13px;color:#888;margin-bottom:6px">'+ic('users',13)+' Sin coach / Directiva ('+unassigned.length+')</div>'+
        '<div style="display:flex;flex-direction:column;gap:4px;padding-left:20px">'+
        unassigned.map(function(m){return'<div style="display:flex;align-items:center;gap:8px;padding:3px 0;font-size:13px">'+
          '<span>'+esc(m.name)+'</span><span style="color:#555;font-size:12px">'+esc(m.rank||'')+'</span></div>'}).join('')+
        '</div></div>';
    }
    h+='</div></div>';
  });
  h+='</div>';
  document.getElementById('adminContent').innerHTML=h;
}

function groupForm(id){
  var item=id?(DATA.groups||[]).find(function(g){return g.id===id}):null;
  var f=item||{name:'',description:''};
  openModal('<button class="modal-close" onclick="closeModal()">'+ic('x',16)+'</button><h3>'+(item?'Editar':'Nuevo')+' Grupo</h3>'+
    '<div class="field"><label for="gf_name">Nombre</label><input class="input-field" id="gf_name" value="'+esc(f.name)+'"></div>'+
    '<div class="field"><label for="gf_description">Descripción</label><input class="input-field" id="gf_description" value="'+esc(f.description||'')+'" placeholder="ej: Hierro a Oro"></div>'+
    '<button class="btn-primary" onclick="saveGroup(\''+(id||'')+'\')" style="width:100%;justify-content:center">'+ic('save',16)+' Guardar</button>');
}

function saveGroup(id){
  var obj={name:document.getElementById('gf_name').value,description:document.getElementById('gf_description').value};
  if(!DATA.groups)DATA.groups=[];
  if(id){var idx=DATA.groups.findIndex(function(g){return g.id===id});if(idx>=0)DATA.groups[idx]={...DATA.groups[idx],...obj}}else{obj.id=uid();DATA.groups.push(obj)}
  saveData(DATA);closeModal();renderSection_groups();updateCounts();toast(id?'Grupo actualizado':'Grupo creado');
}

function delGroup(id){if(!confirmDel())return;DATA.groups=DATA.groups.filter(function(g){return g.id!==id});DATA.group_coaches=(DATA.group_coaches||[]).filter(function(gc){return gc.group_id!==id});saveData(DATA);renderSection_groups();updateCounts();toast('Grupo eliminado');}

function getGroupFromRank(rank){
  if(!rank||!DATA.groups)return'';
  var v=rankValue(rank);
  if(v<0)return'';
  var best='',bestR=-Infinity;
  DATA.groups.forEach(function(g){
    var desc=(g.description||'').toLowerCase();
    var parts=desc.split('a');
    var lower=parts[0]?parts[0].trim():'';
    var upper=parts[1]?parts[1].trim():'';
    var lv=0,uv=Infinity;
    if(lower){var t=rankValue(lower.charAt(0).toUpperCase()+lower.slice(1));if(t>=0)lv=t}
    if(upper){var t=rankValue(upper.charAt(0).toUpperCase()+upper.slice(1));if(t>=0)uv=t}
    if(v>=lv&&v<=uv&&(uv-lv)>(bestR-lv||0)){best=g.id;bestR=uv}
  });
  return best;
}

function groupName(id){
  if(!id)return'—';
  var g=(DATA.groups||[]).find(function(g){return g.id===id});
  return g?esc(g.name):id;
}
