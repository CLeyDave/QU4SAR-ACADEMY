// ========== ADMIN APPLICATIONS ==========

function renderSection_applications(){
  var items=DATA.applications||[];
  var pending=items.filter(function(a){return a.status==='pending'}).length;
  var h=pending?'<div style="margin-bottom:16px;font-size:14px;color:#888">'+ic('clipboard-list',16)+' <strong style="color:var(--neon)">'+pending+'</strong> solicitudes pendientes</div>':'';
  h+='<div style="display:grid;gap:16px">';
  if(!items.length){h+='<div class="empty-state"><div class="icon">'+ic('clipboard-list',40)+'</div><p>No hay inscripciones aún</p></div>'}else{
    items.forEach(function(a){
      var roles=(a.selected_roles||[]).join(', ');
      var badges={pending:'badge-yellow',accepted:'badge-green',rejected:'badge-red'};
      h+='<div class="glass-card" style="padding:20px 24px">'+
        '<div style="display:flex;justify-content:space-between;align-items:start;flex-wrap:wrap;gap:10px;margin-bottom:14px">'+
          '<div><strong style="font-size:17px">'+esc(a.name)+'</strong>'+
          (a.age?'<span style="color:#888;font-size:13px;margin-left:8px">'+esc(a.age)+' años</span>':'')+
          '<span class="badge '+(badges[a.status]||'badge-gray')+'" style="margin-left:10px;font-size:11px">'+(a.status||'pending')+'</span></div>'+
          '<div style="display:flex;gap:8px;flex-wrap:wrap">'+
            (a.status==='pending'?'<button class="btn-primary" style="padding:8px 18px;font-size:13px" onclick="acceptApp(\''+a.id+'\')">'+ic('check',16)+' Aceptar</button><button class="btn-sm danger" style="padding:8px 16px;font-size:13px" onclick="rejectApp(\''+a.id+'\')">'+ic('x',16)+' Rechazar</button>':'')+
            (a.status==='accepted'?'<button class="btn-sm cancel" style="padding:8px 16px;font-size:13px" onclick="rejectApp(\''+a.id+'\')">'+ic('x',16)+' Rechazar</button>':'')+
            (a.status==='rejected'?'<button class="btn-primary" style="padding:8px 18px;font-size:13px" onclick="acceptApp(\''+a.id+'\')">'+ic('check',16)+' Aceptar</button>':'')+
            '<button class="btn-sm danger" style="padding:8px 12px" onclick="delApp(\''+a.id+'\')" title="Eliminar">'+ic('trash-2',15)+'</button>'+
          '</div>'+
        '</div>'+
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 16px;font-size:14px;color:#bbb;margin-bottom:12px">'+
          (a.discord?'<div><span style="color:#666">Discord:</span> '+esc(a.discord)+'</div>':'')+
          (a.valorant?'<div><span style="color:#666">VALORANT:</span> '+esc(a.valorant)+'</div>':'')+
          (a.rank?'<div><span style="color:#666">Rango:</span> '+esc(a.rank)+'</div>':'')+
          (a.main_role?'<div><span style="color:#666">Rol:</span> '+esc(a.main_role)+'</div>':'')+
          (a.server?'<div><span style="color:#666">Servidor:</span> '+esc(a.server)+'</div>':'')+
          (a.availability?'<div><span style="color:#666">Disponibilidad:</span> '+esc(a.availability)+'</div>':'')+
        '</div>'+
        (roles?'<div style="font-size:14px;margin-bottom:10px"><span style="color:#666">Roles elegidos:</span> <span style="color:var(--neon)">'+esc(roles)+'</span></div>':'')+
        (a.objectives?'<div class="has-glow" style="font-size:14px;margin-bottom:8px;padding:10px 14px;background:rgba(139,92,246,0.04);border-radius:8px;border-left:3px solid var(--neon)"><span style="color:#666;font-weight:600">Objetivos:</span><br><span style="color:#ccc">'+esc(a.objectives)+'</span></div>':'')+
        (a.reason?'<div class="has-glow" style="font-size:14px;margin-bottom:6px;padding:10px 14px;background:rgba(139,92,246,0.04);border-radius:8px;border-left:3px solid var(--neon)"><span style="color:#666;font-weight:600">Motivación:</span><br><span style="color:#ccc">'+esc(a.reason)+'</span></div>':'')+
        '<div style="font-size:12px;color:#444;margin-top:8px">'+(a.created_at?new Date(a.created_at).toLocaleString('es-ES'):'')+'</div>'+
      '</div>';
    });
  }
  h+='</div>';
  document.getElementById('adminContent').innerHTML=h;
}

