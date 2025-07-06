// メイン処理 - ゲーム初期化とイベント処理
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, starting game initialization...');

  // Canvas要素を取得
  const canvas = document.getElementById('gameCanvas');
  if (!canvas) {
    console.error('Canvas element not found');
    return;
  }
  console.log('Canvas found:', canvas);

  // スプライトローダーを初期化
  console.log('Initializing sprite loader...');
  SpriteLoader.init();
  console.log(
    'Sprite loader initialized. Available sprites:',
    Object.keys(SpriteLoader.sprites),
  );

  // ゲームインスタンスを作成
  console.log('Creating game instance...');
  const game = new Game(canvas);
  console.log('Game instance created successfully');

  // スタートボタンイベント
  const startScreen = document.getElementById('startScreen');
  const gameOverScreen = document.getElementById('gameOverScreen');

  // スペースキーでゲーム開始
  document.addEventListener('keydown', event => {
    if (event.code === 'Space') {
      event.preventDefault();

      if (!startScreen.classList.contains('hidden')) {
        // スタート画面からゲーム開始
        console.log('Starting game...');
        game.startGame();
      } else if (!gameOverScreen.classList.contains('hidden')) {
        // ゲームオーバー画面からリスタート
        console.log('Restarting game...');
        game.restartGame();
      }
    }
  });

  // クリックでもゲーム開始可能
  startScreen.addEventListener('click', () => {
    console.log('Starting game via click...');
    game.startGame();
  });

  gameOverScreen.addEventListener('click', () => {
    console.log('Restarting game via click...');
    game.restartGame();
  });

  // デバッグモード（開発時のみ）
  if (window.location.hash === '#debug') {
    window.DEBUG = true;
    console.log('Debug mode enabled');
  }

  // ゲーム情報をコンソールに出力
  console.log('Super Mario Bros 1-1 - Complete Recreation');
  console.log('Controls: Arrow keys to move, Space to jump, X to run');
  console.log('Game loaded successfully!');

  // ゲームオブジェクトをグローバルに公開（デバッグ用）
  window.game = game;
});

// エラーハンドリング
window.addEventListener('error', event => {
  console.error('Game Error:', event.error);
  console.error('Error details:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    stack: event.error?.stack,
  });
});

// ページがアンロードされる時の処理
window.addEventListener('beforeunload', () => {
  // ゲームの状態を保存したい場合はここに処理を追加
});
