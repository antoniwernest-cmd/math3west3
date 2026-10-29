/* Teacher-only PNG preview and audit printing. */
window.ML_AUDIT_PRINT=(()=>{
'use strict';
const auditIDs={"modal":"auditReviewDialog","modalTitle":"auditReviewTitle","modalBody":"auditReviewBody","modalFooter":"auditReviewFooter","closeModal":"auditReviewClose","teacherAdmin":"auditWheel"}; const $=id=>document.getElementById(auditIDs[id]||id),safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let api,busy=false,generation=0,book=null;
const allowed=()=>!!api?.isUnlocked(),printCSS="@page{size:letter landscape;margin:.3in}*{box-sizing:border-box}html{margin:0;background:#fff}body{margin:.3in;color:#17252b;font-family:Andika,sans-serif;font-size:10pt}.audit-paper{width:10.4in;height:7.8in;display:grid;grid-template-rows:.31in repeat(3,minmax(0,1fr));gap:.065in;break-after:page;page-break-after:always}.audit-paper:last-child{break-after:auto;page-break-after:auto}.audit-paper>header{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #697879;font-size:11pt;font-weight:700}.audit-paper>header small{font-size:8pt;font-weight:400}.audit-card{min-height:0;display:grid;grid-template-columns:minmax(0,42%) minmax(0,1fr);gap:.14in;padding:.04in 0;border-bottom:1px solid #bcc5c6}.audit-picture{min-width:0;min-height:0;display:flex;align-items:center;justify-content:center}.audit-picture img{display:block;max-width:100%;max-height:2.28in;width:auto;height:auto;object-fit:contain;border:3px solid #000}.audit-copy{min-width:0;min-height:0;overflow:hidden;font-size:10.5pt;line-height:1.16}.audit-copy h3{font-size:1.04em;line-height:1.15;margin:0 0 .025in}.audit-copy p{margin:.015in 0;overflow-wrap:anywhere}.audit-reference{font-size:.8em;color:#3e5358}.audit-note-text{white-space:pre-wrap;overflow-wrap:anywhere;margin-top:.045in!important}@media print{html,body{margin:0;padding:0;background:#fff}.audit-paper{break-inside:avoid;page-break-inside:avoid}}";
function refresh(){if(!api)return;const count=api.flags().length;for(const id of ['teacherAuditPNG','teacherAuditPrint','teacherAuditExport']){const b=$(id);if(b){b.hidden=!allowed();b.disabled=busy||api.isBusy()||(id!=='teacherAuditPNG'&&!count);}}const printButton=$('teacherAuditPrint');if(printButton){if(!printButton.querySelector('#teacherAuditPrintCount'))printButton.innerHTML='⎙ Print audit <b id="teacherAuditPrintCount">0</b>';printButton.querySelector('#teacherAuditPrintCount').textContent=String(count);printButton.setAttribute('aria-label','Print audit '+count);printButton.dataset.auditCount=String(count);}}
function destroy(){book?.frame.remove();book=null;}
function lock(){generation++;busy=false;destroy();refresh();}
function shell(pages){const font=window.ML_PROJECT_FONT?.stylesheet||new URL('assets/fonts/andika.css',location.href).href;return '<!doctype html><html><head><meta charset="utf-8"><title>Math Landing - Teacher audit</title><style>'+(window.ML_ASSESSMENT_FONT_CSS||'')+'</style><style>'+printCSS+'</style></head><body>'+pages.join('')+'</body></html>';}
function text(n){return(n.addToClasswork?'Choose me for classwork.\n\n':'')+(n.addToHomework?'Choose me for homework.\n\n':'')+(n.applyToSimilar?'Apply this change to all similar questions in Excite and Inspire.\n\n':'')+(n.reasons?.length?'Requested changes: '+n.reasons.join(' · ')+'\n\n':'')+(n.comment||'No additional teacher notes.');}
function card(item,i){const n=item.note;return '<article class="audit-card" data-audit-id="'+safe(n.id)+'"><div class="audit-picture"><img src="'+safe(item.png)+'" alt="Audit PNG: '+safe(n.title)+'"></div><div class="audit-copy"><h3>'+safe((i+1)+'. '+n.title)+'</h3><p>'+safe([n.where,n.contextLabel].filter(Boolean).join(' · '))+'</p><p class="audit-reference">'+safe((n.pageCode||window.ML_PAGE_CODES?.forNote(n)||'')+' · '+n.pageId)+(n.codes?.length?' · '+safe(n.codes.join(' · ')):'')+'</p><p class="audit-note-text">'+safe(text(n))+'</p></div></article>';}
function paper(cards,p,total,count){return '<section class="audit-paper"><header><span>Math Landing · Teacher audit</span><small>'+count+' flagged screens · Page '+(p+1)+' of '+total+'</small></header>'+cards.join('')+'</section>';}
async function ready(frame,html){await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('The audit preview could not be loaded. Please try again.')),20000);frame.onload=async()=>{try{const d=frame.contentDocument;await d.fonts.ready;await Promise.all([...d.images].map(i=>i.decode().catch(()=>{})));clearTimeout(timer);resolve();}catch(e){clearTimeout(timer);reject(e);}};frame.srcdoc=html;});}
async function create(items){for(const item of items){const code=item.note.pageCode||window.ML_PAGE_CODES?.forNote(item.note);if(code&&window.ML_PAGE_CODES?.stampPNG)item.png=await window.ML_PAGE_CODES.stampPNG(item.png,code);}
 destroy();const frame=document.createElement('iframe');frame.id='teacherAuditPrintDocument';frame.title='Teacher audit print document';frame.setAttribute('aria-hidden','true');frame.setAttribute('data-html2canvas-ignore','true');frame.setAttribute('sandbox','allow-same-origin allow-modals');frame.style.cssText='position:fixed;left:-20000px;top:0;width:1056px;height:816px;border:0;pointer-events:none';document.body.append(frame);
 const cards=items.map(card),initial=[];for(let i=0;i<cards.length;i+=3)initial.push(paper(cards.slice(i,i+3),i/3,Math.ceil(cards.length/3),items.length));
 try{
  await ready(frame,shell(initial));const d=frame.contentDocument,prepared=[];
  for(const original of [...d.querySelectorAll('.audit-card')]){
   const copy=original.querySelector('.audit-copy'),body=original.querySelector('.audit-note-text'),h=copy.querySelector('h3'),title=h.textContent;
   let font=10.5;while(copy.scrollHeight>copy.clientHeight+1&&font>8){font-=.5;copy.style.fontSize=font+'pt';}
   if(copy.scrollHeight<=copy.clientHeight+1){prepared.push(original.outerHTML);continue;}
   let remaining=body.textContent,part=0;
   while(remaining.length){
    h.textContent=title+(part?' (continued)':'');body.textContent=remaining;
    if(copy.scrollHeight<=copy.clientHeight+1){prepared.push(original.outerHTML);break;}
    let low=0,high=remaining.length;
    while(low<high){const mid=Math.ceil((low+high)/2);body.textContent=remaining.slice(0,mid);if(copy.scrollHeight<=copy.clientHeight+1)low=mid;else high=mid-1;}
    if(!low)throw Error('The audit heading is too long to print: '+title);
    let cut=low;const gap=remaining.slice(0,low).search(/\s+\S*$/);if(gap>low/2)cut=gap+1;
    body.textContent=remaining.slice(0,cut);prepared.push(original.outerHTML);remaining=remaining.slice(cut);part++;
   }
  }
  const pages=[],total=Math.ceil(prepared.length/3);for(let i=0;i<prepared.length;i+=3)pages.push(paper(prepared.slice(i,i+3),i/3,total,items.length));
  d.body.innerHTML=pages.join('');await d.fonts.ready;await Promise.all([...d.images].map(i=>i.decode().catch(()=>{})));book={frame,pages,count:items.length,cards:prepared.length};
 }catch(e){frame.remove();throw e;}
}
function fit(){const box=$('teacherAuditPrintPreview'),frame=$('teacherAuditPrintPreviewFrame');if(!box||!frame)return;const scale=Math.min(box.clientWidth/1056,box.clientHeight/816);frame.style.transform='scale('+scale+')';frame.style.left=(box.clientWidth-1056*scale)/2+'px';frame.style.top=(box.clientHeight-816*scale)/2+'px';}
function print(){if(!allowed()||!book)return;book.frame.contentWindow.focus();book.frame.contentWindow.print();}
async function preview(p=0){
 if(!allowed()||!book)return;p=Math.max(0,Math.min(p,book.pages.length-1));
 api.modal('Print teacher audit','<p class="audit-print-summary">All '+book.count+' flagged screens · 3 per landscape page · Audit notes beside each PNG</p><div id="teacherAuditPrintPreview"><iframe id="teacherAuditPrintPreviewFrame" title="Teacher audit print page '+(p+1)+'" sandbox="allow-same-origin"></iframe></div>','<button id="teacherAuditPrintPrev" '+(!p?'disabled':'')+'>← Previous</button><span id="teacherAuditPrintPage">Page '+(p+1)+' of '+book.pages.length+'</span><button id="teacherAuditPrintNext" '+(p===book.pages.length-1?'disabled':'')+'>Next →</button><button id="teacherAuditPrintAll" class="primary">Print all '+book.count+' screens</button>');
 $('teacherAuditPrintPrev').onclick=()=>preview(p-1);$('teacherAuditPrintNext').onclick=()=>preview(p+1);$('teacherAuditPrintAll').onclick=print;
 await ready($('teacherAuditPrintPreviewFrame'),shell([book.pages[p]]));fit();
}
async function captureMissing(note,token){
 if(!note.route||token!==generation||!allowed())return null;
 api.navigate(note);const until=Date.now()+20000;
 while(Date.now()<until){if(token!==generation||!allowed())return null;const ctx=api.context(),isQuestion=ctx.type==='question',f=$('engine');if(ctx.id===note.id&&(!isQuestion||(! $('check').disabled&&f.contentWindow.ML_CONFIG?.id===note.pageId)))break;await new Promise(r=>setTimeout(r,25));}
 if(api.context().id!==note.id||token!==generation||!allowed()||(api.context().type==='question'&&($('check').disabled||$('engine').contentWindow.ML_CONFIG?.id!==note.pageId)))return null;
 await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));await api.capture(api.getNote());return api.imageGet(note.id);
}
async function showAll(download=false){
 if(!allowed()||busy||api.isBusy())return;const notes=api.flags().map(n=>structuredClone(n));if(!notes.length){api.toast('Tick Edit on the screens you want to include.');return;}
 const origin=structuredClone(api.context()),lastPages=new Map();for(const n of notes){const student=n.route?.student;if(student){const key='math-landing:v1:last:'+student;lastPages.set(key,localStorage.getItem(key));}}let navigated=false;const token=++generation;busy=true;refresh();api.modal('Preparing teacher audit','<p>Preparing all '+notes.length+' flagged screens and their audit notes.</p><progress class="export-progress" id="teacherAuditPrintProgress" max="'+notes.length+'" value="0"></progress><p id="teacherAuditPrintStatus"></p>','<button id="teacherAuditPrintCancel">Cancel</button>');
 $('teacherAuditPrintCancel').onclick=()=>{generation++;busy=false;$('modal').close();refresh();};const items=[],missing=[];
 try{
  for(const [i,n]of notes.entries()){
   if(token!==generation||!allowed())return;let blob=await api.imageGet(n.id);
   if(!blob){if($('teacherAuditPrintStatus'))$('teacherAuditPrintStatus').textContent='Saving missing PNG · '+n.title;navigated=true;blob=await captureMissing(n,token);}
   if(!blob)missing.push(n);else items.push({note:n,png:await api.asDataURL(blob)});
   if($('teacherAuditPrintProgress'))$('teacherAuditPrintProgress').value=i+1;if($('teacherAuditPrintStatus'))$('teacherAuditPrintStatus').textContent=(i+1)+' of '+notes.length+' · '+n.title;await new Promise(r=>setTimeout(r,0));
  }
  if(navigated){api.navigate(origin);for(const [key,value]of lastPages){if(value===null)localStorage.removeItem(key);else localStorage.setItem(key,value);}navigated=false;}
  if(token!==generation||!allowed())return;
  if(missing.length){api.modal('Update the missing audit PNGs','<p>'+missing.length+' flagged screens need a saved PNG. Open a screen below, then use Screen PNG at the bottom.</p><div class="audit-missing-list">'+missing.slice(0,5).map((n,i)=>'<button data-audit-missing="'+i+'">'+safe(n.title)+'</button>').join('')+'</div>','<button id="teacherAuditMissingDone">Done</button>');document.querySelectorAll('[data-audit-missing]').forEach(b=>b.onclick=()=>{$('modal').close();api.navigate(missing[+b.dataset.auditMissing]);});$('teacherAuditMissingDone').onclick=()=>$('modal').close();return;}
  await create(items);if(token!==generation||!allowed()){destroy();return;}if(download)await excelDownload(items,token);else{busy=false;refresh();await preview();}
 }catch(e){destroy();if(token===generation){$('modal').close();api.toast(e.message);}}finally{if(navigated){api.navigate(origin);for(const [key,value]of lastPages){if(value===null)localStorage.removeItem(key);else localStorage.setItem(key,value);}}if(token===generation){busy=false;refresh();}}
}
async function showScreen(){
 if(!allowed()||busy||api.isBusy())return;const token=++generation;busy=true;refresh();
 try{
  const note=api.getNote();if(!await api.capture(note))return;const blob=await api.imageGet(note.id);if(!blob)throw Error('The screen PNG could not be found. Please try again.');const png=await api.asDataURL(blob);if(token!==generation||!allowed())return;
  api.modal('Teacher audit · Screen PNG','<figure class="audit-screen-png"><img src="'+safe(png)+'" alt="Audit PNG: '+safe(note.title)+'"><figcaption>'+safe(note.title)+' · '+safe(note.where)+'</figcaption></figure>','<button id="teacherAuditPNGDownload">Download PNG</button><button id="teacherAuditPNGNotes">'+(note.flagged?'Edit audit notes':'Add screen to audit')+'</button><button id="teacherAuditPNGPrint" class="primary" '+(!api.flags().length?'disabled':'')+'>Print audit ('+api.flags().length+')</button>');
  $('teacherAuditPNGDownload').onclick=()=>{if(allowed())api.download('Math-Landing-Audit-'+String(note.pageId).replace(/[^a-z0-9._-]+/gi,'-')+'.png','image/png',blob);};$('teacherAuditPNGNotes').onclick=()=>{if(allowed()){if(note.flagged)api.edit(note.id);else api.flag(note);}};$('teacherAuditPNGPrint').onclick=showAll;
 }catch(e){api.toast(e.message);}finally{if(token===generation){busy=false;refresh();}}
}
async function excelDownload(items,token){
 const workbook=new ExcelJS.Workbook();workbook.creator='Math Landing';
 const sheet=workbook.addWorksheet('PNG pages',{views:[{showGridLines:false}],pageSetup:{paperSize:1,orientation:'landscape',scale:88,fitToPage:false,horizontalCentered:true,margins:{left:.3,right:.3,top:.3,bottom:.3,header:.1,footer:.15}}});
 sheet.columns=[{width:63},{width:2},{width:90}];sheet.headerFooter={oddFooter:'&LTeacher audit&C3 PNGs per landscape page&R&P / &N'};
 const source=new Map(items.map(item=>[item.note.id,item])),images=new Map();
 const parts=[...book.frame.contentDocument.querySelectorAll('.audit-card')].map(el=>({id:el.dataset.auditId,heading:el.querySelector('h3').textContent,context:el.querySelector('.audit-copy>p').textContent,reference:el.querySelector('.audit-reference').textContent,text:el.querySelector('.audit-note-text').textContent,font:Math.min(10,parseFloat(el.querySelector('.audit-copy').style.fontSize)||10),width:el.querySelector('img').naturalWidth,height:el.querySelector('img').naturalHeight}));
 const pageCount=Math.ceil(parts.length/3);
 sheet.pageSetup.printArea='A1:C'+pageCount*8;
 for(let p=0;p<pageCount;p++){
  const start=p*8+1;sheet.mergeCells('A'+start+':C'+start);sheet.getRow(start).height=22;sheet.getCell('A'+start).value='Math Landing · Teacher audit';sheet.getCell('A'+start).font={name:'Andika',size:14,bold:true};
  sheet.mergeCells('A'+(start+1)+':C'+(start+1));sheet.getRow(start+1).height=18;sheet.getCell('A'+(start+1)).value=items.length+' flagged screens · Page '+(p+1)+' of '+pageCount;sheet.getCell('A'+(start+1)).font={name:'Andika',size:10};
  for(let k=0;k<3;k++){
   const row=start+2+k*2,part=parts[p*3+k];sheet.getRow(row).height=190;sheet.getRow(row+1).height=6;if(!part)continue;
   const item=source.get(part.id),cell=sheet.getCell('C'+row);
   cell.value=[part.heading,part.context,part.reference,'',part.text].join('\n');cell.font={name:'Andika',size:part.font,color:{argb:'FF17252B'}};cell.alignment={vertical:'top',wrapText:true};
   sheet.getCell('A'+row).border={top:{style:'medium',color:{argb:'FF000000'}},bottom:{style:'medium',color:{argb:'FF000000'}},left:{style:'medium',color:{argb:'FF000000'}},right:{style:'medium',color:{argb:'FF000000'}}};
   if(!images.has(part.id))images.set(part.id,workbook.addImage({base64:item.png,extension:'png'}));
   const ratio=Math.min(426/(part.width||1366),242/(part.height||768)),width=(part.width||1366)*ratio,height=(part.height||768)*ratio;
   sheet.addImage(images.get(part.id),{tl:{col:(446-width)/2/446,row:row-1+(253.333-height)/2/253.333},ext:{width,height},editAs:'oneCell'});
  }
  if(p<pageCount-1)sheet.getRow(start+7).addPageBreak();
 }
 const detail=workbook.addWorksheet('Edit instructions',{views:[{state:'frozen',ySplit:1}]});detail.columns=[{header:'No.',width:7},{header:'Page code',width:16},{header:'Page ID',width:40},{header:'Location',width:35},{header:'Screen',width:45},{header:'Requested changes',width:50},{header:'Teacher notes',width:90},{header:'Apply change to',width:46},{header:'Choose for homework',width:25},{header:'Choose for classwork',width:25}];
 for(const [i,item]of items.entries()){const n=item.note;const row=detail.addRow([i+1,n.pageCode||window.ML_PAGE_CODES?.forNote(n)||'',n.pageId,[n.where,n.contextLabel].filter(Boolean).join('\n'),n.title,(n.reasons||[]).join('\n'),n.comment||'',n.applyToSimilar?'All similar questions in Excite and Inspire':'This screen only',n.addToHomework?'Yes':'No',n.addToClasswork?'Yes':'No']);row.height=100;row.eachCell(c=>{c.font={name:'Andika',size:10};c.alignment={vertical:'top',wrapText:true};});}
 detail.getRow(1).font={name:'Andika',size:10,bold:true};detail.getRow(1).height=25;
 const bytes=await workbook.xlsx.writeBuffer();if(!allowed()||token!==generation)return;
 const filename='Math-Landing-Teacher-Audit-PNGs.xlsx';api.download(filename,'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',bytes);
 api.modal('Audit Excel downloaded','<p><strong>'+filename+'</strong></p><p>'+items.length+' selected screens, with three PNGs and their audit notes on each landscape page.</p><p>Open the downloaded workbook to print the PNG pages tab.</p>','<button id="teacherAuditDownloadedPreview">Print preview</button><button id="teacherAuditDownloadedDone" class="primary">Done</button>');
 $('teacherAuditDownloadedPreview').onclick=()=>preview();$('teacherAuditDownloadedDone').onclick=()=>$('modal').close();
 return{filename,screens:items.length,pages:pageCount};
}

function init(adapter){api=adapter;window.addEventListener('resize',fit);$('modal').addEventListener('close',()=>{if(busy){generation++;busy=false;}destroy();refresh();});refresh();}
return{init,refresh,lock,cancel:lock,showAll,showScreen,downloadExcel:()=>showAll(true)};
})();

