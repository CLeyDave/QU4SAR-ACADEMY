// ========== ADMIN SHARED ==========
// Loaded after shared.js on all admin/*.html pages

_flushIcons();

var currentUser=null;
var rtChannel=null;
var _userCacheKey='qsr_admin_user';
function saveUserCache(u){try{localStorage.setItem(_userCacheKey,JSON.stringify(u))}catch(e){}}
function loadUserCache(){try{var r=localStorage.getItem(_userCacheKey);if(r)return JSON.parse(r)}catch(e){}return null}
function clearUserCache(){try{localStorage.removeItem(_userCacheKey)}catch(e){}}
function showLoading(){var el=document.getElementById('loadingOverlay');if(el)el.classList.remove('hidden')}
function hideLoading(){var el=document.getElementById('loadingOverlay');if(el)el.classList.add('hidden')}

var DATA_TABLES=['schedule','team','scrims','members','stats','news','academy','attendance','announcements','curriculum','materials','tasks','task_completions','coach_notes','evaluations','rank_history','attendance_confirmations','substitutions','achievements','member_achievements','quizzes','quiz_responses','groups','coaches','group_coaches','applications','sections'];
var _adminGF='';
var _syncPromise=Promise.resolve(),_lastFocused=null,_pendingLocalSave=false;

function adminGroupFilterHTML(gid,reloadFn){
  var h='<div class="admin-filters" style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:14px">'+
    '<label style="font-size:13px;color:#888">Filtrar por grupo:</label>'+
    '<select class="input-field" onchange="document.getElementById(\'adminGF\').value=this.value;'+reloadFn+'" style="width:auto;min-width:140px;padding:6px 10px;font-size:13px">'+
    '<option value="">Todos</option>';
  (DATA.groups||[]).forEach(function(g){h+='<option value="'+g.id+'" '+(g.id===gid?'selected':'')+'>'+esc(g.name)+'</option>'});
  return h+'</select><input type="hidden" id="adminGF" value="'+esc(gid||'')+'"></div>';
}

function coachOptions(selected,groupId){
  var cids=(DATA.group_coaches||[]).filter(function(g){return g.group_id===groupId}).map(function(g){return g.coach_id});
  var list=groupId&&cids.length? (DATA.coaches||[]).filter(function(c){return cids.indexOf(c.id)>=0}) : (DATA.coaches||[]);
  return list.map(function(c){return'<option value="'+esc(c.name)+'" '+(c.name===selected?'selected':'')+'>'+esc(c.name)+(c.nickname?' ('+esc(c.nickname)+')':'')+'</option>'}).join('');
}

function reloadCoachDropdown(selectId,groupId){
  var el=document.getElementById(selectId);
  if(!el)return;
  el.innerHTML='<option value="">Sin coach</option>'+coachOptions(el.value,groupId);
}

function setGroupFromCoach(groupSel,coachSel){
  var cn=document.getElementById(coachSel)?.value;
  if(!cn)return;
  var c=(DATA.coaches||[]).find(function(c){return c.name===cn});
  if(!c)return;
  var gs=(DATA.group_coaches||[]).filter(function(g){return g.coach_id===c.id});
  if(gs.length===1)document.getElementById(groupSel).value=gs[0].group_id;
}

async function syncToDB(){
  await _syncPromise;
  var p=syncToDB_();
  _syncPromise=p.catch(function(e){console.error('syncToDB falló:',e)});
  return p;
}

async function syncToDB_(){
  if(!db){toast('Sin conexión a Supabase','err');return}
  var okCount=0,errCount=0;
  for(var i=0;i<DATA_TABLES.length;i++){
    var t=DATA_TABLES[i],items=DATA[t]||[];
    if(t==='task_completions')continue;
    try{
      if(t==='schedule')var mapped=items.map(function(s){return{id:s.id,title:s.title,day:s.day,start_time:s.start||s.start_time,end_time:s.end||s.end_time,type:s.type,group_id:s.group_id||'',coach:s.coach||''}});
      else if(t==='scrims')var mapped=items.map(function(s){return{id:s.id,opponent:s.opponent||'',our_score:s.our||0,opponent_logo:s.opponent_logo||'',opponent_score:s.opponent_score||0,result:s.result,date:s.date,group_id:s.group_id||'',coach:s.coach||''}});
      else if(t==='tasks')var mapped=items.map(function(s){return{id:s.id,title:s.title,description:s.description||'',type:s.type,due_date:s.due_date||'',group_id:s.group_id||'',coach:s.coach||'',image_url:s.image_url||'',attachment_url:s.attachment_url||'',attachment_name:s.attachment_name||''}});
      else if(t==='attendance'){
        var validSch=new Set((DATA.schedule||[]).map(function(s){return s.id}));
        var mapped=items.filter(function(a){return a.schedule_id&&validSch.has(a.schedule_id)});
      }
      else if(t==='group_coaches'){
        mapped=items.map(function(s){return{group_id:s.group_id,coach_id:s.coach_id}});
        var seen=new Set();
        mapped=mapped.filter(function(m){if(!m.group_id||!m.coach_id)return false;var k=m.group_id+'|'+m.coach_id;if(seen.has(k))return false;seen.add(k);return true});
        var {data:existing}=await db.from(t).select('id,group_id,coach_id');
        var existingSet=new Set((existing||[]).map(function(e){return e.group_id+'|'+e.coach_id}));
        for(var j=0;j<(existing||[]).length;j++){
          var e=existing[j];
          if(!mapped.some(function(m){return m.group_id===e.group_id&&m.coach_id===e.coach_id}))
            await db.from(t).delete().eq('id',e.id);
        }
        for(var j=0;j<mapped.length;j++){
          if(!existingSet.has(mapped[j].group_id+'|'+mapped[j].coach_id))
            await db.from(t).insert(mapped[j]);
        }
        okCount++;continue;
      }
      else if(t==='materials'){var validSchIds=new Set((DATA.schedule||[]).map(function(s){return s.id}));var fallbackSchId=DATA.schedule&&DATA.schedule.length?DATA.schedule[0].id:null;var mapped=items.map(function(m){var sid=m.schedule_id;if(!sid||!validSchIds.has(sid))sid=fallbackSchId;return{...m,schedule_id:sid}})}
      else var mapped=items.slice();
      var {data:existing}=await db.from(t).select('id');
      var existingIds=(existing||[]).map(function(x){return x.id});
      var localIds=mapped.map(function(x){return x.id});
      for(var j=0;j<existingIds.length;j++){
        if(localIds.indexOf(existingIds[j])<0)
          await db.from(t).delete().eq('id',existingIds[j]);
      }
      if(mapped.length){
        await db.from(t).upsert(mapped,{onConflict:'id'});
      }
      okCount++;
    }catch(e){
      console.log('Sync error ['+t+']:',e);
      errCount++;
    }
  }
  try{
    if(DATA.content&&DATA.content.home){
      var {data:existingContent}=await db.from('content').select('key');
      var existingKeys=(existingContent||[]).map(function(x){return x.key});
      var localKeys=Object.keys(DATA.content.home);
      for(var j=0;j<existingKeys.length;j++){
        if(localKeys.indexOf(existingKeys[j])<0)
          await db.from('content').delete().eq('key',existingKeys[j]);
      }
      for(var k in DATA.content.home)
        await db.from('content').upsert({key:k,value:DATA.content.home[k]},{onConflict:'key'});
    }
    okCount++;
  }catch(e){console.log('Sync error [content]:',e);errCount++}
  if(errCount)toast('Sincronizado con '+errCount+' error(es). Revisa la consola (F12)','err');
  else if(okCount>0)toast('Datos sincronizados con la nube','ok');
}