function autoAssignCoach(groupId){
  var groupCoaches=(DATA.group_coaches||[]).filter(function(gc){return gc.group_id===groupId});
  if(!groupCoaches.length)return'';
  var coachCounts=groupCoaches.map(function(gc){
    var coach=(DATA.coaches||[]).find(function(c){return c.id===gc.coach_id});
    if(!coach)return null;
    var count=(DATA.members||[]).filter(function(m){
      return m.coach&&m.coach.toLowerCase()===coach.name.toLowerCase()&&(m.group_id||getGroupFromRank(m.rank))===groupId;
    }).length;
    return{name:coach.name,count:count};
  }).filter(Boolean);
  if(!coachCounts.length)return'';
  var min=Math.min.apply(Math,coachCounts.map(function(c){return c.count}));
  var tied=coachCounts.filter(function(c){return c.count===min});
  return tied[Math.floor(Math.random()*tied.length)].name;
}

function acceptApp(id){
  if(!confirm('¿Aceptar esta solicitud?'))return;
  var idx=DATA.applications.findIndex(function(a){return a.id===id});
  if(idx<0)return;
  var a=DATA.applications[idx];
  var memberName=a.valorant||a.name;
  if((DATA.members||[]).find(function(m){return m.name.toLowerCase()===memberName.toLowerCase()})){
    toast('Ya existe un miembro con ese nombre: '+memberName,'err');renderSection_applications();return
  }
  a.status='accepted';
  var groupId=getGroupFromRank(a.rank||'');
  var coach=groupId?autoAssignCoach(groupId):'';
  var member={id:uid(),name:memberName,role:a.main_role||'Miembro',rank:a.rank||'',group_id:groupId,coach:coach,image:'',description:''};
  DATA.members.push(member);
  saveData(DATA);
  var toastMsg='Solicitud aceptada — añadido a Miembros'+(coach?' (Coach: '+coach+')':'');
  if(db&&db.from){
    db.from('applications').update({status:'accepted'}).eq('id',id).then(function(){return db.from('members').insert([member])}).then(function(){renderSection_applications();updateCounts();toast(toastMsg)}).catch(function(e){toast('Error: '+e.message,'error')});
  }else{
    renderSection_applications();updateCounts();toast(toastMsg+' (solo local)');
  }
}

function rejectApp(id){
  if(!confirm('¿Rechazar esta solicitud?'))return;
  var idx=DATA.applications.findIndex(function(a){return a.id===id});
  if(idx<0)return;
  DATA.applications[idx].status='rejected';
  saveData(DATA);
  if(db&&db.from){
    db.from('applications').update({status:'rejected'}).eq('id',id).then(function(){renderSection_applications();updateCounts();toast('Solicitud rechazada')}).catch(function(e){toast('Error: '+e.message,'error')});
  }else{
    renderSection_applications();updateCounts();toast('Solicitud rechazada (solo local)');
  }
}

function delApp(id){
  if(!confirm('¿Eliminar esta solicitud permanentemente?'))return;
  DATA.applications=DATA.applications.filter(function(a){return a.id!==id});
  saveData(DATA);
  if(db&&db.from){
    db.from('applications').delete().eq('id',id).then(function(){renderSection_applications();updateCounts();toast('Solicitud eliminada')}).catch(function(e){toast('Error: '+e.message,'error')});
  }else{
    renderSection_applications();updateCounts();toast('Solicitud eliminada (solo local)');
  }
}
