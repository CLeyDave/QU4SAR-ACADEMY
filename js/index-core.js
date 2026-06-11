// ========== DATA ==========
const STORAGE_KEY='quasar_data';
function defaultData(){return{
  schedule:[],team:[],scrims:[],members:[],coaches:[],academy:[],news:[],stats:[],announcements:[],curriculum:[],tasks:[],substitutions:[],rank_history:[],member_achievements:[],achievements:[],evaluations:[],coach_notes:[],materials:[],task_completions:[],attendance:[],quizzes:[],quiz_responses:[],groups:[],group_coaches:[],applications:[],content:{home:{}}
}}
function getData(){try{var r=localStorage.getItem(STORAGE_KEY);if(r)return JSON.parse(r)}catch(e){}var d=defaultData();try{localStorage.setItem(STORAGE_KEY,JSON.stringify(d))}catch(e){};return d}
function saveLocal(d){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(d))}catch(e){}}
var DATA=getData();if(!DATA.content)DATA.content={home:{}};if(!DATA.content.home)DATA.content.home={};if(!DATA.coaches)DATA.coaches=[];if(!DATA.task_completions)DATA.task_completions=[];

// ========== SECTION VISIBILITY ==========

// ========== SECTION VISIBILITY (controlled by admin) ==========
var ALL_SECTIONS=['schedule','dashboard','team','members','scrims','stats','academy','news','announcements','substitutions','register'];
function getVis(){try{var r=localStorage.getItem('qsr_sections');if(r)return JSON.parse(r)}catch(e){}var d={};ALL_SECTIONS.forEach(function(s){d[s]=true});return d}
function isVisible(id){var v=getVis();return v[id]!==false}
function applyVisibility(){
  var u=getLogin();
  var isGuest=!u||!u.id;
  var isMember=u&&u.id;
  var guestOK=['home','news','register'];
  ALL_SECTIONS.forEach(function(id){
    var el=document.getElementById('section-'+id);
    if(!el)return;
    if(isGuest&&guestOK.indexOf(id)<0){el.style.display='none';return}
    if(isMember&&id==='register'){el.style.display='none';return}
    el.style.display=isVisible(id)?'':'none';
  });
  document.querySelectorAll('.nav-links a[data-section]').forEach(function(a){
    var sec=a.getAttribute('data-section');
    if(isGuest&&guestOK.indexOf(sec)<0){a.style.display='none';return}
    if(isMember&&sec==='register'){a.style.display='none';return}
    if(sec)a.style.display=isVisible(sec)?'':'none';
  });
}

function initScrollReveal(){
  if('IntersectionObserver' in window){
    var obs=new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target)}
      });
    },{threshold:0.08});
    document.querySelectorAll('.section,.hero').forEach(function(el){el.classList.add('reveal');obs.observe(el)});
  }else{document.querySelectorAll('.section,.hero').forEach(function(el){el.classList.add('visible')})}
}
function initNavbarScroll(){
  var nav=document.getElementById('navbar');
  if(!nav)return;
  nav.classList.toggle('scrolled',window.scrollY>50);
  window.addEventListener('scroll',function(){nav.classList.toggle('scrolled',window.scrollY>50)});
}
function fmtName(n){if(!n)return'';var p=n.split('#');return esc(p[0])+(p[1]?'<span style="opacity:0.5;display:block">#'+esc(p[1])+'</span>':'')}

// ========== NAV ==========
function showSection(name){
  if(name!=='home' && !isVisible(name))return;
  if(!getLogin()&&['','home','news','register'].indexOf(name)<0){name='home'}
  var el=document.getElementById('section-'+name);
  if(el)el.scrollIntoView({behavior:'smooth',block:'start'});
  document.querySelectorAll('.nav-links a').forEach(a=>a.classList.remove('active'));
  document.querySelectorAll('.nav-links a[data-section]').forEach(function(a){
    if(a.getAttribute('data-section')===name||(name==='home'&&a.getAttribute('data-section')===''))a.classList.add('active')});
  document.getElementById('navLinks').classList.remove('open');
  if(name==='register'){document.getElementById('registerForm').scrollIntoView({behavior:'smooth',block:'start'});return}
  if(name!=='home')renderSection(name);
}
function toggleNav(){document.getElementById('navLinks').classList.toggle('open')}
function renderSection(n){try{switch(n){
  case'schedule':renderSchedule();break;
  case'academy':renderAcademy();break;
  case'team':renderTeam();break;
  case'scrims':renderScrims();break;
  case'stats':renderStats();break;
  case'news':renderNews();break;
  case'members':renderMembers();break;
  case'dashboard':renderDashboard();break;
  case'register':break;
  case'announcements':renderAnnouncements();break;
  case'substitutions':renderSubstitutions();break;
}renderHero();renderFooter()}catch(e){}if(typeof lucide!=='undefined')lucide.createIcons()}


