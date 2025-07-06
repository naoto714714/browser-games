class FluteAudio extends PianoAudio {
  playNote(note, velocity = 0.8) {
    if (this.activeNotes.has(note)) {
      this.stopNote(note);
    }

    const frequency = this.noteToFrequency(note);
    const now = this.audioContext.currentTime;

    const oscillators = [];
    const gains = [];

    const fundamentalGain = this.audioContext.createGain();
    const osc1 = this.audioContext.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(frequency, now);

    const noise = this.audioContext.createBufferSource();
    const noiseBuffer = this.audioContext.createBuffer(
      1,
      this.audioContext.sampleRate * 2,
      this.audioContext.sampleRate
    );
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseData.length; i++) {
      noiseData[i] = Math.random() * 2 - 1;
    }
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const noiseFilter = this.audioContext.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(frequency * 2, now);
    noiseFilter.Q.setValueAtTime(10, now);

    const noiseGain = this.audioContext.createGain();
    noiseGain.gain.setValueAtTime(0.05 * velocity, now);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);

    const vibrato = this.audioContext.createOscillator();
    vibrato.frequency.setValueAtTime(4, now);
    const vibratoGain = this.audioContext.createGain();
    vibratoGain.gain.setValueAtTime(2, now);
    vibrato.connect(vibratoGain);
    vibratoGain.connect(osc1.frequency);
    vibrato.start(now);

    osc1.connect(fundamentalGain);
    fundamentalGain.gain.setValueAtTime(0.7 * velocity, now);
    oscillators.push(osc1);
    oscillators.push(vibrato);
    gains.push(fundamentalGain);
    gains.push(noiseGain);

    const harmonics = [
      { mult: 2, gain: 0.1 },
      { mult: 3, gain: 0.05 },
      { mult: 4, gain: 0.02 },
    ];

    harmonics.forEach(harmonic => {
      const gain = this.audioContext.createGain();
      const osc = this.audioContext.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency * harmonic.mult, now);
      osc.connect(gain);
      gain.gain.setValueAtTime(harmonic.gain * velocity, now);
      oscillators.push(osc);
      gains.push(gain);
    });

    const envelope = this.audioContext.createGain();
    envelope.gain.setValueAtTime(0, now);
    envelope.gain.linearRampToValueAtTime(1, now + 0.05);
    envelope.gain.exponentialRampToValueAtTime(0.8, now + 0.1);
    envelope.gain.exponentialRampToValueAtTime(0.7, now + 0.5);

    gains.forEach(gain => {
      gain.connect(envelope);
    });

    envelope.connect(this.masterGain);
    envelope.connect(this.reverb);

    oscillators.forEach(osc => {
      if (osc !== vibrato) {
        osc.start(now);
      }
    });
    noise.start(now);

    this.activeNotes.set(note, { oscillators, envelope, gains, noise });
  }

  stopNote(note) {
    const noteData = this.activeNotes.get(note);
    if (!noteData) {
      return;
    }

    const now = this.audioContext.currentTime;
    const { oscillators, envelope, noise } = noteData;

    envelope.gain.cancelScheduledValues(now);
    envelope.gain.setValueAtTime(envelope.gain.value, now);
    envelope.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    oscillators.forEach(osc => {
      osc.stop(now + 0.3);
    });

    if (noise) {
      noise.stop(now + 0.3);
    }

    this.activeNotes.delete(note);

    setTimeout(() => {
      envelope.disconnect();
    }, 400);
  }
}

class Flute extends Instrument {
  constructor(container, audio) {
    super(container, new FluteAudio());

    this.notes = [
      { note: 'C5', position: 50 },
      { note: 'D5', position: 100 },
      { note: 'E5', position: 150 },
      { note: 'F5', position: 200 },
      { note: 'G5', position: 250 },
      { note: 'A5', position: 300 },
      { note: 'B5', position: 350 },
      { note: 'C6', position: 400 },
      { note: 'D6', position: 450 },
      { note: 'E6', position: 500 },
    ];

    this.keyboardMapping = {
      a: 'C5',
      s: 'D5',
      d: 'E5',
      f: 'F5',
      g: 'G5',
      h: 'A5',
      j: 'B5',
      k: 'C6',
      l: 'D6',
      ';': 'E6',
    };

    this.createFlute();
    this.setupKeyboardEvents();
  }

  createFlute() {
    const fluteBody = document.createElement('div');
    fluteBody.className = 'flute-body';

    this.notes.forEach(({ note, position }) => {
      const hole = document.createElement('div');
      hole.className = 'flute-hole';
      hole.style.left = `${position}px`;
      hole.dataset.note = note;

      const label = document.createElement('div');
      label.style.position = 'absolute';
      label.style.bottom = '-25px';
      label.style.left = '50%';
      label.style.transform = 'translateX(-50%)';
      label.style.color = '#999';
      label.style.fontSize = '12px';

      const key = Object.keys(this.keyboardMapping).find(
        k => this.keyboardMapping[k] === note
      );
      if (key) {
        label.textContent = key.toUpperCase();
      }

      hole.appendChild(label);
      this.setupElementEvents(hole, note);
      fluteBody.appendChild(hole);
    });

    this.container.appendChild(fluteBody);
  }

  setupKeyboardEvents() {
    this._keydownHandler = e => {
      if (e.repeat) {
        return;
      }

      const note = this.keyboardMapping[e.key.toLowerCase()];
      if (note) {
        e.preventDefault();
        const element = this.container.querySelector(`[data-note="${note}"]`);
        if (element) {
          this.playNote(element, note);
        }
      }
    };

    this._keyupHandler = e => {
      const note = this.keyboardMapping[e.key.toLowerCase()];
      if (note) {
        e.preventDefault();
        const element = this.container.querySelector(`[data-note="${note}"]`);
        if (element) {
          this.stopNote(element, note);
        }
      }
    };

    document.addEventListener('keydown', this._keydownHandler);
    document.addEventListener('keyup', this._keyupHandler);
  }

  destroy() {
    if (this._keydownHandler) {
      document.removeEventListener('keydown', this._keydownHandler);
    }
    if (this._keyupHandler) {
      document.removeEventListener('keyup', this._keyupHandler);
    }
    super.destroy();
  }
}
