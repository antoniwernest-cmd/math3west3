/* Keep Math Landing's original token IDs, drag engine and exchange operations. */
window.ML_SUBTRACTION_ASSESSMENT=(()=>{'use strict';
 function install(){
  const cfg=window.ML_CONFIG;if(cfg.review?.type!=='subtract'||!window.ML_ENGINE)return;
  const key='math-landing:assessment:actions:'+cfg.student+':'+cfg.id,empty=()=>({ungroup10:0,group10:0,taps:0,drags:0});let actions=empty(),drag=null,queued=false;
  try{actions={...empty(),...JSON.parse(localStorage.getItem(key)||'null')}}catch{}
  function remember(){try{localStorage.setItem(key,JSON.stringify(actions))}catch{}}
  const get=ML_ENGINE.get.bind(ML_ENGINE);ML_ENGINE.get=()=>{const s=get(),record=window.ML_AUDIT10_REVISED?.state().assessmentActions||empty();s.response.assessmentActions={...record};s.assessment.processChecks={ungroupTen:record.ungroup10>0};return s};
  function emit(){parent.postMessage({type:'ml-state',id:cfg.id,payload:ML_ENGINE.get()},'*')}
  function paint(){queued=false;const root=document.querySelector('.rv-activity');if(!root)return;document.body.classList.add('assessment-subtraction');
   const header=root.querySelector('header');if(header&&!header.querySelector('.subtraction-goal')){const p=document.createElement('p');p.className='subtraction-goal';p.textContent='Grade '+cfg.curriculumAlignment.grade+' · '+cfg.curriculumAlignment.codes.join(', ')+' · Subtract and show your thinking.';header.append(p)}
   if(header&&!header.querySelector('.subtraction-short-directions')){const hint=document.createElement('div');hint.className='subtraction-short-directions';hint.textContent=cfg.review.a+' − '+cfg.review.b+' = ? Choose your answer.';header.append(hint)}
   for(const b of root.querySelectorAll('[data-split$=":10"]')){if(b.textContent!=='Ungroup 1 ten')b.textContent='Ungroup 1 ten';b.title='Exchange one ten for ten ones';b.setAttribute('aria-label','Ungroup 1 ten into 10 ones')}
   for(const b of root.querySelectorAll('[data-group$=":1"]')){if(b.textContent!=='Group 10 ones')b.textContent='Group 10 ones';b.title='Exchange ten ones for one ten';b.setAttribute('aria-label','Group 10 ones into 1 ten')}
   const taken=root.querySelector('[data-drop="removed"]');if(taken){taken.setAttribute('aria-label','Taken away: drop blocks here');taken.tabIndex=0}
   const start=root.querySelector('[data-drop="start"]');if(start)start.setAttribute('aria-label','Starting blocks: tap or drag to take away');
  }
  function schedule(){if(!queued){queued=true;requestAnimationFrame(paint)}}
  document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.disabled)return;
   if(b.id==='rvReset'){actions=empty();remember();requestAnimationFrame(emit);return}
   if(b.dataset.split==='start:10'){actions.ungroup10++;remember();requestAnimationFrame(emit);return}
   if(b.dataset.group==='start:1'){actions.group10++;remember();requestAnimationFrame(emit);return}
   if(b.dataset.piece){const id=b.dataset.piece,before=get().response.tokens?.find(t=>t.id===id)?.loc;requestAnimationFrame(()=>{const after=get().response.tokens?.find(t=>t.id===id)?.loc;if(before&&after&&before!==after){actions.taps++;remember();emit()}})}
  },true);
  document.addEventListener('pointerdown',e=>{const b=e.target.closest('[data-piece]');if(b&&!b.disabled)drag={pointer:e.pointerId,id:b.dataset.piece,from:get().response.tokens?.find(t=>t.id===b.dataset.piece)?.loc,x:e.clientX,y:e.clientY}},true);
  document.addEventListener('pointerup',e=>{const d=drag;drag=null;if(!d||e.pointerId!==d.pointer||Math.hypot(e.clientX-d.x,e.clientY-d.y)<7)return;requestAnimationFrame(()=>{const t=get().response.tokens?.find(t=>t.id===d.id);if(t&&t.loc!==d.from){actions.drags++;remember();emit()}})},true);
  new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});paint();emit();
 }
 function inject(html,cfg){if(cfg.review?.type!=='subtract')return html;const css='.assessment-subtraction .rv-activity>header h1{display:none!important}.assessment-subtraction .subtraction-goal{font-size:13px!important;line-height:1.2!important;padding:3px 7px!important;margin:1px 0 0!important;background:#edf2df!important;color:#31533b!important}.assessment-subtraction [data-drop="removed"]{border-style:dashed!important}.assessment-subtraction .rv-trades button{min-width:0}.assessment-subtraction [data-drop="removed"]:focus-visible{outline:3px solid #32715c;outline-offset:-4px}@media(max-width:600px){.assessment-subtraction .rv-mat{padding:6px!important}.assessment-subtraction .rv-trades{display:flex;flex-wrap:wrap;gap:4px!important}.assessment-subtraction .rv-trades button{font-size:11px!important;min-height:31px!important;padding:4px 6px!important}.assessment-subtraction .rv-mat h2{font-size:16px!important}.assessment-subtraction .subtraction-goal{font-size:11px!important}}';
  const short='.assessment-subtraction .subtraction-short-directions{display:none}@media(max-height:360px){.assessment-subtraction .rv-activity{grid-template-rows:auto minmax(0,1fr) auto auto!important}.assessment-subtraction .rv-activity>header{display:grid!important;gap:1px!important}.assessment-subtraction .rv-activity>header>div,.assessment-subtraction .subtraction-goal{display:none!important}.assessment-subtraction .rv-activity>header .subtraction-short-directions{display:block!important;font-size:11px!important;line-height:1.15!important}.assessment-subtraction .rv-activity>header p{font-size:14px!important;padding:2px 5px!important}}';
  return html.replace('</body>','<style>'+css+short+'</style><script>('+install.toString()+')();<\/script></body>');
 }
 return {inject};
})();