async function saveData(d){
  try{localStorage.setItem(SK,JSON.stringify(d))}catch(e){}
  _pendingLocalSave=true;
  await syncToDB();
  setTimeout(function(){_pendingLocalSave=false},2000);
}

const SK='quasar_admin_data';

function defData(){return{
  schedule:[],team:[],scrims:[],members:[],stats:[],news:[],academy:[],
  applications:[],attendance:[],announcements:[],curriculum:[],materials:[],
  tasks:[],task_completions:[],coach_notes:[],evaluations:[],rank_history:[],
  attendance_confirmations:[],substitutions:[],achievements:[],
  member_achievements:[],quizzes:[],quiz_responses:[],
  groups:[{id:'g1',name:'Grupo 1',description:'Hierro a Oro'},{id:'g2',name:'Grupo 2',description:'Platino a Radiante'}],
  coaches:[],group_coaches:[],content:{home:{}},schedule_history:[]
}}

function getData(){
  try{
    var r=localStorage.getItem(SK);
    if(r){
      var p=JSON.parse(r);
      var d=defData();
      for(var k in d){
        if(p[k]===undefined)p[k]=d[k];
        if(k==='groups'&&(!p.groups||!p.groups.length))p.groups=d.groups.slice();
        if(k==='content'&&typeof p.content==='object'&&typeof d.content==='object'){
          for(var ck in d.content){
            if(p.content[ck]===undefined)p.content[ck]=d.content[ck];
          }
        }
      }
      return p;
    }
  }catch(e){}
  var d=defData();saveData(d);return d
}

var DATA;

async function doLogin(){
  var email=document.getElementById('loginEmail').value.trim();
  var pass=document.getElementById('loginPass').value;
  var btn=document.getElementById('loginBtn');
  var e=document.getElementById('loginError');
  if(!email||!pass){e.textContent='Ingresa email y contraseña';e.style.display='block';return}
  btn.disabled=true;btn.innerHTML='<i data-lucide="loader" style="width:18px;height:18px;animation:spin 1s linear infinite"></i> Verificando...'
  try{
    if(!db)db=supabase.createClient(SB,ANON,{auth:{persistSession:true}});
    var {data,error}=await db.auth.signInWithPassword({email,password:pass});
    if(error){
      var {data:adminRows}=await db.from('admins').select('role,email,active').eq('email',email).limit(1);
      if(!adminRows||!adminRows.length||!adminRows[0].active){
        e.textContent='No tienes permisos de administrador';e.style.display='block';
        btn.disabled=false;btn.innerHTML='<i data-lucide="shield" style="width:18px;height:18px"></i> Ingresar';
        document.getElementById('loginPass').value='';
        return;
      }
      // Autorizado pero puede ser primera vez (no hay auth user aún)
      var {error:signUpError}=await db.auth.signUp({email,password:pass});
      if(signUpError){
        // Ya existe auth user → contraseña incorrecta
        e.textContent='Contraseña incorrecta';e.style.display='block';
        btn.disabled=false;btn.innerHTML='<i data-lucide="shield" style="width:18px;height:18px"></i> Ingresar';
        document.getElementById('loginPass').value='';
        return;
      }
      // Primera vez: signUp creó el auth user, intentar login de nuevo
      var retry=await db.auth.signInWithPassword({email,password:pass});
      if(retry.error){
        e.innerHTML='Cuenta creada. Revisa tu correo para confirmar y luego inicia sesi&oacute;n.';e.style.display='block';
        btn.disabled=false;btn.innerHTML='<i data-lucide="shield" style="width:18px;height:18px"></i> Ingresar';
        return;
      }
      data=retry.data;
    }
    var {data:userRows,error:userErr}=await db.from('admins').select('role,email,active').eq('email',email).limit(1);
    if(userErr)throw userErr;
    if(!userRows||!userRows.length||!userRows[0].active){
      if(db)try{db.auth.signOut()}catch(ee){}
      e.textContent='No tienes permisos de administrador';e.style.display='block';
      btn.disabled=false;btn.innerHTML='<i data-lucide="shield" style="width:18px;height:18px"></i> Ingresar';
      document.getElementById('loginPass').value='';
      return;
    }
    var mappedRole=userRows[0].role==='owner'?'admin':'coach';
    currentUser={id:data.user.id,email:email,role:mappedRole,name:userRows[0].email||''};
    saveUserCache(currentUser);
    await loadAdminData();
  }catch(ee){
    e.textContent=ee.message||'Error de autenticación';e.style.display='block';
    btn.disabled=false;btn.innerHTML='<i data-lucide="shield" style="width:18px;height:18px"></i> Ingresar';
    document.getElementById('loginPass').value='';
  }
}

