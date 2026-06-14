// ========== STUDENT PANEL + COMMUNITY ==========

// ========== ACADEMY RANK SYSTEM ==========
var ACADEMY_RANKS = [
  { id: 'cosmic1', name: 'Cosmic I', minXP: 0, color: '#6b7280', glow: 'rgba(107,114,128,0.3)', icon: 'circle', reward: 'Acceso a clases grupales' },
  { id: 'cosmic2', name: 'Cosmic II', minXP: 500, color: '#9ca3af', glow: 'rgba(156,163,175,0.3)', icon: 'circle', reward: 'Acceso a material de estudio' },
  { id: 'cosmic3', name: 'Cosmic III', minXP: 1500, color: '#d1d5db', glow: 'rgba(209,213,219,0.3)', icon: 'circle', reward: 'Evaluación inicial' },
  { id: 'nova1', name: 'Nova I', minXP: 3000, color: '#818cf8', glow: 'rgba(129,140,248,0.3)', icon: 'star', reward: 'Coach asignado' },
  { id: 'nova2', name: 'Nova II', minXP: 5000, color: '#6366f1', glow: 'rgba(99,102,241,0.3)', icon: 'star', reward: 'Scrims semanales' },
  { id: 'nova3', name: 'Nova III', minXP: 7500, color: '#4f46e5', glow: 'rgba(79,70,229,0.3)', icon: 'star', reward: 'Análisis VOD personal' },
  { id: 'nebula1', name: 'Nebula I', minXP: 10000, color: '#a78bfa', glow: 'rgba(167,139,250,0.3)', icon: 'cloud', reward: 'Rol de mentoría' },
  { id: 'nebula2', name: 'Nebula II', minXP: 15000, color: '#8b5cf6', glow: 'rgba(139,92,246,0.3)', icon: 'cloud', reward: 'Insignia exclusiva' },
  { id: 'nebula3', name: 'Nebula III', minXP: 20000, color: '#7c3aed', glow: 'rgba(124,58,237,0.3)', icon: 'cloud', reward: 'Participación en drafts' },
  { id: 'quasar1', name: 'Quasar I', minXP: 30000, color: '#f59e0b', glow: 'rgba(245,158,11,0.3)', icon: 'zap', reward: 'Team principal tryouts' },
  { id: 'quasar2', name: 'Quasar II', minXP: 45000, color: '#fbbf24', glow: 'rgba(251,191,36,0.3)', icon: 'zap', reward: 'Contenido promocional' },
  { id: 'quasar3', name: 'Quasar III', minXP: 60000, color: '#f59e0b', glow: 'rgba(245,158,11,0.5)', icon: 'award', reward: 'Estatus Legendario' },
];

function getAcademyRank(xp) {
  var rank = ACADEMY_RANKS[0];
  for (var i = 0; i < ACADEMY_RANKS.length; i++) {
    if (xp >= ACADEMY_RANKS[i].minXP) rank = ACADEMY_RANKS[i];
  }
  return rank;
}

function getNextAcademyRank(xp) {
  for (var i = 0; i < ACADEMY_RANKS.length; i++) {
    if (xp < ACADEMY_RANKS[i].minXP) return ACADEMY_RANKS[i];
  }
  return null;
}

function getAcademyRankProgress(xp) {
  var current = getAcademyRank(xp);
  var next = getNextAcademyRank(xp);
  if (!next) return 100;
  var currMin = current.minXP;
  var nextMin = next.minXP;
  var range = nextMin - currMin;
  var progress = xp - currMin;
  return Math.round((progress / range) * 100);
}

var ROLE_BADGES = {
  'Alumno': { color: '#8b5cf6', icon: 'graduation-cap' },
  'Coach': { color: '#3b82f6', icon: 'user-check' },
  'Staff': { color: '#10b981', icon: 'shield' },
  'Mentor': { color: '#f59e0b', icon: 'star' }
};

// ========== LOGIN ==========
function handleLogin() {
  var input = document.getElementById('loginInput');
  var msg = document.getElementById('loginMsg');
  var name = input.value.trim();
  if (!name) { msg.textContent = 'Ingresa tu nombre de VALORANT'; return; }

  var member = (DATA.members || []).find(function(m) {
    return m.name && m.name.toLowerCase() === name.toLowerCase();
  });
  if (!member) {
    msg.textContent = 'No encontrado en el club. ¿Estás registrado?';
    return;
  }

  setLogin(member);
  document.getElementById('loginOverlay').classList.add('hidden');
  document.getElementById('loginOverlay').style.display = 'none';

  var badge = document.getElementById('loginBadge');
  var nameEl = document.getElementById('loginName');
  if (badge) badge.style.display = 'flex';
  if (nameEl) nameEl.textContent = member.name;

  var coachEl = document.getElementById('loginCoach');
  if (coachEl && member.coach) {
    coachEl.style.display = 'inline-flex';
    coachEl.innerHTML = ic('user-check', 12) + ' Coach: ' + esc(member.coach);
  } else if (coachEl) {
    coachEl.style.display = 'none';
  }

  showSection('dashboard');
  toast('Bienvenido, ' + member.name, 'ok');
}

function logout() {
  clearLogin();
  var badge = document.getElementById('loginBadge');
  if (badge) badge.style.display = 'none';
  var overlay = document.getElementById('loginOverlay');
  if (overlay) {
    overlay.classList.remove('hidden');
    overlay.style.display = '';
  }
  var sections = document.querySelectorAll('.section.page');
  for (var i = 0; i < sections.length; i++) sections[i].style.display = 'none';
  toast('Sesión cerrada', 'info');
}

// ========== NAVIGATION ==========
function toggleNav() {
  var el = document.getElementById('navLinks');
  if (el) el.classList.toggle('open');
}

function showSection(id) {
  var sections = document.querySelectorAll('.section.page');
  for (var i = 0; i < sections.length; i++) sections[i].style.display = 'none';

  var target = document.getElementById('section-' + id);
  if (target) {
    target.style.display = 'block';
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  var links = document.querySelectorAll('.nav-links a');
  for (var i = 0; i < links.length; i++) links[i].classList.remove('active');
  var active = document.querySelector('.nav-links a[data-section="' + id + '"]');
  if (active) active.classList.add('active');

  var fn = window['renderSection_' + id];
  if (typeof fn === 'function') fn();
}

// ========== COMMUNITY UTILITY HELPERS ==========
function getURLParam(k){var p=new URLSearchParams(window.location.search);return p.get(k)||''}
function fmtDate(d) {
  if (!d) return '';
  try { return new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }); } catch (e) { return d; }
}

function parseRank(r) {
  if (!r) return 0;
  var tiers = { iron: 1, bronze: 2, silver: 3, gold: 4, platinum: 5, diamond: 6, ascendant: 7, immortal: 8, radiant: 9 };
  var rl = r.toLowerCase();
  for (var k in tiers) { if (rl.indexOf(k) >= 0) return tiers[k]; }
  return 0;
}

// ========== FOOTER ==========
function renderFooter() {
  var c = DATA.content && DATA.content.home || {};
  var f = document.getElementById('footerSocial');
  if (!f) return;
  var links = [
    { k: 'social_twitch', l: 'Twitch', i: ic('twitch', 16) },
    { k: 'social_youtube', l: 'YouTube', i: ic('youtube', 16) },
    { k: 'social_twitter', l: 'Twitter', i: ic('twitter', 16) },
    { k: 'social_instagram', l: 'Instagram', i: ic('instagram', 16) }
  ];
  f.innerHTML = links.filter(function(l) { return c[l.k]; }).map(function(l) {
    return '<a href="' + esc(c[l.k]) + '" target="_blank" title="' + l.l + '">' + l.i + '</a>';
  }).join('');
}

// ========== RENDER TEAM ==========
function renderSection_team() {
  var c = document.getElementById('teamContainer') || document.getElementById('teamContent');
  if (!c) return;
  var team = DATA.team || [];
  var g = { Titular: [], Suplente: [], Prueba: [] };
  team.forEach(function(m) { if (g[m.status]) g[m.status].push(m); });
  var sb = { Titular: 'badge-green', Suplente: 'badge-yellow', Prueba: 'badge-blue' };
  var roleIcons = { Duelist: 'sword', Initiator: 'search', Controller: 'shield', Sentinel: 'castle', Flex: 'refresh-cw' };
  var h = '';
  Object.keys(g).forEach(function(s) {
    if (!g[s].length) return;
    h += '<div class="team-group"><div class="team-group-title">' +
      (s === 'Titular' ? ic('star', 20) : s === 'Suplente' ? ic('clipboard-list', 20) : ic('search', 20)) +
      ' ' + s + ' <span style="font-weight:400;font-size:13px;color:#666">(' + g[s].length + ')</span></div><div class="team-grid">';
    g[s].forEach(function(m) {
      var memberImage = (DATA.members || []).find(function(x) { return x.name === m.name; });
      h += '<div class="glass-card member-card" onclick="showMemberDetail(\'' + esc(m.name) + '\')" style="cursor:pointer"><div class="member-icon">' +
        (memberImage && memberImage.image ? '<img src="' + esc(memberImage.image) + '" class="member-photo">' : ic(roleIcons[m.role] || 'gamepad-2', 28)) + '</div>' +
        '<h3>' + fmtName(m.name) + '</h3>' +
        (m.role ? '<div class="member-role">' + esc(m.role) + '</div>' : '') +
        (m.rank ? '<div class="member-rank">' + esc(m.rank) + '</div>' : '') +
        '<span class="badge ' + (sb[m.status] || 'badge-gray') + '">' + m.status + '</span>' +
        (m.bio ? '<div class="member-role" style="margin-top:8px;font-size:12px;color:#666">' + esc(m.bio) + '</div>' : '') +
        '</div>';
    });
    h += '</div></div>';
  });
  if (!h) h = '<div style="text-align:center;padding:40px;color:#555">' + ic('trophy', 48) + '<br>No hay jugadores registrados</div>';
  c.innerHTML = h;
  if (typeof lucide !== "undefined") renderIcons();
}

// ========== RENDER MEMBERS ==========
function renderSection_members() {
  var grid = document.getElementById('membersGrid');
  if (!grid) return;
  var members = DATA.members || [];
  if (!members.length) { grid.innerHTML = '<div style="text-align:center;padding:40px;color:#555">' + ic('users', 48) + '<br>No hay miembros registrados</div>'; return; }
  grid.innerHTML = members.map(function(m) {
    return '<div class="glass-card member-card" onclick="showMemberDetail(\'' + esc(m.name) + '\')" style="cursor:pointer">' +
      '<div class="member-icon">' + (m.image ? '<img src="' + esc(m.image) + '" class="member-photo">' : ic('user', 28)) + '</div>' +
      '<h3>' + fmtName(m.name) + '</h3>' +
      (m.role ? '<div class="member-role">' + esc(m.role) + '</div>' : '') +
      (m.rank ? '<div class="member-rank">' + esc(m.rank) + '</div>' : '') +
      (m.coach ? '<div class="member-coach">' + ic('user-check', 11) + ' ' + esc(m.coach) + '</div>' : '') +
      '</div>';
  }).join('');
  if (typeof lucide !== "undefined") renderIcons();
}

function filterMembers(q) {
  var grid = document.getElementById('membersGrid');
  if (!grid) return;
  var members = DATA.members || [];
  var ql = q.toLowerCase().trim();
  var filtered = ql ? members.filter(function(m) { return m.name && m.name.toLowerCase().indexOf(ql) >= 0; }) : members;
  grid.innerHTML = filtered.map(function(m) {
    return '<div class="glass-card member-card" onclick="showMemberDetail(\'' + esc(m.name) + '\')" style="cursor:pointer">' +
      '<div class="member-icon">' + (m.image ? '<img src="' + esc(m.image) + '" class="member-photo">' : ic('user', 28)) + '</div>' +
      '<h3>' + fmtName(m.name) + '</h3>' +
      (m.role ? '<div class="member-role">' + esc(m.role) + '</div>' : '') +
      (m.rank ? '<div class="member-rank">' + esc(m.rank) + '</div>' : '') +
      (m.coach ? '<div class="member-coach">' + ic('user-check', 11) + ' ' + esc(m.coach) + '</div>' : '') +
      '</div>';
  }).join('');
  if (typeof lucide !== "undefined") renderIcons();
}

// ========== MEMBER DETAIL (SHARED) ==========
function showMemberDetail(name) {
  var m = (DATA.members || []).find(function(x) { return x.name === name; });
  if (!m) return;
  var myAchs = (DATA.member_achievements || []).filter(function(a) { return a.member_name === name; });
  var myEvals = (DATA.evaluations || []).filter(function(e) { return e.member_name === name; });

  var html = '<div style="text-align:center;margin-bottom:16px">' +
    '<div style="width:64px;height:64px;border-radius:50%;background:rgba(139,92,246,0.1);display:flex;align-items:center;justify-content:center;font-size:28px;margin:0 auto 12px">' +
    (m.image ? '<img src="' + esc(m.image) + '" style="width:100%;height:100%;border-radius:50%;object-fit:cover">' : ic('user', 28)) +
    '</div>' +
    '<h2 style="margin:0">' + fmtName(m.name) + '</h2>' +
    '<div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin-top:6px">' +
    (m.role ? '<span class="badge badge-purple">' + esc(m.role) + '</span>' : '') +
    (m.rank ? '<span class="badge badge-blue">' + esc(m.rank) + '</span>' : '') +
    (m.coach ? '<span class="badge badge-green">' + ic('user-check', 10) + ' ' + esc(m.coach) + '</span>' : '') +
    '</div>' +
    (m.description ? '<p style="color:#888;font-size:13px;margin-top:8px">' + esc(m.description) + '</p>' : '') +
    '</div>';

  // Extras / tracker stats
  var extras = {};
  (window.EXTRAS_KEYS || []).forEach(function(k) { if (m[k]) extras[k] = m[k]; });
  if (Object.keys(extras).length) {
    var labels = {
      hs_percent: 'Headshot %', kd: 'K/D', dpr: 'DPR', course: 'Curso',
      riot_id: 'Riot ID', region: 'Región', tracker_url: 'Tracker',
      country: 'País', discord: 'Discord', youtube: 'YouTube',
      twitter: 'Twitter', twitch: 'Twitch',
      dpi: 'DPI', sens: 'Sensibilidad', scoped_sens: 'Sens Scope',
      hz: 'Hz', raw_input: 'Raw Input', bio_status: 'Estado', color: 'Color'
    };
    html += '<div class="glass-card" style="padding:16px;margin-bottom:12px">' +
      '<h3>' + ic('bar-chart-3', 14) + ' Estadísticas</h3>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px;margin-top:8px">';
    Object.keys(extras).forEach(function(k) {
      if (k === 'tracker_url') {
        html += '<div style="padding:6px 10px;background:rgba(255,255,255,0.02);border-radius:6px">' +
          '<div style="font-size:10px;color:#666">' + (labels[k] || k) + '</div>' +
          '<a href="' + esc(extras[k]) + '" target="_blank" style="font-size:12px;color:var(--neon)">' + ic('external-link', 10) + ' Ver tracker</a></div>';
      } else if (k === 'discord' || k === 'youtube' || k === 'twitter' || k === 'twitch') {
        html += '<div style="padding:6px 10px;background:rgba(255,255,255,0.02);border-radius:6px">' +
          '<div style="font-size:10px;color:#666">' + (labels[k] || k) + '</div>' +
          '<div style="font-size:12px;color:#ccc">' + ic(k === 'discord' ? 'message-circle' : k === 'youtube' ? 'youtube' : k === 'twitter' ? 'twitter' : 'twitch', 10) + ' ' + esc(extras[k]) + '</div></div>';
      } else if (k === 'hs_percent' || k === 'kd' || k === 'dpr') {
        var c = k === 'hs_percent' ? '#ef4444' : k === 'kd' ? '#3b82f6' : '#10b981';
        html += '<div style="text-align:center;padding:6px;background:rgba(255,255,255,0.02);border-radius:6px">' +
          '<div style="font-size:18px;font-weight:700;color:' + c + '">' + esc(extras[k]) + '</div>' +
          '<div style="font-size:10px;color:#666">' + (labels[k] || k) + '</div></div>';
      } else {
        html += '<div style="padding:6px 10px;background:rgba(255,255,255,0.02);border-radius:6px">' +
          '<div style="font-size:10px;color:#666">' + (labels[k] || k) + '</div>' +
          '<div style="font-size:12px;color:#ccc">' + esc(extras[k]) + '</div></div>';
      }
    });
    html += '</div></div>';
  }

  if (myEvals.length) {
    var avg = myEvals.reduce(function(s, e) {
      return s + (e.aim || 0) + (e.game_sense || 0) + (e.communication || 0) + (e.teamwork || 0);
    }, 0) / (myEvals.length * 4);
    html += '<div style="text-align:center;padding:12px;background:rgba(139,92,246,0.06);border-radius:8px;margin-bottom:12px">' +
      '<div style="font-size:11px;color:#666">Promedio Evaluaciones</div>' +
      '<div style="font-size:22px;font-weight:700;color:var(--neon)">' + (avg * 10).toFixed(1) + '</div>' +
      '<div style="font-size:11px;color:#666">' + myEvals.length + ' evaluación(es)</div></div>';
  }

  if (myAchs.length) {
    html += '<div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin-top:8px">';
    myAchs.forEach(function(ma) {
      var ach = (DATA.achievements || []).find(function(a) { return a.id === ma.achievement_id; });
      html += '<span class="badge badge-purple">' + ic('award', 10) + ' ' + esc(ach ? ach.name : 'Logro') + '</span>';
    });
    html += '</div>';
  }

  showDetail(html);
}

