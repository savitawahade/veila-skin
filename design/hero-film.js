(() => {
  const hero = document.querySelector('#hero');
  const scene = document.querySelector('#bottle-viewer');
  const film = document.querySelector('#hero-film');
  const status = document.querySelector('#film-status');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const menu = document.querySelector('#menu-toggle');
  const panel = document.querySelector('#mobile-navigation');

  // Navigation remains independent of media support or availability.
  function closeMenu(restoreFocus = false) {
    if (!menu || !panel) return;
    const returnToToggle = restoreFocus === true && panel.contains(document.activeElement);
    panel.classList.remove('is-open');
    menu.setAttribute('aria-expanded', 'false');
    if (returnToToggle) menu.focus();
  }
  if (menu && panel) {
    menu.addEventListener('click', () => {
      const open = menu.getAttribute('aria-expanded') !== 'true';
      menu.setAttribute('aria-expanded', String(open));
      panel.classList.toggle('is-open', open);
    });
    panel.addEventListener('click', closeMenu);
  }
  if (!hero || !scene || !film) return;

  // Every frame is independently encoded. The video stays paused: gestures
  // advance a forward-only timeline, so a falling drop never travels upward.
  const START = 1.6;
  let end = 9.8;
  let position = START, target = START;
  let loaded = false, failed = false, visible = true;
  let frame = 0, last = 0, loadTimer = 0;
  let previous = null;
  let x = 0, y = 0, tx = 0, ty = 0;
  film.preload = 'none';
  film.pause();

  function announce(message) { if (status) status.textContent = message; }
  function fail() {
    clearTimeout(loadTimer);
    loaded = false;
    failed = true;
    cancelAnimationFrame(frame);
    frame = 0;
    hero.classList.remove('film-ready');
    announce('The bottle image is available. Move over it again to retry the interaction.');
  }
  function load() {
    if (film.getAttribute('src') && !failed) return;
    const source = film.dataset.src;
    if (!source) return;
    failed = false;
    film.src = source;
    film.load();
    clearTimeout(loadTimer);
    loadTimer = setTimeout(() => { if (!loaded) fail(); }, 20000);
  }
  function wake() {
    if (!frame && loaded && visible && !document.hidden && !reduced.matches) {
      last = 0;
      frame = requestAnimationFrame(paint);
    }
  }
  function paint(time) {
    frame = 0;
    if (!visible || document.hidden || reduced.matches || !loaded) return;
    const dt = Math.min((time - (last || time - 16)) / 1000, .05);
    last = time;
    // Cap the physical speed even after a fast sweep. Give the suspended
    // drop the slowest passage, then gently settle when the hand stops.
    const speed = position >= 4.1 && position <= 7.2 ? .38 : .78;
    if (!film.seeking) {
      const step = Math.min(speed * dt, (target - position) * (1 - Math.exp(-dt / .32)));
      if (step > .000001) {
        position = Math.min(end, position + step);
        film.currentTime = position;
      }
    }
    const ease = 1 - Math.exp(-dt / .3);
    x += (tx - x) * ease;
    y += (ty - y) * ease;
    scene.style.setProperty('--film-x', `${x.toFixed(3)}px`);
    scene.style.setProperty('--film-y', `${y.toFixed(3)}px`);
    if (target - position > .001 || Math.abs(tx - x) > .005 || Math.abs(ty - y) > .005) {
      frame = requestAnimationFrame(paint);
    }
  }
  function advance(amount, direct = false) {
    if (!visible || document.hidden) return;
    if (position >= end - .06) {
      // Both endpoints are closed. Start a fresh ritual only on new input.
      position = target = START;
      if (loaded) film.currentTime = START;
    }
    target = Math.min(end, position + .85, target + amount);
    load();
    if (direct && loaded) {
      position = target;
      film.currentTime = position;
    } else wake();
  }
  function suspend() {
    previous = null;
    target = position;
    tx = ty = x = y = 0;
    cancelAnimationFrame(frame);
    frame = 0;
    scene.style.setProperty('--film-x', '0px');
    scene.style.setProperty('--film-y', '0px');
    film.pause();
  }
  film.addEventListener('loadeddata', () => {
    if (failed) return;
    clearTimeout(loadTimer);
    loaded = true;
    end = Number.isFinite(film.duration) ? Math.max(START, film.duration - .12) : 9.8;
    film.pause();
    film.currentTime = position;
    if (reduced.matches) { position = target; film.currentTime = position; }
    wake();
  });
  film.addEventListener('seeked', () => {
    if (loaded && !failed) hero.classList.add('film-ready');
  });
  film.addEventListener('error', fail);

  hero.addEventListener('pointermove', event => {
    if (reduced.matches || !visible || document.hidden) return;
    if (event.target.closest('button,a,input,select,.nav,.mobile-panel')) {
      previous = null;
      return;
    }
    if (event.pointerType === 'touch' && !event.target.closest('#bottle-viewer')) return;
    if (event.pointerType !== 'touch' && !finePointer.matches) return;
    if (!previous) {
      previous = {x:event.clientX, y:event.clientY};
      if (event.pointerType !== 'touch') advance(.35);
      return;
    }
    const dx = event.clientX - previous.x, dy = event.clientY - previous.y;
    previous = {x:event.clientX, y:event.clientY};
    // Vertical touch movement remains ordinary page scrolling.
    if (event.pointerType === 'touch' && Math.abs(dy) > Math.abs(dx)) return;
    const distance = Math.min(60, Math.hypot(dx, dy));
    if (distance < .5) return;
    const rect = scene.getBoundingClientRect();
    tx = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1)) * 3;
    ty = Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1)) * 2;
    advance(distance * .012);
  }, {passive:true});
  scene.addEventListener('pointerdown', event => {
    if (event.pointerType === 'touch') previous = {x:event.clientX,y:event.clientY};
  }, {passive:true});
  hero.addEventListener('pointerleave', () => { previous = null; tx = ty = 0; wake(); });
  hero.addEventListener('pointercancel', suspend);
  hero.addEventListener('pointerup', () => { previous = null; });
  scene.addEventListener('keydown', event => {
    if (['ArrowRight','ArrowUp',' '].includes(event.key)) {
      event.preventDefault();
      advance(.6, reduced.matches);
    }
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) suspend();
    }).observe(hero);
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) suspend(); });
  reduced.addEventListener('change', suspend);
  finePointer.addEventListener('change', suspend);
  window.addEventListener('blur', suspend);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') { closeMenu(true); suspend(); }
  });
})();