async function loadAdminData(){
  var e=document.getElementById('loginError');
  var btn=document.getElementById('loginBtn');
  try{
    var [sch,te,sc,mem,st,ne,ac,con,sec,apps,att,ann,cur,mat,tks,tc,cn,ev,rh,acf,sub,ach,ma,co,gr,gco]=await Promise.all([
      db.from('schedule').select('*'),db.from('team').select('*'),
      db.from('scrims').select('*').order('date',{ascending:false}),
      db.from('members').select('*'),
      db.from('stats').select('*'),db.from('news').select('*').order('date',{ascending:false}),
      db.from('academy').select('*'),db.from('content').select('*'),db.from('sections').select('*'),
      db.from('applications').select('*').order('created_at',{ascending:false}),
      db.from('attendance').select('*').order('date',{ascending:false}),
      db.from('announcements').select('*').order('created_at',{ascending:false}),
      db.from('curriculum').select('*').order('week',{ascending:true}),
      db.from('materials').select('*'),db.from('tasks').select('*'),db.from('task_completions').select('*'),
      db.from('coach_notes').select('*'),db.from('evaluations').select('*'),
      db.from('rank_history').select('*'),db.from('attendance_confirmations').select('*'),
      db.from('substitutions').select('*'),db.from('achievements').select('*'),
      db.from('member_achievements').select('*'),
      db.from('coaches').select('*'),
      db.from('groups').select('*'),
      db.from('group_coaches').select('*'),
    ]);
    var qz={data:[]};try{var r=await db.from('quizzes').select('*');if(r)qz=r}catch(e){}
    var qr={data:[]};try{var r=await db.from('quiz_responses').select('*');if(r)qr=r}catch(e){}
    DATA={};
    DATA_TABLES.forEach(function(t){DATA[t]=[]});
    DATA.applications=[];
    var localData=getData();
    DATA_TABLES.forEach(function(t){if(localData[t]&&localData[t].length)DATA[t]=localData[t].slice()});
    if(localData.content)DATA.content=JSON.parse(JSON.stringify(localData.content));
    if(DATA.group_coaches&&DATA.group_coaches.length){
      var gs=new Set();
      DATA.group_coaches=DATA.group_coaches.filter(function(gc){var k=gc.group_id+'|'+gc.coach_id;if(gs.has(k))return false;gs.add(k);return true});
    }
    if(sch.data&&sch.data.length)DATA.schedule=sch.data.map(function(x){var st=String(x.start_time||x.start||'').slice(0,5),et=String(x.end_time||x.end||'').slice(0,5);return{id:x.id,title:x.title,day:x.day,start:st,end:et,type:x.type,coach:x.coach||'',group_id:x.group_id||''}});
    if((!sch.data||!sch.data.length)&&DATA.schedule.length&&!localStorage.getItem('qsr_sched_migrated')){
      DATA.schedule=DATA.schedule.map(function(s){s.day=(s.day+6)%7;return s});
      localStorage.setItem('qsr_sched_migrated','1');
    }
    (DATA.schedule||[]).forEach(function(s){
      if(s.coach&&!s.group_id){
        var c=(DATA.coaches||[]).find(function(c){return c.name===s.coach});
        if(c){
          var gs=(DATA.group_coaches||[]).filter(function(g){return g.coach_id===c.id});
          if(gs.length===1)s.group_id=gs[0].group_id;
        }
      }
    });
    DATA.schedule.forEach(function(s){if(!s.week_start)s.week_start=getCurrentWeekStart()});
    if(te.data&&te.data.length)DATA.team=te.data;
    if(sc.data&&sc.data.length){
      var localScrims=(localData.scrims||[]).reduce(function(acc,s){acc[s.id]=s;return acc},{});
      DATA.scrims=sc.data.map(function(x){
        var loc=localScrims[x.id]||{};
        return{
          id:x.id,opponent:x.opponent||loc.opponent||'',opponent_logo:x.opponent_logo||loc.opponent_logo||'',
          our:typeof x.our_score==='number'?x.our_score:(typeof loc.our==='number'?loc.our:0),
          opponent_score:typeof x.opponent_score==='number'?x.opponent_score:(typeof loc.opponent_score==='number'?loc.opponent_score:0),
          result:x.result||loc.result||'Pendiente',date:x.date||loc.date||'',
          coach:x.coach||loc.coach||'',group_id:x.group_id||loc.group_id||''
        };
      });
    }
    if(mem.data&&mem.data.length)DATA.members=mem.data;
    if(st.data&&st.data.length)DATA.stats=st.data;
    if(ne.data&&ne.data.length)DATA.news=ne.data;
    if(ac.data&&ac.data.length)DATA.academy=ac.data;
    if(apps.data&&apps.data.length)DATA.applications=apps.data;
    if(att.data&&att.data.length)DATA.attendance=att.data;
    if(ann.data&&ann.data.length)DATA.announcements=ann.data;
    if(cur.data&&cur.data.length)DATA.curriculum=cur.data;
    if(mat.data&&mat.data.length)DATA.materials=mat.data;
    if(tks.data&&tks.data.length)DATA.tasks=tks.data;
    if(tc.data&&tc.data.length)DATA.task_completions=tc.data;
    if(cn.data&&cn.data.length)DATA.coach_notes=cn.data;
    if(ev.data&&ev.data.length)DATA.evaluations=ev.data;
    if(rh.data&&rh.data.length)DATA.rank_history=rh.data;
    if(acf.data&&acf.data.length)DATA.attendance_confirmations=acf.data;
    if(sub.data&&sub.data.length)DATA.substitutions=sub.data;
    if(ach.data&&ach.data.length)DATA.achievements=ach.data;
    if(ma.data&&ma.data.length)DATA.member_achievements=ma.data;
    if(qz&&qz.data&&qz.data.length)DATA.quizzes=qz.data;
    if(qr&&qr.data&&qr.data.length)DATA.quiz_responses=qr.data;
    if(co&&co.data&&co.data.length)DATA.coaches=co.data;
    if(gr&&gr.data&&gr.data.length)DATA.groups=gr.data;
    if(gco&&gco.data&&gco.data.length)DATA.group_coaches=gco.data;
    if(DATA.group_coaches&&DATA.group_coaches.length){
      var gs2=new Set();
      DATA.group_coaches=DATA.group_coaches.filter(function(gc){var k=gc.group_id+'|'+gc.coach_id;if(gs2.has(k))return false;gs2.add(k);return true});
    }
    if(!DATA.content)DATA.content={};
    if(!DATA.content.home)DATA.content.home={};
    if(con.data)con.data.forEach(function(c){DATA.content.home[c.key]=c.value});
    
    var seedIds={schedule:/^s\d+$/,team:/^t\d+$/,scrims:/^r\d+$/,members:/^m\d+$/,stats:/^st\d+$/};
    var hasSeed=false;
    DATA_TABLES.forEach(function(t){
      if(!seedIds[t])return;
      var before=DATA[t].length;
      DATA[t]=(DATA[t]||[]).filter(function(item){return!seedIds[t].test(item.id)});
      if(DATA[t].length<before)hasSeed=true;
    });
    if(hasSeed){localStorage.setItem(SK,JSON.stringify(DATA));await syncToDB();toast('Datos de ejemplo eliminados automáticamente','info')}
    
    localStorage.setItem(SK,JSON.stringify(DATA));
    if(sec.data){var v={};sec.data.forEach(function(s){v[s.id]=s.visible});localStorage.setItem('qsr_sections',JSON.stringify(v))}
  }catch(ee){console.log('loadAdminData failed:',ee);hideLoading();DATA=getData();var ds=document.getElementById('adminDbStatus');if(ds){ds.innerHTML='<i data-lucide="wifi-off" style="width:12px;height:12px;vertical-align:middle"></i> <span>desconectado</span>';ds.className='err';_flushIcons()}}
  saveUserCache(currentUser);
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('adminPanel').classList.add('active');
  document.querySelector('.admin').classList.add('active');
  e.style.display='none';
  btn.disabled=false;btn.innerHTML='<i data-lucide="shield" style="width:18px;height:18px"></i> Ingresar';
  currentUser.coachName='';
  if(currentUser.role==='coach'&&currentUser.email){
    var coachMatch=(DATA.coaches||[]).find(function(c){return c.email&&c.email.toLowerCase()===currentUser.email.toLowerCase()});
    if(coachMatch){currentUser.coachName=coachMatch.name}
  }
  if(currentUser.coachName)console.log('Filtro coach activo:',currentUser.coachName);
  if(!isCurrentUserAdmin()){
    var sidebar=document.getElementById('adminSidebar');
    if(sidebar){
      var adminItems=sidebar.querySelectorAll('[id^="sidebar_"]');
      adminItems.forEach(function(el){el.style.display='none'});
    }
  }
  if(autoCopySchedule())saveLocal(DATA);
  var pageMatch=window.location.pathname.match(/\/(\w+)\.html$/);
  var pageName=pageMatch?pageMatch[1]:'dashboard';
  var pageGroupMap={dashboard:{group:'panel',section:'dashboard'},gestion:{group:'gestion',section:'team'},academia:{group:'academia',section:'schedule'},comunicacion:{group:'comunicacion',section:'news'},operaciones:{group:'operaciones',section:'substitutions'},logros:{group:'logros',section:'achievements'},sistema:{group:'sistema',section:'content'}};
  var pm=pageGroupMap[pageName]||{group:pageName,section:pageName};
  renderAdminShell(pageName.charAt(0).toUpperCase()+pageName.slice(1),pm.group,pm.section);
  refresh();
  var ds=document.getElementById('adminDbStatus');
  if(ds){ds.innerHTML='<i data-lucide="wifi" style="width:12px;height:12px;vertical-align:middle"></i> <span>conectado</span>';ds.className='ok';_flushIcons()}
  hideLoading();
  toast('Bienvenido, '+currentUser.email,'ok');
  await syncToDB();
  try{
    var _rtTimer=null;
    rtChannel=db.channel('admin-changes')
      .on('postgres_changes',{event:'*',schema:'public'},function(payload){
        var table=payload.table,ev=payload.eventType;
        if(_pendingLocalSave)return;
        if(table==='content'||table==='sections'||DATA_TABLES.includes(table)){
          if(table==='applications'&&ev==='INSERT')toast(ic('user-plus',14)+' Nueva inscripción recibida','info');
          // Usar payload.new en lugar de getData()
          if(ev==='DELETE'){
            var oldId=payload.old&&payload.old.id;
            if(oldId&&Array.isArray(DATA[table]))DATA[table]=DATA[table].filter(function(r){return r.id!==oldId});
          }else if(ev==='INSERT'||ev==='UPDATE'){
            var rec=payload.new;
            if(!rec)return;
            if(table==='schedule'){
              var st=String(rec.start_time||rec.start||'').slice(0,5),et=String(rec.end_time||rec.end||'').slice(0,5);
              rec={id:rec.id,title:rec.title,day:rec.day,start:st,end:et,type:rec.type,coach:rec.coach||'',group_id:rec.group_id||''};
            }else if(table==='scrims'){
              rec={id:rec.id,opponent:rec.opponent,opponent_logo:rec.opponent_logo||'',our:rec.our_score,opponent_score:rec.opponent_score,result:rec.result,date:rec.date,coach:rec.coach||'',group_id:rec.group_id||''};
            }else if(table==='members'){
              var _ex=['hs_percent','kd','dpr','course','riot_id','region','tracker_url','country','cover','discord','youtube','twitter','twitch','dpi','sens','scoped_sens','hz','raw_input'];
              var oldM=(DATA.members||[]).find(function(m){return m.id===rec.id});
              if(oldM)_ex.forEach(function(k){if(rec[k]===undefined||rec[k]===null)rec[k]=oldM[k]});
            }
            if(ev==='UPDATE'&&Array.isArray(DATA[table])){
              var idx=DATA[table].findIndex(function(r){return r.id===rec.id});
              if(idx>=0)DATA[table][idx]=rec;else DATA[table].push(rec);
            }else if(ev==='INSERT'&&Array.isArray(DATA[table])){
              DATA[table].push(rec);
            }
          }
          if(_rtTimer)clearTimeout(_rtTimer);
          _rtTimer=setTimeout(function(){refresh();_rtTimer=null},150);
        }
      }).subscribe();
  }catch(e){console.log('Realtime subscribe error:',e)}
}

