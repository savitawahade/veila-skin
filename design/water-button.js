(() => {
  const button = document.querySelector('.water-button');
  if (!button) return;
  const surface = button.querySelector('.water-surface');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let lastRipple = -Infinity;
  let lastPoint = null;
  const clear = () => { surface.replaceChildren(); lastPoint = null; };
  function ripple(event, strong = false) {
    if (reduced.matches) return;
    const rect = button.getBoundingClientRect();
    const x = event ? Math.max(0, Math.min(rect.width, event.clientX - rect.left)) : rect.width / 2;
    const y = event ? Math.max(0, Math.min(rect.height, event.clientY - rect.top)) : rect.height / 2;
    button.style.setProperty('--water-x', `${x}px`);
    button.style.setProperty('--water-y', `${y}px`);
    const now = performance.now();
    if (!strong && (now - lastRipple < 240 || (lastPoint && Math.hypot(x-lastPoint.x, y-lastPoint.y)<12))) return;
    lastRipple = now; lastPoint = {x,y};
    while (surface.childElementCount >= 4) surface.firstElementChild.remove();
    const ring = document.createElement('span');
    ring.className = strong ? 'water-ripple is-pressed' : 'water-ripple';
    ring.style.setProperty('--ripple-size', `${Math.max(rect.width, rect.height)*2}px`);
    ring.style.left = `${x}px`; ring.style.top = `${y}px`;
    ring.addEventListener('animationend', () => ring.remove(), {once:true});
    surface.append(ring);
  }
  button.addEventListener('pointerenter', e => {lastPoint=null;ripple(e);});
  button.addEventListener('pointermove', e => {if(e.pointerType==='mouse'||e.pointerType==='pen')ripple(e);}, {passive:true});
  button.addEventListener('pointerdown', e => ripple(e,true), {passive:true});
  button.addEventListener('pointerleave', () => {lastPoint=null;});
  button.addEventListener('focus', () => {if(button.matches(':focus-visible'))ripple(null,true);});
  button.addEventListener('click', e => {if(e.detail===0)ripple(null,true);});
  reduced.addEventListener('change', clear);
})();
