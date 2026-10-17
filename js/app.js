(function(){
const H=HM,$=s=>document.querySelector(s);
const E=(t,a={},...k)=>{const e=document.createElement(t);for(const[x,v]of Object.entries(a)){if(x==='on')for(const[ev,f]of Object.entries(v))e.addEventListener(ev,f);else if(x in e)e[x]=v;else e.setAttribute(x,v)}k.flat().forEach(c=>e.append(c));return e};
const L=s=>s.replace(/_/g,' ').replace(/^./,c=>c.toUpperCase()),MN={darkred:'Dark red',paleflaxen:'Pale flaxen'},ml=m=>MN[m]||L(m);
const FACE=['none','star','stripe','snip','star_stripe','blaze','bald'],LEGT=['none','coronet','pastern','fetlock','half_stocking','full_stocking'];
const LPS={full:'Leopard',fewspot:'Few-spot leopard',blanket:'Blanket',spotted_blanket:'Spotted blanket',snowflake:'Snowflake',varnish_roan:'Varnish roan'};
const SHADES={bay:{standard:[100,100],wild:[106,106],dark:[88,100],seal:[82,84]},chestnut:{standard:[100,100],liver:[80,92],light:[115,95]},black:{standard:[100,100],sunbleached:[112,88]}},SHN={seal:'Seal brown',sunbleached:'Sun-bleached'};
const NV=MANIFEST.variants||5,NE=MANIFEST.eyeVariants||8,vr=n=>Array.from({length:n},(_,i)=>i+1),open={face:null,leg:null,eye:null,deye:null},NM=MANIFEST.maneVariants||8,NDE=MANIFEST.donkeyEyeVariants||3;
const BREEDS=[['draft','Draft horse'],['riding','Riding horse'],['show','Show horse'],['pony','Pony'],['mule','Mule'],['donkey','Donkey']];
const CL={base:['ext','agt'],dil:['cr','dun','zs','ch','prl','mu','g'],pat:['to','fo','sb1','sw1','w','rn','lp','patn1']};
const isDk=s=>s.breed==='donkey';
let S=H.freshState(),snap=()=>JSON.stringify(S),last=snap(),hist=[],fut=[],rolls=[],busy=false,simP={},simD={},cat='breed',legSel='all',sire=null,dam=null,tabSig='';
const merge=o=>{o=Object.assign({},o);if(o.breed==='ornamental')o.breed='show';const d=H.freshState(),r=Object.assign(d,o,{g:Object.assign(d.g,o.g),c:Object.assign(d.c,o.c),d:Object.assign(d.d,o.d)});if(!(o.c&&o.c.coat))r.c.coat=H.COAT_DEF[r.breed]||'short';return r};
function sanitize(){const cr=S.mode==='creative';
 if(!cr)H.ALL.forEach(l=>{if(!S.unk[l.id]&&l.restrict[S.g[l.id].join('/')]){const a=l.al[l.al.length-1];S.g[l.id]=[a,a]}});
 const cc=S.c;if(!H.coatOpts(S).includes(cc.coat))cc.coat='medium';   // mule: short or medium only
 for(const k of['maneV','tailV'])cc[k]=Math.min(NM,Math.max(1,Math.round(cc[k])||1));
 if(isDk(S)){if(!cr){S.d.tail=S.d.mane;if(cc.coat==='long'&&!S.unk.dfgf5&&!H.dkLong(S))cc.coat='medium'}S.d.eyeV=Math.min(NDE,Math.max(1,Math.round(S.d.eyeV)||1));return}   // long coat needs the long-hair FGF5 genotype
 const c=S.c,P=H.phenotype(S),Z=H.cnt(S,'zs','Z')>0,sh=P.base&&SHADES[P.base];
 if(sh&&!sh[c.shade]){c.shade='standard';[c.bright,c.sat]=sh.standard}
 if(P.base){const def=H.maneDef(P.base,Z),ok=H.maneList(P.base,cr,Z);if(c.mdef!==def){c.mane=c.tail=def;c.mdef=def}for(const k of['mane','tail'])if(!ok.includes(c[k]))c[k]=def;if(!cr)c.tail=c.mane}
 if(!H.primOk(S))for(const k in c.prim)c.prim[k]=false;
 for(const k of['belly','ticking'])c[k]=c[k]===true?1:(c[k]||0);
 if(c.eyes==='partial')c.eyes='hetero_complete'}
function set(fn){hist.push(last);if(hist.length>100)hist.shift();fut=[];fn(S);sanitize();last=snap();update()}
const undo=()=>{if(!hist.length)return;fut.push(snap());S=JSON.parse(hist.pop());last=snap();update()};
const redo=()=>{if(!fut.length)return;hist.push(snap());S=JSON.parse(fut.pop());last=snap();update()};
// ---- renderer glue: appearance -> render spec. renderer.js does the drawing and never touches the genotype ----
const cv=$('#cv'),R=new HorseRenderer(MANIFEST);let tok=0;
const specOf=(st,big)=>{const P=H.phenotype(st);return{layers:P.layers,baseKey:P.base,donkey:isDk(st),breed:st.breed,filter:{b:st.c.bright+st.c.bleach*.6,s:st.c.sat},bg:!!(big&&st.c.bg)}};
async function draw(){const t=++tok,r=await R.renderPreview(cv,specOf(S,true),()=>t!==tok);if(!r)return;const p=[];
 if(r.missing.length)p.push('Missing PNG ('+r.missing.length+'): '+r.missing.join(', '));
 if(r.tinted.length)p.push('Recoloured from a neutral PNG: '+r.tinted.length+' layer(s)');
 if(r.fb)p.push('Shared art from assets/horse/ used for '+r.fb+' layer(s) (no '+S.breed+' file yet)');
 if(r.optional.length)p.push('Optional layers not provided: '+r.optional.length);
 if(r.unslotted.length)p.push('No slot for: '+r.unslotted.join(', '));
 p.push('Groups redrawn: '+(r.stats.rebuilt.join(', ')||'none')+' · reused: '+(r.stats.reused.join(', ')||'none'));
 const m=$('#miss');m.textContent=p.join(' · ');m.title=r.optional.join('\n')}
// ---- option catalogue ----
const nrm=id=>{const a=H.locus(id).al[1];return[a,a]},cn=(s,id,a)=>H.cnt(s,id,a);
const setG=(s,id,p)=>{s.g[id]=H.norm(id,p);s.unk[id]=false;s.src[id]='inferred'};
const T=(label,on,active,off,dis)=>({label,on,active,off,dis});
const ch=(id,label,pair,test)=>T(label,s=>setG(s,id,pair),s=>!s.unk[id]&&(test?test(s):s.g[id].join('/')===H.norm(id,pair).join('/')));
const tg=(id,al,label)=>T(label,s=>setG(s,id,[al,H.locus(id).al[1]]),s=>cn(s,id,al)>0,s=>setG(s,id,nrm(id)));
const chip=(l,on,fn)=>E('button',{className:'chip'+(on?' on':''),on:{click:fn}},l),head=t=>E('h3',{},t);
const sld=(l,k,min,max,step)=>{const o=E('b',{},S.c[k]);return E('label',{className:'sl'},E('span',{},l+' ',o),E('input',{type:'range',min,max,step,value:S.c[k],on:{input:e=>{S.c[k]=+e.target.value;o.textContent=S.c[k];draw();cap()},change:()=>{hist.push(last);fut=[];last=snap();buildOpts()}}}))};
const tile=o=>{const{w,h}=MANIFEST.canvas,c=E('canvas',{width:160,height:Math.round(160*h/w)}),d=!!o.dis;
 const t=E('button',{className:'tile'+(o.active(S)?' on':'')+(d?' dis':''),title:typeof o.dis==='string'?o.dis:'',on:{click:()=>{if(d)return;o.active(S)&&o.off?set(o.off):set(o.on);o.after&&o.after()}}},c,E('span',{},o.label));
 const tmp=JSON.parse(snap());o.on(tmp);R.renderFlat(c,specOf(tmp,false));return t};
const grid=os=>E('div',{className:'grid'},os.map(tile));
const mn=(label,v)=>T(label,s=>{s.c.mane=s.c.tail=v},s=>s.c.mane===v&&s.c.tail===v);
const base=(l,e,a)=>T(l,s=>{setG(s,'ext',e);setG(s,'agt',a)},s=>H.phenotype(s).base===l.toLowerCase());
const goOpen=(k,v)=>()=>{open[k]=v;buildOpts()};
// click a marking type -> its variants open (Back / Remove above them)
function drill(key,types,cur,put,pre=[]){const o=open[key];
 if(!o)return[...pre,grid(types.map(t=>({...T(t.label,s=>put(s,t.id,cur(s).type===t.id?cur(s).v:1),s=>cur(s).type===t.id),after:t.id==='none'?null:goOpen(key,t.id)})))];
 const t=types.find(z=>z.id===o);
 return[...pre,E('div',{className:'pre'},chip('← Back',false,goOpen(key,null)),chip('Remove',false,()=>{set(s=>put(s,'none',1));open[key]=null;buildOpts()})),head(t.label+': '+NV+' variants'),grid(vr(NV).map(v=>T('Variant '+v,s=>put(s,o,v),s=>cur(s).type===o&&cur(s).v===v)))]}
const setEye=(type,v=1)=>s=>{s.c.eyes=type;s.c.eyeV=v};
const EYEN={brown:'Brown eyes',blue:'Blue eyes',hetero_complete:'Heterochromia: complete',hetero_sectoral:'Heterochromia: sectoral'};
function eyesView(){const o=open.eye,het=s=>s.c.eyes.startsWith('hetero');
 if(!o)return[head('Eye colour'),grid([{...T('Brown',setEye('brown'),s=>s.c.eyes==='brown'),after:goOpen('eye','brown')},{...T('Blue',setEye('blue'),s=>s.c.eyes==='blue'),after:goOpen('eye','blue')},
  {...T('Heterochromia ▸',s=>{if(!het(s))setEye('hetero_complete')(s)},het),after:goOpen('eye','hetero')}])];
 if(o==='hetero')return[E('div',{className:'pre'},chip('← Back',false,goOpen('eye',null))),head('Heterochromia'),grid([{...T('Complete ▸',setEye('hetero_complete'),s=>s.c.eyes==='hetero_complete'),after:goOpen('eye','hetero_complete')},{...T('Sectoral ▸',setEye('hetero_sectoral'),s=>s.c.eyes==='hetero_sectoral'),after:goOpen('eye','hetero_sectoral')}])];
 return[E('div',{className:'pre'},chip('← Back',false,goOpen('eye',o.startsWith('hetero_')?'hetero':null))),head(EYEN[o]+': '+NE+' variants'),grid(vr(NE).map(n=>T('Variant '+n,setEye(o,n),s=>s.c.eyes===o&&s.c.eyeV===n)))]}
const breedCat={id:'breed',name:'Type',g:'T',render:()=>[grid(BREEDS.map(([k,v])=>T(v,s=>H.setBreed(s,k),s=>s.breed===k))),
 E('small',{},'Draft, riding, show and pony share horse genetics; each can use its own art folder. A mule has 63 chromosomes (horse 64 × donkey 62), so meiosis cannot work: mules are sterile and cannot be parents. Donkeys have their own categories and genes.')]};
const coatCat={id:'coat',name:'Coat',g:'C',render:()=>[head('Coat length'),grid(H.coatOpts(S).map(v=>T(L(v),s=>{s.c.coat=v;if(isDk(s)&&s.mode!=='creative'&&v==='long'&&!H.dkLong(s)){setG(s,'dfgf5',['lh1','lh1']);H.dkSync(s,false,true)}},s=>s.c.coat===v))),
 E('small',{},'Default for '+bl().toLowerCase()+': '+H.COAT_DEF[S.breed]+'.'+(S.breed==='mule'?' Mules can only have a short or medium coat.':'')+(isDk(S)?' A long coat needs the long-hair FGF5 genotype (lh/lh): picking Long sets FGF5 (inferred); Creative mode lifts this.':' Coat length is cosmetic and never changes the genotype.'))]};
const CATS_H=[breedCat,coatCat,
{id:'base',name:'Base colour',g:'B',render:()=>{const b=H.phenotype(S).base,sh=b&&SHADES[b];return[grid([base('Bay',['E','E'],['A','A']),base('Black',['E','E'],['a','a']),base('Chestnut',['e','e'],['A','A'])]),
 ...(sh?[head('Shade: '+b+' (cosmetic only)'),E('div',{className:'pre'},...Object.keys(sh).map(k=>chip(SHN[k]||L(k),S.c.shade===k,()=>set(s=>{s.c.shade=k;[s.c.bright,s.c.sat]=sh[k]})))),
  sld('Brightness %','bright',80,120,1),sld('Saturation %','sat',80,120,1),sld('Sun bleaching','bleach',0,30,1),E('small',{},'Shades never change the genotype.')]:[E('small',{},'Pick a base colour (or set Extension/Agouti) to see its shades.')]),
 ...(b==='chestnut'?[head('Mane & tail (phenotype only)'),grid([mn('Normal','red'),mn('Flaxen','flaxen')]),E('small',{},'Flaxen is a phenotype option only: its inheritance is not established, so no genotype is assigned.')]:[])]}},
{id:'dil',name:'Dilutions',g:'D',render:()=>[
 head('Cream'),grid([ch('cr','No cream',['n','n']),ch('cr','Single cream',['Cr','n']),ch('cr','Double cream',['Cr','Cr'])]),
 head('Dun'),grid([ch('dun','No dun',['nd2','nd2'],s=>cn(s,'dun','D')+cn(s,'dun','nd1')===0),ch('dun','Dun',['D','nd2'],s=>cn(s,'dun','D')>0),ch('dun','Non-dun 1 (markings only)',['nd1','nd1'],s=>cn(s,'dun','D')===0&&cn(s,'dun','nd1')>0)]),
 head('Silver'),grid([ch('zs','No silver',['n','n']),ch('zs','Silver',['Z','n'],s=>cn(s,'zs','Z')>0)]),
 head('Champagne'),grid([ch('ch','No champagne',['n','n']),ch('ch','Champagne',['Ch','n'],s=>cn(s,'ch','Ch')>0)]),
 head('Pearl'),grid([ch('prl','No pearl',['n','n']),ch('prl','Pearl (double)',['Prl','Prl'])]),
 head('Mushroom'),grid([ch('mu','No mushroom',['n','n']),ch('mu','Mushroom (double)',['Mu','Mu'])]),
 head('Grey'),grid([ch('g','No grey',['g','g'],s=>cn(s,'g','G')===0),ch('g','Grey',['G','g'],s=>cn(s,'g','G')>0)]),
 cn(S,'g','G')?sld('Grey progression %','greyAge',0,100,1):'']},
{id:'pat',name:'White patterns',g:'W',render:()=>[
 grid([tg('to','TO','Tobiano'),tg('fo','O','Frame overo'),tg('sb1','SB1','Sabino'),tg('sw1','SW1','Splashed white'),tg('w','W20','Dominant white'),tg('rn','Rn','Classic roan')]),
 cn(S,'to','TO')?sld('Tobiano white %','tobInt',30,100,1):'',
 head('Leopard complex / Appaloosa'),grid([ch('lp','No leopard',['lp','lp'],s=>cn(s,'lp','LP')===0),...Object.entries(LPS).map(([k,v])=>T(v,s=>{setG(s,'lp',['LP','lp']);s.c.lp=k},s=>cn(s,'lp','LP')>0&&s.c.lp===k,s=>setG(s,'lp',['lp','lp'])))]),
 ...(S.mode==='creative'?[head('⚠ Lethal gene (creative only)'),grid([T('Double frame overo ☠',s=>setG(s,'fo',['O','O']),s=>cn(s,'fo','O')===2,s=>setG(s,'fo',nrm('fo')))]),E('small',{},'Warning: O/O is lethal white overo syndrome in real genetics. Real inheritance of it is rolled in the Foal calculator.')]:[])]},
{id:'mane',name:'Mane & tail',g:'M',render:()=>{const b=H.phenotype(S).base,cr=S.mode==='creative',list=b?H.maneList(b,cr,H.cnt(S,'zs','Z')>0):[];
 const look=k=>grid(vr(NM).map(v=>T('Variant '+v,s=>{s.c[k]=v},s=>s.c[k]===v))),colour=part=>grid(list.map(m=>T(ml(m),s=>{if(s.mode==='creative')s.c[part]=m;else s.c.mane=s.c.tail=m},s=>s.c[part]===m)));
 return[head('Mane: '+NM+' looks'),look('maneV'),head('Tail: '+NM+' looks'),look('tailV'),
  ...(b?[head('Mane colour'),colour('mane'),head('Tail colour'),colour('tail'),E('small',{},cr?'Creative: mane and tail colours are independent.':'Mane and tail colours are linked: separate colours unlock in Creative mode. The default is picked automatically from the base colour and silver.')]:[E('small',{},'Base colour is undetermined (unknown alleles): mane and tail colours are unavailable.')])]}},
{id:'face',name:'Face',g:'F',render:()=>drill('face',FACE.map(f=>({id:f,label:L(f)})),s=>({type:s.c.face,v:s.c.faceV}),(s,t,v)=>{s.c.face=t;s.c.faceV=v})},
{id:'legs',name:'Legs',g:'L',render:()=>{const tl=l=>l==='all'?H.LEGS:[l];
 const cur=s=>{const ls=tl(legSel),t0=s.c.legs[ls[0]],v0=s.c.legV[ls[0]];return ls.every(l=>s.c.legs[l]===t0&&s.c.legV[l]===v0)?{type:t0,v:v0}:{type:null,v:0}};
 return drill('leg',LEGT.map(f=>({id:f,label:L(f)})),cur,(s,t,v)=>tl(legSel).forEach(l=>{s.c.legs[l]=t;s.c.legV[l]=v}),[E('div',{className:'pre'},...['all',...H.LEGS].map(l=>chip(l==='all'?'All legs':L(l),legSel===l,()=>{legSel=l;buildOpts()})))])}},
{id:'spots',name:'Body spots',g:'S',render:()=>[head('White belly spots'),grid([T('None',s=>{s.c.belly=0},s=>!s.c.belly),...vr(NV).map(v=>T('Variant '+v,s=>{s.c.belly=v},s=>s.c.belly===v))]),
 head('White ticking'),grid([T('None',s=>{s.c.ticking=0},s=>!s.c.ticking),...vr(NV).map(v=>T('Variant '+v,s=>{s.c.ticking=v},s=>s.c.ticking===v))])]},
{id:'prim',name:'Primitive',g:'P',render:()=>[grid(Object.keys(S.c.prim).map(k=>T(L(k),s=>{s.c.prim[k]=true},s=>s.c.prim[k],s=>{s.c.prim[k]=false},!H.primOk(S)&&'Needs a Dun / Non-dun 1 genotype (or Creative mode)'))),E('small',{},'Available with a Dun or Non-dun 1 genotype (Dilutions tab).')]},
{id:'eyes',name:'Eyes & skin',g:'E',render:()=>[...eyesView(),head('Skin'),grid([['auto','Auto'],['dark','Dark'],['pink','Pink']].map(([k,v])=>T(v,s=>{s.c.skin=k},s=>s.c.skin===k))),
 head('Details'),grid([['mottled','Mottled skin'],['hooves','Striped hooves']].map(([k,v])=>T(v,s=>{s.c[k]=true},s=>s.c[k],s=>{s.c[k]=false})))]}];
// ---- donkey categories (own set; simplified model) ----
const DKC=[['grey_dun','Grey-dun (typical)',[['E','E'],['A','A'],['D','D']]],['red_dun','Red-dun',[['e','e'],['A','A'],['D','D']]],['brown','Brown',[['E','E'],['A','A'],['nd','nd']]],['dark_brown','Dark brown',[['E','E'],['a','a'],['D','D']]],['black','Black',[['E','E'],['a','a'],['nd','nd']]],['light_sandy','Light sandy',[['e','e'],['A','A'],['nd','nd']]]];
const LV=[['strong','Pronounced'],['faint','Faint'],['none','Absent']],DW=[['none','No white markings','N/N'],['small','Small white spots','N/Ws'],['large','Large white patches','N/W'],['extensive','Extensive white spotting','W/W'],['near_white','Almost entirely white','W/W']];
const dkl=(w,v)=>T(L(v)+' '+w,s=>{if(s.mode==='creative')s.d[w]=v;else{s.d.mane=s.d.tail=v;setG(s,'dfgf5',v==='long'?['lh1','lh1']:['N','N'])}},s=>s.d[w]===v);
// donkey eyes: click a colour -> 3 variants
function dkEyes(){const o=open.deye;
 if(!o)return[grid(['brown','blue'].map(k=>({...T(L(k)+' eyes',s=>{if(s.d.eyes!==k)s.d.eyeV=1;s.d.eyes=k},s=>s.d.eyes===k),after:goOpen('deye',k)})))];
 return[E('div',{className:'pre'},chip('← Back',false,goOpen('deye',null))),head(L(o)+' eyes: '+NDE+' variants'),grid(vr(NDE).map(n=>T('Variant '+n,s=>{s.d.eyes=o;s.d.eyeV=n},s=>s.d.eyes===o&&s.d.eyeV===n)))]}
const CATS_D=[breedCat,coatCat,
{id:'dcol',name:'Colour',g:'C',render:()=>[grid(DKC.map(([k,l,[m,a,d]])=>T(l,s=>{setG(s,'dmc1r',m);setG(s,'dasip',a);setG(s,'dtbx3',d)},s=>H.phenotype(s).base===k))),E('small',{},'Simplified editor model (MC1R + ASIP + TBX3): real donkey colour genetics are less established.')]},
{id:'dprim',name:'Primitive markings',g:'P',render:()=>[['dorsal','Dorsal stripe'],['shoulder','Shoulder cross'],['legs','Leg barring']].flatMap(([k,n])=>[head(n),grid(LV.map(([v,l])=>T(l,s=>{s.d[k]=v},s=>s.d[k]===v)))])},
{id:'dwhite',name:'White markings',g:'W',render:()=>[grid(DW.map(([v,l,g])=>T(l,s=>{s.d.white=v;setG(s,'dkit',g.split('/'))},s=>s.d.white===v))),E('small',{},'Each level sets an inferred, simplified KIT genotype (N/N, N/Ws, N/W, W/W). W/W viability is not established.')]},
{id:'dmane',name:'Mane & tail',g:'M',render:()=>[head('Mane'),grid(['short','long'].map(v=>dkl('mane',v))),head('Tail'),grid(['short','long'].map(v=>dkl('tail',v))),E('small',{},S.mode==='creative'?'Creative: mane and tail length are independent and do not change FGF5.':'Mane and tail are linked and set FGF5 (long hair, inferred). Separate lengths unlock in Creative mode.')]},
{id:'dskin',name:'Skin & eyes',g:'S',render:()=>[head('Skin'),grid([['dark','Dark skin'],['pink','Pinkish skin']].map(([k,v])=>T(v,s=>{s.d.skin=k},s=>s.d.skin===k))),head('Eyes'),...dkEyes()]}];
const curCats=()=>isDk(S)?CATS_D:CATS_H;
function buildOpts(){const c=curCats().find(z=>z.id===cat);$('#opts').replaceChildren(E('div',{className:'oh'},E('h2',{},c.name),E('button',{className:'btn',on:{click:()=>randomize(cat)}},'Randomize tab')),...c.render())}
function buildTabs(cs){$('#tabs').replaceChildren(...cs.map(c=>{const g=E('span',{},c.g),im=E('img',{src:MANIFEST.icons[c.id],alt:'',on:{load:()=>g.style.display='none',error:()=>im.remove()}});
 return E('button',{className:'tab',id:'t_'+c.id,on:{click:()=>{cat=c.id;update()}}},E('div',{className:'ic'},g,im),c.name)}))}
// ---- genotype popover, caption, banner ----
function updateGeno(){const P=H.phenotype(S);$('#gs').textContent=H.format(S);$('#ph').textContent=P.name;const LS=H.lociFor(S);
 $('#gt').replaceChildren(...LS.map(l=>{const u=S.unk[l.id],v=u?'?/?':S.g[l.id].join('/'),st=u?'unknown':(S.src[l.id]||'known'),b=!u&&l.restrict[v];
  return E('tr',{},E('td',{},l.name),E('td',{},v),E('td',{className:'st '+st},st),E('td',{},l.inh),E('td',{},l.eff+(b?' ⚠ '+b:'')))}));
 const w=[];LS.forEach(l=>{const v=S.unk[l.id]?'':S.g[l.id].join('/');if(l.restrict[v])w.push(E('li',{className:'w'},'⚠ '+l.name+' '+v+': '+l.restrict[v]))});
 P.over.forEach(o=>w.push(E('li',{},'✎ '+o)));P.notes.forEach(o=>w.push(E('li',{},o)));$('#wr').replaceChildren(...w)}
const bl=()=>(BREEDS.find(b=>b[0]===S.breed)||[])[1]||'';
function cap(){$('#cap').textContent=H.phenotype(S).name+(S.breed!=='riding'?' ('+bl().toLowerCase()+')':'')}
function banner(){const b=$('#ban'),O=!isDk(S)&&H.cnt(S,'fo','O')===2,l=[];if(S.mode==='creative')l.push('Creative mode: artistic overrides are allowed and are not genetically accurate.'+(O?' ⚠ Double frame overo is lethal in real genetics (lethal white overo syndrome).':''));
 if(S.breed==='mule')l.push('Mule: 63 chromosomes, sterile. Cannot be a parent in the Foal calculator.');b.hidden=!l.length;b.textContent=l.join(' ')}
// ---- modal, dice ----
const sel2=(o,v,fn)=>E('select',{on:{change:e=>fn(e.target.value)}},o.map(([a,t,d,ti])=>E('option',{value:a,selected:String(a)===String(v),disabled:!!d,title:ti||''},t)));
function modal(title,nodes,close=true,wide=false){const m=$('#modal');m.replaceChildren(E('div',{className:'dbl box'+(wide?' wide':'')},E('h2',{},title),...nodes,close?E('div',{className:'pre'},E('button',{className:'btn',on:{click:()=>{m.hidden=true}}},'Close')):''));m.hidden=false}
const dieW=()=>E('div',{className:'dw'},E('div',{id:'die'},E('span',{id:'dn'},'20')));
function die(final,sides){return new Promise(res=>{const d=$('#die'),n=$('#dn'),w=$('.dw');w.classList.remove('glow');d.className='';void d.offsetWidth;
 if(matchMedia('(prefers-reduced-motion:reduce)').matches){n.textContent=final;d.className='done';w.classList.add('glow');return res()}
 d.className='roll';let t=0;const tick=()=>{if(t>1900){n.textContent=final;d.className='done';w.classList.add('glow');return setTimeout(res,600)}
  n.textContent=1+Math.floor(Math.random()*sides);const dl=60+t/12;t+=dl;setTimeout(tick,dl)};tick()})}  // faces are decoration; final number = the real pre-generated roll
const showHealth=()=>modal('Health & dice',healthNodes());
function healthNodes(){const fl=H.flags(S),hl=E('ul',{id:'hist'}),dh=()=>hl.replaceChildren(...rolls.map(r=>E('li',{},r))),age=S.c.age,ag=E('b',{},age+' y');let can=false;
 const out=[E('label',{className:'sl'},E('span',{},'Horse age (game) ',ag),E('input',{type:'range',min:1,max:35,step:1,value:age,on:{input:e=>{ag.textContent=e.target.value+' y'},change:e=>{set(s=>{s.c.age=+e.target.value});showHealth()}}})),E('small',{},'REAL = genotype association. FICTIONAL = game dice only; no validated probabilities are configured.')];
 if(isDk(S))out.push(E('small',{},'No donkey-specific conditions are configured.'));
 fl.forEach(h=>{const card=E('div',{className:'flag'},E('span',{className:'badge'},h.kind==='deterministic'?'REAL · DETERMINISTIC':h.kind==='risk'?'REAL · ASSOCIATION':'EVIDENCE UNKNOWN'),E('b',{},h.name+' ('+h.genotype+')'),E('div',{},h.severity+' · '+h.gene),E('div',{style:'font-weight:500'},h.text));
  if(h.kind==='risk'){if(h.minAge&&age<h.minAge)card.append(E('div',{className:'fict'},'Not rolled yet: the horse is '+age+', this risk is rolled from age '+h.minAge+'+.'));
   else{can=true;simP[h.id]=simP[h.id]||h.gp;simD[h.id]=simD[h.id]||20;
    const b=E('button',{className:'btn solid',on:{click:async()=>{if(busy)return;busy=true;const sd=simD[h.id],th=H.threshold(simP[h.id]/100,sd),r=H.rollDie(sd),hit=r<=th,bs=document.querySelectorAll('#modal .solid');bs.forEach(z=>z.disabled=true);
     await die(r,sd);busy=false;bs.forEach(z=>z.disabled=false);$('#res').textContent=h.name+': '+(hit?'condition present. ':'not present. ')+'Rolled '+r+' on d'+sd+', present if ≤ '+th+' (effective '+Math.round(th/sd*100)+'%). FICTIONAL game mechanic, not a veterinary statistic. Genotype unchanged.';
     rolls.unshift('FICTIONAL · '+h.name+' · age '+age+' · d'+sd+': '+r+' vs ≤'+th+' → '+(hit?'present':'absent'));dh()}}},'Roll (fictional)');
    card.append(E('div',{className:'fict'},E('label',{className:'row'},E('span',{},'FICTIONAL probability'),sel2([5,10,15,25,35,50,75].map(v=>[v,v+'%']),simP[h.id],v=>simP[h.id]=+v)),E('label',{className:'row'},E('span',{},'Die'),sel2([[6,'d6'],[12,'d12'],[20,'d20']],simD[h.id],v=>simD[h.id]=+v)),b))}}
  out.push(card)});
 if(!fl.length)out.push(E('p',{},'No genotype-based flags.'));
 if(can)out.push(dieW(),E('p',{id:'res'}));out.push(head('Roll history'),hl);dh();return out}
function showGenetics(){const cr=S.mode==='creative';modal('Genetics (advanced)',[E('small',{},'Edit allele pairs directly. "?/?" (unknown) is never treated as normal. Blocked pairs (lethal or unknown viability) unlock in Creative mode.'+(isDk(S)?' Donkey model is simplified.':'')),
 ...H.lociFor(S).map(l=>{const cur=S.unk[l.id]?'?':S.g[l.id].join('/');return E('label',{className:'row'},E('span',{},l.name),sel2([['?','?/? unknown'],...H.pairs(l).map(p=>{const v=p.join('/'),b=l.restrict[v],blocked=!cr&&b;return[v,v+(b?' ⚠':''),blocked,b||'']})],cur,v=>set(s=>{if(v==='?'){s.unk[l.id]=true;s.src[l.id]='unknown'}else{s.unk[l.id]=false;s.g[l.id]=v.split('/');s.src[l.id]='known'}})))})])}
// ---- randomizer (never picks restricted/lethal genotypes in realistic mode) ----
const pick=a=>a[Math.floor(H.rng()*a.length)];
function wpick(items,w){let t=items.reduce((a,i)=>a+w(i),0)*H.rng();for(const i of items){t-=w(i);if(t<0)return i}return items[0]}
function randomize(scope){set(s=>{const all=scope==='all',has=n=>all||scope===n,cr=s.mode==='creative',dk=isDk(s);
 const rl=id=>{const l=H.locus(id),nl=dk?l.al[0]:l.al[l.al.length-1],ps=H.pairs(l).filter(p=>cr||!l.restrict[p.join('/')]);
  s.g[id]=wpick(ps,p=>['ext','agt','dmc1r','dasip'].includes(id)?1:p.every(a=>a===nl)?4:1);s.unk[id]=false;s.src[id]='known'};
 if(scope==='breed')H.setBreed(s,pick(BREEDS)[0]);
 const randCoat=()=>{s.c.coat=pick(H.coatOpts(s));if(dk&&!cr&&s.c.coat==='long'){setG(s,'dfgf5',['lh1','lh1']);H.dkSync(s,false,true)}};
 if(dk){if(has('dcol'))['dmc1r','dasip','dtbx3'].forEach(rl);if(has('dwhite'))rl('dkit');if(has('dmane'))rl('dfgf5');H.dkSync(s,has('dwhite'),has('dmane'));
  if(has('dprim'))['dorsal','shoulder','legs'].forEach(k=>s.d[k]=pick(['strong','faint','none']));if(has('dskin')){s.d.skin=pick(['dark','pink']);s.d.eyes=pick(['brown','blue']);s.d.eyeV=1+Math.floor(H.rng()*NDE)}if(has('coat'))randCoat();rolls=[];return}
 ['base','dil','pat'].filter(has).forEach(k=>CL[k].forEach(rl));
 if(has('pat'))s.c.lp=pick(Object.keys(LPS));
 if(has('base')){const b=H.phenotype(s).base;if(b){s.c.shade=pick(Object.keys(SHADES[b]));[s.c.bright,s.c.sat]=SHADES[b][s.c.shade]}}
 if(has('mane')){const b=H.phenotype(s).base;if(b){const Z=H.cnt(s,'zs','Z')>0,m=pick(H.maneList(b,false,Z));s.c.mdef=H.maneDef(b,Z);s.c.mane=m;s.c.tail=cr&&H.rng()<.5?pick(H.maneList(b,true,Z)):m}s.c.bleach=Math.floor(H.rng()*20);s.c.maneV=1+Math.floor(H.rng()*NM);s.c.tailV=1+Math.floor(H.rng()*NM)}
 if(has('coat'))randCoat();
 if(has('face')){s.c.face=wpick(FACE,f=>f==='none'?3:1);s.c.faceV=1+Math.floor(H.rng()*NV)}
 if(has('legs'))H.LEGS.forEach(l=>{s.c.legs[l]=wpick(LEGT,f=>f==='none'?4:1);s.c.legV[l]=1+Math.floor(H.rng()*NV)});
 if(has('prim'))for(const k in s.c.prim)s.c.prim[k]=H.primOk(s)&&H.rng()<.6;
 if(has('eyes')){const sup=H.cnt(s,'cr','Cr')===2||H.cnt(s,'sw1','SW1')||H.cnt(s,'sb1','SB1')===2;s.c.eyes=cr?pick(['brown','blue','hetero_complete','hetero_sectoral']):sup?pick(['blue','hetero_complete','hetero_sectoral']):'brown';s.c.eyeV=1+Math.floor(H.rng()*NE);s.c.skin=cr?pick(['auto','dark','pink']):'auto';s.c.mottled=H.rng()<.1;s.c.hooves=H.rng()<.2}
 if(has('spots')){s.c.belly=H.rng()<.2?1+Math.floor(H.rng()*NV):0;s.c.ticking=H.rng()<.15?1+Math.floor(H.rng()*NV):0}
 if(!H.primOk(s))for(const k in s.c.prim)s.c.prim[k]=false;rolls=[]})}
// ---- foal calculator: parents -> inheritance odds -> dice ----
const pct=p=>Math.round(p*1000)/10+'%',LETH='☠ Lethal white overo (no foal)';
const bad=(a,b)=>a.breed==='mule'||b.breed==='mule'?'Mules cannot be parents: a mule has 63 chromosomes (horse 64 × donkey 62), meiosis cannot produce balanced gametes, so mules and hinnies are sterile.':null;
const samp=d=>{const ks=Object.keys(d);let t=H.rng();for(const k of ks){t-=d[k];if(t<0)return k}return ks[ks.length-1]};
function foalDist(tb,LS,dk,fb){const vars=LS.filter(l=>Object.keys(tb[l.id]).length>1);if(vars.reduce((a,l)=>a*Object.keys(tb[l.id]).length,1)>20000)return null;
 const st=H.freshState();if(fb)st.breed=fb;LS.forEach(l=>{const k=Object.keys(tb[l.id]);if(k.length===1)st.g[l.id]=k[0].split('/')});const out={};
 const rec=(i,p)=>{if(i===vars.length){let nm;if(!dk&&st.g.fo.join('/')==='O/O')nm=LETH;else{if(dk)H.dkSync(st,true,true);nm=H.phenotype(st).name}out[nm]=(out[nm]||0)+p;return}const l=vars[i];for(const[k,pr]of Object.entries(tb[l.id])){st.g[l.id]=k.split('/');rec(i+1,p*pr)}};rec(0,1);return out}
function showFoal(){
 const slot=(role,st,put)=>{const fi=E('input',{type:'file',accept:'.json',on:{change:e=>{const f=e.target.files[0];if(!f)return;f.text().then(t=>{try{const o=JSON.parse(t).state;H.ALL.forEach(l=>{if(o.g&&o.g[l.id]&&!(o.unk&&o.unk[l.id]))H.norm(l.id,o.g[l.id])});put(merge(o));showFoal()}catch(er){alert('Invalid save: '+er.message)}})}}});
  return E('div',{className:'flag'},E('b',{},role+': '),st?H.phenotype(st).name+' · '+(BREEDS.find(b=>b[0]===st.breed)||[])[1]:'(empty)',st?E('div',{className:'mono',style:'font-size:13px;font-weight:500;word-break:break-word'},H.format(st)):'',
   E('div',{className:'pre'},E('button',{className:'btn',on:{click:()=>{put(JSON.parse(snap()));showFoal()}}},'Use current horse'),E('label',{className:'btn'},'Load save',fi)))};
 const nodes=[E('small',{},'Pick two parents: the current horse or a saved .json (Save button). Odds are exact per locus; unknown alleles are never assumed normal.'),slot('Sire',sire,v=>sire=v),slot('Dam',dam,v=>dam=v)];
 if(sire&&dam){const why=bad(sire,dam);
  if(why)nodes.push(E('div',{className:'flag'},E('b',{},'Cannot breed: '),why));
  else{const cross=isDk(sire)!==isDk(dam),hs=isDk(sire)?dam:sire,ds=isDk(sire)?sire:dam,dk=!cross&&isDk(sire),LS=cross?H.LOCI:H.lociFor(sire),tb=cross?H.crossMule(hs,ds):H.crossAll(sire,dam),fb=cross?'mule':dk?'donkey':null,vl=LS.filter(l=>tb[l.id]==null||Object.keys(tb[l.id]).length>1),dist=vl.some(l=>tb[l.id]==null)?null:foalDist(tb,LS,dk,fb);
  if(cross)nodes.push(E('div',{className:'flag'},E('b',{},isDk(sire)?'Jack × mare = mule. ':'Stallion × jenny = hinny. '),'The foal is a sterile mule-type hybrid (63 chromosomes). Genes the horse and donkey share (Extension/MC1R, Agouti/ASIP, Dun/TBX3) are inherited from both parents; for every other horse gene the donkey has no counterpart in this model, so it passes the normal allele (a documented assumption, not data). Donkey TBX3 nd is treated as nd2.'));
  nodes.push(head('Possible foal genotypes'),E('ul',{style:'font-size:15px;padding-left:18px'},...(vl.length?vl.map(l=>E('li',{},l.name+': '+(tb[l.id]?Object.entries(tb[l.id]).map(([k,p])=>k+' '+pct(p)).join(' · '):'unknown, not assumed normal'))):[E('li',{},'No variation: every foal gets the same genotype.')])));
  if(dist)nodes.push(head('Foal outcomes'),E('ul',{style:'font-size:15px;padding-left:18px'},...Object.entries(dist).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([n,p])=>E('li',{},n+': '+pct(p)))));
  else nodes.push(E('small',{},'Outcome summary skipped: unknown loci or too many combinations.'));
  const lethal=tb.fo&&tb.fo['O/O'],res=E('div',{}),rb=E('button',{className:'btn solid'},'Roll foal'+(lethal?' (d20)':''));
  if(lethal)nodes.push(E('div',{className:'flag'},'Both parents carry Frame Overo: '+pct(lethal)+' chance of double frame overo (O/O), a lethal gene: no foal. A d20 decides (1-5 lethal).'),dieW());
  rb.onclick=async()=>{rb.disabled=true;let fo=null,r=null;
   if(lethal){r=H.rollDie(20);await die(r,20);let acc=0;for(const k of H.pairs(H.locus('fo')).map(q=>q.join('/'))){acc+=Math.round((tb.fo[k]||0)*20);if(r<=acc){fo=k;break}}}
   const fs=H.freshState();fs.mode=S.mode;fs.breed=cross?'mule':dk?'donkey':(H.rng()<.5?sire.breed:dam.breed);fs.c.coat=H.COAT_DEF[fs.breed]||'short';LS.forEach(l=>{if(tb[l.id]==null){fs.unk[l.id]=true;fs.src[l.id]='unknown';return}fs.src[l.id]='known';
    if(l.id==='fo'&&fo){fs.g.fo=fo.split('/');return}const ks=Object.keys(tb[l.id]);
    fs.g[l.id]=ks.length===1?ks[0].split('/'):H.norm(l.id,cross?[hs.g[l.id][Math.floor(H.rng()*2)],samp(H.donkeyGametes(ds,l.id))]:[sire.g[l.id][Math.floor(H.rng()*2)],dam.g[l.id][Math.floor(H.rng()*2)]])});
   if(dk)H.dkSync(fs,true,true);
   const dead=!dk&&!fs.unk.fo&&fs.g.fo.join('/')==='O/O';
   res.replaceChildren(dead?E('div',{className:'flag'},E('b',{},'☠ Lethal: the foal is not born.'),E('div',{},'Rolled '+r+' on d20, double frame overo on 1-5. Genotype of the conception: '+H.format(fs)+'. Roll again for another mating.')):
    E('div',{className:'flag'},E('b',{},(cross?(isDk(sire)?'Mule':'Hinny')+' foal: ':'Foal: ')+H.phenotype(fs).name),E('div',{className:'mono',style:'font-size:13px;word-break:break-word'},H.format(fs)),r?E('div',{},'Lethal-gene roll: '+r+' on d20, safe (lethal only on 1-5).'):'',
     E('div',{className:'pre'},E('button',{className:'btn solid',on:{click:()=>{$('#modal').hidden=true;set(s=>{Object.assign(s,fs);rolls=[]})}}},'Load foal as current horse'))));
   rb.disabled=false};
  nodes.push(res,E('div',{className:'pre'},rb))}}
 modal('Foal calculator',nodes,true,true)}
// ---- bottom bar ----
const dl=(n,b)=>{const a=E('a',{href:URL.createObjectURL(b),download:n});a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1e3)};
const copy=()=>navigator.clipboard.writeText(H.format(S)).then(()=>{$('#cp').textContent='Copied ✓';setTimeout(()=>$('#cp').textContent='Copy genotype',1200)});
const cbtn=E('button',{className:'btn',title:'Allow artistic overrides and fictional combinations (labelled, not genetically accurate)',on:{click:()=>set(s=>{s.mode=s.mode==='creative'?'real':'creative'})}},'Creative: off'),bu=E('button',{className:'btn',on:{click:undo}},'Undo'),br=E('button',{className:'btn',on:{click:redo}},'Redo');
$('#bottom').append(E('button',{className:'btn solid',on:{click:()=>randomize('all')}},'Randomize'),bu,br,
 E('button',{className:'btn danger',on:{click:()=>set(s=>{Object.assign(s,H.freshState());rolls=[]})}},'Reset'),cbtn,
 E('div',{className:'cw'},E('button',{className:'btn solid big',on:{click:()=>cv.toBlob(b=>dl('horse.png',b))}},'PNG'),E('div',{id:'cap'})),
 E('button',{className:'btn',on:{click:showGenetics}},'Genetics'),E('button',{className:'btn',on:{click:showHealth}},'Health'),E('button',{className:'btn',on:{click:showFoal}},'Foal calculator'),
 E('button',{className:'btn',title:'Save only the appearance (cosmetics + render layers). The genotype is not included.',on:{click:()=>dl('look.json',new Blob([JSON.stringify({kind:'horse-look',version:1,breed:S.breed,c:S.c,d:S.d,render:specOf(S,false)},null,1)],{type:'application/json'}))}},'Save look'),
 E('label',{className:'btn',title:'Restore a saved appearance. The genotype is never changed.'},'Load look',E('input',{type:'file',accept:'.json',on:{change:e=>{const f=e.target.files[0];if(!f)return;f.text().then(t=>{try{const j=JSON.parse(t);if(j.kind!=='horse-look'||!j.c||!j.d)throw new Error('not a horse-look file');
  set(s=>{if(j.breed)s.breed=j.breed==='ornamental'?'show':j.breed;s.c=Object.assign(s.c,j.c);s.d=Object.assign(s.d,j.d);const P=H.phenotype(s);if(P.base&&!isDk(s))s.c.mdef=H.maneDef(P.base,H.cnt(s,'zs','Z')>0)})}catch(er){alert('Invalid look: '+er.message)}});e.target.value=''}}})),
 E('button',{className:'btn',on:{click:()=>dl('horse.json',new Blob([JSON.stringify({version:3,genotype:H.format(S),state:S},null,1)],{type:'application/json'}))}},'Save'),
 E('label',{className:'btn'},'Load',E('input',{type:'file',accept:'.json',on:{change:e=>{const f=e.target.files[0];if(!f)return;f.text().then(t=>{try{const o=JSON.parse(t).state;H.ALL.forEach(l=>{if(o.g&&o.g[l.id]&&!(o.unk&&o.unk[l.id]))H.norm(l.id,o.g[l.id])});const m=merge(o);set(s=>{Object.assign(s,m)})}catch(er){alert('Invalid config: '+er.message)}});e.target.value=''}}})));
$('#cp').onclick=copy;$('#gbtn').onclick=()=>{const g=$('#gpop');g.hidden=!g.hidden;$('#gbtn').textContent=g.hidden?'Genotype ▾':'Genotype ▴'};
$('#zoom').oninput=e=>{$('#inner').style.setProperty('--z',e.target.value);$('#ms').textContent='×'+e.target.value};
function update(){const cs=curCats();if(!cs.some(c=>c.id===cat))cat='breed';const sig=cs.map(c=>c.id).join();if(sig!==tabSig){tabSig=sig;buildTabs(cs)}
 cs.forEach(c=>$('#t_'+c.id).classList.toggle('on',c.id===cat));buildOpts();updateGeno();draw();$('#bgc').checked=S.c.bg;cap();banner();cbtn.textContent='Creative: '+(S.mode==='creative'?'ON':'off');cbtn.className='btn'+(S.mode==='creative'?' solid':'');bu.disabled=!hist.length;br.disabled=!fut.length}
$('#bgc').onchange=e=>{S.c.bg=e.target.checked;draw()};
update();
})();
