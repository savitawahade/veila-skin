(() => {
  const button = document.querySelector('.water-button');
  if (!button) return;
  const anchor = button.parentElement;
  const hero = button.closest('.hero');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let x=0,y=0,tx=0,ty=0,scale=1,targetScale=1,frame=0,last=0;
  function paint(time){
    frame=0;
    const dt=Math.min((time-(last||time-16))/1000,.05);last=time;
    const ease=1-Math.exp(-dt/.18);
    x+=(tx-x)*ease;y+=(ty-y)*ease;scale+=(targetScale-scale)*ease;
    const stretch=Math.min(Math.hypot(tx-x,ty-y)*.0015,.025);
    button.style.transform=`translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) rotate(${(x*.26).toFixed(2)}deg) scale(${(scale+stretch).toFixed(3)},${(scale-stretch).toFixed(3)})`;
    if(Math.abs(tx-x)>.01||Math.abs(ty-y)>.01||Math.abs(targetScale-scale)>.001)frame=requestAnimationFrame(paint);
  }
  function wake(){if(!reduced.matches&&!frame){last=0;frame=requestAnimationFrame(paint);}}
  function follow(event){
    if(reduced.matches||event.pointerType==='touch')return;
    // Measure the stationary wrapper so movement never feeds back into the pointer target.
    const r=anchor.getBoundingClientRect();
    const dx=event.clientX-r.left-r.width/2,dy=event.clientY-r.top-r.height/2;
    tx=Math.tanh(dx/170)*11;ty=Math.tanh(dy/170)*8;
    wake();
  }
  function reset(){tx=ty=0;targetScale=1;wake();}
  hero.addEventListener('pointermove',follow,{passive:true});
  hero.addEventListener('pointerleave',reset);
  button.addEventListener('pointerdown',()=>{targetScale=.95;wake();},{passive:true});
  button.addEventListener('pointerup',()=>{targetScale=1;wake();});
  button.addEventListener('pointerleave',()=>{targetScale=1;wake();});
  button.addEventListener('pointercancel',reset);
  button.addEventListener('blur',reset);
  window.addEventListener('blur',reset);
  reduced.addEventListener('change',()=>{cancelAnimationFrame(frame);frame=0;x=y=tx=ty=0;scale=targetScale=1;button.style.transform='';});
})();
