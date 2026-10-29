/* Shared presentation only: keep the question beside its task; retain native state and scoring. */
window.ML_QUESTION_FOCUS=(()=>{'use strict';
 function install(){
  let queued=false;const watched=new WeakSet(),set=(e,k,v)=>{if(e.style.getPropertyValue(k)!==v)e.style.setProperty(k,v,'important')};
  const ro=new ResizeObserver(schedule);
  function paint(){queued=false;
   const prompt=document.querySelector('.rv-activity>header>p:not(.item-goal),#readingPrompt,#questionPrompt,body>header>#prompt');
   if(prompt){prompt.dataset.questionFocusPrompt='true';if(ML_CONFIG.kind==='break'&&ML_CONFIG.value&&!prompt.dataset.focusShortened){prompt.textContent='Break apart '+ML_CONFIG.value+'. Choose the place values.';prompt.dataset.focusShortened='true'}}
   if(ML_CONFIG.assessment?.valueShapes){const directions=document.querySelector('.rv-activity>header>div'),text='Build both ways with different combinations. Drag a shape back to the bank to remove it.';if(directions&&directions.textContent!==text)directions.textContent=text}
   if(ML_CONFIG.assessment?.balancePad){const directions=document.querySelector('.rv-activity>header>div'),text='Choose the missing number. You may move, group or ungroup blocks. Both sides should have the same total.';if(directions&&directions.textContent!==text)directions.textContent=text}
   for(const svg of document.querySelectorAll('.a13-break-model svg.oa-block-picture')){
    if(svg.dataset.focusSvgLayout||svg.querySelector('[data-block-value="100"]'))continue;
    const pieces=[...svg.querySelectorAll('[data-svg-piece]')],rods=pieces.filter(g=>g.querySelector('[data-block-value="10"]')),ones=pieces.filter(g=>g.querySelector('[data-block-value="1"]'));
    if(!rods.length||pieces.length!==svg.querySelectorAll('rect[data-block-value]').length)continue;
    const w=svg.clientWidth,h=svg.clientHeight;if(!w||!h)continue;let best=null;
    for(let rows=1;rows<=rods.length;rows++)for(let oneRows=1;oneRows<=Math.max(1,ones.length);oneRows++){
     const cols=Math.ceil(rods.length/rows),oneCols=Math.ceil(ones.length/oneRows),rw=cols*10+(cols-1)*.6,rh=rows*1.6-.6,ow=oneCols*1.7,oh=oneRows*1.7,W=rw+(ones.length?ow+1.5:0)+2,H=Math.max(rh,oh)+2,u=Math.min(w/W,h/H);
     if(!best||u>best.u)best={rows,cols,oneRows,oneCols,rw,rh,ow,oh,W,H,u};
    }
    if(!best)continue;const b=best;
    const layoutVisual=(g,transform)=>{const inner=document.createElementNS('http://www.w3.org/2000/svg','g');inner.dataset.focusBlockLayout='true';inner.append(...g.childNodes);g.append(inner);inner.setAttribute('transform',transform);const filter=g.getAttribute('filter');if(filter){inner.setAttribute('filter',filter);g.removeAttribute('filter')}g.removeAttribute('transform')};
    for(const [i,g]of rods.entries()){const r=g.querySelector('rect[data-block-value]'),s=1/(+r.getAttribute('width')),x=1+(i%b.cols)*10.6,y=(b.H-b.rh)/2+Math.floor(i/b.cols)*1.6,rx=+r.getAttribute('x'),ry=+r.getAttribute('y'),rw=+r.getAttribute('width');layoutVisual(g,'matrix(0 '+(-s)+' '+s+' 0 '+(x-s*ry)+' '+(y+s*(rx+rw))+')')}
    for(const [i,g]of ones.entries()){const r=g.querySelector('rect[data-block-value]'),s=1/(+r.getAttribute('width')),x=b.rw+2.5+(i%b.oneCols)*1.7+(i%2)*.12,y=(b.H-b.oh)/2+Math.floor(i/b.oneCols)*1.7+(i%3)*.1;layoutVisual(g,'matrix('+s+' 0 0 '+s+' '+(x-s*(+r.getAttribute('x')))+' '+(y-s*(+r.getAttribute('y')))+')')}
    svg.querySelectorAll('[data-place-value-divider]').forEach(e=>e.remove());svg.setAttribute('viewBox','0 0 '+b.W+' '+b.H);svg.dataset.focusSvgLayout='true';
   }
   if(ML_CONFIG.assessment?.colourSubtract){
    document.body.classList.add('question-colour-focus');
    for(const place of document.querySelectorAll('.rv-place[data-place-value="100"]')){place.hidden=!place.querySelector('[data-piece]');set(place,'display',place.hidden?'none':'flex')}
    for(const pv of document.querySelectorAll('.rv-pv'))set(pv,'grid-template-columns','repeat('+[...pv.children].filter(p=>!p.hidden).length+',minmax(0,1fr))');
    for(const area of document.querySelectorAll('.rv-place>.rv-pieces')){
     if(!watched.has(area)){watched.add(area);ro.observe(area)}
     const place=area.parentElement,value=+place.dataset.placeValue,blocks=[...area.querySelectorAll(':scope>.rv-block')];
     if(value===1||!blocks.length||!area.getClientRects().length)continue;
     const width=area.clientWidth-12,height=area.clientHeight-12,gap=7;
     let best={unit:2,horizontal:false};
     for(const horizontal of value===10?[false,true]:[false])for(let u=48;u>=2;u-=.5){
      const fw=(value===100||value===10&&horizontal?10:1)*u,fh=(value===100||value===10&&!horizontal?10:1)*u,bw=Math.max(26,fw+7),bh=Math.max(30,fh+7),cols=Math.floor((width+gap)/(bw+gap));
      if(cols>0&&fw+7<=width&&Math.ceil(blocks.length/cols)*(bh+gap)-gap<=height){if(u>best.unit)best={unit:u,horizontal};break}
     }
     for(const block of blocks){const face=block.querySelector('.rv-face'),u=best.unit,fw=(value===100||value===10&&best.horizontal?10:1)*u,fh=(value===100||value===10&&!best.horizontal?10:1)*u;
      if(!face)continue;set(face,'--u',u+'px');set(face,'width',fw+'px');set(face,'height',fh+'px');
      if(value===10){set(face,'background-image','linear-gradient('+(best.horizontal?'90deg,':'')+'#a7a79b99 1px,transparent 1px)');set(face,'background-size',u+'px '+u+'px')}
      for(const[k,v]of Object.entries({width:Math.max(26,fw+7)+'px',height:Math.max(30,fh+7)+'px','min-width':'0','min-height':'0',padding:'0',margin:'0'}))set(block,k,v);
     }
    }
   }
   document.body.dataset.questionFocusReady='true';
  }
  function schedule(){if(!queued){queued=true;requestAnimationFrame(paint)}}
  new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});ro.observe(document.documentElement);addEventListener('resize',schedule);document.fonts.ready.then(schedule);paint();
 }
 const css=`
 .rv-activity>header{display:flex!important;flex-direction:column!important;gap:4px!important;flex:none!important;text-align:center!important;min-height:0!important}
 .rv-activity>header>h1{order:3!important}.rv-activity>header>.item-goal{order:4!important;background:transparent!important;padding:0!important;font-size:10px!important;line-height:1.2!important}
 .rv-activity>header>p:not(.item-goal),body #readingPrompt,body #questionPrompt,body>header>#prompt{display:block!important;text-align:center!important;font-size:clamp(26px,3vw,40px)!important;font-weight:700!important;line-height:1.18!important;color:#173f37!important;padding:7px 10px!important;margin:0!important;border-radius:10px!important;background:#fff0d8!important}
 .rv-activity>header>div{font-size:15px!important;line-height:1.2!important;text-align:center!important;max-width:1050px!important;margin:0 auto!important}
 .rv-activity>header h1 small,body #mlCurriculumGoal{font-size:10px!important;line-height:1.15!important;text-align:center!important;margin:0!important}
 body .rv-answers>.ml-answer-field-heading{flex:0 0 auto!important;width:auto!important;min-width:0!important;margin:0 5px 0 0!important;font-size:16px!important;padding:0!important;align-self:center!important;grid-column:auto!important}
 .rv-answers>.ml-answer-field-heading>.ml-answer-value{display:none!important}
 .assessment-item .rv-activity.item-response-only{display:flex!important;flex-direction:column!important;justify-content:center!important;gap:12px!important;position:relative!important;padding-bottom:42px!important}
 .assessment-item .item-response-only>header{flex:0 0 auto!important;justify-content:center!important}
 .assessment-item .item-response-only #assessmentFields{flex:0 0 auto!important;align-self:center!important;padding:4px 8px!important;margin:0!important;gap:10px!important}
 .assessment-item .item-response-only>footer{position:absolute!important;bottom:7px!important;left:10px!important;right:10px!important;min-height:0!important}
 .assessment-item .item-response-only.item-pattern>header{gap:7px!important}
 .assessment-item .before-after-sequence,.assessment-item .comparison-sequence{margin-inline:auto!important;justify-self:center!important}
 .assessment-item .comparison-sequence{width:max-content!important;max-width:100%!important;justify-content:center!important}
 .assessment-item .pattern-bank{margin-inline:auto!important;align-self:center!important}
 .assessment-item .pattern-tiles{justify-content:center!important}
 .assessment-item .item-pattern .pattern-bank{padding:4px 8px!important}.assessment-item .item-pattern .pattern-help{margin:0!important}
 .item-value-shapes .item-model-instruction{display:none!important}
 .assessment-item .item-expanded-choice #assessmentFields{width:100%!important;max-width:100%!important;flex-direction:column!important;gap:14px!important}
 .assessment-item .item-expanded-choice .item-field{width:100%!important;flex-direction:column!important;flex-wrap:nowrap!important;gap:12px!important}
 .assessment-item .item-expanded-choice .item-given-target{margin:0!important}
 .assessment-item .item-expanded-choice .item-given-target strong{font-size:clamp(88px,18vh,170px)!important;line-height:1.1!important}
 @media(max-width:1000px),(max-height:500px){.rv-trades:has(>button:nth-of-type(4)){display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:3px!important;width:100%!important;align-items:stretch!important}.rv-trades:has(>button:nth-of-type(4))>button{min-width:0!important;width:100%!important;min-height:44px!important;padding:2px!important;gap:2px!important}.rv-trades:has(>button:nth-of-type(4)) .flag-cat{width:22px!important;height:28px!important;flex-basis:22px!important}.rv-trades:has(>button:nth-of-type(4)) .exchange-label{font-size:10px!important;line-height:1.05!important;max-width:none!important;overflow-wrap:anywhere!important}}
 @media(max-width:1000px),(max-height:500px){body.assessment-balance .rv-type-balance .rv-trades button{min-height:39px!important;padding:2px 3px!important;gap:3px!important}body.assessment-balance .flag-cat{width:28px!important;height:30px!important;flex-basis:28px!important}body.assessment-balance .exchange-label{font-size:9px!important;line-height:1.05!important;max-width:60px!important}body.assessment-balance .rv-mat{padding:5px!important;gap:3px!important}body.assessment-balance .balance-pad:before{font-size:9px!important;line-height:1.1!important}body.assessment-balance .rv-mat h2{font-size:14px!important;line-height:1.1!important}body.assessment-balance .rv-place>b{font-size:13px!important}body.assessment-balance .balance-answer-column{gap:3px!important}body.assessment-balance .balance-answer-column>.rv-bank{padding:2px!important;gap:4px!important;min-height:32px!important}body.assessment-balance .balance-answer-column>.rv-bank>strong{display:none!important}body.assessment-balance .balance-answer-column>.rv-bank button{min-height:28px!important;min-width:38px!important;padding:2px 5px!important;font-size:13px!important}body.assessment-balance .balance-answer-column>.rv-bank .rv-face{--u:2.2px!important}body.assessment-balance .balance-landing h2{font-size:12px!important;gap:2px!important}body.assessment-balance .balance-landing output{font-size:11px!important;padding:1px 3px!important}}
 body.question-colour-focus .rv-work>.rv-mat>h2{display:none!important}
 body.question-colour-focus .rv-pv{gap:18px!important}
 body.question-colour-focus .rv-place>.rv-pieces:not(.ml-scattered-ones){display:flex!important;gap:7px!important;flex-wrap:wrap!important;align-content:center!important;align-items:center!important;justify-content:center!important}
 body.question-colour-focus .rv-place>b{font-size:21px!important}
 body.question-colour-focus .rv-place>.colour-place-tools{flex-direction:row!important;gap:5px!important}
 body.question-colour-focus .rv-trades button{min-height:49px!important;padding:2px 6px!important}
 body.question-colour-focus .flag-cat{width:40px!important;height:42px!important;flex-basis:40px!important}
 body.question-colour-focus .rv-answers{min-height:43px!important}
 body #readingPrompt{max-width:none!important}body.a13-break #task{gap:5px!important}
 body.assessment-reader #questionPrompt{font-size:clamp(26px,3vw,36px)!important;line-height:1.18!important;padding:7px 10px!important}
 body.a-assess-compact.a13-break #readingPrompt{font-size:26px!important;line-height:1.18!important;padding:5px 8px!important;text-align:center!important}
 body.question-colour-focus .rv-v100{background-image:linear-gradient(#8c968477 1px,transparent 1px),linear-gradient(90deg,#8c968477 1px,transparent 1px)!important}
 body.assessment-reader #questionDirections{text-align:center!important;margin:3px 0!important}
 @media(max-width:900px),(max-height:460px){.rv-activity>header>p:not(.item-goal),body #readingPrompt,body #questionPrompt,body>header>#prompt{font-size:26px!important;padding:5px 8px!important}.rv-activity>header>div{font-size:13px!important}.rv-activity>header h1 small,body #mlCurriculumGoal,.rv-activity>header>.item-goal{font-size:9px!important}body.question-colour-focus .rv-place>b{font-size:18px!important}body.question-colour-focus .rv-trades button{min-height:39px!important}body.question-colour-focus .flag-cat{width:30px!important;height:32px!important;flex-basis:30px!important}}
 @media(max-width:600px){.rv-activity>header>p:not(.item-goal),body #readingPrompt,body #questionPrompt,body>header>#prompt{font-size:23px!important;padding:5px 6px!important}.rv-activity>header>div{font-size:12px!important}body.question-colour-focus .rv-pv{gap:7px!important}body.question-colour-focus .rv-place>.colour-place-tools{flex-direction:column!important}body.question-colour-focus .exchange-label{max-width:70px!important}body.question-colour-focus .rv-place>b{font-size:16px!important}.assessment-item .item-response-only #assessmentFields{max-width:100%!important;padding:3px!important;gap:8px!important}}
 @media print{.rv-activity>header>p:not(.item-goal),body #readingPrompt,body #questionPrompt,body>header>#prompt{font-size:25px!important}}
 @media(min-width:601px){.assessment-item .item-before-after .before-after-sequence{width:min(1200px,100%)!important;grid-template-columns:minmax(150px,1fr) minmax(170px,max-content) minmax(150px,1fr)!important;align-items:stretch!important;gap:24px!important}.assessment-item .item-before-after .pattern-slot{height:clamp(100px,32vh,240px)!important;font-size:clamp(48px,14vh,96px)!important}.assessment-item .item-before-after .before-after-given strong{display:grid!important;place-items:center!important;flex:1!important;height:clamp(100px,32vh,240px)!important;font-size:clamp(64px,22vh,160px)!important;padding:4px 18px!important}.assessment-item .item-before-after .pattern-bank{max-width:1000px!important}.assessment-item .item-before-after .pattern-tiles button{min-height:44px!important;font-size:28px!important}}
/* Deep outlines and shadows are presentation only; colours and values stay native. */
body .rv-mat,body .a13-break-model,body .oa-break-part,body .read-model,body .read-set,
body .rv-ten-mat,body .rv-linebox,body .rv-group,body .pencil-pad,body .pencil-bank{
 border-color:#587567!important;box-shadow:0 4px 7px #183c3759!important;
}
body .rv-work{padding:2px 4px 8px!important}
body .rv-work .rv-face{
 filter:drop-shadow(3px 5px 2px #35271c99)!important;
 box-shadow:0 0 0 1px #3a30265e!important;
}
body .rv-work .rv-face.rv-v1{box-shadow:3px 4px 4px 1px #35271c66,0 0 0 1px #3a302680!important}
body svg.oa-block-picture,body svg:has([data-block-value]){filter:drop-shadow(3px 5px 3px #35271c88)!important;overflow:visible!important}
body .rv-mat h2,body .rv-place>b,body .rv-answers>strong,body .item-field>strong,
body .item-given-target strong,body .before-after-given strong,body .comparison-number,
body .a13-break-value,body .pencil-count{color:#173f37!important;text-shadow:0 2px 1px #173f372b!important}
body .rv-mat output,body .rv-answers button,body .item-choices button,body .mc-bank button,
body .pattern-tiles button,body .pattern-slot,body .rv-bank button,body .rv-part,
body .item-given-target strong,body .before-after-given strong,body .comparison-number{
 box-shadow:0 3px 4px #173f3759,0 0 0 1px #173f3726!important;
}
body .rv-bank button .rv-face{filter:drop-shadow(2px 3px 1px #35271c80)!important}
body .rv-mat h2{font-size:clamp(18px,1.6vw,23px)!important;line-height:1.1!important}
body .rv-place>b{font-size:clamp(16px,1.4vw,20px)!important}
@media(min-width:601px) and (max-height:550px){
 body .rv-activity{gap:4px!important;padding:6px 8px!important}
 body .rv-activity>header{gap:3px!important}
 body .rv-activity>header>p:not(.item-goal){padding:4px 8px!important}
 body .rv-activity>header>div{font-size:13px!important}
 body .rv-activity>footer button{min-height:28px!important}
 body .rv-mat{gap:3px!important;padding:5px 7px!important}
 body .rv-trades{gap:3px!important}
 body .rv-mat h2{font-size:18px!important}
 body .rv-place>b{font-size:16px!important}
 body .rv-work .rv-place{gap:3px!important}
 body.assessment-balance .rv-mat h2{font-size:14px!important}
 body.assessment-balance .rv-place>b{font-size:13px!important}
}
@media(max-width:600px){body .rv-mat h2{font-size:14px!important}body .rv-place>b{font-size:13px!important}}
@media print{body .rv-mat,body .a13-break-model{box-shadow:0 2px 3px #183c3759!important}}

 `;
 return{inject:html=>html.replace('</body>','<style>'+css+'</style><script>addEventListener("load",('+install.toString()+'),{once:true});<\/script></body>')};
})();