function logout(){
  DATA=null;
  if(rtChannel)try{rtChannel.unsubscribe()}catch(e){}
  rtChannel=null;
  currentUser=null;
  clearUserCache();
  if(db)try{db.auth.signOut()}catch(e){}
  db=null;
  document.getElementById('adminPanel').classList.remove('active');
  document.querySelector('.admin').classList.remove('active');
  document.getElementById('loginScreen').classList.remove('hidden');
  document.getElementById('loginEmail').value='';
  document.getElementById('loginPass').value='';
  document.getElementById('loginEmail').focus();
  var sw=document.querySelector('.admin-page-switcher');
  if(sw)sw.remove();
  toast('Sesión cerrada','info');
}

async function checkSession(){
  showLoading();
  var cached=loadUserCache();
  if(cached){
    currentUser=cached;
    try{
      if(!db)db=supabase.createClient(SB,ANON,{auth:{persistSession:true}});
      await db.auth.getSession();
    }catch(e){}
    await loadAdminData();
    try{
      var {data:{session}}=await db.auth.getSession();
      if(session&&session.user){
        var {data:userRows}=await db.from('admins').select('role,email,active').eq('email',session.user.email).limit(1);
        if(userRows&&userRows.length&&userRows[0].active){
          var mappedRole=userRows[0].role==='owner'?'admin':'coach';
          currentUser={id:session.user.id,email:session.user.email,role:mappedRole,name:userRows[0].email||''};
          saveUserCache(currentUser);
          currentUser.coachName='';
          if(currentUser.role==='coach'&&currentUser.email){
            var coachMatch=(DATA.coaches||[]).find(function(c){return c.email&&c.email.toLowerCase()===currentUser.email.toLowerCase()});
            if(coachMatch)currentUser.coachName=coachMatch.name;
          }
          var ds=document.getElementById('adminDbStatus');
          if(ds){ds.innerHTML='<i data-lucide="wifi" style="width:12px;height:12px;vertical-align:middle"></i> <span>conectado</span>';ds.className='ok';_flushIcons()}
          updateCounts();
          return;
        }
      }
      clearUserCache();currentUser=null;DATA=null;
      document.getElementById('adminPanel').classList.remove('active');
      document.querySelector('.admin').classList.remove('active');
      document.getElementById('loginScreen').classList.remove('hidden');
    }catch(e){}
    return;
  }
  try{
    if(!db)db=supabase.createClient(SB,ANON,{auth:{persistSession:true}});
    var {data:{session}}=await db.auth.getSession();
    if(session&&session.user){
      var {data:userRows}=await db.from('admins').select('role,email,active').eq('email',session.user.email).limit(1);
      if(userRows&&userRows.length&&userRows[0].active){
        var mappedRole=userRows[0].role==='owner'?'admin':'coach';
        currentUser={id:session.user.id,email:session.user.email,role:mappedRole,name:userRows[0].email||''};
        saveUserCache(currentUser);
        await loadAdminData();
        return;
      }
    }
  }catch(e){}
  hideLoading();
  document.getElementById('loginScreen').classList.remove('hidden');
}

