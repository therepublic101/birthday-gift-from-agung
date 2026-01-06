// Basic interactivity and mic-based blow detection
const readyBtn = document.getElementById('readyBtn');
const welcome = document.getElementById('welcome');
const scene = document.getElementById('scene');
const flame = document.getElementById('flame');
const confettiCanvas = document.getElementById('confetti');
const envelope = document.getElementById('envelope');
const letter = document.getElementById('letter');
const closeLetter = document.getElementById('closeLetter');
const wishTextPath = document.getElementById('wishTextPath');
const balloons = document.querySelectorAll('.balloon');
const sprinkles = document.querySelectorAll('.sprinkle');

// set the recipient name here (edit as desired)
const birthdayName = 'Syahda Yuniar';

// control flow: do not allow blowing until envelope is opened and letter read
let allowBlow = false;

let audioCtx, analyser, dataArray, source, listening=false;

readyBtn.addEventListener('click', async ()=>{
  try{
    const stream = await navigator.mediaDevices.getUserMedia({audio:true});
    startAudio(stream);
    // Request fullscreen on user gesture (Ready click). Browsers require gesture.
    try{
      const docEl = document.documentElement;
      if(docEl.requestFullscreen) await docEl.requestFullscreen();
      else if(docEl.webkitRequestFullscreen) await docEl.webkitRequestFullscreen();
      else if(docEl.mozRequestFullScreen) await docEl.mozRequestFullScreen();
      else if(docEl.msRequestFullscreen) await docEl.msRequestFullscreen();
    }catch(fsErr){
      // if fullscreen fails, ignore — user can press F11 manually
      console.warn('Fullscreen request failed or was blocked', fsErr);
    }
    welcome.classList.add('hidden');
    scene.classList.remove('hidden');
    // show envelope centered before blow
    envelope.classList.remove('hidden');
    setTimeout(()=> envelope.classList.add('centered'), 60);
  }catch(e){
    alert('Izin mic ditolak atau tidak tersedia. Tetap lanjut?');
    welcome.classList.add('hidden');
    scene.classList.remove('hidden');
    envelope.classList.remove('hidden');
    setTimeout(()=> envelope.classList.add('centered'), 60);
  }
});

function startAudio(stream){
  audioCtx = new (window.AudioContext||window.webkitAudioContext)();
  source = audioCtx.createMediaStreamSource(stream);
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 2048;
  const bufferLength = analyser.fftSize;
  dataArray = new Uint8Array(bufferLength);
  source.connect(analyser);
  listening = true;
  monitorAudio();
}

let blowDetected=false;
// background music to play after blow. Place your mp3 file in the project root and set name here:
const bgMusicSrc = 'song.mp3';
const bgMusic = new Audio(bgMusicSrc);
bgMusic.preload = 'auto';
bgMusic.volume = 0.9;
function monitorAudio(){
  if(!listening) return;
  analyser.getByteTimeDomainData(dataArray);
  let sum=0;
  for(let i=0;i<dataArray.length;i++){ let v=(dataArray[i]-128)/128; sum+=v*v }
  let rms=Math.sqrt(sum/dataArray.length);
  // simple heuristic: blow produces a louder RMS spike
  if(rms>0.12 && !blowDetected && allowBlow){
    blowDetected=true;
    extinguish();
  }
  requestAnimationFrame(monitorAudio);
}

function extinguish(){
  flame.classList.add('out');
  // play a synthesized blow sound
  playBlowSound();
  // then play background mp3 (if available)
  playBgMusic();
  showSparkles();
  runConfetti();
  // reveal envelope then move it to center in front of cake
  setTimeout(()=>{
    
  },1200);
  // swap the wish text with animation
  if(wishTextPath){
    // make a quick celebration pulse and then change text
    wishTextPath.classList.add('wish-pulse');
    setTimeout(()=>{
      wishTextPath.textContent = `Happy Birthday, ${birthdayName}!`;
      // add class to arc-text to show celebration glow
      const arc = wishTextPath.parentElement;
      arc.classList.add('celebrate');
      wishTextPath.classList.remove('wish-pulse');
    }, 900);
  }
  // animate balloons and sprinkles
  balloons.forEach(b => { b.style.transition = 'all 800ms ease'; b.style.transform = 'scale(1.15) translateY(-40px)'; });
  sprinkles.forEach((s,i)=>{ s.style.transition='all 900ms cubic-bezier(.2,.9,.2,1)'; s.style.transform = `translateY(${8 + i%3 * 6}px) rotate(${(i%2?10:-8)}deg)` });
}