// ========== LOGIN SYSTEM ==========
var LOGIN_KEY='quasar_login';
function getLogin(){try{var r=localStorage.getItem(LOGIN_KEY);if(r)return JSON.parse(r)}catch(e){}return null}
function setLogin(u){try{localStorage.setItem(LOGIN_KEY,JSON.stringify(u))}catch(e){}}
function clearLogin(){try{localStorage.removeItem(LOGIN_KEY)}catch(e){}}
function isLoggedIn(){return!!getLogin()}
function loginName(){var u=getLogin();return u?u.name:''}

function handleLogin(){
  var input=document.getElementById('loginInput');
  var msg=document.getElementById('loginMsg');
  var btn=document.getElementById('loginBtn');
  var name=input.value.trim();
  if(!name){msg.textContent='Ingresa tu nombre de VALORANT';msg.style.color='#8b5cf6';return}
  btn.disabled=true;btn.innerHTML='Verificando...';
  var member=(DATA.members||[]).find(function(m){return m.name.toLowerCase()===name.toLowerCase()});
  if(member){
    setLogin({name:member.name,id:member.id,role:member.role,rank:member.rank,group_id:member.group_id||'',coach:member.coach||''});
    msg.textContent='? Bienvenido, '+member.name;msg.style.color='#8b5cf6';
    setTimeout(function(){
      var ov=document.getElementById('loginOverlay');
      if(ov){ov.classList.add('hidden');ov.style.display=''}
      document.body.style.overflow='';
      updateLoginBadge();applyVisibility();
      btn.disabled=false;btn.innerHTML='Iniciar Sesión';
      renderSchedule();renderAcademy();renderScrims();renderStats();renderNews();renderAnnouncements();renderSubstitutions();renderDashboard();
    },600);
  }else{
    msg.textContent='? No encontramos ese usuario. ¿Estás registrado?';msg.style.color='#ff4444';
    btn.disabled=false;btn.innerHTML='Iniciar Sesión';
  }
}

function logout(){
  clearLogin();
  applyVisibility();
  document.getElementById('navLinks').classList.remove('open');
  try{
    var overlay=document.getElementById('loginOverlay');
    if(overlay){overlay.classList.remove('hidden');overlay.style.display='';document.body.style.overflow='hidden'}
    var input=document.getElementById('loginInput');
    if(input)input.value='';
    var msg=document.getElementById('loginMsg');
    if(msg)msg.textContent='';
    var badge=document.getElementById('loginBadge');
    if(badge)badge.style.display='none';
    var nl=document.getElementById('navLogout');
    if(nl)nl.style.display='none';
  }catch(e){console.log('Logout error:',e)}
  renderSchedule();renderAcademy();renderScrims();renderStats();renderNews();renderAnnouncements();renderSubstitutions();renderDashboard();
}

function updateLoginBadge(){
  var u=getLogin();
  var badge=document.getElementById('loginBadge');
  var nameEl=document.getElementById('loginName');
  var coachEl=document.getElementById('loginCoach');
  var nl=document.getElementById('navLogout');
  var isMember=u&&u.id;
  if(u&&badge&&nameEl){
    badge.style.display='flex';
    nameEl.textContent=u.name+(u.role?' · '+u.role:'');
    if(coachEl){
      if(u.coach){coachEl.textContent='? Coach: '+u.coach;coachEl.style.display='inline'}else{coachEl.style.display='none'}
    }
    if(nl)nl.style.display='block';
  }else{
    if(badge)badge.style.display='none';
    if(nl)nl.style.display='none';
  }
  var guestSections=['','home','news','register'];
  document.querySelectorAll('.nav-links a[data-section]').forEach(function(a){
    var sec=a.getAttribute('data-section');
    if(isMember&&sec==='register'){a.style.display='none';return}
    a.style.display=(u&&!u.id&&guestSections.indexOf(sec)<0)?'none':'';
  });
}