function mediaPreview(u){return u?'<div style="margin-top:6px"><img src="'+esc(u)+'" style="max-width:120px;border-radius:6px;border:1px solid rgba(255,255,255,0.1)"></div>':''}
function dc(){return currentUser&&currentUser.coachName||''}
function isCurrentUserAdmin(){return currentUser&&currentUser.role==='admin'}
function hasRole(role){return currentUser&&currentUser.role===role}
function requireRole(role){if(!hasRole(role)){toast('No tienes permisos para esta acción','err');return false}return true}
function filterByCurrentCoach(items){
  if(!currentUser||!currentUser.coachName)return items;
  return (items||[]).filter(function(item){return !item.coach||item.coach===currentUser.coachName});
}
function rankValue(r){
  var tiers={Hierro:0,Bronce:100,Plata:200,Oro:300,Platino:400,Diamante:500,Ascendente:600,Inmortal:700,Radiante:800};
  var parts=(r||'').split(' ');
  var base=tiers[parts[0]];
  if(base===undefined)return -1;
  var sub=parts[1]?parseInt(parts[1])||0:0;
  return base+sub;
}

// ========== MODAL ==========
function closeModal(){
  document.getElementById('modalOverlay').classList.remove('active');
  document.body.style.overflow='';
  if(_lastFocused)_lastFocused.focus();
}
function openModal(html){
  _lastFocused=document.activeElement;
  document.getElementById('modalBox').innerHTML=html;
  document.getElementById('modalOverlay').classList.add('active');
  document.body.style.overflow='hidden';
  _flushIcons();
  setTimeout(function(){
    var box=document.getElementById('modalBox');
    if(box){
      var first=box.querySelector('input,select,textarea,button,[tabindex]:not([tabindex="-1"])');
      if(first)first.focus();
    }
  },100);
}
function confirmDel(msg){return confirm(msg||'¿Eliminar este elemento?')}

document.addEventListener('keydown',function(e){
  if(e.key==='Escape'){
    var ov=document.getElementById('modalOverlay');
    if(ov&&ov.classList.contains('active'))closeModal();
  }
});

// ========== CONTENT EDITOR ==========
function renderContentEdit(){
  var c=DATA.content&&DATA.content.home||{};
  document.getElementById('adminContent').innerHTML='<p style="color:#888;font-size:13px;margin-bottom:20px">Edita el contenido y configuración del sitio web.</p>'+
    '<div class="glass-card" style="padding:28px;max-width:600px;margin-bottom:16px">'+
    '<h3 style="font-family:var(--font-display);font-size:14px;margin-bottom:16px">'+ic('type',16)+' Contenido Principal</h3>'+
    '<div class="content-editor">'+
    [{k:'hero_title',l:'Título del Hero'},{k:'hero_subtitle',l:'Subtítulo'},{k:'hero_desc',l:'Descripción'},{k:'site_tagline',l:'Tagline'}].map(function(f){return'<div class="field"><label for="cf_'+f.k+'">'+f.l+'</label><input class="input-field" id="cf_'+f.k+'" value="'+esc(c[f.k]||'')+'"></div>'}).join('')+
    '</div></div>'+
    '<div class="glass-card" style="padding:28px;max-width:600px;margin-bottom:16px">'+
    '<h3 style="font-family:var(--font-display);font-size:14px;margin-bottom:16px">'+ic('image',16)+' Imágenes</h3>'+
    '<div class="content-editor">'+
    [{k:'logo_url',l:'URL del Logo'},{k:'banner_bg',l:'URL Fondo Hero (opcional)'}].map(function(f){return'<div class="field"><label for="cf_'+f.k+'">'+f.l+'</label><input class="input-field" id="cf_'+f.k+'" value="'+esc(c[f.k]||'')+'"></div>'}).join('')+
    '</div></div>'+
    '<div class="glass-card" style="padding:28px;max-width:600px;margin-bottom:16px">'+
    '<h3 style="font-family:var(--font-display);font-size:14px;margin-bottom:16px">'+ic('link',16)+' Redes Sociales</h3>'+
    '<div class="content-editor">'+
    [{k:'social_twitch',l:'Twitch'},{k:'social_youtube',l:'YouTube'},{k:'social_twitter',l:'Twitter / X'},{k:'social_instagram',l:'Instagram'}].map(function(f){return'<div class="field"><label for="cf_'+f.k+'">'+f.l+'</label><input class="input-field" id="cf_'+f.k+'" value="'+esc(c[f.k]||'')+'"></div>'}).join('')+
    '</div></div>'+
    '<div class="glass-card" style="padding:28px;max-width:600px;margin-bottom:16px">'+
    '<h3 style="font-family:var(--font-display);font-size:14px;margin-bottom:16px">'+ic('file-text',16)+' Términos y Condiciones</h3>'+
    '<div class="content-editor">'+
    '<div class="field"><label for="cf_terms_title">Título de Términos</label><input class="input-field" id="cf_terms_title" value="'+esc(c.terms_title||'')+'"></div>'+
    '<div class="field"><label for="cf_terms_content">Contenido de Términos</label><textarea class="input-field" id="cf_terms_content" rows="12" style="resize:vertical;font-size:13px;line-height:1.6">'+esc(c.terms_content||'')+'</textarea></div>'+
    '</div></div>'+
    '<button class="btn-primary" onclick="saveContent()" style="margin-top:4px">'+ic('save',16)+' Guardar Cambios</button>';
}
function saveContent(){
  if(!DATA.content)DATA.content={};if(!DATA.content.home)DATA.content.home={};
  ['hero_title','hero_subtitle','hero_desc','site_tagline','logo_url','banner_bg','social_twitch','social_youtube','social_twitter','social_instagram','terms_title','terms_content'].forEach(function(k){var el=document.getElementById('cf_'+k);if(el)DATA.content.home[k]=el.value});
  saveData(DATA);
  toast('Contenido actualizado');
}

