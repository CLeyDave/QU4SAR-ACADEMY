// ========== ADMIN COACHES MGMT ==========

function renderSection_coaches(){
  var btn='<button class="btn-primary" onclick="coachForm(null)" style="margin-bottom:14px;font-size:13px">'+ic('plus',14)+' Nuevo Coach</button>';
  document.getElementById('adminContent').innerHTML=adminTable(DATA.coaches||[],['Nombre','Email','Nombre VALORANT','Especialidad','Estado'],function(c){
    return '<td>'+esc(c.name)+'</td><td><span style="font-size:12px;color:#888">'+esc(c.email||'—')+'</span></td><td>'+esc(c.nickname||'-')+'</td><td>'+esc(c.specialty||'-')+'</td>'+
      '<td><span style="color:'+(c.status==='active'?'#8b5cf6':'#888')+'">'+(c.status==='active'?'Activo':'Inactivo')+'</span></td>'+
      '<td><div class="has-glow admin-actions">'+
        '<button onclick="coachForm(\''+c.id+'\')" title="Editar">'+ic('pencil',14)+'</button>'+
        '<button onclick="toggleCoachStatus(\''+c.id+'\')" title="'+(c.status==='active'?'Desactivar':'Activar')+'">'+(c.status==='active'?ic('pause',14):ic('play',14))+'</button>'+
        '<button onclick="assignCoachGroup(\''+c.id+'\')" title="Asignar a Grupo">'+ic('layers',14)+'</button>'+
        '<button class="del" onclick="delCoach(\''+c.id+'\')" title="Eliminar">'+ic('trash-2',14)+'</button>'+
      '</div></td>'
  },'No hay coaches',btn);
}

function coachForm(id){
  var item=id?(DATA.coaches||[]).find(function(c){return c.id===id}):null;
  var isNew=!item;
  var f=item?{...item}:{name:'',nickname:'',discord:'',specialty:'',description:'',avatar:'',status:'active',email:''};
  if(!isNew&&f.name.indexOf('#')>=0&&!f.nickname){
    f.nickname=f.name;
    f.name='';
  }
  var assigned=(DATA.group_coaches||[]).filter(function(gc){return gc.coach_id===(item?item.id:'')}).map(function(gc){return gc.group_id});
  var groupHTML=(DATA.groups||[]).map(function(g){return'<label style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:rgba(255,255,255,0.03);border-radius:8px;cursor:pointer;margin-bottom:4px">'+
    '<input type="checkbox" id="cg_'+g.id+'" '+(assigned.indexOf(g.id)>=0?'checked':'')+' style="width:18px;height:18px;accent-color:var(--neon)">'+
    '<span>'+esc(g.name)+' <span style="color:#555">('+esc(g.description||'')+')</span></span></label>'}).join('');
  openModal('<button class="modal-close" onclick="closeModal()">'+ic('x',16)+'</button><h3>'+(item?'Editar':'Nuevo')+' Coach</h3>'+
    '<div class="field"><label>Nombre</label><input class="input-field" id="cf_name" value="'+esc(f.name)+'"></div>'+
    '<div class="field"><label>Email</label><input class="input-field" id="cf_email" value="'+esc(f.email||'')+'"></div>'+
    (isNew?'<p style="font-size:12px;color:#888;margin:-8px 0 12px">Se enviará invitación al email ingresado</p>':'')+
    '<div class="grid-2"><div class="field"><label>Nombre VALORANT</label><input class="input-field" id="cf_nickname" value="'+esc(f.nickname)+'" placeholder="ej: Jugador#NA1"></div>'+
    '<div class="field"><label>Discord</label><input class="input-field" id="cf_discord" value="'+esc(f.discord)+'" placeholder="Opcional"></div></div>'+
    '<div class="field"><label>Especialidad</label><input class="input-field" id="cf_specialty" value="'+esc(f.specialty)+'"></div>'+
    '<div class="field"><label>Descripción</label><textarea class="input-field" id="cf_description" rows="3">'+esc(f.description||'')+'</textarea></div>'+
    '<div class="grid-2"><div class="field"><label>Avatar URL</label><input class="input-field" id="cf_avatar" value="'+esc(f.avatar||'')+'"></div>'+
    '<div class="field"><label>Estado</label><select class="input-field" id="cf_status"><option value="active" '+(f.status==='active'?'selected':'')+'>Activo</option><option value="inactive" '+(f.status==='inactive'?'selected':'')+'>Inactivo</option></select></div></div>'+
    (groupHTML?'<hr><div class="field"><label>Grupos asignados</label>'+groupHTML+'</div>':'')+
    '<button class="btn-primary" onclick="saveCoach(\''+(id||'')+'\')" style="width:100%;justify-content:center;margin-top:8px">'+ic('save',16)+' Guardar</button>');
}

