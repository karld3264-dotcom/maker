// PNG layer compositor. Knows NOTHING about genetics: it receives a render spec
//   {layers:[{key,a}], baseKey, donkey, breed, filter:{b,s}, bg}
// and draws it in the order defined by MANIFEST.slots (bottom -> top). Draw order never depends on the order
// of spec.layers. Nothing here can read or change a genotype.
(function(){
class HorseRenderer{
 constructor(M){this.M=M;this.imgs=new Map();this.tinted=new Map();this.gc={};this.warned=new Set()}
 // ---- pure helpers (unit-tested in node) ----
 static slotOf(M,key){for(const[n,ps]of Object.entries(M.slots))for(const p of ps)if(key.startsWith(p))return{slot:n,pi:ps.indexOf(p)};return null}
 static sortLayers(M,layers){const names=Object.keys(M.slots);
  return layers.map((l,i)=>{const s=HorseRenderer.slotOf(M,l.key);return{...l,slot:s?s.slot:null,si:s?names.indexOf(s.slot):names.length,pi:s?s.pi:0,i}}).sort((a,b)=>a.si-b.si||a.pi-b.pi||a.i-b.i)}
 static isOptional(M,key){return(M.optional||[]).some(p=>key.startsWith(p))}
 // ---- loading / resolving ----
 load(p){let r=this.imgs.get(p);if(!r){r=new Promise(ok=>{const i=new Image();i.onload=()=>ok(i);i.onerror=()=>ok(null);i.src=p});this.imgs.set(p,r)}return r}
 async file(p,breed){const d=this.M.dirs&&this.M.dirs[breed],r=p.startsWith('assets/horse/')?p.slice(13):null;
  if(d&&r){const i=await this.load(d+r);if(i)return{img:i,path:d+r,fb:false}}
  const i=await this.load(p);return{img:i,path:p,fb:!!(i&&d&&r)}}
 // neutral (grey) PNG -> recoloured canvas; cached per file+colour
 tint(img,path,color){const k=path+'|'+color;let c=this.tinted.get(k);
  if(!c){c=document.createElement('canvas');c.width=img.naturalWidth||img.width;c.height=img.naturalHeight||img.height;const x=c.getContext('2d');
   x.drawImage(img,0,0);x.globalCompositeOperation='multiply';x.fillStyle=color;x.fillRect(0,0,c.width,c.height);x.globalCompositeOperation='destination-in';x.drawImage(img,0,0);this.tinted.set(k,c)}
  return c}
 // 1) dedicated PNG (breed folder, then shared)  2) neutral PNG tinted with the manifest colour  3) missing
 async resolve(l,breed){const M=this.M,p=M.files[l.key];if(!p)return{...l,ok:false,path:null,why:'no manifest entry'};
  const f=await this.file(p,breed);if(f.img)return{...l,ok:true,img:f.img,path:f.path,fb:f.fb,mode:'file'};
  const t=M.tint&&M.tint[l.key];
  if(t){const n=await this.file(t.src,breed);if(n.img)return{...l,ok:true,img:this.tint(n.img,n.path,t.color),path:n.path,fb:n.fb,mode:'tint'}}
  return{...l,ok:false,path:p,why:'file not found',tintSrc:t&&t.src}}
 compose(spec){return Promise.all(HorseRenderer.sortLayers(this.M,spec.layers).map(l=>this.resolve(l,spec.breed)))}
 report(items){const r={missing:[],optional:[],tinted:[],fb:0,unslotted:[]};
  for(const i of items){
   if(!i.slot){r.unslotted.push(i.key);this.warn('slot:'+i.key,'no slot defined for key "'+i.key+'": drawn on top (add its prefix to MANIFEST.slots)')}
   if(!i.ok){const o=HorseRenderer.isOptional(this.M,i.key);(o?r.optional:r.missing).push(i.path||i.key+' (no manifest entry)');if(!o)this.warn(i.key+i.path,i.why+': '+i.key+(i.path?' -> '+i.path:'')+(i.tintSrc?' (or neutral '+i.tintSrc+')':''))}
   else{if(i.mode==='tint')r.tinted.push(i.key);if(i.fb)r.fb++}}
  return r}
 warn(id,msg){if(this.warned.has(id))return;this.warned.add(id);console.warn('[HorseRenderer] '+msg)}
 // ---- drawing ----
 draw(c,W,H,i,spec){if(!i.ok)return;if(i.slot==='base'&&spec.filter)c.filter='brightness('+spec.filter.b+'%) saturate('+spec.filter.s+'%)';
  c.globalAlpha=i.a;c.drawImage(i.img,0,0,W,H);c.filter='none';c.globalAlpha=1}
 silhouette(c,W,Hh,col,dk){const X=a=>W*a,Y=a=>Hh*a,P=(...q)=>{c.beginPath();c.moveTo(X(q[0]),Y(q[1]));for(let i=2;i<q.length;i+=2)c.lineTo(X(q[i]),Y(q[i+1]));c.closePath();c.fill();c.stroke()};
  c.fillStyle=col;c.strokeStyle='#b3a999';c.lineWidth=Math.max(1,Hh/250);c.setLineDash([Hh/50,Hh/70]);
  c.beginPath();c.ellipse(X(.47),Y(.5),X(.19),Y(.11),0,0,7);c.fill();c.stroke();
  P(.57,.46,.63,.20,.71,.16,.87,.37,.84,.43,.74,.33,.68,.55);dk?P(.68,.17,.68,.03,.73,.15):P(.69,.17,.70,.10,.73,.16);P(.30,.44,.20,.50,.17,.74,.22,.62,.28,.54);
  [.55,.60,.33,.38].forEach(f=>P(f,.58,f+.03,.58,f+.03,.86,f,.86));c.setLineDash([])}
 placeholder(c,W,Hh,spec,b,big){const pal=this.M.palette||{},col=(spec.donkey?pal.donkey:pal.base||{})[spec.baseKey]||'#3a2a2d';this.silhouette(c,W,Hh,col,spec.donkey);
  if(!big)return;c.strokeStyle='#8a1220';c.lineWidth=Math.max(2,Hh/200);c.setLineDash([Hh/40,Hh/60]);c.strokeRect(2,2,W-4,Hh-4);c.setLineDash([]);
  c.fillStyle='#d8cfc0';c.textAlign='center';c.font=Math.round(Hh*.04)+'px Georgia';c.fillText(spec.baseKey?'PLACEHOLDER '+(spec.donkey?'DONKEY':'HORSE')+': replace with your art':'Colour undetermined (unknown alleles)',W/2,Hh*.93);
  const t=b&&this.M.tint&&this.M.tint[b.key];c.font=Math.round(Hh*.026)+'px Georgia';c.fillStyle='#b3a999';if(b&&b.path)c.fillText('PNG '+this.M.canvas.w+'x'+this.M.canvas.h+': '+b.path+(t?' or neutral '+t.src:''),W/2,Hh*.97)}
 bgPlaceholder(c,W,Hh){c.fillStyle='#241719';c.fillRect(0,0,W,Hh);c.fillStyle='#2e1a1e';c.fillRect(0,Hh*.86,W,Hh*.14);c.fillStyle='#b3a999';c.textAlign='left';c.font=Math.round(Hh*.026)+'px Georgia';c.fillText('BACKGROUND placeholder: '+this.M.files['bg.default'],Hh*.02,Hh*.045)}
 // small canvases (option tiles): flat compositing, shares the image cache
 async renderFlat(cv,spec,stale){const items=await this.compose(spec);if(stale&&stale())return null;const c=cv.getContext('2d'),W=cv.width,H=cv.height;
  c.setLineDash([]);c.filter='none';c.globalAlpha=1;c.clearRect(0,0,W,H);
  const b=items.find(i=>i.slot==='base');if(!b||!b.ok)this.placeholder(c,W,H,spec,b,false);
  items.forEach(i=>this.draw(c,W,H,i,spec));return this.report(items)}
 // main preview: layers are grouped (tail | body | eyes+line | mane); a group is only redrawn when ITS layers changed
 async renderPreview(cv,spec,stale){const{w:W,h:H}=this.M.canvas,items=await this.compose(spec),bgi=spec.bg?await this.load(this.M.files['bg.default']):null;
  if(stale&&stale())return null;if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H}
  const stats={rebuilt:[],reused:[]},cvs=[];
  for(const g of this.M.groups){const its=items.filter(i=>g.slots.includes(i.slot)),hasBase=g.slots.includes('base'),b=its.find(i=>i.slot==='base'),needPh=hasBase&&(!b||!b.ok);
   const sig=[W,H,needPh?'ph:'+spec.baseKey+spec.donkey+(b&&b.path):'',hasBase&&spec.filter?spec.filter.b+','+spec.filter.s:'',...its.map(i=>i.key+':'+i.a+':'+(i.ok?i.path+i.mode:'x'))].join('|');
   let e=this.gc[g.id];
   if(e&&e.sig===sig)stats.reused.push(g.id);
   else{if(!e)e=this.gc[g.id]={cv:document.createElement('canvas')};e.cv.width=W;e.cv.height=H;const c=e.cv.getContext('2d');
    if(needPh)this.placeholder(c,W,H,spec,b,true);its.forEach(i=>this.draw(c,W,H,i,spec));e.sig=sig;stats.rebuilt.push(g.id)}
   cvs.push(e.cv)}
  const c=cv.getContext('2d');c.setLineDash([]);c.filter='none';c.globalAlpha=1;c.clearRect(0,0,W,H);
  if(spec.bg){bgi?c.drawImage(bgi,0,0,W,H):this.bgPlaceholder(c,W,H)}
  cvs.forEach(k=>c.drawImage(k,0,0));items.filter(i=>!i.slot).forEach(i=>this.draw(c,W,H,i,spec));
  const r=this.report(items);r.stats=stats;if(spec.bg&&!bgi)r.missing.push(this.M.files['bg.default']);return r}
 clearCache(){this.gc={};this.tinted.clear();this.imgs.clear()}
}
if(typeof module!=='undefined')module.exports=HorseRenderer;else window.HorseRenderer=HorseRenderer;
})();
