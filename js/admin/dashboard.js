// ========== ADMIN DASHBOARD ==========

function renderSection_dashboard(){
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
      '<a class="btn-sm save quick-nav" href="gestion.html" style="text-decoration:none;display:inline-flex;align-items:center;gap:5px">'+ic('trophy',14)+' Gestión</a>'+
      '<a class="btn-sm save quick-nav" href="academia.html" style="text-decoration:none;display:inline-flex;align-items:center;gap:5px">'+ic('calendar',14)+' Academia</a>'+
      '<a class="btn-sm save quick-nav" href="comunicacion.html" style="text-decoration:none;display:inline-flex;align-items:center;gap:5px">'+ic('newspaper',14)+' Comunicación</a>'+
      '<a class="btn-sm save quick-nav" href="operaciones.html" style="text-decoration:none;display:inline-flex;align-items:center;gap:5px">'+ic('user-plus',14)+' Operaciones</a>'+
      '<a class="btn-sm save quick-nav" href="logros.html" style="text-decoration:none;display:inline-flex;align-items:center;gap:5px">'+ic('award',14)+' Logros</a>'+
      '<a class="btn-sm save quick-nav" href="sistema.html" style="text-decoration:none;display:inline-flex;align-items:center;gap:5px">'+ic('file-text',14)+' Sistema</a>'+
    '</div></div>'+
  '</div>';
  if(typeof lucide!=='undefined')lucide.createIcons();
}