async function saveCoach(id){
  var obj={name:document.getElementById('cf_name').value,email:document.getElementById('cf_email').value,nickname:document.getElementById('cf_nickname').value,discord:document.getElementById('cf_discord').value,specialty:document.getElementById('cf_specialty').value,description:document.getElementById('cf_description').value,avatar:document.getElementById('cf_avatar').value,status:document.getElementById('cf_status').value};
  if(!DATA.coaches)DATA.coaches=[];
  var isNew=!id;
  if(isNew){
    obj.id=uid();
    DATA.coaches.push(obj);
    if(db&&db.from){
      try{
        if(obj.email){
          var {data:authUser,error:signUpError}=await db.auth.signUp({email:obj.email,password:obj.email+'Qu4sar2026!'});
          if(signUpError&&signUpError.message&&signUpError.message.indexOf('already')<0)throw signUpError;
          if(authUser&&authUser.user){
            await db.from('users').upsert({id:authUser.user.id,email:obj.email,role:'coach',name:obj.name},{onConflict:'id'});
          }
          await db.from('admins').upsert({email:obj.email,role:'coach',active:true},{onConflict:'email'});
          toast('Coach creado. Email: '+obj.email+' | Contraseña: '+obj.email+'Qu4sar2026!','info');
        }
      }catch(e){toast('Error al crear usuario: '+(e.message||e),'error')}
    }
  }else{
    var idx=DATA.coaches.findIndex(function(c){return c.id===id});
    if(idx>=0)DATA.coaches[idx]={...DATA.coaches[idx],...obj};
    if(db&&db.from){
      try{
        var {data:existingUser}=await db.from('users').select('id').eq('email',obj.email).limit(1);
        if(existingUser&&existingUser.length){
          await db.from('users').update({name:obj.name,role:'coach'}).eq('email',obj.email);
        }
        await db.from('admins').upsert({email:obj.email,role:'coach',active:obj.status==='active'},{onConflict:'email'});
      }catch(e){console.log('Error updating coach in Supabase:',e)}
    }
  }
  var coachId=obj.id||id;
  (DATA.groups||[]).forEach(function(g){
    var cb=document.getElementById('cg_'+g.id);
    if(!cb)return;
    if(!DATA.group_coaches)DATA.group_coaches=[];
    DATA.group_coaches=DATA.group_coaches.filter(function(gc){return!(gc.coach_id===coachId&&gc.group_id===g.id)});
    if(cb.checked)DATA.group_coaches.push({id:uid(),group_id:g.id,coach_id:coachId});
  });
  saveData(DATA);closeModal();renderSection_coaches();updateCounts();toast(isNew?'Coach agregado':'Coach actualizado');
}

function delCoach(id){
  if(!confirmDel())return;
  var c=(DATA.coaches||[]).find(function(c){return c.id===id});
  DATA.coaches=(DATA.coaches||[]).filter(function(c){return c.id!==id});
  saveData(DATA);renderSection_coaches();updateCounts();toast('Coach eliminado');
  if(db&&db.from&&c){
    db.from('users').delete().eq('email',c.email).then(function(){}).catch(function(e){console.log('Error deleting user:',e)});
    db.from('admins').delete().eq('email',c.email).then(function(){}).catch(function(e){console.log('Error deleting admin:',e)});
  }
}

function toggleCoachStatus(id){
  var c=(DATA.coaches||[]).find(function(c){return c.id===id});
  if(!c)return;
  c.status=c.status==='active'?'inactive':'active';
  saveData(DATA);renderSection_coaches();toast('Coach '+(c.status==='active'?'activado':'desactivado'));
  if(db&&db.from){
    db.from('users').update({role:c.status==='active'?'coach':'user'}).eq('email',c.email).then(function(){}).catch(function(e){console.log('Error updating user status:',e)});
    db.from('admins').update({active:c.status==='active'}).eq('email',c.email).then(function(){}).catch(function(e){console.log('Error updating admin status:',e)});
  }
}

function assignCoachGroup(coachId){
  var coach=(DATA.coaches||[]).find(function(c){return c.id===coachId});
  if(!coach)return;
  var assigned=(DATA.group_coaches||[]).filter(function(gc){return gc.coach_id===coachId}).map(function(gc){return gc.group_id});
  var h='<button class="modal-close" onclick="closeModal()">'+ic('x',16)+'</button><h3>'+ic('layers',16)+' Asignar Coach: '+esc(coach.name)+'</h3><div style="display:grid;gap:10px;margin-bottom:16px">';
  (DATA.groups||[]).forEach(function(g){
    var checked=assigned.indexOf(g.id)>=0?'checked':'';
    h+='<label style="display:flex;align-items:center;gap:10px;padding:12px 16px;background:rgba(255,255,255,0.03);border-radius:8px;cursor:pointer">'+
      '<input type="checkbox" id="cg_'+g.id+'" '+checked+' style="width:18px;height:18px;accent-color:var(--neon)">'+
      '<span>'+esc(g.name)+' <span style="color:#555">('+esc(g.description||'')+')</span></span></label>';
  });
  h+='</div><button class="btn-primary" onclick="saveCoachGroups(\''+coachId+'\')" style="width:100%;justify-content:center">'+ic('save',16)+' Guardar Asignaciones</button>';
  openModal(h);
}

function saveCoachGroups(coachId){
  (DATA.groups||[]).forEach(function(g){
    var cb=document.getElementById('cg_'+g.id);
    if(!cb)return;
    if(!DATA.group_coaches)DATA.group_coaches=[];
    DATA.group_coaches=DATA.group_coaches.filter(function(gc){return!(gc.coach_id===coachId&&gc.group_id===g.id)});
    if(cb.checked)DATA.group_coaches.push({id:uid(),group_id:g.id,coach_id:coachId});
  });
  saveData(DATA);closeModal();renderSection_coaches();updateCounts();toast('Asignaciones guardadas');
}
