// オーディオ管理クラス
class AudioManager {
    constructor() {
        this.audioContext = null;
        this.sounds = new Map();
        this.musicVolume = 0.7;
        this.sfxVolume = 0.8;
        this.initialized = false;

        // BGMトラック
        this.bgmElement = null;
        this.currentBGM = null;

        // Web Audio APIノード
        this.musicGain = null;
        this.sfxGain = null;
        this.masterGain = null;

        // サウンドプール（重複再生対応）
        this.soundPools = new Map();

        this.init();
    }

    async init() {
        try {
            // Web Audio APIの初期化
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // ゲインノード作成
            this.masterGain = this.audioContext.createGain();
            this.musicGain = this.audioContext.createGain();
            this.sfxGain = this.audioContext.createGain();

            // ゲインノード接続
            this.musicGain.connect(this.masterGain);
            this.sfxGain.connect(this.masterGain);
            this.masterGain.connect(this.audioContext.destination);

            // 初期音量設定
            this.setMusicVolume(this.musicVolume);
            this.setSFXVolume(this.sfxVolume);

            this.initialized = true;
            console.log('AudioManager initialized');

        } catch (error) {
            console.warn('Failed to initialize AudioManager:', error);
        }
    }

    // オーディオコンテキスト再開（ユーザー操作後）
    async resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }

    // BGM制御
    playBGM(url, loop = true) {
        if (!this.initialized) return;

        this.stopBGM();

        this.bgmElement = new Audio(url);
        this.bgmElement.loop = loop;
        this.bgmElement.volume = this.musicVolume;

        const promise = this.bgmElement.play();
        if (promise) {
            promise.catch(error => {
                console.warn('BGM play failed:', error);
            });
        }

        this.currentBGM = url;
    }

    stopBGM() {
        if (this.bgmElement) {
            this.bgmElement.pause();
            this.bgmElement.currentTime = 0;
            this.bgmElement = null;
        }
        this.currentBGM = null;
    }

    pauseBGM() {
        if (this.bgmElement) {
            this.bgmElement.pause();
        }
    }

    resumeBGM() {
        if (this.bgmElement) {
            const promise = this.bgmElement.play();
            if (promise) {
                promise.catch(error => {
                    console.warn('BGM resume failed:', error);
                });
            }
        }
    }

    // 音量制御
    setMusicVolume(volume) {
        this.musicVolume = Utils.clamp(volume, 0, 1);
        if (this.musicGain) {
            this.musicGain.gain.value = this.musicVolume;
        }
        if (this.bgmElement) {
            this.bgmElement.volume = this.musicVolume;
        }
    }

    setSFXVolume(volume) {
        this.sfxVolume = Utils.clamp(volume, 0, 1);
        if (this.sfxGain) {
            this.sfxGain.gain.value = this.sfxVolume;
        }
    }

    // 効果音生成（プロシージャル）
    createSlashSound() {
        if (!this.initialized) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();

        // オシレーターの設定
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.1);

        // フィルターの設定
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(400, this.audioContext.currentTime);

        // ゲインの設定
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);

        // ノード接続
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.sfxGain);

        // 再生
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.15);
    }

    createEchoSound() {
        if (!this.initialized) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const delay = this.audioContext.createDelay();
        const feedback = this.audioContext.createGain();

        // オシレーターの設定
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(150, this.audioContext.currentTime + 0.2);

        // ディレイの設定
        delay.delayTime.setValueAtTime(0.05, this.audioContext.currentTime);
        feedback.gain.setValueAtTime(0.3, this.audioContext.currentTime);

        // ゲインの設定
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.25);

        // ノード接続
        oscillator.connect(gainNode);
        gainNode.connect(delay);
        delay.connect(feedback);
        feedback.connect(delay);
        delay.connect(this.sfxGain);

        // 再生
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.3);
    }

    createEnemyDeathSound() {
        if (!this.initialized) return;

        const oscillator1 = this.audioContext.createOscillator();
        const oscillator2 = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();

        // オシレーター1の設定
        oscillator1.type = 'square';
        oscillator1.frequency.setValueAtTime(400, this.audioContext.currentTime);
        oscillator1.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.3);

        // オシレーター2の設定
        oscillator2.type = 'sawtooth';
        oscillator2.frequency.setValueAtTime(200, this.audioContext.currentTime);
        oscillator2.frequency.exponentialRampToValueAtTime(25, this.audioContext.currentTime + 0.3);

        // フィルターの設定
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, this.audioContext.currentTime);
        filter.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.3);

        // ゲインの設定
        gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

        // ノード接続
        oscillator1.connect(gainNode);
        oscillator2.connect(gainNode);
        gainNode.connect(filter);
        filter.connect(this.sfxGain);

        // 再生
        oscillator1.start();
        oscillator2.start();
        oscillator1.stop(this.audioContext.currentTime + 0.3);
        oscillator2.stop(this.audioContext.currentTime + 0.3);
    }

    createJumpSound() {
        if (!this.initialized) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        // オシレーターの設定
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.1);

        // ゲインの設定
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);

        // ノード接続
        oscillator.connect(gainNode);
        gainNode.connect(this.sfxGain);

        // 再生
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.15);
    }

    createDashSound() {
        if (!this.initialized) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();

        // オシレーターの設定
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(1200, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.08);

        // フィルターの設定
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800, this.audioContext.currentTime);

        // ゲインの設定
        gainNode.gain.setValueAtTime(0.25, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

        // ノード接続
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.sfxGain);

        // 再生
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }

    createTimeOrbSound() {
        if (!this.initialized) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        // オシレーターの設定
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime + 0.05);
        oscillator.frequency.setValueAtTime(1200, this.audioContext.currentTime + 0.1);

        // ゲインの設定
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);

        // ノード接続
        oscillator.connect(gainNode);
        gainNode.connect(this.sfxGain);

        // 再生
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.2);
    }

    createHitSound() {
        if (!this.initialized) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();

        // オシレーターの設定
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.2);

        // フィルターの設定
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(500, this.audioContext.currentTime);

        // ゲインの設定
        gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.25);

        // ノード接続
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.sfxGain);

        // 再生
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.25);
    }

    createComboSound(comboCount) {
        if (!this.initialized) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        // コンボ数に応じて音程を上げる
        const baseFreq = 400 + (comboCount * 50);

        // オシレーターの設定
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(baseFreq, this.audioContext.currentTime);
        oscillator.frequency.setValueAtTime(baseFreq * 1.5, this.audioContext.currentTime + 0.1);

        // ゲインの設定
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);

        // ノード接続
        oscillator.connect(gainNode);
        gainNode.connect(this.sfxGain);

        // 再生
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.15);
    }

    createBossDeathSound() {
        if (!this.initialized) return;

        // 複数のオシレーターで豪華な音を作成
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                const filter = this.audioContext.createBiquadFilter();

                // オシレーターの設定
                oscillator.type = i % 2 === 0 ? 'square' : 'sawtooth';
                const freq = 800 - (i * 100);
                oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(freq * 0.1, this.audioContext.currentTime + 0.8);

                // フィルターの設定
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(2000, this.audioContext.currentTime);
                filter.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.8);

                // ゲインの設定
                gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.8);

                // ノード接続
                oscillator.connect(filter);
                filter.connect(gainNode);
                gainNode.connect(this.sfxGain);

                // 再生
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + 0.8);
            }, i * 50);
        }
    }

    // 効果音の簡単な再生メソッド
    playSound(soundName, ...args) {
        switch (soundName) {
            case 'slash':
                this.createSlashSound();
                break;
            case 'echo':
                this.createEchoSound();
                break;
            case 'enemyDeath':
                this.createEnemyDeathSound();
                break;
            case 'jump':
                this.createJumpSound();
                break;
            case 'dash':
                this.createDashSound();
                break;
            case 'timeOrb':
                this.createTimeOrbSound();
                break;
            case 'hit':
                this.createHitSound();
                break;
            case 'combo':
                this.createComboSound(args[0] || 1);
                break;
            case 'bossStart':
                this.createBossDeathSound();
                break;
            case 'bossDeath':
                this.createBossDeathSound();
                break;
        }
    }

    // 全音声停止
    stopAll() {
        this.stopBGM();
        // Web Audio APIで作成した音は自動的に停止される
    }

    // 設定の保存と読み込み
    saveSettings() {
        Utils.saveToLocalStorage('audioSettings', {
            musicVolume: this.musicVolume,
            sfxVolume: this.sfxVolume
        });
    }

    loadSettings() {
        const settings = Utils.loadFromLocalStorage('audioSettings', {
            musicVolume: 0.7,
            sfxVolume: 0.8
        });

        this.setMusicVolume(settings.musicVolume);
        this.setSFXVolume(settings.sfxVolume);
    }
}

// グローバルインスタンス
window.audioManager = new AudioManager();
