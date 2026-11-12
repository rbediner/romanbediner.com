/**
 * Purpose: Expand the embedded PULSE illustration without leaving the article.
 * Architectural role: Article-scoped native dialog and focus/scroll lifecycle.
 * Dependencies: Browser dialog APIs; data-pulse-* markup and sandboxed frame.
 * Security/CSP considerations: External script; messages accepted only from the
 * exact embedded window with an explicit PULSE event. No credentials/network.
 * Migration considerations: Keep inline non-modal dialog and iframe in place so
 * opening/closing does not reload the running illustration or duplicate it.
 */
(function () {
 'use strict';
 const dialog=document.querySelector('[data-pulse-dialog]');
 const trigger=document.querySelector('[data-pulse-expand]');
 if(!dialog||!trigger)return;
 const frame=dialog.querySelector('iframe'), close=dialog.querySelector('[data-pulse-close]');
 let expanded=false, savedY=0, savedStyle='';
 const placeholder=document.createElement('div');placeholder.hidden=true;dialog.before(placeholder);
 const output=dialog.querySelector('output');
 function send(action){frame.contentWindow.postMessage({type:'pulse:viewer',action},'*');}
 dialog.querySelectorAll('[data-pulse-zoom]').forEach(button=>button.addEventListener('click',()=>send(button.dataset.pulseZoom)));
 frame.addEventListener('load',()=>{if(expanded)send('open');});
 function collapse(){if(expanded)dialog.close();}
 trigger.addEventListener('click',function(){
  placeholder.style.height=dialog.getBoundingClientRect().height+'px';placeholder.hidden=false;
  savedY=window.scrollY;savedStyle=document.body.getAttribute('style')||'';
  dialog.close(); expanded=true; dialog.classList.add('is-expanded');
  dialog.showModal();document.body.style.position='fixed';document.body.style.top=-savedY+'px';document.body.style.width='100%';
  trigger.setAttribute('aria-expanded','true');send('open');close.focus();
 });
 close.addEventListener('click',collapse);
 dialog.addEventListener('close',function(){
  // Opening switches from a non-modal to modal dialog; ignore its queued close.
  if(dialog.open||!expanded)return;
  expanded=false;send('close');output.textContent='100%';dialog.classList.remove('is-expanded');dialog.show();placeholder.hidden=true;
  document.body.setAttribute('style',savedStyle);window.scrollTo({top:savedY,left:0,behavior:"instant"});
  trigger.setAttribute('aria-expanded','false');trigger.focus({preventScroll:true});
 });
 window.addEventListener('message',function(event){
  if(!expanded||event.source!==frame.contentWindow)return;
  if(event.data?.type==='pulse:escape')collapse();
  if(event.data?.type==='pulse:zoom'&&Number.isFinite(event.data.scale)&&event.data.scale>=1&&event.data.scale<=5)output.textContent=Math.round(event.data.scale*100)+'%';
 });
})();
