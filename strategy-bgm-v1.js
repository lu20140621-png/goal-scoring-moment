/* Lightweight original background music for Strategy Tutorial.
   No external audio file is required. Starts after the first user gesture because browsers block autoplay audio. */
(()=>{
  'use strict';
  if(window.__gsmStrategyBgmV1Installed)return;
  window.__gsmStrategyBgmV1Installed=true;

  const STORAGE_KEY='gsmStrategyMusicMuted';
  const BPM=94;
  const BEAT=60/BPM;
  const AudioCtx=window.AudioContext||window.webkitAudioContext;
  if(!AudioCtx)return;

  let ctx=null,master=null,filter=null,started=false,scheduler=null,nextBeat=0,beatIndex=0;
  let muted=localStorage.getItem(STORAGE_KEY)==='1';

  function midi(n){return 440*Math.pow(2,(n-69)/12)}
  const progression=[
    [48,52,55,59], // Cmaj7
    [45,48,52,55], // Am7
    [41,45,48,52], // Fmaj7
    [43,47,50,53]  // G7
  ];

  function ensureAudio(){
    if(ctx)return;
    ctx=new AudioCtx();
    master=ctx.createGain();
    master.gain.value=0.0001;
    filter=ctx.createBiquadFilter();
    filter.type='lowpass';
    filter.frequency.value=2400;
    filter.Q.value=.35;
    filter.connect(master);
    master.connect(ctx.destination);
    nextBeat=ctx.currentTime+.08;
  }

  function tone(freq,time,duration,gain,type='triangle',detune=0){
    const osc=ctx.createOscillator();
    const g=ctx.createGain();
    osc.type=type; osc.frequency.value=freq; osc.detune.value=detune;
    g.gain.setValueAtTime(.0001,time);
    g.gain.exponentialRampToValueAtTime(Math.max(.0002,gain),time+.025);
    g.gain.exponentialRampToValueAtTime(.0001,time+duration);
    osc.connect(g); g.connect(filter);
    osc.start(time); osc.stop(time+duration+.03);
  }

  function kick(time){
    const osc=ctx.createOscillator(); const g=ctx.createGain();
    osc.type='sine'; osc.frequency.setValueAtTime(105,time); osc.frequency.exponentialRampToValueAtTime(48,time+.12);
    g.gain.setValueAtTime(.12,time); g.gain.exponentialRampToValueAtTime(.0001,time+.18);
    osc.connect(g); g.connect(master); osc.start(time); osc.stop(time+.2);
  }

  function hat(time){
    const len=Math.floor(ctx.sampleRate*.055),buf=ctx.createBuffer(1,len,ctx.sampleRate),d=buf.getChannelData(0);
    for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*(1-i/len);
    const src=ctx.createBufferSource(); const hp=ctx.createBiquadFilter(); const g=ctx.createGain();
    src.buffer=buf; hp.type='highpass'; hp.frequency.value=5200; g.gain.value=.018;
    src.connect(hp); hp.connect(g); g.connect(master); src.start(time);
  }

  function pad(chord,time){
    chord.forEach((note,i)=>{
      tone(midi(note),time,BEAT*3.75,.018,i%2?'triangle':'sine',-5);
      tone(midi(note),time,BEAT*3.75,.012,'sine',5);
    });
  }

  function scheduleBeat(i,time){
    const bar=Math.floor(i/4)%4,step=i%4,chord=progression[bar];
    if(step===0)pad(chord,time);
    if(step===0||step===2)kick(time);
    hat(time+BEAT*.5);
    const arp=[0,2,1,3][step];
    tone(midi(chord[arp]+12),time+.03,BEAT*.42,.033,'triangle');
    if(step===0||step===2)tone(midi(chord[0]-12),time,BEAT*.7,.025,'sine');
  }

  function pump(){
    if(!ctx||ctx.state==='closed')return;
    while(nextBeat<ctx.currentTime+1.1){
      scheduleBeat(beatIndex,nextBeat);
      nextBeat+=BEAT;
      beatIndex=(beatIndex+1)%16;
    }
  }

  async function start(){
    ensureAudio();
    if(ctx.state==='suspended')await ctx.resume();
    if(!scheduler){pump();scheduler=setInterval(pump,250)}
    started=true;
    const now=ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(Math.max(master.gain.value,.0001),now);
    master.gain.exponentialRampToValueAtTime(muted?.0001:.10,now+.45);
    updateButton();
  }

  function setMuted(value){
    muted=!!value;
    localStorage.setItem(STORAGE_KEY,muted?'1':'0');
    if(!ctx){ if(!muted)start(); updateButton(); return; }
    const now=ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(Math.max(master.gain.value,.0001),now);
    master.gain.exponentialRampToValueAtTime(muted?.0001:.10,now+.22);
    updateButton();
  }

  function updateButton(){
    const b=document.getElementById('strategyMusicToggle');
    if(!b)return;
    b.textContent=muted?'🔇 MUSIC':'🎵 MUSIC';
    b.setAttribute('aria-pressed',muted?'false':'true');
    b.title=muted?'Turn background music on':'Turn background music off';
  }

  function installButton(){
    if(document.getElementById('strategyMusicToggle'))return;
    const host=document.querySelector('.topBtns')||document.body;
    const b=document.createElement('button');
    b.id='strategyMusicToggle';
    b.type='button';
    b.className=host===document.body?'strategyMusicFloat':'topBtn';
    b.addEventListener('click',async e=>{
      e.preventDefault();e.stopPropagation();
      if(!started&&!muted)await start();
      else if(!started&&muted){muted=false;await start();localStorage.setItem(STORAGE_KEY,'0')}
      else setMuted(!muted);
    });
    if(host===document.body){
      const s=document.createElement('style');
      s.textContent='.strategyMusicFloat{position:fixed;right:12px;bottom:12px;z-index:9999;border:2px solid #fff;border-radius:999px;padding:10px 14px;background:#0b3458;color:#fff;font:900 11px/1 Arial;box-shadow:0 6px 18px #0008;cursor:pointer}';
      document.head.appendChild(s);
    }
    host.appendChild(b);updateButton();
  }

  async function firstGesture(){
    document.removeEventListener('pointerdown',firstGesture,true);
    document.removeEventListener('keydown',firstGesture,true);
    if(!muted)try{await start()}catch(_){}
  }

  document.addEventListener('pointerdown',firstGesture,true);
  document.addEventListener('keydown',firstGesture,true);
  document.addEventListener('visibilitychange',()=>{
    if(!ctx)return;
    if(document.hidden)ctx.suspend().catch(()=>{});
    else if(started&&!muted)ctx.resume().catch(()=>{});
  });

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installButton,{once:true});
  else installButton();
})();