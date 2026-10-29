/* Split the existing questions into three parts without changing question codes. */
window.ML_THREE_PART_PLAN=(()=>{'use strict';
 const revision='three-parts-v1';
 function split(plan){
  if(plan.partsPerGrade===3&&plan.sections.length===6)return structuredClone(plan);
  const next=structuredClone(plan),sections=[];
  for(const grade of [2,3]){
   const pages=plan.sections.filter(s=>s.grade===grade).sort((a,b)=>a.part-b.part).flatMap(s=>s.pages),count=pages.length;
   if(!count)throw Error('Each grade needs at least one selected question.');
   for(let part=1;part<=3;part++){
    const start=Math.floor((part-1)*count/3),end=Math.floor(part*count/3),selected=[...new Set(pages.slice(start,end))];
    sections.push({key:(grade===2?'excite':'inspire')+'-'+part,grade,part,pages:selected.length?selected:[pages[Math.min(start,count-1)]]});
   }
  }
  next.sections=sections;next.partsPerGrade=3;next.contentRevision=revision;next.provisional=false;return next;
 }
 return{revision,split};
})();
window.ML_ASSESSMENT_PLAN=ML_THREE_PART_PLAN.split(ML_ASSESSMENT_PLAN);
