/* Content-sized answer choices. Reuse every native button, handler and field key. */
window.ML_CONTENT_CONTROLS=(()=>{'use strict';
 function install(){
  let queued=false;const set=(e,k,v)=>{if(e.style.getPropertyValue(k)!==v||e.style.getPropertyPriority(k)!=='important')e.style.setProperty(k,v,'important')};
  const visible=e=>e.getClientRects().length&&e.getBoundingClientRect().width>0;
  function fit(){queued=false;
   for(const bank of document.querySelectorAll('.mc-bank,.item-choices,.ml-answer-options,.rv-answers,.pattern-tiles')){
    if(!visible(bank))continue;
    const row=bank.matches('.rv-answers'),expanded=!!bank.closest('.item-expanded-choice');
    for(const [k,v]of Object.entries({display:'flex','flex-wrap':expanded?'nowrap':'wrap','align-items':'center','align-content':'center','justify-content':'center',gap:'6px','min-height':'0','grid-template-columns':'none','grid-template-rows':'none',flex:'0 1 auto',width:row?'100%':'fit-content','max-width':'100%',margin:'0',padding:row?'4px 6px':'2px'}))set(bank,k,v);
    for(const b of [...bank.children].filter(e=>e.tagName==='BUTTON')){
     const numeric=/^[\d\s,+−–<>＝=×÷?-]+$/.test(b.textContent.trim()),reader=!!bank.closest('.cb-field'),longChoice=innerWidth<=600&&['words','reason'].includes(bank.closest('.item-tap-field')?.dataset.tapLayout),size=expanded?Math.max(11,Math.min(28,innerWidth*.027))+'px':bank.closest('.item-before-after,.item-comparison')?(innerWidth<=600?'23px':'30px'):reader?(innerWidth<650?'16px':'18px'):longChoice?'15px':bank.closest('.item-response-only')&&!bank.closest('.item-pattern')?(innerHeight<=400?'22px':innerWidth<=600?'23px':numeric?'28px':'21px'):innerWidth<=600?'18px':numeric?'22px':'18px';
     for(const[k,v]of Object.entries({flex:'0 0 auto',width:'auto','min-width':expanded?'0':numeric&&!reader?'52px':'44px','max-width':longChoice?'calc(50% - 3px)':'min(100%,360px)','min-height':expanded?'44px':reader?'30px':'36px',height:'auto',padding:expanded?(innerWidth<=600?'6px 4px':'7px 12px'):reader?'3px 6px':'4px 10px','font-size':size,'line-height':'1.15','white-space':expanded?'nowrap':'normal','overflow-wrap':'normal',margin:'0'}))set(b,k,v);
    }
   }
   for(const group of document.querySelectorAll('.count-fields .cb-fields,.expanded-equation')){
    if(!visible(group))continue;
    const expanded=group.matches('.expanded-equation'),columns=expanded?(innerWidth<650?2:4):3;
    for(const[k,v]of Object.entries({display:'flex','flex-wrap':'wrap','align-items':'flex-start','justify-content':'center',gap:'6px',height:'auto','min-height':'0',flex:'0 1 auto'}))set(group,k,v);
    for(const field of group.querySelectorAll('.cb-field')){set(field,'width','fit-content');set(field,'max-width','calc((100% - '+((columns-1)*6)+'px) / '+columns+')');set(field,'flex','0 1 auto');set(field,'min-height','0');set(field,'height','auto')}
   }
   document.body.dataset.contentControlsReady='true';
  }
  function schedule(){if(!queued){queued=true;document.body.dataset.contentControlsReady='false';requestAnimationFrame(fit)}}
  new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['data-a9-view','data-skill-view','data-estimate-view','hidden']});
  new ResizeObserver(schedule).observe(document.documentElement);
  addEventListener('resize',schedule);document.fonts.ready.then(schedule);fit();
 }
 const css=`
 body.a13-break .question-head{display:block!important;padding:0!important;border:0!important}body.a13-break .question-head .question-art,body.a13-break .question-head .source{display:none!important}body.a13-break #readingPrompt{margin:3px 0!important;padding:0!important}
 .oa-break-parts{display:flex!important;flex-wrap:wrap!important;justify-content:center!important;align-items:flex-start!important;gap:8px!important;grid-template-columns:none!important;grid-template-rows:none!important;min-height:0!important}
 body.a13-break #task,body.a-assess-compact.a13-break #task{grid-template-rows:36px minmax(0,1fr) auto!important;gap:6px!important;min-height:0!important}
 .oa-break-parts>.oa-break-part{width:fit-content!important;max-width:100%!important;flex:0 1 auto!important;padding:4px 6px!important;min-height:0!important}
 body.a13-break .oa-break-part label,body.a-assess-compact.a13-break .oa-break-part label{display:flex!important;flex-wrap:wrap!important;align-items:center!important;justify-content:center!important;gap:7px!important;grid-template-columns:none!important;min-height:0!important;font-size:15px!important}
 .oa-break-part .mc-value{display:none!important}.oa-break-part .mc-bank{flex:0 1 auto!important}
 .oa-break-part input{display:none!important}.a13-break-model{min-height:0!important;padding:6px!important}.a13-break-model>svg{height:100%!important;max-height:none!important;width:100%!important}
 .assessment-item .item-fields{display:flex!important;flex-wrap:wrap!important;justify-content:center!important;align-items:center!important;gap:6px 12px!important;padding:4px 6px!important;grid-template-columns:none!important}
 .assessment-item .item-field{flex:0 1 auto!important;width:fit-content!important;max-width:100%!important;display:flex!important;flex-direction:row!important;flex-wrap:wrap!important;align-items:center!important;justify-content:center!important;gap:6px!important}
 .assessment-item .item-field>span:first-child{flex:0 0 auto!important}.assessment-item .item-tap-field[data-tap-layout=words],.assessment-item .item-tap-field[data-tap-layout=reason]{flex:0 1 auto!important}
 .a9-read-answers{min-height:0!important}.cb-field{align-self:flex-start!important}.expanded-equation>.cb-field:before{display:none!important}
 .skills-tabs,.estimate-tool-tabs,.assessment-model-tabs{display:flex!important;flex-wrap:wrap!important;justify-content:center!important;gap:6px!important}
 .skills-tabs>button,.estimate-tool-tabs>button,.assessment-model-tabs>button{width:auto!important;min-width:0!important;flex:0 0 auto!important;padding:4px 12px!important;min-height:32px!important}
 @media(min-width:601px){.assessment-model-tabs{display:none!important}}
 @media(min-width:650px) and (min-height:500px){body.assessment-reader .a9-read-work{grid-template-rows:minmax(0,1fr) 32px auto!important}}
 @media(min-width:650px) and (max-width:1000px){.oa-break-parts:has(>.oa-break-part:nth-child(3))>.oa-break-part{max-width:30%!important}.oa-break-parts:has(>.oa-break-part:nth-child(3)) label{flex-direction:column!important}}
 @media(max-width:649px){.oa-break-parts{gap:4px!important}.oa-break-parts>.oa-break-part{padding:3px 4px!important}.oa-break-part label{font-size:12px!important}.assessment-item .item-field{gap:4px!important}}
 `;
 return{inject:html=>html.replace('</body>','<style>'+css+'</style><script>addEventListener("load",('+install.toString()+'),{once:true});<\/script></body>')};
})();
