class PianoAudio {
  constructor() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = 0.3;
    this.masterGain.connect(this.audioContext.destination);

    this.reverb = this.createReverb();
    this.reverb.connect(this.masterGain);

    this.activeNotes = new Map();
  }

  createReverb() {
    const convolver = this.audioContext.createConvolver();
    const reverbTime = 2;
    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * reverbTime;
    const impulse = this.audioContext.createBuffer(2, length, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
      }
    }

    convolver.buffer = impulse;

    const reverbGain = this.audioContext.createGain();
    reverbGain.gain.value = 0.1;
    convolver.connect(reverbGain);

    return reverbGain;
  }

  noteToFrequency(note) {
    const notes = {
      C: -9,
      'C#': -8,
      D: -7,
      'D#': -6,
      E: -5,
      F: -4,
      'F#': -3,
      G: -2,
      'G#': -1,
      A: 0,
      'A#': 1,
      B: 2,
    };

    const noteName = note.slice(0, -1);
    const octave = parseInt(note.slice(-1));
    const semitonesFromA4 = notes[noteName] + (octave - 4) * 12;

    return 440 * Math.pow(2, semitonesFromA4 / 12);
  }

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
    osc1.connect(fundamentalGain);
    fundamentalGain.gain.setValueAtTime(0.6 * velocity, now);
    oscillators.push(osc1);
    gains.push(fundamentalGain);

    const harmonics = [
      { mult: 2, gain: 0.3 },
      { mult: 3, gain: 0.15 },
      { mult: 4, gain: 0.08 },
      { mult: 5, gain: 0.05 },
      { mult: 6, gain: 0.03 },
      { mult: 7, gain: 0.02 },
      { mult: 8, gain: 0.01 },
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
    envelope.gain.linearRampToValueAtTime(1, now + 0.01);
    envelope.gain.exponentialRampToValueAtTime(0.3, now + 0.1);
    envelope.gain.exponentialRampToValueAtTime(0.2, now + 0.5);

    gains.forEach((gain) => {
      gain.connect(envelope);
    });

    envelope.connect(this.masterGain);
    envelope.connect(this.reverb);

    oscillators.forEach((osc) => osc.start(now));

    this.activeNotes.set(note, { oscillators, envelope, gains });
  }

  stopNote(note) {
    const noteData = this.activeNotes.get(note);
    if (!noteData) {
      return;
    }

    const now = this.audioContext.currentTime;
    const { oscillators, envelope } = noteData;

    envelope.gain.cancelScheduledValues(now);
    envelope.gain.setValueAtTime(envelope.gain.value, now);
    envelope.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    oscillators.forEach((osc) => {
      osc.stop(now + 0.5);
    });

    this.activeNotes.delete(note);

    setTimeout(() => {
      envelope.disconnect();
    }, 600);
  }
}