function getUserGroup(u){
  if(!u)return'';
  var g=u.group_id||'';
  g=String(g).trim().toLowerCase();
  if(g)return g;
  if(u.rank)return getGroupFromRank(u.rank);
  return'';
}
var _filters={group:'',coach:''};
function filterByGroup(items,groupFilter){
  var u=getLogin();
  var userGroup=groupFilter||_filters.group||getUserGroup(u);
  if(!userGroup)return items;
  return items.filter(function(item){
    var g=String(item.group_id||'').trim().toLowerCase();
    return g===''||g===userGroup;
  });
}
function filterByCoach(items,coachFilter){
  var u=getLogin();
  var coach=coachFilter||_filters.coach||(u&&u.coach)||'';
  if(!coach)return items;
  return items.filter(function(item){
    var c=String(item.coach||'').trim();
    return c===''||c===coach;
  });
}
function applyFilter(section){
  var el=document.getElementById(section+'Filter');
  if(!el)return;
  _filters.group=el.querySelector('.fg')?el.querySelector('.fg').value:'';
  _filters.coach=el.querySelector('.fc')?el.querySelector('.fc').value:'';
  var fn=window['render'+section.charAt(0).toUpperCase()+section.slice(1)];
  if(fn)fn();
}
function buildFilterHTML(section,showCoach,showGroup,onchange){
  var u=getLogin();
  var defGroup=_filters.group||getUserGroup(u);
  var defCoach=_filters.coach||(u&&u.coach)||'';
  var cb=onchange||'applyFilter(\''+section+'\')';
  var h='<div class="section-filters" id="'+section+'Filter">';
  if(showGroup){
    h+='<select class="fg input-field filter-select" onchange="'+cb+'"><option value="">Todos los grupos</option>';
    (DATA.groups||[]).forEach(function(g){h+='<option value="'+g.id+'" '+(g.id===defGroup?'selected':'')+'>'+esc(g.name)+'</option>'});
    h+='</select>';
  }
  if(showCoach){
    var coaches={};
    (DATA.coaches||[]).forEach(function(c){coaches[c.name]=true});
    h+='<select class="fc input-field filter-select" onchange="'+cb+'"><option value="">Todos los coaches</option>';
    Object.keys(coaches).sort().forEach(function(c){h+='<option value="'+c+'" '+(c===defCoach?'selected':'')+'>'+esc(c)+'</option>'});
    h+='</select>';
  }
  if(defGroup||defCoach)h+='<button class="btn-sm cancel" onclick="clearFilters(\''+section+'\')">Limpiar</button>';
  return h+'</div>';
}
function clearFilters(section){
  _filters.group='';_filters.coach='';
  if(section.indexOf('dash-')===0)renderDashContent();else applyFilter(section);
}
function onDashFilter(){
  var el=document.querySelector('.dash-filters .section-filters');
  if(!el)return;
  _filters.group=el.querySelector('.fg')?el.querySelector('.fg').value:'';
  _filters.coach=el.querySelector('.fc')?el.querySelector('.fc').value:'';
  renderDashContent();
}
function ensureFilters(section,showCoach,showGroup,contentId){
  var el=document.getElementById(section+'Filter');
  if(el)return;
  contentId=contentId||section+'Bubbles';
  var content=document.getElementById(contentId);
  if(!content)return;
  el=document.createElement('div');
  el.id=section+'Filter';
  content.parentNode.insertBefore(el,content);
  el.innerHTML=buildFilterHTML(section,showCoach,showGroup);
}

// ========== IMAGE OVERLAY ==========
var _imageZoom=1;
function showImageOverlay(src,caption){
  var ov=document.getElementById('imageOverlay');
  var img=document.getElementById('imageOverlayImg');
  var loader=document.getElementById('imageOverlayLoader');
  var cap=document.getElementById('imageOverlayCaption');
  ov.classList.add('loading');
  loader.style.display='block';
  img.style.opacity='0';
  img.className='';
  img.src=src;
  _imageZoom=1;
  if(caption){cap.textContent=caption;cap.classList.add('show')}else{cap.textContent='';cap.classList.remove('show')}
  ov.classList.add('open');
  document.body.style.overflow='hidden';
  // hide loader after image loads
  img.onload=function(){ov.classList.remove('loading');loader.style.display='none';img.style.opacity='1'};
  img.onerror=function(){ov.classList.remove('loading');loader.style.display='none';img.style.opacity='1'};
}
function closeImageOverlay(){
  document.getElementById('imageOverlay').classList.remove('open','loading');
  document.getElementById('imageOverlayLoader').style.display='none';
  document.getElementById('imageOverlayImg').style.transform='scale(1)';
  _imageZoom=1;
  document.body.style.overflow='';
}
// Zoom on scroll
document.getElementById('imageOverlay').addEventListener('wheel',function(e){
  var img=document.getElementById('imageOverlayImg');
  if(!img.src)return;
  e.preventDefault();
  _imageZoom=Math.max(0.5,Math.min(4,_imageZoom+(e.deltaY<0?0.15:-0.15)));
  img.style.transform='scale('+_imageZoom+')';
  img.className=_imageZoom>1?'zoomed':'';
});
// Toggle zoom on click
document.getElementById('imageOverlayImg').addEventListener('click',function(e){
  e.stopPropagation();
  if(_imageZoom>1){_imageZoom=1;this.style.transform='scale(1)';this.className=''}
  else{_imageZoom=2;this.style.transform='scale(2)';this.className='zoomed'}
});

// Global ESC key handler
document.addEventListener('keydown',function(e){
  if(e.key==='Escape'){
    var io=document.getElementById('imageOverlay');
    if(io&&io.classList.contains('open')){closeImageOverlay();return}
    var lo=document.getElementById('loginOverlay');
    if(lo&&!lo.classList.contains('hidden')){lo.classList.add('hidden');lo.style.display='';document.body.style.overflow=''}
  }
});
function showDetail(html){
  document.getElementById('detailCard').innerHTML='<button class="close-btn" onclick="closeDetail()">'+ic('x',18)+'</button>'+html;
  document.getElementById('detailOverlay').classList.add('open');
  document.body.style.overflow='hidden';
  if(typeof lucide!=='undefined')lucide.createIcons();
}
function closeDetail(){
  document.getElementById('detailOverlay').classList.remove('open');
  document.body.style.overflow='';
}
