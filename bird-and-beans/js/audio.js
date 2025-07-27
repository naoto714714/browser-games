import { AUDIO_GAIN, AUDIO_FADE_TIME, AUDIO_FREQUENCIES, AUDIO_DURATIONS, AUDIO_TYPES } from './config.js';

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
      catch: () => this.playTone(AUDIO_FREQUENCIES.CATCH, AUDIO_DURATIONS.CATCH, AUDIO_TYPES.CATCH),
      hole: () => this.playTone(AUDIO_FREQUENCIES.HOLE, AUDIO_DURATIONS.HOLE, AUDIO_TYPES.HOLE),
      fill: () => this.playTone(AUDIO_FREQUENCIES.FILL, AUDIO_DURATIONS.FILL, AUDIO_TYPES.FILL),
      gameOver: () => this.playTone(AUDIO_FREQUENCIES.GAME_OVER, AUDIO_DURATIONS.GAME_OVER, AUDIO_TYPES.GAME_OVER),
      powerUp: () => this.playSequence(AUDIO_FREQUENCIES.POWER_UP, AUDIO_DURATIONS.POWER_UP),
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

      gainNode.gain.setValueAtTime(AUDIO_GAIN, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(AUDIO_FADE_TIME, this.audioContext.currentTime + duration);

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
