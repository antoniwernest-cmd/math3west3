/* Click feedback identifies one DOM control, including after a model rerender. */
window.ML_BUTTON_FEEDBACK=(()=>{
 const css=`html body button.ml-button-on,html body button.ml-button-flash,html body button:active:not(:disabled){background:#ff8800!important;background-color:#ff8800!important;color:#183c37!important;border-color:#b54d00!important;transform:scale(1.045)!important;z-index:2;box-shadow:0 2px 0 #ad5000!important}button{transform-origin:center;transition:background-color .08s,transform .08s}.item-way-tabs,.assessment-model-tabs{padding:2px 16px!important}@media(prefers-reduced-motion:reduce){button{transition:none!important}}`;
 function install(css){
  if(document.documentElement.dataset.mlPressFeedback)return;document.documentElement.dataset.mlPressFeedback='true';const style=document.createElement('style');style.textContent=css;(document.head||document.documentElement).append(style);
  let queued=false,flashNode=null,flashSpec=null,timer;const prior=new WeakMap(),props={'background-color':'rgb(255, 136, 0)',color:'rgb(24, 60, 55)','border-color':'rgb(181, 77, 0)',transform:'scale(1.045)'},baseAttr='data-ml-feedback-base';
  function path(e){const bits=[];for(let n=e;n&&n!==document.body;n=n.parentElement)bits.push(n.tagName+':'+[...(n.parentElement?.children||[])].indexOf(n));return bits.reverse().join('/')}
  function signature(b){return JSON.stringify([b.id,[...b.attributes].filter(a=>a.name.startsWith('data-')&&!/^(data-ml-feedback|data-ml-result|data-a14-result|data-selected)/.test(a.name)).map(a=>[a.name,a.value]).sort(),b.textContent.trim()])}
  function scope(b){return path(b.parentElement?.closest('.mc-bank,.ml-answer-options,.rv-answers,.rv-trades,[role=group],.item-choices')||b.parentElement)}
  function selected(b){const answer=b.matches('[data-answer],[data-ml-choice],[data-choice],[data-pattern-key],[data-pattern-value]')||b.closest('.mc-bank,.ml-answer-options,.rv-answers,.item-choices,.choice-row,.choice-grid,.answer-bank');return !!answer&&(b.getAttribute('aria-pressed')==='true'||b.getAttribute('aria-selected')==='true'||b.matches('.selected,.chosen,.is-selected,[data-selected="true"]'))}
  function baseline(b){if(prior.has(b))return prior.get(b);let saved;try{saved=JSON.parse(b.getAttribute(baseAttr))}catch{}saved||=Object.fromEntries(Object.keys(props).map(p=>[p,[b.style.getPropertyValue(p),b.style.getPropertyPriority(p)]]));prior.set(b,saved);return saved}
  function paint(){queued=false;const buttons=[...document.querySelectorAll('button:not(.rv-ghost):not(.ml-block-drag-ghost)')];let target=flashNode?.isConnected?flashNode:null;if(!target&&flashSpec){const candidates=buttons.filter(b=>signature(b)===flashSpec.signature&&scope(b)===flashSpec.scope);target=candidates.length===1?candidates[0]:candidates.find(b=>path(b)===flashSpec.path)||null;flashNode=target}
   for(const b of buttons){const on=!b.disabled&&selected(b),lit=!b.disabled&&b===target;b.classList.toggle('ml-button-on',on);b.classList.toggle('ml-button-flash',lit);if(on||lit){const saved=baseline(b);if(!b.hasAttribute(baseAttr))b.setAttribute(baseAttr,JSON.stringify(saved));for(const[p,v]of Object.entries(props))if(b.style.getPropertyValue(p)!==v||b.style.getPropertyPriority(p)!=='important')b.style.setProperty(p,v,'important')}else if(prior.has(b)||b.hasAttribute(baseAttr)){for(const[p,[v,priority]]of Object.entries(baseline(b))){if(v)b.style.setProperty(p,v,priority);else b.style.removeProperty(p)}prior.delete(b);b.removeAttribute(baseAttr)}}
  }
  function schedule(){if(!queued){queued=true;requestAnimationFrame(paint)}}
  function flash(b){if(!b||b.disabled)return;flashNode=b;flashSpec={signature:signature(b),scope:scope(b),path:path(b)};paint();clearTimeout(timer);timer=setTimeout(()=>{flashNode=null;flashSpec=null;paint()},700)}
  document.addEventListener('click',e=>flash(e.target.closest('button')),true);document.addEventListener('ml-control-feedback',e=>flash(e.detail.button),true);
  new MutationObserver(schedule).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['aria-pressed','aria-selected','disabled','data-selected']});schedule();
 }
 install(css);return{css,install,boot:()=>'<script>('+install.toString()+')('+JSON.stringify(css)+');<\/script>'};
})();

