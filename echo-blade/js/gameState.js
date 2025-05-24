// ゲーム状態管理システム

import { GAME_CONFIG } from './utils.js';

// ゲーム状態の列挙
const GAME_STATES = {
    MENU: 'menu',
    INSTRUCTIONS: 'instructions',
    SETTINGS: 'settings',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'game_over'
};

class GameState {
    constructor() {
        this.currentState = GAME_STATES.MENU;
        this.previousState = null;
        this.transitionTime = 0;
        this.maxTransitionTime = 0.3;
        this.isTransitioning = false;

        // ゲームプレイ状態
        this.gameTime = 0;
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.enemiesKilled = 0;
        this.echoKills = 0;
        this.simultaneousKills = 0;

        // 難易度設定
        this.difficulty = 'normal';
        this.settings = {
            volume: 0.7,
            sfxVolume: 0.8,
            showFPS: false,
            enableParticles: true,
            enableScreenEffects: true,
            keyBindings: {
                // デフォルトキーバインド
                moveLeft: ['ArrowLeft', 'KeyA'],
                moveRight: ['ArrowRight', 'KeyD'],
                jump: ['ArrowUp', 'KeyW', 'Space'],
                slash: ['KeyZ'],
                dash: ['KeyX'],
                pause: ['KeyP', 'Escape']
            }
        };

        // 統計情報
        this.statistics = {
            totalGamesPlayed: 0,
            bestScore: 0,
            bestCombo: 0,
            totalEnemiesKilled: 0,
            totalEchoKills: 0,
            averageScore: 0,
            playtime: 0
        };

        // パフォーマンス測定
        this.performanceMetrics = {
            fps: 60,
            frameTime: 16.67,
            updateTime: 0,
            renderTime: 0,
            particleCount: 0
        };

        this.loadSettings();
    }

    // 状態変更
    changeState(newState, immediate = false) {
        if (this.currentState === newState || this.isTransitioning) {
            return;
        }

        this.previousState = this.currentState;
        this.currentState = newState;

        if (immediate) {
            this.transitionTime = this.maxTransitionTime;
            this.isTransitioning = false;
        } else {
            this.transitionTime = 0;
            this.isTransitioning = true;
        }

        this.onStateChange();
    }

    onStateChange() {
        // 状態変更時の処理
        switch (this.currentState) {
            case GAME_STATES.PLAYING:
                this.startGame();
                break;
            case GAME_STATES.GAME_OVER:
                this.endGame();
                break;
            case GAME_STATES.MENU:
                this.resetGame();
                break;
        }
    }

    update(deltaTime) {
        // トランジション更新
        if (this.isTransitioning) {
            this.transitionTime += deltaTime;
            if (this.transitionTime >= this.maxTransitionTime) {
                this.transitionTime = this.maxTransitionTime;
                this.isTransitioning = false;
            }
        }

        // ゲーム時間更新
        if (this.currentState === GAME_STATES.PLAYING) {
            this.gameTime += deltaTime;
        }
    }

    // ゲーム開始
    startGame() {
        this.gameTime = 0;
        this.score = 0;
        this.combo = 0;
        this.enemiesKilled = 0;
        this.echoKills = 0;
        this.simultaneousKills = 0;
    }

    // ゲーム終了
    endGame() {
        // 統計情報更新
        this.statistics.totalGamesPlayed++;
        this.statistics.totalEnemiesKilled += this.enemiesKilled;
        this.statistics.totalEchoKills += this.echoKills;
        this.statistics.playtime += this.gameTime;

        if (this.score > this.statistics.bestScore) {
            this.statistics.bestScore = this.score;
        }

        if (this.maxCombo > this.statistics.bestCombo) {
            this.statistics.bestCombo = this.maxCombo;
        }

        // 平均スコア計算
        this.statistics.averageScore = Math.floor(
            (this.statistics.averageScore * (this.statistics.totalGamesPlayed - 1) + this.score) /
            this.statistics.totalGamesPlayed
        );

        this.saveSettings();
    }

    // ゲームリセット
    resetGame() {
        this.gameTime = 0;
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.enemiesKilled = 0;
        this.echoKills = 0;
        this.simultaneousKills = 0;
    }

