// ========== SUPABASE CONFIG ==========
var SB='https://rjfozwxszoucxgojxxjq.supabase.co';
var ANON='sb_publishable_2TrSxTYex3tHeswK99e4jQ_95sONVN6';
var db=null; var rtChannel=null; var _dbFailed=false;

// ========== TOAST ==========
function toast(m,t){var el=document.getElementById('toast');if(!el)return;el.textContent=m;el.className='toast show '+(t||'ok');setTimeout(function(){el.classList.remove('show')},2800)}

// ========== UTILS ==========
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,8)}
function esc(t){var d=document.createElement('div');d.textContent=t;return d.innerHTML}
function ic(n,s){return'<i data-lucide="'+esc(n)+'" style="width:'+(s||18)+'px;height:'+(s||18)+'px;display:inline-block;vertical-align:middle"></i>'}
function fmtName(n){if(!n)return'';var p=n.split('#');return esc(p[0])+(p[1]?'<span style="opacity:0.5;display:block">#'+esc(p[1])+'</span>':'')}

// ========== DATA ==========
const STORAGE_KEY='quasar_data';
function defaultData(){return{
  schedule:[],team:[],scrims:[],members:[],coaches:[],academy:[],news:[],stats:[],announcements:[],curriculum:[],tasks:[],substitutions:[],rank_history:[],member_achievements:[],achievements:[],evaluations:[],coach_notes:[],materials:[],task_completions:[],attendance:[],quizzes:[],quiz_responses:[],groups:[],group_coaches:[],applications:[],content:{home:{
    terms_title:'TÉRMINOS, CONDICIONES Y POLÍTICA DE PRIVACIDAD DE QU4SAR ACADEMY',
    terms_content:'Última actualización: Junio de 2026\n\n1. SOBRE QU4SAR ACADEMY\nQU4SAR Academy es una comunidad independiente dedicada al aprendizaje, desarrollo y perfeccionamiento de habilidades dentro del videojuego VALORANT. Nuestra misión es proporcionar un entorno organizado, respetuoso y orientado al crecimiento de jugadores que buscan mejorar su rendimiento individual y colectivo mediante clases, entrenamientos, análisis de partidas, actividades educativas y participación comunitaria.\nActualmente, todos los servicios ofrecidos por QU4SAR Academy son completamente gratuitos y tienen fines educativos, recreativos y comunitarios.\nQU4SAR Academy no está afiliada, asociada, patrocinada ni respaldada oficialmente por Riot Games, Inc.\n\n2. ACEPTACIÓN DE LOS TÉRMINOS\nAl registrarse, acceder al sitio web, unirse al servidor de Discord, participar en entrenamientos, eventos o utilizar cualquier servicio relacionado con QU4SAR Academy, el usuario declara haber leído, comprendido y aceptado los presentes Términos, Condiciones y Política de Privacidad.\nSi el usuario no está de acuerdo con cualquiera de las disposiciones aquí establecidas, deberá abstenerse de utilizar los servicios ofrecidos por la comunidad.\n\n3. DATOS RECOPILADOS\nQU4SAR Academy podrá recopilar información proporcionada voluntariamente por los usuarios durante procesos de inscripción, participación o interacción con la comunidad.\nEsta información puede incluir:\n• Nombre, alias o apodo.\n• Riot ID.\n• Nombre de usuario de Discord.\n• Rango dentro de VALORANT.\n• Rol principal dentro del juego.\n• Disponibilidad horaria.\n• Objetivos de aprendizaje.\n• Información proporcionada mediante formularios de inscripción.\n• Datos relacionados con participación académica dentro de la plataforma.\nQU4SAR Academy no solicita ni almacena información financiera, bancaria o métodos de pago mientras los servicios permanezcan gratuitos.\n\n4. USO DE LA INFORMACIÓN\nLa información recopilada será utilizada exclusivamente para:\n• Gestionar inscripciones.\n• Organizar grupos de entrenamiento.\n• Coordinar horarios y actividades.\n• Asignar coaches o responsables académicos.\n• Mantener comunicación con los participantes.\n• Gestionar asistencia y progreso.\n• Mejorar la calidad de las actividades ofrecidas.\n• Administrar el funcionamiento interno de la comunidad.\nLa información recopilada no será vendida, alquilada ni cedida a terceros con fines comerciales.\n\n5. ALMACENAMIENTO Y SEGURIDAD DE LOS DATOS\nQU4SAR Academy adopta medidas razonables para proteger la información almacenada mediante herramientas tecnológicas y procedimientos organizativos adecuados.\nSin embargo, ningún sistema informático puede garantizar una seguridad absoluta. En consecuencia, el usuario reconoce y acepta los riesgos inherentes al uso de internet y de servicios digitales.\n\n6. NORMAS DE CONDUCTA\nTodos los miembros de la comunidad deberán mantener un comportamiento respetuoso y profesional.\nSe encuentra prohibido:\n• Realizar actos de acoso o intimidación.\n• Discriminar por cualquier motivo.\n• Emitir amenazas o comportamientos hostiles.\n• Difundir contenido ilegal, ofensivo o inapropiado.\n• Alterar deliberadamente el funcionamiento de la comunidad.\n• Utilizar canales oficiales para spam o publicidad no autorizada.\n• Realizar conductas consideradas tóxicas por la administración.\nLa administración podrá aplicar advertencias, restricciones, suspensiones temporales o expulsiones permanentes cuando considere que un usuario incumple estas normas.\n\n7. PARTICIPACIÓN EN ACTIVIDADES\nLas actividades desarrolladas por QU4SAR Academy incluyen, entre otras:\n• Clases teóricas.\n• Entrenamientos prácticos.\n• Revisiones de partidas.\n• Scrims.\n• Actividades académicas.\n• Eventos comunitarios.\nTodas las actividades son ofrecidas con fines educativos y de desarrollo personal.\nQU4SAR Academy no garantiza:\n• Ascensos de rango.\n• Resultados competitivos específicos.\n• Ingreso a equipos oficiales.\n• Participación en torneos.\n• Éxito competitivo o profesional.\nLos resultados obtenidos dependerán del compromiso, esfuerzo, práctica y desempeño individual de cada participante.\n\n8. CONTENIDO GENERADO POR LOS USUARIOS\nLos usuarios conservan la titularidad de los contenidos que publiquen o compartan dentro de la comunidad.\nAl participar en QU4SAR Academy, el usuario concede una autorización no exclusiva para utilizar dicho contenido con fines educativos, informativos, promocionales o comunitarios relacionados con la academia, respetando siempre la autoría correspondiente.\n\n9. PROPIEDAD INTELECTUAL\nLos elementos identificativos de QU4SAR Academy, incluyendo:\n• Nombre de la comunidad.\n• Logotipos.\n• Diseño visual.\n• Materiales educativos.\n• Recursos gráficos.\n• Documentación interna.\npertenecen a sus respectivos creadores y propietarios.\nSu uso, reproducción o distribución con fines comerciales requerirá autorización previa por escrito.\n\n10. LIMITACIÓN DE RESPONSABILIDAD\nQU4SAR Academy es una iniciativa comunitaria, gratuita y desarrollada por colaboradores voluntarios.\nLa organización, sus administradores, coaches, moderadores y colaboradores no serán responsables por:\n• Pérdida de cuentas de terceros.\n• Problemas técnicos ajenos a la plataforma.\n• Interrupciones de servicios externos.\n• Conflictos entre usuarios.\n• Daños derivados del uso de plataformas de terceros.\n• Resultados competitivos obtenidos por los participantes.\n• Decisiones tomadas por usuarios basadas en recomendaciones proporcionadas dentro de la comunidad.\n\n11. MODIFICACIONES DE LOS TÉRMINOS\nQU4SAR Academy podrá actualizar, modificar o ampliar estos términos cuando resulte necesario para mejorar el funcionamiento de la comunidad o adaptarse a nuevos requerimientos operativos.\nLas modificaciones entrarán en vigor desde el momento de su publicación en los canales oficiales de la academia.\n\n12. CONTACTO\nPara consultas relacionadas con la comunidad, protección de datos, funcionamiento de la plataforma o cualquier aspecto relacionado con estos términos, los usuarios podrán comunicarse mediante los canales oficiales de QU4SAR Academy.\n\nDECLARACIÓN FINAL\nAl registrarse, acceder a la plataforma o participar en cualquiera de las actividades organizadas por QU4SAR Academy, el usuario declara haber leído, comprendido y aceptado íntegramente los presentes Términos, Condiciones y Política de Privacidad.\n\nQU4SAR Academy\n"Aprender, mejorar y competir."'
  }}
}}
function getData(){try{var r=localStorage.getItem(STORAGE_KEY);if(r)return JSON.parse(r)}catch(e){}var d=defaultData();try{localStorage.setItem(STORAGE_KEY,JSON.stringify(d))}catch(e){};return d}
function saveLocal(d){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(d))}catch(e){}}
var DATA=getData();if(!DATA.content)DATA.content={home:{}};if(!DATA.content.home)DATA.content.home={};if(!DATA.coaches)DATA.coaches=[];if(!DATA.task_completions)DATA.task_completions=[];
if(!DATA.content.home.terms_title||!DATA.content.home.terms_content){
  var def=defaultData();
  DATA.content.home.terms_title=def.content.home.terms_title;
  DATA.content.home.terms_content=def.content.home.terms_content;
  saveLocal(DATA);
}

