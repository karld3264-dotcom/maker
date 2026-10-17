// node tests/genetics.test.js
const a=require('assert'),H=require('../js/genetics.js');require('../js/health.js');
const near=(x,y)=>a.ok(Math.abs(x-y)<1e-9,x+' vs '+y);
const st=(o={})=>{const s=H.freshState();for(const k in o){s.g[k]=o[k]}return s};
let t=H.cross('ext',['E','e'],['E','e']);near(t['E/E'],.25);near(t['E/e'],.5);near(t['e/e'],.25);
t=H.cross('cr',['Cr','Cr'],['n','n']);near(t['Cr/n'],1);
a.deepStrictEqual(H.norm('dun',['nd1','D']),['D','nd1']);a.throws(()=>H.norm('cr',['Cr','E']));
const u=st();u.unk.cr=true;a.strictEqual(H.crossAll(u,st()).cr,null);a.strictEqual(H.jointProb(H.crossAll(u,st()),{}),null);
near(H.jointProb(H.crossAll(st(),st()),Object.fromEntries(H.LOCI.map(l=>[l.id,H.defaultGenes()[l.id].join('/')]))),1);
a.strictEqual(H.format(st()).split(' ').length,17);a.ok(H.format(u).includes('?/?'));
const nm=o=>H.phenotype(st(o)).name;
a.strictEqual(nm({ext:['e','e'],cr:['Cr','n']}),'palomino');a.strictEqual(nm({cr:['Cr','Cr']}),'perlino');
a.strictEqual(nm({agt:['a','a'],cr:['Cr','n']}),'smoky black');a.strictEqual(nm({ext:['e','e'],dun:['D','nd1']}),'red dun');
a.ok(!H.phenotype(st({dun:['nd2','nd2']})).layers.some(l=>l.key==='dil.dun'));
a.ok(!H.phenotype(st({ext:['e','e'],zs:['Z','n']})).layers.some(l=>l.key==='dil.silver'));
a.ok(H.phenotype(st({zs:['Z','n']})).layers.some(l=>l.key==='dil.silver'));
a.ok(H.flags(st({fo:['O','O']})).some(f=>f.id==='lwos'&&f.kind==='deterministic'));
a.ok(H.flags(st({lp:['LP','LP']})).some(f=>f.id==='csnb'&&f.kind==='risk'));
a.ok(H.flags(st({g:['G','g']})).some(f=>f.id==='mel'));a.ok(!H.flags(st()).length);
a.strictEqual(H.threshold(.25,20),5);let hits=0;for(let r=1;r<=20;r++)if(r<=H.threshold(.25,20))hits++;near(hits/20,.25);
a.strictEqual(H.rollDie(20,()=>0),1);a.strictEqual(H.rollDie(20,()=>.9999),20);
console.log('All genetics/health tests passed');
a.ok(H.flags(st({lp:['LP','lp']})).some(f=>f.id==='eru'));a.ok(H.flags(st({cr:['Cr','Cr']})).some(f=>f.id==='skin'));
a.strictEqual(H.HEALTH.find(h=>h.id==='mel').minAge,15);
{const s=st();a.ok(!H.primOk(s));s.mode='creative';a.ok(H.primOk(s));a.ok(H.maneList('bay',true).includes('flaxen'));a.ok(!H.maneList('bay',false).includes('flaxen'))}
console.log('Extended tests passed');
near(H.cross('fo',['O','n'],['O','n'])['O/O'],.25);near(H.cross('fo',['O','n'],['n','n'])['O/n'],.5);console.log('Foal tests passed');
{const s=st();s.c.face='blaze';s.c.faceV=3;s.c.legs.front_left='coronet';s.c.legV.front_left=2;const k=H.phenotype(s).layers.map(l=>l.key);a.ok(k.includes('face.blaze_3')&&k.includes('leg.front_left_coronet_2'))}
console.log('Marking variant tests passed');
{const s=st();s.c.eyes='hetero_sectoral';s.c.eyeV=5;a.ok(H.phenotype(s).layers.some(l=>l.key==='eye.hetero_sectoral_5'));
 a.strictEqual(H.maneDef('chestnut',false),'red');a.strictEqual(H.maneDef('bay',true),'silver');a.ok(!H.maneList('bay',false,true).includes('black'));
 const d=H.freshState();d.breed='donkey';a.strictEqual(H.phenotype(d).name,'grey-dun');a.strictEqual(H.format(d),'E/E A/A D/D N/N N/N');
 d.g.dmc1r=['e','e'];d.g.dtbx3=['nd','nd'];a.strictEqual(H.phenotype(d).name,'light sandy');
 const t=H.crossAll(d,d);near(t.dkit['N/N'],1);d.g.dkit=['N','W'];d.d.white='large';near(H.crossAll(d,d).dkit['W/W'],.25);
 H.dkSync(d,true,true);a.strictEqual(d.d.white,'large');d.g.dfgf5=['lh1','lh2'];H.dkSync(d,false,true);a.strictEqual(d.d.mane,'long')}