    // スコア管理
    addScore(points, source = 'enemy') {
        const baseScore = points;
        let multiplier = 1;

        // コンボ倍率
        if (this.combo > 1) {
            multiplier = 1 + (this.combo - 1) * 0.1;
        }

        // ソース別ボーナス
        switch (source) {
            case 'echo':
                multiplier *= 1.5;
                this.echoKills++;
                break;
            case 'simultaneous':
                multiplier *= 2.0;
                this.simultaneousKills++;
                break;
        }

        // 難易度ボーナス
        switch (this.difficulty) {
            case 'easy':
                multiplier *= 0.8;
                break;
            case 'hard':
                multiplier *= 1.2;
                break;
        }

        const finalScore = Math.floor(baseScore * multiplier);
        this.score += finalScore;

        return finalScore;
    }

    addCombo() {
        this.combo++;
        if (this.combo > this.maxCombo) {
            this.maxCombo = this.combo;
        }
    }

    resetCombo() {
        this.combo = 0;
    }

    addEnemyKill() {
        this.enemiesKilled++;
    }

    // 時間管理
    getRemainingTime() {
        return Math.max(0, GAME_CONFIG.GAME_DURATION - this.gameTime);
    }

    getGameProgress() {
        return Math.min(1, this.gameTime / GAME_CONFIG.GAME_DURATION);
    }

    isGameTimeUp() {
        return this.gameTime >= GAME_CONFIG.GAME_DURATION;
    }

    // 難易度設定
    setDifficulty(difficulty) {
        if (['easy', 'normal', 'hard'].includes(difficulty)) {
            this.difficulty = difficulty;
            this.saveSettings();
        }
    }

    getDifficultyModifiers() {
        switch (this.difficulty) {
            case 'easy':
                return {
                    echoSelfDamage: false,
                    enemySpawnRate: 0.8,
                    enemySpeed: 0.9,
                    echoDelay: 2.5
                };
            case 'hard':
                return {
                    echoSelfDamage: true,
                    enemySpawnRate: 1.3,
                    enemySpeed: 1.2,
                    echoDelay: 1.5
                };
            default: // normal
                return {
                    echoSelfDamage: true,
                    enemySpawnRate: 1.0,
                    enemySpeed: 1.0,
                    echoDelay: 2.0
                };
        }
    }

    // 設定管理
    updateSetting(key, value) {
        if (key in this.settings) {
            this.settings[key] = value;
            this.saveSettings();
        }
    }

    updateKeyBinding(action, keys) {
        if (action in this.settings.keyBindings) {
            this.settings.keyBindings[action] = Array.isArray(keys) ? keys : [keys];
            this.saveSettings();
        }
    }

    saveSettings() {
        try {
            const saveData = {
                settings: this.settings,
                statistics: this.statistics,
                difficulty: this.difficulty
            };
            localStorage.setItem('echo-blade-save', JSON.stringify(saveData));
        } catch (error) {
            console.warn('設定の保存に失敗しました:', error);
        }
    }

    loadSettings() {
        try {
            const saveData = localStorage.getItem('echo-blade-save');
            if (saveData) {
                const data = JSON.parse(saveData);

                if (data.settings) {
                    this.settings = { ...this.settings, ...data.settings };
                }

                if (data.statistics) {
                    this.statistics = { ...this.statistics, ...data.statistics };
                }

                if (data.difficulty) {
                    this.difficulty = data.difficulty;
                }
            }
        } catch (error) {
            console.warn('設定の読み込みに失敗しました:', error);
        }
    }

    // パフォーマンス測定
    updatePerformanceMetrics(metrics) {
        this.performanceMetrics = { ...this.performanceMetrics, ...metrics };
    }

    // UI状態判定
    isInMenu() {
        return this.currentState === GAME_STATES.MENU;
    }

    isPlaying() {
        return this.currentState === GAME_STATES.PLAYING;
    }

    isPaused() {
        return this.currentState === GAME_STATES.PAUSED;
    }

    isGameOver() {
        return this.currentState === GAME_STATES.GAME_OVER;
    }

    isInInstructions() {
        return this.currentState === GAME_STATES.INSTRUCTIONS;
    }

    isInSettings() {
        return this.currentState === GAME_STATES.SETTINGS;
    }

    // トランジション進行度取得
    getTransitionProgress() {
        return this.transitionTime / this.maxTransitionTime;
    }

    // デバッグ情報
    getDebugInfo() {
        return {
            state: this.currentState,
            gameTime: this.gameTime.toFixed(2),
            score: this.score,
            combo: this.combo,
            enemiesKilled: this.enemiesKilled,
            fps: this.performanceMetrics.fps.toFixed(1),
            particleCount: this.performanceMetrics.particleCount
        };
    }
}

export { GameState, GAME_STATES };
