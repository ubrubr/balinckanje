/* Live Play Signage navigation. No nested iframe: each view is the main webpage. */
(function(){
 'use strict';
 var B=window.Balinckanje;
 if(!B)return;
 var params=new URLSearchParams(window.location.search);
 var basename=window.location.pathname.split('/').pop().replace(/\.html$/,'')||'index';
 var managed=basename==='index'||params.get('live')==='1';
 if(!managed)return; // Direct view URLs intentionally remain on that view.
 var thisView=basename==='index'?'zreb':basename, navigating=false;
 function view(data){
  var mode=data.displayMode||'zreb';
  if(['zreb','ekipe','tekme'].indexOf(mode)<0)mode='zreb';
  if(mode==='zreb'&&data.autoToTeams&&B.drawProgress(data).finished)mode='ekipe';
  return mode;
 }
 function onState(row){
  if(navigating||!row||!row.data)return;
  var next=view(row.data);
  if(next===thisView)return;
  navigating=true;
  var url=new URL(next+'.html',window.location.href);
  url.searchParams.set('live','1');
  window.location.replace(url.href);
 }
 B.watch(onState);
 // Draw phase depends on elapsed time, not just database updates.
 setInterval(function(){
  if(navigating)return;
  var row=B.getCached();if(row)onState(row);
 },1000);
})();
