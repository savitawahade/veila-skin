(() => {
  const hero = document.querySelector('#hero');
  const scene = document.querySelector('#bottle-viewer');
  const film = document.querySelector('#hero-film');
  const toggle = document.querySelector('#film-toggle');
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
  if (!hero || !scene || !film || !toggle) return;

  let phase = 'idle';
  let command = 0;
  let visible = true;
  let loadTimer = 0;
  let frame = 0;
  let last = 0;
  let x = 0, y = 0, tx = 0, ty = 0;

  // No source is attached until an explicit request to play. Pointer motion
  // changes only the composition, never the video's timeline or direction.
  film.preload = 'none';
  function announce(message) {
    if (status) status.textContent = message;
  }
  function updateControl() {
    const labels = {
      idle: 'Play the ritual', loading: 'Loading film…', playing: 'Pause film',
      paused: 'Resume ritual', ended: 'Play the ritual', error: 'Retry film'
    };
    toggle.textContent = labels[phase];
    toggle.disabled = phase === 'loading';
    toggle.setAttribute('aria-pressed', String(phase === 'playing'));
    toggle.setAttribute('aria-busy', String(phase === 'loading'));
  }
  function clearLoadTimer() {
    clearTimeout(loadTimer);
    loadTimer = 0;
  }
  function stop(reason) {
    const active = phase === 'playing' || phase === 'loading';
    command += 1;
    clearLoadTimer();
    film.pause();
    if (active) {
      phase = reason === 'explicit' && film.currentTime > 0 ? 'paused' : 'idle';
      announce(reason === 'explicit' ? 'Film paused.' : 'Film paused. Play the ritual to start again.');
      updateControl();
    }
  }
  function fail() {
    command += 1;
    clearLoadTimer();
    phase = 'error';
    film.pause();
    hero.classList.remove('film-ready');
    announce('The film could not load. The product image is still available. Try again when your connection is ready.');
    updateControl();
  }
  function showFrame() {
    if (phase !== 'idle' && phase !== 'error' && film.readyState >= 2) {
      hero.classList.add('film-ready');
    }
  }
  async function play() {
    if (phase === 'loading') return;
    if (phase === 'playing') {
      stop('explicit');
      return;
    }
    if (!visible || document.hidden) return;
    const resume = phase === 'paused';
    const retry = phase === 'error';
    const source = film.dataset.playbackSrc || film.dataset.src;
    if (!source) {
      fail();
      return;
    }
    const thisCommand = ++command;
    phase = 'loading';
    announce('Loading the ritual film.');
    updateControl();
    loadTimer = setTimeout(() => {
      if (command === thisCommand && phase === 'loading') fail();
    }, 20000);
    try {
      if (!film.getAttribute('src') || retry) {
        film.src = source;
        film.load();
      }
      if (!resume) film.currentTime = 0;
      await film.play();
      if (command !== thisCommand) return;
      if (!visible || document.hidden) {
        stop('hidden');
        return;
      }
      clearLoadTimer();
      phase = 'playing';
      showFrame();
      announce('Ritual film playing.');
      updateControl();
    } catch {
      if (command === thisCommand) fail();
    }
  }
  toggle.addEventListener('click', play);
  film.addEventListener('loadeddata', showFrame);
  film.addEventListener('error', () => {
    if (phase !== 'idle' && phase !== 'error') fail();
  });
  film.addEventListener('ended', () => {
    command += 1;
    clearLoadTimer();
    phase = 'ended';
    announce('Ritual film finished.');
    updateControl();
  });

  function paint(time) {
    frame = 0;
    const dt = Math.min((time - (last || time - 16)) / 1000, .05);
    last = time;
    const ease = 1 - Math.exp(-dt / .24);
    x += (tx - x) * ease;
    y += (ty - y) * ease;
    scene.style.setProperty('--film-x', `${x.toFixed(3)}px`);
    scene.style.setProperty('--film-y', `${y.toFixed(3)}px`);
    if (Math.abs(tx - x) > .005 || Math.abs(ty - y) > .005) {
      frame = requestAnimationFrame(paint);
    }
  }
  function wake() {
    if (!frame && visible && !document.hidden && !reduced.matches && finePointer.matches) {
      last = 0;
      frame = requestAnimationFrame(paint);
    }
  }
  function resetMotion(immediate = false) {
    tx = ty = 0;
    if (immediate) {
      cancelAnimationFrame(frame);
      frame = 0;
      x = y = 0;
      scene.style.setProperty('--film-x', '0px');
      scene.style.setProperty('--film-y', '0px');
    } else wake();
  }
  hero.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch' || reduced.matches || !finePointer.matches) return;
    const rect = scene.getBoundingClientRect();
    const inMedia = event.clientX >= rect.left + rect.width * .45 &&
      event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
    if (!inMedia || event.target.closest('.nav,.copy,.film-controls,.mobile-panel')) {
      resetMotion();
      return;
    }
    tx = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1)) * 4;
    ty = Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1)) * 3;
    wake();
  }, {passive: true});
  hero.addEventListener('pointerleave', () => resetMotion());
  hero.addEventListener('pointercancel', () => resetMotion());
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) {
        stop('hidden');
        resetMotion(true);
      }
    }).observe(hero);
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stop('hidden');
      resetMotion(true);
    }
  });
  reduced.addEventListener('change', () => {
    stop('preference');
    resetMotion(true);
  });
  finePointer.addEventListener('change', () => resetMotion(true));
  window.addEventListener('blur', () => resetMotion(true));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeMenu(true);
      stop('explicit');
      resetMotion(true);
    }
  });
  updateControl();
})();
