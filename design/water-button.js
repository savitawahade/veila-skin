(() => {
  const button = document.querySelector('.water-button');
  if (!button) return;
  const drop = button.querySelector('.button-water-drop');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let x=0,y=0,tx=0,ty=0,scale=1,targetScale=1,frame=0,last=0;
  function paint(time){
    frame=0;
    const dt=Math.min((time-(last||time-16))/1000,.05);last=time;
    const ease=1-Math.exp(-dt/.14);
    x+=(tx-x)*ease;y+=(ty-y)*ease;scale+=(targetScale-scale)*ease;
    drop.style.transform=`translate(${x.toFixed(2)}px,calc(-50% + ${y.toFixed(2)}px)) rotate(${(x*.18).toFixed(2)}deg) scale(${scale.toFixed(3)})`;
    if(Math.abs(tx-x)>.01||Math.abs(ty-y)>.01||Math.abs(targetScale-scale)>.001)frame=requestAnimationFrame(paint);
  }
  function wake(){if(!reduced.matches&&!frame){last=0;frame=requestAnimationFrame(paint);}}
  function follow(event){
    if(reduced.matches)return;
    const r=button.getBoundingClientRect();
    // The bead glides slightly within its own space, keeping the label unobstructed.
    tx=((event.clientX-r.left)/r.width-.5)*12;
    ty=((event.clientY-r.top)/r.height-.5)*8;
    targetScale=1.1;wake();
  }
  function reset(){tx=ty=0;targetScale=1;wake();}
  button.addEventListener('pointermove',follow,{passive:true});
  button.addEventListener('pointerenter',follow);
  button.addEventListener('pointerleave',reset);
  button.addEventListener('pointerdown',()=>{targetScale=.9;wake();},{passive:true});
  button.addEventListener('pointerup',()=>{targetScale=1.1;wake();});
  button.addEventListener('pointercancel',reset);
  button.addEventListener('focus',()=>{targetScale=1.1;wake();});
  button.addEventListener('blur',reset);
  reduced.addEventListener('change',()=>{cancelAnimationFrame(frame);frame=0;x=y=tx=ty=0;scale=targetScale=1;drop.style.transform='';});
})();
