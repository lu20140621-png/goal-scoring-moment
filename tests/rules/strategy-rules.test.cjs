// State-level regression checks for the standalone tutorial and the active wrapper.
// Run: node --test tests/rules/strategy-rules.test.cjs
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'../..');
function harness(wrapped){
 const elements=new Map();
 const node=()=>({innerHTML:'',textContent:'',children:[],style:{},dataset:{},classList:{add(){},remove(){},toggle(){}},appendChild(n){this.children.push(n);return n},append(...n){this.children.push(...n)},remove(){},before(){},addEventListener(name,fn){this[name]=fn},querySelector(){return null},querySelectorAll(){return []},getBoundingClientRect(){return {left:0,top:0,width:100,height:100}}});
 const get=id=>{if(!elements.has(id))elements.set(id,node());return elements.get(id)};
 const context=vm.createContext({console,window:{matchMedia:()=>({matches:false})},HTMLImageElement:class{},document:{addEventListener(){},getElementById:get,querySelector(){return null},querySelectorAll(){return []},createElement:node,head:node(),body:node()},setTimeout(fn,ms){return setTimeout(fn,Math.min(ms,5))},clearTimeout,requestAnimationFrame(fn){fn()}});
 const run=s=>vm.runInContext(s,context);
 const source=[...fs.readFileSync(path.join(root,'strategy-13.html'),'utf8').matchAll(/<script>([\s\S]*?)<\/script>/g)].find(m=>m[1].includes('window.GSM_TUTORIAL_V13'))[1];
 // Omit initial DOM boot; exercise the real lesson and gameplay handlers below.
 run(source.slice(0,source.lastIndexOf("playerEls().forEach(el=>el.addEventListener")));
 run("renderPlayers=()=>{};renderProgress=()=>{};renderCoach=()=>{};buildCourses=()=>{};renderHand=()=>{};setSelectable=()=>{};setTarget=()=>{};setDefender=()=>{};clearFlow=()=>{};hideFeedback=()=>{};setPitchEvent=()=>{};feedback=()=>{};addCard=(card,owner,label)=>events.push({card,owner,label});addResult=(text,kind)=>events.push({text,kind});nextButton=(text)=>{events.push({complete:text});};");
 context.events=[];
 run(fs.readFileSync(path.join(root,'strategy-13-gameplay-v2.js'),'utf8'));
 if(wrapped){for(const f of ['strategy-13-safety.js','strategy-13-runtime-fix.js','strategy-13-card-consume-fix.js'])run(fs.readFileSync(path.join(root,f),'utf8'))}
 return {run,get,events:context.events,async lesson(n){run(`current=${n-1};setupLesson()`);await settle()},async play(name){const value=JSON.stringify(name);run(`handleCard(${value},handCards.indexOf(${value}))`);await settle()}};
}
const settle=()=>new Promise(r=>setTimeout(r,20));
for(const wrapped of [false,true]){
 const label=wrapped?'wrapper':'standalone';
 test(`${label}: TACKLE cannot defend, DEFENSE wins possession`,async()=>{
  const h=harness(wrapped);await h.lesson(8);await h.play('TACKLE');assert.equal(h.run('ballOwner'),'A0');assert.equal(h.run("handCards.includes('TACKLE')"),true);
  await h.play('DEFENSE');assert.equal(h.run('ballOwner'),'H0');assert.equal(h.run("handCards.includes('DEFENSE')"),false);
 });
 test(`${label}: goals, DRIBBLE, PASS and TACKLE move the ball correctly`,async()=>{
  const h=harness(wrapped);await h.lesson(6);await h.play('SHOOT');h.run("handlePlayer('A1')");await settle();assert.equal(h.run('ballOwner'),'A1');assert.equal(h.run('tokens.A1'),1);
  await h.lesson(10);await h.play('DRIBBLE PAST');assert.equal(h.run('ballOwner'),'A0');assert.equal(h.run('tokens.A0'),1);
  await h.lesson(5);h.run("handlePlayer('H1')");assert.equal(h.run('ballOwner'),'H1');assert.equal(h.run('handCards.length'),0);
  await h.lesson(9);await h.play('TACKLE');assert.equal(h.run('ballOwner'),'H0');
 });
 test(`${label}: eliminated PLAYER hands possession to a living teammate without starting a turn`,async()=>{
  const h=harness(wrapped);await h.lesson(7);await h.play('SHOOT');h.run("handlePlayer('A0')");await settle();
  assert.equal(h.run('tokens.A0'),3);assert.equal(h.run('eliminated.A0'),true);
  assert.equal(h.run('revealed.A0'),'PLAYER');assert.equal(h.run('ballOwner'),'A1');
  assert.equal(h.run('!!eliminated[ballOwner]'),false);assert.equal(h.run('current'),6);
  assert(h.events.some(e=>e.text==='SOCCER + REMAINING HAND → GREEN 2'));
 });
 test(`${label}: second DEFENSE discards only when a card remains`,async()=>{
  for(const extra of [false,true]){
   const h=harness(wrapped);await h.lesson(11);
   if(wrapped)await h.play('DEFENSE');
   h.run(`handCards=${extra?"['DEFENSE','SHOOT']":"['DEFENSE']"}`);
   await h.play('DEFENSE');assert.equal(h.run('ballOwner'),'H0');
   if(extra){assert.equal(h.run('handCards.length'),1);await h.play('SHOOT');}
   assert.equal(h.run('handCards.length'),0);assert(h.events.some(e=>e.complete));
  }
 });
 test(`${label}: final uses the original attacker, accepts any discard and requires END TURN + draw`,async()=>{
  const h=harness(wrapped);await h.lesson(13);h.run('startFinalChallenge()');
  await h.play('TACKLE');assert.equal(h.run('stage'),0);
  await h.play('DEFENSE');assert(h.events.some(e=>e.card==='DRIBBLE PAST'&&e.owner==='GREEN 2'));
  await h.play('TACKLE');assert.equal(h.run('stage'),1);
  await h.play('DEFENSE');assert.equal(h.run('ballOwner'),'H0');
  await h.play('SHOOT');assert.equal(h.run('stage'),2.5);
  h.get('contextActions').children.at(-1).click();assert.equal(h.run('stage'),2.6);
  h.get('contextActions').children.at(-1).click();assert.equal(h.run('stage'),3);assert.equal(h.run("handCards.includes('SHOOT')"),true);
  await h.play('SHOOT');h.run("handlePlayer('A1')");await settle();assert.equal(h.run('stage'),5);assert.equal(h.run('revealed.A1'),'GOALKEEPER');
 });
}

