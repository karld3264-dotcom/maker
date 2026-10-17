// Карта PNG. Ключ -> путь. Меняйте пути здесь; код трогать не нужно.
// Все PNG: ГОРИЗОНТАЛЬНЫЕ, одинаковый размер (canvas ниже, 1600x1000), прозрачный фон, один и тот же якорь.
// Нет файла -> показывается плейсхолдер и список "Missing PNG" под превью.
const MANIFEST=(()=>{const A='assets/horse/',f={},add=(k,p)=>f[k]=A+p+'.png';
['bay','black','chestnut'].forEach(x=>add('base.'+x,'base/'+x));
const NM=8,VM=Array.from({length:NM},(_,i)=>i+1);  // mane / tail shape variants (each has its own colour, line and spot files)
['black','silver','bleached','red','copper','darkred','flaxen','paleflaxen'].forEach(x=>VM.forEach(n=>{add('mane.'+x+'_'+n,'mane/'+x+'_'+n);add('tail.'+x+'_'+n,'tail/'+x+'_'+n)}));
['cream_single','cream_double','dun','silver','champagne','pearl','mushroom'].forEach(x=>add('dil.'+x,'dilutions/'+x));
['tobiano','frame_overo','sabino','splashed_white','dominant_white','roan','grey'].forEach(x=>add('pat.'+x,'patterns/'+x));
['full','fewspot','blanket','spotted_blanket','snowflake','varnish_roan'].forEach(x=>add('pat.leopard_'+x,'patterns/leopard_'+x));
['dorsal_stripe','leg_barring','shoulder_barring'].forEach(x=>add('prim.'+x,'primitive/'+x));
const NV=5,V=Array.from({length:NV},(_,i)=>i+1);  // variants per marking type
['star','stripe','snip','star_stripe','blaze','bald'].forEach(x=>V.forEach(n=>add('face.'+x+'_'+n,'markings/face/'+x+'_'+n)));
['front_left','front_right','hind_left','hind_right'].forEach(l=>['coronet','pastern','fetlock','half_stocking','full_stocking'].forEach(t=>V.forEach(n=>add('leg.'+l+'_'+t+'_'+n,'markings/legs/'+l+'_'+t+'_'+n))));
['belly_spots','ticking'].forEach(x=>V.forEach(n=>add('det.'+x+'_'+n,'details/'+x+'_'+n)));
['mottled_skin','striped_hooves','pink_skin','dark_skin'].forEach(x=>add('det.'+x,'details/'+x));
const NE=8,VE=Array.from({length:NE},(_,i)=>i+1);  // eye variants
['brown','blue','hetero_complete','hetero_sectoral'].forEach(x=>VE.forEach(n=>add('eye.'+x+'_'+n,'eyes/'+x+'_'+n)));
add('bg.default','background/background');
const icons={};['breed','coat','base','dil','pat','mane','face','legs','spots','prim','eyes','dcol','dprim','dwhite','dmane','dskin'].forEach(x=>icons[x]='assets/ui/cat_'+x+'.png');
// lines (outline layers) and optional white-spot layers for mane / tail
add('line.body','line/body');VM.forEach(n=>{add('line.mane_'+n,'line/mane_'+n);add('line.tail_'+n,'line/tail_'+n)});
['tobiano','frame_overo','sabino','splashed_white','dominant_white','roan','grey'].forEach(x=>VM.forEach(n=>{add('manespot.'+x+'_'+n,'mane_spots/'+x+'_'+n);add('tailspot.'+x+'_'+n,'tail_spots/'+x+'_'+n)}));
['short','medium','long'].forEach(x=>add('coat.'+x,'coat/'+x));  // coat length overlay (optional art)
// donkey art (own categories)
const D='assets/donkey/',dk=(k,p)=>f['dk.'+k]=D+p+'.png';
['grey_dun','red_dun','brown','dark_brown','black','light_sandy'].forEach(x=>dk('base.'+x,'base/'+x));
['dorsal','shoulder','legs'].forEach(m=>['strong','faint'].forEach(l=>dk(m+'_'+l,'primitive/'+m+'_'+l)));
['small','large','extensive','near_white'].forEach(x=>dk('white_'+x,'white/'+x));
['short','long'].forEach(x=>{dk('mane_'+x,'mane/mane_'+x);dk('tail_'+x,'mane/tail_'+x)});
['dark','pink'].forEach(x=>dk('skin_'+x,'skin/'+x));
const NDE=3;['brown','blue'].forEach(x=>Array.from({length:NDE},(_,i)=>i+1).forEach(n=>dk('eye_'+x+'_'+n,'eyes/'+x+'_'+n)));  // donkey eyes: 3 variants per colour
['short','medium','long'].forEach(x=>dk('coat_'+x,'coat/'+x));
['body','mane','tail'].forEach(x=>dk('line.'+x,'line/'+x));
// ---- recolouring: put ONE neutral grey PNG (base/neutral.png, mane/neutral.png, tail/neutral.png) and the colour is applied in code.
// A dedicated PNG for a key (e.g. base/bay.png) always wins over tinting. Edit the hex colours freely.
const palette={base:{bay:'#7a4326',black:'#26201f',chestnut:'#9a4f26'},
 mane:{black:'#1f1a1b',silver:'#8a8478',bleached:'#9c8566',red:'#8a3d22',copper:'#a5562a',darkred:'#5e2518',flaxen:'#d2b27a',paleflaxen:'#e5d3a9'},
 donkey:{grey_dun:'#8a847c',red_dun:'#92603c',brown:'#5b3b2b',dark_brown:'#3c2b24',black:'#1f1a1b',light_sandy:'#c2a77f'}};
const tint={};
Object.keys(palette.base).forEach(x=>tint['base.'+x]={src:A+'base/neutral.png',color:palette.base[x]});
Object.keys(palette.mane).forEach(x=>VM.forEach(n=>{tint['mane.'+x+'_'+n]={src:A+'mane/neutral_'+n+'.png',color:palette.mane[x]};tint['tail.'+x+'_'+n]={src:A+'tail/neutral_'+n+'.png',color:palette.mane[x]}}));
Object.keys(palette.donkey).forEach(x=>tint['dk.base.'+x]={src:D+'base/neutral.png',color:palette.donkey[x]});
// ---- draw order, BOTTOM -> TOP. A key goes to the first slot whose prefix it starts with.
// New asset of an existing type: only add it to `files`. New TYPE of layer: add a prefix to a slot here. No engine changes.
const slots={tail_color:['tail.','dk.tail_'],tail_spots:['tailspot.'],tail_line:['line.tail','dk.line.tail'],
 base:['base.','dk.base.'],coat:['coat.','dk.coat_'],dilution:['dil.'],pattern:['pat.'],
 marking:['prim.','dk.dorsal_','dk.shoulder_','dk.legs_','dk.white_','face.','leg.','det.','dk.skin_'],
 eyes:['eye.','dk.eye_'],body_line:['line.body','dk.line.body'],
 mane_color:['mane.','dk.mane_'],mane_spots:['manespot.'],mane_line:['line.mane','dk.line.mane']};
// groups are cached separately: changing the mane does not redraw the tail/body
const groups=[{id:'tail',slots:['tail_color','tail_spots','tail_line']},{id:'body',slots:['base','coat','dilution','pattern','marking']},{id:'front',slots:['eyes','body_line']},{id:'mane',slots:['mane_color','mane_spots','mane_line']}];
const optional=['manespot.','tailspot.','line.','dk.line.','coat.','dk.coat_'];  // missing optional layers are not warnings
return{canvas:{w:1600,h:1000},files:f,icons,variants:NV,eyeVariants:NE,maneVariants:NM,donkeyEyeVariants:NDE,palette,tint,slots,groups,optional,dirs:{draft:'assets/draft/',show:'assets/show/',pony:'assets/pony/',mule:'assets/mule/'}}})();
if(typeof module!=='undefined')module.exports=MANIFEST;
