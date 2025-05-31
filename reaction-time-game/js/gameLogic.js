/**
 * Reaction Time Game Logic
 * 反射神経ゲームのメインロジック
 */

class ReactionGame {
    constructor(canvas, pixelRenderer) {
        this.canvas = canvas;
        this.renderer = pixelRenderer;
        
        // ゲーム状態
        this.gameState = 'waiting'; // waiting, countdown, ready, signal, reaction, result
        this.score = 0;
        this.level = 1;
        this.bestTime = localStorage.getItem('bestReactionTime') || null;
        this.currentRound = 0;
        this.maxRounds = 5;
        
        // タイミング関連
        this.countdownTimer = 0;
        this.countdownValue = 3;
        this.signalStartTime = 0;
        this.reactionTime = 0;
        this.signalDelay = 0; // ランダム遅延
        
        // 難易度設定
        this.difficulty = {
            1: { minDelay: 2000, maxDelay: 5000, falseStartPenalty: 500 },
            2: { minDelay: 1500, maxDelay: 4000, falseStartPenalty: 400 },
            3: { minDelay: 1000, maxDelay: 3500, falseStartPenalty: 300 },
            4: { minDelay: 800, maxDelay: 3000, falseStartPenalty: 200 },
            5: { minDelay: 600, maxDelay: 2500, falseStartPenalty: 100 }
        };
        
        // 音声効果（Web Audio API使用）
        this.audioContext = null;
        this.initAudio();
        
        // 入力ハンドリング
        this.setupInputHandlers();
        
        // キャラクター状態（16x16キャラクター対応、画面中央に配置）
        this.catExpression = 'normal';
        this.catPosition = { x: 32, y: 40 }; // 中央左側に配置
        this.signalLight = 'red';
        
        // 敵システム
        this.currentEnemy = null;
        this.enemyPosition = { x: 52, y: 40 }; // 中央右側に配置
        this.enemyReactionTime = 0;
        this.battlePhase = 'ready'; // ready, countdown, signal, result
        
        // 敵の種類とAI（世界観に合った可愛い名前で段階的難易度）
        this.enemies = [
            { name: 'ひなたちゃん', type: 'basic', reactionRange: [600, 800], description: 'のんびり屋さんの優しい猫' },
            { name: 'さくらちゃん', type: 'basic', reactionRange: [400, 600], description: '春らしい穏やかな猫' },
            { name: 'そらくん', type: 'fast', reactionRange: [300, 450], description: '空のように自由な猫' },
            { name: 'ほしちゃん', type: 'fast', reactionRange: [200, 350], description: '星のように輝く素早い猫' },
            { name: 'かげまる', type: 'master', reactionRange: [150, 250], description: '影のように神秘的な最強の猫' },
        ];
        
        // バトル結果メッセージ
        this.battleMessages = {
            victory: ['勝利！', '見事な反応！', '君の勝ちだ！', '素晴らしい！'],
            defeat: ['敗北...', '相手の方が早かった', '次は頑張ろう', 'もう一度挑戦！'],
            draw: ['引き分け', '互角の勝負', '同じタイミング！', 'すごい接戦！'],
            falseStart: ['フライング！', '早すぎる！', '待って！', '焦りすぎ！']
        };
    }
    
