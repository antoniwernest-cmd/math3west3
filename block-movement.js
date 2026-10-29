/* Observe successful moves while retaining Math Landing's native manipulation. */
window.ML_BLOCK_MOVEMENT=(()=>{'use strict';
 function summary(snapshot){const e=snapshot?.response?.blockMovement;if(!e?.recorded)return 'Block movement was not recorded in this saved attempt.';return 'Dragged across pads: '+(e.drags?'Yes ('+e.drags+')':'No')+'. Tapped across pads: '+e.taps+'. Drag directions: first to second '+e.firstToSecond+', second to first '+e.secondToFirst+'.';}
 function install(){
  const cfg=ML_CONFIG,api=window.ML_AUDIT10_REVISED;if(cfg.review?.type!=='add'||!api||!window.ML_ENGINE)return;
  const key='math-landing:assessment:movement:'+cfg.student+':'+cfg.id,empty=()=>({recorded:true,drags:0,taps:0,firstToSecond:0,secondToFirst:0,draggedValue:0,moves:[]});let evidence=empty(),drag=null,ignoreClickUntil=0;
  try{const saved=JSON.parse(localStorage.getItem(key)||'null');if(saved?.recorded)evidence={...empty(),...saved}}catch{}
  const raw=ML_ENGINE.get.bind(ML_ENGINE);ML_ENGINE.get=()=>{const snap=raw();snap.response.blockMovement=structuredClone(evidence);return snap};
  function emit(){parent.postMessage({type:'ml-state',id:cfg.id,payload:ML_ENGINE.get()},'*')}
  function save(){try{localStorage.setItem(key,JSON.stringify(evidence))}catch{}emit()}
  function record(before,after,method){if(!before||!after||before.loc===after.loc||!['a','b'].includes(before.loc)||!['a','b'].includes(after.loc))return;
   if(method==='drag'){evidence.drags++;evidence.draggedValue+=before.value;if(before.loc==='a')evidence.firstToSecond++;else evidence.secondToFirst++}else evidence.taps++;
   evidence.moves.push({method,value:before.value,from:before.loc,to:after.loc,originalColour:before.home||before.loc,at:new Date().toISOString()});evidence.moves=evidence.moves.slice(-100);save();
  }
  const token=id=>api.state().tokens.find(t=>t.id===id);
  document.addEventListener('ml-block-operation',e=>{const d=e.detail;if(d.kind!=='move'||!d.payload.id)return;record(d.before.find(t=>t.id===d.payload.id),d.after.find(t=>t.id===d.payload.id),d.method)});
  document.addEventListener('pointerdown',e=>{const b=e.target.closest('[data-piece]');if(e.button!==0||!b||b.disabled)return;const t=token(b.dataset.piece);if(t&&['a','b'].includes(t.loc))drag={pointer:e.pointerId,before:{...t},x:e.clientX,y:e.clientY}},true);
  document.addEventListener('pointerup',e=>{const d=drag;drag=null;if(!d||d.pointer!==e.pointerId||Math.hypot(e.clientX-d.x,e.clientY-d.y)<7)return;
   ignoreClickUntil=performance.now()+550;const zone=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-drop]')?.dataset.drop;if(!['a','b'].includes(zone)||zone===d.before.loc)return;
   requestAnimationFrame(()=>{let after=token(d.before.id);if(after&&after.loc!==zone){api.action(()=>{const t=token(d.before.id);t.home||=d.before.home||d.before.loc;t.loc=zone});after=token(d.before.id)}if(after?.loc===zone){record(d.before,after,'drag');document.querySelector('[data-assessment-model="'+(zone==='a'?0:1)+'"]')?.click()}});
  });
  document.addEventListener('pointercancel',()=>{drag=null},true);
  window.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.disabled)return;if(b.id==='rvReset'){evidence=empty();requestAnimationFrame(save);return}if(document.body.dataset.blockControlsReady)return;if(!b.dataset.piece)return;if(performance.now()<ignoreClickUntil){e.preventDefault();e.stopImmediatePropagation();return}const before=token(b.dataset.piece);if(before){const saved={...before};requestAnimationFrame(()=>record(saved,token(saved.id),'tap'))}},true);
  emit();
 }
 return{summary,inject:(html,cfg)=>cfg.review?.type==='add'?html.replace('</body>','<script>addEventListener("load",('+install.toString()+'),{once:true});<\/script></body>'):html};
})();