// ========== RENDER SCRIMS ==========
function renderSection_scrims() {
  var statsEl = document.getElementById('scrimStats');
  var listEl = document.getElementById('scrimList');
  if (!statsEl || !listEl) return;
  var scrims = DATA.scrims || [];
  var total = scrims.length;
  var wins = scrims.filter(function(s) { return s.result === 'Victoria'; }).length;
  var losses = scrims.filter(function(s) { return s.result === 'Derrota'; }).length;
  var wr = total ? Math.round(wins / total * 100) : 0;

  statsEl.innerHTML =
    '<div class="glass-card stat-card" style="padding:24px;text-align:center"><div class="number" style="color:#10b981">' + total + '</div><div class="label">Total</div></div>' +
    '<div class="glass-card stat-card" style="padding:24px;text-align:center"><div class="number" style="color:#3b82f6">' + wins + '</div><div class="label">Victorias</div></div>' +
    '<div class="glass-card stat-card" style="padding:24px;text-align:center"><div class="number" style="color:#ef4444">' + losses + '</div><div class="label">Derrotas</div></div>' +
    '<div class="glass-card stat-card" style="padding:24px;text-align:center"><div class="number" style="color:' + (wr >= 50 ? '#10b981' : '#ef4444') + '">' + wr + '%</div><div class="label">Win Rate</div></div>';

  if (!scrims.length) {
    listEl.innerHTML = '<div style="text-align:center;padding:40px;color:#555">' + ic('crosshair', 48) + '<br>No hay scrims registrados</div>';
    return;
  }
  listEl.innerHTML = scrims.slice().reverse().map(function(s) {
    var cls = s.result === 'Victoria' ? 'badge-green' : s.result === 'Derrota' ? 'badge-gray' : 'badge-yellow';
    return '<div class="glass-card scrim-item"><div class="scrim-left">' +
      '<div class="scrim-badge" style="background:' + (s.result === 'Victoria' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)') + (s.opponent_logo ? ';padding:0;overflow:hidden' : '') + '">' + (s.opponent_logo ? '<img src="' + esc(s.opponent_logo) + '" style="width:100%;height:100%;object-fit:contain;border-radius:10px">' : (s.opponent ? esc(s.opponent).charAt(0).toUpperCase() : '?')) + '</div>' +
      '<div><strong>' + esc(s.opponent || 'Desconocido') + '</strong><br>' +
      '<span style="font-size:12px;color:#666">' + fmtDate(s.date) + (s.coach ? ' · ' + esc(s.coach) : '') + '</span></div></div>' +
      '<div style="text-align:right"><div style="font-size:18px;font-weight:700;color:' + (s.result === 'Victoria' ? '#10b981' : '#ef4444') + '">' + esc((typeof s.our === 'number' ? s.our : '-')) + ' - ' + esc(typeof s.opponent_score === 'number' ? s.opponent_score : '-') + '</div>' +
      '<span class="badge ' + cls + '">' + esc(s.result) + '</span></div></div>';
  }).join('');
  if (typeof lucide !== "undefined") renderIcons();
}

// ========== RENDER ACADEMY ==========
function renderSection_academy() {
  var grid = document.getElementById('academyGrid');
  if (!grid) return;
  var items = DATA.academy || [];
  if (!items.length) { grid.innerHTML = '<div style="text-align:center;padding:40px;color:#555;grid-column:1/-1">' + ic('book-open', 48) + '<br>No hay clases disponibles</div>'; return; }
  grid.innerHTML = items.map(function(a) {
    return '<div class="glass-card academy-card" onclick="showAcademyDetail(\'' + a.id + '\')" style="cursor:pointer">' +
      (a.day ? '<div class="day">' + esc(a.day) + '</div>' : '') +
      '<h3>' + esc(a.topic) + '</h3>' +
      (a.objectives && a.objectives.length ? '<ul>' + a.objectives.slice(0, 3).map(function(o) { return '<li>' + esc(o) + '</li>'; }).join('') + '</ul>' : '') +
      (a.duration ? '<div style="font-size:12px;color:#666;margin-top:8px">' + ic('clock', 12) + ' ' + esc(a.duration) + '</div>' : '') +
      '</div>';
  }).join('');
  if (typeof lucide !== "undefined") renderIcons();
}

