(() => {
  const button = document.querySelector('.water-button');
  if (!button) return;
  const anchor = button.parentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  let x=0,y=0,tx=0,ty=0,scale=1,targetScale=1,frame=0,last=0,vx=0,vy=0,vs=0;

  function paint(time) {
    frame=0;
    const dt=Math.min((time-(last||time-16))/1000,.05);
    last=time;
    const omega=9,decay=Math.exp(-omega*dt);
    function glide(value,velocity,target) {
      const offset=value-target,impulse=velocity+omega*offset;
      return [target+(offset+impulse*dt)*decay,(velocity-omega*impulse*dt)*decay];
    }
    [x,vx]=glide(x,vx,tx);
    [y,vy]=glide(y,vy,ty);
    [scale,vs]=glide(scale,vs,targetScale);
    // Keep the target in place: only the edge softens with local pointer motion.
    // No translation or rotation makes the call to action chase the cursor.
    button.style.transform=`scale(${scale.toFixed(4)})`;
    button.style.borderRadius=`${64+7*x}% ${20-8*x+4*y}% ${62-7*y}% ${45+6*y}% / ${65-7*y}% ${18+5*x-4*y}% ${73-8*x}% ${42+6*x}%`;
    if(Math.abs(tx-x)>.002||Math.abs(ty-y)>.002||Math.hypot(vx,vy)>.01||Math.abs(targetScale-scale)>.0005||Math.abs(vs)>.001) {
      frame=requestAnimationFrame(paint);
    }
  }
  function wake() {
    if(!reduced.matches&&!document.hidden&&!frame) {
      last=0;
      frame=requestAnimationFrame(paint);
    }
  }
  function follow(event) {
    if(reduced.matches||event.pointerType==='touch'||!finePointer.matches)return;
    const rect=anchor.getBoundingClientRect();
    tx=Math.max(-1,Math.min(1,(event.clientX-rect.left)/rect.width*2-1));
    ty=Math.max(-1,Math.min(1,(event.clientY-rect.top)/rect.height*2-1));
    wake();
  }
  function reset(immediate=false) {
    tx=ty=0;targetScale=1;
    if(immediate) {
      cancelAnimationFrame(frame);frame=0;x=y=vx=vy=vs=0;scale=1;
      button.style.transform='';button.style.borderRadius='';
    } else wake();
  }
  anchor.addEventListener('pointermove',follow,{passive:true});
  anchor.addEventListener('pointerleave',()=>reset());
  button.addEventListener('pointerdown',()=>{targetScale=.985;wake();},{passive:true});
  button.addEventListener('pointerup',()=>{targetScale=1;wake();});
  button.addEventListener('pointercancel',()=>reset());
  button.addEventListener('keydown',event=>{
    if(event.key===' '||event.key==='Enter'){targetScale=.985;wake();}
  });
  button.addEventListener('keyup',()=>{targetScale=1;wake();});
  button.addEventListener('blur',()=>reset());
  window.addEventListener('blur',()=>reset(true));
  document.addEventListener('visibilitychange',()=>{if(document.hidden)reset(true);});
  reduced.addEventListener('change',()=>reset(true));
  finePointer.addEventListener('change',()=>reset(true));
})();
