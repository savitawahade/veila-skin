(() => {
  const button = document.querySelector('.water-button');
  if (!button) return;
  const anchor = button.parentElement;
  const hero = button.closest('.hero');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let x=0,y=0,tx=0,ty=0,scale=1,targetScale=1,frame=0,last=0,vx=0,vy=0,vs=0,stretch=0;
  function paint(time){
    frame=0;
    const dt=Math.min((time-(last||time-16))/1000,.05);last=time;
    // Critically damped motion preserves velocity when the pointer changes direction.
    // The analytical step stays consistent across display refresh rates.
    const omega=9, decay=Math.exp(-omega*dt);
    function glide(value,velocity,target){
      const offset=value-target, impulse=velocity+omega*offset;
      return [target+(offset+impulse*dt)*decay,(velocity-omega*impulse*dt)*decay];
    }
    [x,vx]=glide(x,vx,tx);[y,vy]=glide(y,vy,ty);[scale,vs]=glide(scale,vs,targetScale);
    const desiredStretch=Math.min(Math.hypot(vx,vy)*.0003,.009);
    stretch+=(desiredStretch-stretch)*(1-Math.exp(-dt/.22));
    button.style.transform=`translate3d(${x.toFixed(3)}px,${y.toFixed(3)}px,0) rotate(${(x*.14).toFixed(3)}deg) scale(${(scale+stretch).toFixed(4)},${(scale-stretch).toFixed(4)})`;
    if(Math.abs(tx-x)>.005||Math.abs(ty-y)>.005||Math.hypot(vx,vy)>.02||Math.abs(targetScale-scale)>.0005||Math.abs(vs)>.001||stretch>.0001)frame=requestAnimationFrame(paint);
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
  button.addEventListener('pointerdown',()=>{targetScale=.975;wake();},{passive:true});
  button.addEventListener('pointerup',()=>{targetScale=1;wake();});
  button.addEventListener('pointerleave',()=>{targetScale=1;wake();});
  button.addEventListener('pointercancel',reset);
  button.addEventListener('blur',reset);
  window.addEventListener('blur',reset);
  reduced.addEventListener('change',()=>{cancelAnimationFrame(frame);frame=0;x=y=tx=ty=0;scale=targetScale=1;vx=vy=vs=stretch=0;button.style.transform='';});
})();
