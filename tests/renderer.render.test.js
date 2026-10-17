// node tests/renderer.render.test.js : runs the real compositor on a fake canvas/Image (no browser)
const a=require('assert'),R=require('../js/renderer.js'),M=require('../assets/manifest.js');
const exists=new Set(['assets/horse/base/neutral.png','assets/horse/mane/neutral_1.png','assets/horse/tail/neutral_1.png','assets/horse/line/body.png','assets/horse/line/mane_1.png','assets/horse/line/tail_1.png','assets/horse/eyes/brown_1.png','assets/horse/patterns/tobiano.png','assets/horse/base/black.png']);
global.Image=class{set src(p){this._p=p;setTimeout(()=>exists.has(p)?this.onload():this.onerror(),0)}get naturalWidth(){return 10}get naturalHeight(){return 10}};
const mkCanvas=()=>{const log=[];const ctx=new Proxy({},{get:(t,k)=>k==='_log'?log:k in t?t[k]:(...args)=>{if(k==='drawImage')log.push(args[0]._id||args[0]._p||'canvas');if(k==='fillRect'&&ctx.globalCompositeOperation==='multiply')log.push('multiply:'+ctx.fillStyle)},set:(t,k,v)=>(t[k]=v,true)});
 return{width:0,height:0,_id:null,getContext:()=>ctx,_ctx:ctx}};
global.document={createElement:()=>{const c=mkCanvas();c._id='canvas#'+Math.random().toString(36).slice(2,6);return c}};
const lay=(...k)=>k.map(key=>({key,a:1}));
(async()=>{const r=new R(M),cv=mkCanvas();
 const spec=m=>({layers:lay('mane.'+m+'_1','tail.'+m+'_1','base.bay','pat.tobiano','eye.brown_1','line.body','line.mane_1','line.tail_1','manespot.tobiano_1'),baseKey:'bay',donkey:false,breed:'riding',filter:{b:100,s:100},bg:false});
 let out=await r.renderPreview(cv,spec('black'));
 a.deepStrictEqual(out.stats.rebuilt,['tail','body','front','mane']);
 a.deepStrictEqual(out.missing.filter(p=>p.includes('_spots')),[]);                                     // optional layers are not warnings
 a.ok(out.optional.some(p=>p.includes('mane_spots/tobiano_1')));
 a.deepStrictEqual(out.tinted.sort(),['base.bay','mane.black_1','tail.black_1']);                        // recoloured from neutral PNGs
 a.ok(out.missing.includes('assets/horse/patterns/tobiano.png')===false);                              // tobiano exists
 a.ok(cv._ctx._log.filter(x=>String(x).startsWith('multiply:')).length===0);                           // main canvas never tinted
 // identical spec: everything reused
 out=await r.renderPreview(cv,spec('black'));a.deepStrictEqual(out.stats.rebuilt,[]);a.deepStrictEqual(out.stats.reused,['tail','body','front','mane']);
 // only mane colour changes -> mane AND tail groups (tail colour shares the key) rebuilt; body+front reused
 out=await r.renderPreview(cv,spec('red'));a.deepStrictEqual(out.stats.rebuilt,['tail','mane']);a.deepStrictEqual(out.stats.reused,['body','front']);
 // shade filter only invalidates the group that contains the base
 const s2=spec('red');s2.filter={b:90,s:100};out=await r.renderPreview(cv,s2);a.deepStrictEqual(out.stats.rebuilt,['body']);
 // dedicated PNG wins over tint
 const s3=spec('red');s3.layers=lay('base.black');out=await r.renderPreview(cv,s3);a.ok(!out.tinted.includes('base.black'));
 // unknown key: warned, still drawn, no crash; missing required base -> reported
 const s4={...spec('red'),layers:lay('base.chestnut','zzz.thing')};s4.baseKey='chestnut';exists.delete('assets/horse/base/neutral.png');r.clearCache();
 out=await r.renderPreview(cv,s4);a.ok(out.missing.some(p=>p.includes('chestnut')));a.deepStrictEqual(out.unslotted,['zzz.thing']);
 console.log('Renderer render tests passed');
})().catch(e=>{console.error(e);process.exit(1)});
