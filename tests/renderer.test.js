// node tests/renderer.test.js : draw order, slot mapping, manifest consistency (no DOM needed)
const a=require('assert'),R=require('../js/renderer.js'),M=require('../assets/manifest.js'),H=require('../js/genetics.js');
const keys=ls=>R.sortLayers(M,ls.map(key=>({key,a:1}))).map(l=>l.key);
// shuffled input -> fixed bottom->top order
a.deepStrictEqual(keys(['line.mane_1','mane.red_1','eye.brown_1','pat.tobiano','manespot.tobiano_1','line.body','base.bay','face.blaze_1','dil.dun','tail.red_1','line.tail_1','tailspot.tobiano_1']),
 ['tail.red_1','tailspot.tobiano_1','line.tail_1','base.bay','dil.dun','pat.tobiano','face.blaze_1','eye.brown_1','line.body','mane.red_1','manespot.tobiano_1','line.mane_1']);
// markings: primitive < face < leg < details
a.deepStrictEqual(keys(['det.ticking_1','leg.front_left_coronet_1','face.star_1','prim.dorsal_stripe']),['prim.dorsal_stripe','face.star_1','leg.front_left_coronet_1','det.ticking_1']);
// donkey keys use the same slots
a.deepStrictEqual(keys(['dk.line.mane','dk.mane_long','dk.eye_blue_1','dk.base.black','dk.tail_long']),['dk.tail_long','dk.base.black','dk.eye_blue_1','dk.mane_long','dk.line.mane']);
// unknown key -> no slot, drawn last
a.strictEqual(R.sortLayers(M,[{key:'zzz.new',a:1},{key:'base.bay',a:1}])[1].slot,null);
// every manifest key (except the background) belongs to a slot; every tint key and neutral source is defined
for(const k of Object.keys(M.files))if(k!=='bg.default')a.ok(R.slotOf(M,k),'no slot for '+k);
for(const k of Object.keys(M.tint))a.ok(M.files[k],'tint without file entry: '+k);
for(const g of M.groups)for(const s of g.slots)a.ok(M.slots[s],'group slot undefined: '+s);
a.deepStrictEqual(M.groups.flatMap(g=>g.slots),Object.keys(M.slots));   // groups must follow the slot order
a.ok(R.isOptional(M,'line.body')&&R.isOptional(M,'manespot.roan_1')&&!R.isOptional(M,'base.bay'));
// the phenotype emits lines for every horse and mane/tail spots with each white pattern; layer order comes from the renderer only
const s=H.freshState();s.g.to=['TO','n'];const k=H.phenotype(s).layers.map(l=>l.key);
a.ok(k.includes('line.body')&&k.includes('manespot.tobiano_1')&&k.includes('tailspot.tobiano_1'));
const before=JSON.stringify(s.g);keys(k);a.strictEqual(JSON.stringify(s.g),before);   // rendering helpers never touch the genotype
const d=H.freshState();d.breed='donkey';a.ok(H.phenotype(d).layers.some(l=>l.key==='dk.line.body'));
console.log('Renderer tests passed');
