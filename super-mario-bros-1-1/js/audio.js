// 音響管理クラス（Web Audio API使用）
class AudioManager {
  constructor() {
    this.audioContext = null;
    this.sounds = {};
    this.musicVolume = 0.5;
    this.sfxVolume = 0.7;
    this.enabled = true;

    this.initAudioContext();
    this.createSounds();
  }

  // AudioContextを初期化
  initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported');
      this.enabled = false;
    }
  }

  // 音源を作成（プロシージャル生成）
  createSounds() {
    if (!this.enabled) {
      return;
    }

    // ジャンプ音
    this.sounds.jump = this.createTone(440, 0.1, 'square');

    // コイン取得音
    this.sounds.coin = this.createTone(1000, 0.2, 'sine');

    // 敵を踏む音
    this.sounds.stomp = this.createTone(200, 0.15, 'square');

    // ブロック破壊音
    this.sounds.break = this.createNoise(0.1);

    // パワーアップ音
    this.sounds.powerUp = this.createPowerUpSound();

    // 死亡音
    this.sounds.die = this.createDieSound();

    // 1UP音
    this.sounds.oneUp = this.createOneUpSound();
  }

  // トーン音を生成
  createTone(frequency, duration, waveType = 'sine') {
    return () => {
      if (!this.enabled || !this.audioContext) {
        return;
      }

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.setValueAtTime(
        frequency,
        this.audioContext.currentTime
      );
      oscillator.type = waveType;

      gainNode.gain.setValueAtTime(
        this.sfxVolume,
        this.audioContext.currentTime
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        this.audioContext.currentTime + duration
      );

      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + duration);
    };
  }

  // ノイズ音を生成
  createNoise(duration) {
    return () => {
      if (!this.enabled || !this.audioContext) {
        return;
      }

      const bufferSize = this.audioContext.sampleRate * duration;
      const buffer = this.audioContext.createBuffer(
        1,
        bufferSize,
        this.audioContext.sampleRate
      );
      const output = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();

      source.buffer = buffer;
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      gainNode.gain.setValueAtTime(
        this.sfxVolume * 0.3,
        this.audioContext.currentTime
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        this.audioContext.currentTime + duration
      );

      source.start();
    };
  }

  // パワーアップ音を生成
  createPowerUpSound() {
    return () => {
      if (!this.enabled || !this.audioContext) {
        return;
      }

      const frequencies = [523, 659, 784, 1047]; // C, E, G, C
      const duration = 0.15;

      frequencies.forEach((freq, index) => {
        setTimeout(() => {
          this.createTone(freq, duration, 'square')();
        }, index * 100);
      });
    };
  }

  // 死亡音を生成
  createDieSound() {
    return () => {
      if (!this.enabled || !this.audioContext) {
        return;
      }

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        110,
        this.audioContext.currentTime + 1
      );
      oscillator.type = 'sawtooth';

      gainNode.gain.setValueAtTime(
        this.sfxVolume,
        this.audioContext.currentTime
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        this.audioContext.currentTime + 1
      );

      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + 1);
    };
  }

  // 1UP音を生成
  createOneUpSound() {
    return () => {
      if (!this.enabled || !this.audioContext) {
        return;
      }

      const frequencies = [523, 659, 784, 1047, 1319]; // C, E, G, C, E
      const duration = 0.12;

      frequencies.forEach((freq, index) => {
        setTimeout(() => {
          this.createTone(freq, duration, 'sine')();
        }, index * 80);
      });
    };
  }

  // 音を再生
  playSound(soundName) {
    if (!this.enabled || !this.sounds[soundName]) {
      return;
    }

    // AudioContextがサスペンド状態の場合は再開
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    this.sounds[soundName]();
  }

  // BGM（簡易版）
  playBGM() {
    if (!this.enabled || !this.audioContext) {
      return;
    }

    // マリオのメインテーマの一部（プロシージャル）
    const melody = [
      659, 659, 0, 659, 0, 523, 659, 0, 784, 0, 0, 392, 0, 0, 523, 0, 0, 392, 0,
      0, 330, 0, 0, 440, 0, 494, 0, 466, 0, 440, 0, 392, 659, 784, 880, 0, 698,
      784, 0, 659, 0, 523, 587, 523,
    ];

    let index = 0;
    const playNote = () => {
      if (index >= melody.length) {
        index = 0; // ループ
      }

      const frequency = melody[index];
      if (frequency > 0) {
        this.createTone(frequency, 0.3, 'square')();
      }

      index++;
      setTimeout(playNote, 200);
    };

    if (this.musicEnabled) {
      playNote();
    }
  }

  // BGM停止
  stopBGM() {
    this.musicEnabled = false;
  }

  // ボリューム設定
  setMusicVolume(volume) {
    this.musicVolume = Utils.clamp(volume, 0, 1);
  }

  setSFXVolume(volume) {
    this.sfxVolume = Utils.clamp(volume, 0, 1);
  }

  // 音響を有効/無効
  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) {
      this.stopBGM();
    }
  }

  // 音響システムの状態を取得
  getStatus() {
    return {
      enabled: this.enabled,
      contextState: this.audioContext?.state || 'none',
      musicVolume: this.musicVolume,
      sfxVolume: this.sfxVolume,
    };
  }

  // ユーザーアクションで音響を開始（Chromeの自動再生ポリシー対応）
  enableAudio() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume().then(() => {
        console.log('Audio context resumed');
      });
    }
  }

  // 効果音のエイリアス
  playJump() {
    this.playSound('jump');
  }
  playCoin() {
    this.playSound('coin');
  }
  playStomp() {
    this.playSound('stomp');
  }
  playBreak() {
    this.playSound('break');
  }
  playPowerUp() {
    this.playSound('powerUp');
  }
  playDie() {
    this.playSound('die');
  }
  playOneUp() {
    this.playSound('oneUp');
  }
}