function showAcademyDetail(id) {
  var a = (DATA.academy || []).find(function(x) { return x.id === id; });
  if (!a) return;
  var html = '';
  if (a.image_url) html += '<img src="' + esc(a.image_url) + '" class="detail-img" onclick="event.stopPropagation();showImageOverlay(this.src)">';
  html += '<h2>' + esc(a.topic) + '</h2>' +
    '<div class="meta">' +
    (a.day ? '<span>' + ic('calendar', 14) + ' ' + esc(a.day) + '</span>' : '') +
    (a.duration ? '<span>' + ic('clock', 14) + ' ' + esc(a.duration) + '</span>' : '') +
    (a.coach ? '<span>' + ic('user-check', 14) + ' ' + esc(a.coach) + '</span>' : '') +
    '</div>' +
    (a.subject ? '<p><strong>Materia:</strong> ' + esc(a.subject) + '</p>' : '') +
    (a.module_name ? '<p><strong>Módulo:</strong> ' + esc(a.module_name) + '</p>' : '') +
    (a.objectives && a.objectives.length ? '<div class="body-text"><strong>Objetivos:</strong><ul>' + a.objectives.map(function(o) { return '<li>' + esc(o) + '</li>'; }).join('') + '</ul></div>' : '') +
    (a.prerequisites && a.prerequisites.length ? '<div class="body-text"><strong>Requisitos:</strong><ul>' + a.prerequisites.map(function(p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul></div>' : '') +
    (a.attachment_url ? '<a href="' + esc(a.attachment_url) + '" target="_blank" class="attach-link">' + ic('paperclip', 16) + ' ' + esc(a.attachment_name || 'Descargar') + '</a>' : '');
  showDetail(html);
}

// ========== RENDER STATS ==========
function renderSection_stats() {
  var grid = document.getElementById('statsGrid');
  if (!grid) return;
  var scrims = DATA.scrims || [];
  var members = DATA.members || [];
  var evals = DATA.evaluations || [];
  var total = scrims.length;
  var wins = scrims.filter(function(s) { return s.result === 'Victoria'; }).length;
  var wr = total ? Math.round(wins / total * 100) : 0;
  var avgScore = evals.length ? Math.round(evals.reduce(function(s, e) {
    return s + (e.aim || 0) + (e.game_sense || 0) + (e.communication || 0) + (e.teamwork || 0);
  }, 0) / (evals.length * 4) * 10) / 10 : 0;

  grid.innerHTML =
    '<div class="glass-card stat-card" style="padding:24px;text-align:center"><div class="number" style="color:#8b5cf6">' + members.length + '</div><div class="label">' + ic('users', 14) + ' Miembros</div></div>' +
    '<div class="glass-card stat-card" style="padding:24px;text-align:center"><div class="number" style="color:#3b82f6">' + total + '</div><div class="label">' + ic('crosshair', 14) + ' Scrims</div></div>' +
    '<div class="glass-card stat-card" style="padding:24px;text-align:center"><div class="number" style="color:#10b981">' + wr + '%</div><div class="label">' + ic('trending-up', 14) + ' Win Rate</div></div>' +
    '<div class="glass-card stat-card" style="padding:24px;text-align:center"><div class="number" style="color:#f59e0b">' + avgScore + '</div><div class="label">' + ic('bar-chart-3', 14) + ' Eval Promedio</div></div>';
  if (typeof lucide !== "undefined") renderIcons();
}

// ========== RENDER NEWS ==========
function renderSection_news() {
  var grid = document.getElementById('newsGrid');
  if (!grid) return;
  var items = DATA.news || [];
  items = filterByCoach(filterByGroup(items));
  if (!items.length) { grid.innerHTML = '<div style="text-align:center;padding:40px;color:#555;grid-column:1/-1">' + ic('newspaper', 48) + '<br>No hay noticias publicadas</div>'; return; }
  grid.innerHTML = items.map(function(n, i) {
    return '<div class="glass-card news-card" onclick="showNewsDetail(' + i + ')" style="cursor:pointer">' +
      '<div class="news-img">' + (n.image_url ? '<img src="' + esc(n.image_url) + '" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:12px 12px 0 0;cursor:pointer" onclick="event.stopPropagation();showImageOverlay(this.src,this.alt)">' : ic('newspaper', 40)) + '</div>' +
      '<div class="body"><div class="meta"><span>' + ic('calendar', 14) + ' ' + (n.date || '') + '</span><span>' + ic('user', 14) + ' ' + esc(n.author || 'Admin') + '</span></div><h3>' + esc(n.title) + '</h3><p style="white-space:pre-wrap">' + esc(n.excerpt || n.content || '') + '</p></div></div>';
  }).join('');
  if (typeof lucide !== "undefined") renderIcons();
}

function showNewsDetail(i) {
  var n = filterByCoach(filterByGroup((DATA.news || []).filter(function(x) { return x.published; })))[i];
  if (!n) return;
  showDetail((n.image_url ? '<img src="' + esc(n.image_url) + '" class="detail-img" style="cursor:pointer" onclick="event.stopPropagation();showImageOverlay(this.src,this.alt)">' : '') +
    '<h2>' + esc(n.title) + '</h2>' +
    '<div class="meta"><span>' + ic('calendar', 14) + ' ' + (n.date || '') + '</span><span>' + ic('user', 14) + ' ' + esc(n.author || 'Admin') + '</span></div>' +
    '<div class="body-text">' + esc(n.content || n.excerpt || '') + '</div>' +
    (n.attachment_url ? '<a href="' + esc(n.attachment_url) + '" target="_blank" class="attach-link" onclick="event.stopPropagation()">' + ic('paperclip', 16) + ' ' + esc(n.attachment_name || 'Descargar archivo') + '</a>' : ''));
}

// ========== RENDER ANNOUNCEMENTS ==========
function renderSection_announcements() {
  var list = document.getElementById('announcementsList');
  if (!list) return;
  var items = filterByGroup(DATA.announcements || []).sort(function(a, b) { return (a.date || a.created_at || '') < (b.date || b.created_at || '') ? 1 : -1; });
  if (!items.length) { list.innerHTML = '<div style="text-align:center;padding:40px;color:#555">' + ic('megaphone', 48) + '<br>No hay anuncios</div>'; return; }
  list.innerHTML = items.map(function(a) {
    var c = a.color || 'var(--neon)';
    return '<div class="glass-card" style="padding:20px;border-left:3px solid ' + c + ';margin-bottom:12px">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap">' +
      '<h3 style="margin:0;font-size:16px;color:' + c + '">' + ic('bell', 14) + ' ' + esc(a.title) + '</h3>' +
      '<span style="font-size:11px;color:#555">' + fmtDate(a.date || a.created_at) + '</span></div>' +
      (a.content ? '<p style="color:#ccc;font-size:14px;margin-top:8px;white-space:pre-wrap">' + esc(a.content) + '</p>' : '') +
      (a.coach ? '<div style="margin-top:6px;font-size:12px;color:var(--neon-light)">' + ic('user-check', 10) + ' ' + esc(a.coach) + '</div>' : '') +
      '</div>';
  }).join('');
  if (typeof lucide !== "undefined") renderIcons();
}

// ========== RENDER SUBSTITUTIONS ==========
function renderSection_substitutions() {
  var list = document.getElementById('substitutionsList');
  if (!list) return;
  var items = filterByGroup(DATA.substitutions || []).filter(function(s) { return s.status === 'open' || !s.status; }).sort(function(a, b) { return (a.date || '') < (b.date || '') ? 1 : -1; });
  if (!items.length) { list.innerHTML = '<div style="text-align:center;padding:40px;color:#555">' + ic('refresh-cw', 48) + '<br>No hay suplencias abiertas</div>'; return; }
  list.innerHTML = items.map(function(s) {
    return '<div class="glass-card" style="padding:16px 20px;margin-bottom:8px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">' +
      '<div><strong>' + esc(s.role || 'Rol no especificado') + '</strong>' +
      (s.requester ? '<br><span style="font-size:12px;color:#666">' + ic('user', 10) + ' ' + esc(s.requester) + '</span>' : '') +
      (s.date ? '<br><span style="font-size:12px;color:#666">' + ic('calendar', 10) + ' ' + esc(s.date) + '</span>' : '') +
      '</div>' +
      '<span class="badge badge-yellow">' + ic('clock', 10) + ' Abierto</span></div>';
  }).join('');
  if (typeof lucide !== "undefined") renderIcons();
}

function submitSubRequest() {
  var name = document.getElementById('subReqName');
  var role = document.getElementById('subReqRole');
  var msg = document.getElementById('subReqMsg');
  if (!name || !role || !msg) return;
  if (!name.value.trim() || !role.value.trim()) { msg.textContent = 'Completa todos los campos'; return; }
  if (!DATA.substitutions) DATA.substitutions = [];
  DATA.substitutions.push({
    id: uid(),
    requester: name.value.trim(),
    role: role.value.trim(),
    date: new Date().toISOString().slice(0, 10),
    status: 'open',
    created_at: new Date().toISOString()
  });
  saveLocalNow(DATA);
  try{if(db&&typeof supabase!=='undefined'){db.from('substitutions').insert([DATA.substitutions[DATA.substitutions.length-1]]).then(function(r){if(r&&r.error)console.log('Sub save error:',r.error)}).catch(function(err){console.log('Sub save error:',err)})}}catch(e){}
  name.value = '';
  role.value = '';
  msg.innerHTML = ic('check-circle', 12) + ' Solicitud enviada';
  renderSection_substitutions();
  setTimeout(function() { if (msg) msg.textContent = ''; }, 3000);
}

// ========== RENDER LEADERBOARD ==========
function renderSection_leaderboard() {
  var filtersEl = document.getElementById('leaderboardFilters');
  var contentEl = document.getElementById('leaderboardContent');
  if (!filtersEl || !contentEl) return;
  var members = DATA.members || [];
  var ranked = members.map(function(m) {
    var xp = calcMemberXP(m);
    var grade = calcCourseGrade(m.name);
    var evals = (DATA.evaluations || []).filter(function(e) { return e.member_name === m.name; });
    var avg = evals.length ? Math.round(evals.reduce(function(s, e) {
      return s + (e.aim || 0) + (e.game_sense || 0) + (e.communication || 0) + (e.teamwork || 0);
    }, 0) / (evals.length * 4) * 10) / 10 : 0;
    return { name: m.name, xp: xp, grade: grade ? grade.total : 0, avgEval: avg, role: m.role || '', rank: m.rank || '' };
  }).sort(function(a, b) { return b.xp - a.xp; });

  if (!ranked.length) { contentEl.innerHTML = '<div style="text-align:center;padding:40px;color:#555">' + ic('trophy', 48) + '<br>No hay datos para el leaderboard</div>'; return; }

  var topXp = ranked[0] ? ranked[0].xp : 1;
  contentEl.innerHTML = '<div style="display:grid;gap:6px">' +
    ranked.map(function(r, i) {
      var pct = Math.round(r.xp / topXp * 100);
      var medal = i === 0 ? ic('trophy', 16) : i < 3 ? ic('award', 14) : '';
      var medalColor = i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : i === 2 ? '#b45309' : '';
      return '<div class="glass-card" style="padding:12px 18px;display:flex;align-items:center;gap:14px">' +
        '<div style="width:28px;text-align:center;font-weight:700;color:' + (medalColor || '#555') + ';font-size:' + (i < 3 ? '18px' : '14px') + '">' + (i < 3 ? medal : '#' + (i + 1)) + '</div>' +
        '<div style="flex:1;min-width:0"><strong>' + fmtName(r.name) + '</strong>' +
        (r.role ? ' <span style="font-size:11px;color:#666">' + esc(r.role) + '</span>' : '') +
        '</div>' +
        '<div style="text-align:right;flex-shrink:0">' +
        '<div style="font-weight:700;font-size:15px;color:var(--neon)">' + r.xp + ' XP</div>' +
        '<div style="font-size:11px;color:#666">Nota: ' + r.grade + '% · Eval: ' + r.avgEval + '</div></div>' +
        '<div style="width:60px;height:4px;background:rgba(255,255,255,0.05);border-radius:2px;overflow:hidden;flex-shrink:0">' +
        '<div style="height:100%;width:' + pct + '%;background:linear-gradient(90deg,var(--neon),#a78bfa);border-radius:2px"></div></div></div>';
    }).join('') + '</div>';
  if (typeof lucide !== "undefined") renderIcons();
}

// ========== RENDER EVENTS ==========
function renderSection_events() {
  var el = document.getElementById('eventsContent');
  if (!el) return;
  var items = filterByGroup(DATA.events || []).sort(function(a, b) { return (a.date || '') < (b.date || '') ? -1 : 1; });
  var upcoming = items.filter(function(e) { return e.date && new Date(e.date) >= new Date(new Date().toDateString()); });
  var past = items.filter(function(e) { return !e.date || new Date(e.date) < new Date(new Date().toDateString()); });
  var html = '';

  if (upcoming.length) {
    html += '<h3>' + ic('calendar-check', 16) + ' Próximos Eventos</h3>' +
      '<div style="display:grid;gap:12px;margin-bottom:24px">' +
      upcoming.map(function(e) {
        return '<div class="glass-card" style="padding:16px 20px;display:flex;align-items:center;gap:16px;flex-wrap:wrap;border-left:3px solid var(--neon)">' +
          '<div style="text-align:center;flex-shrink:0"><div style="font-size:20px;font-weight:700;color:var(--neon)">' + (e.date ? new Date(e.date).getDate() : '?') + '</div>' +
          '<div style="font-size:10px;color:#666;text-transform:uppercase">' + (e.date ? new Date(e.date).toLocaleDateString('es-ES', { month: 'short' }) : '') + '</div></div>' +
          '<div style="flex:1"><strong>' + esc(e.title) + '</strong>' +
          (e.description ? '<br><span style="font-size:12px;color:#888">' + esc(e.description) + '</span>' : '') +
          (e.location ? '<br><span style="font-size:11px;color:#666">' + ic('map-pin', 10) + ' ' + esc(e.location) + '</span>' : '') +
          '</div>' +
          '<span class="badge badge-purple">' + ic('clock', 10) + ' Próximo</span></div>';
      }).join('') + '</div>';
  } else {
    html += '<div style="text-align:center;padding:24px;color:#555">' + ic('calendar', 32) + '<br>No hay próximos eventos</div>';
  }

  if (past.length) {
    html += '<h3>' + ic('history', 16) + ' Eventos Pasados</h3>' +
      '<div style="display:grid;gap:8px">' +
      past.slice().reverse().slice(0, 10).map(function(e) {
        return '<div class="glass-card" style="padding:12px 16px;display:flex;align-items:center;gap:12px;opacity:0.6">' +
          '<div style="text-align:center;flex-shrink:0"><div style="font-size:14px;font-weight:600;color:#666">' + (e.date ? new Date(e.date).getDate() : '?') + '</div>' +
          '<div style="font-size:9px;color:#555">' + (e.date ? new Date(e.date).toLocaleDateString('es-ES', { month: 'short' }) : '') + '</div></div>' +
          '<div style="flex:1"><span style="font-size:13px">' + esc(e.title) + '</span></div></div>';
      }).join('') + '</div>';
  }

  el.innerHTML = html;
  if (typeof lucide !== "undefined") renderIcons();
}

// ========== RENDER CLIPS ==========
function renderSection_clips() {
  var el = document.getElementById('clipsContent');
  if (!el) return;
  var items = DATA.clips || [];
  if (!items.length) { el.innerHTML = '<div style="text-align:center;padding:40px;color:#555">' + ic('film', 48) + '<br>No hay clips disponibles</div>'; return; }
  el.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:18px">' +
    items.map(function(c) {
      return '<div class="glass-card" style="overflow:hidden"><div style="position:relative;padding-top:56.25%;background:#000">' +
        (c.video_url ? '<iframe src="' + esc(c.video_url) + '" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0" allowfullscreen></iframe>' :
          c.image_url ? '<img src="' + esc(c.image_url) + '" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;cursor:pointer" onclick="showImageOverlay(this.src)">' :
          '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#555;font-size:40px">' + ic('film', 40) + '</div>') +
        '</div><div style="padding:14px">' +
        (c.title ? '<strong style="font-size:14px">' + esc(c.title) + '</strong>' : '') +
        (c.author ? '<div style="font-size:12px;color:#666">' + ic('user', 10) + ' ' + esc(c.author) + '</div>' : '') +
        '</div></div>';
    }).join('') + '</div>';
  if (typeof lucide !== "undefined") renderIcons();
}

// ========== STUDENT PANEL FUNCTIONS ==========

// ========== DASHBOARD ==========
function renderSection_dashboard() {
  var u = getLogin();
  if (!u) return;
  var member = (DATA.members || []).find(function(m) { return m.name === u.name; });
  if (!member) { document.getElementById('dashContent').innerHTML = '<div class="dash-empty">' + ic('user-x', 32) + '<p>Miembro no encontrado</p></div>'; return; }

  var myEvals = (DATA.evaluations || []).filter(function(e) { return e.member_name === member.name; });
  var myTasks = (DATA.task_completions || []).filter(function(t) { return t.member_name === member.name; });
  var myAtt = (DATA.attendance || []).filter(function(a) { return a.member_name === member.name; });
  var myNotes = (DATA.coach_notes || []).filter(function(n) { return n.member_name === member.name; });
  var myAchs = (DATA.member_achievements || []).filter(function(a) { return a.member_name === member.name; });
  var xp = calcMemberXP(member);
  var grade = calcCourseGrade(member.name);

  var html = '<div class="dash-cards">' +
    '<div class="glass-card dash-card"><div class="num">' + (grade ? grade.total : 0) + '%</div><div class="lbl">' + ic('graduation-cap', 14) + ' Nota</div></div>' +
    '<div class="glass-card dash-card"><div class="num">' + xp + '</div><div class="lbl">' + ic('zap', 14) + ' XP</div></div>' +
    '<div class="glass-card dash-card"><div class="num">' + myEvals.length + '</div><div class="lbl">' + ic('bar-chart-3', 14) + ' Evaluaciones</div></div>' +
    '<div class="glass-card dash-card"><div class="num">' + myTasks.length + '</div><div class="lbl">' + ic('check-square', 14) + ' Tareas</div></div>' +
    '<div class="glass-card dash-card"><div class="num">' + (myAtt.filter(function(a) { return a.status === 'present'; }).length) + '/' + myAtt.length + '</div><div class="lbl">' + ic('calendar', 14) + ' Asistencia</div></div>' +
    '</div>';

  if (grade && grade.rankOK) {
    var labels = { exams: 'Exámenes', quizzes: 'Quizzes', tasks: 'Tareas', attendance: 'Asistencia', participation: 'Participación' };
    var colors = { exams: '#8b5cf6', quizzes: '#3b82f6', tasks: '#10b981', attendance: '#f59e0b', participation: '#ef4444' };
    html += '<div class="glass-card" style="padding:20px;margin-bottom:20px">' +
      '<h3>' + ic('pie-chart', 16) + ' Desglose de Nota</h3>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:12px;margin-top:12px">';
    for (var k in grade.components) {
      html += '<div style="text-align:center;padding:12px;background:rgba(255,255,255,0.02);border-radius:8px">' +
        '<div style="font-size:20px;font-weight:700;color:' + (colors[k] || '#888') + '">' + grade.components[k] + '%</div>' +
        '<div style="font-size:11px;color:#666">' + (labels[k] || k) + '</div></div>';
    }
    html += '</div></div>';
  }

  if (myEvals.length) {
    html += '<div class="glass-card" style="padding:20px;margin-bottom:20px">' +
      '<h3>' + ic('clipboard-list', 16) + ' Últimas Evaluaciones</h3>' +
      '<table class="dash-eval-table"><thead><tr><th>Fecha</th><th>AIM</th><th>Game Sense</th><th>Comunicación</th><th>Teamwork</th><th>Promedio</th></tr></thead><tbody>';
    var evals = myEvals.slice().reverse();
    for (var i = 0; i < Math.min(5, evals.length); i++) {
      var e = evals[i];
      var avg = Math.round(((e.aim || 0) + (e.game_sense || 0) + (e.communication || 0) + (e.teamwork || 0)) / 4 * 10) / 10;
      html += '<tr><td>' + esc(e.date || '') + '</td><td>' + (e.aim || 0) + '</td><td>' + (e.game_sense || 0) + '</td><td>' + (e.communication || 0) + '</td><td>' + (e.teamwork || 0) + '</td><td style="color:var(--neon);font-weight:600">' + avg + '</td></tr>';
    }
    html += '</tbody></table></div>';
  }

  if (myNotes.length) {
    html += '<div class="glass-card" style="padding:20px;margin-bottom:20px">' +
      '<h3>' + ic('message-square', 16) + ' Notas del Coach</h3>';
    var notes = myNotes.slice().reverse();
    for (var i = 0; i < Math.min(5, notes.length); i++) {
      var n = notes[i];
      html += '<div class="dash-note"><span class="cat">' + esc(n.category || 'general') + '</span><span class="date">' + (n.created_at ? new Date(n.created_at).toLocaleDateString('es-ES') : '') + '</span><br>' + esc(n.note) + '</div>';
    }
    html += '</div>';
  }

  var pendingTasks = (DATA.tasks || []).filter(function(t) {
    return !myTasks.some(function(tc) { return tc.task_id === t.id; });
  });
  if (pendingTasks.length) {
    html += '<div class="glass-card" style="padding:20px;margin-bottom:20px">' +
      '<h3>' + ic('alert-circle', 16) + ' Tareas Pendientes (' + pendingTasks.length + ')</h3>';
    for (var i = 0; i < Math.min(5, pendingTasks.length); i++) {
      var t = pendingTasks[i];
      html += '<div class="dash-task" style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.04)">' +
        '<span class="title">' + esc(t.title) + '<br><span class="due">' + (t.due_date ? 'Vence: ' + t.due_date : '') + '</span></span>' +
        '<span class="badge badge-yellow">Pendiente</span></div>';
    }
    html += '</div>';
  }

  if (myAchs.length) {
    html += '<div class="glass-card" style="padding:20px;margin-bottom:20px">' +
      '<h3>' + ic('award', 16) + ' Logros (' + myAchs.length + ')</h3>' +
      '<div class="achievements-grid">';
    for (var i = 0; i < myAchs.length; i++) {
      var ma = myAchs[i];
      var ach = (DATA.achievements || []).find(function(a) { return a.id === ma.achievement_id; });
      var color = ach ? (ach.color || '#8B5CF6') : '#8B5CF6';
      var name = ach ? (ach.name || 'Logro') : 'Logro';
      html += '<div class="achievement-badge" style="--ach-color:' + color + ';--ach-glow:' + color + '33">' +
        ic('award', 24) + '<span class="ach-name">' + esc(name) + '</span></div>';
    }
    html += '</div></div>';
  }

  var myRanks = (DATA.rank_history || []).filter(function(r) { return r.member_name === member.name; }).sort(function(a, b) { return a.date < b.date ? 1 : -1; });
  if (myRanks.length) {
    html += '<div class="glass-card" style="padding:20px;margin-bottom:20px">' +
      '<h3>' + ic('trending-up', 16) + ' Historial de Rango</h3>' +
      '<div class="rank-timeline">';
    for (var i = 0; i < myRanks.length; i++) {
      var r = myRanks[i];
      var isCurrent = (i === 0);
      html += '<div class="rank-timeline-item' + (isCurrent ? ' current' : '') + '">' +
        '<div class="rank-timeline-dot"></div>' +
        '<div class="rank-timeline-content"><span class="badge ' + (isCurrent ? 'badge-purple' : 'badge-gray') + '">' + esc(r.rank) + '</span>' +
        '<span style="color:#666;font-size:12px">' + esc(r.date || '') + '</span></div></div>';
    }
    html += '</div></div>';
  }

  document.getElementById('dashContent').innerHTML = html;
  if (typeof lucide !== "undefined") renderIcons();
}

// ========== SCHEDULE ==========
function renderSection_schedule() {
  var u = getLogin();
  if (!u) return;
  var member = (DATA.members || []).find(function(m) { return m.name === u.name; });
  var gid = member ? member.group_id : '';

  var cw = getCurrentWeekStart();
  var items = (DATA.schedule || []).filter(function(s) {
    if (s.week_start && s.week_start !== cw) return false;
    if (!s.coach) return true; // sin coach → general, lo ven todos
    if (gid && s.group_id && s.group_id !== gid) return false;
    return true;
  });

  var days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  var dayColors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1'];
  var byDay = {};
  for (var i = 0; i < days.length; i++) byDay[days[i]] = [];
  for (var i = 0; i < items.length; i++) {
    var s = items[i];
    var dayName = days[parseInt(s.day, 10)] || '';
    if (byDay[dayName]) byDay[dayName].push(s);
  }

  var html = '<div class="schedule-week">';
  for (var i = 0; i < days.length; i++) {
    var day = days[i];
    var dayItems = byDay[day] || [];
    html += '<div class="schedule-day-col">' +
      '<div class="schedule-day-name" style="border-bottom-color:' + dayColors[i] + '">' +
      '<span class="dot" style="background:' + dayColors[i] + '"></span>' + day + '</div>';
    if (!dayItems.length) {
      html += '<div class="schedule-empty">—</div>';
    } else {
      for (var j = 0; j < dayItems.length; j++) {
        var s = dayItems[j];
        var type = s.type || 'academia';
        html += '<div class="schedule-card ' + esc(type) + '">' +
          '<div class="sc-head"><span class="type-badge">' + esc(type) + '</span></div>' +
          '<div class="title">' + esc(s.title) + '</div>' +
          '<div class="sc-time">' + ic('clock', 12) + ' ' + toLocalTime(s.start, s.tz) + ' - ' + toLocalTime(s.end, s.tz) + '</div>' +
          (s.coach ? '<div class="sc-coach">' + ic('user-check', 11) + ' ' + esc(s.coach) + '</div>' : '') +
          '</div>';
      }
    }
    html += '</div>';
  }
  html += '</div>';

  document.getElementById('scheduleBubbles').innerHTML = html;
  if (typeof lucide !== "undefined") renderIcons();
}

// ========== CLASES ==========
function renderSection_clases() {
  var u = getLogin();
  if (!u) return;
  var member = (DATA.members || []).find(function(m) { return m.name === u.name; });
  var gid = member ? member.group_id : '';
  var items = (DATA.academy || []).filter(function(a) {
    if (gid && a.group_id && a.group_id !== gid) return false;
    return true;
  });
  if (!items.length) {
    document.getElementById('clasesContent').innerHTML = '<div class="dash-empty">' + ic('graduation-cap', 32) + '<p>No hay clases disponibles</p></div>';
    return;
  }
  var html = '<div class="academy-grid">';
  for (var i = 0; i < items.length; i++) {
    var a = items[i];
    html += '<div class="glass-card academy-card" onclick="showClaseDetail(\'' + a.id + '\')" style="cursor:pointer">' +
      (a.day ? '<div class="day">' + esc(a.day) + '</div>' : '') +
      '<h3>' + esc(a.topic) + '</h3>' +
      (a.objectives && a.objectives.length ? '<ul>' + a.objectives.slice(0, 3).map(function(o) { return '<li>' + esc(o) + '</li>'; }).join('') + '</ul>' : '') +
      (a.duration ? '<div style="font-size:12px;color:#666;margin-top:8px">' + ic('clock', 12) + ' ' + esc(a.duration) + '</div>' : '') +
      '</div>';
  }
  html += '</div>';
  document.getElementById('clasesContent').innerHTML = html;
  if (typeof lucide !== "undefined") renderIcons();
}

function showClaseDetail(id) {
  var a = (DATA.academy || []).find(function(x) { return x.id === id; });
  if (!a) return;
  var html = '';
  if (a.image_url) html += '<img src="' + esc(a.image_url) + '" class="detail-img" onclick="event.stopPropagation();showImageOverlay(this.src)">';
  html += '<h2>' + esc(a.topic) + '</h2>' +
    '<div class="meta">' + (a.day ? '<span>' + ic('calendar', 14) + ' ' + esc(a.day) + '</span>' : '') + (a.duration ? '<span>' + ic('clock', 14) + ' ' + esc(a.duration) + '</span>' : '') + (a.coach ? '<span>' + ic('user-check', 14) + ' ' + esc(a.coach) + '</span>' : '') + '</div>' +
    (a.subject ? '<p><strong>Materia:</strong> ' + esc(a.subject) + '</p>' : '') +
    (a.module_name ? '<p><strong>Módulo:</strong> ' + esc(a.module_name) + '</p>' : '') +
    (a.objectives && a.objectives.length ? '<div class="body-text"><strong>Objetivos:</strong><ul>' + a.objectives.map(function(o) { return '<li>' + esc(o) + '</li>'; }).join('') + '</ul></div>' : '') +
    (a.prerequisites && a.prerequisites.length ? '<div class="body-text"><strong>Requisitos:</strong><ul>' + a.prerequisites.map(function(p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul></div>' : '') +
    (a.attachment_url ? '<a href="' + esc(a.attachment_url) + '" target="_blank" class="attach-link">' + ic('paperclip', 16) + ' ' + esc(a.attachment_name || 'Descargar') + '</a>' : '');
  showDetail(html);
}

// ========== CURRICULUM ==========
function renderSection_curriculum() {
  var u = getLogin();
  if (!u) return;
  var member = (DATA.members || []).find(function(m) { return m.name === u.name; });
  var gid = member ? member.group_id : '';
  var items = (DATA.curriculum || []).filter(function(c) {
    if (gid && c.group_id && c.group_id !== gid) return false;
    return true;
  }).sort(function(a, b) { return (a.week || 0) - (b.week || 0); });
  if (!items.length) {
    document.getElementById('curriculumContent').innerHTML = '<div class="dash-empty">' + ic('book-open', 32) + '<p>No hay plan de estudios disponible</p></div>';
    return;
  }
  var currentWeek = member ? (member.current_month || 1) * 4 : 4;
  var html = '<div style="display:grid;gap:16px">';
  for (var i = 0; i < items.length; i++) {
    var c = items[i];
    var isCurrent = c.week <= currentWeek && c.week > currentWeek - 4;
    var isPast = c.week < currentWeek - 4;
    var borderColor = c.color || '#8B5CF6';
    html += '<div class="glass-card" style="padding:20px;border-left:3px solid ' + borderColor + ';opacity:' + (isPast ? '0.5' : '1') + '">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">' +
      '<div><span class="badge" style="background:' + borderColor + '22;color:' + borderColor + ';border:1px solid ' + borderColor + '44">Semana ' + c.week + '</span>' +
      ' <strong style="font-size:16px">' + esc(c.title) + '</strong></div>' +
      (isCurrent ? '<span class="badge badge-purple">' + ic('play', 12) + ' Actual</span>' : '') + '</div>' +
      (c.description ? '<p style="color:#888;font-size:13px;margin-top:8px">' + esc(c.description) + '</p>' : '') +
      (c.topics && c.topics.length ? '<div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:6px">' + c.topics.map(function(t) { return '<span class="badge badge-gray">' + esc(t) + '</span>'; }).join('') + '</div>' : '') +
      (c.image_url || c.attachment_url ? '<div style="margin-top:10px;display:flex;gap:8px">' +
        (c.image_url ? '<a href="' + esc(c.image_url) + '" target="_blank" class="btn-sm" onclick="event.preventDefault();showImageOverlay(\'' + esc(c.image_url) + '\')">' + ic('image', 12) + ' Ver imagen</a>' : '') +
        (c.attachment_url ? '<a href="' + esc(c.attachment_url) + '" target="_blank" class="btn-sm">' + ic('paperclip', 12) + ' ' + esc(c.attachment_name || 'Descargar') + '</a>' : '') +
        '</div>' : '') +
      '</div>';
  }
  html += '</div>';
  document.getElementById('curriculumContent').innerHTML = html;
  if (typeof lucide !== "undefined") renderIcons();
}

// ========== MATERIALS ==========
function renderSection_materials() {
  var u = getLogin();
  if (!u) return;
  var member = (DATA.members || []).find(function(m) { return m.name === u.name; });
  var gid = member ? member.group_id : '';
  var items = (DATA.materials || []).filter(function(m) {
    if (gid && m.group_id && m.group_id !== gid) return false;
    return true;
  });
  if (!items.length) {
    document.getElementById('materialsContent').innerHTML = '<div class="dash-empty">' + ic('book', 32) + '<p>No hay materiales disponibles</p></div>';
    return;
  }
  var typeColors = { video: '#ef4444', guide: '#3b82f6', pdf: '#10b981', other: '#8b5cf6' };
  var html = '<div class="materials-grid">';
  for (var i = 0; i < items.length; i++) {
    var m = items[i];
    var color = typeColors[m.type] || '#8b5cf6';
    html += '<div class="glass-card mat-card" onclick="showMaterialDetail(\'' + m.id + '\')" style="cursor:pointer">';
    if (m.image_url) html += '<img src="' + esc(m.image_url) + '" alt="" onerror="this.style.display=\'none\'">';
    html += '<div class="body">' +
      '<h3>' + esc(m.title) + '</h3>' +
      (m.description ? '<p>' + esc(m.description) + '</p>' : '') +
      '<div class="meta"><span class="badge" style="background:' + color + '22;color:' + color + ';border:1px solid ' + color + '44">' + esc(m.type) + '</span>' +
      (m.coach ? '<span style="font-size:12px;color:#666">' + ic('user-check', 11) + ' ' + esc(m.coach) + '</span>' : '') + '</div>' +
      '<div class="actions">' +
      (m.url ? '<a href="' + esc(m.url) + '" target="_blank" class="primary" onclick="event.stopPropagation()">' + ic('external-link', 13) + ' Abrir</a>' : '') +
      (m.attachment_url ? '<a href="' + esc(m.attachment_url) + '" target="_blank" class="secondary" onclick="event.stopPropagation()">' + ic('download', 13) + ' ' + esc(m.attachment_name || 'PDF') + '</a>' : '') +
      '</div></div></div>';
  }
  html += '</div>';
  document.getElementById('materialsContent').innerHTML = html;
  if (typeof lucide !== "undefined") renderIcons();
}

function showMaterialDetail(id) {
  var m = (DATA.materials || []).find(function(x) { return x.id === id; });
  if (!m) return;
  var html = (m.image_url ? '<img src="' + esc(m.image_url) + '" class="detail-img" onclick="event.stopPropagation();showImageOverlay(this.src)">' : '') +
    '<h2>' + esc(m.title) + '</h2>' +
    '<div class="meta">' + (m.type ? '<span class="badge badge-purple">' + esc(m.type) + '</span>' : '') + (m.coach ? '<span>' + ic('user-check', 14) + ' ' + esc(m.coach) + '</span>' : '') + '</div>' +
    (m.description ? '<div class="body-text">' + esc(m.description) + '</div>' : '') +
    (m.url ? '<a href="' + esc(m.url) + '" target="_blank" class="btn-primary" style="display:inline-flex;align-items:center;gap:6px;margin-top:12px">' + ic('external-link', 14) + ' Abrir material</a>' : '') +
    (m.attachment_url ? '<a href="' + esc(m.attachment_url) + '" target="_blank" class="btn-secondary" style="display:inline-flex;align-items:center;gap:6px;margin-top:8px">' + ic('download', 14) + ' ' + esc(m.attachment_name || 'Descargar') + '</a>' : '');
  showDetail(html);
}

// ========== TASKS ==========
function renderSection_tasks() {
  var u = getLogin();
  if (!u) return;
  var member = (DATA.members || []).find(function(m) { return m.name === u.name; });
  var gid = member ? member.group_id : '';
  var memberName = member ? member.name : '';
  var tasks = (DATA.tasks || []).filter(function(t) {
    if (gid && t.group_id && t.group_id !== gid) return false;
    return true;
  });
  var completions = (DATA.task_completions || []).filter(function(tc) { return tc.member_name === memberName; });
  var completedIds = {};
  for (var i = 0; i < completions.length; i++) completedIds[completions[i].task_id] = true;
  if (!tasks.length) {
    document.getElementById('tasksContent').innerHTML = '<div class="dash-empty">' + ic('check-square', 32) + '<p>No hay tareas asignadas</p></div>';
    return;
  }
  tasks.sort(function(a, b) {
    var aDone = completedIds[a.id] ? 1 : 0;
    var bDone = completedIds[b.id] ? 1 : 0;
    if (aDone !== bDone) return aDone - bDone;
    return (a.due_date || '') < (b.due_date || '') ? -1 : 1;
  });
  var html = '<div style="display:grid;gap:12px">';
  for (var i = 0; i < tasks.length; i++) {
    var t = tasks[i];
    var isDone = !!completedIds[t.id];
    var isOverdue = t.due_date && new Date(t.due_date) < new Date() && !isDone;
    html += '<div class="glass-card" style="padding:16px 20px;display:flex;align-items:center;justify-content:space-between;gap:12px;border-left:3px solid ' + (isDone ? '#10b981' : isOverdue ? '#ef4444' : '#8b5cf6') + '">' +
      '<div style="flex:1;min-width:0">' +
      '<div style="font-weight:600;font-size:15px;color:' + (isDone ? '#888' : '#fff') + '">' + esc(t.title) + '</div>' +
      '<div style="font-size:12px;color:#666;margin-top:2px">' +
      '<span class="badge badge-blue">' + esc(t.type || 'task') + '</span>' +
      (t.due_date ? ' ' + ic('calendar', 11) + ' ' + esc(t.due_date) : '') +
      (t.coach ? ' ' + ic('user-check', 11) + ' ' + esc(t.coach) : '') + '</div>' +
      (t.description ? '<div style="font-size:13px;color:#888;margin-top:6px">' + esc(t.description) + '</div>' : '') +
      ((t.image_url || t.attachment_url) ? '<div style="margin-top:6px;display:flex;gap:6px">' +
        (t.image_url ? '<a href="' + esc(t.image_url) + '" target="_blank" class="btn-sm" onclick="event.preventDefault();showImageOverlay(\'' + esc(t.image_url) + '\')">' + ic('image', 11) + ' Imagen</a>' : '') +
        (t.attachment_url ? '<a href="' + esc(t.attachment_url) + '" target="_blank" class="btn-sm">' + ic('paperclip', 11) + ' ' + esc(t.attachment_name || 'Archivo') + '</a>' : '') +
        '</div>' : '') + '</div>' +
      '<div style="text-align:right;flex-shrink:0">' +
      (isDone ? '<span class="badge badge-green">' + ic('check', 12) + ' Completada</span>' :
        (isOverdue ? '<span class="badge" style="background:#ef444422;color:#ef4444;border:1px solid #ef444444">' + ic('alert-triangle', 12) + ' Vencida</span>' :
          '<span class="badge badge-yellow">' + ic('clock', 12) + ' Pendiente</span>')) +
      '</div></div>';
  }
  html += '</div>';
  document.getElementById('tasksContent').innerHTML = html;
  if (typeof lucide !== "undefined") renderIcons();
}

// ========== EVALUATIONS ==========
function renderSection_evaluations() {
  var u = getLogin();
  if (!u) return;
  var member = (DATA.members || []).find(function(m) { return m.name === u.name; });
  var memberName = member ? member.name : '';
  var items = (DATA.evaluations || []).filter(function(e) { return e.member_name === memberName; }).sort(function(a, b) { return (a.date || '') < (b.date || '') ? 1 : -1; });
  if (!items.length) {
    document.getElementById('evaluationsContent').innerHTML = '<div class="dash-empty">' + ic('bar-chart-3', 32) + '<p>No hay evaluaciones registradas</p></div>';
    return;
  }
  var html = '<div style="overflow-x:auto"><table class="dash-eval-table">' +
    '<thead><tr><th>Fecha</th><th>Materia</th><th>AIM</th><th>Game Sense</th><th>Comunicación</th><th>Teamwork</th><th>Promedio</th><th>Notas</th></tr></thead><tbody>';
  for (var i = 0; i < items.length; i++) {
    var e = items[i];
    var avg = Math.round(((e.aim || 0) + (e.game_sense || 0) + (e.communication || 0) + (e.teamwork || 0)) / 4 * 10) / 10;
    html += '<tr onclick="showEvalDetail(\'' + e.id + '\')" style="cursor:pointer">' +
      '<td>' + esc(e.date || '') + '</td><td>' + esc(e.subject || '-') + '</td><td>' + (e.aim || 0) + '</td><td>' + (e.game_sense || 0) + '</td><td>' + (e.communication || 0) + '</td><td>' + (e.teamwork || 0) + '</td>' +
      '<td style="color:var(--neon);font-weight:600">' + avg + '</td><td>' + (e.coach_notes ? ic('message-square', 14) : '') + '</td></tr>';
  }
  html += '</tbody></table></div>';
  if (items.length) {
    var sum = 0;
    for (var i = 0; i < items.length; i++) sum += (items[i].aim || 0) + (items[i].game_sense || 0) + (items[i].communication || 0) + (items[i].teamwork || 0);
    var avgAll = sum / (items.length * 4);
    html += '<div class="glass-card" style="padding:20px;margin-top:20px">' +
      '<h3>' + ic('trending-up', 14) + ' Resumen General</h3>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:12px;margin-top:12px">' +
      '<div class="tracker-stat"><div class="ts-val" style="color:#8b5cf6">' + (avgAll * 10).toFixed(1) + '</div><div class="ts-lbl">Promedio Global</div></div>' +
      '<div class="tracker-stat"><div class="ts-val" style="color:#3b82f6">' + items.length + '</div><div class="ts-lbl">Total Evaluaciones</div></div></div></div>';
  }
  document.getElementById('evaluationsContent').innerHTML = html;
  if (typeof lucide !== "undefined") renderIcons();
}

function showEvalDetail(id) {
  var e = (DATA.evaluations || []).find(function(x) { return x.id === id; });
  if (!e) return;
  var avg = Math.round(((e.aim || 0) + (e.game_sense || 0) + (e.communication || 0) + (e.teamwork || 0)) / 4 * 10) / 10;
  var html = '<h2>Evaluación</h2>' +
    '<div class="meta"><span>' + ic('calendar', 14) + ' ' + esc(e.date || '') + '</span>' +
    (e.coach ? '<span>' + ic('user-check', 14) + ' ' + esc(e.coach) + '</span>' : '') +
    (e.subject ? '<span>' + ic('book', 14) + ' ' + esc(e.subject) + '</span>' : '') + '</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:16px 0">' +
    '<div style="text-align:center;background:rgba(239,68,68,0.06);padding:16px;border-radius:8px"><div style="font-size:11px;color:#ef4444">AIM</div><div style="font-size:24px;font-weight:700;color:#ef4444">' + (e.aim || 0) + '</div></div>' +
    '<div style="text-align:center;background:rgba(59,130,246,0.06);padding:16px;border-radius:8px"><div style="font-size:11px;color:#3b82f6">Game Sense</div><div style="font-size:24px;font-weight:700;color:#3b82f6">' + (e.game_sense || 0) + '</div></div>' +
    '<div style="text-align:center;background:rgba(16,185,129,0.06);padding:16px;border-radius:8px"><div style="font-size:11px;color:#10b981">Comunicación</div><div style="font-size:24px;font-weight:700;color:#10b981">' + (e.communication || 0) + '</div></div>' +
    '<div style="text-align:center;background:rgba(245,158,11,0.06);padding:16px;border-radius:8px"><div style="font-size:11px;color:#f59e0b">Teamwork</div><div style="font-size:24px;font-weight:700;color:#f59e0b">' + (e.teamwork || 0) + '</div></div></div>' +
    '<div style="text-align:center;padding:12px;background:rgba(139,92,246,0.06);border-radius:8px;margin-bottom:12px">' +
    '<div style="font-size:11px;color:#666">PROMEDIO</div><div style="font-size:28px;font-weight:700;color:var(--neon)">' + avg + '</div></div>' +
    (e.coach_notes ? '<div class="body-text"><strong>Notas del Coach:</strong><br>' + esc(e.coach_notes) + '</div>' : '') +
    (e.image_url ? '<img src="' + esc(e.image_url) + '" class="detail-img" style="margin-top:12px;cursor:pointer" onclick="event.stopPropagation();showImageOverlay(this.src)">' : '') +
    (e.attachment_url ? '<a href="' + esc(e.attachment_url) + '" target="_blank" class="attach-link">' + ic('paperclip', 16) + ' ' + esc(e.attachment_name || 'Descargar') + '</a>' : '');
  showDetail(html);
}

// ========== QUIZZES ==========
function renderSection_quizzes() {
  var u = getLogin();
  if (!u) return;
  var member = (DATA.members || []).find(function(m) { return m.name === u.name; });
  var gid = member ? member.group_id : '';
  var memberName = member ? member.name : '';
  var quizzes = (DATA.quizzes || []).filter(function(q) {
    if (gid && q.group_id && q.group_id !== gid) return false;
    return true;
  });
  var responses = (DATA.quiz_responses || []).filter(function(r) { return r.member_name === memberName; });
  var answeredIds = {};
  for (var i = 0; i < responses.length; i++) answeredIds[responses[i].quiz_id] = responses[i];
  if (!quizzes.length) {
    document.getElementById('quizzesContent').innerHTML = '<div class="dash-empty">' + ic('help-circle', 32) + '<p>No hay quizzes disponibles</p></div>';
    return;
  }
  var html = '<div style="display:grid;gap:16px">';
  for (var i = 0; i < quizzes.length; i++) {
    var q = quizzes[i];
    var isAnswered = !!answeredIds[q.id];
    var score = isAnswered ? answeredIds[q.id].score : null;
    var total = q.questions ? q.questions.length : 0;
    html += '<div class="glass-card" style="padding:20px;display:flex;align-items:center;justify-content:space-between;gap:12px;cursor:' + (isAnswered ? 'default' : 'pointer') + '" onclick="' + (isAnswered ? '' : 'startQuiz(\'' + q.id + '\')') + '">' +
      '<div><h3 style="font-size:16px;margin:0 0 4px">' + esc(q.title) + '</h3>' +
      (q.description ? '<p style="color:#888;font-size:13px;margin:0">' + esc(q.description) + '</p>' : '') +
      '<div style="font-size:12px;color:#666;margin-top:4px">' + total + ' preguntas' + (q.coach ? ' · ' + ic('user-check', 11) + ' ' + esc(q.coach) : '') + '</div></div>' +
      '<div>' + (isAnswered ?
        '<div style="text-align:center"><div style="font-size:24px;font-weight:700;color:' + (score >= 70 ? '#10b981' : '#ef4444') + '">' + (score || 0) + '%</div><div style="font-size:11px;color:#666">Completado</div></div>' :
        '<span class="badge badge-purple" style="font-size:13px;padding:8px 16px">' + ic('play', 12) + ' Iniciar</span>') +
      '</div></div>';
  }
  html += '</div>';
  document.getElementById('quizzesContent').innerHTML = html;
  if (typeof lucide !== "undefined") renderIcons();
}

function startQuiz(quizId) {
  var q = (DATA.quizzes || []).find(function(x) { return x.id === quizId; });
  if (!q || !q.questions) return;
  var html = '<h2>' + ic('help-circle', 16) + ' ' + esc(q.title) + '</h2>' +
    (q.description ? '<p style="color:#888">' + esc(q.description) + '</p>' : '') +
    '<div id="quizQuestions">';
  for (var qi = 0; qi < q.questions.length; qi++) {
    var ques = q.questions[qi];
    html += '<div class="glass-card" style="padding:16px;margin-bottom:12px">' +
      '<p style="font-weight:600;margin-bottom:8px">' + (qi + 1) + '. ' + esc(ques.text) + '</p>' +
      '<div style="display:grid;gap:6px">';
    for (var oi = 0; oi < (ques.options || []).length; oi++) {
      html += '<label style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:rgba(255,255,255,0.02);border-radius:6px;cursor:pointer">' +
        '<input type="radio" name="quiz_q_' + qi + '" value="' + oi + '" onchange="document.getElementById(\'quizQ' + qi + 'Done\').value=\'1\'">' +
        '<span>' + esc(ques.options[oi]) + '</span></label>';
    }
    html += '<input type="hidden" id="quizQ' + qi + 'Done" value="0"></div></div>';
  }
  html += '</div><button class="btn-primary" onclick="submitQuiz(\'' + quizId + '\')" style="width:100%;justify-content:center">' + ic('check', 16) + ' Enviar Respuestas</button>';
  showDetail(html);
}

function submitQuiz(quizId) {
  var q = (DATA.quizzes || []).find(function(x) { return x.id === quizId; });
  if (!q || !q.questions) return;
  var u = getLogin();
  if (!u) return;
  var correct = 0;
  var total = q.questions.length;
  for (var qi = 0; qi < total; qi++) {
    var selected = document.querySelector('input[name="quiz_q_' + qi + '"]:checked');
    if (selected && parseInt(selected.value) === q.questions[qi].correct) correct++;
  }
  var score = total ? Math.round(correct / total * 100) : 0;
  if (!DATA.quiz_responses) DATA.quiz_responses = [];
  var qr = {
    id: uid(), quiz_id: quizId, member_name: u.name, score: score,
    correct: correct, total: total, completed_at: new Date().toISOString()
  };
  DATA.quiz_responses.push(qr);
  saveLocalNow(DATA);
  try{if(db&&typeof supabase!=='undefined'){db.from('quiz_responses').insert([qr]).then(function(r){if(r&&r.error)console.log('Quiz save error:',r.error)}).catch(function(err){console.log('Quiz save error:',err)})}}catch(e){}
  closeDetail();
  renderSection_quizzes();
  toast('Quiz completado: ' + correct + '/' + total + ' (' + score + '%)', score >= 70 ? 'ok' : 'info');
}

// ========== COACH NOTES ==========
function renderSection_coach_notes() {
  var u = getLogin();
  if (!u) return;
  var items = (DATA.coach_notes || []).filter(function(n) { return n.member_name === u.name; }).sort(function(a, b) { return (a.created_at || '') < (b.created_at || '') ? 1 : -1; });
  if (!items.length) {
    document.getElementById('coachNotesContent').innerHTML = '<div class="dash-empty">' + ic('message-square', 32) + '<p>No hay notas de tu coach</p></div>';
    return;
  }
  var html = '';
  for (var i = 0; i < items.length; i++) {
    var n = items[i];
    html += '<div class="glass-card dash-note" style="margin-bottom:10px;padding:16px 20px">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">' +
      '<span class="badge badge-purple">' + esc(n.category || 'general') + '</span>' +
      '<span style="font-size:11px;color:#555">' + (n.created_at ? new Date(n.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : '') + '</span></div>' +
      '<div style="color:#ccc;font-size:14px;line-height:1.6;white-space:pre-wrap">' + esc(n.note) + '</div>' +
      (n.coach ? '<div style="margin-top:8px;font-size:12px;color:var(--neon-light)">' + ic('user-check', 11) + ' ' + esc(n.coach) + '</div>' : '') + '</div>';
  }
  document.getElementById('coachNotesContent').innerHTML = html;
  if (typeof lucide !== "undefined") renderIcons();
}

// ========== PROFILE ==========
function renderSection_profile() {
  var u = getLogin();
  var sharedName = getURLParam('profile');
  var member;
  var readOnly = false;

  if (sharedName) {
    member = (DATA.members || []).find(function(m) { return m.name === sharedName; });
    readOnly = true;
    if (!member) {
      document.getElementById('profileContent').innerHTML = '<div class="dash-empty">' + ic('user-x', 32) + '<p>Perfil no encontrado</p></div>';
      return;
    }
  } else if (u) {
    member = (DATA.members || []).find(function(m) { return m.name === u.name; });
  } else {
    document.getElementById('profileContent').innerHTML = '<div class="dash-empty">' + ic('user-x', 32) + '<p>Inicia sesión para ver tu perfil</p></div>';
    return;
  }
  if (!member) {
    document.getElementById('profileContent').innerHTML = '<div class="dash-empty">' + ic('user-x', 32) + '<p>Perfil no encontrado</p></div>';
    return;
  }

  window._qsrReadOnly = readOnly;

  var xp = calcMemberXP(member);
  var myEvals = (DATA.evaluations || []).filter(function(e) { return e.member_name === member.name; });
  var myTasks = (DATA.task_completions || []).filter(function(t) { return t.member_name === member.name; });
  var myAtt = (DATA.attendance || []).filter(function(a) { return a.member_name === member.name; });
  var myAchs = (DATA.member_achievements || []).filter(function(a) { return a.member_name === member.name; });
  var grade = calcCourseGrade(member.name);
  var attRate = myAtt.length ? Math.round(myAtt.filter(function(a) { return a.status === 'present'; }).length / myAtt.length * 100) : 0;
  var totalTasks = (DATA.tasks || []).filter(function(t) { return !t.group_id || t.group_id === member.group_id; }).length;
  var totalEvals = (DATA.evaluations || []).filter(function(e) { return !e.group_id || e.group_id === member.group_id; }).length;
  var totalQuizzes = (DATA.quizzes || []).filter(function(q) { return !q.group_id || q.group_id === member.group_id; }).length;
  var myQuizzes = (DATA.quiz_responses || []).filter(function(r) { return r.member_name === member.name; });

  var acadRank = getAcademyRank(xp);
  var nextRank = getNextAcademyRank(xp);
  var rankProgress = getAcademyRankProgress(xp);

  var month = member.current_month || 1;
  var courseName = getCourseName(month);
  var minRank = getMinRankLabel(month);
  var enrollmentDate = member.enrollment_date ? new Date(member.enrollment_date) : null;
  var joinDateStr = enrollmentDate ? enrollmentDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

  function present(v) { return v !== undefined && v !== null && v !== ''; }
  var extras = {};
  (window.EXTRAS_KEYS || []).forEach(function(k) { if (present(member[k])) extras[k] = member[k]; });

  // Scrims del miembro (filtered by name if available)
  var myScrims = (DATA.scrims || []).filter(function(s) {
    return s.coach === member.coach || s.group_id === member.group_id;
  });
  var scrimWins = myScrims.filter(function(s) { return s.result === 'Victoria'; }).length;
  var scrimLosses = myScrims.filter(function(s) { return s.result === 'Derrota'; }).length;
  var scrimDraws = myScrims.filter(function(s) { return s.result === 'Empate'; }).length;
  var scrimTotal = myScrims.length;
  var scrimWR = scrimTotal ? Math.round(scrimWins / scrimTotal * 100) : 0;

  // My coach notes
  var myNotes = (DATA.coach_notes || []).filter(function(n) { return n.member_name === member.name; }).sort(function(a, b) { return (a.created_at || '') < (b.created_at || '') ? 1 : -1; });

  // Weekly objectives (stored in member or a DATA.objectives collection)
  var objectives = DATA.objectives || [];

  var readOnly = window._qsrReadOnly || false;
  var isOwner = !readOnly;

  var html = '';

  // ===== TWO-COLUMN LAYOUT =====
  var leftHtml = '';
  var rightHtml = '';

  // ===== LEFT COLUMN: COVER BANNER =====
  var coverUrl = member.cover || extras.cover || '';
  leftHtml += '<div class="qsr-cover-wrap">' +
    '<div class="qsr-cover" style="' + (coverUrl ? 'background-image:url(\'' + esc(coverUrl) + '\')' : '') + '">' +
    '<div class="qsr-cover-overlay"></div>' +
    '</div>' +
    '</div>';

  // ===== LEFT COLUMN: PROFILE PERSONAL =====
  leftHtml += '<div class="qsr-profile-personal glass-card" id="qsrProfilePersonal">' +
    '<div class="qsr-pp-avatar-wrap">' +
    '<div class="qsr-pp-avatar" style="border-color:' + acadRank.color + '">' +
    (member.image ? '<img src="' + esc(member.image) + '" class="qsr-pp-avatar-img">' : '<div class="qsr-pp-avatar-placeholder">' + ic('user', 32) + '</div>') +
    '</div>' +
    '<div class="qsr-online-dot ' + (member.online ? 'online' : 'offline') + '" title="' + (member.online ? 'En línea' : 'Desconectado') + '"></div>' +
    '</div>' +
    '<h2 class="qsr-pp-name">' + fmtName(member.name) + '</h2>' +
    '<div class="qsr-pp-tags">' +
    (member.region || extras.region ? '<span class="qsr-tag qsr-tag-region">' + ic('map-pin', 10) + ' ' + esc(member.region || extras.region) + '</span>' : '') +
    (member.role ? '<span class="qsr-tag qsr-tag-role" style="background:' + (ROLE_BADGES[member.role] ? ROLE_BADGES[member.role].color + '22' : '') + ';color:' + (ROLE_BADGES[member.role] ? ROLE_BADGES[member.role].color : '') + ';border-color:' + (ROLE_BADGES[member.role] ? ROLE_BADGES[member.role].color + '44' : '') + '">' + ic(ROLE_BADGES[member.role] ? ROLE_BADGES[member.role].icon : 'user', 10) + ' ' + esc(member.role) + '</span>' : '') +
    (member.coach ? '<span class="qsr-tag qsr-tag-coach">' + ic('user-check', 10) + ' ' + esc(member.coach) + '</span>' : '') +
    '</div>' +
    '<div class="qsr-pp-meta">' +
    '<span>' + ic('calendar', 11) + ' Ingreso: ' + joinDateStr + '</span>' +
    (member.rank ? '<span>' + ic('trending-up', 11) + ' ' + esc(member.rank) + '</span>' : '') +
    '</div>' +
    (isOwner ? '<div class="qsr-pp-actions">' +
      '<button class="qsr-btn qsr-btn-edit" onclick="showEditProfile()">' + ic('pencil', 12) + ' Editar</button>' +
      '<button class="qsr-btn qsr-btn-export" onclick="exportProfilePNG()">' + ic('image', 12) + ' PNG</button>' +
      '<button class="qsr-btn qsr-btn-share" onclick="shareProfile()">' + ic('share-2', 12) + ' Compartir</button>' +
      '</div>' : '<div class="qsr-pp-actions">' +
      '<button class="qsr-btn qsr-btn-share" onclick="shareProfile()">' + ic('share-2', 12) + ' Compartir</button>' +
      '</div>') +
    '</div>';

  // ===== LEFT COLUMN: VALORANT CONFIG =====
  var configItems = [
    { key: 'dpi', icon: 'crosshair', label: 'DPI', val: extras.dpi || '—' },
    { key: 'sens', icon: 'crosshair', label: 'Sensibilidad', val: extras.sens || '—' },
    { key: 'scoped_sens', icon: 'crosshair', label: 'Scope Sens', val: extras.scoped_sens || '—' },
    { key: 'hz', icon: 'monitor', label: 'Polling Rate', val: extras.hz || '—' },
    { key: 'raw_input', icon: 'toggle-right', label: 'Raw Input', val: extras.raw_input || '—' },
    { key: 'resolution', icon: 'monitor', label: 'Resolución', val: member.resolution || extras.resolution || '—' },
    { key: 'aspect_ratio', icon: 'monitor', label: 'Aspect Ratio', val: member.aspect_ratio || extras.aspect_ratio || '—' },
  ];
  var crosshairVal = member.crosshair || extras.crosshair || '';
  var hasConfig = configItems.some(function(c) { return c.val !== '—'; }) || !!crosshairVal;
  if (hasConfig) {
    leftHtml += '<div class="qsr-section-card glass-card">' +
      '<h3 class="qsr-section-title">' + ic('settings', 16) + ' Ajustes de Valorant</h3>' +
      '<div class="qsr-config-grid">';
    configItems.forEach(function(c) {
      leftHtml += '<div class="qsr-config-item"><div class="qsr-config-icon">' + ic(c.icon, 14) + '</div><div class="qsr-config-info"><div class="qsr-config-lbl">' + c.label + '</div><div class="qsr-config-val">' + esc(c.val) + '</div></div></div>';
    });
    if (crosshairVal) {
      leftHtml += '<div class="qsr-config-item qsr-xhair-item"><div class="qsr-config-icon">' + ic('crosshair', 14) + '</div><div class="qsr-config-info"><div class="qsr-config-lbl">Crosshair</div><button class="qsr-btn-copy-xhair" data-xhair="' + esc(crosshairVal) + '" onclick="copyCrosshair(this)">' + ic('copy', 12) + ' Copiar Crosshair</button></div></div>';
    } else {
      leftHtml += '<div class="qsr-config-item"><div class="qsr-config-icon">' + ic('crosshair', 14) + '</div><div class="qsr-config-info"><div class="qsr-config-lbl">Crosshair</div><div class="qsr-config-val">—</div></div></div>';
    }
    leftHtml += '</div>' +
      '<button class="qsr-copy-config btn-primary" onclick="copyPlayerConfig()" style="width:100%;justify-content:center;margin-top:12px">' + ic('copy', 14) + ' Copiar Configuración</button>' +
      '</div>';
  }

  // ===== LEFT COLUMN: TRACKER STATS + RADAR =====
  function sv(v) { return present(v) ? v : '—'; }
  var trackerStats = [
    { key: 'kd', label: 'K/D', val: sv(extras.kd), color: '#3b82f6' },
    { key: 'hs_percent', label: 'HS%', val: sv(extras.hs_percent), color: '#ef4444' },
    { key: 'dpr', label: 'DPR', val: sv(extras.dpr), color: '#10b981' },
    { key: 'acs', label: 'ACS', val: sv(member.acs) || sv(extras.acs), color: '#8b5cf6' },
    { key: 'adr', label: 'ADR', val: sv(member.adr) || sv(extras.adr), color: '#f59e0b' },
    { key: 'kast', label: 'KAST', val: sv(member.kast) || sv(extras.kast), color: '#ec4899' },
    { key: 'fk', label: 'FK', val: sv(member.fk) || sv(extras.fk), color: '#6366f1' },
    { key: 'fd', label: 'FD', val: sv(member.fd) || sv(extras.fd), color: '#14b8a6' },
  ];
  var hasTracker = trackerStats.some(function(s) { return s.val !== '—'; }) || extras.tracker_url || extras.riot_id || getValorantId(member);
  if (hasTracker) {
    leftHtml += '<div class="qsr-section-card glass-card">' +
      '<h3 class="qsr-section-title">' + ic('bar-chart-3', 16) + ' Estadísticas VALORANT</h3>' +
      '<div class="qsr-tracker-header">' +
      (extras.riot_id ? '<span>' + ic('user', 11) + ' ' + esc(extras.riot_id) + '</span>' : '') +
      (extras.tracker_url ? '<a href="' + esc(extras.tracker_url) + '" target="_blank" class="qsr-tracker-link">' + ic('external-link', 11) + ' Ver en Tracker.gg</a>' : '') +
      (isOwner && getValorantId(member) ? '<button class="qsr-btn-sync" onclick="syncTrackerFromHenrikDev()" title="Sincronizar desde HenrikDev">' + ic('refresh-cw', 11) + ' Sync</button>' : '') +
      '</div>' +
      '<div class="qsr-tracker-grid">';
    trackerStats.forEach(function(s) {
      leftHtml += '<div class="qsr-tracker-stat"><div class="qsr-tracker-val" style="color:' + s.color + '">' + esc(s.val) + '</div><div class="qsr-tracker-lbl">' + s.label + '</div></div>';
    });
    leftHtml += '</div>' +
      '<div class="qsr-radar-wrap">' +
      '<canvas id="qsrRadarChart" width="240" height="240" style="max-width:220px;margin:0 auto;display:block"></canvas>' +
      '<div style="text-align:center;font-size:11px;color:#666;margin-top:4px">' + ic('activity', 10) + ' Radar de rendimiento</div>' +
      '</div>' +
      '</div>';
  }

  // ===== LEFT COLUMN: VOD REVIEWS =====
  var myVods = (DATA.vod_reviews || []).filter(function(v) { return v.member_name === member.name; }).sort(function(a, b) { return (a.date || '') < (b.date || '') ? 1 : -1; });
  if (myVods.length) {
    leftHtml += '<div class="qsr-section-card glass-card">' +
      '<h3 class="qsr-section-title">' + ic('film', 16) + ' VOD Reviews</h3>' +
      '<div class="qsr-vod-list">';
    myVods.slice(0, 5).forEach(function(v) {
      var statusColors = { pendiente: '#f59e0b', completado: '#10b981', revisando: '#3b82f6' };
      var sc = statusColors[v.status] || '#888';
      leftHtml += '<div class="qsr-vod-item">' +
        '<div class="qsr-vod-meta">' +
        '<span class="qsr-vod-date">' + fmtDate(v.date) + '</span>' +
        (v.coach ? '<span class="qsr-vod-coach">' + ic('user-check', 9) + ' ' + esc(v.coach) + '</span>' : '') +
        '</div>' +
        '<div class="qsr-vod-comments">' + esc(v.comments || 'Sin comentarios') + '</div>' +
        '<span class="qsr-vod-status" style="background:' + sc + '22;color:' + sc + '">' + esc(v.status || 'pendiente') + '</span>' +
        '</div>';
    });
    leftHtml += '</div></div>';
  }

  // ===== RIGHT COLUMN: ACADEMY RANK =====
  rightHtml += '<div class="qsr-academy-card glass-card">' +
    '<div class="qsr-academy-header">' +
    '<span class="qsr-academy-badge">' + ic('graduation-cap', 14) + ' Academia</span>' +
    '</div>' +
    '<div class="qsr-rank-section">' +
    '<div class="qsr-rank-display">' +
    '<div class="qsr-rank-icon" style="color:' + acadRank.color + '">' + ic(acadRank.icon, 32) + '</div>' +
    '<div class="qsr-rank-info">' +
    '<div class="qsr-rank-name" style="color:' + acadRank.color + '">' + acadRank.name + '</div>' +
    '<div class="qsr-rank-sub">' + xp + ' XP ' + (nextRank ? '· Siguiente: ' + nextRank.name : '· RANGO MÁXIMO') + '</div>' +
    '</div>' +
    '</div>' +
    '<div class="qsr-xp-bar-wrap">' +
    '<div class="qsr-xp-bar" style="background:' + acadRank.color + '22">' +
    '<div class="qsr-xp-fill" style="width:' + rankProgress + '%;background:linear-gradient(90deg,' + acadRank.color + ',' + acadRank.color + '88)"></div>' +
    '</div>' +
    '<div class="qsr-xp-label">' + (nextRank ? xp + ' / ' + nextRank.minXP + ' XP' : xp + ' XP') + '</div>' +
    '</div>' +
    (nextRank ? '<div class="qsr-rank-reward">' + ic('gift', 10) + ' Próxima recompensa: ' + nextRank.reward + '</div>' : '<div class="qsr-rank-reward" style="color:#f59e0b">' + ic('award', 10) + ' Rango máximo alcanzado</div>') +
    '</div>' +
    '</div>';

  // ===== RIGHT COLUMN: CURSO ACTUAL =====
  var courseStatus = member.academy_status || 'En curso';
  var courseStatusColor = courseStatus === 'En curso' ? '#10b981' : courseStatus === 'Completado' ? '#3b82f6' : '#ef4444';
  rightHtml += '<div class="qsr-section-card glass-card">' +
    '<h3 class="qsr-section-title">' + ic('graduation-cap', 16) + ' Curso Actual</h3>' +
    '<div class="qsr-course-grid">' +
    '<div class="qsr-course-item"><span class="qsr-label">Curso</span><span class="qsr-value">' + courseName + '</span></div>' +
    (member.coach ? '<div class="qsr-course-item"><span class="qsr-label">Coach</span><span class="qsr-value">' + ic('user-check', 11) + ' ' + esc(member.coach) + '</span></div>' : '') +
    '<div class="qsr-course-item"><span class="qsr-label">Inicio</span><span class="qsr-value">' + joinDateStr + '</span></div>' +
    '<div class="qsr-course-item"><span class="qsr-label">Estado</span><span class="qsr-badge-status" style="background:' + courseStatusColor + '22;color:' + courseStatusColor + ';border-color:' + courseStatusColor + '44">' + courseStatus + '</span></div>' +
    '</div>' +
    '<div class="qsr-progress-section">' +
    '<div class="qsr-progress-header"><span>Progreso del curso</span><span>' + Math.round(month / 12 * 100) + '%</span></div>' +
    '<div class="qsr-progress-bar"><div class="qsr-progress-fill" style="width:' + (month / 12 * 100) + '%"></div></div>' +
    '<div class="qsr-progress-footer">' +
    '<span>Rango requerido: ' + minRank + '</span>' +
    '<span>' + (meetsRankReq(member.rank, month) ? ic('check', 10) + ' Cumplido' : ic('x', 10) + ' No cumplido') + '</span>' +
    '</div>' +
    '</div>' +
    '</div>';

  // ===== RIGHT COLUMN: PROGRESO =====
  rightHtml += '<div class="qsr-section-card glass-card">' +
    '<h3 class="qsr-section-title">' + ic('bar-chart-3', 16) + ' Progreso</h3>' +
    '<div class="qsr-progress-grid">' +
    '<div class="qsr-progress-stat">' +
    '<div class="qsr-stat-icon" style="background:rgba(59,130,246,0.1);color:#3b82f6">' + ic('check-square', 16) + '</div>' +
    '<div class="qsr-stat-info"><div class="qsr-stat-val">' + myTasks.length + '/' + totalTasks + '</div><div class="qsr-stat-lbl">Tareas</div></div>' +
    '<div class="qsr-stat-mini-bar"><div class="qsr-stat-mini-fill" style="width:' + (totalTasks ? Math.round(myTasks.length / totalTasks * 100) : 0) + '%;background:#3b82f6"></div></div>' +
    '</div>' +
    '<div class="qsr-progress-stat">' +
    '<div class="qsr-stat-icon" style="background:rgba(139,92,246,0.1);color:#8b5cf6">' + ic('clipboard-list', 16) + '</div>' +
    '<div class="qsr-stat-info"><div class="qsr-stat-val">' + myEvals.length + '/' + totalEvals + '</div><div class="qsr-stat-lbl">Evaluaciones</div></div>' +
    '<div class="qsr-stat-mini-bar"><div class="qsr-stat-mini-fill" style="width:' + (totalEvals ? Math.round(myEvals.length / totalEvals * 100) : 0) + '%;background:#8b5cf6"></div></div>' +
    '</div>' +
    '<div class="qsr-progress-stat">' +
    '<div class="qsr-stat-icon" style="background:rgba(16,185,129,0.1);color:#10b981">' + ic('help-circle', 16) + '</div>' +
    '<div class="qsr-stat-info"><div class="qsr-stat-val">' + myQuizzes.length + '/' + totalQuizzes + '</div><div class="qsr-stat-lbl">Quizzes</div></div>' +
    '<div class="qsr-stat-mini-bar"><div class="qsr-stat-mini-fill" style="width:' + (totalQuizzes ? Math.round(myQuizzes.length / totalQuizzes * 100) : 0) + '%;background:#10b981"></div></div>' +
    '</div>' +
    '<div class="qsr-progress-stat">' +
    '<div class="qsr-stat-icon" style="background:rgba(245,158,11,0.1);color:#f59e0b">' + ic('calendar', 16) + '</div>' +
    '<div class="qsr-stat-info"><div class="qsr-stat-val">' + myAtt.filter(function(a) { return a.status === 'present'; }).length + '/' + myAtt.length + '</div><div class="qsr-stat-lbl">Asistencia</div></div>' +
    '<div class="qsr-stat-mini-bar"><div class="qsr-stat-mini-fill" style="width:' + attRate + '%;background:#f59e0b"></div></div>' +
    '</div>' +
    '</div>' +
    '<div class="qsr-general-progress">' +
    '<div class="qsr-general-header"><span>Progreso General</span><span>' + (grade ? grade.total + '%' : '0%') + '</span></div>' +
    '<div class="qsr-general-bar"><div class="qsr-general-fill" style="width:' + (grade ? grade.total : 0) + '%"></div></div>' +
    '</div>' +
    '</div>';

  // ===== RIGHT COLUMN: SCRIMS =====
  if (scrimTotal) {
    rightHtml += '<div class="qsr-section-card glass-card">' +
      '<h3 class="qsr-section-title">' + ic('crosshair', 16) + ' Scrims</h3>' +
      '<div class="qsr-scrim-stats">' +
      '<div class="qsr-scrim-stat"><span class="qsr-scrim-num" style="color:#888">' + scrimTotal + '</span><span class="qsr-scrim-lbl">Total</span></div>' +
      '<div class="qsr-scrim-stat"><span class="qsr-scrim-num" style="color:#10b981">' + scrimWins + '</span><span class="qsr-scrim-lbl">Victorias</span></div>' +
      '<div class="qsr-scrim-stat"><span class="qsr-scrim-num" style="color:#ef4444">' + scrimLosses + '</span><span class="qsr-scrim-lbl">Derrotas</span></div>' +
      (scrimDraws ? '<div class="qsr-scrim-stat"><span class="qsr-scrim-num" style="color:#f59e0b">' + scrimDraws + '</span><span class="qsr-scrim-lbl">Empates</span></div>' : '') +
      '<div class="qsr-scrim-stat"><span class="qsr-scrim-num" style="color:' + (scrimWR >= 50 ? '#10b981' : '#ef4444') + '">' + scrimWR + '%</span><span class="qsr-scrim-lbl">Winrate</span></div>' +
      '</div>' +
      '<div class="qsr-scrim-history">';
    myScrims.slice().reverse().slice(0, 5).forEach(function(s) {
      var cls = s.result === 'Victoria' ? 'qsr-scrim-won' : s.result === 'Derrota' ? 'qsr-scrim-lost' : 'qsr-scrim-draw';
      rightHtml += '<div class="qsr-scrim-row ' + cls + '">' +
        '<span class="qsr-scrim-opp">' + esc(s.opponent || '—') + '</span>' +
        '<span class="qsr-scrim-score">' + esc((typeof s.our === 'number' ? s.our : '-')) + ' - ' + esc(typeof s.opponent_score === 'number' ? s.opponent_score : '-') + '</span>' +
        '<span class="qsr-scrim-result">' + esc(s.result) + '</span>' +
        '</div>';
    });
    rightHtml += '</div></div>';
  }

  // ===== RIGHT COLUMN: COACHING =====
  var coachNames = [];
  if (member.coaches && Array.isArray(member.coaches)) {
    coachNames = member.coaches;
  } else if (member.coach) {
    coachNames = [member.coach];
  }
  if (coachNames.length) {
    rightHtml += '<div class="qsr-section-card glass-card">' +
      '<h3 class="qsr-section-title">' + ic('user-check', 16) + ' Coach' + (coachNames.length > 1 ? 'es' : '') + ' Asignado' + (coachNames.length > 1 ? 's' : '') + '</h3>';
    coachNames.forEach(function(cn) {
      var coach = (DATA.coaches || []).find(function(c) { return c.name === cn || c.nickname === cn; });
      rightHtml += '<div class="qsr-coach-card" style="' + (coachNames.length > 1 ? 'margin-bottom:10px' : '') + '">' +
        '<div class="qsr-coach-avatar">' +
        (coach && coach.avatar ? '<img src="' + esc(coach.avatar) + '">' : '<div style="width:56px;height:56px;border-radius:50%;background:rgba(59,130,246,0.1);display:flex;align-items:center;justify-content:center">' + ic('user-check', 24) + '</div>') +
        '</div>' +
        '<div class="qsr-coach-info">' +
        '<div class="qsr-coach-name">' + esc(coach ? coach.name : cn) + '</div>' +
        (coach && coach.specialty ? '<div class="qsr-coach-spec">' + ic('star', 10) + ' ' + esc(coach.specialty) + '</div>' : '') +
        (coach && coach.nickname ? '<div class="qsr-coach-nick">' + ic('user', 10) + ' ' + esc(coach.nickname) + '</div>' : '') +
        '</div>' +
        '</div>';
    });
    // Coach notes
    rightHtml += (myNotes.length ? '<div class="qsr-coach-notes"><div class="qsr-notes-header">' + ic('message-square', 12) + ' Últimas notas</div>' +
      myNotes.slice(0, 3).map(function(n) {
        return '<div class="qsr-note-item"><div class="qsr-note-cat">' + esc(n.category || 'general') + '</div><div class="qsr-note-text">' + esc(n.note) + '</div><div class="qsr-note-date">' + (n.created_at ? new Date(n.created_at).toLocaleDateString('es-ES') : '') + '</div></div>';
      }).join('') + '</div>' : '') +
    '</div>';
  }

  // ===== RIGHT COLUMN: OBJETIVOS =====
  var myObj = objectives.filter(function(o) { return o.member_name === member.name && o.week === getCurrentWeekStart(); });
  if (myObj.length) {
    rightHtml += '<div class="qsr-section-card glass-card">' +
      '<h3 class="qsr-section-title">' + ic('target', 16) + ' Objetivos Semanales</h3>' +
      '<div class="qsr-objectives-grid">';
    myObj.forEach(function(o) {
      var pct = o.progress || 0;
      rightHtml += '<div class="qsr-objective-item">' +
        '<div class="qsr-obj-header"><span>' + esc(o.title) + '</span><span>' + pct + '%</span></div>' +
        '<div class="qsr-obj-bar"><div class="qsr-obj-fill" style="width:' + pct + '%"></div></div>' +
        '</div>';
    });
    rightHtml += '</div></div>';
  }

  // ===== RIGHT COLUMN: LOGROS =====
  if (myAchs.length) {
    rightHtml += '<div class="qsr-section-card glass-card">' +
      '<h3 class="qsr-section-title">' + ic('award', 16) + ' Logros (' + myAchs.length + ')</h3>' +
      '<div class="qsr-achievements-row">';
    myAchs.forEach(function(ma) {
      var ach = (DATA.achievements || []).find(function(a) { return a.id === ma.achievement_id; });
      var color = ach ? (ach.color || '#8B5CF6') : '#8B5CF6';
      var name = ach ? (ach.name || 'Logro') : 'Logro';
      rightHtml += '<div class="qsr-ach-badge" style="border-color:' + color + '">' +
        ic('award', 20) + '<span>' + esc(name) + '</span></div>';
    });
    rightHtml += '</div></div>';
  }

  // ===== RIGHT COLUMN: LEADERBOARD =====
  var ranked = (DATA.members || []).map(function(m) {
    return { name: m.name, xp: calcMemberXP(m) };
  }).sort(function(a, b) { return b.xp - a.xp; });
  var myRank = ranked.findIndex(function(r) { return r.name === member.name; }) + 1;
  rightHtml += '<div class="qsr-section-card glass-card">' +
    '<h3 class="qsr-section-title">' + ic('trophy', 16) + ' Leaderboard</h3>' +
    '<div class="qsr-leaderboard-snippet">' +
    '<div class="qsr-lb-rank">' +
    '<span class="qsr-lb-rank-num" style="color:' + (myRank <= 3 ? '#f59e0b' : '#888') + '">#' + myRank + '</span>' +
    '<span class="qsr-lb-rank-lbl">de ' + ranked.length + '</span>' +
    '</div>' +
    '<div class="qsr-lb-bar-wrap"><div class="qsr-lb-bar"><div class="qsr-lb-fill" style="width:' + (ranked.length ? Math.round((ranked.length - myRank + 1) / ranked.length * 100) : 0) + '%"></div></div></div>' +
    '<div class="qsr-lb-xp">' + xp + ' XP</div>' +
    '</div>' +
    '</div>';

  // ===== COMBINE LEFT + RIGHT =====
  html += '<div class="qsr-two-col">' +
    '<div class="qsr-col-left">' + leftHtml + '</div>' +
    '<div class="qsr-col-right">' + rightHtml + '</div>' +
    '</div>';

  // ===== SOCIAL FOOTER =====
  var socialLinks = [
    { key: 'discord', url: extras.discord, label: 'Discord' },
    { key: 'youtube', url: extras.youtube, label: 'YouTube' },
    { key: 'twitter', url: extras.twitter, label: 'Twitter' },
    { key: 'twitch', url: extras.twitch, label: 'Twitch' },
  ];
  var hasSocial = socialLinks.some(function(s) { return s.url; });
  var footerSocial = document.getElementById('footerSocial');
  if (footerSocial) {
    var fh = '';
    var socialConf = [
      { k: 'social_twitch', l: 'Twitch', i: ic('twitch', 16) },
      { k: 'social_youtube', l: 'YouTube', i: ic('youtube', 16) },
      { k: 'social_twitter', l: 'Twitter', i: ic('twitter', 16) },
      { k: 'social_instagram', l: 'Instagram', i: ic('instagram', 16) },
    ];
    var c = DATA.content && DATA.content.home || {};
    socialConf.forEach(function(s) {
      if (c[s.k]) fh += '<a href="' + esc(c[s.k]) + '" target="_blank" title="' + s.l + '">' + s.i + '</a>';
    });
    if (extras.discord) {
      fh += '<a href="' + esc(extras.discord) + '" target="_blank" title="Discord">' + ic('message-circle', 16) + '</a>';
    }
    footerSocial.innerHTML = fh;
  }

  // ===== END: Inject HTML and render =====
  document.getElementById('profileContent').innerHTML = html;
  if (typeof lucide !== "undefined") renderIcons();

  // Draw radar chart after icons
  drawRadarChart(member);

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========== EDIT PROFILE ==========
function showEditProfile() {
  var u = getLogin();
  if (!u) return;
  var member = (DATA.members || []).find(function(m) { return m.name === u.name; });
  if (!member) return;
  var extras = {};
  (window.EXTRAS_KEYS || []).forEach(function(k) { if (member[k]) extras[k] = member[k]; });

  function v(k) { return esc(member[k] || extras[k] || ''); }

  var overlay = document.createElement('div');
  overlay.className = 'qsr-modal-overlay';
  overlay.innerHTML =
    '<div class="qsr-modal" style="max-width:500px">' +
    '<h3>' + ic('pencil', 18) + ' Editar Perfil</h3>' +
    '<p>Completa todos tus datos (excepto estadísticas del tracker)</p>' +

    '<label>' + ic('user', 12) + ' Foto de perfil</label>' +
    '<div style="display:flex;align-items:center;gap:10px">' +
    '<button class="qsr-upload-btn" onclick="document.getElementById(\'editProfileImg\').click()" type="button">' + ic('camera', 14) + ' Subir foto</button>' +
    '<input type="file" accept="image/*" id="editProfileImg" style="display:none">' +
    '</div>' +
    '<div class="qsr-preview qsr-preview-avatar" id="editProfileImgPreview" style="' + (member.image ? 'background-image:url(' + esc(member.image) + ')' : '') + '"></div>' +

    '<label>' + ic('image', 12) + ' Portada (banner)</label>' +
    '<div style="display:flex;align-items:center;gap:10px">' +
    '<button class="qsr-upload-btn" onclick="document.getElementById(\'editCoverImg\').click()" type="button">' + ic('camera', 14) + ' Subir portada</button>' +
    '<input type="file" accept="image/*" id="editCoverImg" style="display:none">' +
    '</div>' +
    '<div class="qsr-preview" id="editCoverImgPreview" style="' + (extras.cover || member.cover ? 'background-image:url(' + esc(extras.cover || member.cover) + ')' : '') + '"></div>' +

    '<label>' + ic('map-pin', 12) + ' Región</label>' +
    '<input type="text" id="editRegion" value="' + v('region') + '" placeholder="Ej: LATAM, NA, EU">' +

    '<label>' + ic('message-circle', 12) + ' Discord</label>' +
    '<input type="text" id="editDiscord" value="' + v('discord') + '" placeholder="Ej: usuario#1234">' +

    '<label>' + ic('user', 12) + ' Riot ID</label>' +
    '<input type="text" id="editRiotId" value="' + v('riot_id') + '" placeholder="Ej: Jugador#TAG">' +

    '<label>' + ic('external-link', 12) + ' URL Tracker.gg</label>' +
    '<input type="text" id="editTrackerUrl" value="' + v('tracker_url') + '" placeholder="https://tracker.gg/valorant/...">' +

    '<h4 style="margin:18px 0 10px;font-size:13px;color:#a78bfa;display:flex;align-items:center;gap:6px">' + ic('settings', 12) + ' Configuración de Valorant</h4>' +

    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">' +
    '<div><label>DPI</label><input type="text" id="editDpi" value="' + v('dpi') + '" placeholder="800"></div>' +
    '<div><label>Sensibilidad</label><input type="text" id="editSens" value="' + v('sens') + '" placeholder="0.3"></div>' +
    '<div><label>Scope Sens</label><input type="text" id="editScopedSens" value="' + v('scoped_sens') + '" placeholder="1.0"></div>' +
    '<div><label>Polling Rate</label><input type="text" id="editHz" value="' + v('hz') + '" placeholder="1000"></div>' +
    '<div><label>Raw Input</label><input type="text" id="editRawInput" value="' + v('raw_input') + '" placeholder="On/Off"></div>' +
    '<div><label>Resolución</label><input type="text" id="editResolution" value="' + v('resolution') + '" placeholder="1920x1080"></div>' +
    '<div><label>Aspect Ratio</label><input type="text" id="editAspectRatio" value="' + v('aspect_ratio') + '" placeholder="16:9"></div>' +
    '<div><label>Crosshair</label><input type="text" id="editCrosshair" value="' + v('crosshair') + '" placeholder="0;P;c..."></div>' +
    '</div>' +

    '<div class="qsr-modal-actions">' +
    '<button class="qsr-btn-cancel" onclick="this.closest(\'.qsr-modal-overlay\').remove()">' + ic('x', 14) + ' Cancelar</button>' +
    '<button class="qsr-btn-save" onclick="saveEditProfile(this)">' + ic('check', 14) + ' Guardar Cambios</button>' +
    '</div>' +
    '</div>';
  document.body.appendChild(overlay);
  renderIcons();

  // Preview on file select
  document.getElementById('editProfileImg').addEventListener('change', function(e) {
    var f = e.target.files[0];
    if (!f) return;
    var r = new FileReader();
    r.onload = function(ev) { document.getElementById('editProfileImgPreview').style.backgroundImage = 'url(' + ev.target.result + ')'; };
    r.readAsDataURL(f);
  });
  document.getElementById('editCoverImg').addEventListener('change', function(e) {
    var f = e.target.files[0];
    if (!f) return;
    var r = new FileReader();
    r.onload = function(ev) { document.getElementById('editCoverImgPreview').style.backgroundImage = 'url(' + ev.target.result + ')'; };
    r.readAsDataURL(f);
  });
}

function saveEditProfile(btn) {
  var u = getLogin();
  if (!u) return;
  var member = (DATA.members || []).find(function(m) { return m.name === u.name; });
  if (!member) return;

  var imgFile = document.getElementById('editProfileImg').files[0];
  var coverFile = document.getElementById('editCoverImg').files[0];
  var region = document.getElementById('editRegion').value.trim();
  var discord = document.getElementById('editDiscord').value.trim();
  var riotId = document.getElementById('editRiotId').value.trim();
  var trackerUrl = document.getElementById('editTrackerUrl').value.trim();
  var dpi = document.getElementById('editDpi').value.trim();
  var sens = document.getElementById('editSens').value.trim();
  var scopedSens = document.getElementById('editScopedSens').value.trim();
  var hz = document.getElementById('editHz').value.trim();
  var rawInput = document.getElementById('editRawInput').value.trim();
  var resolution = document.getElementById('editResolution').value.trim();
  var aspectRatio = document.getElementById('editAspectRatio').value.trim();
  var crosshair = document.getElementById('editCrosshair').value.trim();

  var processSave = function(imgData, coverData) {
    if (imgData) member.image = imgData;
    if (coverData) member.cover = coverData;
    member.region = region || '';
    member.discord = discord || '';
    member.riot_id = riotId || '';
    member.tracker_url = trackerUrl || '';
    member.dpi = dpi || '';
    member.sens = sens || '';
    member.scoped_sens = scopedSens || '';
    member.hz = hz || '';
    member.raw_input = rawInput || '';
    member.resolution = resolution || '';
    member.aspect_ratio = aspectRatio || '';
    member.crosshair = crosshair || '';

    saveLocalNow(DATA);
    try{if(db&&typeof supabase!=='undefined'){db.from('members').update({region:member.region,discord:member.discord,riot_id:member.riot_id,tracker_url:member.tracker_url,dpi:member.dpi,sens:member.sens,scoped_sens:member.scoped_sens,hz:member.hz,raw_input:member.raw_input,resolution:member.resolution,aspect_ratio:member.aspect_ratio,crosshair:member.crosshair,image:member.image,cover:member.cover}).eq('name',member.name).then(function(r){if(r&&r.error)console.log('Supabase save error:',r.error)}).catch(function(err){console.log('Supabase save error:',err)})}}catch(e){}
    btn.closest('.qsr-modal-overlay').remove();
    toast('Perfil actualizado', 'ok');
    renderSection_profile();
  };

  var pending = 0;
  var imgResult = null;
  var coverResult = null;

  if (imgFile) {
    pending++;
    var r1 = new FileReader();
    r1.onload = function(e) { imgResult = e.target.result; pending--; if (!pending) processSave(imgResult, coverResult); };
    r1.readAsDataURL(imgFile);
  }
  if (coverFile) {
    pending++;
    var r2 = new FileReader();
    r2.onload = function(e) { coverResult = e.target.result; pending--; if (!pending) processSave(imgResult, coverResult); };
    r2.readAsDataURL(coverFile);
  }

  if (!pending) processSave(null, null);
}

// ========== EXPORT PROFILE PNG ==========
function exportProfilePNG() {
  var el = document.querySelector('.qsr-col-left');
  if (!el) { toast('No hay perfil para exportar', 'err'); return; }
  if (typeof html2canvas === 'undefined') { toast('html2canvas no disponible', 'err'); return; }
  html2canvas(el, {
    scale: 2,
    backgroundColor: '#0d0a1a',
    allowTaint: false,
    useCORS: true,
    logging: false
  }).then(function(canvas) {
    var link = document.createElement('a');
    link.download = 'perfil_' + (getLogin() ? getLogin().name.replace(/[^a-zA-Z0-9]/g, '_') : 'alumno') + '.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    toast('Perfil exportado como PNG', 'ok');
  }).catch(function() {
    toast('Error al exportar', 'err');
  });
}

// ========== SHARE PROFILE ==========
function shareProfile() {
  var u = getLogin();
  var name = u ? u.name : (document.querySelector('.qsr-pp-name') ? document.querySelector('.qsr-pp-name').textContent.trim() : '');
  var shareUrl = window.location.href.split('?')[0].split('#')[0] + '?profile=' + encodeURIComponent(name);
  if (navigator.share) {
    navigator.share({ title: 'Perfil de ' + name, text: 'Mira mi perfil en QU4SAR Academy', url: shareUrl });
  } else {
    navigator.clipboard.writeText(shareUrl).then(function() {
      toast('Enlace del perfil copiado al portapapeles', 'ok');
    }).catch(function() {
      prompt('Comparte este enlace:', shareUrl);
    });
  }
}

// ========== RADAR CHART ==========
function drawRadarChart(member) {
  var canvas = document.getElementById('qsrRadarChart');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  var w = canvas.width, h = canvas.height;
  var cx = w / 2, cy = h / 2;
  var r = Math.min(cx, cy) - 22;

  var stats = [
    { label: 'K/D', val: parseFloat(member.kd) || 0, max: 3, color: '#3b82f6' },
    { label: 'ACS', val: parseFloat(member.acs) || 0, max: 300, color: '#8b5cf6' },
    { label: 'ADR', val: parseFloat(member.adr) || 0, max: 250, color: '#f59e0b' },
    { label: 'KAST', val: parseFloat(member.kast) || 0, max: 100, color: '#ec4899' },
    { label: 'HS%', val: parseFloat(member.hs_percent) || 0, max: 100, color: '#ef4444' },
    { label: 'DPR', val: parseFloat(member.dpr) || 0, max: 200, color: '#10b981' },
  ];

  var n = stats.length;
  var angleStep = (Math.PI * 2) / n;

  ctx.clearRect(0, 0, w, h);

  // Helper: get coords for a data index at given radius factor
  function getPoint(idx, radius) {
    var a = -Math.PI / 2 + idx * angleStep;
    return { x: cx + radius * Math.cos(a), y: cy + radius * Math.sin(a), angle: a };
  }

  // Grid rings with subtle glow
  for (var ring = 1; ring <= 4; ring++) {
    var radius = (r / 4) * ring;
    ctx.beginPath();
    for (var i = 0; i <= n; i++) {
      var p = getPoint(i % n, radius);
      if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
    ctx.strokeStyle = 'rgba(139,92,246,0.06)';
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }

  // Axis lines with fade
  for (var i = 0; i < n; i++) {
    var p = getPoint(i, r);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(p.x, p.y);
    ctx.strokeStyle = 'rgba(139,92,246,0.04)';
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }

  // Glow behind data polygon
  ctx.save();
  ctx.shadowColor = '#8b5cf6';
  ctx.shadowBlur = 25;
  ctx.beginPath();
  for (var i = 0; i <= n; i++) {
    var idx = i % n;
    var pct = Math.min(stats[idx].val / stats[idx].max, 1);
    var p = getPoint(idx, r * pct);
    if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
  }
  ctx.closePath();
  ctx.fillStyle = 'rgba(139,92,246,0.12)';
  ctx.fill();
  ctx.restore();

  // Data polygon fill
  ctx.beginPath();
  for (var i = 0; i <= n; i++) {
    var idx = i % n;
    var pct = Math.min(stats[idx].val / stats[idx].max, 1);
    var p = getPoint(idx, r * pct);
    if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
  }
  ctx.closePath();
  var grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  grad.addColorStop(0, 'rgba(167,139,250,0.25)');
  grad.addColorStop(1, 'rgba(139,92,246,0.05)');
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = '#a78bfa';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Data points with glow
  for (var i = 0; i < n; i++) {
    var pct = Math.min(stats[i].val / stats[i].max, 1);
    var p = getPoint(i, r * pct);
    // Outer glow
    ctx.save();
    ctx.shadowColor = stats[i].color;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = stats[i].color;
    ctx.fill();
    ctx.restore();
    // Inner dot
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
  }

  // Value labels at each data point
  ctx.font = 'bold 10px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  for (var i = 0; i < n; i++) {
    var pct = Math.min(stats[i].val / stats[i].max, 1);
    var p = getPoint(i, r * pct);
    var valLabel = stats[i].val.toFixed(1);
    if (stats[i].label === 'HS%' || stats[i].label === 'KAST') valLabel = Math.round(stats[i].val) + '%';
    var offset = 10;
    ctx.fillStyle = stats[i].color;
    ctx.fillText(valLabel, p.x, p.y - offset);
  }

  // Axis labels
  ctx.font = '9px Inter, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (var i = 0; i < n; i++) {
    var p = getPoint(i, r + 16);
    ctx.fillText(stats[i].label, p.x, p.y);
  }
}

// ========== SYNC TRACKER (HENRIKDEV) ==========
function getValorantId(member) {
  if (member.riot_id && member.riot_id.includes('#')) return member.riot_id;
  if (member.name && member.name.includes('#')) return member.name;
  return '';
}

function syncTrackerFromHenrikDev() {
  var u = getLogin();
  if (!u) return;
  var member = (DATA.members || []).find(function(m) { return m.name === u.name; });
  if (!member) return;
  var riotId = getValorantId(member);
  if (!riotId) {
    toast('No hay Riot ID. Edita tu perfil y pon tu Nombre#TAG de Valorant', 'error');
    return;
  }
  var parts = riotId.split('#');
  var name = parts[0].trim();
  var tag = parts[1].trim();
  if (!name || !tag) { toast('Riot ID inválido', 'error'); return; }

  if (!window.HENRIK_API_KEY) { try { var saved = localStorage.getItem('henrik_api_key'); if (saved) window.HENRIK_API_KEY = saved; } catch (e) {} }
  var apiKey = window.HENRIK_API_KEY || '';
  var btn = document.querySelector('.qsr-btn-sync');
  if (btn) { btn.disabled = true; btn.innerHTML = '<i data-lucide="loader" style="width:11px;height:11px" class="spin"></i> Sync...'; if (typeof lucide !== 'undefined') renderIcons(); }

  var region = (member.region || 'latam').toLowerCase();
  var baseUrl = 'https://api.henrikdev.xyz/valorant';
  var headers = {};
  if (apiKey) headers['Authorization'] = apiKey;

  toast('Sincronizando con HenrikDev...', 'info');

  // Step 1: get account to obtain PUUID
  fetch(baseUrl + '/v1/account/' + encodeURIComponent(name) + '/' + encodeURIComponent(tag), { headers: headers })
  .then(function(r) { if (r.status === 401) throw { status: 401, msg: 'API key inválida. Consigue una gratis en https://docs.henrikdev.xyz' }; return r.json(); })
  .then(function(accountData) {
    if (!accountData || accountData.status !== 200 || !accountData.data || !accountData.data.puuid) {
      toast('No se encontró la cuenta. ¿El Riot ID es correcto?', 'error');
      resetBtn(); return;
    }
    var puuid = accountData.data.puuid;

    // Step 2: get recent matches using PUUID
    return fetch(baseUrl + '/v3/by-puuid/matches/' + region + '/' + puuid, { headers: headers })
    .then(function(r) { return r.json(); })
    .then(function(matchData) {
      var matches = (matchData && matchData.data) ? matchData.data : [];
      if (!matches.length) { toast('No se encontraron partidas recientes', 'info'); resetBtn(); return; }

      // Filter competitive matches and take up to 5
      var compMatches = matches.filter(function(m) { return m.meta && m.meta.mode === 'Competitive'; });
      if (!compMatches.length) compMatches = matches;
      compMatches = compMatches.slice(0, 5);

      // Collect match IDs for detailed stats
      var matchIds = compMatches.map(function(m) { return m.meta ? m.meta.id : (m.match_id || ''); }).filter(function(id) { return id; });

      if (!matchIds.length) {
        // Use basic stats from matchlist
        var totalK = 0, totalD = 0, totalA = 0, count = 0;
        compMatches.forEach(function(m) {
          if (m.stats) {
            totalK += m.stats.kills || 0;
            totalD += m.stats.deaths || 0;
            totalA += m.stats.assists || 0;
            count++;
          }
        });
        if (count) {
          member.kd = String(Math.round((totalK / Math.max(totalD, 1)) * 100) / 100);
          saveLocalNow(DATA);
          try { if (db && typeof supabase !== 'undefined') { db.from('members').update({ kd: member.kd }).eq('name', member.name).then(function(r){if(r&&r.error)console.log('Sync save error:',r.error)}).catch(function(err){console.log('Sync save error:',err)}) } } catch (e) {}
          toast('KD actualizado (datos básicos, ' + count + ' partidas)', 'ok');
          renderSection_profile();
        } else {
          toast('No hay datos de partidas disponibles', 'info');
        }
        resetBtn();
        return;
      }

      // Step 3: fetch individual matches for detailed stats
      var detailFetches = matchIds.map(function(id) {
        return fetch(baseUrl + '/v2/match/' + id, { headers: headers })
        .then(function(r) { return r.json(); })
        .catch(function() { return null; });
      });

      return Promise.all(detailFetches).then(function(details) {
        var allStats = [];
        details.forEach(function(d) {
          if (!d || !d.data) return;
          var players = d.data.players || d.data.all_players || [];
          if (!Array.isArray(players)) players = [players];
          var myPlayer = players.find(function(p) { return p.puuid === puuid || (p.name && p.tag && p.name + '#' + p.tag === riotId); });
          if (myPlayer && myPlayer.stats) {
            allStats.push(myPlayer.stats);
          }
        });

        if (allStats.length) {
          var total = allStats.length;
          var totalKills = 0, totalDeaths = 0, totalHs = 0, totalShots = 0;
          var totalDmg = 0, totalScore = 0, totalKast = 0, totalFk = 0, totalFd = 0;
          allStats.forEach(function(st) {
            totalKills += st.kills || 0;
            totalDeaths += st.deaths || 0;
            totalHs += st.headshots || 0;
            totalShots += (st.kills || 0) + (st.body_shots || 0) + (st.leg_shots || 0);
            totalDmg += st.damage_made || st.damage || 0;
            totalScore += st.score || 0;
            totalKast += st.kast || 0;
            totalFk += st.first_kills || 0;
            totalFd += st.first_deaths || 0;
          });

          member.kd = String(Math.round((totalKills / Math.max(totalDeaths, 1)) * 100) / 100);
          member.hs_percent = String(totalShots > 0 ? Math.round(totalHs / totalShots * 1000) / 10 : 0);
          member.dpr = String(Math.round(totalDeaths / total * 10) / 10);
          member.acs = String(Math.round(totalScore / total));
          member.adr = String(Math.round(totalDmg / total));
          member.kast = String(Math.round(totalKast / total));
          member.fk = String(Math.round(totalFk / total));
          member.fd = String(Math.round(totalFd / total));

          saveLocalNow(DATA);
          try { if (db && typeof supabase !== 'undefined') { db.from('members').update({ kd: member.kd, hs_percent: member.hs_percent, dpr: member.dpr, acs: member.acs, adr: member.adr, kast: member.kast, fk: member.fk, fd: member.fd }).eq('name', member.name).then(function(r){if(r&&r.error)console.log('Sync save error:',r.error)}).catch(function(err){console.log('Sync save error:',err)}) } } catch (e) {}

          toast('Estadísticas sincronizadas (' + total + ' partidas)', 'ok');
          renderSection_profile();
        } else {
          toast('No se encontraron stats detalladas en las partidas', 'info');
        }
        resetBtn();
      });
    });
  })
  .catch(function(err) {
    console.error('HenrikDev sync error:', err);
    var msg = (err && err.msg) || (err && err.message) || 'desconocido';
    if (err && err.status === 401) msg = err.msg;
    toast('Error: ' + msg, 'error');
    resetBtn();
  });

  function resetBtn() {
    var btn = document.querySelector('.qsr-btn-sync');
    if (btn) { btn.disabled = false; btn.innerHTML = '<i data-lucide="refresh-cw" style="width:11px;height:11px"></i> Sync'; if (typeof lucide !== 'undefined') renderIcons(); }
  }
}

// ========== COPY CONFIG ==========
function copyCrosshair(btn){
  var code=btn.getAttribute('data-xhair');
  if(!code)return;
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(code).then(function(){toast('Crosshair copiado','ok')}).catch(function(){fallbackCopy(code)});
  }else{
    fallbackCopy(code);
  }
}

function copyPlayerConfig() {
  var u = getLogin();
  if (!u) return;
  var member = (DATA.members || []).find(function(m) { return m.name === u.name; });
  if (!member) return;

  var lines = [
    '=== CONFIGURACIÓN VALORANT - ' + member.name + ' ===',
    'DPI: ' + (member.dpi || '—'),
    'Sensibilidad: ' + (member.sens || '—'),
    'Scope Sens: ' + (member.scoped_sens || '—'),
    'Polling Rate: ' + (member.hz || '—') + ' Hz',
    'Raw Input: ' + (member.raw_input || '—'),
    'Resolución: ' + (member.resolution || '—'),
    'Aspect Ratio: ' + (member.aspect_ratio || '—'),
    'Crosshair: ' + (member.crosshair || '—'),
    '=== QU4SAR ACADEMY ==='
  ];
  var text = lines.join('\n');

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function() {
      toast('Configuración copiada al portapapeles', 'ok');
    }).catch(function() {
      fallbackCopy(text);
    });
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  var ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    toast('Configuración copiada', 'ok');
  } catch (e) {
    toast('Error al copiar', 'err');
  }
  document.body.removeChild(ta);
}

// ========== INIT ==========
(function init() {
  var isCommunity = !!document.getElementById('isCommunity');
  var sharedName = getURLParam('profile');
  var u = getLogin();

  if (sharedName) {
    // Shared profile mode: hide everything, show only the profile
    document.body.classList.add('qsr-shared-mode');
    var overlay = document.getElementById('loginOverlay');
    if (overlay) { overlay.classList.add('hidden'); overlay.style.display = 'none'; }
    showSection('profile');
  } else if (!isCommunity && u) {
    document.getElementById('loginOverlay').classList.add('hidden');
    document.getElementById('loginOverlay').style.display = 'none';
    var badge = document.getElementById('loginBadge');
    var nameEl = document.getElementById('loginName');
    if (badge) badge.style.display = 'flex';
    if (nameEl) nameEl.textContent = u.name;
    var coachEl = document.getElementById('loginCoach');
    if (coachEl && u.coach) {
      coachEl.style.display = 'inline-flex';
      coachEl.innerHTML = ic('user-check', 12) + ' Coach: ' + esc(u.coach);
    }
  }

  if (sharedName) {
    // Already handled above
  } else if (!isCommunity) {
    if (u) {
      showSection('dashboard');
    } else {
      document.getElementById('loginOverlay').classList.remove('hidden');
    }
  } else {
    renderFooter();
    showSection('team');
  }

  initParticles();
  initRipple();
  hideLoading();
  if (typeof lucide !== "undefined") renderIcons();
})();

// ========== SUPABASE INIT ==========
(async function(){
  try{
    if(!db&&typeof supabase!=='undefined')db=supabase.createClient(SB,ANON);
    if(!db)return;
    var {error}=await db.from('members').select('id',{count:'exact',head:true});
    if(!error){
      var f=await Promise.all([
        db.from('members').select('*'),
        db.from('academy').select('*'),
        db.from('coaches').select('*'),
        db.from('groups').select('*'),
        db.from('group_coaches').select('*'),
        db.from('scrims').select('*').order('date',{ascending:false}),
      ]);
      if(f[0].data&&f[0].data.length){
        var localMembers=(DATA.members||[]).reduce(function(acc,m){acc[m.name]=m;return acc},{});
        DATA.members=f[0].data.map(function(supM){
          var localM=localMembers[supM.name];
          if(localM){(window.EXTRAS_KEYS||[]).forEach(function(k){if(localM[k]!==undefined&&localM[k]!==null&&localM[k]!=='')supM[k]=localM[k]})}
          return supM;
        });
      }
      if(f[1].data)DATA.academy=f[1].data;
      if(f[2].data)DATA.coaches=f[2].data;
      if(f[3].data)DATA.groups=f[3].data;
      if(f[4].data)DATA.group_coaches=f[4].data;
      if(f[5].data&&f[5].data.length){
        var localScrims=(DATA.scrims||[]).reduce(function(acc,s){acc[s.id]=s;return acc},{});
        DATA.scrims=f[5].data.map(function(x){
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
      saveLocal(DATA);
      // Realtime subscription
      if(!rtChannel){try{
        rtChannel=db.channel('public-changes')
          .on('postgres_changes',{event:'*',schema:'public',table:'members'},function(payload){
            if(!DATA.members)return;
            if(payload.eventType==='DELETE'){DATA.members=DATA.members.filter(function(m){return m.id!==payload.old.id})}
            else if(payload.new){
              var idx=DATA.members.findIndex(function(m){return m.id===payload.new.id});
              if(idx>=0){
                var old=DATA.members[idx];
                DATA.members[idx]=payload.new;
                (window.EXTRAS_KEYS||[]).forEach(function(k){if(old[k])DATA.members[idx][k]=old[k]});
              }else{DATA.members.push(payload.new)}
            }
    saveLocalNow(DATA);
          }).subscribe();
      }catch(e){console.log('Realtime:',e)}}
      var ds=document.getElementById('dbStatus');
      if(ds){ds.innerHTML='<i data-lucide="wifi" style="width:12px;height:12px;vertical-align:middle"></i> <span>conectado</span>';ds.className='online';if(typeof lucide!=="undefined")renderIcons()}
    }
  }catch(e){console.log('DB unavailable:',e)}
})();
