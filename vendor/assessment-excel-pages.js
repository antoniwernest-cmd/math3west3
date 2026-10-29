/* One learner PNG and its assessment per portrait print page. */
window.ML_ASSESSMENT_EXCEL_PAGES={create(book,title,count){
 const sheet=book.addWorksheet('Work and assessment',{views:[{showGridLines:false}],pageSetup:{paperSize:1,orientation:'portrait',scale:100,fitToPage:false,horizontalCentered:true,printArea:'A1:H'+(32*count),margins:{left:.3,right:.3,top:.3,bottom:.3,header:.1,footer:.1}}});
 sheet.columns=Array.from({length:8},()=>({width:11}));sheet.headerFooter={oddFooter:'&LMath Landing&C&P / &N&RStudent work and assessment'};
 book.views=[{activeTab:0,firstSheet:0}];
 const line=(row,text,height,fill,bold=false,size=11)=>{sheet.mergeCells(row,1,row,8);const cell=sheet.getCell(row,1);cell.value=text;cell.font={name:'Andika',size,bold,color:{argb:'FF183F45'}};cell.alignment={vertical:'middle',wrapText:true};if(fill)cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:fill}};sheet.getRow(row).height=height;return cell};
 return {sheet,add(image,index,{question,record,student,level,where,summary,fill='FFF0F5EC'}){
  const start=1+index*32,t=record.teacher||{},a=window.ML_LEARNER_ASSESSMENT.result(record),evidence=[t.model?'Model / steps: '+t.model:'',t.evidence?'Comment / next step: '+t.evidence:''].filter(Boolean).join('\n')||'No teacher comment recorded.';
  if(index)sheet.getRow(start-1).addPageBreak();
  line(start,title,24,'FF286C63',true,14).font.color={argb:'FFFFFFFF'};
  line(start+1,student+' · '+level+' · '+where,20,fill,true,10);
  line(start+2,(index+1)+'. '+question.title+'\nOntario: '+question.codes.join(' · '),32,null,true,11);
  // The image occupies 15 fixed rows, leaving its assessment on this same page.
  for(let i=3;i<=17;i++)sheet.getRow(start+i).height=19;
  sheet.addImage(image,{tl:{col:0,row:start+2+.12},ext:{width:650,height:650*768/1366},editAs:'oneCell'});
  line(start+18,'',6);
  line(start+19,'Attempts: '+(record.attempts||[]).length+' · Automatic check: '+a.automatic+' · '+(record.done?'Finished':'In progress'),24,fill,true);
  line(start+20,'Teacher decision: '+a.decision+(a.stale?' · Student changed work; reassessment needed':''),24,fill,true);
  line(start+21,'Achievement: '+(t.level||'Not recorded')+'    Support: '+(t.support||'Not recorded'),24,null);
  line(start+22,'Assessment: '+(t.type||'Not recorded')+'    Date: '+(t.date||'Not recorded'),24,null);
  line(start+23,'Teacher evidence and next step',18,fill,true);
  sheet.mergeCells(start+24,1,start+26,8);const notes=sheet.getCell(start+24,1);notes.value=evidence;notes.font={name:'Andika',size:10,color:{argb:'FF183F45'}};notes.alignment={vertical:'top',wrapText:true};
  sheet.mergeCells(start+28,1,start+30,8);const answer=sheet.getCell(start+28,1);answer.value=summary||'No response saved yet.';answer.font={name:'Andika',size:10,color:{argb:'FF183F45'}};answer.alignment={vertical:'top',wrapText:true};
  // Allocate more space to long notes without crossing the portrait page break.
  const lines=text=>String(text).split('\n').reduce((n,line)=>n+Math.max(1,Math.ceil(line.length/90)),0),noteHeight=Math.max(66,lines(evidence)*12),answerHeight=Math.max(66,lines(answer.value)*12),extra=noteHeight+answerHeight-132;
  for(let i=24;i<=26;i++)sheet.getRow(start+i).height=noteHeight/3;
  for(let i=28;i<=30;i++)sheet.getRow(start+i).height=answerHeight/3;
  if(extra>0){const imageSpace=Math.max(90,285-extra);for(let i=3;i<=17;i++)sheet.getRow(start+i).height=imageSpace/15;const height=Math.min(imageSpace*4/3-4,650*768/1366),width=height*1366/768;const drawing=sheet.getImages().at(-1);drawing.range.ext={width,height};drawing.range.tl.col=(650-width)/650*4;}
  line(start+27,'Saved answer and model',18,fill,true);
  line(start+31,(question.pageCode?question.pageCode+' · ':'')+question.id+' · '+(t.savedAt?'Teacher record saved '+new Date(t.savedAt).toLocaleDateString('en-CA'):'Teacher record not saved'),16,null,false,9);
 }};
}};
