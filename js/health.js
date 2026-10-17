(function(){
const H=typeof module!=='undefined'?require('./genetics.js'):window.HM,n=H.cnt;
// kind: deterministic = fixed flag, no roll | risk = association only, NO validated probability (fictional sim optional) | unknown = evidence incomplete, no roll
H.HEALTH=[
{id:'lwos',name:'Lethal white overo syndrome',gene:'Frame Overo (EDNRB)',genotype:'O/O',kind:'deterministic',severity:'Lethal',test:s=>n(s,'fo','O')===2,text:'In real genetics O/O foals are born white with a non-functional colon and die within days. When two Frame Overo carriers are crossed each foal has a 25% chance of O/O; the Foal calculator rolls this with a d20 (a lethal result means no foal).'},
{id:'mel',name:'Melanoma (age-related)',gene:'Grey (STX17)',genotype:'G/-',kind:'risk',severity:'Variable',minAge:15,gp:50,test:s=>n(s,'g','G')>0,text:'Grey horses have an elevated risk of melanoma that grows with age; it is not guaranteed. Rolled in the game from age 15+. No validated probability is configured.'},
{id:'csnb',name:'Congenital stationary night blindness',gene:'Leopard Complex (TRPM1)',genotype:'LP/LP',kind:'risk',severity:'Non-lethal',gp:50,test:s=>n(s,'lp','LP')===2,text:'LP/LP is associated with CSNB (poor vision in dim light). Not lethal. No validated probability is configured.'},
{id:'eru',name:'Equine recurrent uveitis (ERU)',gene:'Leopard Complex',genotype:'LP/-',kind:'risk',severity:'Variable',gp:25,test:s=>n(s,'lp','LP')>0,text:'Leopard Complex horses are reported to have a higher risk of recurrent uveitis (painful eye inflammation). No validated probability is configured.'},
{id:'mcoa',name:'Multiple congenital ocular anomalies (MCOA)',gene:'Silver (PMEL)',genotype:'Z/Z',kind:'risk',severity:'Variable',gp:25,test:s=>n(s,'zs','Z')===2,text:'Z/Z is associated with more severe eye anomalies than Z/n. Silver is not lethal. No validated probability is configured.'},
{id:'deaf',name:'Deafness',gene:'Splashed White (SW1)',genotype:'SW1/-',kind:'risk',severity:'Variable',gp:25,test:s=>n(s,'sw1','SW1')>0,text:'Splashed white is associated with deafness in some horses; most carriers are not affected. No validated probability is configured.'},
{id:'skin',name:'Sunburn / skin cancer risk',gene:'Unpigmented skin (Cream/Cream or pink skin)',genotype:'Cr/Cr or pink skin',kind:'risk',severity:'Variable',gp:25,test:s=>n(s,'cr','Cr')===2||s.c.skin==='pink',text:'Unpigmented skin is more prone to sunburn and skin tumours such as squamous cell carcinoma. No validated probability is configured.'},
{id:'w20',name:'W20 homozygote viability',gene:'Dominant White (W20)',genotype:'W20/W20',kind:'unknown',severity:'Unknown',test:s=>n(s,'w','W20')===2,text:'No documented W20 homozygotes. Viability is unknown and no lethal probability is invented.'},
{id:'rnrn',name:'Classic roan homozygote',gene:'Classic Roan',genotype:'Rn/Rn',kind:'unknown',severity:'Unknown',test:s=>n(s,'rn','Rn')===2,text:'Evidence on Rn/Rn viability is incomplete; no probability assigned.'}];
H.flags=s=>H.HEALTH.filter(h=>h.test(s));
H.rng=()=>{if(typeof crypto!=='undefined'&&crypto.getRandomValues){const a=new Uint32Array(1);crypto.getRandomValues(a);return a[0]/4294967296}return Math.random()};
H.rollDie=(sides,rng=H.rng)=>1+Math.floor(rng()*sides);
H.threshold=(p,sides)=>Math.max(1,Math.min(sides-1,Math.round(p*sides)));  // roll <= threshold => event
H.chance=(p,sides)=>H.threshold(p,sides)/sides;
})();
