/* Reallocate each place-value column before the original 3D fitter sizes its blocks. */
window.ML_MODEL_LAYOUT=(()=>{'use strict';
 function fit(root,q,direction){
  if(window.ML_CONFIG?.assessment?.colourSubtract){delete root.dataset.blockFittedUnit;return 'vertical'}
  const small=root.clientWidth<=900||root.clientHeight<=500,panels=[...root.querySelectorAll('.rv-pv')].filter(p=>p.getClientRects().length&&p.clientWidth>0).map(panel=>{const columns=[...panel.children].filter(g=>g.matches('.rv-place')).map(el=>{const blocks=[...el.querySelectorAll('.rv-block')],area=el.querySelector('.rv-pieces');return{el,area,count:blocks.length,value:+el.dataset.placeValue,fixed:blocks.length>0&&blocks.every(b=>b.disabled),stack:!!q.staggerHundreds&&+el.dataset.placeValue===100}});if(columns.some(g=>g.count))for(const g of columns)g.el.hidden=!g.count;return{panel,width:panel.clientWidth,gap:parseFloat(getComputedStyle(panel).gap)||0,groups:columns.filter(g=>g.count&&g.area?.clientHeight>0).map(g=>({...g,h:Math.max(0,g.area.clientHeight-8),gap:parseFloat(getComputedStyle(g.area).gap)||0}))}}).filter(p=>p.groups.length);
  if(!panels.length){delete root.dataset.blockFittedUnit;return direction}
  function allocation(unit,horizontal){const result=[];for(const p of panels){const widths=[];for(const g of p.groups){const span=g.stack?12:10,cell=g.value===1?Math.max(Math.min(unit,24),Math.min(32,Math.sqrt(p.width*g.h/g.count)*.5)):unit,bw=Math.max(g.fixed?0:g.value===10&&!horizontal?(small?18:12):small?18:24,g.value===1?cell+7:(g.value>=100||g.value===10&&horizontal?unit*span:unit)+2),bh=g.value===1?cell+7:Math.max(g.fixed?0:small?26:32,(g.value>=100||g.value===10&&!horizontal?unit*span:unit)+2),rows=Math.floor((g.h+g.gap)/(bh+g.gap));if(rows<1)return null;let cols=Math.ceil(g.count/rows);if(g.value===1&&g.count>=3)cols=Math.max(cols,2);widths.push(cols*bw+(cols-1)*g.gap+8)}const used=widths.reduce((n,w)=>n+w,0)+(widths.length-1)*p.gap;if(used>p.width+.01)return null;result.push({p,widths,used})}return result}
  let best=null;for(const horizontal of ['estimate','difference'].includes(q.type)?[false]:[false,true])for(let unit=40;unit>=2;unit-=.25){const placements=allocation(unit,horizontal);if(placements){if(!best||unit>best.unit)best={unit,horizontal,placements};break}}
  if(!best){delete root.dataset.blockFittedUnit;return direction}
  for(const {p,widths,used}of best.placements){const extra=Math.max(0,p.width-used),total=widths.reduce((n,w)=>n+w,0);p.groups.forEach((g,i)=>{const w=widths[i]+extra*widths[i]/total;g.el.style.setProperty('flex','0 0 '+w+'px','important');g.el.style.setProperty('min-width','0','important')})}
  root.dataset.blockFittedUnit=String(best.unit);
  return best.horizontal?'horizontal':'vertical';
 }
 function watch(){const root=document.querySelector('.rv-activity');if(!root)return;let queued=false;function refresh(){if(queued)return;queued=true;requestAnimationFrame(()=>requestAnimationFrame(()=>{queued=false;dispatchEvent(new Event('resize'))}))}new MutationObserver(refresh).observe(root,{childList:true,subtree:true});new ResizeObserver(refresh).observe(root);refresh()}
 const css=`
 body .rv-activity .rv-place[hidden]{display:none!important}
 .rv-work .rv-face.rv-v10{min-width:8px!important;min-height:8px!important}
 body h1{font-size:0!important;line-height:0!important;min-height:0!important;margin:0!important}body h1 small,body #mlCurriculumGoal{display:block!important;font-size:10px!important;line-height:1.2!important;margin:0 0 3px!important}.rv-activity>header h1{display:block!important}
 .rv-bank{padding:3px 6px!important;gap:7px!important}.rv-bank button{padding:2px 6px!important}.rv-activity>footer button{padding:2px 7px!important;min-height:29px!important;font-size:14px!important}.rv-trades button{padding:2px 5px!important}.rv-answers{padding:4px 6px!important;gap:6px!important}.rv-answers>button{padding:3px 7px!important}
 `;
 return{inject:html=>html.replace('<head>','<head><script>window.ML_BLOCK_LAYOUT={fit:('+fit.toString()+'),unit:root=>{const n=+root.dataset.blockFittedUnit;return n>0?n:null}};<\/script>').replace('</body>','<style>'+css+'</style><script>addEventListener("load",('+watch.toString()+'),{once:true});<\/script></body>')};
})();

