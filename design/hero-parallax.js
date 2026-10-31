(() => {
  const hero = document.querySelector('#hero');
  const scene = document.querySelector('#bottle-viewer');
  const rig = document.querySelector('#bottle-ritual');
  const cap = rig.querySelector('.dropper-assembly');
  const pipette = rig.querySelector('.pipette-assembly');
  const particleHost = rig.querySelector('.serum-particles');
  const body = rig.querySelector('.bottle-body');
  const dropTiming = {form:1100, fall:1800, interval:3400};
  const tip = () => .680-opening*.43;
  const mouth = () => .278+opening*.06;
  const layers = [...scene.querySelectorAll('[data-depth]')].map(el => ({el, depth:Number(el.dataset.depth), turn:Number(el.dataset.turn || 0)}));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let x=0,y=0,tx=0,ty=0,opening=0,openTarget=0,frame=0,last=0,visible=true,lastDrop=-3400,wasOpen=false,keyboardOpen=false;
  const particles=[];
  function drop(time){
    if(opening<.95 || particles.length>=1 || time-lastDrop<dropTiming.interval || reduced.matches)return;
    lastDrop=time;
    const el=document.createElement('span');el.className='falling-serum';particleHost.append(el);
    particles.push({el,start:time,from:null});
  }
  const paint = time => {
    frame=0;
    const dt=Math.min((time-(last||time-16))/1000,.05);last=time;
    const ease=1-Math.exp(-dt/.18);
    x+=(tx-x)*ease;y+=(ty-y)*ease;opening+=(openTarget-opening)*(1-Math.exp(-dt/.38));
    for(const {el,depth,turn} of layers) el.style.transform=`translate3d(${(x*depth).toFixed(3)}px,${(y*depth*.7).toFixed(3)}px,0) rotate(${(x*turn).toFixed(3)}deg)`;
    const lift=`translate3d(0,${(-opening*43).toFixed(3)}%,0)`;
    cap.style.transform=lift;pipette.style.transform=lift;
    body.style.transform=`translate3d(0,${(opening*6).toFixed(3)}%,0)`;
    scene.dataset.motion=`${x.toFixed(3)},${y.toFixed(3)}`;scene.dataset.open=opening.toFixed(3);
    if(opening>.96&&!wasOpen){drop(time);wasOpen=true;}
    if(opening<.2)wasOpen=false;
    for(let i=particles.length-1;i>=0;i--){
      const p=particles[i],elapsed=time-p.start;
      if(elapsed>=dropTiming.form+dropTiming.fall || opening<.85){p.el.remove();particles.splice(i,1);continue;}
      if(elapsed<dropTiming.form){
        const growth=elapsed/dropTiming.form;
        p.el.style.top=`${tip()*100}%`;
        p.el.style.opacity=String(Math.min(1,growth*4));
        p.el.style.transform=`translateX(-50%) scale(${.25+growth*.75},${.2+growth*.8})`;
        p.el.dataset.phase='forming';
      } else {
        if(p.from===null)p.from=tip();
        const progress=(elapsed-dropTiming.form)/dropTiming.fall;
        const fall=progress*progress;
        p.el.style.top=`${(p.from+(mouth()-p.from)*fall)*100}%`;
        p.el.style.opacity=String(1-Math.max(0,(progress-.9)/.1));
        p.el.style.transform=`translateX(-50%) scale(${1-progress*.15},${1+progress*.2})`;
        p.el.dataset.phase='falling';
      }
    }
    scene.dataset.drops=String(particles.length);
    if(visible&&(Math.abs(tx-x)>.0005||Math.abs(ty-y)>.0005||Math.abs(openTarget-opening)>.0005||particles.length))frame=requestAnimationFrame(paint);
  };
  const wake=()=>{if(visible&&!frame){last=0;frame=requestAnimationFrame(paint);}};
  const move=e=>{
    if(reduced.matches)return;
    const r=hero.getBoundingClientRect();
    tx=Math.max(-1,Math.min(1,((e.clientX-r.left)/r.width-.5)*2));
    ty=Math.max(-1,Math.min(1,((e.clientY-r.top)/r.height-.5)*2));
    if(!e.target.closest('.nav,.mobile-panel,.cta-row'))openTarget=1;
    drop(performance.now());wake();
  };
  const reset=()=>{tx=ty=0;if(!keyboardOpen)openTarget=0;wake();};
  hero.addEventListener('pointermove',move,{passive:true});
  hero.addEventListener('pointerleave',reset);
  hero.addEventListener('pointerup',e=>{if(e.pointerType!=='mouse')reset();});
  hero.addEventListener('pointercancel',reset);
  rig.addEventListener('click',()=>{
    if(reduced.matches)return;
    keyboardOpen=!keyboardOpen;openTarget=keyboardOpen?1:0;
    rig.setAttribute('aria-pressed',String(keyboardOpen));drop(performance.now());wake();
  });
  reduced.addEventListener('change',()=>{
    cancelAnimationFrame(frame);frame=0;x=y=tx=ty=opening=openTarget=0;keyboardOpen=wasOpen=false;
    for(const {el} of layers)el.style.transform='';cap.style.transform=pipette.style.transform=body.style.transform='';
    particles.splice(0).forEach(p=>p.el.remove());rig.setAttribute('aria-pressed','false');
  });
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(!visible){cancelAnimationFrame(frame);frame=0;}else wake();}).observe(hero);
  const menu=document.querySelector('#menu-toggle'),panel=document.querySelector('#mobile-navigation');
  const close=()=>{panel.classList.remove('is-open');menu.setAttribute('aria-expanded','false');};
  menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));panel.classList.toggle('is-open',open);});
  panel.addEventListener('click',close);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){close();keyboardOpen=false;rig.setAttribute('aria-pressed','false');reset();}});
})();
