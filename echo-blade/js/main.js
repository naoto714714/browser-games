// Echo Blade - メインエントリーポイント

import { Game } from './game.js';

class EchoBlade {
    constructor() {
        this.game = null;
        this.canvas = null;
        this.isInitialized = false;

        // 初期化
        this.init();
    }

    async init() {
        try {
            console.log('Echo Blade - 初期化開始');

            // DOM要素取得
            await this.waitForDOM();

            // Canvas設定
            this.setupCanvas();

            // ゲーム初期化
            this.game = new Game(this.canvas);

            // UI表示制御
            this.setupUIControl();

            // ゲーム開始
            this.game.start();

            this.isInitialized = true;
            console.log('Echo Blade - 初期化完了');

        } catch (error) {
            console.error('Echo Blade 初期化エラー:', error);
            this.showError('ゲームの初期化に失敗しました。ページを再読み込みしてください。');
        }
    }

    // DOM読み込み待機
    waitForDOM() {
        return new Promise((resolve) => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve);
            } else {
                resolve();
            }
        });
    }

    // Canvas設定
    setupCanvas() {
        this.canvas = document.getElementById('game-canvas');
        if (!this.canvas) {
            throw new Error('ゲームCanvas要素が見つかりません');
        }

        // Canvas属性設定
        this.canvas.width = 1600;
        this.canvas.height = 900;

        // スタイル設定
        this.canvas.style.display = 'block';
        this.canvas.style.margin = '0 auto';
        this.canvas.style.border = '2px solid #66ccff';
        this.canvas.style.borderRadius = '8px';
        this.canvas.style.backgroundColor = '#101020';

        // フォーカス可能にする
        this.canvas.tabIndex = 0;
        this.canvas.focus();

        console.log('Canvas設定完了');
    }

    // UI表示制御
    setupUIControl() {
        // ゲーム状態に応じてUI要素の表示切り替え
        const gameState = this.game.gameState;

        // 状態変更の監視
        const originalChangeState = gameState.changeState.bind(gameState);
        gameState.changeState = (newState, immediate) => {
            originalChangeState(newState, immediate);
            this.updateUIVisibility(newState);
        };

        // 初期UI表示
        this.updateUIVisibility(gameState.currentState);

        // ESCキーでのゲーム終了確認
        document.addEventListener('keydown', (event) => {
            if (event.code === 'F1') {
                event.preventDefault();
                this.game.toggleDebug();
            }
        });

        // ウィンドウ終了時の確認
        window.addEventListener('beforeunload', (event) => {
            if (this.game && this.game.gameState.isPlaying()) {
                event.preventDefault();
                event.returnValue = 'ゲームが進行中です。終了しますか？';
                return event.returnValue;
            }
        });
    }

    // UI表示更新
    updateUIVisibility(gameState) {
        // メニュー画面
        const menuScreen = document.getElementById('menu-screen');
        if (menuScreen) {
            menuScreen.style.display = gameState === 'menu' ? 'flex' : 'none';
        }

        // 説明画面
        const instructionsScreen = document.getElementById('instructions-screen');
        if (instructionsScreen) {
            instructionsScreen.style.display = gameState === 'instructions' ? 'flex' : 'none';
        }

        // 設定画面
        const settingsScreen = document.getElementById('settings-screen');
        if (settingsScreen) {
            settingsScreen.style.display = gameState === 'settings' ? 'flex' : 'none';
        }

        // ゲームオーバー画面
        const gameOverScreen = document.getElementById('game-over-screen');
        if (gameOverScreen) {
            gameOverScreen.style.display = gameState === 'game_over' ? 'flex' : 'none';

            // スコア表示更新
            if (gameState === 'game_over' && this.game) {
                this.updateGameOverScreen();
            }
        }

        // Canvas表示
        if (this.canvas) {
            const showCanvas = ['playing', 'paused', 'game_over'].includes(gameState);
            this.canvas.style.display = showCanvas ? 'block' : 'none';
        }
    }

    // ゲームオーバー画面更新
    updateGameOverScreen() {
        const gameState = this.game.gameState;

        // 最終スコア
        const scoreElement = document.getElementById('final-score');
        if (scoreElement) {
            scoreElement.textContent = gameState.score.toLocaleString();
        }

        // 最大コンボ
        const comboElement = document.getElementById('final-combo');
        if (comboElement) {
            comboElement.textContent = gameState.maxCombo;
        }

        // 倒した敵数
        const enemiesElement = document.getElementById('enemies-killed');
        if (enemiesElement) {
            enemiesElement.textContent = gameState.enemiesKilled;
        }

        // エコーキル数
        const echoKillsElement = document.getElementById('echo-kills');
        if (echoKillsElement) {
            echoKillsElement.textContent = gameState.echoKills;
        }

        // 最高記録表示
        const bestScoreElement = document.getElementById('best-score');
        if (bestScoreElement) {
            bestScoreElement.textContent = gameState.statistics.bestScore.toLocaleString();
        }

        // パフォーマンス判定
        const performanceElement = document.getElementById('performance-rating');
        if (performanceElement) {
            performanceElement.textContent = this.getPerformanceRating();
        }
    }

    // パフォーマンス判定
    getPerformanceRating() {
        const gameState = this.game.gameState;
        const score = gameState.score;
        const combo = gameState.maxCombo;
        const echoRatio = gameState.enemiesKilled > 0 ? gameState.echoKills / gameState.enemiesKilled : 0;

        if (score >= 10000 && combo >= 15 && echoRatio >= 0.3) {
            return 'S - エコーマスター';
        } else if (score >= 7500 && combo >= 10 && echoRatio >= 0.2) {
            return 'A - 熟練者';
        } else if (score >= 5000 && combo >= 7) {
            return 'B - 上級者';
        } else if (score >= 2500 && combo >= 5) {
            return 'C - 中級者';
        } else if (score >= 1000) {
            return 'D - 初級者';
        } else {
            return 'E - 初心者';
        }
    }

    // エラー表示
    showError(message) {
        // エラー画面要素作成
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #ff3333;
            color: white;
            padding: 20px;
            border-radius: 8px;
            font-family: 'Orbitron', monospace;
            text-align: center;
            z-index: 9999;
            box-shadow: 0 4px 20px rgba(255, 51, 51, 0.5);
        `;

        errorDiv.innerHTML = `
            <h3>エラー</h3>
            <p>${message}</p>
            <button onclick="window.location.reload()" style="
                background: white;
                color: #ff3333;
                border: none;
                padding: 10px 20px;
                border-radius: 4px;
                font-family: 'Orbitron', monospace;
                cursor: pointer;
                margin-top: 10px;
            ">再読み込み</button>
        `;

        document.body.appendChild(errorDiv);
    }

    // ゲーム破棄
    destroy() {
        if (this.game) {
            this.game.stop();
            this.game = null;
        }

        if (this.canvas) {
            this.canvas.remove();
            this.canvas = null;
        }

        this.isInitialized = false;
        console.log('Echo Blade - ゲーム破棄完了');
    }
}

// グローバル変数として定義（デバッグ用）
let echoBlade = null;

// ページ読み込み完了後に自動初期化
document.addEventListener('DOMContentLoaded', () => {
    // 既存インスタンスがあれば破棄
    if (echoBlade) {
        echoBlade.destroy();
    }

    // 新しいインスタンス作成
    echoBlade = new EchoBlade();
});

// ページ離脱時のクリーンアップ
window.addEventListener('beforeunload', () => {
    if (echoBlade) {
        echoBlade.destroy();
    }
});

// エクスポート（モジュールとして使用する場合）
export { EchoBlade };

// デバッグ用グローバル関数
window.toggleDebug = () => {
    if (echoBlade && echoBlade.game) {
        echoBlade.game.toggleDebug();
    }
};

window.getGameState = () => {
    if (echoBlade && echoBlade.game) {
        return echoBlade.game.gameState.getDebugInfo();
    }
    return null;
};

console.log('Echo Blade - メインモジュール読み込み完了');