// ========== ANIMATION HELPERS ==========
function animateGrid(container){
  if(!container)return;
  var ch=container.children;
  for(var i=0;i<ch.length;i++)ch[i].classList.add('card-enter');
}
function initRipple(){
  document.addEventListener('click',function(e){
    var btn=e.target.closest('.btn-primary,.btn-secondary,.btn-sm,.btn-danger,.btn-link,.icon-btn');
    if(!btn||btn.closest('.no-ripple'))return;
    var rect=btn.getBoundingClientRect();
    var r=document.createElement('span');r.className='btn-ripple';
    var s=Math.max(rect.width,rect.height);
    r.style.width=r.style.height=s+'px';
    r.style.left=(e.clientX-rect.left-s/2)+'px';r.style.top=(e.clientY-rect.top-s/2)+'px';
    btn.appendChild(r);
    setTimeout(function(){r.remove()},600);
  });
}
function initParticles(){
  var c=15,cols=['#8B5CF6','#A78BFA','#7C3AED','#6D28D9'];
  for(var i=0;i<c;i++){
    var p=document.createElement('div');
    p.className='particle';
    p.style.width=p.style.height=(Math.random()*3+1)+'px';
    p.style.left=Math.random()*100+'%';p.style.background=cols[Math.floor(Math.random()*cols.length)];
    p.style.animation='floatUp '+(Math.random()*10+12)+'s '+(Math.random()*15)+'s linear infinite';
    document.body.appendChild(p);
  }
}
function showSkeleton(container,count){
  if(!container)return;
  var h='';
  for(var i=0;i<count;i++)h+='<div class="skeleton skeleton-card"><div class="skeleton-text"></div><div class="skeleton-text short"></div></div>';
  container.innerHTML=h;
}