// ========== GENERIC TABLE ==========
function adminTable(items,columns,renderRow,emptyMsg,addBtn){
  return (addBtn||'')+(items.length?'<div class="table-wrap glass-card"><table class="admin-table"><thead><tr>'+columns.map(function(c){return'<th>'+esc(c)+'</th>'}).join('')+'<th style="text-align:right">Acción</th></tr></thead><tbody>'+items.map(function(item,i){return'<tr>'+renderRow(item,i)+'</tr>'}).join('')+'</tbody></table></div>':'<div class="empty-state"><div class="icon">'+ic('clipboard-list',32)+'</div><p>'+emptyMsg+'</p></div>');
}

// ========== FILE UPLOAD ==========
function uploadStatusHTML(msg,type){
  var c=type==='ok'?'ok':type==='err'?'err':'';
  return'<span class="file-upload-name'+(c?' '+c:'')+'">'+msg+'</span>';
}
function fileUploadHTML(label,accept,statusId,urlFieldId,currentValue){
  var id='fu_'+statusId;
  return'<div class="file-upload">'+
    '<label class="file-upload-btn" for="'+id+'">'+
      '<span class="icon">'+ic('upload',14)+'</span> '+esc(label)+
      '<input type="file" id="'+id+'" accept="'+accept+'" onchange="uploadFile(this,\''+statusId+'\',\''+urlFieldId+'\')">'+
    '</label>'+
    '<span id="'+statusId+'"></span>'+
    '</div>'+
    '<input class="input-field" id="'+urlFieldId+'" placeholder="O pega URL directamente" value="'+esc(currentValue||'')+'">';
}
function uploadFile(input,statusId,urlFieldId){
  var status=document.getElementById(statusId);
  var file=input.files[0];
  if(!file)return;
  if(statusId.indexOf('_img_')>=0){if(!file.type.startsWith('image/')){status.innerHTML=uploadStatusHTML('Solo se permiten imágenes','err');return}}
  else if(file.type!=='application/pdf'){status.innerHTML=uploadStatusHTML('Solo se permiten archivos PDF','err');return}
  if(!db||!db.storage){status.innerHTML=uploadStatusHTML('Storage no disponible','err');return}
  status.innerHTML=uploadStatusHTML('Subiendo... '+ic('loader',14));
  _flushIcons();
  var ext=file.name.split('.').pop().toLowerCase();
  var folder=file.type.startsWith('image/')?'images':'documents';
  var path=folder+'/'+Date.now()+'_'+file.name;
  db.storage.from('media-images').upload(path,file).then(function(res){
    if(res.error)throw res.error;
    var {data:{publicUrl}}=db.storage.from('media-images').getPublicUrl(path);
    document.getElementById(urlFieldId).value=publicUrl;
    status.innerHTML=uploadStatusHTML('? Subido: '+esc(file.name),'ok');
  }).catch(function(err){
    var msg='Error: '+err.message;
    if(err.message&&err.message.indexOf('mime type')>=0)msg='Tipo de archivo no soportado. Actualiza el bucket en Supabase Dashboard > Storage > media-images > allowedMimeTypes';
    status.innerHTML=uploadStatusHTML(msg,'err');
  });
}

// ========== SECTIONS ==========
var ALL_SECTIONS=[
  {id:'schedule',label:'Horarios',icon:ic('calendar',16)},
  {id:'academy',label:'Academia',icon:ic('graduation-cap',16)},
  {id:'team',label:'Equipo Premier',icon:ic('trophy',16)},
  {id:'scrims',label:'Scrims',icon:ic('crosshair',16)},
  {id:'stats',label:'Estadísticas',icon:ic('bar-chart-3',16)},
  {id:'news',label:'Noticias',icon:ic('newspaper',16)},
  {id:'members',label:'Miembros',icon:ic('users',16)},
  {id:'register',label:'Inscripción',icon:ic('edit-3',16)},
  {id:'attendance',label:'Asistencia',icon:ic('clipboard-check',16)},
  {id:'announcements',label:'Anuncios',icon:ic('megaphone',16)},
  {id:'curriculum',label:'Plan Estudio',icon:ic('book-open',16)},
  {id:'tasks',label:'Tareas',icon:ic('check-square',16)},
  {id:'substitutions',label:'Suplentes',icon:ic('user-plus',16)},
];
function getSections(){try{var r=localStorage.getItem('qsr_sections');if(r)return JSON.parse(r)}catch(e){}var d={};ALL_SECTIONS.forEach(function(s){d[s.id]=true});localStorage.setItem('qsr_sections',JSON.stringify(d));return d}
function saveSections(d){
  try{localStorage.setItem('qsr_sections',JSON.stringify(d))}catch(e){}
  if(!db)return;
  (async function(){
    var {data:existing}=await db.from('sections').select('id');
    var existingIds=(existing||[]).map(function(x){return x.id});
    var rows=[];for(var k in d)rows.push({id:k,visible:d[k]});
    var localIds=rows.map(function(x){return x.id});
    for(var j=0;j<existingIds.length;j++)
      if(localIds.indexOf(existingIds[j])<0)
        await db.from('sections').delete().eq('id',existingIds[j]);
    if(rows.length)
      await db.from('sections').upsert(rows,{onConflict:'id'});
  })();
}
function renderSection_sections(){
  var vis=getSections();
  document.getElementById('adminContent').innerHTML='<p style="color:#888;font-size:13px;margin-bottom:20px">Activa o desactiva secciones completas de la página pública. Lo oculto no se renderiza.</p><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px">'+
    ALL_SECTIONS.map(function(s){
      var on=vis[s.id]!==false;
      return '<div class="glass-card" style="padding:20px;display:flex;align-items:center;justify-content:space-between;gap:12px">'+
        '<div><span style="font-size:24px;margin-right:8px">'+s.icon+'</span><span style="font-weight:500;font-size:14px">'+s.label+'</span></div>'+
        '<label style="position:relative;display:inline-block;width:44px;height:24px;flex-shrink:0;cursor:pointer">'+
          '<input type="checkbox" '+(on?'checked':'')+' onchange="toggleSection(event,\''+s.id+'\',this.checked)" style="opacity:0;width:0;height:0">'+
          '<span style="position:absolute;inset:0;background:'+(on?'var(--neon)':'rgba(255,255,255,0.1)')+';border-radius:12px;transition:all 0.3s"></span>'+
          '<span style="position:absolute;top:2px;left:'+(on?'22px':'2px')+';width:20px;height:20px;border-radius:50%;background:#fff;transition:all 0.3s;box-shadow:0 1px 3px rgba(0,0,0,0.3)"></span>'+
        '</label></div>';
    }).join('')+'</div>'+
    '<button class="btn-sm cancel" onclick="localStorage.removeItem(\'qsr_sections\');renderSection_sections();toast(\'Secciones restauradas\')" style="margin-top:12px">? Restaurar todas</button>';
}
function toggleSection(e,id,on){
  var vis=getSections();
  vis[id]=on;
  saveSections(vis);
  toast((on?'Mostrada':'Ocultada')+' sección '+ALL_SECTIONS.find(function(s){return s.id===id}).label);
  var label=e.currentTarget.parentElement;
  var slider=label.querySelector('span:first-of-type');
  var knob=label.querySelector('span:last-of-type');
  slider.style.background=on?'var(--neon)':'rgba(255,255,255,0.1)';
  knob.style.left=on?'22px':'2px';
}

