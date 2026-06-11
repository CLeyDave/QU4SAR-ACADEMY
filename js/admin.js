// ========== INIT ICONS ==========
if(typeof lucide!=='undefined')lucide.createIcons();

// ========== SUPABASE DB ==========
var currentUser=null;

var DATA_TABLES=['schedule','team','scrims','members','stats','news','academy','attendance','announcements','curriculum','materials','tasks','task_completions','coach_notes','evaluations','rank_history','attendance_confirmations','substitutions','achievements','member_achievements','quizzes','quiz_responses','groups','coaches','group_coaches','applications','sections'];

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
    if(error)throw error;
    // Check role in users table
    var {data:userRows,error:userErr}=await db.from('users').select('role,name').eq('id',data.user.id).limit(1);
    if(userErr)throw userErr;
    if(!userRows||!userRows.length||(userRows[0].role!=='admin'&&userRows[0].role!=='coach')){
      await db.auth.signOut();
      e.textContent='No tienes permisos de administrador';e.style.display='block';
      btn.disabled=false;btn.innerHTML='<i data-lucide="shield" style="width:18px;height:18px"></i> Ingresar';
      document.getElementById('loginPass').value='';
      return;
    }
    currentUser={id:data.user.id,email:email,role:userRows[0].role,name:userRows[0].name||''};
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
    if(localData.content)DATA.content=JSON.parse(JSON.stringify(localData.content));
    if(DATA.group_coaches&&DATA.group_coaches.length){
      var gs=new Set();
      DATA.group_coaches=DATA.group_coaches.filter(function(gc){var k=gc.group_id+'|'+gc.coach_id;if(gs.has(k))return false;gs.add(k);return true});
    }
    if(sch.data&&sch.data.length)DATA.schedule=sch.data.map(function(x){var st=String(x.start_time||x.start||'').slice(0,5),et=String(x.end_time||x.end||'').slice(0,5);return{id:x.id,title:x.title,day:x.day,start:st,end:et,type:x.type,coach:x.coach||'',group_id:x.group_id||''}});
    // Migrate old schedule day values (0=Sun→0=Mon)
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
  }catch(ee){console.log('loadAdminData failed:',ee);DATA=getData();document.getElementById('adminDbStatus').textContent='⋆ sin conexión';document.getElementById('adminDbStatus').className='err'}
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
  document.getElementById('adminDbStatus').textContent='⟐ conectado';document.getElementById('adminDbStatus').className='ok';
  toast('Bienvenido, '+currentUser.email,'ok');
  console.log('loadAdminData: calling syncToDB, DATA.tasks=',(DATA.tasks||[]).length,'DATA.members=',(DATA.members||[]).length,'DATA.evals=',(DATA.evaluations||[]).length);
  await syncToDB();
  console.log('loadAdminData: syncToDB completed');
  try{
    rtChannel=db.channel('admin-changes')
      .on('postgres_changes',{event:'*',schema:'public'},async function(payload){
        var table=payload.table;
        if(table==='content'||table==='sections'||DATA_TABLES.includes(table)){
          if(table==='applications'&&payload.eventType==='INSERT')toast('📥 Nueva inscripción recibida','info');
          else if(payload.eventType!=='DELETE')toast('🔄 Cambio detectado de otra sesión, recargando...','info');
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
      var {data:userRows}=await db.from('users').select('role,name').eq('id',session.user.id).limit(1);
      if(userRows&&userRows.length&&(userRows[0].role==='admin'||userRows[0].role==='coach')){
        currentUser={id:session.user.id,email:session.user.email,role:userRows[0].role,name:userRows[0].name||''};
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
    status.innerHTML=uploadStatusHTML('✓ Subido: '+esc(file.name),'ok');
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
    '<button class="btn-sm cancel" onclick="localStorage.removeItem(\'qsr_sections\');renderSections();toast(\'Secciones restauradas\')" style="margin-top:12px">↺ Restaurar todas</button>';
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

// ========== CRUD: NEWS ==========
function renderNews(){
  var items=filterByCurrentCoach(DATA.news||[]);
  var btn='<button class="btn-primary" onclick="newsForm(null)" style="margin-bottom:14px;font-size:13px">'+ic('plus',14)+' Nueva Noticia</button>';
  document.getElementById('adminContent').innerHTML=adminTable(items,['Título','Autor','Coach','Grupo','Estado','Archivos'],function(n){
    return '<td>'+esc(n.title)+'</td><td>'+esc(n.author||'Admin')+'</td><td>'+esc(n.coach||'-')+'</td><td>'+(n.group_id?groupName(n.group_id):'General')+'</td><td><span class="badge '+(n.published?'badge-green':'badge-gray')+'">'+(n.published?'Publicado':'Borrador')+'</span></td><td>'+(n.image_url?'<a href="'+esc(n.image_url)+'" target="_blank" title="Ver imagen">'+ic('image',14)+'</a> ':'')+(n.attachment_url?'<a href="'+esc(n.attachment_url)+'" target="_blank" title="Descargar '+esc(n.attachment_name||'archivo')+'">'+ic('paperclip',14)+'</a>':'')+'</td><td><div class="has-glow admin-actions"><button onclick="newsForm(\''+n.id+'\')">'+ic('pencil',14)+'</button><button class="del" onclick="delNews(\''+n.id+'\')">'+ic('trash-2',14)+'</button></div></td>'},'No hay noticias',btn);
}
function newsForm(id){
  var item=id?(DATA.news||[]).find(function(n){return n.id===id}):null;
  var f=item||{title:'',content:'',excerpt:'',author:'Admin',published:false,coach:dc(),group_id:'',date:new Date().toISOString().slice(0,10),image_url:'',attachment_url:'',attachment_name:''};
  openModal('<button class="modal-close" onclick="closeModal()">'+ic('x',16)+'</button><h3>'+(item?'Editar':'Nueva')+' Noticia</h3>'+
    '<div class="field"><label>Título</label><input class="input-field" id="nf_title" value="'+esc(f.title)+'"></div>'+
    '<div class="field"><label>Extracto</label><input class="input-field" id="nf_excerpt" value="'+esc(f.excerpt||'')+'"></div>'+
    '<div class="field"><label>Contenido</label><textarea class="input-field" id="nf_content" rows="4">'+esc(f.content||'')+'</textarea></div>'+
    '<div class="field"><label>Autor</label><input class="input-field" id="nf_author" value="'+esc(f.author||'')+'"></div>'+
    '<div class="grid-3"><div class="field"><label>Fecha</label><input class="input-field" type="date" id="nf_date" value="'+esc(f.date||new Date().toISOString().slice(0,10))+'"></div>'+
    '<div class="field"><label style="display:flex;align-items:center;gap:8px;cursor:pointer;margin-top:24px"><input type="checkbox" id="nf_published" '+(f.published?'checked':'')+'> Publicado</label></div>'+
    '<div class="field"><label>Coach</label><select class="input-field" id="nf_coach" onchange="setGroupFromCoach(\'nf_group\',\'nf_coach\')"><option value="">Sin coach</option>'+coachOptions(f.coach||'',f.group_id)+'</select></div></div>'+
    '<div class="field"><label>Grupo</label><select class="input-field" id="nf_group" onchange="reloadCoachDropdown(\'nf_coach\',this.value)"><option value="">General</option>'+(DATA.groups||[]).map(function(g){return'<option value="'+g.id+'" '+(f.group_id===g.id?'selected':'')+'>'+esc(g.name)+'</option>'}).join('')+'</select></div>'+
    '<hr>'+
    '<div class="field"><label>Imagen</label>'+fileUploadHTML('Imagen','image/*','nf_img_status','nf_image_url',f.image_url||'')+(f.image_url?mediaPreview(f.image_url):'')+'</div>'+
    '<div class="field"><label>Archivo adjunto (PDF)</label>'+fileUploadHTML('PDF','.pdf,application/pdf','nf_doc_status','nf_attachment_url',f.attachment_url||'')+'<input class="input-field" id="nf_attachment_name" placeholder="Nombre del archivo" value="'+esc(f.attachment_name||'')+'"></div>'+
    '<button class="btn-primary" onclick="saveNews(\''+(id||'')+'\')" style="width:100%;justify-content:center">'+ic('save',16)+' Guardar</button>');
}
function saveNews(id){
  var obj={title:document.getElementById('nf_title').value,excerpt:document.getElementById('nf_excerpt').value,content:document.getElementById('nf_content').value,author:document.getElementById('nf_author').value,published:document.getElementById('nf_published').checked,coach:document.getElementById('nf_coach').value,group_id:document.getElementById('nf_group').value,date:document.getElementById('nf_date')?.value||new Date().toISOString().slice(0,10),image_url:document.getElementById('nf_image_url').value,attachment_url:document.getElementById('nf_attachment_url').value,attachment_name:document.getElementById('nf_attachment_name').value};
  if(!DATA.news)DATA.news=[];
  if(id){var idx=DATA.news.findIndex(function(n){return n.id===id});if(idx>=0)DATA.news[idx]={...DATA.news[idx],...obj}}else{obj.id=uid();DATA.news.unshift(obj)}
  saveData(DATA);closeModal();renderNews();updateCounts();toast(id?'Noticia actualizada':'Noticia creada');
}
function delNews(id){if(!confirmDel())return;DATA.news=DATA.news.filter(function(n){return n.id!==id});saveData(DATA);renderNews();updateCounts();toast('Noticia eliminada');}

// ========== CRUD: TEAM ==========
function renderTeam(){
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
  saveData(DATA);closeModal();renderTeam();updateCounts();toast(id?'Jugador actualizado':'Jugador agregado');
}
function delTeam(id){if(!confirmDel())return;DATA.team=DATA.team.filter(function(t){return t.id!==id});saveData(DATA);renderTeam();updateCounts();toast('Jugador eliminado');}

// ========== CRUD: SCRIMS ==========
function renderScrims(){
  var items=filterByCurrentCoach(DATA.scrims||[]);
  var btn='<button class="btn-primary" onclick="scrimForm(null)" style="margin-bottom:14px;font-size:13px">'+ic('plus',14)+' Nuevo Scrim</button>';
  document.getElementById('adminContent').innerHTML=adminTable(items,['Oponente','Resultado','Score','Fecha','Coach','Grupo'],function(s){
    return '<td>'+esc(s.opponent)+'</td><td><span class="badge '+(s.result==='Victoria'?'badge-green':s.result==='Derrota'?'badge-red':'badge-gray')+'">'+s.result+'</span></td><td>'+s.our+' - '+s.opponent+'</td><td>'+s.date+'</td><td>'+esc(s.coach||'-')+'</td><td>'+groupName(s.group_id)+'</td><td><div class="has-glow admin-actions"><button onclick="scrimForm(\''+s.id+'\')">'+ic('pencil',14)+'</button><button class="del" onclick="delScrim(\''+s.id+'\')">'+ic('trash-2',14)+'</button></div></td>'},'No hay scrims',btn);
}
function scrimForm(id){
  var item=id?DATA.scrims.find(function(s){return s.id===id}):null;
  var f=item||{opponent:'',opponent_logo:'',our:0,opponent_score:0,result:'Pendiente',date:new Date().toISOString().slice(0,10),coach:dc(),group_id:''};
  openModal('<button class="modal-close" onclick="closeModal()">'+ic('x',16)+'</button><h3>'+(item?'Editar':'Nuevo')+' Scrim</h3>'+
    '<div class="field"><label>Oponente</label><input class="input-field" id="sf_opp" value="'+esc(f.opponent)+'"></div>'+
    '<div class="field"><label>Logo del oponente</label>'+fileUploadHTML('Logo','image/*','sf_logo_img_status','sf_opponent_logo',f.opponent_logo||'')+(f.opponent_logo?mediaPreview(f.opponent_logo):'')+'</div>'+
    '<div class="grid-2"><div class="field"><label>Nuestro Score</label><input type="number" class="input-field" id="sf_our" value="'+f.our+'"></div>'+
    '<div class="field"><label>Su Score</label><input type="number" class="input-field" id="sf_opp_score" value="'+(f.opponent_score||0)+'"></div></div>'+
    '<div class="field"><label>Resultado</label><select class="input-field" id="sf_result">'+['Pendiente','Victoria','Derrota','Empate'].map(function(r){return'<option value="'+r+'" '+(r===f.result?'selected':'')+'>'+r+'</option>'}).join('')+'</select></div>'+
    '<div class="field"><label>Fecha</label><input type="date" class="input-field" id="sf_date" value="'+f.date+'"></div>'+
    '<div class="field"><label>Coach</label><select class="input-field" id="scf_coach" onchange="setGroupFromCoach(\'scf_group\',\'scf_coach\')"><option value="">Sin coach</option>'+coachOptions(f.coach||'',f.group_id)+'</select></div>'+
    '<div class="field" style="display:none"><label>Grupo</label><select class="input-field" id="scf_group" onchange="reloadCoachDropdown(\'scf_coach\',this.value)"><option value="">General (Ambos)</option>'+(DATA.groups||[]).map(function(g){return'<option value="'+g.id+'"'+(f.group_id===g.id?' selected':'')+'>'+esc(g.name)+'</option>'}).join('')+'</select></div>'+
    '<button class="btn-primary" onclick="saveScrim(\''+(id||'')+'\')" style="width:100%;justify-content:center">'+ic('save',16)+' Guardar</button>');
}
function saveScrim(id){
  var obj={opponent:document.getElementById('sf_opp').value,opponent_logo:document.getElementById('sf_opponent_logo').value,our:parseInt(document.getElementById('sf_our').value)||0,opponent_score:parseInt(document.getElementById('sf_opp_score').value)||0,result:document.getElementById('sf_result').value,date:document.getElementById('sf_date').value,coach:document.getElementById('scf_coach').value,group_id:document.getElementById('scf_group').value};
  console.log('saveScrim opponent_logo:',obj.opponent_logo);
  if(id){var idx=DATA.scrims.findIndex(function(s){return s.id===id});if(idx>=0)DATA.scrims[idx]={...DATA.scrims[idx],...obj}}else{obj.id=uid();DATA.scrims.unshift(obj)}
  saveData(DATA);closeModal();renderScrims();updateCounts();toast(id?'Scrim actualizado':'Scrim registrado');
}
function delScrim(id){if(!confirmDel())return;DATA.scrims=DATA.scrims.filter(function(s){return s.id!==id});saveData(DATA);renderScrims();updateCounts();toast('Scrim eliminado');}

// ========== CRUD: MEMBERS ==========
function renderMembers(){
  var totalCn=(DATA.coach_notes||[]).length;
  var totalRh=(DATA.rank_history||[]).length;
  var allMembers=DATA.members||[];
  var members=currentUser&&currentUser.coachName?filterByCurrentCoach(allMembers):allMembers;
  var selId='memberSel_'+(Math.random()+1).toString(36).slice(2,8);
  var btn='<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">'+
    '<button class="btn-primary" onclick="memberForm(null)" style="font-size:13px">'+ic('plus',14)+' Nuevo Miembro</button>'+
    '<button class="btn-secondary" onclick="distributeStudents()" style="font-size:13px">'+ic('users',14)+' Distribuir x Coach</button>'+
    '<button class="btn-secondary" onclick="resetMemberAssignments()" style="font-size:13px;border-color:rgba(139,92,246,0.2);color:#8b5cf6">'+ic('x-circle',14)+' Limpiar Asignaciones</button>'+
    '</div>'+
    '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;align-items:center">'+
      '<label style="display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer"><input type="checkbox" id="'+selId+'" onchange="document.querySelectorAll(\'.msel\').forEach(function(e){e.checked=this.checked},this)"> Seleccionar todos</label>'+
      '<button class="btn-sm cancel" onclick="deleteSelectedMembers()" style="font-size:12px">'+ic('trash-2',12)+' Eliminar seleccionados (<span id="selCount">0</span>)</button>'+
      '<button class="btn-sm cancel" onclick="deleteDuplicateMembers()" style="font-size:12px;border-color:rgba(139,92,246,0.2)">'+ic('copy',12)+' Eliminar duplicados</button>'+
    '</div>';
  document.getElementById('adminContent').innerHTML=adminTable(members,['','Nombre','Rol','Rango','Coach','Grupo'],function(m,i){
    return '<td><input type="checkbox" class="msel" data-id="'+m.id+'" onchange="document.getElementById(\'selCount\').textContent=document.querySelectorAll(\'.msel:checked\').length"></td>'+
      '<td>'+esc(m.name)+'</td><td>'+esc(m.role)+'</td><td>'+esc(m.rank||'-')+'</td>'+
      '<td>'+esc(m.coach||'-')+'</td>'+
      '<td>'+groupName(m.group_id)+'</td>'+
      '<td><div class="has-glow admin-actions">'+
        '<button onclick="memberForm(\''+m.id+'\')" title="Editar">'+ic('pencil',14)+'</button>'+
        '<button onclick="showCoachNotes(\''+esc(m.name)+'\')" title="Notas">'+ic('sticky-note',14)+'</button>'+
        '<button onclick="showRankHistory(\''+esc(m.name)+'\')" title="Rangos">'+ic('trending-up',14)+'</button>'+
        '<button onclick="makeCoachFromMember(\''+esc(m.name)+'\')" title="Hacer Coach">'+ic('user-check',14)+'</button>'+
        '<button class="del" onclick="delMember(\''+m.id+'\')" title="Eliminar">'+ic('trash-2',14)+'</button>'+
      '</div></td>'
  },'No hay miembros',btn)+(totalCn?'<div style="margin-top:8px;font-size:12px;color:#555">'+totalCn+' notas de coach · '+totalRh+' registros de rango</div>':'');
}
function deleteSelectedMembers(){
  var ids=[];
  document.querySelectorAll('.msel:checked').forEach(function(cb){ids.push(cb.getAttribute('data-id'))});
  if(!ids.length){toast('Selecciona al menos un miembro','err');return}
  if(!confirm('¿Eliminar '+ids.length+' miembro(s) seleccionado(s)?'))return;
  ids.forEach(function(id){DATA.members=DATA.members.filter(function(m){return m.id!==id})});
  saveData(DATA);renderMembers();updateCounts();toast(ids.length+' miembro(s) eliminado(s)','ok');
}
function deleteDuplicateMembers(){
  var seen={},removed=0;
  DATA.members=DATA.members.filter(function(m){
    var key=m.name.toLowerCase();
    if(seen[key]){removed++;return false}
    seen[key]=true;return true
  });
  if(!removed){toast('No hay miembros duplicados','info');return}
  saveData(DATA);renderMembers();updateCounts();toast(removed+' duplicado(s) eliminado(s)','ok');
}
function memberForm(id){
  var item=id?DATA.members.find(function(m){return m.id===id}):null;
  var f=item||{name:'',role:'Duelist',rank:'',coach:dc(),image:'',description:'',group_id:''};
  openModal('<button class="modal-close" onclick="closeModal()">'+ic('x',16)+'</button><h3>'+(item?'Editar':'Nuevo')+' Miembro</h3>'+
    '<div class="field"><label>Nombre</label><input class="input-field" id="mf_name" value="'+esc(f.name)+'"></div>'+
    '<div class="grid-2"><div class="field"><label>Rol</label><select class="input-field" id="mf_role">'+['Duelist','Initiator','Controller','Sentinel','Flex','Coach'].map(function(r){return'<option value="'+r+'" '+(r===f.role?'selected':'')+'>'+r+'</option>'}).join('')+'</select></div>'+
    '<div class="field"><label>Rango</label><input class="input-field" id="mf_rank" value="'+esc(f.rank||'')+'"></div></div>'+
    '<div class="grid-2"><div class="field"><label>Coach</label><select class="input-field" id="mf_coach" onchange="setGroupFromCoach(\'mf_group\',\'mf_coach\')"><option value="">Sin coach</option>'+coachOptions(f.coach||'',f.group_id)+'</select></div>'+
    '<div class="field"><label>Imagen URL</label><input class="input-field" id="mf_image" value="'+esc(f.image||'')+'"></div></div>'+
    '<div class="field"><label>Descripción</label><textarea class="input-field" id="mf_desc" rows="3">'+esc(f.description||'')+'</textarea></div>'+
    '<div class="field"><label>Grupo</label><select class="input-field" id="mf_group" onchange="reloadCoachDropdown(\'mf_coach\',this.value);autoAssignCoachToMember(\'mf_coach\',this.value)"><option value="">Sin grupo</option>'+(DATA.groups||[]).map(function(g){return'<option value="'+g.id+'"'+(f.group_id===g.id?' selected':'')+'>'+esc(g.name)+'</option>'}).join('')+'</select></div>'+
    '<button class="btn-primary" onclick="saveMember(\''+(id||'')+'\')" style="width:100%;justify-content:center">'+ic('save',16)+' Guardar</button>');
}
function autoAssignCoachToMember(coachSelectId,groupId){
  if(!groupId)return;
  var el=document.getElementById(coachSelectId);
  if(!el)return;
  var coach=autoAssignCoach(groupId);
  if(coach){el.value=coach}
}
function saveMember(id){
  var obj={name:document.getElementById('mf_name').value,role:document.getElementById('mf_role').value,rank:document.getElementById('mf_rank').value,coach:document.getElementById('mf_coach').value,image:document.getElementById('mf_image').value,description:document.getElementById('mf_desc').value,group_id:document.getElementById('mf_group').value};
  if(!obj.name.trim()){toast('El nombre es obligatorio','err');return}
  if(!DATA.members)DATA.members=[];
  var dup=(DATA.members||[]).find(function(m){return m.name.toLowerCase()===obj.name.toLowerCase()&&m.id!==id});
  if(dup){toast('Ya existe un miembro con ese nombre: '+dup.name,'err');return}
  if(id){var idx=DATA.members.findIndex(function(m){return m.id===id});if(idx>=0)DATA.members[idx]={...DATA.members[idx],...obj}}else{obj.id=uid();DATA.members.push(obj)}
  saveData(DATA);closeModal();renderMembers();updateCounts();toast(id?'Miembro actualizado':'Miembro agregado');
}
function delMember(id){if(!confirmDel())return;DATA.members=DATA.members.filter(function(m){return m.id!==id});saveData(DATA);renderMembers();updateCounts();toast('Miembro eliminado');}
function makeCoachFromMember(name){
  if((DATA.coaches||[]).find(function(c){return c.name===name}))return toast('Ya existe un coach con ese nombre','error');
  coachForm(null);
  setTimeout(function(){
    var realName='';
    var app=(DATA.applications||[]).find(function(a){return a.valorant===name||a.name===name});
    if(app&&app.name)realName=app.name;
    var nameInput=document.getElementById('cf_name');
    if(nameInput&&realName){nameInput.value=realName;nameInput.dispatchEvent(new Event('input'))}
    var nickInput=document.getElementById('cf_nickname');
    if(nickInput)nickInput.value=name;
    var passInput=document.getElementById('cf_password');
    var base=realName||name.split('#')[0].split(' ').pop();
    if(passInput)passInput.value='qu4sar'+base+'_';
    if(nameInput)nameInput.focus();
  },100);
  toast('Revisa los datos y guarda para crear al coach','info');
}

function showCoachNotes(name){
  var notes=(DATA.coach_notes||[]).filter(function(n){return n.member_name===name});
  var h='<button class="modal-close" onclick="closeModal()">'+ic('x',16)+'</button><h3>'+ic('sticky-note',16)+' Notas: '+esc(name)+'</h3>'+
    '<div style="margin-bottom:14px;max-height:300px;overflow-y:auto;display:grid;gap:8px">';
  if(!notes.length)h+='<div style="color:#555;padding:12px">Sin notas aún</div>';
  notes.forEach(function(n){
    h+='<div class="has-glow" style="padding:10px 14px;background:rgba(255,255,255,0.03);border-radius:8px;border-left:3px solid var(--neon)">'+
      '<div style="color:#ccc;font-size:14px">'+esc(n.note)+'</div>'+
      '<div style="color:#555;font-size:11px;margin-top:4px">'+esc(n.category)+' · '+(n.created_at?new Date(n.created_at).toLocaleString('es-ES'):'')+'</div></div>';
  });
  h+='</div><div class="field"><textarea class="input-field" id="cn_text" rows="2" placeholder="Nueva nota..."></textarea></div>'+
    '<div class="field"><label>Categoría</label><input class="input-field" id="cn_cat" value="general" placeholder="ej: aim, game_sense, actitud"></div>'+
    '<button class="btn-primary" onclick="addCoachNote(\''+esc(name)+'\')" style="width:100%;justify-content:center">'+ic('plus',16)+' Agregar Nota</button>';
  openModal(h);
}
function addCoachNote(name){
  var text=document.getElementById('cn_text').value.trim();
  if(!text){toast('Escribe una nota','error');return}
  if(!DATA.coach_notes)DATA.coach_notes=[];
  DATA.coach_notes.push({id:uid(),member_name:name,note:text,category:document.getElementById('cn_cat').value||'general',group_id:'',coach:'',created_at:new Date().toISOString()});
  saveData(DATA);showCoachNotes(name);updateCounts();toast('Nota agregada');
}

function showRankHistory(name){
  var ranks=(DATA.rank_history||[]).filter(function(r){return r.member_name===name}).sort(function(a,b){return a.date>b.date?-1:1});
  var h='<button class="modal-close" onclick="closeModal()">'+ic('x',16)+'</button><h3>'+ic('trending-up',16)+' Historial de Rango: '+esc(name)+'</h3>'+
    '<div style="margin-bottom:14px;display:grid;gap:6px">';
  if(!ranks.length)h+='<div style="color:#555;padding:12px">Sin registros</div>';
  ranks.forEach(function(r,i){
    var arrow=i<ranks.length-1?(ranks[i].rank!==ranks[i+1].rank?(rankValue(ranks[i].rank)>rankValue(ranks[i+1].rank)?'<span style="color:#8b5cf6"> ↑</span>':'<span style="color:#8b5cf6"> ↓</span>'):''):'';
    h+='<div class="has-glow" style="display:flex;justify-content:space-between;padding:8px 14px;background:rgba(255,255,255,0.03);border-radius:8px">'+
      '<span>'+esc(r.rank)+arrow+'</span><span style="color:#555;font-size:13px">'+esc(r.date||'')+'</span></div>';
  });
  h+='</div><div class="field"><label>Nuevo rango</label><input class="input-field" id="rh_rank" placeholder="ej: Diamond 3"></div>'+
    '<div class="field"><label>Fecha</label><input type="date" class="input-field" id="rh_date" value="'+new Date().toISOString().slice(0,10)+'"></div>'+
    '<button class="btn-primary" onclick="addRankRecord(\''+esc(name)+'\')" style="width:100%;justify-content:center">'+ic('plus',16)+' Registrar Rango</button>';
  openModal(h);
}
function addRankRecord(name){
  var rank=document.getElementById('rh_rank').value.trim();
  if(!rank){toast('Escribe el rango','error');return}
  if(!DATA.rank_history)DATA.rank_history=[];
  DATA.rank_history.push({id:uid(),member_name:name,rank:rank,date:document.getElementById('rh_date').value,created_at:new Date().toISOString()});
  saveData(DATA);showRankHistory(name);updateCounts();toast('Rango registrado');
}

// ========== CRUD: ACADEMY ==========
var ACADEMY_TAB='classes';
function switchAcademyTab(tab){
  ACADEMY_TAB=tab;
  document.querySelectorAll('.academy-tab').forEach(function(b){b.classList.toggle('active',b.getAttribute('data-atab')===tab)});
  renderAcademyContent();
}
function renderAcademy(){
  document.getElementById('adminContent').innerHTML=
    '<div id="academySub"><div class="academy-tabs" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:20px">'+
      '<button class="academy-tab active" data-atab="classes" onclick="switchAcademyTab(\'classes\')">Clases</button>'+
      '<button class="academy-tab" data-atab="curriculum" onclick="switchAcademyTab(\'curriculum\')">Plan de Estudio</button>'+
      '<button class="academy-tab" data-atab="materials" onclick="switchAcademyTab(\'materials\')">Materiales</button>'+
      '<button class="academy-tab" data-atab="tasks" onclick="switchAcademyTab(\'tasks\')">Tareas</button>'+
      '<button class="academy-tab" data-atab="evaluations" onclick="switchAcademyTab(\'evaluations\')">Evaluaciones</button>'+
      '<button class="academy-tab" data-atab="attendance" onclick="switchAcademyTab(\'attendance\')">Asistencia</button>'+
      '<button class="academy-tab" data-atab="quizzes" onclick="switchAcademyTab(\'quizzes\')">Quizzes</button>'+
      '<button class="academy-tab" data-atab="coach_notes" onclick="switchAcademyTab(\'coach_notes\')">Coach Notes</button>'+
    '</div><div id="academySubContent"></div></div>';
  ACADEMY_TAB='classes';
  renderAcademyContent();
}
function renderAcademyContent(){
  switch(ACADEMY_TAB){
    case'classes':renderAcademyClasses();break;
    case'curriculum':renderCurriculum('academySubContent');break;
    case'materials':renderMaterials('academySubContent');break;
    case'tasks':renderTasks('academySubContent');break;
    case'evaluations':renderEvals('academySubContent');break;
    case'attendance':renderAttendance('academySubContent');break;
    case'quizzes':renderQuizzes('academySubContent');break;
    case'coach_notes':renderCoachNotes('academySubContent');break;
  }
  if(typeof lucide!=='undefined')lucide.createIcons();
}
function renderAcademyClasses(){
  var items=filterByCurrentCoach(DATA.academy||[]);
  var btn='<button class="btn-primary" onclick="academyForm(null)" style="margin-bottom:14px;font-size:13px">'+ic('plus',14)+' Nueva Clase</button>';
  document.getElementById('academySubContent').innerHTML=adminTable(items,['Día','Tema','Coach','Duración','Archivos'],function(a){
    return '<td>'+esc(a.day)+'</td><td><div class="cell-preview" onclick="viewAcademyTopic(\''+a.id+'\')">'+esc(a.topic)+'</div></td><td>'+esc(a.coach||'—')+'</td><td>'+esc(a.duration||'—')+'</td><td>'+(a.image_url?'<a href="'+esc(a.image_url)+'" target="_blank" title="Ver imagen">'+ic('image',14)+'</a> ':'')+(a.attachment_url?'<a href="'+esc(a.attachment_url)+'" target="_blank" title="Descargar '+esc(a.attachment_name||'archivo')+'">'+ic('paperclip',14)+'</a>':'')+'</td><td><div class="has-glow admin-actions"><button onclick="academyForm(\''+a.id+'\')">'+ic('pencil',14)+'</button><button class="del" onclick="delAcademy(\''+a.id+'\')">'+ic('trash-2',14)+'</button></div></td>'},'No hay clases en la academia',btn);
}
function renderCoachNotes(cId){
  var items=filterByCurrentCoach(DATA.coach_notes||[]);
  var btn='<button class="btn-primary" onclick="coachNoteForm(null)" style="margin-bottom:14px;font-size:13px">'+ic('plus',14)+' Nueva Nota</button>';
  document.getElementById(cId).innerHTML=adminTable(items,['Miembro','Nota','Categoría','Coach','Grupo','Fecha'],function(n){
    return '<td>'+esc(n.member_name)+'</td><td><div class="cell-preview" onclick="viewCoachNote(\''+n.id+'\')">'+esc(n.note)+'</div></td><td><span class="badge badge-purple">'+esc(n.category||'general')+'</span></td><td>'+esc(n.coach||'—')+'</td><td>'+groupName(n.group_id)+'</td><td>'+(n.created_at?new Date(n.created_at).toLocaleDateString('es-ES'):'')+'</td><td><div class="has-glow admin-actions"><button onclick="coachNoteForm(\''+n.id+'\')">'+ic('pencil',14)+'</button><button class="del" onclick="delCoachNote(\''+n.id+'\')">'+ic('trash-2',14)+'</button></div></td>'},'No hay notas del coach',btn);
}
function coachNoteForm(id){
  var item=id?(DATA.coach_notes||[]).find(function(n){return n.id===id}):null;
  var f=item||{member_name:'',note:'',category:'general',group_id:'',coach:dc(),created_at:new Date().toISOString()};
  openModal('<button class="modal-close" onclick="closeModal()">'+ic('x',16)+'</button><h3>'+(item?'Editar':'Nueva')+' Nota</h3>'+
    '<div class="field"><label>Miembro</label><select class="input-field" id="cnf_member">'+(DATA.members||[]).map(function(m){return'<option value="'+esc(m.name)+'" '+(m.name===f.member_name?'selected':'')+'>'+esc(m.name)+'</option>'}).join('')+'</select></div>'+
    '<div class="field"><label>Nota</label><textarea class="input-field" id="cnf_note" rows="3">'+esc(f.note)+'</textarea></div>'+
    '<div class="field"><label>Categoría</label><input class="input-field" id="cnf_cat" value="'+esc(f.category||'general')+'" placeholder="ej: aim, game_sense, actitud"></div>'+
    '<div class="field" style="display:none"><label>Grupo</label><select class="input-field" id="cnf_group" onchange="reloadCoachDropdown(\'cnf_coach\',this.value)"><option value="">General (Ambos)</option>'+(DATA.groups||[]).map(function(g){return'<option value="'+g.id+'"'+(f.group_id===g.id?' selected':'')+'>'+esc(g.name)+'</option>'}).join('')+'</select></div>'+
    '<div class="field"><label>Coach</label><select class="input-field" id="cnf_coach" onchange="setGroupFromCoach(\'cnf_group\',\'cnf_coach\')"><option value="">Sin coach</option>'+coachOptions(f.coach||'',f.group_id)+'</select></div>'+
    '<button class="btn-primary" onclick="saveCoachNote(\''+(id||'')+'\')" style="width:100%;justify-content:center">'+ic('save',16)+' Guardar</button>');
}
function saveCoachNote(id){
  var obj={member_name:document.getElementById('cnf_member').value,note:document.getElementById('cnf_note').value,category:document.getElementById('cnf_cat').value||'general',group_id:document.getElementById('cnf_group').value,coach:document.getElementById('cnf_coach')?.value||''};
  if(!DATA.coach_notes)DATA.coach_notes=[];
  if(id){var idx=DATA.coach_notes.findIndex(function(n){return n.id===id});if(idx>=0)DATA.coach_notes[idx]={...DATA.coach_notes[idx],...obj}}else{obj.id=uid();obj.created_at=new Date().toISOString();DATA.coach_notes.push(obj)}
  saveData(DATA);closeModal();renderCoachNotes('academySubContent');updateCounts();toast(id?'Nota actualizada':'Nota creada');
}
function delCoachNote(id){if(!confirmDel())return;DATA.coach_notes=DATA.coach_notes.filter(function(n){return n.id!==id});saveData(DATA);renderCoachNotes('academySubContent');updateCounts();toast('Nota eliminada');}
function viewCoachNote(id){
  var n=(DATA.coach_notes||[]).find(function(x){return x.id===id});
  if(!n)return;
  openModal('<button class="modal-close" onclick="closeModal()">'+ic('x',16)+'</button><h3>Nota: '+esc(n.member_name)+'</h3><div style="color:#888;font-size:13px;line-height:1.8;white-space:pre-wrap">'+esc(n.note)+'</div>');
}
function academyForm(id){
  var item=id?(DATA.academy||[]).find(function(a){return a.id===id}):null;
  var f=item||{day:'Lunes',topic:'',objectives:[],prerequisites:[],duration:'',group_id:'',coach:dc(),image_url:'',attachment_url:'',attachment_name:''};
   openModal('<button class="modal-close" onclick="closeModal()">'+ic('x',16)+'</button><h3>'+(item?'Editar':'Nueva')+' Clase</h3>'+
    '<div class="field"><label>Día</label><select class="input-field" id="af_day">'+['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'].map(function(d){return'<option value="'+d+'" '+(d===f.day?'selected':'')+'>'+d+'</option>'}).join('')+'</select></div>'+
    '<div class="field"><label>Tema</label><input class="input-field" id="af_topic" value="'+esc(f.topic)+'"></div>'+
    '<div class="field"><label>Coach / Instructor</label><select class="input-field" id="af_coach" onchange="setGroupFromCoach(\'acf_group\',\'af_coach\')"><option value="">Sin coach</option>'+coachOptions(f.coach||'',f.group_id)+'</select></div>'+
    '<div class="field"><label>Duración</label><input class="input-field" id="af_duration" placeholder="ej: 90 min" value="'+esc(f.duration||'')+'"></div>'+
    '<div class="field"><label>Requisitos previos (uno por línea)</label><textarea class="input-field" id="af_prereqs" rows="3" placeholder="ej: Rango mínimo Oro">'+esc((f.prerequisites||[]).join('\n'))+'</textarea></div>'+
    '<div class="field"><label>Objetivos (uno por línea)</label><textarea class="input-field" id="af_objectives" rows="4">'+esc((f.objectives||[]).join('\n'))+'</textarea></div>'+
     '<div class="field"><label>Grupo</label><select class="input-field" id="acf_group" onchange="reloadCoachDropdown(\'af_coach\',this.value)"><option value="">General (Ambos)</option>'+(DATA.groups||[]).map(function(g){return'<option value="'+g.id+'"'+(f.group_id===g.id?' selected':'')+'>'+esc(g.name)+'</option>'}).join('')+'</select></div>'+
    '<hr>'+
    '<div class="field"><label>Imagen</label>'+fileUploadHTML('Imagen','image/*','af_img_status','af_image_url',f.image_url||'')+(f.image_url?mediaPreview(f.image_url):'')+'</div>'+
    '<div class="field"><label>Archivo adjunto (PDF)</label>'+fileUploadHTML('PDF','.pdf,application/pdf','af_doc_status','af_attachment_url',f.attachment_url||'')+'<input class="input-field" id="af_attachment_name" placeholder="Nombre del archivo" value="'+esc(f.attachment_name||'')+'"></div>'+
    '<button class="btn-primary" onclick="saveAcademy(\''+(id||'')+'\')" style="width:100%;justify-content:center">'+ic('save',16)+' Guardar</button>');
}
function saveAcademy(id){
  var obj={day:document.getElementById('af_day').value,
    topic:document.getElementById('af_topic').value,
    coach:document.getElementById('af_coach').value,
    duration:document.getElementById('af_duration').value,
    prerequisites:document.getElementById('af_prereqs').value.split('\n').map(function(s){return s.trim()}).filter(function(s){return s}),
    objectives:document.getElementById('af_objectives').value.split('\n').map(function(s){return s.trim()}).filter(function(s){return s}),group_id:document.getElementById('acf_group').value,
    image_url:document.getElementById('af_image_url').value,attachment_url:document.getElementById('af_attachment_url').value,attachment_name:document.getElementById('af_attachment_name').value};
  if(!DATA.academy)DATA.academy=[];
  if(id){var idx=DATA.academy.findIndex(function(a){return a.id===id});if(idx>=0)DATA.academy[idx]={...DATA.academy[idx],...obj}}else{obj.id=uid();DATA.academy.push(obj)}
  saveData(DATA);closeModal();renderAcademy();updateCounts();toast(id?'Clase actualizada':'Clase creada');
}
function delAcademy(id){if(!confirmDel())return;DATA.academy=DATA.academy.filter(function(a){return a.id!==id});saveData(DATA);renderAcademy();updateCounts();toast('Clase eliminada');}
function viewAcademyTopic(id){
  var a=(DATA.academy||[]).find(function(x){return x.id===id});
  if(!a)return;
  openModal('<button class="modal-close" onclick="closeModal()">'+ic('x',16)+'</button><h3>Tema: '+esc(a.topic)+'</h3><div style="color:#888;font-size:13px;line-height:1.8;white-space:pre-wrap">'+esc(a.topic)+'</div>');
}

// ========== CRUD: STATS ==========
function renderStats(){
  var items=filterByCurrentCoach(DATA.stats||[]);
  var btn='<button class="btn-primary" onclick="statsForm(null)" style="margin-bottom:14px;font-size:13px">'+ic('plus',14)+' Nuevas Stats</button>';
  document.getElementById('adminContent').innerHTML=adminTable(items,['Temporada','Partidas','Victorias','Derrotas','MVPs','Grupo'],function(s){
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
  saveData(DATA);closeModal();renderStats();updateCounts();toast(id?'Stats actualizadas':'Stats creadas');
}
function delStats(id){if(!confirmDel())return;DATA.stats=DATA.stats.filter(function(s){return s.id!==id});saveData(DATA);renderStats();updateCounts();toast('Stats eliminadas');}

// ========== CRUD: APPLICATIONS ==========
function renderApplications(){
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
        (a.objectives?'<div class="has-glow" style="font-size:14px;margin-bottom:8px;padding:10px 14px;background:rgba(139,92,246,0.04);border-radius:8px;border-left:3px solid var(--neon)"><span style="color:#666;font-weight:600">🎯 Objetivos:</span><br><span style="color:#ccc">'+esc(a.objectives)+'</span></div>':'')+
        (a.reason?'<div class="has-glow" style="font-size:14px;margin-bottom:6px;padding:10px 14px;background:rgba(139,92,246,0.04);border-radius:8px;border-left:3px solid var(--neon)"><span style="color:#666;font-weight:600">💪 Motivación:</span><br><span style="color:#ccc">'+esc(a.reason)+'</span></div>':'')+
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
  // Build list of coach names with their current student count
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
function distributeStudents(){
  if(!confirm('¿Asignar grupo según rango y distribuir entre coaches automáticamente?'))return;
  var changes=0;
  // First pass: assign group from rank for members without a group
  (DATA.members||[]).forEach(function(m){
    var g=getGroupFromRank(m.rank);
    if(g&&(!m.group_id||m.group_id!==g)){m.group_id=g;changes++}
  });
  // Second pass: distribute unassigned members among coaches per group
  (DATA.groups||[]).forEach(function(g){
    var groupCoaches=(DATA.group_coaches||[]).filter(function(gc){return gc.group_id===g.id});
    if(!groupCoaches.length)return;
    var coachNames=groupCoaches.map(function(gc){
      var c=(DATA.coaches||[]).find(function(c){return c.id===gc.coach_id});
      return c?c.name:null;
    }).filter(Boolean);
    if(!coachNames.length)return;
    var members=(DATA.members||[]).filter(function(m){return m.group_id===g.id});
    var unassigned=members.filter(function(m){return !m.coach||coachNames.indexOf(m.coach)<0});
    if(!unassigned.length)return;
    var counts={};
    coachNames.forEach(function(n){counts[n]=members.filter(function(m){return m.coach===n}).length});
    unassigned.forEach(function(m){
      var min=Infinity,best='';
      coachNames.forEach(function(n){
        if(counts[n]<min){min=counts[n];best=n}
      });
      if(best){m.coach=best;counts[best]++;changes++}
    });
  });
  if(changes){saveData(DATA);renderMembers();updateCounts();toast(changes+' cambio(s) aplicados','ok')}
  else toast('Todos ya tienen grupo y coach asignado','info');
}
function resetMemberAssignments(){
  if(!confirm('¿Quitar grupo y coach de TODOS los miembros? Los rangos se conservan.'))return;
  (DATA.members||[]).forEach(function(m){m.group_id='';m.coach=''});
  saveData(DATA);renderMembers();updateCounts();toast('Asignaciones de grupo/coach limpiadas','ok');
}
function acceptApp(id){
  if(!confirm('¿Aceptar esta solicitud?'))return;
  var idx=DATA.applications.findIndex(function(a){return a.id===id});
  if(idx<0)return;
  var a=DATA.applications[idx];
  var memberName=a.valorant||a.name;
  if((DATA.members||[]).find(function(m){return m.name.toLowerCase()===memberName.toLowerCase()})){
    toast('Ya existe un miembro con ese nombre: '+memberName,'err');renderApplications();return
  }
  a.status='accepted';
  var groupId=getGroupFromRank(a.rank||'');
  var coach=groupId?autoAssignCoach(groupId):'';
  var member={id:uid(),name:memberName,role:a.main_role||'Miembro',rank:a.rank||'',group_id:groupId,coach:coach,image:'',description:''};
  DATA.members.push(member);
  saveData(DATA);
  var toastMsg='Solicitud aceptada — añadido a Miembros'+(coach?' (Coach: '+coach+')':'');
  if(db&&db.from){
    db.from('applications').update({status:'accepted'}).eq('id',id).then(function(){return db.from('members').insert([member])}).then(function(){renderApplications();renderMembers();updateCounts();toast(toastMsg)}).catch(function(e){toast('Error: '+e.message,'error')});
  }else{
    renderApplications();renderMembers();updateCounts();toast(toastMsg+' (solo local)');
  }
}
function rejectApp(id){
  if(!confirm('¿Rechazar esta solicitud?'))return;
  var idx=DATA.applications.findIndex(function(a){return a.id===id});
  if(idx<0)return;
  DATA.applications[idx].status='rejected';
  saveData(DATA);
  if(db&&db.from){
    db.from('applications').update({status:'rejected'}).eq('id',id).then(function(){renderApplications();updateCounts();toast('Solicitud rechazada')}).catch(function(e){toast('Error: '+e.message,'error')});
  }else{
    renderApplications();updateCounts();toast('Solicitud rechazada (solo local)');
  }
}
function delApp(id){
  if(!confirm('¿Eliminar esta solicitud permanentemente?'))return;
  DATA.applications=DATA.applications.filter(function(a){return a.id!==id});
  saveData(DATA);
  if(db&&db.from){
    db.from('applications').delete().eq('id',id).then(function(){renderApplications();updateCounts();toast('Solicitud eliminada')}).catch(function(e){toast('Error: '+e.message,'error')});
  }else{
    renderApplications();updateCounts();toast('Solicitud eliminada (solo local)');
  }
}

// ========== ATTENDANCE ==========
function renderAttendance(cId){cId=cId||'adminContent';
  var classes=filterByCurrentCoach((DATA.schedule||[]).filter(function(s){return s.type==='academia'}));
  var allMembers=DATA.members||[];
  var members=currentUser&&currentUser.coachName?filterByCurrentCoach(allMembers):allMembers;
  var att=DATA.attendance||[];
  var today=new Date().toISOString().slice(0,10);
  var h='<div style="display:grid;gap:20px">';
  // Stats summary
  h+='<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">'+
    '<div class="glass-card" style="padding:16px;text-align:center"><div class="number gradient-text">'+classes.length+'</div><div style="color:#888;font-size:13px">Clases semanales</div></div>'+
    '<div class="glass-card" style="padding:16px;text-align:center"><div class="number" style="color:#8b5cf6">'+att.filter(function(a){return a.status==='present'}).length+'</div><div style="color:#888;font-size:13px">Asistencias</div></div>'+
    '<div class="glass-card" style="padding:16px;text-align:center"><div class="number" style="color:#8b5cf6">'+att.filter(function(a){return a.status==='absent'||a.status==='late'}).length+'</div><div style="color:#888;font-size:13px">Faltas/Tardanzas</div></div>'+
  '</div>';
  // Stats per member
  h+='<div class="glass-card" style="padding:20px"><h3 style="margin-bottom:12px">'+ic('bar-chart-3',18)+' Estadísticas por miembro</h3><div style="display:grid;gap:8px">';
  members.forEach(function(m){
    var ma=att.filter(function(a){return a.member_name===m.name});
    var p=ma.filter(function(a){return a.status==='present'}).length;
    var a=ma.filter(function(a){return a.status==='absent'}).length;
    var l=ma.filter(function(a){return a.status==='late'}).length;
    var t=ma.length||1;
    h+='<div class="has-glow" style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:rgba(255,255,255,0.02);border-radius:8px">'+
      '<span style="font-weight:500">'+esc(m.name)+'</span>'+
      '<span style="color:#888;font-size:13px"><span style="color:#8b5cf6">'+p+'</span> · <span style="color:#8b5cf6">'+a+'</span> · <span style="color:#a78bfa">'+l+'</span> · <span style="color:#555">'+Math.round(p/t*100)+'%</span></span>'+
    '</div>';
  });
  if(!members.length)h+='<div style="color:#555;text-align:center;padding:20px">No hay miembros registrados</div>';
  h+='</div></div>';
  // Confirmaciones de asistencia
  var confs=DATA.attendance_confirmations||[];
  var todayStr=new Date().toISOString().slice(0,10);
  var todayConfs=confs.filter(function(c){return c.date===todayStr});
  h+='<div class="glass-card" style="padding:20px"><h3 style="margin-bottom:12px">'+ic('calendar-check',18)+' Confirmaciones hoy ('+todayStr+')</h3>'+
    (todayConfs.length?'<div style="display:grid;gap:6px">'+todayConfs.map(function(c){
      return '<div class="has-glow" style="display:flex;justify-content:space-between;padding:8px 14px;background:rgba(255,255,255,0.03);border-radius:8px">'+
        '<span>'+esc(c.member_name)+'</span><span style="color:'+(c.will_attend?'#8b5cf6':'#8b5cf6')+'">'+(c.will_attend?'✔ Asistirá':'✘ No asistirá')+'</span></div>';
    }).join('')+'</div>':'<div style="color:#555;padding:12px;text-align:center">Nadie ha confirmado aún hoy</div>')+
  '</div>';
  // Mark / edit attendance per class
  if(!classes.length){
    h+='<div class="empty-state"><div class="icon">'+ic('calendar',40)+'</div><p>No hay clases de academia en el horario. Crea una en Horarios con tipo "academia".</p></div>';
  }else{
    h+='<div class="glass-card" style="padding:20px"><h3 style="margin-bottom:12px">'+ic('clipboard-check',18)+' Marcar / Editar asistencia</h3>';
    h+='<div style="display:grid;gap:12px;max-width:500px">'+
      '<div class="field"><label>Clase</label><select class="input-field" id="attClassSelect" onchange="renderAttMemberList()">'+
      classes.map(function(c,i){var days=['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];return'<option value="'+c.id+'">'+esc(c.title)+' ('+days[c.day]+' '+c.start+')</option>'}).join('')+
      '</select></div>'+
      '<div class="field"><label>Fecha</label><input type="date" class="input-field" id="attDate" value="'+today+'" onchange="renderAttMemberList()"></div>'+
    '</div>';
    h+='<div id="attMemberList"></div>';
    h+='<button class="btn-primary" onclick="saveAllAttendance()" style="margin-top:14px;justify-content:center">'+ic('save',16)+' Guardar Asistencia</button>'+
    '</div>';
  }
  h+='</div>';
  document.getElementById(cId).innerHTML=h;
  if(classes.length)renderAttMemberList();
}
var _attPending={};
function renderAttMemberList(){
  var allMembers=DATA.members||[];
  var members=currentUser&&currentUser.coachName?filterByCurrentCoach(allMembers):allMembers;
  var att=DATA.attendance||[];
  var date=document.getElementById('attDate').value;
  var sid=document.getElementById('attClassSelect').value;
  var container=document.getElementById('attMemberList');
  if(!container)return;
  if(!members.length){container.innerHTML='<div style="color:#555;text-align:center;padding:20px">No hay miembros para marcar asistencia. Agrega miembros primero.</div>';return}
  _attPending={};
  var h='<div style="margin-top:14px;display:grid;gap:8px">';
  members.forEach(function(m){
    var existing=att.filter(function(a){return a.schedule_id===sid&&a.member_name===m.name&&a.date===date});
    var cur=existing.length?existing[0].status:'present';
    if(!existing.length)_attPending[m.name]='present';
    else _attPending[m.name]=cur;
    h+='<div class="has-glow" style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:rgba(255,255,255,0.02);border-radius:8px">'+
      '<span>'+esc(m.name)+'</span>'+
      '<div style="display:flex;gap:6px">'+
        '<button class="btn-sm '+(cur==='present'?'save':'cancel')+'" onclick="markAtt(\''+m.name+'\',\'present\',this)" data-stat="present">'+ic('check',14)+' Presente</button>'+
        '<button class="btn-sm '+(cur==='late'?'danger':'cancel')+'" onclick="markAtt(\''+m.name+'\',\'late\',this)" data-stat="late">'+ic('clock',14)+' Tarde</button>'+
        '<button class="btn-sm '+(cur==='absent'?'danger':'cancel')+'" onclick="markAtt(\''+m.name+'\',\'absent\',this)" data-stat="absent">'+ic('x',14)+' Ausente</button>'+
      '</div></div>';
  });
  h+='</div>';
  container.innerHTML=h;
  if(typeof lucide!=='undefined')lucide.createIcons();
}
function markAtt(name,status,btn){
  _attPending[name]=status;
  var container=btn.closest('[style*="display:flex"]');
  if(container){
    container.querySelectorAll('.btn-sm').forEach(function(b){b.className=b.className.replace(/save|danger/g,'').trim()+' cancel'});
    btn.className='btn-sm save';
  }
}
function saveAllAttendance(){
  var date=document.getElementById('attDate').value;
  var sid=document.getElementById('attClassSelect').value;
  if(!sid){toast('Seleccioná un horario primero','error');return}
  if(!(DATA.schedule||[]).some(function(s){return s.id===sid})){toast('El horario seleccionado ya no existe, recargá la página','error');return}
  var names=Object.keys(_attPending);
  if(!names.length){toast('Selecciona estado para al menos un miembro','error');return}
  var records=names.filter(function(n){return _attPending[n]}).map(function(n){return{schedule_id:sid,member_name:n,date:date,status:_attPending[n],marked_by:'coach'}});
  if(!records.length){toast('No hay cambios para guardar','error');return}
  var allData=DATA.attendance||[];
  records.forEach(function(r){
    allData=allData.filter(function(a){return!(a.schedule_id===r.schedule_id&&a.member_name===r.member_name&&a.date===r.date)});
  });
  allData=allData.concat(records);
  DATA.attendance=allData;
  saveData(DATA);
  if(db&&db.from){
    db.from('attendance').delete().eq('schedule_id',sid).eq('date',date).then(function(){
      if(records.length)return db.from('attendance').insert(records);
    }).then(function(){if(_inAcademyTab)renderAttendance('academySubContent');else renderAttendance();updateCounts();_attPending={};toast('Asistencia guardada')}).catch(function(e){toast('Error: '+e.message,'error')});
  }else{
    if(_inAcademyTab)renderAttendance('academySubContent');else renderAttendance();updateCounts();_attPending={};toast('Asistencia guardada (solo local)');
  }
}

// ========== CRUD: ANNOUNCEMENTS ==========
function renderAnnouncements(){
  var items=filterByCurrentCoach(DATA.announcements||[]);
  var btn='<button class="btn-primary" onclick="announcementForm(null)" style="margin-bottom:14px;font-size:13px">'+ic('plus',14)+' Nuevo Anuncio</button>';
  document.getElementById('adminContent').innerHTML=adminTable(items,['Título','Autor','Coach','Fijado','Grupo','Archivos'],function(a){
    return '<td>'+esc(a.title)+'</td><td>'+esc(a.author)+'</td><td>'+esc(a.coach||'-')+'</td><td>'+(a.pinned?'<span class="badge badge-green">Sí</span>':'<span class="badge badge-gray">No</span>')+'</td><td>'+groupName(a.group_id)+'</td><td>'+(a.image_url?'<a href="'+esc(a.image_url)+'" target="_blank" title="Ver imagen">'+ic('image',14)+'</a> ':'')+(a.attachment_url?'<a href="'+esc(a.attachment_url)+'" target="_blank" title="Descargar '+esc(a.attachment_name||'archivo')+'">'+ic('paperclip',14)+'</a>':'')+'</td><td><div class="has-glow admin-actions"><button onclick="announcementForm(\''+a.id+'\')">'+ic('pencil',14)+'</button><button class="del" onclick="delAnnouncement(\''+a.id+'\')">'+ic('trash-2',14)+'</button></div></td>'},'No hay anuncios',btn);
}
function announcementForm(id){
  var item=id?(DATA.announcements||[]).find(function(a){return a.id===id}):null;
  var f=item||{title:'',content:'',author:'',pinned:false,coach:dc(),group_id:'',image_url:'',attachment_url:'',attachment_name:''};
  openModal('<button class="modal-close" onclick="closeModal()">'+ic('x',16)+'</button><h3>'+(item?'Editar':'Nuevo')+' Anuncio</h3>'+
    '<div class="field"><label>Título</label><input class="input-field" id="af_title" value="'+esc(f.title)+'"></div>'+
    '<div class="field"><label>Contenido</label><textarea class="input-field" id="af_content" rows="4">'+esc(f.content||'')+'</textarea></div>'+
    '<div class="field"><label>Autor</label><input class="input-field" id="af_author" value="'+esc(f.author)+'"></div>'+
    '<div class="field"><label style="display:flex;align-items:center;gap:8px;cursor:pointer"><input type="checkbox" id="af_pinned" '+(f.pinned?'checked':'')+'> Fijado</label></div>'+
    '<div class="field"><label>Coach</label><select class="input-field" id="af_coach" onchange="setGroupFromCoach(\'af_group\',\'af_coach\')"><option value="">Sin coach</option>'+coachOptions(f.coach||'',f.group_id)+'</select></div>'+
    '<div class="field" style="display:none"><label>Grupo</label><select class="input-field" id="af_group" onchange="reloadCoachDropdown(\'af_coach\',this.value)"><option value="">General (Ambos)</option>'+(DATA.groups||[]).map(function(g){return'<option value="'+g.id+'"'+(f.group_id===g.id?' selected':'')+'>'+esc(g.name)+'</option>'}).join('')+'</select></div>'+
    '<hr>'+
    '<div class="field"><label>Imagen</label>'+fileUploadHTML('Imagen','image/*','anf_img_status','anf_image_url',f.image_url||'')+(f.image_url?mediaPreview(f.image_url):'')+'</div>'+
    '<div class="field"><label>Archivo adjunto (PDF)</label>'+fileUploadHTML('PDF','.pdf,application/pdf','anf_doc_status','anf_attachment_url',f.attachment_url||'')+'<input class="input-field" id="anf_attachment_name" placeholder="Nombre del archivo" value="'+esc(f.attachment_name||'')+'"></div>'+
    '<button class="btn-primary" onclick="saveAnnouncement(\''+(id||'')+'\')" style="width:100%;justify-content:center">'+ic('save',16)+' Guardar</button>');
}
function saveAnnouncement(id){
  var obj={title:document.getElementById('af_title').value,content:document.getElementById('af_content').value,author:document.getElementById('af_author').value,pinned:document.getElementById('af_pinned').checked,coach:document.getElementById('af_coach').value,group_id:document.getElementById('af_group').value,image_url:document.getElementById('anf_image_url').value,attachment_url:document.getElementById('anf_attachment_url').value,attachment_name:document.getElementById('anf_attachment_name').value};
  if(!DATA.announcements)DATA.announcements=[];
  if(id){var idx=DATA.announcements.findIndex(function(a){return a.id===id});if(idx>=0)DATA.announcements[idx]={...DATA.announcements[idx],...obj}}else{obj.id=uid();DATA.announcements.push(obj)}
  saveData(DATA);closeModal();renderAnnouncements();updateCounts();toast(id?'Anuncio actualizado':'Anuncio creado');
}
function delAnnouncement(id){if(!confirmDel())return;DATA.announcements=DATA.announcements.filter(function(a){return a.id!==id});saveData(DATA);renderAnnouncements();updateCounts();toast('Anuncio eliminado');}

// ========== CRUD: CURRICULUM ==========
function renderCurriculum(cId){cId=cId||'adminContent';
  var items=filterByCurrentCoach(DATA.curriculum||[]);
  var btn='<button class="btn-primary" onclick="curriculumForm(null)" style="margin-bottom:14px;font-size:13px">'+ic('plus',14)+' Nuevo Tema</button>';
  document.getElementById(cId).innerHTML=adminTable(items,['Título','Semana','Temas','Coach','Grupo','Archivos'],function(c){
    var topics=(c.topics||[]).map(function(t){return esc(t)}).join('<br>');
    return '<td>'+esc(c.title)+'</td><td>Semana '+c.week+'</td><td><div class="cell-preview" onclick="viewCurriculum(\''+c.id+'\')" title="Ver todos los temas">'+topics+'</div></td><td>'+esc(c.coach||'—')+'</td><td>'+groupName(c.group_id)+'</td><td>'+(c.image_url?'<a href="'+esc(c.image_url)+'" target="_blank" title="Ver imagen">'+ic('image',14)+'</a> ':'')+(c.attachment_url?'<a href="'+esc(c.attachment_url)+'" target="_blank" title="Descargar '+esc(c.attachment_name||'archivo')+'">'+ic('paperclip',14)+'</a>':'')+'</td><td><div class="has-glow admin-actions"><button onclick="curriculumForm(\''+c.id+'\')">'+ic('pencil',14)+'</button><button class="del" onclick="delCurriculum(\''+c.id+'\')">'+ic('trash-2',14)+'</button></div></td>'},'No hay plan de estudio',btn);
}
function curriculumForm(id){
  var item=id?(DATA.curriculum||[]).find(function(c){return c.id===id}):null;
  var f=item||{title:'',description:'',week:1,topics:[],color:'#8B5CF6',group_id:'',coach:dc(),image_url:'',attachment_url:'',attachment_name:''};
  openModal('<button class="modal-close" onclick="closeModal()">'+ic('x',16)+'</button><h3>'+(item?'Editar':'Nuevo')+' Tema</h3>'+
    '<div class="field"><label>Título</label><input class="input-field" id="cf_title" value="'+esc(f.title)+'"></div>'+
    '<div class="field"><label>Descripción</label><textarea class="input-field" id="cf_description" rows="3">'+esc(f.description||'')+'</textarea></div>'+
    '<div class="field"><label>Semana</label><input type="number" class="input-field" id="cf_week" value="'+f.week+'"></div>'+
    '<div class="field"><label>Temas (uno por línea)</label><textarea class="input-field" id="cf_topics" rows="4">'+esc((f.topics||[]).join('\n'))+'</textarea></div>'+
    '<div class="field"><label>Color</label><input type="text" class="input-field" id="cf_color" value="'+esc(f.color)+'"></div>'+
    '<div class="field" style="display:none"><label>Grupo</label><select class="input-field" id="cf_group" onchange="reloadCoachDropdown(\'cf_coach\',this.value)"><option value="">General (Ambos)</option>'+(DATA.groups||[]).map(function(g){return'<option value="'+g.id+'"'+(f.group_id===g.id?' selected':'')+'>'+esc(g.name)+'</option>'}).join('')+'</select></div>'+
    '<div class="field"><label>Coach asignado</label><select class="input-field" id="cf_coach" onchange="setGroupFromCoach(\'cf_group\',\'cf_coach\')"><option value="">Sin coach</option>'+coachOptions(f.coach||'',f.group_id)+'</select></div>'+
    '<hr>'+
    '<div class="field"><label>Imagen</label>'+fileUploadHTML('Imagen','image/*','cf_img_status','cf_image_url',f.image_url||'')+(f.image_url?mediaPreview(f.image_url):'')+'</div>'+
    '<div class="field"><label>Archivo adjunto (PDF)</label>'+fileUploadHTML('PDF','.pdf,application/pdf','cf_doc_status','cf_attachment_url',f.attachment_url||'')+'<input class="input-field" id="cf_attachment_name" placeholder="Nombre del archivo" value="'+esc(f.attachment_name||'')+'"></div>'+
    '<button class="btn-primary" onclick="saveCurriculum(\''+(id||'')+'\')" style="width:100%;justify-content:center">'+ic('save',16)+' Guardar</button>');
}
function saveCurriculum(id){
  var obj={title:document.getElementById('cf_title').value,description:document.getElementById('cf_description').value,week:parseInt(document.getElementById('cf_week').value)||1,topics:document.getElementById('cf_topics').value.split('\n').map(function(s){return s.trim()}).filter(function(s){return s}),color:document.getElementById('cf_color').value,group_id:document.getElementById('cf_group').value,coach:document.getElementById('cf_coach')?.value||'',image_url:document.getElementById('cf_image_url').value,attachment_url:document.getElementById('cf_attachment_url').value,attachment_name:document.getElementById('cf_attachment_name').value};
  if(!DATA.curriculum)DATA.curriculum=[];
  if(id){var idx=DATA.curriculum.findIndex(function(c){return c.id===id});if(idx>=0)DATA.curriculum[idx]={...DATA.curriculum[idx],...obj}}else{obj.id=uid();DATA.curriculum.push(obj)}
  saveData(DATA);closeModal();if(_inAcademyTab)renderAcademyContent();else renderCurriculum();updateCounts();toast(id?'Tema actualizado':'Tema creado');
}
function delCurriculum(id){if(!confirmDel())return;DATA.curriculum=DATA.curriculum.filter(function(c){return c.id!==id});saveData(DATA);if(_inAcademyTab)renderAcademyContent();else renderCurriculum();updateCounts();toast('Tema eliminado');}
function viewCurriculum(id){
  var c=(DATA.curriculum||[]).find(function(x){return x.id===id});
  if(!c)return;
  openModal('<button class="modal-close" onclick="closeModal()">'+ic('x',16)+'</button><h3>'+esc(c.title)+'</h3><div style="color:#888;font-size:13px;line-height:1.8;white-space:pre-wrap;max-height:70vh;overflow-y:auto;padding-right:8px">'+(c.topics||[]).map(function(t){return esc(t)}).join('<br>')+'</div>');
}

// ========== CRUD: MATERIALS ==========
function renderMaterials(cId){cId=cId||'adminContent';
  var items=filterByCurrentCoach(DATA.materials||[]);
  var btn='<button class="btn-primary" onclick="materialForm(null)" style="margin-bottom:14px;font-size:13px">'+ic('plus',14)+' Nuevo Material</button>';
  document.getElementById(cId).innerHTML=adminTable(items,['Título','Tipo','Coach','Grupo','Archivos'],function(m){
    return '<td>'+esc(m.title)+'</td><td><span class="badge badge-purple">'+esc(m.type)+'</span></td><td>'+esc(m.coach||'—')+'</td><td>'+groupName(m.group_id)+'</td><td>'+(m.image_url?'<a href="'+esc(m.image_url)+'" target="_blank" title="Ver imagen">'+ic('image',14)+'</a> ':'')+(m.attachment_url?'<a href="'+esc(m.attachment_url)+'" target="_blank" title="Descargar '+esc(m.attachment_name||'archivo')+'">'+ic('paperclip',14)+'</a>':'')+'</td><td><div class="has-glow admin-actions"><button onclick="materialForm(\''+m.id+'\')">'+ic('pencil',14)+'</button><button class="del" onclick="delMaterial(\''+m.id+'\')">'+ic('trash-2',14)+'</button></div></td>'},'No hay materiales',btn);
}
function materialForm(id){
  var item=id?(DATA.materials||[]).find(function(m){return m.id===id}):null;
  var f=item||{schedule_id:'',title:'',description:'',url:'',type:'video',group_id:'',coach:dc(),image_url:'',attachment_url:'',attachment_name:''};
  var classes=(DATA.schedule||[]).filter(function(s){return s.type==='academia'});
  openModal('<button class="modal-close" onclick="closeModal()">'+ic('x',16)+'</button><h3>'+(item?'Editar':'Nuevo')+' Material</h3>'+
    '<div class="field"><label>Clase</label><select class="input-field" id="mf_schedule_id">'+    (classes.length?classes.map(function(c){var days=['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];return'<option value="'+c.id+'" '+(c.id===f.schedule_id?'selected':'')+'>'+esc(c.title)+' ('+days[c.day]+')</option>'}).join(''):'<option value="">Sin clases de academia</option>')+'</select></div>'+
    '<div class="field"><label>Título</label><input class="input-field" id="mf_title" value="'+esc(f.title)+'"></div>'+
    '<div class="field"><label>Descripción</label><textarea class="input-field" id="mf_description" rows="3">'+esc(f.description||'')+'</textarea></div>'+
    '<div class="field"><label>URL</label><input class="input-field" id="mf_url" value="'+esc(f.url)+'"></div>'+
    '<div class="field"><label>Tipo</label><select class="input-field" id="mf_type"><option value="video" '+(f.type==='video'?'selected':'')+'>Video</option><option value="guide" '+(f.type==='guide'?'selected':'')+'>Guía</option><option value="pdf" '+(f.type==='pdf'?'selected':'')+'>PDF</option><option value="other" '+(f.type==='other'?'selected':'')+'>Otro</option></select></div>'+
    '<div class="field" style="display:none"><label>Grupo</label><select class="input-field" id="mf_group" onchange="reloadCoachDropdown(\'mf_coach\',this.value)"><option value="">General (Ambos)</option>'+(DATA.groups||[]).map(function(g){return'<option value="'+g.id+'"'+(f.group_id===g.id?' selected':'')+'>'+esc(g.name)+'</option>'}).join('')+'</select></div>'+
    '<div class="field"><label>Coach asignado</label><select class="input-field" id="mf_coach" onchange="setGroupFromCoach(\'mf_group\',\'mf_coach\')"><option value="">Sin coach</option>'+coachOptions(f.coach||'',f.group_id)+'</select></div>'+
    '<hr>'+
    '<div class="field"><label>Imagen</label>'+fileUploadHTML('Imagen','image/*','mf_img_status','mf_image_url',f.image_url||'')+(f.image_url?mediaPreview(f.image_url):'')+'</div>'+
    '<div class="field"><label>Archivo adjunto (PDF)</label>'+fileUploadHTML('PDF','.pdf,application/pdf','mf_doc_status','mf_attachment_url',f.attachment_url||'')+'<input class="input-field" id="mf_attachment_name" placeholder="Nombre del archivo" value="'+esc(f.attachment_name||'')+'"></div>'+
    '<button class="btn-primary" onclick="saveMaterial(\''+(id||'')+'\')" style="width:100%;justify-content:center">'+ic('save',16)+' Guardar</button>');
}
function saveMaterial(id){
  var obj={schedule_id:document.getElementById('mf_schedule_id').value||null,title:document.getElementById('mf_title').value,description:document.getElementById('mf_description').value,url:document.getElementById('mf_url').value,type:document.getElementById('mf_type').value,group_id:document.getElementById('mf_group').value,coach:document.getElementById('mf_coach')?.value||'',image_url:document.getElementById('mf_image_url').value,attachment_url:document.getElementById('mf_attachment_url').value,attachment_name:document.getElementById('mf_attachment_name').value};
  if(!DATA.materials)DATA.materials=[];
  if(id){var idx=DATA.materials.findIndex(function(m){return m.id===id});if(idx>=0)DATA.materials[idx]={...DATA.materials[idx],...obj}}else{obj.id=uid();DATA.materials.push(obj)}
  saveData(DATA);closeModal();if(_inAcademyTab)renderAcademyContent();else renderMaterials();updateCounts();toast(id?'Material actualizado':'Material creado');
}
function delMaterial(id){if(!confirmDel())return;DATA.materials=DATA.materials.filter(function(m){return m.id!==id});saveData(DATA);if(_inAcademyTab)renderAcademyContent();else renderMaterials();updateCounts();toast('Material eliminado');}

// ========== CRUD: TASKS ==========
function renderTasks(cId){cId=cId||'adminContent';
  var items=filterByCurrentCoach(DATA.tasks||[]);
  var btn='<button class="btn-primary" onclick="taskForm(null)" style="margin-bottom:14px;font-size:13px">'+ic('plus',14)+' Nueva Tarea</button>';
  var h=adminTable(items,['Título','Tipo','Vence','Coach','Grupo','Archivos'],function(t){
    return '<td>'+esc(t.title)+'</td><td><span class="badge badge-blue">'+esc(t.type)+'</span></td><td>'+esc(t.due_date||'-')+'</td><td>'+esc(t.coach||'—')+'</td><td>'+groupName(t.group_id)+'</td><td>'+(t.image_url?'<a href="'+esc(t.image_url)+'" target="_blank" title="Ver imagen">'+ic('image',14)+'</a> ':'')+(t.attachment_url?'<a href="'+esc(t.attachment_url)+'" target="_blank" title="Descargar '+esc(t.attachment_name||'archivo')+'">'+ic('paperclip',14)+'</a>':'')+'</td><td><div class="has-glow admin-actions"><button onclick="showTaskCompletions(\''+t.id+'\')" title="Ver completados">'+ic('eye',14)+'</button><button onclick="taskForm(\''+t.id+'\')">'+ic('pencil',14)+'</button><button class="del" onclick="delTask(\''+t.id+'\')">'+ic('trash-2',14)+'</button></div></td>'},'No hay tareas',btn);
  var tc=DATA.task_completions||[];
  var grouped={};tc.forEach(function(c){if(!grouped[c.task_id])grouped[c.task_id]=[];grouped[c.task_id].push(c)});
  if(Object.keys(grouped).length){h+='<div class="glass-card" style="padding:20px;margin-top:20px"><h3 style="font-family:var(--font-display);font-size:15px;margin-bottom:14px">'+ic('check-circle',16)+' Completaciones por tarea</h3>';
    Object.keys(grouped).forEach(function(tid){
      var task=(DATA.tasks||[]).find(function(t){return t.id===tid});
      h+='<div class="has-glow" style="margin-bottom:16px;padding:16px;background:rgba(255,255,255,0.02);border-radius:8px"><strong style="font-size:14px">'+esc(task?task.title:'(eliminada)')+'</strong><div style="display:grid;gap:8px;margin-top:12px">';
      grouped[tid].forEach(function(c){h+='<div style="display:flex;justify-content:space-between;font-size:13px;color:#bbb;padding:6px 0"><span>'+esc(c.member_name)+'</span><span style="color:#666">'+(c.completed_at?new Date(c.completed_at).toLocaleString('es-ES'):'-')+'</span></div>'});
      h+='</div></div>';
    });
    h+='</div>';
  }
  document.getElementById(cId).innerHTML=h;
}
function taskForm(id){
  var item=id?(DATA.tasks||[]).find(function(t){return t.id===id}):null;
  var f=item||{title:'',description:'',type:'vod',due_date:'',group_id:'',coach:dc(),image_url:'',attachment_url:'',attachment_name:''};
  openModal('<button class="modal-close" onclick="closeModal()">'+ic('x',16)+'</button><h3>'+(item?'Editar':'Nueva')+' Tarea</h3>'+
    '<div class="field"><label>Título</label><input class="input-field" id="tf_title" value="'+esc(f.title)+'"></div>'+
    '<div class="field"><label>Descripción</label><textarea class="input-field" id="tf_description" rows="3">'+esc(f.description||'')+'</textarea></div>'+
    '<div class="field"><label>Tipo</label><select class="input-field" id="tf_type"><option value="vod" '+(f.type==='vod'?'selected':'')+'>VOD</option><option value="aim" '+(f.type==='aim'?'selected':'')+'>Aim</option><option value="game" '+(f.type==='game'?'selected':'')+'>Game</option><option value="other" '+(f.type==='other'?'selected':'')+'>Otro</option></select></div>'+
    '<div class="field"><label>Fecha límite</label><input type="date" class="input-field" id="tf_due_date" value="'+f.due_date+'"></div>'+
    '<div class="field" style="display:none"><label>Grupo</label><select class="input-field" id="tf_group" onchange="reloadCoachDropdown(\'tf_coach\',this.value)"><option value="">General (Ambos)</option>'+(DATA.groups||[]).map(function(g){return'<option value="'+g.id+'"'+(f.group_id===g.id?' selected':'')+'>'+esc(g.name)+'</option>'}).join('')+'</select></div>'+
    '<div class="field" id="tf_coach_wrap"><label>Coach asignado</label><select class="input-field" id="tf_coach" onchange="setGroupFromCoach(\'tf_group\',\'tf_coach\')"><option value="">Sin coach</option>'+coachOptions(f.coach||'',f.group_id)+'</select></div>'+
    '<hr>'+
    '<div class="field"><label>Imagen</label>'+fileUploadHTML('Imagen','image/*','tf_img_status','tf_image_url',f.image_url||'')+(f.image_url?mediaPreview(f.image_url):'')+'</div>'+
    '<div class="field"><label>Archivo adjunto (PDF)</label>'+fileUploadHTML('PDF','.pdf,application/pdf','tf_doc_status','tf_attachment_url',f.attachment_url||'')+'<input class="input-field" id="tf_attachment_name" placeholder="Nombre del archivo" value="'+esc(f.attachment_name||'')+'"></div>'+
    '<button class="btn-primary" onclick="saveTask(\''+(id||'')+'\')" style="width:100%;justify-content:center">'+ic('save',16)+' Guardar</button>');
}
function saveTask(id){
  var obj={title:document.getElementById('tf_title').value,description:document.getElementById('tf_description').value,type:document.getElementById('tf_type').value,due_date:document.getElementById('tf_due_date').value,group_id:document.getElementById('tf_group').value,coach:document.getElementById('tf_coach')?.value||'',image_url:document.getElementById('tf_image_url').value,attachment_url:document.getElementById('tf_attachment_url').value,attachment_name:document.getElementById('tf_attachment_name').value};
  if(!DATA.tasks)DATA.tasks=[];
  if(id){var idx=DATA.tasks.findIndex(function(t){return t.id===id});if(idx>=0)DATA.tasks[idx]={...DATA.tasks[idx],...obj}}else{obj.id=uid();DATA.tasks.push(obj)}
  saveData(DATA);closeModal();if(_inAcademyTab)renderAcademyContent();else renderTasks();updateCounts();toast(id?'Tarea actualizada':'Tarea creada');
}
function delTask(id){if(!confirmDel())return;DATA.tasks=DATA.tasks.filter(function(t){return t.id!==id});saveData(DATA);if(_inAcademyTab)renderAcademyContent();else renderTasks();updateCounts();toast('Tarea eliminada');}
async function showTaskCompletions(taskId){
  var task=(DATA.tasks||[]).find(function(t){return t.id===taskId});
  if(!task){toast('Tarea no encontrada','err');return}
  try{if(db&&db.from){var r=await db.from('task_completions').select('*');if(r.data)DATA.task_completions=r.data}}catch(e){}
  var members=DATA.members||[];
  var gid=task.group_id;
  if(gid)members=members.filter(function(m){return (m.group_id&&m.group_id.trim()===gid)||(!m.group_id&&getGroupFromRank(m.rank)===gid)});
  var tcs=DATA.task_completions||[];
  var html='<button class="modal-close" onclick="closeModal()">'+ic('x',16)+'</button><h3>'+ic('check-circle',18)+' Completados: '+esc(task.title)+'</h3>'+
    '<div style="margin-top:16px;display:grid;gap:6px;max-height:400px;overflow-y:auto">';
  if(!members.length){
    html+='<div style="text-align:center;padding:24px;color:#555">No hay miembros registrados</div>';
  }else{
    members.forEach(function(m){
      var done=tcs.some(function(tc){return tc.task_id===taskId&&tc.member_name===m.name});
      html+='<div class="has-glow" style="display:flex;justify-content:space-between;align-items:center;padding:8px 14px;background:rgba(255,255,255,0.02);border-radius:8px">'+
        '<span>'+esc(m.name)+'</span>'+
        '<span style="color:'+(done?'#8b5cf6':'#8b5cf6')+'">'+(done?ic('check-circle',14)+' Completado':ic('x-circle',14)+' Pendiente')+'</span></div>';
    });
  }
  html+='</div>';
  openModal(html);
  if(typeof lucide!=='undefined')lucide.createIcons();
}

// ========== CRUD: EVALUATIONS ==========
function renderEvals(cId){cId=cId||'adminContent';
  var items=filterByCurrentCoach(DATA.evaluations||[]);
  var btn='<button class="btn-primary" onclick="evalForm(null)" style="margin-bottom:14px;font-size:13px">'+ic('plus',14)+' Nueva Evaluación</button>';
  document.getElementById(cId).innerHTML=adminTable(items,['Miembro','Fecha','AIM','Game Sense','Comunicación','Trabajo Equipo','Coach','Grupo','Archivos'],function(e){
    return '<td>'+esc(e.member_name)+'</td><td>'+esc(e.date)+'</td><td>'+e.aim+'</td><td>'+e.game_sense+'</td><td>'+e.communication+'</td><td>'+e.teamwork+'</td><td>'+esc(e.coach||'—')+'</td><td>'+groupName(e.group_id)+'</td><td>'+(e.image_url?'<a href="'+esc(e.image_url)+'" target="_blank" title="Ver imagen">'+ic('image',14)+'</a> ':'')+(e.attachment_url?'<a href="'+esc(e.attachment_url)+'" target="_blank" title="Descargar '+esc(e.attachment_name||'archivo')+'">'+ic('paperclip',14)+'</a>':'')+'</td><td><div class="has-glow admin-actions"><button onclick="evalForm(\''+e.id+'\')">'+ic('pencil',14)+'</button><button class="del" onclick="delEval(\''+e.id+'\')">'+ic('trash-2',14)+'</button></div></td>'},'No hay evaluaciones',btn);
}
function evalForm(id){
  var item=id?(DATA.evaluations||[]).find(function(e){return e.id===id}):null;
  var f=item||{member_name:'',aim:3,game_sense:3,communication:3,teamwork:3,coach:dc(),group_id:'',coach_notes:'',date:new Date().toISOString().slice(0,10),image_url:'',attachment_url:'',attachment_name:''};
  openModal('<button class="modal-close" onclick="closeModal()">'+ic('x',16)+'</button><h3>'+(item?'Editar':'Nueva')+' Evaluación</h3>'+
    '<div class="field"><label>Miembro</label><select class="input-field" id="ef_member_name">'+(DATA.members||[]).map(function(m){return'<option value="'+esc(m.name)+'" '+(m.name===f.member_name?'selected':'')+'>'+esc(m.name)+'</option>'}).join('')+'</select></div>'+
    '<div class="grid-2"><div class="field"><label>AIM (1-5)</label><input type="number" min="1" max="5" class="input-field" id="ef_aim" value="'+f.aim+'"></div>'+
    '<div class="field"><label>Game Sense (1-5)</label><input type="number" min="1" max="5" class="input-field" id="ef_game_sense" value="'+f.game_sense+'"></div></div>'+
    '<div class="grid-2"><div class="field"><label>Comunicación (1-5)</label><input type="number" min="1" max="5" class="input-field" id="ef_communication" value="'+f.communication+'"></div>'+
    '<div class="field"><label>Trabajo Equipo (1-5)</label><input type="number" min="1" max="5" class="input-field" id="ef_teamwork" value="'+f.teamwork+'"></div></div>'+
    '<div class="field" style="display:none"><label>Grupo</label><select class="input-field" id="ef_group" onchange="reloadCoachDropdown(\'ef_coach\',this.value)"><option value="">General (Ambos)</option>'+(DATA.groups||[]).map(function(g){return'<option value="'+g.id+'"'+(f.group_id===g.id?' selected':'')+'>'+esc(g.name)+'</option>'}).join('')+'</select></div>'+
    '<div class="field"><label>Coach</label><select class="input-field" id="ef_coach" onchange="setGroupFromCoach(\'ef_group\',\'ef_coach\')"><option value="">Sin coach</option>'+coachOptions(f.coach||'',f.group_id)+'</select></div>'+
    '<div class="field"><label>Notas del Coach</label><textarea class="input-field" id="ef_coach_notes" rows="3">'+esc(f.coach_notes||'')+'</textarea></div>'+
    '<div class="field"><label>Fecha</label><input type="date" class="input-field" id="ef_date" value="'+f.date+'"></div>'+
    '<hr>'+
    '<div class="field"><label>Imagen</label>'+fileUploadHTML('Imagen','image/*','ef_img_status','ef_image_url',f.image_url||'')+(f.image_url?mediaPreview(f.image_url):'')+'</div>'+
    '<div class="field"><label>Archivo adjunto (PDF)</label>'+fileUploadHTML('PDF','.pdf,application/pdf','ef_doc_status','ef_attachment_url',f.attachment_url||'')+'<input class="input-field" id="ef_attachment_name" placeholder="Nombre del archivo" value="'+esc(f.attachment_name||'')+'"></div>'+
    '<button class="btn-primary" onclick="saveEval(\''+(id||'')+'\')" style="width:100%;justify-content:center">'+ic('save',16)+' Guardar</button>');
}
function saveEval(id){
  var obj={member_name:document.getElementById('ef_member_name').value,aim:parseInt(document.getElementById('ef_aim').value)||3,game_sense:parseInt(document.getElementById('ef_game_sense').value)||3,communication:parseInt(document.getElementById('ef_communication').value)||3,teamwork:parseInt(document.getElementById('ef_teamwork').value)||3,group_id:document.getElementById('ef_group').value,coach:document.getElementById('ef_coach')?.value||'',coach_notes:document.getElementById('ef_coach_notes').value,date:document.getElementById('ef_date').value,image_url:document.getElementById('ef_image_url').value,attachment_url:document.getElementById('ef_attachment_url').value,attachment_name:document.getElementById('ef_attachment_name').value};
  if(!DATA.evaluations)DATA.evaluations=[];
  if(id){var idx=DATA.evaluations.findIndex(function(e){return e.id===id});if(idx>=0)DATA.evaluations[idx]={...DATA.evaluations[idx],...obj}}else{obj.id=uid();DATA.evaluations.push(obj)}
  saveData(DATA);closeModal();if(_inAcademyTab)renderAcademyContent();else renderEvals();updateCounts();toast(id?'Evaluación actualizada':'Evaluación creada');
}
function delEval(id){if(!confirmDel())return;DATA.evaluations=DATA.evaluations.filter(function(e){return e.id!==id});saveData(DATA);if(_inAcademyTab)renderAcademyContent();else renderEvals();updateCounts();toast('Evaluación eliminada');}

// ========== CRUD: SUBSTITUTIONS ==========
function renderSubstitutions(){
  var items=filterByCurrentCoach(DATA.substitutions||[]);
  var btn='<button class="btn-primary" onclick="subForm(null)" style="margin-bottom:14px;font-size:13px">'+ic('plus',14)+' Nueva Sustitución</button>';
  document.getElementById('adminContent').innerHTML=adminTable(items,['Solicitante','Rol','Estado','Cupo','Coach','Grupo'],function(s){
    var badges={open:'badge-yellow',fulfilled:'badge-green',cancelled:'badge-red'};
    return '<td>'+esc(s.requesting_member)+'</td><td>'+esc(s.needed_role)+'</td><td><span class="badge '+(badges[s.status]||'badge-gray')+'">'+esc(s.status)+'</span></td><td>'+esc(s.filled_by||'-')+'</td><td>'+esc(s.coach||'-')+'</td><td>'+groupName(s.group_id)+'</td><td><div class="has-glow admin-actions">'+
      (s.status==='open'?'<button onclick="fulfillSub(\''+s.id+'\')" title="Marcar como cumplida">'+ic('check',14)+'</button><button onclick="cancelSub(\''+s.id+'\')" title="Cancelar">'+ic('x',14)+'</button>':'')+
      '<button onclick="subForm(\''+s.id+'\')">'+ic('pencil',14)+'</button><button class="del" onclick="delSub(\''+s.id+'\')">'+ic('trash-2',14)+'</button></div></td>'},'No hay sustituciones',btn);
}
function subForm(id){
  var item=id?(DATA.substitutions||[]).find(function(s){return s.id===id}):null;
  var f=item||{schedule_id:'',requesting_member:'',needed_role:'',status:'open',filled_by:'',coach:dc(),group_id:''};
  openModal('<button class="modal-close" onclick="closeModal()">'+ic('x',16)+'</button><h3>'+(item?'Editar':'Nueva')+' Sustitución</h3>'+
    '<div class="field"><label>Horario</label><select class="input-field" id="sf_schedule_id">'+    (DATA.schedule||[]).map(function(s){var days=['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];return'<option value="'+s.id+'" '+(s.id===f.schedule_id?'selected':'')+'>'+esc(s.title)+' ('+days[s.day]+' '+s.start+')</option>'}).join('')+'</select></div>'+
    '<div class="field"><label>Solicitante</label><input class="input-field" id="sf_requesting_member" value="'+esc(f.requesting_member)+'"></div>'+
    '<div class="field"><label>Rol necesario</label><input class="input-field" id="sf_needed_role" value="'+esc(f.needed_role)+'"></div>'+
    '<div class="field"><label>Estado</label><select class="input-field" id="sf_status"><option value="open" '+(f.status==='open'?'selected':'')+'>Abierta</option><option value="fulfilled" '+(f.status==='fulfilled'?'selected':'')+'>Cumplida</option><option value="cancelled" '+(f.status==='cancelled'?'selected':'')+'>Cancelada</option></select></div>'+
    '<div class="field"><label>Cubierta por</label><input class="input-field" id="sf_filled_by" value="'+esc(f.filled_by||'')+'"></div>'+
    '<div class="field"><label>Coach</label><select class="input-field" id="subf_coach" onchange="setGroupFromCoach(\'subf_group\',\'subf_coach\')"><option value="">Sin coach</option>'+coachOptions(f.coach||'',f.group_id)+'</select></div>'+
    '<div class="field" style="display:none"><label>Grupo</label><select class="input-field" id="subf_group" onchange="reloadCoachDropdown(\'subf_coach\',this.value)"><option value="">General (Ambos)</option>'+(DATA.groups||[]).map(function(g){return'<option value="'+g.id+'"'+(f.group_id===g.id?' selected':'')+'>'+esc(g.name)+'</option>'}).join('')+'</select></div>'+
    '<button class="btn-primary" onclick="saveSub(\''+(id||'')+'\')" style="width:100%;justify-content:center">'+ic('save',16)+' Guardar</button>');
}
function saveSub(id){
  var obj={schedule_id:document.getElementById('sf_schedule_id').value,requesting_member:document.getElementById('sf_requesting_member').value,needed_role:document.getElementById('sf_needed_role').value,status:document.getElementById('sf_status').value,filled_by:document.getElementById('sf_filled_by').value,coach:document.getElementById('subf_coach').value,group_id:document.getElementById('subf_group').value};
  if(id){var idx=DATA.substitutions.findIndex(function(s){return s.id===id});if(idx>=0)DATA.substitutions[idx]={...DATA.substitutions[idx],...obj}}else{obj.id=uid();DATA.substitutions.push(obj)}
  saveData(DATA);closeModal();renderSubstitutions();updateCounts();toast(id?'Sustitución actualizada':'Sustitución creada');
}
function delSub(id){if(!confirmDel())return;DATA.substitutions=DATA.substitutions.filter(function(s){return s.id!==id});saveData(DATA);renderSubstitutions();updateCounts();toast('Sustitución eliminada');}
function fulfillSub(id){
  if(!confirmDel('¿Marcar esta sustitución como cumplida?'))return;
  if(!DATA.substitutions)DATA.substitutions=[];
  var idx=DATA.substitutions.findIndex(function(s){return s.id===id});
  if(idx>=0){DATA.substitutions[idx].status='fulfilled';saveData(DATA);renderSubstitutions();updateCounts();toast('Sustitución marcada como cumplida')}
}
function cancelSub(id){
  if(!confirmDel('¿Cancelar esta sustitución?'))return;
  if(!DATA.substitutions)DATA.substitutions=[];
  var idx=DATA.substitutions.findIndex(function(s){return s.id===id});
  if(idx>=0){DATA.substitutions[idx].status='cancelled';saveData(DATA);renderSubstitutions();updateCounts();toast('Sustitución cancelada')}
}

// ========== CRUD: ACHIEVEMENTS ==========
function renderAchievements(){
  var items=DATA.achievements||[];
  var memberCounts={};(DATA.member_achievements||[]).forEach(function(ma){memberCounts[ma.achievement_id]=(memberCounts[ma.achievement_id]||0)+1});
  var btn='<div style="display:flex;gap:10px;margin-bottom:14px"><button class="btn-primary" onclick="achievementForm(null)" style="font-size:13px">'+ic('plus',14)+' Nuevo Logro</button>'+
    '<button class="btn-primary" onclick="assignAchievementForm()" style="font-size:13px">'+ic('user-plus',14)+' Asignar a miembro</button></div>';
  document.getElementById('adminContent').innerHTML=adminTable(items,['Nombre','Icono','Miembros'],function(a){
    var cnt=memberCounts[a.id]||0;
    var members=(DATA.member_achievements||[]).filter(function(ma){return ma.achievement_id===a.id}).map(function(ma){
      return '<span style="display:inline-flex;align-items:center;gap:2px;margin-right:6px">'+esc(ma.member_name)+' <button onclick="removeAchievement(\''+ma.id+'\')" style="background:none;border:none;color:#8b5cf6;cursor:pointer;padding:0;font-size:12px;line-height:1;vertical-align:middle" title="Quitar">'+ic('x',10)+'</button></span>';
    }).join('');
    return '<td>'+esc(a.name)+'</td><td>'+ic(a.icon||'trophy',16)+'</td><td>'+(cnt?'<span class="badge badge-purple">'+cnt+'</span> ':'<span class="badge badge-gray">0</span> ')+'<span style="color:#888;font-size:12px">'+members+'</span></td><td><div class="has-glow admin-actions"><button onclick="achievementForm(\''+a.id+'\')">'+ic('pencil',14)+'</button><button class="del" onclick="delAchievement(\''+a.id+'\')">'+ic('trash-2',14)+'</button></div></td>'},'No hay logros',btn);
}
function achievementForm(id){
  var item=id?(DATA.achievements||[]).find(function(a){return a.id===id}):null;
  var f=item||{name:'',description:'',icon:'trophy'};
  openModal('<button class="modal-close" onclick="closeModal()">'+ic('x',16)+'</button><h3>'+(item?'Editar':'Nuevo')+' Logro</h3>'+
    '<div class="field"><label>Nombre</label><input class="input-field" id="achf_name" value="'+esc(f.name)+'"></div>'+
    '<div class="field"><label>Descripción</label><textarea class="input-field" id="achf_description" rows="3">'+esc(f.description||'')+'</textarea></div>'+
    '<div class="field"><label>Icono (nombre Lucide)</label><input class="input-field" id="achf_icon" value="'+esc(f.icon)+'"></div>'+
    '<button class="btn-primary" onclick="saveAchievement(\''+(id||'')+'\')" style="width:100%;justify-content:center">'+ic('save',16)+' Guardar</button>');
}
function saveAchievement(id){
  var obj={name:document.getElementById('achf_name').value,description:document.getElementById('achf_description').value,icon:document.getElementById('achf_icon').value};
  if(!DATA.achievements)DATA.achievements=[];
  if(id){var idx=DATA.achievements.findIndex(function(a){return a.id===id});if(idx>=0)DATA.achievements[idx]={...DATA.achievements[idx],...obj}}else{obj.id=uid();DATA.achievements.push(obj)}
  saveData(DATA);closeModal();renderAchievements();updateCounts();toast(id?'Logro actualizado':'Logro creado');
}
function delAchievement(id){if(!confirmDel())return;DATA.achievements=DATA.achievements.filter(function(a){return a.id!==id});saveData(DATA);renderAchievements();updateCounts();toast('Logro eliminado');}
function assignAchievementForm(){
  openModal('<button class="modal-close" onclick="closeModal()">'+ic('x',16)+'</button><h3>Asignar Logro</h3>'+
    '<div class="field"><label>Miembro</label><select class="input-field" id="aaf_member">'+(DATA.members||[]).map(function(m){return'<option value="'+esc(m.name)+'">'+esc(m.name)+'</option>'}).join('')+'</select></div>'+
    '<div class="field"><label>Logro</label><select class="input-field" id="aaf_achievement">'+(DATA.achievements||[]).map(function(a){return'<option value="'+a.id+'">'+esc(a.name)+'</option>'}).join('')+'</select></div>'+
    '<button class="btn-primary" onclick="assignAchievement()" style="width:100%;justify-content:center">'+ic('check',16)+' Asignar</button>');
}
function assignAchievement(){
  var member_name=document.getElementById('aaf_member').value;
  var achievement_id=document.getElementById('aaf_achievement').value;
  if(!DATA.member_achievements)DATA.member_achievements=[];
  if(DATA.member_achievements.some(function(ma){return ma.member_name===member_name&&ma.achievement_id===achievement_id})){toast('El miembro ya tiene este logro','err');return}
   DATA.member_achievements.push({id:uid(),member_name:member_name,achievement_id:achievement_id,awarded_at:new Date().toISOString()});
  saveData(DATA);closeModal();renderAchievements();updateCounts();toast('Logro asignado');
}
function removeAchievement(id){
  if(!confirmDel())return;
  DATA.member_achievements=DATA.member_achievements.filter(function(ma){return ma.id!==id});
  saveData(DATA);renderAchievements();updateCounts();toast('Asignación eliminada');
}

// ========== CRUD: QUIZZES ==========
function renderQuizzes(cId){cId=cId||'adminContent';
  var items=filterByCurrentCoach(DATA.quizzes||[]);
  var btn='<button class="btn-primary" onclick="quizForm(null)" style="margin-bottom:14px;font-size:13px">'+ic('plus',14)+' Nuevo Quiz</button>';
  document.getElementById(cId).innerHTML=adminTable(items,['Título','Preguntas','Coach','Grupo'],function(q){
    return '<td>'+esc(q.title)+'</td><td>'+(q.questions||[]).length+'</td><td>'+esc(q.coach||'—')+'</td><td>'+groupName(q.group_id)+'</td><td><div class="has-glow admin-actions"><button onclick="quizForm(\''+q.id+'\')">'+ic('pencil',14)+'</button><button class="del" onclick="delQuiz(\''+q.id+'\')">'+ic('trash-2',14)+'</button></div></td>'},'No hay quizzes',btn);
}
function quizForm(id){
  var item=id?(DATA.quizzes||[]).find(function(q){return q.id===id}):null;
  var f=item||{title:'',description:'',group_id:'',coach:dc(),questions:[{text:'',options:['','','',''],correct:0,explanation:''}]};
  if(item&&item.questions&&item.questions.length>0){
    var maxQ=item.questions.reduce(function(m,q){var n=parseInt((q.id||'').replace('q_','')||'0',10);return n>m?n:m},0);
    _quizQCounter=maxQ+1;
  }else{_quizQCounter=0}
  var qhtml='<div id="quizQs">'+(f.questions||[{text:'',options:['','','',''],correct:0,explanation:''}]).map(function(q,i){return quizQHTML(q,i)}).join('')+'</div>';
  openModal('<button class="modal-close" onclick="closeModal()">'+ic('x',16)+'</button><h3>'+(item?'Editar':'Nuevo')+' Quiz</h3>'+
    '<div class="field"><label>Título</label><input class="input-field" id="qf_title" value="'+esc(f.title)+'"></div>'+
    '<div class="field"><label>Descripción</label><textarea class="input-field" id="qf_description" rows="2">'+esc(f.description||'')+'</textarea></div>'+
    '<div class="field" style="display:none"><label>Grupo</label><select class="input-field" id="qf_group" onchange="reloadCoachDropdown(\'qf_coach\',this.value)"><option value="">General</option>'+(DATA.groups||[]).map(function(g){return'<option value="'+g.id+'"'+(f.group_id===g.id?' selected':'')+'>'+esc(g.name)+'</option>'}).join('')+'</select></div>'+
    '<div class="field"><label>Coach asignado</label><select class="input-field" id="qf_coach" onchange="setGroupFromCoach(\'qf_group\',\'qf_coach\')"><option value="">Sin coach</option>'+coachOptions(f.coach||'',f.group_id)+'</select></div>'+
    '<hr>'+qhtml+
    '<button class="btn-secondary" onclick="addQuizQ()" style="width:100%;justify-content:center;margin-top:8px">'+ic('plus',14)+' Agregar Pregunta</button>'+
    '<button class="btn-primary" onclick="saveQuiz(\''+(id||'')+'\')" style="width:100%;justify-content:center;margin-top:12px">'+ic('save',16)+' Guardar Quiz</button>');
}
function saveQuiz(id){
  var qs=[];
  var qEls=document.querySelectorAll('[id^=q_]');
  qEls.forEach(function(el){
    var i=el.id.replace('q_','');
    var text=document.getElementById('qf_q_'+i+'_text')?.value;
    if(!text)return;
    var opts=[];
    for(var j=0;j<4;j++)opts.push(document.getElementById('qf_q_'+i+'_opt_'+j)?.value||'');
    var correct=parseInt(document.querySelector('input[name="qf_correct_'+i+'"]:checked')?.value||'0');
    var exp=document.getElementById('qf_q_'+i+'_exp')?.value||'';
    qs.push({text:text,options:opts,correct:correct,explanation:exp});
  });
  if(!qs.length){toast('Agrega al menos una pregunta','err');return}
  var obj={title:document.getElementById('qf_title').value,description:document.getElementById('qf_description').value,group_id:document.getElementById('qf_group').value,coach:document.getElementById('qf_coach')?.value||'',questions:qs};
  if(!DATA.quizzes)DATA.quizzes=[];
  if(id){var idx=DATA.quizzes.findIndex(function(q){return q.id===id});if(idx>=0)DATA.quizzes[idx]={...DATA.quizzes[idx],...obj}}else{obj.id=uid();DATA.quizzes.push(obj)}
  saveData(DATA);closeModal();if(_inAcademyTab)renderAcademyContent();else renderQuizzes();updateCounts();toast(id?'Quiz actualizado':'Quiz creado');
}
function quizQHTML(q,i){
  var opts=q.options||['','','',''];
  return '<div class="glass-card" style="padding:14px;margin-bottom:10px" id="q_'+i+'">'+
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">'+
      '<strong style="font-size:14px">Pregunta '+(i+1)+'</strong>'+
      '<button class="btn-sm cancel" onclick="removeQuizQ('+i+')" style="font-size:11px">'+ic('x',12)+'</button></div>'+
    '<div class="field"><input class="input-field" id="qf_q_'+i+'_text" placeholder="Texto de la pregunta" value="'+esc(q.text)+'"></div>'+
    '<div style="display:grid;gap:6px">'+
    opts.map(function(o,j){return'<label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer">'+
      '<input type="radio" name="qf_correct_'+i+'" value="'+j+'" '+(q.correct===j?'checked':'')+'>'+
      '<input class="input-field" id="qf_q_'+i+'_opt_'+j+'" placeholder="Opción '+(j+1)+'" value="'+esc(o)+'" style="flex:1;padding:8px 12px;font-size:13px">'+
      '<span style="color:#666;font-size:11px">'+(q.correct===j?'✓ Correcta':'')+'</span></label>'}).join('')+'</div>'+
    '<div class="field" style="margin-top:6px"><input class="input-field" id="qf_q_'+i+'_exp" placeholder="Explicación (opcional)" value="'+esc(q.explanation||'')+'" style="padding:8px 12px;font-size:12px"></div></div>';
}
function addQuizQ(){
  var n=_quizQCounter++;
  document.getElementById('quizQs').insertAdjacentHTML('beforeend',quizQHTML({text:'',options:['','','',''],correct:0,explanation:''},n));
}
function removeQuizQ(i){
  var el=document.getElementById('q_'+i);
  if(el)el.remove();
}
function delQuiz(id){if(!confirmDel())return;DATA.quizzes=DATA.quizzes.filter(function(q){return q.id!==id});saveData(DATA);if(_inAcademyTab)renderAcademyContent();else renderQuizzes();updateCounts();toast('Quiz eliminado');}

// ========== CRUD: COACHES ==========
function renderCoaches(){
  var btn='<button class="btn-primary" onclick="coachForm(null)" style="margin-bottom:14px;font-size:13px">'+ic('plus',14)+' Nuevo Coach</button>';
  document.getElementById('adminContent').innerHTML=adminTable(DATA.coaches||[],['Nombre','Email','Nombre VALORANT','Especialidad','Estado'],function(c){
    return '<td>'+esc(c.name)+'</td><td><span style="font-size:12px;color:#888">'+esc(c.email||'—')+'</span></td><td>'+esc(c.nickname||'-')+'</td><td>'+esc(c.specialty||'-')+'</td>'+
      '<td><span style="color:'+(c.status==='active'?'#8b5cf6':'#8b5cf6')+'">'+(c.status==='active'?'Activo':'Inactivo')+'</span></td>'+
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
  // If editing and name looks like a VALORANT tag (#), split it
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
    // Create user profile for coach
    if(db&&db.from){
      try{
        var {data:authUser,error:signUpError}=await db.auth.signUp({email:obj.email,password:obj.email+'Qu4sar2026!'});
        if(signUpError)throw signUpError;
        if(authUser&&authUser.user){
          await db.from('users').upsert({id:authUser.user.id,email:obj.email,role:'coach',name:obj.name},{onConflict:'id'});
          toast('Coach creado. Email: '+obj.email+' | Contraseña: '+obj.email+'Qu4sar2026!','info');
        }
      }catch(e){toast('Error al crear usuario: '+(e.message||e),'error')}
    }
  }else{
    var idx=DATA.coaches.findIndex(function(c){return c.id===id});
    if(idx>=0)DATA.coaches[idx]={...DATA.coaches[idx],...obj};
    // Update email in users table if changed
    if(db&&db.from){
      try{
        var {data:existingUser}=await db.from('users').select('id').eq('email',obj.email).limit(1);
        if(existingUser&&existingUser.length){
          await db.from('users').update({name:obj.name,role:'coach'}).eq('email',obj.email);
        }
      }catch(e){/* silent */}
    }
  }
  // Save group assignments
  var coachId=obj.id||id;
  (DATA.groups||[]).forEach(function(g){
    var cb=document.getElementById('cg_'+g.id);
    if(!cb)return;
    if(!DATA.group_coaches)DATA.group_coaches=[];
    DATA.group_coaches=DATA.group_coaches.filter(function(gc){return!(gc.coach_id===coachId&&gc.group_id===g.id)});
    if(cb.checked)DATA.group_coaches.push({id:uid(),group_id:g.id,coach_id:coachId});
  });
  saveData(DATA);closeModal();renderCoaches();updateCounts();toast(isNew?'Coach agregado':'Coach actualizado');
}
function delCoach(id){
  if(!confirmDel())return;
  var c=(DATA.coaches||[]).find(function(c){return c.id===id});
  DATA.coaches=(DATA.coaches||[]).filter(function(c){return c.id!==id});
  saveData(DATA);renderCoaches();updateCounts();toast('Coach eliminado');
  if(db&&db.from&&c){
    db.from('users').delete().eq('email',c.email).then(function(){}).catch(function(){});
  }
}
function toggleCoachStatus(id){
  var c=(DATA.coaches||[]).find(function(c){return c.id===id});
  if(!c)return;
  c.status=c.status==='active'?'inactive':'active';
  saveData(DATA);renderCoaches();toast('Coach '+(c.status==='active'?'activado':'desactivado'));
  if(db&&db.from){
    db.from('users').update({role:c.status==='active'?'coach':'user'}).eq('email',c.email).then(function(){}).catch(function(){});
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
  saveData(DATA);closeModal();renderCoaches();updateCounts();toast('Asignaciones guardadas');
}

// ========== CRUD: SCHEDULE (con grupo) ==========
function renderSchedule(){
  var gid=document.getElementById('sf_filterGroup')?document.getElementById('sf_filterGroup').value:'';
  var items=filterByCurrentCoach(DATA.schedule||[]);
  if(gid)items=items.filter(function(s){return s.group_id===gid});
  var btn='<button class="btn-primary" onclick="schedForm(null)" style="margin-bottom:14px;font-size:13px">'+ic('plus',14)+' Nuevo Horario</button>';
  var days=['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
  var filter='<div style="margin-bottom:14px;display:flex;gap:12px;align-items:center;flex-wrap:wrap">'+
    '<label style="font-size:13px;color:#888">Filtrar por grupo:</label>'+
    '<select class="input-field" id="sf_filterGroup" onchange="renderSchedule()" style="width:auto;min-width:140px;padding:6px 10px;font-size:13px">'+
    '<option value="">Todos</option>'+(DATA.groups||[]).map(function(g){return'<option value="'+g.id+'" '+(gid===g.id?'selected':'')+'>'+esc(g.name)+'</option>'}).join('')+'</select></div>';
  document.getElementById('adminContent').innerHTML=filter+adminTable(items,['Título','Tipo','Día','Horario','Coach','Grupo'],function(s){
    return '<td>'+esc(s.title)+'</td><td>'+esc(s.type)+'</td><td>'+days[s.day]+'</td><td>'+esc(s.start)+' - '+esc(s.end)+'</td><td>'+esc(s.coach||'—')+'</td><td>'+groupName(s.group_id)+'</td>'+
      '<td><div class="has-glow admin-actions">'+
        '<button onclick="schedForm(\''+s.id+'\')" title="Editar">'+ic('pencil',14)+'</button>'+
        '<button class="del" onclick="delSched(\''+s.id+'\')" title="Eliminar">'+ic('trash-2',14)+'</button>'+
      '</div></td>'
  },'No hay horarios',btn);
}
function schedForm(id){
  var item=id?DATA.schedule.find(function(s){return s.id===id}):null;
  var f=item||{title:'',day:0,start:'18:00',end:'20:00',type:'entrenamiento',group_id:'',coach:dc()};
  var days=['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
  openModal('<button class="modal-close" onclick="closeModal()">'+ic('x',16)+'</button><h3>'+(item?'Editar':'Nuevo')+' Horario</h3>'+
    '<div class="field"><label>Título</label><input class="input-field" id="sf_title" value="'+esc(f.title)+'"></div>'+
    '<div class="grid-2"><div class="field"><label>Día</label><select class="input-field" id="sf_day">'+days.map(function(d,i){return'<option value="'+i+'" '+(i===f.day?'selected':'')+'>'+d+'</option>'}).join('')+'</select></div>'+
    '<div class="field"><label>Tipo</label><select class="input-field" id="sf_type"><option value="entrenamiento" '+(f.type==='entrenamiento'?'selected':'')+'>Entrenamiento</option><option value="academia" '+(f.type==='academia'?'selected':'')+'>Academia</option><option value="scrim" '+(f.type==='scrim'?'selected':'')+'>Scrim</option><option value="premier" '+(f.type==='premier'?'selected':'')+'>Premier</option></select></div></div>'+
    '<div class="grid-2"><div class="field"><label>Hora inicio</label><input type="time" class="input-field" id="sf_start" value="'+f.start+'"></div>'+
    '<div class="field"><label>Hora fin</label><input type="time" class="input-field" id="sf_end" value="'+f.end+'"></div></div>'+
    '<div class="field"><label>Grupo</label><select class="input-field" id="sf_group" onchange="reloadCoachDropdown(\'sf_coach\',this.value)"><option value="">General</option>'+(DATA.groups||[]).map(function(g){return'<option value="'+g.id+'" '+(f.group_id===g.id?'selected':'')+'>'+esc(g.name)+'</option>'}).join('')+'</select></div>'+
    '<div class="field"><label>Coach</label><select class="input-field" id="sf_coach" onchange="setGroupFromCoach(\'sf_group\',\'sf_coach\')"><option value="">Sin coach</option>'+coachOptions(f.coach||'',f.group_id)+'</select></div>'+
    '<button class="btn-primary" onclick="saveSched(\''+(id||'')+'\')" style="width:100%;justify-content:center">'+ic('save',16)+' Guardar</button>');
}
function saveSched(id){
  var obj={title:document.getElementById('sf_title').value,day:parseInt(document.getElementById('sf_day').value),start:document.getElementById('sf_start').value,end:document.getElementById('sf_end').value,type:document.getElementById('sf_type').value,group_id:document.getElementById('sf_group').value,coach:document.getElementById('sf_coach')?.value||''};
  if(id){var idx=DATA.schedule.findIndex(function(s){return s.id===id});if(idx>=0)DATA.schedule[idx]={...DATA.schedule[idx],...obj}}else{obj.id=uid();DATA.schedule.push(obj)}
  saveData(DATA);closeModal();renderSchedule();updateCounts();toast(id?'Horario actualizado':'Horario creado');
}
function delSched(id){if(!confirmDel())return;DATA.schedule=DATA.schedule.filter(function(s){return s.id!==id});saveData(DATA);renderSchedule();updateCounts();toast('Horario eliminado');}

// ========== CRUD: GRUPOS ==========
function renderGroups(){
  var h='<div style="display:grid;gap:20px">';
  var coachGroups=currentUser&&currentUser.coachName?(DATA.group_coaches||[]).filter(function(gc){
    var c=(DATA.coaches||[]).find(function(c){return c.id===gc.coach_id});
    return c&&c.name===currentUser.coachName;
  }).map(function(gc){return gc.group_id}):null;
  (DATA.groups||[]).forEach(function(g){
    if(coachGroups&&coachGroups.indexOf(g.id)<0)return;
    var coaches=(DATA.group_coaches||[]).filter(function(gc){return gc.group_id===g.id}).map(function(gc){return(DATA.coaches||[]).find(function(c){return c.id===gc.coach_id})}).filter(Boolean);
    var members=(DATA.members||[]).filter(function(m){return (m.group_id&&m.group_id.trim()===g.id)||(!m.group_id&&getGroupFromRank(m.rank)===g.id)});
    h+='<div class="glass-card" style="padding:24px">'+
      '<h3 style="font-family:var(--font-display);font-size:16px;margin-bottom:4px">'+esc(g.name)+'</h3>'+
      '<p style="color:#888;font-size:13px;margin-bottom:14px">'+esc(g.description||'')+'</p>'+
      '<div style="display:flex;flex-direction:column;gap:14px">';
    if(coaches.length){
      coaches.forEach(function(c){
        var students=members.filter(function(m){return m.coach&&m.coach.toLowerCase()===c.name.toLowerCase()});
        h+='<div class="has-glow" style="padding:12px 16px;background:rgba(255,255,255,0.02);border-radius:10px;border-left:3px solid var(--neon-light)">'+
          '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">'+
          (c.avatar?'<img src="'+esc(c.avatar)+'" style="width:28px;height:28px;border-radius:50%;object-fit:cover">':'<span style="width:28px;height:28px;border-radius:50%;background:rgba(139,92,246,0.15);display:flex;align-items:center;justify-content:center;font-size:12px">'+ic('user',14)+'</span>')+
          '<span style="font-weight:600;font-size:14px">'+esc(c.name)+'</span>'+
          '<span style="color:#555;font-size:12px">'+esc(c.nickname?'('+c.nickname+')':'')+'</span>'+
          '<span style="color:'+(c.status==='active'?'#8b5cf6':'#888')+';font-size:11px;margin-left:auto">'+(c.status==='active'?'● activo':'○ inactivo')+'</span>'+
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
    // Members without a coach
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

// ========== INIT ==========
// Auto-restore session if logged in, otherwise show login
checkSession();
document.getElementById('loginEmail').focus();
initParticles();
initRipple();