// Synthesize a short 'blow' sound (pop + whoosh) using Web Audio
function playBlowSound(){
  try{
    if(!audioCtx) audioCtx = new (window.AudioContext||window.webkitAudioContext)();
    const now = audioCtx.currentTime;

    // short sine pop
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.18);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.38, now + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
    osc.connect(g); g.connect(audioCtx.destination);
    osc.start(now); osc.stop(now + 0.4);

    // noise whoosh
    const dur = 0.45;
    const bufferSize = Math.floor(audioCtx.sampleRate * dur);
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for(let i=0;i<bufferSize;i++) data[i] = (Math.random()*2-1) * (1 - i/bufferSize);
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.Q.setValueAtTime(0.8, now);
    const ng = audioCtx.createGain();
    ng.gain.setValueAtTime(0.0001, now);
    ng.gain.linearRampToValueAtTime(0.22, now + 0.02);
    ng.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    noise.connect(filter); filter.connect(ng); ng.connect(audioCtx.destination);
    noise.start(now); noise.stop(now + dur + 0.02);
  }catch(e){
    // ignore audio errors
    console.warn('Audio error', e);
  }
}

function playBgMusic(){
  try{
    // Some browsers require AudioContext to be resumed after user gesture
    if(audioCtx && audioCtx.state === 'suspended') audioCtx.resume().catch(()=>{});
    // attempt to play the mp3 file
    bgMusic.currentTime = 0;
    bgMusic.play().catch(err=>{
      console.warn('bgMusic play failed', err);
    });
  }catch(e){
    console.warn('playBgMusic error', e);
  }
}

// sparkles: small DOM elements
function showSparkles(){
  const container = document.getElementById('sparkles');
  container.classList.remove('hidden');
  for(let i=0;i<18;i++){
    const s = document.createElement('div'); s.className='spark';
    s.style.left = (50 + (Math.random()-0.5)*60) + '%';
    s.style.animationDelay = (Math.random()*400) + 'ms';
    container.appendChild(s);
  }
  setTimeout(()=>container.classList.add('hidden'),2000);
}

// Simple confetti engine
function runConfetti(){
  const canvas = confettiCanvas;
  canvas.width = innerWidth; canvas.height = innerHeight;
  const ctx = canvas.getContext('2d');
  const particles = [];
  const colors = ['#ff595e','#ffca3a','#8ac926','#1982c4','#6a4c93'];
  for(let i=0;i<120;i++) particles.push(createParticle());

  function createParticle(){
    return {x: Math.random()*canvas.width, y: -10 - Math.random()*canvas.height/2, vx:(Math.random()-0.5)*4, vy:2+Math.random()*6, col:colors[Math.floor(Math.random()*colors.length)], r:2+Math.random()*6, rot:Math.random()*360, vr: (Math.random()-0.5)*10}
  }
  let running=true; let ticks=0;
  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for(let p of particles){
      p.x+=p.vx; p.y+=p.vy; p.vy+=0.05; p.rot+=p.vr*0.1;
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot* Math.PI/180);
      ctx.fillStyle = p.col; ctx.fillRect(-p.r, -p.r, p.r*2, p.r*1.2);
      ctx.restore();
      if(p.y>canvas.height+20){ Object.assign(p, createParticle(), {y:-10}) }
    }
    ticks++; if(ticks<220 && running) requestAnimationFrame(draw); else ctx.clearRect(0,0,canvas.width,canvas.height);
  }
  draw();
}

// Envelope open -> show letter
envelope.addEventListener('click', ()=>{
  // play opening animation then show letter; keep envelope visible during animation
  envelope.classList.add('opening');
  setTimeout(()=>{
    envelope.classList.add('hidden');
    // reveal letter modal and animate entrance
    letter.classList.remove('hidden');
    setTimeout(()=> letter.classList.add('show'), 20);
  }, 600);
});
closeLetter.addEventListener('click', ()=>{
  // animate hide
  letter.classList.remove('show');
  // after transition, hide completely and enable blow
  setTimeout(()=>{
    letter.classList.add('hidden');
    // fully hide envelope if still visible
    envelope.classList.add('hidden');
    envelope.classList.remove('opening');
    envelope.classList.remove('centered');
    // now allow blowing the candle
    allowBlow = true;
  }, 360);
});

// Resize confetti canvas on window resize
window.addEventListener('resize', ()=>{ confettiCanvas.width = innerWidth; confettiCanvas.height = innerHeight; });