// ========== ADMIN SHELL ==========
var ADMIN_GROUPS=[
  {title:'PANEL',id:'panel',href:'dashboard.html',items:[
    {id:'dashboard',label:'Dashboard',icon:'layout-dashboard',admin:false}
  ]},
  {title:'GESTIÓN',id:'gestion',href:'gestion.html',items:[
    {id:'team',label:'Equipo',icon:'trophy',admin:false,count:'countTeam'},
    {id:'members',label:'Miembros',icon:'users',admin:false,count:'countMembers'},
    {id:'scrims',label:'Scrims',icon:'crosshair',admin:false,count:'countScrims'},
    {id:'stats',label:'Stats',icon:'bar-chart-3',admin:false,count:'countStats'},
    {id:'groups',label:'Grupos',icon:'layers',admin:false,count:'countGroups'},
    {id:'coaches',label:'Coaches',icon:'user-check',admin:true,count:'countCoaches'},
  ]},
  {title:'ACADEMIA',id:'academia',href:'academia.html',items:[
    {id:'schedule',label:'Horarios',icon:'calendar',admin:false,count:'countSchedule'},
    {id:'classes',label:'Clases',icon:'book-open',admin:false,count:'countClasses'},
    {id:'curriculum',label:'Plan',icon:'bookmark',admin:false,count:'countCurriculum'},
    {id:'materials',label:'Materiales',icon:'package',admin:false,count:'countMaterials'},
    {id:'tasks',label:'Tareas',icon:'clipboard-list',admin:false,count:'countTasks'},
    {id:'evals',label:'Evaluaciones',icon:'trending-up',admin:false,count:'countEvals'},
    {id:'quizzes',label:'Quizzes',icon:'help-circle',admin:false,count:'countQuizzes'},
    {id:'coachnotes',label:'Coach Notes',icon:'file-text',admin:false,count:'countCoachNotes'},
    {id:'attendance',label:'Asistencia',icon:'check-square',admin:false,count:'countAttendance'},
  ]},
  {title:'COMUNICACIÓN',id:'comunicacion',href:'comunicacion.html',items:[
    {id:'news',label:'Noticias',icon:'newspaper',admin:false,count:'countNews'},
    {id:'announcements',label:'Anuncios',icon:'megaphone',admin:false,count:'countAnnouncements'},
  ]},
  {title:'OPERACIONES',id:'operaciones',href:'operaciones.html',items:[
    {id:'substitutions',label:'Sustituciones',icon:'user-plus',admin:false,count:'countSubs'},
    {id:'applications',label:'Inscripciones',icon:'clipboard-list',admin:false,count:'countApps'},
  ]},
  {title:'LOGROS',id:'logros',href:'logros.html',items:[
    {id:'achievements',label:'Logros',icon:'award',admin:false,count:'countAchievements'}
  ]},
  {title:'SISTEMA',id:'sistema',href:'sistema.html',items:[
    {id:'content',label:'Contenido',icon:'file-text',admin:true},
    {id:'sections',label:'Secciones',icon:'eye',admin:true},
  ]},
];

function getGroup(id){return ADMIN_GROUPS.find(function(g){return g.id===id})}

function switchAdminSection(groupId,sectionId){
  var nav=document.getElementById('adminSidebar');
  if(nav){
    nav.querySelectorAll('.nav-link.active').forEach(function(el){el.classList.remove('active')});
    var lnk=nav.querySelector('.nav-link[data-section="'+sectionId+'"]');
    if(lnk)lnk.classList.add('active');
  }
  var t0=Date.now();
  showLoading();
  requestAnimationFrame(function(){
    var fn=window['renderSection_'+sectionId];
    if(typeof fn==='function'){fn();_flushIcons();updateCounts()}
    var elapsed=Date.now()-t0;
    var delay=Math.max(0,300-elapsed);
    setTimeout(function(){hideLoading()},delay);
  });
}

function toggleAdminMenu(){
  var nav=document.getElementById('adminSidebar');
  var backdrop=document.getElementById('sidebarBackdrop');
  if(nav){
    nav.classList.toggle('mobile-open');
    if(backdrop)backdrop.classList.toggle('open');
    document.body.style.overflow=nav.classList.contains('mobile-open')?'hidden':'';
  }
}

function closeAdminMenu(){
  var nav=document.getElementById('adminSidebar');
  var backdrop=document.getElementById('sidebarBackdrop');
  if(nav)nav.classList.remove('mobile-open');
  if(backdrop)backdrop.classList.remove('open');
  document.body.style.overflow='';
}

