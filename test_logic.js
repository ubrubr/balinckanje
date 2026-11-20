// Run: node test_logic.js
// Tests run without a network connection or Supabase credentials.
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const code=fs.readFileSync(__dirname+'/shared.js','utf8');
const sandbox={console,Set,Date,Math,JSON,Uint32Array,Promise,
 window:{BALINCKANJE_CONFIG:{url:'https://example.com',publishableKey:'test',table:'state',rowId:1,pollIntervalMs:1500},addEventListener(){}}};
sandbox.window.crypto=require('crypto').webcrypto;
vm.createContext(sandbox);vm.runInContext(code,sandbox);
const B=sandbox.window.Balinckanje,d=B.initialData();
for(let n=0;n<1000;n++){const draw=B.generateDraw(d.players);assert(B.validDraw(draw.assignments,d.players.map(p=>p.id)));assert.strictEqual(draw.assignments.p5,draw.assignments.p14);assert.strictEqual(new Set(draw.order).size,16);}
let f=B.bracketFixtures(d);
assert.deepStrictEqual(JSON.parse(JSON.stringify(f.slice(0,4).map(m=>[m.home,m.away]))),[[1,8],[2,7],[3,6],[4,5]]);
d.games={QF1:{home:3,away:1},QF2:{home:2,away:5},QF3:{home:4,away:0},QF4:{home:0,away:1}};
f=B.bracketFixtures(d);assert.strictEqual(f[4].home,1);assert.strictEqual(f[4].away,7);assert.strictEqual(f[5].home,3);assert.strictEqual(f[5].away,5);
d.games.SF1={home:3,away:2};d.games.SF2={home:1,away:4};f=B.bracketFixtures(d);
assert.strictEqual(f[6].home,1);assert.strictEqual(f[6].away,5);assert.strictEqual(f[7].home,7);assert.strictEqual(f[7].away,3);
d.games.FINAL={home:3,away:2};d.games.THIRD={home:1,away:3};
assert.deepStrictEqual(JSON.parse(JSON.stringify(B.podium(d))),{gold:1,silver:5,bronze:3,thirdPlayers:[7,3]});
B.clearDownstream(d,'QF1');assert(!d.games.SF1&&!d.games.FINAL&&!d.games.THIRD);assert(d.games.QF2);
console.log('PASS: 1000 random team draws, fixed pairing, advancement, final, third place, dependent result reset.');
