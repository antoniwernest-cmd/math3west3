/* Parent report: reuse Math Landing scores, saved PNGs and the existing PDF writer. */
window.ML_PARENT_RESULTS=(()=>{'use strict';
 const W=1275,H=1650,M=70,INK='#183c37',MUTED='#627063',LINE='#d8dfd2',GREEN='#24634b',PAPER='#fffdf7';
 const clean=v=>String(v??'').replace(/[\u2010-\u2015]/g,'-').replace(/\s+/g,' ').trim();
 const type=q=>q.config.review?.type||q.config.kind;
 const title=q=>({read:'Identify the number',break:'Break the number into parts',add:'Add with blocks',subtract:'Subtract by exchanging a ten',balance:'Build the missing number'}[type(q)]||q.title);
 const task=q=>q.config.assessment?.itemSpec||q.config.assessment?.numberLine||q.config.assessment?.colourSubtract||q.config.assessment?.pencilShare||q.config.assessment?.jumpAssessment?q.prompt:type(q)==='read'?'Read the number shown by the blocks.':type(q)==='break'?'Write '+q.config.value+' as place-value parts.':type(q)==='add'?'Use blocks to add '+q.config.review.a+' + '+q.config.review.b+'.':type(q)==='subtract'?'Use blocks to subtract '+q.config.review.a+' - '+q.config.review.b+'.':type(q)==='balance'?'Build ? in '+q.config.review.a+' + '+q.config.review.b+' = '+q.config.review.known+' + ?.':q.directions;
 const goal=q=>({read:'Read and represent whole numbers.',break:'Explain the value of each digit.',add:'Add using place value and exchanges.',subtract:'Exchange a ten for ones and subtract.',balance:'Make both sides of an equation equal.'}[type(q)]||q.learningGoal||q.prompt)+' '+q.codes.join(', ');
 const expectationText=q=>(q.details||q.config.curriculumAlignment?.details||[]).map(d=>d.code+': '+(d.curriculumExplanation||d.explanation)).join(' ')||q.codes.join(', ');
 const fields={answer:'Answer',hundreds:'Hundreds value',tens:'Tens value',ones:'Ones value',hValue:'Hundreds value',tValue:'Tens value',uValue:'Ones value',hCount:'Hundreds',tCount:'Tens',uCount:'Ones',ungroup10:'Ten exchanged',ungroup100:'Hundred exchanged','Block model / regrouping':'Block work'};
 function lines(ctx,text,width){const out=[];for(const para of String(text??'').split('\n')){let line='';for(const word of clean(para).split(' ')){if(!word)continue;const test=line?line+' '+word:word;if(ctx.measureText(test).width>width&&line){out.push(line);line=word}else line=test}out.push(line)}return out;}
 function font(ctx,size=23,bold=false){ctx.font=(bold?'700 ':'400 ')+size+'px Andika, sans-serif';ctx.fillStyle=INK;ctx.textBaseline='top';}
 function text(ctx,content,x,y,width,size=23,bold=false,color=INK,lineHeight=size*1.3){font(ctx,size,bold);ctx.fillStyle=color;const list=lines(ctx,content,width);for(const line of list){ctx.fillText(line,x,y);y+=lineHeight}return y;}
 function box(ctx,x,y,w,h,fill,stroke=LINE,r=17){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke()}}
 function image(uri){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(Error('A saved question picture could not be read.'));im.src=uri})}
 function date(at){const d=new Date(at);return Number.isNaN(d.valueOf())?'Not recorded':new Intl.DateTimeFormat('en-CA',{timeZone:'America/Toronto',year:'numeric',month:'long',day:'numeric'}).format(d)}
 function response(row){const exchanges=row.snapshot?.response?.exchangeEvidence||[];return row.rubric.marks.filter(m=>m.field!=='My explanation').map(m=>(fields[m.field]||m.field)+': '+(['ungroup10','ungroup100'].includes(m.field)?(m.earned?'Yes':'Not recorded'):m.entered?clean(m.actual):'Not answered')).join('   ')+(row.snapshot?.response?.numberLineDrags?'   Number-line marker dragged '+row.snapshot.response.numberLineDrags+' times.':'')+(row.snapshot?.response?.blockMovement?'   '+('Block strategy: dragged across pads '+row.snapshot.response.blockMovement.drags+' times; tapped across '+row.snapshot.response.blockMovement.taps+' times.'):'')+(exchanges.length?'   Exchanges: '+[...new Set(exchanges.map(e=>e.action+' on '+({work:'landing',a:'first',b:'second',known:'known-part',start:'blocks-left',removed:'taken-away'}[e.pad]||e.pad)+' pad'))].map(label=>label+' ('+exchanges.filter(e=>e.action+' on '+({work:'landing',a:'first',b:'second',known:'known-part',start:'blocks-left',removed:'taken-away'}[e.pad]||e.pad)+' pad'===label).length+' time(s))').join('; '):'')}
 function nextStep(q,row,sc){
  if(sc.pending)return type(q)==='balance'?"The teacher will review how your child built the model.":"Teacher review of your child's explanation is still needed.";
  if(sc.overridden&&sc.earned!==row.rubric.earned&&!row.rubric.marks.some(m=>m.pending))return 'Ask the teacher which strategy to practise next.';
  if(q.config.assessment?.colourSubtract)return sc.earned===sc.possible?'Ask your child how exchanging one block for ten smaller blocks keeps its value.':'Practise exchanging blocks and colouring the amount left after taking some away.';
  if(q.config.assessment?.itemSpec?.valueShapes)return sc.earned===sc.possible?'Try making another number with two different shape combinations.':'Use the numbered shapes to combine values in two different ways.';
  if(q.config.assessment?.itemSpec)return sc.earned===sc.possible?'Try a similar task and ask your child to explain their thinking.':q.config.assessment.itemSpec.modelUsage==='none'?'Practise a similar question together and ask your child to explain the choice.':'Review this task together using blocks.';
  if(type(q)==='read')return sc.earned===sc.possible?'Ask your child to show a similar number in another way.':'Practise counting hundreds, tens and ones before reading the whole number.';
  if(type(q)==='break')return sc.earned===sc.possible?'Try another number, including one with a zero in a place.':'Use blocks to explain the value of each digit, then write the parts.';
  if(type(q)==='add'){const model=row.rubric.marks.find(m=>m.field==='Block model / regrouping');return sc.earned===sc.possible?'Ask your child to explain the exchanges they made.':model?.earned===0?'Combine the block sets. Practise exchanging ten smaller blocks for one larger block.':'Use the blocks to count the combined total carefully.'}
  if(type(q)==='balance')return sc.earned===sc.possible?'Explain how both sides represent the same total.':'Build the missing part, then count both sides to check they match.';
  if(type(q)==='subtract')return sc.earned===sc.possible?'Explain why exchanging a ten keeps the total the same.':'Practise exchanging a ten for ten ones, then taking away the requested number.';
  if(q.config.assessment?.numberLine)return sc.earned===sc.possible?'Try locating another number between two labelled endpoints.':'Use the labelled endpoints and halfway point to discuss where a number belongs.';return 'Ask your child to explain their thinking, then discuss the next step with the teacher.';
 }
 function stateLabel(sc){if(sc.pending)return 'Teacher review needed';return sc.earned===sc.possible?'Demonstrated on this task':sc.earned>0?'Some parts demonstrated':'Not demonstrated yet'}
 function support(row){const s=row.teacher?.support;return s?({Independent:'Completed independently','Read aloud':'Instructions read aloud',Prompt:'Completed with a prompt',Model:'Completed with a model','Access support':'Access support provided'}[s]||s):''}
 async function create(session,{getPNG,sample=false}={}){
  if(!session?.responses?.length)throw Error('There are no submitted answers for this student yet.');
  if(typeof getPNG!=='function')throw Error('Saved question pictures are unavailable.');
  await document.fonts.ready;await document.fonts.load('700 24px Andika');
  const rows=[];for(const row of session.responses){const q=session.pages.find(q=>q.id===row.questionId)||session.pages[rows.length];if(!q)throw Error('Question details are missing.');const uri=await getPNG(row.evidenceKey);if(!uri)throw Error('The saved PNG is missing for '+q.pageCode+'. Restore a full backup first.');rows.push({row,q,im:await image(uri),sc:ML_ASSESSMENT_CORE.finalScore(row)})}
  const name=sample?'Sample student':clean(session.student),scope=(session.grade===1?'Grade 1':session.grade===2?'Excite':'Inspire')+' - Grade '+session.grade+' - Part '+session.part;
  const earned=rows.reduce((n,r)=>n+r.sc.earned,0),possible=rows.reduce((n,r)=>n+r.sc.possible,0),complete=!!session.completedAt&&rows.length===session.pages.length;
  const pending=rows.reduce((n,r)=>n+(r.sc.pending||0),0),notes=rows.filter(r=>clean(r.row.teacher?.evidence)||clean(r.row.snapshot?.response?.fields?.explanation)),pages=[];let mascot=null;
  if(window.ML_ASSESSMENT_ASSETS?.['assets/business-guides.png'])mascot=await image(ML_ASSESSMENT_ASSETS['assets/business-guides.png']);
  function page(){const c=document.createElement('canvas');c.width=W;c.height=H;const ctx=c.getContext('2d');ctx.fillStyle=PAPER;ctx.fillRect(0,0,W,H);pages.push({c,ctx});return ctx}
  function header(ctx,heading,first=false){text(ctx,'MATH LANDING',M,45,850,18,true,GREEN);if(sample)text(ctx,'SAMPLE REPORT',960,45,245,18,true,MUTED);text(ctx,heading,M,83,1080,first?42:35,true);text(ctx,name,M,147,1050,24,true);text(ctx,scope,M,181,1050,21,false,MUTED);if(mascot)ctx.drawImage(mascot,1035,80,160,81)}
  function footer(ctx,num,total){ctx.strokeStyle=LINE;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(M,H-79);ctx.lineTo(W-M,H-79);ctx.stroke();text(ctx,sample?'Sample report - demonstration results':'Prepared from this student\'s submitted work',M,H-58,940,18,false,MUTED);text(ctx,'Page '+num+' of '+total,W-200,H-58,150,18,false,MUTED)}
  function cardHeight(ctx,item){const {q,row,sc}=item,tw=W-2*M-445;let h=65;for(const [content,size,bold,lineHeight,gap]of [['Task: '+task(q),21,false,27,7],['Learning goal: '+goal(q),20,false,25,8],['Curriculum expectations: '+expectationText(q),18,false,23,8],[response(row),22,true,28,8],[stateLabel(sc)+(sc.overridden?' - teacher adjustment':''),21,true,27,8],['Next step: '+nextStep(q,row,sc),21,false,27,0]]){font(ctx,size,bold);h+=lines(ctx,content,tw).length*lineHeight+gap}return Math.max(350,h+24)}
  function card(ctx,item,number,y,h){const {q,row,im,sc}=item;const x=M,w=W-2*M;box(ctx,x,y,w,h,'#ffffff');text(ctx,number+'. '+title(q),x+23,y+18,w-240,27,true);text(ctx,sc.earned+' / '+sc.possible,x+w-173,y+15,150,31,true,GREEN);text(ctx,q.pageCode,x+24,y+62,380,18,false,MUTED);
   const ix=x+22,iy=y+99,iw=370,ih=208;box(ctx,ix,iy,iw,ih,'#fff8ea',LINE,9);
   // The report has its own student heading; show the model instead of repeating
   // the screenshot's captured name bar and footer in the small PNG panel.
   const cropY=Math.round(im.naturalHeight*.118),cropH=Math.round(im.naturalHeight*.82),scale=Math.min((iw-10)/im.naturalWidth,(ih-10)/cropH),dw=im.naturalWidth*scale,dh=cropH*scale;
   ctx.drawImage(im,0,cropY,im.naturalWidth,cropH,ix+(iw-dw)/2,iy+(ih-dh)/2,dw,dh);
   const tx=x+420,tw=w-445;let ty=y+65;ty=text(ctx,'Task: '+task(q),tx,ty,tw,21,false,INK,27)+7;ty=text(ctx,'Learning goal: '+goal(q),tx,ty,tw,20,false,MUTED,25)+8;ty=text(ctx,'Curriculum expectations: '+expectationText(q),tx,ty,tw,18,false,MUTED,23)+8;ty=text(ctx,response(row),tx,ty,tw,22,true,INK,28)+8;ty=text(ctx,stateLabel(sc)+(sc.overridden?' - teacher adjustment':''),tx,ty,tw,21,true,GREEN,27)+8;ty=text(ctx,'Next step: '+nextStep(q,row,sc),tx,ty,tw,21,false,INK,27);
   if(ty>y+h-14)throw Error('Parent report text needs more space on '+q.pageCode+'.');
   const sup=support(row);text(ctx,sup||'Saved work',ix,y+315,380,18,false,MUTED);
  }
  let resultsContext=null,resultY=0;function resultPage(first){const ctx=page();header(ctx,first?'Your child\'s math results':'Math results continued',first);if(first){text(ctx,(complete?'Completed: ':'Started: ')+date(session.completedAt||session.startedAt),M,208,1070,19,false,MUTED);box(ctx,M,235,W-2*M,90,'#eaf1e3');text(ctx,(pending?'Provisional score: ':'Recorded score: ')+earned+' / '+possible,M+24,252,615,35,true,GREEN);text(ctx,rows.length+' of '+session.pages.length+' questions submitted',715,252,450,23,true);text(ctx,pending?pending+' response/model point(s) awaiting teacher review':complete?'Assessment complete':'Assessment in progress',715,285,450,19,false,MUTED)}else{box(ctx,M,205,W-2*M,73,'#eaf1e3');text(ctx,(pending?'Provisional score: ':'Recorded score: ')+earned+' / '+possible,M+24,222,1080,30,true,GREEN)}resultY=first?355:320;return ctx}
  for(let i=0;i<rows.length;i++){if(!resultsContext)resultsContext=resultPage(true);const h=cardHeight(resultsContext,rows[i]);if(resultY+h>(pages.length===1?1460:1520)){resultsContext=resultPage(false)}card(resultsContext,rows[i],i+1,resultY,h);resultY+=h+20;}
  if(notes.length){let ctx=page();header(ctx,'Comments and student thinking');let y=225;
   for(const item of notes){const heading=item.q.pageCode+' - '+title(item.q),explanation=clean(item.row.snapshot?.response?.fields?.explanation),note=(explanation?'Student explanation: '+explanation+'   ':'')+(clean(item.row.teacher?.evidence)?'Teacher: '+clean(item.row.teacher.evidence):''),sup=support(item.row);font(ctx,23);const chunks=lines(ctx,note,W-2*M-40);let at=0;
    while(at<chunks.length){if(y>H-230){ctx=page();header(ctx,'Comments and thinking continued');y=225}y=text(ctx,heading,M,y,W-2*M,27,true)+10;if(sup)y=text(ctx,sup,M,y,W-2*M,22,false,MUTED)+7;
     const count=Math.max(1,Math.floor((H-125-y)/31));for(const line of chunks.slice(at,at+count)){y=text(ctx,line,M+12,y,W-2*M-24,23,false,INK,31)}at+=count;y+=28;if(at<chunks.length){ctx=page();header(ctx,'Comments and thinking continued');y=225}}
   }
  }
  // Keep the scoring explanation close to the results without adding an answer key.
  const first=pages[0].ctx;text(first,'Each answer or model earns one point. Exchange and different-model points apply where specified. Pending marks need teacher review. Block movement is recorded separately.',M,1480,W-2*M,19,false,MUTED,24);
  if(notes.length)text(first,'Teacher comments follow the result pages.',M,1532,W-2*M,19,false,MUTED,24);
  const pdf=new ML_SCREEN_PDF({width:612,height:792});for(let i=0;i<pages.length;i++){footer(pages[i].ctx,i+1,pages.length);await pdf.addPNG(pages[i].c.toDataURL('image/png'))}return pdf.finish();
 }
 return {create};
})();

