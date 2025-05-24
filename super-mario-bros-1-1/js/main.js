// メイン処理 - ゲーム初期化とイベント処理
document.addEventListener('DOMContentLoaded', () => {
    // Canvas要素を取得
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }

    // スプライトローダーを初期化
    SpriteLoader.init();

    // ゲームインスタンスを作成
    const game = new Game(canvas);

    // スタートボタンイベント
    const startScreen = document.getElementById('startScreen');
    const gameOverScreen = document.getElementById('gameOverScreen');

    // スペースキーでゲーム開始
    document.addEventListener('keydown', (event) => {
        if (event.code === 'Space') {
            event.preventDefault();

            if (!startScreen.classList.contains('hidden')) {
                // スタート画面からゲーム開始
                game.startGame();
            } else if (!gameOverScreen.classList.contains('hidden')) {
                // ゲームオーバー画面からリスタート
                game.restartGame();
            }
        }
    });

    // クリックでもゲーム開始可能
    startScreen.addEventListener('click', () => {
        game.startGame();
    });

    gameOverScreen.addEventListener('click', () => {
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
window.addEventListener('error', (event) => {
    console.error('Game Error:', event.error);
});

// ページがアンロードされる時の処理
window.addEventListener('beforeunload', () => {
    // ゲームの状態を保存したい場合はここに処理を追加
});
