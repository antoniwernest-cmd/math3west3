/* The project owns block state, tap/drag moves, trades and Undo. */
window.ML_BALANCE_ASSESSMENT=(()=>{'use strict';
 function install(){
  const cfg=window.ML_CONFIG;if(!cfg.assessment?.balancePad||!window.ML_ENGINE)return;

  const api=window.ML_AUDIT10_REVISED,rawGet=ML_ENGINE.get.bind(ML_ENGINE),copy=x=>JSON.parse(JSON.stringify(x)),sum=ts=>ts.reduce((n,t)=>n+t.value,0),workTokens=()=>api.state().tokens.filter(t=>t.loc==='work');
  function evidence(){const s=api.state();if(!s.balanceEvidence){const ts=workTokens();s.balanceEvidence={hasManual:ts.length>0,manualModel:ts.length?copy(ts):null,manualOperations:0,automatic:false,choiceValue:null}}return s.balanceEvidence}
  function sides(){const ts=api.state().tokens;return{left:sum(ts.filter(t=>['a','b'].includes(t.loc))),known:sum(ts.filter(t=>t.loc==='known')),missing:sum(workTokens())}}
  ML_ENGINE.get=()=>{const snap=rawGet(),ev=evidence(),counts=ev.manualSides,correct=ev.hasManual&&sum(ev.manualModel||[])===cfg.review.answer&&!!counts&&counts.left===cfg.review.a+cfg.review.b&&counts.known+counts.missing===counts.left;return{...snap,assessment:{...snap.assessment,modelCorrect:correct,model:correct?'Complete':'Needs review'},response:{...snap.response,balanceEvidence:{...copy(ev),displayTotal:sum(workTokens()),sides:sides()}}}};
  function fromChoice(value){if(!Number.isInteger(value)||value<0)return;api.action(()=>{const s=api.state(),old=copy(evidence());s.tokens=s.tokens.filter(t=>t.loc!=='work');let n=value;s.balanceAutoSerial||=0;for(const v of[100,10,1])while(n>=v){s.tokens.push({id:'balance-auto-'+s.balanceAutoSerial++,value:v,loc:'work',home:'work'});n-=v}s.balanceEvidence={...old,automatic:true,choiceValue:value}})}
  function manualChange(before,force=false){if(!before)return;const ts=workTokens();if(!force&&JSON.stringify(before)===JSON.stringify(ts))return;const ev=evidence();Object.assign(ev,{hasManual:true,manualModel:copy(ts),manualSides:sides(),manualOperations:(ev.manualOperations||0)+1,automatic:false});ML_REVISED.setDone(api.state().done);parent.postMessage({type:'ml-state',id:cfg.id,payload:ML_ENGINE.get()},'*')}
  document.addEventListener('ml-block-operation',e=>{const d=e.detail;if(d.before&&d.after)manualChange(d.before.filter(t=>t.loc==='work'),true)});
  let interaction=null,drag=null;
  document.addEventListener('click',e=>{const b=e.target.closest('button');interaction=null;if(!b||b.disabled)return;if(b.hasAttribute('data-answer'))interaction={choice:+b.dataset.answer};else if(b.hasAttribute('data-bank')||b.hasAttribute('data-piece')||b.hasAttribute('data-split')||b.hasAttribute('data-group'))interaction={before:copy(workTokens())}},true);
  document.addEventListener('click',()=>{const action=interaction;interaction=null;if(!action)return;if(action.choice!==undefined&&String(api.state().answer)===String(action.choice))fromChoice(action.choice);else manualChange(action.before)});
  document.addEventListener('pointerdown',e=>{if(e.target.closest('[data-bank],[data-piece]'))drag={id:e.pointerId,x:e.clientX,y:e.clientY,before:copy(workTokens())}},true);
  document.addEventListener('pointerup',e=>{const d=drag;drag=null;if(d&&d.id===e.pointerId&&Math.hypot(e.clientX-d.x,e.clientY-d.y)>7)requestAnimationFrame(()=>manualChange(d.before))},true);
  const initial=evidence();if(!initial.hasManual&&api.state().answer!==''&&Number.isFinite(+api.state().answer))fromChoice(+api.state().answer);
  let queued=false,side=1;const limit=30;
  const snapshot=()=>ML_ENGINE.get(),tokens=()=>snapshot().response.tokens.filter(t=>t.loc==='work');
  function paint(){queued=false;const root=document.querySelector('.rv-activity'),grid=root?.querySelector('.rv-a8-four');if(!root||!grid)return;document.body.classList.add('assessment-balance');
   const mats=[...grid.querySelectorAll(':scope > .rv-mat, :scope > .balance-answer-column > .rv-mat')],compact=innerWidth<=600,work=root.querySelector('.rv-work'),bank=work.querySelector('.rv-bank'),ts=tokens();
   root.toggleAttribute('data-balance-compact',compact);root.dataset.balanceSide=side;
   work.querySelector('.balance-side-tabs')?.remove();
   mats.forEach((m,i)=>{m.dataset.padColor=['blue','blue','purple','purple'][i];m.classList.add('balance-pad');m.hidden=false;m.setAttribute('aria-label',['Blue first landing pad','Blue second landing pad','Purple known landing pad','Purple missing landing pad'][i]);
    const hasBlocks=!!m.querySelector('[data-piece]');for(const place of m.querySelectorAll('.rv-place'))place.hidden=hasBlocks&&!place.querySelector('[data-piece]');
   });
   const pad=mats[3];pad.classList.add('balance-landing');pad.tabIndex=0;const heading=pad.querySelector('h2');if(heading.firstChild?.nodeType===3)heading.firstChild.textContent='Missing part · ? ';
   let column=grid.querySelector(':scope > .balance-answer-column');if(!column){column=document.createElement('div');column.className='balance-answer-column';grid.append(column)}if(bank&&bank.parentElement!==column)column.prepend(bank);if(pad.parentElement!==column)column.append(pad);
   if(!pad.querySelector('.balance-drop-hint')){const hint=document.createElement('span');hint.className='balance-drop-hint';hint.textContent='Build the missing part here';pad.append(hint)}pad.querySelector('.balance-drop-hint').hidden=ts.length>0;
   let trades=pad.querySelector('.rv-trades');if(!trades){trades=document.createElement('div');trades.className='rv-trades';trades.innerHTML='<button type="button" data-split="work:10" aria-label="Ungroup 1 ten into 10 ones">Ungroup 1 ten</button><button type="button" data-group="work:1" aria-label="Group 10 ones into 1 ten">Group 10 ones</button>';pad.append(trades)}
   trades.querySelector('[data-split]').disabled=!ts.some(t=>t.value===10)||ts.length+9>limit;trades.querySelector('[data-group]').disabled=ts.filter(t=>t.value===1).length<10;
   if(bank){bank.hidden=false;const hint=bank.querySelector(':scope > span'),label='Tap to add · drag to the purple pad · return here to remove';if(hint.textContent!==label)hint.textContent=label;for(const b of bank.querySelectorAll('[data-bank]')){const v=+b.dataset.bank;b.hidden=v>10;b.disabled=ts.length>=limit;b.title=ts.length>=limit?'Group blocks to make room':'Tap or drag to the landing pad'}}
   const header=root.querySelector('header');if(!header.querySelector('.balance-goal')){const p=document.createElement('p');p.className='balance-goal';p.textContent='Grade '+cfg.grade+' · '+cfg.curriculumAlignment.codes.join(', ')+' · I can build equal totals on both sides.';header.append(p)}
   const prompt=header.querySelector('p');if(!prompt.dataset.balanceEquation){prompt.dataset.balanceEquation='true';prompt.innerHTML='<span class="balance-blue-text">'+cfg.review.a+' + '+cfg.review.b+'</span> = <span class="balance-orange-text">'+cfg.review.known+' + ?</span>'}
  }
  function schedule(){if(!queued){queued=true;requestAnimationFrame(paint)}}
  document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.balanceSide!==undefined){side=+b.dataset.balanceSide;paint();dispatchEvent(new Event('resize'));return}if(b.dataset.bank&&tokens().length>=limit){e.preventDefault();e.stopImmediatePropagation()}},true);
  new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});addEventListener('resize',schedule);paint();
 }
 const css=`
 .assessment-balance .rv-activity>header h1,.assessment-balance .rv-equation{display:none!important}
 .assessment-balance .rv-activity>header p{font-size:23px!important;padding:4px 8px!important;line-height:1.15!important}
 .assessment-balance .rv-activity>header>div{font-size:15px!important;line-height:1.2!important}
 .assessment-balance .rv-activity>header .balance-goal{font-size:12px!important;padding:2px 6px!important;background:#edf2df!important}
 .assessment-balance .rv-work{gap:6px!important}.assessment-balance .rv-a8-four{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;grid-template-rows:minmax(0,1fr)!important;gap:7px!important;flex:1!important;min-height:0!important}
 .assessment-balance .rv-mat{padding:6px!important;gap:4px!important}.assessment-balance .rv-mat h2{font-size:19px!important;line-height:1.1!important}.assessment-balance .rv-place>b{font-size:15px!important}.assessment-balance .rv-mat:before{font-size:11px;font-weight:700;line-height:1;flex:none}
 .assessment-balance .balance-blue{background:#eef6fb!important;border-color:#a6c6df!important}.assessment-balance .balance-blue:before{content:'Blue side';color:#245a80}.assessment-balance .balance-orange{background:#fff1e2!important;border-color:#dcb791!important}.assessment-balance .balance-orange:before{content:'Orange side';color:#8e4b1f}.assessment-balance .balance-blue-text{color:#245a80}.assessment-balance .balance-orange-text{color:#8e4b1f}
 .assessment-balance .balance-blue .rv-face{--ml-block-color:rgb(65,145,210)!important;--ml-block-top:rgb(158,207,242)!important;--ml-block-side:rgb(31,91,147)!important;background-color:rgb(65,145,210)!important}.assessment-balance .balance-blue .rv-face>i{background-color:rgb(65,145,210)!important;border-color:rgb(39,104,160)!important}
 .assessment-balance .balance-orange .rv-face,.assessment-balance .rv-bank .rv-face{--ml-block-color:rgb(222,145,80)!important;--ml-block-top:rgb(247,201,160)!important;--ml-block-side:rgb(158,86,37)!important;background-color:rgb(222,145,80)!important}.assessment-balance .balance-orange .rv-face>i,.assessment-balance .rv-bank .rv-face>i{background-color:rgb(222,145,80)!important;border-color:rgb(158,86,37)!important}
 .assessment-balance .balance-landing{border:2px dashed #b06a32!important;position:relative}.assessment-balance .balance-landing:focus-visible{outline:3px solid #32715c;outline-offset:-4px}.assessment-balance .balance-drop-hint{position:absolute;left:8px;right:8px;top:50%;text-align:center;font-size:13px;color:#7a5c40;pointer-events:none}.assessment-balance .balance-drop-hint[hidden]{display:none!important}
 .assessment-balance .rv-bank{padding:4px 7px!important;gap:9px!important;min-height:46px!important;background:#fff1e2!important;border-color:#dcb791!important}.assessment-balance .rv-bank>strong{font-size:16px!important}.assessment-balance .rv-bank>span{font-size:12px!important}.assessment-balance .rv-bank button{min-height:34px!important;padding:2px 6px!important}.assessment-balance .rv-bank .rv-face{--u:3.4px!important}
 .assessment-balance .rv-trades{gap:4px!important}.assessment-balance .rv-trades button{font-size:11px!important;min-height:28px!important;padding:3px 5px!important}
 .assessment-balance .balance-side-tabs{display:flex;gap:5px;flex:none}.assessment-balance .balance-side-tabs button{flex:1;min-height:30px;font-size:12px;padding:3px 4px}.assessment-balance .balance-side-tabs[hidden],.assessment-balance .rv-mat[hidden],.assessment-balance .rv-bank[hidden],.assessment-balance .rv-place[hidden],.assessment-balance .rv-bank button[hidden]{display:none!important}
 .assessment-balance [data-balance-compact] .rv-a8-four{grid-template-columns:repeat(2,minmax(0,1fr))!important}
 .assessment-balance [data-balance-compact][data-balance-side="1"] .rv-a8-four{grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr)!important}
 @media(max-width:600px){.assessment-balance .rv-block{min-height:24px!important}.assessment-balance .rv-trades{flex-wrap:nowrap!important}.assessment-balance .rv-trades button{flex:1;min-width:0;font-size:10px!important;padding:2px!important}}
 @media(max-width:600px){.assessment-balance .rv-activity>header p{font-size:19px!important}.assessment-balance .rv-activity>header>div{font-size:12px!important}.assessment-balance .rv-activity>header .balance-goal{font-size:10px!important}.assessment-balance .rv-bank>span{display:none!important}.assessment-balance .rv-bank{gap:6px!important}.assessment-balance .rv-mat h2{font-size:16px!important}.assessment-balance .rv-place>b{font-size:13px!important}.assessment-balance .rv-mat output{font-size:12px!important;padding:2px 4px!important}.assessment-balance .rv-block{min-width:18px!important}}
 @media(max-height:360px){.assessment-balance .rv-activity{grid-template-rows:auto minmax(0,1fr) auto auto!important}.assessment-balance .rv-activity>header{display:grid!important}.assessment-balance .rv-activity>header p{font-size:16px!important;padding:2px 5px!important}.assessment-balance .rv-activity>header>div{font-size:10px!important}.assessment-balance .rv-activity>header .balance-goal{display:none!important}.assessment-balance .rv-bank{min-height:30px!important}.assessment-balance .rv-bank .rv-face{--u:2px!important}.assessment-balance .rv-bank button{min-height:26px!important}.assessment-balance .rv-mat h2{font-size:14px!important}.assessment-balance .rv-mat:before{display:none!important}.assessment-balance .rv-place>b{font-size:11px!important}.assessment-balance .rv-trades button{min-height:23px!important;font-size:10px!important}}
 `;
 const fourPads=`
 .assessment-balance .balance-answer-column{display:flex;flex-direction:column;gap:6px;min-width:0;min-height:0}
 .assessment-balance .balance-answer-column>.rv-bank{display:flex;flex-wrap:wrap;justify-content:center;flex:none;gap:5px!important;padding:4px!important}
 .assessment-balance .balance-answer-column>.rv-bank>strong{font-size:13px!important}
 .assessment-balance .balance-answer-column>.rv-bank>span{display:none!important}
 .assessment-balance .balance-answer-column>.rv-bank button{min-width:44px;min-height:36px!important}
 .assessment-balance .balance-answer-column>.balance-landing{flex:1;min-height:0}
 .assessment-balance .balance-pad{position:relative;border:2px dashed var(--pad-edge)!important;background:var(--pad-bg)!important}
 .assessment-balance [data-pad-color=blue]{--pad-edge:#3279ae;--pad-bg:#edf6ff;--pad-front:#4191d2;--pad-top:#9ecff2;--pad-side:#1f5b93}
 .assessment-balance [data-pad-color=teal]{--pad-edge:#287d70;--pad-bg:#e7f6ee;--pad-front:#3ba58d;--pad-top:#9fe0ca;--pad-side:#236d5c}
 .assessment-balance [data-pad-color=gold]{--pad-edge:#aa751e;--pad-bg:#fff3d8;--pad-front:#e7ae39;--pad-top:#ffe3a1;--pad-side:#a6701b}
 .assessment-balance [data-pad-color=purple]{--pad-edge:#8755a7;--pad-bg:#f5ecff;--pad-front:#a46dcd;--pad-top:#d6b7ee;--pad-side:#663c88}
 .assessment-balance .balance-pad:before{content:attr(data-pad-color) ' landing pad';text-transform:capitalize;color:var(--pad-edge)}.assessment-balance .balance-orange-text{color:#8755a7!important}
 .assessment-balance .balance-pad .rv-face{--ml-block-color:var(--pad-front)!important;--ml-block-top:var(--pad-top)!important;--ml-block-side:var(--pad-side)!important;background-color:var(--pad-front)!important}
 .assessment-balance .balance-pad .rv-face>i{background-color:var(--pad-front)!important;border-color:var(--pad-side)!important}
 .assessment-balance .rv-bank{background:#f5ecff!important;border-color:#bc9ed0!important}
 .assessment-balance .rv-bank .rv-face{--ml-block-color:#a46dcd!important;--ml-block-top:#d6b7ee!important;--ml-block-side:#663c88!important;background-color:#a46dcd!important}
 .assessment-balance .rv-bank .rv-face>i{background-color:#a46dcd!important;border-color:#663c88!important}
 .assessment-balance [data-balance-compact] .rv-a8-four,.assessment-balance [data-balance-compact][data-balance-side="1"] .rv-a8-four{grid-template-columns:repeat(2,minmax(0,1fr))!important;grid-template-rows:repeat(2,minmax(0,1fr))!important}
 @media(max-width:600px){.assessment-balance .rv-mat{padding:4px!important;gap:2px!important}.assessment-balance .rv-mat h2{font-size:13px!important}.assessment-balance .balance-pad:before{font-size:9px!important}.assessment-balance .rv-place>b{font-size:10px!important}.assessment-balance .balance-drop-hint{font-size:11px;top:44%}.assessment-balance .rv-trades{gap:2px!important}.assessment-balance .rv-trades button{min-height:24px!important;font-size:9px!important}.assessment-balance .rv-mat output{font-size:10px!important}.assessment-balance .rv-activity>header>div{font-size:11px!important}.assessment-balance .balance-answer-column{gap:3px}.assessment-balance .balance-answer-column>.rv-bank{flex-wrap:nowrap;padding:2px!important;gap:3px!important;min-height:34px!important}.assessment-balance .balance-answer-column>.rv-bank>strong{font-size:9px!important}.assessment-balance .balance-answer-column>.rv-bank button{min-width:34px;min-height:28px!important;font-size:12px!important}.assessment-balance .balance-answer-column>.rv-bank .rv-face{--u:2.3px!important}}
 `;
 function inject(html,cfg){return cfg.assessment?.balancePad?html.replace('</body>','<style>'+css+fourPads+'</style><script>('+install.toString()+')();<\/script></body>'):html}
 return{inject};
})();
