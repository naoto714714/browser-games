// 描画システム管理

import { GAME_CONFIG, COLORS } from './utils.js';
import { GAME_STATES } from './gameState.js';

class Renderer {
    constructor(canvas, gameState) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.gameState = gameState;

        // 描画設定
        this.ctx.imageSmoothingEnabled = false;

        // 画面効果
        this.screenEffects = {
            flash: 0,
            shake: { x: 0, y: 0, intensity: 0, decay: 0.95 },
            chromatic: 0,
            blur: 0,
            timeWarpEffect: 0
        };

        // UI要素
        this.ui = {
            fadeAlpha: 0,
            comboAnimation: { scale: 1, alpha: 1, time: 0 },
            scorePopups: [],
            timerWarning: false
        };

        // デバッグ描画
        this.debugMode = false;

        // フォント設定
        this.fonts = {
            ui: '16px Orbitron, monospace',
            title: '32px Orbitron, monospace',
            score: '20px Orbitron, monospace',
            combo: '24px Orbitron, monospace'
        };
    }

    // メイン描画関数
    render(gameObjects, deltaTime) {
        const startTime = performance.now();

        this.clearScreen();
        this.applyScreenEffects();

        // ゲーム状態別描画
        switch (this.gameState.currentState) {
            case GAME_STATES.PLAYING:
            case GAME_STATES.PAUSED:
                this.renderGame(gameObjects, deltaTime);
                break;
            case GAME_STATES.MENU:
                this.renderMenu();
                break;
            case GAME_STATES.INSTRUCTIONS:
                this.renderInstructions();
                break;
            case GAME_STATES.SETTINGS:
                this.renderSettings();
                break;
            case GAME_STATES.GAME_OVER:
                this.renderGameOver();
                break;
        }

        // トランジション効果
        if (this.gameState.isTransitioning) {
            this.renderTransition();
        }

        // デバッグ情報
        if (this.debugMode) {
            this.renderDebugInfo();
        }

        this.updateEffects(deltaTime);

        // 描画時間測定
        const renderTime = performance.now() - startTime;
        this.gameState.updatePerformanceMetrics({ renderTime });
    }

    // 画面クリア
    clearScreen() {
        this.ctx.fillStyle = COLORS.BACKGROUND;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // ゲーム画面描画
    renderGame(gameObjects, deltaTime) {
        this.ctx.save();

        // 画面揺れ適用
        if (this.screenEffects.shake.intensity > 0) {
            this.ctx.translate(this.screenEffects.shake.x, this.screenEffects.shake.y);
        }

        // 背景グリッド
        this.renderBackground();

        // ゲームオブジェクト描画
        if (gameObjects) {
            // パーティクル（背景）
            if (gameObjects.particles && this.gameState.settings.enableParticles) {
                gameObjects.particles.draw(this.ctx);
            }

            // エコープレビュー
            if (gameObjects.echoManager) {
                gameObjects.echoManager.drawPreviews(this.ctx);
            }

            // エネミー
            if (gameObjects.enemyManager) {
                gameObjects.enemyManager.draw(this.ctx);
            }

            // プレイヤー
            if (gameObjects.player) {
                gameObjects.player.draw(this.ctx);
            }

            // エコー
            if (gameObjects.echoManager) {
                gameObjects.echoManager.draw(this.ctx);
            }
        }

        this.ctx.restore();

        // UI描画
        this.renderGameUI();

        // ポーズ画面
        if (this.gameState.isPaused()) {
            this.renderPauseOverlay();
        }
    }

    // 背景描画
    renderBackground() {
        // グリッド描画
        this.ctx.strokeStyle = COLORS.UI + '20';
        this.ctx.lineWidth = 1;

        const gridSize = 50;
        for (let x = 0; x <= this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }

        for (let y = 0; y <= this.canvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }

        // 境界線
        this.ctx.strokeStyle = COLORS.UI;
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(2, 2, this.canvas.width - 4, this.canvas.height - 4);
    }

    // ゲームUI描画
    renderGameUI() {
        // タイマー（左上）
        this.renderTimer();

        // スコア（左上、タイマーの下）
        this.renderScore();

        // コンボ（右上）
        this.renderCombo();

        // スコアポップアップ
        this.renderScorePopups();

        // チュートリアル（中央下）
        this.renderTutorial();

        // プログレスバー
        this.renderProgressBar();
    }

    // タイマー描画
    renderTimer() {
        const remainingTime = this.gameState.getRemainingTime();
        const minutes = Math.floor(remainingTime / 60);
        const seconds = Math.floor(remainingTime % 60);
        const timeText = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        this.ctx.font = this.fonts.ui;
        this.ctx.fillStyle = remainingTime < 10 ? COLORS.ENEMY : COLORS.UI;

        // 時間警告エフェクト
        if (remainingTime < 10 && remainingTime % 1 < 0.5) {
            this.ctx.shadowColor = COLORS.ENEMY;
            this.ctx.shadowBlur = 10;
        }

        this.ctx.fillText(`TIME: ${timeText}`, 20, 30);
        this.ctx.shadowBlur = 0;
    }

    // スコア描画
    renderScore() {
        this.ctx.font = this.fonts.ui;
        this.ctx.fillStyle = COLORS.UI;
        this.ctx.fillText(`SCORE: ${this.gameState.score}`, 20, 55);
    }

    // コンボ描画
    renderCombo() {
        if (this.gameState.combo <= 1) return;

        this.ctx.save();

        const x = this.canvas.width - 150;
        const y = 40;

        // アニメーション適用
        const anim = this.ui.comboAnimation;
        this.ctx.translate(x, y);
        this.ctx.scale(anim.scale, anim.scale);
        this.ctx.globalAlpha = anim.alpha;

        // コンボ数に応じた色
        let color = COLORS.UI;
        if (this.gameState.combo >= 10) color = '#ff00ff';
        else if (this.gameState.combo >= 5) color = '#ff6600';
        else if (this.gameState.combo >= 3) color = '#ffaa00';

        this.ctx.font = this.fonts.combo;
        this.ctx.fillStyle = color;
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = 10;

        const text = `COMBO x${this.gameState.combo}`;
        const metrics = this.ctx.measureText(text);
        this.ctx.fillText(text, -metrics.width / 2, 0);

        this.ctx.restore();
    }

    // スコアポップアップ描画
    renderScorePopups() {
        for (const popup of this.ui.scorePopups) {
            this.ctx.save();

            this.ctx.globalAlpha = popup.alpha;
            this.ctx.font = this.fonts.score;
            this.ctx.fillStyle = popup.color;
            this.ctx.shadowColor = popup.color;
            this.ctx.shadowBlur = 5;

            const text = `+${popup.score}`;
            const metrics = this.ctx.measureText(text);
            this.ctx.fillText(text, popup.x - metrics.width / 2, popup.y);

            this.ctx.restore();
        }
    }

    // チュートリアル描画
    renderTutorial() {
        const y = this.canvas.height - 60;

        this.ctx.font = this.fonts.ui;
        this.ctx.fillStyle = COLORS.UI + '80';
        this.ctx.textAlign = 'center';

        const controls = [
            'WASD/矢印キー: 移動',
            'Z: 斬撃',
            'X: ダッシュ',
            'P/ESC: ポーズ'
        ];

        const text = controls.join(' | ');
        this.ctx.fillText(text, this.canvas.width / 2, y);
        this.ctx.textAlign = 'left';
    }

    // プログレスバー描画
    renderProgressBar() {
        const progress = this.gameState.getGameProgress();
        const barWidth = 300;
        const barHeight = 6;
        const x = (this.canvas.width - barWidth) / 2;
        const y = 20;

        // 背景
        this.ctx.fillStyle = COLORS.UI + '40';
        this.ctx.fillRect(x, y, barWidth, barHeight);

        // プログレス
        this.ctx.fillStyle = COLORS.PLAYER;
        this.ctx.fillRect(x, y, barWidth * progress, barHeight);

        // 枠線
        this.ctx.strokeStyle = COLORS.UI;
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, y, barWidth, barHeight);
    }

    // メニュー描画
    renderMenu() {
        // タイトル
        this.ctx.font = this.fonts.title;
        this.ctx.fillStyle = COLORS.PLAYER;
        this.ctx.shadowColor = COLORS.PLAYER;
        this.ctx.shadowBlur = 20;
        this.ctx.textAlign = 'center';

        this.ctx.fillText('ECHO BLADE', this.canvas.width / 2, 200);
        this.ctx.shadowBlur = 0;
        this.ctx.textAlign = 'left';
    }

    // 説明画面描画
    renderInstructions() {
        this.ctx.font = this.fonts.ui;
        this.ctx.fillStyle = COLORS.UI;
        this.ctx.textAlign = 'center';

        this.ctx.fillText('ゲームの説明', this.canvas.width / 2, 100);
        this.ctx.textAlign = 'left';
    }

    // 設定画面描画
    renderSettings() {
        this.ctx.font = this.fonts.ui;
        this.ctx.fillStyle = COLORS.UI;
        this.ctx.textAlign = 'center';

        this.ctx.fillText('設定', this.canvas.width / 2, 100);
        this.ctx.textAlign = 'left';
    }

    // ゲームオーバー画面描画
    renderGameOver() {
        // 半透明背景
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // ゲームオーバーテキスト
        this.ctx.font = this.fonts.title;
        this.ctx.fillStyle = COLORS.ENEMY;
        this.ctx.shadowColor = COLORS.ENEMY;
        this.ctx.shadowBlur = 20;
        this.ctx.textAlign = 'center';

        this.ctx.fillText('GAME OVER', this.canvas.width / 2, 300);

        // 最終スコア
        this.ctx.font = this.fonts.score;
        this.ctx.fillStyle = COLORS.UI;
        this.ctx.shadowBlur = 0;

        this.ctx.fillText(`スコア: ${this.gameState.score}`, this.canvas.width / 2, 350);
        this.ctx.fillText(`最大コンボ: ${this.gameState.maxCombo}`, this.canvas.width / 2, 380);

        this.ctx.textAlign = 'left';
    }

    // ポーズオーバーレイ描画
    renderPauseOverlay() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.font = this.fonts.title;
        this.ctx.fillStyle = COLORS.UI;
        this.ctx.textAlign = 'center';

        this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.textAlign = 'left';
    }

    // トランジション描画
    renderTransition() {
        const progress = this.gameState.getTransitionProgress();
        const alpha = Math.sin(progress * Math.PI);

        this.ctx.fillStyle = `rgba(16, 16, 32, ${alpha * 0.8})`;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // 画面効果適用
    applyScreenEffects() {
        // フラッシュ効果
        if (this.screenEffects.flash > 0) {
            this.ctx.save();
            this.ctx.globalCompositeOperation = 'screen';
            this.ctx.fillStyle = `rgba(255, 255, 255, ${this.screenEffects.flash})`;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.restore();
        }
    }

    // エフェクト更新
    updateEffects(deltaTime) {
        // 画面揺れ減衰
        if (this.screenEffects.shake.intensity > 0) {
            this.screenEffects.shake.intensity *= this.screenEffects.shake.decay;
            this.screenEffects.shake.x = (Math.random() - 0.5) * this.screenEffects.shake.intensity;
            this.screenEffects.shake.y = (Math.random() - 0.5) * this.screenEffects.shake.intensity;

            if (this.screenEffects.shake.intensity < 0.1) {
                this.screenEffects.shake.intensity = 0;
            }
        }

        // フラッシュ減衰
        if (this.screenEffects.flash > 0) {
            this.screenEffects.flash = Math.max(0, this.screenEffects.flash - deltaTime * 2);
        }

        // コンボアニメーション更新
        const anim = this.ui.comboAnimation;
        anim.time += deltaTime;
        anim.scale = 1 + Math.sin(anim.time * 10) * 0.1;

        // スコアポップアップ更新
        for (let i = this.ui.scorePopups.length - 1; i >= 0; i--) {
            const popup = this.ui.scorePopups[i];
            popup.y -= 50 * deltaTime;
            popup.alpha -= deltaTime;

            if (popup.alpha <= 0) {
                this.ui.scorePopups.splice(i, 1);
            }
        }
    }

    // 画面効果トリガー
    addScreenShake(intensity) {
        this.screenEffects.shake.intensity = Math.max(
            this.screenEffects.shake.intensity,
            intensity
        );
    }

    addFlash(intensity = 0.5) {
        this.screenEffects.flash = Math.max(this.screenEffects.flash, intensity);
    }

    addScorePopup(x, y, score, color = COLORS.UI) {
        this.ui.scorePopups.push({
            x: x,
            y: y,
            score: score,
            color: color,
            alpha: 1
        });
    }

    // デバッグ情報描画
    renderDebugInfo() {
        const debugInfo = this.gameState.getDebugInfo();
        const y = this.canvas.height - 100;

        this.ctx.font = '12px monospace';
        this.ctx.fillStyle = '#ffffff';

        let lineY = y;
        for (const [key, value] of Object.entries(debugInfo)) {
            this.ctx.fillText(`${key}: ${value}`, 10, lineY);
            lineY += 15;
        }
    }

    // 設定
    setDebugMode(enabled) {
        this.debugMode = enabled;
    }

    // リサイズ対応
    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
    }
}

export { Renderer };
