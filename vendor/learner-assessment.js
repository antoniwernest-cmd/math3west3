/* Teacher judgements stay separate from the learner's automatic answer checks. */
window.ML_LEARNER_ASSESSMENT=(()=>{
 'use strict';
 const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function result(record={}){
  const a=record.snapshot?.assessment,check=record.lastCheck;
  const checked=check&&(!a?.signature||check.signature===a.signature)?check:a?.checked?a:null;
  const partial=a?.partAssessment;const automatic=partial?.checked&&partial.total>1?(partial.correct+' of '+partial.total+' parts correct'+(a.correct?'; complete':'; review remaining parts')):checked?(checked.correct?'Correct':checked.answerCorrect?'Answer correct; model needs work':'Not yet correct'):'Not checked';
  const t=record.teacher||{},assessed=!!(t.savedAt||['level','support','type','model','final','evidence'].some(k=>t[k]));
  const stale=!!(assessed&&t.signature&&t.signature!==(a?.signature||'no-work'));
  const override=!stale&&['correct','review'].includes(t.override)?t.override:'';
  return {automatic,assessed,stale,override,decision:override?(override==='correct'?'Correct (teacher override)':'Needs review (teacher override)'):assessed?(t.final||'Recorded'):'Not assessed'};
 }
 function open(api){
  api.save();api.stop();
  let kind=api.kind||'classwork',day=api.day??0,set=api.set??0,index=0;
  const drafts=new Map(),days=()=> (kind==='classwork'?window.ML_CLASSWORK:(api.homework||window.ML_HOMEWORK)).grades[api.grade];
  const questions=()=>api.single?[api.single]:(kind==='classwork'?days()[day].sets[set].questions:days()[day].questions).map(e=>api.catalog.find(q=>q.id===e.id));
  if(api.question){const i=questions().findIndex(q=>q.id===api.question.id);if(i>=0)index=i}
  const $=id=>document.getElementById(id);
  function remember(){if(!$('assessmentForm'))return;const values={};document.querySelectorAll('[data-learner-assessment]').forEach(e=>values[e.dataset.learnerAssessment]=e.type==='checkbox'?e.checked:e.value);drafts.set(questions()[index].id,values)}
  function draw(){
   const qs=questions(),q=qs[index],r=api.record(q),saved=r.teacher||{},t=drafts.get(q.id)||{...saved,override:!!saved.override},a=result(r),assessed=qs.filter(x=>result(api.record(x)).assessed).length;
   const choice=(key,label,values)=>'<label>'+label+'<select data-learner-assessment="'+key+'">'+['',...values].map(v=>'<option value="'+safe(v)+'" '+(t[key]===v?'selected':'')+'>'+safe(v||'Not recorded')+'</option>').join('')+'</select></label>';
   const scope=api.single?q.groupTitle:(kind==='classwork'?'Classwork':'Homework')+' · '+days()[day].label+(kind==='classwork'?' · Set '+(set+1):'');
   api.modal('Assess student work','<p class="assessment-identity"><strong>'+safe(api.label)+'</strong> · '+(api.grade===1?'Grade 1':api.grade===2?'Excite':'Inspire')+' · Grade '+api.grade+' · '+safe(q.pageCode||'')+'</p>'+
    (api.single?'':'<div class="assessment-scope"><label>Day<select id="assessmentDay">'+days().map((d,i)=>'<option value="'+i+'" '+(day===i?'selected':'')+'>'+safe(d.label)+'</option>').join('')+'</select></label>'+(kind==='classwork'?'<label>Class set<select id="assessmentSet">'+[0,1,2,3].map(i=>'<option value="'+i+'" '+(set===i?'selected':'')+'>Set '+(i+1)+'</option>').join('')+'</select></label>':'')+'<span>'+assessed+' / '+qs.length+' assessed</span></div>')+
    '<div class="assessment-question-picker"><button id="assessmentPrev" aria-label="Previous assessment page" '+(index===0?'disabled':'')+'>←</button><label>Question<select id="assessmentQuestion">'+qs.map((x,i)=>'<option value="'+i+'" '+(i===index?'selected':'')+'>'+(i+1)+'. '+safe(x.pageCode||'')+' · '+safe(x.title)+'</option>').join('')+'</select></label><button id="assessmentNext" aria-label="Next assessment page" '+(index===qs.length-1?'disabled':'')+'>→</button></div>'+
    '<p class="assessment-auto">Automatic check: <strong>'+safe(a.automatic)+'</strong> · '+(r.done?'Finished':'In progress')+(a.stale?'<br><strong>Student changed this work after it was assessed. Review it again.</strong>':'')+'</p><p class="assessment-response">'+safe(window.ML_RESPONSE_SUMMARY(q,r.snapshot)).replaceAll('\n',' · ')+'</p>'+
    '<div id="assessmentForm" class="teacher-grid">'+choice('level','Achievement',['N','1','2','3','4'])+choice('support','Support',['Independent','Prompt','Model','Read aloud','Access support'])+choice('type','Assessment type',['Formative','Summative'])+'<label>Date<input type="date" data-learner-assessment="date" value="'+safe(t.date||new Date().toLocaleDateString('en-CA'))+'"></label>'+choice('final','Teacher decision',['Not answered','In progress','Correct','Review'])+'<label>Model / steps evidence<input maxlength="200" data-learner-assessment="model" value="'+safe(t.model||'')+'"></label><label class="wide">Comment / next step<textarea maxlength="600" rows="2" data-learner-assessment="evidence">'+safe(t.evidence||'')+'</textarea></label><label class="wide assessment-override"><input type="checkbox" data-learner-assessment="override" '+(t.override?'checked':'')+'> Use my decision instead of the automatic check</label></div><p id="assessmentMessage" role="status">'+safe(scope)+' · '+safe(q.codes.join(' · '))+'</p>',
    '<label class="assessment-code">Assessment / override code<input id="assessmentCode" type="password" inputmode="numeric" autocomplete="off" maxlength="3" aria-describedby="assessmentMessage"></label><button id="assessmentView">View student page</button><button id="assessmentExcel">↓ '+(api.single?'Page':'Set')+' Excel</button><button id="assessmentSave" class="primary">Save assessment</button>');
   $('modal').dataset.assessment='true';
   if(!api.single){$('assessmentDay').onchange=e=>{remember();day=+e.target.value;index=0;draw()};if($('assessmentSet'))$('assessmentSet').onchange=e=>{remember();set=+e.target.value;index=0;draw()}}
   const move=i=>{remember();index=i;draw()};$('assessmentQuestion').onchange=e=>move(+e.target.value);$('assessmentPrev').onclick=()=>move(index-1);$('assessmentNext').onclick=()=>move(index+1);
   $('assessmentView').onclick=()=>{remember();$('modal').close();api.visit({kind,week:api.week,day,set,question:q,single:!!api.single})};
   $('assessmentExcel').onclick=()=>api.exportWork(api.single?{questionIds:[q.id],assessmentPages:true}:{weekKind:kind,week:api.week,day,set:kind==='classwork'?set:null,assessmentPages:true});
   $('assessmentSave').onclick=()=>{
    const code=$('assessmentCode');if(code.value!=='259'){$('assessmentMessage').textContent='Enter the correct assessment / override code to save.';code.setAttribute('aria-invalid','true');code.value='';code.focus();return}
    remember();const draft=drafts.get(q.id);
    if(draft.override&&!['Correct','Review'].includes(draft.final)){$('assessmentMessage').textContent='Choose Correct or Review before overriding the automatic check.';return}
    const current=api.record(q),before=structuredClone(current.teacher||{}),signature=current.snapshot?.assessment?.signature||'no-work';
    current.teacher={...before,...draft,pageCode:q.pageCode,override:draft.override?(draft.final==='Correct'?'correct':'review'):'',signature,savedAt:new Date().toISOString()};
    current.teacherHistory=[...(current.teacherHistory||[]),{at:current.teacher.savedAt,previous:before}];
    if(!api.persist()){current.teacher=before;current.teacherHistory.pop();$('assessmentMessage').textContent='The assessment could not be saved. Download a backup and try again.';return}
    drafts.delete(q.id);api.onSaved?.();draw();$('assessmentMessage').textContent='Assessment saved for question '+(index+1)+'.';
   };
  }
  draw();
 }
 return {result,open};
})();
