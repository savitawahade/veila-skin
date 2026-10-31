// An original, browser-generated 72 BPM instrumental. No downloads or autoplay.
(() => {
  const button = document.querySelector('#lofi-toggle');
  const label = document.querySelector('#lofi-label');
  const status = document.querySelector('#lofi-status');
  const AudioEngine = window.AudioContext || window.webkitAudioContext;
  let context, master, timer, busy = false;
  const beat = 60 / 72;
  const chords = [[48, 55, 59, 62, 64], [45, 52, 55, 59, 60],
    [41, 48, 52, 55, 57], [43, 50, 53, 57, 59]];
  const melody = [[76, 74, 71, 67], [72, 71, 67, 64],
    [69, 67, 64, 60], [71, 69, 65, 62]];
  const hz = note => 440 * 2 ** ((note - 69) / 12);

  function show(playing) {
    button.setAttribute('aria-pressed', String(playing));
    button.setAttribute('aria-label', `${playing ? 'Pause' : 'Play'} lo-fi background music`);
    label.textContent = playing ? 'Pause lo-fi' : 'Play lo-fi';
  }

  function compose(ctx, output) {
    const tone = ctx.createBiquadFilter();
    tone.type = 'lowpass'; tone.frequency.value = 2800;
    tone.connect(output);
    const delay = ctx.createDelay(2), feedback = ctx.createGain(), wet = ctx.createGain();
    delay.delayTime.value = beat * .75;
    feedback.gain.value = .22; wet.gain.value = .16;
    tone.connect(delay); delay.connect(feedback); feedback.connect(delay);
    delay.connect(wet); wet.connect(output);
    const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const samples = noise.getChannelData(0);
    for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;

    function note(midi, time, length, level, type = 'sine') {
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.type = type; osc.frequency.value = hz(midi);
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(level, time + .025);
      gain.gain.exponentialRampToValueAtTime(.0001, time + length);
      osc.connect(gain); gain.connect(tone);
      osc.start(time); osc.stop(time + length + .03);
      osc.onended = () => { osc.disconnect(); gain.disconnect(); };
    }

    function brush(time, level, length, frequency) {
      const source = ctx.createBufferSource(), filter = ctx.createBiquadFilter(), gain = ctx.createGain();
      source.buffer = noise; filter.type = 'bandpass'; filter.frequency.value = frequency;
      filter.Q.value = .7;
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(level, time + .008);
      gain.gain.exponentialRampToValueAtTime(.0001, time + length);
      source.connect(filter); filter.connect(gain); gain.connect(tone);
      source.start(time); source.stop(time + length);
      source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect(); };
    }

    function kick(time) {
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.frequency.setValueAtTime(100, time);
      osc.frequency.exponentialRampToValueAtTime(44, time + .18);
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(.18, time + .006);
      gain.gain.exponentialRampToValueAtTime(.0001, time + .25);
      osc.connect(gain); gain.connect(output); osc.start(time); osc.stop(time + .3);
      osc.onended = () => { osc.disconnect(); gain.disconnect(); };
    }

    let step = 0, next = ctx.currentTime + .08;
    function schedule() {
      while (next < ctx.currentTime + .2) {
        const bar = Math.floor(step / 8) % 8, part = step % 8;
        const chord = chords[Math.floor(bar / 2)];
        const time = next + (part % 2 ? .035 : 0);
        if (part === 0) {
          chord.slice(1).forEach((pitch, i) => {
            note(pitch, time + i * .012, beat * 3.6, .038);
            note(pitch + 12, time + i * .012, beat * 1.7, .009);
          });
          note(chord[0] - 12, time, beat * 2.5, .09);
        }
        if (part === 0 || part === 4) kick(time);
        if (part === 2 || part === 6) brush(time + .012, .07, .17, 1500);
        brush(time, part % 2 ? .025 : .015, .045, 4800);
        if ([1, 4, 7].includes(part)) {
          const phrase = melody[Math.floor(bar / 2)];
          note(phrase[(Math.floor(part / 2) + bar % 2) % 4], time, beat * 1.4, .027);
        }
        step++; next += beat / 2;
      }
    }
    schedule();
    return setInterval(schedule, 80);
  }

  async function stop() {
    if (!context || busy) return;
    busy = true; button.disabled = true;
    const previous = context;
    clearInterval(timer); timer = null;
    master.gain.cancelScheduledValues(previous.currentTime);
    master.gain.setTargetAtTime(0, previous.currentTime, .05);
    show(false);
    await new Promise(resolve => setTimeout(resolve, 180));
    await previous.close().catch(() => {});
    context = null; busy = false; button.disabled = false;
  }

  if (!AudioEngine) {
    button.disabled = true; label.textContent = 'Audio unavailable';
    return;
  }
  button.addEventListener('click', async () => {
    if (busy) return;
    if (context) { await stop(); return; }
    busy = true; button.disabled = true; status.textContent = '';
    try {
      context = new AudioEngine();
      await context.resume();
      if (document.hidden || context.state !== 'running') throw new Error('Audio not ready');
      master = context.createGain(); master.gain.value = 0;
      master.connect(context.destination);
      master.gain.setTargetAtTime(.55, context.currentTime, .3);
      timer = compose(context, master);
      show(true);
    } catch {
      clearInterval(timer);
      if (context) await context.close().catch(() => {});
      context = null; show(false);
      status.textContent = 'Music couldn’t start. Please try again.';
    } finally { busy = false; button.disabled = false; }
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  window.addEventListener('pagehide', () => { clearInterval(timer); context?.close().catch(() => {}); context = null; show(false); });
})();
