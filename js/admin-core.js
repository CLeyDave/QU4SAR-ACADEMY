// ========== INIT ICONS ==========
if(typeof lucide!=='undefined')lucide.createIcons();

// ========== SUPABASE DB ==========
var currentUser=null;

var DATA_TABLES=['schedule','team','scrims','members','stats','news','academy','attendance','announcements','curriculum','materials','tasks','task_completions','coach_notes','evaluations','rank_history','attendance_confirmations','substitutions','achievements','member_achievements','quizzes','quiz_responses','groups','coaches','group_coaches','applications','sections'];
var _adminGF='';
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

var _syncPromise=Promise.resolve(),_inAcademyTab=false,_quizQCounter=0,_lastFocused=null;
async function syncToDB(){
  console.count('syncToDB');
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
      if(!items.length){var {data:ex}=await db.from(t).select('id');if(ex&&ex.length){for(var j=0;j<ex.length;j++)await db.from(t).delete().eq('id',ex[j].id)}okCount++;continue}
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
        if(t==='scrims')console.log('syncToDB_ scrims data:',JSON.stringify(mapped.map(function(s){return{id:s.id,logo:s.opponent_logo||''}})));
        await db.from(t).upsert(mapped,{onConflict:'id'});
        if(t==='scrims'){var {data:chk}=await db.from(t).select('id,opponent_logo').in('id',mapped.map(function(s){return s.id}));console.log('syncToDB_ scrims VERIFY:',JSON.stringify(chk))}
      }
      okCount++;
    }catch(e){
      console.log('Sync error ['+t+']:',e);
      console.log('Sync error details:',JSON.stringify(e));
      if(t==='group_coaches'){
        console.log('group_coaches data:',JSON.stringify(mapped));
        toast('Error group_coaches: '+(e.message||e.error||e.details||JSON.stringify(e).slice(0,200)),'err');
      }
      if(t==='schedule')console.log('Schedule data:',JSON.stringify(mapped).slice(0,500));
      if(t==='scrims'){console.log('Scrims data with error:',JSON.stringify(mapped));toast('Error scrims: '+(e.message||e.error||e.details||JSON.stringify(e).slice(0,200)),'err')}
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
function saveData(d){
  try{localStorage.setItem(SK,JSON.stringify(d))}catch(e){}
  syncToDB();
}

// ========== DATA ==========
const SK='quasar_admin_data';
function defData(){return{
  schedule:[],team:[],scrims:[],members:[],stats:[],news:[],academy:[],applications:[],attendance:[],announcements:[],curriculum:[],materials:[],tasks:[],task_completions:[],coach_notes:[],evaluations:[],rank_history:[],attendance_confirmations:[],substitutions:[],achievements:[],member_achievements:[],quizzes:[],quiz_responses:[],groups:[{id:'g1',name:'Grupo 1',description:'Hierro a Oro'},{id:'g2',name:'Grupo 2',description:'Platino a Radiante'}],coaches:[],group_coaches:[],content:{home:{}}
}}
function getData(){
  try{
    var r=localStorage.getItem(SK);
    if(r){
      var p=JSON.parse(r);
      var d=defData();
      for(var k in d){
        if(p[k]===undefined)p[k]=d[k];
        // Seed groups if stored as empty array
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
// ========== AUTH ==========
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
      // Auth login failed — try creating user via signUp for first-time setup
      var {data:adminRows}=await db.from('admins').select('role,email,active').eq('email',email).limit(1);
      if(adminRows&&adminRows.length&&adminRows[0].active){
        var sr=await db.auth.signUp({email,password:pass});
        if(sr.error){throw sr.error}
        // Try signing in again after signUp
        var retry=await db.auth.signInWithPassword({email,password:pass});
        if(retry.error){
          // Still fails — password reset flow
          var rr=await db.auth.resetPasswordForEmail(email);
          if(rr.error){throw rr.error}
          e.innerHTML='Usuario creado. Revis&aacute; tu correo para confirmar la cuenta y luego inici&aacute; sesi&oacute;n.';e.style.display='block';
          btn.disabled=false;btn.innerHTML='<i data-lucide="shield" style="width:18px;height:18px"></i> Ingresar';
          return;
        }
        data=retry.data;
      }else{
        e.textContent='No tienes permisos de administrador';e.style.display='block';
        btn.disabled=false;btn.innerHTML='<i data-lucide="shield" style="width:18px;height:18px"></i> Ingresar';
        document.getElementById('loginPass').value='';
        return;
      }
    }
    // Check role in admins table by email
    var {data:userRows,error:userErr}=await db.from('admins').select('role,email,active').eq('email',email).limit(1);
    if(userErr)throw userErr;
    if(!userRows||!userRows.length||!userRows[0].active){
      await db.auth.signOut();
      e.textContent='No tienes permisos de administrador';e.style.display='block';
      btn.disabled=false;btn.innerHTML='<i data-lucide="shield" style="width:18px;height:18px"></i> Ingresar';
      document.getElementById('loginPass').value='';
      return;
    }
    var mappedRole=userRows[0].role==='owner'?'admin':'coach';
    currentUser={id:data.user.id,email:email,role:mappedRole,name:userRows[0].email||''};
    await loadAdminData();
  }catch(ee){
    e.textContent=ee.message||'Error de autenticación';e.style.display='block';
    btn.disabled=false;btn.innerHTML='<i data-lucide="shield" style="width:18px;height:18px"></i> Ingresar';
    document.getElementById('loginPass').value='';
  }
}
async function loadAdminData(){
  console.count('loadAdminData');
  var e=document.getElementById('loginError');
  var btn=document.getElementById('loginBtn');
  try{
    // Fetch all tables from DB (quizzes/quiz_responses fetched separately to avoid 404 crash)
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
    // Fetch quizzes/quiz_responses separately (may not exist)
    var qz={data:[]};try{var r=await db.from('quizzes').select('*');if(r)qz=r}catch(e){}
    var qr={data:[]};try{var r=await db.from('quiz_responses').select('*');if(r)qr=r}catch(e){}
    DATA={};
    DATA_TABLES.forEach(function(t){DATA[t]=[]});
    DATA.applications=[];
    var localData=getData();
    DATA_TABLES.forEach(function(t){if(localData[t]&&localData[t].length)DATA[t]=localData[t].slice()});
    if(DATA.materials&&DATA.materials.length){var fb=DATA.schedule&&DATA.schedule.length?DATA.schedule[0].id:'';DATA.materials=DATA.materials.map(function(m){return{...m,schedule_id:m.schedule_id||fb}})}
    if(localData.content)DATA.content=JSON.parse(JSON.stringify(localData.content));
    if(DATA.group_coaches&&DATA.group_coaches.length){
      var gs=new Set();
      DATA.group_coaches=DATA.group_coaches.filter(function(gc){var k=gc.group_id+'|'+gc.coach_id;if(gs.has(k))return false;gs.add(k);return true});
    }
    if(sch.data&&sch.data.length)DATA.schedule=sch.data.map(function(x){var st=String(x.start_time||x.start||'').slice(0,5),et=String(x.end_time||x.end||'').slice(0,5);return{id:x.id,title:x.title,day:x.day,start:st,end:et,type:x.type,coach:x.coach||'',group_id:x.group_id||''}});
    // Migrate old schedule day values (0=Sun?0=Mon)
    if((!sch.data||!sch.data.length)&&DATA.schedule.length&&!localStorage.getItem('qsr_sched_migrated')){
      DATA.schedule=DATA.schedule.map(function(s){s.day=(s.day+6)%7;return s});
      localStorage.setItem('qsr_sched_migrated','1');
    }
    // Auto-assign group from coach for schedule items missing group
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
    if(mat.data&&mat.data.length)DATA.materials=mat.data.map(function(m){return{...m,schedule_id:m.schedule_id||null}});
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
    DATA.content={home:{}};
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
  }catch(ee){console.log('loadAdminData failed:',ee);DATA=getData();document.getElementById('adminDbStatus').textContent='? sin conexión';document.getElementById('adminDbStatus').className='err'}
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('adminPanel').classList.add('active');
  document.querySelector('.admin').classList.add('active');
  e.style.display='none';
  btn.disabled=false;btn.innerHTML='<i data-lucide="shield" style="width:18px;height:18px"></i> Ingresar';
  // Coaches with name in users table get auto-filtered
  currentUser.coachName='';
  if(currentUser.role==='coach'&&currentUser.name){
    var coachMatch=(DATA.coaches||[]).find(function(c){return c.name&&c.name.toLowerCase()===currentUser.name.toLowerCase()});
    if(coachMatch){currentUser.coachName=currentUser.name}
  }
  if(currentUser.coachName)console.log('Filtro coach activo:',currentUser.coachName);
  // Hide coaches/content sidebar for non-admin BEFORE render
  if(!isCurrentUserAdmin()){
    var elCoaches=document.getElementById('sidebar_coaches');
    var elContent=document.getElementById('sidebar_content');
    if(elCoaches)elCoaches.style.display='none';
    if(elContent)elContent.style.display='none';
  }
  refresh();
  document.getElementById('adminDbStatus').textContent='? conectado';document.getElementById('adminDbStatus').className='ok';
  toast('Bienvenido, '+currentUser.email,'ok');
  console.log('loadAdminData: calling syncToDB, DATA.tasks=',(DATA.tasks||[]).length,'DATA.members=',(DATA.members||[]).length,'DATA.evals=',(DATA.evaluations||[]).length);
  await syncToDB();
  console.log('loadAdminData: syncToDB completed');
  try{
    rtChannel=db.channel('admin-changes')
      .on('postgres_changes',{event:'*',schema:'public'},async function(payload){
        var table=payload.table;
        if(table==='content'||table==='sections'||DATA_TABLES.includes(table)){
          if(table==='applications'&&payload.eventType==='INSERT')toast('?? Nueva inscripción recibida','info');
          else if(payload.eventType!=='DELETE')toast('?? Cambio detectado de otra sesión, recargando...','info');
          DATA=getData();refresh();
        }
      }).subscribe();
  }catch(e){console.log('Realtime subscribe error:',e)}
}
function logout(){
  DATA=null;
  if(rtChannel)try{rtChannel.unsubscribe()}catch(e){}
  rtChannel=null;
  currentUser=null;
  if(db)try{db.auth.signOut()}catch(e){}
  db=null;
  document.getElementById('adminPanel').classList.remove('active');
  document.querySelector('.admin').classList.remove('active');
  document.getElementById('loginScreen').classList.remove('hidden');
  document.getElementById('loginEmail').value='';
  document.getElementById('loginPass').value='';
  document.getElementById('loginEmail').focus();
  toast('Sesión cerrada','info');
}
async function checkSession(){
  try{
    if(!db)db=supabase.createClient(SB,ANON,{auth:{persistSession:true}});
    var {data:{session}}=await db.auth.getSession();
    if(session&&session.user){
      var {data:userRows}=await db.from('admins').select('role,email,active').eq('email',session.user.email).limit(1);
      if(userRows&&userRows.length&&userRows[0].active){
        var mappedRole=userRows[0].role==='owner'?'admin':'coach';
        currentUser={id:session.user.id,email:session.user.email,role:mappedRole,name:userRows[0].email||''};
        await loadAdminData();
        return;
      }
    }
  }catch(e){/* no session, show login */}
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

function switchTab(tab,btn){
  if(!isCurrentUserAdmin()&&(tab==='coaches'||tab==='content'||tab==='sections'))return;
  document.getElementById('adminSidebar').classList.remove('mobile-open');
  document.querySelectorAll('.admin-sidebar button').forEach(function(b){b.classList.remove('active')});
  if(btn)btn.classList.add('active');
  document.getElementById('adminContent').innerHTML='';_inAcademyTab=tab==='academy';
  var titles={dashboard:'Dashboard',content:'Contenido Web',sections:'Secciones',news:'Noticias',schedule:'Horarios',team:'Equipo',scrims:'Scrims',members:'Miembros',academy:'Academia',stats:'Estadísticas',applications:'Inscripciones',announcements:'Anuncios',substitutions:'Sustituciones',achievements:'Logros',groups:'Grupos',coaches:'Coaches'};
  document.getElementById('adminTitle').textContent=titles[tab]||tab;
  switch(tab){
    case'dashboard':renderDash();break;
    case'content':renderContentEdit();break;
    case'sections':renderSections();break;
    case'news':renderNews();break;
    case'schedule':renderSchedule();break;
    case'team':renderTeam();break;
    case'scrims':renderScrims();break;
    case'members':renderMembers();break;
    case'academy':renderAcademy();break;
    case'stats':renderStats();break;
    case'applications':renderApplications();break;
    case'announcements':renderAnnouncements();break;
    case'substitutions':renderSubstitutions();break;
    case'achievements':renderAchievements();break;
    case'groups':renderGroups();break;
    case'coaches':renderCoaches();break;
  }
  // trigger tab animation
  var ac=document.getElementById('adminContent');
  ac.style.animation='none';void ac.offsetHeight;ac.style.animation='tabFadeIn 0.2s ease';
  // animate cards in grids
  ac.querySelectorAll('.grid').forEach(animateGrid);
  if(typeof lucide!=='undefined')lucide.createIcons();
}
function refresh(){var a=document.querySelector('.admin-sidebar button.active');switchTab(a?a.getAttribute('onclick').match(/'([^']+)'/)[1]:'dashboard',a);updateCounts()}
function updateCounts(){
  var coachName=currentUser&&currentUser.coachName||'';
  document.getElementById('countNews').textContent=filterByCurrentCoach(DATA.news||[]).length;
  document.getElementById('countSchedule').textContent=filterByCurrentCoach(DATA.schedule||[]).length;
  document.getElementById('countTeam').textContent=(DATA.team||[]).length;
  document.getElementById('countScrims').textContent=filterByCurrentCoach(DATA.scrims||[]).length;
  document.getElementById('countMembers').textContent=coachName?filterByCurrentCoach(DATA.members||[]).length:(DATA.members||[]).length;
  document.getElementById('countAcademy').textContent=filterByCurrentCoach(DATA.academy||[]).length+filterByCurrentCoach(DATA.curriculum||[]).length+filterByCurrentCoach(DATA.materials||[]).length+filterByCurrentCoach(DATA.tasks||[]).length+filterByCurrentCoach(DATA.evaluations||[]).length+(DATA.attendance||[]).length+filterByCurrentCoach(DATA.quizzes||[]).length+filterByCurrentCoach(DATA.coach_notes||[]).length;
  document.getElementById('countStats').textContent=filterByCurrentCoach(DATA.stats||[]).length;
  document.getElementById('countApps').textContent=(DATA.applications||[]).length;
  document.getElementById('countAnnouncements').textContent=filterByCurrentCoach(DATA.announcements||[]).length;
  document.getElementById('countSubs').textContent=filterByCurrentCoach(DATA.substitutions||[]).length;
  document.getElementById('countAchievements').textContent=(DATA.achievements||[]).length;
  document.getElementById('countGroups').textContent=(DATA.groups||[]).length;
  document.getElementById('countCoaches').textContent=(DATA.coaches||[]).length;
}

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
  if(typeof lucide!=='undefined')lucide.createIcons();
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

// ========== DASHBOARD ==========
function renderDash(){
  var s=filterByCurrentCoach(DATA.scrims||[]);
  var t=s.length,w=s.filter(function(s){return s.result==='Victoria'}).length,l=s.filter(function(s){return s.result==='Derrota'}).length,wr=t?Math.round(w/t*100):0;
  var nw=(DATA.news||[]).length;
  document.getElementById('adminContent').innerHTML='<div class="dash-cards">'+[
    {n:nw,l:'Noticias',c:'#3b82f6, #2563eb',i:ic('newspaper',18)},
    {n:(DATA.schedule||[]).length,l:'Horarios',c:'#10b981, #059669',i:ic('calendar',18)},
    {n:(DATA.team||[]).length,l:'Jugadores',c:'#8b5cf6, #7c3aed',i:ic('trophy',18)},
    {n:t,l:'Scrims',c:'#f97316, #ea580c',i:ic('crosshair',18)},
    {n:(DATA.members||[]).length,l:'Miembros',c:'#14b8a6, #0d9488',i:ic('users',18)},
    {n:(DATA.stats||[]).length,l:'Stats',c:'#6366f1, #4f46e5',i:ic('bar-chart-3',18)},
    {n:(DATA.academy||[]).length,l:'Academia',c:'#eab308, #ca8a04',i:ic('graduation-cap',18)},
    {n:(DATA.announcements||[]).length,l:'Anuncios',c:'#a78bfa, #8b5cf6',i:ic('megaphone',18)},
    {n:(DATA.curriculum||[]).length,l:'Plan',c:'#06b6d4, #0891b2',i:ic('book-open',18)},
    {n:(DATA.tasks||[]).length,l:'Tareas',c:'#8b5cf6, #7c3aed',i:ic('check-square',18)},
  ].map(function(c){return'<div class="glass-card dash-card"><div class="glow" style="background:linear-gradient(135deg,'+c.c+')"></div><div class="num gradient-text">'+c.n+'</div><div class="lbl"><span class="icon">'+c.i+'</span> '+c.l+'</div></div>'}).join('')+'</div>'+
  '<div class="quick-grid">'+
    '<div class="glass-card info-card"><h3 style="font-family:var(--font-display);font-size:15px;margin-bottom:14px">'+ic('bar-chart-3',16)+' Rendimiento</h3>'+
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">'+
      '<div class="has-glow" style="background:rgba(139,92,246,0.06);border-radius:10px;padding:14px;text-align:center"><div style="font-size:22px;font-weight:700;color:#8b5cf6">'+w+'</div><div style="color:#888;font-size:11px">Victorias</div></div>'+
      '<div class="has-glow" style="background:rgba(139,92,246,0.06);border-radius:10px;padding:14px;text-align:center"><div style="font-size:22px;font-weight:700;color:#8b5cf6">'+l+'</div><div style="color:#888;font-size:11px">Derrotas</div></div>'+
      '<div class="has-glow" style="background:rgba(139,92,246,0.06);border-radius:10px;padding:14px;text-align:center"><div style="font-size:22px;font-weight:700;color:var(--neon)">'+wr+'%</div><div style="color:#888;font-size:11px">Win Rate</div></div>'+
      '<div class="has-glow" style="background:rgba(59,130,246,0.06);border-radius:10px;padding:14px;text-align:center"><div style="font-size:22px;font-weight:700;color:#3b82f6">'+nw+'</div><div style="color:#888;font-size:11px">Noticias</div></div>'+
    '</div></div>'+
    '<div class="glass-card info-card" style="grid-column:1/-1"><h3 style="font-family:var(--font-display);font-size:15px;margin-bottom:12px">'+ic('zap',16)+' Acciones Rápidas</h3>'+
    '<div style="display:flex;flex-wrap:wrap;gap:8px">'+
      '<button class="btn-sm save quick-nav" onclick="syncToDB()">'+ic('refresh-cw',14)+' Forzar Sync</button>'+
      '<button class="btn-sm save quick-nav" onclick="switchTab(\'content\',document.querySelector(\'[onclick*=\\\'content\\\']\'))">'+ic('file-text',14)+' Contenido</button>'+
      '<button class="btn-sm save quick-nav" onclick="switchTab(\'sections\',document.querySelector(\'[onclick*=\\\'sections\\\']\'))">'+ic('eye',14)+' Secciones</button>'+
      '<button class="btn-sm save quick-nav" onclick="switchTab(\'news\',document.querySelector(\'[onclick*=\\\'news\\\']\'))">'+ic('newspaper',14)+' Noticias</button>'+
      '<button class="btn-sm save quick-nav" onclick="switchTab(\'announcements\',document.querySelector(\'[onclick*=\\\'announcements\\\']\'))">'+ic('megaphone',14)+' Anuncios</button>'+
      '<button class="btn-sm save quick-nav" onclick="switchTab(\'schedule\',document.querySelector(\'[onclick*=\\\'schedule\\\']\'))">'+ic('calendar',14)+' Horarios</button>'+
      '<button class="btn-sm save quick-nav" onclick="switchTab(\'team\',document.querySelector(\'[onclick*=\\\'team\\\']\'))">'+ic('trophy',14)+' Equipo</button>'+
      '<button class="btn-sm save quick-nav" onclick="switchTab(\'members\',document.querySelector(\'[onclick*=\\\'members\\\']\'))">'+ic('users',14)+' Miembros</button>'+
      '<button class="btn-sm save quick-nav" onclick="switchTab(\'scrims\',document.querySelector(\'[onclick*=\\\'scrims\\\']\'))">'+ic('crosshair',14)+' Scrims</button>'+
      '<button class="btn-sm save quick-nav" onclick="switchTab(\'stats\',document.querySelector(\'[onclick*=\\\'stats\\\']\'))">'+ic('bar-chart-3',14)+' Stats</button>'+
      '<button class="btn-sm save quick-nav" onclick="switchTab(\'academy\',document.querySelector(\'[onclick*=\\\'academy\\\']\'))">'+ic('graduation-cap',14)+' Academia</button>'+
      '<button class="btn-sm save quick-nav" onclick="switchTab(\'curriculum\',document.querySelector(\'[onclick*=\\\'curriculum\\\']\'))">'+ic('book-open',14)+' Plan</button>'+
      '<button class="btn-sm save quick-nav" onclick="switchTab(\'materials\',document.querySelector(\'[onclick*=\\\'materials\\\']\'))">'+ic('bookmark',14)+' Material</button>'+
      '<button class="btn-sm save quick-nav" onclick="switchTab(\'tasks\',document.querySelector(\'[onclick*=\\\'tasks\\\']\'))">'+ic('check-square',14)+' Tareas</button>'+
      '<button class="btn-sm save quick-nav" onclick="switchTab(\'evaluations\',document.querySelector(\'[onclick*=\\\'evaluations\\\']\'))">'+ic('bar-chart-2',14)+' Eval</button>'+
      '<button class="btn-sm save quick-nav" onclick="switchTab(\'attendance\',document.querySelector(\'[onclick*=\\\'attendance\\\']\'))">'+ic('clipboard-check',14)+' Asistencia</button>'+
      '<button class="btn-sm save quick-nav" onclick="switchTab(\'substitutions\',document.querySelector(\'[onclick*=\\\'substitutions\\\']\'))">'+ic('user-plus',14)+' Suplentes</button>'+
      '<button class="btn-sm save quick-nav" onclick="switchTab(\'applications\',document.querySelector(\'[onclick*=\\\'applications\\\']\'))">'+ic('clipboard-list',14)+' Inscripciones</button>'+
      '<button class="btn-sm save quick-nav" onclick="switchTab(\'achievements\',document.querySelector(\'[onclick*=\\\'achievements\\\']\'))">'+ic('award',14)+' Logros</button>'+
      '<button class="btn-sm save quick-nav" onclick="switchTab(\'groups\',document.querySelector(\'[onclick*=\\\'groups\\\']\'))">'+ic('layers',14)+' Grupos</button>'+
      '<button class="btn-sm save quick-nav" onclick="switchTab(\'coaches\',document.querySelector(\'[onclick*=\\\'coaches\\\']\'))">'+ic('user-check',14)+' Coaches</button>'+
    '</div></div>'+
  '</div>';
}

// ========== CONTENT EDITOR ==========
function renderContentEdit(){
  var c=DATA.content&&DATA.content.home||{};
  document.getElementById('adminContent').innerHTML='<p style="color:#888;font-size:13px;margin-bottom:20px">Edita el contenido y configuración del sitio web.</p>'+
    '<div class="glass-card" style="padding:28px;max-width:600px;margin-bottom:16px">'+
    '<h3 style="font-family:var(--font-display);font-size:14px;margin-bottom:16px">'+ic('type',16)+' Contenido Principal</h3>'+
    '<div class="content-editor">'+
    [{k:'hero_title',l:'Título del Hero'},{k:'hero_subtitle',l:'Subtítulo'},{k:'hero_desc',l:'Descripción'},{k:'site_tagline',l:'Tagline'}].map(function(f){return'<div class="field"><label>'+f.l+'</label><input class="input-field" id="cf_'+f.k+'" value="'+esc(c[f.k]||'')+'"></div>'}).join('')+
    '</div></div>'+
    '<div class="glass-card" style="padding:28px;max-width:600px;margin-bottom:16px">'+
    '<h3 style="font-family:var(--font-display);font-size:14px;margin-bottom:16px">'+ic('image',16)+' Imágenes</h3>'+
    '<div class="content-editor">'+
    [{k:'logo_url',l:'URL del Logo'},{k:'banner_bg',l:'URL Fondo Hero (opcional)'}].map(function(f){return'<div class="field"><label>'+f.l+'</label><input class="input-field" id="cf_'+f.k+'" value="'+esc(c[f.k]||'')+'"></div>'}).join('')+
    '</div></div>'+
    '<div class="glass-card" style="padding:28px;max-width:600px;margin-bottom:16px">'+
    '<h3 style="font-family:var(--font-display);font-size:14px;margin-bottom:16px">'+ic('link',16)+' Redes Sociales</h3>'+
    '<div class="content-editor">'+
    [{k:'social_twitch',l:'Twitch'},{k:'social_youtube',l:'YouTube'},{k:'social_twitter',l:'Twitter / X'},{k:'social_instagram',l:'Instagram'}].map(function(f){return'<div class="field"><label>'+f.l+'</label><input class="input-field" id="cf_'+f.k+'" value="'+esc(c[f.k]||'')+'"></div>'}).join('')+
    '</div></div>'+

    '<button class="btn-primary" onclick="saveContent()" style="margin-top:4px">'+ic('save',16)+' Guardar Cambios</button>';
}
function saveContent(){
  if(!DATA.content)DATA.content={};if(!DATA.content.home)DATA.content.home={};
  ['hero_title','hero_subtitle','hero_desc','site_tagline','logo_url','banner_bg','social_twitch','social_youtube','social_twitter','social_instagram'].forEach(function(k){DATA.content.home[k]=document.getElementById('cf_'+k).value});
  saveData(DATA);
  toast('Contenido actualizado');
}

// ========== GENERIC TABLE ==========
function adminTable(items,columns,renderRow,emptyMsg,addBtn){
  return (addBtn||'')+(items.length?'<div class="table-wrap glass-card"><table class="admin-table"><thead><tr>'+columns.map(function(c){return'<th>'+esc(c)+'</th>'}).join('')+'<th style="text-align:right">Acción</th></tr></thead><tbody>'+items.map(function(item,i){return'<tr>'+renderRow(item,i)+'</tr>'}).join('')+'</tbody></table></div>':'<div class="empty-state"><div class="icon">'+ic('clipboard-list',32)+'</div><p>'+emptyMsg+'</p></div>');
}

// ========== FILE UPLOAD UTILITY ==========
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
  if(typeof lucide!=='undefined')lucide.createIcons();
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

// ========== SECTIONS (toggle page visibility) ==========
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
function renderSections(){
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
    '<button class="btn-sm cancel" onclick="localStorage.removeItem(\'qsr_sections\');renderSections();toast(\'Secciones restauradas\')" style="margin-top:12px">? Restaurar todas</button>';
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

// ========== INIT ==========
// Auto-restore session if logged in, otherwise show login
checkSession();
document.getElementById('loginEmail').focus();
initParticles();
initRipple();