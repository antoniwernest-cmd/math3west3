/* Durable assessment records. PNG evidence keeps its existing database. */
(function(root){'use strict';
 const LEGACY='math-landing:assessment:v1',DB='math-landing-assessment-records-v2',STORE='records';
 let connection,revision=0,tail=Promise.resolve();
 function database(){
  if(!connection)connection=new Promise((resolve,reject)=>{
   let request;try{request=root.indexedDB.open(DB,1)}catch(e){reject(e);return}
   request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains(STORE))request.result.createObjectStore(STORE)};
   request.onerror=()=>reject(request.error||Error('Assessment storage could not be opened.'));
   request.onblocked=()=>reject(Error('Close other assessment tabs, then try again.'));
   request.onsuccess=()=>{const db=request.result;db.onversionchange=()=>{db.close();connection=null};resolve(db)};
  }).catch(e=>{connection=null;throw e});return connection;
 }
 async function read(key){const db=await database();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE),r=tx.objectStore(STORE).get(key);let value;r.onsuccess=()=>{value=r.result};tx.oncomplete=()=>resolve(value);tx.onerror=tx.onabort=()=>reject(tx.error||Error('Saved assessment could not be read.'))})}
 async function commit(value,legacyRaw){const db=await database();return new Promise((resolve,reject)=>{
  const tx=db.transaction(STORE,'readwrite'),store=tx.objectStore(STORE),r=store.get('current');let failure,next;
  tx.oncomplete=()=>{revision=next;resolve()};tx.onerror=tx.onabort=()=>reject(failure||tx.error||Error('Assessment save did not finish. Keep this page open and call your teacher.'));
  r.onsuccess=()=>{const current=r.result,diskRevision=current?.revision||0;if(diskRevision!==revision){failure=Error('This assessment changed in another tab. Reload this tab to open the saved work.');tx.abort();return}
   try{next=revision+1;store.put({revision:next,savedAt:new Date().toISOString(),value},'current');if(legacyRaw!==undefined)store.put({migratedAt:new Date().toISOString(),raw:legacyRaw},'legacy-v1-backup')}catch(e){failure=e;tx.abort()}
  };
 })}
 async function load(){const record=await read('current');if(record){revision=record.revision;return structuredClone(record.value)}
  let raw;try{raw=root.localStorage.getItem(LEGACY)}catch(e){throw Error('Saved work could not be read. Keep this page open and call your teacher.')}
  if(raw===null){revision=0;return null}
  let value;try{value=JSON.parse(raw)}catch{throw Error('Your saved assessment needs teacher recovery. The original record has been kept.')}
  if(!value||!Array.isArray(value.sessions)||!Array.isArray(value.plan?.sections))throw Error('Your saved assessment needs teacher recovery. The original record has been kept.');
  revision=0;await commit(value,raw);
  // Only this migrated key is removed, and only after the database transaction
  // has committed. Engine answers, other projects and PNGs are left in place.
  try{if(root.localStorage.getItem(LEGACY)===raw)root.localStorage.removeItem(LEGACY)}catch{}
  return structuredClone(value);
 }
 function save(value){let frozen;try{frozen=structuredClone(value)}catch(e){return Promise.reject(e)}const result=tail.then(()=>commit(frozen));tail=result.catch(()=>{});return result}
 root.ML_ASSESSMENT_STORAGE={load,save};
})(typeof window!=='undefined'?window:globalThis);