// ========== RANK/GROUP HELPERS ==========
function getGroupFromRank(rank){
  if(!rank)return'';
  if(['Hierro','Bronce','Plata','Oro'].some(function(t){return rank.startsWith(t)}))return'g1';
  if(['Platino','Diamante','Ascendente','Inmortal','Radiante'].some(function(t){return rank.startsWith(t)}))return'g2';
  return'';
}
function groupName(id){var g=(DATA.groups||[]).find(function(g){return g.id===id});return g?g.name:id||'General'}

// ========== SECTION VISIBILITY ==========
var ALL_SECTIONS=['schedule','dashboard','team','members','scrims','stats','academy','news','announcements','substitutions','register'];
function getVis(){try{var r=localStorage.getItem('qsr_sections');if(r)return JSON.parse(r)}catch(e){}var d={};ALL_SECTIONS.forEach(function(s){d[s]=true});return d}
function isVisible(id){var v=getVis();return v[id]!==false}

// ========== LOGIN SYSTEM ==========
var LOGIN_KEY='quasar_login';
function getLogin(){try{var r=localStorage.getItem(LOGIN_KEY);if(r)return JSON.parse(r)}catch(e){}return null}
function setLogin(u){try{localStorage.setItem(LOGIN_KEY,JSON.stringify(u))}catch(e){}}
function clearLogin(){try{localStorage.removeItem(LOGIN_KEY)}catch(e){}}
function isLoggedIn(){return!!getLogin()}
function loginName(){var u=getLogin();return u?u.name:''}
function getUserGroup(u){
  if(!u)return'';
  var g=u.group_id||'';
  g=String(g).trim().toLowerCase();
  if(g)return g;
  if(u.rank)return getGroupFromRank(u.rank);
  return'';
}

// ========== FILTERS ==========
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
function applyFilter(section){}
function buildFilterHTML(section,showCoach,showGroup,onchange){return ''}
function clearFilters(section){_filters.group='';var u=getLogin();_filters.coach=u&&u.coach?u.coach:''}
function onDashFilter(){}
function ensureFilters(section,showCoach,showGroup,contentId){}
function isCommunity(){return !!document.getElementById('isCommunity')}

