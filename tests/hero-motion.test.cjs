const assert = require('node:assert/strict');
const {readFileSync} = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {test} = require('node:test');

class Element extends EventTarget {
  constructor() {
    super();
    this.attrs = new Map();
    this.dataset = {};
    this.style = {setProperty(name, value) { this[name] = value; }};
    this.classes = new Set();
    this.classList = {
      add: value => this.classes.add(value),
      remove: value => this.classes.delete(value),
      toggle: (value, enabled) => enabled ? this.classes.add(value) : this.classes.delete(value)
    };
    this.textContent = '';
    this.disabled = false;
  }
  getAttribute(key) { return this.attrs.get(key) || null; }
  setAttribute(key, value) { this.attrs.set(key, String(value)); }
  getBoundingClientRect() { return {left: 0, top: 0, right: 1000, bottom: 600, width: 1000, height: 600}; }
  closest() { return null; }
  contains(element) { return element === this; }
}
function fire(target, type, props = {}) {
  const event = new Event(type);
  for (const [key, value] of Object.entries(props)) Object.defineProperty(event, key, {value});
  target.dispatchEvent(event);
}
function environment(reducedMotion = false) {
  const nodes = Object.fromEntries(['#hero', '#bottle-viewer', '#hero-film', '#film-toggle', '#film-status', '#menu-toggle', '#mobile-navigation', '.water-button'].map(id => [id, new Element()]));
  const document = new Element();
  document.hidden = false;
  document.querySelector = id => nodes[id];
  const window = new Element();
  const reduced = new Element();
  reduced.matches = reducedMotion;
  const pointer = new Element();
  pointer.matches = true;
  let observer;
  class Observer {
    constructor(callback) { observer = callback; }
    observe() {}
  }
  window.IntersectionObserver = Observer;
  const frames = new Map(), timers = new Map();
  let next = 0;
  const film = nodes['#hero-film'];
  film.dataset.playbackSrc = 'compressed.mp4';
  film.dataset.src = 'scrub.mp4';
  film.currentTime = 0;
  film.readyState = 0;
  film.paused = true;
  film.loadCount = 0;
  film.playCount = 0;
  Object.defineProperty(film, 'src', {get() {return this.getAttribute('src');}, set(value) {this.setAttribute('src', value);}});
  film.load = () => film.loadCount++;
  film.pause = () => {film.paused = true;};
  film.play = () => {film.playCount++;film.paused=false;return Promise.resolve();};
  const context = vm.createContext({document, window, IntersectionObserver: Observer, matchMedia: query => query.includes('reduced-motion') ? reduced : pointer, requestAnimationFrame: callback => {const id=++next;frames.set(id,callback);return id;}, cancelAnimationFrame: id => frames.delete(id), setTimeout: callback => {const id=++next;timers.set(id,callback);return id;}, clearTimeout: id => timers.delete(id)});
  const button = nodes['.water-button'];
  button.parentElement = new Element();
  function run(file) { vm.runInContext(readFileSync(path.join(__dirname, '../design', file), 'utf8'), context); }
  return {nodes, document, reduced, film, frames, timers, run, intersect: visible => observer([{isIntersecting: visible}])};
}
const flush = () => new Promise(resolve => setImmediate(resolve));

test('poster-first: initialization, pointer movement and reduced motion do not request media', () => {
  for (const reduced of [false, true]) {
    const env=environment(reduced);env.run('hero-film.js');
    fire(env.nodes['#hero'], 'pointermove', {pointerType:'mouse',clientX:800,clientY:300});
    assert.equal(env.film.getAttribute('src'), null);
    assert.equal(env.film.loadCount, 0);
    assert.equal(env.film.playCount, 0);
    assert.equal(env.film.currentTime, 0);
  }
});

test('Play starts at zero; explicit pause resumes; ended playback starts over', async () => {
  const env=environment();env.run('hero-film.js');
  const toggle=env.nodes['#film-toggle'];
  env.film.currentTime=8;
  fire(toggle,'click');await flush();
  assert.equal(env.film.src,'compressed.mp4');
  assert.equal(env.film.currentTime,0);
  assert.equal(toggle.textContent,'Pause film');
  env.film.currentTime=4;
  fire(toggle,'click');
  assert.equal(toggle.textContent,'Resume ritual');
  assert.equal(env.film.paused,true);
  fire(toggle,'click');await flush();
  assert.equal(env.film.currentTime,4);
  fire(env.film,'ended');env.film.currentTime=10;
  fire(toggle,'click');await flush();
  assert.equal(env.film.currentTime,0);
});