function renderAdminShell(title,activeGroup,activeSection){
  var loginScreen=document.getElementById('loginScreen');
  var adminPanel=document.getElementById('adminPanel');
  if(!currentUser){
    loginScreen.classList.remove('hidden');
    adminPanel.classList.remove('active');
    return;
  }
  loginScreen.classList.add('hidden');
  adminPanel.classList.add('active');
  document.querySelector('.admin').classList.add('active');
  document.getElementById('adminTitle').textContent=title;
  // Add hamburger toggle to header
  var headerLeft=document.querySelector('.admin-header .left');
  if(headerLeft&&!document.getElementById('menuToggleAdmin')){
    var btn=document.createElement('button');
    btn.id='menuToggleAdmin';
    btn.innerHTML='<i data-lucide="menu" style="width:20px;height:20px"></i>';
    btn.title='Menú';
    btn.style.cssText='background:none;border:none;color:#888;cursor:pointer;padding:6px;border-radius:6px;align-items:center;justify-content:center;line-height:1';
    btn.onclick=toggleAdminMenu;
    headerLeft.insertBefore(btn,headerLeft.firstChild);
  }
  // Add backdrop for mobile sidebar
  if(!document.getElementById('sidebarBackdrop')){
    var backdrop=document.createElement('div');
    backdrop.id='sidebarBackdrop';
    backdrop.className='admin-sidebar-backdrop';
    backdrop.onclick=closeAdminMenu;
    (document.querySelector('.admin')||document.body).appendChild(backdrop);
  }
  var nav=document.getElementById('adminSidebar');
  var html='';
  if(activeGroup&&activeGroup!=='panel'){
    var grp=getGroup(activeGroup);
    html+='<a href="dashboard.html" class="nav-link" title="Volver al Dashboard">'+ic('arrow-left',16)+'</a>';
    if(grp)grp.items.forEach(function(item){
      var isActive=item.id===activeSection;
      html+='<a href="javascript:;" class="nav-link'+(isActive?' active':'')+'" data-section="'+item.id+'" '+
        (item.admin?'id="sidebar_'+item.id+'"':'')+
        ' onclick="closeAdminMenu();switchAdminSection(\''+grp.id+'\',\''+item.id+'\')">'+
        ic(item.icon,16)+'<span>'+item.label+'</span>'+
        (item.count?' <span class="count" id="'+item.count+'">0</span>':'')+
        '</a>';
    });
  }else{
    html+='<a href="dashboard.html" class="nav-link'+(activeSection==='dashboard'?' active':'')+'" data-section="dashboard" title="Dashboard">'+ic('layout-dashboard',16)+'<span>Dashboard</span></a>';
    ADMIN_GROUPS.forEach(function(grp){
      if(grp.id==='panel')return;
      var gicon=grp.items&&grp.items[0]?grp.items[0].icon:'circle';
      html+='<a href="'+grp.href+'" class="nav-link">'+ic(gicon,16)+'<span>'+grp.title+'</span></a>';
    });
  }
  html+='<button onclick="closeAdminMenu();logout()" class="sidebar-logout" title="Cerrar sesión">'+ic('log-out',16)+'</button>';
  nav.innerHTML=html;
  if(!isCurrentUserAdmin()){
    var adminItems=nav.querySelectorAll('[id^="sidebar_"]');
    adminItems.forEach(function(el){el.style.display='none'});
  }
  updateCounts();
  _flushIcons();
  // Page switcher
  var sw=document.querySelector('.admin-page-switcher');
  if(!sw){
    sw=document.createElement('div');
    sw.className='admin-page-switcher';
    document.body.appendChild(sw);
  }
  var curPath=window.location.pathname.match(/\/(\w+)\.html$/);
  var curPage=curPath?curPath[1]:'dashboard';
  var pageLinks=[{id:'dashboard',label:'Dashboard',icon:'layout-dashboard',href:'dashboard.html'},{id:'gestion',label:'Gestión',icon:'trophy',href:'gestion.html'},{id:'academia',label:'Academia',icon:'book-open',href:'academia.html'},{id:'comunicacion',label:'Comunicación',icon:'megaphone',href:'comunicacion.html'},{id:'operaciones',label:'Operaciones',icon:'crosshair',href:'operaciones.html'},{id:'logros',label:'Logros',icon:'award',href:'logros.html'},{id:'sistema',label:'Sistema',icon:'settings',href:'sistema.html'}];
  sw.innerHTML=pageLinks.map(function(p){
    var isActive=p.id===curPage;
    return '<a href="'+p.href+'" data-label="'+p.label+'" class="'+(isActive?'active':'')+'">'+ic(p.icon,16)+'</a>';
  }).join('');
  _flushIcons();
}

function updateCounts(){
  var coachName=currentUser&&currentUser.coachName||'';
  var setCount=function(id,val){var el=document.getElementById(id);if(el)el.textContent=val};
  setCount('countNews',filterByCurrentCoach(DATA.news||[]).length);
  setCount('countSchedule',filterByCurrentCoach(DATA.schedule||[]).length);
  setCount('countTeam',(DATA.team||[]).length);
  setCount('countScrims',filterByCurrentCoach(DATA.scrims||[]).length);
  setCount('countMembers',coachName?filterByCurrentCoach(DATA.members||[]).length:(DATA.members||[]).length);
  setCount('countClasses',filterByCurrentCoach(DATA.academy||[]).length);
  setCount('countCurriculum',filterByCurrentCoach(DATA.curriculum||[]).length);
  setCount('countMaterials',filterByCurrentCoach(DATA.materials||[]).length);
  setCount('countTasks',filterByCurrentCoach(DATA.tasks||[]).length);
  setCount('countEvals',filterByCurrentCoach(DATA.evaluations||[]).length);
  setCount('countCoachNotes',filterByCurrentCoach(DATA.coach_notes||[]).length);
  setCount('countQuizzes',filterByCurrentCoach(DATA.quizzes||[]).length);
  setCount('countAttendance',(DATA.attendance||[]).length);
  setCount('countStats',filterByCurrentCoach(DATA.stats||[]).length);
  setCount('countApps',(DATA.applications||[]).length);
  setCount('countAnnouncements',filterByCurrentCoach(DATA.announcements||[]).length);
  setCount('countSubs',filterByCurrentCoach(DATA.substitutions||[]).length);
  setCount('countAchievements',(DATA.achievements||[]).length);
  setCount('countGroups',(DATA.groups||[]).length);
  setCount('countCoaches',(DATA.coaches||[]).length);
}

function refresh(){
  closeAdminMenu();
  var activeLink=document.querySelector('.nav-link.active');
  if(activeLink){
    var sec=activeLink.getAttribute('data-section');
    if(sec){
      var fn=window['renderSection_'+sec];
      if(typeof fn==='function'){fn();_flushIcons();updateCounts()}
    }
  }
}

// ========== INIT ==========
checkSession();
document.getElementById('loginEmail')&&document.getElementById('loginEmail').focus();
initParticles();
initRipple();
