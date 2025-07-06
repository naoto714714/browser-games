/**
 * Main Game Controller
 * ゲームの初期化とメインループ管理
 */

class GameController {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.pixelRenderer = null;
    this.game = null;
    this.isRunning = false;
    this.animationId = null;

    // パフォーマンス監視
    this.fps = 60;
    this.lastFrameTime = 0;
    this.frameCount = 0;
    this.lastFpsUpdate = 0;

    this.init();
  }

  // 初期化
  init() {
    this.setupCanvas();
    this.setupRenderers();
    this.setupGame();
    this.setupUIEvents();
    this.startGameLoop();

    console.log('🎮 刹那の見切り - Reaction Time Game Initialized!');
  }

  // Canvas設定
  setupCanvas() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');

    // Canvas解像度設定（高DPI対応）
    const rect = this.canvas.getBoundingClientRect();
    const devicePixelRatio = window.devicePixelRatio || 1;

    this.canvas.width = rect.width * devicePixelRatio;
    this.canvas.height = rect.height * devicePixelRatio;

    this.ctx.scale(devicePixelRatio, devicePixelRatio);

    // ピクセルアート用設定
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.webkitImageSmoothingEnabled = false;
    this.ctx.mozImageSmoothingEnabled = false;
    this.ctx.msImageSmoothingEnabled = false;

    // タッチイベント設定
    this.canvas.style.touchAction = 'none';

    console.log(
      `📱 Canvas initialized: ${this.canvas.width}x${this.canvas.height}`,
    );
  }

  // レンダラー設定
  setupRenderers() {
    this.pixelRenderer = new PixelArtRenderer(this.canvas, this.ctx);
    console.log('🎨 Pixel art renderer initialized');
  }

  // ゲーム設定
  setupGame() {
    this.game = new ReactionGame(this.canvas, this.pixelRenderer);
    console.log('🎯 Game logic initialized');
  }

  // UIイベント設定
  setupUIEvents() {
    // スタートボタン
    const startBtn = document.getElementById('start-btn');
    startBtn.addEventListener('click', () => {
      this.startNewGame();
    });

    // 次へボタン
    const nextBtn = document.getElementById('next-btn');
    nextBtn.addEventListener('click', () => {
      this.nextRound();
    });

    // リスタートボタン
    const restartBtn = document.getElementById('restart-btn');
    restartBtn.addEventListener('click', () => {
      this.restartGame();
    });

    // キーボードショートカット
    document.addEventListener('keydown', e => {
      switch (e.key) {
      case 'r':
      case 'R':
        if (e.ctrlKey || e.metaKey) {
          return;
        } // Ctrl+R (reload) は無視
        this.restartGame();
        break;
      case 'n':
      case 'N':
        this.nextRound();
        break;
      case 'Escape':
        this.pauseGame();
        break;
      }
    });

    // ウィンドウサイズ変更対応
    window.addEventListener('resize', () => {
      this.handleResize();
    });

    // 可視性変更対応（タブ切り替え時のゲーム停止）
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseGame();
      } else {
        this.resumeGame();
      }
    });

    console.log('🎮 UI events initialized');
  }

  // 新ゲーム開始
  startNewGame() {
    this.game.startGame();
    this.hideStartScreen();
    this.resumeGame();

    // スタートボタンにアニメーション追加
    const startBtn = document.getElementById('start-btn');
    startBtn.classList.add('bounce');
    setTimeout(() => startBtn.classList.remove('bounce'), 500);

    // すぐにカウントダウン開始
    setTimeout(() => {
      this.game.startCountdown();
    }, 100);

    console.log('🚀 New game started with immediate countdown!');
  }

  // 次のラウンド
  nextRound() {
    this.game.nextRound();
    this.game.hideResultPanel();

    // エフェクト音
    this.game.playCountdownSound();

    // 次のバトルのカウントダウンを開始
    setTimeout(() => {
      this.game.startCountdown();
    }, 500); // 少し待ってからカウントダウン開始

    console.log(`📈 Round ${this.game.currentRound + 1} started`);
  }

  // ゲームリスタート
  restartGame() {
    this.game.reset();
    this.showStartScreen();

    console.log('🔄 Game restarted');
  }

  // ゲーム一時停止
  pauseGame() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    console.log('⏸️ Game paused');
  }

  // ゲーム再開
  resumeGame() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.lastFrameTime = performance.now();
      this.gameLoop();
      console.log('▶️ Game resumed');
    }
  }

  // スタート画面表示
  showStartScreen() {
    document.getElementById('game-status').classList.remove('hidden');
    document.getElementById('result-panel').classList.add('hidden');
  }

  // スタート画面非表示
  hideStartScreen() {
    document.getElementById('game-status').classList.add('hidden');
  }

  // ウィンドウサイズ変更処理
  handleResize() {
    const rect = this.canvas.getBoundingClientRect();
    const devicePixelRatio = window.devicePixelRatio || 1;

    this.canvas.width = rect.width * devicePixelRatio;
    this.canvas.height = rect.height * devicePixelRatio;

    this.ctx.scale(devicePixelRatio, devicePixelRatio);
    this.ctx.imageSmoothingEnabled = false;

    // レンダラーのサイズを更新
    if (this.pixelRenderer) {
      this.pixelRenderer.updateCanvasSize();
    }

    // ゲームのキャラクター位置を再計算
    if (this.game) {
      this.game.updateCharacterPositions();
    }

    console.log(
      `📐 Canvas resized: ${this.canvas.width}x${this.canvas.height}`,
    );
  }

  // メインゲームループ
  gameLoop(currentTime = 0) {
    if (!this.isRunning) {
      return;
    }

    // FPS計算
    if (currentTime - this.lastFpsUpdate >= 1000) {
      this.fps = Math.round(
        (this.frameCount * 1000) / (currentTime - this.lastFpsUpdate),
      );
      this.frameCount = 0;
      this.lastFpsUpdate = currentTime;
    }
    this.frameCount++;

    // フレーム制限（60 FPS target）
    const deltaTime = currentTime - this.lastFrameTime;
    if (deltaTime >= 16.67) {
      // ~60 FPS
      this.update(deltaTime);
      this.render();
      this.lastFrameTime = currentTime;
    }

    this.animationId = requestAnimationFrame(time => this.gameLoop(time));
  }

  // ゲーム更新
  update(deltaTime) {
    if (this.game) {
      this.game.update();
    }
  }

  // 描画
  render() {
    // 描画はgame.update()内で行われる
    // ここではデバッグ情報などを追加可能

    if (this.showDebugInfo) {
      this.renderDebugInfo();
    }
  }

  // デバッグ情報描画
  renderDebugInfo() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(10, 10, 150, 60);

    this.ctx.fillStyle = 'white';
    this.ctx.font = '12px monospace';
    this.ctx.fillText(`FPS: ${this.fps}`, 15, 25);
    this.ctx.fillText(`State: ${this.game.gameState}`, 15, 40);
    this.ctx.fillText(`Level: ${this.game.level}`, 15, 55);
  }

  // ゲームループ開始
  startGameLoop() {
    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this.gameLoop();
    console.log('🔄 Game loop started');
  }

  // デバッグモード切り替え
  toggleDebug() {
    this.showDebugInfo = !this.showDebugInfo;
    console.log(`🐛 Debug mode: ${this.showDebugInfo ? 'ON' : 'OFF'}`);
  }

  // ゲーム状態取得（外部API用）
  getGameState() {
    return {
      score: this.game.score,
      level: this.game.level,
      bestTime: this.game.bestTime,
      currentState: this.game.gameState,
      fps: this.fps,
    };
  }
}

// DOM読み込み完了後にゲーム初期化
document.addEventListener('DOMContentLoaded', () => {
  // グローバルゲームコントローラー
  window.gameController = new GameController();

  // デバッグ用コンソールコマンド
  window.debug = () => window.gameController.toggleDebug();
  window.gameState = () => console.log(window.gameController.getGameState());

  // PWA用のサービスワーカー登録（オプション）
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // サービスワーカーが無い場合は無視
    });
  }

  console.log('🌟 刹那の見切り - Ready to play!');
  console.log('💡 Type "debug()" in console to toggle debug info');
  console.log('💡 Type "gameState()" in console to see current game state');
});

// エラーハンドリング
window.addEventListener('error', e => {
  console.error('🚨 Game Error:', e.error);
  // ゲームが壊れた場合の復旧処理
  if (window.gameController) {
    window.gameController.pauseGame();
  }
});

// 未処理のPromise拒否をキャッチ
window.addEventListener('unhandledrejection', e => {
  console.error('🚨 Unhandled Promise Rejection:', e.reason);
  e.preventDefault();
});