test('failed media retains poster, announces failure and can retry', async () => {
  const env=environment();env.run('hero-film.js');
  env.film.play=()=>Promise.reject(new Error('404'));
  fire(env.nodes['#film-toggle'],'click');await flush();
  assert.equal(env.nodes['#film-toggle'].textContent,'Retry film');
  assert.equal(env.nodes['#film-toggle'].disabled,false);
  assert.match(env.nodes['#film-status'].textContent,/could not load/);
  assert.equal(env.nodes['#hero'].classes.has('film-ready'),false);
  env.film.play=()=>Promise.resolve();
  fire(env.nodes['#film-toggle'],'click');await flush();
  assert.equal(env.film.loadCount,2);
  assert.equal(env.nodes['#film-toggle'].textContent,'Pause film');
});

test('pending play completion cannot restart hidden film or override a cancellation', async () => {
  const env=environment();env.run('hero-film.js');
  let resolve;
  env.film.play=()=>new Promise(done=>{resolve=done;});
  fire(env.nodes['#film-toggle'],'click');
  assert.equal(env.nodes['#film-toggle'].disabled,true);
  env.document.hidden=true;fire(env.document,'visibilitychange');
  resolve();await flush();
  assert.equal(env.film.paused,true);
  assert.equal(env.nodes['#film-toggle'].textContent,'Play the ritual');
  assert.equal(env.nodes['#film-toggle'].disabled,false);
});

test('source errors and stalled loads expose retry; menu remains usable', async () => {
  for (const failure of ['error','timeout']) {
    const env=environment();env.run('hero-film.js');
    env.film.play=()=>new Promise(()=>{});
    fire(env.nodes['#film-toggle'],'click');
    if(failure==='error') fire(env.film,'error');
    else [...env.timers.values()][0]();
    assert.equal(env.nodes['#film-toggle'].textContent,'Retry film');
    fire(env.nodes['#menu-toggle'],'click');
    assert.equal(env.nodes['#menu-toggle'].getAttribute('aria-expanded'),'true');
    fire(env.document,'keydown',{key:'Escape'});
    assert.equal(env.nodes['#menu-toggle'].getAttribute('aria-expanded'),'false');
  }
});

test('CTA morph stays inside a stable target and does not react to distant hero movement', () => {
  const env=environment();env.run('water-button.js');
  const button=env.nodes['.water-button'];
  fire(env.nodes['#hero'],'pointermove',{pointerType:'mouse',clientX:950,clientY:500});
  assert.equal(env.frames.size,0);
  fire(button.parentElement,'pointermove',{pointerType:'mouse',clientX:950,clientY:500});
  for(let time=16;time<1600;time+=16) {
    const callbacks=[...env.frames.values()];env.frames.clear();
    callbacks.forEach(callback=>callback(time));
  }
  assert.equal(button.style.transform,'scale(1.0000)');
  assert.ok(button.style.borderRadius);
  env.reduced.matches=true;fire(env.reduced,'change');
  assert.equal(button.style.transform,'');
  assert.equal(button.style.borderRadius,'');
  assert.equal(env.frames.size,0);
});


test('Escape returns focus from the mobile panel to Menu without stealing unrelated focus', () => {
  const env=environment();
  const menu=env.nodes['#menu-toggle'],panel=env.nodes['#mobile-navigation'];
  const panelLink=new Element(),outside=new Element();
  panel.contains=element=>element===panelLink;
  menu.focus=()=>{env.document.activeElement=menu;};
  env.run('hero-film.js');
  fire(menu,'click');
  env.document.activeElement=panelLink;
  fire(env.document,'keydown',{key:'Escape'});
  assert.equal(menu.getAttribute('aria-expanded'),'false');
  assert.equal(env.document.activeElement,menu);
  fire(menu,'click');
  env.document.activeElement=outside;
  fire(env.document,'keydown',{key:'Escape'});
  assert.equal(env.document.activeElement,outside);
});
