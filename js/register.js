// ========== REGISTER FORM ==========
// Toggle role checkbox on label click
document.addEventListener('click',function(e){
  var lbl=e.target.closest('.role-opt');
  if(!lbl)return;
  var cb=lbl.querySelector('input[type=checkbox]');
  if(!cb)return;
  cb.checked=!cb.checked;
  lbl.classList.toggle('checked',cb.checked);
});

function submitApp(){
  var btn=document.getElementById('regBtn');
  var msg=document.getElementById('regMsg');
  var name=document.getElementById('reg_name').value.trim();
  if(!name){msg.textContent='El nombre es obligatorio';return}
  var valorant=document.getElementById('reg_valorant').value.trim();
  if(valorant){
    if((DATA.members||[]).find(function(m){return m.name.toLowerCase()===valorant.toLowerCase()})){
      msg.textContent='Ya eres miembro del club. Inicia sesión en el menú.';msg.style.color='#8b5cf6';return
    }
    if((DATA.applications||[]).find(function(a){return a.status==='pending'&&(a.valorant||'').toLowerCase()===valorant.toLowerCase()})){
      msg.textContent='Ya tienes una solicitud pendiente. Espera respuesta.';msg.style.color='#8b5cf6';return
    }
  }
  if(!document.getElementById('reg_terms').checked){
    msg.textContent='Debes aceptar los términos y condiciones';
    msg.style.color='#8b5cf6';return
  }
  btn.disabled=true;btn.innerHTML='Enviando...';
  
  var roles=[];
  document.querySelectorAll('#reg_roles input:checked').forEach(function(cb){roles.push(cb.value)});
  
  var app={
    name:name,
    age:document.getElementById('reg_age').value,
    discord:document.getElementById('reg_discord').value.trim(),
    valorant:document.getElementById('reg_valorant').value.trim(),
    rank:document.getElementById('reg_rank').value,
    main_role:document.getElementById('reg_role').value,
    server:document.getElementById('reg_server').value,
    availability:document.getElementById('reg_avail').value,
    selected_roles:roles,
    objectives:document.getElementById('reg_objectives').value.trim(),
    reason:document.getElementById('reg_reason').value.trim(),
  };
  
  if(!db||!db.from){
    var pending;try{pending=JSON.parse(localStorage.getItem('qsr_pending_apps')||'[]')}catch(e){pending=[]}
    pending.push({...app,id:Date.now().toString(36),status:'pending'});
    localStorage.setItem('qsr_pending_apps',JSON.stringify(pending));
    msg.innerHTML=ic('check-circle',14)+' Solicitud guardada localmente';
    msg.style.color='#8b5cf6';
    resetForm(btn);
    return;
  }
  
  db.from('applications').insert([{...app,status:'pending'}]).then(function(res){
    if(res.error)throw res.error;
    msg.innerHTML=ic('check-circle',14)+' Solicitud enviada con &eacute;xito. Te contactaremos pronto.';
    msg.style.color='#8b5cf6';
    resetForm(btn);
  }).catch(function(err){
    msg.textContent='Error al enviar: '+err.message;
    msg.style.color='#8b5cf6';
    btn.disabled=false;btn.innerHTML=ic('send',16)+' Enviar Solicitud';
    if(typeof lucide!=='undefined')lucide.createIcons();
    setTimeout(function(){msg.textContent=''},5000);
  });
}
function resetForm(btn){
  document.getElementById('registerForm').querySelectorAll('input,select,textarea').forEach(function(el){el.value=''});
  document.querySelectorAll('#reg_roles input').forEach(function(cb){cb.checked=false;cb.closest('.role-opt').classList.remove('checked')});
  btn.disabled=false;btn.innerHTML=ic('send',16)+' Enviar Solicitud';
  if(typeof lucide!=='undefined')lucide.createIcons();
  setTimeout(function(){document.getElementById('regMsg').textContent=''},4000);
}

// ========== NAV LOGIN STATUS ==========
function isLoggedInProxy(){return!!getLogin()}
function showLoginStatus(){
  var badge=document.getElementById('loginBadge');
  var nameEl=document.getElementById('loginName');
  var u=getLogin();
  if(u&&badge&&nameEl){
    badge.style.display='flex';
    nameEl.textContent=u.name;
  }
}

// ========== INIT ==========
(async function(){
  try{
    if(!db){if(typeof supabase==='undefined'){console.log('Supabase SDK not loaded');return}db=supabase.createClient(SB,ANON)}
    var {error}=await db.from('schedule').select('id',{count:'exact',head:true});
    if(!error){
      var fetches=await Promise.all([
        db.from('members').select('*'),
        db.from('applications').select('*'),
        db.from('content').select('*'),
      ]);
      if(fetches[0].data)DATA.members=fetches[0].data;
      if(fetches[1].data)DATA.applications=fetches[1].data;
      if(fetches[2].data){var o={};fetches[2].data.forEach(function(c){o[c.key]=c.value});DATA.content={home:o}}
      saveLocal(DATA);
    }
  }catch(e){console.log('DB unavailable:',e)}
  showLoginStatus();
  initParticles();
  initRipple();
  hideLoading();
})();
