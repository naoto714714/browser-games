class GuitarAudio extends PianoAudio {
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

    const lowpass = this.audioContext.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(2000, now);
    lowpass.Q.setValueAtTime(1, now);

    osc1.connect(lowpass);
    lowpass.connect(fundamentalGain);
    fundamentalGain.gain.setValueAtTime(0.3 * velocity, now);
    oscillators.push(osc1);
    gains.push(fundamentalGain);

    const harmonics = [
      { mult: 2, gain: 0.15, detune: 5 },
      { mult: 3, gain: 0.1, detune: -5 },
      { mult: 4, gain: 0.05, detune: 10 },
    ];

    harmonics.forEach(harmonic => {
      const gain = this.audioContext.createGain();
      const osc = this.audioContext.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(frequency * harmonic.mult, now);
      osc.detune.setValueAtTime(harmonic.detune, now);
      osc.connect(gain);
      gain.gain.setValueAtTime(harmonic.gain * velocity, now);
      oscillators.push(osc);
      gains.push(gain);
    });

    const envelope = this.audioContext.createGain();
    envelope.gain.setValueAtTime(0, now);
    envelope.gain.linearRampToValueAtTime(1, now + 0.002);
    envelope.gain.exponentialRampToValueAtTime(0.5, now + 0.05);
    envelope.gain.exponentialRampToValueAtTime(0.3, now + 0.2);

    gains.forEach(gain => {
      gain.connect(envelope);
    });

    envelope.connect(this.masterGain);
    envelope.connect(this.reverb);

    oscillators.forEach(osc => osc.start(now));

    this.activeNotes.set(note, { oscillators, envelope, gains });
  }
}

class Guitar extends Instrument {
  constructor(container, audio) {
    super(container, new GuitarAudio());
    this.strings = ['E4', 'B3', 'G3', 'D3', 'A2', 'E2'];
    this.frets = 12;
    this.stringElements = [];

    this.createGuitarNeck();
  }

  createGuitarNeck() {
    for (let fret = 0; fret <= this.frets; fret++) {
      const fretDiv = document.createElement('div');
      fretDiv.className = 'guitar-fret';

      this.strings.forEach((openString, stringIndex) => {
        const stringDiv = document.createElement('div');
        stringDiv.className = 'guitar-string';
        stringDiv.style.top = `${stringIndex * 40}px`;

        const noteName = this.calculateNote(openString, fret);
        stringDiv.dataset.note = noteName;
        stringDiv.dataset.string = stringIndex;
        stringDiv.dataset.fret = fret;

        this.setupElementEvents(stringDiv, noteName);
        fretDiv.appendChild(stringDiv);
        this.stringElements.push(stringDiv);
      });

      this.container.appendChild(fretDiv);
    }
  }

  calculateNote(openString, fret) {
    const notes = [
      'C',
      'C#',
      'D',
      'D#',
      'E',
      'F',
      'F#',
      'G',
      'G#',
      'A',
      'A#',
      'B',
    ];
    const baseNote = openString.slice(0, -1);
    const baseOctave = parseInt(openString.slice(-1));

    let noteIndex = notes.indexOf(baseNote);
    noteIndex = (noteIndex + fret) % 12;

    const octave =
      baseOctave + Math.floor((notes.indexOf(baseNote) + fret) / 12);

    return notes[noteIndex] + octave;
  }
}
