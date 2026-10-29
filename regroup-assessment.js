/* Reuse the original add engine. Keep process evidence inside its Undo state. */
window.ML_REGROUP_ASSESSMENT=(()=>{
 function install(){
  const cfg=ML_CONFIG,api=window.ML_AUDIT10_REVISED;if(!cfg.assessment?.regroupProbe||!api)return;
  const copy=x=>JSON.parse(JSON.stringify(x)),raw=ML_ENGINE.get.bind(ML_ENGINE);
  function seed(){const s=api.state();s.tokens=[];let n=cfg.review.a;for(const v of[100,10,1]){let i=0;while(n>=v){s.tokens.push({id:'probe-orange-'+v+'-'+i++,value:v,loc:'a',home:'a'});n-=v}}for(let i=0;i<23;i++)s.tokens.push({id:'probe-blue-'+i,value:1,loc:'b',home:'b'});Object.assign(s,{probeInitialized:true,regroupTrades:[]});}
  if(!api.state().probeInitialized)api.action(()=>{seed();api.state().history=[]});
  ML_ENGINE.get=()=>{const x=raw(),trades=copy(api.state().regroupTrades||[]);return{...x,response:{...x.response,regroupEvidence:{initialBlueOnes:23,groupedOnesTrades:trades.length,blueOnesGrouped:trades.reduce((n,t)=>n+t.blueOnes,0),trades,finalCounts:['a','b'].map(loc=>({loc,tens:api.at(loc).filter(t=>t.value===10).length,ones:api.at(loc).filter(t=>t.value===1).length}))}}}};
  let before=null;
  document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
   if(b.id==='rvReset'){e.preventDefault();e.stopImmediatePropagation();api.action(()=>{seed();api.state().answer='';api.state().fields={}});parent.postMessage({type:'ml-state',id:cfg.id,payload:ML_ENGINE.get()},'*');return}
   before=b.dataset.group?.endsWith(':1')?{loc:b.dataset.group.split(':')[0],tokens:copy(api.state().tokens)}:null;
  },true);
  document.addEventListener('click',()=>{if(!before)return;const b=before;before=null;const after=api.state().tokens,old=b.tokens.filter(t=>t.loc===b.loc&&t.value===1),left=after.filter(t=>t.loc===b.loc&&t.value===1);if(old.length-left.length!==10||after.length!==b.tokens.length-9)return;const ids=new Set(after.map(t=>t.id)),removed=old.filter(t=>!ids.has(t.id));api.state().regroupTrades||=[];api.state().regroupTrades.push({from:10,to:1,valueBefore:1,valueAfter:10,loc:b.loc,blueOnes:removed.filter(t=>t.home==='b').length,beforeOnes:old.length,afterOnes:left.length});ML_REVISED.setDone(api.state().done);parent.postMessage({type:'ml-state',id:cfg.id,payload:ML_ENGINE.get()},'*');});
 }
 return{inject:(html,cfg)=>cfg.assessment?.regroupProbe?html.replace('</body>','<script>('+install.toString()+')();<\/script></body>'):html};
})();
