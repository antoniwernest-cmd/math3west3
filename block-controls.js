/* Native model drafts share the larger persistent store instead of the quota-limited cache. */
window.ML_MODEL_DRAFTS=(()=>{const cache=new Map();let database,lastError=null,pending=Promise.resolve();const ready=new Promise((resolve,reject)=>{const r=indexedDB.open('math-landing-model-drafts-v1',1);r.onupgradeneeded=()=>r.result.createObjectStore('cache');r.onerror=()=>reject(r.error);r.onsuccess=()=>{database=r.result;const t=database.transaction('cache'),s=t.objectStore('cache'),keys=s.getAllKeys(),values=s.getAll();t.oncomplete=()=>{keys.result.forEach((k,i)=>{if(!cache.has(k))cache.set(k,values.result[i])});resolve()};t.onerror=()=>reject(t.error)}}).catch(e=>{lastError=e});function write(key,value){cache.set(key,value);pending=pending.then(async()=>{await ready;if(!database)return;await new Promise((resolve,reject)=>{const t=database.transaction('cache','readwrite');t.objectStore('cache').put(value,key);t.oncomplete=resolve;t.onerror=()=>reject(t.error)})}).catch(e=>{lastError=e})}function remove(key){cache.delete(key);pending=pending.then(async()=>{await ready;if(database){const t=database.transaction('cache','readwrite');t.objectStore('cache').delete(key)}}).catch(e=>{lastError=e})}return{ready,write,remove,get:key=>cache.get(key),entries:(student,id)=>[...cache].filter(([k])=>(!student||k.includes(student))&&(!id||k.includes(id))),flush:()=>pending,error:()=>lastError}})();
/* Pointer transport over the original engine's state, move, history and renderer. */
window.ML_BLOCK_CONTROLS=(()=>{'use strict';
 function install(){
  const cfg=ML_CONFIG;if(cfg.assessment?.pencilShare)return;installVisuals();const api=window.ML_AUDIT10_REVISED;if(!api||!window.ML_ENGINE||document.body.dataset.blockControlsReady)return;
  document.body.dataset.blockControlsReady='true';
  const copy=x=>JSON.parse(JSON.stringify(x)),type=api.q.type,token=id=>api.state().tokens.find(t=>t.id===id);
  let drag=null,ignoreClickUntil=0,queued=false;
  const emit=()=>parent.postMessage({type:'ml-state',id:cfg.id,payload:ML_ENGINE.get()},'*');
  function signal(detail){document.dispatchEvent(new CustomEvent('ml-block-operation',{detail}));emit()}
  function id(){const s=api.state();s.controlSerial=(s.controlSerial||0)+1;return 'mlc-'+s.controlSerial}
  const balance=()=>type==='balance';
  function allowed(){if(cfg.assessment?.valueShapes)return ['a','b'];if(cfg.assessment?.colourSubtract)return ['work'];return balance()?['a','b','known','work']:type==='subtract'?['start','removed']:['add','combine','friendly'].includes(type)?['a','b']:['work']}
  function move(payload,to,method,point){
   if(point)for(const b of document.querySelectorAll('[data-piece]')){const old=token(b.dataset.piece),full=b.closest('.rv-mat')?.querySelector('.rv-pv,.shape-pieces,.rv-ten-mat');if(!old||!full)continue;const r=b.getBoundingClientRect(),f=full.getBoundingClientRect();if(f.width&&f.height&&r.width&&r.height)Object.assign(old,{visualX:(r.x+r.width/2-f.x)/f.width,visualY:(r.y+r.height/2-f.y)/f.height,visualScope:'pad',...(b.closest('.rv-tenframes')?{visualWidth:r.width,visualHeight:r.height}:{})});}
   const before=copy(api.state().tokens),t=payload.kind==='token'?token(payload.id):null,from=t?.loc;
   const zone=document.querySelector('.rv-mat[data-drop="'+to+'"]'),dropArea=zone?.querySelector('.rv-pv,.shape-pieces,.rv-ten-mat')||zone,dropRect=dropArea?.getBoundingClientRect(),anchor=point&&dropRect?.width>0?{x:Math.max(0,Math.min(1,(point.x-dropRect.x)/dropRect.width)),y:Math.max(0,Math.min(1,(point.y-dropRect.y)/dropRect.height))}:null;
   if(payload.kind==='card'){const old=copy(api.state().order);api.move(payload,to);signal({kind:'card',method,changed:JSON.stringify(old)!==JSON.stringify(api.state().order)});return}
   if(payload.kind==='bank'){
    if(!allowed().includes(to))return;
    if(balance()||cfg.assessment?.valueShapes)api.action(()=>{api.state().tokens.push({id:id(),value:payload.value,loc:to,home:'work',added:true});if(cfg.assessment?.valueShapes)api.state().shapeActivePad=to});else api.move(payload,to);
   }else if(t){
    if(to===from){
     if(anchor)api.action(()=>Object.assign(token(t.id),{visualX:anchor.x,visualY:anchor.y,visualScope:'pad'}));
    }else if(to==='bank'&&!['add','combine','friendly','subtract','read','name'].includes(type))api.action(()=>api.state().tokens=api.state().tokens.filter(x=>x.id!==t.id));
    else if(allowed().includes(to)){if(balance()||cfg.assessment?.valueShapes)api.action(()=>{t.home||=from;t.loc=to;delete t.visualX;delete t.visualY;if(cfg.assessment?.valueShapes)api.state().shapeActivePad=to});else api.move(payload,to)}
   }
   const result=payload.id?token(payload.id):api.state().tokens.find(t=>!before.some(old=>old.id===t.id));if(anchor&&result&&result.loc===to){Object.assign(result,{visualX:anchor.x,visualY:anchor.y,visualScope:'pad'});api.state().lastPlacedBlock=result.id;api.state().resolveBlockOverlap=result.id;api.state().resolveBlockOverlapFrames=3;ML_REVISED.setDone(api.state().done)}
   const after=copy(api.state().tokens),changed=JSON.stringify(before)!==JSON.stringify(after);
   if(changed){if(type==='subtract'&&from&&result?.loc!==from){const s=api.state();s.assessmentActions||={ungroup10:0,group10:0,taps:0,drags:0};s.assessmentActions[method==='drag'?'drags':'taps']++;ML_REVISED.setDone(s.done)}signal({kind:'move',method,payload,before,after,from,to:result?.loc||to})}
   if(cfg.review?.type==='add'&&['a','b'].includes(to))window.ML_SHOW_ASSESSMENT_SET?.(to==='a'?0:1);schedule();
  }
  function exchange(button){
   document.dispatchEvent(new CustomEvent('ml-control-feedback',{detail:{button}}));
   const split=button.dataset.split,group=button.dataset.group,[loc,value]=(split||group).split(':'),v=+value,s=api.state(),before=copy(s.tokens),ts=s.tokens.filter(t=>t.loc===loc&&t.value===v),paint=new Set(s.paint||[]),white=ts.filter(t=>!paint.has(t.id)),coloured=ts.filter(t=>paint.has(t.id)),source=split?ts.slice(0,1):cfg.assessment?.colourSubtract?(white.length>=10?white:coloured).slice(0,10):ts.slice(0,10),painted=source.length>0&&source.every(t=>paint.has(t.id));
   if(source.length!==(split?1:10))return;
   api.action(()=>{
    const current=api.state(),removed=new Set(source.map(t=>t.id));current.tokens=current.tokens.filter(t=>!removed.has(t.id));
    const inserted=[];if(split){for(let i=0;i<10;i++){const fresh={id:id(),value:v/10,loc,home:source[0].home||loc,added:source[0].added,ungrouped:(current.tradeSerial||0)%3};current.tokens.push(fresh);inserted.push(fresh.id)}current.tradeSerial=(current.tradeSerial||0)+1}
    else{const fresh={id:id(),value:v*10,loc,home:source.every(t=>t.home===source[0].home)?source[0].home:loc,added:source.some(t=>t.added)};current.tokens.push(fresh);inserted.push(fresh.id)}
    if(cfg.assessment?.colourSubtract){current.paint=(current.paint||[]).filter(id=>!removed.has(id));if(painted)current.paint.push(...inserted);current.assessmentActions||={};const key=(split?'ungroup':'group')+v;current.assessmentActions[key]=(current.assessmentActions[key]||0)+1;}
    current.exchangeEvidence||=[];current.exchangeEvidence.push({action:split?'Ungroup':'Group',pad:loc,fromValue:v,fromCount:split?1:10,toValue:split?v/10:v*10,toCount:split?10:1});
    if(cfg.assessment?.regroupProbe&&group&&v===1){current.regroupTrades||=[];current.regroupTrades.push({from:10,to:1,valueBefore:1,valueAfter:10,loc,blueOnes:source.filter(t=>t.home==='b').length,beforeOnes:ts.length,afterOnes:ts.length-10})}
    if(type==='subtract'){current.assessmentActions||={ungroup10:0,group10:0,taps:0,drags:0};if(v===10&&split)current.assessmentActions.ungroup10++;if(v===1&&group)current.assessmentActions.group10++}
   });
   signal({kind:split?'split':'group',method:'button',loc,value:v,before,after:copy(api.state().tokens)});schedule();
  }
  function zoneAt(x,y){return document.elementFromPoint(x,y)?.closest('[data-drop]')}
  function clear(){drag?.ghost?.remove();document.querySelectorAll('.ml-drop-active').forEach(e=>e.classList.remove('ml-drop-active'));drag=null}
  window.addEventListener('pointerdown',e=>{
   const b=e.target.closest('[data-piece],[data-bank],[data-card]');if(e.button!==0||e.isPrimary===false||!b||b.disabled)return;
   const payload=b.dataset.piece?{kind:'token',id:b.dataset.piece}:b.dataset.bank?{kind:'bank',value:+b.dataset.bank}:{kind:'card',value:+b.dataset.card};
   if(payload.kind==='token'&&!token(payload.id))return;
   drag={pointer:e.pointerId,x:e.clientX,y:e.clientY,source:b,payload,moved:false,ghost:null};try{b.setPointerCapture?.(e.pointerId)}catch{}e.stopImmediatePropagation();
  },true);
  window.addEventListener('pointermove',e=>{
   const d=drag;if(!d||d.pointer!==e.pointerId)return;e.stopImmediatePropagation();if(!d.moved&&Math.hypot(e.clientX-d.x,e.clientY-d.y)<5)return;e.preventDefault();
   if(!d.moved){d.moved=true;const r=d.source.getBoundingClientRect(),ghost=d.source.cloneNode(true);ghost.removeAttribute('id');ghost.removeAttribute('data-piece');ghost.className='ml-block-drag-ghost '+d.source.className;ghost.style.cssText='position:fixed!important;pointer-events:none!important;z-index:2147483000!important;margin:0!important;min-width:0!important;min-height:0!important;width:'+r.width+'px!important;height:'+r.height+'px!important;opacity:.85!important;transform:translate(-50%,-50%)!important';ghost.setAttribute('aria-hidden','true');document.body.append(ghost);d.ghost=ghost}
   d.ghost.style.setProperty('left',e.clientX+'px','important');d.ghost.style.setProperty('top',e.clientY+'px','important');
   document.querySelectorAll('.ml-drop-active').forEach(n=>n.classList.remove('ml-drop-active'));zoneAt(e.clientX,e.clientY)?.classList.add('ml-drop-active');
  },{capture:true,passive:false});
  window.addEventListener('pointerup',e=>{
   const d=drag;if(!d||d.pointer!==e.pointerId)return;e.stopImmediatePropagation();const moved=d.moved;d.ghost?.remove();const zone=zoneAt(e.clientX,e.clientY);clear();
   if(!moved)return;e.preventDefault();ignoreClickUntil=performance.now()+350;if(zone)move(d.payload,zone.dataset.drop,'drag',{x:e.clientX,y:e.clientY});
  },true);
  window.addEventListener('pointercancel',clear,true);window.addEventListener('blur',clear);
  window.addEventListener('click',e=>{
   const b=e.target.closest('button');if(!b)return;
   if(b.hasAttribute('data-split')||b.hasAttribute('data-group')){e.preventDefault();e.stopImmediatePropagation();if(!b.disabled)exchange(b);return}
   if(!b.dataset.piece&&!b.dataset.bank&&!b.dataset.card)return;
   if(performance.now()<ignoreClickUntil){e.preventDefault();e.stopImmediatePropagation();return}
   if(b.disabled)return;
   if(b.dataset.bank){document.dispatchEvent(new CustomEvent('ml-control-feedback',{detail:{button:b}}));e.preventDefault();e.stopImmediatePropagation();move({kind:'bank',value:+b.dataset.bank},cfg.assessment?.valueShapes?(api.state().shapeActivePad||'a'):'work','tap');return}
   const t=token(b.dataset.piece);if(t&&cfg.assessment?.colourSubtract){e.preventDefault();e.stopImmediatePropagation();api.action(()=>{const s=api.state();s.paint||=[];s.paint=s.paint.includes(t.id)?s.paint.filter(id=>id!==t.id):[...s.paint,t.id]});emit();return}if(t&&cfg.assessment?.valueShapes){e.preventDefault();e.stopImmediatePropagation();move({kind:'token',id:t.id},'bank','tap');return}if(t&&['add','combine','friendly','subtract'].includes(type)){document.dispatchEvent(new CustomEvent('ml-control-feedback',{detail:{button:b}}));e.preventDefault();e.stopImmediatePropagation();move({kind:'token',id:t.id},type==='subtract'?(t.loc==='start'?'removed':'start'):(t.loc==='a'?'b':'a'),'tap')}
  },true);
  function paint(){queued=false;const s=api.state();
   for(const b of document.querySelectorAll('[data-piece]')){const t=token(b.dataset.piece);if(!t)continue;b.draggable=false;b.style.touchAction='none';b.style.cursor='grab';b.dataset.blockHome=t.home||t.loc;
    if(balance()||type==='subtract'){const blue=['a','b'].includes(t.home||t.loc),colors=type==='subtract'?['#edc265','#ffe4a1','#a98c47']:blue?['#4191d2','#9ecff2','#1f5b93']:['#a46dcd','#d6b7ee','#663c88'];for(const face of b.querySelectorAll('.rv-face')){for(const [key,value]of [['--ml-block-color',colors[0]],['--ml-block-top',colors[1]],['--ml-block-side',colors[2]],['background-color',colors[0]]])face.style.setProperty(key,value,'important');for(const i of face.querySelectorAll('i')){i.style.setProperty('background-color',colors[0],'important');i.style.setProperty('border-color',colors[2],'important')}}}
    if(t.visualX!==undefined){b.dataset.userPlaced='true';if(t.visualWidth){b.style.setProperty('width',t.visualWidth+'px','important');b.style.setProperty('height',t.visualHeight+'px','important');}const a=b.closest('.rv-pieces,.rv-tenframes'),full=t.visualScope==='pad'?(b.closest('.rv-mat')?.querySelector('.rv-pv,.shape-pieces,.rv-ten-mat')||a):a;if(a&&full){a.style.position='relative';a.style.setProperty('overflow','visible','important');b.closest('.rv-place')?.style.setProperty('overflow','visible','important');const w=b.offsetWidth,h=b.offsetHeight,face=b.querySelector('.rv-face')?.getBoundingClientRect(),fw=face?.width||w,fh=face?.height||h,ar=a.getBoundingClientRect(),fr=full.getBoundingClientRect(),top=full.matches('.rv-pv')?24:0;for(const[k,v]of Object.entries({position:'absolute',left:(Math.max(Math.max(0,(fw-w)/2),Math.min(full.clientWidth-Math.max(w,(fw+w)/2),t.visualX*full.clientWidth-w/2))-(ar.x-fr.x))+'px',top:(Math.max(top+Math.max(0,(fh-h)/2),Math.min(full.clientHeight-Math.max(h,(fh+h)/2),t.visualY*full.clientHeight-h/2))-(ar.y-fr.y))+'px'}))b.style.setProperty(k,v,'important')}}
   }
   for(const b of document.querySelectorAll('[data-split],[data-group]')){const split=b.dataset.split,[loc,value]=(split||b.dataset.group).split(':'),ts=s.tokens.filter(t=>t.loc===loc&&t.value===+value),n=ts.length,paint=new Set(s.paint||[]);b.disabled=split?n===0:cfg.assessment?.colourSubtract?Math.max(ts.filter(t=>paint.has(t.id)).length,ts.filter(t=>!paint.has(t.id)).length)<10:n<10}
   if(s.resolveBlockOverlap&&s.resolveBlockOverlapFrames>0){s.resolveBlockOverlapFrames--;schedule()}else if(s.resolveBlockOverlap){const b=[...document.querySelectorAll('[data-piece]')].find(b=>b.dataset.piece===s.resolveBlockOverlap),t=b&&token(b.dataset.piece),pad=b?.closest('.rv-mat'),full=pad?.querySelector('.rv-pv,.shape-pieces,.rv-ten-mat'),area=b?.closest('.rv-pieces,.rv-tenframes');if(t&&full&&area){const fr=full.getBoundingClientRect(),br=b.getBoundingClientRect(),face=(b.querySelector('.rv-face')||b).getBoundingClientRect(),w=face.width,h=face.height,dx=face.x-br.x,dy=face.y-br.y,others=[...pad.querySelectorAll('[data-piece]')].filter(o=>o!==b).map(o=>(o.querySelector('.rv-face')||o).getBoundingClientRect()).filter(r=>r.width&&r.height),overlap=(x,y)=>others.some(r=>x<r.right+4&&x+w>r.x-4&&y<r.bottom+4&&y+h>r.y-4);if(overlap(face.x,face.y)){let found=null,best=Infinity;const minY=fr.y+(full.matches('.rv-pv')?24:3),step=Math.max(3,Math.min(8,w/4,h/4));for(let y=minY;y<=fr.bottom-h-3;y+=step)for(let x=fr.x+3;x<=fr.right-w-3;x+=step){if(overlap(x,y))continue;const d=(x-face.x)**2+(y-face.y)**2;if(d<best){best=d;found={x,y}}}if(found){const ar=area.getBoundingClientRect();b.style.setProperty('left',(found.x-dx-ar.x)+'px','important');b.style.setProperty('top',(found.y-dy-ar.y)+'px','important');t.visualX=(found.x-dx-fr.x+br.width/2)/fr.width;t.visualY=(found.y-dy-fr.y+br.height/2)/fr.height;}}delete s.resolveBlockOverlap;ML_REVISED.setDone(s.done);}}
  }
  function schedule(){if(!queued){queued=true;requestAnimationFrame(paint)}}
  new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});document.addEventListener('ml-ones-layout',schedule);addEventListener('resize',schedule);paint();emit();
 }
 function installVisuals(){
  if(document.body.dataset.blockVisualsReady)return;document.body.dataset.blockVisualsReady='true';let queued=false,drag=null,serial=0;
  function decorate(){queued=false;for(const b of document.querySelectorAll('.rv-block[data-piece]:disabled')){if(window.ML_AUDIT10_REVISED?.state().tokens.some(t=>t.id===b.dataset.piece))continue;b.disabled=false;b.dataset.domPiece='true';b.style.touchAction='none';b.style.cursor='grab'}for(const svg of document.querySelectorAll('svg:has(rect[data-block-value])'))for(const rect of [...svg.querySelectorAll('rect[data-block-value]')]){
   if(rect.closest('[data-svg-piece]'))continue;let group=rect.closest('g[data-scattered-one]');
   if(!group){group=document.createElementNS('http://www.w3.org/2000/svg','g');const depth=rect.previousElementSibling?.getAttribute('data-ml-block-face')==='depth'?rect.previousElementSibling:null;(depth||rect).before(group);if(depth)group.append(depth);const paths=[];for(let p=rect.nextElementSibling;p?.tagName==='path';p=p.nextElementSibling)paths.push(p);group.append(rect,...paths)}
   group.dataset.svgPiece='visual-'+serial++;group.setAttribute('role','button');group.setAttribute('aria-label','Move '+rect.dataset.blockValue+' block');group.style.touchAction='none';group.style.cursor='grab';
  }}
  function schedule(){if(!queued){queued=true;requestAnimationFrame(decorate)}}
  function point(svg,e){const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform(svg.getScreenCTM().inverse())}
  function separateVisual(d){const container=d.dom?d.group.closest('.rv-mat')||d.group.closest('.rv-pieces'):d.svg,r=d.group.getBoundingClientRect(),bounds=container.getBoundingClientRect(),others=[...container.querySelectorAll(d.dom?'[data-dom-piece]':'[data-svg-piece]')].filter(e=>e!==d.group).map(e=>e.getBoundingClientRect()),overlaps=(x,y)=>others.some(o=>x<o.right+3&&x+r.width>o.x-3&&y<o.bottom+3&&y+r.height>o.y-3);if(!overlaps(r.x,r.y))return;let best=null,distance=Infinity;for(let y=bounds.y+3;y<=bounds.bottom-r.height-3;y+=5)for(let x=bounds.x+3;x<=bounds.right-r.width-3;x+=5){if(overlaps(x,y))continue;const n=(x-r.x)**2+(y-r.y)**2;if(n<distance){best={x,y};distance=n}}if(!best)return;if(d.dom)d.group.style.setProperty('transform','translate('+(best.x-d.box.x)+'px,'+(best.y-d.box.y)+'px)','important');else{const a=point(d.svg,{clientX:r.x,clientY:r.y}),b=point(d.svg,{clientX:best.x,clientY:best.y}),m=d.group.transform.baseVal.consolidate()?.matrix;d.group.setAttribute('transform','translate('+((m?.e||0)+b.x-a.x)+' '+((m?.f||0)+b.y-a.y)+')')}}
  window.addEventListener('pointerdown',e=>{const group=e.target.closest('[data-svg-piece],[data-dom-piece]');if(!group||e.button!==0||e.isPrimary===false)return;if(group.dataset.domPiece){const r=group.getBoundingClientRect(),area=group.closest('.rv-pieces').getBoundingClientRect();drag={group,dom:true,id:e.pointerId,x:e.clientX,y:e.clientY,box:r,area}}else{const svg=group.ownerSVGElement,p=point(svg,e),m=group.transform.baseVal.consolidate()?.matrix;drag={group,svg,id:e.pointerId,x:p.x,y:p.y,tx:m?.e||0,ty:m?.f||0,box:group.getBBox()}}try{group.setPointerCapture?.(e.pointerId)}catch{}e.preventDefault();e.stopImmediatePropagation()},true);
  window.addEventListener('pointermove',e=>{const d=drag;if(!d||d.id!==e.pointerId)return;e.preventDefault();e.stopImmediatePropagation();if(d.dom){const a=d.area,b=d.box,x=Math.max(a.x-b.x,Math.min(a.right-b.right,e.clientX-d.x)),y=Math.max(a.y-b.y,Math.min(a.bottom-b.bottom,e.clientY-d.y));d.group.style.setProperty('transform','translate('+x+'px,'+y+'px)','important')}else{const p=point(d.svg,e),v=d.svg.viewBox.baseVal,b=d.box,tx=Math.max(v.x-b.x,Math.min(v.x+v.width-b.x-b.width,d.tx+p.x-d.x)),ty=Math.max(v.y-b.y,Math.min(v.y+v.height-b.y-b.height,d.ty+p.y-d.y));d.group.setAttribute('transform','translate('+tx+' '+ty+')')}d.group.dataset.visualMoved='true'}, {capture:true,passive:false});
  window.addEventListener('pointerup',e=>{if(drag?.id===e.pointerId){if(drag.group.dataset.visualMoved==='true')separateVisual(drag);drag=null;e.preventDefault();e.stopImmediatePropagation()}},true);window.addEventListener('pointercancel',()=>drag=null,true);
  new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});decorate();
 }
 const css='.ml-block-drag-ghost{pointer-events:none!important;box-shadow:0 5px 12px #173c3733!important}.ml-drop-active{outline:3px solid #f78a12!important;outline-offset:-5px!important}.rv-block[data-piece],[data-bank],[data-card]{touch-action:none!important;user-select:none!important;-webkit-user-select:none!important}';
 return{inject:(html,cfg)=>html.replace('</body>','<style>'+css+'</style><script>window.ML_BOOT_BLOCK_CONTROLS=()=>('+install.toString()+')();const installVisuals=('+installVisuals.toString()+');if(document.readyState==="complete")ML_BOOT_BLOCK_CONTROLS();else addEventListener("load",ML_BOOT_BLOCK_CONTROLS,{once:true});<\/script></body>')};
})();
