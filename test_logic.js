// Tests: node test_logic.js
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const code=fs.readFileSync(__dirname+'/shared.js','utf8');
const ctx={console,Set,Date,Math,JSON,Uint32Array,URL,Promise,window:{BALINCKANJE_CONFIG:{url:'https://example.com',publishableKey:'test',table:'state',rowId:1,pollIntervalMs:1500},addEventListener(){}}};
ctx.window.crypto=require('crypto').webcrypto;ctx.crypto=ctx.window.crypto;
vm.createContext(ctx);vm.runInContext(code,ctx);
const B=ctx.window.Balinckanje,data=B.initialData();
for(let i=0;i<1000;i++){
 const d=B.generateDraw(data.players);
 assert(B.validDraw(d.assignments,data.players.map(x=>x.id)));
 assert.strictEqual(d.assignments.p5,d.assignments.p14);
 assert.strictEqual(new Set(d.order).size,16);
 const counts=Array(8).fill(0);
 Object.values(d.assignments).forEach(n=>counts[n-1]++);
 assert(counts.every(n=>n===2));
}
const generated=B.generateDraw(data.players);
Object.assign(data.draw,{assignments:generated.assignments,order:generated.order,startedAt:100000});
assert.strictEqual(B.drawProgress(data,100001).shown,0);
assert.strictEqual(B.drawProgress(data,105000+7141).shown,1);
assert.strictEqual(B.drawProgress(data,105000+8500*16).shown,16);
assert(!B.drawProgress(data,105000+8500*16).finished);
assert(B.drawProgress(data,105000+8500*16+30000).finished);
const matches=B.groupSchedule(data);
assert.strictEqual(matches.length,12);
for(const group of ['A','B']){
 const ms=matches.filter(x=>x.group===group);
 assert.strictEqual(ms.length,6);
 assert.strictEqual(new Set(ms.map(m=>[m.home,m.away].sort().join('-'))).size,6);
 for(const team of data.groupTeams[group])assert.strictEqual(ms.filter(m=>m.home===team||m.away===team).length,3);
 for(let r=1;r<=3;r++)assert.strictEqual(ms.filter(m=>m.round===r).length,2);
}
console.log('PASS: 1000 valid draws, Jan R. + Marko D., timing, 12 fixtures.');
