(() => {
  const hero=document.querySelector('#hero');
  const film=document.querySelector('#hero-film');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let target=0,position=0,frame=0,last=0,ready=false,visible=true;
  const duration=()=>Math.max(0,film.duration-1/30);
  function tick(time){
    frame=0;
    if(!ready||!visible||reduced.matches)return;
    const dt=Math.min((time-(last||time-16))/1000,.05);last=time;
    position+=(target-position)*(1-Math.exp(-dt/.3));
    if(!film.seeking&&Math.abs(film.currentTime-position)>1/60)film.currentTime=position;
    if(Math.abs(target-position)>.008||Math.abs(film.currentTime-target)>1/30)frame=requestAnimationFrame(tick);
  }
  function wake(){if(!frame&&ready&&visible&&!reduced.matches){last=0;frame=requestAnimationFrame(tick);}}
  function onReady(){ready=true;hero.classList.add('film-ready');wake();}
  film.addEventListener('loadeddata',onReady);
  if(film.readyState>=2)onReady();
  film.addEventListener('error',()=>{hero.classList.remove('film-ready');});
  hero.addEventListener('pointermove',e=>{
    if(!ready||e.pointerType==='touch'||reduced.matches||e.target.closest('.nav,.cta-row,.ritual-sound'))return;
    const r=hero.getBoundingClientRect();
    target=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width))*duration();wake();
  },{passive:true});
  hero.addEventListener('pointerleave',()=>{target=0;wake();});
  function pause(){film.pause();position=target=film.currentTime;cancelAnimationFrame(frame);frame=0;}
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(!visible)pause();else wake();}).observe(hero);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
  reduced.addEventListener('change',()=>{pause();target=position=0;film.currentTime=0;});
  const menu=document.querySelector('#menu-toggle'),panel=document.querySelector('#mobile-navigation');
  const close=()=>{panel.classList.remove('is-open');menu.setAttribute('aria-expanded','false');};
  menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));panel.classList.toggle('is-open',open);});
  panel.addEventListener('click',close);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){close();pause();}});
})();
