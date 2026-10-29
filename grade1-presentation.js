/* Larger visual targets for the youngest assessment group; existing controls own every response. */
window.ML_GRADE1_PRESENTATION=(()=>{
 function install(){
  document.body.classList.add('ml-grade1');const spec=ML_CONFIG.assessment?.itemSpec;if(!spec?.shapePattern)return;
  const names={'●':'Circle','▲':'Triangle','■':'Square','★':'Star'};let queued=false;
  function paint(){queued=false;const bank=document.querySelector('.pattern-bank>strong');if(bank&&bank.textContent!=='Shape tiles')bank.textContent='Shape tiles';for(const el of document.querySelectorAll('.pattern-known,[data-pattern-value],.pattern-slot')){const value=el.dataset.patternValue??el.textContent.trim();if(names[value]){el.dataset.grade1Shape=names[value].toLowerCase();if(el.matches('button'))el.setAttribute('aria-label',names[value]+' tile')}}}
  new MutationObserver(()=>{if(!queued){queued=true;requestAnimationFrame(paint)}}).observe(document.body,{childList:true,subtree:true});paint();
 }
 const css=`
 body.ml-grade1 .item-pattern:not(.item-before-after):not(.item-comparison) .pattern-known,body.ml-grade1 .item-pattern:not(.item-before-after):not(.item-comparison) .pattern-slot{font-size:clamp(32px,4.2vw,58px)!important;min-width:clamp(52px,6vw,86px)!important}
 body.ml-grade1 .item-pattern:not(.item-before-after):not(.item-comparison) .pattern-slot{height:clamp(58px,10vh,84px)!important;min-height:58px!important;padding:6px!important}
 html body.ml-grade1.assessment-item .rv-activity.item-pattern:not(.item-before-after):not(.item-comparison) .pattern-tiles{width:min(680px,90vw)!important;max-width:100%;align-self:center}
 html body.ml-grade1.assessment-item .rv-activity.item-pattern:not(.item-before-after):not(.item-comparison) .pattern-tiles button{font-size:clamp(26px,3vw,44px)!important;min-height:clamp(48px,8vh,68px)!important;padding:6px 12px!important}
 body.ml-grade1 .pattern-known[data-grade1-shape=circle]{color:#b6602c}body.ml-grade1 .pattern-known[data-grade1-shape=triangle]{color:#4b7040}body.ml-grade1 .pattern-known[data-grade1-shape=square]{color:#416990}body.ml-grade1 .pattern-known[data-grade1-shape=star]{color:#9a6918}
 body.ml-grade1 .pattern-space small{font-size:12px!important}body.ml-grade1 .item-pattern .pattern-bank>small{font-size:12px!important}
 @media(max-height:440px){body.ml-grade1 .item-pattern:not(.item-before-after):not(.item-comparison) .pattern-known,body.ml-grade1 .item-pattern:not(.item-before-after):not(.item-comparison) .pattern-slot{font-size:32px!important;min-width:50px!important}body.ml-grade1 .item-pattern:not(.item-before-after):not(.item-comparison) .pattern-slot{height:54px!important;min-height:54px!important}html body.ml-grade1.assessment-item .rv-activity.item-pattern:not(.item-before-after):not(.item-comparison) .pattern-tiles button{min-height:44px!important;font-size:27px!important}}
 `;
 return{inject(html,cfg){if(cfg.grade!==1)return html;return html.replace('</body>','<style>'+css+'</style><script>('+install.toString()+')();</'+'script></body>')}};
})();
