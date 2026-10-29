/* Assessment variants keep original project page codes intact. */
(()=>{const C=ML_ASSESSMENT_CATALOG,base=structuredClone(C.find(q=>q.pageCode==='OP2-0025')),q=base;q.id='assessment-regroup-28-23';q.pageCode='AS2-0021';q.title='Add with blocks: 28 + 23';q.prompt='28 + 23 = ? Find the total.';q.directions='Use the blocks to find the total. Tap or drag blocks between the sets. You may group or ungroup blocks. Choose your answer.';Object.assign(q.config,{id:q.id,pageCode:q.pageCode,title:q.title,prompt:q.prompt});Object.assign(q.config.review,{a:28,b:23,answer:51,title:q.title,prompt:q.prompt,directions:q.directions});q.config.review.options=[50,41,51,52,61];q.config.assessment={...(q.config.assessment||{}),regroupProbe:true};C.push(q);
 for(const p of C.filter(p=>p.config.assessment?.balancePad)){p.directions='Build the missing part on the purple landing pad so both sides have the same total. The blue, teal and gold pads show the known sets. Tap or drag bank blocks to add them. Tap a placed block or drag it back to remove it. Choose your answer.';p.config.review.directions=p.directions;}

 function numericOptions(value,seed){const reversed=Number(String(value).split('').reverse().join('')),pool=[value,value-1,value+1,value-10,value+10,reversed,0,2,20,100].filter(n=>Number.isInteger(n)&&n>=0),unique=[...new Set(pool)].slice(0,5);while(unique.length<5)unique.push(Math.max(...unique)+1);let n=[...seed].reduce((n,c)=>n*31+c.charCodeAt(0),7)>>>0;for(let i=unique.length-1;i>0;i--){n=(Math.imul(n,1664525)+1013904223)>>>0;const j=n%(i+1);[unique[i],unique[j]]=[unique[j],unique[i]]}return unique}
 for(const p of C){const spec=p.config.assessment?.itemSpec;if(spec){for(const f of spec.fields||[])if(f.type==='number'&&!f.options)f.options=numericOptions(f.expected,p.pageCode+f.key);if(spec.fields?.some(f=>f.type==='number')){p.directions=p.directions.replace('Write or choose your response.','Tap a number button for each response.');p.config.review.directions=p.directions;}}
  if(p.config.review?.type==='add'){p.directions=p.directions.replace(/Blocks change colou?r\.\s*/gi,'');p.config.review.directions=p.directions;}
  if(p.config.review?.type==='subtract'){p.title='Subtract the blocks';p.directions='Find the answer. You may use the blocks to show your thinking. Choose your answer.';p.config.review.title=p.title;p.config.review.directions=p.directions;}
  if(p.config.assessment?.balancePad){p.directions='Choose the missing number. The purple landing pad shows your choice. You may also tap or drag blocks to change your set. Both sides should have the same total.';p.config.review.directions=p.directions;}
 }
})();

/* Every learner response is selected or built; word names and reasons are tappable too. */
(()=>{const words={
 'AS2-0002':['forty-seven','seventy-four','forty-one','fifty-seven'],
 'AS3-0001':['three hundred and forty-eight','three hundred and eighty-four','four hundred and thirty-eight','three hundred and eight']
};function shuffle(options,code){const out=[...options];let seed=[...code].reduce((n,c)=>n+c.charCodeAt(0),0);for(let i=out.length-1;i>0;i--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const j=seed%(i+1);[out[i],out[j]]=[out[j],out[i]]}return out}
for(const q of ML_ASSESSMENT_CATALOG){const spec=q.config.assessment?.itemSpec;if(!spec)continue;
 for(const f of spec.fields||[]){if(f.type==='words'){f.options=shuffle(words[q.pageCode],q.pageCode);f.tapLayout='words'}if(f.key==='explanation'){f.type='choice';f.manual=false;f.label='Choose why';f.expected=q.grade===2?'Pairs with none left over.':'Pairs with one left over.';f.options=shuffle(['Pairs with none left over.','Pairs with one left over.','There are no equal pairs.'],q.pageCode);f.tapLayout='reason'}}
 if(spec.fields?.length===2&&spec.fields.every(f=>/^blank/.test(f.key))){const split=q.prompt.indexOf(':');spec.pattern={prefix:q.prompt.slice(0,split+1),parts:q.prompt.slice(split+1).replace(/\\.$/,'').split(',').map(p=>/_{2,}/.test(p)?'blank':p.trim().replace(/[.]$/,''))};q.directions='Drag number tiles into the labelled blanks.';}
 if(words[q.pageCode]){q.title='Choose a number name';q.prompt='Choose the number name for '+spec.base+'.';q.learningGoal='Read and recognize written number names.';q.config.review.title=q.title}
 else q.prompt=q.prompt.replace(/^Write (.+) as a number\.$/,'Choose the number for $1.').replace(/^Write (.+) in expanded form\.$/,'Show $1 in expanded form.').replace(/Explain\.$/,'Choose why.');
 q.directions=q.directions.replace(/Write or choose your response\.|Tap a number button for each response\./,'Tap your response buttons.');
 Object.assign(q.config.review,{prompt:q.prompt,directions:q.directions});spec.prompt=q.prompt;
 for(const d of q.details||[])d.explanation=q.prompt;
 if(q.config.curriculumAlignment){q.config.curriculumAlignment.goal=q.prompt;for(const d of q.config.curriculumAlignment.details||[])d.explanation=q.prompt}
}
})();




/* Two-colour equation sides, retaining all four pads. */
(()=>{for(const q of ML_ASSESSMENT_CATALOG)if(q.config.review?.type==='balance'){q.directions='Choose the missing number. The two blue pads show the left side. The two purple pads show the right side. Your choice appears on the missing-part pad. You may tap or drag blocks to change that set. Both sides should have the same total.';q.config.review.directions=q.directions;}})();
