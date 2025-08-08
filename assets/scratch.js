(function(){
  const section = document.getElementById('scratch-section');
  if(!section) return;

  // Counter logic (bottles left)
  const numEl = document.getElementById('bottles-left');
  const startMin = +section.dataset.startMin || 30;
  const startMax = +section.dataset.startMax || 60;
  const decMin = +section.dataset.decrementMin || 1;
  const decMax = +section.dataset.decrementMax || 3;
  const intMin = +section.dataset.intervalMin || 8; // seconds
  const intMax = +section.dataset.intervalMax || 18; // seconds
  const floor = +section.dataset.floor || 3;
  const storeKey = section.dataset.storeKey || 'scratch_bottles_v1';

  function rand(min, max){ return Math.floor(Math.random()*(max-min+1))+min; }

  let current = Number(localStorage.getItem(storeKey));
  if(!current || Number.isNaN(current)){
    current = rand(startMin, startMax);
    localStorage.setItem(storeKey, String(current));
  }
  function updateCounter(){ if(numEl) numEl.textContent = String(current); }
  updateCounter();

  function tick(){
    if(current > floor){
      current = Math.max(floor, current - rand(decMin, decMax));
      localStorage.setItem(storeKey, String(current));
      updateCounter();
    }
    setTimeout(tick, rand(intMin, intMax)*1000);
  }
  setTimeout(tick, rand(2,5)*1000);

  // Scratch card
  const canvas = document.getElementById('scratch-canvas');
  const label = document.getElementById('scratch-label');
  const prize = document.getElementById('scratch-prize');
  const cta = document.getElementById('scratch-cta');
  const ctx = canvas.getContext('2d');
  let isDown = false;
  let revealed = false;

  function resize(){
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width; canvas.height = rect.height;
    drawCover();
  }

  function drawCover(){
    const w = canvas.width, h = canvas.height;
    const grad = ctx.createLinearGradient(0,0,w,h);
    grad.addColorStop(0,'#e6c679');
    grad.addColorStop(1,'#b89549');
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = grad; ctx.fillRect(0,0,w,h);
    // subtle noise lines
    ctx.strokeStyle = 'rgba(255,255,255,.12)';
    for(let i=0;i<8;i++){ ctx.beginPath(); ctx.moveTo(0,i*h/8); ctx.lineTo(w,i*h/8); ctx.stroke(); }
  }

  function scratch(x,y){
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x,y,24,0,Math.PI*2);
    ctx.fill();
  }

  function getPos(e){
    const r = canvas.getBoundingClientRect();
    const t = e.touches? e.touches[0]: e;
    return { x: t.clientX - r.left, y: t.clientY - r.top };
  }

  function percentRevealed(){
    const img = ctx.getImageData(0,0,canvas.width,canvas.height);
    let cleared = 0; for(let i=3;i<img.data.length;i+=4){ if(img.data[i]===0) cleared++; }
    return cleared / (canvas.width*canvas.height) * 100;
  }

  function finish(){
    if(revealed) return; revealed = true;
    canvas.style.pointerEvents = 'none';
    label.hidden = true;
    prize.hidden = false;
    if(cta){ cta.hidden = false; }
    // simple confetti
    try { launchConfetti(); } catch(_e) {}
  }

  canvas.addEventListener('mousedown', e=>{ isDown=true; scratch(...Object.values(getPos(e))); });
  canvas.addEventListener('mousemove', e=>{ if(isDown){ scratch(...Object.values(getPos(e))); if(percentRevealed()>55) finish(); }});
  window.addEventListener('mouseup', ()=> isDown=false);
  canvas.addEventListener('touchstart', e=>{ isDown=true; scratch(...Object.values(getPos(e))); e.preventDefault(); }, {passive:false});
  canvas.addEventListener('touchmove', e=>{ if(isDown){ scratch(...Object.values(getPos(e))); if(percentRevealed()>55) finish(); } e.preventDefault(); }, {passive:false});
  window.addEventListener('touchend', ()=> isDown=false);

  window.addEventListener('resize', resize); resize();

  // CTA click
  if(cta){
    cta.addEventListener('click', ()=>{
      const cfgLink = section.getAttribute('data-cta-link') || '/collections/all';
      const openNew = section.getAttribute('data-cta-new-tab') === 'true';
      if(openNew){ window.open(cfgLink, '_blank'); } else { window.location.href = cfgLink; }
    });
  }

  // lightweight confetti
  function launchConfetti(){
    const duration = 1500; const end = Date.now()+duration; const colors=['#ff4757','#ffa502','#2ed573','#1e90ff','#5352ed'];
    (function frame(){
      for(let i=0;i<14;i++) confettiPiece();
      if(Date.now()<end) requestAnimationFrame(frame);
    })();
    function confettiPiece(){
      const div = document.createElement('div');
      div.style.position='fixed'; div.style.top='-10px'; div.style.left=Math.random()*100+'%';
      div.style.width='6px'; div.style.height='10px'; div.style.background=colors[Math.floor(Math.random()*colors.length)];
      div.style.opacity='0.9'; div.style.transform='rotate('+ (Math.random()*360)+'deg)'; div.style.zIndex='9999';
      document.body.appendChild(div);
      const fall = 1200 + Math.random()*800; const drift = (Math.random()*2-1)*120;
      div.animate([{transform:div.style.transform, top:'-10px'},{transform:'rotate(720deg)', top:'110vh', left:`calc(${div.style.left} + ${drift}px)`}],{duration:fall, easing:'cubic-bezier(.2,.7,.2,1)'}).onfinish=()=>div.remove();
    }
  }
})(); 