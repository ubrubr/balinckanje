/* Shared state for Play Signage and the mobile admin. Supabase is authoritative. */
(function(global){
'use strict';
var cfg=global.BALINCKANJE_CONFIG;
if(!cfg) throw Error('config.js must load before shared.js');
var db=global.supabase&&global.supabase.createClient?global.supabase.createClient(cfg.url,cfg.publishableKey,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}}):null;
var base=cfg.url+'/rest/v1/'+cfg.table, cached=null, listeners=[], timer=null, channel=null, pending=null, lastError=null;
var names=['Anže B.','Urban Č.','Dejan L.','Jan S.','Jan R.','Marjan C.','Benjamin P.','Stanko Z.','Jakob R.','Zdravko B.','Iztok Š.','Borut G.','Marko T.','Marko D.','Kristina M.','Tone G.'];
function initialData(){return {players:names.map(function(name,i){return {id:'p'+(i+1),name:name};}),draw:{assignments:null,order:[],startedAt:null,introMs:5000,stepMs:8500,spinMs:7140,finalMs:30000,loop:false},groupTeams:{A:[1,2,3,4],B:[5,6,7,8]},games:{},displayMode:'zreb',roundView:'1',autoToTeams:true,tieBreaks:{}};}
function headers(extra){return Object.assign({'apikey':cfg.publishableKey,'accept':'application/json'},extra||{});}
function notify(){listeners.slice().forEach(function(fn){try{fn(cached);}catch(e){console.error(e);}});}
function updateRow(row){
 if(!row)throw Error('Supabase tabela ni inicializirana.');
 if(!cached||row.revision!==cached.revision||row.updated_at!==cached.updated_at){
  cached=row;try{localStorage.setItem('balinckanje-cache-v2',JSON.stringify(row));}catch(e){}notify();
 }
 lastError=null;return cached;
}
function fromCache(){
 if(cached)return cached;
 try{var row=JSON.parse(localStorage.getItem('balinckanje-cache-v2'));if(row&&row.data){cached=row;notify();}}catch(e){}
 return cached;
}
function read(force){
 if(pending)return pending;
 if(!force&&cached)return Promise.resolve(cached);
 pending=fetch(base+'?id=eq.'+cfg.rowId+'&select=id,revision,data,updated_at',{cache:'no-store',headers:headers()})
 .then(async function(r){if(!r.ok)throw Error('Supabase HTTP '+r.status+': '+(await r.text()).slice(0,200));var rows=await r.json();return updateRow(rows[0]);})
 .catch(function(e){lastError=e;fromCache();throw e;}).finally(function(){pending=null;});
 return pending;
}
function watch(fn){
 listeners.push(fn);if(cached)fn(cached);
 if(!timer){
  timer=setInterval(function(){read(true).catch(function(){});},cfg.pollIntervalMs);
  global.addEventListener('online',function(){read(true).catch(function(){});});
  global.addEventListener('focus',function(){read(true).catch(function(){});});
  if(db){channel=db.channel('balinckanje-live-v1').on('postgres_changes',{event:'UPDATE',schema:'public',table:cfg.table,filter:'id=eq.'+cfg.rowId},function(){read(true).catch(function(){});}).subscribe();}
 }
 read(true).catch(function(e){console.warn('Supabase:',e.message);});
 return function(){var i=listeners.indexOf(fn);if(i>=0)listeners.splice(i,1);};
}
async function mutate(updater){
 for(var attempt=0;attempt<3;attempt++){
  var row=await read(true),next=JSON.parse(JSON.stringify(row.data));
  if(updater(next)===false)return row;
  var response=await fetch(base+'?id=eq.'+cfg.rowId+'&revision=eq.'+row.revision+'&select=id,revision,data,updated_at',
    {method:'PATCH',headers:headers({'content-type':'application/json','prefer':'return=representation'}),
     body:JSON.stringify({data:next,revision:row.revision+1,updated_at:new Date().toISOString()})});
  if(!response.ok)throw Error('Shranjevanje ni uspelo HTTP '+response.status+': '+(await response.text()).slice(0,250));
  var rows=await response.json();if(rows.length)return updateRow(rows[0]);
  await read(true);
 }
 throw Error('Podatke je nekdo medtem spremenil. Poskusi ponovno.');
}
function randomInt(max){
 if(global.crypto&&global.crypto.getRandomValues){var limit=4294967296-4294967296%max,array=new Uint32Array(1),n;
  do{global.crypto.getRandomValues(array);n=array[0];}while(n>=limit);return n%max;
 }
 return Math.floor(Math.random()*max);
}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=randomInt(i+1),v=a[i];a[i]=a[j];a[j]=v;}return a;}
function validDraw(a,ids){
 if(!a||a.p5!==a.p14||!Array.isArray(ids)||ids.length!==16)return false;
 var counts=Array(8).fill(0);
 return ids.every(function(id){var n=a[id];if(!Number.isInteger(n)||n<1||n>8)return false;counts[n-1]++;return true;})&&counts.every(function(n){return n===2;});
}
function generateDraw(players){
 if(!Array.isArray(players)||players.length!==16)throw Error('Žreb potrebuje 16 igralcev.');
 var ids=players.map(function(p){return p.id;});
 if(new Set(ids).size!==16||!ids.includes('p5')||!ids.includes('p14'))throw Error('Manjkajo ID-ji igralcev.');
 var a={},duo=1+randomInt(8);a.p5=duo;a.p14=duo;
 var nums=shuffle([1,2,3,4,5,6,7,8].filter(function(x){return x!==duo;}));
 var rest=shuffle(ids.filter(function(id){return id!=='p5'&&id!=='p14';}));
 for(var i=0;i<7;i++){a[rest[2*i]]=nums[i];a[rest[2*i+1]]=nums[i];}
 var order=shuffle(ids);
 if(!validDraw(a,ids))throw Error('Neveljaven žreb.');
 return {assignments:a,order:order};
}
function drawProgress(data,now){
 var d=data.draw||{};
 if(!d.startedAt||!validDraw(d.assignments,(data.players||[]).map(function(p){return p.id;})))return {phase:'idle',shown:0,finished:false};
 var t=Math.max(0,(now||Date.now())-d.startedAt),intro=d.introMs||5000,step=d.stepMs||8500,spin=d.spinMs||7140,final=d.finalMs||30000;
 var cycle=intro+step*16+final;if(d.loop)t%=cycle;
 if(t<intro)return {phase:'intro',shown:0,finished:false,remaining:intro-t};
 if(t<intro+16*step){var e=t-intro,index=Math.floor(e/step);return {phase:'draw',shown:index+(e%step>=spin?1:0),finished:false,index:index};}
 return {phase:'final',shown:16,finished:!d.loop&&t>=cycle,remaining:Math.max(0,cycle-t)};
}
function teams(data,reveal){
 var shown=new Set(((data.draw||{}).order||[]).slice(0,reveal==null?16:reveal)),out=[];
 for(var n=1;n<=8;n++){out.push({number:n,players:(data.players||[]).filter(function(p){return data.draw&&data.draw.assignments&&data.draw.assignments[p.id]===n&&shown.has(p.id);})});}
 return out;
}
// Eight-team, single elimination tournament. Bracket positions are fixed after the draw:
// QF1: 1 vs 8, QF2: 2 vs 7, QF3: 3 vs 6, QF4: 4 vs 5.
// Winners progress to SF1 and SF2, then the championship final.
function resultFor(data,id){
 var r=(data.games||{})[id];
 return r&&Number.isInteger(r.home)&&Number.isInteger(r.away)&&r.home>=0&&r.away>=0&&r.home<=99&&r.away<=99&&r.home!==r.away?r:null;
}
function match(id,stage,title,home,away){
 return {id:id,stage:stage,title:title,home:home||null,away:away||null,ready:!!(home&&away)};
}
function whoWins(data,fixture){
 var r=fixture&&fixture.ready?resultFor(data,fixture.id):null;
 return r?(r.home>r.away?fixture.home:fixture.away):null;
}
function whoLoses(data,fixture){
 var r=fixture&&fixture.ready?resultFor(data,fixture.id):null;
 return r?(r.home<r.away?fixture.home:fixture.away):null;
}
function bracketFixtures(data){
 var q1=match('QF1','cetrtfinale','Četrtfinale 1',1,8);
 var q2=match('QF2','cetrtfinale','Četrtfinale 2',2,7);
 var q3=match('QF3','cetrtfinale','Četrtfinale 3',3,6);
 var q4=match('QF4','cetrtfinale','Četrtfinale 4',4,5);
 var s1=match('SF1','polfinale','Polfinale 1',whoWins(data,q1),whoWins(data,q2));
 var s2=match('SF2','polfinale','Polfinale 2',whoWins(data,q3),whoWins(data,q4));
 var f=match('FINAL','finale','Veliki finale',whoWins(data,s1),whoWins(data,s2));
 var third=match('THIRD','tretje','Tekma za 3. mesto',whoLoses(data,s1),whoLoses(data,s2));
 return [q1,q2,q3,q4,s1,s2,f,third];
}
function clearDownstream(data,id){
 if(!data.games)data.games={};
 var affected={
  QF1:['SF1','FINAL','THIRD'],
  QF2:['SF1','FINAL','THIRD'],
  QF3:['SF2','FINAL','THIRD'],
  QF4:['SF2','FINAL','THIRD'],
  SF1:['FINAL','THIRD'],
  SF2:['FINAL','THIRD']
 };
 (affected[id]||[]).forEach(function(key){delete data.games[key];});
}
function podium(data){
 var fixtures=bracketFixtures(data),f=fixtures[6],third=fixtures[7],fr=f.ready?resultFor(data,'FINAL'):null,tr=third.ready?resultFor(data,'THIRD'):null;
 return {gold:fr?whoWins(data,f):null,silver:fr?whoLoses(data,f):null,bronze:tr?whoWins(data,third):null,thirdPlayers:third.ready?[third.home,third.away]:[]};
}
function finishedCount(data){return bracketFixtures(data).slice(0,7).filter(function(m){return m.ready&&resultFor(data,m.id);}).length;}
global.Balinckanje={cfg:cfg,read:read,watch:watch,mutate:mutate,initialData:initialData,
 generateDraw:generateDraw,validDraw:validDraw,drawProgress:drawProgress,teams:teams,shuffle:shuffle,
 resultFor:resultFor,bracketFixtures:bracketFixtures,clearDownstream:clearDownstream,
 whoWins:whoWins,whoLoses:whoLoses,podium:podium,finishedCount:finishedCount,
 getCached:function(){return cached||fromCache();},getLastError:function(){return lastError;}};
})(window);
