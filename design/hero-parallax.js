(() => {
  const hero = document.querySelector('#hero');
  const scene = document.querySelector('#bottle-viewer');
  const layers = [...scene.querySelectorAll('[data-depth]')].map(el => ({el, depth:Number(el.dataset.depth), turn:Number(el.dataset.turn || 0)}));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let x=0,y=0,tx=0,ty=0,frame=0,last=0,visible=true;
  const paint = time => {
    frame=0;
    const dt=Math.min((time-(last||time-16))/1000,.05);last=time;
    const ease=1-Math.exp(-dt/.18);
    x+=(tx-x)*ease;y+=(ty-y)*ease;
    for(const {el,depth,turn} of layers) el.style.transform=`translate3d(${(x*depth).toFixed(3)}px,${(y*depth*.7).toFixed(3)}px,0) rotate(${(x*turn).toFixed(3)}deg)`;
    scene.dataset.motion=`${x.toFixed(3)},${y.toFixed(3)}`;
    if(visible&&(Math.abs(tx-x)>.0005||Math.abs(ty-y)>.0005))frame=requestAnimationFrame(paint);
  };
  const wake=()=>{if(visible&&!frame){last=0;frame=requestAnimationFrame(paint);}};
  const move=e=>{
    if(reduced.matches)return;
    const r=hero.getBoundingClientRect();
    tx=Math.max(-1,Math.min(1,((e.clientX-r.left)/r.width-.5)*2));
    ty=Math.max(-1,Math.min(1,((e.clientY-r.top)/r.height-.5)*2));wake();
  };
  const reset=()=>{tx=ty=0;wake();};
  hero.addEventListener('pointermove',move,{passive:true});
  hero.addEventListener('pointerleave',reset);
  hero.addEventListener('pointerup',e=>{if(e.pointerType!=='mouse')reset();});
  hero.addEventListener('pointercancel',reset);
  reduced.addEventListener('change',()=>{cancelAnimationFrame(frame);frame=0;x=y=tx=ty=0;for(const {el} of layers)el.style.transform='';});
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(!visible){cancelAnimationFrame(frame);frame=0;}else wake();}).observe(hero);
  const menu=document.querySelector('#menu-toggle'),panel=document.querySelector('#mobile-navigation');
  const close=()=>{panel.classList.remove('is-open');menu.setAttribute('aria-expanded','false');};
  menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));panel.classList.toggle('is-open',open);});
  panel.addEventListener('click',close);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
})();
