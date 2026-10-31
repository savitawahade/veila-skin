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

function tick(env, from, duration) {
  for(let time=from;time<from+duration;time+=16) {
    const callbacks=[...env.frames.values()];env.frames.clear();
    callbacks.forEach(callback=>callback(time));
  }
}
function move(env,x,y=300) { fire(env.nodes['#hero'],'pointermove',{pointerType:'mouse',clientX:x,clientY:y}); }
function ready(env) { env.film.duration=10;env.film.readyState=2;fire(env.film,'loadeddata');fire(env.film,'seeked'); }

test('poster first: only a gesture requests frames and native playback never starts', () => {
  const env=environment();env.run('hero-film.js');
  assert.equal(env.film.src,null);
  move(env,700);ready(env);tick(env,16,1000);
  assert.equal(env.film.src,'scrub.mp4');
  assert.equal(env.film.playCount,0);
  assert.equal(env.film.paused,true);
  assert.ok(env.film.currentTime>1.6);
  assert.ok(env.nodes['#hero'].classes.has('film-ready'));
});

test('fast movement is speed limited, forward only, then settles without looping', () => {
  const env=environment();env.run('hero-film.js');move(env,500);ready(env);
  let previous=env.film.currentTime;
  for(let time=16;time<10000;time+=16) {
    move(env,time%32===0?950:500);
    tick(env,time,16);
    assert.ok(env.film.currentTime>=previous);
    assert.ok(env.film.currentTime-previous<=.78*.016+.00001);
    if(previous>=4.1&&previous<=7.2) assert.ok(env.film.currentTime-previous<=.38*.016+.00001);
    previous=env.film.currentTime;
  }
  tick(env,10016,6000);
  const settled=env.film.currentTime;
  tick(env,16016,6000);
  assert.equal(env.film.currentTime,settled);
  assert.equal(env.frames.size,0);
  assert.equal(env.film.playCount,0);
});

test('hidden and offscreen interaction stops and does not accumulate gestures', () => {
  const env=environment();env.run('hero-film.js');move(env,800);ready(env);tick(env,16,200);
  env.intersect(false);
  const stopped=env.film.currentTime;
  move(env,900);tick(env,216,1000);
  assert.equal(env.film.currentTime,stopped);
  assert.equal(env.frames.size,0);
  env.intersect(true);move(env,850);tick(env,1216,200);
  assert.ok(env.film.currentTime>stopped);
  env.document.hidden=true;fire(env.document,'visibilitychange');
  assert.equal(env.frames.size,0);
});

test('reduced motion stays still for pointer movement and allows explicit keyboard steps', () => {
  const env=environment(true);env.run('hero-film.js');move(env,850);
  assert.equal(env.film.loadCount,0);
  fire(env.nodes['#bottle-viewer'],'keydown',{key:'ArrowRight'});ready(env);
  assert.equal(env.film.currentTime,2.2);
  assert.equal(env.frames.size,0);
  assert.equal(env.film.playCount,0);
});

test('media errors and timeouts retain the poster and next gesture can retry', () => {
  for (const failure of ['error','timeout']) {
    const env=environment();env.run('hero-film.js');move(env,800);
    if(failure==='error') fire(env.film,'error'); else [...env.timers.values()][0]();
    assert.equal(env.nodes['#hero'].classes.has('film-ready'),false);
    assert.match(env.nodes['#film-status'].textContent,/retry/);
    move(env,850);assert.equal(env.film.loadCount,2);
    ready(env);tick(env,16,500);
    assert.ok(env.nodes['#hero'].classes.has('film-ready'));
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
