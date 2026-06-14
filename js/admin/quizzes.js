// ========== ADMIN QUIZZES ==========
var _quizQCounter=0;

function renderSection_quizzes(){
  var gid=(document.getElementById('adminGF')&&document.getElementById('adminGF').value)||'';
  var items=filterByCurrentCoach(DATA.quizzes||[]);
  if(gid)items=items.filter(function(i){return i.group_id===gid});
  var fh=adminGroupFilterHTML(gid,'renderSection_quizzes()');
  var btn='<button class="btn-primary" onclick="quizForm(null)" style="margin-bottom:14px;font-size:13px">'+ic('plus',14)+' Nuevo Quiz</button>';
  document.getElementById('adminContent').innerHTML=fh+adminTable(items,['Título','Preguntas','Coach','Grupo'],function(q){
    return '<td>'+esc(q.title)+'</td><td>'+(q.questions||[]).length+'</td><td>'+esc(q.coach||'—')+'</td><td>'+groupName(q.group_id)+'</td><td><div class=" admin-actions"><button onclick="quizForm(\''+q.id+'\')">'+ic('pencil',14)+'</button><button class="del" onclick="delQuiz(\''+q.id+'\')">'+ic('trash-2',14)+'</button></div></td>'},'No hay quizzes',btn,'delQuiz');
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
    '<div class="field"><label for="qf_title">Título</label><input class="input-field" id="qf_title" value="'+esc(f.title)+'"></div>'+
    '<div class="field"><label for="qf_description">Descripción</label><textarea class="input-field" id="qf_description" rows="2">'+esc(f.description||'')+'</textarea></div>'+
    '<div class="field" style="display:none"><label for="qf_group">Grupo</label><select class="input-field" id="qf_group" onchange="reloadCoachDropdown(\'qf_coach\',this.value)"><option value="">General</option>'+(DATA.groups||[]).map(function(g){return'<option value="'+g.id+'"'+(f.group_id===g.id?' selected':'')+'>'+esc(g.name)+'</option>'}).join('')+'</select></div>'+
    '<div class="field"><label for="qf_coach">Coach asignado</label><select class="input-field" id="qf_coach" onchange="setGroupFromCoach(\'qf_group\',\'qf_coach\')"><option value="">Sin coach</option>'+coachOptions(f.coach||'',f.group_id)+'</select></div>'+
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
  saveData(DATA);closeModal();renderSection_quizzes();updateCounts();toast(id?'Quiz actualizado':'Quiz creado');
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
      '<span style="color:#666;font-size:11px">'+(q.correct===j?ic('check',12)+' Correcta':'')+'</span></label>'}).join('')+'</div>'+
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

function delQuiz(id){if(!confirmDel())return;DATA.quizzes=DATA.quizzes.filter(function(q){return q.id!==id});saveData(DATA);renderSection_quizzes();updateCounts();toast('Quiz eliminado');}
