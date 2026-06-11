function renderHero(){
  var c=DATA.content.home||{};
  var h=document.getElementById('heroContent');
  h.innerHTML=
    '<img src="'+esc(c.logo_url||'QU4SAR.png')+'" alt="QU4SAR" style="max-width:300px;max-height:300px;width:auto;height:auto;margin-bottom:36px;animation:float 8s ease-in-out infinite">'+
    '<h1><span class="gradient-text">'+esc(c.hero_title||'QU4SAR')+'</span></h1>'+
    '<p>'+esc(c.hero_subtitle||'Organización competitiva de Valorant Premier')+'</p>'+
    (c.hero_desc?'<p style="color:#888;font-size:15px;max-width:600px;margin:0 auto">'+esc(c.hero_desc)+'</p>':'')+
    '<p class="tagline">'+esc(c.site_tagline||'Academia · Scrims · Creación de contenido · Esports de alto nivel')+'</p>';
}
function renderFooter(){
  var c=DATA.content.home||{};
  var f=document.getElementById('footerSocial');
  if(!f)return;
  var links=[{k:'social_twitch',l:'Twitch',i:ic('twitch',16)},{k:'social_youtube',l:'YouTube',i:ic('youtube',16)},{k:'social_twitter',l:'Twitter',i:ic('twitter',16)},{k:'social_instagram',l:'Instagram',i:ic('instagram',16)}];
  f.innerHTML=links.filter(function(l){return c[l.k]}).map(function(l){return'<a href="'+esc(c[l.k])+'" target="_blank" title="'+l.l+'">'+l.i+'</a>'}).join('');
}
function renderNews(){
  var grid=document.getElementById('newsGrid');
  var items=DATA.news||[];
  items=filterByCoach(filterByGroup(items));
  if(!items.length){grid.innerHTML='<div style="text-align:center;padding:40px;color:#555;grid-column:1/-1">'+ic('newspaper',48)+'<br>No hay noticias publicadas</div>';return}
  grid.innerHTML=items.map(function(n,i){return'<div class="glass-card news-card" onclick="showNewsDetail('+i+')" style="cursor:pointer">'+
    '<div class="news-img">'+(n.image_url?'<img src="'+esc(n.image_url)+'" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:12px 12px 0 0;cursor:pointer" onclick="event.stopPropagation();showImageOverlay(this.src,this.alt)">':ic('newspaper',40))+'</div>'+
    '<div class="body"><div class="meta"><span>'+ic('calendar',14)+' '+(n.date||'')+'</span><span>'+ic('user',14)+' '+esc(n.author||'Admin')+'</span></div><h3>'+esc(n.title)+'</h3><p style="white-space:pre-wrap">'+esc(n.excerpt||n.content||'')+'</p></div></div>'}).join('');
}
function showNewsDetail(i){
  var n=filterByCoach(filterByGroup((DATA.news||[]).filter(function(x){return x.published})))[i];
  if(!n)return;
  showDetail((n.image_url?'<img src="'+esc(n.image_url)+'" class="detail-img" style="cursor:pointer" onclick="event.stopPropagation();showImageOverlay(this.src,this.alt)">':'')+
    '<h2>'+esc(n.title)+'</h2>'+
    '<div class="meta"><span>'+ic('calendar',14)+' '+(n.date||'')+'</span><span>'+ic('user',14)+' '+esc(n.author||'Admin')+'</span></div>'+
    '<div class="body-text">'+esc(n.content||n.excerpt||'')+'</div>'+
    (n.attachment_url?'<a href="'+esc(n.attachment_url)+'" target="_blank" class="attach-link" onclick="event.stopPropagation()">'+ic('paperclip',16)+' '+esc(n.attachment_name||'Descargar archivo')+'</a>':''));
}
function renderTeam(){
  var c=document.getElementById('teamContainer');
  var team=DATA.team||[];
  var g={Titular:[],Suplente:[],Prueba:[]};
  team.forEach(function(m){if(g[m.status])g[m.status].push(m)});
  var sb={Titular:'badge-green',Suplente:'badge-yellow',Prueba:'badge-blue'};
  var roleIcons={Duelist:'sword',Initiator:'search',Controller:'shield',Sentinel:'castle',Flex:'refresh-cw'};
  var h='';
  Object.keys(g).forEach(function(s){
    if(!g[s].length)return;
    h+='<div class="team-group"><div class="team-group-title">'+(s==='Titular'?ic('star',20)+'<span style="margin-right:6px"></span>':s==='Suplente'?ic('clipboard-list',20)+'<span style="margin-right:6px"></span>':ic('search',20)+'<span style="margin-right:6px"></span>')+' '+s+' <span style="font-weight:400;font-size:13px;color:#666">('+g[s].length+')</span></div><div class="team-grid">';
    g[s].forEach(function(m){
      h+='<div class="glass-card member-card"><div class="member-icon">'+(roleIcons[m.role]?ic(roleIcons[m.role],28):ic('gamepad-2',28))+'</div>'+
        '<h3>'+fmtName(m.name)+'</h3>'+
        (m.role?'<div class="member-role">'+esc(m.role)+'</div>':'')+
        (m.rank?'<div class="member-rank">'+esc(m.rank)+'</div>':'')+
        '<span class="badge '+(sb[m.status]||'badge-gray')+'">'+m.status+'</span>'+
        (m.bio?'<div class="member-role" style="margin-top:8px;font-size:12px;color:#666">'+esc(m.bio)+'</div>':'')+
      '</div>';
    });
    h+='</div></div>';
  });
  if(!h)h='<div style="text-align:center;padding:40px;color:#555">'+ic('trophy',48)+'<br>No hay jugadores registrados</div>';
  c.innerHTML=h;
}
function renderTerms(){
  var c=DATA.content.home||{};
  var el=document.getElementById('termsContent');
  if(!el)return;
  el.innerHTML='<div class="glass-card" style="padding:36px;max-width:800px;margin:0 auto;line-height:1.8">'+
    (c.terms_title?'<h3 style="font-family:var(--font-display);margin-bottom:16px">'+esc(c.terms_title)+'</h3>':'')+
    '<div style="color:#ccc;font-size:14px;white-space:pre-wrap">'+esc(c.terms_content||'Términos y condiciones próximamente.')+'</div></div>';
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
function toggleNav(){document.getElementById('navLinks').classList.toggle('open')}
function renderPublicSections(){
  safeRender(renderHero,'hero');
  safeRender(renderFooter,'footer');
  if(typeof lucide!=='undefined')lucide.createIcons();
}
function safeRender(fn,name){try{fn()}catch(e){console.log('Render error ['+name+']:',e)}}
function updateLoginBadge(){
  var u=getLogin();
  var badge=document.getElementById('loginBadge');
  var nameEl=document.getElementById('loginNameIndex');
  var btn=document.getElementById('plataformaBtn');
  if(u&&u.id&&badge&&nameEl){
    badge.style.display='flex';
    nameEl.textContent=u.name+(u.role?' · '+u.role:'');
    if(btn)btn.style.display='none';
  }else{
    if(badge)badge.style.display='none';
    if(btn)btn.style.display='';
  }
}
function logoutIndex(){
  clearLogin();
  updateLoginBadge();
  toast('Sesión cerrada');
}
(async function(){
  try{
    if(!db){if(typeof supabase==='undefined'){console.log('Supabase SDK not loaded');renderPublicSections();updateLoginBadge();initParticles();initRipple();initScrollReveal();initNavbarScroll();return}db=supabase.createClient(SB,ANON)}
    var {error}=await db.from('schedule').select('id',{count:'exact',head:true});
    if(!error){
      var fetches=await Promise.all([
        db.from('news').select('*').eq('published',true).order('date',{ascending:false}),
        db.from('team').select('*'),
        db.from('content').select('*'),
        db.from('coaches').select('*'),
        db.from('groups').select('*'),
        db.from('group_coaches').select('*'),
        db.from('members').select('*'),
      ]);
      if(fetches[0].data)DATA.news=fetches[0].data;
      if(fetches[1].data)DATA.team=fetches[1].data;
      if(fetches[2].data){var o={};fetches[2].data.forEach(function(c){o[c.key]=c.value});if(!DATA.content||!DATA.content.home)DATA.content={home:{}};DATA.content.home=Object.assign({},DATA.content.home,o)}
      if(fetches[3].data)DATA.coaches=fetches[3].data;
      if(fetches[4].data)DATA.groups=fetches[4].data;
      if(fetches[5].data)DATA.group_coaches=fetches[5].data;
      if(fetches[6].data)DATA.members=fetches[6].data;
      saveLocal(DATA);
      var ds=document.getElementById('dbStatus');
      if(ds){ds.innerHTML='<i data-lucide="wifi" style="width:12px;height:12px;vertical-align:middle"></i> <span>conectado</span>';ds.className='online';if(typeof lucide!=='undefined')lucide.createIcons()}
    }
  }catch(e){console.log('DB unavailable:',e)}
  renderPublicSections();
  updateLoginBadge();
  initParticles();
  initRipple();
  initScrollReveal();
  initNavbarScroll();
})();