    // 音声初期化
    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    }
    
    // ビープ音生成
    playBeep(frequency = 800, duration = 200, type = 'sine') {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration / 1000);
    }
    
    // 成功音
    playSuccessSound() {
        this.playBeep(523, 150); // C5
        setTimeout(() => this.playBeep(659, 150), 100); // E5
        setTimeout(() => this.playBeep(784, 200), 200); // G5
    }
    
    // エラー音
    playErrorSound() {
        this.playBeep(220, 300, 'sawtooth'); // A3
    }
    
    // カウントダウン音
    playCountdownSound() {
        this.playBeep(440, 100); // A4
    }
    
    // GO音
    playGoSound() {
        this.playBeep(880, 200); // A5
    }
    
    // 入力ハンドリング設定
    setupInputHandlers() {
        // キーボード入力
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'Enter') {
                e.preventDefault();
                this.handleInput();
            }
        });
        
        // マウス/タッチ入力
        this.canvas.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleInput();
        });
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleInput();
        });
        
        // 右クリック無効化
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }
    
    // 入力処理
    handleInput() {
        const currentTime = Date.now();
        
        switch (this.gameState) {
            case 'waiting':
                // waiting状態では何もしない（カウントダウンは自動開始）
                break;
                
            case 'countdown':
            case 'ready':
                // フライング
                this.handleFalseStart();
                break;
                
            case 'signal':
                // 正常な反応
                this.reactionTime = currentTime - this.signalStartTime;
                this.gameState = 'result';
                this.processReaction();
                break;
        }
    }
    
    // ゲーム開始
    startGame() {
        this.score = 0;
        this.level = 1;
        this.currentRound = 0;
        this.gameState = 'waiting';
        this.catExpression = 'normal';
        this.battlePhase = 'ready';
        this.selectCurrentEnemy();
        this.updateUI();
    }
    
    // 現在の敵を選択
    selectCurrentEnemy() {
        const enemyIndex = Math.min(this.level - 1, this.enemies.length - 1);
        this.currentEnemy = this.enemies[enemyIndex];
        console.log(`🎯 Battle vs ${this.currentEnemy.name}: ${this.currentEnemy.description}`);
    }
    
    // 敵の反応時間を生成（AI）
    generateEnemyReaction() {
        const range = this.currentEnemy.reactionRange;
        this.enemyReactionTime = Math.random() * (range[1] - range[0]) + range[0];
        console.log(`🤖 Enemy reaction time: ${Math.round(this.enemyReactionTime)}ms`);
    }
    
    // カウントダウン開始
    startCountdown() {
        this.gameState = 'countdown';
        this.countdownValue = 3;
        this.countdownTimer = Date.now();
        this.catExpression = 'focused';
        this.battlePhase = 'countdown';
        
        // 敵の反応時間を先に決定
        this.generateEnemyReaction();
        
        this.playCountdownSound();
        
        // カウントダウン処理
        const countdownInterval = setInterval(() => {
            this.countdownValue--;
            
            if (this.countdownValue > 0) {
                this.playCountdownSound();
            } else {
                clearInterval(countdownInterval);
                this.startReadyPhase();
            }
        }, 1000);
    }
    
    // 準備フェーズ
    startReadyPhase() {
        this.gameState = 'ready';
        this.signalLight = 'yellow';
        
        // ランダム遅延設定
        const difficulty = this.difficulty[Math.min(this.level, 5)];
        this.signalDelay = Math.random() * (difficulty.maxDelay - difficulty.minDelay) + difficulty.minDelay;
        
        // 信号表示タイマー
        setTimeout(() => {
            if (this.gameState === 'ready') {
                this.showSignal();
            }
        }, this.signalDelay);
    }
    
    // 信号表示
    showSignal() {
        this.gameState = 'signal';
        this.signalStartTime = Date.now();
        this.signalLight = 'green';
        this.catExpression = 'surprised';
        
        this.playGoSound();
        
        // エフェクト追加
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                this.renderer.addSparkle(
                    Math.random() * 200,
                    Math.random() * 150
                );
            }, i * 50);
        }
    }
    
    // フライング処理
    handleFalseStart() {
        this.gameState = 'result';
        this.reactionTime = -1; // フライングマーク
        this.catExpression = 'surprised';
        
        this.playErrorSound();
        this.processReaction();
    }
    
    // バトル結果処理
    processReaction() {
        let battleResult, message;
        
        if (this.reactionTime === -1) {
            // フライング
            battleResult = 'falseStart';
            this.catExpression = 'surprised';
        } else {
            // バトル結果判定
            const timeDiff = Math.abs(this.reactionTime - this.enemyReactionTime);
            
            if (this.reactionTime < this.enemyReactionTime) {
                // プレイヤーの勝利
                battleResult = 'victory';
                this.catExpression = 'happy';
                this.score += 1000 + (this.level * 200);
                
                // 勝利エフェクト
                for (let i = 0; i < 8; i++) {
                    this.renderer.addSparkle(
                        this.catPosition.x + Math.random() * 64,
                        this.catPosition.y + Math.random() * 64
                    );
                }
                
                this.playSuccessSound();
                
                // レベルアップ
                this.level++;
                this.selectCurrentEnemy();
                
            } else if (timeDiff < 10) {
                // 引き分け（10ms以内の差）
                battleResult = 'draw';
                this.catExpression = 'surprised';
                this.score += 500;
                this.playCountdownSound();
                
            } else {
                // プレイヤーの敗北
                battleResult = 'defeat';
                this.catExpression = 'normal';
                this.playErrorSound();
                
                // ゲームオーバー処理
                this.handleGameOver();
            }
            
            // ベストタイム更新
            if (!this.bestTime || this.reactionTime < this.bestTime) {
                this.bestTime = this.reactionTime;
                localStorage.setItem('bestReactionTime', this.bestTime);
                
                // 新記録エフェクト
                for (let i = 0; i < 5; i++) {
                    this.renderer.addHeart(
                        this.catPosition.x + Math.random() * 64,
                        this.catPosition.y + Math.random() * 64
                    );
                }
            }
        }
        
        // メッセージ選択
        const messages = this.battleMessages[battleResult];
        message = messages[Math.floor(Math.random() * messages.length)];
        
        // UI更新
        this.updateResultUI(message, battleResult);
        this.updateUI();
        
        // 敗北時は自動でリトライ画面に移行
        if (battleResult === 'defeat') {
            setTimeout(() => {
                this.autoShowRetryScreen();
            }, 2000); // 2秒後に自動表示
        }
    }
    
    // ゲームオーバー処理
    handleGameOver() {
        this.battlePhase = 'gameOver';
        console.log(`💀 Game Over! Reached level ${this.level}, Score: ${this.score}`);
    }
    
    // レベルアップ
    levelUp() {
        this.level++;
        this.currentRound = 0;
        
        // レベルアップエフェクト
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                this.renderer.addSparkle(
                    Math.random() * 200,
                    Math.random() * 150
                );
            }, i * 30);
        }
        
        this.playSuccessSound();
    }
    
    // 次のラウンド
    nextRound() {
        this.gameState = 'waiting';
        this.catExpression = 'normal';
        this.signalLight = 'red';
        this.reactionTime = 0;
    }
    
    // UI更新
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('best-time').textContent = 
            this.bestTime ? `${this.bestTime}ms` : '---';
    }
    
    // バトル結果UI更新
    updateResultUI(message, battleResult) {
        const resultPanel = document.getElementById('result-panel');
        const reactionTimeElement = document.getElementById('reaction-time');
        const messageElement = document.getElementById('result-message');
        
        if (this.reactionTime === -1) {
            reactionTimeElement.textContent = 'フライング！';
        } else {
            reactionTimeElement.innerHTML = `
                あなた: ${this.reactionTime}ms<br>
                ${this.currentEnemy.name}: ${Math.round(this.enemyReactionTime)}ms
            `;
        }
        
        messageElement.textContent = message;
        
        // 次へボタンの表示制御
        const nextBtn = document.getElementById('next-btn');
        if (battleResult === 'defeat') {
            nextBtn.style.display = 'none';
        } else {
            nextBtn.style.display = 'inline-block';
        }
        
        // パネル表示
        document.getElementById('game-status').classList.add('hidden');
        resultPanel.classList.remove('hidden');
    }
    
    // 結果パネル非表示
    hideResultPanel() {
        document.getElementById('result-panel').classList.add('hidden');
        // スタート画面は表示しない（次のバトルに直接進むため）
        // document.getElementById('game-status').classList.remove('hidden');
    }
    
    // 自動リトライ画面表示
    autoShowRetryScreen() {
        // 結果パネルを隠してスタート画面を表示
        document.getElementById('result-panel').classList.add('hidden');
        document.getElementById('game-status').classList.remove('hidden');
        
        // ゲーム状態をリセット
        this.gameState = 'waiting';
        this.battlePhase = 'ready';
        this.catExpression = 'normal';
        this.signalLight = 'red';
        
        // レベルとスコアをリセット
        this.level = 1;
        this.score = 0;
        this.selectCurrentEnemy();
        this.updateUI();
        
        console.log('🔄 Auto retry screen displayed');
    }
    
    // メインゲームループ
    update() {
        // 背景描画
        this.renderer.drawBackground();
        
        // プレイヤーキャラクター描画
        this.renderer.drawCat(
            this.catPosition.x, 
            this.catPosition.y, 
            this.catExpression
        );
        
        // 敵キャラクター描画
        if (this.currentEnemy) {
            this.renderer.drawEnemy(
                this.enemyPosition.x,
                this.enemyPosition.y,
                this.currentEnemy.type
            );
        }
        
        // VS表示（キャラクター間）
        if (this.battlePhase === 'countdown' || this.battlePhase === 'ready') {
            this.renderer.drawVSText(42, 32);
        }
        
        // 信号機描画（中央下部）
        this.renderer.drawTrafficLight(42, 60, this.signalLight);
        
        // ゲーム状態に応じた描画
        switch (this.gameState) {
            case 'countdown':
                if (this.countdownValue > 0) {
                    this.renderer.drawCountdownNumber(
                        44, 52, this.countdownValue
                    );
                }
                break;
                
            case 'signal':
                this.renderer.drawGoText(42, 52);
                break;
        }
        
        // エフェクト描画
        this.renderer.drawEffects();
        
        // アニメーションフレーム更新
        this.renderer.nextFrame();
    }
    
    // ゲームリセット
    reset() {
        this.startGame();
        document.getElementById('result-panel').classList.add('hidden');
        document.getElementById('game-status').classList.remove('hidden');
    }
}