// ========== IMAGE OVERLAY ==========
var _imageZoom=1;
function showImageOverlay(src,caption){
  var ov=document.getElementById('imageOverlay');
  if(!ov)return;
  var img=document.getElementById('imageOverlayImg');
  var loader=document.getElementById('imageOverlayLoader');
  var cap=document.getElementById('imageOverlayCaption');
  ov.classList.add('loading');
  if(loader)loader.style.display='block';
  if(img)img.style.opacity='0';
  if(img)img.className='';
  if(img)img.src=src;
  _imageZoom=1;
  if(caption&&cap){cap.textContent=caption;cap.classList.add('show')}else{if(cap){cap.textContent='';cap.classList.remove('show')}}
  ov.classList.add('open');
  document.body.style.overflow='hidden';
  if(img){
    img.onload=function(){ov.classList.remove('loading');if(loader)loader.style.display='none';img.style.opacity='1'};
    img.onerror=function(){ov.classList.remove('loading');if(loader)loader.style.display='none';img.style.opacity='1'};
  }
}
function closeImageOverlay(){
  var ov=document.getElementById('imageOverlay');
  if(!ov)return;
  ov.classList.remove('open','loading');
  var loader=document.getElementById('imageOverlayLoader');
  if(loader)loader.style.display='none';
  var img=document.getElementById('imageOverlayImg');
  if(img)img.style.transform='scale(1)';
  _imageZoom=1;
  document.body.style.overflow='';
}
var _ioEl=document.getElementById('imageOverlay');
if(_ioEl){
  _ioEl.addEventListener('wheel',function(e){
    var img=document.getElementById('imageOverlayImg');
    if(!img||!img.src)return;
    e.preventDefault();
    _imageZoom=Math.max(0.5,Math.min(4,_imageZoom+(e.deltaY<0?0.15:-0.15)));
    img.style.transform='scale('+_imageZoom+')';
    img.className=_imageZoom>1?'zoomed':'';
  });
  var _imgEl=document.getElementById('imageOverlayImg');
  if(_imgEl){
    _imgEl.addEventListener('click',function(e){
      e.stopPropagation();
      if(_imageZoom>1){_imageZoom=1;this.style.transform='scale(1)';this.className=''}
      else{_imageZoom=2;this.style.transform='scale(2)';this.className='zoomed'}
    });
  }
}

// Global ESC key handler
document.addEventListener('keydown',function(e){
  if(e.key==='Escape'){
    var io=document.getElementById('imageOverlay');
    if(io&&io.classList.contains('open')){closeImageOverlay();return}
    var lo=document.getElementById('loginOverlay');
    if(lo&&!lo.classList.contains('hidden')){lo.classList.add('hidden');lo.style.display='';document.body.style.overflow=''}
  }
});

// ========== DETAIL OVERLAY ==========
function showDetail(html){
  var dc=document.getElementById('detailCard');
  if(!dc)return;
  dc.innerHTML='<button class="close-btn" onclick="closeDetail()">'+ic('x',18)+'</button>'+html;
  document.getElementById('detailOverlay').classList.add('open');
  document.body.style.overflow='hidden';
  if(typeof lucide!=='undefined')lucide.createIcons();
}
function closeDetail(){
  var ov=document.getElementById('detailOverlay');
  if(!ov)return;
  ov.classList.remove('open');
  document.body.style.overflow='';
}

// ========== TIMEZONE ==========
function detectTZ(){try{return Intl.DateTimeFormat().resolvedOptions().timeZone}catch(e){}return'America/Lima'}
function toLocalTime(hhmm,sourceTZ){
  if(!hhmm)return'';
  var p=hhmm.split(':');var h=+p[0];var m=+p[1];
  var now=new Date();var tz=sourceTZ||'America/Lima';
  var fmt=new Intl.DateTimeFormat('en',{timeZone:tz,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false});
  var parts=fmt.formatToParts(now);
  function v(t){for(var i=0;i<parts.length;i++)if(parts[i].type===t)return+parts[i].value;return 0}
  var srcOff=(now.getTime()-Date.UTC(v('year'),v('month')-1,v('day'),v('hour'),v('minute'),v('second')))/60000;
  var locOff=now.getTimezoneOffset();
  var total=((h*60+m+srcOff-locOff)%1440+1440)%1440;
  var d=new Date();d.setHours(Math.floor(total/60),Math.round(total%60),0,0);
  return d.toLocaleTimeString('es',{hour:'numeric',minute:'2-digit',hour12:true});
}