console.log('Breed/eyes/mane/donkey tests passed');
{const h=st();h.g.ext=['E','e'];const d=H.freshState();d.breed='donkey';
 let t=H.crossMule(h,d);near(t.ext['E/E'],.5);near(t.ext['E/e'],.5);near(t.cr['n/n'],1);
 d.g.dtbx3=['D','D'];t=H.crossMule(h,d);near(t.dun['D/nd2'],1);
 h.g.dun=['D','nd2'];d.g.dtbx3=['nd','nd'];t=H.crossMule(h,d);near(t.dun['D/nd2'],.5);near(t.dun['nd2/nd2'],.5);
 d.unk.dasip=true;a.strictEqual(H.crossMule(h,d).agt,null)}
console.log('Mule cross tests passed');
// ---- show horse, coat length, mane/tail looks, donkey eye variants ----
{const M=require('../assets/manifest.js');
 a.ok(!JSON.stringify(M.dirs).includes('ornamental')&&M.dirs.show==='assets/show/');
 let s=H.freshState();H.setBreed(s,'draft');a.strictEqual(s.c.coat,'long');H.setBreed(s,'riding');a.strictEqual(s.c.coat,'short');H.setBreed(s,'show');a.strictEqual(s.c.coat,'short');H.setBreed(s,'pony');a.strictEqual(s.c.coat,'short');H.setBreed(s,'mule');a.strictEqual(s.c.coat,'short');H.setBreed(s,'donkey');a.strictEqual(s.c.coat,'short');
 a.deepStrictEqual(H.coatOpts({breed:'mule'}),['short','medium']);a.deepStrictEqual(H.coatOpts({breed:'donkey'}),['short','medium','long']);a.deepStrictEqual(H.coatOpts({breed:'draft'}),['short','medium','long']);
 s=H.freshState();s.c.coat='medium';let k=H.phenotype(s).layers.map(l=>l.key);a.ok(k.includes('coat.medium'));
 s.c.maneV=3;s.c.tailV=7;s.g.to=['TO','n'];k=H.phenotype(s).layers.map(l=>l.key);
 for(const x of['mane.black_3','tail.black_7','line.mane_3','line.tail_7','manespot.tobiano_3','tailspot.tobiano_7'])a.ok(k.includes(x),x);
 for(const x of k)if(x!=='bg.default'&&!M.files[x])a.fail('layer key without manifest entry: '+x);
 const d=H.freshState();H.setBreed(d,'donkey');d.d.eyes='blue';d.d.eyeV=2;k=H.phenotype(d).layers.map(l=>l.key);a.ok(k.includes('dk.eye_blue_2')&&k.includes('dk.coat_short'));
 for(const x of k)a.ok(M.files[x],'donkey layer key without manifest entry: '+x);
 a.ok(M.files['dk.eye_brown_3']&&!M.files['dk.eye_brown_4']&&M.files['mane.paleflaxen_8']&&!M.files['mane.black_9']);
 d.g.dfgf5=['N','N'];a.strictEqual(H.dkLong(d),false);d.g.dfgf5=['lh1','lh2'];a.strictEqual(H.dkLong(d),true);}
console.log('Show / coat / mane looks / donkey eye tests passed');
