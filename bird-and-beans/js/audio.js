export class AudioManager {
  constructor() {
    this.sounds = {};
    this.enabled = true;
    this.createSounds();
  }

  createSounds() {
    // Web Audio APIを使用して簡単な効果音を生成
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

    this.sounds = {
      catch: () => this.playTone(800, 0.1, 'sine'),
      hole: () => this.playTone(200, 0.2, 'square'),
      fill: () => this.playTone(600, 0.15, 'triangle'),
      gameOver: () => this.playTone(150, 0.5, 'sawtooth'),
      powerUp: () => this.playSequence([400, 600, 800], 0.1),
    };
  }

  playTone(frequency, duration, type = 'sine') {
    if (!this.enabled) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (e) {
      console.error('Audio playback error:', e);
    }
  }

  playSequence(frequencies, duration) {
    if (!this.enabled) return;

    frequencies.forEach((freq, index) => {
      setTimeout(
        () => {
          this.playTone(freq, duration, 'sine');
        },
        index * duration * 1000,
      );
    });
  }

  play(soundName) {
    if (this.sounds[soundName]) {
      this.sounds[soundName]();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
  }
}
