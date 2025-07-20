class ViolinAudio extends PianoAudio {
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
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(frequency, now);

    const vibrato = this.audioContext.createOscillator();
    vibrato.frequency.setValueAtTime(5, now);
    const vibratoGain = this.audioContext.createGain();
    vibratoGain.gain.setValueAtTime(3, now);
    vibrato.connect(vibratoGain);
    vibratoGain.connect(osc1.frequency);
    vibrato.start(now);

    const highpass = this.audioContext.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(200, now);
    highpass.Q.setValueAtTime(0.5, now);

    const bandpass = this.audioContext.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(frequency * 2, now);
    bandpass.Q.setValueAtTime(5, now);

    osc1.connect(highpass);
    highpass.connect(bandpass);
    bandpass.connect(fundamentalGain);
    fundamentalGain.gain.setValueAtTime(0.4 * velocity, now);
    oscillators.push(osc1);
    oscillators.push(vibrato);
    gains.push(fundamentalGain);

    const harmonics = [
      { mult: 2, gain: 0.3 },
      { mult: 3, gain: 0.2 },
      { mult: 4, gain: 0.15 },
      { mult: 5, gain: 0.1 },
      { mult: 6, gain: 0.08 },
      { mult: 7, gain: 0.05 },
      { mult: 8, gain: 0.03 },
    ];

    harmonics.forEach((harmonic) => {
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
    envelope.gain.linearRampToValueAtTime(0.8, now + 0.05);
    envelope.gain.linearRampToValueAtTime(1, now + 0.1);
    envelope.gain.exponentialRampToValueAtTime(0.8, now + 0.5);

    gains.forEach((gain) => {
      gain.connect(envelope);
    });

    envelope.connect(this.masterGain);
    envelope.connect(this.reverb);

    oscillators.forEach((osc) => {
      if (osc !== vibrato) {
        osc.start(now);
      }
    });

    this.activeNotes.set(note, { oscillators, envelope, gains });
  }
}

class Violin extends Instrument {
  constructor(container, audio) {
    super(container, new ViolinAudio());
    this.strings = [
      { note: 'G3', position: 0 },
      { note: 'D4', position: 40 },
      { note: 'A4', position: 80 },
      { note: 'E5', position: 120 },
    ];

    this.keyboardMapping = {
      q: 'G3',
      w: 'A3',
      e: 'B3',
      r: 'C4',
      t: 'D4',
      y: 'E4',
      u: 'F4',
      i: 'G4',
      o: 'A4',
      p: 'B4',
      '[': 'C5',
      ']': 'D5',
      '\\': 'E5',
      a: 'F5',
      s: 'G5',
      d: 'A5',
      f: 'B5',
      g: 'C6',
    };

    this.createViolin();
    this.setupKeyboardEvents();
  }

  createViolin() {
    const violinBody = document.createElement('div');
    violinBody.className = 'violin-body';

    const stringsContainer = document.createElement('div');
    stringsContainer.className = 'violin-strings';

    this.strings.forEach((string, index) => {
      const stringElement = document.createElement('div');
      stringElement.className = 'violin-string';
      stringElement.style.left = `${string.position}px`;
      stringElement.dataset.baseNote = string.note;

      for (let position = 0; position < 10; position++) {
        const note = this.calculateViolinNote(string.note, position);
        const hitArea = document.createElement('div');
        hitArea.style.position = 'absolute';
        hitArea.style.top = `${position * 30}px`;
        hitArea.style.left = '-10px';
        hitArea.style.width = '20px';
        hitArea.style.height = '30px';
        hitArea.style.cursor = 'pointer';
        hitArea.dataset.note = note;

        this.setupElementEvents(hitArea, note);
        stringElement.appendChild(hitArea);
      }

      stringsContainer.appendChild(stringElement);
    });

    violinBody.appendChild(stringsContainer);
    this.container.appendChild(violinBody);
  }

  calculateViolinNote(baseNote, position) {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const noteName = baseNote.slice(0, -1);
    const octave = parseInt(baseNote.slice(-1));

    let noteIndex = notes.indexOf(noteName);
    noteIndex = (noteIndex + position) % 12;

    const newOctave = octave + Math.floor((notes.indexOf(noteName) + position) / 12);

    return notes[noteIndex] + newOctave;
  }

  setupKeyboardEvents() {
    this._keydownHandler = (e) => {
      if (e.repeat) {
        return;
      }

      const note = this.keyboardMapping[e.key.toLowerCase()];
      if (note) {
        e.preventDefault();
        this.audio.playNote(note);
      }
    };

    this._keyupHandler = (e) => {
      const note = this.keyboardMapping[e.key.toLowerCase()];
      if (note) {
        e.preventDefault();
        this.audio.stopNote(note);
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
