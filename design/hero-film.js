(() => {
  const hero=document.querySelector('#hero');
  const film=document.querySelector('#hero-film');
  const toggle=document.querySelector('#film-toggle');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let target=0,position=0,frame=0,last=0,ready=false,visible=true,playing=false;
  const duration=()=>Math.max(0,film.duration-1/30);
  function updateToggle(){toggle.textContent=playing?'Pause film':'Play the ritual';toggle.setAttribute('aria-pressed',String(playing));}
  function tick(time){
    frame=0;
    if(!ready||!visible||playing||reduced.matches)return;
    const dt=Math.min((time-(last||time-16))/1000,.05);last=time;
    position+=(target-position)*(1-Math.exp(-dt/.3));
    if(!film.seeking&&Math.abs(film.currentTime-position)>1/60)film.currentTime=position;
    if(Math.abs(target-position)>.008||Math.abs(film.currentTime-target)>1/30)frame=requestAnimationFrame(tick);
  }
  function wake(){if(!frame&&ready&&visible&&!playing&&!reduced.matches){last=0;frame=requestAnimationFrame(tick);}}
  function onReady(){ready=true;hero.classList.add('film-ready');wake();}
  film.addEventListener('loadeddata',onReady);
  if(film.readyState>=2)onReady();
  film.addEventListener('error',()=>{hero.classList.remove('film-ready');toggle.hidden=true;});
  hero.addEventListener('pointermove',e=>{
    if(!ready||e.pointerType==='touch'||reduced.matches||playing||e.target.closest('.nav,.cta-row,.film-toggle'))return;
    const r=hero.getBoundingClientRect();
    target=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width))*duration();wake();
  },{passive:true});
  hero.addEventListener('pointerleave',()=>{if(!playing){target=0;wake();}});
  toggle.addEventListener('click',async()=>{
    if(playing){film.pause();playing=false;position=target=film.currentTime;updateToggle();return;}
    cancelAnimationFrame(frame);frame=0;
    if(film.currentTime>=duration()-.1)film.currentTime=0;
    try{await film.play();playing=true;updateToggle();}catch{playing=false;updateToggle();}
  });
  film.addEventListener('ended',()=>{playing=false;position=target=film.currentTime;updateToggle();});
  function pause(){film.pause();playing=false;position=target=film.currentTime;cancelAnimationFrame(frame);frame=0;updateToggle();}
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(!visible)pause();else wake();}).observe(hero);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
  reduced.addEventListener('change',()=>{pause();target=position=0;film.currentTime=0;});
  const menu=document.querySelector('#menu-toggle'),panel=document.querySelector('#mobile-navigation');
  const close=()=>{panel.classList.remove('is-open');menu.setAttribute('aria-expanded','false');};
  menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));panel.classList.toggle('is-open',open);});
  panel.addEventListener('click',close);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){close();pause();}});
})();
