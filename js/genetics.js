(function(){
const M=(id,name,al,inh,eff,restrict)=>({id,name,al,inh,eff,restrict:restrict||{}});
const LOCI=[
M('ext','Extension',['E','e'],'E dominant, e recessive','e/e = chestnut base; E_ permits black pigment'),
M('agt','Agouti',['A','a'],'A dominant over a; acts only with E_','E_ A_ = bay; E_ a/a = black; no effect with e/e'),
M('cr','Cream',['Cr','n'],'Incomplete dominant','Cr/n single dilution; Cr/Cr double dilution (not lethal)'),
M('dun','Dun',['D','nd1','nd2'],'D > nd1 > nd2','D: dun dilution + primitive markings; nd1: primitive markings only; nd2: no dun effect'),
M('zs','Silver',['Z','n'],'Dominant','Dilutes black pigment only; no visible silver effect on chestnut'),
M('ch','Champagne',['Ch','n'],'Dominant','Gold/amber/classic champagne depending on base; pink skin, light eyes'),
M('prl','Pearl',['Prl','n'],'Recessive','Prl/n: no visible effect; Prl/Prl or Prl+Cr compound dilutes'),
M('mu','Mushroom',['Mu','n'],'Recessive','Mu/Mu mutes red pigment; no effect from one copy'),
M('g','Grey',['G','g'],'G dominant','Progressive greying on any base'),
M('to','Tobiano',['TO','n'],'Dominant','White patches crossing the topline; extent varies'),
M('fo','Frame Overo',['O','n'],'Dominant','Irregular white on sides, neck, belly; O/O = lethal white overo syndrome',{'O/O':'Lethal white overo syndrome (not a viable adult genotype)'}),
M('sb1','Sabino 1',['SB1','n'],'Incomplete dominant','Variable white: high stockings, face, belly; SB1/SB1 can be near-white'),
M('sw1','Splashed White',['SW1','n'],'SW1 variant; incomplete dominant','Blue eyes, white head/legs; other SW variants not modelled'),
M('w','Dominant White',['W20','n'],'W20 variant, dominant','Variable white; viability is variant-specific',{'W20/W20':'No W20 homozygotes documented; viability unknown'}),
M('rn','Classic Roan',['Rn','n'],'Dominant','White hairs in body, head/lower legs darker',{'Rn/Rn':'Homozygote viability evidence incomplete (embryonic loss suspected)'}),
M('lp','Leopard Complex',['LP','lp'],'LP dominant (incomplete)','Appaloosa patterns; LP/LP associated with CSNB'),
M('patn1','PATN1',['PATN1','n'],'Modifier of LP','Modifies LP pattern extent; alone not sufficient for a pattern')];
const DK=[M('dmc1r','MC1R',['E','e'],'E dominant, e recessive','Base pigment incl. red (e/e). *Simplified donkey model'),
M('dasip','ASIP',['A','a'],'A dominant, a recessive','Distribution of dark pigment (a/a = darker). *Simplified donkey model'),
M('dtbx3','TBX3',['D','nd'],'D dominant','Dun colour and primitive markings. *Simplified donkey model'),
M('dkit','KIT',['N','W','Ws'],'W / Ws white variants','White markings and spotting; W/W viability not established. *Simplified'),
M('dfgf5','FGF5',['N','lh1','lh2'],'lh1 / lh2 recessive (long hair)','Long mane, tail and coat hair')];
DK[3].opts=['N/N','N/W','N/Ws','W/W'];DK[4].opts=['N/N','N/lh1','N/lh2','lh1/lh1','lh1/lh2','lh2/lh2'];
const ALL=LOCI.concat(DK);
const LEGS=['front_left','front_right','hind_left','hind_right'];
const loc=id=>ALL.find(l=>l.id===id);
const pairs=l=>l.opts?l.opts.map(x=>x.split('/')):l.al.flatMap((a,i)=>l.al.slice(i).map(b=>[a,b]));
const norm=(id,p)=>{const l=loc(id);if(!Array.isArray(p)||p.length!==2||p.some(a=>!l.al.includes(a)))throw new Error('Invalid alleles for '+id+': '+p);return[...p].sort((a,b)=>l.al.indexOf(a)-l.al.indexOf(b))};
const defaultGenes=()=>Object.fromEntries([...LOCI.map(l=>{const a=['ext','agt'].includes(l.id)?l.al[0]:l.al[l.al.length-1];return[l.id,[a,a]]}),...DK.map(l=>[l.id,[l.al[0],l.al[0]]])]);
const freshState=()=>({g:defaultGenes(),unk:{},src:{},mode:'real',breed:'riding',lethal:null,d:{dorsal:'strong',shoulder:'strong',legs:'strong',white:'none',mane:'short',tail:'short',skin:'dark',eyes:'brown',eyeV:1},c:{coat:'short',maneV:1,tailV:1,face:'none',legs:{front_left:'none',front_right:'none',hind_left:'none',hind_right:'none'},mane:'black',tail:'black',mdef:'black',flax:false,eyes:'brown',eyeV:1,skin:'auto',belly:0,ticking:0,faceV:1,legV:{front_left:1,front_right:1,hind_left:1,hind_right:1},mottled:false,hooves:false,prim:{dorsal_stripe:false,leg_barring:false,shoulder_barring:false},lp:'full',tobInt:100,greyAge:50,bright:100,sat:100,bleach:0,shade:'standard',age:5,bg:true}});
const cnt=(s,id,a)=>s.unk[id]?0:s.g[id].filter(x=>x===a).length;
const lociFor=s=>s.breed==='donkey'?DK:LOCI;
const format=s=>lociFor(s).map(l=>s.unk[l.id]?'?/?':norm(l.id,s.g[l.id]).join('/')).join(' ');
const gametes=p=>p[0]===p[1]?{[p[0]]:1}:{[p[0]]:.5,[p[1]]:.5};
const cross=(id,a,b)=>{if(!a||!b)return null;const ga=gametes(a),gb=gametes(b),o={};for(const x in ga)for(const y in gb){const k=norm(id,[x,y]).join('/');o[k]=(o[k]||0)+ga[x]*gb[y]}return o};
const crossAll=(s1,s2)=>Object.fromEntries(lociFor(s1).map(l=>[l.id,(s1.unk[l.id]||s2.unk[l.id])?null:cross(l.id,s1.g[l.id],s2.g[l.id])]));
// P(exact foal genotype {id:'E/e',..}); null if any locus unknown (never assumes normal)
const jointProb=(t,target)=>Object.keys(t).reduce((p,id)=>p==null||t[id]==null?null:p*(t[id][target[id]]||0),1);
const primOk=s=>s.mode==='creative'||cnt(s,'dun','D')+cnt(s,'dun','nd1')>0;
// coat length: defaults per type; a mule can only be short or medium
const COATS=['short','medium','long'],COAT_DEF={draft:'long',riding:'short',show:'short',pony:'short',mule:'short',donkey:'short'};
const coatOpts=s=>s.breed==='mule'?['short','medium']:COATS;
function setBreed(s,k){s.breed=k;s.c.coat=COAT_DEF[k]||'short';return s}
const dkLong=s=>!s.unk.dfgf5&&s.g.dfgf5[0]!=='N'&&s.g.dfgf5[1]!=='N';
const maneDef=(b,z)=>b==='chestnut'?'red':z?'silver':'black';
const maneList=(b,cr,z)=>!b?[]:cr?['black','silver','bleached','red','copper','darkred','flaxen','paleflaxen']:b==='chestnut'?['red','copper','darkred','flaxen','paleflaxen']:z?['silver','bleached']:['black','bleached'];
function phenotype(s){if(s.breed==='donkey')return donkeyPhenotype(s);
 const c=s.c,notes=[],over=[],layers=[],P=(k,a=1)=>layers.push({key:k,a}),n=(i,a)=>cnt(s,i,a),mv=c.maneV||1,tv=c.tailV||1,PS=(nm,a)=>{P('pat.'+nm,a);P('manespot.'+nm+'_'+mv,a);P('tailspot.'+nm+'_'+tv,a)};
 let base=null;
 if(!s.unk.ext){if(n('ext','e')===2)base='chestnut';else if(!s.unk.agt)base=n('agt','a')===2?'black':'bay'}
 const cr=n('cr','Cr'),D=n('dun','D'),nd1=n('dun','nd1'),Z=n('zs','Z'),Ch=n('ch','Ch'),pr=n('prl','Prl'),Mu=n('mu','Mu'),G=n('g','G'),LP=n('lp','LP');
 let name=base||'undetermined base (Extension/Agouti not fully known)';
 if(base){
  if(cr)name={chestnut:['palomino','cremello'],bay:['buckskin','perlino'],black:['smoky black','smoky cream']}[base][cr-1];
  if(D){const dn={bay:'bay dun',chestnut:'red dun',black:'grullo'}[base];name=!cr?dn:({chestnut1:'dunalino',bay1:'dunskin'}[base+cr]||name+' + dun')}
  else if(nd1)notes.push('nd1: primitive markings only, no dun dilution');
  if(Z){if(base==='chestnut')notes.push('Silver: no visible effect on chestnut');else name='silver '+name}
  if(Ch)name=(cr||D)?name+' + champagne':{chestnut:'gold champagne',bay:'amber champagne',black:'classic champagne'}[base];
  if(pr===2)name+=' + pearl (homozygous)';else if(pr&&cr===1)name+=' + pearl/cream compound';else if(pr)notes.push('Single pearl copy: no visible effect');
  if(Mu===2){if(base==='chestnut')name+=' + mushroom';else notes.push('Mushroom acts on red pigment: nothing visible on this base')}else if(Mu)notes.push('Single mushroom copy: no visible effect');
  P('base.'+base);
  if(cr)P('dil.cream_'+(cr===2?'double':'single'));if(D)P('dil.dun');if(Z&&base!=='chestnut')P('dil.silver');if(Ch)P('dil.champagne');
  if(pr===2||(pr&&cr===1))P('dil.pearl');if(Mu===2&&base==='chestnut')P('dil.mushroom');
 }
 if(G){name+=' + grey';PS('grey',c.greyAge/100)}
 let pats=0;const pt=(cond,k,a)=>{if(cond){PS(k,a);pats++}};
 pt(n('to','TO'),'tobiano',c.tobInt/100);pt(n('fo','O'),'frame_overo');pt(n('sb1','SB1'),'sabino');pt(n('sw1','SW1'),'splashed_white');pt(n('w','W20'),'dominant_white');pt(n('rn','Rn'),'roan');if(LP){P('pat.leopard_'+c.lp);pats++}
 if(pats>1)notes.push('Several white patterns: layers are stacked as a visual approximation, not a validated interaction model');
 if(n('patn1','PATN1'))notes.push(LP?'PATN1 present: may increase LP pattern extent (no separate art layer)':'PATN1 without LP: no pattern expected');
 if(primOk(s))for(const k in c.prim)if(c.prim[k]){P('prim.'+k);if(!(D||nd1))over.push('Primitive markings without Dun: creative override')}
 if(c.face!=='none')P('face.'+c.face+'_'+(c.faceV||1));
 LEGS.forEach(l=>c.legs[l]!=='none'&&P('leg.'+l+'_'+c.legs[l]+'_'+((c.legV&&c.legV[l])||1)));
 if(c.belly)P('det.belly_spots_'+c.belly);if(c.ticking)P('det.ticking_'+c.ticking);[['mottled','mottled_skin'],['hooves','striped_hooves']].forEach(([k,f])=>c[k]&&P('det.'+f));
 if(c.skin!=='auto'){P('det.'+c.skin+'_skin');over.push('Skin colour: cosmetic override')}
 if(base){const dm=maneDef(base,Z),ok=maneList(base,false,Z>0),m=(c.mane&&c.mane!=='auto')?c.mane:dm,tl=(c.tail&&c.tail!=='auto')?c.tail:m,fx=['flaxen','paleflaxen'];
  if(base==='chestnut'&&(fx.includes(m)||fx.includes(tl))){name+=' (flaxen)';notes.push('Flaxen mane/tail: phenotype option only; its genetics are not established, so no genotype is assigned')}
  if(!ok.includes(m)||!ok.includes(tl))over.push('Mane/tail colour: creative override');else if(m!==tl)over.push('Mane and tail colours differ (creative)');
  P('mane.'+m+'_'+mv);P('tail.'+tl+'_'+tv)}
 P('coat.'+(c.coat||'short'));
 if(c.eyes!=='brown'&&!(cr===2||n('sw1','SW1')||n('fo','O')||n('w','W20')||n('sb1','SB1')===2))over.push('Eye colour: cosmetic override (no matching genotype)');
 P('eye.'+c.eyes+'_'+(c.eyeV||1));P('line.body');P('line.mane_'+mv);P('line.tail_'+tv);
 return{base,name,layers,notes,over};
}
const DKN={grey_dun:'grey-dun',red_dun:'red-dun',brown:'brown',dark_brown:'dark brown',black:'black',light_sandy:'light sandy'},DKW={small:'small white spots',large:'large white patches',extensive:'extensive white',near_white:'almost entirely white'};
// simplified editor model: donkey colour genetics are less established than horse genetics
function donkeyPhenotype(s){const d=s.d,n=(i,a)=>cnt(s,i,a),notes=['Donkey colour model is simplified: real donkey colour genetics are less established'],over=[],layers=[],P=k=>layers.push({key:k,a:1});
 let base=null,name='undetermined colour (unknown alleles)';
 if(!s.unk.dmc1r&&!s.unk.dasip&&!s.unk.dtbx3){const red=n('dmc1r','e')===2,dark=n('dasip','a')===2,dun=n('dtbx3','D')>0;base=red?(dun?'red_dun':'light_sandy'):dark?(dun?'dark_brown':'black'):(dun?'grey_dun':'brown');name=DKN[base];P('dk.base.'+base)}
 for(const k of['dorsal','shoulder','legs'])if(d[k]!=='none')P('dk.'+k+'_'+d[k]);
 if(d.white!=='none'){P('dk.white_'+d.white);name+=' + '+DKW[d.white]}
 P('dk.mane_'+d.mane);P('dk.tail_'+d.tail);P('dk.skin_'+d.skin);P('dk.eye_'+d.eyes+'_'+(d.eyeV||1));P('dk.coat_'+(s.c.coat||'short'));P('dk.line.body');P('dk.line.mane');P('dk.line.tail');
 if(d.mane!==d.tail)over.push('Mane and tail length differ (creative)');
 return{base,name,layers,notes,over}}
function dkSync(s,white,mane){const k=s.g.dkit.join('/'),f=s.g.dfgf5;
 if(white&&!s.unk.dkit)s.d.white={'N/N':'none','N/Ws':'small','N/W':'large','W/W':'extensive'}[k]||'large';
 if(mane&&!s.unk.dfgf5)s.d.mane=s.d.tail=(f[0]!=='N'&&f[1]!=='N')?'long':'short'}
// horse x donkey -> mule/hinny. Shared loci: Extension=MC1R, Agouti=ASIP, Dun=TBX3 (donkey nd -> nd2, simplified).
// Every other horse locus has no donkey counterpart in this model: the donkey passes the normal allele (documented assumption).
const DKMAP={ext:['dmc1r',{}],agt:['dasip',{}],dun:['dtbx3',{nd:'nd2'}]};
function donkeyGametes(d,id){const m=DKMAP[id];
 if(m){if(d.unk[m[0]])return null;const g=gametes(d.g[m[0]]),o={};for(const a in g){const b=m[1][a]||a;o[b]=(o[b]||0)+g[a]}return o}
 const l=loc(id);return{[l.al[l.al.length-1]]:1}}
function crossMule(h,d){return Object.fromEntries(LOCI.map(l=>{if(h.unk[l.id])return[l.id,null];const dg=donkeyGametes(d,l.id);if(!dg)return[l.id,null];
 const hg=gametes(h.g[l.id]),o={};for(const x in hg)for(const y in dg){const k=norm(l.id,[x,y]).join('/');o[k]=(o[k]||0)+hg[x]*dg[y]}return[l.id,o]}))}
const H={COATS,COAT_DEF,coatOpts,setBreed,dkLong,crossMule,donkeyGametes,ALL,DK,lociFor,maneDef,dkSync,LOCI,LEGS,locus:loc,pairs,norm,defaultGenes,freshState,cnt,format,gametes,cross,crossAll,jointProb,phenotype,primOk,maneList};
if(typeof module!=='undefined')module.exports=H;else window.HM=H;
})();
