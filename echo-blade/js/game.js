// メインゲームロジック統合

import { Player } from './player.js';
import { EchoManager } from './echo.js';
import { EnemyManager } from './enemy.js';
import { ParticleManager } from './particles.js';
import { AudioManager } from './audio.js';
import { InputManager } from './input.js';
import { GameState, GAME_STATES } from './gameState.js';
import { Renderer } from './renderer.js';
import { GAME_CONFIG, COLORS, checkCollision } from './utils.js';

class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.isRunning = false;
        this.lastTime = 0;

        // コアシステム初期化
        this.gameState = new GameState();
        this.renderer = new Renderer(canvas, this.gameState);
        this.inputManager = new InputManager();
        this.audioManager = new AudioManager();

        // ゲームオブジェクト
        this.gameObjects = {
            player: null,
            echoManager: null,
            enemyManager: null,
            particles: null
        };

        // イベントリスナー設定
        this.setupEventListeners();

        // UI初期化
        this.setupUI();

        // FPS測定
        this.fpsCounter = {
            frames: 0,
            lastFpsUpdate: 0,
            fps: 60
        };

        console.log('Echo Blade ゲーム初期化完了');
    }

    // イベントリスナー設定
    setupEventListeners() {
        // ウィンドウリサイズ
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // 画面表示状態変更
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.gameState.isPlaying()) {
                this.gameState.changeState(GAME_STATES.PAUSED);
            }
        });

        // 入力イベント
        this.inputManager.onAction('pause', () => {
            this.handlePauseToggle();
        });

        // エラーハンドリング
        window.addEventListener('error', (event) => {
            console.error('ゲームエラー:', event.error);
        });
    }

    // UI設定
    setupUI() {
        // メニューボタン
        const startButton = document.getElementById('start-button');
        if (startButton) {
            startButton.addEventListener('click', () => {
                this.startGame();
            });
        }

        const instructionsButton = document.getElementById('instructions-button');
        if (instructionsButton) {
            instructionsButton.addEventListener('click', () => {
                this.gameState.changeState(GAME_STATES.INSTRUCTIONS);
            });
        }

        const settingsButton = document.getElementById('settings-button');
        if (settingsButton) {
            settingsButton.addEventListener('click', () => {
                this.gameState.changeState(GAME_STATES.SETTINGS);
            });
        }

        // 難易度選択
        const difficultyButtons = document.querySelectorAll('.difficulty-button');
        difficultyButtons.forEach(button => {
            button.addEventListener('click', () => {
                const difficulty = button.getAttribute('data-difficulty');
                this.gameState.setDifficulty(difficulty);
                this.updateDifficultyDisplay();
            });
        });

        // 戻るボタン
        const backButtons = document.querySelectorAll('.back-button');
        backButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.gameState.changeState(GAME_STATES.MENU);
            });
        });

        // ゲームオーバー後のリプレイ
        const playAgainButton = document.getElementById('play-again-button');
        if (playAgainButton) {
            playAgainButton.addEventListener('click', () => {
                this.startGame();
            });
        }

        this.updateDifficultyDisplay();
    }

    // ゲーム開始
    startGame() {
        // ゲームオブジェクト初期化
        this.initializeGameObjects();

        // ゲーム状態変更
        this.gameState.changeState(GAME_STATES.PLAYING);

        // BGM開始
        this.audioManager.playBGM();

        console.log('ゲーム開始');
    }

    // ゲームオブジェクト初期化
    initializeGameObjects() {
        const modifiers = this.gameState.getDifficultyModifiers();

        // プレイヤー初期化
        this.gameObjects.player = new Player(
            GAME_CONFIG.ARENA_WIDTH / 2,
            GAME_CONFIG.GROUND_Y - 50
        );

        // エコーマネージャー初期化
        this.gameObjects.echoManager = new EchoManager(modifiers.echoDelay);

        // エネミーマネージャー初期化
        this.gameObjects.enemyManager = new EnemyManager(modifiers);

        // パーティクルマネージャー初期化
        this.gameObjects.particles = new ParticleManager();

        // イベント設定
        this.setupGameEvents();
    }

    // ゲームイベント設定
    setupGameEvents() {
        // プレイヤーアクション
        this.inputManager.onAction('slash', () => {
            if (this.gameState.isPlaying() && this.gameObjects.player) {
                this.handlePlayerSlash();
            }
        });

        this.inputManager.onAction('dash', () => {
            if (this.gameState.isPlaying() && this.gameObjects.player) {
                this.handlePlayerDash();
            }
        });

        this.inputManager.onAction('jump', () => {
            if (this.gameState.isPlaying() && this.gameObjects.player) {
                this.gameObjects.player.jump();
            }
        });
    }

    // プレイヤー斬撃処理
    handlePlayerSlash() {
        const player = this.gameObjects.player;
        const slashResult = player.slash();

        if (slashResult.success) {
            // 音効果
            this.audioManager.playSlash();

            // パーティクル効果
            this.gameObjects.particles.createSlashEffect(
                player.x + slashResult.offsetX,
                player.y + slashResult.offsetY,
                slashResult.angle
            );

            // エコー記録
            this.gameObjects.echoManager.recordAction({
                type: 'slash',
                x: player.x,
                y: player.y,
                direction: player.direction,
                angle: slashResult.angle
            });

            // 敵との衝突チェック
            this.checkSlashCollisions(slashResult);
        }
    }

    // プレイヤーダッシュ処理
    handlePlayerDash() {
        const player = this.gameObjects.player;
        const dashResult = player.dash();

        if (dashResult.success) {
            // 音効果
            this.audioManager.playDash();

            // パーティクル効果
            this.gameObjects.particles.createDashEffect(
                player.x,
                player.y,
                dashResult.direction
            );

            // エコー記録
            this.gameObjects.echoManager.recordAction({
                type: 'dash',
                x: player.x,
                y: player.y,
                direction: dashResult.direction
            });
        }
    }

    // 斬撃衝突チェック
    checkSlashCollisions(slashResult) {
        const hitEnemies = [];

        // 敵との衝突
        for (const enemy of this.gameObjects.enemyManager.enemies) {
            if (enemy.isAlive() && checkCollision(slashResult.hitbox, enemy.getHitbox())) {
                if (enemy.takeDamage(1, slashResult.angle)) {
                    hitEnemies.push(enemy);
                }
            }
        }

        // ヒット処理
        if (hitEnemies.length > 0) {
            this.processEnemyHits(hitEnemies, 'player');
        }
    }

    // エコー衝突チェック
    checkEchoCollisions(echoAction) {
        if (echoAction.type !== 'slash') return;

        const hitEnemies = [];
        const player = this.gameObjects.player;
        const modifiers = this.gameState.getDifficultyModifiers();

        // 敵との衝突
        for (const enemy of this.gameObjects.enemyManager.enemies) {
            if (enemy.isAlive() && checkCollision(echoAction.hitbox, enemy.getHitbox())) {
                if (enemy.takeDamage(1, echoAction.angle)) {
                    hitEnemies.push(enemy);
                }
            }
        }

        // プレイヤーとの衝突（難易度による）
        if (modifiers.echoSelfDamage && checkCollision(echoAction.hitbox, player.getHitbox())) {
            this.handlePlayerHit();
        }

        // ヒット処理
        if (hitEnemies.length > 0) {
            this.processEnemyHits(hitEnemies, 'echo');
        }
    }

    // 敵ヒット処理
    processEnemyHits(enemies, source) {
        let simultaneousKill = enemies.length > 1;

        for (const enemy of enemies) {
            // スコア追加
            const scoreSource = simultaneousKill ? 'simultaneous' : source;
            const points = this.gameState.addScore(enemy.getScore(), scoreSource);

            // コンボ更新
            this.gameState.addCombo();
            this.gameState.addEnemyKill();

            // 音効果
            this.audioManager.playEnemyHit();

            // 視覚効果
            this.gameObjects.particles.createEnemyDeathEffect(
                enemy.x, enemy.y, enemy.getColor()
            );

            this.renderer.addScreenShake(5);
            this.renderer.addFlash(0.3);
            this.renderer.addScorePopup(enemy.x, enemy.y, points);

            // 敵削除
            enemy.destroy();
        }

        // コンボエフェクト
        if (this.gameState.combo > 2) {
            const player = this.gameObjects.player;
            this.gameObjects.particles.createComboEffect(
                player.x, player.y - 30, this.gameState.combo
            );
        }
    }

    // プレイヤーヒット処理
    handlePlayerHit() {
        const player = this.gameObjects.player;

        if (player.takeDamage()) {
            // コンボリセット
            this.gameState.resetCombo();

            // 音効果
            this.audioManager.playPlayerHit();

            // 視覚効果
            this.gameObjects.particles.createHitEffect(player.x, player.y, COLORS.ENEMY);
            this.renderer.addScreenShake(10);
            this.renderer.addFlash(0.5);
        }
    }

    // ポーズ切り替え
    handlePauseToggle() {
        if (this.gameState.isPlaying()) {
            this.gameState.changeState(GAME_STATES.PAUSED);
            this.audioManager.pauseBGM();
        } else if (this.gameState.isPaused()) {
            this.gameState.changeState(GAME_STATES.PLAYING);
            this.audioManager.resumeBGM();
        }
    }

    // メインゲームループ
    update(deltaTime) {
        // ゲーム状態更新
        this.gameState.update(deltaTime);

        // ゲームプレイ中のみ更新
        if (this.gameState.isPlaying()) {
            this.updateGameplay(deltaTime);
        }

        // 入力更新
        this.inputManager.update(deltaTime);

        // オーディオ更新
        this.audioManager.update(deltaTime);
    }

    // ゲームプレイ更新
    updateGameplay(deltaTime) {
        const { player, echoManager, enemyManager, particles } = this.gameObjects;

        // プレイヤー更新
        if (player) {
            // 移動入力
            const moveInput = {
                left: this.inputManager.isActionActive('moveLeft'),
                right: this.inputManager.isActionActive('moveRight'),
                up: this.inputManager.isActionActive('jump')
            };

            player.update(deltaTime, moveInput);
        }

        // エコー更新
        if (echoManager) {
            echoManager.update(deltaTime);

            // エコーアクション実行
            const echoActions = echoManager.getActiveActions();
            for (const action of echoActions) {
                this.executeEchoAction(action);
            }
        }

        // 敵更新
        if (enemyManager) {
            enemyManager.update(deltaTime, player);

            // プレイヤーとの衝突
            for (const enemy of enemyManager.enemies) {
                if (enemy.isAlive() && checkCollision(enemy.getHitbox(), player.getHitbox())) {
                    this.handlePlayerHit();
                }
            }
        }

        // パーティクル更新
        if (particles) {
            particles.update(deltaTime);

            // パフォーマンス測定
            this.gameState.updatePerformanceMetrics({
                particleCount: particles.getParticleCount()
            });
        }

        // ゲーム終了判定
        if (this.gameState.isGameTimeUp()) {
            this.endGame();
        }
    }

    // エコーアクション実行
    executeEchoAction(action) {
        if (action.type === 'slash') {
            // エコー斬撃パーティクル
            this.gameObjects.particles.createSlashEffect(
                action.x, action.y, action.angle, true
            );

            // 音効果
            this.audioManager.playEchoSlash();

            // 衝突チェック
            this.checkEchoCollisions(action);
        } else if (action.type === 'dash') {
            // エコーダッシュパーティクル
            this.gameObjects.particles.createDashEffect(
                action.x, action.y, action.direction
            );
        }
    }

    // ゲーム終了
    endGame() {
        this.gameState.changeState(GAME_STATES.GAME_OVER);
        this.audioManager.stopBGM();
        this.audioManager.playGameOver();

        console.log('ゲーム終了 - スコア:', this.gameState.score);
    }

    // 描画
    render(deltaTime) {
        this.renderer.render(this.gameObjects, deltaTime);
    }

    // メインループ
    loop(currentTime) {
        if (!this.isRunning) return;

        // デルタタイム計算
        const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.033);
        this.lastTime = currentTime;

        // FPS測定
        this.updateFPS(currentTime);

        // 更新と描画
        this.update(deltaTime);
        this.render(deltaTime);

        // 次のフレーム
        requestAnimationFrame((time) => this.loop(time));
    }

    // FPS測定
    updateFPS(currentTime) {
        this.fpsCounter.frames++;

        if (currentTime - this.fpsCounter.lastFpsUpdate >= 1000) {
            this.fpsCounter.fps = this.fpsCounter.frames;
            this.fpsCounter.frames = 0;
            this.fpsCounter.lastFpsUpdate = currentTime;

            this.gameState.updatePerformanceMetrics({
                fps: this.fpsCounter.fps
            });
        }
    }

    // 画面リサイズ対応
    handleResize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        const aspectRatio = GAME_CONFIG.ARENA_WIDTH / GAME_CONFIG.ARENA_HEIGHT;

        let newWidth = rect.width;
        let newHeight = rect.width / aspectRatio;

        if (newHeight > rect.height) {
            newHeight = rect.height;
            newWidth = rect.height * aspectRatio;
        }

        this.canvas.style.width = `${newWidth}px`;
        this.canvas.style.height = `${newHeight}px`;

        this.renderer.resize(GAME_CONFIG.ARENA_WIDTH, GAME_CONFIG.ARENA_HEIGHT);
    }

    // UI更新
    updateDifficultyDisplay() {
        const buttons = document.querySelectorAll('.difficulty-button');
        buttons.forEach(button => {
            const difficulty = button.getAttribute('data-difficulty');
            button.classList.toggle('active', difficulty === this.gameState.difficulty);
        });
    }

    // ゲーム開始
    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.lastTime = performance.now();

        // 初期リサイズ
        this.handleResize();

        // ループ開始
        requestAnimationFrame((time) => this.loop(time));

        console.log('Echo Blade ゲームループ開始');
    }

    // ゲーム停止
    stop() {
        this.isRunning = false;
        this.audioManager.stopAll();
    }

    // デバッグモード切り替え
    toggleDebug() {
        this.renderer.setDebugMode(!this.renderer.debugMode);
    }
}

export { Game };
