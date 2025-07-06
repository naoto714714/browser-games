class DrumsAudio {
  constructor() {
    this.audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = 0.8;
    this.masterGain.connect(this.audioContext.destination);
  }

  playKick() {
    const now = this.audioContext.currentTime;

    const osc = this.audioContext.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.05);

    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.5);
  }

  playSnare() {
    const now = this.audioContext.currentTime;

    const noise = this.audioContext.createBufferSource();
    const noiseBuffer = this.audioContext.createBuffer(
      1,
      this.audioContext.sampleRate * 0.2,
      this.audioContext.sampleRate
    );
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseData.length; i++) {
      noiseData[i] = Math.random() * 2 - 1;
    }
    noise.buffer = noiseBuffer;

    const noiseFilter = this.audioContext.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(1000, now);

    const noiseGain = this.audioContext.createGain();
    noiseGain.gain.setValueAtTime(0.7, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);

    const osc = this.audioContext.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, now);

    const oscGain = this.audioContext.createGain();
    oscGain.gain.setValueAtTime(0.5, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    osc.connect(oscGain);

    noiseGain.connect(this.masterGain);
    oscGain.connect(this.masterGain);

    noise.start(now);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  playHihat(open = false) {
    const now = this.audioContext.currentTime;

    const noise = this.audioContext.createBufferSource();
    const duration = open ? 0.3 : 0.05;
    const noiseBuffer = this.audioContext.createBuffer(
      1,
      this.audioContext.sampleRate * duration,
      this.audioContext.sampleRate
    );
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseData.length; i++) {
      noiseData[i] = Math.random() * 2 - 1;
    }
    noise.buffer = noiseBuffer;

    const bandpass = this.audioContext.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(10000, now);
    bandpass.Q.setValueAtTime(0.6, now);

    const highpass = this.audioContext.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(7000, now);

    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    noise.connect(bandpass);
    bandpass.connect(highpass);
    highpass.connect(gain);
    gain.connect(this.masterGain);

    noise.start(now);
  }

  playTom(pitch = 'mid') {
    const now = this.audioContext.currentTime;
    const frequencies = { high: 250, mid: 150, low: 80 };
    const frequency = frequencies[pitch] || frequencies.mid;

    const osc = this.audioContext.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, now);
    osc.frequency.exponentialRampToValueAtTime(frequency * 0.8, now + 0.1);

    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.3);

    const click = this.audioContext.createBufferSource();
    const clickBuffer = this.audioContext.createBuffer(
      1,
      this.audioContext.sampleRate * 0.005,
      this.audioContext.sampleRate
    );
    const clickData = clickBuffer.getChannelData(0);
    for (let i = 0; i < clickData.length; i++) {
      clickData[i] = (Math.random() * 2 - 1) * (1 - i / clickData.length);
    }
    click.buffer = clickBuffer;

    const clickGain = this.audioContext.createGain();
    clickGain.gain.setValueAtTime(0.5, now);

    click.connect(clickGain);
    clickGain.connect(this.masterGain);
    click.start(now);
  }
}

class Drums extends Instrument {
  constructor(container, audio) {
    super(container, audio);
    this.drumsAudio = new DrumsAudio();

    this.drumConfig = [
      {
        type: 'hihat',
        label: 'Hi-Hat',
        key: 'q',
        method: () => this.drumsAudio.playHihat(),
      },
      {
        type: 'snare',
        label: 'Snare',
        key: 'w',
        method: () => this.drumsAudio.playSnare(),
      },
      {
        type: 'tom1',
        label: 'Tom 1',
        key: 'e',
        method: () => this.drumsAudio.playTom('high'),
      },
      {
        type: 'kick',
        label: 'Kick',
        key: 'space',
        method: () => this.drumsAudio.playKick(),
      },
      {
        type: 'tom2',
        label: 'Tom 2',
        key: 'a',
        method: () => this.drumsAudio.playTom('mid'),
      },
      {
        type: 'tom3',
        label: 'Tom 3',
        key: 's',
        method: () => this.drumsAudio.playTom('low'),
      },
    ];

    this.createDrumKit();
    this.setupKeyboardEvents();
  }

  createDrumKit() {
    const drumsContainer = document.createElement('div');
    drumsContainer.className = 'drums-container';

    this.drumConfig.forEach(drum => {
      const drumElement = document.createElement('div');
      drumElement.className = `drum ${drum.type}`;
      drumElement.dataset.type = drum.type;

      const label = document.createElement('div');
      label.className = 'drum-label';
      label.textContent = `${drum.label} (${drum.key.toUpperCase()})`;

      drumElement.appendChild(label);

      drumElement.addEventListener('mousedown', e => {
        e.preventDefault();
        this.playDrum(drumElement, drum.method);
      });

      drumElement.addEventListener('mouseup', () => {
        this.stopDrum(drumElement);
      });

      drumElement.addEventListener('mouseleave', () => {
        this.stopDrum(drumElement);
      });

      drumElement.addEventListener('touchstart', e => {
        e.preventDefault();
        this.playDrum(drumElement, drum.method);
      });

      drumElement.addEventListener('touchend', e => {
        e.preventDefault();
        this.stopDrum(drumElement);
      });

      drumsContainer.appendChild(drumElement);
    });

    this.container.appendChild(drumsContainer);
  }

  playDrum(element, method) {
    element.classList.add('active');
    method();
  }

  stopDrum(element) {
    setTimeout(() => {
      element.classList.remove('active');
    }, 100);
  }

  setupKeyboardEvents() {
    this._keydownHandler = e => {
      if (e.repeat) {
        return;
      }

      const key = e.key.toLowerCase();
      const drum = this.drumConfig.find(
        d => d.key === key || (key === ' ' && d.key === 'space')
      );

      if (drum) {
        e.preventDefault();
        const element = this.container.querySelector(`.drum.${drum.type}`);
        if (element) {
          this.playDrum(element, drum.method);
        }
      }
    };

    this._keyupHandler = e => {
      const key = e.key.toLowerCase();
      const drum = this.drumConfig.find(
        d => d.key === key || (key === ' ' && d.key === 'space')
      );

      if (drum) {
        e.preventDefault();
        const element = this.container.querySelector(`.drum.${drum.type}`);
        if (element) {
          this.stopDrum(element);
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
