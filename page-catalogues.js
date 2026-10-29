/* Ready-to-download blank catalogues; embedded so the single-file deployment works offline. */
window.ML_CATALOGUE_PDFS=window.ML_CATALOGUE_PDFS||{};
window.ML_PAGE_CATALOGUES={open({modal,download}){
 const books=window.ML_CATALOGUE_PDFS;
 modal('Download page catalogues', '<p class="catalogue-intro">Choose a catalogue. Each PDF contains all available pages for that grade, with a clickable page-code index and one unanswered question per page.</p><div class="catalogue-choices">'+[2,3].map(grade=>{const book=books[grade],name=grade===2?'Excite':'Inspire';return '<button type="button" data-catalogue-grade="'+grade+'" '+(!book?'disabled':'')+'><span class="catalogue-cat business-cat business-'+grade+'-1" role="img" aria-label="'+(grade===2?'Rocky':'Luna')+' in business wear"></span><strong>'+name+' PDF</strong><span>Grade '+grade+' · '+(book?.questionCount??'Preparing')+' question pages</span><small>Download the complete catalogue</small></button>'}).join('')+'</div><p id="catalogueMessage" role="status">No student names, responses or scores are included.</p>', '<button id="catalogueClose">Back to page</button>');
 document.getElementById('dialog').classList.add('catalogue-dialog');
 document.getElementById('catalogueClose').onclick=()=>document.getElementById('dialog').close();
 for(const button of document.querySelectorAll('[data-catalogue-grade]'))button.onclick=()=>{const book=books[button.dataset.catalogueGrade],bytes=Uint8Array.from(atob(book.base64),c=>c.charCodeAt(0));download(book.filename,new Blob([bytes],{type:'application/pdf'}));document.getElementById('catalogueMessage').textContent=(book.grade===2?'Excite':'Inspire')+' catalogue downloaded: '+book.questionCount+' question pages plus the index.';};
}};
