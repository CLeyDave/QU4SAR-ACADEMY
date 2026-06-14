// ========== ADMIN DRAFT MGMT ==========

var DRAFT_STATUSES=['scouted','trial','drafted','signed','released'];
var DRAFT_STATUS_LABELS={scouted:'Scout',trial:'Prueba',drafted:'Drafteado',signed:'Fichado',released:'Liberado'};
var DRAFT_STATUS_COLORS={scouted:'#8b5cf6',trial:'#fbbf24',drafted:'#4ade80',signed:'#34d399',released:'#f43f5e'};
var DRAFT_ICONS={scouted:'search',trial:'clock',drafted:'check-circle',signed:'award',released:'x-circle'};

function countDraft(){return(DATA.draft_picks||[]).length}

function renderSection_draft(){
  var drafts=DATA.draft_picks||[];
  var seasons=[];
  drafts.forEach(function(d){if(seasons.indexOf(d.season)<0)seasons.push(d.season)});
  seasons.sort();
  var currentSeason=document.getElementById('draftSeasonFilter')?document.getElementById('draftSeasonFilter').value:(seasons.length?seasons[seasons.length-1]:'');
  var statusFilter=document.getElementById('draftStatusFilter')?document.getElementById('draftStatusFilter').value:'';
  var filtered=drafts.filter(function(d){return(!currentSeason||d.season===currentSeason)&&(!statusFilter||d.status===statusFilter)});
  var btn='<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:14px">'+
    '<button class="btn-primary" onclick="draftForm(null)" style="font-size:13px">'+ic('plus',14)+' Nuevo Pick</button>'+
    '<select class="input-field" id="draftSeasonFilter" onchange="renderSection_draft()" style="width:auto;min-width:120px;padding:6px 10px;font-size:13px">'+
    '<option value="">Todas las temporadas</option>';
  seasons.forEach(function(s){btn+='<option value="'+esc(s)+'" '+(s===currentSeason?'selected':'')+'>'+esc(s)+'</option>'});
  btn+='</select>'+
    '<select class="input-field" id="draftStatusFilter" onchange="renderSection_draft()" style="width:auto;min-width:120px;padding:6px 10px;font-size:13px">'+
    '<option value="">Todos los estados</option>';
  DRAFT_STATUSES.forEach(function(s){btn+='<option value="'+s+'" '+(s===statusFilter?'selected':'')+'>'+esc(DRAFT_STATUS_LABELS[s])+'</option>'});
  btn+='</select></div>';
  document.getElementById('adminContent').innerHTML=adminTable(filtered,['Miembro','Temporada','Estado','Scout','Notas'],function(d){
    var member=(DATA.members||[]).find(function(m){return m.id===d.member_id});
    var scout=null;
    if(d.picked_by){scout=(DATA.members||[]).find(function(m){return m.id===d.picked_by})}
    return '<td>'+(member?esc(member.name):'<span style="color:#555">'+esc(d.member_id)+'</span>')+'</td>'+
      '<td><span style="font-size:12px">'+esc(d.season)+'</span></td>'+
      '<td><span style="color:'+(DRAFT_STATUS_COLORS[d.status]||'#888')+'">'+ic(DRAFT_ICONS[d.status]||'circle',12)+' '+esc(DRAFT_STATUS_LABELS[d.status]||d.status)+'</span></td>'+
      '<td>'+(scout?esc(scout.name):'<span style="color:#555">—</span>')+'</td>'+
      '<td style="font-size:12px;color:#888;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(d.notes||'—')+'</td>'+
      '<td><div class=" admin-actions">'+
        '<button onclick="draftForm(\''+d.id+'\')" title="Editar">'+ic('pencil',14)+'</button>'+
        '<button class="del" onclick="delDraft(\''+d.id+'\')" title="Eliminar">'+ic('trash-2',14)+'</button>'+
      '</div></td>'
  },'No hay picks de draft',btn,'delDraft');
}

function draftForm(id){
  var item=id?(DATA.draft_picks||[]).find(function(d){return d.id===id}):null;
  var isNew=!item;
  var f=item?{...item}:{member_id:'',season:'2026',status:'scouted',notes:'',picked_by:''};
  var memberOpts='<option value="">Seleccionar miembro</option>';
  (DATA.members||[]).forEach(function(m){
    memberOpts+='<option value="'+esc(m.id)+'" '+(m.id===f.member_id?'selected':'')+'>'+esc(m.name)+'</option>';
  });
  var scoutOpts='<option value="">Nadie (sin scout asignado)</option>';
  (DATA.members||[]).forEach(function(m){
    scoutOpts+='<option value="'+esc(m.id)+'" '+(m.id===f.picked_by?'selected':'')+'>'+esc(m.name)+'</option>';
  });
  var statusOpts='';
  DRAFT_STATUSES.forEach(function(s){
    statusOpts+='<option value="'+s+'" '+(s===f.status?'selected':'')+'>'+esc(DRAFT_STATUS_LABELS[s])+'</option>';
  });
  openModal('<button class="modal-close" onclick="closeModal()">'+ic('x',16)+'</button><h3>'+(item?'Editar':'Nuevo')+' Pick de Draft</h3>'+
    '<div class="field"><label for="df_member">Miembro</label><select class="input-field" id="df_member">'+memberOpts+'</select></div>'+
    '<div class="grid-2"><div class="field"><label for="df_season">Temporada</label><input class="input-field" id="df_season" value="'+esc(f.season)+'"></div>'+
    '<div class="field"><label for="df_status">Estado</label><select class="input-field" id="df_status">'+statusOpts+'</select></div></div>'+
    '<div class="field"><label for="df_scout">Scout asignado</label><select class="input-field" id="df_scout">'+scoutOpts+'</select></div>'+
    '<div class="field"><label for="df_notes">Notas</label><textarea class="input-field" id="df_notes" rows="3">'+esc(f.notes||'')+'</textarea></div>'+
    '<button class="btn-primary" onclick="saveDraft(\''+(id||'')+'\')" style="width:100%;justify-content:center;margin-top:8px">'+ic('save',16)+' Guardar</button>');
}

function saveDraft(id){
  var obj={
    member_id:document.getElementById('df_member').value,
    season:document.getElementById('df_season').value,
    status:document.getElementById('df_status').value,
    notes:document.getElementById('df_notes').value,
    picked_by:document.getElementById('df_scout').value||null
  };
  if(!obj.member_id){toast('Selecciona un miembro','error');return}
  if(!DATA.draft_picks)DATA.draft_picks=[];
  if(!id){
    obj.id=uid();
    DATA.draft_picks.push(obj);
  }else{
    var idx=DATA.draft_picks.findIndex(function(d){return d.id===id});
    if(idx>=0)DATA.draft_picks[idx]={...DATA.draft_picks[idx],...obj};
  }
  saveLocal(DATA);
  closeModal();
  renderSection_draft();
  toast('Pick de draft '+(id?'actualizado':'creado'),'ok');
}

function delDraft(id){
  if(!confirmDel())return;
  DATA.draft_picks=(DATA.draft_picks||[]).filter(function(d){return d.id!==id});
  saveLocal(DATA);
  renderSection_draft();
  toast('Pick eliminado','ok');
}
